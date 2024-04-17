<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="authenticate()">
      <div
        class="alert alert-danger text-center"
        role="alert"
        :hidden="!showFailMsg"
      >
        Failed to login
      </div>

      <label for="username" class="form-label h4">Please sign in</label>
      <input
        id="email"
        v-model="email"
        type="email"
        class="form-control mb-3"
        placeholder="exempel@exempel.com"
      />
      <input
        id="password"
        v-model="password"
        type="password"
        class="form-control"
        placeholder="password"
      />
      <button type="submit" class="btn btn-dark mt-4 float-end">Sign in</button>
    </form>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  components: {},
  data: () => ({
    showFailMsg: false,
    email: "",
    password: "",
  }),
  mounted() {
    fetch("/api/getUser")
      .then((res) => res.json())
      .then(({ username, email }) => {
        if (username !== undefined && email !== undefined) {
          const { commit } = this.$store;
          const { push } = this.$router;
          commit("setLoggedIn", true);
          commit("setEmail", email);
          commit("setUsername", username);
          push("/admin");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data", error);
      });
  },
  methods: {
    authenticate() {
      const { commit } = this.$store;
      const { push } = this.$router;

      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.email, password: this.password }),
      })
        .then((res) => res.json())
        .then(({ authenticated }) => {
          if (authenticated) {
            commit("setLoggedIn", true);
            commit("setEmail", this.email);
            push(authenticated ? "/admin" : "/login");
          } else {
            this.showFailMsg = true;
          }
        })
        .catch(console.error);
    },
  },
};
</script>
