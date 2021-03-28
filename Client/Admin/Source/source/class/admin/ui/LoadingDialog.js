/**
 * This dialog is displayed by the application when a non-quiet server request is in process.
 *
 * @asset(images/loader-40x40.gif)
 */
qx.Class.define("admin.ui.LoadingDialog", {
    extend: qx.ui.window.Window,

    include: qx.core.MEvent,

    /**
     * Constructor.
     */
    construct: function() {
        this.base(arguments);

        this.setModal(false);
        this.setBackgroundColor("#f4f4f4");
        this.setContentPadding(10, 10, 10, 10);
        this.setMovable(false);
        this.setPadding(10);
        this.setResizable(false);
        this.setShowClose(false);
        this.setAllowMaximize(false);
        this.setShowMaximize(false);
        this.setAllowMinimize(false);
        this.setShowMinimize(false);
        this.setHeight(150);
        this.setWidth(250);
        this.getChildControl("captionbar").setVisibility("excluded");

        const layout = new qx.ui.layout.HBox(0, "center");
        layout.setAlignY("middle");

        this.setLayout(layout);

        this.add(new qx.ui.basic.Atom("Loading...", "images/loader-40x40.gif"));
    },

    members: {
        open: function() {
            this.__place();
            arguments.callee.base.apply(this, arguments);
        },

        __place : function() {
            const parent = this.getLayoutParent();
            if (parent) {
                const bounds = parent.getBounds();
                if (bounds) {
                    const hint = this.getSizeHint();
                    this.moveTo(bounds.width - hint.width - 40, bounds.height - hint.height - 30);
                }
            } else {
                console.error("Placing depends on parent bounds!");
            }
        }
    }
});
