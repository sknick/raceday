/**
 * This subclass of qx.ui.table.model.Simple will automatically remember the current sort column and sort direction for
 * the duration of the session.
 */
qx.Class.define("admin.ui.SimpleTableModel", {
    extend: qx.ui.table.model.Simple,

    statics: {
        _SORT_COLUMN_KEY:    "sort_column",
        _SORT_ASCENDING_KEY: "sort_ascending"
    },

    properties: {
        ready: {
            init: false,
            nullable: false,
            check: "Boolean",
            apply: "_applyReady"
        }
    },

    construct: function(defaultColumnSort, defaultSortIsAscending) {
        this.base(arguments);

        let sessionStorage = qx.bom.storage.Web.getSession();

        if (sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY) === null) {
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY, defaultColumnSort);
        }
        if (sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY) === null) {
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY, defaultSortIsAscending);
        }

        this.sortByColumn(sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY),
            sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY));

        // Tried to use sorted event but it wasn't firing. This one works for our needs.
        this.addListener("metaDataChanged", this._onMetadataChanged, this);
    },

    members: {
        /**
         * Must be overridden by subclasses to actually update the data in the model.
         */
        refresh: function() {

        },

        _applyReady: function(value) {
            if (value) {
                this.refresh();
            }
        },

        _onMetadataChanged: function(e) {
            let sessionStorage = qx.bom.storage.Web.getSession();
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY, this.getSortColumnIndex());
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY, this.isSortAscending());
        }
    }
});
