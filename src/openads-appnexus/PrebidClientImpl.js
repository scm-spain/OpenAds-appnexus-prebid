/**
 * @class
 * @implements {PrebidClient}
 */

export default class PrebidClientImpl {
  constructor({window, logger}) {
    this._window = window
    this._logger = logger
    this._pbjs = this._window.pbjs || {} // TODO: DEFINE WHAT SHOULD HAPPEN IF PBJS IS NOT PRESENT IN THE WINDOW
    this._pbjs.que = this._window.pbjs.que || []
  }

  addAdUnits({adUnits}) {
    this._logger.debug(this._logger.name, '| addAdUnits | adUnits:', adUnits)
    this._pbjs.que.push(() => this._pbjs.addAdUnits(adUnits))
    return this
  }

  requestBids({requestObj}) {
    this._logger.debug(
      this._logger.name,
      '| requestBids | requestObj:',
      requestObj
    )
    this._pbjs.que.push(() => this._pbjs.requestBids(requestObj))
    return this
  }

  setTargetingForAst() {
    this._logger.debug(
      this._logger.name,
      '| setTargetingForAst has been called.'
    )
    this._pbjs.que.push(() => this._pbjs.setTargetForAst())
    return this
  }
}
