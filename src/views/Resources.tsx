
import { useEffect } from 'react';

interface ResourcesProps {
  onNavigate: (page: string) => void;
}

export function Resources({ onNavigate }: ResourcesProps) {
  useEffect(() => {
    onNavigate('directory');
  }, [onNavigate]);

  return null;
}

export default Resources;
