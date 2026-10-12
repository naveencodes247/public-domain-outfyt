import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Shield, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { auth } from '../../firebase/config';
import { checkAdminStatus, AdminStatus, signInWithGoogle, logOut } from '../../firebase/services/admin';
import { Link } from '../../router/Router';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const status = await checkAdminStatus(currentUser);
        setAdminStatus(status);
      } else {
        setAdminStatus(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#CDA66B] border-t-transparent animate-spin" />
        <span className="text-xs text-[#66615B] font-mono">Verifying Administrator Authorization...</span>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] text-[#CDA66B] flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-editorial text-3xl font-bold text-[#171717]">Administrator Access</h2>
          <p className="text-xs text-[#66615B] leading-relaxed">
            Content management and curation at OutFyt.co.in requires verified Google Sign-In authorization.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-xs text-[#66615B] text-left space-y-1 shadow-xs">
          <span className="font-semibold text-[#171717] block">Access Notice:</span>
          <span>Access is restricted strictly to designated OutFyt.co.in administrators with verified Google credentials.</span>
        </div>

        <button
          onClick={() => signInWithGoogle()}
          className="w-full bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In with Authorized Google Account</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#66615B] hover:text-[#171717] pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </Link>
      </div>
    );
  }

  // Signed in but not admin
  if (!adminStatus?.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-editorial text-3xl font-bold text-[#171717]">Access Denied</h2>
          <p className="text-xs text-[#66615B] leading-relaxed">
            Your Google Account (<strong className="text-[#171717]">{user.email}</strong>) is authenticated but does not possess administrative privileges on OutFyt.co.in.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-xs text-[#66615B] text-left space-y-1 shadow-xs">
          <span className="font-semibold text-[#171717] block">Security Policy:</span>
          <span>Only verified administrators listed in the registry can modify outfits and affiliate records.</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => logOut()}
            className="w-full bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] font-medium text-xs py-2.5 rounded-xl border border-[#E5DDD0] transition cursor-pointer"
          >
            Sign Out & Switch Account
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-[#66615B] hover:text-[#171717] pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    );
  }

  // Authorized Admin
  return <>{children}</>;
};

export default AdminRouteGuard;
