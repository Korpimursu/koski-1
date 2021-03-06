package fi.oph.koski.todistus

import fi.oph.koski.koskiuser.KoskiSession
import fi.oph.koski.schema._

import scala.xml.{Elem, NodeSeq}

class TelmaTodistusHtml(val koulutustoimija: Option[OrganisaatioWithOid], val oppilaitos: Oppilaitos, val oppijaHenkilö: Henkilötiedot, val todistus: ValmentavaSuoritus)(implicit val user: KoskiSession) extends ValmentavanKoulutuksenTodistusHtml {
  def title = "Työhön ja itsenäiseen elämään valmentava koulutus"
  override def styles: NodeSeq = <link rel="stylesheet" type="text/css" href="/koski/css/todistus-telma.css"></link>

  override def tutkinnonOtsikkoRivi: Elem = <tr>
    <th class="oppiaine">Koulutuksen osat</th>
    <th class="laajuus">Suoritettu laajuus, osp</th>
    <th class="arvosana">Arvosana</th>
  </tr>

  override def tutkinnonOsaRivit(suoritukset: List[ValmentavanKoulutuksenOsanSuoritus]): List[Elem] = suoritukset.map { oppiaine =>
    val arvosana = oppiaine.sanallinenArviointi.map(i(_).capitalize).getOrElse(i(oppiaine.arvosanaKirjaimin).capitalize + " " + i(oppiaine.arvosanaNumeroin))
    <tr class="tutkinnon-osa">
      <td class="nimi">{nimiTeksti(oppiaine)}</td>
      <td class="laajuus">{decimalFormat.format(laajuus(oppiaine))}</td>
      <td class="arvosana">{arvosana}</td>
    </tr>
  }
}
