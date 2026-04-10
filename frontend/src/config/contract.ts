export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Fallback dev address

export const HUMANITARIAN_ESCROW_ABI = [
  // Reads
  "function unArbiter() view returns (address)",
  "function users(address) view returns (string name, uint8 role, address wallet, int256 reputationScore, bool isRegistered)",
  "function missionCount() view returns (uint256)",
  "function missions(uint256) view returns (uint256 id, string category, uint256 maxBudget, string region, uint8 status, address donor, address selectedAgency, uint256 lockedFunds)",
  "function agencyBids(uint256, address) view returns (uint256)",
  
  // Writes
  "function registerUser(string _name, uint8 _role)",
  "function postMission(string _category, uint256 _maxBudget, string _region)",
  "function pledgeToDeliver(uint256 _missionId, uint256 _bidAmount)",
  "function fundMission(uint256 _missionId, address _agency) payable",
  "function markDelivered(uint256 _missionId)",
  "function approveDelivery(uint256 _missionId)",
  "function disputeMission(uint256 _missionId)",
  "function resolveDispute(uint256 _missionId, bool _agencyFault)"
];
