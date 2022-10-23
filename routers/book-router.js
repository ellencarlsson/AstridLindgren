const express = require('express')
const dbBooks = require('../dbBooks.js')
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

    for(i=0; i<arraryOfAllowedFiles.length; i+=1){
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


//------------------book functions----------------
function getValidationErrorsForBooks(title, year, bookType, illustrator, publisher, description, imgName){
    const minLength = 1
    
    const validationErrors = []

    if(title.length < minLength){
        validationErrors.push("Must enter a title")
    } 
    if(description.length < minLength){
        validationErrors.push("Must enter a description")
    }

    if(year.length < minLength){
        validationErrors.push("Must type a year")
    } else if(isNaN(year)){
        validationErrors.push("Year must be a number")
    } else if(year < 1800 || year > 2022) {
        validationErrors.push("Type a year closer to this date ")
    }
    const validationErrorsForImg = getValidationErrorsForImg(imgName)
    if (validationErrorsForImg != 0){
        validationErrors.push(validationErrorsForImg)
    }

    if(bookType.length == 0){
        validationErrors.push("Must enter a bookType")
    }
    if(illustrator.length == 0){
        validationErrors.push("Must enter an illustrator")
    }
    if(publisher.length == 0){
        validationErrors.push("Must enter a publisher")
    }
    

    
    //lägg till character sen

    return validationErrors
}


//------------------all books------------------
router.get('/', function(request, response){
    dbBooks.getAllBooks(function(error, books){
        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('books.hbs', model)

        } else {
            const model = {
                dbError: false,
                books           
            }   
            response.render('books.hbs', model)
        }   
    }) 
})

//-------------------GET add book------------------ 
router.get('/add', function(request, response){
    if(request.session.isLoggedIn){ 
        dbCharacters.getNameAndIdFromCharacters(function(error, character){
            if(error){
                console.log(error)
                const model = {
                    dbError: true
                }
                response.render('add-book.hbs', model)

            } else {
                const model = {
                    dbError: false,
                    character                       
                }
                response.render('add-book.hbs', model)
            }   
        }) 

    } else {   
        response.redirect('/login')        
    }
})

//-------------------POST add book------------------ 
router.post('/add', function(request, response){
    if(request.session.isLoggedIn) {
        const title = request.body.title
        const year = request.body.year
        const bookType = request.body.bookType
        const illustrator = request.body.illustrator
        const publisher = request.body.publisher
        const description = request.body.description
        const characterSelectedID = request.body.selectCharacter 
        var imgName 
        var imgError
        errors = []
        
        if(request.body.checkImg){
            imgName = "noBook.jpeg"

        } else if(request.body.checkCurrentImg){
            imgName = request.body.checkCurrentImg

        } else if (request.files && request.files.imageName){
            var imgFile = request.files.imageName
            imgName = imgFile.name
            imgError = getValidationErrorsForImg(imgName)
            if(imgError){
                errors.push(imgError)

            } else {
                imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_books/' + imgName, function(error){              
                    if(error){
                        console.log(error)
                        const model = {
                            dbError: true
                        }
                        response.render('add-book.hbs', model)
                    } 
                })
            }   
        }   
        
        errors = getValidationErrorsForBooks(title, year, bookType, illustrator, publisher, description, imgName)


        if(( (request.files && request.files.imageName) && (request.body.checkImg || request.body.checkCurrentImg)) ||  (request.body.checkImg && request.body.checkCurrentImg)){
            errors.push("You can only choose one file at the time")
        }
    
        if(errors.length == 0){
            dbBooks.addBook(title, imgName, year, bookType, illustrator, publisher, description, characterSelectedID, function(error, bookID){
                if(error){
                    console.log(error)
                }
                response.redirect('/books/')
            })
               
        } else {
            dbCharacters.getNameAndIdFromCharacters(function(error, character){
                if(error){
                    console.log(error)

                } else {
                    dbCharacters.getSelectedCharacterValues(characterSelectedID, function(error, characterSelectedValues){ 
                        character[character.length+1] = character[characterSelectedID-1]   
                        character.pop()
                        character.splice((characterSelectedID-1), 1)
        
                        const model = { 
                        errors,
                        title,
                        imgName,
                        year,
                        bookType,
                        illustrator,
                        publisher,
                        description,
                        character,
                        characterSelectedValues    
                        }  
                        response.render('add-book.hbs', model)
                    })
                }        
            })
        }
    } else {
        response.redirect('/login')
    }   
})

