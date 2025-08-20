import { authClient } from '@/lib/auth-client';
import { console } from '@/lib/logger';

export const useCurrentUser = () => {
  const { data: session, error } = authClient.useSession();
  // console.log('useCurrentUser, session:', session);
  if (error) {
    console.error('useCurrentUser, error:', error);
    return null;
  }
  return session?.user;
};
