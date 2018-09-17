import ReplayEventBus from '../service/ReplayEventBus'

const AD_STORED = 'AD_STORED'

const DEFAULT_TIMEOUT = 20000
const TIMEOUT_EXCEPTION = 'Timeout waiting to retrieve the Ad'

export default class AdListenerRepository {
  constructor({timeout = DEFAULT_TIMEOUT, initialAds = [[]]} = {}) {
    this._timeout = timeout
    this._ads = new Map(initialAds)
  }

  find({id}) {
    return Promise.resolve().then(
      () =>
        this._ads.has(id)
          ? this._ads.get(id)
          : this._registerAdSubscription({id})
    )
  }

  save({id, adResponse}) {
    return Promise.all([
      this._ads.set(id, adResponse),
      Promise.resolve(this._eventNameFromAdId({id})).then(eventId =>
        ReplayEventBus.raise({
          event: {
            eventName: eventId,
            payload: adResponse
          }
        })
      )
    ])
  }

  remove({id}) {
    return Promise.resolve().then(() => this._ads.delete(id))
  }

  _registerAdSubscription({id}) {
    return new Promise((resolve, reject) => {
      const eventName = this._eventNameFromAdId({id})
      let timeoutId = -1
      const subscriptionId = ReplayEventBus.register({
        eventName,
        observer: ({event, payload}) => {
          if (timeoutId > -1) {
            clearTimeout(timeoutId)
          }
          ReplayEventBus.unregister({eventName, subscriptionId})
          resolve(payload)
        }
      })
      timeoutId = setTimeout(() => {
        ReplayEventBus.unregister({eventName, subscriptionId})
        clearTimeout(timeoutId)
        if (this._ads.has(id)) {
          resolve(this._ads.get(id))
        } else {
          reject(new Error(TIMEOUT_EXCEPTION))
        }
      }, this._timeout)
    })
  }

  _eventNameFromAdId({id}) {
    return `${AD_STORED}_${id}`
  }
}
