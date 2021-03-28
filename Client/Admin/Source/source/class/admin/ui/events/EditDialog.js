qx.Class.define("admin.ui.events.EditDialog", {
    extend: admin.ui.DialogBase,

    construct: function(locations, series, event, eventBroadcasts, duplicating) {
        this.__event = event;

        if (!duplicating) {
            this.__broadcasts = eventBroadcasts ? eventBroadcasts : [];
        } else {
            this.__broadcasts = [];
            for (let i = 0; i < eventBroadcasts.length; i++) {
                this.__broadcasts.push(new raceday.api.model.UnsavedBroadcast(eventBroadcasts[i]));
            }
        }

        const nameLabel = new qx.ui.basic.Label("Name:");
        nameLabel.setAlignY("middle");

        this.__nameField = new qx.ui.form.TextField((!duplicating && this.__event && this.__event.name) ? this.__event.name : "");

        const startLabel = new qx.ui.basic.Label("Start (" + new Date().toLocaleTimeString(undefined, {timeZoneName: "short"}).split(" ")[2] + "):");
        startLabel.setAlignY("middle");

        this.__startField = new admin.ui.DateTimeField((this.__event && this.__event.start) ?
            this.__event.start : null);

            const locationLabel = new qx.ui.basic.Label("Location:");
        locationLabel.setAlignY("middle");


        const noLocationItem = new qx.ui.form.ListItem("(None)");

        this.__locationField = new qx.ui.form.SelectBox();
        this.__locationField.add(noLocationItem);

        let selectedLocationItem = noLocationItem;
        for (let i = 0; i < locations.length; i++) {
            const newItem = new qx.ui.form.ListItem(locations[i].name, null, locations[i]);
            this.__locationField.add(newItem);

            if (this.__event && this.__event.location && (this.__event.location.id === locations[i].id)) {
                selectedLocationItem = newItem;
            }
        }

        this.__locationField.setSelection([selectedLocationItem]);


        const noSeriesItem = new qx.ui.form.ListItem("(None)");

        const seriesLabel = new qx.ui.basic.Label("Series:");
        seriesLabel.setAlignY("middle");

        this.__seriesField = new qx.ui.form.SelectBox();
        this.__seriesField.add(noSeriesItem);

        let selectedSeriesItem = noSeriesItem;
        for (let i = 0; i < series.length; i++) {
            const newItem = new qx.ui.form.ListItem(series[i].name, null, series[i]);
            this.__seriesField.add(newItem);

            if (this.__event && this.__event.series && (this.__event.series.id === series[i].id)) {
                selectedSeriesItem = newItem;
            }
        }

        this.__seriesField.setSelection([selectedSeriesItem]);


        const descriptionLabel = new qx.ui.basic.Label("Description:");
        descriptionLabel.setPaddingTop(5);

        this.__descriptionField = new qx.ui.form.TextArea((this.__event && this.__event.description) ?
            this.__event.description : "");
        this.__descriptionField.setHeight(100);


        const broadcastsLabel = new qx.ui.basic.Label("Broadcasts:");

        this.__broadcastsField = new admin.ui.events.BroadcastsField(this.__broadcasts);


        const content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));

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
        content.add(broadcastsLabel,         { row: 5, column: 0 });
        content.add(this.__broadcastsField,  { row: 5, column: 1 });

        const okButton = new qx.ui.form.Button(this.__event && !duplicating ? "OK" : "Add");
        okButton.setWidth(100);

        const cancelButton = new qx.ui.form.Button("Cancel");

        this.base(arguments, this.__event && !duplicating ? "Edit Event" : "Add Event", content, [okButton, cancelButton]);

        okButton.addListener("execute", this.__onOK, this);
        cancelButton.addListener("execute", this.__onCancel, this);

        if (duplicating) {
            this.__event = null;
        }
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

            if (!this.__event) {
                this.__event = new raceday.api.model.Event({});
            }

            this.__event.name = name;
            this.__event.start = this.__startField.getTime();
            this.__event.description = this.__descriptionField.getValue().trim();
            this.__event.location = this.__locationField.getSelection()[0].getModel();
            this.__event.series = this.__seriesField.getSelection()[0].getModel();

            const broadcasts = this.__broadcastsField.getBroadcasts();

            const deletedBroadcasts = [];
            for (let i = 0; i < this.__broadcasts.length; i++) {
                let found = false;
                for (let j = 0; j < broadcasts.length; j++) {
                    if (this.__broadcasts[i].id && (this.__broadcasts[i].id === broadcasts[j].id)) {
                        found = true;
                        break;
                    }
                }

                if (!found && this.__broadcasts[i].id) {
                    deletedBroadcasts.push(this.__broadcasts[i]);
                }
            }

            this.fireDataEvent("confirmed", {
                event:             this.__event,
                broadcasts:        broadcasts,
                deletedBroadcasts: deletedBroadcasts
            });
        },

        __onCancel: function(e) {
            this.hide();
        }
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
