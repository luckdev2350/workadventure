import {ConnexionInterface} from "../Connexion";
import {MediaManager} from "./MediaManager";
let Peer = require('simple-peer');

export class SimplePeer {
    Connexion: ConnexionInterface;
    MediaManager: MediaManager;
    RoomId: string;

    PeerConnexion: any;
    PeerConnexionArray: Array<any> = new Array<any>();

    constructor(Connexion: ConnexionInterface, roomId: string = "test-webrtc") {
        this.Connexion = Connexion;
        this.MediaManager = new MediaManager();
        this.RoomId = roomId;
        this.initialise();
    }

    /**
     * server has two person connected, start the meet
     */
    initialise() {
        return this.MediaManager.getCamera().then(() => {
            //send message to join a room
            this.Connexion.sendWebrtcRomm(this.RoomId);

            //receive message start
            this.Connexion.receiveWebrtcStart((message : string) => {
                this.receiveWebrtcStart(message);
            });

            //receive signal by gemer
            this.Connexion.receiveWebrtcSignal((message : string) => {
                this.receiveWebrtcSignal(message);
            });

        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     *
     */
    receiveWebrtcStart(message: string) {
        let data = JSON.parse(message);

        //create pear connexion of user stared
        this.createPeerConnexion(data.usersId, data.initiator);
    }

    /**
     *
     * @param userId
     * @param initiator
     */
    createPeerConnexion(usersId : Array<string>, initiator : boolean = false) {
        usersId.forEach((userId: any) => {
            if(this.PeerConnexionArray[userId]){
                return;
            }
            this.PeerConnexion = new Peer({initiator: initiator});

            this.PeerConnexion.on('signal', (data: any) => {
                this.sendWebrtcSignal(data);
            });

            this.PeerConnexion.on('stream', (stream: MediaStream) => {
                this.stream(stream);
            });

            this.PeerConnexionArray[userId] = this.PeerConnexion;
            this.addMedia(userId);
        });
    }

    /**
     * permit to send signal
     * @param data
     */
    sendWebrtcSignal(data: any) {
        this.Connexion.sendWebrtcSignal(data, this.RoomId);
    }

    /**
     *
     * @param message
     */
    receiveWebrtcSignal(message: string) {
        let data = JSON.parse(message);
        if(!this.PeerConnexionArray[data.userId]){
            return;
        }
        this.PeerConnexionArray[data.userId].signal(data.signal);
    }

    /**
     * permit stream video
     * @param stream
     */
    stream(stream: MediaStream) {
        this.MediaManager.remoteStream = stream;
        this.MediaManager.remoteVideo.srcObject = this.MediaManager.remoteStream;
    }

    /**
     * Permit to update stream
     * @param stream
     */
     addMedia (userId : any) {
         this.PeerConnexionArray[userId].addStream(this.MediaManager.localStream) // <- add streams to peer dynamically
    }
}