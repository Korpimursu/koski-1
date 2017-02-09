package fi.oph.koski.editor

import java.time.LocalDate

import fi.oph.koski.config.KoskiApplication
import fi.oph.koski.henkilo.HenkilöOid
import fi.oph.koski.http.HttpStatus
import fi.oph.koski.koskiuser.{AccessType, KoskiSession, RequiresAuthentication}
import fi.oph.koski.schema._
import fi.oph.koski.servlet.{ApiServlet, NoCache}
import fi.oph.koski.validation.ValidationAndResolvingContext
import fi.oph.scalaschema.ClassSchema

class EditorServlet(val application: KoskiApplication) extends ApiServlet with RequiresAuthentication with NoCache {
  get("/:oid") {
    renderEither((getOptionalIntegerParam("opiskeluoikeus"), getOptionalIntegerParam("versionumero")) match {
      case (Some(opiskeluoikeusId), Some(versionumero)) =>
        findVersion(params("oid"), opiskeluoikeusId, versionumero, koskiSession)
      case _ =>
        findByOid(params("oid"), koskiSession)
    })
  }

  get("/omattiedot") {
    renderEither(findByUserOppija(koskiSession))
  }

  get("/koodit/:koodistoUri") {
    getKoodit()
  }

  get("/koodit/:koodistoUri/:koodiarvot") {
    val koodiarvot = params("koodiarvot").split(",").toSet
    getKoodit().filter(v => koodiarvot.contains(v.value))
  }

  get("/organisaatiot") {
    def organisaatiot = koskiSession.organisationOids(AccessType.write).flatMap(context.organisaatioRepository.getOrganisaatio).toList
    organisaatiot.map(modelBuilder.organisaatioEnumValue(_))
  }

  get("/oppilaitokset") {
    def organisaatiot = koskiSession.organisationOids(AccessType.write).flatMap(context.organisaatioRepository.getOrganisaatio).toList
    organisaatiot.flatMap(_.toOppilaitos).map(modelBuilder.organisaatioEnumValue(_))
  }

  private def getKoodit() = {
    val koodistoUri = params("koodistoUri")
    val koodit: List[Koodistokoodiviite] = context.koodistoPalvelu.getLatestVersion(koodistoUri).toList.flatMap(application.koodistoViitePalvelu.getKoodistoKoodiViitteet(_)).flatten

    koodit.map(modelBuilder.koodistoEnumValue(_)).sortBy(_.title)
  }

  private val context: ValidationAndResolvingContext = ValidationAndResolvingContext(application.koodistoViitePalvelu, application.organisaatioRepository)
  private def modelBuilder = new EditorModelBuilder(context, EditorSchema.schema)(koskiSession)

  private def findByOid(oid: String, user: KoskiSession): Either[HttpStatus, EditorModel] = {
    HenkilöOid.validateHenkilöOid(oid).right.flatMap { oid =>
      toEditorModel(application.oppijaFacade.findOppija(oid)(user))
    }
  }

  private def findVersion(oid: String, opiskeluoikeusId: Int, versionumero: Int, user: KoskiSession): Either[HttpStatus, EditorModel] = {
    HenkilöOid.validateHenkilöOid(oid).right.flatMap { oid =>
      toEditorModel(application.oppijaFacade.findVersion(oid, opiskeluoikeusId, versionumero)(user))
    }
  }

  private def findByUserOppija(user: KoskiSession): Either[HttpStatus, EditorModel] = {
    toEditorModel(application.oppijaFacade.findUserOppija(user))
  }

  private def toEditorModel(oppija: Either[HttpStatus, Oppija]): Either[HttpStatus, EditorModel] = {
    implicit val opiskeluoikeusOrdering = new Ordering[Option[LocalDate]] {
      override def compare(x: Option[LocalDate], y: Option[LocalDate]) = (x, y) match {
        case (None, Some(_)) => 1
        case (Some(_), None) => -1
        case (None, None) => 0
        case (Some(x), Some(y)) => if (x.isBefore(y)) { -1 } else { 1 }
      }
    }

    oppija.right.map{oppija =>
      val tyypit = oppija.opiskeluoikeudet.groupBy(_.tyyppi).map {
        case (tyyppi, opiskeluoikeudet) =>
          val oppilaitokset = opiskeluoikeudet.groupBy(_.getOppilaitos).map {
            case (oppilaitos, opiskeluoikeudet) =>
              OppilaitoksenOpiskeluoikeudet(oppilaitos, opiskeluoikeudet.toList.sortBy(_.alkamispäivä).map {
                case oo: PerusopetuksenOpiskeluoikeus => oo.copy(suoritukset = oo.suoritukset.sortBy(_.alkamispäivä).reverse)
                case oo: AmmatillinenOpiskeluoikeus => oo.copy(suoritukset = oo.suoritukset.sortBy(_.alkamispäivä).reverse)
                case oo: Any => oo
              })
          }.toList.sortBy(_.opiskeluoikeudet(0).alkamispäivä)
          OpiskeluoikeudetTyypeittäin(tyyppi, oppilaitokset)
      }.toList.sortBy(_.opiskeluoikeudet(0).opiskeluoikeudet(0).alkamispäivä).reverse
      val editorView = OppijaEditorView(oppija.henkilö.asInstanceOf[TäydellisetHenkilötiedot], tyypit)
      modelBuilder.buildModel(EditorSchema.schema, editorView)
    }
  }
}

object EditorSchema {
  lazy val schema = KoskiSchema.schemaFactory.createSchema(classOf[OppijaEditorView].getName).asInstanceOf[ClassSchema].moveDefinitionsToTopLevel
}

case class OppijaEditorView(
  @Hidden
  henkilö: TäydellisetHenkilötiedot,
  opiskeluoikeudet: List[OpiskeluoikeudetTyypeittäin]
)

case class OpiskeluoikeudetTyypeittäin(@KoodistoUri("opiskeluoikeudentyyppi") tyyppi: Koodistokoodiviite, opiskeluoikeudet: List[OppilaitoksenOpiskeluoikeudet])
case class OppilaitoksenOpiskeluoikeudet(oppilaitos: Oppilaitos, opiskeluoikeudet: List[Opiskeluoikeus])

