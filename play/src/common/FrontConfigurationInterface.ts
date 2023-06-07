import type { OpidWokaNamePolicy } from "@workadventure/messages";

export interface FrontConfigurationInterface {
    DEBUG_MODE: boolean;
    PUSHER_URL: string;
    ADMIN_URL: string | undefined;
    UPLOADER_URL: string;
    ICON_URL: string;
    STUN_SERVER: string | undefined;
    TURN_SERVER: string | undefined;
    SKIP_RENDER_OPTIMIZATIONS: boolean;
    DISABLE_NOTIFICATIONS: boolean;
    TURN_USER: string | undefined;
    TURN_PASSWORD: string | undefined;
    JITSI_URL: string | undefined;
    JITSI_PRIVATE_MODE: boolean;
    ENABLE_MAP_EDITOR: boolean;
    MAX_USERNAME_LENGTH: number;
    MAX_PER_GROUP: number;
    NODE_ENV: string;
    CONTACT_URL: string | undefined;
    POSTHOG_API_KEY: string | undefined;
    POSTHOG_URL: string | undefined;
    DISABLE_ANONYMOUS: boolean;
    ENABLE_OPENID: boolean;
    OPID_PROFILE_SCREEN_PROVIDER: string | undefined;
    OPID_LOGOUT_REDIRECT_URL: string | undefined;
    CHAT_URL: string | undefined;
    ENABLE_CHAT_UPLOAD: boolean;
    FALLBACK_LOCALE: string | undefined;
    OPID_WOKA_NAME_POLICY: OpidWokaNamePolicy | undefined;
    ENABLE_REPORT_ISSUES_MENU: boolean | undefined;
    REPORT_ISSUES_URL: string | undefined;
    SENTRY_DSN_FRONT: string | undefined;
    SENTRY_DSN_PUSHER: string | undefined;
    SENTRY_RELEASE: string | undefined;
    SENTRY_TRACES_SAMPLE_RATE: number | undefined;
    WOKA_SPEED: number;
    JITSI_DOMAIN: string | undefined;
    JITSI_XMPP_DOMAIN: string | undefined;
    JITSI_MUC_DOMAIN: string | undefined;
}
