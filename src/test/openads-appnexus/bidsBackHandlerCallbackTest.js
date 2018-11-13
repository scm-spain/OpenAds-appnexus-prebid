import {expect} from 'chai'
import PrebidClient from '../../openads-appnexus/PrebidClientImpl'
import bidsBackHandlerCallback from '../../openads-appnexus/bidsBackHandlerCallback'
import sinon from 'sinon'

describe('Debouncer', () => {
  describe('given N inputs separately', () => {
    it('should return an array with all the inputs', done => {
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

      const pbjs = ''
      const prebidClientTest = new PrebidClient({pbjs})

      const astClientMock = createAstClientMock()
      const loadTagsSpy = sinon.spy(astClientMock, 'loadTags')

      const adUnits = [
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

      prebidClientTest.addAdUnits(adUnits)
      prebidClientTest.requestBids({
        bidsBackHandler: bidsBackHandlerCallback,
        timeout: 25
      })

      expect(loadTagsSpy.calledOne).to.be.true
    })
  })
})
