'use client';

import { cn } from '@/lib/utils';
import { ArrowUpIcon } from '@/icons/arrow-up-icon';
import { ArrowDownIcon } from '@/icons/arrow-down-icon';

interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

interface BaseStatCardProps {
  title: string;
  className?: string;
  gradient?: string;
}

interface SingleStatCardProps extends BaseStatCardProps {
  type: 'single';
  currentValue: number;
  previousValue: number;
  change: number;
  period: string;
}

interface MultiStatCardProps extends BaseStatCardProps {
  type: 'multi';
  stats: StatItem[];
}

interface StatItemProps {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  bgColor?: string;
  iconColor?: string;
}

function StatItem({ icon, value, label, bgColor = "bg-gradient-to-br from-blue-50 to-blue-100/50", iconColor = "text-blue-600" }: StatItemProps) {
  return (
    <div className="flex items-center gap-6 group">
      {icon && (
        <div className={`${bgColor} p-2.5 rounded-2xl shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md`}>
          <div className={`w-5 h-5 ${iconColor}`}>
            {icon}
          </div>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-800">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className="text-xs font-medium text-gray-500 tracking-wide transition-colors duration-300 group-hover:text-gray-600">
          {label}
        </span>
      </div>
    </div>
  );
}

export function StatsCard(props: SingleStatCardProps | MultiStatCardProps) {
  const baseClasses = cn(
    "bg-white rounded-3xl border border-[#E5E5E5] shadow-[0_2px_8px_rgba(162,136,247,0.05)] p-6 hover:shadow-[0_4px_12px_rgba(162,136,247,0.1)] transition-all duration-200",
    props.className
  );

  if (props.type === 'single') {
    const { currentValue, previousValue, change, period } = props;
    return (
      <div className={cn(
        "h-[156px] bg-white rounded-3xl border border-[#E5E5E5] shadow-[0_2px_8px_rgba(162,136,247,0.05)] p-6 hover:shadow-[0_4px_12px_rgba(162,136,247,0.1)] transition-all duration-200",
        props.className
      )}>
        <div className="flex flex-col h-full">
          <h2 className="text-[15px] font-semibold text-[#2D2D2D] mb-auto">{props.title}</h2>
          <div>
            <div className="text-[32px] font-bold text-[#2D2D2D] mb-2">
              {currentValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-[#555555]">{previousValue.toLocaleString()} {period}</span>
              <span className={cn(
                "flex items-center",
                change >= 0 ? "text-[#10B981]" : "text-[#F44336]"
              )}>
                {change >= 0 ? (
                  <ArrowUpIcon className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(change)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-[156px] bg-white rounded-3xl border border-[#E5E5E5] shadow-[0_2px_8px_rgba(162,136,247,0.05)] p-6 hover:shadow-[0_4px_12px_rgba(162,136,247,0.1)] transition-all duration-200",
      props.className
    )}>
      <div className="border-b pb-2 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-[15px] font-semibold">{props.title}</h2>
        </div>
      </div>
      <div className="flex justify-between items-start">
        {props.stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}