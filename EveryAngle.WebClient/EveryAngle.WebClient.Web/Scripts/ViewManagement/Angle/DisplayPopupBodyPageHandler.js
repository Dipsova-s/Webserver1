var displayDetailPageHandler = new DisplayDetailPageHandler();

function DisplayDetailPageHandler() {
    "use strict";

    var self = this;
    self.ID = 'DisplayDetail';
    self.IsSubmit = false;
    self.Type = 'Display';
    self.PopupElement = null;
    self.SelectTab = null;
    self.DrilldownDisplay = ko.observable('');
    self.IsQuickSave = false;
    self.HandlerFilter = null;
    self.HandlerInfoDetails = null;
    self.HandlerLanguages = null;
    self.HandlerLanguagesSaveAs = null;
    self.TempQuerySteps = [];
    self.IsCancelEdit = false;

    self.ShowPopup = function (selectedTab) {
        requestHistoryModel.SaveLastExecute(self, self.ShowPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        self.IsQuickSave = false;

        self.SelectTab = selectedTab || 'DisplayGeneral';

        self.IsSubmit = false;
        var popupSettings = {
            element: '#popup' + self.ID,
            title: Localization.DisplayDetails,
            html: displayDetailHtmlTemplate(),
            className: 'popup' + self.ID + ' popupWithTabMenu',
            width: 880,
            minWidth: 748,
            minHeight: 370,
            buttons: self.GetPopupButtons(),
            resize: self.OnPopupResize,
            open: function (e) {
                e.sender.wrapper.parent().find('.k-window-action').css('visibility', 'hidden');
                SetLoadingVisibility('.popupDisplayDetail .loading16x16', false);
                self.ShowPopupCallback(e.sender);
            },
            close: self.OnPopupClose
        };

        // set buttons
        self.SetPopupButtonsStatus(popupSettings);

        self.PopupElement = popup.Show(popupSettings);
    };
    self.ShowPopupCallback = function (win) {
        self.PopupElement = win;

        win.element.css('overflow', 'hidden').busyIndicator(true);
        win.element.find('.popupTabMenu, .popupTabPanel').css('visibility', 'hidden');

        // title bar
        win.wrapper.find('.k-window-titlebar .displayPopupHeader').remove();
        win.wrapper.find('.k-window-title').after(WC.WidgetDetailsView.TemplateDisplayInfoPopupHeader);

        var deferred = [systemLanguageHandler.LoadLanguages()];
        jQuery.whenAll(deferred)
            .done(function () {
                if (jQuery('#tempDisplayType').length) {
                    var ddlData = jQuery.map(enumHandlers.DISPLAYTYPE, function (value) {
                        return {
                            text: Localization['DisplayType_' + value],
                            value: value
                        };
                    });
                    WC.HtmlHelper.DropdownList('#tempDisplayType', ddlData, {
                        dataTextField: 'text',
                        dataValueField: 'value',
                        change: function (e) {
                            e.sender.wrapper.find('.k-input').attr('class', 'k-input k-with-icon ' + e.sender.value());
                        },
                        dataBound: function (e) {
                            var list = e.sender.list,
                                wrapper = e.sender.wrapper;
                            list.find('.k-item').each(function (k, v) {
                                jQuery(v).addClass('k-with-icon ' + ddlData[k].value);
                            });
                            wrapper.find('.k-input').attr('class', 'k-input k-with-icon ' + e.sender.value());
                        }
                    });
                }

                self.SetDefaultDrilldownDropdown();

                win.element.scroll(function () {
                    jQuery('[data-role="dropdownlist"]', this).each(function () {
                        WC.HtmlHelper.DropdownList(this).close();
                    });
                });

                self.InitialLanguages();

                self.PrepareDefinitions(win);

                WC.HtmlHelper.ApplyKnockout(displayModel, win.wrapper);

                setTimeout(function () {
                    win.wrapper.parent().find(".k-window-action").css("visibility", "visible");
                    self.TabClick(self.SelectTab);
                    self.CheckExecuted();

                    win.element.css('overflow', '').busyIndicator(false);
                    win.element.find('.popupTabMenu, .popupTabPanel').css('visibility', '');
                }, 1000);
            });
    };
    self.GetPopupButtons = function () {
        return [
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
                text: Localization.SaveAs,
                position: 'right',
                isPrimary: true,
                className: displayModel.IsNewDisplay() ? 'alwaysHide' : 'executing',
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj) && self.CheckDisplayValidation(false)) {
                        self.ExecuteSave(true);
                    }
                }
            },
            {
                text: Localization.Save,
                position: 'right',
                isPrimary: true,
                className: 'executing',
                click: function (e, obj) {
                    if (popup.CanButtonExecute(obj) && self.CheckDisplayValidation(true)) {
                        self.ExecuteSave(false);
                    }
                }
            }
        ];
    };
    self.SetPopupButtonsStatus = function (popupSettings) {
        anglePageHandler.UpdateAngleDisplayValidation();
        var btnSave = popupSettings.buttons.findObject('text', Localization.Save);
        var btnSaveAs = popupSettings.buttons.findObject('text', Localization.SaveAs);

        if (displayModel.IsTemporaryDisplay() && !userModel.CanSaveDisplays(angleInfoModel.Data().model)) {
            btnSave.className = 'disabled';
        }

        if (anglePageHandler.HandlerValidation.Angle.InvalidBaseClasses) {
            btnSaveAs.className = 'alwaysHide';
        }
        else if (!angleInfoModel.Data().authorizations.create_private_display
            || !angleInfoModel.AllowMoreDetails()) {
            btnSaveAs.className = 'disabled';
        }
    };
    self.OnPopupResize = function (e) {
        var winWidth = e.sender.element.width();
        var winHeight = e.sender.element.height();

        self.AdjustDefaultDrilldownDropdownLayout();

        var filterWrapper = e.sender.wrapper.find('.definitionArea .definitionList');
        if (filterWrapper.length) {
            e.sender.wrapper.find('.k-window-titlebar .displayName').css('max-width', winWidth - 300);

            if (self.HandlerLanguages) {
                var editor = self.HandlerLanguages.EditorDescription;
                if (editor && editor.wrapper.is(':visible')) {
                    editor.wrapper.find('.k-editable-area').height('100%');
                    var otherAreasize = e.sender.element.find('.rowDefaultDrilldownDisplay').outerHeight();
                    otherAreasize += e.sender.element.find('.rowDisplayId').outerHeight() || 0;
                    otherAreasize += 40;
                    var editorHeight = winHeight - (editor.wrapper.offset().top - e.sender.element.offset().top) - otherAreasize;
                    self.HandlerLanguages.SetEditorHeight(editorHeight);
                }
            }

            if (filterWrapper.is(':visible')) {
                filterWrapper.find('.FilterHeader p label').css('max-width', filterWrapper.width() - 145);

                var height = winHeight - (filterWrapper.offset().top - e.sender.element.offset().top) - 125;
                e.sender.wrapper.find('.defInfoWrapper').height(height + 72);
                filterWrapper.css('max-height', height + 70);
            }

            if (self.HandlerFilter) {
                self.HandlerFilter.View.AdjustLayout();
            }

            var angleFilters = jQuery('#AngleFilters');
            if (angleFilters.length) {
                var tabHeight = jQuery('#DisplayTabs').height();
                var angleFilterHeight = winHeight - tabHeight + 15;
                angleFilters.css({
                    top: tabHeight,
                    height: angleFilterHeight
                });
                angleFilters.find('.definitionList').css('max-height', angleFilterHeight - 56);
            }
        }
    };
    self.OnPopupClose = function (e) {
        self.PopupElement = null;
        self.SelectTab = null;
        self.HandlerFilter = null;
        self.HandlerInfoDetails = null;
        self.HandlerLanguages = null;
        self.MovedToAngleFilters = [];

        if (!self.IsSubmit) {
            self.ResetAll();
            if (displayModel.IsTemporaryDisplay() && !displayModel.Data().display_type) {
                displayModel.DeleteTemporaryDisplay(displayModel.Data().uri);

                var redirectDisplayUri = jQuery('#DisplayItemList .ItemListSelected').attr('alt'),
                    redirectDisplayData = redirectDisplayUri ? displayModel.GetDisplayByUriFromDisplayDefinitions(redirectDisplayUri) : null;
                if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
                    WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY, redirectDisplayUri);
                }
                else if (redirectDisplayData) {
                    displayModel.DeleteTemporaryDisplay(displayModel.Data().uri, redirectDisplayUri);
                }
                else {
                    history.back();
                }
            }
        }

        setTimeout(function () {
            e.sender.destroy();
        }, 200);
    };
    self.ClosePopup = function () {
        popup.Close('#popupDisplayDetail');
    };
    self.SetDefaultDrilldownDropdown = function () {
        var displaysFromDropdown = ko.toJS(displayModel.DisplayInfo.Displays());
        var dislayDetails = displayModel.GetDisplayDetails();
        var hasDrillDownDisplay = displaysFromDropdown.hasObject('Id', dislayDetails.drilldown_display);
        if (dislayDetails.drilldown_display && hasDrillDownDisplay) {
            self.DrilldownDisplay(dislayDetails.drilldown_display);
        }
        else {
            self.DrilldownDisplay('');
        }

        if (jQuery('#defaultDrilldownDisplay').length) {
            var emptydata = ko.toJS(displaysFromDropdown[0]);
            emptydata.DisplayTypeClassName = 'none';
            emptydata.ExtendDisplayTypeClassName = 'none';
            emptydata.FilterClassName = 'none';
            emptydata.PublicClassName = 'none';
            emptydata.ParameterizedClassName = 'none';
            emptydata.ValidClassName = 'none';
            emptydata.Name = Localization.None;
            emptydata.Uri = '';
            emptydata.Id = '';

            var ddlDrilldownData = [emptydata];
            jQuery.each(displaysFromDropdown, function (index, display) {
                if (display.DisplayType === enumHandlers.DISPLAYTYPE.CHART) {
                    var displayObject = display.Uri === displayModel.Data().uri ? ko.toJS(historyModel.Get(display.Uri)) : angleInfoModel.Data().display_definitions.findObject('uri', display.Uri);
                    var displayDetails = WC.Utility.ParseJSON(WC.Utility.GetObjectValue(displayObject, 'display_details'));
                    if (displayDetails.chart_type !== enumHandlers.CHARTTYPE.GAUGE.Code) {
                        ddlDrilldownData.push(display);
                    }
                }
                else {
                    ddlDrilldownData.push(display);
                }
            });

            var itemTemplate = [
                '<div class="displayNameContainer">',
                '<div class="front">',
                '<i class="icon #= data.PublicClassName #"></i>',
                '<i class="icon #= data.DisplayTypeClassName + \' \' + data.ExtendDisplayTypeClassName #"></i>',
                '<i class="icon #= data.FilterClassName #"></i>',
                '</div>',
                '<span class="name">#= data.Name #</span>',
                '<div class="rear">',
                '<i class="icon #= data.ParameterizedClassName #"></i>',
                '<i class="icon #= data.ValidClassName #"></i>',
                '</div>',
                '</div>'
            ].join('');

            var fbCheckDropdownOpen;
            var ddlDrilldown = WC.HtmlHelper.DropdownList('#defaultDrilldownDisplay', ddlDrilldownData, {
                dataTextField: 'Name',
                dataValueField: 'Id',
                value: self.DrilldownDisplay(),
                valueTemplate: itemTemplate,
                template: itemTemplate,
                open: function () {
                    clearTimeout(fbCheckDropdownOpen);
                    fbCheckDropdownOpen = setTimeout(self.AdjustDefaultDrilldownDropdownLayout, 250);
                },
                change: function (e) {
                    self.DrilldownDisplay(e.sender.value() || '');
                    self.AdjustDefaultDrilldownDropdownLayout();
                }
            });
            ddlDrilldown.list.addClass('displayNameDropdownList');
            self.AdjustDefaultDrilldownDropdownLayout();
            ddlDrilldown.enable(displayModel.Data().authorizations.update);
        }
    };
    self.AdjustDefaultDrilldownDropdownLayout = function () {
        var ddlDefaultDrilldown = WC.HtmlHelper.DropdownList('#defaultDrilldownDisplay');
        if (ddlDefaultDrilldown && ddlDefaultDrilldown.wrapper.is(':visible')) {
            WC.HtmlHelper.AdjustNameContainer(ddlDefaultDrilldown.wrapper);
            WC.HtmlHelper.AdjustNameContainer(ddlDefaultDrilldown.list);
        }
    };
    self.CheckDisplayValidation = function (checkAdhocAngle) {
        // unsave angle
        if (checkAdhocAngle && angleInfoModel.IsTemporaryAngle()) {
            popup.Alert(Localization.Warning_Title, Localization.ErrorCannotSaveDisplay);

            return false;
        }

        // languages
        jQuery.each(self.HandlerLanguages.Languages.List(), function (i, language) {
            language.language_name(jQuery.trim(language.language_name()));
        });
        var emptyLanguages = jQuery.grep(self.HandlerLanguages.Languages.List(), function (lang) { return lang.is_selected() && !lang.language_name(); });
        if (emptyLanguages.length) {
            self.HandlerLanguages.LanguageSetSelect(emptyLanguages[0]);
            self.HandlerLanguages.ElementName.addClass('k-invalid');
            self.TabClick('DisplayGeneral');

            return false;
        }

        // default display
        if (angleInfoModel.IsPublished() && jQuery('#PrivateDisplayCheckbox').is(':checked') && jQuery('#IsDefaultDisplay').is(':checked')) {
            self.TabClick('DisplayGeneral');
            popup.Alert(Localization.Warning_Title, Localization.Info_CannotSetPrivateDisplayToDefaultDisplay);
            return false;
        }

        // display id
        if (/^[a-z,_](\w*)$/i.test(jQuery('#DisplayId').val()) === false) {
            popup.Alert(Localization.Warning_Title, Localization.Info_InvalidDisplayID);
            self.TabClick('DisplayGeneral');

            return false;
        }

        // others steps
        if (self.HandlerFilter) {
            var checkValidArgument = validationHandler.CheckValidExecutionParameters(self.HandlerFilter.GetData(), angleInfoModel.Data().model);
            if (!checkValidArgument.IsAllValidArgument) {
                popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
                self.TabClick('DisplayFilter');

                return false;
            }
        }

        return true;
    };
    self.ExecuteSave = function (isCopy) {
        self.IsSubmit = true;
        if (isCopy) {
            self.ShowSaveAsPopup(!displayModel.IsTemporaryDisplay());
        }
        else {
            self.Save();
        }
    };
    self.ShowInfoPopup = function () {
        var popupName = 'DisplayInfo',
            popupSettings = {
                element: '#popup' + popupName,
                title: Localization.DisplayDetails,
                appendTo: 'body',
                className: 'popup' + popupName,
                minWidth: 748,
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
                    e.sender.wrapper.find('.k-window-titlebar .displayName').css('max-width', winWidth - 280);

                    if (self.HandlerInfoDetails) {
                        self.HandlerInfoDetails.AdjustLayout();
                    }
                },
                open: function (e) {
                    var descriptionData = ko.toJS(anglePageHandler.HandlerDisplayDetails.Data.Description()),
                        queryBlocksData = ko.toJS(anglePageHandler.HandlerDisplayDetails.Data.QueryBlocks());
                    self.HandlerInfoDetails = new WidgetDetailsHandler(e.sender.element, descriptionData, queryBlocksData, []);
                    self.HandlerInfoDetails.Angle = angleInfoModel.Data();
                    self.HandlerInfoDetails.ModelUri = angleInfoModel.Data().model;
                    self.HandlerInfoDetails.IsVisibleModelRoles(false);
                    self.HandlerInfoDetails.ApplyHandler();
                    self.HandlerInfoDetails.AdjustLayout();

                    e.sender.wrapper.find('.k-window-title').after(WC.WidgetDetailsView.TemplateDisplayInfoPopupHeader);
                    WC.HtmlHelper.ApplyKnockout(displayModel, e.sender.wrapper.find('.displayPopupHeader'));
                    setTimeout(function () {
                        e.sender.element.find('.removable').addClass('disabled');
                    }, 100);
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

        jQuery('#DisplayTabs li').removeClass('Selected');
        jQuery('#' + elementId).addClass('Selected');
        jQuery('#DisplayArea > div').removeClass('Selected');
        jQuery('#' + elementId + 'Area').addClass('Selected');

        jQuery('#AngleFilters').hide();

        if (elementId === 'DisplayGeneral') {
            win.trigger('resize');
            setTimeout(function () {
                if (self.HandlerLanguages) {
                    self.HandlerLanguages.RefreshEditor();
                }
            }, 10);
        }
        else if (elementId === 'DisplayFilter') {
            jQuery('#AngleFilters').show();
            win.trigger('resize');
        }
    };

    var addToNewAngleNames = [];
    self.ShowSaveAsPopup = function (appendCopytext) {
        requestHistoryModel.SaveLastExecute(self, self.ShowSaveAsPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        // check Angle has a business process
        if (angleInfoModel.IsTemporaryAngle() && jQuery.isEmptyObject(angleDetailPageHandler.GetActiveBusinessProcesses())) {
            self.ShowSaveBusinessProcessPopup(appendCopytext);
            return;
        }

        if (typeof appendCopytext === 'undefined')
            appendCopytext = true;

        popup.Show(self.GetSaveAsPopupOption(appendCopytext));
    };
    self.ShowSaveAsPopupCallback = function (e, appendCopytext) {
        // set focus to General tab
        self.TabClick('DisplayGeneral');

        var deferred = [systemLanguageHandler.LoadLanguages()];
        jQuery.whenAll(deferred)
            .done(function () {
                // collect data
                var baseLanguages;
                var multiLangNames = [];
                var multiLangDescriptions = [];
                if (self.IsQuickSave) {
                    jQuery.each(displayModel.Data().multi_lang_name, function (index, name) {
                        multiLangNames.push({
                            text: appendCopytext ? name.text.substr(0, 248) + ' (copy)' : name.text.substr(0, 255),
                            lang: name.lang
                        });

                        var description = displayModel.Data().multi_lang_description.findObject('lang', name.lang);
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
                    baseLanguages = ko.toJS(self.HandlerLanguages.Languages.List);
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
                self.HandlerLanguagesSaveAs.Labels.LabelLanguageName = Localization.DisplayName;
                self.HandlerLanguagesSaveAs.ShowDescription(false);
                self.HandlerLanguagesSaveAs.ApplyHandler();

                if (!self.IsQuickSave) {
                    jQuery.each(self.HandlerLanguagesSaveAs.Languages.List(), function (index, lang) {
                        lang.is_selected(baseLanguages[index].is_selected);
                    });
                }

                // option "add to new angle"
                var appendAngleCopyText = !angleInfoModel.IsTemporaryAngle();
                addToNewAngleNames = [];
                jQuery.each(angleInfoModel.Data().multi_lang_name, function (index, name) {
                    addToNewAngleNames.push({
                        lang: name.lang,
                        text: appendAngleCopyText ? name.text.substr(0, 248) + ' (copy)' : name.text.substr(0, 248)
                    });
                });
                if (angleDetailPageHandler.CanSaveAsAngle()) {
                    self.HandlerLanguagesSaveAs.LanguageSetSelectCallback = function (model) {
                        var angleName = addToNewAngleNames.findObject('lang', model.id);
                        var angleNameText = angleName ? angleName.text : '';

                        jQuery('#rowAddToNewAngleName .languageAngleName').val(angleNameText).data('lang', model.id);
                    };
                    self.HandlerLanguagesSaveAs.LanguageAddCallback = function (model) {

                        var languageName = addToNewAngleNames.findObject('lang', model.id);
                        if (!languageName) {
                            addToNewAngleNames.push({
                                lang: model.id,
                                text: ''
                            });
                        }
                    };
                    self.HandlerLanguagesSaveAs.LanguageDeleteCallback = function (model) {
                        addToNewAngleNames.removeObject('lang', model.id);
                    };

                    e.sender.element.append([
                        '<div class="row rowAddToNewAngle">',
                        '<label>',
                        '<input type="checkbox" id="IsAddToNewAngle" onchange="displayDetailPageHandler.EnableAddToNewAngle(this.checked)" />',
                        '<span class="label">' + Localization.AddToNewAngle + '</span>',
                        '</label>',
                        '</div>',
                        '<div id="rowAddToNewAngleName" class="row alwaysHide">',
                        '<div class="field">' + Localization.AngleName + '</div>',
                        '<div class="input"><input class="eaText eaTextSize40 languageAngleName" onkeyup="displayDetailPageHandler.UpdateAddToNewAngleName(this)" /></div>',
                        '</div>'
                    ].join(''));


                    self.HandlerLanguagesSaveAs.Element.find('.Focus > a').trigger('click');

                    // force a user to save as adhoc-Angle
                    if (angleInfoModel.IsTemporaryAngle()) {
                        jQuery('#IsAddToNewAngle').prop('checked', true);
                        jQuery('#IsAddToNewAngle').prop('disabled', true);
                        displayDetailPageHandler.EnableAddToNewAngle(true);
                        e.sender.element.append('<div class="row"><div class="field"></div><div class="input infoText">' + Localization.Info_OnlyDisplayWillBeCreated + '</div></div>');
                    }
                }

                // check valid display
                anglePageHandler.UpdateAngleDisplayValidation();
                var isDisplayInvalid = !anglePageHandler.HandlerValidation.Display.Valid;
                if (isDisplayInvalid) {
                    e.sender.element.append('<div class="row warningMessage">' + Localization.Info_SaveAsDisplayWarning + '</div>');
                }
                e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
            });
    };
    self.CloseSaveAsPopup = function () {
        popup.Close('#popupSaveAs');
    };
    self.GetSaveAsPopupOption = function (appendCopytext) {
        var popupName = 'SaveAs';
        return {
            element: '#popup' + popupName,
            title: Localization.SaveAs,
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
                        if (popup.CanButtonExecute(obj) && self.CheckSaveAsValidation()) {
                            self.SaveAsDisplay(jQuery('#IsAddToNewAngle').is(':checked'));
                        }
                    }
                }
            ],
            resizable: false,
            actions: ["Close"],
            open: function (e) {
                self.ShowSaveAsPopupCallback(e, appendCopytext);
            },
            close: function (e) {
                setTimeout(function () {
                    e.sender.destroy();
                }, 500);
            }
        };
    };
    self.CheckSaveAsValidation = function () {
        var emptyLanguages = jQuery.grep(self.HandlerLanguagesSaveAs.Languages.List(), function (lang) { return lang.is_selected() && !lang.language_name(); });
        if (emptyLanguages.length) {
            self.HandlerLanguagesSaveAs.LanguageSetSelect(emptyLanguages[0]);
            self.HandlerLanguagesSaveAs.ElementName.addClass('k-invalid');

            return false;
        }

        if (jQuery('#IsAddToNewAngle').is(':checked')) {
            var emptyAngleLanguages = jQuery.grep(addToNewAngleNames, function (name) { return !name.text; });
            if (emptyAngleLanguages.length) {
                var modelLanguages = jQuery.grep(self.HandlerLanguagesSaveAs.Languages.List(), function (lang) { return lang.is_selected() && lang.id === emptyAngleLanguages[0].lang; });
                if (modelLanguages.length) {
                    self.HandlerLanguagesSaveAs.LanguageSetSelect(modelLanguages[0]);
                    self.HandlerLanguagesSaveAs.Element.find('.languageAngleName').addClass('k-invalid').focus();
                }
                return false;
            }
        }

        return true;
    };
    self.EnableAddToNewAngle = function (isChecked) {
        if (isChecked) {
            jQuery('#rowAddToNewAngleName').removeClass('alwaysHide');
            jQuery('#rowAddToNewAngleName .languageAngleName').focus();
        }
        else {
            jQuery('#rowAddToNewAngleName').addClass('alwaysHide');
        }
    };
    self.UpdateAddToNewAngleName = function (element) {
        element = jQuery(element);
        var angleName = addToNewAngleNames.findObject('lang', element.data('lang'));
        if (angleName) {
            angleName.text = element.val();
        }

        element.removeClass('k-invalid');
    };
    self.IsSaveAs = function () {
        return jQuery('#popupSaveAs').is(':visible');
    };
    self.CheckDefaultAngleDisplay = function (element) {
        if (displayModel.Data().is_public && element.checked && angleInfoModel.IsPublished()) {
            var publicDisplays = angleInfoModel.Data().display_definitions.findObjects('is_public', true);
            if (publicDisplays.length === 1) {
                popup.Alert(Localization.Warning_Title, Localization.Info_RequiredPublicDisplayBeforePublishedAngle);
                element.checked = false;
            }
        }
    };
    self.ShowSaveBusinessProcessPopup = function (appendCopytext) {
        // adhoc Angle without BPs will prompt a user to select some business processes
        var template = Localization.Info_RequiredBusinessProcessForAngle + '<div id="SaveAngleBusinessProcesses" style="margin-top: 5px;" />';
        var closePopup = function (e) {
            e.wrapper.removeClass('popupSaveDisplayAsBusinessProcess');
            e.close();
        };
        var options = {
            buttons: [{
                text: Captions.Button_Cancel,
                position: 'right',
                click: function (e) {
                    closePopup(e.kendoWindow);
                }
            }, {
                text: Localization.Ok,
                isPrimary: true,
                className: 'btnSaveBusinessProcess disabled',
                click: function (e, saveButton) {
                    if (popup.CanButtonExecute(saveButton)) {
                        self.SetBusinessProcessesSaveDisplayAs();
                        self.ShowSaveAsPopup(appendCopytext);
                        closePopup(e.kendoWindow);
                    }
                },
                position: 'right'
            }]
        };
        var popupSaveBusinessProcess = popup.Alert(Localization.SaveAs, template, options);
        setTimeout(function () {
            popupSaveBusinessProcess.wrapper.addClass('popupSaveDisplayAsBusinessProcess');
        }, 100);

        // set up priviledge
        businessProcessesModel.SaveDisplayAsBusinessProcess = new BusinessProcessesViewModel();
        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(angleInfoModel.Data().model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.SaveDisplayAsBusinessProcess, modelPrivileges, angleInfoModel.IsPublished());

        // create businessprocess
        businessProcessesModel.SaveDisplayAsBusinessProcess.CurrentActive({});
        businessProcessesModel.SaveDisplayAsBusinessProcess.ClickCallback(function () {
            if (businessProcessesModel.SaveDisplayAsBusinessProcess.GetActive().length)
                jQuery('.btnSaveBusinessProcess').removeClass('disabled');
            else
                jQuery('.btnSaveBusinessProcess').addClass('disabled');
        });
        businessProcessesModel.SaveDisplayAsBusinessProcess.Layout(businessProcessesModel.SaveDisplayAsBusinessProcess.LAYOUT.NORMAL);
        businessProcessesModel.SaveDisplayAsBusinessProcess.ReadOnly(false);
        businessProcessesModel.SaveDisplayAsBusinessProcess.MultipleActive(true);
        businessProcessesModel.SaveDisplayAsBusinessProcess.CanEmpty(false);
        businessProcessesModel.SaveDisplayAsBusinessProcess.ApplyHandler('#SaveAngleBusinessProcesses');
    };
    self.GetNoneBusinessProcesses = function () {
        var bpData = WC.Utility.ToArray(businessProcessesModel.SaveDisplayAsBusinessProcess.Data());
        var noneBusinessProcessLabels = [];
        jQuery.each(angleInfoModel.Data().assigned_labels, function (index, label) {
            if (!bpData.hasObject('id', label, false))
                noneBusinessProcessLabels.push(label);
        });
        return noneBusinessProcessLabels;
    };
    self.SetBusinessProcessesSaveDisplayAs = function () {
        var activeBPs = businessProcessesModel.SaveDisplayAsBusinessProcess.GetActive();
        var noneBusinessProcessLabels = self.GetNoneBusinessProcesses();
        angleInfoModel.Data().assigned_labels = noneBusinessProcessLabels.concat(activeBPs);
        angleInfoModel.Data.commit();
    };

    // BOF: Display General Tab
    self.InitialLanguages = function () {
        // languages
        var displayData = displayModel.Data();
        self.TabClick('DisplayGeneral');
        self.HandlerLanguages = new WidgetLanguagesHandler('#DisplayDescriptionSection', displayData.multi_lang_name, displayData.multi_lang_description);
        self.HandlerLanguages.Labels.LabelLanguageName = Localization.DisplayName;
        self.HandlerLanguages.CanChangeLanguage = function () {
            return displayModel.Data().authorizations.update;
        };
        self.HandlerLanguages.ApplyHandler();
    };
    //EOF: Display General Tab

    //BOF: Display filters tab
    self.MovedToAngleFilters = [];
    self.PrepareDefinitions = function (win) {
        self.MovedToAngleFilters = [];

        // display filters
        var canUpdateAngle = angleInfoModel.CanUpdateAngle('query_definition');
        self.HandlerFilter = new WidgetFilterHandler(win.element.find('[id="FilterWrapper"]'), []);
        self.HandlerFilter.ModelUri = angleInfoModel.Data().model;
        self.HandlerFilter.Data(displayQueryBlockModel.TempQuerySteps());
        self.HandlerFilter.HasExecutionParameter(true);
        self.HandlerFilter.FilterFor = self.HandlerFilter.FILTERFOR.DISPLAY;
        if (!angleInfoModel.IsTemporaryAngle() && canUpdateAngle) {
            self.HandlerFilter.View.MoveFilterConfirmMessage = Localization.Info_ConfirmDropFilterToAngleDefinition;
            self.HandlerFilter.View.CreateMovableArea = function () {
                var angleFilterElement = jQuery('#DisplayFilterMoveArea');
                if (!angleFilterElement.length) {
                    angleFilterElement = jQuery('<div id="DisplayFilterMoveArea" class="alwaysHide">' + Localization.Info_DropFilterToAngleDefinition + '</div>').appendTo('#DisplayFilterArea');
                }
                return angleFilterElement;
            };
            self.HandlerFilter.View.OnFilterMoved = function (queryStep) {
                self.MovedToAngleFilters.push(queryStep);
            };
        }
        self.HandlerFilter.ApplyHandler();

        var angleBaseClassBlock = angleInfoModel.Data().query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        self.HandlerFilter.SetFieldChoooserInfo(angleBaseClassBlock ? angleBaseClassBlock.base_classes : [], angleQueryStepModel.QuerySteps());
    };
    self.ShowAddFilterPopup = function (model, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            var angleBlocks = angleInfoModel.Data().query_definition;
            var angleBaseClassBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            fieldsChooserHandler.ModelUri = angleInfoModel.Data().model;
            fieldsChooserHandler.AngleClasses = angleBaseClassBlock ? angleBaseClassBlock.base_classes : [];
            fieldsChooserHandler.AngleSteps = angleQueryStepModel.QuerySteps();
            fieldsChooserHandler.DisplaySteps = self.HandlerFilter.GetData();
            fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, enumHandlers.ANGLEPOPUPTYPE.DISPLAY, self.HandlerFilter);
        }
    };
    self.ShowFollowupPopup = function (option, model, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            followupPageHandler.HandlerFilter = self.HandlerFilter;
            followupPageHandler.ShowPopup(option);
        }
    };
    self.CanAddFilters = function () {
        var canAddFilters = false;
        if (displayModel.Data().authorizations.update
            && resultModel.Data().authorizations.add_filter) {
            canAddFilters = true;
        }

        return canAddFilters;
    };
    self.CanAddFollowups = function () {
        var canAddFollowups = false;

        if (!anglePageHandler.HandlerValidation.Angle.InvalidBaseClasses
            && displayModel.Data().authorizations.update
            && resultModel.Data().authorizations.add_followup) {
            canAddFollowups = true;
        }

        if ((displayModel.IsNewDisplay()) && (!angleInfoModel.AllowFollowups()))
            canAddFollowups = false;

        return canAddFollowups;
    };
    //EOF: Display filters tab

    self.CurrentData = function (fieldSettings) {
        var data = {};
        var displayDetails = displayModel.GetDisplayDetails();

        if (!self.IsQuickSave) {
            data.is_angle_default = jQuery('#IsDefaultDisplay').is(':checked');
            data.is_public = !jQuery('#PrivateDisplayCheckbox').is(':checked');
            var userSpecificObject = {};
            userSpecificObject.execute_on_login = jQuery('#ExecuteDisplayAtLogin').is(':checked');
            userSpecificObject.is_user_default = jQuery('#PersonalDefaultDisplay').is(':checked');
            data.user_specific = userSpecificObject;
            if (jQuery('#DisplayId').length)
                data.id = jQuery.trim(jQuery('#DisplayId').val());
            if (self.DrilldownDisplay()) {
                displayDetails.drilldown_display = self.DrilldownDisplay();
            }
            else {
                delete displayDetails.drilldown_display;
            }
        }

        /* M4-13938: Fixed when save display from ad-hoc display's name didn't save */
        if (!self.IsQuickSave || self.IsSaveAs()) {
            data.multi_lang_name = [];
            data.multi_lang_description = [];
            var languagesHandler = self.IsSaveAs() ? self.HandlerLanguagesSaveAs : self.HandlerLanguages;
            if (languagesHandler) {
                jQuery(ko.toJS(languagesHandler.Languages.List())).each(function (index, language) {
                    if (language.is_selected) {
                        data.multi_lang_name.push({ lang: language.id, text: language.language_name.substr(0, 255) });
                        data.multi_lang_description.push({ lang: language.id, text: language.language_description });
                    }
                });
            }
        }

        if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.LIST) {
            data.fields = ko.toJS(displayModel.Data().fields);
        }
        else if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            if (!IsNullOrEmpty(fieldSettings)) {
                displayDetails.layout = fieldSettings.Layout;
                displayDetails.show_total_for = fieldSettings.TotalForType;
                displayDetails.percentage_summary_type = fieldSettings.PercentageSummaryType;
                displayDetails.include_subtotals = fieldSettings.IsIncludeSubTotals;
                if (fieldSettings.SortBySummaryInfo && fieldSettings.SortBySummaryInfo.length > 0) {
                    var isCanRemoveSummaryInfo = true;
                    jQuery.each(fieldSettings.SortBySummaryInfo, function (index, sortBySummaryInfoItem) {
                        if (sortBySummaryInfoItem.sort_direction !== '') {
                            isCanRemoveSummaryInfo = false;
                            return false;
                        }
                    });
                    if (isCanRemoveSummaryInfo) {
                        delete displayDetails.sort_by_summary_info;
                    }
                    else {
                        displayDetails.sort_by_summary_info = JSON.stringify(fieldSettings.SortBySummaryInfo);
                    }
                }
                else {
                    delete displayDetails.sort_by_summary_info;
                }
            }
            data.fields = displayModel.GetPivotFields();
            if (fieldSettingsHandler.IsNeedResetLayout) {
                delete displayDetails.collapse;
                delete displayDetails.layout;
            }
        }
        else if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.CHART) {
            data.fields = displayModel.GetPivotFields();

            if (displayDetails.chart_type !== enumHandlers.CHARTTYPE.GAUGE.Code) {
                delete displayDetails.GaugeValues;
                delete displayDetails.GaugeColours;
            }
        }
        else {
            data.fields = [];
        }
        if (displayDetails)
            data.display_details = JSON.stringify(displayDetails);
        else
            delete data.display_details;

        // query_blocks
        if (self.HandlerFilter) {
            displayQueryBlockModel.TempQuerySteps(self.HandlerFilter.GetData());
        }

        self.TempQuerySteps = [];
        if (!self.IsQuickSave) {
            self.TempQuerySteps = self.HandlerFilter.GetData();
        }
        else {
            jQuery.each(displayQueryBlockModel.TempQuerySteps(), function (index, step) {
                self.TempQuerySteps.push(new WidgetFilterModel(step));
            });
        }

        if (fieldSettings
            && (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT || displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.CHART)) {
            var otherSteps = displayQueryBlockModel.GetQueryStepByNotInType(enumHandlers.FILTERTYPE.AGGREGATION, displayQueryBlockModel.TempQuerySteps());
            var aggrSteps = [displayQueryBlockModel.GetAggregationStepByFieldSetting(fieldSettings)];
            data.query_blocks = ko.toJS([{
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: otherSteps.concat(aggrSteps)
            }]);
        }
        else {
            data.query_blocks = ko.toJS(displayQueryBlockModel.CollectQueryBlocks(true));
        }

        return { data: data };
    };
    self.ResetAll = function () {
        displayModel.ResetAll();
        displayQueryBlockModel.ResetAll();
    };
    self.ConvertDisplayFieldPrefixNoneToNull = function (displayFields) {
        if (displayFields && displayFields.length > 0) {
            jQuery.each(displayFields, function (index, field) {
                var fieldDetailObj = WC.Utility.ParseJSON(field.field_details);
                if (fieldDetailObj[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] && fieldDetailObj[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] === enumHandlers.DISPLAYUNITSFORMAT.NONE) {
                    fieldDetailObj[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = null;
                }
                field.field_details = JSON.stringify(fieldDetailObj);
            });
        }
    };
    self.Save = function () {
        requestHistoryModel.SaveLastExecute(self, self.Save, arguments);

        var displayType = displayModel.Data().display_type;
        var getFollowups = function (queryBlocks) {
            var querySteps = ko.toJS(queryBlocks.length ? queryBlocks[0].query_steps : []);
            jQuery.each(querySteps, function (index, queryStep) {
                WC.ModelHelper.RemoveReadOnlyQueryStep(queryStep);
            });
            return querySteps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        };
        var saveChangesDisplay = function (oldData, updateData, postNewResult) {
            var oldFollowups = getFollowups(oldData.query_blocks);
            var newFollowups = getFollowups(displayQueryBlockModel.CollectQueryBlocks(true));

            if (anglePageHandler.IsEditMode()) {
                // edit mode

                self.SaveDisplay(updateData, false);
            }
            else if (oldData.display_type === null) {
                // new display

                if (newFollowups.length && displayModel.GetTemporaryDisplayType() === enumHandlers.DISPLAYTYPE.LIST) {
                    // change jump
                    self.ExecuteFollowup(updateData, false, false, false);
                }
                else {
                    // save normally
                    self.SaveTemporary(updateData, postNewResult);
                }
            }
            else if (displayModel.IsTemporaryDisplay()) {
                // ad-hoc display

                if (self.IsQuickSave || jQuery.deepCompare(oldFollowups, newFollowups, false, false)) {
                    // save normally
                    self.SaveTemporary(updateData, postNewResult);
                }
                else {
                    // change jump
                    self.ExecuteFollowup(updateData, false, false, false);
                }
            }
            else {
                // saved display

                if (jQuery.deepCompare(oldFollowups, newFollowups, false, false)) {
                    // save normally
                    self.SaveDisplay(updateData, postNewResult);
                }
                else {
                    // change jump
                    self.SaveFollowup(updateData);
                }
            }
        };
        var saveDisplay = function () {
            var fieldSettings = (fieldSettingsHandler.Handler || fieldSettingsHandler).FieldSettings;
            var oldData = historyModel.Get(displayModel.Data().uri, false) || displayModel.Data();
            var currentData = self.CurrentData(fieldSettings);
            var updateDisplayJSON = currentData.data;
            var dataChanged = false;
            var postNewResult = false;

            // moving filter(s) to Angle always post a new result
            if (self.MovedToAngleFilters.length) {
                postNewResult = true;
            }

            if (oldData.multi_lang_description && updateDisplayJSON.multi_lang_description) {
                for (var index = 0; index < updateDisplayJSON.multi_lang_description.length; index++) {
                    var hasLanguage = oldData.multi_lang_description.hasObject('lang', updateDisplayJSON.multi_lang_description[index].lang, false);
                    if (!hasLanguage)
                        oldData.multi_lang_description.push({ lang: updateDisplayJSON.multi_lang_description[index].lang, text: '' });
                }
            }

            // update default value - oldData
            if (oldData.query_blocks.length) {
                jQuery.each(oldData.query_blocks, function (index, block) {
                    oldData.query_blocks[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                });
            }
            oldData.fields = WC.ModelHelper.RemoveReadOnlyFields(oldData.fields);

            // update default value - updateDisplayJSON
            var stepsUpdateFilterFollowup = [];
            var stepsUpdateSorting = [];
            if (updateDisplayJSON.query_blocks.length) {
                jQuery.each(updateDisplayJSON.query_blocks, function (index, block) {
                    block = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                    updateDisplayJSON.query_blocks[index] = block;

                    if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                        jQuery.each(block.query_steps, function (indexStep, step) {
                            if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                                stepsUpdateFilterFollowup.push(step);
                            }
                            else if (step.step_type === enumHandlers.FILTERTYPE.SORTING) {
                                stepsUpdateSorting.push(step);
                            }
                        });
                    }
                });
            }
            updateDisplayJSON.fields = WC.ModelHelper.RemoveReadOnlyFields(updateDisplayJSON.fields);

            self.ConvertDisplayFieldPrefixNoneToNull(updateDisplayJSON.fields);

            /* M4-14064: Fixed didn't post result after removed invalid filter(s) */
            /* M4-19101: There is error 400 Bad Request after clicked save display */
            var notPostResult = !anglePageHandler.HandlerValidation.Angle.CanPostResult || !anglePageHandler.HandlerValidation.Display.CanPostResult;
            var postedQuery = notPostResult ? displayQueryBlockModel.CollectQueryBlocks() : ko.toJS(resultModel.Data().posted_display);
            var stepsPostedFilterFollowup = [];
            var stepsPostedSorting = [];
            if (postedQuery && postedQuery.length) {
                jQuery.each(postedQuery, function (index, block) {
                    block = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                    if (block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) {
                        jQuery.each(block.query_steps, function (indexStep, step) {
                            if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                                stepsPostedFilterFollowup.push(step);
                            }
                            else if (step.step_type === enumHandlers.FILTERTYPE.SORTING) {
                                stepsPostedSorting.push(step);
                            }
                        });
                    }
                });
            }

            // clean things affect post
            var updateDisplayJSONWithOutAffectedPostResult = displayModel.CleanNotAffectPostNewResultFieldProperties(updateDisplayJSON.fields);

            var postedFields = WC.Utility.ToArray(ko.toJS(resultModel.Data().display_fields));
            postedFields = WC.ModelHelper.RemoveReadOnlyFields(postedFields);

            var postedFieldsWithOutAffectedPostResult = displayModel.CleanNotAffectPostNewResultFieldProperties(postedFields);
            var isFieldChanged = function () {
                return (displayType === enumHandlers.DISPLAYTYPE.CHART || displayType === enumHandlers.DISPLAYTYPE.PIVOT)
                    && !jQuery.deepCompare(updateDisplayJSONWithOutAffectedPostResult, postedFieldsWithOutAffectedPostResult, false);
            };

            if (!jQuery.deepCompare(stepsUpdateFilterFollowup, stepsPostedFilterFollowup, false, false)
                || !jQuery.deepCompare(stepsUpdateSorting, stepsPostedSorting, false)
                || isFieldChanged()) {
                postNewResult = true;
            }

            // remove duplicated properties
            if (!displayModel.IsTemporaryDisplay()) {
                // if user didn't have save display privilege remove all data except personal display and execute at login                 
                if (!displayModel.Data().authorizations.update) {

                    // only user_specific can be saved
                    updateDisplayJSON = {
                        user_specific: updateDisplayJSON.user_specific
                    };

                    // restore query steps
                    if (jQuery.grep(displayQueryBlockModel.QuerySteps(), function (queryStep) { return queryStep.is_adhoc_filter; }).length) {
                        popup.Alert(Localization.Warning_Title, Localization.Info_ValidatedAngleAdhocFilterWillRemovedAfterSaved);
                        displayQueryBlockModel.QuerySteps.remove(function (step) { return step.is_adhoc_filter; });
                        displayQueryBlockModel.TempQuerySteps.remove(function (step) { return step.is_adhoc_filter; });
                        postNewResult = true;
                    }

                    // restore fields
                    var originalDisplay = historyModel.Get(displayModel.Data().uri, false);
                    if (originalDisplay) {
                        displayModel.Data().fields = originalDisplay.fields;
                        displayModel.Data.commit();

                        if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.LIST) {
                            listHandler.GetListDisplay();
                        }
                    }
                }

                // change changed data
                updateDisplayJSON = WC.ModelHelper.GetChangeDisplay(updateDisplayJSON, oldData);
                if (updateDisplayJSON) {
                    dataChanged = true;
                }
            }
            else {
                dataChanged = true;
            }

            if (dataChanged) {
                // M4-33955: confirmation if Angle is validated
                var confirmBeforeSaveMessage = self.GetConfirmMessageBeforeSave(angleInfoModel.Data().is_validated, displayModel.Data().is_public, updateDisplayJSON);
                if (confirmBeforeSaveMessage) {
                    popup.Confirm(confirmBeforeSaveMessage, function () {
                        saveChangesDisplay(oldData, updateDisplayJSON, postNewResult);
                    }, function () {
                        self.IsSubmit = false;
                    }, {
                            title: Localization.Warning_Title,
                            icon: 'alert'
                        });
                }
                else {
                    saveChangesDisplay(oldData, updateDisplayJSON, postNewResult);
                }
            }
            else if (postNewResult) {
                var movedToAngleFilters = ko.toJS(self.MovedToAngleFilters);

                var oldQuerySteps = oldData.query_blocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
                var oldFilters = oldQuerySteps ? oldQuerySteps.query_steps.findObjects('step_type', enumHandlers.FILTERTYPE.FILTER) : [];
                var currentFilters = stepsUpdateFilterFollowup.findObjects('step_type', enumHandlers.FILTERTYPE.FILTER);
                var postCustomQueryBlock = !movedToAngleFilters.length || !jQuery.deepCompare(oldFilters, currentFilters, false, false);

                displayQueryBlockModel.CommitAll();

                displayModel.Data().query_blocks = ko.toJS(displayQueryBlockModel.CollectQueryBlocks());
                displayModel.Data.commit();
                self.ClosePopup();

                // refresh resule grid after add query step 
                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);
                progressbarModel.CancelCustomHandler = true;
                progressbarModel.SetDisableProgressBar();

                var applyResultAfterMoveFilter = function () {
                    if (!anglePageHandler.IsEditMode()) {
                        var postResultQuery;
                        if (postCustomQueryBlock) {
                            postResultQuery = { customQueryBlocks: displayModel.Data().query_blocks };
                        }
                        resultModel.PostResult(postResultQuery)
                            .then(function () {
                                return resultModel.GetResult(resultModel.Data().uri);
                            })
                            .then(resultModel.LoadResultFields)
                            .done(function () {
                                historyModel.Save();
                                resultModel.ApplyResult();
                            });
                    }
                    else {
                        self.SetProgressBar();
                    }
                };

                var settings = {
                    forced: false,
                    callback: applyResultAfterMoveFilter,
                    displayUri: displayModel.Data().uri
                };
                self.SaveAngleFiltersFromDisplay(movedToAngleFilters, settings);
            }
            else {
                self.ClosePopup();
                anglePageHandler.RenderDisplayDropdownlist();
                self.SetProgressBar();
            }
        };

        jQuery.when(self.SetLayoutBeforeSave(displayType))
            .done(function () {
                self.ConfirmDiscardBeforeSave(displayType, saveDisplay);
            });
    };
    self.SetLayoutBeforeSave = function (displayType) {
        if (displayType === enumHandlers.DISPLAYTYPE.PIVOT) {
            fieldSettingsHandler.FieldSettings.SetDisplayDetails({
                show_total_for: fieldSettingsHandler.FieldSettings.TotalForType,
                sort_by_summary_info: JSON.stringify(fieldSettingsHandler.FieldSettings.SortBySummaryInfo),
                percentage_summary_type: fieldSettingsHandler.FieldSettings.PercentageSummaryType,
                include_subtotals: fieldSettingsHandler.FieldSettings.IsIncludeSubTotals
            });
            fieldSettingsHandler.Handler.FieldSettings.SetDisplayDetails({
                show_total_for: fieldSettingsHandler.FieldSettings.TotalForType,
                sort_by_summary_info: JSON.stringify(fieldSettingsHandler.FieldSettings.SortBySummaryInfo),
                percentage_summary_type: fieldSettingsHandler.FieldSettings.PercentageSummaryType,
                include_subtotals: fieldSettingsHandler.FieldSettings.IsIncludeSubTotals
            });
        }

        return jQuery.when();
    };
    self.ConfirmDiscardBeforeSave = function (displayType, saveFunction) {
        if (fieldSettingsHandler.IsChangeFieldsSetting && (displayType === enumHandlers.DISPLAYTYPE.CHART || displayType === enumHandlers.DISPLAYTYPE.PIVOT)) {
            var msg = kendo.format(Localization.PopupConfirmDiscardChangeFieldSetting, displayType);
            popup.Confirm(msg, function () {
                fieldSettingsHandler.ResetFieldSettings();
                saveFunction();
            }, function () {
                self.IsSubmit = false;
            });
        }
        else {
            saveFunction();
        }
    };
    self.SaveTemporary = function (updateDisplayJSON, postNewResult) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostDisplay, true);
        progressbarModel.CancelCustomHandler = true;

        var isCancel = false;
        var i = 0;
        var display = jQuery.extend({}, displayModel.Data(), updateDisplayJSON);
        var displayType = displayModel.GetTemporaryDisplayType();
        var postResultOptions = {};
        var saveTemporary = function (display, updateDisplayJSON) {
            if (isCancel) {
                return;
            }

            self.ClosePopup();
            progressbarModel.SetDisableProgressBar();

            return jQuery.when(displayModel.CreateDisplay(display))
                .then(function () {
                    if (updateDisplayJSON.is_angle_default) {
                        displayModel.Data().is_angle_default = true;
                        displayModel.Data.commit();
                        return angleInfoModel.UpdateAngle(angleInfoModel.Data().uri, { angle_default_display: display.id });
                    }
                    else {
                        return jQuery.when();
                    }
                })
                .then(function () {
                    progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_GettingAngleFields);
                    return angleInfoModel.LoadMetadata(angleInfoModel.Data(), displayModel.Data());
                })
                .done(function () {
                    // save history
                    resultModel.LoadSuccess(resultModel.Data());
                    historyModel.Save();

                    // set history as original & lastest data
                    var updateData = historyModel.Get(displayModel.Data().uri);
                    if (postNewResult) {
                        delete updateData.results;
                        resultModel.Data({
                            authorizations: resultModel.GetDefaultResultAuthorizations()
                        });
                    }
                    historyModel.Set(updateData.uri + historyModel.OriginalVersionSuffix, updateData);
                    historyModel.Set(updateData.uri, updateData);

                    anglePageHandler.KeepHistory = false;
                    anglePageHandler.CheckBeforeRender = true;
                    anglePageHandler.DisableProgressbarCancelling = true;

                    //assign field settings
                    if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.CHART || displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                        fieldSettingsHandler.FieldSettings = new FieldSettingsModel(fieldSettingsHandler.Handler ? fieldSettingsHandler.Handler.FieldSettings : null);
                    }

                    displayModel.DeleteTemporaryDisplay(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY), displayModel.Data().uri);
                });
        };
        var settings = {
            forced: false,
            displayUri: displayModel.Data().uri
        };

        // display that create from [+] button
        if (displayModel.IsNewDisplay()) {
            var oldDisplayModel = historyModel.Get(displayModel.Data().uri);
            var oldResult = ko.toJS(resultModel.Data());
            var tempExcuteParameters = ko.toJS(displayQueryBlockModel.ExcuteParameters());
            progressbarModel.CancelFunction = function () {
                isCancel = true;
                self.IsSubmit = false;
                WC.Ajax.AbortAll();
                displayQueryBlockModel.ExcuteParameters(tempExcuteParameters);
                displayModel.LoadSuccess(oldDisplayModel);
                resultModel.Data(oldResult);
                historyModel.Save();
            };

            displayQueryBlockModel.ExcuteParameters(null);

            postNewResult = false;
            var defaultData = displayModel.GenerateDefaultData(displayType);
            display = jQuery.extend({}, defaultData, display);
            display.display_type = defaultData.display_type;

            var postResultCallback;
            if (displayType === enumHandlers.DISPLAYTYPE.LIST) {
                postResultCallback = function () {
                    return displayModel.GetDefaultListFields(resultModel.Data())
                        .done(function (fields) {
                            display.fields = fields;
                            saveTemporary(display, updateDisplayJSON);
                        });
                };
            }
            else {
                display.display_details = defaultData.display_details;
                display.fields = defaultData.fields;
                if (display.query_blocks.length > 0) {
                    jQuery.each(defaultData.query_blocks[0].query_steps, function (index, step) {
                        display.query_blocks[0].query_steps.push(step);
                        i++;
                    });
                }
                else {
                    display.query_blocks = defaultData.query_blocks;
                }

                pivotPageHandler.IsUnSavePivot = false;

                postResultCallback = function () {
                    return jQuery.when(resultModel.LoadResultFields())
                        .done(function () {
                            saveTemporary(display, updateDisplayJSON);
                        });
                };
            }

            // setup posting a new result
            if (display.query_blocks && display.query_blocks.length) {
                postResultOptions.customQueryBlocks = display.query_blocks;
            }

            settings.callback = function () {
                resultModel.PostResult(postResultOptions)
                    .then(function () {
                        return resultModel.GetResult(resultModel.Data().uri);
                    })
                    .done(postResultCallback);
            };
        }
        else {
            displayQueryBlockModel.ExcuteParameters(null);

            settings.callback = function () {
                saveTemporary(display, updateDisplayJSON);
            };
        }
        self.SaveAngleFiltersFromDisplay(self.MovedToAngleFilters, settings);
    };
    self.SaveFollowup = function (updateDisplayJSON) {
        popup.Confirm(Localization.Confirm_CreateNewFollowUp, function () {
            self.ExecuteFollowup(updateDisplayJSON);
        }, function () {
            self.IsSubmit = false;
        });
    };
    self.ExecuteFollowup = function (updateDisplayJSON, isSaveAs, isAdhoc, isListDrilldown, checkJumpTemplate) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_ExecutingJump, false);
        progressbarModel.CancelCustomHandler = true;

        if (isAdhoc) {
            // keep history before going to drilldown
            if (!isListDrilldown) {
                historyModel.Save();
            }
            anglePageHandler.KeepHistory = false;
        }

        var tempExecutionParameters = ko.toJS(displayQueryBlockModel.ExcuteParameters);
        displayQueryBlockModel.ExcuteParameters(null);

        var oldDisplayModel = historyModel.Get(displayModel.Data().uri);
        var isCancel = false;
        var settings = {
            forced: false,
            callback: jQuery.noop,
            displayUri: displayModel.Data().uri
        };
        progressbarModel.CancelFunction = function () {
            isCancel = true;
            WC.Ajax.AbortAll();
            self.IsSubmit = false;
            displayQueryBlockModel.ExcuteParameters(tempExecutionParameters);
            displayModel.LoadSuccess(oldDisplayModel);
            resultModel.LoadSuccess(oldDisplayModel.results);
            historyModel.Save();
            resultModel.GetResult(resultModel.Data().uri)
                .then(resultModel.LoadResultFields)
                .done(function () {
                    resultModel.ApplyResult();
                });

            displayQueryBlockModel.TempQuerySteps(self.TempQuerySteps);
            if (self.HandlerFilter) {
                self.HandlerFilter.Data(displayQueryBlockModel.TempQuerySteps());
            }
        };

        if (IsNullOrEmpty(isSaveAs)) {
            isSaveAs = false;
        }
        if (IsNullOrEmpty(checkJumpTemplate)) {
            checkJumpTemplate = true;
        }

        // find last followup
        var lastFollowup = null, followupSteps = null;
        if (updateDisplayJSON.query_blocks.length) {
            followupSteps = updateDisplayJSON.query_blocks[0].query_steps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
            if (followupSteps.length) {
                lastFollowup = followupSteps[followupSteps.length - 1];
            }
        }
        if (!lastFollowup) {
            followupSteps = angleQueryStepModel.GetFollowupQueryStep();
            if (followupSteps.length) {
                lastFollowup = followupSteps[followupSteps.length - 1];
            }
        }

        var getQueryBlocksWithoutAggregationStep = function () {
            var queryBlocks = [];
            if (updateDisplayJSON.query_blocks.length) {
                var stepsWithoutAggregationStep = displayQueryBlockModel.GetQueryStepByNotInType(enumHandlers.FILTERTYPE.AGGREGATION, updateDisplayJSON.query_blocks[0].query_steps);
                if (stepsWithoutAggregationStep.length) {
                    queryBlocks = [{
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: stepsWithoutAggregationStep
                    }];
                }
            }
            return queryBlocks;
        };
        var cleanDataBeforePostNewResult = function () {
            displayQueryBlockModel.QuerySteps.removeAll();
            displayQueryBlockModel.CommitAll();
            displayModel.Data().fields = [];
            displayModel.Data.commit();
        };
        var createOrUpdateDisplayFromJumpTemplate = function (jumpDisplay) {
            self.ClosePopup();
            progressbarModel.SetDisableProgressBar();

            // update some properties from jump template
            updateDisplayJSON.display_type = jumpDisplay.display_type;
            updateDisplayJSON.display_details = jumpDisplay.display_details;
            updateDisplayJSON.query_blocks = followupPageHandler.GetQueryBlockFromJumpTemplate(updateDisplayJSON.query_blocks, jumpDisplay.query_blocks);
            updateDisplayJSON.fields = jumpDisplay.fields;

            if (!displayModel.IsTemporaryDisplay()) {
                displayModel.UpdateDisplay(displayModel.Data().uri, updateDisplayJSON, settings.forced)
                    .done(function () {
                        progressbarModel.EndProgressBar();

                        anglePageHandler.ExecuteAngle();
                        self.IsSubmit = true;

                        // add delay to wait popup completely close
                        setTimeout(function () {
                            self.ShowPopup();

                            // set button disabled while angle is inprogress
                            self.CheckExecuted();
                        }, 300);
                    });
            }
            else {
                displayModel.CreateDisplay(updateDisplayJSON, true)
                    .done(function () {
                        progressbarModel.EndProgressBar();
                        displayModel.DeleteTemporaryDisplay(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY), displayModel.Data().uri);
                    });
            }
        };
        var createJumpDisplay = function (fields, queryBlocks, forced) {
            if (isCancel) {
                return jQuery.when();
            }

            self.ClosePopup();
            progressbarModel.SetDisableProgressBar();

            updateDisplayJSON.query_blocks = queryBlocks;

            /* M4-12612: Use basic list for 'Create new list display' */
            updateDisplayJSON.fields = fields;
            updateDisplayJSON.display_type = enumHandlers.DISPLAYTYPE.LIST;
            if ((!isSaveAs && !displayModel.IsTemporaryDisplay()) && !isAdhoc) {
                if (!isSaveAs && !displayModel.IsTemporaryDisplay()) {
                    return displayModel.UpdateDisplay(displayModel.Data().uri, updateDisplayJSON, forced);
                }
                else {
                    delete updateDisplayJSON.id;

                    return displayModel.CreateDisplay(updateDisplayJSON, true);
                }
            }
            else if (isAdhoc) {
                updateDisplayJSON.multi_lang_name = [{
                    lang: userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase(),
                    text: displayModel.GetAdhocDisplayName(Localization.NewAdhocFollowup)
                }];
                updateDisplayJSON.multi_lang_description = [];

                return displayModel.CreateTempDisplay(enumHandlers.DISPLAYTYPE.LIST, updateDisplayJSON);
            }
            //added new condition to fixed the problem M4-10230 [WC]Chart/Pivot : 'save as' chart/pivot display doesn't work anymore
            else if (isSaveAs && !displayModel.IsTemporaryDisplay()) {
                delete updateDisplayJSON.id;

                return displayModel.CreateDisplay(updateDisplayJSON, true);
            }
            //added new condition to fixed the problem M4-11320 WC: [Chart/Pivot]Cannot chage to list when added followup to adhoc display and save
            else if (!isSaveAs && !isAdhoc && !isListDrilldown && displayModel.IsTemporaryDisplay()) {
                delete updateDisplayJSON.id;
                updateDisplayJSON.display_details = '{}';

                return displayModel.CreateDisplay(updateDisplayJSON, true);
            }
            else {
                return jQuery.when();
            }
        };
        var applyCreatedJumpDisplay = function (adhocDisplay, queryBlocks) {
            if (isCancel) {
                return;
            }

            progressbarModel.EndProgressBar();

            if (!isSaveAs && !isAdhoc && !displayModel.IsTemporaryDisplay()) {
                var results = ko.toJS(resultModel.Data());
                results.posted_display = ko.toJS(queryBlocks);
                resultModel.LoadSuccess(results);

                var historyData = historyModel.Get(displayModel.Data().uri);
                historyData.results = ko.toJS(resultModel.Data());
                historyModel.Set(displayModel.Data().uri, historyData);
                historyModel.Set(displayModel.Data().uri + historyModel.OriginalVersionSuffix, historyData);

                listHandler.GetListDisplay();
                anglePageHandler.ApplyExecutionAngle();
                self.IsSubmit = true;

                // add delay to wait popup completely close
                setTimeout(function () {
                    self.ShowPopup();

                    // set button disabled while angle is inprogress
                    self.CheckExecuted();
                }, 300);
            }
            else if (isAdhoc) {
                displayModel.LoadSuccess(adhocDisplay);
                resultModel.LoadSuccess(resultModel.Data());
                // save history
                adhocDisplay.results = ko.toJS(resultModel.Data());
                historyModel.Set(adhocDisplay.uri + historyModel.OriginalVersionSuffix, adhocDisplay);
                historyModel.Set(adhocDisplay.uri, adhocDisplay);
                displayModel.GotoTemporaryDisplay(adhocDisplay.uri);
            }
            else {
                // redirect to new angle & display
                anglePageHandler.DisableProgressbarCancelling = true;

                if (displayModel.IsTemporaryDisplay()) {
                    displayModel.DeleteTemporaryDisplay(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY), displayModel.Data().uri);
                }
                else {
                    window.location.href = WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, displayModel.Data().uri);
                }
            }
        };
        var executeAfterJump = function (jumpDisplay) {
            if (jumpDisplay) {
                createOrUpdateDisplayFromJumpTemplate(jumpDisplay);
            }
            else {
                var queryBlocks = getQueryBlocksWithoutAggregationStep();

                cleanDataBeforePostNewResult();
                jQuery.when(resultModel.PostResult({ customQueryBlocks: queryBlocks, currentDisplay: null }))
                    .then(function () {
                        return resultModel.GetResult(resultModel.Data().uri);
                    })
                    .then(function () {
                        return resultModel.LoadResultFields();
                    })
                    .then(function () {
                        return displayModel.GetDefaultListFields(resultModel.Data());
                    })
                    .then(function (fields) {
                        errorHandlerModel.Enable(false);
                        var resolveAngleDisplayCallback = function () {
                            settings.forced = true;
                            createJumpDisplay(fields, queryBlocks, true)
                                .done(function (adhocDisplay) {
                                    applyCreatedJumpDisplay(adhocDisplay, queryBlocks);
                                });
                        };
                        var handleSaveJumpError = function (xhr) {
                            if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, resolveAngleDisplayCallback);
                            }
                            else {
                                errorHandlerModel.BuildCustomAjaxError({ url: displayModel.Data().uri, type: 'PUT' }, xhr);
                            }
                        };
                        return createJumpDisplay(fields, queryBlocks, settings.forced)
                            .fail(handleSaveJumpError)
                            .always(errorHandlerModel.EnableErrorByDelay);
                    })
                    .done(function (adhocDisplay) {
                        applyCreatedJumpDisplay(adhocDisplay, queryBlocks);
                    });
            }
        };
        var getDefaultJumpTemplate = function () {
            if (isSaveAs) {
                self.ClosePopup();
            }
            return jQuery.when(!isSaveAs && checkJumpTemplate && lastFollowup ? followupPageHandler.GetDefaultJumpTemplate(lastFollowup.followup) : null)
                .done(function (jumpDisplay) {
                    executeAfterJump(jumpDisplay);
                });
        };

        settings.callback = getDefaultJumpTemplate;
        self.SaveAngleFiltersFromDisplay(self.MovedToAngleFilters, settings);
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
    self.GetConfirmMessageBeforeSave = function (isValidatedAngle, isPublicDisplay, updateData) {
        // this message will show if...

        // update only user specific
        var tempUpdateData = jQuery.extend({}, updateData);
        delete tempUpdateData.user_specific;
        var isChangeOnlyUserSpecific = updateData.user_specific && jQuery.isEmptyObject(tempUpdateData);

        // is public or being public
        var isChangePublicDisplay = isPublicDisplay || (!isPublicDisplay && updateData.is_public === true);

        if (isValidatedAngle && !isChangeOnlyUserSpecific && isChangePublicDisplay)
            return Localization.Confirm_SaveValidatedAngle;

        return null;
    };

    self.SaveDisplay = function (updateDisplayJSON, postNewResult) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PUTDisplay, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.SetDisableProgressBar();

        var mustUpdateAngleDefault = jQuery('#IsDefaultDisplay').is(':checked') && !displayModel.Data().is_angle_default;
        var displayUri = displayModel.Data().uri;

        var saveDisplayCallback = function () {
            self.ClosePopup();

            displayQueryBlockModel.ExcuteParameters(null);

            if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                pivotPageHandler.IsUnSavePivot = false;
            }

            self.SaveDisplayCallback(postNewResult);
        };
        var saveFiltersFromDisplay = function () {
            self.SaveAngleFiltersFromDisplay(self.MovedToAngleFilters, {
                forced: true,
                callback: saveDisplayCallback,
                displayUri: displayModel.Data().uri
            });
        };
        var handleSaveDisplayError = function (xhr) {
            if (xhr.status === 404) {
                angleInfoModel.Data().display_definitions.removeObject('uri', displayUri);
                angleInfoModel.Data.commit();

                self.ClosePopup();
                anglePageHandler.HandleNoneExistDisplay();
            }
            else if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                var resolveAngleDisplayCallback = function () {
                    jQuery.when(displayModel.UpdateDisplay(displayUri, updateDisplayJSON, true, mustUpdateAngleDefault))
                        .done(saveFiltersFromDisplay);
                };
                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, resolveAngleDisplayCallback);
            }
            else {
                errorHandlerModel.BuildCustomAjaxError({ url: displayUri, type: 'PUT' }, xhr);
            }
        };

        errorHandlerModel.Enable(false);

        // set forced = true if update user specific
        var forced = self.IsUpdateOnlyUserSpecific(updateDisplayJSON);

        displayModel.UpdateDisplay(displayUri, updateDisplayJSON, forced, mustUpdateAngleDefault)
            .fail(handleSaveDisplayError)
            .done(saveFiltersFromDisplay)
            .always(errorHandlerModel.EnableErrorByDelay);
    };
    self.IsUpdateOnlyUserSpecific = function (updateDisplayJSON) {
        var tempUpdateDisplayJSON = ko.toJS(updateDisplayJSON);
        if (tempUpdateDisplayJSON.user_specific) {
            delete tempUpdateDisplayJSON.user_specific;
            if (jQuery.isEmptyObject(tempUpdateDisplayJSON))
                return true;
        }
        return false;
    };
    self.SaveDisplayCallback = function (postNewResult) {
        if (postNewResult) {
            // remove posted_display for force post a new results
            var updateData = historyModel.Get(displayModel.Data().uri);
            if (updateData.results && updateData.results.posted_display) {
                delete updateData.results.posted_display;
            }

            // set history as original & lastest data
            historyModel.Set(updateData.uri + historyModel.OriginalVersionSuffix, updateData);
            historyModel.Set(updateData.uri, updateData);

            anglePageHandler.KeepHistory = false;
            anglePageHandler.CheckBeforeRender = true;
            anglePageHandler.ExecuteAngle(true);
        }
        else {
            anglePageHandler.ApplyExecutionAngle();
            self.SetProgressBar();
        }
    };
    self.SetProgressBar = function () {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_ApplyingDisplay, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.SetDisableProgressBar();

        window.setTimeout(function () {
            progressbarModel.SetProgressBarText(100, resultModel.Data().row_count, resultModel.Data().status);
            progressbarModel.EndProgressBar();
        }, 300);
    };
    self.SaveAsDisplay = function (isSaveAsNewAngle) {

        requestHistoryModel.SaveLastExecute(self, self.SaveAsDisplay, arguments);

        var displayType = displayModel.Data().display_type;
        var saveDisplayAs = function () {
            var saveData = self.CurrentData(fieldSettingsHandler.FieldSettings).data;
            if (isSaveAsNewAngle) {
                self.SaveAsToNewAngle(saveData);
            }
            else {
                self.CopyDisplay(saveData);
            }
        };

        jQuery.when(self.SetLayoutBeforeSaveAs(displayType))
            .done(function () {
                self.ConfirmDiscardBeforeSaveAs(displayType, saveDisplayAs);
            });
    };
    self.SetLayoutBeforeSaveAs = function (displayType) {
        if (displayType === enumHandlers.DISPLAYTYPE.PIVOT)
            fieldSettingsHandler.IsNeedResetLayout = !fieldSettingsHandler.FieldSettings.Layout;

        return jQuery.when();
    };
    self.ConfirmDiscardBeforeSaveAs = function (displayType, saveDisplayAs) {
        if (fieldSettingsHandler.IsChangeFieldsSetting && (displayType === enumHandlers.DISPLAYTYPE.CHART || displayType === enumHandlers.DISPLAYTYPE.PIVOT)) {
            // pivot and chart check if field setting change
            var msg = kendo.format(Localization.PopupConfirmDiscardChangeFieldSetting, displayType);
            popup.Confirm(msg, function () {
                fieldSettingsHandler.ResetFieldSettings();
                saveDisplayAs();
            }, function () {
                self.IsSubmit = false;
            });
        }
        else {
            saveDisplayAs();
        }
    };
    self.SaveAsToNewAngle = function (displayData) {
        var movedToAngleFilters = self.MovedToAngleFilters.slice();

        self.ClosePopup();
        self.CloseSaveAsPopup();

        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CopyingAngle, false);

        var oldFollowups = [];
        var newFollowups = [];
        var displayQueryBlock = null;
        if (displayData.query_blocks.length) {
            displayQueryBlock = WC.ModelHelper.RemoveReadOnlyQueryBlock(displayData.query_blocks[0]);
            newFollowups = displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.FOLLOWUP, displayQueryBlock.query_steps);
        }
        if (displayModel.Data().query_blocks.length) {
            displayQueryBlock = WC.ModelHelper.RemoveReadOnlyQueryBlock(displayModel.Data().query_blocks[0]);
            oldFollowups = displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.FOLLOWUP, displayQueryBlock.query_steps);
        }

        var getQueryBlocksWithoutAggregationStep = function (display) {
            var queryBlocks = [];
            if (display.query_blocks.length) {
                var stepsWithoutAggregationStep = displayQueryBlockModel.GetQueryStepByNotInType(enumHandlers.FILTERTYPE.AGGREGATION, ko.toJS(display.query_blocks[0].query_steps));

                // add moved Angle filters to query block
                jQuery.each(movedToAngleFilters.slice(), function (index, filter) {
                    stepsWithoutAggregationStep.splice(index, 0, filter);
                });

                if (stepsWithoutAggregationStep.length) {
                    queryBlocks = [{
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: stepsWithoutAggregationStep
                    }];
                }
            }
            return queryBlocks;
        };
        var getDisplayFollowups = function (display) {
            var queryBlocks = getQueryBlocksWithoutAggregationStep(display);

            return jQuery.when(resultModel.PostResult({ customQueryBlocks: queryBlocks, currentDisplay: null }))
                .then(function () {
                    return resultModel.GetResult(resultModel.Data().uri);
                })
                .then(function () {
                    return resultModel.LoadResultFields();
                })
                .then(function () {
                    progressbarModel.SetDisableProgressBar();
                    return displayModel.GetDefaultListFields(resultModel.Data());
                })
                .then(function (fields) {
                    if (queryBlocks.length) {
                        queryBlocks[0].query_steps.splice(0, movedToAngleFilters.length);
                    }
                    display.query_blocks = queryBlocks;
                    display.fields = fields;
                    display.display_type = enumHandlers.DISPLAYTYPE.LIST;

                    return jQuery.when(display);
                });
        };
        var mustExecuteFollowups = !self.IsQuickSave && !jQuery.deepCompare(oldFollowups, newFollowups, false, false);

        jQuery.when(mustExecuteFollowups ? getDisplayFollowups(displayData) : displayData)
            .then(function (newDisplayData) {
                progressbarModel.CancelCustomHandler = true;
                progressbarModel.SetDisableProgressBar();

                var display = jQuery.extend({}, ko.toJS(displayModel.Data()), newDisplayData);
                display.id = 'd' + jQuery.GUID().replace(/-/g, '');
                display.is_angle_default = false;
                display.is_public = false;
                display = displayModel.DeleteReadOnlyDisplayProperties(display);

                var angleData = ko.toJS(angleInfoModel.Data());
                angleData.id = 'a' + jQuery.GUID().replace(/-/g, '');
                angleData.is_validated = false;
                angleData.is_template = false;
                angleData.user_specific = { is_starred: false };
                angleData.is_published = false;
                angleData.allow_followups = true;
                angleData.allow_more_details = true;
                angleData.angle_default_display = display.id;
                angleData.display_definitions = [display];
                angleData.multi_lang_name = addToNewAngleNames;

                // query_definition
                if (movedToAngleFilters.length) {
                    var queryStepBlock = angleData.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
                    if (!queryStepBlock) {
                        angleData.query_definition.push({
                            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                            query_steps: movedToAngleFilters
                        });
                    }
                    else {
                        jQuery.merge(queryStepBlock.query_steps, movedToAngleFilters);
                    }
                }
                angleData = angleInfoModel.DeleteReadOnlyAngleProperties(angleData);

                delete angleData.name;
                return jQuery.when(angleData);
            })
            .then(function (angleData) {
                var params = {};
                params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
                params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
                params[enumHandlers.PARAMETERS.REDIRECT] = 'no';
                var url = angleData.model + '/angles?' + jQuery.param(params);
                return CreateDataToWebService(url, angleData);
            })
            .done(function (angleData) {
                angleInfoModel.DeleteTemporaryAngle();
                angleQueryStepModel.ExcuteParameters(null);
                displayQueryBlockModel.ExcuteParameters(null);

                // do not get angle again
                angleInfoModel.SetData(angleData);
                var currentDisplay = angleData.display_definitions[0];

                if (!mustExecuteFollowups) {
                    // set to post a new result
                    resultModel.Data({
                        authorizations: resultModel.GetDefaultResultAuthorizations()
                    });
                }
                else {
                    // keep current result
                    resultModel.Data().posted_display = ko.toJS(currentDisplay.query_blocks);
                    currentDisplay.results = ko.toJS(resultModel.Data());
                }

                // set display
                displayModel.LoadSuccess(currentDisplay);
                historyModel.LastDisplayUri(currentDisplay.uri);
                historyModel.Set(currentDisplay.uri + historyModel.OriginalVersionSuffix, currentDisplay);
                historyModel.Set(currentDisplay.uri, currentDisplay);

                // redirect to new angle & display
                var query = {};
                if (anglePageHandler.IsEditMode()) {
                    query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                }
                window.location.href = WC.Utility.GetAnglePageUri(angleData.uri, currentDisplay.uri, query);
            });
    };
    self.CopyDisplay = function (displayData) {
        self.CloseSaveAsPopup();

        // prepare data
        displayData.is_angle_default = false;
        displayData.user_specific = { is_user_default: false, execute_on_login: false };
        displayData.is_public = false;

        var oldFollowups = [];
        var newFollowups = [];
        if (displayData.query_blocks.length !== 0) {
            var displayQueryBlock = WC.ModelHelper.RemoveReadOnlyQueryBlock(displayData.query_blocks[0]);
            newFollowups = displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.FOLLOWUP, displayQueryBlock.query_steps);
        }
        if (displayModel.Data().query_blocks.length !== 0) {
            var queryBlock = WC.ModelHelper.RemoveReadOnlyQueryBlock(displayModel.Data().query_blocks[0]);
            oldFollowups = displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.FOLLOWUP, queryBlock.query_steps);
        }

        if (!self.IsQuickSave && !jQuery.deepCompare(oldFollowups, newFollowups, false, false)) {
            self.ExecuteFollowup(displayData, true);
        }
        else {
            var data = jQuery.extend({}, ko.toJS(displayModel.Data()), displayData);
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CopyingDisplay, false);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.SetDisableProgressBar();

            var copyDisplay = function () {
                jQuery.when(displayModel.Copy(data, true))
                    .done(function () {
                        self.ClosePopup();
                        anglePageHandler.DisableProgressbarCancelling = true;

                        // redirect to new angle & display
                        if (displayModel.IsTemporaryDisplay()) {
                            displayModel.DeleteTemporaryDisplay(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY), displayModel.Data().uri);
                        }
                        else {
                            var query = {};
                            if (anglePageHandler.IsEditMode()) {
                                query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                            }
                            window.location.href = WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, displayModel.Data().uri, query);
                        }
                    });
            };

            var settings = {
                forced: false,
                callback: copyDisplay,
                displayUri: displayModel.Data().uri
            };
            return self.SaveAngleFiltersFromDisplay(self.MovedToAngleFilters, settings);
        }
    };
    self.SaveAngleFiltersFromDisplay = function (filters, settings) {
        var resolveAngleDisplayCallback = function () {
            settings.forced = true;
            self.SaveAngleFiltersFromDisplay(filters, settings);
        };
        var handleMoveFilterError = function (xhr) {
            if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, resolveAngleDisplayCallback);
            }
            else {
                errorHandlerModel.BuildCustomAjaxError({ url: angleInfoModel.Data().uri, type: 'PUT' }, xhr);
            }
        };

        errorHandlerModel.Enable(false);
        return jQuery.when(filters.length ? angleInfoModel.SaveFiltersFromDisplay(filters, settings.forced, settings.displayUri) : null)
            .fail(handleMoveFilterError)
            .done(settings.callback)
            .always(errorHandlerModel.EnableErrorByDelay);
    };
}
