export const rpcUrl = 'https://ethereum-rpc.publicnode.com';
export const bitcoinUrl = 'https://mempool.space/api/blocks/tip/height';
export const artworkCid = 'bafkreie7ohywtosou76tasm7j63yigtzxe7d5zqus4zu3j6oltvgtibeom';
export const artworkUrl = `https://ipfs.filebase.io/ipfs/${artworkCid}`;
export const rpcMethods = new Set(['eth_blockNumber', 'eth_gasPrice']);

export async function readRpc(method) {
  if (!rpcMethods.has(method)) throw new Error('읽기 메서드만 사용할 수 있습니다.');
  const response = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: [] }), signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('RPC 연결 오류');
  const data = await response.json();
  if (data.error || !/^0x[0-9a-f]+$/i.test(data.result)) throw new Error('RPC 응답 형식 오류');
  return BigInt(data.result).toString();
}

export async function readBitcoin() {
  const response = await fetch(bitcoinUrl, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Bitcoin 연결 오류');
  const height = (await response.text()).trim();
  if (!/^\d+$/.test(height)) throw new Error('블록 높이 형식 오류');
  return height;
}

export function formatGwei(wei) {
  const value = BigInt(wei);
  const whole = value / 1000000000n;
  const fraction = (value % 1000000000n).toString().padStart(9, '0').replace(/0+$/, '');
  return `${whole}${fraction ? `.${fraction}` : ''}`;
}

export function networkName(chainId) {
  return ({ '0x1': 'Ethereum Mainnet', '0xaa36a7': 'Sepolia', '0x89': 'Polygon', '0xa': 'Optimism', '0xa4b1': 'Arbitrum One', '0x2105': 'Base' })[chainId.toLowerCase()] || `네트워크 ${chainId}`;
}

export async function connectWallet(provider) {
  if (!provider?.isMetaMask) throw new Error('MetaMask 확장 프로그램이 있는 브라우저에서 연결할 수 있습니다.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!Array.isArray(accounts) || !/^0x[0-9a-f]{40}$/i.test(accounts[0] || '')) throw new Error('선택된 지갑 주소가 없습니다.');
  const chainId = await provider.request({ method: 'eth_chainId' });
  if (typeof chainId !== 'string' || !/^0x[0-9a-f]+$/i.test(chainId)) throw new Error('네트워크 정보를 읽지 못했습니다.');
  return { address: accounts[0], chainId, network: networkName(chainId) };
}
