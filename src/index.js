const mongoose = require('mongoose')
const http = require('http')
const express = require('express')
const port = process.env.PORT | 3000
const path = require('path')
// const socketio = require('socket.io')
const { Socket } = require('dgram')
//this module reject messages that contain some words that are bad
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user')
const app = express()
const server = http.createServer(app)
// const io = socketio(server)

const {Server} = require("socket.io")
const {instrument}= require("@socket.io/admin-ui")
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io"]
    }
});

instrument(io, {
    auth: false
})

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

mongoose.connect('mongodb://192.168.20.1/msg', function(err){
    if(err) {
        console.log (err)
    } else{
        console.log('connected to mongodb')
    }
})


var msgSchema = mongoose.Schema({
    username: String,
    msg: String,
    room: String,
    created: {type: Date, default: Date.now} 
})


var msgModel = mongoose.model('msg', msgSchema)


//socket connected
io.on('connection', (socket) =>{
    console.log('new websocket connection')
    

  
    //options is: {username, room}
    socket.on('join', ( options, callback) => {

        const {error, user} = addUser ({id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        //here every socket after connecting(line 20) then can join to specific room (line 25)
        socket.join(user.room)


        msgModel.find({room: user.room}, function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                docs.forEach(element => {
                    // console.log("element :: ", element);
                    socket.emit('message', element)
                });
            }
        });
        //server send message function with welcome to client
        // socket.emit('message', generateMessage('You', 'Welcome!!!'))



        //use socket.broadcast.emit that send message to other clients except the particular client that connected.
        //here send message"a new user join!" to all client that were connected when the new user was join
        //we use socket.broadcast.to.emit: when user join to similar chat room, send {username}has join! just for clients that are in that chat room 
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        //create an event that when user joined, in that room add new username in side bar in chat room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        //send information message to client without any error to that
        callback()
    })

    //server recieve sendMessage function from client
    //this callback is for acknowledgment event
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        //check if message contain bad words send error
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('profanity is not allow!!')
        }

        var newMsg = new msgModel({msg: message, username: user.username, room: user.room, created: user.created})
        newMsg.save(function(err){
            if(err) throw err
            //send user's message to all users that are connect
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
        })
        
    })

    //share location for clients
    // socket.on('sendLocation', (coords, callback) => {
        // const use = getUser(socket.id)
        //io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        // callback()
    // })    

    socket.on('chatmessage', msg => {
        const message  = new msgModel({msg})
        message.save().then(() =>{
            io.emit('message', msg)
        })
    })

    //when user left the chat, send message to other clients that "a user left "
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        //if there is a user: send message that 'A user has left !'
        if (user) {
            
        io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))

        //
        io.to(user.room).emit('userData', {
            room: user.room,
            //user.room is: room name
            users: getUsersInRoom(user.room)
        })
        }
    })

   

})





server.listen(port, () => {
    console.log (`listining to port ${port}`)
})


