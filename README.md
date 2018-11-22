# OpenAds AppNexus Prebid connector
[![Build Status](https://travis-ci.org/scm-spain/OpenAds-appnexus-prebid.svg?branch=master)](https://travis-ci.org/scm-spain/OpenAds-appnexus-prebid)

[OpenAds](https://github.com/scm-spain/OpenAds) OpenAds AppNexus connector with Prebid features.

OpenAds now support sources as modules by configuration so you can include whatever module available you want.
To build your own module take a look at the section ```Build your own module```

# Installation
AppNexus Prebid module is available as the ```@schibstedspain/openads-appnexus-prebid``` package on [npm](https://www.npmjs.com/)

To install the stable version:
```
npm install --save @schibstedspain/openads-appnexus-prebid
```

# Usage

To use it with OpenAds first you must install and import OpenAds as explained in the [readme](https://github.com/scm-spain/OpenAds)
After that you must init the AppNexusConnector with the configuration member account
Now you are able to put the instance as a source available in OpenAds configuration

```ecmascript 6
import OpenAds from '@schibstedspain/openads'
import AppNexusConnector from '@schibstedspain/openads-appnexus-prebid'

const appNexusConnector = AppNexusConnector.init({
  config: {
    member: 4242
  }
})

const openAds = OpenAds.init({config:{
  Sources: {
    AppNexus: appNexusConnector
  }
}})
```

This connector implements these [Connector API](https://github.com/scm-spain/OpenAds-ConnectorAPI) interfaces:
* AdViewable
* AdLoadable
* Logger

# Build your own module
All modules to work fine with OpenAds must **implement** at least one interface of type AdLoadable or AdViewable
The idea is that your module implements only the interfaces that support, for example AppNexus supports both

# License
OpenAds is [MIT licensed](./LICENSE).
