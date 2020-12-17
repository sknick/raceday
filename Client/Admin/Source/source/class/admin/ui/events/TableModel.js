qx.Class.define("admin.ui.events.TableModel", {
    extend: admin.ui.RemoteTableModel,

    statics: {
        NAME_COLUMN:        0,
        START_COLUMN:       1,
        LOCATION_COLUMN:    2,
        SERIES_COLUMN:      3,
        NUM_COLUMNS:        4
    },

    construct: function() {
        this.base(arguments, admin.ui.events.TableModel.NAME_COLUMN, true);

        for (let i = 0; i < admin.ui.events.TableModel.NUM_COLUMNS; i++) {
            this.setColumnSortable(i, false);
        }

        this.setColumns(["Name", "Start", "Location", "Series"], ["name", "start", "location", "series"]);

        this.__data = null;
    },

    members: {
        getEvent: function(rowIndex) {
            return this.getRowData(rowIndex).event;
        },

        _loadRowCount: function() {
            if (this.getReady()) {
                admin.RequestManager.getInstance().getEvents(
                    this,
                    Math.round((Date.now() - 86400) / 1000)
                ).then(
                    function(e) {
                        let response = e.getResponse();

                        this.context.__data = [];
                        for (let i = 0; i < response.length; i++) {
                            this.context.__data.push(new raceday.api.model.Event(response[i]));
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
                    name:     this.__data[i].name,
                    start:    new Date(this.__data[i].start * 1000),
                    location: this.__data[i].location ? this.__data[i].location.name : "",
                    series:   this.__data[i].series ? this.__data[i].series.name : "",
                    event:    this.__data[i]
                });
            }

            if (newRows.length > 0) {
                this._onRowDataLoaded(newRows);
            }
        }
    }
});
