/* eslint-disable */
import axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";
//import { reject } from "core-js/fn/promise";
//import { reject } from "core-js/fn/promise";

const API = "https://us-central1-itfreshy2020.cloudfunctions.net/";

const state = () => ({
  profileField: {
    stdId: null,
    firstName: null,
    surname: null,
    nickname: null,
    age: null,
    religion: null,
    gender: null,
    branch: null,
    year: null,
    contact: null,
    player: null,
    likes: [
      { car: false },
      { song: false },
      { movie: false },
      { coding: false },
    ],
  },
});

const getters = {
  getProfile: (state) => {
    return state.profileField;
  },
  getYear: (state) => {
    return state.profileField.year;
  },
  getFirstStep: (state) => {
    return (
      state.profileField.branch,
      state.profileField.year,
      state.profileField.contact,
      state.profileField.age,
      state.profileField.religion
    );
  },
  getSecondStep: (state) => {
    return (
      state.profileField.firstName,
      state.profileField.surname,
      state.profileField.nickname,
      state.profileField.stdId
    );
  },
  getGender: (state) => {
    return state.profileField.gender;
  },
};

const mutations = {
  setGender: (state, gender) => {
    state.profileField.gender = gender;
  },
  setFirstStep: (state, payload) => {
    state.profileField.branch = payload.branch;
    state.profileField.year = payload.year;
    state.profileField.contact = payload.contact;
    state.profileField.age = payload.age;
    state.profileField.religion = payload.religion;
  },
  setSecondStep: (state, payload) => {
    state.profileField.firstName = payload.firstName;
    state.profileField.surname = payload.Surname;
    state.profileField.nickname = payload.Nickname;
    state.profileField.stdId = payload.id;
    state.profileField.player = payload.player;
  },
  setProfile: (state, profile) => {
    state.profileField = profile;
  },
};

const actions = {
  setGender({ commit }, gender) {
    commit("setGender", gender);
  },

  setFirstStep({ commit }, payload) {
    commit("setFirstStep", payload);
  },

  setSecond({ commit }, payload) {
    commit("setSecondStep", payload);
  },

  setProfile({ commit }, payload) {
    commit("setProfile", payload);
  },

  sendForm({ commit, getters, dispatch }) {
    //let form = new FormData();
    let data = new Array();

    if (parseInt(getters.getProfile.year) !== 2) {
      data = {
        id: getters.getProfile.stdId,
        fname: getters.getProfile.firstName,
        surname: getters.getProfile.surname,
        nickname: getters.getProfile.nickname,
        age: getters.getProfile.age,
        sex: getters.getProfile.gender,
        religion: getters.getProfile.religion,
        branch: getters.getProfile.branch,
        year: getters.getProfile.year,
        contact: getters.getProfile.contact,
        like: null,
      };
    } else {
      data = {
        id: getters.getProfile.stdId,
        fname: getters.getProfile.firstName,
        surname: getters.getProfile.surname,
        nickname: getters.getProfile.nickname,
        age: getters.getProfile.age,
        sex: getters.getProfile.gender,
        religion: getters.getProfile.religion,
        branch: getters.getProfile.branch,
        year: getters.getProfile.year,
        contact: getters.getProfile.contact,
        player: getters.getProfile.player,
        like: null,
      };
    }

    // if (parseInt(getters.getProfile.year) !== 2) {
    //   form.append("id", getters.getProfile.stdId);
    //   form.append("fname", getters.getProfile.firstName);
    //   form.append("surname", getters.getProfile.surname);
    //   form.append("nickname", getters.getProfile.nickname);
    //   form.append("age", getters.getProfile.age);
    //   form.append("sex", getters.getProfile.gender);
    //   form.append("religion", getters.getProfile.religion);
    //   form.append("branch", getters.getProfile.branch);
    //   form.append("year", getters.getProfile.year);
    //   form.append("contact", getters.getProfile.contact);
    //   form.append("like", null);
    // } else {
    //   form.append("id", getters.getProfile.stdId);
    //   form.append("fname", getters.getProfile.firstName);
    //   form.append("surname", getters.getProfile.surname);
    //   form.append("nickname", getters.getProfile.nickname);
    //   form.append("age", getters.getProfile.age);
    //   form.append("sex", getters.getProfile.gender);
    //   form.append("religion", getters.getProfile.religion);
    //   form.append("branch", getters.getProfile.branch);
    //   form.append("year", getters.getProfile.year);
    //   form.append("contact", getters.getProfile.contact);
    //   form.append("player", getters.getProfile.player);
    //   form.append("like", null);
    // }

    return new Promise((resolve, reject) => {
      try {
        firebase
          .auth()
          .currentUser.getIdToken()
          .then((res) => {
            axios
              .post("/profile/create", data, {
                headers: {
                  'uid': firebase.auth().currentUser.uid,
                  'FIREBASE_AUTH_TOKEN': res,
                  'Content-Type': 'application/json'
                },
              })
              .then((result) => {
                if (result) {
                  dispatch("setProfile", result);
                  resolve(result);
                }
              })
              .catch((e) => {
                console.log(e);
                reject(e);
              });
          });
      } catch (e) {
        console.log(e);
      }
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
