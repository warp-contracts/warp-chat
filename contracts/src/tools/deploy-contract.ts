import fs from 'fs';
import path from 'path';
import { WarpFactory } from 'warp-contracts';

(async () => {
  const warp = WarpFactory.forMainnet();
  let wallet: any;
  let walletAddress: any;
  let walletDir = path.resolve('.secrets');
  let walletFilename = path.join(walletDir, `/wallet_${warp.environment}.json`);
  if (fs.existsSync(walletFilename)) {
    wallet = JSON.parse(fs.readFileSync(walletFilename, 'utf-8'));
    walletAddress = await warp.arweave.wallets.getAddress(wallet);
  } else {
    ({ jwk: wallet, address: walletAddress } = await warp.generateWallet());
    if (!fs.existsSync(walletDir)) fs.mkdirSync(walletDir);
    fs.writeFileSync(walletFilename, JSON.stringify(wallet));
  }
  const contractSrc = fs.readFileSync(path.join(__dirname, '../../dist/contractChat/contract.js'), 'utf8');
  const initialState = { messages: [], owner: walletAddress, evolve: '' };

  console.log('Deployment started');
  const { contractTxId } = await warp.deploy({
    wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  });
  // const srcTx = await warp.createSourceTx({ src: contractSrc }, wallet);
  // const newSrcTxId = await warp.saveSourceTx(srcTx);
  console.log(`Deployment completed. Checkout contract in SonAr: https://sonar.warp.cc/#/app/contract/${contractTxId}`);
})();
``;
