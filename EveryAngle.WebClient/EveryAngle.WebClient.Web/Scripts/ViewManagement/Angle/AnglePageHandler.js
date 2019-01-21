measurePerformance.SetStartTime(true);

function AnglePageHandler() {
    "use strict";

    var self = this;

    // extend method from AngleActionMenuHandler.js
    jQuery.extend(self, new AngleActionMenuHandler(self));

    /*BOF: Model Properties*/
    self.IsPageInitialized = false;
    self.IsCompactResult = false;
    self.LastPrivateNote = "";
    self.IsExecuted = false;
    self.IsFirstExecute = true;
    self.IsPosibleToEditModel = true;
    self.OpenAngleDetailPopupAfterExecuted = false;
    self.DisableProgressbarCancelling = false;
    self.AdhocFilters = [];

    // use historyModel on ExecuteAngle?
    self.UseHistory = true;

    // UseHistory and lastestest version?
    self.UseLastestVersion = true;

    // save historyModel on ExecuteAngle?
    self.KeepHistory = true;

    self.CheckBeforeRender = false;
    self.HandlerExecutionParameter = null;
    self.HandlerAngleDetails = null;
    self.HandlerDisplayDetails = null;
    self.HandlerFind = null;
    self.HandlerValidation = {
        Valid: true,
        Angle: validationHandler.GetAngleValidation(null),
        Display: validationHandler.GetDisplayValidation(null),
        ShowValidationStatus: {}
    };
    self.LoadResultFieldDone = false;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.InitialAnglePage = function (callback) {
        requestHistoryModel.SaveLastExecute(self, self.InitialAnglePage, arguments);

        if (typeof WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE) === 'undefined') {
            self.BackToSearch(false);
            return;
        }

        var display = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        if (display !== 'null' && displayModel.IsTemporaryDisplay(display) && displayModel.GetTemporaryDisplay(display) == null) {
            self.BackToSearch(false);
            return false;
        }

        directoryHandler.LoadDirectory()
            .then(function () {
                return jQuery.when(sessionModel.Load());
            })
            .then(function () {
                return jQuery.when(
                    businessProcessesModel.General.Load(),
                    systemSettingHandler.LoadSystemSettings(),
                    userModel.Load(),
                    systemInformationHandler.LoadSystemInformation(),
                    systemCurrencyHandler.LoadCurrencies()
                );
            })
            .then(function () {
                return jQuery.when(
                    fieldCategoryHandler.LoadFieldCategories(),
                    privilegesViewModel.Load(),
                    userSettingModel.Load(),
                    internalResourceHandler.LoadResources()
                );
            })
            .then(function () {
                return modelsHandler.LoadModels();
            })
            .done(function () {
                jQuery('html').addClass('initialized');
                self.InitialAnglePageCallback(callback);
            });
    };
    self.InitialAnglePageCallback = function (callback) {
        if (jQuery.isReady) {
            userSettingsView.UpdateUserMenu();
        }

        // mark sure document is ready
        if (!jQuery.isReady || !jQuery('html').hasClass('initialized'))
            return;

        if (!self.IsPageInitialized) {
            self.IsPageInitialized = true;

            progressbarModel.InitialProgressBar();
            userSettingsView.UpdateUserMenu();
            CheckUILanguage(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase());

            // check currency
            userSettingsHandler.CheckUserCurrency();

            // set firstLogin status
            jQuery.localStorage('firstLogin', 0);

            // tooltip
            WC.HtmlHelper.Tooltip.Create('actionmenu', '#ActionDropdownListPopup .actionDropdownItem', false, TOOLTIP_POSITION.BOTTOM, 'tooltipActionmenu k-window-arrow-n');

            // menu navigatable
            WC.HtmlHelper.MenuNavigatable('#UserControl', '#UserMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#Help', '#HelpMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#SelectedDisplay', '#DisplayItemList', '.ItemList', 'ItemListSelected');
            WC.HtmlHelper.MenuNavigatable('#btnAddLanguage', '.languageAvailableList', '.Item');
            WC.HtmlHelper.MenuNavigatable('.btnAddLabel', '.availableLabelsList', 'li');
            WC.HtmlHelper.MenuNavigatable('th.k-header', '.HeaderPopupList', 'a');
            WC.HtmlHelper.MenuNavigatable('#ChartType_ddlWrapper', '#ChartType-list', '.chartType');
            WC.HtmlHelper.MenuNavigatable('#FieldListArea li', '.HeaderPopupField', 'a');
            WC.HtmlHelper.MenuNavigatable('.dxpgHeaderText', '.HeaderPopupView', 'a');

            //Binding knockout
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#HelpMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#UserMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#BackToSearch'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#ActionDropdownList'));
            WC.HtmlHelper.ApplyKnockout(angleInfoModel, jQuery('#AngleName'));
            WC.HtmlHelper.ApplyKnockout(angleInfoModel, jQuery('#YourNote'));
            WC.HtmlHelper.ApplyKnockout(resultModel, jQuery('#ExecutionResults'));

            jQuery('#ToggleWrapper').hide();
            self.ApplyResultViewType();
            self.SetWrapperHeight();

            // toogle panel is in edit mode
            if (self.IsEditMode()) {
                self.TogglePanel(false);
            }

            //Set initial angle page
            anglePageRetainUrlModel.Initial();

            self.InitialUserPrivileges();

            // click outside objects
            var isHide = function (target, excepts) {
                target = jQuery(target);
                excepts = excepts.join(',');
                return !target.filter(excepts).length && !target.parents(excepts).length;
            };
            jQuery.clickOutside('#UserMenu', '#UserControl');
            jQuery.clickOutside('#HelpMenu', '#Help');
            jQuery.clickOutside('.languageAvailableList', '.btnAddLanguage');
            jQuery.clickOutside('#DisplayListSelection', function (e) {
                if (!jQuery(e.target).hasClass('SelectedDisplayPointer'))
                    self.ShowOrHideDisplayList(true);
            });
            jQuery.clickOutside('.HeaderPopup', function (e) {
                var excepts = [
                    '.handler',
                    '.dxpgHeader',
                    '.dxPivotGrid_pgSortUpButton',
                    '.dxPivotGrid_pgSortDownButton',
                    '.itemField',
                    '.HeaderPopup'
                ];
                var relatePopups = jQuery('.customSortPopup:visible,.listFormatSettingPopup:visible,.popupBucket:visible');

                if (isHide(e.target, excepts) && !relatePopups.length) {
                    listHandler.HideHeaderPopup();
                    jQuery('[id*=DHP_PW]').removeClass('pivotMenuVisible');
                }
            });
            jQuery.clickOutside('.popupBucket', function (e) {
                var excepts = [
                    '.popupBucket',
                    '.fieldFormat',
                    '[id^=BucketOptionDropDown]',
                    '[id^=BucketFormatOptionDropDown]',
                    '[id^=BucketFormatOptionDropDown]',
                    '[id^=BucketDisplayUnitDropDown]',
                    '[id^=BucketDecimalDropDown]',
                    '[id^=SecondsFormatOptionDropDown]',
                    '[id=UseBucketThousandSeperate-checkbox]'
                ];
                if (isHide(e.target, excepts))
                    fieldSettingsHandler.HideFieldOptionsMenu();
            });
            jQuery.clickOutside('#PopupChartOptions', function (e) {
                var excepts = [
                    '[id^=ButtonDisplayOptions]',
                    '.popupChartOptions',
                    '.btnDisplayOptions',
                    '[id^=ChartOptionDropDown]',
                    '[id^=ShowTotalFor]',
                    '[id^=PercentageSummaryDropDown]'
                ];
                if (isHide(e.target, excepts))
                    fieldSettingsHandler.RemoveDisplayOptionsPopup();
            });
            jQuery.clickOutside('#PivotCustomSortPopup', function (e) {
                var excepts = [
                    '.dxpgColumnFieldValue',
                    '.dxpgRowFieldValue',
                    '.pivotCustomSortPopup',
                    '[id^=PivotCustomSortField]'
                ];
                if (isHide(e.target, excepts))
                    pivotPageHandler.ClosePivotCustomSortPopup();
            });
            jQuery.clickOutside('#CustomSortPopup', function (e) {
                var excepts = [
                    '.sortCustom',
                    '.customSortPopup',
                    '[id^=CustomSortField]'
                ];
                if (isHide(e.target, excepts))
                    listHandler.HideHeaderPopup();
            });
            jQuery.clickOutside('#PopupListFormatSetting', function (e) {
                var excepts = [
                    '.fieldFormat',
                    '.listFormatSettingPopup',
                    '[id^=format]',
                    '[id^=FormatDisplayUnitSelect]',
                    '[id^=FormatDecimalSelect]',
                    '[id^=FormatSecondsSelect]'
                ];
                if (isHide(e.target, excepts))
                    listHandler.HideHeaderPopup();
            });

            self.InitialEditNote();
        }

        if (typeof callback === 'function')
            callback();
    };
    self.InitialEditNote = function () {
        jQuery("#YourNote").click(function () {
            if (angleInfoModel.Data().authorizations.update_user_specific) {
                var yourNoteContainer = jQuery("#YourNote");
                yourNoteContainer.addClass("editNoteMode");
                if (!$("#txtYourNote").length) {
                    var lastvalue = jQuery.trim(yourNoteContainer.text());
                    self.LastPrivateNote = lastvalue;
                    if (lastvalue === Localization.AddNote) {
                        lastvalue = '';
                    }

                    var yourNoteInput = jQuery('<input id="txtYourNote" maxlength="100" class="eaText eaTextSize40" type="text" />')
                        .val(lastvalue)
                        .blur(function () {
                            self.HideEditNote(true);
                        })
                        .keydown(function (event) {
                            if (event.keyCode === 13) {
                                // enter
                                self.HideEditNote(true);
                            }
                            else if (event.keyCode === 27) {
                                // esc
                                self.HideEditNote(false);
                            }
                        });
                    yourNoteContainer.html(yourNoteInput);
                    yourNoteInput.focus();

                    jQuery(window)
                        .on('resize.yournote', function () {
                            yourNoteInput.width(yourNoteContainer.width() - 30);
                        });

                    setTimeout(function () {
                        jQuery(document).on('click.yournote touchstart.yournote', function (e) {
                            if (e.target.id !== 'txtYourNote') {
                                self.HideEditNote(true);
                            }
                        });
                        jQuery(window).trigger('resize.yournote');
                    }, 10);
                }
            }
        });
    };
    self.HideEditNote = function (isSave) {
        jQuery(window).off('resize.yournote');
        jQuery(document).off('click.yournote touchstart.yournote');

        var yourNoteInput = jQuery("#txtYourNote").off('blur keydown');
        if (yourNoteInput.length) {
            var resetYourNote = function () {
                var oldNote = angleInfoModel.PrivateNote();
                angleInfoModel.PrivateNote(oldNote + 1);
                angleInfoModel.PrivateNote.commit();

                angleInfoModel.PrivateNote(oldNote);
                angleInfoModel.PrivateNote.commit();
            };
            var yourNoteContainer = jQuery("#YourNote");
            var yourNote = jQuery.trim(yourNoteInput.val());
            if (isSave && yourNote !== angleInfoModel.PrivateNote()) {
                if (angleInfoModel.IsTemporaryAngle()) {
                    yourNoteContainer.removeClass("editNoteMode");
                    angleInfoModel.PrivateNote(yourNote);
                    angleInfoModel.PrivateNote.commit();
                }
                else {
                    var jsonUpdatePrivateNote = {
                        "user_specific": {
                            "private_note": yourNote
                        }
                    };
                    yourNoteInput.prop('disabled', true);
                    angleInfoModel.UpdateAngle(angleInfoModel.Data().uri, jsonUpdatePrivateNote, true)
                        .fail(function () {
                            resetYourNote();
                        })
                        .always(function () {
                            yourNoteContainer.removeClass("editNoteMode");
                        });
                }
            }
            else {
                yourNoteContainer.removeClass("editNoteMode");
                resetYourNote();
            }
        }
    };

    self.IsEditMode = function () {
        return !!WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE);
    };
    self.ExitEditMode = function () {
        self.IsPosibleToEditModel = true;
        WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE, null);
    };

    self.BackToSearch = function (showProgress) {
        if (typeof showProgress === 'undefined')
            showProgress = true;
        if (showProgress) {
            progressbarModel.ShowStartProgressBar(Localization.Redirecting, false);
            progressbarModel.CancelForceStop = true;
        }

        var lastSearchUrl = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL);
        if (!lastSearchUrl || lastSearchUrl === '/') {
            window.location = searchPageUrl;
        }
        else {
            window.location = searchPageUrl + '#' + lastSearchUrl;
        }
    };
    self.TogglePanel = function (animation) {
        if (jQuery('#ToggleAngle').hasClass('disabled'))
            return;

        if (typeof animation === 'undefined')
            animation = true;

        var togglePanel = function () {
            jQuery('#ToggleWrapper').removeAttr('style').toggleClass('fullDetail');
            self.UpdateLayout();
        };
        var isFullDetail = jQuery('#ToggleWrapper').hasClass('fullDetail');
        if (isFullDetail) {
            jQuery('#ToggleAngle .Collapse').addClass('Expand').removeClass('Collapse');
            jQuery('#ToggleAngle .ToggleStautus').text('Show: ');
        }
        else {
            jQuery('#ToggleWrapper').css({ 'position': 'relative', 'height': 'auto' }).hide();
            jQuery('#ToggleAngle .Expand').addClass('Collapse').removeClass('Expand');
            jQuery('#ToggleAngle .ToggleStautus').text('Hide: ');
        }

        if (animation) {
            jQuery('#ToggleWrapper').slideToggle('fast', togglePanel);
        }
        else {
            togglePanel();
        }
    };
    self.ApplyResultViewType = function () {
        var resultviewtype = jQuery.trim(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.VIEWMODE) || enumHandlers.PAGEVIEWMODE.FULL);
        if (resultviewtype === enumHandlers.PAGEVIEWMODE.COMPACT) {
            self.IsCompactResult = true;
            jQuery('#AngleTopBar,#AngleField').hide();
        }
        else {
            self.IsCompactResult = false;
            jQuery('#AngleTopBar,#AngleField').show();
        }
    };
    self.UpdateDetailSection = function () {
        var wrapperVisible = jQuery('#ToggleWrapper').is(':visible');
        if (!wrapperVisible)
            jQuery('#ToggleWrapper').show();

        var nameSize = jQuery('#AngleName').width();
        jQuery('#AngleName .Name').css('max-width', nameSize - 100);
        jQuery('#ExecutionResults').width(nameSize - 20);
        jQuery('#ExecutionResults > span').css('max-width', nameSize - 40);
        jQuery('#YourNote').width((jQuery('#AngleSetting').width() - jQuery('#ToggleAngle').width() - 60) / 2);

        if (self.HandlerAngleDetails) {
            self.HandlerAngleDetails.AdjustLayout();
        }
        if (self.HandlerDisplayDetails) {
            self.HandlerDisplayDetails.AdjustLayout();
        }

        if (!wrapperVisible)
            jQuery('#ToggleWrapper').hide();
    };
    self.UpdateNameForMultiLanguages = function (lang, models, name) {
        if (lang && models) {
            var tempIndex = models.indexOfObject('lang', lang);

            if (tempIndex !== -1) {
                models[tempIndex].name = name;
            }
        }
    };
    self.UpdateDescriptionForMultiLanguages = function (lang, models, description, checkEmpty) {
        if (typeof checkEmpty === 'undefined')
            checkEmpty = false;
        if (checkEmpty && description === '')
            return;

        if (lang && models) {
            var tempIndex = models.indexOfObject('lang', lang);
            if (tempIndex !== -1) {
                models[tempIndex].description = description;
            }
        }
    };
    self.TriggerWatcher = function (e) {
        if (e.key.indexOf(window.storagePrefix + enumHandlers.STORAGE.WATCHER_DASHBOARD_WIDGETS_COUNT.replace('{uri}', '')) !== -1 && jQuery('#popupAddToDashboard').length) {
            var win = jQuery('#popupAddToDashboard').data(enumHandlers.KENDOUITYPE.WINDOW);
            if (win) {
                var isShowing = jQuery('#popupAddToDashboard').is(':visible');
                win.destroy();
                popup.CloseAll();
                if (isShowing)
                    self.ShowAddToDashboardPopup();
            }
        }
    };
    self.TriggerPersisted = function () {
        self.ExecuteAngle();
    };
    self.UpdateLayout = function (delay) {
        self.SetWrapperHeight();

        listHandler.UpdateLayout(delay);
        if (self.HandlerValidation.Valid) {
            chartHandler.UpdateLayout(delay);
            pivotPageHandler.UpdateLayout(delay);
        }
        else {
            fieldSettingsHandler.UpdateSettingLayout();
        }

    };
    self.SetWrapperHeight = function () {
        var wraperHeight = WC.Window.Height;

        if (!self.IsCompactResult) {
            wraperHeight -= jQuery('.mainDisplayWrapper').offset().top;
        }

        jQuery('.mainDisplayWrapper, .mainDisplayWrapper .displayArea').height(wraperHeight);
    };
    self.ExecuteAngle = function (ignoreDisplayQueryBlock) {
        WC.Ajax.AbortAll();
        requestHistoryModel.SaveLastExecute(self, self.ExecuteAngle, arguments);

        var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
        var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        var isCreatedNewAngle = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.CREATENEW) || false;
        var isTemplate = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.TEMPLATE) || false;
        var listDrilldown = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) || false;
        var startTime = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.STARTTIMES) || null;
        var target = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.TARGET) || null;
        var isEditMode = self.IsEditMode();
        var angleData = angleInfoModel.Data();
        var displayData = displayModel.Data();

        self.LoadResultFieldDone = false;

        var forceEditId = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITID) || null;
        var query = {};

        if (forceEditId != null) {
            self.CanEditId(forceEditId === 'true');
            jQuery.localStorage('can_edit_id', self.CanEditId());
            jQuery.each($.address.parameterNames(), function (index, name) {
                if (name !== enumHandlers.ANGLEPARAMETER.ANGLE && name !== enumHandlers.ANGLEPARAMETER.DISPLAY && name !== enumHandlers.ANGLEPARAMETER.EDITID) {
                    query[name] = WC.Utility.UrlParameter(name);
                }
            });
            window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
            return;
        }

        if (isEditMode) {
            jQuery('html').addClass('editmode');
        }
        else {
            if (startTime) {
                measurePerformance.StartTime = startTime;
                jQuery.each($.address.parameterNames(), function (index, name) {
                    if (name !== enumHandlers.ANGLEPARAMETER.ANGLE && name !== enumHandlers.ANGLEPARAMETER.DISPLAY && name !== enumHandlers.ANGLEPARAMETER.STARTTIMES) {
                        query[name] = WC.Utility.UrlParameter(name);
                    }
                });
                window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
                return;
            }
            else {
                measurePerformance.SetStartTime();
            }

            jQuery('html').removeClass('editmode');
        }
        if (listDrilldown) {
            listDrilldown = unescape(listDrilldown);
        }

        // hide no need stuff
        jQuery(document).trigger('click.outside');
        jQuery(document).trigger('click.jeegoocontext');
        fieldSettingsHandler.RemoveAllBucketPopup();

        jQuery([
            '#popupFindAngleResult',
            '#popupFieldChooser',
            '#HelpTextPopup',
            '#popupListFilter',
            '#popupSaveAs',
            '#popupAngleResultSummary',
            '#popupAngleInfo',
            '#popupAngleDetail',
            '#popupDisplayInfo',
            '#popupDisplayDetail',
            '#popupFollowup',
            '#popupExportExcel',
            '#popupExportToCSV',
            '#popupAddToDashboard'
        ].join(',')).each(function () {
            popup.Close(this);
        });

        // close all color pickers
        jQuery('[data-role="customcolorpicker"]').each(function () {
            var handler = jQuery(this).data('handler');
            if (handler)
                handler.close();
        });

        if (!modelsHandler.HasData()) {
            popup.Info(Localization.Info_NoModelsReturn);
            popup.OnCloseCallback = function () {
                self.BackToSearch(false);
            };
            return;
        }

        // keep previous display in memory (historyModel) if..
        // - user do not send (KeepHistory = false)
        // - have displays
        // - do not from list-drilldown
        if (self.KeepHistory && displayData && displayData.display_type != null && !jQuery('html').hasClass('listDrilldown')) {
            historyModel.Save();

            // clean field settings
            fieldSettingsHandler.ClearFieldSettings();
        }

        var tempDisplay;
        if (displayParameter !== 'null' && displayModel.IsTemporaryDisplay()) {

            // temp display always use data from historyModel or localStorage (see on displayModel.GetTemporaryDisplay function)
            tempDisplay = displayModel.GetTemporaryDisplay(displayParameter);

            // set temporary into history when do not exists
            var tempDisplayHistory = historyModel.Get(displayParameter);
            if (!tempDisplayHistory) {
                historyModel.Set(displayParameter + historyModel.OriginalVersionSuffix, tempDisplay);
                historyModel.Set(displayParameter, tempDisplay);
            }

            if (typeof angleData === 'undefined' || angleData == null) {
                if (jQuery('#DisplayItemList .ItemListSelected').length) {
                    displayModel.DeleteTemporaryDisplay(displayParameter, jQuery('#DisplayItemList .ItemListSelected').attr('alt'));
                }
            }
            else {
                angleInfoModel.SetData(angleInfoModel.Data());
                displayModel.LoadSuccess(tempDisplay);
                if (!tempDisplay.display_type) {
                    self.IsExecuted = true;
                    resultModel.Data({
                        authorizations: {
                            add_aggregation: true,
                            add_filter: true,
                            add_followup: true,
                            change_field_collection: true,
                            change_query_filters: true,
                            change_query_followups: true,
                            'export': false,
                            single_item_view: true,
                            sort: true
                        }
                    });
                    jQuery('#AngleTableWrapper').addClass('hiddenContent');
                    self.RenderDisplayDropdownlist();
                    displayDetailPageHandler.ShowPopup();
                    return;
                }
            }
        }
        jQuery('#AngleTableWrapper').removeClass('hiddenContent');
        jQuery('#AngleGrid .k-virtual-scrollable-wrap').scrollLeft(0);

        // set angleData & displayData after check temporary angle & display
        angleData = angleInfoModel.Data();
        displayData = displayModel.Data();

        // display not set = refresh page
        if (displayData == null || historyModel.LastDisplayUri() == null || (angleData && angleParameter !== angleData.uri)) {
            self.UseHistory = false;
        }

        // when navigated (not refresh page), use history
        if (self.UseHistory) {
            // list-drilldown in case clicked cell
            // ** in case refresh page see below...
            if (listDrilldown) {
                displayData = historyModel.Get(displayParameter + ',' + listDrilldown);
            }
            else {
                displayData = historyModel.Get(displayParameter, self.UseLastestVersion);
            }

            if (displayData) {
                // set resultModel from history
                if (displayData.results && displayData.results.uri) {
                    resultModel.Data(displayData.results);
                }
            }
            else {
                self.UseHistory = listDrilldown && angleData ? true : false;
            }
        }

        self.IsExecuted = false;
        self.EnableAnglePage(true);

        var cancelFunction = progressbarModel.KeepCancelFunction ? progressbarModel.CancelFunction : function () {
            if (!self.IsPosibleToEditModel) {
                WC.Ajax.AbortAll();
                if (window.stop)
                    window.stop();
                else if (document.execCommand)
                    document.execCommand('Stop');
            }

            setTimeout(function () {
                if (self.IsPosibleToEditModel) {
                    if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.TEMPLATE)) {
                        var query = {};
                        query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                        jQuery.each($.address.parameterNames(), function (index, name) {
                            if (name !== enumHandlers.ANGLEPARAMETER.ANGLE && name !== enumHandlers.ANGLEPARAMETER.DISPLAY) {
                                query[name] = WC.Utility.UrlParameter(name);
                            }
                        });
                        window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
                    }
                    else {
                        WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE, true);
                    }
                }
                else {
                    history.back();
                }
            }, 100);
        };
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_GettingAngle, false);
        if (self.DisableProgressbarCancelling) {
            progressbarModel.SetDisableProgressBar();
        }
        else {
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.CancelFunction = cancelFunction;
        }
        progressbarModel.KeepCancelFunction = false;
        self.DisableProgressbarCancelling = false;
        jQuery.when(angleInfoModel.Load(angleParameter, { IsHistory: self.UseHistory }))
            .fail(function (xhr) {
                self.IsExecuted = true;
                self.EnableAnglePage(false);
                progressbarModel.EndProgressBar();

                // M4-8676: WC: "Forbidden, User is not allowed to access this angle.". error display if user open unauthorized angle. 
                if (xhr.status === 403) {
                    setTimeout(function () {
                        popup.OnCloseCallback = function () {
                            self.BackToSearch(false);
                        };
                    }, 500);
                }
                else if (xhr.status === 404) {
                    self.HandleNoneExistAngle();
                }
            })
            .then(function () {
                jQuery.localStorage('page_changed', false);
                var modelUri = angleInfoModel.Data().model;
                var model = modelsHandler.GetModelByUri(modelUri);
                if (!model || model.available !== true || model.model_status !== 'Up')
                    return modelsHandler.LoadModelInfo(modelUri);
                else
                    return jQuery.when();
            })
            .then(function () {
                angleData = angleInfoModel.Data();

                // check if displayParameter is ['default','list','chart','pivot'] then redirect to that
                var displayObject;
                if (displayModel.IsDisplayWithoutUri(displayParameter)) {
                    // find display
                    if (displayParameter === enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT) {
                        displayObject = WC.Utility.GetDefaultDisplay(angleData.display_definitions);
                    }
                    else {
                        displayObject = angleData.display_definitions.findObject('display_type', displayParameter);
                    }

                    if (displayObject) {
                        displayModel.LoadSuccess(displayObject);
                        displayParameter = displayObject.uri;

                        // reset history config
                        self.KeepHistory = true;
                        self.UseHistory = true;
                        self.UseLastestVersion = true;

                        // another query
                        var query = {};
                        jQuery.each($.address.parameterNames(), function (index, name) {
                            if (name !== enumHandlers.ANGLEPARAMETER.ANGLE && name !== enumHandlers.ANGLEPARAMETER.DISPLAY) {
                                query[name] = WC.Utility.UrlParameter(name);
                            }
                        });
                        window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
                    }
                    else {
                        self.BackToSearch(false);
                    }
                    return jQuery.when(false);
                }
                else {
                    displayObject = angleData.display_definitions.findObject('uri', displayParameter);
                    if (displayObject) {
                        displayModel.LoadSuccess(displayObject);

                        // reset history config
                        self.KeepHistory = true;
                        self.UseHistory = true;
                        self.UseLastestVersion = true;
                    }
                }

                if (isCreatedNewAngle) {
                    progressbarModel.SetDisableProgressBar();

                    var tempData = angleInfoModel.TemporaryAngle();
                    tempData.template = null;
                    angleInfoModel.TemporaryAngle(tempData);
                    jQuery.localStorage(angleInfoModel.TemporaryAngleName, tempData);

                    window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter));

                    setTimeout(function () {
                        progressbarModel.EndProgressBar();
                        angleDetailPageHandler.ShowPopup(angleDetailPageHandler.TAB.DESCRIPTION);
                        self.TogglePanel();
                    }, 200);
                    return jQuery.when(false);
                }

                // adhoc filters from dashboard
                var adhocFilters = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
                if (adhocFilters) {
                    // keep and it will be removed after succeeded.
                    self.AdhocFilters = adhocFilters;

                    // and then remove it
                    jQuery.localStorage.removeItem(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);

                    // do execute again
                    self.ExecuteAngle();

                    return jQuery.when(false);
                }

                // M4-33874 get parameterized from local storage (bug fixed in IE an Edge)
                var parameterizedOption = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION);

                // is parameterized
                if (parameterizedOption) {

                    // and then remove it
                    jQuery.localStorage.removeItem(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION);

                    self.IsFirstExecute = false;
                    angleQueryStepModel.ExcuteParameters(null);
                    displayQueryBlockModel.ExcuteParameters(null);

                    try {
                        var display = angleData.display_definitions.findObject('uri', displayParameter);
                        var isExecutionParameters = self.IsExecutionParameters(display);
                        if (parameterizedOption.angleQuery && isExecutionParameters) {
                            angleQueryStepModel.ExcuteParameters(parameterizedOption.angleQuery);
                            angleQueryStepModel.UpdateExecutionParameters();
                        }

                        if (parameterizedOption.displayQuery && isExecutionParameters) {
                            displayQueryBlockModel.ExcuteParameters(parameterizedOption.displayQuery);
                            displayQueryBlockModel.UpdateExecutionParameters();
                        }
                    }
                    catch (ex) {
                        // do something
                    }

                    // do execute again
                    self.ExecuteAngle();

                    return jQuery.when(false);
                }

                // is template angle
                if (!angleInfoModel.IsTemporaryAngle() && isTemplate) {
                    self.OpenAngleDetailPopupAfterExecuted = true;
                    resultModel.TemporaryAnglePosted = false;

                    // create adhoc Angle from template
                    var adhocAngleUrl = angleInfoModel.CreateFromTemplate(angleData);
                    if (!adhocAngleUrl) {
                        // if fail show message and redirect when click OK
                        self.HandleExecutionFailure(kendo.format(Localization.TemplateHasNoValidDisplay, angleInfoModel.Name()), false);
                    }
                    else {
                        // if ok then redirect to an adhoc Angle/Display
                        window.location.replace(adhocAngleUrl);

                        // show Angle popup (add delay to show)
                        self.ShowAngleDetailsPopupAfterTemplateCreated(angleData, displayParameter);
                    }

                    return jQuery.when(false);
                }

                // target
                if (target === enumHandlers.ANGLETARGET.PUBLISH) {
                    var targetQuery = {};
                    jQuery.each($.address.parameterNames(), function (index, name) {
                        if (name !== enumHandlers.ANGLEPARAMETER.ANGLE && name !== enumHandlers.ANGLEPARAMETER.DISPLAY && name !== enumHandlers.ANGLEPARAMETER.TARGET) {
                            targetQuery[name] = WC.Utility.UrlParameter(name);
                        }
                    });

                    window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, targetQuery));

                    setTimeout(function () {
                        // open angle popup
                        angleDetailPageHandler.ShowPopup(angleDetailPageHandler.TAB.PUBLISHING);
                    }, 1000);

                    return jQuery.when(false);
                }

                // set display info
                if (displayModel.IsTemporaryDisplay()) {
                    displayModel.LoadSuccess(tempDisplay);
                }
                else {
                    // get display info from angle def.
                    var currentDisplay = historyModel.Get(displayParameter, self.UseLastestVersion);
                    if (currentDisplay == null) {
                        self.IsExecuted = true;

                        angleInfoModel.Data().display_definitions.removeObject('uri', displayParameter);
                        angleInfoModel.Data.commit();
                        self.HandleNoneExistDisplay();

                        return jQuery.when(false);
                    }
                    displayModel.LoadSuccess(currentDisplay);
                }

                return jQuery.when(true);
            })
            .done(function (canContinue) {
                self.EnableAnglePage(true);

                if (!canContinue)
                    return;

                if (!isTemplate) {
                    self.UpdateAngleDisplayValidation();
                    self.ShowAngleDisplayInvalidMessage(self.OpenAngleDetailPopupAfterExecuted ? 1500 : 300);
                }

                displayData = displayModel.Data();

                // reset history config
                self.KeepHistory = true;
                self.UseHistory = true;
                self.UseLastestVersion = true;

                // list-drilldown
                if (listDrilldown) {
                    self.IsExecuted = true;
                    self.IsFirstExecute = false;

                    // check valid json for drilldown primary key data
                    try {
                        listDrilldown = JSON.parse(listDrilldown);
                        angleInfoModel.LoadMetadata(angleData, displayModel.Data())
                            .done(function () {
                                self.LoadResultFieldDone = true;
                                listDrilldownHandler.Apply(listDrilldown);
                            });
                    }
                    catch (e) {
                        window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter));
                    }

                    return;
                }
                else {
                    // back from list-drilldown
                    if (jQuery('html').hasClass('listDrilldown')) {
                        if (displayData.results && displayData.results.posted_display) {
                            resultModel.LoadSuccess(displayData.results);
                            resultModel.Data(displayData.results);
                        }
                        else {
                            resultModel.Data(null);
                        }
                    }
                    jQuery('html').removeClass('listDrilldown');
                }

                // apply adhoc filter from dashboard
                if (self.AdhocFilters.length) {
                    // apply filters to viewmodel
                    jQuery.each(self.AdhocFilters, function (index, filter) {
                        filter.is_adhoc_filter = true;
                        filter.is_dashboard_filter = true;
                        displayQueryBlockModel.QuerySteps.push(new WidgetFilterModel(filter));
                        displayQueryBlockModel.TempQuerySteps.push(new WidgetFilterModel(filter));
                    });
                    displayQueryBlockModel.SetDisplayQueryBlock(displayQueryBlockModel.CollectQueryBlocks());
                    historyModel.Save();
                }
                self.AdhocFilters = [];

                var canPostResult = self.CanPostResult();
                var isEditMode = self.IsEditMode();

                // show parameterized popup
                if (!isEditMode && self.IsExecutionParameters() && self.IsFirstExecute && canPostResult) {
                    self.IsExecuted = true;
                    self.IsFirstExecute = false;
                    self.ShowExecutionParameterPopup(angleInfoModel.Data(), displayData);
                    return;
                }

                // If angle is invalidated (query definition or query block in display)
                if (!canPostResult || !angleInfoModel.ModelServerAvailable || isEditMode) {
                    /* M4-8817: After POST /results fail still show angle/display details */
                    self.ApplyAngleAndDisplayWithoutResult(displayData);
                    return;
                }

                // can post a result
                progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_CheckingModel);
                return jQuery.when(
                    self.PostResult(ignoreDisplayQueryBlock, listDrilldown, displayParameter, angleData, displayData),
                    self.LoadAngleDisplayMetadata(angleData, displayData)
                )
                    .done(function (renderNewResult) {
                        self.CheckLoadMetadataDone(renderNewResult);
                    });
            });
    };
    self.ShowAngleDetailsPopupAfterTemplateCreated = function (angleData, displayParameter) {
        var displayTemplate = angleData.display_definitions.findObject("uri_template", displayParameter);
        var hasExecutionParameters = self.IsExecutionParameters(displayTemplate);
        var isSetExecutionParameters = hasExecutionParameters && (angleQueryStepModel.ExcuteParameters() || displayQueryBlockModel.ExcuteParameters());
        if (!hasExecutionParameters || isSetExecutionParameters) {
            self.DisableProgressbarCancelling = true;

            self.IsFirstExecute = false;
            setTimeout(function () {
                // open angle popup
                angleDetailPageHandler.ShowPopup(angleDetailPageHandler.TAB.DESCRIPTION);

                // remove save as button
                var btnSaveAs = angleDetailPageHandler.PopupElement.options.buttons.findObject('text', Localization.SaveAngleAs);
                btnSaveAs.className = 'alwaysHide';
                popup.SetButtons(angleDetailPageHandler.PopupElement, angleDetailPageHandler.PopupElement.options.buttons);
                angleDetailPageHandler.CheckExecuted();
            }, 1000);
        }
    };

    var isLoadMetadataDone = false;
    self.LoadAngleDisplayMetadata = function (angleData, displayData) {
        isLoadMetadataDone = false;
        return angleInfoModel.LoadMetadata(angleData, displayData)
            .fail(function (xhr, status) {
                popup.Close('#popupAngleDetail');
                if (status == null) {
                    errorHandlerModel.ShowCustomError(xhr);
                }

                setTimeout(function () {
                    if (jQuery('#ToggleWrapper').hasClass('fullDetail')) {
                        self.TogglePanel(false);
                    }
                    self.IsExecuted = true;
                    self.EnableAnglePage(false);
                    progressbarModel.EndProgressBar();
                }, 200);
            })
            .always(function () {
                isLoadMetadataDone = true;
            });
    };
    self.CheckLoadMetadataDone = function (renderNewResult) {
        var fnCheckLoadMetadataDone = setInterval(function () {
            if (isLoadMetadataDone) {
                clearInterval(fnCheckLoadMetadataDone);

                if (self.IsEditMode())
                    self.ApplyAngleAndDisplayWithoutResult(displayModel.Data());
                else if (renderNewResult)
                    resultModel.ApplyResult();
                else
                    self.ApplyExecutionAngle();
            }
        }, 10);
    };
    self.HandleExecutionFailure = function (message, redirectUrl) {
        popup.CloseAll();

        popup.Alert(Localization.Warning_Title, message);
        popup.OnCloseCallback = function () {
            popup.CloseAll();
            if (redirectUrl)
                window.location.replace(redirectUrl);
            else
                self.BackToSearch(false);
        };
    };
    self.HandleNoneExistAngle = function () {
        self.HandleExecutionFailure(Localization.ErrorAngleNotExistsThenGotoSearchPage, false);
    };
    self.HandleNoneExistDisplay = function () {
        // find default display
        var currentDisplay = displayModel.GetDefaultDisplay();
        if (currentDisplay == null) {
            // still does not found then back to search page
            self.HandleExecutionFailure(Localization.ErrorDisplayNotExistsThenGotoSearchPage, false);
        }
        else {
            // redirect to default display
            var defaultDisplayUrl = WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, currentDisplay.uri);
            self.HandleExecutionFailure(Localization.ErrorDisplayNotExistsThenGotoOtherDisplay, defaultDisplayUrl);
        }
    };
    /* BOF: M4-8817: After POST /results fail still show angle/display details */
    self.ApplyAngleAndDisplayWithoutResult = function (displayData) {
        self.IsFirstExecute = false;
        progressbarModel.SetDisableProgressBar();
        resultModel.ResultDateTime(0);

        // setup new authorization
        if (!angleInfoModel.ModelServerAvailable) {
            progressbarModel.EndProgressBar();

            // angle
            angleInfoModel.Data().authorizations = {
                create_private_display: false,
                create_public_display: false,
                'delete': false,
                mark_template: false,
                publish: false,
                unmark_template: false,
                unpublish: false,
                unvalidate: false,
                update: false,
                validate: false
            };
            angleInfoModel.Data.commit();

            // display
            displayModel.Data().authorizations = {
                'delete': false,
                make_angle_default: false,
                publish: false,
                unpublish: false,
                update: false
            };
            displayModel.Data.commit();

            if (!resultModel.Data()) {
                resultModel.Data({});
            }

            // result
            resultModel.Data().authorizations = resultModel.GetDefaultResultAuthorizations();
        }
        else {
            // result
            var isEditMode = self.IsEditMode();
            var canEditDisplay = isEditMode && displayData.authorizations.update;
            var isAngleInvalid = self.HandlerValidation.Angle.InvalidBaseClasses || self.HandlerValidation.Angle.InvalidFollowups;
            var isDisplayInvalid = self.HandlerValidation.Display.InvalidFieldsAll || self.HandlerValidation.Display.InvalidFields;
            var canChangeFieldCollection = !self.HandlerValidation.Angle.CanPostResult || self.HandlerValidation.Display.InvalidFollowups || self.HandlerValidation.Display.InvalidFilters;
            resultModel.Data({
                authorizations: {
                    change_query_filters: displayData.authorizations.update,
                    change_query_followups: displayData.authorizations.update,
                    change_display: false,
                    single_item_view: false,
                    add_aggregation: false,
                    add_filter: isAngleInvalid || isDisplayInvalid ? false : canEditDisplay,
                    add_followup: false,
                    sort: isAngleInvalid ? false : canEditDisplay,
                    'export': false,
                    change_field_collection: canChangeFieldCollection ? false : displayData.authorizations.update
                }
            });
        }

        resultModel.LoadResultFields(false)
            .done(function () {
                self.LoadResultFieldDone = true;

                self.ApplyExecutionAngle();

                self.BuildFieldSettingWhenNoResult(displayData);

                if (!angleInfoModel.ModelServerAvailable) {
                    var model = modelsHandler.GetModelByUri(angleInfoModel.Data().model);
                    popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_NoActiveModelInstance, model.id));
                }
            });
    };
    /* EOF: M4-8817: After POST /results fail still show angle/display details */
    self.PostResult = function (ignoreDisplayQueryBlock, listDrilldown, displayParameter, angleData, displayData) {
        // do not post new result if...
        // ever posted results
        // same display type & angle def. & display def.
        var postNewResult = true;
        var angleBlocks1 = [];
        var angleBlocks2 = [];
        var displayBlocks1 = [];
        var displayBlocks2 = [];
        if (resultModel.Data()) {
            jQuery.each(ko.toJS(angleData.query_definition), function (index, queryBlock) {
                angleBlocks1[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(queryBlock);
            });
            jQuery.each(WC.Utility.ToArray(ko.toJS(resultModel.Data().posted_angle)), function (index, queryBlock) {
                angleBlocks2[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(queryBlock);
            });
            jQuery.each(ko.toJS(displayQueryBlockModel.CollectQueryBlocks()), function (index, queryBlock) {
                displayBlocks1[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(queryBlock);
            });
            if (typeof resultModel.Data().posted_display === 'undefined') {
                displayBlocks2 = undefined;
            }
            else {
                jQuery.each(ko.toJS(resultModel.Data().posted_display), function (index, queryBlock) {
                    displayBlocks2[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(queryBlock);
                });
            }
        }

        var hasResultDataUrl = resultModel.Data() && resultModel.Data().uri;
        if (hasResultDataUrl
            && displayData.display_type === resultModel.Data().display_type
            && jQuery.deepCompare(angleBlocks1, angleBlocks2, false)
            && jQuery.deepCompare(displayBlocks1, displayBlocks2, false)) {
            postNewResult = false;
        }

        var option = {};
        if (postNewResult && !ignoreDisplayQueryBlock) {
            var containsDashboardFilters = displayQueryBlockModel.QuerySteps().hasObject('is_dashboard_filter', true);
            if (containsDashboardFilters || (resultModel.Data()
                && (!jQuery.deepCompare(angleBlocks1, angleBlocks2, false)
                    || !jQuery.deepCompare(displayBlocks1, displayBlocks2, false)))) {
                option.customQueryBlocks = displayQueryBlockModel.CollectQueryBlocks();
            }
        }
        else {
            /* BOF: M4-13681: Fixed sorting fields but didn't save display then post results after save angle, the post's data not included sorting steps */
            var savedQueryBlock = WC.Utility.ToArray(ko.toJS(historyModel.Get(displayModel.Data().uri, false).query_blocks));
            var savedSorts = [];
            if (savedQueryBlock.length) {
                savedQueryBlock[0] = WC.ModelHelper.RemoveReadOnlyQueryBlock(savedQueryBlock[0]);
                savedSorts = jQuery.grep(savedQueryBlock[0].query_steps, function (step) { return step.step_type === enumHandlers.FILTERTYPE.SORTING; });
            }
            var currentQueryBlock = WC.Utility.ToArray(ko.toJS(displayModel.Data().query_blocks));
            var currentSorts = [];
            if (currentQueryBlock.length) {
                currentQueryBlock[0] = WC.ModelHelper.RemoveReadOnlyQueryBlock(currentQueryBlock[0]);
                currentSorts = jQuery.grep(currentQueryBlock[0].query_steps, function (step) { return step.step_type === enumHandlers.FILTERTYPE.SORTING; });
            }

            if ((savedSorts.length || currentSorts.length) && !jQuery.deepCompare(savedSorts, currentSorts, false)) {
                option.customQueryBlocks = [{ queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS, query_steps: currentSorts }];
            }
            /* EOF: M4-13681: Fixed sorting fields but didn't save display then post results after save angle, the post's data not included sorting steps */
        }
        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_PostResult);
        self.IsFirstExecute = false;
        errorHandlerModel.Enable(false);
        var handleResultFailStatus = function (xhr, status, error) {
            if (status === 'abort' && self.IsEditMode()) {
                self.ApplyAngleAndDisplayWithoutResult(displayModel.Data());
            }
            else if (xhr.status !== 404) {
                if (xhr.status === 503) {
                    angleInfoModel.ModelServerAvailable = false;
                    setTimeout(function () {
                        errorHandlerModel.Enable(true);
                    }, 100);
                }
                else {
                    errorHandlerModel.Enable(true);
                    resultModel.ApplyResultFail(xhr, status, error);
                    errorHandlerModel.OnClickRetryErrorCallback = function () {
                        self.ExecuteAngle();
                    };
                }
                self.ApplyAngleAndDisplayWithoutResult(displayModel.Data());
            }
        };
        return jQuery.when(!postNewResult ? true : resultModel.PostResult(option))
            .then(function () {
                historyModel.Save();

                // keep posted result for original display
                if (!listDrilldown) {
                    var displayOriginal = historyModel.Get(displayParameter, false);
                    var hasResult = displayOriginal.results && displayOriginal.results.uri
                        && (!displayOriginal.results.posted_angle || !displayOriginal.results.posted_display);

                    if (displayOriginal && (!displayOriginal.results || hasResult)) {
                        displayOriginal.results = ko.toJS(resultModel.Data());
                        historyModel.Set(displayOriginal.uri + historyModel.OriginalVersionSuffix, displayOriginal);
                    }
                }

                progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_GETResults);

                var currentRenderInfo = {
                    display_type: displayModel.Data().display_type,
                    result_uri: resultModel.Data().uri
                };
                var renderNewResult = !self.CheckBeforeRender || JSON.stringify(currentRenderInfo) !== JSON.stringify(resultModel.LastRenderInfo);

                self.CheckBeforeRender = false;
                return resultModel.GetResult(resultModel.Data().uri)
                    .then(resultModel.LoadResultFields)
                    .then(function () {
                        return jQuery.when(renderNewResult);
                    });
            })
            .fail(handleResultFailStatus)
            .done(function () {
                if (resultModel.Data() && resultModel.Data().sorting_limit_exceeded) {
                    if (jQuery('#popupNotification').is(':visible')) {
                        popup.OnCloseCallback = function () {
                            setTimeout(function () {
                                popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_DisplaySortingReachedLimitation, resultModel.Data().sorting_limit_exceeded));
                            }, 100);
                        };
                    }
                    else {
                        popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_DisplaySortingReachedLimitation, resultModel.Data().sorting_limit_exceeded));
                    }
                }

                errorHandlerModel.Enable(true);

                self.LoadResultFieldDone = true;

                var display = historyModel.Get(displayModel.Data().uri, false);
                display.results = ko.toJS(resultModel.Data());
                historyModel.Set(display.uri + historyModel.OriginalVersionSuffix, display);

                display = historyModel.Get(displayModel.Data().uri);
                display.results = ko.toJS(resultModel.Data());
                historyModel.Set(display.uri, display);
            });
    };

    var checkUpdateDetailSection;
    self.ApplyExecutionAngle = function () {
        progressbarModel.EndProgressBar();
        self.RenderActionDropdownList();
        self.RenderDisplayDropdownlist();

        angleInfoModel.UpdateAngleQuerySteps(angleInfoModel.Data());
        displayQueryBlockModel.UpdateExecutionParameters();

        // set page title
        if (angleInfoModel.Name)
            WC.HtmlHelper.SetPageTitle(angleInfoModel.Name() + ' - ' + displayModel.Name() || '');

        var angleDescriptionData = angleInfoModel.Description();
        var angleQueryBlocksData = ko.toJS(angleInfoModel.Data().query_definition);
        var currentQueryStepsBlock = ko.toJS(angleQueryStepModel.GetQueryStep());
        angleQueryBlocksData.removeObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (currentQueryStepsBlock.length) {
            angleQueryBlocksData.push(currentQueryStepsBlock[0]);
        }
        if (self.HandlerAngleDetails) {
            self.HandlerAngleDetails.SetData(angleDescriptionData, angleQueryBlocksData);
        }
        else {
            self.HandlerAngleDetails = new WidgetDetailsHandler('#AngleDescriptionWrapper', angleDescriptionData, angleQueryBlocksData, []);
            self.HandlerAngleDetails.Angle = angleInfoModel.Data();
            self.HandlerAngleDetails.ModelUri = angleInfoModel.Data().model;
            self.HandlerAngleDetails.Labels.HeaderDescription = Localization.AngleDetails;
            self.HandlerAngleDetails.Labels.ButtonEdit = Localization.AnglePanelEditAngle;
            self.HandlerAngleDetails.FullMode(false);
            self.HandlerAngleDetails.IsVisibleModelRoles(false);
            self.HandlerAngleDetails.CanRemoveAdhocQuery(false);
            self.HandlerAngleDetails.ClickShowEditPopupString = 'angleDetailPageHandler.ShowPopup()';
            self.HandlerAngleDetails.ClickShowInfoPopupString = 'angleDetailPageHandler.ShowInfoPopup()';
            self.HandlerAngleDetails.ClickShowQueryStepsPopupString = 'angleDetailPageHandler.ShowPopup(angleDetailPageHandler.TAB.DEFINITION)';
            self.HandlerAngleDetails.ApplyHandler();
        }

        var displayDescriptionData = displayModel.Description();
        var displayQueryBlocksData = ko.toJS(displayQueryBlockModel.CollectQueryBlocks());
        if (self.HandlerDisplayDetails) {
            self.HandlerDisplayDetails.SetData(displayDescriptionData, displayQueryBlocksData);
        }
        else {
            // create display filters panel
            self.HandlerDisplayDetails = new WidgetDetailsHandler('#DisplayDescriptionWrapper', displayDescriptionData, displayQueryBlocksData, []);
            self.HandlerDisplayDetails.Angle = angleInfoModel.Data();
            self.HandlerDisplayDetails.ModelUri = angleInfoModel.Data().model;
            self.HandlerDisplayDetails.Labels.HeaderDescription = Localization.DisplayDetails;
            self.HandlerDisplayDetails.Labels.ButtonEdit = Localization.AnglePanelEditDisplay;
            self.HandlerDisplayDetails.FullMode(false);
            self.HandlerDisplayDetails.IsVisibleModelRoles(false);
            self.HandlerDisplayDetails.ClickShowEditPopupString = 'displayDetailPageHandler.ShowPopup()';
            self.HandlerDisplayDetails.ClickShowInfoPopupString = 'displayDetailPageHandler.ShowInfoPopup()';
            self.HandlerDisplayDetails.ClickShowQueryStepsPopupString = 'displayDetailPageHandler.ShowPopup(\'DisplayFilter\')';
            self.HandlerDisplayDetails.ApplyHandler();
        }

        self.IsExecuted = true;
        self.IsPosibleToEditModel = false;

        clearTimeout(checkUpdateDetailSection);
        checkUpdateDetailSection = setTimeout(function () {
            if (angleDetailPageHandler.HandlerLanguages) {
                angleDetailPageHandler.HandlerLanguages.LanguageSetSelect(angleDetailPageHandler.HandlerLanguages.Languages.Selected());
            }
            self.UpdateDetailSection();
        }, 1000);
    };
    self.EnableAnglePage = function (enable) {
        if (!enable) {
            jQuery('#ToggleAngle, #ActionDropdownList, #SelectedDisplay').addClass('disabled');
        }
        else {
            jQuery('#ToggleAngle, #ActionDropdownList, #SelectedDisplay').removeClass('disabled');
        }
    };
    self.InitialUserPrivileges = function () {
        userModel.SetManagementControlButton();
    };

    // execution parameters
    self.IsExecutionParameters = function (displayObject) {
        return angleInfoModel.Data().is_parameterized || (displayObject || displayModel.Data()).is_parameterized;
    };
    self.ShowExecutionParameterPopup = function (angle, display, isSwitchDisplay) {
        if (typeof isSwitchDisplay === 'undefined')
            isSwitchDisplay = false;

        progressbarModel.EndProgressBar();

        self.HandlerExecutionParameter = new ExecutionParameterHandler(angle, display);
        self.HandlerExecutionParameter.AngleEnable = !isSwitchDisplay;
        self.HandlerExecutionParameter.DisplayEnable = true;
        self.HandlerExecutionParameter.ModelUri = angleInfoModel.Data().model;
        self.HandlerExecutionParameter.ClickShowBaseClassInfoPopupString = 'angleDetailPageHandler.ShowBaseClassInfoPopup(this)';
        self.HandlerExecutionParameter.ShowExecutionParameterPopup();

        // override method
        self.HandlerExecutionParameter.SubmitExecutionParameters = function (option) {
            self.IsFirstExecute = false;

            if (isSwitchDisplay) {
                self.ClearDataBeforeSwitchDisplay(self.HandlerExecutionParameter.Display.uri);

                option.angleQuery = angleQueryStepModel.ExcuteParameters();
            }

            // M4-33874 get parameterized from local storage (bug fixed in IE an Edge)
            jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, option);

            var query = {};
            query[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
            window.location.replace(WC.Utility.GetAnglePageUri(self.HandlerExecutionParameter.Angle.uri, self.HandlerExecutionParameter.Display.uri, query));
            if (self.OpenAngleDetailPopupAfterExecuted) {
                setTimeout(function () {
                    angleDetailPageHandler.ShowPopup(angleDetailPageHandler.TAB.DESCRIPTION);
                    var btnSaveAs = angleDetailPageHandler.PopupElement.options.buttons.findObject('text', Localization.SaveAngleAs);
                    btnSaveAs.className = 'alwaysHide';
                    self.OpenAngleDetailPopupAfterExecuted = false;
                }, 500);
            }
        };
        if (isSwitchDisplay) {
            self.HandlerExecutionParameter.CancelExecutionParameters = jQuery.noop;
        }
        else {
            self.HandlerExecutionParameter.CancelExecutionParameters = function () {
                self.BackToSearch(true);
            };
        }
    };

    // display dropdown
    self.RenderDisplayDropdownlist = function () {
        if (angleInfoModel.Data()) {
            self.GenerateDisplayDropdownList(angleInfoModel.Data().display_definitions);
            WC.HtmlHelper.ApplyKnockout(displayModel.DisplayInfo, jQuery('#DisplayItemList'));
            self.SetSelectedDisplayDropdownList(displayModel.Data());
            self.ShowOrHideDisplayList(true);
            self.UpdateDisplaysDropdownLayout();
        }
    };
    self.GenerateDisplayDropdownList = function (displayDefinitions) {
        var displayList = [];
        jQuery.each(displayDefinitions, function (index, displayDefinition) {
            if ((angleInfoModel.IsTemporaryAngle() || !displayModel.IsTemporaryDisplay(displayDefinition.uri)) && displayDefinition.display_type) {
                displayList.push(self.GetDisplayInfo(displayDefinition));
            }
        });

        displayList.sortObject('Name', enumHandlers.SORTDIRECTION.ASC, false);

        displayModel.DisplayInfo.Displays(displayList);
    };
    self.GetDisplayInfo = function (displayDefinition) {
        var isFilter = WC.ModelHelper.HasFilter(displayDefinition.query_blocks);
        var isFollowup = WC.ModelHelper.HasFollowup(displayDefinition.query_blocks);
        var isPublic = displayDefinition.is_public;

        var displayValidation = validationHandler.GetDisplayValidation(displayDefinition, angleInfoModel.Data().model);
        var isError = displayValidation.Level === validationHandler.VALIDATIONLEVEL.ERROR;
        var isWarning = displayValidation.Level === validationHandler.VALIDATIONLEVEL.WARNING;

        var displayName = WC.Utility.GetDefaultMultiLangText(displayDefinition.multi_lang_name);

        var extendDisplayTypeClasses = [];
        if (displayDefinition.is_angle_default)
            extendDisplayTypeClasses.push('default');
        if (displayDefinition.used_in_task)
            extendDisplayTypeClasses.push('schedule');

        return {
            Id: displayDefinition.id,
            Uri: displayDefinition.uri,
            Name: displayName,
            DisplayType: displayDefinition.display_type,
            DisplayTypeClassName: displayDefinition.display_type || 'new',
            ExtendDisplayTypeClassName: extendDisplayTypeClasses.join(' '),
            FilterClassName: isFollowup ? 'followup' : (isFilter ? 'filter' : 'noFilter'),
            IsPublic: isPublic,
            PublicClassName: isPublic ? 'public' : 'private',
            CanDelete: displayDefinition.authorizations['delete'],
            IsError: isError,
            IsWarning: isWarning,
            ValidClassName: isError ? 'validError' : (isWarning ? 'validWarning' : 'none'),
            IsParameterized: displayDefinition.is_parameterized,
            ParameterizedClassName: displayDefinition.is_parameterized ? 'parameterized' : 'none'
        };
    };
    self.UpdateDisplaysDropdownLayout = function () {
        WC.HtmlHelper.AdjustNameContainer('#SelectedDisplay', null, function (size) { return size - 5; });
    };
    self.ShowOrHideDisplayList = function (forceHide) {
        if (jQuery('#SelectedDisplay').hasClass('disabled'))
            return;

        if (typeof forceHide === 'undefined')
            forceHide = false;

        var displayListElement = jQuery('#DisplayListSelection');
        var maxH = displayListElement.height();
        var isOpened = displayListElement.hasClass('open');
        if (jQuery('#DisplayItemList .DisplayOption').length)
            jQuery('#DisplayItemList').addClass('DisplayItemListContainerWithKeepFilter');
        else
            jQuery('#DisplayItemList').removeClass('DisplayItemListContainerWithKeepFilter');

        if (forceHide || isOpened) {
            jQuery('#DisplayListSelection, #SelectedDisplay').removeClass('open');
            jQuery('#DisplayListSelection .DisplayItemListContainer').animate({ top: -maxH }, 100, function () {
                displayListElement.hide();
            });
        }
        else {
            jQuery('#DisplayListSelection').show();
            self.UpdateDisplaysDropdownLayout();
            jQuery('#DisplayListSelection .DisplayItemListContainer').animate({ top: 0 }, 200, function () {
                jQuery('#DisplayListSelection, #SelectedDisplay').addClass('open');
            });
        }
    };
    self.SwitchDisplay = function (display) {
        requestHistoryModel.SaveLastExecute(self, self.SwitchDisplay, arguments);
        WC.Ajax.AbortAll();
        self.ShowOrHideDisplayList();
        var isEditMode = self.IsEditMode();

        // adhoc drilldown
        if (!isEditMode && displayModel.KeepFilter()) {
            // clear data
            fieldSettingsHandler.ClearFieldSettings();

            var switchDisplay = historyModel.Get(display.Uri, false);
            var querySteps = displayQueryBlockModel.QuerySteps();
            displayModel.AdhocDrilldown(querySteps, switchDisplay, false, null, true, angleInfoModel.Data().model);

            return;
        }

        // same display
        if (displayModel.Data().uri === display.Uri && !WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
            self.ClearDataBeforeSwitchDisplay(display.Uri);

            self.DisableProgressbarCancelling = true;
            self.ExecuteAngle(false);

            return;
        }

        // can execute parameters
        if (!isEditMode && self.CanPostResult() && display.IsParameterized) {
            var displayData = historyModel.Get(display.Uri, false);
            if (displayData) {
                self.ShowExecutionParameterPopup(angleInfoModel.Data(), displayData, true);

                return;
            }
        }

        // normal switch display
        displayQueryBlockModel.ExcuteParameters(null);
        self.ClearDataBeforeSwitchDisplay(display.Uri);

        var query = {};
        jQuery.each($.address.parameterNames(), function (index, name) {
            if (name === enumHandlers.ANGLEPARAMETER.EDITMODE || name === enumHandlers.ANGLEPARAMETER.VIEWMODE) {
                query[name] = WC.Utility.UrlParameter(name);
            }
        });
        window.location.href = WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, display.Uri, query);
    };
    self.ClearDataBeforeSwitchDisplay = function (switchDisplayUri) {
        if (self.IsEditMode()) {
            historyModel.LastDisplayUri(displayModel.Data().uri);
        }

        // do not use history but temporary(template) angle
        if (!angleInfoModel.IsTemporaryAngle()) {
            self.UseLastestVersion = false;
            self.KeepHistory = false;

            fieldSettingsHandler.ClearFieldSettings();

            // replace lastest version with original version
            var displayOriginal = historyModel.Get(switchDisplayUri, false);
            historyModel.Set(displayOriginal.uri, displayOriginal);
        }

        pivotPageHandler.IsUnSavePivot = false;
        chartHandler.GaugeValues = [];
        chartHandler.GaugeColours = [];
        resultModel.Data(null);
    };
    self.DeleteDisplay = function (display) {
        requestHistoryModel.SaveLastExecute(self, self.DeleteDisplay, arguments);

        var deleteDisplayCallback = function () {
            // delete display data
            angleInfoModel.Data().display_definitions.removeObject('uri', display.Uri);
            angleInfoModel.Data.commit();

            // remove display from model
            displayModel.DisplayInfo.Displays.remove(function (model) {
                return model.Uri === display.Uri;
            });

            // if remove current display.. redirect to default display
            if (display.Uri === WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY)) {
                // keep current query
                var query = {};
                jQuery.each($.address.parameterNames(), function (index, name) {
                    if (name !== enumHandlers.ANGLEPARAMETER.ANGLE
                        && name !== enumHandlers.ANGLEPARAMETER.DISPLAY
                        && name !== enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) {
                        query[name] = WC.Utility.UrlParameter(name);
                    }
                });

                // default display
                var defaultDisplay = WC.Utility.GetDefaultDisplay(angleInfoModel.Data().display_definitions, true);
                window.location.replace(WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, defaultDisplay.uri, query));
            }
        };
        var handleDeleteError = function (xhr) {
            if (xhr.status === 404) {
                angleInfoModel.Data().display_definitions.removeObject('uri', display.Uri);
                angleInfoModel.Data.commit();

                self.RenderDisplayDropdownlist();
            }
            else if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr)) {
                progressbarModel.CancelFunction = jQuery.noop;
                var resolveAngleDisplayCallback = function () {
                    jQuery.when(displayModel.ForcedDelete(display.Uri))
                        .done(deleteDisplayCallback);
                };
                resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(xhr, resolveAngleDisplayCallback);
            }
            else {
                errorHandlerModel.BuildCustomAjaxError({ url: display.Uri, type: 'DELETE' }, xhr);
            }
        };
        var deleteDisplay = function () {
            errorHandlerModel.Enable(false);
            jQuery.when(displayModel.Delete(display.Uri))
                .fail(handleDeleteError)
                .done(deleteDisplayCallback)
                .always(errorHandlerModel.EnableErrorByDelay);
        };

        if (self.ValidateDeleteDisplay(display)) {
            popup.Confirm(kendo.format(Localization.Confirm_DeleteDisplay, display.Name), deleteDisplay);
        }
    };
    self.ValidateDeleteDisplay = function (display) {
        var publicDisplays = angleInfoModel.Data().display_definitions.findObjects('is_public', true);
        if (angleInfoModel.IsPublished() && publicDisplays.length === 1 && display.IsPublic) {
            popup.Alert(Localization.Alert_Title, Localization.Info_RequiredOneMoreDisplayToProcess);
            return false;
        }
        return true;
    };
    self.SetSelectedDisplayDropdownList = function (model) {
        var container = jQuery('#SelectedDisplay');
        var selectedElement = container.find('.SelectedDisplayItem');
        var displayInfo = self.GetDisplayInfo(model);

        // public
        var iconPublic;
        if (!angleInfoModel.IsTemporaryAngle() && displayModel.IsTemporaryDisplay(model.uri)) {
            iconPublic = 'new';
        }
        else {
            iconPublic = displayInfo.PublicClassName;
        }

        // display type
        var iconDisplay = (model.display_type || 'list') + ' ' + displayInfo.ExtendDisplayTypeClassName;

        jQuery('#SelectedDisplayPointer').attr('title', displayInfo.Name);
        selectedElement.find('.name').text(displayInfo.Name);
        selectedElement.find('.front .icon:eq(0)').attr('class', 'icon ' + iconPublic);
        selectedElement.find('.front .icon:eq(1)').attr('class', 'icon ' + iconDisplay);
        selectedElement.find('.front .icon:eq(2)').attr('class', 'icon ' + displayInfo.FilterClassName);
        selectedElement.find('.rear .icon:eq(0)').attr('class', 'icon ' + displayInfo.ParameterizedClassName);
        selectedElement.find('.rear .icon:eq(1)').attr('class', 'icon ' + displayInfo.ValidClassName);

        self.AddNewClassToDisplayListItemWhenSelected(model.uri);
    };
    self.AddNewClassToDisplayListItemWhenSelected = function (uri) {
        var targetElement = jQuery('.ItemList');
        if (targetElement.length) {
            jQuery('.ItemList').each(function (index, element) {
                jQuery(element).removeClass('ItemListSelected');

                if (jQuery(element).attr('alt') === uri) {
                    jQuery(element).addClass('ItemListSelected');
                }
            });
        }
        else {
            window.setTimeout(function () {
                self.AddNewClassToDisplayListItemWhenSelected(uri);
            }, 1000);
        }
    };
    self.CanKeepFilter = function () {
        if (self.IsEditMode()) {
            return false;
        }

        var isTemporaryDisplayAndHasQueriesStep = displayModel.IsTemporaryDisplay() || displayQueryBlockModel.GetQueryStepByType(enumHandlers.FILTERTYPE.FILTER).length > 0;
        return userModel.GetAngleAllowMoreDetailsAuthorization(angleInfoModel.Data().uri)
            && displayModel.DisplayInfo.Displays().length > 0
            && displayQueryBlockModel.GetAllFollowupSteps().length === 0
            && isTemporaryDisplayAndHasQueriesStep;
    };

    // action dropdown
    // extended from AngleActionMenuHandler

    // dashboard
    self.NewDashboardData = null;
    self.ShowAddToDashboardPopup = function () {
        requestHistoryModel.SaveLastExecute(self, self.ShowAddToDashboardPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;
        
        var popupName = 'AddToDashboard',
            popupSettings = {
                title: Localization.AddToDashboard,
                element: '#popup' + popupName,
                html: addToDashboardHtmlTemplate(),
                className: 'popup' + popupName + ' disabled',
                buttons: [
                    {
                        text: Captions.Button_Cancel,
                        click: 'close',
                        position: 'right'
                    },
                    {
                        text: Localization.Ok,
                        isPrimary: true,
                        className: 'btnCreateDashboard executing',
                        click: function (e, obj) {
                            if (popup.CanButtonExecute(obj) && self.ValidateCreateDashboard()) {
                                jQuery(obj).addClass('disabled');
                                self.CreateDashboard();

                                if (jQuery('#exitingDashboardRadioButton').is(':checked')) {
                                    e.preventDefault();
                                }
                            }
                            else {
                                e.preventDefault();
                            }
                        },
                        position: 'right'
                    }
                ],
                resizable: false,
                actions: ["Close"],
                open: function (e) {
                    if (!e.sender.isPopupInitialized) {
                        jQuery('#newDashboardRadioButton').prop('checked', true);
                        jQuery('#dashboardNameTextbox').prop('disabled', false);
                    }

                    if (jQuery.localStorage('is_dashboard_created')) {
                        jQuery('#newDashboardRadioButton').prop('checked', false);
                        jQuery('#exitingDashboardRadioButton').prop('checked', true);
                    }

                    // set default dashboard name
                    var bps = [];
                    jQuery.each(businessProcessesModel.General.Data(), function (index, bp) {
                        if (jQuery.inArray(bp.id, angleInfoModel.Data().assigned_labels) !== -1) {
                            bps.push(bp.abbreviation || bp.id);
                        }
                    });
                    jQuery('#dashboardNameTextbox').val(bps.join(',') + ' ' + angleInfoModel.Name() + ' ' + userModel.DisplayName());

                    // set save button link
                    self.NewDashboardData = dashboardModel.GetInitialTemporaryData();
                    self.NewDashboardData.model = angleInfoModel.Data().model;

                    var params = {};
                    params[enumHandlers.DASHBOARDPARAMETER.NEW] = true;
                    var newDashboardUrl = WC.Utility.GetDashboardPageUri(self.NewDashboardData.uri, params);
                    e.sender.wrapper.find('.k-window-buttons .btnCreateDashboard').attr({
                        href: newDashboardUrl,
                        target: '_blank'
                    });

                    self.ShowAddToDashboardPopupCallback();
                }
            };

        popup.Show(popupSettings);
    };
    self.ShowAddToDashboardPopupCallback = function () {
        jQuery('#exitingDashboardRadioButton').prop('disabled', true);
        WC.HtmlHelper.DropdownList('#dashboardDropdownlist', [{ id: '', name: '...' }], {
            enable: false
        });

        dashboardModel.LoadAllDashboards()
            .done(self.RenderAllDashboardDrodpownlist);
    };
    self.CloseAddToDashboardPopup = function () {
        popup.Close('#popupAddToDashboard');
    };
    self.RenderAllDashboardDrodpownlist = function (data) {
        var renderDashboards = [];
        var selectingDashboard = null;
        var isDashboardCreated = jQuery.localStorage('is_dashboard_created');

        if (data != null) {
            // find name to increase 'name' property
            jQuery.each(data.dashboards, function (index, dashboard) {
                var isPublishedDashboardWithPublicDisplay = dashboard.is_published && displayModel.Data().is_public;
                var isUnpublishedDashsboardByCreatorUser = !dashboard.is_published && dashboard.created.user === userModel.Data().uri;
                if (!dashboard.is_validated
                    && (isPublishedDashboardWithPublicDisplay || isUnpublishedDashsboardByCreatorUser)) {
                    dashboard.name = WC.Utility.GetDefaultMultiLangText(dashboard.multi_lang_name);
                    if (!dashboard.widget_definitions) {
                        dashboard.widget_definitions = [];
                    }
                    renderDashboards.push(dashboard);

                    var isDashboardCreatedByCreatorUser = isDashboardCreated && dashboard.created.user === userModel.Data().uri;
                    if (isDashboardCreatedByCreatorUser
                        && !selectingDashboard
                        || (selectingDashboard && dashboard.created.datetime > selectingDashboard.createdate)) {
                        selectingDashboard = {
                            id: dashboard.id,
                            createdate: dashboard.created.datetime
                        };
                    }
                }
            });
        }

        var dropdownlist = WC.HtmlHelper.DropdownList('#dashboardDropdownlist', renderDashboards);

        // set default dashboard
        if (!selectingDashboard) {
            if (renderDashboards.length) {
                dropdownlist.value(renderDashboards[0].id);
            }
        }
        else {
            dropdownlist.value(selectingDashboard.id);
        }

        if (renderDashboards.length) {
            if (jQuery('#exitingDashboardRadioButton').prop('checked')) {
                dropdownlist.enable(true);
            }
            jQuery('#exitingDashboardRadioButton').prop('disabled', false);
        }
        else {
            jQuery('#newDashboardRadioButton').prop('checked', true);
            jQuery('#exitingDashboardRadioButton').prop('disabled', true);
        }


        jQuery('input[type=radio][name=createDashboardType]').change(function () {
            if (this.value === 'NewDashboard') {
                jQuery('#dashboardNameTextbox').prop('disabled', false);
                dropdownlist.enable(false);
            }
            else if (this.value === 'ExitingDashboard') {
                jQuery('#dashboardNameTextbox').prop('disabled', true);

                if (dropdownlist.items().length > 0)
                    dropdownlist.enable(true);
            }
        });

        jQuery('.popupAddToDashboard .k-window-buttons .btn').removeClass('disabled executing');
    };
    self.ValidateCreateDashboard = function () {
        if (jQuery('#newDashboardRadioButton').is(':checked')) {
            var dashboardName = jQuery.trim(jQuery('#dashboardNameTextbox').val());
            if (!dashboardName) {
                popup.Alert(Localization.Warning_Title, Localization.Info_RequiredDashboardName);
                return false;
            }
        }
        else {
            var dropdown = WC.HtmlHelper.DropdownList('#dashboardDropdownlist');
            var dashboard = dropdown.dataItem() || null;

            if (!dashboard) {
                popup.Info(Localization.Info_WarningSelectExistingDashboard);
                return false;
            }

            if (dashboard && dashboard.widget_definitions.length >= maxNumberOfDashboard) {
                popup.Info(Localization.Info_WarningCannotAddMoreDashboard);
                return false;
            }
        }

        return true;
    };
    self.CreateDashboard = function () {
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var widgetObject = {
            angle: angleInfoModel.Data()[dashboardModel.KeyName],
            display: displayModel.Data()[dashboardModel.KeyName],
            widget_details: JSON.stringify({
                model: angleInfoModel.Data().model
            }),

            // required fields but do not use for now
            multi_lang_name: [{
                lang: defaultLanguage,
                text: ' '
            }],
            multi_lang_description: [{
                lang: defaultLanguage,
                text: ''
            }],
            widget_type: 'angle_display'
        };

        if (jQuery('#newDashboardRadioButton').is(':checked')) {
            self.CreateNewDashboard(widgetObject);
        }
        else {
            self.AddToExistingDashboard(widgetObject);
        }
    };
    self.CreateNewDashboard = function (widgetObject) {
        var data = self.NewDashboardData;
        data.multi_lang_name[0].text = jQuery.trim(jQuery('#dashboardNameTextbox').val());
        data.widget_definitions.push(widgetObject);

        // awake dashboard model
        dashboardModel.SetData(data, false, false);
        data = dashboardModel.GetData();

        dashboardModel.Angles = [ko.toJS(angleInfoModel.Data())];
        data.assigned_labels = dashboardModel.GetBusinessProcesses();

        jQuery.when(dashboardModel.SaveTemporaryDashboard(data))
            .done(function () {
                jQuery.localStorage('is_dashboard_created', true);

                self.CloseAddToDashboardPopup();
            });
    };
    self.AddToExistingDashboard = function (widgetObject) {
        requestHistoryModel.SaveLastExecute(self, self.AddToExistingDashboard, arguments);

        var dropdown = WC.HtmlHelper.DropdownList('#dashboardDropdownlist'),
            dashboard = dropdown.dataItem() || null;

        if (dashboard) {
            dashboard.widget_definitions.push(widgetObject);
            delete dashboard.layout;

            // set DashboardModel
            dashboardModel.SetData(dashboard, false, false);
            dashboard = dashboardModel.GetData();

            widgetObject.id = dashboard.widget_definitions[dashboard.widget_definitions.length - 1].id;

            jQuery.when(dashboardModel.AddWidget(widgetObject, dashboard.layout))
                .done(function () {
                    popup.Info(kendo.format(Localization.Info_AddDisplayToDashboardSucceed, WC.Utility.GetDashboardPageUri(dashboardModel.Data().uri)));
                    self.CloseAddToDashboardPopup();
                    $("#btn-popupAddToDashboard1").prop("disabled", false);
                });
        }
    };

    self.UpdateAngleQueryStep = function () {
        var queryBlock = angleInfoModel.Data().query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (queryBlock) {
            angleQueryStepModel.SetQueryStep(queryBlock.query_steps);
        }
        else {
            angleQueryStepModel.SetQueryStep([]);
        }
    };
    self.ConfirmRemoveInvalidQuerySteps = function (querySteps, isCopy, invalidQuerySteps, saveFunction) {

        var filterTexts = [];

        if (invalidQuerySteps.length !== 0) {
            jQuery.each(invalidQuerySteps, function (index, queryStep) {
                filterTexts.push('<ul>' + WC.WidgetFilterHelper.GetFilterText(queryStep, angleInfoModel.Data().model) + '</ul>');
            });
        }

        var nameList = filterTexts.join('');
        var okFunction = function () {
            var validQuerySteps = jQuery.grep(querySteps(), function (queryStep) {
                var isValidFilter = queryStep.step_type === enumHandlers.FILTERTYPE.FILTER && queryStep.valid !== false;
                return isValidFilter
                    && (queryStep.operator === enumHandlers.OPERATOR.HASVALUE.Value || queryStep.operator === enumHandlers.OPERATOR.HASNOVALUE.Value || queryStep.arguments.length !== 0);
            });
            var otherQuerySteps = jQuery.grep(querySteps(), function (queryStep) {
                var isValidQueryStep = queryStep.valid !== false;
                return isValidQueryStep
                    && (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP || queryStep.step_type === enumHandlers.FILTERTYPE.SORTING);
            });
            var aggQuerySteps = jQuery.grep(querySteps(), function (queryStep) {
                var isValidQueryStep = queryStep.step_type === enumHandlers.FILTERTYPE.AGGREGATION && queryStep.valid !== false;
                return isValidQueryStep;
            });
            var postQuerySteps = validQuerySteps.concat(otherQuerySteps, aggQuerySteps);
            querySteps.removeAll();
            querySteps.push.apply(querySteps, postQuerySteps);
            saveFunction.call(this, isCopy);
        };
        var cancelFunction = function () {
            angleDetailPageHandler.IsSubmit = false;
        };

        popup.Confirm(kendo.format(Localization.Confirm_InvalidQueryWillBeRemoved, nameList), okFunction, cancelFunction);
    };
    self.BuildFieldSettingWhenNoResult = function (display) {
        if (display.display_type === enumHandlers.DISPLAYTYPE.LIST) {
            if (self.HandlerValidation.Angle.InvalidBaseClasses || !display.authorizations.update) {
                listHandler.ReadOnly(true);
                listHandler.DashBoardMode(true);
            }
            else {
                listHandler.ReadOnly(false);
                listHandler.DashBoardMode(false);
            }
            listHandler.GetListDisplay();
        }
        else if (display.display_type === enumHandlers.DISPLAYTYPE.CHART) {
            chartHandler.GetChartDisplay(false);
        }
        else if (display.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            pivotPageHandler.GetPivotDisplay(false);
        }
    };
    self.UpdateAngleDisplayValidation = function () {
        var angle = ko.toJS(angleInfoModel.Data());
        angle.query_definition = angleQueryStepModel.CollectQueryBlocks(true);

        var display = ko.toJS(displayModel.Data());
        display.query_blocks = displayQueryBlockModel.CollectQueryBlocks(true);

        self.HandlerValidation.Angle = validationHandler.GetAngleValidation(angle);
        self.HandlerValidation.Display = validationHandler.GetDisplayValidation(display, angle.model);
        self.HandlerValidation.Valid = self.HandlerValidation.Angle.Valid && self.HandlerValidation.Display.Valid;
    };
    self.ShowAngleDisplayInvalidMessage = function (delay) {
        if (!self.HandlerValidation.Valid) {
            setTimeout(function () {
                var angleUri = angleInfoModel.Data().uri;
                var displayUri = displayModel.Data().uri;
                var validations = [];
                if (!self.HandlerValidation.Angle.Valid && !self.HandlerValidation.ShowValidationStatus[angleUri]) {
                    validations.push(self.HandlerValidation.Angle);
                }
                if (!self.HandlerValidation.Display.Valid && !self.HandlerValidation.ShowValidationStatus[displayUri]) {
                    validations.push(self.HandlerValidation.Display);
                }
                var messages = validationHandler.GetAllInvalidMessages.apply(self, validations);

                self.HandlerValidation.ShowValidationStatus[angleUri] = true;
                self.HandlerValidation.ShowValidationStatus[displayUri] = true;

                if (messages.length) {
                    var errorMessage = validationHandler.GetAllInvalidMessagesHtml(messages);
                    var win = popup.Alert(Localization.Warning_Title, errorMessage, {
                        buttons: [
                            {
                                text: Localization.Ok,
                                isPrimary: true,
                                click: 'close',
                                position: 'right'
                            }
                        ]
                    });
                    win.toFront();
                    win.element.find('.notificationIcon').attr('class', 'notificationIcon alert');
                }

                // M4-15151: Open angle details when angle not executed
                if (!jQuery('#ToggleWrapper').hasClass('fullDetail') && !jQuery('html').hasClass('listDrilldown')) {
                    self.TogglePanel(false);
                }
                if ((displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.CHART || displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT)
                    && jQuery('#AngleTableWrapper .displayWrapper').hasClass('full')) {
                    fieldSettingsHandler.ToggleFieldListArea();
                }
            }, delay || 0);
        }
    };
    self.CanPostResult = function () {
        return self.HandlerValidation.Angle.CanPostResult && self.HandlerValidation.Display.CanPostResult;
    };
    /*EOF: Model Methods*/

    // initialize method
    if (typeof isLoginPage === 'undefined') {
        var canEditId = jQuery.localStorage('can_edit_id');
        self.CanEditId = ko.observable(canEditId == null ? window.showAngleAndDisplayID : canEditId);

        self.InitialAnglePage();
        jQuery(function () {
            self.InitialAnglePageCallback();
        });
        jQuery(window).off('resize.angle').on('resize.angle', function () {
            if (!jQuery.isReady)
                return;

            self.UpdateDetailSection();
            self.UpdateLayout(300);

            var definitionList = jQuery('.definitionList:visible .FilterCriteriaPlaceHolder');
            if (definitionList.length) {
                var filterHandler = ko.dataFor(definitionList.parents('.definitionList:first').get(0));
                if (filterHandler) {
                    filterHandler.View.AdjustLayout();
                }
            }
        });
        jQuery(window).off('beforeunload.angle').on('beforeunload.angle', function () {
            jQuery.localStorage('page_changed', true);
            WC.Ajax.AbortLongRunningRequest();
            WC.Ajax.DeleteResult();
            return;
        });
    }
}

var anglePageHandler = new AnglePageHandler();
