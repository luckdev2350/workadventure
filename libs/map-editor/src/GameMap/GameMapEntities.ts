import _ from "lodash";
import { EntityData, EntityPrefab, WAMEntityData, WAMFileFormat } from "../types";

export class GameMapEntities {
    private wam: WAMFileFormat;

    private entities: Map<string, EntityData> = new Map<string, EntityData>();

    constructor(wam: WAMFileFormat) {
        this.wam = wam;
    }

    public async initialize(entitiesPrefabsMapPromise: Promise<Map<string, EntityPrefab>>): Promise<void> {
        const prefabsMap = await entitiesPrefabsMapPromise;
        for (const wamEntityData of this.wam.entities) {
            const entityData = this.wamEntityDataToEntityData(wamEntityData, prefabsMap);
            if (entityData) {
                this.addEntity(entityData, false);
            } else {
                console.warn("COULD NOT FIND ENTITY DATA FROM GIVEN ID");
            }
        }
    }

    public addEntity(entityData: EntityData, addToMapProperties = true): boolean {
        if (this.entities.has(entityData.id)) {
            return false;
        }
        this.entities.set(entityData.id, entityData);
        if (addToMapProperties) {
            return this.addEntityToWAM(entityData);
        }
        return true;
    }

    public getEntity(id: string): EntityData | undefined {
        return this.entities.get(id);
    }

    public deleteEntity(id: string): boolean {
        const deleted = this.entities.delete(id);
        if (deleted) {
            return this.deleteEntityFromWAM(id);
        }
        return false;
    }

    public updateEntity(id: string, config: Partial<EntityData>): EntityData {
        const entity = this.getEntity(id);
        if (!entity) {
            throw new Error(`Entity of id: ${id} does not exist!`);
        }
        _.merge(entity, config);
        // TODO: Find a way to update it without need of using conditions
        if (config.properties !== undefined) {
            entity.properties = config.properties;
        }
        this.updateEntityInWAM(entity);
        return entity;
    }

    private addEntityToWAM(entityData: EntityData): boolean {
        if (!this.wam.entities.find((entity) => entity.id === entityData.id)) {
            const wamEntityData: WAMEntityData = {
                ...structuredClone(entityData),
                prefabId: entityData.prefab.id,
            };
            this.wam.entities.push(wamEntityData);
        } else {
            console.warn(`ADD ENTITY FAIL: ENTITY OF ID ${entityData.id} ALREADY EXISTS WITHIN WAM FILE!`);
            return false;
        }
        return true;
    }

    private deleteEntityFromWAM(id: string): boolean {
        const indexToRemove = this.wam.entities.findIndex((entityData) => entityData.id === id);
        if (indexToRemove !== -1) {
            this.wam.entities.splice(indexToRemove, 1);
            return true;
        }
        return false;
    }

    private updateEntityInWAM(entityData: EntityData): boolean {
        const entityIndex = this.wam.entities.findIndex((entity) => entity.id === entityData.id);

        if (entityIndex === -1) {
            console.warn(`CANNOT FIND ENTITY WITH ID: ${entityData.id} IN WAM FILE!`);
            return false;
        }

        this.wam.entities[entityIndex] = this.entityDataToWAMEntityData(entityData);
        return true;
    }

    public getEntities(): EntityData[] {
        return Array.from(this.entities.values());
    }

    private entityDataToWAMEntityData(entityData: EntityData): WAMEntityData {
        return {
            ...structuredClone(entityData),
            prefabId: entityData.prefab.id,
        };
    }

    private wamEntityDataToEntityData(
        wamEntityData: WAMEntityData,
        prefabs?: Map<string, EntityPrefab>
    ): EntityData | undefined {
        const entityPrefab = prefabs?.get(wamEntityData.prefabId);
        if (entityPrefab) {
            return {
                ...structuredClone(wamEntityData),
                prefab: entityPrefab,
            };
        }
        return undefined;
    }
}
