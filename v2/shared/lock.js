/* =========================================================
   AIX v2 저장 잠금 — 점검 기간에 새 주소의 화면이 데이터를 바꾸지 못하게 막습니다.
   · 각 업무 화면 <head> 맨 처음에 넣습니다 (파이어베이스보다 먼저).
   · 읽기(목록 보기, 검색, 내려받기)는 그대로 됩니다.
   · 막는 것: 저장·수정·삭제, 파일 올리기, 계정 만들기·바꾸기
   · 점검이 끝나면 ON 을 false 로 바꾸면 모든 화면이 한 번에 풀립니다.
   ========================================================= */
(function () {
  "use strict";
  var ON = false;
  if (!ON || window.__aixLock) return;
  window.__aixLock = true;
  var MSG = "점검 기간이라 새 주소에서는 저장되지 않습니다. 저장은 기존 인트라넷에서 해 주세요.";

  /* 1) 네트워크에서 쓰기 요청만 골라 막기 (구형·신형 파이어베이스 모두 해당) */
  function isWrite(method, url) {
    url = String(url || ""); method = String(method || "GET").toUpperCase();
    if (/google\.firestore\.v1\.Firestore\/Write\//.test(url)) return true;            // 저장 통로
    if (/firestore\.googleapis\.com\/.*:(commit|batchWrite|beginTransaction)/.test(url)) return true;
    if (/firestore\.googleapis\.com\/v1\/projects\/.*\/documents/.test(url) && /^(POST|PATCH|DELETE)$/.test(method)) return true;
    if (/firebasestorage\.googleapis\.com\//.test(url) && /^(POST|PUT|PATCH|DELETE)$/.test(method)) return true;   // 파일 올리기·지우기
    if (/identitytoolkit\.googleapis\.com\/v1\/accounts:(signUp|update|delete)/.test(url)) return true;           // 계정 만들기·바꾸기
    return false;
  }
  var XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__aixBlock = isWrite(m, u); return XO.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    if (this.__aixBlock) { var x = this; notify(); setTimeout(function () { try { x.abort(); } catch (e) {} }, 0); return; }
    return XS.apply(this, arguments);
  };
  if (window.fetch) {
    var F = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var method = (init && init.method) || (input && input.method) || "GET";
      if (isWrite(method, url)) { notify(); return Promise.reject(new TypeError(MSG)); }
      return F.apply(this, arguments);
    };
  }
  if (navigator.sendBeacon) {
    var B = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (u, d) { if (isWrite("POST", u)) { notify(); return false; } return B(u, d); };
  }

  /* 2) 구형 파이어베이스는 저장 함수 자체를 바로 실패시켜, 화면이 '저장 안 됨'을 즉시 알게 함 */
  function patchCompat() {
    var fb = window.firebase; if (!fb || !fb.firestore || !fb.firestore.DocumentReference) return false;
    var fs = fb.firestore;
    var deny = function () { notify(); var e = new Error(MSG); e.code = "aix/read-only"; return Promise.reject(e); };
    ["set", "update", "delete"].forEach(function (m) { fs.DocumentReference.prototype[m] = deny; });
    if (fs.CollectionReference) fs.CollectionReference.prototype.add = deny;
    if (fs.WriteBatch) fs.WriteBatch.prototype.commit = deny;
    if (fs.Firestore) fs.Firestore.prototype.runTransaction = deny;
    if (fb.storage && fb.storage.Reference) {
      ["put", "putString", "delete"].forEach(function (m) { if (fb.storage.Reference.prototype[m]) fb.storage.Reference.prototype[m] = function () { notify(); throw new Error(MSG); }; });
    }
    return true;
  }
  var tries = 0, t = setInterval(function () { if (patchCompat() || ++tries > 80) clearInterval(t); }, 100);
  document.addEventListener("DOMContentLoaded", patchCompat);

  /* 3) 안내 띠 — 화면 왼쪽 아래에 작게 늘 보이고, 저장을 시도하면 잠깐 강조 */
  var pill = null, hot = null;
  function ensurePill() {
    if (pill || !document.body) return pill;
    pill = document.createElement("div");
    pill.setAttribute("role", "status");
    pill.style.cssText = "position:fixed;left:14px;bottom:14px;z-index:2147483600;max-width:calc(100% - 28px);padding:8px 14px;border-radius:999px;" +
      "font:700 12px/1.5 'Noto Sans KR',system-ui,sans-serif;background:#23271B;color:#C2DD6A;border:1px solid #3A4128;box-shadow:0 6px 18px rgba(0,0,0,.25);transition:all .2s;pointer-events:none";
    pill.textContent = "점검 기간 · 이 화면은 읽기 전용";
    document.body.appendChild(pill);
    return pill;
  }
  function notify() {
    var p = ensurePill(); if (!p) return;
    p.textContent = MSG; p.style.background = "#C2DD6A"; p.style.color = "#1A1D12";
    clearTimeout(hot); hot = setTimeout(function () { p.textContent = "점검 기간 · 이 화면은 읽기 전용"; p.style.background = "#23271B"; p.style.color = "#C2DD6A"; }, 4000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensurePill); else ensurePill();
  window.AIX_LOCK = { ON: ON, MSG: MSG, isWrite: isWrite };
})();
