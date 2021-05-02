qx.Class.define("admin.ui.form.CheckBoxList", {
    extend: qx.ui.container.Scroll,

    construct: function(height, checkBoxes) {
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
        container.setPadding(5);

        this.base(arguments, container);

        this.setDecorator("main");
        this.setHeight(height);

        for (let i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i] !== null) {
                container.add(checkBoxes[i]);
            } else {
                container.add(new qx.ui.basic.Label("<hr style=\"width: 300px\"/>").set({
                    rich: true
                }));
            }
        }
    }
});
