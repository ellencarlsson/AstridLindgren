const express = require('express')
const dbCharacters = require('../dbCharacters.js')
const router = express.Router()
const path = require('node:path')
const dbBooks = require('../dbBooks.js')
const dbMovies = require('../dbMovies.js')
const validators = ('../validation.js')
const e = require('express')
const { isNull } = require('node:util')
const { copyFileSync } = require('node:fs')
const { get } = require('node:http')


module.exports = router

function getValidationErrorsForImg(fileName){
    const validationErrors = []

    if(!fileName){
        validationErrors.push("Must choose an image file")
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



function getValidationErrorsForCharacter(name, description, imageName, soundName){
    const minTitleLength = 1
    const minDescriptionLength = 1
    
    const validationErrors = []
    
    if(name.length < minTitleLength){
        validationErrors.push("Must enter a title")
    }
    if(description.length < minDescriptionLength){
        validationErrors.push("Must enter a description")
    }

    const validationErrorsForImg = getValidationErrorsForImg(imageName)
    if (validationErrorsForImg != 0){
        validationErrors.push(validationErrorsForImg)
    }

    const validationErrorsForSnd = getValidationErrorsForSnd(soundName)
    if (validationErrorsForSnd != 0){
        validationErrors.push(validationErrorsForSnd)
    }

    return validationErrors
}

//----------------all characters--------------
router.get('/', function(request, response){
    dbCharacters.getAllCharacters(function(error, characters){
        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('characters.hbs', model)

        } else {
            const model = {
                dbError: false,
                characters      
            }
            response.render('characters.hbs', model)
        }
    })
})

//------------------add character---------------    
router.get('/add', function(request, response){
    response.render('add-character.hbs')
})

router.post('/add', function(request, response){
    if(request.session.isLoggedIn){
        const name = request.body.name
        const description = request.body.description;
        var imageName
        var soundName
        errors = []
        
            if(request.body.checkImg){
                imageName = "noPfp.jpeg"

            } else if(request.body.checkCurrentImg){
                imageName = request.body.checkCurrentImg
            
            } else if (request.files && request.files.imageName){
                var imgFile = request.files.imageName
                imageName = imgFile.name
                const imgErrors = getValidationErrorsForImg(imageName)
                if(imgErrors){
                    errors.push(imgErrors)

                } else {
                    imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_characters/' + imageName, function(error){
                        if(error){
                            console.log(error)
                        }
                    })  
                }
            }

            if(request.body.checkSnd){
                soundName = "standard.mp3"

            } else if(request.body.checkCurrentSnd){
                soundName = request.body.checkCurrentSnd 

            } else if (request.files && request.files.soundName){
                var sndFile = request.files.soundName
                soundName = sndFile.name
                const sndErrors = validators.getValidationErrorsForSnd(soundName)
                if(sndErrors){
                    errors.push(sndErrors)

                } else {
                    sndFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/sounds/' + soundName, function(error){
                        if(error){
                            console.log(error)
                        }
                    }) 
                }    
            }
        
        errors = getValidationErrorsForCharacter(name, description, imageName, soundName)

        if(( (request.files && request.files.imageName) && (request.body.checkCurrentImg || request.body.checkImg) ) || (request.body.checkImg && request.body.checkCurrentImg)){
            errors.push("You can only choose one image file")
        }

        if(( (request.files && request.files.soundName) && (request.body.checkCurrentSnd || request.body.checkSnd) ) || (request.body.checkSnd && request.body.checkCurrentSnd)){
            errors.push("You can only choose one sound file")
        }

        if(errors.length == 0){
            dbCharacters.addCharacter(name, description, imageName, soundName, function(error){
                if(error){
                    console.log(error)
                }
                response.redirect('/characters')
            })
        } else {
            const model = {
                errors,
                name,
                description,
                imageName,
                soundName
            }
            response.render('add-character.hbs', model)
        }

    } else {
        response.redirect('/login')
    }   
})

