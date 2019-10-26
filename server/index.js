const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3002

const basicResponse = (req, res) => {
  res.send({ userId: 1, id: 1, title: 'This is a title', completed: false })
}

const timoutResponse = (req, res) => {
  const { time = 0 } = req.params
  setTimeout(() => {
    res.send({ userId: 1, id: 1, title: 'This is a title', completed: false })
  }, time)
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.get('^/time-out/:time([0-9]{1,6})', timoutResponse)
  .post('^/time-out/:time([0-9]{1,6})', timoutResponse)
  .put('^/time-out/:time([0-9]{1,6})', timoutResponse)
  .patch('^/time-out/:time([0-9]{1,6})', timoutResponse)
  .delete('^/time-out/:time([0-9]{1,6})', timoutResponse)

app.get('/basic', basicResponse)
  .post('/basic', basicResponse)
  .put('/basic', basicResponse)
  .patch('/basic', basicResponse)
  .delete('/basic', basicResponse)

app.post('/multipart', (req, res) => res.sendStatus(200))


let server

module.exports = {
  init: () => {
    server = app.listen(port)
  },
  close: () => server.close()
}
