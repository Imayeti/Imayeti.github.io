// dungeon.js
import { store } from './store.js';
import { Monster, Merchant } from './classes.js';
import { randomIntFromInterval, chance, randomBetween, randomId } from './utilities.js';
import { TILE_SIZE, ENEMY_SIZE } from './constants.js';
import { discoverSurroundingTiles } from './movement.js';
import { createMerchant } from './merchant.js';

/**
 * Generates a new random room with walls, chests, etc.
 */
export function generateRandomRoom(
  minWidth = 10,
  maxWidth = 20,
  minHeight = 10,
  maxHeight = 20,
  isBoss = false
) {
  const roomWidth = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
  const roomHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

  let newRoomMap = [];
  let discoveredTiles = [];

  // Initialize floor
  for (let y = 0; y < roomHeight; y++) {
    newRoomMap[y] = [];
    discoveredTiles[y] = [];
    for (let x = 0; x < roomWidth; x++) {
      newRoomMap[y][x] = 0; // floor
      discoveredTiles[y][x] = false;
    }
  }

  // Walls around perimeter
  for (let x = 0; x < roomWidth; x++) {
    newRoomMap[0][x] = 1;
    newRoomMap[roomHeight - 1][x] = 1;
  }
  for (let y = 0; y < roomHeight; y++) {
    newRoomMap[y][0] = 1;
    newRoomMap[y][roomWidth - 1] = 1;
  }

  // 25% chance for a healing tile
  if (Math.random() < 0.25) {
    placeRandomTile(newRoomMap, 4);
  }

  // Up to 6 attempts to place chest tiles
  for (let i = 0; i < 9; i++) {
    if (Math.random() < 0.25) {
      placeRandomTile(newRoomMap, 5, true);
    }
  }

  // Place random walls (10% of total tiles)
  const totalTiles = roomWidth * roomHeight;
  const numberOfWalls = Math.floor(totalTiles * 0.1);
  for (let i = 0; i < numberOfWalls; i++) {
    placeRandomTile(newRoomMap, 1, true);
  }

  // Number of monsters
  //num enemies numMonsters number of eneies number enemies
  let monsterCount = randomIntFromInterval(3, 7);

  // Possible monster templates
  const startingEnemies = [
    {
      name: "Rust Crawler",
      health: 40 + (store.currentDungeonLevel * 2),
      attack: 1,
      dice: 'd6',
      img: 'images/enemies/rust-crawler.png',
      specials: [
        {
            name: "backstab",
            description: "Uses a rust attack",
            chance: 15,
            effect: randomBetween(7,11)
        }
      ]
    },
    {
      name: "Glow Leech",
      health: 60 + (store.currentDungeonLevel * 2),
      attack: 2,
      dice: 'd6',
      img: 'images/enemies/glow-leech.png',
      specials: [
            {
                name: "drain",
                description: "Uses a drain attack",
                chance: 15,
                effect: randomBetween(8,13)
            }
        ]
    },
    {
      name: "Fracture Sentinel",
      health: 30 + (store.currentDungeonLevel * 2),
      attack: 3,
      dice: 'd6',
      img: 'images/enemies/shard-sentinel.jpg',
        specials: [
            {
                name: "shard",
                description: "Uses a shard attack",
                chance: 15,
                effect: randomBetween(9,14)
            }
        ]
    },
    {
      name: "Scrap Vulture",
      health: 55 + (store.currentDungeonLevel * 2),
      attack: 3,
      dice: 'd6',
      img: 'images/enemies/vulture.jpg',
        specials: [
            {
                name: "scratch",
                description: "Uses a scratch attack",
                chance: 15,
                effect: randomBetween(9,14)
            }   
        ]
    },
   
    {
      name: "Viper",
      health: 50 + (store.currentDungeonLevel * 2),
      attack: 4,
      dice: 'd8',
      img: 'images/enemies/viper.jpg',
        specials: [
            {
                name: "poison",
                description: "Uses a poison attack",
                chance: 15,
                effect: randomBetween(10,15)
            }
        ]
    },
  ];

    const levelThreeThroughFiveEnemies = [
        ...startingEnemies,
        {
            name: "Vanguard Stalker",
            health: 45 + (store.currentDungeonLevel * 2),
            attack: 6,
            dice: 'd8',
            img: 'images/enemies/vanguard-stalker.jpg',
            specials: [
                {
                    name: "shock",
                    description: "Uses a shock attack",
                    chance: 25,
                    effect: randomBetween(10,15)
                }
            ]
        },
        {
            name: "Chrono Sentinel",
            health: 70 + (store.currentDungeonLevel * 2),
            attack: 4,
            dice: 'd8',
            img: 'images/enemies/chrono-sentinel.jpg',
            specials: [
                {
                    name: "time warp",
                    description: "Uses a time warp attack",
                    chance: 25,
                    effect: randomBetween(12,18)
                }
            ]
        },
        {
            name: "Mist Reaver",
            health: 40 + (store.currentDungeonLevel * 2),
            attack: 5 + store.currentDungeonLevel,
            dice: 'd12',
            img: 'images/enemies/mist-reaver.jpg',
            specials: [
                {
                    name: "mist",
                    description: "Uses a mist attack",
                    chance: 25,
                    effect: randomBetween(10,20)
                }
            ]
        },
    ];

  let enemies = store.currentDungeonLevel <= 3 ? startingEnemies : levelThreeThroughFiveEnemies;

  if (isBoss) {
    console.log('boss level')

    if (store.currentDungeonLevel > 4) {
      enemies = [
        {
          name: "Ancient Golem",
          health: 250 + (store.currentDungeonLevel * 2),
          attack: 20 + store.currentDungeonLevel,
          dice: 'd20',
          img: 'images/enemies/ancient-golem.jpg',
          specials: [
            {
              name: "fire stone punch",
              description: "fire stone punch attack",
              chance: 25,
              effect: randomBetween(30, 50)
            }
          ]
        }
      ];
    } else {
      enemies = [
        {
          name: "Molten Giant",
          health: 100 + (store.currentDungeonLevel * 2),
          attack: 10 + store.currentDungeonLevel,
          dice: 'd20',
          img: 'images/enemies/molten-giant.jpg',
          specials: [
            {
              name: "molten slash",
              description: "molten slash attack",
              chance: 25,
              effect: randomBetween(20, 27)
            }
          ]
        }
      ];
    }


    monsterCount = 1;
  }

  // Track positions of monsters
  let enemyPositions = [];

  // Place monster tiles
  const newRoomIndex = store.dungeonRooms.length;

  for (let i = 0; i < monsterCount; i++) {
    const { x, y } = placeRandomTile(newRoomMap, 3, true);
    const monsterTemplate = enemies[Math.floor(Math.random() * enemies.length)];
    const newMonster = new Monster(
      monsterTemplate.name,
      monsterTemplate.health,
      monsterTemplate.attack,
      monsterTemplate.dice,
      monsterTemplate.img,
      monsterTemplate.specials 
    );
    store.monsterLookup[`${newRoomIndex}-${x}-${y}`] = newMonster;
    enemyPositions.push({ x, y });
  }

  // Pick a random start position for the player
  let startTileX, startTileY;
  do {
    startTileX = Math.floor(Math.random() * roomWidth);
    startTileY = Math.floor(Math.random() * roomHeight);
  } while (newRoomMap[startTileY][startTileX] !== 0 && newRoomMap[startTileY][startTileX] !== 4);

  return {
    map: newRoomMap,
    discovered: discoveredTiles,
    startX: startTileX,
    startY: startTileY,
    width: roomWidth,
    height: roomHeight,
    enemyPositions: enemyPositions
  };
}

