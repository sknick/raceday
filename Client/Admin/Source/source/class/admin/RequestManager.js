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
    construct() {
        this.base(arguments);
    },

    members: {
        deleteBroadcast(context, id, quiet) {
            const params = {
                "id": id
            };

            const req = this.__prepareRequestWithParams("broadcast", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteBroadcasts(context, ids, quiet) {
            const params = {
                "ids": ids
            };

            const req = this.__prepareRequestWithParams("broadcasts", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteEvent(context, id, quiet) {
            const params = {
                "id": id
            };

            const req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteLocation(context, id, quiet) {
            const params = {
                "id": id
            };

            const req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteSeries(context, id, quiet) {
            const params = {
                "id": id
            };

            const req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getBroadcasts(context, eventId, eventStart, includeAllAfter, quiet) {
            const params = {};
            if (eventId) {
                params["event_id"] = eventId;
            }
            if (eventStart) {
                params["event_start"] = eventStart;
            }
            if ( (includeAllAfter !== undefined) && (includeAllAfter !== null) ) {
                params["include_all_after"] = includeAllAfter;
            }

            const req = this.__prepareRequestWithParams("broadcasts", params, quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getEvents(context, windowStart, windowEnd, timeZone, quiet) {
            const params = {
                "window_start": windowStart
            };
            if (windowEnd) {
                params["window_end"] = windowEnd;
            }
            if (timeZone) {
                params["time_zone"] = timeZone;
            } else {
                params["time_zone"] = "UTC";
            }

            const req = this.__prepareRequestWithParams("events", params, quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getLangs(context, quiet) {
            const req = this.__prepareRequest("langs", quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getLocations(context, quiet) {
            const req = this.__prepareRequest("locations", quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getNewAccessToken(context, username, password, quiet) {
            const req = this.__prepareRequest("access_token", quiet, true);
            req.setRequestHeader("Username", username);
            req.setRequestHeader("Password", password);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getSeries(context, quiet) {
            const req = this.__prepareRequest("series", quiet, true);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postBroadcast(context, type, eventId, url, quiet) {
            const params = {
                "type":     type,
                "event_id": eventId
            };
            if (url) {
                params["url"] = url;
            }

            const req = this.__prepareRequestWithParams("broadcast", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postBroadcasts(context, unsavedBroadcasts, quiet) {
            let data = [];
            for (let i = 0; i < unsavedBroadcasts.length; i++) {
                data.push(unsavedBroadcasts[i].toSimpleObject());
            }

            const req = this.__prepareRequest("broadcasts", quiet);
            req.setMethod("POST");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestData(data);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putBroadcasts(context, broadcasts, quiet) {
            let data = [];
            for (let i = 0; i < broadcasts.length; i++) {
                data.push(broadcasts[i].toSimpleObject());
            }

            const req = this.__prepareRequest("broadcasts", quiet);
            req.setMethod("PUT");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestData(data);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postEvent(context, name, start, description, locationId, seriesId, quiet) {
            const params = {
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

            const req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postLocation(context, name, description, quiet) {
            const params = {
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putBroadcast(context, id, type, eventId, url, quiet) {
            const params = {
                "id":       id,
                "type":     type,
                "event_id": eventId
            };
            if (url) {
                params["url"] = url;
            }

            const req = this.__prepareRequestWithParams("broadcast", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putEvent(context, id, name, start, description, locationId, seriesId, quiet) {
            const params = {
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

            const req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putLocation(context, id, name, description, quiet) {
            const params = {
                "id":          id,
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postSeries(context, name, description, quiet) {
            const params = {
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putSeries(context, id, name, description, quiet) {
            const params = {
                "id":          id,
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        __createContext(context, request) {
            return {
                context: context,
                request: request
            };
        },

        __prepareRequest(resource, quiet, accessTokenNotNecessary) {
            if (!accessTokenNotNecessary && (this.getAccessToken() === null)) {
                throw "No access token specified.";
            }

            let notifier = quiet ? null : this.getNotifier();

            const req = new admin.Request("http://" + window.location.host + "/api/", resource, notifier);
            if (!accessTokenNotNecessary) {
                req.setRequestHeader("AccessToken", this.getAccessToken());
            }
            return req;
        },

        __prepareRequestWithParams(resource, params, quiet) {
            let queryString = "";
            for (let key in params) {
                if (queryString !== "") queryString += "&";
                queryString += key + "=" + encodeURIComponent(params[key]);
            }

            return this.__prepareRequest(resource + "?" + queryString, quiet);
        }
    }
});
