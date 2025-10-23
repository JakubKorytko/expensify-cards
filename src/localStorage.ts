type LocalStorage = {
    softPromptAccepted: boolean | undefined;
};

const LOCAL_STORAGE: LocalStorage = {
    softPromptAccepted: undefined,
};

const localStorage = {
    set: (key: keyof LocalStorage, value: LocalStorage[typeof key]) => {
        LOCAL_STORAGE[key] = value;
    },
    get: (key: keyof LocalStorage): LocalStorage[typeof key] => {
        return LOCAL_STORAGE[key];
    },
};

export default localStorage;
