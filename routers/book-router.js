const express = require('express')
const dbBooks = require('../dbBooks.js')
const dbCharacters = require('../dbCharacters.js')
const path = require('node:path')
const { REPL_MODE_STRICT } = require('node:repl')
const validations = require('../validations.js')

const router = express.Router()

module.exports = router

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
            imgError = validations.getValidationErrorsForImg(imgName)
            if(imgError.length != 0){
                errors.push(imgError)

            } else {
                imgFile.mv('/Users/ellencarlsson/AstridLindgren/public/images/img_books/' + imgName, function(error){              
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
        
        errors = validations.getValidationErrorsForBooks(title, year, bookType, illustrator, publisher, description, imgName)


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
            imgError = validations.getValidationErrorsForImg(newImgName)

            if(imgError.length != 0){
                errors.push(imgError)
            } else {
                imgFile.mv('/Users/ellencarlsson/AstridLindgren/public/images/img_books/' + newImgName, function(error){      
                    if(error){
                        console.log(error)
                    } 
                })
            } 
        }   
            
        errors = validations.getValidationErrorsForBooks(newTitle, newYear, newBookType, newIllustrator, newPublisher, newDescription, newImgName)
    
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
