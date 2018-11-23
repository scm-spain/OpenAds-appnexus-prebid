export default class Debouncer {
  constructor({onDebounce, debounceTimeout}) {
    this._onDebounce = onDebounce
    this._debounceTimeout = debounceTimeout
    this._debounced = []
    this._timerID = null
  }

  debounce({input}) {
    if (this._timerID !== null) clearTimeout(this._timerID)
    this._debounced.push(input)
    this._timerID = setTimeout(() => {
      this._onDebounce(this._debounced)
      this._timerID = null
      this._debounced = []
    }, this._debounceTimeout)
  }
}
