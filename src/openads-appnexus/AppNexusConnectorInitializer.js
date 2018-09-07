import Container from './Container'

export default class AppNexusConnectorInitializer {
  static init({config}) {
    const container = new Container({config})
    return container.getInstance({key: 'AppNexusConnector'})
  }
}
