/**
 * A dialog which can be used for displaying a question with Yes/No buttons.
 */
qx.Class.define("admin.ui.ConfirmationDialog", {
    extend: admin.ui.DialogBase,

    include: qx.core.MEvent,

    /**
     * Constructor.
     *
     * @param {string} title
     * @param {string} message
     * @param {*} [context]
     */
    construct(title, message, context) {
        const messageLabel = new qx.ui.basic.Label(message);
        messageLabel.setRich(true);

        const yesButton = new qx.ui.form.Button("Yes");
        yesButton.setWidth(70);
        const noButton = new qx.ui.form.Button("No");
        noButton.setWidth(70);

        yesButton.addListener("execute", function(e) {
            this.close();
            this.fireDataEvent("confirmed", context);
        },
        this);
        noButton.addListener("execute", function(e) {
            this.close();
            this.fireDataEvent("declined", context);
        },
        this);

        this.base(arguments, title, messageLabel, [yesButton, noButton]);
    },

    events: {
        "confirmed": "qx.event.type.Data",
        "declined":  "qx.event.type.Data"
    }
});
