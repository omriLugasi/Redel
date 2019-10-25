# Redel
[![npm version](https://img.shields.io/npm/v/redel.svg?style=flat-square)](https://www.npmjs.org/package/redel)
[![install size](https://packagephobia.now.sh/badge?p=redel)](https://packagephobia.now.sh/result?p=redel)
[![npm downloads](https://img.shields.io/npm/dm/redel.svg?style=flat-square)](http://npm-stat.com/charts.html?package=redel)
![license: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A middleware library for promise based axios for the browser and nodeJs

## Plugins
- [Cancel](#cancel-plugin)
- Log
- Pending

## Redel Top Level API
- use
- getSignedMiddleware
- ejectByKey
- ejectAll

## Installing

Using npm:

```bash
$ npm install redel
```

Using yarn:

```bash
$ yarn add redel
```

## Example

Performing a basic usage

```js

const Redel = require('redel')
const axios = require('axios')

const config = { log: true }
Redel.use(axios, config)

```

Performing usage with multiple plugins

```js

const Redel = require('redel')
const axios = require('axios')

const config = { log: true, cancel: true, pending: true }
Redel.use(axios, config)

```

Performing usage with axios.create

```js

const Redel = require('redel')
const axios = require('axios')
const axiosInstance = axios.create()

const config = { log: true, cancel: true, pending: true }
Redel.use(axiosInstance, config)

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
  Cancel all requests with the **unique group key (ccgk)**


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

// the group key currently will be a query param the implementation like below will be
// "protocol://url:port?ccgk=customGroupKey"
const ccgkParam = `${Redel.cancel.ccgk}=${cancelGroupKey}`
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
  axios.get(`${basicUrl}/1?${ccgkParam}`).catch(catchFn),
  axios.get(`${basicUrl}/2?${ccgkParam}`).catch(catchFn),
  axios.get(`${basicUrl}/3?${ccgkParam}`).catch(catchFn),
  axios.get(`${basicUrl}/4?${ccgkParam}`).catch(catchFn)
}

mount()

// beforeDestroyed run the commend below to ensure that
// all pending requests would be canceled
Redel.cancel.cancelGroupRequests(cancelGroupKey)


```

## Pending Plugin

 Monitoring your pending requests.<br />
 Expose functionality to get your pending requests.

Examples

 ```js
const Redel = require('redel')
const axios = require('axios')

const basicUrl = 'https://jsonplaceholder.typicode.com/todos'

Redel.use(axios, { pending: true })

axios.get(`${basicUrl}/1`)
setTimeout(() => {
  console.log(Redel.pending.getPendingRequests()) // ["/todos/1"]
})

 ```

A common usage of this functionality can be found in "beforeunload"

 ```js
// if user has any pending request, display warning message
window.addEventListener("beforeunload", function (e) {
  if (Redel.pending.getPendingRequests().length) {
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









