package fi.oph.koski.fixture

import java.time.LocalDate.{of => date}

import fi.oph.koski.db.Tables._
import fi.oph.koski.db._
import fi.oph.koski.documentation._
import fi.oph.koski.json.Json
import fi.oph.koski.koskiuser.{AccessType, KoskiSession}
import fi.oph.koski.opiskeluoikeus.{OpiskeluoikeudenPerustiedot, OpiskeluoikeudenPerustiedotRepository, OpiskeluoikeusRepository}
import fi.oph.koski.henkilo.HenkilöRepository
import fi.oph.koski.organisaatio.{MockOrganisaatiot, OrganisaatioRepository}
import fi.oph.koski.schema.Henkilö.Oid
import fi.oph.koski.schema._
import fi.oph.koski.util.Timing
import slick.dbio.DBIO
import fi.oph.koski.db.PostgresDriverWithJsonSupport.api._
import fi.oph.koski.henkilo.{MockOppijat, VerifiedHenkilöOid}
import fi.oph.koski.validation.KoskiValidator

class KoskiDatabaseFixtureCreator(database: KoskiDatabase, repository: OpiskeluoikeusRepository, henkilöRepository: HenkilöRepository, perustiedot: OpiskeluoikeudenPerustiedotRepository, validator: KoskiValidator) extends KoskiDatabaseMethods with Timing {
  implicit val user = KoskiSession.systemUser
  val db = database.db
  implicit val accessType = AccessType.write

  def resetFixtures: Unit = {
    if (database.config.isRemote) throw new IllegalStateException("Trying to reset fixtures in remote database")

    val deleteOpiskeluOikeudet = MockOppijat.defaultOppijat.map{oppija => OpiskeluOikeudetWithAccessCheck.filter(_.oppijaOid === oppija.oid).delete}
    val deleteTiedonsiirrot = TiedonsiirtoWithAccessCheck.filter(t => t.tallentajaOrganisaatioOid === MockOrganisaatiot.stadinAmmattiopisto || t.tallentajaOrganisaatioOid === MockOrganisaatiot.helsinginKaupunki).delete

    runDbSync(DBIO.sequence(deleteOpiskeluOikeudet))

    perustiedot.deleteByOppijaOids(MockOppijat.defaultOppijat.map(_.oid))

    val henkilöOids: List[Oid] = MockOppijat.defaultOppijat.map(_.oid)
    runDbSync(Tables.Henkilöt.filter(_.oid inSetBind henkilöOids).delete)
    runDbSync(DBIO.sequence(henkilöOids.flatMap(henkilöRepository.findByOid).map{ henkilö => Henkilöt += HenkilöRow(henkilö.oid, henkilö.sukunimi, henkilö.etunimet, henkilö.kutsumanimi) }))

    runDbSync(deleteTiedonsiirrot)

    validatedOpiskeluoikeudet.foreach { case (henkilö, opiskeluoikeus) =>
      val id = repository.createOrUpdate(VerifiedHenkilöOid(henkilö), opiskeluoikeus).right.get.id
      perustiedot.update(OpiskeluoikeudenPerustiedot.makePerustiedot(id, opiskeluoikeus, henkilö.nimitiedotJaOid))
    }
  }

  // cached for performance boost
  private lazy val validatedOpiskeluoikeudet: List[(TäydellisetHenkilötiedot, KoskeenTallennettavaOpiskeluoikeus)] = defaultOpiskeluOikeudet.map { case (henkilö, oikeus) =>
    validator.validateAsJson(Oppija(henkilö, List(oikeus))) match {
      case Right(oppija) => (henkilö, oppija.tallennettavatOpiskeluoikeudet(0))
      case Left(status) => throw new RuntimeException("Fixture insert failed for " + henkilö.oid +  " with data " + Json.write(oikeus) + ": " + status)
    }
  }

