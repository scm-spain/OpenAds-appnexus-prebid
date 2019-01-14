/**
 * @class
 * @implements {PrebidClient}
 */

export default class PrebidClientImpl {
  constructor({window, logger}) {
    this._window = window
    this._window.pbjs = this._window.pbjs || {}
    this._window.pbjs.que = this._window.pbjs.que || []
    this._pbjs = this._window.pbjs
    this._logger = logger
  }

  addAdUnits({adUnits}) {
    this._logger.debug(this._logger.name, '| addAdUnits | adUnits:', adUnits)
    this._pbjs.que.push(() => this._pbjs.addAdUnits(adUnits))
    return this
  }

  requestBids(requestObj) {
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
    this._pbjs.que.push(() => this._pbjs.setTargetingForAst())
    return this
  }

  setConfig(config) {
    this._logger.debug(this._logger.name, '| setConfig has been called.')
    this._pbjs.que.push(() => this._pbjs.setConfig(config))
    return this
  }
}
