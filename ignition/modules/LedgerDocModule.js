// ignition/modules/LedgerDocModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LedgerDocModule", (m) => {
  // Deploy the LedgerDoc contract
  const ledgerDoc = m.contract("LedgerDoc");

  return { ledgerDoc };
});
