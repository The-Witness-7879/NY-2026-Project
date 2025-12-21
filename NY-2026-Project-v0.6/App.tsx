
import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Users, Calendar, Gift, Snowflake, Trophy, Star,
  Timer, BellRing, Quote, Mic2, Clock
} from 'lucide-react';

// 导入模块化组件和配置
import { MEMBERS, NEW_ACTIVITIES } from './constants';
import { ChatRoom } from './ChatRoom';
import { LotteryTab } from './LotteryTab';
import { MusicPlayer } from './MusicPlayer';
import { CelebrationEffects, CelebrationHandle } from './CelebrationEffects';

// --- Types ---
type Tab = 'group' | 'activity' | 'lottery';

// --- Layout Components ---

function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
      <div 
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2.5px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-300/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
      <div className="absolute top-[5%] right-[2%] text-white/5 -rotate-12 transform scale-150">
        <Music size={300} strokeWidth={1} />
      </div>
      <div className="absolute bottom-[10%] left-[-5%] text-white/5 rotate-12 transform scale-125">
        <Mic2 size={250} strokeWidth={1} />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="relative w-full py-12 px-4 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/20 to-transparent blur-3xl -z-10"></div>
      <div className="animate-float inline-block mb-4">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white font-medium shadow-sm">
          <Music className="w-4 h-4" />
          绝凶の24h丶音趴群 绝赞呈现
        </span>
      </div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
          绝凶の进化论
        </span>
      </h1>
      <h2 className="text-3xl md:text-5xl font-bold text-yellow-300 mt-2 drop-shadow-md flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-yellow-300/50 hidden md:block"></span>
        2026 声生不息!
        <span className="h-px w-8 bg-yellow-300/50 hidden md:block"></span>
      </h2>
      <div className="mt-8 flex justify-center gap-4 text-sm text-white/90 font-medium">
        <div className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full">
          <Calendar className="w-4 h-4" /> 2025.12.31
        </div>
        <div className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full">
          <Timer className="w-4 h-4" /> 19:00-00:00
        </div>
      </div>
    </header>
  );
}

