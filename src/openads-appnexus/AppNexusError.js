export default class AppNexusError extends Error {
  constructor({cause, status, position}) {
    super()
    this.message = `Some error ocurred in appnexus with position id: ${position} `
    this.name = 'AppNexusError'
    this.status = status
    this.cause = cause
    this.stack = new Error().stack
  }
}
