import React from 'react';

const SCREENS = {
    OTPCodePage: React.lazy(() => import('./pages/OTPCodePage')),
    MagicCodePage: React.lazy(() => import('./pages/MagicCodePage')),
    SuccessPage: React.lazy(() => import('./pages/SuccessPage')),
    FailurePage: React.lazy(() => import('./pages/FailurePage')),
    AuthorizeTransactionPage: React.lazy(() => import('./pages/AuthorizeTransactionPage')),
    SetupBiometricsPage: React.lazy(() => import('./pages/SetupBiometricsPage')),
    NotFoundPage: React.lazy(() => import('./pages/NotFoundPage')),
    SoftPromptPage: React.lazy(() => import('./pages/SoftPromptPage')),
} as const;

export default SCREENS;
