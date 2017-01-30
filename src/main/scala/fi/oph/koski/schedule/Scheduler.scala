package fi.oph.koski.schedule

import java.lang.System.currentTimeMillis
import java.sql.Timestamp
import java.time.LocalDateTime
import java.util.concurrent.{Executors, TimeUnit}

import fi.oph.koski.db.KoskiDatabase.DB
import fi.oph.koski.db.PostgresDriverWithJsonSupport.api._
import fi.oph.koski.db.{GlobalExecutionContext, KoskiDatabaseMethods, SchedulerRow, Tables}
import fi.oph.koski.log.Logging
import org.json4s._
import org.json4s.jackson.JsonMethods

class Scheduler(val db: DB, name: String, scheduling: Schedule, initialContext: Option[JValue], task: Option[JValue] => Option[JValue], intervalMillis: Int = 10000)
  extends GlobalExecutionContext with KoskiDatabaseMethods with Logging {
  private val taskExecutor = Executors.newSingleThreadScheduledExecutor
  private val context: Option[JValue] = getScheduler.flatMap(_.context).orElse(initialContext)

  runDbSync(Tables.Scheduler.insertOrUpdate(SchedulerRow(name, scheduling.nextFireTime, context)))
  taskExecutor.scheduleAtFixedRate(() => fireIfTime(), intervalMillis, intervalMillis, TimeUnit.MILLISECONDS)

  private def fireIfTime() = {
    val shouldFire = runDbSync(Tables.Scheduler.filter(s => s.name === name && s.nextFireTime < now).map(_.nextFireTime).update(scheduling.nextFireTime)) > 0
    if (shouldFire) {
      try {
        fire
      } catch {
        case e: Exception =>
          logger.error(e)(s"Scheduled task $name failed: ${e.getMessage}")
          throw e
      }
    }
  }

  private def fire = {
    val context: Option[JValue] = runDbSync(Tables.Scheduler.filter(_.name === name).result.head).context
    logger.info(s"Firing scheduled task $name with context ${context.map(JsonMethods.compact)}")
    val newContext: Option[JValue] = task(context)
    runDbSync(Tables.Scheduler.filter(s => s.name === name).map(_.context).update(newContext))
  }

  private def now = new Timestamp(currentTimeMillis)
  private def getScheduler: Option[SchedulerRow] =
    runDbSync(Tables.Scheduler.filter(s => s.name === name).result.headOption)
}

trait Schedule {
  def nextFireTime: Timestamp = Timestamp.valueOf(scheduleNextFireTime(LocalDateTime.now))
  def scheduleNextFireTime(seed: LocalDateTime): LocalDateTime
}

class FixedTimeOfDaySchedule(hour: Int, minute: Int) extends Schedule {
  override def scheduleNextFireTime(seed: LocalDateTime): LocalDateTime = seed.plusDays(1).withHour(hour).withMinute(minute)
}

class IntervalSchedule(seconds: Int) extends Schedule {
  override def scheduleNextFireTime(seed: LocalDateTime): LocalDateTime = seed.plusSeconds(seconds)
}
