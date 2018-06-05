var quickFilterHandler = new QuickFilterHandler();

function QuickFilterHandler() {
    "use strict";

    var self = this;
    var _self = {};

    /*BOF: Model Properties*/
    _self.handler = null;

    self.Handler = null;
    self.Field = null;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.ShowAddFilterPopup = function (fieldId, handler) {
        self.SetViewHandler(handler);

        var fieldElementId = WC.Utility.ConvertFieldName(fieldId);
        var modelUri = _self.handler.Models.Angle.Data().model;
        var field = modelFieldsHandler.GetFieldById(fieldId, modelUri);
        if (!field)
            return;

        jQuery('#PopupHeader' + fieldElementId).hide();

        requestHistoryModel.SaveLastExecute(self, self.ShowCustomPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        listSortHandler.CloseCustomPopup();
        listFormatSettingHandler.CloseCustomPopup();

        var popupName = 'ListFilter',
            popupSettings = {
                title: Localization.ListHeaderPopupAddFilter,
                element: '#popup' + popupName,
                appendTo: 'body',
                className: 'popup' + popupName,
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
                            if (popup.CanButtonExecute(obj)) {
                                if (self.CheckValidation()) {
                                    self.ApplyFilter();
                                }
                            }
                        },
                        isPrimary: true,
                        position: 'right'
                    }
                ],
                animation: false,
                resize: function () {
                    if (self.Handler) {
                        self.Handler.View.AdjustLayout();
                    }
                },
                open: function (e) {
                    self.Handler = new WidgetFilterHandler(e.sender.element, []);
                    self.Handler.ModelUri = _self.handler.Models.Angle.Data().model;
                    self.Handler.HasExecutionParameter(true);
                    self.Handler.FilterFor = self.Handler.FILTERFOR.DISPLAY;
                    self.Handler.Sortable(false);
                    self.Handler.CanChange = function () {
                        return true;
                    };
                    self.Handler.CanRemove = function () {
                        return false;
                    };

                    var angleBaseClassBlock = _self.handler.Models.Angle.Data().query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
                    self.Handler.SetFieldChoooserInfo(angleBaseClassBlock ? angleBaseClassBlock.base_classes : [], angleQueryStepModel.QuerySteps());

                    self.ShowCustomPopupCallback(e);
                },
                close: function (e) {
                    setTimeout(function () {
                        e.sender.destroy();
                    }, 500);
                }
            };

        self.Handler = null;
        self.Field = field;

        popup.Show(popupSettings);
    };
    self.ShowCustomPopupCallback = function (e) {
        self.Handler.ApplyHandler();
        self.Handler.AddFilter(self.Field, enumHandlers.FILTERTYPE.FILTER);
        self.Handler.Element.find('.FilterHeader').addClass('Disabled');

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
        var checkValidArgument = validationHandler.CheckValidExecutionParameters(self.Handler.Data(), _self.handler.Models.Angle.Data().model);
        if (!checkValidArgument.IsAllValidArgument) {
            popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
            return false;
        }
        else {
            return true
        }
    };
    self.ApplyFilter = function () {
        requestHistoryModel.SaveLastExecute(self, self.ApplyFilter, arguments);

        var queryStep = self.Handler.GetData()[0];
        queryStep.is_adhoc_filter = true;

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
        self.Handler = { GetData: ko.observable([queryStep]) };
        self.ApplyFilter();
    };
    /*EOF: Model Methods*/
}
