import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/api/Client';
import { useAuth } from '@/lib/AuthProvider';

export function useLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const performLogin = async (name, email, role) => {
    setLoading(true);

    try {
      // Create or get nurse user
      const nurses = await Client.entities.Nurse.filter({ email });
      let nurse = nurses[0];

      if (!nurse) {
        // Create new nurse
        const newNurse = await Client.entities.Nurse.create({
          name,
          email,
          is_active: true,
          is_head_nurse: role === 'head',
          user_id: `user_${Date.now()}`,
        });
        nurse = newNurse;
      }

      // Set current user
      const user = {
        id: nurse.user_id || nurse.id,
        name: nurse.name,
        email: nurse.email,
        is_head_nurse: nurse.is_head_nurse
      };

      // Store token
      localStorage.setItem('token', `mock-token-${Date.now()}`);

      // Update auth context
      setUser(user);

      // Navigate to dashboard
      navigate('/', { replace: true });

      return { success: true };
    } catch (err) {
      const errorMessage = 'שגיאה בהתחברות: ' + (err?.message || 'נסה שוב');
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    performLogin,
    loading
  };
}

export default useLogin;
