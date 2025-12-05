import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  required?: boolean;
}

export function Input({ name, label, required, ...props }: InputProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div>
      <label htmlFor={name} className="block text-xs tracking-wider uppercase opacity-60 mb-2">
        {label} {required && '*'}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            id={name}
            {...field}
            {...props}
            className={`w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none ${
              error ? 'border-red-500' : ''
            }`}
          />
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message as string}</p>}
    </div>
  );
}
