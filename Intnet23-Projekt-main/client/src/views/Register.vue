<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="register()">
      <div
        class="alert alert-success text-center"
        role="alert"
        :hidden="!showScsMsg"
      >
        Successfully registered
      </div>
      <div
        class="alert alert-danger text-center"
        role="alert"
        :hidden="!showFailMsg"
      >
        Failed to register
      </div>

      <label for="name" class="form-label h4">Register</label>
      <input
        id="name"
        v-model="name"
        type="text"
        class="form-control mb-3"
        placeholder="Name"
        required
      />
      <input
        id="email"
        v-model="email"
        type="email"
        class="form-control mb-3"
        placeholder="exempel@exempel.com"
        required
      />
      <input
        id="password"
        v-model="password"
        type="password"
        class="form-control"
        placeholder="Password"
        required
      />
      <button type="submit" class="btn btn-dark mt-4 float-end">
        Register
      </button>
    </form>

    <div class="col"></div>
  </div>
</template>

<script>
export default {
  name: "RegisterView",
  components: {},
  data: () => ({
    showScsMsg: false,
    showFailMsg: false,
    email: "",
    name: "",
    password: "",
  }),
  methods: {
    register() {
      fetch("/api/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          username: this.name,
          password: this.password,
        }),
      })
        .then((res) => res.json())
        .then(({ registered }) => {
          this.showScsMsg = !!registered;
          this.showFailMsg = !registered;
        })
        .catch(console.error);
    },
  },
};
</script>

<style>
.text-center {
  text-align: center;
}
</style>
