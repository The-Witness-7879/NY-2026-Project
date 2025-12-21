import React from 'react';
import { Trash2, RefreshCcw, CheckCircle } from 'lucide-react';
import { supabase } from './supabase';
import { PRIZES } from './constants';

interface LotteryAdminProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isDrawn: boolean;
  onForceZero?: () => void;
  onResetZero?: () => void;
}

/**
 * 抽奖管理组件
 * 当前根据需求已将 UI 隐藏，但保留功能逻辑。
 * 若需手动触发，可临时移除 'hidden' 类。
 */
export function LotteryAdmin({ isLoading, setIsLoading, isDrawn, onForceZero, onResetZero }: LotteryAdminProps) {
  const handleDraw = async () => {
    if (!supabase || isLoading || isDrawn) return;
    setIsLoading(true);
    
    onForceZero?.();

    try {
      const { data: pData, error: pError } = await supabase.from('participants').select('user_name');
      if (pError) throw pError;
      
      const currentParticipants = pData?.map(p => p.user_name) || [];
      if (currentParticipants.length === 0) {
        setIsLoading(false);
        return;
      }

      const { data: existingWinners } = await supabase.from('winners').select('id').limit(1);
      if (existingWinners && existingWinners.length > 0) {
        setIsLoading(false);
        return;
      }

      const shuffled = [...currentParticipants].sort(() => 0.5 - Math.random());
      const newWinnerEntries: any[] = [];
      
      PRIZES.forEach((prize, index) => {
        if (shuffled[index]) {
          newWinnerEntries.push({
            prize_level: prize.level,
            user_name: shuffled[index]
          });
        }
      });

      const { error: insError } = await supabase.from('winners').insert(newWinnerEntries);
      if (insError) throw insError;

    } catch (err: any) {
      console.error("开奖过程异常", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!supabase || isLoading) return;
    setIsLoading(true);
    
    onResetZero?.();

    try {
      const { error } = await supabase.from('winners').delete().neq('user_name', 'System_Placeholder_Internal_Never_Match');
      if (error) throw error;
    } catch (err: any) {
      console.error("复位过程异常", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-3 right-3 z-[9999] flex flex-col gap-2 hidden">
      <button 
        onClick={handleDraw} 
        disabled={isLoading || isDrawn}
        className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-lg transition-all ${
          isDrawn 
            ? 'bg-green-500/20 text-green-300 border-green-500/40 cursor-default' 
            : 'bg-white/10 text-white/40 hover:text-white/90 hover:bg-white/20 border-white/20 cursor-pointer'
        } disabled:opacity-50`}
      >
        {isDrawn ? <CheckCircle className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
        {isLoading ? '处理中...' : isDrawn ? '已开奖' : '模拟开奖'}
      </button>
      <button 
        onClick={handleReset} 
        disabled={isLoading}
        className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-white/90 hover:bg-white/20 transition-all bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 shadow-lg cursor-pointer disabled:opacity-50"
      >
        <RefreshCcw className="w-3 h-3" />
        {isLoading ? '重置中...' : '开奖复位'}
      </button>
    </div>
  );
}
