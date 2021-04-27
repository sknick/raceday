/**
 * @asset(qx/icon/${qx.icontheme}/16/categories/system.png)
 */
qx.Class.define("admin.ui.MainWindow", {
    extend: qx.ui.core.Widget,

    implement: [admin.IRequestNotifier],

    statics: {
        __ACCESS_TOKEN_KEY: "access_token",
        __instance:         null,
        
        handleError(error) {
            // TODO: Get code from elsewhere
            console.error(error)
        }
    },

    construct(root) {
        this.base(arguments);

        admin.ui.MainWindow.__instance = this;

        this.__root = root;
        this.__unauthorizedHandled = false;
        this.__loadingDlg = new admin.ui.LoadingDialog();

        const accessToken = qx.bom.storage.Web.getSession().getItem(admin.ui.MainWindow.__ACCESS_TOKEN_KEY);
        if (accessToken) {
            this.__onLoginContinued(accessToken);
        } else {
            this.__loginDlg = new admin.ui.LoginScreen();
            this.__loginDlg.addListener("login", this.__onLogin, this);
            this.__root.add(this.__loginDlg, { edge: 0 });
        }

        admin.RequestManager.getInstance().setNotifier(this);
    },

    members: {
        onRequest() {
            this.__loadingDlg.open();
        },

        onReturn() {
            this.__loadingDlg.close();
        },

        __handleUnauthorized() {
            // The window.location.reload() call below apparently doesn't happen synchronously, so we're forced to make
            // sure this call to onUnauthorized() isn't a redundant one from another part of the application having
            // attempted a request.
            if (!this.__unauthorizedHandled) {
                qx.bom.storage.Web.getSession().removeItem(admin.ui.MainWindow.__ACCESS_TOKEN_KEY);

                const dlg = new admin.ui.MessageDialog(admin.Application.APP_TITLE,
                    "Your login session has expired. Press OK to login again.");
                dlg.addListener("confirmed", this.__onUnauthorizedContinue, this);
                dlg.open();
            }
            return false;
        },

        __onUnauthorizedContinue(context) {
            window.location.reload();
            this.__unauthorizedHandled = true;
        },

        async __onLogin(e) {
            const data = e.getData();

            try {
                const accessToken = await admin.RequestManager.getInstance().getNewAccessToken(data.username,
                    data.password, true);

                admin.RequestManager.getInstance().setAccessToken(accessToken);
                qx.bom.storage.Web.getSession().setItem(admin.ui.MainWindow.__ACCESS_TOKEN_KEY, accessToken);

                if (this.__loginDlg) {
                    this.__root.remove(this.__loginDlg);
                }

                const tabView = new qx.ui.tabview.TabView("top");
                tabView.setContentPadding(0, 0, 0, 0);

                tabView.add(new admin.ui.events.Page());
                tabView.add(new admin.ui.series.Page());
                tabView.add(new admin.ui.locations.Page());

                this.__root.add(tabView, {
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                });
            } catch (ex) {
                // TODO
                console.error(ex);
                // if (this.request.getStatus() === 401) {
                //     this.context.__loginDlg.notifyOfBadLogin();
                // } else {
                //     this.context.__loginDlg.notifyOfError(e.message);
                // }
            }
        },

        __loadingDlg: null
    }
});