//-----------------update character-----------------------
router.get('/update/:id', function(request, response){
    if(request.session.isLoggedIn){
        const id = request.params.id

        dbCharacters.getSpecificCharacter(id, function(error, character){
            if(error){
                console.log(error)

                const model = {
                    dbError: true
                }
                response.render('update-character.hbs', model)
            } else {
                const model = {
                    dbError: false,
                    character
                }
                response.render('update-character.hbs', model)
            }
        })

    } else {
        response.redirect('/login')
    } 
})

router.post('/update/:id', function(request, response){
    if(request.session.isLoggedIn){
        const id = request.params.id
        const newName = request.body.newName
        const newDescription = request.body.newDescription
        var newImageName
        var newSoundName
        errors = []

            if(request.body.checkImg){
                newImageName = "noPfp.jpeg"

            } else if(request.body.checkCurrentImg){
                newImageName = request.body.checkCurrentImg 

            } else if(request.files && request.files.newImageName){   
                var imgFile = request.files.newImageName
                newImageName = imgFile.name
                const imgError = getValidationErrorsForImg(newImageName)
                if(imgError){
                    errors.push(imgError)

                } else {
                    imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_characters/' + newImageName, function(error){
                        if(error){
                            console.log(error)
                        }
                    }) 
                }  
            }

            if(request.body.checkSnd){
                newSoundName = "standard.mp3" 

            } else if(request.body.checkCurrentSnd){
                newSoundName = request.body.checkCurrentSnd    

            } else if(request.files && request.files.newSoundName){
                var sndFile = request.files.newSoundName
                newSoundName = sndFile.name
                const sndErrors = getValidationErrorsForImg(newSoundName)
                if(sndErrors){
                    errors.push(sndErrors)

                } else {
                    sndFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/sounds/' + newSoundName, function(error){
                        if(error){
                            console.log(error)
                        }
                    }) 
                }   
            }

        errors = getValidationErrorsForCharacter(newName, newDescription, newImageName, newSoundName)

        if(( (request.files && request.files.newImageName) && (request.body.checkCurrentImg || request.body.checkImg) ) || (request.body.checkImg && request.body.checkCurrentImg)){
            errors.push("You can only choose one image file")
        }

        if(( (request.files && request.files.newSoundName) && (request.body.checkCurrentSnd || request.body.checkSnd) ) || (request.body.checkSnd && request.body.checkCurrentSnd)){
            errors.push("You can only choose one sound file")
        }

        if(errors.length == 0){
            dbCharacters.updateCharacter(newName, newDescription, newImageName, newSoundName, id, function(error){
                if(error){
                    console.log(error)
                    const model = {
                        dbError: true
                    }
                    response.render('update-character.hbs', model)

                } else {
                    response.redirect('/characters')
                }
            })

        } else {
            const model = {
                errors,
                newName,
                newDescription,
                newImageName,
                newSoundName,
                id
            }
            response.render('update-character.hbs', model)
        }

    } else {
        response.redirect('/login')
    }
})

//--------------specific character-------------
router.get('/:id', function(request, response){
    const id = request.params.id

    dbCharacters.getSpecificCharacter(id, function(error, character){
        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('character.hbs', model)
        } else {
            const model = {
                dbError: false,
                character
            }
            response.render('character.hbs', model)
        }      
    }) 
})

//------------------delete character---------------------
router.post('/delete/:id', function(request, response){
    if(request.session.isLoggedIn){
        const id = request.params.id

        dbCharacters.deleteCharacter(id, function(error){
            if(error){
                console.log(error)
            }
            dbBooks.setCharIDToNULL(id, function(error){
                if(error){
                    console.log(error)
                }
                dbMovies.setCharIDToNULL(id, function(error){
                    if(error){
                        console.log(error)
                    }
                    response.redirect('/characters')
                })  
            })  
        })

    } else {
        response.redirect('/login')
    }
})