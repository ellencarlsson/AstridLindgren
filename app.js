const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const upload = require('express-fileupload')
const path = require('node:path')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const bcrypt = require("bcrypt")




const bookRouter = require('./routers/book-router')
const movieRouter = require('./routers/movie-router')
const characterRouter = require('./routers/character-router');
const { response } = require('express');
const { request } = require('node:http')

const correctUsername = "admin"
const correctPassword = "$2b$10$VlWi0z2WKOme6ZrXWwPYZenwm5PhX/vC4L.2mVmp6CBqLiQTs8EpG"

const app = express()

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs'
})) 



app.use(
    express.static('public')
)

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(expressSession({
    secret: "njndvkjnkjdn",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore()
}))

app.use(upload())



//----------------Login------------------Login------------------
app.use(function(request, response, next){
    const isLoggedIn = request.session.isLoggedIn

    response.locals.isLoggedIn = isLoggedIn

    next()
})

function getValidationErrorsForLogin(username, password){
    const invalidInput = 0
    const validationErrors = []
    if(username.length == invalidInput){
        validationErrors.push("Must type username")
    }
    if(password.length == invalidInput){
        validationErrors.push("Must type password")
    }
    return validationErrors
}



app.get('/login', function(request, response){
    response.render("login.hbs")
})

app.post('/login', function(request,response){
    const enteredUsername = request.body.username
    const enteredPassword = request.body.password

    const errors = getValidationErrorsForLogin(enteredUsername, enteredPassword)

    if(errors == 0){
        if(enteredUsername == correctUsername && bcrypt.compareSync(enteredPassword, correctPassword) ){
            //Login
            request.session.isLoggedIn = true
            response.redirect("/")
             
        } else {
            const errors = []
            errors.push("Username and Password is not a match. Please type again.")
            
            const model = {
                errors,
                enteredUsername,
                enteredPassword
            }
            response.render("login.hbs", model)
        }
    } else {
        const model = {
            errors,
            enteredUsername,
            enteredPassword
        }
        response.render("login.hbs", model)
    }
})
//-------------------Logout---------------------Logout-------------------------
app.post('/logout', function(request, response){
    request.session.isLoggedIn = false
    response.redirect('/')
    //Lägga till ett popup fönster med "du är nu utloggad"
})

//-------------------start-------------------start---------------------------

app.get('/', function(request, response){
    response.render('start.hbs')
})


//-------------Astrid Lindgren-------------Astrid Lindgren-------------Astrid Lindgren----------
app.get('/astrid-lindgren', function(request, response){
    response.render('astrid-lindgren.hbs')
})

//------------contact------------------contact------------------contact------------
app.get('/contact', function(request, response){
    response.render('contact.hbs')
})

app.get('/about', function(request, response){
    response.render('about.hbs')
})

// app.use(function(request, responde, next){
//     response.send("404")
// })


app.use('/books', bookRouter)
app.use('/movies', movieRouter)
app.use('/characters', characterRouter)






app.listen(8080)

