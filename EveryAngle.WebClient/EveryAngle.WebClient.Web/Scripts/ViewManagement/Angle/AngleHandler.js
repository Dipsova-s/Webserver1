function AngleModelTest(data) {
    "use strict";

    jQuery.extend(this, WC.ModelHelper.ExtendAngleData(data));
}
function DisplayModelTest(data, angle) {
    "use strict";

    jQuery.extend(this, WC.ModelHelper.ExtendDisplayData(data, angle));
}

function AngleHandler() {
    "use strict";

    //BOF: Properties

    var self = this;

    self.id = 'angle';
    self.Data = new AngleModelTest({});
    self.DisplayHandler = new DisplayHander(self, {});
    self.QueryBlockHandler = new QueryBlockHandler(self, '');

    self.UPDATEMODE = {
        // update all properties from response
        ALL: 'all',

        // update need properties from response
        SPECIFIC: 'specific'
    };

    //EOF: Properties

    //BOF: Methods
    self.InitialAngleFromData = function (angle, displayUri) {
        /// <summary>initial angle data and set current display</summary>
        /// <param name="angle" type="Object">angle object</param>
        /// <param name="displayUri" type="String" optional="true">uri of current display</param>

        self.SetAngleData(angle);
        self.SetCurrentDisplay(displayUri);
    };
    self.InitialLoadAngle = function (angleUri, displayUri, isMultilingual) {
        /// <summary>load angle then initial angle data and set current display</summary>
        /// <param name="angle" type="Object">angle object</param>
        /// <param name="displayUri" type="String" optional="true">uri of current display</param>
        /// <param name="isMultilingual" type="Boolean" optional="true">default: true, load with multilingual or not?</param>
        /// <returns type="Deferred"></returns>

        return self.LoadAngle(angleUri, isMultilingual)
            .done(function (angle) {
                self.InitialAngleFromData(angle, displayUri);
            });
    };
    self.LoadAngle = function (angleUri, isMultilingual) {
        /// <summary>load angle from server side</summary>
        /// <param name="angleUri" type="Object">angle object</param>
        /// <param name="isMultilingual" type="Boolean" optional="true">default: true, load with multilingual or not?</param>
        /// <returns type="Deferred"></returns>

        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        if (isMultilingual !== false) {
            query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        }
        return GetDataFromWebService(angleUri, query);
    };
    self.SetAngleData = function (angle) {
        /// <summary>set/normalize angle to model</summary>
        /// <param name="angle" type="Object">angle object</param>

        self.Data = new AngleModelTest(angle);
        self.QueryBlockHandler = new QueryBlockHandler(self, 'query_definition');
        if (angle) {
            jQuery.localStorage(self.Id, self.Data);
        }
    };
    self.GetSavedData = function () {
        /// <summary>load saved angle from storage</summary>
        /// <returns type="AngleModelTest"></returns>

        return new AngleModelTest(jQuery.localStorage(self.Id));
    };
    self.UpdateAngleData = function (savedData, updateData, updateMode) {
        /// <summary>update/normalize angle to model</summary>
        /// <param name="savedData" type="Object">saved angle object</param>
        /// <param name="updateData" type="Object">updating properties</param>
        /// <param name="updateMode" type="AngleHandler.UPDATEMODE">update mode</param>

        savedData = new AngleModelTest(savedData);

        // save source data
        jQuery.localStorage(self.Id, savedData);

        // update current data
        if (updateMode === self.UPDATEMODE.SPECIFIC) {
            jQuery.each(updateData, function (key, value) {
                if (key === 'angle_default_display') {
                    jQuery.each(self.Data.display_definitions, function (index, display) {
                        if (display.id === value) {
                            display.is_angle_default = true;
                        }
                        else {
                            display.is_angle_default = false;
                        }
                    });
                }

                if (value instanceof Array) {
                    self.Data[key] = value.slice();
                }
                else if (typeof value === 'object') {
                    jQuery.extend(self.Data, value);
                }
                else {
                    self.Data[key] = value;
                }
            });
        }
        else {
            jQuery.each(savedData.display_definitions, function (index, display) {
                var currentDisplay = self.GetDisplayByUri(display.uri);
                if (!currentDisplay)
                    return true;

                jQuery.each(display, function (key, value) {
                    if (key !== 'display_type' && key !== 'display_details' && key !== 'fields' && key !== 'query_blocks') {
                        if (value instanceof Array) {
                            currentDisplay[key] = value.slice();
                        }
                        else if (typeof value === 'object') {
                            currentDisplay[key] = jQuery.extend({}, value);
                        }
                        else {
                            currentDisplay[key] = value;
                        }
                    }
                });
            });
        }
    };
    self.IsAdhocAngle = function () {
        /// <summary>check angle is adhoc or not? (/models/x/angles/xxxx-xxxx-xxxx-xxx)</summary>
        /// <returns type="Boolean"></returns>

        var angleUri = self.Data.uri || '';
        return !angleUri || isNaN(angleUri.substr(angleUri.lastIndexOf('/') + 1));
    };
    self.GetTemplateAngleUri = function () {
        /// <summary>get template that related to this angle</summary>
        /// <returns type="String"></returns>

        return self.Data.__uri_template || null;
    };
    self.GetAngleName = function () {
        /// <summary>get angle name from multilingual</summary>
        /// <returns type="String"></returns>

        return WC.Utility.GetDefaultMultiLangText(self.Data.multi_lang_name);
    };
    self.GetAngleDescription = function () {
        /// <summary>get angle description from multilingual</summary>
        /// <returns type="String"></returns>

        return WC.Utility.GetDefaultMultiLangText(self.Data.multi_lang_description);
    };
    self.GetRemoveReadOnlyAngleData = function (data) {
        /// <summary>clean angle read only properties</summary>
        /// <param name="data" type="Object">angle object</param>
        /// <returns type="Object"></returns>

        return WC.ModelHelper.RemoveReadOnlyAngleData(data);
    };
    self.CreateNewAngle = function (isMultilingual) {
        /// <summary>create new angle</summary>
        /// <param name="isMultilingual" type="Boolean" optional="true">default: true, load with multilingual or not?</param>
        /// <returns type="Deferred"></returns>

        var angleData = self.GetRemoveReadOnlyAngleData(self.Data);
        if (!angleData.display_definitions.length) {
            var displayData = self.GetCreateNewDisplayData();
            angleData.display_definitions = [displayData];
        }

        var uri = self.Date.model + '/angles';
        var query = {};
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        if (isMultilingual !== false) {
            query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        }
        return CreateDataToWebService(uri + '?' + jQuery.param(query), angleData)
            .done(function (angle) {
                if (self.DisplayHandler) {
                    var currentDisplay = self.GetDisplayById(self.DisplayHandler.Data.id);
                    if (currentDisplay) {
                        self.SetCurrentDisplay(currentDisplay.uri);
                    }
                }

                self.SetAngleData(angle);
            });
    };
    self.UpdateAngle = function (updateData, updateMode, isMultilingual) {
        /// <summary>update angle</summary>
        /// <param name="updateData" type="Object">updating properties</param>
        /// <param name="updateMode" type="AngleHandler.UPDATEMODE">update mode</param>
        /// <param name="isMultilingual" type="Boolean" optional="true">default: true, load with multilingual or not?</param>
        /// <returns type="Deferred"></returns>

        updateData = self.GetRemoveReadOnlyAngleData(updateData);

        if (self.IsTemporaryAngle()) {
            return self.UpdateTemporaryAngle(updateData, updateMode);
        }
        else {
            var query = {};
            query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
            if (isMultilingual !== false) {
                query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
            }
            var updateDataWithStates = {};
            var updateDataWithoutStates = {};
            jQuery.each(updateData, function (key, value) {
                if (key === 'is_published' || key === 'is_template' || key === 'is_validated') {
                    updateDataWithStates[key] = value;
                }
                else {
                    updateDataWithoutStates[key] = value;
                }
            });

            // update normal angle properties
            var updateAngle = function () {
                if (!jQuery.isEmptyObject(updateDataWithoutStates)) {
                    // update angle
                    return UpdateDataToWebService(self.Data.uri + '?' + jQuery.param(query), updateDataWithoutStates);
                }
                else {
                    // nothing changed
                    return jQuery.when(false);
                }
            };

            if (updateDataWithStates.is_validated === true) {
                // if set is_validated = true, update normal proerties first then state properties
                return updateAngle()
                    .then(function () {
                        return self.UpdateAngleStates(updateDataWithStates);
                    })
                    .then(function () {
                        return self.LoadAngle(self.Data.uri, isMultilingual);
                    })
                    .done(function (angle) {
                        self.UpdateAngleData(angle, updateData, updateMode);
                    });
            }
            else {
                // do normal process
                return self.UpdateAngleStates(updateDataWithStates)
                    .then(function () {
                        return updateAngle();
                    })
                    .then(function (updatedAngle) {
                        if (updatedAngle === false) {
                            return self.LoadAngle(self.Data.uri, isMultilingual);
                        }
                        else {
                            return jQuery.when(updatedAngle);
                        }
                    })
                    .done(function (angle) {
                        self.UpdateAngleData(angle, updateData, updateMode);
                    });
            }
        }
    };
    self.UpdateTemporaryAngle = function (updateData, updateMode) {
        /// <summary>update to storage</summary>
        /// <param name="updateData" type="Object">updating properties</param>
        /// <param name="updateMode" type="AngleHandler.UPDATEMODE">update mode</param>
        /// <returns type="Deferred"></returns>

        self.UpdateAngleData(self.Data, updateData, updateMode);
        return jQuery.when(self.Data);
    };
    self.SetAngleDefaultDisplay = function (displayUri) {
        /// <summary>update angle default display by display uri</summary>
        /// <param name="displayUri" type="String">display uri</param>
        /// <returns type="Deferred"></returns>

        var display = self.GetDisplayByUri(displayUri);
        if (!display) {
            return jQuery.when(false);
        }

        var updateData = {};
        updateData['angle_default_display'] = display.id;

        return self.UpdateAngle(updateData, self.UPDATEMODE.SPECIFIC);
    };
    self.SetAngleStarred = function (isStarred) {
        /// <summary>update user starred status</summary>
        /// <param name="isStarred" type="Boolean">starred flag</param>
        /// <returns type="Deferred"></returns>

        var updateData = {
            user_specific: {
                is_starred: isStarred
            }
        };

        return self.UpdateAngle(updateData, self.UPDATEMODE.SPECIFIC);
    };
    self.SetAnglePrivateNote = function (note) {
        /// <summary>update user private note</summary>
        /// <param name="note" type="String">note</param>
        /// <returns type="Deferred"></returns>

        var updateData = {
            user_specific: {
                private_note: note || ''
            }
        };

        return self.UpdateAngle(updateData, self.UPDATEMODE.SPECIFIC);
    };
    self.UpdateAngleStates = function (statesData) {
        /// <summary>update angle states</summary>
        /// <param name="statesData" type="Object">states</param>
        /// <returns type="Deferred"></returns>

        var deferred = [];
        if (typeof statesData.is_template !== 'undefined') {
            deferred.pushDeferred(self.UpdateAngleState, [{ is_template: statesData.is_template }]);
        }
        if (typeof statesData.is_published !== 'undefined') {
            deferred.pushDeferred(self.UpdateAngleState, [{ is_published: statesData.is_published }]);
        }
        if (typeof statesData.is_validated !== 'undefined') {
            deferred.pushDeferred(self.UpdateAngleState, [{ is_validated: statesData.is_validated }]);
        }

        if (deferred.length) {
            return jQuery.whenAll(deferred, false);
        }
        else {
            return jQuery.when(false);
        }
    };
    self.UpdateAngleState = function (stateData) {
        /// <summary>update angle state</summary>
        /// <param name="stateData" type="Object">state</param>
        /// <returns type="Deferred"></returns>

        if (self.IsTemporaryAngle()) {
            return self.UpdateTemporaryAngle(stateData, self.UPDATEMODE.SPECIFIC);
        }
        else {
            return UpdateDataToWebService(self.Data.state, stateData)
                .then(function (response) {
                    var deferred = [];
                    if (statesData.is_published === true) {
                        jQuery.each(self.Data.display_definitions, function (index, display) {
                            deferred.pushDeferred(self.UpdateDisplayState, [display.uri, { is_published: statesData.is_published }]);
                        });
                    }
                    return jQuery.whenAll(deferred)
                        .then(function () {
                            return jQuery.when(response);
                        });
                });
        }
    };

    // utilities for display
    self.GetDisplayByUri = function (displayUri) {
        /// <summary>get display by uri</summary>
        /// <param name="displayUri" type="String">display uri</param>
        /// <returns type="DisplayModel"></returns>

        return self.Data.display_definitions.findObject('uri', displayUri);
    };
    self.GetDisplayById = function (displayId) {
        /// <summary>get display by id</summary>
        /// <param name="displayId" type="String">display id</param>
        /// <returns type="DisplayModel"></returns>

        return self.Data.display_definitions.findObject('id', displayId);
    };
    self.SetCurrentDisplay = function (displayUri) {
        /// <summary>set current display</summary>
        /// <param name="displayUri" type="String">display uri</param>

        self.DisplayHandler = new DisplayHander(self, self.GetDisplayByUri(displayUri));
    };
    self.IsAdhocDisplay = function (displayUri) {
        /// <summary>check display is adhoc or not? (/models/x/angles/x/displays/xxxx-xxxx-xxxx-xxx)</summary>
        /// <param name="displayUri" type="String">display uri</param>
        /// <returns type="Boolean"></returns>

        return !displayUri || isNaN(displayUri.substr(displayUri.lastIndexOf('/') + 1));
    };
    self.GetDisplayName = function (displayObjectOrDisplayUri) {
        /// <summary>get display name from multilingual</summary>
        /// <param name="displayObjectOrDisplayUri" type="Object|String">display object or display uri</param>
        /// <returns type="String"></returns>

        var display;
        if (typeof displayObjectOrDisplayUri === 'string') {
            display = self.GetDisplayByUri(displayObjectOrDisplayUri);
        }
        else {
            display = displayObjectOrDisplayUri;
        }
        return WC.Utility.GetDefaultMultiLangText(display.multi_lang_name);
    };
    self.GetDisplayDescription = function (displayObjectOrDisplayUri) {
        /// <summary>get display description from multilingual</summary>
        /// <param name="displayObjectOrDisplayUri" type="Object|String">display object or display uri</param>
        /// <returns type="String"></returns>

        var display;
        if (typeof displayObjectOrDisplayUri === 'string') {
            display = self.GetDisplayByUri(displayObjectOrDisplayUri);
        }
        else {
            display = displayObjectOrDisplayUri;
        }
        return WC.Utility.GetDefaultMultiLangText(display.multi_lang_name);
    };
    self.GetRemoveReadOnlyDisplayData = function (data) {
        /// <summary>clean display read only properties</summary>
        /// <param name="data" type="Object">display object</param>
        /// <returns type="Object"></returns>

        return WC.ModelHelper.RemoveReadOnlyDisplayData(data);
    };
    self.UpdateTemporaryDisplay = function (displayUri, updateData, updateMode) {
        /// <summary>update to storage</summary>
        /// <param name="displayUri" type="String">display uri</param>
        /// <param name="updateData" type="Object">updating properties</param>
        /// <param name="updateMode" type="AngleHandler.UPDATEMODE">update mode</param>
        /// <returns type="Deferred"></returns>

        self.UpdateDisplayData(self.Data, updateData, updateMode);
        return jQuery.when(self.Data);
    };
    self.UpdateDisplayState = function (displayUri, stateData) {
        /// <summary>update display state</summary>
        /// <param name="displayUri" type="String">display uri</param>
        /// <param name="stateData" type="Object">state</param>
        /// <returns type="Deferred"></returns>

        var display = self.GetDisplayByUri(displayUri);
        if (self.IsTemporaryDisplay(display.uri)) {
            return self.UpdateTemporaryDisplay(display.uri, stateData);
        }
        else {
            return UpdateDataToWebService(display.state, stateData);
        }
    };
    self.DeleteDisplay = function (displayUri) {
        /// <summary>delete display by display uri</summary>
        /// <param name="displayUri" type="String">display uri</param>
        /// <returns type="Deferred"></returns>

        var displayObject = self.GetDisplayByUri(displayUri);
        if (!displayObject) {
            return jQuery.when(false);
        }

        return jQuery.when(self.IsTemporaryAngle() ? false : DeleteDataToWebService(displayObject.uri))
            .done(function () {
                self.Data.display_definitions.removeObject('uri', displayObject.uri);

                var angleData = jQuery.localStorage(self.Id);
                angleData.display_definitions.removeObject('uri', displayObject.uri);
                jQuery.localStorage(self.Id, angleData);
            });
    };
    self.GetCreateNewDisplayData = function (displayType) {
        var guid = jQuery.GUID();
        var display = {};
        display.name = Localization.DefaultDisplayListName;
        display.description = '';
        display.uri = self.Data.uri + '/displays/' + guid;
        display.id = 'd' + guid.replace(/-/g, '');
        display.display_type = displayType || null;

        if (display.display_type === enumHandlers.DISPLAYTYPE.LIST) {
            jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
                display.fields.push({
                    field: fieldId,
                    field_details: JSON.stringify({ width: 120 }),
                    valid: true
                });
            });
        }
        else if (display.display_type === enumHandlers.DISPLAYTYPE.CHART || display.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            var defaultField = enumHandlers.DEFAULTFIELDS.OBJECTTYPE;
            var defaultBucket = 'individual';

            display.query_blocks = [{
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: [
                    {
                        step_type: enumHandlers.FILTERTYPE.AGGREGATION,
                        grouping_fields: [
                            {
                                field: defaultBucket + '_' + defaultField,
                                operator: defaultBucket,
                                source_field: defaultField
                            }
                        ],
                        aggregation_fields: [
                            {
                                field: enumHandlers.AGGREGATION.COUNT.Value,
                                operator: enumHandlers.AGGREGATION.COUNT.Value
                            }
                        ]
                    }
                ]
            }];
        }

        return new DisplayModelTest(display, self.Data);
    };
    //EOF: Methods
}

