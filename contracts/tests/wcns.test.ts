import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { LoggerFactory, Warp, WarpFactory, Contract } from 'warp-contracts';
import fs from 'fs';
import path from 'path';
import { ContractState } from '../src/contractChatNameService/types/types';

jest.setTimeout(30000);
Date.now = jest.fn(() => 1487076708000);

describe('Testing Chat Name Service contract', () => {
  let ownerWallet: JWKInterface;
  let owner: string;

  let initialState: ContractState;

  let arlocal: ArLocal;
  let warp: Warp;
  let contract: Contract<ContractState>;

  let contractSrc: string;

  let contractId: string;

  beforeAll(async () => {
    arlocal = new ArLocal(1821, false);
    await arlocal.start();

    LoggerFactory.INST.logLevel('error');

    warp = WarpFactory.forLocal(1821);

    ({ jwk: ownerWallet, address: owner } = await warp.generateWallet());

    initialState = { names: {}, owner, evolve: '' };

    contractSrc = fs.readFileSync(path.join(__dirname, '../dist/contractChatNameService/contract.js'), 'utf8');

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

  it('should not post with no name', async () => {
    await expect(contract.writeInteraction({ function: 'registerName' }, { strict: true })).rejects.toThrow(
      'Cannot create interaction: Name must be provided.'
    );
  });

  it('should properly register name', async () => {
    await contract.writeInteraction({ function: 'registerName', name: 'Asia Zioła', id: owner });

    const { cachedValue } = await contract.readState();
    console.log(cachedValue);
    expect(cachedValue.state.names[owner.toLowerCase()]).toEqual('Asia Zioła');
  });

  it('should properly get name', async () => {
    const { result } = await contract.viewState({ function: 'getName', id: owner });

    expect((result as any).name).toEqual('Asia Zioła');
  });

  it('should not allow to register the same name again', async () => {
    await expect(
      contract.writeInteraction({ function: 'registerName', name: 'Asia Zioła' }, { strict: true })
    ).rejects.toThrow('Cannot create interaction: Name already registered.');
  });

  it('should allow to change the name for the same caller', async () => {
    await contract.writeInteraction({ function: 'registerName', name: 'Angelka', id: owner });

    const { cachedValue } = await contract.readState();
    const name = cachedValue.state.names[owner.toLowerCase()];
    expect(name).toEqual('Angelka');
  });

  it("should properly evolve contract's source code", async () => {
    const newSource = fs.readFileSync(path.join(__dirname, './data/evolve-contract.js'), 'utf8');

    const srcTx = await warp.createSourceTx({ src: newSource }, ownerWallet);
    const newSrcTxId = await warp.saveSourceTx(srcTx);

    await contract.evolve(newSrcTxId);

    const { result } = await contract.viewState({ function: 'getName', id: owner });

    expect((result as any).name).toEqual('Evolve');
  });
});
