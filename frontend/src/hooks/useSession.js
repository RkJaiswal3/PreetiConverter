import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useSession = () => {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem('preeti_session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('preeti_session_id', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
};
