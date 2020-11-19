function DashboardResultViewModel(elementId, model, dashboardViewModel) {
    "use strict";

    var self = this;
    var checkPostIntegrityQueue = null;
    //BOF: View model properties
    self.Data = ko.observable(null);
    self.DataFields = [];
    self.ElementId = elementId;
    self.WidgetModel = model;
    self.Angle = model.GetAngle();
    self.Display = model.GetDisplay();
    self.AngleModel = new AngleInfoViewModel(self.Angle);
    self.DisplayModel = new DisplayModel(self.Display);
    self.DashboardModel = dashboardViewModel;
    self.ResultErrorXhr = null;
    //EOF: View model properties

    self.Execute = function () {
        self.ResultErrorXhr = null;
        self.ShowBusyIndicator();
        return self.CheckPostIntegrityQueue()
            .then(self.PostIntegrity)
            .then(self.PostResult)
            .fail(self.ApplyResultFail)
            .done(function (response, queryDefinition) {
                response.query_definition = queryDefinition;
                self.Data(response);
                self.GetResult(response.uri);
            });
    };
    self.PostResult = function () {
        var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.RESULTS) + '?redirect=no';
        var data = self.CreatePostData();

        return CreateDataToWebService(directoryHandler.ResolveDirectoryUri(uri), data)
            .then(function (response) {
                return jQuery.when(response, data.query_definition);
            });
    };
    self.CreatePostData = function () {
        var postData = { query_definition: [] };
        var executeParameters = self.DashboardModel.GetAngleExecutionParametersInfo(self.Angle, self.Display);
        var filters = self.WidgetModel.GetExtendedFilters();

        // angle block
        postData.query_definition.push({
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE,
            base_angle: self.WidgetModel.angle
        });
        jQuery.extend(postData.query_definition[0], executeParameters.angleQuery);

        // display block
        if (!filters.length) {
            // no extend filter
            postData.query_definition.push({
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY,
                base_display: self.WidgetModel.display
            });
            jQuery.extend(postData.query_definition[1], executeParameters.displayQuery);
        }
        else {
            // with extend filters
            var newBlockQuerySteps = self.WidgetModel.GetBlockQuerySteps(filters);
            postData.query_definition.push(newBlockQuerySteps);
        }

        if (!self.DashboardModel.IsTemporaryDashboard())
            postData.dashboard = self.DashboardModel.Data().uri;

        return postData;
    };
    self.CheckPostIntegrityQueue = function () {
        var deferred = jQuery.Deferred();
        clearInterval(checkPostIntegrityQueue);
        checkPostIntegrityQueue = setInterval(function () {
            if (!DashboardResultViewModel.IsPostIntegrityRunning)
                deferred.resolve();
        }, 100);
        return deferred.promise();
    };
    self.PostIntegrity = function () {
        // clean current filters
        self.WidgetModel.SetExtendedFilters([]);

        // no integrity check if no dashboard filter
        if (!self.WidgetModel.CanExtendFilter() || !self.DashboardModel.GetDashboardFilters().length)
            return jQuery.when();

        // do integrity check
        var integrityUri = self.Angle.model + '/validate_query_integrity?redirect=no';
        var integrityData = self.CreatePostIntegrityData();

        var deferred = jQuery.Deferred();
        DashboardResultViewModel.IsPostIntegrityRunning = true;
        CreateDataToWebService(directoryHandler.ResolveDirectoryUri(integrityUri), integrityData)
            .fail(function () {
                // ignore error but don't use filters
                self.WidgetModel.SetExtendedFilters([]);
                deferred.resolve(null);
            })
            .done(function (response) {
                // AppServer always response index 1 as query_steps
                self.WidgetModel.SetExtendedFilters(response.query_definition[1].query_steps);
                deferred.resolve(response);
            })
            .always(function () {
                DashboardResultViewModel.IsPostIntegrityRunning = false;
            });
        return deferred.promise();
    };
    self.CreatePostIntegrityData = function () {
        // get querystep block combined with dashboard filters
        var baseClassesBlock = self.Angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        var dashboardFilters = self.DashboardModel.GetDashboardFilters();
        var querySteps = [];
        var angleQueryStepsBlock = self.Angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (angleQueryStepsBlock)
            jQuery.merge(querySteps, angleQueryStepsBlock.query_steps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP));
        var displayQueryStepsBlock = self.Display.query_blocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (displayQueryStepsBlock)
            jQuery.merge(querySteps, displayQueryStepsBlock.query_steps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP));
        jQuery.merge(querySteps, dashboardFilters);
        var queryStepsBlock = {
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: querySteps
        };

        return {
            query_definition: [
                baseClassesBlock,
                queryStepsBlock
            ]
        };
    };
    self.PostExecutionSteps = function (querySteps) {
        var query = {
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: querySteps
        };
        return CreateDataToWebService(directoryHandler.ResolveDirectoryUri(self.Data().execute_steps) + '?redirect=no', query);
    };
    self.SetRetryPostResult = function (xhr, element) {
        xhr = xhr || {};

        var regExpForAngleNeedsToBeReExecuted = /Result [0-9]+ not found at Model server \(ID: [a-zA-z0-9_]+, URI: https:\/\/[a-zA-z0-9\.]+:[0-9]+ \); Status: Down\./;
        var ifAngleNeedsToBeReExecuted = regExpForAngleNeedsToBeReExecuted.test(xhr.responseJSON.message);

        var message = (xhr.status === 404 && ifAngleNeedsToBeReExecuted)
            ? Localization.MessageAngleNeedsToBeReExecuted
            : errorHandlerModel.GetAreaErrorMessage(xhr.responseText);
        self.HideBusyIndicator();
        dashboardPageHandler.RemoveWidgetDisplayElement(self.ElementId.slice(1), jQuery(self.ElementId + '-inner'), self.Display);
        errorHandlerModel.ShowAreaError(element, message, self.Execute);
    };
    self.ShowBusyIndicator = function () {
        jQuery(self.ElementId + '-inner').busyIndicator(true);
    };
    self.HideBusyIndicator = function () {
        jQuery(self.ElementId + '-inner').busyIndicator(false);
    };
    self.GetResult = function (request) {
        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(request))
            .fail(self.ApplyResultFail)
            .done(self.GetResultSuccess);
    };
    self.GetResultSuccess = function (response) {
        if (response.status !== enumHandlers.POSTRESULTSTATUS.FINISHED.Value) {
            window.setTimeout(function () {
                // Call to serve again is data not success
                self.GetResult(response.uri);
            }, intervalTime);
        }
        else {
            // finished but not successfully_completed
            if (!response.successfully_completed) {
                self.SetNotSuccessfullyCompleted()
                    .fail(self.ApplyResultFail);
            }
            else if (response.sorting_limit_exceeded) {
                self.SetSortingLimitExceeded(response.sorting_limit_exceeded)
                    .fail(self.ApplyResultFail);
            }
            else {
                // data fields
                var loadDataFields = function () {
                    if (self.Display.display_type !== enumHandlers.DISPLAYTYPE.LIST) {
                        return self.LoadDataFields();
                    }
                    else {
                        var fields = [];
                        jQuery.each(self.Display.fields, function (index, displayField) {
                            if (displayField.valid) {
                                fields.push(displayField.field);
                            }
                        });
                        return modelInstanceFieldsHandler.LoadFieldsByIds(self.Data().query_fields, fields);
                    }
                };
                response.query_definition = self.Data().query_definition;
                self.Data(response);
                jQuery.when(
                    self.LoadFields(),
                    loadDataFields()
                )
                .fail(function (requests) {
                    if (requests[0] instanceof Array)
                        requests = requests[0];
                    if (requests[0] instanceof Array)
                        requests = requests[0];
                    self.ResultErrorXhr = requests;
                    self.SetRetryPostResult(requests, self.ElementId);
                })
                .done(function () {
                    self.ApplyResult();
                });
            }
        }
    };
    self.ApplyResult = function () {
        var container = self.ElementId + '-inner';
        var model;

        dashboardModel.SetDashboardStatistics('executed', self.Data().executed);

        switch (self.Display.display_type) {
            case enumHandlers.DISPLAYTYPE.PIVOT:
                model = new PivotPageHandler(self.ElementId, container);
                model.HasResult(!self.ResultErrorXhr);
                model.ReadOnly(true);
                model.DashBoardMode(true);
                model.Models.Angle = self.AngleModel;
                model.Models.Display = self.DisplayModel;
                model.Models.DisplayQueryBlock = new DisplayQueryBlockModel(self.Display.query_blocks);
                model.Models.Result = self;
                model.FieldSettings = null;
                model.GetPivotDisplay();
                if (self.ResultErrorXhr)
                    model.ShowError(self.ResultErrorXhr);
                break;

            case enumHandlers.DISPLAYTYPE.CHART:
                model = new ChartHandler(self.ElementId, container);
                model.HasResult(!self.ResultErrorXhr);
                model.ReadOnly(true);
                model.DashBoardMode(true);
                model.FitLayout = true;
                model.MINAXIS = 5;
                model.Data.rows = [];
                model.Models.Angle = self.AngleModel;
                model.Models.Display = self.DisplayModel;
                model.Models.DisplayQueryBlock = new DisplayQueryBlockModel(self.Display.query_blocks);
                model.Models.Result = self;
                model.FieldSettings = null;
                model.GetChartDisplay();
                if (self.ResultErrorXhr)
                    model.ShowError(self.ResultErrorXhr);
                break;

            case enumHandlers.DISPLAYTYPE.LIST:
                model = new ListHandler(self.ElementId, container);
                model.HasResult(!self.ResultErrorXhr);
                model.ReadOnly(true);
                model.DashBoardMode(true);
                model.Models.Angle = self.AngleModel;
                model.Models.Display = self.DisplayModel;
                model.Models.DisplayQueryBlock = new DisplayQueryBlockModel(self.Display.query_blocks);
                model.Models.Result = self;
                model.GetListDisplay();
                if (self.ResultErrorXhr)
                    model.ShowError(self.ResultErrorXhr);
                break;

            default:
                break;
        }

        if (model)
            jQuery(self.ElementId + '-container').data('Model', model);
    };
    self.SetNotSuccessfullyCompleted = function () {
        var response = {
            responseText: Localization.ErrorPostResultFinishWithUnknown
        };
        return jQuery.Deferred().reject(response, null, null).promise();
    };
    self.SetSortingLimitExceeded = function (count) {
        var response = {
            responseText: kendo.format(Localization.Info_DisplaySortingReachedLimitation, count)
        };
        return jQuery.Deferred().reject(response, null, null).promise();
    };
    self.ApplyResultFail = function (xhr) {
        self.HideBusyIndicator();
        progressbarModel.EndProgressBar();

        if (xhr.status === 503) {
            var model = modelsHandler.GetModelByUri(self.Angle.model) || { id: self.Angle.model };
            var modelName = model.short_name || model.id;
            xhr.responseText = kendo.format(Localization.Info_NoActiveModelInstance, modelName);
        }
        if (xhr.status === 404) {
            // re-post
            self.Execute();
        }
        else {
            self.ResultErrorXhr = xhr;
            self.SetRetryPostResult(xhr, self.ElementId);
        }
    };
    self.LoadFields = function () {
        var fields = [];

        // get fields from display
        if (self.Display) {
            var displayMetadata = WC.ModelHelper.GetAllMetadata(self.Display);
            jQuery.merge(fields, displayMetadata.fields);
        }

        if (self.Angle) {
            var angleMetadata = WC.ModelHelper.GetAllMetadata(self.Angle);
            jQuery.merge(fields, angleMetadata.fields);
        }

        fields = fields.distinct();

        var request = modelsHandler.GetQueryFieldsUri(self.Data(), self.Angle, true);
        return modelFieldsHandler.LoadFieldsByIds(request, fields)
            .then(function (data) {
                return modelFieldsHandler.LoadFieldsMetadata(data.fields);
            });
    };
    self.LoadDataFields = function () {
        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(self.Data().data_fields))
            .done(function (data) {
                jQuery.each(data.fields, function (index, field) {
                    if (!self.GetDataFieldById(field.id)) {
                        self.DataFields.push(field);
                    }
                });
            });
    };
    self.GetDataFieldById = function (fieldId) {
        return self.DataFields.findObject('id', fieldId, false);
    };
    //EOF: View model methods
}
DashboardResultViewModel.IsPostIntegrityRunning = false;