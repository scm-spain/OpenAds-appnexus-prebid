import {expect} from 'chai'

import PrebidClientImpl from '../../openads-appnexus/PrebidClientImpl'

describe('PrebidClientImpl Test', () => {
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
})
