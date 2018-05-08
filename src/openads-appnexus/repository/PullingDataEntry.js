export default class PullingDataEntry {
  constructor ({id, data}) {
    this._id = id
    this._data = data
  }
  get data () {
    return this._data
  }
  get id () {
    return this._id
  }
  updateInterval (interval) {
    if (this._interval) {
      clearInterval(this._interval)
    }
    this._interval = interval
  }
  removeInterval () {
    if (this._interval) {
      clearInterval(this._interval)
    }
  }
  updateData (data) {
    this._data = data
  }
}
