// movement.js
import { store } from './store.js';
import { TILE_SIZE, ENEMY_SIZE, ENEMY_SPEED } from './constants.js';
import { convertDirectionToOffset, renderVisibleTiles } from './environment.js';
import { rectanglesOverlap } from './utilities.js';
import { checkForPlayerEnemyOverlap } from './combat.js';

/**
 * Check if player can move to the tile (not a wall, within bounds, etc.)
 */
export function canMoveToTile(x, y) {
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  if (
    y < 0 || y >= activeRoom.map.length ||
    x < 0 || x >= activeRoom.map[0].length
  ) {
    return false;
  }
  // 1 = wall
  return activeRoom.map[y][x] !== 1;
}

/**
 * Discover the tile around the player
 */
export function discoverSurroundingTiles(px, py) {
  const deltas = [
    [0, 0],  // current tile
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0]
  ];
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  for (let [dx, dy] of deltas) {
    const nearbyX = px + dx;
    const nearbyY = py + dy;
    if (
      nearbyY >= 0 && nearbyY < activeRoom.map.length &&
      nearbyX >= 0 && nearbyX < activeRoom.map[0].length
    ) {
      activeRoom.discovered[nearbyY][nearbyX] = true;
    }
  }
}

/**
 * Move all enemies if not in combat
 */
export function updateAllEnemies() {
  if (store.isInCombat) return;
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];

  for (let enemyObj of activeRoom.enemies) {
    const oldXPos = enemyObj.xPos;
    const oldYPos = enemyObj.yPos;
    let newXPos = oldXPos + (enemyObj.xDir * ENEMY_SPEED);
    let newYPos = oldYPos + (enemyObj.yDir * ENEMY_SPEED);

    // If the enemy can't move to the new spot, choose random direction
    if (!canEnemyMoveToPixel(newXPos, newYPos)) {
      const possibleDirections = [
        { xDir: 0,  yDir: -1 },
        { xDir: 0,  yDir: 1 },
        { xDir: -1, yDir: 0 },
        { xDir: 1,  yDir: 0 }
      ];
      const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      enemyObj.xDir = newDirection.xDir;
      enemyObj.yDir = newDirection.yDir;
      newXPos = oldXPos + (enemyObj.xDir * ENEMY_SPEED);
      newYPos = oldYPos + (enemyObj.yDir * ENEMY_SPEED);

      // If still can't move, skip
      if (!canEnemyMoveToPixel(newXPos, newYPos)) {
        continue;
      }
    }

    // Update enemy position
    enemyObj.xPos = newXPos;
    enemyObj.yPos = newYPos;
  }

  // Check again for collisions
  checkForPlayerEnemyOverlap();
}

/**
 * Check if an enemy can move to a particular pixel (not a wall, door, or healing tile)
 */
function canEnemyMoveToPixel(pixelX, pixelY) {
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  const enemyCenterX = pixelX + (ENEMY_SIZE / 2);
  const enemyCenterY = pixelY + (ENEMY_SIZE / 2);
  const tileX = Math.floor(enemyCenterX / TILE_SIZE);
  const tileY = Math.floor(enemyCenterY / TILE_SIZE);

  if (
    tileY < 0 ||
    tileY >= activeRoom.map.length ||
    tileX < 0 ||
    tileX >= activeRoom.map[0].length
  ) {
    return false;
  }
  const tileValue = activeRoom.map[tileY][tileX];
  // Enemies cannot move onto walls(1), doors(2), or healing(4)
  return (tileValue !== 1 && tileValue !== 2 && tileValue !== 4);
}

/**
 * Main game loop for smooth updates of enemy movement (and re-rendering).
 */
export function gameLoop(drawingContext, dungeonCanvas) {
  // If not in combat, let enemies move
  if (!store.isInCombat) {
    updateAllEnemies();
  }
  renderVisibleTiles(drawingContext, dungeonCanvas);
  requestAnimationFrame(() => gameLoop(drawingContext, dungeonCanvas));
}