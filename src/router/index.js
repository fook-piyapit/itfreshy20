/* eslint-disable prettier/prettier */
import Vue from "vue";
import VueRouter from "vue-router";
//import { urlencoded } from "express";

/* Declare and import routes */
const Dashboard = () => import("../views/Dashboard.vue");
const Login = () => import("../views/Login.vue");

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    redirect: '/login',
    meta: {
      title: "IT FRESHY 2020",
      metaTags: [
        {
          name: "description",
          content: "For IT KMITL Freshy 17th only",
        },
      ],
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: "Sign In | IT FRESHY 2020",
      metaTags: [
        {
          name: "description",
          content: "Sign in page for IT KMITL Freshy 17th only",
        },
      ],
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const nearestTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  const nearestMeta = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);

  // const prevNearestMeta = from.matched
  //   .slice()
  //   .reverse()
  //   .find((r) => r.meta && r.meta.metaTags);

  if (nearestTitle) document.title = nearestTitle.meta.title;

  Array.from(
    document.querySelectorAll("[data-vue-router-controlled]")
  ).map((el) => el.parentNode.removeChild(el));

  if (!nearestMeta) return next();

  nearestMeta.meta.metaTags
    .map((tagDef) => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key]);
      });

      tag.setAttribute("data-vue-router-controlled", "");

      return tag;
    })

    .forEach((tag) => document.head.appendChild(tag));

  next();
});

export default router;
