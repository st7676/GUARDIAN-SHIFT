import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await base44.auth.me();
        
        // Fetch nurse data
        const nurses = await base44.entities.Nurse.filter({ is_active: true });
        const currentNurse = nurses.find(n => n.user_id === user.id);
        
        if (!currentNurse) {
          // User not linked to any nurse - redirect to error or setup
          setLoading(false);
          return;
        }

        // Check if head nurse
        if (currentNurse.is_head_nurse) {
          // Redirect to admin dashboard
          navigate(createPageUrl('Dashboard'), { replace: true });
        } else {
          // Redirect to personal schedule
          navigate(createPageUrl('MySchedule'), { replace: true });
        }
      } catch (error) {
        // Not logged in - Base44 will redirect to login
        base44.auth.redirectToLogin();
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">טוען...</p>
      </div>
    </div>
  );
}