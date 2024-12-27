// combat.js
import { store } from './store.js';
import { waitForMs, performDiceRoll, chance, randomIntFromInterval, rectanglesOverlap } from './utilities.js';
import { placeExitDoorInCurrentRoom, placeMerchantInCurrentRoom } from './dungeon.js';
import { renderVisibleTiles, updateEnvironmentPreview } from './environment.js';
import { enemyHealthLabel, enemyHealthBar, enemyNameLabel, takePlayerTurn } from './main.js';

/**
 * Update the combat UI with current stats
 */
export function updateCombatUI() {
    const playerHealthLabel = document.getElementById('player-health-label');
    const playerHealthBar = document.getElementById('player-health-bar');
    const playerAttackValue = document.getElementById('player-attack-value');
    const playerCredits = document.getElementById('player-credits');
    const playerInventory = document.getElementById('player-inventory');
    const enemyNameLabel = document.getElementById('enemy-name');
    const enemyHealthLabel = document.getElementById('enemy-health-label');
    const enemyHealthBar = document.getElementById('enemy-health-bar');
  // Player credits
  playerCredits.innerHTML = `${store.playerCharacter.credits}`;

  // Inventory
  //@todo move this to a different place in the UI to avoid the flashing on updated
  playerInventory.innerHTML = '';
  for (let item of store.playerCharacter.inventory) {
    const itemImage = document.createElement('img');
    itemImage.style.width = '40px';
    itemImage.src = item.image;
    itemImage.alt = item.name;
    itemImage.title = item.name;
    itemImage.addEventListener('click', () => useLootItem(item));
    playerInventory.appendChild(itemImage);
  }

  // Player info
  playerHealthLabel.innerHTML = `Health: ${store.playerCharacter.health}/${store.playerCharacter.startingHealth}`;
  playerAttackValue.innerHTML = store.playerCharacter.attack;
  refreshHealthBar(playerHealthBar, store.playerCharacter.health, store.playerCharacter.startingHealth);

  // Enemy info
  if (store.currentBattleMonster) {
    enemyNameLabel.innerHTML = store.currentBattleMonster.name;
    enemyHealthLabel.innerHTML = `Health: ${store.currentBattleMonster.health}/${store.currentBattleMonster.startingHealth}`;
    refreshHealthBar(enemyHealthBar, store.currentBattleMonster.health, store.currentBattleMonster.startingHealth);
  } else {
    enemyNameLabel.innerHTML = '';
    enemyHealthLabel.innerHTML = '';
    refreshHealthBar(enemyHealthBar, 0, 100);
  }
}

/**
 * Update width/ color of a health bar
 */
export function refreshHealthBar(barElement, currentValue, maxValue) {
  const percentage = Math.max(0, (currentValue / maxValue) * 100);
  barElement.style.width = percentage + '%';
  barElement.style.backgroundColor = (percentage < 30) ? 'red' : 'green';
}

/**
 * Check if all enemies in the current room are defeated
 */
export function areAllEnemiesDefeated() {
  const enemiesInRoom = store.dungeonRooms[store.currentDungeonRoomIndex].enemies;
  for (let enemyObj of enemiesInRoom) {
    if (!enemyObj.monster.defeated) {
      return false;
    }
  }
  return true;
}

/**
 * Concludes combat (e.g. if monster or player dies)
 */
export function concludeCombat(combatSection) {
  store.currentBattleMonster = null;
  store.isInCombat = false;
  combatSection.style.display = 'block'; // keep UI up
  enemyHealthLabel.innerHTML = ''; 
  enemyHealthBar.innerHTML = '';
  enemyNameLabel.innerHTML = '';

  // If all enemies are down, place the door
  if (areAllEnemiesDefeated()) {
    placeExitDoorInCurrentRoom();
    renderVisibleTiles(document.getElementById('dungeon-canvas').getContext('2d'), document.getElementById('dungeon-canvas'));
  }
}

