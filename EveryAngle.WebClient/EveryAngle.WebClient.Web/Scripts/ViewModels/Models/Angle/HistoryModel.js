// this model will contain last changed for each display
// display will contain updated display & posted result data
var historyModel = new HistoryModel();

function HistoryModel() {
    "use strict";

    var self = this;
    self.LastDisplayUri = ko.observable(null);
    self.LastResultUri = ko.observable(null);
    self.Data = ko.observable({});
    self.OriginalVersionSuffix = ',original';

    // set display
    // @params
    // - key, key of display
    // - value, value of display
    self.Set = function (key, value) {
        var data = self.Data();
        data[key] = ko.toJS(value);
        self.Data(data);
    };

    // get display if not exists will use the original version
    // @params
    // key, key of display
    // [isLastest = true], bool, get lastest version? else get the original version
    self.Get = function (key, isLastest) {
        if (typeof isLastest === 'undefined')
            isLastest = true;
        if (!isLastest) {
            return ko.toJS(self.Data()[key + self.OriginalVersionSuffix]) || null;
        }
        else {
            return ko.toJS(self.Data()[key]) || ko.toJS(self.Data()[key + self.OriginalVersionSuffix]) || null;
        }
    };

    // clear history, remove angle's displays
    // @params
    // key, key of angle 'angles/1'
    self.ClearAll = function (key) {
        var angleKey = key + '/',
            data = {};
        jQuery.each(self.Data(), function (k, v) {
            if (k.indexOf(angleKey) === -1) {
                data[k] = v;
            }
        });
        self.Data(data);
    };

    // clear history, remove display & the related
    // @params
    // key, key of display
    self.Clear = function (key) {
        var data = {}, keys;
        jQuery.each(self.Data(), function (k, v) {
            keys = k.split(',');
            if (keys[0] !== key) {
                data[k] = v;
            }
        });
        self.Data(data);
    };

    self.CollectCurrentDisplay = function () {
        var data = ko.toJS(displayModel.Data());
        var displayDetails = displayModel.GetDisplayDetails();

        data.query_blocks = ko.toJS(displayQueryBlockModel.CollectQueryBlocks());

        if (data.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            data.fields = displayModel.GetPivotFields();
        }
        else if (data.display_type === enumHandlers.DISPLAYTYPE.CHART) {
            data.fields = displayModel.GetPivotFields();
        }
        if (displayDetails) {
            data.display_details = JSON.stringify(displayDetails);
        }
        data.results = ko.toJS(resultModel.Data());

        return data;
    };

    // save history to the lastest version
    self.Save = function (needToUpdateOriginal) {
        self.LastDisplayUri(displayModel.Data().uri);

        var displayHistoryData = self.CollectCurrentDisplay();
        if (!self.Get(displayHistoryData.uri, false)) {
            self.Set(displayHistoryData.uri + self.OriginalVersionSuffix, displayHistoryData);
        }
        self.Set(displayHistoryData.uri, displayHistoryData);

        if (needToUpdateOriginal) {
            self.Set(displayHistoryData.uri + self.OriginalVersionSuffix, displayHistoryData);
        }
    };
}
