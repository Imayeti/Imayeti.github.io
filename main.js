// main.js
import { 
    playerAttackButton,
    playerDiceElement,
    playerDiceRollResult,
    combatSection,
    environmentImageElement,
    dungeonCanvas,
    drawingContext,
    modal,
    btn,
    span,
} from './dom-elements.js';
import { store } from './store.js';
import { Monster, Player } from './classes.js';
import { chance, randomBetween, randomId } from './utilities.js';
import { canMoveToTile, discoverSurroundingTiles, gameLoop } from './movement.js';
import { generateAndLoadNextLevelRoom, placeMerchantInCurrentRoom } from './dungeon.js';
import { renderVisibleTiles, updateEnvironmentPreview, convertDirectionToOffset } from './environment.js';
import { 
  updateCombatUI, 
  notify, 
  concludeCombat, 
  removeDefeatedEnemies, 
  processEnemyTurn 
} from './combat.js';
import { TILE_SIZE, ENEMY_SIZE } from './constants.js';
import { checkForPlayerEnemyOverlap } from './combat.js';
import { createMerchant } from './merchant.js';



// When the user clicks the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Create the player
store.playerCharacter = new Player(100, 1, 1);

// Movement & Attack hotkey
document.addEventListener('keydown', (e) => {
  // Press space to Attack
  if (e.key === ' ') {
    playerAttackButton.click();
  } else if (e.key === 'Escape') {
    modal.style.display = "none";
  }

  
  // If in combat, ignore movement
  if (store.isInCombat) return;

  let movementDirection = null;
  if (e.key === 'ArrowUp')    movementDirection = 'up';
  else if (e.key === 'ArrowDown')  movementDirection = 'down';
  else if (e.key === 'ArrowLeft')  movementDirection = 'left';
  else if (e.key === 'ArrowRight') movementDirection = 'right';
  else return;

  if (movementDirection !== store.currentFacingDirection) {
    // Just turning
    store.currentFacingDirection = movementDirection;
    updateEnvironmentPreview(environmentImageElement);
    renderVisibleTiles(drawingContext, dungeonCanvas);
  } else {
    // Attempt to move
    const { xOffset, yOffset } = convertDirectionToOffset(store.currentFacingDirection);
    const nextTileX = store.playerTileX + xOffset;
    const nextTileY = store.playerTileY + yOffset;

    if (canMoveToTile(nextTileX, nextTileY)) {
      store.playerTileX = nextTileX;
      store.playerTileY = nextTileY;

      const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
      activeRoom.discovered[nextTileY][nextTileX] = true;
      discoverSurroundingTiles(nextTileX, nextTileY);

      const tileValue = activeRoom.map[nextTileY][nextTileX];
      // healing tile
      if (tileValue === 4) {
        store.playerCharacter.health = store.playerCharacter.startingHealth;
        notify("You have been fully healed!");
        updateCombatUI();
        activeRoom.map[nextTileY][nextTileX] = 0;
      }
      // chest
      if (tileValue === 5) {
        handleChestLoot(activeRoom, nextTileX, nextTileY);
      }
      // door
      else if (tileValue === 2) {
        if (store.currentDungeonLevel < store.MAX_DUNGEON_LEVELS) {
          store.currentDungeonLevel++;
          notify(`You proceed to level ${store.currentDungeonLevel}!`);
          generateAndLoadNextLevelRoom();
          return;
        } else {
          notify("You have completed all levels! You Win!");
        }
      }
      // merchant
      else if (tileValue === 6) {
        modal.style.display = "block";
        // updateCombatUI();
      } else {
        modal.style.display = "none";
      }


      updateEnvironmentPreview(environmentImageElement);
      renderVisibleTiles(drawingContext, dungeonCanvas);
      // check collision with enemies
      checkForPlayerEnemyOverlap();
    }
  }
});

// Handle player Attack button
playerAttackButton.addEventListener('click', takePlayerTurn);

export async function takePlayerTurn(item) {
    if (!store.currentBattleMonster || store.currentBattleMonster.health <= 0 || store.isPlayerRollingDice) {
        return 'player cannot attack';
    }

    store.isPlayerRollingDice = true;


    let playerRollValue = 0;

    if (!item.effect) {        
        // Player dice roll
        playerRollValue = await performPlayerDiceRoll();

        if (playerRollValue <= 1) {
            notify("You missed!");
            await waitAndEnemyTurn();
            return;
        }
    } 

    const totalPlayerDamage = item.effect ?? store.playerCharacter.attack + playerRollValue;
    // total damage
    
    store.currentBattleMonster.health -= totalPlayerDamage;
    notify(`You dealt ${totalPlayerDamage} damage to ${store.currentBattleMonster.name}.`);

    updateCombatUI();

    // If enemy dead
    if (store.currentBattleMonster.health <= 0) {
        store.isPlayerRollingDice = false;
        notify(`${store.currentBattleMonster.name} is defeated!`);
        store.currentBattleMonster.defeated = true;

        removeDefeatedEnemies();
        concludeCombat(combatSection);
        renderVisibleTiles(drawingContext, dungeonCanvas);
        updateEnvironmentPreview(environmentImageElement);
        return;
    }

    await waitAndEnemyTurn();
}

