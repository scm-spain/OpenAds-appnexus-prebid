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
    this._logger.debug(this._logger.name, '| onEvent | event:', event, '| targetId:', targetId)
    this._apnTag.anq.push(() => this._apnTag.onEvent(event, targetId, callback))
    return this
  }

  defineTag ({member, targetId, invCode, sizes, keywords, native}) {
    this._logger.debug(this._logger.name, '| defineTag | member:', member, '| targetId:', targetId, '| invCode:', invCode, '| sizes:', sizes, '| keywords:', keywords, '| native:', native)
    this._apnTag.anq.push(() => this._apnTag.defineTag({member, targetId, invCode, sizes, keywords, native}))
    return this
  }

  loadTags () {
    this._logger.debug(this._logger.name, '| loadTags')
    this._apnTag.anq.push(() => this._apnTag.loadTags())
    return this
  }

  showTag ({targetId}) {
    this._logger.debug(this._logger.name, '| showTag | targetId:', targetId)
    this._apnTag.anq.push(() => this._apnTag.showTag(targetId))
    return this
  }

  refresh (targetsArray) {
    this._logger.debug(this._logger.name, '| refresh | targetsArray:', targetsArray)
    this._apnTag.anq.push(() => this._apnTag.refresh(targetsArray))
    return this
  }

  modifyTag ({targetId, data}) {
    this._logger.debug(this._logger.name, '| modifyTag | targetId:', targetId, '| data:', data)
    this._apnTag.anq.push(() => this._apnTag.modifyTag(targetId, data))
    return this
  }
}
