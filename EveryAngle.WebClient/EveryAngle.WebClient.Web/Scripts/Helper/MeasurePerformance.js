function MeasurePerformance() {
    "use strict";

    var self = this;
    self.StartTime = null;
    self.ElapsedTime = null;

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
            self.ElapsedTime = jQuery.now() - self.StartTime;
            if (typeof resultModel !== 'undefined') {
                resultModel.ExecutionTime.valueHasMutated();
            }
            self.StartTime = null;
        }
    };

    self.GetTimeElapsed = function () {
        return self.ElapsedTime / 1000;
    };
}

var measurePerformance = new MeasurePerformance();
