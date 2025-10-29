import type {ValueOf} from 'type-fest';

const ROUTES = {
    OTP: 'OTPCodePage',
    MAGIC_CODE: 'MagicCodePage',
    SUCCESS: 'SuccessPage',
    FAILURE: 'FailurePage',
    AUTHORIZE_TRANSACTION: 'AuthorizeTransactionPage',
    NOT_FOUND: 'NotFoundPage',
    SOFT_PROMPT: 'SoftPromptPage',
} as const;

type Route = ValueOf<typeof ROUTES>;

const HOME_SCREEN = 'HomeScreenPage';

type HomeScreen = typeof HOME_SCREEN;

export default {
    ...ROUTES,
    HOME_SCREEN,
} as const;

export type {Route, HomeScreen};
