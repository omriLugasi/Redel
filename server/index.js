const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3002

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.get('^/time-out/:time([0-9])', (req, res) => {
  const { time = 0 } = req.params
  setTimeout(() => {
    res.send({ userId: 1, id: 1, title: 'This is a title', completed: false })
  }, time)
})

app.get('/basic', (req, res) => {
  res.send({ userId: 1, id: 1, title: 'This is a title', completed: false })
})

let server

module.exports = {
  init: () => {
    server = app.listen(port)
  },
  close: () => server.close()
}
