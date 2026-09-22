/* ============================================================
 * hero_system.js · 世界语言方块 常驻主角养成系统 v1 (2026.9.22)
 * ------------------------------------------------------------
 * 金币货币 + 商城（输对单词才能买）+ 主角小屋装饰 + 自定义主角形象
 * 挂接点：
 *   window.HERO.addCoins(n, opts)  —— 各模式发金币（填词/闯关/俄罗斯/
 *                                     听力/记忆/击败怪物）
 *   window.HERO.refreshHUD()       —— 刷新所有金币显示
 *   window.HERO.openShop() / openRoom()
 *   window.HERO.avatarHtml()       —— 主角形象（默认 🦸 或玩家上传图）
 * 依赖：window.ELC（game.html 主 IIFE 提供，运行时才调用，加载顺序无关）
 * ============================================================ */
(function () {
    'use strict';

    /* ================= 迷你多语言（zh/en/ru/fr，其余界面语言回退 en） ================= */
    var DICT = {
        shop: { zh: '商城', en: 'Shop', ru: 'Магазин', fr: 'Boutique' },
        room: { zh: '主角小屋', en: 'Hero Room', ru: 'Комната героя', fr: 'Chez le héros' },
        coins: { zh: '金币', en: 'Coins', ru: 'Монеты', fr: 'Pièces' },
        hubTapRoom: { zh: '点我进小屋打扮', en: 'Tap to decorate', ru: 'Нажми, чтобы украсить', fr: 'Touchez pour décorer' },
        hubTapCoins: { zh: '赚金币：填词 / 闯关 / 拼词 / 听力 / 记忆 / 打怪', en: 'Earn coins by playing & fighting monsters', ru: 'Зарабатывай монеты игрой', fr: 'Gagnez des pièces en jouant' },
        all: { zh: '全部', en: 'All', ru: 'Все', fr: 'Tout' },
        catFloor: { zh: '家具', en: 'Furniture', ru: 'Мебель', fr: 'Meubles' },
        catWall: { zh: '墙饰', en: 'Wall', ru: 'Стена', fr: 'Mur' },
        catPet: { zh: '宠物', en: 'Pets', ru: 'Питомцы', fr: 'Animaux' },
        catWear: { zh: '装扮', en: 'Outfit', ru: 'Аксессуары', fr: 'Accessoires' },
        owned: { zh: '已拥有', en: 'Owned', ru: 'Куплено', fr: 'Possédé' },
        buy: { zh: '购买', en: 'Buy', ru: 'Купить', fr: 'Acheter' },
        placeIt: { zh: '去小屋摆放', en: 'Place in room', ru: 'Поставить', fr: 'Placer' },
        buyTitle: { zh: '拼对单词才能购买', en: 'Spell the word to buy', ru: 'Напиши слово, чтобы купить', fr: 'Épellez le mot pour acheter' },
        wordMeaning: { zh: '释义', en: 'Meaning', ru: 'Значение', fr: 'Sens' },
        wordHint: { zh: '个字母', en: ' letters', ru: ' букв', fr: ' lettres' },
        wordHintZh: { zh: '个汉字（可输汉字或无声调拼音）', en: ' characters (hanzi or plain pinyin)', ru: ' иероглифов', fr: ' caractères' },
        changeWord: { zh: '换一个词', en: 'New word', ru: 'Другое слово', fr: 'Autre mot' },
        cancel: { zh: '取消', en: 'Cancel', ru: 'Отмена', fr: 'Annuler' },
        confirmBuy: { zh: '✓ 输对了，购买！', en: '✓ Correct! Buy', ru: '✓ Верно! Купить', fr: '✓ Juste ! Acheter' },
        wrongWord: { zh: '拼错啦，再想想～', en: 'Not quite, try again', ru: 'Неверно, попробуй ещё', fr: 'Pas juste, réessayez' },
        noCoins: { zh: '金币不足，去答题赚金币吧！', en: 'Not enough coins!', ru: 'Не хватает монет!', fr: 'Pas assez de pièces !' },
        bought: { zh: '🎉 购买成功！已放入小屋仓库', en: '🎉 Purchased! Check your room', ru: '🎉 Куплено!', fr: '🎉 Acheté !' },
        inventory: { zh: '仓库（点物品放入房间）', en: 'Inventory (tap to place)', ru: 'Склад (нажми)', fr: 'Inventaire' },
        emptyInv: { zh: '仓库空空如也，去商城逛逛吧', en: 'Nothing yet — visit the shop', ru: 'Пусто — зайди в магазин', fr: 'Vide — allez au magasin' },
        clearAll: { zh: '全部收起', en: 'Clear all', ru: 'Убрать всё', fr: 'Tout ranger' },
        changeAvatar: { zh: '更换主角形象', en: 'Change avatar', ru: 'Сменить героя', fr: 'Changer l\'avatar' },
        resetAvatar: { zh: '恢复默认', en: 'Reset', ru: 'Сброс', fr: 'Réinit.' },
        avatarOk: { zh: '主角形象已更新！', en: 'Avatar updated!', ru: 'Герой обновлён!', fr: 'Avatar mis à jour !' },
        avatarBad: { zh: '图片读取失败，请换一张试试', en: 'Could not read image', ru: 'Не удалось прочитать', fr: 'Lecture impossible' },
        wearOn: { zh: '已佩戴', en: 'Worn', ru: 'Надето', fr: 'Porté' },
        tapToPut: { zh: '点已摆放的物品可收起', en: 'Tap a placed item to remove', ru: 'Нажми на предмет, чтобы убрать', fr: 'Touchez pour enlever' },
        close: { zh: '关闭', en: 'Close', ru: 'Закрыть', fr: 'Fermer' },
        earnCoin: { zh: '金币 +', en: 'Coins +', ru: 'Монеты +', fr: 'Pièces +' },
        shopSub: { zh: '拼对目标语言单词即可下单，家具带回家摆进小屋', en: 'Spell a word to buy decorations', ru: 'Напиши слово и купи декор', fr: 'Épellez pour acheter' },
        roomSub: { zh: '你的专属空间：摆家具 · 养宠物 · 打扮主角', en: 'Your space: decorate & dress up', ru: 'Твоё пространство', fr: 'Votre espace' }
    };
    function uiLang() {
        try { return ((window.I18N && window.I18N.lang) || 'zh-CN'); } catch (e) { return 'zh-CN'; }
    }
    function ht(key) {
        var d = DICT[key]; if (!d) return key;
        var l = uiLang().slice(0, 2);
        return d[l] || d.en || d.zh;
    }

    /* ================= 存档 ================= */
    var K = { coins: 'elc_coins', owned: 'elc_owned', room: 'elc_room', worn: 'elc_worn', avatar: 'elc_avatar' };
    function lsGet(k, def) { try { var v = localStorage.getItem(k); return v === null ? def : v; } catch (e) { return def; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function getCoins() { return parseInt(lsGet(K.coins, '0'), 10) || 0; }
    function setCoins(n) { lsSet(K.coins, String(Math.max(0, Math.round(n)))); refreshHUD(); }
    function getOwned() { try { return JSON.parse(lsGet(K.owned, '[]')); } catch (e) { return []; } }
    function setOwned(a) { lsSet(K.owned, JSON.stringify(a)); }
    function getRoom() { try { return JSON.parse(lsGet(K.room, '{}')); } catch (e) { return {}; } }
    function setRoom(o) { lsSet(K.room, JSON.stringify(o)); }
    function getWorn() { try { return JSON.parse(lsGet(K.worn, '[]')); } catch (e) { return []; } }
    function setWorn(a) { lsSet(K.worn, JSON.stringify(a)); }
    function getAvatar() { return lsGet(K.avatar, null); }

    /* ================= 商品目录 ================= */
    var SHOP_ITEMS = [
        { id: 'bed', e: '🛏️', cat: 'floor', p: 60, n: { zh: '小床', en: 'Cozy Bed', ru: 'Кровать', fr: 'Lit' } },
        { id: 'sofa', e: '🛋️', cat: 'floor', p: 80, n: { zh: '沙发', en: 'Sofa', ru: 'Диван', fr: 'Canapé' } },
        { id: 'desk', e: '🪑', cat: 'floor', p: 50, n: { zh: '书桌椅', en: 'Desk & Chair', ru: 'Парта', fr: 'Bureau' } },
        { id: 'tv', e: '📺', cat: 'floor', p: 90, n: { zh: '电视机', en: 'TV', ru: 'Телевизор', fr: 'Télévision' } },
        { id: 'piano', e: '🎹', cat: 'floor', p: 160, n: { zh: '钢琴', en: 'Piano', ru: 'Пианино', fr: 'Piano' } },
        { id: 'shelf', e: '📚', cat: 'floor', p: 75, n: { zh: '大书架', en: 'Bookshelf', ru: 'Полка книг', fr: 'Bibliothèque' } },
        { id: 'toy', e: '🧸', cat: 'floor', p: 55, n: { zh: '玩偶熊', en: 'Teddy Bear', ru: 'Мишка', fr: 'Peluche' } },
        { id: 'rug', e: '🧶', cat: 'floor', p: 35, n: { zh: '圆地毯', en: 'Rug', ru: 'Коврик', fr: 'Tapis' } },
        { id: 'painting', e: '🖼️', cat: 'wall', p: 70, n: { zh: '名画', en: 'Painting', ru: 'Картина', fr: 'Tableau' } },
        { id: 'mirror', e: '🪞', cat: 'wall', p: 65, n: { zh: '穿衣镜', en: 'Mirror', ru: 'Зеркало', fr: 'Miroir' } },
        { id: 'plant', e: '🪴', cat: 'wall', p: 40, n: { zh: '绿盆栽', en: 'Potted Plant', ru: 'Растение', fr: 'Plante' } },
        { id: 'lantern', e: '🏮', cat: 'wall', p: 55, n: { zh: '红灯笼', en: 'Lantern', ru: 'Фонарь', fr: 'Lanterne' } },
        { id: 'map', e: '🗺️', cat: 'wall', p: 85, n: { zh: '世界地图', en: 'World Map', ru: 'Карта мира', fr: 'Carte' } },
        { id: 'clock', e: '🕰️', cat: 'wall', p: 45, n: { zh: '挂钟', en: 'Wall Clock', ru: 'Часы', fr: 'Horloge' } },
        { id: 'dog', e: '🐕', cat: 'pet', p: 120, n: { zh: '小狗', en: 'Puppy', ru: 'Щенок', fr: 'Chien' } },
        { id: 'cat', e: '🐈', cat: 'pet', p: 110, n: { zh: '小猫', en: 'Kitten', ru: 'Котёнок', fr: 'Chat' } },
        { id: 'fish', e: '🐠', cat: 'pet', p: 100, n: { zh: '小鱼', en: 'Fish', ru: 'Рыбка', fr: 'Poisson' } },
        { id: 'bird', e: '🐦', cat: 'pet', p: 90, n: { zh: '小鸟', en: 'Bird', ru: 'Птичка', fr: 'Oiseau' } },
        { id: 'hamster', e: '🐹', cat: 'pet', p: 95, n: { zh: '仓鼠', en: 'Hamster', ru: 'Хомяк', fr: 'Hamster' } },
        { id: 'crown', e: '👑', cat: 'wear', p: 150, n: { zh: '皇冠', en: 'Crown', ru: 'Корона', fr: 'Couronne' } },
        { id: 'hat', e: '🎩', cat: 'wear', p: 80, n: { zh: '绅士帽', en: 'Top Hat', ru: 'Шляпа', fr: 'Chapeau' } },
        { id: 'sunglasses', e: '🕶️', cat: 'wear', p: 60, n: { zh: '墨镜', en: 'Sunglasses', ru: 'Очки', fr: 'Lunettes' } },
        { id: 'bow', e: '🎀', cat: 'wear', p: 45, n: { zh: '蝴蝶结', en: 'Ribbon Bow', ru: 'Бант', fr: 'Nœud' } },
        { id: 'scarf', e: '🧣', cat: 'wear', p: 50, n: { zh: '围巾', en: 'Scarf', ru: 'Шарф', fr: 'Écharpe' } },
        { id: 'sword', e: '⚔️', cat: 'wear', p: 130, n: { zh: '宝剑', en: 'Sword', ru: 'Меч', fr: 'Épée' } },
        { id: 'shield', e: '🛡️', cat: 'wear', p: 120, n: { zh: '盾牌', en: 'Shield', ru: 'Щит', fr: 'Bouclier' } },
        { id: 'wand', e: '✨', cat: 'wear', p: 110, n: { zh: '魔法杖', en: 'Magic Wand', ru: 'Волшебная палочка', fr: 'Baguette' } }
    ];
    var CATS = [{ k: 'floor', t: 'catFloor', e: '🛋️' }, { k: 'wall', t: 'catWall', e: '🖼️' }, { k: 'pet', t: 'catPet', e: '🐾' }, { k: 'wear', t: 'catWear', e: '👑' }];
    function itemName(it) { var l = uiLang().slice(0, 2); return (it.n && (it.n[l] || it.n.en || it.n.zh)) || it.id; }
    function findItem(id) { for (var i = 0; i < SHOP_ITEMS.length; i++) if (SHOP_ITEMS[i].id === id) return SHOP_ITEMS[i]; return null; }

    /* 房间槽位：wall×3 + floor×4 + pet×1；wear 类走「佩戴」列表 */
    var SLOTS = {
        wall: ['w1', 'w2', 'w3'],
        floor: ['f1', 'f2', 'f3', 'f4'],
        pet: ['p1']
    };
    var SLOT_POS = {
        w1: { left: '14%', top: '14%' }, w2: { left: '50%', top: '10%' }, w3: { left: '86%', top: '14%' },
        f1: { left: '7%', bottom: '5%' }, f2: { left: '26%', bottom: '4%' }, f3: { left: '74%', bottom: '4%' }, f4: { left: '93%', bottom: '5%' },
        p1: { left: '14%', bottom: '22%' }
    };

    /* ================= 主角形象 ================= */
    function avatarHtml(cls) {
        var a = getAvatar();
        if (a) return '<img class="' + (cls || '') + '" src="' + a + '" alt="hero" style="height:1.15em;width:auto;vertical-align:-0.18em;border-radius:6px;object-fit:contain;">';
        return '🦸';
    }
    function applyAvatarToModes() {
        var m3 = document.getElementById('m3-pk-hero');
        if (m3) m3.innerHTML = avatarHtml();
        var q = document.getElementById('q-hero');
        if (q) q.innerHTML = avatarHtml();
    }
    function click() { try { if (window.ELC && ELC.click) ELC.click(); } catch (e) {} }
    function toast(msg) { try { if (window.ELC && ELC.toast) ELC.toast(msg); else alert(msg); } catch (e) {} }

    /* ================= 金币 ================= */
    function addCoins(n, opts) {
        n = Math.round(n); if (!n) return;
        setCoins(getCoins() + n);
        floatCoin('+' + n + ' 🪙', opts);
    }
    function spendCoins(n) {
        if (getCoins() < n) return false;
        setCoins(getCoins() - n); return true;
    }
    function floatCoin(text, opts) {
        try {
            var d = document.createElement('div');
            d.textContent = text;
            var x = (opts && typeof opts.x === 'number') ? opts.x : null;
            var y = (opts && typeof opts.y === 'number') ? opts.y : null;
            if (x === null) { x = window.innerWidth - 90; y = 70; }
            d.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%);z-index:5300;pointer-events:none;font-size:1.35rem;font-weight:900;color:#ffd700;text-shadow:0 0 10px rgba(255,180,0,.9),0 2px 3px rgba(0,0,0,.6);transition:top .9s ease-out,opacity .9s;';
            document.body.appendChild(d);
            requestAnimationFrame(function () { d.style.top = (y - 60) + 'px'; d.style.opacity = '0'; });
            setTimeout(function () { d.remove(); }, 950);
        } catch (e) {}
    }
    function refreshHUD() {
        var c = getCoins();
        ['heroHubCoins', 'm3-coins', 'q-coins', 'heroShopCoins', 'heroRoomCoins'].forEach(function (id) {
            var el = document.getElementById(id); if (el) el.textContent = c;
        });
        var hubAv = document.getElementById('heroHubAvatar');
        if (hubAv) hubAv.innerHTML = avatarHtml();
    }

    /* ================= 模式选择页 · 主角信息栏 ================= */
    function buildHub() {
        var screen = document.getElementById('modeSelectScreen');
        if (!screen || document.getElementById('heroHub')) return;
        var grid = screen.querySelector('.mode-grid');
        var hub = document.createElement('div');
        hub.id = 'heroHub';
        hub.innerHTML =
            '<button id="heroHubAvatar" title="' + ht('hubTapRoom') + '">' + avatarHtml() + '</button>' +
            '<div id="heroHubInfo">' +
                '<div id="heroHubCoinsWrap" title="' + ht('hubTapCoins') + '">🪙 <b id="heroHubCoins">' + getCoins() + '</b></div>' +
            '</div>' +
            '<button class="hh-btn" id="heroHubShop">🛍️ ' + ht('shop') + '</button>' +
            '<button class="hh-btn" id="heroHubRoom">🏠 ' + ht('room') + '</button>';
        screen.insertBefore(hub, grid);
        document.getElementById('heroHubAvatar').addEventListener('click', function () { click(); openRoom(); });
        document.getElementById('heroHubCoinsWrap').addEventListener('click', function () { click(); openShop(); });
        document.getElementById('heroHubShop').addEventListener('click', function () { click(); openShop(); });
        document.getElementById('heroHubRoom').addEventListener('click', function () { click(); openRoom(); });
        refreshHUD();
    }

    /* ================= 购买词挑战 ================= */
    function normAns(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zа-яё0-9\u4e00-\u9fff]/g, '');
    }
    function challengePool() {
        try {
            var ws = (window.ELC && ELC.words && ELC.words()) || [];
            var out = [];
            for (var i = 0; i < ws.length; i++) {
                var w = ws[i];
                if (!w || !w.word) continue;
                var len = String(w.word).length;
                if (len >= 3 && len <= 10) out.push(w);
            }
            return out;
        } catch (e) { return []; }
    }
    function pickChallenge(excludeWord) {
        var pool = challengePool();
        if (!pool.length) return null;
        for (var t = 0; t < 12; t++) {
            var w = pool[Math.floor(Math.random() * pool.length)];
            if (pool.length < 2 || w.word !== excludeWord) return w;
        }
        return pool[0];
    }
    function wordImgHtml(w) {
        try {
            if (window.WORD_FX && WORD_FX.imgFor) {
                var u = WORD_FX.imgFor(w.word, learningLangSafe(), w.display);
                if (u) return '<img src="' + u + '" style="height:64px;width:64px;object-fit:contain;">';
            }
        } catch (e) {}
        return '<span style="font-size:52px;line-height:1;">📝</span>';
    }
    function learningLangSafe() { try { return (window.ELC && ELC.learningLang) || 'en'; } catch (e) { return 'en'; } }

    /* ================= 商城 ================= */
    var shopState = { tab: 'all', item: null, word: null };
    function openShop(highlightId) {
        closeShop(); closeRoom();
        shopState.tab = 'all'; shopState.item = highlightId ? findItem(highlightId) : null;
        var root = document.createElement('div');
        root.id = 'heroShop';
        root.innerHTML =
            '<div class="hs-panel">' +
                '<div class="hs-head">' +
                    '<div class="hs-title">🛍️ ' + ht('shop') + '</div>' +
                    '<div class="hs-coins">🪙 <b id="heroShopCoins">' + getCoins() + '</b></div>' +
                    '<button class="hs-x" id="hsClose">✕</button>' +
                '</div>' +
                '<div class="hs-sub">' + ht('shopSub') + '</div>' +
                '<div class="hs-tabs" id="hsTabs"></div>' +
                '<div class="hs-grid" id="hsGrid"></div>' +
                '<div class="hs-detail" id="hsDetail" style="display:none;"></div>' +
            '</div>';
        document.body.appendChild(root);
        document.getElementById('hsClose').addEventListener('click', function () { click(); closeShop(); });
        renderTabs(); renderGrid();
        if (shopState.item) openDetail(shopState.item.id);
    }
    function closeShop() { var el = document.getElementById('heroShop'); if (el) el.remove(); }
    function renderTabs() {
        var host = document.getElementById('hsTabs'); if (!host) return;
        var html = tabBtn('all', '🛍️', ht('all'));
        CATS.forEach(function (c) { html += tabBtn(c.k, c.e, ht(c.t)); });
        host.innerHTML = html;
        host.querySelectorAll('button').forEach(function (b) {
            b.addEventListener('click', function () {
                click(); shopState.tab = b.dataset.tab; renderTabs(); renderGrid();
                var d = document.getElementById('hsDetail'); if (d) d.style.display = 'none';
            });
        });
        function tabBtn(k, e, t) { return '<button data-tab="' + k + '" class="' + (shopState.tab === k ? 'on' : '') + '">' + e + ' ' + t + '</button>'; }
    }
    function renderGrid() {
        var host = document.getElementById('hsGrid'); if (!host) return;
        var owned = getOwned();
        var html = '';
        SHOP_ITEMS.forEach(function (it) {
            if (shopState.tab !== 'all' && it.cat !== shopState.tab) return;
            var has = owned.indexOf(it.id) >= 0;
            html += '<button class="hs-item' + (has ? ' owned' : '') + '" data-id="' + it.id + '">' +
                '<span class="hs-emoji">' + it.e + '</span>' +
                '<span class="hs-name">' + itemName(it) + '</span>' +
                '<span class="hs-price">' + (has ? '✓ ' + ht('owned') : '🪙 ' + it.p) + '</span>' +
            '</button>';
        });
        host.innerHTML = html;
        host.querySelectorAll('.hs-item').forEach(function (b) {
            b.addEventListener('click', function () { click(); openDetail(b.dataset.id); });
        });
    }
    function openDetail(id) {
        var it = findItem(id); if (!it) return;
        var owned = getOwned().indexOf(id) >= 0;
        var det = document.getElementById('hsDetail'); if (!det) return;
        det.style.display = 'block';
        if (owned) {
            det.innerHTML =
                '<div class="hsd-top"><span class="hsd-emoji">' + it.e + '</span>' +
                '<div><div class="hsd-name">' + itemName(it) + '</div>' +
                '<div class="hsd-cat">' + ht('owned') + (it.cat === 'wear' ? ' · ' + ht('wearOn') : '') + '</div></div>' +
                '<button class="hs-x" id="hsdX1">✕</button></div>' +
                '<div class="hsd-actions"><button class="hh-btn big" id="hsdGoRoom">🏠 ' + ht('placeIt') + '</button></div>';
            wireClose('hsdX1');
            document.getElementById('hsdGoRoom').addEventListener('click', function () { click(); closeShop(); openRoom(id); });
            return;
        }
        var ch = pickChallenge();
        det.innerHTML =
            '<div class="hsd-top"><span class="hsd-emoji">' + it.e + '</span>' +
            '<div><div class="hsd-name">' + itemName(it) + '</div>' +
            '<div class="hsd-cat">🪙 ' + it.p + '</div></div>' +
            '<button class="hs-x" id="hsdX2">✕</button></div>' +
            '<div class="hsd-quiz">' + ht('buyTitle') + '</div>' +
            '<div class="hsd-quiz-box" id="hsdQuizBox"></div>' +
            '<div class="hsd-actions">' +
                '<button class="hh-btn big ok" id="hsdBuy">' + ht('confirmBuy') + '</button>' +
                '<button class="hh-btn" id="hsdNewWord">🎲 ' + ht('changeWord') + '</button>' +
            '</div>';
        wireClose('hsdX2');
        document.getElementById('hsdNewWord').addEventListener('click', function () { click(); renderQuiz(it); });
        document.getElementById('hsdBuy').addEventListener('click', function () { tryBuy(it); });
        renderQuiz(it);
        function wireClose(cid) {
            var x = document.getElementById(cid);
            if (x) x.addEventListener('click', function () { det.style.display = 'none'; });
        }
    }
    function renderQuiz(it) {
        var box = document.getElementById('hsdQuizBox'); if (!box) return;
        var w = pickChallenge();
        if (!w) {
            box.innerHTML = '<div class="hsd-mean">' + ht('noCoins') + '</div>';
            return;
        }
        box._word = w; box._item = it;
        var isZh = learningLangSafe() === 'zh';
        var lenHint = isZh ? ((w.display || w.word).length + ht('wordHintZh')) : (String(w.word).length + ht('wordHint'));
        box.innerHTML =
            '<div class="hsd-hint">' + wordImgHtml(w) + '</div>' +
            '<div class="hsd-mean">' + ht('wordMeaning') + '：<b>' + (w.mean || '…') + '</b>　<span class="hsd-len">' + lenHint + '</span></div>' +
            '<input id="hsdInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="?">';
        var input = document.getElementById('hsdInput');
        input.focus();
        input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') tryBuy(it); });
    }
    function tryBuy(it) {
        var box = document.getElementById('hsdQuizBox');
        var input = document.getElementById('hsdInput');
        if (!box || !input || !box._word) return;
        var w = box._word;
        var ans = normAns(input.value);
        var expect1 = normAns(w.word);
        var expect2 = normAns(w.display);
        if (!ans || (ans !== expect1 && ans !== expect2)) {
            input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
            try { if (window.ELC && ELC.tone) ELC.tone(160, 0.18, 'sawtooth', 0.12); } catch (e) {}
            toast(ht('wrongWord'));
            return;
        }
        if (getCoins() < it.p) { toast(ht('noCoins')); return; }
        spendCoins(it.p);
        var owned = getOwned(); if (owned.indexOf(it.id) < 0) owned.push(it.id); setOwned(owned);
        try { if (window.ELC && ELC.tone) ELC.tone(880, 0.1, 'sine', 0.12); } catch (e) {}
        toast(ht('bought'));
        renderGrid();
        openDetail(it.id);
    }

    /* ================= 主角小屋 ================= */
    var roomState = {};
    function openRoom(highlightId) {
        closeRoom(); closeShop();
        var root = document.createElement('div');
        root.id = 'heroRoom';
        root.innerHTML =
            '<div class="hr-panel">' +
                '<div class="hs-head">' +
                    '<div class="hs-title">🏠 ' + ht('room') + '</div>' +
                    '<div class="hs-coins">🪙 <b id="heroRoomCoins">' + getCoins() + '</b></div>' +
                    '<button class="hs-x" id="hrClose">✕</button>' +
                '</div>' +
                '<div class="hs-sub">' + ht('roomSub') + '</div>' +
                '<div class="hr-scene" id="hrScene"></div>' +
                '<div class="hr-tip">' + ht('tapToPut') + '</div>' +
                '<div class="hr-inv-head">📦 ' + ht('inventory') +
                    '<button class="hh-btn mini" id="hrClear">' + ht('clearAll') + '</button>' +
                    '<button class="hh-btn mini" id="hrAvatar">🖼️ ' + ht('changeAvatar') + '</button>' +
                    (getAvatar() ? '<button class="hh-btn mini" id="hrAvatarReset">' + ht('resetAvatar') + '</button>' : '') +
                '</div>' +
                '<div class="hr-inv" id="hrInv"></div>' +
                '<input type="file" id="hrAvatarFile" accept="image/*" style="display:none;">' +
            '</div>';
        document.body.appendChild(root);
        document.getElementById('hrClose').addEventListener('click', function () { click(); closeRoom(); });
        document.getElementById('hrClear').addEventListener('click', function () { click(); setRoom({}); setWorn([]); renderScene(); renderInv(); });
        document.getElementById('hrAvatar').addEventListener('click', function () { click(); document.getElementById('hrAvatarFile').click(); });
        var rst = document.getElementById('hrAvatarReset');
        if (rst) rst.addEventListener('click', function () {
            click(); lsSet(K.avatar, ''); applyAvatarToModes(); refreshHUD(); toast(ht('avatarOk'));
            closeRoom(); openRoom();
        });
        document.getElementById('hrAvatarFile').addEventListener('change', function (ev) {
            var f = ev.target && ev.target.files && ev.target.files[0];
            if (!f) return;
            var reader = new FileReader();
            reader.onload = function () { resizeAvatar(reader.result); };
            reader.onerror = function () { toast(ht('avatarBad')); };
            reader.readAsDataURL(f);
            ev.target.value = '';
        });
        renderScene(); renderInv();
        if (highlightId) {
            var chip = document.querySelector('#hrInv [data-id="' + highlightId + '"]');
            if (chip) { chip.classList.add('glow'); chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        }
    }
    function closeRoom() { var el = document.getElementById('heroRoom'); if (el) el.remove(); }
    function renderScene() {
        var scene = document.getElementById('hrScene'); if (!scene) return;
        var room = getRoom(), worn = getWorn();
        var html = '<div class="hr-wall"></div><div class="hr-floor"></div>';
        /* 墙/地/宠 槽位 */
        Object.keys(SLOT_POS).forEach(function (sid) {
            var itemId = room[sid];
            var it = itemId ? findItem(itemId) : null;
            html += '<div class="hr-slot s-' + sid + (it ? '' : ' empty') + '" data-slot="' + sid + '" style="left:' + SLOT_POS[sid].left + ';' +
                (SLOT_POS[sid].top !== undefined ? 'top:' + SLOT_POS[sid].top : 'bottom:' + SLOT_POS[sid].bottom) + ';">' +
                (it ? '<span class="hr-item' + (sid.charAt(0) === 'p' ? ' pet-anim' : '') + '">' + it.e + '</span>' : '<span class="hr-slot-dot">＋</span>') +
            '</div>';
        });
        /* 主角 */
        var wearHtml = '';
        worn.forEach(function (id) { var it = findItem(id); if (it) wearHtml += '<span class="hr-wear-chip">' + it.e + '</span>'; });
        html += '<div class="hr-hero" id="hrHero"><div class="hr-wear">' + wearHtml + '</div>' + avatarHtml() + '</div>';
        html += '<div class="hr-shadow"></div>';
        scene.innerHTML = html;
        scene.querySelectorAll('.hr-slot').forEach(function (s) {
            s.addEventListener('click', function () {
                var sid = s.dataset.slot;
                var room2 = getRoom();
                if (!room2[sid]) return;
                click();
                delete room2[sid]; setRoom(room2);
                renderScene(); renderInv();
            });
        });
    }
    function renderInv() {
        var host = document.getElementById('hrInv'); if (!host) return;
        var owned = getOwned(), room = getRoom(), worn = getWorn();
        var placed = {}; Object.keys(room).forEach(function (s) { placed[room[s]] = s; });
        var html = '';
        owned.forEach(function (id) {
            var it = findItem(id); if (!it) return;
            var inRoom = !!placed[id];
            var isWorn = it.cat === 'wear' && worn.indexOf(id) >= 0;
            var badge = inRoom ? '🏠' : (isWorn ? '👑' : '');
            html += '<button class="hr-chip' + (inRoom || isWorn ? ' used' : '') + '" data-id="' + id + '" title="' + itemName(it) + '">' +
                it.e + (badge ? '<i>' + badge + '</i>' : '') + '</button>';
        });
        host.innerHTML = html || '<div class="hr-inv-empty">' + ht('emptyInv') + '</div>';
        host.querySelectorAll('.hr-chip').forEach(function (b) {
            b.addEventListener('click', function () { togglePlace(b.dataset.id); });
        });
    }
    function togglePlace(id) {
        var it = findItem(id); if (!it) return;
        click();
        if (it.cat === 'wear') {
            var worn = getWorn();
            var i = worn.indexOf(id);
            if (i >= 0) worn.splice(i, 1); else worn.push(id);
            setWorn(worn);
        } else {
            var room = getRoom();
            var at = null;
            Object.keys(room).forEach(function (s) { if (room[s] === id) at = s; });
            if (at) { delete room[at]; }
            else {
                var slots = SLOTS[it.cat] || [];
                var free = null;
                for (var j = 0; j < slots.length; j++) { if (!room[slots[j]]) { free = slots[j]; break; } }
                if (!free) {
                    /* 满了：顶掉最早的同类槽位 */
                    var occupied = slots.filter(function (s) { return room[s]; });
                    if (occupied.length) { free = occupied[0]; delete room[free]; }
                    else return;
                }
                room[free] = id;
            }
            setRoom(room);
        }
        renderScene(); renderInv();
    }
    function resizeAvatar(dataUrl) {
        var img = new Image();
        img.onload = function () {
            try {
                var S = 128;
                var cv = document.createElement('canvas');
                cv.width = S; cv.height = S;
                var ctx = cv.getContext('2d');
                var r = Math.min(img.width, img.height);
                ctx.drawImage(img, (img.width - r) / 2, (img.height - r) / 2, r, r, 0, 0, S, S);
                var out = cv.toDataURL('image/png');
                if (out.length > 160000) {
                    out = cv.toDataURL('image/jpeg', 0.85);
                }
                lsSet(K.avatar, out);
                applyAvatarToModes(); refreshHUD();
                toast(ht('avatarOk'));
                closeRoom(); openRoom();
            } catch (e) { toast(ht('avatarBad')); }
        };
        img.onerror = function () { toast(ht('avatarBad')); };
        img.src = dataUrl;
    }

    /* ================= 样式注入 ================= */
    var CSS = ''
        + '#heroHub{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:2px 0 10px;}'
        + '#heroHubAvatar{width:52px;height:52px;border-radius:14px;border:2px solid rgba(241,196,15,.75);background:rgba(0,0,0,.35);font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;box-shadow:0 0 12px rgba(241,196,15,.25);transition:transform .15s;}'
        + '#heroHubAvatar:hover{transform:scale(1.08);} #heroHubAvatar img{max-width:40px;max-height:40px;border-radius:8px;height:auto!important;}'
        + '#heroHubInfo{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:4px 12px;font-size:1rem;font-weight:900;color:#ffd700;cursor:pointer;}'
        + '.hh-btn{border:1px solid rgba(241,196,15,.6);background:linear-gradient(to bottom,#f1c40f,#d48806);color:#3a2400;font-weight:900;border-radius:20px;padding:7px 16px;font-size:.92rem;cursor:pointer;box-shadow:0 3px 0 #9c6a00,0 4px 10px rgba(0,0,0,.4);transition:transform .1s;}'
        + '.hh-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #9c6a00;}'
        + '.hh-btn.big{padding:12px 20px;font-size:1rem;border-radius:24px;}'
        + '.hh-btn.ok{background:linear-gradient(to bottom,#53d769,#2e9e46);border-color:rgba(83,215,105,.7);color:#04250d;box-shadow:0 3px 0 #1a6b2c,0 4px 10px rgba(0,0,0,.4);}'
        + '.hh-btn.mini{padding:3px 10px;font-size:.78rem;border-radius:14px;box-shadow:none;}'
        /* 商城/小屋弹窗骨架 */
        + '#heroShop,#heroRoom{position:fixed;inset:0;background:rgba(8,8,18,.96);z-index:4600;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;backdrop-filter:blur(6px);}'
        + '.hs-panel,.hr-panel{width:min(94vw,560px);max-height:94vh;overflow:auto;background:linear-gradient(160deg,#1b2440,#12172b);border:1px solid rgba(241,196,15,.35);border-radius:18px;padding:14px;box-sizing:border-box;box-shadow:0 20px 60px rgba(0,0,0,.6);}'
        + '.hs-head{display:flex;align-items:center;gap:10px;} .hs-title{flex:1;font-size:1.35rem;font-weight:900;background:linear-gradient(to right,#f1c40f,#53d769);-webkit-background-clip:text;background-clip:text;color:transparent;}'
        + '.hs-coins{background:rgba(0,0,0,.4);border:1px solid rgba(255,215,0,.5);color:#ffd700;font-weight:900;border-radius:14px;padding:5px 12px;}'
        + '.hs-x{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font-size:1rem;cursor:pointer;}'
        + '.hs-sub{color:rgba(255,255,255,.6);font-size:.82rem;margin:6px 0 10px;text-align:center;}'
        + '.hs-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;}'
        + '.hs-tabs button{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);border-radius:16px;padding:5px 12px;font-size:.85rem;cursor:pointer;}'
        + '.hs-tabs button.on{background:linear-gradient(to bottom,#f1c40f,#d48806);color:#3a2400;font-weight:900;border-color:#f1c40f;}'
        + '.hs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;}'
        + '.hs-item{display:flex;flex-direction:column;align-items:center;gap:3px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px 4px;cursor:pointer;transition:transform .12s,border-color .12s;}'
        + '.hs-item:hover{transform:translateY(-2px);border-color:#f1c40f;}'
        + '.hs-item.owned{border-color:rgba(83,215,105,.6);background:rgba(83,105,50,.12);}'
        + '.hs-emoji{font-size:1.9rem;line-height:1.2;} .hs-name{font-size:.78rem;color:rgba(255,255,255,.9);text-align:center;}'
        + '.hs-price{font-size:.75rem;color:#ffd700;font-weight:900;} .hs-item.owned .hs-price{color:#53d769;}'
        + '.hs-detail{margin-top:12px;background:rgba(0,0,0,.35);border:1px solid rgba(241,196,15,.4);border-radius:14px;padding:12px;}'
        + '.hsd-top{display:flex;align-items:center;gap:10px;} .hsd-emoji{font-size:2.6rem;}'
        + '.hsd-name{font-size:1.15rem;font-weight:900;color:#fff;} .hsd-cat{color:#ffd700;font-weight:900;font-size:.9rem;}'
        + '.hsd-top .hs-x{margin-left:auto;}'
        + '.hsd-quiz{margin:10px 0 6px;font-weight:900;color:#f1c40f;text-align:center;font-size:.95rem;}'
        + '.hsd-quiz-box{display:flex;flex-direction:column;align-items:center;gap:8px;background:rgba(255,255,255,.05);border-radius:12px;padding:10px;}'
        + '.hsd-hint{display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.9);border-radius:12px;padding:6px 14px;}'
        + '.hsd-hint img{max-width:64px;max-height:64px;}'
        + '.hsd-mean{color:rgba(255,255,255,.9);font-size:.95rem;text-align:center;} .hsd-mean b{color:#fff;}'
        + '.hsd-len{color:rgba(255,255,255,.55);font-size:.8rem;}'
        + '#hsdInput{width:min(100%,280px);text-align:center;font-size:1.25rem;font-weight:900;letter-spacing:2px;padding:9px;border-radius:10px;border:2px solid rgba(241,196,15,.6);background:rgba(0,0,0,.5);color:#fff;outline:none;box-sizing:border-box;}'
        + '#hsdInput:focus{border-color:#f1c40f;box-shadow:0 0 10px rgba(241,196,15,.4);}'
        + '#hsdInput.shake{animation:hhShake .35s;} @keyframes hhShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}'
        + '.hsd-actions{display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap;}'
        /* 小屋场景 */
        + '.hr-scene{position:relative;width:100%;aspect-ratio:4/3;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.2);background:linear-gradient(to bottom,#2b3a67 0%,#3c5a99 40%,#5a4632 62%,#7a5c3e 100%);}'
        + '.hr-wall{position:absolute;inset:0 0 38% 0;background:linear-gradient(to bottom,#35507f,#4a6ba5);} .hr-wall:after{content:"";position:absolute;left:6%;top:12%;width:22%;height:0;padding-bottom:22%;border:3px solid rgba(255,255,255,.35);border-radius:50%;background:radial-gradient(circle at 40% 35%,#bfe3ff,#7fb7e8 70%);box-shadow:inset 0 0 14px rgba(255,255,255,.5);}'
        + '.hr-floor{position:absolute;inset:62% 0 0 0;background:repeating-linear-gradient(90deg,#7a5c3e 0 46px,#6b4f34 46px 92px);}'
        + '.hr-slot{position:absolute;transform:translateX(-50%);width:52px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:12px;cursor:pointer;z-index:5;}'
        + '.hr-slot.empty .hr-slot-dot{color:rgba(255,255,255,.35);font-size:1.2rem;font-weight:900;border:2px dashed rgba(255,255,255,.25);border-radius:12px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;}'
        + '.hr-slot .hr-item{font-size:2.1rem;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));transition:transform .15s;}'
        + '.hr-slot .hr-item:hover{transform:scale(1.15);} .hr-slot.s-p1 .hr-item{font-size:1.9rem;}'
        + '.pet-anim{animation:hrPet 1.6s ease-in-out infinite;} @keyframes hrPet{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}'
        + '.hr-hero{position:absolute;left:50%;bottom:34%;transform:translateX(-50%);font-size:4.6rem;line-height:1;z-index:8;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45));}'
        + '.hr-hero img{max-width:96px;max-height:96px;border-radius:14px;border:2px solid rgba(255,255,255,.5);height:auto!important;}'
        + '.hr-wear{display:flex;gap:2px;margin-bottom:-8px;} .hr-wear-chip{font-size:1.3rem;filter:drop-shadow(0 0 6px rgba(241,196,15,.8));}'
        + '.hr-shadow{position:absolute;left:50%;bottom:31%;transform:translateX(-50%);width:90px;height:14px;border-radius:50%;background:rgba(0,0,0,.3);z-index:7;}'
        + '.hr-tip{color:rgba(255,255,255,.5);font-size:.75rem;text-align:center;margin:6px 0 2px;}'
        + '.hr-inv-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:rgba(255,255,255,.85);font-weight:900;font-size:.88rem;margin:4px 0 6px;}'
        + '.hr-inv{display:flex;gap:6px;flex-wrap:wrap;min-height:52px;background:rgba(0,0,0,.3);border-radius:12px;padding:8px;}'
        + '.hr-inv-empty{color:rgba(255,255,255,.45);font-size:.85rem;}'
        + '.hr-chip{position:relative;width:46px;height:46px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);font-size:1.6rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .12s;}'
        + '.hr-chip:hover{transform:translateY(-2px);border-color:#f1c40f;}'
        + '.hr-chip.used{opacity:.45;} .hr-chip i{position:absolute;right:-3px;top:-3px;font-style:normal;font-size:.75rem;background:#f1c40f;border-radius:8px;padding:0 3px;}'
        + '.hr-chip.glow{border-color:#53d769;box-shadow:0 0 12px rgba(83,215,105,.8);animation:hrGlow 1s infinite alternate;}'
        + '@keyframes hrGlow{from{box-shadow:0 0 6px rgba(83,215,105,.5)}to{box-shadow:0 0 16px rgba(83,215,105,1)}}'
        /* 填词怪物血条（game.html 内 #m3-mon-bar 元素的样式） */
        + '#m3-mon-bar{display:flex;align-items:center;gap:5px;width:100%;max-width:min(92vmin, max(230px, calc(100vh - 368px)), 620px);margin-top:1px;box-sizing:border-box;padding:0 6px;}'
        + '#m3-mon-emoji{font-size:1.05rem;line-height:1;transition:transform .3s;}'
        + '#m3-mon-track{flex:1;height:7px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.22);border-radius:4px;overflow:hidden;}'
        + '#m3-mon-fill{height:100%;width:100%;background:linear-gradient(90deg,#ff4757,#ffa502);transition:width .25s;box-shadow:0 0 8px rgba(255,71,87,.7);}'
        + '#m3-mon-hp{font-size:.68rem;font-weight:900;color:#ff8a8a;min-width:2.6em;text-align:right;}'
        + '#m3-mon-coin{font-size:.66rem;font-weight:900;color:#ffd700;white-space:nowrap;}'
        + '#m3-mon-bar.dead #m3-mon-emoji{animation:m3MonDead .8s forwards;} @keyframes m3MonDead{0%{transform:scale(1.4) rotate(0)}100%{transform:scale(.2) rotate(180deg);opacity:0}}'
        + '#m3-mon-bar.spawn #m3-mon-emoji{animation:m3MonSpawn .5s;} @keyframes m3MonSpawn{0%{transform:scale(0) rotate(-180deg)}100%{transform:scale(1) rotate(0)}}'
        + '#m3-mon-bar.hit #m3-mon-track{animation:m3MonHitFlash .3s;} @keyframes m3MonHitFlash{0%{filter:brightness(2.2)}100%{filter:brightness(1)}}'
        /* 语音按钮 */
        + '#m3-mic-btn.listening{background:linear-gradient(to bottom,#ff4757,#c0392b)!important;color:#fff!important;animation:micPulse 1s infinite;}'
        + '#m3-mic-btn{user-select:none;-webkit-user-select:none;touch-action:none;}'
        + '@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,71,87,.7)}50%{box-shadow:0 0 0 8px rgba(255,71,87,0)}}'
        + '#m3-mic-tip{position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:5400;background:rgba(10,10,25,.9);border:1px solid rgba(255,71,87,.6);color:#fff;font-weight:900;padding:8px 16px;border-radius:20px;max-width:86vw;box-shadow:0 6px 20px rgba(0,0,0,.5);pointer-events:none;}';
    function injectCss() {
        if (document.getElementById('heroSystemCss')) return;
        var st = document.createElement('style');
        st.id = 'heroSystemCss';
        st.textContent = CSS;
        document.head.appendChild(st);
    }

    /* ================= 对外 API ================= */
    window.HERO = {
        v: 1,
        getCoins: getCoins,
        addCoins: addCoins,
        spendCoins: spendCoins,
        refreshHUD: refreshHUD,
        openShop: openShop,
        openRoom: openRoom,
        avatarHtml: avatarHtml,
        applyAvatarToModes: applyAvatarToModes,
        normAns: normAns,
        ht: ht,
        avatar: getAvatar,
        items: SHOP_ITEMS
    };

    /* ================= 启动 ================= */
    function init() {
        injectCss();
        buildHub();
        applyAvatarToModes();
        refreshHUD();
        document.addEventListener('i18n:change', function () {
            buildHub();          /* 重建信息栏文案 */
            refreshHUD();
            if (document.getElementById('heroShop')) { closeShop(); openShop(); }
            if (document.getElementById('heroRoom')) { closeRoom(); openRoom(); }
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
