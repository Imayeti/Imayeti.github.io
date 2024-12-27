import { modalInnerContent } from './main.js';
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
            effect: randomBetween(2, 5),
            image: 'images/weapons/axe.png',
            poa: 'passive'
        },
        {
            id: randomId(),
            name: 'grenade',
            price: randomBetween(10, 20),
            type: 'attack',
            effect: randomBetween(25, 40),
            image: 'images/weapons/grenade.jpg',
            poa: 'active'
        },
        {
            id: randomId(),
            name: 'bandage',
            price: randomBetween(10, 20),
            type: 'heal',
            effect: randomBetween(25, 45),
            image: 'images/items/health.jpg',
            poa: 'active'
        }
    ]);

    store.merchant = merchant;

    //render the images to the modal
    merchant.inventory.forEach(item => {
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

}
