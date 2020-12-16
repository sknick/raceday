qx.Class.define("admin.RequestManager", {
    extend: qx.core.Object,

    type: "singleton",

    properties: {
        /**
         * The component in the application which will be notified whenever a request is sent and received. Typically
         * used by the notifier to display a "loading" indicator.
         */
        notifier: { init: null },

        /**
         * The access token to use in all future requests sent by this class. Typically set by the application after
         * calling `getNewAccessToken()`.
         */
        accessToken: { init: null }
    },

    /**
     * Constructor.
     */
    construct: function() {
        this.base(arguments);
    },

    members: {
        getNewAccessToken: function(context, username, password, quiet) {
            let req = this.__prepareRequest("access_token", quiet, true);
            req.setRequestHeader("Username", username);
            req.setRequestHeader("Password", password);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getSeries: function(context, quiet) {
            let req = this.__prepareRequest("series", quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        __createContext: function(context, request) {
            return {
                context: context,
                request: request
            };
        },

        __prepareRequest: function(resource, quiet, accessTokenNotNecessary) {
            if (!accessTokenNotNecessary && (this.getAccessToken() === null)) {
                throw "No access token specified.";
            }

            let notifier = quiet ? null : this.getNotifier();

            let req = new admin.Request("http://" + window.location.host + "/api/", resource, notifier);
            if (!accessTokenNotNecessary) {
                req.setRequestHeader("AccessToken", this.getAccessToken());
            }
            return req;
        },

        __prepareRequestWithParams: function(resource, params, quiet) {
            let queryString = "";
            for (let key in params) {
                if (queryString !== "") queryString += "&";
                queryString += key + "=" + encodeURIComponent(params[key]);
            }

            return this.__prepareRequest(resource + "?" + queryString, quiet);
        }
    }
});
