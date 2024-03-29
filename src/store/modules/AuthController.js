/* eslint-disable */
import firebase from "firebase/app";
import "firebase/auth";
import Cookies, { getJSON } from "js-cookie";
import axios from "axios";
import router from "../../router";

const API = "https://us-central1-itfreshy2020.cloudfunctions.net/";

const actions = {
  linkActions({ commit }, payload) {
    commit("user/setLink", payload, { root: true });
  },

  signProfile({ dispatch }) {
    firebase
      .auth()
      .getRedirectResult()
      .then(async (result) => {
        if (result.credential && firebase.auth().currentUser) {
            let token = await result.credential.accessToken;
            Cookies.set("user", token, {
              sameSite: "none",
              secure: true,
            });
        }
      })
      .catch((e) => {
        throw e;
      });
  },
  signInWithFB({ dispatch }) {
    if (!firebase.auth().currentUser) {
      dispatch("signProfile");

      let provider = new firebase.auth.FacebookAuthProvider();
      provider.addScope("public_profile");

      firebase.auth().signInWithRedirect(provider);
    } else {
      dispatch("signOut");
    }

    // return new Promise((resolve, reject) => {
    //   firebase
    //     .auth()
    //     .signInWithPopup(provider)
    //     .then((result) => {
    //       let token = result.credential.accessToken;
    //       Cookies.set("user", token, {
    //         sameSite: "none",
    //         secure: true,
    //       });
    //       if (result.credential.accessToken) {
    //         dispatch("setAuth", result.user.providerData[0]);
    //         dispatch("sendToken").then((res) => {
    //           if (res.data.data === "newuser") {
    //             router.go({ path: "/continue", params: { next: true } });
    //           } else {
    //             router.go({ path: "/profile", params: { next: "_self" } });
    //           }
    //         });
    //       }
    //       resolve(result);
    //     })
    //     .catch((e) => {
    //       reject(e);
    //     });
    // });
  },

  setAuth({ commit }, payload) {
    commit("user/setProfile", payload, {
      root: true,
    });
  },

  setNewUser({ state, commit }, payload) {
    commit("setFirstTime", payload, {
      root: false,
    });
  },

  setQr({ commit }, payload) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.getIdToken()
        .then((res) => {
          axios
            .post(API + "test/scan/" + payload, "", {
              headers: {
                FIREBASE_AUTH_TOKEN: res,
              },
            })
            .then((resData) => {
              resolve(resData.data);
              commit("setQrData", resData.data, { root: false });
            })
            .catch((e) => {
              reject(e);
              throw e;
            });
        });
    });
  },

  getToken() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.getIdToken()
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
          throw e;
        });
    });
  },

  sendToken({ commit, dispatch, getters }) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.getIdToken()
        .then((res) => {
          axios
            .get(API + "test/fire", {
              headers: {
                FIREBASE_AUTH_TOKEN: res,
              },
            })
            .then((result) => {
              localStorage.setItem(
                "firstTime",
                result.data.data === "newuser" ? true : false
              );

              if (result.data.data == "newuser") {
                dispatch(
                  "setAuth",
                  firebase.auth().currentUser.providerData[0],
                  { root: false }
                );
              } else {
                dispatch("setAuth", result.data.user, { root: false });
              }

              resolve(result);
            })
            .catch((e) => {
              reject(e);
            });
        });
    });
  },

  setProfile(context, payload) {
    context.commit("setProfile", payload, { root: false });
  },

  setAnswer({ getters }, payload) {
    let answer = JSON.stringify({ answer: payload });

    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.getIdToken()
        .then((res) => {
          axios
            .put(API + "/profile/answer", JSON.parse(answer), {
              headers: {
                FIREBASE_AUTH_TOKEN: res,
                id:
                  parseInt(getters.getProfile.year) === 1
                    ? getters.getProfile.uid
                    : getters.getQrData.uid,
                uid:
                  parseInt(getters.getProfile.year) === 1
                    ? getters.getQrData.uid
                    : getters.getProfile.uid,
                year: parseInt(getters.getProfile.year),
              },
            })
            .then((ans) => {
              resolve(ans);
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => {
          throw e;
        });
    });
  },

  async signOut(context) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then((res) => {
          Cookies.remove("user");
          localStorage.removeItem("firstTime");
          context.commit("clearProfile", { root: false });
          router.go({ path: "/signin", params: { ref: "none" } });
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
};

export default actions;
