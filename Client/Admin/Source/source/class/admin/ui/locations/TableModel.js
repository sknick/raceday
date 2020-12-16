qx.Class.define("admin.ui.locations.TableModel", {
    extend: admin.ui.RemoteTableModel,

    statics: {
        NAME_COLUMN:        0,
        DESCRIPTION_COLUMN: 1,
        NUM_COLUMNS:        2
    },

    construct: function() {
        this.base(arguments, admin.ui.locations.TableModel.NAME_COLUMN, true);

        this.setColumnSortable(admin.ui.locations.TableModel.NAME_COLUMN, false);
        this.setColumnSortable(admin.ui.locations.TableModel.DESCRIPTION_COLUMN, false);

        this.setColumns(["Name", "Description"], ["name", "description"]);

        this.__data = null;
    },

    members: {
        getLocation: function(rowIndex) {
            return this.getRowData(rowIndex).location;
        },

        _loadRowCount: function() {
            if (this.getReady()) {
                admin.RequestManager.getInstance().getLocations(
                    this
                ).then(
                    function(e) {
                        let response = e.getResponse();

                        this.context.__data = [];
                        for (let i = 0; i < response.length; i++) {
                            this.context.__data.push(new raceday.api.model.Location(response[i]));
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
                    location:    this.__data[i]
                });
            }

            if (newRows.length > 0) {
                this._onRowDataLoaded(newRows);
            }
        }
    }
});
