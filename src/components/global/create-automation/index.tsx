'use client';

import { Plus } from "lucide-react";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { cn } from "@/lib/utils";

interface CreateAutomationProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const CreateAutomation = ({
  onClick,
  className,
  disabled
}: CreateAutomationProps) => {
  return (
    <PulsatingButton
      className={cn(
        "relative inline-flex items-center justify-center",
        "bg-white text-violet-600 border border-violet-200",
        "hover:bg-violet-50 hover:border-violet-300",
        "w-full sm:w-auto shadow-sm rounded-lg px-4 py-2",
        "animate-magic-pulse",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      pulseColor="rgba(38, 4, 93, 0.61)"
      duration="2s"
    >
      <span className="relative z-10 flex items-center gap-2">
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-mona">Create Automation</span>
      </span>
    </PulsatingButton>
  );
};

export default CreateAutomation;
