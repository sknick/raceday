/**
 * This subclass of qx.ui.table.model.Remote will automatically remember the current sort column and sort direction for
 * the duration of the session. Subclasses should simply implement the normal qx.ui.table.model.Remote method
 * _loadRowCount() as that will be called once the table model is notified that the application is ready.
 */
qx.Class.define("admin.ui.RemoteTableModel", {
    extend: qx.ui.table.model.Remote,

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

        this.setBlockSize(200);

        let sessionStorage = qx.bom.storage.Web.getSession();

        if (sessionStorage.getItem(admin.ui.RemoteTableModel._SORT_COLUMN_KEY) === null) {
            sessionStorage.setItem(admin.ui.RemoteTableModel._SORT_COLUMN_KEY, defaultColumnSort);
        }
        if (sessionStorage.getItem(admin.ui.RemoteTableModel._SORT_ASCENDING_KEY) === null) {
            sessionStorage.setItem(admin.ui.RemoteTableModel._SORT_ASCENDING_KEY, defaultSortIsAscending);
        }

        this.sortByColumn(sessionStorage.getItem(admin.ui.RemoteTableModel._SORT_COLUMN_KEY),
            sessionStorage.getItem(admin.ui.RemoteTableModel._SORT_ASCENDING_KEY));

        // Tried to use sorted event but it wasn't firing. This one works for our needs.
        this.addListener("metaDataChanged", this._onMetadataChanged, this);
    },

    members: {
        _applyReady: function(value) {
            if (value) {
                this._loadRowCount();
            }
        },

        _onMetadataChanged: function(e) {
            let sessionStorage = qx.bom.storage.Web.getSession();
            sessionStorage.setItem(admin.ui.RemoteTableModel._SORT_COLUMN_KEY, this.getSortColumnIndex());
            sessionStorage.setItem(admin.ui.RemoteTableModel._SORT_ASCENDING_KEY, this.isSortAscending());
        }
    }
});
