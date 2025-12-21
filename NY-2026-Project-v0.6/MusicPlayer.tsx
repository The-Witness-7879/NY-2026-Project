
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Music, 
  Loader2
} from 'lucide-react';
import { supabase } from './supabase';

interface Track {
  id: number;
  title: string;
  artist: string;
  audio_url: string;
}

const DEFAULT_PLAYLIST: Track[] = [
  { 
    id: 0, 
    title: '离线模式', 
    artist: '请连接数据库', 
    audio_url: 'https://actions.google.com/sounds/v1/science_fiction/robot_code_entry.ogg' 
  },
];

export function MusicPlayer() {
  // 设置初始状态为 true，尝试开启自动播放
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hasUserInteracted = useRef(false);

  const currentTrack = tracks[currentTrackIdx] || DEFAULT_PLAYLIST[0];

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    // 设置初始音量为 50%
    audio.volume = 0.5;

    const handleTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      setProgress(0); // 自动切换时也重置进度
      setCurrentTrackIdx((prev) => (prev + 1) % tracks.length);
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // 自动播放处理：监听用户第一次交互以激活音频
    const onFirstInteraction = () => {
      if (!hasUserInteracted.current) {
        hasUserInteracted.current = true;
        if (isPlaying && audio.paused) {
          audio.play().catch(e => console.debug("Interaction playback failed:", e));
        }
        window.removeEventListener('click', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
        window.removeEventListener('keydown', onFirstInteraction);
      }
    };
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('touchstart', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      audio.pause();
    };
  }, [tracks.length, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (audioRef.current.src !== currentTrack.audio_url) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => {
        // 这里的错误通常是因为浏览器策略拦截了自动播放，不强制重置 UI 状态
        console.debug("Autoplay blocked by browser policy");
      });
    }
    
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // 这里的错误通常是因为浏览器策略拦截了自动播放
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (playerRef.current && !playerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!supabase) return;
    const fetchSongs = async () => {
      setIsLoadingData(true);
      try {
        const { data } = await supabase.from('songs').select('*').order('id', { ascending: true });
        if (data && data.length > 0) setTracks(data as Track[]);
      } catch (err) {} finally { setIsLoadingData(false); }
    };
    fetchSongs();
    const channel = supabase.channel('realtime_music').on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, fetchSongs).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProgress(0); // 立即重置进度条
    setCurrentTrackIdx((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProgress(0); // 立即重置进度条
    setCurrentTrackIdx((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const isCollapsed = isMobile && !isExpanded;

  return (
    <div 
      ref={playerRef}
      onClick={() => isCollapsed && setIsExpanded(true)}
      className={`fixed top-6 left-6 z-[100] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isCollapsed 
          ? 'w-11 h-11 rounded-full bg-white/20 active:scale-90' 
          : 'w-[280px] md:w-[320px] h-[58px] rounded-full bg-white/[0.12] cursor-default'
        }
        backdrop-blur-2xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.4)] overflow-hidden
      `}
    >
      {/* 核心内容容器 */}
      <div className="w-full h-full relative flex items-center">
        
        {/* 图标/播放状态指示器 - 悬浮球状态下绝对居中 */}
        <div className={`transition-all duration-500 ease-in-out flex items-center justify-center
          ${isCollapsed 
            ? 'absolute inset-0 w-full h-full' 
            : 'relative w-9 h-9 ml-3 shrink-0 bg-white/10 border border-white/10 rounded-full shadow-inner'
          }
        `}>
          {isLoadingData ? (
            <Loader2 className={`text-white/40 animate-spin ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          ) : isPlaying ? (
            <div className={`flex items-end gap-[2px] ${isCollapsed ? 'h-4' : 'h-3'}`}>
              <div className="w-[2px] bg-amber-300 animate-[music-bar_0.8s_ease-in-out_infinite]" />
              <div className="w-[2px] bg-amber-300 animate-[music-bar_1.2s_ease-in-out_infinite]" />
              <div className="w-[2px] bg-amber-300 animate-[music-bar_1s_ease-in-out_infinite]" />
            </div>
          ) : (
            <Music className={`transition-all duration-500 ${isCollapsed ? 'w-5 h-5 text-white shadow-sm' : 'w-4 h-4 text-white/40'}`} />
          )}
        </div>

        {/* 文字与控制区 - 展开时才显示内容 */}
        <div className={`flex-1 flex items-center gap-3 px-3 transition-all duration-300 min-w-0
          ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
        `}>
          {/* 文字容器添加 min-w-0 是为了让内部的 truncate 生效 */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white text-[13px] md:text-[14px] font-bold truncate leading-none mb-1">
              {currentTrack.title}
            </h4>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest truncate leading-none">
              {currentTrack.artist}
            </p>
          </div>

          {/* 控制按钮组添加 shrink-0 确保不被挤压 */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button onClick={handlePrev} className="text-white/30 hover:text-white transition-colors p-1 active:scale-75">
              <SkipBack className="w-3 h-3" fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/10 transition-all active:scale-90 shadow-lg"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={handleNext} className="text-white/30 hover:text-white transition-colors p-1 active:scale-75">
              <SkipForward className="w-3 h-3" fill="currentColor" />
            </button>
          </div>
        </div>

        {/* 底部进度条 */}
        <div className={`absolute bottom-0 left-0 w-full px-6 transition-opacity duration-500 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 3px; }
          50% { height: 9px; }
        }
      `}</style>
    </div>
  );
}
