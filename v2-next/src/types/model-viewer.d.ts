// Type declarations for Google's model-viewer web component
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        'auto-rotate'?: boolean | string;
        'camera-controls'?: boolean | string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        exposure?: string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'ios-src'?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
      },
      HTMLElement
    >;
  }
}
