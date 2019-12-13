var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var bankOrCCRouter = require('./routes/bankOrCC');
// var usersRouter = require('./routes/users');
var normalRouter = require('./routes/normalRouter');
var bankRouter = require('./routes/bankRouter');
var corecompanyRouter = require('./routes/corecompanyRouter');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {

    res.header('Access-Control-Allow-Origin', req.headers.origin);
  
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
    res.header('Access-Control-Allow-Credentials','true');
  
    next();
})



app.use('/', indexRouter);
app.use('/invite', bankOrCCRouter);
app.use('/normal',normalRouter);
app.use('/cc',corecompanyRouter);
app.use('/bank',bankRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
