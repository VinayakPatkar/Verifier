const IPFS = require('ipfs-http-client');

async function main() {
  const ipfs = IPFS.create();

  const fileContent = Buffer.from('Hello, IPFS!');
  const [{ path, cid }] = await ipfs.add(fileContent);

  console.log('Added file with CID:', cid.toString());
}

main();
