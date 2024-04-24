
export default class LocalStorageService {
    static get(key: string){
        try {
            return JSON.parse(localStorage.getItem(key) as string);
        } catch (e) {
            return localStorage.getItem(key);
        }
    }

    static set(key: string, value: any){
        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
    }

    static remove(key: string){
        localStorage.removeItem(key);
    }
};
