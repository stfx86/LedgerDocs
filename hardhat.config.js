require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true, // Enable IR pipeline to handle stack-too-deep error
      optimizer: {
        enabled: true , // Enable optimizer for better bytecode
        runs: 200, // Default optimization runs
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    holesky: {
      url: "https://holesky.drpc.org", // RPC endpoint
      chainId: 17000,
      accounts: [
        "af1d426a5c7aa4ace12194ca255c1fee3e82fb4877f114cf20336c5f6642ce4f"
      ]

  },
},
etherscan: {
  apiKey: "IIVW4NXICTNRT4AKW5Z74UZBNWUGD33N3R", // Get from https://etherscan.io/myapikey
}


}
//0x101ebC5544Fe123eE93ABf78935C4F5b0F4aA878

// 0x40f16c9f677420FFFcC058b93E08Ba5c2C35a402
//moz-extension://1fd1f75b-3014-4477-ab64-55aa0f9134fb/home.html
