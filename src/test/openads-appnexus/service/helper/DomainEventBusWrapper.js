import DomainEventBus from '../../../../openads-appnexus/service/DomainEventBus'

export default class DomainEventBusWrapper {
  register ({eventName, observer}) {
    DomainEventBus.register({eventName, observer})
  }

  raise ({domainEvent}) {
    DomainEventBus.raise({domainEvent})
  }
}
