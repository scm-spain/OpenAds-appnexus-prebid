import LogLevel from 'loglevel'
import LogProvider from './LogProvider'
import AppNexusConnector from './AppNexusConnector'
import AstClientImpl from './AstClientImpl'
import ApnTagWrapper from './ApnTagWrapper'
import PullingAdRepository from './repository/PullingAdRepository'

export default class Container {
  constructor ({config} = {}) {
    this._config = config
    this._instances = new Map()
  }

  getInstance ({key}) {
    if (undefined === this._instances.get(key)) {
      try {
        this._instances.set(key, this['_build' + key]())
      } catch (e) {
        throw new Error(`Error creating instance: ${key}: ${e.message}`)
      }
    }
    return this._instances.get(key)
  }

  _buildAppNexusConnector () {
    return new AppNexusConnector({
      member: this._config.member,
      loggerProvider: this.getInstance({key: 'LogProvider'}),
      logger: this.getInstance({key: 'Logger'}),
      astClient: this.getInstance({key: 'AstClient'}),
      adRepository: this.getInstance({key: 'AdRepository'})
    })
  }

  _buildLogger () {
    return this.getInstance({key: 'LogProvider'}).logger({
      loggerName: 'AppNexusConnector'
    })
  }

  _buildLogProvider () {
    return new LogProvider({
      logLevel: LogLevel,
      loggerName: this._config.loggerName,
      defaultLogLevel: this._config.defaultLogLevel
    })
  }

  _buildAstClient () {
    return new AstClientImpl({
      logger: this.getInstance({key: 'Logger'}),
      apnTag: this.getInstance({key: 'ApnTag'})
    })
  }

  _buildAdRepository () {
    return new PullingAdRepository()
  }

  _buildApnTag () {
    return ApnTagWrapper.build()
  }
}
