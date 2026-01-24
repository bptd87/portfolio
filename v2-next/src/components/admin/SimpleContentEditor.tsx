import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ContentTabWrapper } from './ContentTabWrapper';

interface SimpleContentEditorProps {
  value: any[] | string;
  onChange: (blocks: any[]) => void;
}

/**
 * Wrapper component that adapts ContentTabWrapper to work with simple value/onChange props
 * instead of requiring react-hook-form throughout the parent component
 */
export function SimpleContentEditor({ value, onChange }: SimpleContentEditorProps) {
  const methods = useForm({
    defaultValues: {
      content: value || []
    }
  });

  // Watch for changes and propagate them up
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = methods.watch((formData) => {
      if (formData.content && JSON.stringify(formData.content) !== JSON.stringify(value)) {
        onChange(formData.content as any[]);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, onChange, value]);

  // Update form when value changes externally
  React.useEffect(() => {
    if (JSON.stringify(methods.getValues('content')) !== JSON.stringify(value)) {
      methods.setValue('content', value);
    }
  }, [value, methods]);

  return (
    <FormProvider {...methods}>
      <ContentTabWrapper methods={methods} />
    </FormProvider>
  );
}
