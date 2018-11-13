const bidsBackHandlerCallback = bidResponses =>
  this._astClient.push(() => {
    this._prebidClient.setTargetingForAst()
    this._astClient.loadTags()
  })

export default bidsBackHandlerCallback
