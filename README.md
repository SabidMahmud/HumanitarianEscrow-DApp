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

## License

This project is under development for an academic project.
