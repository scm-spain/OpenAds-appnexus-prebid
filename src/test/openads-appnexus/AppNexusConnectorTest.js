import {expect} from 'chai'
import sinon from 'sinon'
import AppNexusConnector from '../../openads-appnexus/AppNexusConnector'
import PrebidClientImpl from '../../openads-appnexus/PrebidClientImpl'
import AstClientImpl from '../../openads-appnexus/AstClientImpl'
import {TIMEOUT_DEBOUNCE} from "../../openads-appnexus/timeout/timeout";

describe('AppNexus Connector', function() {
  const waitForDebounce = ({delta = 5} = {}) => new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId)
      resolve()
    }, TIMEOUT_DEBOUNCE + delta
    )
  })
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
  describe('refresh method', () => {
    it('Should refresh an Ad', done => {
      const givenId = 'ad1'
      const givenSpecification = {
        appnexus: {
          targetId: givenId,
          invCode: 'inv-code1'
        },
        prebid: {
          code: givenId,
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

      const expectedAd = {
        data: {
          id: givenId
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
      const setTargetingForAstSpy = sinon.spy(prebidClientMock, 'setTargetingForAst')

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
        .refresh({id: givenId, specification: givenSpecification})
        .then(ad => {

          expect(removeSpy.calledOnce, 'should remove an old Ad remaining in the repository')
          expect(removeSpy.args[0][0].id, 'should remove the Ad id from the repository').to.equal(givenId)


          expect(modifyTagSpy.calledOnce, 'ast modifyTag should be called one time').to.be.true
          expect(modifyTagSpy.args[0][0], 'ast modifyTag should be with the update data').to.deep.equal({
              targetId: givenId,
              data: givenSpecification.appnexus
          })

          expect(refreshSpy.calledOnce, 'ast refresh should be called one time').to.be.true
          expect(refreshSpy.args[0][0], 'ast refresh should be called with an array of ids').to.deep.equal([givenId])

          expect(requestBidsSpy.calledOnce, 'prebid should request bids').to.be.true
          expect(requestBidsSpy.args[0][0].adUnits, 'prebid should request bids for an array of given ad units').to.deep.equal([givenSpecification.prebid])

          expect(setTargetingForAstSpy.calledOnce, 'prebid should set AST targeting').to.be.true

          expect(ad).to.deep.equal(expectedAd)
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
    it('Should remove the Ad from the repository, modify the tag, refresh the tag and wait for the Ad response if any update data is received', done => {
      const astClientMock = createAstClientMock()
      const adRepositoryMock = createAdRepositoryMock({
        findResult: 'whatever'
      })
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

      appNexusConnector
        .refresh(givenParameters)
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
          expect(modifyTagSpy.calledOnce, 'should have modified the tag').to.be
            .true
          expect(
            modifyTagSpy.args[0][0],
            'should have modified the tag with valid parameters'
          ).to.deep.equal(modifyTagExpectedParameters)
          expect(refreshSpy.calledOnce, 'should have refreshed the tag').to.be
            .true
          expect(
            refreshSpy.args[0][0],
            'should have refreshed the tag with valid parameters'
          ).to.deep.equal([givenParameters.domElementId])
          expect(
            findSpy.calledOnce,
            'should have found the Ad in the repository'
          ).to.be.true
          expect(
            findSpy.args[0][0],
            'should have found the Ad in the repository with valid parameters'
          ).to.deep.equal({id: givenParameters.domElementId})
          done()
        })
        .catch(e => done(e))
    })
    it('Should modify the tag only with the data received to modify, if some is received', done => {
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
        sizes: [[3, 4]]
      }

      appNexusConnector
        .refresh(givenParameters)
        .then(() => {
          const modifyTagExpectedParameters = {
            targetId: givenParameters.domElementId,
            data: {
              sizes: givenParameters.sizes
            }
          }
          expect(modifyTagSpy.calledOnce, 'should have modified the tag').to.be
            .true
          expect(
            modifyTagSpy.args[0][0],
            'should have modified the tag with valid parameters'
          ).to.deep.equal(modifyTagExpectedParameters)
          done()
        })
        .catch(e => done(e))
    })
    it('Should not call to modify the tag if no data to modify is received', done => {
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

      appNexusConnector
        .refresh(givenParameters)
        .then(() => {
          expect(modifyTagSpy.called, 'should not have modified the tag').to.be
            .false
          done()
        })
        .catch(e => done(e))
    })
    it('Should reject if ad repository rejects returning the ad response', done => {
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
      appNexusConnector
        .refresh(givenParameters)
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
