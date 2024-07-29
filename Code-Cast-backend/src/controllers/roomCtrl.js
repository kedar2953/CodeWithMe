const Room = require('./../DB/schema/room')
const User = require('./../DB/schema/user')

async function createRoom(req, res) {
    try {

        //room data will be passed from req from frontend
        const room = new Room(req.room)
        await room.save()

        

        //finding the entry of user which has requested to create room so that we can add the room in user's room array
        const user = await User.findById(req.user._id)
        console.log(room.owner);
        user.rooms.push(room._id)
        user.save()
        res.status(200).send({ room: room })
    }
    catch (e) {
        console.log('error in createRoom', e)
        res.status(400).send('failed to create room')
    }
}


//fetching the data of particular room
async function fetch(req, res) {
    try {
        const roomid = (req.query.id);
        const room = await Room.findOne({ roomid })
        if (!room)
            return res.status(404).send();
        res.status(200).send({ room: room })
    }
    catch (e) {
        console.log('error in fetch', e)
        res.status(400).send('failed to fetch room details')
    }
}



async function updateRoomInDatabase(req, res) {
    try {
        const roomid = req.body.room.roomid;
        const room = await Room.findOneAndUpdate({
            roomid
        }, {
            name: req.body.room.name || "",
            code: req.body.room.code || "",
            language: req.body.room.language || ""
        }, {
            new: true,
            runValidators: true
        })

        res.status(200).send(room)
    }
    catch (e) {
        console.log('error in updateRoom', e)
        res.status(400).send(e)
    }
}

async function deleteRoom(req, res) {
    try {
        const _id = req.body.id;
        const room = await Room.findByIdAndDelete(_id)
        if (!room)
            return res.status(404).send();
        res.status(200).send(room)
    }
    catch (e) {
        console.log('error in deleteRoom', e)
        res.status(400).send('failed to delete room')
    }
}

module.exports = {
    createRoom,
    fetch,
    updateRoomInDatabase,
    deleteRoom
}