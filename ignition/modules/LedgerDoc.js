const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ledgerDocModule", (m) => {
  const ledgerDoc = m.contract("LedgerDoc");

  // Add initial users (owner will call these after deployment)
  m.call(ledgerDoc, "registerUser", [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // wallet address
    "Alice",                                       // name
    "QmdNh_profileCid_metadata", // profileCid (metadata)
    "QmdNhfTjibecxDnXPrepXpiVna9tnpKPj3B8mFzKg9xESF"            // profileImageCid (new)
  ], { id: "qq" });

  m.call(ledgerDoc, "registerUser", [
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", // wallet address
    "Bob",
    "QmdNh_profileCid_metadata", // profileCid (metadata)
    "QmdNhfTjibecxDnXPrepXpiVna9tnpKPj3B8mFzKg9xESF"            // profileImageCid (new)
  ], { id: "wwqs" });

  return { ledgerDoc };
});
