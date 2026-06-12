# PICO DOT

Cloudflare Pages에서 호스팅하는 정적 픽셀 아트 변환 서비스입니다. 이미지 변환은 브라우저의
Canvas API로 처리되며 업로드한 사진은 서버로 전송되지 않습니다.

## 로컬 실행

VS Code에서 `index.html`을 열고 **Open with Live Server**를 실행합니다.

별도의 설치, 빌드 또는 개발 서버 명령은 필요하지 않습니다.

## Cloudflare Pages 배포

- Framework preset: `None`
- Build command: 비워두기
- Build output directory: `/`

## 배포 전 수정할 항목

1. `privacy.html`, `about.html`, `index.html`의 `hello@example.com`을 실제 문의 주소로 변경합니다.
2. AdSense 승인 후 `assets/js/config.js`에 발급받은 publisher ID와 광고 슬롯 ID를 입력합니다.
3. AdSense가 안내하는 내용으로 루트에 `ads.txt`를 추가합니다.
4. 실제 도메인이 정해지면 canonical URL, 사이트맵과 OG 이미지의 절대 URL을 추가합니다.
5. Google Search Console과 Bing Webmaster Tools에 사이트를 등록합니다.
