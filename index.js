const express = require("express")
const socketio = require("socket.io")
const http = require("http")
const cors = require("cors"); //should be used or else some servers restrict the resources that are sent(with socket.io)
const {addUser,removeUser,getUser,getUsersInRoom,getOtherUser,users} = require("./users.js")

const PORT = process.env.PORT || 5000

const router = require("./router")

//not used yet
const { callbackify } = require("util")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(cors());

//connects when socket is created on client side
//socket contains socket id and other information
io.on("connection",(socket)=>{
    console.log("connection:",socket.id)

    socket.on("join",({name,room},callback)=>{
        console.log(name,room)
        //uses addUser function from User.js to add a user to users array
        const {errorMessage,user} = addUser({id: socket.id, name,room})
    
        if(errorMessage){
            console.log(errorMessage)
            // return callback(error)
            socket.emit("message",{errorMessage: `${errorMessage}`}) //<<<<<<<< make it as before if it isn't working
            return null
        } 

        //sends a welcome message to the user when he/she joins
        // socket.emit("message",{user: "admin", text: `${user.name}, welcome to the room ${user.room}.`})
        
        //broadcasts user joined notification to everyone except the user joined(identified using socket id)
        // socket.broadcast.to(user.room).emit("message",{user: "admin", text: `${user.name}, has joined.`})
        
        //join is an inbuilt function the joins the socket(or user) to the room specified
        socket.join(user.room)
        //sends users list to the user room
        io.to(user.room).emit("userData",{users: getUsersInRoom(user.room)})
    })

    socket.on("1playTurn",({i,j,newBooleanArray,newCount},callback)=>{
        //get User function from User.js returns a user with the socket.id associated with it
        const user = getUser(socket.id)
        console.log(user)
        if(user !== undefined){
            //sends an object with user-name and text to the room(every user in room recieves it)
            // console.log(user)
            let otherUser = getOtherUser(user.id,user.room)
            if(otherUser){
                io.to(otherUser.id).emit("2playturn", {i,j,newBooleanArray,newCount});
            } else {
                io.to(user.id).emit("message", {errorMessage: 'NO second user is present.'})
            }           
            //sends updated user list every time a message is sent(not implemented on client side yet)
            io.to(user.room).emit("userData",{users: getUsersInRoom(user.room)})
            console.log("userData",getUsersInRoom(user.room))
            // callback()
        }else{
            socket.emit("message",{user: "admin", text: `This room has been terminated. Please exit or create Another room`})
            // callback()
        } 

        
    })

    socket.on("disconnect user",()=>{
        //removeUser function from User.js removes user associated with socket.id form users array
        //and returns the deleted user
        console.log("inside disconnect")
        const user = removeUser(socket.id)

        if(user){
            //sends a notification to the room that user has left
            io.to(user.room).emit("message",{errorMessage: `${user.name} has left.`})
        }
    })
})

app.use(router)

server.listen(PORT,()=>{console.log(`Server has started on PORT ${PORT}`)})