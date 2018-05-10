import {expect} from 'chai'
import sinon from 'sinon'
import AstClientImpl from '../../openads-appnexus/AstClientImpl'

describe('AstClient implementation', function () {
  const createLoggerMock = () => ({
    error: () => null,
    debug: () => null
  })
  const createApnTagMock = () => ({
    anq: {
      push: (func) => func()
    },
    debug: false,
    setPageOpts: () => null,
    onEvent: () => null,
    defineTag: () => null,
    loadTags: () => null,
    modifyTag: () => null
  })
  describe('debugMode method', function () {
    it('should update the apntag debug value to the given value', function () {
      const apnTagMock = createApnTagMock()
      const astClient = new AstClientImpl({apnTag: apnTagMock})
      astClient.debugMode({enabled: true})
      expect(apnTagMock.debug, 'debug value should have been updated').to.be.true
    })
  })
  describe('onEvent method', function () {
    it('should call the apntag onEvent method via anq', function () {
      const loggerMock = createLoggerMock()
      const apnTagMock = createApnTagMock()
      const onEventSpy = sinon.spy(apnTagMock, 'onEvent')
      const anqSpy = sinon.spy(apnTagMock.anq, 'push')
      const astClient = new AstClientImpl({apnTag: apnTagMock, logger: loggerMock})
      const givenParameters = {
        targetId: 'id',
        event: 'THE_EVENT',
        callback: () => null
      }
      astClient.onEvent(givenParameters)
      expect(anqSpy.calledOnce, 'anq shoud have been called').to.be.true
      expect(onEventSpy.calledOnce, 'onEvent shoud have been called').to.be.true
      expect(onEventSpy.args[0], 'apntag onEvent should receive the parameters in order').to.deep.equal([givenParameters.event, givenParameters.targetId, givenParameters.callback])
    })
  })
  describe('defineTag method', function () {
    it('should call the apntag defineTag method via anq', function () {
      const loggerMock = createLoggerMock()
      const apnTagMock = createApnTagMock()
      const defineTagSpy = sinon.spy(apnTagMock, 'defineTag')
      const anqSpy = sinon.spy(apnTagMock.anq, 'push')
      const astClient = new AstClientImpl({apnTag: apnTagMock, logger: loggerMock})
      const givenParameters = {
        targetId: 'id',
        event: 'THE_EVENT',
        callback: () => null
      }
      astClient.onEvent(givenParameters)
      expect(anqSpy.calledOnce, 'anq shoud have been called').to.be.true
      expect(defineTagSpy.calledOnce, 'defineTag shoud have been called').to.be.true
      expect(defineTagSpy.args[0], 'apntag defineTag should receive the parameters in order').to.deep.equal([givenParameters.event, givenParameters.targetId, givenParameters.callback])
    })
  })
  describe('loadTags method', function () {
    it('should call the apntag loadTags method via anq', function () {
      const loggerMock = createLoggerMock()
      const apnTagMock = createApnTagMock()
      const loadTagsSpy = sinon.spy(apnTagMock, 'loadTags')
      const anqSpy = sinon.spy(apnTagMock.anq, 'push')
      const astClient = new AstClientImpl({apnTag: apnTagMock, logger: loggerMock})
      astClient.loadTags()
      expect(anqSpy.calledOnce, 'anq shoud have been called').to.be.true
      expect(loadTagsSpy.calledOnce, 'loadTags shoud have been called').to.be.true
    })
  })
  describe('loadTags method', function () {
    it('should call the apntag loadTags method via anq', function () {
      const loggerMock = createLoggerMock()
      const apnTagMock = createApnTagMock()
      const loadTagsSpy = sinon.spy(apnTagMock, 'loadTags')
      const anqSpy = sinon.spy(apnTagMock.anq, 'push')
      const astClient = new AstClientImpl({apnTag: apnTagMock, logger: loggerMock})
      astClient.loadTags()
      expect(anqSpy.calledOnce, 'anq shoud have been called').to.be.true
      expect(loadTagsSpy.calledOnce, 'loadTags shoud have been called').to.be.true
    })
  })
})
