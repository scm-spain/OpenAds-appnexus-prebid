/**
 * @class
 * @implements {PrebidClient}
 */

export default class PrebidClientImpl {
  constructor({pbjs}) {
    this._pbjs = pbjs || {}
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
