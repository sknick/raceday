/**
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-add.png)
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-remove.png)
 * @asset(qx/icon/${qx.icontheme}/32/apps/utilities-text-editor.png)
 */
qx.Class.define("admin.ui.series.Page", {
    extend: qx.ui.tabview.Page,

    construct: function() {
        this.base(arguments, "Series");
        this.setLayout(new qx.ui.layout.Canvas());

        let addButton = new qx.ui.toolbar.Button("Add", "icon/32/actions/list-add.png");
        let editButton = new qx.ui.toolbar.Button("Edit", "icon/32/apps/utilities-text-editor.png");
        let deleteButton = new qx.ui.toolbar.Button("Delete", "icon/32/actions/list-remove.png")

        let toolbar = new qx.ui.toolbar.ToolBar();
        toolbar.setPadding(0);

        toolbar.add(addButton);
        toolbar.add(editButton);
        toolbar.add(deleteButton);

        this.__table = new qx.ui.table.Table(
            new admin.ui.series.TableModel(),
            {
                tableColumnModel: function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            }
        );
        this.__table.setColumnVisibilityButtonVisible(false);
        this.__table.setShowCellFocusIndicator(false);

        let resizeBehavior = this.__table.getTableColumnModel().getBehavior();
        resizeBehavior.setWidth(admin.ui.series.TableModel.NAME_COLUMN,        400);
        resizeBehavior.setWidth(admin.ui.series.TableModel.DESCRIPTION_COLUMN, "1*");

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
        deleteButton.addListener("execute", this.__onDelete, this);

        this.__table.getTableModel().setReady(true);
    },

    members: {
        __onAdd: function(e) {
            let dlg = new admin.ui.series.EditDialog();
            dlg.addListener("confirmed", this.__onAddConfirmed, this);

            dlg.show();
        },

        __onAddConfirmed: function(e) {
            let series = e.getData();
            console.log(series);
        },

        __onEdit: function(e) {
            let selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                let dlg = new admin.ui.series.EditDialog(this.__table.getTableModel().getSeries(selectedRows[0].minIndex));
                dlg.addListener("confirmed", this.__onEditConfirmed, this);

                dlg.show();
            }
        },

        __onEditConfirmed: function(e) {
            let series = e.getData();
            console.log(series);
        },

        __onDelete: function(e) {

        }
    }
});
