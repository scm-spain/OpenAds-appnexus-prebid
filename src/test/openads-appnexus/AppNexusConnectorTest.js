import {expect} from 'chai'
import sinon from 'sinon'
import AppNexusConnector from '../../openads-appnexus/AppNexusConnector'
import {TIMEOUT_DEBOUNCE} from '../../openads-appnexus/timeout/timeout'

describe('AppNexus Connector', function() {
  const waitForDebounce = ({delta = 5} = {}) =>
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId)
        resolve()
      }, TIMEOUT_DEBOUNCE + delta)
    })
  const makeAgiven = (n, appnexusOnly) => {
    const given = {
      id: 'ad' + n,
      specification: {
        appnexus: {
          targetId: 'ad' + n,
          invCode: 'inv-code' + n
        }
      }
    }
    if (!appnexusOnly) {
      given.specification.prebid = {
        code: 'ad' + n,
        mediaTypes: {
          banner: {
            sizes: [[970, 90]]
          }
        },
        bids: [
          {
            bidder: 'rubicon',
            params: {
              accountId: '1111',
              siteId: '2222',
              zoneId: '3333'
            }
          }
        ]
      }
    }
    return given
  }
  const createLoggerMock = () => ({
    error: () => null,
    debug: () => null
  })
  const createAstClientMock = () => {
    const mock = {
      setPageOpts: () => mock,
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
  const createPrebidClientMock = () => {
    const mock = {
      addAdUnits: () => mock,
      requestBids: () => mock,
      setTargetingForAst: () => mock
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
  describe('constructor', () => {
    it('should call the setPageOpts if options are given', done => {
      const givenPageOpts = {
        member: 1000
      }
      const astClientMock = createAstClientMock()
      const setPageOptsSpy = sinon.spy(astClientMock, 'setPageOpts')
      Promise.resolve()
        .then(
          () =>
            new AppNexusConnector({
              pageOpts: givenPageOpts,
              astClient: astClientMock
            })
        )
        .then(() => {
          expect(setPageOptsSpy.called, 'setPageOpts should be called').to.be
            .true
          expect(
            setPageOptsSpy.args[0][0],
            'setPageOpts should receive the pageOpts'
          ).to.deep.equal(givenPageOpts)
          done()
        })
        .catch(e => done(e))
    })
  })
  describe('refresh method', () => {
    it('Should refresh one Ad', done => {
      const givenAd = makeAgiven(1)

      const expectedAd = {
        data: {
          id: givenAd.id
        }
      }

      const prebidClientMock = {
        requestBids: ({bidsBackHandler}) => bidsBackHandler(),
        setTargetingForAst: () => null
      }
      const astClientMock = {
        push: f => f(),
        setPageOpts: () => null,
        modifyTag: () => null,
        refresh: () => null
      }
      const adRepositoryMock = {
        remove: () => Promise.resolve(),
        find: () => waitForDebounce().then(() => expectedAd)
      }

      const removeSpy = sinon.spy(adRepositoryMock, 'remove')
      const modifyTagSpy = sinon.spy(astClientMock, 'modifyTag')
      const refreshSpy = sinon.spy(astClientMock, 'refresh')

      const requestBidsSpy = sinon.spy(prebidClientMock, 'requestBids')
      const setTargetingForAstSpy = sinon.spy(
        prebidClientMock,
        'setTargetingForAst'
      )

      const appNexusConnector = new AppNexusConnector({
        pageOpts: {
          member: 1000
        },
        logger: createLoggerMock(),
        astClient: astClientMock,
        prebidClient: prebidClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })

      appNexusConnector
        .refresh({id: givenAd.id, specification: givenAd.specification})
        .then(ad => {
          expect(
            removeSpy.calledOnce,
            'should remove an old Ad remaining in the repository'
          )
          expect(
            removeSpy.args[0][0].id,
            'should remove the Ad id from the repository'
          ).to.equal(givenAd.id)

          expect(
            modifyTagSpy.calledOnce,
            'ast modifyTag should be called one time'
          ).to.be.true
          expect(
            modifyTagSpy.args[0][0],
            'ast modifyTag should be with the update data'
          ).to.deep.equal({
            targetId: givenAd.id,
            data: givenAd.specification.appnexus
          })

          expect(refreshSpy.calledOnce, 'ast refresh should be called one time')
            .to.be.true
          expect(
            refreshSpy.args[0][0],
            'ast refresh should be called with an array of ids'
          ).to.deep.equal([givenAd.id])

          expect(requestBidsSpy.calledOnce, 'prebid should request bids').to.be
            .true
          expect(
            requestBidsSpy.args[0][0].adUnits,
            'prebid should request bids for an array of given ad units'
          ).to.deep.equal([givenAd.specification.prebid])

          expect(
            setTargetingForAstSpy.calledOnce,
            'prebid should set AST targeting'
          ).to.be.true

          expect(ad).to.deep.equal(expectedAd)
          done()
        })
        .catch(e => done(e))
    })
    it('Should refresh many Ads at the same time', done => {
      const givenAd1 = makeAgiven(1)
      const givenAd2 = makeAgiven(2)
      const givenAd3 = makeAgiven(3)

      const prebidClientMock = {
        requestBids: ({bidsBackHandler}) => bidsBackHandler(),
        setTargetingForAst: () => null
      }
      const astClientMock = {
        push: f => f(),
        setPageOpts: () => null,
        modifyTag: () => null,
        refresh: () => null
      }
      const adRepositoryMock = {
        remove: () => Promise.resolve(),
        find: () => null
      }

      const removeSpy = sinon.spy(adRepositoryMock, 'remove')
      const modifyTagSpy = sinon.spy(astClientMock, 'modifyTag')
      const refreshSpy = sinon.spy(astClientMock, 'refresh')

      const requestBidsSpy = sinon.spy(prebidClientMock, 'requestBids')
      const setTargetingForAstSpy = sinon.spy(
        prebidClientMock,
        'setTargetingForAst'
      )

      const appNexusConnector = new AppNexusConnector({
        pageOpts: {
          member: 1000
        },
        logger: createLoggerMock(),
        astClient: astClientMock,
        prebidClient: prebidClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })

      appNexusConnector.refresh(givenAd1)
      appNexusConnector.refresh(givenAd2)
      appNexusConnector.refresh(givenAd3)

      waitForDebounce({delta: 50})
        .then(() => {
          expect(
            removeSpy.callCount,
            'the Ad repository should have received 3 remove calls'
          ).to.equal(3)
          expect(
            modifyTagSpy.callCount,
            'the ast client should have recevied 3 modifyTag calls'
          ).to.equal(3)

          expect(
            setTargetingForAstSpy.callCount,
            'the prebid client should have recevied 1 setTargetingForAst call'
          ).to.equal(1)
          expect(
            requestBidsSpy.callCount,
            'the prebid client should have recevied 1 requestBids call'
          ).to.equal(1)
          expect(
            refreshSpy.callCount,
            'the ast client should have recevied 1 refresh call'
          ).to.equal(1)

          expect(
            requestBidsSpy.args[0][0].adUnits,
            'the requestBids call should contain the 3 ad units'
          ).to.deep.equal([
            givenAd1.specification.prebid,
            givenAd2.specification.prebid,
            givenAd3.specification.prebid
          ])

          expect(
            refreshSpy.args[0][0],
            'the refresh call should contain the 3 ids to refresh'
          ).to.deep.equal([givenAd1.id, givenAd2.id, givenAd3.id])
          done()
        })
        .catch(e => done(e))
    })
    it('Should not call to prebid methods if no prebid is set', done => {
      const givenAd1 = makeAgiven(1, true)

      const prebidClientMock = {
        requestBids: ({bidsBackHandler}) => bidsBackHandler(),
        setTargetingForAst: () => null
      }
      const astClientMock = {
        push: f => f(),
        setPageOpts: () => null,
        modifyTag: () => null,
        refresh: () => null
      }
      const adRepositoryMock = {
        remove: () => Promise.resolve(),
        find: () => waitForDebounce()
      }

      const removeSpy = sinon.spy(adRepositoryMock, 'remove')
      const modifyTagSpy = sinon.spy(astClientMock, 'modifyTag')
      const refreshSpy = sinon.spy(astClientMock, 'refresh')

      const requestBidsSpy = sinon.spy(prebidClientMock, 'requestBids')
      const setTargetingForAstSpy = sinon.spy(
        prebidClientMock,
        'setTargetingForAst'
      )

      const appNexusConnector = new AppNexusConnector({
        pageOpts: {
          member: 1000
        },
        logger: createLoggerMock(),
        astClient: astClientMock,
        prebidClient: prebidClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock()
      })

      appNexusConnector
        .refresh(givenAd1)
        .then(() => {
          expect(
            removeSpy.callCount,
            'the Ad repository should have received 1 remove calls'
          ).to.equal(1)
          expect(
            modifyTagSpy.callCount,
            'the ast client should have recevied 3 modifyTag calls'
          ).to.equal(1)
          expect(
            setTargetingForAstSpy.called,
            'the prebid client should not recevie any setTargetingForAst call'
          ).to.be.false
          expect(
            requestBidsSpy.called,
            'the prebid client should not recevie any requestBids call'
          ).to.be.false
          expect(
            refreshSpy.callCount,
            'the ast client should have recevied 1 refresh call'
          ).to.equal(1)

          done()
        })
        .catch(e => done(e))
    })
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

      expect(debugModeSpy.calledOnce, 'debug provider should be called').to.be
        .true
      expect(
        debugModeSpy.args[0][0].debug,
        'should receive the method debug value'
      ).to.be.true
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
    it('Should show the received target id', done => {
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

      appNexusConnector
        .display({domElementId: givenId})
        .then(() => {
          expect(showSpy.calledOnce, 'should have called the show method').to.be
            .true
          expect(
            showSpy.args[0][0].targetId,
            'should receive correct id'
          ).to.equal(givenId)
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
        loggerProvider: createloggerProviderMock(),
        prebidClient: createPrebidClientMock()
      })
      expect(appNexusConnector.loadAd({})).to.be.a('promise')
    })
    it('should call loadtags without prebid information', done => {
      const astClientMock = createAstClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })

      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock(),
        prebidClient: createPrebidClientMock()
      })

      const givenId = 1

      const givenSpecification = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        }
      }

      const expectedDefineTagsArray = {
        placement: 2,
        sizes: [[3, 4]],
        segmentation: {a: 5},
        native: {b: 6}
      }

      const removeSpy = sinon.spy(adRepositoryMock, 'remove')
      const findSpy = sinon.spy(adRepositoryMock, 'find')

      const defineTagSpy = sinon.spy(astClientMock, 'defineTag')
      const onEventSpy = sinon.spy(astClientMock, 'onEvent')
      const loadTagsSpy = sinon.spy(astClientMock, 'loadTags')

      appNexusConnector
        .loadAd({
          id: givenId,
          specification: givenSpecification
        })
        .then(() => {
          setTimeout(() => {
            expect(
              removeSpy.calledOnce,
              'should have found the Ad in the repository'
            ).to.be.true
            expect(
              findSpy.calledOnce,
              'should have found the Ad in the repository'
            ).to.be.true
            expect(defineTagSpy.calledOnce, 'should have defined the tag').to.be
              .true
            expect(
              onEventSpy.callCount,
              'should have registered 5 events'
            ).to.equal(5)
            expect(loadTagsSpy.calledOnce, 'should have loaded the tag').to.be
              .true
            expect(defineTagSpy.args[0][0]).to.deep.equal(
              expectedDefineTagsArray
            )
            done()
          }, 1500)
        })
        .catch(e => done(e))
    })
    it('should call loadtags without prebid information multiple ads', done => {
      const astClientMock = createAstClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })

      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock(),
        prebidClient: createPrebidClientMock()
      })

      const givenId = 1

      const givenSpecification = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        }
      }

      const givenId2 = 1

      const givenSpecification2 = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        }
      }

      const expectedDefineTagsArray = {
        placement: 2,
        sizes: [[3, 4]],
        segmentation: {a: 5},
        native: {b: 6}
      }

      const removeSpy = sinon.spy(adRepositoryMock, 'remove')
      const findSpy = sinon.spy(adRepositoryMock, 'find')

      const defineTagSpy = sinon.spy(astClientMock, 'defineTag')
      const onEventSpy = sinon.spy(astClientMock, 'onEvent')
      const loadTagsSpy = sinon.spy(astClientMock, 'loadTags')

      appNexusConnector.loadAd({
        id: givenId,
        specification: givenSpecification
      })
      appNexusConnector
        .loadAd({
          id: givenId2,
          specification: givenSpecification2
        })
        .then(() => {
          setTimeout(() => {
            expect(
              removeSpy.calledTwice,
              'should have found the Ad in the repository'
            ).to.be.true
            expect(
              findSpy.calledTwice,
              'should have found the Ad in the repository'
            ).to.be.true
            expect(defineTagSpy.calledTwice, 'should have defined the tag').to
              .be.true
            expect(
              onEventSpy.callCount,
              'should have registered 5 events'
            ).to.equal(10)
            expect(loadTagsSpy.calledOnce, 'should have loaded the tag').to.be
              .true
            expect(defineTagSpy.args[0][0]).to.deep.equal(
              expectedDefineTagsArray
            )
            done()
          }, 1500)
        })
        .catch(e => done(e))
    })
    it('should call load tags with prebid information', done => {
      const astClientMock = createAstClientMock()
      const prebidClientMock = createPrebidClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })

      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock(),
        prebidClient: prebidClientMock
      })

      const givenId = 1

      const givenSpecification = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        },
        prebid: {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      }

      const addAdUnitsSpy = sinon.spy(prebidClientMock, 'addAdUnits')
      const requestBidsSpy = sinon.spy(prebidClientMock, 'requestBids')

      const expectedprebidUnitsArray = [
        {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      ]

      appNexusConnector
        .loadAd({
          id: givenId,
          specification: givenSpecification
        })
        .then(() => {
          setTimeout(() => {
            expect(addAdUnitsSpy.calledOnce).to.be.true

            expect(requestBidsSpy.calledOnce).to.be.true

            expect(addAdUnitsSpy.args[0][0]).to.deep.equal(
              expectedprebidUnitsArray
            )
            done()
          }, 1500)
        })
        .catch(e => done(e))
    })
    it('should call load tags with prebid information multiple ads', done => {
      const astClientMock = createAstClientMock()
      const prebidClientMock = createPrebidClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })

      const appNexusConnector = new AppNexusConnector({
        member: 1000,
        logger: createLoggerMock(),
        astClient: astClientMock,
        adRepository: adRepositoryMock,
        loggerProvider: createloggerProviderMock(),
        prebidClient: prebidClientMock
      })

      const givenId = 1

      const givenSpecification = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        },
        prebid: {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      }

      const givenId2 = 1

      const givenSpecification2 = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        },
        prebid: {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      }

      const addAdUnitsSpy = sinon.spy(prebidClientMock, 'addAdUnits')
      const requestBidsSpy = sinon.spy(prebidClientMock, 'requestBids')

      const expectedprebidUnitsArray = [
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

      appNexusConnector.loadAd({
        id: givenId,
        specification: givenSpecification
      })
      appNexusConnector
        .loadAd({
          id: givenId2,
          specification: givenSpecification2
        })
        .then(() => {
          setTimeout(() => {
            expect(addAdUnitsSpy.calledOnce).to.be.true

            expect(requestBidsSpy.calledOnce).to.be.true

            expect(addAdUnitsSpy.args[0][0]).to.deep.equal(
              expectedprebidUnitsArray
            )
            done()
          }, 1500)
        })
        .catch(e => done(e))
    })
    it('Should reject if the Ad repository rejects while waiting for a response', done => {
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
      const givenId = 1

      const givenSpecification = {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 2,
          sizes: [[3, 4]],
          segmentation: {a: 5},
          native: {b: 6}
        },
        prebid: {
          code: 1,
          mediaTypes: [[3, 4]],
          bids: [100, 101]
        }
      }
      appNexusConnector
        .loadAd({
          id: givenId,
          specification: givenSpecification
        })
        .then(() => {
          done(new Error('should have rejected'))
        })
        .catch(() => {
          expect(
            findSpy.calledOnce,
            'should have found the Ad in the repository'
          ).to.be.true
          expect(
            findSpy.args[0][0],
            'should have found the Ad in the repository with valid parameters'
          ).to.deep.equal({id: givenId})
          done()
        })
        .catch(e => done(e))
    })
  })
})

