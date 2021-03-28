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
            apply: "__applyReady"
        }
    },

    construct: function(defaultColumnSort, defaultSortIsAscending) {
        this.base(arguments);

        const sessionStorage = qx.bom.storage.Web.getSession();

        if (sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY) === null) {
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY, defaultColumnSort);
        }
        if (sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY) === null) {
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY, defaultSortIsAscending);
        }

        this.sortByColumn(sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY),
            sessionStorage.getItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY));
        
        this.addListener("metaDataChanged", this.__onMetadataChanged, this);
    },

    members: {
        /**
         * Must be overridden by subclasses to actually update the data in the model.
         */
        refresh: function() {

        },

        __applyReady: function(value) {
            if (value) {
                this.refresh();
            }
        },

        __onMetadataChanged: function(e) {
            const sessionStorage = qx.bom.storage.Web.getSession();
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_COLUMN_KEY, this.getSortColumnIndex());
            sessionStorage.setItem(admin.ui.SimpleTableModel._SORT_ASCENDING_KEY, this.isSortAscending());
        }
    }
});
