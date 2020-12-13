/**
 * Instances of this class are used by the various methods of the RequestManager class.
 */
qx.Class.define("raceday.Request", {
    extend: qx.io.request.Xhr,

    construct: function(baseUrl, resource, notifier) {
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }

        this.base(arguments, baseUrl + resource);
        this.__notifier = notifier;

        this.addListener(
            "success",
            function(e) {
                if (this.__notifier !== null) this.__notifier.onReturn();
            },
            this
        );

        this.addListener(
            "error",
            function(e) {
                if (this.__notifier !== null) this.__notifier.onReturn();
            },
            this
        );

        this.addListener(
            "statusError",
            function(e) {
                if (notifier !== null) this.__notifier.onReturn();
            },
            this
        );
    },

    members: {
        send: function() {
            if (this.__notifier !== null) {
                this.__notifier.onRequest();
            }

            arguments.callee.base.apply(this, arguments);
        }
    }
});
