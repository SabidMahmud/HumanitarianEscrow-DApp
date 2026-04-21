export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ""; // Deployed on Ganache

export const HUMANITARIAN_ESCROW_ABI = [
  // Events
  "event UserRegistered(address indexed wallet, string name, uint8 role)",
  "event MissionPosted(uint256 indexed missionId, address indexed donor, string category, uint256 maxBudget, string region)",
  "event PledgeSubmitted(uint256 indexed missionId, address indexed agency, uint256 amount)",
  "event MissionFunded(uint256 indexed missionId, address indexed donor, address indexed agency, uint256 amount)",
  "event AidDelivered(uint256 indexed missionId, address indexed agency)",
  "event DeliveryApproved(uint256 indexed missionId, uint256 agencyPayout, uint256 fee)",
  "event MissionDisputed(uint256 indexed missionId, address indexed donor)",
  "event DisputeResolved(uint256 indexed missionId, bool agencyFault, uint256 amountResolved)",
  "event FeesWithdrawn(address indexed arbiter, uint256 amount)",

  // Reads
  "function unArbiter() view returns (address)",
  "function users(address) view returns (string name, uint8 role, address wallet, int256 reputationScore, bool isRegistered)",
  "function missionCount() view returns (uint256)",
  "function missions(uint256) view returns (uint256 id, string category, uint256 maxBudget, string region, uint8 status, address donor, address selectedAgency, uint256 lockedFunds)",
  "function getMissionBids(uint256 _missionId) view returns (tuple(address agency, uint256 amount)[])",
  "function accumulatedFees() view returns (uint256)",

  // Writes
  "function registerUser(string _name, uint8 _role)",
  "function postMission(string _category, uint256 _maxBudget, string _region)",
  "function pledgeToDeliver(uint256 _missionId, uint256 _bidAmount)",
  "function fundMission(uint256 _missionId, address _agency) payable",
  "function markDelivered(uint256 _missionId)",
  "function approveDelivery(uint256 _missionId)",
  "function disputeMission(uint256 _missionId)",
  "function resolveDispute(uint256 _missionId, bool _agencyFault)",
  "function withdrawFees()",
];
