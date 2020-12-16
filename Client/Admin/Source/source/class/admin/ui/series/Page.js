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

        this.__tableModel = new admin.ui.series.TableModel();

        let table = new qx.ui.table.Table(
            this.__tableModel,
            {
                tableColumnModel: function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            }
        );
        table.setColumnVisibilityButtonVisible(false);
        table.setShowCellFocusIndicator(false);

        let resizeBehavior = table.getTableColumnModel().getBehavior();
        resizeBehavior.setWidth(admin.ui.series.TableModel.NAME_COLUMN,        400);
        resizeBehavior.setWidth(admin.ui.series.TableModel.DESCRIPTION_COLUMN, "1*");

        let content = new qx.ui.container.Composite(new qx.ui.layout.Dock());
        content.add(toolbar, { edge: "north" });
        content.add(table,   { edge: "center" });

        this.add(content, {
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
        });

        this.__tableModel.setReady(true);
    }
});
