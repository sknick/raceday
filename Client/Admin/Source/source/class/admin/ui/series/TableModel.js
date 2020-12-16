qx.Class.define("admin.ui.series.TableModel", {
    extend: admin.ui.RemoteTableModel,

    statics: {
        NAME_COLUMN:        0,
        DESCRIPTION_COLUMN: 1,
        HIDDEN_ID_COLUMN:   2,
        NUM_COLUMNS:        3
    },

    construct: function() {
        this.base(arguments, admin.ui.series.TableModel.NAME_COLUMN, true);

        this.setColumnSortable(admin.ui.series.TableModel.NAME_COLUMN, false);
        this.setColumnSortable(admin.ui.series.TableModel.DESCRIPTION_COLUMN, false);

        this.setColumns(["Name", "Description"], ["name", "description"]);

        this.__data = null;
    },

    members: {
        _loadRowCount: function() {
            if (this.getReady()) {
                admin.RequestManager.getInstance().getSeries(this).then(
                    function(e) {
                        let response = e.getResponse();

                        this.context.__data = [];
                        for (let i = 0; i < response.length; i++) {
                            this.context.__data.push(new raceday.api.model.Series(response[i]));
                        }

                        this.context._onRowCountLoaded(this.context.__data.length);
                    },

                    function(e) {
                        admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                    }
                )
            }
        },

        _loadRowData: function(firstRow, lastRow) {
            let newRows = [];
            for (let i = 0; i < this.__data.length; i++) {
                newRows.push({
                    name:        this.__data[i].name,
                    description: this.__data[i].description,
                    id:          this.__data[i].id
                });
            }

            if (newRows.length > 0) {
                this._onRowDataLoaded(newRows);
            }
        }
    }
});
