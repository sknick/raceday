/**
 * @asset(qx/icon/${qx.icontheme}/16/categories/system.png)
 */
qx.Class.define("raceday.ui.MainWindow", {
    extend: qx.ui.core.Widget,

    implement: [raceday.IRequestNotifier],

    statics: {
        __ACCESS_TOKEN_KEY: "access_token",
        __IS_SUPERUSER_KEY: "is_superuser",
        __LAST_SHOWN_VIEW:  "last_shown_view",
        __DOCUMENTS_VIEW:   "documents",
        __ADMIN_VIEW:       "admin",
        __instance:         null,

        /**
         * Handles a request error that came back from the server. If the status code is a 403, then the user will be
         * notified that they need to login again, and the application window will reload.
         *
         * @param {number} statusCode
         * @param {*} error
         */
        handleRequestError: function(statusCode, error) {
            let errorMessage = null;

            if (error instanceof qx.type.BaseError) {
                if (statusCode === 403) {
                    raceday.ui.MainWindow.__instance.__handleUnauthorized();
                } else {
                    errorMessage = error.toString();
                }
            } else if (error instanceof qx.core.Object) {
                errorMessage = error.toString();
            } else if (error instanceof String) {
                errorMessage = error;
            } else {
                console.error(error);
                errorMessage = "An unknown error has occurred.";
            }

            if (errorMessage) {
                let dlg = new raceday.ui.MessageDialog(raceday.Application.APP_TITLE, errorMessage);
                dlg.open();
            }
        }
    },

    construct: function(root) {
        this.base(arguments);

        raceday.ui.MainWindow.__instance = this;

        this.__notificationWebSocket = null;
        this.__root = root;
        this.__unauthorizedHandled = false;
        this.__loadingDlg = new raceday.ui.LoadingDialog();
        this.__sessionStorage = qx.bom.storage.Web.getSession();
        this.__adminButton = new qx.ui.toolbar.Button("Administration", "icon/16/categories/system.png");
        this.__documentsView = null;
        this.__adminView = null;

        let accessToken = this.__sessionStorage.getItem(raceday.ui.MainWindow.__ACCESS_TOKEN_KEY);
        if (accessToken) {
            let val = {
                value: accessToken,
                superuser: this.__sessionStorage.getItem(raceday.ui.MainWindow.__IS_SUPERUSER_KEY)
            };
            this.__onLoginContinued(val);
        } else {
            this.__loginDlg = new raceday.ui.LoginScreen();
            this.__loginDlg.addListener("login", this.__onLogin, this);
            this.__root.add(this.__loginDlg, { edge: 0 });
        }

        raceday.RequestManager.getInstance().setNotifier(this);

        this.__adminButton.addListener("execute", this.__onAdmin, this);
    },

    members: {
        onRequest: function () {
            this.__loadingDlg.open();
        },

        onReturn: function () {
            this.__loadingDlg.close();
        },

        __handleUnauthorized: function () {
            // The window.location.reload() call below apparently doesn't happen synchronously, so we're forced to make
            // sure this call to onUnauthorized() isn't a redundant one from another part of the application having
            // attempted a request.
            if (!this.__unauthorizedHandled) {
                this.__sessionStorage.removeItem(raceday.ui.MainWindow.__ACCESS_TOKEN_KEY);
                this.__sessionStorage.removeItem(raceday.ui.MainWindow.__IS_SUPERUSER_KEY);

                let dlg = new raceday.ui.MessageDialog(raceday.Application.APP_TITLE,
                    "Your login session has expired. Press OK to login again.");
                dlg.addListener("confirmed", this.__onUnauthorizedContinue, this);
                dlg.open();
            }
            return false;
        },

        __showView: function(view) {
            if (qx.ui.core.Widget.contains(this.__root, this.__documentsView)) {
                this.__root.remove(this.__documentsView);
            } else if (qx.ui.core.Widget.contains(this.__root, this.__adminView)) {
                this.__root.remove(this.__adminView);
            }

            this.__root.add(view, {
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
            });

            if (view instanceof raceday.ui.documents.View) {
                this.__sessionStorage.setItem(raceday.ui.MainWindow.__LAST_SHOWN_VIEW, raceday.ui.MainWindow.__DOCUMENTS_VIEW);
            } else if (view instanceof raceday.ui.admin.View) {
                this.__sessionStorage.setItem(raceday.ui.MainWindow.__LAST_SHOWN_VIEW, raceday.ui.MainWindow.__ADMIN_VIEW);
            } else {
                this.__sessionStorage.removeItem(raceday.ui.MainWindow.__LAST_SHOWN_VIEW);
            }
        },

        __onAdmin: function(e) {
            this.__showView(this.__adminView);
        },

        __onExitAdminSelected: function(e) {
            this.__showView(this.__documentsView);
        },

        __onUnauthorizedContinue: function(context) {
            window.location.reload();
            this.__unauthorizedHandled = true;
        },

        __onLogin: function(e) {
            let data = e.getData();
            raceday.RequestManager.getInstance().getNewAccessToken(this, data.username, data.password, true).then(
                function(e) {
                    this.context.__onLoginContinued(e.getResponse());
                },
                function(e) {
                    if (this.request.getStatus() === 401) {
                        this.context.__loginDlg.notifyOfBadLogin();
                    } else {
                        this.context.__loginDlg.notifyOfError(e.message);
                    }
                }
            )
        },

        __onLoginContinued: function(accessToken) {
            raceday.RequestManager.getInstance().setAccessToken(accessToken.value);
            this.__sessionStorage.setItem(raceday.ui.MainWindow.__ACCESS_TOKEN_KEY, accessToken.value);
            this.__sessionStorage.setItem(raceday.ui.MainWindow.__IS_SUPERUSER_KEY, accessToken.superuser);

            let additionalButton = null;
            if (this.__sessionStorage.getItem(raceday.ui.MainWindow.__IS_SUPERUSER_KEY)) {
                additionalButton = this.__adminButton;
            }

            this.__documentsView = new raceday.ui.documents.View(additionalButton);

            this.__adminView = new raceday.ui.admin.View();
            this.__adminView.addListener("exitSelected", this.__onExitAdminSelected, this);

            if (this.__loginDlg) {
                this.__root.remove(this.__loginDlg);
            }

            let lastShownView = this.__sessionStorage.getItem(raceday.ui.MainWindow.__LAST_SHOWN_VIEW);
            if (lastShownView) {
                switch (lastShownView) {
                    case raceday.ui.MainWindow.__DOCUMENTS_VIEW:
                        this.__showView(this.__documentsView);
                        break;

                    case raceday.ui.MainWindow.__ADMIN_VIEW:
                        this.__showView(this.__adminView);
                        break;
                }
            } else {
                this.__showView(this.__documentsView);
            }

            this.__notificationWebSocket = raceday.RequestManager.getInstance().getNotificationSocket();
            this.__notificationWebSocket.onmessage = function(event) {
                // TODO: Handle notification
                console.log(event.data);
            };
        },

        __loadingDlg: null
    }
});
