qx.Class.define("admin.ui.events.TableModel", {
    extend: admin.ui.RemoteTableModel,

    statics: {
        START_COLUMN:       0,
        NAME_COLUMN:        1,
        LOCATION_COLUMN:    2,
        SERIES_COLUMN:      3,
        NUM_COLUMNS:        4
    },

    construct: function() {
        this.base(arguments, admin.ui.events.TableModel.START_COLUMN, true);

        for (let i = 0; i < admin.ui.events.TableModel.NUM_COLUMNS; i++) {
            this.setColumnSortable(i, false);
        }

        this.setColumns(["Start", "Name", "Location", "Series"], ["start", "name", "location", "series"]);

        this.__data = null;
    },

    members: {
        getEvent: function(rowIndex) {
            return this.getRowData(rowIndex).event;
        },

        _loadRowCount: function() {
            if (this.getReady()) {
                let nowTimestamp = Math.round(Date.now() / 1000);

                admin.RequestManager.getInstance().getEvents(
                    this,
                    nowTimestamp - (86400 * 14),
                    -1,
                    Intl.DateTimeFormat().resolvedOptions().timeZone
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
                    start:    new Date(this.__data[i].start * 1000).toLocaleString([], {timeZoneName: "short"}),
                    name:     this.__data[i].name,
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
