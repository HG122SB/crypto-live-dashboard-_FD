# CryptoPulse - Real-Time Cryptocurrency Dashboard

![CryptoPulse Banner](public/banner.png)
> **Live cryptocurrency prices, interactive charts, portfolio tracker, news feed, market sentiment, on-chain metrics, and more — all in one beautiful, blazing-fast dashboard.**

Live Demo: [https://cryptopulse.live](https://cryptopulse.live)  
Dashboard Preview: [https://cryptopulse-dashboard.netlify.app](https://cryptopulse-dashboard.netlify.app)

---

## 🚀 Features

### Core Features
- Real-time price updates (WebSocket)
- Top 100+ cryptocurrencies with 1s refresh
- Interactive candlestick charts (1m, 5m, 15m, 1h, 4h, 1D, 1W)
- Volume, market cap, dominance, 24h change
- Portfolio tracker with profit/loss calculation
- Watchlist with custom alerts
- Dark/Light mode with auto-detect
- Fully responsive (mobile, tablet, desktop)

### Advanced Features
- On-chain metrics (Active addresses, transaction count, hash rate)
- Fear & Greed Index widget
- Crypto news aggregator (latest headlines)
- DeFi TVL leaderboard
- NFT floor price tracker
- Exchange order book depth chart
- Wallet balance connector (MetaMask, WalletConnect)
- Price alert notifications (browser + email)
- Multi-language support (English, Spanish, Chinese, Russian, Hindi)
- Export portfolio as CSV/PDF

### Performance & Security
- Built with Vite + React 18 + TypeScript
- 100/100 Lighthouse scores (Performance, SEO, Best Practices)
- Code splitting & lazy loading
- SSR-ready (Next.js version available)
- Secure WebSocket connections (WSS)
- Rate limiting & error resilience

---

## 📸 Screenshots

| Home Dashboard | Portfolio Tracker | Chart View |
|----------------|-------------------|------------|
| ![Home](public/screenshots/home-dark.jpg) | ![Portfolio](public/screenshots/portfolio.jpg) | ![Chart](public/screenshots/chart.jpg) |

| Mobile View | News Feed | Fear & Greed |
|-------------|-----------|--------------|
| ![Mobile](public/screenshots/mobile.jpg) | ![News](public/screenshots/news.jpg) | ![Fear](public/screenshots/fear-greed.jpg) |

---

## 🛠️ Tech Stack

| Category              | Technology                                      |
|-----------------------|--------------------------------------------------|
| Framework             | React 18 + Vite                                   |
| Language              | TypeScript                                        |
| Styling               | Tailwind CSS + Headless UI + Radix UI            |
| Charts                | Lightweight Charts (TradingView) + Recharts      |
| State Management      | Zustand + React Query (TanStack Query)           |
| Routing               | React Router v6.22                                |
| WebSocket             | Socket.io-client + custom reconnect logic        |
| Icons                 | Lucide React, Crypto Icons                        |
| Animations            | Framer Motion + Auto Animate                     |
| Forms                 | React Hook Form + Zod                            |
| Notifications         | React Hot Toast + Sonner                         |
| Wallet Connection     | Wagmi + viem + RainbowKit                        |
| Testing               | Vitest + React Testing Library + Playwright      |
| Linting/Formatting    | ESLint + Prettier + Husky + lint-staged          |
| Deployment            | Vercel / Netlify / Cloudflare Pages              |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.18
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cryptopulse-dashboard.git
cd cryptopulse-dashboard

# Install dependencies (pnpm is fastest)
pnpm install
