# Redel
[![npm version](https://img.shields.io/npm/v/redel.svg?style=flat-square)](https://www.npmjs.org/package/redel)
[![install size](https://packagephobia.now.sh/badge?p=redel)](https://packagephobia.now.sh/result?p=redel)
[![npm downloads](https://img.shields.io/npm/dm/redel.svg?style=flat-square)](http://npm-stat.com/charts.html?package=redel)
![license: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A middleware library for promise based axios for the browser and nodeJs

## plugins
- Clean
- Statistics
- pending


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

    const config = { statistics: true }
    Redel.use(axios, config)

```

Performing usage with multiple plugins

```js

    const Redel = require('redel')
    const axios = require('axios')

    const config = { statistics: true, cancel: true, pending: true }
    Redel.use(axios, config)

```

Performing usage with axios.create

```js

    const Redel = require('redel')
    const axios = require('axios')
    const axiosInstance = axios.create()

    const config = { statistics: true, cancel: true, pending: true }
    Redel.use(axiosInstance, config)

```

## Cancel Plugin

Usage

```js

    const Redel = require('redel')
    const axios = require('axios')

    const config = { pending: true }
    Redel.use(axios, config)

    // ... code
    // ... code
    // ... code

    axios.get('https://jsonplaceholder.typicode.com/todos/1')

```







