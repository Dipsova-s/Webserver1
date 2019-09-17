function WidgetFilterHandler(container, models) {
    "use strict";

    var self = this;
    jQuery.extend(self, WC.WidgetFilterHelper);
    self.Identity = 'WidgetFilterHandler';
    self.Element = jQuery(container);
    self.Data = ko.observableArray([]);
    self.View = new WidgetFilterView(self);
    self.FilterFor = null;
    self.FILTERFOR = {
        ANGLE: 'Angle',
        DISPLAY: 'Display',
        DASHBOARD: 'Dashboard'
    };
    self.CompareInfo = null;
    self.FollowupInfo = null;
    self.HasExecutionParameter = ko.observable(false);
    self.CanUseCompareField = ko.observable(true);
    self.Sortable = ko.observable(true);
    self.ModelUri = '';
    self.SwitchOperator = false;

    self.VIEWMODE = {
        LISTVIEW: 'listview',
        TREEVIEW: 'treeview'
    };
    self.ViewMode = ko.observable(self.VIEWMODE.LISTVIEW);

    // actions
    self.ApplyHandler = function () {
        // clean element
        self.View.CleanHtmlElements();
        self.View.BindingAndSortingElementFilter();

        // tooltips
        WC.HtmlHelper.Tooltip.Create('tooltip.widgetfilter', '.btnAddFilterFromJump');

        return self.CreateFromQuerySteps(self.Data());
    };
    self.ReApplyHandler = function () {
        self.View.KoCleanNode();
        return self.ApplyHandler();
    };
    self.SetTreeViewMode = function () {
        self.ViewMode(self.VIEWMODE.TREEVIEW);
    };

    // move filter
    self.CanFiltersMovable = function () {
        return typeof self.View.CreateMovableArea() !== 'undefined';
    };
    self.CanFilterMoveToAngle = function (queryStep, index) {
        var firstJumpIndex = self.Data().indexOfObject('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        var canMoveQueryStep = typeof self.View.CreateMovableArea() !== 'undefined' && (firstJumpIndex === -1 || index < firstJumpIndex);

        return canMoveQueryStep && queryStep.step_type === enumHandlers.FILTERTYPE.FILTER;
    };

    // Add Filters from 'Add Filter' button, Remove filter from 'x' button
    self.AddFilterModelFromField = function (field, queryType, index) {
        // append to bottom if no specify
        if (typeof index === 'undefined')
            index = self.Data().length;

        var modelFilter;
        if (queryType === enumHandlers.FILTERTYPE.FILTER) {
            modelFilter = {
                step_type: queryType,
                field: field.id,
                operator: self.GetDefaultFilterOperator(field.fieldtype).Value,
                arguments: self.GetDefaultFilterOperatorArguments(field.fieldtype)
            };
            if (self.HasExecutionParameter()) {
                modelFilter.is_execution_parameter = false;
                modelFilter.execution_parameter_id = '';
            }
        }
        else if (queryType === enumHandlers.FILTERTYPE.FOLLOWUP) {
            modelFilter = {
                step_type: queryType,
                followup: field.id,
                uri: field.uri
            };
        }

        if (modelFilter) {
            var model = new WidgetFilterModel(modelFilter, false);
            self.Data.splice(index, 0, model);

            return model;
        }
    };
    self.AddFieldFollowup = function (field) {
        modelFollowupsHandler.SetFollowups([field]);

        return self.AddFilterModelFromField(field, enumHandlers.FILTERTYPE.FOLLOWUP);
    };
    self.AddFieldFilter = function (field) {
        self.InsertFieldFilter(field, self.Data().length);
    };
    self.InsertFieldFilter = function (field, insertIndex, toggleHandler) {
        modelFieldsHandler.SetFields([field], self.ModelUri);

        toggleHandler = toggleHandler || function () {
            self.View.ToggleTreeViewHeader('FilterHeader-' + insertIndex);
            self.View.Toggle('FilterHeader-' + insertIndex);
        };

        modelFieldsHandler.LoadFieldsMetadata([field])
            .done(function () {
                self.AddFilterModelFromField(field, enumHandlers.FILTERTYPE.FILTER, insertIndex);
                self.CreateFromQuerySteps(self.Data());

                toggleHandler();
            });
    };
    self.SetCompareFieldFilter = function (field, targetIndex) {
        modelFieldsHandler.SetFields([field], self.ModelUri);

        targetIndex += '';
        modelFieldsHandler.LoadFieldsMetadata([field])
            .done(function () {
                if (field.fieldtype === enumHandlers.FIELDTYPE.ENUM && !field.domain) {
                    popup.Info(Localization.Info_TheFieldYouSelectedNotEnumeratedType);
                    fieldsChooserModel.ClosePopup();
                }
                else if (targetIndex.indexOf('_') !== -1) {
                    self.View.SetArgumentField(targetIndex, field.id);
                    self.ApplyAdvanceFilterWhenAction(targetIndex);
                }
                else {
                    var fieldName = userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.FIELDSOURCE_AND_LONGNAME);
                    self.RenderCompareFieldView(fieldName, field.id, field.fieldtype, targetIndex);
                }
            });
    };
    self.AddFilterFromTreeHeader = function (data, event) {
        var field = modelFieldsHandler.GetFieldById(data.field, self.ModelUri);
        if (!field)
            return;

        var currentIndex = self.Data.indexOf(data);
        var insertIndex = self.GetInsertFilterPosition(data.field, currentIndex);
        self.InsertFieldFilter(field, insertIndex, function () {
            // expand panels
            if (!jQuery(event.currentTarget).parent().hasClass('Expand'))
                self.View.ToggleTreeViewHeader('FilterHeader-' + currentIndex);

            self.View.Toggle('FilterHeader-' + insertIndex);
        });
    };
    self.GetInsertFilterPosition = function (fieldId, currentIndex) {
        var insertIndex = currentIndex + 1;
        for (var index = insertIndex; index < self.Data().length; index++) {
            if (self.Data()[index].field !== fieldId)
                break;

            insertIndex = index + 1;
        }
        return insertIndex;
    };
    self.RemoveFilter = function (data) {
        jQuery(document).trigger('click');
        setTimeout(function () {
            var filters = self.Data();
            if (data.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                // M4-33645: Allow deleting a jump without having to delete filters

                var dataIndex = filters.indexOf(data);
                for (var i = filters.length - 1; i >= dataIndex; i--) {
                    if (self.IsFilterOrJumpQueryStep(filters[i].step_type))
                        self.Data.remove(filters[i]);
                }
            }
            else {
                self.Data.remove(data);
            }
            self.CreateFromQuerySteps(self.Data());
        });
    };
    self.ShowCompareFilterPopup = function (fieldType, elementIndex) {
        var elementId = 'Operator-' + self.GetAdvanceElementIndex(elementIndex) + '-DropdownList';

        self.CompareInfo = {
            Index: elementIndex + ''
        };

        if (fieldType === enumHandlers.FIELDTYPE.PERIOD)
            fieldType = enumHandlers.FIELDTYPE.TIMESPAN;
        else if (fieldType === enumHandlers.FIELDTYPE.INTEGER || fieldType === enumHandlers.FIELDTYPE.DOUBLE)
            fieldType = enumHandlers.FIELDTYPE.NUMBER;

        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, fieldType.toLowerCase(), self);

        return elementId;
    };
    self.ShowAddFilterFromJumpPopup = function (data) {
        self.FollowupInfo = {
            Index: self.Data.indexOf(data),
            Data: data
        };
        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, enumHandlers.ANGLEPOPUPTYPE.ANGLE, self);
    };
    self.SetFieldChoooserInfo = function (baseClasses, angleSteps, displaySteps) {
        if (self.CanUseCompareField()) {
            fieldsChooserHandler.ModelUri = self.ModelUri;
            fieldsChooserHandler.AngleClasses = baseClasses;

            if (self.FilterFor === self.FILTERFOR.DISPLAY) {
                fieldsChooserHandler.AngleSteps = angleSteps;
                fieldsChooserHandler.DisplaySteps = displaySteps || self.Data();
            }
            else {
                fieldsChooserHandler.AngleSteps = angleSteps || self.Data();
                fieldsChooserHandler.DisplaySteps = [];
            }
        }

        return fieldsChooserHandler;
    };
    self.ShowFieldInfo = function (data, e) {
        var headerElement = jQuery(e.currentTarget).closest('.FilterHeader');

        jQuery(document).trigger('click');
        var fieldInfo = {
            Id: data.field || data.followup,
            HelpType: data.field ? helpTextHandler.HELPTYPE.FIELD : helpTextHandler.HELPTYPE.FOLLOWUP,
            ModelUri: self.ModelUri
        };
        setTimeout(function () {
            headerElement.trigger('click');
            helpTextHandler.ShowHelpTextPopup(fieldInfo.Id, fieldInfo.HelpType, fieldInfo.ModelUri);
        });

        return fieldInfo;
    };
    self.HasDefinition = function (definitions) {
        return definitions.hasObject('step_type', function (stepType) {
            return WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(stepType);
        });
    };
    self.SetData = function (data) {
        self.Data.removeAll();
        jQuery.each(WC.Utility.ToArray(data), function (index, model) {
            self.Data.push(new WidgetFilterModel(model));
        });
    };
    self.GetData = function () {
        var querySteps = [];
        jQuery.each(ko.toJS(self.Data()), function (index, data) {
            if (data.step_type === enumHandlers.FILTERTYPE.FILTER) {
                data.arguments = WC.WidgetFilterHelper.AdjustFilterArguments(data.operator, data.arguments, self.ModelUri);
            }
            querySteps.push(new WidgetFilterModel(data));
        });
        return querySteps;
    };

    // authorization can be overriding
    self.CanChange = function (data) {
        var angleCannotUpdate = self.FilterFor === self.FILTERFOR.ANGLE && !angleInfoModel.CanUpdateAngle('query_definition');
        var displayCannotUpdate = self.FilterFor === self.FILTERFOR.DISPLAY && !displayModel.Data().authorizations.update;
        if (angleCannotUpdate || displayCannotUpdate) {
            return false;
        }

        if (!data)
            data = {};

        var canChange = false;
        if (resultModel.Data()) {
            if (data.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                canChange = resultModel.Data().authorizations.change_query_followups;
            }
            else {
                canChange = resultModel.Data().authorizations.change_query_filters;
            }
        }

        if (self.FilterFor === self.FILTERFOR.ANGLE) {
            return canChange || data.valid === false;
        }
        else if (self.FilterFor === self.FILTERFOR.DISPLAY) {
            return canChange || data.valid === false || data.is_adhoc_filter;
        }
        else {
            return false;
        }
    };
    self.CanRemove = function (data) {
        var angleCannotRemove = self.FilterFor === self.FILTERFOR.ANGLE && !angleInfoModel.CanUpdateAngle('query_definition');
        var displayCannotRemove = self.FilterFor === self.FILTERFOR.DISPLAY && !displayModel.Data().authorizations.update;
        if (angleCannotRemove || displayCannotRemove) {
            return false;
        }

        if (!data)
            data = {};

        /* M4-11917: Check cannot delete jump if it have filter(s) or jump(s) after if */
        // added function self.HaveFilterOrJumpAfterIndex to check allow delete if no filter(s) or jump(s) after current data
        /*  M4-33645: Allow deleting a jump without having to delete filters */
        // change from self.HaveFilterOrJumpAfterIndex to self.HaveJumpAfterIndex

        // find current filter/jump index
        var dataIndex = self.Data.indexOf(data);
        var canRemove = false;
        if (resultModel.Data()) {
            if (data.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                canRemove = resultModel.Data().authorizations.change_query_followups && !self.HaveJumpAfterIndex(dataIndex, self.Data());
            }
            else {
                canRemove = resultModel.Data().authorizations.change_query_filters;
            }
        }

        if (self.FilterFor === self.FILTERFOR.ANGLE) {
            return canRemove || data.valid === false;
        }
        else if (self.FilterFor === self.FILTERFOR.DISPLAY) {
            return canRemove || data.valid === false || data.is_adhoc_filter;
        }
        else {
            return false;
        }
    };
    self.IsReadOnly = function (data) {
        return !self.CanChange(data) && !self.CanRemove(data);
    };
    self.CanAddFilterFromJump = function (data) {
        var canChange = data.valid !== false && self.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, is_execution_parameter: ko.observable(false) });
        return canChange && data.step_type === enumHandlers.FILTERTYPE.FOLLOWUP && self.ViewMode() !== self.VIEWMODE.TREEVIEW;
    };

    // untility
    self.GetTemplateName = function (fieldType, operator) {
        var templateName;
        switch (operator) {
            case 'comparefield':
                templateName = 'COMPAREFIELD';
                break;
            case enumHandlers.OPERATOR.EQUALTO.Value:
            case enumHandlers.OPERATOR.NOTEQUALTO.Value:
            case enumHandlers.OPERATOR.SMALLERTHAN.Value:
            case enumHandlers.OPERATOR.GREATERTHAN.Value:
            case enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value:
            case enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value:
                switch (fieldType) {
                    case enumHandlers.FIELDTYPE.BOOLEAN:
                        templateName = 'BOOLEANTYPECRITERIA';
                        break;
                    case enumHandlers.FIELDTYPE.PERIOD:
                        templateName = 'CRITERIAGROUPTWO';
                        break;
                    default:
                        templateName = 'CRITERIAGROUPONE';
                        break;
                }
                break;
            case enumHandlers.OPERATOR.BETWEEN.Value:
            case enumHandlers.OPERATOR.NOTBETWEEN.Value:
                templateName = 'CRITERIAGROUPTWO';
                break;
            case enumHandlers.OPERATOR.INLIST.Value:
            case enumHandlers.OPERATOR.NOTINLIST.Value:
                if (fieldType === enumHandlers.FIELDTYPE.ENUM)
                    templateName = 'CRITERIAGROUPFOUR';
                else
                    templateName = 'CRITERIAGROUPTHREE';
                break;
            case enumHandlers.OPERATOR.CONTAIN.Value:
            case enumHandlers.OPERATOR.NOTCONTAIN.Value:
            case enumHandlers.OPERATOR.STARTWITH.Value:
            case enumHandlers.OPERATOR.NOTSTARTWITH.Value:
            case enumHandlers.OPERATOR.ENDON.Value:
            case enumHandlers.OPERATOR.NOTENDON.Value:
            case enumHandlers.OPERATOR.MATCHPATTERN.Value:
            case enumHandlers.OPERATOR.NOTMATCHPATTERN.Value:
                templateName = 'CRITERIAGROUPTHREE';
                break;
            default:
                templateName = 'DEFAULTCRITERIA';
                break;
        }

        return templateName;
    };
    self.GetAdvanceTemplateName = function (argumentType) {
        switch (argumentType) {
            case enumHandlers.FILTERARGUMENTTYPE.FIELD:
                return 'CRITERIAADVANCE_FIELD';
            case enumHandlers.FILTERARGUMENTTYPE.FUNCTION:
                return 'CRITERIAADVANCE_FUNCTION';
            default:
                return 'CRITERIAADVANCE_VALUE';
        }
    };
    self.CreateFromQuerySteps = function (querySteps) {
        var filterControls = [];
        var foundFirstFilterOrJump = false;
        jQuery.each(querySteps, function (index, queryStep) {
            if (!foundFirstFilterOrJump && self.IsFilterOrJumpQueryStep(queryStep.step_type)) {
                self.View.SetFirtFilterOrJumpCssClass(index);
                foundFirstFilterOrJump = true;
            }

            if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER && self.CanChange(queryStep)) {
                var element = self.View.GetOperatorElement(index);
                if (element.length && queryStep.valid) {
                    var field = modelFieldsHandler.GetFieldById(queryStep.field, self.ModelUri);
                    if (field) {
                        self.View.SetOperatorDropdownListAttribute(element, field.fieldtype, index);
                        self.View.BindingDropdownOperator(element.attr('id'), field.fieldtype);
                        filterControls.push(element);
                    }
                }
            }
        });

        return filterControls;
    };
    self.RenderView = function (sender, metadata) {
        var selectedOperator = sender.value();
        var elementIndex = metadata.index;
        var tempCriteria = WC.Utility.ToArray(self.Data()[elementIndex].arguments);
        var tempOperator = self.Data()[elementIndex].operator;

        var prevOperatorIsSingle = jQuery.inArray(tempOperator, self.EqualArguments) !== -1;
        var currOperatorIsSingle = jQuery.inArray(selectedOperator, self.EqualArguments) !== -1;
        var isSwitchSingleOperator = self.SwitchOperator && prevOperatorIsSingle && currOperatorIsSingle;

        var result;
        if (self.CanUseAdvanceArgument(metadata.fieldType, selectedOperator)) {
            tempCriteria = self.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            self.View.GenerateAdvanceCriteriaView(metadata.fieldType, selectedOperator, metadata.elementId, tempCriteria);
            result = tempCriteria;
        }
        else if (self.IsCompareField(tempCriteria) && (!self.SwitchOperator || isSwitchSingleOperator)) {
            var fieldArgument = tempCriteria[0].field;
            var fieldName = self.GetFilterFieldName(fieldArgument, self.ModelUri);
            result = self.RenderCompareFieldView(fieldName, fieldArgument, metadata.fieldType, elementIndex);
        }
        else {
            tempCriteria = self.GetSwitchedArguments(metadata.fieldType, selectedOperator, tempCriteria, tempOperator);
            self.View.GenerateCriteriaView(metadata.fieldType, selectedOperator, metadata.elementId, tempCriteria);
            result = tempCriteria;
        }

        self.SwitchOperator = false;
        return result;
    };
    self.GetMaxArgumentsCount = function (operator, max) {
        if (self.IsEqualGroupOperator(operator))
            return 1;
        else if (self.IsBetweenGroupOperator(operator))
            return 2;
        else if (self.IsListGroupOperator(operator))
            return max;
        else
            return 0;
    };
    self.CanSwitchArguments = function (fieldType, operator1, operator2) {
        var commonGroup = [];
        var containGroup = [];
        var relativeGroup = [];

        jQuery.merge(commonGroup, self.NoAgruments);
        jQuery.merge(commonGroup, self.EqualArguments);
        jQuery.merge(commonGroup, self.BetweenArguments);
        jQuery.merge(commonGroup, self.ListArguments);
        if (fieldType !== enumHandlers.FIELDTYPE.ENUM)
            jQuery.merge(commonGroup, self.ContainArguments);
        else
            jQuery.merge(containGroup, self.ContainArguments);
        
        var canSwitchCommonGroup = jQuery.inArray(operator1, commonGroup) !== -1 && jQuery.inArray(operator2, commonGroup) !== -1;
        var canSwitchContainGroup = jQuery.inArray(operator1, containGroup) !== -1 && jQuery.inArray(operator2, containGroup) !== -1;
        var canSwitchRelativeGroup = jQuery.inArray(operator1, relativeGroup) !== -1 && jQuery.inArray(operator2, relativeGroup) !== -1;
        return canSwitchCommonGroup || canSwitchContainGroup || canSwitchRelativeGroup;
    };
    self.GetSwitchedArguments = function (fieldType, selectedOperator, tempCriteria, tempOperator) {
        if (self.SwitchOperator) {
            if (self.CanSwitchArguments(fieldType, tempOperator, selectedOperator)) {
                var canUseCompareField = jQuery.inArray(selectedOperator, self.EqualArguments) !== -1;
                var maxArgumentsCount = self.GetMaxArgumentsCount(selectedOperator, tempCriteria.length);
                var newTempCriteria = [];
                jQuery.each(tempCriteria, function (index, arg) {
                    if (newTempCriteria.length === maxArgumentsCount)
                        return false;

                    if (arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.VALUE
                        || (canUseCompareField && arg.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD)) {
                        newTempCriteria.push(arg);
                    }
                });
                tempCriteria = newTempCriteria;
            }
            else {
                tempCriteria = [];
            }
        }
        return tempCriteria;
    };
    self.GetSwitchedAdvanceArguments = function (selectedOperator, tempCriteria) {
        if (tempCriteria.length && self.SwitchOperator) {
            var maxArgumentsCount = self.GetMaxArgumentsCount(selectedOperator, tempCriteria.length);
            return tempCriteria.slice(0, maxArgumentsCount);
        }
        return tempCriteria;
    };
    self.RenderCompareFieldView = function (fieldName, fieldId, fieldType, elementIndex) {
        var data = self.Data()[elementIndex];

        // generate DataTypeCriteria
        var placeholder = self.View.GetHtmlElementById('FilterDetail-' + elementIndex + '-PlaceHolder');
        var templateName = self.GetTemplateName(fieldType, 'comparefield');
        placeholder.empty().html(self.View.GenerateTemplate(templateName, fieldType, elementIndex));
        self.View.ApplyCustomView(placeholder);
        self.View.GetHtmlElementById('InputFieldValue-' + elementIndex).val(fieldId);
        self.View.GetHtmlElementById('FieldCompare-' + elementIndex).attr('title', fieldName).find('.filterLabelCompareName').text(fieldName);
        self.View.AdjustLayout();

        return self.ApplyFilter(elementIndex, data);
    };
    self.IsCompareField = function (stepArguments) {
        stepArguments = WC.Utility.ToArray(stepArguments);
        return stepArguments.length && stepArguments[0].argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD;
    };

    // argument type function
    self.GetAdvanceElementIndex = function (elementLastPart) {
        return self.GetAdvanceElementData(elementLastPart).index;
    };
    self.GetAdvanceElementData = function (elementLastPart) {
        var data = { index: '0', row: null };

        elementLastPart += '';
        if (elementLastPart.indexOf('_') !== -1) {
            var elementLastParts = elementLastPart.split('_');
            data.index = elementLastParts[0];
            data.row = elementLastParts[1];
        }
        else
            data.index = elementLastPart;

        return data;
    };

    // tree view mode
    self.IsTreeViewMode = function () {
        var isTreeViewMode = self.ViewMode() === self.VIEWMODE.TREEVIEW;
        return isTreeViewMode;
    };
    self.IsTreeViewHeader = function (data) {
        if (!self.IsTreeViewMode())
            return false;

        var isTreeViewHeader = true;
        var index = self.Data.indexOf(data);
        for (var i = index - 1; i >= 0; i--) {
            var queryStep = self.Data()[i];

            if (queryStep && queryStep.field === data.field) {
                isTreeViewHeader = false;
                break;
            }
        }

        return isTreeViewHeader;
    };
    self.RemoveTreeViewHeader = function (data) {
        jQuery(document).trigger('click');
        setTimeout(function () {
            var removingFieldId = data.field;
            var filters = self.Data();
            for (var i = filters.length - 1; i >= 0; i--) {
                if (removingFieldId === filters[i].field)
                    self.Data.remove(filters[i]);
            }
            self.CreateFromQuerySteps(self.Data());
        });
        return self.Data();
    };
    self.IsNextElementIsTreeViewHeader = function (element) {
        if (!self.IsTreeViewMode())
            return false;

        element = $(element);
        var nextElement = element.next();

        if (nextElement.is('.filterItem.alwaysHide'))
            nextElement = nextElement.next();

        var isTreeViewHeader = nextElement.is('.FilterHeader');
        return isTreeViewHeader;
    };

    // =========== Second part ======================================
    self.ApplyFilterWhenAction = function (elementIndex) {
        return self.ApplyFilter(elementIndex, self.Data()[elementIndex]);
    };
    self.ApplyAdvanceFilterWhenAction = function (elementKey) {
        var elementIndex = self.GetAdvanceElementIndex(elementKey);
        self.ApplyFilterWhenAction(elementIndex);
    };
    self.ApplyFilterParameterise = function (data, event) {
        self.ApplyFilter(event.currentTarget.id.split('-')[1], data, event, true);
        return true;
    };
    self.HandleParameterize = function (data, index, isApplyParameterise) {
        if (data.is_execution_parameter && isApplyParameterise) {
            var yesCheckbox = self.View.GetHtmlElementById('AskValue-' + index + '-Yes');
            if (yesCheckbox.length === 0) {
                data.is_execution_parameter(true);
            }
            else {
                data.is_execution_parameter(yesCheckbox.is(':checked'));
            }
        }
        return data;
    };
    self.GetFilterElements = function (index, fieldType, operator) {
        var filterElements = [];
        if (self.IsEqualGroupOperator(operator)) {
            if (fieldType === enumHandlers.FIELDTYPE.BOOLEAN) {
                filterElements.push('YesChoice-' + index);
                filterElements.push('NoChoice-' + index);
            }
            else if (fieldType === enumHandlers.FIELDTYPE.PERIOD) {
                filterElements.push('FirstInput-' + index);
            }
            else {
                filterElements.push('InputValue-' + index);
            }
        }
        else if (self.IsListGroupOperator(operator)) {
            filterElements.push('ValueList-' + index);
        }
        else if (self.IsBetweenGroupOperator(operator)) {
            filterElements.push('FirstInput-' + index);
            filterElements.push('SecondInput-' + index);
        }
        return filterElements;
    };
    self.GetFilterArguments = function (index, fieldType, operator) {
        var filterElements = self.GetFilterElements(index, fieldType, operator);
        return self.View.ConvertUIToArguments(operator, filterElements[0], fieldType, filterElements[1]);
    };
    self.GetFilterCompareFieldArguments = function (index) {
        var compareFieldId = self.View.GetCompareFieldId(index);
        if (!compareFieldId)
            return [];
        else
            return [WC.WidgetFilterHelper.ArgumentObject(compareFieldId, enumHandlers.FILTERARGUMENTTYPE.FIELD)];
    };
    self.GetFilterAdvanceArguments = function (index) {
        return self.View.ConvertUIToAdvanceArguments(index);
    };
    self.ApplyFilter = function (index, data, event, isApplyParameterise) {
        var operator = self.View.GetDropdownOperatorValue(index);
        var fieldType = self.View.GetFilterFieldType(index);

        if (self.CanUseAdvanceArgument(fieldType, operator)) {
            data.arguments = self.GetFilterAdvanceArguments(index);
        }
        else if (self.View.IsCompareFilter(index)) {
            data.arguments = self.GetFilterCompareFieldArguments(index);
        }
        else {
            data.arguments = self.GetFilterArguments(index, fieldType, operator);
        }

        data.operator = operator;
        self.HandleParameterize(data, index, isApplyParameterise);
        self.View.UpdateWidgetFilterText(data, index);
        self.View.UpdateCacheArgument(data.arguments, index);
        self.View.SetPreviewDateText(index);

        return data;
    };
    self.HaveJumpAfterIndex = function (index, filters) {
        var foundFilterOrJump = false, i;
        for (i = index + 1; i < filters.length; i++) {
            if (filters[i].step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                foundFilterOrJump = true;
                break;
            }
        }
        return foundFilterOrJump;
    };

    self.FilterEnumFormat = null;
    self.FilterEnum = function (elementId, filterValue) {
        var grid = jQuery('#' + elementId).data(enumHandlers.KENDOUITYPE.GRID);
        grid.dataSource.filter(self.GetFilterEnumOption(filterValue));
    };
    self.GetFilterEnumOption = function (filterValue) {
        return {
            operator: function (item, value) {
                var text = self.GetEnumText(item.id, item.short_name, item.long_name, self.FilterEnumFormat).toLowerCase();
                return text.indexOf(value.toLowerCase()) !== -1;
            },
            value: jQuery.trim(filterValue)
        };
    };

    // initial models
    self.SetData(models);
}
