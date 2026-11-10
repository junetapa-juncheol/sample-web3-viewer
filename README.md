# 결 디지털 전시실

가상 디지털 전시에서 공개 블록 기록과 IPFS 이미지를 살펴보는 정적 웹 체험입니다.
Ethereum과 Bitcoin의 블록 정보를 읽고 각 값의 출처·시각을 표시합니다.
선택적으로 MetaMask의 주소와 네트워크 이름만 화면에서 확인합니다.

## 쓴 기술

| 기술 | 사용한 곳 | 화면 |
| --- | --- | --- |
| Ethereum JSON-RPC | [src/network.js](src/network.js) · 공개 RPC의 eth_blockNumber·eth_gasPrice | Ethereum 블록 번호·가스 가격 |
| Bitcoin 공개 API | [src/network.js](src/network.js) · mempool.space | 최신 블록 높이 |
| IPFS | [src/network.js](src/network.js), [public/artwork.jpg](public/artwork.jpg) | 공식 공개 CID 이미지·전체 CID·게이트웨이 링크 |
| MetaMask | [src/network.js](src/network.js), [src/main.js](src/main.js) | 지갑 연결·주소·네트워크 |
| 정적 표본과 캐시 | [public/snapshot.json](public/snapshot.json), [src/main.js](src/main.js) | 실시간/마지막 확인 표본·시각 |
| Vite | [vite.config.js](vite.config.js) | `/sample-web3-viewer/` 하위 경로 |

## 실행 방법

Node.js 24 이상에서 실행합니다.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

실행기가 출력하는 주소 뒤에 `/sample-web3-viewer/`를 붙입니다.
GitHub 웹에서 이 폴더의 내용을 저장소 루트에 올리고 Settings → Pages → Deploy from a branch → main /docs를 선택합니다.
`docs/`에 완성된 정적 파일이 포함되어 있으며 별도의 서버가 필요하지 않습니다. 로컬 실행은 HTTP 서버를 사용합니다.

## 보는 주소

https://junetapa-juncheol.github.io/sample-web3-viewer/

이 주소는 GitHub Pages를 설정한 뒤 열립니다.

## 공개 연결과 표본

- Ethereum: `https://ethereum-rpc.publicnode.com`에 블록 번호와 가스 가격 두 가지 읽기만 요청합니다. 가스 가격은 부동소수점 오차 없이 Wei에서 Gwei로 바꿉니다.
- Bitcoin: `https://mempool.space/api/blocks/tip/height`의 키 없는 API를 사용합니다.
- 네트워크별 오류·시간 초과 때 각각 마지막 확인 표본으로 돌아갑니다. 성공한 공개 수치만 브라우저의 `gyeol-public-blocks-v1` 캐시에 보관하며, 저장 공간이 차단돼도 동작합니다.
- 기본 표본은 2026-11-10에 Chromium 브라우저에서 실제 Ethereum 공개 RPC와 Bitcoin 공개 API를 호출해 받은 값입니다. 응답 URL과 확인 시각은 `public/snapshot.json`에 기록했습니다.
- IPFS 이미지는 [공식 검색 예제](https://docs.ipfs.tech/quickstart/retrieve/)의 CID `bafkreie7ohywtosou76tasm7j63yigtzxe7d5zqus4zu3j6oltvgtibeom`을 Filebase 공개 게이트웨이로 읽습니다. 실패하면 같은 CID의 로컬 사본을 표시합니다. 로컬 사본은 CID에 담긴 SHA-256과 일치합니다.
- 게이트웨이가 보내는 콘텐츠를 표시하는 방식이며 런타임에서 독립적인 CID 검증은 하지 않습니다.

## 지갑 동작

지갑 없이도 모든 전시·블록 정보를 볼 수 있습니다. 지갑 연결 버튼을 눌렀을 때만 MetaMask에 `eth_requestAccounts`, `eth_chainId`를 각 한 번 요청합니다.
주소와 네트워크는 메모리와 화면에만 표시하며 서버·로그·브라우저 저장 공간에 남기지 않습니다. 계정·체인 변경 이벤트를 반영합니다.
화면에서 지우기는 표시를 없애는 기능입니다. 확장 프로그램의 연결 허용 권한을 취소하는 동작은 아닙니다.
거래 기능이 없는 읽기 전용 데모입니다.

## 라이선스

직접 작성한 코드는 [MIT License](LICENSE), 저작권자는 junetapa입니다.
IPFS 예제 이미지의 원문·저작권·출처 조건은 [public/third-party.txt](public/third-party.txt)에 기록했습니다.
