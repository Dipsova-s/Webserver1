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
                    position: 'right'
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
            resize: function () {
                if (self.HandlerFilter) {
                    self.HandlerFilter.View.AdjustLayout();
                }
            },
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

        requestHistoryModel.SaveLastExecute(self, self.ShowCustomPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        listHandler.HideHeaderPopup();

        var popupSettings = self.GetPopupSettings(Localization.ListHeaderPopupAddFilter, function () {
            self.ApplyFilter();
        });
        popupSettings.open = function (e) {
            self.HandlerFilter = new WidgetFilterHandler(e.sender.element, []);
            self.HandlerFilter.ModelUri = modelUri;
            self.HandlerFilter.HasExecutionParameter(true);
            self.HandlerFilter.FilterFor = self.HandlerFilter.FILTERFOR.DISPLAY;
            self.HandlerFilter.Sortable(false);
            self.HandlerFilter.CanChange = function () {
                return true;
            };
            self.HandlerFilter.CanRemove = function () {
                return false;
            };

            var angleBaseClassBlock = _self.handler.Models.Angle.Data().query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            self.HandlerFilter.SetFieldChoooserInfo(angleBaseClassBlock ? angleBaseClassBlock.base_classes : [], angleQueryStepModel.QuerySteps(), displayQueryBlockModel.TempQuerySteps());

            self.ShowAddFilterPopupCallback(e, field);
        };

        self.HandlerFilter = null;

        popup.Show(popupSettings);
    };
    self.ShowAddFilterPopupCallback = function (e, field) {
        self.HandlerFilter.ApplyHandler();
        self.HandlerFilter.AddFieldFilter(field);
        self.HandlerFilter.Element.find('.FilterHeader').addClass('Disabled');

        setTimeout(function () {
            listHandler.UpdateAngleGridHeaderPopup();
        }, 1);

        setTimeout(function () {
            e.sender.wrapper.find('.btn').removeClass('executing');
        }, 10);
    };
    self.ShowEditDashboardFilterPopup = function (filter, modelUri, fnApplyFilter) {
        requestHistoryModel.SaveLastExecute(self, self.ShowEditDashboardFilterPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var popupSettings = self.GetPopupSettings(Localization.ListHeaderPopupEditFilter, fnApplyFilter);
        popupSettings.open = function (e) {
            self.HandlerFilter = new WidgetFilterHandler(e.sender.element, []);
            self.HandlerFilter.Data([filter]);
            self.HandlerFilter.ModelUri = modelUri;
            self.HandlerFilter.HasExecutionParameter(false);
            self.HandlerFilter.FilterFor = self.HandlerFilter.FILTERFOR.DASHBOARD;
            self.HandlerFilter.Sortable(false);
            self.HandlerFilter.CanChange = function () {
                return true;
            };
            self.HandlerFilter.CanRemove = function () {
                return false;
            };
            self.HandlerFilter.SetFieldChoooserInfo([]);

            self.ShowEditDashboardFilterPopupCallback(e);
        };

        self.HandlerFilter = null;

        popup.Show(popupSettings);
    };
    self.ShowEditDashboardFilterPopupCallback = function (e) {
        self.HandlerFilter.ApplyHandler();
        self.HandlerFilter.View.Toggle('FilterHeader-0');
        self.HandlerFilter.Element.find('.FilterHeader').addClass('Disabled');

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
        return filter;
    };
    self.ApplyFilter = function () {
        requestHistoryModel.SaveLastExecute(self, self.ApplyFilter, arguments);

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
            historyModel.Save();
        };

        if (anglePageHandler.IsEditMode()) {
            saveAddedQueryStep();
            anglePageHandler.ApplyExecutionAngle();
            self.CloseAddFilterPopup();
        }
        else {
            measurePerformance.SetStartTime();
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);

            var oldDisplayModel = historyModel.Get(_self.handler.Models.Display.Data().uri);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.CancelFunction = function () {
                self.CloseAddFilterPopup();

                WC.Ajax.AbortAll();
                _self.handler.Models.Display.LoadSuccess(oldDisplayModel);
                _self.handler.Models.Result.LoadSuccess(oldDisplayModel.results);
                historyModel.Save();

                _self.handler.Models.Result.GetResult(_self.handler.Models.Result.Data().uri)
                    .then(_self.handler.Models.Result.LoadResultFields)
                    .done(_self.handler.Models.Result.ApplyResult);
            };

            // refresh resule grid after add query step
            var postQuerySteps = ko.toJS(_self.handler.Models.DisplayQueryBlock.QuerySteps());
            postQuerySteps.push(queryStep);

            var option = {};
            option.customQueryBlocks = _self.handler.Models.DisplayQueryBlock.CollectQueryBlocks(postQuerySteps);

            _self.handler.Models.Result.PostResult(option)
                .fail(function () {
                    errorHandlerModel.OnClickRetryErrorCallback = self.ApplyFilter;
                })
                .done(function () {
                    self.CloseAddFilterPopup();
                    saveAddedQueryStep();

                    _self.handler.Models.Result.GetResult(_self.handler.Models.Result.Data().uri)
                        .then(_self.handler.Models.Result.LoadResultFields)
                        .done(_self.handler.Models.Result.ApplyResult);
                });
        }
    };
    self.ApplyCustomFilter = function (handler, filter) {
        var queryStep = new WidgetFilterModel(filter);
        self.SetViewHandler(handler);
        self.HandlerFilter = { GetData: ko.observable([queryStep]) };
        self.ApplyFilter();
    };
    /*EOF: Model Methods*/
}
