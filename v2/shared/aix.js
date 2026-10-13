/* =========================================================
   AIX v2 공통 파일 — 모든 화면이 이 파일 하나를 함께 씁니다.
   · 파이어베이스 연결 정보와 연결 방법 (버전 10.12.2 통일)
   · 다크 / 화이트 테마
   · 읽기 전용 잠금 (테스트 기간에 저장·삭제를 막음)

   쓰는 법: 화면 맨 위에 아래 순서로 넣습니다.
     <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
     <link rel="stylesheet" href="../shared/theme.css">   (껍데기는 ./shared/theme.css)
     <script src="../shared/aix.js"></script>
   ========================================================= */
(function () {
  "use strict";

  /* 테스트 기간 동안 true. 기존 화면과 똑같이 보이는지 확인한 뒤 false 로 바꿉니다. */
  var READ_ONLY = false;

  /* 연결 정보 — 기존 사이트와 같은 값, 같은 앱 이름(appName)을 써야
     기존 인트라넷의 로그인 상태가 그대로 이어집니다. */
  var PROJECTS = {
    notice: { label: "공지 체크 · 통합 계정", master: true,
      cfg: { apiKey: "AIzaSyCQix_uMdvMdGKvo3ZSe7KgIoD7HJEXp0g", authDomain: "noticecheck-80980.firebaseapp.com", projectId: "noticecheck-80980", storageBucket: "noticecheck-80980.firebasestorage.app", messagingSenderId: "251674052066", appId: "1:251674052066:web:9edd72d52728a1486425bb" } },
    student: { label: "수강생 관리 · 학사일정",
      cfg: { apiKey: "AIzaSyCb6Evq51skrbDw_cbz9_S9LsjcY1fy9hA", authDomain: "student-f3e8a.firebaseapp.com", projectId: "student-f3e8a", storageBucket: "student-f3e8a.firebasestorage.app" } },
    cash: { label: "견적서",
      cfg: { apiKey: "AIzaSyB8qZIVzINN5BGSNd6ojqshNC9RXh7jqKU", authDomain: "cash-eabc1.firebaseapp.com", projectId: "cash-eabc1", storageBucket: "cash-eabc1.firebasestorage.app", messagingSenderId: "8436628517", appId: "1:8436628517:web:3a072098e57c02397353cc" } },
    gov: { label: "국취 사전접수", appName: "admin",
      cfg: { apiKey: "AIzaSyBUCd3OW9wx8uRQrQ9jBMIVjzuZ47sjNv8", authDomain: "govermentscore.firebaseapp.com", projectId: "govermentscore", storageBucket: "govermentscore.firebasestorage.app", messagingSenderId: "808577453289", appId: "1:808577453289:web:8e6385fb947196ccc8f478" } },
    guide: { label: "수강생 안내",
      cfg: { apiKey: "AIzaSyDvYKTh4G2SFxw8LKgz1YaP3oR1mFbR8Kc", authDomain: "notice-3aef1.firebaseapp.com", projectId: "notice-3aef1", storageBucket: "notice-3aef1.firebasestorage.app", messagingSenderId: "39136833631", appId: "1:39136833631:web:e85baeeee4dd80f03bebea" } },
    home: { label: "3-1팀 퇴근보고", team: true,
      cfg: { apiKey: "AIzaSyCJ-VTabucn0OAyPmByzZAJa8y1VJdUgss", authDomain: "home-a4d02.firebaseapp.com", projectId: "home-a4d02", storageBucket: "home-a4d02.firebasestorage.app", messagingSenderId: "333497794164", appId: "1:333497794164:web:abf4791df6ef08a44a5b21" } },
    sales: { label: "3-1팀 상담 매출", team: true,
      cfg: { apiKey: "AIzaSyCQofo_Tp-5W5CdNWGD0tu1yuU62rE4pWY", authDomain: "complete-55019.firebaseapp.com", projectId: "complete-55019", storageBucket: "complete-55019.firebasestorage.app", messagingSenderId: "157946979859", appId: "1:157946979859:web:e0e6012454622defe441e6" } }
  };

  /* ---------- 읽기 전용 잠금 ---------- */
  var LOCK_MSG = "지금은 새 화면 점검 기간이라 저장이 꺼져 있습니다. 저장은 기존 화면에서 해 주세요.";
  function lockWrites() {
    if (!READ_ONLY || !window.firebase || !firebase.firestore) return;
    var fs = firebase.firestore;
    var deny = function () { var e = new Error(LOCK_MSG); e.code = "aix/read-only"; AIX.toast(LOCK_MSG); return Promise.reject(e); };
    ["set", "update", "delete"].forEach(function (m) { if (fs.DocumentReference) fs.DocumentReference.prototype[m] = deny; });
    if (fs.CollectionReference) fs.CollectionReference.prototype.add = deny;
    if (fs.WriteBatch) fs.WriteBatch.prototype.commit = deny;
    if (fs.Firestore) fs.Firestore.prototype.runTransaction = deny;
  }

  /* ---------- 연결 ---------- */
  function connect(key) {
    var p = PROJECTS[key];
    if (!p) throw new Error("알 수 없는 연결: " + key);
    var name = p.appName || "[DEFAULT]";
    var app = firebase.apps.filter(function (a) { return a.name === name && a.options.projectId === p.cfg.projectId; })[0];
    if (!app) {
      var clash = firebase.apps.filter(function (a) { return a.name === name; })[0];
      app = clash ? firebase.initializeApp(p.cfg, key) : (p.appName ? firebase.initializeApp(p.cfg, p.appName) : firebase.initializeApp(p.cfg));
    }
    return { app: app, auth: app.auth(), db: app.firestore() };
  }
  /* 로그인 상태가 복원될 때까지 기다렸다가 사용자(또는 null)를 돌려줍니다 */
  function ready(key) {
    var a = connect(key).auth;
    return new Promise(function (res) { var off = a.onAuthStateChanged(function (u) { off(); res(u); }); });
  }

  /* 여러 연결을 한 화면에서 함께 쓸 때(껍데기·홈)는 연결마다 보이지 않는 작은 창을 띄워
     각 창이 기존 화면과 똑같은 앱 이름으로 로그인합니다. 그래야 로그인 상태가
     기존 화면·새 화면 모두에 이어집니다. (기존 인트라넷과 같은 방식) */
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  var helpers = {};
  function helper(key) {
    if (helpers[key]) return helpers[key];
    var p = PROJECTS[key];
    helpers[key] = new Promise(function (res, rej) {
      var f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true"); f.tabIndex = -1;
      f.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
      f.srcdoc = '<!doctype html><meta charset="utf-8">' +
        '<script src="' + SDK + 'firebase-app-compat.js"><\/script>' +
        '<script src="' + SDK + 'firebase-auth-compat.js"><\/script>' +
        '<script src="' + SDK + 'firebase-firestore-compat.js"><\/script>';
      var timer = setTimeout(function () { rej(new Error("timeout")); }, 15000);
      f.onload = function () {
        try {
          var fb = f.contentWindow.firebase;
          var app = p.appName ? fb.initializeApp(p.cfg, p.appName) : fb.initializeApp(p.cfg);
          var auth = app.auth(), db = app.firestore();
          if (READ_ONLY) {
            var fs = fb.firestore, deny = function () { return Promise.reject(new Error(LOCK_MSG)); };
            ["set", "update", "delete"].forEach(function (m) { fs.DocumentReference.prototype[m] = deny; });
            fs.CollectionReference.prototype.add = deny; fs.WriteBatch.prototype.commit = deny;
          }
          var off = auth.onAuthStateChanged(function () { off(); clearTimeout(timer); res({ key: key, fb: fb, auth: auth, db: db }); });
        } catch (e) { clearTimeout(timer); rej(e); }
      };
      document.body.appendChild(f);
    });
    return helpers[key];
  }

  /* ---------- 테마 ---------- */
  var THEME_KEY = "aix-v2-theme";
  function getTheme() { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { return "dark"; } }
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "dark"); }
  function setTheme(t) { try { localStorage.setItem(THEME_KEY, t); } catch (e) {} applyTheme(t); }
  applyTheme(getTheme());
  window.addEventListener("storage", function (e) { if (e.key === THEME_KEY) applyTheme(e.newValue); });

  /* ---------- 작은 도구 ---------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(msg) {
    var t = document.getElementById("aix-toast");
    if (!t) { t = document.createElement("div"); t.id = "aix-toast"; t.className = "toast"; t.setAttribute("role", "status"); (document.body || document.documentElement).appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 2800);
  }
  function iso(d) { var p = function (n) { return String(n).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function won(n) { return (Number(n) || 0).toLocaleString("ko-KR"); }

  /* 껍데기 안에서 열렸는지, 로그인한 사람 정보 */
  var inFrame = window.parent && window.parent !== window;
  function profile() { try { return (inFrame && window.parent.AIX && window.parent.AIX.me) || window.AIX.me || null; } catch (e) { return window.AIX.me || null; } }

  window.AIX = {
    READ_ONLY: READ_ONLY, PROJECTS: PROJECTS, connect: connect, ready: ready, helper: helper,
    theme: getTheme, setTheme: setTheme, esc: esc, toast: toast, iso: iso, won: won,
    inFrame: inFrame, profile: profile, me: null
  };
  lockWrites();
})();
