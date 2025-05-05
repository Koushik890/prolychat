'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartData,
  ChartOptions,
  ScriptableContext,
  Chart,
} from 'chart.js';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryAutomations } from '@/hooks/user-queries';
import { useQuery } from '@tanstack/react-query';
import { 
  format, 
  startOfWeek, 
  startOfMonth, 
  startOfDay, 
  isSameDay, 
  isAfter, 
  isBefore, 
  differenceInCalendarDays,
  isWithinInterval,
  endOfDay
} from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Constants
const TIME_RANGE_OPTIONS = ['today', 'week', 'month'] as const;
type TimeRange = typeof TIME_RANGE_OPTIONS[number];

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: -0.5,
      right: -0.5,
      top: 0,
      bottom: 4
    }
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
      external: function(context) {
        let tooltipEl = document.getElementById('chartjs-tooltip');
        let dashedLineEl = document.getElementById('chartjs-dashed-line');

        // Create tooltip element if it doesn't exist
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-tooltip';
          tooltipEl.style.transition = 'all 0.15s ease-in-out';
          tooltipEl.style.pointerEvents = 'none';
          document.body.appendChild(tooltipEl);
        }
        // Create dashed line element if it doesn't exist
        if (!dashedLineEl) {
          dashedLineEl = document.createElement('div');
          dashedLineEl.id = 'chartjs-dashed-line';
          dashedLineEl.style.transition = 'all 0.15s ease-in-out';
          dashedLineEl.style.borderLeft = '1.5px dashed rgba(74, 144, 226, 0.5)';
          dashedLineEl.style.pointerEvents = 'none';
          document.body.appendChild(dashedLineEl);
        }

        const tooltipModel = context.tooltip;
        
        // Handle hiding both elements
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = '0';
          tooltipEl.style.transform = 'translateY(4px)';
          if (dashedLineEl) {
            dashedLineEl.style.opacity = '0';
          }
          return;
        }

        const position = context.chart.canvas.getBoundingClientRect();

        if (tooltipModel.body) {
          const value = tooltipModel.dataPoints[0].raw as number;
          const formattedValue = Math.round(value).toString();
          const dataPoint = context.tooltip.dataPoints[0];
          const yPos = dataPoint.element.y;
          const yScale = context.chart.scales.y;
          const pointRadius = 4; 
          const lineHeight = yScale.bottom - (yPos + pointRadius * 2);

          // Calculate tooltip position
          const tooltipX = position.left + window.pageXOffset + tooltipModel.caretX;
          const tooltipY = position.top + window.pageYOffset + yPos - 16; // Reduced offset to be closer to the point

          const innerHtml = `
            <div class="tooltip-content" style="
              background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
              border: 1px solid rgba(74, 144, 226, 0.15);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(74, 144, 226, 0.08);
              backdrop-filter: blur(8px);
              border-radius: 12px;
              padding: 8px 12px;
              min-width: 80px;
              transform-origin: center bottom;
              position: relative;
              margin-bottom: 4px;
              z-index: 1000;
            ">
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
              ">
                <span style="
                  font-weight: 600;
                  font-size: 14px;
                  color: #1a1a1a;
                  font-family: var(--font-raleway), sans-serif;
                ">${formattedValue}k</span>
                <span style="
                  font-weight: 400;
                  font-size: 12px;
                  color: #8c92a0;
                  font-family: var(--font-raleway), sans-serif;
                ">automation</span>
              </div>
              <div style="
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, transparent 50%, white 50%);
                border-right: 1px solid rgba(74, 144, 226, 0.15);
                border-bottom: 1px solid rgba(74, 144, 226, 0.15);
                z-index: -1;
              "></div>
            </div>
          `;

          tooltipEl.innerHTML = innerHtml;
          
          // Position tooltip and apply styles
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.left = tooltipX + 'px';
          tooltipEl.style.top = tooltipY + 'px';
          tooltipEl.style.transform = 'translate(-50%, -100%)'; // Changed transform to ensure proper positioning above point
          tooltipEl.style.opacity = '1';
          
          // Update dashed line position and visibility
          dashedLineEl.style.position = 'absolute';
          dashedLineEl.style.left = tooltipX + 'px';
          dashedLineEl.style.top = (position.top + window.pageYOffset + yPos + pointRadius * 2) + 'px';
          dashedLineEl.style.height = `${lineHeight}px`;
          dashedLineEl.style.opacity = '1';
          dashedLineEl.style.transform = 'translateX(-50%)';
        }
      }
    }
  },
  scales: {
    y: {
      min: 0,
      max: 75,
      display: false,
      grid: { display: false },
      border: { display: false },
      ticks: { display: false },
      beginAtZero: true,
      afterFit: (scale) => {
        scale.width = 0;
      }
    },
    x: {
        min: 0,
        max: 23,
        offset: false,
        grid: {
          offset: false,
          display: false,
          drawTicks: false
        },
        border: {
          display: true,
          color: '#E2E8F0',
          width: 1,
          dash: []
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 11,
            family: 'var(--font-raleway), sans-serif',
            weight: 'normal'
          },
          padding: 4,  
          maxRotation: 0,
          autoSkip: false,
          align: 'center',
          callback: function(value: any, index: number) {
            const timePoints = [1, 6, 12, 18, 22];
            if (timePoints.includes(index)) {
              const hour = index;
              const ampm = hour < 12 ? 'AM' : 'PM';
              const displayHour = hour === 0 ? '12' : hour > 12 ? `${hour-12}` : `${hour}`;
              return displayHour + (index === 22 ? 'PM' : ampm);
            }
            return '';
          }
        },
        afterFit: function(axis: any) {
          const chartWidth = axis.chart.width;
          axis.paddingLeft = -0.5;
          axis.paddingRight = -0.5;
          axis.width = chartWidth + 1;
          axis.left = 0;
          axis.height = axis.height - 6;  
        }
      }
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2.5,
      borderColor: '#4A90E2',
      fill: true,
      capBezierPoints: true
    },
    point: {
      radius: 0,
      hitRadius: 5,
      hoverRadius: 3,
      borderWidth: 0,
      pointStyle: 'circle',
      rotation: 0
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  datasets: {
    line: {
      order: 1
    }
  }
};

