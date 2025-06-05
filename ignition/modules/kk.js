const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ledgerDocModule", (m) => {
    const ledgerDoc = m.contract("LedgerDoc");

    // Add authorized admins (including owner implicitly)
    m.call(ledgerDoc, "addAuthorized", [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ], { id: "authorize_alice" });

    m.call(ledgerDoc, "addAuthorized", [
        "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"
    ], { id: "authorize_bob" });

    // Register users
    m.call(ledgerDoc, "registerUser", [{
        wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        name: "Alice",
        profileCid: "QmdNh_profileCid_metadata",
        profileImageCid: "QmdNhfTjibecxDnXPrepXpiVna9tnpKPj3B8mFzKg9xESF"
    }], { id: "register_alice" });

    m.call(ledgerDoc, "registerUser", [{
        wallet: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
        name: "Bob",
        profileCid: "QmdNh_profileCid_metadata",
        profileImageCid: "QmdNhfTjibecxDnXPrepXpiVna9tnpKPj3B8mFzKg9xESF"
    }], { id: "register_bob" });

    // Upload document by Alice
    m.call(ledgerDoc, "uploadDocument", [{
        metadataCid: "QmMeta123",
        encryptedCid: "QmEnc123",
        descriptionCid: "QmDesc123",
        previewCid: "QmPrev123",
        thumbnailCid: "QmThumb123",
        title: "Blockchain for Docs",
        categories: ["Web3", "Documents"],
        price: 1000n
    }], {
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        id: "upload_doc"
    });

    // Bob buys document ID 1
    m.call(ledgerDoc, "buyDocument", [1], {
        from: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
        value: 1000n,
        id: "buy_doc"
    });

    // Admin suspends Alice
    m.call(ledgerDoc, "suspendUser", [1], {
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        id: "suspend_alice"
    });

    // Admin activates Alice again
    m.call(ledgerDoc, "activateUser", [1], {
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        id: "activate_alice"
    });

    // Alice removes her document
    m.call(ledgerDoc, "removeDocument", [1], {
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        id: "remove_doc"
    });

    return { ledgerDoc };
});
