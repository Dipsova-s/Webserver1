function ValidationHandler() {
    "use strict";

    var self = this;
    var _self = {};

    /*BOF: Model Properties*/
    self.VALIDATIONLEVEL = {
        VALID: 'valid',
        ERROR: 'error',
        WARNING: 'warning'
    };
    self.WARNINGTYPE = {
        CLASS: 'unsupported_start_object',
        FIELD: 'unsupported_display_field',
        FILTER: 'unsupported_filter_field',
        FOLLOWUP: 'unsupported_jump',
        SORTING: 'unsupported_sorting_field',
        AGGREGATION: 'unsupported_aggregation_field',
        GROUPING: 'unsupported_grouping_field',
        CUSTOM: 'custom'
    };
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.CheckValidExecutionParameters = function (filters, modelUri) {
        // check parameterize must have value
        /* M4-13385: Modified warning message to told user which filter is missed argument value */
        var result = {
            IsAllValidArgument: true,
            InvalidMessage: ''
        };
        var messages = [];

        jQuery.each(WC.Utility.ToArray(ko.toJS(filters)), function (idx, filterItem) {
            var operatorValue = filterItem.operator;
            var isCheckFilter = _self.isCheckFilter(filterItem.step_type, operatorValue);
            var fieldModel = modelFieldsHandler.GetFieldById(filterItem.field, modelUri);
            if (isCheckFilter) {
                filterItem.arguments = WC.Utility.ToArray(filterItem.arguments);
                var arg1 = _self.isValidArgumentValue(filterItem.arguments[0], fieldModel);
                if (WC.WidgetFilterHelper.IsEqualGroupOperator(operatorValue)) {
                    var argType1 = _self.getArgumentType(filterItem.arguments[0]);
                    if (!arg1 && (!filterItem.is_execution_parameter || argType1 === enumHandlers.FILTERARGUMENTTYPE.FIELD)) {
                        result.IsAllValidArgument = false;
                        messages.push('<li>' + WC.WidgetFilterHelper.GetFilterText(filterItem, modelUri) + '</li>');
                    }
                }
                else if (WC.WidgetFilterHelper.IsBetweenGroupOperator(operatorValue)) {
                    var arg2 = _self.isValidArgumentValue(filterItem.arguments[1], fieldModel);
                    var isValidBetweenArg = filterItem.arguments.length === 2 && arg1 && arg2;
                    var isValidBetweenArgParameter = filterItem.is_execution_parameter && filterItem.arguments.length === 0;
                    if (!isValidBetweenArg && !isValidBetweenArgParameter) {
                        // fail if has 1 argument or found no value
                        result.IsAllValidArgument = false;
                        messages.push('<li>' + WC.WidgetFilterHelper.GetFilterText(filterItem, modelUri) + '</li>');
                    }
                }
                else if (filterItem.arguments.length === 0 && !filterItem.is_execution_parameter) {
                    result.IsAllValidArgument = false;
                    messages.push('<li>' + WC.WidgetFilterHelper.GetFilterText(filterItem, modelUri) + '</li>');
                }
            }
        });

        result.InvalidMessage = messages.length ? Localization.Info_PleaseEnterValidFilter + '<ul class="invalidFilterList">' + messages.join('') + '</ul>' : '';
        return result;
    };
    _self.isCheckFilter = function (stepType, operator) {
        return stepType === enumHandlers.FILTERTYPE.FILTER
            && operator !== enumHandlers.OPERATOR.HASVALUE.Value
            && operator !== enumHandlers.OPERATOR.HASNOVALUE.Value;
    };
    _self.isValidArgumentValue = function (arg, fieldModel) {
        if (!arg)
            return false;
        else if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FUNCTION)
            return arg.parameters.length !== 0;
        else if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD)
            return !!arg.field;
        else if (fieldModel && fieldModel.fieldtype === enumHandlers.FIELDTYPE.ENUM)
            return true;
        else
            return jQuery.trim(arg.value);
    };
    _self.getArgumentType = function (arg) {
        return arg ? arg.argument_type : null;
    };

    self.GetAngleValidation = function (angle) {
        var result = {
            Valid: true,
            ModelUri: '',
            CanPostResult: true,
            Level: self.VALIDATIONLEVEL.VALID,

            InvalidBaseClasses: false,
            InvalidBaseClassesData: [],

            InvalidFilters: false,
            InvalidFiltersData: [],

            InvalidFollowups: false,
            InvalidFollowupsData: [],

            InvalidQueryStepsAll: false
        };

        angle = ko.toJS(angle);
        if (!angle) {
            result.Valid = false;
            result.CanPostResult = false;
        }
        else {
            result.ModelUri = angle.model;

            // query_definition
            jQuery.extend(result, self.GetQueryBlocksValidation(angle.query_definition));
            delete result.InvalidAggregates;
            delete result.InvalidAggregatesData;
            delete result.InvalidSortings;
            delete result.InvalidSortingsData;

            // check valid
            // check can post result
            if (result.InvalidBaseClasses || result.InvalidFilters || result.InvalidFollowups) {
                result.Valid = false;
                result.CanPostResult = false;
            }
        }

        if (!result.Valid) {
            if (result.InvalidBaseClasses || result.InvalidFollowups
                || result.InvalidQueryStepsAll) {
                result.Level = self.VALIDATIONLEVEL.ERROR;
            }
            else {
                result.Level = self.VALIDATIONLEVEL.WARNING;
            }
        }

        return result;
    };
    self.GetDisplayValidation = function (display, modelUri) {
        var result = {
            Valid: true,
            ModelUri: modelUri || '',
            CanPostResult: true,
            Level: self.VALIDATIONLEVEL.VALID,

            InvalidFields: false,
            InvalidFieldsAll: false,
            InvalidFieldsData: [],

            InvalidFilters: false,
            InvalidFiltersData: [],

            InvalidFollowups: false,
            InvalidFollowupsData: [],

            InvalidAggregates: false,
            InvalidAggregatesData: [],

            InvalidSortings: false,
            InvalidSortingsData: [],

            InvalidQueryStepsAll: false
        };

        display = ko.toJS(display);
        if (!display) {
            result.Valid = false;
            result.CanPostResult = false;
        }
        else {
            // fields - don't check for chart or pivot
            if (display.display_type === enumHandlers.DISPLAYTYPE.LIST) {
                jQuery.extend(result, self.GetFieldsValidation(display.fields));
            }

            // query steps
            jQuery.extend(result, self.GetQueryBlocksValidation(display.query_blocks));
            delete result.InvalidBaseClasses;
            delete result.InvalidBaseClassesData;

            // re-check for pivot & chart aggregation steps
            if (display.display_type === enumHandlers.DISPLAYTYPE.CHART || display.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                var aggrStep = display.query_blocks.length ? display.query_blocks[0].query_steps.findObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION) : null;
                if (!aggrStep) {
                    result.Valid = false;
                    result.CanPostResult = false;
                    result.InvalidAggregates = false;
                    result.InvalidAggregatesData = [{
                        valid: false,
                        validation_details: {
                            template: Localization.Error_AggregationFieldMissing
                        }
                    }];
                }
            }

            // check valid
            var invalidResults = [
                result.InvalidFields,
                result.InvalidFilters,
                result.InvalidFollowups,
                result.InvalidAggregates,
                result.InvalidSortings
            ];
            if (WC.Utility.MatchAny(true, invalidResults)) {
                result.Valid = false;
            }

            // check can post result
            var invalidPostResults = [
                result.InvalidFieldsAll,
                result.InvalidFilters,
                result.InvalidFollowups,
                result.InvalidAggregates
            ];
            if (WC.Utility.MatchAny(true, invalidPostResults)) {
                result.CanPostResult = false;
            }
        }

        if (!result.Valid) {
            var errorResults = [
                result.InvalidAggregates,
                result.InvalidFollowups,
                result.InvalidFieldsAll,
                result.InvalidQueryStepsAll
            ];
            if (WC.Utility.MatchAny(true, errorResults)) {
                result.Level = self.VALIDATIONLEVEL.ERROR;
            }
            else {
                result.Level = self.VALIDATIONLEVEL.WARNING;
            }
        }

        return result;
    };
    self.GetFieldsValidation = function (fields) {
        var result = {
            InvalidFields: false,
            InvalidFieldsAll: false,
            InvalidFieldsData: []
        };

        if (fields && fields.length) {
            jQuery.each(fields, function (index, field) {
                if (field.valid === false) {
                    result.InvalidFields = true;
                    result.InvalidFieldsData.push(field);
                }
            });

            if (result.InvalidFieldsData.length === fields.length) {
                result.InvalidFieldsAll = true;
            }
        }

        return result;
    };
    self.GetQueryBlocksValidation = function (queryBlocks) {
        var result = {
            InvalidBaseClasses: false,
            InvalidBaseClassesData: [],

            InvalidFilters: false,
            InvalidFiltersData: [],

            InvalidFollowups: false,
            InvalidFollowupsData: [],

            InvalidAggregates: false,
            InvalidAggregatesData: [],

            InvalidSortings: false,
            InvalidSortingsData: [],

            InvalidQueryStepsAll: false
        };

        // query_definition
        if (queryBlocks && queryBlocks.length) {
            jQuery.each(queryBlocks, function (indexBlock, block) {
                if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES) {
                    if (block.valid === false) {
                        result.InvalidBaseClasses = true;
                        result.InvalidBaseClassesData.push(block);
                    }
                }
                else if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                    var invalidQueryStepCount = 0;
                    var allQueryStepCount = block.query_steps.length;
                    jQuery.each(block.query_steps, function (index, queryStep) {
                        if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER
                            && (queryStep.valid === false || !WC.WidgetFilterHelper.IsValidArguments(queryStep.arguments))) {
                            // filter
                            result.InvalidFilters = true;
                            result.InvalidFiltersData.push(queryStep);
                            invalidQueryStepCount++;
                        }
                        else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP && queryStep.valid === false) {
                            // followups
                            result.InvalidFollowups = true;
                            result.InvalidFollowupsData.push(queryStep);
                            invalidQueryStepCount++;
                        }
                        else if (queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                            // aggregation
                            jQuery.each(WC.Utility.ToArray(queryStep.aggregation_fields), function (index, aggregation) {
                                if (aggregation.valid === false) {
                                    result.InvalidAggregatesData.push(aggregation);
                                }
                            });
                            jQuery.each(WC.Utility.ToArray(queryStep.grouping_fields), function (index, grouping) {
                                if (grouping.valid === false) {
                                    result.InvalidAggregatesData.push(grouping);
                                }
                            });

                            if (result.InvalidAggregatesData.length) {
                                result.InvalidAggregates = true;
                                invalidQueryStepCount++;
                            }
                        }
                        else if (queryStep.step_type === enumHandlers.FILTERTYPE.SORTING) {
                            // sort
                            jQuery.each(queryStep.sorting_fields, function (index, sorting) {
                                if (sorting.valid === false) {
                                    result.InvalidSortingsData.push(sorting);
                                }
                            });

                            if (result.InvalidSortingsData.length) {
                                result.InvalidSortings = true;
                                invalidQueryStepCount++;
                            }
                        }
                    });

                    if (allQueryStepCount && allQueryStepCount === invalidQueryStepCount) {
                        result.InvalidQueryStepsAll = true;
                    }
                }
            });
        }

        return result;
    };
    self.GetAllInvalidMessages = function (/*validation0, validation1, ...*/) {
        var i;
        var messages = [];
        for (i = 0; i < arguments.length; i++) {
            jQuery.merge(messages, _self.GetInvalidMessages(arguments[i]));
        }
        return messages.distinct();
    };
    self.GetAllInvalidMessagesHtml = function (messages) {
        if (messages.length) {
            messages = messages.distinct(function (message) {
                var indexField = message.indexOf('<');
                var indexField2 = message.indexOf('>', indexField + 1);
                return indexField === -1 || indexField2 === -1 ? message : message.substring(indexField + 1, indexField2);
            });

            jQuery.each(messages, function (index, message) {
                messages[index] = _self.GetHtmlMessage(message);
            });

            return '<ul class="invalidMessages"><li>' + messages.join('</li><li>') + '</li></ul>';
        }
        else {
            return '';
        }
    };
    self.GetValidationError = function (model, modelUri, isHtml) {
        var message = '', classesName, template;
        if (model.validation_details) {
            if (model.validation_details.warning_type === self.WARNINGTYPE.CUSTOM) {
                message = model.validation_details.template;
            }
            else if (model.validation_details.warning_type === self.WARNINGTYPE.CLASS) {
                message = self.GetClassValidationError(model, null, modelUri, isHtml);
            }
            else if (model.validation_details.warning_type === self.WARNINGTYPE.FOLLOWUP) {
                classesName = _self.GetFriendlyClassesName(model.validation_details.classes, modelUri);

                var followupName;
                var followup = modelFollowupsHandler.GetFollowupById(model.followup, modelUri);
                if (followup) {
                    followupName = userFriendlyNameHandler.GetFriendlyName(followup, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
                }
                else {
                    followupName = model.followup;
                }
                template = model.validation_details.template || Localization.Error_FollowupNotAvailableInObjects;
                message = kendo.format(template, followupName, classesName.join(', '));
            }
            else {
                classesName = _self.GetFriendlyClassesName(model.validation_details.classes, modelUri);

                var fieldName = '', fieldSource;
                if (model.validation_details.source) {
                    // source field
                    fieldSource = modelFieldSourceHandler.GetFieldSourceById(model.validation_details.source, modelUri);
                    fieldName += fieldSource ? userFriendlyNameHandler.GetFriendlyName(fieldSource, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) : model.validation_details.source;
                    fieldName += ' - ';
                }
                if (model.validation_details.field) {
                    // field name
                    var field = modelFieldsHandler.GetFieldById(model.validation_details.field, modelUri);
                    if (field) {
                        if (!model.validation_details.source && field.source) {
                            // re-check source field
                            fieldSource = modelFieldSourceHandler.GetFieldSourceByUri(field.source);
                            if (fieldSource) {
                                fieldName += userFriendlyNameHandler.GetFriendlyName(fieldSource, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
                                fieldName += ' - ';
                            }
                        }
                        fieldName += userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
                    }
                    else {
                        fieldName += model.validation_details.field;
                    }
                }

                template = model.validation_details.template || Localization.Error_FieldNotAvailableInObjects;
                message = kendo.format(template, fieldName, classesName.join(', '));
            }
        }
        if (isHtml === true) {
            message = _self.GetHtmlMessage(message);
        }
        return message;
    };
    self.GetClassValidationError = function (baseClassBlock, classId, modelUri, isHtml) {
        var message = '', classesName;
        if (baseClassBlock.valid === false && baseClassBlock.validation_details) {
            if (classId === null) {
                // combine all objects to one
                classesName = _self.GetFriendlyClassesName(baseClassBlock.validation_details.classes, modelUri);
                if (classesName.length > 1) {
                    message = kendo.format(baseClassBlock.validation_details.template || Localization.Error_ObjectsAreNotAvailable, classesName.join(', '));
                }
                else {
                    message = kendo.format(baseClassBlock.validation_details.template || Localization.Error_ObjectIsNotAvailable, classesName.join(', '));
                }
            }
            else if (jQuery.inArray(classId, baseClassBlock.validation_details.classes) !== -1) {
                // specific object
                classesName = _self.GetFriendlyClassesName([classId], modelUri);
                message = kendo.format(baseClassBlock.validation_details.template || Localization.Error_ObjectIsNotAvailable, classesName[0]);
            }
        }
        if (isHtml === true) {
            message = _self.GetHtmlMessage(message);
        }
        return message;
    };

    _self.GetInvalidMessages = function (allResults, isHtml) {
        var messages = [];
        jQuery.each(allResults, function (name, results) {
            // data contain as xxxxData property
            if (name.indexOf('Data') !== -1) {
                jQuery.each(results, function (index, result) {
                    messages.push(_self.GetInvalidMessage(result, allResults.ModelUri, isHtml));
                });
            }
        });
        return messages;
    };
    _self.GetInvalidMessage = function (model, modelUri, isHtml) {
        // check common validation_details property
        var message = [];
        if (model.validation_details) {
            message.push(self.GetValidationError(model, modelUri));
        }

        // check arguments
        jQuery.each(WC.Utility.ToArray(model.arguments), function (index, arg) {
            if (arg.validation_details) {
                message.push(self.GetValidationError(arg, modelUri));
            }
        });

        // check aggregation_fields
        if (model.aggregation_fields) {
            jQuery.each(model.aggregation_fields, function (index, aggregation) {
                if (aggregation.validation_details) {
                    message.push(self.GetValidationError(aggregation, modelUri));
                }
            });
        }
        // check grouping_fields
        if (model.grouping_fields) {
            jQuery.each(model.grouping_fields, function (index, grouping) {
                if (grouping.validation_details) {
                    message.push(self.GetValidationError(grouping, modelUri));
                }
            });
        }

        // check sorting_fields
        if (model.sorting_fields) {
            jQuery.each(model.sorting_fields, function (index, sorting) {
                if (sorting.validation_details) {
                    message.push(self.GetValidationError(sorting, modelUri));
                }
            });
        }

        if (isHtml === true) {
            return _self.GetHtmlMessage(message.join('\n'));
        }
        else {
            return message.join('\n');
        }
    };
    _self.GetFriendlyClassesName = function (classes, modelUri) {
        var classesName = [];
        jQuery.each(WC.Utility.ToArray(classes), function (index, classId) {
            var classObject = modelClassesHandler.GetClassById(classId, modelUri);
            var className = classObject ? userFriendlyNameHandler.GetFriendlyName(classObject, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) : classId;
            classesName.push(className);
        });
        return classesName;
    };
    _self.GetHtmlMessage = function (message) {
        return message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    };
    /*EOF: Model Methods*/
}

var validationHandler = new ValidationHandler();
