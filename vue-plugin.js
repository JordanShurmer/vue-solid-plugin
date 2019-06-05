/**
 * A Vue Plugin which adds functionality
 * to the Vue instance to make it easier
 * to develop Solid applications
 */
import auth from 'solid-auth-client';
import solidData from '@solid/query-ldflex';


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

export default {
    install(Vue) {
        console.log("Installing vue-solid-plugin")

        //Add this.$solid
        Vue.prototype.$solid = {
            //Add a reference to the solid-auth-client to the vue instance.
            //this enables `this.$solid.auth` within a Vue component
            auth,

            //Add a method which invokes the callback once the
            //user is logged in, or immeditiately if already logged in
            onLogin,

            //Add a reference directly to the query-ldflex api to the vue instance.
            //this enables `this.$solid.data` within a Vue component
            data: solidData
        };



        // Add additional logic to every instance
        //
        // this will turn the `solid` object on the instance
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
                if (!this.$options.solid) return;


                const originalData = this.$options.data;
                const desiredData = this.$options.solid;

                // initialize the vue `data` with the component's data plus the initial solid data shape
                this.$options.data = function dataWithSolidData(vm) {
                    const vmData = ((typeof originalData === 'function') ? originalData.call(this, vm) : originalData) || {}

                    if (desiredData.user) {
                        vmData.user = {
                            ...desiredData.user,
                            data: solidData.user
                        }
                    }

                    return vmData;
                }
            },

            /**
             * Now do the actual loading of the solidData from query-ldflex
             */
            async created() {
                const desiredData = this.$options.solid || {};

                //user is a special thing
                if (desiredData.user) {
                    onLogin(async session => {
                        for (let key in desiredData.user) {
                            const value = await solidData.user[key];
                            console.log(`setting user[${key}] = ${value}`)
                            Vue.set(this.user, key, value);
                        }
                    })
                }
            }
        })
    }
}