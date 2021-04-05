measurePerformance.SetStartTime(true);
window.ListDrilldownCache = {};

function AnglePageHandler() {
    "use strict";

    var self = this;
    var _self = {};
    _self.angleData = null;
    // extend method from AngleActionMenuHandler.js
    jQuery.extend(self, new AngleActionMenuHandler(self));

    /*BOF: Model Properties*/
    self.IsPageInitialized = false;
    self.IsExecuted = false;
    self.AdhocFilters = [];
    self.ExecutionParameterInfo = {};
    self.CheckBeforeRender = false;
    self.HandlerExecutionParameter = null;
    self.HandlerFind = null;
    self.HandlerValidation = {
        Valid: true,
        Angle: validationHandler.GetAngleValidation(null),
        Display: validationHandler.GetDisplayValidation(null),
        ShowValidationStatus: {}
    };
    self.HandlerSidePanel = new AngleSidePanelHandler();
    self.HandlerAngle = new AngleHandler({});
    self.HandlerDisplay = new DisplayHandler({}, self.HandlerAngle);
    self.HandlerState = new AngleStateHandler();
    self.HandlerDisplayOverview = new DisplayOverviewHandler(self.HandlerAngle);
    self.HandlerAngleSaveAction = new AngleSaveActionHandler(self.HandlerAngle, self.HandlerState);
    self.LoadResultFieldDone = false;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.InitialAnglePage = function (callback) {
        searchStorageHandler.Initial(false, true, false);

        // check Angle and Display
        if (!self.CheckAngle())
            return;

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
                    systemCurrencyHandler.LoadCurrencies(),
                    defaultExcelDatastoreHandler.LoadDatastoreSettings(undefined, false),
                    excelTemplateFilesHandler.LoadFileDetails({"fileType":"ExcelTemplate"}, false)
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
            self.InitialContent();

            // check currency
            userSettingsPanelHandler.CheckUserCurrency();

            // set firstLogin status
            jQuery.localStorage('firstLogin', 0);

            // tooltip
            WC.HtmlHelper.Tooltip.Create('actionmenu', '#ActionDropdownListPopup .actionDropdownItem', false, TOOLTIP_POSITION.BOTTOM);

            // menu navigatable
            WC.HtmlHelper.MenuNavigatable('#UserControl', '#UserMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#Help', '#HelpMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#BtnDisplayOverview', '#DisplayOverview', '.listview-item', 'hover', 'active');
            WC.HtmlHelper.MenuNavigatable('#BtnNewDisplay', '#NewDisplay', '.listview-item');
            WC.HtmlHelper.MenuNavigatable('th.k-header', '.HeaderPopupList', 'a');
            WC.HtmlHelper.MenuNavigatable('.k-widget.chart-type', '.chart-type-dropdown', '.chart-icon');
            WC.HtmlHelper.MenuNavigatable('.dxpgHeaderText', '.HeaderPopupView', 'a');

            //Binding knockout
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#HelpMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#UserMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#ActionDropdownList'));
            WC.HtmlHelper.ApplyKnockout(self.HandlerState, jQuery('#AngleStatesWrapper .states-wrapper'));

            self.SetWrapperHeight();

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
            jQuery.clickOutside('#NotificationsFeedMenu', '#NotificationsFeed');
            jQuery.clickOutside('.languageAvailableList', '.btnAddLanguage');
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
            jQuery.clickOutside('#AngleSavingWrapper .saving-options', function (e) {
                var excepts = [
                    '#AngleSavingWrapper .btn-saving-options',
                    '#AngleSavingWrapper .saving-options'
                ];
                if (isHide(e.target, excepts))
                    jQuery('#AngleSavingWrapper .saving-options').hide();
            });

            WCNotificationsFeedCreator.Create(userModel.Data().id);
        }

        if (typeof callback === 'function')
            callback();
    };
    self.InitialContent = function () {
        // side panel + splitter + html stuff
        self.HandlerSidePanel.InitialAngle(self.SaveSidePanelCallback);
        self.SetHandlerAngle();

        self.HandlerAngle.InitialAngleUserSpecific();

        // display overview
        self.HandlerDisplayOverview.Initial();
        self.HandlerDisplayOverview.Redirect = self.Redirect;
        self.HandlerDisplayOverview.SwitchDisplay = self.SwitchDisplay;
        self.HandlerDisplayOverview.CreateNewDisplay = displayModel.CreateNewDisplay;
        self.HandlerDisplayOverview.DeleteDisplay = self.DeleteDisplay;
        self.HandlerDisplayOverview.ShowEditDescriptionPopup = self.ShowEditDescriptionPopup;

        // save actions
        self.InitialSaveActions();

        // active!
        jQuery('#ContentWrapper').addClass('active');
    };
    self.CheckAngle = function () {
        // check Angle and Display
        var ahocAngle = angleInfoModel.GetTemporaryAngle();
        var angleUri = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
        var displayUri = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        if (!angleUri || !displayUri || WC.ModelHelper.IsAdhocUri(angleUri) && jQuery.isEmptyObject(ahocAngle)) {
            self.BackToSearch(false);
            return false;
        }

        // set adhoc Angle if applicable with uri
        if (ahocAngle.uri === angleUri)
            self.HandlerAngle.ForceInitial(ahocAngle);

        return true;
    };
    self.CheckSaveQueryDefinition = function (skipChecker, callback) {
        if (!self.HandlerAngle.QueryDefinitionHandler.HasChanged(false, true))
            return;

        // check validation
        var validation = self.HandlerAngle.QueryDefinitionHandler.Validate();
        if (!validation.valid) {
            popup.Alert(Localization.Warning_Title, validation.message);
            return;
        }

        // validate angle
        if (!self.HandlerAngle.Validate()) {
            return;
        }

        // confirm
        var checker = function () {
            return skipChecker === true ? false : self.HandlerAngle.QueryDefinitionHandler.CanSave() && self.HandlerAngle.IsConflict();
        };
        var sendcallback = jQuery.proxy(callback, self.HandlerAngle);

        self.HandlerAngle.ConfirmSave(checker, sendcallback);
    };
    self.SetHandlerAngle = function () {
        // description
        self.HandlerAngle.SaveDescriptionDone = function () {
            self.HandlerAngle.parent.prototype.SaveDescriptionDone.apply(self.HandlerAngle, arguments);
            self.ApplyExecutionAngle();
        };

        // filters & jumps
        self.HandlerAngle.__SaveQueryDefinition = self.HandlerAngle.SaveQueryDefinition;
        self.HandlerAngle.SaveQueryDefinition = function (skipChecker) {
            self.CheckSaveQueryDefinition(skipChecker, self.HandlerAngle.__SaveQueryDefinition);
        };
        self.HandlerAngle.SaveQueryDefinitionDone = function () {
            self.HandlerAngle.QueryDefinitionHandler.ForcedSetData = true;
            self.HandlerAngle.QueryDefinitionHandler.HideProgressbar();
            if (!self.HandlerAngle.IsAdhoc())
                toast.MakeSuccessTextFormatting(self.HandlerAngle.GetName(), Localization.Toast_SaveItem);
            self.HandlerAngle.ExecuteQueryDefinition(QueryDefinitionHandler.ExecuteAction.Saved);
        };

        self.HandlerAngle.ExecuteQueryDefinition = function () {
            // forced to execute a new result
            self.HandlerDisplay.ClearPostResultData();

            // save all Displays then execute
            self.SaveAll(true, true);
        };

        self.HandlerAngle.CancelQueryDefinitionWithJump = jQuery.noop;
        self.HandlerAngle.SetProxyFunctions();

        // trigger knockout both Angle & Display
        self.ApplyKnockoutInfoSection();
        WC.HtmlHelper.ApplyKnockout(self.HandlerAngle, jQuery('#TabContentAngle .section-description'));
        WC.HtmlHelper.ApplyKnockout(self.HandlerAngle, jQuery('#TabContentAngle .section-personal-note'));
        WC.HtmlHelper.ApplyKnockout(self.HandlerAngle, jQuery('#TabDetails .tab-menu-angle .action'), true);
        self.HandlerAngle.QueryDefinitionHandler.ApplyHandler(jQuery('#TabContentAngle .section-definition'), '.definition-body-inner');
        self.ApplyKnockoutDisplayTab();

        // Display result handling
        listHandler.OnChanged = self.CheckUpdatingDisplay;
        listHandler.OnRenderStart = self.OnDisplayRenderStart;
        listHandler.OnRenderEnd = self.OnDisplayRenderEnd;
        chartHandler.OnChanged = self.CheckUpdatingDisplay;
        chartHandler.OnRenderStart = self.OnDisplayRenderStart;
        chartHandler.OnRenderEnd = self.OnDisplayRenderEnd;
        pivotPageHandler.OnChanged = self.CheckUpdatingDisplay;
        pivotPageHandler.OnRenderStart = self.OnDisplayRenderStart;
        pivotPageHandler.OnRenderEnd = self.OnDisplayRenderEnd;
        self.HandlerAngle.SetEditId(self.CanEditId());
    };
    self.SetHandlerDisplay = function (handler) {
        self.HandlerDisplay = handler;
        self.HandlerAngle.SetQueryDefinitionAuthorizations();
        self.HandlerDisplay.SetQueryDefinitionAuthorizations();
        self.HandlerAngle.SetCurrentDisplay(handler);
        listDrilldownHandler.SetDisplayHandler(self.HandlerDisplay);

        self.HandlerDisplay.OnChangeDefaultDrilldown = function () {
            var details = self.HandlerDisplay.GetDetails();
            displayModel.Data().display_details = JSON.stringify(details);
            displayModel.Data.commit();
            self.ApplyExecutionAngle();
        };

        self.HandlerDisplay.OnChangeExcelTemplate = function () {
            var details = self.HandlerDisplay.GetDetails();
            displayModel.Data().display_details = JSON.stringify(details);
            displayModel.Data.commit();
            self.ApplyExecutionAngle();
        };

        // display options
        self.HandlerDisplay.IsAngleDefaultChanged = function () {
            self.HandlerDisplay.SetAngleDefault();
            self.ApplyExecutionAngle();
            return true;
        };
        self.HandlerDisplay.IsUserDefaultChanged = function () {
            self.HandlerDisplay.SetUserDefault();
            self.ApplyExecutionAngle();
            return true;
        };
        self.HandlerDisplay.ExecuteOnLoginChanged = function () {
            self.ApplyExecutionAngle();
            return true;
        };

        // description
        self.HandlerDisplay.SaveDescriptionDone = function () {
            self.HandlerDisplay.parent.prototype.SaveDescriptionDone.apply(self.HandlerDisplay, arguments);
            self.ApplyExecutionAngle();
        };

        // filters & jumps
        self.HandlerDisplay.SaveQueryDefinitionDone = function () {
            self.HandlerDisplay.parent.prototype.SaveQueryDefinitionDone.apply(self.HandlerDisplay, arguments);
            self.HandlerDisplay.ExecuteQueryDefinition(QueryDefinitionHandler.ExecuteAction.Saved);
        };
        self.HandlerDisplay.QueryDefinitionHandler.ClickDropArea = function () {
            if (!self.HandlerDisplay.QueryDefinitionHandler.HasChanged(false, false)) {
                self.HandlerSidePanel.OpenAngleAccordion(enumHandlers.ACCORDION.DEFINITION);            
                self.HandlerSidePanel.Open(0);
            }
        };
        self.HandlerDisplay.ExecuteQueryDefinition = function () {
            // forced to execute a new result
            if (self.HandlerDisplay.ResultHandler.HasChanged()) {
                self.HandlerDisplay.ClearPostResultData();
            }

            // update flag
            var querySteps = [];
            jQuery.each(self.HandlerDisplay.QueryDefinitionHandler.Data(), function (_index, queryStep) {
                var data = ko.toJS(queryStep);
                data.is_adhoc_filter = data.is_adhoc;

                // update applied flag to adhoc
                if (data.is_adhoc) {
                    data.is_applied = true;
                    queryStep.is_applied = true;
                }

                querySteps.push(data);
            });

            // update to old query steps model
            var updateQueryBlocks = displayQueryBlockModel.CollectQueryBlocks(querySteps);
            displayQueryBlockModel.SetDisplayQueryBlock(updateQueryBlocks);

            //M4-64003: Remove "Save" from Apply button in Display details
            //Update the definition object with the recent updated
            self.HandlerDisplay.QueryDefinitionHandler.ForcedSetData = true;
            self.HandlerDisplay.InitialQueryDefinition(updateQueryBlocks);

            // execute
            self.ExecuteAngle();
        };
        self.HandlerDisplay.SetProxyFunctions();

        // trigger knockout for Display
        self.ApplyKnockoutInfoSection();
        self.HandlerSidePanel.SetDisplayTemplates();
        self.ApplyKnockoutDisplayTab();
        self.HandlerDisplay.UpdateAngleQueryDefinition();
        self.HandlerDisplay.QueryDefinitionHandler.RefreshQuerySteps();
    };
    self.CheckUpdatingDisplay = function (display, isSaved,isRemoveColoumn) {
        var displayData = jQuery.extend(self.HandlerDisplay.GetData(), ko.toJS({
            fields: display.fields,
            display_details: display.display_details,
            query_blocks: display.query_blocks
        }));
        if (isSaved && self.HandlerDisplay.GetRawData()) {
            displayData = display;
            self.HandlerDisplay.SetRawData(displayData);
        }
        self.HandlerDisplay.SetData(displayData);
        self.HandlerDisplay.QueryDefinitionHandler.InitialAggregation();
        displayModel.LoadSuccess(displayData);

        !isRemoveColoumn && self.ApplyExecutionAngle();
    };
    self.OnDisplayRenderStart = function () {
        self.HandlerDisplayOverview.CanSwitchDisplay(false);
        self.HandlerDisplay.QueryDefinitionHandler.ShowAggregationProgressBar();
    };
    self.OnDisplayRenderEnd = function () {
        self.HandlerDisplayOverview.CanSwitchDisplay(true);
        self.HandlerDisplay.QueryDefinitionHandler.HideAggregationProgressBar();
        self.HandlerDisplayOverview.IsVisibleKeepFilter(self.HandlerDisplayOverview.CanKeepFilter());
        self.HandlerDisplayOverview.UpdateExecutionInfo();
    };
    self.ApplyKnockoutInfoSection = function () {
        WC.HtmlHelper.ApplyKnockout(self.HandlerAngle, jQuery('#ContentWrapper .section-info'), true);
    };
    self.ApplyKnockoutDisplayTab = function () {
        WC.HtmlHelper.ApplyKnockout(self.HandlerDisplay, jQuery('#TabContentDisplay .section-description'));
        self.HandlerDisplay.QueryDefinitionHandler.ApplyHandler(jQuery('#TabContentDisplay .section-definition'), '.definition-body-inner');
        self.HandlerDisplay.QueryDefinitionHandler.ApplyAggregationHandler(jQuery('#TabContentDisplay .section-aggregation'), '.aggregation-body');
        WC.HtmlHelper.ApplyKnockout(self.HandlerDisplay, jQuery('#TabContentDisplay .section-display-options'));
        WC.HtmlHelper.ApplyKnockout(self.HandlerDisplay, jQuery('#TabDetails .tab-menu-display .action'), true);
    };
    self.SaveSidePanelCallback = function () {
        self.UpdateLayout(0);
    };
    self.UpdateSidePanelHandlers = function () {
        // labels
        self.HandlerAngle.InitialLabel(jQuery('.section-labels'));

        // tags
        self.HandlerAngle.InitialTag(jQuery('.section-tags'));

        // Default Drilldown
        if (self.HandlerDisplay.Data().display_type !== enumHandlers.DISPLAYTYPE.LIST)
            self.HandlerDisplay.InitialDefaultDrilldown('.section-default-drilldown');

        // Excel Template
        self.HandlerDisplay.InitialExcelTemplate('.section-default-excel-template');

        // angle_default_display
        var angleDefaultDisplay = self.HandlerAngle.GetDefaultDisplay();
        angleDefaultDisplay.Data().is_angle_default(true);
        angleDefaultDisplay.SetAngleDefault();

        // trigger update handlers
        var notifyHandler = function (handler) {
            handler.ReadOnly.notifySubscribers();
            jQuery.each(handler.Data(), function (index, data) {
                data.is_adhoc.notifySubscribers();
            });
            jQuery.each(handler.Aggregation(), function (index, data) {
                data.is_adhoc.notifySubscribers();
            });
        };
        notifyHandler(self.HandlerAngle.QueryDefinitionHandler);
        notifyHandler(self.HandlerDisplay.QueryDefinitionHandler);
        notifyHandler(self.HandlerDisplay.QueryDefinitionHandler.Parent());
    };
    self.Redirect = function (displayId) {
        var redirectUrl = self.GetRedirectUrl(displayId);
        WC.Utility.RedirectUrl(redirectUrl);
    };
    self.GetRedirectUrl = function (displayId) {
        var display = self.HandlerAngle.Displays.findObject('Data', function (data) { return data().id() === displayId; })
            || self.HandlerAngle.GetDefaultDisplay();
        self.MarkAsExecutedParameter(display);
        var query = self.CreateAngleQuery([]);
        return WC.Utility.GetAnglePageUri(self.HandlerAngle.Data().uri, display.Data().uri, query);
    };

    // save actions
    self.InitialSaveActions = function () {
        self.HandlerAngleSaveAction.Initial('#AngleSavingWrapper');
        self.HandlerAngleSaveAction.GetDisplayHandler = function () {
            return self.HandlerDisplay;
        };
        self.HandlerAngleSaveAction.Redirect = self.Redirect;
        self.HandlerAngleSaveAction.ExecuteAngle = self.ExecuteAngle;
    };
    self.HasAnyChanged = function () {
        return self.HandlerAngleSaveAction.EnableSaveAll();
    };
    self.SaveAll = function (forcedExecuteAngle, forcedSaveAngle) {
        return self.HandlerAngleSaveAction.ForceSaveAll(forcedExecuteAngle, forcedSaveAngle);
    };
    self.SetSaveActions = function () {
        self.HandlerAngleSaveAction.UpdateActions();
    };

    self.IsEditMode = function () {
        return !!WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE);
    };
    self.ExitEditMode = function () {
        WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE, null);
    };
    self.BackToSearch = function (showProgress) {
        if (typeof showProgress === 'undefined')
            showProgress = true;
        if (showProgress) {
            progressbarModel.ShowStartProgressBar(Localization.Redirecting, false);
            progressbarModel.CancelForceStop = true;
        }

        WC.Utility.RedirectUrl(searchStorageHandler.GetSearchUrl());
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
    var updateLayoutChecker;
    self.UpdateLayout = function (delay) {
        clearTimeout(updateLayoutChecker);
        updateLayoutChecker = setTimeout(function () {
            WC.HtmlHelper.AdjustToolbar();
            self.SetWrapperHeight();
            listHandler.UpdateLayout(0);
            if (self.HandlerValidation.Valid) {
                chartHandler.UpdateLayout(0);
                pivotPageHandler.UpdateLayout(0);
            }
            self.HandlerDisplayOverview.UpdateScrollButtonState();
            kendo.resize(jQuery('#ContentWrapper'));
        }, delay);
    };
    self.SetWrapperHeight = function () {
        var wraperHeight = WC.Window.Height;
        wraperHeight -= jQuery('.mainDisplayWrapper').offset().top;

        jQuery('.mainDisplayWrapper, .mainDisplayWrapper .displayArea').height(wraperHeight);

        var tabContentElement = jQuery('#TabDetails .tab-content-wrapper');
        tabContentElement.height(WC.Window.Height - tabContentElement.offset().top);
    };
    self.CleanElements = function () {
        jQuery(document).trigger('click.outside');
        jQuery(document).trigger('click.jeegoocontext');

        jQuery([
            '#popupFindAngleResult',
            '#popupFieldChooser',
            '#HelpTextPopup',
            '#popupListFilter',
            '#popupSaveAs',
            '#popupAngleResultSummary',
            '#popupAngleInfo',
            '#popupDisplayInfo',
            '#popupDisplayDetail',
            '#popupFollowup',
            '#popupExportExcel',
            '#popupExportToCSV',
            '#popupAddToDashboard',
            '#PopupDescriptionEditor',
            '#PopupSaveAs',
            '#PopupAggregationFormat'
        ].join(',')).each(function () {
            popup.Close(this);
        });

        // close all color pickers
        jQuery('[data-role="customcolorpicker"]').each(function () {
            var handler = jQuery(this).data('handler');
            if (handler)
                handler.close();
        });
    };
    self.CheckEditMode = function () {
        var forceEditId = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITID);
        if (forceEditId) {
            self.CanEditId(forceEditId === 'true');
            jQuery.localStorage('can_edit_id', self.CanEditId());
            var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
            var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
            var query = self.CreateAngleQuery([enumHandlers.ANGLEPARAMETER.EDITID]);
            window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
            return false;
        }

        var isEditMode = self.IsEditMode();
        if (isEditMode) {
            jQuery('html').addClass('editmode');
        }
        else {
            jQuery('html').removeClass('editmode');
        }
        return true;
    };
    self.CheckStartTime = function () {
        var isEditMode = self.IsEditMode();
        if (!isEditMode) {
            var startTime = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.STARTTIMES);
            if (startTime) {
                measurePerformance.StartTime = startTime;
                var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
                var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
                var query = self.CreateAngleQuery([enumHandlers.ANGLEPARAMETER.STARTTIMES]);
                window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
                return false;
            }
            else {
                measurePerformance.SetStartTime();
            }
        }
        return true;
    };
    self.CheckModelServer = function () {
        if (!modelsHandler.HasData()) {
            popup.Info(Localization.Info_NoModelsReturn);
            popup.OnCloseCallback = function () {
                self.BackToSearch(false);
            };
            return false;
        }
        return true;
    };
    self.CheckModelStatus = function () {
        return modelsHandler.LoadModelInfo(self.HandlerAngle.Data().model)
            .done(function () {
                if (self.HandlerAngle.Online())
                    self.SetModelServerAvailable();
                else
                    self.SetModelServerUnavailable({});
            });
    };
    self.ShowProgressbar = function () {
        var cancelFunction = progressbarModel.KeepCancelFunction ? progressbarModel.CancelFunction : function () {
            WC.Page.Stop();
            self.HandlerDisplay.ResultHandler.Cancel();

            setTimeout(function () {
                var query = self.CreateAngleQuery([]);
                query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
                var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
                window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, query));
            }, 100);
        };
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_GettingAngle, false);
        progressbarModel.SetDisableProgressBar();
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = cancelFunction;
        progressbarModel.KeepCancelFunction = false;
    };
    self.LoadAngle = function (uri) {
        var loadAdhocDisplays = function (data) {
            var adhocDisplays = displayModel.TemporaryDisplay() || {};
            var results = {};
            jQuery.each(self.HandlerAngle.Displays, function (index, display) {
                results[display.Data().uri] = display.ResultHandler.GetData();
            });
            jQuery.each(adhocDisplays, function (displayUri, displayData) {
                if (!self.HandlerAngle.GetRawDisplay(displayUri) && !self.HandlerAngle.GetDisplay(displayUri))
                    self.HandlerAngle.AddDisplay(displayData, results[displayUri], true);
            });
            return jQuery.when(data);
        };
        var load = function () {
            if (self.HandlerAngle.Data().uri === uri) {
                // Angle is loaded
                return jQuery.when(self.HandlerAngle.GetRawData());
            }
            else if (WC.ModelHelper.IsAdhocUri(uri)) {
                // adhoc Angle
                var data = angleInfoModel.GetTemporaryAngle();
                self.HandlerAngle.ForceInitial(data);
                return jQuery.when(data);
            }
            else {
                // saved Angle
                self.HandlerAngle.ClearData();
                return self.HandlerAngle.Load(uri)
                    .then(function (data) {
                        // update execution parameter flag
                        if (self.ExecutionParameterInfo[data.uri])
                            self.HandlerAngle.QueryDefinitionHandler.IsExecutedParameters = true;
                        jQuery.each(self.HandlerAngle.Displays, function (index, display) {
                            if (self.ExecutionParameterInfo[display.Data().uri])
                                display.QueryDefinitionHandler.IsExecutedParameters = true;
                        });

                        return jQuery.when(data);
                    });
            }
        };
        return load()
            .then(loadAdhocDisplays)
            .then(function (data) {
                self.UpdateOldAngleModel(data);
                return jQuery.when(data);
            });
    };
    self.UpdateOldAngleModel = function (data) {
        if (jQuery.isEmptyObject(data))
            return;

        // update to old model
        angleInfoModel.SetData(data);
    };

    self.CreateAngleQuery = function (excludes) {
        excludes = WC.Utility.ToArray(excludes);
        jQuery.merge(excludes, [enumHandlers.ANGLEPARAMETER.ANGLE, enumHandlers.ANGLEPARAMETER.DISPLAY]);
        var query = {};
        jQuery.each($.address.parameterNames(), function (index, name) {
            if (jQuery.inArray(name, excludes) === -1) {
                query[name] = WC.Utility.UrlParameter(name);
            }
        });
        return query;
    };
    self.CheckDisplay = function () {
        // check if displayParameter is ['default'] then redirect to that
        var angleData = _self.angleData !== null ? _self.angleData: self.HandlerAngle.GetData();
        var displayObject;
        var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
        var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        if (displayModel.IsDisplayWithoutUri(displayParameter)) {
            // find display
            displayObject = WC.Utility.GetDefaultDisplay(angleData.display_definitions);
            if (displayObject) {
                // another query
                var query = self.CreateAngleQuery([]);
                window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayObject.uri, query));
            }
            else {
                self.BackToSearch(false);
            }
            return false;
        }
        else {
            // check from Displays
            displayObject = self.HandlerAngle.GetDisplay(displayParameter);

            // no Display then use a default Display
            if (!displayObject) {
                var defaultQuery = self.CreateAngleQuery([]);
                window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT, defaultQuery));
                return false;
            }
            return true;
        }
    };
    self.SetDisplay = function () {
        // set Display
        var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        var display = self.HandlerAngle.GetDisplay(displayParameter);
        if (!display) {
            self.HandleNoneExistDisplay();
            return false;
        }
        self.SetHandlerDisplay(display);
        displayModel.LoadSuccess(display.GetData());
        return true;
    };
    self.CheckNewAngle = function () {
        var isCreatedNewAngle = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.CREATENEW);
        if (isCreatedNewAngle) {
            progressbarModel.SetDisableProgressBar();
            var createAngleQuery = self.CreateAngleQuery([enumHandlers.ANGLEPARAMETER.CREATENEW]);
            var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
            var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
            window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, createAngleQuery));
            return false;
        }
        return true;
    };
    self.CheckTemplate = function () {
        var isTemplate = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.TEMPLATE);
        if (isTemplate) {
            // create adhoc Angle from template
            var angleData = self.HandlerAngle.GetData();
            var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
            var templateInfo = angleInfoModel.CreateFromTemplate(angleData, displayParameter);
            if (!templateInfo) {
                // if fail show message and redirect when click OK
                self.HandleExecutionFailure(kendo.format(Localization.TemplateHasNoValidDisplay, self.HandlerAngle.GetName()), false);
            }
            else {
                // set template to model
                var data = angleInfoModel.GetTemporaryAngle();
                self.HandlerAngle.ForceInitial(data);
                self.UpdateOldAngleModel(data);

                // if ok then redirect to an adhoc Angle/Display
                var templateQuery = self.CreateAngleQuery([enumHandlers.ANGLEPARAMETER.TEMPLATE]);
                window.location.replace(WC.Utility.GetAnglePageUri(templateInfo.angle, templateInfo.display, templateQuery));
            }
            return false;
        }
        return true;
    };
    self.CheckAdhocFilters = function () {
        // adhoc filters from dashboard
        var adhocFilters = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);
        if (adhocFilters) {
            // keep and it will be removed after succeeded.
            self.AdhocFilters = adhocFilters;

            // and then remove it
            jQuery.localStorage.removeItem(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS);

            // do execute again
            self.ExecuteAngle();

            return false;
        }
        return true;
    };
    self.MarkAsExecutedParameter = function (handler) {
        self.ExecutionParameterInfo[handler.Data().uri] = true;
        handler.QueryDefinitionHandler.IsExecutedParameters = true;
    };
    self.CheckExecutionParameters = function () {
        
        if (self.HandlerDisplay.IsAdhoc()) {
            self.MarkAsExecutedParameter(self.HandlerDisplay);
        }

        // M4-33874 get parameterized from local storage (bug fixed in IE an Edge)
        var parameterizedOption = jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION);
        if (parameterizedOption) {
            // and then remove it
            jQuery.localStorage.removeItem(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION);
            try {
                if (parameterizedOption.angleQuery) {
                    self.HandlerAngle.QueryDefinitionHandler.SetExecutedParameters(parameterizedOption.angleQuery.execution_parameters);
                    self.ExecutionParameterInfo[self.HandlerAngle.Data().uri] = true;
                }
                if (parameterizedOption.displayQuery) {
                    self.HandlerDisplay.QueryDefinitionHandler.SetExecutedParameters(parameterizedOption.displayQuery.execution_parameters);
                    self.ExecutionParameterInfo[self.HandlerDisplay.Data().uri] = true;
                }
            }
            catch (ex) {
                // do something
            }

            // do execute again
            self.ExecuteAngle();

            return false;
        }
        return true;
    };
    self.TransferExecutionParameterInfo = function (newAngle) {
        // transfer execution paramter flag, in case create Angle from template

        self.ExecutionParameterInfo[newAngle.uri] = true;
        jQuery.each(self.HandlerAngle.Displays, function (index, display) {
            if (!display.QueryDefinitionHandler.IsExecutedParameters)
                return;

            var newDisplay = newAngle.display_definitions.findObject('id', display.Data().id());
            if (newDisplay)
                self.ExecutionParameterInfo[newDisplay.uri] = true;
        });
    };
    self.CheckTarget = function () {
        var target = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.TARGET);
        if (target) {
            var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
            var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
            var targetQuery = self.CreateAngleQuery([enumHandlers.ANGLEPARAMETER.TARGET]);
            window.location.replace(WC.Utility.GetAnglePageUri(angleParameter, displayParameter, targetQuery));

            setTimeout(function () {
                // open angle popup
                if (target === enumHandlers.ANGLETARGET.PUBLISH)
                    jQuery('#ShowPublishSettingsButton').trigger('click');
                else if (target === enumHandlers.ANGLETARGET.VALIDATE)
                    jQuery('#ShowValidateButton').trigger('click');
            }, 1000);
            return false;
        }
        return true;
    };
    self.ExecuteAngle = function () {
        self.ClearResultErrorXhr();
        WC.Ajax.AbortAll();

        var angleParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE);
        var displayParameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY);
        var listDrilldown = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) || false;
        if (listDrilldown) {
            listDrilldown = unescape(listDrilldown);
        }
        self.LoadResultFieldDone = false;

        // hide no need stuff
        self.CleanElements();

        if (!self.CheckEditMode()
            || !self.CheckStartTime()
            || !self.CheckModelServer())
            return;

        fieldSettingsHandler.ClearFieldSettings();
        jQuery('#AngleTableWrapper').removeClass('hiddenContent');
        jQuery('#AngleGrid .k-virtual-scrollable-wrap').scrollLeft(0);

        self.IsExecuted = false;
        self.EnableAnglePage(true);

        self.ShowProgressbar();
        self.LoadAngle(angleParameter)
            .fail(function (xhr) {
                self.IsExecuted = true;
                self.EnableAnglePage(false);
                progressbarModel.EndProgressBar();

                // M4-8676: WC: Forbidden, User is not allowed to access this angle.
                // error display if user open unauthorized angle.
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
                return self.CheckModelStatus();
            })
            .then(function () {
                _self.angleData = self.HandlerAngle.GetData();
                return jQuery.when(
                    self.CheckDisplay()
                    && self.CheckNewAngle()
                    && self.CheckTemplate()
                    && self.SetDisplay()
                    && self.CheckAdhocFilters()
                    && self.CheckExecutionParameters()
                );
            })
            .done(function (canContinue) {
                self.EnableAnglePage(true);

                if (!canContinue)
                    return;

                //Get angle data
                var angleData = _self.angleData !== null ? _self.angleData : self.HandlerAngle.GetData()

                // show invalid message
                // - there is 1s delay in CheckTarget, add 1s to show a message
                self.UpdateAngleDisplayValidation(angleData);
                var target = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.TARGET);
                self.ShowAngleDisplayInvalidMessage(target ? 1300 : 300);

                // list-drilldown
                var displayData = displayModel.Data();
                if (listDrilldown) {
                    self.IsExecuted = true;

                    // check valid json for drilldown primary key data
                    try {
                        listDrilldown = JSON.parse(listDrilldown);
                        self.HandlerSidePanel.Disable();
                        angleInfoModel.LoadMetadata(self.HandlerAngle.GetData(), displayModel.Data())
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
                            resultModel.ClearResult();
                        }
                    }
                    jQuery('html').removeClass('listDrilldown');
                    self.HandlerSidePanel.Enable();
                }

                // apply adhoc filter from dashboard
                if (self.AdhocFilters.length) {
                    // apply filters to viewmodel
                    self.HandlerSidePanel.Open(1);
                    jQuery.each(self.AdhocFilters, function (index, filter) {
                        filter.edit_mode = false;
                        filter.is_applied = true;
                        filter.is_adhoc = true;
                        filter.is_adhoc_filter = true;
                        filter.is_dashboard_filter = true;
                        displayQueryBlockModel.QuerySteps.push(new WidgetFilterModel(filter));
                        displayQueryBlockModel.TempQuerySteps.push(new WidgetFilterModel(filter));
                        self.HandlerDisplay.QueryDefinitionHandler.AddQueryFilter(filter);
                    });
                    displayQueryBlockModel.SetDisplayQueryBlock(displayQueryBlockModel.CollectQueryBlocks());
                    self.AdhocFilters = [];
                    self.HandlerDisplay.ExecuteQueryDefinition(QueryDefinitionHandler.ExecuteAction.Adhoc);
                    return;
                }

                // show parameterized popup
                if (self.CanExecutionParameters(self.HandlerDisplay)) {
                    self.IsExecuted = true;
                    self.ShowExecutionParameterPopup(angleData, self.HandlerDisplay.GetData());
                    return;
                }

                // target
                if (!self.CheckTarget())
                    return;

                // If angle is invalidated (query definition or query block in display)
                var canPostResult = self.CanPostResult(self.HandlerValidation.Display);
                if (!canPostResult || !angleInfoModel.ModelServerAvailable) {
                    /* M4-8817: After POST /results fail still show angle/display details */
                    self.ApplyAngleAndDisplayWithoutResult(displayData);
                    return;
                }

                // can post a result
                progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_CheckingModel);
                return jQuery.when(
                    self.PostResult(),
                    self.LoadAngleDisplayMetadata(angleData, displayData)
                )
                    .done(self.CheckLoadMetadataDone);
            });
    };
    self.InitialBreadcrumb = function () {
        angleBreadcrumbHandler.ShowEditPopup = jQuery.proxy(self.HandlerAngle.ShowEditDescriptionPopup, self.HandlerAngle);
        var viewModels = [];

        // item
        var angleName = self.HandlerAngle.GetName();
        var validated = self.HandlerAngle.Data().is_validated();
        var template = self.HandlerAngle.Data().is_template();
        viewModels.push(angleBreadcrumbHandler.GetAngleViewModel(angleName, validated, template));

        // drilldown
        if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN))
            viewModels.push(angleBreadcrumbHandler.GetDrilldownViewModel(listDrilldownHandler.PrimaryData, self.HandlerAngle.Data().model));

        angleBreadcrumbHandler.Initial(jQuery('.breadcrumb-wrapper'), viewModels);
    };

    var isLoadMetadataDone = false;
    self.LoadAngleDisplayMetadata = function (angleData, displayData) {
        isLoadMetadataDone = false;
        return angleInfoModel.LoadMetadata(angleData, displayData)
            .fail(function (xhr, status) {
                if (status === null) {
                    errorHandlerModel.ShowCustomError(xhr);
                }

                setTimeout(function () {
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
        if (!currentDisplay) {
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
        var isEditMode = self.IsEditMode();
        if (isEditMode)
            self.HandlerDisplay.ClearPostResultData();
        progressbarModel.SetDisableProgressBar();
        self.SetWrapperHeight();

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
            });
    };
    /* EOF: M4-8817: After POST /results fail still show angle/display details */
    self.ResultErrorXhr = null;
    self.PostResult = function () {
        var renderNewResult = true;
        self.ClearResultErrorXhr();
        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_PostResult);
        self.HandlerDisplay.ResultHandler.CustomError = true;
        return self.HandlerDisplay.PostResult()
            .progress(function (data) {
                var queuedMessage;
                if (data.queue_position === 0) {
                    queuedMessage = Localization.ExecutingAngleMessage;
                }
                else if (!data.queue_position) {
                    queuedMessage = '';
                }
                else {
                    queuedMessage = kendo.format(data.queue_position === 1 ? Localization.FirstInQueueMessage : Localization.LaterInQueueMessage, data.queue_position);
                }
                progressbarModel.SetProgressBarTextAndMessage(kendo.toString(data.progress * 100, 'n2'), queuedMessage);
                if (data.cancelable)
                    progressbarModel.SetEnableProgressBar();
                else
                    progressbarModel.SetDisableProgressBar();
            })
            .fail(function (xhr, status) {
                errorHandlerModel.IgnoreAjaxError(xhr);
                if (xhr.status === 503) {
                    self.SetModelServerUnavailable(xhr);
                }

                var displayData = self.HandlerDisplay.GetData();
                if (status === 'abort' && self.IsEditMode()) {
                    self.ApplyAngleAndDisplayWithoutResult(displayData);
                }
                else if (xhr.status !== 404) {
                    self.ResultErrorXhr = xhr;
                    self.ApplyAngleAndDisplayWithoutResult(displayData);
                }
            })
            .then(function (data) {
                var currentRenderInfo = {
                    display_type: displayModel.Data().display_type,
                    result_uri: resultModel.Data() ? resultModel.Data().uri : ''
                };
                resultModel.LoadSuccess(data);
                renderNewResult = !self.CheckBeforeRender || JSON.stringify(currentRenderInfo) !== JSON.stringify(resultModel.LastRenderInfo);
                self.CheckBeforeRender = false;
                return resultModel.LoadResultFields(true);
            })
            .then(function () {
                self.LoadResultFieldDone = true;
                return jQuery.when(renderNewResult);
            });
    };
    self.ClearResultErrorXhr = function () {
        self.ResultErrorXhr = null;
        jQuery('#AngleTableWrapper .areaErrorContainer').remove();
    };
    self.SetModelServerUnavailable = function (xhr) {
        xhr.responseText = kendo.format(Localization.Info_NoActiveModelInstance, self.HandlerAngle.GetModelName());
        self.ResultErrorXhr = xhr;
        angleInfoModel.ModelServerAvailable = false;
    };
    self.SetModelServerAvailable = function () {
        self.ResultErrorXhr = null;
        angleInfoModel.ModelServerAvailable = true;
    };

    self.ApplyExecutionAngle = function () {
        progressbarModel.EndProgressBar();
        self.UpdateSidePanelHandlers();
        self.RenderActionDropdownList();
        self.RenderDisplayTabs();
        self.SetWrapperHeight();

        // trigger save button
        self.SetSaveActions();

        angleInfoModel.UpdateAngleQuerySteps(angleInfoModel.Data());

        // set page title
        if (self.HandlerAngle.GetName())
            WC.HtmlHelper.SetPageTitle(self.HandlerAngle.GetName() + ' - ' + self.HandlerDisplay.GetName() || '');

        // Update Angle's states
        self.HandlerState.SetAngleData(self.HandlerAngle.GetData());

        // breadcrumb
        self.InitialBreadcrumb();

        self.IsExecuted = true;

        // active side panel
        self.HandlerSidePanel.SetActive();

        self.UpdateLayout(500);
    };
    self.EnableAnglePage = function (enable) {
        var elements = jQuery([
            '#ActionDropdownList',
            '#SelectedDisplay',
            '#AngleSavingWrapper .saving-wrapper',
            '#AngleStatesWrapper .states-wrapper'
        ].join(','));
        if (!enable) {
            elements.addClass('disabled');
        }
        else {
            elements.removeClass('disabled');
        }
    };
    self.InitialUserPrivileges = function () {
        userModel.SetManagementControlButton();
        userModel.SetWorkbenchButton();
    };

    // execution parameters
    self.CanExecutionParameters = function (displayHandler) {
        var validation = validationHandler.GetDisplayValidation(displayHandler.GetData(), self.HandlerAngle.Data().model);
        var canPostResult = self.CanPostResult(validation);
        var isExecuted = function (handler) {
            return !handler.Data().is_parameterized || handler.QueryDefinitionHandler.IsExecutedParameters;
        };
        return canPostResult && (!isExecuted(self.HandlerAngle) || !isExecuted(displayHandler));
    };
    self.ShowExecutionParameterPopup = function (angle, display, isSwitchDisplay) {
        if (typeof isSwitchDisplay === 'undefined')
            isSwitchDisplay = false;

        progressbarModel.EndProgressBar();

        self.HandlerExecutionParameter = new ExecutionParameterHandler(angle, display);
        self.HandlerExecutionParameter.AngleEnable = !isSwitchDisplay;
        self.HandlerExecutionParameter.DisplayEnable = true;
        self.HandlerExecutionParameter.ShowExecutionParameterPopup();

        // override method
        self.HandlerExecutionParameter.SubmitExecutionParameters = function (option) {
            if (isSwitchDisplay) {
                var angleQuery = self.HandlerAngle.QueryDefinitionHandler.GetExecutedParameters();
                if (angleQuery.length) {
                    option.angleQuery = {
                        execution_parameters: angleQuery
                    };
                }
                self.ClearDataBeforeSwitchDisplay(self.HandlerExecutionParameter.Display.uri);
            }

            // M4-33874 get parameterized from local storage (bug fixed in IE an Edge)
            jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, option);

            if (isSwitchDisplay) {
                WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY, self.HandlerExecutionParameter.Display.uri);
            }
            else {
                self.ExecuteAngle();
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
    self.RenderDisplayTabs = function () {
        if (!self.HandlerAngle.Displays.length)
            return;

        self.HandlerDisplayOverview.CanCreateNewDisplay(self.CanCreateNewDisplay());
        self.HandlerDisplayOverview.SetData(self.HandlerAngle.Displays, self.HandlerDisplay.Data().uri);
        self.HandlerDisplayOverview.Refresh();

        // set to old model, will be remove later
        displayModel.DisplayInfo.Displays(self.HandlerDisplayOverview.Displays());
    };
    self.SwitchDisplay = function (display) {
        // cannot switch (rendering) or same display
        if (!self.HandlerDisplayOverview.CanSwitchDisplay()
            || self.HandlerDisplay.Data().uri === display.Uri
            && !WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN))
            return;

        WC.Ajax.AbortAll();
        var isEditMode = self.IsEditMode();
        var switchDisplay = self.HandlerAngle.GetDisplay(display.Uri);

        // adhoc drilldown
        if (!isEditMode && self.HandlerDisplayOverview.KeepFilter() && self.HandlerDisplayOverview.CanKeepFilter()) {
            // clear data
            fieldSettingsHandler.ClearFieldSettings();
            var querySteps = switchDisplay.AngleHandler.GetCurrentDisplay().QueryDefinitionHandler.GetData();
            displayModel.AdhocDrilldown(querySteps, switchDisplay.GetData(), false, null, true, self.HandlerAngle.Data().model);
            return;
        }

        // can execute parameters
        if (self.CanExecutionParameters(switchDisplay)) {
            self.ShowExecutionParameterPopup(self.HandlerAngle.GetData(), switchDisplay.GetData(), true);
            return;
        }

        // normal switch display
        self.MarkAsExecutedParameter(switchDisplay);
        self.ClearDataBeforeSwitchDisplay(display.Uri);
        WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY, display.Uri);
    };
    self.ClearDataBeforeSwitchDisplay = function () {
        fieldSettingsHandler.ClearFieldSettings();
        pivotPageHandler.IsUnSavePivot = false;
        chartHandler.GaugeValues = [];
        chartHandler.GaugeColours = [];
    };
    self.ShowEditDescriptionPopup = function () {
        self.HandlerDisplay.ShowEditDescriptionPopup();
    };
    self.DeleteDisplay = function (display) {
        if (!display.IsNewAdhoc && !display.CanDelete)
            return;

        var deleteDisplayCallback = function () {
            // delete display data
            displayModel.DeleteTemporaryDisplay(display.Uri);
            self.HandlerAngle.RemoveDisplay(display.Uri);
            angleInfoModel.Data().display_definitions.removeObject('uri', display.Uri);
            angleInfoModel.Data.commit();

            // remove display from model
            self.HandlerDisplayOverview.Displays.remove(function (model) {
                return model.Uri === display.Uri;
            });
            // remove from old model, will be remove later
            displayModel.DisplayInfo.Displays.remove(function (model) {
                return model.Uri === display.Uri;
            });

            // check if remove a default display
            if (self.HandlerAngle.Data().angle_default_display === display.Id) {
                self.HandlerAngle.Data().angle_default_display = self.HandlerAngle.GetRawData().angle_default_display;
            }

            // if remove current display.. redirect to default display
            if (display.Uri === WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY)) {
                // default display
                var defaultDisplay = self.HandlerAngle.GetDefaultDisplay();
                var query = self.CreateAngleQuery([enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN]);
                window.location.replace(WC.Utility.GetAnglePageUri(self.HandlerAngle.Data().uri, defaultDisplay.Data().uri, query));
            }
            else {
                self.ApplyExecutionAngle();
            }
            self.HandlerDisplayOverview.UpdateScrollButtonState();
        };
        var handleDeleteError = function (xhr) {
            if (xhr.status === 404) {
                angleInfoModel.Data().display_definitions.removeObject('uri', display.Uri);
                angleInfoModel.Data.commit();
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

        if (display.IsNewAdhoc)
            deleteDisplayCallback();
        else if (self.ValidateDeleteDisplay(display))
            popup.Confirm(kendo.format(Localization.Confirm_DeleteDisplay, display.Name), deleteDisplay);
    };
    self.ValidateDeleteDisplay = function (display) {
        var publicDisplays = angleInfoModel.Data().display_definitions.findObjects('is_public', true);
        if (angleInfoModel.IsPublished() && publicDisplays.length === 1 && display.IsPublic) {
            popup.Alert(Localization.Alert_Title, Localization.Info_RequiredOneMoreDisplayToProcess);
            return false;
        }
        return true;
    };
    // action dropdown
    // extended from AngleActionMenuHandler

    // dashboard
    self.NewDashboardData = null;
    self.ShowAddToDashboardPopup = function () {
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
                open: self.ShowAddToDashboardPopupCallback
            };

        popup.Show(popupSettings);
    };
    self.ShowAddToDashboardPopupCallback = function (e) {
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

        jQuery('#exitingDashboardRadioButton').prop('disabled', true);
        WC.HtmlHelper.DropdownList('#dashboardDropdownlist', [], { enable: false });

        e.sender.element.find('.loader-spinner-inline').removeClass('alwaysHide');

        dashboardModel.LoadAllDashboards()
            .done(self.RenderAllDashboardDrodpownlist)
            .always(function () {
                e.sender.element.find('.loader-spinner-inline').addClass('alwaysHide');
            });
    };
    self.CloseAddToDashboardPopup = function () {
        popup.Close('#popupAddToDashboard');
    };
    self.RenderAllDashboardDrodpownlist = function (data) {
        var renderDashboards = [];
        var selectingDashboard = null;
        var isDashboardCreated = jQuery.localStorage('is_dashboard_created');

        if (data) {
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

            if (dashboard.widget_definitions.length >= maxNumberOfDashboard) {
                popup.Info(Localization.Info_WarningCannotAddMoreDashboard);
                return false;
            }
        }

        return true;
    };
    self.CreateDashboard = function () {
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var widgetObject = {
            angle: angleInfoModel.Data()[DashboardViewModel.KeyName],
            display: displayModel.Data()[DashboardViewModel.KeyName],
            widget_details: JSON.stringify({}),

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
    self.BuildFieldSettingWhenNoResult = function (display) {
        if (display.display_type === enumHandlers.DISPLAYTYPE.LIST) {
            listHandler.HasResult(false);
            listHandler.ReadOnly(self.HandlerValidation.Angle.InvalidBaseClasses || !display.authorizations.update);
            listHandler.DashBoardMode(false);
            listHandler.GetListDisplay();
            if (self.ResultErrorXhr)
                listHandler.ShowError(self.ResultErrorXhr);
        }
        else if (display.display_type === enumHandlers.DISPLAYTYPE.CHART) {
            chartHandler.HasResult(false);
            chartHandler.GetChartDisplay();
            if (self.ResultErrorXhr)
                chartHandler.ShowError(self.ResultErrorXhr);
        }
        else if (display.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            pivotPageHandler.HasResult(false);
            pivotPageHandler.GetPivotDisplay();
            if (self.ResultErrorXhr)
                pivotPageHandler.ShowError(self.ResultErrorXhr);
        }
    };
    self.UpdateAngleDisplayValidation = function (angle) {
        angle = typeof angle !== 'undefined' ? angle : self.HandlerAngle.GetData();
        var display = self.HandlerDisplay.GetData();
        self.HandlerValidation.Angle = validationHandler.GetAngleValidation(angle);
        self.HandlerValidation.Display = validationHandler.GetDisplayValidation(display, angle.model);
        self.HandlerValidation.Valid = self.HandlerValidation.Angle.Valid && self.HandlerValidation.Display.Valid;
    };
    self.ShowAngleDisplayInvalidMessage = function (delay) {
        if (self.HandlerValidation.Valid || self.HandlerValidation.ShowValidationStatus[displayUri])
            return;

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

        setTimeout(function () {
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
        }, delay || 0);
    };
    self.CanPostResult = function (displayValidation) {
        return !self.IsEditMode()
            && self.HandlerValidation.Angle.CanPostResult
            && displayValidation.CanPostResult;
    };
    self.SaveAdhocDisplays = function () {
        var adhocDisplays = {};
        jQuery.each(self.HandlerAngle.GetAdhocDisplays(), function (index, display) {
            var displayData = display.GetData();
            adhocDisplays[displayData.uri] = displayData;
        });
        jQuery.localStorage(displayModel.TemporaryDisplayName, adhocDisplays);
    };
    self.SaveClientSettings = function () {
        var clientSettingsRequest = userSettingModel.GetClientSettingsData();
        var additionalRequests = [];
        if (clientSettingsRequest) {
            userSettingModel.UpdateClientSettings(JSON.parse(clientSettingsRequest.data));
            additionalRequests = [clientSettingsRequest];
        }
        WC.Ajax.ExecuteBeforeExit(additionalRequests, true);
    };
    /*EOF: Model Methods*/

    // initialize method
    if (!window.isLoginPage) {
        var canEditId = jQuery.localStorage('can_edit_id');
        self.CanEditId = ko.observable(canEditId === null ? window.showAngleAndDisplayID : canEditId);

        self.InitialAnglePage();
        jQuery(function () {
            self.InitialAnglePageCallback();
        });
        jQuery(window).off('resize.angle').on('resize.angle', function () {
            if (!jQuery.isReady)
                return;

            self.UpdateLayout(300);
        });
        jQuery(window).off('beforeunload.angle').on('beforeunload.angle', function () {
            if (!jQuery.isReady)
                return;

            // save an adhoc Angle to local storage
            self.SaveAdhocDisplays();

            // save client settings to user settings
            self.SaveClientSettings();
            return;
        });
    }
}

var anglePageHandler = new AnglePageHandler();
