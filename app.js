/* ============================================================
   研鑽 KENSAN — app logic
   A study dojo that activates 4 drivers:
   MOTIVATION / DISCIPLINE / OBSESSION / EGO
   ============================================================ */

(() => {
  'use strict';

  /* ---------------- constants ---------------- */
  const KEY = 'kensan_state_v1';
  const AVATARS = ['🔥', '🥷', '🦊', '🐺', '🦅', '🦉', '🧠', '⚔️', '🌙', '🐉', '🧘', '🚀'];
  const TITLES = [
    { lv: 1,  name: '見習い',   en: 'APPRENTICE' },
    { lv: 3,  name: '学徒',     en: 'DISCIPLE' },
    { lv: 5,  name: '研究者',   en: 'RESEARCHER' },
    { lv: 8,  name: '学者',     en: 'SCHOLAR' },
    { lv: 12, name: '賢者',     en: 'SAGE' },
    { lv: 17, name: '伝説',     en: 'LEGEND' },
  ];
  const DRIVERS = [
    { key: 'motivation', name: '意欲',   en: 'MOTIVATION', icon: '🔥', color: 'var(--motivation)', desc: '「なぜ」を思い出すほど、動き出す力が強まる。' },
    { key: 'discipline', name: '規律',   en: 'DISCIPLINE', icon: '🧊', color: 'var(--discipline)', desc: '途切れさせない仕組み。習慣が意志を代行する。' },
    { key: 'obsession',  name: '執着',   en: 'OBSESSION',  icon: '🌀', color: 'var(--obsession)',  desc: '連続・コンボ・記録。やめられなくなるループ。' },
    { key: 'ego',        name: '自我',   en: 'EGO',        icon: '👑', color: 'var(--ego)',       desc: '称号と順位。自分の名を高めたい欲を燃料に。' },
  ];
  const TAUNTS = [
    '「その程度で満足してるの？ 私はまだ終わっていない。」',
    '「今日の私を超えられないなら、明日も超えられないぞ。」',
    '「休憩は私が取る。お前は今、盤面に立っている。」',
    '「記録は裏切らない。お前の意志は裏切るだろう。」',
    '「隣の席の空白が、お前の分の成果を待っている。」',
    '「才能じゃない。回数だ。今の差は、そのまま積み上がる。」',
    '「名前を出すのが怖いなら、出るほど勉強しろ。」',
    '「今ここで止めれば、この選択は明日も続く。」',
  ];
  const RIVALS = [
    { name: '影山 蓮', avatar: '🥷', title: '修羅', base: 138 },
    { name: '北斗',   avatar: '🐺', title: '鬼',   base: 116 },
    { name: '千夜',   avatar: '🦉', title: '夜型', base: 94 },
    { name: 'Mika',   avatar: '🦊', title: '才女', base: 78 },
    { name: 'SORA',   avatar: '🦅', title: '野心家', base: 61 },
    { name: '無名',   avatar: '🌑', title: '?',    base: 40 },
  ];
  const SHOP = [
    { id: 'shield', icon: '🛡️', name: '連続シールド', price: 120, desc: '明日学習できなくても、連続日数を1回だけ守る。' },
    { id: 'boost',  icon: '⚡', name: '倍率ブースト', price: 180, desc: '次の集中セッションの獲得XPが2倍になる。' },
    { id: 'ticket', icon: '🎟️', name: 'ご褒美チケット', price: 80,  desc: '罪悪感なしで30分、何もしないことを許す。' },
    { id: 'tome',   icon: '📜', name: '自己啓発の書', price: 300, desc: '規律を永久に+3。一度きりの投資。' },
    { id: 'incense',icon: '🕯️', name: '集中の香', price: 60,  desc: '意欲を+2。小さな儀式が集中のスイッチを入れる。' },
    { id: 'crown',  icon: '👑', name: '王冠の勲章', price: 500, desc: '自我を+5。自分の名に誇りを持て。' },
  ];

  /* ---------------- default state ---------------- */
  function defaultState() {
    return {
      version: 1,
      onboarded: false,
      profile: { name: '修行者', why: '将来の自分を誇れるように。', avatar: '🔥' },
      stats: {
        xp: 0, gold: 60,
        totalMinutes: 0, totalSessions: 0, tasksDone: 0,
        streak: 0, longestStreak: 0, lastStudyDate: null,
        combo: 0, bestCombo: 0, comboDate: null,
        shields: 0, boost: false, tickets: 0, tomes: 0,
        lastActiveDate: null,
      },
      drivers: { motivation: 50, discipline: 45, obsession: 40, ego: 50 },
      history: {},
      tasks: [],
      questsClaimed: {},
      focus: { mode: 'focus', minutes: 25, remaining: 25 * 60, running: false, endAt: null, intent: '' },
      settings: { sound: true, notify: false, focusMin: 25, breakMin: 5, longBreakMin: 15 },
      view: 'home',
    };
  }

  let state = load();
  let modalOptions = { closable: true };
  let lastTickSave = 0;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base, ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
        stats: { ...base.stats, ...(parsed.stats || {}) },
        drivers: { ...base.drivers, ...(parsed.drivers || {}) },
        focus: { ...base.focus, ...(parsed.focus || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
        history: parsed.history || {},
        tasks: parsed.tasks || [],
        questsClaimed: parsed.questsClaimed || {},
      };
    } catch (e) {
      console.warn('load failed', e);
      return defaultState();
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  }

  /* ---------------- helpers ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayNum = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  };
  const keysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return todayKey(d); };
  const todayStats = () => {
    const k = todayKey();
    return state.history[k] || (state.history[k] = { minutes: 0, sessions: 0, tasks: 0, xp: 0, morning: 0 });
  };
  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const comboMult = () => 1 + Math.min(state.stats.combo, 10) * 0.1;

  function levelInfo() {
    const xp = state.stats.xp;
    const level = Math.floor(xp / 200) + 1;
    const into = xp % 200;
    let title = TITLES[0];
    for (const t of TITLES) if (level >= t.lv) title = t;
    return { level, into, need: 200, title, pct: (into / 200) * 100 };
  }
  function nextTitle() {
    const lv = levelInfo().level;
    return TITLES.find((t) => t.lv > lv) || null;
  }

  function toast(msg) {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
  }
  function particles(emoji, count = 12) {
    const root = $('#fx-root');
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'particle';
      el.textContent = emoji;
      el.style.left = (35 + Math.random() * 30) + '%';
      el.style.top = (35 + Math.random() * 25) + '%';
      el.style.animationDelay = (Math.random() * 0.35) + 's';
      root.appendChild(el);
      setTimeout(() => el.remove(), 1900);
    }
  }
  function chime() {
    if (!state.settings.sound) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        const t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.13, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.6);
      });
      setTimeout(() => ctx.close(), 1500);
    } catch (e) { /* ignore */ }
  }
  function notify(title, body) {
    if (!state.settings.notify) return;
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification(title, { body });
    } catch (e) { /* ignore */ }
  }

  function boostDriver(key, amount) {
    state.drivers[key] = clamp(state.drivers[key] + amount, 0, 100);
  }
  function applyDecay() {
    if (!state.stats.lastActiveDate) { state.stats.lastActiveDate = todayKey(); return; }
    const gap = dayNum(todayKey()) - dayNum(state.stats.lastActiveDate);
    if (gap > 1) {
      const loss = Math.min(12, gap - 1);
      DRIVERS.forEach((d) => { state.drivers[d.key] = Math.max(10, state.drivers[d.key] - loss); });
      setTimeout(() => toast(`${gap - 1}日空いた。四つの力が ${loss} ずつ衰えた…`), 700);
    }
    state.stats.lastActiveDate = todayKey();
    if (state.stats.comboDate && state.stats.comboDate !== todayKey()) state.stats.combo = 0;
  }

  /* ---------------- timer ---------------- */
  function modeMinutes(mode) {
    return mode === 'focus' ? state.settings.focusMin
      : mode === 'short' ? state.settings.breakMin
      : state.settings.longBreakMin;
  }
  function setMode(mode) {
    if (state.focus.running) { toast('集中中はモードを切り替えられません'); return; }
    state.focus.mode = mode;
    state.focus.minutes = modeMinutes(mode);
    state.focus.remaining = modeMinutes(mode) * 60;
    save(); renderAll();
  }
  function startTimer() {
    if (state.focus.running) return;
    if (state.focus.remaining <= 0) state.focus.remaining = state.focus.minutes * 60;
    state.focus.endAt = Date.now() + state.focus.remaining * 1000;
    state.focus.running = true;
    save(); renderAll();
  }
  function pauseTimer() {
    if (!state.focus.running) return;
    state.focus.remaining = Math.max(0, Math.ceil((state.focus.endAt - Date.now()) / 1000));
    state.focus.running = false;
    state.focus.endAt = null;
    save(); renderAll();
  }
  function resetTimer(silent = false) {
    state.focus.running = false;
    state.focus.endAt = null;
    state.focus.remaining = state.focus.minutes * 60;
    save();
    if (!silent) renderAll();
  }
  function giveUp() {
    if (state.focus.mode === 'focus') {
      state.stats.combo = 0;
      boostDriver('discipline', -3);
      boostDriver('obsession', -5);
      toast('コンボが途切れた。規律 -3 / 執着 -5');
    }
    resetTimer();
  }
  function completeSession() {
    const wasFocus = state.focus.mode === 'focus';
    const minutes = state.focus.minutes;
    resetTimer(true);

    if (!wasFocus) {
      boostDriver('motivation', 1);
      toast('休憩完了。集中の燃料を補給した。');
      renderAll();
      return;
    }

    const s = state.stats;
    if (s.comboDate !== todayKey()) { s.combo = 0; s.comboDate = todayKey(); }
    const mult = comboMult();
    const boost = s.boost ? 2 : 1;
    const xpGain = Math.round(minutes * 2 * mult * boost);
    const goldGain = Math.round(minutes * 1.2 * mult);
    const levelBefore = levelInfo().level;

    s.xp += xpGain;
    s.gold += goldGain;
    s.totalSessions += 1;
    s.totalMinutes += minutes;
    s.combo += 1;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    s.boost = false;

    const t = todayStats();
    t.sessions += 1;
    t.minutes += minutes;
    t.xp += xpGain;
    if (new Date().getHours() < 12) t.morning += 1;

    // streak
    const today = todayKey();
    if (s.lastStudyDate !== today) {
      if (!s.lastStudyDate) s.streak = 1;
      else {
        const gap = dayNum(today) - dayNum(s.lastStudyDate);
        if (gap === 1) s.streak += 1;
        else if (s.shields > 0) { s.shields -= 1; toast('🛡️ シールドが連続記録を守った！'); }
        else s.streak = 1;
      }
      s.lastStudyDate = today;
      s.longestStreak = Math.max(s.longestStreak, s.streak);
    }

    boostDriver('motivation', 2);
    boostDriver('discipline', 3);
    boostDriver('obsession', 2 + Math.min(3, s.combo));
    boostDriver('ego', 1 + (levelInfo().level > levelBefore ? 5 : 0));

    checkQuests();
    save();
    chime();
    notify('研鑽 — セッション完了', `+${xpGain} XP  /  +${goldGain} 金貨  /  コンボ x${comboMult().toFixed(1)}`);
    particles('🔥', 14);
    renderAll();

    openModal(`
      <div class="celebrate">
        <div class="big-icon">🔥</div>
        <h2>${minutes}分、斬り切った。</h2>
        <p class="sub">${esc(state.profile.name)} — ${levelInfo().title.name}・Lv.${levelInfo().level}</p>
        <div class="reward-line">
          <div><strong>+${xpGain}</strong><small>XP</small></div>
          <div><strong>+${goldGain}</strong><small>金貨</small></div>
          <div><strong>x${comboMult().toFixed(1)}</strong><small>コンボ</small></div>
          <div><strong>${s.streak}日</strong><small>連続</small></div>
        </div>
        <p class="muted" style="font-size:12px">${nextTitle() ? `次の称号「${nextTitle().name}」まであと ${nextTitle().lv - levelInfo().level} レベル。` : 'すでに伝説。その名は語り継がれる。'}</p>
        <div class="modal-actions center" style="justify-content:center">
          <button class="btn primary" data-action="continue-after-session">次の集中へ</button>
          <button class="btn ghost" data-action="close-modal">一度泥を落とす</button>
        </div>
      </div>
    `);
  }

  /* ---------------- quests ---------------- */
  const QUESTS = [
    { id: 'sessions', title: '集中セッションを3回完了する', target: 3, xp: 60, gold: 40, driver: 'discipline', get: () => todayStats().sessions },
    { id: 'minutes',  title: '合計50分、集中する', target: 50, xp: 80, gold: 50, driver: 'obsession', get: () => todayStats().minutes },
    { id: 'tasks',    title: '学習タスクを2つ片付ける', target: 2, xp: 70, gold: 45, driver: 'motivation', get: () => todayStats().tasks },
    { id: 'combo',    title: 'コンボ x1.3 に到達する', target: 3, xp: 90, gold: 60, driver: 'obsession', get: () => state.stats.combo },
    { id: 'morning',  title: '午前中に1セッション終わらせる', target: 1, xp: 50, gold: 35, driver: 'ego', get: () => todayStats().morning },
  ];
  function claimedList() {
    const k = todayKey();
    return state.questsClaimed[k] || (state.questsClaimed[k] = []);
  }
  function checkQuests() {
    QUESTS.forEach((q) => {
      if (q.get() >= q.target && !claimedList().includes(q.id)) {
        toast(`✦ 試練達成：「${q.title}」— 報酬を受け取れる`);
      }
    });
  }
  function claimQuest(id) {
    const q = QUESTS.find((x) => x.id === id);
    if (!q || q.get() < q.target) return;
    const claimed = claimedList();
    if (claimed.includes(id)) return;
    claimed.push(id);
    state.stats.xp += q.xp;
    state.stats.gold += q.gold;
    boostDriver(q.driver, 5);
    save(); particles('✦', 8); chime();
    toast(`+${q.xp} XP / +${q.gold} 金貨 を獲得`);
    renderAll();
  }

  /* ---------------- rival board ---------------- */
  function leaderboard() {
    const t = todayStats();
    const n = dayNum(todayKey());
    const rivals = RIVALS.map((r, i) => ({
      ...r, minutes: Math.max(15, r.base + ((n * 7 + i * 13) % 41) - 20), me: false,
    }));
    const list = [{ name: state.profile.name, avatar: state.profile.avatar, title: levelInfo().title.name, minutes: t.minutes, me: true }, ...rivals];
    list.sort((a, b) => b.minutes - a.minutes);
    return list;
  }
  function taunt() {
    const rank = leaderboard().findIndex((x) => x.me) + 1;
    const idx = (dayNum(todayKey()) + rank * 3) % TAUNTS.length;
    return TAUNTS[idx];
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderTopbar() {
    const li = levelInfo();
    $('#level-badge').textContent = `Lv.${li.level}`;
    $('#level-title').textContent = li.title.name;
    $('#xp-fill').style.width = li.pct + '%';
    $('#xp-label').textContent = `${li.into} / ${li.need} XP`;
    $('#streak-val').textContent = state.stats.streak;
    $('#combo-val').textContent = 'x' + comboMult().toFixed(1);
    $('#gold-val').textContent = state.stats.gold;
    $('#side-avatar').textContent = state.profile.avatar;
    $('#side-name').textContent = state.profile.name;
    $('#side-title').textContent = li.title.name;
  }
  function renderDriverMini() {
    $('#driver-mini').innerHTML = DRIVERS.map((d) => `
      <div style="margin-bottom:7px">
        <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-bottom:3px">
          <span>${d.icon} ${d.name}</span><span class="mono">${Math.round(state.drivers[d.key])}</span>
        </div>
        <div style="height:3px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden">
          <i style="display:block;height:100%;width:${state.drivers[d.key]}%;background:${d.color}"></i>
        </div>
      </div>`).join('');
  }
  function renderNav() {
    document.querySelectorAll('[data-view]').forEach((el) => {
      if (el.dataset.action === 'nav') el.classList.toggle('active', el.dataset.view === state.view);
    });
  }
  function renderAll() {
    renderTopbar();
    renderDriverMini();
    renderNav();
    const view = $('#view');
    const renders = { home: viewHome, focus: viewFocus, quests: viewQuests, rank: viewRank, shop: viewShop };
    view.innerHTML = `<div class="view">${(renders[state.view] || viewHome)()}</div>`;
    if (state.view === 'focus') updateTimerDom();
  }
  function go(view) {
    state.view = view;
    save(); renderAll();
    $('#view').scrollTop = 0;
  }

  /* ---------- HOME ---------- */
  function viewHome() {
    const li = levelInfo();
    const t = todayStats();
    const target = 4;
    const pct = Math.min(100, (t.sessions / target) * 100);
    const rank = leaderboard().findIndex((x) => x.me) + 1;
    const openTasks = state.tasks.filter((x) => !x.done).slice(0, 3);

    const questRows = QUESTS.slice(0, 3).map((q) => questRowHtml(q)).join('');
    const heat = heatmapHtml(11);

    return `
      <div class="hero">
        <div>
          <div class="hero-eyebrow">WELCOME BACK, ${esc(state.profile.name).toUpperCase()}</div>
          <h1 class="hero-name">今日も、<span class="accent">${li.title.name}</span>として<br>胸を張れる一日に。</h1>
          <div class="hero-title-line">Lv.${li.level} ${li.title.en} ・ 連続 ${state.stats.streak} 日 ・ 通算 ${state.stats.totalSessions} セッション</div>
          <div class="hero-why">
            <span class="quote">“</span>
            <div><p>${esc(state.profile.why)}</p><small>MY REASON — 迷ったら、ここに戻ってこい</small></div>
          </div>
          <div class="hero-actions">
            <button class="btn hero-cta" data-action="start-focus">▶ ${state.focus.running ? '集中を再開する' : '集中を始める'}</button>
            <button class="btn" data-action="nav" data-view="quests">✦ 今日の試練</button>
            <button class="btn ghost" data-action="ego-card">👑 名刺を見る</button>
          </div>
        </div>
        <div class="hero-side">
          <div class="card" style="background:rgba(0,0,0,.2)">
            <div class="daily-ring-wrap">
              <div class="ring" style="--p:${pct}"><div class="ring-inner"><strong>${t.sessions}<span style="font-size:12px;color:var(--muted)">/${target}</span></strong><span>TODAY</span></div></div>
              <div class="daily-info">
                <h4>今日のノルマ</h4>
                <p>あと <span class="big">${Math.max(0, target - t.sessions)}</span> セッションで<br>一日が完成する。</p>
                <div class="tag">🔥 ${t.minutes}分 集中済み</div>
              </div>
            </div>
          </div>
          <div class="card" style="background:linear-gradient(135deg,rgba(70,201,255,.08),rgba(0,0,0,.2))">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <span style="font-size:11px;color:var(--muted)">ライバルとの差</span>
              <span class="tag">現在 <b style="color:var(--ego)">${rank}位</b></span>
            </div>
            <p style="margin:0;font-size:12px;line-height:1.6">${taunt()}</p>
            <button class="btn small ghost" style="margin-top:12px" data-action="nav" data-view="rank">順位表を見る →</button>
          </div>
        </div>
      </div>

      <div class="section-title" style="--accent:var(--motivation)"><h3>四つのエンジン</h3><span class="hint">学習を回す4つの欲</span></div>
      <div class="drivers-grid">
        ${DRIVERS.map((d) => `
          <div class="driver-card" style="--c:${d.color}">
            <div class="driver-head">
              <div><div class="driver-icon">${d.icon}</div><div class="driver-name">${d.name} <span class="driver-en">${d.en}</span></div></div>
              <div class="driver-score">${Math.round(state.drivers[d.key])}</div>
            </div>
            <div class="driver-bar"><i style="width:${state.drivers[d.key]}%"></i></div>
            <div class="driver-desc">${d.desc}</div>
          </div>`).join('')}
      </div>

      <div class="section-title" style="--accent:var(--discipline)"><h3>今日の試練</h3><button class="btn small ghost" data-action="nav" data-view="quests">すべて見る →</button></div>
      <div class="card">${questRows}</div>

      <div class="cols-2" style="margin-top:18px">
        <div class="card">
          <div class="section-title" style="--accent:var(--obsession);margin:0 0 14px"><h3>執着の記録</h3><span class="hint">直近11週間</span></div>
          ${heat}
          <div class="stat-grid" style="margin-top:16px;grid-template-columns:repeat(3,1fr)">
            <div class="stat-box"><div class="label">連続</div><div class="value" style="color:var(--motivation)">${state.stats.streak}</div><div class="sub">日</div></div>
            <div class="stat-box"><div class="label">最長</div><div class="value" style="color:var(--obsession)">${state.stats.longestStreak}</div><div class="sub">日</div></div>
            <div class="stat-box"><div class="label">コンボ</div><div class="value" style="color:var(--ego)">${state.stats.bestCombo}</div><div class="sub">最高</div></div>
          </div>
        </div>
        <div class="card">
          <div class="section-title" style="--accent:var(--motivation);margin:0 0 14px"><h3>次の一手</h3><button class="btn small ghost" data-action="nav" data-view="quests">管理 →</button></div>
          ${openTasks.length ? openTasks.map((task) => `
            <div class="task-row">
              <button class="task-check" data-action="toggle-task" data-id="${task.id}">✓</button>
              <div class="task-body"><div class="task-title">${esc(task.title)}</div><div class="task-meta"><span>${esc(task.subject)}</span><span class="diff-${task.difficulty}">${'★'.repeat(task.difficulty)}</span></div></div>
            </div>`).join('') : '<div class="empty"><span class="emoji">📝</span><p>まだ課題がありません。<br>今の自分に、次の一手を与えろ。</p><button class="btn small primary" data-action="nav" data-view="quests">課題を追加</button></div>'}
          <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">
            <div style="font-size:11px;color:var(--muted);margin-bottom:8px">所有アイテム</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span class="tag">🛡️ シールド ${state.stats.shields}</span>
              <span class="tag">⚡ ブースト ${state.stats.boost ? 'ON' : 'OFF'}</span>
              <span class="tag">🎟️ チケット ${state.stats.tickets}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function questRowHtml(q) {
    const p = Math.min(q.target, q.get());
    const done = p >= q.target;
    const claimed = claimedList().includes(q.id);
    return `
      <div class="quest-row ${claimed ? 'done' : ''}">
        <div class="quest-check">✓</div>
        <div class="quest-body">
          <div class="quest-title">${esc(q.title)}</div>
          <div class="quest-progress"><i style="width:${(p / q.target) * 100}%"></i></div>
        </div>
        <div style="text-align:right">
          <div class="quest-reward">+${q.xp} XP · +${q.gold} ◈</div>
          ${claimed ? '<div class="dim" style="font-size:10px">受取済み</div>'
            : done ? `<button class="btn small primary" style="margin-top:5px" data-action="claim-quest" data-id="${q.id}">受け取る</button>`
            : `<div class="dim" style="font-size:10px">${p} / ${q.target}</div>`}
        </div>
      </div>`;
  }
  function heatmapHtml(weeks) {
    const totalDays = weeks * 7;
    const start = new Date();
    start.setDate(start.getDate() - (totalDays - 1));
    // align to Sunday
    start.setDate(start.getDate() - start.getDay());
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const k = todayKey(d);
      const h = state.history[k];
      const m = h ? h.minutes : 0;
      const lv = m === 0 ? 0 : m < 25 ? 1 : m < 50 ? 2 : m < 100 ? 3 : 4;
      cells.push(`<div class="heat-cell" data-lv="${lv}" title="${k} · ${m}分"></div>`);
    }
    return `<div class="heatmap">${cells.join('')}</div>
      <div class="heat-legend">少 <i data-lv="1" style="background:rgba(181,107,255,.28)"></i><i style="background:rgba(181,107,255,.5)"></i><i style="background:rgba(181,107,255,.75)"></i><i style="background:#b56bff"></i> 多</div>`;
  }

  /* ---------- FOCUS ---------- */
  function viewFocus() {
    const f = state.focus;
    const modeName = f.mode === 'focus' ? '集中' : f.mode === 'short' ? '短い休憩' : '長い休憩';
    const color = f.mode === 'focus' ? 'var(--motivation)' : f.mode === 'short' ? 'var(--discipline)' : 'var(--obsession)';
    const t = todayStats();
    return `
      <div class="focus-layout">
        <div class="focus-stage">
          <div class="mode-tabs">
            <button class="mode-tab ${f.mode === 'focus' ? 'active' : ''}" data-action="mode" data-mode="focus">集中 ${state.settings.focusMin}分</button>
            <button class="mode-tab ${f.mode === 'short' ? 'active' : ''}" data-action="mode" data-mode="short">休憩 ${state.settings.breakMin}分</button>
            <button class="mode-tab ${f.mode === 'long' ? 'active' : ''}" data-action="mode" data-mode="long">長休憩 ${state.settings.longBreakMin}分</button>
          </div>
          <div class="timer-ring" id="timer-ring" style="--timer-c:${color}">
            <div class="timer-inner">
              <div class="timer-time" id="timer-time">${fmtTime(f.remaining)}</div>
              <div class="timer-status" id="timer-status">${f.running ? modeName + '中' : 'READY — 覚悟を決めろ'}</div>
              <div class="timer-combo">⚡ コンボ x${comboMult().toFixed(1)} · ${state.stats.streak}日連続</div>
            </div>
          </div>
          <div class="timer-controls">
            ${f.running
              ? `<button class="btn" data-action="pause">⏸ 一時停止</button><button class="btn ghost" data-action="give-up">諦める</button>`
              : `<button class="btn primary" data-action="start-timer">${f.remaining < f.minutes * 60 ? '▶ 再開する' : '▶ 開始する'}</button><button class="btn ghost" data-action="reset-timer">リセット</button>`}
          </div>
          <div class="focus-why">「${esc(state.profile.why)}」<br><strong>この時間が、未来のあなたの顔をつくる。</strong></div>
        </div>
        <div class="focus-side">
          <div class="card">
            <div class="section-title" style="--accent:var(--obsession);margin:0 0 12px"><h3>集中の的</h3></div>
            <input class="intent-input" id="intent-input" placeholder="例：英文法 第3章を攻略する" value="${esc(f.intent)}" data-action="intent" />
            <div class="dim" style="font-size:10px;margin-top:8px">何を攻めるか決めてから、タイマーを押せ。</div>
          </div>
          <div class="card">
            <div class="section-title" style="--accent:var(--discipline);margin:0 0 8px"><h3>今日の記録</h3></div>
            <div class="session-stat"><span>完了セッション</span><strong>${t.sessions} 回</strong></div>
            <div class="session-stat"><span>集中時間</span><strong>${t.minutes} 分</strong></div>
            <div class="session-stat"><span>獲得XP</span><strong class="gold-text">${t.xp}</strong></div>
            <div class="session-stat"><span>現在のコンボ</span><strong style="color:var(--obsession)">${state.stats.combo}</strong></div>
          </div>
          <div class="card">
            <div class="section-title" style="--accent:var(--motivation);margin:0 0 8px"><h3>報酬の予定</h3></div>
            <div class="session-stat"><span>獲得XP</span><strong class="gold-text">+${Math.round(state.settings.focusMin * 2 * comboMult() * (state.stats.boost ? 2 : 1))}</strong></div>
            <div class="session-stat"><span>獲得金貨</span><strong class="gold-text">+${Math.round(state.settings.focusMin * 1.2 * comboMult())}</strong></div>
            <div class="dim" style="font-size:10px;margin-top:10px">${state.stats.boost ? '⚡ ブースト適用中 — 今が稼ぎ時！' : 'コンボが続くほど報酬も膨らむ。'}</div>
          </div>
        </div>
      </div>
    `;
  }
  function updateTimerDom() {
    const timeEl = $('#timer-time');
    if (!timeEl) return;
    const f = state.focus;
    const total = f.minutes * 60;
    const pct = clamp(((total - f.remaining) / total) * 100, 0, 100);
    $('#timer-ring').style.setProperty('--p', pct.toFixed(2));
    timeEl.textContent = fmtTime(f.remaining);
    const status = $('#timer-status');
    if (status) status.textContent = f.running
      ? (f.mode === 'focus' ? '集中中 — 止めるな' : '休憩中 — 深呼吸しろ')
      : (f.remaining < total ? 'PAUSED — すぐ戻れ' : 'READY — 覚悟を決めろ');
  }

  /* ---------- QUESTS ---------- */
  function viewQuests() {
    const t = todayStats();
    return `
      <div class="stat-grid">
        <div class="stat-box"><div class="label">TODAY'S FOCUS</div><div class="value" style="color:var(--motivation)">${t.minutes}<span style="font-size:12px">分</span></div><div class="sub">今日の集中</div></div>
        <div class="stat-box"><div class="label">SESSIONS</div><div class="value" style="color:var(--discipline)">${t.sessions}</div><div class="sub">完了セッション</div></div>
        <div class="stat-box"><div class="label">TASKS CLEARED</div><div class="value" style="color:var(--obsession)">${t.tasks}</div><div class="sub">片付けた課題</div></div>
        <div class="stat-box"><div class="label">COMBO</div><div class="value" style="color:var(--ego)">x${comboMult().toFixed(1)}</div><div class="sub">現在の倍率</div></div>
      </div>

      <div class="section-title" style="--accent:var(--discipline)"><h3>今日の試練</h3><span class="hint">毎日リセットされる。取りこぼすな。</span></div>
      <div class="card">${QUESTS.map(questRowHtml).join('')}</div>

      <div class="cols-2" style="margin-top:18px">
        <div>
          <div class="section-title" style="--accent:var(--motivation)"><h3>学習タスク</h3><span class="hint">片付けろ</span></div>
          <div class="card">
            <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
              <input class="intent-input" id="new-task-title" placeholder="例：英単語 100個暗記" style="flex:2;min-width:160px" />
              <input class="intent-input" id="new-task-subject" placeholder="科目" style="flex:1;min-width:90px" />
              <select class="intent-input" id="new-task-diff" style="flex:0 0 92px">
                <option value="1">★ 易</option><option value="2" selected>★★ 中</option><option value="3">★★★ 難</option>
              </select>
              <button class="btn primary small" data-action="add-task">追加</button>
            </div>
            ${state.tasks.length ? state.tasks.map((task) => `
              <div class="task-row ${task.done ? 'done' : ''}">
                <button class="task-check" data-action="toggle-task" data-id="${task.id}">✓</button>
                <div class="task-body">
                  <div class="task-title">${esc(task.title)}</div>
                  <div class="task-meta"><span>${esc(task.subject || '科目なし')}</span><span class="diff-${task.difficulty}">${'★'.repeat(task.difficulty)}</span><span>予想 ${task.estimate} 回</span></div>
                </div>
                <button class="icon-btn" data-action="delete-task" data-id="${task.id}">✕</button>
              </div>`).join('') : '<div class="empty"><span class="emoji">📝</span><p>まだ課題がない。<br>まず、たった一つ書き出せ。</p></div>'}
          </div>
        </div>
        <div>
          <div class="section-title" style="--accent:var(--obsession)"><h3>継続の記録</h3></div>
          <div class="card">${heatmapHtml(15)}
            <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border);font-size:11.5px;color:var(--muted);line-height:1.7">
              一日空けるごとに、四つの力は少しずつ衰える。<br>
              シールドを持っていれば、その日は守られる。<br>
              <span class="gold-text">今のシールド：${state.stats.shields} 枚</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- RANK ---------- */
  function viewRank() {
    const li = levelInfo();
    const board = leaderboard();
    const myRank = board.findIndex((x) => x.me) + 1;
    return `
      <div class="cols-2">
        <div>
          <div class="section-title" style="--accent:var(--ego)"><h3>今日の ICC ランキング</h3><span class="hint">集中時間（分）で順位決定</span></div>
          <div class="card">
            ${board.map((r, i) => `
              <div class="rank-row ${r.me ? 'me' : ''}">
                <div class="rank-pos">${i + 1}</div>
                <div class="rank-avatar">${r.avatar}</div>
                <div class="rank-body"><div class="rank-name">${esc(r.name)} ${r.me ? '<span class="tag" style="margin-left:4px">YOU</span>' : ''}</div><div class="rank-sub">${esc(r.title)}</div></div>
                <div class="rank-score">${r.minutes}<small>分</small></div>
              </div>`).join('')}
            <div class="dim" style="font-size:10px;margin-top:14px;text-align:center">※ ライバルは毎日記録を更新する。追いつくのは、あなた次第。</div>
          </div>
        </div>
        <div>
          <div class="taunt-box">
            <div class="who">👁 ライバルからの挑発 — 現在 ${myRank} 位</div>
            <p>${taunt()}</p>
          </div>

          <div class="section-title" style="--accent:var(--ego)"><h3>称号の階段</h3></div>
          <div class="card">
            ${TITLES.map((t) => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);${li.level >= t.lv ? '' : 'opacity:.4'}">
                <span style="font-size:16px">${li.level >= t.lv ? '👑' : '🔒'}</span>
                <div style="flex:1"><strong style="font-size:12px">${t.name}</strong><div class="dim" style="font-size:9px">${t.en}</div></div>
                <span class="tag">Lv.${t.lv}+</span>
              </div>`).join('')}
            <button class="btn primary block" style="margin-top:16px" data-action="ego-card">👑 自我的名刺を発行する</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- SHOP ---------- */
  function viewShop() {
    return `
      <div class="card" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;background:linear-gradient(135deg,rgba(255,201,74,.1),var(--panel))">
        <div><div style="font-size:11px;color:var(--muted)">所持金貨</div><div style="font-size:30px;font-weight:800;color:var(--ego)" class="mono">◈ ${state.stats.gold}</div></div>
        <div style="font-size:11px;color:var(--muted);max-width:360px;line-height:1.7">集中して稼ぎ、自分を甘やかせ。報酬があるから、続く。<br>甘やかしも、設計のうち。</div>
      </div>
      <div class="section-title" style="--accent:var(--ego)"><h3>道場の棚</h3><span class="hint">金貨で心の装備を買う</span></div>
      <div class="shop-grid">
        ${SHOP.map((item) => {
          const owned = item.id === 'tome' && state.stats.tomes > 0;
          return `<button class="shop-item" data-action="buy" data-id="${item.id}" ${owned ? 'disabled' : ''}>
            <div class="shop-icon">${item.icon}</div>
            <div class="shop-name">${item.name}</div>
            <div class="shop-desc">${item.desc}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="shop-price">◈ ${item.price}</span>
              <span class="tag">${owned ? '購入済み' : state.stats.gold >= item.price ? '購入する →' : '金貨不足'}</span>
            </div>
          </button>`;
        }).join('')}
      </div>
      <div class="section-title" style="--accent:var(--discipline)"><h3>現在の装備</h3></div>
      <div class="card">
        <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat-box"><div class="label">シールド</div><div class="value">${state.stats.shields}</div><div class="sub">連続を守る</div></div>
          <div class="stat-box"><div class="label">ブースト</div><div class="value" style="color:var(--obsession)">${state.stats.boost ? 'ON' : 'OFF'}</div><div class="sub">次回XP2倍</div></div>
          <div class="stat-box"><div class="label">ご褒美券</div><div class="value">${state.stats.tickets}</div><div class="sub">罪悪感なし</div></div>
          <div class="stat-box"><div class="label">啓発の書</div><div class="value">${state.stats.tomes}</div><div class="sub">規律 +3</div></div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     MODALS
     ============================================================ */
  function openModal(html, options = {}) {
    modalOptions = { closable: true, ...options };
    $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="backdrop"><div class="modal" data-modal>${html}</div></div>`;
  }
  function closeModal() { $('#modal-root').innerHTML = ''; }

  function onboardingModal() {
    openModal(`
      <div style="text-align:center;margin-bottom:22px">
        <div style="font-size:42px">🔥</div>
        <h2 style="margin:8px 0 4px">研鑽へ、ようこそ。</h2>
        <div class="sub">ここは、勉強したくなる仕掛けでできた道場だ。</div>
      </div>
      <div class="field"><label>あなたの名（称号カードに刻まれる）</label><input id="onb-name" value="${esc(state.profile.name)}" maxlength="20" /></div>
      <div class="field"><label>なぜ、勉強する？ — 最も重要だ。迷ったらここに戻る。</label><textarea id="onb-why" placeholder="例：親に誇れる自分になりたい">${esc(state.profile.why)}</textarea></div>
      <div class="field"><label>分身を選べ</label><div class="avatar-picker" id="onb-avatars">${AVATARS.map((a) => `<button class="avatar-option ${a === state.profile.avatar ? 'selected' : ''}" data-action="pick-avatar" data-avatar="${a}">${a}</button>`).join('')}</div></div>
      <div style="padding:12px;border-radius:11px;background:rgba(181,107,255,.08);border:1px solid var(--border);font-size:11.5px;color:var(--muted);line-height:1.7">
        意欲・規律・執着・自我。<br>四つの欲を無駄にせず、学習の燃料に変える。まずは25分、斬ってみろ。
      </div>
      <div class="modal-actions"><button class="btn primary block" data-action="finish-onboarding">修行を始める →</button></div>
    `, { closable: false });
  }

  function profileModal() {
    openModal(`
      <h2>⚙ 修行者の設定</h2>
      <div class="sub">在中の自分を、更新せよ。</div>
      <div class="field"><label>名前</label><input id="prof-name" value="${esc(state.profile.name)}" maxlength="20" /></div>
      <div class="field"><label>なぜ勉強するか（モチベーションの核）</label><textarea id="prof-why">${esc(state.profile.why)}</textarea></div>
      <div class="field"><label>分身</label><div class="avatar-picker" id="prof-avatars">${AVATARS.map((a) => `<button class="avatar-option ${a === state.profile.avatar ? 'selected' : ''}" data-action="pick-avatar" data-avatar="${a}">${a}</button>`).join('')}</div></div>
      <div class="section-title" style="--accent:var(--discipline);margin:20px 0 12px"><h3>集中の設定</h3></div>
      <div class="field"><label>集中時間（分）</label><select id="set-focus">${[15, 25, 45, 60].map((m) => `<option value="${m}" ${state.settings.focusMin === m ? 'selected' : ''}>${m} 分</option>`).join('')}</select></div>
      <div class="field"><label>短い休憩（分）</label><select id="set-break">${[5, 10, 15].map((m) => `<option value="${m}" ${state.settings.breakMin === m ? 'selected' : ''}>${m} 分</option>`).join('')}</select></div>
      <div class="field" style="display:flex;justify-content:space-between;align-items:center">
        <label style="margin:0">完了時に効果音</label>
        <button class="btn small ${state.settings.sound ? 'primary' : ''}" data-action="toggle-sound">${state.settings.sound ? 'ON' : 'OFF'}</button>
      </div>
      <div class="field" style="display:flex;justify-content:space-between;align-items:center">
        <label style="margin:0">完了時に通知</label>
        <button class="btn small ${state.settings.notify ? 'primary' : ''}" data-action="toggle-notify">${state.settings.notify ? 'ON' : 'OFF'}</button>
      </div>
      <div class="modal-actions">
        <button class="btn ghost" data-action="reset-data">データを消す</button>
        <button class="btn primary" data-action="save-profile">保存する</button>
      </div>
    `);
  }

  function egoCardModal() {
    const li = levelInfo();
    const board = leaderboard();
    const rank = board.findIndex((x) => x.me) + 1;
    const card = [
      `【 研鑽 KENSAN — 修行者カード 】`,
      `${state.profile.avatar} ${state.profile.name} / ${li.title.name} (Lv.${li.level})`,
      `意欲 ${Math.round(state.drivers.motivation)} | 規律 ${Math.round(state.drivers.discipline)} | 執着 ${Math.round(state.drivers.obsession)} | 自我 ${Math.round(state.drivers.ego)}`,
      `連続 ${state.stats.streak}日 · 通算 ${state.stats.totalMinutes}分 · 今日 ${rank}位`,
      `「${state.profile.why}」`,
    ].join('\n');
    openModal(`
      <div class="celebrate">
        <div style="padding:24px;border-radius:18px;border:1px solid rgba(255,201,74,.35);background:linear-gradient(145deg,rgba(255,201,74,.1),rgba(181,107,255,.08));text-align:left">
          <div style="font-size:10px;letter-spacing:.2em;color:var(--ego)">KENSAN / STUDY DOJO</div>
          <div style="font-size:34px;margin:10px 0">${state.profile.avatar}</div>
          <div style="font-size:22px;font-weight:800">${esc(state.profile.name)}</div>
          <div style="color:var(--ego);font-size:13px">${li.title.name} — Lv.${li.level}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:18px 0">
            ${DRIVERS.map((d) => `<span class="tag" style="color:${d.color}">${d.icon} ${d.name} ${Math.round(state.drivers[d.key])}</span>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--muted);line-height:1.8">
            連続 ${state.stats.streak}日 / 通算 ${state.stats.totalMinutes}分<br>
            今日の順位 ${rank}位 / 最高コンボ ${state.stats.bestCombo}<br>
            「${esc(state.profile.why)}」
          </div>
        </div>
        <div class="modal-actions" style="justify-content:center">
          <button class="btn" data-action="copy-card" data-card="${esc(card)}">📋 テキストをコピー</button>
          <button class="btn primary" data-action="close-modal">閉じる</button>
        </div>
      </div>
    `);
  }

  function buyItem(id) {
    const item = SHOP.find((x) => x.id === id);
    if (!item) return;
    if (id === 'tome' && state.stats.tomes > 0) return;
    if (state.stats.gold < item.price) { toast('金貨が足りない。集中して稼げ。'); return; }
    state.stats.gold -= item.price;
    if (id === 'shield') { state.stats.shields += 1; boostDriver('discipline', 2); }
    if (id === 'boost') { state.stats.boost = true; boostDriver('obsession', 2); }
    if (id === 'ticket') { state.stats.tickets += 1; boostDriver('motivation', 2); }
    if (id === 'tome') { state.stats.tomes += 1; boostDriver('discipline', 3); }
    if (id === 'incense') boostDriver('motivation', 2);
    if (id === 'crown') boostDriver('ego', 5);
    save(); chime(); particles(item.icon, 8);
    toast(`${item.icon} ${item.name} を手に入れた`);
    renderAll();
  }
  function addTask() {
    const titleEl = $('#new-task-title');
    const title = titleEl?.value.trim();
    if (!title) { toast('何をやるか、まず書き出せ。'); titleEl?.focus(); return; }
    const subject = $('#new-task-subject')?.value.trim() || '科目なし';
    const difficulty = Number($('#new-task-diff')?.value || 2);
    state.tasks.push({ id: uid(), title, subject, difficulty, estimate: difficulty, done: false, createdAt: todayKey() });
    boostDriver('motivation', 1);
    save(); renderAll();
    toast('課題を登録した。片付けろ。');
    $('#new-task-title')?.focus();
  }
  function toggleTask(id) {
    const task = state.tasks.find((x) => x.id === id);
    if (!task) return;
    task.done = !task.done;
    if (task.done) {
      const xp = task.difficulty * 30, gold = task.difficulty * 10;
      state.stats.xp += xp; state.stats.gold += gold; state.stats.tasksDone += 1;
      todayStats().tasks += 1;
      boostDriver('motivation', 2); boostDriver('ego', 2);
      particles('✦', 7); chime();
      toast(`完了！ +${xp} XP / +${gold} 金貨`);
      checkQuests();
    }
    save(); renderAll();
  }
  function deleteTask(id) {
    state.tasks = state.tasks.filter((x) => x.id !== id);
    save(); renderAll();
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case 'nav': go(el.dataset.view); break;
      case 'quick-start': go('focus'); if (!state.focus.running) startTimer(); break;
      case 'start-focus': go('focus'); if (!state.focus.running) startTimer(); break;
      case 'start-timer': startTimer(); break;
      case 'pause': pauseTimer(); break;
      case 'reset-timer': resetTimer(); renderAll(); toast('タイマーをリセットした'); break;
      case 'give-up':
        openModal(`<h2>本当に諦める？</h2><div class="sub">コンボが途切れ、規律と執着が削れる。</div>
          <div class="modal-actions"><button class="btn ghost" data-action="close-modal">まだやる</button><button class="btn primary" data-action="confirm-give-up">諦める</button></div>`);
        break;
      case 'confirm-give-up': closeModal(); giveUp(); renderAll(); break;
      case 'mode': setMode(el.dataset.mode); break;
      case 'continue-after-session': closeModal(); go('focus'); setMode('short'); startTimer(); break;
      case 'close-modal': closeModal(); break;
      case 'backdrop': if (e.target === el && modalOptions.closable) closeModal(); break;
      case 'profile': profileModal(); break;
      case 'pick-avatar': {
        const box = el.parentElement;
        box.querySelectorAll('.avatar-option').forEach((o) => o.classList.remove('selected'));
        el.classList.add('selected');
        break;
      }
      case 'save-profile': {
        state.profile.name = $('#prof-name').value.trim() || '修行者';
        state.profile.why = $('#prof-why').value.trim() || '将来の自分を誇れるように。';
        state.profile.avatar = $('#prof-avatars .avatar-option.selected')?.dataset.avatar || state.profile.avatar;
        state.settings.focusMin = Number($('#set-focus').value);
        state.settings.breakMin = Number($('#set-break').value);
        if (state.focus.mode === 'focus') { state.focus.minutes = state.settings.focusMin * 60; if (!state.focus.running) state.focus.remaining = state.focus.minutes; }
        if (state.focus.mode === 'short') { state.focus.minutes = state.settings.breakMin * 60; if (!state.focus.running) state.focus.remaining = state.focus.minutes; }
        closeModal(); save(); renderAll(); toast('設定を保存した');
        break;
      }
      case 'toggle-sound': state.settings.sound = !state.settings.sound; save(); profileModal(); break;
      case 'toggle-notify':
        if (!state.settings.notify && typeof Notification !== 'undefined') {
          Notification.requestPermission().then((p) => {
            state.settings.notify = p === 'granted';
            if (p !== 'granted') toast('通知が許可されなかった');
            save(); profileModal();
          });
        } else { state.settings.notify = !state.settings.notify; save(); profileModal(); }
        break;
      case 'reset-data':
        openModal(`<h2>すべてを消す？</h2><div class="sub">記録・称号・金貨、すべてがInitial Stateに戻る。取り戻せない。</div>
          <div class="modal-actions"><button class="btn ghost" data-action="close-modal">やめる</button><button class="btn primary" data-action="confirm-reset">消す</button></div>`);
        break;
      case 'confirm-reset':
        state = defaultState(); state.onboarded = false; save(); closeModal(); onboardingModal(); break;
      case 'finish-onboarding':
        state.profile.name = $('#onb-name').value.trim() || '修行者';
        state.profile.why = $('#onb-why').value.trim() || '将来の自分を誇れるように。';
        state.profile.avatar = $('#onb-avatars .avatar-option.selected')?.dataset.avatar || '🔥';
        state.onboarded = true; state.stats.lastActiveDate = todayKey();
        save(); closeModal(); renderAll();
        toast('道場の門が開いた。まずは25分、斬れ。');
        break;
      case 'claim-quest': claimQuest(el.dataset.id); break;
      case 'add-task': addTask(); break;
      case 'toggle-task': toggleTask(el.dataset.id); break;
      case 'delete-task': deleteTask(el.dataset.id); break;
      case 'buy': buyItem(el.dataset.id); break;
      case 'ego-card': egoCardModal(); break;
      case 'copy-card': {
        const text = el.dataset.card || '';
        const done = () => toast('名刺をコピーした');
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        else fallbackCopy(text, done);
        break;
      }
    }
  });

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('コピーできなかった'); }
    ta.remove();
  }

  document.addEventListener('input', (e) => {
    if (e.target.id === 'intent-input') { state.focus.intent = e.target.value; save(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOptions.closable) closeModal();
    if (e.key === 'Enter' && e.target.id === 'new-task-title') addTask();
  });

  /* ---------------- main loop ---------------- */
  setInterval(() => {
    if (!state.focus.running) return;
    const remain = Math.max(0, Math.ceil((state.focus.endAt - Date.now()) / 1000));
    if (remain !== state.focus.remaining) {
      state.focus.remaining = remain;
      updateTimerDom();
      const now = Date.now();
      if (now - lastTickSave > 4000) { save(); lastTickSave = now; }
    }
    if (remain <= 0) completeSession();
  }, 250);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.focus.running) {
      state.focus.remaining = Math.max(0, Math.ceil((state.focus.endAt - Date.now()) / 1000));
      if (state.focus.remaining <= 0) completeSession();
      else updateTimerDom();
    }
  });

  /* ---------------- boot ---------------- */
  applyDecay();
  save();
  renderAll();
  if (!state.onboarded) onboardingModal();

  // expose for debugging
  window.KENSAN = { get state() { return state; }, save, renderAll };
})();
