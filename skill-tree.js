// # File: skill-tree.js
import { store } from './store.js';
import { notify, updateCombatUI } from './combat.js';

// Grab references for the skill tree modal in the DOM
const skillTreeModal = document.getElementById('skill-tree-modal');
const skillTreeCloseBtn = document.querySelector('.close-skill-tree');
const skillPointsDisplay = document.getElementById('skill-points-display');
const skillTreeContainer = document.getElementById('skill-tree-container');

/**
 * Our skill tree data.
 * Each node has:
 *   - id: unique ID
 *   - name: displayed text
 *   - prongClass: CSS class for positioning
 *   - requires: the id of the skill that must be chosen before unlocking
 *   - effect: function that applies the skill effect (e.g. +2 Attack)
 *   - unlocked: whether or not the player can pick it
 *   - chosen: whether the player has already chosen it
 */
const skillNodes = [
  {
    id: 'center',
    name: '',
    prongClass: 'center',
    requires: null,
    effect: () => {},
    unlocked: true,
    chosen: true,
  },
  // Prong 1
  {
    id: 'p1-1',
    name: '+1 Attack',
    prongClass: 'p1-1',
    requires: 'center',
    effect: () => { store.playerCharacter.attack += 1; },
    unlocked: false,
    chosen: false,
  },
  {
    id: 'p1-2',
    name: '+2 Attack',
    prongClass: 'p1-2',
    requires: 'p1-1',
    effect: () => { store.playerCharacter.attack += 2; },
    unlocked: false,
    chosen: false,
  },
  {
    id: 'p1-3',
    name: '+2 Attack',
    prongClass: 'p1-3',
    requires: 'p1-2',
    effect: () => { store.playerCharacter.attack += 2; },
    unlocked: false,
    chosen: false,
  },
  // Prong 2
  {
    id: 'p2-1',
    name: '+1 Defense',
    prongClass: 'p2-1',
    requires: 'center',
    effect: () => { store.playerCharacter.defense += 1; },
    unlocked: false,
    chosen: false,
  },
  {
    id: 'p2-2',
    name: '+2 Defense',
    prongClass: 'p2-2',
    requires: 'p2-1',
    effect: () => { store.playerCharacter.defense += 2; },
    unlocked: false,
    chosen: false,
  },
  {
    id: 'p2-3',
    name: '+2 Defense',
    prongClass: 'p2-3',
    requires: 'p2-2',
    effect: () => { store.playerCharacter.defense += 2; },
    unlocked: false,
    chosen: false,
  },
  // Prong 3
  {
    id: 'p3-1',
    name: '+5 Max Health',
    prongClass: 'p3-1',
    requires: 'center',
    effect: () => {
      store.playerCharacter.startingHealth += 5;
      store.playerCharacter.health += 5;
    },
    unlocked: false,
    chosen: false,
  },
  {
    id: 'p3-2',
    name: '+10 Max Health',
    prongClass: 'p3-2',
    requires: 'p3-1',
    effect: () => {
      store.playerCharacter.startingHealth += 10;
      store.playerCharacter.health += 10;
    },
    unlocked: false,
    chosen: false,
  },
  {
    id: 'p3-3',
    name: '+15 Max Health',
    prongClass: 'p3-3',
    requires: 'p3-2',
    effect: () => {
      store.playerCharacter.startingHealth += 15;
      store.playerCharacter.health += 15;
    },
    unlocked: false,
    chosen: false,
  },
];

// Initialize skill points on the store if not present
if (typeof store.skillPoints === 'undefined') {
  store.skillPoints = 0;
}

/**
 * Renders the skill tree UI inside the modal
 */
export function renderSkillTree() {
  skillTreeContainer.innerHTML = ''; // Clear existing
  skillPointsDisplay.textContent = store.skillPoints;

  skillNodes.forEach(node => {
    // Determine if we should unlock this node (if its prerequisite is chosen)
    if (!node.unlocked && node.requires) {
      const prereq = skillNodes.find(s => s.id === node.requires);
      if (prereq && prereq.chosen) {
        node.unlocked = true;
      }
    }

    // Create the DOM element for this node
    const nodeDiv = document.createElement('div');
    nodeDiv.classList.add('skill-node', node.prongClass);
    if (!node.unlocked) nodeDiv.classList.add('locked');
    if (node.chosen)    nodeDiv.classList.add('chosen');

    nodeDiv.innerText = node.name;

    // When we click a node...
    nodeDiv.addEventListener('click', () => {
      if (!node.unlocked || node.chosen) return;
      if (store.skillPoints <= 0) {
        notify('You have no skill points to spend.');
        return;
      }
      // Spend skill point
      store.skillPoints--;
      // Mark node as chosen
      node.chosen = true;
      // Apply effect
      node.effect();
      notify(`You chose "${node.name}"!`);
      // Re-render
      renderSkillTree();
      updateCombatUI();
    });

    skillTreeContainer.appendChild(nodeDiv);
  });
}

// Show/hide the skill tree modal
export function openSkillTree() {
  skillTreeModal.style.display = 'block';
  renderSkillTree();
}

export function closeSkillTree() {
  skillTreeModal.style.display = 'none';
}

// Hook up close button
skillTreeCloseBtn.onclick = () => {
  closeSkillTree();
};

// Close if user clicks outside content
window.addEventListener('click', (event) => {
  if (event.target === skillTreeModal) {
    closeSkillTree();
  }
});

// Listen for 'i' key to toggle skill tree
document.addEventListener('keydown', (e) => {
  if (e.key === 'i') {
    if (skillTreeModal.style.display === 'block') {
      closeSkillTree();
    } else {
      openSkillTree();
    }
  }
});