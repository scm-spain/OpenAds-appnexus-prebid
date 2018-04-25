import AppNexusClient from './AppNexusClient'
import AppNexusConnectorImpl from './AppNexusConnectorImpl'
import {AD_AVAILABLE, AD_BAD_REQUEST, AD_ERROR, AD_NO_BID, AD_REQUEST_FAILURE} from './event/events'
import PullingAdRepository from './repository/PullingAdRepository'

/**
 * @class
 * @implements {AdLoadable}
 * @implements {AdViewable}
 */
export default class AdConnector {
  constructor ({configuration, logger}) {
    this._appNexusConnectorImpl = new AppNexusConnectorImpl({
      source: SOURCE_NAME,
      connectorData: configuration,
      appNexusClient: AppNexusClient.build(),
      logger: logger
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
  refresh ({ids}) {
    return Promise.resolve()
      .then(() => this._pullingAdRepository.remove({ids}))
      .then(() => this._appNexusConnectorImpl.refresh(ids))
      .then(null)
  }
}
const SOURCE_NAME = 'AppNexus'
const consumer = pullingAdRepository => id => status => data =>
  pullingAdRepository.save({id, adResponse: {data, status}})
