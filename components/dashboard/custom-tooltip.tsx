import React from 'react';
import { TooltipRenderProps } from 'react-joyride';
import { Owl } from '@/components/ui/owl';

export function CustomTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div {...tooltipProps} className="bg-[#1a1a1a] border-2 border-[#39ff14] p-4 rounded-xl flex items-start gap-4 max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[1000]">
      <div className="w-20 h-20 shrink-0">
        <Owl state="talking" />
      </div>
      <div className="flex-1">
        <h3 className="text-[#39ff14] font-pixel text-sm mb-2 uppercase">{step.title}</h3>
        <div className="text-white font-pixel text-[10px] leading-relaxed mb-4">{step.content}</div>
        <div className="flex justify-end gap-2">
          {index > 0 && (
            <button {...backProps} className="px-3 py-2 text-[10px] font-pixel text-[#888] hover:text-white transition-colors">BACK</button>
          )}
          <button {...primaryProps} className="px-4 py-2 text-[10px] font-pixel bg-[#39ff14] text-black rounded hover:bg-white transition-colors">
            {continuous ? 'NEXT' : 'FINISH'}
          </button>
        </div>
      </div>
    </div>
  );
}
