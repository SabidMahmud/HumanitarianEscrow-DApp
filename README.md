# HumanitarianEscrow-DApp

**Decentralized Humanitarian Aid & Relief Escrow — Conflict Zone Aid Management**

---

## The Problem

In the wake of escalating geopolitical conflicts, traditional banking infrastructures and international supply chains often collapse in the regions that need them most. Donors have no reliable way to ensure their funds reach the right hands, and aid agencies on the ground lack a transparent mechanism to prove delivery and receive timely payment.

## The Solution

**HumanitarianEscrow-DApp** is a blockchain-powered smart contract platform that enables international donors to fund specific disaster relief missions — medical supplies, food, shelter, evacuation — while providing a cryptographic guarantee that funds are only released upon verified delivery of aid.

The smart contract acts as an immutable, transparent, and automated escrow. Donors pledge funds with confidence, and relief agencies are incentivized to perform honestly and efficiently through a built-in reputation system.

---

## Key Features

| Feature | Description |
|---|---|
| **Trustless Escrow** | Donor funds are locked in the smart contract and released only upon verified delivery of aid. |
| **Competitive Bidding** | Relief agencies submit operational cost bids on pending missions, ensuring cost-effective aid delivery. |
| **Dynamic Reputation** | Agencies carry a reputation score that increases with successful deliveries (+15) and drops sharply on failure (-30). Agencies scoring below 40 are barred from bidding. |
| **Automated Fee Deduction** | A dynamic operational tax (2% for missions under 2 ETH, 1% for missions at or above 2 ETH) is deducted and retained for network maintenance. |
| **Dispute Resolution** | The UN Arbiter can investigate disputed missions, fully refunding donors or releasing funds to agencies based on findings. |

---

## System Roles

- **Donor** — Posts aid missions, sets maximum budgets, reviews agency bids, and locks funds into the escrow contract.
- **Relief Agency** — Verified organizations operating in conflict zones that bid on missions, deliver aid, and receive payment upon confirmed delivery.
- **UN Arbiter (Admin)** — The platform overseer responsible for resolving disputes when aid delivery is contested.

---

## Mission Lifecycle

```
Registration ──> Post Mission ──> Agency Bidding ──> Fund & Escrow ──> Delivery & Payout
                                                                             │
                                                                      (if disputed)
                                                                             │
                                                                     Dispute Resolution
```

1. **Registration** — Users register with a name, role, and wallet address. Agencies receive an initial reputation score of 100.
2. **Post Mission** — Donors create a mission specifying category, max budget (in Ether), and target region.
3. **Agency Bidding** — Qualified agencies submit operational cost pledges. Bids exceeding the max budget are rejected.
4. **Fund & Escrow** — The donor selects a bid and sends the exact pledged amount to the contract. The contract holds the funds securely.
5. **Delivery & Payout** — The agency marks the mission as delivered. Once the donor confirms, the contract deducts the operational fee and transfers the remainder to the agency.
6. **Dispute Resolution** — If aid fails to arrive, the donor raises a dispute. The UN Arbiter investigates and either refunds the donor (penalizing the agency) or releases funds to the agency if the dispute was invalid.

---

## Technical Overview

- **Language:** Solidity
<!-- - **Core Concepts:** Payable functions, escrow pattern, role-based access control (RBAC), state machine for mission lifecycle, dynamic fee calculation, on-chain reputation management -->

---

## How to Run This Application Locally

Follow these instructions to set up the smart contracts and the frontend interface on your local machine.

### Prerequisites

You will need the following tools installed:
- **Node.js**: (v18 or higher recommended) and **npm**
- **Truffle Suite**: Install globally by running `npm install -g truffle`
- **Ganache**: For a personal local Ethereum blockchain (either [Ganache UI](https://archive.trufflesuite.com/ganache/) or `npm install -g ganache-cli`)
- **MetaMask**: Browser extension for interaction with the blockchain.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd HumanitarianEscrow-DApp
```

### 2. Local Blockchain & Smart Contracts Setup

1. **Start Ganache:** 
   Run Ganache CLI in your terminal using the "deterministic" flag. This ensures you get the exact same test accounts and mnemonic phrase every time:
   ```bash
   ganache -p 8545 -i 1337 -d
   ```
   *Keep this terminal open.* It will display a list of 10 test accounts and a **Mnemonic** phrase (12 secret words). Copy this mnemonic, as you'll use it to log into MetaMask.

2. **Navigate to the blockchain directory:**
   Open a **new** terminal and run:
   ```bash
   cd blockchain
   ```
3. **Configure Network (if needed):**
   Ensure your `truffle-config.js` is set up to point to your Ganache instance (Host: `127.0.0.1`, Port: `8545`, Network ID: `1337`).
4. **Compile the smart contracts:**
   ```bash
   truffle compile
   ```
5. **Deploy the smart contracts:**
   ```bash
   truffle migrate --reset --network development
   ```
   *(Note the deployed contract addresses from the console output, and ensure the compiled ABIs under `blockchain/build/contracts/` are provided to the frontend as required by your integration).*

### 3. Frontend Application Setup (Next.js)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install project dependencies:**
   ```bash
   npm install
   ```
3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
4. **Access the web application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### 4. Connect MetaMask

1. Go to **Networks → Add network manually** in MetaMask and enter:
   - **Name:** `Ganache Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
2. **Import the Ganache Accounts:**
   - In MetaMask, select **Import Wallet** (if it's a fresh install) or lock your account and choose **Import with Secret Recovery Phrase**.
   - Paste the **Mnemonic** phrase you copied from the Ganache terminal.
   - This will instantly import all 10 of your test accounts into MetaMask, loaded with fake ETH. You can now easily switch between accounts to test the DApp as a Donor, Relief Agency, or UN Arbiter!

---

## License

This project is under development for an academic project.
