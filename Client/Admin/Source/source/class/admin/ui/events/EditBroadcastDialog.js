qx.Class.define("admin.ui.events.EditBroadcastDialog", {
    extend: admin.ui.DialogBase,

    construct(broadcast) {
        this.__broadcast = broadcast ? broadcast : new raceday.api.model.UnsavedBroadcast({});


        const typeLabel = new qx.ui.basic.Label("Type:");
        typeLabel.setAlignY("middle");

        this.__typeField = new qx.ui.form.SelectBox();
        this.__typeField.setWidth(400);

        for (let i = 0; i < raceday.api.model.BroadcastType.VALUES.length; i++) {
            this.__typeField.add(
                new qx.ui.form.ListItem(
                    raceday.api.model.BroadcastType.VALUES[i].toString(),
                    null,
                    raceday.api.model.BroadcastType.VALUES[i]
                )
            );
        }

        const typeItems = this.__typeField.getChildren();

        let selectedItem = typeItems[0];
        if (this.__broadcast.type_) {
            for (let i = 0; i < typeItems.length; i++) {
                if (typeItems[i].getLabel() === this.__broadcast.type_.toString()) {
                    selectedItem = typeItems[i];
                    break;
                }
            }
        }

        this.__typeField.setSelection([selectedItem]);


        const descriptionLabel = new qx.ui.basic.Label("Description:");
        descriptionLabel.setAlignY("middle");

        this.__descriptionField = new qx.ui.form.TextField();

        if (this.__broadcast.description) {
            this.__descriptionField.setValue(this.__broadcast.description);
        }


        const urlLabel = new qx.ui.basic.Label("URL (if applicable):");
        urlLabel.setAlignY("middle");

        this.__urlField = new qx.ui.form.TextField();

        if (this.__broadcast.url) {
            this.__urlField.setValue(this.__broadcast.url);
        }


        const geoblockedLabel = new qx.ui.basic.Label("Geoblocked:");
        geoblockedLabel.setAlignY("middle");

        this.__geoblockedField = new qx.ui.form.SelectBox();

        this.__geoblockedField.add(new qx.ui.form.ListItem("Unknown/Unspecified", null, null));
        this.__geoblockedField.add(new qx.ui.form.ListItem("Yes", null, true));
        this.__geoblockedField.add(new qx.ui.form.ListItem("No", null, false));

        const geoblockedItems = this.__geoblockedField.getChildren();

        selectedItem = geoblockedItems[0];
        for (let i = 0; i < geoblockedItems.length; i++) {
            if (geoblockedItems[i].getModel() === this.__broadcast.geoblocked) {
                selectedItem = geoblockedItems[i];
                break;
            }
        }

        this.__geoblockedField.setSelection([selectedItem]);


        const paidLabel = new qx.ui.basic.Label("Paid:");
        paidLabel.setAlignY("middle");

        this.__paidField = new qx.ui.form.SelectBox();

        this.__paidField.add(new qx.ui.form.ListItem("Unknown/Unspecified", null, null));
        this.__paidField.add(new qx.ui.form.ListItem("Yes", null, true));
        this.__paidField.add(new qx.ui.form.ListItem("No", null, false));

        const paidItems = this.__paidField.getChildren();

        selectedItem = paidItems[0];
        for (let i = 0; i < paidItems.length; i++) {
            if (paidItems[i].getModel() === this.__broadcast.paid) {
                selectedItem = paidItems[i];
                break;
            }
        }

        this.__paidField.setSelection([selectedItem]);


        const langsLabel = new qx.ui.basic.Label("Language(s):");

        const langItems = [];

        for (let i = 0; i < admin.ui.MainWindow.LANGS.length; i++) {
            if (admin.ui.MainWindow.LANGS[i].priorityListing) {
                langItems.push(
                    new qx.ui.form.CheckBox(
                        admin.ui.MainWindow.LANGS[i].htmlCode + " " +
                        admin.ui.MainWindow.LANGS[i].id
                    ).set(
                        {
                            model: admin.ui.MainWindow.LANGS[i],
                            rich:  true,
                            value: this.__isLangSelected(admin.ui.MainWindow.LANGS[i], this.__broadcast.langIds)
                        }
                    )
                );
            }
        }

        langItems.push(null);
        
        for (let i = 0; i < admin.ui.MainWindow.LANGS.length; i++) {
            if (!admin.ui.MainWindow.LANGS[i].priorityListing) {
                langItems.push(
                    new qx.ui.form.CheckBox(
                        admin.ui.MainWindow.LANGS[i].htmlCode + " " +
                        admin.ui.MainWindow.LANGS[i].id
                    ).set(
                        {
                            model: admin.ui.MainWindow.LANGS[i],
                            rich:  true,
                            value: this.__isLangSelected(admin.ui.MainWindow.LANGS[i], this.__broadcast.langIds)
                        }
                    )
                );
            }
        }

        this.__langsField = new admin.ui.form.CheckBoxList(150, langItems);


        const okButton = new qx.ui.form.Button(broadcast ? "OK" : "Add");
        okButton.setWidth(100);

        const cancelButton = new qx.ui.form.Button("Cancel");

        const content = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));
        content.add(typeLabel,                { row: 0, column: 0 });
        content.add(this.__typeField,         { row: 0, column: 1 });
        content.add(descriptionLabel,         { row: 1, column: 0 });
        content.add(this.__descriptionField,  { row: 1, column: 1 });
        content.add(urlLabel,                 { row: 2, column: 0 });
        content.add(this.__urlField,          { row: 2, column: 1 });
        content.add(geoblockedLabel,          { row: 3, column: 0 });
        content.add(this.__geoblockedField,   { row: 3, column: 1 });
        content.add(paidLabel,                { row: 4, column: 0 });
        content.add(this.__paidField,         { row: 4, column: 1 });
        content.add(langsLabel,               { row: 5, column: 0 });
        content.add(this.__langsField,        { row: 5, column: 1 });

        this.base(arguments, broadcast ? "Edit Broadcast" : "Add Broadcast", content, [okButton, cancelButton]);

        okButton.addListener("execute", this.__onOK, this);
        cancelButton.addListener("execute", this.__onCancel, this);
    },

    members: {
        __isLangSelected(lang, selectedLangIds) {
            if (selectedLangIds) {
                for (let i = 0; i < selectedLangIds.length; i++) {
                    if (lang.id === selectedLangIds[i]) {
                        return true
                    }
                }
            }

            return false;
        },

        __onOK(e) {
            this.__broadcast.type_ = this.__typeField.getSelection()[0].getModel();

            let description = this.__descriptionField.getValue();
            if (description) {
                description = description.trim();
                if (description === "") {
                    description = null;
                }
            }
            this.__broadcast.description = description;

            let url = this.__urlField.getValue();
            if (url) {
                url = url.trim();
                if (url === "") {
                    url = null;
                }
            }
            this.__broadcast.url = url;

            this.__broadcast.geoblocked = this.__geoblockedField.getSelection()[0].getModel();
            this.__broadcast.paid = this.__paidField.getSelection()[0].getModel();

            this.__broadcast.langIds = [];

            const selectedCheckBoxes = this.__langsField.getSelectedCheckBoxes();
            for (let i = 0; i < selectedCheckBoxes.length; i++) {
                this.__broadcast.langIds.push(selectedCheckBoxes[i].getModel().id);
            }

            this.hide();
            this.fireDataEvent("confirmed", this.__broadcast);
        },

        __onCancel(e) {
            this.hide();
        }
    },

    events: {
        "confirmed": "qx.event.type.Data"
    }
});
