package fi.oph.koski.eperusteet

import com.typesafe.config.Config

trait EPerusteetRepository {
  def findPerusteet(query: String): List[EPeruste]

  def findPerusteetByDiaarinumero(diaarinumero: String): List[EPeruste]

  def findRakenne(diaariNumero: String): Option[EPerusteRakenne]
}

object EPerusteetRepository {
  def apply(config: Config) = {
    config.getString("eperusteet.url") match {
      case "mock" =>
        MockEPerusteetRepository
      case url =>
        new RemoteEPerusteetRepository(url)
    }
  }
}