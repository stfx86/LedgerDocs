const hre = require("hardhat");

async function main() {
    const [owner, alice, bob] = await hre.ethers.getSigners();
    const deployedAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
    const ledger = await hre.ethers.getContractAt("LedgerDoc", deployedAddress);

    console.log("Owner:", owner.address);
    console.log("Alice:", alice.address);
    console.log("Bob:", bob.address);

    // 1️⃣ Authorize Alice and Bob
    try {
        await (await ledger.setAuthorized(alice.address, true)).wait();
        await (await ledger.setAuthorized(bob.address, true)).wait();
        console.log("✅ Authorized Alice & Bob");
    } catch (error) {
        console.error("❌ Failed to authorize users:", error.message);
    }

    // 2️⃣ Register Alice and Bob
    for (const user of [alice, bob]) {
        try {
            const input = {
                wallet: user.address,
                name: user === alice ? "Alice" : "Bob",
                profileCid: user === alice ? "ipfs://alicePic" : "ipfs://bobPic",
                profileImageCid: user === alice ? "ipfs://aliceImg" : "ipfs://bobImg",
            };
            await (await ledger.connect(user).registerUser(input)).wait();
            const id = await ledger.addressToUserId(user.address);
            console.log(`✅ Registered ${user.address} as user #${id}`);
        } catch (error) {
            console.error(`❌ Failed to register ${user.address}:`, error.message);
        }
    }

    // 3️⃣ Suspend Bob temporarily
    try {
        const bobId = await ledger.addressToUserId(bob.address);
        await (await ledger.setUserStatus(bobId, 1)).wait();
        console.log(`🚫 Suspended user #${bobId} (Bob)`);
    } catch (error) {
        console.error("❌ Failed to suspend Bob:", error.message);
    }

    // 4️⃣ Have Alice upload a document
    let docId;
    try {
        const aliceId = await ledger.addressToUserId(alice.address);
        const docInput = {
            metadataCid: "ipfs://meta",
            encryptedCid: "ipfs://enc",
            descriptionCid: "ipfs://desc",
            previewCid: "ipfs://prev",
            thumbnailCid: "ipfs://thumb",
            title: "Sample Doc",
            categories: ["guide", "example"],
            price: ethers.parseEther("0.1"),
        };
        await (await ledger.connect(alice).uploadDocument(docInput)).wait();
        console.log("📄 Alice uploaded a document");
        docId = (await ledger.nextDocumentId()).toString() - 1;
        console.log(`Document ID: ${docId}`);
    } catch (error) {
        console.error("❌ Failed to upload document:", error.message);
        docId = null;
    }

    // 5️⃣ Resume Bob
    try {
        const bobId = await ledger.addressToUserId(bob.address);
        await (await ledger.setUserStatus(bobId, 0)).wait();
        console.log(`✅ Re-activated Bob`);
    } catch (error) {
        console.error("❌ Failed to reactivate Bob:", error.message);
    }

    // 6️⃣ Bob purchases the document
    if (docId !== null) {
        try {
            const price = await ledger.getDocument(docId).then(d => d.price);
            await (await ledger.connect(bob).purchaseDocument(docId, { value: price.toString() })).wait();
            console.log(`💰 Bob purchased document #${docId}`);
        } catch (error) {
            console.error("❌ Failed to purchase document:", error.message);
        }
    } else {
        console.log("❌ Cannot purchase document: no document ID available");
    }

    // 7️⃣ Alice (uploader) removes the document
    if (docId !== null) {
        try {
            await (await ledger.connect(alice).removeDocument(docId)).wait();
            console.log(`🗑️ Alice removed document #${docId}`);
        } catch (error) {
            console.error("❌ Failed to remove document:", error.message);
        }
    } else {
        console.log("❌ Cannot remove document: no document ID available");
    }

    // 8️⃣ Display final states
    try {
        const userAlice = await ledger.getUserByAddress(alice.address);
        const userBob = await ledger.getUserByAddress(bob.address);
        const document = docId !== null ? await ledger.getDocument(docId) : null;
        console.log("\n--- Final States ---");
        console.log("Alice:", userAlice);
        console.log("Bob:", userBob);
        if (document) {
            console.log("Document:", document);
        } else {
            console.log("Document: Not available");
        }
        console.log("\n✅ All functions tested!");
    } catch (error) {
        console.error("❌ Failed to get final states:", error.message);
    }
}

main()
.catch(err => {
    console.error("❌ Main error:", err.message);
    process.exit(1);
});