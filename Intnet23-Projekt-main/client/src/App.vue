<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <button
      class="navbar-toggler mx-2 mb-2"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div id="navbarNav" class="collapse navbar-collapse mx-2">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a
            class="nav-link"
            href="#"
            :hidden="loggedIn"
            @click="redirect('/login')"
            >Login</a
          >
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            href="#"
            :hidden="!loggedIn"
            @click="redirect('/admin')"
            >Profile</a
          >
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            href="#"
            :hidden="loggedIn"
            @click="redirect('/register')"
            >Register</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/listings')"
            >Listings</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" :hidden="!loggedIn" @click="logoutACB()"
            >Logout</a
          >
        </li>
      </ul>
    </div>
  </nav>
  <section class="container-fluid py-4">
    <router-view />
  </section>
</template>

<script>
// @ is an alias to /src
import "bootstrap";
import { watchEffect } from "vue";
import io from "socket.io-client";

export default {
  name: "App",
  components: {},
  data: () => ({
    loggedIn: false,
    socket: io().connect(),
  }),
  mounted() {
    const { commit, getters } = this.$store;
    const { push } = this.$router;

    commit("setLoggedIn", false);
    push(getters.isLoggedIn === true ? "/admin" : "/login");

    watchEffect(this.fetchLoggedInACB);
  },
  methods: {
    redirect(target) {
      this.$router.push(target);
    },
    fetchLoggedInACB() {
      this.loggedIn = this.$store.state.loggedIn;
    },
    logoutACB() {
      const { commit } = this.$store;
      fetch("/api/logout");
      commit("setLoggedIn", false);
      commit("setUsername", "");
      commit("setEmail", "");
      this.redirect("/login");
    },
  },
};
</script>

<style>
@import url("bootstrap/dist/css/bootstrap.css");

html,
body {
  /* https://designs.ai/colors */
  background-color: #fff;
}
</style>
