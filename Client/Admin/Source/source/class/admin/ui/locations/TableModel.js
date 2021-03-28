qx.Class.define("admin.ui.locations.TableModel", {
    extend: admin.ui.SimpleTableModel,

    statics: {
        NAME_COLUMN:        0,
        DESCRIPTION_COLUMN: 1,
        NUM_COLUMNS:        2
    },

    construct: function() {
        this.base(arguments, admin.ui.locations.TableModel.NAME_COLUMN, true);

        for (let i = 0; i < admin.ui.locations.TableModel.NUM_COLUMNS; i++) {
            this.setColumnSortable(i, true);
        }

        this.setColumns(["Name", "Description"], ["name", "description"]);
    },

    members: {
        getLocation: function(rowIndex) {
            return this.getRowData(rowIndex).location;
        },

        refresh: function() {
            if (this.getReady()) {
                admin.RequestManager.getInstance().getLocations(
                    this
                ).then(
                    function(e) {
                        const response = e.getResponse();

                        const data = [];
                        for (let i = 0; i < response.length; i++) {
                            const location = new raceday.api.model.Location(response[i]);
                            data.push(
                                {
                                    name:        location.name,
                                    description: location.description,
                                    location:    location
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
