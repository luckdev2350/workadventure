import socketIO = require('socket.io');
import {Socket} from "socket.io";
import * as http from "http";
import {MessageUserPosition} from "../Model/Websocket/MessageUserPosition"; //TODO fix import by "_Model/.."
import {ExSocketInterface} from "../Model/Websocket/ExSocketInterface"; //TODO fix import by "_Model/.."
import Jwt, {JsonWebTokenError} from "jsonwebtoken";
import {SECRET_KEY} from "../Enum/EnvironmentVariable"; //TODO fix import by "_Enum/..."
import {ExtRooms, RefreshUserPositionFunction} from "../Model/Websocket/ExtRoom";
import {ExtRoomsInterface} from "_Model/Websocket/ExtRoomsInterface";
import {ExtWebSocket} from "../../../../publicis/sources/api/src/Entities/WebSocket/ExtWebSocket";

export class IoSocketController{
    Io: socketIO.Server;
    constructor(server : http.Server) {
        this.Io = socketIO(server);

        // Authentication with token. it will be decoded and stored in the socket.
        this.Io.use( (socket: Socket, next) => {
            if (!socket.handshake.query || !socket.handshake.query.token) {
                return next(new Error('Authentication error'));
            }
            Jwt.verify(socket.handshake.query.token, SECRET_KEY, (err: JsonWebTokenError, tokenDecoded: object) => {
                if (err) {
                    return next(new Error('Authentication error'));
                }
                (socket as ExSocketInterface).token = tokenDecoded;
                next();
            });
        });

        this.ioConnection();
        this.shareUsersPosition();
    }

    ioConnection() {
        this.Io.on('connection',  (socket: Socket) => {
            /*join-rom event permit to join one room.
                message :
                    userId : user identification
                    roomId: room identification
                    position: position of user in map
                        x: user x position on map
                        y: user y position on map
            */
            socket.on('join-room', (message : string) => {
                let messageUserPosition = this.hydrateMessageReceive(message);
                if(messageUserPosition instanceof Error){
                    return socket.emit("message-error", JSON.stringify({message: messageUserPosition.message}))
                }

                //join user in room
                socket.join(messageUserPosition.roomId);

                // sending to all clients in room except sender
                this.saveUserInformation((socket as ExSocketInterface), messageUserPosition);

                //add function to refresh position user in real time.
                let rooms = (this.Io.sockets.adapter.rooms as ExtRoomsInterface);
                rooms.refreshUserPosition = RefreshUserPositionFunction;
                rooms.refreshUserPosition(rooms, this.Io);

                socket.to(messageUserPosition.roomId).emit('join-room', messageUserPosition.toString());
            });

            socket.on('user-position', (message : string) => {
                let messageUserPosition = this.hydrateMessageReceive(message);
                if (messageUserPosition instanceof Error) {
                    return socket.emit("message-error", JSON.stringify({message: messageUserPosition.message}));
                }

                // sending to all clients in room except sender
                this.saveUserInformation((socket as ExSocketInterface), messageUserPosition);

                //refresh position of all user in all rooms in real time
                let rooms = (this.Io.sockets.adapter.rooms as ExtRoomsInterface);
                if(!rooms.refreshUserPosition){
                    rooms.refreshUserPosition = RefreshUserPositionFunction;
                }
                rooms.refreshUserPosition(rooms, this.Io);
            });

            socket.on('webrtc-room', (message : string) => {
                let data = JSON.parse(message);
                socket.join(data.roomId);
                (socket as ExSocketInterface).roomId = data.roomId;

                //if two persone in room share
                if(this.Io.sockets.adapter.rooms[data.roomId].length < 2) {
                    return;
                }
                let clients : Array<any> = Object.values(this.Io.sockets.sockets);

                //send start at one client to initialise offer webrtc
                //send all users in room to create PeerConnection in front
                clients.forEach((client: ExtWebSocket, index : number) => {

                    let clientsId = clients.reduce((tabs : Array<any>, clientId: ExtWebSocket, indexClientId: number) => {
                        if(!clientId.userId || clientId.userId === client.userId){
                            return tabs;
                        }
                        tabs.push({
                            userId: clientId.userId,
                            initiator : index <= indexClientId
                        });
                        return tabs;
                    }, []);

                    client.emit('webrtc-start', JSON.stringify(clientsId));
                });
            });

            socket.on('webrtc-signal', (message : string) => {
                let data : any = JSON.parse(message);

                //send only at user
                let clients: Array<any> = Object.values(this.Io.sockets.sockets);
                for(let i = 0; i < clients.length; i++){
                    let client : ExtWebSocket = clients[i];
                    if(client.userId !== data.receiverId){
                        continue
                    }
                    client.emit('webrtc-signal',  message);
                    break;
                }
            });
        });
    }

    //permit to save user position in socket
    saveUserInformation(socket : ExSocketInterface, message : MessageUserPosition){
        socket.position = message.position;
        socket.roomId = message.roomId;
        socket.userId = message.userId;
    }

    //Hydrate and manage error
    hydrateMessageReceive(message : string) : MessageUserPosition | Error{
        try {
            return new MessageUserPosition(message);
        }catch (err) {
            //TODO log error
            return new Error(err);
        }
    }

    /** permit to share user position
        ** users position will send in event 'user-position'
        ** The data sent is an array with information for each user :
        [
          {
            userId: <string>,
            roomId: <string>,
            position: {
                x : <number>,
                y : <number>,
               direction: <string>
            }
          },
          ...
        ]
     **/
    seTimeOutInProgress : any = null;
    shareUsersPosition(){
        if(this.seTimeOutInProgress){
            clearTimeout(this.seTimeOutInProgress);
        }
        //send for each room, all data of position user
        let arrayMap = (this.Io.sockets.adapter.rooms as ExtRooms).userPositionMapByRoom;
        if(!arrayMap){
            this.seTimeOutInProgress = setTimeout(() => {
                this.shareUsersPosition();
            }, 10);
            return;
        }
        arrayMap.forEach((value : any) => {
            let roomId = value[0];
            this.Io.in(roomId).emit('user-position', JSON.stringify(arrayMap));
        });
        this.seTimeOutInProgress = setTimeout(() => {
            this.shareUsersPosition();
        }, 10);
    }
}
