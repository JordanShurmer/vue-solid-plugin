# Vue Solid Plugin

[![NPM Package](https://img.shields.io/npm/v/vue-solid-plugin.svg)](http://npmjs.com/package/vue-solid-plugin)

A set of Vue plugins/components for making [Solid](https://github.com/solid) app development easier.

* [Getting Started](#getting-started)
* [SolidAuth](#solidauth)
* [SolidLogin](#solidlogin)

# Getting Started

## Install

Install the npm package

```bash
npm install --save vue-solid-plugin
```

Add it to your vue app

```diff
// main.js
import Vue from 'vue';
import App from './App.vue';
+ import {SolidAuth, SolidLogin} from 'vue-solid-plugin';

+ Vue.use(SolidAuth);
+ Vue.component('SolidLogin', SolidLogin);

new Vue({
  render: h => h(App),
}).$mount('#app');

```

# Documentation

There are currently 2 features to this package. One adds the [`solid-auth-client`](https://github.com/solid/solid-auth-client) as an instance variable, and one provides a [renderless component](https://adamwathan.me/renderless-components-in-vuejs/) for making logging in easy.

## SolidAuth

```js
Vue.use(SolidAuth); // Adds `this.$solid` to your vue components
```

A Vue plugin which adds `$solid` to all of your components. `$solid` is a reference to the `solid.auth` object from [`solid-auth-client`](https://github.com/solid/solid-auth-client). This essentially saves you from doing `import solid from 'solid-auth-client'` in every component

```js
this.$solid.fetch('https://timbl.com/timbl/Public/friends.ttl')
  .then(console.log);
```

## SolidLogin

A [renderless component](https://adamwathan.me/renderless-components-in-vuejs/), providing an easy to use API for logging in/out of a Solid server. You provide the markup however you want to, using the data provided and calling the actions provided.

**Example:**

```vue
<SolidLogin popupUri="/popup.html">
    <div slot-scope="{ initializing, login, logout, loggedIn, webId }">
        <span v-if="webId">{{ webId }}</span>
        <button v-if="initializing">Loading...</button>
        <button v-else-if="loggedIn" @click="logout()">Log out</button>
        <button v-else @click="login()">Log In</button>
    </div>
</SolidLogin
```

### Props

* `popupUri`: the uri to the popup html page for logging in ([generate](https://solid.github.io/solid-auth-client/#generating-a-popup-window) your own, or maybe grab [solid.community's](https://solid.community/common/popup.html) and serve it on your domain)

### Data

* `initializing`: true if the `solid-auth-client` has not checked for any login status yet (i.e. it's still initializing). Provide a loading gif or something
* `loggedIn`: true if logged in, false otherwise
* `webId`: the webId of the logged in person, or an empty string

### Actions

* `login()`: call this method when you want to invoke the login process (i.e. the popupUri)
* `logout()`: call this method when you want to logout


# ToDo

Ideas for how to keep adding to this

- [ ] Improve `this.$solid`: Rather a direct reference to `solid-auth-client` make it a wrapper for other useful things
  - auth client still available through `this.$solid.auth`
  - logged in status `this.$solid.loggedIn`
  - web id of logged in user `this.$solid.webId`
- [ ] A way to easily map component data to RDF data
- [ ] More components?