var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var helmet = require('helmet');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.router');
var cerclesRouter = require('./routes/cercles.router');
var eventsRouter = require('./routes/events.router');
var locationsRouter = require('./routes/locations.router');
var loginRouter = require('./routes/login.router');
var csurf = require('csurf');
var rateLimit = require("express-rate-limit");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cercles', cerclesRouter);
app.use('/events', eventsRouter);
app.use('/locations', locationsRouter);
app.use('/login', loginRouter);

app.use(csurf());
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limiter chaque IP à 100 requêtes par fenêtre
});

app.use(limiter);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
        res.status(403).json({
        status: 'error',
        message: 'Invalid CSRF token.'
    });
});


module.exports = app;
