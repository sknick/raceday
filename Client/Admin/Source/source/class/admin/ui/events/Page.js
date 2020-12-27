/**
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-add.png)
 * @asset(qx/icon/${qx.icontheme}/32/actions/list-remove.png)
 * @asset(qx/icon/${qx.icontheme}/32/apps/utilities-text-editor.png)
 */
qx.Class.define("admin.ui.events.Page", {
    extend: qx.ui.tabview.Page,

    construct: function() {
        this.base(arguments, "Events");
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
            new admin.ui.events.TableModel(),
            {
                tableColumnModel: function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            }
        );
        this.__table.setColumnVisibilityButtonVisible(false);
        this.__table.setShowCellFocusIndicator(false);

        let resizeBehavior = this.__table.getTableColumnModel().getBehavior();
        resizeBehavior.setWidth(admin.ui.events.TableModel.START_COLUMN,    300);
        resizeBehavior.setWidth(admin.ui.events.TableModel.NAME_COLUMN,     "1*");
        resizeBehavior.setWidth(admin.ui.events.TableModel.LOCATION_COLUMN, 400);
        resizeBehavior.setWidth(admin.ui.events.TableModel.SERIES_COLUMN,   400);

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
            admin.RequestManager.getInstance().getLocations(
                this
            ).then(
                function(e) {
                    let response = e.getResponse();

                    let locations = [];
                    for (let i = 0; i < response.length; i++) {
                        locations.push(new raceday.api.model.Location(response[i]));
                    }

                    admin.RequestManager.getInstance().getSeries(
                        this.context
                    ).then(
                        function(e) {
                            let response = e.getResponse();

                            let series = [];
                            for (let i = 0; i < response.length; i++) {
                                series.push(new raceday.api.model.Series(response[i]));
                            }

                            let dlg = new admin.ui.events.EditDialog(locations, series);
                            dlg.addListener("confirmed", this.context.__onAddConfirmed, this.context);

                            dlg.show();
                        },

                        function(e) {
                            admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                        }
                    );
                },

                function(e) {
                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                }
            )
        },

        __onAddConfirmed: function(e) {
            let data = e.getData();
            admin.RequestManager.getInstance().postEvent(
                this,
                data.event.name,
                data.event.start,
                data.event.description,
                data.event.location ? data.event.location.id : null,
                data.event.series ? data.event.series.id : null
            ).then(
                function(e) {
                    let eventId = e.getResponse();

                    // TODO: This sucks. Make a single API that we can call, or at least wait on each before moving on.
                    for (let i = 0; i < data.broadcasts.length; i++) {
                        admin.RequestManager.getInstance().postBroadcast(
                            this.context,
                            data.broadcasts[i].type_,
                            eventId,
                            data.broadcasts[i].url
                        ).then(
                            function (e) {
                                if (i === (data.broadcasts.length - 1)) {
                                    this.context.__table.getTableModel().reloadData();
                                }
                            },

                            function (e) {
                                admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                            }
                        );
                    }
                },

                function(e) {
                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                }
            );
        },

        __onEdit: function(e) {
            let selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                admin.RequestManager.getInstance().getLocations(
                    this
                ).then(
                    function(e) {
                        let response = e.getResponse();

                        let locations = [];
                        for (let i = 0; i < response.length; i++) {
                            locations.push(new raceday.api.model.Location(response[i]));
                        }

                        admin.RequestManager.getInstance().getSeries(
                            this.context
                        ).then(
                            function(e) {
                                response = e.getResponse();

                                let series = [];
                                for (let i = 0; i < response.length; i++) {
                                    series.push(new raceday.api.model.Series(response[i]));
                                }

                                let event = this.context.__table.getTableModel().getEvent(selectedRows[0].minIndex);

                                admin.RequestManager.getInstance().getBroadcasts(
                                    this.context,
                                    event.id,
                                    null,
                                    null,
                                    false
                                ).then(
                                    function(e) {
                                        response = e.getResponse();

                                        let broadcasts = [];
                                        for (let i = 0; i < response.length; i++) {
                                            broadcasts.push(new raceday.api.model.Broadcast(response[i]));
                                        }

                                        let dlg = new admin.ui.events.EditDialog(locations, series, event, broadcasts);
                                        dlg.addListener("confirmed", this.context.__onEditConfirmed, this.context);

                                        dlg.show();
                                    },

                                    function(e) {
                                        admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                                    }
                                );
                            },

                            function(e) {
                                admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                            }
                        )
                    },

                    function(e) {
                        admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                    }
                );
            }
        },

        __onEditConfirmed: function(e) {
            let data = e.getData();

            admin.RequestManager.getInstance().putEvent(
                this,
                data.event.id,
                data.event.name,
                data.event.start,
                data.event.description,
                data.event.location ? data.event.location.id : null,
                data.event.series ? data.event.series.id : null
            ).then(
                function(e) {
                    // TODO: This sucks. Make a single API that we can call, or at least wait on each before moving on.
                    for (let i = 0; i < data.broadcasts.length; i++) {
                        if (data.broadcasts[i].id) {
                            admin.RequestManager.getInstance().putBroadcast(
                                this.context,
                                data.broadcasts[i].id,
                                data.broadcasts[i].type_,
                                data.event.id,
                                data.broadcasts[i].url
                            ).then(
                                function (e) {
                                    if (i === (data.broadcasts.length - 1)) {
                                        this.context.__table.getTableModel().reloadData();
                                    }
                                },

                                function (e) {
                                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                                }
                            );
                        } else {
                            admin.RequestManager.getInstance().postBroadcast(
                                this.context,
                                data.broadcasts[i].type_,
                                data.event.id,
                                data.broadcasts[i].url
                            ).then(
                                function (e) {
                                    if (i === (data.broadcasts.length - 1)) {
                                        this.context.__table.getTableModel().reloadData();
                                    }
                                },

                                function (e) {
                                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                                }
                            );
                        }
                    }

                    for (let i = 0; i < data.deletedBroadcasts.length; i++) {
                        admin.RequestManager.getInstance().deleteBroadcast(
                            this.context,
                            data.deletedBroadcasts[i].id
                        ).then(
                            function(e) {
                                // Do nothing
                            },

                            function (e) {
                                admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                            }
                        )
                    }
                },

                function(e) {
                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                }
            );
        },

        __onDelete: function(e) {
            let selectedRows = this.__table.getSelectionModel().getSelectedRanges();
            if (selectedRows.length > 0) {
                let dlg = new admin.ui.ConfirmationDialog(
                    admin.Application.APP_TITLE,
                    "Are you sure you want to delete this event?",
                    this.__table.getTableModel().getEvent(selectedRows[0].minIndex)
                );
                dlg.addListener("confirmed", this.__onDeleteContinue, this);

                dlg.show();
            }
        },

        __onDeleteContinue: function(e) {
            let event = e.getData();
            admin.RequestManager.getInstance().deleteEvent(
                this,
                event.id
            ).then(
                function(e) {
                    this.context.__table.getTableModel().reloadData();
                },

                function(e) {
                    admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                }
            );
        }
    }
});
