import { createStore } from "vuex";

export default createStore({
  state: {
    loggedIn: false,
    username: "",
    email: "",
  },
  getters: {
    isLoggedIn(state) {
      return state.loggedIn;
    },
    getUsername(state) {
      return state.username;
    },
    getEmail(state) {
      return state.email;
    },
  },
  mutations: {
    setLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn;
    },
    setUsername(state, username) {
      state.username = username;
    },
    setEmail(state, email) {
      state.email = email;
    },
  },
  actions: {},
  modules: {},
});
