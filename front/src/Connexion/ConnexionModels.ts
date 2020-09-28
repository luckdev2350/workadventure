import {PlayerAnimationNames} from "../Phaser/Player/Animation";
import {UserSimplePeerInterface} from "../WebRtc/SimplePeer";
import {SignalData} from "simple-peer";

export enum EventMessage{
    WEBRTC_SIGNAL = "webrtc-signal",
    WEBRTC_SCREEN_SHARING_SIGNAL = "webrtc-screen-sharing-signal",
    WEBRTC_START = "webrtc-start",
    JOIN_ROOM = "join-room", // bi-directional
    USER_POSITION = "user-position", // From client to server
    USER_MOVED = "user-moved", // From server to client
    USER_LEFT = "user-left", // From server to client
    MESSAGE_ERROR = "message-error",
    WEBRTC_DISCONNECT = "webrtc-disconect",
    GROUP_CREATE_UPDATE = "group-create-update",
    GROUP_DELETE = "group-delete",
    SET_PLAYER_DETAILS = "set-player-details", // Send the name and character to the server (on connect), receive back the id.
    ITEM_EVENT = 'item-event',

    CONNECT_ERROR = "connect_error",
    SET_SILENT = "set_silent", // Set or unset the silent mode for this user.
    SET_VIEWPORT = "set-viewport",
    BATCH = "batch",
}

export interface PointInterface {
    x: number;
    y: number;
    direction : string;
    moving: boolean;
}

export class Point implements PointInterface{
    constructor(public x : number, public y : number, public direction : string = PlayerAnimationNames.WalkDown, public moving : boolean = false) {
        if(x  === null || y === null){
            throw Error("position x and y cannot be null");
        }
    }
}

export interface MessageUserPositionInterface {
    userId: number;
    name: string;
    characterLayers: string[];
    position: PointInterface;
}

export interface MessageUserMovedInterface {
    userId: number;
    position: PointInterface;
}

export interface MessageUserJoined {
    userId: number;
    name: string;
    characterLayers: string[];
    position: PointInterface
}

export interface PositionInterface {
    x: number,
    y: number
}

export interface GroupCreatedUpdatedMessageInterface {
    position: PositionInterface,
    groupId: number
}

export interface WebRtcStartMessageInterface {
    roomId: string,
    clients: UserSimplePeerInterface[]
}

export interface WebRtcDisconnectMessageInterface {
    userId: number
}

export interface WebRtcSignalSentMessageInterface {
    receiverId: number,
    signal: SignalData
}

export interface WebRtcSignalReceivedMessageInterface {
    userId: number,
    signal: SignalData
}

export interface StartMapInterface {
    mapUrlStart: string,
    startInstance: string
}

export interface ViewportInterface {
    left: number,
    top: number,
    right: number,
    bottom: number,
}

export interface BatchedMessageInterface {
    event: string,
    payload: unknown
}

export interface ItemEventMessageInterface {
    itemId: number,
    event: string,
    state: unknown,
    parameters: unknown
}

export interface RoomJoinedMessageInterface {
    users: MessageUserPositionInterface[],
    groups: GroupCreatedUpdatedMessageInterface[],
    items: { [itemId: number] : unknown }
}