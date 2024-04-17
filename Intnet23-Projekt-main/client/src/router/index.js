import { createRouter, createWebHistory } from "vue-router";
import store from "../store/index";
import Login from "../views/Login.vue";
import Admin from "../views/Admin.vue";
import Listings from "../views/Listings.vue";
import Listing from "../views/Listing.vue";
import Register from "../views/Register.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/admin",
    component: Admin,
  },

  {
    path: "/listings",
    component: Listings,
  },

  {
    path: "/listings/:id",
    component: Listing,
  },

  {
    path: "/register",
    component: Register,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Setup authentication guard.
router.beforeEach((to, from, next) => {
  if (store.state.loggedIn && to.path === "/login") {
    console.info("Authenticated user. Redirect to admin page");
    next("/admin");
  } else if (!store.state.loggedIn && to.path === "/admin") {
    console.info("Unauthenticated user. Redirecting to login page.");
    next("/login");
  } else {
    next();
  }
});

export default router;
