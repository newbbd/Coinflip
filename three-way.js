'use strict';

const picker = document.querySelector('#picker');
const result = document.querySelector('#result');
const pickButton = document.querySelector('#pickButton');

const UINT32_LIMIT_FOR_THREE = 0xffffffff;
let isPicking = false;

function secureRandomAvailable() {
  return window.isSecureContext
    && typeof window.crypto !== 'undefined'
    && typeof window.crypto.getRandomValues === 'function';
}

function getSecureThreeWayPick() {
  const value = new Uint32Array(1);

  do {
    window.crypto.getRandomValues(value);
  } while (value[0] === UINT32_LIMIT_FOR_THREE);

  return (value[0] % 3) + 1;
}

function finishPick(choice) {
  picker.textContent = String(choice);
  result.textContent = `OPTION ${choice}`;
  picker.classList.remove('picking');
  pickButton.disabled = false;
  isPicking = false;
}

function pick() {
  if (isPicking || !secureRandomAvailable()) {
    return;
  }

  const choice = getSecureThreeWayPick();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  isPicking = true;
  pickButton.disabled = true;
  result.textContent = '...';
  picker.textContent = '?';
  picker.classList.remove('picking');
  void picker.offsetWidth;
  picker.classList.add('picking');

  window.setTimeout(() => finishPick(choice), reduceMotion ? 30 : 300);
}

if (!secureRandomAvailable()) {
  pickButton.disabled = true;
  result.textContent = 'UNAVAILABLE';
}

pickButton.addEventListener('click', pick);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    pick();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}