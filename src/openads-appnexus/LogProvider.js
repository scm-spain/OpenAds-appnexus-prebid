export default class LogProvider {
  /**
   *
   * @param {Logger} Logger instance
   */
  constructor ({logLevel, loggerName = 'AppNexusConnector', defaultLogLevel = 'error'} = {}) {
    this._logLevel = logLevel
    this._loggerName = loggerName
    this._defaultLogLevel = defaultLogLevel
  }

  logger () {
    const loggerInstance = this._logLevel.getLogger(this._loggerName)
    loggerInstance.setLevel(this._defaultLogLevel)
    return loggerInstance
  }

  debugMode ({debug}) {
    const loggerInstance = this._logLevel.getLogger(this._loggerName)
    loggerInstance.setLevel(debug === true ? 'debug' : 'error')
  }
}
