var resultModel = new ResultViewModel();

function ResultViewModel() {
    "use strict";

    var self = this;
    var cacheDataField = {};
    //BOF: View model properties
    self.BaseClassName = ko.observable('');
    self.TotalRow = ko.observable(0);
    self.DisplayTotalRow = ko.observable(0);
    self.ExecutionTime = ko.observable(0);
    self.IsMinutes = false;
    self.ResultDateTime = ko.observable(null);
    self.Data = ko.observable(null);
    self.PostingOptions = ko.observable({});
    self.RequestUri = null;
    self.Fields = [];
    self.ResultFromDisplayType = ko.observable(null);
    self.DataFields = [];
    self.TemporaryAnglePosted = true;
    self.LastRenderInfo = {};
    self.CustomProgressbar = false;
    self.AngleResultSummary = {};
    //EOF: View model properties

    //BOF: View model methods
    self.PostResult = function (options) {
        self.PostingOptions(options);
        var settings =
            jQuery.extend({
                // string, post uri
                uri: directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.RESULTS) + '?redirect=no',

                // array, add queryblocks to settings.data
                customQueryBlocks: [],

                // json, extend to base_angle, e.g. { step_type: 'aa', fields: 'bb' }
                angleQuery: angleQueryStepModel.ExcuteParameters(),

                // json, extend to base_display, e.g. { step_type: 'aa', fields: 'bb' }
                displayQuery: displayQueryBlockModel.ExcuteParameters(),

                // bool, use execute_steps
                useExecuteStep: false,

                // array, use when useExecuteStep = true, if null then find by system
                customExecuteStep: null,

                // default current display
                currentDisplay: displayModel.Data()
            }, options);

        var currentDisplayQueryBlocks = displayQueryBlockModel.CollectQueryBlocks();
        var isTempAngle = angleInfoModel.IsTemporaryAngle(angleInfoModel.Data().uri);

        // custom query case: drilldown
        if (settings.useExecuteStep && settings.customExecuteStep !== null) {

            // use custom query step
            settings.uri = self.Data().execute_steps + '?redirect=no';
            settings.data = { queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS, query_steps: settings.customExecuteStep };

            var rePostSteps = {
                useExecuteStep: false,
                customExecuteStep: null,
                customQueryBlocks: ko.toJS(currentDisplayQueryBlocks)
            };

            // check if clear sorting step
            if (settings.customExecuteStep[0].step_type === enumHandlers.FILTERTYPE.SORTING && !settings.customExecuteStep[0].sorting_fields.length) {
                if (rePostSteps.customQueryBlocks.length) {
                    rePostSteps.customQueryBlocks[0].query_steps.push(settings.customExecuteStep[0]);
                }
                else {
                    rePostSteps.customQueryBlocks = [settings.data];
                }
            }
            self.PostingOptions(rePostSteps);
        }
        else {
            //if not temp display
            if (!isTempAngle || !self.TemporaryAnglePosted) {
                settings.data = {
                    query_definition: [
                        {
                            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE,
                            base_angle: isTempAngle ? angleInfoModel.GetTemplateAngle().uri : angleInfoModel.Data().uri
                        }
                    ]
                };
            }
            else {
                // case create new angle post basse class
                if (!angleInfoModel.Data().uri_template) {
                    settings.data = {
                        query_definition: [angleQueryStepModel.BaseClasses()],
                        model: angleInfoModel.Data().model
                    };
                }
                else {
                    settings.data = {
                        query_definition: [
                            {
                                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE,
                                base_angle: angleInfoModel.Data().uri_template
                            }
                        ]
                    };

                    if (displayModel.Data().uri_template) {
                        settings.data.query_definition.push({
                            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY,
                            base_display: displayModel.Data().uri_template
                        });
                    }
                }
            }

            // query block when..
            // - has display
            // - saved display or unsave display & angle is_template & never post result
            // - customQueryBlocks not null (check for pivot grant totals drilldown)
            // ex
            if (settings.currentDisplay !== null && (!displayModel.IsTemporaryDisplay() || (displayModel.IsTemporaryDisplay() && !self.TemporaryAnglePosted))
                && settings.customQueryBlocks && settings.customQueryBlocks.length) {
                if (jQuery.deepCompare(settings.currentDisplay.query_blocks, settings.customQueryBlocks, false, false)) {
                    settings.data.query_definition.push({
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY,
                        base_display: displayModel.IsTemporaryDisplay(settings.currentDisplay.uri) ? displayModel.Data().uri_template : settings.currentDisplay.uri
                    });
                }
                else {
                    jQuery.each(settings.customQueryBlocks, function (k, v) {
                        // remove base_class, base_angle, base_display if exists
                        if (v.queryblock_type !== enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                            var queryblockTypeIndex = settings.data.query_definition.indexOfObject('queryblock_type', v.queryblock_type);
                            if (queryblockTypeIndex !== -1) {
                                settings.data.query_definition.splice(queryblockTypeIndex, 1);
                            }
                        }

                        var isDuplicate = false;

                        jQuery.each(jQuery.grep(settings.data.query_definition, function (definition) { return definition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS; }), function (index, definitionType) {
                            jQuery.each(definitionType.query_steps, function (dIndex, dStep) {
                                jQuery.each(v.query_steps, function (vIndex, step) {
                                    if (jQuery.deepCompare(step, dStep, false))
                                        isDuplicate = true;
                                });
                            });
                        });

                        if (!isDuplicate) settings.data.query_definition.push(v);
                    });
                }
            }
            else {
                if (settings.currentDisplay && (!displayModel.IsTemporaryDisplay() || (displayModel.IsTemporaryDisplay() && !self.TemporaryAnglePosted))) {
                    settings.data.query_definition.push({
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY,
                        base_display: displayModel.IsTemporaryDisplay(settings.currentDisplay.uri) ? displayModel.Data().uri_template : settings.currentDisplay.uri
                    });
                }
            }

            // when is unsave angle then always send the angle queryblocks
            var hasAngleQueryStepsBlock = !angleInfoModel.Data().uri_template && isTempAngle && self.TemporaryAnglePosted && angleQueryStepModel.GetQueryStep().length > 0;
            if (hasAngleQueryStepsBlock) {
                settings.data.query_definition.push(angleQueryStepModel.GetQueryStep()[0]);
            }

            // add blocks when has customQueryBlocks
            if (settings.customQueryBlocks !== null && settings.customQueryBlocks.length > 0) {
                jQuery.each(settings.customQueryBlocks, function (k, v) {
                    // remove base_class, base_angle, base_display if exists
                    if (v.queryblock_type !== enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                        var queryblockTypeIndex = settings.data.query_definition.indexOfObject('queryblock_type', v.queryblock_type);
                        if (queryblockTypeIndex !== -1)
                            settings.data.query_definition.splice(queryblockTypeIndex, 1);
                    }

                    var isDuplicate = false;

                    jQuery.each(jQuery.grep(settings.data.query_definition, function (definition) { return definition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS; }), function (index, definitionType) {
                        jQuery.each(definitionType.query_steps, function (dIndex, dStep) {
                            jQuery.each(v.query_steps, function (vIndex, step) {
                                if (jQuery.deepCompare(step, dStep, false))
                                    isDuplicate = true;
                            });
                        });
                    });

                    if (!isDuplicate)
                        settings.data.query_definition.push(v);
                });
            }
            else {
                // when is unsave display & temp-angle is posted then always send the queryblocks
                if (self.TemporaryAnglePosted && displayModel.IsTemporaryDisplay() && currentDisplayQueryBlocks.length)
                    settings.data.query_definition.push(currentDisplayQueryBlocks[0]);
            }

            // remove base_display if has queryblock step
            if (settings.data.query_definition.hasObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS))
                settings.data.query_definition.removeObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);

            // execution parameters
            if (settings.angleQuery && settings.angleQuery.execution_parameters && !hasAngleQueryStepsBlock) {
                var baseAngleBlock = settings.data.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE);
                if (baseAngleBlock)
                    jQuery.extend(baseAngleBlock, settings.angleQuery);
            }
            if (settings.displayQuery && settings.displayQuery.execution_parameters) {
                var baseDisplayBlock = settings.data.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
                if (baseDisplayBlock)
                    jQuery.extend(baseDisplayBlock, settings.displayQuery);
            }

            // merge query steps block into 1 block
            var stepBlocks = settings.data.query_definition.findObjects('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            if (stepBlocks.length > 1) {
                var stepBlock = {
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                    query_steps: []
                };
                jQuery.each(stepBlocks, function (index, block) {
                    jQuery.each(block.query_steps, function (indexStep, step) {
                        stepBlock.query_steps.push(step);
                    });
                });
                settings.data.query_definition.removeObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
                settings.data.query_definition.push(stepBlock);
            }

            self.TemporaryAnglePosted = true;
        }

        // check if no uri return call function
        if (settings.uri === null) {
            return jQuery.when(null);
        }
        else {
            if (!angleInfoModel.Data().executed) {
                angleInfoModel.Data().executed = {
                    datetime: WC.DateHelper.GetCurrentUnixTime(),
                    full_name: userModel.Data().full_name,
                    user: userModel.Data().uri
                };
                angleInfoModel.SetAngleSatistics(null, null, angleInfoModel.Data().executed, null, null);
            }

            var executionTime = (angleInfoModel.Data().user_specific && angleInfoModel.Data().user_specific.times_executed || 0) + 1;
            angleInfoModel.Data().user_specific.times_executed = executionTime;
            angleInfoModel.Data.commit();
            angleInfoModel.TimeExcuted(executionTime);

            return CreateDataToWebService(directoryHandler.ResolveDirectoryUri(settings.uri), settings.data)
                .fail(function (xhr, status, error) {
                    self.ApplyResultFail(xhr, status, error, settings.useExecuteStep);
                })
                .then(self.LoadSuccess)
                .then(function () {
                    return jQuery.when(self.Data());
                });
        }
    };
    self.RetryPostResult = function () {
        // disable errorHandler
        errorHandlerModel.Enable(false);
        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_PostResult);

        // find existing fail result in history
        var history = {};
        jQuery.each(historyModel.Data(), function (k, v) {
            if (v.results && v.results.uri === self.Data().uri) {
                history[k] = v;
            }
        });

        // re-post
        return self.PostResult(self.PostingOptions())
            .then(function (data) {
                return self.GetResult(data.uri);
            })
            .done(function () {
                // update history
                jQuery.each(history, function (key, value) {
                    value.results = ko.toJS(self.Data());
                    historyModel.Set(key, value);
                });
                self.ApplyResult();
            })
            .always(function () {
                errorHandlerModel.Enable(true);
            });
    };
    self.SetRetryPostResultToErrorPopup = function (httpStatusCode) {
        if (httpStatusCode === 404) {
            // M4-38478
            errorHandlerModel.Enable(false);
            popup.Alert(Localization.Warning_Title, Localization.MessageAngleNeedsToBeReExecuted);
            popup.OnCloseCallback = self.RetryPostResult;
            setTimeout(function () {
                errorHandlerModel.Enable(true);
            }, 100);
        }
    };
    self.LoadSuccess = function (data, status, xhr) {
        if (displayModel.Data() === null) {
            data.display_type = null;
            data.display_uri = null;
            data.display_fields = [];
            data.angle_uri = null;
            data.posted_angle = null;
            data.posted_display = [];
        }
        else {
            data.display_type = displayModel.Data().display_type;
            data.display_uri = displayModel.Data().uri;
            data.display_fields = displayModel.Data().fields;
            data.angle_uri = angleInfoModel.Data().uri;
            data.posted_angle = ko.toJS(angleInfoModel.Data().query_definition);
            data.posted_display = displayQueryBlockModel.CollectQueryBlocks();
        }

        self.RequestUri = data.uri;
        self.SetResultExecution(data);
        self.Data(data);
        return jQuery.when(data);
    };
    self.SetResultExecution = function (data) {
        self.SetBaseClassName(data);
        self.TotalRow(data.row_count || 0);
        self.DisplayTotalRow(data.object_count || 0);
        self.IsMinutes = data.execution_time >= 60000;
        var executionTimeSec;
        if (self.IsMinutes)
            executionTimeSec = ConvertMillisToMinutesAndSeconds(data.execution_time || 0);
        else
            executionTimeSec = ConvertMsToSec(data.execution_time || 0);

        self.ExecutionTime(executionTimeSec);
        self.ResultDateTime(WC.DateHelper.UnixTimeToLocalDate(data.modeldata_timestamp || 0));
    };
    self.SetBaseClassName = function (data) {
        /*  M4-10057: Implement state transfers for angles/displays/dashboards
            AS59 got rid of 'results/xxx/classes', 
            WC changed to use 'results/xxx/actual_classes' 
            and if actual_classes is nothing, used potential_classes instead  
        */

        var classes = [];
        if (data.actual_classes && data.actual_classes.length) {
            classes = data.actual_classes;
        }
        else if (data.potential_classes && data.potential_classes.length) {
            classes = data.potential_classes;
        }

        if (classes.length === 1) {
            var baseClassId = classes[0];
            var classObject = modelClassesHandler.GetClassById(baseClassId, data.model || angleInfoModel.Data().model) || { id: baseClassId };
            self.BaseClassName(userFriendlyNameHandler.GetFriendlyName(classObject, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME));
        }
        else {
            self.BaseClassName('');
        }
    };

    self.RequestResult = function (request) {
        var deferred = jQuery.Deferred();
        var fnCheckGetResultDelay, fnCheckGetResult;
        var requestStatus = {
            completed: false,
            fn: jQuery.noop,
            args: [],
            response: {}
        };

        var getResult = function (uri) {
            GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri))
                .fail(function (xhr, status, error) {
                    if (xhr.status === 404) {
                        jQuery.when(self.RetryPostResult())
                            .done(function (data) {
                                getResult(data.uri);
                            });
                    }
                    else {
                        errorHandlerModel.Enable(true);
                        requestStatus.completed = true;
                        requestStatus.fn = 'reject';
                        requestStatus.args = [xhr, status, error];
                    }
                })
                .done(function (data, status, xhr) {
                    clearTimeout(fnCheckGetResultDelay);
                    if (data === false) {
                        requestStatus.response = false;
                        requestStatus.completed = true;
                    }
                    else {
                        data.row_count = data.row_count || 0;
                        data.object_count = data.object_count || 0;

                        if (data.status !== enumHandlers.POSTRESULTSTATUS.FINISHED.Value) {
                            data.progress = Math.max(0, Math.min(data.progress || 0, 0.99));

                            fnCheckGetResultDelay = setTimeout(function () {
                                // Call to server again is data not success
                                getResult(uri);
                            }, intervalTime);
                        }
                        else {
                            data.progress = 1;
                            requestStatus.completed = true;

                            // finished but not successfully_completed
                            if (!data.successfully_completed) {
                                data.responseText = Localization.ErrorPostResultFinishWithUnknown;
                                requestStatus.fn = 'reject';
                                requestStatus.args = [data, null, null];
                            }
                            else {
                                requestStatus.fn = 'resolve';
                                requestStatus.args = [data, status, xhr];
                            }
                        }
                        requestStatus.response = data;
                    }
                });
        };

        getResult(request);

        clearInterval(fnCheckGetResult);
        fnCheckGetResult = setInterval(function () {
            if (requestStatus.response === false) {
                clearTimeout(fnCheckGetResultDelay);
                clearInterval(fnCheckGetResult);
                deferred.resolve(false);
            }
            else {
                deferred.notify(requestStatus.response);

                if (requestStatus.completed) {
                    clearInterval(fnCheckGetResult);
                    deferred[requestStatus.fn].apply(this, requestStatus.args);
                }
            }
        }, 100);

        var promise = deferred.promise();
        promise.progress(function (data) {
            if (typeof self.CustomProgressbar === 'function') {
                self.CustomProgressbar(data);
            }
            else {
                var rowCount;
                if (self.Data()
                    && (self.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT || self.Data().display_type === enumHandlers.DISPLAYTYPE.CHART)) {
                    rowCount = null;
                }
                else {
                    rowCount = kendo.toString(data.row_count, 'n0');
                }
                progressbarModel.SetProgressBarText(kendo.toString(data.progress * 100, 'n2'), rowCount, enumHandlers.POSTRESULTSTATUS.RUNNING.Text);
            }
        });
        promise.fail(self.ApplyResultFail);
        promise.done(function (data, status, xhr) {
            if (data !== false) {
                defaultValueHandler.CheckAndExtendProperties(data, enumHandlers.VIEWMODELNAME.RESULTMODEL, true);
                self.LoadSuccess(data);
            }
        });
        return promise;
    };
    self.RequestDataField = function () {
        return jQuery.when(self.Data().is_aggregated ? self.LoadDataFields() : null);
    };
    self.GetResult = function (request, callback) {
        return jQuery.when(self.RequestResult(request), self.RequestDataField());
    };
    self.SetLatestRenderInfo = function () {
        if (displayModel.Data()) {
            self.LastRenderInfo = {
                display_type: displayModel.Data().display_type,
                result_uri: self.Data().uri
            };
        }
    };
    self.ApplyResult = function () {
        if (window.anglePageHandler)
            anglePageHandler.ApplyExecutionAngle();

        switch (displayModel.Data().display_type) {
            case enumHandlers.DISPLAYTYPE.PIVOT:
                pivotPageHandler.GetPivotDisplay();
                break;
            case enumHandlers.DISPLAYTYPE.CHART:
                chartHandler.GetChartDisplay();
                break;

            case enumHandlers.DISPLAYTYPE.LIST:
                listHandler.GetListDisplay(true);
                progressbarModel.EndProgressBar();
                break;
        }
    };
    self.SetNotSuccessfullyCompleted = function () {
        var response = {
            responseText: Localization.ErrorPostResultFinishWithUnknown
        };
        return jQuery.Deferred().reject(response, null, null).promise();
    };
    self.ApplyResultFail = function (xhr, status, error, retry404) {
        if (typeof retry404 === 'undefined')
            retry404 = true;

        if (status === null) {
            errorHandlerModel.Enable(true);
            if (window.anglePageHandler)
                anglePageHandler.ApplyAngleAndDisplayWithoutResult(displayModel.Data());
            errorHandlerModel.ShowCustomError(Localization.ErrorPostResultFinishWithUnknown);
        }
        else if (xhr.status === 404) {
            if (retry404) {
                self.RetryPostResult();
            }
            else {
                var response = WC.Utility.ParseJSON(xhr.responseText, null);
                if (response && /^\/?angles\/\d+$/.test(response.message)) {
                    angleInfoModel.Data().display_definitions = [];
                    angleInfoModel.Data.commit();
                    if (window.anglePageHandler)
                        anglePageHandler.HandleNoneExistDisplay();
                }
                else if (response && /^\/?displays\/\d+$/.test(response.message)) {
                    angleInfoModel.Data().display_definitions.removeObject('uri', displayModel.Data().uri);
                    angleInfoModel.Data.commit();
                    if (window.anglePageHandler)
                        anglePageHandler.HandleNoneExistDisplay();
                }
                else {
                    errorHandlerModel.OnClickRetryErrorCallback = function () {
                        self.RetryPostResult();
                    };
                }
            }
        }
        else {
            errorHandlerModel.OnClickRetryErrorCallback = function () {
                self.RetryPostResult();
            };
        }
    };
    self.GetResultDisplayFieldByFieldId = function (fieldId) {
        var displayField = jQuery.grep(self.Fields, function (field, index) {
            return field.id === fieldId;
        });
        return displayField.length > 0 ? displayField[0] : null;
    };
    self.LoadResultFields = function (isPostResult) {
        if (typeof isPostResult === 'undefined')
            isPostResult = true;

        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_GettingAngleFields);

        // get followups from angle
        var followupIds = [];
        if (angleInfoModel.Data()) {
            var angleMetadata = WC.ModelHelper.GetAllMetadata(angleInfoModel.Data());
            jQuery.merge(followupIds, angleMetadata.followups);
        }

        // get followups from display
        if (displayModel.Data()) {
            var displayMetadata = WC.ModelHelper.GetAllMetadata(displayModel.Data());
            jQuery.merge(followupIds, displayMetadata.followups);
        }

        // load current instance
        var loadCurrentModelInstance = function () {
            if (self.Data() && self.Data().model && self.Data().instance) {
                var model = modelsHandler.GetModelByUri(self.Data().model);
                if (!model.current_instance || typeof model.available === 'undefined') {
                    angleInfoModel.ModelServerAvailable = false;
                }
                else {
                    return modelCurrentInstanceHandler.LoadCurrentModelInstance(self.Data().instance, self.Data().model)
                        .done(function () {
                            angleInfoModel.ModelServerAvailable = true;
                        });
                }
            }
            return null;
        };

        // data fields
        var loadDataFields = function () {
            if (isPostResult && self.Data() && !self.Data().is_aggregated) {
                var fields = [];
                jQuery.each(self.Data().display_fields, function (index, displayField) {
                    if (displayField.valid)
                        fields.push(displayField.field);
                });
                return modelInstanceFieldsHandler.LoadFieldsByIds(self.Data().query_fields, fields);
            }

            return null;
        };

        return jQuery.when(
            loadCurrentModelInstance(),
            angleInfoModel.LoadMetadata(angleInfoModel.Data(), displayModel.Data()),
            modelFollowupsHandler.LoadFollowupsByIds(followupIds, angleInfoModel.Data().model),
            loadDataFields()
        )
            .fail(function () {
                if (isPostResult) {
                    errorHandlerModel.OnClickRetryErrorCallback = self.RetryPostResult;
                }
            })
            .done(function () {
                if (isPostResult) {
                    // save lastest uri
                    if (typeof historyModel !== 'undefined') {
                        historyModel.LastResultUri(self.Data().uri);
                    }

                    if (typeof exportExcelHandler !== 'undefined') {
                        exportExcelHandler.SetData(angleInfoModel.Data());
                    }

                    self.SetLatestRenderInfo();
                }
            });
    };
    self.LoadDataFields = function () {
        return jQuery.when(cacheDataField[self.Data().data_fields] || GetDataFromWebService(directoryHandler.ResolveDirectoryUri(self.Data().data_fields)))
            .fail(function (xhr, status, error) {
                errorHandlerModel.OnClickRetryErrorCallback = self.RetryPostResult;
            })
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
    self.CalculateChangeFieldCollection = function (modelUri, angleUri) {
        var sessionPrivileges = privilegesViewModel.GetModelPrivilegesByUri(modelUri);
        var privilageAllowMoreDetail = sessionPrivileges.length === 0 ? false : sessionPrivileges[0].privileges.allow_more_details;

        return privilageAllowMoreDetail || angleInfoModel.Data().allow_more_details;
    };
    self.GetExecutionResultText = function (isTitleText) {
        var text = '';
        if (self.ResultDateTime()) {
            var angleResultSummaryModel = {};
            angleResultSummaryModel.SAPSystem = angleInfoModel.ModelName().FriendlyName();
            text += angleResultSummaryModel.SAPSystem + ' ';

            var resultDateText = WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATETIME_WC, self.ResultDateTime());
            if (resultDateText) {
                angleResultSummaryModel.resultDateTime = resultDateText;
                text += angleResultSummaryModel.resultDateTime + ', ';
            }

            angleResultSummaryModel.baseClassName = "";
            if (self.BaseClassName()) {
                angleResultSummaryModel.baseClassName = self.BaseClassName();
                text += angleResultSummaryModel.baseClassName + ', ';
            }
            else {
                var baseClassNameArray = angleInfoModel.GetAngleBaseClasses();
                for (var i = 0; i < baseClassNameArray[0].base_classes.length; i++) {

                    var baseClassId = baseClassNameArray[0].base_classes[i];
                    var classObject = modelClassesHandler.GetClassById(baseClassId, angleInfoModel.Data().model) || { id: baseClassId };
                    var baseClassFriendlyName = userFriendlyNameHandler.GetFriendlyName(classObject, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);

                    angleResultSummaryModel.baseClassName += baseClassFriendlyName + "<br/>";
                }
            }
            var numberOfObjectFormat = new Formatter({ thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);

            angleResultSummaryModel.displayTotalRow = WC.FormatHelper.GetFormattedValue(numberOfObjectFormat, self.DisplayTotalRow());
            angleResultSummaryModel.totalRow = WC.FormatHelper.GetFormattedValue(numberOfObjectFormat, self.TotalRow());

            var numberOfRows = self.Data() && enumHandlers.DISPLAYTYPE.PIVOT === self.Data().display_type ? kendo.format(Localization.AngleDefinitionAreaNumberRow, angleResultSummaryModel.totalRow) : '';

            text += angleResultSummaryModel.displayTotalRow + ' ' + kendo.format(Localization.AngleDefinitionAreaObjectsIn, numberOfRows) + ' ';

            var executionTime = parseFloat(self.ExecutionTime());
            if (self.IsMinutes) {
                angleResultSummaryModel.executionTime = executionTime.toFixed(1) + ' ' + Localization.AngleDefinitionAreaMin;
                text += measurePerformance.GetTimeElapsed().toFixed(0) + ' ' + Localization.AngleDefinitionAreaSec;
            }
            else {
                angleResultSummaryModel.executionTime = executionTime.toFixed(1) + ' ' + Localization.AngleDefinitionAreaSec;
                text += measurePerformance.GetTimeElapsed().toFixed(0) + ' ' + Localization.AngleDefinitionAreaSec;
            }

            if (isTitleText) {
                return text;
            }
            else {
                self.AngleResultSummary = angleResultSummaryModel;
                return '<span>' + text + '</span><a class="btnInfo" onclick="angleDetailPageHandler.ShowAngleResultSummary()"></a>';
            }
        }
        else {
            if (isTitleText)
                return Localization.Info_AngleNotExecuted;
            else
                return '<i class="infoText">' + Localization.Info_AngleNotExecuted + '</i>';
        }
    };
    self.GetDefaultResultAuthorizations = function () {
        return {
            add_aggregation: false,
            add_filter: false,
            add_followup: false,
            change_field_collection: false,
            change_query_filters: false,
            change_query_followups: false,
            'export': false,
            single_item_view: false,
            sort: false
        };
    };
    //EOF: View model methods
}
