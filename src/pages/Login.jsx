import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/api/Client';
import { useAuth } from '@/lib/AuthProvider';
import { Calendar } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, currentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('regular');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      console.log('👤 User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim() || !email.trim()) {
      setError('אנא מלא את כל הפרטים');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login with:', { name, email, role });
      
      // Create or get nurse user
      const nurses = await Client.entities.Nurse.filter({ email });
      console.log('Found nurses:', nurses);
      
      let nurse = nurses[0];

      if (!nurse) {
        console.log('📝 Creating new nurse...');
        // Create new nurse
        const newNurse = await Client.entities.Nurse.create({
          name,
          email,
          is_active: true,
          is_head_nurse: role === 'head',
          user_id: `user_${Date.now()}`,
        });
        console.log('✅ Created nurse:', newNurse);
        nurse = newNurse;
      }

      // Set current user
      const user = { 
        id: nurse.user_id || nurse.id, 
        name: nurse.name, 
        email: nurse.email,
        is_head_nurse: nurse.is_head_nurse 
      };
      console.log('✨ Setting user:', user);
      
      // Store token
      localStorage.setItem('token', `mock-token-${Date.now()}`);

      // Update auth context
      setUser(user);

      console.log('🎉 Login successful, navigating...');
      
      // Navigate to dashboard
      // setTimeout(() => {
      //   console.log('⏩ Navigating to dashboard');
      //   navigate('/');
      // }, 100);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('שגיאה בהתחברות: ' + (err?.message || 'נסה שוב'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-800">NurseShift</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md shadow-xl rounded-lg overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white p-6">
          <h2 className="text-center text-2xl font-bold">התחברות למערכת</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-slate-700 font-medium text-sm block">
                שם מלא
              </label>
              <input
                id="name"
                type="text"
                placeholder="הכנס את שמך"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-slate-700 font-medium text-sm block">
                דוא״ל
              </label>
              <input
                id="email"
                type="email"
                placeholder="example@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <p className="text-slate-700 font-medium text-sm">תפקיד</p>
              
              {/* Regular Nurse */}
              <label className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-sky-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="role"
                  value="regular"
                  checked={role === 'regular'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">אחות רגילה</div>
                  <div className="text-sm text-slate-600">גישה לתוכניות הזמנות בלבד</div>
                </div>
              </label>

              {/* Head Nurse */}
              <label className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-sky-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="role"
                  value="head"
                  checked={role === 'head'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">👑 אחות ראשית</div>
                  <div className="text-sm text-slate-600">גישה מופעלת + ניהול סגל + דוחות</div>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:from-sky-400 disabled:to-indigo-500 text-white font-medium rounded-md transition-all disabled:opacity-70"
            >
              {loading ? 'מתחבר...' : 'התחברות למערכת'}
            </button>

            {/* Demo Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 טיפ:</strong> השתמש בכל דוא״ל וכל שם להתחברות. הנתונים נשמרים ב-localStorage.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
