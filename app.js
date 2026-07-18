'use strict';

const coin = document.querySelector('#coin');
const result = document.querySelector('#result');
const flipButton = document.querySelector('#flipButton');
const status = document.querySelector('#status');

let isFlipping = false;

function secureRandomAvailable() {
  return window.isSecureContext
    && typeof window.crypto !== 'undefined'
    && typeof window.crypto.getRandomValues === 'function';
}

function getSecureFlip() {
  const value = new Uint32Array(1);
  window.crypto.getRandomValues(value);
  return value[0] % 2 === 0 ? 'HEADS' : 'TAILS';
}

function finishFlip(outcome) {
  const letter = outcome === 'HEADS' ? 'H' : 'T';
  coin.textContent = letter;
  result.textContent = outcome;
  coin.classList.remove('flipping');
  flipButton.disabled = false;
  isFlipping = false;
}

function flip() {
  if (isFlipping || !secureRandomAvailable()) {
    return;
  }

  const outcome = getSecureFlip();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  isFlipping = true;
  flipButton.disabled = true;
  result.textContent = '...';
  coin.classList.remove('flipping');
  void coin.offsetWidth;
  coin.classList.add('flipping');

  window.setTimeout(() => finishFlip(outcome), reduceMotion ? 30 : 420);
}

if (!secureRandomAvailable()) {
  flipButton.disabled = true;
  result.textContent = 'UNAVAILABLE';
  status.textContent = 'SECURE RANDOMNESS REQUIRED';
  status.classList.add('error');
}

flipButton.addEventListener('click', flip);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    flip();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
