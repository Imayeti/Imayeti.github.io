

// Grab references from DOM
export const dungeonCanvas = document.getElementById('dungeon-canvas');
export const drawingContext = dungeonCanvas.getContext('2d');
export const environmentImageElement = document.getElementById('environment-image');
export const combatSection = document.getElementById('combat-section');
export const playerHealthLabel = document.getElementById('player-health-label');
export const playerHealthBar = document.getElementById('player-health-bar');
export const playerAttackValue = document.getElementById('player-attack-value');
export const playerInventory = document.getElementById('player-inventory');
export const playerCredits = document.getElementById('player-credits');
export const enemyHealthLabel = document.getElementById('enemy-health-label');
export const enemyHealthBar = document.getElementById('enemy-health-bar');
export const enemyNameLabel = document.getElementById('enemy-name');
export const notificationMessageDiv = document.getElementById('notification-message');
export const playerAttackButton = document.getElementById('player-attack-button');
export const playerDiceElement = document.getElementById('player-dice');
export const enemyDiceElement = document.getElementById('enemy-dice');
export const playerDiceRollResult = document.getElementById('player-dice-roll-result');
export const enemyDiceRollResult = document.getElementById('enemy-dice-roll-result');
//modal elements
export const modal = document.getElementById("modal");
export const btn = document.getElementById("modal-btn");
export const span = document.getElementsByClassName("close")[0];
export const modalInnerContent = document.getElementById("modal-inner-content");