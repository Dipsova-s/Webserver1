var listSortHandler = new ListSortHandler();

function ListSortHandler() {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.CustomCurrent = null;
    self.TYPE = {
        ASC: 'ASC',
        DESC: 'DESC',
        CUSTOM: 'CUSTOM'
    };
    self.QuerySteps = ko.observableArray([]);
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.IsClearSortingStep = function () {
        var steps = self.QuerySteps();
        return steps.length > 0 && !steps[0].sorting_fields.length;
    };
    self.SetQuerySteps = function (steps) {
        if(steps.length > 0 && steps[0].sorting_fields[0].sort_index === 0) {
            jQuery.each(steps[0].sorting_fields, function (k, v) {
                v.sort_index++;
            });
        }
        self.QuerySteps(steps);
    };
    self.Sort = function (fields, types) {
        var oldSort = ko.toJS(self.QuerySteps());
        if (types === self.TYPE.ASC || types === self.TYPE.DESC) {
            self.QuerySteps([{
                step_type: enumHandlers.FILTERTYPE.SORTING,
                sorting_fields: [{
                    field_id: fields,
                    sort_index: 1,
                    sort_order: types
                }]
            }]);
        }
        else {
            var sortingFields = [];
            jQuery.each(fields, function (k, v) {
                sortingFields.push({
                    field_id: v,
                    sort_index: k + 1,
                    sort_order: types[k]
                });
            });
            var sortingBlocks = [{
                step_type: enumHandlers.FILTERTYPE.SORTING,
                sorting_fields: sortingFields
            }];
            self.QuerySteps(sortingBlocks);
        }

        self.Apply(!jQuery.deepCompare(oldSort, self.QuerySteps(), false, false), oldSort);
    };
    self.SortCustom = function () {
        var fields = [],
            types = [];
        self.CustomCurrent.element.find('[data-role="dropdownlist"]').each(function (k, v) {
            var value = WC.HtmlHelper.DropdownList(v).value();
            if (value !== '') {
                var type = jQuery(v).parents('.field:first').find('input:checked').val();
                fields.push(value);
                types.push(type);
            }
        });
        if (!fields.length) {
            popup.Alert(Localization.Warning_Title, Localization.ErrorNoFieldSelected);
            return;
        }
        if (fields.length !== jQuery.unique(fields.slice(0)).length) {
            popup.Alert(Localization.Warning_Title, Localization.ErrorFieldDuplicated);
            return;
        }
        self.Sort(fields, types);
    };
    self.Apply = function (postNewResult, oldSort) {
        requestHistoryModel.SaveLastExecute(self, self.Apply, arguments);

        if (typeof postNewResult === 'undefined')
            postNewResult = true;
        listHandler.HideHeaderPopup();

        var isEditMode = anglePageHandler.IsEditMode();

        if (postNewResult) {
            var oldQueryStep = [];
            jQuery.each(ko.toJS(displayQueryBlockModel.QuerySteps()), function (index, step) {
                oldQueryStep.push(new WidgetFilterModel(step));
            });
            var oldQueryStepTemp = [];
            jQuery.each(ko.toJS(displayQueryBlockModel.TempQuerySteps()), function (index, step) {
                oldQueryStepTemp.push(new WidgetFilterModel(step));
            });

            var oldDisplayModel = historyModel.Get(displayModel.Data().uri);

            // remove existing sorting step
            displayQueryBlockModel.QuerySteps.remove(function (step) {
                return step.step_type === enumHandlers.FILTERTYPE.SORTING;
            });
            displayQueryBlockModel.TempQuerySteps.remove(function (step) {
                return step.step_type === enumHandlers.FILTERTYPE.SORTING;
            });

            var queryBlocks = [];
            if (angleInfoModel.IsTemporaryAngle()) {
                queryBlocks = jQuery.grep(displayModel.Data().query_blocks, function (queryBlock) { return queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS; });
                if (queryBlocks.length) {
                    queryBlocks[0].query_steps.removeObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                }
            }

            if (!self.IsClearSortingStep()) {
                var queryStep = new WidgetFilterModel(self.QuerySteps()[0]);
                var queryStepTemp = new WidgetFilterModel(self.QuerySteps()[0]);

                displayQueryBlockModel.QuerySteps.push(queryStep);
                displayQueryBlockModel.TempQuerySteps.push(queryStepTemp);

                if (angleInfoModel.IsTemporaryAngle()) {
                    if (queryBlocks.length) {
                        queryBlocks[0].query_steps.push({
                            step_type: queryStep.step_type,
                            sorting_fields: queryStep.sorting_fields
                        });
                    }
                    else {
                        displayModel.Data().query_blocks.push({
                            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                            query_steps: [{
                                step_type: queryStep.step_type,
                                sorting_fields: queryStep.sorting_fields
                            }]
                        });
                    }
                }
            }

            if (angleInfoModel.IsTemporaryAngle()) {
                displayModel.Data.commit();
            }

            if (isEditMode) {
                anglePageHandler.ApplyAngleAndDisplayWithoutResult(displayModel.Data());
            }
            else {
                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);
                progressbarModel.CancelCustomHandler = true;
                progressbarModel.CancelFunction = function () {
                    self.RollbackSorting(oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel);
                };

                jQuery.when(resultModel.PostResult({ useExecuteStep: true, customExecuteStep: self.QuerySteps() }))
                    .then(function () {
                        historyModel.Save();
                        return resultModel.GetResult(resultModel.Data().uri);
                    })
                    .then(resultModel.LoadResultFields)
                    .fail(function () {
                        self.ApplyFail(oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel);
                    })
                    .done(function () {
                        self.ApplyDone(resultModel.Data().sorting_limit_exceeded, oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel);
                    });
            }
        }
        else if (!isEditMode) {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);
            progressbarModel.SetDisableProgressBar();

            jQuery('.k-scrollbar-vertical').scrollTop(0);
            setTimeout(function () {
                progressbarModel.EndProgressBar();
            }, 100);
        }
    };
    self.ApplyFail = function (oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel) {
        // error popup will be shown after this block, so add delay before set close event
        setTimeout(function () {
            popup.OnCloseCallback = function () {
                self.RollbackSorting(oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel);
            };
        }, 100);
    };
    self.ApplyDone = function (sortingLimit, oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel) {
        if (sortingLimit) {
            // don't apply sorting result of this error
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_DisplaySortingReachedLimitation, sortingLimit));
            popup.OnCloseCallback = function () {
                self.RollbackSorting(oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel);
            };
        }
        else {
            jQuery('#AngleGrid .k-scrollbar-vertical').scrollTop(0);
            resultModel.ApplyResult();
        }
    };
    self.RollbackSorting = function (oldSort, oldQueryStep, oldQueryStepTemp, oldDisplayModel) {
        self.CloseCustomPopup();
        WC.Ajax.AbortAll();

        displayQueryBlockModel.QuerySteps(oldQueryStep);
        displayQueryBlockModel.TempQuerySteps(oldQueryStepTemp);
        self.QuerySteps(oldSort);

        displayModel.LoadSuccess(oldDisplayModel);
        resultModel.LoadSuccess(oldDisplayModel.results);
        historyModel.Save();

        resultModel.GetResult(resultModel.Data().uri)
            .then(resultModel.LoadResultFields)
            .done(function () {
                resultModel.ApplyResult();
            });
    };
    self.Clear = function () {
        var oldSort = ko.toJS(self.QuerySteps());
        self.QuerySteps([{
            step_type: enumHandlers.FILTERTYPE.SORTING,
            sorting_fields: []
        }]);
        self.Apply(true, oldSort);
    };
    self.GetSortInfoByFieldId = function (fieldId) {
        var data = null;
        fieldId = fieldId.toLowerCase();
        if (self.QuerySteps().length > 0) {
            jQuery.each(self.QuerySteps()[0].sorting_fields, function (k, v) {
                if (v.field_id.toLowerCase() === fieldId) {
                    data = v;
                    return false;
                }
            });
        }
        return data;
    };
    self.IsCustomSort = function () {
        return self.QuerySteps().length !== 0 && self.QuerySteps()[0].sorting_fields.length > 1;
    };
    self.ShowCustomSortPopup = function (fieldId) {
        var fieldElementId = WC.Utility.ConvertFieldName(fieldId);

        if (jQuery('#CustomSortPopup').is(':visible'))
            return;

        requestHistoryModel.SaveLastExecute(self, self.ShowCustomSortPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        listFormatSettingHandler.CloseCustomPopup();
        var popupSettings = {
            title: Localization.CustomSortTitle,
            element: '#CustomSortPopup',
            html: customeSortHtmlTemplate(),
            appendTo: '#PopupHeader' + fieldElementId + ' > .k-window-content',
            className: 'customSortPopup',
            pinned: false,
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: 'close',
                    position: 'right'
                },
                {
                    text: Localization.Ok,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj))
                            self.SortCustom();
                    },
                    isPrimary: true,
                    position: 'right'
                },
                {
                    text: Localization.ClearAll,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj))
                            self.Clear();
                    },
                    position: 'left'
                }
            ],
            animation: false,
            modal: false,
            center: false,
            draggable: false,
            resizable: false,
            actions: ["Close"],
            open: self.ShowCustomPopupCallback,
            close: function (e) {
                WC.HtmlHelper.MenuNavigatable.prototype.UnlockMenu('.HeaderPopup');
                popup.Destroy(e);
            }
        };

        if (jQuery('.HeaderPopup:visible').hasClass('scrollable')) {
            popupSettings.appendTo = 'body';
            popupSettings.draggable = true;
            popupSettings.center = true;
            popupSettings.className += ' k-window-draggable';

            jQuery('#PopupHeader' + fieldElementId).hide();
        }
        else {
            popupSettings.className += ' inside';
        }

        var win = popup.Show(popupSettings);
        self.CustomCurrent = win;
    };
    self.ShowCustomPopupCallback = function (e) {
        // bind dropdown
        if (!jQuery('.eaDropdown:first', e.sender.element).hasClass('k-dropdown')) {
            // collect column def.
            var columnDefinitions = [], columnDefinition, sourceField;
            jQuery.each(displayModel.Data().fields, function (index, column) {
                columnDefinition = ko.toJS(modelFieldsHandler.GetFieldById(column.field, angleInfoModel.Data().model));
                if (columnDefinition) {
                    if (columnDefinition.source) {
                        sourceField = modelFieldSourceHandler.GetFieldSourceByUri(columnDefinition.source);
                        if (sourceField) {
                            columnDefinition.short_name = userFriendlyNameHandler.GetFriendlyName(sourceField, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) + ' - ' + columnDefinition.short_name;
                        }
                    }
                    columnDefinitions.push(ko.toJS(columnDefinition));
                }
            });

            columnDefinitions.splice(0, 0, { id: '', short_name: Localization.None });
            columnDefinitions = jQuery.map(columnDefinitions, function (column) {
                column.id = column.id.toLowerCase();
                return column;
            });
            jQuery('.eaDropdown', e.sender.element).each(function (index, element) {
                WC.HtmlHelper.DropdownList(element, columnDefinitions, {
                    dataTextField: "short_name",
                    dataValueField: "id",
                    index: 0,
                    change: function () {
                        var popup = self.CustomCurrent.wrapper.addClass('alwaysVisible');
                        var headerPopup = jQuery(popup).parents('.HeaderPopup:first').addClass('alwaysVisible');
                        setTimeout(function () {
                            popup.show().removeClass('alwaysVisible');
                            headerPopup.show().removeClass('alwaysVisible');
                        }, 500);
                    }
                });
            });
        }

        // set default value
        var querySteps = self.QuerySteps();
        var ddl = jQuery('[data-role="dropdownlist"]', e.sender.element);
        var sortStepIndex;
        if (querySteps.length > 0 && ddl.length > 0) {
            jQuery(querySteps[0].sorting_fields).each(function (k, v) {
                sortStepIndex = typeof v.sort_index === 'undefined' ? k : v.sort_index - 1;
                WC.HtmlHelper.DropdownList(ddl.eq(sortStepIndex)).value(v.field_id.toLowerCase());
                jQuery(ddl).eq(v.sort_index - 1).parents('.field:first').find('input:radio').val([v.sort_order]);
            });
        }
        setTimeout(function () {
            listHandler.UpdateAngleGridHeaderPopup();
        }, 1);
        setTimeout(function () {
            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
        }, 10);

    };
    self.CloseCustomPopup = function () {
        popup.Close('.customSortPopup .k-window-content');
    };
    /*EOF: Model Methods*/
}
