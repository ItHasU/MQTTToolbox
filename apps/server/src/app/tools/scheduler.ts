export interface Event {
    timestamp: number;
    /** If the callback returns a timestamp, it will be re-scheduled once again */
    callback: (e: Event, now: number) => number | void;
}

export class Scheduler {
    private static _events: Event[] = [];
    private static _timeoutHandle: NodeJS.Timer = null;

    //#region Time ------------------------------------------------------------

    public static now(): number {
        return Date.now();
    }

    public static format(instant: number): string {
        return new Date(instant).toLocaleString() + `.${instant % 1000}`;
    }

    //#endregion --------------------------------------------------------------

    public static schedule(event: Event): void {
        if (!event || !event.callback) {
            return;
        }
        if (!event.timestamp) {
            event.timestamp = Scheduler.now(); // Force to now
        }
        Scheduler._events.push(event);
        Scheduler._scheduleNext();
    }

    private static _scheduleNext(): void {
        if (Scheduler._timeoutHandle) {
            // If already scheduled, cancel, we will reschedule a new one
            clearTimeout(Scheduler._timeoutHandle);
        }

        Scheduler._events.sort((e1, e2) => e1.timestamp - e2.timestamp);

        if (!Scheduler._events.length) {
            // We don't have anything to execute
            return;
        }

        const timeout = Math.max(0, Scheduler._events[0].timestamp - Scheduler.now()); // Can't be negative
        Scheduler._timeoutHandle = setTimeout(Scheduler._timeoutCallback, timeout);
    }

    private static _timeoutCallback(): void {
        const now: number = Scheduler.now();

        // We create a new list, to allow events to schedule new ones from their callback
        const previousEvents: Event[] = Scheduler._events;
        Scheduler._events = [];

        //-- Run due callbacks, keep future events --
        for (let event of previousEvents) {
            if (!event.callback) {
                // No callback, the event will be dropped
                continue;
            }
            if (!event.timestamp || event.timestamp <= now) {
                // We need to trigger this callback
                try {
                    let next = event.callback(event, now);
                    if (next !== null && next !== undefined) {
                        // We need to keep the event, it was rescheduled
                        Scheduler._events.push(event);
                    }
                } catch (e) {
                    // If an error occurs log it and remove event from the list
                    console.error(e);
                    continue;
                }
            } else {
                // The event is scheduled in the future, keep it for later
                Scheduler._events.push(event);
            }
        }

        //-- Schedule next call --
        Scheduler._scheduleNext();
    }
}