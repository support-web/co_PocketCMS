const STORAGE_KEY = 'pocketcms-site-data';
const tabs = [
  { id: 'site', label: 'サイト基本' },
  { id: 'cta', label: '予約導線' },
  { id: 'posts', label: '施術例投稿' },
  { id: 'faq', label: 'FAQ' }
];

async function loadDefaults() {
  const res = await fetch('data/sample-site.json');
  return res.json();
}

function loadState(defaults) {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cache', e);
    }
  }
  return defaults;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderTabs(activeId) {
  const nav = document.getElementById('tabs');
  nav.innerHTML = '';
  tabs.forEach((tab) => {
    const btn = document.createElement('button');
    btn.textContent = tab.label;
    btn.className = tab.id === activeId ? 'active' : '';
    btn.addEventListener('click', () => switchTab(tab.id));
    nav.appendChild(btn);
  });
}

let appState;

function renderSitePanel() {
  const el = document.getElementById('panel-site');
  el.innerHTML = `
    <div class="section-header">
      <h2>店舗情報・テーマ</h2>
      <span class="tag">モバイル前提のテンプレ</span>
    </div>
    <form class="form-grid">
      <label class="field">
        <span>サイト名</span>
        <input id="siteName" value="${appState.siteName}" />
      </label>
      <label class="field">
        <span>タグライン</span>
        <input id="tagline" value="${appState.tagline}" />
      </label>
      <label class="field">
        <span>サブコピー</span>
        <textarea id="subcopy">${appState.subcopy}</textarea>
      </label>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 8px;">
        <label class="field"><span>プライマリ</span><input id="primary" value="${appState.theme.primary}" /></label>
        <label class="field"><span>アクセント</span><input id="accent" value="${appState.theme.accent}" /></label>
        <label class="field"><span>背景</span><input id="bg" value="${appState.theme.bg}" /></label>
      </div>
    </form>
  `;
}

function renderCtaPanel() {
  const el = document.getElementById('panel-cta');
  el.innerHTML = `
    <div class="section-header">
      <h2>予約導線 / 固定フッターCTA</h2>
      <span class="tag">LINE / 電話 / 予約 URL</span>
    </div>
    <form class="form-grid">
      <label class="field"><span>予約ボタンラベル</span><input id="cta-booking-label" value="${appState.cta.booking.label}" /></label>
      <label class="field"><span>予約URL</span><input id="cta-booking-url" value="${appState.cta.booking.url}" /></label>
      <label class="field"><span>LINEラベル</span><input id="cta-line-label" value="${appState.cta.line.label}" /></label>
      <label class="field"><span>LINE URL</span><input id="cta-line-url" value="${appState.cta.line.url}" /></label>
      <label class="field"><span>電話ラベル</span><input id="cta-call-label" value="${appState.cta.call.label}" /></label>
      <label class="field"><span>電話番号</span><input id="cta-call-tel" value="${appState.cta.call.tel}" /></label>
      <label class="field"><span>本日の空き</span><input id="availability-note" value="${appState.availability.note}" /></label>
      <div class="button-row">
        <button type="button" id="toggle-availability">${appState.availability.hasSlotsToday ? '空き表示をOFF' : '空き表示をON'}</button>
        <button type="button" id="reset-links">短縮URL/QRを再生成</button>
      </div>
      <p class="small">本日の空きをONにすると、公開ページの固定フッターCTAが強調されます。</p>
    </form>
  `;
}

