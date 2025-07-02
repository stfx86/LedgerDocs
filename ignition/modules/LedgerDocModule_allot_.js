// ignition/modules/LedgerDocModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("ethers");

// Template encryption CIDs (from your first original document)
const TEMPLATE_ENCRYPTED_CID = "QmUoydnWM54eHsQ6v62eP7jBa3fk85QK8DmJMLxctuUJdD";
const TEMPLATE_DESCRIPTION_CID = "QmXb87nbHzHMkK4YNmDQLjoEYigVK4fGrtcufRdQS3pDZC";
const TEMPLATE_PREVIEW_CID = "QmUgbquXQQ2xEu3H2c6mbBVkH31kxCZmVKRRvFkE3TRewb";
const TEMPLATE_THUMBNAIL_CID = "QmZiUjiyCXBnpjx4srPkqwzqfqzUiwpYMbzcvnibCvhKKX";
const TEMPLATE_DECRYPTION_KEY_CID = "QmExampleDecryptionKeyCIDFromTemplateDoc"; // **Replace this with your real decryption key CID for the template document**

module.exports = buildModule("LedgerDocModule", (m) => {
  const ledgerDoc = m.contract("LedgerDoc");
  const uploaderAddress = m.getAccount(0);

  // Register uploader user (id 1)
  m.call(
    ledgerDoc,
    "registerUser",
    [
      {
        wallet: uploaderAddress,
        name: "stofy",
        profileCid: "",
        profileImageCid: "bafkreihf6po3ewad2uqgarmmclykd2nqiqmzkecq6hegi55bppg4c5uz64",
      },
    ],
    { from: uploaderAddress }
  );

  // === Existing documents with real encryption + decryption keys ===
  // (You gave 10 original docs, so listed all here with their real encryption fields)
  const existingDocuments = [
    {
      title: "Implementing a teleo-reactive programming system",
      categories: ["cs.PL"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmXCATUtuDRFUzeiK36g2EVspaDfpk62oEcxeWArMfPq7Y",
                             encryptedCid: "QmUoydnWM54eHsQ6v62eP7jBa3fk85QK8DmJMLxctuUJdD",
                             descriptionCid: "QmXb87nbHzHMkK4YNmDQLjoEYigVK4fGrtcufRdQS3pDZC",
                             previewCid: "QmUgbquXQQ2xEu3H2c6mbBVkH31kxCZmVKRRvFkE3TRewb",
                             thumbnailCid: "QmZiUjiyCXBnpjx4srPkqwzqfqzUiwpYMbzcvnibCvhKKX",
                             decryptionKeyCid: "bafkreibchbcovquqwt4z3tshwar36xcpbuwmzgy2ocrrb6ntq6cypseqfe",
    },
    {
      title: "A Unified Programming Model for Heterogeneous Computing with CPU and Accelerator Technologies",
      categories: ["cs.DC"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmR9cRP1Dvp2gno1yKpLdbKx2DrsjJAFNu22Co9fFnwG7q",
                             encryptedCid: "QmVaixVtFr3g2QtPsaEr1wZFPjDjwxRfAPpsKjJTRSB9Um",
                             descriptionCid: "QmUD1WBWFJLcCH3e6z6RM8A6JGTiAoiAERrovvNKTBXDSD",
                             previewCid: "QmdYqExWF7ayzPErTz9HXD68ZB1xiH4xfigEtQ82hDJMr8",
                             thumbnailCid: "QmNbpNWoHEu2VNwmV6A85pjdh3kPHKJghPFc8BrpS7Fs4k",
                             decryptionKeyCid: "bafkreifzhsls3ur2f3a5gitzigi7hd7mbrdouq4e2nexfm77jh2lkalofe",
    },
    {
      title: "Stable models and an alternative logic programming paradigm",
      categories: ["cs.LO", "cs.AI", "I.2.3", "I.2.4"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmenuKNnC2BqgrkRVWfvcMm8sPPPEZHvuSfNAzRzXADmBA",
                             encryptedCid: "QmWrGwaVqcuj1bbAUswHP1vkW1v8ZDjw2g64n25qXY7bpg",
                             descriptionCid: "QmXCRonkF9N2n1gxHnf4cKLnMhtSGBt7bVGcqGDL29tjjM",
                             previewCid: "QmTbjunt5wQFtz6yqhsZWbVg549RA8WZKWZ6DMX7GvorEC",
                             thumbnailCid: "QmW9UPuSdnfLqsXJTdfrdYLVqzZ6Z2hqmYGuao6cqFZGnX",
                             decryptionKeyCid: "bafkreifzolxpygdqx67rlgvmkrcrbdv22hiqr52htcmrtbhx5ncljgvmea",
    },
    {
      title: "An Immune System Inspired Approach to Automated Program Verification",
      categories: ["cs.NE"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmWuMJbUX4iaHU7uAg2s9cU3XMcPoNh7GFQbVMM2NxaGS2",
                             encryptedCid: "QmYBR7ekfBEGn8ez1SJrKCjn2mfcA3nTqtUJVqqt69cc2g",
                             descriptionCid: "QmUkAez67fowST17Lw1e34BKnxdii58yEUSSF1tCi2Fn9n",
                             previewCid: "QmQj8CYYL7Mm1NW7H9PXEzPtQ6u8iK36DpGu5Bv3AuqqBg",
                             thumbnailCid: "QmWWSKrcrHcGPDEPiFAbYEeeNgwMSPeRXP4fGrtcufRdQS3pDZC",
                             decryptionKeyCid: "bafkreibjgssou65zoqek2yi7b7sviwk37uhqkyy3sfi4qybzbjkbrmmviu",
    },
    {
      title: "A Compiler for Ordered Logic Programs",
      categories: ["cs.AI", "I.2.3"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmQCs7skiEZsidmr4E5bXHwL5mgWzf66ta6KSEQABtUYza",
                             encryptedCid: "QmfD7rmy7Ed25iqQesGwn14VuoFmDZgCLdB42LqgG126mZ",
                             descriptionCid: "QmWaaeNGLhDqMvykisbSFi9P9N6PfaWSDAr9DJL7ci283Y",
                             previewCid: "QmeBeRzt39VCkMTwgHah7or3Z8BfCBaQvtHjmYzwMxWgum",
                             thumbnailCid: "QmZmbeULSGzwrGzJiUrTLWpDsmFtgduzotRf9knCjVPhCF",
                             decryptionKeyCid: "bafkreihcxqyrcguvbabquwersvnk2z3dc2p3ldqlwvyxm2ppawdk2vr5tq",
    },
    {
      title: "System Predictor: Grounding Size Estimator for Logic Programs under Answer Set Semantics",
      categories: ["cs.AI"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmTJoTFkxYqAwnh37WS92gJ6gLAv754XKduiV71zGneDVw",
                             encryptedCid: "QmPiQcpdXAToXvEizG4119Zp4WGgbK6dLWDEdcKJumzApo",
                             descriptionCid: "QmRV6o7wMyBBquD3mMgvFSanGuRAZwe6PM8svy4V7fsfs",
                             previewCid: "QmXk18W8D7LVDzwfqTX54ymF6926XYM48LaShfB6V8cfU3",
                             thumbnailCid: "QmPgzGcDAz1jSFpH1RJPETWLh2RcHyuKMoYUA2V4Tb3J2b",
                             decryptionKeyCid: "bafkreie6nfgopvw2mukex3jq7ycphzbfkfidmulmxo4cbum3lasfhpoxbe",
    },
    {
      title: "Ezhil: A Tamil Programming Language",
      categories: ["cs.PL", "cs.CL", "D.3.0"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmYATpnSQD1dGZfiC1bH7L5AfYtiERDM9VqSwrgaWqyiU2",
                             encryptedCid: "QmfWGkHx2Pj9hJzXLprBByHDPfekzfMgmMDePrtw58H7jb",
                             descriptionCid: "Qmd7Y5qsieSynvntsWPSSLpf1DPCLKmSRXhtUmWjZP1NVz",
                             previewCid: "QmXBfaymiKDJZMb9EW1EeDk9GAiVJ87kiSPMK4XiQKBGco",
                             thumbnailCid: "QmY3QbWZsXjy5Q8DW95bLPs9Rp3FtFGPEFHLg6y7fAjk2r",
                             decryptionKeyCid: "bafkreifpztcqsdrk4fu4bw66f7k5vwwzp7d7dmx7ltdnsc2hniyuk6gdfm",
    },
    {
      title: "Smart Contract Vulnerabilities on Ethereum",
      categories: ["security", "eth"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmRH8xVGbEyGTMMi2xuijLEBMMvLPD5FwsmxL9uFNyvLyR",
                             encryptedCid: "QmcXqjTjQSuLhJbkhwTXXKp3NqSy9w5gpyFayZhTiyZfDR",
                             descriptionCid: "Qmbp1teZbyHZjVNtRf9P7wGC4ntbE3rgBDQ72LpQWLE5cF",
                             previewCid: "QmXpVPJ9Nn1DJNwrC9NnoCrF6RnbExrP1yGdpry6WHcxNq",
                             thumbnailCid: "QmYAraNkT3Yf1f6Df2Wv4kSu54xJQxhLmJp7tcTYBa3hHT",
                             decryptionKeyCid: "bafkreif35eyrhpmrmnx6y2gxzr34df4xur54udb7b2mjt3pdflc5zww63u",
    },
    {
      title: "Stegos: A Language for Steganographic Communication",
      categories: ["security", "eth"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmUb7o7D1dRp4vChJq1KdQyTCz94hZMVnPTfV6USfgbGEQ",
                             encryptedCid: "QmSoVjKh8UHPY8czs5xpMjcYzSvv3gmCZYT14YVEQDRKhC",
                             descriptionCid: "QmVQ7FpejsdrbDrhSE9XAPqGytTgUXKkMdP5RyirJyY8Ud",
                             previewCid: "QmYR67eYb6FTtpj8Zk8MQJ6e3D1jv7U94fsoQwUgn3nHsK",
                             thumbnailCid: "QmV9E9ujSrE3wF93Xq3a66JNU3XtvHRn6vqUe9YuEHa6cp",
                             decryptionKeyCid: "bafkreigh2pl2bqrsxqrbc62gc7vhx7gtvwvm7kl7vlhq6fx4pscdjbwuhu",
    },
  ];

  // === New documents missing encryption fields ===
  // Fill them with the template encryption data
  const newDocuments = [
    {
      title:
      "Complete Web3 Development Guide Complete Web3 Development GuideComplete Web3 Development GuideComplete Web3 Development ",
      categories: ["Education", "Code"],
      price: ethers.parseEther("0.05"),
                             uploaderAddress,
                             metadataCid: "QmXXS7aQTCeQcv6E5k3AZ7L2wefKYXyXKiZy7xvAy4mwRg",
    },
    {
      title: "Smart Contract Templates Pack",
      categories: ["Code", "Education"],
      price: ethers.parseEther("0.03"),
                             uploaderAddress,
                             metadataCid: "QmWzHH2aYaKDgYSe9yYgELjB3xZQHjPBbTLMKfP46AV8iM",
    },
    {
      title: "Quick Start for Solidity",
      categories: ["Code", "Education"],
      price: ethers.parseEther("0.002"),
                             uploaderAddress,
                             metadataCid: "QmVmLrj83NVD9XEG5VwhXBxaDYWTSnHwwa3YQp8LfWdC2q",
    },
    {
      title: "Smart Contract Templates Pack",
      categories: ["Code", "Education"],
      price: ethers.parseEther("0.003"),
                             uploaderAddress,
                             metadataCid: "QmS6mQQUXtEfSNXKLZs6EGM3qgJ4y9bQGv9TGMJ5TX1w8j",
    },
    {
      title: "Ethensec",
      categories: ["Code", "Education"],
      price: ethers.parseEther("0.002"),
                             uploaderAddress,
                             metadataCid: "QmYAkijHbpLqx76TTh4vTwTw2RyfMCrRQPNXgvv6EY5rXh",
    },
    {
      title: "Complete Web3 Development Guide",
      categories: ["Code", "Education"],
      price: ethers.parseEther("0.001"),
                             uploaderAddress,
                             metadataCid: "QmYLAVPps3NEHFgAGJHHru3QH3Pxq1hD1b8pxSQ9b4AuL4",
    },
  ];

  let docIdCounter = 0;

  // Upload existing docs first
  existingDocuments.forEach((doc) => {
    m.call(
      ledgerDoc,
      "uploadDocument",
      [
        {
          metadataCid: doc.metadataCid,
          encryptedCid: doc.encryptedCid,
          descriptionCid: doc.descriptionCid,
          previewCid: doc.previewCid,
          thumbnailCid: doc.thumbnailCid,
          title: doc.title,
          categories: doc.categories,
          price: doc.price,
          uploaderAddress: doc.uploaderAddress,
        },
      ],
      { from: uploaderAddress, id: `existingDoc${docIdCounter}` }
    );

    m.call(
      ledgerDoc,
      "setDecryptionKeyCID",
      [docIdCounter + 1, doc.decryptionKeyCid],
      { from: uploaderAddress, id: `setDecKey${docIdCounter}` }
    );

    docIdCounter++;
  });

  // Upload new docs with template encryption fields
  newDocuments.forEach((doc) => {
    m.call(
      ledgerDoc,
      "uploadDocument",
      [
        {
          metadataCid: doc.metadataCid,
          encryptedCid: TEMPLATE_ENCRYPTED_CID,
          descriptionCid: TEMPLATE_DESCRIPTION_CID,
          previewCid: TEMPLATE_PREVIEW_CID,
          thumbnailCid: TEMPLATE_THUMBNAIL_CID,
          title: doc.title,
          categories: doc.categories,
          price: doc.price,
          uploaderAddress: doc.uploaderAddress,
        },
      ],
      { from: uploaderAddress, id: `newDoc${docIdCounter}` }
    );

    m.call(
      ledgerDoc,
      "setDecryptionKeyCID",
      [docIdCounter + 1, TEMPLATE_DECRYPTION_KEY_CID],
      { from: uploaderAddress, id: `setDecKey${docIdCounter}` }
    );

    docIdCounter++;
  });

  return { ledgerDoc };
});