function DisplayHander(angleHandler, display) {
    "use strict";

    //BOF: Properties
    var self = this;
    var _self = {};

    // private
    _self.angleHandler = angleHandler || new AngleHandler();

    // public
    // update display/field details mode
    self.UPDATEDETAILSMODE = {
        // replace all
        REPLACE: 'replace',

        // extend exisitng value
        EXTEND: 'extend'
    };
    self.Id = 'angle_display';
    self.Data = null;
    self.QueryBlockHandler = null;
    //EOF: Properties

    //BOF: Methods
    self.InitialDisplay = function (display) {
        self.SetDisplayData(display);
    };
    self.SetDisplayData = function (display) {
        self.Data = new DisplayModelTest(display, _self.angleHandler.Data);
        self.QueryBlockHandler = new QueryBlockHandler(self, 'query_blocks');
        if (display) {
            jQuery.localStorage(self.Id, self.Data);
        }
    };
    self.GetSavedData = function () {
        return new DisplayModelTest(jQuery.localStorage(self.Id), _self.angleHandler.Data);
    };
    self.GetDisplayName = function () {
        return _self.angleHandler.GetDisplayName(self.Data.uri);
    };
    self.GetDisplayDescription = function () {
        return _self.angleHandler.GetDisplayDescription(self.Data.uri);
    };
    self.IsAdhocDisplay = function () {
        return _self.angleHandler.IsAdhocDisplay(self.Data.uri);
    };
    self.GetRemoveReadOnlyDisplayData = function (data) {
        return _self.angleHandler.GetRemoveReadOnlyDisplayData(data);
    };
    self.GetDisplayDetails = function () {
        return WC.Utility.ParseJSON(self.Data.display_details);
    };
    self.SetDisplayDetails = function (displayDetails, updateMode) {
        if (updateMode === self.UPDATEDETAILSMODE.EXTEND) {
            var currentDetails = self.GetDisplayDetails();
            jQuery.extend(currentDetails, displayDetails);
            self.Data.display_details = JSON.stringify(currentDetails || {});
        }
        else {
            self.Data.display_details = JSON.stringify(displayDetails || {});
        }
    };
    self.GetFieldDetails = function (field) {
        return WC.Utility.ParseJSON(field.field_details);
    };
    self.SetDisplayDetails = function (field, fieldDetails, updateMode) {
        if (updateMode === self.UPDATEDETAILSMODE.EXTEND) {
            var currentDetails = self.GetFieldDetails(field);
            jQuery.extend(currentDetails, fieldDetails);
            field.field_details = JSON.stringify(currentDetails || {});
        }
        else {
            field.field_details = JSON.stringify(fieldDetails || {});
        }
    };
    self.GetFieldById = function (fieldId) {
        return self.Data.fields.findObject('field', fieldId, false);
    };
    //EOF: Methods

    // initial
    self.InitialDisplay(display);
}

