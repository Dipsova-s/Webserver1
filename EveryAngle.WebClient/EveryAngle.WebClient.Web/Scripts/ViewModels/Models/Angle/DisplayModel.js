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
    self.TemporaryDisplayName = 'temp_displays';
    self.TemporaryDisplay = ko.observable(null);
    self.DisplayId = ko.protectedObservable('');
    self.DisplayInfo = {
        Displays: ko.observableArray([])
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
        self.Name(WC.Utility.GetDefaultMultiLangText(data.multi_lang_name));
        self.Description(WC.Utility.GetDefaultMultiLangText(data.multi_lang_description));
        self.CommitAll();

        if (typeof displayQueryBlockModel !== 'undefined') {
            self.UpdateDisplayQuerySteps(data);
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
        if (jQuery.storageWatcher(watcherPublicationKey) !== null) {
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
        self.Name.commit();
        self.Description.commit();
        self.DisplayId.commit();
    };
    self.ResetAll = function () {
        self.Data.reset();
        self.IsDefault.reset();
        self.Name.commit();
        self.Description.reset();
        self.DisplayId.reset();
    };
    self.UpdateDisplay = function (uri, updateDisplay, isForced) {
        //remove readonly properties
        updateDisplay = self.DeleteReadOnlyDisplayProperties(updateDisplay);

        // check is_angle_default
        var setAngleDefaultDisplay = updateDisplay.is_angle_default;
        delete updateDisplay.is_angle_default;

        // check is_public
        var isPublic = updateDisplay.is_public;
        delete updateDisplay.is_public;

        var updateState = function (isPublic) {
            if (typeof isPublic === 'boolean') {
                return self.UpdateState(self.Data().state, { is_published: isPublic }, isForced)
                    .then(function () {
                        return angleInfoModel.LoadAngle(angleInfoModel.Data().uri);
                    });
            }
            else {
                return jQuery.when();
            }
        };
        return updateState(isPublic)
            .then(function () {
                return self.SendUpdateRequest(uri, updateDisplay, setAngleDefaultDisplay, isForced);
            });
    };
    self.SendUpdateRequest = function (uri, updateDisplay, setAngleDefaultDisplay, isForced) {
        var params = {};
        params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        params[enumHandlers.PARAMETERS.FORCED] = WC.Utility.ToBoolean(isForced);

        var saveDisplay = function () {
            var displayUri = uri + '?' + jQuery.param(params);
            return !jQuery.isEmptyObject(updateDisplay) ? UpdateDataToWebService(displayUri, updateDisplay) : jQuery.when(ko.toJS(self.Data()));
        };

        var updateGaugeDisplayDetails = function (display, model) {
            var displayDetails = WC.Utility.ParseJSON(display.display_details);
            if (display.uri !== model.uri && displayDetails && displayDetails.drilldown_display === model.id) {
                delete displayDetails.drilldown_display;
                return UpdateDataToWebService(display.uri + '?' + jQuery.param(params), { display_details: JSON.stringify(displayDetails) });
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

                            if (model.uri === display.uri) {
                                model.authorizations = responseDisplay.authorizations;
                            }
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
                if (setAngleDefaultDisplay) {
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
                    }

                    if (model.user_specific && model.user_specific.is_user_default && v.user_specific && v.user_specific.is_user_default) {
                        v.user_specific.is_user_default = false;
                    }
                }
            });

            angleInfoModel.Data().display_definitions[index] = model;
            angleInfoModel.SetData(angleInfoModel.Data());
        }
        self.LoadSuccess(model);
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
    self.UpdateAdhoc = function (_uri, data) {
        var newData = jQuery.extend({}, WC.ModelHelper.ExtendDisplayData(self.Data(), angleInfoModel.Data()), data);
        self.SetTemporaryDisplay(newData.uri, newData);
        self.LoadSuccess(newData);
        return jQuery.when(newData);
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
                
                // row field details
                var rowFieldDetails = {};
                rowFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA] = AggregationFieldViewModel.Area.Row;
                if (displayType === enumHandlers.DISPLAYTYPE.PIVOT) {
                    rowFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.SORTING] = AggregationFieldViewModel.Sorting.Ascending;
                }
                jQuery.extend(rowFieldDetails, fieldDetails);
                delete rowFieldDetails.width;

                // data field details
                var dataFieldDetails = {};
                dataFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA] = AggregationFieldViewModel.Area.Data;
                dataFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.SORTING] = AggregationFieldViewModel.Sorting.Unsorted;

                display.fields = [
                    {
                        field: defaultBucket + '_' + defaultField,
                        field_details: JSON.stringify(rowFieldDetails),
                        valid: true
                    },
                    {
                        field: enumHandlers.AGGREGATION.COUNT.Value,
                        field_details: JSON.stringify(dataFieldDetails),
                        valid: true
                    }
                ];
                break;

            default:
                break;
        }

        return display;
    };
    self.CreateDisplay = function (data) {
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
            .done(function (data) {
                angleInfoModel.Data().display_definitions.push(data);
                angleInfoModel.SetData(angleInfoModel.Data());
                self.LoadSuccess(data);
            });
    };
    self.CreateTempDisplay = function (displayType, displayObject, angleData) {
        angleData = angleData || angleInfoModel.Data() || {};
        var angleUri = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE) || angleData.uri || '';
        var newDisplay = jQuery.GUID();
        var display = {};
        display.id = 'd' + newDisplay.replace(/-/g, '');
        display.display_type = displayType || null;
        display.uri = angleUri + '/displays/' + newDisplay;
        display.is_angle_default = false;
        display.authorizations = self.GetDefaultAdhocAuthorization(angleData);

        jQuery.extend(display, displayObject);

        // ensure data
        delete display.used_in_task;
        delete display.uri_template;
        display.user_specific = {
            is_user_default: false,
            execute_on_login: false
        };
        display.is_public = false;
        display.is_adhoc = true;
        var currentUser = userModel.Data();
        display.created = {
            user: currentUser.uri,
            datetime: WC.DateHelper.GetCurrentUnixTime(),
            full_name: currentUser.full_name
        };

        // set temporary display to localStorage
        self.SetTemporaryDisplay(display.uri, display);

        // add angle in case temporary angle
        if (angleInfoModel.IsTemporaryAngle(angleUri)) {
            angleInfoModel.Data().display_definitions.push(display);
            angleInfoModel.SetData(angleInfoModel.Data());
        }

        return jQuery.when(display);
    };
    self.Copy = function (data) {
        // copy display from data and create it
        // @param data, display data object

        // remove unsafe properties
        delete data.id;

        // create copy display
        return self.CreateDisplay(data);
    };
    self.Delete = function (displayUri) {
        return DeleteDataToWebService(directoryHandler.ResolveDirectoryUri(displayUri));
    };
    self.ForcedDelete = function (displayUri) {
        var uri = displayUri + '?forced=true';
        return DeleteDataToWebService(directoryHandler.ResolveDirectoryUri(uri));
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
            // allow one adhoc Display
            data = {};
            data[display] = value || {};
        }

        self.TemporaryDisplay(data);
        jQuery.localStorage(self.TemporaryDisplayName, data);
    };
    self.DeleteTemporaryDisplay = function (display, redirectDisplayUri) {
        self.SetTemporaryDisplay(display, null);

        if (typeof redirectDisplayUri !== 'undefined') {
            var query = anglePageHandler.CreateAngleQuery([]);
            window.location.replace(WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, redirectDisplayUri, query));
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
            WC.Utility.RedirectUrl(redirectUrl);
        }
    };
    self.IsDisplayWithoutUri = function (displayUri) {
        return displayUri === enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT;
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
        var isDashboardDrilldown = handler.DashBoardMode();
        if (!isDashboardDrilldown) {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DrillingDown, false);
            progressbarModel.SetDisableProgressBar();
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.CancelFunction = function () {
                WC.Page.Stop();
                WC.Ajax.AbortAll();
            };
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

        if (isDashboardDrilldown) {
            var widgetElement = jQuery(handler.ElementId).closest('.widget-display-column');
            var dashboardFilters = dashboardPageHandler.GetExtendedFilters(widgetElement);
            jQuery.merge(querySteps, dashboardFilters);
        }

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
            query_steps: ko.toJS(querySteps)
        }];
        if (!querySteps.length) {
            drillDownQueryBlock = [];
            displayQueryBlockModel.QuerySteps([]);
        }

        var drillDownDisplay = handler.Models.Angle.Data().display_definitions.findObject('id', displayDetails.drilldown_display);
        if (displayDetails.drilldown_display && drillDownDisplay) {
            var angleData = handler.Models.Angle.Data();
            jQuery.when(self.AdhocDrilldown(querySteps, drillDownDisplay, isDashboardDrilldown, angleData, false, angleData.model));
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
                            resultModel.CustomProgressbar = jQuery.noop;
                            return resultModel.GetResult(response.uri);
                        });
                }
                else {
                    var displayHandler = anglePageHandler.HandlerDisplay.Clone();
                    displayHandler.SetPostExecutionSteps(option.customExecuteStep);
                    return displayHandler.PostResult()
                        .progress(function (data) {
                            var queuedMessage;
                            if (data.queue_position === 0) {
                                queuedMessage = Localization.ExecutingAngleMessage;
                            } else if (!data.queue_position) {
                                queuedMessage = '';
                            } else {
                                queuedMessage = kendo.format(data.queue_position === 1 ? Localization.FirstInQueueMessage : Localization.LaterInQueueMessage, data.queue_position);
                            }
                            progressbarModel.SetProgressBarTextAndMessage(kendo.toString(data.progress * 100, 'n2'), queuedMessage);
                            if (data.cancelable)
                                progressbarModel.SetEnableProgressBar();
                            else
                                progressbarModel.SetDisableProgressBar();
                        });
                }
            };

            var display = self.GenerateDefaultData(enumHandlers.DISPLAYTYPE.LIST);
            if (isDashboardDrilldown) {
                self.DisplayInfo.Displays([{ Name: self.Name() || handler.Models.Display.Data().name }]);
            }
            display.multi_lang_name[0].text = self.GetAdhocDisplayName(self.Name() || handler.Models.Display.Data().name);
            display.multi_lang_description[0].text = '';
            display.is_angle_default = false;
            display.user_specific.is_user_default = false;

            var resultData;
            return postResult()
                .then(function (response) {
                    resultData = jQuery.isArray(response) ? response[0] : response;
                    return self.GetDefaultListFields(resultData, !isDashboardDrilldown);
                })
                .done(function (fields) {
                    jQuery.each(drilldownFields, function (index, field) {
                        // clean drilldown field_details
                        var fieldDetails = WC.Utility.ParseJSON(field.field_details);
                        delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA];
                        delete fieldDetails[enumHandlers.FIELDDETAILPROPERTIES.SORTING];
                        field.field_details = JSON.stringify(fieldDetails);
                        if (!fields.hasObject('field', field.field)) {
                            fields.push(field);
                        }
                    });

                    display.fields = fields;
                    display.query_blocks = drillDownQueryBlock;
                    jQuery.each(display.query_blocks, function (index, block) {
                        display.query_blocks[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                    });

                    jQuery.when(self.CreateTempDisplay(enumHandlers.DISPLAYTYPE.LIST, display, handler.Models.Angle.Data()))
                        .done(function (data) {
                            if (!isDashboardDrilldown) {
                                anglePageHandler.HandlerAngle.AddDisplay(data, resultData, true);

                                // initial data for drilldown
                                self.LoadSuccess(data);
                                resultModel.LoadSuccess(resultData);

                                // save history
                                data.results = ko.toJS(resultModel.Data());

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
                            else {
                                // include execution parameters
                                var executionParametersInfo = dashboardModel.GetAngleExecutionParametersInfo(handler.Models.Angle.Data(), handler.Models.Display.Data());
                                if (!jQuery.isEmptyObject(executionParametersInfo)) {
                                    jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, executionParametersInfo);
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
                    if (key !== enumHandlers.FIELDDETAILPROPERTIES.AREA) {
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
        var currentDisplayFilters = self.GetCurrentDisplayQuerySteps(querySteps);

        // get query steps of switching display
        var switchDisplayQuerySteps = WC.Utility.IfNothing(switchDisplay.query_blocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS), { query_steps: [] }).query_steps;
        var newSwitchDisplayQuerySteps = self.GetSwitchDisplayQuerySteps(currentDisplayFilters, switchDisplayQuerySteps, keepDisplayFilters);
        var newSwitchDisplayQueryBlock = [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: newSwitchDisplayQuerySteps
        }];

        var angleUri = switchDisplay.uri.substr(0, switchDisplay.uri.indexOf('/displays'));
        switchDisplay.query_blocks = self.CleanNotAcceptedExecutionParameter(newSwitchDisplayQueryBlock, modelUri);
        jQuery.each(switchDisplay.query_blocks, function (index, block) {
            switchDisplay.query_blocks[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
        });

        // display drilldown
        var details = WC.Utility.ParseJSON(switchDisplay.display_details);
        delete details.drilldown_display;
        switchDisplay.display_details = JSON.stringify(details);

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
                    anglePageHandler.HandlerAngle.AddDisplay(data, null, true);

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
    self.GetCurrentDisplayQuerySteps = function (querySteps) {
        // collect filter and jump
        var newQuerySteps = [];
        jQuery.each(ko.toJS(querySteps), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                newQuerySteps.push({
                    step_type: queryStep.step_type,
                    field: queryStep.field,
                    operator: queryStep.operator,
                    arguments: queryStep.arguments,
                    is_adhoc_filter: queryStep.is_adhoc_filter,
                    is_adhoc: queryStep.is_adhoc,
                    is_applied: queryStep.is_applied
                });
            }
            else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                newQuerySteps.push({
                    step_type: queryStep.step_type,
                    followup: queryStep.followup,
                    is_adhoc_filter: queryStep.is_adhoc_filter,
                    is_adhoc: queryStep.is_adhoc,
                    is_applied: queryStep.is_applied
                });
            }
        });
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
            step.is_adhoc = true;
            step.is_applied = true;
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
        var angleData = angle || angleInfoModel.Data() || {};
        return {
            'update_user_specific': false,
            'delete': false,
            'make_angle_default': false,
            'publish': false,
            'unpublish': false,

            // M4-11512: If ad-hoc display and user no had save display privilege update will be false
            'update': userModel.CanSaveDisplays(angleData.model)
        };
    };
    self.ConvertPivotBucketToOperator = function (bucket, fieldType, value) {
        var operator;

        if (bucket === 'individual' && jQuery.inArray(fieldType, [enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.PERCENTAGE]) === -1) {
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
    self.ConvertPivotCellValue = function (value, fieldType) {
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
        else if (operator === enumHandlers.OPERATOR.EQUALTO.Value
            && (fieldType === enumHandlers.FIELDTYPE.ENUM || fieldType === enumHandlers.FIELDTYPE.BOOLEAN)) {
            if (isPivot || fieldType === enumHandlers.FIELDTYPE.BOOLEAN) {
                argumentValues = [WC.WidgetFilterHelper.ArgumentObject(self.ConvertPivotCellValue(value, fieldType), enumHandlers.FILTERARGUMENTTYPE.VALUE)];
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
            argumentValues = [WC.WidgetFilterHelper.ArgumentObject(self.ConvertPivotCellValue(value, fieldType), enumHandlers.FILTERARGUMENTTYPE.VALUE)];
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
            is_adhoc_filter: true,
            is_adhoc: true,
            is_applied: true
        };

        return result;
    };
    self.GetBetweenArgumentValues = function (value, fieldType, bucketOperator) {
        var upperBoundValue = 0;
        var upperBoundArgument = null;
        var lowerBoundValue = self.ConvertPivotCellValue(value, fieldType);
        var lowerBoundArgument = WC.WidgetFilterHelper.ArgumentObject(lowerBoundValue, enumHandlers.FILTERARGUMENTTYPE.VALUE);
        var bucketValue = self.CalculateBucketSize(bucketOperator, fieldType, value);

        if (WC.FormatHelper.IsDateOrDateTime(fieldType) || fieldType === enumHandlers.FIELDTYPE.PERIOD) {
            // date, date-time and period already calculate upper bound value.
            upperBoundValue = bucketValue;
        }
        else {
            var lower = new BigNumber(lowerBoundValue);
            var upper = new BigNumber(bucketValue);

            // other field type will be lower bound value + bucket size.
            upperBoundValue = lower.plus(upper).toNumber();
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

    self.NormalizeDataDisplayFromChartOrPivot = function (display) {
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
        delete display.used_in_task;
    };

    self.CreateDisplayFromChartOrPivot = function (newDisplayType) {
        var display = ko.toJS(self.Data());
        var newFields = [];
        display.query_blocks = ko.toJS(displayQueryBlockModel.CollectQueryBlocks());
        if (display.query_blocks.length) {
            var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
            var defaultFieldDetails = self.GetFieldSettings();
            var displayDetails = {};
            var aggrStep = display.query_blocks[0].query_steps.findObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION);

            if (newDisplayType === enumHandlers.DISPLAYTYPE.LIST) {
                // chart or pivot -> list

                jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
                    newFields.push({
                        field: fieldId,
                        field_details: JSON.stringify(defaultFieldDetails),
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

                        var details = jQuery.extend(WC.Utility.ParseJSON(displayField.field_details), defaultFieldDetails);
                        jQuery.each(details, function (key) {
                            var fieldData = fieldSettingsHandler.FieldSettings.GetFields().findObject("FieldName", aggregation.field);
                            var fieldType = fieldData ? fieldData.DataType : '';
                            var validProperties = ['width', 'format', 'thousandseparator', 'prefix', 'decimals'];
                            if (jQuery.inArray(key, validProperties) !== -1 || fieldType === enumHandlers.FIELDTYPE.PERIOD)
                                delete details[key];
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
                    
                var groupingFieldsCount = aggrStep.grouping_fields.length;
                var rowAreaName = AggregationFieldViewModel.Area.Row;
                var columnAreaName = AggregationFieldViewModel.Area.Column;
                var normalizeChartField = function (field) {
                    var details = WC.Utility.ParseJSON(field.field_details);
                    details[enumHandlers.FIELDDETAILPROPERTIES.SORTING] = AggregationFieldViewModel.Sorting.Unsorted;
                    field.field_details = JSON.stringify(details);
                };

                // set grouping_fields
                var rowAreaFields = [];
                var columnAreaFields = [];
                jQuery.each(aggrStep.grouping_fields, function (index, grouping) {
                    var displayField = jQuery.extend({}, display.fields[index]);
                    var displayFieldDetails = JSON.parse(displayField.field_details);

                    if (displayFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA] === rowAreaName) {
                        // set to row area
                        rowAreaFields.push({
                            field: displayField,
                            grouping: grouping
                        });
                    }
                    else if (displayFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA] === columnAreaName) {
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
                    displayFieldDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA] = rowAreaName;
                    rowAreaFields[0].field.field_details = JSON.stringify(displayFieldDetails);
                }
                if (rowAreaFields.length) {
                    rowAreaFields = [rowAreaFields[0]];
                }
                if (columnAreaFields.length) {
                    columnAreaFields = [columnAreaFields[0]];
                }

                // set new field & grouping_fields
                aggrStep.grouping_fields = [];
                jQuery.each(rowAreaFields.concat(columnAreaFields), function (index, areaField) {
                    normalizeChartField(areaField.field);
                    newFields.push(areaField.field);
                    aggrStep.grouping_fields.push(areaField.grouping);
                });

                // set aggregation_fields
                var newAggregationFields = [];
                jQuery.each(aggrStep.aggregation_fields, function (index, aggregation) {
                    if (index <= 1) {
                        // set to data area
                        var aggregationField = jQuery.extend({}, display.fields[groupingFieldsCount + index]);
                        normalizeChartField(aggregationField);
                        newFields.push(aggregationField);
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
                // chart -> pivot
                jQuery.each(display.fields, function (index, field) {
                    var details = WC.Utility.ParseJSON(field.field_details);
                    if (details[enumHandlers.FIELDDETAILPROPERTIES.AREA] === AggregationFieldViewModel.Area.Data)
                        details[enumHandlers.FIELDDETAILPROPERTIES.SORTING] = AggregationFieldViewModel.Sorting.Unsorted;
                    else
                        details[enumHandlers.FIELDDETAILPROPERTIES.SORTING] = AggregationFieldViewModel.Sorting.Ascending;
                    field.field_details = JSON.stringify(details);
                });
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
            self.NormalizeDataDisplayFromChartOrPivot(display);

            // create adhoc display
            jQuery.when(self.CreateTempDisplay(newDisplayType, display))
                .done(function (data) {
                    // clean field settings
                    anglePageHandler.HandlerAngle.AddDisplay(data, null, true);
                    fieldSettingsHandler.ClearFieldSettings();

                    // redirect to display
                    self.GotoTemporaryDisplay(data.uri);
                });
        }
    };

    self.ConvertDisplayFieldPrefixNoneToNull = function (displayFields) {
        jQuery.each(WC.Utility.ToArray(displayFields), function (index, field) {
            var fieldDetailObj = WC.Utility.ParseJSON(field.field_details);
            if (fieldDetailObj[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] && fieldDetailObj[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] === enumHandlers.DISPLAYUNITSFORMAT.NONE) {
                fieldDetailObj[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = null;
            }
            field.field_details = JSON.stringify(fieldDetailObj);
        });
    };

    var storage = jQuery.localStorage(self.TemporaryDisplayName);
    if (storage) {
        self.TemporaryDisplay(storage);
    }
    if (typeof model !== 'undefined') {
        self.Data(model);
        self.Data.commit();
    }
}
