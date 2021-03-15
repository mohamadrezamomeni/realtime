const checkAccessRoom = require('../helper/checkAccesRoom'),
    guard = require('../services/guard'),
    jwtverification = require('../helper/jwtVerification'),
    queue = require('../services/queue'),
    mongodb = require('mongodb');

function startUp(chat) {
    chat.on('connection', (socket) => {
        var currentRoomId;
        socket.on('join', (roomID) => {
            if (checkAccessRoom(roomID, socket.user)) {
                queue.sendOneByKey('chat', roomID, `join:${socket.user.Username}`).then(
                    reply => {
                        socket.join(roomID);
                        currentRoomId = roomID;
                        socket.to(roomID).emit('joined', socket.user.Username);
                    }
                ).catch(e => {
                    socket.to(socket.id).emit('error', 'join:failed to join');
                });
            }
        });
        socket.on('message', (message) => {
            if (checkAccessRoom(currentRoomId, socket.user)) {
                var data = JSON.stringify({
                    messageID: mongodb.ObjectId(),
                    message: message,
                    username: socket.user.Username
                });
                queue.sendOneByKey('chat', currentRoomId, `message:${data}`).then(
                    reply => {
                        socket.to(currentRoomId).emit('message', data);
                    }
                ).catch(e => {
                    socket.to(socket.id).emit('error', 'message:failed to send message');
                });
            }
        });
        socket.on('disconnect', () => {
            queue.sendOneByKey('chat', currentRoomId, `leave:${socket.user.Username}`).then(
                reply => {
                    socket.broadcast.in(currentRoomId).emit('user:left', socket.user.Username);
                }
            ).catch(
                _ => {
                }
            )
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