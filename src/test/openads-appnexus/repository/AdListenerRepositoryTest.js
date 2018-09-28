import {expect} from 'chai'

import ReplayEventBus from '../../../openads-appnexus/service/ReplayEventBus'
import AdListenerRepository from '../../../openads-appnexus/repository/AdListenerRepository'

describe('AdListenerRepository', function() {
  beforeEach(() => {
    ReplayEventBus.clear()
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

      const raiseId = setTimeout(() => {
        ReplayEventBus.raise({
          event: {
            eventName: `AD_STORED_${givenId}`,
            payload: {
              id: givenId
            }
          }
        })
        clearTimeout(raiseId)
      }, 100)
    })
    it('should return the previous stored value if an Ad was previously saved', done => {
      const givenTimeout = 2000
      const givenId = 'found'
      const givenAdResponse = {
        what: 'ever'
      }
      const repository = new AdListenerRepository({
        timeout: givenTimeout,
        initialAds: [[givenId, givenAdResponse]]
      })

      repository
        .find({id: givenId})
        .then(ad1 => {
          expect(ad1, 'should be the previously saved ad').to.deep.equal(
            givenAdResponse
          )
          expect(
            ReplayEventBus.getNumberOfPendingEvents({
              eventName: `AD_STORED_${givenId}`
            }),
            'should not register any pending event'
          ).to.equal(0)
          expect(
            ReplayEventBus.getNumberOfSubscriptionsRegisteredForAnEvent({
              eventName: `AD_STORED_${givenId}`
            }),
            'should not register any observer'
          ).to.equal(0)
          done()
        })
        .catch(e => done(e))
    })
    it('should support two consecutive finds even if the first one get the Ad after a timeout', done => {
      const givenTimeout = 50
      const givenId = 'slowAd'
      const givenAdResponse1 = {
        what: 'ever1'
      }
      const givenAdResponse2 = {
        what: 'ever2'
      }
      const repository = new AdListenerRepository({
        timeout: givenTimeout
      })
      repository
        .find({id: givenId})
        .then(() => Promise.reject(new Error('should give a timeout')))
        .catch(e =>
          Promise.resolve()
            .then(() =>
              expect(e.message, 'should be a timeout error').to.include(
                'Timeout'
              )
            )
            .then(() =>
              ReplayEventBus.raise({
                event: {
                  eventName: `AD_STORED_${givenId}`,
                  payload: givenAdResponse1
                }
              })
            )
        )
        .then(() => repository.remove({id: givenId}))
        .then(() =>
          Promise.all([
            repository.find({id: givenId}),
            Promise.resolve().then(() =>
              setTimeout(
                () =>
                  ReplayEventBus.raise({
                    event: {
                      eventName: `AD_STORED_${givenId}`,
                      payload: givenAdResponse2
                    }
                  }),
                20
              )
            )
          ]).then(([findResponse, nomatter]) => {
            expect(
              findResponse,
              'the findResponse should be the result of the 2nd find'
            ).to.deep.equal(givenAdResponse2)
            done()
          })
        )
        .catch(e => done(e))
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
            ReplayEventBus.getNumberOfPendingEvents({
              eventName: `AD_STORED_${givenId}`
            }),
            'should have a pending event'
          ).to.equal(1)
          done()
        })
        .catch(e => done(e))
    })
  })
  describe('remove method', function() {
    it('should remove the previously stored Ad', done => {
      const givenTimeout = 50
      const givenId = 'found'
      const givenAdResponse = {
        what: 'ever'
      }
      const repository = new AdListenerRepository({
        timeout: givenTimeout,
        initialAds: [[givenId, givenAdResponse]]
      })
      repository
        .remove({id: givenId})
        .then(() => repository.find({id: givenId}))
        .then(() => {
          done(new Error('should not find any Ad'))
        })
        .catch(e => {
          expect(e.message, 'should be a timeout error').to.include('Timeout')
          expect(
            ReplayEventBus.getNumberOfSubscriptionsRegisteredForAnEvent({
              eventName: `AD_STORED_${givenId}`
            }),
            'should have a no registered subscriptions after the timeout'
          ).to.equal(0)
          done()
        })
        .catch(e => done(e))
    })
  })
})
