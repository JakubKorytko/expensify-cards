import ROUTES from '@src/ROUTES';

const CONFIG = {
    is2FAEnabled: true,
    initialRoute: ROUTES.AUTHORIZE_TRANSACTION,
    accountID: 18234051,
    // Simulate that OTP 777111 is authenticator app generated OTP for testing purposes
    authenticatorCode: 777111,
} as const;

export default CONFIG;
