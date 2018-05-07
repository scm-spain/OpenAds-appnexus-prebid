/**
 * @interface
 */
export default class AdConnectorIdentifier {
  /**
   * Returns unique identifier of the connector to be used as source when position is created
   */
  id () {
    throw new Error('AdConnectorIdentifier#id must be implemented')
  }
}
