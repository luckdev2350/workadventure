import {Application, Request, Response} from "express";
import {OK} from "http-status-codes";
import {ADMIN_API_TOKEN, ADMIN_API_URL} from "../Enum/EnvironmentVariable";
import Axios from "axios";
import {DEBUG_MODE} from "../../../front/src/Enum/EnvironmentVariable";
import {IoSocketController} from "_Controller/IoSocketController";
import Flatted from "flatted";
import {stringify} from "circular-json";

export class DebugController {
    constructor(private App : Application, private ioSocketController: IoSocketController) {
        this.getDump();
    }


    getDump(){
        this.App.get("/dump", async (req: Request, res: Response) => {
            if (req.query.token !== ADMIN_API_TOKEN) {
                return res.status(401).send('Invalid token sent!');
            }

/*            const obj: any = {};

            for (const [worldName, world] of this.ioSocketController.getWorlds().entries()) {
                let users = new Array();
                for (const [worldName, world] of this.ioSocketController.getWorlds().entries()) {

                }


                obj[worldName] = {
                    users: world.getUsers()
                };
            }*/

            return res.status(OK).contentType('application/json').send(stringify(
                this.ioSocketController.getWorlds(),
                (key: any, value: any) => {
                    if(value instanceof Map) {
                        const obj: any = {};
                        for (const [mapKey, mapValue] of value.entries()) {
                            obj[mapKey] = mapValue;
                        }
                        return obj;
                    } else if(value instanceof Set) {
                            const obj: Array<any> = [];
                            for (const [setKey, setValue] of value.entries()) {
                                obj.push(setValue);
                            }
                            return obj;
                    } else {
                        return value;
                    }
                }
            ));
        });
    }
}
