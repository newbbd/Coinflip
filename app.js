'use strict';

const coin = document.querySelector('#coin');
const result = document.querySelector('#result');
const flipButton = document.querySelector('#flipButton');

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
  coin.textContent = outcome === 'HEADS' ? 'H' : 'T';
  result.textContent = outcome;
  coin.classList.remove('flip-heads', 'flip-tails');
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
  coin.textContent = '?';
  coin.classList.remove('flip-heads', 'flip-tails');
  void coin.offsetWidth;
  coin.classList.add(outcome === 'HEADS' ? 'flip-heads' : 'flip-tails');

  window.setTimeout(() => finishFlip(outcome), reduceMotion ? 30 : 300);
}

if (!secureRandomAvailable()) {
  flipButton.disabled = true;
  result.textContent = 'UNAVAILABLE';
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
