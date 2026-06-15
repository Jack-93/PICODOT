# PICO DOT

사진의 색감과 특징을 도트 스타일 픽셀 아트로 변환하는 정적 웹 서비스입니다.

- 현재 버전: `v1.3` (2026-06-15)
- 서비스: [https://picodot.net](https://picodot.net)
- 저장소: [Jack-93/PICODOT](https://github.com/Jack-93/PICODOT)
- 호스팅: Cloudflare Pages
- 기술 구성: HTML, CSS, Vanilla JavaScript, Canvas API

## 주요 기능

- JPG, PNG, WEBP 이미지 선택 및 드래그 앤 드롭
- 도트 크기 조절
- 대표 색상 수 2색~64색 조절
- 단조로운 색감부터 다양한 색감까지 조절
- 변환 결과 실시간 미리보기
- 고해상도 PNG 다운로드
- 데스크톱·모바일 반응형 UI
- 선택 파일명·용량·해상도 안내
- 가로·세로 사진의 긴 변 기준 최대 1200px PNG 출력
- 원본 사진과 도트 결과 전환 비교
- 레트로·균형·디테일 빠른 프리셋
- 마지막 설정을 브라우저에 자동 저장
- 원본 기반·PICO·게임보이·흑백·파스텔 색상 팔레트
- 디더링 켜기·끄기
- 긴 변 기준 600px·1200px·2400px PNG 다운로드
- 얼굴·귀·눈·표정·무늬를 조합하는 픽셀 캐릭터 스튜디오
- 캐릭터 색상 설정, 랜덤 생성과 1200px PNG 저장
- 개인정보처리방침, 서비스 소개, 활용 가이드, 업데이트 안내 제공

## 개인정보 보호

사용자가 선택한 이미지는 브라우저의 Canvas API로 현재 기기 안에서만 처리됩니다.

- 원본 사진을 서버로 업로드하지 않습니다.
- 원본 및 변환 결과를 서버에 저장하지 않습니다.
- 회원가입이나 개인정보 입력 없이 사용할 수 있습니다.
- 페이지를 닫으면 브라우저 메모리의 이미지 데이터가 사라집니다.

자세한 내용은 [개인정보처리방침](https://picodot.net/privacy)에서 확인할 수 있습니다.

## 프로젝트 구조

```text
PICODOT/
├── index.html          # 랜딩 페이지와 픽셀 아트 변환기
├── studio.html         # 픽셀 캐릭터 조립 스튜디오
├── about.html          # 서비스 소개
├── privacy.html        # 개인정보처리방침
├── updates.html        # 서비스 업데이트 내역
├── ads.txt             # Google AdSense 판매자 정보
├── robots.txt          # 검색로봇 접근 정책
├── sitemap.xml         # 검색엔진 사이트맵
├── _headers            # Cloudflare Pages 보안·캐시 헤더
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   │   ├── examples/   # 사진 종류별 예시 이미지
│   │   ├── favicon.svg
│   │   └── og-preview.svg
│   └── js/
│       ├── app.js      # 이미지 변환 및 UI 동작
│       ├── config.js   # AdSense 설정
│       └── studio.js   # 캐릭터 조립 및 PNG 저장
├── AGENTS.md           # 코딩 에이전트 작업 지침
└── README.md
```

검색엔진 소유권 확인용 HTML 파일도 저장소 루트에 포함되어 있습니다.

## 예시 이미지

- 인물 예시는 기존 캐릭터를 복제하지 않은 오리지널 생성 이미지입니다.
- 고양이 사진: [The Lucky Neko / Unsplash](https://unsplash.com/photos/orange-tabby-cat-AH7JYgyAlqA)
- 풍경 사진: [Lesly Derksen / Unsplash](https://unsplash.com/photos/a-mountain-range-with-a-lake-in-the-foreground-VFQZCjv935A)
- Unsplash 사진은 [Unsplash License](https://unsplash.com/license)에 따라 사용합니다.

## 로컬 실행

빌드나 패키지 설치는 필요하지 않습니다. 정적 파일 서버로 저장소 루트를 실행합니다.

### VS Code

1. `index.html`을 엽니다.
2. Live Server 확장의 **Open with Live Server**를 실행합니다.

### Visual Studio 2022

1. **파일 → 열기 → 폴더**에서 저장소를 엽니다.
2. 터미널에서 정적 서버를 실행합니다.
3. 브라우저에서 `http://localhost:5500`에 접속합니다.

Python이 설치되어 있다면:

```powershell
python -m http.server 5500
```

단순 `file://` 열기보다 로컬 HTTP 서버 사용을 권장합니다.

## Cloudflare Pages 배포

GitHub의 `master` 브랜치와 Cloudflare Pages가 연결되어 있습니다. `master`에 푸시하면 자동으로 새 배포가 시작됩니다.

```text
Framework preset: None
Build command: 없음
Build output directory: 저장소 루트
Production branch: master
```

대표 도메인은 `https://picodot.net`입니다.

- `www.picodot.net`은 대표 도메인으로 영구 리디렉션됩니다.
- Cloudflare 기본 배포 주소도 대표 도메인으로 영구 리디렉션됩니다.
- HTTPS와 보안 응답 헤더가 적용되어 있습니다.

## 검색엔진 설정

다음 항목이 적용되어 있습니다.

- 페이지별 canonical URL
- Open Graph 및 Twitter 공유 메타데이터
- Schema.org `WebApplication` 구조화 데이터
- [sitemap.xml](https://picodot.net/sitemap.xml)
- [robots.txt](https://picodot.net/robots.txt)
- Google Search Console 소유권 확인 및 색인 요청
- 네이버 서치어드바이저 소유권 확인, 사이트맵 제출 및 수집 요청

검색엔진의 실제 색인 반영에는 며칠에서 수 주가 걸릴 수 있습니다.

## Google AdSense

- 게시자 ID: `pub-3602269905958211`
- [ads.txt](https://picodot.net/ads.txt) 적용 완료
- Google 인증 CMP 설정 완료
- 사이트 검토 요청 완료

승인 전에는 빈 광고 영역이 화면에 표시되지 않습니다. 승인 후 광고 단위를 만든 다음
`assets/js/config.js`에 클라이언트 ID와 슬롯 ID를 입력하면 해당 광고 영역이 활성화됩니다.

```js
window.PICO_DOT_CONFIG = {
  adsenseClient: "ca-pub-3602269905958211",
  adSlots: {
    homeTop: "광고 슬롯 ID",
    homeMid: "광고 슬롯 ID",
    homeBottom: "광고 슬롯 ID"
  }
};
```

## 변경 후 확인 사항

배포 전 다음 항목을 확인합니다.

1. 이미지 선택, 드래그 앤 드롭 및 초기화
2. 도트 크기·색상 수·색감 조절
3. PNG 다운로드
4. 데스크톱과 모바일 레이아웃
5. 브라우저 콘솔 오류
6. 내부 링크와 정책 페이지
7. canonical, 사이트맵 및 robots.txt
8. `ads.txt`와 광고 설정

## 운영 주의사항

- `ads.txt`와 검색엔진 소유권 확인 파일을 임의로 삭제하지 않습니다.
- canonical URL과 사이트맵에는 대표 도메인만 사용합니다.
- 업로드 이미지를 서버로 전송하는 기능을 추가하면 개인정보처리방침을 먼저 갱신합니다.
- API 토큰, 비밀번호, 인증 코드, Cloudflare 키와 같은 비밀정보를 커밋하지 않습니다.
- `.env`, `.vs` 등 로컬 개발 파일은 저장소에 포함하지 않습니다.

## 문의

- 개발자: 오참새
- 이메일: [worl5555555@gmail.com](mailto:worl5555555@gmail.com)

오늘도 행복하세요!
