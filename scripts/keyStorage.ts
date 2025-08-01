import { Bytes } from "@noble/ed25519";

type Storage = {
  revoke(): void;
  update(key: string | undefined): void;
  updateCallback?: (key: string | undefined) => void;
  key: Bytes | undefined;
};

const storage: Partial<Storage> = {
  key: undefined,
};

storage.update = (token: string | undefined) => {
  storage.updateCallback?.(token);
};

storage.revoke = () => {
  storage.key = undefined;
  storage.update?.(undefined);
};

export default storage as Storage;
