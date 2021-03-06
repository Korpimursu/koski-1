package fi.oph.koski.henkilo

import fi.oph.koski.koskiuser.KoskiSession
import fi.oph.koski.log.KoskiMessageField.{apply => _, _}
import fi.oph.koski.log.KoskiOperation._
import fi.oph.koski.log.{AuditLog, AuditLogMessage}
import fi.oph.koski.opiskeluoikeus.OpiskeluoikeusRepository
import fi.oph.koski.schema.HenkilötiedotJaOid

case class HenkilötiedotFacade(henkilöRepository: HenkilöRepository, OpiskeluoikeusRepository: OpiskeluoikeusRepository) {
  def findHenkilötiedot(queryString: String)(implicit user: KoskiSession): Seq[HenkilötiedotJaOid] = {
    // TODO: ei löydä nimihaulla henkilöitä, joilla on opiskeluoikeuksia vain Koskessa (vs. Virta, YTR)
    val oppijat: List[HenkilötiedotJaOid] = henkilöRepository.findOppijat(queryString)
    AuditLog.log(AuditLogMessage(OPPIJA_HAKU, user, Map(hakuEhto -> queryString)))
    val filtered = OpiskeluoikeusRepository.filterOppijat(oppijat)
    filtered.sortBy(oppija => (oppija.sukunimi, oppija.etunimet))
  }
}
