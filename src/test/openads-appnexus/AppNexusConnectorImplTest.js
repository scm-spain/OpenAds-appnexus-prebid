
import {expect} from 'chai'
import sinon from 'sinon'
import AppNexusConnectorImpl from '../../openads-appnexus/AppNexusConnectorImpl'

describe('AppNexusConnectorImpl implementation', function () {
  describe('given valid constructor parameters', function () {
    it('should create a new instance of AppNexusConnectorImpl according to parameters', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusClientMock = {}

      const appNexusConnector = new AppNexusConnectorImpl({source, member, appNexusClientMock})
      expect(appNexusConnector.member).to.equal(3296)
    })

    it('should create a new instance of AppNexusConnectorImpl and set debug mode to true', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusClientMock = {
        'debug': false
      }
      const appNexusConnector = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })
      const mutatedAppNexusConnector = appNexusConnector.activateDebugMode()

      expect(appNexusClientMock.debug).to.be.true
      expect(mutatedAppNexusConnector).to.be.an.instanceof(AppNexusConnectorImpl)
    })

    it('should create a new instance of AppNexusConnectorImpl and push setPageOpts function to the queue', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let appNexusClientMock = {
        anq: appNexusQueue,
        setPageOpts: ({member, keywords}) => undefined
      }
      const appNexusConnector = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })
      const mutatedAppNexusConnector = appNexusConnector.setPageOpts({
        member: 3296,
        keywords: 'forlayo&minglanillas'
      })

      expect(appNexusClientMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAppNexusConnector).to.be.an.instanceof(AppNexusConnectorImpl)
    })

    it('should create a new instance of AppNexusConnectorImpl and push onEvent function to the queue', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let appNexusClientMock = {
        anq: appNexusQueue,
        onEvent: ({event, targetId, callback}) => undefined
      }
      const appNexusConnector = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })
      const mutatedAppNexusConnector = appNexusConnector.onEvent({
        callback: () => undefined,
        event: 'adAvailable',
        targetId: 'forlayoDiv'
      })

      expect(appNexusClientMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAppNexusConnector).to.be.an.instanceof(AppNexusConnectorImpl)
    })

    it('should create a new instance of AppNexusConnectorImpl and push defineTag function to the queue', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let appNexusClientMock = {
        anq: appNexusQueue,
        defineTag: ({invCode, sizes, targetId}) => undefined
      }
      const appNexusConnector = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })
      const mutatedAppNexusConnector = appNexusConnector.defineTag({
        targetId: 'forlayoDiv',
        invCode: 'lalla',
        sizes: [728, 90]
      })

      expect(appNexusClientMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAppNexusConnector).to.be.an.instanceof(AppNexusConnectorImpl)
    })
    it('should create a new instance of AppNexusConnectorImpl and push loadTags function to the queue', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let appNexusClientMock = {
        anq: appNexusQueue,
        loadTags: () => undefined
      }
      const appNexusConnector = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })
      const mutatedAppNexusConnector = appNexusConnector.loadTags()

      expect(appNexusClientMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAppNexusConnector).to.be.an.instanceof(AppNexusConnectorImpl)
    })
    it('should create a new instance of AppNexusConnectorImpl and push showTag function to the queue', function () {
      const source = 'AppNexus'
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let appNexusClientMock = {
        anq: appNexusQueue,
        showTag: ({target}) => undefined
      }
      const appNexusConnector = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })
      const mutatedAppNexusConnector = appNexusConnector.showTag({target: 'Odin'})

      expect(appNexusClientMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAppNexusConnector).to.be.an.instanceof(AppNexusConnectorImpl)
    })
  })
  describe('Given two events registered for two different targets', () => {
    beforeEach('Define the events', () => {
      this.givenEvent11 = {event: 'event1', targetId: 'target1', callback: () => null}
      this.givenEvent12 = {event: 'event1', targetId: 'target2', callback: () => null}
      this.givenEvent21 = {event: 'event2', targetId: 'target1', callback: () => null}
      this.givenEvent22 = {event: 'event2', targetId: 'target2', callback: () => null}
      this.loggerMock = {
        debug: (title, log) => null
      }
    })
    describe('Registering the events', () => {
      it('Should register the events to the appnexus client', () => {
        const appNexusQueue = {
          push: (f) => f()
        }
        const appNexusClientMock = {
          anq: appNexusQueue,
          clearRequest: () => null,
          offEvent: () => null,
          onEvent: () => null
        }
        const onEventSpy = sinon.spy(appNexusClientMock, 'onEvent')

        const appNexusConnector = new AppNexusConnectorImpl({
          appNexusClient: appNexusClientMock,
          source: {},
          connectorData: {}
        })
        appNexusConnector
          .onEvent(this.givenEvent11)
          .onEvent(this.givenEvent12)
          .onEvent(this.givenEvent21)
          .onEvent(this.givenEvent22)

        expect(onEventSpy.callCount).to.equal(4)
      })
    })
    describe('Calling the reset method', () => {
      it('Should clear the requests and the registered events', () => {
        const appNexusQueue = {
          push: (f) => f()
        }
        const appNexusClientMock = {
          anq: appNexusQueue,
          clearRequest: () => null,
          offEvent: () => null,
          onEvent: () => null
        }
        const offEventSpy = sinon.spy(appNexusClientMock, 'offEvent')

        const appNexusConnector = new AppNexusConnectorImpl({
          appNexusClient: appNexusClientMock,
          source: '',
          member: 0
        })
        appNexusConnector
          .onEvent(this.givenEvent11)
          .onEvent(this.givenEvent12)
          .onEvent(this.givenEvent21)
          .onEvent(this.givenEvent22)
          .reset()

        expect(offEventSpy.callCount).to.equal(4)
      })
    })
  })
  describe('Given an AppNexusConnector with an AppNexusClient', () => {
    it('Should call client methods', () => {
      const source = ''
      const member = 0
      const appNexusQueue = {
        push: (f) => f()
      }
      const appNexusClientMock = {
        anq: appNexusQueue,
        setPageOpts: () => null,
        defineTag: () => null,
        loadTags: () => null,
        showTag: () => null,
        refresh: () => null,
        modifyTag: () => null
      }
      const setPageOptsSpy = sinon.spy(appNexusClientMock, 'setPageOpts')
      const defineTagSpy = sinon.spy(appNexusClientMock, 'defineTag')
      const loadTagsSpy = sinon.spy(appNexusClientMock, 'loadTags')
      const showTagSpy = sinon.spy(appNexusClientMock, 'showTag')
      const modifyTagSpy = sinon.spy(appNexusClientMock, 'modifyTag')
      const refreshSpy = sinon.spy(appNexusClientMock, 'refresh')

      const appNexusConnectorImpl = new AppNexusConnectorImpl({
        source,
        member,
        appNexusClient: appNexusClientMock
      })

      const givenPageOpts = {member: 1111, keywords: {p1: 'pv1'}}
      const givenDefineTag = {member: 2222, targetId: 'Ad1', invCode: 'inv1', sizes: [[1, 1]], keywords: {p2: 'pv2'}, native: {}}
      const givenShowTag = {target: 'Ad1'}
      const givenModifyTag = {targetId: 'Ad1', data: {member: 2223, invCode: 'inv2', sizes: [[1, 1]], keywords: {p3: 'pv3'}, native: {}}}
      const givenRefresh = ['Ad1', 'Ad2']
      appNexusConnectorImpl
        .setPageOpts(givenPageOpts)
        .defineTag(givenDefineTag)
        .loadTags()
        .showTag(givenShowTag)
        .modifyTag(givenModifyTag)
        .refresh(givenRefresh)

      expect(setPageOptsSpy.called).to.be.true
      expect(defineTagSpy.called).to.be.true
      expect(loadTagsSpy.called).to.be.true
      expect(showTagSpy.called).to.be.true
      expect(modifyTagSpy.called).to.be.true
      expect(refreshSpy.called).to.be.true
      expect(setPageOptsSpy.lastCall.args[0]).to.deep.equal(givenPageOpts)
      expect(defineTagSpy.lastCall.args[0]).to.deep.equal(givenDefineTag)
      expect(showTagSpy.lastCall.args[0]).to.deep.equal(givenShowTag.target)
      expect(modifyTagSpy.lastCall.args[0]).to.deep.equal(givenModifyTag.targetId)
      expect(modifyTagSpy.lastCall.args[1]).to.deep.equal(givenModifyTag.data)
      expect(refreshSpy.lastCall.args[0]).to.deep.equal(givenRefresh)
    })
  })
})
