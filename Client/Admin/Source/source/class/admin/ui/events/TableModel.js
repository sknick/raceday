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

        async refresh() {
            if (this.getReady()) {
                const nowTimestamp = Math.round(Date.now() / 1000);

                try {
                    const events = await admin.RequestManager.getInstance().getEvents(nowTimestamp - (86400 * 14),
                        -1, Intl.DateTimeFormat().resolvedOptions().timeZone);
                    
                    const data = [];
                    for (let i = 0; i < events.length; i++) {
                        data.push(
                            {
                                start:    new Date(events[i].start * 1000).toLocaleString([], {timeZoneName: "short"}),
                                name:     events[i].name,
                                location: events[i].location ? events[i].location.name : "",
                                series:   events[i].series ? events[i].series.name : "",
                                event:    events[i]
                            }
                        );
                    }
                    
                    this.setDataAsMapArray(data, true, false);
                } catch (ex) {
                    // TODO
                    console.error(ex);
                }
            }
        }
    }
});
