/**
 * @class
 * @implements {AstClient}
 */
export default class AstClientImpl {
  constructor ({member, astWrapper}) {
    this._member = member
    this._astWrapper = astWrapper
    this._registeredEvents = new Map()
  }

  get member () {
    return this._member
  }

  activateDebugMode () {
    this._astWrapper.debug = true
    return this
  }

  setPageOpts ({member, keywords}) {
    this._astWrapper.anq.push(() => this._astWrapper.setPageOpts({member, keywords}))
    return this
  }

  onEvent ({event, targetId, callback}) {
    this._astWrapper.anq.push(() => {
      this._astWrapper.onEvent(event, targetId, callback)
      if (!this._registeredEvents.has(targetId)) {
        this._registeredEvents.set(targetId, [])
      }
      this._registeredEvents.get(targetId).push(event)
    })
    return this
  }

  defineTag ({member, targetId, invCode, sizes, keywords, native}) {
    this._astWrapper.anq.push(() => this._astWrapper.defineTag({member, targetId, invCode, sizes, keywords, native}))
    return this
  }

  loadTags () {
    this._astWrapper.anq.push(() => this._astWrapper.loadTags())
    return this
  }

  showTag ({target}) {
    this._astWrapper.anq.push(() => this._astWrapper.showTag(target))
    return this
  }

  reset () {
    this._astWrapper.anq.push(() => {
      this._astWrapper.clearRequest()
      this._registeredEvents.forEach((eventArray, targetId) => {
        eventArray.forEach(event => this._astWrapper.offEvent(event, targetId))
      })
      this._registeredEvents = new Map()
    })
    return this
  }

  refresh (target) {
    this._astWrapper.anq.push(() => this._astWrapper.refresh(target))
    return this
  }

  modifyTag ({targetId, data}) {
    this._astWrapper.anq.push(() => this._astWrapper.modifyTag(targetId, data))
    return this
  }
}
