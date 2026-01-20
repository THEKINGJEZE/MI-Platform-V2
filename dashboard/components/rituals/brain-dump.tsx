// @ts-nocheck
"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, Save } from "lucide-react";

interface BrainDumpProps {
  initialValue?: string;
  onSave: (value: string) => void;
  className?: string;
}

export function BrainDump({ initialValue = "", onSave, className }: BrainDumpProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaved, setIsSaved] = useState(false);

  const handleBlur = useCallback(() => {
    if (value.trim()) {
      onSave(value);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  }, [value, onSave]);

  const placeholderText = `What's on your mind for tomorrow?

Examples:
• Follow up with Sarah at Met Police
• Research that procurement notice
• Remind me to check on GMP lead next Monday
• Ask James about the budget timeline

Just brain dump — we'll sort it in the morning.`;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-info-muted rounded-lg">
          <Lightbulb className="size-5 text-info" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-primary">Brain Dump</h3>
          <p className="text-sm text-muted">
            Anything on your mind for tomorrow?
          </p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholderText}
          className={cn(
            "w-full min-h-[200px] p-4 bg-surface-0 border border-surface-1 rounded-lg",
            "text-primary placeholder:text-muted/50 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent",
            "transition-all"
          )}
        />

        {/* Auto-save indicator */}
        {isSaved && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-success">
            <Save className="size-3" />
            Saved
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        Auto-saves when you click away. Items appear in tomorrow&apos;s Morning
        Brief.
      </p>
    </div>
  );
}
