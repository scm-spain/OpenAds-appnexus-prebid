import LogLevel from 'loglevel'
import LogProvider from './LogProvider'
import AppNexusConnector from './AppNexusConnector'
import AstClientImpl from './AstClientImpl'
import AdListenerRepository from './repository/AdListenerRepository'
import PrebidClientImpl from './PrebidClientImpl'

export default class Container {
  constructor({config} = {}) {
    this._config = config
    this._instances = new Map()
  }

  getInstance({key}) {
    if (undefined === this._instances.get(key)) {
      try {
        this._instances.set(key, this['_build' + key]())
      } catch (e) {
        throw new Error(`Error creating instance: ${key}: ${e.message}`)
      }
    }
    return this._instances.get(key)
  }

  _buildAppNexusConnector() {
    return new AppNexusConnector({
      pageOpts: this._config.pageOpts,
      prebidConfig: this._config.prebidConfig,
      loggerProvider: this.getInstance({key: 'LogProvider'}),
      logger: this.getInstance({key: 'Logger'}),
      astClient: this.getInstance({key: 'AstClient'}),
      adRepository: this.getInstance({key: 'AdRepository'}),
      prebidClient: this.getInstance({key: 'PrebidClient'})
    })
  }

  _buildLogger() {
    return this.getInstance({key: 'LogProvider'}).logger({
      loggerName: 'AppNexusConnector'
    })
  }

  _buildLogProvider() {
    return new LogProvider({
      logLevel: LogLevel,
      loggerName: this._config.loggerName,
      defaultLogLevel: this._config.defaultLogLevel
    })
  }

  _buildAstClient() {
    return new AstClientImpl({
      window,
      logger: this.getInstance({key: 'Logger'})
    })
  }

  _buildAdRepository() {
    return new AdListenerRepository({
      dom: window.document
    })
  }

  _buildPrebidClient() {
    return new PrebidClientImpl({
      window,
      logger: this.getInstance({key: 'Logger'})
    })
  }
}
