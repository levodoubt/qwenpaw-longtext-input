/**
 * QwenPaw 长文本输入插件 — 前端入口 (v6)
 *
 * - 在输入框左下角注入「长文本」按钮
 * - 保存后仅注入官方附件上传，文件存到 media/（与手动点📎一致）
 * - 不留 .LongText/ 本地副本
 */

const PLUGIN_ID = "longtext-input";
const STYLE_ID = `${PLUGIN_ID}-css`;
const EDITOR_HOST = `${PLUGIN_ID}-editor`;
const BTN_ATTR = `data-${PLUGIN_ID}-btn`;

const { React, antd, antdIcons } = window.QwenPaw.host;
const { ReactDOM } = window.QwenPaw.host;

function injectCss() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
.longtext-btn{display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border:none;background:transparent;cursor:pointer;border-radius:4px;font-size:12px;color:#666;line-height:1;white-space:nowrap;vertical-align:middle}
.longtext-btn:hover{background:rgba(0,0,0,.06)}
.longtext-btn svg{width:13px;height:13px;flex-shrink:0}
@media(prefers-color-scheme:dark){
  .longtext-btn{color:#999}
  .longtext-btn:hover{background:rgba(255,255,255,.1)}
}`;
  document.head.appendChild(s);
}

/** 注入 File 到官方附件 input → 走完整的上传+附件列表流程 */
function injectAsAttachment(file: File): boolean {
  const input =
    document.querySelector('.ant-upload input[type="file"]') ||
    document.querySelector('input[type="file"]');
  if (!input) return false;
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files');
    if (desc?.set) {
      desc.set.call(input, dt.files);
    } else {
      Object.defineProperty(input, 'files', { value: dt.files, configurable: true });
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (e) {
    console.warn(`[${PLUGIN_ID}] 注入失败:`, e);
    return false;
  }
}

/** 将标题转为安全的文件名字段 */
function safeTitle(s: string): string {
  return s
    .replace(/[<>:"/\\|?*]/g, '_')   // 去掉非法文件名字符
    .replace(/\s+/g, '_')             // 空白变下划线
    .replace(/_+/g, '_')              // 合并连续下划线
    .replace(/^_|_$/g, '')            // 去掉首尾下划线
    .slice(0, 40);                    // 截断，防止文件名过长
}

function EditorModal(props: { onClose: () => void }) {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const len = text.length;

  const save = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const ts = Date.now();
      const tag = safeTitle(title);
      const filename = tag
        ? `${tag}_${ts}.txt`                                     // 有标题 → 标题_时间戳.txt
        : `长文本_${ts}.txt`;                                      // 无标题 → 长文本_时间戳.txt
      const file = new File([new Blob([text], { type: 'text/plain' })], filename, { type: 'text/plain' });

      const ok = injectAsAttachment(file);
      antd.message.success(
        ok ? `已添加附件: ${filename} (${(text.length/1024).toFixed(1)} KB)` : '注入失败，请手动上传',
        3,
      );
      setTitle("");
      setText("");
      props.onClose();
    } catch (e) {
      antd.message.error(`出错: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    if (text.trim()) {
      antd.Modal.confirm({
        title: "放弃编辑？", content: "当前内容尚未保存", okText: "放弃", cancelText: "继续",
        onOk: () => { setTitle(""); setText(""); props.onClose(); },
      });
    } else props.onClose();
  };

  return React.createElement(antd.Modal, {
    title: React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
      React.createElement(antdIcons.EditOutlined),
      React.createElement("span", null, "长文本输入"),
    ),
    open: true, onCancel: cancel, width: 760, style: { top: 30 }, destroyOnClose: true,
    footer: React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
      React.createElement("span", { style: { color: "#999", fontSize: 12 } }, `${len} 字`),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement(antd.Button, { onClick: cancel, disabled: busy }, "取消"),
        React.createElement(antd.Button, {
          type: "primary", onClick: save, loading: busy, disabled: !text.trim(),
          icon: React.createElement(antdIcons.SaveOutlined),
        }, busy ? "处理中…" : "保存并加入附件"),
      ),
    ),
  }, React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
    // 标题输入框
    React.createElement(antd.Input, {
      value: title,
      onChange: (e: any) => setTitle(e.target.value),
      placeholder: "标题（可选，将出现在文件名中）",
      maxLength: 80,
      style: { fontSize: 13 },
      disabled: busy,
      prefix: React.createElement(antdIcons.TagOutlined, { style: { color: "#bfbfbf" } }),
    }),
    // 正文
    React.createElement(antd.Input.TextArea, {
      value: text, onChange: (e: any) => setText(e.target.value),
      placeholder: "在此输入长文本内容…",
      autoSize: { minRows: 16, maxRows: 30 },
      style: { fontSize: 14, lineHeight: 1.7 },
      disabled: busy,
    }),
  ));
}

function openEditor() {
  let host = document.getElementById(EDITOR_HOST);
  if (!host) { host = document.createElement("div"); host.id = EDITOR_HOST; document.body.appendChild(host); }
  ReactDOM.render(React.createElement(EditorModal, {
    onClose: () => { try { ReactDOM.unmountComponentAtNode(host!); } catch {} },
  }), host);
}

function tryInject(): boolean {
  if (document.querySelector(`[${BTN_ATTR}]`)) return true;

  // 只在聊天页面注入（URL 路径包含 /chat/）
  if (!/\/chat\//.test(location.pathname) && !/\/chat$/.test(location.pathname)) {
    return false;
  }

  // 找到「附件」按钮的 hidden input，向上找到聊天工具栏
  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput) return false;

  let tb: HTMLElement | null = null;
  let p: HTMLElement | null = fileInput.parentElement;
  for (let i = 0; i < 5 && p; i++) {
    const btns = p.querySelectorAll('button');
    if (btns.length >= 2) { tb = p as HTMLElement; break; }
    p = p.parentElement;
  }
  if (!tb) return false;

  // 防止重复注入
  if (tb.querySelector(`[${BTN_ATTR}]`)) return true;
  tb.setAttribute(BTN_ATTR, "1");

  // 创建按钮，插入到工具栏最左侧（语音/附件按钮之前）
  const btn = document.createElement("button");
  btn.className = "longtext-btn"; btn.setAttribute(BTN_ATTR, "");
  btn.title = "打开编辑器，保存后自动加入附件列表";
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>长文本</span>`;
  btn.onclick = openEditor;
  tb.insertBefore(btn, tb.firstChild);
  return true;
}

// ── 周期性检查（轻量，不干扰 React 渲染） ─────────────
let checkTimer: ReturnType<typeof setInterval> | null = null;

function startPoller() {
  tryInject();
  // 每 1 秒检查一次，按钮被 React 清除后自动恢复
  checkTimer = setInterval(() => {
    if (!document.querySelector(`[${BTN_ATTR}]`)) {
      tryInject();
    }
  }, 1000);
}

function init() {
  injectCss();
  startPoller();
  console.log(`[${PLUGIN_ID}] ✓ 已加载`);
  return () => {
    if (checkTimer) clearInterval(checkTimer);
    document.getElementById(EDITOR_HOST)?.remove();
  };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
