const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const { generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom}=require('./utils/users')


const app=express()
const server=http.createServer(app)
const io=socketio(server)
const port=3000
const publicDirectoryPath=path.join(__dirname,'../public')
let count=0
app.use(express.static(publicDirectoryPath))
io.on('connection',(socket) =>{
    console.log('Web Socket Connection!!!!!!!!!!!')
    
     
    socket.on('join',(Options,callback)=>{
        const {error,user}=addUser({id:socket.id,...Options})
        if (error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage(user.username,'Welcome!!!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username+' joined',''))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        //callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)){
           return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })
    socket.on('sendLocation',(coords,callback)=>{
       console.log(coords)
       const user=getUser(socket.id)
        io.to(user.room).emit('locationmessage',generateLocationMessage(user.username,'https://google.com/maps?q='+ coords.latitude + ','+ coords.longitude))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message',generateMessage( user.username+ ' has left the chatroom',''))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            }) 
        }
        
        
    })
})


server.listen(port,()=>{
    console.log('server is running on port 3000')
})