  private def defaultOpiskeluOikeudet: List[(TäydellisetHenkilötiedot, KoskeenTallennettavaOpiskeluoikeus)] = {
    List((MockOppijat.eero, OpiskeluoikeusTestData.opiskeluoikeus(MockOrganisaatiot.stadinAmmattiopisto)),
      (MockOppijat.eerola, OpiskeluoikeusTestData.opiskeluoikeus(MockOrganisaatiot.stadinAmmattiopisto)),
      (MockOppijat.teija, OpiskeluoikeusTestData.opiskeluoikeus(MockOrganisaatiot.stadinAmmattiopisto)),
      (MockOppijat.markkanen, OpiskeluoikeusTestData.opiskeluoikeus(MockOrganisaatiot.omnia)),
      (MockOppijat.eskari, ExamplesEsiopetus.esioppilas.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.ysiluokkalainen, ExamplesPerusopetus.ysinOpiskeluoikeusKesken),
      (MockOppijat.koululainen, PerusopetusExampleData.päättötodistusOpiskeluoikeus()),
      (MockOppijat.koululainen, ExamplesPerusopetukseenValmistavaOpetus.opiskeluoikeus),
      (MockOppijat.toimintaAlueittainOpiskelija, ExamplesPerusopetus.toimintaAlueittainOpiskelija.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.oppiaineenKorottaja, ExamplesPerusopetus.aineopiskelija.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.kymppiluokkalainen, ExamplesPerusopetuksenLisaopetus.lisäopetuksenPäättötodistus.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.lukiolainen, PerusopetusExampleData.päättötodistusOpiskeluoikeus(luokka = "B")),
      (MockOppijat.lukiolainen, ExamplesLukio.päättötodistus()),
      (MockOppijat.lukionAineopiskelija, ExamplesLukio.aineopiskelija),
      (MockOppijat.luva, ExamplesLukioonValmistavaKoulutus.luvaTodistus.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.ammattilainen, AmmatillinenExampleData.perustutkintoOpiskeluoikeusValmis()),
      (MockOppijat.amis, AmmatillinenExampleData.perustutkintoOpiskeluoikeusKesken()),
      (MockOppijat.valma, ExamplesValma.valmaTodistus.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.telma, ExamplesTelma.telmaTodistus.tallennettavatOpiskeluoikeudet.head),
      (MockOppijat.erikoisammattitutkinto, AmmattitutkintoExample.opiskeluoikeus),
      (MockOppijat.osittainenammattitutkinto, AmmatillinenPerustutkintoExample.osittainenPerustutkintoOpiskeluoikeus),
      (MockOppijat.paikallinenTunnustettu, AmmatillinenPerustutkintoExample.tunnustettuPaikallinenTutkinnonOsaOpiskeluoikeus),
      (MockOppijat.omattiedot, PerusopetusExampleData.päättötodistusOpiskeluoikeus(luokka = "D")),
      (MockOppijat.omattiedot, ExamplesLukio.päättötodistus()),
      (MockOppijat.ibFinal, ExamplesIB.opiskeluoikeus),
      (MockOppijat.ibPredicted, ExamplesIB.opiskeluoikeusPredictedGrades)
    )
  }
}

object OpiskeluoikeusTestData {
  def opiskeluoikeus(oppilaitosId: String, koulutusKoodi: Int = 351301): AmmatillinenOpiskeluoikeus = {
    val oppilaitos: Oppilaitos = Oppilaitos(oppilaitosId, None, None)
    val koulutusKoodiViite = Koodistokoodiviite(koulutusKoodi.toString, None, "koulutus", None)

    AmmatillinenOpiskeluoikeus(
      oppilaitos = Some(oppilaitos),
      suoritukset = List(AmmatillisenTutkinnonSuoritus(
        koulutusmoduuli = AmmatillinenTutkintoKoulutus(koulutusKoodiViite, Some("39/011/2014")),
        tila = Koodistokoodiviite("KESKEN", "suorituksentila"),
        toimipiste = oppilaitos
      )),
      alkamispäivä = Some(date(2000, 1, 1)),
      tila = AmmatillinenOpiskeluoikeudenTila(List(AmmatillinenOpiskeluoikeusjakso(date(2000, 1, 1), ExampleData.opiskeluoikeusLäsnä, None)))
    )
  }
}