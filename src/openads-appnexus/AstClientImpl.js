/**
 * @class
 * @implements {AstClient}
 */
export default class AstClientImpl {
  constructor ({logger, apnTag}) {
    this._apnTag = apnTag
    this._logger = logger
  }

  debugMode ({enabled}) {
    this._apnTag.debug = enabled
    return this
  }

  onEvent ({event, targetId, callback}) {
    this._logger.debug('onEvent | event:', event, '| targetId:', targetId)
    this._apnTag.anq.push(() => this._apnTag.onEvent(event, targetId, callback))
    return this
  }

  defineTag ({member, targetId, invCode, sizes, keywords, native}) {
    this._logger.debug('defineTag | member:', member, '| targetId:', targetId, '| invCode:', invCode, '| sizes:', sizes, '| keywords:', keywords, '| native:', native)
    this._apnTag.anq.push(() => this._apnTag.defineTag({member, targetId, invCode, sizes, keywords, native}))
    return this
  }

  loadTags () {
    this._logger.debug('loadTags')
    this._apnTag.anq.push(() => this._apnTag.loadTags())
    return this
  }

  showTag ({target}) {
    this._logger.debug('showTag | target:', target)
    this._apnTag.anq.push(() => this._apnTag.showTag(target))
    return this
  }

  refresh (target) {
    this._logger.debug('refresh | target:', target)
    this._apnTag.anq.push(() => this._apnTag.refresh(target))
    return this
  }

  modifyTag ({targetId, data}) {
    this._logger.debug('modifyTag | targetId:', targetId, '| data:', data)
    this._apnTag.anq.push(() => this._apnTag.modifyTag(targetId, data))
    return this
  }
}
