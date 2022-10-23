const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("Astrid-Lindgren-database.db")

db.run(`
    CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        imageName TEXT,
        soundName TEXT
    )
`)

exports.getAllCharacters = function(callback){
    const query = `SELECT * FROM characters`

    db.all(query, function(error, characters){
        callback(error, characters)
    })
}

exports.addCharacter = function(name, description, imageName, soundName, callback){
    const query = `INSERT INTO characters (name, description, imageName, soundName)
                VALUES(?, ?, ?, ?)`

    const values = [name, description, imageName, soundName]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.getSpecificCharacter = function (id, callback){
    const query = `SELECT * FROM characters WHERE id = ?`
    const values = [id]

    db.get(query, values, function(error, character){
        callback(error, character)
    })

}

exports.updateCharacter = function(name, description, imageName, soundName, id, callback){
    const query = `UPDATE characters SET name = ?, description = ?, imageName = ?, soundName = ? WHERE id = ?`
    const values = [name, description, imageName, soundName, id]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.deleteCharacter = function (id, callback){
    const query = `DELETE FROM characters WHERE id = ?`
    const values = [id]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.getNameAndIdFromCharacters = function(callback){
    const query = `SELECT id, name FROM characters ORDER BY id`

    db.all(query, function(error, characters){
        callback(error, characters)
    })
}

exports.getSelectedCharacterValues = function (characterSelected, callback){

    const query = `SELECT id, name FROM characters WHERE id = ?`
    const values = [characterSelected]

    db.get(query, values, function(error, characterSelectedValues){
        callback(error, characterSelectedValues)
    })
}

