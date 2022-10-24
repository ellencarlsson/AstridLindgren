const { query } = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("ASTRIDNETWORLD.db")

db.run(`
    CREATE TABLE IF NOT EXISTS books (
            bookID INTEGER PRIMARY KEY,
            title TEXT,
            imgName TEXT,
            year INTEGER,
            bookType TEXT,
            illustrator TEXT,
            publisher TEXT,
            description TEXT,
            char_id INTEGER,
            CONSTRAINT fk_char_id
                FOREIGN KEY (char_id) REFERENCES characters(id)

    )
`)

exports.getAllBooks = function(callback){
    const query = `SELECT * FROM books`

    db.all(query, function(error, books){
        callback(error, books)
    })
}

exports.getBookWithCharacter = function(id, callback){
    const query = `SELECT * FROM characters JOIN books ON characters.id = books.char_id WHERE books.bookID = ?`
    const value = [id]

    db.get(query, value, function(error, book){
        callback(error, book)
    })
}

exports.addBook = function(title, imgName, year, bookType, illustrator, publisher, description, characterSelectedID, callback){
    const query = `INSERT INTO books (title, imgName, year, bookType, illustrator, publisher, description, char_id)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?)`

        const values = [title, imgName, year, bookType, illustrator, publisher, description, characterSelectedID]

        db.run(query, values, function(error){
            callback(error)
        })
}

exports.updateBook = function(newTitle, newImgName, newYear, newBookType, newIllustrator, newPublisher, newDescription, newCharacterSelectedID, id, callback){
    const query = `UPDATE books SET title = ?, imgName = ?, year = ?, bookType = ?, illustrator = ?, publisher = ?, description = ?, char_ID = ? WHERE bookID = ?`                         
    const values = [newTitle, newImgName, newYear, newBookType, newIllustrator, newPublisher, newDescription, newCharacterSelectedID, id]
    

    db.run(query, values, function(error){  
        callback(error)
    })
}

exports.deleteBook = function(id, callback){
    const query = `DELETE FROM books WHERE bookID = ?`
    const values = [id]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.setCharIDToNULL = function(id, callback){
    const query = `UPDATE books SET char_id = NULL WHERE char_id = ?`
    const value = [id]

    db.run(query, value, function(error){
        callback(error)
    })
}









