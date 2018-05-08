import PullingDataEntry from './PullingDataEntry'

const TIMEOUT_EXCEPTION = 'Timeout retrieving the Ad from the server'
const DEFAULT_TIMEOUT = 20000
const DEFAULT_WAIT = 50

export default class PullingAdRepository {
  constructor ({wait = DEFAULT_WAIT, timeout = DEFAULT_TIMEOUT, ads = []} = {}) {
    this._ads = new Map(ads)
    this._wait = wait
    this._timeout = timeout
  }

  find ({id}) {
    return Promise.resolve(id)
      .then(id => this._ads.has(id) ? this._ads.get(id) : this._createPullingDataEntry(id))
      .then(pullingDataEntry => Promise.race([
        this._waitForData(pullingDataEntry),
        this._timeoutPromise(pullingDataEntry)
      ]))
  }

  has ({id}) {
    return this._ads.has(id) && this._ads.get(id).data !== undefined
  }

  save ({id, adResponse}) {
    if (!this._ads.has(id)) {
      this._ads.set(id, new PullingDataEntry(id))
    }
    this._ads.get(id).updateData(adResponse)
  }

  remove ({id}) {
    return this._ads.delete(id)
  }

  _createPullingDataEntry (id) {
    const pullingDataEntry = new PullingDataEntry(id)
    this._ads.set(id, pullingDataEntry)
    return pullingDataEntry
  }

  _waitForData (pullingDataEntry) {
    return Promise.resolve(pullingDataEntry.data)
      .then(optionalData => optionalData || this._intervalPull(pullingDataEntry))
  }

  _intervalPull (pullingDataEntry) {
    return new Promise(resolve => {
      pullingDataEntry.updateInterval(
        setInterval(() => {
          if (pullingDataEntry.data) {
            pullingDataEntry.removeInterval()
            resolve(pullingDataEntry.data)
          }
        }, this._wait)
      )
    })
  }

  _timeoutPromise (pullingDataEntry) {
    return new Promise((resolve, reject) => {
      const wait = setTimeout(() => {
        clearTimeout(wait)
        pullingDataEntry.removeInterval()
        reject(new Error(TIMEOUT_EXCEPTION))
      }, this._timeout)
    })
  }
}
