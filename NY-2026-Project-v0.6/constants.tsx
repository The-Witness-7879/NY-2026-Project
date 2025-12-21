import React from 'react';
import { 
  Sparkles, Repeat, Brain, Swords, Megaphone, Dices, Flame, PartyPopper,
  Crown, Music, Gift, Headphones
} from 'lucide-react';

export const MEMBERS = [
  // avatar 字段：请填入从 Supabase Storage 获取的图片公开链接。如果留空或为 null，将自动显示名字首字。
  { 
    id: 1, 
    name: '闻子路', 
    role: '群主', 
    desc: '千山万水终究过，最难越过原是我', 
    color: 'bg-purple-500',
    avatar: 'https://ezadrlmlnocyqztyavqd.supabase.co/storage/v1/object/public/profile%20photo/TheWitness.jpg'
  },
  { 
    id: 2, 
    name: '咩咩', 
    role: '吉祥物', 
    desc: '文字在被理解之前，先是记录的工具', 
    color: 'bg-blue-500',
    avatar: 'https://ezadrlmlnocyqztyavqd.supabase.co/storage/v1/object/public/profile%20photo/baa.png'
  },
  { 
    id: 3, 
    name: '猫猫', 
    role: '情感大师', 
    desc: '阴间作息阳间人，夜里精神昼犯浑', 
    color: 'bg-pink-500',
    avatar: 'https://ezadrlmlnocyqztyavqd.supabase.co/storage/v1/object/public/profile%20photo/Cat.jpg'
  },
  { 
    id: 4, 
    name: '苹果鬼', 
    role: '天才美少女', 
    desc: 'One loves the sunset, when one is so bad.', 
    color: 'bg-orange-500',
    avatar: 'https://ezadrlmlnocyqztyavqd.supabase.co/storage/v1/object/public/profile%20photo/Apple%20Ghost.jpg'
  },
];

export const NEW_ACTIVITIES = [
  { 
    time: '19:00 - 19:30', 
    title: '绝凶启幕：声生不息！', 
    icon: <Sparkles className="w-6 h-6" />, 
    desc: '由群主和管理员牵头，总结过去，展望未来，预热完毕即可正式开启跨年狂欢夜！',
    award: null
  },
  { 
    time: '19:30 - 20:00', 
    title: '第一弹：唱歌接龙', 
    icon: <Repeat className="w-6 h-6" />, 
    desc: '所有群员均可参与，最先发出有效语音条的视为接龙成功。每次接龙失败就开启新一轮接歌，最后接歌成功次数最多者获胜。',
    award: '接龙王',
    winnerName: '虚位以待...',
    winnerAvatar: null
  },
  { 
    time: '20:00 - 21:00', 
    title: '第二弹：猜歌名', 
    icon: <Brain className="w-6 h-6" />, 
    desc: '一位群员出题，其余群员根据题目猜歌名。出题形式包括但不限于文字描述、语音、画图和行为艺术等。时间结束时，猜对次数最多者获胜。',
    award: '读心王',
    winnerName: '虚位以待...',
    winnerAvatar: null
  },
  { 
    time: '21:00 - 21:30', 
    title: '第三弹：歌王擂台', 
    icon: <Swords className="w-6 h-6" />, 
    desc: '由群主率先发语音设擂，任意群员都可以发起挑战（最先发出前3条有效语音视为挑战者），其余群员作为评委根据其表现（无标准，唱功优秀或搞笑异常都可以）打分。得分最高者成为新擂主，接受接下来的攻擂。时间结束时，仍站在擂台上的群友获胜。',
    award: '擂歌王',
    winnerName: '虚位以待...',
    winnerAvatar: null
  },
  { 
    time: '21:30 - 22:00', 
    title: '第四弹：乡音难改', 
    icon: <Megaphone className="w-6 h-6" />,
    desc: '用方言演唱或朗读指定片段，能让大家听懂或猜对者得分。最具喜感或最标准的方言展示将获得特别奖励。',
    award: '乡音王',
    winnerName: '虚位以待...',
    winnerAvatar: null
  },
  {
    time: '22:00 - 23:00',
    title: '第五弹：游戏派对',
    icon: <Dices className="w-6 h-6" />,
    desc: '谁是卧底、你画我猜、海龟汤... 各种多人在线小游戏轮番上阵，智力与默契的双重考验。',
    award: '游戏王',
    winnerName: '虚位以待...',
    winnerAvatar: null
  },
  {
    time: '23:00 - 23:55',
    title: '第六弹：自由麦序',
    icon: <Headphones className="w-6 h-6" />,
    desc: '把麦克风交给每一个人！想唱就唱，想说就说，分享你的2025故事，许下你的2026愿望。',
    award: null
  },
  {
    time: '23:55 - 00:05',
    title: '跨年倒计时',
    icon: <PartyPopper className="w-6 h-6" />,
    desc: '所有人一起倒数，迎接2026年的到来！零点时刻将抽取终极大奖！',
    award: '年度锦鲤',
    winnerName: '虚位以待...',
    winnerAvatar: null
  }
];

export const PRIZES = [
  { 
    level: '特等奖', 
    count: 1, 
    name: '2026年度锦鲤·欧气满满！', 
    desc: '全场唯一的幸运儿，QQSVIP年卡+88元现金红包+2026锦鲤头衔！',
    icon: <Crown className="w-8 h-8 text-yellow-200" />,
    style: 'bg-gradient-to-br from-red-600 to-red-800 border-yellow-400/40 border'
  },
  { 
    level: '一等奖', 
    count: 1, 
    name: '漫步者Zero Buds无线蓝牙耳机', 
    desc: '让进入你耳朵的声音更上一层楼',
    icon: <Headphones className="w-6 h-6 text-white" />,
    style: 'bg-gradient-to-br from-purple-600 to-indigo-700 border border-white/5'
  },
  { 
    level: '二等奖', 
    count: 1, 
    name: '冬日暖心零食大礼包', 
    desc: '学习休闲听歌追剧打游戏必备',
    icon: <Gift className="w-6 h-6 text-white" />,
    style: 'bg-gradient-to-br from-blue-500 to-cyan-600 border border-white/5'
  },
  { 
    level: '三等奖', 
    count: 1, 
    name: 'QQ音乐/网易云3个月SVIP', 
    desc: '突破版权障碍，助力畅听无阻',
    icon: <Music className="w-6 h-6 text-white" />,
    style: 'bg-gradient-to-br from-emerald-500 to-teal-600 border border-white/5'
  },
];