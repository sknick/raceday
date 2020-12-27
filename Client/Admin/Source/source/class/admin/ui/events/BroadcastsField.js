/**
 * @asset(qx/icon/${qx.icontheme}/16/actions/list-add.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/list-remove.png)
 * @asset(qx/icon/${qx.icontheme}/16/apps/utilities-text-editor.png)
 */
qx.Class.define("admin.ui.events.BroadcastsField", {
    extend: qx.ui.container.Composite,

    construct: function(broadcasts) {
        this.base(arguments, new qx.ui.layout.Dock(5));

        this.__broadcasts = broadcasts ? broadcasts : [];

        this.__list = new qx.ui.form.List();
        this.__list.setHeight(130);
        this.__list.setSelectionMode("multi");

        this.__updateList();

        let addButton = new qx.ui.form.Button(null, "icon/16/actions/list-add.png");
        let editButton = new qx.ui.form.Button(null, "icon/16/apps/utilities-text-editor.png");
        let removeButton = new qx.ui.form.Button(null, "icon/16/actions/list-remove.png");

        let buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
        buttonContainer.add(addButton);
        buttonContainer.add(editButton);
        buttonContainer.add(removeButton);

        this.add(this.__list,     { edge: "center" });
        this.add(buttonContainer, { edge: "east" });

        addButton.addListener("execute", this.__onAddBroadcast, this);
        editButton.addListener("execute", this.__onEditBroadcast, this);
        removeButton.addListener("execute", this.__onRemoveBroadcast, this);
    },

    members: {
        getBroadcasts: function() {
            return this.__broadcasts;
        },

        __broadcastToString: function(broadcast) {
            let ret = broadcast.type_;
            if (broadcast.url) {
                ret += ": " + broadcast.url;
            }
            return ret;
        },

        __updateList: function() {
            let self = this;
            this.__broadcasts.sort(function(a, b) {
                if (self.__broadcastToString(a) < self.__broadcastToString(b)) {
                    return -1;
                } else if (self.__broadcastToString(a) > self.__broadcastToString(b)) {
                    return 1;
                } else {
                    return 0;
                }
            });
            this.__list.removeAll();

            for (let i = 0; i < this.__broadcasts.length; i++) {
                this.__list.add(new qx.ui.form.ListItem(this.__broadcastToString(this.__broadcasts[i]), null,
                    this.__broadcasts[i]));
            }
        },

        __onAddBroadcast: function(e) {
            let dlg = new admin.ui.events.EditBroadcastDialog();
            dlg.addListener("confirmed", this.__onAddBroadcastContinue, this);

            dlg.show();
        },

        __onAddBroadcastContinue: function(e) {
            this.__broadcasts.push(e.getData());
            this.__updateList();
        },

        __onEditBroadcast: function(e) {
            let selectedItems = this.__list.getSelection();
            if (selectedItems.length > 0) {
                let dlg = new admin.ui.events.EditBroadcastDialog(selectedItems[0].getModel());
                dlg.addListener("confirmed", this.__onEditBroadcastContinue, this);

                dlg.show();
            }
        },

        __onEditBroadcastContinue: function(e) {
            let broadcast = e.getData();
            let selectedItem = this.__list.getSelection()[0];

            selectedItem.setLabel(this.__broadcastToString(broadcast));
            selectedItem.setModel(broadcast);
        },

        __onRemoveBroadcast: function(e) {
            let selectedItems = this.__list.getSelection();
            if (selectedItems.length > 0) {
                for (let i = 0; i < selectedItems.length; i++) {
                    this.__list.remove(selectedItems[i]);
                }
            }

            let children = this.__list.getChildren();

            this.__broadcasts = [];
            for (let i = 0; i < children.length; i++) {
                this.__broadcasts.push(children[i].getModel());
            }
        }
    }
});
