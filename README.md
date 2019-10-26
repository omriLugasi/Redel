# Redel
[![npm version](https://img.shields.io/npm/v/redel.svg?style=flat-square)](https://www.npmjs.org/package/redel)
[![install size](https://packagephobia.now.sh/badge?p=redel)](https://packagephobia.now.sh/result?p=redel)
[![npm downloads](https://img.shields.io/npm/dm/redel.svg?style=flat-square)](http://npm-stat.com/charts.html?package=redel)
![license: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
[![Build Status](https://travis-ci.org/omriLugasi/Redel.svg?branch=master)](https://travis-ci.org/omriLugasi/Redel)

A middleware library for promise based axios for the browser and nodeJs

## Installing

Using npm:

```bash
$ npm install redel
```

Using yarn:

```bash
$ yarn add redel
```

## Redel API
- [use](#use)
- [add](#add)
- [eject](#eject)
- [ejectAll](#ejectAll)
- [getSignedPlugins](#getSignedPlugins)
- [getPendingRequests](#getPendingRequests)
- [clearPendingRequests](#clearPendingRequests)
- [cancelGroupRequests](#cancelGroupRequests)
- [getCancelGroupHeader](#getCancelGroupHeader)

## Plugins
- [Cancel](#cancel-plugin)
- [Log](#log-plugin)
- [Pending](#pending-plugin)



## Example

Performing a basic usage

```js

const Redel = require('redel')
const axios = require('axios')

const config = { log: true }
Redel.use(axios, config)

// ..

axios.get('https://jsonplaceholder.typicode.com/todos')

```

Performing usage with multiple plugins

```js

const Redel = require('redel')
const axios = require('axios')

const config = { log: true, cancel: true, pending: true }
Redel.use(axios, config)

// ..

axios.get('https://jsonplaceholder.typicode.com/todos')

```

Performing usage with axios.create

```js

const Redel = require('redel')
const axios = require('axios')
const axiosInstance = axios.create()

const config = { log: true, cancel: true, pending: true }
Redel.use(axiosInstance, config)

// ..

axiosInstance.get('https://jsonplaceholder.typicode.com/todos')

```

## Cancel Plugin

 Cancel plugin is a plugin that wrap your requests
 before firing them to the server with axios cancellation functionality.

  The cancel plugin work with 2 different functionality:
  1. Single cancel
  2. Cancel by group key

 * **Single** <br />
  Cancel request that still didn't return from the server
  when a new request with the same **method and pathname**
  gonna be fired to the server.

 * **Cancel by group key** <br />
  Cancel all requests with the **unique group key**


**Usage - Single**

```js

const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { cancel: true })
let canceledReqeuests = 0

// We can check if the catch function triggered by the Redel cancel plugin
// with the following condition `!!e.isCanceled`
const catchFn = e => {
  if (e.isCanceled) {
    canceledReqeuests += 1
  }
}

const mount = async () => {
  const basicUrl = 'https://jsonplaceholder.typicode.com/todos'
  await Promise.all([
    axios.get(`${basicUrl}?group=3`).catch(catchFn), // canceled
    axios.get(`${basicUrl}?group=124`).catch(catchFn), // canceled
    axios.get(`${basicUrl}?group=1911`).catch(catchFn), // canceled
    axios.get(`${basicUrl}?group=00001`).catch(catchFn) // resolved
  ])
  console.log({ canceledReqeuests }) // { canceledReqeuests: 3 }
}

mount()

```


**Usage - Cancel by group key**

```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { cancel: true })
const cancelGroupKey = 'customCancelGroupKey'

const headers = Redel.getCancelGroupHeader(cancelGroupKey)
const basicUrl = 'https://jsonplaceholder.typicode.com/todos'

let canceledReqeuests = 0

// We can check if the catch function triggered by the Redel cancel plugin
// with the following condition `!!e.isCanceled`
const catchFn = e => {
  if (e.isCanceled) {
    canceledReqeuests += 1
  }
}

const mount = () => {
  axios.get(`${basicUrl}/1`, { headers }).catch(catchFn),
  axios.get(`${basicUrl}/2`, { headers }).catch(catchFn),
  axios.get(`${basicUrl}/3`, { headers }).catch(catchFn),
  axios.get(`${basicUrl}/4`, { headers }).catch(catchFn)
}

mount()

// beforeDestroyed run the commend below to ensure that
// all pending requests would be canceled
Redel.cancelGroupRequests(cancelGroupKey)


```

## Pending Plugin

 Monitoring your pending requests.<br />
 Expose functionality to get your pending requests.

Examples

```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { pending: true })

axios.get('https://jsonplaceholder.typicode.com/todos/1')
setTimeout(() => {
    console.log(Redel.getPendingRequests()) // ["/todos/1"]
})

```

A common usage of this functionality can be found in "beforeunload"

 ```js
// if user has any pending request, display warning message
window.addEventListener("beforeunload", function (e) {
  if (Redel.getPendingRequests().length) {
    // there are pending requests
    // display a warning message
  }
  // unload the page
})
 ```


## Log Plugin

 Monitoring your requests by printing a very informative log about each request.<br />

Examples
 ```js
const Redel = require('redel')
const axios = require('axios')

const url = 'https://jsonplaceholder.typicode.com/todos/1'

Redel.use(axios, { log: true })

axios.get(url)

 ```

 The above will print the js object below

 ```js
{
    isCompletedWithoutError: true,
    maxContentLength: -1,
    method: "get",
    timeout: 0,
    proxy: undefined,
    requestData: {query: {}, data: {}, params: {}},
    requestHeaders: {
        common: {Accept: "application/json", "text/plain": "*/*"},
        delete: {},
        get: {},
        head: {},
        patch: {"Content-Type": "application/x-www-form-urlencoded"},
        post: {"Content-Type": "application/x-www-form-urlencoded"},
        put: {"Content-Type": "application/x-www-form-urlencoded"},
    },
    responseData: {userId: 1, id: 1, title: "delectus aut autem", completed: false},
    endTime: 1571698420250,
    startTime: 1571698420167,
    totalTime: "83ms",
    url: "https://jsonplaceholder.typicode.com/todos/1",
}

 ```
 ### Table of content

| Property | Type | Description |
| --- | --- | --- |
| isCompletedWithoutError | Boolean | The request done with error or not |
| maxContentLength | Number | Request max content length |
| method | String | Request method |
| timeout | number | Request time out |
| proxy | object | Request proxy |
| requestData | Object | Object that hold the request data (data, query, params)|
| requestHeaders | Object | Request headers |
| responseData | Object | Response data |
| startTime | Number (timestamp) | Request start time |
| endTime | Number (timestamp) | Request end time |
| totalTime | String | Request total time |
| url | String | Request url |


## Use

Work as Redel init function.<br />
To initialize the function we need 2 params, axios and config.<br />

| Property | Description |
| --- | --- |
| axios | axios instance |
| config | Contains the desire plugins |

<br />
The function will sign the plugins into the injected axios instnace.
<br />

Example
 ```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { log: true })

 ```

## add

Add plugin at run time <br />

Example
 ```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { log: true })

// ...
// ...
// ...

Redel.add('cancel')

console.log(Redel.getSignedPlugins()) // ['log', 'cancel']

 ```

## eject
Remove plugin from Redel.
<br />
This is useful when you want to remove specific plugin at run time from the Redel instance.
<br />
<br />
Example
 ```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { log: true })

//...
//...
//...
console.log(Redel.getSignedPlugins()) // ['log']
Redel.eject('log')
console.log(Redel.getSignedPlugins()) // []

 ```

 ## ejectAll

 Reset the Redel plugins.
 <br />
 This is useful when you want to remove all your plugins at once.<br />
 > Note: The axios instance will be saved.

  ```js
Redel.ejectAll()

  ```

 ## getSignedPlugins
 Return Array of singed plugins name.<br />

 Exmaple

 ```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { log: true, cancel: true })

console.log(Redel.getSignedPlugins()) // ['log', 'cancel']

 ```

 ## getPendingRequests

 Return Array of string, that each string contain the url of pending request.

Example

```js
const Redel = require('redel')
const axios = require('axios')

Redel.use(axios, { pending: true })

axios.get('https://jsonplaceholder.typicode.com/todos/1')
setTimeout(() => {
    console.log(Redel.getPendingRequests()) // ["/todos/1"]
})

```

 ## clearPendingRequests

 Clear the pending request array.

```js
Redel.clearPendingRequests()
```


 ## cancelGroupRequests
 Cancel all requests that belong to the groupKey.<br />
 [Click here for more information](#cancel-plugin)

```js
Redel.cancelGroupRequests('cancelGroupKey')
```

 ## getCancelGroupHeader
 sign request to cancel group.

 ```js
 Redel.getCancelGroupHeader()
 ```

 You can find examples [here](#cancel-plugin)


