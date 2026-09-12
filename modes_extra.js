/* ============================================================
 * 世界语言方块 · 通用玩法扩展包 v4
 * ------------------------------------------------------------
 * 基于 window.ELC 扩展 API。
 * 修复：关卡地图改为居中弹窗（返回常驻）、听力加下一关按钮、
 *       自定义关卡导航、模式卡双图标、拼音声调
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
        + '.lis-speaker { width: 130px; height: 130px; border-radius: 50%; border: 3px solid #f1c40f; background: radial-gradient(circle at 35% 30%, #2a3f6e, #16213e); color: #f1c40f; font-size: 3.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 26px rgba(241,196,15,.35); margin: 6px 0; }'
        + '.lis-speaker:active { transform: scale(.94); }'
        + '.lis-tip { color: rgba(255,255,255,.65); font-size: .9rem; }'
        + '.lis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 640px; }'
        + '.lis-opt { background: linear-gradient(160deg,#0f3460,#16213e); border: 2px solid rgba(255,255,255,.18); border-radius: 14px; color: #eee; padding: 18px 10px; font-size: 1.25rem; font-weight: 700; cursor: pointer; min-height: 64px; }'
        + '.lis-opt.ok { border-color: #53d769; background: rgba(83,215,105,.18); }'
        + '.lis-opt.bad { border-color: #e94560; background: rgba(233,69,96,.18); animation: exshake .3s; }'
        + '@keyframes exshake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }'
        + '.lis-mean { min-height: 26px; color: #f1c40f; font-size: 1rem; text-align: center; }'
        + '/* 居中弹窗通用 */'
        + '.ex-modal { position: fixed; inset: 0; z-index: 1500; display: flex; align-items: center; justify-content: center; background: rgba(6,10,24,.9); padding: 18px; box-sizing: border-box; }'
        + '.ex-panel { background: linear-gradient(160deg,#0f3460,#16213e); border: 2px solid rgba(255,255,255,.18); border-radius: 18px; padding: 22px 20px; text-align: center; max-width: 92vw; width: 440px; max-height: 82vh; display: flex; flex-direction: column; gap: 12px; margin: auto; }'
        + '.ex-panel h2 { margin: 0; color: #f1c40f; font-size: 1.3rem; flex-shrink: 0; }'
        + '.ex-panel .big { font-size: 2rem; font-weight: 900; color: #eee; }'
        + '.ex-col { display: flex; flex-direction: column; gap: 10px; }'
        + '.ex-scroll { overflow-y: auto; flex: 1; min-height: 0; }'
        + '/* 学习卡弹窗 */'
        + '.ex-learn { position: fixed; inset: 0; z-index: 1520; display: flex; align-items: center; justify-content: center; background: rgba(6,10,24,.72); }'
        + '.ex-learn-card { background: linear-gradient(160deg,#f1c40f,#e94560); border-radius: 22px; padding: 26px 34px; text-align: center; color: #fff; box-shadow: 0 14px 44px rgba(0,0,0,.55); animation: expop .3s ease; max-width: 86vw; }'
        + '.ex-learn-card .thumb { font-size: 4rem; line-height: 1.15; filter: drop-shadow(0 4px 8px rgba(0,0,0,.3)); }'
        + '.ex-learn-card .w { font-size: 2.2rem; font-weight: 900; margin-top: 6px; text-shadow: 0 2px 6px rgba(0,0,0,.25); }'
        + '.ex-learn-card .p { font-size: 1.05rem; opacity: .95; margin-top: 2px; }'
        + '.ex-learn-card .m { font-size: 1.1rem; opacity: .96; margin-top: 4px; }'
        + '@keyframes expop { 0% { transform: scale(.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }'
        + '/* 关卡地图弹窗 */'
        + '.ex-map { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }'
        + '.ex-map-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px; border-radius: 12px; border: 2px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); color: #eee; cursor: pointer; text-align: left; }'
        + '.ex-map-item.locked { opacity: .45; cursor: not-allowed; }'
        + '.ex-map-item:active { transform: scale(.96); }'
        + '.ex-map-item .n { font-weight: 700; font-size: .95rem; }'
        + '.ex-map-item .s { color: #f1c40f; font-size: .85rem; white-space: nowrap; }'
        + '/* 记忆配对 */'
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
        + '/* 复习提醒 */'
        + '#ex-review { position: fixed; inset: 0; z-index: 1500; display: none; align-items: center; justify-content: center; background: rgba(6,10,24,.88); padding: 18px; box-sizing: border-box; }'
        + '#ex-review .ex-words { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 420px; }'
        + '#ex-review .ex-wchip { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.22); border-radius: 10px; padding: 7px 12px; color: #eee; font-size: .92rem; cursor: pointer; }'
        + '@media (max-width: 700px) { .lis-grid { gap: 9px; } .lis-opt { font-size: 1.05rem; padding: 14px 8px; } .mem-grid { gap: 8px; } .ex-learn-card { padding: 20px 26px; } .ex-learn-card .thumb { font-size: 3.2rem; } .ex-learn-card .w { font-size: 1.8rem; } }';

    function injectCSS() {
        if (document.getElementById('elc-extra-css')) return;
        var st = document.createElement('style');
        st.id = 'elc-extra-css';
        st.textContent = CSS;
        document.head.appendChild(st);
    }

    /* ===== 工具 ===== */
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function sampleOthers(pool, not, n) { var o = pool.filter(function (x) { return x.word !== not.word; }); shuffle(o); return o.slice(0, n); }

    /* ===== DIY 词源 ===== */
    function parseCustomText(text) {
        var list = [];
        String(text || '').split(/[\n;]+/).forEach(function (line) {
            line = line.trim(); if (!line) return;
            var m = line.split(/[,，\t]/);
            if (m.length >= 2 && m[0] && m[1]) list.push({ word: m[0].trim(), mean: m.slice(1).join(',').trim() });
            else { var mm = line.split(/\s+/); if (mm.length >= 2) list.push({ word: mm[0], mean: mm.slice(1).join(' ') }); }
        });
        return list;
    }
    function pickPool(src) {
        if (src === true) {
            var c = ELC.customPack();
            if (c && c.length >= 4) return c.map(function (x) { return { word: x.word, display: x.word, mean: x.mean, tts: x.word, emoji: '📖' }; });
        }
        if (src === 'uploads') {
            var lv = levelsFromUploads();
            var out = [];
            lv.forEach(function (words) { out = out.concat(words); });
            return out;
        }
        return ELC.words();
    }

    /* ===== 关卡体系 ===== */
    var LIS_PER = 10, MEM_WORDS_PER = 6, MAX_LEVELS = 20;
    function buildLevels(pool, per) {
        var lv = [];
        for (var i = 0; i < pool.length && lv.length < MAX_LEVELS; i += per) lv.push(pool.slice(i, i + per));
        return lv;
    }
    function levelsFromUploads() {
        var ups = ELC.uploadedLevels();
        var lv = [];
        ups.forEach(function (u) {
            var words = (u.words || []).map(function (w) {
                return { word: w[0], display: w[0], mean: w[1], tts: w[0], emoji: '📦' };
            });
            if (words.length >= 4) lv.push(words.slice(0, 20));
        });
        return lv.slice(0, MAX_LEVELS);
    }
    function loadProg(key) { try { var p = JSON.parse(localStorage.getItem(key)); if (p && p.unlocked) return p; } catch (e) {} return { unlocked: 1, stars: {} }; }
    function saveProg(key, p) { try { localStorage.setItem(key, JSON.stringify(p)); } catch (e) {} }
    function starStr(n) { return n > 0 ? '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n) : '☆☆☆'; }

    /* ===== 居中弹窗通用 ===== */
    function openModal(html) {
        closeModal();
        var el = document.createElement('div');
        el.id = 'ex-modal-overlay';
        el.className = 'ex-modal';
        el.innerHTML = html;
        document.body.appendChild(el);
        return el;
    }
    function closeModal() { var el = document.getElementById('ex-modal-overlay'); if (el) el.remove(); }

    /* ===== 关卡地图（居中弹窗，返回常驻） ===== */
    function openMap(title, levels, prog, onPick) {
        var html = '<div class="ex-panel">'
            + '<h2>' + title + ' · ' + ELC.t('m3Map') + '</h2>'
            + '<div class="ex-scroll"><div class="ex-map" id="ex-map-list"></div></div>'
            + '<button class="btn-action btn-secondary" id="ex-map-back" style="flex-shrink:0;">' + ELC.t('back') + '</button>'
            + '</div>';
        var overlay = openModal(html);
        var list = document.getElementById('ex-map-list');
        list.innerHTML = '';
        levels.forEach(function (words, i) {
            var locked = i + 1 > prog.unlocked;
            var st = prog.stars[i + 1] || 0;
            var b = document.createElement('button');
            b.className = 'ex-map-item' + (locked ? ' locked' : '');
            b.innerHTML = '<span class="n">' + ELC.t('qStage', { n: i + 1 }) + ' · ' + words[0].display + '…</span><span class="s">' + (locked ? '🔒' : starStr(st)) + '</span>';
            if (!locked) b.addEventListener('click', function () { closeModal(); ELC.click(); onPick(i); });
            list.appendChild(b);
        });
        document.getElementById('ex-map-back').addEventListener('click', function () { closeModal(); ELC.click(); ELC.closeExtraView(); });
    }

    /* ===== 词源选择弹窗 ===== */
    function openPackPicker(onPick) {
        var custom = ELC.customPack();
        var ups = ELC.uploadedLevels();
        var html = '<div class="ex-panel">'
            + '<h2>' + ELC.t('packDaily') + ' / ' + ELC.t('packCustom') + '</h2>'
            + '<div class="ex-col">'
            + '<button class="btn-action" id="ex-use-core">' + ELC.t('packDaily') + '</button>'
            + (ups.length ? '<button class="btn-action" id="ex-use-uploads">' + ELC.t('uploadLevel') + ' (' + ups.length + ')</button>' : '')
            + '<button class="btn-action btn-secondary" id="ex-use-custom">' + ELC.t('packCustom') + (custom ? ' (' + custom.length + ')' : '') + '</button>'
            + '</div>'
            + '<div id="ex-custom-area" style="display:none;">'
            + '<textarea id="ex-custom-text" style="width:100%;min-height:120px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:#eee;padding:10px;box-sizing:border-box;font-family:inherit;"></textarea>'
            + '<div style="color:rgba(255,255,255,.55);font-size:.8rem;text-align:left;margin-top:4px;">' + ELC.t('customTip') + '</div>'
            + '<button class="btn-action" id="ex-custom-start" style="margin-top:8px;">' + ELC.t('uploadStart') + '</button>'
            + '</div>'
            + '<button class="btn-action btn-secondary" id="ex-pack-back">' + ELC.t('back') + '</button>'
            + '</div>';
        var overlay = openModal(html);
        document.getElementById('ex-use-core').addEventListener('click', function () { closeModal(); ELC.click(); onPick(false); });
        document.getElementById('ex-pack-back').addEventListener('click', function () { closeModal(); ELC.click(); ELC.closeExtraView(); });
        var upBtn = document.getElementById('ex-use-uploads');
        if (upBtn) upBtn.addEventListener('click', function () { closeModal(); ELC.click(); onPick('uploads'); });
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
            closeModal();
            onPick(true);
        });
    }

    /* ===== 学习卡：居中弹窗（缩略图+词+拼音+释义） ===== */
    var learnTimer = null;
    function showLearnCard(word) {
        var old = document.getElementById('ex-learn-card');
        if (old) old.remove();
        if (learnTimer) { clearTimeout(learnTimer); learnTimer = null; }
        var pinyin = '';
        if (window.ZH_PINYIN) {
            pinyin = (ELC.learningLang === 'zh') ? (window.ZH_PINYIN[word.display] || window.ZH_PINYIN[word.word] || '') : '';
        }
        var el = document.createElement('div');
        el.id = 'ex-learn-card';
        el.className = 'ex-learn';
        var html = '<div class="ex-learn-card">'
            + '<div class="thumb">' + (word.emoji || '📖') + '</div>'
            + '<div class="w">' + word.display + '</div>';
        if (pinyin) html += '<div class="p">' + pinyin + '</div>';
        html += '<div class="m">' + word.mean + '</div></div>';
        el.innerHTML = html;
        el.addEventListener('click', function () { el.remove(); if (learnTimer) { clearTimeout(learnTimer); learnTimer = null; } });
        document.body.appendChild(el);
        learnTimer = setTimeout(function () { var x = document.getElementById('ex-learn-card'); if (x) x.remove(); }, 2100);
    }

    /* ===== 暂停菜单（居中弹窗） ===== */
    function openPause(titleText, onResume, onReplay, onMap, onExit) {
        var old = document.getElementById('ex-pause');
        if (old) old.remove();
        var el = document.createElement('div');
        el.id = 'ex-pause';
        el.className = 'ex-modal';
        el.innerHTML = '<div class="ex-panel">'
            + '<h2>' + titleText + '</h2>'
            + '<div class="ex-col">'
            + '<button class="btn-action" id="ex-p-resume">' + ELC.t('m3Resume') + '</button>'
            + '<button class="btn-action btn-secondary" id="ex-p-replay">' + ELC.t('m3Restart') + '</button>'
            + '<button class="btn-action btn-secondary" id="ex-p-map">' + ELC.t('m3Map') + '</button>'
            + '<button class="btn-action btn-secondary" id="ex-p-exit">' + ELC.t('qHome') + '</button>'
            + '</div></div>';
        document.body.appendChild(el);
        document.getElementById('ex-p-resume').addEventListener('click', function () { el.remove(); onResume(); });
        document.getElementById('ex-p-replay').addEventListener('click', function () { el.remove(); onReplay(); });
        document.getElementById('ex-p-map').addEventListener('click', function () { el.remove(); onMap(); });
        document.getElementById('ex-p-exit').addEventListener('click', function () { el.remove(); onExit(); });
    }

    /* ===== 过关结算（居中弹窗 + 下一关按钮） ===== */
    function openEndPanel(endId, titleText, stars, scoreText, buttons) {
        var old = document.getElementById(endId);
        if (old) old.remove();
        var el = document.createElement('div');
        el.id = endId;
        el.className = 'ex-modal';
        var btnHtml = buttons.map(function (b, i) {
            return '<button class="btn-action' + (b.secondary ? ' btn-secondary' : '') + '" data-bidx="' + i + '">' + b.label + '</button>';
        }).join('');
        el.innerHTML = '<div class="ex-panel">'
            + '<h2>' + titleText + '</h2>'
            + (stars ? '<div style="color:#f1c40f;font-size:1.7rem;letter-spacing:6px;">' + stars + '</div>' : '')
            + '<div class="big">' + scoreText + '</div>'
            + '<div class="ex-col" id="' + endId + '-btns">' + btnHtml + '</div>'
            + '</div>';
        document.body.appendChild(el);
        buttons.forEach(function (b, i) {
            var btn = el.querySelector('[data-bidx="' + i + '"]');
            if (btn) btn.addEventListener('click', function () { el.remove(); ELC.click(); b.fn(); });
        });
    }

    /* ===== 复习提醒 ===== */
    var REVIEW_HOURS = [6, 12, 18, 22];
    function todayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function currentSlot() { var h = new Date().getHours(); var s = -1; for (var i = 0; i < REVIEW_HOURS.length; i++) { if (h >= REVIEW_HOURS[i]) s = i; } return s; }
    function startReviewTimer() {
        var check = function () {
            try {
                if (!window.ELC) return;
                if (localStorage.getItem('elc_review_off') === todayStr()) return;
                var slot = currentSlot(); if (slot < 0) return;
                var sKey = 'elc_review_done_' + todayStr() + '_' + slot;
                if (localStorage.getItem(sKey)) return;
                var learned = ELC.learnedWords();
                if (learned.length < 4) return;
                localStorage.setItem(sKey, '1');
                showReviewPopup();
                notifyReview(learned.length);
            } catch (e) {}
        };
        check();
        setInterval(check, 60000);
        var askNotif = function () {
            if ('Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission(); } catch (e) {} }
            document.removeEventListener('click', askNotif);
            document.removeEventListener('touchstart', askNotif);
        };
        document.addEventListener('click', askNotif);
        document.addEventListener('touchstart', askNotif);
    }
    function showReviewPopup() {
        if (document.getElementById('ex-review')) return;
        var learned = shuffle(ELC.learnedWords()).slice(0, 6);
        if (!learned.length) return;
        var el = document.createElement('div');
        el.id = 'ex-review';
        el.innerHTML = '<div class="ex-panel">'
            + '<h2>' + ELC.t('reviewTitle') + '</h2>'
            + '<div style="color:#eee;">' + ELC.t('reviewDesc', { n: learned.length }) + '</div>'
            + '<div class="ex-words">' + learned.map(function (x) { return '<button class="ex-wchip" data-w="' + x.w + '">🔊 ' + x.w + '</button>'; }).join('') + '</div>'
            + '<div class="ex-col">'
            + '<button class="btn-action" id="ex-r-start">' + ELC.t('reviewStart') + '</button>'
            + '<button class="btn-action btn-secondary" id="ex-r-off">' + ELC.t('reviewOff') + '</button>'
            + '<button class="btn-action btn-secondary" id="ex-r-ok">' + ELC.t('reviewLater') + '</button>'
            + '</div></div>';
        document.body.appendChild(el);
        el.querySelectorAll('.ex-wchip').forEach(function (chip) { chip.addEventListener('click', function () { ELC.tts(chip.dataset.w); }); });
        document.getElementById('ex-r-start').addEventListener('click', function () { ELC.click(); el.remove(); var c0 = document.querySelectorAll('#modeExtraCards .mode-card')[0]; if (c0) c0.click(); });
        document.getElementById('ex-r-off').addEventListener('click', function () { ELC.click(); el.remove(); });
        document.getElementById('ex-r-ok').addEventListener('click', function () { ELC.click(); el.remove(); });
    }
    function notifyReview(n) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try { new Notification(ELC.t('reviewTitle'), { body: ELC.t('reviewDesc', { n: n }), icon: 'icons/icon-192.png', tag: 'elc-review' }); } catch (e) {}
    }

    /* ===== 模式 1：🎧 听力挑战 ===== */
    function startListen() {
        openPackPicker(function (src) {
            var pool = pickPool(src);
            var levels = buildLevels(pool, LIS_PER);
            var srcTag = src === true ? 'c' : (src === 'uploads' ? 'up' : 'core');
            beginListenLevels(levels, srcTag);
        });
    }
    function beginListenLevels(levels, srcTag) {
        if (!levels.length) { ELC.toast(ELC.t('errNoWords')); ELC.closeExtraView(); return; }
        var progKey = 'elc_listen_prog_' + ELC.learningLang + '_' + srcTag;
        var prog = loadProg(progKey);
        openMap(ELC.t('mcListenName'), levels, prog, function (idx) {
            playListenLevel(levels, idx, prog, progKey, srcTag);
        });
    }
    function playListenLevel(levels, idx, prog, progKey, srcTag) {
        var words = levels[idx];
        var state = { score: 0, streak: 0, best: 0, hearts: 3, asked: 0, order: shuffle(words.slice()), cur: null, lock: false, paused: false, pendingNext: false };
        var highKey = 'elc_listen_high_' + ELC.learningLang;
        var high = parseInt(localStorage.getItem(highKey) || '0', 10);

        ELC.openExtraView(
            '<div class="ex-top">'
            + '<button class="ex-btn" id="lis-pause">⏸ ' + ELC.t('qPauseBtn') + '</button>'
            + '<div class="ex-title">' + ELC.t('mcListenName') + '</div>'
            + '<div class="ex-stat">⭐ <span id="lis-score">0</span>　❤️ <span id="lis-hearts">3</span>　🔥 <span id="lis-streak">0</span></div>'
            + '</div>'
            + '<div class="lis-mean" id="lis-mean"></div>'
            + '<button class="lis-speaker" id="lis-play">🔊</button>'
            + '<div class="lis-tip">' + ELC.t('wListen') + '</div>'
            + '<div class="lis-grid" id="lis-grid"></div>');

        function updateHUD() {
            document.getElementById('lis-score').textContent = state.score;
            document.getElementById('lis-hearts').textContent = state.hearts;
            document.getElementById('lis-streak').textContent = state.streak;
        }
        function question() {
            if (state.paused) { state.pendingNext = true; return; }
            if (state.hearts <= 0 || state.asked >= words.length) { end(); return; }
            state.cur = state.order[state.asked];
            state.asked++;
            state.lock = false;
            var nOpts = state.streak >= 6 ? 5 : 4;
            var others = sampleOthers(words, state.cur, Math.min(nOpts - 1, Math.max(0, words.length - 1)));
            if (others.length < nOpts - 1) others = others.concat(sampleOthers(ELC.words(), state.cur, nOpts - 1 - others.length));
            var opts = shuffle(others.slice(0, nOpts - 1).concat([state.cur]));
            var grid = document.getElementById('lis-grid');
            grid.innerHTML = '';
            opts.forEach(function (o) {
                var b = document.createElement('button');
                b.className = 'lis-opt';
                b.textContent = o.display;
                b.addEventListener('click', function () { answer(o, b); });
                grid.appendChild(b);
            });
            var meanEl = document.getElementById('lis-mean'); if (meanEl) meanEl.textContent = '';
            setTimeout(function () { if (!state.paused && state.cur) ELC.tts(state.cur.tts); }, 250);
        }
        function answer(o, btn) {
            if (state.lock) return;
            state.lock = true;
            var ok = o.word === state.cur.word;
            if (ok) {
                btn.classList.add('ok');
                state.streak++;
                state.score += 50 + Math.min(state.streak, 10) * 10;
                ELC.tone(880, 0.08, 'sine', 0.1);
            } else {
                btn.classList.add('bad');
                state.hearts--; state.streak = 0;
                ELC.tone(160, 0.2, 'sawtooth', 0.12);
                document.querySelectorAll('#lis-grid .lis-opt').forEach(function (el) {
                    if (el.textContent === state.cur.display) el.classList.add('ok');
                });
            }
            var meanEl = document.getElementById('lis-mean'); if (meanEl) meanEl.textContent = state.cur.display + ' · ' + state.cur.mean;
            showLearnCard(state.cur);
            updateHUD();
            setTimeout(function () { if (!state.paused) question(); else state.pendingNext = true; }, ok ? 1500 : 2100);
        }
        function end() {
            var pass = state.hearts > 0;
            var stars = !pass ? 0 : (state.hearts >= 3 ? 3 : (state.hearts === 2 ? 2 : 1));
            if (pass) { prog.stars[idx + 1] = Math.max(prog.stars[idx + 1] || 0, stars); prog.unlocked = Math.max(prog.unlocked, Math.min(idx + 2, levels.length)); saveProg(progKey, prog); }
            var isHigh = state.score > high;
            if (isHigh) { localStorage.setItem(highKey, String(state.score)); high = state.score; }
            var btns = [
                { label: ELC.t('m3Again'), fn: function () { playListenLevel(levels, idx, prog, progKey, srcTag); } }
            ];
            if (pass && idx + 1 < levels.length) {
                btns.unshift({ label: ELC.t('qNextStage'), fn: function () { playListenLevel(levels, idx + 1, prog, progKey, srcTag); } });
            }
            btns.push({ label: ELC.t('m3Map'), secondary: true, fn: function () { beginListenLevels(levels, srcTag); } });
            btns.push({ label: ELC.t('qHome'), secondary: true, fn: function () { ELC.closeExtraView(); } });
            openEndPanel('lis-end', pass ? ELC.t('qWin') : ELC.t('qFail'), stars ? starStr(stars) : '', String(state.score), btns);
        }
        document.getElementById('lis-play').addEventListener('click', function () { if (state.cur) ELC.tts(state.cur.tts); });
        document.getElementById('lis-pause').addEventListener('click', function () {
            state.paused = true;
            openPause(ELC.t('mcListenName'),
                function () { state.paused = false; if (state.pendingNext) { state.pendingNext = false; question(); } },
                function () { state.paused = false; playListenLevel(levels, idx, prog, progKey, srcTag); },
                function () { beginListenLevels(levels, srcTag); },
                function () { ELC.closeExtraView(); });
        });
        updateHUD();
        question();
    }

    /* ===== 模式 2：🃏 记忆配对 ===== */
    function startMemory() {
        openPackPicker(function (src) {
            var pool = pickPool(src);
            var levels = buildLevels(pool, MEM_WORDS_PER);
            var srcTag = src === true ? 'c' : (src === 'uploads' ? 'up' : 'core');
            beginMemoryLevels(levels, srcTag);
        });
    }
    function beginMemoryLevels(levels, srcTag) {
        if (!levels.length) { ELC.toast(ELC.t('errNoWords')); ELC.closeExtraView(); return; }
        var progKey = 'elc_mem_prog_' + ELC.learningLang + '_' + srcTag;
        var prog = loadProg(progKey);
        openMap(ELC.t('mcMemName'), levels, prog, function (idx) {
            playMemoryLevel(levels, idx, prog, progKey, srcTag);
        });
    }
    function playMemoryLevel(levels, idx, prog, progKey, srcTag) {
        var words = levels[idx];
        var state = { round: idx + 1, moves: 0, score: 0, first: null, lock: false, matched: 0, total: words.length, paused: false };
        var bestKey = 'elc_mem_best_' + ELC.learningLang;
        var bestRound = parseInt(localStorage.getItem(bestKey) || '1', 10);

        ELC.openExtraView(
            '<div class="ex-top">'
            + '<button class="ex-btn" id="mem-pause">⏸ ' + ELC.t('qPauseBtn') + '</button>'
            + '<div class="ex-title">' + ELC.t('mcMemName') + '</div>'
            + '<div class="ex-stat" id="mem-stat"></div>'
            + '</div>'
            + '<div class="mem-grid" id="mem-grid"></div>');

        function updateHUD() {
            document.getElementById('mem-stat').innerHTML = ELC.t('qStage', { n: state.round }) + '　' + ELC.t('m3Steps') + ' ' + state.moves + '　⭐ ' + state.score;
        }
        function buildGrid() {
            var cards = [];
            words.forEach(function (w, i) {
                cards.push({ pair: i, type: 'word', text: w.display, word: w });
                cards.push({ pair: i, type: 'mean', text: w.mean, word: w });
            });
            shuffle(cards);
            state.matched = 0; state.total = words.length; state.first = null; state.lock = false;
            var grid = document.getElementById('mem-grid');
            grid.innerHTML = '';
            cards.forEach(function (c) {
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
            if (state.paused || state.lock || btn.classList.contains('flip') || btn.classList.contains('done')) return;
            btn.classList.add('flip');
            if (!state.first) { state.first = { btn: btn, card: card }; return; }
            var a = state.first; state.first = null;
            state.moves++;
            updateHUD();
            if (a.card.pair === card.pair && a.card.type !== card.type) {
                a.btn.classList.add('done'); btn.classList.add('done');
                state.matched++;
                state.score += 100;
                ELC.tone(660, 0.1, 'sine', 0.1);
                showLearnCard(card.word);
                ELC.tts(card.word.tts);
                updateHUD();
                if (state.matched >= state.total) setTimeout(levelDone, 1100);
            } else {
                state.lock = true;
                setTimeout(function () { a.btn.classList.remove('flip'); btn.classList.remove('flip'); state.lock = false; }, 850);
            }
        }
        function levelDone() {
            var stars = state.moves <= 9 ? 3 : (state.moves <= 16 ? 2 : 1);
            prog.stars[idx + 1] = Math.max(prog.stars[idx + 1] || 0, stars);
            prog.unlocked = Math.max(prog.unlocked, Math.min(idx + 2, levels.length));
            saveProg(progKey, prog);
            var btns = [];
            if (idx + 1 < levels.length) btns.push({ label: ELC.t('qNextStage'), fn: function () { playMemoryLevel(levels, idx + 1, prog, progKey, srcTag); } });
            btns.push({ label: ELC.t('qReplay'), secondary: true, fn: function () { playMemoryLevel(levels, idx, prog, progKey, srcTag); } });
            btns.push({ label: ELC.t('m3Map'), secondary: true, fn: function () { beginMemoryLevels(levels, srcTag); } });
            openEndPanel('mem-end', ELC.t('qWin'), starStr(stars), String(state.score), btns);
        }
        document.getElementById('mem-pause').addEventListener('click', function () {
            state.paused = true;
            openPause(ELC.t('mcMemName'),
                function () { state.paused = false; },
                function () { playMemoryLevel(levels, idx, prog, progKey, srcTag); },
                function () { beginMemoryLevels(levels, srcTag); },
                function () { ELC.closeExtraView(); });
        });
        buildGrid();
    }

    /* ===== 启动 ===== */
    function boot() {
        if (!window.ELC) { setTimeout(boot, 60); return; }
        injectCSS();
        ELC.registerMode({ id: 'listen', icon: '🎧', nameKey: 'mcListenName', descKey: 'mcListenDesc', start: startListen });
        ELC.registerMode({ id: 'memory', icon: '🃏', nameKey: 'mcMemName', descKey: 'mcMemDesc', start: startMemory });
        if (ELC.renderModes) ELC.renderModes();
        startReviewTimer();
    }
    boot();
})();
