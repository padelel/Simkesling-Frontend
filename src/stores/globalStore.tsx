// // export const useUserLoginStore = create<MUser>((set) => ({
// //   ...tmpUserLogin,
// //   userLogin: (payload: MUser) => {
// //     // kosongin dulu semua
// //     set(cloneDeep(tmpUserLogin));

import cloneDeep from "clone-deep";
import { create } from "zustand";

//     // set ulang datanya dari payload
//     set({ ...payload });
//   },
// }));
interface MGlobal {
  isloading: boolean;
  setLoading?: Function;
}
let tmpGlobal = {
  isloading: false,
};
export const useGlobalStore = create<MGlobal>((set) => ({
  ...tmpGlobal,
  setLoading: (isloading: boolean) => {
    // kosongin dulu semua
    // set(cloneDeep(tmpGlobal));

    // set ulang datanya dari payload
    set({ isloading });
  },
}));

// import { create } from "zustand";

// const useGlobalStore = create((set) => ({
//   loading: false,
//   setLoading: (loading: any) => set({ loading }),
// }));

// export { useGlobalStore };
