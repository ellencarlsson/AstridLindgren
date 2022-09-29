const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const upload = require('express-fileupload')
const db = new sqlite3.Database("Astrid-Lindgren-database.db")
const path = require('node:path');

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

    response.render('books.hbs')
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

        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('characters.hbs', model)
        } else {
            const model = {
                characters
                    
            }
    
            response.render('characters.hbs', model)
        }
   
    })  
})

//--------------specific character-------------
app.get('/characters/:id', function(request, response){
    const id = request.params.id

    const query = `SELECT * FROM characters WHERE id = ? `
    const values = [id]

    db.get(query, values, function(error, character){
        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
        } else {
            const model = {
                character
            }
            response.render('character.hbs', model)
        }      
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
app.get('/movies/:movieID', function(request, response){

    const id = request.params.movieID 

    const query = `SELECT * FROM characters JOIN movies ON characters.id=movies.char_id WHERE movies.movieID = ?`
    const values = [id]

    db.get(query, values, function(error, movie){
        const model = {
            movie     
        }

        response.render('movie.hbs', model)
    })

})
   
//---------------add movie----------------
app.get('/add-movie', function(request, response){

    const query = `SELECT id, name FROM characters ORDER BY name ASC`

    db.all(query, function(error, character){

        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('add-movie.hbs', model)
        } else {
            const model = {
                character
                    
            }
    
            response.render('add-movie.hbs', model)
        }
   
    })  
})

function getValidationErrorsForImg(fileName){
    const validationErrors = []
    const arraryOfAllowedFiles = [".jpeg", ".jpg"]

    const extension = path.extname(fileName)

    for(var i=0; i<arraryOfAllowedFiles.length; i+=1){
        if(extension == arraryOfAllowedFiles[i]){
            return;
        }
    }
    const errorMessage = "You can not choose the type " + extension + " , please choose another type"
    validationErrors.push(errorMessage)
    return validationErrors
}

function getValidationErrorsForMovies(title, imgName, description, year, characterSelected){
    const minTitleLength = 1
    const minDescriptionLength = 1
    
    const validationErrors = []

    if(title.length < minTitleLength){
        validationErrors.push("Must enter a title")
    }
    if(description.length < minDescriptionLength){
        validationErrors.push("Must enter a description")
    }
    if(isNaN(year)){
        validationErrors.push("Must write a number")
    } else if(year < 1800 || year > Date()) {
        validationErrors.push("Type a year closer to this date ")
    } 
    if(isNaN(characterSelected)){
        validationErrors.push("Choose a character with bokstäver")
    } else if(characterSelected < 0){
        validationErrors.push("Id must be a positiv integer")
    }

    const validationErrorsForImg = getValidationErrorsForImg(imgName)
    if (validationErrorsForImg != 0){
        validationErrors.push(validationErrorsForImg)
    }

    return validationErrors
 
}



app.post('/add-movie', function(request, response){
    const title = request.body.title
    const description = request.body.description
    const year = parseInt(request.body.year)
    const characterSelected = request.body.selectCharacter 
    var imgName

    if(request.body.checkImg){
        imgName = "noMovie.jpeg"
    } else {
        var imgFile = request.files.imageName
        imgName = imgFile.name
    
        imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_movies/' + imgName, function(error){
                
            if(error){
                response.send(error)
            } else {
                        
            }
        })

    }   
    
    const validationErrors = getValidationErrorsForMovies(title, imgName, description, year, characterSelected)

    if(validationErrors.length == 0){
        const query = `INSERT INTO movies (title, imgName, year, description, char_id)
                VALUES(?, ?, ?, ?, ?)`

        const values = [title, imgName, year, description, characterSelected]

        db.run(query, values, function(error,){
        response.redirect('/movies')
    })
    } else {
        const model = {
        validationErrors,
        title,
        imgName,
        year,
        description,
        characterSelected
            
        }

        response.render('add-movie.hbs', model)
    } 
 
})

//-------------------delete movie----------------------------
app.post('/delete-movie/:movieID', function(request, response){
    const id = request.params.movieID

    const query = `DELETE FROM movies WHERE movieID = ?`

    db.run(query, id, function(error, movies){     

        response.redirect('/movies')
    })

})








app.listen(8080)