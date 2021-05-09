/**
 * This dialog prompts the user to enter text into a field.
 */
qx.Class.define("admin.ui.PromptDialog", {
    extend: admin.ui.DialogBase,

    /**
     * Constructor.
     *
     * @param {string} title
     * @param {string} message
     * @param {string} [value]
     * @param {string} [okButtonText]
     * @param {string} [cancelButtonText]
     * @param {RegExp} [regexCheck]
     * @param {*} [context]
     */
    construct(title, message, value, okButtonText, cancelButtonText, regexCheck, context) {
        this.__regexCheck = regexCheck;
        this.__context = context;

        this.__entryField = new qx.ui.form.TextField(value);
        this.__entryField.setWidth(400);

        const messageLabel = new qx.ui.basic.Label(message);
        messageLabel.setRich(true);

        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(messageLabel);
        container.add(this.__entryField);

        const okButton = new qx.ui.form.Button(okButtonText ? okButtonText : "OK");
        okButton.setWidth(100);

        const cancelButton = new qx.ui.form.Button(cancelButtonText ? cancelButtonText : "Cancel");
        cancelButton.setWidth(70);

        this.__entryField.addListener("keypress", function(e) {
            const key = e.getKeyIdentifier();
            if (key === "Enter") {
                this.__onOK();
            }
        },
        this);

        okButton.addListener("execute", this.__onOK, this);
        cancelButton.addListener("execute", this.__onCancel, this);
        this.addListener("close", function(e) {
            this.fireDataEvent("canceled", { context: this.__context });
        },
        this);

        this.base(arguments, title, container, [okButton, cancelButton]);
    },

    members: {
        __onOK() {
            const text = this.__entryField.getValue() ? this.__entryField.getValue().trim() : "";
            if (text) {
                if (!this.__regexCheck || this.__regexCheck.test(text)) {
                    this.close();
                    this.fireDataEvent("confirmed", { entry: text, context: this.__context });
                } else {
                    this.__entryField.setBackgroundColor("#e8a9a9");
                    this.__entryField.setToolTipText("Invalid value specified");
                }
            }
        },

        __onCancel(e) {
            this.close();
            this.fireDataEvent("canceled", { context: this.__context });
        }
    },

    events: {
        "confirmed": "qx.event.type.Data",
        "canceled":  "qx.event.type.Data"
    }
});
