import { IoSocketController } from "./controllers/IoSocketController";
import { AuthenticateController } from "./controllers/AuthenticateController";
import { MapController } from "./controllers/MapController";
import { PrometheusController } from "./controllers/PrometheusController";
import { DebugController } from "./controllers/DebugController";
import { AdminController } from "./controllers/AdminController";
import { OpenIdProfileController } from "./controllers/OpenIdProfileController";
import { WokaListController } from "./controllers/WokaListController";
import { SwaggerController } from "./controllers/SwaggerController";
import HyperExpress from "hyper-express";
import cors from "cors";
import { ENABLE_OPENAPI_ENDPOINT, PLAY_URL } from "./enums/EnvironmentVariable";
import { PingController } from "./controllers/PingController";
import { IoSocketChatController } from "./controllers/IoSocketChatController";
import { FrontController } from "./controllers/FrontController";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LiveDirectory = require("live-directory");

class App {
    public app: HyperExpress.compressors.TemplatedApp;

    constructor() {
        const webserver = new HyperExpress.Server();
        this.app = webserver.uws_instance;

        // Global middlewares
        webserver.use(
            cors({
                origin: (origin) => {
                    console.log("coucou2", origin);
                    return PLAY_URL === "*" ? origin : PLAY_URL;
                },
                allowedHeaders: [
                    "Origin",
                    "X-Requested-With",
                    "Content-Type",
                    "Accept",
                    "Authorization",
                    "Pragma",
                    "Cache-Control",
                ],
                credentials: true,
            })
        );

        /**
         * Todo: Replace this lib by the embed static middleware of HyperExpress
         *       when the v3.0 will be released.
         */
        const liveAssets = new LiveDirectory({
            path: "public",
            keep: {
                extensions: [".css", ".js", ".png", ".svg", ".ico", ".xml", ".mp3", ".json", ".html", ".ttf"],
            },
        });

        liveAssets.ready().then(() => {
            console.info("All static assets has been loaded!");
        });

        // Socket controllers
        new IoSocketController(this.app);
        new IoSocketChatController(this.app);

        // Http controllers
        new AuthenticateController(webserver);
        new MapController(webserver);
        new PrometheusController(webserver);
        new DebugController(webserver);
        new AdminController(webserver);
        new OpenIdProfileController(webserver);
        new WokaListController(webserver);
        new PingController(webserver);
        if (ENABLE_OPENAPI_ENDPOINT) {
            new SwaggerController(webserver);
        }
        new FrontController(webserver, liveAssets);
    }
}

export default new App().app;
