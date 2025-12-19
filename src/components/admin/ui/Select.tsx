import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Select({ name, label, required, children, ...props }: SelectProps) {
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
          <select
            id={name}
            {...field}
            {...props}
            className={`w-full px-4 py-2 bg-zinc-900 text-white text-sm border border-zinc-700 focus:border-blue-500 focus:outline-none ${
              error ? 'border-red-500' : ''
            }`}
          >
            {children}
          </select>
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message as string}</p>}
    </div>
  );
}
