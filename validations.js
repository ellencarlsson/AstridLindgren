const path = require('node:path')

exports.getValidationErrorsForImg = function(fileName, callback){
    const validationErrors = []

    if(!fileName){
        validationErrors.push("Must choose a file")
        return validationErrors
    }

    const arraryOfAllowedFiles = [".jpeg", ".jpg", ".JPEG", ".JPG"]
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

function getValidationErrorsForImg (fileName){
    const validationErrors = []

    if(!fileName){
        validationErrors.push("Must choose a file")
        return validationErrors
    }

    const arraryOfAllowedFiles = [".jpeg", ".jpg", ".JPEG", ".JPG"]
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

function getValidationErrorsForSnd(fileName){
    const validationErrors = []

    if(!fileName){
        validationErrors.push("Must choose a sound file")
        return validationErrors
    }

    const arraryOfAllowedFiles = [".mp3", "MP3"]
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

exports.getValidationErrorsForSnd = function(fileName, callback){
    const validationErrors = []

    if(!fileName){
        validationErrors.push("Must choose a sound file")
        return validationErrors
    }

    const arraryOfAllowedFiles = [".mp3", "MP3"]
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

exports.getValidationErrorsForBooks = function(title, year, bookType, illustrator, publisher, description, imgName, callback){
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

    return validationErrors
}

exports.getValidationErrorsForMovies = function(title, imgName, description, year, callback){
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

exports.getValidationErrorsForCharacter = function(name, description, imageName, soundName, callback){
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