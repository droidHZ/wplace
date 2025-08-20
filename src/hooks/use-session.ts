import { authClient } from '@/lib/auth-client';
import { console } from '@/lib/logger';

export const useSession = () => {
  const { data: session, error } = authClient.useSession();
  // console.log('useCurrentUser, session:', session);
  if (error) {
    console.error('useSession, error:', error);
    return null;
  }
  return session;
};
