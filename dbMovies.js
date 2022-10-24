const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("ASTRIDNETWORLD.db")

db.run(`
    CREATE TABLE IF NOT EXISTS movies (
            movieID INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            imgName TEXT,
            year INTEGER,
            description TEXT,
            char_id INTEGER,
            CONSTRAINT fk_char_id
                FOREIGN KEY (char_id) REFERENCES characters(id)

    )
`)

exports.getAllMovies = function(callback){
    const query = `SELECT * FROM movies`

    db.all(query, function(error, movies){
        callback(error, movies)
    })
}

exports.addMovie = function(title, imgName, year, description, characterSelected, callback){
    const query = `INSERT INTO movies (title, imgName, year, description, char_id)
                VALUES(?, ?, ?, ?, ?)`

        const values = [title, imgName, year, description, characterSelected]

        db.run(query, values, function(error,){
            callback(error)
        })
}

exports.getMovieWithCharacter = function(id, callback){
    const query = `SELECT * FROM characters JOIN movies ON characters.id=movies.char_id WHERE movies.movieID = ?`
    const value = [id]

    db.get(query, value, function(error, movie){
        callback(error, movie)
    })
}

exports.updateMovie = function(newTitle, newImageName, newDescription, newYear, newCharacterSelectedID, id, callback){
    const query = `UPDATE movies SET title = ?, imgName = ?, year = ?, description = ?, char_id = ? WHERE movieID = ?`
    const values = [newTitle, newImageName, newYear, newDescription, newCharacterSelectedID, id]

    db.run(query, values, function(error){
        callback(error)
    })
}   

exports.deleteMovie = function(id, callback){
    const query = `DELETE FROM movies WHERE movieID = ?`
    const values = [id]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.setCharIDToNULL = function(id, callback){
    const query = `UPDATE movies SET char_id = NULL WHERE char_id = ?`
    const value = [id]

    db.run(query, value, function(error){
        callback(error)
    })
}

