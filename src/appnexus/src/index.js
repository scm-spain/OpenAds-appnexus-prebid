import AppNexusClient from './AppNexusClient'
import AppNexusConnectorImpl from './AppNexusConnectorImpl'

const SOURCE_NAME = 'AppNexus'
const ast = AppNexusClient.build()

const appNexusConnectorFactory = source => appNexusClient => configuration => logger =>
  new AppNexusConnectorImpl({
    source: source,
    connectorData: configuration,
    appNexusClient: appNexusClient,
    logger: logger
  })

export default appNexusConnectorFactory(SOURCE_NAME)(ast)
