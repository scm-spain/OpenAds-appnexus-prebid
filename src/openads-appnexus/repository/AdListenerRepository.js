import ReplayEventBus from '../service/ReplayEventBus'

const AD_STORED = 'AD_STORED'

const DEFAULT_TIMEOUT = 20000
const TIMEOUT_EXCEPTION = 'Timeout waiting to retrieve the Ad'

export default class AdListenerRepository {
  constructor({timeout = DEFAULT_TIMEOUT} = {}) {
    this._timeout = timeout
  }

  find({id}) {
    return Promise.race([
      new Promise((resolve, reject) => {
        const eventId = this._eventId({id})
        ReplayEventBus.register({
          eventName: eventId,
          observer: ({event, payload}) => resolve(payload)
        })
      }),
      new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          clearTimeout(timeoutId)
          reject(new Error(TIMEOUT_EXCEPTION))
        }, this._timeout)
      })
    ])
  }

  save({id, adResponse}) {
    return Promise.resolve(this._eventId({id})).then(eventId =>
      ReplayEventBus.raise({
        event: {
          eventName: eventId,
          payload: adResponse
        }
      })
    )
  }

  remove({id}) {
    return Promise.resolve().then(() =>
      ReplayEventBus.clear({eventName: this._eventId({id})})
    )
  }

  _eventId({id}) {
    return `${AD_STORED}_${id}`
  }
}
