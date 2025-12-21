import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Send, Heart } from 'lucide-react';
import { supabase } from './supabase';

interface MessageRecord {
  id: string | number;
  text: string;
}

interface BarrageItem extends MessageRecord {
  top: number;
  left: number;
  color: string;
  size: 'sm' | 'md' | 'lg';
  driftDelay: number;
  duration: number; 
  zIndex: number;
  rotate: number;
  driftSpeed: number;
  gridIdx: number;
}

const BUBBLE_STYLES = [
  { bg: 'from-blue-600 to-blue-800 border-blue-400', text: 'text-white' },
  { bg: 'from-purple-600 to-purple-800 border-purple-400', text: 'text-white' },
  { bg: 'from-indigo-600 to-indigo-800 border-indigo-400', text: 'text-white' },
  { bg: 'from-yellow-400 to-amber-500 border-yellow-200', text: 'text-amber-950' },
  { bg: 'from-orange-400 to-red-500 border-orange-200', text: 'text-orange-950' },
  { bg: 'from-lime-400 to-green-500 border-lime-200', text: 'text-green-950' },
  { bg: 'from-pink-500 to-rose-600 border-pink-300', text: 'text-white' },
  { bg: 'from-fuchsia-600 to-purple-700 border-fuchsia-400', text: 'text-white' },
  { bg: 'from-cyan-500 to-teal-600 border-cyan-300', text: 'text-white' },
  { bg: 'from-emerald-500 to-teal-700 border-emerald-300', text: 'text-white' },
  { bg: 'from-violet-600 to-fuchsia-800 border-violet-400', text: 'text-white' }
];

const COLS = 11;
const ROWS = 9;
const L_START = 20; 
const L_END = 80;   
const T_START = 15; 
const T_END = 82; // 稍微增加一点底部触达，使气泡分布更匀称

interface GridZone {
  t: number;
  l: number;
  row: number;
  col: number;
}

const GRID_ZONES: GridZone[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    GRID_ZONES.push({ 
      t: T_START + r * ((T_END - T_START) / (ROWS - 1 || 1)), 
      l: L_START + c * ((L_END - L_START) / (COLS - 1 || 1)),
      row: r,
      col: c
    });
  }
}

