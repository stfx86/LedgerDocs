const path = require("path");
const { uploadFileToIPFS } = require("./../src/utils/ipfs")

async function main () {



// const result = await    uploadFileToIPFS(path.join(__dirname, "p.pdf"))
console.log(result);
console.log(path.join(__dirname, "p.pdf"));

}

main();
