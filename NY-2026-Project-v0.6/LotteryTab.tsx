
import React, { useState, useEffect } from 'react';
import { Clock, Users, PartyPopper, Sparkles } from 'lucide-react';
import { supabase } from './supabase';
import { PRIZES } from './constants';
import { LotteryAdmin } from './LotteryAdmin';

const getDeviceId = () => {
  let id = localStorage.getItem('lottery_device_uuid');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('lottery_device_uuid', id);
  }
  return id;
};

export function LotteryTab() {
  const [participants, setParticipants] = useState<string[]>([]); 
  const [currentName, setCurrentName] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [isDrawn, setIsDrawn] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(() => localStorage.getItem('lottery_reg_id'));
  const [isLoading, setIsLoading] = useState(false);
  const [isForcedZero, setIsForcedZero] = useState(false);

  const isActuallyTimeUp = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const isTimeUp = isForcedZero || isActuallyTimeUp;

  useEffect(() => {
    if (!supabase) return;

    const loadData = async () => {
      try {
        const { data: pData, error: pError } = await supabase.from('participants').select('user_name');
        if (pError) throw pError;
        if (pData) setParticipants(pData.map(p => p.user_name));

        const deviceId = getDeviceId();
        const { data: userData, error: uError } = await supabase
          .from('participants')
          .select('user_name')
          .eq('device_id', deviceId)
          .maybeSingle();
        
        if (userData) {
          setRegisteredId(userData.user_name);
          localStorage.setItem('lottery_reg_id', userData.user_name);
        }

        const { data: wData, error: wError } = await supabase.from('winners').select('prize_level, user_name');
        if (wError) throw wError;
        
        if (wData && wData.length > 0) {
          const winnerMap: Record<string, string> = {};
          wData.forEach(w => { winnerMap[w.prize_level] = w.user_name; });
          setWinners(winnerMap);
          setIsDrawn(true);
        }
      } catch (err: any) {
        console.warn('数据加载异常(可能未连接数据库):', err.message || err);
      }
    };
    loadData();

    const channel = supabase.channel('lottery_global_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants' }, (payload) => {
        const newName = payload.new.user_name;
        setParticipants(prev => (prev.includes(newName) ? prev : [...prev, newName]));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'winners' }, (payload) => {
        setWinners(prev => ({ ...prev, [payload.new.prize_level]: payload.new.user_name }));
        setIsDrawn(true);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'winners' }, () => {
        setWinners({});
        setIsDrawn(false);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('实时抽奖数据连接失败');
        }
      });

    const targetDate = new Date('2026-01-01T00:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = currentName.trim();
    if (!name || isLoading || isTimeUp) return;

    if (supabase) {
      setIsLoading(true);
      const deviceId = getDeviceId();
      try {
        const { error } = await supabase.from('participants').insert([{ 
          user_name: name,
          device_id: deviceId 
        }]);

        if (error) {
          if (error.code === '23505') {
            setRegisteredId(name);
            localStorage.setItem('lottery_reg_id', name);
          } else {
            console.error('报名失败:', error.message);
            alert('报名失败，请稍后重试');
          }
        } else {
          setRegisteredId(name);
          localStorage.setItem('lottery_reg_id', name);
          setCurrentName('');
        }
      } catch (err) {
        console.error('报名异常:', err);
        alert('网络连接错误');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="px-4 pb-20 max-w-4xl mx-auto space-y-8">
      <div className="bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden group">
         <div className="relative z-10">
           <h3 className="text-xl text-white/80 font-bold mb-6 flex items-center justify-center gap-2">
             {isTimeUp ? (
               <span className="flex items-center gap-2 text-yellow-300 animate-bounce">
                 <Sparkles className="w-6 h-6" />
                 2026 新年快乐！进化开启！
               </span>
             ) : (
               <>
                 <Clock className="w-5 h-5 text-yellow-300 animate-pulse" />
                 距离2026年开奖截止还有
               </>
             )}
           </h3>
           <div className="grid grid-cols-4 gap-2 md:gap-8 max-w-lg mx-auto">
             {[
               { val: isTimeUp ? 0 : timeLeft.days, label: '天' },
               { val: isTimeUp ? 0 : timeLeft.hours, label: '时' },
               { val: isTimeUp ? 0 : timeLeft.minutes, label: '分' },
               { val: isTimeUp ? 0 : timeLeft.seconds, label: '秒' }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center">
                 <div className={`text-3xl md:text-5xl font-black rounded-xl w-full py-4 backdrop-blur-sm border-t shadow-lg transition-all duration-1000 ${isTimeUp ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/40' : 'text-white bg-white/10 border-white/20'}`}>
                   {String(item.val).padStart(2, '0')}
                 </div>
                 <span className="text-sm mt-2 text-white/60">{item.label}</span>
               </div>
             ))}
           </div>
         </div>
         <LotteryAdmin 
           isLoading={isLoading} 
           setIsLoading={setIsLoading} 
           isDrawn={isDrawn} 
           onForceZero={() => setIsForcedZero(true)}
           onResetZero={() => setIsForcedZero(false)}
         />
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[320px]">
          <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/10">
            {isDrawn ? (
              <div className="animate-fade-in scale-110">
                <div className="inline-flex p-4 bg-yellow-400/20 rounded-full mb-4">
                  <PartyPopper className="text-yellow-400 w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black text-yellow-300 mb-2">开奖结果已揭晓</h4>
                <p className="text-white/80">恭喜各位中奖的群友，祝大家新的一年声生不息！</p>
              </div>
            ) : isTimeUp ? (
              <div className="animate-fade-in">
                <h4 className="text-2xl font-black text-white/90 mb-2">报名已截止</h4>
                <p className="text-white/60">跨年钟声已响，请等待主持人揭晓锦鲤...</p>
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : registeredId ? (
              <div className="animate-fade-in">
                 <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
                   <PartyPopper className="text-green-400 w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-black text-white mb-2">您已成功参与</h4>
                 <p className="text-white/60"> <span className="text-yellow-300 font-bold">{registeredId}</span></p>
                 <p className="text-xs text-white/40 mt-2 italic">请保持在线，锦鲤可能就是你！</p>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <h4 className="font-bold text-2xl text-white mb-2">参与2026跨年抽奖</h4>
                <p className="text-sm text-white/60 mb-8">输入您的QQ号或昵称，锁定您的跨年好运</p>
                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={currentName}
                    onChange={e => setCurrentName(e.target.value)}
                    placeholder="请输入QQ号或昵称…"
                    className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-lg text-center"
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !currentName.trim()}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-[1.02] active:scale-[0.98] text-yellow-900 font-black px-8 py-4 rounded-2xl shadow-xl transition-all text-lg disabled:opacity-50"
                  >
                    {isLoading ? '处理中...' : '立即参与'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="w-full md:w-64 bg-black/20 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 shrink-0">
               <Users className="w-5 h-5 text-blue-300" />
               <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest">参与名单 ({participants.length})</h4>
            </div>
            <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
               <div className="flex flex-col gap-2">
                 {participants.map((name, idx) => (
                   <div key={idx} className="px-3 py-2 bg-white/5 rounded-xl text-sm text-white/70 border border-white/5 animate-fade-in hover:bg-white/10 transition-colors">
                     {name}
                   </div>
                 ))}
                 {participants.length === 0 && (
                   <div className="text-white/30 italic text-xs text-center py-4">等待首位参与者...</div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-2xl font-black text-white text-center drop-shadow-md mb-6">
            2026 年度奖项
         </h3>
         <div className="grid grid-cols-1 gap-4">
           {PRIZES.map((prize, idx) => (
             <div key={idx} className={`relative overflow-hidden rounded-2xl ${prize.style} shadow-lg transition-all ${isDrawn && winners[prize.level] ? 'ring-[1px] ring-yellow-400/30 scale-[1.01]' : ''}`}>
                <div className="bg-white/5 backdrop-blur-[2px] p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
                   <div className="shrink-0 p-4 bg-white/10 rounded-full shadow-inner border border-white/5">
                     {prize.icon}
                   </div>
                   <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                       <h4 className="text-xl font-bold text-white tracking-tight">{prize.level}</h4>
                       <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full text-white/90 font-bold uppercase tracking-tighter">{prize.name}</span>
                     </div>
                     <p className="text-sm text-white/70 font-medium">{prize.desc}</p>
                   </div>
                   <div className="w-full md:w-48 bg-black/20 rounded-xl p-4 flex flex-col items-center justify-center min-h-[100px] border border-white/5 shadow-inner">
                      {isDrawn && winners[prize.level] ? (
                        <div className="animate-bounce text-center">
                           <div className="text-[10px] text-yellow-300/60 mb-1 uppercase tracking-widest font-black">WINNER</div>
                           <div className="text-2xl font-black text-yellow-200 drop-shadow-sm">{winners[prize.level]}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-white/30 italic text-center px-4 leading-relaxed font-medium">
                          {isTimeUp ? '揭晓中...' : '等待开奖'}
                        </div>
                      )}
                   </div>
                </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
