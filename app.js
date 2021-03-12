require('dotenv').config();

const port = process.env.PORT || 3000;
const server = require("http").createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    },
    path: "/socket"
});

require('./services/socketInitializer')(io);
require('./namespaces')(io);

server.listen(port, () => {
    console.log(`connect to address ${server.address().port}`);
});

