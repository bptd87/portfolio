import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  className?: string;
}

const inputBaseStyles = 'w-full px-4 py-3 bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-all';

const labelStyles = 'block text-xs tracking-wider text-muted-foreground mb-2 uppercase font-medium';

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className={labelStyles}>{label}</label>}
      <input
        className={`${inputBaseStyles} ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && <label className={labelStyles}>{label}</label>}
      <textarea
        className={`${inputBaseStyles} resize-none ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className={labelStyles}>{label}</label>}
      <select
        className={`${inputBaseStyles} ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-background"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
