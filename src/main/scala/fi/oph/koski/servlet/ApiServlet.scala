package fi.oph.koski.servlet

import fi.oph.koski.http.HttpStatus
import fi.oph.koski.json.Json
import fi.oph.koski.log.Logging
import org.json4s._
import org.scalatra._

trait ApiServlet extends KoskiBaseServlet with Logging with TimedServlet with GZipSupport {
  def withJsonBody(block: JValue => Any)(parseErrorHandler: HttpStatus => Any = haltWithStatus) = {
    JsonBodySnatcher.getJsonBody(request) match {
      case Right(x) => block(x)
      case Left(status: HttpStatus) => parseErrorHandler(status)
    }
  }

  def renderStatus(status: HttpStatus) = {
    response.setStatus(status.statusCode)
    renderObject(status.errors)
  }

  def renderObject(x: AnyRef): Unit = {
    contentType = "application/json;charset=utf-8"
    response.writer.print(Json.write(x))
  }
}

