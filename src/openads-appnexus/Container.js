import LogLevel from 'loglevel'
import LogProvider from './LogProvider'
import AppNexusConnector from './AppNexusConnector'
import AstClientImpl from './AstClientImpl'
import ApnTagWrapper from './ApnTagWrapper'
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
      loggerProvider: this.getInstance({key: 'LogProvider'}),
      logger: this.getInstance({key: 'Logger'}),
      astClient: this.getInstance({key: 'AstClient'}),
      adRepository: this.getInstance({key: 'AdRepository'}),
      prebidClient: this.getInstance(({key: 'PrebidClient'}))
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
      logger: this.getInstance({key: 'Logger'}),
      apnTag: this.getInstance({key: 'ApnTag'})
    })
  }

  _buildAdRepository() {
    return new AdListenerRepository({
      dom: window.document
    })
  }

  _buildApnTag() {
    return ApnTagWrapper.build()
  }

  _buildPrebidClient() {
    return new PrebidClientImpl({
      pbjs: this.getInstance({key: 'pbjs'})
    })
  }

  _buildPbjs() {
    return // Instance from the outside
  }
}
