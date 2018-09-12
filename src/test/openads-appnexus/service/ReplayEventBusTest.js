/* eslint-disable no-alert, no-console */

import {expect} from 'chai'
import sinon from 'sinon'
import ReplayEventBus from '../../../openads-appnexus/service/ReplayEventBus'
import ReplayEventBusWrapper from './helper/ReplayEventBusWrapper'

describe('ReplayEventBus', () => {
  beforeEach(() => {
    ReplayEventBus.clear()
  })
  describe('Given invalid register parameters', () => {
    it('Should fail if eventName is not present', done => {
      try {
        ReplayEventBus.register({eventName: undefined, observer: undefined})
        done(new Error('Should fail'))
      } catch (error) {
        done()
      }
    })
    it('Should fail if observer is not a function', done => {
      try {
        ReplayEventBus.register({eventName: 'givenEvent', observer: undefined})
        done(new Error('Should fail'))
      } catch (error) {
        done()
      }
    })
    it('Should return 0 when calling getNumberOfRegisteredEvents if there is no events registered', done => {
      ReplayEventBus.clear()
      const result = ReplayEventBus.getNumberOfRegisteredEvents()
      expect(0).equal(result)
      done()
    })
    it('Should return 0 when calling getNumberOfObserversRegisteredForAnEvent if there is no events registered', done => {
      ReplayEventBus.clear()
      const givenEventName = 'nonExistingEvent'
      const result = ReplayEventBus.getNumberOfObserversRegisteredForAnEvent({
        eventName: givenEventName
      })
      expect(0).equal(result)
      done()
    })
  })
  describe('Given a registered ReplayEventBus', () => {
    let observerSpy = sinon.spy()
    beforeEach(function() {
      observerSpy.reset()
    })
    it('Should execute observer callback using the raised payload', done => {
      const givenEventName = 'givenEventName'
      const givenEvent = {
        eventName: givenEventName,
        payload: 'event payload'
      }

      ReplayEventBus.register({
        eventName: givenEventName,
        observer: observerSpy
      })
      ReplayEventBus.raise({event: givenEvent})

      expect(observerSpy.calledOnce).equal(true)
      expect(observerSpy.lastCall.args[0].payload).equal(givenEvent.payload)
      expect(ReplayEventBus.getNumberOfRegisteredEvents()).equal(1)

      const eventBusTestHelper = new ReplayEventBusWrapper()
      const givenEventName2 = 'givenEventName2'
      const givenEvent2 = {
        eventName: givenEventName2,
        payload: 'event 2 payload'
      }
      eventBusTestHelper.register({
        eventName: givenEventName2,
        observer: observerSpy
      })
      eventBusTestHelper.raise({event: givenEvent2})

      expect(observerSpy.calledTwice).equal(true)
      expect(observerSpy.lastCall.args[0].payload).equal(givenEvent2.payload)
      expect(ReplayEventBus.getNumberOfRegisteredEvents()).equal(2)
      done()
    })
    it('Should clear all observers', done => {
      expect(ReplayEventBus.getNumberOfRegisteredEvents()).equal(0)
      done()
    })
    it('Should clear all observers and pending events for a specified eventName', done => {
      const givenEventName = 'SOME_EVENT_NAME'

      ReplayEventBus.raise({event: {eventName: givenEventName, payload: {}}})
      expect(
        ReplayEventBus.hasPendingEvent({eventName: givenEventName}),
        'should have a pending event'
      ).to.be.true
      ReplayEventBus.clear({eventName: givenEventName})
      expect(
        ReplayEventBus.hasPendingEvent({eventName: givenEventName}),
        'should not have any pending event'
      ).to.be.false

      ReplayEventBus.register({eventName: givenEventName, observer: () => null})
      expect(
        ReplayEventBus.getNumberOfRegisteredEvents(),
        'should have an observer registered'
      ).equal(1)
      ReplayEventBus.clear({eventName: givenEventName})
      expect(
        ReplayEventBus.getNumberOfRegisteredEvents(),
        'should have no observers registered'
      ).equal(0)

      done()
    })
    it('Should execute all observers related to an event', done => {
      const givenEventName = 'givenEventName'
      const givenEvent = {
        eventName: givenEventName,
        payload: '1'
      }

      ReplayEventBus.register({
        eventName: givenEventName,
        observer: observerSpy
      })
      ReplayEventBus.register({
        eventName: givenEventName,
        observer: observerSpy
      })
      ReplayEventBus.raise({event: givenEvent})
      expect(observerSpy.getCalls().length).equal(2)
      expect(observerSpy.getCall(0).args[0].payload).equal(givenEvent.payload)
      expect(observerSpy.getCall(1).args[0].payload).equal(givenEvent.payload)
      expect(ReplayEventBus.getNumberOfRegisteredEvents()).equal(1)
      expect(
        ReplayEventBus.getNumberOfObserversRegisteredForAnEvent({
          eventName: givenEventName
        })
      ).equal(2)
      done()
    })
  })
  describe('Given 1 event with 1 subscriber which has a dispatcher to raise a second event with another subscriber', () => {
    it('Should be raised event 2 by subscriber 1 when event 1 is raised', done => {
      const givenEvent1Name = 'event-1'
      const givenEvent1 = {
        eventName: givenEvent1Name,
        payload: 'event-1-payload'
      }
      const givenEvent2Name = 'event-2'
      const givenEvent2 = {
        eventName: givenEvent2Name,
        payload: 'event-2-payload'
      }
      const observer1 = {
        getObserverFunction: ({payload, dispatcher}) => {
          dispatcher(givenEvent2)
        }
      }
      const observer2 = {
        getObserverFunction: ({payload, dispatcher}) => {}
      }
      const spy1 = sinon.spy(observer1, 'getObserverFunction')
      const spy2 = sinon.spy(observer2, 'getObserverFunction')

      ReplayEventBus.register({
        eventName: givenEvent1Name,
        observer: observer1.getObserverFunction
      })
      ReplayEventBus.register({
        eventName: givenEvent2Name,
        observer: observer2.getObserverFunction
      })
      ReplayEventBus.raise({event: givenEvent1})
      expect(ReplayEventBus.getNumberOfRegisteredEvents()).equal(2)
      expect(spy1.calledOnce).equal(true)
      expect(spy1.getCall(0).args[0].payload).equal(givenEvent1.payload)
      expect(spy1.getCall(0).args[0].dispatcher).is.a('function')
      expect(spy2.calledOnce).equal(true)
      expect(spy2.getCall(0).args[0].payload).equal(givenEvent2.payload)
      expect(spy2.getCall(0).args[0].dispatcher).is.a('function')
      done()
    })
  })
  describe('Given 1 event with 2 subscribers, one of them causing an error', () => {
    it('Should execute the non failing subscriber smoothly and log the error', done => {
      const givenEvent1Name = 'event-1'
      const givenEvent1 = {
        eventName: givenEvent1Name,
        payload: 'event-1-payload'
      }
      const observer1 = {
        getObserverFunction: ({payload, dispatcher}) => {
          // observer1 will fail
          throw new Error('expected error')
        }
      }
      const observer2 = {
        getObserverFunction: ({payload, dispatcher}) => {
          // observer2 will work
        }
      }
      const spy1 = sinon.spy(observer1, 'getObserverFunction')
      const spy2 = sinon.spy(observer2, 'getObserverFunction')

      const errorObserver = payload => {
        console.log('ERROR_EVENT TEST: ', payload)
      }
      ReplayEventBus.register({
        eventName: 'ERROR_EVENT',
        observer: errorObserver
      })

      ReplayEventBus.register({
        eventName: givenEvent1Name,
        observer: observer1.getObserverFunction
      })
      ReplayEventBus.register({
        eventName: givenEvent1Name,
        observer: observer2.getObserverFunction
      })
      ReplayEventBus.raise({event: givenEvent1})

      expect(ReplayEventBus.getNumberOfRegisteredEvents()).equal(2)
      expect(
        ReplayEventBus.getNumberOfObserversRegisteredForAnEvent({
          eventName: givenEvent1Name
        })
      ).equal(2)
      expect(spy1.calledOnce).equal(true)
      expect(spy2.calledOnce).equal(true)
      done()
    })
  })

  describe('Given events raised before than their observer', () => {
    it('Should consume the the events registered before registering the observer', done => {
      ReplayEventBus.raise({
        event: {
          eventName: 'TEST',
          payload: {number: 1}
        }
      })
      ReplayEventBus.raise({
        event: {
          eventName: 'TEST',
          payload: {number: 2}
        }
      })
      const observerWrapper = {
        observer: () => null
      }
      const observerSpy = sinon.spy(observerWrapper, 'observer')

      ReplayEventBus.register({
        eventName: 'TEST',
        observer: observerWrapper.observer
      })

      expect(observerSpy.callCount, 'should be called 2 times').to.equal(2)
      done()
    })
  })
})
