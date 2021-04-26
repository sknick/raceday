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
        async deleteBroadcast(id, quiet) {
            const params = {
                "id": id
            };

            const req = this.__prepareRequestWithParams("broadcast", params, quiet);
            req.setMethod("DELETE");
            
            await req.sendWithPromise();
        },

        async deleteBroadcasts(ids, quiet) {
            const params = {
                "ids": ids
            };

            const req = this.__prepareRequestWithParams("broadcasts", params, quiet);
            req.setMethod("DELETE");

            await req.sendWithPromise();
        },

        async deleteEvent(id, quiet) {
            const params = {
                "id": id
            };

            const req = this.__prepareRequestWithParams("event", params, quiet);
            req.setMethod("DELETE");

            await req.sendWithPromise();
        },

        async getBroadcasts(eventId, eventStart, includeAllAfter, quiet) {
            const ret = [];

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
            const result = await req.sendWithPromise();

            const response = result.getResponse();
            for (let i = 0; i < response.length; i++) {
                ret.push(new raceday.api.model.Broadcast(response[i]));
            }

            return ret;
        },

        async getEvents(windowStart, windowEnd, timeZone, quiet) {
            const ret = [];

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
            const result = await req.sendWithPromise();

            const response = result.getResponse();
            for (let i = 0; i < response.length; i++) {
                ret.push(new raceday.api.model.Event(response[i]));
            }

            return ret;
        },

        async getLangs(quiet) {
            const ret = [];

            const req = this.__prepareRequest("langs", quiet, true);
            const result = await req.sendWithPromise();

            const response = result.getResponse();
            for (let i = 0; i < response.length; i++) {
                ret.push(new raceday.api.model.Lang(response[i]));
            }

            return ret;
        },

        async getLocations(quiet) {
            const ret = [];

            const req = this.__prepareRequest("locations", quiet, true);
            const result = await req.sendWithPromise();

            const response = result.getResponse();
            for (let i = 0; i < response.length; i++) {
                ret.push(new raceday.api.model.Location(response[i]));
            }

            return ret;
        },

        async getNewAccessToken(username, password, quiet) {
            const req = this.__prepareRequest("access_token", quiet, true);
            req.setRequestHeader("Username", username);
            req.setRequestHeader("Password", password);
            
            const result = await req.sendWithPromise();
            return result.getResponse();
        },

        async getSeries(quiet) {
            const ret = [];

            const req = this.__prepareRequest("series", quiet, true);
            const result = await req.sendWithPromise();

            const response = result.getResponse();
            for (let i = 0; i < response.length; i++) {
                ret.push(new raceday.api.model.Series(response[i]));
            }

            return ret;
        },

        async postBroadcast(type, eventId, url, quiet) {
            const params = {
                "type":     type,
                "event_id": eventId
            };
            if (url) {
                params["url"] = url;
            }

            const req = this.__prepareRequestWithParams("broadcast", params, quiet);
            req.setMethod("POST");
            const result = await req.sendWithPromise();

            return result.getResponse();
        },

        async postBroadcasts(unsavedBroadcasts, quiet) {
            const data = [];
            for (let i = 0; i < unsavedBroadcasts.length; i++) {
                data.push(unsavedBroadcasts[i].toSimpleObject());
            }

            const req = this.__prepareRequest("broadcasts", quiet);
            req.setMethod("POST");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestData(data);
            
            const result = await req.sendWithPromise();
            return result.getResponse();
        },

        async putBroadcasts(broadcasts, quiet) {
            const data = [];
            for (let i = 0; i < broadcasts.length; i++) {
                data.push(broadcasts[i].toSimpleObject());
            }

            const req = this.__prepareRequest("broadcasts", quiet);
            req.setMethod("PUT");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestData(data);
            
            await req.sendWithPromise();
        },

        async postEvent(name, start, description, locationId, seriesId, quiet) {
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
            
            const result = await req.sendWithPromise();

            return result.getResponse();
        },

        async postLocation(name, description, quiet) {
            const params = {
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("POST");

            const result = await req.sendWithPromise();

            return result.getResponse();
        },

        async postSeries(name, description, quiet) {
            const params = {
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("POST");
            
            const result = await req.sendWithPromise();

            return result.getResponse();
        },

        async putBroadcast(id, type, eventId, url, quiet) {
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
            
            await req.sendWithPromise();
        },

        async putEvent(id, name, start, description, locationId, seriesId, quiet) {
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
            
            await req.sendWithPromise();
        },

        async putLocation(id, name, description, quiet) {
            const params = {
                "id":          id,
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("location", params, quiet);
            req.setMethod("PUT");
            
            await req.sendWithPromise();
        },

        async putSeries(id, name, description, quiet) {
            const params = {
                "id":          id,
                "name":        name,
                "description": description
            };

            const req = this.__prepareRequestWithParams("series", params, quiet);
            req.setMethod("PUT");
            
            await req.sendWithPromise();
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
