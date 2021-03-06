package fi.oph.koski.elasticsearch

import java.io.File

import fi.oph.koski.log.Logging
import fi.oph.koski.util.PortChecker

class ElasticSearchRunner(dataDirName: String, httpPort: Int, tcpPort: Int) extends Logging {
  import sys.process._

  lazy val dataPath = new File(dataDirName).toPath

  private var serverProcess: Option[Process] = None

  // automatically checks if already running, prevents starting multiple instances
  def start = ElasticSearchRunner.synchronized {
    if (!serverProcess.isDefined && PortChecker.isFreeLocalPort(httpPort)) {
      logger.info(s"Starting Elasticsearch server on ports HTTP $httpPort and TCP $tcpPort")
      val cmd = s"elasticsearch -E http.port=$httpPort -E transport.tcp.port=$tcpPort -E path.conf=$dataDirName -E path.data=$dataDirName/data -E path.logs=$dataDirName/log"
      logger.info("Elasticsearch command: " + cmd)
      serverProcess = Some(cmd.run)
      PortChecker.waitUntilReservedLocalPort(httpPort)
      PortChecker.waitUntilReservedLocalPort(tcpPort)
      sys.addShutdownHook {
        stop
      }
    }
    this
  }

  def stop() = {
    serverProcess.foreach(_.destroy())
    serverProcess = None
  }
}

private object ElasticSearchRunner