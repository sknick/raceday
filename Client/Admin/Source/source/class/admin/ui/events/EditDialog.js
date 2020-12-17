qx.Class.define("admin.ui.events.EditDialog", {
    extend: admin.ui.DialogBase,

    construct: function(event) {
        this.__event = event;

        let nameLabel = new qx.ui.basic.Label("Name:");
        nameLabel.setAlignY("middle");

        this.__nameField = new qx.ui.form.TextField(this.__event ? this.__event.name : "");

        let startLabel = new qx.ui.basic.Label("Start:");
        startLabel.setAlignY("middle");

        this.__startField = new admin.ui.DateTimeField();

        let descriptionLabel = new qx.ui.basic.Label("Description:");
        descriptionLabel.setPaddingTop(5);

        this.__descriptionField = new qx.ui.form.TextArea(this.__event ? this.__event.description : "");
        this.__descriptionField.setHeight(200);

        let content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));

        content.add(nameLabel,               { row: 0, column: 0 });
        content.add(this.__nameField,        { row: 0, column: 1 });
        content.add(startLabel,              { row: 1, column: 0 });
        content.add(this.__startField,       { row: 1, column: 1 });
        content.add(descriptionLabel,        { row: 2, column: 0 });
        content.add(this.__descriptionField, { row: 2, column: 1 });

        let okButton = new qx.ui.form.Button(this.__event ? "OK" : "Add");
        okButton.setWidth(100);

        let cancelButton = new qx.ui.form.Button("Cancel");

        this.base(arguments, this.__event ? "Edit Event" : "Add Event", content, [okButton, cancelButton]);

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

            if (!this.__event) {
                this.__event = new raceday.api.model.Event({});
            }

            this.__event.name = name;
            this.__event.description = this.__descriptionField.getValue().trim();

            this.fireDataEvent("confirmed", this.__event);
        },

        __onCancel: function(e) {
            this.hide();
        }
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
