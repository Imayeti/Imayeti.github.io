import { modalInnerContent } from './dom-elements.js';
import { Merchant } from './classes.js';
import { randomId, randomBetween } from './utilities.js';
import { store } from './store.js';
import { updateCombatUI, notify } from './combat.js';

export function createMerchant() {

    const merchant = new Merchant([
        {
            id: randomId(),
            name: 'axe',
            price: randomBetween(40, 50),
            type: 'attack',
            effect: randomBetween(3, 6),
            image: 'images/weapons/axe.png',
            poa: 'passive'
        },
        {
            id: randomId(),
            name: 'plasma-pistol',
            price: randomBetween(12, 30),
            type: 'attack',
            effect: randomBetween(2, 4),
            image: 'images/weapons/plasma-pistol.jpg',
            poa: 'passive'
        },
        //shield
        {
            id: randomId(),
            name: 'shield',
            price: randomBetween(20, 30),
            type: 'defense',
            effect: randomBetween(2,4),
            image: 'images/items/shield.jpg',
            poa: 'passive'
        },
        {
            id: randomId(),
            name: 'grenade',
            price: randomBetween(4, 12),
            type: 'attack',
            effect: randomBetween(25, 40),
            image: 'images/weapons/grenade.jpg',
            poa: 'active'
        },
        {
            id: randomId(),
            name: 'bandage',
            price: randomBetween(7, 12),
            type: 'heal',
            effect: randomBetween(25, 45),
            image: 'images/items/health.jpg',
            poa: 'active'
        },
        {
            id: randomId(),
            name: 'bandage',
            price: randomBetween(7, 12),
            type: 'heal',
            effect: randomBetween(25, 45),
            image: 'images/items/health.jpg',
            poa: 'active'
        },
        {
            id: randomId(),
            name: 'bandage',
            price: randomBetween(7, 12),
            type: 'heal',
            effect: randomBetween(25, 45),
            image: 'images/items/health.jpg',
            poa: 'active'
        }
    ]);

    store.merchant = merchant;

    renderMerchantItems();
}

function renderMerchantItems() {
    //clear the modal
    modalInnerContent.innerHTML = 'Credits: ' + store.playerCharacter.credits + '<br>';

    //render the images to the modal
    store.merchant.inventory.forEach(item => {
        const mechDiv = document.createElement('div');
        const itemInfo = document.createElement('p');
        const merchantItem = document.createElement('img');
        merchantItem.id = item.id;
        merchantItem.src = item.image;
        merchantItem.style.width = '50px';
        merchantItem.style.padding = '6px';
        merchantItem.tooltip = '6px';

        itemInfo.innerText = `${item.name} - ${item.price} credits. Effect: ${item.effect}`;

        merchantItem.addEventListener('click', () => handleBuyItem(item));

        mechDiv.appendChild(merchantItem);
        mechDiv.appendChild(itemInfo);
        modalInnerContent.appendChild(mechDiv);
    });
}

function handleBuyItem(item) {
    console.log('Buying item:', item);
    console.log('store.playerCharacter.credits:', store.playerCharacter.credits);
    console.log('!store.playerCharacter.credits >= item.price:', !store.playerCharacter.credits >= item.price);
    
    if (store.playerCharacter.credits <= item.price) {
        notify(`Not enough credits to buy a ${item.name}`);
        return;
    }

    if (item.name === 'axe') {
        store.playerCharacter.credits -= item.price;

        store.playerCharacter.inventory.push(item);
        store.playerCharacter.attack += item.effect;
        
        notify(`You bought an axe that hits for ${item.effect}!`);

        updateCombatUI();
    }

    if (item.name === 'bandage') {
        store.playerCharacter.credits -= item.price;
        store.playerCharacter.inventory.push(item);
        
        notify(`You bought a bandage that heals for ${item.effect}!`);

        updateCombatUI();
    }

    if (item.name === 'grenade') {
        store.playerCharacter.credits -= item.price;
        store.playerCharacter.inventory.push(item);
        
        notify(`You bought a grenade that hits for ${item.effect}!`);

        updateCombatUI();
    }

    if (item.name === 'plasma-pistol') {
        store.playerCharacter.credits -= item.price;
        store.playerCharacter.inventory.push(item);
        store.playerCharacter.attack += item.effect;
        
        notify(`You bought a plasma-pistol that hits for ${item.effect}!`);

        updateCombatUI();
    }

    if (item.name === 'shield') {
        store.playerCharacter.credits -= item.price;
        store.playerCharacter.inventory.push(item);
        store.playerCharacter.defense += item.effect;
        
        notify(`You bought a shield that defends for ${item.effect}!`);

        updateCombatUI();
    }





     // remove item from merchant inventory
     store.merchant.inventory = store.merchant.inventory.filter(i => i.id !== item.id);
     renderMerchantItems();
}
