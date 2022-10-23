const express = require('express')
const dbMovies = require('../dbMovies.js')
const dbCharacters = require('../dbCharacters.js')
const path = require('node:path')
const { REPL_MODE_STRICT } = require('node:repl')


const router = express.Router()

module.exports = router

function getValidationErrorsForImg(fileName){
    const validationErrors = []

    if(!fileName){
        validationErrors.push("Must choose a file")
        return validationErrors
    }

    const arraryOfAllowedFiles = [".jpeg", ".jpg"]
    const extension = path.extname(fileName)

    for(var i=0; i<arraryOfAllowedFiles.length; i+=1){
        if(extension == arraryOfAllowedFiles[i]){
            return validationErrors
        }
        if(i == arraryOfAllowedFiles.length-1){
            const errorMessage = "You can not choose the type " + extension + " , please choose another type"
            validationErrors.push(errorMessage)
        }
    }
    
    return validationErrors
}



//---------------movie functions----------
function getValidationErrorsForMovies(title, imgName, description, year ){
    const minLength = 1
    
    const validationErrors = []

    if(title.length < minLength){
        validationErrors.push("Must enter a title")
    }

    const validationErrorsForImg = getValidationErrorsForImg(imgName)
    if (validationErrorsForImg != 0){
        validationErrors.push(validationErrorsForImg)
    }

    if(description.length < minLength){
        validationErrors.push("Must enter a description")
    }

    if(year.length < minLength){
        validationErrors.push("Must type a year")
    } else if (isNaN(year)){
        validationErrors.push("Year must be a number")
    } else if(year < 1800 || year > 2022) {
        validationErrors.push("Type a year closer to this date ")
    }

    return validationErrors
}

//-----------------all movies-----------------
router.get('/', function(request, response){
     dbMovies.getAllMovies(function(error, movies){
        if(error){
            console.log(error) 
            const model = {
                dbError: true
            }
            response.render('movies.hbs', model)

        } else {
            const model = {
                dbError: false,
                movies
            } 
            response.render('movies.hbs', model) 
        }     
    }) 
})

//---------------add movie----------------
router.get('/add', function(request, response){
    if(request.session.isLoggedIn){
        dbCharacters.getAllCharacters(function(error, character){
            if(error){
                console.log(error)
                const model = {
                    dbError: true
                }
                response.render('add-movie.hbs', model)
    
            } else {
                const model = {
                    dbError: false,
                    character 
                }
                response.render('add-movie.hbs', model)
            }
        })

    } else {
        response.redirect('/login')
    }

      
})

router.post('/add', function(request, response){
    if(request.session.isLoggedIn){
        const title = request.body.title
        const description = request.body.description
        const year = request.body.year
        const characterSelectedID = request.body.selectCharacter 
        var imgName
        errors = []

        if(request.body.checkImg){
            imgName = "noMovie.jpeg"

        } else if(request.body.checkCurrentImg){
            imgName = request.body.checkCurrentImg

        } else if (request.files && request.files.imageName){
            var imgFile = request.files.imageName
            imgName = imgFile.name
            imgErrors = getValidationErrorsForImg(imgName)
            if(imgErrors){
                errors.push(imgErrors)

            } else {
                imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_movies/' + imgName, function(error){
                    if(error){
                        console.log(error)
                    }
                })
            }
        }   
        
        errors = getValidationErrorsForMovies(title, imgName, description, year)

        if(!request.session.isLoggedIn){
            errors.push("You need to be logged in to add a movie")
        }

        if(((request.files && request.files.imageName) && (request.body.checkImg || request.body.checkCurrentImg)) ||  (request.body.checkImg && request.body.checkCurrentImg)){
            errors.push("You can only choose one file at the time")
        }

        if(errors.length == 0){
            dbMovies.addMovie(title, imgName, year, description, characterSelectedID, function(error){
                if(error){
                    console.log(error)
                }
                response.redirect('/movies')
            })

        } else {
            dbCharacters.getNameAndIdFromCharacters(function(error, character){
                if(error){
                    console.log(error)
                    const model = {
                        dbError: true
                    }
                    response.render('add-movie.hbs', model)

                } else {
                    dbCharacters.getSelectedCharacterValues(characterSelectedID, function(error, characterSelectedValues){ 
                        if(error){
                            console.log(error)
                            const model = {
                                dbError: true
                            }
                            response.render('add-movie.hbs', model)

                        } else {
                            character[character.length+1] = character[characterSelectedID-1]   
                            character.pop()
                            character.splice((characterSelectedID-1), 1)
            
                            const model = { 
                                errors,
                                title,
                                imgName,
                                year,
                                description,
                                character,
                                characterSelectedValues       
                            }
                            response.render('add-movie.hbs', model)
                        }   
                    })
                }   
            })
        } 

    } else {
        response.redirect('/login')
    }
})

