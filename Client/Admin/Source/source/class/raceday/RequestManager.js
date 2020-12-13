qx.Class.define("raceday.RequestManager", {
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
        deleteDocument: function(context, id, quiet) {
            let params = {
                id: id
            };

            let req = this.__prepareRequestWithParams("document", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        deleteSystemUser: function(context, id, quiet) {
            let params = {
                id: id
            };

            let req = this.__prepareRequestWithParams("system_user", params, quiet);
            req.setMethod("DELETE");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getNewAccessToken: function(context, username, password, quiet) {
            let req = this.__prepareRequest("access_token", quiet, true);
            req.setRequestHeader("Username", username);
            req.setRequestHeader("Password", password);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getAirports: function(context, creationStatus, sourceAuthority, sourceAuthorityType, quiet) {
            let params = { };
            if (creationStatus) {
                params["creation_status"] = creationStatus;
            }
            if (sourceAuthority) {
                params["source_authority"] = sourceAuthority;
            }
            if (sourceAuthorityType) {
                params["source_authority_type"] = sourceAuthorityType;
            }

            let req = this.__prepareRequestWithParams("airports", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getAmendments: function(context, status, statusType, quiet) {
            let params = {};
            if (status) {
                params["status"] = status;
            }
            if (statusType) {
                params["status_type"] = statusType;
            }

            let req = this.__prepareRequestWithParams("amendments", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getCurrentDocument: function(context, sourceAuthority, sourceAuthorityType, pageId, quiet) {
            let params = {
                source_authority: sourceAuthority,
                source_authority_type: sourceAuthorityType,
                page_id: pageId
            };

            let req = this.__prepareRequestWithParams("current_document", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getCurrentDocuments: function(context, sourceAuthority, sourceAuthorityType, icaoCode, quiet) {
            let params = {
                source_authority: sourceAuthority,
                source_authority_type: sourceAuthorityType,
                icao_code: icaoCode
            };

            let req = this.__prepareRequestWithParams("current_documents", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getChanges: function(context, documentId, quiet) {
            let params = {
                document_id: documentId
            };

            let req = this.__prepareRequestWithParams("changes", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getDocument: function(context, id, quiet) {
            let params = {
                id: id
            };

            let req = this.__prepareRequestWithParams("document", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getDocuments: function(context, amendmentId, unidentified, quiet) {
            let params = {};
            if (amendmentId) {
                params["amendment_id"] = amendmentId;
            }
            if (unidentified) {
                params["unidentified"] = true;
            }

            let req = this.__prepareRequestWithParams("documents", params, quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        /*
         * @ignore WebSocket
         */
        getNotificationSocket: function() {
            return new WebSocket("wss://" + window.location.host + "/notification_socket", this.getAccessToken());
        },

        getSourceAuthorities: function(context, quiet) {
            let req = this.__prepareRequest("source_authorities", quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        getSystemUsers: function(context, quiet) {
            let req = this.__prepareRequest("system_users", quiet);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postAmendmentTransition: function(context, id, quiet) {
            let params = {
                id: id
            };

            let req = this.__prepareRequestWithParams("amendment_transition", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        postSystemUser: function(context, id, password, firstName, lastName, email, superuser, enabled, quiet) {
            let params = {
                id:         id,
                password:   password,
                first_name: firstName,
                last_name:  lastName,
                email:      email,
                superuser:  superuser,
                enabled:    enabled
            };

            let req = this.__prepareRequestWithParams("system_user", params, quiet);
            req.setMethod("POST");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putAmendment: function(context, id, version, sourceAuthority, sourceAuthorityType, quiet) {
            let params = {
                id: id
            };
            if (version) {
                params["version"] = version;
            }
            if (sourceAuthority) {
                params["source_authority"] = sourceAuthority;
            }
            if (sourceAuthorityType) {
                params["source_authority_type"] = sourceAuthorityType;
            }

            let req = this.__prepareRequestWithParams("amendment", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putAmendmentStatus: function(context, id, quiet) {
            let params = {
                id: id
            };

            let req = this.__prepareRequestWithParams("amendment_status", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putChange: function(context, id, accepted, description, quiet) {
            let params = {
                id: id
            };
            if ( (accepted !== undefined) && (accepted !== null) ) {
                params["accepted"] = accepted;
            }
            if ( (description !== undefined) && (description !== null) ) {
                params["description"] = description;
            }

            let req = this.__prepareRequestWithParams("change", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putChanges: function(context, ids, accepted, quiet) {
            let requestData = {
                "ids":      ids,
                "accepted": accepted
            };

            let req = this.__prepareRequest("changes", quiet);
            req.setMethod("PUT");
            req.setRequestData(requestData);
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putDocument: function(context, id, pageId, previousPageDocId, transform, reviewed, quiet) {
            let params = {
                id: id
            };

            if (pageId) {
                params["page_id"] = pageId;
            }
            if (previousPageDocId) {
                params["previous_page_doc_id"] = previousPageDocId;
            }
            if (transform) {
                params["transform"] = transform;
            }
            if ( (reviewed !== undefined) && (reviewed !== null) ) {
                params["reviewed"] = reviewed;
            }

            let req = this.__prepareRequestWithParams("document", params, quiet);
            req.setMethod("PUT");
            return req.sendWithPromise(this.__createContext(context, req));
        },

        putSystemUser: function(context, id, password, firstName, lastName, email, superuser, enabled, quiet) {
            let params = {
                id: id
            };

            if (password) {
                params["password"] = password;
            }
            if ( (firstName !== null) && (firstName !== undefined) ) {
                params["first_name"] = firstName;
            }
            if ( (lastName !== null) && (lastName !== undefined) ) {
                params["last_name"] = lastName;
            }
            if ( (email !== null) && (email !== undefined) ) {
                params["email"] = email;
            }
            if ( (superuser !== null) && (superuser !== undefined) ) {
                params["superuser"] = superuser;
            }
            if ( (enabled !== null) && (enabled !== undefined) ) {
                params["enabled"] = enabled;
            }

            let req = this.__prepareRequestWithParams("system_user", params, quiet);
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

            let req = new raceday.Request("https://" + window.location.host, resource, notifier);
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
