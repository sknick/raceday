/**
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-add.png)
 * @asset(qx/icon/${qx.icontheme}/32/apps/utilities-text-editor.png)
 */
qx.Class.define("admin.ui.locations.Page", {
    extend: qx.ui.tabview.Page,

    construct: function() {
        this.base(arguments, "Locations");
        this.setLayout(new qx.ui.layout.Canvas());

        let addButton = new qx.ui.toolbar.Button("Add", "icon/32/actions/list-add.png");
        let editButton = new qx.ui.toolbar.Button("Edit", "icon/32/apps/utilities-text-editor.png");

        let toolbar = new qx.ui.toolbar.ToolBar();
        toolbar.setPadding(0);

        toolbar.add(addButton);
        toolbar.add(editButton);

        this.__table = new qx.ui.table.Table(
            new admin.ui.locations.TableModel(),
            {
                tableColumnModel: function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            }
        );
        this.__table.setColumnVisibilityButtonVisible(false);
        this.__table.setShowCellFocusIndicator(false);
        this.__table.setStatusBarVisible(true);

        let resizeBehavior = this.__table.getTableColumnModel().getBehavior();
        resizeBehavior.setWidth(admin.ui.locations.TableModel.NAME_COLUMN,        400);
        resizeBehavior.setWidth(admin.ui.locations.TableModel.DESCRIPTION_COLUMN, "1*");

        let content = new qx.ui.container.Composite(new qx.ui.layout.Dock());
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
        __onAdd: function(e) {
            let dlg = new admin.ui.locations.EditDialog();
            dlg.addListener("confirmed", this.__onAddConfirmed, this);

            dlg.show();
        },

        __onAddConfirmed: function(e) {
            let location = e.getData();
            admin.RequestManager.getInstance().postLocation(
                this,
                location.name,
                location.description
            ).then(
                function(e) {
                    this.context.__table.getTableModel().refresh();
                },

                function(e) {
                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                }
            );
        },

        __onEdit: function(e) {
            let selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                let dlg = new admin.ui.locations.EditDialog(this.__table.getTableModel().getLocation(selectedRows[0].minIndex));
                dlg.addListener("confirmed", this.__onEditConfirmed, this);

                dlg.show();
            }
        },

        __onEditConfirmed: function(e) {
            let location = e.getData();
            admin.RequestManager.getInstance().putLocation(
                this,
                location.id,
                location.name,
                location.description
            ).then(
                function(e) {
                    this.context.__table.getTableModel().refresh();
                },

                function(e) {
                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                }
            );
        }
    }
});
