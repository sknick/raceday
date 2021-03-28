/**
 * This the login screen shown when the application first loads.
 */
qx.Class.define("admin.ui.LoginScreen", {
    extend: qx.ui.container.Composite,

    /**
     * Constructor.
     */
    construct: function() {
        this.base(arguments);

        this.__usernameField = new qx.ui.form.TextField().set({
            "placeholder": "Username",
            "value": qx.core.Environment.get("username")
        });
        this.__passwordField = new qx.ui.form.PasswordField().set({
            "placeholder": "Password",
            "value": qx.core.Environment.get("password")
        });

        const loginButton = new qx.ui.form.Button("Login");

        this.__messageLabel = new qx.ui.basic.Label("");
        this.__messageLabel.setRich(true);
        this.__messageLabel.setTextColor("#000000");

        const gridLayout = new qx.ui.layout.Grid(10, 10);
        gridLayout.setColumnAlign(0, "center", "middle");
        gridLayout.setColumnWidth(0, 300);

        this.__fieldContainer = new qx.ui.container.Composite(gridLayout);
        this.__fieldContainer.add(this.__usernameField, { row: 0, column: 0 });
        this.__fieldContainer.add(this.__passwordField, { row: 1, column: 0 });
        this.__fieldContainer.add(this.__messageLabel,  { row: 2, column: 0 });
        this.__fieldContainer.add(loginButton,          { row: 3, column: 0 });

        const innerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0, "middle"));
        innerContainer.setAllowGrowY(false);
        innerContainer.add(this.__fieldContainer);

        const hboxLayout = new qx.ui.layout.HBox(0, "center");
        hboxLayout.setAlignY("middle");
        this.setLayout(hboxLayout);

        this.add(innerContainer);

        this.__usernameField.addListener("keydown", this.__onKeyDown, this);
        this.__passwordField.addListener("keydown", this.__onKeyDown, this);
        loginButton.addListener("execute", this.__onLogin, this);
    },

    members: {
        notifyOfBadLogin: function() {
            this.__messageLabel.setTextColor("#ff0000");
            this.__messageLabel.setValue("<i>Invalid credentials</i>");
            this.__passwordField.focus();
        },

        notifyOfError: function(message) {
            this.__messageLabel.setTextColor("#ff0000");
            this.__messageLabel.setValue("<i>" + message + "</i>");
        },

        __onKeyDown: function(e) {
            if (e.getKeyIdentifier() === "Enter") {
                this.__onLogin();
            }
        },

        __onLogin: function(e) {
            const username = this.__usernameField.getValue();
            if (!username || (username.trim().length === 0)) {
                this.__messageLabel.setTextColor("#ff0000");
                this.__messageLabel.setValue("<i>You must specify a username.</i>");
                this.__usernameField.focus();
                return;
            }

            const password = this.__passwordField.getValue();
            if (!password || (password.trim().length === 0)) {
                this.__messageLabel.setTextColor("#ff0000");
                this.__messageLabel.setValue("<i>You must specify a password.</i>");
                this.__passwordField.focus();
                return;
            }

            this.fireDataEvent("login", { "username": username, "password": password });
        }
    },

    events: {
        "login": "qx.event.type.Data"
    }
});
