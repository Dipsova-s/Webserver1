function ExecutionParameterHandler(angle, display) {
    "use strict";

    var self = this;
    var _self = {};

    /*BOF: Model Properties*/
    self.WidgetDetailAngle = null;
    self.WidgetFilterAngle = null;
    self.WidgetFilterDisplay = null;
    self.Angle = angle || null;
    self.Display = display || null;
    self.ModelUri = '';
    self.AngleEnable = true;
    self.DisplayEnable = true;
    self.CanUseCompareField = true;
    self.ClickShowBaseClassInfoPopupString = 'return false';
    self.ShowPopupBeforeCallback = function () { return true; };
    self.ShowPopupAfterCallback = function () { return true; };

    _self.isSubmit = false;
    _self.popupId = 'ExecuteParameters';
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.ShowExecutionParameterPopup = function () {
        requestHistoryModel.SaveLastExecute(self, self.ShowExecutionParameterPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        _self.isSubmit = false;
        var popupSettings = {
            title: Localization.ExecutionPopupExecutionParameters,
            element: '#popup' + _self.popupId,
            html: executeParameterHtmlTemplate(),
            className: 'popup' + _self.popupId,
            buttons: self.GetExecutionParameterButtons(),
            resize: self.OnExecutionParameterPopupResize,
            open: self.ShowExecutionParameterPopupCallback,
            close: self.ExecutionParameters
        };

        popup.Show(popupSettings);
    };
    self.ShowExecutionParameterPopupCallback = function (e) {
        e.sender.element.busyIndicator(true);

        jQuery.when(self.ShowPopupBeforeCallback())
            .then(self.LoadMetadata)
            .done(function () {
                self.InitialAngleWidgets(e);

                self.WidgetFilterDisplay = null;
                if (self.DisplayEnable && self.Display) {
                    // set display name
                    e.sender.element.find('.displayInfo .objectName').text(self.Display.name || WC.Utility.GetDefaultMultiLangText(self.Display.multi_lang_name));

                    self.InitialDisplayWidgets(e);
                }

                self.SetElementVisibility(e);
                self.CompleteExecutionParameterPopup(e);
            });
    };
    self.GetExecutionParameterButtons = function () {
        return [
            {
                text: Captions.Button_Cancel,
                className: 'executing',
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj)) {
                        _self.isSubmit = false;
                        e.kendoWindow.close();
                    }
                },
                position: 'right'
            },
            {
                text: Localization.ExecutionPopupChangeAngle,
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj)) {
                        self.ToggleParameters(e.kendoWindow, false);
                    }
                },
                className: 'btnChangeAngleParameters alwaysHide executing',
                isPrimary: true,
                position: 'right'
            },
            {
                text: Localization.ExecutionPopupChangeDisplay,
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj)) {
                        self.ToggleParameters(e.kendoWindow, true);
                    }
                },
                className: 'btnChangeDisplayParameters alwaysHide executing',
                isPrimary: true,
                position: 'right'
            },
            {
                text: Localization.Ok,
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj)) {
                        _self.isSubmit = true;
                        e.kendoWindow.close();
                    }
                },
                className: 'executing',
                isPrimary: true,
                position: 'right'
            }
        ];
    };
    self.OnExecutionParameterPopupResize = function (e) {
        var winHeight = e.sender.element.height();
        var filterWrapper = e.sender.wrapper.find('.definitionList');
        if (filterWrapper.is(':visible')) {
            var height = winHeight - (filterWrapper.offset().top - e.sender.element.offset().top);
            filterWrapper.css('max-height', height + 10);
        }

        if (self.WidgetDetailAngle)
            self.WidgetDetailAngle.AdjustLayout();
        if (self.WidgetFilterAngle)
            self.WidgetFilterAngle.View.AdjustLayout();
        if (self.WidgetFilterDisplay)
            self.WidgetFilterDisplay.View.AdjustLayout();
    };
    self.InitialAngleWidgets = function (e) {
        var angleBlocks = ko.toJS(self.Angle.query_definition);
        var angleBaseClasses = self.GetAngleBaseClasses();

        // initial widget angle details
        self.WidgetDetailAngle = new WidgetDetailsHandler(e.sender.element.find('.widgetDetailsWrapper'), '', angleBlocks, [], [], '');
        self.WidgetDetailAngle.Angle = self.Angle;
        self.WidgetDetailAngle.ModelUri = self.ModelUri;
        self.WidgetDetailAngle.CanViewBaseClassInfo(true);
        self.WidgetDetailAngle.ClickShowBaseClassInfoPopupString = self.ClickShowBaseClassInfoPopupString;
        self.WidgetDetailAngle.ApplyHandler(self.WidgetDetailAngle.View.TemplateBaseClasses);

        // initial widget angle filter
        var angleQueryStepBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) || { query_steps: [] };
        self.WidgetFilterAngle = new WidgetFilterHandler(e.sender.element.find('[id="FilterAngleWrapper"]'), angleQueryStepBlock.query_steps);
        self.WidgetFilterAngle.CanUseCompareField(self.CanUseCompareField);
        self.WidgetFilterAngle.ModelUri = self.ModelUri;
        self.WidgetFilterAngle.HasExecutionParameter(true);
        self.WidgetFilterAngle.FilterFor = self.WidgetFilterAngle.FILTERFOR.ANGLE;
        self.WidgetFilterAngle.CanRemove = function (data) {
            return false;
        };
        self.WidgetFilterAngle.CanChange = function (data) {
            if (typeof data === 'undefined')
                return false;

            return data.is_execution_parameter();
        };
        self.WidgetFilterAngle.ApplyHandler();
        self.WidgetFilterAngle.SetFieldChoooserInfo(angleBaseClasses);
    };
    self.InitialDisplayWidgets = function (e) {
        // initial widget display filter
        var angleBaseClasses = self.GetAngleBaseClasses();
        var displayQueryStepBlock = ko.toJS(self.Display.query_blocks).findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) || { query_steps: [] };
        self.WidgetFilterDisplay = new WidgetFilterHandler(e.sender.element.find('[id="FilterDisplayWrapper"]'), displayQueryStepBlock.query_steps);
        self.WidgetFilterDisplay.CanUseCompareField(self.CanUseCompareField);
        self.WidgetFilterDisplay.ModelUri = self.ModelUri;
        self.WidgetFilterDisplay.HasExecutionParameter(true);
        self.WidgetFilterDisplay.FilterFor = self.WidgetFilterDisplay.FILTERFOR.DISPLAY;
        self.WidgetFilterDisplay.CanRemove = function (data) {
            return false;
        };
        self.WidgetFilterDisplay.CanChange = function (data) {
            if (typeof data === 'undefined')
                return false;

            return data.is_execution_parameter();
        };
        self.WidgetFilterDisplay.ApplyHandler();
        self.WidgetFilterDisplay.SetFieldChoooserInfo(angleBaseClasses, self.WidgetFilterAngle ? self.WidgetFilterAngle.Data() : []);
    };
    self.GetAngleBaseClasses = function () {
        var angleBlocks = ko.toJS(self.Angle.query_definition);
        var angleBaseClassBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        return WC.Utility.GetObjectValue(angleBaseClassBlock, 'base_classes', []);
    };
    self.SetElementVisibility = function (e) {
        var isAngleParameterized = self.Angle && self.Angle.is_parameterized;
        var isDisplayParameterized = self.Display && self.Display.is_parameterized;
        if (self.AngleEnable && isAngleParameterized && isDisplayParameterized) {
            self.ToggleParameters(e.sender, false);
        }
        else if (self.AngleEnable && self.WidgetFilterAngle && isAngleParameterized) {
            e.sender.element.find('.angleInfo').show();
            e.sender.element.find('[id="FilterAngleWrapper"]').show();
            e.sender.element.find('.displayInfo').hide();
            e.sender.element.find('[id="FilterDisplayWrapper"]').hide();
        }
        else if (self.DisplayEnable && self.WidgetFilterDisplay && isDisplayParameterized) {
            e.sender.element.find('.angleInfo').hide();
            e.sender.element.find('[id="FilterAngleWrapper"]').hide();
            e.sender.element.find('.displayInfo').show();
            e.sender.element.find('[id="FilterDisplayWrapper"]').show();
        }

        self.SetNotifyLineVisibility();
    };
    self.SetNotifyLineVisibility = function () {
        // M4-10341: Ask at execution pop-up: show uncollapsed filterline
        if (self.WidgetFilterAngle) {
            var firstExecutionAngle = self.WidgetFilterAngle.Element.find('.FilterHeader .NoticeIcon:first');
            if (firstExecutionAngle.length) {
                firstExecutionAngle.parents('.FilterHeader').trigger('click');
            }
        }

        if (self.WidgetFilterDisplay) {
            var firstExecutionDisplay = self.WidgetFilterDisplay.Element.find('.FilterHeader .NoticeIcon:first');
            if (firstExecutionDisplay.length) {
                firstExecutionDisplay.parents('.FilterHeader').trigger('click');
            }
        }
    };
    self.CompleteExecutionParameterPopup = function (e) {
        setTimeout(function () {
            self.ShowPopupAfterCallback(e);

            e.sender.element.busyIndicator(false);
            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
        }, 100);
    };

    self.LoadMetadata = function () {
        return angleInfoModel.LoadMetadata(self.Angle, self.Display)
            .then(function () {
                var model = modelsHandler.GetModelByUri(self.ModelUri);
                if (model.current_instance)
                    return modelCurrentInstanceHandler.LoadCurrentModelInstance(model.current_instance, self.ModelUri);
                else
                    return jQuery.when();
            });
    };

    self.ToggleParameters = function (sender, isShowDisplay) {
        if (isShowDisplay) {
            sender.wrapper.find('.btnChangeAngleParameters').removeClass('alwaysHide');
            sender.wrapper.find('.btnChangeDisplayParameters').addClass('alwaysHide');

            sender.element.find('.angleInfo').hide();
            sender.element.find('[id="FilterAngleWrapper"]').hide();
            sender.element.find('.displayInfo').show();
            sender.element.find('[id="FilterDisplayWrapper"]').show();
        }
        else {
            sender.wrapper.find('.btnChangeAngleParameters').addClass('alwaysHide');
            sender.wrapper.find('.btnChangeDisplayParameters').removeClass('alwaysHide');

            sender.element.find('.angleInfo').show();
            sender.element.find('[id="FilterAngleWrapper"]').show();
            sender.element.find('.displayInfo').hide();
            sender.element.find('[id="FilterDisplayWrapper"]').hide();
        }
    };

    self.ExecutionParameters = function (e) {
        if (!e.sender.wrapper.find('.k-window-buttons .btn').hasClass('executing')) {
            var postOptions = self.GetExecutionParameters(_self.isSubmit);
            if (_self.isSubmit) {
                var isValidAngleQuery = !self.WidgetFilterAngle || validationHandler.CheckValidExecutionParameters(self.WidgetFilterAngle.Data(), self.ModelUri).IsAllValidArgument;
                var isValidDisplayQuery = !self.WidgetFilterDisplay || validationHandler.CheckValidExecutionParameters(self.WidgetFilterDisplay.Data(), self.ModelUri).IsAllValidArgument;
                if (!isValidAngleQuery || !isValidDisplayQuery) {
                    _self.isSubmit = false;
                    popup.Alert(Localization.Warning_Title, Localization.Info_PleaseSelectMissingValueForFilters);
                    e.preventDefault();
                    return false;
                }
                else {
                    self.SubmitExecutionParameters(postOptions);
                }
            }
            else {
                self.CancelExecutionParameters(postOptions);
            }

            setTimeout(function () {
                e.sender.destroy();
            }, 500);
        }
    };

    self.GetExecutionParameters = function (isSubmit) {
        requestHistoryModel.SaveLastExecute(self, self.ExecutionParameters, arguments);

        var postOptions = {};
        if (isSubmit) {
            if (self.AngleEnable && self.Angle) {
                postOptions.angleQuery = { execution_parameters: [] };
                jQuery.each(self.WidgetFilterAngle.Data(), function (index, angleQueryStep) {
                    if (angleQueryStep.step_type === enumHandlers.FILTERTYPE.FILTER && angleQueryStep.is_execution_parameter()) {
                        postOptions.angleQuery.execution_parameters.push({
                            step_type: angleQueryStep.step_type,
                            field: angleQueryStep.field,
                            arguments: angleQueryStep.arguments,
                            operator: angleQueryStep.operator,
                            execution_parameter_id: angleQueryStep.execution_parameter_id
                        });
                    }
                });

                if (!postOptions.angleQuery.execution_parameters.length) {
                    postOptions.angleQuery = null;
                }
            }

            if (self.DisplayEnable && self.Display) {
                postOptions.displayQuery = { execution_parameters: [] };
                jQuery.each(self.WidgetFilterDisplay.Data(), function (index, queryStep) {
                    if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER && queryStep.is_execution_parameter()) {
                        postOptions.displayQuery.execution_parameters.push({
                            step_type: queryStep.step_type,
                            field: queryStep.field,
                            arguments: queryStep.arguments,
                            operator: queryStep.operator,
                            execution_parameter_id: queryStep.execution_parameter_id
                        });
                    }
                });

                if (!postOptions.displayQuery.execution_parameters.length) {
                    postOptions.displayQuery = null;
                }
            }
        }
        

        return postOptions;
    };

    // override this method to do execution
    self.SubmitExecutionParameters = jQuery.noop;
    self.CancelExecutionParameters = jQuery.noop;

    /*EOF: Model Methods*/
}
