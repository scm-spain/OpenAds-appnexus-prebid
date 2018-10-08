/**
 * @interface
 */
export default class AstClient {
  /**
   * Activates or deactivates the Debug mode.
   */
  debugMode({enabled}) {
    throw new Error('AppNexusConnector#debugMode must be implemented')
  }

  /**
   * Defines onEvent
   * @param event
   * @param targetId
   * @param callback
   */
  onEvent({event, targetId, callback}) {
    throw new Error('AppNexusConnector#onEvent must be implemented')
  }

  /**
   * Method to define tags.
   * @param member
   * @param targetId
   * @param invCode
   * @param sizes
   * @param keywords
   * @param native
   */
  defineTag({member, targetId, invCode, sizes, keywords, native}) {
    throw new Error('AppNexusConnector#defineTag must be implemented')
  }

  /**
   * Load tags.
   */
  loadTags() {
    throw new Error('AppNexusConnector#loadTags must be implemented')
  }

  /**
   * Shows tags in the target.
   * @param targetId
   */
  showTag({targetId}) {
    throw new Error('AppNexusConnector#showTag must be implemented')
  }

  /**
   * Refreshes ads on the page.
   * @param targetsArray : an array of ids
   */
  refresh(targetsArray) {
    throw new Error('AppNexusConnector#refresh must be implemented')
  }

  /**
   * Updates tag information.
   * @param targetId : an array of ids
   * @param data : the data to update
   * @param data.member
   * @param data.invCode
   * @param data.sizes
   * @param data.keywords
   * @param data.native
   */
  modifyTag({targetId, data}) {
    throw new Error('AppNexusConnector#modifyTag must be implemented')
  }
}
