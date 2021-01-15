qx.Class.define("admin.ui.locations.EditDialog", {
    extend: admin.ui.DialogBase,

    construct: function(location) {
        this.__location = location;

        let nameLabel = new qx.ui.basic.Label("Name:");
        nameLabel.setAlignY("middle");

        this.__nameField = new qx.ui.form.TextField((this.__location && this.__location.name) ?
            this.__location.name : "");

        let descriptionLabel = new qx.ui.basic.Label("Description:");
        descriptionLabel.setPaddingTop(5);

        this.__descriptionField = new qx.ui.form.TextArea((this.__location && this.__location.description) ?
            this.__location.description : "");
        this.__descriptionField.setHeight(200);
        this.__descriptionField.setWidth(400);

        let content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));

        content.add(nameLabel,               { row: 0, column: 0 });
        content.add(this.__nameField,        { row: 0, column: 1 });
        content.add(descriptionLabel,        { row: 1, column: 0 });
        content.add(this.__descriptionField, { row: 1, column: 1 });

        let okButton = new qx.ui.form.Button(this.__location ? "OK" : "Add");
        okButton.setWidth(100);

        let cancelButton = new qx.ui.form.Button("Cancel");

        this.base(arguments, this.__location ? "Edit Location" : "Add Location", content, [okButton, cancelButton]);

        okButton.addListener("execute", this.__onOK, this);
        cancelButton.addListener("execute", this.__onCancel, this);
    },

    members: {
        __onOK: function(e) {
            let name = this.__nameField.getValue().trim();
            if (name === "") {
                this.__nameField.setBackgroundColor("#ed8877");
                this.__nameField.setToolTipText("You must specify a name");
                return;
            }

            this.hide();

            if (!this.__location) {
                this.__location = new raceday.api.model.Location({});
            }

            this.__location.name = name;
            this.__location.description = this.__descriptionField.getValue().trim();

            this.fireDataEvent("confirmed", this.__location);
        },

        __onCancel: function(e) {
            this.hide();
        }
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
