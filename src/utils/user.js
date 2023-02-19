// here are some functions(aadUser, removeUser, getUser, getUsersInRoom) that store data from users

const users = []

const addUser = ({id, username, room}) => {
    //clean data of user: maybe there is space in before or after the username, or change the name of room to lowercase if user write with uppercase
     username = username.trim().toLowerCase()
     room = room.trim().toLowerCase()

    //validate the data when user want to join, should fill username and room in join page
    if(!username || !room ){
        return{
            'error' : 'username and room should be fill'
        }
    }

    //chck if new username want to join with name that already is in same room 
    const existingUser = users.find((user) => {
        return(user.room === room && user.username === username)
    })
    if(existingUser){
        return {
            error: 'username is in use!!!'
        }
    }

    //save data that user is joining to the room
    const user = {id, username, room}
    users.push(user)
    return {user}

}


//removeUser function: remove user with same id and when find same id, first user with same id will remove
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    //-1 means: no match id
    // 0 number and positive numbers means: match id
    if(index != -1){
        return users.splice(index, 1)[0]
    }
}




//getUser function
const getUser = (id) => {
    return users.find((user) => user.id === id)
}


//getUsersInRoom function: fetch users with room name
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room)  
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}




// addUser({
//     id: 1,
//     username: "mina",
//     room: "friends98"
// })
// addUser({
//     id: 1,
//     username: "maryam",
//     room: "friends98"
// })
// addUser({
//     id: 2,
//     username: "reza",
//     room: "friends98"
// })
// console.log("before remove: ", users)

//  const removedUser =  removeUser(1)
//  console.log(removedUser)
//  console.log("after remove: ", users)

// console.log(getUser(1))

// const usersList = getUsersInRoom('friends98')
// console.log(usersList)