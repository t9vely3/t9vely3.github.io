# AIX 인트라넷 v2 

주소: https://t9vely3.github.io/v2/

```
index.html          껍데기 (로그인 · 3부서/3-1팀 공간 · 다크/화이트 · 홈)
backup.html         전체 데이터 백업 (읽기만 함)
shared/aix.js       파이어베이스 연결 정보 · 테마 · 공통 도구
shared/theme.css    새 디자인 색·버튼·표 (색을 바꾸려면 여기 두 블록만)
shared/skinner.js   기존 화면에 새 색을 덧입히는 장치 + 화면별 설정(APP_SKIN)
shared/lock.js      저장 잠금 (점검 끝나면 ON = false 한 줄만 바꾸면 전부 풀림)
apps/kuk.html       국취 사전접수 (새로 만든 화면)
apps/*.html         기존 화면 복사본 (기능 코드는 원본 그대로, 맨 위 잠금 한 줄만 추가)
```

| 메뉴 | 파일 | 원본 |
|---|---|---|
| 수강생 | apps/students.html | 3-Divison/index.html (10/10 최신판) |
| 학사일정 | apps/schedule.html | apps/schedule.html |
| 견적서 | apps/quote.html | apps/quote.html |
| 공지 체크 | apps/notice.html | apps/notice-check.html |
| 바이럴 | apps/viral.html | apps/viral.html |
| 안내 편집 | apps/guide.html | apps/guide-admin.html |
| 퇴근보고 (3-1팀) | apps/report.html | team31/apps/report.html |
| 상담 매출 (3-1팀) | apps/sales.html | team31/apps/sales.html |
| COD 대장 (3-1팀 · 메뉴에서 뺌) | apps/cod.html | -COD-/index.html · 이제 상담 매출 › COD 칸에서 관리하고, 예전 기록은 "COD 대장 기록 가져오기"로 옮김 |

## 화면 하나를 고칠 때
apps/ 안의 그 파일만 고쳐 올리면 됩니다. 메뉴 이름·순서는 index.html 의 MENU 에서 바꿉니다.

사내문고 · 상담 자료실 · 상담 노트는 인트라넷과 따로 쓰는 사이트라 넣지 않았습니다 (각자 원래 주소 그대로).
