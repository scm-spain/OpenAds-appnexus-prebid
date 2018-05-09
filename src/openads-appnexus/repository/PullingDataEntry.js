const TIMEOUT_EXCEPTION = 'Timeout retrieving the Ad from the server'

export default class PullingDataEntry {
  constructor ({id, adRepository, timeout, wait}) {
    this._id = id
    this._adRepository = adRepository
    this._timeout = timeout
    this._wait = wait
    this._dataPromise = Promise.race([
      this._createIntervalPromise({id}),
      this._createTimeoutPromise()
    ])
  }

  get id () {
    return this._id
  }

  waitForData () {
    return this._dataPromise
  }

  _createIntervalPromise ({id}) {
    return new Promise(resolve => {
      this._interval = setInterval(() => {
        if (this._adRepository.has({id})) {
          clearTimeout(this._timeout)
          clearInterval(this._interval)
          resolve(this._adRepository.getValue({id}))
        }
      }, this._wait)
    })
  }

  _createTimeoutPromise () {
    return new Promise((resolve, reject) => {
      this._timeout = setTimeout(() => {
        clearInterval(this._interval)
        clearTimeout(this._timeout)
        reject(new Error(TIMEOUT_EXCEPTION))
      }, this._timeout)
    })
  }
}
