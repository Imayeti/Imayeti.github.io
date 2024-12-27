// environment.js
import { store, directionArrows } from './store.js';
import { TILE_SIZE, ENEMY_SIZE } from './constants.js';

/**
 * Updates the environment image in the top-left corner based on what’s in front of the player
 */
export function updateEnvironmentPreview(environmentImageElement) {
  // If in combat, show the monster's image
  if (store.isInCombat && store.currentBattleMonster) {
    environmentImageElement.src = store.currentBattleMonster.imagePath;
    return;
  }

  // Otherwise, look at the tile in front of the player
  const { xOffset, yOffset } = convertDirectionToOffset(store.currentFacingDirection);
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  const tileAheadX = store.playerTileX + xOffset;
  const tileAheadY = store.playerTileY + yOffset;

  let tileValueAhead = 1;
  if (
    tileAheadY >= 0 && tileAheadY < activeRoom.map.length &&
    tileAheadX >= 0 && tileAheadX < activeRoom.map[0].length
  ) {
    tileValueAhead = activeRoom.map[tileAheadY][tileAheadX];
  }

  // Update the environment image based on the tile type
  if (tileValueAhead === 4) {
    environmentImageElement.src = 'images/rooms/healing-room.png';
  } else if (tileValueAhead === 2) {
    environmentImageElement.src = 'images/rooms/level-one-door.png';
  } else if (tileValueAhead === 1) {
    environmentImageElement.src = 'images/rooms/wall.png';
  } else if (tileValueAhead === 5) {
    environmentImageElement.src = 'images/rooms/chest.png';
  } else if (tileValueAhead === 6) {
    environmentImageElement.src = 'images/chars/merchant.png';
  } else {
    environmentImageElement.src = 'images/rooms/hallway-level-one-1.jpg';
  }
}

/**
 * Draws the visible portion of the dungeon + player + enemies
 */
export function renderVisibleTiles(drawingContext, dungeonCanvas) {
  const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];

  // Clear the canvas
  drawingContext.clearRect(0, 0, dungeonCanvas.width, dungeonCanvas.height);

  // Determine the viewport around the player
  const viewportStartX = Math.max(0, store.playerTileX - 10);
  const viewportStartY = Math.max(0, store.playerTileY - 10);
  const viewportEndX = Math.min(activeRoom.map[0].length, store.playerTileX + 10);
  const viewportEndY = Math.min(activeRoom.map.length, store.playerTileY + 10);

  // Loop over the tiles in the viewport
  for (let y = viewportStartY; y < viewportEndY; y++) {
    for (let x = viewportStartX; x < viewportEndX; x++) {
      if (!activeRoom.discovered[y][x]) {
        drawingContext.fillStyle = "#000"; // undiscovered
      } else {
        const tileValue = activeRoom.map[y][x];
        if (tileValue === 1) {
          drawingContext.fillStyle = "#888"; // wall
        } else if (tileValue === 2) {
          drawingContext.fillStyle = "#00c"; // door
        } else if (tileValue === 4) {
          drawingContext.fillStyle = "#0c0"; // healing
        } else if (tileValue === 5) {
          drawingContext.fillStyle = "#f2d675"; // chest
        } else if (tileValue === 6) {
          drawingContext.fillStyle = "#b8e6bf"; // merchant
        } else {
          drawingContext.fillStyle = "#fff"; // floor
        }
      }
      drawingContext.fillRect(
        (x - viewportStartX) * TILE_SIZE,
        (y - viewportStartY) * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  // Draw the player
  drawingContext.fillStyle = "rgb(13,128,13)";
  drawingContext.fillRect(
    (store.playerTileX - viewportStartX) * TILE_SIZE,
    (store.playerTileY - viewportStartY) * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );

  // Arrow showing player facing direction
  drawingContext.fillStyle = "#fff";
  drawingContext.font = "20px sans-serif";
  drawingContext.textAlign = "center";
  drawingContext.textBaseline = "middle";
  drawingContext.fillText(
    directionArrows[store.currentFacingDirection],
    (store.playerTileX - viewportStartX) * TILE_SIZE + TILE_SIZE / 2,
    (store.playerTileY - viewportStartY) * TILE_SIZE + TILE_SIZE / 2
  );

  // Draw enemies in view
  for (let enemyObj of activeRoom.enemies) {
    const enemyCenterX = enemyObj.xPos + ENEMY_SIZE / 2;
    const enemyCenterY = enemyObj.yPos + ENEMY_SIZE / 2;
    const enemyTileX = Math.floor(enemyCenterX / TILE_SIZE);
    const enemyTileY = Math.floor(enemyCenterY / TILE_SIZE);

    if (
      enemyTileY >= viewportStartY && enemyTileY < viewportEndY &&
      enemyTileX >= viewportStartX && enemyTileX < viewportEndX &&
      activeRoom.discovered[enemyTileY][enemyTileX]
    ) {
      // Compute on-canvas coordinates
      const enemyScreenX = (enemyTileX - viewportStartX) * TILE_SIZE + (ENEMY_SIZE - TILE_SIZE) / 2;
      const enemyScreenY = (enemyTileY - viewportStartY) * TILE_SIZE + (ENEMY_SIZE - TILE_SIZE) / 2;

      drawingContext.fillStyle = "#a00"; // enemy in red
      drawingContext.fillRect(enemyScreenX, enemyScreenY, ENEMY_SIZE, ENEMY_SIZE);
    }
  }
}

/**
 * Convert direction string into numeric tile offsets
 */
export function convertDirectionToOffset(direction) {
  if (direction === 'up')    return { xOffset: 0,  yOffset: -1 };
  if (direction === 'down')  return { xOffset: 0,  yOffset: 1 };
  if (direction === 'left')  return { xOffset: -1, yOffset: 0 };
  if (direction === 'right') return { xOffset: 1,  yOffset: 0 };
  return { xOffset: 0, yOffset: 0 };
}