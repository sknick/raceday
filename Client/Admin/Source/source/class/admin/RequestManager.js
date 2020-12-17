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
        deleteEvent: function(context, id, quiet) {
            let params = {
                "id": id
            };

            let req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteLocation: function(context, id, quiet) {
            let params = {
                "id": id
            };

            let req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteSeries: function(context, id, quiet) {
            let params = {
                "id": id
            };

            let req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getEvents: function(context, windowStart, windowEnd, quiet) {
            let params = {
                "window_start": windowStart
            };
            if (windowEnd) {
                params["window_end"] = windowEnd;
            }

            let req = this.__prepareRequestWithParams("events", params, quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getLocations: function(context, quiet) {
            let req = this.__prepareRequest("locations", quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

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

        postEvent: function(context, name, start, description, locationId, seriesId, quiet) {
            let params = {
                "name":  name,
                "start": start
            };
            if (description) {
                params["description"] = description;
            }
            if (locationId) {
                params["location_id"] = locationId;
            }
            if (seriesId) {
                params["series_id"] = seriesId;
            }

            let req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postLocation: function(context, name, description, quiet) {
            let params = {
                "name":        name,
                "description": description
            };

            let req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putEvent: function(context, id, name, start, description, locationId, seriesId, quiet) {
            let params = {
                "id":    id,
                "name":  name,
                "start": start
            };
            if (description) {
                params["description"] = description;
            }
            if (locationId) {
                params["location_id"] = locationId;
            }
            if (seriesId) {
                params["series_id"] = seriesId;
            }

            let req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putLocation: function(context, id, name, description, quiet) {
            let params = {
                "id":          id,
                "name":        name,
                "description": description
            };

            let req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postSeries: function(context, name, description, quiet) {
            let params = {
                "name":        name,
                "description": description
            };

            let req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putSeries: function(context, id, name, description, quiet) {
            let params = {
                "id":          id,
                "name":        name,
                "description": description
            };

            let req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("PUT");
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
