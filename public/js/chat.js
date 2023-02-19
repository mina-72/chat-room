const messages = document.getElementById('messages');



// io function use until client connect to server
const socket= io() 

//elements variables that use in code with name of variable instead of name of element because they are repeate many
$messageForm = document.querySelector('#message-form')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')

$sendLocation= document.querySelector('#send-location')

$messages = document.querySelector('#messages')

//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
//Qs: library to parse query in url when we join to chat
//in location.search we have: ?username=mina&room=friends98
//ignoreQueryPrefix: remove "?" in location.search
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// the codes in autoscroll are some css code that are confusing.
const autoscroll =  () => {
    //add new message at the end of messages
    const $newMessage = $messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}



//client receive message function and log welcome
socket.on('message', (message) => {
    //render htmlmessage
    //{message} that use below is message when we type in input box and show in our chat 
    console.log("message: ",message)
    const html = Mustache.render(messageTemplate ,{
        username: message.username,
        message: message.msg,
        created: moment(message.created).format('h:mm a')
    })
    //show message in div messages and each new message show at the end of messages that were, so we render text message that was send
    $messages.insertAdjacentHTML('beforeend', html)
    //after show message, should scroll
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate ,{
        username: message.username,
        url: message.url,
        created: moment(message.created).format('h:mm a')
    })
    //show message in div messages and each new message show at the end of messages that were
    $messages.insertAdjacentHTML('beforeend', html)
})

//listening to 'roomData' event, and show name of room and list of users tht exist in that room in sidebar
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable submit button when send message
    $messageFormButton.setAttribute('disabled', 'disabled')


    //e=event  target=message-form  message=name of input element in index.html
    const message = e.target.elements.message.value
    // client send sendMessage function to server
    //(deliverMessage) is callback that use in server side and this is for acknowledgment
    socket.emit('sendMessage', message, (error)  => {

        //enable submit button when message was send
        $messageFormButton.removeAttribute('disabled')

        //clear input message from box message when the message was send
        $messageFormInput.value = ''

        //focus the input box 
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('the message was delivered!')
    })
})








// when client want to join to room with: same name in same room: send alert message that 'username is in use!!'
// and redirect client to join page
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})




// $sendLocation.addEventListener('click', () => {
//     if(!navigator.geolocation){
//        return alert('geolocation is not support with this browser')
//     }
//     // disable location button to click
//     $sendLocation.setAttribute('disabled', 'disabled')
//     navigator.geolocation.getCurrentPosition((position) => {
//         socket.emit('sendLocation', {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//         }, () => {
//                 // enable button location when fetch the location
//                 $sendLocation.removeAttribute('disabled')
//                 console.log('location shared')

//     })
//     })
// })