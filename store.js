// store.js
export const store = {
    // Player & monster data
    playerCharacter: null,
    monsterLookup: {},
    
    // Room data
    dungeonRooms: [],
    currentDungeonRoomIndex: 0,
    currentDungeonLevel: 1,
    totalDefeatedMonsters: 0,
  
    // Gameplay states
    isInCombat: false,
    isPlayerRollingDice: false,
    currentBattleMonster: null,
  
    // Player position & facing
    playerTileX: 0,
    playerTileY: 0,
    currentFacingDirection: 'up',
  
    // Constants / config
    MAX_DUNGEON_LEVELS: 500,

    // Merchant
    merchant: null
  };
  
  // Simple direction arrow lookup
  export const directionArrows = {
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→'
  };