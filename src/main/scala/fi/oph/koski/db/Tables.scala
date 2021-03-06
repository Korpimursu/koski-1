package fi.oph.koski.db

import java.sql.Timestamp

import fi.oph.koski.db.PostgresDriverWithJsonSupport.api._

import fi.oph.koski.json.Json
import fi.oph.koski.koskiuser.{AccessType, KoskiSession}
import fi.oph.koski.schema._
import org.json4s._

object Tables {
  class OpiskeluoikeusTable(tag: Tag) extends Table[OpiskeluoikeusRow](tag, "opiskeluoikeus") {
    val id: Rep[Int] = column[Int]("id", O.AutoInc, O.PrimaryKey)
    val versionumero = column[Int]("versionumero")
    val oppijaOid = column[String]("oppija_oid")
    val data = column[JValue]("data")
    val oppilaitosOid = column[String]("oppilaitos_oid")
    val koulutustoimijaOid = column[Option[String]]("koulutustoimija_oid")
    val luokka = column[Option[String]]("luokka")

    def * = (id, oppijaOid, oppilaitosOid, koulutustoimijaOid, versionumero, data, luokka) <> (OpiskeluoikeusRow.tupled, OpiskeluoikeusRow.unapply)
    def updateableFields = (data, versionumero, luokka, koulutustoimijaOid)
  }

  object OpiskeluoikeusTable {
    def makeInsertableRow(oppijaOid: String, opiskeluoikeus: Opiskeluoikeus) = {
      OpiskeluoikeusRow(opiskeluoikeus.id.getOrElse(0), oppijaOid, opiskeluoikeus.getOppilaitos.oid, opiskeluoikeus.koulutustoimija.map(_.oid), Opiskeluoikeus.VERSIO_1, Json.toJValue(opiskeluoikeus), opiskeluoikeus.luokka)
    }
    def readData(data: JValue, id: Int, versionumero: Int): KoskeenTallennettavaOpiskeluoikeus = {
      Json.fromJValue[Opiskeluoikeus](data).asInstanceOf[KoskeenTallennettavaOpiskeluoikeus].withIdAndVersion(id = Some(id), versionumero = Some(versionumero))
    }
    def updatedFieldValues(opiskeluoikeus: KoskeenTallennettavaOpiskeluoikeus) = {
      val data = Json.toJValue(opiskeluoikeus.withIdAndVersion(id = None, versionumero = None))
      (data, opiskeluoikeus.versionumero.get, opiskeluoikeus.luokka, opiskeluoikeus.koulutustoimija.map(_.oid))
    }
  }

  class HenkilöTable(tag: Tag) extends Table[HenkilöRow](tag, "henkilo") {
    val oid = column[String]("oid", O.PrimaryKey)
    val sukunimi = column[String]("sukunimi")
    val etunimet = column[String]("etunimet")
    val kutsumanimi = column[String]("kutsumanimi")

    def * = (oid, sukunimi, etunimet, kutsumanimi) <> (HenkilöRow.tupled, HenkilöRow.unapply)
  }

  class OpiskeluoikeusHistoryTable(tag: Tag) extends Table[OpiskeluoikeusHistoryRow] (tag, "opiskeluoikeushistoria") {
    val opiskeluoikeusId = column[Int]("opiskeluoikeus_id")
    val versionumero = column[Int]("versionumero")
    val aikaleima = column[Timestamp]("aikaleima")
    val kayttajaOid = column[String]("kayttaja_oid")
    val muutos = column[JValue]("muutos")

    def * = (opiskeluoikeusId, versionumero, aikaleima, kayttajaOid, muutos) <> (OpiskeluoikeusHistoryRow.tupled, OpiskeluoikeusHistoryRow.unapply)
  }

  class CasServiceTicketSessionTable(tag: Tag) extends Table[SSOSessionRow] (tag, "casserviceticket") {
    val serviceTicket = column[String]("serviceticket")
    val username = column[String]("username")
    val userOid = column[String]("useroid")
    val started = column[Timestamp]("started")
    val updated = column[Timestamp]("updated")

    def * = (serviceTicket, username, userOid, started, updated) <> (SSOSessionRow.tupled, SSOSessionRow.unapply)
  }

  class TiedonsiirtoTable(tag: Tag) extends Table[TiedonsiirtoRow] (tag, "tiedonsiirto") {
    val id = column[Int]("id")
    val kayttajaOid = column[String]("kayttaja_oid")
    val tallentajaOrganisaatioOid = column[String]("tallentaja_organisaatio_oid")
    val oppija = column[Option[JValue]]("oppija")
    val oppilaitos = column[Option[JValue]]("oppilaitos")
    val data = column[Option[JValue]]("data")
    val virheet = column[Option[JValue]]("virheet")
    val aikaleima = column[Timestamp]("aikaleima")
    val lahdejarjestelma = column[Option[String]]("lahdejarjestelma")

    def * = (id, kayttajaOid, tallentajaOrganisaatioOid, oppija, oppilaitos, data, virheet, aikaleima, lahdejarjestelma) <> (TiedonsiirtoRow.tupled, TiedonsiirtoRow.unapply)
  }

  class TiedonsiirtoYhteenvetoTable(tag: Tag) extends Table[TiedonsiirtoYhteenvetoRow] (tag, "tiedonsiirto_yhteenveto") {
    val tallentajaOrganisaatio = column[String]("tallentaja_organisaatio")
    val oppilaitos = column[String]("oppilaitos")
    val kayttaja = column[String]("kayttaja")
    val viimeisin = column[Timestamp]("viimeisin")
    val virheelliset = column[Int]("virheelliset")
    val siirretyt = column[Int]("siirretyt")
    val opiskeluoikeudet = column[Option[Int]]("opiskeluoikeudet")
    val lahdejarjestelma = column[Option[String]]("lahdejarjestelma")

