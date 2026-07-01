require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const pagesRoute = require('./routes/web-pages');
const usersRoute = require('./routes/users');
const movieRoute = require('./routes/movie-api');
const deployRoute = require('./routes/deploy');

const app = express();
app.use('/deploy', express.raw({ type: 'application/json' }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Static files are served from public/ at the root URL
app.use(express.static(path.join(__dirname, 'public')));

app.use('/home', pagesRoute);
app.use('/users', usersRoute);
app.use('/movie', movieRoute);
app.use('/deploy', deployRoute);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Set status code
  const statusCode = err.status || 500;
  res.status(statusCode);

  // Send JSON error msg
  res.json({
      status: statusCode,
      message: err.message,
      error: req.app.get('env') === 'development' ? err.stack : {}
  });
});

module.exports = app;