function renderPostsPanel() {
  const el = document.getElementById('panel-posts');
  const list = appState.posts.map((p, idx) => `
    <div class="card" style="margin-bottom:8px;">
      <div class="section-header"><strong>${p.title}</strong><span class="tag">${p.created}</span></div>
      <p class="small">タグ: ${p.tags.join(', ')} ｜ CTA: ${p.cta} ｜ 実績: ${p.result}</p>
      <button type="button" data-idx="${idx}" class="btn secondary" style="padding:8px 10px;">削除</button>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="section-header">
      <h2>施術例投稿（スマホ運用）</h2>
      <span class="tag">写真複数 / CTA連動</span>
    </div>
    <div id="post-list">${list || '<p class="small">まだ投稿がありません</p>'}</div>
    <div class="card" style="margin-top:10px;">
      <h3 style="margin:0 0 8px;">新規投稿</h3>
      <form class="form-grid" id="post-form">
        <label class="field"><span>タイトル</span><input id="post-title" required /></label>
        <label class="field"><span>タグ（カンマ区切り）</span><input id="post-tags" placeholder="美容室,カラー" /></label>
        <label class="field"><span>画像URL（カンマ区切り）</span><input id="post-media" placeholder="../assets/placeholder.svg" /></label>
        <label class="field"><span>CTA表示</span><input id="post-cta" value="予約する" /></label>
        <label class="field"><span>実績メモ</span><input id="post-result" value="予約導線改善" /></label>
        <div class="button-row">
          <button type="submit" class="btn">投稿を追加</button>
        </div>
      </form>
    </div>
  `;

  el.querySelectorAll('button[data-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      appState.posts.splice(idx, 1);
      renderPostsPanel();
    });
  });

  const form = document.getElementById('post-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPost = {
      title: document.getElementById('post-title').value || '新規投稿',
      tags: (document.getElementById('post-tags').value || '').split(',').map((s) => s.trim()).filter(Boolean),
      media: (document.getElementById('post-media').value || '../assets/placeholder.svg').split(',').map((s) => s.trim()).filter(Boolean),
      cta: document.getElementById('post-cta').value || '予約する',
      result: document.getElementById('post-result').value || '導線強化',
      created: new Date().toISOString().slice(0, 10)
    };
    appState.posts.unshift(newPost);
    renderPostsPanel();
  });
}

function renderFaqPanel() {
  const el = document.getElementById('panel-faq');
  const list = appState.faq.map((item, idx) => `
    <div class="faq-item">
      <div class="section-header"><strong>${item.q}</strong><button data-idx="${idx}" class="btn secondary" style="padding:6px 8px;">削除</button></div>
      <p class="small">${item.a}</p>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="section-header">
      <h2>FAQ（解約理由つぶし）</h2>
      <span class="tag">テンプレ＋編集可</span>
    </div>
    <div id="faq-list">${list || '<p class="small">まだFAQがありません</p>'}</div>
    <form class="form-grid" id="faq-form" style="margin-top:8px;">
      <label class="field"><span>質問</span><input id="faq-q" required /></label>
      <label class="field"><span>回答</span><textarea id="faq-a" required></textarea></label>
      <div class="button-row"><button class="btn" type="submit">FAQを追加</button></div>
    </form>
  `;

  el.querySelectorAll('button[data-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      appState.faq.splice(idx, 1);
      renderFaqPanel();
    });
  });

  const form = document.getElementById('faq-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    appState.faq.push({
      q: document.getElementById('faq-q').value,
      a: document.getElementById('faq-a').value
    });
    renderFaqPanel();
  });
}

function switchTab(id) {
  renderTabs(id);
  ['site', 'cta', 'posts', 'faq'].forEach((panel) => {
    document.getElementById(`panel-${panel}`).style.display = panel === id ? 'block' : 'none';
  });
}

function bindSave(defaults) {
  document.getElementById('save').addEventListener('click', () => {
    appState.siteName = document.getElementById('siteName').value;
    appState.tagline = document.getElementById('tagline').value;
    appState.subcopy = document.getElementById('subcopy').value;
    appState.theme = {
      primary: document.getElementById('primary').value,
      accent: document.getElementById('accent').value,
      bg: document.getElementById('bg').value
    };

    appState.cta.booking.label = document.getElementById('cta-booking-label').value;
    appState.cta.booking.url = document.getElementById('cta-booking-url').value;
    appState.cta.line.label = document.getElementById('cta-line-label').value;
    appState.cta.line.url = document.getElementById('cta-line-url').value;
    appState.cta.call.label = document.getElementById('cta-call-label').value;
    appState.cta.call.tel = document.getElementById('cta-call-tel').value;
    appState.availability.note = document.getElementById('availability-note').value;

    saveState(appState);
    alert('保存しました。公開ページを更新すると反映されます。');
  });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'toggle-availability') {
      appState.availability.hasSlotsToday = !appState.availability.hasSlotsToday;
      renderCtaPanel();
    }
    if (e.target.id === 'reset-links') {
      appState.shortLinks.shortUrl = defaults.shortLinks.shortUrl;
      appState.shortLinks.qrLabel = defaults.shortLinks.qrLabel;
      renderCtaPanel();
    }
  });
}

async function init() {
  const defaults = await loadDefaults();
  appState = loadState(defaults);
  renderTabs('site');
  renderSitePanel();
  renderCtaPanel();
  renderPostsPanel();
  renderFaqPanel();
  switchTab('site');
  bindSave(defaults);
}

init();
