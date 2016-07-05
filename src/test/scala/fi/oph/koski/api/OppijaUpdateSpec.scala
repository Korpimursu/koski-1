package fi.oph.koski.api

import java.time.LocalDate

import fi.oph.koski.json.Json
import fi.oph.koski.localization.LocalizedString
import fi.oph.koski.oppija.MockOppijat
import fi.oph.koski.organisaatio.MockOrganisaatiot
import fi.oph.koski.schema._
import fi.oph.koski.koski.HenkilönOpiskeluoikeusVersiot
import org.scalatest.FreeSpec
import java.time.LocalDate.{of => date}

import fi.oph.koski.http.KoskiErrorCategory

class OppijaUpdateSpec extends FreeSpec with LocalJettyHttpSpecification with OpiskeluoikeusTestMethodsAmmatillinen {
  val uusiOpiskeluOikeus = defaultOpiskeluoikeus
  val oppija: TäydellisetHenkilötiedot = MockOppijat.tyhjä

  "Opiskeluoikeuden lisääminen" - {
    "Palauttaa oidin ja versiot" in {
      resetFixtures
      putOppija(Oppija(oppija, List(uusiOpiskeluOikeus))) {
        response.status should equal(200)
        val result = Json.read[HenkilönOpiskeluoikeusVersiot](response.body)
        result.henkilö.oid should equal(oppija.oid)
        result.opiskeluoikeudet.map(_.versionumero) should equal(List(1))
      }
    }
    "Puuttuvien tietojen täyttäminen" - {
      "Oppilaitoksen tiedot" - {
        "Ilman nimeä -> haetaan nimi" in {
          val opiskeluOikeus = createOpiskeluOikeus(oppija, uusiOpiskeluOikeus)
          opiskeluOikeus.oppilaitos.nimi.get.get("fi") should equal("Stadin ammattiopisto")
          opiskeluOikeus.oppilaitos.oppilaitosnumero.get.koodiarvo should equal("10105")
        }
        "Väärällä nimellä -> korvataan nimi" in {
          val opiskeluOikeus = createOpiskeluOikeus(oppija, uusiOpiskeluOikeus.copy(oppilaitos = Oppilaitos(MockOrganisaatiot.stadinAmmattiopisto, nimi = Some(LocalizedString.finnish("Läppäkoulu")))))
          opiskeluOikeus.oppilaitos.nimi.get.get("fi") should equal("Stadin ammattiopisto")
        }
      }
      "Koodistojen tiedot" - {
        "Ilman nimeä -> haetaan nimi" in {
          val opiskeluOikeus = createOpiskeluOikeus(oppija, uusiOpiskeluOikeus)
          val suoritus = opiskeluOikeus.suoritukset(0).asInstanceOf[AmmatillisenTutkinnonSuoritus]
          suoritus.koulutusmoduuli.tunniste.nimi.get.get("fi") should equal("Autoalan perustutkinto")
          suoritus.koulutusmoduuli.tunniste.nimi.get.get("sv") should equal("Grundexamen inom bilbranschen")
        }
        "Väärällä nimellä -> korvataan nimi" in {
          val opiskeluOikeus = createOpiskeluOikeus(oppija, uusiOpiskeluOikeus.copy(suoritukset = List(tutkintoSuoritus.copy(koulutusmoduuli = tutkintoSuoritus.koulutusmoduuli.copy(tunniste = Koodistokoodiviite(koodiarvo = "351301", nimi=Some(LocalizedString.finnish("Läppätutkinto")), koodistoUri = "koulutus"))))))

          opiskeluOikeus.suoritukset(0).asInstanceOf[AmmatillisenTutkinnonSuoritus].koulutusmoduuli.tunniste.nimi.get.get("fi") should equal("Autoalan perustutkinto")
        }
      }

      "Koulutustoimijan tiedot" in {
        val opiskeluOikeus = createOpiskeluOikeus(oppija, uusiOpiskeluOikeus)
        opiskeluOikeus.koulutustoimija.map(_.oid) should equal(Some("1.2.246.562.10.346830761110"))
      }
    }
  }

  "Opiskeluoikeuden muokkaaminen" - {
    "Muokkaa olemassaolevaa opiskeluoikeutta" in {
      val d: LocalDate = date(2020, 1, 1)
      verifyChange(existing => existing.copy(arvioituPäättymispäivä = Some(d))) {
        response.status should equal(200)
        lastOpiskeluOikeus(oppija.oid).arvioituPäättymispäivä should equal(Some(d))
      }
    }

    "Estää oppilaitoksen vaihtamisen" in {
      verifyChange(existing => existing.copy(oppilaitos = Oppilaitos(MockOrganisaatiot.omnomnia))) {
        verifyResponseStatus(403, KoskiErrorCategory.forbidden.kiellettyMuutos("Opiskeluoikeuden oppilaitosta ei voi vaihtaa. Vanha oid 1.2.246.562.10.52251087186. Uusi oid 1.2.246.562.10.51720121923."))
      }
    }

    "Estää tyypin vaihtamisen" in {
      verifyChange(existing => OpiskeluoikeusTestMethodsLukio.lukionOpiskeluoikeus.copy(id = existing.id, oppilaitos = existing.oppilaitos)) {
        verifyResponseStatus(403, KoskiErrorCategory.forbidden.kiellettyMuutos("Opiskeluoikeuden tyyppiä ei voi vaihtaa. Vanha tyyppi ammatillinenkoulutus. Uusi tyyppi lukiokoulutus."))
      }
    }

    def verifyChange(change: AmmatillinenOpiskeluoikeus => KoskeenTallennettavaOpiskeluoikeus)(block: => Unit) = {
      putOppija(Oppija(oppija, List(uusiOpiskeluOikeus))) {
        response.status should equal(200)
        val existing = lastOpiskeluOikeus(oppija.oid).asInstanceOf[AmmatillinenOpiskeluoikeus]
        putOppija(Oppija(oppija, List(change(existing)))) {
          block
        }
      }
    }
  }
}
