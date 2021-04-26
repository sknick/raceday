/**
 * @ignore Intl.DateTimeFormat
 */
qx.Class.define("admin.ui.events.TableModel", {
    extend: admin.ui.SimpleTableModel,

    statics: {
        START_COLUMN:    0,
        NAME_COLUMN:     1,
        LOCATION_COLUMN: 2,
        SERIES_COLUMN:   3,
        NUM_COLUMNS:     4
    },

    construct() {
        this.base(arguments, admin.ui.events.TableModel.START_COLUMN, true);

        for (let i = 0; i < admin.ui.events.TableModel.NUM_COLUMNS; i++) {
            this.setColumnSortable(i, true);
        }

        this.setSortMethods(
            admin.ui.events.TableModel.START_COLUMN,

            function(row1, row2, column) {
                return row1.originalData.event.start - row2.originalData.event.start;
            }
        );

        this.setColumns(["Start", "Name", "Location", "Series"], ["start", "name", "location", "series"]);
    },

    members: {
        getEvent(rowIndex) {
            return this.getRowData(rowIndex).event;
        },

        refresh() {
            if (this.getReady()) {
                const nowTimestamp = Math.round(Date.now() / 1000);

                admin.RequestManager.getInstance().getEvents(
                    this,
                    nowTimestamp - (86400 * 14),
                    -1,
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                ).then(
                    function(e) {
                        const response = e.getResponse();

                        const data = [];
                        for (let i = 0; i < response.length; i++) {
                            const event = new raceday.api.model.Event(response[i]);
                            data.push(
                                {
                                    start:    new Date(event.start * 1000).toLocaleString([], {timeZoneName: "short"}),
                                    name:     event.name,
                                    location: event.location ? event.location.name : "",
                                    series:   event.series ? event.series.name : "",
                                    event:    event
                                }
                            );
                        }

                        this.context.setDataAsMapArray(data, true, false);
                    },

                    function(e) {
                        admin.ui.MainWindow.handleRequestError(this.request.getStatus(), e);
                    }
                )
            }
        }
    }
});
