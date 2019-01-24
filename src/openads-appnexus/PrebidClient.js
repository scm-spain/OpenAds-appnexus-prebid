/**
 * @interface
 */
export default class PrebidClient {
  /**
   * Defines addAdUnits. Takes one ad unit object or an array of ad unit objects and adds them to the Prebid auction
   * @param units
   */
  addAdUnits({adUnits}) {
    throw new Error('AppNexusConnector#addUnits must be implemented')
  }

  /**
   * Defines requestBids
   * @param requestObj
   * @param requestObj.adUnits
   * @param requestObj.timeout
   * @param requestObj.bidsBackHandler
   * @param requestObj.adUnitCodes
   * @param requestObj.labels
   */
  requestBids(requestObj) {
    throw new Error('AppNexusConnector#requestBids must be implemented')
  }

  /**
   * Defines setTargetForAst. Set query string targeting on all AST ad units
   */
  setTargetngForAst() {
    throw new Error('AppNexusConnector#setTargetForAst must be implemented')
  }

  /**
   * Defines setConfig.
   * @param config
   */
  setConfig({config}) {
    throw new Error('AppNexusConnector#setConfig must be implemented')
  }
}
