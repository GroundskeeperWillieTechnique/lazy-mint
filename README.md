# Lazy Minter 🐕

**The ultimate NFT launchpad for Dogecoin.**

Generate, customize, and mint unique Doginals NFTs with real generative SVG art.

## Features

- 🎲 **Rarity-Weighted Shuffling** — Legendary, Rare, Uncommon, and Common traits
- 💰 **In-App Doge Wallet** — Create or import wallets, send DOGE, mint NFTs
- 🛒 **Marketplace** — Browse and explore all collections
- 🖼️ **Gallery** — View your minted inscriptions
- 📊 **Leaderboard** — Top collectors worldwide

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Blockchain**: Dogecoin (via SoChain API)
- **Wallet**: BitcoinJS-lib with Dogecoin network params

## Quick Start

### Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Generate collections
cd backend && node scripts/generate-real-collections.js

# Start backend (port 4001)
cd backend && npm start

# Start frontend (port 4000)
cd frontend && npm run dev
```

Visit <http://localhost:4000>

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Start production server (serves frontend + API)
cd backend && node server.js
```

Visit <http://localhost:4001>

## Deploy to Render.com

See [DEPLOY.md](./DEPLOY.md) for complete deployment instructions.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### License

MIT

## Contributing

PRs welcome! This is a community-driven project.

---

**Built with ❤️ for the Dogecoin community**