function QueryBlockHandler(handler, propertyName) {
    "use strict";

    //BOF: Properties
    var self = this;
    var _self = {};

    // private
    // can be AngleHandler or DisplayHander
    _self.handler = handler || new AngleHandler();
    _self.propertyName = propertyName || 'query_definition';
    //EOF: Properties

    //BOF: Methods
    self.GetQueryBlocks = function () {
        return _self.handler.Data[_self.propertyName];
    };
    self.GetQueryBlockByType = function (queryblockType) {
        return self.GetQueryBlocks().findObject('queryblock_type', queryblockType);
    };
    self.GetBaseClassesIds = function () {
        var baseClassBlock = self.GetQueryBlockByType(enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        if (baseClassBlock) {
            baseClassBlock.base_classes;
        }
        return [];
    };
    self.NormalizeQuerySteps = function () {
        var queryStepBlock = self.GetQueryBlockByType(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (queryStepBlock && queryStepBlock.query_steps.length) {
            var sortingIndex = queryStepBlock.query_steps.indexOfObject('step_type', enumHandlers.FILTERTYPE.SORTING);
            var sortingStep = sortingIndex !== -1 ? queryStepBlock.query_steps.splice(sortingIndex, 1)[0] : null;
            var aggregationIndex = self.GetQueryBlocks().indexOfObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION);
            var aggregationStep = aggregationIndex !== -1 ? queryStepBlock.query_steps.splice(aggregationIndex, 1)[0] : null;

            if (sortingStep) {
                queryStepBlock.query_steps.push(sortingStep);
            }
            if (aggregationStep) {
                queryStepBlock.query_steps.push(aggregationStep);
            }
        }
    };
    self.GetQueryStepsByType = function (stepType) {
        var queryStepBlock = self.GetQueryBlockByType(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (queryStepBlock) {
            return queryStepBlock.query_steps.findObjects('step_type', stepType);
        }
        return [];
    };
    self.GetQueryStepsByTypes = function (stepTypes) {
        var queryStepBlock = self.GetQueryBlockByType(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (queryStepBlock) {
            return queryStepBlock.query_steps.findObjects('step_type', function (stepType) {
                return jQuery.inArray(stepType, stepTypes) !== -1;
            });
        }
        return [];
    };
    //EOF: Methods
};