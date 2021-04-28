/**
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-add.png)
 * @asset(qx/icon/${qx.icontheme}/32/apps/utilities-text-editor.png)
 */
qx.Class.define("admin.ui.locations.Page", {
    extend: qx.ui.tabview.Page,

    construct() {
        this.base(arguments, "Locations");
        this.setLayout(new qx.ui.layout.Canvas());

        const addButton = new qx.ui.toolbar.Button("Add", "icon/32/actions/list-add.png");
        const editButton = new qx.ui.toolbar.Button("Edit", "icon/32/apps/utilities-text-editor.png");

        const toolbar = new qx.ui.toolbar.ToolBar();
        toolbar.setPadding(0);

        toolbar.add(addButton);
        toolbar.add(editButton);

        this.__table = new qx.ui.table.Table(
            new admin.ui.locations.TableModel(),
            {
                tableColumnModel(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            }
        );
        this.__table.setColumnVisibilityButtonVisible(false);
        this.__table.setShowCellFocusIndicator(false);
        this.__table.setStatusBarVisible(true);

        const resizeBehavior = this.__table.getTableColumnModel().getBehavior();
        resizeBehavior.setWidth(admin.ui.locations.TableModel.NAME_COLUMN,        400);
        resizeBehavior.setWidth(admin.ui.locations.TableModel.DESCRIPTION_COLUMN, "1*");

        const content = new qx.ui.container.Composite(new qx.ui.layout.Dock());
        content.add(toolbar,      { edge: "north" });
        content.add(this.__table, { edge: "center" });

        this.add(content, {
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
        });

        addButton.addListener("execute", this.__onAdd, this);
        editButton.addListener("execute", this.__onEdit, this);
        this.__table.addListener("cellDbltap", this.__onEdit, this);

        this.__table.getTableModel().setReady(true);
    },

    members: {
        __onAdd(e) {
            const dlg = new admin.ui.locations.EditDialog();
            dlg.addListener("confirmed", this.__onAddConfirmed, this);

            dlg.show();
        },

        async __onAddConfirmed(e) {
            const location = e.getData();
            
            try {
                await admin.RequestManager.getInstance().postLocation(location.name, location.description);

                this.__table.getTableModel().refresh();
            } catch (ex) {
                // TODO
                console.error(ex);
            }
        },

        __onEdit(e) {
            const selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                const dlg = new admin.ui.locations.EditDialog(this.__table.getTableModel().getLocation(selectedRows[0].minIndex));
                dlg.addListener("confirmed", this.__onEditConfirmed, this);

                dlg.show();
            }
        },

        async __onEditConfirmed(e) {
            const location = e.getData();

            try {
                await admin.RequestManager.getInstance().putLocation(location.id, location.name, location.description);

                this.__table.getTableModel().refresh();
            } catch (ex) {
                // TODO
                console.error(ex);
            }
        }
    }
});
