# OpenAds AppNexus Prebid connector
[![Build Status](https://travis-ci.org/scm-spain/OpenAds-appnexus-prebid.svg?branch=master)](https://travis-ci.org/scm-spain/OpenAds-appnexus-prebid)
[![codecov](https://codecov.io/gh/scm-spain/Openads-appnexus-prebid/branch/master/graph/badge.svg)](https://codecov.io/gh/scm-spain/Openads-appnexus-prebid)
[![GitHub license](https://img.shields.io/github/license/scm-spain/Openads-appnexus-prebid.svg)](https://github.com/scm-spain/Openads-appnexus-prebid/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@schibstedspain/openads-appnexus-prebid.svg)](https://www.npmjs.com/package/@schibstedspain/openads-appnexus-prebid)

# About
OpenAds AppNexus connector with [Prebid](https://prebid.org) features.

[OpenAds](https://github.com/scm-spain/OpenAds) now support sources as modules by configuration so you can include whatever module available you want.
To build your own module take a look at the section ```Build your own module```

# Installation
AppNexus Prebid module is available as the ```@schibstedspain/openads-appnexus-prebid``` package on [npm](https://www.npmjs.com/package/@schibstedspain/Openads-appnexus-prebid)

To install the stable version:
```
npm install --save @schibstedspain/openads-appnexus-prebid
```

# Usage

To use it with OpenAds first you must install and import OpenAds as explained in the [readme](https://github.com/scm-spain/OpenAds)
After that you must init the AppNexusConnector with the configuration member account and your especific Prebid configuration
Now you are able to put the instance as a source available in OpenAds configuration

```ecmascript 6
import OpenAds from '@schibstedspain/openads'
import AppNexusConnector from '@schibstedspain/openads-appnexus-prebid'

const appNexusConnector = AppNexusConnector.init({
  config: {
    member: 4242
  },
  prebidConfig: {
    config: {
      bidderTimeout: 1000,
      priceGranularity: "dense",
      enableSendAllBids: false
    }
  }
})

const openAds = OpenAds.init({config:{
  Sources: {
    AppNexus: appNexusConnector
  }
}})
```

# Preconditions

This connector needs AppNexus Seller Tag (AST) and Prebid JS loaded in the page. Here an example:

```html
<head>
    <script src="https://c.dcdn.es/prebid/fotocasa/dev/prebid.js" async></script>
    <script src="https://acdn.adnxs.com/ast/ast.js" async></script>
</head>
```

More info about:
* AST: https://wiki.appnexus.com/display/sdk/AppNexus+Seller+Tag
* Prebid Js: http://prebid.org/dev-docs/getting-started.html


# Build your own module

This connector implements these [Connector API](https://github.com/scm-spain/OpenAds-ConnectorAPI) interfaces:
* AdViewable
* AdLoadable
* Logger

All modules to work fine with OpenAds must **implement** at least one interface of type AdLoadable or AdViewable
The idea is that your module implements only the interfaces that support, for example AppNexus supports both

# License
OpenAds is [MIT licensed](./LICENSE).
