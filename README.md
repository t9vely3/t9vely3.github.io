# AIX 3부서 인트라넷

```
index.html              인트라넷 껍데기 (왼쪽 메뉴, 통합 로그인, 화면 테마, 인쇄)
apps/manage.html        수강생 관리파일
apps/schedule.html      수강생 대시보드 (학사일정)
apps/quote.html         견적서
apps/viral.html         바이럴 관리
apps/notice-check.html  공지사이트 체크 관리
apps/guide-admin.html   수강생 안내 관리
apps/kuk-admin.html     국취 사전접수 관리
```

3-1팀 퇴근보고·상담 매출 관리는 별도 사이트(team31)에 있습니다.

## 구동 원리
- `index.html`은 메뉴·로그인·테마만 담당하고, 업무 화면은 `apps/` 파일을 iframe으로 불러옵니다.
  화면 하나를 고칠 때는 그 파일만 바꿔 올리면 됩니다.
- 로그인은 가입 신청 → 관리자 승인(왼쪽 아래 팀원 관리) 구조이고, 승인된 사람이 로그인하면
  연결된 파이어베이스 프로젝트에 같은 계정이 자동 생성됩니다. 건너뛰고 들어가는 길은 없습니다.
- 로그인한 사람 이름이 견적서 담당·상담자, 수강생 관리파일 멘토 필터, 대시보드 멘토 탭,
  공지 체크 본인 이름, 바이럴 작성자로 자동 들어갑니다.
- 화면 테마는 네이비 / 모노. 업무 화면 파일의 색은 열릴 때 덮어 입히고, 인쇄·이미지 저장 때는 원래 색으로 돌아갑니다.
- Ctrl+P 또는 왼쪽 아래 인쇄 버튼 = 지금 보고 있는 화면만 인쇄.

## 연결된 파이어베이스
noticecheck-80980(기준 계정) · student-f3e8a · cash-eabc1 · govermentscore · notice-3aef1 · marketing-b46a6(로그인 없음)

각 프로젝트에서 이메일/비밀번호 로그인 사용 설정과 승인된 도메인(t9vely3.github.io)을 확인해야 합니다.

## 올릴 때
`index.html`과 `apps/`는 같은 위치에. 바꿔 올린 뒤 화면이 그대로면 Ctrl+Shift+R.
