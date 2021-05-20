var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser");
var cors = require("cors");
const fileUpload = require('express-fileupload');
const conectarDB = require('./routes/database');



var indexRouter = require('./routes/index');
var AngularMsgs = require('./routes/mensajes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(fileUpload({
  createParentPath: true
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.raw({ type: 'audio/wav', limit: '50mb' }));

// Conectamos con base de datos --- Connection to database
conectarDB();

app.use('/', indexRouter);

app.use('/botmsg',AngularMsgs);

app.use(
  bodyParser.json({
    limit: "30mb",
  })
);
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "30mb",
  })
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



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
