var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    nconf = require('nconf'),
    cfenv = require('cfenv'),
    CronJob = require('cron').CronJob;

//////////////////////////////////////////////////
// Config
//////////////////////////////////////////////////

nconf.argv()
     .env()
     .file('local', './config/config-local.json')
     .file('main', './config/config.json');

var appEnv = cfenv.getAppEnv();

nconf.set('port', appEnv.port);

//services
if (appEnv.getService("mandrill") && 
    appEnv.getService("mandrill").credentials && 
    appEnv.getService("mandrill").credentials.key
    ) {
  nconf.set('mandrill:key', appEnv.getService("mandrill").credentials.key);
}

//////////////////////////////////////////////////
// Engine
//////////////////////////////////////////////////
var app = module.exports = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//TODO: uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'public')));

//////////////////////////////////////////////////
// Modules
//////////////////////////////////////////////////

var routes = require('./routes/index');
var mailRoute = require('./routes/mail');

var mailer = require('./scripts/mailer');

//////////////////////////////////////////////////
// Routes
//////////////////////////////////////////////////

app.use('/', routes);
app.use('/mail', mailRoute);

//////////////////////////////////////////////////
// Errors
//////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//////////////////////////////////////////////////
// Cron Jobs
//////////////////////////////////////////////////

var dailyMailCronJob = new CronJob({
  cronTime: nconf.get('dailyEmailTime'),
  onTick: function(){
    mailer.sendEmails();
  }, 
  start: false,
  timeZone: nconf.get('timezone')
});
dailyMailCronJob.start();
