import './styles';

import ancientsData from './ancients';
import difficultiesData from './difficulties';
import { blueCards, brownCards, greenCards } from './mythicCards/index';

const difficulties = document.querySelector('.difficulties');
const shuffleSection = document.querySelector('.shuffle');
const deckSection = document.querySelector('.decks');
const shuffleBtn = document.querySelector('.shuffle-btn');
const lastCardOfDeck = document.querySelector('.deck');
const lastCard = document.querySelector('.last-card');

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hideShuffleSection() {
    shuffleSection.classList.add('hidden');
}

function hideDeckSection() {
    deckSection.classList.add('hidden');
}

function showShuffleSection() {
    shuffleSection.classList.remove('hidden');
}

function showDeckSection() {
    deckSection.classList.remove('hidden');
}

(function createAncients() {
    const ancients = document.querySelector('.ancients');
    let ancientContent = '';
    ancientsData.forEach(element => {
        ancientContent += `<div class="ancient" style="background-image: url('${element.cardFace}');"></div>`;
    });
    ancients.innerHTML = ancientContent;
})();

(function createDifficulties() {
    let difficultiesContent = '';
    difficultiesData.forEach(element => {
        difficultiesContent += `<div class="difficulty">${element.name}</div>`;
    });
    difficulties.innerHTML = difficultiesContent;
})();

const ancient = document.querySelectorAll('.ancient');
const difficulty = document.querySelectorAll('.difficulty');

function chooseAncient(element) {
    if (element.target.classList.contains('active')) {
        return;
    }

    ancient.forEach(element => element.classList.remove('active'));
    element.target.classList.add('active');
    difficulties.classList.remove('hidden');
    difficulty.forEach(element => element.classList.remove('active'));
    hideShuffleSection();
    hideDeckSection();
}

function chooseDifficulty(element) {
    if (element.target.classList.contains('active')) {
        return;
    }

    difficulty.forEach(element => element.classList.remove('active'));
    element.target.classList.add('active');
    showShuffleSection();
    hideDeckSection();
}

let stageInfo = [];

function getStageInfo() {
    ancient.forEach((element, i) => {
        if (element.classList.contains('active')) {
            stageInfo = [ancientsData[i].firstStage, ancientsData[i].secondStage, ancientsData[i].thirdStage];
        }
    });
}

function getCardAmount() {
    return stageInfo.reduce((acc, stage) => {
        return [(acc[0] += stage.greenCards), (acc[1] += stage.brownCards), (acc[2] += stage.blueCards)];
    }, [0, 0, 0]);
}

let difficultyArr = [];

function getDifficulty() {
    difficulty.forEach((element, i) => {
        if (element.classList.contains('active')) {
            difficultyArr = difficultiesData[i].cardsDifficulty;
        }
    });
}

function getCards(amount, colorCardsArr) {
    let resultArr = [];
    let array = [];

    for (let i = 0; i < difficultyArr.length; i++) {
        let filterCardsArr = colorCardsArr.filter(element => element.difficulty === difficultyArr[i]);
        array.push(...filterCardsArr);
    }

    if (difficultyArr.length === 1) {
        let cardsWithNormalDifficulty = colorCardsArr.filter(element => element.difficulty === 'normal');
        while (array.length < amount) {
            let randomNum = getRandomNumber(0, (cardsWithNormalDifficulty.length - 1));
            let randomCard = cardsWithNormalDifficulty[randomNum];
            if (!array.includes(randomCard)) {
                array.push(randomCard);
            }
        }
    }

    while (resultArr.length < amount) {
        let randomNumber = getRandomNumber(0, (array.length - 1));
        let randomCard = array[randomNumber].cardFace;
        if (!resultArr.includes(randomCard)) {
            resultArr.push(randomCard);
        }
    }

    return resultArr;
}

