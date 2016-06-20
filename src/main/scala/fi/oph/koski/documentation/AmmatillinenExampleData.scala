package fi.oph.koski.documentation

import java.time.LocalDate
import java.time.LocalDate.{of => date}

import fi.oph.koski.documentation.ExampleData._
import fi.oph.koski.localization.LocalizedStringImplicits._
import fi.oph.koski.oppija.MockOppijat
import fi.oph.koski.schema._

object AmmatillinenExampleData {
  val exampleHenkilö = MockOppijat.ammattilainen.vainHenkilötiedot
  val ammatillinenOpiskeluoikeusAktiivinen = Koodistokoodiviite("aktiivinen", Some("Aktiivinen"), "ammatillinenopiskeluoikeudentila", Some(1))
  val ammatillinenOpiskeluoikeusPäättynyt = Koodistokoodiviite("paattynyt", Some("Päättynyt"), "ammatillinenopiskeluoikeudentila", Some(1))
  val ammatillinenOpiskeluoikeusKeskeyttänyt = Koodistokoodiviite("keskeyttanyt", Some("Keskeyttänyt"), "ammatillinenopiskeluoikeudentila", Some(1))

  def tutkintoSuoritus(tutkintoKoulutus: AmmatillinenTutkintoKoulutus,
    tutkintonimike: Option[List[Koodistokoodiviite]] = None,
    osaamisala: Option[List[Koodistokoodiviite]] = None,
    suoritustapa: Option[AmmatillisenTutkinnonSuoritustapa] = None,
    järjestämismuoto: Option[Järjestämismuoto] = None,
    paikallinenId: Option[String] = None,
    suorituskieli: Option[Koodistokoodiviite] = None,
    tila: Koodistokoodiviite,
    alkamisPäivä: Option[LocalDate] = None,
    toimipiste: OrganisaatioWithOid,
    vahvistus: Option[Henkilövahvistus] = None,
    osasuoritukset: Option[List[AmmatillisenTutkinnonOsanSuoritus]] = None): AmmatillisenTutkinnonSuoritus =

    AmmatillisenTutkinnonSuoritus(
      koulutusmoduuli = tutkintoKoulutus,
      tutkintonimike,
      osaamisala = osaamisala,
      suoritustapa = suoritustapa,
      järjestämismuoto = järjestämismuoto,
      paikallinenId,
      suorituskieli,
      tila = tila,
      alkamispäivä = alkamisPäivä,
      toimipiste = toimipiste,
      vahvistus = vahvistus,
      osasuoritukset = osasuoritukset)

  lazy val autoalanPerustutkinto: AmmatillisenTutkinnonSuoritus = tutkintoSuoritus(
    tutkintoKoulutus = AmmatillinenTutkintoKoulutus(Koodistokoodiviite("351301", Some("Autoalan perustutkinto"), "koulutus"), Some("39/011/2014")),
    tutkintonimike = None,
    osaamisala = None,
    suoritustapa = None,
    järjestämismuoto = None,
    paikallinenId = Some("suoritus-12345"),
    suorituskieli = None,
    tila = tilaKesken,
    alkamisPäivä = Some(date(2016, 9, 1)),
    toimipiste = toimipiste,
    vahvistus = None,
    osasuoritukset = None
  )

