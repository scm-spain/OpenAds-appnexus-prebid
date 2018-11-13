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
   */
  requestBids({requestObj}) {
    throw new Error('AppNexusConnector#requestBids must be implemented')
  }

  /**
   * Defines setTargetForAst. Set query string targeting on all AST ad units
   */
  setTargetngForAst() {
    throw new Error('AppNexusConnector#setTargetForAst must be implemented')
  }
}