//-----------------update book-------------
router.get('/update/:id', function(request, response){
    if (request.session.isLoggedIn) {
        const id = request.params.id

        dbBooks.getBookWithCharacter(id, function(error, book){
            if(error){
                console.log(error)
                const model = {
                    dbError: true
                }
                response.render('update-book.hbs', model)

            } else if(!book) {
                const model = {
                    book
                }
                response.render('book.hbs', model)

            } else {
                dbCharacters.getNameAndIdFromCharacters(function(error, character){
                    const model = {
                        dbError: false,
                        character,
                        book,
                        id
                    } 
                    response.render('update-book.hbs', model)
                })   
            }                
        }) 

    } else {
        response.redirect('/login')
    }
})

router.post('/update/:id/', function(request, response){
    if(request.session.isLoggedIn) {
        const id = request.params.id
        const newTitle = request.body.newTitle
        const newYear = request.body.newYear
        const newBookType = request.body.newBookType
        const newIllustrator = request.body.newIllustrator
        const newPublisher = request.body.newPublisher
        const newDescription = request.body.newDescription
        const newCharacterSelectedID = request.body.selectCharacter 
        var newImgName 
        errors = []
    
        if(request.body.checkImg){
            newImgName = "noBook.jpeg"
        } else if(request.body.checkCurrentImg){
            newImgName = request.body.checkCurrentImg
        } else if (request.files && request.files.newImageName){
            var imgFile = request.files.newImageName
            newImgName = imgFile.name
            imgError = getValidationErrorsForImg(newImgName)
            if(imgError){
                errors.push(imgError)
            } else {
                imgFile.mv('/Users/ellencarlsson/Desktop/Webb/astrid-lindgren/public/images/img_books/' + newImgName, function(error){      
                    if(error){
                        console.log(error)
                    } 
                })
            } 
        }   
            
        errors = getValidationErrorsForBooks(newTitle, newYear, newBookType, newIllustrator, newPublisher, newDescription, newImgName)
    
        if(((request.files) && (request.body.checkImg || request.body.checkCurrentImg)) ||  (request.body.checkImg && request.body.checkCurrentImg)){
            errors.push("You can only choose one file at the time")
        }
    
        if(errors.length == 0){
            dbBooks.updateBook(newTitle, newImgName, newYear, newBookType, newIllustrator, newPublisher, newDescription, newCharacterSelectedID, id, function(error){
                if(error){
                    console.log(error)
                    const model = {
                        dbError: true
                    }
                    response.render('update-book.hbs', model)
                }
                response.redirect('/books')
            })
            
        } else {    
            dbCharacters.getNameAndIdFromCharacters(function(error, character){
                if(error){
                    console.log(error)
                    const model = {
                        dbError: true
                    }
                    response.render('update-book.hbs', model)

                } else {
                    dbCharacters.getSelectedCharacterValues(newCharacterSelectedID, function(error, characterSelectedValues){ 
                        if(error){
                            console.log(error)
                            const model = {
                                dbError: true
                            }
                            response.render('update-book.hbs', model)

                        } else {
                            character[character.length+1] = character[newCharacterSelectedID-1]   
                            character.pop()
                            character.splice((newCharacterSelectedID-1), 1)
            
                            const model = { 
                            errors,
                            newTitle,
                            newImgName,
                            newYear,
                            newBookType,
                            newIllustrator,
                            newPublisher,
                            newDescription,
                            character,
                            characterSelectedValues,
                            id    
                            }
                            response.render('update-book.hbs', model)
                        }    
                    })
                }    
            })
        }

    } else {
        response.redirect('/login')
    }
})



//-----------------specific book-------------
router.get('/:id', function(request,response){
    const id = request.params.id

    dbBooks.getBookWithCharacter(id, function(error, book){
        if(error){
            console.log(error)
            const model = {
                dbError: true
            }
            response.render('book.hbs', model)

        } else {
            const model = {
                book,
                dbError: false   
            }   
            response.render('book.hbs', model)
        }      
    }) 
})

//----------------------delete book------------------ 
router.post('/delete/:id', function(request, response){
    if (request.session.isLoggedIn) {
        const id = request.params.id

        dbBooks.deleteBook(id, function(error){  
             if(error){
                console.log(error)

             } else {
                response.redirect('/books')
             }  
         })

    } else {
        response.redirect('/login')
    }
    
})
