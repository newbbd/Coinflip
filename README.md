# Secure Coin Flip

A dependency-free GitHub Pages coin flip website powered by the browser's cryptographically secure random number generator.

## Randomness

Each flip:

1. Requests a fresh unsigned 32-bit value from `window.crypto.getRandomValues()`.
2. Uses `value % 2` to select one of two outcomes.
3. Maps `0` to Heads and `1` to Tails.

The full 32-bit range contains exactly the same number of even and odd values, so this mapping has no modulo bias. The website never falls back to `Math.random()`. If Web Crypto is unavailable, the flip button is disabled.

A software-only website cannot prove literal physical randomness. Web Crypto provides cryptographically secure, unpredictable digital randomness supplied by the browser and operating system. It is appropriate for normal decisions, games, and similar use.

## Features

- Cryptographically secure coin flips
- Responsive desktop and mobile interface
- Flip animation with reduced-motion support
- Local statistics and recent history
- Copyable generation details
- Dark and light themes
- Keyboard support with the Space key
- Installable PWA and offline support
- No trackers, analytics, external requests, or third-party dependencies

## GitHub Pages setup

The included workflow deploys the site through GitHub Actions. Every push to `main` triggers a fresh deployment.

1. Open the repository on GitHub.
2. Go to **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and run **Deploy GitHub Pages** if it did not start automatically.

The expected site address is:

`https://newbbd.github.io/Coinflip/`

## Local testing

Run a local HTTPS-capable development server or use localhost, which browsers treat as a secure context. For a quick test with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Privacy

Flip results and statistics stay in the browser. Statistics are stored in local storage. The service worker caches the website files for offline use. No flip data is transmitted by the application.
