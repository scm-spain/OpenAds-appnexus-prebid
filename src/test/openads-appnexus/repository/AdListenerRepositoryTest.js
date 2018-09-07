import {expect} from 'chai'

import ReplayEventBus from '../../../openads-appnexus/service/ReplayEventBus'
import AdListenerRepository from '../../../openads-appnexus/repository/AdListenerRepository'

describe('AdListenerRepository', function() {
  beforeEach(() => {
    ReplayEventBus.clear()
  })
  describe('remove method', function() {
    it('should clear the message bus for the event name related to the received id', done => {
      const givenId = 'ad1'
      ReplayEventBus.clear()
      ReplayEventBus.register({
        eventName: 'AD_STORED_ad1',
        observer: () => null
      })

      const repository = new AdListenerRepository()
      repository
        .remove({id: givenId})
        .then(() => {
          expect(
            ReplayEventBus.getNumberOfRegisteredEvents(),
            'the observer has not been removed'
          ).to.equal(0)
          done()
        })
        .catch(e => done(e))
    })
  })
  describe('find method', function() {
    it('should end with a timeout exception if no ad is found within the time limit', done => {
      const givenTimeout = 5
      const givenId = 'notfound'
      const repository = new AdListenerRepository({timeout: givenTimeout})
      repository
        .find({id: givenId})
        .then(() => done(new Error('should not find any ad')))
        .catch(e => {
          expect(e.message, 'should be a timeout error').to.include(
            'Timeout waiting'
          )
          done()
        })
        .catch(e => done(e))
    })
    it('should find the Ad that is raised within the AD_STORED_x event', done => {
      const givenTimeout = 2000
      const givenId = 'found'
      const repository = new AdListenerRepository({timeout: givenTimeout})
      repository
        .find({id: givenId})
        .then(ad => {
          expect(ad, 'should be the stored Ad').to.deep.equal({id: givenId})
          done()
        })
        .catch(e => done(e))

      ReplayEventBus.raise({
        event: {
          eventName: `AD_STORED_${givenId}`,
          payload: {
            id: givenId
          }
        }
      })
    })
  })
  describe('save method', function() {
    it('should send an event to the event bus with the received Ad', done => {
      const givenId = 'whatever'
      const givenAdResponse = {
        id: givenId,
        data: {
          some: 'data'
        }
      }
      const repository = new AdListenerRepository()
      repository
        .save({id: givenId, adResponse: givenAdResponse})
        .then(() => {
          expect(
            ReplayEventBus.hasPendingEvent({eventName: `AD_STORED_${givenId}`}),
            'should have a pending event'
          ).to.be.true
          done()
        })
        .catch(e => done(e))
    })
  })
})