function TabNavigation({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'group', label: '活动背景', icon: <Users className="w-4 h-4" /> },
    { id: 'activity', label: '精彩流程', icon: <Calendar className="w-4 h-4" /> },
    { id: 'lottery', label: '欧气抽奖', icon: <Gift className="w-4 h-4" /> },
  ];

  return (
    <div className="flex justify-center w-full px-4 mb-8">
      <div className="flex gap-1 md:gap-2 p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap text-sm md:text-base
              ${activeTab === tab.id 
                ? 'bg-white text-blue-900 shadow-md' 
                : 'text-white/70 hover:text-white hover:bg-white/10'}
            `}
          >
            <span className="shrink-0">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GroupTab() {
  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl mx-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Music className="w-24 h-24 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <BellRing className="w-6 h-6 text-yellow-300 animate-pulse" />
          活动介绍
        </h3>
        <p className="text-white/90 leading-relaxed text-lg font-medium relative z-10">
          2025年跨年盛况尚且历历在目，而今不知而又一年过去了。在这一年当中，我们经历许多，有欢声笑语，有无声沉默，有新人加入，也有老朋友的退出……
          时间在一步一步向前走，不论是好是坏，唯有变化是永恒的。
          <br/><br/>
          又一次抵近年关，在<span className="font-bold text-yellow-300">“咩咩”</span>的提议下，也是应广大群友要求，特别策划本次跨年迎新活动：
          <br/>
          <span className="font-bold text-yellow-300">“绝凶の进化论 2026声生不息！”</span> 
          ，一场专属于我们的跨年音乐狂欢！
          <br/><br/>
          面对即将到来的辞旧迎新的时刻，我们不比拼技巧、不执着于输赢，只在这<span className="font-bold text-yellow-300">“进化”</span>的旋律中寻找共鸣。
          从经典老歌到即兴Freestyle，从唱歌接龙到各种特色小游戏，从深情独唱到全员大合唱，
          每一个音符都是我们向2026年发出的最强音！
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl mx-4">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Snowflake className="w-6 h-6 text-white" />
          关于我们
        </h3>
        <p className="text-white/90 leading-relaxed text-lg font-medium">
          <span className="font-bold text-yellow-300">“绝凶制24h丶音趴群”</span>（群号：<span className="font-bold text-yellow-300">959592984</span>）
          是一个歌友交流平台，创始之初志在为诸音趴志士们提供一个包含各类话题，
          更重要的是可以彻夜不息、纵情高歌的绝凶音趴根据地。希望各位能够开开心心的展露歌喉，和和气气与群友交流，让我们一起携手，
          打造一个不论未来多么纷繁辛苦，都能随时随地缩回来，供您休憩片刻恢复元气的、小小的音趴乌托邦吧！OvQ~
        </p>
      </div>

      <div className="px-4">
        <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-yellow-300 shadow-sm">
          核心成员
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MEMBERS.map((member) => (
            <div key={member.id} className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-4 shadow-md h-full min-h-[140px]">
              <div className="absolute inset-y-0 right-0 w-32 pointer-events-none">
                <div className="absolute top-[-20%] right-12 h-[140%] w-2 bg-yellow-300/40 -skew-x-[25deg] group-hover:bg-yellow-300/60 transition-colors duration-300"></div>
                <div className="absolute top-[-20%] right-5 h-[140%] w-4 bg-yellow-300/40 -skew-x-[25deg] group-hover:bg-yellow-300/60 transition-colors duration-300"></div>
              </div>
              <div className={`relative z-10 w-16 h-16 rounded-full overflow-hidden shadow-lg ${member.color} shrink-0 flex items-center justify-center border-2 border-white/10`}>
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-xl font-bold text-white">{member.name[0]}</span>
                )}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <h4 className="font-black text-2xl tracking-tight drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500">
                    {member.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-bold text-white/90 border border-white/10 backdrop-blur-sm shadow-sm whitespace-nowrap">
                    {member.role}
                  </span>
                </div>
                <div className="flex items-start gap-2 mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Quote className="w-5 h-5 text-yellow-300 fill-yellow-300/20 shrink-0 mt-0.5 transform" />
                  <p className="text-lg text-white/90 leading-snug font-medium">
                    {member.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="px-4 mb-6">
          <h3 className="text-xl font-bold text-white pl-2 border-l-4 border-yellow-300 shadow-sm">
            新年祝福
          </h3>
        </div>
        <ChatRoom />
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="px-4 pb-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md">
          ❄️ - 绝凶 caravan - ❄️
        </h3>
        <p className="text-white/60">2025.12.31 19:00 - 2026.01.01 00:00 进化不停</p>
      </div>

      <div className="space-y-12 md:space-y-6 relative">
        <div className="absolute left-1/2 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-300/50 via-white/20 to-transparent block" />

        {NEW_ACTIVITIES.map((activity, idx) => (
          <div key={idx} className={`relative flex flex-col md:flex-row gap-6 md:gap-8 items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
            
            <div className="relative md:absolute md:left-1/2 w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center md:-translate-x-1/2 z-20 transition-transform hover:scale-110 shrink-0">
              <div className="text-white">{activity.icon}</div>
            </div>

            <div className={`w-full md:w-[calc(50%-3rem)] bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-lg hover:border-yellow-300/40 transition-all group overflow-hidden relative z-10`}>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/5 blur-[50px] group-hover:bg-yellow-300/10 transition-all" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-yellow-300 text-blue-900 text-xs font-black rounded-full shadow-sm">
                  {activity.time}
                </span>
                {activity.award && (
                   <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs">
                     <Trophy className="w-3 h-3" />
                     {activity.award}
                   </div>
                )}
              </div>
              
              <h4 className="text-xl font-black text-white mb-3 group-hover:text-yellow-300 transition-colors">
                {activity.title}
              </h4>
              
              <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
                {activity.desc}
              </p>

              {activity.award && (
                <div className="mt-4 pt-4 border-t border-white/10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group/winner">
                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-transparent opacity-0 group-hover/winner:opacity-100 transition-opacity" />
                            {(activity as any).winnerAvatar ? (
                               <img src={(activity as any).winnerAvatar} alt="Winner" className="w-full h-full object-cover" />
                            ) : (
                               <Users className="w-5 h-5 text-white/20" />
                            )}
                         </div>
                         <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">本届{activity.award}</div>
                            <div className="text-sm font-bold text-white/90">{(activity as any).winnerName || '虚位以待...'}</div>
                         </div>
                      </div>
                      <div className="text-xs text-yellow-300/50 italic flex items-center gap-1">
                        <Star className="w-3 h-3 animate-spin-slow" />
                        即将揭晓
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-3xl border border-white/20 text-center backdrop-blur-md">
        <h4 className="text-xl font-bold text-white mb-2">温馨提示</h4>
        <p className="text-white/60 text-sm">活动具体时长可能根据现场活跃程度稍作微调，请大家保持在线、积极参与，不错过每一份精彩！</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('group');
  const celebrationRef = useRef<CelebrationHandle>(null);

  // 每次切换标签到 lottery 时触发礼花
  useEffect(() => {
    if (activeTab === 'lottery') {
      celebrationRef.current?.burst();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-sans selection:bg-yellow-300 selection:text-blue-900 pb-12 transition-colors duration-700 ease-in-out relative">
       <BackgroundDecoration />
       <CelebrationEffects ref={celebrationRef} />
       <MusicPlayer />
       <div className="relative z-10">
         <Header />
         <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
         <main className="container mx-auto max-w-4xl min-h-[500px]">
           {activeTab === 'group' && <GroupTab />}
           {activeTab === 'activity' && <ActivityTab />}
           {activeTab === 'lottery' && <LotteryTab />}
         </main>
       </div>
    </div>
  );
}
