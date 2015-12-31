package fi.oph.tor.tor

import java.time.LocalDate
import java.time.format.DateTimeParseException

import fi.oph.tor.db.GlobalExecutionContext
import fi.oph.tor.henkilo.HenkiloOid
import fi.oph.tor.http.HttpStatus
import fi.oph.tor.json.{Json, JsonStreamWriter}
import fi.oph.tor.schema.Henkilö.Oid
import fi.oph.tor.schema.{HenkilöWithOid, FullHenkilö, Henkilö, TorOppija}
import fi.oph.tor.toruser.{RequiresAuthentication, UserOrganisationsRepository}
import fi.oph.tor.{ErrorHandlingServlet, InvalidRequestException}
import fi.vm.sade.security.ldap.DirectoryClient
import fi.vm.sade.utils.slf4j.Logging
import org.scalatra.{FutureSupport, GZipSupport}
import rx.lang.scala.Observable
import scala.concurrent.Future
import scala.concurrent.duration.Duration

class TorServlet(rekisteri: TodennetunOsaamisenRekisteri, val userRepository: UserOrganisationsRepository, val directoryClient: DirectoryClient, val validator: TorValidator)
  extends ErrorHandlingServlet with Logging with RequiresAuthentication with GlobalExecutionContext with FutureSupport with GZipSupport {

  put("/") {
    withJsonBody { parsedJson =>
      val validationResult: Either[HttpStatus, TorOppija] = validator.extractAndValidate(parsedJson)
      val result: Either[HttpStatus, Henkilö.Oid] = validationResult.right.flatMap (rekisteri.createOrUpdate _)

      result.left.foreach { case HttpStatus(code, errors) =>
        logger.warn("Opinto-oikeuden päivitys estetty: " + code + " " + errors + " for request " + describeRequest)
      }
      renderEither(result)
    }
  }

  get("/") {
    query { oppijat =>
      JsonStreamWriter.writeJsonStream(oppijat)(this, Json.jsonFormats)
    }
  }

  get("/:oid") {
    renderEither(findByOid)
  }

  get("/validate") {
    query { oppijat =>
      val validationResults = oppijat.map(validateOppija)
      JsonStreamWriter.writeJsonStream(validationResults)(this, Json.jsonFormats)
    }
  }

  get("/validate/:oid") {
    renderEither(findByOid.right.map(validateOppija))
  }

  def validateOppija(oppija: TorOppija): ValidationResult = {
    val oppijaOid: Oid = oppija.henkilö.asInstanceOf[HenkilöWithOid].oid
    val validationResult = validator.validateAsJson(oppija)
    validationResult match {
      case Right(oppija) =>
        ValidationResult(oppijaOid, Nil)
      case Left(status) =>
        ValidationResult(oppijaOid, status.errors)
    }
  }

  get("/search") {
    contentType = "application/json;charset=utf-8"
    params.get("query") match {
      case Some(query) if (query.length >= 3) =>
        Json.write(rekisteri.findOppijat(query.toUpperCase))
      case _ =>
        throw new InvalidRequestException("query parameter length must be at least 3")
    }
  }

  private def query(handleResults: Observable[TorOppija] => Future[String]) = {
    logger.info("Haetaan opiskeluoikeuksia: " + Option(request.getQueryString).getOrElse("ei hakuehtoja"))

    val queryFilters: List[Either[HttpStatus, QueryFilter]] = params.toList.map {
      case (p, v) if p == "valmistunutAikaisintaan" => dateParam((p, v)).right.map(ValmistunutAikaisintaan(_))
      case (p, v) if p == "valmistunutViimeistaan" => dateParam((p, v)).right.map(ValmistunutViimeistään(_))
      case ("tutkinnonTila", v) => Right(TutkinnonTila(v))
      case (p, _) => Left(HttpStatus.badRequest("Unsupported query parameter: " + p))
    }

    queryFilters.partition(_.isLeft) match {
      case (Nil, queries) =>
        val filters = queries.map(_.right.get)
        val oppijat: Observable[TorOppija] = rekisteri.findOppijat(filters)
        handleResults(oppijat)
      case (errors, _) =>
        renderStatus(HttpStatus.fold(errors.map(_.left.get)))
    }
  }

  private def findByOid: Either[HttpStatus, TorOppija] = {
    HenkiloOid.validateHenkilöOid(params("oid")).right.flatMap { oid =>
      rekisteri.findTorOppija(oid)
    }
  }

  override protected def asyncTimeout = Duration.Inf

  def dateParam(q: (String, String)): Either[HttpStatus, LocalDate] = q match {
    case (p, v) => try {
      Right(LocalDate.parse(v))
    } catch {
      case e: DateTimeParseException => Left(HttpStatus.badRequest("Invalid date parameter: " + p + "=" + v))
    }
  }
}

trait QueryFilter

case class ValmistunutAikaisintaan(päivä: LocalDate) extends QueryFilter
case class ValmistunutViimeistään(päivä: LocalDate) extends QueryFilter
case class TutkinnonTila(tila: String) extends QueryFilter
case class ValidationResult(oid: Henkilö.Oid, errors: List[AnyRef])