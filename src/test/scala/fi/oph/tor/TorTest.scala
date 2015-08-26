package fi.oph.tor

import fi.oph.tor.db.TorDatabase._
import fi.oph.tor.db._

trait TorTest extends Futures with GlobalExecutionContext {
  def initLocalRekisteri: TodennetunOsaamisenRekisteri = {
    val database: DB = TorDatabase.forConfig(DatabaseConfig.localTestDatabase)
    val tor = new TodennetunOsaamisenRekisteri(database)
    await(database.run(DatabaseTestFixture.clear))
    tor
  }
}
