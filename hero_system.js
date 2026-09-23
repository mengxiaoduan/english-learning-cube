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
        quizItem: { zh: '想买【', en: 'To buy [', ru: 'Чтобы купить [', fr: 'Pour acheter [' },
        quizItemEnd: { zh: '】？拼出它在你学的语言里的说法！', en: ']? Spell it in the language you learn!', ru: ']? Напиши это на изучаемом языке!', fr: '] ? Épellez-le dans votre langue !' },
        hintFirst: { zh: '💡 首字母提示', en: '💡 First letter', ru: '💡 Первая буква', fr: '💡 Première lettre' },
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
        roomSub: { zh: '你的专属空间：摆家具 · 养宠物 · 打扮主角', en: 'Your space: decorate & dress up', ru: 'Твоё пространство', fr: 'Votre espace' },
        langBuddy: { zh: '选好语言，我们一起学！', en: "Pick a language — let's learn!", ru: 'Выбери язык — учимся!', fr: 'Choisis — apprenons !' },
        roomShort: { zh: '小屋', en: 'Room', ru:'Домик', fr: 'Chez' },
        notEnough: { zh: '💰 金币不够，先去答题赚金币吧！', en: '💰 Not enough coins — play to earn more!', ru: '💰 Не хватает монет — играй!', fr: '💰 Pas assez de pièces — jouez !' },
        soloBtn: { zh: '单人游戏 · 赚金币', en: 'Single Player · Earn coins', ru: 'Одиночная игра · Монеты', fr: 'Solo · Gagner des pièces' },
        vsBtn: { zh: '对战游戏 · 赢金币', en: 'Versus · Win coins', ru: 'Дуэль · Монеты', fr: 'Duel · Pièces' },
        vsTitle: { zh: '对战游戏', en: 'Versus', ru: 'Дуэль', fr: 'Duel' },
        vsSub: { zh: '共用同一组目标单词，谁先拼出谁攻击（每词 10 血，血量 100，奖励词 5 血）', en: 'Same target words — first to spell attacks (10 dmg, 100 HP)', ru: 'Общие слова — кто первый соберёт, тот бьёт (10 урона, 100 HP)', fr: 'Mêmes mots — le premier à épeler attaque (10 dégâts, 100 PV)' },
        vsName: { zh: '昵称', en: 'Name', ru: 'Имя', fr: 'Pseudo' },
        vsBet: { zh: '押注（赢了翻倍，输了失去）', en: 'Bet (win = x2, lose = gone)', ru: 'Ставка (выигрыш ×2)', fr: 'Mise (gain ×2)' },
        vsBetNone: { zh: '不押', en: 'None', ru: 'Без', fr: 'Aucune' },
        vsAi: { zh: '人机对战', en: 'vs Computer', ru: 'Против ПК', fr: 'vs Ordi' },
        vsAiSub: { zh: '电脑等级随你的胜负自动升降（Lv.1~10）', en: 'AI level rises/falls with your results', ru: 'Уровень ИИ растёт с победами', fr: 'Le niveau IA évolue' },
        vsMatch: { zh: '匹配对战', en: 'Online Match', ru: 'Онлайн-матч', fr: 'Match en ligne' },
        vsMatchSub: { zh: '搜索全网同时匹配的玩家真人对战（需网络）', en: 'Match with real players online', ru: 'Поиск реальных игроков', fr: 'Affrontez de vrais joueurs' },
        mmConnect: { zh: '正在连接匹配服务器…', en: 'Connecting to match server…', ru: 'Подключение к серверу…', fr: 'Connexion au serveur…' },
        mmWait: { zh: '🎯 已就位，等待挑战者进入大厅…', en: '🎯 Ready — waiting for a challenger…', ru: '🎯 Жду соперника…', fr: '🎯 En attente…' },
        mmHand: { zh: '🤝 找到对手，握手中…', en: '🤝 Opponent found, handshaking…', ru: '🤝 Соперник найден…', fr: '🤝 Adversaire trouvé…' },
        mmFail: { zh: '无法连接匹配服务器（网络受限时建议人机对战）', en: 'Cannot reach match server — try vs Computer', ru: 'Сервер недоступен — сыграйте с ПК', fr: 'Serveur inaccessible' },
        mmTimeout: { zh: '30 秒内没有找到对手，稍后再试试', en: 'No opponent in 30s — try again later', ru: 'За 30 секунд соперник не найден', fr: 'Aucun adversaire en 30s' },
        mmFull: { zh: '匹配已满，正在重试…', en: 'Room full, retrying…', ru: 'Комната заполнена…', fr: 'Complet…' },
        mmCancel: { zh: '取消', en: 'Cancel', ru: 'Отмена', fr: 'Annuler' },
        mmRetry: { zh: '重试', en: 'Retry', ru: 'Повтор', fr: 'Réessayer' },
        shareTitle: { zh: '共享这一关', en: 'Share this level', ru: 'Поделиться уровнем', fr: 'Partager' },
        shareTip: { zh: '把分享码发给朋友（微信群/QQ均可），对方在"🌐 他人共享的关卡"里粘贴导入即可游玩', en: 'Send the code to friends; they import it in "Shared Levels"', ru: 'Отправьте код другу — он импортирует его', fr: 'Envoyez le code à un ami' },
        shareGen: { zh: '正在生成分享码…', en: 'Generating code…', ru: 'Генерация кода…', fr: 'Génération…' },
        copyCode: { zh: '复制分享码', en: 'Copy code', ru: 'Копировать код', fr: 'Copier' },
        copyOk: { zh: '✅ 已复制，快去发给朋友吧！', en: '✅ Copied!', ru: '✅ Скопировано!', fr: '✅ Copié !' },
        shareSize: { zh: '分享码大小：{n} KB（越少图片越小）', en: 'Code size: {n} KB', ru: 'Размер кода: {n} КБ', fr: 'Taille : {n} Ko' },
        shareLib: { zh: '他人共享的关卡', en: 'Shared Levels', ru: 'Общие уровни', fr: 'Niveaux partagés' },
        libTip: { zh: '粘贴朋友发来的分享码导入；列表里的关卡可游玩 / 再共享 / 删除', en: 'Paste a friend\'s code to import; play / re-share / delete below', ru: 'Вставьте код друга; играйте / делитесь / удаляйте', fr: 'Collez un code ; jouez / partagez / supprimez' },
        importPh: { zh: '粘贴分享码（ELCS1.…）', en: 'Paste share code (ELCS1.…)', ru: 'Вставьте код (ELCS1.…)', fr: 'Collez le code (ELCS1.…)' },
        importBtn: { zh: '导入', en: 'Import', ru: 'Импорт', fr: 'Importer' },
        importOk: { zh: '✅ 导入成功，开始游玩吧！', en: '✅ Imported!', ru: '✅ Импортировано!', fr: '✅ Importé !' },
        importBad: { zh: '分享码无效，请检查是否复制完整', en: 'Invalid code — check if fully copied', ru: 'Неверный код', fr: 'Code invalide' },
        libEmpty: { zh: '还没有共享关卡——去找朋友要分享码吧！', en: 'No shared levels yet — get a code from a friend!', ru: 'Пока пусто — попросите код у друга', fr: 'Vide — demandez un code !' }
    };
    function uiLang() {
        try { return ((window.I18N && window.I18N.lang) || 'zh-CN'); } catch (e) { return 'zh-CN'; }
    }
    function ht(key) {
        var d = DICT[key]; if (!d) return key;
        var l = uiLang().slice(0, 2);
        return d[l] || d.en || d.zh;
    }

    /* 金币图标：自绘 SVG（🪙 是 Unicode 13 新表情，Win10 等系统无此字形会显示成方框） */
    var COIN_SVG = '<svg class="coin-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#f5b301" stroke="#b97a00" stroke-width="1.5"/><circle cx="12" cy="12" r="7" fill="none" stroke="#ffe27a" stroke-width="1.5" opacity=".9"/><path d="M12 6.4l1.55 3.1 3.4.5-2.45 2.4.55 3.4-3.05-1.6-3.05 1.6.55-3.4-2.45-2.4 3.4-.5z" fill="#fff8d6"/></svg>';
    function coinIcon() { return COIN_SVG; }

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

    /* ================= 商品目录（w=购买时要拼的词：en/ru/zh拼音，hw=中文字） ================= */
    var SHOP_ITEMS = [
        { id: 'bed', e: '🛏️', cat: 'floor', p: 60, w: { en: 'bed', ru: 'кровать', zh: 'chuang' }, hw: '床', n: { zh: '小床', en: 'Cozy Bed', ru: 'Кровать', fr: 'Lit' } },
        { id: 'sofa', e: '🛋️', cat: 'floor', p: 80, w: { en: 'sofa', ru: 'divan', zh: 'shafa' }, hw: '沙发', n: { zh: '沙发', en: 'Sofa', ru: 'Диван', fr: 'Canapé' } },
        { id: 'desk', e: '🪑', cat: 'floor', p: 50, w: { en: 'chair', ru: 'stul', zh: 'yizi' }, hw: '椅子', n: { zh: '书桌椅', en: 'Desk & Chair', ru: 'Парта', fr: 'Bureau' } },
        { id: 'tv', e: '📺', cat: 'floor', p: 90, w: { en: 'tv', ru: 'televisor', zh: 'dianshi' }, hw: '电视', n: { zh: '电视机', en: 'TV', ru: 'Телевизор', fr: 'Télévision' } },
        { id: 'piano', e: '🎹', cat: 'floor', p: 160, w: { en: 'piano', ru: 'piano', zh: 'gangqin' }, hw: '钢琴', n: { zh: '钢琴', en: 'Piano', ru: 'Пианино', fr: 'Piano' } },
        { id: 'shelf', e: '📚', cat: 'floor', p: 75, w: { en: 'shelf', ru: 'polka', zh: 'shujia' }, hw: '书架', n: { zh: '大书架', en: 'Bookshelf', ru: 'Полка книг', fr: 'Bibliothèque' } },
        { id: 'toy', e: '🧸', cat: 'floor', p: 55, w: { en: 'toy', ru: 'igrushka', zh: 'wanju' }, hw: '玩具', n: { zh: '玩偶熊', en: 'Teddy Bear', ru: 'Мишка', fr: 'Peluche' } },
        { id: 'rug', e: '🧶', cat: 'floor', p: 35, w: { en: 'rug', ru: 'kovyor', zh: 'ditan' }, hw: '地毯', n: { zh: '圆地毯', en: 'Rug', ru: 'Коврик', fr: 'Tapis' } },
        { id: 'painting', e: '🖼️', cat: 'wall', p: 70, w: { en: 'painting', ru: 'kartina', zh: 'hua' }, hw: '画', n: { zh: '名画', en: 'Painting', ru: 'Картина', fr: 'Tableau' } },
        { id: 'mirror', e: '🪞', cat: 'wall', p: 65, w: { en: 'mirror', ru: 'zerkalo', zh: 'jingzi' }, hw: '镜子', n: { zh: '穿衣镜', en: 'Mirror', ru: 'Зеркало', fr: 'Miroir' } },
        { id: 'plant', e: '🌿', cat: 'wall', p: 40, w: { en: 'plant', ru: 'rastenie', zh: 'hua' }, hw: '花', n: { zh: '绿盆栽', en: 'Potted Plant', ru: 'Растение', fr: 'Plante' } },
        { id: 'lantern', e: '🏮', cat: 'wall', p: 55, w: { en: 'lantern', ru: 'fonar', zh: 'deng' }, hw: '灯', n: { zh: '红灯笼', en: 'Lantern', ru: 'Фонарь', fr: 'Lanterne' } },
        { id: 'map', e: '🗺️', cat: 'wall', p: 85, w: { en: 'map', ru: 'karta', zh: 'ditu' }, hw: '地图', n: { zh: '世界地图', en: 'World Map', ru: 'Карта мира', fr: 'Carte' } },
        { id: 'clock', e: '🕰️', cat: 'wall', p: 45, w: { en: 'clock', ru: 'chasy', zh: 'zhong' }, hw: '钟', n: { zh: '挂钟', en: 'Wall Clock', ru: 'Часы', fr: 'Horloge' } },
        { id: 'dog', e: '🐕', cat: 'pet', p: 120, w: { en: 'dog', ru: 'sobaka', zh: 'gou' }, hw: '狗', n: { zh: '小狗', en: 'Puppy', ru: 'Щенок', fr: 'Chien' } },
        { id: 'cat', e: '🐈', cat: 'pet', p: 110, w: { en: 'cat', ru: 'koshka', zh: 'mao' }, hw: '猫', n: { zh: '小猫', en: 'Kitten', ru: 'Котёнок', fr: 'Chat' } },
        { id: 'fish', e: '🐠', cat: 'pet', p: 100, w: { en: 'fish', ru: 'ryba', zh: 'yu' }, hw: '鱼', n: { zh: '小鱼', en: 'Fish', ru: 'Рыбка', fr: 'Poisson' } },
        { id: 'bird', e: '🐦', cat: 'pet', p: 90, w: { en: 'bird', ru: 'ptitsa', zh: 'niao' }, hw: '鸟', n: { zh: '小鸟', en: 'Bird', ru: 'Птичка', fr: 'Oiseau' } },
        { id: 'hamster', e: '🐹', cat: 'pet', p: 95, w: { en: 'hamster', ru: 'homyak', zh: 'shu' }, hw: '鼠', n: { zh: '仓鼠', en: 'Hamster', ru: 'Хомяк', fr: 'Hamster' } },
        { id: 'crown', e: '👑', cat: 'wear', p: 150, w: { en: 'crown', ru: 'korona', zh: 'guan' }, hw: '冠', n: { zh: '皇冠', en: 'Crown', ru: 'Корона', fr: 'Couronne' } },
        { id: 'hat', e: '🎩', cat: 'wear', p: 80, w: { en: 'hat', ru: 'shlyapa', zh: 'mao' }, hw: '帽', n: { zh: '绅士帽', en: 'Top Hat', ru: 'Шляпа', fr: 'Chapeau' } },
        { id: 'sunglasses', e: '🕶️', cat: 'wear', p: 60, w: { en: 'glasses', ru: 'ochki', zh: 'yanjing' }, hw: '眼镜', n: { zh: '墨镜', en: 'Sunglasses', ru: 'Очки', fr: 'Lunettes' } },
        { id: 'bow', e: '🎀', cat: 'wear', p: 45, w: { en: 'bow', ru: 'bant', zh: 'jie' }, hw: '结', n: { zh: '蝴蝶结', en: 'Ribbon Bow', ru: 'Бант', fr: 'Nœud' } },
        { id: 'scarf', e: '🧣', cat: 'wear', p: 50, w: { en: 'scarf', ru: 'sharf', zh: 'weijin' }, hw: '围巾', n: { zh: '围巾', en: 'Scarf', ru: 'Шарф', fr: 'Écharpe' } },
        { id: 'sword', e: '⚔️', cat: 'wear', p: 130, w: { en: 'sword', ru: 'mech', zh: 'jian' }, hw: '剑', n: { zh: '宝剑', en: 'Sword', ru: 'Меч', fr: 'Épée' } },
        { id: 'shield', e: '🛡️', cat: 'wear', p: 120, w: { en: 'shield', ru: 'shit', zh: 'dun' }, hw: '盾', n: { zh: '盾牌', en: 'Shield', ru: 'Щит', fr: 'Bouclier' } },
        { id: 'wand', e: '✨', cat: 'wear', p: 110, w: { en: 'wand', ru: 'palochka', zh: 'bang' }, hw: '棒', n: { zh: '魔法杖', en: 'Magic Wand', ru: 'Волшебная палочка', fr: 'Baguette' } }
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
        floatCoin(COIN_SVG + ' +' + n, opts);
    }
    function spendCoins(n) {
        if (getCoins() < n) return false;
        setCoins(getCoins() - n); return true;
    }
    function floatCoin(text, opts) {
        try {
            var d = document.createElement('div');
            d.innerHTML = text;
            var x = (opts && typeof opts.x === 'number') ? opts.x : null;
            var y = (opts && typeof opts.y === 'number') ? opts.y : null;
            if (x === null) { x = window.innerWidth - 90; y = 70; }
            d.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%);z-index:5300;pointer-events:none;font-size:1.35rem;font-weight:900;color:#ffd700;text-shadow:0 0 10px rgba(255,180,0,.9),0 2px 3px rgba(0,0,0,.6);transition:top .9s ease-out,opacity .9s;';
            document.body.appendChild(d);
            requestAnimationFrame(function () { d.style.top = (y - 60) + 'px'; d.style.opacity = '0'; });
            setTimeout(function () { d.remove(); }, 950);
        } catch (e) {}
    }
    /* 本局金币记账：模式开局 mark，结算 delta 展示获得量 */
    var _mark = 0;
    function markCoins() { _mark = getCoins(); }
    function deltaCoins() { return getCoins() - _mark; }

    function refreshHUD() {
        var c = getCoins();
        ['heroHubCoins', 'm3-coins', 'q-coins', 'heroShopCoins', 'heroRoomCoins'].forEach(function (id) {
            var el = document.getElementById(id); if (el) el.textContent = c;
        });
        var hubAv = document.getElementById('heroHubAvatar');
        if (hubAv) hubAv.innerHTML = avatarHtml();
    }

    /* ================= 语言选择页 · 主角决策中心（头像/金币/商城/小屋都在这里） ================= */
    function buildHub() {
        var old = document.getElementById('heroHub'); if (old) old.remove();
        var screen = document.getElementById('langSelectScreen');
        if (!screen) return;
        var hub = document.createElement('div');
        hub.id = 'heroHub';
        hub.innerHTML =
            '<button id="heroHubAvatar" title="' + ht('hubTapRoom') + '">' + avatarHtml() + '</button>' +
            '<div id="heroHubInfo">' +
                '<div id="heroHubCoinsWrap" title="' + ht('hubTapCoins') + '">' + COIN_SVG + ' <b id="heroHubCoins">' + getCoins() + '</b></div>' +
            '</div>' +
            '<button class="hh-btn" id="heroHubShop">🛍️ ' + ht('shop') + '</button>' +
            '<button class="hh-btn" id="heroHubRoom" title="' + ht('room') + '">🏠 ' + ht('roomShort') + '</button>';
        var h1 = screen.querySelector('h1');
        screen.insertBefore(hub, h1 ? h1.nextSibling : screen.firstChild);
        document.getElementById('heroHubAvatar').addEventListener('click', function () { click(); openRoom(); });
        document.getElementById('heroHubCoinsWrap').addEventListener('click', function () { click(); openShop(); });
        document.getElementById('heroHubShop').addEventListener('click', function () { click(); openShop(); });
        document.getElementById('heroHubRoom').addEventListener('click', function () { click(); openRoom(); });
        refreshHUD();
    }
    /* 单人/对战按钮文案（语言页底部，随界面语言刷新） */
    function applyLangButtons() {
        var b1 = document.getElementById('btnLangNext');
        if (b1) b1.textContent = '📗 ' + ht('soloBtn');
        var b2 = document.getElementById('btnVsGame');
        if (b2) b2.textContent = '⚔️ ' + ht('vsBtn');
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
                    '<div class="hs-coins">' + COIN_SVG + ' <b id="heroShopCoins">' + getCoins() + '</b></div>' +
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
                '<span class="hs-price">' + (has ? '✓ ' + ht('owned') : COIN_SVG + ' ' + it.p) + '</span>' +
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
            '<div class="hsd-cat">' + COIN_SVG + ' ' + it.p + '</div></div>' +
            '<button class="hs-x" id="hsdX2">✕</button></div>' +
            '<div class="hsd-quiz">' + ht('buyTitle') + '</div>' +
            '<div class="hsd-quiz-box" id="hsdQuizBox"></div>' +
            '<div class="hsd-actions">' +
                '<button class="hh-btn big ok" id="hsdBuy"' + (getCoins() < it.p ? ' disabled' : '') + '>' + ht('confirmBuy') + '</button>' +
                '<button class="hh-btn" id="hsdNewWord">' + ht('hintFirst') + '</button>' +
            '</div>';
        wireClose('hsdX2');
        document.getElementById('hsdNewWord').addEventListener('click', function () {
            click();
            var box2 = document.getElementById('hsdQuizBox');
            var inp = document.getElementById('hsdInput');
            if (!box2 || !box2._word || !inp) return;
            inp.placeholder = String(box2._word.isZh ? (box2._word.display || box2._word.word) : box2._word.word).charAt(0) + '…';
            inp.focus();
        });
        document.getElementById('hsdBuy').addEventListener('click', function () { tryBuy(it); });
        renderQuiz(it);
        function wireClose(cid) {
            var x = document.getElementById(cid);
            if (x) x.addEventListener('click', function () { det.style.display = 'none'; });
        }
    }
    /* 商品关联挑战词：买床拼 bed——学习语言决定答案语言（zh=拼音/汉字，ru=俄语，其余=英语） */
    function itemChallenge(it) {
        var lang = learningLangSafe();
        var w = (it && it.w) || {};
        var word = (lang === 'zh' || lang === 'ru') ? (w[lang] || w.en) : (w.en || w.zh);
        if (!word) word = 'star';
        var display = (lang === 'zh' && it.hw) ? it.hw : word;
        return { word: word, display: display, mean: itemName(it), isZh: lang === 'zh', emoji: it.e };
    }
    function renderQuiz(it) {
        var box = document.getElementById('hsdQuizBox'); if (!box) return;
        var w = itemChallenge(it);
        box._word = w; box._item = it;
        var poor = getCoins() < it.p;   /* 余额不足：输入框灰掉，拼对也不给买 */
        var lenHint = w.isZh ? ((w.display || w.word).length + ht('wordHintZh')) : (String(w.word).length + ht('wordHint'));
        box.innerHTML =
            '<div class="hsd-hint"><span style="font-size:52px;line-height:1;">' + w.emoji + '</span></div>' +
            '<div class="hsd-mean">' + ht('quizItem') + '<b>' + w.mean + '</b>' + ht('quizItemEnd') + '</div>' +
            (poor ? '<div class="hsd-poor">' + ht('notEnough') + '</div>' : '<div class="hsd-len" style="margin:-4px 0 2px;">' + lenHint + '</div>') +
            '<input id="hsdInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="?"' + (poor ? ' disabled' : '') + '>';
        if (!poor) {
            var input = document.getElementById('hsdInput');
            input.focus();
            input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') tryBuy(it); });
        }
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
                    '<div class="hs-coins">' + COIN_SVG + ' <b id="heroRoomCoins">' + getCoins() + '</b></div>' +
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

    /* ================= ⚔️ 对战场：人机对战 / 全网匹配（押金币 · 抢词攻击） ================= */
    var vsState = { bet: 0, peer: null, peer2: null, conn: null, timer: 0 };
    function vsAiLevel() { try { return Math.max(1, Math.min(10, parseInt(localStorage.getItem('elc_vs_ai_level') || '1', 10) || 1)); } catch (e) { return 1; } }
    function vsName() {
        var n = lsGet('elc_vs_name', '');
        if (!n) { n = 'P' + Math.floor(1000 + Math.random() * 9000); lsSet('elc_vs_name', n); }
        return n;
    }
    function buildVsDict() {
        var ws = [];
        try { ws = (window.ELC && ELC.packWords && ELC.packWords('daily')) || []; } catch (e) {}
        if (!ws.length) { try { ws = (window.ELC && ELC.words && ELC.words()) || []; } catch (e) {} }
        var pool = [];
        for (var i = 0; i < ws.length; i++) { var L = String(ws[i].word || '').length; if (L >= 2 && L <= 10) pool.push(ws[i]); }
        for (var k = pool.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)); var tmp = pool[k]; pool[k] = pool[r]; pool[r] = tmp; }
        var dict = {};
        pool.slice(0, 10).forEach(function (w) { dict[w.word] = { mean: w.mean || '', single: false }; });
        return dict;
    }
    function openBattleLobby() {
        closeShop(); closeRoom(); closeMatch();
        vsState.bet = 0;
        var lv = vsAiLevel();
        var root = document.createElement('div');
        root.id = 'heroBattle';
        root.innerHTML =
            '<div class="hs-panel">' +
                '<div class="hs-head">' +
                    '<div class="hs-title">⚔️ ' + ht('vsTitle') + '</div>' +
                    '<div class="hs-coins">' + COIN_SVG + ' <b>' + getCoins() + '</b></div>' +
                    '<button class="hs-x" id="hbClose">✕</button>' +
                '</div>' +
                '<div class="hs-sub">' + ht('vsSub') + '</div>' +
                '<div class="hb-row"><span class="hb-label">🪞 ' + ht('vsName') + '</span><input id="hbName" maxlength="10" value="' + vsName() + '"></div>' +
                '<div class="hb-row"><span class="hb-label">' + COIN_SVG + ' ' + ht('vsBet') + '</span><div class="hb-bets" id="hbBets"></div></div>' +
                '<button class="hh-btn big" id="hbAi">🤖 ' + ht('vsAi') + ' Lv.' + lv + '</button>' +
                '<div class="hb-tip">' + ht('vsAiSub') + '</div>' +
                '<button class="hh-btn big net" id="hbNet">🌐 ' + ht('vsMatch') + '</button>' +
                '<div class="hb-tip">' + ht('vsMatchSub') + '</div>' +
            '</div>';
        document.body.appendChild(root);
        document.getElementById('hbClose').addEventListener('click', function () { click(); closeBattle(); try { ELC.goMenu && ELC.goMenu('langSelectScreen'); } catch (e) {} });
        document.getElementById('hbName').addEventListener('change', function () { lsSet('elc_vs_name', this.value.trim().slice(0, 10) || vsName()); });
        renderBetChips();
        document.getElementById('hbAi').addEventListener('click', function () { click(); startAiBattle(); });
        document.getElementById('hbNet').addEventListener('click', function () { click(); startMatch(); });
    }
    function closeBattle() { var el = document.getElementById('heroBattle'); if (el) el.remove(); }
    function renderBetChips() {
        var host = document.getElementById('hbBets'); if (!host) return;
        var opts = [0, 10, 30, 50, 100];
        var c = getCoins();
        var html = '';
        opts.forEach(function (v) {
            var dis = v > c ? ' disabled' : '';
            html += '<button data-bet="' + v + '" class="' + (vsState.bet === v ? 'on' : '') + '"' + dis + '>' + (v === 0 ? ht('vsBetNone') : v) + '</button>';
        });
        host.innerHTML = html;
        host.querySelectorAll('button').forEach(function (b) {
            b.addEventListener('click', function () { if (b.disabled) return; click(); vsState.bet = parseInt(b.dataset.bet, 10) || 0; renderBetChips(); });
        });
    }
    function startAiBattle() {
        var bet = vsState.bet;
        if (bet > 0 && getCoins() < bet) { toast(ht('noCoins')); return; }
        var lv = vsAiLevel();
        window.__m3vsBet = bet;
        closeBattle();
        try {
            if (window.ELC && ELC.startVsBattle) ELC.startVsBattle(buildVsDict(), { mode: 'ai', bet: bet, aiLevel: lv, opName: '🤖 Lv.' + lv, opAvatar: null });
            else toast('ERR: no ELC');
        } catch (e) { toast('ERR: ' + (e.message || e)); }
    }
    /* ---- 全网匹配（PeerJS：同语言大厅，先到者当庄等待，后到者挑战） ---- */
    function closeMatch() { var el = document.getElementById('heroMatch'); if (el) el.remove(); }
    function setMmStatus(t) { var el = document.getElementById('hmStatus'); if (el) el.textContent = t; }
    function openMatchUI() {
        closeMatch();
        var root = document.createElement('div');
        root.id = 'heroMatch';
        root.innerHTML =
            '<div class="hs-panel" style="text-align:center;">' +
                '<div class="hs-title" style="text-align:center;">🌐 ' + ht('vsMatch') + '</div>' +
                '<div class="mm-radar"><span class="mm-dot"></span><span class="mm-ring"></span><span class="mm-ring r2"></span></div>' +
                '<div id="hmStatus" class="hs-sub">…</div>' +
                '<div style="display:flex;gap:10px;justify-content:center;margin-top:10px;">' +
                    '<button class="hh-btn" id="hmRetry" style="display:none;">🔄 ' + ht('mmRetry') + '</button>' +
                    '<button class="hh-btn" id="hmCancel">' + ht('mmCancel') + '</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(root);
        document.getElementById('hmCancel').addEventListener('click', function () { click(); vsCleanupNet(); closeMatch(); openBattleLobby(); });
        document.getElementById('hmRetry').addEventListener('click', function () { click(); startMatch(); });
    }
    function mmFail(msg) {
        setMmStatus(msg);
        vsCleanupNet();
        var r = document.getElementById('hmRetry'); if (r) r.style.display = '';
    }
    function loadPeerJs(cb) {
        if (window.Peer) return cb(true);
        var s = document.createElement('script');
        s.src = 'peerjs.min.js';
        s.onload = function () { cb(true); };
        s.onerror = function () { cb(false); };
        document.head.appendChild(s);
    }
    function vsCleanupNet() {
        clearTimeout(vsState.timer);
        try { if (vsState.conn) vsState.conn.close(); } catch (e) {}
        try { if (vsState.peer) vsState.peer.destroy(); } catch (e) {}
        try { if (vsState.peer2) vsState.peer2.destroy(); } catch (e) {}
        vsState.conn = null; vsState.peer = null; vsState.peer2 = null;
    }
    function startMatch() {
        var bet = vsState.bet;
        if (bet > 0 && getCoins() < bet) { toast(ht('noCoins')); return; }
        closeBattle();
        openMatchUI();
        setMmStatus(ht('mmConnect'));
        loadPeerJs(function (ok) {
            if (!ok) { mmFail(ht('mmFail')); return; }
            var lobbyId = 'elcvs2-' + (learningLangSafe() || 'en');
            var my = { name: vsName(), avatar: getAvatar(), bet: bet };
            var done = false;
            vsCleanupNet();
            var p = new Peer(lobbyId, { debug: 0 });
            vsState.peer = p;
            vsState.timer = setTimeout(function () { if (!done) mmFail(ht('mmTimeout')); }, 30000);
            function launch(conn, dict, bet2, op) {
                done = true;
                clearTimeout(vsState.timer);
                closeMatch();
                window.__m3vsBet = bet2;
                try { ELC.attachVsNet(conn, dict, { mode: 'net', bet: bet2, opName: op.name || 'Player', opAvatar: op.avatar || null }); }
                catch (e) { toast('ERR: ' + (e.message || e)); }
            }
            p.on('open', function () {
                setMmStatus(ht('mmWait'));
                p.on('connection', function (conn) {
                    conn.on('data', function (d) {
                        if (!d) return;
                        if (d.type === 'join' && !done) {
                            var bet2 = Math.min(my.bet, parseInt(d.bet, 10) || 0);
                            var dict = buildVsDict();
                            try { conn.send({ type: 'start', dict: dict, bet: bet2, name: my.name, avatar: my.avatar }); } catch (e) {}
                            launch(conn, dict, bet2, d);
                        } else if (d.type === 'join' && done) { try { conn.send({ type: 'full' }); } catch (e) {} }
                    });
                });
            });
            p.on('error', function (e) {
                if (done) return;
                if (e && e.type === 'unavailable-id') {
                    setMmStatus(ht('mmHand'));
                    var g = new Peer({ debug: 0 });
                    vsState.peer2 = g;
                    g.on('open', function () {
                        var conn = g.connect(lobbyId, { reliable: true });
                        vsState.conn = conn;
                        conn.on('open', function () {
                            try { conn.send({ type: 'join', name: my.name, avatar: my.avatar, bet: my.bet }); } catch (e2) {}
                        });
                        conn.on('data', function (d) {
                            if (done || !d) return;
                            if (d.type === 'start') launch(conn, d.dict, parseInt(d.bet, 10) || 0, d);
                            else if (d.type === 'full') mmFail(ht('mmFull'));
                        });
                    });
                    g.on('error', function () { if (!done) mmFail(ht('mmFail')); });
                } else { mmFail(ht('mmFail')); }
            });
        });
    }

    /* ================= 🌐 关卡共享：分享码（生成 / 复制 / 导入 / 游玩） =================
       异步社区方案：玩家生成"分享码"发到群/好友 → 对方在"他人共享的关卡"粘贴导入。
       图片自动压缩至 96px JPEG 内嵌；音频体积过大不随码传输。 */
    function getSharedIn() { try { return JSON.parse(lsGet('elc_shared_in', '[]')); } catch (e) { return []; } }
    function setSharedIn(a) { try { lsSet('elc_shared_in', JSON.stringify(a.slice(0, 60))); } catch (e) { toast('storage full'); } }
    function shrinkImg(dataUrl, cb) {
        if (!dataUrl || dataUrl.indexOf('data:') !== 0) return cb(null);
        var im = new Image();
        im.onload = function () {
            try {
                var S = 96, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
                var x = cv.getContext('2d');
                var r = Math.min(im.width, im.height);
                x.drawImage(im, (im.width - r) / 2, (im.height - r) / 2, r, r, 0, 0, S, S);
                cb(cv.toDataURL('image/jpeg', 0.55));
            } catch (e) { cb(null); }
        };
        im.onerror = function () { cb(null); };
        im.src = dataUrl;
    }
    function encodeShareLevel(lvl, cb) {
        var dict = (lvl && lvl.dict) || {};
        var words = Object.keys(dict);
        var out = [];
        var i = 0;
        function next() {
            if (i >= words.length) {
                var payload = { v: 1, n: String(lvl.name || 'Shared').slice(0, 30), w: out };
                try { cb('ELCS1.' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))))); }
                catch (e) { cb(null); }
                return;
            }
            var w = words[i++];
            var d = dict[w] || {};
            var img = null;
            if (typeof d.img === 'string') {
                if (d.img.indexOf('data:') === 0) img = d.img;                       /* 自定义图片：压缩后内嵌 */
                else if (d.img.length <= 4 && !/^(blob:|https?:)/.test(d.img)) img = d.img;  /* emoji：直接随码 */
            }
            if (!img) { out.push([w, String(d.mean || '').slice(0, 60), null]); next(); return; }
            if (img.indexOf('data:') !== 0) { out.push([w, String(d.mean || '').slice(0, 60), img]); next(); return; }  /* emoji 直接随码 */
            shrinkImg(img, function (sm) { out.push([w, String(d.mean || '').slice(0, 60), sm]); next(); });
        }
        next();
    }
    function decodeShareCode(code) {
        try {
            code = String(code || '').trim();
            if (code.indexOf('ELCS1.') !== 0) return null;
            var json = decodeURIComponent(escape(atob(code.slice(6))));
            var payload = JSON.parse(json);
            if (!payload || !payload.w || payload.w.length < 3) return null;
            var dict = {};
            var ok = 0;
            payload.w.forEach(function (row) {
                if (!row || !row[0]) return;
                var w = String(row[0]).slice(0, 12);
                if (!/^[a-zà-ÿāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜа-яё0-9]{1,12}$/i.test(w)) return;
                var mean = String(row[1] || '').slice(0, 60);
                var img = null;
                if (typeof row[2] === 'string') {
                    if (/^data:image\/(png|jpeg|gif|webp);base64,/.test(row[2])) img = row[2];
                    else if (row[2].length <= 4) img = row[2];   /* emoji 词图 */
                }
                dict[w] = { mean: mean, img: img || '📝', audio: null, single: w.length === 1 };
                ok++;
            });
            if (ok < 3) return null;
            return { name: String(payload.n || 'Shared'), dict: dict };
        } catch (e) { return null; }
    }
    function openShareLevel(lvl) {
        closeSharePanel();
        var root = document.createElement('div');
        root.id = 'heroShare';
        root.innerHTML =
            '<div class="hs-panel">' +
                '<div class="hs-head"><div class="hs-title">🔗 ' + ht('shareTitle') + '</div>' +
                '<button class="hs-x" id="hsShareClose">✕</button></div>' +
                '<div class="hs-sub">' + ht('shareTip') + '</div>' +
                '<div id="hsShareBody" class="hs-sub">⏳ ' + ht('shareGen') + '</div>' +
            '</div>';
        document.body.appendChild(root);
        document.getElementById('hsShareClose').addEventListener('click', function () { click(); closeSharePanel(); });
        encodeShareLevel(lvl, function (code) {
            var body = document.getElementById('hsShareBody');
            if (!body) return;
            if (!code) { body.innerHTML = '❌ ' + ht('shareGen'); return; }
            var kb = Math.round(code.length / 1024);
            body.innerHTML =
                '<textarea id="hsShareCode" readonly style="width:100%;height:120px;background:rgba(0,0,0,.5);color:#9fe8b0;font-size:.72rem;border:1px solid rgba(83,215,105,.4);border-radius:10px;padding:8px;box-sizing:border-box;word-break:break-all;">' + code + '</textarea>' +
                '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">' +
                    '<button class="hh-btn big ok" id="hsShareCopy">📋 ' + ht('copyCode') + '</button>' +
                '</div>' +
                '<div class="hs-sub" style="margin-top:6px;">' + ht('shareSize').replace('{n}', kb) + '</div>';
            document.getElementById('hsShareCopy').addEventListener('click', function () {
                click();
                var ta = document.getElementById('hsShareCode');
                ta.select();
                var done = function () { toast(ht('copyOk')); };
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, function () { document.execCommand('copy'); done(); });
                    else { document.execCommand('copy'); done(); }
                } catch (e) { toast(ht('copyOk')); }
            });
        });
    }
    function closeSharePanel() { var el = document.getElementById('heroShare'); if (el) el.remove(); }
    function openSharedLib() {
        closeLib();
        var root = document.createElement('div');
        root.id = 'heroSharedLib';
        root.innerHTML =
            '<div class="hs-panel">' +
                '<div class="hs-head"><div class="hs-title">🌐 ' + ht('shareLib') + '</div>' +
                '<button class="hs-x" id="hsLibClose">✕</button></div>' +
                '<div class="hs-sub">' + ht('libTip') + '</div>' +
                '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
                    '<textarea id="hsImportCode" placeholder="' + ht('importPh') + '" style="flex:1;height:54px;background:rgba(0,0,0,.5);color:#fff;font-size:.78rem;border:1px solid rgba(255,255,255,.25);border-radius:10px;padding:8px;box-sizing:border-box;"></textarea>' +
                    '<button class="hh-btn ok" id="hsImportBtn" style="align-self:flex-end;">📥 ' + ht('importBtn') + '</button>' +
                '</div>' +
                '<div id="hsLibList"></div>' +
            '</div>';
        document.body.appendChild(root);
        document.getElementById('hsLibClose').addEventListener('click', function () { click(); closeLib(); });
        document.getElementById('hsImportBtn').addEventListener('click', function () {
            click();
            var code = document.getElementById('hsImportCode').value;
            var lvl = decodeShareCode(code);
            if (!lvl) { toast(ht('importBad')); return; }
            var list = getSharedIn();
            lvl.id = 's' + Date.now();
            lvl.at = Date.now();
            list.unshift(lvl);
            setSharedIn(list);
            toast(ht('importOk'));
            document.getElementById('hsImportCode').value = '';
            renderLibList();
        });
        renderLibList();
    }
    function closeLib() { var el = document.getElementById('heroSharedLib'); if (el) el.remove(); }
    function renderLibList() {
        var host = document.getElementById('hsLibList'); if (!host) return;
        var list = getSharedIn();
        if (!list.length) { host.innerHTML = '<div class="hs-sub">' + ht('libEmpty') + '</div>'; return; }
        var html = '';
        list.forEach(function (lvl, i) {
            var n = Object.keys(lvl.dict).length;
            html += '<div class="sl-item" data-i="' + i + '">' +
                '<div class="sl-info"><div class="sl-name">📗 ' + String(lvl.name).slice(0, 24) + '</div>' +
                '<div class="sl-meta">' + n + ht('wordsUnit') + ' · ' + new Date(lvl.at || Date.now()).toLocaleDateString() + '</div></div>' +
                '<button class="hh-btn ok mini" data-play="' + i + '">▶</button>' +
                '<button class="hh-btn mini" data-share="' + i + '">🔗</button>' +
                '<button class="hh-btn mini" data-del="' + i + '" style="background:rgba(255,71,87,.25);border-color:rgba(255,71,87,.6);color:#ff8a8a;">✖</button>' +
            '</div>';
        });
        host.innerHTML = html;
        host.querySelectorAll('[data-play]').forEach(function (b) {
            b.addEventListener('click', function () {
                click();
                var lvl = getSharedIn()[parseInt(b.dataset.play, 10)];
                if (!lvl) return;
                closeLib();
                var dict = {};
                for (var w in lvl.dict) dict[w] = { mean: lvl.dict[w].mean, img: lvl.dict[w].img, single: w.length === 1 };
                try { ELC.startFillDict(dict); } catch (e) { toast('ERR'); }
            });
        });
        host.querySelectorAll('[data-share]').forEach(function (b) {
            b.addEventListener('click', function () { click(); var lvl = getSharedIn()[parseInt(b.dataset.share, 10)]; if (lvl) { closeLib(); openShareLevel(lvl); } });
        });
        host.querySelectorAll('[data-del]').forEach(function (b) {
            b.addEventListener('click', function () {
                click();
                var list2 = getSharedIn();
                list2.splice(parseInt(b.dataset.del, 10), 1);
                setSharedIn(list2);
                renderLibList();
            });
        });
    }

    /* ================= 语言选择界面：主角陪伴气泡（头像在信息栏） ================= */
    function buildLangBuddy() {
        var scr = document.getElementById('langSelectScreen');
        if (!scr) return;
        var old = document.getElementById('heroLangBuddy');
        if (old) old.remove();
        var hub = document.getElementById('heroHub');
        var anchor = hub ? hub.nextSibling : null;
        if (!anchor) { var h1 = scr.querySelector('h1'); anchor = h1 ? h1.nextSibling : scr.firstChild; }
        var d = document.createElement('div');
        d.id = 'heroLangBuddy';
        d.innerHTML = '<span class="hlb-bubble">💬 ' + ht('langBuddy') + '</span>';
        scr.insertBefore(d, anchor);
    }

    /* ================= 样式注入 ================= */
    var CSS = ''
        + '#heroHub{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:0 0 4px;}'
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
        + '#hsdInput:disabled{opacity:.45;border-color:rgba(255,255,255,.15);background:rgba(0,0,0,.3);cursor:not-allowed;}'
        + '.hh-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}'
        + '.hsd-poor{color:#ff9a9a;font-weight:900;font-size:.85rem;background:rgba(255,71,87,.12);border:1px solid rgba(255,71,87,.35);border-radius:10px;padding:6px 10px;}'
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
        + '.coin-ic{width:1.05em;height:1.05em;vertical-align:-0.15em;display:inline-block;}'
        /* 语言选择界面主角 */
        + '#heroLangBuddy{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 8px;flex-wrap:wrap;}'
        + '.hlb-av{width:46px;height:46px;border-radius:50%;border:2px solid rgba(241,196,15,.7);background:rgba(0,0,0,.35);font-size:24px;display:flex;align-items:center;justify-content:center;overflow:hidden;}'
        + '.hlb-av img{max-width:38px;max-height:38px;border-radius:50%;} '
        + '.hlb-bubble{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:.85rem;font-weight:700;border-radius:14px;padding:6px 12px;max-width:min(60vw,300px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
        + '@media (max-width:520px){'
        + '  #heroHub{gap:6px;}'
        + '  #heroHubAvatar{width:42px;height:42px;font-size:21px;border-radius:11px;}'
        + '  #heroHubAvatar img{max-width:32px;max-height:32px;}'
        + '  #heroHubInfo{padding:3px 9px;font-size:.85rem;}'
        + '  #heroHub .hh-btn{padding:5px 10px;font-size:.78rem;border-radius:15px;}'
        + '}'
        /* 对战场大厅 */
        + '#heroBattle,#heroMatch{position:fixed;inset:0;background:rgba(8,8,18,.96);z-index:4600;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;backdrop-filter:blur(6px);}'
        + '.hb-row{display:flex;align-items:center;gap:10px;margin:8px 0;flex-wrap:wrap;}'
        + '.hb-label{color:rgba(255,255,255,.8);font-size:.9rem;font-weight:900;min-width:5.5em;}'
        + '#hbName{flex:1;min-width:120px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:10px;padding:8px 12px;font-size:1rem;font-weight:700;outline:none;}'
        + '#hbName:focus{border-color:#f1c40f;}'
        + '.hb-bets{display:flex;gap:6px;flex-wrap:wrap;}'
        + '.hb-bets button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:#fff;border-radius:14px;padding:6px 14px;font-weight:900;cursor:pointer;}'
        + '.hb-bets button.on{background:linear-gradient(to bottom,#f1c40f,#d48806);color:#3a2400;border-color:#f1c40f;}'
        + '.hb-bets button:disabled{opacity:.3;cursor:not-allowed;}'
        + '#heroBattle .hh-btn.big{width:100%;margin-top:12px;box-sizing:border-box;}'
        + '#heroBattle .hh-btn.big.net{background:linear-gradient(to bottom,#53a6ff,#1e60c8);border-color:rgba(83,166,255,.8);color:#031b3d;box-shadow:0 3px 0 #14479c,0 4px 10px rgba(0,0,0,.4);}'
        + '.hb-tip{color:rgba(255,255,255,.5);font-size:.75rem;text-align:center;margin-top:4px;}'
        /* 匹配雷达 */
        + '.mm-radar{position:relative;width:110px;height:110px;margin:14px auto;}'
        + '.mm-dot{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#53d769;box-shadow:0 0 14px rgba(83,215,105,.9);}'
        + '.mm-ring{position:absolute;inset:0;border:2px solid rgba(83,215,105,.5);border-radius:50%;animation:mmPing 1.6s ease-out infinite;}'
        + '.mm-ring.r2{animation-delay:.8s;}'
        + '@keyframes mmPing{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.15);opacity:0}}'
        /* 关卡共享 */
        + '#heroShare,#heroSharedLib{position:fixed;inset:0;background:rgba(8,8,18,.96);z-index:4600;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;backdrop-filter:blur(6px);}'
        + '.sl-item{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px 10px;margin-bottom:8px;}'
        + '.sl-info{flex:1;min-width:0;} .sl-name{color:#fff;font-weight:900;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
        + '.sl-meta{color:rgba(255,255,255,.55);font-size:.72rem;}'
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
        coinIcon: coinIcon,
        markCoins: markCoins,
        deltaCoins: deltaCoins,
        openRoom: openRoom,
        openBattleLobby: openBattleLobby,
        openShareLevel: openShareLevel,
        openSharedLib: openSharedLib,
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
        buildLangBuddy();
        applyLangButtons();
        applyAvatarToModes();
        refreshHUD();
        document.addEventListener('i18n:change', function () {
            buildHub();          /* 重建信息栏文案 */
            buildLangBuddy();    /* 语言界面主角气泡文案 */
            applyLangButtons();
            refreshHUD();
            if (document.getElementById('heroShop')) { closeShop(); openShop(); }
            if (document.getElementById('heroRoom')) { closeRoom(); openRoom(); }
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
