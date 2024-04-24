import {writable} from "svelte/store";
import {Token} from "$models/Token";
import LocalStorageService from "$services/localstore.service";

export const newmeme = writable(new Token());

export const saveNewMeme = () => newmeme.update(x => {
    LocalStorageService.set('newmeme', x);
    return x;
})
