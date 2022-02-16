const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const colors = require('colors');
const {engine, create} = require('express-handlebars')
const morgan = require('morgan');
const path = require('path');
const passport = require('passport')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const Handlebars = require('handlebars')
// method override
const methodOverride = require('method-override')

// Load configuration
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()
const app = express()

//Body parser
app.use(express.urlencoded({ extended: false })) 
app.use(express.json())

// Method Override
app.use(methodOverride(function (req, res) {
     if (req.body && typeof req.body === 'object' && '_method' in req.body) {
       // look in urlencoded POST bodies and delete it
       let method = req.body._method
       delete req.body._method
       return method
     }
   }))

//Logging
if (process.env.NODE_ENV === 'development') {
     app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs');

//Handlebars
/* register the helper method */
Handlebars.registerHelper({
     'formatDate': formatDate,
     'stripTags': stripTags,
     'truncate': truncate,
     'editIcon': editIcon,
     'select': select
})


const hbs = create({
     defaultLayout: 'main', 
     extname: '.hbs'
})
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs')
app.set('views', './views');

// Express session middleware
app.use(session({
     secret: 'keyboard cat',
     resave: true,
     saveUninitialized: false,
     store: MongoStore.create({ mongoUrl: process.env.MONGO_URL})
   })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Global variable
app.use(function(req, res, next) {
     res.locals.user = req.user || ''
     next();
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/story'))


const PORT = process.env.PORT || 3001

app.listen(PORT,() => {
     console.log(`Server running in 
     ${process.env.NODE_ENV} mode on port ${process.env.PORT}`)})