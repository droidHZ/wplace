import { websiteConfig } from '@/config/website';
import db from '@/db/index';
import { account, session, user, verification } from '@/db/schema';
import { defaultMessages } from '@/i18n/messages';
import { LOCALE_COOKIE_NAME, routing } from '@/i18n/routing';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { sendEmail } from '@/mail';
import { subscribe } from '@/newsletter';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { parse as parseCookies } from 'cookie';
import type { Locale } from 'next-intl';
import { getBaseUrl, getUrlWithLocaleInCallbackUrl } from './urls/urls';

/**
 * Better Auth configuration
 *
 * docs:
 * https://mksaas.com/docs/auth
 * https://www.better-auth.com/docs/reference/options
 */
export const auth = betterAuth({
  baseURL: getBaseUrl(),
  appName: defaultMessages.Metadata.name,
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
    // The schema object that defines the tables and fields
    // [BetterAuthError]: [# Drizzle Adapter]: The model "verification" was not found in the schema object.
    // Please pass the schema directly to the adapter options.
    // https://www.better-auth.com/docs/adapters/drizzle#additional-information
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  session: {
    // https://www.better-auth.com/docs/concepts/session-management#cookie-cache
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // Cache duration in seconds
    },
    // https://www.better-auth.com/docs/concepts/session-management#session-expiration
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // https://www.better-auth.com/docs/concepts/session-management#session-freshness
    // https://www.better-auth.com/docs/concepts/users-accounts#authentication-requirements
    // disable freshness check for user deletion
    freshAge: 0 /* 60 * 60 * 24 */,
  },
  emailAndPassword: {
    enabled: true,
    // https://www.better-auth.com/docs/concepts/email#2-require-email-verification
    requireEmailVerification: true,
    // https://www.better-auth.com/docs/authentication/email-password#forget-password
    async sendResetPassword({ user, url }, request) {
      const locale = getLocaleFromRequest(request);
      const localizedUrl = getUrlWithLocaleInCallbackUrl(url, locale);

      await sendEmail({
        to: user.email,
        template: 'forgotPassword',
        context: {
          url: localizedUrl,
          name: user.name,
        },
        locale,
      });
    },
  },
  emailVerification: {
    // https://www.better-auth.com/docs/concepts/email#auto-signin-after-verification
    autoSignInAfterVerification: true,
    // https://www.better-auth.com/docs/authentication/email-password#require-email-verification
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const locale = getLocaleFromRequest(request);
      const localizedUrl = getUrlWithLocaleInCallbackUrl(url, locale);

      await sendEmail({
        to: user.email,
        template: 'verifyEmail',
        context: {
          url: localizedUrl,
          name: user.name,
        },
        locale,
      });
    },
  },
  socialProviders: {
    // https://www.better-auth.com/docs/authentication/github
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    // https://www.better-auth.com/docs/authentication/google
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    // https://www.better-auth.com/docs/concepts/users-accounts#account-linking
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },
  user: {
    // https://www.better-auth.com/docs/concepts/database#extending-core-schema
    // additionalFields: {
    // },
    // https://www.better-auth.com/docs/concepts/users-accounts#delete-user
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    // https://www.better-auth.com/docs/concepts/database#database-hooks
    user: {
      create: {
        after: async (user) => {
          console.log(
            `🔄 [AUTH HOOK] User created: ${user.id} (${user.email})`
          );

          // Auto subscribe user to newsletter after sign up if enabled in website config
          if (user.email && websiteConfig.newsletter.autoSubscribeAfterSignUp) {
            try {
              console.log(
                `📧 [NEWSLETTER] Attempting to subscribe user: ${user.email}`
              );
              const subscribed = await subscribe(user.email);
              if (!subscribed) {
                console.error(
                  `❌ [NEWSLETTER] Failed to subscribe user ${user.email} to newsletter`
                );
              } else {
                console.log(
                  `✅ [NEWSLETTER] User ${user.email} subscribed to newsletter`
                );
              }
            } catch (error) {
              console.error(
                '❌ [NEWSLETTER] Newsletter subscription error:',
                error
              );
            }
          } else {
            console.log(
              `⏭️ [NEWSLETTER] Newsletter auto-subscribe disabled or no email`
            );
          }

          // Award signup bonus points
          console.log(
            `🎯 [POINTS] Starting signup bonus process for user: ${user.id}`
          );
          try {
            await PointsService.handleSignupBonus(user.id);
            console.log(
              `✅ [POINTS] Successfully awarded signup bonus points to user ${user.id}`
            );
          } catch (error) {
            console.error(
              `❌ [POINTS] Points signup bonus error for user ${user.id}:`,
              error
            );
          }

          console.log(
            `🏁 [AUTH HOOK] Completed processing for user: ${user.id}`
          );
        },
      },
    },
  },
  plugins: [
    // https://www.better-auth.com/docs/plugins/admin
    // support user management, ban/unban user, manage user roles, etc.
    admin(),
  ],
  onAPIError: {
    // https://www.better-auth.com/docs/reference/options#onapierror
    errorURL: '/auth/error',
    onError: (error, ctx) => {
      console.error('auth error:', error);
    },
  },
});

/**
 * Gets the locale from a request by parsing the cookies
 * If no locale is found in the cookies, returns the default locale
 *
 * @param request - The request to get the locale from
 * @returns The locale from the request or the default locale
 */
export function getLocaleFromRequest(request?: Request): Locale {
  const cookies = parseCookies(request?.headers.get('cookie') ?? '');
  return (cookies[LOCALE_COOKIE_NAME] as Locale) ?? routing.defaultLocale;
}
