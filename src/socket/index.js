const { chat, profile, user }   = require("../../models");
const { Op }    = require("sequelize");
const jwt   = require("jsonwebtoken");

const connectedUser = {}
const socketIo = (io) => {
    let userCount   = 0;
    io.use((socket, next) => {
        if (socket.handshake.auth && socket.handshake.auth.token ) {
            next();
        } else {
            next(new Error("Not Authorized"));
        }
    });
    io.on('connection', (socket) => {
        userCount++;
        console.log('id client connect:', socket.id);
        console.log('client connect:', userCount);

        const userId = socket.handshake.query.id
        connectedUser[userId] = socket.id

        socket.on("load admin contact", async () => {
            try {
                const adminContact = await user.findOne({
                    include: [
                        {
                            model: profile,
                            as: "profile",
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "idUser"]
                            }
                        }
                    ],
                    where: {
                        status: "seller"
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password"],
                    }
                });
        
                socket.emit("admin contact", adminContact);
            } catch (err) {
                console.log(err);
            }
        });
        
        // define listener on event load customer contact
        socket.on("load customer contacts", async () => {
            try {
                let customerContacts = await user.findAll({
                    include: [
                        {
                            model: profile,
                            as: "profile",
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: chat,
                            as: "recipientMessage",
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"]
                            }
                        },
                        {
                            model: chat,
                            as: "senderMessage",
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"]
                            }
                        },
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password"]
                    }
                    ,
                    where   : {
                        status  : "buyer"
                    }
                });
        
                customerContacts = JSON.parse(JSON.stringify(customerContacts))
                customerContacts = customerContacts.map(item => ({
                ...item,
                image: item.profile?.image ? process.env.PATH_FILE + item.profile?.image : null
                }));
                
                socket.emit("customer contacts", customerContacts)
            } catch (err) {
                console.log(err)
            }
        });
        socket.on("load messages", async (payload) => {
            try {
                const token = socket.handshake.auth.token
        
                const tokenKey = process.env.SECRET_KEY
                const verified = jwt.verify(token, tokenKey)
        
                const idRecipient = payload // catch recipient id sent from client
                const idSender = verified.id //id user
        
                const data = await chat.findAll({
                    where: {
                        idSender: {
                            [Op.or]: [idRecipient, idSender]
                        },
                        idRecipient: {
                            [Op.or]: [idRecipient, idSender]
                        }
                    },
                    include: [
                        {
                            model: user,
                            as: "recipient",
                                attributes: {
                                    exclude: ["createdAt", "updatedAt", "password"],
                                }
                        },
                        {
                            model: user,
                            as: "sender",
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "password"],
                            }
                        }
                    ],
                    order: [['createdAt', 'ASC']],
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
                    }
                });
        
                socket.emit("messages", data);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("send message", async (payload) => {
            try {
                const token = socket.handshake.auth.token
        
                const tokenKey = process.env.SECRET_KEY
                const verified = jwt.verify(token, tokenKey)
        
                const idSender = verified.id
        
                const { message, idRecipient } = payload
        
                await chat.create({
                    message,
                    idRecipient,
                    idSender
                });
        
                io.to(socket.id).to(connectedUser[idRecipient]).emit("new message", idRecipient);
            } catch (error) {
                console.log(error);
            }
        });


        socket.on("disconnect", () => {
            userCount--;
            console.log('client disconnect:', userCount);

        })
    });
}
module.exports = socketIo;