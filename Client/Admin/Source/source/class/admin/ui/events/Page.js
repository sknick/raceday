/**
 * @asset(qx/icon/${qx.icontheme}/32/actions/edit-copy.png)
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-add.png)
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-remove.png)
 * @asset(qx/icon/${qx.icontheme}/32/apps/utilities-text-editor.png)
 */
qx.Class.define("admin.ui.events.Page", {
    extend: qx.ui.tabview.Page,

    construct() {
        this.base(arguments, "Events");
        this.setLayout(new qx.ui.layout.Canvas());

        const addButton = new qx.ui.toolbar.Button("Add", "icon/32/actions/list-add.png");
        const editButton = new qx.ui.toolbar.Button("Edit", "icon/32/apps/utilities-text-editor.png");
        const duplicateButton = new qx.ui.toolbar.Button("Duplicate", "icon/32/actions/edit-copy.png");
        const deleteButton = new qx.ui.toolbar.Button("Delete", "icon/32/actions/list-remove.png");

        const toolbar = new qx.ui.toolbar.ToolBar();
        toolbar.setPadding(0);

        toolbar.add(addButton);
        toolbar.add(editButton);
        toolbar.add(duplicateButton);
        toolbar.add(deleteButton);

        this.__table = new qx.ui.table.Table(
            new admin.ui.events.TableModel(),
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
        resizeBehavior.setWidth(admin.ui.events.TableModel.START_COLUMN,    250);
        resizeBehavior.setWidth(admin.ui.events.TableModel.NAME_COLUMN,     "1*");
        resizeBehavior.setWidth(admin.ui.events.TableModel.LOCATION_COLUMN, 300);
        resizeBehavior.setWidth(admin.ui.events.TableModel.SERIES_COLUMN,   350);

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
        duplicateButton.addListener("execute", this.__onDuplicate, this);
        deleteButton.addListener("execute", this.__onDelete, this);
        this.__table.addListener("cellDbltap", this.__onEdit, this);

        this.__table.getTableModel().setReady(true);
    },

    members: {
        async __onAdd(e) {
            try {
                const locations = await admin.RequestManager.getInstance().getLocations();
                const series = await admin.RequestManager.getInstance().getSeries();

                const dlg = new admin.ui.events.EditDialog(locations, series);
                dlg.addListener("confirmed", this.__onAddConfirmed, this);

                dlg.show();
            } catch (ex) {
                admin.ui.MainWindow.handleError(ex);
            }
        },

        async __onAddConfirmed(e) {
            const data = e.getData();

            try {
                const eventId = await admin.RequestManager.getInstance().postEvent(
                    data.event.name,
                    data.event.start,
                    data.event.description,
                    data.event.location ? data.event.location.id : null,
                    data.event.series ? data.event.series.id : null
                );

                if (data.broadcasts.length === 0) {
                    this.__table.getTableModel().refresh();
                } else {
                    for (let i = 0; i < data.broadcasts.length; i++) {
                        data.broadcasts[i].eventId = eventId;
                    }

                    await admin.RequestManager.getInstance().postBroadcasts(data.broadcasts);

                    this.__table.getTableModel().refresh();
                }
            } catch (ex) {
                admin.ui.MainWindow.handleError(ex);
            }
        },

        __onDelete(e) {
            const selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                const dlg = new admin.ui.ConfirmationDialog(
                    admin.Application.APP_TITLE,
                    "Are you sure you want to delete this event?",
                    this.__table.getTableModel().getEvent(selectedRows[0].minIndex)
                );
                dlg.addListener("confirmed", this.__onDeleteContinue, this);

                dlg.show();
            }
        },

        async __onDeleteContinue(e) {
            const event = e.getData();

            try {
                await admin.RequestManager.getInstance().deleteEvent(event.id);

                this.__table.getTableModel().refresh();
                this.__table.getSelectionModel().resetSelection();
            } catch (ex) {
                admin.ui.MainWindow.handleError(ex);
            }
        },

        async __onDuplicate(e) {
            const selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                try {
                    const locations = await admin.RequestManager.getInstance().getLocations();
                    const series = await admin.RequestManager.getInstance().getSeries();
                    const event = this.__table.getTableModel().getEvent(selectedRows[0].minIndex);
                    const broadcasts = await admin.RequestManager.getInstance().getBroadcasts(event.id, null, null, false);

                    const dlg = new admin.ui.events.EditDialog(locations, series, event, broadcasts, true);
                    dlg.addListener("confirmed", this.__onAddConfirmed, this);

                    dlg.show();
                } catch (ex) {
                    admin.ui.MainWindow.handleError(ex);
                }
            }
        },

        async __onEdit(e) {
            const selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                try {
                    const locations = await admin.RequestManager.getInstance().getLocations();
                    const series = await admin.RequestManager.getInstance().getSeries();
                    const event = this.__table.getTableModel().getEvent(selectedRows[0].minIndex);
                    const broadcasts = admin.RequestManager.getInstance().getBroadcasts(event.id, null, null, false);

                    const dlg = new admin.ui.events.EditDialog(locations, series, event, broadcasts);
                    dlg.addListener("confirmed", this.__onEditConfirmed, this);

                    dlg.show();
                } catch (ex) {
                    admin.ui.MainWindow.handleError(ex);
                }
            }
        },

        async __onEditConfirmed(e) {
            const data = e.getData();

            try {
                await admin.RequestManager.getInstance().putEvent(
                    data.event.id,
                    data.event.name,
                    data.event.start,
                    data.event.description,
                    data.event.location ? data.event.location.id : null,
                    data.event.series ? data.event.series.id : null
                );
                
                if (data.broadcasts.length === 0) {
                    this.__table.getTableModel().refresh();
                } else {
                    const broadcasts = [];
                    const unsavedBroadcasts = [];

                    for (let i = 0; i < data.broadcasts.length; i++) {
                        if (data.broadcasts[i] instanceof raceday.api.model.Broadcast) {
                            broadcasts.push(data.broadcasts[i]);
                        } else {
                            data.broadcasts[i].eventId = data.event.id;
                            unsavedBroadcasts.push(data.broadcasts[i]);
                        }
                    }

                    if (broadcasts.length === 0) {
                        if (unsavedBroadcasts.length > 0) {
                            await admin.RequestManager.getInstance().postBroadcasts(unsavedBroadcasts);

                            this.__table.getTableModel().refresh();
                        } else {
                            this.__table.getTableModel().refresh();
                        }
                    } else {
                        await admin.RequestManager.getInstance().putBroadcasts(broadcasts);

                        if (unsavedBroadcasts.length > 0) {
                            await admin.RequestManager.getInstance().postBroadcasts(unsavedBroadcasts);

                            this.__table.getTableModel().refresh();
                        } else {
                            this.__table.getTableModel().refresh();
                        }
                    }

                    if (data.deletedBroadcasts.length > 0) {
                        const ids = [];
                        for (let i = 0; i < data.deletedBroadcasts.length; i++) {
                            ids.push(data.deletedBroadcasts[i].id);
                        }

                        await admin.RequestManager.getInstance().deleteBroadcasts(ids);
                    }
                }
            } catch (ex) {
                admin.ui.MainWindow.handleError(ex);
            }
        }
    }
});
