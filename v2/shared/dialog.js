/* =========================================================
   AIX v2 알림창 — 화면들이 쓰던 브라우저 기본 알림(alert)을 새 디자인 창으로 바꿉니다.
   · 각 업무 화면 <head>에서 lock.js 바로 다음에 넣습니다.
   · "확인 · 취소"를 묻는 창(confirm)과 입력 창(prompt)은 화면 동작이 그 답을 기다려야 해서
     안전을 위해 지금은 기존 창 그대로 둡니다.
   ========================================================= */
(function () {
  "use strict";
  if (window.__aixDialog) return;
  window.__aixDialog = true;

  function dark() { try { return (localStorage.getItem("aix-v2-theme") || "dark") !== "light"; } catch (e) { return true; } }
  function colors() {
    return dark()
      ? { veil: "rgba(0,0,0,.5)", card: "#1E1F23", line: "#2C2E33", text: "#E4E5E8", sub: "#9A9CA4", acc: "#C2DD6A", on: "#1A1D12", warnBg: "#2D2418", warn: "#E3A86B" }
      : { veil: "rgba(20,20,10,.28)", card: "#FFFFFF", line: "#E3E3DC", text: "#1D1E21", sub: "#686A72", acc: "#4F6B10", on: "#FFFFFF", warnBg: "#FBF0E2", warn: "#9A5414" };
  }
  var queue = [], open = false;

  function show(msg) {
    queue.push(String(msg == null ? "" : msg));
    if (!open) next();
  }
  function next() {
    var msg = queue.shift();
    if (msg === undefined) { open = false; return; }
    open = true;
    var c = colors();
    var veil = document.createElement("div");
    veil.setAttribute("role", "alertdialog");
    veil.setAttribute("data-aix-ui", "");
    veil.setAttribute("aria-modal", "true");
    veil.style.cssText = "position:fixed;inset:0;z-index:2147483500;background:" + c.veil + ";display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Noto Sans KR',system-ui,sans-serif;opacity:1;filter:none";
    var card = document.createElement("div");
    card.style.cssText = "width:min(400px,100%);background:" + c.card + ";color:" + c.text + ";border:1px solid " + c.line + ";border-radius:22px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.35);box-sizing:border-box";
    var icon = document.createElement("div");
    icon.textContent = "!";
    icon.style.cssText = "width:38px;height:38px;border-radius:12px;background:" + c.warnBg + ";color:" + c.warn + ";display:flex;align-items:center;justify-content:center;font-weight:900;margin-bottom:14px";
    var body = document.createElement("div");
    body.textContent = msg;
    body.style.cssText = "font-size:15px;line-height:1.6;color:" + c.text + ";opacity:1;white-space:pre-line;word-break:keep-all;max-height:50vh;overflow:auto";
    var btn = document.createElement("button");
    btn.type = "button"; btn.textContent = "확인";
    btn.style.cssText = "margin-top:20px;width:100%;height:46px;border:0;border-radius:12px;background:" + c.acc + ";color:" + c.on + ";font:700 15px 'Noto Sans KR',system-ui,sans-serif;cursor:pointer;opacity:1;filter:none";
    function close() { document.removeEventListener("keydown", key, true); veil.remove(); next(); }
    function key(e) { if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); close(); } }
    btn.onclick = close;
    card.appendChild(icon); card.appendChild(body); card.appendChild(btn); veil.appendChild(card);
    (document.body || document.documentElement).appendChild(veil);
    document.addEventListener("keydown", key, true);
    setTimeout(function () { try { btn.focus(); } catch (e) {} }, 0);
  }
  window.alert = show;
})();
