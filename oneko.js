/*
  Based on oneko.js by adryd325.
  Source: https://github.com/adryd325/oneko.js
  Licensed under the MIT License. See THIRD_PARTY_NOTICES.md.
*/

'use strict';

(function oneko() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const cat = document.createElement('div');
  const spriteUrl = 'https://raw.githubusercontent.com/adryd325/oneko.js/14bab15a755d0e35cd4ae19c931d96d306f99f42/oneko.gif';
  const speed = 10;

  let catX = 32;
  let catY = Math.max(32, window.innerHeight - 32);
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleFrame = 0;
  let lastFrameTime = 0;

  const sprites = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    scratchWallN: [[0, 0], [0, -1]],
    scratchWallS: [[-7, -1], [-6, -2]],
    scratchWallE: [[-2, -2], [-2, -3]],
    scratchWallW: [[-4, 0], [-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]]
  };

  function secureIndex(length) {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] % length;
  }

  function setSprite(name, frame) {
    const sprite = sprites[name][frame % sprites[name].length];
    cat.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdle() {
    idleAnimation = null;
    idleFrame = 0;
  }

  function idle() {
    idleTime += 1;

    if (idleTime > 80 && idleAnimation === null && secureIndex(160) === 0) {
      const choices = ['sleeping', 'scratchSelf'];

      if (catX < 32) choices.push('scratchWallW');
      if (catY < 32) choices.push('scratchWallN');
      if (catX > window.innerWidth - 32) choices.push('scratchWallE');
      if (catY > window.innerHeight - 32) choices.push('scratchWallS');

      idleAnimation = choices[secureIndex(choices.length)];
    }

    if (idleAnimation === 'sleeping') {
      if (idleFrame < 8) {
        setSprite('tired', 0);
      } else {
        setSprite('sleeping', Math.floor(idleFrame / 4));
      }

      if (idleFrame > 192) resetIdle();
      idleFrame += 1;
      return;
    }

    if (idleAnimation) {
      setSprite(idleAnimation, idleFrame);
      if (idleFrame > 9) resetIdle();
      idleFrame += 1;
      return;
    }

    setSprite('idle', 0);
  }

  function update() {
    frameCount += 1;

    const diffX = catX - pointerX;
    const diffY = catY - pointerY;
    const distance = Math.hypot(diffX, diffY);

    if (distance < 48) {
      idle();
      return;
    }

    resetIdle();

    if (idleTime > 1) {
      setSprite('alert', 0);
      idleTime = Math.min(idleTime, 7) - 1;
      return;
    }

    let direction = '';
    direction += diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';

    setSprite(direction, frameCount);

    catX -= (diffX / distance) * speed;
    catY -= (diffY / distance) * speed;
    catX = Math.min(Math.max(16, catX), window.innerWidth - 16);
    catY = Math.min(Math.max(16, catY), window.innerHeight - 16);

    cat.style.left = `${catX - 16}px`;
    cat.style.top = `${catY - 16}px`;
  }

  function animate(timestamp) {
    if (!cat.isConnected) return;

    if (timestamp - lastFrameTime > 100) {
      lastFrameTime = timestamp;
      update();
    }

    window.requestAnimationFrame(animate);
  }

  cat.id = 'oneko';
  cat.setAttribute('aria-hidden', 'true');
  Object.assign(cat.style, {
    width: '32px',
    height: '32px',
    position: 'fixed',
    left: `${catX - 16}px`,
    top: `${catY - 16}px`,
    zIndex: '2147483647',
    pointerEvents: 'none',
    imageRendering: 'pixelated',
    backgroundImage: `url(${spriteUrl})`
  });

  document.body.appendChild(cat);
  document.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  window.requestAnimationFrame(animate);
})();
