import type {ValueOf} from 'type-fest';

const ONYXKEYS = {
    ACCOUNT: 'ACCOUNT',
} as const;

type OnyxKeys = ValueOf<typeof ONYXKEYS>;

export default ONYXKEYS;
export type {OnyxKeys};
