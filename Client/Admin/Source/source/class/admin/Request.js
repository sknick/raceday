qx.Class.define("admin.Request", {
    extend: qx.io.request.Xhr,

    construct(baseUrl, resource, notifier) {
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
        send() {
            if (this.__notifier !== null) {
                this.__notifier.onRequest();
            }

            arguments.callee.base.apply(this, arguments);
        },

        /**
         * Overridden to provide a better exception object when there is a failure.
         */
        sendWithPromise(context) {
            if (qx.core.Environment.get("qx.promise")) {
                context = context || this;

                const req = this;

                return new qx.Promise(
                    function(resolve, reject) {
                        let listeners = [];

                        listeners.push(
                            req.addListener(
                                "success",

                                function(e) {
                                    listeners.forEach(req.removeListenerById.bind(req));
                                    resolve(req);
                                },

                                this
                            )
                        );

                        listeners.push(
                            req.addListener(
                                "statusError",

                                function(e) {
                                    listeners.forEach(req.removeListenerById.bind(req));
                                    reject(
                                        new admin.RequestError(
                                            "statusError",
                                            qx.lang.String.format(
                                                "%1: %2",
                                                [
                                                    req.getStatus(),
                                                    req.getStatusText()
                                                ]
                                            ),
                                            req.getStatus()
                                        )
                                    );
                                },

                                this
                            )
                        );

                        listeners.push(
                            req.addListener(
                                "timeout",

                                function(e) {
                                    listeners.forEach(req.removeListenerById.bind(req));
                                    reject(
                                        new admin.RequestError(
                                            "timeout",
                                            qx.lang.String.format(
                                                "Request failed with timeout after %1 ms",
                                                [
                                                    req.getTimeout()
                                                ]
                                            )
                                        )
                                    );
                                },

                                this
                            )
                        );

                        listeners.push(
                            req.addListener(
                                "parseError",

                                function(e) {
                                    listeners.forEach(req.removeListenerById.bind(req));
                                    reject(new admin.RequestError("parseError", "Error parsing the response"));
                                },

                                this
                            )
                        );

                        listeners.push(
                            req.addListener(
                                "abort",

                                function(e) {
                                    listeners.forEach(req.removeListenerById.bind(req));
                                    reject(new admin.RequestError("abort", "Request aborted"));
                                },

                                this
                            )
                        );

                        listeners.push(
                            req.addListener(
                                "error",

                                function(e) {
                                    listeners.forEach(req.removeListenerById.bind(req));
                                    reject(new admin.RequestError("error", "Request failed"));
                                },

                                this
                            )
                        );

                        req.send();
                    },
                    context
                ).finally(
                    function() {
                        if (req.getReadyState() !== 4) {
                            req.abort();
                        }
                    }
                );
            } else {
                throw new admin.RequestError("Error", "Environment setting qx.promise is set to false");
            }
        }
    }
});
