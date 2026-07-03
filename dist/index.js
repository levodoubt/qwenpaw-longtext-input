const u = "longtext-input", b = `${u}-css`, p = `${u}-editor`, s = `data-${u}-btn`, { React: n, antd: a, antdIcons: d } = window.QwenPaw.host, { ReactDOM: x } = window.QwenPaw.host;
function I() {
  if (document.getElementById(b)) return;
  const e = document.createElement("style");
  e.id = b, e.textContent = `
.longtext-btn{display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border:none;background:transparent;cursor:pointer;border-radius:4px;font-size:12px;color:#666;line-height:1;white-space:nowrap;vertical-align:middle}
.longtext-btn:hover{background:rgba(0,0,0,.06)}
.longtext-btn svg{width:13px;height:13px;flex-shrink:0}
@media(prefers-color-scheme:dark){
  .longtext-btn{color:#999}
  .longtext-btn:hover{background:rgba(255,255,255,.1)}
}`, document.head.appendChild(e);
}
function T(e) {
  const o = document.querySelector('.ant-upload input[type="file"]') || document.querySelector('input[type="file"]');
  if (!o) return !1;
  try {
    const l = new DataTransfer();
    l.items.add(e);
    const t = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "files");
    return t != null && t.set ? t.set.call(o, l.files) : Object.defineProperty(o, "files", { value: l.files, configurable: !0 }), o.dispatchEvent(new Event("change", { bubbles: !0 })), !0;
  } catch (l) {
    return console.warn(`[${u}] 注入失败:`, l), !1;
  }
}
function $(e) {
  return e.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}
function O(e) {
  const [o, l] = n.useState(""), [t, i] = n.useState(""), [c, m] = n.useState(!1), w = t.length, C = async () => {
    if (t.trim()) {
      m(!0);
      try {
        const r = Date.now(), y = $(o), h = y ? `${y}_${r}.txt` : `长文本_${r}.txt`, S = new File([new Blob([t], { type: "text/plain" })], h, { type: "text/plain" }), k = T(S);
        a.message.success(
          k ? `已添加附件: ${h} (${(t.length / 1024).toFixed(1)} KB)` : "注入失败，请手动上传",
          3
        ), l(""), i(""), e.onClose();
      } catch (r) {
        a.message.error(`出错: ${r instanceof Error ? r.message : String(r)}`);
      } finally {
        m(!1);
      }
    }
  }, g = () => {
    t.trim() ? a.Modal.confirm({
      title: "放弃编辑？",
      content: "当前内容尚未保存",
      okText: "放弃",
      cancelText: "继续",
      onOk: () => {
        l(""), i(""), e.onClose();
      }
    }) : e.onClose();
  };
  return n.createElement(a.Modal, {
    title: n.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 8 } },
      n.createElement(d.EditOutlined),
      n.createElement("span", null, "长文本输入")
    ),
    open: !0,
    onCancel: g,
    width: 760,
    style: { top: 30 },
    destroyOnClose: !0,
    footer: n.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
      n.createElement("span", { style: { color: "#999", fontSize: 12 } }, `${w} 字`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(a.Button, { onClick: g, disabled: c }, "取消"),
        n.createElement(a.Button, {
          type: "primary",
          onClick: C,
          loading: c,
          disabled: !t.trim(),
          icon: n.createElement(d.SaveOutlined)
        }, c ? "处理中…" : "保存并加入附件")
      )
    )
  }, n.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    // 标题输入框
    n.createElement(a.Input, {
      value: o,
      onChange: (r) => l(r.target.value),
      placeholder: "标题（可选，将出现在文件名中）",
      maxLength: 80,
      style: { fontSize: 13 },
      disabled: c,
      prefix: n.createElement(d.TagOutlined, { style: { color: "#bfbfbf" } })
    }),
    // 正文
    n.createElement(a.Input.TextArea, {
      value: t,
      onChange: (r) => i(r.target.value),
      placeholder: "在此输入长文本内容…",
      autoSize: { minRows: 16, maxRows: 30 },
      style: { fontSize: 14, lineHeight: 1.7 },
      disabled: c
    })
  ));
}
function _() {
  let e = document.getElementById(p);
  e || (e = document.createElement("div"), e.id = p, document.body.appendChild(e)), x.render(n.createElement(O, {
    onClose: () => {
      try {
        x.unmountComponentAtNode(e);
      } catch {
      }
    }
  }), e);
}
function E() {
  if (document.querySelector(`[${s}]`)) return !0;
  if (!/\/chat\//.test(location.pathname) && !/\/chat$/.test(location.pathname))
    return !1;
  const e = document.querySelector('input[type="file"]');
  if (!e) return !1;
  let o = null, l = e.parentElement;
  for (let i = 0; i < 5 && l; i++) {
    if (l.querySelectorAll("button").length >= 2) {
      o = l;
      break;
    }
    l = l.parentElement;
  }
  if (!o) return !1;
  if (o.querySelector(`[${s}]`)) return !0;
  o.setAttribute(s, "1");
  const t = document.createElement("button");
  return t.className = "longtext-btn", t.setAttribute(s, ""), t.title = "打开编辑器，保存后自动加入附件列表", t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>长文本</span>', t.onclick = _, o.insertBefore(t, o.firstChild), !0;
}
let f = null;
function B() {
  E(), f = setInterval(() => {
    document.querySelector(`[${s}]`) || E();
  }, 1e3);
}
function v() {
  return I(), B(), console.log(`[${u}] ✓ 已加载`), () => {
    var e;
    f && clearInterval(f), (e = document.getElementById(p)) == null || e.remove();
  };
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", v) : v();
