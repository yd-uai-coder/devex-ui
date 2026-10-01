// 詳細設計モードの 05 章(主要処理の手順)と 06 章(処理ロジックの詳細)の意味モデルと、
// そこから導く表(索引・関与表・逆引き表)と、出力(md・HTML)の組み立て。すべて純粋関数。
// 正本は「手順の行が持つ logic(L-ID)」の1か所だけで、06 側の「呼ばれる手順」は逆引きで導く。

export type Step = {
  // 手順番号。分岐はサブ番号(4a)。処理の中で一意
  no: string;
  from: string;
  to: string;
  // 呼び出す関数(同じモジュールの中の処理なら省く)
  call?: string;
  data: string;
  action: string;
  result: string;
  db: string;
  branch: string;
  // 分岐の行(元の手順の直後に置く)
  isBranch?: boolean;
  // この手順の中身を 06 章で詳しく書いているときの L-ID
  logic?: string;
};

export type Procedure = {
  // 段階1の処理ID(変わらない ID)
  id: string;
  name: string;
  trigger: string;
  // 手順を書く対象に選んだ理由(重要な部分だけ書く原則の説明)
  reason: string;
  steps: Step[];
  note?: string;
};

export type LogicSpec = {
  id: string;
  fn: string;
  module: string;
  signature: string;
  args: string;
  returns: string;
  raises: string;
  pre: string;
  post: string;
  pseudo: { text: string; sub?: string[] }[];
};

export type StepRef = { procedureId: string; no: string };

// 手順の全体で一意な ID(例: F-01#4)
export function stepId(ref: StepRef): string {
  return `${ref.procedureId}#${ref.no}`;
}

// HTML の要素 id(例: f-01-4)。URL の # と衝突しないよう、# を - にして小文字にする
export function stepAnchor(ref: StepRef): string {
  return `${ref.procedureId}-${ref.no}`.toLowerCase();
}

export function procedureAnchor(procedureId: string): string {
  return procedureId.toLowerCase();
}

export function logicAnchor(logicId: string): string {
  return logicId.toLowerCase();
}

// 分岐を除いた手順の数(索引に出す)
export function mainStepCount(procedure: Procedure): number {
  return procedure.steps.filter((s) => !s.isBranch).length;
}

// 06 の各項目を呼んでいる手順の逆引き。L-ID ごとに、処理の並び順・手順の並び順で返す
export function buildReverseIndex(procedures: Procedure[]): Map<string, StepRef[]> {
  const index = new Map<string, StepRef[]>();
  for (const procedure of procedures) {
    for (const step of procedure.steps) {
      if (!step.logic) continue;
      const refs = index.get(step.logic) ?? [];
      refs.push({ procedureId: procedure.id, no: step.no });
      index.set(step.logic, refs);
    }
  }
  return index;
}

// 手順の行が参照しているのに 06 に無い L-ID(組み立て前の検証に使う)
export function findDanglingLogicRefs(procedures: Procedure[], logics: LogicSpec[]): StepRef[] {
  const known = new Set(logics.map((l) => l.id));
  const dangling: StepRef[] = [];
  for (const procedure of procedures) {
    for (const step of procedure.steps) {
      if (step.logic && !known.has(step.logic)) dangling.push({ procedureId: procedure.id, no: step.no });
    }
  }
  return dangling;
}

export type Involvement = {
  // 列: 呼び出し先として現れるモジュール(最初に現れた順)
  modules: string[];
  // 行: 処理ID → モジュール → そのモジュールが呼ばれる手順番号
  cells: Map<string, Map<string, string[]>>;
};

// 呼び出し先がモジュール(段階4のモジュール一覧のパス)か。利用者・スケジューラなどの外部の役者は除く
export function isModule(name: string): boolean {
  return name.includes("/");
}

