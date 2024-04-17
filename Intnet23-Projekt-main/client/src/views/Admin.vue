<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="row">
    <div class="profile">
      <label for="username" class="text-center-title">
        <h3>{{ $store.state.username }}</h3></label
      >

      <div
        class="alert alert-success text-center"
        role="alert"
        :hidden="!showScsMsg"
      >
        Listing created
      </div>
      <div
        class="alert alert-danger text-center"
        role="alert"
        :hidden="!showFailMsg"
      >
        Unable to create listing
      </div>

      <div class="mt-3">
        <h3>Create listing</h3>
        <form ref="form" @submit.prevent="createListing()">
          <div class="mb-3">
            <input
              id="listingName"
              v-model="listingName"
              type="text"
              class="form-control"
              placeholder="Listing Name"
              required
            />
          </div>
          <div class="mb-3">
            <textarea
              id="description"
              v-model="description"
              type="text"
              class="form-control"
              placeholder="Description"
              required
            />
          </div>
          <div class="mb-3">
            <input
              id="price"
              v-model="price"
              type="number"
              class="form-control"
              placeholder="Price"
              required
            />
          </div>
          <div class="mb-3">
            <input
              id="image"
              type="file"
              accept="image/*"
              class="form-control"
              placeholder="Image"
              required
              @change="imageChange"
            />
          </div>
          <button type="submit" class="btn btn-dark mt-4 float-end">
            Create listing
          </button>
        </form>
      </div>

      <div
        class="alert alert-success text-center"
        role="alert"
        :hidden="!showRemScsMsg"
      >
        Removed listing
      </div>
      <div
        class="alert alert-danger text-center"
        role="alert"
        :hidden="!showRemFailMsg"
      >
        Failed to remove listing
      </div>

      <h3 class="mt-3 mb-3">Your listings</h3>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Buyer</th>
            <th scope="col" class="float-end">Remove listing</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="listing in ownedListings" :key="listing.id">
            <td>{{ listing.name }}</td>
            <td>
              {{
                listing.buyer ? `Bought by ${listing.buyer}` : "Not bought yet"
              }}
            </td>
            <td>
              <button
                type="button"
                class="btn btn-dark float-end"
                @click="clickRemoveACB(listing.id)"
              >
                Remove Listing
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <h3 class="mt-3 mb-3">Bought listings</h3>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Descriptiom</th>
            <th scope="col">Price</th>
            <th scope="col">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="listing in boughtListings" :key="listing.id">
            <td>Name: {{ listing.name }}</td>
            <td>Description: {{ listing.description }}</td>
            <td>Price: {{ listing.price }}</td>
            <td>Seller email: {{ listing.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  time: "AdminView",
  components: {},
  data: () => ({
    listings: [],
    showScsMsg: false,
    showFailMsg: false,
    listingName: "",
    description: "",
    price: null,
  }),
  computed: {
    ownedListings() {
      return this.listings.filter(
        (listing) => listing.email === this.$store.state.email
      );
    },
    boughtListings() {
      return this.listings.filter(
        (listing) => listing.buyer === this.$store.state.email
      );
    },
  },
  mounted() {
    fetch("/api/getUser")
      .then((res) => res.json())
      .then(({ username, email }) => {
        if (username !== undefined && email !== undefined) {
          const { commit } = this.$store;
          commit("setLoggedIn", true);
          commit("setEmail", email);
          commit("setUsername", username);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data", error);
      });

    this.fetchListings();

    // socket
    const { socket } = this.$root;
    socket.on("listings", (listings) => {
      this.listings = listings;
    });
  },
  methods: {
    fetchListings() {
      fetch("/api/listings")
        .then((res) => res.json())
        .then(({ listings }) => {
          this.listings = listings;
        })
        .catch(console.error);
    },
    createListing() {
      const jsonData = {
        listingName: this.listingName,
        description: this.description,
        price: this.price,
      };
      this.formData.append("jsonData", JSON.stringify(jsonData));

      fetch("/api/createListing", {
        method: "POST",
        body: this.formData,
      })
        .then((res) => {
          this.showScsMsg = !!res.ok;
          this.showFailMsg = !res.ok;
          this.showRemScsMsg = false;
          this.showRemFailMsg = false;
          if (res.ok) {
            this.listingName = "";
            this.description = "";
            this.price = null;
            this.$refs.form.reset();
          }
        })
        .catch(console.error);
    },
    clickRemoveACB(key) {
      fetch(`/api/removeListing`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: key }),
      })
        .then((res) => {
          this.showRemScsMsg = !!res.ok;
          this.showRemFailMsg = !res.ok;
          this.showFailMsg = false;
          this.showScsMsg = false;
        })
        .catch(console.error);
    },
    imageChange(e) {
      if (!e.target.files.length) return;
      const file = e.target.files[0];
      this.formData = new FormData();
      this.formData.append("myImage", file);
    },
  },
};
</script>

<style>
.text-center-title {
  text-align: center;
  font-size: xx-large;
  font-weight: bold;
}

.text-center {
  text-align: center;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.profile {
  display: flex;
  flex-direction: column;
  width: 70%;
}
</style>
