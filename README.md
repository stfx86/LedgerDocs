AIzaSyAunk5f4G4eobIbLKrDSDsTnCE5bIofcgE
https://ipfs.github.io/public-gateway-checker/

43567697089yj89nu
43567697089yj89nu
43567697089yj89nu


# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true, // Enable IR pipeline to handle stack-too-deep error
      optimizer: {
        enabled: true, // Enable optimizer for better bytecode
        runs: 100, // Default optimization runs
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
