import ROUTES from '@src/ROUTES';

const CONFIG = {
    is2FAEnabled: true,
    initialRoute: ROUTES.AUTHORIZE_TRANSACTION,
    accountID: 18234051,
} as const;

export default CONFIG;
