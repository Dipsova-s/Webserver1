function DashboardResultViewModel(elementId, model, dashboardViewModel, executeParameters) {
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
    self.ExecuteParameters = WC.Utility.ToArray(executeParameters);
    //EOF: View model properties

    self.Execute = function () {
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
        var executeParameters = self.GetPostExecuteParameters(self.ExecuteParameters, self.Angle.query_definition, self.Display.query_blocks);
        var validDashboardFilters = self.WidgetModel.GetExtendedFilters();
        var dashboardQueryBlock = {
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: validDashboardFilters
        };

        postData.query_definition.push({
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE,
            base_angle: self.WidgetModel.angle
        });
        if (executeParameters.angle.length)
            postData.query_definition[0].execution_parameters = executeParameters.angle;

        // [DANGER AREA]: pivot or chart widget will got the error when try to include base display with dashboard query steps
        if (validDashboardFilters.length && self.Display.contained_aggregation_steps) {
            var newBlockQuerySteps = self.WidgetModel.GetBlockQueryStepsWithNewFilters(validDashboardFilters);
            dashboardQueryBlock.query_steps = newBlockQuerySteps.query_steps;
        }
        else {
            postData.query_definition.push({
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY,
                base_display: self.WidgetModel.display
            });
            if (executeParameters.display.length)
                postData.query_definition[1].execution_parameters = executeParameters.display;
        }

        if (validDashboardFilters.length)
            postData.query_definition.push(dashboardQueryBlock);

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
        if (!self.DashboardModel.GetDashboardFilters().length)
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
        var dashboardFilters = self.DashboardModel.GetDashboardFilters();
        var queryDefinition = self.WidgetModel.GetQueryDefinitionsWithNewFilters(dashboardFilters);

        return {
            query_definition: queryDefinition
        };
    };
    self.GetPostExecuteParameters = function (executeParameters, angleQueryBlocks, displayQueryBlocks) {
        var data = {
            angle: [],
            display: []
        };

        if (executeParameters.length) {
            var getQuerySteps = function (queryBlocks) {
                var stepQueryBlock = queryBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
                return stepQueryBlock ? stepQueryBlock.query_steps : [];
            };
            var setExecutableQuery = function (source, querySteps, query) {
                var executableQuerys = querySteps.findObjects('is_execution_parameter', true);
                var executableQuery = executableQuerys.findObject('field', query.field);
                if (executableQuery && executableQuery.is_execution_parameter) {
                    executableQuery.operator = query.operator;
                    executableQuery.arguments = query.arguments;
                    source.push(executableQuery);
                }
            };

            var angleSteps = getQuerySteps(angleQueryBlocks);
            var displaySteps = getQuerySteps(displayQueryBlocks);

            jQuery.each(executeParameters, function (index, query) {
                setExecutableQuery(data.angle, angleSteps, query);
                setExecutableQuery(data.display, displaySteps, query);
            });
        }

        return data;
    };
    self.PostExecutionSteps = function (querySteps) {
        var query = {
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: querySteps
        };
        return CreateDataToWebService(directoryHandler.ResolveDirectoryUri(self.Data().execute_steps) + '?redirect=no', query);
    };
    self.RetryPostResult = function (msg) {
        var widgetContainer = jQuery(self.ElementId + '-container');
        var message = errorHandlerModel.GetAreaErrorMessage(msg);
        widgetContainer.busyIndicator(false);
        dashboardHandler.RemoveWidgetDisplayElement(self.ElementId.slice(1), widgetContainer, self.Display);
        errorHandlerModel.ShowAreaError(self.ElementId, message, function () {
            widgetContainer.busyIndicator(true);
            self.Execute();
        });
    };
    self.GetResult = function (request) {
        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(request))
            .fail(self.ApplyResultFail)
            .done(self.GetResultSuccess);
    };
    self.GetResultSuccess = function (response, textStatus, xmlHttpRequest) {
        if (response.status !== enumHandlers.POSTRESULTSTATUS.FINISHED.Value) {
            window.setTimeout(function () {
                // Call to serve again is data not success
                self.GetResult(response.uri);
            }, intervalTime);
        }
        else {
            // finished but not successfully_completed
            if (!response.successfully_completed) {
                jQuery.when(self.SetNotSuccessfullyCompleted())
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

                defaultValueHandler.CheckAndExtendProperties(response, enumHandlers.VIEWMODELNAME.RESULTMODEL, true);
                response.query_definition = self.Data().query_definition;
                self.Data(response);
                jQuery.when(
                    self.LoadFields(),
                    loadDataFields()
                )
                .fail(function (requests) {
                    if (requests[0] instanceof Array) requests = requests[0];
                    if (requests[0] instanceof Array) requests = requests[0];

                    self.RetryPostResult(requests.responseText);

                })
                .done(function () {
                    self.ApplyResult();
                });
            }
        }
    };
    self.ApplyResult = function () {
        var container = self.ElementId + '-container',
            model;

        dashboardModel.SetDashboardStatistics('executed', self.Data().executed);
        dashboardDetailsHandler.Model.SetDashboardStatistics('executed', self.Data().executed);

        switch (self.Display.display_type) {
            case enumHandlers.DISPLAYTYPE.PIVOT:
                model = new PivotPageHandler(self.ElementId, container);
                model.ReadOnly(true);
                model.DashBoardMode(true);
                model.Models.Angle = self.AngleModel;
                model.Models.Display = self.DisplayModel;
                model.Models.DisplayQueryBlock = new DisplayQueryBlockModel(self.Display.query_blocks);
                model.Models.Result = self;
                model.FieldSettings = null;
                model.GetPivotDisplay();
                break;

            case enumHandlers.DISPLAYTYPE.CHART:
                model = new ChartHandler(self.ElementId, container);
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
                break;

            case enumHandlers.DISPLAYTYPE.LIST:
                model = new ListHandler(self.ElementId, container);
                model.ReadOnly(true);
                model.DashBoardMode(true);
                model.Models.Angle = self.AngleModel;
                model.Models.Display = self.DisplayModel;
                model.Models.DisplayQueryBlock = new DisplayQueryBlockModel(self.Display.query_blocks);
                model.Models.Result = self;
                model.GetListDisplay();
                break;
        }

        if (model) jQuery(container).data('Model', model);
    };
    self.SetNotSuccessfullyCompleted = function () {
        var response = {
            responseText: Localization.ErrorPostResultFinishWithUnknown
        };
        return jQuery.Deferred().reject(response, null, null).promise();
    };
    self.ApplyResultFail = function (xhr) {
        jQuery(self.ElementId).parent().busyIndicator(false);
        progressbarModel.EndProgressBar();

        if (xhr.status === 404) {
            // re-post
            self.Execute();
        }
        else {
            self.RetryPostResult(xhr.responseText);
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
            .then(function (data, status, xhr) {
                return modelFieldsHandler.LoadFieldsMetadata(data.fields);
            });
    };
    self.LoadDataFields = function () {
        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(self.Data().data_fields))
            .done(function (data, status, xhr) {
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