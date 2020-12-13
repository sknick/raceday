/**
 * @asset(qx/icon/${qx.icontheme}/16/categories/system.png)
 */
qx.Class.define("raceday.ui.MainWindow", {
    extend: qx.ui.core.Widget,

    implement: [raceday.IRequestNotifier],

    statics: {
        __ACCESS_TOKEN_KEY: "access_token",
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

        let accessToken = this.__sessionStorage.getItem(raceday.ui.MainWindow.__ACCESS_TOKEN_KEY);
        if (accessToken) {
            this.__onLoginContinued(accessToken);
        } else {
            this.__loginDlg = new raceday.ui.LoginScreen();
            this.__loginDlg.addListener("login", this.__onLogin, this);
            this.__root.add(this.__loginDlg, { edge: 0 });
        }

        raceday.RequestManager.getInstance().setNotifier(this);
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

                let dlg = new raceday.ui.MessageDialog(raceday.Application.APP_TITLE,
                    "Your login session has expired. Press OK to login again.");
                dlg.addListener("confirmed", this.__onUnauthorizedContinue, this);
                dlg.open();
            }
            return false;
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
            raceday.RequestManager.getInstance().setAccessToken(accessToken);
            this.__sessionStorage.setItem(raceday.ui.MainWindow.__ACCESS_TOKEN_KEY, accessToken);

            if (this.__loginDlg) {
                this.__root.remove(this.__loginDlg);
            }

            // TODO
        },

        __loadingDlg: null
    }
});
