import { PlayerAnimationDirections } from "./Animation";
import type { GameScene } from "../Game/GameScene";
import { UserInputEvent, UserInputManager } from "../UserInput/UserInputManager";
import { Character } from "../Entity/Character";
import { userMovingStore } from "../../Stores/GameStore";
import { RadialMenu, RadialMenuClickEvent, RadialMenuItem } from "../Components/RadialMenu";

export const hasMovedEventName = "hasMoved";
export const requestEmoteEventName = "requestEmote";

export class Player extends Character {
    private previousDirection: string = PlayerAnimationDirections.Down;
    private wasMoving: boolean = false;
    private emoteMenu: RadialMenu | null = null;
    private updateListener: () => void;

    constructor(
        Scene: GameScene,
        x: number,
        y: number,
        name: string,
        texturesPromise: Promise<string[]>,
        direction: PlayerAnimationDirections,
        moving: boolean,
        private userInputManager: UserInputManager,
        companion: string | null,
        companionTexturePromise?: Promise<string>
    ) {
        super(Scene, x, y, texturesPromise, name, direction, moving, 1, true, companion, companionTexturePromise);

        //the current player model should be push away by other players to prevent conflict
        this.getBody().setImmovable(false);

        this.updateListener = () => {
            if (this.emoteMenu) {
                this.emoteMenu.x = this.x;
                this.emoteMenu.y = this.y;
            }
        };
        this.scene.events.addListener("postupdate", this.updateListener);
    }

    moveUser(delta: number): void {
        //if user client on shift, camera and player speed
        let direction = null;
        let moving = false;

        const activeEvents = this.userInputManager.getEventListForGameTick();
        const speedMultiplier = activeEvents.get(UserInputEvent.SpeedUp) ? 25 : 9;
        const moveAmount = speedMultiplier * 20;

        let x = 0;
        let y = 0;
        if (activeEvents.get(UserInputEvent.MoveUp)) {
            y = -moveAmount;
            direction = PlayerAnimationDirections.Up;
            moving = true;
        } else if (activeEvents.get(UserInputEvent.MoveDown)) {
            y = moveAmount;
            direction = PlayerAnimationDirections.Down;
            moving = true;
        }
        if (activeEvents.get(UserInputEvent.MoveLeft)) {
            x = -moveAmount;
            direction = PlayerAnimationDirections.Left;
            moving = true;
        } else if (activeEvents.get(UserInputEvent.MoveRight)) {
            x = moveAmount;
            direction = PlayerAnimationDirections.Right;
            moving = true;
        }
        moving = moving || activeEvents.get(UserInputEvent.JoystickMove);

        if (x !== 0 || y !== 0) {
            this.move(x, y);
            this.emit(hasMovedEventName, { moving, direction, x: this.x, y: this.y });
        } else if (this.wasMoving && moving) {
            // slow joystick movement
            this.move(0, 0);
            this.emit(hasMovedEventName, { moving, direction: this.previousDirection, x: this.x, y: this.y });
        } else if (this.wasMoving && !moving) {
            this.stop();
            this.emit(hasMovedEventName, { moving, direction: this.previousDirection, x: this.x, y: this.y });
        }

        if (direction !== null) {
            this.previousDirection = direction;
        }
        this.wasMoving = moving;
        userMovingStore.set(moving);
    }

    public isMoving(): boolean {
        return this.wasMoving;
    }

    openOrCloseEmoteMenu(emotes: RadialMenuItem[]) {
        if (this.emoteMenu) {
            this.closeEmoteMenu();
        } else {
            this.openEmoteMenu(emotes);
        }
    }

    openEmoteMenu(emotes: RadialMenuItem[]): void {
        this.cancelPreviousEmote();
        this.emoteMenu = new RadialMenu(this.scene, this.x, this.y, emotes);
        this.emoteMenu.on(RadialMenuClickEvent, (item: RadialMenuItem) => {
            this.closeEmoteMenu();
            this.emit(requestEmoteEventName, item.name);
            this.playEmote(item.name);
        });
    }

    isSilent() {
        super.isSilent();
    }
    noSilent() {
        super.noSilent();
    }

    closeEmoteMenu(): void {
        if (!this.emoteMenu) return;
        this.emoteMenu.destroy();
        this.emoteMenu = null;
    }

    destroy() {
        this.scene.events.removeListener("postupdate", this.updateListener);
        super.destroy();
    }
}
