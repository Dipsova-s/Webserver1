function AngleHandler(model) {
    "use strict";

    var _self = {};
    _self.data = null;
    _self.canEditId = false;

    var self = this;
    self.Data = ko.observable(null);
    self.ItemDescriptionHandler = new ItemDescriptionHandler();
    self.QueryDefinitionHandler = new QueryDefinitionHandler();
    self.AngleUserSpecificHandler = new AngleUserSpecificHandler(self);
    self.AngleBusinessProcessHandler = new AngleBusinessProcessHandler(self);
    self.AngleTagHandler = new AngleTagHandler(self);
    self.AngleStatisticHandler = new AngleStatisticHandler(self);
    self.Initial = function (model, updateRaw) {
        if (updateRaw)
            self.SetRawData(model);
        self.SetData(model);

        // query steps
        self.InitialQueryDefinition(self.Data().query_definition);

        // displays
        self.InitialDisplays(self.Data().display_definitions);
    };
    self.SetData = function (model) {
        var data = jQuery.extend({}, WC.ModelHelper.ExtendAngleData(model));
        data.id = ko.observable(data.id);
        data.is_published = ko.observable(data.is_published);
        data.is_template = ko.observable(data.is_template);
        data.is_validated = ko.observable(data.is_validated);
        data.user_specific.is_starred = ko.observable(data.user_specific.is_starred);
        data.user_specific.private_note = ko.observable(data.user_specific.private_note);
        data.allow_followups = ko.observable(data.allow_followups);
        data.allow_more_details = ko.observable(data.allow_more_details);
        data.assigned_labels = ko.observableArray(data.assigned_labels);
        data.assigned_tags = ko.observableArray(data.assigned_tags);
        self.Data(data);
    };
    self.GetData = function () {
        var rawData = jQuery.extend(ko.toJS(self.Data()), self.QueryDefinitionHandler.GetQueryDefinition());
        var data = WC.ModelHelper.ExtendAngleData(rawData);
        data.display_definitions = jQuery.map(self.Displays, function (display) {
            return display.GetData();
        });
        return data;
    };
    self.ClearData = function () {
        self.ForceInitial({});
    };
    self.SetRawData = function (data) {
        var rawData = jQuery.extend({}, self.GetRawData(), data);
        _self.data = WC.ModelHelper.ExtendAngleData(rawData);
    };
    self.GetRawData = function () {
        return ko.toJS(_self.data);
    };
    self.CloneData = function () {
        var data = self.GetData();
        if (!self.IsAdhoc())
            data.id = 'a' + jQuery.GUID().replace(/-/g, '');
        data.allow_followups = true;
        data.allow_more_details = true;
        data.is_validated = false;
        data.is_published = false;
        data.is_template = false;
        data.user_specific = { is_starred: false };

        // displays
        var defaultDisplayId = null;
        var displayMappers = {};
        data.display_definitions = jQuery.map(self.Displays, function (display) {
            var clonedDisplay = display.CloneData();
            displayMappers[display.Data().id()] = clonedDisplay.id;
            if (display.Data().is_angle_default())
                defaultDisplayId = clonedDisplay.id;
            return clonedDisplay;
        });
        // drilldown_display
        jQuery.each(data.display_definitions, function (index, display) {
            var details = WC.Utility.ParseJSON(display.display_details);
            if (details.drilldown_display && displayMappers[details.drilldown_display]) {
                details.drilldown_display = displayMappers[details.drilldown_display];
            }
            else {
                delete details.drilldown_display;
            }
            display.display_details = ko.toJSON(details);
        });
        data.angle_default_display = defaultDisplayId;

        return data;
    };
    self.Load = function (uri) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri), query)
            .done(self.LoadDone);
    };
    self.LoadDone = function (data) {
        // always update Angle's query definition but Displays
        self.QueryDefinitionHandler.ForcedSetData = true;
        self.Initial(data, true);
    };
    self.ForceInitial = function (data) {
        self.QueryDefinitionHandler.ForcedSetData = true;
        self.ForcedSetDisplays = true;
        self.Initial(data, true);
    };
    self.UpdateExecutionTimes = function (result) {
        var data = self.Data();
        data.user_specific.times_executed++;
        data.executed = {
            datetime: result.executed.datetime,
            full_name: userModel.Data().full_name,
            user: userModel.Data().uri
        };
        self.Data(data);

        // update to old model, this will be removed later
        angleInfoModel.SetAngleSatistics(null, null, data.executed, null, null);
        angleInfoModel.Data().user_specific.times_executed = data.user_specific.times_executed;
        angleInfoModel.Data.commit();
        angleInfoModel.TimeExcuted(data.user_specific.times_executed);
    };
    self.GetValidationResult = function () {
        return validationHandler.GetAngleValidation(self.GetData());
    };

    // statistic 
    self.ShowStatisticPopup = function () {
        self.AngleStatisticHandler.ShowPopup();
    };
    self.IsStatisticVisible = function () {
        return !self.IsAdhoc() ||
            self.GetCurrentDisplay() && self.GetCurrentDisplay().ResultHandler.ExecutionInfo();
    };

    // business processes
    self.InitialBusinessProcess = function (target) {
        self.AngleBusinessProcessHandler.Initial(target);
    };

    // tags
    self.InitialTag = function (target) {
        self.AngleTagHandler.Initial(target);
    };
    
    // personal things
    self.CanUpdateUserSpecific = function () {
        return self.AngleUserSpecificHandler.CanUpdate();
    };
    self.SetStarred = function (_model, event) {
        return self.AngleUserSpecificHandler.SaveStarred(event.currentTarget);
    };
    self.IsStarred = function () {
        return self.AngleUserSpecificHandler.IsStarred();
    };
    self.HasPrivateNote = function () {
        return self.AngleUserSpecificHandler.HasPrivateNote();
    };
    self.GetPrivateNote = function () {
        return self.AngleUserSpecificHandler.GetPrivateNote();
    };
    self.InitialAngleUserSpecific = function () {
        self.AngleUserSpecificHandler.InitialPrivateNote(jQuery('#TabContentAngle .section-personal-note'));
    };

    // name & description
    self.CanEditId = function () {
        return _self.canEditId;
    };
    self.SetEditId = function (canEditId) {
        _self.canEditId = canEditId;
    };
    self.SaveDescription = function () {
        var callback = jQuery.proxy(self.parent.prototype.SaveDescription, self);
        self.ConfirmSave(self.IsDescriptionUsedInTask, callback);
    };
    self.IsDescriptionUsedInTask = function () {
        var data = self.GetChangeData(self.ItemDescriptionHandler.GetData(), self.Data());
        var hasDescriptionChanged = self.CanCreateOrUpdate() && data;
        return hasDescriptionChanged && (self.IsDisplaysUsedInTask() || self.IsChangeDisplaysUsedInTask());
    }
    self.ShowEditDescriptionPopup = function () {
        self.ItemDescriptionHandler.CanEditId(_self.canEditId);
        self.parent.prototype.ShowEditDescriptionPopup.call(self, Localization.AngleDescription);
    };

    // filter & jump
    _self.queryDefinitionProperty = 'query_definition';
    self.InitialQueryDefinition = function (definition) {
        self.QueryDefinitionHandler.BlockUI = true;
        self.QueryDefinitionHandler.GetSourceData = self.GetQueryDefinitionSourceData;
        self.QueryDefinitionHandler.FilterFor = WC.WidgetFilterHelper.FILTERFOR.ANGLE;
        self.QueryDefinitionHandler.Texts().AskForExecutionParamter = Localization.AskForValueWhenTheAngleOpens;
        self.QueryDefinitionHandler.Texts().ConfirmJump = Localization.Confirm_SaveAngleWithWarning;
        self.QueryDefinitionHandler.Texts().ApplyButton = Localization.Save;
        self.parent.prototype.InitialQueryDefinition.call(self, definition, _self.queryDefinitionProperty, self.Data().model);

        // set authorizations
        self.SetQueryDefinitionAuthorizations();
    };
    self.GetQueryDefinitionSourceData = function () {
        return ko.toJS(self.Data()[_self.queryDefinitionProperty]);
    };
    self.SetQueryDefinitionAuthorizations = function () {
        var validation = validationHandler.GetQueryBlocksValidation(self.Data().query_definition);
        self.QueryDefinitionHandler.Authorizations.CanChangeFilter(self.CanChangeFilter(validation));
        self.QueryDefinitionHandler.Authorizations.CanChangeJump(self.CanChangeJump(validation));
        self.QueryDefinitionHandler.Authorizations.CanExecute(self.CanExecuteQuerySteps(validation));
        self.QueryDefinitionHandler.Authorizations.CanSave(self.CanUpdateQuerySteps(validation));
    };
    self.AllowMoreDetails = function () {
        return self.Data().allow_more_details() && privilegesViewModel.AllowMoreDetails(self.Data().model);
    };
    self.AllowFollowups = function () {
        return self.Data().allow_followups() && privilegesViewModel.AllowFollowups(self.Data().model);
    };
    self.CanUseBaseClass = function () {
        return !self.IsAdhoc() || privilegesViewModel.CanCreateAngle(self.Data().model);
    };
    self.CanUseFilter = function () {
        var allowFilter = self.AllowMoreDetails(self.Data().model);
        return allowFilter || !allowFilter && !self.QueryDefinitionHandler.GetFilters().length;
    };
    self.CanUseJump = function () {
        var allowJump = self.AllowFollowups(self.Data().model);
        return allowJump || !allowJump && !self.QueryDefinitionHandler.GetJumps().length;
    };
    self.CanChangeFilter = function (validation) {
        return WC.Utility.MatchAll(true, [
            !validation.InvalidBaseClasses,
            self.CanUseBaseClass(),
            self.CanUseJump(),
            self.AllowMoreDetails(self.Data().model),
            self.Data().authorizations.update,
            !self.Data().is_validated()
        ]);
    };
    self.CanChangeJump = function (validation) {
        return WC.Utility.MatchAll(true, [
            !validation.InvalidBaseClasses,
            self.CanUseBaseClass(),
            self.AllowFollowups(self.Data().model),
            self.AllowMoreDetails(self.Data().model),
            self.Data().authorizations.update,
            !self.Data().is_validated()
        ]);
    };
    self.CanExecuteQuerySteps = function (validation) {
        return !validation.InvalidBaseClasses;
    };
    self.CanUpdateQuerySteps = function (validation) {
        return WC.Utility.MatchAll(true, [
            !validation.InvalidBaseClasses,
            self.Data().authorizations.update,
            !self.Data().is_validated()
        ]);
    };

    // results
    self.GetResultQueryDefinition = function () {
        // create posting result query block
        var resultQueryDefinition = {
            query_definition: []
        };
        var angleUri = self.Data().uri_template || (!self.IsAdhoc() ? self.Data().uri : '');

        if (angleUri && !self.QueryDefinitionHandler.HasExecutionParametersChanged()) {
            // use base_angle
            resultQueryDefinition.query_definition.push({
                base_angle: angleUri,
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE
            });

            // add execution_parameters
            var executionParameters = self.QueryDefinitionHandler.GetExecutedParameters();
            if (executionParameters.length)
                resultQueryDefinition.query_definition[0].execution_parameters = executionParameters;
        }
        else {
            // use base_classes block
            resultQueryDefinition.model = self.Data().model;
            resultQueryDefinition.query_definition = self.QueryDefinitionHandler.GetQueryDefinition().query_definition;
        }
        return resultQueryDefinition;
    };

    // displays
    _self.currentDisplay = null;
    self.ForcedSetDisplays = false;
    self.Displays = [];
    self.InitialDisplays = function (displays) {
        if (self.Displays.length && !self.ForcedSetDisplays)
            return;

        self.ForcedSetDisplays = false;
        self.Displays = [];
        jQuery.each(displays, function (index, display) {
            self.Displays.push(new DisplayHandler(display, self));
        });
    };
    self.GetDisplay = function (uri) {
        return self.Displays.findObject('Data', function (data) { return data().uri === uri; });
    };
    self.GetDefaultDisplay = function () {
        var defaultId = self.Data().angle_default_display;
        var display = self.Displays.findObject('Data', function (data) { return data().id() === defaultId; });
        return display || self.Displays[0];
    };
    self.GetRawDisplay = function (uri) {
        return self.Data().display_definitions.findObject('uri', uri);
    };
    self.SetRawDisplay = function (data) {
        var index = self.Data().display_definitions.indexOfObject('uri', data.uri);
        if (index !== -1)
            self.Data().display_definitions[index] = data;
        else
            self.Data().display_definitions.push(data);
    };
    self.GetAdhocDisplays = function () {
        return jQuery.grep(self.Displays, function (display) { return !display.GetRawData(); });
    };
    self.SetCurrentDisplay = function (display) {
        _self.currentDisplay = display;
    };
    self.GetCurrentDisplay = function () {
        return _self.currentDisplay;
    };
    self.AddDisplay = function (data, result, isAdhoc) {
        // check the same Angle uri
        var displayUri = WC.Utility.ToString(data.uri);
        if (displayUri.indexOf(self.Data().uri) === -1)
            return;

        // create Display object
        var displayHandler = new DisplayHandler(data, self);
        displayHandler.SetPostResultData(result);

        if (isAdhoc) {
            // allow only 1 adhoc Display
            for (var i = self.Displays.length - 1; i >= 0; i--) {
                if (!self.Displays[i].GetRawData())
                    self.Displays.splice(i, 1);
            }
        }
        else {
            // update raw Angle data
            self.SetRawDisplay(displayHandler.GetData());
        }
        if (!self.GetDisplay(displayHandler.Data().uri))
            self.Displays.push(displayHandler);
    };
    self.RemoveDisplay = function (uri) {
        // remove from source
        var indexRaw = self.Data().display_definitions.indexOfObject('uri', uri);
        if (indexRaw !== -1)
            self.Data().display_definitions.splice(indexRaw, 1);

        // remove from handler
        var indexDisplay = self.Displays.indexOfObject('Data', function (data) { return data().uri === uri; });
        if (indexDisplay !== -1)
            self.Displays.splice(indexDisplay, 1);
    };
    self.SaveDisplays = function (forced) {
        var deferred = [];
        jQuery.each(self.Displays, function (index, display) {
            if (display.CanCreateOrUpdate())
                deferred.pushDeferred(self.SaveDisplay, [display, forced]);
        });
        return jQuery.whenAllSet(deferred);
    };
    self.SaveDisplay = function (display, forced) {
        return display.CreateOrUpdate(
            forced,
            jQuery.proxy(self.SaveDisplayDone, display, display),
            jQuery.proxy(self.SaveDisplayFail, display, display));
    };
    self.SaveDisplayDone = function (display) {
        toast.MakeSuccessTextFormatting(display.GetName(), Localization.Toast_SaveItem);
    };
    self.SaveDisplayFail = function (display, xhr) {
        // this will be shown as a toast notification
    };
    self.IsChangeDisplaysUsedInTask = function () {
        var isChangeDisplaysUsedInTask = false;
        jQuery.each(self.Displays, function (index, display) {
            if (self.CanCreateOrUpdate() && display.GetCreateOrUpdateData() && display.IsUsedInTask()) {
                isChangeDisplaysUsedInTask = true;
                return false;
            }
        });
        return isChangeDisplaysUsedInTask;
    };
    self.IsDisplaysUsedInTask = function () {
        var isDisplaysUsedInTask = false;
        jQuery.each(self.Displays, function (index, display) {
            if (display.IsUsedInTask()) {
                isDisplaysUsedInTask = true;
                return false;
            }
        });
        return isDisplaysUsedInTask;
    };
    self.IsChangeUsedInTask = function () {
        return self.CanCreateOrUpdate() && self.GetCreateOrUpdateData() && self.IsDisplaysUsedInTask();
    };

    // save utilities
    self.ConfirmSave = function (checker, callback, cancel) {
        if (!jQuery.isFunction(checker))
            checker = self.IsConflict;

        if (checker()) {
            popup.Confirm(Localization.MessageSaveQuestionAngleUsedInTask, callback, cancel);
        } else {
            callback();
        }
    };
    self.IsConflict = function () {
        return self.IsChangeUsedInTask() || self.IsChangeDisplaysUsedInTask();
    };
    self.SaveAll = function (forced) {
        var isAdhoc = self.IsAdhoc();
        return self.CreateOrUpdate(forced, self.SaveAllDone, self.SaveAllFail)
            .then(function () {
                return !isAdhoc ? self.SaveDisplays(forced) : jQuery.when(null);
            });
    };
    self.SaveAllDone = function () {
        toast.MakeSuccessTextFormatting(self.GetName(), Localization.Toast_SaveItem);
    };
    self.SaveAllFail = function (xhr) {
        // this will be shown as a toast notification
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
        var data = self.GetData();
        return self.IsAdhoc() ? data : self.GetChangeData(data, self.GetRawData());
    };
    self.GetChangeData = function (currentData, compareData) {
        return WC.ModelHelper.GetChangeAngle(currentData, compareData);
    };
    self.CreateNew = function (data, done, fail) {
        var query = {};
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        var url = data.model + '/angles?' + jQuery.param(query);
        data = WC.ModelHelper.RemoveReadOnlyAngleData(data);
        delete data.name;
        delete data.description;
        return CreateDataToWebService(url, data)
            .then(function (angle) {
                // update to old view model
                angleInfoModel.DeleteTemporaryAngle();
                angleInfoModel.SetData(data);

                self.ForceInitial(angle);
                return jQuery.when(angle);
            })
            .done(done)
            .fail(fail);
    };
    self.UpdateDataFunction = function (uri, data, forced) {
        var query = {};
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.FORCED] = WC.Utility.ToBoolean(forced);
        data = WC.ModelHelper.RemoveReadOnlyAngleData(data);
        return UpdateDataToWebService(uri + '?' + jQuery.param(query), data)
            .then(function (angle) {
                var updatedData = WC.ModelHelper.ExtendAngleData(self.GetData());
                var properties = jQuery.map(data, function (_value, name) { return name; });
                jQuery.merge(properties, ['authorizations', 'changed', 'display_definitions']);
                jQuery.each(properties, function (index, name) {
                    if (typeof angle[name] !== 'undefined')
                        updatedData[name] = angle[name];
                });
                self.UpdateModel(updatedData, false);
                self.UpdateDisplayAuthorizations(angle.display_definitions);
                self.SetRawData(angle);
                return jQuery.when(angle);
            });
    };
    self.UpdateStateFunction = function (uri, state, forced) {
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = WC.Utility.ToBoolean(forced);
        return UpdateDataToWebService(uri + '?' + jQuery.param(query), state)
            .then(function (angle) {
                // update to old view model
                angleInfoModel.Data().is_published = angle.is_published;
                angleInfoModel.Data().is_validated = angle.is_validated;
                angleInfoModel.Data().is_template = angle.is_template;
                angleInfoModel.Data.commit();
                angleInfoModel.IsPublished(angle.is_published);
                angleInfoModel.IsTemplate(angle.is_template);
                angleInfoModel.IsValidated(angle.is_validated);
                angleInfoModel.IsPublished.commit();
                angleInfoModel.IsTemplate.commit();
                angleInfoModel.IsValidated.commit();

                var updatedData = {
                    is_published: angle.is_published,
                    is_validated: angle.is_validated,
                    is_template: angle.is_template,
                    published: angle.last_set_published || self.Data().published,
                    validated: angle.last_set_validated || self.Data().validated
                };
                self.SetRawData(updatedData);
                self.Data().is_published(updatedData.is_published);
                self.Data().is_validated(updatedData.is_validated);
                self.Data().is_template(updatedData.is_template);
                self.Data().published = updatedData.published;
                self.Data().validated = updatedData.validated;
                return jQuery.when(angle);
            });
    };
    self.UpdateAdhocFunction = function (_uri, data) {
        var newData = jQuery.extend({}, WC.ModelHelper.ExtendAngleData(self.GetData()), data);
        return self.UpdateModel(newData, true);
    };
    self.UpdateModel = function (data, updateRaw) {
        // update to old view model
        angleInfoModel.SetData(data);

        self.Initial(data, updateRaw);
        return jQuery.when(data);
    };
    self.UpdateDisplayAuthorizations = function (displays) {
        jQuery.each(displays, function (_index, display) {
            var handler = self.GetDisplay(display.uri);
            if (handler) {
                handler.Data().authorizations = display.authorizations;
            }

            var rawDisplay = self.GetRawDisplay(display.uri);
            if (rawDisplay) {
                rawDisplay.authorizations = display.authorizations;
            }
        });
    };
    self.CanCreate = function () {
        return privilegesViewModel.CanCreateAngle(self.Data().model);
    };
    self.CanUpdate = function () {
        return self.Data().authorizations.update;
    };
    self.CanCreateOrUpdate = function () {
        return self.IsAdhoc() ? self.CanCreate() : self.CanUpdate();
    };
    self.CanCreateTemplateAngle = function () {
        return !self.IsAdhoc() && privilegesViewModel.CanCreateTemplateAngle(self.Data().model);
    };
    self.CanSetTemplate = function () {
        return self.Data().is_template() ? self.Data().authorizations.unmark_template : self.Data().authorizations.mark_template;
    };
    self.Validate = function () {
        return self.AngleBusinessProcessHandler.Validate();
    };

    // constructor
    self.Initial(model, true);
}
AngleHandler.extend(BaseItemHandler);