export function ChatRoom() {
  const [inputValue, setInputValue] = useState('');
  const [activeBarrages, setActiveBarrages] = useState<BarrageItem[]>([]);
  const [isCooldown, setIsCooldown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const messagePool = useRef<MessageRecord[]>([]);
  const busyZones = useRef<Set<number>>(new Set());
  
  const MAX_ACTIVE_BUBBLES = 12;

  const calculateSafePosition = (baseL: number, baseT: number) => {
    const safeL = Math.max(L_START + 1, Math.min(baseL, L_END - 1));
    const safeT = Math.max(T_START + 1, Math.min(baseT, T_END - 1));
    return { l: safeL, t: safeT };
  };

  const markZones = (centerIdx: number, status: 'busy' | 'free') => {
    const zone = GRID_ZONES[centerIdx];
    for (let r = zone.row - 1; r <= zone.row + 1; r++) {
      for (let c = zone.col - 1; c <= zone.col + 1; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          const idx = r * COLS + c;
          if (status === 'busy') busyZones.current.add(idx);
          else busyZones.current.delete(idx);
        }
      }
    }
  };

  const spawnBubble = useCallback((msg: MessageRecord) => {
    if (!msg.text) return;

    if (activeBarrages.some(b => b.id === msg.id)) return;
    if (activeBarrages.length >= MAX_ACTIVE_BUBBLES) return;

    const availableIndices = GRID_ZONES.map((_, i) => i)
      .filter(i => !busyZones.current.has(i))
      .sort(() => Math.random() - 0.5);
    
    if (availableIndices.length === 0) return;

    let bestIdx = -1;
    let finalPos = { l: 0, t: 0 };

    for (const idx of availableIndices) {
      const zone = GRID_ZONES[idx];
      const { l, t } = calculateSafePosition(
        zone.l + (Math.random() - 0.5) * 3,
        zone.t + (Math.random() - 0.5) * 3
      );

      const isConflict = activeBarrages.some(b => {
        const dx = l - b.left;
        const dy = (t - b.top) * 3.0; 
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 18;
      });

      if (!isConflict) {
        bestIdx = idx;
        finalPos = { l, t };
        break;
      }
    }

    if (bestIdx === -1) return;

    markZones(bestIdx, 'busy');

    const style = BUBBLE_STYLES[Math.floor(Math.random() * BUBBLE_STYLES.length)];
    const size = Math.random() > 0.85 ? 'lg' : (Math.random() > 0.5 ? 'md' : 'sm');
    
    const duration = 8000 + Math.random() * 5000;
    
    const newBubble: BarrageItem = {
      id: msg.id,
      text: msg.text, // 还原：移除 .slice(0, 15)
      top: finalPos.t, 
      left: finalPos.l, 
      color: `${style.bg} ${style.text}`, 
      size, 
      driftDelay: Math.random() * 1.5,
      duration, 
      zIndex: 50 + bestIdx, 
      rotate: (Math.random() - 0.5) * 4, 
      driftSpeed: 8 + Math.random() * 4,
      gridIdx: bestIdx
    };

    setActiveBarrages(prev => [...prev, newBubble]);

    setTimeout(() => {
      setActiveBarrages(current => current.filter(b => b.id !== msg.id));
      const cooldown = 500 + Math.random() * 1500;
      setTimeout(() => markZones(bestIdx, 'free'), cooldown);
    }, duration);
  }, [activeBarrages]);

  useEffect(() => {
    let nextTimeout: number;
    const loop = () => {
      if (messagePool.current.length > 0) {
        const activeIds = new Set(activeBarrages.map(b => b.id));
        const availablePool = messagePool.current.filter(m => !activeIds.has(m.id));
        
        if (availablePool.length > 0) {
          const randomMsg = availablePool[Math.floor(Math.random() * availablePool.length)];
          spawnBubble(randomMsg);
        }
      }
      nextTimeout = window.setTimeout(loop, 1500 + Math.random() * 4000);
    };
    loop();
    return () => clearTimeout(nextTimeout);
  }, [activeBarrages, spawnBubble]);

  useEffect(() => {
    const defaultMessages = [
      { id: 'sys-1', text: '欢迎来到许愿墙！' },
      { id: 'sys-2', text: '2026声生不息！' },
      { id: 'sys-3', text: '在这里留下你的祝福~' }
    ];
    messagePool.current = [...defaultMessages];

    if (!supabase) return;
    
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase.from('messages').select('id, text').order('created_at', { ascending: false }).limit(30);
        if (error) {
          console.warn("历史弹幕加载失败:", error.message);
        } else if (data && data.length > 0) {
          messagePool.current = [...data.map(m => ({ id: m.id, text: m.text })), ...defaultMessages];
        }
      } catch (err) {
         console.warn("网络请求异常，切换至离线模式");
      }
    };
    fetchHistory();

    const channel = supabase.channel('realtime_barrage')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg: MessageRecord = { id: payload.new.id, text: payload.new.text };
        if (!messagePool.current.some(m => m.id === newMsg.id)) {
          messagePool.current = [newMsg, ...messagePool.current].slice(0, 50);
        }
        spawnBubble(newMsg);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log("实时连接不可用");
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [spawnBubble]);

  const handleSend = async () => {
    if (!inputValue.trim() || isCooldown) return;
    const text = inputValue.trim();
    setInputValue('');
    
    setIsCooldown(true);
    setTimeout(() => {
      setIsCooldown(false);
    }, 1000);

    const mockMsg = { id: `local-${Date.now()}`, text };
    messagePool.current = [mockMsg, ...messagePool.current];
    spawnBubble(mockMsg);

    if (supabase) {
      try {
        const { error } = await supabase.from('messages').insert([{ user_name: '匿名', text: text, avatar_color: 'bg-slate-500' }]);
        if (error) {
           console.warn("发送到服务器失败:", error.message);
        }
      } catch (err) {
        console.warn("发送请求异常");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-400/5 to-transparent backdrop-blur-3xl rounded-[3.5rem] border border-amber-200/20 shadow-[0_0_60px_rgba(251,191,36,0.1)] mx-4 flex flex-col h-[620px] relative overflow-hidden group/container transition-all">
      <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none z-10" />
      <div className="absolute top-8 left-0 w-full flex justify-center pointer-events-none z-30 opacity-20">
        <div className="px-6 py-1.5 bg-white/5 border border-white/5 rounded-full flex items-center gap-2">
          <Heart className="w-3 h-3 text-rose-400" />
          <span className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-black italic">Evolution Wishing Wall</span>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 relative w-full overflow-hidden mt-6 mb-26 md:mb-32" style={{ contain: 'paint' }}>
        <div 
          className="absolute pointer-events-none z-0"
          style={{
            left: `${L_START}%`,
            top: `${T_START}%`,
            width: `${L_END - L_START}%`,
            height: `${T_END - T_START}%`,
          }}
        />

        {activeBarrages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000">
            <p className="text-white/10 text-sm font-bold tracking-widest uppercase italic">等待弹幕输入...</p>
          </div>
        )}
        {activeBarrages.map((barrage) => (
          <div key={barrage.id} className="barrage-bubble absolute pointer-events-none transition-all duration-1000"
            style={{ 
              top: `${barrage.top}%`, 
              left: `${barrage.left}%`, 
              zIndex: barrage.zIndex, 
              width: 'max-content', 
              maxWidth: '85vw', // 还原：扩大最大宽度限制，防止挤压
              animationDuration: `${barrage.duration}ms` 
            }}>
            <div className={`bubble-inner-drift px-4 py-3 rounded-[2.5rem] border font-black transition-all duration-700 bg-gradient-to-br shadow-lg ${barrage.color} ${barrage.size === 'lg' ? 'text-lg px-8 py-4 border-opacity-60 scale-105 opacity-100' : (barrage.size === 'md' ? 'text-base px-6 py-3 border-opacity-40 opacity-95' : 'text-xs px-5 py-2.5 border-opacity-30 opacity-90')}`}
              style={{ 
                animationDelay: `${barrage.driftDelay}s`, 
                animationDuration: `${barrage.driftSpeed}s`,
                transform: `rotate(${barrage.rotate}deg)`
              }}>
              <span className="drop-shadow-sm tracking-wide block text-center whitespace-normal break-all">{barrage.text}</span> { /* 还原：移除 truncate 和 max-w-160 */ }
              {barrage.size === 'lg' && <div className="absolute -right-1.5 -top-1.5 opacity-80"><Sparkles className="w-4.5 h-4.5 text-yellow-300 animate-pulse" /></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 md:bottom-12 left-0 w-full z-40 px-3 md:px-20">
        <div className="relative group max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white/[0.06] hover:bg-white/[0.1] focus-within:bg-white/[0.14] border border-white/10 focus-within:border-white/30 rounded-full p-1 md:p-1.5 backdrop-blur-[60px] transition-all duration-500 shadow-xl">
            <input 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} 
              placeholder={supabase ? "输入新年祝福弹幕..." : "配置缺失"} // 修改：更新占位符
              className="flex-1 bg-transparent border-none px-4 py-3 md:px-7 md:py-4 text-white placeholder-white/20 focus:outline-none text-sm md:text-lg font-bold min-w-0" 
              maxLength={40} // 稍微放开一点字数限制以适应“全部展示”
            />
            <button 
              type="button" 
              onClick={handleSend}
              disabled={!inputValue.trim() || isCooldown} 
              className="group/btn flex items-center gap-1.5 md:gap-2 bg-gradient-to-br from-yellow-400 to-orange-500 hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 text-orange-950 font-black px-5 py-2.5 md:px-12 md:py-4 rounded-full shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all shrink-0"
            >
              <span className="text-base md:text-xl tracking-tighter whitespace-nowrap">
                {isCooldown ? '装填中...' : '弹幕发射'}
              </span>
              {!isCooldown && <Send className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}