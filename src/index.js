import AppNexusClient from './openads-appnexus/AppNexusClient'
import AppNexusConnectorImpl from './openads-appnexus/AppNexusConnectorImpl'
import {AD_AVAILABLE, AD_BAD_REQUEST, AD_ERROR, AD_NO_BID, AD_REQUEST_FAILURE} from './openads-appnexus/event/events'
import PullingAdRepository from './openads-appnexus/repository/PullingAdRepository'

/**
 * @class
 * @implements {AdLoadable}
 * @implements {AdViewable}
 * @implements {AdConnectorIdentifier}
 */
export default class AdConnector {
  constructor ({source, member}) {
    this._appNexusConnectorImpl = new AppNexusConnectorImpl({
      source: source,
      member: member,
      appNexusClient: AppNexusClient.build()
    })
    this._pullingAdRepository = new PullingAdRepository()
  }

  display ({id}) {
    return Promise.resolve()
      .then(() => this._appNexusConnectorImpl.showTag({target: id}))
      .then(null)
  }

  loadAd ({domElementId, placement, sizes, segmentation, native}) {
    return Promise.resolve()
      .then(() => this._appNexusConnectorImpl
        .defineTag({
          member: this._appNexusConnectorImpl.configuration.member,
          targetId: domElementId,
          invCode: placement,
          sizes: sizes,
          keywords: segmentation,
          native: native
        }))
      .then(appNexusConnectorImpl => appNexusConnectorImpl.onEvent({
        event: AD_AVAILABLE,
        targetId: domElementId,
        callback: consumer(this._pullingAdRepository)(domElementId)(AD_AVAILABLE)
      }))
      .then(appNexusConnectorImpl => appNexusConnectorImpl.onEvent({
        event: AD_BAD_REQUEST,
        targetId: domElementId,
        callback: consumer(this._pullingAdRepository)(domElementId)(AD_BAD_REQUEST)
      }))
      .then(appNexusConnectorImpl => appNexusConnectorImpl.onEvent({
        event: AD_ERROR,
        targetId: domElementId,
        callback: consumer(this._pullingAdRepository)(domElementId)(AD_ERROR)
      }))
      .then(appNexusConnectorImpl => appNexusConnectorImpl.onEvent({
        event: AD_NO_BID,
        targetId: domElementId,
        callback: consumer(this._pullingAdRepository)(domElementId)(AD_NO_BID)
      }))
      .then(appNexusConnectorImpl => appNexusConnectorImpl.onEvent({
        event: AD_REQUEST_FAILURE,
        targetId: domElementId,
        callback: consumer(this._pullingAdRepository)(domElementId)(AD_REQUEST_FAILURE)
      }))
      .then(appNexusConnectorImpl => appNexusConnectorImpl.loadTags())
      .then(() => this._pullingAdRepository.find({id: domElementId}))
  }
  refresh ({id, segmentation}) {
    return Promise.resolve()
      .then(() => this._pullingAdRepository.remove({id}))
      .then(() => {
        if (segmentation) {
          this._appNexusConnectorImpl.modifyTag({
            targetId: id,
            data: {
              invCode: segmentation.placement,
              sizes: segmentation.sizes,
              keywords: segmentation.keywords
            }
          })
        }
      })
      .then(() => this._appNexusConnectorImpl.refresh([id]))
      .then(() => this._pullingAdRepository.find({id}))
  }

  id () {
    return this._appNexusConnectorImpl.source
  }
}
const consumer = pullingAdRepository => id => status => data =>
  pullingAdRepository.save({id, adResponse: {data, status}})
