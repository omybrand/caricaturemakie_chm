var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis').createClient();
var flash = require('express-flash');

var app_info = require('./routes/app_info');
var artist = require('./routes/artist');
var banner = require('./routes/banner');
var goods = require('./routes/goods');
var manage = require('./routes/manage');
var notice = require('./routes/notice');
var order_app = require('./routes/order_app');
var orderlist = require('./routes/orderlist');
var reserve = require('./routes/reserve');
var server = require('./routes/server');
var style = require('./routes/style');
var support = require('./routes/support');
var user = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'imgs', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('omybrand'));
app.use(session({
    secret: 'omybrand',
    user_sn: '',
    user_id: '',
    artist_sn: '',
    artist_id: '',
    artist_name: '',
    o_id: '',
    store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: redis
    }),
    cookie:{
        maxAge: new Date(Date.now() + 360000),
        expires: false
    },
    resave: true,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('session error'));
    }
    next();
});
app.use(flash());

app.use('/chm', express.static(path.join(__dirname, 'public')));
app.use('/chm/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/chm/app_info', app_info);
app.use('/chm/artist', artist);
app.use('/chm/banner', banner);
app.use('/chm/goods', goods);
app.use('/chm/manage', manage);
app.use('/chm/notice', notice);
app.use('/chm/order_app', order_app);
app.use('/chm/orderlist', orderlist);
app.use('/chm/checkServer', server.checkServer);
app.use('/chm/reserve', reserve);
app.use('/chm/style', style);
app.use('/chm/support', support);
app.use('/chm/user', user);


// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