/**
 * Places tileType in a random location in the map
 */
export function placeRandomTile(roomMap, tileType, mustBeEmpty = false) {
  const mapHeight = roomMap.length;
  const mapWidth = roomMap[0].length;

  let tries = 1000;
  while (tries-- > 0) {
    const randomX = Math.floor(Math.random() * mapWidth);
    const randomY = Math.floor(Math.random() * mapHeight);
    if (!mustBeEmpty || (mustBeEmpty && roomMap[randomY][randomX] === 0)) {
      if (roomMap[randomY][randomX] === 0) {
        roomMap[randomY][randomX] = tileType;
        return { x: randomX, y: randomY };
      }
    }
  }
  return { x: 0, y: 0 }; // fallback
}

/**
 * Generate a new room for the next level, load it into store, and position the player
 */
export function generateAndLoadNextLevelRoom(isBoss = false) {
    console.log('isboss', isBoss)
  const {
    map,
    discovered,
    startX,
    startY,
    width,
    height,
    enemyPositions
  } = generateRandomRoom(
     10,
      20,
      10,
      20,
      isBoss
  );

  // Prepare enemies
  let enemiesInThisRoom = [];
  for (let position of enemyPositions) {
    let enemyPixelX = position.x * TILE_SIZE + (TILE_SIZE - ENEMY_SIZE) / 2;
    let enemyPixelY = position.y * TILE_SIZE + (TILE_SIZE - ENEMY_SIZE) / 2;

    const monsterKey = `${store.dungeonRooms.length}-${position.x}-${position.y}`;
    const monsterRef = store.monsterLookup[monsterKey];

    const directionsArray = [
      { xDir: 0,  yDir: -1 },
      { xDir: 0,  yDir: 1 },
      { xDir: -1, yDir: 0 },
      { xDir: 1,  yDir: 0 }
    ];
    const randomDirection = directionsArray[Math.floor(Math.random() * directionsArray.length)];

    enemiesInThisRoom.push({
      xPos: enemyPixelX,
      yPos: enemyPixelY,
      xDir: randomDirection.xDir,
      yDir: randomDirection.yDir,
      monster: monsterRef
    });
  }

  // Save the new room
  store.dungeonRooms[store.currentDungeonLevel - 1] = {
    map,
    discovered,
    startX,
    startY,
    width,
    height,
    enemies: enemiesInThisRoom
  };

  // Set current room index
  store.currentDungeonRoomIndex = store.currentDungeonLevel - 1;

  // Place the player
  store.playerTileX = startX;
  store.playerTileY = startY;
  discovered[store.playerTileY][store.playerTileX] = true;
  discoverSurroundingTiles(store.playerTileX, store.playerTileY);

  // Reset states
  store.isInCombat = false;
  store.currentBattleMonster = null;
  store.currentFacingDirection = 'up';

  // place merchant
  if (chance(90)) {
      createMerchant(); 
      const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
      placeRandomTile(activeRoom.map, 6)
  }
}

