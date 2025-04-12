# AmanahPay

AmanahPay is a blockchain-based platform that transforms the charitable donation landscape in Malaysia, particularly for Waqf, Zakat, and Sadaqah. Our solution combines cryptocurrency technology with community governance to create a transparent, efficient, and participatory donation ecosystem that meets Shariah compliance requirements.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/amanahpay.git
   cd amanahpay
   ```

2. Install all dependencies at once:
   ```
   npm run install:all
   ```

   Or install separately:

   ```
   # Backend
   cd backend/src
   npm install
   cp .env.example .env  # Then edit .env with your database credentials

   # Frontend
   cd frontend
   npm install
   cp .env.example .env  # Then edit .env with your API URL if needed
   ```

### Running the Application

#### Option 1: Run both frontend and backend concurrently

```
npm run dev
```

#### Option 2: Run separately

1. Start the backend:
   ```
   cd backend/src
   npm run dev
   ```

2. Start the frontend (in a separate terminal):
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## API Documentation

See [api-docs.md](api-docs.md) for the API documentation.

## Database Schema

See [database-schema.md](database-schema.md) for the database schema.

## Project Overview

See [project-overview.md](project-overview.md) for the project overview.

## Features

- Fiat-to-Crypto Donation Gateway
- Community-Based Governance Forum
- Quadratic Funding for Waqf Pool
- NFT-Based Donation Certificates
- Sustainable Platform Model

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, React Query
- **Backend**: Node.js, Express.js, PostgreSQL
- **Blockchain**: Solidity, Ethers.js
- **Others**: JWT, Axios, IPFS 