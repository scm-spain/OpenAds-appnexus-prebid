import {
  AD_AVAILABLE,
  AD_BAD_REQUEST,
  AD_ERROR,
  AD_NO_BID,
  AD_REQUEST_FAILURE
} from './event/events'

import {TIMEOUT_DEBOUNCE, TIMEOUT_PREBID} from './timeout/timeout'
import Debouncer from './service/debouncer'
import bidsBackHandlerCallback from './bidsBackHandlerCallback'

/**
 * @class
 * @implements {AdLoadable}
 * @implements {AdViewable}
 * @implements {Logger}
 */
export default class AppNexusConnector {
  constructor({
    member,
    logger,
    astClient,
    adRepository,
    loggerProvider,
    prebidClient
  }) {
    this._member = member
    this._logger = logger
    this._astClient = astClient
    this._adRepository = adRepository
    this._loggerProvider = loggerProvider
    this._prebidClient = prebidClient
    this._loadAdDebouncer = new Debouncer({
      onDebounce: this._onLoadAdDebounce.bind(this),
      debounceTimeout: TIMEOUT_DEBOUNCE
    })
  }

  get member() {
    return this._member
  }

  loadAd({id, specification}) {
    // noinspection JSAnnotator
    return Promise.resolve()
      .then(() => this._adRepository.remove({id: id}))
      .then(() => this._loadAdDebouncer.debounce({input: {id, specification}}))
      .then(() => this._adRepository.find({id: id}))
  }

  display({id}) {
    return Promise.resolve()
      .then(() => this._astClient.showTag({targetId: id}))
      .then(null)
  }

  /**
   * @param {object} inputArray
   * @returns {Promise<{appnexusInputsArray: Array, prebidUnitsArray: Array} | never | void>}
   * @private
   */
  _onLoadAdDebounce(inputArray) {
    return Promise.resolve()
      .then(() => this._arrayBuilder({array: inputArray}))
      .then(inputArrays => {
        inputArrays.appnexusInputsArray.forEach(input =>
          this._defineAppNexusTag({id: input.id, tag: input.tag})
        )
        if (inputArrays.prebidUnitsArray.length > 0) {
          this._prebidClient.addAdUnits(inputArrays.prebidUnitsArray)
          this._prebidClient.requestBids({
            bidsBackHandler: bidsBackHandlerCallback,
            timeout: TIMEOUT_PREBID
          })
        } else {
          this._astClient.loadTags()
        }
      })
      .catch(error => console.log(error))
  }

  _arrayBuilder({array}) {
    const formattedArray = {
      appnexusInputsArray: [],
      prebidUnitsArray: []
    }

    formattedArray.appnexusInputsArray = array.map(ad => ({
      id: ad.id,
      tag: ad.specification.appNexus
    }))

    formattedArray.prebidUnitsArray = array
      .filter(ad => ad.specification.prebid)
      .map(ad => ad.specification.prebid)

    return formattedArray
  }

  _defineAppNexusTag({id, tag}) {
    this._astClient.defineTag(tag)
    this._astClient.onEvent({
      event: AD_AVAILABLE,
      targetId: id,
      callback: consumer(this._adRepository)(id)(AD_AVAILABLE)
    })
    this._astClient.onEvent({
      event: AD_BAD_REQUEST,
      targetId: id,
      callback: consumer(this._adRepository)(id)(AD_BAD_REQUEST)
    })
    this._astClient.onEvent({
      event: AD_ERROR,
      targetId: id,
      callback: consumer(this._adRepository)(id)(AD_ERROR)
    })
    this._astClient.onEvent({
      event: AD_NO_BID,
      targetId: id,
      callback: consumer(this._adRepository)(id)(AD_NO_BID)
    })
    this._astClient.onEvent({
      event: AD_REQUEST_FAILURE,
      targetId: id,
      callback: consumer(this._adRepository)(id)(AD_REQUEST_FAILURE)
    })
  }

  refresh({id, specification}) {
    return Promise.resolve()
      .then(() => this._adRepository.remove({id: id}))
      .then(() => {
        let updateData =
          (specification.appnexus.placement ||
            specification.appnexus.sizes ||
            specification.appnexus.segmentation ||
            specification.appnexus.native) &&
          {}
        if (updateData) {
          if (specification.appnexus.placement)
            updateData.invCode = specification.appnexus.placement
          if (specification.appnexus.sizes)
            updateData.sizes = specification.appnexus.sizes
          if (specification.appnexus.segmentation)
            updateData.keywords = specification.appnexus.segmentation
          if (specification.appnexus.native)
            updateData.native = specification.appnexus.native
          this._astClient.modifyTag({
            targetId: id,
            data: updateData
          })
        }
      })
      .then(() => this._astClient.refresh([id]))
      .then(() => this._adRepository.find({id: id}))
  }

  enableDebug({debug}) {
    this._astClient.debugMode({debug})
    this._loggerProvider.debugMode({debug})
  }
}
const consumer = adRepository => id => status => data =>
  adRepository.save({id, adResponse: {data, status}})
