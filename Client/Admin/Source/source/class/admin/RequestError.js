qx.Class.define("admin.RequestError", {
    extend: qx.type.BaseError,

    properties: {
        statusCode: {
            init:     null,
            nullable: true
        }
    },

    /**
     * Constructor.
     *
     * @param {String} comment
     * @param {String} failMessage
     * @param {int} [statusCode]
     */
    construct(comment, failMessage, statusCode) {
        this.base(comment, failMessage);

        this.setStatusCode(statusCode ? statusCode : null);
    }
});
