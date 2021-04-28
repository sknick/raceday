qx.Class.define("admin.ui.locations.TableModel", {
    extend: admin.ui.SimpleTableModel,

    statics: {
        NAME_COLUMN:        0,
        DESCRIPTION_COLUMN: 1,
        NUM_COLUMNS:        2
    },

    construct() {
        this.base(arguments, admin.ui.locations.TableModel.NAME_COLUMN, true);

        for (let i = 0; i < admin.ui.locations.TableModel.NUM_COLUMNS; i++) {
            this.setColumnSortable(i, true);
        }

        this.setColumns(["Name", "Description"], ["name", "description"]);
    },

    members: {
        getLocation(rowIndex) {
            return this.getRowData(rowIndex).location;
        },

        async refresh() {
            if (this.getReady()) {
                try {
                    const locations = await admin.RequestManager.getInstance().getLocations();

                    const data = [];
                    for (let i = 0; i < locations.length; i++) {
                        data.push(
                            {
                                name:        locations[i].name,
                                description: locations[i].description,
                                location:    locations[i]
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
