import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

export function Checkbox({ name, label, ...props }: CheckboxProps) {
  const { control } = useFormContext();

  return (
    <div className="flex items-center gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            id={name}
            type="checkbox"
            checked={field.value}
            {...field}
            {...props}
            className="w-4 h-4"
          />
        )}
      />
      <label htmlFor={name} className="text-sm cursor-pointer">
        {label}
      </label>
    </div>
  );
}