function getCurrentCards() {
    const totalCards = getCardAmount();
    const greenCardFaces = getCards(totalCards[0], greenCards);
    const yellowCardFaces = getCards(totalCards[1], brownCards);
    const blueCardFaces = getCards(totalCards[2], blueCards);

    return { greenCards: greenCardFaces, brownCards: yellowCardFaces, blueCards: blueCardFaces };
}

let deck;

function getDeck() {
    let cards = getCurrentCards();
    let stages = [];

    function getStageCards(colorCards, index) {
        let stageCards = [];
        while (stageCards.length < stageInfo[index][colorCards]) {
            let card = cards[colorCards].pop();
            stageCards.push(card);
        }
        return stageCards;
    }

    for (let i = 0; i < 3; i++) {
        stages.push({
            greenCards: getStageCards('greenCards', i),
            brownCards: getStageCards('brownCards', i),
            blueCards: getStageCards('blueCards', i)
        });
    }
    deck = stages;
}

function createStateTrack() {
    const currentState = document.querySelector('.current-state');
    const stages = ['Стадия I', 'Стадия II', 'Стадия III'];
    let stateContent = '';

    for (let i = 0; i < 3; i++) {
        stateContent += `
            <div class="stage">
                <div class="stage-wrapper">
                  <h4 class="stage-title">${stages[i]}</h4>
                </div>
                <div class="deck-count">
                  <div class="count green">${deck[i].greenCards.length}</div>
                  <div class="count yellow">${deck[i].brownCards.length}</div>
                  <div class="count blue">${deck[i].blueCards.length}</div>
                </div>
            </div>`;
    }

    currentState.innerHTML = stateContent;
}

function openDeckSection() {
    lastCardOfDeck.classList.remove('hide');
    lastCard.style.backgroundImage = '';
    hideShuffleSection();
    showDeckSection();
}

function showCard() {
    let colors = ['greenCards', 'brownCards', 'blueCards'];

    for (let i = 0; i < deck.length; i++) {
        let j = getRandomNumber(0, 2);
        if (deck[i][colors[j]].length > 0) {
            lastCard.style.backgroundImage = `url('${deck[i][colors[j]].pop()}')`;
            createStateTrack();
            return;
        }
        for (let j = 0; j < 3; j++) {
            if (deck[i][colors[j]].length > 0) {
                lastCard.style.backgroundImage = `url('${deck[i][colors[j]].pop()}')`;
                createStateTrack();
                return;
            }
        }
        if (i === 2) {
            lastCardOfDeck.classList.add('hide');
        }
    }
}

ancient.forEach(element => element.addEventListener('click', chooseAncient));
difficulty.forEach(element => element.addEventListener('click', chooseDifficulty));
ancient.forEach(element => element.addEventListener('click', getStageInfo));
difficulty.forEach(element => element.addEventListener('click', getDifficulty));
shuffleBtn.addEventListener('click', openDeckSection);
shuffleBtn.addEventListener('click', getDeck);
shuffleBtn.addEventListener('click', createStateTrack);
shuffleBtn.addEventListener('click', getCurrentCards);
lastCardOfDeck.addEventListener('click', showCard);

console.log(
    'Мои контакты:\n',
    '📧 Discord: andreyfits#0176\n',

    '📂 Score: 105 / 105\n\n',

    '✅ [+20] На выбор предоставляются 4 карты Древних:\n',
    '✔️ Азатот (+5)\n',
    '✔️ Ктулху (+5)\n',
    '✔️ Йог-Сотот (+5)\n',
    '✔️ Шуб-Ниггурат (+5)\n\n',

    '✅ [+25] На выбор предоставляются 5 уровней сложности:\n',
    '✔️ Очень лёгкий (+5)\n',
    '✔️ Лёгкий (+5)\n',
    '✔️ Средний (+5)\n',
    '✔️ Высокий (+5)\n',
    '✔️ Очень высокий (+5)\n\n',

    '✅ [+40] Карты замешиваются согласно правилам игры.\n',
    '✅ [+20] Есть трекер текущего состояния колоды.\n\n'
);
