import {expect} from 'chai'
import sinon from 'sinon'
import AppNexusConnector from '../../openads-appnexus/AppNexusConnector'

describe('AppNexus Connector', function () {
  const createLoggerMock = () => ({
    error: () => null,
    debug: () => null
  })
  const createAstClientMock = () => {
    const mock = {
      onEvent: () => mock,
      defineTag: () => mock,
      loadTags: () => mock,
      showTag: () => mock,
      refresh: () => mock,
      modifyTag: () => mock,
      debugMode: () => mock
    }
    return mock
  }
  const createAdRepositoryMock = ({findResult = null} = {}) => ({
    find: () => Promise.resolve().then(() => findResult),
    remove: () => Promise.resolve()
  })
  const createloggerProviderMock = () => ({
    debugMode: () => null
  })
  describe('enableDebug method', () => {
    it('Should call the logger provider with the received value', () => {
      const loggerProviderMock = createloggerProviderMock()
      const debugModeSpy = sinon.spy(loggerProviderMock, 'debugMode')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: createAstClientMock(),
        adRepository: createAdRepositoryMock(),
        loggerProvider: loggerProviderMock
      })

      appNexusConnector.enableDebug({debug: true})

      expect(debugModeSpy.calledOnce, 'debug provider should be called').to.be.true
      expect(debugModeSpy.args[0][0].debug, 'should receive the method debug value').to.be.true
    })
  })
  describe('display method', () => {
    it('Should return a promise', () => {
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: createAstClientMock(),
        adRepository: createAdRepositoryMock(),
        loggerProvider: createloggerProviderMock()
      })
      expect(appNexusConnector.display({})).to.be.a('promise')
    })
    it('Should show the received target id', (done) => {
      const astClientMock = createAstClientMock()
      const showSpy = sinon.spy(astClientMock, 'showTag')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: createAdRepositoryMock(),
        loggerProvider: createloggerProviderMock()
      })
      const givenId = 1

      appNexusConnector.display({domElementId: givenId})
        .then(() => {
          expect(showSpy.calledOnce, 'should have called the show method').to.be.true
          expect(showSpy.args[0][0].targetId, 'should receive correct id').to.equal(givenId)
          done()
        })
        .catch(e => done(e))
    })
  })
  describe('loadAd method', () => {
    it('Should return a promise', () => {
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: createAstClientMock(),
        adRepository: createAdRepositoryMock(),
        loggerProvider: createloggerProviderMock()
      })
      expect(appNexusConnector.loadAd({})).to.be.a('promise')
    })
    it('Should define a tag, register callback events, load the tag and resolve with an Ad response if it is found in repository', (done) => {
      const astClientMock = createAstClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })
      const defineTagSpy = sinon.spy(astClientMock, 'defineTag')
      const onEventSpy = sinon.spy(astClientMock, 'onEvent')
      const loadTagsSpy = sinon.spy(astClientMock, 'loadTags')
      const findSpy = sinon.spy(adRepositoryMock, 'find')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })
      const givenParameters = {
        domElementId: 1,
        placement: 2,
        sizes: [[3, 4]],
        segmentation: {a: 5},
        native: {b: 6}
      }

      appNexusConnector.loadAd(givenParameters)
        .then(() => {
          const expectedDefineTagParameters = {
            member: appNexusConnector.member,
            targetId: 1,
            invCode: 2,
            sizes: [[3, 4]],
            keywords: {a: 5},
            native: {b: 6}
          }
          expect(defineTagSpy.calledOnce, 'should have defined the tag').to.be.true
          expect(defineTagSpy.args[0][0], 'should have defined the tag with valid parameters').to.deep.equal(expectedDefineTagParameters)
          expect(onEventSpy.callCount, 'should have registered 5 events').to.equal(5)
          expect(loadTagsSpy.calledOnce, 'should have loaded the tag').to.be.true
          expect(findSpy.calledOnce, 'should have found the Ad in the repository').to.be.true
          expect(findSpy.args[0][0], 'should have found the Ad in the repository with valid parameters').to.deep.equal({id: givenParameters.domElementId})
          done()
        })
        .catch(e => done(e))
    })
    it('Should reject if the Ad repository rejects while waiting for a response', (done) => {
      const adRepositoryMock = createAdRepositoryMock({
        findResult: Promise.reject(new Error('whatever'))
      })
      const findSpy = sinon.spy(adRepositoryMock, 'find')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: createAstClientMock(),
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })
      const givenParameters = {
        domElementId: 1,
        placement: 2,
        sizes: [[3, 4]],
        segmentation: {a: 5},
        native: {b: 6}
      }
      appNexusConnector.loadAd(givenParameters)
        .then(() => {
          done(new Error('should have rejected'))
        })
        .catch(() => {
          expect(findSpy.calledOnce, 'should have found the Ad in the repository').to.be.true
          expect(findSpy.args[0][0], 'should have found the Ad in the repository with valid parameters').to.deep.equal({id: givenParameters.domElementId})
          done()
        })
        .catch(e => done(e))
    })
  })
  describe('refresh method', () => {
    it('Should return a promise', () => {
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: createAstClientMock(),
        adRepository: createAdRepositoryMock(),
        loggerProvider: createloggerProviderMock()
      })
      expect(appNexusConnector.refresh({})).to.be.a('promise')
    })
    it('Should remove the Ad from the repository, modify the tag, refresh the tag and wait for the Ad response if any update data is received', (done) => {
      const astClientMock = createAstClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })
      const removeSpy = sinon.spy(adRepositoryMock, 'remove')
      const findSpy = sinon.spy(adRepositoryMock, 'find')
      const modifyTagSpy = sinon.spy(astClientMock, 'modifyTag')
      const refreshSpy = sinon.spy(astClientMock, 'refresh')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })
      const givenParameters = {
        domElementId: 1,
        placement: 2,
        sizes: [[3, 4]],
        segmentation: {a: 5},
        native: {b: 6}
      }

      appNexusConnector.refresh(givenParameters)
        .then(() => {
          const modifyTagExpectedParameters = {
            targetId: givenParameters.domElementId,
            data: {
              invCode: givenParameters.placement,
              sizes: givenParameters.sizes,
              keywords: givenParameters.segmentation,
              native: givenParameters.native
            }
          }
          expect(removeSpy.calledOnce, 'should have removed the Ad from the repository').to.be.true
          expect(removeSpy.args[0][0], 'should have removed the Ad from the repository with valid parameters').to.deep.equal({id: givenParameters.domElementId})
          expect(modifyTagSpy.calledOnce, 'should have modified the tag').to.be.true
          expect(modifyTagSpy.args[0][0], 'should have modified the tag with valid parameters').to.deep.equal(modifyTagExpectedParameters)
          expect(refreshSpy.calledOnce, 'should have refreshed the tag').to.be.true
          expect(refreshSpy.args[0][0], 'should have refreshed the tag with valid parameters').to.deep.equal([givenParameters.domElementId])
          expect(findSpy.calledOnce, 'should have found the Ad in the repository').to.be.true
          expect(findSpy.args[0][0], 'should have found the Ad in the repository with valid parameters').to.deep.equal({id: givenParameters.domElementId})
          done()
        })
        .catch(e => done(e))
    })
    it('Should modify the tag only with the data received to modify, if some is received', (done) => {
      const astClientMock = createAstClientMock()
      const modifyTagSpy = sinon.spy(astClientMock, 'modifyTag')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: createAdRepositoryMock(),
        loggerProvider: createloggerProviderMock()
      })
      const givenParameters = {
        domElementId: 1,
        sizes: [[3, 4]],
      }

      appNexusConnector.refresh(givenParameters)
        .then(() => {
          const modifyTagExpectedParameters = {
            targetId: givenParameters.domElementId,
            data: {
              sizes: givenParameters.sizes
            }
          }
          expect(modifyTagSpy.calledOnce, 'should have modified the tag').to.be.true
          expect(modifyTagSpy.args[0][0], 'should have modified the tag with valid parameters').to.deep.equal(modifyTagExpectedParameters)
          done()
        })
        .catch(e => done(e))
    })
    it('Should not call to modify the tag if no data to modify is received', (done) => {
      const astClientMock = createAstClientMock()
      const modifyTagSpy = sinon.spy(astClientMock, 'modifyTag')
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: createAdRepositoryMock(),
        loggerProvider: createloggerProviderMock()
      })
      const givenParameters = {
        id: 1
      }

      appNexusConnector.refresh(givenParameters)
        .then(() => {
          expect(modifyTagSpy.called, 'should not have modified the tag').to.be.false
          done()
        })
        .catch(e => done(e))
    })
    it('Should reject if ad repository rejects returning the ad response', (done) => {
      const adRepositoryMock = createAdRepositoryMock({
        findResult: Promise.reject(new Error('rejected find result'))
      })
      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: createAstClientMock(),
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })
      const givenParameters = {
        id: 1
      }
      appNexusConnector.refresh(givenParameters)
        .then(() => {
          done(new Error('should have been rejected'))
        })
        .catch(e => {
          expect(e.message).to.equal('rejected find result')
          done()
        })
        .catch(e => done(e))
    })
  })
})
