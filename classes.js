// classes.js
import { randomId } from './utilities.js';

export class Monster {
  constructor(name, health, attack, diceType, imagePath) {
    this.startingHealth = health;
    this.name = name;
    this.health = health;
    this.attack = attack;
    this.defeated = false;
    this.diceType = diceType;
    this.imagePath = imagePath;
  }
}

export class Player {
  constructor(health, attack) {
    this.startingHealth = health;
    this.health = health;
    this.attack = attack;
    // Give the player a default Bandage in inventory
    this.inventory = [
      {
        id: randomId(),
        name: 'Bandage',
        type: 'heal',
        effect: 20,
        image: 'images/items/health.jpg'
      }
    ];
    this.credits = 0;
    this.experience = 0;
  }
}

export class Merchant {
  constructor(inventory) {
    this.inventory = inventory;
  }
}