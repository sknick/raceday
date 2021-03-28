qx.Class.define("admin.ui.series.EditDialog", {
    extend: admin.ui.DialogBase,

    construct: function(series) {
        this.__series = series;

        const nameLabel = new qx.ui.basic.Label("Name:");
        nameLabel.setAlignY("middle");

        this.__nameField = new qx.ui.form.TextField((this.__series && this.__series.name) ? this.__series.name : "");

        const descriptionLabel = new qx.ui.basic.Label("Description:");
        descriptionLabel.setPaddingTop(5);

        this.__descriptionField = new qx.ui.form.TextArea((this.__series && this.__series.description) ?
            this.__series.description : "");
        this.__descriptionField.setHeight(200);
        this.__descriptionField.setWidth(400);

        const content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));

        content.add(nameLabel,               { row: 0, column: 0 });
        content.add(this.__nameField,        { row: 0, column: 1 });
        content.add(descriptionLabel,        { row: 1, column: 0 });
        content.add(this.__descriptionField, { row: 1, column: 1 });

        const okButton = new qx.ui.form.Button(this.__series ? "OK" : "Add");
        okButton.setWidth(100);

        const cancelButton = new qx.ui.form.Button("Cancel");

        this.base(arguments, this.__series ? "Edit Series" : "Add Series", content, [okButton, cancelButton]);

        okButton.addListener("execute", this.__onOK, this);
        cancelButton.addListener("execute", this.__onCancel, this);
    },

    members: {
        __onOK: function(e) {
            const name = this.__nameField.getValue().trim();
            if (name === "") {
                this.__nameField.setBackgroundColor("#ed8877");
                this.__nameField.setToolTipText("You must specify a name");
                return;
            }

            this.hide();

            if (!this.__series) {
                this.__series = new raceday.api.model.Series({});
            }

            this.__series.name = name;
            this.__series.description = this.__descriptionField.getValue().trim();

            this.fireDataEvent("confirmed", this.__series);
        },

        __onCancel: function(e) {
            this.hide();
        }
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
