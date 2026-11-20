import { useCallback, useState } from 'react';

export default function useToast() {
  const [toast, setToast] = useState('');
  const notify = useCallback(message => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }, []);

  return { toast, setToast, notify };
}
