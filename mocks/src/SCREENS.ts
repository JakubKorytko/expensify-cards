import type {ComponentType} from 'react';
import React from 'react';
import type {Route} from './ROUTES';

const SCREENS = {
    OTPCodePage: React.lazy(() => import('../../src/pages/OTPCodePage')),
    MagicCodePage: React.lazy(() => import('../../src/pages/MagicCodePage')),
    SuccessPage: React.lazy(() => import('../../src/pages/SuccessPage')),
    FailurePage: React.lazy(() => import('../../src/pages/FailurePage')),
    AuthorizeTransactionPage: React.lazy(() => import('../../src/pages/AuthorizeTransactionPage')),
    SetupBiometricsPage: React.lazy(() => import('../../src/pages/SetupBiometricsPage')),
    NotFoundPage: React.lazy(() => import('../../src/pages/NotFoundPage')),
    SoftPromptPage: React.lazy(() => import('../../src/pages/SoftPromptPage')),
} as const satisfies Record<Route, React.LazyExoticComponent<ComponentType<unknown>>>;

export default SCREENS;
