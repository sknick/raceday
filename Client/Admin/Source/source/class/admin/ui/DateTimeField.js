qx.Class.define("admin.ui.DateTimeField", {
    extend: qx.ui.container.Composite,

    statics: {
        __MONTHS: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]
    },

    /**
     * Constructor.
     *
     * @param {number} [timestamp] UNIX timestamp in seconds.
     */
    construct: function(timestamp) {
        this.base(arguments, new qx.ui.layout.HBox(10));

        this.__baseDate = timestamp ? new Date(timestamp * 1000) : new Date();


        this.__yearField = new qx.ui.form.SelectBox();
        this.__yearField.setWidth(70);

        let selectedItem = null;
        for (let i = this.__baseDate.getUTCFullYear() - 10; i < this.__baseDate.getUTCFullYear() + 50; i++) {
            let thisItem = new qx.ui.form.ListItem(String(i), null, i);
            this.__yearField.add(thisItem);

            if (!selectedItem && (i === this.__baseDate.getUTCFullYear())) {
                selectedItem = thisItem;
            }
        }

        if (selectedItem) {
            this.__yearField.setSelection([selectedItem]);
        } else {
            this.__yearField.setSelection([this.__yearField.getChildren()[0]]);
        }


        this.__monthField = new qx.ui.form.SelectBox();

        selectedItem = null;
        for (let i = 0; i < admin.ui.DateTimeField.__MONTHS.length; i++) {
            let thisItem = new qx.ui.form.ListItem(admin.ui.DateTimeField.__MONTHS[i], null, i);
            this.__monthField.add(thisItem);

            if (!selectedItem && (this.__baseDate.getUTCMonth() === i)) {
                selectedItem = thisItem;
            }
        }

        if (selectedItem) {
            this.__monthField.setSelection([selectedItem]);
        } else {
            this.__monthField.setSelection([this.__monthField.getChildren()[0]]);
        }


        this.__dayField = new qx.ui.form.SelectBox();
        this.__dayField.setWidth(50);
        this.__initializeDayField(this.__baseDate.getUTCDate());


        this.__hoursField = new qx.ui.form.SelectBox();
        this.__hoursField.setWidth(50);

        selectedItem = null;
        for (let i = 0; i < 24; i++) {
            let thisItem = new qx.ui.form.ListItem(String(i).padStart(2, "0"), null, i);
            this.__hoursField.add(thisItem);

            if (timestamp && !selectedItem && (this.__baseDate.getUTCHours() === i)) {
                selectedItem = thisItem;
            }
        }

        if (selectedItem) {
            this.__hoursField.setSelection([selectedItem]);
        } else {
            this.__hoursField.setSelection([this.__hoursField.getChildren()[0]]);
        }


        this.__minutesField = new qx.ui.form.SelectBox();
        this.__minutesField.setWidth(50);

        selectedItem = null;
        for (let i = 0; i < 60; i++) {
            let thisItem = new qx.ui.form.ListItem(String(i).padStart(2, "0"), null, i);
            this.__minutesField.add(thisItem);

            if (timestamp && !selectedItem && (this.__baseDate.getUTCMinutes() === i)) {
                selectedItem = thisItem;
            }
        }

        if (selectedItem) {
            this.__minutesField.setSelection([selectedItem]);
        } else {
            this.__minutesField.setSelection([this.__minutesField.getChildren()[0]]);
        }


        let commaLabel = new qx.ui.basic.Label(",");
        commaLabel.setAlignY("bottom");

        let atLabel = new qx.ui.basic.Label("@");
        atLabel.setAlignY("middle");

        let colonLabel = new qx.ui.basic.Label(":");
        colonLabel.setAlignY("middle");

        this.add(this.__monthField);
        this.add(this.__dayField);
        this.add(commaLabel);
        this.add(this.__yearField);
        this.add(atLabel);
        this.add(this.__hoursField);
        this.add(colonLabel);
        this.add(this.__minutesField);

        this.__yearField.addListener("changeSelection", this.__onYearChanged, this);
        this.__monthField.addListener("changeSelection", this.__onMonthChanged, this);
    },

    members: {
        getTime: function() {
            let d = new Date(
                this.__yearField.getSelection()[0].getModel(),
                this.__monthField.getSelection()[0].getModel(),
                this.__dayField.getSelection()[0].getModel(),
                this.__hoursField.getSelection()[0].getModel(),
                this.__minutesField.getSelection()[0].getModel()
            );
            return Math.round(d.getTime() / 1000);
        },

        __initializeDayField: function(dayToSelect) {
            let daysInMonth = new Date(
                this.__baseDate.getUTCFullYear() + this.__yearField.indexOf(
                    this.__yearField.getSelection()[0]
                ),
                this.__monthField.indexOf(
                    this.__monthField.getSelection()[0]
                ) + 1,
                0
            ).getDate();

            this.__dayField.removeAll();

            let selectedItem = null;
            for (let i = 1; i < daysInMonth + 1; i++) {
                let thisItem = new qx.ui.form.ListItem(String(i), null, i);
                this.__dayField.add(thisItem);

                if (dayToSelect && !selectedItem && (i === dayToSelect)) {
                    selectedItem = thisItem;
                }
            }

            if (selectedItem) {
                this.__dayField.setSelection([selectedItem]);
            } else {
                this.__dayField.setSelection([this.__dayField.getChildren()[0]]);
            }
        },

        __onYearChanged: function(e) {
            this.__initializeDayField();
        },

        __onMonthChanged: function(e) {
            this.__initializeDayField();
        }
    }
});
