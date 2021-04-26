qx.Class.define("admin.ui.series.TableModel", {
    extend: admin.ui.SimpleTableModel,

    statics: {
        NAME_COLUMN:        0,
        DESCRIPTION_COLUMN: 1,
        NUM_COLUMNS:        2
    },

    construct() {
        this.base(arguments, admin.ui.series.TableModel.NAME_COLUMN, true);

        for (let i = 0; i < admin.ui.series.TableModel.NUM_COLUMNS; i++) {
            this.setColumnSortable(i, true);
        }

        this.setColumns(["Name", "Description"], ["name", "description"]);
    },

    members: {
        getSeries(rowIndex) {
            return this.getRowData(rowIndex).series;
        },

        refresh() {
            if (this.getReady()) {
                admin.RequestManager.getInstance().getSeries(
                    this
                ).then(
                    function(e) {
                        const response = e.getResponse();

                        const data = [];
                        for (let i = 0; i < response.length; i++) {
                            const series = new raceday.api.model.Series(response[i]);
                            data.push(
                                {
                                    name:        series.name,
                                    description: series.description,
                                    series:      series
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
