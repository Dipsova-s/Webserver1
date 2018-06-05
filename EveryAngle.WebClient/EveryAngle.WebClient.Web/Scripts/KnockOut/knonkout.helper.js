(function (window, ko) {
    //wrapper to an observable that requires accept/cancel
    ko.protectedObservable = function (initialValue) {
        //private variables
        var _actualValue = ko.observable(initialValue),
            _tempValue = initialValue;

        //computed observable that we will return
        var result = ko.computed({
            //always return the actual value
            read: function () {
                return _actualValue();
            },
            //stored in a temporary spot until commit
            write: function (newValue) {
                _tempValue = newValue;
            }
        });

        //if different, commit temp value
        result.commit = function () {
            if (_tempValue !== _actualValue()) {
                _actualValue(_tempValue);
            }
        };

        //force subscribers to take original
        result.reset = function () {
            _actualValue.valueHasMutated();
            _tempValue = _actualValue();   //reset temp value
        };

        return result;
    };

    ko.protectedObservableArray = function (initialData) {
        var _snapShot = initialData;
        var result = ko.observableArray(initialData || []);

        result.commit = function () {
            _snapShot = this().slice();  //take a copy of the underlying array
        };

        result.reset = function () {
            this(_snapShot.slice());
        }

        return result;
    };

    ko.observableArray.fn.swap = function (index1, index2) {
        var minIndex, maxIndex, tempStepMax, tempStepMin;
        if (index1 < index2) {
            minIndex = index1;
            maxIndex = index2;
        }
        else {
            minIndex = index2;
            maxIndex = index1;
        }
        tempStepMax = this.splice(maxIndex, 1);
        tempStepMin = this.splice(minIndex, 1, tempStepMax[0]);
        this.splice(maxIndex, 0, tempStepMin[0]);
    };

    ko.observableArray.fn.moveTo = function (oldIndex, newIndex) {
        this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
    };

    var saveSubscribe = ko.subscribable.fn.subscribe;
    ko.subscribable.fn.subscribe = function (callback, context, event) {
        var paused = false;
        var newCallback = function () {
            if (!paused)
                return callback.apply(this, arguments);
        };
        var subscription = saveSubscribe.call(this, newCallback, context, event);
        subscription['pause'] = function () { paused = true; };
        subscription['resume'] = function () { paused = false; };
        return subscription;
    };
})(window, window.ko);