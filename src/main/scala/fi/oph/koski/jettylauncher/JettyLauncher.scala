package fi.oph.koski.jettylauncher

import java.lang.management.ManagementFactory
import java.nio.file.{Files, Paths}

import com.typesafe.config.ConfigValueFactory._
import fi.oph.koski.cache.JMXCacheManager
import fi.oph.koski.config.KoskiApplication
import fi.oph.koski.log.{LogConfiguration, Logging}
import fi.oph.koski.util.{Pools, PortChecker}
import io.prometheus.client.exporter.MetricsServlet
import org.eclipse.jetty.jmx.MBeanContainer
import org.eclipse.jetty.server.handler.{HandlerCollection, StatisticsHandler}
import org.eclipse.jetty.server._
import org.eclipse.jetty.servlet.{ServletContextHandler, ServletHolder}
import org.eclipse.jetty.util.thread.QueuedThreadPool
import org.eclipse.jetty.webapp.WebAppContext

object JettyLauncher extends App with Logging {
  lazy val globalPort = System.getProperty("koski.port","7021").toInt
  try {
    new JettyLauncher(globalPort).start.join
  } catch {
    case e: Throwable =>
      logger.error(e)("Error in server startup")
      System.exit(1)
  }
}

class JettyLauncher(val port: Int, overrides: Map[String, String] = Map.empty) extends Logging {
  private val config = overrides.toList.foldLeft(KoskiApplication.defaultConfig)({ case (config, (key, value)) => config.withValue(key, fromAnyRef(value)) })
  private val application = new KoskiApplication(config, new JMXCacheManager)

  private val threadPool = new QueuedThreadPool(Pools.jettyThreads, 10);
  private val server = new Server(threadPool)

  application.database // <- force evaluation to make sure DB is up

  configureLogging
  setupConnector

  private val handlers = new HandlerCollection()

  server.setHandler(handlers)

  setupKoskiApplicationContext
  setupJMX
  setupPrometheusMetrics

  def start = {
    server.start
    server
  }

  def baseUrl = "http://localhost:" + port + "/koski"

  private def setupConnector = {
    val httpConfig = new HttpConfiguration()
    httpConfig.addCustomizer( new ForwardedRequestCustomizer() )
    val connectionFactory = new HttpConnectionFactory( httpConfig )

    val connector = new ServerConnector(server, connectionFactory)
    connector.setPort(port)
    server.addConnector(connector)
  }

  protected def configureLogging = {
    LogConfiguration.configureLoggingWithFileWatch
    val requestLog = new Slf4jRequestLog()
    requestLog.setLogLatency(true)
    server.setRequestLog(requestLog)
  }

  private def setupKoskiApplicationContext = {
    val context = new WebAppContext()
    context.setAttribute("koski.application", application)
    context.setParentLoaderPriority(true)
    context.setContextPath("/koski")
    def resourceBase = System.getProperty("resourcebase", "./target/webapp")

    if (!Files.exists(Paths.get(resourceBase))) {
      throw new RuntimeException("WebApplication resource base: " + resourceBase + " does not exist.")
    }
    context.setResourceBase(resourceBase)

    handlers.addHandler(context)

  }

  private def setupJMX = {
    val mbContainer = new MBeanContainer(ManagementFactory.getPlatformMBeanServer())
    server.addBean(mbContainer)

    val stats = new StatisticsHandler
    stats.setHandler(server.getHandler())
    server.setHandler(stats)
  }

  private def setupPrometheusMetrics = {
    val context = new ServletContextHandler();
    context.setContextPath("/")
    context.addServlet(new ServletHolder(new MetricsServlet), "/metrics")
    handlers.addHandler(context)
  }
}

object TestConfig {
  val overrides = Map("db.name" -> "koskitest", "fixtures.use" -> "true")
}

object SharedJetty extends JettyLauncher(PortChecker.findFreeLocalPort, TestConfig.overrides)