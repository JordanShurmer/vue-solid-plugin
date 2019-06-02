export default {
    props: ['popupUri'],
    data() {
        return {
            initializing: true, // whether the solid client is still initializing or not
            loggedIn: false, // whether a user is logged in or not
            webId: undefined, // the webid of the logged in user, or undefined
        }
    },
    methods: {
        /**
         * Initiate the log-in sequence with solid-auth-client
         */
        login() {
            if (this.$solid) {
                console.debug("logging in");
                this.$solid.popupLogin({ popupUri: this.popupUri });
            }
        },
        logout() {
            if (this.$solid) {
                console.debug("logging out");
                this.$solid.logout();
            }
        }
    },
    created() {
        console.log("Solid Login Created", {"$solid": this.$solid});
        if (this.$solid) {
            this.$solid.trackSession(session => {
                this.initializing = false;
                this.loggedIn = !!session;
                if (this.loggedIn) {
                    this.webId = session.webId;
                } else {
                    this.webId = '';
                }
            });
        } else {
            console.error("You must use SolidAuth in order to use SolidLogin");
            return;
        }
    },
    render() {
        return this.$scopedSlots.default({
            //methods
            login: this.login,
            logout: this.logout,

            //data
            loggedIn: this.loggedIn,
            initializing: this.initializing,
            webId: this.webId,
        });
    },
}