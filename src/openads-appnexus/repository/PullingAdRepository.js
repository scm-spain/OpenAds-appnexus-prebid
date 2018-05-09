import PullingDataEntry from './PullingDataEntry'

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
      .then(id => this.has({id}) ? this.getValue({id}) : this._pulledData({id}))
  }

  _pulledData ({id}) {
    return Promise.resolve(id)
      .then(id => new PullingDataEntry({id, adRepository: this, timeout: this._timeout, wait: this._wait}))
      .then(pullingDataEntry => pullingDataEntry.waitForData())
  }

  has ({id}) {
    return this._ads.has(id) && this._ads.get(id) !== undefined
  }

  getValue ({id}) {
    return this._ads.get(id)
  }

  save ({id, adResponse}) {
    this._ads.set(id, adResponse)
  }

  remove ({id}) {
    return this._ads.delete(id)
  }
}