//---------------specific movie----------------
router.get('/:id', function(request, response){

    const id = request.params.id
    dbMovies.getMovieWithCharacter(id, function(error, movie){
        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('movie.hbs', model)

        } else {
            const model = {
                dbError: false,
                movie     
            }
            response.render('movie.hbs', model)
        }
    })
})

//------------------update movie-----------------------------
router.get('/update/:id', function(request, response){
    if(request.session.isLoggedIn){
        const id = request.params.id

        dbMovies.getMovieWithCharacter(id, function(error, movie){
            if(error){
                console.log(error)
                const model = {
                    dbError: true
                }
                response.render('update-movie.hbs', model)

            } else {
                dbCharacters.getNameAndIdFromCharacters(function(error, character){
                    const model = {
                        dbError: false,
                        character,
                        movie,
                        id
                    }
                    response.render('update-movie.hbs', model)
                })   
            }         
        }) 

    } else {
        response.redirect('/login')
    }
    
})

router.post('/update/:id', function(request, response){
    if(request.session.isLoggedIn){
        const id = request.params.id
        const newTitle = request.body.newTitle
        const newDescription = request.body.newDescription
        const newYear = request.body.newYear
        const newCharacterSelectedID = request.body.selectCharacter 
        var newImageName 
        errors = []

        if(request.body.checkImg){
            newImageName = "noMovie.jpeg"

        } else if(request.body.checkCurrentImg){
            newImageName = request.body.checkCurrentImg

        } else if (request.files.newImageName){
            var imgFile = request.files.newImageName
            newImageName = imgFile.name
            imgError = getValidationErrorsForImg(newImageName)
            if(imgError){
                errors.push(imgError)

            } else {
                imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_books/' + newImageName, function(error){
                    if(error){
                        console.log(error)
                    } 
                })
            }
        }   
            
        errors = getValidationErrorsForMovies(newTitle, newImageName, newDescription, newYear, newCharacterSelectedID)
        
        if(!request.session.isLoggedIn){
            errors.push("You need to be logged in to add a movie")
        }

        if(((request.files && request.files.imageName) && (request.body.checkImg || request.body.checkCurrentImg)) ||  (request.body.checkImg && request.body.checkCurrentImg)){
            errors.push("You can only choose one file at the time")
        }

        if(errors.length == 0){
            dbMovies.updateMovie(newTitle, newImageName, newDescription, newYear, newCharacterSelectedID, id, function(error){
                if(error){
                    console.log(error)
                    const model = {
                        dbError: true
                    }
                    response.render('update-movie.hbs', model)
                }
                response.redirect('/movies')
            })
            
        } else {
            dbCharacters.getNameAndIdFromCharacters(function(error, character){
                if(error){
                    console.log(error)
                    const model = {
                        dbError: true
                    }
                    response.render('update-movie.hbs', model)

                } else {
                    dbCharacters.getSelectedCharacterValues(newCharacterSelectedID, function(error, characterSelectedValues){ 
                        if(error){
                            console.log(error)
                            const model = {
                                dbError: true
                            }
                            response.render('update-movie.hbs', model)

                        } else {
                            character[character.length+1] = character[newCharacterSelectedID-1]   
                            character.pop()
                            character.splice((newCharacterSelectedID-1), 1)
        
                            const model = { 
                                errors,
                                newTitle,
                                newImageName,
                                newYear,
                                newDescription,
                                character,
                                characterSelectedValues,
                                id
                            }
                            response.render('update-movie.hbs', model)
                        } 
                    })
                }  
            })
        }

    } else [
        response.redirect('/login')
    ]
    
})

//-------------------delete movie----------------------------
router.post('/delete/:id', function(request, response){
    if(request.session.isLoggedIn){
        const id = request.params.id

        dbMovies.deleteMovie(id, function(error){ 
            if(error){
                console.log(error)
            } else {
                response.redirect('/movies')
            }  
        })

    } else {
        response.redirect('/login')
    }
})