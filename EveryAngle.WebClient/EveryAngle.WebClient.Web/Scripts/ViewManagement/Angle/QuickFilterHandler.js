var quickFilterHandler = new QuickFilterHandler();

function QuickFilterHandler() {
    "use strict";

    var self = this;
    var _self = {};

    /*BOF: Model Properties*/
    _self.handler = null;
    _self.popupName = 'ListFilter';

    self.HandlerFilter = null;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.GetPopupSettings = function (popupTitle, fnApplyFilter) {
        return {
            title: popupTitle,
            element: '#popup' + _self.popupName,
            appendTo: 'body',
            className: 'popup' + _self.popupName,
            width: 545,
            minWidth: 545,
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: function (e) {
                        e.kendoWindow.close();
                        e.stopPropagation();
                    },
                    position: 'right',
                    isSecondary: true
                },
                {
                    text: Localization.Ok,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj) && self.CheckValidation()) {
                            var queryStep = self.GetFilterStep();
                            fnApplyFilter(queryStep);
                        }
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            animation: false,
            close: function (e) {
                setTimeout(function () {
                    e.sender.destroy();
                }, 500);
            }
        };
    };
    self.ShowAddFilterPopup = function (fieldId, handler) {
        self.SetViewHandler(handler);
        var modelUri = _self.handler.Models.Angle.Data().model;
        var field = modelFieldsHandler.GetFieldById(fieldId, modelUri);
        if (!field)
            return;

        listHandler.HideHeaderPopup();

        var popupSettings = self.GetPopupSettings(Localization.ListHeaderPopupAddFilter, function () {
            self.ApplyFilter();
        });
        popupSettings.open = function (e) {
            e.sender.element.html(
                '<div class="card">' +
                    '<div class="card-body"></div>' +
                '</div>');

            var filterAngle = new QueryDefinitionHandler();
            filterAngle.AllowExecutionParameter(true);

            var groupQueryDefinitionAndBlocks = function () {
                var result = _self.handler.Models.Angle.Data();
                var angleQueryStep = jQuery.grep(_self.handler.Models.Angle.Data().query_definition, function (queryBlock) {
                    return queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS;
                });
                var displayQueryStep = jQuery.grep(_self.handler.Models.Display.Data().query_blocks, function (queryBlock) {
                    return queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS;
                });

                // Angle has only base class, then create empty query step.
                if (angleQueryStep.length === 0) {
                    _self.handler.Models.Angle.Data().query_definition.push({
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: []
                    });
                }

                // Display has any query step, then add query step into Angle.
                if (displayQueryStep.length) {
                    result.query_definition[1].query_steps.push.apply(
                        result.query_definition[1].query_steps, displayQueryStep[0].query_steps
                    );
                }

                return result.query_definition;
            };

            filterAngle.SetData(groupQueryDefinitionAndBlocks(), 'query_definition', modelUri);

            var queryDefinitionHandler = new QueryDefinitionHandler();
            queryDefinitionHandler.Parent(filterAngle);
            queryDefinitionHandler.AllowExecutionParameter(true);
            queryDefinitionHandler.Authorizations.CanChangeFilter(true);
            queryDefinitionHandler.CanEditFilter = function () {
                return false;
            };
            queryDefinitionHandler.CanRemoveFilter = function () {
                return false;
            };
            queryDefinitionHandler.CanApply = function () {
                return false;
            };
            queryDefinitionHandler.CanSortFilter = function () {
                return false;
            };
            queryDefinitionHandler.CanMoveFilter = function () {
                return false;
            };
            queryDefinitionHandler.SetData([], 'query_blocks', modelUri);
            queryDefinitionHandler.Texts().AskForExecutionParamter = Localization.AskForValueWhenTheAngleOpens;
            queryDefinitionHandler.ApplyHandler(e.sender.element, '.card-body');

            self.HandlerFilter = queryDefinitionHandler;
            self.ShowAddFilterPopupCallback(e, field);
        };

        self.HandlerFilter = null;

        popup.Show(popupSettings);
    };
    self.ShowAddFilterPopupCallback = function (e, field) {
        self.HandlerFilter.AddFilter(field);

        setTimeout(function () {
            listHandler.UpdateAngleGridHeaderPopup();
        }, 1);

        setTimeout(function () {
            e.sender.wrapper.find('.btn').removeClass('executing');
        }, 10);
    };
    self.CloseAddFilterPopup = function () {
        popup.Close('.popupListFilter .k-window-content');
    };
    self.SetViewHandler = function (handler) {
        _self.handler = handler;
    };
    self.CheckValidation = function () {
        /* M4-14130: Show message if filter is invalided */
        var checkValidArgument = validationHandler.CheckValidExecutionParameters(self.HandlerFilter.Data(), self.HandlerFilter.ModelUri);
        if (!checkValidArgument.IsAllValidArgument) {
            popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
            return false;
        }
        else {
            return true;
        }
    };
    self.GetFilterStep = function () {
        var filter = self.HandlerFilter.GetData()[0];
        filter.is_adhoc_filter = true;
        filter.is_adhoc = true;
        return filter;
    };
    self.ApplyFilter = function () {
        var queryStep = self.GetFilterStep();
        var getInsertFilterIndex = function (querySteps) {
            var index = -1;
            jQuery.each(querySteps, function (i, step) {
                if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                    index = i;
                }
            });
            return index;
        };
        var saveAddedQueryStep = function () {
            var lastFilterOrFollowupIndex = getInsertFilterIndex(_self.handler.Models.DisplayQueryBlock.QuerySteps());
            _self.handler.Models.DisplayQueryBlock.QuerySteps.splice(lastFilterOrFollowupIndex + 1, 0, new WidgetFilterModel(queryStep));

            lastFilterOrFollowupIndex = getInsertFilterIndex(_self.handler.Models.DisplayQueryBlock.TempQuerySteps());
            _self.handler.Models.DisplayQueryBlock.TempQuerySteps.splice(lastFilterOrFollowupIndex + 1, 0, new WidgetFilterModel(queryStep));

            if (angleInfoModel.IsTemporaryAngle()) {
                var queryBlocks = jQuery.grep(_self.handler.Models.Display.Data().query_blocks, function (queryBlock) {
                    return queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS;
                });
                if (queryBlocks.length) {
                    lastFilterOrFollowupIndex = getInsertFilterIndex(queryBlocks[0].query_steps);
                    queryBlocks[0].query_steps.splice(lastFilterOrFollowupIndex + 1, 0, ko.toJS(queryStep));
                }
                else {
                    _self.handler.Models.Display.Data().query_blocks.push({
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: [ko.toJS(queryStep)]
                    });
                }
                _self.handler.Models.Display.Data.commit();
            }

            var tmpQueryStep = ko.toJS(queryStep);
            var newQueryStep = {
                step_type: enumHandlers.FILTERTYPE.FILTER,
                field: tmpQueryStep.field,
                operator: tmpQueryStep.operator,
                arguments: tmpQueryStep.arguments,
                is_execution_parameter: tmpQueryStep.is_execution_parameter,
                is_adhoc: true,
                is_applied: true,
                edit_mode: false
            };
            anglePageHandler.HandlerSidePanel.Open(1);
            anglePageHandler.HandlerDisplay.QueryDefinitionHandler.AddQueryFilter(newQueryStep);
        };

        self.SetCancelFunction();
        saveAddedQueryStep();
        self.CloseAddFilterPopup();
        var aggregationStep = anglePageHandler.HandlerDisplay.QueryDefinitionHandler.GetAggregation();
        var executionSteps = [queryStep];
        if (aggregationStep)
            executionSteps.push(aggregationStep.data());
        anglePageHandler.HandlerDisplay.SetPostExecutionSteps(executionSteps);
        anglePageHandler.HandlerDisplay.ExecuteQueryDefinition(QueryDefinitionHandler.ExecuteAction.Adhoc);
    };
    
    self.SetCancelFunction = function () {
        var oldResult = anglePageHandler.HandlerDisplay.ResultHandler.GetData();
        var oldDisplay = anglePageHandler.HandlerDisplay.GetData();
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.KeepCancelFunction = true;
        progressbarModel.CancelFunction = function () {
            var filters = anglePageHandler.HandlerDisplay.QueryDefinitionHandler.GetFilters();
            WC.Page.Stop();
            self.Models.Display.LoadSuccess(oldDisplay);
            self.Models.Result.LoadSuccess(oldResult);
            anglePageHandler.HandlerDisplay.ResultHandler.Cancel();
            anglePageHandler.HandlerDisplay.QueryDefinitionHandler.Data.remove(filters[filters.length - 1]);
            anglePageHandler.HandlerDisplay.SetPostResultData(oldResult);
            anglePageHandler.HandlerDisplay.ExecuteQueryDefinition(QueryDefinitionHandler.ExecuteAction.Adhoc);
        };
    };
    self.ApplyCustomFilter = function (handler, filter) {
        var queryStep = new WidgetFilterModel(filter);
        self.SetViewHandler(handler);
        self.HandlerFilter = { GetData: ko.observable([queryStep]) };
        self.ApplyFilter();
    };
    self.AddFilter = function (fieldId, handler) {
        self.SetViewHandler(handler);
        var modelUri = _self.handler.Models.Angle.Data().model;
        var field = modelFieldsHandler.GetFieldById(fieldId, modelUri);
        if (!field)
            return;
        anglePageHandler.HandlerSidePanel.Open(1);
        anglePageHandler.HandlerDisplay.QueryDefinitionHandler.AddFilter(field);
    };
    /*EOF: Model Methods*/
}
