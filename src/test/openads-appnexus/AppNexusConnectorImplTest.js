
import {expect} from 'chai'
import sinon from 'sinon'
import AstClientImpl from '../../openads-appnexus/AstClientImpl'

describe('AstClient implementation', function () {
  describe('given valid constructor parameters', function () {
    it('should create a new instance of AstClientImpl according to parameters', function () {
      const member = 3296
      let astWrapperMock = {}

      const astClient = new AstClientImpl({member, astWrapper: astWrapperMock})
      expect(astClient.member).to.equal(3296)
    })

    it('should create a new instance of AstClientImpl and set debug mode to true', function () {
      const member = 3296
      let astWrapperMock = {
        'debug': false
      }
      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })
      const mutatedAstClient = astClient.debugMode({enabled: true})

      expect(astWrapperMock.debug).to.be.true
      expect(mutatedAstClient).to.be.an.instanceof(AstClientImpl)
    })

    it('should create a new instance of AstClientImpl and push setPageOpts function to the queue', function () {
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let astWrapperMock = {
        anq: appNexusQueue,
        setPageOpts: ({member, keywords}) => undefined
      }
      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })
      const mutatedAstClient = astClient.setPageOpts({
        member: 3296,
        keywords: 'forlayo&minglanillas'
      })

      expect(astWrapperMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAstClient).to.be.an.instanceof(AstClientImpl)
    })

    it('should create a new instance of AstClientImpl and push onEvent function to the queue', function () {
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let astWrapperMock = {
        anq: appNexusQueue,
        onEvent: ({event, targetId, callback}) => undefined
      }
      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })
      const mutatedAstClient = astClient.onEvent({
        callback: () => undefined,
        event: 'adAvailable',
        targetId: 'forlayoDiv'
      })

      expect(astWrapperMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAstClient).to.be.an.instanceof(AstClientImpl)
    })

    it('should create a new instance of AstClientImpl and push defineTag function to the queue', function () {
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let astWrapperMock = {
        anq: appNexusQueue,
        defineTag: ({invCode, sizes, targetId}) => undefined
      }
      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })
      const mutatedAstClient = astClient.defineTag({
        targetId: 'forlayoDiv',
        invCode: 'lalla',
        sizes: [728, 90]
      })

      expect(astWrapperMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAstClient).to.be.an.instanceof(AstClientImpl)
    })
    it('should create a new instance of AstClientImpl and push loadTags function to the queue', function () {
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let astWrapperMock = {
        anq: appNexusQueue,
        loadTags: () => undefined
      }
      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })
      const mutatedAstClient = astClient.loadTags()

      expect(astWrapperMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAstClient).to.be.an.instanceof(AstClientImpl)
    })
    it('should create a new instance of AstClientImpl and push showTag function to the queue', function () {
      const member = 3296
      let appNexusQueue = []
      const qSpy = sinon.spy(appNexusQueue, 'push')
      let astWrapperMock = {
        anq: appNexusQueue,
        showTag: ({target}) => undefined
      }
      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })
      const mutatedAstClient = astClient.showTag({target: 'Odin'})

      expect(astWrapperMock.anq).to.have.lengthOf(1)
      expect(qSpy.called).to.be.true
      expect(mutatedAstClient).to.be.an.instanceof(AstClientImpl)
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
        const astWrapperMock = {
          anq: appNexusQueue,
          clearRequest: () => null,
          offEvent: () => null,
          onEvent: () => null
        }
        const onEventSpy = sinon.spy(astWrapperMock, 'onEvent')

        const astClient = new AstClientImpl({
          astWrapper: astWrapperMock,
          connectorData: {}
        })
        astClient
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
        const astWrapperMock = {
          anq: appNexusQueue,
          clearRequest: () => null,
          offEvent: () => null,
          onEvent: () => null
        }
        const offEventSpy = sinon.spy(astWrapperMock, 'offEvent')

        const astClient = new AstClientImpl({
          astWrapper: astWrapperMock,
          member: 0
        })
        astClient
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
      const member = 0
      const appNexusQueue = {
        push: (f) => f()
      }
      const astWrapperMock = {
        anq: appNexusQueue,
        setPageOpts: () => null,
        defineTag: () => null,
        loadTags: () => null,
        showTag: () => null,
        refresh: () => null,
        modifyTag: () => null
      }
      const setPageOptsSpy = sinon.spy(astWrapperMock, 'setPageOpts')
      const defineTagSpy = sinon.spy(astWrapperMock, 'defineTag')
      const loadTagsSpy = sinon.spy(astWrapperMock, 'loadTags')
      const showTagSpy = sinon.spy(astWrapperMock, 'showTag')
      const modifyTagSpy = sinon.spy(astWrapperMock, 'modifyTag')
      const refreshSpy = sinon.spy(astWrapperMock, 'refresh')

      const astClient = new AstClientImpl({
        member,
        astWrapper: astWrapperMock
      })

      const givenPageOpts = {member: 1111, keywords: {p1: 'pv1'}}
      const givenDefineTag = {member: 2222, targetId: 'Ad1', invCode: 'inv1', sizes: [[1, 1]], keywords: {p2: 'pv2'}, native: {}}
      const givenShowTag = {target: 'Ad1'}
      const givenModifyTag = {targetId: 'Ad1', data: {member: 2223, invCode: 'inv2', sizes: [[1, 1]], keywords: {p3: 'pv3'}, native: {}}}
      const givenRefresh = ['Ad1', 'Ad2']
      astClient
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
