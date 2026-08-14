import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, currentUser as authCurrentUser } from '@/lib/AuthProvider';
import { Calendar } from 'lucide-react';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useRoleSelection } from '@/hooks/useRoleSelection';
import { useLogin } from '@/hooks/useLogin';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const form = useLoginForm();
  const roleSelection = useRoleSelection();
  const { performLogin, loading } = useLogin();

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.validate()) {
      return;
    }

    const result = await performLogin(form.name, form.email, roleSelection.role);

    if (!result.success) {
      form.setError(result.error);
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
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
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
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
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
                  value={roleSelection.ROLES.REGULAR}
                  checked={roleSelection.role === roleSelection.ROLES.REGULAR}
                  onChange={(e) => roleSelection.setRole(e.target.value)}
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
                  value={roleSelection.ROLES.HEAD}
                  checked={roleSelection.role === roleSelection.ROLES.HEAD}
                  onChange={(e) => roleSelection.setRole(e.target.value)}
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
            {form.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {form.error}
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
