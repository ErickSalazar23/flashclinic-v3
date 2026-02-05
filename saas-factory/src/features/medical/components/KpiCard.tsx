import React, { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string | ReactNode;
  change?: number | {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'red' | 'green' | 'orange';
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, change, color = 'blue' }) => {
  const colorMap = {
    blue: {
      gradient: 'from-blue-400 to-blue-600',
      border: 'border-blue-500/30',
      shadow: 'shadow-blue-500/20',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    red: {
      gradient: 'from-red-400 to-red-600',
      border: 'border-red-500/30',
      shadow: 'shadow-red-500/20',
      text: 'text-red-400',
      bg: 'bg-red-500/10'
    },
    green: {
      gradient: 'from-emerald-400 to-emerald-600',
      border: 'border-emerald-500/30',
      shadow: 'shadow-emerald-500/20',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    orange: {
      gradient: 'from-amber-400 to-amber-600',
      border: 'border-amber-500/30',
      shadow: 'shadow-amber-500/20',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
  };

  const colors = colorMap[color];

  // Handle change prop - can be number or object
  let changeDisplay: { value: string; isPositive: boolean } | null = null;
  if (typeof change === 'number') {
    changeDisplay = {
      value: `${Math.abs(change)}%`,
      isPositive: change >= 0
    };
  } else if (change) {
    changeDisplay = change;
  }

  return (
    <div className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          {typeof icon === 'string' ? (
            <span className="text-xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className={`text-3xl font-bold tracking-tight bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}>
          {value}
        </h3>

        {changeDisplay && (
          <div className={`flex items-center gap-1 text-sm font-medium ${changeDisplay.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{changeDisplay.isPositive ? '↑' : '↓'}</span>
            <span>{changeDisplay.value} vs mes pasado</span>
          </div>
        )}
      </div>

      {/* Decorative accent */}
      <div className={`absolute -bottom-1 -right-1 h-12 w-12 rounded-full blur-2xl opacity-20 ${colors.bg}`} />
    </div>
  );
};
