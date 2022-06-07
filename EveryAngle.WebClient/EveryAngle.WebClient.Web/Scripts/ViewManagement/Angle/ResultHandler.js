function ResultHandler(displayHandler) {
    "use strict";

    var _self = {};
    _self.fnGetResult = null;
    _self.cancelable = false;
    _self.cacheDataFields = {};
    _self.currentUri = null;
    _self.currentData = null;

    // store the lastest query definitions
    // use for comparing with the current one
    _self.angleQueryDefinition = [];
    _self.displayQueryDefinition = [];

    var self = this;
    self.Data = {};
    self.ExecutionInfo = ko.observable(null);
    self.DisplayHandler = displayHandler;
    self.IntervalTime = window.intervalTime;
    self.CustomError = false;
    self.SetData = function (data) {
        self.ClearData();
        jQuery.extend(self.Data, ko.toJS(data));
        self.UpdateExecutionInfo();

        _self.angleQueryDefinition = self.GetAngleQueryDefinition();
        _self.displayQueryDefinition = self.GetDisplayQueryDefinition();
    };
    self.GetData = function () {
        return ko.toJS(self.Data);
    };
    self.ClearData = function () {
        clearTimeout(_self.fnGetResult);
        self.Data = {};
        self.ExecutionInfo(null);
        _self.angleQueryDefinition = [];
        _self.displayQueryDefinition = [];
    };
    self.GetAngleQueryDefinition = function () {
        return self.DisplayHandler.AngleHandler.QueryDefinitionHandler.GetQueryDefinition().query_definition;
    };
    self.GetDisplayQueryDefinition = function () {
        return self.DisplayHandler.QueryDefinitionHandler.GetQueryDefinition().query_blocks;
    };
    self.HasChanged = function () {
        // check previous result
        if (!self.Data.uri)
            return true;

        // old query blocks
        var oldBlocks = ko.toJS([].concat(_self.angleQueryDefinition, _self.displayQueryDefinition));
        jQuery.each(oldBlocks, function (index, block) {
            oldBlocks[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
        });

        // current query blocks
        var currentBlocks = ko.toJS([].concat(self.GetAngleQueryDefinition(), self.GetDisplayQueryDefinition()));
        jQuery.each(currentBlocks, function (index, block) {
            currentBlocks[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
        });

        // compare
        return !jQuery.deepCompare(oldBlocks, currentBlocks, false, false);
    };
    self.CreatePostData = function () {
        var displayQueryDefinition = self.DisplayHandler.GetResultQueryDefinition();
        var resultQueryDefinition = self.DisplayHandler.AngleHandler.GetResultQueryDefinition();
        if (displayQueryDefinition.query_definition.length) {
            if (resultQueryDefinition.query_definition.length === 1) {
                // only base_angle or base class then add display block
                resultQueryDefinition.query_definition[1] = displayQueryDefinition.query_definition[0];
            }
            else {
                // merge query_steps
                jQuery.merge(resultQueryDefinition.query_definition[1].query_steps, displayQueryDefinition.query_definition[0].query_steps);
            }
        }
        return resultQueryDefinition;
    };
    self.PostResult = function (uri, data) {
        var deferred = jQuery.Deferred();
        clearTimeout(_self.fnGetResult);
        _self.currentUri = uri;
        _self.currentData = data;
        CreateDataToWebService(uri, data)
            .fail(deferred.reject)
            .done(jQuery.proxy(self.PostResultDone, self, deferred));
        return deferred.promise()
            .then(self.GetDataFields)
            .then(function () {
                return jQuery.when(self.Data);
            });
    };
    self.PostNewResult = function () {
        var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.RESULTS) + '?redirect=no';
        var data = self.CreatePostData();
        return self.PostResult(uri, data);
    };
    self.PostExecutionSteps = function (data) {
        var uri = self.Data.execute_steps + '?redirect=no';
        return self.PostResult(uri, data);
    };
    self.PostResultDone = function (deferred, result) {
        self.DisplayHandler.AngleHandler.UpdateExecutionTimes(result);
        self.EnsureGetResult(deferred, result);
    };
    self.EnsureGetResult = function (deferred, result) {
        clearTimeout(_self.fnGetResult);
        _self.fnGetResult = setTimeout(jQuery.proxy(self.GetResult, self, result, deferred), self.IntervalTime);
    };
    self.GetResult = function (result, deferred) {
        GetDataFromWebService(directoryHandler.ResolveDirectoryUri(result.uri))
            .fail(jQuery.proxy(self.GetResultFail, self, deferred))
            .done(jQuery.proxy(self.GetResultDone, self, deferred));
    };
    self.GetResultFail = function (deferred, xhr, status, error) {
        if (xhr.status === 404) {
            errorHandlerModel.IgnoreAjaxError(xhr);
            self.PostResult(_self.currentUri, _self.currentData)
                .fail(deferred.reject)
                .done(deferred.resolve);
        }
        else {
            deferred.reject(xhr, status, error);
        }
    };
    self.GetResultDone = function (deferred, data, status, xhr) {
        data.row_count = WC.Utility.ToNumber(data.row_count);
        data.object_count = WC.Utility.ToNumber(data.object_count);
        data.progress = Math.max(0, Math.min(WC.Utility.ToNumber(data.progress), 0.99));
        deferred.notify(data);
        var isListAndnotQueryable = self.DisplayHandler.Data().display_type === enumHandlers.DISPLAYTYPE.LIST && !data.queryable;
        var isnotListAndnotFinished = self.DisplayHandler.Data().display_type !== enumHandlers.DISPLAYTYPE.LIST && data.status !== enumHandlers.POSTRESULTSTATUS.FINISHED.Value;

        // When Queryable is true showing data for list not for chart and pivot
        if (isListAndnotQueryable || isnotListAndnotFinished) {
            // running
            self.SetCancelable(deferred, data, true);
            self.EnsureGetResult(deferred, data);
        }
        else if (self.IsCustomError(data, xhr)) {
            // handle custom error
            self.SetCancelable(deferred, data, false);
            errorHandlerModel.IgnoreAjaxError(xhr);
            deferred.reject(xhr, null, null);
            if (!self.CustomError)
                xhr.displayError();
        }
        else {
            // completed
            data.progress = 1;
            self.SetCancelable(deferred, data, false);
            self.SetData(data);
            deferred.resolve(data, status, xhr);
        }
    };
    self.SetCancelable = function (deferred, data, cancelable) {
        _self.cancelable = cancelable;
        data.cancelable = cancelable;
        deferred.notify(data);
    };
    self.Cancel = function () {
        if (!_self.cancelable)
            return;

        WC.Ajax.AbortAll();
        self.SetData({});
    };
    self.IsCustomError = function (data, xhr) {
        // finished but fail
        if (data.status !== enumHandlers.POSTRESULTSTATUS.RUNNING.Value && !data.successfully_completed) {
            xhr.errorType = ResultHandler.CustomErrorType.SuccessfullyCompleted;
            xhr.responseText = Localization.ErrorPostResultFinishWithUnknown;
            xhr.displayError = jQuery.proxy(errorHandlerModel.ShowCustomError, errorHandlerModel, xhr.responseText);
            return true;
        }
        else if (data.sorting_limit_exceeded) {
            xhr.error_type = ResultHandler.CustomErrorType.SortingLimitExceeded;
            xhr.responseText = kendo.format(Localization.Info_DisplaySortingReachedLimitation, data.sorting_limit_exceeded);
            xhr.displayError = jQuery.proxy(popup.Alert, popup, Localization.Warning_Title, xhr.responseText);
            return true;
        }
        return false;
    };
    self.GetDataFields = function () {
        if (self.Data.is_aggregated) {
            return jQuery.when(_self.cacheDataFields[self.Data.data_fields] || GetDataFromWebService(directoryHandler.ResolveDirectoryUri(self.Data.data_fields)))
                .done(function (data) {
                    _self.cacheDataFields[self.Data.data_fields] = data;
                });
        }
        else {
            var fields = jQuery.map(self.DisplayHandler.Data().fields, function (field) {
                if (field.valid)
                    return field.field;
            });
            return modelInstanceFieldsHandler.LoadFieldsByIds(self.Data.query_fields, fields);
        }
    };
    self.GetDataFieldById = function (fieldId) {
        var fields = [];
        jQuery.each(_self.cacheDataFields, function (index, data) {
            jQuery.merge(fields, data.fields);
        });
        return fields.findObject('id', fieldId, false);
    };
    self.GetModelDate = function () {
        var date = null;
        if (self.Data.modeldata_timestamp) {
            date = WC.DateHelper.UnixTimeToLocalDate(self.Data.modeldata_timestamp);
        }
        else {
            var currentInstance = modelCurrentInstanceHandler.GetCurrentModelInstance(self.Data.model);
            if (currentInstance && currentInstance.modeldata_timestamp) {
                date = WC.DateHelper.UnixTimeToLocalDate(currentInstance.modeldata_timestamp);
            }
        }
        return date;
    };
    self.GetClasses = function () {
        var actualClasses = WC.Utility.ToArray(self.Data.actual_classes);
        var potentialClasses = WC.Utility.ToArray(self.Data.potential_classes);
        var classes = actualClasses.length ? actualClasses : potentialClasses;
        return jQuery.map(classes, function (classId) {
            return modelClassesHandler.GetClassName(classId, self.Data.model, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
        });
    };
    self.UpdateExecutionInfo = function () {
        // no result
        if (!self.Data.uri) {
            self.ExecutionInfo(null);
            return;
        }

        var numberFormat = new Formatter({ thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
        var rowCount = self.Data.is_aggregated
            ? WC.FormatHelper.GetFormattedValue(numberFormat, WC.Utility.ToNumber(self.Data.row_count))
            : null;
        self.ExecutionInfo({
            Model: self.DisplayHandler.AngleHandler.GetModelName(),
            Datetime: WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATETIME_WC, self.GetModelDate()),
            Objects: self.GetClasses(),
            ObjectCount: WC.FormatHelper.GetFormattedValue(numberFormat, WC.Utility.ToNumber(self.Data.object_count)),
            RowCount: rowCount,
            ExecutionTime: self.GetExecutionTimeText(WC.Utility.ToNumber(self.Data.execution_time)),
            ResponseTime: ko.computed(function () {
                return self.GetExecutionTimeText(measurePerformance.ElapsedTime());
            })
        });
    };
    self.GetExecutionTimeText = function (value, decimals) {
        var format = new Formatter({ thousandseparator: true, decimals: WC.Utility.ToNumber(decimals, 1) }, enumHandlers.FIELDTYPE.DOUBLE);
        var unit;
        if (value >= 60000) {
            value = ConvertMillisToMinutesAndSeconds(value);
            unit = Localization.AngleDefinitionAreaMin;
        }
        else {
            value = ConvertMsToSec(value);
            unit = Localization.AngleDefinitionAreaSec;
        }
        return kendo.format('{0} {1}', WC.FormatHelper.GetFormattedValue(format, parseFloat(value)), unit);
    };
    self.GetExecutionText = function () {
        var executionInfo = self.ExecutionInfo();
        if (!executionInfo)
            return kendo.format('<em>{0}</em>', Localization.Info_AngleNotExecuted);

        var modelText = kendo.format('{0} {1}', executionInfo.Model, executionInfo.Datetime);
        var objectText = executionInfo.Objects.length === 1 ? kendo.format(' {0}', executionInfo.Objects[0]) : '';
        var responseTimeText = self.GetExecutionTimeText(measurePerformance.ElapsedTime(), 0);

        if (executionInfo.ObjectCount === "-1") {
            return kendo.format('{0},{1} in {2}, {3}',
                modelText,
                objectText,
                responseTimeText,
                Localization.AngleDefinitionAreaCountingItem);
        }
        var objectCountText = [
            executionInfo.ObjectCount,
            Localization.AngleDefinitionAreaItemsIn
        ].join(' ');

        return kendo.format('{0},{1}, {2} {3}',
            modelText,
            objectText,
            objectCountText,
            responseTimeText);
    };
}

ResultHandler.CustomErrorType = {
    SortingLimitExceeded: 'sorting_limit_exceeded',
    SuccessfullyCompleted: 'successfully_completed'
};