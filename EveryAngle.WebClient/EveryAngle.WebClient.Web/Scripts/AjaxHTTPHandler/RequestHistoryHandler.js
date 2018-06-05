var requestHistoryModel =  new RequestHistoryModel();

function RequestHistoryModel() {
    "use strict";

    var self = this;
    self.LastExecute = {};
    self.ClearPopupBeforeExecute = false;

    // execute last execution
    self.Execute = function () {
        if (self.LastExecute.fn) {
            self.LastExecute.fn.apply(self.LastExecute.scope || window, self.LastExecute.args);
        }

        // clear last action
        self.ClearLastExecute();
    };

    // save history to the lastest version
    self.SaveLastExecute = function (scope, fn, args) {
        self.ClearPopupBeforeExecute = false;

        self.LastExecute = {
            scope: scope,
            fn: fn,
            args: args
        };
    };

    // clear last execution
    self.ClearLastExecute = function () {
        self.ClearPopupBeforeExecute = false;
    };
}
