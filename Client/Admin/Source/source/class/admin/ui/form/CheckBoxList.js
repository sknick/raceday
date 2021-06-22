qx.Class.define("admin.ui.form.CheckBoxList", {
    extend: qx.ui.container.Scroll,

    /**
     * @param {integer} height 
     * @param {Array<qx.ui.form.CheckBox|null} checkBoxes If an array element is null, a horizontal line will be
     * inserted at that point in the list.
     */
    construct: function(height, checkBoxes) {
        this.__container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
        this.__container.setPadding(5);

        this.base(arguments, this.__container);

        this.setDecorator("main");
        this.setHeight(height);

        for (let i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i] !== null) {
                this.__container.add(checkBoxes[i]);
            } else {
                this.__container.add(new qx.ui.basic.Label("<hr style=\"width: 300px\"/>").set({
                    rich: true
                }));
            }
        }
    },

    members: {
        getSelectedCheckBoxes() {
            const ret = [];

            const children = this.__container.getChildren();
            for (let i = 0; i < children.length; i++) {
                if ( (children[i] instanceof qx.ui.form.CheckBox) && (children[i].getValue() === true) ) {
                    ret.push(children[i]);
                }
            }

            return ret;
        }
    }
});
