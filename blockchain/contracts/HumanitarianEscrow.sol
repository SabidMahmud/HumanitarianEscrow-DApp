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

    struct Mission {
        uint256 id;
        string category;
        uint256 maxBudget;
        string region;
        MissionStatus status;
        address donor;
        address selectedAgency;
        uint256 lockedFunds;
    }

    address public unArbiter;
    uint256 public missionCount;

    mapping(address => User) public users;
    mapping(uint256 => Mission) public missions;

    mapping(uint256 => mapping(address => uint256)) public agencyBids; // missionid -> agency -> bid amount

    error Unauthorized();
    error AlreadyRegistered();
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

        int256 initialRep = 0;
        if (_role == Role.Relief_Agency) {
            initialRep = 100;
        }

        users[msg.sender] = User(_name, _role, msg.sender, initialRep, true);
    }

    function postMission(
        string memory _category,
        uint256 _maxBudget,
        string memory _region
    ) external onlyRegistered onlyDonor {
        missionCount++;
        missions[missionCount] = Mission({
            id: missionCount,
            category: _category,
            maxBudget: _maxBudget,
            region: _region,
            status: MissionStatus.Pending,
            donor: msg.sender,
            selectedAgency: address(0),
            lockedFunds: 0
        });
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

        agencyBids[_missionId][msg.sender] = _bidAmount;
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

        uint256 pledgedAmount = agencyBids[_missionId][_agency];
        if (pledgedAmount == 0) {
            revert Unauthorized();
        }

        if (msg.value < pledgedAmount) {
            revert InsufficientFunds(msg.value, pledgedAmount);
        }

        mission.status = MissionStatus.In_Transit;
        mission.selectedAgency = _agency;
        mission.lockedFunds = pledgedAmount;

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

    function markDelivered(uint256 _missionId) external {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.selectedAgency) {
            revert Unauthorized();
        }
        if (mission.status != MissionStatus.In_Transit) {
            revert InvalidMissionStatus();
        }
        mission.status = MissionStatus.Delivered;
    }

    function approveDelivery(uint256 _missionId) external onlyDonor {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.donor) revert Unauthorized();
        if (mission.status != MissionStatus.Delivered)
            revert InvalidMissionStatus();

        uint256 payout = mission.lockedFunds;
        mission.lockedFunds = 0;

        uint256 fee;
        if (payout < 2 ether) {
            fee = (payout * 2) / 100;
        } else {
            fee = (payout * 1) / 100;
        }

        uint256 agencyAmount = payout - fee;

        users[mission.selectedAgency].reputationScore += 15;
        mission.status = MissionStatus.Delivered; // Delivered? or resolved??
        // mission.status = MissionStatus.Resolved;

        (bool feeSuccess, ) = payable(unArbiter).call{value: fee}("");
        if (!feeSuccess) revert TransferFailed();

        (bool agencySuccess, ) = payable(mission.selectedAgency).call{
            value: agencyAmount
        }(""); // this transfers the remaining payable amount to the relief agency. after deducting the fee

        if (!agencySuccess) {
            revert TransferFailed();
        }
    }

    function disputeMission(uint256 _missionId) external onlyDonor {
        Mission storage mission = missions[_missionId];
        if (msg.sender != mission.donor) {
            revert Unauthorized();
        }

        if (
            mission.status != MissionStatus.In_Transit &&
            mission.status != MissionStatus.Delivered
        ) {
            revert InvalidMissionStatus();
        }

        mission.status = MissionStatus.Disputed;
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
        mission.status = MissionStatus.Resolved; // Status changes to Resolved.

        if (_agencyFault) {
            users[mission.selectedAgency].reputationScore -= 30; // 30 point penalty for relief agency

            // and full refund to the donor
            (bool success, ) = payable(mission.donor).call{
                value: fundsToResolve
            }("");

            if (!success) revert TransferFailed();
        } else {
            //but if false alarm
            uint256 fee;
            if (fundsToResolve < 2 ether) {
                fee = (fundsToResolve * 2) / 100;
            } else {
                fee = (fundsToResolve * 1) / 100;
            }
            uint256 agencyAmount = fundsToResolve - fee;

            (bool feeSuccess, ) = payable(unArbiter).call{value: fee}("");
            if (!feeSuccess) revert TransferFailed();

            (bool agencySuccess, ) = payable(mission.selectedAgency).call{
                value: agencyAmount
            }(""); // same logic here as the approveDelivery functionality

            if (!agencySuccess) revert TransferFailed();
        }
    }
}
