function DisplayHandler(model, parent) {
    "use strict";

    var _self = {};

    var self = this;
    self.AngleHandler = null;
    self.Data = ko.observable(null);
    self.ItemDescriptionHandler = new ItemDescriptionHandler();
    self.QueryDefinitionHandler = new QueryDefinitionHandler();
    self.ResultHandler = new ResultHandler(self);
    self.DisplayResultHandler = new BaseDisplayResultHandler(self);
    self.DisplayDrilldownHandler = new DisplayDrilldownHandler(self);
    self.DisplayStatisticHandler = new DisplayStatisticHandler(self);

    self.Initial = function (model, parent) {
        self.AngleHandler = parent;
        self.SetData(model);

        // display result
        self.SetDisplayResultHandler(self.Data().display_type);

        // query steps
        self.InitialQueryDefinition(self.Data().query_blocks);
    };
    self.ForceInitial = function (data) {
        self.QueryDefinitionHandler.ForcedSetData = true;
        self.Initial(data, self.AngleHandler);
    };
    self.SetData = function (model) {
        var data = jQuery.extend({}, WC.ModelHelper.ExtendDisplayData(model, self.AngleHandler.Data()));
        data.id = ko.observable(data.id);
        data.is_public = ko.observable(data.is_public);
        data.is_angle_default = ko.observable(data.is_angle_default);
        data.user_specific.is_user_default = ko.observable(data.user_specific.is_user_default);
        data.user_specific.execute_on_login = ko.observable(data.user_specific.execute_on_login);
        self.Data(data);
    };
    self.GetData = function () {
        var rawData = jQuery.extend(ko.toJS(self.Data()), self.QueryDefinitionHandler.GetQueryDefinition());
        return WC.ModelHelper.ExtendDisplayData(rawData, self.AngleHandler.Data());
    };
    self.SetRawData = function (data) {
        var rawData = jQuery.extend({}, self.GetRawData(), data);
        self.AngleHandler.SetRawDisplay(rawData);
    };
    self.GetRawData = function () {
        return self.AngleHandler.GetRawDisplay(self.Data().uri);
    };
    self.GetDetails = function () {
        return self.parent.prototype.GetDetails.call(self, 'display_details');
    };
    self.SetDetails = function (value, replace) {
        self.parent.prototype.SetDetails.call(self, 'display_details', value, replace);
    };
    self.Clone = function () {
        var handler = new DisplayHandler(self.GetData(), self.AngleHandler);
        handler.SetPostResultData(self.ResultHandler.GetData());
        return handler;
    };
    self.CloneData = function () {
        var data = self.GetData();
        if (!self.IsAdhoc())
            data.id = 'd' + jQuery.GUID().replace(/-/g, '');
        data.is_public = false;
        data.user_specific = {
            is_user_default: false,
            execute_on_login: false
        };
        return data;
    };
    self.HasChanged = function () {
        return !jQuery.isEmptyObject(self.GetChangeData(self.GetData(), self.GetRawData()));
    };
    self.SetDisplayResultHandler = function (displayType) {
        if (displayType === enumHandlers.DISPLAYTYPE.PIVOT) {
            self.DisplayResultHandler = new DisplayPivotResultHandler(self);
        }
        else if (displayType === enumHandlers.DISPLAYTYPE.CHART) {
            self.DisplayResultHandler = new DisplayChartResultHandler(self);
        }
        else if (displayType === enumHandlers.DISPLAYTYPE.LIST) {
            self.DisplayResultHandler = new DisplayListResultHandler(self);
        }
    };
    self.GetValidationResult = function () {
        return validationHandler.GetDisplayValidation(self.GetData(), self.GetModelUri());
    };
    self.GetModelUri = function () {
        return self.AngleHandler.Data().model;
    };

    // personal things
    self.CanUpdateUserSpecific = function () {
        return self.Data().authorizations.update_user_specific;
    };
    self.CanUpdateAngleDefault = function () {
        return self.AngleHandler.CanUpdate()
            && !self.Data().is_angle_default()
            && (!self.AngleHandler.Data().is_published() || self.Data().is_public())
            && (self.AngleHandler.IsAdhoc() || !self.IsAdhoc());
    };
    self.SetAngleDefault = function () {
        var value = self.Data().is_angle_default();
        if (value) {
            jQuery.each(self.AngleHandler.Displays, function (index, display) {
                if (display.Data().uri !== self.Data().uri)
                    display.Data().is_angle_default(!value);
            });
            self.AngleHandler.Data().angle_default_display = self.Data().id();
        }
    };
    self.SetUserDefault = function () {
        var value = self.Data().user_specific.is_user_default();
        if (value) {
            jQuery.each(self.AngleHandler.Displays, function (index, display) {
                if (display.Data().uri !== self.Data().uri)
                    display.Data().user_specific.is_user_default(!value);
            });
        }
    };
    self.IsAngleDefaultChanged = jQuery.noop;
    self.IsUserDefaultChanged = jQuery.noop;
    self.ExecuteOnLoginChanged = jQuery.noop;
     
    // display statistic 
    self.ShowStatisticPopup = function () {
        self.DisplayStatisticHandler.ShowPopup();
    };
     
    // name & description
    self.SaveDescription = function () {
        var callback = jQuery.proxy(self.parent.prototype.SaveDescription, self);
        self.ConfirmSave(self.IsDescriptionUsedInTask, callback);
    };
    self.IsDescriptionUsedInTask = function () {
        var data = self.GetChangeData(self.ItemDescriptionHandler.GetData(), self.Data());
        var hasDescriptionChanged = self.CanCreateOrUpdate() && data;
        return hasDescriptionChanged && self.IsUsedInTask();
    }
    self.ShowEditDescriptionPopup = function () {
        self.ItemDescriptionHandler.CanEditId(self.AngleHandler.CanEditId());
        self.parent.prototype.ShowEditDescriptionPopup.call(self, Localization.DisplayDescription);
    };

    // default drilldown
    self.InitialDefaultDrilldown = function (target) {
        self.DisplayDrilldownHandler.OnChanged = self.OnChangeDefaultDrilldown;
        self.DisplayDrilldownHandler.Initial(target);
    };
    self.OnChangeDefaultDrilldown = jQuery.noop;

    // filter & jump
    _self.queryDefinitionProperty = 'query_blocks';
    self.InitialQueryDefinition = function (definition) {
        // angle query
        self.UpdateAngleQueryDefinition();

        // display query
        self.QueryDefinitionHandler.BlockUI = true;
        self.QueryDefinitionHandler.GetSourceData = self.GetQueryDefinitionSourceData;
        self.QueryDefinitionHandler.FilterFor = WC.WidgetFilterHelper.FILTERFOR.DISPLAY;
        self.QueryDefinitionHandler.Texts().ConfirmMoveFilter = Localization.Info_ConfirmDropFilterToAngleDefinition;
        self.QueryDefinitionHandler.Texts().AskForExecutionParamter = Localization.AskForValueWhenTheDisplayOpens;
        self.QueryDefinitionHandler.Texts().ConfirmJump = Localization.Confirm_CreateNewFollowUp;
        self.SetAggregationFunctions();
        self.parent.prototype.InitialQueryDefinition.call(self, definition, _self.queryDefinitionProperty, self.GetModelUri());

        // set authorizations
        self.SetQueryDefinitionAuthorizations();
    };
    self.GetQueryDefinitionSourceData = function () {
        var rawDisplay = self.GetRawData();
        if (rawDisplay)
            return ko.toJS(rawDisplay[_self.queryDefinitionProperty]);
        else
            return ko.toJS(self.Data()[_self.queryDefinitionProperty]);
    };
    self.SetQueryDefinitionAuthorizations = function () {
        var validation = validationHandler.GetQueryBlocksValidation(self.QueryDefinitionHandler.Parent().GetQueryDefinition().query_definition);
        self.QueryDefinitionHandler.Authorizations.CanChangeFilter(self.CanChangeFilter(validation));
        self.QueryDefinitionHandler.Authorizations.CanChangeJump(self.CanChangeJump(validation));
        self.QueryDefinitionHandler.Authorizations.CanChangeAggregation(self.CanChangeAggregation(validation));
        self.QueryDefinitionHandler.Authorizations.CanExecute(self.CanExecuteQuerySteps(validation));
    };
    self.CanUseFilter = function () {
        var allowFilter = self.AngleHandler.AllowMoreDetails(self.GetModelUri());
        return allowFilter || !allowFilter && !self.QueryDefinitionHandler.GetFilters().length;
    };
    self.CanUseJump = function () {
        var allowJump = self.AngleHandler.AllowFollowups(self.GetModelUri());
        return allowJump || !allowJump && !self.QueryDefinitionHandler.GetJumps().length;
    };
    self.CanChangeFilter = function (validation) {
        return WC.Utility.MatchAll(true, [
            !validation.InvalidBaseClasses,
            !validation.InvalidFollowups,
            self.AngleHandler.AllowMoreDetails(self.GetModelUri()),
            self.CanUseJump()
        ]);
    };
    self.CanChangeJump = function (validation) {
        return WC.Utility.MatchAll(true, [
            !validation.InvalidBaseClasses,
            !validation.InvalidFollowups,
            self.AngleHandler.AllowMoreDetails(self.GetModelUri()),
            self.AngleHandler.AllowFollowups(self.GetModelUri())
        ]);
    };
    self.CanExecuteQuerySteps = function (validation) {
        return !validation.InvalidBaseClasses && !validation.InvalidFollowups && !validation.InvalidFilters;
    };
    self.CanUpdateQuerySteps = function (validation) {
        var isQueryValid = !validation.InvalidBaseClasses && !validation.InvalidFollowups;
        return isQueryValid && self.CanUpdate();
    };
    self.UpdateAngleQueryDefinition = function () {
        if (!self.QueryDefinitionHandler.Parent()) {
            self.QueryDefinitionHandler.Parent(new QueryDefinitionHandler());
        }
        self.QueryDefinitionHandler.Parent().ReadOnly(true);
        self.QueryDefinitionHandler.Parent().GetSourceData = jQuery.proxy(self.AngleHandler.GetQueryDefinitionSourceData, self.AngleHandler);
        self.QueryDefinitionHandler.Parent().Save = jQuery.proxy(self.SaveAngleQueryDefinition, self);
        self.QueryDefinitionHandler.Parent().ForcedSetData = true;
        self.QueryDefinitionHandler.Parent().SetData(self.AngleHandler.Data().query_definition, 'query_definition', self.GetModelUri());
        self.QueryDefinitionHandler.Parent().SetExecutedParameters(self.AngleHandler.QueryDefinitionHandler.GetExecutedParameters());
        self.QueryDefinitionHandler.Parent().Authorizations.CanSave(self.CanMoveFilter());
    };
    self.CanMoveFilter = function () {
        return self.AngleHandler.QueryDefinitionHandler.Authorizations.CanChangeFilter();
    };
    self.SaveAngleQueryDefinition = function () {
        var filters = self.QueryDefinitionHandler.Parent().GetFilters();
        var movedFilter = filters[filters.length - 1];
        var restoreHandlers = function () {
            self.CancelQueryDefinitionWithJump = self.__CancelQueryDefinitionWithJump;
            self.ExecuteQueryDefinition = self.__ExecuteQueryDefinition;
            delete self.__CancelQueryDefinitionWithJump;
            delete self.__ExecuteQueryDefinition;
        };
        self.__CancelQueryDefinitionWithJump = self.CancelQueryDefinitionWithJump;
        self.__ExecuteQueryDefinition = self.ExecuteQueryDefinition;
        self.CancelQueryDefinitionWithJump = function () {
            // restore back
            restoreHandlers();

            // reset
            self.QueryDefinitionHandler.Parent().Cancel();
            self.QueryDefinitionHandler.InsertQueryFilter(movedFilter, 0);
        };
        self.ExecuteQueryDefinition = function () {
            // restore back
            restoreHandlers();

            // add a moving filter to angle
            self.QueryDefinitionHandler.Parent().AddQueryFilter(movedFilter);
            self.AngleHandler.QueryDefinitionHandler.AddQueryFilter(movedFilter);

            // save
            self.AngleHandler.SaveQueryDefinition(true);
        };

        self.AngleHandler.ConfirmSave(
            null,
            jQuery.proxy(self.SaveQueryDefinition, self),
            jQuery.proxy(self.CancelQueryDefinitionWithJump, self));
    };
    self.SaveQueryDefinitionWithJump = function (save, definition) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CheckingJump, false);
        progressbarModel.SetDisableProgressBar();
        var jump = self.QueryDefinitionHandler.GetLastJump();
        var extendData = {
            multi_lang_name: self.Data().multi_lang_name,
            multi_lang_description: self.Data().multi_lang_description
        };
        self.GetJumpDisplayData(jump, definition.query_blocks, extendData)
            .done(save);
    };
    self.GetJumpDisplayData = function (jump, queryBlocks, extendData) {
        return jQuery.when(jump ? followupPageHandler.GetDefaultJumpTemplate(jump.followup) : null)
            .then(function (template) {
                var display = jQuery.extend({
                    multi_lang_name: [{
                        lang: userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase(),
                        text: displayModel.GetAdhocDisplayName(Localization.NewAdhocFollowup)
                    }],
                    multi_lang_description: []
                }, extendData);
                if (template) {
                    // use template
                    display.display_type = template.display_type;
                    display.display_details = template.display_details;
                    display.query_blocks = followupPageHandler.GetQueryBlockFromJumpTemplate(queryBlocks, template.query_blocks);
                    display.fields = template.fields;
                    return jQuery.when(display);
                }
                else {
                    // no template, create list with default fields
                    var resultData = self.CreateAdhocResultData(jump);
                    return displayModel.GetDefaultListFields(resultData)
                        .then(function (fields) {
                            display.display_type = enumHandlers.DISPLAYTYPE.LIST;
                            display.display_details = '{}';
                            display.query_blocks = followupPageHandler.GetQueryBlockFromJumpTemplate(queryBlocks, []);
                            display.fields = fields;
                            return jQuery.when(display);
                        });
                }
            });
    };

    // aggregation
    self.SetAggregationFunctions = function () {
        self.QueryDefinitionHandler.InitialAggregationUI = self.InitialAggregationUI;
        self.QueryDefinitionHandler.GetAggregationOptions = self.GetAggregationOptions;
        self.QueryDefinitionHandler.SetAggregationOptions = self.SetAggregationOptions;
        self.QueryDefinitionHandler.EnsureAggregationOptions = self.EnsureAggregationOptions;
        self.QueryDefinitionHandler.ShowAggregationOptions = self.ShowAggregationOptions;
        self.QueryDefinitionHandler.CanSortAggregationField = self.CanSortAggregationField;
        self.QueryDefinitionHandler.GetAggregationSortingClassName = self.GetAggregationSortingClassName;
        self.QueryDefinitionHandler.SortAggregationField = self.SortAggregationField;
        self.QueryDefinitionHandler.GetAggregationFieldLimit = self.GetAggregationFieldLimit;
        self.QueryDefinitionHandler.CanChangeCountFieldState = self.CanChangeCountFieldState;
        self.QueryDefinitionHandler.GetAggregationField = self.GetAggregationField;
        self.QueryDefinitionHandler.SetAggregationFields = self.SetAggregationFields;
        self.QueryDefinitionHandler.ValidateAggregation = self.ValidateAggregation;
        self.QueryDefinitionHandler.OnAggregationChangeCallback = self.OnAggregationChangeCallback;
        self.QueryDefinitionHandler.SetAggregationFormatTexts = self.SetAggregationFormatTexts;
        self.QueryDefinitionHandler.CanAddReferenceLine = self.CanAddReferenceLine;
        self.QueryDefinitionHandler.ShowAddReferenceLinePopup = self.ShowAddReferenceLinePopup;
    };
    self.InitialAggregationUI = function (container) {
        self.DisplayResultHandler.InitialAggregationUI(container);
    };
    self.CanChangeAggregation = function (validation) {
        return WC.Utility.MatchAll(true, [
            !validation.InvalidBaseClasses,
            !validation.InvalidFollowups,
            !self.QueryDefinitionHandler.HasErrorJump(),
            self.CanUseFilter(),
            self.CanUseJump()
        ]);
    };
    self.CanSortAggregationField = function (aggregation) {
        return self.DisplayResultHandler.CanSortField(aggregation);
    };
    self.GetAggregationSortingClassName = function (aggregation) {
        return self.DisplayResultHandler.GetAggregationSortingClassName(aggregation);
    };
    self.SortAggregationField = function (aggregation) {
        self.DisplayResultHandler.SortField(aggregation);
    };
    self.GetAggregationOptions = function () {
        return self.GetDetails();
    };
    self.SetAggregationOptions = function (value) {
        self.SetDetails(value, true);
    };
    self.EnsureAggregationOptions = function () {
        self.DisplayResultHandler.EnsureAggregationOptions();
    };
    self.ShowAggregationOptions = function () {
        self.DisplayResultHandler.ShowAggregationOptions();
    };
    self.GetAggregationField = function (aggregation) {
        aggregation = ko.toJS(aggregation);
        return WC.Utility.IfNothing(self.Data().fields.findObject('field', aggregation.field), {});
    };
    self.GetAggregationFieldLimit = function (area) {
        return self.DisplayResultHandler.GetAggregationFieldLimit(area);
    };
    self.CanChangeCountFieldState = function () {
        return self.DisplayResultHandler.CanChangeCountFieldState();
    };
    self.CanAddReferenceLine = function (aggregation) {
        return self.DisplayResultHandler.CanAddReferenceLine(aggregation);
    };
    self.ShowAddReferenceLinePopup = function (aggregation) {
        return self.DisplayResultHandler.ShowAddReferenceLinePopup(aggregation);
    };
    self.SetAggregationFields = function (fields) {
        self.Data().fields = fields;
    };
    self.ValidateAggregation = function () {
        return self.DisplayResultHandler.ValidateAggregation();
    };
    self.OnAggregationChangeCallback = function (items, newArea, oldIndex, newIndex) {
        return self.DisplayResultHandler.OnAggregationChangeCallback(items, newArea, oldIndex, newIndex);
    };
    self.SetAggregationFormatTexts = function (texts) {
        return self.DisplayResultHandler.SetAggregationFormatTexts(texts);
    };

    // posting a result
    self.ExecutionStepsData = null;
    self.SetPostResultData = function (data) {
        self.ResultHandler.SetData(data);
    };
    self.ClearPostResultData = function () {
        self.ResultHandler.ClearData();
    };
    self.PostResult = function () {
        // use execution steps
        if (self.ExecutionStepsData) {
            var data = self.ExecutionStepsData.data;
            self.ResultHandler.Data.execute_steps = self.ExecutionStepsData.uri;
            self.ExecutionStepsData = null;
            return self.ResultHandler.PostExecutionSteps(data);
        }

        // new result
        return self.ResultHandler.HasChanged()
            ? self.ResultHandler.PostNewResult()
            : jQuery.when(self.ResultHandler.Data);
    };
    self.SetPostExecutionSteps = function (querySteps) {
        self.ExecutionStepsData = {
            uri: self.ResultHandler.Data.execute_steps,
            data: {
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: ko.toJS(querySteps)
            }
        };
    };
    self.GetResultQueryDefinition = function () {
        // create posting result query block
        var resultQueryDefinition = {
            query_definition: []
        };

        // check with Angle before processing
        var angleQueryDefinition = self.AngleHandler.GetResultQueryDefinition();
        var displayUri = self.Data().uri_template || (!self.IsAdhoc() ? self.Data().uri : '');
        if (displayUri
            && !self.QueryDefinitionHandler.HasExecutionParametersChanged()
            && angleQueryDefinition.query_definition[0].queryblock_type !== enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES) {
            resultQueryDefinition.query_definition.push({
                base_display: displayUri,
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY
            });

            // add execution_parameters
            var executionParameters = self.QueryDefinitionHandler.GetExecutedParameters();
            if (executionParameters.length)
                resultQueryDefinition.query_definition[0].execution_parameters = executionParameters;
        }
        else {
            // don't add if no query_steps
            var blocks = self.QueryDefinitionHandler.GetQueryDefinition().query_blocks;
            if (blocks.length)
                resultQueryDefinition.query_definition = blocks;
        }

        return resultQueryDefinition;
    };
    self.CreateAdhocResultData = function (lastJump) {
        var modelUri = self.GetModelUri();
        var baseClasses = self.QueryDefinitionHandler.Parent().GetBaseClasses();
        var resultClasses = modelFollowupsHandler.GetResultClassesByQueryStep(lastJump, modelUri, baseClasses);
        return {
            model: modelUri,
            potential_classes: resultClasses,
            query_fields: modelsHandler.GetResultQueryFieldsUri(resultClasses, modelUri)
        };
    };
    self.GetResultExecution = function () {
        return self.ResultHandler.GetExecutionText();
    };

    // save utilities
    self.ConfirmSave = function (checker, callback, cancel) {
        if (!jQuery.isFunction(checker))
            checker = self.IsUsedInTask;

        if (checker()) {
            popup.Confirm(Localization.MessageSaveQuestionAngleUsedInTask, callback, cancel);
        } else {
            callback();
        }
    };
    self.GetChangeData = function (currentData, compareData) {
        return WC.ModelHelper.GetChangeDisplay(currentData, compareData);
    };
    self.CreateOrUpdate = function (forced, done, fail) {
        var data = self.GetCreateOrUpdateData();

        // no data to be saved
        if (!data)
            return jQuery.when(null);

        // saving
        return self.IsAdhoc()
            ? self.CreateNew(data, done, fail)
            : self.UpdateData(data, forced, done, fail);
    };
    self.GetCreateOrUpdateData = function () {
        // create data
        if (self.IsAdhoc())
            return self.GetData();

        // update data
        var data = self.GetChangeData(self.GetData(), self.GetRawData());
        if (data && data[_self.queryDefinitionProperty] && !self.CanUseJump()) {
            // check query definition
            // - viewer user cannot save if it contains jump
            delete data[_self.queryDefinitionProperty];
        }
        return data;
    };
    self.CreateNew = function (data, done, fail) {
        var query = {};
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        var url = self.AngleHandler.Data().displays + '?' + jQuery.param(query);
        var adhocUrl = self.Data().uri;
        data = WC.ModelHelper.RemoveReadOnlyDisplayData(data);
        delete data.name;
        delete data.description;
        return CreateDataToWebService(url, data)
            .then(function (display) {
                displayModel.DeleteTemporaryDisplay(adhocUrl);
                self.QueryDefinitionHandler.ForcedSetData = true;
                return self.UpdateModel(display, true);
            })
            .done(done)
            .fail(fail);
    };
    self.UpdateDataFunction = function (uri, data, forced) {
        var query = {};
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.FORCED] = WC.Utility.ToBoolean(forced);
        data = WC.ModelHelper.RemoveReadOnlyDisplayData(data);
        return UpdateDataToWebService(uri + '?' + jQuery.param(query), data)
            .then(function (display) {
                // update query definition if saving query_blocks
                if (data.query_blocks)
                    self.QueryDefinitionHandler.ForcedSetData = true;

                self.UpdateModel(display, true);
                return jQuery.when(display);
            });
    };
    self.UpdateStateFunction = function (uri, state, forced) {
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = WC.Utility.ToBoolean(forced);
        return UpdateDataToWebService(uri + '?' + jQuery.param(query), state)
            .then(function (display) {
                // update to old view model
                displayModel.Data().is_public = display.is_published;
                displayModel.Data.commit();

                self.SetRawData({ is_public: display.is_published });
                self.Data().is_public(display.is_published);
                return jQuery.when(display);
            });
    };
    self.UpdateAdhocFunction = function (_uri, data) {
        var newData = jQuery.extend({}, WC.ModelHelper.ExtendDisplayData(self.GetData(), self.AngleHandler.GetData()), data);
        return self.UpdateModel(newData, false);
    };
    self.UpdateModel = function (data, updateRaw) {
        // update to old view model
        displayModel.LoadSuccess(data);

        if (WC.ModelHelper.IsAdhocUri(data.uri)) {
            // update adhoc to local storage
            displayModel.SetTemporaryDisplay(data.uri, data);
        }
        else if (updateRaw) {
            // don't set this if it calls from adhoc function
            // update raw data if not adhoc
            self.SetRawData(data);
        }
        self.Initial(data, self.AngleHandler);
        return jQuery.when(data);
    };
    self.CanCreate = function () {
        return privilegesViewModel.CanCreateDisplay(self.GetModelUri());
    };
    self.CanUpdate = function () {
        return self.Data().authorizations.update;
    };
    self.CanCreateOrUpdate = function () {
        return self.IsAdhoc() ? self.CanCreate() : self.CanUpdate();
    };
    self.IsUsedInTask = function () {
        return self.Data().used_in_task;
    };

    // constructor
    self.Initial(model, parent);
}
DisplayHandler.extend(BaseItemHandler);