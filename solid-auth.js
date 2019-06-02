/**
 * A Vue Plugin which adds this.$solid as a reference
 * to the solid-auth-client.
 */
import solid from 'solid-auth-client';
export default {
    install(Vue) {
        //Add a reference to the solid-auth-client to the vue instance.
        //this enables `this.$solid` within a Vue component
        Vue.prototype.$solid = solid;

        console.log("Installing vue-solid-plugin")
    }
}