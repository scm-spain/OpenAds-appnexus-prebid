const TIMEOUT_EXCEPTION = 'Timeout retrieving the Ad from the server'
const DEFAULT_TIMEOUT = 20000
const DEFAULT_WAIT = 50

export default class PullingAdRepository {
  constructor ({wait = DEFAULT_WAIT, timeout = DEFAULT_TIMEOUT, ads = [[]]} = {}) {
    this._ads = new Map(ads)
    this._wait = wait
    this._timeout = timeout
  }

  find ({id}) {
    return Promise.race([
      this._waitForData({id}),
      this._timeoutPromise()
    ])
  }

  has ({id}) {
    return this._ads.has(id)
  }

  save ({id, adResponse}) {
    this._ads.set(id, adResponse)
  }

  remove ({id}) {
    return this._ads.delete(id)
  }

  _waitForData ({id}) {
    return Promise.resolve(this._ads.get(id))
      .then(optionalAd => optionalAd || this._intervalPull(id))
  }

  _intervalPull (id) {
    return new Promise(resolve => {
      const stopper = setInterval(() => {
        if (this._ads.has(id)) {
          clearInterval(stopper)
          resolve(this._ads.get(id))
        }
      }, this._wait)
    })
  }

  _timeoutPromise () {
    return new Promise((resolve, reject) => {
      const wait = setTimeout(() => {
        clearTimeout(wait)
        reject(new Error(TIMEOUT_EXCEPTION))
      }, this._timeout)
    })
  }
}
