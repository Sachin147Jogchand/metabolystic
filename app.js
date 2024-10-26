var createError = require('http-errors')
var express = require('express')
var path = require('path')
var logger = require('morgan')
var app = express()
var indexRouter = require('./routes/index')
const connectDB = require('./config/config'); // Import MongoDB connection

connectDB();

var app = express()
const cors = require('cors')

var corsOption = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
}
app.use(cors(corsOption))

app.use(logger('dev'))
app.use(express.json())

app.use('/', indexRouter)
app.use('/api/users', require('./routes/users.routes'))
app.use('/api/open-ai', require('./routes/ai.routes'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  // eslint-disable-next-line no-constant-condition
  res.locals.error = req.app.get('env') === 'development' || 'test' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
