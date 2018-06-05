(function (win) {
    var __messages = {};

    // utility methods
    __messages.getMessage = function (responseMessage) {
        var key = responseMessage.replace(/[\s\.]/ig, '');
        return this[key] || responseMessage;
    };
    __messages.addMessage = function (responseMessage, customMessage) {
        var key = responseMessage.replace(/[\s\.]/ig, '');
        this[key] = customMessage;
    };

    // add custom message
    //__messages.addMessage('x', 'x1');

    win.MC.messages = __messages;
})(window);
