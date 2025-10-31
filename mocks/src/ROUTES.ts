import type {ValueOf} from 'type-fest';

const ROUTES = {
    OTP: {
        screen: 'OTPCodePage',
        route: '/otp',
        getRoute: () => {
            return '/otp' as const;
        },
    },
    MAGIC_CODE: {
        screen: 'MagicCodePage',
        route: '/magic-code',
        getRoute: () => {
            return '/magic-code' as const;
        },
    },
    SUCCESS: {
        screen: 'SuccessPage',
        route: '/success',
        getRoute: () => {
            return '/success' as const;
        },
    },
    FAILURE: {
        screen: 'FailurePage',
        route: '/failure',
        getRoute: () => {
            return '/failure' as const;
        },
    },
    AUTHORIZE_TRANSACTION: {
        screen: 'AuthorizeTransactionPage',
        route: '/authorize-transaction',
        getRoute: () => {
            return '/authorize-transaction' as const;
        },
    },
    NOT_FOUND: {
        screen: 'NotFoundPage',
        route: '/not-found',
        getRoute: () => {
            return '/not-found' as const;
        },
    },
    SOFT_PROMPT: {
        screen: 'SoftPromptPage',
        route: '/soft-prompt',
        getRoute: () => {
            return '/soft-prompt' as const;
        },
    },
} as const;

type Route = ValueOf<typeof ROUTES>;

export default ROUTES;
export type {Route};
