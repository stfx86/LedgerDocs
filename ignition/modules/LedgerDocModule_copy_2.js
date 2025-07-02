// ignition/modules/LedgerDocModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("ethers");

module.exports = buildModule("LedgerDocModule", (m) => {
  // Deploy the LedgerDoc contract
  const ledgerDoc = m.contract("LedgerDoc");

  // Documents array to upload
  const documents = [
    {
      title: "Implementing a teleo-reactive programming system",
      categories: ["cs.PL"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmXCATUtuDRFUzeiK36g2EVspaDfpk62oEcxeWArMfPq7Y",
      encryptedCid: "QmUoydnWM54eHsQ6v62eP7jBa3fk85QK8DmJMLxctuUJdD",
      descriptionCid: "QmXb87nbHzHMkK4YNmDQLjoEYigVK4fGrtcufRdQS3pDZC",
      previewCid: "QmUgbquXQQ2xEu3H2c6mbBVkH31kxCZmVKRRvFkE3TRewb",
      thumbnailCid: "QmZiUjiyCXBnpjx4srPkqwzqfqzUiwpYMbzcvnibCvhKKX",
      encryptionKeyHex: "3d04a261c623b4b44532858cc54e9a2acf2dfa09988eb68fa07aadde4c5e908e",
      ivHex: "8bd6231cb082ace97cc775f9",
    },
    {
      title: "A Unified Programming Model for Heterogeneous Computing with CPU and Accelerator Technologies",
      categories: ["cs.DC"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmR9cRP1Dvp2gno1yKpLdbKx2DrsjJAFNu22Co9fFnwG7q",
      encryptedCid: "QmVaixVtFr3g2QtPsaEr1wZFPjDjwxRfAPpsKjJTRSB9Um",
      descriptionCid: "QmUD1WBWFJLcCH3e6z6RM8A6JGTiAoiAERrovvNKTBXDSD",
      previewCid: "QmdYqExWF7ayzPErTz9HXD68ZB1xiH4xfigEtQ82hDJMr8",
      thumbnailCid: "QmNbpNWoHEu2VNwmV6A85pjdh3kPHKJghPFc8BrpS7Fs4k",
      encryptionKeyHex: "3b6ff4f2daec9f98e852aaf553d991ab9b20874df6e09a352232ec14593c7511",
      ivHex: "a28b6e325e4932f9083a372f",
    },
    {
      title: "Stable models and an alternative logic programming paradigm",
      categories: ["cs.LO", "cs.AI", "I.2.3", "I.2.4"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmenuKNnC2BqgrkRVWfvcMm8sPPPEZHvuSfNAzRzXADmBA",
      encryptedCid: "QmWrGwaVqcuj1bbAUswHP1vkW1v8ZDjw2g64n25qXY7bpg",
      descriptionCid: "QmXCRonkF9N2n1gxHnf4cKLnMhtSGBt7bVGcqGDL29tjjM",
      previewCid: "QmTbjunt5wQFtz6yqhsZWbVg549RA8WZKWZ6DMX7GvorEC",
      thumbnailCid: "QmW9UPuSdnfLqsXJTdfrdYLVqzZ6Z2hqmYGuao6cqFZGnX",
      encryptionKeyHex: "8753ff93713e2f75783c90b944e10e70d2725b8a01490e1ba0655e0c184c3897",
      ivHex: "c20b4dbd5c99c8cc4cdbf145",
    },
    {
      title: "An Immune System Inspired Approach to Automated Program Verification",
      categories: ["cs.NE"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmWuMJbUX4iaHU7uAg2s9cU3XMcPoNh7GFQbVMM2NxaGS2",
      encryptedCid: "QmYBR7ekfBEGn8ez1SJrKCjn2mfcA3nTqtUJVqqt69cc2g",
      descriptionCid: "QmUkAez67fowST17Lw1e34BKnxdii58yEUSSF1tCi2Fn9n",
      previewCid: "QmQj8CYYL7Mm1NW7H9PXEzPtQ6u8iK36DpGu5Bv3AuqqBg",
      thumbnailCid: "QmWWSKrcrHcGPDEPiFAbYEeeNgwMSPeRXP4fGrtcufRdQS3pDZC",
      encryptionKeyHex: "6de001785ab521d86385d66d6854a63b24033a315f1d90a5da6078ec82d7ad10",
      ivHex: "6613474b2f171cb9f241b998",
    },
    {
      title: "A Compiler for Ordered Logic Programs",
      categories: ["cs.AI", "I.2.3"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmQCs7skiEZsidmr4E5bXHwL5mgWzf66ta6KSEQABtUYza",
      encryptedCid: "QmfD7rmy7Ed25iqQesGwn14VuoFmDZgCLdB42LqgG126mZ",
      descriptionCid: "QmWaaeNGLhDqMvykisbSFi9P9N6PfaWSDAr9DJL7ci283Y",
      previewCid: "QmeBeRzt39VCkMTwgHah7or3Z8BfCBaQvtHjmYzwMxWgum",
      thumbnailCid: "QmZmbeULSGzwrGzJiUrTLWpDsmFtgduzotRf9knCjVPhCF",
      encryptionKeyHex: "77d230710e0c7f28f998374305b3b00d578d74ae6411a11f0aede270edf36a04",
      ivHex: "5ce3544786e5710a7ff871c6",
    },
    {
      title: "System Predictor: Grounding Size Estimator for Logic Programs under Answer Set Semantics",
      categories: ["cs.AI"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmTJoTFkxYqAwnh37WS92gJ6gLAv754XKduiV71zGneDVw",
      encryptedCid: "QmPiQcpdXAToXvEizG4119Zp4WGgbK6dLWDEdcKJumzApo",
      descriptionCid: "QmRV6o7wMyBBquD3mMgvFSanGuRAZwe6PM8svy4V7fsfsG",
      previewCid: "QmXk18W8D7LVDzwfqTX54ymF6926XYM48LaShfB6V8cfU3",
      thumbnailCid: "QmPgzGcDAz1jSFpH1RJPETWLh2RcHyuKMoYUA2V4Tb3J2b",
      encryptionKeyHex: "5dd000fb7e3a141bc2580e0ff0379beabff57597e71c82224994fd4e3b2be0bc",
      ivHex: "be5e183ae5a07c0266231ec6",
    },
    {
      title: "Ezhil: A Tamil Programming Language",
      categories: ["cs.PL", "cs.CL", "D.3.0"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmYATpnSQD1dGZfiC1bH7L5AfYtiERDM9VqSwrgaWqyiU2",
      encryptedCid: "QmfWGkHx2Pj9hJzXLprBByHDPfekzfMgmMDePrtw58H7jb",
      descriptionCid: "Qmd7Y5qsieSynvntsWPSSLpf1DPCLKmSRXhtUmWjZP1NVz",
      previewCid: "QmXBfaymiKDJZMb9EW1EeDk9GAiVJ87kiSPMK4XiQKBGco",
      thumbnailCid: "QmY3QbW8WvSVCKu8XYfKRCKfDX3k3UccuyV426ar2RVTNN",
      encryptionKeyHex: "6c269e0cb9faef50d0bb7ec5eaa0ed3be636956ff0b13431eb0e6e88c3200e27",
      ivHex: "fa17ff3fde49dabe8ede235e",
    },
    {
      title: "Probabilistic Program Abstractions",
      categories: ["cs.AI"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "QmVW1B3muKL2mJrS5VQ7YMPX8eN78tMHGQ2hjc7j3x65tM",
      encryptedCid: "QmU3ohGjHzCStbjSLKCotBayyXL8fFzzkumjNsgrX7eR4H",
      descriptionCid: "QmXbj4BZPnwAeCP7VL96KupmMJe11P3iazbiuUTWYCX5gx",
      previewCid: "QmXPqTBi8K31PhX2xdtpFCfy43aHZXE7L79pr5aHYQ78yh",
      thumbnailCid: "QmRgxzT1JQ4j3m6anjora8XtB3Ch8HRJUW1HuveJ5Guxq9",
      encryptionKeyHex: "9c50e3820532e5b8d29a0a7c3c1d35a8e05ed3ed25814433750ffd0076df10cc",
      ivHex: "1471c691b283859f74ea2ba9",
    },
    {
      title: "An Abstract Programming System",
      categories: ["cs.SE", "cs.LO", "D.1.2"],
      price: 0,
      uploaderAddress: "0x0000000000000000000000000000000000000000",
      metadataCid: "Qmc6GwXeG17riwfRv3HYhYq6pq92APGVfHCFLxB1XJieso",
      encryptedCid: "QmZfitAUf4rynvHZdTDoGS1sN7oSBxB33MDuFxjKWHR7t2",
      descriptionCid: "QmVm4LoxuX8QvT3gQRZ9aoEqRdLMghXZ2d2drNHh12px9w",
      previewCid: "QmXm8kSQWM65r4Cy9kGXVufPdk2ZkTsKtAe8a876DbEHm9",
      thumbnailCid: "QmP7HRiDa2UHxGhTdVN9WMWZN3U6tEDUGfGJCYEXW2j3WG",
      encryptionKeyHex: "539c650ca3c29144fbdbb",
      ivHex: "68fd7ebfdd81592110632c7a",
    },
  ];

  // Use a single uploader account (Hardhat's default account 0)
  const uploaderAddress = m.getAccount(0);

  // Register the single uploader (assuming a registerUser function expects a struct)
  m.call(ledgerDoc, "registerUser", [
    {
      wallet: uploaderAddress,
      name: "stofy",
      profileCid: "",
      profileImageCid: "bafkreihf6po3ewad2uqgarmmclykd2nqiqmzkecq6hegi55bppg4c5uz64",
    },
  ], {
    from: uploaderAddress,
  });

  // Small price for all documents (0.001 ETH in wei)
  const smallPrice = ethers.parseEther("0.001");

  // Counter for future IDs
  let l = 0;

  // Upload each document using the single uploader account
  documents.forEach((doc) => {
    const documentInput = {
      metadataCid: doc.metadataCid,
      encryptedCid: doc.encryptedCid,
      descriptionCid: doc.descriptionCid,
      previewCid: doc.previewCid,
      thumbnailCid: doc.thumbnailCid, // Corrected from encryptionIdCid
      title: doc.title,
      categories: ["Code", "Education"], // Replace original categories
      price: smallPrice, // 0.001 ETH
      uploaderAddress: uploaderAddress, // Single uploader address
    };

    // Call uploadDocument with unique future ID
    m.call(ledgerDoc, "uploadDocument", [documentInput], {
      from: uploaderAddress,
      id: `w${l}`,
    });
    l++;
  });

  return { ledgerDoc };
});
