<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="row">
    <div class="col"></div>
    <div class="col list-group">
      <div
        class="alert alert-success text-center"
        role="alert"
        :hidden="!showMsg"
      >
        {{ msg }}
      </div>

      <div
        v-for="listing in availableListings"
        :key="listing.id"
        class="card mb-3"
      >
        <img
          :src="`https://92.244.8.16:8989/images/${listing.img}`"
          class="card-img-top"
          alt=""
        />
        <div class="card-body">
          <h4 class="card-title">{{ listing.name }}</h4>
          <h5 class="card-title">Seller: {{ listing.email }}</h5>
          <p class="card-text">Price: {{ listing.price }} kr</p>
          <p class="card-text">{{ listing.description }}</p>
          <button
            type="button"
            :hidden="loggedIn"
            class="btn btn-primary"
            @click="redirectLogin()"
          >
            Log in to buy
          </button>
          <button
            type="button"
            :hidden="!loggedIn"
            class="btn btn-primary"
            @click="buy(listing.id)"
          >
            Buy
          </button>
          <p>{{ msg }}</p>
        </div>
      </div>
    </div>
    <div class="col"></div>
  </div>
</template>
<script>
export default {
  name: "ListingsView",
  components: {},
  data: () => ({
    listings: [],
    loggedIn: false,
    showMsg: false,
  }),
  computed: {
    availableListings() {
      return this.listings.filter((listing) => !listing.buyer);
    },
  },
  mounted() {
    const { commit } = this.$store;
    // Fetch listings
    fetch("/api/listings")
      .then((res) => res.json())
      .then(({ listings }) => {
        this.listings = listings;
      })
      .catch(console.error);

    // Fetch whether logged in
    fetch("/api/getUser").then((res) => {
      this.loggedIn = res.ok;
      commit("setLoggedIn", res.ok);
    });

    // Set up socket to receive changes in listings
    const { socket } = this.$root;
    socket.on("listings", (listings) => {
      this.listings = listings;
    });
  },
  methods: {
    buy(id) {
      // Buy listing
      fetch(`/api/buyListing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      })
        .then((res) => {
          if (res.ok) {
            this.msg = "Bought listing!";
            this.showMsg = true;
          } else {
            this.msg = "Failed to buy listing!";
          }
        })
        .catch(console.error);
    },
    redirectLogin() {
      this.$router.push(`/login`);
    },
  },
};
</script>

<style>
.text-center {
  text-align: center;
}
</style>
