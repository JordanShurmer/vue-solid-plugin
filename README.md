# Vue Solid Plugin

[![NPM Package](https://img.shields.io/npm/v/vue-solid-plugin.svg)](http://npmjs.com/package/vue-solid-plugin)

A set of Vue plugins/components for making [Solid](https://github.com/solid) app development easier.

* [Getting Started](#getting-started)
* [Solid Login component](#solidlogin)
* [Populating data in your component](#populating-data)
* [New **loggedIn** lifecycle hook](#loggedin-lifecycle-hook)
* [Accessing the solid-auth-client](#solid-auth-client)
* [Accessing the query-ldflex api](#query-ldflex)

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
+ import {Solid, SolidLogin} from 'vue-solid-plugin';

+ Vue.use(Solid);
+ Vue.component('SolidLogin', SolidLogin);

new Vue({
  render: h => h(App),
}).$mount('#app');

```

# Documentation

This plugin does a few different things to help write good Solid applications.


**Features**

* a [renderless component](https://adamwathan.me/renderless-components-in-vuejs/) for making logging in easy called `<SolidLogin>`
* pre-load user data in a component using a new `solid` attribute when defining your component
* **loggedIn** lifecycle hook, to run code after the user logs in
* access to the [solid-auth-client] at `this.$solid.auth`
* access to the [query-ldflex] api at `this.$solid.data`

## SolidLogin

A [renderless component](https://adamwathan.me/renderless-components-in-vuejs/), providing an easy to use API for logging in/out of a Solid server. You provide the markup however you want to, using the data provided and calling the actions provided.


[view src](./solid-login.js)

**Example:**

```vue
<SolidLogin popupUri="/popup.html">
    <div slot-scope="{ initializing, login, logout, loggedIn, webId }">
        <span v-if="webId">{{ webId }}</span>
        <button v-if="initializing">Loading...</button>
        <button v-else-if="loggedIn" @click="logout()">Log out</button>
        <button v-else @click="login()">Log In</button>
    </div>
</SolidLogin>
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

## Populating Data

If your component needs data from solid you can specify it in the definition of your component and the plugin will populate
it asynchronously, providing your template access to it, the same as `data` and `computed`.

**note: currently only the `user` object is available. Still working on populating arbitrary data. For now, use the [loggedIn](#loggedin-lifecycle-hook) lifecycle hook and access data through `this.$solid.data`**

_another note: This is likely to change, it works.. but feels a little off still_

```diff
//your-component.vue
export default {
  name: 'YourComponent',
  data: ...,
  methods: ...,
+  solid: {
+    user: {
+      name: '' //provide a default/initial value
+    }
+  }
}
```

## `loggedIn` lifecycle hook

This new lifecycle hook will execute after the user logs in and the `solid` data defined above have been populated.

```js
//you-component.vue
export default {
  name: 'YourComponent',
  data: {
    moreData: null, //initial value, will populate when the user logs in
  }
  methods: ...,
  solid: ...,
  loggedIn() {
    this.moreData = await this.$data['some-url-with#more-data']['somepredicate']
  }
}
```

## Solid Auth Client

A reference to the `solid.auth` object from [solid-auth-client] is availabe at `this.$solid.auth`. This essentially saves you from doing `import auth from 'solid-auth-client'` in every component.

```js
this.$solid.auth.fetch('https://timbl.com/timbl/Public/friends.ttl')
  .then(console.log);
```

## Query LDFlex

A reference to the `data` object from [query-ldflex] is available at `this.$solid.data`. This essentially saves you from doing `import data from 'query-ldflex'` in every component.

```js
this.$solid.data['https://ruben.verborgh.org/profile/#me'].friends.firstName
```


# ToDo

Ideas for how to keep adding to this

- [ ] Improve `this.$solid`: Rather a direct reference to `solid-auth-client` make it a wrapper for other useful things
  - auth client still available through `this.$solid.auth`
  - logged in status `this.$solid.loggedIn`
  - web id of logged in user `this.$solid.webId`
- [ ] A way to easily map component data to RDF data
  - Perhaps [LDFlex](https://github.com/RubenVerborgh/LDflex) / [query-ldflex] for solid
- [ ] More components?

[solid-auth-client]: https://github.com/solid/solid-auth-client 'Solid Auth Client'
[query-ldflex]: https://github.com/solid/query-ldflex 'Query LDFlex'