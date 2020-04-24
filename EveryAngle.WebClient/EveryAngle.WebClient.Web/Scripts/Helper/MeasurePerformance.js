function MeasurePerformance() {
    "use strict";

    var self = this;
    self.StartTime = null;
    self.ElapsedTime = ko.observable(null);

    // check window.performance.timing
    if (!window.performance) {
        window.performance = {
            timing: {
                navigationStart: (new Date()).getTime()
            }
        };
    }

    self.SetStartTime = function (isFirstLoad) {
        if (!self.StartTime) {
            if (isFirstLoad === true) {
                self.StartTime = window.performance.timing.navigationStart;
            }
            else {
                self.StartTime = jQuery.now();
            }
        }
    };

    self.SetEndTime = function () {
        if (self.StartTime) {
            self.ElapsedTime(jQuery.now() - self.StartTime);
            self.ElapsedTime.notifySubscribers();
            self.StartTime = null;
        }
    };
}

var measurePerformance = new MeasurePerformance();
