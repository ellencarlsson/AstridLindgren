const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const upload = require('express-fileupload')

const db = new sqlite3.Database("characters-database.db")

db.run(`
    CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        imageName TEXT,
        soundName TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY,
            name TEXT,
            imgName TEXT,
            year INTEGER,
            description TEXT,
            char_id INTEGER,
            CONSTRAINT fk_char_id
                FOREIGN KEY (char_id) REFERENCES characters(id)

    )
`)

const app = express()

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs'
})) 

app.use(
    express.static('public')
);

app.use(bodyParser.urlencoded({
    extended: false
}))
  


app.get('/', function(request, response){
  

    response.render('start.hbs')
})

//-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----BOOKS-----//

app.get('/book', function(request, response){

    // const id = request.params.id

    // const book = data.books.find(b => b.id == id)

    // const model = {
    //     book: book,
    // }

    response.render('book.hbs')
})

//----------------------add book------------------ 
app.get('/add-book', function(request, response){
    response.render('add-book.hbs')
})

app.post('/add-book', function(request, response){
    const name = request.body.name

    const book = {
        id: books.length + 1,
        name
    }

    books.push(book)

    response.redirect('/characters')
})
//-----CHARACTERS-----CHARACTERS-----CHARACTERS-----CHARACTERS-----CHARACTERS-----CHARACTERS-----CHARACTERS-----CHARACTERS-----CHARACTERS-----//


//----------------all characters--------------
app.get('/characters', function(request, response){

    const query = `SELECT * FROM characters`

    db.all(query, function(error, characters){

        const model = {
            characters
                
        }

        response.render('characters.hbs', model)
    })  
})

//--------------specific character-------------
app.get('/characters/:id', function(request, response){
    const id = request.params.id

    const query = `SELECT * FROM characters WHERE id = ? `
    const values = [id]

    db.get(query, values, function(error, character){
        const model = {
            character,
        }
        response.render('character.hbs', model)
    }) 
})

//------------------add character---------------    

app.use(upload())

app.get('/add-character', (request, response) => {
    response.render('add-character.hbs')
})

app.post('/add-character', function(request, response){
    const name = request.body.name
    const description = request.body.description;

        var imageName;
        var soundName;
        
        

        if(request.body.checkImg){
            imageName = "noPfp.jpeg"
        } else {
            var imgFile = request.files.imageName
            imageName = imgFile.name

            imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_characters/' + imageName, function(error){
            
                if(error){
                    response.send(error)
                } else {
                    
                }
            })
        };

        if(request.body.checkSnd){
            soundName = "standard.mp3"         
        } else {
            var sndFile = request.files.soundName
            soundName = sndFile.name

            sndFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/sounds/' + soundName, function(error){
                if(error){
                    response.send(error)
                } else {
    
                }
            })
        };


        

    const query = `INSERT INTO characters (name, description, imageName, soundName)
                VALUES(?, ?, ?, ?)`

    const values = [name, description, imageName, soundName]


    db.run(query, values, function(error,){
        response.redirect('/characters')
    })
    
})

//------------------delete character---------------------
app.post('/delete-character/:id', function(request, response){
    const id = request.params.id

    const query = `DELETE FROM characters WHERE id = ?`

    db.run(query, id, function(error, characters){

        

        response.redirect('/characters')
    })

})

//-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----MOVIES-----//

//-----------------all movies-----------------
app.get('/movies', function(request, response){
    const query = `SELECT * FROM movies`

    db.all(query, function(error, movies){

        const model = {
            movies
        }

        response.render('movies.hbs', model) 
    }) 
})

//---------------specific movie----------------
app.get('/movies/:id', function(request, response){
    const id = request.params.id

    const query = `SELECT * FROM movies WHERE id = ?`
    const values = [id]

    db.get(query, values, function(error, movie, character){
        const model = {
            movie,
            character
        }
        response.render('movie.hbs', model)
    })
})
   
//---------------add movie----------------
app.get('/add-movies', function(request, response){
    response.render('add-movie.hbs')
})




app.listen(8080)