/**
 * @todo unused
 * Places an exit door in the current room (tile = 2)
 */
export function placeExitDoorInCurrentRoom() {
  // const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];
  
  // Only place if not beyond max level
  // if (store.currentDungeonLevel <= store.MAX_DUNGEON_LEVELS) {
  //   const width = activeRoom.map[0].length;
  //   const height = activeRoom.map.length;
  //   const randomX = Math.floor(Math.random() * (width - 2)) + 1;
  //   const doorY = height - 1;
  //   if (store.currentDungeonLevel === 2) {
  //       activeRoom.map[doorY][randomX] = 7;
  //   } else if (store.currentDungeonLevel === 5) {
  //     activeRoom.map[doorY][randomX] = 8;
  //   } else {
  //       activeRoom.map[doorY][randomX] = 2;
  //   }
  // }
}

/**
 * @todo unused
 * Place a merchant tile in the current room (tile = 6)
 */
export function placeMerchantInCurrentRoom() {


  // const activeRoom = store.dungeonRooms[store.currentDungeonRoomIndex];

  // if (store.currentDungeonLevel <= store.MAX_DUNGEON_LEVELS) {
  //   const width = activeRoom.map[0].length;
  //   const height = activeRoom.map.length;
  //   const randomX = Math.floor(Math.random() * (width - 2)) + 1;
  //   const doorY = height - 1;
  //   activeRoom.map[doorY][randomX] = 6;
  // }
}