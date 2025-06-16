// ignition/modules/LedgerDocModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { execSync } = require("child_process");
const {truncateTables} =require("../../backend/src/utils/truncateTables")

module.exports = buildModule("LedgerDocModule", (m) => {
  // Deploy the LedgerDoc contract

  const ledgerDoc = m.contract("LedgerDoc");


  //
  truncateTables();
  return { ledgerDoc };
});
