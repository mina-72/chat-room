//we use this function instead of repeate some code in index.js and where there is io.emit we can call this function 
//and send some arguments like message and date to it
const generateMessage = (username, text) => {
    return{
        username: username,
        msg: text,
        created: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return{
        username,
        url,
        created: new Date().getTime()
    }
}

module.exports = {generateMessage, generateLocationMessage}