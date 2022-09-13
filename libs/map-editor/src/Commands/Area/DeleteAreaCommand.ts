import { GameMap } from '../../GameMap/GameMap';
import { AreaType, ITiledMapRectangleObject } from '../../types';
import { Command } from "../Command";
import { CreateAreaCommandConfig } from './CreateAreaCommand';

export interface DeleteAreaCommandConfig {
    type: "DeleteAreaCommand";
    id: number;
}

export class DeleteAreaCommand extends Command {
    private areaConfig: ITiledMapRectangleObject;

    private gameMap: GameMap;
    
    constructor(gameMap: GameMap, config: DeleteAreaCommandConfig) {
        super();
        this.gameMap = gameMap;
        const areaConfig = gameMap.getGameMapAreas().getArea(config.id, AreaType.Static);
        if (!areaConfig) {
            throw new Error('Trying to delete a non existing Area!');
        }
        this.areaConfig = JSON.parse(JSON.stringify((areaConfig)));
    }

    public execute(): DeleteAreaCommandConfig {
        this.gameMap.getGameMapAreas().deleteAreaById(this.areaConfig.id, AreaType.Static);
        return { type: 'DeleteAreaCommand', id: this.areaConfig.id };
    }

    public undo(): CreateAreaCommandConfig {
        this.gameMap.getGameMapAreas().addArea(this.areaConfig, AreaType.Static);
        return { type: 'CreateAreaCommand', areaObjectConfig: this.areaConfig };
    }
}
