const titleCase = (word) => word.charAt(0) + word.slice(1).toLowerCase();

const SPECIAL = {
  LORD: [
    "LORD is a title for God that emphasizes divine authority and, especially in small capitals, represents God's covenant name in many English Bibles.",
    "LORD 是圣经中对上帝的称呼，强调祂的权柄；在许多英文译本中，全大写或小型大写形式也代表上帝的盟约之名。",
  ],
  ISRAEL: [
    "Israel is the name given to Jacob and then to his descendants, the twelve tribes, and the people formed through God's covenant promises.",
    "以色列是雅各所得的新名，后来也指他的后裔、十二支派，以及在上帝盟约应许中形成的百姓。",
  ],
  KING: [
    "A king rules a people or territory. Scripture speaks of human kings while also presenting God and Christ as the highest and righteous King.",
    "君王治理百姓或疆土。圣经既记载人的君王，也宣告上帝与基督是至高而公义的王。",
  ],
  DAVID: [
    "David was a shepherd, warrior, psalmist, and king of Israel. His victories, failures, repentance, and covenant legacy shape much of the biblical story.",
    "大卫曾是牧羊人、战士、诗人和以色列王。他的得胜、失败、悔改与盟约传承构成了圣经叙事的重要部分。",
  ],
  MOSES: [
    "Moses led Israel out of Egypt, received the law at Sinai, and guided the people through the wilderness toward the promised land.",
    "摩西带领以色列人离开埃及，在西奈山领受律法，并引导百姓经过旷野走向应许之地。",
  ],
  EGYPT: [
    "Egypt is the Nile-centered kingdom where Joseph rose to power and where Israel later lived in bondage before the Exodus.",
    "埃及是以尼罗河为中心的古国；约瑟曾在这里掌权，以色列人后来也在此受奴役，直到出埃及。",
  ],
  JESUS: [
    "Jesus of Nazareth is the central figure of the New Testament, proclaimed as the Messiah and Son of God whose life, death, and resurrection bring salvation.",
    "拿撒勒人耶稣是新约的中心人物，被宣告为弥赛亚和上帝的儿子；祂的生、死与复活带来救恩。",
  ],
  HEART: [
    "In Scripture, the heart represents the inner center of thought, desire, character, and spiritual response—not merely emotion.",
    "在圣经中，心代表思想、愿望、品格与属灵回应的内在中心，并不只是情绪。",
  ],
  JUDAH: [
    "Judah was Jacob and Leah's fourth son. His name also identifies the tribe, southern kingdom, and royal line from which David and Jesus came.",
    "犹大是雅各与利亚的第四个儿子；这个名字也指犹大支派、南国，以及大卫和耶稣所属的王族谱系。",
  ],
  SAUL: [
    "Saul, son of Kish, was Israel's first king. His promising beginning gave way to disobedience, jealousy of David, and a tragic decline.",
    "基士的儿子扫罗是以色列第一位君王。他起初前景光明，后来却因悖逆、嫉妒大卫而走向悲剧。",
  ],
  AARON: [
    "Aaron was Moses' brother, his spokesman before Pharaoh, and the first high priest of Israel's priestly line.",
    "亚伦是摩西的哥哥，曾在法老面前替摩西发言，也是以色列祭司体系中的第一位大祭司。",
  ],
  HEAVEN: [
    "Heaven can describe the sky, the created heavens, or God's dwelling and rule. Scripture uses it to lift attention beyond the visible world.",
    "天可以指天空、受造的诸天，也可指上帝的居所与统治。圣经借此把人的目光引向可见世界之外。",
  ],
  SOLOMON: [
    "Solomon, son of David and Bathsheba, became king of Israel, was renowned for wisdom, and built the first temple in Jerusalem.",
    "所罗门是大卫和拔示巴的儿子，后来作以色列王，以智慧闻名，并在耶路撒冷建造第一圣殿。",
  ],
  CHRIST: [
    "Christ means “Anointed One” and is the Greek equivalent of Messiah. The New Testament uses it as the royal and saving title of Jesus.",
    "Christ 意为“受膏者”，是“弥赛亚”的希腊语对应词；新约以此宣告耶稣君王与救主的身份。",
  ],
  BABYLON: [
    "Babylon was a great Mesopotamian city and empire that conquered Judah and destroyed Jerusalem. It later became a symbol of proud, oppressive power.",
    "巴比伦是美索不达米亚的大城与帝国，曾征服犹大并毁坏耶路撒冷，后来也成为骄傲和压迫权势的象征。",
  ],
  ABRAHAM: [
    "Abraham answered God's call to leave his homeland and became the ancestor of Israel. God's covenant with him promised land, descendants, and blessing to the nations.",
    "亚伯拉罕回应上帝的呼召离开故乡，成为以色列的先祖；上帝与他立约，应许土地、后裔和临到万国的祝福。",
  ],
  SPIRIT: [
    "Spirit can mean breath, the inner life, a spiritual being, or the Spirit of God. Context determines how this rich biblical word is being used.",
    "灵可以指气息、人的内在生命、属灵存在或上帝的灵；需要根据上下文理解这个含义丰富的圣经词语。",
  ],
  LIFE: [
    "Life in Scripture includes physical existence, a way of living, spiritual renewal, and the eternal life God gives through Christ.",
    "圣经中的生命既包括肉身存活和生活方式，也包括属灵更新，以及上帝借基督赐下的永生。",
  ],
  BLOOD: [
    "Blood represents life and has a central place in biblical sacrifice and covenant. The New Testament connects the blood of Jesus with forgiveness and reconciliation.",
    "血代表生命，在圣经的献祭与立约中十分重要；新约把耶稣的血与赦免、和好联系起来。",
  ],
  JOSHUA: [
    "Joshua succeeded Moses, led Israel across the Jordan, and guided the people during the entry into Canaan.",
    "约书亚接续摩西，带领以色列人过约旦河，并在进入迦南的过程中领导百姓。",
  ],
  GLORY: [
    "Glory describes weight, honor, splendor, and the radiant presence of God. It also names the honor rightly returned to God.",
    "荣耀表达分量、尊荣、光辉与上帝彰显的同在，也指人应当归给上帝的尊崇。",
  ],
  JACOB: [
    "Jacob, son of Isaac and Rebekah, was renamed Israel after wrestling with God. His twelve sons became ancestors of Israel's tribes.",
    "雅各是以撒和利百加的儿子，与上帝摔跤后得名以色列；他的十二个儿子成为以色列各支派的先祖。",
  ],
  JORDAN: [
    "The Jordan River marks an important boundary in the biblical land. Israel crossed it under Joshua, and Jesus was baptized in it by John.",
    "约旦河是圣经地理中的重要边界；以色列人在约书亚带领下渡河，耶稣也在这里接受约翰的洗礼。",
  ],
  PAUL: [
    "Paul was once a persecutor of Christians, but an encounter with the risen Jesus made him an apostle and missionary to the Gentiles.",
    "保罗原先逼迫基督徒，却因遇见复活的耶稣而成为使徒，并向外邦人传扬福音。",
  ],
  BREAD: [
    "Bread was a daily staple and a sign of God's provision. Jesus also used it to speak of himself as the bread of life.",
    "饼是日常主食，也是上帝供应的记号；耶稣还以饼说明自己是生命的粮。",
  ],
  ZION: [
    "Zion first named Jerusalem's fortified hill and came to represent the city, God's dwelling among his people, and their future hope.",
    "锡安起初指耶路撒冷的坚固山丘，后来也代表圣城、上帝在百姓中的居所，以及他们将来的盼望。",
  ],
  LIGHT: [
    "Light is a biblical image of creation, truth, holiness, guidance, and God's life-giving presence; darkness often forms its moral contrast.",
    "光在圣经中象征创造、真理、圣洁、引导与上帝赐生命的同在；黑暗常成为它在道德上的对照。",
  ],
  SAMUEL: [
    "Samuel was dedicated to God as a child, served as prophet and judge, and anointed both Saul and David as kings of Israel.",
    "撒母耳从小被献给上帝，后来担任先知和士师，并先后膏立扫罗与大卫为以色列王。",
  ],
  ISAAC: [
    "Isaac was the promised son of Abraham and Sarah, husband of Rebekah, and father of Esau and Jacob.",
    "以撒是上帝应许给亚伯拉罕和撒拉的儿子，后来娶利百加，并成为以扫和雅各的父亲。",
  ],
  JOSEPH: [
    "Joseph, Jacob's favored son, was sold into Egypt but rose to authority and preserved his family during famine.",
    "约瑟是雅各所爱的儿子，被卖到埃及后却升居高位，并在饥荒中保全了自己的家族。",
  ],
  PROPHET: [
    "A prophet is called to speak God's message, confronting wrongdoing, interpreting events, and announcing warning, judgment, or hope.",
    "先知蒙召传达上帝的信息，责备罪恶、解释时代，也宣告警告、审判或盼望。",
  ],
  FAITH: [
    "Faith is trustful reliance on God that receives his promise and expresses itself through loyalty, obedience, and persevering hope.",
    "信心是对上帝的信靠，领受祂的应许，并借忠诚、顺服与持久的盼望表现出来。",
  ],
  TEMPLE: [
    "The temple in Jerusalem was the central place of Israel's worship and sacrifice and a sign of God's presence among his people.",
    "耶路撒冷圣殿是以色列敬拜和献祭的中心，也是上帝住在百姓中间的记号。",
  ],
  ANGEL: [
    "An angel is a messenger or servant sent by God. Biblical angels deliver messages, protect, worship, and carry out divine purposes.",
    "天使是上帝差遣的使者与仆役；圣经中的天使传递信息、施行保护、敬拜，并执行上帝的旨意。",
  ],
  ELIJAH: [
    "Elijah was a prophet in the northern kingdom who opposed Baal worship, challenged Ahab, and called Israel back to the LORD.",
    "以利亚是北国先知，反对巴力崇拜、责备亚哈，并呼召以色列重新归向耶和华。",
  ],
  DANIEL: [
    "Daniel was a Jewish exile who served in foreign courts while remaining faithful to God. His book joins court stories with visions of God's kingdom.",
    "但以理是被掳的犹太人，在外邦宫廷任职却仍忠于上帝；他的书卷把宫廷故事与上帝国度的异象结合起来。",
  ],
  SATAN: [
    "Satan means adversary and names the spiritual opponent who accuses, deceives, and resists God's purposes, yet remains under God's final judgment.",
    "撒但意为“敌对者”，指控告、欺骗并抵挡上帝旨意的属灵仇敌，但最终仍在上帝的审判之下。",
  ],
  ESTHER: [
    "Esther was a Jewish woman who became queen of Persia and courageously intervened to save her people from destruction.",
    "以斯帖是一位成为波斯王后的犹太女子；她勇敢地出面，使自己的民族免遭毁灭。",
  ],
  NOAH: [
    "Noah obeyed God's warning by building the ark, survived the flood with his household, and received God's covenant marked by the rainbow.",
    "挪亚听从上帝的警告建造方舟，与家人一同经过洪水，并领受以上帝彩虹为记号的约。",
  ],
  GIDEON: [
    "Gideon was a reluctant judge whom God used to defeat Midian with a surprisingly small army, showing that deliverance did not depend on numbers.",
    "基甸起初并不自信，却被上帝使用，以极少的军队击败米甸，表明拯救并不取决于人数。",
  ],
  SAMSON: [
    "Samson was a judge gifted with extraordinary strength. His victories and failures show both God's deliverance and the cost of uncontrolled desire.",
    "参孙是拥有非凡力量的士师；他的得胜与失败同时显出上帝的拯救，也显明放纵欲望的代价。",
  ],
  JONAH: [
    "Jonah was a prophet sent to Nineveh who fled, was rescued through a great fish, and learned about God's compassion for outsiders.",
    "约拿是被差往尼尼微的先知；他曾逃避使命，借大鱼获救，并学习上帝对外族人的怜悯。",
  ],
  RUTH: [
    "Ruth was a Moabite widow whose loyalty to Naomi led her to Bethlehem, marriage to Boaz, and a place in David's family line.",
    "路得是摩押寡妇；她忠于拿俄米，来到伯利恒，嫁给波阿斯，并进入大卫的家族谱系。",
  ],
  MARY: [
    "Mary most often refers to the mother of Jesus, who received God's calling with trust; several other faithful women in the New Testament share the name.",
    "马利亚通常指耶稣的母亲，她以信靠回应上帝的呼召；新约中也有几位忠心的妇女同名。",
  ],
  PETER: [
    "Peter was a fisherman called by Jesus, a leading apostle whose bold confession, failure, restoration, and witness shaped the early church.",
    "彼得原是渔夫，后蒙耶稣呼召成为重要使徒；他的勇敢认信、失败、复兴与见证深刻影响了初代教会。",
  ],
  JOHN: [
    "John may refer to John the Baptist or the apostle John. Both direct attention to Jesus through prophetic witness and faithful discipleship.",
    "约翰可指施洗约翰或使徒约翰；两人都以先知性的见证与忠心的跟随把人的目光指向耶稣。",
  ],
  GRACE: [
    "Grace is God's freely given favor and help, received rather than earned, that forgives, restores, and empowers faithful living.",
    "恩典是上帝白白赐下、并非靠人赚取的恩惠与帮助，使人得赦免、被恢复，并有力量忠心生活。",
  ],
  GOSPEL: [
    "Gospel means good news: the announcement that God's saving reign has come through the life, death, and resurrection of Jesus Christ.",
    "福音意为“好消息”：上帝借耶稣基督的生、死与复活施行拯救、彰显国度。",
  ],
  PRAYER: [
    "Prayer is communication with God through praise, confession, thanksgiving, lament, listening, and requests for oneself or others.",
    "祷告是人与上帝的交流，包括赞美、认罪、感恩、哀诉、聆听，以及为自己或他人祈求。",
  ],
  WORSHIP: [
    "Worship is the reverent response of honoring and serving God with the whole life, expressed in prayer, praise, obedience, and gathered devotion.",
    "敬拜是以整个生命尊崇并事奉上帝的敬虔回应，表现为祷告、赞美、顺服和共同聚集。",
  ],
  SABBATH: [
    "The Sabbath is the seventh-day rest set apart by God, giving Israel a rhythm of worship, rest, freedom, and trust in divine provision.",
    "安息日是上帝分别为圣的第七日，使以色列人在敬拜、休息、自由与信靠供应中建立生活节奏。",
  ],
  HOPE: [
    "Biblical hope is confident expectation rooted in God's character and promises, not merely a wish that circumstances will improve.",
    "圣经中的盼望是建立在上帝品格与应许上的确信，并不只是希望环境好转的愿望。",
  ],
  CHURCH: [
    "The church is the gathered community of people called by God through Christ, not simply a building used for worship.",
    "教会是上帝借基督呼召并聚集的信徒群体，并不只是用于敬拜的建筑物。",
  ],
  AMEN: [
    "Amen expresses certainty and agreement: “truly,” “let it be so,” or a faithful affirmation of prayer and promise.",
    "阿们表达确信与同意，意思近于“诚然如此”或“愿这事成就”，常用于回应祷告与应许。",
  ],
  CROSS: [
    "The cross was an instrument of Roman execution and became Christianity's central sign because Jesus' crucifixion is proclaimed as God's saving act.",
    "十字架原是罗马处刑工具；因耶稣被钉被宣告为上帝的救赎行动，它成为基督信仰的核心记号。",
  ],
  APOSTLE: [
    "An apostle is one who is sent. In the New Testament the title especially describes witnesses commissioned by Jesus to carry the gospel and serve the church.",
    "使徒就是“受差遣的人”；在新约中尤其指耶稣委派、为福音作见证并服事教会的人。",
  ],
  CHARITY: [
    "Charity is the King James rendering of the Greek word often translated “love,” especially the self-giving love celebrated in 1 Corinthians 13.",
    "Charity 是《钦定版》对希腊语“爱”的一种译法，尤其指《哥林多前书》十三章所颂扬的舍己之爱。",
  ],
  JUSTICE: [
    "Justice is the faithful practice of what is right, giving people their due and protecting the vulnerable in accordance with God's character.",
    "公义是忠实地实行正确之事，按上帝的品格公平待人，并保护弱小者。",
  ],
  MYSTERY: [
    "A mystery in the New Testament is not merely a puzzle; it is a divine purpose once hidden and now made known by revelation.",
    "新约中的奥秘并不只是难题，而是从前隐藏、如今借启示显明的上帝旨意。",
  ],
  HAIR: [
    "Hair appears in ordinary descriptions, vows, mourning customs, and images of age or beauty. Stories such as Samson's also connect it with consecration and strength.",
    "头发在圣经中可见于日常描写、许愿、哀悼以及年岁或美丽的意象；参孙的故事还把它与奉献和力量联系起来。",
  ],
  NILE: [
    "The Nile sustained ancient Egypt and forms the setting for Moses' infancy, Israel's oppression, and the plagues that preceded the Exodus.",
    "尼罗河孕育了古埃及，也是摩西婴孩时期、以色列人受压迫，以及出埃及前诸灾发生的重要背景。",
  ],
  NEGEB: [
    "The Negeb, or Negev, is the dry southern region of the biblical land. Abraham and other patriarchs traveled through this wilderness-edge country.",
    "南地（Negeb／Negev）是圣经之地干旱的南部区域；亚伯拉罕等族长曾在这片接近旷野的地区往来。",
  ],
  SUSA: [
    "Susa, called Shushan in the KJV, was a Persian royal city and the principal setting of Esther's story; Nehemiah also served there.",
    "书珊城（Susa，《钦定版》作 Shushan）是波斯王城，也是以斯帖故事的主要舞台；尼希米也曾在那里任职。",
  ],
  ATHENS: [
    "Athens was a leading Greek city of learning and religion. Paul spoke there about the “unknown God” and the resurrection before the Areopagus.",
    "雅典是希腊重要的学术与宗教城市；保罗曾在亚略巴古向人讲论“未识之神”与复活。",
  ],
};

export function explanationFor(row, existing) {
  // An explanation already in answers.json wins, so hand edits survive a
  // re-import. The curated SPECIAL entries only seed words not yet written.
  if (existing?.en?.trim() && existing?.zh?.trim()) return existing;

  const special = SPECIAL[row.word];
  if (special) return { en: special[0], zh: special[1] };
  throw new Error(
    `Missing reviewed bilingual explanation for ${titleCase(row.word)}. ` +
      "Add it to data/answers.json before importing new answer terms.",
  );
}
