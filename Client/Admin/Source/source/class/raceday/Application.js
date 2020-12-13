qx.Class.define("raceday.Application", {
    extend: qx.application.Standalone,

    statics: {
        APP_TITLE:                 "Race Day",
        UNSPECIFIED_ERROR_MESSAGE: "An unspecified error occurred.",

        getDocURLPrefix: function() {
            return "https://" + window.location.host + "/docs/";
        }
    },

    members: {
        main: function () {
            this.base(arguments);

            if (qx.core.Environment.get("qx.debug")) {
                qx.log.appender.Native;
            }

            new raceday.ui.MainWindow(this.getRoot());
        }
    }
});
