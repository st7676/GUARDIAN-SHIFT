import { useState } from 'react';

export function useLoginForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim() || !email.trim()) {
      setError('אנא מלא את כל הפרטים');
      return false;
    }
    setError('');
    return true;
  };

  const reset = () => {
    setName('');
    setEmail('');
    setError('');
  };

  return {
    name,
    setName,
    email,
    setEmail,
    error,
    setError,
    validate,
    reset,
    isValid: name.trim() && email.trim()
  };
}

export default useLoginForm;
