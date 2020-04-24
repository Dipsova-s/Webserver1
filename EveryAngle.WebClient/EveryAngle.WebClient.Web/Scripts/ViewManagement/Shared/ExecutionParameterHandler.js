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
    self.AngleEnable = true;
    self.DisplayEnable = true;
    self.ClickShowBaseClassInfoPopupString = 'return false';
    self.ShowPopupBeforeCallback = function () { return true; };
    self.ShowPopupAfterCallback = function () { return true; };

    _self.isSubmit = false;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.ShowExecutionParameterPopup = function () {
        _self.isSubmit = false;
        var popupSettings = {
            title: Localization.ExecutionPopupExecutionParameters,
            width: 600,
            minWidth: 500,
            height: 530,
            element: '#PopupExecutionParameter',
            html: executeParameterHtmlTemplate(),
            className: 'popup-execution-parameter',
            buttons: self.GetExecutionParameterButtons(),
            open: self.ShowExecutionParameterPopupCallback,
            close: self.ExecutionParameters
        };

        popup.Show(popupSettings);
    };
    self.ShowExecutionParameterPopupCallback = function (e) {
        e.sender.element.busyIndicator(true);
        e.sender.element.find('.k-loading-mask').addClass('k-loading-opaque');

        jQuery.when(self.ShowPopupBeforeCallback())
            .then(self.LoadMetadata)
            .done(function () {
                self.InitialAngleWidgets(e);

                self.WidgetFilterDisplay = null;
                if (self.DisplayEnable && self.Display) {
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
    self.InitialAngleWidgets = function (e) {
        // filters
        var queryDefinitionHandler = new QueryDefinitionHandler();
        queryDefinitionHandler.AllowExecutionParameter(false);
        queryDefinitionHandler.Authorizations.CanChangeFilter(true);
        queryDefinitionHandler.CanEditFilter = function (queryStep) {
            return queryStep.is_execution_parameter();
        };
        queryDefinitionHandler.CanSortFilter = function () {
            return false;
        };
        queryDefinitionHandler.CanMoveFilter = function () {
            return false;
        };
        queryDefinitionHandler.SetData(self.Angle.query_definition, 'query_definition', self.Angle.model);
        queryDefinitionHandler.ApplyHandler(e.sender.element.find('.section-angle'), '.col-angle-definition');
        self.WidgetFilterAngle = queryDefinitionHandler;

        // objects
        self.SetAngleClassesHtml(e.sender.element.find('.col-angle-object'), self.WidgetFilterAngle.GetBaseClasses());
    };
    self.SetAngleClassesHtml = function (target, classes) {
        var format = classes.length > 1 ? enumHandlers.FRIENDLYNAMEMODE.SHORTNAME : enumHandlers.FRIENDLYNAMEMODE.LONGNAME;
        target.empty();
        jQuery.each(classes, function (index, id) {
            var className = modelClassesHandler.GetClassName(id, self.Angle.model, format);
            var info = jQuery('<a class="icon icon-info btn-info" />').on('click', jQuery.proxy(self.ShowBaseClassInfo, self, id));
            var item = jQuery('<span/>').append(className).append(info);
            target.append(item);
        });
    };
    self.ShowBaseClassInfo = function (id) {
        helpTextHandler.ShowHelpTextPopup(id, helpTextHandler.HELPTYPE.CLASS, self.Angle.model);
    };
    self.InitialDisplayWidgets = function (e) {
        // filters
        var queryDefinitionHandler = new QueryDefinitionHandler();
        queryDefinitionHandler.Parent(self.WidgetFilterAngle);
        queryDefinitionHandler.AllowExecutionParameter(false);
        queryDefinitionHandler.Authorizations.CanChangeFilter(true);
        queryDefinitionHandler.CanEditFilter = function (queryStep) {
            return queryStep.is_execution_parameter();
        };
        queryDefinitionHandler.CanSortFilter = function () {
            return false;
        };
        queryDefinitionHandler.CanMoveFilter = function () {
            return false;
        };
        queryDefinitionHandler.SetData(self.Display.query_blocks, 'query_blocks', self.Angle.model);
        queryDefinitionHandler.ApplyHandler(e.sender.element.find('.section-display'), '.col-display-definition');
        self.WidgetFilterDisplay = queryDefinitionHandler;

        // set display name
        e.sender.element.find('.col-display-name').text(self.GetDisplayName());
    };
    self.GetDisplayName = function () {
        return self.Display.name || WC.Utility.GetDefaultMultiLangText(self.Display.multi_lang_name);
    };
    self.SetElementVisibility = function (e) {
        var isAngleParameterized = self.Angle && self.Angle.is_parameterized;
        var isDisplayParameterized = self.Display && self.Display.is_parameterized;
        if (self.AngleEnable && isAngleParameterized && isDisplayParameterized) {
            self.ToggleParameters(e.sender, false);
        }
        else if (self.AngleEnable && self.WidgetFilterAngle && isAngleParameterized) {
            self.ShowAngleSection(e.sender.element);
        }
        else if (self.DisplayEnable && self.WidgetFilterDisplay && isDisplayParameterized) {
            self.ShowDisplaySection(e.sender.element);
        }
        self.SetNotifyLineVisibility();
    };
    self.ShowAngleSection = function (container) {
        container.find('.section-angle').show();
        container.find('.section-display').hide();
        kendo.resize(container);
    };
    self.ShowDisplaySection = function (container) {
        container.find('.section-angle').hide();
        container.find('.section-display').show();
        kendo.resize(container);
    };
    self.SetNotifyLineVisibility = function () {
        // M4-10341: Ask at execution pop-up: show uncollapsed filterline
        self.EditFirstFilter(self.WidgetFilterAngle);
        self.EditFirstFilter(self.WidgetFilterDisplay);
    };
    self.EditFirstFilter = function (handler) {
        if (!handler)
            return;

        var executionParameters = handler.GetFilters().findObjects('is_execution_parameter', function (parameter) { return parameter(); });
        if (executionParameters.length)
            handler.EditFilter(executionParameters[0]);
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
                var model = modelsHandler.GetModelByUri(self.Angle.model);
                if (model.current_instance)
                    return modelCurrentInstanceHandler.LoadCurrentModelInstance(model.current_instance, self.Angle.model);
                else
                    return jQuery.when();
            });
    };
    self.ToggleParameters = function (sender, isShowDisplay) {
        if (isShowDisplay) {
            sender.wrapper.find('.btnChangeAngleParameters').removeClass('alwaysHide');
            sender.wrapper.find('.btnChangeDisplayParameters').addClass('alwaysHide');
            self.ShowDisplaySection(sender.element);
        }
        else {
            sender.wrapper.find('.btnChangeAngleParameters').addClass('alwaysHide');
            sender.wrapper.find('.btnChangeDisplayParameters').removeClass('alwaysHide');
            self.ShowAngleSection(sender.element);
        }
    };

    self.ExecutionParameters = function (e) {
        if (e.sender.wrapper.find('.k-window-buttons .btn').hasClass('executing'))
            return;

        var postOptions = self.GetExecutionParameters(_self.isSubmit);
        if (_self.isSubmit) {
            var isValidAngleQuery = !self.WidgetFilterAngle || validationHandler.CheckValidExecutionParameters(self.WidgetFilterAngle.GetFilters(), self.Angle.model).IsAllValidArgument;
            var isValidDisplayQuery = !self.WidgetFilterDisplay || validationHandler.CheckValidExecutionParameters(self.WidgetFilterDisplay.GetFilters(), self.Angle.model).IsAllValidArgument;
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
    };

    self.GetExecutionParameters = function (isSubmit) {
        var postOptions = {};
        if (isSubmit) {
            if (self.AngleEnable && self.Angle) {
                postOptions.angleQuery = {
                    execution_parameters: ko.toJS(self.WidgetFilterAngle.GetExecutionParameters())
                };
                if (!postOptions.angleQuery.execution_parameters.length) {
                    postOptions.angleQuery = null;
                }
            }

            if (self.DisplayEnable && self.Display) {
                postOptions.displayQuery = {
                    execution_parameters: ko.toJS(self.WidgetFilterDisplay.GetExecutionParameters())
                };
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
