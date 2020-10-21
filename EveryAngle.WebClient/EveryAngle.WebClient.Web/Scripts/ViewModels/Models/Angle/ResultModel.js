var resultModel = new ResultViewModel();

function ResultViewModel() {
    "use strict";

    var self = this;
    var cacheDataField = {};
    var isResultRunning = true;
    var fnCheckGetResult;

    //BOF: View model properties
    self.Data = ko.observable(null);
    self.PostingOptions = ko.observable({});
    self.RequestUri = null;
    self.Fields = [];
    self.DataFields = [];
    self.TemporaryAnglePosted = true;
    self.LastRenderInfo = {};
    self.CustomProgressbar = false;
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
                currentDisplay: displayModel.Data(),

                // force to use this query
                customQueryDefinition: []
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
            var checkDisplay = settings.currentDisplay && (!displayModel.IsTemporaryDisplay() || displayModel.IsTemporaryDisplay() && !self.TemporaryAnglePosted);
            if (checkDisplay) {
                var hasCustomQueryBlocks = settings.customQueryBlocks && settings.customQueryBlocks.length;
                if (!hasCustomQueryBlocks || jQuery.deepCompare(settings.currentDisplay.query_blocks, settings.customQueryBlocks, false, false)) {
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

                        if (!isDuplicate)
                            settings.data.query_definition.push(v);
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
            
            // force to this query which is calculated outside
            // this is use for a new logic, it will replace logic above
            if (settings.customQueryDefinition.length) {
                settings.data.query_definition = settings.customQueryDefinition;
            }
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
        
        // re-post
        return self.PostResult(self.PostingOptions())
            .then(function (data) {
                return self.GetResult(data.uri);
            })
            .done(function () {
                self.ApplyResult();
            })
            .always(function () {
                errorHandlerModel.Enable(true);
            });
    };
    self.SetRetryPostResult = function (xhr, element) {
        xhr = xhr || {};
        errorHandlerModel.IgnoreAjaxError(xhr);

        var message = xhr.status === 404
            ? Localization.MessageAngleNeedsToBeReExecuted
            : errorHandlerModel.GetAreaErrorMessage(xhr.responseText);
        var callbackModelServer = function () {
            anglePageHandler.HandlerAngle.ClearAllPostResultsData();
            anglePageHandler.ExecuteAngle();
        };
        var callbackCommon = function () {
            anglePageHandler.HandlerDisplay.ClearPostResultData();
            anglePageHandler.ExecuteAngle();
        };

        var callbackRemoveSorting = function () {
            anglePageHandler.HandlerDisplay.QueryDefinitionHandler.RemoveSorting();
            anglePageHandler.HandlerAngle.ClearAllPostResultsData();
            anglePageHandler.ExecuteAngle();
        };

        var callback = xhr.status === 404 || xhr.status === 503 ? callbackModelServer : callbackCommon;
        var sortErrorMessage = Localization.Info_DisplaySortingReachedLimitation.slice(0, -3);
        if (message.indexOf(sortErrorMessage) === 0) {
            callback = callbackRemoveSorting;
        }
        errorHandlerModel.ShowAreaError(element, message, callback);
    };
    self.LoadSuccess = function (data) {
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
        self.Data(data);
        return jQuery.when(data);
    };
    self.ClearResult = function () {
        self.Data(null);
    };

    self.StartToObserveResult = function () {
        isResultRunning = true;
        clearInterval(fnCheckGetResult);
    };
    self.AbortToObserveResult = function () {
        isResultRunning = false;
        clearInterval(fnCheckGetResult);
    };
    self.RequestResult = function (uri) {
        var deferred = jQuery.Deferred();
        var requestStatus = {
            completed: false,
            fn: jQuery.noop,
            args: [],
            response: {}
        };

        self.ObserveResult(uri, requestStatus);
        self.WatchResult(deferred, requestStatus);
        return self.PromiseResult(deferred);
    };
    self.ObserveResult = function (uri, requestStatus) {
        GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri))
            .fail(function (xhr, status, error) {
                if (xhr.status === 404) {
                    jQuery.when(self.RetryPostResult())
                        .done(function (data) {
                            self.ObserveResult(data[0].uri, requestStatus);
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
                if (data === false) {
                    requestStatus.response = false;
                    requestStatus.completed = true;
                }
                else {
                    data.row_count = data.row_count || 0;
                    data.object_count = data.object_count || 0;

                    if (data.status !== enumHandlers.POSTRESULTSTATUS.FINISHED.Value) {
                        data.progress = Math.max(0, Math.min(data.progress || 0, 0.99));

                        if (isResultRunning) {
                            // call to server again if the data is not success
                            setTimeout(function () {
                                self.ObserveResult(uri, requestStatus);
                            }, intervalTime);
                        }
                        else {
                            WC.Ajax.SendExitRequests([new RequestModel(RequestModel.METHOD.DELETE, uri)], true);
                            // restore observation
                            self.StartToObserveResult();
                        }

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
    self.WatchResult = function (deferred, requestStatus) {
        clearInterval(fnCheckGetResult);
        fnCheckGetResult = setInterval(function () {
            if (requestStatus.response === false) {
                self.AbortToObserveResult();
                deferred.resolve(false);
            }
            else {
                deferred.notify(requestStatus.response);

                if (requestStatus.completed) {
                    self.AbortToObserveResult();
                    deferred[requestStatus.fn].apply(this, requestStatus.args);
                }
            }
        }, 100);
    };
    self.PromiseResult = function (deferred) {
        var promise = deferred.promise();
        promise.progress(function (data) {
            if (typeof self.CustomProgressbar === 'function') {
                self.CustomProgressbar(data);
            }
            else {
                var queuedMessage;
                if (data.queue_position === 0) {
                    queuedMessage = Localization.ExecutingAngleMessage;
                } else if (!data.queue_position) {
                    queuedMessage = '';
                } else {
                    queuedMessage = kendo.format(data.queue_position === 1 ? Localization.FirstInQueueMessage : Localization.LaterInQueueMessage, data.queue_position);
                }
                progressbarModel.SetProgressBarTextAndMessage(kendo.toString(data.progress * 100, 'n2'), queuedMessage);
            }
        });
        promise.fail(self.ApplyResultFail);
        promise.done(function (data) {
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
    self.GetResult = function (request) {
        // need to reset observation before getting the new result
        self.StartToObserveResult();
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
                pivotPageHandler.HasResult(true);
                pivotPageHandler.ReadOnly(false);
                pivotPageHandler.GetPivotDisplay();
                break;
            case enumHandlers.DISPLAYTYPE.CHART:
                chartHandler.HasResult(true);
                chartHandler.ReadOnly(false);
                chartHandler.GetChartDisplay();
                break;
            case enumHandlers.DISPLAYTYPE.LIST:
                listHandler.HasResult(true);
                listHandler.ReadOnly(false);
                listHandler.GetListDisplay(true);
                progressbarModel.EndProgressBar();
                break;
            default:
                break;
        }
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
        var displayField = jQuery.grep(self.Fields, function (field) {
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
                    self.SetLatestRenderInfo();
                }
            });
    };
    self.LoadDataFields = function () {
        return jQuery.when(cacheDataField[self.Data().data_fields] || GetDataFromWebService(directoryHandler.ResolveDirectoryUri(self.Data().data_fields)))
            .fail(function () {
                errorHandlerModel.OnClickRetryErrorCallback = self.RetryPostResult;
            })
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
    self.IsSupportSapTransaction = function () {
        var isSupport = false;
        var data = self.Data();
        if (data) {
            isSupport = !IsNullOrEmpty(data.sap_transactions);
        }

        return enableGoToSAP && isSupport;
    };
    //EOF: View model methods
}