  lazy val h2: Koodistokoodiviite = Koodistokoodiviite("2", Some("H2"), "arviointiasteikkoammatillinent1k3", None)
  lazy val k3: Koodistokoodiviite = Koodistokoodiviite("3", Some("K3"), "arviointiasteikkoammatillinent1k3", None)
  lazy val näytönArviointi = NäytönArviointi(List(
    NäytönArviointikohde(Koodistokoodiviite("1", Some("Työprosessin hallinta"), "ammatillisennaytonarviointikohde", None), k3),
    NäytönArviointikohde(Koodistokoodiviite("2", Some("Työmenetelmien, -välineiden ja materiaalin hallinta"), "ammatillisennaytonarviointikohde", None), h2),
    NäytönArviointikohde(Koodistokoodiviite("3", Some("Työn perustana olevan tiedon hallinta"), "ammatillisennaytonarviointikohde", None), h2),
    NäytönArviointikohde(Koodistokoodiviite("4", Some("Elinikäisen oppimisen avaintaidot"), "ammatillisennaytonarviointikohde", None), k3)),
    Koodistokoodiviite("1", Some("Opettaja"), "ammatillisennaytonarvioinnistapaattaneet", None),
    Koodistokoodiviite("1", Some("Opiskelija ja opettaja"), "ammatillisennaytonarviointikeskusteluunosallistuneet", None)
  )

  def näyttö(kuvaus: String, paikka: String, arviointi: Option[NäytönArviointi] = None) = Näyttö(
    kuvaus,
    NäytönSuorituspaikka(Koodistokoodiviite("1", Some("työpaikka"), "ammatillisennaytonsuorituspaikka", Some(1)), paikka),
    arviointi,
    työssäoppimisenYhteydessä = false
  )

  lazy val tavoiteTutkinto = Koodistokoodiviite("ammatillinentutkinto", "suorituksentyyppi")
  lazy val suoritustapaNäyttö = AmmatillisenTutkinnonSuoritustapa(Koodistokoodiviite("naytto", Some("Näyttö"), None, "ammatillisentutkinnonsuoritustapa", Some(1)))
  lazy val suoritustapaOps = AmmatillisenTutkinnonSuoritustapa(Koodistokoodiviite("ops", Some("Opetussuunnitelman mukainen"), "ammatillisentutkinnonsuoritustapa", Some(1)))
  lazy val järjestämismuotoOppisopimus = Koodistokoodiviite("20", Some("Oppisopimusmuotoinen"), "jarjestamismuoto", Some(1))
  lazy val järjestämismuotoOppilaitos = Koodistokoodiviite("10", Some("Oppilaitosmuotoinen"), "jarjestamismuoto", Some(1))
  lazy val stadinAmmattiopisto: Oppilaitos = Oppilaitos("1.2.246.562.10.52251087186", Some(Koodistokoodiviite("10105", None, "oppilaitosnumero", None)), Some("Stadin ammattiopisto"))
  lazy val toimipiste: OidOrganisaatio = OidOrganisaatio("1.2.246.562.10.42456023292", Some("Stadin ammattiopisto, Lehtikuusentien toimipaikka"))
  lazy val tutkintotoimikunta: Organisaatio = Tutkintotoimikunta("Autokorjaamoalan tutkintotoimikunta", 8406)
  lazy val lähdeWinnova = Koodistokoodiviite("winnova", Some("Winnova"), "lahdejarjestelma", Some(1))
  lazy val hyväksiluku = Hyväksiluku(
    OpsTutkinnonosa(Koodistokoodiviite("100238", Some("Asennushitsaus"), "tutkinnonosat", Some(1)), true, None),
    Some("Tutkinnon osa on tunnustettu Kone- ja metallialan perustutkinnosta"))
  lazy val hyväksytty: Koodistokoodiviite = Koodistokoodiviite("Hyväksytty", Some("Hyväksytty"), "arviointiasteikkoammatillinenhyvaksyttyhylatty", Some(1))
  lazy val arviointiHyväksytty: Some[List[AmmatillinenArviointi]] = Some(List(AmmatillinenArviointi(
    arvosana = hyväksytty, date(2013, 3, 20),
    arvioitsijat = Some(List(Arvioitsija("Jaana Arstila"), Arvioitsija("Pekka Saurmann"), Arvioitsija("Juhani Mykkänen"))))))

