<template>
  <div id="app" v-lazy:background-image="bgObj">
    <Nav v-if="showNav" />
    <transition name="animated">
      <keep-alive max="12">
        <router-view :key="$route.fullPath" />
      </keep-alive>
    </transition>
    <div v-if="!online" @change="alertThis()"></div>
    <div
      class="signout_btn"
      @click="signOut"
      v-if="$route.matched.some(({ path }) => path == '/continue')"
    >
      <ion-icon name="log-out-outline"></ion-icon>
    </div>
  </div>
</template>
<script>
//import Footer from "@/components/util/Footer.vue";
import Nav from "@/components/util/Nav.vue";
import alertify from "alertifyjs";
import { mapActions } from "vuex";
import "aos/dist/aos.css";

export default {
  data() {
    return {
      showNav: true,
      bgObj: {
        src: "/img/bg1.jpg"
      },
      online: navigator.onLine,
      showOnline: false
    };
  },
  mounted() {
    window.addEventListener("online", this.updateNwStatus);
    window.addEventListener("offline", this.updateNwStatus);
  },
  beforeDestroy() {
    window.removeEventListener("online", this.updateNwStatus);
    window.removeEventListener("offline", this.updateNwStatus);
  },
  watch: {
    "$route.meta.hideNavigation": function(hideNavigation) {
      this.showNav = !hideNavigation;
    },
    /* eslint-disable */
    $route(to, from) {
      document.title = to.meta.title || "IT HUNTER 2020";
    },
    online(v) {
      if (v) {
        this.showOnline = true;
        setTimeout(() => {
          this.showOnline = false;
        }, 1000);
      }
    }
  },
  methods: {
    ...mapActions("user", ["signOut"]),
    setNav(status) {
      this.showNav = status;
    },
    updateNwStatus(e) {
      const { type } = e;
      this.online = type === "online";
    },
    alertThis() {
      return alertify.notify("ขาดการเชื่อมต่อ, Network Error", "error", 3);
    }
  },

  components: {
    Nav
  }
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Prompt:wght@100;200;300;400&family=Roboto:wght@300;400;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Righteous&display=swap");

html,
body {
  @apply h-full;
}

#app {
  font-family: "Righteous","Prompt",  Helvetica, cursive;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  word-spacing: 1px;
  letter-spacing: 0.8px;
  color: #2c3e50;
  background-repeat: no-repeat;
  background-position: center top;
  background-attachment: fixed;
  background: linear-gradient(270deg, #33deb2, #7295d3, #dc9b62);
  background-size: 600% 600%;
  -webkit-animation: bgTransition 3s ease infinite;
  -moz-animation: bgTransition 3s ease infinite;
  animation: bgTransition 3s ease infinite;
  overflow: hidden;
  @apply min-h-full;
}

#app[lazy="loading"] {
  background: linear-gradient(119deg, #79c3c3, #524cb6, #ec920f);
  background-size: 600% 600%;
  -webkit-animation: bgTransition 3s ease infinite;
  -o-animation: bgTransition 3s ease infinite;
  -moz-animation: bgTransition 3s ease infinite;
  animation: bgTransition 3s ease infinite;
}

#app[lazy="loaded"] {
  background: no-repeat fixed bottom center / cover;
  animation: none !important;
}

.signout_btn {
  bottom: 1.5rem;
  right: 1.5rem;
  @apply fixed flex flex-col justify-center cursor-pointer font-bold items-center z-30  w-12 h-12 rounded-full bg-primary-400 text-primary-100 text-center p-3;
}

@-webkit-keyframes bgTransition {
  0% {
    background-position: 97% 0%;
  }
  50% {
    background-position: 4% 100%;
  }
  100% {
    background-position: 97% 0%;
  }
}
@-moz-keyframes bgTransition {
  0% {
    background-position: 97% 0%;
  }
  50% {
    background-position: 4% 100%;
  }
  100% {
    background-position: 97% 0%;
  }
}
@-o-keyframes bgTransition {
  0% {
    background-position: 97% 0%;
  }
  50% {
    background-position: 4% 100%;
  }
  100% {
    background-position: 97% 0%;
  }
}
@keyframes bgTransition {
  0% {
    background-position: 97% 0%;
  }
  50% {
    background-position: 4% 100%;
  }
  100% {
    background-position: 97% 0%;
  }
}

.hover\:shadow-outline:hover {
  box-shadow: 0 0 0 3px rgba(49, 40, 207, 0.8) !important;
}

.loading {
  font-size: 1rem;
  font-weight: 500;
  font-family: Kanit;
}

.loading:after {
  content: " .";
  animation: dots 1s steps(5, end) infinite;
}

@keyframes dots {
  0%,
  20% {
    color: rgb(23, 19, 98);
    text-shadow: 0.25em 0 0 rgb(23, 19, 98), 0.5em 0 0 rgb(23, 19, 98);
  }

  40% {
    color: #a8a5da;
    text-shadow: 0.25em 0 0 rgb(23, 19, 98), 0.5em 0 0 rgb(23, 19, 98);
  }

  60% {
    text-shadow: 0.25em 0 0 #a8a5da, 0.5em 0 0 rgb(23, 19, 98);
  }

  80%,
  100% {
    text-shadow: 0.25em 0 0 #a8a5da, 0.5em 0 0 #a8a5da;
  }
}

.main-wrap {
  background-image: linear-gradient(
    to top,
    rgba(11, 9, 49, 0.9) 45%,
    transparent 70%
  );
  @apply overflow-hidden pb-12;
}

>>> .text-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

button:focus {
  outline: 0 !important;
}

.lucky-font {
  font-family: "Luckiest Guy";
}

.animated-enter-active {
  transition: all 0.3s ease;
}
.animated-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.animated-enter,
.animated-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.alertify .ajs-dialog {
  top: 50%;
  transform: translateY(-50%);
  margin: auto;
}
.alertify .ajs-body .ajs-content {
  padding: 0 !important;
}

.tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  border-radius: 16px;
  padding: 0.4rem 1rem;
  font-family: "Prompt";
  word-wrap: break-word;
  word-break: break-word;
  max-width: 300px;
  @apply bg-primary-1100 bg-opacity-75 text-primary-200;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
  z-index: 1;
}

.tooltip[aria-hidden="false"] {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip.popover .popover-inner {
  @apply bg-primary-1100 text-secondary_b border-secondary_b border-2 mx-2;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(black, 0.1);
}

.tooltip.popover .popover-arrow {
  @apply border-secondary_b;
}
</style>