// it('should call load tags with prebid information', done => {
//   // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//   const astClientMock = createAstClientMock()
//   const prebidClientMock = createPrebidClientMock()
//   const adRepositoryMock = createAdRepositoryMock({
//     findResult: 'whatever'
//   })
//
//   const appNexusConnector = new AppNexusConnector({
//     member: 1000,
//     logger: createLoggerMock(),
//     astClient: astClientMock,
//     adRepository: adRepositoryMock,
//     loggerProvider: createloggerProviderMock(),
//     prebidClient: prebidClientMock
//   })
//
//   const givenId = 1
//
//   const givenSpecification = {
//     source: 'appNexusPrebid',
//     appNexus: {
//       placement: 2,
//       sizes: [[3, 4]],
//       segmentation: {a: 5},
//       native: {b: 6}
//     },
//     prebid: {
//       code: 1,
//       mediaTypes: [[3, 4]],
//       bids: [100, 101]
//     }
//   }
//
//   const loadTagsSpy = sinon.spy(astClientMock, 'loadTags')
//
//   const addAdUnitsSpy = sinon.spy(prebidClientMock, 'addAdUnits')
//   const requestBidsSpy = sinon.spy(prebidClientMock, 'requestBids')
//   const setTargetingForAstSpy = sinon.spy(
//     prebidClientMock,
//     'setTargetingForAst'
//   )
//
//   const expectedprebidUnitsArray = [
//     {
//       code: 1,
//       mediaTypes: [[3, 4]],
//       bids: [100, 101]
//     }
//   ]
//
//   appNexusConnector
//     .loadAd({
//       id: givenId,
//       specification: givenSpecification
//     })
//     .then(() => {
//       setTimeout(() => {
//         // expect(loadTagsSpy.calledOnce, 'should have loaded the tag').to.be
//         //   .true
//
//         expect(addAdUnitsSpy.calledOnce).to.be.true
//
//         expect(requestBidsSpy.calledOnce).to.be.true
//
//         // expect(setTargetingForAstSpy.calledOnce).to.be.true
//
//         expect(addAdUnitsSpy.args[0][0]).to.deep.equal(
//           expectedprebidUnitsArray
//         )
//
//         done()
//       }, 1800)
//     })
// }) // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
