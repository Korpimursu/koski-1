package fi.oph.koski.henkilo

import fi.oph.koski.henkilo.AuthenticationServiceClient.{OppijaHenkilö, QueryHenkilö}
import fi.oph.koski.http.HttpStatus
import fi.oph.koski.koodisto.{KoodistoViitePalvelu, MockKoodistoViitePalvelu}
import fi.oph.koski.koskiuser.KoskiSession
import fi.oph.koski.schema._

class OpintopolkuHenkilöRepository(henkilöPalveluClient: AuthenticationServiceClient, koodisto: KoodistoViitePalvelu) extends HenkilöRepository {
  override def findOppijat(query: String)(implicit user: KoskiSession): List[HenkilötiedotJaOid] = {
    if (Henkilö.isHenkilöOid(query)) {
      findByOid(query).map(_.toHenkilötiedotJaOid).toList
    } else {
      henkilöPalveluClient.search(query).results.flatMap(toHenkilötiedot)
    }
  }

  override def findOrCreate(henkilö: UusiHenkilö): Either[HttpStatus, Henkilö.Oid] =  {
    henkilöPalveluClient.findOrCreate(AuthenticationServiceClient.UusiHenkilö.oppija(henkilö.hetu, henkilö.sukunimi, henkilö.etunimet, henkilö.kutsumanimi)).right.map(_.oidHenkilo)
  }

  override def findByOid(oid: String): Option[TäydellisetHenkilötiedot] = henkilöPalveluClient.findOppijaByOid(oid).flatMap(toTäydellisetHenkilötiedot)

  override def findByOids(oids: List[String]): List[TäydellisetHenkilötiedot] = henkilöPalveluClient.findOppijatByOids(oids).flatMap(toTäydellisetHenkilötiedot)

  private def toTäydellisetHenkilötiedot(user: OppijaHenkilö) = user.hetu.map(hetu => TäydellisetHenkilötiedot(user.oidHenkilo, hetu, user.etunimet, user.kutsumanimi, user.sukunimi, convertÄidinkieli(user.aidinkieli), convertKansalaisuus(user.kansalaisuus)))

  private def toHenkilötiedot(user: QueryHenkilö) =  user.hetu.map(hetu => HenkilötiedotJaOid(user.oidHenkilo, hetu, user.etunimet, user.kutsumanimi, user.sukunimi))

  private def convertÄidinkieli(äidinkieli: Option[String]) = äidinkieli.flatMap(äidinkieli => koodisto.getKoodistoKoodiViite("kieli", äidinkieli.toUpperCase))

  private def convertKansalaisuus(kansalaisuus: Option[List[String]]) = {
    kansalaisuus.flatMap(_.flatMap(kansalaisuus => koodisto.getKoodistoKoodiViite("maatjavaltiot2", kansalaisuus)) match {
      case Nil => None
      case xs: List[Koodistokoodiviite] => Some(xs)
    })
  }
}

object MockOpintopolkuHenkilöRepository extends OpintopolkuHenkilöRepository(new MockAuthenticationServiceClient(), MockKoodistoViitePalvelu)