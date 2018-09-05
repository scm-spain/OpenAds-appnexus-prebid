/* eslint-disable no-undef */
const AD_STORED = 'AD_STORED'

const DEFAULT_TIMEOUT = 20000

export default class AdListenerRepository {
  constructor ({dom, timeout = DEFAULT_TIMEOUT} = {}) {
    this._dom = dom
    this._timeout = timeout
  }

  find ({id}) {
    return Promise.resolve(id)
      .then(id => this._ads.has(id) ? this._ads.get(id) : this._listenForData({id}))
  }

  _listenForData ({id}) {
    return Promise.race([
      new Promise((resolve, reject) => {
        this._dom.addEventListener(`${AD_STORED}_${id}`, e => {
          resolve(e.detail.adResponse)
        })
      }),
      new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          clearTimeout(timeoutId)
          reject(new Error(TIMEOUT_EXCEPTION))
        }, this._timeout)
      })])
  }

  save ({id, adResponse}) {
    this._dom.dispatchEvent(new CustomEvent(`${AD_STORED}_${id}`, {
      detail: {id, adResponse}
    }))
  }
}
