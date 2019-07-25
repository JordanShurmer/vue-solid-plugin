# Vue Solid Plugin

[![Project Solid](https://img.shields.io/badge/project-Solid-7C4DFF.svg?style=flat-square)](https://github.com/solid/solid)
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
* pre-load user data (and other data with known subjects) new `solid` attribute when defining your component
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
        <button v-if="initializing">Loading...</button>
        <button v-else-if="loggedIn" @click="logout()" :title="webId">Log out</button>
        <button v-else @click="login()">Log In</button>
    </div>
</SolidLogin>
```

For more info about renderless components, check out this [excellent article](https://adamwathan.me/renderless-components-in-vuejs/).

### Props

You provide the properties on the component itself, passing in data to the SolidLogin component

* `popupUri` <small>required</small>: the uri to the popup html page for logging in. ([Generate](https://solid.github.io/solid-auth-client/#generating-a-popup-window) your own, or maybe grab [solid.community's](https://solid.community/common/popup.html) and serve it on your domain)

### Data

This info is given to you in the default slot scope. You can destructure the object, as in the example above.

* `initializing`: true if the `solid-auth-client` has not checked for any login status yet (i.e. it's still initializing). Provide a loading gif or something
* `loggedIn`: true if logged in, false otherwise
* `webId`: the webId of the logged in person, or an empty string

### Actions

These methods are given to you in the default slot scope. You can destructure the object, as in the example above.

* `login()`: call this method when you want to invoke the login process (i.e. the popupUri)
* `logout()`: call this method when you want to logout

## Populating Data

If your component needs data from solid you can specify it in the definition of your component and the plugin will populate it **asynchronously**, providing your template access to it as if it were in `data` or `computed`.

You define where the data comes from (the **subject**) and what data pieces you want about that subject (the **propeties**). An exception to this is the `user` - for this you only need to define what data you want about the user, no need to specify the subject.

The **properties** you specify can be either a _string_ or an _object.

* _String_ properties get resolved directly using the data available for the subject. They can be anything which [query-ldflex] understands: anything from their [context](https://github.com/solid/query-ldflex/blob/master/src/context.json), or any full url (e.g. `https://schema.org/description`)
* _Object_ properties let you populate data coming from the subject's [**Type Index**](https://github.com/solid/solid/blob/master/proposals/data-discovery.md). You must specify the _type_ you're looking for, and what _properties_ you care about on that type.


```diff
//your-component.vue
<template>
  <span class="user__name">{{ user.name }}</span>
  <span class="other__thing">{{ other.thing }}</span>
  <ul>
    <li v-for="bookmark in user.bookmarks">
      <a :href="bookmark.link">{{ bookmark.title }}</a>
    </li>
</template>
<script>
export default {
  name: 'YourComponent',
  data: ...,
+  solid: {
+    user: { //user is sepcial, no need to specify a 'subject', just specify the data
+      name: 'name',
+      title: 'foaf:title',
+      bookmarks: {
+        'type': 'http://www.w3.org/2002/01/bookmark#Bookmark',
+        properties: {
+          link: "http://www.w3.org/2002/01/bookmark#recalls",
+          title: "terms:title",
+        },
+      },
+    },
+    other: {
+      subject: 'http://some-other-url.to#a-thing',
+      properties: { 
+        description: 'schema:description',
+        bookmarks: {
+          'type': 'http://www.w3.org/2002/01/bookmark#Bookmark',
+          properties: {
+            link: "http://www.w3.org/2002/01/bookmark#recalls",
+            title: "terms:title",
+          },
+        },
+      }
+    }
+  }
}
</script>
```

## `loggedIn` lifecycle hook

This new lifecycle hook will execute after the user logs in and the `solid` data defined above have been populated.

One good use for this is to load arbitrary data which requires the user to be logged in. You can use the [query-ldflex] api for this, which is available at `this.$solid.data`.

```vue
//your-component.vue
<template>
  <span class="more-data">{{ moreData }}</span>
</template>
<script>
export default {
  name: 'YourComponent',
  data: {
    moreData: null, //initial value, will populate when the user logs in
  },
  solid: {...},
  async loggedIn() {
    this.moreData = await this.$solid.data['some-rdf-url-with#more-data']['somepredicate']
  }
}
</script>
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
console.log(await this.$solid.data['https://ruben.verborgh.org/profile/#me'].friends.firstName);
```



[solid-auth-client]: https://github.com/solid/solid-auth-client 'Solid Auth Client'
[query-ldflex]: https://github.com/solid/query-ldflex 'Query LDFlex'
