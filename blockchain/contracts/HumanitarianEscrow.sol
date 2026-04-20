// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HumanitarianEscrow {
    enum Role {
        UN_Arbiter,
        Donor,
        Relief_Agency
    }
    enum MissionStatus {
        Pending,
        In_Transit,
        AwaitingApproval,
        Delivered,
        Disputed,
        Resolved
    }

    struct User {
        string name;
        Role role;
        address wallet;
        int256 reputationScore;
        bool isRegistered;
    }

    // Represents a single bid submitted by a Relief Agency for a mission
    struct Bid {
        address agency;
        uint256 amount;
    }

    struct Mission {
        uint256 id;
        string category;
        uint256 maxBudget;
        string region;
        MissionStatus status;
        address donor;
        address selectedAgency;
        uint256 lockedFunds;
        Bid[] bids; // list of bids for this mission
    }

    address public unArbiter;
    uint256 public missionCount;
    uint256 public accumulatedFees; // fees held in escrow until the UN Arbiter withdraws them

    mapping(address => User) public users;
    mapping(uint256 => Mission) public missions;

    event UserRegistered(address indexed wallet, string name, uint8 role);
    event MissionPosted(
        uint256 indexed missionId,
        address indexed donor,
        string category,
        uint256 maxBudget,
        string region
    );
    event PledgeSubmitted(
        uint256 indexed missionId,
        address indexed agency,
        uint256 amount
    );
    event MissionFunded(
        uint256 indexed missionId,
        address indexed donor,
        address indexed agency,
        uint256 amount
    );
    event AidDelivered(uint256 indexed missionId, address indexed agency);
    event DeliveryApproved(
        uint256 indexed missionId,
        uint256 agencyPayout,
        uint256 fee
    );
    event MissionDisputed(uint256 indexed missionId, address indexed donor);
    event DisputeResolved(
        uint256 indexed missionId,
        bool agencyFault,
        uint256 amountResolved
    );
    event FeesWithdrawn(address indexed arbiter, uint256 amount);

    error Unauthorized();
    error AlreadyRegistered();
    error AlreadyBid();
    error InvalidReputation();
    error BidExceedsBudget();
    error InvalidMissionStatus();
    error InsufficientFunds(uint256 sent, uint256 required);
    error TransferFailed();

    modifier onlyRegistered() {
        if (!users[msg.sender].isRegistered) revert Unauthorized();
        _;
    }

    modifier onlyDonor() {
        if (users[msg.sender].role != Role.Donor) revert Unauthorized();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != unArbiter) revert Unauthorized();
        _;
    }

    constructor() {
        unArbiter = msg.sender;
        users[msg.sender] = User(
            "UN Admin",
            Role.UN_Arbiter,
            msg.sender,
            0,
            true
        );
    }

    //# Functions

    function registerUser(string memory _name, Role _role) external {
        if (users[msg.sender].isRegistered) revert AlreadyRegistered();

        // Prevent anyone from self-registering as the UN Arbiter
        if (_role == Role.UN_Arbiter) revert Unauthorized();

        int256 initialRep = 0;
        if (_role == Role.Relief_Agency) {
            initialRep = 100;
        }

        users[msg.sender] = User(_name, _role, msg.sender, initialRep, true);

        emit UserRegistered(msg.sender, _name, uint8(_role));
    }

    function postMission(
        string memory _category,
        uint256 _maxBudget,
        string memory _region
    ) external onlyRegistered onlyDonor {
        missionCount++;

        // Push to storage first, then populate fields (required for structs with arrays)
        Mission storage m = missions[missionCount];
        m.id = missionCount;
        m.category = _category;
        m.maxBudget = _maxBudget;
        m.region = _region;
        m.status = MissionStatus.Pending;
        m.donor = msg.sender;
        m.selectedAgency = address(0);
        m.lockedFunds = 0;
        // m.bids array starts empty by default

        emit MissionPosted(missionCount, msg.sender, _category, _maxBudget, _region);
    }

    function pledgeToDeliver(
        uint256 _missionId,
        uint256 _bidAmount
    ) external onlyRegistered {
        if (users[msg.sender].role != Role.Relief_Agency) {
            revert Unauthorized();
        }
        if (users[msg.sender].reputationScore < 40) {
            revert InvalidReputation();
        }

        Mission storage mission = missions[_missionId];
        if (mission.status != MissionStatus.Pending) {
            revert InvalidMissionStatus();
        }
        if (_bidAmount > mission.maxBudget) {
            revert BidExceedsBudget();
        }

        // Prevent the same agency from bidding twice on the same mission
        for (uint256 i = 0; i < mission.bids.length; i++) {
            if (mission.bids[i].agency == msg.sender) revert AlreadyBid();
        }

        mission.bids.push(Bid({agency: msg.sender, amount: _bidAmount}));

        emit PledgeSubmitted(_missionId, msg.sender, _bidAmount);
    }

    function fundMission(
        uint256 _missionId,
        address _agency
    ) external payable onlyRegistered onlyDonor {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.donor) {
            revert Unauthorized();
        }
        if (mission.status != MissionStatus.Pending) {
            revert InvalidMissionStatus();
        }

        // Find the bid submitted by the chosen agency
        uint256 pledgedAmount = 0;
        for (uint256 i = 0; i < mission.bids.length; i++) {
            if (mission.bids[i].agency == _agency) {
                pledgedAmount = mission.bids[i].amount;
                break;
            }
        }
        if (pledgedAmount == 0) revert Unauthorized(); // agency never bid on this mission

        if (msg.value < pledgedAmount) {
            revert InsufficientFunds(msg.value, pledgedAmount);
        }

        mission.status = MissionStatus.In_Transit;
        mission.selectedAgency = _agency;
        mission.lockedFunds = pledgedAmount;

        emit MissionFunded(_missionId, msg.sender, _agency, pledgedAmount);

        // Refund any excess Ether sent beyond the exact pledged amount
        uint256 excessAmount = msg.value - pledgedAmount;
        if (excessAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: excessAmount}(
                ""
            );
            if (!success) {
                revert TransferFailed();
            }
        }
    }

    function markDelivered(uint256 _missionId) external onlyRegistered {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.selectedAgency) {
            revert Unauthorized();
        }
        if (mission.status != MissionStatus.In_Transit) {
            revert InvalidMissionStatus();
        }
        mission.status = MissionStatus.AwaitingApproval;

        emit AidDelivered(_missionId, msg.sender);
    }

    function approveDelivery(
        uint256 _missionId
    ) external onlyRegistered onlyDonor {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.donor) revert Unauthorized();
        if (mission.status != MissionStatus.AwaitingApproval)
            revert InvalidMissionStatus();

        uint256 payout = mission.lockedFunds;
        mission.lockedFunds = 0;

        uint256 fee = _calculateFee(payout);
        uint256 agencyAmount = payout - fee;

        users[mission.selectedAgency].reputationScore += 15;
        mission.status = MissionStatus.Delivered;

        // Fee stays locked in the contract (true escrow) — arbiter withdraws later
        accumulatedFees += fee;

        (bool agencySuccess, ) = payable(mission.selectedAgency).call{
            value: agencyAmount
        }("");
        if (!agencySuccess) revert TransferFailed();

        emit DeliveryApproved(_missionId, agencyAmount, fee);
    }

    function disputeMission(
        uint256 _missionId
    ) external onlyRegistered onlyDonor {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.donor) {
            revert Unauthorized();
        }

        if (
            mission.status != MissionStatus.In_Transit &&
            mission.status != MissionStatus.AwaitingApproval
        ) {
            revert InvalidMissionStatus();
        }

        mission.status = MissionStatus.Disputed;

        emit MissionDisputed(_missionId, msg.sender);
    }

    function resolveDispute(
        uint256 _missionId,
        bool _agencyFault
    ) external onlyArbiter {
        Mission storage mission = missions[_missionId];
        if (mission.status != MissionStatus.Disputed) {
            revert InvalidMissionStatus();
        }

        uint256 fundsToResolve = mission.lockedFunds;
        mission.lockedFunds = 0;
        mission.status = MissionStatus.Resolved;

        if (_agencyFault) {
            // Agency failed to deliver: full refund to donor, reputation penalty
            users[mission.selectedAgency].reputationScore -= 30;

            (bool success, ) = payable(mission.donor).call{
                value: fundsToResolve
            }("");
            if (!success) revert TransferFailed();

            emit DisputeResolved(_missionId, true, fundsToResolve);
        } else {
            // False alarm: donor's dispute was invalid, pay agency minus operational fee
            uint256 fee = _calculateFee(fundsToResolve);
            uint256 agencyAmount = fundsToResolve - fee;

            // Fee stays locked in the contract (true escrow) — arbiter withdraws later
            accumulatedFees += fee;

            (bool agencySuccess, ) = payable(mission.selectedAgency).call{
                value: agencyAmount
            }("");
            if (!agencySuccess) revert TransferFailed();

            emit DisputeResolved(_missionId, false, agencyAmount);
        }
    }

    //# Arbiter Withdrawal

    function withdrawFees() external onlyArbiter {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert InsufficientFunds(0, 1);

        accumulatedFees = 0; // zero out before transfer (Checks-Effects-Interactions pattern)

        (bool success, ) = payable(unArbiter).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FeesWithdrawn(unArbiter, amount);
    }

    //# View / Helper Functions

    /**
     * @notice Returns all bids submitted for a mission so the frontend can
     *         display them and let the donor choose an agency.
     */
    function getMissionBids(
        uint256 _missionId
    ) external view returns (Bid[] memory) {
        return missions[_missionId].bids;
    }


    function _calculateFee(uint256 _amount) private pure returns (uint256) {
        if (_amount < 2 ether) {
            return (_amount * 2) / 100;
        } else {
            return (_amount * 1) / 100;
        }
    }
}
