import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, metadata?: { name: string; userType: 'teacher' | 'student' }, inviteToken?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { name: string; userType: 'teacher' | 'student' }, inviteToken?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // If there's an invite token, verify it first
    if (inviteToken) {
      const { data: invite, error: inviteError } = await supabase
        .from('app_b3583718a0_student_invites')
        .select('*')
        .eq('token', inviteToken)
        .eq('email', email)
        .eq('used', false)
        .maybeSingle();

      if (inviteError || !invite) {
        return { error: { message: 'Invalid or expired invitation link' } };
      }

      // Check if token is expired
      if (new Date(invite.expires_at) < new Date()) {
        return { error: { message: 'This invitation has expired. Please request a new one from your teacher.' } };
      }

      // Sign up with auto-confirm for invited students
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...metadata,
            email_confirmed: true
          }
        }
      });

      if (!error && data.user) {
        // Mark token as used
        await supabase
          .from('app_b3583718a0_student_invites')
          .update({ used: true })
          .eq('token', inviteToken);
      }

      return { error };
    }
    
    // Regular signup for teachers (requires email verification)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};