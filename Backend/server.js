const http = require('http');
require('dotenv').config();
const app = require('./app.js');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const projectModel = require('../Backend/models/project.model.js');
const User = require('../Backend/models/usermodel.js');
const { generateResult } = require('../Backend/services/ai.service.js');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        const projectId = socket.handshake.query.projectId;

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId);

        if (!token) {
            return next(new Error('Authentication error'));
        }
        const decoded = jwt.verify(token, process.env.Secret_Key);

        if (!decoded) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();

    } catch (error) {
        next(error);
    }
});

io.on('connection', socket => {
    console.log('A user Connected');

    if (!socket.project || !socket.project._id) {
        console.error("Project data is missing!");
        return;
    }

    socket.roomId = socket.project._id.toString();
    socket.join(socket.roomId);
    console.log(`User joined room: ${socket.roomId}`);

    socket.on('project-message', async (data) => {
        try {
            const user = await User.findOne({ email: data.sender });

            if (!user) {
                console.log("User not found!");
                return;
            }

            const messageData = {
                message: data.message,
                sender: user.email
            };

            const aiIsPresentInMessage = data.message.includes('@ai');

            if (aiIsPresentInMessage) {
                // Broadcast the user's original message so that everyone sees it.
                socket.broadcast.to(socket.roomId).emit('project-message', messageData);

                // Remove the "@ai" trigger from the message to generate the prompt.
                const prompt = data.message.replace('@ai', '');
                const result = await generateResult(prompt);

                // Emit the AI response to everyone (including the sender).
                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
                return;
            }

            console.log("Broadcasting message:", messageData);
            socket.broadcast.to(socket.roomId).emit('project-message', messageData);

        } catch (error) {
            console.error("Error fetching user:", error);
        }
    });

    socket.on('event', data => {
        /* Handle custom event */
    });

    socket.on('disconnect', () => {
        console.log("User Disconnected");
    });
});

server.listen(port,() => {
    console.log(`server is running on port ${port}`);
});
