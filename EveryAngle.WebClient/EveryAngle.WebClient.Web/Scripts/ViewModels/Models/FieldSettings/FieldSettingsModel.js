function FieldSettingsModel(data) {
    "use strict";

    //BOF: View model properties
    var self = this;

    self.ComponentType = {
        CHART: 0,
        PIVOT: 1
    };

    // Properties
    self.Id = jQuery.GUID();
    self.ComponentId = '';
    self.CultureName = 'en-EN';
    self.DisplayType = self.ComponentType.CHART;
    self.IsReadOnlyMode = false;
    self.IsDashBoardMode = false;
    self.IsCalledBack = false;
    self.QuerySteps = '';
    self.ResultUri = '';
    self.DataRowsUri = '';
    self.RowCount = 0;
    self.Layout = null;
    self.AnglePrivilege = '';
    self.Fields = '';
    self.IsUseSavedData = false;
    self.MaxPageSize = systemSettingHandler.GetMaxPageSize();
    self.DisplayDetails = JSON.stringify({});
    if (data) {
        jQuery.extend(self, data);
    }

    //function
    self.GetFields = function (area) {
        var fields = JSON.parse(self.Fields);
        if (typeof area !== 'undefined')
            return fields.findObjects('Area', area);
        else
            return fields;
    };

    self.GetFieldByFieldName = function (fieldName) {
        return self.GetFields().findObject('FieldName', fieldName, false);
    };

    self.GetFieldByGuid = function (guid) {
        return self.GetFields().findObject('InternalID', guid);
    };

    self.AddField = function (field) {
        var fields = self.GetFields();
        fields.push(field);

        self.Fields = JSON.stringify(fields);
    };

    self.DeleteField = function (field) {
        var fields = self.GetFields();
        fields.removeObject('InternalID', field.InternalID);

        self.Fields = JSON.stringify(fields);
    };

    self.GetDisplayDetails = function () {
       return WC.Utility.ParseJSON(self.DisplayDetails);
    };

    self.SetDisplayDetails = function (details, replace) {
        self.DisplayDetails = JSON.stringify(typeof replace === 'undefined' || !replace ? jQuery.extend({}, WC.Utility.ParseJSON(self.DisplayDetails), details) : details);
    };
    //EOF: View modle methods
}
