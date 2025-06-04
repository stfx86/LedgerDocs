require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true, // Enable IR pipeline to handle stack-too-deep error
      optimizer: {
        enabled: true, // Enable optimizer for better bytecode
        runs: 200, // Default optimization runs
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
  },
};
//moz-extension://1fd1f75b-3014-4477-ab64-55aa0f9134fb/home.html