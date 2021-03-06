package fi.oph.koski.log

import fi.oph.koski.KoskiApplicationForTests
import fi.oph.koski.koskiuser.MockUsers
import org.mockito.ArgumentCaptor
import org.mockito.Mockito._
import org.scalatest.{Assertions, FreeSpec, Matchers}
import org.slf4j.Logger

import scala.util.matching.Regex

class AuditLogSpec extends FreeSpec with Assertions with Matchers {
  val loggerMock = mock(classOf[Logger])
  val audit = new AuditLog(loggerMock)
  lazy val käyttöoikeuspalvelu = KoskiApplicationForTests.käyttöoikeusRepository

  "AuditLog" - {
    "Logs in JSON format" in {
      verifyLogMessage(AuditLogMessage(
        KoskiOperation.OPISKELUOIKEUS_LISAYS, MockUsers.omniaPalvelukäyttäjä.toKoskiUser(käyttöoikeuspalvelu), Map(KoskiMessageField.oppijaHenkiloOid ->  "1.2.246.562.24.00000000001")),
        """\{"timestamp":".*","serviceName":"koski","applicationType":"backend","kayttajaHenkiloNimi":"omnia-palvelukäyttäjä käyttäjä","oppijaHenkiloOid":"1.2.246.562.24.00000000001","clientIp":"192.168.0.10","kayttajaHenkiloOid":"1.2.246.562.24.99999999989","operaatio":"OPISKELUOIKEUS_LISAYS"}""".r)
    }
  }

  private def verifyLogMessage(msg: AuditLogMessage, expectedMessage: Regex) {
    audit.log(msg)
    val infoCapture: ArgumentCaptor[String] = ArgumentCaptor.forClass(classOf[String])
    verify(loggerMock, times(1)).info(infoCapture.capture)
    val logMessage: String = infoCapture.getValue
    logMessage should fullyMatch regex(expectedMessage)
  }
}
