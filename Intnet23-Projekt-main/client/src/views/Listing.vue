<template>
  <div class="row">
    <div class="col-3"></div>
    <ul class="col-6 list-group">
      <h1>{{ listing.listingName }}</h1>
      <p>Price: {{ listing.price }}</p>
      <p>{{ listing.description }}</p>
      <button type="button" @click="buy()">Buy</button>
      {{
        msg
      }}
    </ul>
    <div class="col-3"></div>
  </div>
</template>

<script>
export default {
  name: "ListingView",
  components: {},
  data() {
    return {
      id: this.$route.params.id,
      msg: "",
    };
  },
  async mounted() {
    const res = await fetch(`/api/listing/${this.id}`);
    const { listing } = await res.json();
    this.listing = listing;

    // const { socket } = this.$root;
  },
  methods: {
    buy() {
      // Köpa
      fetch(`/api/buyListing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: this.id }),
      })
        .then((res) => res.json())
        .then(({ msg }) => {
          this.msg = msg;
        })
        .catch(console.error);
    },
  },
};
</script>
