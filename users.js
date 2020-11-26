const users = []

const addUser = ({id,name,room})=>{

    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    const existingUser = users.find((user)=> user.room === room && user.name === name)
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })

    console.log(users)

    if(existingUser){
        return {errorMessage: "username already exists"}
    }

    if(usersInRoom.length === 2 ) return {errorMessage: "only two users are allowed"}
    
    const user = {id,name,room}

    users.push(user)

    return {user}

}

const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
         return users.splice(index,1)[0]
    }
}

const getUser = (id)=> users.find((user) => user.id === id)

const getOtherUser = (id,room) => users.find(user => user.room === room && user.id !== id)

const getUsersInRoom = (room)=> users.filter((user)=> user.room === room)

module.exports = {addUser,removeUser,getUser,getUsersInRoom,getOtherUser,users}