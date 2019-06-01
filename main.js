// ESM syntax is supported.
import solid from 'solid-auth-client';
export default {
    install(Vue) {
        //Add a reference to the solid-auth-client to the vue instance.
        //this enables `this.$solid` within a Vue component
        Vue.prototype.$solid = solid;
    }
}
