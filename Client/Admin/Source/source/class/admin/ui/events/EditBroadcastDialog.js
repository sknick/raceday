qx.Class.define("admin.ui.events.EditBroadcastDialog", {
    extend: admin.ui.DialogBase,

    construct: function(broadcast) {
        this.__broadcast = broadcast ? broadcast : new raceday.api.model.UnsavedBroadcast({});

        const typeLabel = new qx.ui.basic.Label("Type:");
        typeLabel.setAlignY("middle");

        this.__typeField = new qx.ui.form.SelectBox();
        this.__typeField.setWidth(400);

        this.__typeField.add(new qx.ui.form.ListItem("Cable"));
        this.__typeField.add(new qx.ui.form.ListItem("Facebook"));
        this.__typeField.add(new qx.ui.form.ListItem("MotorTrend"));
        this.__typeField.add(new qx.ui.form.ListItem("Other"));
        this.__typeField.add(new qx.ui.form.ListItem("YouTube"));

        const typeItems = this.__typeField.getChildren();

        let selectedItem = typeItems[0];
        if (this.__broadcast.type_) {
            for (let i = 0; i < typeItems.length; i++) {
                if (typeItems[i].getLabel() === this.__broadcast.type_) {
                    selectedItem = typeItems[i];
                    break;
                }
            }
        }

        this.__typeField.setSelection([selectedItem]);

        const urlLabel = new qx.ui.basic.Label("URL (if applicable):");
        urlLabel.setAlignY("middle");

        this.__urlField = new qx.ui.form.TextField();

        if (this.__broadcast.url) {
            this.__urlField.setValue(this.__broadcast.url);
        }

        const okButton = new qx.ui.form.Button(broadcast ? "OK" : "Add");
        okButton.setWidth(100);

        const cancelButton = new qx.ui.form.Button("Cancel");

        const content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));
        content.add(typeLabel,        { row: 0, column: 0 });
        content.add(this.__typeField, { row: 0, column: 1 });
        content.add(urlLabel,         { row: 1, column: 0 });
        content.add(this.__urlField,  { row: 1, column: 1 });

        this.base(arguments, broadcast ? "Edit Broadcast" : "Add Broadcast", content, [okButton, cancelButton]);

        okButton.addListener("execute", this.__onOK, this);
        cancelButton.addListener("execute", this.__onCancel, this);
    },

    members: {
        __onOK: function(e) {
            this.__broadcast.type_ = this.__typeField.getSelection()[0].getLabel();

            let url = this.__urlField.getValue();
            if (url) {
                url = url.trim();
                if (url === "") {
                    url = null;
                }
            }
            this.__broadcast.url = url;

            this.hide();
            this.fireDataEvent("confirmed", this.__broadcast);
        },

        __onCancel: function(e) {
            this.hide();
        }
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
