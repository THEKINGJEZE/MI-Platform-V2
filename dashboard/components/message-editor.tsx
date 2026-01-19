'use client';

import { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

/**
 * Message Editor Component
 *
 * Editable textarea with:
 * - Auto-resize
 * - Debounced save (500ms)
 * - Visual feedback when editing
 * - Character count
 */
export function MessageEditor({
  value,
  onChange,
  disabled = false,
  label = 'Message',
  placeholder = 'Enter your message...',
}: MessageEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDirty, setIsDirty] = useState(false);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
    setIsDirty(false);
  }, [value]);

  // Debounced save
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      onChange(localValue);
      setIsDirty(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, isDirty, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
  }, []);

  const handleSaveNow = useCallback(() => {
    onChange(localValue);
    setIsDirty(false);
  }, [localValue, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-yellow-500">Unsaved changes</span>
          )}
          <span className="text-xs text-muted-foreground">
            {localValue.length} chars
          </span>
        </div>
      </div>

      <Textarea
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[120px] resize-y"
        rows={5}
      />

      {isDirty && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveNow}
            disabled={disabled}
          >
            Save Draft
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Read-only message display for review
 */
export function MessageDisplay({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-sm text-muted-foreground italic">No message drafted</p>
    );
  }

  return (
    <div className="rounded-md bg-muted/50 p-3">
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}
