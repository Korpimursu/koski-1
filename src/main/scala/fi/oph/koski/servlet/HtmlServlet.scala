package fi.oph.koski.servlet

import java.util.Properties

import fi.oph.koski.IndexServlet
import fi.oph.koski.http.{HttpStatus, KoskiErrorCategory}
import fi.oph.koski.koskiuser.AuthenticationSupport

import scala.xml.transform.RewriteRule
import scala.xml.{Elem, Node}

trait HtmlServlet extends KoskiBaseServlet with AuthenticationSupport {

  lazy val buildversion = Option(getServletContext.getResourceAsStream("/buildversion.txt")).map { i =>
    val p = new Properties()
    p.load(i)
    p.getProperty("vcsRevision", null)
  }

  override def haltWithStatus(status: HttpStatus): Nothing = status.statusCode match {
    case 401 => redirectToLogin
    case _ => super.haltWithStatus(status)
  }

  def renderStatus(status: HttpStatus): Unit = {

    val errorInjectionScript = <script>window.koskiError = {{ httpStatus: {status.statusCode}, text: '{status.errors(0).message.toString}', topLevel: true }}</script>

    val html = new RewriteRule {
      override def transform(n: Node): Seq[Node] = n match {
        case e: Elem if (e.label == "script" && ((e \ "@id") text) == "bundle") => List(errorInjectionScript, e)
        case elem: Elem => elem copy (child = elem.child flatMap (this transform))
        case other => other
      }
    } transform(IndexServlet.html(buildversion = buildversion))

    response.setStatus(status.statusCode)
    contentType = "text/html"
    response.writer.print(html)
  }

  def renderObject(x: AnyRef) = x match {
    case e: Elem =>
      contentType = "text/html"
      response.writer.print(e.toString)
    case _ =>
      logger.error("HtmlServlet cannot render " + x)
      renderStatus(KoskiErrorCategory.internalError())
  }
}
