const socket=io()
// Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

// Templates
const messageTemplates=document.querySelector('#message-template').innerHTML
const locationmessageTemplates=document.querySelector('#location-message-template').innerHTML
const sidebarTemplates=document.querySelector('#sidebar-template').innerHTML

// Options
 const {username,room}=Qs.parse(location.search, { ignoreQueryPrefix: true })
 const autoscroll=()=>{
    // New Message Element
    const newMessage=$messages.lastElementChild
    // height of new message
    const newMessageStyle= getComputedStyle(newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=newMessage.offsetHeight +newMessageMargin
    console.log(newMessageMargin)

    // visible Height
     const visibleHeight=$messages.offsetHeight
     // Height of container
     const containerHeight=$messages.scrollHeight
     //how far I scrolled
     const scrolloffset=$messages.scrollTop+visibleHeight

     if (containerHeight-newMessageHeight<=scrolloffset){
        $messages.scrollTop=$messages.scrollHeight
     }

}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplates,{
        username:message.username,
        message:message.text,
        createdAt:  moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



socket.on('locationmessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationmessageTemplates,{
        username:message.username,
        url:message.url,
        createdAt:  moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    console.log(room,users)
    const html=Mustache.render(sidebarTemplates,{
        room,
        users

    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message=document.querySelector('input').value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if (error){
            return console.log(error)
        }
        console.log('the message was delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your Browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
            

        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        }
        )
    })
})
console.log(username,room)
socket.emit('join',{username,room},(error)=>{
    if (error){
        alert(error)
        location.href='/'
    }
})