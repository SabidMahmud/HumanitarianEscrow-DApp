const HumanitarianEscrow = artifacts.require("HumanitarianEscrow");

/**
 * Migration: Deploy HumanitarianEscrow contract
 *
 * The deployer's account (accounts[0] in Ganache) will automatically
 * become the UN Arbiter, as set in the contract's constructor:
 *   constructor() { unArbiter = msg.sender; }
 *
 * With the -d (deterministic) flag, accounts[0] is always:
 *   0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
 */
module.exports = function (deployer) {
  deployer.deploy(HumanitarianEscrow);
};
