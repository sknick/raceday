qx.Class.define("admin.ui.events.EditDialog", {
    extend: admin.ui.DialogBase,

    construct: function(locations, series, event) {
        this.__event = event;

        let nameLabel = new qx.ui.basic.Label("Name:");
        nameLabel.setAlignY("middle");

        this.__nameField = new qx.ui.form.TextField(this.__event ? this.__event.name : "");

        let startLabel = new qx.ui.basic.Label("Start:");
        startLabel.setAlignY("middle");

        this.__startField = new admin.ui.DateTimeField();

        let locationLabel = new qx.ui.basic.Label("Location:");
        locationLabel.setAlignY("middle");


        let noLocationItem = new qx.ui.form.ListItem("(None)");

        this.__locationField = new qx.ui.form.SelectBox();
        this.__locationField.add(noLocationItem);

        let selectedLocationItem = noLocationItem;
        for (let i = 0; i < locations.length; i++) {
            let newItem = new qx.ui.form.ListItem(locations[i].name, null, locations[i]);
            this.__locationField.add(newItem);

            if (this.__event && this.__event.location && (this.__event.location.id === locations[i].id)) {
                selectedLocationItem = newItem;
            }
        }

        this.__locationField.setSelection([selectedLocationItem]);


        let noSeriesItem = new qx.ui.form.ListItem("(None)");

        let seriesLabel = new qx.ui.basic.Label("Series:");
        seriesLabel.setAlignY("middle");

        this.__seriesField = new qx.ui.form.SelectBox();
        this.__seriesField.add(noSeriesItem);

        let selectedSeriesItem = noSeriesItem;
        for (let i = 0; i < series.length; i++) {
            let newItem = new qx.ui.form.ListItem(series[i].name, null, series[i]);
            this.__seriesField.add(newItem);

            if (this.__event && this.__event.series && (this.__event.series.id === series[i].id)) {
                selectedSeriesItem = newItem;
            }
        }

        this.__seriesField.setSelection([selectedSeriesItem]);


        let descriptionLabel = new qx.ui.basic.Label("Description:");
        descriptionLabel.setPaddingTop(5);

        this.__descriptionField = new qx.ui.form.TextArea(this.__event ? this.__event.description : "");
        this.__descriptionField.setHeight(200);

        let content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));

        content.add(nameLabel,               { row: 0, column: 0 });
        content.add(this.__nameField,        { row: 0, column: 1 });
        content.add(startLabel,              { row: 1, column: 0 });
        content.add(this.__startField,       { row: 1, column: 1 });
        content.add(locationLabel,           { row: 2, column: 0 });
        content.add(this.__locationField,    { row: 2, column: 1 });
        content.add(seriesLabel,             { row: 3, column: 0 });
        content.add(this.__seriesField,      { row: 3, column: 1 });
        content.add(descriptionLabel,        { row: 4, column: 0 });
        content.add(this.__descriptionField, { row: 4, column: 1 });

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
