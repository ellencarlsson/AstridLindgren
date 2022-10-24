const express = require('express')
const dbMovies = require('../dbMovies.js')
const dbCharacters = require('../dbCharacters.js')
const path = require('node:path')
const { REPL_MODE_STRICT } = require('node:repl')
const validations = require('../validations.js')

const router = express.Router()

module.exports = router

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
            imgErrors = validations.getValidationErrorsForImg(imgName)
            if(imgErrors.length != 0){
                errors.push(imgErrors)

            } else {
                imgFile.mv('/Users/ellencarlsson/AstridLindgren/public/images/img_movies/' + imgName, function(error){
                    if(error){
                        console.log(error)
                    }
                })
            }
        }   
        
        errors = validations.getValidationErrorsForMovies(title, imgName, description, year)

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
            imgError = validations.getValidationErrorsForImg(newImageName)
            if(imgError.length != 0){
                errors.push(imgError)

            } else {
                imgFile.mv('/Users/ellencarlsson/AstridLindgren/public/images/img_movies/' + newImageName, function(error){
                    if(error){
                        console.log(error)
                    } 
                })
            }
        }   
            
        errors = validations.getValidationErrorsForMovies(newTitle, newImageName, newDescription, newYear, newCharacterSelectedID)
        
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