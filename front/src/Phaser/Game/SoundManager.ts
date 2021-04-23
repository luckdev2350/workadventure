import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import BaseSoundManager = Phaser.Sound.BaseSoundManager;
import BaseSound = Phaser.Sound.BaseSound;
import SoundConfig = Phaser.Types.Sound.SoundConfig;

class SoundManager {
    private soundPromises : Map<string,Promise<BaseSound>> = new Map<string, Promise<Phaser.Sound.BaseSound>>();
    public  loadSound (loadPlugin: LoaderPlugin, soundManager : BaseSoundManager, soundUrl: string) : Promise<BaseSound> {
        let soundPromise =  this.soundPromises.get(soundUrl);
        if (soundPromise !== undefined) {
            return soundPromise;
        }
        soundPromise =  new Promise<BaseSound>((res) => {

            let sound = soundManager.get(soundUrl);
            if (sound !== null) {
                return res(sound);
            }
            loadPlugin.audio(soundUrl, soundUrl);
            loadPlugin.once('filecomplete-audio-' + soundUrl, () => res(soundManager.add(soundUrl)));
            loadPlugin.start();
        });
        this.soundPromises.set(soundUrl,soundPromise);
        return soundPromise;
    }

    public async playSound(loadPlugin: LoaderPlugin, soundManager : BaseSoundManager, soundUrl: string, config: SoundConfig) : Promise<void> {
        const sound = await this.loadSound(loadPlugin,soundManager,soundUrl);
        sound.play(config);


    }

    public stopSound(soundManager : BaseSoundManager,soundUrl : string){
        console.log("stop "+ soundManager.get(soundUrl).key);
        soundManager.get(soundUrl).stop();
    }
}
export const soundManager = new SoundManager();