/**
 * Checks if player & enemy overlap (start combat if so)
 */
export function checkForPlayerEnemyOverlap() {
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  const playerPixelX = store.playerTileX * 30;
  const playerPixelY = store.playerTileY * 30;

  for (let enemyObj of activeRoom.enemies) {
    if (
      rectanglesOverlap(
        playerPixelX,
        playerPixelY,
        30,
        30,
        enemyObj.xPos,
        enemyObj.yPos,
        15,
        15
      )
    ) {
      if (!store.isInCombat && !enemyObj.monster.defeated) {
        store.currentBattleMonster = enemyObj.monster;
        store.isInCombat = true;
        document.getElementById('environment-image').src = store.currentBattleMonster.imagePath;
        document.getElementById('combat-section').style.display = 'block';
        notify(`A ${store.currentBattleMonster.name} appears!`);
        updateCombatUI()
      }
      return;
    }
  }
}

/**
 * Remove defeated enemies from the room
 */
export function removeDefeatedEnemies() {
  lootEnemy();
  store.totalDefeatedMonsters++;
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  activeRoom.enemies = activeRoom.enemies.filter(e => !e.monster.defeated);
}

/**
 * Simulate looting an enemy
 */
export function lootEnemy() {
  if (chance(70)) {
    const amount = randomIntFromInterval(1, 10);
    store.playerCharacter.credits += amount;
    notify(`You found ${amount} credits!`);
  } else {
    notify('Nothing found.');
  }
}

/**
 * Notify the UI
 */
export function notify(message) {
  const notificationMessageDiv = document.getElementById('notification-message');
  notificationMessageDiv.innerHTML = message + '<br>' + notificationMessageDiv.innerHTML;
}

/**
 * Handle using an item from inventory (bandage, grenade, etc.)
 */
export function useLootItem(item) {
  if (item.poa === 'passive') {
    return;
  }

  if (item.type === 'heal') {
    store.playerCharacter.health += item.effect;
    if (store.playerCharacter.health > store.playerCharacter.startingHealth) {
      store.playerCharacter.health = store.playerCharacter.startingHealth;
    }
    notify(`You used ${item.name} and healed ${item.effect} health!`);
  }

  let canAttack = true;

  if (item.name === 'grenade' && store.currentBattleMonster) {
    canAttack = takePlayerTurn(item);
  }

  // remove from inventory
  if (canAttack !== `player cannot attack`) {
    store.playerCharacter.inventory = store.playerCharacter.inventory.filter(i => i.id !== item.id);
  }

  // Update UI
  updateCombatUI();
}

/**
 * The enemy's turn
 */
export async function processEnemyTurn() {
  if (!store.currentBattleMonster || store.currentBattleMonster.health <= 0) {
    return;
  }

  const enemyDiceElement = document.getElementById('enemy-dice');
  const enemyDiceRollResult = document.getElementById('enemy-dice-roll-result');

  // Enemy rolls
  const enemyRollValue = await performDiceRoll(enemyDiceElement, store.currentBattleMonster.diceType);
  enemyDiceRollResult.textContent = `${store.currentBattleMonster.name} rolled ${enemyRollValue}`;

  if (enemyRollValue <= 1) {
    notify(`${store.currentBattleMonster.name} missed!`);
    return;
  }
  const totalEnemyDamage = store.currentBattleMonster.attack + enemyRollValue;
  store.playerCharacter.health -= totalEnemyDamage;
  notify(`${store.currentBattleMonster.name} dealt ${totalEnemyDamage} damage to you!`);

  // Update UI
  updateCombatUI();

  // Check if player dies
  if (store.playerCharacter.health <= 0) {
    store.playerCharacter.health = 0;
    notify("You have been defeated!");
    alert(`Game Over! You defeated ${store.totalDefeatedMonsters} monsters and reached level ${store.currentDungeonLevel}!`);
    concludeCombat(document.getElementById('combat-section'));
  }
}