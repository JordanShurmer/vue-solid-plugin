/**
 * A Vue Plugin which adds functionality
 * to the Vue instance to make it easier
 * to develop Solid applications
 */
import auth from 'solid-auth-client';
import solidData from '@solid/query-ldflex';
import TypeIndex from './typeindex';

/**
 * @param {function} callback code to execute once the user is logged in, or immediately if they already are
 */
async function onLogin(callback) {
  const session = await auth.currentSession();
  if (session) {
    callback(session);
  } else {
    auth.once('login', callback);
  }
}

/**
 * @param subject
 * @param properties
 * @return {Promise<*>}
 */
async function populate({subject, properties}) {
  console.debug(`Populating ${subject}`);
  let srcData = subject;
  if (typeof subject === 'string') {
    //if we weren't given an ldflex object, assume we're given something which can be one
    console.debug("subject was a string");
    srcData = await solidData[subject];
  }

  if (typeof properties === 'object') {
    const result = {};
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        let property = properties[key];
        console.debug(`looking up property ${key} (${property})`);

        if (typeof property == 'string') {
          console.debug(`${subject}.${key} (${property}) is a string`);

          //this is just a normal 'property' piece of data, like foaf:name
          result[key] = await srcData[property];
          console.debug(`${subject}.${key} =  ${result[key]}`);

        } else if (typeof property == 'object' && property.hasOwnProperty("type")) {
          console.debug(`${subject}.${key} is an object`, property);

          //this is a Class. Need to lookup it up in the subject's type index
          try {
            const typeIndex = new TypeIndex(srcData);
            const instances = await typeIndex.instances(property.type);
            if (instances) {
              result[key] = [];
              for (const instance of instances) {
                console.debug(`instance of ${property.type} to populate: ${instance}`);
                result[key].push(await populate({subject: instance, properties: property.properties}))
              }
            }
          } catch (e) {
            console.error(`Error populated up ${subject}.${key}`, e);
          }

        }
      }
    }

    return result;
  } else {
    console.warn(`Unsupported type (${typeof properties}) for ${subject}:${properties}`);
    return null;
  }
}

export default {
  install(Vue) {
    console.log("Installing vue-solid-plugin");

    //Add this.$solid
    Vue.prototype.$solid = {
      //Add a reference to the solid-auth-client to the vue instance.
      //this enables `this.$solid.auth` within a Vue component
      auth,

      //Add a reference directly to the query-ldflex api to the vue instance.
      //this enables `this.$solid.data` within a Vue component
      data: solidData,

      //A function to populate an object based on the mappings provided
      populate,

      TypeIndex,
    };

    // Add additional logic to every instance
    //
    // this will turn the `solid` object on the component definition
    // into data loaded from query-ldflex
    Vue.mixin({

      /**
       * "Initialize" all the solid data for this instance in
       * beforeCreate() so that the reactive magic works on these
       * properties. set the synchronously to whatever the default object
       * that the component has
       */
      beforeCreate() {
        //exit quickly if we don't care about this component
        if (!this.$options.solid) {
          return;
        }

        const originalData = this.$options.data;
        const desiredData = this.$options.solid;

        // initialize the vue `data` with the component's data plus the initial solid data shape
        this.$options.data = function dataWithSolidData(vm) {
          const vmData = ((typeof originalData === 'function') ? originalData.call(this, vm) : originalData) || {};

          //restructure the user data to follow the normal structure
          if (desiredData.user && !desiredData.user.properties) {
            desiredData.user = {
              subject: 'user',
              properties: desiredData.user
            }
          }

          for (const key in desiredData) {
            const properties = desiredData[key].properties;
            if (!properties) {
              console.warn(`no properties provided for solid data. Skipping solid.${key}`);
              delete desiredData[key];
            } else {
              vmData[key] = ''; //todo: default vals?
            }
          }

          return vmData;
        }

      },

      /**
       * Now do the actual loading of the solidData from query-ldflex
       * and trigger the loggedIn lifecycle hook
       */
      async created() {

        const populateAll = async () => {
          const desiredData = this.$options.solid || {};
          console.log(`Populating solid data for ${this.$options.name}`, {desiredData});
          for (const key in desiredData) {
            console.log(`populating ${key} data`, desiredData[key]);
            this.$data[key] = await populate(desiredData[key]);
            console.log(`result:`, this.$data[key]);
          }
        };

        //go ahead and populate the data, then repopulate when a user logs in
        // await populateAll();
        onLogin(async session => {
          await populateAll();
          //the loggedIn lifecycle hook
          if (this.$options.loggedIn && typeof this.$options.loggedIn === 'function') {
            this.$options.loggedIn.call(this);
          }
        });
      }
    })
  }
}
