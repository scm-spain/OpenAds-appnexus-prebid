import {TIMEOUT_DEBOUNCE, TIMEOUT_BUFFER} from './timeout/timeout'

/**
 * @class
 * @implements {AstClient}
 */
export default class AstClientImpl {
  constructor ({logger, apnTag}) {
    this._apnTag = apnTag
    this._logger = logger
    this._debounceTimeOutDelay = TIMEOUT_DEBOUNCE
    this._debounceTimerID = null
    this._bufferTimeOutDelay = TIMEOUT_BUFFER
    this._bufferTimerID = null
    this._bufferAccumulator = []
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
    this._logger.debug('loadTags has been requested')
    if (this._debounceTimerID !== null) clearTimeout(this._debounceTimerID)
    this._loadTagsDebounceOperator()
    return this
  }

  _loadTagsDebounceOperator () {
    this._debounceTimerID = setTimeout(() => {
      this._logger.debug('loadTags has been called')
      this._apnTag.anq.push(() => this._apnTag.loadTags())
      this._debounceTimerID = null
    }, this._debounceTimeOutDelay)
  }

  showTag ({targetId}) {
    this._logger.debug('showTag | targetId:', targetId)
    this._apnTag.anq.push(() => this._apnTag.showTag(targetId))
    return this
  }

  refresh (targetsArray) {
    this._logger.debug('refresh | targetsArray:', targetsArray)
    if (this._bufferTimerID !== null) clearTimeout(this._bufferTimerID)
    this._bufferAccumulator = this._bufferAccumulator.concat(targetsArray)
    this._refreshBufferOperator()
    return this
  }

  _refreshBufferOperator () {
    this._bufferTimerID = setTimeout(() => {
      this._logger.debug('Refresh has been called')
      this._apnTag.anq.push(() => this._apnTag.refresh(this._bufferAccumulator))
      this._bufferTimerID = null
      this._bufferAccumulator = []
    }, this._bufferTimeOutDelay)
  }

  modifyTag ({targetId, data}) {
    this._logger.debug('modifyTag | targetId:', targetId, '| data:', data)
    this._apnTag.anq.push(() => this._apnTag.modifyTag(targetId, data))
    return this
  }
}