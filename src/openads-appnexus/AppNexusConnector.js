import {AD_AVAILABLE, AD_BAD_REQUEST, AD_ERROR, AD_NO_BID, AD_REQUEST_FAILURE} from './event/events'

/**
 * @class
 * @implements {AdLoadable}
 * @implements {AdViewable}
 * @implements {Logger}
 */
export default class AppNexusConnector {
  constructor ({member, logger, astClient, adRepository, loggerProvider}) {
    this._member = member
    this._logger = logger
    this._astClient = astClient
    this._adRepository = adRepository
    this._loggerProvider = loggerProvider
  }

  get member () {
    return this._member
  }

  display ({id}) {
    return Promise.resolve()
      .then(() => this._astClient.showTag({targetId: id}))
      .then(null)
  }

  loadAd ({domElementId, placement, sizes, segmentation, native}) {
    return Promise.resolve()
      .then(() => this._astClient
        .defineTag({
          member: this._member,
          targetId: domElementId,
          invCode: placement,
          sizes: sizes,
          keywords: segmentation,
          native: native
        }))
      .then(astClient => astClient.onEvent({
        event: AD_AVAILABLE,
        targetId: domElementId,
        callback: consumer(this._adRepository)(domElementId)(AD_AVAILABLE)
      }))
      .then(astClient => astClient.onEvent({
        event: AD_BAD_REQUEST,
        targetId: domElementId,
        callback: consumer(this._adRepository)(domElementId)(AD_BAD_REQUEST)
      }))
      .then(astClient => astClient.onEvent({
        event: AD_ERROR,
        targetId: domElementId,
        callback: consumer(this._adRepository)(domElementId)(AD_ERROR)
      }))
      .then(astClient => astClient.onEvent({
        event: AD_NO_BID,
        targetId: domElementId,
        callback: consumer(this._adRepository)(domElementId)(AD_NO_BID)
      }))
      .then(astClient => astClient.onEvent({
        event: AD_REQUEST_FAILURE,
        targetId: domElementId,
        callback: consumer(this._adRepository)(domElementId)(AD_REQUEST_FAILURE)
      }))
      .then(astClient => astClient.loadTags())
      .then(() => this._adRepository.find({id: domElementId}))
  }

  refresh ({id, placement, sizes, segmentation, native}) {
    return Promise.resolve()
      .then(() => this._adRepository.remove({id}))
      .then(() => {
        let updateData = (placement || sizes || segmentation || native) && {}
        if (updateData) {
          if (placement) updateData.invCode = placement
          if (sizes) updateData.sizes = sizes
          if (segmentation) updateData.keywords = segmentation
          if (native) updateData.native = native
          this._astClient.modifyTag({
            targetId: id,
            data: updateData
          })
        }
      })
      .then(() => this._astClient.refresh([id]))
      .then(() => this._adRepository.find({id}))
  }

  enableDebug ({debug}) {
    this._astClient.debugMode({debug})
    this._loggerProvider.debugMode({debug})
  }
}
const consumer = adRepository => id => status => data =>
  adRepository.save({id, adResponse: {data, status}})
