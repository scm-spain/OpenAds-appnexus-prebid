/**
 * @class
 * @implements {PrebidClient}
 */

export default class PrebidClientImpl {
  constructor({window}) {
    this._window = window
    this._pbjs = this._window.pbjs || {}
    this._pbjs.que = this._window.pbjs.que || []
  }

  addAdUnits({adUnits}) {
    this._pbjs.que.push(() => this._pbjs.addAdUnits(adUnits))
    return this
  }

  requestBids({requestObj}) {
    this._pbjs.que.push(() => this._pbjs.requestBids(requestObj))
    return this
  }

  setTargetingForAst() {
    this._pbjs.que.push(() => this._pbjs.setTargetForAst())
    return this
  }
}
