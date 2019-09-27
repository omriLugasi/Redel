const pending = require('./modules/pendingModule')
const cancel = require('./modules/cancelModule')


const basicModules = {
  pending,
  cancel
}

function ambience() {
  return this
}


ambience.prototype.use = function (axios, config = {}) {
  this._axios = axios
  if (config && typeof config === 'object') {
    Object.keys(config).forEach(key => {
      if (!!basicModules[key]) {
        console.log(` ${ key } Middleware was sign`)
        basicModules[key].applyMiddleware(axios)
      }
    })
  }
}

ambience.prototype.pending = pending
ambience.prototype.cancel = cancel


module.exports = new ambience()
