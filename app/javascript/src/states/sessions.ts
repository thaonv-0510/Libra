import { atom } from "recoil";

export const accessTokenAtom = atom({
  key: 'accessToken',
  default: '',
})

export const currentUserAtom = atom({
  key: 'currentUser',
  default: null,
})
