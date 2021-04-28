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

        async refresh() {
            if (this.getReady()) {
                try {
                    const series = await admin.RequestManager.getInstance().getSeries();

                    const data = [];
                    for (let i = 0; i < series.length; i++) {
                        data.push(
                            {
                                name:        series[i].name,
                                description: series[i].description,
                                series:      series[i]
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
