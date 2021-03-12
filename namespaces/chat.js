const checkAccessRoom = require('../helper/checkAccesRoom'),
    guard = require('../services/guard'),
    jwtverification = require('../helper/jwtVerification');

function startUp(chat){
    chat.on('connection', (socket) => {
        var currentRoomId;
        socket.on('join', (roomID) => {
            if (checkAccessRoom(roomID, socket.user)) {
                socket.join(roomID);
                currentRoomId = roomID;
                socket.to(roomID).emit('joined', socket.user.Username);
            }
        });
        socket.on('disconnect', () => {
            socket.broadcast.in(currentRoomId).emit('user:left', socket.id);
        })
    });
}


module.exports = (io) => {
    var chat = io.of('/chat');
    chat.use((socket, next) => {
        guard(socket.handshake.query.token).then(
            result => {
                jwtverification(result.data.data.token).then(
                    result => {
                        socket.user = result.data;
                        next()
                    }
                ).catch(
                    _ => {
                        const err = new Error("not authorized");
                        err.message = {content: "Please retry later"};
                        next(err);
                    }
                )
            }
        ).catch(
            _ => {
                const err = new Error("something is going wrong");
                err.message = {content: "Please retry later"};
                next(err);
            }
        );
    });
    startUp(chat);
};