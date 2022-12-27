import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { LoggerFactory, Warp, WarpFactory, Contract } from 'warp-contracts';
import fs from 'fs';
import path from 'path';
import { ContractState } from '../src/contractChat/types/types';

jest.setTimeout(30000);
Date.now = jest.fn(() => 1487076708000);

describe('Testing Chat contract', () => {
  let ownerWallet: JWKInterface;
  let owner: string;

  let initialState: ContractState;

  let arlocal: ArLocal;
  let warp: Warp;
  let contract: Contract<ContractState>;

  let contractSrc: string;

  let contractId: string;

  beforeAll(async () => {
    arlocal = new ArLocal(1820, false);
    await arlocal.start();

    LoggerFactory.INST.logLevel('error');

    warp = WarpFactory.forLocal(1820);

    ({ jwk: ownerWallet, address: owner } = await warp.generateWallet());

    initialState = { messages: [], owner, evolve: '' };

    contractSrc = fs.readFileSync(path.join(__dirname, '../dist/contractChat/contract.js'), 'utf8');

    ({ contractTxId: contractId } = await warp.deploy({
      wallet: ownerWallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    }));
    console.log('Deployed contract: ', contractId);
    contract = warp.contract<ContractState>(contractId).connect(ownerWallet);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it('should properly deploy contract', async () => {
    const contractTx = await warp.arweave.transactions.get(contractId);

    expect(contractTx).not.toBeNull();
  });

  it('should read contract state', async () => {
    expect((await contract.readState()).cachedValue.state).toEqual(initialState);
  });

  it('should not post with no content', async () => {
    await expect(contract.writeInteraction({ function: 'write' }, { strict: true })).rejects.toThrow(
      'Cannot create interaction: Creator must provide a message.'
    );
  });

  it('should properly post message', async () => {
    await contract.writeInteraction({ function: 'write', content: 'Asia' });

    const { cachedValue } = await contract.readState();
    expect(cachedValue.state.messages[0]).toEqual({
      id: 1,
      content: 'Asia',
      creator: owner,
      timestamp: '1487076708000',
    });
  });

  it("should properly evolve contract's source code", async () => {
    const newSource = fs.readFileSync(path.join(__dirname, './data/evolve-contract-chat.js'), 'utf8');

    const srcTx = await warp.createSourceTx({ src: newSource }, ownerWallet);
    const newSrcTxId = await warp.saveSourceTx(srcTx);

    await contract.evolve(newSrcTxId);

    await contract.writeInteraction({ function: 'write', content: 'any' });

    const { cachedValue } = await contract.readState();
    console.log(cachedValue);
    expect(cachedValue.state.messages[1]).toEqual({
      id: 2,
      content: 'Evolve',
      creator: owner,
      timestamp: '1487076708000',
    });
  });
});
