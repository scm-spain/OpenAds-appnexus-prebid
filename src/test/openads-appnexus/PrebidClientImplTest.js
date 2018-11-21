import {expect} from 'chai'
import sinon from 'sinon'
import PrebidClientImpl from '../../openads-appnexus/PrebidClientImpl'
import {TIMEOUT_PREBID} from '../../openads-appnexus/timeout/timeout'

describe('PrebidClientImpl Test', () => {
  const createLoggerMock = () => ({
    error: () => null,
    debug: () => null
  })
  const createPrebidMock = () => ({
    que: {
      push: func => func()
    },
    debug: false,
    addAdUnits: () => null,
    requestBids: () => null,
    setTargetingForAst: () => null
  })

  describe('constructor method', () => {
    it('Should obtain pbjs and que from the given window', done => {
      const mockElement = 'existingElement'
      const queMock = [mockElement]
      const pbjsMock = {
        que: queMock
      }
      const givenWindow = {pbjs: pbjsMock}
      const givenLogger = {
        debug: () => {}
      }
      const prebid = new PrebidClientImpl({
        window: givenWindow,
        logger: givenLogger
      })
      prebid.addAdUnits({adUnits: {}})
      expect(givenWindow.pbjs.que.length).to.equal(2)
      expect(givenWindow.pbjs.que[0]).to.equal(mockElement)
      done()
    })
  })

  describe('addAdUnits method', () => {
    it('should call the prebid addAdUnits method via que', () => {
      const prebidMock = createPrebidMock()
      const loggerMock = createLoggerMock()
      const windowMock = {
        pbjs: prebidMock
      }
      const prebidClient = new PrebidClientImpl({
        logger: loggerMock,
        window: windowMock
      })
      const queSpy = sinon.spy(prebidMock.que, 'push')
      const adAddUnitsSpy = sinon.spy(prebidMock, 'addAdUnits')
      const givenParameters = [
        {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        },
        {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      ]

      prebidClient.addAdUnits({adUnits: givenParameters})
      expect(queSpy.calledOnce).to.be.true
      expect(adAddUnitsSpy.calledOnce).to.be.true
      expect(adAddUnitsSpy.args[0][0]).to.deep.equal(givenParameters)
    })
  })

  describe('requestBidsSpy method', () => {
    it('should call the prebid requestBidsSpy method via que', () => {
      const prebidMock = createPrebidMock()
      const loggerMock = createLoggerMock()
      const windowMock = {
        pbjs: prebidMock
      }
      const prebidClient = new PrebidClientImpl({
        logger: loggerMock,
        window: windowMock
      })
      const queSpy = sinon.spy(prebidMock.que, 'push')
      const requestBidsSpy = sinon.spy(prebidMock, 'requestBids')
      const givenParameters = {
        adUnits: [
          {
            code: 1,
            mediaTypes: [[3, 4]],
            bids: [100, 101]
          },
          {
            code: 1,
            mediaTypes: [[3, 4]],
            bids: [100, 101]
          }
        ],
        timeout: TIMEOUT_PREBID,
        bidsBackHandler: ({bidsBackHandler}) => bidsBackHandler()
      }

      prebidClient.requestBids(givenParameters)
      expect(queSpy.calledOnce).to.be.true
      expect(requestBidsSpy.calledOnce).to.be.true
      expect(requestBidsSpy.args[0][0]).to.deep.equal(givenParameters)
    })
  })

  describe('setTargetingForAst method', () => {
    it('should call the prebid setTargetingForAst method via que', () => {
      const prebidMock = createPrebidMock()
      const loggerMock = createLoggerMock()
      const windowMock = {
        pbjs: prebidMock
      }
      const prebidClient = new PrebidClientImpl({
        logger: loggerMock,
        window: windowMock
      })
      const queSpy = sinon.spy(prebidMock.que, 'push')
      const setTargetingForAstSpy = sinon.spy(prebidMock, 'setTargetingForAst')
      const givenParameters = [
        {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        },
        {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      ]

      prebidClient.setTargetingForAst({adUnits: givenParameters})
      expect(queSpy.calledOnce).to.be.true
      expect(setTargetingForAstSpy.calledOnce).to.be.true
    })
  })
})