/**
 * Perform the player's dice roll
 */
async function performPlayerDiceRoll() {
  const diceType = 'd20';
  playerDiceElement.classList.add('spin');
  await new Promise(resolve => setTimeout(resolve, 350));
  playerDiceElement.classList.remove('spin');

  const rollVal = Math.floor(Math.random() * 20) + 1;
  playerDiceRollResult.textContent = `You rolled ${rollVal}`;
  return rollVal;
}

/**
 * Wait ~1 second, then let the enemy take a turn
 */
async function waitAndEnemyTurn() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  store.isPlayerRollingDice = false;
  processEnemyTurn();
}

/**
 * Handle the chest tile logic: random loot items
 */
function handleChestLoot(activeRoom, tileX, tileY) {
  let itemFound = false;
  if (chance(85)) {
    // Bandage
    if (chance(50)) {
      itemFound = true;
      const bandage = {
        id: randomId(),
        name: 'Bandage',
        type: 'heal',
        effect: randomBetween(25, 35),
        image: 'images/items/health.jpg',
        poa: 'active'
      };
      store.playerCharacter.inventory.push(bandage);
      notify('You found a Bandage that heals for ' + bandage.effect + ' health!');
    }
    // Plasma Dagger
    if (chance(15) && !store.playerCharacter.inventory.find(item => item.name === 'Plasma Dagger')) {
      itemFound = true;
      const plasmaDagger = {
        id: randomId(),
        name: 'Plasma Dagger',
        type: 'attack',
        effect: randomBetween(2, 3),
        image: 'images/weapons/plasma-dagger.jpg',
        poa: 'passive'
      };
      store.playerCharacter.inventory.push(plasmaDagger);
      store.playerCharacter.attack += plasmaDagger.effect;
      notify('You found a Plasma Dagger that hits for ' + plasmaDagger.effect + ' damage!');
    } else if (chance(15) && !store.playerCharacter.inventory.find(item => item.name === 'Aetherweaver')) {
      itemFound = true;
      const aetherweaver = {
        id: randomId(),
        name: 'Aetherweaver',
        type: 'attack',
        effect: randomBetween(2, 4),
        image: 'images/weapons/aetherweaver.jpg',
        poa: 'passive'
      };
      store.playerCharacter.inventory.push(aetherweaver);
      store.playerCharacter.attack += aetherweaver.effect;
      notify('You found an Aetherweaver that hits for ' + aetherweaver.effect + ' damage!');
    } else if (chance(15) && !store.playerCharacter.inventory.find(item => item.name === 'dual-pistols')) {
        itemFound = true;
        const dualPistols = {
          id: randomId(),
          name: 'dual-pistols',
          type: 'attack',
          effect: randomBetween(3, 7),
          image: 'images/weapons/dual-pistols.jpg',
          poa: 'passive'
        };
        store.playerCharacter.inventory.push(dualPistols);
        store.playerCharacter.attack += dualPistols.effect;
        notify('You found Dual Pistols that hit for ' + dualPistols.effect + ' damage!');
    } 
    
    if (chance(20)) {
        itemFound = true;
        const damageBooster = {
            id: randomId(),
            name: 'damage booster',
            type: 'attack',
            effect: randomBetween(1, 3),
            image: 'images/items/damage-booster.jpg',
            poa: 'passive'
        };
        store.playerCharacter.inventory.push(damageBooster);
        store.playerCharacter.attack += damageBooster.effect;

        notify('You found damage booster that increases your attack by ' + damageBooster.effect + '!');
    }


    // Grenade
    if (chance(15)) {
      itemFound = true;
      const grenade = {
        id: randomId(),
        name: 'grenade',
        type: 'attack',
        effect: randomBetween(25,30),
        image: 'images/weapons/grenade.jpg',
        poa: 'active'
      };
      store.playerCharacter.inventory.push(grenade);
      notify('You found a grenade that hits for ' + grenade.effect + ' damage!');
    }
    // Credits
    if (chance(30)) {
      itemFound = true;
      const amount = randomBetween(3, 25);
      store.playerCharacter.credits += amount;
      notify(`You found ${amount} credits!`);
    }
  }

  if (!itemFound) {
    notify('The chest was empty.');
  }

  activeRoom.map[tileY][tileX] = 0;

  updateCombatUI();
}

// -------------------------------------
// Initialize the first level & start loop
// -------------------------------------
store.dungeonRooms = [];
store.monsterLookup = {};
store.currentDungeonLevel = 1;

generateAndLoadNextLevelRoom();

requestAnimationFrame(() => gameLoop(drawingContext, dungeonCanvas));

// Make sure the combat UI is always up-to-date from the start
updateCombatUI();


// Also update environment preview (hallway-level-one-1)
updateEnvironmentPreview(environmentImageElement);