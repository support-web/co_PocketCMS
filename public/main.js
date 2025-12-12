const STORAGE_KEY = 'pocketcms-site-data';

async function loadSiteData() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.warn('Failed to parse cached site data', err);
    }
  }
  const res = await fetch('data/sample-site.json');
  return res.json();
}

function renderMenu(menu) {
  const table = document.getElementById('menu-table');
  table.innerHTML = '';
  menu.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.title}</strong><br><span class="small">${item.duration}</span></td>
      <td>${item.price}</td>
      <td class="small">${item.desc}</td>
    `;
    table.appendChild(row);
  });
}

function renderQr(shortLinks) {
  const qr = document.getElementById('qr-box');
  qr.innerHTML = `
    <div style="font-weight:700;">${shortLinks.qrLabel}</div>
    <div style="font-size:28px; margin:8px 0;">▩▩▩</div>
    <div class="small">QRはデバイスに自動保存 / 店頭掲示用</div>
    <div class="small" style="margin-top:6px;">短縮URL: <strong>${shortLinks.shortUrl}</strong></div>
  `;
}

function renderAvailability({ hasSlotsToday, note }) {
  const container = document.getElementById('availability');
  if (!hasSlotsToday) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="card" style="border-color: var(--accent);">
      <div class="section-header">
        <h2>本日の空き</h2>
        <span class="tag" style="background: rgba(14,165,233,0.2); color: #9de3ff;">強調表示中</span>
      </div>
      <p style="margin: 4px 0;">${note}</p>
      <p class="small">予約導線に連動して固定フッターも強調されます。</p>
    </div>
  `;
}

function renderPosts(posts) {
  const container = document.getElementById('posts');
  container.innerHTML = '';
  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'card';
    const tags = post.tags.map((t) => `<span class="pill">${t}</span>`).join('');
    const images = post.media.map((src) => `<img src="${src}" alt="${post.title}" />`).join('');
    card.innerHTML = `
      <header>
        <div>
          <h2 style="margin:0 0 6px;">${post.title}</h2>
          <div class="list-inline">${tags}</div>
        </div>
        <span class="tag">${post.created}</span>
      </header>
      <div class="media-strip">${images}</div>
      <p class="small" style="margin:6px 0;">CTA: ${post.cta} ｜ 実績: ${post.result}</p>
      <button class="btn" style="width:100%; border:none; border-radius:12px; padding:10px; background:linear-gradient(135deg, var(--primary), var(--accent)); color:#0b1f33; font-weight:700;">${post.cta} を開く</button>
    `;
    container.appendChild(card);
  });
}

function renderStaff(staff) {
  const tags = document.getElementById('staff-tags');
  tags.innerHTML = staff.map((s) => `<span class="pill">${s.role}</span>`).join('');

  const list = document.getElementById('staff-list');
  list.innerHTML = '';
  staff.forEach((member) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3 style="margin:0 0 4px;">${member.name}</h3>
      <p class="small" style="margin:0 0 6px;">${member.role}</p>
      <p style="margin:0; color: var(--muted);">${member.bio}</p>
    `;
    list.appendChild(card);
  });
}

function renderAccess(access) {
  const table = document.getElementById('access-table');
  table.innerHTML = `
    <tr><td>住所</td><td>${access.address}</td></tr>
    <tr><td>営業時間</td><td>${access.hours}</td></tr>
    <tr><td>マップ</td><td class="small">${access.mapEmbed}</td></tr>
  `;
}

function renderFaq(faq) {
  const list = document.getElementById('faq-list');
  list.innerHTML = '';
  faq.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'faq-item';
    el.innerHTML = `
      <h3>${item.q}</h3>
      <p>${item.a}</p>
    `;
    list.appendChild(el);
  });
}

function renderAnalytics(analytics) {
  const container = document.getElementById('analytics');
  container.innerHTML = '';
  const metrics = [
    { label: '予約ボタン', value: analytics.ctaClicks.booking, hint: '固定フッター CTA' },
    { label: 'LINEタップ', value: analytics.ctaClicks.line, hint: '無料相談や友だち登録' },
    { label: '電話タップ', value: analytics.ctaClicks.call, hint: 'ワンタップ発信' },
    { label: 'Instagram流入', value: analytics.traffic.instagram + '%', hint: '全体比' },
    { label: 'Googleマップ流入', value: analytics.traffic.maps + '%', hint: '全体比' },
    { label: '直接/その他', value: analytics.traffic.direct + '%', hint: '全体比' }
  ];

  metrics.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'metric';
    card.innerHTML = `
      <div class="label">${m.hint}</div>
      <div class="value">${m.value}</div>
      <div class="label">${m.label}</div>
    `;
    container.appendChild(card);
  });
}

function renderCtaFooter(cta, hasSlotsToday) {
  const footer = document.getElementById('cta-footer');
  footer.innerHTML = '';
  const slotBadge = hasSlotsToday ? '<span class="tag" style="background: rgba(34, 197, 94, 0.2); color:#9ef5c1;">本日の空き</span>' : '';

  const booking = document.createElement('a');
  booking.className = 'btn';
  booking.href = cta.booking.url;
  booking.textContent = cta.booking.label;
  booking.style.position = 'relative';
  if (hasSlotsToday) {
    const pulse = document.createElement('span');
    pulse.textContent = '●';
    pulse.style.position = 'absolute';
    pulse.style.left = '8px';
    pulse.style.color = 'lime';
    booking.appendChild(pulse);
  }

  const line = document.createElement('a');
  line.className = 'btn secondary';
  line.href = cta.line.url;
  line.textContent = cta.line.label;

  const call = document.createElement('a');
  call.className = 'btn secondary';
  call.href = `tel:${cta.call.tel}`;
  call.textContent = cta.call.label;

  footer.append(slotBadge, booking, line, call);
}

function renderHeader(site) {
  document.getElementById('badge').textContent = 'スマホ更新 / 固定CTA / 予約導線';
  document.getElementById('site-title').textContent = site.siteName;
  document.getElementById('site-tagline').textContent = site.tagline;
  document.getElementById('site-subcopy').textContent = site.subcopy;
}

function applyTheme(theme) {
  if (!theme) return;
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--bg', theme.bg);
}

async function init() {
  const data = await loadSiteData();
  applyTheme(data.theme);
  renderHeader(data);
  renderMenu(data.menu);
  renderQr(data.shortLinks);
  renderAvailability(data.availability);
  renderPosts(data.posts);
  renderStaff(data.staff);
  renderAccess(data.access);
  renderFaq(data.faq);
  renderAnalytics(data.analytics);
  renderCtaFooter(data.cta, data.availability.hasSlotsToday);
}

init();
