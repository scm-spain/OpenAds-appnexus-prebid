import ReplayEventBus from '../../../../openads-appnexus/service/ReplayEventBus'

export default class ReplayEventBusWrapper {
  register ({eventName, observer}) {
    ReplayEventBus.register({eventName, observer})
  }

  raise ({event}) {
    ReplayEventBus.raise({event})
  }
}
