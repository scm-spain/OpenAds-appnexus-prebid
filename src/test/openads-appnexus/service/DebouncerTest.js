import {expect} from 'chai'
import Debouncer from '../../../openads-appnexus/service/Debouncer'

describe('Debouncer', () => {
  describe('given N inputs separately', () => {
    const givenInput1 = {
      id: 'id1',
      specification: {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 'placement1',
          sizes: 'sizes1',
          segmentation: 'segmentation1',
          native: 'native1'
        },
        prebid: {
          code: 'div1',
          mediaTypes: 'sizes1',
          bids: []
        }
      }
    }

    const givenInput2 = {
      id: 'id2',
      specification: {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 'placement2',
          sizes: 'sizes2',
          segmentation: 'segmentation2',
          native: 'native2'
        }
      }
    }

    const givenInput3 = {
      id: 'id3',
      specification: {
        source: 'appNexusPrebid',
        appNexus: {
          placement: 'placement3',
          sizes: 'sizes3',
          segmentation: 'segmentation3',
          native: 'native3'
        },
        prebid: {
          code: 'div3',
          mediaTypes: 'sizes3',
          bids: []
        }
      }
    }

    it('should return an array with all the inputs', done => {
      const expectedResult = [
        {
          id: 'id1',
          specification: {
            appNexus: {
              native: 'native1',
              placement: 'placement1',
              segmentation: 'segmentation1',
              sizes: 'sizes1'
            },
            prebid: {
              bids: [],
              code: 'div1',
              mediaTypes: 'sizes1'
            },
            source: 'appNexusPrebid'
          }
        },
        {
          id: 'id2',
          specification: {
            appNexus: {
              native: 'native2',
              placement: 'placement2',
              segmentation: 'segmentation2',
              sizes: 'sizes2'
            },
            source: 'appNexusPrebid'
          }
        },
        {
          id: 'id3',
          specification: {
            appNexus: {
              native: 'native3',
              placement: 'placement3',
              segmentation: 'segmentation3',
              sizes: 'sizes3'
            },
            prebid: {
              bids: [],
              code: 'div3',
              mediaTypes: 'sizes3'
            },
            source: 'appNexusPrebid'
          }
        }
      ]

      let result = ''

      const debounceCallback = input => {
        result = input
      }

      const debounce = new Debouncer({
        onDebounce: debounceCallback,
        debounceTimeout: 3
      })

      debounce.debounce({input: givenInput1})
      debounce.debounce({input: givenInput2})
      debounce.debounce({input: givenInput3})

      setTimeout(() => {
        expect(result).to.be.deep.equal(expectedResult)
        done()
      }, 10)
    })

    it('should return two arrays with all the inputs', done => {
      const expectedResult = [
        [
          {
            id: 'id1',
            specification: {
              appNexus: {
                native: 'native1',
                placement: 'placement1',
                segmentation: 'segmentation1',
                sizes: 'sizes1'
              },
              prebid: {
                bids: [],
                code: 'div1',
                mediaTypes: 'sizes1'
              },
              source: 'appNexusPrebid'
            }
          },
          {
            id: 'id2',
            specification: {
              appNexus: {
                native: 'native2',
                placement: 'placement2',
                segmentation: 'segmentation2',
                sizes: 'sizes2'
              },
              source: 'appNexusPrebid'
            }
          },
          {
            id: 'id3',
            specification: {
              appNexus: {
                native: 'native3',
                placement: 'placement3',
                segmentation: 'segmentation3',
                sizes: 'sizes3'
              },
              prebid: {
                bids: [],
                code: 'div3',
                mediaTypes: 'sizes3'
              },
              source: 'appNexusPrebid'
            }
          }
        ],
        [
          {
            id: 'id1',
            specification: {
              appNexus: {
                native: 'native1',
                placement: 'placement1',
                segmentation: 'segmentation1',
                sizes: 'sizes1'
              },
              prebid: {
                bids: [],
                code: 'div1',
                mediaTypes: 'sizes1'
              },
              source: 'appNexusPrebid'
            }
          },
          {
            id: 'id2',
            specification: {
              appNexus: {
                native: 'native2',
                placement: 'placement2',
                segmentation: 'segmentation2',
                sizes: 'sizes2'
              },
              source: 'appNexusPrebid'
            }
          },
          {
            id: 'id3',
            specification: {
              appNexus: {
                native: 'native3',
                placement: 'placement3',
                segmentation: 'segmentation3',
                sizes: 'sizes3'
              },
              prebid: {
                bids: [],
                code: 'div3',
                mediaTypes: 'sizes3'
              },
              source: 'appNexusPrebid'
            }
          }
        ]
      ]

      let result = []

      const debounceCallback = input => {
        result.push(input)
      }

      const debounce = new Debouncer({
        onDebounce: debounceCallback,
        debounceTimeout: 10
      })

      debounce.debounce({input: givenInput1})
      debounce.debounce({input: givenInput2})
      debounce.debounce({input: givenInput3})

      setTimeout(() => {
        debounce.debounce({input: givenInput1})
        debounce.debounce({input: givenInput2})
        debounce.debounce({input: givenInput3})
      }, 500)

      setTimeout(() => {
        expect(result).to.be.deep.equal(expectedResult)
        done()
      }, 1000)
    })
  })
})
