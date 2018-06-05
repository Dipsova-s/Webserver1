var angleInfoModel = new AngleInfoViewModel();

function AngleInfoViewModel(model) {
    "use strict";

    //BOF: View model properties
    var self = this;
    self.AngleName = 'angle';
    self.Data = ko.protectedObservable(null);
    self.Name = ko.protectedObservable('');
    self.IsStarred = ko.observable(false);
    self.IsPublished = ko.protectedObservable(false);
    self.IsTemplate = ko.protectedObservable(false);
    self.IsTempTemplate = ko.observable(false);
    self.IsValidated = ko.protectedObservable(false);
    self.IsTempValidated = ko.observable(false);
    self.ModelName = ko.observable({
        ShortName: ko.observable(''),
        LongName: ko.observable(''),
        FriendlyName: ko.observable('')
    });
    self.PrivateNote = ko.protectedObservable('');
    self.AngleId = ko.protectedObservable('');
    self.Description = ko.protectedObservable('');
    self.AllowMoreDetails = ko.protectedObservable(false);
    self.AllowFollowups = ko.protectedObservable(false);
    self.CreatedBy = ko.observable({});
    self.ChangedBy = ko.observable({});
    self.ExecutedBy = ko.observable({});
    self.ValidatedBy = ko.observable({});
    self.DeletedBy = ko.observable({});
    self.TimeExcuted = ko.observable({});
    self.IsNewAngle = ko.observable(false);
    self.TemporaryAngleName = 'temp_angle';
    self.TemporaryAngle = ko.observable(null);
    self.Languages = {
        Selected: ko.observable({}),
        List: ko.observableArray([])
    };
    self.ModelServerAvailable = true;
    //EOF: View model properties

    //BOF: View model methods
    self.Load = function (angleUri, options) {
        var setting = jQuery.extend({ IsHistory: false }, options);
        var isTemporary = self.IsTemporaryAngle(angleUri);

        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return jQuery.when(isTemporary ? self.GetTemporaryAngle() : (setting.IsHistory ? self.Data() : GetDataFromWebService(directoryHandler.ResolveDirectoryUri(angleUri), query)))
            .then(function (data) {
                self.SetData(data);

                // save display into history as the original & lastest version
                if (!setting.IsHistory) {
                    jQuery.each(self.Data().display_definitions, function (k, v) {
                        historyModel.Set(v.uri + historyModel.OriginalVersionSuffix, v);
                        historyModel.Set(v.uri, v);
                    });
                }
                else {
                    jQuery.each(self.Data().display_definitions, function (k, v) {
                        var displayHistory = historyModel.Get(v.uri, false);
                        if (!displayHistory) {
                            historyModel.Set(v.uri + historyModel.OriginalVersionSuffix, v);
                        }
                        displayHistory = historyModel.Get(v.uri);
                        if (!displayHistory) {
                            historyModel.Set(v.uri, v);
                        }
                    });
                }

                return jQuery.when(self.Data());
            });
    };
    self.LoadMetadata = function (angle, display, isLoadField) {
        var classes = [];
        var fields = [];
        var followups = [];
        var sources = [];

        if (angle) {
            var angleMetadata = WC.ModelHelper.GetAllMetadata(angle);

            jQuery.merge(classes, angleMetadata.classes);
            jQuery.merge(fields, angleMetadata.fields);
            jQuery.merge(followups, angleMetadata.followups);
            jQuery.merge(sources, angleMetadata.sources);
        }

        if (display) {
            var displayMetadata = WC.ModelHelper.GetAllMetadata(display);

            jQuery.merge(classes, displayMetadata.classes);
            jQuery.merge(fields, displayMetadata.fields);
            jQuery.merge(followups, displayMetadata.followups);
            jQuery.merge(sources, displayMetadata.sources);
        }

        if (isLoadField === true) {
            classes = [];
            followups = [];
        }
        classes = classes.distinct();
        followups = followups.distinct();
        fields = fields.distinct();
        sources = sources.distinct();

        var model = modelsHandler.GetModelByUri(angle.model);
        return jQuery.when(!model || (model && (!model.fields || !model.followups || !model.classes || !model.fieldsources)) ? modelsHandler.LoadModelInfo(angle.model) : null)
            .then(function () {
                model = modelsHandler.GetModelByUri(angle.model);
                var requestFieldUrl = modelsHandler.GetQueryFieldsUri(null, angle, true);
                var loadFieldsMetadata = function () {
                    return modelFieldsHandler.LoadFieldsByIds(requestFieldUrl, fields)
                        .then(function (data) {
                            return modelFieldsHandler.LoadFieldsMetadata(data.fields);
                        })
                        .then(function (data) {
                            return modelFieldSourceHandler.LoadFieldSourcesByIds(model.fieldsources, sources);
                        });
                };
                return jQuery.when(
                    loadFieldsMetadata(),
                    modelFollowupsHandler.LoadFollowupsByIds(followups, angle.model),
                    modelClassesHandler.LoadClassesByIds(classes, angle.model)
                );
            });
    };
    /*  M4-10057: Implement state transfers for angles/displays/dashboards
        5.GET angle for updated client view model
    */
    self.LoadAngle = function (angleUri, options) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(angleUri), query)
            .then(function (data, status, xhr) {
                self.SetData(data);
                //update data after set state to history model
                jQuery.each(data.display_definitions, function (index, display) {
                    var displayHistory = historyModel.Get(display.uri, false);
                    if (!displayHistory) {
                        historyModel.Set(display.uri + historyModel.OriginalVersionSuffix, display);
                        historyModel.Set(display.uri, display);
                    }
                    else {
                        displayHistory.is_public = display.is_public;
                        displayHistory.is_angle_default = display.is_angle_default;
                        displayHistory.authorizations = display.authorizations;
                        historyModel.Set(display.uri + historyModel.OriginalVersionSuffix, displayHistory);
                        displayHistory = historyModel.Get(display.uri);
                        displayHistory.is_public = display.is_public;
                        displayHistory.is_angle_default = display.is_angle_default;
                        displayHistory.authorizations = display.authorizations;
                        historyModel.Set(display.uri, displayHistory);
                    }

                    // update current model
                    if (display.uri === displayModel.Data().uri) {
                        displayModel.LoadSuccess(displayHistory);
                    }
                });
            });
    };
    self.SetData = function (data) {
        data = WC.ModelHelper.ExtendAngleData(data);

        // set data
        jQuery.localStorage(self.AngleName, data);
        self.Data(data);

        // update temporary angle
        if (self.IsTemporaryAngle(data.uri)) {
            self.SetTemporaryAngle(ko.toJS(data));
        }

        // ko
        self.AngleId(data.id);
        self.Name(WC.Utility.GetDefaultMultiLangText(data.multi_lang_name));
        self.Description(WC.Utility.GetDefaultMultiLangText(data.multi_lang_description));
        self.IsStarred(data.user_specific.is_starred);
        self.IsPublished(data.is_published);
        self.IsTemplate(data.is_template);
        self.IsTempTemplate(data.is_template);
        self.IsValidated(data.is_validated);
        self.IsTempValidated(data.is_validated);
        self.PrivateNote(data.user_specific.private_note);
        self.TimeExcuted(data.user_specific.times_executed);
        self.AllowMoreDetails(data.allow_more_details);
        self.AllowFollowups(data.allow_followups);

        // query step
        self.UpdateAngleQuerySteps(data);

        // others
        self.SetAngleDetailModelName(data);
        self.SetAngleDetailBaseClassName(data);
        self.SetAngleSatistics(data.created, data.changed, data.executed, data.validated, data['deleted']);

        // commit
        self.CommitAll();

        // Update display authurization
        if (displayModel.Data()) {
            var displayAuthorizations = jQuery.grep(angleInfoModel.Data().display_definitions, function (display) {
                return (display.id || '') === (displayModel.Data().id || '');
            });
            if (displayAuthorizations.length > 0) {
                displayModel.UpdateAuthorization(displayAuthorizations[0].authorizations);
            }
        }

        //Change angle privilege in local storage
        userModel.UpdateAnglePrivilege(data);

        //Update publications watcher
        self.UpdatePublicationsWatcher();
    };
    self.UpdateAngleQuerySteps = function (data) {
        if (typeof angleQueryStepModel !== 'undefined') {
            var queryStepBlock = data.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) || { query_steps: [] };

            // query steps
            angleQueryStepModel.SetQueryStep(queryStepBlock.query_steps);

            // update execution parameters
            angleQueryStepModel.UpdateExecutionParameters();
        }
    };
    self.UpdatePublicationsWatcher = function (state) {
        // update publiactions watcher
        jQuery.each(self.Data().display_definitions, function (index, display) {
            var watcherPublicationKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', display.uri);
            if (jQuery.storageWatcher(watcherPublicationKey) != null) {
                jQuery.storageWatcher(watcherPublicationKey, typeof state !== 'undefined' ? state : display.is_public);
            }
        });
    };
    self.DeleteReadOnlyAngleProperties = function (angleData) {
        return WC.ModelHelper.RemoveReadOnlyAngleData(angleData);
    };
    self.UpdateAngle = function (uri, updateAngle, forced) {
        var params = {};
        params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;

        if (forced)
            params[enumHandlers.PARAMETERS.FORCED] = true;

        return UpdateDataToWebService(uri + '?' + jQuery.param(params), updateAngle)
            .then(function (data, status, xhr) {
                //update history
                if (historyModel) {
                    jQuery.each(data.display_definitions, function (index, display) {
                        historyModel.Set(display.uri + historyModel.OriginalVersionSuffix, display);
                    });
                }

                self.SetData(data);

                return jQuery.when(data);
            });
    };
    self.SaveFiltersFromDisplay = function (filters, forced, currentDisplayUri) {
        filters = ko.toJS(filters);

        var data = {
            query_definition: ko.toJS(self.Data().query_definition)
        };
        var stepBlock = data.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (!stepBlock) {
            data.query_definition.push({
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: filters
            });
        }
        else {
            jQuery.merge(stepBlock.query_steps, filters);
        }

        var getUpdateFilter = function (displayQuerySteps) {
            var hasChanges = false;
            var i;

            jQuery.each(filters, function (indexFilter, filter) {
                var compareFilter = ko.toJS(filter);
                WC.ModelHelper.RemoveReadOnlyQueryStep(compareFilter);
                delete compareFilter.execution_parameter_id;
                for (i = displayQuerySteps.length - 1; i >= 0; i--) {
                    var compareDisplayFilter = ko.toJS(displayQuerySteps[i]);
                    WC.ModelHelper.RemoveReadOnlyQueryStep(compareDisplayFilter);
                    delete compareDisplayFilter.execution_parameter_id;
                    if (jQuery.deepCompare(compareFilter, compareDisplayFilter, true, true)) {
                        displayQuerySteps.splice(i, 1);
                        hasChanges = true;
                    }
                }
            });
            
            var updateDisplayData;
            if (hasChanges) {
                if (displayQuerySteps.length) {
                    updateDisplayData = {
                        query_blocks: [{
                            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                            query_steps: displayQuerySteps
                        }]
                    };
                }
                else {
                    updateDisplayData = {
                        query_blocks: []
                    };
                }
            }
            else {
                updateDisplayData = null;
            }

            return updateDisplayData;
        };
        var updateDisplayFilter = function (displayUri, displayData) {
            var params = {};
            params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
            params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
            params[enumHandlers.PARAMETERS.FORCED] = !!forced;

            return UpdateDataToWebService(displayUri + '?' + jQuery.param(params), displayData);
        };

        return self.UpdateAngle(self.Data().uri, data, forced)
            .then(function (response) {
                // remove duplicate query step
                var displaysDeferred = [];
                jQuery.each(response.display_definitions, function (index, display) {
                    if (display.query_blocks.length && display.uri !== currentDisplayUri) {
                        var updateDisplayData = getUpdateFilter(display.query_blocks[0].query_steps);
                        if (updateDisplayData) {
                            displaysDeferred.pushDeferred(updateDisplayFilter, [display.uri, updateDisplayData])
                        }
                    }
                });
                return jQuery.whenAll(displaysDeferred);
            })
            .done(function () {
                // force to post a new result
                resultModel.Data().posted_angle = [];

                // update change history
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i][1] === 'success') {
                        var display = WC.ModelHelper.ExtendDisplayData(arguments[i][0]);

                        // update Angle model
                        var indexOfDisplay = self.Data().display_definitions.indexOfObject('uri', display.uri);
                        if (indexOfDisplay !== -1) {
                            self.Data().display_definitions[indexOfDisplay].query_blocks = display.query_blocks;
                        }

                        // original display data
                        var historyData = historyModel.Get(display.uri, false);
                        if (historyData) {
                            historyData.query_blocks = display.query_blocks;
                            historyModel.Set(display.uri + historyModel.OriginalVersionSuffix, historyData);
                        }

                        // current display data
                        historyData = historyModel.Get(display.uri);
                        if (historyData) {
                            historyData.query_blocks = display.query_blocks;
                            historyModel.Set(display.uri, historyData);
                        }
                    }
                };

                // remove posted result history
                jQuery.each(self.Data().display_definitions, function (index, display) {
                    // original display data
                    var historyData = historyModel.Get(display.uri, false);
                    if (historyData) {
                        delete historyData.results;
                        historyModel.Set(display.uri + historyModel.OriginalVersionSuffix, historyData);
                    }

                    // current display data
                    historyData = historyModel.Get(display.uri);
                    if (historyData) {
                        delete historyData.results;
                        historyModel.Set(display.uri, historyData);
                    }
                });
            });
    };

    /*  M4-10057: Implement state transfers for angles/displays/dashboards
        3.PUT is_published state of angle
        3.1.Updated client angle view model
    */
    self.UpdateState = function (uri, updateState, forced) {

        var params = {};

        if (forced)
            params[enumHandlers.PARAMETERS.FORCED] = true;

        return UpdateDataToWebService(uri.substr(1) + '?' + jQuery.param(params), updateState)
            .then(function (data, status, xhr) {
                self.Data().is_published = data.is_published;
                self.Data().is_template = data.is_template;
                self.Data().is_validated = data.is_validated;
                self.IsPublished(data.is_published);
                self.IsTemplate(data.is_template);
                self.IsTempTemplate(data.is_template);
                self.IsValidated(data.is_validated);
                self.IsTempValidated(data.is_validated);
                self.Data.commit();
                self.IsPublished.commit();
                self.IsTemplate.commit();
                self.IsValidated.commit();
                return jQuery.when(data);
            });
    };
    self.CommitAll = function () {
        self.Data.commit();
        self.Name.commit();
        self.IsPublished.commit();
        self.IsTemplate.commit();
        self.IsValidated.commit();
        self.PrivateNote.commit();
        self.AngleId.commit();
        self.Description.commit();
        self.AllowFollowups.commit();
        self.AllowMoreDetails.commit();
    };
    self.ResetAll = function () {
        self.Data.reset();
        self.Name.reset();
        self.IsPublished.reset();
        self.IsTemplate.reset();
        self.IsValidated.reset();
        self.PrivateNote.reset();
        self.AngleId.reset();
        self.Description.reset();
        self.AllowFollowups.reset();
        self.AllowMoreDetails.reset();
    };
    self.SetFavoriteItem = function (model, event) {
        if (angleInfoModel.Data().authorizations.update_user_specific) {
            requestHistoryModel.SaveLastExecute(self, self.SetFavoriteItem, arguments);
            if (!angleInfoModel.IsTemporaryAngle()) {
                var element = jQuery(event.target);
                var data = {
                    user_specific: {
                        is_starred: !self.Data().user_specific.is_starred
                    }
                };
                element.addClass('loading16x16');
                var query = {};
                query[enumHandlers.PARAMETERS.FORCED] = true;
                jQuery.when(UpdateDataToWebService(self.Data().uri + '?' + jQuery.param(query), data))
                    .done(function (response, status, xhr) {
                        self.IsStarred(response.user_specific.is_starred);
                        self.Data().user_specific.is_starred = response.user_specific.is_starred;
                        self.Data.commit();
                    })
                    .always(function () {
                        element.removeClass('loading16x16');
                    });
            }
            else {
                self.Data().user_specific.is_starred = !self.Data().user_specific.is_starred;
                self.Data.commit();
                self.IsStarred(self.Data().user_specific.is_starred);
            }
        }
    };
    self.SetAngleDetailModelName = function (angle) {
        var model = modelsHandler.GetModelByUri(angle.model);
        if (model) {
            self.ModelName().ShortName(model.short_name);
            self.ModelName().LongName(model.long_name);
            self.ModelName().FriendlyName(model.short_name || model.id);
        }
    };
    self.SetAngleDetailBaseClassName = function (angle) {
        if (typeof angleQueryStepModel !== 'undefined') {
            var baseClassesBlock = angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            if (baseClassesBlock) {
                angleQueryStepModel.BaseClasses(baseClassesBlock);
            }
        }
    };
    //Last executed by
    self.SetExecutedBy = function (executedBy, changedBy) {
        //clear LastExecuted
        self.ExecutedBy({});

        if (!IsUndefindedOrNull(executedBy)) {
            self.ExecutedBy({
                user: executedBy.user,
                datetime: ConvertUnixTimeStampToDateStringInAngleDetails(executedBy.datetime),
                full_name: executedBy.full_name
            });
        }
        else if (!IsUndefindedOrNull(changedBy)) {
            // M4-11591: Time in "Last Execute by" is earlier than "Created by"
            //12/Jan/2015: M4-11683: WC: Error returned after create new angle with multiple base class
            self.ExecutedBy({
                user: changedBy.user,
                datetime: ConvertUnixTimeStampToDateStringInAngleDetails(changedBy.datetime),
                full_name: changedBy.full_name
            });
        }
    };
    self.SetAngleSatistics = function (createdBy, changedBy, executedBy, validatedBy, deletedBy) {
        if (!IsUndefindedOrNull(createdBy)) {
            self.CreatedBy({ user: createdBy.user, datetime: ConvertUnixTimeStampToDateStringInAngleDetails(createdBy.datetime), full_name: createdBy.full_name });
        }

        if (!IsUndefindedOrNull(changedBy)) {
            self.ChangedBy({ user: changedBy.user, datetime: ConvertUnixTimeStampToDateStringInAngleDetails(changedBy.datetime), full_name: changedBy.full_name });
        }

        self.SetExecutedBy(executedBy, changedBy);

        if (!IsUndefindedOrNull(validatedBy)) {
            self.ValidatedBy({ user: validatedBy.user, datetime: ConvertUnixTimeStampToDateStringInAngleDetails(validatedBy.datetime), full_name: validatedBy.full_name });
        }

        if (!IsUndefindedOrNull(deletedBy)) {
            self.DeletedBy({ user: deletedBy.user, datetime: ConvertUnixTimeStampToDateStringInAngleDetails(deletedBy.datetime), full_name: deletedBy.full_name });
        }
    };
    self.GetAngleBaseClasses = function () {
        return jQuery.grep(self.Data().query_definition, function (queryDefinition) { return queryDefinition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES });
    };
    self.GetAngleDescription = function (detail) {
        var html = '<a class="btnInfo" onclick="angleDetailPageHandler.ShowInfoPopup()"></a>';
        if (detail) {
            detail = detail = WC.HtmlHelper.StripHTML(detail, true);
            html = detail + html;
        }
        return html;
    };
    self.CreateFromTemplate = function (model) {
        // set template & temporary angle to localStorage
        self.SetTemplateAngle(model);

        return self.CreateTempAngle(model);
    };
    self.CreateTempAngle = function (model) {
        var newAngle = self.GetTemporaryAngle(),
            displayUri = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY),
            editmode = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE),
            display;

        // to make sure, it's not garbage angle
        if (typeof newAngle.display_definitions !== 'undefined' && newAngle.display_definitions.length) {
            var newDisplay,
                currentUser = userModel.Data(),
                defaultAngleDisplayId = null;

            // create temporary for each displays
            jQuery.each(newAngle.display_definitions, function (k, v) {
                if (v.uri === displayUri) {
                    display = v;
                }

                newDisplay = jQuery.GUID();
                if (newAngle.angle_default_display === v.id) {
                    defaultAngleDisplayId = 'd' + newDisplay.replace(/-/g, '');
                }
                v.__id = v.id;
                v.id = 'd' + newDisplay.replace(/-/g, '');
                v.uri_template = v.uri;
                v.uri = newAngle.uri + '/displays/' + newDisplay;
                if (!newAngle.is_published) {
                    v.is_public = false;
                }
                v.created = {
                    user: currentUser.uri,
                    datetime: WC.DateHelper.GetCurrentUnixTime(),
                    full_name: currentUser.full_name
                };
                delete v.user_specific;
            });
            jQuery.each(newAngle.display_definitions, function (k, v) {
                var displayDetails = WC.Utility.ParseJSON(v.display_details);
                if (displayDetails.drilldown_display) {
                    var drilldownTargetDisplay = newAngle.display_definitions.findObject('__id', displayDetails.drilldown_display);
                    if (drilldownTargetDisplay) {
                        displayDetails.drilldown_display = drilldownTargetDisplay.id;
                    }
                    else {
                        delete displayDetails.drilldown_display;
                    }
                    v.display_details = ko.toJSON(displayDetails);
                }
                displayModel.SetTemporaryDisplay(v.uri, v);
            });
            if (!defaultAngleDisplayId) {
                defaultAngleDisplayId = newAngle.display_definitions[0].id;
            }
            newAngle.angle_default_display = defaultAngleDisplayId;
            delete newAngle.user_specific;

            // update model
            self.SetData(jQuery.extend({}, newAngle));

            // update temp
            self.SetTemporaryAngle(newAngle);

            // redirect to temporary angle
            var query = {};
            if (editmode) {
                query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
            }

            // set display
            if (!display) {
                display = newAngle.display_definitions[0];
            }

            return WC.Utility.GetAnglePageUri(newAngle.uri, display.uri, query);
        }
        else {
            // garbage angle
            return false;
        }
    };
    self.SetTemplateAngle = function (template) {
        var value = jQuery.extend({}, template);
        var currentUser = userModel.Data();

        value.uri_template = value.uri;
        value.is_template = false;
        value.is_validated = false;
        value.is_published = false;
        value.allow_followups = true;
        value.allow_more_details = true;
        jQuery.each(value.multi_lang_name, function (k, v) {
            v.text = 'Based on Template "' + v.text + '"';
        });
        value.created = {
            user: currentUser.uri,
            datetime: WC.DateHelper.GetCurrentUnixTime(),
            full_name: currentUser.full_name
        };
        if (typeof value.executed !== 'undefined')
            value.executed = value.created;

        // check valid query_definition
        var angleValidation = validationHandler.GetAngleValidation(value);
        if (!angleValidation.Valid) {
            value.display_definitions = [];
        }

        var removeDisplayField = function (fields, displayType) {
            for (var j = fields.length - 1; j >= 0; j--) {
                var field = fields[j];

                // check valid fields for each display
                if (!field.valid || (displayType === enumHandlers.DISPLAYTYPE.LIST && field.denied === enumHandlers.DENYTYPE.DENY.Value)) {
                    fields.splice(j, 1);
                }
            }
        };

        // check valid query_steps for each display
        for (var i = value.display_definitions.length - 1; i >= 0; i--) {
            var display = value.display_definitions[i];
            var displayValidation = validationHandler.GetDisplayValidation(display, value.model);
            var valid = (displayValidation.InvalidFilters || displayValidation.InvalidFollowups || displayValidation.InvalidAggregates);
            if (valid) {
                value.display_definitions.splice(i, 1);
            }
            else {
                if (displayValidation.InvalidSortings) {

                    // find an object which is step_type === sorting, then remove if its state is not valid
                    var sortingSteps = value.display_definitions[i].query_blocks[0].query_steps.findObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                    sortingSteps.sorting_fields.removeObject('valid', false);

                    // check if the sorting_fields was completely removed, remove its object.
                    if (sortingSteps.sorting_fields.length === 0)
                        value.display_definitions[i].query_blocks[0].query_steps.removeObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                }

                removeDisplayField(display.fields, display.display_type);
            }
        }

        var data = self.TemporaryAngle() || {};
        data.template = template;
        self.TemporaryAngle(data);
        jQuery.localStorage(self.TemporaryAngleName, data);

        self.SetTemporaryAngle(value);
    };
    self.GetTemplateAngle = function () {
        return self.TemporaryAngle().template;
    };
    self.SetTemporaryAngle = function (value) {
        var newAngle = jQuery.GUID(),
            uri = value.model + '/angles/' + newAngle,
            data = self.TemporaryAngle() || {};

        if (!self.IsTemporaryAngle(value.uri)) {
            value.id = 'a' + newAngle.replace(/-/g, '');
            value.uri = uri;
            value.displays = uri + '/displays';
        }

        value.authorizations = self.GetDefaultAdhocAuthorization();

        jQuery.each(value.display_definitions, function (index, display) {
            display.authorizations = displayModel.GetDefaultAdhocAuthorization();
            display.__uri = display.uri;
        });

        data.data = value;
        self.TemporaryAngle(data);
        jQuery.localStorage(self.TemporaryAngleName, data);
        jQuery.localStorage(self.AngleName, value);
    };
    self.GetTemporaryAngle = function () {
        return self.TemporaryAngle() ? self.TemporaryAngle().data : {};
    };
    self.DeleteTemporaryAngle = function () {
        historyModel.ClearAll(self.GetTemporaryAngle().uri);

        jQuery.localStorage.removeItem(self.TemporaryAngleName);
        jQuery.localStorage.removeItem(displayModel.TemporaryDisplayName);
    };
    self.IsTemporaryAngle = function (angle) {
        if (typeof angle === 'undefined') angle = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE) || '';
        return angle && isNaN(angle.substr(angle.lastIndexOf('/') + 1));
    };
    self.GetDefaultAdhocAuthorization = function () {
        return {
            'update_user_specific': false,
            create_private_display: true,
            create_public_display: true,
            'delete': true,
            mark_template: true,
            publish: true,
            unmark_template: false,
            unpublish: false,
            unvalidate: false,
            update: true,
            validate: false
        };
    };

    self.CanUpdateAngle = function (name) {
        /// <summary>check can update Angle</summary>
        /// <param name="name" type="String">Angle's property which will be checked in case validated Angle</param>
        /// <returns type="Boolean"></returns>

        var canUpdate = self.Data().authorizations.update;
        var isValidated = self.Data().is_validated;
        var disallowedNames = ['assigned_labels', 'query_definition', 'allow_more_details', 'allow_followups'];

        return WC.ModelHelper.CanUpdateItem(name, canUpdate, isValidated, disallowedNames);
    };
    //EOF: View model methods

    //BOF: View model initial
    var storage = jQuery.localStorage(self.TemporaryAngleName);
    if (storage != null) {
        self.TemporaryAngle(storage);
    }
    storage = jQuery.localStorage(self.AngleName);
    if (storage != null) {
        self.Data(storage);
        self.Data.commit();
    }

    if (typeof model !== 'undefined') {
        self.Data(model);
        self.Data.commit();
    }
    //EOF: View model initial
}
