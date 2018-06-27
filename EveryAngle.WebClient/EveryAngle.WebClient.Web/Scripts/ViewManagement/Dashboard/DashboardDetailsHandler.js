var dashboardDetailsHandler = new DashboardDetailsHandler();

function DashboardDetailsHandler() {
    "use strict";

    /*BOF: Model Properties*/
    var self = this;
    self.Model = new DashboardViewModel();
    self.IsReady = false;
    self.HandlerInfoDetails = null;
    self.HandlerLanguages = null;
    self.HandlerLanguagesSaveAs = null;
    self.HandlerLabels = null;
    self.HandlerFilter = null;
    self.ID = 'DashboardDetails';
    self.IsSubmit = false;
    self.TAB = {
        GENERAL: 'general',
        DESCRIPTION: 'description',
        DEFINITION: 'definition',
        FIELDSFILTERS: 'fieldsfilters',
        PUBLISHING: 'publishing',
        STATISTIC: 'statistic'
    };
    self.PopupSettings = {
        SelectedTab: null,
        DefinitionIndex: null
    };
    self.Languages = {
        Selected: ko.observable({}),
        List: ko.observableArray([])
    };
    self.Definitions = ko.observableArray([]);
    self.PublishingModel = {
        bp_text: ko.observable(''),
        language_text: ko.observable(''),
        privilege_label_text: ko.observable(''),
        search_label_text: ko.observable(''),
        public_displays: ko.observableArray([]),
        private_displays: ko.observableArray([])
    };
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.ShowPopup = function (selectedTab, definitionIndex) {
        requestHistoryModel.SaveLastExecute(self, self.ShowPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        self.PopupSettings.SelectedTab = selectedTab || self.TAB.GENERAL;
        self.PopupSettings.DefinitionIndex = definitionIndex;
        self.IsSubmit = false;

        // initial model
        if (dashboardModel.Data()) {
            self.Model.Angles = dashboardModel.Angles.slice(0);
        }

        var popupSettings = {
            element: '#popup' + self.ID,
            title: Localization.DashboardDetails,
            html: dashboardDetailBodyHtmlTemplate(),
			className: 'popup' + self.ID + ' popupWithTabMenu',
            width: 880,
            minWidth: 748,
            minHeight: 300,
            buttons: self.GetDashboardDetailButtons(),
            resize: self.DashboardDetailsPopupResize,
            open: self.ShowPopupCallback,
            close: self.DashboardDetailsPopupClose
        };

        // set buttons
        var btnSave = popupSettings.buttons.findObject('text', Localization.Save);
        var btnSaveAs = popupSettings.buttons.findObject('text', Localization.SaveAsDashboard);
        var availableModels = modelsHandler.GetAvailabelModels();
        if (!availableModels.length) {
            btnSaveAs.className = 'disabled';
            btnSave.className = 'disabled';
        }
        if (dashboardModel.IsTemporaryDashboard()) {
            btnSaveAs.className = 'alwaysHide';
        } else if (!privilegesViewModel.IsAllowExecuteDashboard())
            btnSaveAs.className = 'disabled';

        self.PopupElement = popup.Show(popupSettings);
        return self.PopupElement;
    };
    self.GetDashboardDetailButtons = function () {
        return [
            {
                text: Captions.Button_Cancel,
                position: 'right',
                click: 'close'
            },
            {
                text: Localization.SaveAsDashboard,
                position: 'right',
                isPrimary: true,
                className: 'executing',
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj) && self.CheckValidation()) {
                        self.IsSubmit = true;
                        self.ShowSaveAsPopup();
                    }
                }
            },
            {
                text: Localization.Save,
                position: 'right',
                isPrimary: true,
                className: 'executing',
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj) && self.CheckValidation()) {
                        self.IsSubmit = true;
                        self.SaveDashboard();
                    }
                }
            }
        ];
    };
    self.DashboardDetailsPopupResize = function (e) {
        var winWidth = e.sender.element.width(),
            winHeight = e.sender.element.height();

        var definitionList = e.sender.wrapper.find('.definitionArea .definitionList');
        var fieldsfiltersList = e.sender.wrapper.find('.fieldsfiltersArea .definitionList');

        var businessProcessBar = jQuery('#DashboardArea .businessProcesses');
        businessProcessBar.css('max-width', jQuery('#DashboardArea').width() - 180);
        if (businessProcessesModel.General) {
            businessProcessesModel.General.UpdateLayout(businessProcessBar);
        }

        e.sender.wrapper.find('.detailName').css('max-width', winWidth - 360);

        if (self.HandlerLanguages) {
            var editor = self.HandlerLanguages.EditorDescription;
            if (editor && editor.wrapper.is(':visible')) {
                editor.wrapper.find('.k-editable-area').height('100%');
                var otherAreasize = 15;
                var editorHeight = winHeight - (editor.wrapper.offset().top - e.sender.element.offset().top) - otherAreasize;
                self.HandlerLanguages.SetEditorHeight(editorHeight);
            }
        }

        if (self.HandlerFilter) {
            self.HandlerFilter.View.AdjustLayout();
        }

        if (definitionList.is(':visible')) {
            definitionList.css('max-height', winHeight - (definitionList.offset().top - e.sender.element.offset().top) - 5);
            self.DefinitionAdjustLayout();
        }

        if (fieldsfiltersList.is(':visible')) {
            var height = winHeight - (fieldsfiltersList.offset().top - e.sender.element.offset().top) - 125;
            fieldsfiltersList.parent().height(height + 72);
            fieldsfiltersList.css('max-height', height + 70);
        }

    };
    self.DashboardDetailsPopupClose = function (e) {
        if (!self.IsSubmit) {
            self.ResetDetails();
        }

        setTimeout(function () {
            self.HandlerFilter = null;
            e.sender.destroy();
        }, 200);
    };
    self.ShowPopupCallback = function (e) {
        var win = e.sender;
        var selectTab = self.PopupSettings.SelectedTab;
        self.PopupElement = win;

        win.element.css('overflow', 'hidden').busyIndicator(true);
        win.element.find('.popupTabMenu, .popupTabPanel').css('visibility', 'hidden');

        // title bar
        win.wrapper.find('.k-window-titlebar .dashboardInformation').remove();
        win.wrapper.find('.k-window-title').after(WC.WidgetDetailsView.TemplateDashboardInfoPopupHeader);

        // bring window to front
        win.toFront();

        var deferred = [];
        deferred.pushDeferred(businessProcessesModel.General.Load);
        deferred.pushDeferred(systemLanguageHandler.LoadLanguages);
        deferred.pushDeferred(modelsHandler.LoadModelsInfo);

        jQuery.whenAll(deferred).done(function () {
            var checkDashboardIsReady = setInterval(function () {
                if (self.IsReady && self.Model.Data()) {
                    clearInterval(checkDashboardIsReady);
                    self.OnDashboardDetailPopupIsReady(win, selectTab);
                }
            }, 100);
        });
    };
    self.OnDashboardDetailPopupIsReady = function (win, selectTab) {
        // set name size
        win.wrapper.find('.detailName').css('max-width', win.element.width() - 360);

        self.InitializeGeneralTab();
        self.InitializeDescriptionTab();
        self.InitializeDefinitionTab();
        self.InitializeFieldsAndFiltersTab();
        self.InitializePublishingTab();

        // bind ko
        WC.HtmlHelper.ApplyKnockout(self, win.wrapper);

        self.InitializeDefaultTab(win, selectTab);
    };

    self.InitializeGeneralTab = function () {
        self.InitializeModelLabel();
        self.InitializeBusinessProcesses();
    };
    self.InitializeDescriptionTab = function () {
        self.InitialLanguages();
    };
    self.InitializeDefinitionTab = function () {
        self.PrepareDefinitions();
    };
    self.InitializeFieldsAndFiltersTab = function () {
        self.PrepareFieldsFilters();
    };
    self.InitializePublishingTab = function () {
        self.InitializeLabels();
    };
    self.InitializeDefaultTab = function (win, selectTab) {
        setTimeout(function () {
            // set focus tab
            self.TabClick(selectTab, self.PopupSettings.DefinitionIndex);

            win.element.css('overflow', '').busyIndicator(false);
            win.element.find('.popupTabMenu, .popupTabPanel').css('visibility', '');

            win.wrapper.find('.k-window-buttons .btn').removeClass('executing');
        }, 500);
    };

    self.GetDefaultModel = function (availableModels) {
        if (!self.Model.Data().model) {
            if (availableModels.length === 1)
                return availableModels[0].uri;
            else if (self.Model.GetModels().length === 1) {
                return self.Model.Angles[0].model;
            }
        }
        return self.Model.Data().model;
    };
    self.ChangedSystemModel = function (e) {
        self.Model.Data().model = e.sender.value();
        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.Model.Data().model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.General, modelPrivileges);
    };
    self.ClosePopup = function () {
        popup.Close('#popup' + self.ID);
    };
    self.SetValidate = function (data, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            self.Model.Data().is_validated(!self.Model.Data().is_validated());
        }
    };
    self.ShowInfoPopup = function () {
        var popupName = 'DashboardInfo',
            popupSettings = {
                element: '#popup' + popupName,
                title: Localization.DashboardDetails,
                appendTo: 'body',
                className: 'popup' + popupName,
                buttons: [
                    {
                        text: Localization.Ok,
                        position: 'right',
                        isPrimary: true,
                        click: 'close'
                    }
                ],
                animation: false,
                resize: function (e) {
                    var winWidth = e.sender.element.width();
                    e.sender.wrapper.find('.k-window-titlebar .Name').css('max-width', winWidth - 360);

                    if (self.HandlerInfoDetails) {
                        self.HandlerInfoDetails.AdjustLayout();
                    }
                },
                open: function (e) {
                    var descriptionData = self.Model.Data().description();
                    self.HandlerInfoDetails = new WidgetDetailsHandler(e.sender.element, descriptionData, [], []);
                    self.HandlerInfoDetails.ModelUri = self.Model.Data().model;
                    self.HandlerInfoDetails.IsVisibleModelRoles(false);
                    self.HandlerInfoDetails.ApplyHandler();
                    self.HandlerInfoDetails.AdjustLayout();
                    self.HandlerInfoDetails.IsVisibleDefinition(false);

                    e.sender.wrapper.find('.k-window-title').after(WC.WidgetDetailsView.TemplateDashboardInfoPopupHeader);
                    WC.HtmlHelper.ApplyKnockout(self, e.sender.wrapper);
                },
                close: popup.Destroy
            };

        popup.Show(popupSettings);
    };
    self.ShowSaveAsPopup = function (isQuickSave, appendCopytext) {
        if (typeof isQuickSave === 'undefined')
            isQuickSave = false;
        if (typeof appendCopytext === 'undefined')
            appendCopytext = true;

        requestHistoryModel.SaveLastExecute(self, self.ShowSaveAsPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var popupName = 'SaveAs';
        var popupSettings = {
            element: '#popup' + popupName,
            title: Localization.SaveAsDashboard,
            className: 'popup' + popupName,
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    position: 'right',
                    click: 'close'
                },
                {
                    text: Localization.Ok,
                    position: 'right',
                    isPrimary: true,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            if (self.CheckSaveAsValidation()) {
                                self.SaveAsDashboard(isQuickSave);
                                e.kendoWindow.close();
                            }
                        }
                    }
                }
            ],
            resizable: false,
            actions: ["Close"],
            open: function (e) {
                var deferred = [systemLanguageHandler.LoadLanguages()];
                jQuery.whenAll(deferred)
                    .done(function () {
                        // collect data
                        var multiLangNames = [];
                        var multiLangDescriptions = [];
                        if (isQuickSave) {
                            jQuery.each(self.Model.Data().multi_lang_name(), function (index, name) {
                                multiLangNames.push({
                                    text: appendCopytext ? name.text.substr(0, 248) + ' (copy)' : name.text.substr(0, 255),
                                    lang: name.lang
                                });

                                var description = self.Model.Data().multi_lang_description().findObject('lang', name.lang);
                                if (!description) {
                                    multiLangDescriptions.push({
                                        text: '',
                                        lang: name.lang
                                    });
                                }
                                else {
                                    multiLangDescriptions.push({
                                        text: description.text,
                                        lang: description.lang
                                    });
                                }
                            });
                        }
                        else {
                            var baseLanguages = ko.toJS(self.HandlerLanguages.Languages.List);
                            jQuery.each(baseLanguages, function (index, lang) {
                                if (lang.is_selected || (!lang.is_selected && lang.language_name)) {
                                    multiLangNames.push({
                                        text: appendCopytext ? lang.language_name.substr(0, 248) + ' (copy)' : lang.language_name.substr(0, 255),
                                        lang: lang.id
                                    });
                                    multiLangDescriptions.push({
                                        text: lang.language_description,
                                        lang: lang.id
                                    });
                                }
                            });
                        }

                        // bind template & knockout
                        self.HandlerLanguagesSaveAs = new WidgetLanguagesHandler('#popupSaveAs', multiLangNames, multiLangDescriptions);
                        self.HandlerLanguagesSaveAs.ShowDescription(false);
                        self.HandlerLanguagesSaveAs.Labels.LabelLanguageName = Localization.DashboardName;
                        self.HandlerLanguagesSaveAs.ApplyHandler();

                        if (!isQuickSave) {
                            jQuery.each(self.HandlerLanguagesSaveAs.Languages.List(), function (index, lang) {
                                lang.is_selected(baseLanguages[index].is_selected);
                            });
                        }

                        e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                    });
            },
            close: function (e) {
                setTimeout(function () {
                    e.sender.destroy();
                }, 500);
            }
        };

        popup.Show(popupSettings);
    };
    self.CloseSaveAsPopup = function () {
        popup.Close('#popup' + self.ID + 'SaveAs');
    };
    self.CheckValidation = function (checkRequiredLabels) {
        if (typeof checkRequiredLabels === 'undefined')
            checkRequiredLabels = self.Model.Data().is_published();

        // languages
        var emptyLanguages = jQuery.grep(self.HandlerLanguages.Languages.List(), function (lang) { return lang.is_selected() && !lang.language_name(); });
        if (emptyLanguages.length) {
            self.TabClick(self.TAB.DESCRIPTION);
            self.HandlerLanguages.LanguageSetSelect(emptyLanguages[0]);
            self.HandlerLanguages.ElementName.addClass('k-invalid');

            return false;
        }

        // model
        if (!self.Model.Data().model) {
            popup.Alert(Localization.Warning_Title, Localization.Info_RequiredModel);
            self.TabClick(self.TAB.GENERAL);

            return false;

        }

        // bp
        if (businessProcessesModel.General.GetActive().length === 0) {
            popup.Alert(Localization.Warning_Title, Localization.Info_RequiredBusinessProcessForAngle);
            self.TabClick(self.TAB.GENERAL);

            return false;
        }

        // dashboard id
        if (/^[a-z,_](\w*)$/i.test(self.Model.Data().id()) === false) {
            popup.Alert(Localization.Warning_Title, Localization.Info_InvalidDashboardId);
            self.TabClick(self.TAB.GENERAL);

            return false;
        }

        // fields & filterd
        if (self.HandlerFilter) {
            var checkValidArgument = validationHandler.CheckValidExecutionParameters(self.HandlerFilter.GetData(), self.HandlerFilter.ModelUri);
            if (!checkValidArgument.IsAllValidArgument) {
                popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
                self.TabClick(self.TAB.FIELDSFILTERS);

                return false;
            }
        }

        // check validate
        if (self.Model.Data().is_validated() && self.Model.Data().is_validated() !== dashboardModel.Data().is_validated()) {
            var validatedAngleCount = 0, angle;
            jQuery.each(self.Model.Data().widget_definitions, function (index, widget) {
                angle = widget.GetAngle();
                if (angle && angle.is_validated) {
                    validatedAngleCount++;
                }
            });
            if (validatedAngleCount !== self.Model.Data().widget_definitions.length) {
                popup.Alert(Localization.Warning_Title, Localization.Info_RequiredValidatedBeforePublishDashboard);
                self.Model.Data().is_validated(!self.Model.Data().is_validated());
                self.TabClick(self.TAB.PUBLISHING);

                return false;
            }
        }

        // Check required labels
        if (checkRequiredLabels && systemSettingHandler.GetMinLabelCategoryToPublish() > 0) {
            var validationResults = self.HandlerLabels.GetValidationResults();
            var requiredLabelNames = [];
            var tabPublishTarget = null;
         
            // check privilege labels
            jQuery.each(validationResults[self.HandlerLabels.LABELTYPE.PRIVILEGE].UnassignedCategories, function (index, categoryName) {
                tabPublishTarget = self.HandlerLabels.LABELTYPE.PRIVILEGE;
                requiredLabelNames.push('<li>' + categoryName + '</li>');
            });

            // check search labels
            jQuery.each(validationResults[self.HandlerLabels.LABELTYPE.SEARCH].UnassignedCategories, function (index, categoryName) {
                if (!tabPublishTarget) {
                    tabPublishTarget = self.HandlerLabels.LABELTYPE.SEARCH;
                }
                requiredLabelNames.push('<li>' + categoryName + '</li>');
            });

            if (requiredLabelNames.length) {
                popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_RequiredAtleastOneLabelBeforePublishDashboard, requiredLabelNames.join('')));
                self.TabClick(self.TAB.PUBLISHING);
                self.HandlerLabels.TabActiveIndex(tabPublishTarget);

                return false;
            }
        }

        return true;
    };
    self.CheckSaveAsValidation = function () {
        var emptyLanguages = jQuery.grep(self.HandlerLanguagesSaveAs.Languages.List(), function (lang) { return lang.is_selected() && !lang.language_name(); });
        if (emptyLanguages.length) {
            self.HandlerLanguagesSaveAs.LanguageSetSelect(emptyLanguages[0]);
            self.HandlerLanguagesSaveAs.ElementName.addClass('k-invalid');

            return false;
        }

        return true;
    };
    self.CheckValidBeforePublished = function () {
        var data = self.Model.GetData();
        var originalData = dashboardModel.GetData();

        jQuery.each(data, function (key, value) {
            if (jQuery.deepCompare(value, originalData[key], true, key !== 'widget_definitions')) {
                delete data[key];
            }
        });

        // don't compare layout object, because it's not equal default layout object anymore after dashboard filter panel has release
        delete data.layout;

        if (!jQuery.isEmptyObject(data)) {
            popup.Alert(Localization.Warning_Title, Localization.MessageSaveRequiredPublishDashboard);
            return false;
        }

        //Check minimum valid widget
        var numberOfValidWidgets = 0;
        var numberOfPrivateDisplay = 0;
        jQuery.each(self.Model.Data().widget_definitions, function (index, display) {
            var display = self.Model.Data().widget_definitions[index].GetDisplay();
            var angle = self.Model.Data().widget_definitions[index].GetAngle();

            if (!display.is_public) {
                numberOfPrivateDisplay++;
            }

            /*Changed to use the same function of M4-11190*/
            if (dashboardHandler.CheckInvalidAngleAndDisplay(angle, display).Valid) {
                numberOfValidWidgets++;
            }
        });

        if (numberOfPrivateDisplay) {
            popup.Alert(Localization.Warning_Title, Localization.Info_CannotPublishedDashboardBecausePrivateAngleDisplay);
            popup.OnCloseCallback = function () {
                self.TabClick(self.TAB.DEFINITION);
            };
            return false;
        }

        if (!numberOfValidWidgets) {
            popup.Alert(Localization.Warning_Title, Localization.Info_RequiredValidAtleastOneDisplays);
            return false;
        }

        // Check labels
        var validationResults = self.HandlerLabels.GetValidationResults();
        var requiredLabelNames = [];
        var tabPublishTarget = null;
        // check privilege labels
        jQuery.each(validationResults[self.HandlerLabels.LABELTYPE.PRIVILEGE].UnassignedCategories, function (index, categoryName) {
            tabPublishTarget = self.HandlerLabels.LABELTYPE.PRIVILEGE;
            requiredLabelNames.push('<li>' + categoryName + '</li>');
        });

        // check search labels
        jQuery.each(validationResults[self.HandlerLabels.LABELTYPE.SEARCH].UnassignedCategories, function (index, categoryName) {
            if (!tabPublishTarget) {
                tabPublishTarget = self.HandlerLabels.LABELTYPE.SEARCH;
            }
            requiredLabelNames.push('<li>' + categoryName + '</li>');
        });

        if (requiredLabelNames.length) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_RequiredAtleastOneLabelBeforePublishDashboard, requiredLabelNames.join('')));
            self.HandlerLabels.TabActiveIndex(tabPublishTarget);

            return false;
        }

        // M4-32183 business process + assigned privilege labels should be equal or greater than minimum label categories setting in MC
        if (!validationResults.CheckPrivilegeLabelCategories()) {
            var minLabelCategories = systemSettingHandler.GetMinLabelCategoryToPublish();
            var description = kendo.format(Localization.Info_RequiredAtLeastOneLabelBeforePublish, minLabelCategories);
            popup.Alert(Localization.Warning_Title, description);

            return false;
        }

        var unAuthorizationLabels = jQuery.merge(validationResults[self.HandlerLabels.LABELTYPE.PRIVILEGE].UnauthorizedLabels, validationResults[self.HandlerLabels.LABELTYPE.SEARCH].UnauthorizedLabels);
        if (unAuthorizationLabels.length) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_NotAllowedToPublishTheAngle, unAuthorizationLabels.join(', '), self.Model.GetModel()));

            return false;
        }

        return true;
    };
    self.TabClick = function (tab, definitionIndex) {
        if (!self.PopupElement) {
            return;
        }
        var win = self.PopupElement;

        win.element.find('.popupTabMenu li, .popupTabPanel > div').removeClass('Selected')
            .filter('.' + tab + ', .' + tab + 'Area').addClass('Selected');

        switch (tab) {
            case self.TAB.DESCRIPTION:
                win.trigger('resize');
                setTimeout(function () {
                    if (self.HandlerLanguages) {
                        self.HandlerLanguages.RefreshEditor();
                    }
                }, 10);
                break;

            case self.TAB.FIELDSFILTERS:
                win.trigger('resize');
                break;

            case self.TAB.DEFINITION:
                if (typeof definitionIndex !== 'undefined') {
                    jQuery('#FilterWrapper .FilterHeader').eq(definitionIndex).trigger('click');
                }
                win.trigger('resize');
                break;

            case self.TAB.PUBLISHING:
                win.trigger('resize');
                self.HandlerLabels.ApplyHandler(self.Model.Data().model, self.Model.Data().is_published());
                break;

            default:
                break;
        }

        self.PopupSettings.SelectedTab = tab;
    };
    self.ResetDetails = function () {
        var defaultData = dashboardModel.GetData();
        if (self.Model.Data() != null && self.Model.Data().layout) {
            defaultData.layout = JSON.stringify(self.Model.Data().layout);
            self.Model.SetData(defaultData);
        }
    };

    // general
    self.InitializeModelLabel = function () {
        var availableModels = WC.Utility.ToArray(ko.toJS(modelsHandler.GetData()));

        if (!availableModels.length) {
            availableModels = [{ id: '', uri: '', short_name: Localization.NoModelAvaliable, available: true }];
        }
        else {
            availableModels.removeObject('model_status', Localization.ModelLabel_NoModelServer);
        }
        jQuery.each(availableModels, function (index, model) {
            if (!model.available) {
                model.short_name += Localization.ModelLabel_Down;
            }
        });

        self.Model.Data().model = self.GetDefaultModel(availableModels);

        if (availableModels.length > 1)
            availableModels.unshift({ short_name: Localization.PleaseSelect, uri: null });

        var isTempDashboard = dashboardModel.IsTemporaryDashboard();
        if (isTempDashboard) {
            WC.HtmlHelper.DropdownList('#SystemModels', availableModels, {
                dataTextField: 'short_name',
                dataValueField: 'uri',
                value: self.Model.Data().model,
                enable: !self.Model.Data().is_validated(),
                change: self.ChangedSystemModel
            });
        }
        else {
            jQuery('#SystemModels').html(dashboardModel.GetModel());
        }
    };
    self.InitializeBusinessProcesses = function () {
        if (!dashboardModel.CanUpdateDashboard('assigned_labels_bp')) {
            businessProcessesModel.General.ReadOnly(true);
        }
        else {
            businessProcessesModel.General.ReadOnly(false);
        }

        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.Model.Data().model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.General, modelPrivileges, dashboardModel.Data().is_published());
        businessProcessesModel.General.MultipleActive(true);
        businessProcessesModel.General.CanEmpty(false);
        businessProcessesModel.General.ClickCallback(function (data, event, changed) {
            self.Model.Data().assigned_labels = self.HandlerLabels.GetAssignedLabels();
        });
        businessProcessesModel.General.ClickHeaderCallback(function (data, event, changed) {
            self.Model.Data().assigned_labels = self.HandlerLabels.GetAssignedLabels();
        });
        var activeBusinessProcessBars = {};
        jQuery.each(self.Model.Data().assigned_labels, function (index, label) {
            var businessProcessData = jQuery.grep(businessProcessesModel.General.Data(), function (businessProcess) { return businessProcess.id.toLowerCase() === label.toLowerCase() });
            if (businessProcessData.length && businessProcessData[0].is_allowed !== false) {
                activeBusinessProcessBars[label] = true;
            }
        });
        businessProcessesModel.General.CurrentActive(activeBusinessProcessBars);
        businessProcessesModel.General.ApplyHandler('#DashboardBusinessProcesses');
    };

    // description
    self.InitialLanguages = function () {
        // languages
        var dashboardData = ko.toJS(self.Model.Data());
        self.TabClick(self.TAB.DESCRIPTION);
        self.HandlerLanguages = new WidgetLanguagesHandler('#popupDashboardDetails .descriptionArea', dashboardData.multi_lang_name, dashboardData.multi_lang_description);
        self.HandlerLanguages.AutoUpdateToModel(true);
        self.HandlerLanguages.Model = self.Model.Data();
        self.HandlerLanguages.Labels.LabelLanguageName = Localization.DashboardName;
        self.HandlerLanguages.CanChangeLanguage = function () {
            return dashboardModel.CanUpdateDashboard('name');
        };
        self.HandlerLanguages.ApplyHandler();
    };

    // fields & filters
    self.PrepareFieldsFilters = function () {
        var dashboardFilters = self.Model.GetDashboardFilters(WidgetFilterModel);
        self.HandlerFilter = new WidgetFilterHandler(jQuery('#FieldsFiltersWrapper'), []);
        self.HandlerFilter.ModelUri = self.Model.Data().model;
        self.HandlerFilter.Data(dashboardFilters);
        self.HandlerFilter.Sortable(false);
        self.HandlerFilter.HasExecutionParameter(false);
        self.HandlerFilter.FilterFor = self.HandlerFilter.FILTERFOR.DASHBOARD;
        self.HandlerFilter.CanChange = function () {
            return !dashboardModel.IsTemporaryDashboard() && self.Model.CanUpdateDashboard('query_difinitions');
        };
        self.HandlerFilter.CanRemove = function () {
            return !dashboardModel.IsTemporaryDashboard() && self.Model.CanUpdateDashboard('query_difinitions');
        };
        self.HandlerFilter.ShowAddFilterPopup = self.ShowAddFilterPopup;
        self.HandlerFilter.SetTreeViewMode();
        self.HandlerFilter.ApplyHandler();
    };
    self.ShowAddFilterPopup = function () {
        // do nothing if disabled
        if (jQuery(event.currentTarget).hasClass('disabled'))
            return;

        // cannot add filter on unsaved dashboard
        if (dashboardModel.IsTemporaryDashboard()) {
            popup.Alert(Localization.Warning_Title, 'Dashboard need to be saved first');
            return;
        }

        // initial field chooser
        fieldsChooserHandler.ModelUri = self.HandlerFilter.ModelUri;
        fieldsChooserHandler.AngleClasses = [];
        fieldsChooserHandler.AngleSteps = [];
        fieldsChooserHandler.DisplaySteps = self.HandlerFilter.GetData();
        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDDASHBOARDFILTER, enumHandlers.ANGLEPOPUPTYPE.DASHBOARD, self.HandlerFilter);
    };

    // publishing
    self.InitializeLabels = function () {
        self.HandlerLabels = new WidgetLabelsHandler('#PublishTabWrapper', self.Model.Data().assigned_labels, businessProcessesModel.General);
        self.HandlerLabels.Captions.TabPrivilegeName(Localization.DashboardDetailPublishTabDashboardPrivileges);
        if (!dashboardModel.CanUpdateDashboard(EA_CONSTANTS.dashboard.assignedLabels)) {
            self.HandlerLabels.TabEnabledIndexes.removeAll();
        }
        self.HandlerLabels.OnLabelChanged = function (currentLabels) {
            self.Model.Data().assigned_labels = currentLabels;
        };
    };

    // definitions
    self.PrepareDefinitions = function () {
        self.Definitions.removeAll();

        jQuery.each(self.Model.Data().layout.widgets, function (index, widgetId) {
            var widget = self.Model.GetWidgetById(widgetId);
            if (widget) {
                var angle = widget.GetAngle();
                var selectedDisplay;
                self.Definitions.push({
                    id: widgetId,
                    selected: ko.observable("{}"),
                    displays: ko.observableArray([]),
                    widget_name: ko.observable(''),
                    default_name: widget.name(),
                    is_readonly: dashboardModel.CanUpdateDashboard('widget_definitions'),
                    angle_name: '',
                    lock_default_name: false
                });
                var widgetDefinition = self.Definitions()[self.Definitions().length - 1];

                if (angle) {
                    var displayData = self.DefinitionsGetDisplays(angle, widget);

                    widgetDefinition.displays(displayData.displays);
                    widgetDefinition.angle_name = self.DefinitionGetAngleName(angle);

                    selectedDisplay = displayData.selected;
                }
                else {
                    selectedDisplay = { widget_id: widgetId, name_html: '', id: '', name: widgetId, type: 'notExists', link: '' };
                }

                // subscribe changing
                var nameSubscribe = widgetDefinition.widget_name.subscribe(function (newValue) {
                    newValue = jQuery.trim(newValue);
                    var model = JSON.parse(this.selected());

                    if (!this.lock_default_name) {
                        this.default_name = newValue;
                        self.DefinitionUpdateWidgetName(this.id, newValue);
                    }

                    if (!newValue) {
                        nameSubscribe.pause();
                        this.widget_name(self.DefinitionGetWidgetName(model, this.default_name));
                        nameSubscribe.resume();
                    }
                }, widgetDefinition);
                widgetDefinition.selected.subscribe(function (newValue) {
                    this.lock_default_name = true;
                    var model = JSON.parse(newValue);
                    if (model.id) {
                        self.DefinitionChangeWidget(JSON.parse(newValue), true);
                    }
                    this.lock_default_name = false;
                }, widgetDefinition);

                // assign selecting display
                widgetDefinition.selected(ko.toJSON(selectedDisplay));
            }
        });
    };
    self.DefinitionsGetDisplays = function (angle, widget) {
        var displays = [];
        var selectedDisplay = {};

        jQuery.each(angle.display_definitions, function (displayIndex, displayObject) {
            var hasJump = WC.ModelHelper.HasFollowup(displayObject.query_blocks);
            var hasFilter = WC.ModelHelper.HasFilter(displayObject.query_blocks);
            var link = self.DefinitionGetLink(angle, displayObject);
            var displayValidation = validationHandler.GetDisplayValidation(displayObject, angle.model);
            var isError = displayValidation.Level === validationHandler.VALIDATIONLEVEL.ERROR;
            var isWarning = displayValidation.Level === validationHandler.VALIDATIONLEVEL.WARNING;

            var display = widget.display || widget.widget_details.display;
            displays[displayIndex] = {
                widget_id: widget.id,
                id: displayObject.id,
                uri: displayObject.uri,
                name: displayObject.name,
                type: displayObject.display_type,
                is_public: displayObject.is_public,
                full_name: DashboardWidgetViewModel.prototype.GetAngleDisplayName(angle.name, displayObject.name, angle.model),
                name_html: [
                    '<div class="front">',
                        '<i class="icon ' + (displayObject.is_public ? 'public' : 'private') + '"></i>',
                        '<i class="icon ' + displayObject.display_type + (displayObject.is_angle_default ? ' default' : '') + (displayObject.used_in_task ? ' schedule' : '') + '"></i>',
                        '<i class="icon ' + (hasJump ? 'followup' : (hasFilter ? 'filter' : 'noFilter')) + '"></i>',
                    '</div>',
                    '<span class="name" title="' + displayObject.name + '">' + displayObject.name + '</span>',
                    '<div class="rear">',
                        '<i class="icon ' + (displayObject.is_parameterized ? 'parameterized' : 'none') + '"></i>',
                        '<i class="icon ' + (isError ? 'validError' : (isWarning ? 'validWarning' : 'none')) + '"></i>',
                        '<a class="icon link" href="' + link + '" target="_blank" onclick="dashboardDetailsHandler.DefinitionOpenDisplay(event, \'' + displayObject.uri + '\', ' + displayObject.is_public + ')"></a>',
                    '</div>'
                ].join('')
            };

            if (displayObject[dashboardModel.KeyName] === display) {
                selectedDisplay = displays[displayIndex];
            }
        });

        displays.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);

        return {
            displays: displays,
            selected: selectedDisplay
        };
    };
    self.DefinitionCanSelectDisplay = function (display) {
        var canSelectDisplay = !self.Model.Data().is_published() || (self.Model.Data().is_published() && display.is_public);
        return dashboardModel.CanUpdateDashboard('widget_definitions') && canSelectDisplay;
    };
    self.DefinitionsAfterRender = function () {
        // update selected display
        setTimeout(function () {
            jQuery.each(self.Definitions(), function (index, definition) {
                var selected = definition.selected();
                definition.selected(ko.toJSON({}));
                definition.selected(selected);
            });
        }, 100);
    };
    self.DefinitionHeaderClick = function (model, event) {
        if (model.displays().length) {
            var element = jQuery(event.currentTarget);
            var isCollapse = element.hasClass('Collapse');

            element.removeClass('Collapse Expand');
            if (isCollapse) {
                element.addClass('Expand');
                element.next('.FilterDetail').removeClass('Hide');
                self.DefinitionAdjustLayout();
            }
            else {
                element.addClass('Collapse');
                element.next('.FilterDetail').addClass('Hide');
            }
        }
    };
    self.DefinitionGetHeaderName = function (model, isHtml) {
        var display = JSON.parse(model.selected());
        if (isHtml) {
            return [
                '<div class="front">',
                    '<i class="icon ' + (display.is_public ? 'public' : 'private') + '"></i>',
                    '<i class="icon ' + display.type + '"></i>',
                '</div>',
                '<span class="name">' + model.widget_name() + '</span>'
            ].join('');
        }
        else {
            return model.widget_name();
        }
    };
    self.DefinitionGetWidgetName = function (model, defaultName) {
        return defaultName || model.full_name;
    };
    self.DefinitionGetAngleName = function (angle) {
        var isValidAngle = validationHandler.GetAngleValidation(angle).Valid;
        var angleName = modelsHandler.GetModelName(angle.model) + ' - ' + angle.name;
        return [
            '<div class="front">',
                '<i class="icon ' + (angle.is_published ? 'public' : 'private') + '"></i>',
                '<i class="icon ' + (angle.is_template ? 'template' : 'angle') + '"></i>',
            '</div>',
            '<span class="name" title="' + angleName + '">' + angleName + '</span>',
            '<div class="rear">',
                '<i class="icon ' + (angle.is_parameterized ? 'parameterized' : 'none') + '"></i>',
                '<i class="icon ' + (!isValidAngle ? 'validError' : 'none') + '"></i>',
            '</div>'
        ].join('');
    };
    self.DefinitionChangeWidget = function (model, canChangeWidget) {
        if (canChangeWidget === true) {
            var definition = self.Definitions().findObject('id', model.widget_id);
            if (definition) {
                definition.selected(ko.toJSON(model));

                var widgetName = self.DefinitionGetWidgetName(model, definition.default_name);
                definition.widget_name(widgetName);
            }

            var dataModel = self.Model.Data().widget_definitions.findObject('id', model.widget_id);
            if (dataModel) {
                dataModel.display = model[self.Model.KeyName];
                self.DefinitionUpdateWidgetName(model.widget_id, definition.default_name);
            }
        }
    };
    self.DefinitionUpdateWidgetName = function (widgetId, name) {
        var widget = self.Model.Data().widget_definitions.findObject('id', widgetId);
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var languageObject = widget.multi_lang_name().findObject('lang', defaultLanguage);
        if (!name)
            name = ' ';
        if (!languageObject) {
            widget.multi_lang_name.push({
                lang: defaultLanguage,
                text: name
            });
        }
        else {
            languageObject.text = name;
        }
    };
    self.DefinitionDeleteWidget = function (model) {
        self.Definitions.remove(model);
        var index = self.Model.Data().widget_definitions.indexOfObject('id', model.id);
        if (index !== -1) {
            self.Model.Data().widget_definitions.splice(index, 1);
            self.Model.Data().layout.widgets.splice(index, 1);
        }
    };
    self.DefinitionGetLink = function (angle, display) {
        var q = {};
        var executionParametersInfo = dashboardModel.GetAngleExecutionParametersInfo(angle, display);
        if (!jQuery.isEmptyObject(executionParametersInfo)) {
            q[enumHandlers.ANGLEPARAMETER.ASK_EXECUTION] = escape(JSON.stringify(executionParametersInfo));
        }
        q[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.PUBLISH;
        q[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;

        return WC.Utility.GetAnglePageUri(angle.uri, display.uri, q);
    };
    self.DefinitionOpenDisplay = function (event, displayUri, isPublic) {
        var watcherKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', displayUri);
        jQuery.storageWatcher(watcherKey, isPublic);

        event = event || window.event;
        if (event.stopPropagation)
            event.stopPropagation();
        else
            event.cancelBubble = true;
    };
    self.DefinitionAdjustLayout = function () {
        var filterWrapperWidth = jQuery('#FilterWrapper').width();
        WC.HtmlHelper.AdjustNameContainer('#FilterWrapper .FilterHeader', filterWrapperWidth - 150);
        WC.HtmlHelper.AdjustNameContainer('#FilterWrapper .FilterDetail', filterWrapperWidth - 300);
    };

    // publish
    self.ShowPublishPopup = function () {
        if (jQuery('#popupDashboardDetails .btnPublish').hasClass('disabled')) {
            return;
        }

        if (dashboardModel.IsTemporaryDashboard()) {
            popup.Alert(Localization.Warning_Title, Localization.MessageSaveRequiredPublishDashboard);
            return;
        }

        requestHistoryModel.SaveLastExecute(self, self.ShowPublishPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        if (dashboardModel.Data().is_published()) {
            if (dashboardModel.Data().created.user() !== userModel.Data().uri) {
                popup.Confirm(Localization.MessageConfirmUnpublishDashboard, function () {
                    // confirm to unpublish
                    self.UnPublishDashboard();
                });
            }
            else {
                self.UnPublishDashboard();
            }
        }
        else {
            // check unsave details
            if (!self.CheckValidation() || !self.CheckValidBeforePublished()) {
                return;
            }

            var popupName = 'DashboardPublishing',
                popupSettings = {
                    element: '#popup' + popupName,
                    title: Localization.AnglePublishing,
                    html: dashboardPublishingHtmlTemplate(),
                    className: 'popupPublishing popup' + popupName,
                    scrollable: false,
                    buttons: [
                        {
                            text: Captions.Button_Cancel,
                            position: 'right',
                            click: 'close'
                        },
                        {
                            text: Localization.Save,
                            position: 'right',
                            isPrimary: true,

                            click: function (e, obj) {
                                if (popup.CanButtonExecute(obj)) {
                                    self.PublishDashboard(e.kendoWindow);
                                }
                            }
                        },
                        {
                            text: '',
                            className: 'loading16x16',
                            position: 'right'
                        }
                    ],
                    open: function (e) {
                        e.sender.element.busyIndicator(true);
                        var fnCheckLabelLoaded = setInterval(function () {
                            if (!self.HandlerLabels.Element.find('.k-loading-mask').length) {
                                e.sender.element.busyIndicator(false);
                                self.ShowPublishPopupCallback(e);
                                clearInterval(fnCheckLabelLoaded);
                            }
                        }, 100);
                    },
                    close: function (e) {

                    }
                };

            popup.Show(popupSettings);
        }
    };
    self.ShowPublishPopupCallback = function (e) {
        // prepare publishing
        var bpList = [];
        jQuery.each(self.HandlerLabels.GetLabelsByType(self.HandlerLabels.LABELTYPE.BUSINESSPROCESS), function (index, item) {
            bpList.push(item.LabelName);
        });
        self.PublishingModel.bp_text(bpList.length + ' (' + bpList.join(', ') + ')');

        // language
        var langList = [];
        jQuery.each(ko.toJS(self.HandlerLanguages.Languages.List()), function (index, item) {
            if (item.is_selected) {
                langList.push(item.name);
            }
        });
        self.PublishingModel.language_text(langList.length + ' (' + langList.join(', ') + ')');

        // privilege
        var privilegeList = [];
        jQuery.each(self.HandlerLabels.GetLabelsByType(self.HandlerLabels.LABELTYPE.PRIVILEGE), function (index, item) {
            privilegeList.push(item.LabelName);
        });
        self.PublishingModel.privilege_label_text(privilegeList.length === 0 ? '0' : privilegeList.length + ' (' + privilegeList.join(', ') + ')');

        // search
        var searchList = [];
        jQuery.each(self.HandlerLabels.GetLabelsByType(self.HandlerLabels.LABELTYPE.SEARCH), function (iindex, item) {
            searchList.push(item.LabelName);
        });
        self.PublishingModel.search_label_text(searchList.length === 0 ? '0' : searchList.length + ' (' + searchList.join(', ') + ')');

        self.PublishingModel.private_displays.removeAll();
        self.PublishingModel.public_displays.removeAll();

        jQuery.each(self.Model.Data().widget_definitions, function (index, display) {
            var display = self.Model.Data().widget_definitions[index].GetDisplay();
            if (display != null && display.is_public) {
                self.PublishingModel.public_displays.push(display);
            }
            else {
                self.PublishingModel.private_displays.push(display);
            }
        });

        WC.HtmlHelper.ApplyKnockout(self.PublishingModel, e.sender.wrapper);

        e.sender.wrapper.find('.loading16x16').hide();
        e.sender.toFront();


        e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
    };
    self.PublishDashboard = function (win) {
        requestHistoryModel.SaveLastExecute(self, self.PublishDashboard, arguments);

        var btnSave = win.wrapper.find('.btnPrimary');
        var btnLoading = win.wrapper.find('.loading16x16');
        if (btnSave.hasClass('disabled'))
            return;

        btnLoading.show();
        btnSave.addClass('disabled');

        var dashboardData = {
            is_published: true
        };

        var newLayout = self.Model.GetData().layout;
        var oldLayout = dashboardModel.GetData().layout;
        if (newLayout !== oldLayout)
            dashboardData.layout = newLayout;

        jQuery.when(dashboardModel.SaveDashboard(dashboardData))
            .done(function (data) {
                self.Model.SetData(data);
                popup.Close('#popupDashboardPublishing');
                self.PrepareDefinitions();
            });
    };
    self.UnPublishDashboard = function () {
        var btnPublish = jQuery('.popupDashboardDetails .btnPublish'),
            btnSave = jQuery('.popupDashboardDetails .k-window-buttons .btnPrimary');
        btnPublish.addClass('disabled loading16x16');
        btnSave.addClass('disabled');

        var dashboardData = {
            is_published: false
        };
        jQuery.when(dashboardModel.SaveDashboard(dashboardData))
           .done(function (data) {
               self.Model.SetData(data);
           })
           .always(function () {
               btnPublish.removeClass('disabled loading16x16');
               btnSave.removeClass('disabled');
               self.PrepareDefinitions();
           });

    }

    self.SetFavorite = function (model, event) {
        dashboardHandler.SetFavorite(model.Model, event);
    };
    self.SaveAsDashboard = function (isQuickSave) {
        var dataSaveAs = {};

        // collect names
        dataSaveAs.multi_lang_name = [];
        dataSaveAs.multi_lang_description = [];
        var baseLanguages = ko.toJS(self.HandlerLanguagesSaveAs.Languages.List);
        jQuery.each(baseLanguages, function (index, lang) {
            if (lang.is_selected || (!lang.is_selected && lang.language_name)) {
                dataSaveAs.multi_lang_name.push({
                    text: lang.language_name,
                    lang: lang.id
                });
                dataSaveAs.multi_lang_description.push({
                    text: lang.language_description,
                    lang: lang.id
                });
            }
        });

        self.SaveDashboard(isQuickSave, dataSaveAs);
    };
    self.SaveDashboard = function (isQuickSave, saveAsNames) {
        if (typeof isQuickSave === 'undefined')
            isQuickSave = false;
        if (typeof saveAsNames === 'undefined')
            saveAsNames = false;

        requestHistoryModel.SaveLastExecute(self, self.SaveDashboard, arguments);

        if (self.HandlerFilter) {
            // update "filters" before get dashboard data
            self.Model.SetDashboardFilters(self.HandlerFilter.GetData());
        }
        var data = self.Model.GetData();
        var originalData = dashboardModel.GetData();
        var showSaveProgressbar = function () {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CreatingDashboard, false);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.SetDisableProgressBar();
        };

        if (isQuickSave && !data.model) {
            var models = modelsHandler.GetAvailabelModels();
            if (models.length) {
                data.model = models[0].uri;
            }
            else {
                popup.Alert(Localization.Warning_Title, Localization.Info_NoAvailableModel);
                return;
            }
        }

        if (data.widget_definitions.length !== originalData.widget_definitions.length) {
            var layout = dashboardModel.GetDefaultLayoutConfig(data.widget_definitions.length || 1);
            layout.widgets = self.Model.Data().layout.widgets;
            data.layout = JSON.stringify(layout);
        }

        if (dashboardModel.IsTemporaryDashboard()) {
            // adhoc Dashboard

            showSaveProgressbar();

            var temporaryUri = data.uri;
            dashboardModel.CreateDashboard(data)
                .done(function (response) {
                    // clean localStorage
                    var storage = jQuery.localStorage(dashboardModel.Name);
                    delete storage[temporaryUri];
                    jQuery.localStorage(dashboardModel.Name, storage);

                    // remove watcher
                    jQuery.storageWatcher(enumHandlers.STORAGE.WATCHER_DASHBOARD_WIDGETS_COUNT.replace('{uri}', temporaryUri), undefined);

                    self.ClosePopup();

                    progressbarModel.EndProgressBar();

                    // redirect to the creating dashboard
                    dashboardHandler.CheckBeforeRender = true;
                    window.location.replace(WC.Utility.GetDashboardPageUri(response.uri));
                });
        }
        else if (saveAsNames) {
            // save as...

            showSaveProgressbar();

            jQuery.extend(data, saveAsNames);
            dashboardModel.SaveAsDashboard(data)
                .done(function (response) {
                    self.ClosePopup();

                    progressbarModel.EndProgressBar();

                    var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
                    if (maximizeWrapper.hasClass('active')) {
                        dashboardHandler.MinimizeWidget(maximizeWrapper, false);
                    }

                    // redirect to the creating dashboard
                    window.location.replace(WC.Utility.GetDashboardPageUri(response.uri));
                });
        }
        else {
            // save normally
            if (jQuery.deepCompare(data, originalData)) {
                // nothing changes

                showSaveProgressbar();
                progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_ApplyDashboardDetails);
                setTimeout(function () {
                    self.ClosePopup();
                    progressbarModel.EndProgressBar();
                }, 300);
            }
            else {
                // continue saving....

                // data to be saved
                // clean PUT data
                jQuery.each(data, function (key, value) {
                    if (jQuery.deepCompare(value, originalData[key], true, key !== 'widget_definitions')) {
                        delete data[key];
                    }
                });

                var isFiltersChanged = data.filters !== undefined;

                var saveDashboard = function () {
                    showSaveProgressbar();

                    //minimize before save
                    var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
                    if (maximizeWrapper.hasClass('active')) {
                        dashboardHandler.MinimizeWidget(maximizeWrapper, false);
                    }

                    progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_PUTDashboardDetails);

                    

                    // handle update widgets
                    var widgetDerferred = [];
                    if (data.widget_definitions) {
                        jQuery.each(originalData.widget_definitions, function (index, widget) {
                            var changeWidget = data.widget_definitions.findObject('id', widget.id);
                            if (!changeWidget) {
                                widgetDerferred.pushDeferred(dashboardModel.DeleteWidgetById, [widget.id]);
                            }
                            else {
                                // clean PUT data
                                jQuery.each(changeWidget, function (key, value) {
                                    if (jQuery.deepCompare(value, widget[key])) {
                                        delete changeWidget[key];
                                    }
                                });
                                if (!jQuery.isEmptyObject(changeWidget)) {
                                    widgetDerferred.pushDeferred(dashboardModel.UpdateWidgetById, [widget.id, changeWidget]);
                                }
                            }
                        });
                        delete data.widget_definitions;
                    }

                    jQuery.whenAll(widgetDerferred, false)
                        .then(function () {
                            return dashboardModel.SaveDashboard(data);
                        })
                        .done(function (response) {
                            self.ClosePopup();
                            progressbarModel.EndProgressBar();

                            if (widgetDerferred.length) {
                                dashboardHandler.CheckBeforeRender = true;
                                dashboardHandler.Render();
                            }
                            else {
                                self.Model.SetData(response);
                                dashboardHandler.ApplyBindingHandler();
                                if (isFiltersChanged)
                                    dashboardHandler.ReloadAllWidgets();
                            }

                            if (dashboardModel.Data().is_validated())
                                jQuery('.widgetDisplayColumn').find('.widgetButtonDelete').addClass('disabled');
                            else
                                jQuery('.widgetDisplayColumn').find('.widgetButtonDelete').removeClass('disabled');
                        });
                };

                var confirmMessageBeforeSave = self.GetConfirmMessageBeforeSave(dashboardModel.Data().is_validated(), data);
                if (confirmMessageBeforeSave) {
                    popup.Confirm(confirmMessageBeforeSave, function () {
                        saveDashboard();
                    }, function () {
                        self.IsSubmit = false;
                    }, {
                        title: Localization.Warning_Title,
                        icon: 'alert'
                    });
                }
                else {
                    saveDashboard();
                }
            }
        }
    };
    self.GetConfirmMessageBeforeSave = function (isValidatedDashboard, updateData) {
        // M4-33955: save with validated state
        // show this message if...

        // update only user specific
        var tempUpdateData = ko.toJS(updateData);
        delete tempUpdateData.user_specific;
        var isChangeOnlyUserSpecific = updateData.user_specific && jQuery.isEmptyObject(tempUpdateData);

        // no change validate state
        var isChangeValidateState = typeof updateData.is_validated !== 'undefined';

        if (isValidatedDashboard && !isChangeValidateState && !isChangeOnlyUserSpecific)
            return Localization.Confirm_SaveValidatedDashboard;

        // no confirmation
        return null;
    };
    /*EOF: Model Methods*/
}