  def vahvistus(date: LocalDate) = Some(Henkilövahvistus(date, helsinki, stadinAmmattiopisto, List(OrganisaatioHenkilö("Keijo Perttilä", "rehtori", stadinAmmattiopisto))))
  lazy val paikallisenOsanSuoritus = AmmatillisenTutkinnonOsanSuoritus(
    koulutusmoduuli = PaikallinenTutkinnonosa(PaikallinenKoodi("123456789", "Pintavauriotyöt", "kallion_oma_koodisto"), "Opetellaan korjaamaan pinnallisia vaurioita", false, None),
    hyväksiluku = None,
    näyttö = Some(näyttö("Pintavaurioiden korjausta", "Autokorjaamo Oy, Riihimäki")),
    lisätiedot = None,
    paikallinenId = Some("suoritus-12345-2"),
    suorituskieli = None,
    tila = tilaValmis,
    alkamispäivä = None,
    toimipiste = Some(toimipiste),
    arviointi = arviointiHyväksytty,
    vahvistus = vahvistus(date(2013, 5, 31))
  )

  lazy val arviointiKiitettävä = Some(
    List(
      AmmatillinenArviointi(
        arvosana = k3,
        date(2014, 10, 20)
      )
    )
  )

  def opiskeluoikeus(oppilaitos: Oppilaitos = Oppilaitos("1.2.246.562.10.52251087186"),
    tutkinto: AmmatillisenTutkinnonSuoritus = autoalanPerustutkinto,
    osat: Option[List[AmmatillisenTutkinnonOsanSuoritus]] = None) = {
    AmmatillinenOpiskeluoikeus(
      alkamispäivä = Some(date(2016, 9, 1)),
      arvioituPäättymispäivä = Some(date(2020, 5, 1)),
      tila = None,
      oppilaitos = oppilaitos,
      suoritukset = List(tutkinto.copy(osasuoritukset = osat)),
      tavoite = tavoiteTutkinto
    )
  }

  def oppija( henkilö: Henkilö = exampleHenkilö,
    opiskeluOikeus: Opiskeluoikeus = opiskeluoikeus()) = {
    Oppija(
      henkilö,
      List(opiskeluOikeus)
    )
  }

  def tutkinnonOsanSuoritus(koodi: String, nimi: String, arvosana: Koodistokoodiviite, laajuus: Float): AmmatillisenTutkinnonOsanSuoritus = {
    tutkinnonOsanSuoritus(koodi, nimi, arvosana, Some(laajuus))
  }

  def tutkinnonOsanSuoritus(koodi: String, nimi: String, arvosana: Koodistokoodiviite, laajuus: Option[Float] = None): AmmatillisenTutkinnonOsanSuoritus = {
    val osa: OpsTutkinnonosa = OpsTutkinnonosa(Koodistokoodiviite(koodi, Some(nimi), "tutkinnonosat", Some(1)), true, laajuus.map(l =>LaajuusOsaamispisteissä(l)))
    tutkonnonOsanSuoritus(arvosana, osa)
  }

  def paikallisenTutkinnonOsanSuoritus(koodi: String, nimi: String, arvosana: Koodistokoodiviite, laajuus: Float): AmmatillisenTutkinnonOsanSuoritus = {
    val osa: PaikallinenTutkinnonosa = PaikallinenTutkinnonosa(PaikallinenKoodi(koodi, nimi, "paikallinen"), nimi, false, Some(LaajuusOsaamispisteissä(laajuus)))
    tutkonnonOsanSuoritus(arvosana, osa)
  }

  def tutkonnonOsanSuoritus(arvosana: Koodistokoodiviite, osa: AmmatillisenTutkinnonOsa): AmmatillisenTutkinnonOsanSuoritus = {
    AmmatillisenTutkinnonOsanSuoritus(
      koulutusmoduuli = osa,
      näyttö = None, paikallinenId = None, suorituskieli = None,
      tila = tilaValmis,
      alkamispäivä = None,
      toimipiste = Some(toimipiste),
      arviointi = Some(List(AmmatillinenArviointi(arvosana = arvosana, date(2014, 10, 20)))),
      vahvistus = vahvistus(date(2016, 5, 31))
    )
  }
}