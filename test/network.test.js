import test from 'node:test';
import assert from 'node:assert/strict';
import { connectWallet, formatGwei, networkName, readRpc } from '../src/network.js';

test('wallet connection requests only accounts and chain and never saves them', async () => {
  const calls = [];
  const address = '0x' + '1'.repeat(40);
  const wallet = await connectWallet({ isMetaMask: true, request: async ({ method }) => { calls.push(method); return method === 'eth_requestAccounts' ? [address] : '0x1'; } });
  assert.deepEqual(calls, ['eth_requestAccounts', 'eth_chainId']);
  assert.equal(wallet.network, 'Ethereum Mainnet');
  assert.equal(wallet.address, address);
});

test('missing wallets and rejected connections return understandable states', async () => {
  await assert.rejects(connectWallet(null), /MetaMask/);
  await assert.rejects(connectWallet({ isMetaMask: true, request: async () => { throw Object.assign(new Error('cancel'), { code: 4001 }); } }), { code: 4001 });
});

test('RPC methods are limited to the two public reads', async () => {
  await assert.rejects(readRpc('eth_sendTransaction'), /읽기/);
});

test('gas values keep exact integer precision and chains have clear names', () => {
  assert.equal(formatGwei('1234567890'), '1.23456789');
  assert.equal(formatGwei('1'), '0.000000001');
  assert.equal(networkName('0xaa36a7'), 'Sepolia');
  assert.equal(networkName('0x123'), '네트워크 0x123');
});
