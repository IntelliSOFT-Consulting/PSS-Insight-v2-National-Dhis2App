import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useRedirect(path, delay, event) {
  const navigate = useNavigate();

  useEffect(() => {
    if (event) {
      const timeout = setTimeout(() => {
        navigate(path);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [event]);
}
