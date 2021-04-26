/**
 * The base class for most dialogs in the application.
 */
qx.Class.define("admin.ui.DialogBase", {
    extend: qx.ui.window.Window,

    type: "abstract",

    /**
     * Constructor.
     *
     * @param {string} title
     * @param {qx.ui.core.Widget} content              The main content to show in this dialog.
     * @param {Array<qx.ui.form.Button>} buttons       An array of the buttons to display in the bottom right of this
     *                                                 dialog.
     * @param {Array<qx.ui.form.Button>} [leftButtons] An array of the buttons to display in the bottom left of this
     *                                                 dialog.
     */
    construct(title, content, buttons, leftButtons) {
        this.base(arguments, title);

        this.setModal(true);
        this.setContentPadding(10, 10, 10, 10);
        this.setPadding(10);
        this.setResizable(false);
        this.setAllowMaximize(false);
        this.setShowMaximize(false);
        this.setAllowMinimize(false);
        this.setShowMinimize(false);
        this.setLayout(new qx.ui.layout.Dock(null, 10));

        let buttonPane;

        if (!leftButtons) {
            const layout = new qx.ui.layout.HBox();
            layout.setSpacing(10);
            layout.setAlignX("right");

            buttonPane = new qx.ui.container.Composite(layout);
            for (let i = 0; i < buttons.length; i++) {
                buttonPane.add(buttons[i]);
            }
        } else {
            const leftLayout = new qx.ui.layout.HBox();
            leftLayout.setSpacing(10);

            const leftButtonsPane = new qx.ui.container.Composite(leftLayout);
            for (let i = 0; i < leftButtons.length; i++) {
                leftButtonsPane.add(leftButtons[i]);
            }

            const rightLayout = new qx.ui.layout.HBox();
            rightLayout.setSpacing(10);
            rightLayout.setAlignX("right");

            const rightButtonsPane = new qx.ui.container.Composite(rightLayout);
            for (let i = 0; i < buttons.length; i++) {
                rightButtonsPane.add(buttons[i]);
            }

            buttonPane = new qx.ui.container.Composite(new qx.ui.layout.Dock());
            buttonPane.add(leftButtonsPane,  { edge: "west" });
            buttonPane.add(rightButtonsPane, { edge: "east" });
        }

        this.add(content,    { edge: "center" });
        this.add(buttonPane, { edge: "south" });

        this.addListener("keypress", this.__onKeyPressed, this, true);

        this.center();
    },

    members: {
        __onKeyPressed(e) {
            if (e.getKeyIdentifier() === "Escape") {
                this.close();
            }
        }
    }
});
