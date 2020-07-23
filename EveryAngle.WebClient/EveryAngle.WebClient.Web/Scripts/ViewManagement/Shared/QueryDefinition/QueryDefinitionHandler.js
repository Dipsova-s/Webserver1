function QueryDefinitionHandler() {
    "use strict";

    var _self = {};
    _self.definition = [];
    _self.$container = jQuery();

    var self = this;
    self.View = new QueryStepView();
    self.Data = ko.observableArray([]);
    self.Data.subscribe(function () {
        self.HasChanged(true, false);
    });
    self.AggregationContainer = jQuery();
    self.Aggregation = ko.observableArray([]);
    self.AggregationOptions = ko.observable({});
    self.IsExecutedParameters = false;
    self.ForcedSetData = false;
    self.BlockUI = false;
    self.Texts = ko.observable({
        ConfirmMoveFilter: '',
        AskForExecutionParamter: '',
        AggregationTitle: '',
        AggregationHeaderGauge: '',
        AggregationHeaderRow: '',
        AggregationHeaderColumn: '',
        AggregationHeaderData: '',
        ApplyButton: Localization.Apply
    });
    self.Property = null;
    self.ModelUri = null;
    self.Parent = ko.observable(null);
    self.Authorizations = {
        CanChangeFilter: ko.observable(false),
        CanChangeJump: ko.observable(false),
        CanChangeAggregation: ko.observable(false),
        CanExecute: ko.observable(false),
        CanSave: ko.observable(false)
    };
    self.ReadOnly = ko.observable(false);
    self.AllowExecutionParameter = ko.observable(true);

    self.GetSourceData = function () {
        return [];
    };
    self.SetData = function (definition, property, modelUri) {
        // skip
        if (!modelUri || self.ModelUri && !self.ForcedSetData)
            return;

        self.ForcedSetData = false;
        _self.definition = ko.toJS(definition);
        self.Property = property;
        self.ModelUri = modelUri;

        var querySteps = self.GetQueryStepsFromQueryDefinition(_self.definition);
        self.SetQuerySteps(querySteps);
        self.InitialAggregation();
    };
    self.ForcedUpdateData = function (definition) {
        self.ForcedSetData = true;
        self.SetData(definition, self.Property, self.ModelUri);
    };
    self.GetBaseClassBlock = function () {
        return _self.definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
    };
    self.GetBaseClasses = function () {
        var baseClassBlock = self.GetBaseClassBlock();
        return baseClassBlock ? baseClassBlock.base_classes : [];
    };
    self.GetQueryStepsFromQueryDefinition = function (definition) {
        var queryStepBlock = definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        return queryStepBlock ? queryStepBlock.query_steps : [];
    };
    self.SetQuerySteps = function (querySteps) {
        var queryBlock = WC.ModelHelper.ExtendQueryBlock({
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: WC.Utility.ToArray(querySteps)
        });
        jQuery.each(queryBlock.query_steps, function (index, queryStep) {
            queryBlock.query_steps[index] = new QueryStepViewModel(queryStep, self.ModelUri, true);
        });
        queryBlock.query_steps.sortObject('step_type_index');
        self.DestroyAllFilterEditors();
        self.Data(queryBlock.query_steps);
    };
    self.RefreshQuerySteps = function () {
        // use for refresh view

        var querySteps = ko.toJS(self.Data());
        self.DestroyAllFilterEditors();
        self.Data.removeAll();
        jQuery.each(querySteps, function (index, data) {
            var queryStep = new QueryStepViewModel(data, self.ModelUri);
            self.Data.push(queryStep);
            self.CreateFilterEditor(queryStep);
        });
        self.RefreshAggregationUI();
    };
    self.GetData = function () {
        var data = ko.toJS(self.Data());
        data.sortObject('step_type_index');
        jQuery.each(data, function (index, queryStep) {
            self.AdjustFilterArguments(queryStep);
        });
        return data;
    };
    self.GetRawQueryDefinition = function () {
        // getter for raw data

        return ko.toJS(_self.definition);
    };
    self.GetQueryDefinition = function () {
        // return saved able value
        return self.CreateQueryDefinition(_self.definition.slice(), self.GetData());
    };
    self.CreateQueryDefinition = function (definition, querySteps) {
        definition.removeObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (querySteps.length) {
            var queryBlock = {
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: querySteps
            };
            definition.push(queryBlock);
        }
        var data = {};
        data[self.Property] = definition;
        return data;
    };
    self.GetQueryStepsByTypes = function (stepTypes) {
        return self.Data().findObjects('step_type', function (stepType) {
            return jQuery.inArray(stepType, stepTypes) !== -1;
        });
    };
    self.GetFiltersAndJumps = function () {
        return self.GetQueryStepsByTypes([enumHandlers.FILTERTYPE.FILTER, enumHandlers.FILTERTYPE.FOLLOWUP]);
    };
    self.IsFilterOrJump = function (queryStep) {
        return queryStep && jQuery.inArray(queryStep.step_type, [enumHandlers.FILTERTYPE.FILTER, enumHandlers.FILTERTYPE.FOLLOWUP]) !== -1;
    };
    self.GetAddJumpOrFilterIndex = function () {
        // finding a location to insert filter or jump

        var index = self.Data().length;
        for (var i = 0; i < self.Data().length; i++) {
            if (!self.IsFilterOrJump(self.Data()[i])) {
                index = i;
                break;
            }
        }
        return index;
    };

    self.MarkAllAdhocAsApplied = function () {
        jQuery.each(self.GetFiltersAndJumps(), function (index, queryStep) {
            if (queryStep.is_adhoc())
                queryStep.is_applied = true;
        });
    };
    self.HasWarning = function () {
        var validationContext = validationHandler.GetQueryBlocksValidation(_self.definition);
        var otherWarning = validationContext.InvalidAggregates || validationContext.InvalidSortings;
        var thisWarning = self.Data().hasObject('warning', function (warning) { return warning(); });
        return otherWarning || thisWarning;
    };
    self.AreEqual = function (rawData, data) {
        // 1st check
        var changed = rawData.length !== data.length;
        if (!changed) {
            // 2nd check, again on by one
            jQuery.each(data, function (index, query) {
                if (query.is_changed(rawData[index])) {
                    changed = true;
                    return false;
                }
            });
        }
        return !changed;
    };
    self.GetCompareData = function (rawData, checkAll) {
        // check all
        var data = self.Data();

        // only check filters & jumps
        if (!checkAll) {
            rawData = rawData.findObjects('step_type', function (stepType) {
                return jQuery.inArray(stepType, [enumHandlers.FILTERTYPE.FILTER, enumHandlers.FILTERTYPE.FOLLOWUP]) !== -1;
            });
            data = self.GetFiltersAndJumps();
        }
        return [rawData, data];
    };
    self.HasChanged = function (checkBlockUI, checkAll) {
        var data = self.GetCompareData(self.GetQueryStepsFromQueryDefinition(self.GetRawQueryDefinition()), checkAll);
        var changed = !self.AreEqual(data[0], data[1]);

        // checkBlockUI=true only applies to view
        // checkBlockUI=false only applies to handler
        if (checkBlockUI)
            self.CheckBlockUI(changed, _self.$container);

        return changed;
    };
    self.HasSourceChanged = function (checkAll) {
        var data = self.GetCompareData(self.GetQueryStepsFromQueryDefinition(self.GetSourceData()), checkAll);
        var changed = !self.AreEqual(data[0], data[1]);
        return changed;
    };
    self.HasExecutionParametersChanged = function () {
        var self = this;
        var source = ko.toJS(self.GetQueryStepsFromQueryDefinition(self.GetSourceData()));
        var isExecutionParamter = function (queryStep) {
            return self.IsFilter(queryStep) && queryStep.is_execution_parameter;
        };
        jQuery.each(source, function (index, queryStep) {
            var dataQueryStep = ko.toJS(self.Data()[index]);
            if (isExecutionParamter(queryStep) && isExecutionParamter(dataQueryStep) && queryStep.field === dataQueryStep.field) {
                queryStep.operator = dataQueryStep.operator;
                queryStep.arguments = dataQueryStep.arguments;
            }
        });
        var data = self.GetCompareData(source, true);
        var changed = !self.AreEqual(data[0], data[1]);
        return changed;
    };
    self.HasJumpChanged = function () {
        // checking if any jump has been updated
        // normally, a confirmation popup should be appeared to a user

        var rawData = self.GetQueryStepsFromQueryDefinition(_self.definition);
        var rawJumps = rawData.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        var jumps = self.GetJumps();

        // 1st check
        var changed = rawJumps.length !== jumps.length;
        if (!changed && rawJumps.length && jumps.length) {
            // 2nd check the latest jump
            changed = rawJumps[rawJumps.length - 1].followup !== jumps[jumps.length - 1].followup;
        }
        return changed;
    };
    self.HasData = function () {
        var rawData = self.GetQueryStepsFromQueryDefinition(_self.definition);
        var rawHasData = rawData.hasObject('step_type', function (stepType) {
            return jQuery.inArray(stepType, [enumHandlers.FILTERTYPE.FILTER, enumHandlers.FILTERTYPE.FOLLOWUP]) !== -1;
        });
        return rawHasData || self.GetFiltersAndJumps().length;
    };
    self.CanApply = function () {
        // can do both execute & save
        var hasAuthorization = self.Authorizations.CanChangeJump() || self.Authorizations.CanChangeFilter();
        return !self.ReadOnly() && self.HasData() && hasAuthorization;
    };
    self.CanAdd = function (queryStep) {
        // check can add filter or jump, if there is error jump before this query then it is not allowed
        // there are 3 locations
        // 1. Add filter before jump menu
        // 2. Add filter button
        // 3. Add jump button

        var hasJumpError = false;
        var stop = self.Data.indexOf(queryStep);
        if (stop === -1)
            stop = self.Data().length;
        for (var i = 0; i < stop; i++) {
            if (self.IsErrorJump(self.Data()[i])) {
                hasJumpError = true;
                break;
            }
        }
        return !hasJumpError
            && self.Authorizations.CanExecute()
            && self.Authorizations.CanChangeFilter();
    };
    self.CanExecute = function () {
        // check authorization or force to disable
        var hasAuthorization = !self.ReadOnly() && self.Authorizations.CanExecute();

        // check warnings
        var hasWarnings = self.HasWarning();

        return hasAuthorization && !hasWarnings;
    };
    self.Execute = jQuery.noop;
    self.CanSave = function () {
        return self.Authorizations.CanSave();
    };
    self.Cancel = function () {
        if (!self.HasChanged(false, false))
            return;

        // revert every changes
        var sourceQueryDefinition = self.GetRawQueryDefinition();
        self.ForcedUpdateData(sourceQueryDefinition);
    };
    self.Validate = function () {
        var result = {
            valid: true,
            message: ''
        };
        var messages = [];
        jQuery.each(self.GetFilters(), function (index, queryStep) {
            var validation = queryStep.validate();
            if (!validation.valid) {
                result.valid = false;
                messages.push(validationHandler.GetValidationError(validation, queryStep.model));
            }
        });
        result.message = Localization.Info_PleaseEnterValidFilter + '<br/><br/>' + validationHandler.GetAllInvalidMessagesHtml(messages);
        return result;
    };
    self.Save = jQuery.noop;
    self.ShowProgressbar = function () {
        _self.$container.find('.btn-save').addClass('btn-busy');
        _self.$container.busyIndicator(true);
        _self.$container.find('.k-loading-mask').addClass('k-loading-none');
    };
    self.HideProgressbar = function () {
        _self.$container.find('.btn-save').removeClass('btn-busy');
        _self.$container.busyIndicator(false);
    };

    self.ApplyHandler = function (container, viewSelector) {
        _self.$container = container;

        // set view
        _self.$container.find(viewSelector).html(self.View.GetFiltersAndJumpsTemplate());

        // set sortable
        self.InitialSortable(container);

        // apply ko
        WC.HtmlHelper.ApplyKnockout(self, container);

        // create block ui if needs
        self.CreateBlockUI(container);
    };
    self.GetContainer = function () {
        // getter for container

        return _self.$container;
    };
    self.CreateBlockUI = function (container) {
        
        if (self.BlockUI)
            WC.HtmlHelper.Overlay.Create(container.closest('.tab-content-wrapper'));
    };
    self.TriggerUpdateBlockUI = function () {
        if (self.BlockUI)
            WC.HtmlHelper.Overlay.Resize();
    };
    self.UpdateBlockUI = function (changed, target) {
        if (self.BlockUI)
            WC.HtmlHelper.Overlay.Update(changed, target);
    };
    self.CheckBlockUI = function (changed, target) {
        // this can be override, there are some logic that needed
        self.UpdateBlockUI(changed, target);
    };
    self.ScrollToItem = function (queryStep) {
        var index = self.Data.indexOf(queryStep);
        var element = _self.$container.find('.item[data-index="' + index + '"]');
        var editorElement = element.closest('.item');
        var scrollElement = _self.$container.closest('.tab-content-wrapper');
        if (!scrollElement.length || !editorElement.length)
            return;

        // scroll if the editor does not visible for all parts
        var scrollTop = scrollElement.scrollTop();
        var scrollElementBound = {};
        scrollElementBound.top = scrollElement.offset().top;
        scrollElementBound.bottom = scrollElementBound.top + scrollElement.outerHeight();
        var editorElementBound = {};
        editorElementBound.top = editorElement.offset().top;
        editorElementBound.bottom = editorElementBound.top + editorElement.outerHeight() + 50;
        if (editorElementBound.bottom > scrollElementBound.bottom || editorElementBound.bottom < scrollTop) {
            scrollElement.css('overflow', 'auto !important');
            scrollElement.scrollTop(scrollTop + (editorElementBound.bottom - scrollElementBound.bottom));
            scrollElement.css('overflow', '');
        }
    };
    self.ExpandPanel = function () {
        // expand container
        var target = _self.$container.find('.accordion-header');
        if (target.hasClass('close'))
            target.trigger('click');
    };
}

QueryDefinitionHandler.ExecuteAction = {
    Saved: 'saved',
    Adhoc: 'adhoc'
};