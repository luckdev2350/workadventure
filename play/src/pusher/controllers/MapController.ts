import { isMapDetailsData } from "@workadventure/messages";
import { z } from "zod";
import type { Request, Response } from "hyper-express";
import { JsonWebTokenError } from "jsonwebtoken";
import { DISABLE_ANONYMOUS } from "../enums/EnvironmentVariable";
import { adminService } from "../services/AdminService";
import { validateQuery } from "../services/QueryValidator";
import { BaseHttpController } from "./BaseHttpController";

export class MapController extends BaseHttpController {
    // Returns a map mapping map name to file name of the map
    routes(): void {
        /**
         * @openapi
         * /map:
         *   get:
         *     description: Returns a map mapping map name to file name of the map
         *     produces:
         *      - "application/json"
         *     parameters:
         *      - name: "playUri"
         *        in: "query"
         *        description: "The full URL of WorkAdventure to load this map"
         *        required: true
         *        type: "string"
         *      - name: "authToken"
         *        in: "query"
         *        description: "The authentication token"
         *        required: true
         *        type: "string"
         *     responses:
         *       200:
         *         description: The details of the map
         *         schema:
         *           oneOf:
         *            - $ref: "#/definitions/MapDetailsData"
         *            - $ref: "#/definitions/RoomRedirect"
         *       401:
         *         description: Error while retrieving the data because you are not authorized
         *         schema:
         *             $ref: '#/definitions/ErrorApiRedirectData'
         *       403:
         *         description: Error while retrieving the data because you are not authorized
         *         schema:
         *             $ref: '#/definitions/ErrorApiUnauthorizedData'
         *       404:
         *         description: Error while retrieving the data
         *         schema:
         *             $ref: '#/definitions/ErrorApiErrorData'
         *
         */
        this.app.get("/map", async (req: Request, res: Response) => {
            const query = validateQuery(
                req,
                res,
                z.object({
                    playUri: z.string(),
                    authToken: z.string().optional(),
                })
            );
            if (query === undefined) {
                return;
            }

            try {
                let mapDetails = await adminService.fetchMapDetails(
                    query.playUri,
                    query.authToken,
                    req.header("accept-language")
                );

                const mapDetailsParsed = isMapDetailsData.safeParse(mapDetails);
                if (DISABLE_ANONYMOUS && mapDetailsParsed.success) {
                    mapDetails = mapDetailsParsed.data;
                    mapDetails.authenticationMandatory = true;
                }

                res.json(mapDetails);
                return;
            } catch (e) {
                if (e instanceof JsonWebTokenError) {
                    console.warn("Invalid token received", e);
                    res.status(401);
                    res.send("The Token is invalid");
                    return;
                } else {
                    throw e;
                }
            }
        });
    }
}
