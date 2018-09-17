import {observerErrorThrown} from './observerErrorThrown'
import {generateUUID} from './generateUUID'

class ReplayEventBus {
  constructor() {
    this._subscriptions = new Map()
    this._pendingEvents = new Map()
  }

  register({eventName, observer}) {
    const subscriptionId = generateUUID()
    const subscription = {
      id: subscriptionId,
      active: true,
      observer
    }
    if (!eventName) {
      throw new Error('Event Name is required')
    }
    if (typeof observer !== 'function') {
      throw new Error('Observer must be a function')
    }
    if (!this._subscriptions.has(eventName)) {
      this._subscriptions.set(eventName, [subscription])
    } else {
      this._subscriptions.get(eventName).push(subscription)
    }
    this._replayPendingEvents({eventName, subscription})
    return subscriptionId
  }

  raise({event}) {
    this._addPendingEvent({event})
    if (this._subscriptions.has(event.eventName)) {
      this._subscriptions
        .get(event.eventName)
        .filter(subscription => subscription.active)
        .forEach(activeSubscription =>
          this._processEvent({event, subscription: activeSubscription})
        )
    }
  }

  _addPendingEvent({event}) {
    if (!this._pendingEvents.has(event.eventName)) {
      this._pendingEvents.set(event.eventName, [event])
    } else {
      this._pendingEvents.get(event.eventName).push(event)
    }
  }

  _replayPendingEvents({eventName, subscription}) {
    if (this._pendingEvents.has(eventName)) {
      const pendingEvent = this._pendingEvents.get(eventName).shift()
      if (pendingEvent) {
        this._processEvent({event: pendingEvent, subscription})
      }
    }
  }

  _processEvent({event, subscription}) {
    try {
      subscription.observer({
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
  }

  unregister({eventName, subscriptionId}) {
    if (this._subscriptions.has(eventName)) {
      const subscriptionIndex = this._subscriptions
        .get(eventName)
        .findIndex(subscription => subscription.id === subscriptionId)
      if (subscriptionIndex > -1) {
        this._subscriptions.get(eventName).splice(subscriptionIndex, 1)
        return true
      }
    }
    return false
  }

  getNumberOfRegisteredEvents() {
    return this._subscriptions.size
  }

  getNumberOfSubscriptionsRegisteredForAnEvent({eventName}) {
    return this._subscriptions.has(eventName)
      ? this._subscriptions.get(eventName).length
      : 0
  }

  getNumberOfPendingEvents({eventName}) {
    return this._pendingEvents.has(eventName)
      ? this._pendingEvents.get(eventName).length
      : 0
  }

  clear({eventName} = {}) {
    if (!eventName) {
      this._pendingEvents.clear()
      this._subscriptions.clear()
    } else {
      this._pendingEvents.delete(eventName)
      this._subscriptions.delete(eventName)
    }
  }
}
const replayEventBus = new ReplayEventBus()
export default replayEventBus
