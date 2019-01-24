/* eslint-disable no-console */

import {
  AD_AVAILABLE,
  AD_BAD_REQUEST,
  AD_ERROR,
  AD_NO_BID,
  AD_REQUEST_FAILURE
} from './event/events'

import {TIMEOUT_DEBOUNCE, TIMEOUT_PREBID} from './timeout/timeout'
import Debouncer from './service/Debouncer'

/**
 * @class
 * @implements {AdLoadable}
 * @implements {AdViewable}
 * @implements {Logger}
 */
export default class AppNexusConnector {
  constructor({
    pageOpts,
    prebidConfig,
    logger,
    astClient,
    adRepository,
    loggerProvider,
    prebidClient
  }) {
    this._logger = logger
    this._astClient = astClient
    this._adRepository = adRepository
    this._loggerProvider = loggerProvider
    this._prebidClient = prebidClient
    this._pageOpts = pageOpts
    this._prebidConfig = prebidConfig
    if (this._pageOpts) this._astClient.setPageOpts(this._pageOpts)
    this._loadAdDebouncer = new Debouncer({
      onDebounce: this._onLoadAdDebounce.bind(this),
      debounceTimeout: TIMEOUT_DEBOUNCE
    })
    this._refreshDebouncer = new Debouncer({
      onDebounce: this._onRefreshDebounce.bind(this),
      debounceTimeout: TIMEOUT_DEBOUNCE
    })
  }

  get pageOpts() {
    return this._pageOpts
  }

  loadAd({id, specification}) {
    this._logger.debug(
      this._logger.name,
      '| loadAd | id:',
      id,
      '| specification:',
      specification
    )
    return Promise.resolve()
      .then(() => this._adRepository.remove({id: id}))
      .then(() => this._loadAdDebouncer.debounce({input: {id, specification}}))
      .then(() => this._adRepository.find({id: id}))
  }

  display({id}) {
    this._logger.debug(this._logger.name, '| display | id:', id)
    return Promise.resolve()
      .then(() => this._astClient.showTag({targetId: id}))
      .then(null)
  }

  refresh({id, specification}) {
    this._logger.debug(
      this._logger.name,
      '| refresh | id:',
      id,
      '| specification:',
      specification
    )
    return Promise.resolve()
      .then(() => this._adRepository.remove({id: id}))
      .then(() => this._refreshDebouncer.debounce({input: {id, specification}}))
      .then(() => this._adRepository.find({id: id}))
  }

  /**
   * @param {object} inputArray
   * @returns {Promise<{appnexusInputsArray: Array, prebidUnitsArray: Array} | never | void>}
   * @private
   */
  _onLoadAdDebounce(loadAdInputs) {
    this._logger.debug(
      this._logger.name,
      '| _onLoadAdDebounce | loadAdInputs:',
      loadAdInputs
    )
    return Promise.resolve(loadAdInputs)
      .then(this._buildNormalizedInputs)
      .then(normalizedInputs => {
        this._logger.debug(
          this._logger.name,
          '| _onLoadAdDebounce | normalizedInputs:',
          normalizedInputs
        )
        normalizedInputs.tags.forEach(input =>
          this._defineAppNexusTag({id: input.id, tag: input.data})
        )
        if (normalizedInputs.adUnits.length > 0 && this._prebidClient) {
          this._prebidClient.addAdUnits({adUnits: normalizedInputs.adUnits})

          if (this._prebidConfig && this._prebidConfig.core)
            this._prebidClient.setConfig(this._prebidConfig.core)

          this._prebidClient.requestBids({
            timeout: TIMEOUT_PREBID,
            bidsBackHandler: () => {
              this._prebidClient.setTargetingForAst()
              this._astClient.loadTags()
            }
          })

          if (this._prebidConfig && this._prebidConfig.bidderSettings)
            this._prebidClient.setBidderSettings(
              this._prebidConfig.bidderSettings
            )
        } else {
          this._astClient.loadTags()
        }
      })
      .catch(error => console.log(error))
  }

  _onRefreshDebounce(refreshInputs) {
    this._logger.debug(
      this._logger.name,
      '| _onRefreshDebounce | refreshInputs:',
      refreshInputs
    )
    return Promise.resolve(refreshInputs)
      .then(this._buildNormalizedInputs)
      .then(normalizedInputs => {
        normalizedInputs.tags.forEach(tag =>
          this._astClient.modifyTag({
            targetId: tag.id,
            data: tag.data
          })
        )
        if (normalizedInputs.adUnits.length > 0) {
          this._prebidClient.requestBids({
            adUnits: normalizedInputs.adUnits,
            timeout: TIMEOUT_PREBID,
            bidsBackHandler: () => {
              this._prebidClient.setTargetingForAst()
              this._astClient.refresh(
                normalizedInputs.tags.map(input => input.id)
              )
            }
          })
        } else {
          this._astClient.refresh(normalizedInputs.tags.map(input => input.id))
        }
      })
  }

  _buildNormalizedInputs(inputs) {
    const formattedArray = {
      tags: [],
      adUnits: []
    }

    formattedArray.tags = inputs.map(input => ({
      id: input.id,
      data: input.specification.appnexus
    }))

    formattedArray.adUnits = inputs
      .filter(maybePrebidInput => maybePrebidInput.specification.prebid)
      .map(prebidInput => prebidInput.specification.prebid)

    return formattedArray
  }

  _defineAppNexusTag({id, tag}) {
    this._logger.debug(
      this._logger.name,
      '| _defineAppNexusTag | id:',
      id,
      '| tag:',
      tag
    )
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

  enableDebug({debug}) {
    this._astClient.debugMode({debug})
    this._loggerProvider.debugMode({debug})
  }
}
const consumer = adRepository => id => status => data =>
  adRepository.save({id, adResponse: {data, status}})
