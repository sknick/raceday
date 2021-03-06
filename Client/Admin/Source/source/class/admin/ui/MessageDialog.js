/**
 * This dialog displays a message.
 */
qx.Class.define("admin.ui.MessageDialog", {
    extend: admin.ui.DialogBase,

    /**
     * @param {string} title
     * @param {string} message
     * @param {*} [context]
     */
    construct(title, message, context) {
        const label = new qx.ui.basic.Label(message);

        const okButton = new qx.ui.form.Button("OK");
        okButton.setWidth(70);

        okButton.addListener("execute", function(e) {
            this.close();
            this.fireDataEvent("confirmed", context);
        },
        this);

        this.base(arguments, title, label, [okButton]);
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
