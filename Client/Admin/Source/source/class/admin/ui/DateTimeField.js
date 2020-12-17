qx.Class.define("admin.ui.DateTimeField", {
    extend: qx.ui.container.Composite,

    construct: function() {
        this.base(arguments, new qx.ui.layout.HBox(10));

        this.__now = new Date();

        this.__yearField = new qx.ui.form.SelectBox();
        for (let i = this.__now.getFullYear(); i < this.__now.getFullYear() + 10; i++) {
            this.__yearField.add(new qx.ui.form.ListItem(String(i), null, i));
        }
        
        this.__monthItems = [];
        this.__monthItems.push(new qx.ui.form.ListItem("January", null, 0));
        this.__monthItems.push(new qx.ui.form.ListItem("February", null, 1));
        this.__monthItems.push(new qx.ui.form.ListItem("March", null, 2));
        this.__monthItems.push(new qx.ui.form.ListItem("April", null, 3));
        this.__monthItems.push(new qx.ui.form.ListItem("May", null, 4));
        this.__monthItems.push(new qx.ui.form.ListItem("June", null, 5));
        this.__monthItems.push(new qx.ui.form.ListItem("July", null, 6));
        this.__monthItems.push(new qx.ui.form.ListItem("August", null, 7));
        this.__monthItems.push(new qx.ui.form.ListItem("September", null, 8));
        this.__monthItems.push(new qx.ui.form.ListItem("October", null, 9));
        this.__monthItems.push(new qx.ui.form.ListItem("November", null, 10));
        this.__monthItems.push(new qx.ui.form.ListItem("December", null, 11));

        this.__monthField = new qx.ui.form.SelectBox();

        let selectedMonthIndex = 0;
        for (let i = 0; i < this.__monthItems.length; i++) {
            this.__monthField.add(this.__monthItems[i]);

            if (this.__now.getMonth() === i) {
                selectedMonthIndex = i;
            }
        }

        this.__monthField.setSelection([this.__monthItems[selectedMonthIndex]]);

        this.__dayField = new qx.ui.form.SelectBox();
        this.__dayField.setWidth(50);
        this.__initializeDayField();

        this.__hoursField = new qx.ui.form.TextField();
        this.__hoursField.setMaxLength(2);
        this.__hoursField.setWidth(30);

        this.__minutesField = new qx.ui.form.TextField();
        this.__minutesField.setMaxLength(2);
        this.__minutesField.setWidth(30);

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
                this.__yearField.getSelection().getModel(),
                this.__monthField.getSelection().getModel(),
                this.__dayField.getSelection().getModel(),
                this.__hoursField.getValue(),
                this.__minutesField.getValue()
            );
            return Math.round(d.getTime() / 1000);
        },

        __initializeDayField: function() {
            let daysInMonth = new Date(
                this.__now.getFullYear() + this.__yearField.indexOf(
                    this.__yearField.getSelection()[0]
                ),
                this.__monthField.indexOf(
                    this.__monthField.getSelection()[0]
                ) + 1,
                0
            ).getDate();

            this.__dayField.removeAll();
            for (let i = 1; i < daysInMonth + 1; i++) {
                this.__dayField.add(new qx.ui.form.ListItem(String(i), null, i));
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
