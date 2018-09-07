import {observerErrorThrown} from './observerErrorThrown'

class ReplayEventBus {
  constructor() {
    this._observers = new Map()
    this._pendingEvents = new Map()
  }

  register({eventName, observer}) {
    if (!eventName) {
      throw new Error('Event Name is required')
    }
    if (typeof observer !== 'function') {
      throw new Error('Observer must be a function')
    }
    if (!this._observers.has(eventName)) {
      this._observers.set(eventName, [observer])
      this._replayPendingEvent({eventName})
    } else {
      this._observers.get(eventName).push(observer)
    }
  }

  raise({event}) {
    if (this._observers.has(event.eventName)) {
      this._observers.get(event.eventName).forEach(observer => {
        try {
          observer({
            event: event.eventName,
            payload: event.payload,
            dispatcher: data => this.raise({event: data})
          })
        } catch (err) {
          this.raise({
            event: observerErrorThrown({
              message: 'Error processing the observer.',
              error: err
            })
          })
        }
      })
    } else {
      this._pendingEvents.set(event.eventName, event)
    }
  }

  _replayPendingEvent({eventName}) {
    if (this.hasPendingEvent({eventName})) {
      const pendingEvent = this._pendingEvents.get(eventName)
      this._pendingEvents.delete(eventName)
      this.raise({event: pendingEvent})
    }
  }

  getNumberOfRegisteredEvents() {
    return this._observers.size
  }

  getNumberOfObserversRegisteredForAnEvent({eventName}) {
    return this._observers.has(eventName)
      ? this._observers.get(eventName).length
      : 0
  }

  hasPendingEvent({eventName}) {
    return this._pendingEvents.has(eventName)
  }

  clear({eventName} = {}) {
    if (!eventName) {
      this._pendingEvents.clear()
      this._observers.clear()
    } else {
      this._pendingEvents.delete(eventName)
      this._observers.delete(eventName)
    }
  }
}
const replayEventBus = new ReplayEventBus()
export default replayEventBus
