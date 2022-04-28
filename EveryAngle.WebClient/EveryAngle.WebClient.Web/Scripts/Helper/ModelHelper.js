/// <loc filename="../vsdoc.loc.xml" format="vsdoc" />

// ModelHelper
(function (window, helper) {
    "use strict";

    function ModelHelper() {
        var self = this;
        var _self = {};

        self.CleanData = function (data) {
            data = ko.toJS(data || {});

            // remove custom properties '__xxx'
            jQuery.each(data, function (key, value) {
                if (key.substr(0, 2) === '__' || typeof value === 'function')
                    delete data[key];
            });

            return data;
        };

        self.ExtendValidProperty = function (data) {
            delete data.validation_error;
            if (typeof data.valid === 'undefined') {
                data.valid = true;
            }
        };

        self.RemoveValidProperty = function (object) {
            delete object.valid;
            delete object.validation_error;
            delete object.validation_details;
        };

        self.ExtendMultiLinguals = function (data) {
            var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
            var avaliableLanguages = [];

            // multi_lang_name
            data.multi_lang_name = WC.Utility.ToArray(data.multi_lang_name);
            if (!data.multi_lang_name.length && data.name) {
                data.multi_lang_name = [{
                    lang: defaultLanguage,
                    text: data.name
                }];
            }
            jQuery.each(data.multi_lang_name, function (index, name) {
                name.text = WC.Utility.ToString(name.text);

                avaliableLanguages.push(name.lang);
            });

            // multi_lang_description
            var descriptions = WC.Utility.ToArray(data.multi_lang_description).slice();
            if (!descriptions.length && data.description) {
                descriptions = [{
                    lang: defaultLanguage,
                    text: data.description
                }];
            }
            data.multi_lang_description = [];
            jQuery.each(avaliableLanguages, function (index, lang) {
                var description = descriptions.findObject('lang', lang);
                if (description) {
                    description.text = WC.Utility.ToString(description.text);
                    data.multi_lang_description.push(description);
                }
                else {
                    data.multi_lang_description.push({
                        lang: lang,
                        text: ''
                    });
                }
            });
        };

        _self.ExtendFilterStep = function (step) {
            self.ExtendValidProperty(step);

            step.field = WC.Utility.ToString(step.field);
            step.operator = WC.Utility.ToString(step.operator);

            step.execution_parameter_id = WC.Utility.ToString(step.execution_parameter_id);
            step.is_execution_parameter = WC.Utility.ToBoolean(step.is_execution_parameter);

            step.arguments = WC.Utility.ToArray(step.arguments);
            jQuery.each(step.arguments, function (indexArgument, argument) {
                if (!argument)
                    return;

                if (argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.VALUE && typeof argument.value === 'undefined')
                    argument.value = null;
                if (!argument.included_end_date)
                    delete argument.included_end_date;
                self.ExtendValidProperty(argument);
            });
        };
        _self.ExtendJumpStep = function (step) {
            self.ExtendValidProperty(step);

            step.followup = WC.Utility.ToString(step.followup);
        };
        _self.ExtendSortingStep = function (step) {
            self.RemoveValidProperty(step);

            step.sorting_fields = WC.Utility.ToArray(step.sorting_fields);
            jQuery.each(step.sorting_fields, function (indexSort, sort) {
                sort.field_id = WC.Utility.ToString(sort.field_id);
                sort.sort_index = WC.Utility.ToNumber(sort.sort_index);
                sort.sort_order = sort.sort_order || 'ASC';

                self.ExtendValidProperty(sort);
            });
        };
        _self.ExtendAggregationStep = function (step) {
            self.RemoveValidProperty(step);

            step.aggregation_fields = WC.Utility.ToArray(step.aggregation_fields);
            jQuery.each(step.aggregation_fields, function (indexAggregationField, aggregationField) {
                self.ExtendValidProperty(aggregationField);

                // delete source field for count field
                if (aggregationField.field === enumHandlers.AGGREGATION.COUNT.Value)
                    delete aggregationField.source_field;
            });

            step.grouping_fields = WC.Utility.ToArray(step.grouping_fields);
            jQuery.each(step.grouping_fields, function (indexGroup, groupField) {
                self.ExtendValidProperty(groupField);
            });
            if (!step.grouping_fields.length)
                delete step.grouping_fields;
        };
        self.ExtendQueryBlock = function (queryBlock) {
            queryBlock = self.CleanData(queryBlock);

            if (queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES) {
                queryBlock.base_classes = WC.Utility.ToArray(queryBlock.base_classes);

                self.ExtendValidProperty(queryBlock);
            }
            else if (queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                self.RemoveValidProperty(queryBlock);

                jQuery.each(queryBlock.query_steps, function (index, step) {
                    if (step.step_type === enumHandlers.FILTERTYPE.FILTER)
                        _self.ExtendFilterStep(step);
                    else if (step.step_type === enumHandlers.FILTERTYPE.FOLLOWUP)
                        _self.ExtendJumpStep(step);
                    else if (step.step_type === enumHandlers.FILTERTYPE.SORTING)
                        _self.ExtendSortingStep(step);
                    else if (step.step_type === enumHandlers.FILTERTYPE.AGGREGATION)
                        _self.ExtendAggregationStep(step);

                    // custom properties
                    step.is_adhoc_filter = WC.Utility.ToBoolean(step.is_adhoc_filter);
                    step.is_adhoc = WC.Utility.ToBoolean(step.is_adhoc);
                });
            }

            return queryBlock;
        };

        self.RemoveReadOnlyQueryStep = function (step) {
            self.RemoveValidProperty(step);
            jQuery.each(step, function (name, value) {
                if (jQuery.isFunction(value))
                    delete step[name];
            });
            delete step.uri;
            delete step.is_adhoc_filter;
            delete step.is_adhoc;
            delete step.is_applied;
            delete step.is_dashboard_filter;
            delete step.can_include_end_date;
            delete step.included_end_date;
            delete step.valid_field;
            delete step.tech_info;
            delete step.step_type_index;
            delete step.edit_mode;
            delete step.model;
            delete step.execution_parameter_id;

            if (!step.is_execution_parameter) {
                delete step.is_execution_parameter;
            }

            if (step.step_type === enumHandlers.FILTERTYPE.FILTER)
                step.arguments = WC.Utility.ToArray(step.arguments);

            if (step.arguments) {
                jQuery.each(step.arguments, function (indexArgument, argument) {
                    if (!argument)
                        return;

                    if (argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.VALUE && typeof argument.value === 'undefined')
                        argument.value = null;
                    self.RemoveValidProperty(argument);
                });
            }

            if (step.sorting_fields) {
                jQuery.each(step.sorting_fields, function (indexSort, sort) {
                    self.RemoveValidProperty(sort);
                });
            }

            if (step.aggregation_fields) {
                jQuery.each(step.aggregation_fields, function (indexAggregationField, aggregationField) {
                    self.RemoveValidProperty(aggregationField);
                    delete aggregationField.tech_info;

                    // delete source field for count field
                    if (aggregationField.field === enumHandlers.AGGREGATION.COUNT.Value) {
                        delete aggregationField.source_field;
                    }
                });
            }
            if (step.grouping_fields) {
                jQuery.each(step.grouping_fields, function (indexGroup, groupField) {
                    self.RemoveValidProperty(groupField);
                    delete groupField.tech_info;
                });
                if (!step.grouping_fields.length)
                    delete step.grouping_fields;
            }
        };
        self.RemoveReadOnlyQueryBlock = function (queryBlock) {
            queryBlock = self.CleanData(queryBlock);

            if (queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES) {
                self.RemoveValidProperty(queryBlock);
            }
            else if (queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                jQuery.each(queryBlock.query_steps, function (index, step) {
                    self.RemoveReadOnlyQueryStep(step);
                });
            }

            return queryBlock;
        };

        self.ExtendAuthorization = function (data) {
            if (!data.authorizations)
                data.authorizations = {};

            var cloneData = ko.toJS(data);
            var isPublic = typeof cloneData.is_published !== 'undefined' ? cloneData.is_published : !!cloneData.is_public;
            var currentUser = userModel.Data() ? userModel.Data().uri : '';
            var isCreateUser = !cloneData.created || cloneData.created.user === currentUser;
            data.authorizations.update_user_specific = isPublic || isCreateUser;
        };

        self.IsAdhocUri = function (uri) {
            var lastUriPart = '';
            if (uri) {
                var uriParts = uri.split('/');
                lastUriPart = uriParts[uriParts.length - 1];
            }
            return !/^\d+$/g.test(lastUriPart);
        };

        _self.ExtendAngleDefaultDisplay = function (data) {
            data.angle_default_display = WC.Utility.ToString(data.angle_default_display);
            if (data.display_definitions.length) {
                var defaultDisplayProperty = data.angle_default_display.indexOf('/displays/') !== -1 ? 'uri' : 'id';
                var defaultDisplay = data.display_definitions.findObject(defaultDisplayProperty, data.angle_default_display);
                if (!defaultDisplay)
                    data.angle_default_display = data.display_definitions[0].id;
                else
                    data.angle_default_display = defaultDisplay.id;
            }
        };
        _self.ExtendAngleUserSpecific = function (data) {
            data.user_specific = data.user_specific || {};
            data.user_specific.execute_on_login = WC.Utility.ToBoolean(data.user_specific.execute_on_login);
            data.user_specific.is_starred = WC.Utility.ToBoolean(data.user_specific.is_starred);
            data.user_specific.private_note = WC.Utility.ToString(data.user_specific.private_note);
            data.user_specific.private_tags = WC.Utility.ToArray(data.user_specific.private_tags);
            data.user_specific.times_executed = WC.Utility.ToNumber(data.user_specific.times_executed);
        };
        _self.ExtendAngleAuthorization = function (data) {
            data.authorizations = data.authorizations || {};
            data.authorizations.create_private_display = WC.Utility.ToBoolean(data.authorizations.create_private_display);
            data.authorizations.create_public_display = WC.Utility.ToBoolean(data.authorizations.create_public_displa);
            data.authorizations.delete = WC.Utility.ToBoolean(data.authorizations['delete']);
            data.authorizations.update = WC.Utility.ToBoolean(data.authorizations.update);
            data.authorizations.mark_template = WC.Utility.ToBoolean(data.authorizations.mark_template);
            data.authorizations.unmark_template = WC.Utility.ToBoolean(data.authorizations.unmark_template);
            data.authorizations.publish = WC.Utility.ToBoolean(data.authorizations.publish);
            data.authorizations.unpublish = WC.Utility.ToBoolean(data.authorizations.unpublish);
            data.authorizations.validate = WC.Utility.ToBoolean(data.authorizations.validate);
            data.authorizations.unvalidate = WC.Utility.ToBoolean(data.authorizations.unvalidate);
            self.ExtendAuthorization(data);
        };
        self.ExtendAngleData = function (data) {
            data = self.CleanData(data);

            // common
            data.id = WC.Utility.ToString(data.id);
            data.uri = WC.Utility.ToString(data.uri);
            data.model = WC.Utility.ToString(data.model);
            data.assigned_labels = WC.Utility.ToArray(data.assigned_labels);
            data.assigned_tags = WC.Utility.ToArray(data.assigned_tags);
            data.allow_more_details = WC.Utility.ToBoolean(data.allow_more_details);
            data.allow_followups = WC.Utility.ToBoolean(data.allow_followups && data.allow_more_details);
            data.has_warnings = WC.Utility.ToBoolean(data.has_warnings);
            data.is_deleted = WC.Utility.ToBoolean(data.is_deleted);
            data.is_parameterized = WC.Utility.ToBoolean(data.is_parameterized);
            data.is_published = WC.Utility.ToBoolean(data.is_published);
            data.is_template = WC.Utility.ToBoolean(data.is_template);
            data.is_validated = WC.Utility.ToBoolean(data.is_validated);
            data.displays = data.displays || (data.uri + '/displays');
            data.labels = data.labels || (data.uri + '/labels');
            data.business_processes = data.business_processes || (data.uri + '/business_processes');
            data.grouping_labels = data.grouping_labels || (data.uri + '/grouping_labels');
            data.privilege_labels = data.privilege_labels || (data.uri + '/privilege_labels');
            data.state = data.state || (data.uri + '/state');
            data.created = data.created || null;
            data.changed = data.changed || null;
            data.executed = data.executed || null;
            data.validated = data.validated || null;

            // multilingual
            self.ExtendMultiLinguals(data);

            // display_definitions
            data.display_definitions = WC.Utility.ToArray(data.display_definitions);
            jQuery.each(data.display_definitions, function (index, display) {
                data.display_definitions[index] = self.ExtendDisplayData(display, data);
            });

            // query_definition
            data.query_definition = WC.Utility.ToArray(data.query_definition);
            jQuery.each(data.query_definition, function (index, queryBlock) {
                data.query_definition[index] = self.ExtendQueryBlock(queryBlock);
            });

            // angle_default_display
            _self.ExtendAngleDefaultDisplay(data);

            // user_specific
            _self.ExtendAngleUserSpecific(data);

            // authorizations
            _self.ExtendAngleAuthorization(data);

            return data;
        };

        self.RemoveReadOnlyAngleData = function (data) {
            data = self.CleanData(data);

            // empty multi_lang_description
            if (data.multi_lang_description)
                data.multi_lang_description.removeObject('text', '');

            var descriptions = WC.Utility.ToArray(data.multi_lang_description);
            jQuery.each(WC.Utility.ToArray(data.multi_lang_name), function (index, name) {
                var description = descriptions.findObject('lang', name.lang);
                if (!description) {
                    descriptions.push({
                        lang: name.lang,
                        text: ''
                    });
                }
            });

            // query_definition
            jQuery.each(WC.Utility.ToArray(data.query_definition), function (index, queryBlock) {
                data.query_definition[index] = self.RemoveReadOnlyQueryBlock(queryBlock);
            });

            // display_definitions
            jQuery.each(WC.Utility.ToArray(data.display_definitions), function (index, display) {
                data.display_definitions[index] = self.RemoveReadOnlyDisplayData(display);
            });

            // user_specific
            if (data.user_specific) {
                delete data.user_specific.times_executed;
                delete data.user_specific.user_default_display;
            }

            // authorizations
            delete data.authorizations;

            // others
            delete data.uri;
            delete data.created;
            delete data.changed;
            delete data.executed;
            delete data.validated;
            delete data.published;
            delete data['deleted'];
            delete data.state;
            delete data.displays_summary;
            delete data.displays;
            delete data.labels;
            delete data.business_processes;
            delete data.privilege_labels;
            delete data.grouping_labels;
            delete data.authorizations;
            delete data.privileges;
            delete data.has_warnings;
            delete data.is_deleted;
            delete data.is_parameterized;
            delete data.package;

            return data;
        };

        _self.ExtendDisplayDetails = function (data, angle) {
            var displayDetails = WC.Utility.ParseJSON(data.display_details);
            if (displayDetails.drilldown_uri && angle) {
                // check exisitng drilldown_display
                // change drilldown_uri -> drilldown_display
                var drilldownDisplay = angle.display_definitions.findObject('uri', displayDetails.drilldown_uri);
                if (drilldownDisplay) {
                    displayDetails.drilldown_display = drilldownDisplay.id;
                }
                delete displayDetails.drilldown_uri;
                data.display_details = JSON.stringify(displayDetails);
            }
            if (data.display_type === enumHandlers.DISPLAYTYPE.CHART) {
                if (!displayDetails.chart_type)
                    displayDetails.chart_type = enumHandlers.CHARTTYPE.COLUMNCHART.Code;
                if (!displayDetails.stack)
                    displayDetails.stack = false;
                if (!displayDetails.multi_axis)
                    displayDetails.multi_axis = false;
            }
            data.display_details = JSON.stringify(displayDetails);
        };
        _self.ExtendDisplayAggregation = function (data) {
            var getUpdatedField = function (sourceField, fieldDetails) {
                var field = data.fields.findObject('field', sourceField.field, false);
                if (!field) {
                    field = {
                        field: sourceField.field,
                        field_details: JSON.stringify(fieldDetails),
                        multi_lang_alias: []
                    };
                }
                else {
                    field.field = sourceField.field;
                }
                field.valid = sourceField.valid;
                field.validation_details = sourceField.validation_details;
                return field;
            };
            var displayQueryStepBlock = data.query_blocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            if (displayQueryStepBlock) {
                var displayAggrStep = displayQueryStepBlock.query_steps.findObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION);
                if (displayAggrStep) {
                    // clean grouping_fields
                    if (displayAggrStep.grouping_fields && !displayAggrStep.grouping_fields.length) {
                        delete displayAggrStep.grouping_fields;
                    }

                    // check missing field in data.fields
                    var newFields = [];
                    jQuery.each(WC.Utility.ToArray(displayAggrStep.grouping_fields), function (index, grouping) {
                        var field = getUpdatedField(grouping, {});
                        var details = WC.Utility.ParseJSON(field.field_details);
                        if (typeof details[enumHandlers.FIELDDETAILPROPERTIES.AREA] === 'undefined') {
                            details[enumHandlers.FIELDDETAILPROPERTIES.AREA] = index === 0 ? AggregationFieldViewModel.Area.Row : AggregationFieldViewModel.Area.Column;
                            field.field_details = JSON.stringify(details);
                        }
                        newFields.push(field);
                    });

                    var areaDataName = AggregationFieldViewModel.Area.Data;
                    jQuery.each(WC.Utility.ToArray(displayAggrStep.aggregation_fields), function (index, aggregation) {
                        var defaultDetails = {};
                        defaultDetails[enumHandlers.FIELDDETAILPROPERTIES.AREA] = areaDataName;
                        var field = getUpdatedField(aggregation, defaultDetails);
                        var details = WC.Utility.ParseJSON(field.field_details);
                        if (details[enumHandlers.FIELDDETAILPROPERTIES.AREA] !== areaDataName) {
                            details[enumHandlers.FIELDDETAILPROPERTIES.AREA] = areaDataName;
                            field.field_details = JSON.stringify(details);
                        }
                        newFields.push(field);
                    });
                    data.fields = newFields;
                }
            }
        };
        _self.ExtendDisplayField = function (field) {
            if (!field.field_details)
                field.field_details = '{}';
            field.multi_lang_alias = WC.Utility.ToArray(field.multi_lang_alias);

            self.ExtendValidProperty(field);
        };
        _self.ExtendDisplayFields = function (display) {
            if (display.display_type === enumHandlers.DISPLAYTYPE.LIST && !display.fields.length) {
                jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
                    display.fields.push({ field: fieldId });
                });
            }

            jQuery.each(display.fields, function (index, field) {
                _self.ExtendDisplayField(field);
            });
        };
        _self.ExtendDisplayUserSpecific = function (data) {
            data.user_specific = data.user_specific || {};
            data.user_specific.execute_on_login = WC.Utility.ToBoolean(data.user_specific.execute_on_login);
            data.user_specific.is_user_default = WC.Utility.ToBoolean(data.user_specific.is_user_default);
        };
        _self.ExtendDisplayAuthorization = function (data) {
            data.authorizations = data.authorizations || {};
            data.authorizations.make_angle_default = WC.Utility.ToBoolean(data.authorizations.make_angle_default);
            data.authorizations['delete'] = WC.Utility.ToBoolean(data.authorizations['delete']);
            data.authorizations.update = WC.Utility.ToBoolean(data.authorizations.update);
            data.authorizations.publish = WC.Utility.ToBoolean(data.authorizations.publish);
            data.authorizations.unpublish = WC.Utility.ToBoolean(data.authorizations.unpublish);
            self.ExtendAuthorization(data);
        };
        self.ExtendDisplayData = function (data, angle) {
            data = self.CleanData(data);

            // common
            data.id = WC.Utility.ToString(data.id);
            data.uri = WC.Utility.ToString(data.uri);
            data.display_type = WC.Utility.ToString(data.display_type);
            data.used_in_task = WC.Utility.ToBoolean(data.used_in_task);
            data.is_parameterized = WC.Utility.ToBoolean(data.is_parameterized);
            data.is_public = WC.Utility.ToBoolean(data.is_public);
            data.is_angle_default = WC.Utility.ToBoolean(data.is_angle_default);
            data.angle_id = WC.Utility.ToString(data.angle_id || data.uri.split('/')[1]);
            data.state = data.state || (data.uri + '/states');
            data.created = data.created || null;
            data.changed = data.changed || null;
            data.is_available_externally = WC.Utility.ToBoolean(data.is_available_externally);
            if (data.display_type !== enumHandlers.DISPLAYTYPE.CHART && !angle.is_template)
                data.external_id = WC.Utility.ToString(data.external_id);

            // display_details
            _self.ExtendDisplayDetails(data, angle);

            // multilingual
            self.ExtendMultiLinguals(data);

            // fields #1
            data.fields = WC.Utility.ToArray(data.fields);

            // query_blocks
            data.query_blocks = WC.Utility.ToArray(data.query_blocks);
            jQuery.each(data.query_blocks, function (index, queryBlock) {
                data.query_blocks[index] = self.ExtendQueryBlock(queryBlock);
            });

            // re-check chart & pivot for fields & query_blocks
            if (data.display_type === enumHandlers.DISPLAYTYPE.CHART || data.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                _self.ExtendDisplayAggregation(data);
            }

            // fields #2
            _self.ExtendDisplayFields(data);

            // user_specific
            _self.ExtendDisplayUserSpecific(data);

            // authorizations
            _self.ExtendDisplayAuthorization(data);

            // custom properties
            data.results = data.results || null;

            return data;
        };

        self.RemoveReadOnlyDisplayData = function (data) {
            data = self.CleanData(data);

            // empty multi_lang_description
            if (data.multi_lang_description)
                data.multi_lang_description.removeObject('text', '');

            var descriptions = WC.Utility.ToArray(data.multi_lang_description);
            jQuery.each(WC.Utility.ToArray(data.multi_lang_name), function (index, name) {
                var description = descriptions.findObject('lang', name.lang);
                if (!description) {
                    descriptions.push({
                        lang: name.lang,
                        text: ''
                    });
                }
            });

            // fields
            if (data.fields)
                data.fields = self.RemoveReadOnlyFields(data.fields);

            // query_blocks
            jQuery.each(WC.Utility.ToArray(data.query_blocks), function (index, queryBlock) {
                data.query_blocks[index] = self.RemoveReadOnlyQueryBlock(queryBlock);
            });

            // others
            delete data.angle_id;
            delete data.created;
            delete data.changed;
            delete data.authorizations;
            delete data.privileges;
            delete data.state;
            delete data.is_parameterized;

            // custom
            delete data.results;

            return data;
        };

        self.RemoveReadOnlyFields = function (fields) {
            fields = WC.Utility.ToArray(self.CleanData({ fields: fields }).fields);

            jQuery.each(fields, function (index, field) {
                self.RemoveValidProperty(field);
            });

            return fields;
        };

        self.GetChangeAngle = function (currentData, compareData, isCheckDisplay) {
            if (typeof isCheckDisplay === 'undefined')
                isCheckDisplay = false;

            var data1 = self.RemoveReadOnlyAngleData(currentData);
            var data2 = self.RemoveReadOnlyAngleData(compareData);

            if (!isCheckDisplay) {
                delete data1.display_definitions;
                delete data2.display_definitions;
            }

            var checkSensitive, checkSort;
            jQuery.each(data1, function (key) {
                if (key === 'display_definitions') {
                    data1[key].sortObject('uri');
                    data2[key].sortObject('uri');
                    jQuery.each(data1[key], function (index) {
                        var changeDisplay = self.GetChangeDisplay(data1[key][index], data2[key][index]);
                        if (changeDisplay) {
                            delete data1[key];
                            return false;
                        }
                    });
                }
                else {
                    if (key === 'query_definition') {
                        checkSensitive = false;
                        checkSort = false;
                    }
                    else {
                        checkSensitive = true;
                        checkSort = true;
                    }
                    if (jQuery.deepCompare(data1[key], data2[key], checkSensitive, checkSort))
                        delete data1[key];
                }
            });

            return jQuery.isEmptyObject(data1) ? null : data1;
        };

        self.GetChangeDisplay = function (currentData, compareData) {
            var data1 = self.RemoveReadOnlyDisplayData(currentData);
            var data2 = self.RemoveReadOnlyDisplayData(compareData);

            var checkSensitive, checkSort;
            jQuery.each(data1, function (key) {
                if (key === 'query_blocks' || key === 'fields') {
                    checkSensitive = false;
                    checkSort = false;
                }
                else {
                    checkSensitive = true;
                    checkSort = true;
                }

                if (jQuery.deepCompare(data1[key], data2[key], checkSensitive, checkSort))
                    delete data1[key];
            });

            // check display_details
            self.GetChangeDisplayDetails(data1, data2);

            return jQuery.isEmptyObject(data1) ? null : data1;
        };

        self.GetChangeDisplayDetails = function (data1, data2) {
            if (data1.display_details) {
                var displayDetails1 = WC.Utility.ParseJSON(data1.display_details);
                var displayDetails2 = WC.Utility.ParseJSON(data2.display_details);
                jQuery.each(displayDetails1, function (key) {
                    if (jQuery.deepCompare(displayDetails1[key], displayDetails2[key]))
                        delete displayDetails1[key];
                });
                if (jQuery.isEmptyObject(displayDetails1)
                    && !self.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2)
                    && !self.DisplayExcelTemplateIsChangedToDefault(displayDetails1, displayDetails2))
                    delete data1.display_details;
            }
        };

        self.DefaultDrillDownDisplayIsChanged = function (displayDetails1, displayDetails2) {
            return (displayDetails1["drilldown_display"] === undefined && displayDetails2["drilldown_display"] !== undefined);
        };

        self.DisplayExcelTemplateIsChangedToDefault = function (displayDetails1, displayDetails2) {
            return (displayDetails1["excel_template"] === undefined && displayDetails2["excel_template"] !== undefined);
        };

        _self.MetadataFromBlockQueryStep = function (metadata, queryBlock) {
            var addFieldsAndSources = function (object, fieldName) {
                if (object[fieldName])
                    metadata.fields.push(object[fieldName]);
                if (object.validation_details && object.validation_details.source)
                    metadata.sources.push(object.validation_details.source);
            };
            jQuery.each(queryBlock.query_steps, function (index, queryStep) {
                if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                    addFieldsAndSources(queryStep, 'field');

                    jQuery.each(WC.Utility.ToArray(queryStep.arguments), function (index, arg) {
                        addFieldsAndSources(arg, 'field');
                    });
                }
                else if (queryStep.step_type === enumHandlers.FILTERTYPE.SORTING) {
                    jQuery.each(WC.Utility.ToArray(queryStep.sorting_fields), function (index, sorting) {
                        addFieldsAndSources(sorting, 'field_id');
                    });
                }
                else if (queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                    jQuery.each(WC.Utility.ToArray(queryStep.aggregation_fields), function (aggIndex, aggregationField) {
                        addFieldsAndSources(aggregationField, 'source_field');
                    });

                    jQuery.each(WC.Utility.ToArray(queryStep.grouping_fields), function (aggIndex, groupingField) {
                        addFieldsAndSources(groupingField, 'source_field');
                    });
                }
                else if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                    metadata.followups.push(queryStep.followup);
                }
            });
        };
        self.GetAllMetadata = function (model) {
            var metadata = {
                classes: [],
                fields: [],
                followups: [],
                sources: []
            };

            // angle query_definition
            jQuery.each(WC.Utility.ToArray(model.query_definition), function (index, block) {
                if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES) {
                    metadata.classes = block.base_classes.slice();
                }
                else if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                    _self.MetadataFromBlockQueryStep(metadata, block);
                }
            });

            // display fields
            if (model.display_type === enumHandlers.DISPLAYTYPE.LIST) {
                jQuery.each(WC.Utility.ToArray(model.fields), function (index, field) {
                    metadata.fields.push(field.field);
                    if (field.validation_details && field.validation_details.source)
                        metadata.sources.push(field.validation_details.source);
                });
            }

            // display query_blocks
            jQuery.each(WC.Utility.ToArray(model.query_blocks), function (index, block) {
                if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS)
                    _self.MetadataFromBlockQueryStep(metadata, block);
            });

            // distinct metadata
            metadata.classes = metadata.classes.distinct();
            metadata.fields = metadata.fields.distinct();
            metadata.followups = metadata.followups.distinct();
            metadata.sources = metadata.sources.distinct();

            return metadata;
        };

        self.HasFilter = function (queryBlocks) {
            var queryStepsBlock = WC.Utility.ToArray(queryBlocks).findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            if (queryStepsBlock) {
                return queryStepsBlock.query_steps.hasObject('step_type', function (stepType) {
                    return stepType === enumHandlers.FILTERTYPE.FOLLOWUP || stepType === enumHandlers.FILTERTYPE.FILTER;
                });
            }
            return false;
        };

        self.HasFollowup = function (queryBlocks) {
            var queryStepsBlock = WC.Utility.ToArray(queryBlocks).findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            if (queryStepsBlock) {
                return queryStepsBlock.query_steps.hasObject('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
            }
            return false;
        };

        self.CanUpdateItem = function (name, canUpdate, isValidated, disallowedNames) {
            /// <summary>check can update Dashboard</summary>
            /// <param name="name" type="String">Item's property which will be checked in case validated item</param>
            /// <param name="canUpdate" type="Boolean"></param>
            /// <param name="isValidated" type="Boolean"></param>
            /// <param name="disallowedNames" type="Array">disallow properties to be updated when validated</param>
            /// <returns type="Boolean"></returns>

            // validated Dashboard disallow to update some properties
            if (isValidated && canUpdate && jQuery.inArray(name, disallowedNames) !== -1)
                return false;

            return canUpdate;
        };
    }

    window.WC.ModelHelper = helper || new ModelHelper();

})(window, WC.ModelHelper);
