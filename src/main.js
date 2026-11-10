import './style.css';
import './theme.css';
import { artworkCid, artworkUrl, bitcoinUrl, connectWallet, formatGwei, networkName, readBitcoin, readRpc, rpcUrl } from './network.js';

document.querySelector('#app').innerHTML = `
<div class="shell"><header><a href="./" class="brand"><span class="brand-mark" aria-hidden="true">g</span>결 디지털 전시실</a><nav aria-label="주요 메뉴"><a href="#gallery">현재 전시</a><a href="#network" class="wide">네트워크 노트 ↗</a></nav></header>
<main id="main"><section class="hero"><div><span class="eyebrow">GYEOL · DIGITAL GALLERY / EXHIBITION 01</span><h1>작품 너머,<br>기록의 결을 읽다.</h1><p class="lede">공개 블록의 현재와 콘텐츠의 주소를 천천히 살펴보는 디지털 전시.</p></div><span class="badge"><span class="dot"></span>읽기 전용 데모 · 거래 기능 없음</span></section>
<div class="viewer-grid" id="gallery"><section class="art-panel"><div class="art-frame"><img id="artwork" src="./artwork.jpg" alt="우주 배경 위 Welcome to IPFS 문구가 담긴 IPFS 공식 공개 예제" width="1200" height="800"/><span class="art-label">OPEN COLLECTION / 001</span></div><div class="art-caption"><div><span class="section-label">CONTENTS, ADDRESSED</span><h2>주소가 된 이미지</h2><p class="muted">IPFS 공식 문서의 공개 예제 · Welcome to IPFS</p></div><span class="pill">IPFS</span></div><p class="tiny" id="art-source" role="status">저장된 공개 예제 · 게이트웨이 확인 중</p><div class="cid-box"><span class="section-label">CONTENT IDENTIFIER</span><p class="mono">${artworkCid}</p><a href="${artworkUrl}" target="_blank" rel="noreferrer">공개 게이트웨이에서 보기 ↗</a></div></section>
<div class="stack"><section class="panel" id="network"><div class="section-head"><div><span class="section-label">LIVE NETWORK NOTES</span><h2>지금의 블록 기록</h2></div><button id="refresh" aria-label="블록 기록 새로고침">새로고침 ↻</button></div><div class="block-stat"><div><span class="coin eth" aria-hidden="true">Ξ</span><strong>Ethereum</strong><span class="tiny">최신 블록</span></div><p id="eth-block">—</p><span class="status" id="eth-source">공개 RPC 확인 중</span></div><div class="gas-row"><span>가스 가격</span><strong><span id="gas">—</span> <small>Gwei</small></strong></div><p class="tiny" id="gas-source">공개 RPC 확인 중</p><div class="block-stat bitcoin"><div><span class="coin btc" aria-hidden="true">₿</span><strong>Bitcoin</strong><span class="tiny">최신 블록 높이</span></div><p id="btc-block">—</p><span class="status" id="btc-source">공개 API 확인 중</span></div><div class="note space-top">연결이 어려우면 마지막 확인 표본을 표시합니다. 각 값 아래에서 출처와 확인 시각을 볼 수 있습니다.</div></section>
<section class="panel"><div class="section-head"><div><span class="section-label">OPTIONAL / VIEW YOUR WALLET</span><h2>내 지갑의 이름표</h2></div><span class="wallet-icon" aria-hidden="true">▣</span></div><p class="muted">MetaMask의 주소와 네트워크 이름만 확인합니다.</p><button class="primary" id="connect">지갑 연결 ↗</button><div id="wallet" hidden><dl><dt>주소</dt><dd class="mono" id="wallet-address"></dd><dt>네트워크</dt><dd id="wallet-network"></dd></dl><button id="forget">화면에서 지우기</button></div><p class="status" id="wallet-status" role="status">지갑 없이도 전시와 블록 기록을 볼 수 있습니다.</p></section></div></div>
<section class="source-strip" id="sources"><span class="section-label">PUBLIC SOURCES</span><a href="https://ethereum.org/developers/docs/apis/json-rpc/" target="_blank" rel="noreferrer">Ethereum JSON-RPC ↗</a><a href="https://mempool.space/docs/api/rest" target="_blank" rel="noreferrer">mempool.space ↗</a><a href="https://docs.ipfs.tech/quickstart/retrieve/" target="_blank" rel="noreferrer">IPFS 예제 출처 ↗</a></section>
</main><footer><span>결 디지털 전시실 · 가상 전시 체험</span><span>읽기 전용 데모 · 거래 기능 없음 · <a href="./license.txt">MIT License</a></span></footer></div>`;

const $ = (id) => document.getElementById(id);
const number = (value) => BigInt(value).toLocaleString('ko-KR');
const cacheKey = 'gyeol-public-blocks-v1';
let snapshot = {};
let provider;
let connected = false;

function readCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(cacheKey));
    for (const key of ['block', 'gas', 'bitcoin']) {
      if (cache?.[key] && /^\d+$/.test(cache[key].value) && Number.isFinite(Date.parse(cache[key].checkedAt))) snapshot[key] = cache[key];
    }
  } catch { /* 브라우저 저장 공간 없이도 기본 표본 사용 */ }
}

function showValue(key, entry, mode) {
  if (!entry || !/^\d+$/.test(entry.value)) return;
  const ids = { block: ['eth-block', 'eth-source'], gas: ['gas', 'gas-source'], bitcoin: ['btc-block', 'btc-source'] };
  const [valueId, sourceId] = ids[key];
  $(valueId).textContent = key === 'gas' ? formatGwei(entry.value) : number(entry.value);
  $(sourceId).textContent = `${mode}${entry.note ? ` (${entry.note})` : ''} · ${new Date(entry.checkedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false })} KST`;
}

async function updateValue(key, task) {
  try {
    const value = await task();
    snapshot[key] = { value, checkedAt: new Date().toISOString(), source: key === 'bitcoin' ? bitcoinUrl : rpcUrl };
    showValue(key, snapshot[key], '실시간 공개 조회');
  } catch {
    showValue(key, snapshot[key], '마지막 확인 표본');
  }
}

async function refresh() {
  $('refresh').disabled = true;
  await Promise.allSettled([updateValue('block', () => readRpc('eth_blockNumber')), updateValue('gas', () => readRpc('eth_gasPrice')), updateValue('bitcoin', readBitcoin)]);
  try { localStorage.setItem(cacheKey, JSON.stringify(snapshot)); } catch { /* 저장 불가 시 메모리에서 유지 */ }
  $('refresh').disabled = false;
}

async function initBlocks() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}snapshot.json`);
    snapshot = await response.json();
  } catch { $('eth-source').textContent = '표본을 불러오지 못했습니다. 새로고침해 주세요.'; }
  readCache();
  for (const key of ['block', 'gas', 'bitcoin']) showValue(key, snapshot[key], '마지막 확인 표본');
  await refresh();
}

async function loadArtwork() {
  let url;
  try {
    const response = await fetch(artworkUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok || !response.headers.get('Content-Type')?.startsWith('image/')) throw new Error('게이트웨이 연결 오류');
    url = URL.createObjectURL(await response.blob());
    const image = new Image();
    image.src = url;
    await image.decode();
    $('artwork').src = url;
    $('art-source').textContent = '공개 IPFS 게이트웨이에서 불러옴 · CID로 지정한 공식 예제';
  } catch {
    if (url) URL.revokeObjectURL(url);
    $('art-source').textContent = '저장된 동일 CID 이미지 · 게이트웨이 연결 시 갱신';
  }
}

function forgetWallet(message = '지갑 정보를 화면에서 지웠습니다.') {
  connected = false;
  $('wallet').hidden = true;
  $('wallet-address').textContent = '';
  $('wallet-network').textContent = '';
  $('connect').hidden = false;
  $('wallet-status').textContent = message;
}

function listenWallet() {
  if (!provider?.on) return;
  provider.on('accountsChanged', (accounts) => {
    if (!connected) return;
    if (!accounts?.length) { forgetWallet('지갑 연결이 해제되었습니다.'); return; }
    $('wallet-address').textContent = accounts[0];
  });
  provider.on('chainChanged', (chainId) => { if (connected) $('wallet-network').textContent = networkName(chainId); });
  provider.on('disconnect', () => forgetWallet('지갑 연결이 해제되었습니다.'));
}

$('connect').addEventListener('click', async () => {
  $('connect').disabled = true;
  try {
    if (!provider) {
      const injected = globalThis.ethereum;
      provider = injected?.providers?.find((candidate) => candidate.isMetaMask) || (injected?.isMetaMask ? injected : null);
      listenWallet();
    }
    const wallet = await connectWallet(provider);
    connected = true;
    $('wallet-address').textContent = wallet.address;
    $('wallet-network').textContent = wallet.network;
    $('wallet').hidden = false;
    $('connect').hidden = true;
    $('wallet-status').textContent = '주소와 네트워크를 표시했습니다. 정보는 저장하지 않습니다.';
  } catch (error) {
    $('wallet-status').textContent = error.code === 4001 ? '연결 요청을 취소했습니다. 전시는 계속 볼 수 있습니다.' : error.code === -32002 ? '지갑에서 진행 중인 연결 요청을 확인해 주세요.' : error.message;
  } finally { $('connect').disabled = false; }
});
$('forget').addEventListener('click', () => forgetWallet());
$('refresh').addEventListener('click', refresh);
void initBlocks();
void loadArtwork();
