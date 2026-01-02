import { Boot } from './scenes/Boot';
import { StartScreen } from './scenes/StartScreen';
import { MainGame } from './scenes/MainGame';
import { Bench } from './scenes/Bench';
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#020617',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        StartScreen,
        MainGame,
        Bench
    ]
};

const StartGame = (parent: string) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
