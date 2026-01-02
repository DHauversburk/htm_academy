import Phaser from 'phaser';

// Global event bus for communication between React UI and Phaser Game
export const EventBus = new Phaser.Events.EventEmitter();