// 処理 × モジュールの関与表。CRUD 図と同じ格子で、セルには手順番号を入れる
export function buildInvolvement(procedures: Procedure[]): Involvement {
  const modules: string[] = [];
  const cells = new Map<string, Map<string, string[]>>();
  for (const procedure of procedures) {
    const row = new Map<string, string[]>();
    for (const step of procedure.steps) {
      if (step.isBranch || !isModule(step.to)) continue;
      if (!modules.includes(step.to)) modules.push(step.to);
      row.set(step.to, [...(row.get(step.to) ?? []), step.no]);
    }
    cells.set(procedure.id, row);
  }
  return { modules, cells };
}

function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function callee(step: Step): string {
  return step.call ? `${step.to}.${step.call}` : step.to;
}

function linkedLogics(procedure: Procedure): string[] {
  return [...new Set(procedure.steps.flatMap((s) => (s.logic ? [s.logic] : [])))];
}

function logicRows(l: LogicSpec): [string, string][] {
  return [
    ["シグネチャ", l.signature],
    ["引数", l.args],
    ["戻り値", l.returns],
    ["例外", l.raises],
    ["事前条件", l.pre],
    ["事後条件", l.post],
  ];
}

// 05・06 章の md(差分・AI への入力用)。リンクは持たず、ID を本文に書くだけにする。
// 生の HTML のアンカー(<a id>)は多くのビューワーで捨てられ、日本語の見出しの自動アンカーはビューワーごとに
// 作り方が違うため、md でのジャンプは諦め、読むための形式は toHtml に任せる。
export function toMarkdown(procedures: Procedure[], logics: LogicSpec[]): string {
  const reverse = buildReverseIndex(procedures);
  const involvement = buildInvolvement(procedures);
  const lines: string[] = [];

  lines.push("## 5. 主要処理の手順", "", "### 5.0 索引", "");
  lines.push("| 処理ID | 名称 | トリガー | 選定理由 | 手順数 | 詳細(06) |", "|---|---|---|---|---|---|");
  for (const p of procedures) {
    const details = linkedLogics(p).join(", ") || "—";
    lines.push(`| ${p.id} | ${cell(p.name)} | ${cell(p.trigger)} | ${cell(p.reason)} | ${mainStepCount(p)} | ${details} |`);
  }

  lines.push("", "### 5.0.1 処理 × モジュール(セルは手順番号)", "");
  lines.push(`| 処理ID | ${involvement.modules.join(" | ")} |`, `|---|${involvement.modules.map(() => "---").join("|")}|`);
  for (const p of procedures) {
    const row = involvement.cells.get(p.id)!;
    const cols = involvement.modules.map((m) => (row.get(m) ?? []).join(", ") || "—");
    lines.push(`| ${p.id} | ${cols.join(" | ")} |`);
  }

  procedures.forEach((p, i) => {
    lines.push("", `### 5.${i + 1} ${p.id} ${p.name}`, "", `トリガー: ${p.trigger}`, "");
    lines.push("| No | 呼び出し元 → 呼び出し先 | 渡すデータ | 処理内容 | 結果 | DB 操作 | 分岐・例外 |", "|---|---|---|---|---|---|---|");
    for (const s of p.steps) {
      if (s.isBranch) {
        lines.push(`| ${s.no} | ${cell(s.action)} | | | | | ${cell(s.branch)} |`);
        continue;
      }
      const action = s.logic ? `${cell(s.action)} → 詳細: ${s.logic}` : cell(s.action);
      lines.push(
        `| ${s.no} | ${cell(s.from)} → ${cell(callee(s))} | ${cell(s.data)} | ${action} | ${cell(s.result)} | ${cell(s.db)} | ${cell(s.branch)} |`,
      );
    }
    if (p.note) lines.push("", p.note);
  });

  lines.push("", "## 6. 処理ロジックの詳細", "", "### 6.0 逆引き(関数 × 手順)", "");
  lines.push("| L-ID | 関数 | モジュール | 呼ばれる手順 |", "|---|---|---|---|");
  for (const l of logics) {
    const refs = (reverse.get(l.id) ?? []).map(stepId).join(", ") || "—";
    lines.push(`| ${l.id} | ${cell(l.fn)} | ${cell(l.module)} | ${refs} |`);
  }
  logics.forEach((l, i) => {
    const refs = (reverse.get(l.id) ?? []).map(stepId).join(", ") || "—";
    lines.push("", `### 6.${i + 1} ${l.id} ${l.fn}`, "", `呼ばれる手順: ${refs}`, "", `モジュール: ${l.module}`, "");
    lines.push("| 項目 | 内容 |", "|---|---|");
    for (const [k, v] of logicRows(l)) lines.push(`| ${k} | ${cell(v)} |`);
    lines.push("");
    l.pseudo.forEach((ps, n) => {
      lines.push(`${n + 1}. ${ps.text}`);
      for (const sub of ps.sub ?? []) lines.push(`   - ${sub}`);
    });
  });

  return lines.join("\n") + "\n";
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HTML_STYLE = `
:root { --bg:#f7f8fa; --sheet:#fff; --ink:#1d2433; --muted:#5b6475; --rule:#d6dbe4; --head:#eef1f6;
  --accent:#1f5fae; --accent-soft:#e4edf9; --branch:#f6f1e7; --hl:#fdf3c4; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --bg:#151a23; --sheet:#1c2230; --ink:#e3e7ee; --muted:#9aa3b4;
  --rule:#2e3647; --head:#242c3c; --accent:#7fb0f0; --accent-soft:#1f3150; --branch:#2a2618; --hl:#4a4215; color-scheme: dark; } }
* { box-sizing: border-box; }
body { margin:0; padding:24px 16px 64px; background:var(--bg); color:var(--ink);
  font:14px/1.7 "Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif; }
main { max-width:1100px; margin:0 auto; display:grid; gap:14px; }
h1 { font-size:1.5rem; margin:0; } h2 { font-size:1.25rem; margin:24px 0 0; } h3 { font-size:1.02rem; margin:12px 0 0; }
p { margin:0; } .muted { color:var(--muted); font-size:0.88em; }
code, .mono { font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:0.9em; }
.scroll { overflow-x:auto; border:1px solid var(--rule); background:var(--sheet); }
table { border-collapse:collapse; width:100%; font-size:13px; }
th, td { border-bottom:1px solid var(--rule); padding:5px 9px; text-align:left; vertical-align:top; }
th { background:var(--head); white-space:nowrap; }
tr.branch td { background:var(--branch); } tr.branch td:first-child { font-weight:700; }
.hl, tr.hl td { background:var(--hl) !important; }
a.badge { display:inline-block; padding:0 7px; border-radius:4px; background:var(--accent-soft); color:var(--accent);
  text-decoration:none; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:12px; margin:2px 2px 0 0; }
a.badge:hover { text-decoration:underline; }
.tabs { display:flex; flex-wrap:wrap; gap:6px; }
.tabs a { padding:3px 10px; border:1px solid var(--rule); border-radius:4px; background:var(--sheet); color:var(--ink);
  text-decoration:none; font-size:13px; }
.tabs a[aria-selected="true"] { background:var(--accent); border-color:var(--accent); color:#fff; }
.panel { display:grid; gap:8px; padding:12px; border:1px solid var(--rule); background:var(--sheet); scroll-margin-top:16px; }
.js .panel:not(.active) { display:none; }
.cols { display:flex; flex-wrap:wrap; gap:16px; } .cols > * { flex:1 1 320px; min-width:0; }
ol { margin:0; padding-left:22px; } ol ol { list-style:lower-alpha; }
`;

// タブの切り替えと、アンカーへ移ったときのタブの切り替え・強調。スクリプトが無くても全件表示とアンカーで読める
const HTML_SCRIPT = `
(function () {
  document.documentElement.classList.add("js");
  function show(group, id) {
    document.querySelectorAll('.panel[data-group="' + group + '"]').forEach(function (p) {
      p.classList.toggle("active", p.id === id);
    });
    document.querySelectorAll('.tabs[data-group="' + group + '"] a').forEach(function (a) {
      a.setAttribute("aria-selected", a.getAttribute("href") === "#" + id ? "true" : "false");
    });
  }
  function go() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (!el) return;
    var panel = el.closest(".panel");
    if (panel) show(panel.dataset.group, panel.id);
    document.querySelectorAll(".hl").forEach(function (e) { e.classList.remove("hl"); });
    if (el !== panel) el.classList.add("hl");
    el.scrollIntoView({ block: el === panel ? "start" : "center" });
  }
  ["proc", "logic"].forEach(function (g) {
    var first = document.querySelector('.panel[data-group="' + g + '"]');
    if (first) show(g, first.id);
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href") === location.hash) { e.preventDefault(); go(); }
  });
  window.addEventListener("hashchange", go);
  go();
})();
`;

// 05・06 章の自己完結の HTML(読む用)。外部のファイルを読み込まず、ブラウザで開けばリンクが必ず動く。
// 本実装では devex-api 側(zip 出力と同じ層)で組み立てる。これは形式を確かめるための見本。
export function toHtml(procedures: Procedure[], logics: LogicSpec[], title = "詳細設計書 05・06 章"): string {
  const e = escapeHtml;
  const reverse = buildReverseIndex(procedures);
  const involvement = buildInvolvement(procedures);
  const badge = (href: string, label: string) => `<a class="badge" href="#${e(href)}">${e(label)}</a>`;
  const stepLink = (r: StepRef) => badge(stepAnchor(r), stepId(r));
  const out: string[] = [];

  out.push(
    `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`,
    `<title>${e(title)}</title><style>${HTML_STYLE}</style></head><body><main>`,
    `<h1>${e(title)}</h1>`,
    `<p class="muted">バッジ(青い ID)を押すと、該当する処理・関数のタブへ移り、行を強調します。</p>`,
  );

  out.push(`<h2>5. 主要処理の手順</h2><h3>5.0 索引</h3><div class="scroll"><table>`);
  out.push(`<thead><tr><th>処理ID</th><th>名称</th><th>トリガー</th><th>選定理由</th><th>手順数</th><th>詳細(06)</th></tr></thead><tbody>`);
  for (const p of procedures) {
    const details = linkedLogics(p).map((id) => badge(logicAnchor(id), id)).join("") || "—";
    out.push(
      `<tr><td>${badge(procedureAnchor(p.id), p.id)}</td><td>${e(p.name)}</td><td class="mono">${e(p.trigger)}</td>` +
        `<td>${e(p.reason)}</td><td>${mainStepCount(p)}</td><td>${details}</td></tr>`,
    );
  }
  out.push(`</tbody></table></div>`);

  out.push(`<h3>5.0.1 処理 × モジュール(セルは手順番号)</h3><div class="scroll"><table><thead><tr><th>処理ID</th>`);
  for (const m of involvement.modules) out.push(`<th class="mono">${e(m)}</th>`);
  out.push(`</tr></thead><tbody>`);
  for (const p of procedures) {
    const row = involvement.cells.get(p.id)!;
    out.push(`<tr><td class="mono">${e(p.id)}</td>`);
    for (const m of involvement.modules) {
      const nos = row.get(m) ?? [];
      const links = nos.map((no) => badge(stepAnchor({ procedureId: p.id, no }), no)).join("") || "—";
      out.push(`<td>${links}</td>`);
    }
    out.push(`</tr>`);
  }
  out.push(`</tbody></table></div>`);

  out.push(`<h3>5.1〜 処理ごとの手順</h3><nav class="tabs" data-group="proc">`);
  for (const p of procedures) out.push(`<a href="#${e(procedureAnchor(p.id))}">${e(`${p.id} ${p.name}`)}</a>`);
  out.push(`</nav>`);
  procedures.forEach((p, i) => {
    out.push(`<section class="panel" data-group="proc" id="${e(procedureAnchor(p.id))}">`);
    out.push(`<h3>5.${i + 1} ${e(p.id)} ${e(p.name)} <span class="muted mono">${e(p.trigger)}</span></h3><div class="scroll"><table>`);
    out.push(
      `<thead><tr><th>No</th><th>呼び出し元 → 呼び出し先</th><th>渡すデータ</th><th>処理内容</th><th>結果</th><th>DB 操作</th><th>分岐・例外</th></tr></thead><tbody>`,
    );
    for (const s of p.steps) {
      const id = e(stepAnchor({ procedureId: p.id, no: s.no }));
      if (s.isBranch) {
        out.push(`<tr class="branch" id="${id}"><td class="mono">${e(s.no)}</td><td colspan="5">${e(s.action)}</td><td>${e(s.branch)}</td></tr>`);
        continue;
      }
      const detail = s.logic ? `<br>${badge(logicAnchor(s.logic), `詳細 ${s.logic} ↓`)}` : "";
      out.push(
        `<tr id="${id}"><td class="mono">${e(s.no)}</td><td>${e(s.from)} → <span class="mono">${e(callee(s))}</span></td>` +
          `<td>${e(s.data)}</td><td>${e(s.action)}${detail}</td><td>${e(s.result)}</td><td class="mono">${e(s.db)}</td><td>${e(s.branch)}</td></tr>`,
      );
    }
    out.push(`</tbody></table></div>`);
    if (p.note) out.push(`<p class="muted">${e(p.note)}</p>`);
    out.push(`</section>`);
  });

  out.push(`<h2>6. 処理ロジックの詳細</h2><h3>6.0 逆引き(関数 × 手順)</h3><div class="scroll"><table>`);
  out.push(`<thead><tr><th>L-ID</th><th>関数</th><th>モジュール</th><th>呼ばれる手順</th></tr></thead><tbody>`);
  for (const l of logics) {
    const refs = (reverse.get(l.id) ?? []).map(stepLink).join("") || "—";
    out.push(`<tr><td>${badge(logicAnchor(l.id), l.id)}</td><td class="mono">${e(l.fn)}</td><td class="mono">${e(l.module)}</td><td>${refs}</td></tr>`);
  }
  out.push(`</tbody></table></div>`);

  out.push(`<h3>6.1〜 各関数</h3><nav class="tabs" data-group="logic">`);
  for (const l of logics) out.push(`<a href="#${e(logicAnchor(l.id))}">${e(`${l.id} ${l.fn}`)}</a>`);
  out.push(`</nav>`);
  logics.forEach((l, i) => {
    const refs = (reverse.get(l.id) ?? []).map((r) => badge(stepAnchor(r), `↑ ${stepId(r)}`)).join("") || "—";
    out.push(`<section class="panel" data-group="logic" id="${e(logicAnchor(l.id))}">`);
    out.push(`<h3>6.${i + 1} ${e(l.id)} <span class="mono">${e(l.fn)}</span> <span class="muted mono">${e(l.module)}</span></h3>`);
    out.push(`<p>呼ばれる手順: ${refs}</p><div class="cols"><div class="scroll"><table><tbody>`);
    for (const [k, v] of logicRows(l)) {
      out.push(`<tr><th>${e(k)}</th><td${k === "シグネチャ" ? ' class="mono"' : ""}>${e(v)}</td></tr>`);
    }
    out.push(`</tbody></table></div><ol>`);
    for (const ps of l.pseudo) {
      const sub = ps.sub ? `<ol>${ps.sub.map((x) => `<li>${e(x)}</li>`).join("")}</ol>` : "";
      out.push(`<li>${e(ps.text)}${sub}</li>`);
    }
    out.push(`</ol></div></section>`);
  });

  out.push(`</main><script>${HTML_SCRIPT}</script></body></html>`);
  return out.join("\n") + "\n";
}
