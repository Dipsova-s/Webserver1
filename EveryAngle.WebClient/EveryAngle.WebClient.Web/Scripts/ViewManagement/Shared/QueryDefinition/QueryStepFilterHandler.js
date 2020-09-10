(function (handler) {
    "use strict";
    
    handler.IsFilter = function (queryStep) {
        return queryStep && queryStep.step_type === enumHandlers.FILTERTYPE.FILTER;
    };
    handler.GetFilters = function () {
        var self = this;
        return self.GetQueryStepsByTypes([enumHandlers.FILTERTYPE.FILTER]);
    };
    handler.GetExecutionParameters = function () {
        var self = this;
        return jQuery.grep(self.GetFilters(), function (queryStep) {
            return queryStep.is_execution_parameter();
        });
    };
    handler.SetExecutedParameters = function (parameters) {
        // set execution paramters from popup

        var self = this;
        parameters = ko.toJS(WC.Utility.ToArray(parameters));
        if (!parameters.length)
            return;
        
        var parameterIndex = 0;
        jQuery.each(self.GetExecutionParameters(), function (index, queryStep) {
            var parameter = parameters[parameterIndex];
            if (!parameter)
                return false;

            queryStep.operator(parameter.operator);
            queryStep.arguments(parameter.arguments);

            // the icon does not update correctly and this is a trick
            queryStep.is_execution_parameter(false);
            queryStep.is_execution_parameter(true);

            parameterIndex++;
        });
        self.ForcedUpdateData(self.GetQueryDefinition()[self.Property]);
        self.IsExecutedParameters = true;
    };
    handler.GetExecutedParameters = function () {
        var self = this;
        return jQuery.map(self.GetExecutionParameters(), function (queryStep) {
            var data = queryStep.data();
            data.execution_parameter_id = queryStep.execution_parameter_id;
            return data;
        });
    };
    handler.UseExecutionParameter = function (queryStep) {
        var self = this;
        var mayExecutionParameter = function (data) {
            return data.field === queryStep.field && data.is_execution_parameter;
        };

        // get by index, execution_parameter_id is not reliable
        var sourceStepIndex = 0;
        var index = self.Data.indexOf(queryStep);
        for (var i = index - 1; i >= 0; i--) {
            if (mayExecutionParameter(self.Data()[i])) {
                sourceStepIndex++;
            }
        }
        var sourceData = self.GetQueryStepsFromQueryDefinition(self.GetSourceData());
        var sourceSteps = jQuery.grep(sourceData, mayExecutionParameter);
        var sourceStep = sourceSteps.length ? sourceSteps[sourceStepIndex] : null;
        var rawStep = new QueryStepViewModel(queryStep.raw(), self.ModelUri, false);
        return sourceStep && rawStep.is_changed(sourceStep);
    };
    handler.AdjustFilterArguments = function (queryStep) {
        var self = this;
        if (self.IsFilter(queryStep))
            queryStep.arguments = WC.WidgetFilterHelper.AdjustFilterArguments(queryStep.operator, queryStep.arguments, self.ModelUri);
    };
    handler.CanEditFilter = function (queryStep) {
        // check can click edit filter
        var self = this;
        return queryStep.is_adhoc() || queryStep.valid_field && self.Authorizations.CanChangeFilter();
    };
    handler.CanRemoveFilter = function (queryStep) {
        // check can click delete filter
        var self = this;
        return queryStep.is_adhoc() || self.Authorizations.CanChangeFilter();
    };
    handler.EditFilter = function (queryStep) {
        // click edit from ui

        var self = this;
        queryStep.edit_mode(!queryStep.edit_mode());
        self.CreateFilterEditor(queryStep);
        if (!queryStep.edit_mode())
            self.TriggerUpdateBlockUI();
    };
    handler.CreateFilterEditor = function (queryStep) {
        var self = this;
        if (!self.IsFilter(queryStep) || !queryStep.edit_mode() || self.ReadOnly())
            return;

        // create editor
        var editor = self.GetFilterEditor(queryStep);
        if (!editor) {
            var index = self.Data.indexOf(queryStep);
            var element = self.GetContainer().find('.item[data-index="' + index + '"] .filter-editor');
            var field = modelFieldsHandler.GetFieldById(queryStep.field, self.ModelUri);
            var handler = self.GetFilterEditorHandler(field.fieldtype);
            element.data('Editor', new handler(self, queryStep, element));
        }

        // close other editors
        self.CloseAllFilterEditors();
        queryStep.edit_mode(true);

        // scroll to the editor
        self.ScrollToItem(queryStep);

        // update blocker size/position
        self.TriggerUpdateBlockUI();
    };
    handler.GetFilterEditorHandler = function (fieldType) {
        // get editor handler

        var mappers = {};
        mappers[enumHandlers.FIELDTYPE.BOOLEAN] = FilterBooleanEditor;
        mappers[enumHandlers.FIELDTYPE.CURRENCY] = FilterCurrencyEditor;
        mappers[enumHandlers.FIELDTYPE.DATE] = FilterDateEditor;
        mappers[enumHandlers.FIELDTYPE.DATETIME] = FilterDatetimeEditor;
        mappers[enumHandlers.FIELDTYPE.DOUBLE] = FilterDoubleEditor;
        mappers[enumHandlers.FIELDTYPE.ENUM] = FilterEnumeratedEditor;
        mappers[enumHandlers.FIELDTYPE.INTEGER] = FilterIntEditor;
        mappers[enumHandlers.FIELDTYPE.PERCENTAGE] = FilterPercentageEditor;
        mappers[enumHandlers.FIELDTYPE.PERIOD] = FilterPeriodEditor;
        mappers[enumHandlers.FIELDTYPE.TEXT] = FilterTextEditor;
        mappers[enumHandlers.FIELDTYPE.TIME] = FilterTimeEditor;
        mappers[enumHandlers.FIELDTYPE.TIMESPAN] = FilterTimespanEditor;
        return mappers[fieldType] || BaseFilterEditor;
    };
    handler.GetFilterEditor = function (queryStep) {
        var self = this;
        var index = self.Data.indexOf(queryStep);
        return self.GetContainer().find('.item[data-index="' + index + '"] .filter-editor').data('Editor');
    };
    handler.CloseAllFilterEditors = function () {
        var self = this;
        jQuery.each(self.GetFilters(), function (index, queryStep) {
            queryStep.edit_mode(false);
        });
    };
    handler.DestroyFilterEditor = function (queryStep) {
        var self = this;
        var editor = self.GetFilterEditor(queryStep);
        if (editor)
            editor.Destroy();
    };
    handler.DestroyAllFilterEditors = function () {
        var self = this;
        jQuery.each(self.Data(), function (index, queryStep) {
            self.DestroyFilterEditor(queryStep);
        });
    };
    handler.RemoveFilter = function (queryStep) {
        var self = this;
        self.DestroyFilterEditor(queryStep);
        self.Data.remove(queryStep);
    };
    handler.InsertFilter = function (field, index) {
        // insert by model field

        var self = this;
        modelFieldsHandler.SetFields([field], self.ModelUri);
        modelFieldsHandler.LoadFieldsMetadata([field])
            .done(function () {
                var data = {
                    step_type: enumHandlers.FILTERTYPE.FILTER,
                    field: field.id,
                    operator: WC.WidgetFilterHelper.GetDefaultFilterOperator(field.fieldtype).Value,
                    arguments: WC.WidgetFilterHelper.GetDefaultFilterOperatorArguments(field.fieldtype),
                    is_execution_parameter: false,
                    is_adhoc: true,
                    edit_mode: true
                };
                self.InsertQueryFilter(data, index);
            });
    };
    handler.AddFilter = function (field) {
        var self = this;
        var index = self.GetAddJumpOrFilterIndex();
        self.InsertFilter(field, index);
    };
    handler.InsertQueryFilter = function (data, index) {
        // insert by query step

        var self = this;

        // open panel
        self.ExpandPanel();

        // add filter
        var queryStep = new QueryStepViewModel(data, self.ModelUri);
        self.Data.splice(index, 0, queryStep);
        self.CreateFilterEditor(queryStep);

        // scroll to the editor
        self.ScrollToItem(queryStep);

        // update blocker size/position
        self.TriggerUpdateBlockUI();
    };
    handler.AddQueryFilter = function (data) {
        var self = this;
        var index = self.GetAddJumpOrFilterIndex();
        var queryStep = jQuery.extend({
            is_adhoc: true,
            edit_mode: true
        }, ko.toJS(data));
        self.InsertQueryFilter(queryStep, index);
    };
    handler.ShowInfoFilterPopup = function (queryStep) {
        helpTextHandler.ShowHelpTextPopup(queryStep.field, helpTextHandler.HELPTYPE.FIELD, queryStep.model);
    };
    handler.ShowAddFilterPopup = function () {
        var self = this;
        if (!self.CanAdd())
            return;

        var target = self.GetAddFilterTarget();
        var sender = {
            FilterFor: self.FilterFor,
            GetData: self.GetData,
            AddFieldFilter: jQuery.proxy(self.AddFilter, self)
        };
        self.InitialAddFilterOptions();
        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, target, sender);
    };
    handler.InitialAddFilterOptions = function () {
        var self = this;
        fieldsChooserHandler.ModelUri = self.ModelUri;
        if (!self.Parent()) {
            // for angle
            fieldsChooserHandler.AngleClasses = self.GetBaseClasses();
            fieldsChooserHandler.AngleSteps = self.GetData();
            fieldsChooserHandler.DisplaySteps = [];
        }
        else {
            // for display
            fieldsChooserHandler.AngleClasses = self.Parent().GetBaseClasses();
            fieldsChooserHandler.AngleSteps = self.Parent().GetData();
            fieldsChooserHandler.DisplaySteps = self.GetData();
        }
    };
    handler.GetAddFilterTarget = function () {
        var self = this;
        var mapper = {};
        mapper[WC.WidgetFilterHelper.FILTERFOR.ANGLE] = enumHandlers.ANGLEPOPUPTYPE.ANGLE;
        mapper[WC.WidgetFilterHelper.FILTERFOR.DISPLAY] = enumHandlers.ANGLEPOPUPTYPE.DISPLAY;
        mapper[WC.WidgetFilterHelper.FILTERFOR.DASHBOARD] = enumHandlers.ANGLEPOPUPTYPE.DASHBOARD;
        return mapper[self.FilterFor];
    };    
}(QueryDefinitionHandler.prototype));