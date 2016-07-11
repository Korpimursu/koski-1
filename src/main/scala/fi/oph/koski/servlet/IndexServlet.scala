package fi.oph.koski.servlet

import fi.oph.koski.koskiuser.{AuthenticationSupport, UserAuthenticationContext}
import org.scalatra.ScalatraServlet

class IndexServlet(val application: UserAuthenticationContext) extends ScalatraServlet with AuthenticationSupport with HtmlServlet {
  before() {
    if (!isAuthenticated && application.config.hasPath("opintopolku.virkailija.url")) {
      redirect(application.config.getString("opintopolku.virkailija.url") + "/cas/login?service=" + currentUrl)
    }
  }

  get("/*") {
    status = 404
    IndexServlet.html
  }

  get("/") {
    IndexServlet.html
  }

  get("/uusioppija") {
    IndexServlet.html
  }

  get("/oppija/:oid") {
    IndexServlet.html
  }

}

object IndexServlet {
  val html =
    <html>
      <head>
        <title>Koski - Opintopolku.fi</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="UTF-8" />
        <link rel="shortcut icon" href="favicon.ico" />
        <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.min.css" />
        <link href='//fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet' type='text/css' />
      </head>
      <body>
        <div id="content"></div>
      </body>
      <script id="bundle" src="/koski/js/bundle.js"></script>
    </html>
}