    def * = (tallentajaOrganisaatio, oppilaitos, kayttaja, viimeisin, siirretyt, virheelliset, opiskeluoikeudet, lahdejarjestelma) <> (TiedonsiirtoYhteenvetoRow.tupled, TiedonsiirtoYhteenvetoRow.unapply)
  }

  class SchedulerTable(tag: Tag) extends Table[SchedulerRow](tag, "scheduler") {
    val name = column[String]("name", O.PrimaryKey)
    val nextFireTime = column[Timestamp]("nextfiretime")
    val context = column[Option[JValue]]("context")
    val status = column[Int]("status")

    def * = (name, nextFireTime, context, status) <> (SchedulerRow.tupled, SchedulerRow.unapply)
  }

  class OppilaitosIPOsoiteTable(tag: Tag) extends Table[OppilaitosIPOsoiteRow](tag, "oppilaitos_ip_osoite") {
    val username = column[String]("username", O.PrimaryKey)
    val ip = column[String]("ip")

    def * = (username, ip) <> (OppilaitosIPOsoiteRow.tupled, OppilaitosIPOsoiteRow.unapply)
  }

  val Tiedonsiirto = TableQuery[TiedonsiirtoTable]

  val TiedonsiirtoYhteenveto = TableQuery[TiedonsiirtoYhteenvetoTable]

  val CasServiceTicketSessions = TableQuery[CasServiceTicketSessionTable]

  // OpiskeluOikeudet-taulu. Käytä kyselyissä aina OpiskeluOikeudetWithAccessCheck, niin tulee myös käyttöoikeudet tarkistettua samalla.
  val OpiskeluOikeudet = TableQuery[OpiskeluoikeusTable]

  val Henkilöt = TableQuery[HenkilöTable]
  val Scheduler = TableQuery[SchedulerTable]
  val OppilaitosIPOsoite = TableQuery[OppilaitosIPOsoiteTable]

  val OpiskeluoikeusHistoria = TableQuery[OpiskeluoikeusHistoryTable]

  def OpiskeluOikeudetWithAccessCheck(implicit user: KoskiSession): Query[OpiskeluoikeusTable, OpiskeluoikeusRow, Seq] = {
    if (user.hasGlobalReadAccess) {
      OpiskeluOikeudet
    } else {
      val oids = user.organisationOids(AccessType.read).toList
      for {
        oo <- OpiskeluOikeudet
        if oo.oppilaitosOid inSet oids
      } yield { oo}
    }
  }

  def TiedonsiirtoWithAccessCheck(implicit user: KoskiSession): Query[TiedonsiirtoTable, TiedonsiirtoRow, Seq] = {
    if (user.hasGlobalReadAccess) {
      Tiedonsiirto
    } else {
      val oids = user.organisationOids(AccessType.read).toList
      for {
        t <- Tiedonsiirto
        if t.tallentajaOrganisaatioOid inSet oids
      } yield { t}
    }
  }

  def TiedonsiirtoYhteenvetoWithAccessCheck(implicit user: KoskiSession): Query[TiedonsiirtoYhteenvetoTable, TiedonsiirtoYhteenvetoRow, Seq] = {
    if (user.hasGlobalReadAccess) {
      TiedonsiirtoYhteenveto
    } else {
      val oids = user.organisationOids(AccessType.read).toList
      TiedonsiirtoYhteenveto
        .filter(_.tallentajaOrganisaatio inSet oids)
        .filter(_.oppilaitos inSet oids)
    }
  }

}

case class SSOSessionRow(serviceTicket: String, username: String, userOid: String, started: Timestamp, updated: Timestamp)

// Note: the data json must not contain [id, versionumero] fields. This is enforced by DB constraint.
case class OpiskeluoikeusRow(id: Int, oppijaOid: String, oppilaitosOid: String, koulutustoimijaOid: Option[String], versionumero: Int, data: JValue, luokka: Option[String]) {
  lazy val toOpiskeluoikeus: KoskeenTallennettavaOpiskeluoikeus = {
    try {
      import fi.oph.koski.db.Tables.OpiskeluoikeusTable
      OpiskeluoikeusTable.readData(data, id, versionumero)
    } catch {
      case e: Exception => throw new MappingException(s"Error deserializing opiskeluoikeus ${id} for oppija ${oppijaOid}", e)
    }
  }
}

case class HenkilöRow(oid: String, sukunimi: String, etunimet: String, kutsumanimi: String) {
  def toNimitiedotJaOid = NimitiedotJaOid(oid, etunimet, kutsumanimi, sukunimi)
}

case class OpiskeluoikeusHistoryRow(opiskeluoikeusId: Int, versionumero: Int, aikaleima: Timestamp, kayttajaOid: String, muutos: JValue)

case class TiedonsiirtoRow(id: Int, kayttajaOid: String, tallentajaOrganisaatioOid: String, oppija: Option[JValue], oppilaitos: Option[JValue], data: Option[JValue], virheet: Option[JValue], aikaleima: Timestamp, lahdejarjestelma: Option[String])

case class TiedonsiirtoYhteenvetoRow(tallentajaOrganisaatio: String, oppilaitos: String, kayttaja: String, viimeisin: Timestamp, siirretyt: Int, virheet: Int, opiskeluoikeudet: Option[Int], lahdejarjestelma: Option[String])

case class SchedulerRow(name: String, nextFireTime: Timestamp, context: Option[JValue], status: Int) {
  def running: Boolean = status == 1
}

case class OppilaitosIPOsoiteRow(username: String, ip: String)
