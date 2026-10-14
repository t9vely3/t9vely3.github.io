/* =========================================================
   AIX v2 스키너 — 기존 업무 화면의 색·글꼴을 새 디자인으로 바꿔 입힙니다.
   (기존 인트라넷의 스키너를 옮겨 와 새 색을 넣은 것)
   · 화면의 코드는 건드리지 않고, 열린 화면의 스타일 값만 바꿉니다.
   · 인쇄·이미지 저장 때는 원래 색으로 돌아갑니다.
   · 쓰는 곳: v2/index.html (껍데기)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 화면별 원래 성격 ----------
     native: 원래 밝은(light)/어두운(dark) 화면
     brand : 원래 대표색의 색상각 (이 색은 새 대표색으로 바뀜)
     attr  : 화면 자체 테마 스위치를 원래 상태로 고정
     drop  : 지워도 되는 화면 자체 다크 규칙
     keep / keepEl : 바꾸지 않을 부분 (견적서 종이 등)
     css   : 화면 안에서 숨길 것 (자체 로그아웃·테마 버튼 등) */
  var APP_SKIN = {
    students: { native: "light", brand: [239, 244, 262, 270], attr: ["data-theme", "light"], drop: /data-theme=["']?dark/,
      css: ".theme-toggle,#themeToggle,#themeDarkBtn,#themeLightBtn,#mmLogout{display:none!important}" },
    schedule: { native: "dark", brand: [221], attr: ["data-mode", "dark"], drop: /data-mode=["']?light/,
      css: ".themebtn{display:none!important}" +
        /* 휴대폰: 시간표는 옆으로 밀어서 보기, 위쪽 버튼은 줄바꿈 */
        "@media(max-width:700px){.work>*:not(.rail):not(.stulist){width:100%;overflow-x:auto}.grid{min-width:620px}header,.topbar,.top{flex-wrap:wrap!important;gap:6px!important}}" },
    quote: { native: "light", brand: [217], keep: /\.quotation|\.q-|\.x-btn/, keepEl: ".quotation",
      css: "button[onclick*='logout']{display:none!important}" +
        /* 휴대폰: 입력칸은 한 줄씩, 견적서 종이는 여백을 줄이고 표는 옆으로 밀어서 보기 */
        "@media(max-width:640px){.row2,.addon-row{grid-template-columns:1fr!important}.quotation{padding:26px 18px!important}.quotation table{display:block;overflow-x:auto}.q-info{grid-template-columns:1fr!important;gap:10px!important}input,select,textarea{font-size:16px!important}}" },
    notice: { native: "light", brand: [228], keep: /\.lb\b|\.lb-/, keepEl: "#lb", attr: ["data-theme", "light"], drop: /data-theme=["']?dark/,
      css: "#themeBtn,#logoutBtn{display:none!important}" },
    viral: { native: "dark", brand: [258, 262],
      css: ".login-wrap{background:var(--bg)!important}.logout-btn{display:none!important}" },
    guide: { native: "light", brand: [213], css: ".sidebar-footer-link{display:none!important}" },
    /* 퇴근보고 상단 큰 카드: 원래 남색 그라데이션 + 흰 글자 구조 → 색만 짙은 올리브로 바꾸고 흰 글자는 유지 */
    report: { native: "light", brand: [239, 215], accVars: ["--ink"], keep: /\.dash-hero|\.hero-|\.rail|\.nav button|\.eb\b|\.cnt\b|\.lgb\b/,
      css: function (pal) {
        return "#btnOut{display:none!important}" +
          ".rail{background:" + (pal.dark ? "#1C1D21" : "#232B0E") + "!important;border-right:1px solid " + (pal.dark ? "#2C2E33" : "transparent") + "}" +
          ".rail::before{background:#C2DD6A!important;opacity:.08!important}" +
          ".nav button.on{background:rgba(194,221,106,.14)!important;color:#fff!important}" +
          ".nav button.on i{background:#C2DD6A!important;color:#1A1D12!important;box-shadow:none!important}" +
          ".dash-hero{background:linear-gradient(128deg," + (pal.dark ? "#1C2014 0%,#262D18 52%,#36421F 100%" : "#2F400A 0%,#3E550B 52%,#5F7E1C 100%") + ")!important;box-shadow:none!important}" +
          ".dash-hero::before{border-color:rgba(194,221,106,.10)!important}.dash-hero::after{background:#C2DD6A!important;opacity:.12!important}" +
          ".hero-kicker,.hero-copy h2 em{color:#C2DD6A!important}" +
          ".hero-copy .btn{background:#C2DD6A!important;border-color:#C2DD6A!important;color:#1A1D12!important}" +
          /* 보고문 미리보기 머리줄 버튼: 진한 바탕 위 흰 버튼에 흰 글자가 되어 안 보이던 것 */
          ".write-preview .hd .btn{background:" + (pal.dark ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.14)") + "!important;border-color:" + (pal.dark ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.28)") + "!important;color:" + (pal.dark ? "#1A1D12" : "#fff") + "!important}";
      } },
    sales: { native: "light", brand: [], accVars: ["--navy", "--navy-2"], css: "#userChip{display:none!important}" },
    cod: { native: "light", brand: [218], attr: ["data-theme", "light"], drop: /data-theme=["']?dark|:not\(\[data-theme=["']?light/,
      css: "#logout{display:none!important}" }
  };

  var h2r = function (h) { h = h.replace("#", ""); if (h.length < 6) h = h.split("").map(function (c) { return c + c; }).join(""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  var stops = function (o) { return Object.keys(o).map(function (k) { return [parseFloat(k), h2r(o[k])]; }).sort(function (a, b) { return a[0] - b[0]; }); };

  /* ---------- 새 디자인 색 두 벌 ----------
     light : 원래 밝은 화면의 색(밝기 0~1)을 옮길 자리
     darkN : 원래 어두운 화면의 색을 옮길 자리
     acc   : 대표색, accSoft : 옅은 대표색, onAcc : 대표색 위 글자색 */
  var PALETTE = {
    dark: {
      dark: true, sMax: .34, tintBase: "#1E1F23",
      light: stops({ "0": "#F2F3F5", ".15": "#E4E5E8", ".3": "#CDCFD4", ".45": "#B4B6BD", ".62": "#9A9CA4", ".75": "#7A7C84", ".86": "#55575E", ".92": "#3A3D44", ".96": "#2C2E33", ".985": "#1E1F23", "1": "#1C1D21" }),
      darkN: stops({ "0": "#141518", ".065": "#16171A", ".09": "#1A1B1F", ".12": "#1E1F23", ".14": "#222327", ".17": "#27292E", ".2": "#2C2E33", ".26": "#383A40", ".35": "#5A5C63", ".5": "#8A8C94", ".65": "#ACAEB5", ".8": "#D2D3D7", "1": "#ECEDEF" }),
      solid: stops({ "0": "#2A2C31", ".3": "#33363C" }),
      acc: h2r("#C2DD6A"), accSoft: h2r("#2A2F1E"), onAcc: "#1A1D12"
    },
    light: {
      dark: false, sMax: .40, tintBase: "#FFFFFF",
      light: stops({ "0": "#1D1E21", ".15": "#2A2B2F", ".3": "#45474D", ".45": "#5E6068", ".62": "#80828A", ".75": "#A6A8AE", ".86": "#D3D3CC", ".92": "#E3E3DC", ".96": "#EDEDE7", ".985": "#F4F4EF", "1": "#FFFFFF" }),
      darkN: stops({ "0": "#F1F1EC", ".065": "#F6F6F2", ".09": "#FFFFFF", ".12": "#F7F7F3", ".14": "#F0F0EB", ".17": "#EAEAE4", ".2": "#E3E3DC", ".26": "#D6D6CE", ".35": "#8E9097", ".5": "#686A72", ".65": "#45474D", ".8": "#2A2B2F", "1": "#1D1E21" }),
      solid: null,
      acc: h2r("#4F6B10"), accSoft: h2r("#EEF4D6"), onAcc: "#FFFFFF"
    }
  };
  var FONT = "'Noto Sans KR', system-ui, -apple-system, 'Apple SD Gothic Neo', sans-serif";
  var FONT_CSS = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap";

  var COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^()]*\)|hsla?\([^()]*\)|\b(?:white|black)\b(?!-)/gi;
  var COLOR_TEST = new RegExp(COLOR_RE.source, "i");
  var COLOR_PROP = /color|background|border|outline|shadow|fill|stroke|caret|decoration|column-rule|^--/;

  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    if (!s) return [l * 255, l * 255, l * 255];
    var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    var f = function (t) { t = (t + 1) % 1; return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p); };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
  }
  function parseColor(s) {
    s = s.trim().toLowerCase();
    if (s === "white") return { r: 255, g: 255, b: 255, a: 1 };
    if (s === "black") return { r: 0, g: 0, b: 0, a: 1 };
    if (s[0] === "#") {
      var h = s.slice(1);
      if (h.length === 3 || h.length === 4) h = h.split("").map(function (c) { return c + c; }).join("");
      if (h.length !== 6 && h.length !== 8) return null;
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
    }
    var m = s.match(/^(rgba?|hsla?)\((.*)\)$/); if (!m) return null;
    var p = m[2].split(/[\s,\/]+/).filter(Boolean);
    if (p.length < 3 || p.some(function (x) { return /var|calc|none|from/.test(x); })) return null;
    var num = function (x, max) { return /%$/.test(x) ? parseFloat(x) / 100 * max : parseFloat(x); };
    var a = p[3] != null ? num(p[3], 1) : 1;
    if (m[1][0] === "r") return { r: num(p[0], 255), g: num(p[1], 255), b: num(p[2], 255), a: a };
    var c = hsl2rgb(parseFloat(p[0]), num(p[1], 1), num(p[2], 1));
    return { r: c[0], g: c[1], b: c[2], a: a };
  }
  function info(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
    var l = (mx + mn) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    return { h: h, s: s, l: l, chroma: d };
  }
  function ramp(st, l) {
    if (l <= st[0][0]) return st[0][1];
    for (var i = 1; i < st.length; i++) {
      if (l <= st[i][0]) {
        var a = st[i - 1], b = st[i], t = (l - a[0]) / (b[0] - a[0] || 1);
        return [a[1][0] + (b[1][0] - a[1][0]) * t, a[1][1] + (b[1][1] - a[1][1]) * t, a[1][2] + (b[1][2] - a[1][2]) * t];
      }
    }
    return st[st.length - 1][1];
  }
  function fmt(rgb, a) {
    var r = Math.round(rgb[0]), g = Math.round(rgb[1]), b = Math.round(rgb[2]);
    if (a >= 1) return "#" + [r, g, b].map(function (x) { x = Math.max(0, Math.min(255, x)); return (x < 16 ? "0" : "") + x.toString(16); }).join("");
    return "rgba(" + r + ", " + g + ", " + b + ", " + (Math.round(a * 1000) / 1000) + ")";
  }
  var hueNear = function (h, list) { return list.some(function (x) { var d = Math.abs(h - x) % 360; return Math.min(d, 360 - d) <= 10; }); };

  function mapColor(c, ctx, prop, literal) {
    var P = ctx.pal, dn = ctx.native === "dark", I = info(c);
    if (/shadow/.test(prop) && I.chroma < .1 && I.l < .35) {
      if (dn && !P.dark) return fmt([15, 17, 21], c.a * .3);
      return null;
    }
    if (literal && prop === "color" && I.chroma < .05 && I.l >= .985 && c.a >= .9) return null;   // 흰 글자는 일단 그대로 (대표색 위면 아래에서 따로 고침)
    var neutral = I.chroma < .1 || I.l < .06 || I.l > .97;
    if (!neutral && I.chroma >= .12 && hueNear(I.h, ctx.brand)) {
      var soft = dn ? I.l <= .3 : I.l >= .85;
      return fmt(soft ? P.accSoft : P.acc, c.a);
    }
    if (neutral) {
      if (literal && !dn && P.solid && I.l < .3 && /background/.test(prop) && c.a > .5) return fmt(ramp(P.solid, I.l), c.a);
      return fmt(ramp(dn ? P.darkN : P.light, I.l), c.a);
    }
    var sMax = P.sMax == null ? .55 : P.sMax;
    if (P.dark && !dn) {
      if (I.l >= .8) {
        var tint = hsl2rgb(I.h, Math.min(I.s, sMax), .45), base = h2r(P.tintBase);
        return fmt([base[0] + (tint[0] - base[0]) * .2, base[1] + (tint[1] - base[1]) * .2, base[2] + (tint[2] - base[2]) * .2], c.a);
      }
      return fmt(hsl2rgb(I.h, Math.min(I.s, sMax), Math.max(.62, Math.min(I.l + .2, .74))), c.a);
    }
    if (P.dark && dn) {
      if (I.s <= sMax) return null;
      return fmt(hsl2rgb(I.h, sMax, Math.max(.6, Math.min(I.l, .74))), c.a);
    }
    if (!P.dark && dn) {
      if (I.l <= .3) return fmt(hsl2rgb(I.h, Math.min(I.s, sMax), .92), c.a);
      return fmt(hsl2rgb(I.h, Math.min(I.s, sMax), Math.min(I.l, .42)), c.a);
    }
    if (I.s <= sMax) return null;
    if (I.l >= .82) return fmt(hsl2rgb(I.h, Math.min(I.s, sMax * .7), Math.max(I.l, .92)), c.a);
    return fmt(hsl2rgb(I.h, sMax, Math.min(I.l, .44)), c.a);
  }
  function mapValue(val, ctx, prop, literal) {
    if (!COLOR_TEST.test(val)) return val;
    COLOR_RE.lastIndex = 0;
    return val.replace(COLOR_RE, function (m) {
      var c = parseColor(m); if (!c) return m;
      var out = mapColor(c, ctx, prop, literal);
      return out == null ? m : out;
    });
  }
  function mapRadius(v) {
    return String(v).replace(/(\d+(?:\.\d+)?)px/g, function (m, n) {
      n = parseFloat(n);
      if (n < 2 || n >= 40) return m;           // 0~1px(선), 원형은 그대로
      var out = n <= 3 ? 6 : n <= 6 ? 10 : n <= 10 ? 14 : n <= 14 ? 18 : n <= 20 ? 22 : n;
      return out + "px";
    });
  }
  var lum = function (rgb) { return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255; };

  function Skinner(win, key) {
    var doc = win.document, meta = APP_SKIN[key] || { native: "light", brand: [] };
    var recs = [], removed = [], inline = new Set(), origAttr = new WeakMap(), lastAttr = new WeakMap(), sheets = new WeakSet();
    var ctx = null, obs = null, on = false, busy = false, fixed = new Set();

    function doStyle(st) {
      var ch = [];
      for (var i = 0; i < st.length; i++) {
        var p = st[i];
        if (/radius$/.test(p)) {   /* 모서리를 시안처럼 둥글게: 작은 값은 키우고 큰 값·원형은 그대로 */
          var rv = st.getPropertyValue(p), nr = mapRadius(rv);
          if (nr !== rv) ch.push([p, rv, nr, st.getPropertyPriority(p)]);
          continue;
        }
        if (!COLOR_PROP.test(p)) continue;
        var v = st.getPropertyValue(p);
        if (meta.accVars && meta.accVars.indexOf(p) >= 0) {   /* 선택·주요 버튼에 쓰던 진한 색 → 새 대표색 */
          var av = fmt(ctx.pal.acc, 1); if (v.trim() !== av) ch.push([p, v, av, st.getPropertyPriority(p)]); continue;
        }
        if (!v || !COLOR_TEST.test(v)) continue;
        var nv = mapValue(v, ctx, p, p.slice(0, 2) !== "--");
        if (nv !== v) ch.push([p, v, nv, st.getPropertyPriority(p)]);
      }
      ch.forEach(function (x) { st.setProperty(x[0], x[2], x[3]); });
      /* 같은 규칙에서 배경이 대표색이 됐는데 글자가 흰색이면 → 대표색 위 글자색으로 */
      var bg = st.getPropertyValue("background-color") || st.getPropertyValue("background"), col = st.getPropertyValue("color");
      var bgAcc = bg && (bg.toLowerCase().indexOf(fmt(ctx.pal.acc, 1)) >= 0 || (meta.accVars || []).some(function (n) { return bg.indexOf("var(" + n + ")") >= 0; }));
      if (bgAcc && col) {
        var cc = parseColor(col.trim());
        if (cc && info(cc).l > .9 && ctx.pal.onAcc.toLowerCase() !== "#ffffff") { ch.push(["color", col, ctx.pal.onAcc, st.getPropertyPriority("color")]); st.setProperty("color", ctx.pal.onAcc, st.getPropertyPriority("color")); }
      }
      return ch;
    }
    function walk(list, parent) {
      for (var i = list.length - 1; i >= 0; i--) {
        var r = list[i];
        if (r.type === 4 && r.media) {
          var mt = r.media.mediaText || "";
          if (/prefers-color-scheme:\s*dark/.test(mt)) { removed.push([parent, i, r.cssText]); parent.deleteRule(i); continue; }
          if (/print/.test(mt) && !/screen/.test(mt)) continue;
        }
        if (r.selectorText && meta.drop && meta.drop.test(r.selectorText)) { removed.push([parent, i, r.cssText]); parent.deleteRule(i); continue; }
        if (r.selectorText && meta.keep && meta.keep.test(r.selectorText)) continue;
        if (r.style) { var ch = doStyle(r.style); if (ch.length) recs.push([r.style, ch]); }
        if (r.cssRules && r.cssRules.length) walk(r.cssRules, r);
      }
    }
    function doSheet(sh) {
      if (!sh || sheets.has(sh)) return;
      var rules; try { rules = sh.cssRules; } catch (e) { return; }
      sheets.add(sh);
      walk(rules, sh);
    }
    function doEl(el) {
      if (el.nodeType !== 1) return;
      if (el.closest && el.closest("[data-aix-ui]")) return;
      if (meta.keepEl && el.closest(meta.keepEl)) return;
      if (el.hasAttribute("style")) {
        var cur = el.getAttribute("style");
        if (lastAttr.get(el) !== cur) {
          origAttr.set(el, cur);
          var ch = doStyle(el.style);
          lastAttr.set(el, el.getAttribute("style"));
          if (ch.length) inline.add(el);
        }
      }
      ["fill", "stroke"].forEach(function (a) {
        var v = el.getAttribute(a); if (!v || el["_sk_" + a] === v) return;
        el["_sk0_" + a] = v;
        var nv = mapValue(v, ctx, a, true);
        el["_sk_" + a] = nv; if (nv !== v) { el.setAttribute(a, nv); inline.add(el); }
      });
    }
    /* 클래스로 대표색 배경이 된 버튼·칩의 흰 글자 고치기 (다크에서 라임 위 흰 글자 방지) */
    var FIX_SEL = "button,a,label,[class*=btn],[class*=chip],[class*=tag],[class*=badge],[class*=pill],[class*=seg],[class*=tab],.on,.active,.selected,[aria-selected=true],[aria-pressed=true]";
    function fixContrast(root) {
      if (!ctx || ctx.pal.onAcc.toLowerCase() === "#ffffff") return;
      var acc = ctx.pal.acc, list = [];
      if (root.matches && root.matches(FIX_SEL)) list.push(root);
      if (root.querySelectorAll) Array.prototype.push.apply(list, root.querySelectorAll(FIX_SEL));
      list.forEach(function (el) {
        if (el.closest("[data-aix-ui]")) return;
        if (meta.keepEl && el.closest(meta.keepEl)) return;
        var cs = win.getComputedStyle(el), bg = parseColor(cs.backgroundColor || ""), fg = parseColor(cs.color || "");
        if (!bg || !fg || bg.a < .6) { if (fixed.has(el)) { el.style.removeProperty("color"); fixed.delete(el); } return; }
        var near = Math.abs(bg.r - acc[0]) + Math.abs(bg.g - acc[1]) + Math.abs(bg.b - acc[2]) < 40;
        if (near && lum([fg.r, fg.g, fg.b]) > .8) { el.style.setProperty("color", ctx.pal.onAcc, "important"); fixed.add(el); lastAttr.set(el, el.getAttribute("style")); }
        else if (!near && fixed.has(el)) { el.style.removeProperty("color"); fixed.delete(el); lastAttr.set(el, el.getAttribute("style")); }
      });
    }
    var fixTimer = null;
    function queueFix() { clearTimeout(fixTimer); fixTimer = setTimeout(function () { busy = true; try { fixContrast(doc.body || doc.documentElement); } finally { busy = false; } }, 120); }
    function scan(root) {
      doEl(root);
      if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll("[style],[fill],[stroke]"), doEl);
    }
    function onMut(list) {
      if (!on || busy) return;
      busy = true;
      try {
        list.forEach(function (m) {
          if (m.type === "attributes") { if (m.attributeName !== "class") doEl(m.target); }
          else Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType !== 1) return;
            if (n.tagName === "STYLE") doSheet(n.sheet);
            else if (n.tagName === "LINK") n.addEventListener("load", function () { busy = true; doSheet(n.sheet); busy = false; });
            else scan(n);
          });
        });
      } finally { busy = false; }
      queueFix();
    }
    function base() {
      var s = doc.getElementById("aix-skin-base");
      if (!s) { s = doc.createElement("style"); s.id = "aix-skin-base"; (doc.head || doc.documentElement).appendChild(s); sheets.add(s.sheet); }
      s.textContent =
        ":root{color-scheme:" + (ctx.pal.dark ? "dark" : "light") + "}" +
        "body,body *:not(code):not(pre):not(kbd):not(samp):not(i):not([class*=icon]):not([class*=mono]):not([class*=num])" + (meta.keepEl ? ":not(" + meta.keepEl + "):not(" + meta.keepEl + " *)" : "") + "{font-family:" + FONT + "!important}" +
        "::selection{background:" + fmt(ctx.pal.acc, .25) + "}" +
        "*{scrollbar-color:" + (ctx.pal.dark ? "#3A3D44 transparent" : "#C9C9C1 transparent") + "}" +
        (typeof meta.css === "function" ? meta.css(ctx.pal) : (meta.css || ""));
      sheets.add(s.sheet);
      if (!doc.getElementById("aix-skin-font")) {
        var l = doc.createElement("link"); l.rel = "stylesheet"; l.href = FONT_CSS; l.id = "aix-skin-font";
        (doc.head || doc.documentElement).appendChild(l);
      }
    }
    function apply(name) {
      if (on) revert();
      var pal = PALETTE[name]; if (!pal) return;
      ctx = { pal: pal, native: meta.native, brand: meta.brand };
      busy = true;
      try {
        if (meta.attr) doc.documentElement.setAttribute(meta.attr[0], meta.attr[1]);
        base();
        Array.prototype.forEach.call(doc.styleSheets, doSheet);
        scan(doc.body || doc.documentElement);
        fixContrast(doc.body || doc.documentElement);
      } finally { busy = false; }
      on = true;
      if (!obs) obs = new win.MutationObserver(onMut);
      obs.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "fill", "stroke", "class"] });
    }
    function revert() {
      if (!on) return;
      on = false; if (obs) obs.disconnect();
      busy = true;
      try {
        recs.forEach(function (r) { r[1].forEach(function (x) { r[0].setProperty(x[0], x[1], x[3]); }); });
        for (var i = removed.length - 1; i >= 0; i--) { try { removed[i][0].insertRule(removed[i][2], removed[i][1]); } catch (e) {} }
        fixed.forEach(function (el) { el.style.removeProperty("color"); }); fixed = new Set();
        inline.forEach(function (el) {
          if (origAttr.has(el) && el.getAttribute("style") === lastAttr.get(el)) el.setAttribute("style", origAttr.get(el));
          lastAttr.delete(el);
          ["fill", "stroke"].forEach(function (a) { if (el["_sk0_" + a] != null && el.getAttribute(a) === el["_sk_" + a]) el.setAttribute(a, el["_sk0_" + a]); el["_sk_" + a] = null; });
        });
        var b = doc.getElementById("aix-skin-base"); if (b) b.remove();
      } finally { busy = false; }
      recs = []; removed = []; inline = new Set(); sheets = new WeakSet(); lastAttr = new WeakMap();
    }
    var cur = null, hold = 0;
    function pause() { if (hold++ === 0 && on) revert(); }
    function resume() { if (--hold <= 0) { hold = 0; if (cur) apply(cur); } }
    win.addEventListener("beforeprint", pause);
    win.addEventListener("afterprint", resume);
    if (typeof win.html2canvas === "function" && !win.html2canvas._sk) {
      var h2c = win.html2canvas;
      win.html2canvas = function () {
        pause();
        var p; try { p = h2c.apply(this, arguments); } catch (e) { resume(); throw e; }
        return Promise.resolve(p).then(function (v) { resume(); return v; }, function (e) { resume(); throw e; });
      };
      win.html2canvas._sk = true;
    }
    return { set: function (name) { cur = name; if (hold) return; apply(name); }, off: function () { cur = null; revert(); } };
  }

  /* ---------- 로그인한 사람 이름을 화면 기본값으로 ----------
     기존 인트라넷과 같은 방식. 점검 기간(읽기 전용)에는 화면 설정을 저장하는 동작은 빼고 화면에만 반영. */
  function identCode(id, nm, admin, ro) {
    nm = JSON.stringify(nm);
    switch (id) {
      case "students": return '(function(){ if(typeof MENTORS==="undefined") return false;' + (admin ? "isAuthenticatedAdmin=true;" : "") +
        "if(MENTORS.indexOf(" + nm + ")<0) return " + (admin ? "true" : "false") + ";" +
        "currentSelectedMentor=" + nm + "; renderAllMentorUIs(); filterList(); return true; })()";
      case "schedule": return "(function(){ var nm=" + nm + ";" +
        'var hit=function(sel){ return [].slice.call(document.querySelectorAll(sel)).filter(function(x){ return x.textContent.replace(/[0-9]+/g,"").trim()===nm; })[0]; };' +
        "var b=hit('[data-act=\"lm\"]') || hit('[data-act=\"mfilter-one\"]'); if(!b) return false;" +
        'var on=b.classList.contains("on") || (b.closest(".mwrap")||{classList:{contains:function(){return false}}}).classList.contains("on");' +
        "if(!on) b.click(); return true; })()";
      case "report": return "(function(){ var nm=" + nm + ", admin=" + (admin ? "true" : "false") + ";" +
        'if(typeof S==="undefined"||!S.mentors||typeof Cloud==="undefined") return false;' +
        "if(!Cloud.on||!Cloud.user) return false;" +
        'var em=(Cloud.user.email||"").toLowerCase(); if(!em) return false;' +
        "if(!Array.isArray(S.leaders)) S.leaders=[]; if(!S.accounts) S.accounts={}; var ch=false;" +
        "if(admin){ if(S.mentors.indexOf(nm)<0){ S.mentors.push(nm); ch=true; } if(S.accounts[em]!==nm){ S.accounts[em]=nm; ch=true; } if(S.leaders.indexOf(em)<0){ S.leaders.push(em); ch=true; } }" +
        "else { if(!S.accounts[em]){ if(S.mentors.indexOf(nm)<0) return false; S.accounts[em]=nm; ch=true; } }" +
        "if(S.accounts[em]) S.me=S.accounts[em];" +
        'var ov=document.getElementById("linkOvl"); if(ov) ov.classList.remove("on");' +
        (ro ? "" : 'if(ch && typeof save==="function") save();') +
        "syncMentorSelects(); applyPerms(); renderSet(); return true; })()";
      case "quote": return '(function(){ if(typeof CURRENT_USER==="undefined"||!CURRENT_USER) return false;' +
        "if(!CURRENT_USER.displayName) CURRENT_USER.displayName=" + nm + ";" +
        "renderMentorSelects(); applyStaffDefaultSelects(); renderNameBanner(); return true; })()";
    }
    return null;
  }
  /* 화면이 자체적으로 '이름 선택'을 쓰는 경우 미리 넣어 둘 저장 키 */
  var NAME_KEY = { viral: "viral_login_name" };

  window.AIXSkin = {
    APPS: APP_SKIN,
    /* 껍데기가 화면(iframe)을 만들 때 부름 */
    attach: function (frame, id, getTheme, me, readOnly) {
      if (NAME_KEY[id] && me && me.name) { try { if (!localStorage.getItem(NAME_KEY[id])) localStorage.setItem(NAME_KEY[id], me.name); } catch (e) {} }
      frame.addEventListener("load", function () {
        try { frame._skin = Skinner(frame.contentWindow, id); frame._skin.set(getTheme()); }
        catch (e) { console.warn("skin", id, e); }
        var code = me && me.name ? identCode(id, me.name, me.role === "admin", readOnly) : null, tries = 0;
        if (!code) return;
        var tick = function () {
          if (frame._ident || tries++ > 14) return;
          var ok = false; try { ok = !!frame.contentWindow.eval(code); } catch (e) {}
          if (ok) frame._ident = true; else setTimeout(tick, 700);
        };
        setTimeout(tick, 400);
      });
    },
    /* 테마를 바꿀 때 열려 있는 모든 화면에 다시 입힘 */
    retheme: function (frames, theme) { frames.forEach(function (f) { if (f._skin) f._skin.set(theme); }); }
  };
})();
