import * as tg from "generic-type-guard";



export const isHasDataLayerChangedEvent =
    new tg.IsInterface().withProperties({
        data: tg.isObject
    }).get();

/**
 * A message sent from the game to the iFrame when the data of the layers change after the iFrame send a message to the game that it want to listen to the data of the layers
 */
export type DataLayerEvent = tg.GuardedType<typeof isHasDataLayerChangedEvent>;


export type HasDataLayerChangedEventCallback = (event: DataLayerEvent) => void