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
    { key: 'ego',        name: '自我',   en: 'EGO',        icon: '👑', color: 'var(--ego)',       desc: '称号と勝敗。自分の名を高めたい欲を燃料に。' },
  ];
  // 架空の修行者たち。一人ひとりに信念・学習スタイル・挑発文を持たせる。
  const RIVALS = [
    {
      id: 'kageyama', name: '影山 蓮', avatar: '🥷', title: '修羅', color: '#ff6a4d',
      quote: '「限界は、自分で決めた線のことだ。」', style: '深夜の鬼集中・難問を潰す型',
      lore: '元・東大落ち。あの日から毎日14時間、机に向かい続けている。',
      base: 90, growth: 0.08, unlock: 1,
      taunts: ['「その程度で満足してるの？ 私はまだ終わっていない。」', '「お前が寝ている間に、私は三章終わらせた。」', '「痛いほど集中しろ。それが唯一の近道だ。」'],
    },
    {
      id: 'hokuto', name: '北斗', avatar: '🐺', title: '孤高の狼', color: '#46c9ff',
      quote: '「誰にも追わせない。それが私の流儀。」', style: '朝5時起き・ルーチン完全遵守型',
      lore: '誰とも群さない。だが、その孤独な朝の時間が彼を最強にしている。',
      base: 75, growth: 0.08, unlock: 1,
      taunts: ['「ルーチンを崩した瞬間、お前は負けてる。」', '「根性じゃない。毎朝同じ時間に席に着くだけだ。」', '「今日の私を超えられないなら、明日も超えられないぞ。」'],
    },
    {
      id: 'chiya', name: '千夜', avatar: '🦉', title: '夜の読書鬼', color: '#b56bff',
      quote: '「静かな夜が、いちばん正直だ。」', style: '夜型・インプット量で押し切る型',
      lore: '図書館の閉館ギリギリまで居座る。ノートはいつもびっしりだ。',
      base: 105, growth: 0.05, unlock: 2,
      taunts: ['「記録は裏切らない。お前の意志は裏切るだろう。」', '「私のノートの厚さと、お前のを比べてみろ。」', '「今ここで止めれば、この選択は明日も続く。」'],
    },
    {
      id: 'mika', name: 'Mika', avatar: '🦊', title: '才女', color: '#ffc94a',
      quote: '「効率が悪い努力は、ただの自己満足。」', style: '短時間集中・メリハリ型',
      lore: '短い集中を積み重ねて、他人の倍の成果を出す。遊ぶ時は心から遊ぶ。',
      base: 115, growth: 0.04, unlock: 3,
      taunts: ['「休憩は私が取る。お前は今、盤面に立っている。」', '「ダラダラ長くやるより、短く斬って寝ろ。」', '「私の集中は、途切れない。途切れるのはお前だ。」'],
    },
    {
      id: 'sora', name: 'SORA', avatar: '🦅', title: '野心家', color: '#7dffb0',
      quote: '「トップになるために、今日も一歩。」', style: '目標逆算・スピード重視型',
      lore: '年齢は若い。だが、目的地だけは誰よりはっきり見ている。',
      base: 130, growth: 0.12, unlock: 4,
      taunts: ['「才能じゃない。回数だ。今の差は、そのまま積み上がる。」', '「我先に、だ。置いていくぞ。」', '「その溜め息、次のセッションに変えてこい。」'],
    },
    {
      id: 'mumei', name: '無名', avatar: '🌑', title: '???', color: '#9a9aae',
      quote: '「……」', style: '正体不明・ひたすら静かに積み上げる型',
      lore: '誰も顔を見たことがない。ただ、記録だけが毎日更新されていく。',
      base: 150, growth: 0.18, unlock: 6,
      taunts: ['「……（何も言わない。ただ記録が差を語る。）」', '「…………」', '「……お前を、追い抜く。」'],
    },
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
      tourDone: false,
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
      duel: { selected: 'hokuto', results: {}, lastChecked: null },
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
        duel: { ...base.duel, ...(parsed.duel || {}) },
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
    resolveDuelDay();
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
    checkDuelWin();

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
          <button class="btn" data-action="continue-after-session">☕ ${state.settings.breakMin}分休憩する</button>
          <button class="btn primary" data-action="continue-focus">▶ 続けて集中する</button>
          <button class="btn ghost" data-action="close-modal">閉じる</button>
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

  /* ---------------- 架空の修行者との対決 ---------------- */
  const EPOCH = dayNum('2026-01-01');

  function currentRival() {
    return RIVALS.find((r) => r.id === state.duel.selected) || RIVALS[0];
  }
  function isUnlocked(rival) {
    return levelInfo().level >= rival.unlock;
  }
  function keyFromDay(n) {
    const d = new Date(n * 86400000);
    return todayKey(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  // 日付から決まる架空の人物の「その日の集中時間」。日が経つほど少しずつ強くなる。
  function rivalMinutes(rival, key = todayKey()) {
    const n = dayNum(key);
    const i = RIVALS.indexOf(rival);
    const noise = ((n * 7 + i * 13) % 41) - 20;
    const growth = Math.min(25, Math.max(0, n - EPOCH) * (rival.growth || 0));
    return Math.max(10, Math.round(rival.base + growth + noise));
  }
  function duelStatus() {
    const rival = currentRival();
    const me = todayStats().minutes;
    const rivalMin = rivalMinutes(rival);
    return {
      rival, me, rivalMin,
      diff: me - rivalMin,
      win: me > rivalMin,
      close: Math.abs(me - rivalMin) <= 15,
      gap: Math.max(0, rivalMin - me),
    };
  }
  function rivalTaunt(rival = currentRival()) {
    const idx = (dayNum(todayKey()) + RIVALS.indexOf(rival) * 3) % rival.taunts.length;
    return rival.taunts[idx];
  }
  function duelRecord() {
    const results = Object.values(state.duel.results || {});
    return {
      wins: results.filter((r) => r === 'win').length,
      losses: results.filter((r) => r === 'lose').length,
      results: state.duel.results || {},
    };
  }
  // 日付が変わったら、前日以前の未判定日を「負け」として締める。
  function resolveDuelDay() {
    const today = todayKey();
    const last = state.duel.lastChecked;
    if (last && last !== today) {
      let n = dayNum(last);
      const end = dayNum(today);
      while (n < end) {
        const k = keyFromDay(n);
        if (!state.duel.results[k]) state.duel.results[k] = 'lose';
        n += 1;
      }
    }
    state.duel.lastChecked = today;
  }
  // 今日の集中時間がライバルを抜いた瞬間に、一日一度だけ勝利報酬を出す。
  function checkDuelWin() {
    const day = todayKey();
    if ((state.duel.results || {})[day] === 'win') return;
    const s = duelStatus();
    if (s.me > s.rivalMin) {
      state.duel.results[day] = 'win';
      state.stats.xp += 100;
      state.stats.gold += 80;
      boostDriver('ego', 4);
      boostDriver('obsession', 3);
      particles('👑', 12);
      chime();
      toast(`👑 ${s.rival.name}を抜いた！ +100 XP / +80 金貨`);
    }
  }
  function selectRival(id) {
    const rival = RIVALS.find((r) => r.id === id);
    if (!rival) return;
    if (!isUnlocked(rival)) {
      toast(`🔒 Lv.${rival.unlock} で解放される`);
      return;
    }
    state.duel.selected = id;
    save(); renderAll();
    toast(`${rival.name} をライバルに定めた。今日の集中時間で勝負だ。`);
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderTopbar() {
    const li = levelInfo();
    $('#level-badge').textContent = `Lv.${li.level}`;
    $('#level-title').textContent = li.title.name;
    const mobileLevel = $('#mobile-level');
    if (mobileLevel) mobileLevel.textContent = `Lv.${li.level}`;
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
    const renders = { home: viewHome, focus: viewFocus, quests: viewQuests, rivals: viewRivals, shop: viewShop };
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
    const duel = duelStatus();
    const openTasks = state.tasks.filter((x) => !x.done);
    const claimed = claimedList();
    const questsDone = QUESTS.filter((q) => claimed.includes(q.id)).length;
    const d = new Date();
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()} (${'日月火水木金土'[d.getDay()]})`;
    const hour = d.getHours();
    const greet = hour < 11 ? 'おはよう' : hour < 18 ? 'こんにちは' : 'こんばんは';
    const previewTasks = openTasks.slice(0, 2);

    return `
      <div class="home-hero">
        <div class="home-hero-main">
          <div class="hero-eyebrow">${dateLabel} ・ ${li.title.en}</div>
          <h1 class="home-greeting">${greet}、<span class="accent">${esc(state.profile.name)}</span>。</h1>
          <p class="home-sub">「${esc(state.profile.why)}」</p>
          <div class="home-actions">
            <button class="btn primary hero-cta" data-action="start-focus">▶ ${state.focus.running ? '集中を再開する' : `${state.settings.focusMin}分 集中する`}</button>
            <button class="btn" data-action="nav" data-view="quests">✓ 今日のタスク</button>
          </div>
        </div>
        <div class="home-ring">
          <div class="ring" style="--p:${pct}">
            <div class="ring-inner"><strong>${t.sessions}<span style="font-size:12px;color:var(--muted)">/${target}</span></strong><span>SESSION</span></div>
          </div>
          <div class="home-ring-label">今日の目標<br><strong>あと ${Math.max(0, target - t.sessions)} セッション</strong></div>
        </div>
      </div>

      <div class="quick-stats">
        <button class="stat-tile" data-action="nav" data-view="focus">
          <span class="stat-tile-icon" style="color:var(--motivation)">🔥</span>
          <span class="stat-tile-value">${t.minutes}<small>分</small></span>
          <span class="stat-tile-label">今日の集中</span>
        </button>
        <button class="stat-tile" data-action="nav" data-view="focus">
          <span class="stat-tile-icon" style="color:var(--discipline)">⚡</span>
          <span class="stat-tile-value">x${comboMult().toFixed(1)}</span>
          <span class="stat-tile-label">コンボ倍率</span>
        </button>
        <button class="stat-tile" data-action="nav" data-view="rivals">
          <span class="stat-tile-icon" style="color:var(--obsession)">⚔</span>
          <span class="stat-tile-value" style="color:${duel.win ? 'var(--ego)' : 'var(--text)'}">${duel.win ? '勝ち' : `あと${duel.gap}分`}</span>
          <span class="stat-tile-label">${esc(duel.rival.name)} との差</span>
        </button>
        <button class="stat-tile" data-action="nav" data-view="shop">
          <span class="stat-tile-icon" style="color:var(--ego)">◈</span>
          <span class="stat-tile-value">${state.stats.gold}</span>
          <span class="stat-tile-label">金貨</span>
        </button>
      </div>

      <div class="section-title" style="--accent:var(--discipline)"><h3>今日やること</h3><button class="btn small ghost" data-action="nav" data-view="quests">すべて見る →</button></div>
      <div class="card todo-card">
        <div class="todo-group">
          <div class="todo-group-head"><span>デイリー試練</span><span class="dim">${questsDone} / ${QUESTS.length} 達成</span></div>
          ${QUESTS.slice(0, 3).map(questRowHtml).join('')}
        </div>
        <div class="todo-group">
          <div class="todo-group-head"><span>自分のタスク</span><span class="dim">${openTasks.length} 件 未完了</span></div>
          ${previewTasks.length ? previewTasks.map((task) => taskRowHtml(task)).join('') : `<div class="empty small"><span class="emoji">📝</span><p>まだタスクがない。今日やることを1つだけ書き出そう。</p></div>`}
          <button class="btn small ghost block" data-action="nav" data-view="quests">＋ タスクを追加する</button>
        </div>
      </div>

      <div class="cols-2" style="margin-top:18px">
        <div class="card">
          <div class="section-title" style="--accent:var(--motivation);margin:0 0 14px"><h3>四つのエンジン</h3><span class="hint">勉強すると伸びる</span></div>
          <div class="compact-drivers">
            ${DRIVERS.map((dr) => `
              <div class="cd-item" title="${dr.desc}">
                <div class="cd-top">
                  <span style="color:${dr.color}">${dr.icon}</span>
                  <strong>${dr.name}</strong>
                  <span class="mono" style="color:${dr.color}">${Math.round(state.drivers[dr.key])}</span>
                </div>
                <div class="cd-bar"><i style="width:${state.drivers[dr.key]}%;background:${dr.color}"></i></div>
              </div>`).join('')}
          </div>
          <p class="dim" style="font-size:10px;margin:12px 0 0;line-height:1.6">集中するほど伸び、サボると少しずつ衰える。4つを切らすな。</p>
        </div>
        <div class="card">
          <div class="section-title" style="--accent:var(--obsession);margin:0 0 14px"><h3>今週の集中</h3><span class="hint">${state.stats.streak}日連続</span></div>
          ${weekBarsHtml()}
          <div style="display:flex;justify-content:space-between;margin-top:14px;font-size:11px;color:var(--muted)">
            <span>今週 ${weekMinutes()} 分</span>
            <span>最高 ${state.stats.bestCombo} コンボ</span>
          </div>
        </div>
      </div>

      <div class="home-footer">
        <button class="btn small ghost" data-action="ego-card">👑 自我的名刺を見る</button>
        <span class="dim" style="font-size:10px">🛡️ シールド ${state.stats.shields} 枚 ・ 🎟️ チケット ${state.stats.tickets} 枚</span>
      </div>
    `;
  }

  function taskRowHtml(task) {
    return `
      <div class="task-row ${task.done ? 'done' : ''}">
        <button class="task-check" data-action="toggle-task" data-id="${task.id}" aria-label="完了">✓</button>
        <div class="task-body">
          <div class="task-title">${esc(task.title)}</div>
          <div class="task-meta"><span>${esc(task.subject || '科目なし')}</span><span class="diff-${task.difficulty}">${'★'.repeat(task.difficulty)}</span></div>
        </div>
        <button class="icon-btn" data-action="delete-task" data-id="${task.id}" aria-label="削除">✕</button>
      </div>`;
  }

  function weekBarsHtml() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = todayKey(d);
      days.push({ k, m: state.history[k] ? state.history[k].minutes : 0, label: '日月火水木金土'[d.getDay()], today: i === 0 });
    }
    const max = Math.max(25, ...days.map((x) => x.m));
    return `<div class="week-bars">${days.map((x) => `
      <div class="week-bar ${x.today ? 'today' : ''}" title="${x.k} · ${x.m}分">
        <div class="week-bar-track"><i style="height:${Math.max(4, (x.m / max) * 100)}%"></i></div>
        <span>${x.label}</span>
        <small>${x.m}</small>
      </div>`).join('')}</div>`;
  }

  function weekMinutes() {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = todayKey(d);
      sum += state.history[k] ? state.history[k].minutes : 0;
    }
    return sum;
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
    const t = todayStats();
    const duel = duelStatus();
    const modeName = f.mode === 'focus' ? '集中' : f.mode === 'short' ? '短い休憩' : '長い休憩';
    const color = f.mode === 'focus' ? 'var(--motivation)' : f.mode === 'short' ? 'var(--discipline)' : 'var(--obsession)';
    const rewardXp = Math.round(f.minutes * 2 * comboMult() * (state.stats.boost ? 2 : 1));
    const rewardGold = Math.round(f.minutes * 1.2 * comboMult());
    return `
      <div class="focus-layout">
        <div class="focus-stage">
          <div class="focus-step">
            <label for="intent-input">このセッションでやること</label>
            <input class="intent-input" id="intent-input" placeholder="例：英文法 第3章を1周する" value="${esc(f.intent)}" data-action="intent" />
          </div>

          <div class="mode-tabs">
            <button class="mode-tab ${f.mode === 'focus' ? 'active' : ''}" data-action="mode" data-mode="focus">集中 ${state.settings.focusMin}分</button>
            <button class="mode-tab ${f.mode === 'short' ? 'active' : ''}" data-action="mode" data-mode="short">休憩 ${state.settings.breakMin}分</button>
            <button class="mode-tab ${f.mode === 'long' ? 'active' : ''}" data-action="mode" data-mode="long">長休憩 ${state.settings.longBreakMin}分</button>
          </div>

          <div class="timer-ring" id="timer-ring" style="--timer-c:${color}">
            <div class="timer-inner">
              <div class="timer-time" id="timer-time">${fmtTime(f.remaining)}</div>
              <div class="timer-status" id="timer-status">${f.running ? modeName + '中' : '準備完了'}</div>
              <div class="timer-combo">⚡ x${comboMult().toFixed(1)} ・ 🔥 ${state.stats.streak}日連続</div>
            </div>
          </div>

          <div class="focus-reward-inline">完了すると <strong>+${rewardXp} XP</strong> ・ <strong>+${rewardGold} ◈</strong>${state.stats.boost ? ' ・ ⚡ブースト中' : ''}</div>

          <div class="timer-controls">
            ${f.running
              ? `<button class="btn" data-action="pause">⏸ 一時停止</button><button class="btn ghost" data-action="give-up">諦める</button>`
              : `<button class="btn primary" data-action="start-timer">${f.remaining < f.minutes * 60 ? '▶ 再開する' : '▶ 集中を開始'}</button><button class="btn ghost" data-action="reset-timer">リセット</button>`}
          </div>

          <div class="focus-why">「${esc(state.profile.why)}」</div>
        </div>

        <div class="focus-side">
          <div class="card">
            <div class="side-title-row"><h3>今日の記録</h3><span class="tag">🔥 ${state.stats.streak}日連続</span></div>
            <div class="session-stat"><span>集中時間</span><strong>${t.minutes} 分</strong></div>
            <div class="session-stat"><span>セッション</span><strong>${t.sessions} 回</strong></div>
            <div class="session-stat"><span>コンボ倍率</span><strong style="color:var(--obsession)">x${comboMult().toFixed(1)}</strong></div>
            <div class="session-stat"><span>今日のライバル</span><strong>${esc(duel.rival.name)} ${duel.rivalMin}分</strong></div>
          </div>

          <div class="card focus-tip">
            <div class="tip-label">ライバルからの一言</div>
            <p>${rivalTaunt(duel.rival)}</p>
            <button class="btn small ghost" data-action="nav" data-view="rivals">対決を見る →</button>
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
      ? (f.mode === 'focus' ? '集中中 — 止めない' : '休憩中 — 深呼吸')
      : (f.remaining < total ? '一時停止中' : '準備完了');
  }

  /* ---------- TASKS ---------- */
  function viewQuests() {
    const t = todayStats();
    const open = state.tasks.filter((x) => !x.done);
    return `
      <div class="page-head">
        <div><h1>タスク</h1><p class="muted">今日やることを、一つずつ片付ける。</p></div>
        <div class="summary-chips">
          <span class="chip">🔥 ${t.minutes} 分</span>
          <span class="chip">✓ ${t.tasks} 件完了</span>
          <span class="chip">⚡ x${comboMult().toFixed(1)}</span>
        </div>
      </div>

      <div class="section-title" style="--accent:var(--discipline)"><h3>デイリー試練</h3><span class="hint">毎日リセットされる</span></div>
      <div class="card">${QUESTS.map(questRowHtml).join('')}</div>

      <div class="section-title" style="--accent:var(--motivation)"><h3>自分のタスク</h3><span class="hint">${open.length} 件 未完了</span></div>
      <div class="card">
        <div class="task-add">
          <input class="intent-input" id="new-task-title" placeholder="例：英単語 100個 暗記" />
          <input class="intent-input" id="new-task-subject" placeholder="科目" />
          <select class="intent-input" id="new-task-diff">
            <option value="1">★ 易</option><option value="2" selected>★★ 中</option><option value="3">★★★ 難</option>
          </select>
          <button class="btn primary" data-action="add-task">＋ 追加</button>
        </div>
        ${state.tasks.length ? state.tasks.map((task) => taskRowHtml(task)).join('') : `<div class="empty"><span class="emoji">📝</span><p>まだタスクがない。<br>まず、たった一つ書き出せ。</p></div>`}
      </div>

      <div class="section-title" style="--accent:var(--obsession)"><h3>継続カレンダー</h3><span class="hint">直近15週間</span></div>
      <div class="card">
        ${heatmapHtml(15)}
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);font-size:11.5px;color:var(--muted);line-height:1.7">
          一日空けるごとに、四つの力は少しずつ衰える。<br>
          シールドを持っていれば、その日は守られる。 <span class="gold-text">今 ${state.stats.shields} 枚</span>
        </div>
      </div>
    `;
  }
  /* ---------- ライバル対決 ---------- */
  function fighterRow(label, avatar, name, minutes, max, color, isMe) {
    const pct = Math.min(100, (minutes / max) * 100);
    return `
      <div class="fighter ${isMe ? 'me' : ''}">
        <div class="fighter-top">
          <span class="fighter-avatar">${avatar}</span>
          <div class="fighter-name"><strong>${esc(name)}</strong><small>${esc(label)}</small></div>
          <div class="fighter-minutes">${minutes}<small>分</small></div>
        </div>
        <div class="duel-bar"><i style="width:${pct}%;background:${color};box-shadow:0 0 14px ${color}"></i></div>
      </div>`;
  }

  function viewRivals() {
    const li = levelInfo();
    const d = duelStatus();
    const rec = duelRecord();
    const max = Math.max(30, d.me, d.rivalMin) * 1.12;
    const needed = Math.max(0, d.rivalMin - d.me + 1);
    const sessionsNeeded = Math.ceil(needed / state.settings.focusMin);
    const statusText = d.win ? '👑 あなたがリードしている。この差を守れ。'
      : d.close ? '⚔ 接戦だ。あと一歩で逆転できる。'
      : `🔥 ${d.gap} 分 遅れている。まだ追いつける。`;
    const statusColor = d.win ? 'var(--ego)' : d.close ? 'var(--obsession)' : 'var(--motivation)';
    const recent = Object.entries(rec.results).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
    const unlockedCount = RIVALS.filter(isUnlocked).length;

    return `
      <div class="duel-arena" style="--rival-c:${d.rival.color}">
        <div class="arena-head">
          <div>
            <div class="arena-eyebrow">TODAY'S DUEL — ${d.rival.title}</div>
            <h2>今日の集中時間で、${esc(d.rival.name)} を抜け。</h2>
          </div>
          <span class="arena-badge">${d.win ? '勝利確定' : d.close ? '接戦' : '挑戦中'}</span>
        </div>
        <div class="arena-body">
          ${fighterRow(`${li.title.name} / Lv.${li.level}`, state.profile.avatar, state.profile.name, d.me, max, 'var(--discipline)', true)}
          <div class="versus">VS</div>
          ${fighterRow(d.rival.title, d.rival.avatar, d.rival.name, d.rivalMin, max, d.rival.color, false)}
        </div>
        <div class="arena-footer">
          <div class="arena-message">
            <p style="color:${statusColor}">${statusText}</p>
            <p class="muted" style="font-size:11.5px;margin-top:4px">${d.win
              ? 'ライバルは黙っていない。記録は明日も更新される。'
              : `あと ${needed} 分（約 ${sessionsNeeded} セッション）で逆転。逆転報酬は +100 XP / +80 金貨（1日1回）。`}</p>
          </div>
          <button class="btn primary" data-action="start-focus">▶ ${d.win ? '差を広げる' : '今すぐ追いかける'}</button>
        </div>
        <div class="arena-lore">
          <span class="tag">${esc(d.rival.style)}</span>
          <span>${esc(d.rival.lore)}</span>
        </div>
        <div class="taunt-box" style="margin-top:16px">
          <div class="who">👁 ${esc(d.rival.name)} の言葉</div>
          <p>${rivalTaunt(d.rival)}</p>
        </div>
      </div>

      <div class="section-title" style="--accent:var(--obsession)"><h3>ライバルを選べ</h3><span class="hint">Lv.${li.level} ・ 解放 ${unlockedCount} / ${RIVALS.length}</span></div>
      <div class="rival-grid compact">
        ${RIVALS.map((r) => {
          const unlocked = isUnlocked(r);
          const selected = r.id === state.duel.selected;
          return `
            <button class="rival-card compact ${selected ? 'selected' : ''} ${unlocked ? '' : 'locked'}" style="--rival-c:${r.color}" data-action="select-rival" data-id="${r.id}">
              <span class="rival-avatar">${r.avatar}</span>
              <span class="rival-info">
                <strong>${esc(r.name)}</strong>
                <small>${esc(r.title)}</small>
              </span>
              <span class="rival-min">${unlocked ? `${rivalMinutes(r)}<small>分</small>` : '🔒'}</span>
              ${selected ? '<span class="tag">対決中</span>' : unlocked ? '<span class="rival-select-hint">選ぶ</span>' : `<span class="rival-lock">Lv.${r.unlock}</span>`}
            </button>`;
        }).join('')}
      </div>
      <div class="cols-2" style="margin-top:18px">
        <div>
          <div class="section-title" style="--accent:var(--ego)"><h3>対決の記録</h3><span class="hint">毎日の勝敗</span></div>
          <div class="card">
            <div class="stat-grid" style="grid-template-columns:repeat(2,1fr)">
              <div class="stat-box"><div class="label">WINS</div><div class="value" style="color:var(--ego)">${rec.wins}</div><div class="sub">勝利</div></div>
              <div class="stat-box"><div class="label">LOSSES</div><div class="value" style="color:var(--dim)">${rec.losses}</div><div class="sub">敗北</div></div>
            </div>
            <div style="margin-top:18px;font-size:11px;color:var(--muted);margin-bottom:8px">最近の7日</div>
            <div class="record-strip">
              ${recent.length ? recent.map(([k, result]) => `<div class="record-day ${result === 'win' ? 'win' : 'lose'}" title="${k}"><span>${result === 'win' ? '👑' : '✕'}</span><small>${k.slice(5)}</small></div>`).join('') : '<div class="dim" style="font-size:11px">まだ記録がない。今日が初戦だ。</div>'}
            </div>
            <div class="dim" style="font-size:10px;margin-top:14px;line-height:1.7">※ ライバルは毎日少しずつ成長する。放置すると記録は静かに積み上がっていく。</div>
          </div>
        </div>
        <div>
          <div class="section-title" style="--accent:var(--ego)"><h3>称号と名刺</h3><span class="hint">ライバル解放にも影響</span></div>
          <div class="card">
            <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:rgba(255,201,74,.08);border:1px solid rgba(255,201,74,.25);margin-bottom:14px">
              <span style="font-size:22px">👑</span>
              <div style="flex:1"><strong style="font-size:13px">${li.title.name}</strong><div class="dim" style="font-size:10px">${li.title.en} ・ Lv.${li.level}</div></div>
              <span class="tag">現在</span>
            </div>
            <details class="ladder">
              <summary>称号の階段を見る</summary>
              <div style="margin-top:12px">
                ${TITLES.map((t) => `
                  <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);${li.level >= t.lv ? '' : 'opacity:.4'}">
                    <span style="font-size:16px">${li.level >= t.lv ? '👑' : '🔒'}</span>
                    <div style="flex:1"><strong style="font-size:12px">${t.name}</strong><div class="dim" style="font-size:9px">${t.en}</div></div>
                    <span class="tag">Lv.${t.lv}+</span>
                  </div>`).join('')}
              </div>
            </details>
            <button class="btn primary block" style="margin-top:16px" data-action="ego-card">👑 自我的名刺を発行する</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- SHOP ---------- */
  function viewShop() {
    const groups = [
      { title: '集中を守る・加速する', hint: '続けるための装備', ids: ['shield', 'boost', 'incense', 'tome'] },
      { title: 'ご褒美', hint: '頑張った自分に', ids: ['ticket', 'crown'] },
    ];
    const owned = (id) => ({
      shield: state.stats.shields,
      boost: state.stats.boost ? 1 : 0,
      ticket: state.stats.tickets,
      tome: state.stats.tomes,
      crown: 0,
      incense: 0,
    }[id] || 0);

    return `
      <div class="page-head">
        <div><h1>ショップ</h1><p class="muted">集中して貯めた金貨で、続けるための装備を買う。</p></div>
        <div class="gold-big">◈ ${state.stats.gold}</div>
      </div>

      ${groups.map((g) => `
        <div class="section-title" style="--accent:var(--ego)"><h3>${g.title}</h3><span class="hint">${g.hint}</span></div>
        <div class="shop-grid">
          ${g.ids.map((id) => {
            const item = SHOP.find((x) => x.id === id);
            const count = owned(id);
            const soldOut = id === 'tome' && state.stats.tomes > 0;
            const afford = state.stats.gold >= item.price;
            return `
              <div class="shop-item ${soldOut ? 'soldout' : ''}">
                <div class="shop-item-top">
                  <span class="shop-icon">${item.icon}</span>
                  ${count > 0 ? `<span class="tag">所持 ${count}</span>` : ''}
                  ${soldOut ? '<span class="tag">購入済み</span>' : ''}
                </div>
                <div class="shop-name">${item.name}</div>
                <div class="shop-desc">${item.desc}</div>
                <div class="shop-buy">
                  <span class="shop-price">◈ ${item.price}</span>
                  <button class="btn small ${afford && !soldOut ? 'primary' : ''}" data-action="buy" data-id="${item.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? '購入済み' : afford ? '購入する' : '金貨不足'}</button>
                </div>
              </div>`;
          }).join('')}
        </div>`).join('')}

      <div class="section-title" style="--accent:var(--discipline)"><h3>持ち物</h3></div>
      <div class="card">
        <div class="summary-chips">
          <span class="chip">🛡️ シールド ${state.stats.shields}</span>
          <span class="chip">⚡ ブースト ${state.stats.boost ? 'ON' : 'OFF'}</span>
          <span class="chip">🎟️ チケット ${state.stats.tickets}</span>
          <span class="chip">📜 啓発の書 ${state.stats.tomes}</span>
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

  /* ---------------- interactive onboarding ---------------- */
  const WHY_PRESETS = [
    '合格して、未来を選べる自分になる',
    '負けたくない',
    '家族を安心させたい',
    '自分の限界を知りたい',
    '好きなことを仕事にしたい',
  ];
  const OB_TOTAL = 5;
  let ob = null;

  function onboardingModal() {
    ob = {
      step: 0,
      name: state.profile.name === '修行者' ? '' : state.profile.name,
      why: state.profile.why === '将来の自分を誇れるように。' ? '' : state.profile.why,
      avatar: state.profile.avatar || '🔥',
      rivalId: state.duel.selected || 'hokuto',
      focusMin: state.settings.focusMin || 25,
      taskTitle: '',
      taskSubject: '',
      difficulty: 2,
    };
    renderOnboarding();
  }

  function captureObStep() {
    if (!ob) return;
    const name = $('#ob-name'); if (name) ob.name = name.value.trim();
    const why = $('#ob-why'); if (why) ob.why = why.value.trim();
    const task = $('#ob-task'); if (task) ob.taskTitle = task.value.trim();
    const subject = $('#ob-task-subject'); if (subject) ob.taskSubject = subject.value.trim();
    const diff = $('#ob-task-diff'); if (diff) ob.difficulty = Number(diff.value) || 2;
  }

  function obBody() {
    if (ob.step === 0) {
      return `
        <h2 class="ob-title">ようこそ、研鑽へ。</h2>
        <p class="ob-sub">勉強したくなる仕掛けでできた道場です。まずは、あなたのことを教えてください。</p>
        <div class="field"><label>呼び名</label><input id="ob-name" maxlength="20" placeholder="例：アキ" value="${esc(ob.name)}" /></div>
        <div class="field"><label>分身（アイコン）</label><div class="avatar-picker">${AVATARS.map((a) => `<button class="avatar-option ${a === ob.avatar ? 'selected' : ''}" data-action="ob-avatar" data-avatar="${a}">${a}</button>`).join('')}</div></div>
        <div class="ob-note">💡 名前やアイコンは、あとから「⚙」でいつでも変更できます。</div>`;
    }
    if (ob.step === 1) {
      return `
        <h2 class="ob-title">なぜ、勉強する？</h2>
        <p class="ob-sub">この答えが、やる気が落ちたときにあなたを連れ戻します。</p>
        <div class="ob-chips">${WHY_PRESETS.map((w) => `<button class="ob-chip ${ob.why === w ? 'selected' : ''}" data-action="ob-why" data-why="${esc(w)}">${esc(w)}</button>`).join('')}</div>
        <div class="field"><label>自分の言葉で（自由に）</label><textarea id="ob-why" placeholder="例：行きたい大学に合格して、家族を安心させたい">${esc(ob.why)}</textarea></div>
        <div class="ob-note">💡 ここで書いた言葉は、ホームと集中画面に表示されます。</div>`;
    }
    if (ob.step === 2) {
      return `
        <h2 class="ob-title">最初のライバルを選ぶ</h2>
        <p class="ob-sub">架空の修行者と「今日の集中時間」で勝負します。追い抜くとボーナス。</p>
        <div class="ob-rivals">${RIVALS.filter(isUnlocked).map((r) => `
          <button class="ob-rival ${ob.rivalId === r.id ? 'selected' : ''}" data-action="ob-rival" data-id="${r.id}" style="--rival-c:${r.color}">
            <span class="rival-avatar">${r.avatar}</span>
            <span class="rival-info"><strong>${esc(r.name)}</strong><small>${esc(r.title)} ・ ${esc(r.style)}</small></span>
            <span class="rival-min">${rivalMinutes(r)}<small>分</small></span>
          </button>`).join('')}</div>
        <div class="ob-note">💡 ライバルは毎日少しずつ強くなります。まずは今日、1セッションから。</div>`;
    }
    if (ob.step === 3) {
      return `
        <h2 class="ob-title">集中の長さと、最初のタスク</h2>
        <p class="ob-sub">無理のない長さで始めましょう。あとから変えられます。</p>
        <div class="field"><label>1セッションの長さ</label><div class="ob-focus">${[15, 25, 45].map((m) => `<button class="ob-focus-opt ${ob.focusMin === m ? 'selected' : ''}" data-action="ob-focus" data-min="${m}"><strong>${m}分</strong><small>${m === 15 ? '軽め' : m === 25 ? '標準' : 'しっかり'}</small></button>`).join('')}</div></div>
        <div class="field"><label>最初のタスク（任意）</label><input id="ob-task" maxlength="60" placeholder="例：英単語 50個を覚える" value="${esc(ob.taskTitle)}" /></div>
        <div style="display:flex;gap:8px">
          <input class="intent-input" id="ob-task-subject" placeholder="科目" style="flex:1" value="${esc(ob.taskSubject)}" />
          <select class="intent-input" id="ob-task-diff" style="flex:0 0 104px">
            <option value="1" ${ob.difficulty === 1 ? 'selected' : ''}>★ 易</option>
            <option value="2" ${ob.difficulty === 2 ? 'selected' : ''}>★★ 中</option>
            <option value="3" ${ob.difficulty === 3 ? 'selected' : ''}>★★★ 難</option>
          </select>
        </div>
        <div class="ob-note">💡 タスクは「タスク」画面からいつでも追加・削除できます。</div>`;
    }
    const rival = RIVALS.find((r) => r.id === ob.rivalId) || RIVALS[0];
    return `
      <h2 class="ob-title">準備完了。</h2>
      <p class="ob-sub">この設定で道場の門をくぐります。</p>
      <div class="ob-summary">
        <div><span>名前</span><strong>${ob.avatar} ${esc(ob.name || '修行者')}</strong></div>
        <div><span>なぜ</span><strong>「${esc(ob.why || '将来の自分を誇れるように。')}」</strong></div>
        <div><span>ライバル</span><strong>${esc(rival.name)}（${esc(rival.title)}）</strong></div>
        <div><span>集中</span><strong>${ob.focusMin} 分</strong></div>
        <div><span>最初のタスク</span><strong>${esc(ob.taskTitle || 'なし')}</strong></div>
      </div>
      <div class="ob-note">💡 次に、画面の使い方を30秒で案内します。</div>`;
  }

  function renderOnboarding() {
    const pct = ((ob.step + 1) / OB_TOTAL) * 100;
    openModal(`
      <div class="ob-wrap">
        <div class="ob-top">
          <div class="ob-brand"><span class="brand-mark small">研</span> 研鑽 KENSAN</div>
          <span class="ob-count">STEP ${ob.step + 1} / ${OB_TOTAL}</span>
        </div>
        <div class="ob-progress"><i style="width:${pct}%"></i></div>
        ${obBody()}
        <div class="ob-actions">
          ${ob.step > 0 ? '<button class="btn ghost" data-action="ob-back">← 戻る</button>' : '<button class="btn ghost" data-action="ob-skip">スキップ</button>'}
          <div style="flex:1"></div>
          ${ob.step < OB_TOTAL - 1
            ? '<button class="btn primary" data-action="ob-next">次へ →</button>'
            : '<button class="btn primary" data-action="ob-finish">道場に入る →</button>'}
        </div>
      </div>
    `, { closable: false });
  }

  function applyOnboarding() {
    state.profile.name = ob.name || '修行者';
    state.profile.why = ob.why || '将来の自分を誇れるように。';
    state.profile.avatar = ob.avatar || '🔥';
    state.settings.focusMin = ob.focusMin || 25;
    state.duel.selected = ob.rivalId || 'hokuto';
    state.focus.mode = 'focus';
    state.focus.minutes = state.settings.focusMin;
    state.focus.remaining = state.focus.minutes * 60;
    state.focus.running = false;
    state.focus.endAt = null;
    if (ob.taskTitle) {
      state.tasks.push({
        id: uid(), title: ob.taskTitle, subject: ob.taskSubject || '科目なし',
        difficulty: ob.difficulty || 2, estimate: ob.difficulty || 2, done: false, createdAt: todayKey(),
      });
    }
    state.onboarded = true;
    state.tourDone = false;
    state.stats.lastActiveDate = todayKey();
    save();
  }

  /* ---------------- guided tour ---------------- */
  let tourSteps = [];
  let tourIndex = 0;

  function buildTourSteps() {
    const mobile = window.matchMedia('(max-width: 820px)').matches;
    return [
      { sel: mobile ? '#mobile-level' : '#level-badge', title: 'レベルとXP', text: '集中するたびにXPが貯まり、称号が上がっていきます。', place: 'bottom' },
      { sel: '.stat-pill.streak', title: '連続日数と金貨', text: '毎日続けると炎が育ちます。1日空けると四つの力が衰えるので注意。', place: 'bottom' },
      { sel: '.quick-stats .stat-tile:nth-child(3)', title: 'ライバルとの差', text: '架空の修行者と今日の集中時間で勝負。追い抜くとボーナスがもらえます。', place: 'bottom' },
      { sel: mobile ? '.mobile-nav [data-view="quests"]' : '.side-nav [data-view="quests"]', title: 'タスク', text: '今日やることを登録して、一つずつ片付けましょう。', place: mobile ? 'top' : 'right' },
      { sel: mobile ? '.fab' : '.topbar-cta', title: '準備完了', text: '迷ったらここ。最初のセッションを始めましょう。', place: mobile ? 'top' : 'bottom' },
    ];
  }

  function startTour() {
    tourSteps = buildTourSteps().filter((s) => document.querySelector(s.sel));
    tourIndex = 0;
    if (!tourSteps.length) { finishTour(false); return; }
    renderTourStep();
  }

  function renderTourStep() {
    const step = tourSteps[tourIndex];
    const el = document.querySelector(step.sel);
    if (!el) { nextTour(); return; }
    el.scrollIntoView({ block: 'center', inline: 'center' });
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const pad = 7;
      const spot = { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
      const cardW = Math.min(300, window.innerWidth - 32);
      const cardH = 176;
      let top, left;
      if (step.place === 'top') { top = spot.top - cardH - 14; left = spot.left + spot.width / 2 - cardW / 2; }
      else if (step.place === 'left') { top = spot.top + spot.height / 2 - cardH / 2; left = spot.left - cardW - 14; }
      else if (step.place === 'right') { top = spot.top + spot.height / 2 - cardH / 2; left = spot.left + spot.width + 14; }
      else { top = spot.top + spot.height + 14; left = spot.left + spot.width / 2 - cardW / 2; }
      left = Math.max(16, Math.min(window.innerWidth - cardW - 16, left));
      top = Math.max(16, Math.min(window.innerHeight - cardH - 16, top));
      $('#tour-root').innerHTML = `
        <div class="tour-overlay">
          <div class="tour-spot" style="top:${spot.top}px;left:${spot.left}px;width:${spot.width}px;height:${spot.height}px"></div>
          <div class="tour-card" style="top:${top}px;left:${left}px;width:${cardW}px">
            <div class="tour-step">GUIDE ${tourIndex + 1} / ${tourSteps.length}</div>
            <h3>${step.title}</h3>
            <p>${step.text}</p>
            <div class="tour-actions">
              <button class="btn small ghost" data-action="tour-skip">スキップ</button>
              <button class="btn small primary" data-action="tour-next">${tourIndex === tourSteps.length - 1 ? '集中を始める' : '次へ →'}</button>
            </div>
          </div>
        </div>`;
    });
  }

  function nextTour() {
    if (tourIndex >= tourSteps.length - 1) { finishTour(true); return; }
    tourIndex += 1;
    renderTourStep();
  }

  function finishTour(startFocus) {
    $('#tour-root').innerHTML = '';
    state.tourDone = true;
    save();
    if (startFocus) { go('focus'); setMode('focus'); startTimer(); }
    else toast('準備完了。いつでも「集中する」から始められます。');
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
      <button class="btn block ghost" style="margin-top:4px" data-action="replay-tour">❔ 使い方ガイドをもう一度見る</button>
      <div class="modal-actions">
        <button class="btn ghost" data-action="reset-data">データを消す</button>
        <button class="btn primary" data-action="save-profile">保存する</button>
      </div>
    `);
  }

  function egoCardModal() {
    const li = levelInfo();
    const rec = duelRecord();
    const rival = currentRival();
    const card = [
      `【 研鑽 KENSAN — 修行者カード 】`,
      `${state.profile.avatar} ${state.profile.name} / ${li.title.name} (Lv.${li.level})`,
      `意欲 ${Math.round(state.drivers.motivation)} | 規律 ${Math.round(state.drivers.discipline)} | 執着 ${Math.round(state.drivers.obsession)} | 自我 ${Math.round(state.drivers.ego)}`,
      `連続 ${state.stats.streak}日 · 通算 ${state.stats.totalMinutes}分 · 対決 ${rec.wins}勝${rec.losses}敗`,
      `ライバル: ${rival.name}（${rival.title}）`,
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
            対決 ${rec.wins}勝${rec.losses}敗 / 最高コンボ ${state.stats.bestCombo}<br>
            ライバル：${esc(rival.name)}（${esc(rival.title)}）<br>
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
      case 'continue-focus': closeModal(); go('focus'); setMode('focus'); startTimer(); break;
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
        if (state.focus.mode === 'focus') { state.focus.minutes = state.settings.focusMin; if (!state.focus.running) state.focus.remaining = state.focus.minutes * 60; }
        if (state.focus.mode === 'short') { state.focus.minutes = state.settings.breakMin; if (!state.focus.running) state.focus.remaining = state.focus.minutes * 60; }
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
        state = defaultState(); save(); closeModal(); onboardingModal(); break;
      case 'ob-next': captureObStep(); ob.step = Math.min(OB_TOTAL - 1, ob.step + 1); renderOnboarding(); break;
      case 'ob-back': captureObStep(); ob.step = Math.max(0, ob.step - 1); renderOnboarding(); break;
      case 'ob-skip':
        applyOnboarding();
        state.tourDone = true;
        save(); closeModal(); go('home'); renderAll();
        toast('設定は「⚙」からいつでも変更できます');
        break;
      case 'ob-avatar': captureObStep(); ob.avatar = el.dataset.avatar; renderOnboarding(); break;
      case 'ob-why': captureObStep(); ob.why = el.dataset.why; renderOnboarding(); break;
      case 'ob-rival': captureObStep(); ob.rivalId = el.dataset.id; renderOnboarding(); break;
      case 'ob-focus': captureObStep(); ob.focusMin = Number(el.dataset.min); renderOnboarding(); break;
      case 'ob-finish':
        captureObStep();
        applyOnboarding();
        closeModal();
        go('home');
        startTour();
        break;
      case 'tour-next': nextTour(); break;
      case 'tour-skip': finishTour(false); break;
      case 'replay-tour': closeModal(); go('home'); setTimeout(startTour, 300); break;
      case 'select-rival': selectRival(el.dataset.id); break;
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

  window.addEventListener('resize', () => {
    const tourRoot = $('#tour-root');
    if (tourRoot && tourRoot.children.length) renderTourStep();
  });

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
