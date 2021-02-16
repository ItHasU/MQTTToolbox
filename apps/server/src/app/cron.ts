import { CronScenario, CronTask } from '@mqtttoolbox/commons';
import { Config } from './tools/config';
import { MQTTProxy } from './mqttProxy';

export class CronScheduler {
  private static _nextEvent: NodeJS.Timer = null;
  private static _scenarios: CronScenario[] = [];

  /** Register to config callback and start sending messages */
  public static start() {
    Config.on("cron", (name, scenarios) => {
      CronScheduler._onConfigChange(scenarios);
    });
    Config.get("cron", []).then((scenarios) => {
      // Keep this code for debugging
      // const now = new Date().getTime();
      // for (let scenario of scenarios) {
      //   console.log(`-- ${scenario.name} --`);
      //   for (let task of scenario.tasks) {
      //     console.log(`* Task ${JSON.stringify(task)}`);
      //     let time = now;
      //     for (let i = 0; i < 30; i++) {
      //       time = CronScheduler._getNextCall(time, task);
      //     }
      //   }
      // }
      // console.log("done")
      CronScheduler._onConfigChange(scenarios);
    });
  }

  private static _onConfigChange(scenarios: CronScenario[]): void {
    CronScheduler._clearSchedule();
    CronScheduler._scenarios = scenarios;
    CronScheduler._scheduleNext(new Date().getTime());
  }

  private static _clearSchedule(): void {
    if (CronScheduler._nextEvent) {
      clearTimeout(CronScheduler._nextEvent);
    }
    CronScheduler._nextEvent = null;
    CronScheduler._scenarios = [];
  }

  /** 
   * Schedule (setTimeout) next messages.
   * 
   * Passed "now" is only used for computation. 
   * Real instant is used to schedule next call. 
   * This avoids missing one message if there is some lag due to asynchronism.
   */
  private static _scheduleNext(now: number): void {
    let nextCallInstant: number = null;
    let nextMessages: CronTask[] = null;


    for (let scenario of CronScheduler._scenarios) {
      if (!scenario.activated) {
        continue;
      }

      for (let task of scenario.tasks) {
        let taskNext = CronScheduler._getNextCall(now, task);
        if (!taskNext) {
          // Task is not expected to run
          continue;
        }

        if (nextCallInstant === null || taskNext < nextCallInstant) {
          // Sooner then previous
          nextCallInstant = taskNext;
          nextMessages = [task];
        } else if (taskNext === nextCallInstant) {
          // Same time as previous selected task
          nextMessages.push(task);
        }
      }
    }

    if (nextCallInstant) {
      console.log(`Cron: next publish is scheduled at ${new Date(nextCallInstant).toLocaleString()}`);

      let realNow: number = new Date().getTime();
      let timeToWait_ms: number = Math.max(0, nextCallInstant - realNow);
      CronScheduler._nextEvent = setTimeout(() => {
        //-- Clear event --
        CronScheduler._nextEvent = null;

        //-- At this point we need to send the scheduled messages --
        for (let task of nextMessages) {
          MQTTProxy.publish(task.topic, Buffer.from(task.payload)).catch((e) => {
            // We don't really care about the error, just print it
            console.error(e);
          });
        }
        //-- Then we can reschedule the next call --
        // Here we use the nextCallInstant as now, to avoid skipping a message.
        CronScheduler._scheduleNext(nextCallInstant);
      }, timeToWait_ms);
    } else {
      console.log("Cron: no event scheduled");
    }
  }

  private static _getNextCall(now: number, task: CronTask): number {
    const nowDate: Date = new Date(now);
    const nowDayOfWeekStartingMonday = (nowDate.getDay() + 6) % 7;
    // We need i = 7, because if now is the exact instant of the task, next call might be next week
    for (let i = 0; i <= 7; i++) {
      // Is task expected to run on date
      if (!task.days[(nowDayOfWeekStartingMonday + i) % 7]) {
        // We don't expect task to run on given day
        continue;
      }

      // What would be the date expected to run the task on this day ?
      const tmpDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + i, task.hours, task.minutes, 0, 0);
      const tmp = tmpDate.getTime();
      if (now < tmp) {
        // This is the first next time
        return tmp;
      }
    }
    // We did not manage to reach a next time (this should only happen if no day is selected)
    return null;
  }
}