interface AutomatedActivityChartProps {
  className?: string;
}

export function AutomatedActivityChart({ className }: AutomatedActivityChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  
  // Mouse position for gradient effect - set to middle values by default
  const mouseX = useMotionValue(150);
  const mouseY = useMotionValue(100);

  // Fetch automations data
  const { data: automationsData, isLoading, refetch } = useQueryAutomations();
  
  // Calculate total automations
  const totalAutomations = useMemo(() => {
    if (!automationsData?.data || !Array.isArray(automationsData.data)) return 0;
    return automationsData.data.length;
  }, [automationsData]);
  
  // Calculate total runs (activity) across all automations
  const totalActivity = useMemo(() => {
    if (!automationsData?.data || !Array.isArray(automationsData.data)) return 0;
    return automationsData.data.reduce((total, automation) => {
      if (!automation) return total;
      return total + (automation.runs || 0);
    }, 0);
  }, [automationsData]);

  // Process automation data to get activity by time period
  const processedData = useMemo(() => {
    if (!automationsData?.data || !Array.isArray(automationsData.data)) {
      return {
        today: Array(24).fill(0),
        week: Array(24).fill(0),
        month: Array(24).fill(0)
      };
    }

    // Initialize data arrays
    const today = Array(24).fill(0);
    const week = Array(24).fill(0);
    const month = Array(24).fill(0);

    // Current date references
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
    const monthStart = startOfMonth(now);

    // Process each automation
    automationsData.data.forEach(automation => {
      if (!automation || !automation.updatedAt) return;
      
      const updatedAt = new Date(automation.updatedAt);
      const hour = updatedAt.getHours();
      const runs = automation.runs || 0; // Default to 0 if runs is not available

      // Today: only include automations that were updated today
      if (isWithinInterval(updatedAt, { start: todayStart, end: todayEnd })) {
        today[hour] += runs;
      }
      
      // Week: include automations updated since the start of the week
      if (!isBefore(updatedAt, weekStart)) {
        week[hour] += runs;
      }
      
      // Month: include automations updated since the start of the month
      if (!isBefore(updatedAt, monthStart)) {
        month[hour] += runs;
      }
    });

    return {
      today,
      week,
      month
    };
  }, [automationsData]);

  // Check if there's any data for the selected range
  const hasData = useMemo(() => {
    if (!processedData[selectedRange]) return false;
    return processedData[selectedRange].some(value => value > 0);
  }, [processedData, selectedRange]);

  // Get maximum value for current range
  const maxValue = useMemo(() => {
    return Math.max(...(processedData[selectedRange] || [0]));
  }, [processedData, selectedRange]);

  // Get total for current range
  const totalForRange = useMemo(() => {
    return (processedData[selectedRange] || []).reduce((sum, val) => sum + val, 0);
  }, [processedData, selectedRange]);

  // Calculate automations count for the selected time period
  const automationsForSelectedRange = useMemo(() => {
    if (!automationsData?.data || !Array.isArray(automationsData.data)) return 0;
    
    const now = new Date();
    let rangeStart;
    
    switch (selectedRange) {
      case 'today':
        rangeStart = startOfDay(now);
        break;
      case 'week':
        rangeStart = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        rangeStart = startOfMonth(now);
        break;
      default:
        rangeStart = startOfDay(now);
    }
    
    // Count automations that were updated within the selected range
    return automationsData.data.filter(automation => {
      if (!automation || !automation.updatedAt) return false;
      const updatedAt = new Date(automation.updatedAt);
      return !isBefore(updatedAt, rangeStart);
    }).length;
  }, [automationsData, selectedRange]);

  // Memoize the chart dataset configuration to prevent recreation on parent component hover events
  const chartDataConfig = useMemo(() => {
    // Base configuration
    const baseConfig = {
      labels: Array.from({ length: 24 }, (_, i) => {
        const ampm = i < 12 ? 'AM' : 'PM';
        const hour = i === 0 ? 12 : i > 12 ? `${i-12}` : `${i}`;
        return `${hour}${ampm}`;
      }),
      datasets: [{
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHitRadius: 5,
        tension: 0.4,
        borderColor: '#4A90E2',
        fill: true,
        borderCapStyle: 'round' as const,
        clip: {
          left: -0.5,
          right: -0.5,
          top: 0,
          bottom: 0
        },
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(233, 244, 255, 0.85)';
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          
          // Adjust opacity based on data intensity - minimum 0.05 for visibility
          const opacity = maxValue > 0 ? Math.min(0.15, 0.05 + (maxValue / 100) * 0.1) : 0.05;
          
          gradient.addColorStop(0, `rgba(74, 144, 226, ${opacity})`);
          gradient.addColorStop(0.5, `rgba(74, 144, 226, ${opacity/2})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          return gradient;
        },
        data: processedData[selectedRange] || Array(24).fill(0)
      }]
    };
    
    return baseConfig as ChartData<'line', number[], string>;
  }, [processedData, selectedRange, maxValue]);

  // Dynamically adjust y-axis max based on the data
  const chartOptions = useMemo<ChartOptions<'line'>>(() => {
    // Set minimum max value to 10 for empty charts, otherwise 20% more than max
    const dynamicMax = maxValue > 0 ? Math.max(10, Math.ceil(maxValue * 1.2)) : 10;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false, // Disable the built-in tooltip
          external: function(context) {
            // Tooltip Element
            let tooltipEl = document.getElementById('chartjs-tooltip');
            
            // Create element if it doesn't exist
            if (!tooltipEl) {
              tooltipEl = document.createElement('div');
              tooltipEl.id = 'chartjs-tooltip';
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.zIndex = '100000'; // Very high z-index
              tooltipEl.style.pointerEvents = 'none';
              document.body.appendChild(tooltipEl);
            }

            // Hide if no tooltip
            const tooltipModel = context.tooltip;
            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = '0';
              return;
            }

            // Set Text
            if (tooltipModel.body) {
              const tooltip = document.createElement('div');
              tooltip.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)';
              tooltip.style.border = '1px solid rgba(74, 144, 226, 0.15)';
              tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(74, 144, 226, 0.08)';
              tooltip.style.backdropFilter = 'blur(8px)';
              tooltip.style.borderRadius = '12px';
              tooltip.style.padding = '8px 12px';
              tooltip.style.minWidth = '80px';

              const content = document.createElement('div');
              content.style.display = 'flex';
              content.style.flexDirection = 'column';
              content.style.alignItems = 'center';
              content.style.gap = '2px';
              
              // Add title
              const title = document.createElement('div');
              title.style.fontWeight = '600';
              title.style.fontSize = '13px';
              title.style.color = '#334155';
              title.style.marginBottom = '2px';
              
              // Get the time label from the chart data
              if (tooltipModel.dataPoints && tooltipModel.dataPoints.length > 0) {
                const dataPoint = tooltipModel.dataPoints[0];
                
                // Use the raw label value to avoid date parsing issues
                if (tooltipModel.title && tooltipModel.title.length > 0) {
                  title.textContent = tooltipModel.title[0];
                } else {
                  title.textContent = 'Time point';
                }
                
                content.appendChild(title);
                
                // Add value
                const body = document.createElement('div');
                body.style.fontSize = '12px';
                body.style.color = '#475569';
                body.textContent = `${dataPoint.formattedValue} automation`;
                content.appendChild(body);
              }

              tooltip.appendChild(content);
              
              // Remove old children
              while (tooltipEl.firstChild) {
                tooltipEl.removeChild(tooltipEl.firstChild);
              }
              
              // Add new children
              tooltipEl.appendChild(tooltip);
            }

            // Position the tooltip
            const position = context.chart.canvas.getBoundingClientRect();
            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;
            
            // Account for the chart's position and scroll
            tooltipEl.style.opacity = '1';
            tooltipEl.style.left = position.left + window.scrollX + tooltipModel.caretX - (tooltipWidth / 2) + 'px';
            tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY - tooltipHeight - 10 + 'px';
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          min: 0,
          max: dynamicMax,
          display: false,
          grid: { display: false },
          border: { display: false },
          ticks: { display: false },
          beginAtZero: true,
          afterFit: (scale) => {
            scale.width = 0;
          }
        },
        x: {
          min: 0,
          max: 23,
          offset: false,
          grid: {
            offset: false,
            display: false,
            drawTicks: false
          },
          border: {
            display: true,
            color: '#E2E8F0',
            width: 1,
            dash: []
          },
          ticks: {
            color: '#94A3B8',
            font: {
              size: 11,
              family: 'var(--font-raleway), sans-serif',
              weight: 'normal'
            },
            padding: 4,  
            maxRotation: 0,
            autoSkip: false,
            align: 'center',
            callback: function(value: any, index: number) {
              const timePoints = [1, 6, 12, 18, 22];
              if (timePoints.includes(index)) {
                const hour = index;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const displayHour = hour === 0 ? '12' : hour > 12 ? `${hour-12}` : `${hour}`;
                return displayHour + (index === 22 ? 'PM' : ampm);
              }
              return '';
            }
          },
          afterFit: function(axis: any) {
            const chartWidth = axis.chart.width;
            axis.paddingLeft = -0.5;
            axis.paddingRight = -0.5;
            axis.width = chartWidth + 1;
            axis.left = 0;
            axis.height = axis.height - 6;  
          }
        }
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2.5,
          borderColor: '#4A90E2',
          fill: true,
          capBezierPoints: true
        },
        point: {
          radius: 0,
          hitRadius: 5,
          hoverRadius: 3,
          borderWidth: 0,
          pointStyle: 'circle',
          rotation: 0
        }
      },
      layout: {
        padding: {
          left: -0.5,
          right: -0.5,
          top: 0,
          bottom: 4
        }
      },
    };
  }, [maxValue]);

  // Set up periodic data refresh with shorter interval for real-time updates
  useEffect(() => {
    // Fetch data initially
    refetch();
    
    // Set up interval to refresh data more frequently for real-time updates
    const intervalId = setInterval(() => {
      refetch();
    }, 5000); // Refresh every 5 seconds for real-time updates
    
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Clear tooltip element on unmount
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById('chartjs-tooltip');
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  // Render loading state if data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse bg-gray-200 rounded-md h-[120px] w-full" />
      </div>
    );
  }

  // Determine range label text
  const getRangeLabel = () => {
    switch (selectedRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return '';
    }
  };

  return (
    <BackgroundGradient 
      className="rounded-3xl overflow-hidden bg-opacity-0" 
      containerClassName={cn("h-full p-[2px]", className)}
      animate={true}
    >
      <div className={cn("relative w-full h-full rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-200")}>
        {/* Enhanced glass card background effect */}
        <div className="absolute inset-0 w-full h-full">
          {/* Primary gradient background */}
          <div 
            className="absolute inset-0 rounded-[16px]"
            style={{
              background: 'linear-gradient(145deg, rgba(236, 236, 255, 0.9), rgba(224, 224, 248, 0.85), rgba(218, 218, 245, 0.8))',
            }}
          />
          
          {/* Subtle inner highlight */}
          <div 
            className="absolute inset-0 rounded-[16px]"
            style={{ 
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(255, 255, 255, 0.05)'
            }}
          />
          
          {/* Backdrop blur for glass effect */}
          <div className="absolute inset-0 backdrop-blur-[6px] rounded-[16px]" />
          
          {/* Edge glow effect */}
          <div className="absolute inset-0 opacity-60" style={{ boxShadow: 'inset 0 0 25px rgba(255, 255, 255, 0.5)' }} />
          
          {/* Top highlight */}
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          {/* Left edge highlight */}
          <div className="absolute top-4 left-0 bottom-4 w-[1px] bg-gradient-to-b from-white/40 via-white/20 to-transparent" />
        </div>

        {/* Content with padding */}
        <div className="relative z-10 p-4 h-full">
          <div className='flex justify-between items-start mb-4'>
            <div className='space-y-2.5'>
              <div className='flex items-center gap-1.5 group cursor-pointer'>
                <h2 className='text-[15px] font-semibold leading-[22px] text-slate-800 tracking-[-0.2px] transition-colors group-hover:text-slate-900 font-sans' style={{ fontFamily: 'inherit !important' }}>
                  Automated Activity
                </h2>
                <ChevronRight className='w-[14px] h-[14px] text-slate-400 transition-all duration-200 group-hover:text-slate-500 group-hover:translate-x-0.5' />
              </div>
              <div className='flex items-baseline gap-2.5'>
                <span className='text-[40px] font-bold leading-[44px] tracking-[-0.8px] text-slate-800 font-sans'>
                  {totalForRange}
                </span>
                <span className='text-[15px] font-medium leading-[22px] tracking-[-0.1px] text-slate-500 font-sans'>
                  automation
                </span>
              </div>
            </div>
            <div className='inline-flex items-center border border-slate-200 rounded-[20px] p-1 shadow-sm bg-white/50 backdrop-blur-sm'>
              <button 
                onClick={() => setSelectedRange('today')}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-[16px] ${
                  selectedRange === 'today'
                    ? 'bg-[#FFE600] text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-600 hover:bg-white/80'
                }`}
              >
                Today
              </button>
              <button 
                onClick={() => setSelectedRange('week')}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-[16px] ${
                  selectedRange === 'week'
                    ? 'bg-[#FFE600] text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-600 hover:bg-white/80'
                }`}
              >
                This Week
              </button>
              <button 
                onClick={() => setSelectedRange('month')}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-[16px] ${
                  selectedRange === 'month'
                    ? 'bg-[#FFE600] text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-600 hover:bg-white/80'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          <div className='h-[180px] -mx-4 -mb-2 mt-2'>
            <div className='h-full w-full px-4 relative'>
              <div className='absolute inset-0 overflow-hidden'>
                {!hasData ? (
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <p className="text-sm text-slate-500">No activity data for {getRangeLabel().toLowerCase()}</p>
                  </div>
                ) : (
                <div className="relative z-20">
                  <div className="relative" style={{ position: 'relative', zIndex: 30 }}>
                    <Line 
                      ref={(ref) => {
                        if (ref) {
                          canvasRef.current = ref.canvas;
                          setChart(ref as any);
                        }
                      }}
                      options={chartOptions}
                      data={chartDataConfig}
                    />
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundGradient>
  );
}
