/* ============================================================
 * 中文学习数据：写字模式关卡 + 拼音词库（俄罗斯方块/填词/闯关通用）
 * 中文词以无声调拼音为键，ZH_DISPLAY 提供对应汉字显示
 * ============================================================ */
window.ZH_WORDS = {
        'ni': {mean: '你', hanzi: '你', img: '🈶', color: null},
        'wo': {mean: '我', hanzi: '我', img: '🈶', color: null},
        'ta': {mean: '他', hanzi: '他', img: '🈶', color: null},
        'hao': {mean: '好', hanzi: '好', img: '🈶', color: null},
        'bu': {mean: '不', hanzi: '不', img: '🈶', color: null},
        'you': {mean: '有', hanzi: '有', img: '🈶', color: null},
        'chi': {mean: '吃', hanzi: '吃', img: '🈶', color: null},
        'he': {mean: '喝', hanzi: '喝', img: '🈶', color: null},
        'shui': {mean: '水', hanzi: '水', img: '🈶', color: null},
        'da': {mean: '大', hanzi: '大', img: '🈶', color: null},
        'xiao': {mean: '小', hanzi: '小', img: '🈶', color: null},
        'duo': {mean: '多', hanzi: '多', img: '🈶', color: null},
        'shang': {mean: '上', hanzi: '上', img: '🈶', color: null},
        'xia': {mean: '下', hanzi: '下', img: '🈶', color: null},
        'ren': {mean: '人', hanzi: '人', img: '🈶', color: null},
        'kou': {mean: '口', hanzi: '口', img: '🈶', color: null},
        'shou': {mean: '手', hanzi: '手', img: '🈶', color: null},
        'mu': {mean: '目', hanzi: '目', img: '🈶', color: null},
        'tian': {mean: '天', hanzi: '天', img: '🈶', color: null},
        'yue': {mean: '月', hanzi: '月', img: '🈶', color: null},
        'ri': {mean: '日', hanzi: '日', img: '🈶', color: null},
        'shan': {mean: '山', hanzi: '山', img: '🈶', color: null},
        'huo': {mean: '火', hanzi: '火', img: '🈶', color: null},
        'shi': {mean: '是', hanzi: '是', img: '🈶', color: null}
};
window.ZH_DISPLAY = {"ni": "你", "wo": "我", "ta": "他", "hao": "好", "bu": "不", "you": "有", "chi": "吃", "he": "喝", "shui": "水", "da": "大", "xiao": "小", "duo": "多", "shang": "上", "xia": "下", "ren": "人", "kou": "口", "shou": "手", "mu": "目", "tian": "天", "yue": "月", "ri": "日", "shan": "山", "huo": "火", "shi": "是", "nihao": "你好", "women": "我们", "xiexie": "谢谢", "zaijian": "再见", "wanan": "晚安", "shenme": "什么", "zheli": "这里", "nali": "那里", "xianzai": "现在", "jintian": "今天", "mingtian": "明天", "xuesheng": "学生", "laoshi": "老师", "pengyou": "朋友", "shuiguo": "水果", "chifan": "吃饭", "heshui": "喝水", "shouji": "手机", "diannao": "电脑", "daxiao": "大小"};
window.ZH_PINYIN = {"你": "nǐ", "我": "wǒ", "他": "tā", "她": "tā", "们": "men", "好": "hǎo", "是": "shì", "在": "zài", "不": "bù", "有": "yǒu", "吃": "chī", "喝": "hē", "食": "shí", "物": "wù", "水": "shuǐ", "谢": "xiè", "再": "zài", "见": "jiàn", "晚": "wǎn", "安": "ān", "什": "shén", "这": "zhè", "那": "nà", "哪": "nǎ", "吗": "ma", "大": "dà", "小": "xiǎo", "多": "duō", "少": "shǎo", "上": "shàng", "下": "xià", "中": "zhōng", "天": "tiān", "月": "yuè", "日": "rì", "人": "rén", "口": "kǒu", "手": "shǒu", "目": "mù", "耳": "ěr", "一": "yī", "二": "èr", "三": "sān", "四": "sì", "五": "wǔ", "山": "shān", "火": "huǒ", "石": "shí", "田": "tián", "土": "tǔ", "ni": "nǐ", "wo": "wǒ", "ta": "tā", "hao": "hǎo", "bu": "bù", "you": "yǒu", "chi": "chī", "he": "hē", "shui": "shuǐ", "da": "dà", "xiao": "xiǎo", "duo": "duō", "shang": "shàng", "xia": "xià", "ren": "rén", "kou": "kǒu", "shou": "shǒu", "mu": "mù", "tian": "tiān", "yue": "yuè", "ri": "rì", "shan": "shān", "huo": "huǒ", "shi": "shì", "nihao": "nǐhǎo", "women": "wǒmen", "xiexie": "xièxie", "zaijian": "zàijiàn", "wanan": "wǎn'ān", "shenme": "shénme", "zheli": "zhèlǐ", "nali": "nàlǐ", "xianzai": "xiànzài", "jintian": "jīntiān", "mingtian": "míngtiān", "xuesheng": "xuésheng", "laoshi": "lǎoshī", "pengyou": "péngyou", "shuiguo": "shuǐguǒ", "chifan": "chīfàn", "heshui": "hēshuǐ", "shouji": "shǒujī", "diannao": "diànnǎo", "daxiao": "dàxiǎo"};
window.ZH_PACK_LEVELS = [{"name":"中文起步1","words":[["nihao","你好"],["women","我们"],["xiexie","谢谢"],["zaijian","再见"],["wanan","晚安"]]},{"name":"中文起步2","words":[["shenme","什么"],["zheli","这里"],["nali","那里"],["xianzai","现在"],["jintian","今天"]]},{"name":"中文起步3","words":[["mingtian","明天"],["xuesheng","学生"],["laoshi","老师"],["pengyou","朋友"],["shuiguo","水果"]]},{"name":"中文起步4","words":[["chifan","吃饭"],["heshui","喝水"],["shouji","手机"],["diannao","电脑"],["daxiao","大小"]]}];
window.ZH_WRITING_LEVELS = [
    { name: '生存·人称', chars: [["你","nǐ"],["我","wǒ"],["他","tā"],["她","tā"],["们","men"]] },
    { name: '生活·好坏', chars: [["好","hǎo"],["是","shì"],["在","zài"],["不","bù"],["有","yǒu"]] },
    { name: '生存·吃喝', chars: [["吃","chī"],["喝","hē"],["食","shí"],["物","wù"],["水","shuǐ"]] },
    { name: '礼貌·感谢', chars: [["谢","xiè"],["再","zài"],["见","jiàn"],["晚","wǎn"],["安","ān"]] },
    { name: '提问·什么', chars: [["什","shén"],["这","zhè"],["那","nà"],["哪","nǎ"],["吗","ma"]] },
    { name: '比较·大小', chars: [["大","dà"],["小","xiǎo"],["多","duō"],["少","shǎo"],["上","shàng"]] },
    { name: '时间·天月', chars: [["下","xià"],["中","zhōng"],["天","tiān"],["月","yuè"],["日","rì"]] },
    { name: '身体·五官', chars: [["人","rén"],["口","kǒu"],["手","shǒu"],["目","mù"],["耳","ěr"]] },
    { name: '数字·一二三', chars: [["一","yī"],["二","èr"],["三","sān"],["四","sì"],["五","wǔ"]] },
    { name: '自然·山水', chars: [["山","shān"],["火","huǒ"],["石","shí"],["田","tián"],["土","tǔ"]] },
];
