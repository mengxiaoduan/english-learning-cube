/* ============================================================
 * 世界语言方块 · 通用玩法扩展包 v1
 * ------------------------------------------------------------
 * 基于 window.ELC 扩展 API 开发，演示新玩法接入方式：
 *   ELC.registerMode({ id, icon, name, desc, start })
 * 内置玩法：
 *   1. 🎧 听力挑战 —— 播放学习语言发音，选出对应词语（练耳朵）
 *   2. 🃏 记忆配对 —— 词语与释义翻牌配对（练记忆）
 * 两者均支持 DIY：玩家可粘贴自定义词表（每行 word,mean）游玩。
 * 未来玩法照此结构接入即可。
 * ============================================================ */
(function () {
    'use strict';

    var CSS = ''
        + '#extra-mode-view { justify-content: flex-start; gap: 12px; }'
        + '.ex-top { width: 100%; max-width: 640px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }'
        + '.ex-title { font-size: 1.3rem; font-weight: 900; background: linear-gradient(to right,#e94560,#f1c40f); -webkit-background-clip: text; background-clip: text; color: transparent; }'
        + '.ex-stat { color: #eee; font-size: .95rem; background: rgba(15,52,96,.6); border-radius: 10px; padding: 5px 12px; }'
        + '.ex-btn { background: rgba(15,52,96,.8); color: #eee; border: 1px solid rgba(255,255,255,.18); border-radius: 10px; padding: 7px 14px; cursor: pointer; font-size: .95rem; }'
        + '.ex-btn:active { transform: scale(.95); }'
        + '.ex-red { background: #e94560; border-color: #e94560; color: #fff; }'
        + '.lis-speaker { width: 130px; height: 130px; border-radius: 50%; border: 3px solid #f1c40f; background: radial-gradient(circle at 35% 30%, #2a3f6e, #16213e); color: #f1c40f; font-size: 3.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 26px rgba(241,196,15,.35); margin: 6px 0; }'
        + '.lis-speaker:active { transform: scale(.94); }'
        + '.lis-tip { color: rgba(255,255,255,.65); font-size: .9rem; }'
        + '.lis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 640px; }'
        + '.lis-opt { background: linear-gradient(160deg,#0f3460,#16213e); border: 2px solid rgba(255,255,255,.18); border-radius: 14px; color: #eee; padding: 18px 10px; font-size: 1.25rem; font-weight: 700; cursor: pointer; min-height: 64px; }'
        + '.lis-opt small { display: block; font-size: .8rem; opacity: .7; margin-top: 4px; font-weight: 400; }'
        + '.lis-opt.ok { border-color: #53d769; background: rgba(83,215,105,.18); }'
        + '.lis-opt.bad { border-color: #e94560; background: rgba(233,69,96,.18); animation: exshake .3s; }'
        + '@keyframes exshake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }'
        + '.lis-mean { min-height: 26px; color: #f1c40f; font-size: 1rem; text-align: center; }'
        + '.ex-panel { background: linear-gradient(160deg,#0f3460,#16213e); border: 2px solid rgba(255,255,255,.18); border-radius: 18px; padding: 24px 20px; text-align: center; max-width: 92vw; width: 460px; display: flex; flex-direction: column; gap: 12px; }'
        + '.ex-panel h2 { margin: 0; color: #f1c40f; font-size: 1.3rem; }'
        + '.ex-panel .big { font-size: 2rem; font-weight: 900; color: #eee; }'
        + '.ex-col { display: flex; flex-direction: column; gap: 10px; }'
        + '.mem-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; max-width: 640px; }'
        + '.mem-card { aspect-ratio: 3/3.4; perspective: 600px; cursor: pointer; background: none; border: none; padding: 0; }'
        + '.mem-inner { position: relative; width: 100%; height: 100%; transition: transform .35s; transform-style: preserve-3d; }'
        + '.mem-card.flip .mem-inner { transform: rotateY(180deg); }'
        + '.mem-face { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; font-weight: 700; padding: 4px; box-sizing: border-box; text-align: center; }'
        + '.mem-back { background: linear-gradient(160deg,#e94560,#b03060); color: #fff; font-size: 1.6rem; }'
        + '.mem-front { background: linear-gradient(160deg,#0f3460,#16213e); border: 2px solid rgba(255,255,255,.2); color: #eee; transform: rotateY(180deg); font-size: 1rem; word-break: break-word; }'
        + '.mem-card.done .mem-front { border-color: #53d769; background: rgba(83,215,105,.16); }'
        + '.mem-word { font-size: 1.1rem; font-weight: 900; }'
        + '.mem-text { font-size: .85rem; opacity: .92; }'
        + '@media (max-width: 700px) { .lis-grid { gap: 9px; } .lis-opt { font-size: 1.05rem; padding: 14px 8px; } .mem-grid { gap: 8px; } }';

    function injectCSS() {
        if (document.getElementById('elc-extra-css')) return;
        var st = document.createElement('style');
        st.id = 'elc-extra-css';
        st.textContent = CSS;
        document.head.appendChild(st);
    }

    /* ---------- DIY：自定义词包 ---------- */
    function parseCustomText(text) {
        var list = [];
        String(text || '').split(/[\n;]+/).forEach(function (line) {
            line = line.trim();
            if (!line) return;
            var m = line.split(/[,，\t]/);
            if (m.length >= 2 && m[0] && m[1]) list.push({ word: m[0].trim(), mean: m.slice(1).join(',').trim() });
            else {
                var mm = line.split(/\s+/);
                if (mm.length >= 2) list.push({ word: mm[0], mean: mm.slice(1).join(' ') });
            }
        });
        return list;
    }
    function pickPool(useCustom) {
        if (useCustom) {
            var c = ELC.customPack();
            if (c && c.length >= 4) return c.map(function (x) { return { word: x.word, display: x.word, mean: x.mean, tts: x.word }; });
        }
        return ELC.words();
    }
    function openPackPicker(onPick) {
        var custom = ELC.customPack();
        var html = '<div class="ex-panel" style="margin:auto;">'
            + '<h2>🎮 ' + ELC.t('packDaily') + ' / ' + ELC.t('packCustom') + '</h2>'
            + '<div class="ex-col">'
            + '<button class="btn-action" id="ex-use-core">📚 ' + ELC.t('packDaily') + '</button>'
            + '<button class="btn-action btn-secondary" id="ex-use-custom">✏️ ' + ELC.t('packCustom') + (custom ? ' (' + custom.length + ')' : '') + '</button>'
            + '</div>'
            + '<div id="ex-custom-area" style="display:none;">'
            + '<textarea id="ex-custom-text" style="width:100%;min-height:120px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:#eee;padding:10px;box-sizing:border-box;font-family:inherit;"></textarea>'
            + '<div style="color:rgba(255,255,255,.55);font-size:.8rem;text-align:left;margin-top:4px;">' + ELC.t('customTip') + '</div>'
            + '<button class="btn-action" id="ex-custom-start" style="margin-top:8px;">' + ELC.t('uploadStart') + '</button>'
            + '</div>'
            + '<button class="btn-action btn-secondary" id="ex-pack-back">' + ELC.t('back') + '</button>'
            + '</div>';
        ELC.openExtraView('<div style="display:flex;flex-direction:column;min-height:100%;justify-content:center;width:100%;">' + html + '</div>');
        document.getElementById('ex-use-core').addEventListener('click', function () { ELC.click(); onPick(false); });
        document.getElementById('ex-pack-back').addEventListener('click', function () { ELC.click(); ELC.closeExtraView(); });
        document.getElementById('ex-use-custom').addEventListener('click', function () {
            ELC.click();
            var area = document.getElementById('ex-custom-area');
            area.style.display = area.style.display === 'none' ? 'block' : 'none';
            var ta = document.getElementById('ex-custom-text');
            if (custom && custom.length && !ta.value) {
                ta.value = custom.map(function (x) { return x.word + ',' + x.mean; }).join('\n');
            }
        });
        document.getElementById('ex-custom-start').addEventListener('click', function () {
            ELC.click();
            var list = parseCustomText(document.getElementById('ex-custom-text').value);
            if (list.length < 4) { ELC.toast(ELC.t('errEmpty')); return; }
            ELC.setCustomPack(list);
            onPick(true);
        });
    }

    /* ---------- 通用：打乱 / 去重取样 ---------- */
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function sampleOthers(pool, not, n) {
        var others = pool.filter(function (x) { return x.word !== not.word; });
        shuffle(others);
        return others.slice(0, n);
    }

    /* ============================================================
     * 模式 1：🎧 听力挑战
     * ============================================================ */
    function startListen() {
        openPackPicker(function (useCustom) { beginListen(useCustom); });
    }

    function beginListen(useCustom) {
        var pool = pickPool(useCustom);
        if (pool.length < 4) { ELC.toast(ELC.t('errNoWords')); ELC.closeExtraView(); return; }
        var state = { score: 0, streak: 0, best: 0, hearts: 3, qn: 0, cur: null, lock: false };
        var highKey = 'elc_listen_high_' + ELC.learningLang;
        var high = parseInt(localStorage.getItem(highKey) || '0', 10);

        ELC.openExtraView(
            '<div class="ex-top">'
            + '<button class="ex-btn" id="lis-exit">✕ ' + ELC.t('qExit') + '</button>'
            + '<div class="ex-title">🎧 ' + ELC.t('mcListenName') + '</div>'
            + '<div class="ex-stat">⭐ <span id="lis-score">0</span>　❤️ <span id="lis-hearts">3</span>　🔥 <span id="lis-streak">0</span></div>'
            + '</div>'
            + '<div class="lis-mean" id="lis-mean"></div>'
            + '<button class="lis-speaker" id="lis-play">🔊</button>'
            + '<div class="lis-tip">' + ELC.t('wListen') + '</div>'
            + '<div class="lis-grid" id="lis-grid"></div>'
            + '<div id="lis-end" style="display:none;" class="ex-panel">'
            + '<h2 id="lis-end-title"></h2>'
            + '<div class="big" id="lis-end-score"></div>'
            + '<div id="lis-end-best" style="color:#f1c40f;"></div>'
            + '<div class="ex-col">'
            + '<button class="btn-action" id="lis-again">' + ELC.t('m3Again') + '</button>'
            + '<button class="btn-action btn-secondary" id="lis-home">' + ELC.t('qHome') + '</button>'
            + '</div></div>');

        function updateHUD() {
            document.getElementById('lis-score').textContent = state.score;
            document.getElementById('lis-hearts').textContent = state.hearts;
            document.getElementById('lis-streak').textContent = state.streak;
        }
        function speakCurrent(first) {
            ELC.tts(state.cur.tts);
        }
        function question() {
            if (state.hearts <= 0) { end(); return; }
            state.qn++;
            state.cur = pool[Math.floor(Math.random() * pool.length)];
            var nOpts = state.streak >= 6 ? 5 : 4;
            var opts = sampleOthers(pool, state.cur, nOpts - 1).concat([state.cur]);
            shuffle(opts);
            state.lock = false;
            var grid = document.getElementById('lis-grid');
            grid.innerHTML = '';
            opts.forEach(function (o) {
                var b = document.createElement('button');
                b.className = 'lis-opt';
                b.innerHTML = o.display + (o.mean ? '<small></small>' : '');
                b.addEventListener('click', function () { answer(o, b); });
                grid.appendChild(b);
            });
            document.getElementById('lis-mean').textContent = '';
            setTimeout(speakCurrent, 250);
        }
        function answer(o, btn) {
            if (state.lock) return;
            state.lock = true;
            var ok = o.word === state.cur.word;
            var opts = document.querySelectorAll('#lis-grid .lis-opt');
            if (ok) {
                btn.classList.add('ok');
                state.streak++;
                if (state.streak > state.best) state.best = state.streak;
                state.score += 50 + Math.min(state.streak, 10) * 10;
                ELC.tone(880, 0.08, 'sine', 0.1);
                document.getElementById('lis-mean').textContent = state.cur.display + ' · ' + state.cur.mean;
            } else {
                btn.classList.add('bad');
                state.hearts--; state.streak = 0;
                ELC.tone(160, 0.2, 'sawtooth', 0.12);
                opts.forEach(function (el, i) {
                    /* 高亮正确项 */
                });
                var grid = document.getElementById('lis-grid');
                var kids = grid.querySelectorAll('.lis-opt');
                kids.forEach(function (el) { if (el.textContent.indexOf(state.cur.display) === 0) el.classList.add('ok'); });
                document.getElementById('lis-mean').textContent = state.cur.display + ' · ' + state.cur.mean;
            }
            updateHUD();
            setTimeout(function () { question(); }, ok ? 1000 : 1600);
        }
        function end() {
            var isHigh = state.score > high;
            if (isHigh) { localStorage.setItem(highKey, String(state.score)); high = state.score; }
            document.getElementById('lis-grid').style.display = 'none';
            document.getElementById('lis-speaker').style.display = 'none';
            document.getElementById('lis-tip').style.display = 'none';
            document.getElementById('lis-mean').style.display = 'none';
            document.getElementById('lis-end').style.display = 'flex';
            document.getElementById('lis-end-title').textContent = isHigh ? ELC.t('newRecord') : ELC.t('qFail');
            document.getElementById('lis-end-score').textContent = String(state.score);
            document.getElementById('lis-end-best').textContent = ELC.t('highScore') + ': ' + high + ' · 🔥 ' + state.best;
        }
        document.getElementById('lis-play').addEventListener('click', function () { speakCurrent(); });
        document.getElementById('lis-exit').addEventListener('click', function () { ELC.click(); ELC.closeExtraView(); });
        document.getElementById('lis-again').addEventListener('click', function () { ELC.click(); ELC.closeExtraView(); setTimeout(function () { beginListen(useCustom); }, 60); });
        document.getElementById('lis-home').addEventListener('click', function () { ELC.click(); ELC.closeExtraView(); });
        updateHUD();
        question();
    }

    /* ============================================================
     * 模式 2：🃏 记忆配对
     * ============================================================ */
    function startMemory() {
        openPackPicker(function (useCustom) { beginMemory(useCustom); });
    }

    function beginMemory(useCustom) {
        var pool = pickPool(useCustom);
        if (pool.length < 4) { ELC.toast(ELC.t('errNoWords')); ELC.closeExtraView(); return; }
        var bestKey = 'elc_mem_best_' + ELC.learningLang;
        var state = { round: 1, moves: 0, score: 0, first: null, lock: false, matched: 0, total: 0 };
        var bestRound = parseInt(localStorage.getItem(bestKey) || '1', 10);

        ELC.openExtraView(
            '<div class="ex-top">'
            + '<button class="ex-btn" id="mem-exit">✕ ' + ELC.t('qExit') + '</button>'
            + '<div class="ex-title">🃏 ' + ELC.t('mcMemName') + '</div>'
            + '<div class="ex-stat">' + ELC.t('qStage') + ' <span id="mem-round">1</span>　' + ELC.t('m3Steps') + ' <span id="mem-moves">0</span>　⭐ <span id="mem-score">0</span></div>'
            + '</div>'
            + '<div class="mem-grid" id="mem-grid"></div>'
            + '<div style="color:rgba(255,255,255,.6);font-size:.85rem;" id="mem-best">' + ELC.t('highScore') + ': ' + bestRound + '</div>');

        function pairsFor(r) { return Math.min(4 + Math.floor((r - 1) / 2), 8); }
        function updateHUD() {
            document.getElementById('mem-round').textContent = state.round;
            document.getElementById('mem-moves').textContent = state.moves;
            document.getElementById('mem-score').textContent = state.score;
        }
        function buildRound() {
            var pairs = pairsFor(state.round);
            var picks = shuffle(pool.slice()).slice(0, pairs);
            var cards = [];
            picks.forEach(function (w, i) {
                cards.push({ pair: i, type: 'word', text: w.display });
                cards.push({ pair: i, type: 'mean', text: w.mean, word: w });
            });
            shuffle(cards);
            state.total = pairs; state.matched = 0; state.first = null; state.lock = false;
            var grid = document.getElementById('mem-grid');
            grid.style.gridTemplateColumns = pairs >= 7 ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)';
            grid.innerHTML = '';
            cards.forEach(function (c, idx) {
                var b = document.createElement('button');
                b.className = 'mem-card';
                b.dataset.pair = c.pair;
                b.dataset.type = c.type;
                b.innerHTML = '<div class="mem-inner"><div class="mem-face mem-back">❓</div>'
                    + '<div class="mem-face mem-front ' + (c.type === 'word' ? 'mem-word' : 'mem-text') + '">' + c.text + '</div></div>';
                b.addEventListener('click', function () { flip(b, c); });
                grid.appendChild(b);
            });
            updateHUD();
        }
        function flip(btn, card) {
            if (state.lock || btn.classList.contains('flip') || btn.classList.contains('done')) return;
            btn.classList.add('flip');
            if (!state.first) { state.first = { btn: btn, card: card }; return; }
            var a = state.first; state.first = null;
            state.moves++;
            updateHUD();
            if (a.card.pair === card.pair && a.card.type !== card.type) {
                /* 配对成功 */
                a.btn.classList.add('done'); btn.classList.add('done');
                state.matched++;
                state.score += 100;
                ELC.tone(660, 0.1, 'sine', 0.1);
                /* 巩固：读出词语 */
                ELC.tts(card.word ? card.word.tts : (a.card.word ? a.card.word.tts : ''));
                updateHUD();
                if (state.matched >= state.total) {
                    state.round++;
                    if (state.round > bestRound) { bestRound = state.round; localStorage.setItem(bestKey, String(bestRound)); document.getElementById('mem-best').textContent = ELC.t('highScore') + ': ' + bestRound; }
                    state.score += 200;
                    updateHUD();
                    ELC.toast(ELC.t('qWin'));
                    setTimeout(buildRound, 900);
                }
            } else {
                state.lock = true;
                setTimeout(function () {
                    a.btn.classList.remove('flip');
                    btn.classList.remove('flip');
                    state.lock = false;
                }, 850);
            }
        }
        document.getElementById('mem-exit').addEventListener('click', function () { ELC.click(); ELC.closeExtraView(); });
        buildRound();
    }

    /* ---------- 注册到模式选择屏 ---------- */
    function boot() {
        if (!window.ELC) { setTimeout(boot, 60); return; }
        injectCSS();
        ELC.registerMode({
            id: 'listen',
            icon: '🎧',
            name: ELC.t('mcListenName'),
            desc: ELC.t('mcListenDesc'),
            start: startListen
        });
        ELC.registerMode({
            id: 'memory',
            icon: '🃏',
            name: ELC.t('mcMemName'),
            desc: ELC.t('mcMemDesc'),
            start: startMemory
        });
        if (ELC.renderModes) ELC.renderModes();
    }
    boot();
})();
