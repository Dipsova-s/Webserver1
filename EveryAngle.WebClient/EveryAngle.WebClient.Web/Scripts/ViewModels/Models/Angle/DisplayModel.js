var displayModel = new DisplayModel();

function DisplayModel(model) {
    "use strict";

    var self = this;
    //BOF: View model properties
    self.ModelName = 'displays';
    self.Data = ko.protectedObservable(null);
    self.QueryBlocksModel = null;
    self.Name = ko.protectedObservable('');
    self.Description = ko.protectedObservable('');
    self.IsDefault = ko.protectedObservable(false);
    self.ExcuteOnLogin = ko.protectedObservable(false);
    self.TemporaryDisplayName = 'temp_displays';
    self.TemporaryDisplay = ko.observable(null);
    self.PersonalDefaultDisplay = ko.protectedObservable(false);
    self.DisplayId = ko.protectedObservable('');
    self.KeepFilter = ko.observable(false);
    self.DisplayInfo = {
        Name: Localization.AngleDropdownListSelectDisplay,
        Displays: ko.observableArray([]),
        KeepFiltersText: Localization.DisplayDropdownListKeepFilter
    };
    self.BasicListName = 'basic list';
    //EOF: View model properties

    //BOF: View model methods
    self.IsNewDisplay = function () {
        return self.Data() && !self.Data().display_type;
    };
    self.LoadSuccess = function (data) {
        //set display data
        data = WC.ModelHelper.ExtendDisplayData(data, angleInfoModel.Data());

        self.Data(data);
        self.DisplayId(data.id);
        self.IsDefault(data.is_angle_default);
        self.ExcuteOnLogin(data.user_specific && data.user_specific.execute_on_login);
        self.PersonalDefaultDisplay(data.user_specific && data.user_specific.is_user_default);
        self.Name(WC.Utility.GetDefaultMultiLangText(data.multi_lang_name));
        self.Description(WC.Utility.GetDefaultMultiLangText(data.multi_lang_description));
        self.CommitAll();

        /* M4-11731: Always set 'Keep active display filters' checked when display as ad-hoc display (still don't show if display had jump) */
        self.KeepFilter(!!data.KeepFilter);

        if (typeof displayQueryBlockModel !== 'undefined') {
            self.UpdateDisplayQuerySteps(data);

            if (displayQueryBlockModel.GetAllFollowupSteps().length)
                self.KeepFilter(false);
        }

        //Update publications watcher
        self.UpdatePublicationsWatcher();

        return jQuery.when(data);
    };
    self.UpdateDisplayQuerySteps = function (data) {
        if (typeof displayQueryBlockModel !== 'undefined') {
            // query steps
            displayQueryBlockModel.SetDisplayQueryBlock(data.query_blocks);
            displayQueryBlockModel.UpdateExecutionParameters();
        }
    };
    self.UpdatePublicationsWatcher = function (state) {
        // update publiactions watcher
        var watcherPublicationKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', self.Data().uri);
        if (jQuery.storageWatcher(watcherPublicationKey) != null) {
            jQuery.storageWatcher(watcherPublicationKey, typeof state !== 'undefined' ? state : self.Data().is_public);
        }
    };
    self.GetDefaultDisplay = function () {
        return WC.Utility.GetDefaultDisplay(angleInfoModel.Data().display_definitions);
    };
    self.GetDisplayByFieldName = function (fieldName, models) {
        if (!IsUndefindedOrNull(fieldName)) {
            return ko.toJS(models).findObject('field', fieldName, false);
        }
        else {
            return null;
        }
    };
    self.GetDisplayByUriFromDisplayDefinitions = function (uri) {
        var displays = jQuery.grep(angleInfoModel.Data().display_definitions, function (definition) {
            return definition.uri === uri;
        });

        return !displays.length ? null : displays[0];
    };
    self.GetSpecificColumnString = function (columnsData) {
        var validColumns = jQuery.grep(columnsData, function (column) {
            return column.valid !== false && column.denied !== enumHandlers.DENYTYPE.DENY.Value;
        });

        return jQuery.map(validColumns, function (column) { return column.id || column.field; }).join(',');
    };
    self.CommitAll = function () {
        self.Data.commit();
        self.IsDefault.commit();
        self.ExcuteOnLogin.commit();
        self.Name.commit();
        self.Description.commit();
        self.PersonalDefaultDisplay.commit();
        self.DisplayId.commit();
    };
    self.ResetAll = function () {
        self.Data.reset();
        self.IsDefault.reset();
        self.ExcuteOnLogin.reset();
        self.Name.commit();
        self.Description.reset();
        self.PersonalDefaultDisplay.reset();
        self.DisplayId.reset();
    };
    self.UpdateDisplay = function (uri, updateDisplay, isForced, mustUpdateAngleDefault) {
        if (typeof mustUpdateAngleDefault === 'undefined') {
            mustUpdateAngleDefault = false;
        }

        //remove readonly properties
        updateDisplay = self.DeleteReadOnlyDisplayProperties(updateDisplay);

        // check has updating properties or not?
        var hasUpdateProperties = !jQuery.isEmptyObject(updateDisplay);

        if (typeof updateDisplay.is_public !== 'undefined' && hasUpdateProperties) {
            return self.UpdateState(self.Data().state, { is_published: updateDisplay.is_public }, isForced)
                .then(function () {
                    var historyData = historyModel.Get(self.Data().uri);
                    historyData.is_public = updateDisplay.is_public;
                    historyModel.Set(historyData.uri, historyData);
                    historyData = historyModel.Get(self.Data().uri, false);
                    historyData.is_public = updateDisplay.is_public;
                    historyModel.Set(historyData.uri + historyModel.OriginalVersionSuffix, historyData);

                    return angleInfoModel.LoadAngle(angleInfoModel.Data().uri);
                })
                .done(function () {
                    delete updateDisplay.is_public;

                    if (!jQuery.isEmptyObject(updateDisplay))
                        return self.SendUpdateRequest(uri, hasUpdateProperties, updateDisplay, mustUpdateAngleDefault, isForced);
                });
        }
        else
            return self.SendUpdateRequest(uri, hasUpdateProperties, updateDisplay, mustUpdateAngleDefault, isForced);
    };
    self.SendUpdateRequest = function (uri, hasUpdateProperties, updateDisplay, mustUpdateAngleDefault, isForced) {
        var params = {};
        params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        params[enumHandlers.PARAMETERS.FORCED] = WC.Utility.ToBoolean(isForced);

        var saveDisplay = function () {
            var displayUri = uri + '?' + jQuery.param(params);
            return hasUpdateProperties ? UpdateDataToWebService(displayUri, updateDisplay) : historyModel.Get(displayUri);
        };

        var updateGaugeDisplayDetails = function (display, model) {
            var displayDetails = WC.Utility.ParseJSON(display.display_details);
            if (display.uri !== model.uri && displayDetails && displayDetails.drilldown_display === model.id) {
                delete displayDetails.drilldown_display;
                return UpdateDataToWebService(display.uri + '?' + jQuery.param(params), { display_details: JSON.stringify(displayDetails) })
                    .done(function (data) {
                        var historyData = historyModel.Get(data.uri);
                        var historyDataDetails = WC.Utility.ParseJSON(historyData.display_details);
                        delete historyDataDetails.drilldown_display;
                        historyData.display_details = JSON.stringify(historyDataDetails);
                        historyModel.Set(historyData.uri, historyData);

                        historyData = jQuery.extend({}, historyModel.Get(data.uri, false), data);
                        historyModel.Set(historyData.uri + historyModel.OriginalVersionSuffix, historyData);

                    });
            }
            return jQuery.when();
        };

        var updateAngleDefaultDisplay = function (model) {
            return UpdateDataToWebService(angleInfoModel.Data().uri + '?' + jQuery.param(params), { angle_default_display: model.id })
                .then(function (response) {
                    jQuery.each(angleInfoModel.Data().display_definitions, function (index, display) {
                        var responseDisplay = response.display_definitions.findObject('uri', display.uri);
                        if (responseDisplay) {
                            responseDisplay = WC.ModelHelper.ExtendDisplayData(responseDisplay, response);
                            angleInfoModel.Data().display_definitions[index].authorizations = responseDisplay.authorizations;
                        }
                        if (model.uri === display.uri) {
                            model.authorizations = responseDisplay.authorizations;
                        }
                    });
                    angleInfoModel.Data().angle_default_display = model.id;
                    angleInfoModel.Data.commit();
                    model.is_angle_default = true;

                    return jQuery.when(model);
                });
        };

        return jQuery.when(saveDisplay())
            .then(function (model) {
                // clear drilldown_display if this chart is updated to guage
                var deferred = [];
                var displayDetails = WC.Utility.ParseJSON(model.display_details);
                if (model.display_type === enumHandlers.DISPLAYTYPE.CHART
                    && displayDetails.chart_type === enumHandlers.CHARTTYPE.GAUGE.Code) {
                    jQuery.each(angleInfoModel.Data().display_definitions, function (index, display) {
                        deferred.pushDeferred(updateGaugeDisplayDetails, [display, model]);
                    });
                }
                return jQuery.whenAll(deferred)
                    .then(function () {
                        return jQuery.when(model);
                    });
            })
            .then(function (model) {
                if (mustUpdateAngleDefault) {
                    /* M4-14163: Fixed cannot save default display when display had invalid fileds */
                    return updateAngleDefaultDisplay(model);
                }
                else {
                    return jQuery.when(model);
                }
            })
            .then(self.UpdateDisplayCallback);
    };
    self.UpdateDisplayCallback = function (model) {
        var index = angleInfoModel.Data().display_definitions.indexOfObject('uri', model.uri);
        var historyData;
        if (index !== -1) {
            jQuery.each(angleInfoModel.Data().display_definitions, function (k, v) {
                if (k !== index) {
                    if (model.is_angle_default && v.is_angle_default) {
                        v.is_angle_default = false;

                        historyData = historyModel.Get(v.uri, false);
                        if (historyData) {
                            historyData.is_angle_default = false;
                            historyData.authorizations = v.authorizations;
                            historyModel.Set(historyData.uri + historyModel.OriginalVersionSuffix, historyData);
                        }

                        historyData = historyModel.Get(v.uri);
                        if (historyData) {
                            historyData.is_angle_default = false;
                            historyData.authorizations = v.authorizations;
                            historyModel.Set(historyData.uri, historyData);
                        }
                    }

                    if (model.user_specific && model.user_specific.is_user_default && v.user_specific && v.user_specific.is_user_default) {
                        v.user_specific.is_user_default = false;

                        historyData = historyModel.Get(v.uri, false);
                        if (historyData) {
                            historyData.user_specific.is_user_default = false;
                            historyData.authorizations = v.authorizations;
                            historyModel.Set(historyData.uri + historyModel.OriginalVersionSuffix, historyData);
                        }

                        historyData = historyModel.Get(v.uri);
                        if (historyData) {
                            historyData.user_specific.is_user_default = false;
                            historyData.authorizations = v.authorizations;
                            historyModel.Set(historyData.uri, historyData);
                        }
                    }
                }
            });

            angleInfoModel.Data().display_definitions[index] = model;
            angleInfoModel.SetData(angleInfoModel.Data());
        }
        self.LoadSuccess(model);

        historyData = jQuery.extend({}, historyModel.Get(model.uri), self.Data());
        historyModel.Set(historyData.uri + historyModel.OriginalVersionSuffix, historyData);
        historyModel.Set(historyData.uri, historyData);

        return jQuery.when(model);
    };
    self.UpdateState = function (uri, updateState, isForced) {
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = isForced;
        return UpdateDataToWebService(uri + '?' + jQuery.param(query), updateState)
            .then(function (data) {
                self.Data().is_public = data.is_published;
                self.Data.commit();
                return jQuery.when(data);
            });
    };
    self.GenerateDefaultData = function (displayType, headerFieldId, bucket, fieldDetails) {
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase(),
            currentUser = userModel.Data(),
            display = {
                display_type: displayType || null,
                is_angle_default: false,
                is_public: false,
                user_specific: {
                    execute_on_login: false,
                    is_user_default: false
                },
                created: {
                    user: currentUser.uri,
                    datetime: WC.DateHelper.GetCurrentUnixTime(),
                    full_name: currentUser.full_name
                },
                multi_lang_name: [{
                    lang: defaultLanguage,
                    text: Localization.DefaultDisplayListName
                }],
                multi_lang_description: [{
                    lang: defaultLanguage,
                    text: ''
                }],
                fields: [],
                query_blocks: []
            };

        switch (displayType) {
            case enumHandlers.DISPLAYTYPE.CHART:
            case enumHandlers.DISPLAYTYPE.PIVOT:
                var defaultField = headerFieldId || 'ObjectType',
                    defaultBucket = bucket || 'individual',
                    aggregation = {
                        step_type: enumHandlers.FILTERTYPE.AGGREGATION,
                        grouping_fields: [{
                            field: defaultBucket + '_' + defaultField,
                            operator: defaultBucket,
                            source_field: defaultField
                        }],
                        aggregation_fields: [{
                            field: enumHandlers.AGGREGATION.COUNT.Value,
                            operator: enumHandlers.AGGREGATION.COUNT.Value
                        }]
                    };

                display.multi_lang_name[0].text = 'New ' + Localization['DisplayType_' + displayType].toLowerCase();
                display.multi_lang_description[0].text = '';
                display.display_details = displayType === enumHandlers.DISPLAYTYPE.CHART ? JSON.stringify({ chart_type: enumHandlers.CHARTTYPE.COLUMNCHART.Code }) : '';
                display.query_blocks = [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                    query_steps: [aggregation]
                }];

                var createRowFieldDetailObj = {
                    pivot_area: fieldSettingsHandler.GetAreaById(enumHandlers.FIELDSETTINGAREA.ROW)
                };
                // merge field detail
                jQuery.extend(createRowFieldDetailObj, fieldDetails);
                delete createRowFieldDetailObj.width;

                display.fields = [
                    {
                        field: defaultBucket + '_' + defaultField,
                        field_details: JSON.stringify(createRowFieldDetailObj),
                        valid: true
                    },
                    {
                        field: enumHandlers.AGGREGATION.COUNT.Value,
                        field_details: JSON.stringify({
                            pivot_area: fieldSettingsHandler.GetAreaById(enumHandlers.FIELDSETTINGAREA.DATA)
                        }),
                        valid: true
                    }
                ];
                break;

            default:
                break;
        }

        return display;
    };
    self.CreateDisplay = function (data, keepHistory) {
        if (typeof keepHistory === 'undefined') {
            keepHistory = false;
        }

        if (data.query_blocks === null || !data.query_blocks.length) {
            delete data.query_blocks;
        }

        //remove readonly properties
        data = self.DeleteReadOnlyDisplayProperties(data);

        var params = {};
        params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        params[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        return CreateDataToWebService(directoryHandler.ResolveDirectoryUri(angleInfoModel.Data().displays) + '?' + jQuery.param(params), data)
            .done(function (data, status, xhr) {
                angleInfoModel.Data().display_definitions.push(data);
                angleInfoModel.SetData(angleInfoModel.Data());

                self.LoadSuccess(data, status, xhr);

                if (keepHistory) {
                    historyModel.Set(data.uri + historyModel.OriginalVersionSuffix, data);
                    historyModel.Set(data.uri, data);
                }
            });
    };
    self.CreateTempDisplay = function (displayType, displayObject, angleData) {
        if (jQuery('#DisplayListSelection').is(':visible')) {
            anglePageHandler.ShowOrHideDisplayList();
        }

        angleData = angleData || angleInfoModel.Data() || {};
        var angleUri = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE) || angleData.uri || '';
        var newDisplay = jQuery.GUID();
        var display = {};
        display.id = 'd' + newDisplay.replace(/-/g, '');
        display.display_type = displayType || null;
        display.uri = angleUri + '/displays/' + newDisplay;
        display.is_angle_default = false;
        display.user_specific = { is_user_default: false };
        display.is_public = false;
        display.authorizations = self.GetDefaultAdhocAuthorization(angleData);

        jQuery.extend(display, displayObject);

        // set temporary display to localStorage
        self.SetTemporaryDisplay(display.uri, display);

        // add angle in case temporary angle
        if (angleInfoModel.IsTemporaryAngle(angleUri)) {
            angleInfoModel.Data().display_definitions.push(display);
            angleInfoModel.SetData(angleInfoModel.Data());
        }

        return jQuery.when(display);
    };
    self.CreateNewDisplay = function () {
        var display = self.GenerateDefaultData(null);
        display.multi_lang_name[0].text = self.GetAdhocDisplayName(display.multi_lang_name[0].text);

        jQuery.when(self.CreateTempDisplay(null, display))
            .done(function (data) {
                // redirect to display
                fieldSettingsHandler.ClearFieldSettings();
                self.GotoTemporaryDisplay(data.uri);
            });
    };
    self.Copy = function (data, keepHistory) {
        // copy display from data and create it
        // @param data, display data object

        // remove unsafe properties
        delete data.id;

        // create copy display
        return self.CreateDisplay(data, keepHistory);
    };
    self.Delete = function (displayUri) {
        return DeleteDataToWebService(directoryHandler.ResolveDirectoryUri(displayUri))
            .done(function () {
                historyModel.Clear(displayUri);
            });
    };
    self.ForcedDelete = function (displayUri) {
        var uri = displayUri + '?forced=true';
        return DeleteDataToWebService(directoryHandler.ResolveDirectoryUri(uri))
            .done(function () {
                historyModel.Clear(displayUri);
            });
    };
    self.GetDisplayDescription = function (detail) {
        var html = '<a class="btnInfo" onclick="displayDetailPageHandler.ShowInfoPopup()"></a>';
        if (detail) {
            detail = WC.HtmlHelper.StripHTML(detail, true);
            html = detail + html;
        }
        return html;
    };

    self.GetDefaultListFields = function (resultData, loadMetadata, checkAllBasicList) {
        var isErrorEnable = errorHandlerModel.Enable();
        if (isErrorEnable) {
            errorHandlerModel.Enable(false);
        }
        return self.GetBasicListFields(resultData, checkAllBasicList)
            .then(function (basicListFields) {
                if (basicListFields.length) {
                    return jQuery.when(basicListFields);
                }
                else {
                    return self.GenerateDefaultField(loadMetadata, resultData.query_fields, true);
                }
            })
            .always(function () {
                if (isErrorEnable) {
                    errorHandlerModel.Enable(true);
                }
            });
    };

    /* BOF: M4-12612: Use basic list for 'Create new list display' */
    var fnCheckGetBasicList;
    self.GetBasicListFields = function (resultData, checkAllBasicList) {
        clearInterval(fnCheckGetBasicList);
        if (typeof checkAllBasicList === 'undefined') {
            checkAllBasicList = false;
        }

        var classes = resultData.potential_classes;
        var classPrefix = 'EA_CLASS_TPL_';
        var displayFields = [];
        if (classes.length === 1 && angleInfoModel.Data() && angleInfoModel.Data().id === classPrefix + classes[0]) {
            var listDisplays = angleInfoModel.Data().display_definitions.findObjects('display_type', enumHandlers.DISPLAYTYPE.LIST);
            if (listDisplays.length) {
                var basicDisplay = null;
                jQuery.each(listDisplays, function (index, listDisplay) {
                    var checkBasicLists = jQuery.grep(listDisplay.multi_lang_name, function (name) {
                        return name.lang === 'en' && name.text.toLowerCase() === self.BasicListName;
                    });
                    if (checkBasicLists.length)
                        basicDisplay = ko.toJS(listDisplay);
                });

                if (basicDisplay) {
                    displayFields = ko.toJS(jQuery.grep(basicDisplay.fields, function (field) {
                        return field.valid !== false && !field.denied;
                    }));
                }
                return angleInfoModel.LoadMetadata(angleInfoModel.Data(), basicDisplay, true)
                    .then(function () {
                        return jQuery.when(displayFields);
                    });
            }

            return jQuery.when(displayFields);
        }
        else if (classes.length === 1 || (classes.length && checkAllBasicList)) {
            var ids;
            var request = (resultData.model || angleInfoModel.Data().model) + '/angles';
            var query = {};
            query[enumHandlers.PARAMETERS.CACHING] = false;
            query[enumHandlers.PARAMETERS.VIEWMODE] = 'schema';
            if (checkAllBasicList) {
                ids = jQuery.map(classes, function (id) { return (classPrefix + id).toLowerCase(); });
            }
            else {
                ids = [(classPrefix + classes[0]).toLowerCase()];
            }
            query['ids'] = ids.join(',');

            return GetDataFromWebService(request, query)
                .then(function (data) {
                    if (data.angles.length) {
                        var anglesUri = [];
                        var query = {};
                        query[enumHandlers.PARAMETERS.CACHING] = false;
                        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';

                        if (checkAllBasicList) {
                            jQuery.each(data.angles, function (index, angle) {
                                var idIndex = jQuery.inArray(angle.id.toLowerCase(), ids);
                                if (idIndex !== -1) {
                                    anglesUri[idIndex] = angle.uri;
                                }
                            });
                        }
                        else {
                            anglesUri = [data.angles[0].uri];
                        }

                        var isDoneAllRequest = false;
                        var basicAngle = null;
                        var basicDisplay = null;
                        var getAngleWithBasicList = function () {
                            if (anglesUri.length && !basicDisplay) {
                                var angleUri = anglesUri.splice(0, 1)[0];
                                if (angleUri) {
                                    GetDataFromWebService(angleUri, query)
                                        .done(function (angle) {
                                            jQuery.each(angle.display_definitions, function (index, display) {
                                                if (display.display_type === enumHandlers.DISPLAYTYPE.LIST) {
                                                    var checkBasicLists = jQuery.grep(display.multi_lang_name, function (name) {
                                                        return name.lang === 'en' && name.text.toLowerCase() === self.BasicListName;
                                                    });
                                                    if (checkBasicLists.length) {
                                                        basicAngle = angle;
                                                        basicDisplay = display;
                                                        return false;
                                                    }
                                                }
                                            });
                                        })
                                        .always(function () {
                                            getAngleWithBasicList();
                                        });
                                }
                                else {
                                    getAngleWithBasicList();
                                }
                            }
                            else {
                                isDoneAllRequest = true;
                            }
                        };

                        getAngleWithBasicList();

                        var deferred = jQuery.Deferred();
                        fnCheckGetBasicList = setInterval(function () {
                            if (isDoneAllRequest) {
                                clearInterval(fnCheckGetBasicList);
                                deferred.resolve(basicAngle, basicDisplay);
                            }
                        }, 10);
                        return deferred.promise();
                    }

                    return jQuery.when(null);
                })
                .then(function (basicAngle, basicDisplay) {
                    if (basicAngle && basicDisplay) {
                        displayFields = jQuery.grep(basicDisplay.fields, function (field) { return field.valid !== false && !field.denied; });

                        return angleInfoModel.LoadMetadata(basicAngle, basicDisplay, true)
                            .then(function () {
                                return jQuery.when(displayFields);
                            });
                    }
                    else {
                        return jQuery.when(displayFields);
                    }
                });
        }
        else {
            return jQuery.when(displayFields);
        }
    };
    /* EOF: M4-12612: Use basic list for 'Create new list display' */

    self.GenerateDefaultField = function (loadMetadata, queryFieldUri, includeSuggestedFields) {
        if (typeof loadMetadata !== 'boolean')
            loadMetadata = true;

        var defaultFields = [];
        if (!queryFieldUri && resultModel.Data() && resultModel.Data().query_fields) {
            queryFieldUri = resultModel.Data().query_fields;
        }

        if (queryFieldUri) {
            return jQuery.when(
                    // get default field info from AS (ID, ObjectType)
                    modelFieldsHandler.LoadDefaultFields(queryFieldUri),

                    // M4-34474: response fake result if not includeSuggestedFields
                    includeSuggestedFields ? modelFieldsHandler.LoadSuggestedFields(queryFieldUri) : [{ fields: [] }]
                )
                .then(function (defaultField, suggesFields) {
                    var fields = jQuery.merge(defaultField[0].fields, suggesFields[0].fields);
                    var fieldsMetadata = [];

                    modelFieldsHandler.SetFields(fields);

                    jQuery.each(fields, function (index, field) {
                        if (!defaultFields.hasObject('field', field.id)) {
                            defaultFields.push({
                                field: field.id,
                                field_details: JSON.stringify(self.GetFieldSettings()),
                                valid: true
                            });

                            if (loadMetadata) {
                                fieldsMetadata.push(field);
                            }

                            if (defaultFields.length >= 10) {
                                return false;
                            }
                        }
                    });

                    return modelFieldsHandler.LoadFieldsMetadata(fieldsMetadata)
                        .then(function () {
                            return jQuery.when(defaultFields);
                        });
                });
        }
        else {
            return jQuery.when(defaultFields);
        }
    };
    self.SetTemporaryDisplay = function (display, value) {
        var data = self.TemporaryDisplay() || {};
        if (value === null) {
            angleInfoModel.Data().display_definitions.removeObject('uri', display);
            angleInfoModel.Data.commit();
            delete data[display];
        }
        else {
            data[display] = value || {};

            // save historyModel for the created display
            if (typeof historyModel !== 'undefined') {
                historyModel.Set(display + historyModel.OriginalVersionSuffix, data[display]);
                historyModel.Set(display, data[display]);
            }
        }

        self.TemporaryDisplay(data);
        jQuery.localStorage(self.TemporaryDisplayName, data);
    };
    self.GetTemporaryDisplay = function (display) {
        var data = self.TemporaryDisplay();

        return historyModel.Data()[display] || (data != null ? (data[display] || null) : null);
    };
    self.GetTemporaryDisplayType = function () {
        return self.IsNewDisplay() ? WC.HtmlHelper.DropdownList('#tempDisplayType').value() : self.Data().display_type;
    };
    self.DeleteTemporaryDisplay = function (display, redirectDisplayUri) {
        self.SetTemporaryDisplay(display, null);

        if (typeof redirectDisplayUri !== 'undefined') {
            window.location.replace(WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, redirectDisplayUri));
        }
    };
    self.GotoTemporaryDisplay = function (display, query, isOpenNewWindow) {
        var angle = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
        if (display.indexOf(angle) === -1) {
            angle = display.substr(0, display.indexOf('/displays'));
        }

        var redirectUrl = WC.Utility.GetAnglePageUri(angle, display, query);
        if (isOpenNewWindow) {
            WC.Utility.OpenUrlNewWindow(redirectUrl);
        }
        else {
            location.href = WC.Utility.GetAnglePageUri(angle, display, query);
        }
    };
    self.IsDisplayWithoutUri = function (displayUri) {
        var displayTypeFromSearchPage = [];
        jQuery.each(enumHandlers.DISPLAYTYPE_EXTRA, function (type, value) {
            displayTypeFromSearchPage.push(value);
        });
        return jQuery.inArray(displayUri, displayTypeFromSearchPage) !== -1;
    };
    self.IsTemporaryDisplay = function (displayUri) {
        if (typeof displayUri === 'undefined') {
            displayUri = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        }

        if (self.IsDisplayWithoutUri(displayUri)) {
            return false;
        }
        else {
            return typeof displayUri !== 'undefined' && isNaN(displayUri.substr(displayUri.lastIndexOf('/') + 1));
        }
    };
    self.GetDisplayDetails = function (handler) {
        var displayDetails;
        if (self.Data().display_type === enumHandlers.DISPLAYTYPE.LIST) {
            displayDetails = WC.Utility.ParseJSON(self.Data().display_details);
        }
        else if (self.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            displayDetails = (handler || pivotPageHandler).GetPivotDisplayDetails();
        }
        else if (self.Data().display_type === enumHandlers.DISPLAYTYPE.CHART) {
            displayDetails = (handler || chartHandler).GetDisplayDetails();
        }

        return displayDetails || {};
    };
    self.GetFieldSettings = function (currentField) {
        return WC.Utility.ParseJSON(currentField ? currentField.field_details : null, { width: 120 });
    };
    self.SetFieldSettings = function (data) {
        return JSON.stringify(data);
    };
    self.GetCellDrillDownValue = function (cellDetails) {
        return cellDetails.FieldValue;
    };
    self.CreateDrilldown = function (rowDetails, columnDetails, handler) {
        requestHistoryModel.SaveLastExecute(self, self.CreateDrilldown, arguments);

        var isDashboardDrilldown = handler.DashBoardMode();
        if (!isDashboardDrilldown) {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DrillingDown, false);
            anglePageHandler.DisableProgressbarCancelling = true;
            progressbarModel.SetDisableProgressBar();

            // keep history before going to drilldown
            historyModel.Save();
            anglePageHandler.KeepHistory = false;
        }

        var displayDetails = self.GetDisplayDetails(handler);
        var fieldSettings = handler.FieldSettings;
        var fields = fieldSettings.GetFields();
        var querySteps = [];
        var queryStepsForDrillDown = [];
        var drilldownFields = [];
        var isPivot = fieldSettings.DisplayType === fieldSettings.ComponentType.PIVOT;

        jQuery.each(handler.Models.DisplayQueryBlock.GetQueryStepByNotInType(enumHandlers.FILTERTYPE.AGGREGATION), function (index, step) {
            querySteps.push(step);
        });

        var fieldIdName = isPivot ? 'FieldName' : 'Caption';
        jQuery.each(rowDetails, function (index, rowDetail) {
            var field = fields.findObject(fieldIdName, rowDetail.FieldName);
            if (field) {
                var fieldValue = self.GetCellDrillDownValue(rowDetail);
                var tempValue = self.GenerateDrilldownQueryStep(fieldSettings, field.Bucket, rowDetail.FieldName, fieldValue);
                querySteps.push(tempValue);
                queryStepsForDrillDown.push(tempValue);
                drilldownFields.push(self.GenerateDrilldownField(field, handler.Models.Angle.Data().model));
            }
        });

        jQuery.each(columnDetails, function (index, columnDetail) {
            var field = fields.findObject(fieldIdName, columnDetail.FieldName);
            if (field) {
                var fieldValue = self.GetCellDrillDownValue(columnDetail);
                var tempValue = self.GenerateDrilldownQueryStep(fieldSettings, field.Bucket, columnDetail.FieldName, fieldValue);
                querySteps.push(tempValue);
                queryStepsForDrillDown.push(tempValue);
                drilldownFields.push(self.GenerateDrilldownField(field, handler.Models.Angle.Data().model));
            }
        });

        var drillDownQueryBlock = [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: querySteps
        }];
        if (!querySteps.length) {
            drillDownQueryBlock = null;
            displayQueryBlockModel.QuerySteps([]);
        }

        var drillDownDisplay = handler.Models.Angle.Data().display_definitions.findObject('id', displayDetails.drilldown_display);
        if (displayDetails.drilldown_display && drillDownDisplay) {
            var angleData = handler.Models.Angle.Data();
            jQuery.when(self.AdhocDrilldown(querySteps, drillDownDisplay, isDashboardDrilldown, angleData, false, angleData.model))
                .done(function () {
                    if (!isDashboardDrilldown) {
                        progressbarModel.KeepCancelFunction = true;
                    }
                });
        }
        else {
            var option = {};
            if (!queryStepsForDrillDown.length) {
                option.useExecuteStep = true;
                option.customExecuteStep = [
                    {
                        step_type: 'filter',
                        field: 'ObjectType',
                        operator: 'not_equal_to',
                        arguments: [
                            WC.WidgetFilterHelper.ArgumentObject('please_ignore_this_filter', enumHandlers.FILTERARGUMENTTYPE.VALUE)
                        ]
                    }
                ];
            }
            else {
                option.useExecuteStep = true;
                option.customExecuteStep = queryStepsForDrillDown;
            }

            var postResult = function () {
                if (isDashboardDrilldown) {
                    jQuery(handler.Container).busyIndicator(true);
                    return jQuery.when(handler.Models.Result.PostExecutionSteps(option.customExecuteStep))
                        .then(function (response) {
                            resultModel.LoadSuccess(response);
                            resultModel.CustomProgressbar = function () { };
                            return resultModel.GetResult(response.uri);
                        });
                }
                else {
                    progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_PostResult);

                    return jQuery.when(handler.Models.Result.PostResult(option))
                        .then(function (response) {
                            return resultModel.GetResult(response.uri);
                        });
                }
            };

            var resultData = null;
            var display = self.GenerateDefaultData(enumHandlers.DISPLAYTYPE.LIST);
            if (isDashboardDrilldown) {
                self.DisplayInfo.Displays([{ Name: self.Name() || handler.Models.Display.Data().name }]);
            }
            display.multi_lang_name[0].text = self.GetAdhocDisplayName(self.Name() || handler.Models.Display.Data().name);
            display.multi_lang_description[0].text = '';
            display.is_angle_default = false;
            display.user_specific.is_user_default = false;

            return postResult()
                .then(function (response) {
                    if (jQuery.isArray(response)) {
                        resultData = response[0];
                    }
                    else {
                        resultData = response;
                    }
                    return self.GetDefaultListFields(resultData, !isDashboardDrilldown);
                })
                .done(function (fields) {
                    jQuery.each(drilldownFields, function (index, field) {
                        // clean drilldown field_details
                        var fieldDetails = WC.Utility.ParseJSON(field.field_details);
                        delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.PIVOTAREA];
                        delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.SORTING];
                        field.field_details = JSON.stringify(fieldDetails);

                        if (!fields.hasObject('field', field.field)) {
                            fields.push(field);
                        }
                    });

                    display.fields = fields;
                    display.query_blocks = !querySteps.length ? [] : drillDownQueryBlock;
                    display.KeepFilter = self.KeepFilter();

                    jQuery.when(self.CreateTempDisplay(enumHandlers.DISPLAYTYPE.LIST, display, handler.Models.Angle.Data()))
                        .done(function (data) {
                            if (!isDashboardDrilldown) {
                                progressbarModel.KeepCancelFunction = true;

                                // initial data for drilldown
                                self.LoadSuccess(data);
                                resultModel.LoadSuccess(resultModel.Data());

                                // save history
                                data.results = ko.toJS(resultModel.Data());
                                historyModel.Set(data.uri + historyModel.OriginalVersionSuffix, data);
                                historyModel.Set(data.uri, data);

                                // clean chart
                                if (jQuery('#ChartWrapper').length) {
                                    var chart;
                                    jQuery('#ChartWrapper .k-chart').each(function () {
                                        chart = jQuery(this).data(enumHandlers.KENDOUITYPE.CHART) || jQuery(this).data(enumHandlers.KENDOUITYPE.RADIALGAUGE);
                                        if (chart) {
                                            chart.destroy();
                                        }
                                    });
                                }
                            }

                            // redirect to display
                            var query = {};
                            query[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
                            self.GotoTemporaryDisplay(data.uri, query, isDashboardDrilldown);
                        });
                })
                .always(function () {
                    if (isDashboardDrilldown) {
                        jQuery(handler.Container).busyIndicator(false);
                    }
                });
        }
    };

    self.CleanNotAcceptedExecutionParameter = function (queryBlocks, modelUri) {
        if (queryBlocks && queryBlocks.length) {
            var newFiltersQuerySteps = [];
            jQuery.each(queryBlocks[0].query_steps, function (index, filterItem) {
                if (filterItem.step_type === enumHandlers.FILTERTYPE.FILTER) {
                    var validationParameterResult = validationHandler.CheckValidExecutionParameters([filterItem], modelUri);
                    if (validationParameterResult.IsAllValidArgument)
                        newFiltersQuerySteps.push(filterItem);
                }
                else {
                    newFiltersQuerySteps.push(filterItem);
                }
            });
            queryBlocks[0].query_steps = newFiltersQuerySteps;
            return queryBlocks;
        }
        else {
            return queryBlocks;
        }

    };
    self.CleanNotAffectPostNewResultFieldProperties = function (fields) {
        var fieldsWithoutFormat = [];
        if (fields && fields.length) {
            fields = WC.ModelHelper.RemoveReadOnlyFields(fields);
            jQuery.each(fields, function (index, field) {
                var fieldDetailObject = WC.Utility.ParseJSON(field.field_details);
                jQuery.each(fieldDetailObject, function (key) {
                    if (key !== enumHandlers.FIELDDETAILPROPERTIES.PIVOTAREA) {
                        delete fieldDetailObject[key];
                    }
                });
                field.field_details = JSON.stringify(fieldDetailObject);

                delete field.multi_lang_alias;
                fieldsWithoutFormat.push(field);
            });
        }
        return fieldsWithoutFormat;
    };
    self.AdhocDrilldown = function (querySteps, switchDisplay, isDashboardDrilldown, angleData, keepDisplayFilters, modelUri) {
        switchDisplay = ko.toJS(switchDisplay);

        // set new name
        self.SetSwitchDisplayName(switchDisplay, isDashboardDrilldown);

        // get query steps of current display
        var currentDisplayFilters = self.GetCurrentDisplayQuerySteps(querySteps, isDashboardDrilldown);

        // get query steps of switching display
        var switchDisplayQuerySteps = (switchDisplay.query_blocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) || { query_steps: [] }).query_steps;
        var newSwitchDisplayQuerySteps = self.GetSwitchDisplayQuerySteps(currentDisplayFilters, switchDisplayQuerySteps, keepDisplayFilters);
        var newSwitchDisplayQueryBlock = [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: newSwitchDisplayQuerySteps
        }];

        // turn off keep filter if there are jump
        if (!isDashboardDrilldown && displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.FOLLOWUP, newSwitchDisplayQuerySteps).length)
            self.KeepFilter(false);

        var angleUri = switchDisplay.uri.substr(0, switchDisplay.uri.indexOf('/displays'));
        switchDisplay.query_blocks = self.CleanNotAcceptedExecutionParameter(newSwitchDisplayQueryBlock, modelUri);
        switchDisplay.KeepFilter = self.KeepFilter();
        delete switchDisplay.id;
        delete switchDisplay.uri;
        delete switchDisplay.is_angle_default;
        if (switchDisplay.user_specific)
            delete switchDisplay.user_specific.is_user_default;
        delete switchDisplay.is_public;
        delete switchDisplay.authorizations;
        delete switchDisplay.results;
        return jQuery.when(self.CreateTempDisplay(switchDisplay.display_type, switchDisplay, angleData))
            .then(function (data) {
                if (isDashboardDrilldown) {
                    data.uri = angleUri + data.uri.substr(data.uri.indexOf('/displays'));
                    return jQuery.when(data);
                }
                else {
                    return self.GetAllFields(data)
                        .then(function () {
                            return jQuery.when(data);
                        });
                }
            })
            .done(function (data) {
                if (!isDashboardDrilldown) {
                    historyModel.Set(data.uri, data);

                    // clean chart
                    jQuery('#ChartWrapper .k-chart').each(function () {
                        var chart = jQuery(this).data(enumHandlers.KENDOUITYPE.CHART) || jQuery(this).data(enumHandlers.KENDOUITYPE.RADIALGAUGE);
                        if (chart)
                            chart.destroy();
                    });
                }

                // M4-30757: SD-17.92361 Drilldown to chart (line graph) does not work correct [CustCOM]
                // - clear field setting when drilldown to other display
                fieldSettingsHandler.Handler = null;

                // redirect to display
                var query = {};
                query[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
                self.GotoTemporaryDisplay(data.uri, query, isDashboardDrilldown);
            });
    };
    self.SetSwitchDisplayName = function (switchDisplay, isDashboardDrilldown) {
        // set multilang if need
        if (isDashboardDrilldown) {
            var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
            if (!(switchDisplay.multi_lang_name instanceof Array)) {
                switchDisplay.multi_lang_name = [{
                    lang: defaultLanguage,
                    text: switchDisplay.name || Localization.DefaultDisplayListName
                }];
                delete switchDisplay.name;
            }
            if (!(switchDisplay.multi_lang_description instanceof Array)) {
                switchDisplay.multi_lang_description = [{
                    lang: defaultLanguage,
                    text: WC.Utility.ToString(switchDisplay.description)
                }];
                delete switchDisplay.description;
            }
            if (!self.DisplayInfo.Displays().length) {
                jQuery.each(switchDisplay.multi_lang_name, function (index, name) {
                    self.DisplayInfo.Displays.push({ Name: name.text });
                });
            }
        }

        // get new name
        var nameText = WC.Utility.GetDefaultMultiLangText(switchDisplay.multi_lang_name);
        var name = self.GetAdhocDisplayName(nameText);

        // set new name
        jQuery.each(switchDisplay.multi_lang_name, function (index) {
            switchDisplay.multi_lang_name[index].text = name;
        });
    };
    self.GetCurrentDisplayQuerySteps = function (querySteps, isDashboardDrilldown) {
        // collect filter and jump
        var newQuerySteps = [];
        jQuery.each(querySteps, function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                newQuerySteps.push({
                    step_type: queryStep.step_type,
                    field: queryStep.field,
                    operator: queryStep.operator,
                    arguments: queryStep.arguments
                });
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                newQuerySteps.push({
                    step_type: queryStep.step_type,
                    followup: queryStep.followup
                });
            }
        });

        // clean properties
        jQuery.each(newQuerySteps, function (index, step) {
            step.is_adhoc_filter = true;
            step.is_execution_parameter = WC.Utility.ToBoolean(step.is_execution_parameter);
            step.execution_parameter_id = WC.Utility.ToString(self.execution_parameter_id);
        });
        
        /* BOF: M4-11731: Check if keep filter from list drilldown add query steps to current display */
        if (!isDashboardDrilldown && typeof WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) !== 'undefined' && self.KeepFilter()) {
            var listDrillDown = JSON.parse(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN));
            jQuery.each(listDrillDown, function (key, value) {
                newQuerySteps.push({
                    step_type: enumHandlers.FILTERTYPE.FILTER,
                    field: key,
                    operator: enumHandlers.OPERATOR.EQUALTO.Value,
                    arguments: [WC.WidgetFilterHelper.ArgumentObject(value, enumHandlers.FILTERARGUMENTTYPE.VALUE)],
                    is_adhoc_filter: true,
                    is_execution_parameter: false,
                    execution_parameter_id: ''
                });
            });
        }
        /* EOF: M4-11731: Check if keep filter from list drilldown add query steps to current display */

        return newQuerySteps;
    };
    self.GetSwitchDisplayQuerySteps = function (currentDisplayFilters, switchDisplayQuerySteps, keepDisplayFilters) {
        // collect query steps from switching display
        var switchDisplayWithoutAggration = displayQueryBlockModel.GetQueryStepByNotInType(enumHandlers.FILTERTYPE.AGGREGATION, switchDisplayQuerySteps);
        var switchDisplayWithAggrations = displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.AGGREGATION, switchDisplayQuerySteps);
        var switchDisplaySorts = displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.SORTING, switchDisplayQuerySteps);

        // clean properties
        jQuery.each(switchDisplayWithoutAggration, function (index, step) {
            step.is_adhoc_filter = true;
            step.is_execution_parameter = WC.Utility.ToBoolean(step.is_execution_parameter);
            step.execution_parameter_id = WC.Utility.ToString(self.execution_parameter_id);
        });

        var switchDisplayFilters = keepDisplayFilters ? switchDisplayWithoutAggration : switchDisplaySorts;
        var querySteps = currentDisplayFilters.concat(switchDisplayFilters);

        // add aggregation query step
        if (switchDisplayWithAggrations.length)
            querySteps.push(switchDisplayWithAggrations[0]);

        return querySteps;
    };
    self.GetAdhocDisplayName = function (name) {
        name = name.replace(/ ?\(\d+\)$/, '');

        var modelName;
        var number = 0;
        var nameNumber;
        jQuery.each(ko.toJS(self.DisplayInfo.Displays()), function (index, model) {
            modelName = model.Name.replace(/ ?\(\d+\)$/, '');
            if (modelName === name) {
                nameNumber = /\(\d+\)$/.test(model.Name) ? +model.Name.substr(model.Name.lastIndexOf('(') + 1).replace(')', '') + 1 : number;
                if (nameNumber > number || nameNumber === 0) {
                    number = nameNumber || 1;
                }
            }
        });
        if (number !== 0) {
            name += ' (' + number + ')';
        }

        return name;
    };
    self.GetPivotFields = function () {
        var updatedFields, fieldSettings, fieldSettingObject,
            displayArea, displayField, displayFieldDetail;

        fieldSettings = fieldSettingsHandler.Handler ? fieldSettingsHandler.Handler.FieldSettings : null;
        if (!fieldSettings) {
            return self.Data().fields;
        }

        updatedFields = [];
        fieldSettingObject = JSON.parse(fieldSettings.Fields);

        jQuery.each(fieldSettingObject, function (index, fieldSettingElement) {
            if (fieldSettingElement.IsSelected) {
                displayField = self.GetDisplayFieldByFieldName(fieldSettingElement.FieldName);
                displayArea = fieldSettingsHandler.GetAreaById(fieldSettingElement.Area);

                if (displayField === null) {

                    var fieldDetails = !IsNullOrEmpty(fieldSettingElement.FieldDetails) ? fieldSettingElement.FieldDetails : JSON.stringify({ pivot_area: displayArea });

                    updatedFields.push({
                        field: fieldSettingElement.FieldName,
                        field_details: fieldDetails
                    });
                }
                else {

                    if (!IsNullOrEmpty(fieldSettingElement.FieldDetails)) {

                        displayFieldDetail = {};

                        if (fieldSettingElement.FieldDetails === "{}") {
                            jQuery.extend(displayFieldDetail, { pivot_area: displayArea });
                            fieldSettingElement.FieldDetails = JSON.stringify(displayFieldDetail);
                        }

                        jQuery.extend(displayFieldDetail, JSON.parse(fieldSettingElement.FieldDetails));

                        displayField.field_details = JSON.stringify(displayFieldDetail);

                    }
                    else {
                        displayFieldDetail = WC.Utility.ParseJSON(displayField.field_details);

                        jQuery.extend(displayFieldDetail, { pivot_area: displayArea });

                        displayField.field_details = JSON.stringify(displayFieldDetail);
                    }

                    updatedFields.push(displayField);
                }
            }
        });
        return updatedFields;
    };
    self.GetDisplayFieldByFieldName = function (fieldName) {
        return WC.Utility.ToArray(self.Data().fields).findObject('field', fieldName, false);
    };
    self.GetAllFields = function (display) {
        var tempFields = [];

        if (display) {
            var displayMetadata = WC.ModelHelper.GetAllMetadata(display);
            jQuery.merge(tempFields, displayMetadata.fields);
        }

        tempFields = tempFields.distinct();

        var request = modelsHandler.GetQueryFieldsUri(resultModel.Data(), angleInfoModel.Data(), true);
        return modelFieldsHandler.LoadFieldsByIds(request, tempFields)
            .then(function (data) {
                return jQuery.when(data.fields);
            });
    };
    self.DeleteReadOnlyDisplayProperties = function (displayData) {
        return WC.ModelHelper.RemoveReadOnlyDisplayData(displayData);
    };
    self.UpdateAuthorization = function (authorization) {
        self.Data().authorizations = jQuery.extend(self.Data().authorizations, authorization);
        self.CommitAll();
    };
    self.GetDefaultAdhocAuthorization = function (angle) {
        return {
            'update_user_specific': true,
            'delete': false,
            'make_angle_default': !(angle || angleInfoModel.Data() || {}).is_published,
            'publish': false,
            'unpublish': false,

            // M4-11512: If ad-hoc display and user no had save display privilege update will be false
            'update': userModel.CanSaveDisplays((angle || angleInfoModel.Data()).model)
        };
    };
    self.ConvertPivotBucketToOperator = function (bucket, fieldType, value) {
        var operator;

        if (bucket === 'individual' && (jQuery.inArray(fieldType, [enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.PERCENTAGE]) === -1)) {
            operator = enumHandlers.OPERATOR.EQUALTO.Value;
        }
        else {
            switch (fieldType) {
                case enumHandlers.FIELDTYPE.TEXT:
                case enumHandlers.FIELDTYPE.ENUM:
                    if (bucket.substr(0, 4) === 'left') {
                        var parameterLength = parseInt(bucket.replace('left', ''));
                        if (value.length < parameterLength)
                            operator = enumHandlers.OPERATOR.EQUALTO.Value;
                        else
                            operator = enumHandlers.OPERATOR.STARTWITH.Value;
                    }
                    else
                        operator = enumHandlers.OPERATOR.ENDON.Value;
                    break;
                case enumHandlers.FIELDTYPE.INTEGER:
                case enumHandlers.FIELDTYPE.NUMBER:
                case enumHandlers.FIELDTYPE.DOUBLE:
                case enumHandlers.FIELDTYPE.CURRENCY:
                case enumHandlers.FIELDTYPE.PERCENTAGE:
                case enumHandlers.FIELDTYPE.DATE:
                case enumHandlers.FIELDTYPE.DATETIME:
                case enumHandlers.FIELDTYPE.PERIOD:
                case enumHandlers.FIELDTYPE.TIME:
                case enumHandlers.FIELDTYPE.TIMESPAN:
                    operator = enumHandlers.OPERATOR.BETWEEN.Value;
                    break;
                default:
                    operator = enumHandlers.OPERATOR.EQUALTO.Value;
                    break;
            }
        }
        return operator;
    };
    self.CalculateBucketSize = function (bucket, fieldType, value) {
        var bucketSize = 0;
        if (bucket !== 'individual') {
            switch (fieldType) {
                case enumHandlers.FIELDTYPE.INTEGER:
                case enumHandlers.FIELDTYPE.NUMBER:
                case enumHandlers.FIELDTYPE.DOUBLE:
                case enumHandlers.FIELDTYPE.CURRENCY:
                    bucketSize = self.GetNumberBuckerSize(bucket);
                    break;
                case enumHandlers.FIELDTYPE.PERCENTAGE:
                    var bucketValue = self.GetNumberBuckerSize(bucket);
                    bucketSize = WC.FormatHelper.PercentagesToNumber(bucketValue);
                    break;
                case enumHandlers.FIELDTYPE.PERIOD:
                    bucketSize = self.GetPeriodBucketSize(bucket, value);
                    break;
                case enumHandlers.FIELDTYPE.DATE:
                case enumHandlers.FIELDTYPE.DATETIME:
                    bucketSize = self.GetDateBucketSize(bucket, value);
                    break;
                case enumHandlers.FIELDTYPE.TIME:
                    bucketSize = self.GetTimeBucketSize(value);
                    break;
                case enumHandlers.FIELDTYPE.TIMESPAN:
                    bucketSize = self.GetTimeSpanBucketSize(bucket);
                    break;
                default:
                    break;
            }
        }
        else {
            switch (fieldType) {
                case enumHandlers.FIELDTYPE.DOUBLE:
                case enumHandlers.FIELDTYPE.CURRENCY:
                case enumHandlers.FIELDTYPE.PERCENTAGE:
                    bucketSize = 1;
                    break;
                default:
                    break;
            }
        }

        return bucketSize;
    };
    self.GetNumberBuckerSize = function (bucket) {
        return dataTypeModel.GetPowerBucketSize(bucket);
    };
    self.GetPeriodBucketSize = function (bucket, value) {
        var bucketSize;
        value = parseInt(value);
        switch (bucket) {
            case 'day':
                bucketSize = value + 1;
                break;
            case 'week':
                bucketSize = value + 7;
                break;
            case 'month':
                bucketSize = value + 30;
                break;
            case 'quarter':
                bucketSize = value + 91;
                break;
            case 'trimester':
                bucketSize = value + 121;
                break;
            case 'semester':
                bucketSize = value + 182;
                break;
            case 'year':
                bucketSize = value + 365;
                break;
            default:
                bucketSize = 0;
                break;
        }
        return bucketSize;
    };
    self.GetDateBucketSize = function (bucket, value) {
        var tempDate = new Date(value);

        switch (bucket) {
            case 'day':
                tempDate.setDate(tempDate.getDate() + 1);
                break;
            case 'week':
                tempDate.setDate(tempDate.getDate() + 7);
                break;
            case 'month':
                tempDate.setMonth(tempDate.getMonth() + 1);
                break;
            case 'quarter':
                tempDate.setMonth(tempDate.getMonth() + 3);
                break;
            case 'trimester':
                tempDate.setMonth(tempDate.getMonth() + 4);
                break;
            case 'semester':
                tempDate.setMonth(tempDate.getMonth() + 6);
                break;
            case 'year':
                tempDate.setFullYear(tempDate.getFullYear() + 1);
                break;
            default:
                break;
        }

        return WC.DateHelper.LocalDateToUnixTime(tempDate, false);
    };
    self.GetTimeBucketSize = function (value) {
        var bucketSize = 3600;
        if (bucketSize + value >= 86400)
            bucketSize = 86400 - value - 1;
        return Math.max(0, bucketSize);
    };
    self.GetTimeSpanBucketSize = function (bucket) {
        var bucketSize = 0;
        switch (bucket) {
            case 'hour':
                bucketSize = 1 / 24;
                break;
            case 'day':
                bucketSize = 1;
                break;
            case 'week':
                bucketSize = 7;
                break;
            case 'month':
                bucketSize = 30.43685;
                break;
            case 'quarter':
                bucketSize = 91.31055;
                break;
            case 'trimester':
                bucketSize = 121.7474;
                break;
            case 'semester':
                bucketSize = 182.6211;
                break;
            case 'year':
                bucketSize = 365.2422;
                break;
            default:
                break;
        }
        return bucketSize;
    };
    self.ConvertPivotCellValue = function (value, fieldType, operator) {
        var result = value;

        if (!IsNullOrEmpty(value)) {
            switch (fieldType) {
                case enumHandlers.FIELDTYPE.DATE:
                case enumHandlers.FIELDTYPE.DATETIME:
                    if (typeof value === 'string') {
                        var tempValues = value.replace(/\,/g, '').split(' ');
                        value = jQuery.parseDate(tempValues[1].toString() + ' ' + tempValues[0].toString() + ' ' + tempValues[2].toString(), 'dd MMMM yyyy', userCulture);
                        result = WC.DateHelper.LocalDateToUnixTime(value, false);
                    }
                    else if (typeof value === 'object' && !IsNullOrEmpty(value)) {
                        result = WC.DateHelper.LocalDateToUnixTime(value, false);
                    }
                    break;
                case enumHandlers.FIELDTYPE.NUMBER:
                case enumHandlers.FIELDTYPE.INTEGER:
                case enumHandlers.FIELDTYPE.PERIOD:
                case enumHandlers.FIELDTYPE.TIME:
                case enumHandlers.FIELDTYPE.TIMESPAN:
                case enumHandlers.FIELDTYPE.DOUBLE:
                case enumHandlers.FIELDTYPE.CURRENCY:
                case enumHandlers.FIELDTYPE.PERCENTAGE:
                    result = parseFloat(value);
                    break;
                case enumHandlers.FIELDTYPE.BOOLEAN:
                    result = value.toString().toLowerCase() === 'true' ? true : false;
                    break;
                default:
                    break;
            }
        }

        return result;
    };
    self.GetDrilldownQueryStepOperator = function (value, fieldType, operator, domainUri) {
        if (value === null) {
            return fieldType === enumHandlers.FIELDTYPE.ENUM ? enumHandlers.OPERATOR.EQUALTO.Value : enumHandlers.OPERATOR.HASNOVALUE.Value;
        }
        else if (value === '' && fieldType === enumHandlers.FIELDTYPE.ENUM) {
            //exception case when domain field is empty
            return self.ConvertPivotBucketToOperator(operator, fieldType, value);
        }
        else {
            // if parameter shorter than bucket then use Id of domain element
            var displayValue = null;
            if (fieldType === enumHandlers.FIELDTYPE.TEXT && operator.substr(0, 4) === 'left') {
                var parameterLength = parseInt(operator.replace('left', ''));
                if (value.length < parameterLength) {
                    var fieldDomain = modelFieldDomainHandler.GetDomainElementById(domainUri, value);
                    if (fieldDomain) {
                        displayValue = value;
                        value = fieldDomain.id;
                    }
                    else {
                        fieldDomain = modelFieldDomainHandler.GetDomainElementByShortName(domainUri, value);
                        if (fieldDomain) {
                            displayValue = value;
                            value = fieldDomain.id;
                        }
                    }
                }
            }

            return self.ConvertPivotBucketToOperator(operator, fieldType, displayValue || value);
        }
    };
    self.GetDrilldownQueryStepArguments = function (operator, value, fieldType, bucketOperator, domainUri, isPivot) {
        var argumentValues;
        if (operator === enumHandlers.OPERATOR.HASNOVALUE.Value) {
            argumentValues = [];
        }
        else if (operator === enumHandlers.OPERATOR.BETWEEN.Value) {
            argumentValues = self.GetBetweenArgumentValues(value, fieldType, bucketOperator);
        }
        else if ((operator === enumHandlers.OPERATOR.EQUALTO.Value && fieldType === enumHandlers.FIELDTYPE.ENUM)
            || (operator === enumHandlers.OPERATOR.EQUALTO.Value && fieldType === enumHandlers.FIELDTYPE.BOOLEAN)) {
            if (isPivot || fieldType === enumHandlers.FIELDTYPE.BOOLEAN) {
                argumentValues = [WC.WidgetFilterHelper.ArgumentObject(self.ConvertPivotCellValue(value, fieldType, bucketOperator), enumHandlers.FILTERARGUMENTTYPE.VALUE)];
            }
            else {
                var element = modelFieldDomainHandler.GetDomainElementByName(domainUri, value);
                if (element) {
                    argumentValues = [WC.WidgetFilterHelper.ArgumentObject(element.id, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                }
                else {
                    argumentValues = [WC.WidgetFilterHelper.ArgumentObject(value, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                }
            }
        }
        else {
            argumentValues = [WC.WidgetFilterHelper.ArgumentObject(self.ConvertPivotCellValue(value, fieldType, bucketOperator), enumHandlers.FILTERARGUMENTTYPE.VALUE)];
        }

        return argumentValues;
    };
    self.GenerateDrilldownQueryStep = function (fieldSettings, bucket, fieldId, value) {
        var isPivot = fieldSettings.DisplayType === fieldSettings.ComponentType.PIVOT;
        var searchBy = isPivot ? 'FieldName' : 'Caption';
        var field = fieldSettings.GetFields().findObject(searchBy, fieldId);
        var operator = self.GetDrilldownQueryStepOperator(value, field.DataType, bucket.Operator, field.DomainURI);
        var argumentValue = self.GetDrilldownQueryStepArguments(operator, value, field.DataType, bucket.Operator, field.DomainURI, isPivot);

        var result = {
            step_type: enumHandlers.FILTERTYPE.FILTER,
            field: bucket.source_field,
            operator: operator,
            arguments: argumentValue,
            is_adhoc_filter: true
        };

        return result;
    };
    self.GetBetweenArgumentValues = function (value, fieldType, bucketOperator) {
        var upperBoundValue = 0;
        var upperBoundArgument = null;
        var lowerBoundValue = self.ConvertPivotCellValue(value, fieldType, bucketOperator);
        var lowerBoundArgument = WC.WidgetFilterHelper.ArgumentObject(lowerBoundValue, enumHandlers.FILTERARGUMENTTYPE.VALUE);
        var bucketValue = self.CalculateBucketSize(bucketOperator, fieldType, value);

        if (WC.FormatHelper.IsDateOrDateTime(fieldType) || fieldType === enumHandlers.FIELDTYPE.PERIOD) {
            // date, date-time and period already calculate upper bound value.
            upperBoundValue = bucketValue;
        }
        else {
            // other field type will be lower bound value + bucket size.
            upperBoundValue = lowerBoundValue + bucketValue;

            // prevent javascript float value bug.
            var decimalLength = self.CountDecimalFromArgumentValue(bucketValue);
            if (decimalLength) {
                upperBoundValue = parseFloat(upperBoundValue.toFixed(decimalLength));
            }
        }

        upperBoundArgument = WC.WidgetFilterHelper.ArgumentObject(upperBoundValue, enumHandlers.FILTERARGUMENTTYPE.VALUE);
        var argumentValues = [lowerBoundArgument, upperBoundArgument];
        return argumentValues;
    };
    self.CountDecimalFromArgumentValue = function (number) {
        var argumentValueSplitter = (number + '').split('.');
        return argumentValueSplitter.length === 2 ? parseInt(argumentValueSplitter[1].length, 10) : 0;
    };
    self.GenerateDrilldownField = function (field, modelUri) {
        var fieldId = field.Bucket.source_field;
        var displayField = {
            field: fieldId,
            field_details: field.FieldDetails || '{}',
            valid: true
        };
        var formatter = WC.FormatHelper.GetFieldFormatSettings(new FieldFormatter(displayField, modelUri), true);
        WC.FormatHelper.CleanFormatter(formatter);
        jQuery.extend(formatter, { width: 120 });

        displayField.field_details = JSON.stringify(formatter);

        return displayField;
    };
    //EOF: View model methods
    self.SelectKeepFilter = function () {
        self.Data().KeepFilter = jQuery('#KeepFilter').is(':checked');
        self.KeepFilter(jQuery('#KeepFilter').is(':checked'));

        return true;
    };

    self.CreateDisplayFromChartOrPivot = function (newDisplayType) {
        // check change before continue
        fieldSettingsHandler.ShowConfirmDiscardSetting(function () {
            historyModel.Save();

            var display = ko.toJS(self.Data());
            var newFields = [];
            display.query_blocks = ko.toJS(displayQueryBlockModel.CollectQueryBlocks());

            if (display.query_blocks.length) {
                var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
                var defalutFieldDetails = self.GetFieldSettings();
                var displayDetails = {};
                var aggrStep = display.query_blocks[0].query_steps.findObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION);

                if (newDisplayType === enumHandlers.DISPLAYTYPE.LIST) {
                    // chart or pivot -> list

                    jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
                        newFields.push({
                            field: fieldId,
                            field_details: JSON.stringify(defalutFieldDetails),
                            valid: true
                        });
                    });

                    var aggregationFields = aggrStep.grouping_fields.concat(aggrStep.aggregation_fields);
                    jQuery.each(aggregationFields, function (index, aggregation) {
                        if (aggregation.source_field && !newFields.hasObject('field', aggregation.source_field)) {
                            var displayField = display.fields.findObject('field', aggregation.field);
                            if (displayField) {
                                displayField.field = aggregation.source_field;
                            }
                            else {
                                displayField = { field: aggregation.source_field, valid: true };
                            }

                            var details = jQuery.extend(WC.Utility.ParseJSON(displayField.field_details), defalutFieldDetails);
                            jQuery.each(details, function (key) {

                                var fieldData = fieldSettingsHandler.FieldSettings.GetFields().findObject("FieldName", aggregation.field);
                                var fieldType = fieldData ? fieldData.DataType : '';

                                if ((key !== 'width' && key !== 'format' && key !== 'thousandseparator' && key !== 'prefix' && key !== 'decimals') || fieldType === enumHandlers.FIELDTYPE.PERIOD) {
                                    delete details[key];
                                }
                                if (key === 'prefix' && details[key] === 'N')
                                    details[key] = null;
                            });
                            details.width = self.GetFieldSettings().width;
                            displayField.field_details = JSON.stringify(details);

                            newFields.push(displayField);
                        }
                    });

                    // set new fields
                    display.fields = newFields;

                    // remove aggregation steps
                    display.query_blocks[0].query_steps.removeObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION);
                    if (!display.query_blocks[0].query_steps.length) {
                        display.query_blocks = [];
                    }
                }
                else if (newDisplayType === enumHandlers.DISPLAYTYPE.CHART) {
                    // pivot -> chart

                    var newAggregationFields = [];
                    var groupingFieldsCount = aggrStep.grouping_fields.length;
                    var rowAreaName = fieldSettingsHandler.GetAreaById(enumHandlers.FIELDSETTINGAREA.ROW);
                    var columnAreaName = fieldSettingsHandler.GetAreaById(enumHandlers.FIELDSETTINGAREA.COLUMN);

                    // set grouping_fields
                    var rowAreaFields = [];
                    var columnAreaFields = [];
                    jQuery.each(aggrStep.grouping_fields, function (index, grouping) {
                        var displayField = jQuery.extend({}, display.fields[index]);
                        var displayFieldDetails = JSON.parse(displayField.field_details);

                        if (displayFieldDetails.pivot_area === rowAreaName) {
                            // set to row area
                            rowAreaFields.push({
                                field: displayField,
                                grouping: grouping
                            });
                        }
                        else if (displayFieldDetails.pivot_area === columnAreaName) {
                            // set to column area
                            columnAreaFields.push({
                                field: displayField,
                                grouping: grouping
                            });
                        }
                    });

                    // use column as row
                    if (!rowAreaFields.length) {
                        rowAreaFields = columnAreaFields.splice(0, 1);

                        var displayFieldDetails = WC.Utility.ParseJSON(rowAreaFields[0].field.field_details);
                        displayFieldDetails.pivot_area = rowAreaName;
                        rowAreaFields[0].field.field_details = JSON.stringify(displayFieldDetails);
                    }
                    if (rowAreaFields.length > 1) {
                        rowAreaFields = [rowAreaFields[0]];
                    }
                    if (columnAreaFields.length > 1) {
                        columnAreaFields = [columnAreaFields[0]];
                    }

                    // set new field & grouping_fields
                    aggrStep.grouping_fields = [];
                    jQuery.each(rowAreaFields.concat(columnAreaFields), function (index, areaField) {

                        var displayDetails = WC.Utility.ParseJSON(areaField.field.field_details);
                        delete displayDetails.sorting;
                        areaField.field.field_details = JSON.stringify(displayDetails);

                        newFields.push(areaField.field);
                        aggrStep.grouping_fields.push(areaField.grouping);
                    });

                    // set aggregation_fields
                    jQuery.each(aggrStep.aggregation_fields, function (index, aggregation) {
                        if (index <= 1) {
                            // set to data area
                            newFields.push(jQuery.extend({}, display.fields[groupingFieldsCount + index]));
                            newAggregationFields.push(aggregation);
                        }
                        else {
                            // exit
                            return false;
                        }
                    });
                    aggrStep.aggregation_fields = newAggregationFields;

                    // set new fields
                    display.fields = newFields;

                    // chart display_details
                    displayDetails.chart_type = enumHandlers.CHARTTYPE.COLUMNCHART.Code;
                    if (newAggregationFields.length === 2) {
                        displayDetails.stack = false;
                        displayDetails.multi_axis = true;
                    }
                    else {
                        displayDetails.stack = true;
                        displayDetails.multi_axis = false;
                    }
                }
                else {
                    // chart -> pivot = do nothing
                }

                // set display_details
                display.display_details = JSON.stringify(displayDetails);

                // multi_lang_name
                display.multi_lang_name = [{
                    lang: defaultLanguage,
                    text: self.GetAdhocDisplayName('New ' + Localization['DisplayType_' + newDisplayType].toLowerCase())
                }];
                display.multi_lang_description = [];

                // created
                var currentUser = userModel.Data();
                display.created = {
                    user: currentUser.uri,
                    datetime: WC.DateHelper.GetCurrentUnixTime(),
                    full_name: currentUser.full_name
                };

                // remove unused data
                delete display.id;
                delete display.uri;
                delete display.display_type;
                delete display.user_specific;
                delete display.authorizations;
                delete display.is_angle_default;
                delete display.is_public;
                delete display.changed;
                delete display.results;
                delete display.uri_template;

                // create adhoc display
                jQuery.when(self.CreateTempDisplay(newDisplayType, display))
                    .done(function (data) {
                        // clean field settings
                        fieldSettingsHandler.ClearFieldSettings();

                        // redirect to display
                        self.GotoTemporaryDisplay(data.uri);
                    });
            }
        });
    };

    var storage = jQuery.localStorage(self.TemporaryDisplayName);
    if (storage != null) {
        self.TemporaryDisplay(storage);
    }
    if (typeof model !== 'undefined') {
        self.Data(model);
        self.Data.commit();
    }
}
