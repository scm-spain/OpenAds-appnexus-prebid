import {expect} from 'chai'
import sinon from 'sinon'
import PullingAdRepository from '../../../openads-appnexus/repository/PullingAdRepository'
import PullingDataEntry from '../../../openads-appnexus/repository/PullingDataEntry'

describe('Pulling Ad Repository', () => {
  describe('find method', () => {
    it('should return a Promise', () => {
      const repository = new PullingAdRepository({})
      expect(repository.find({id: 'whatever'})).to.be.a('promise')
    })
    it('should reject by timeout exception is data is not available at timeout time, cleaning the pulling interval', (done) => {
      const givenTimeout = 50
      const givenId = 'key1'
      const givenValue = new PullingDataEntry({id: givenId, ads: 'value1'})
      const removeIntervalSpy = sinon.spy(givenValue, 'removeInterval')

      const repository = new PullingAdRepository({timeout: givenTimeout, ads: [[givenId, givenValue]]})
      repository.find({id: givenId}).then(() => {
        done(new Error('Should not end properly'))
      }).catch(e => {
        expect(e.message, 'Should be a timeout error').to.include('Timeout')
        expect(removeIntervalSpy.calledOnce, 'Should have called the removeInterval method from data entry').to.be.true
        done()
      })
    })
    it('should resolve properly when data is available', (done) => {
      const givenId = 'key1'
      const givenValue = new PullingDataEntry({id: givenId, data: 'value1'})
      const repository = new PullingAdRepository({ads: [[givenId, givenValue]]})
      repository.find({id: givenId}).then(data => {
        expect(data).to.equal(givenValue.data)
        done()
      }).catch(e => done(e))
    })
    it('should wait for data to be available', (done) => {
      const repository = new PullingAdRepository({timeout: 1000})
      repository.find({id: 'key2'}).then(data => {
        expect(data).to.equal('value2')
        done()
      }).catch(e => done(e))
      const storeValue = setTimeout(() => {
        repository.save({id: 'key2', adResponse: 'value2'})
        clearTimeout(storeValue)
      }, 50)
    })
  })
  describe('save method', () => {
    it('should store the given data', () => {
      const givenId = 'id1'
      const givenValue = new PullingDataEntry({id: givenId, data: 'value1'})
      const repository = new PullingAdRepository()

      expect(repository.has({id: givenId})).to.be.false
      repository.save({id: givenId, adResponse: givenValue.data})
      expect(repository.has({id: givenId})).to.be.true
    })
  })
  describe('remove method', () => {
    it('should remove the given id entry', () => {
      const givenId = 'id1'
      const givenValue = new PullingDataEntry({id: givenId, data: 'value1'})
      const repository = new PullingAdRepository({ads: [[givenId, givenValue]]})

      expect(repository.has({id: givenId})).to.be.true
      repository.remove({id: givenId})
      expect(repository.has({id: givenId})).to.be.false
    })
  })
})
