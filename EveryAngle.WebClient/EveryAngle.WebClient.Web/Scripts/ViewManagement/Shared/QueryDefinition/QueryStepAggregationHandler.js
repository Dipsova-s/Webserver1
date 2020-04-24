(function (handler) {
    "use strict";

    handler.IsAggregation = function (queryStep) {
        return queryStep && queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION;
    };
    handler.GetAggregation = function () {
        var self = this;
        return self.GetQueryStepsByTypes([enumHandlers.FILTERTYPE.AGGREGATION])[0] || null;
    };
    handler.RemoveAggregation = function () {
        var self = this;
        self.Data.remove(function (step) {
            return self.IsAggregation(step);
        });
    };
    handler.SetAggregation = function (data) {
        var self = this;
        self.RemoveAggregation();
        var queryStep = jQuery.extend({
            is_adhoc: true,
            is_applied: true
        }, ko.toJS(data));
        self.Data.push(new QueryStepViewModel(queryStep, self.ModelUri));
    };

    // transform to a new model
    handler.CanUseAggregation = function () {
        var self = this;
        return WC.Utility.ToBoolean(self.GetAggregation());
    };
    handler.InitialAggregation = function () {
        var self = this;
        // set options
        self.AggregationOptions(self.GetAggregationOptions());

        // set data
        self.Aggregation(self.GetAggregationData(self.GetAggregation()));
    };
    handler.GetAggregationData = function (raw) {
        var self = this;
        var data = [];
        if (raw) {
            // initial view model
            jQuery.each(WC.Utility.ToArray(raw.grouping_fields), function (index, field) {
                data.push(self.CreateAggregationField(field));
            });

            var countField = self.CreateAdhocCountField();
            var temp = []; 
            jQuery.each(raw.aggregation_fields, function (index, field) {
                var model = self.CreateAggregationField(field);
                if (model.is_count_field()) {
                    countField = model;
                }
                else {
                    temp.push(model);
                } 
            });
            var countFieldIndex = Math.min(self.GetAggregationCountFieldIndex(), temp.length);
            temp.splice(countFieldIndex, 0, countField);
            jQuery.merge(data, temp);
        }
        return data;
    };
    handler.GetRawAggregationData = function () {
        var self = this;
        var rawAggregation = self.GetQueryStepsFromQueryDefinition(self.GetRawQueryDefinition())
            .findObject('step_type', enumHandlers.FILTERTYPE.AGGREGATION);
        return self.GetAggregationData(rawAggregation);
    };
    handler.ApplyAggregationHandler = function (container, viewSelector) {
        var self = this;
        self.AggregationContainer = container;

        // set view
        container.find(viewSelector).html(self.View.GetAggregationTemplate());

        // apply ko
        WC.HtmlHelper.ApplyKnockout(self, container);

        // initial UI
        self.InitialAggregationUI(container);

        // Initial Sortable
        self.InitialAggregationSortable(container);

        // create block ui if needs
        self.CreateBlockUI(container);
    };
    handler.InitialAggregationUI = jQuery.noop;
    handler.RefreshAggregationUI = function () {
        var self = this;
        self.InitialAggregationUI(self.AggregationContainer);
    };
    handler.CreateAggregationField = function (aggregation) {
        var self = this;
        var field = self.GetAggregationField(aggregation);
        var fallback = {};
        fallback[enumHandlers.FIELDDETAILPROPERTIES.AREA] = AggregationFieldViewModel.Area.Row;
        var details = jQuery.extend(fallback, WC.Utility.ParseJSON(field.field_details));
        var alias = field.multi_lang_alias;
        return new AggregationFieldViewModel(aggregation, self.ModelUri, details, alias, true);
    };
    handler.CreateAdhocAggregationField = function (aggregation, area, selected) {
        var self = this;
        var details = {};
        details[enumHandlers.FIELDDETAILPROPERTIES.AREA] = area;
        return new AggregationFieldViewModel(aggregation, self.ModelUri, details, [], selected);
    };
    handler.CreateAdhocCountField = function () {
        var self = this;
        var aggregation = { field: AggregationFieldViewModel.CountFieldId, operator: enumHandlers.AGGREGATION.COUNT.Value };
        var countField = self.CreateAdhocAggregationField(aggregation, AggregationFieldViewModel.Area.Data, false);
        return countField;
    };
    handler.CreateAggregationFieldFromField = function (field, area) {
        var self = this;
        var operator = self.GetAggregationDefaultOperator(field.fieldtype, area);
        var aggregation = {
            field: kendo.format('{0}_{1}', operator, field.id),
            operator: operator,
            source_field: field.id,
            is_adhoc: true
        };
        return self.CreateAdhocAggregationField(aggregation, area, true);
    };
    handler.GetAggregationDefaultOperator = function (fieldtype, area) {
        fieldtype = fieldtype.toLowerCase();
        if (area === AggregationFieldViewModel.Area.Data) {
            return fieldtype === enumHandlers.FIELDTYPE.TIME
                ? enumHandlers.AGGREGATION.AVERAGE.Value
                : enumHandlers.AGGREGATION.SUM.Value;
        }
        else {
            var mappers = {};
            mappers[enumHandlers.FIELDTYPE.TIME] = 'hour';
            mappers[enumHandlers.FIELDTYPE.PERIOD] = 'week';
            mappers[enumHandlers.FIELDTYPE.TIMESPAN] = 'week';
            mappers[enumHandlers.FIELDTYPE.DATE] = 'quarter';
            mappers[enumHandlers.FIELDTYPE.DATETIME] = 'quarter';
            mappers[enumHandlers.FIELDTYPE.CURRENCY] = 'power10_3';
            mappers[enumHandlers.FIELDTYPE.NUMBER] = 'power10_3';
            mappers[enumHandlers.FIELDTYPE.INTEGER] = 'power10_3';
            mappers[enumHandlers.FIELDTYPE.DOUBLE] = 'power10_3';
            mappers[enumHandlers.FIELDTYPE.PERCENTAGE] = 'power10_1';
            return mappers[fieldtype] || 'individual';
        }
    };
    handler.ToggleCountField = function (aggregation) {
        var self = this;
        if (aggregation.is_count_field() && self.CanChangeCountFieldState())
            aggregation.is_selected(!aggregation.is_selected());
    };
    handler.CanChangeAggregationOptions = function () {
        var self = this;
        return self.Authorizations.CanChangeAggregation();
    };
    handler.GetAggregationOptions = function () {
        return {};
    };
    handler.SetAggregationOptions = jQuery.noop;
    handler.ShowAggregationOptions = jQuery.noop;
    handler.GetAggregationCountFieldIndex = function () {
        var self = this;
        return WC.Utility.ToNumber(self.AggregationOptions().count_index);
    };
    handler.GetAggregationField = function () {
        return {};
    };
    handler.GetAggregationFieldById = function (id) {
        var self = this;
        return self.Aggregation().findObject('field', function (field) { return field() === id; });
    };
    handler.SetAggregationFields = jQuery.noop;
    handler.GetAggregationName = function (aggregation) {
        var self = this;
        return self.GetAggregationCountName(aggregation)
            || self.GetAggregationAliasName(aggregation)
            || self.GetAggregationDefaultName(aggregation);
    };
    handler.GetAggregationHint = function (aggregation) {
        var self = this;
        if (!self.GetAggregationAliasName(aggregation) || self.GetAggregationCountName(aggregation))
            return '';

        return ' ' + self.GetAggregationDefaultName(aggregation);
    };
    handler.GetAggregationCountName = function (aggregation) {
        return aggregation.is_count_field() ? enumHandlers.AGGREGATION.COUNT.Text : '';
    };
    handler.GetAggregationAliasName = function (aggregation) {
        return WC.Utility.GetDefaultMultiLangText(aggregation.multi_lang_alias(), true);
    };
    handler.GetAggregationDefaultName = function (aggregation) {
        var self = this;
        aggregation = ko.toJS(aggregation);
        var name = '';
        var bucket = self.GetAggregationBucketName(aggregation.operator);
        var field = WC.Utility.IfNothing(modelFieldsHandler.GetFieldById(aggregation.source_field, aggregation.model), { id: aggregation.field });
        if (field.source) {
            var source = modelFieldSourceHandler.GetFieldSourceByUri(field.source);
            if (source && source.short_name.toLowerCase() !== field.short_name.toLowerCase()) {
                name = userFriendlyNameHandler.GetFriendlyName(source, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) + ' - ';
            }
        }
        name += userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
        return jQuery.trim(name + ' ' + bucket);
    };
    handler.GetAggregationBucketName = function (operator) {
        operator = WC.Utility.ToString(operator).toLowerCase();

        var description = '';
        if (operator !== 'left1' && /^left\d+$/.test(operator))
            description = kendo.format(Localization.Pivot_Bucket_FirstCharacters, operator.replace('left', ''));
        else if (operator !== 'right1' && /^right\d+$/.test(operator))
            description = kendo.format(Localization.Pivot_Bucket_LastCharacters, operator.replace('right', ''));
        else if (/^power10_min\d+$/.test(operator)) {
            var powerNumber = operator.replace('power10_min', '');
            description = kendo.toString(1 / Math.pow(10, powerNumber), 'n' + powerNumber);
        }
        else if (/^power10_\d+$/.test(operator)) {
            var formatter = new Formatter({ prefix: null, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
            description = WC.FormatHelper.GetFormattedValue(formatter, Math.pow(10, operator.replace('power10_', '')));
        }
        else {
            var mappers = {};
            mappers['none'] = '';
            mappers['individual'] = '';
            mappers['left1'] = Localization.Pivot_Bucket_FirstCharacter;
            mappers['right1'] = Localization.Pivot_Bucket_LastCharacter;
            mappers['hour'] = Localization.Pivot_Bucket_PerHour;
            mappers['day'] = Localization.Pivot_Bucket_PerDay;
            mappers['week'] = Localization.Pivot_Bucket_PerWeek;
            mappers['month'] = Localization.Pivot_Bucket_PerMonth;
            mappers['quarter'] = Localization.Pivot_Bucket_PerQuarter;
            mappers['trimester'] = Localization.Pivot_Bucket_PerTrimester;
            mappers['semester'] = Localization.Pivot_Bucket_PerSemester;
            mappers['year'] = Localization.Pivot_Bucket_PerYear;
            mappers[enumHandlers.AGGREGATION.MAX.Value] = enumHandlers.AGGREGATION.MAX.Text;
            mappers[enumHandlers.AGGREGATION.MIN.Value] = enumHandlers.AGGREGATION.MIN.Text;
            mappers[enumHandlers.AGGREGATION.SUM.Value] = enumHandlers.AGGREGATION.SUM.Text;
            mappers[enumHandlers.AGGREGATION.AVERAGE.Value] = enumHandlers.AGGREGATION.AVERAGE.Text;
            mappers[enumHandlers.AGGREGATION.AVERAGE_VALID.Value] = enumHandlers.AGGREGATION.AVERAGE_VALID.Text;
            mappers[enumHandlers.AGGREGATION.COUNT_VALID.Value] = enumHandlers.AGGREGATION.COUNT_VALID.Text;
            description = mappers[operator];
        }
        return description ? ' [' + description + ']' : '';
    };
    handler.GetAggregationFieldsByArea = function (area) {
        var self = this;
        return self.Aggregation().findObjects('area', function (value) {
            return value() === area;
        });
    };
    handler.GetAggregationRowFields = function () {
        var self = this;
        return self.GetAggregationFieldsByArea(AggregationFieldViewModel.Area.Row);
    };
    handler.GetAggregationColumnFields = function () {
        var self = this;
        return self.GetAggregationFieldsByArea(AggregationFieldViewModel.Area.Column);
    };
    handler.GetAggregationDataFields = function () {
        var self = this;
        return self.GetAggregationFieldsByArea(AggregationFieldViewModel.Area.Data);
    };
    handler.GetAggregationDataType = function (aggregation, fieldType) {
        return aggregation.area() === AggregationFieldViewModel.Area.Data
            ? dataTypeModel.GetCorrectDataType(aggregation.operator(), fieldType)
            : fieldType;
    };
    handler.CanAddAggregationField = function () {
        var self = this;
        return self.Authorizations.CanChangeAggregation();
    };
    handler.ShowAddAggregationFieldPopup = function (area) {
        var self = this;
        if (!self.CanAddAggregationField())
            return;

        var sender = {
            AddFields: jQuery.proxy(self.SubmitAggregationFields, self, area)
        };
        self.InitialAddAggregationOptions();
        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDAGGREGATION, area, sender);
    };
    handler.InitialAddAggregationOptions = function () {
        var self = this;
        fieldsChooserHandler.ModelUri = self.ModelUri;
        fieldsChooserHandler.AngleClasses = self.Parent().GetBaseClasses();
        fieldsChooserHandler.AngleSteps = self.Parent().GetData();
        fieldsChooserHandler.DisplaySteps = self.GetData();
    };
    handler.SubmitAggregationFields = function (area, fields) {
        var self = this;
        if (!fields.length)
            return;

        // remove unusing fields
        var limit = self.GetAggregationFieldLimit(area);
        if (area === AggregationFieldViewModel.Area.Data)
            limit--;
        fields.splice(limit, fields.length);

        self.ShowAggregationProgressBar();
        modelFieldsHandler.SetFields(fields, self.ModelUri);
        modelFieldsHandler.LoadFieldsMetadata(fields)
            .done(jQuery.proxy(self.AddAggregationFields, self, area, fields))
            .always(jQuery.proxy(self.HideAggregationProgressBar, self));
    };
    handler.GetAggregationFieldLimit = jQuery.noop;
    handler.AddAggregationFields = function (area, fields) {
        var self = this;

        // remove
        self.CleanAggregationFields(area, fields);

        // add
        jQuery.each(fields, function (_index, field) {
            var aggregation = self.CreateAggregationFieldFromField(field, area);
            self.AddAggregationField(aggregation, area);
        });

        // check count field
        if (area === AggregationFieldViewModel.Area.Data)
            self.UpdateCountField();

        // expand container
        self.OpenAggregationAreaPanel(area);
    };
    handler.CleanAggregationFields = function (area, fields) {
        var self = this;
        var areaCount = self.GetAggregationFieldsByArea(area).length;
        var aggregations = self.Aggregation();
        var removeCount = fields.length + areaCount - self.GetAggregationFieldLimit(area);
        var i = aggregations.length - 1;
        while (removeCount > 0 && i >= 0) {
            if (aggregations[i].area() === area && !aggregations[i].is_count_field()) {
                self.Aggregation.remove(aggregations[i]);
                removeCount--;
            }
            i--;
        }
    };
    handler.UpdateCountField = function () {
        var self = this;
        var dataFields = self.GetAggregationDataFields();
        var countFieldIndex = dataFields.indexOfObject('is_count_field', function (isCountField) { return isCountField(); });
        if (countFieldIndex === -1)
            return;

        // set index
        var options = self.AggregationOptions();
        options.count_index = countFieldIndex;
        self.AggregationOptions(options);

        // set state
        var limit = self.GetAggregationFieldLimit(AggregationFieldViewModel.Area.Data);
        if (limit !== Infinity && (dataFields.length < limit - 1 || !self.CanChangeCountFieldState()))
            dataFields[countFieldIndex].is_selected(true);
    };
    handler.CanChangeCountFieldState = jQuery.noop;
    handler.AddAggregationField = function (aggregation, area) {
        var self = this;
        var addIndex = self.GetAddingAggregationFieldIndex(area);
        self.Aggregation.splice(addIndex, 0, aggregation);
    };
    handler.GetAddingAggregationFieldIndex = function (area) {
        var self = this;

        // find index
        var countRowArea = self.GetAggregationRowFields().length;
        var countColumnArea = self.GetAggregationColumnFields().length;
        var countDataArea = self.GetAggregationDataFields().length;
        var indexes = {};
        indexes[AggregationFieldViewModel.Area.Row] = countRowArea;
        indexes[AggregationFieldViewModel.Area.Column] = countRowArea + countColumnArea;
        indexes[AggregationFieldViewModel.Area.Data] = countRowArea + countColumnArea + countDataArea;
        return indexes[area];
    };
    handler.CanRemoveAggregationField = function (aggregation) {
        var self = this;
        return self.Authorizations.CanChangeAggregation() && !aggregation.is_count_field();
    };
    handler.RemoveAggregationField = function (aggregation) {
        var self = this;
        var area = aggregation.area();
        self.Aggregation.remove(aggregation);

        // check count field
        if (area === AggregationFieldViewModel.Area.Data)
            self.UpdateCountField();
    };
    handler.CanMoveAggregationField = function () {
        // move a field to a new position or new area
        var self = this;
        return self.Authorizations.CanChangeAggregation();
    };
    handler.CanSortAggregationField = function () {
        // click reorder on the field
        return false;
    };
    handler.GetAggregationSortingClassName = jQuery.noop;
    handler.SortAggregationField = jQuery.noop;
    handler.CanAddFilterFromAggregation = function (aggregation) {
        var self = this;
        return aggregation.valid() && !aggregation.is_count_field() && self.CanAdd();
    };
    handler.AddFilterFromAggregation = function (aggregation) {
        var self = this;
        if (!self.CanAddFilterFromAggregation(aggregation))
            return;

        // add to panel
        var field = modelFieldsHandler.GetFieldById(aggregation.source_field, aggregation.model);
        if (self.HasAggregationChanged(false)) {
            popup.Confirm(
                self.Texts().AggregationConfirmDiscardChanges,
                jQuery.proxy(self.AddFilterAndDiscardAggregation, self, field)
            );
        }
        else {
            self.AddFilter(field);
        }
    };

    handler.CanAddReferenceLine = jQuery.noop;
    handler.ShowAddReferenceLinePopup = jQuery.noop;
    handler.AddFilterAndDiscardAggregation = function (field) {
        var self = this;
        self.CancelAggregation();
        self.AddFilter(field);
    };
    handler.CanEditAggregationFormat = function (aggregation) {
        var self = this;
        return aggregation.valid() && aggregation.is_selected() && self.Authorizations.CanChangeAggregation();
    };
    handler.ShowEditAggregationFormatPopup = function (aggregation) {
        var self = this;
        var field = modelFieldsHandler.GetFieldById(aggregation.source_field, aggregation.model);
        if (!self.CanEditAggregationFormat(aggregation) || !field)
            return;

        // show a popup
        var title = self.GetAggregationName(aggregation);
        var formatHandler = new DisplayAggregationFormatHandler(self, aggregation, field);
        formatHandler.SetTexts = self.SetAggregationFormatTexts;
        formatHandler.ShowPopup(title);
        return formatHandler;
    };
    handler.SetAggregationFormatTexts = jQuery.noop;
    handler.GetAggregationFieldFormatSettings = function (aggregation) {
        var self = this;
        var displayField = aggregation.data_field();
        displayField.field = aggregation.source_field;
        var modelField = ko.toJS(modelFieldsHandler.GetFieldById(displayField.field, aggregation.model) || { fieldtype: enumHandlers.FIELDTYPE.INTEGER });
        modelField.fieldtype = self.GetAggregationDataType(aggregation, modelField.fieldtype);
        var fieldFormatter = new FieldFormatter(displayField, aggregation.model);
        fieldFormatter.AddBaseField(modelField);
        return WC.FormatHelper.GetFieldFormatSettings(fieldFormatter, true);
    };
    handler.HasAggregationFieldInfo = function (aggregation) {
        return !aggregation.is_count_field();
    };
    handler.ShowAggregationInfoPopup = function (aggregation) {
        helpTextHandler.ShowHelpTextPopup(aggregation.source_field, helpTextHandler.HELPTYPE.FIELD, aggregation.model);
    };
    handler.CancelAggregation = function () {
        var self = this;
        self.InitialAggregation();
        self.RefreshAggregationUI();
    };
    handler.CanApplyAggregation = function () {
        var self = this;
        return self.Authorizations.CanChangeAggregation();
    };
    handler.HasAggregationChanged = function (checkBlockUI) {
        var self = this;
        var rawOptions = self.GetAggregationOptions();
        var options = self.AggregationOptions();
        var rawData = self.GetRawAggregationData();
        var changed = !jQuery.deepCompare(options, rawOptions, false, false) || !self.AreEqual(rawData, self.Aggregation());

        // checkBlockUI=true only applies to view
        // checkBlockUI=false only applies to handler
        if (checkBlockUI)
            self.CheckAggregationBlockUI(changed, self.AggregationContainer);

        return changed;
    };
    handler.CheckAggregationBlockUI = function (changed, target) {
        // this can be override, there are some logic that needed
        var self = this;
        if (changed)
            self.RefreshAggregationUI();
        self.UpdateBlockUI(changed, target);
    };
    handler.ApplyAggregation = function () {
        var self = this;

        // check data
        if (!self.HasAggregationChanged(false)
            || !self.ValidateAggregation())
            return;

        // display options
        self.EnsureAggregationOptions();
        var details = self.AggregationOptions();
        self.SetAggregationOptions(details);

        // transform back to display fields
        var fields = self.AggregationToFields();
        self.SetAggregationFields(fields);

        // transform back to aggregation step
        var queryStep = self.AggregationToQueryStep();
        self.SetAggregation(queryStep);

        // apply
        self.Execute(QueryDefinitionHandler.ExecuteAction.Adhoc);
    };
    handler.EnsureAggregationOptions = jQuery.noop;
    handler.AggregationToQueryStep = function () {
        var self = this;
        var queryStep = {
            grouping_fields: [],
            aggregation_fields: [],
            step_type: enumHandlers.FILTERTYPE.AGGREGATION
        };
        jQuery.each(self.Aggregation(), function (index, aggregation) {
            if (!aggregation.is_selected())
                return;

            var data = aggregation.data();
            jQuery.extend(data, {
                valid: aggregation.valid(),
                validation_details: aggregation.validation_details
            });
            if (aggregation.area() !== AggregationFieldViewModel.Area.Data) {
                queryStep.grouping_fields.push(data);
            }
            else {
                queryStep.aggregation_fields.push(data);
            }
        });
        return queryStep;
    };
    handler.AggregationToFields = function () {
        var self = this;
        var fields = [];
        jQuery.each(self.Aggregation(), function (index, aggregation) {
            if (!aggregation.is_selected())
                return;

            fields.push(aggregation.data_field());
        });
        return fields;
    };
    handler.ValidateAggregation = jQuery.noop;
    handler.HasErrorAggregationField = function () {
        var self = this;
        return ko.toJS(self.Aggregation()).hasObject('valid', false);
    };
    handler.HasDuplicatedAggregationDataField = function () {
        var self = this;
        var duplicated = false;
        var aggregations = ko.toJS(self.GetAggregationDataFields());
        jQuery.each(aggregations, function (index, aggregation) {
            var count = aggregations.findObjects('field', aggregation.field).length;
            if (count > 1) {
                duplicated = true;
                return false;
            }
        });
        return duplicated;
    };
    handler.ShowAggregationProgressBar = function () {
        var self = this;
        self.AggregationContainer.busyIndicator(true);
        var target = self.AggregationContainer.children('.accordion-header');
        if (target.hasClass('close'))
            self.AggregationContainer.find('.k-loading-mask').addClass('k-loading-small');
    };
    handler.HideAggregationProgressBar = function () {
        var self = this;
        self.AggregationContainer.busyIndicator(false);
    };
    handler.OpenAggregationPanel = function () {
        var self = this;
        var target = self.AggregationContainer.children('.accordion-header');
        if (target.hasClass('close'))
            target.trigger('click');
    };
    handler.OpenAggregationAreaPanel = function (area) {
        var self = this;
        var target = self.AggregationContainer.find('.query-aggregation-' + area + ' .accordion-header');
        if (target.hasClass('close'))
            target.trigger('click');
    };
}(QueryDefinitionHandler.prototype));