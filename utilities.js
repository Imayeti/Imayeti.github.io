
/**
 * Rolls a random chance based on the given percentage (0 to 100).
 * @param {number} chance - The percentage chance (0 to 100) to return `true`.
 * @returns {boolean}
 */
export function chance(chance) {
    if (chance < 0 || chance > 100) {
      throw new Error("Chance must be between 0 and 100.");
    }
    return (Math.random() * 100) < chance;
  }
  
  /**
   * Generates a random number between the given min and max (inclusive).
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value.
   * @returns {number}
   */
  export function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generates a random ID (9 chars).
   * @returns {string}
   */
  export function randomId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Generates a random number between min (inclusive) and max (exclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  export function randomBetween(min, max) {
    if (min > max) {
      throw new Error("Min must be less than or equal to Max.");
    }
    return Math.floor(Math.random() * (max - min) + min);
  }
  
  /**
   * Checks if two rectangles overlap
   */
  export function rectanglesOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
      ax < bx + bw &&
      ax + aw > bx &&
      ay < by + bh &&
      ay + ah > by
    );
  }
  
  /**
   * Simple delay utility
   */
  export function waitForMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Simple dice spin animation using CSS class
   */
  export function animateDiceRoll(diceImg) {
    diceImg.classList.add('spin');
    setTimeout(() => diceImg.classList.remove('spin'), 500);
  }
  
  /**
   * Generic dice roll: e.g., d6, d8, d10, d12, d20
   */
  export async function performDiceRoll(diceElement, diceType) {
    let sideCount = 20; // default
    if (diceType === 'd6')  sideCount = 6;
    else if (diceType === 'd8')  sideCount = 8;
    else if (diceType === 'd10') sideCount = 10;
    else if (diceType === 'd12') sideCount = 12;
  
    // Animate dice, then wait
    animateDiceRoll(diceElement);
    await waitForMs(350);
  
    // Return random roll
    return Math.floor(Math.random() * sideCount) + 1;
  }