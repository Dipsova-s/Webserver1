var angleDetailPageHandler = new AngleDetailPageHandler();

function AngleDetailPageHandler() {
    "use strict";

    var self = this;
    self.IsSubmit = false;
    self.Type = 'Angle';
    self.PopupElement = null;
    self.SelectTab = null;
    self.TAB = {
        GENERAL: 'AngleGeneral',
        DESCRIPTION: 'AngleDescription',
        DEFINITION: 'AngleDefinition',
        STATISTIC: 'AngleStatistic'
    };
    self.HandlerFilter = null;
    self.HandlerBaseClassesDetails = null;
    self.HandlerModelRoleDetails = null;
    self.HandlerInfoDetails = null;
    self.HandlerLanguages = null;
    self.HandlerLanguagesSaveAs = null;
    self.NoneBusinessProcessLabels = [];

    self.ShowPopup = function (selectedTab, callback) {
        requestHistoryModel.SaveLastExecute(self, self.ShowPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        self.SelectTab = selectedTab || self.TAB.GENERAL;
        self.IsSubmit = false;

        var saveAsFollowup = function () {
            if (jQuery('#popupNotification').is(':visible'))
                popup.Current.close();

            var msg = Localization.Confirm_SaveAngleWithWarning;
            popup.Confirm(msg, function () {
                self.ExecuteSave(true);
            });
        };

        var popupName = 'AngleDetail',
            popupSettings = {
                element: '#popup' + popupName,
                title: Localization.AngleDetails,
                html: angleDetailBodyHtmlTemplate(),
                className: 'popup' + popupName + ' popupWithTabMenu',
                width: 880,
                height: 530,
                minWidth: 748,
                minHeight: 400,
                buttons: [
                    {
                        text: Captions.Button_Cancel,
                        position: 'right',
                        className: 'executing',
                        click: function (e, obj) {
                            if (popup.CanButtonExecute(obj)) {
                                e.kendoWindow.close();
                            }
                        }
                    },
                    {
                        text: Localization.SaveAngleAs,
                        position: 'right',
                        isPrimary: true,
                        className: 'executing',
                        click: function (e, obj) {
                            if (popup.CanButtonExecute(obj) && self.CheckAngleValidation()) {
                                if (self.IsChangedFollowup()) {
                                    //Fixed added jump and save as didn't work correctly
                                    saveAsFollowup();
                                }
                                else {
                                    self.ExecuteSave(true);
                                }
                            }
                        }
                    },
                    {
                        text: Localization.Save,
                        position: 'right',
                        isPrimary: true,
                        className: 'executing',
                        click: function (e, obj) {
                            if (popup.CanButtonExecute(obj) && self.CheckAngleValidation()) {
                                self.ExecuteSave(false);
                            }
                        }
                    },
                    {
                        text: '',
                        className: 'loading16x16',
                        position: 'right'
                    }
                ],
                resize: function (e) {
                    var winWidth = e.sender.element.width(),
                        winHeight = e.sender.element.height(),
                        filterWrapper = e.sender.wrapper.find('.definitionList');

                    var businessProcessBar = jQuery('#AngleGeneralArea .businessProcesses');
                    businessProcessBar.css('max-width', jQuery('#AngleArea').width() - 180);
                    if (businessProcessesModel.General) {
                        businessProcessesModel.General.UpdateLayout(businessProcessBar);
                    }

                    if (filterWrapper.length !== 0) {
                        jQuery('.k-window-titlebar .Name', e.sender.wrapper).css('max-width', winWidth - 360);

                        if (self.HandlerLanguages) {
                            var editor = self.HandlerLanguages.EditorDescription;
                            if (editor && editor.wrapper.is(':visible')) {
                                editor.wrapper.find('.k-editable-area').height('100%');
                                var editorHeight = winHeight - (editor.wrapper.offset().top - e.sender.element.offset().top) - 15;
                                self.HandlerLanguages.SetEditorHeight(editorHeight);
                            }
                        }

                        if (filterWrapper.is(':visible')) {
                            var height = winHeight - (filterWrapper.offset().top - e.sender.element.offset().top) - 125;
                            e.sender.wrapper.find('.defInfoWrapper').height(height + 72);
                            filterWrapper.css('max-height', height + 70);
                            filterWrapper.find('.FilterHeader p label').css('max-width', filterWrapper.width() - 145);
                        }

                        self.HandlerFilter.View.AdjustLayout();

                        self.HandlerBaseClassesDetails.AdjustLayout();
                    }
                },
                open: function (e) {
                    SetLoadingVisibility('.popupAngleDetail .loading16x16', false);
                    e.sender.wrapper.parent().find(".k-window-action").css("visibility", "hidden");
                    e.sender.toFront();

                    self.ShowPopupCallback(e.sender, callback);
                },
                close: function (e) {
                    setTimeout(function () {
                        self.PopupElement = null;
                        self.SelectTab = null;
                        self.HandlerFilter = null;
                        self.HandlerBaseClassesDetails = null;
                        self.HandlerModelRoleDetails = null;
                        self.HandlerInfoDetails = null;
                        self.HandlerLanguages = null;

                        if (!self.IsSubmit) {
                            self.ResetAllAngleDetails();
                        }

                        anglePageHandler.UpdateDetailSection();

                        e.sender.destroy();
                    }, 500);
                }
            };

        if (!angleInfoModel.IsTemporaryAngle()) {
            // set buttons
            /* BOF: M4-11506: Fixed user have to reload angle, then 'Save Angle as..' button will enable */
            anglePageHandler.UpdateAngleDisplayValidation();
            /* EOF: M4-11506: Fixed user have to reload angle, then 'Save Angle as..' button will enable */
        }

        var btnSaveAs = popupSettings.buttons.findObject('text', Localization.SaveAngleAs);
        var btnSave = popupSettings.buttons.findObject('text', Localization.Save);
        if (angleInfoModel.IsTemporaryAngle()) {
            btnSaveAs.className = 'alwaysHide';
        }
        else {
            if (!self.CanSaveAsAngle()) {
                btnSaveAs.className = 'disabled';
            }
            if (!angleInfoModel.Data().authorizations.update && !angleInfoModel.Data().authorizations.unvalidate) {
                btnSave.className = 'disabled';
            }
        }

        self.PopupElement = popup.Show(popupSettings);
        return self.PopupElement;
    };
    self.ShowPopupCallback = function (win, callback) {
        // M4-32490: Execute template and switch to display with "execution parameter" then got Angle popup
        anglePageHandler.OpenAngleDetailPopupAfterExecuted = false;

        self.PopupElement = win;

        angleInfoModel.IsTempTemplate(angleInfoModel.IsTemplate());

        win.element.css('overflow', 'hidden').busyIndicator(true);
        win.element.find('.popupTabMenu, .popupTabPanel').css('visibility', 'hidden');

        // title bar
        win.wrapper.find('.k-window-titlebar .angleInformation').remove();
        win.wrapper.find('.k-window-title').after(WC.WidgetDetailsView.TemplateAngleInfoPopupHeader);

        //change to get from current model instead of privileage model angleInfoModel.Data().model
        var deferred = [];
        deferred.pushDeferred(modelsHandler.LoadModelInfo, [angleInfoModel.Data().model]);
        deferred.pushDeferred(businessProcessesModel.General.Load);
        deferred.pushDeferred(systemLanguageHandler.LoadLanguages);
        jQuery.whenAll(deferred)
            .done(function () {
                self.SetNoneBusinessProcessLabels(angleInfoModel.Data().assigned_labels);

                var activeBusinessProcessBars = self.GetActiveBusinessProcesses();
                businessProcessesModel.General.CurrentActive(activeBusinessProcessBars);
                businessProcessesModel.General.ClickCallback(jQuery.noop);
                businessProcessesModel.General.ReadOnly(!angleInfoModel.CanUpdateAngle('assigned_labels_bp'));
                businessProcessesModel.General.MultipleActive(true);
                businessProcessesModel.General.CanEmpty(false);

                var checkAngleIsReady = setInterval(function () {
                    if (resultModel.Data() && anglePageHandler.LoadResultFieldDone) {
                        if (!resultModel.Data().authorizations) {
                            resultModel.Data().authorizations = resultModel.GetDefaultResultAuthorizations();
                        }
                        clearInterval(checkAngleIsReady);

                        WC.HtmlHelper.ApplyKnockout(angleInfoModel, win.wrapper);
                        businessProcessesModel.General.SetCheckBoxStyle();
                        businessProcessesModel.General.ApplyHandler('#AngleBusinessProcesses');

                        // languages
                        self.InitialLanguages();

                        // filters
                        self.PrepareDefinitions(win);

                        // when many filter can make firefox error
                        var filterCount = ko.toJS(self.HandlerFilter.GetData()).findObjects('step_type', enumHandlers.FILTERTYPE.FILTER).length;
                        var timeoutForClickTab = (Math.ceil(filterCount / 10) + 1) * 1000;

                        setTimeout(function () {
                            self.TabClick(self.SelectTab);

                            if (jQuery.isFunction(callback))
                                callback();

                            win.element.css('overflow', '').busyIndicator(false);
                            win.element.find('.popupTabMenu, .popupTabPanel').css('visibility', '');
                            win.wrapper.parent().find(".k-window-action").css("visibility", "visible");
                            self.CheckExecuted();
                        }, timeoutForClickTab);
                    }
                }, 100);
            });
    };
    self.CanSaveAsAngle = function () {
        if (!userModel.IsPossibleToCreateAngleFromModel(angleInfoModel.Data().model)
            || anglePageHandler.HandlerValidation.Angle.InvalidBaseClasses
            || !angleInfoModel.AllowMoreDetails()
            || !angleInfoModel.AllowFollowups()) {
            return false;
        }

        return true;
    };
    self.ClosePopup = function () {
        popup.Close('#popupAngleDetail');
        anglePageHandler.ApplyExecutionAngle();
    };
    self.SetTemplate = function (data, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            angleInfoModel.IsTempTemplate(!angleInfoModel.IsTempTemplate());
        }
    };
    self.CheckAngleValidation = function () {
        // check languages
        jQuery.each(self.HandlerLanguages.Languages.List(), function (i, language) {
            language.language_name(jQuery.trim(language.language_name()));
        });
        var emptyLanguages = jQuery.grep(self.HandlerLanguages.Languages.List(), function (lang) { return lang.is_selected() && !lang.language_name(); });
        if (emptyLanguages.length) {
            self.TabClick(self.TAB.DESCRIPTION);
            self.HandlerLanguages.LanguageSetSelect(emptyLanguages[0]);
            self.HandlerLanguages.ElementName.addClass('k-invalid');

            return false;
        }

        // check bp
        var activeBP = businessProcessesModel.General.GetActive().length;
        var allowBP = jQuery.grep(businessProcessesModel.General.Data(), function (bp) { return bp.is_allowed; }).length;
        if (!activeBP && !businessProcessesModel.General.ReadOnly()) {
            if ((self.IsSaveAs() || angleInfoModel.IsTemporaryAngle()) && !allowBP) {
                popup.Alert(Localization.Warning_Title, Localization.Info_RequiredBusinessProcessPrivilegeForAngle);
                self.TabClick(self.TAB.GENERAL);

                return false;
            }
            else if (!activeBP) {
                popup.Alert(Localization.Error_Title, Localization.Info_RequiredBusinessProcessForAngle);
                self.TabClick(self.TAB.GENERAL);

                return false;
            }
        }

        // check angle id
        if (/^[a-z,_](\w*)$/i.test(jQuery('#AngleId').val()) === false) {
            popup.Alert(Localization.Warning_Title, Localization.Info_InvalidID);
            self.TabClick(self.TAB.GENERAL);

            return false;
        }

        if (self.HandlerFilter) {
            var checkValidArgument = validationHandler.CheckValidExecutionParameters(self.HandlerFilter.GetData(), angleInfoModel.Data().model);
            if (!checkValidArgument.IsAllValidArgument) {
                popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
                self.TabClick(self.TAB.DEFINITION);

                return false;
            }
        }

        return true;
    };
    self.ExecuteSave = function (isCopy) {
        if (isCopy) {
            self.ShowSaveAsPopup();
        }
        else {
            self.IsSubmit = true;
            self.Save();
        }
    };
    self.ShowSaveAsPopup = function () {
        requestHistoryModel.SaveLastExecute(self, self.ShowSaveAsPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;
        var popupName = 'SaveAs';
        var popupSettings = {
            element: '#popup' + popupName,
            title: Localization.SaveAngleAs,
            className: 'popup' + popupName,
            actions: ["Close"],
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
                        if (popup.CanButtonExecute(obj) && self.CheckSaveAsValidation()) {
                            /* BOF: M4-11698: Fixed added jump and save as didn't work correctly */
                            if (self.IsChangedFollowup()) {
                                self.SaveAsAngle({ HaveFollowup: true });
                                /* EOF: M4-11698: Fixed added jump and save as didn't work correctly */
                            }
                            else {
                                self.SaveAsAngle();
                            }
                            e.kendoWindow.close();
                        }
                    }
                }
            ],
            resizable: false,
            open: function (e) {
                setTimeout(function () {
                    jQuery('a[id*=btn-popupSaveAs]').removeClass('executing');
                }, 1);

                // collect data
                var baseLanguages = ko.toJS(self.HandlerLanguages.Languages.List);
                var multiLangNames = [];
                var multiLangDescriptions = [];
                jQuery.each(baseLanguages, function (index, lang) {
                    if (lang.is_selected || (!lang.is_selected && lang.language_name)) {
                        multiLangNames.push({
                            text: lang.language_name.substr(0, 248) + ' (copy)',
                            lang: lang.id
                        });
                        multiLangDescriptions.push({
                            text: lang.language_description,
                            lang: lang.id
                        });
                    }
                });

                // bind template & knockout
                self.HandlerLanguagesSaveAs = new WidgetLanguagesHandler('#popupSaveAs', multiLangNames, multiLangDescriptions);
                self.HandlerLanguagesSaveAs.ShowDescription(false);
                self.HandlerLanguagesSaveAs.Labels.LabelLanguageName = Localization.AngleName;
                self.HandlerLanguagesSaveAs.ApplyHandler();

                jQuery.each(self.HandlerLanguagesSaveAs.Languages.List(), function (index, lang) {
                    lang.is_selected(baseLanguages[index].is_selected);
                });

                // check valid angle/display
                anglePageHandler.UpdateAngleDisplayValidation();
                var haveDisplayInvalid = jQuery.grep(displayModel.DisplayInfo.Displays(), function (itemList) { return itemList.IsWarning || itemList.IsError; }).length > 0;
                if (!anglePageHandler.HandlerValidation.Angle.Valid || haveDisplayInvalid) {
                    e.sender.element.append('<div class="row warningMessage">' + Localization.Info_SaveAsAngleWarning + '</div>');
                }
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
        popup.Close('#popupSaveAs');
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
    self.ShowInfoPopup = function () {
        var popupName = 'AngleInfo',
            popupSettings = {
                element: '#popup' + popupName,
                title: Localization.AngleDetails,
                className: 'popup' + popupName,
                buttons: [
                    {
                        text: Localization.Ok,
                        position: 'right',
                        isPrimary: true,
                        click: 'close'
                    }
                ],
                height: 530,
                animation: false,
                resize: function (e) {
                    var winWidth = e.sender.element.width();
                    e.sender.wrapper.find('.k-window-titlebar .Name').css('max-width', winWidth - 360);

                    if (self.HandlerInfoDetails) {
                        self.HandlerInfoDetails.AdjustLayout();
                    }
                },
                open: function (e) {
                    var descriptionData = ko.toJS(anglePageHandler.HandlerAngleDetails.Data.Description()),
                        queryBlocksData = ko.toJS(anglePageHandler.HandlerAngleDetails.Data.QueryBlocks()),
                        modelRoles = ko.toJS(userModel.GetModelRolesByModelUri(angleInfoModel.Data().model));
                    self.HandlerInfoDetails = new WidgetDetailsHandler(e.sender.element, descriptionData, queryBlocksData, modelRoles);
                    self.HandlerInfoDetails.Angle = angleInfoModel.Data();
                    self.HandlerInfoDetails.ModelUri = angleInfoModel.Data().model;
                    self.HandlerInfoDetails.ApplyHandler();
                    self.HandlerInfoDetails.AdjustLayout();

                    e.sender.wrapper.find('.k-window-title').after(WC.WidgetDetailsView.TemplateAngleInfoPopupHeader);
                    WC.HtmlHelper.ApplyKnockout(angleInfoModel, e.sender.wrapper.find('.angleInformation'));
                },
                close: function (e) {
                    e.sender.destroy();
                }
            };

        popup.Show(popupSettings);
    };
    self.ShowAngleResultSummary = function () {
        var popupName = 'AngleResultSummary',
            popupSettings = {
                element: '#popup' + popupName,
                title: Captions.Popup_ResultSummary_Title,
                html: resultSummaryHtmlTemplate(),
                appendTo: 'body',
                className: 'popup' + popupName,
                width: 420,
                minWidth: 420,
                minHeight: 300,
                buttons: [
                    {
                        text: Localization.Ok,
                        position: 'right',
                        isPrimary: true,
                        click: 'close'
                    }
                ],
                animation: false,
                open: function (e) {
                    resultModel.AngleResultSummary.measurePerformance = measurePerformance.GetTimeElapsed().toFixed(1) + ' ' + Localization.AngleDefinitionAreaSec;
                    WC.HtmlHelper.ApplyKnockout(resultModel.AngleResultSummary, e.sender.wrapper.find('.popupResultSummaryPanel'));
                },
                close: function (e) {
                    e.sender.destroy();
                }
            };

        popup.Show(popupSettings);
    };
    self.TabClick = function (elementId) {
        if (!self.PopupElement)
            return;
        var win = self.PopupElement;

        jQuery('#AngleTabs li').removeClass('Selected');
        jQuery('#' + elementId).addClass('Selected');
        jQuery('#AngleArea > div').removeClass('Selected');
        jQuery('#' + elementId + 'Area').addClass('Selected');

        // clicked on iframe
        if (elementId === self.TAB.DESCRIPTION) {
            win.trigger('resize');
            setTimeout(function () {
                if (self.HandlerLanguages) {
                    self.HandlerLanguages.RefreshEditor();
                }
            }, 10);
        }
        else if (elementId === self.TAB.DEFINITION) {
            win.trigger('resize');
        }
    };
    self.ResetAllAngleDetails = function () {
        angleInfoModel.ResetAll();
        angleQueryStepModel.ResetAll();
    };
    self.CheckExecuted = function () {
        if (!self.PopupElement)
            return;

        var buttons = self.PopupElement.options.buttons;
        if (anglePageHandler.IsExecuted) {
            jQuery.each(buttons, function (k, v) {
                v.className = (v.className || '').replace(/executing/g, '');
            });
            popup.SetButtons(self.PopupElement, buttons);
        }
        else {
            jQuery.each(buttons, function (k, v) {
                v.className += ' executing';
            });
            popup.SetButtons(self.PopupElement, buttons);
            setTimeout(function () {
                self.CheckExecuted();
            }, 500);
        }
    };
    self.SetNoneBusinessProcessLabels = function (labels) {
        self.NoneBusinessProcessLabels = [];
        jQuery.each(labels, function (index, label) {
            if (!WC.Utility.ToArray(businessProcessesModel.General.Data()).hasObject('id', label, false))
                self.NoneBusinessProcessLabels.push(label);
        });
    };
    self.GetActiveBusinessProcesses = function () {
        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(angleInfoModel.Data().model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.General, modelPrivileges, angleInfoModel.IsPublished());

        var activeBusinessProcesses = {};
        jQuery.each(angleInfoModel.Data().assigned_labels, function (index, label) {
            var businessProcessData = WC.Utility.ToArray(businessProcessesModel.General.Data()).findObject('id', label, false);
            if (businessProcessData && businessProcessData.is_allowed) {
                activeBusinessProcesses[label] = true;
            }
        });
        return activeBusinessProcesses;
    };

    //BOF: Angle detail tab
    self.InitialLanguages = function () {
        // languages
        var angleData = angleInfoModel.Data();
        self.TabClick(self.TAB.DESCRIPTION);
        self.HandlerLanguages = new WidgetLanguagesHandler('#AngleDescriptionArea', angleData.multi_lang_name, angleData.multi_lang_description);
        self.HandlerLanguages.Labels.LabelLanguageName = Localization.AngleName;
        self.HandlerLanguages.CanChangeLanguage = function () {
            return angleInfoModel.CanUpdateAngle('name');
        };
        self.HandlerLanguages.ApplyHandler();
    };
    //EOF: Angle detail tab

    //EOF: Angle filters tab
    self.PrepareDefinitions = function (win) {
        self.HandlerBaseClassesDetails = new WidgetDetailsHandler('#popupAngleDetail .objectName', '', ko.toJS(angleInfoModel.Data().query_definition), []);
        self.HandlerBaseClassesDetails.Angle = angleInfoModel.Data();
        self.HandlerBaseClassesDetails.ModelUri = angleInfoModel.Data().model;
        self.HandlerBaseClassesDetails.CanViewBaseClassInfo(true);
        self.HandlerBaseClassesDetails.ClickShowBaseClassInfoPopupString = 'angleDetailPageHandler.ShowBaseClassInfoPopup(this)';
        self.HandlerBaseClassesDetails.ApplyHandler(self.HandlerBaseClassesDetails.View.TemplateBaseClasses);

        self.HandlerModelRoleDetails = new WidgetDetailsHandler('#popupAngleDetail .modelRoles', '', [], ko.toJS(userModel.GetModelRolesByModelUri(angleInfoModel.Data().model)));
        self.HandlerModelRoleDetails.Angle = angleInfoModel.Data();
        self.HandlerModelRoleDetails.ModelUri = angleInfoModel.Data().model;
        self.HandlerModelRoleDetails.ApplyHandler(self.HandlerModelRoleDetails.View.TemplateExecuteModelRole);

        self.HandlerFilter = new WidgetFilterHandler(win.element.find('[id="FilterWrapper"]'), angleQueryStepModel.QuerySteps());
        self.HandlerFilter.ModelUri = angleInfoModel.Data().model;
        self.HandlerFilter.HasExecutionParameter(true);
        self.HandlerFilter.FilterFor = self.HandlerFilter.FILTERFOR.ANGLE;
        self.HandlerFilter.ApplyHandler();

        var angleBaseClassBlock = angleInfoModel.Data().query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        self.HandlerFilter.SetFieldChoooserInfo(angleBaseClassBlock ? angleBaseClassBlock.base_classes : []);
    };
    self.ShowAddFilterPopup = function (model, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            var angleBlocks = angleInfoModel.Data().query_definition;
            var angleBaseClassBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            fieldsChooserHandler.ModelUri = angleInfoModel.Data().model;
            fieldsChooserHandler.AngleClasses = angleBaseClassBlock ? angleBaseClassBlock.base_classes : [];
            fieldsChooserHandler.AngleSteps = self.HandlerFilter.GetData();
            fieldsChooserHandler.DisplaySteps = displayQueryBlockModel.TempQuerySteps();
            fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, enumHandlers.ANGLEPOPUPTYPE.ANGLE, self.HandlerFilter);
        }
    };
    self.ShowFollowupPopup = function (option, model, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            followupPageHandler.SetHandlerValues(self.HandlerFilter, self.HandlerFilter.GetData(), []);
            followupPageHandler.ShowPopup(option);
        }
    };
    self.ShowBaseClassInfoPopup = function (element) {
        element = jQuery(element);
        helpTextHandler.ShowHelpTextPopup(element.data('id'), helpTextHandler.HELPTYPE.CLASS, angleInfoModel.Data().model);
    };
    //EOF: Angle filters tab

    self.CurrentData = function () {
        // Angle General
        var data = {};

        data.model = angleInfoModel.Data().model;
        data.assigned_labels = self.GetAssignedLabels();

        if (jQuery('#AngleId').length)
            data.id = jQuery.trim(jQuery('#AngleId').val());

        // Angle Description
        data.multi_lang_name = [];
        data.multi_lang_description = [];
        var languagesHandler = self.IsSaveAs() ? self.HandlerLanguagesSaveAs : self.HandlerLanguages;
        if (languagesHandler) {
            jQuery(ko.toJS(languagesHandler.Languages.List())).each(function (index, language) {
                if (language.is_selected) {
                    data.multi_lang_name.push({
                        lang: language.id,
                        text: language.language_name.substr(0, 255)
                    });
                    data.multi_lang_description.push({
                        lang: language.id,
                        text: language.language_description
                    });
                }
            });
        }

        // Angle Definition
        var isFollowup = self.HandlerFilter.GetData().hasObject('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        data.query_definition = angleQueryStepModel.CollectQueryBlocks(self.HandlerFilter.GetData());

        // Angle template
        data.is_template = jQuery('#AngleIsTemplate').is(':checked') && userModel.CanCreateTemplateAngle();

        return { isFollowup: isFollowup, data: data };
    };
    self.GetAssignedLabels = function () {
        var labels = businessProcessesModel.General.GetActive();
        jQuery.merge(labels, self.NoneBusinessProcessLabels);
        return labels;
    };
    self.CanSetToTemplate = function () {
        return userModel.GetAuthorizeCreateTemplateAnlge(angleInfoModel.Data().model);
    };
    self.Save = function () {
        requestHistoryModel.SaveLastExecute(self, self.Save, arguments);
        var currentData = self.CurrentData(),
            updateAngleJSON = currentData.data,
            isFollowup = currentData.isFollowup,
            sourceAngleData = ko.toJS(angleInfoModel.Data()),
            dataChanged = false;

        if (sourceAngleData.multi_lang_description) {
            for (var index = 0; index < updateAngleJSON.multi_lang_description.length; index++) {
                if (!sourceAngleData.multi_lang_description.hasObject('lang', updateAngleJSON.multi_lang_description[index].lang, false)) {
                    sourceAngleData.multi_lang_description.push({
                        lang: updateAngleJSON.multi_lang_description[index].lang,
                        text: ''
                    });
                }
            }
        }

        anglePageHandler.UpdateAngleDisplayValidation();

        // update default value - sourceAngleData
        jQuery.each(sourceAngleData.query_definition, function (index, block) {
            sourceAngleData.query_definition[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
        });

        // update default value - updateAngleJSON
        jQuery.each(updateAngleJSON.query_definition, function (index, block) {
            updateAngleJSON.query_definition[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
        });
        if (!angleInfoModel.IsTemporaryAngle()) {
            if (!angleInfoModel.Data().authorizations.update) {
                // if user didn't have save angle privilege remove all data
                updateAngleJSON = {};
            }
            if (updateAngleJSON.is_template && !self.CanSetToTemplate(angleInfoModel.Data().model)) {
                delete updateAngleJSON.is_template;
            }

            updateAngleJSON = WC.ModelHelper.GetChangeAngle(updateAngleJSON, sourceAngleData);
            if (updateAngleJSON) {
                dataChanged = true;
            }
        }
        else {
            dataChanged = true;
        }

        jQuery.Deferred(function (rootPromise) {
            if (dataChanged) {
                var oldFollowups = [];
                var newFollowups = [];
                var oldQuerySteps = jQuery.grep(angleInfoModel.Data().query_definition, function (queryDefinition) {
                    return queryDefinition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS;
                });
                var newQuerySteps = ko.toJS(angleQueryStepModel.GetQueryStep(self.HandlerFilter.GetData()));

                // update default value - newQuerySteps
                jQuery.each(oldQuerySteps, function (index, block) {
                    oldQuerySteps[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                });
                jQuery.each(newQuerySteps, function (index, block) {
                    newQuerySteps[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                });

                if (oldQuerySteps.length) {
                    oldFollowups = jQuery.grep(oldQuerySteps[0].query_steps, function (queryStep) {
                        return queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP;
                    });
                }
                if (newQuerySteps.length) {
                    newFollowups = jQuery.grep(newQuerySteps[0].query_steps, function (queryStep) {
                        return queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP;
                    });
                }

                var confirmBeforeSaveMessage = self.GetConfirmMessageBeforeSave(angleInfoModel.Data().is_validated, oldFollowups, newFollowups);
                if (confirmBeforeSaveMessage) {
                    // show confirm popup
                    popup.Confirm(confirmBeforeSaveMessage, function () {
                        // ok
                        self.SaveAngle(updateAngleJSON, oldQuerySteps, newQuerySteps, isFollowup, oldFollowups, newFollowups)
                            .done(function () {
                                rootPromise.resolve();
                            });
                    }, function () {
                        // cancel
                        self.IsSubmit = false;
                    }, {
                            title: Localization.Warning_Title,
                            icon: 'alert'
                        });
                }
                else {
                    self.SaveAngle(updateAngleJSON, oldQuerySteps, newQuerySteps, isFollowup, oldFollowups, newFollowups)
                        .done(function () {
                            rootPromise.resolve();
                        });
                }
            }
            else {
                // nothing to save
                self.ClosePopup();
                rootPromise.resolve();
                self.ShowProgressBar();
            }
        })
        .done(function () {
            toast.MakeSuccessTextFormatting(angleInfoModel.Name(), Localization.Toast_SaveItem);
        });
    };
    self.GetConfirmMessageBeforeSave = function (isValidatedAngle, oldFollowups, newFollowups) {
        // M4-33955: save with validated state
        // no change validate state
        if (isValidatedAngle)
            return Localization.Confirm_SaveValidatedAngle;

        // save with warning
        var isSameFollowups = jQuery.deepCompare(oldFollowups, newFollowups, false, false);
        if (!isSameFollowups && anglePageHandler.HandlerValidation.Angle.Valid)
            return Localization.Confirm_SaveAngleWithWarning;

        // no confirmation
        return null;
    };
    self.SaveAngle = function (updateAngleJSON, oldQuerySteps, newQuerySteps, isFollowup, oldFollowups, newFollowups) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PUTAngleDetail, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.SetDisableProgressBar();

        if (!angleInfoModel.IsTemporaryAngle()) {
            //Delete readonly properties
            updateAngleJSON = angleInfoModel.DeleteReadOnlyAngleProperties(updateAngleJSON);

            /*  M4-10057: Implement state transfers for angles/displays/dashboards
                6.Implemented is_template
            */
            return self.ManageSaveAngleState({
                UpdateAngleJSON: updateAngleJSON,
                OldQuerySteps: oldQuerySteps,
                NewQuerySteps: newQuerySteps,
                OldFollowups: oldFollowups,
                NewFollowups: newFollowups
            });
        }
        else {
            popup.Close('#popupAngleDetail');
            return self.SaveTempAngle();
        }
    };
    self.ApplySave = function (oldQuerySteps, newQuerySteps, oldFollowups, newFollowups, updateAngleJSON) {
        jQuery.when(angleInfoModel.LoadAngle(angleInfoModel.Data().uri))
            .done(function () {
                angleQueryStepModel.ExcuteParameters(null);
                angleInfoModel.UpdateAngleQuerySteps(angleInfoModel.Data());
                self.ClosePopup();
                self.ApplyResult(oldQuerySteps, newQuerySteps, oldFollowups, newFollowups, true, updateAngleJSON);
            });
    };
    self.SaveTempAngle = function () {
        var angleData = self.CurrentData().data, defaultDisplayId;
        if (!angleData.id) {
            angleData.id = angleInfoModel.Data().id;
        }
        angleData.display_definitions = [];
        jQuery.each(angleInfoModel.Data().display_definitions, function (index, display) {
            var historyDisplay = historyModel.Get(display.uri);
            display = historyDisplay || display;

            if (index === 0 || display.is_angle_default) {
                defaultDisplayId = display.id;
            }
            displayModel.DeleteReadOnlyDisplayProperties(display);
            angleData.display_definitions.push(display);
        });
        if (!defaultDisplayId) {
            jQuery.when(resultModel.PostResult({ customQueryBlocks: [], currentDisplay: null }))
                .then(function () {
                    return resultModel.GetResult(resultModel.Data().uri);
                })
                .then(function () {
                    return displayModel.GetDefaultListFields(resultModel.Data());
                })
                .done(function (fields) {
                    var display = displayModel.GenerateDefaultData(enumHandlers.DISPLAYTYPE.LIST);
                    display.fields = fields;
                    display.is_angle_default = true;
                    display.user_specific.is_user_default = false;
                    defaultDisplayId = display.id;
                    displayModel.DeleteReadOnlyDisplayProperties(display);
                    angleData.display_definitions.push(display);
                    angleData.angle_default_display = defaultDisplayId;

                    return self.SaveAdhocAngle(angleData);
                });
        }
        else {
            angleData.angle_default_display = defaultDisplayId;

            return self.SaveAdhocAngle(angleData);
        }
    };
    self.ApplyResult = function (oldQuerySteps, newQuerySteps, oldFollowups, newFollowups, isFromSaveAngle, updateAngleJSON) {
        var isEditMode = anglePageHandler.IsEditMode();
        var isSameFollowups = jQuery.deepCompare(oldFollowups, newFollowups, false, false);

        anglePageHandler.UpdateAngleDisplayValidation();
        anglePageHandler.RenderBreadcrumb();
        if (!isSameFollowups && anglePageHandler.HandlerValidation.Angle.Valid) {
            /*
                PBI: M4-26472 Keep displays when add/remove jump
                Description: It should be possible to Add/remove followup, without having all Displays deleted
            */
            self.ApplyResultWithSetDisplayAndExecuteAngle(oldQuerySteps, newQuerySteps, updateAngleJSON);
        }
        else if (self.CheckExecuteAngle(oldQuerySteps, newQuerySteps, isEditMode)) {
            self.ApplyResultWithExecuteAngle(oldQuerySteps, newQuerySteps, updateAngleJSON);
        }
        else {
            self.ApplyResultWithoutExecuteAngle(isEditMode);
        }
        anglePageHandler.UpdateDetailSection();
    };
    self.ApplyResultWithSetDisplayAndExecuteAngle = function (oldQuerySteps, newQuerySteps, updateAngleJSON) {
        //prepare angle model data and display model data to get the current display from angle model data by using current display data uri
        var displayPropertyNameUri = 'uri';
        var angleData = angleInfoModel.Data();
        var displayData = displayModel.Data();
        var currentDisplayData = angleData.display_definitions.findObject(displayPropertyNameUri, displayData.uri);

        //clear all current angle in history model data (because, it has keeping incorrect data before)
        historyModel.ClearAll(angleData.uri);
        //set the new current display to display model data
        displayModel.LoadSuccess(currentDisplayData);

        //start apply result and execute angle on this page
        self.ApplyResultWithExecuteAngle(oldQuerySteps, newQuerySteps, updateAngleJSON);
    };
    self.CheckExecuteAngle = function (oldQuerySteps, newQuerySteps, isEditMode) {
        var isChangeQueryStep = !jQuery.deepCompare(oldQuerySteps, newQuerySteps, false);
        return !isEditMode && isChangeQueryStep;
    };
    self.ApplyResultWithoutExecuteAngle = function (isEditMode) {
        self.ShowProgressBar();

        //M4-31194 fixed edit mode bug
        if (isEditMode)
            anglePageHandler.ApplyAngleAndDisplayWithoutResult(displayModel.Data());
    };
    self.ApplyResultWithExecuteAngle = function (oldQuerySteps, newQuerySteps, updateAngleJSON) {
        var angleUri = angleInfoModel.Data().uri;

        // save history
        historyModel.Save();

        // clean results, remove posted_angle for force post a new results
        jQuery.each(historyModel.Data(), function (k, v) {
            if (k.indexOf(angleUri + '/') !== -1 && v.results) {
                delete v.results.posted_angle;
            }
        });
        // execute angle
        anglePageHandler.KeepHistory = false;

        /*BOF: M4-10763: After add FUQ to display then webclient send request field of baseclass incorrect*/
        // clean steps
        var stepsFilterFollowup = [],
            postedQuery = WC.Utility.ToArray(ko.toJS(resultModel.Data().posted_display)),
            stepsPostedFilterFollowup = [];
        jQuery.each(ko.toJS(historyModel.Get(displayModel.Data().uri, false).query_blocks), function (index, block) {
            block = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
            if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                jQuery.each(block.query_steps, function (indexStep, step) {
                    if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                        stepsFilterFollowup.push(step);
                    }
                });
            }
        });
        jQuery.each(postedQuery, function (index, block) {
            block = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
            if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                jQuery.each(block.query_steps, function (indexStep, step) {
                    if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                        stepsPostedFilterFollowup.push(step);
                    }
                });
            }
        });

        var ignoreDisplayQueryBlock = false;
        if (jQuery.deepCompare(oldQuerySteps, newQuerySteps, false)) {
            // clean fields
            var fields = ko.toJS(displayModel.Data().fields);
            var postedFields = ko.toJS(resultModel.Data().display_fields);
            if (displayModel.Data().display_type !== enumHandlers.DISPLAYTYPE.LIST) {
                fields = WC.ModelHelper.RemoveReadOnlyFields(fields);
                postedFields = WC.ModelHelper.RemoveReadOnlyFields(postedFields);
            }
            else {
                fields = [];
                postedFields = [{}];
            }

            ignoreDisplayQueryBlock = jQuery.deepCompare(fields, postedFields, false)
                || jQuery.deepCompare(stepsFilterFollowup, stepsPostedFilterFollowup, false, false);
        }
        anglePageHandler.ExecuteAngle(ignoreDisplayQueryBlock);
    };
    self.ShowProgressBar = function () {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_ApplyingAngle, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.SetDisableProgressBar();

        window.setTimeout(function () {
            progressbarModel.SetProgressBarText(100, resultModel.Data().row_count, resultModel.Data().status);
            progressbarModel.EndProgressBar();
        }, 300);
    };
    self.SaveAsAngle = function (option) {
        var setting = jQuery.extend({}, { HaveFollowup: false, DisplayDefinitions: [] }, option);
        requestHistoryModel.SaveLastExecute(self, self.SaveAsAngle, arguments);

        // prepare data
        var angleData = self.CurrentData().data;

        var createSaveAsAngle = function (setting) {
            self.ClosePopup();
            self.CloseSaveAsPopup();

            // Delete readonly properties
            angleData = angleInfoModel.DeleteReadOnlyAngleProperties(angleData);

            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CopyingAngleDetail, false);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.SetDisableProgressBar();

            var params = {};
            params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
            params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
            params[enumHandlers.PARAMETERS.REDIRECT] = 'no';
            var url = angleData.model + '/angles?' + jQuery.param(params);
            CreateDataToWebService(url, angleData)
                .done(function (data) {
                    // add edit mode to query
                    var query = {};
                    if (anglePageHandler.IsEditMode()) {
                        query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                    }

                    angleInfoModel.DeleteTemporaryAngle();
                    angleInfoModel.SetData(data);
                    var displayId = setting.CurrentDisplayId;
                    var display = data.display_definitions.findObject('id', displayId);
                    if (!display)
                        display = data.display_definitions[0];

                    jQuery.Deferred(function (rootPromise) {
                        /* BOF: M4-11698: Fixed added jump and save as didn't work correctly */
                        if (setting.HaveFollowup) {
                            display.authorizations = displayModel.GetDefaultAdhocAuthorization();
                            displayModel.LoadSuccess(display);
                            resultModel.PostResult()
                                .then(function () {
                                    return resultModel.GetResult(resultModel.Data().uri);
                                })
                                .then(function () {
                                    return displayModel.GetDefaultListFields(resultModel.Data());
                                })
                                .then(function (fields) {
                                    return displayModel.UpdateDisplay(display.uri, { fields: fields });
                                })
                                .done(function () {
                                    angleQueryStepModel.ExcuteParameters(null);

                                    window.location.href = WC.Utility.GetAnglePageUri(data.uri, display.uri, query);
                                    rootPromise.resolve();
                                });
                            /* EOF: M4-11698: Fixed added jump and save as didn't work correctly */
                        }
                        else {
                            // do not get angle
                            displayModel.LoadSuccess(display);
                            historyModel.LastDisplayUri(display.uri);

                            // always post a new result
                            resultModel.Data(null);

                            angleQueryStepModel.ExcuteParameters(null);

                            // redirect to new angle & display
                            window.location.href = WC.Utility.GetAnglePageUri(data.uri, display.uri, query);
                            rootPromise.resolve();
                        }
                    })
                    .done(function () {
                        toast.MakeSuccessTextFormatting(angleInfoModel.Name(), Localization.Toast_SaveItem);
                    });
                });
        };

        delete angleData.uri;
        angleData.id = 'a' + jQuery.GUID().replace(/-/g, '');
        angleData.is_validated = false;
        angleData.is_template = false;
        angleData.user_specific = { is_starred: false };
        angleData.is_published = false;
        angleData.display_definitions = [];
        /* BOF: M4-11698: Fixed added jump and save as didn't work correctly */
        if (setting.HaveFollowup) {
            displayQueryBlockModel.QuerySteps.removeAll();
            displayQueryBlockModel.TempQuerySteps.removeAll();
            displayModel.Data().fields = [];
            displayModel.Data.commit();

            var display = displayModel.GenerateDefaultData(enumHandlers.DISPLAYTYPE.LIST);
            jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
                display.fields.push({
                    field: fieldId,
                    field_details: JSON.stringify(displayModel.GetFieldSettings()),
                    valid: true
                });
            });
            display.id = 'd' + jQuery.GUID().replace(/-/g, '');
            display.is_angle_default = true;
            display.user_specific.is_user_default = false;
            angleData.display_definitions.push(display);
            angleData.angle_default_display = display.id;
            createSaveAsAngle({ HaveFollowup: true, CurrentDisplayId: display.id });
            /* EOF: M4-11698: Fixed added jump and save as didn't work correctly */
        }
        else {
            // M4-12106: Error returned after delete display
            // angleInfoModel.Data().display_definitions -> ko.toJS(angleInfoModel.Data().display_definitions)
            var currentDisplayId = null, defaultDisplayId = null, newDisplayId;
            var displayDefinitions = ko.toJS(setting.DisplayDefinitions.length ? setting.DisplayDefinitions : angleInfoModel.Data().display_definitions);
            jQuery.each(displayDefinitions, function (index, display) {
                display.__id = display.id;
                newDisplayId = 'd' + jQuery.GUID().replace(/-/g, '');
                if (index === 0 || display.is_angle_default) {
                    defaultDisplayId = newDisplayId;
                }
                if (display.uri === displayModel.Data().uri) {
                    currentDisplayId = newDisplayId;
                }
                display.id = newDisplayId;
                display.is_public = false;

                delete display.uri;
                delete display.is_angle_default;
                /* M4-12356: Removed count's source_field */
                for (var block = 0; block < display.query_blocks.length; block++) {
                    for (var loop = 0; loop < display.query_blocks[0].query_steps.length; loop++) {
                        if (display.query_blocks[0].query_steps[loop].step_type === enumHandlers.FILTERTYPE.AGGREGATION) {
                            for (var i = 0; i < display.query_blocks[0].query_steps[loop].aggregation_fields.length; i++) {
                                if (display.query_blocks[0].query_steps[loop].aggregation_fields[i].field === enumHandlers.AGGREGATION.COUNT.Value) {
                                    delete display.query_blocks[0].query_steps[loop].aggregation_fields[i].source_field;
                                }
                            }
                        }
                    }
                }
                angleData.display_definitions.push(display);
            });
            jQuery.each(angleData.display_definitions, function (index, display) {
                var displayDetails = WC.Utility.ParseJSON(display.display_details);
                if (displayDetails.drilldown_display) {
                    var drilldownTargetDisplay = angleData.display_definitions.findObject('__id', displayDetails.drilldown_display);
                    if (drilldownTargetDisplay) {
                        displayDetails.drilldown_display = drilldownTargetDisplay.id;
                    }
                    else {
                        delete displayDetails.drilldown_display;
                    }
                    display.display_details = ko.toJSON(displayDetails);
                }
            });
            if (!currentDisplayId) {
                var currentDisplay = ko.toJS(displayModel.Data());

                currentDisplay.id = 'd' + jQuery.GUID().replace(/-/g, '');
                currentDisplayId = currentDisplay.id;
                currentDisplay.is_public = false;

                delete currentDisplay.uri;
                delete currentDisplay.is_angle_default;
                angleData.display_definitions.push(currentDisplay);
            }
            angleData.angle_default_display = defaultDisplayId;
            createSaveAsAngle({ CurrentDisplayId: currentDisplayId });
        }
    };
    self.CanAddFilter = function () {
        if (resultModel.Data() && resultModel.Data().authorizations.add_filter
            && angleInfoModel.AllowMoreDetails()
            && angleInfoModel.CanUpdateAngle('query_definition')) {
            return true;
        }

        return false;
    };
    self.CanAddFollowup = function () {
        if (resultModel.Data() && resultModel.Data().authorizations.add_followup
            && !anglePageHandler.HandlerValidation.Angle.InvalidBaseClasses
            && angleInfoModel.CanUpdateAngle('query_definition')) {
            return true;
        }

        return false;
    };
    self.IsSaveAs = function () {
        return jQuery('#popupSaveAs').is(':visible');
    };

    // M4-12392: WC: Angle Details window doesn't close after add follow up and save
    // - add flag showDisplayPopupAfterSave
    self.SaveAdhocAngle = function (angleData, showDisplayPopupAfterSave) {
        if (typeof showDisplayPopupAfterSave === 'undefined')
            showDisplayPopupAfterSave = false;

        // remove readonly properties
        angleData = angleInfoModel.DeleteReadOnlyAngleProperties(angleData);

        // clean name & description
        delete angleData.name;
        delete angleData.description;

        var params = {};
        params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        params[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        var url = angleData.model + '/angles?' + jQuery.param(params);
        return CreateDataToWebService(url, angleData)
            .done(function (data) {
                anglePageHandler.IsExecutingParameters = true;
                angleInfoModel.DeleteTemporaryAngle();
                var display = data.display_definitions.findObject('id', displayModel.Data().id);
                if (!display)
                    display = data.display_definitions[0];

                // M4-12392: WC: Angle Details window doesn't close after add follow up and save
                // - apply data to model
                angleInfoModel.SetData(data);
                displayModel.LoadSuccess(display);
                self.ClosePopup();

                /* M4-12528: Cannot add ask@execution after created new angle and save */
                historyModel.LastDisplayUri(display.uri);

                angleQueryStepModel.ExcuteParameters(null);

                anglePageHandler.CheckBeforeRender = true;
                anglePageHandler.DisableProgressbarCancelling = true;
                window.location.replace(WC.Utility.GetAnglePageUri(data.uri, display.uri));

                // build field setting if chart or pivot
                if (displayModel.Data().display_type !== enumHandlers.DISPLAYTYPE.LIST) {
                    setTimeout(function () {
                        fieldSettingsHandler.BuildFieldsSettings();
                        fieldSettingsHandler.BuildFieldsSettingsHtml();
                        if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                            pivotPageHandler.SetPivotCellHeader();
                        }
                    }, 1);
                }

                // M4-12392: WC: Angle Details window doesn't close after add follow up and save
                // - show display popup after followup
                if (showDisplayPopupAfterSave) {
                    setTimeout(function () {
                        displayDetailPageHandler.ShowPopup();
                    }, 100);
                }
            });
    };
    self.UpdateState = function (uri, state, forced, callback) {
        errorHandlerModel.Enable(false);
        var handleSaveStateError = function (xhr) {
            if (xhr.status === 404) {
                anglePageHandler.HandleNoneExistAngle();
            }
            else if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                progressbarModel.CancelFunction = jQuery.noop;
                var updateStateCallback = function (stateUri) {
                    angleInfoModel.UpdateState(stateUri, state, true)
                        .done(function () {
                            if (jQuery.isFunction(callback))
                                callback();
                        });
                };
                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, updateStateCallback, [uri]);
            }
            else {
                errorHandlerModel.BuildCustomAjaxError({ url: uri, type: 'PUT' }, xhr);
            }
        };
        return angleInfoModel.UpdateState(uri, state, forced)
            .fail(handleSaveStateError)
            .always(errorHandlerModel.EnableErrorByDelay);
    };
    self.ManageSaveAngleState = function (option) {
        /*  M4-10057: Implement state transfers for angles/displays/dashboards
            6.Implemented is_template
        */
        var isTemplate = option.UpdateAngleJSON.is_template;
        var isSetTemplate = typeof isTemplate !== 'undefined';
        delete option.UpdateAngleJSON.is_template;

        var applySaveState = function () {
            self.ApplySave(option.OldQuerySteps, option.NewQuerySteps, option.OldFollowups, option.NewFollowups, option.UpdateAngleJSON);
        };

        if (jQuery.isEmptyObject(option.UpdateAngleJSON)) {
            // only update state
            return self.ManageSaveAngleStateWithoutData(isSetTemplate, isTemplate, applySaveState);
        }
        else {
            return self.ManageSaveAngleStateWithData(option.UpdateAngleJSON, isSetTemplate, isTemplate, applySaveState);
        }
    };
    self.ManageSaveAngleStateWithoutData = function (isSetTemplate, isTemplate, applySaveState) {
        if (isSetTemplate) {
            return self.UpdateState(angleInfoModel.Data().state, { is_template: isTemplate }, false, applySaveState)
                .done(applySaveState);
        }
        else {
            //M4-16535: if it is an empty object an not match with any cases then close the popup anyway
            self.ClosePopup();
        }
    };
    self.ManageSaveAngleStateWithData = function (updateAngleJSON, isSetTemplate, isTemplate, applySaveState) {
        errorHandlerModel.Enable(false);
        var updateStateCallback = function () {
            var deferred = jQuery.Deferred();
            jQuery.when(isSetTemplate ? self.UpdateState(angleInfoModel.Data().state, { is_template: isTemplate }, true) : null)
                .done(function () {
                    applySaveState();
                })
                .always(function () {
                    deferred.resolve();
                });
            return deferred.promise();
        };

        return angleInfoModel.UpdateAngle(angleInfoModel.Data().uri, updateAngleJSON)
            .then(updateStateCallback)
            .fail(function (xhr) {
                self.ErrorManageSaveAngleStateWithData(xhr, updateAngleJSON, updateStateCallback);
            })
            .always(errorHandlerModel.EnableErrorByDelay);
    };
    self.ErrorManageSaveAngleStateWithData = function (xhr, updateAngleJSON, updateStateCallback) {
        if (xhr.status === 404) {
            anglePageHandler.HandleNoneExistAngle();
        }
        else if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
            var resolveAngleDisplayCallback = function () {
                angleInfoModel.UpdateAngle(angleInfoModel.Data().uri, updateAngleJSON, true)
                    .done(updateStateCallback);
            };
            resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, resolveAngleDisplayCallback);
        }
        else {
            errorHandlerModel.BuildCustomAjaxError({ url: angleInfoModel.Data().uri, type: 'PUT' }, xhr);
        }
    };
    self.ReInitialQuerySteps = function () {
        var tempQuerySteps = self.HandlerFilter.GetData();

        anglePageHandler.ApplyExecutionAngle();

        angleQueryStepModel.TempQuerySteps(tempQuerySteps);
        self.HandlerFilter.SetData(tempQuerySteps);
        self.HandlerFilter.ReApplyHandler();
    };
    /* BOF: M4-11698: Fixed added jump and save as didn't work correctly */
    self.IsChangedFollowup = function () {
        var oldQuerySteps = ko.toJS(jQuery.grep(angleInfoModel.Data().query_definition, function (queryDefinition) { return queryDefinition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS; }));
        var currentFollowups = ko.toJS(angleQueryStepModel.GetFollowupQueryStep(null, true));
        var oldFollowups = !oldQuerySteps.length ? [] : oldQuerySteps[0].query_steps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);

        jQuery.each(currentFollowups, function (index) {
            WC.ModelHelper.RemoveReadOnlyQueryStep(currentFollowups[index]);
        });
        jQuery.each(oldFollowups, function (index) {
            WC.ModelHelper.RemoveReadOnlyQueryStep(oldFollowups[index]);
        });

        if (currentFollowups.length + oldFollowups.length) {
            return !jQuery.deepCompare(oldFollowups, currentFollowups, false, false);
        }
        else {
            return false;
        }
    };
    /* EOF: M4-11698: Fixed added jump and save as didn't work correctly */
}
