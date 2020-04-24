function DashboardPageHandler() {
    "use strict";

    var self = this;
    var _self = {};

    self.IsPageInitialized = false;
    self.IsInitialRetainUrl = false;
    self.LastUri = '';
    self.MinSize = 180;
    self.MaxMinWidgetSpeed = 300;
    self.ElementPrefix = 'widget';
    self.UpdateDisplayLayoutChecker = null;
    self.IsRefreshModelCurrentInfo = false;
    self.CheckModelCurrentInfo = null;
    self.ModelCurrentInfo = {};
    self.IsCheckExecuteParameters = false;
    self.DashboardModel = new DashboardViewModel({});
    self.HandlerState = new DashboardStateHandler();
    self.HandlerSidePanel = new DashboardSidePanelHandler();
    self.DashboardStatisticHandler = new DashboardStatisticHandler();
    self.DashboardUserSpecificHandler = new DashboardUserSpecificHandler(dashboardModel, self.DashboardModel);
    self.DashboardBusinessProcessHandler = new DashboardBusinessProcessHandler(dashboardModel, self.DashboardModel);
    self.QueryDefinitionHandler = new QueryDefinitionHandler();
    self.ItemDescriptionHandler = new ItemDescriptionHandler();
    self.DashboardWidgetDefinitionHandler = new DashboardWidgetDefinitionHandler(self.DashboardModel);

    self.Initial = function (callback) {
        searchStorageHandler.Initial(false, false, true);

        // M4-77666: Field Chooser works incorrectly when there are many model
        angleInfoModel.Data(null);
        angleInfoModel.Data.commit();
        displayModel.Data(null);
        displayModel.Data.commit();

        if (!WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.DASHBOARD)) {
            self.BackToSearch(false);
            return;
        }

        self.LoadResources()
            .done(function () {
                jQuery('html').addClass('initialized');
                self.InitialCallback(callback);
            });
    };
    self.LoadResources = function () {
        return directoryHandler.LoadDirectory()
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
                    aboutSystemHandler.LoadAboutSystem()
                );
            })
            .then(function () {
                return jQuery.when(
                    fieldCategoryHandler.LoadFieldCategories(),
                    privilegesViewModel.Load(),
                    userSettingModel.Load()
                );
            })
            .then(function () {
                return modelsHandler.LoadModels();
            });
    };
    self.InitialCallback = function (callback) {
        userSettingsView.UpdateUserMenu();
        // mark sure document is ready
        if (!jQuery.isReady || !jQuery('html').hasClass('initialized')) {
            return;
        }

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

            self.SetWrapperHeight();

            // toogle panel is in edit mode
            if (self.IsEditMode()) {
                jQuery('html').addClass('editmode');
            }
            else {
                jQuery('html').removeClass('editmode');
            }

            // tooltip
            WC.HtmlHelper.Tooltip.Create('actionmenu', '#ActionDropdownListPopup .actionDropdownItem', false, TOOLTIP_POSITION.BOTTOM);

            // menu navigatable
            WC.HtmlHelper.MenuNavigatable('#UserControl', '#UserMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#Help', '#HelpMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#btnAddLanguage', '.languageAvailableList', '.Item');
            WC.HtmlHelper.MenuNavigatable('.btnAddLabel', '.availableLabelsList', 'li');
            WC.HtmlHelper.MenuNavigatable('.dxpgHeaderText', '.HeaderPopupView', 'a');

            //Binding knockout
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#HelpMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#UserMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(self.HandlerState, jQuery('#DashboardStatesWrapper .states-wrapper'));
            WC.HtmlHelper.ApplyKnockout(self, jQuery('#DashboardSavingWrapper .saving-wrapper'));


            //Set initial retain url
            self.InitialRetainUrl();

            self.InitialUserPrivileges();

            // click outside objects
            jQuery.clickOutside('#UserMenu', '#UserControl');
            jQuery.clickOutside('#HelpMenu', '#Help');
            jQuery.clickOutside('#NotificationsFeedMenu', '#NotificationsFeed');
            jQuery.clickOutside('.languageAvailableList', '.btnAddLanguage');
            jQuery.clickOutside('.HeaderPopup', function (e) {
                var target = jQuery(e.target);
                var excepts = [
                    '.dxpgHeader',
                    '.dxPivotGrid_pgSortUpButton',
                    '.dxPivotGrid_pgSortDownButton',
                    '.HeaderPopup'
                ].join(',');

                if (!target.filter(excepts).length && !target.parents(excepts).length) {
                    fieldSettingsHandler.HideFieldOptionsMenu();
                }
            });
            jQuery.clickOutside('#PivotCustomSortPopup', function (e) {
                var target = jQuery(e.target);
                var excepts = [
                    '.dxpgColumnFieldValue',
                    '.dxpgRowFieldValue',
                    '.pivotCustomSortPopup',
                    '[id^=PivotCustomSortField]'
                ].join(',');

                if (!target.filter(excepts).length && !target.parents(excepts).length) {
                    pivotPageHandler.ClosePivotCustomSortPopup();
                }
            });
            // click outside objects
            var isHide = function (target, excepts) {
                target = jQuery(target);
                excepts = excepts.join(',');
                return !target.filter(excepts).length && !target.parents(excepts).length;
            };
            jQuery.clickOutside('#DashboardSavingWrapper .saving-options', function (e) {
                var excepts = [
                    '#DashboardSavingWrapper .btn-saving-options',
                    '#DashboardSavingWrapper .saving-options'
                ];
                if (isHide(e.target, excepts))
                    jQuery('#DashboardSavingWrapper .saving-options').hide();
            });

            WCNotificationsFeedCreator.Create(userModel.Data().id);
        }

        if (typeof callback === 'function')
            callback();
    };
    self.InitialRetainUrl = function () {
        progressbarModel.ReferenceUri = WC.Page.GetPreviousPageUrl();

        if (typeof jQuery('#MainContainer').data('address') === 'undefined') {
            $.address
                .init(function () {
                    jQuery('#MainContainer').data('address', true);
                })
                .change(function (event) {
                    self.IsInitialRetainUrl = true;
                    if (event.value !== '/') {
                        var hashUrl = '#' + event.value;
                        if (self.LastUri && self.LastUri !== hashUrl) {
                            progressbarModel.ReferenceUri = '';
                        }

                        if (self.LastUri !== hashUrl) {
                            self.LastUri = hashUrl;

                            self.ExecuteDashboard();
                        }
                    }
                });
            setTimeout(function () {
                if (!self.IsInitialRetainUrl) {
                    self.LastUri = location.hash;
                    self.ExecuteDashboard();
                }
            }, 50);
        }
        WC.Utility.UrlParameter('login', null);
    };
    self.InitialUserPrivileges = function () {
        userModel.SetManagementControlButton();
        userModel.SetWorkbenchButton();
    };
    self.IsEditMode = function () {
        return !!WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.EDITMODE);
    };
    self.ExitEditMode = function () {
        WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.EDITMODE, null);
    };
    self.BackToSearch = function (showProgress) {
        if (typeof showProgress === 'undefined')
            showProgress = true;
        if (showProgress) {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);
            progressbarModel.CancelForceStop = true;
        }

        WC.Utility.RedirectUrl(searchStorageHandler.GetSearchUrl());
    };
    self.SetWrapperHeight = function () {
        var wraperHeight = WC.Window.Height;
        var mainWrapperTop = jQuery('#dashboardContentWrapper').offset().top || 0;
        wraperHeight -= mainWrapperTop;
        jQuery('#dashboardContentWrapper').css('height', wraperHeight);

        var tabContentElement = jQuery('#TabDetails .tab-content-wrapper');
        tabContentElement.height(WC.Window.Height - tabContentElement.offset().top);
    };
    self.UpdateDetailSection = function () {
        // check .toolbar
        WC.HtmlHelper.AdjustToolbar();
    };
    self.TriggerWatcher = function (e) {
        if (!dashboardModel.HasData())
            return;

        var refreshDashboard = function () {
            var isDashboardPublishingPopupShown = jQuery('#popupPublishSettings').is(':visible');
            popup.CloseAll();
            dashboardModel.Angles = [];
            self.ExecuteDashboard(false, true);

            if (isDashboardPublishingPopupShown) {
                setTimeout(function () {
                    jQuery('#ShowPublishSettingsButton').trigger('click');
                }, 250);
            }
        };

        var checkPublication = function (e, widget) {
            var watcherPublicationKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', widget.display);
            if (e.key === window.storagePrefix + watcherPublicationKey) {
                var display = widget.GetDisplay();
                if (display && display.is_public !== jQuery.storageWatcher(watcherPublicationKey)) {
                    refreshDashboard();
                    return true;
                }
            }
            return false;
        };

        // check widget count
        var watcherCountKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_WIDGETS_COUNT.replace('{uri}', dashboardModel.Data().uri);
        var watcherCount = jQuery.storageWatcher(watcherCountKey);
        if (watcherCount !== dashboardModel.Data().widget_definitions.length) {
            refreshDashboard();
        }
        else if (e.key.indexOf(window.storagePrefix + enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', '')) !== -1) {
            jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                if (checkPublication(e, widget)) {
                    return false;
                }
            });
        }
    };
    self.RenderBreadcrumb = function () {
        var viewModel = dashboardBreadcrumbHandler.GetDashboardViewModel(
            dashboardModel.Data().name(),
            dashboardModel.Data().is_validated());
        dashboardBreadcrumbHandler.Build([viewModel]);
    };
    self.UpdateModel = function (data, forced) {
        self.DashboardModel.Angles = ko.toJS(dashboardModel.Angles);
        self.DashboardModel.ExecuteParameters = ko.toJS(dashboardModel.ExecuteParameters);
        if (!self.DashboardModel.HasData() || forced) {
            self.DashboardModel.SetData(data);
        }

        // check widgets, they can be added from Angle page.
        // this will add them to the unsaved model
        var saveWidgetCount = dashboardModel.Data().widget_definitions.length;
        if (saveWidgetCount !== self.DashboardModel.Data().widget_definitions.length) {
            self.DashboardModel.Data().layout = dashboardModel.Data().layout;
            for (var i = saveWidgetCount - 1; i >= 0; i--) {
                var widget = dashboardModel.Data().widget_definitions[i];
                var hasWidget = self.DashboardModel.GetWidgetById(widget.id);
                if (!hasWidget) {
                    self.DashboardModel.Data().widget_definitions.push(new DashboardWidgetViewModel(widget.GetData()));
                }
            }
        }
    };

    // user specific
    self.CanUpdateUserSpecific = function () {
        return self.DashboardUserSpecificHandler.CanUpdate();
    };
    self.HasPrivateNote = function () {
        return self.DashboardUserSpecificHandler.HasPrivateNote();
    };
    self.GetPrivateNote = function () {
        return self.DashboardUserSpecificHandler.GetPrivateNote();
    };
    self.InitialUserSpecific = function () {
        self.DashboardUserSpecificHandler.InitialPrivateNote(jQuery('#TabContentDashboard .section-personal-note'));
        self.DashboardUserSpecificHandler.InitialExecuteAtLogon(jQuery('#TabContentDashboard .section-execute-at-logon'));
    };
    self.IsStarred = function () {
        return self.DashboardUserSpecificHandler.IsStarred();
    };
    self.SetFavorite = function (_model, e) {
        self.DashboardUserSpecificHandler.SetFavorite(e.currentTarget);
    };

    // business process
    self.InitialBusinessProcess = function () {
        self.DashboardBusinessProcessHandler.Initial(jQuery('#TabContentDashboard .section-business-processes'));
    };

    self.ExecuteDashboard = function (isRetry, forceReload) {
        if (typeof isRetry === 'undefined') {
            isRetry = false;
        }
        if (typeof forceReload === 'undefined') {
            forceReload = false;
        }

        var dashboardUri = WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.DASHBOARD);
        var isNew = !!WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.NEW);
        var isEditMode = self.IsEditMode();
        var model = dashboardModel.Data();

        var forceEditId = WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.EDITID) || null;
        if (forceEditId) {
            self.CanEditId(forceEditId === 'true');
            jQuery.localStorage('can_edit_id', self.CanEditId());
            var query = {};
            jQuery.each($.address.parameterNames(), function (index, name) {
                if (name !== enumHandlers.DASHBOARDPARAMETER.DASHBOARD && name !== enumHandlers.DASHBOARDPARAMETER.EDITID) {
                    query[name] = WC.Utility.UrlParameter(name);
                }
            });
            window.location.replace(WC.Utility.GetDashboardPageUri(dashboardUri, query));
            return;
        }

        if (isEditMode) {
            jQuery('html').addClass('editmode');
        }
        else {
            jQuery('html').removeClass('editmode');
        }

        self.EnableDashboardPage(true);
        jQuery.when(!forceReload && model && model.uri === dashboardUri ? true : dashboardModel.LoadDashboard(dashboardUri))
            .fail(function (xhr, status) {
                self.EnableDashboardPage(false);

                if (status === null) {
                    errorHandlerModel.ShowCustomError(xhr.responseText);
                }

                // M4-12092: WC: After click OK button of error "Forbidden" from an unauthorized dashboard, it will not go to Search page
                if (xhr.status === 404) {
                    self.BackToSearch(false);
                }
                else if (xhr.status === 403) {
                    setTimeout(function () {
                        popup.OnCloseCallback = function () {
                            self.BackToSearch(false);
                        };
                    }, 500);
                }
            })
            .then(function () {
                return dashboardModel.LoadAngles(DashboardViewModel.KeyName, false, false)
                    .fail(function (xhr) {
                        if (xhr instanceof Array)
                            xhr = xhr[0];
                        if (xhr instanceof Array)
                            xhr = xhr[0];
                        if (xhr.status === 404) {
                            errorHandlerModel.Enable(false);
                            setTimeout(function () {
                                errorHandlerModel.Enable(true);
                            }, 1000);
                        }
                    });
            })
            .then(function () {
                // update data
                self.UpdateModel(dashboardModel.GetData(), false);

                WC.HtmlHelper.SetPageTitle(dashboardModel.Data().name() || 'Dashboard');

                // set publication status
                dashboardModel.UpdatePublicationsWatcher();

                // set ask@execution
                var parameterized = jQuery.localStorage(enumHandlers.DASHBOARDPARAMETER.ASK_EXECUTION);
                if (parameterized && !self.IsCheckExecuteParameters) {

                    // and then remove it
                    jQuery.localStorage.removeItem(enumHandlers.DASHBOARDPARAMETER.ASK_EXECUTION);

                    // set parameteried from local storage
                    dashboardModel.ExecuteParameters = parameterized;

                    // do execute again
                    self.ExecuteDashboard();

                    return jQuery.when(false);
                }

                var executionInfo = dashboardModel.GetDashboardExecutionParameters();
                var isShowExecutionParametersPopup = !isEditMode && !dashboardModel.ExecuteParameters && executionInfo.query_steps.length;

                if (isNew) {
                    window.location.replace(WC.Utility.GetDashboardPageUri(dashboardUri));
                    return jQuery.when(false);
                }
                else if (isShowExecutionParametersPopup) {
                    self.ShowDashboardExecutionParameterPopup(dashboardModel.Data(), executionInfo);
                    return jQuery.when(false);
                }
                else if (self.IsRefreshModelCurrentInfo) {
                    return jQuery.when(true);
                }

                return jQuery.when(true);
            })
            .then(function (canRender) {
                // load model in widgets
                if (canRender !== false) {
                    var deferred = [];
                    var modelRequest = {};
                    jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                        var angle = widget.GetAngle();
                        if (!angle)
                            return;

                        var modelUri = angle.model;
                        if (modelUri && !modelRequest[modelUri]) {
                            deferred.pushDeferred(modelsHandler.LoadModelInfo, [modelUri]);
                        }
                        modelRequest[modelUri] = true;
                    });
                    return jQuery.whenAll(deferred)
                        .then(function () {
                            // check current model instace
                            self.CheckUpdateModelCurrentInstance();

                            return jQuery.when(canRender);
                        });
                }
                return jQuery.when(canRender);
            })
            .then(function (canRender) {
                // load classes metadata
                if (canRender !== false) {
                    var deferred = [];
                    var idsRequest = {};
                    jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                        var angle = widget.GetAngle();
                        if (!angle)
                            return;

                        var modelUri = angle.model;
                        var model = modelsHandler.GetModelByUri(modelUri);
                        if (model) {
                            if (!idsRequest[modelUri]) {
                                idsRequest[modelUri] = [];
                            }

                            var baseClassesBlock = angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
                            if (baseClassesBlock) {
                                jQuery.merge(idsRequest[modelUri], WC.Utility.ToArray(baseClassesBlock.base_classes));
                            }
                        }
                    });
                    jQuery.each(idsRequest, function (modelUri, ids) {
                        deferred.pushDeferred(modelClassesHandler.LoadClassesByIds, [ids.distinct(), modelUri]);
                    });

                    return jQuery.whenAll(deferred);
                }
                return jQuery.when(canRender);
            })
            .then(function (canRender) {
                if (canRender !== false) {
                    return self.LoadAllFilterFieldsMetadata().then(function () {
                        return jQuery.when(canRender);
                    });
                }
                return jQuery.when(canRender);
            })
            .fail(function () {
                // check current model instace
                self.CheckUpdateModelCurrentInstance();
            })
            .always(function (canRender) {
                if (canRender !== false) {
                    self.IsCheckExecuteParameters = true;
                    self.EnableDashboardPage(true);
                    self.Render(isRetry);
                }
                else {
                    self.EnableDashboardPage(false);
                }
            });
    };
    self.CheckUpdateModelCurrentInstance = function () {
        if (dashboardModel.HasData()) {
            // check model current instance was changed
            jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                var angle = widget.GetAngle();
                if (!angle)
                    return;

                var modelUri = angle.model;
                var model = modelsHandler.GetModelByUri(modelUri);
                if (!self.ModelCurrentInfo[modelUri]) {
                    self.ModelCurrentInfo[modelUri] = {};
                }

                // if updating current_instance not null and current_instance changed then set refresh flag
                if (!model || model.current_instance && self.ModelCurrentInfo[modelUri].Uri !== model.current_instance) {
                    self.ModelCurrentInfo[modelUri].IsUpdate = true;
                    self.ModelCurrentInfo[modelUri].Uri = model ? model.current_instance : null;
                }
            });

            // mark as refresh if model current instance was changed
            jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                var widgetElement = jQuery('#' + self.ElementPrefix + widget.id + '-container');
                if (widgetElement.length) {
                    var angle = widget.GetAngle();
                    if (!angle)
                        return;

                    var modelUri = angle.model;
                    var modelCurrentInfo = self.ModelCurrentInfo[modelUri];
                    if (modelCurrentInfo.IsUpdate && modelCurrentInfo.Uri) {
                        widgetElement.removeData('Model');
                    }
                }
            });

            // clear update flag
            jQuery.each(self.ModelCurrentInfo, function (modelUri, modelInfo) {
                modelInfo.IsUpdate = false;
            });

            clearTimeout(self.CheckModelCurrentInfo);
            self.CheckModelCurrentInfo = setTimeout(function () {
                self.CheckBeforeRender = true;
                self.IsRefreshModelCurrentInfo = true;
                self.ExecuteDashboard();
            }, dashboardRefreshIntervalTime * 60 * 1000);
        }
    };
    self.EnableDashboardPage = function (enable) {
        if (!enable) {
            jQuery('#ActionDropdownList, #DashboardStatesWrapper .states-wrapper').addClass('disabled');
        }
        else {
            jQuery('#ActionDropdownList, #DashboardStatesWrapper .states-wrapper').removeClass('disabled');
        }
    };
    self.GetElementIdFromWidget = function (widgetId) {
        return widgetId.replace(self.ElementPrefix, '').replace('-container', '');
    };
    self.IsWidgetExists = function (widgetId) {
        var elementId = self.GetElementIdFromWidget(widgetId);
        return self.DashboardModel.GetWidgetById(elementId) !== null;
    };
    self.IsWidgetChanged = function () {
        var widgets = jQuery('#dashboardWrapper .widget-display-column');
        if (widgets.length !== self.DashboardModel.Data().widget_definitions.length)
            return true;

        return jQuery.grep(widgets, function (widget) {
            var widgetId = jQuery(widget).attr('id');
            return self.IsWidgetExists(widgetId);
        }).length !== widgets.length;
    };
    self.Render = function (isRetry) {
        if (typeof isRetry === 'undefined') {
            isRetry = false;
        }

        if (!dashboardModel.HasData()) {
            if (!isRetry)
                self.ExecuteDashboard(true);
            return;
        }

        if (self.CheckBeforeRender && !self.IsWidgetChanged()) {
            // widgets are the same size then no need to clear just update somethings
            self.PrepareExistDisplayLayout();
        }
        else {
            // clean then create the layout
            self.PrepareDisplayLayout();
        }

        self.SetWrapperHeight();
        self.UpdateDisplayLayout(200);

        self.IsRefreshModelCurrentInfo = false;

        self.ExecuteAllWidgets();

        self.CheckBeforeRender = false;

        self.ApplyBindingHandler();
    };
    self.GetWidgetElement = function (widgetId) {
        return jQuery('#' + self.ElementPrefix + widgetId + '-container');
    };
    self.ExecuteAllWidgets = function () {
        self.PreExecuteWidgetsHandler();
        jQuery.each(self.DashboardModel.Data().widget_definitions, function (_index, widget) {
            if (self.CanExecuteWidget(widget)) {
                var widgetElement = self.GetWidgetElement(widget.id);
                if (!widgetElement.data('Model')) {
                    self.ExecuteWidget(widget);
                }
            }
        });
    };
    self.CanExecuteWidget = function (widget) {
        if (!widget)
            return false;

        var display = widget.GetDisplay();
        var angle = widget.GetAngle();
        if (!angle || !display)
            return false;

        return !self.IsEditMode()
            && self.CheckInvalidAngleAndDisplay(angle, display).Valid
            && modelsHandler.GetModelByUri(angle.model).available;
    };
    self.ExecuteWidget = function (widget) {
        var widgetElement = self.GetWidgetElement(widget.id);
        widgetElement.removeData('Model');
        var model = new DashboardResultViewModel('#' + self.ElementPrefix + widget.id, widget, self.DashboardModel, dashboardModel.ExecuteParameters);
        widgetElement.data('ResultModel', model);
        model.Execute();
    };
    self.ReloadAllWidgets = function () {
        self.PreExecuteWidgetsHandler();
        jQuery('#dashboardWrapper .widget-display-column').each(function (index, widgetElement) {
            self.ReloadWidget(jQuery(widgetElement));
        });
    };
    self.ReloadWidget = function (widgetElement) {
        var model = widgetElement.data('ResultModel');
        if (model) {
            model.Execute();
        }
    };
    self.PreExecuteWidgetsHandler = function () {
        errorHandlerModel.Enable(false);
        var fnCheckIsRendered = setInterval(function () {
            if (!jQuery('#dashboardWrapper .k-loading-mask').length) {
                clearInterval(fnCheckIsRendered);
                errorHandlerModel.Enable(true);
            }
        }, 2000);
    };
    self.ApplyBindingHandler = function () {
        self.RenderBreadcrumb();

        // Update Dashboard's states
        self.HandlerState.SetDashboardData(self.DashboardModel.Data());

        self.RenderActionDropdownList();
        self.UpdateDetailSection();
        self.HandlerSidePanel.SetTemplates();
        self.ApplyKnockoutInfoSection();
        self.InitialQueryDefinition(self.TransformFiltersData(self.DashboardModel.Data().filters));
        self.QueryDefinitionHandler.ApplyHandler(jQuery('#TabContentDashboard .section-definition'), '.definition-body-inner');
        self.InitialUserSpecific();
        self.InitialBusinessProcess();
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#TabContentDashboard .section-personal-note'));
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#TabContentDashboard .section-description'));
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#TabDetails .tab-menu-dashboard .action'), true);

        // widget definitions
        self.DashboardWidgetDefinitionHandler.ApplyCallback = self.ApplyWidgetDefinition;
        self.DashboardWidgetDefinitionHandler.Initial();
        self.DashboardWidgetDefinitionHandler.ApplyHandler(jQuery('#TabContentWidgets .section-widgets'), '.widgets-body');

        // ready for use
        self.HandlerSidePanel.SetActive();

        // trigger save button
        self.SetSaveActions();
    };
    self.ApplyWidgetDefinition = function (widgetId, name, displayUri) {
        var language = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var widget = self.DashboardModel.GetWidgetById(widgetId);
        var reload = widget.display !== displayUri;

        // set name
        var names = widget.multi_lang_name();
        names.removeObject('lang', language);
        names.push({
            lang: language,
            text: name || ' '
        });
        widget.multi_lang_name(names);

        // set display
        widget.display = displayUri;

        // reload
        self.SetSaveActions();
        self.DashboardWidgetDefinitionHandler.Initial(self.DashboardModel.GetData());
        self.UpdateWidgetLayout(widget);
        if (reload && self.CanExecuteWidget(widget))
            self.ExecuteWidget(widget);
    };
    self.GetWidgetSortings = function () {
        var widgetIds = ko.toJS(self.DashboardModel.Data().layout.widgets);

        // add missing widgets
        jQuery.each(self.DashboardModel.Data().widget_definitions, function (_index, widget) {
            if (jQuery.inArray(widget.id, widgetIds) === -1) {
                widgetIds.push(widget.id);
            }
        });

        // remove invalid widgets
        for (var index = widgetIds.length - 1; index >= 0; index--) {
            if (!self.DashboardModel.GetWidgetById(widgetIds[index]))
                widgetIds.splice(index, 1);
        }

        return widgetIds;
    };
    self.PrepareDisplayLayout = function () {
        var container = jQuery('#dashboardWrapper');
        var widgetIds = self.GetWidgetSortings();
        var widgetCount = widgetIds.length;

        container.empty();
        if (!widgetCount)
            return;

        var layout = self.DashboardModel.Data().layout;
        var structureIndex = 0;
        var structure = layout.structure;
        if (!structure || structure.length === 0 || !structure[0].items) {
            structure = self.DashboardModel.GetDefaultLayoutConfig(widgetCount).structure;
        }
        var structureCount = structure[structureIndex].items.length;

        for (var index = 0; index < widgetCount; index++) {
            if (structureCount === structure[structureIndex].items.length) {
                jQuery('<div class="widget-display-row" />')
                    .data('config', jQuery.extend({}, structure[structureIndex]))
                    .appendTo(container);
            }

            var widget = self.DashboardModel.GetWidgetById(widgetIds[index]);
            container.find('.widget-display-row:last').append(self.GetWidgetHtml(index, widget));

            if (structureCount === 1) {
                if (structureIndex < structure.length - 1)
                    structureIndex++;
                structureCount = structure[structureIndex].items.length;
            }
            else {
                structureCount--;
            }
        }

        self.CreateSplitter(structure);
        self.CreateDraggable();
    };
    self.PrepareExistDisplayLayout = function () {
        var container = jQuery('#dashboardWrapper');
        var widgetIds = self.GetWidgetSortings();
        if (!widgetIds.length) {
            container.empty();
        }
        else {
            jQuery.each(widgetIds, function (_index, widgetId) {
                var widget = self.DashboardModel.GetWidgetById(widgetId);
                self.UpdateWidgetLayout(widget);
            });
        }
    };
    self.UpdateWidgetLayout = function (widget) {
        var index = jQuery.inArray(widget.id, self.DashboardModel.Data().layout.widgets);
        var widgetElement = self.GetWidgetElement(widget.id);
        if (widget.display !== widgetElement.data('display') || widgetElement.hasClass('widgetNotExists') || widgetElement.hasClass('widgetInvalid')) {
            // update html
            var columnElement = self.GetWidgetHtml(index, widget);
            widgetElement
                .removeClass('displayArea displayList displayChart displayPivot widgetNotExists widgetInvalid')
                .addClass(columnElement.attr('class'))
                .data({
                    'Model': null,
                    'index': index,
                    'widget-id': widget.id,
                    'display': widget.display
                })
                .html(columnElement.children());
        }
        else {
            widgetElement
                .data({
                    'index': index,
                    'widget-id': widget.id,
                    'display': widget.display
                })
                .attr('id', self.ElementPrefix + widget.id + '-container');
        }
        self.SetWidgetName(widgetElement, widget);
    };
    self.GetWidgetHtml = function (index, widget) {
        var display = widget.GetDisplay(),
            angle = widget.GetAngle(),
            columnElement = jQuery(
                '<div class="widget-display-column" id="' + self.ElementPrefix + widget.id + '-container">'
                + '<div class="widget-display-header">'
                + '<span class="widgetName" data-role="tooltip"></span>'
                + '<div class="widgetToolbar">'
                + '<a class="widgetButtonInfo" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Localization.DashboardWidgetInfo_Title + '"><i class="icon icon-info"></i></a>'
                + '<a class="widgetButtonMaximize" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Captions.Button_Dashboard_WidgetMaximize + '"><i class="icon icon-maximize"></i></a>'
                + '<a class="widgetButtonMinimize" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Captions.Button_Dashboard_WidgetMinimize + '"><i class="icon icon-minimize"></i></a>'
                + '<a class="widgetButtonOpenNewWindow" target="_blank" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Captions.Button_Dashboard_WidgetGotoAngle + '"><i class="icon icon-angle"></i></a>'
                + '<a class="widgetButtonDelete" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Captions.Button_Dashboard_WidgetDelete + '"><i class="icon icon-bin"></i></a>'
                + '</div>'
                + '</div>'
                + '<div class="widget-display-container">'
                + '<div id="' + self.ElementPrefix + widget.id + '-inner" class="widget-display-inner">'
                + '<div id="' + self.ElementPrefix + widget.id + '" class="widgetDisplay"></div>'
                + '</div>'
                + '</div>'
                + '</div>');
        columnElement
            .data({
                'index': index,
                'widget-id': widget.id,
                'display': widget.display
            })
            .attr('id', self.ElementPrefix + widget.id + '-container');

        // maximize & minimize
        columnElement.find('.widgetButtonMaximize, .widgetButtonMinimize')
            .addClass(self.DashboardModel.Data().widget_definitions.length > 1 ? '' : 'disabled')
            .click(function (e) {
                var element = jQuery(e.currentTarget);
                if (!element.hasClass('disabled')) {
                    var widgetElement = element.parents('.widget-display-column:first');
                    if (element.hasClass('widgetButtonMaximize')) {
                        // set size to maximize
                        self.MaximizeWidget(widgetElement);
                    }
                    else {
                        // set size to minimize
                        self.MinimizeWidget(widgetElement);
                    }
                }
            });

        // delete
        var widgetButtonDelete = columnElement.find('.widgetButtonDelete');
        if (dashboardModel.Data().is_validated()) {
            // validated dashboard does not allow to delete a widget
            widgetButtonDelete.addClass('disabled');
        }
        widgetButtonDelete.on('click', function (e) {
            var element = jQuery(e.currentTarget);
            if (!element.hasClass('disabled')) {
                var widgetElement = element.parents('.widget-display-column:first');
                self.DeleteWidget(widgetElement.data('widget-id'));
            }
        });

        if (display) {
            if (display.display_type === enumHandlers.DISPLAYTYPE.LIST) {
                columnElement.addClass('displayList');
            }
            else if (display.display_type === enumHandlers.DISPLAYTYPE.CHART) {
                columnElement.addClass('displayChart displayArea');
            }
            else if (display.display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                columnElement.addClass('displayPivot displayArea');
            }

            // widget name
            var widgetName = widget.GetWidgetName();
            columnElement.find('.widgetName').text(widgetName);

            // info
            columnElement.find('.widgetButtonInfo').on('click', { widget: widget }, function (e) {
                self.ShowWidgetInfoPopup(e.data.widget);
            });

            // open new window
            columnElement.find('.widgetButtonOpenNewWindow')
                .attr('href', WC.Utility.GetAnglePageUri(angle.uri, display.uri))
                .click(function (e) {
                    var element = jQuery(e.currentTarget);
                    var widgetElement = element.parents('.widget-display-column:first');

                    // get parameterized from the memory
                    var executionParametersInfo = dashboardModel.GetAngleExecutionParametersInfo(angle, display);

                    // if has parameterized
                    if (!jQuery.isEmptyObject(executionParametersInfo)) {

                        // M4-33874 set parameterized to target angle
                        jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, executionParametersInfo);
                    }

                    // get valid filters
                    self.SetValidFilters(widgetElement);
                });

            /*Changed to use the same function of M4-11190*/

            var model = modelsHandler.GetModelByUri(angle.model);
            if (!model) {
                self.SetInvalidatedWidget(columnElement, '<li>No active model instance for model uri: ' + angle.model + '</li>');
            }
            else if (!model.available) {
                self.SetInvalidatedWidget(columnElement, '<li>No active model instance for model ID: ' + model.id + '</li>');
            }
            else {
                var invalidStatus = self.CheckInvalidAngleAndDisplay(angle, display);
                if (!invalidStatus.Valid) {
                    self.SetInvalidatedWidget(columnElement, invalidStatus.Message);
                }
            }
        }
        else {
            self.SetNotExistsWidget(columnElement);
        }

        return columnElement;
    };
    self.GetExtendedFilters = function (widgetElement) {
        var filters = [];
        if (widgetElement.data('ResultModel')) {
            jQuery.merge(filters, widgetElement.data('ResultModel').WidgetModel.GetExtendedFilters());
        }
        return filters;
    };
    self.SetValidFilters = function (widgetElement) {
        var filters = self.GetExtendedFilters(widgetElement);
        if (filters.length)
            jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS, filters);
    };
    self.SetWidgetName = function (columnElement, widget) {
        var widgetName = widget.GetWidgetName();
        columnElement.find('.widgetName').text(widgetName);
    };
    self.SetNotExistsWidget = function (element) {
        var widgetId = element.data('widget-id');
        element.addClass('widgetNotExists');
        element.find('.widgetButtonOpenNewWindow').addClass('disabled');
        element.find('.widgetName').text(widgetId);
        element.find('.widgetDisplay').html(Localization.Dashboard_WidgetNotExist);
    };
    self.SetInvalidatedWidget = function (element, message) {
        element.addClass('widgetInvalid');
        element.find('.widgetDisplay').html('This widget is invalid because: ' + message);
    };
    self.UpdateDisplayLayout = function (delay) {
        delay = WC.Utility.ToNumber(delay);

        var updateDisplay = function () {
            var container = jQuery('#dashboardWrapper');
            var maximizeContainer = jQuery('#widgetMaximizeWrapper');
            var widgetColumns = container.find('.widget-display-column');

            var updateDisplayLayout = function (widgetElement) {
                var viewModel = widgetElement.data('Model');
                if (viewModel) {
                    viewModel.UpdateLayout(0);
                }
                else if (widgetElement.hasClass('widgetInvalid')) {
                    widgetElement.children('.widgetDisplay').outerHeight(widgetElement.height() - widgetElement.children('.widget-display-header').height());
                }
            };

            kendo.resize(jQuery('#ContentWrapper'));
            if (maximizeContainer.hasClass('active')) {
                updateDisplayLayout(maximizeContainer);
            }
            else if (widgetColumns.length) {
                kendo.resize(container);
                widgetColumns.each(function (index, widgetElement) {
                    updateDisplayLayout(jQuery(widgetElement));
                });
            }
        };

        clearTimeout(self.UpdateDisplayLayoutChecker);
        if (delay === 0)
            updateDisplay();
        else
            self.UpdateDisplayLayoutChecker = setTimeout(updateDisplay, delay);
    };
    self.ReApplyResult = function () {
        jQuery('#dashboardWrapper .widget-display-column').each(function (index, element) {
            var model = jQuery(element).data('ResultModel');
            if (model)
                model.ApplyResult();
        });
    };
    self.RemoveWidgetDisplayElement = function (widgetDisplayElementId, widgetContainer, displayData) {
        var widgetDisplay;
        var displayType = displayData.display_type;
        if (enumHandlers.DISPLAYTYPE.CHART === displayType) {
            var displayDetails = JSON.parse(displayData.display_details);
            chartHandler.RemoveWidgetChart(widgetDisplayElementId, widgetContainer, displayDetails.chart_type);
            widgetDisplay = jQuery('#' + widgetDisplayElementId);
        }
        else if (enumHandlers.DISPLAYTYPE.PIVOT === displayType) {
            widgetDisplay = widgetContainer.find('.pivotAreaContainer');
            widgetDisplay.empty();
        }
        else {
            widgetDisplay = widgetContainer.find('.widgetDisplay');
            widgetDisplay.empty();
        }
        setTimeout(function () {
            if (widgetDisplay.find('.areaErrorContainer').length) {
                widgetDisplay.attr('style', '').attr('class', 'widgetDisplay');
            }
        }, 100);
    };
    self.CheckInvalidAngleAndDisplay = function (angle, display) {
        var angleValidation = validationHandler.GetAngleValidation(angle);
        var displayValidation = validationHandler.GetDisplayValidation(display, angle.model);
        var messages = validationHandler.GetAllInvalidMessages(angleValidation, displayValidation);

        return {
            Valid: angleValidation.CanPostResult && displayValidation.CanPostResult,
            Message: validationHandler.GetAllInvalidMessagesHtml(messages)
        };
    };
    self.ShowWidgetInfoPopup = function (widget) {
        var popupName = 'DashboardWidgetInfo';
        var handler;

        popup.Show({
            element: '#popup' + popupName,
            title: Localization.DashboardWidgetInfo_Title,
            className: 'popup' + popupName,
            width: 850,
            height: 530,
            minWidth: 748,
            minHeight: 300,
            buttons: [
                {
                    text: Localization.Ok,
                    position: 'right',
                    isPrimary: true,
                    click: 'close'
                }
            ],
            resize: function () {
                if (handler)
                    handler.AdjustLayout();
            },
            open: function () {
                var angle = widget.GetAngle();
                var display = widget.GetDisplay();
                var blocks = angle.query_definition.concat(display.query_blocks);
                var modelRoles = ko.toJS(userModel.GetModelRolesByModelUri(angle.model));

                handler = new WidgetDetailsHandler('#popup' + popupName);
                handler.IsVisibleModelInfo(true);
                handler.Angle = angle;
                handler.ModelUri = angle.model;
                handler.Data.AngleName(angle.name);
                handler.Data.DisplayName(display.name);
                handler.Data.AngleDescription(angle.description);
                handler.Data.DisplayDescription(display.description);
                handler.Data.QueryBlocks(blocks);
                handler.Data.ModelRoles(modelRoles);
                handler.Labels.HeaderModelInfo = Localization.AboutModelInfo + ':';
                handler.Labels.HeaderAngleTitle = Localization.DashboardWidgetInfo_HeaderAngleTitle;
                handler.Labels.HeaderDisplayTitle = Localization.DashboardWidgetInfo_HeaderDisplayTitle;
                handler.Labels.HeaderAngleDescription = Localization.DashboardWidgetInfo_HeaderAngleDescription;
                handler.Labels.HeaderDisplayDescription = Localization.DashboardWidgetInfo_HeaderDisplayDescription;
                handler.Labels.HeaderAngleDisplayDefinitions = Localization.DashboardWidgetInfo_HeaderAngleDisplayDefinitions;
                handler.Labels.HeaderModelRole = Captions.Label_Dashboard_ExecuteWithModelRole;
                handler.Angle = angle;
                handler.ApplyHandler(handler.View.TemplateAngleDisplay);
            },
            close: popup.Destroy
        });
    };
    self.CreateSplitter = function (structure) {
        var container = jQuery('#dashboardWrapper');
        var panes = [], config, index;
        var setResizingEvents = function (resizable) {
            // bind resizing panel
            resizable.bind('start', function () {
                container.addClass('resizing widget-resizing');
            });
            resizable.bind('resizeend', function () {
                container.removeClass('resizing widget-resizing');
            });
        };

        var rowsCount = container.find('.widget-display-row').length;
        for (index = 0; index < rowsCount; index++) {
            config = structure[index] || structure[structure.length - 1];
            panes[index] = {
                min: self.MinSize + 30,
                size: config.height.toString().indexOf('%') !== -1 ? config.height : parseFloat(config.height) + 'px'
            };
        }

        var splitter = container.kendoSplitter({
            orientation: 'vertical',
            panes: panes
        }).data(enumHandlers.KENDOUITYPE.SPLITTER);

        splitter.bind('resize', self.SplitterResized);
        setResizingEvents(splitter.resizing._resizable);

        container.find('.widget-display-row').each(function (rowIndex, row) {
            var columnCount = jQuery(row).find('.widget-display-column').length;
            config = structure[rowIndex] || structure[structure.length - 1];
            panes = [];

            for (index = 0; index < columnCount; index++) {
                panes[index] = {
                    min: self.MinSize,
                    size: config.items[index].toString().indexOf('%') !== -1 ? config.items[index] : parseFloat(config.items[index]) + 'px'
                };
            }

            splitter = jQuery(row).kendoSplitter({
                panes: panes
            }).data(enumHandlers.KENDOUITYPE.SPLITTER);

            splitter.bind('resize', self.SplitterResized);
            setResizingEvents(splitter.resizing._resizable);
        });
    };
    self.SplitterResized = function () {
        if (jQuery('#dashboardWrapper').hasClass('widget-resizing')) {
            self.UpdateLayoutConfig();
        }

        if (!jQuery('#widgetMaximizeWrapper').hasClass('active')) {
            self.UpdateDisplayLayout(200);
        }
    };
    self.CreateDraggable = function () {
        var container = jQuery('#dashboardWrapper');
        var columns = container.find('.widget-display-column');

        if (columns.length <= 1) {
            // cannot be dragged
            container.addClass('nodrag');
            return;
        }

        // draggable widget
        container.removeClass('nodrag').find('.widget-display-column').kendoDraggable({
            filter: '.widget-display-header:not(.nodrag)',
            hint: function () {
                return jQuery('<div id="widgetDragging" class="widgetDragging">' + Localization.DragAndDropWidget + '</div>');
            },
            cursorOffset: { top: -30, left: -10 },
            dragstart: function (e) {
                var element = jQuery(e.currentTarget).closest('.widget-display-column');
                self.CreateDropArea(element);
            },
            drag: function (e) {
                var draggable = jQuery(e.currentTarget).parents('.widget-display-column:first').data('kendoDraggable');
                if (draggable && draggable.hint) {
                    var hint = draggable.hint;
                    if (hint.offset().left < WC.Window.Width - hint.width() - 50)
                        hint.removeClass('revertHorizontal');
                    if (hint.offset().top < WC.Window.Height - hint.height() - 25)
                        hint.removeClass('revertVertical');

                    if (hint.offset().left + hint.width() > WC.Window.Width - 50)
                        hint.addClass('revertHorizontal');
                    if (hint.offset().top + hint.height() > WC.Window.Height - 25)
                        hint.addClass('revertVertical');
                }
            },
            dragend: self.ClearDropArea
        });
    };
    self.DropAreaSetting = {
        GutterSize: 10,
        AreaSize: 50
    };
    self.CreateDropArea = function (element) {
        var container = jQuery('#dashboardWrapper');
        var dropArea = jQuery('<div class="widgetDropArea" id="widgetDropArea" />');
        var elementId = element.attr('id');
        var elementRow = element.parent();
        var elementRowIndex = elementRow.prevAll('.widget-display-row').length;
        var elementSiblingColumnsCount = element.siblings('.widget-display-column').length;

        container.find('.widget-display-column').each(function (columnIndex, column) {
            column = jQuery(column);
            var row = column.parent();
            var isCurrentWidget = column.attr('id') === elementId;
            var siblingColumnsCount = column.siblings('.widget-display-column').length;
            var rowIndex = row.prevAll('.widget-display-row').length;

            // create .drop-to-widget
            var widgetOffset = column.offset();
            var widgetSize = { width: column.outerWidth(), height: column.outerHeight() };
            var children = {};
            var dropWidget = self.CreateDropToWidget(dropArea, widgetOffset, widgetSize);

            // create .drop-to-row
            var canAddNewRow = self.CanAddNewRow(rowIndex, elementRowIndex, siblingColumnsCount);
            if (canAddNewRow) {
                // top
                var haveDropToRowTop = self.HaveDropToRowTop(rowIndex, elementRowIndex, elementSiblingColumnsCount);
                var dropToRowTop = self.CreateDropToRowTop(dropArea, widgetOffset, widgetSize, rowIndex, haveDropToRowTop);
                children.top = dropToRowTop;

                // bottom
                var haveDropToRowBottom = self.HaveDropToRowBottom(rowIndex, elementRowIndex, elementSiblingColumnsCount);
                var dropToRowBottom = self.CreateDropToRowBottom(dropArea, widgetOffset, widgetSize, rowIndex, haveDropToRowBottom);
                children.bottom = dropToRowBottom;
            }

            // create .drop-to-column
            var canMoveColumn = self.CanMoveColumn(siblingColumnsCount, isCurrentWidget);
            if (canMoveColumn) {
                // left
                var haveDropToColumnLeft = self.HaveDropToColumnLeft(isCurrentWidget, elementId, column.prev().prev().attr('id'));
                var dropToColumnLeft = self.CreateDropToColumnLeft(dropArea, widgetOffset, widgetSize, columnIndex, haveDropToColumnLeft);
                children.left = dropToColumnLeft;

                // right
                var haveDropToColumnRight = self.HaveDropToColumnRight(isCurrentWidget, elementId, column.next().next().attr('id'));
                var dropToColumnRight = self.CreateDropToColumnRight(dropArea, widgetOffset, widgetSize, columnIndex, haveDropToColumnRight);
                children.right = dropToColumnRight;
            }

            // update .drop-to-widget
            dropWidget.data('children', children);
            if (isCurrentWidget) {
                dropWidget.addClass('current');
                self.UpdateDropableArea(dropWidget);
            }
        });
        jQuery('body').append(dropArea);

        self.CreateDropTargetArea();
    };
    self.CanAddNewRow = function (rowIndex, elementRowIndex, siblingColumnsCount) {
        return rowIndex !== elementRowIndex || siblingColumnsCount;
    };
    self.CanMoveColumn = function (siblingColumnsCount, isCurrentWidget) {
        return siblingColumnsCount || !isCurrentWidget;
    };
    self.CreateDropToWidget = function (dropArea, widgetOffset, widgetSize) {
        var dropWidget = jQuery('<div class="droppable drop-to-widget" />')
            .css({
                left: widgetOffset.left,
                top: widgetOffset.top,
                width: widgetSize.width,
                height: widgetSize.height
            });
        dropWidget.appendTo(dropArea);
        return dropWidget;
    };
    self.HaveDropToRowTop = function (rowIndex, elementRowIndex, elementSiblingColumnsCount) {
        return rowIndex - 1 !== elementRowIndex || elementSiblingColumnsCount;
    };
    self.CreateDropToRowTop = function (dropArea, widgetOffset, widgetSize, rowIndex, haveDropToRowTop) {
        if (!haveDropToRowTop)
            return jQuery();

        var dropToRowTop = jQuery('<div class="droppable drop-to-row drop-to-row-top" />')
            .css({
                left: widgetOffset.left,
                top: widgetOffset.top - self.DropAreaSetting.GutterSize,
                width: widgetSize.width,
                height: self.DropAreaSetting.AreaSize
            })
            .data({
                'index': rowIndex,
                'insert-type': 'insertBefore'
            });
        dropToRowTop.appendTo(dropArea);
        return dropToRowTop;
    };
    self.HaveDropToRowBottom = function (rowIndex, elementRowIndex, elementSiblingColumnsCount) {
        return rowIndex + 1 !== elementRowIndex || elementSiblingColumnsCount;
    };
    self.CreateDropToRowBottom = function (dropArea, widgetOffset, widgetSize, rowIndex, haveDropToRowBottom) {
        if (!haveDropToRowBottom)
            return jQuery();

        var dropToRowBottom = jQuery('<div class="droppable drop-to-row drop-to-row-bottom" />')
            .css({
                left: widgetOffset.left,
                top: widgetOffset.top + widgetSize.height + self.DropAreaSetting.GutterSize - self.DropAreaSetting.AreaSize,
                width: widgetSize.width,
                height: self.DropAreaSetting.AreaSize
            })
            .data({
                'index': rowIndex,
                'insert-type': 'insertAfter'
            });
        dropToRowBottom.appendTo(dropArea);
        return dropToRowBottom;
    };
    self.HaveDropToColumnLeft = function (isCurrentWidget, elementId, previousWidgetId) {
        return !isCurrentWidget && elementId !== previousWidgetId;
    };
    self.CreateDropToColumnLeft = function (dropArea, widgetOffset, widgetSize, columnIndex, haveDropToColumnLeft) {
        if (!haveDropToColumnLeft)
            return jQuery();

        var dropToColumnLeft = jQuery('<div class="droppable drop-to-column drop-to-column-left" />')
            .css({
                left: widgetOffset.left - self.DropAreaSetting.GutterSize,
                top: widgetOffset.top,
                width: self.DropAreaSetting.AreaSize,
                height: widgetSize.height
            })
            .data({
                'index': columnIndex,
                'insert-type': 'insertBefore'
            });
        dropToColumnLeft.appendTo(dropArea);
        return dropToColumnLeft;
    };
    self.HaveDropToColumnRight = function (isCurrentWidget, elementId, nextWidgetId) {
        return !isCurrentWidget && elementId !== nextWidgetId;
    };
    self.CreateDropToColumnRight = function (dropArea, widgetOffset, widgetSize, columnIndex, haveDropToColumnRight) {
        if (!haveDropToColumnRight)
            return jQuery();

        var dropToColumnRight = jQuery('<div class="droppable drop-to-column drop-to-column-right" />')
            .css({
                left: widgetOffset.left + widgetSize.width + self.DropAreaSetting.GutterSize - self.DropAreaSetting.AreaSize,
                top: widgetOffset.top,
                width: self.DropAreaSetting.AreaSize,
                height: widgetSize.height
            })
            .data({
                'index': columnIndex,
                'insert-type': 'insertAfter'
            });
        dropToColumnRight.appendTo(dropArea);
        return dropToColumnRight;
    };
    self.CreateDropTargetArea = function () {
        jQuery('#widgetDropArea').kendoDropTargetArea({
            filter: '.droppable',
            dragenter: function (e) {
                var dropping = jQuery(e.dropTarget);

                if (dropping.hasClass('drop-to-widget')) {
                    self.UpdateDropableArea(dropping);
                }
                else if (dropping.hasClass('drop-to-row') || dropping.hasClass('drop-to-column')) {
                    dropping.addClass('focused');
                }
            },
            dragleave: function (e) {
                var dropping = jQuery(e.dropTarget);
                dropping.removeClass('focused');

                e.draggable.hint.removeClass('revertHorizontal revertVertical');
            },
            drop: self.OnDropped
        });
    };
    self.OnDropped = function (e) {
        // 1. create new row (if drop in '.drop-to-row')
        // 2. move widgets to new position (if drop in '.drop-to-column')
        // 3. reset widgets index (data-index="x") in '.widget-display-column'

        var dropTarget = jQuery(e.dropTarget),
            dragTarget = e.draggable.element,
            insertType = dropTarget.data('insert-type'),
            dropIndex = dropTarget.data('index'),
            dragIndex = dragTarget.data('index'),
            dragIndexInRow = dragTarget.prevAll('.k-pane').length,
            parentRow = dragTarget.parent();
        if (dropTarget.hasClass('drop-to-row') || dropTarget.hasClass('drop-to-column')) {
            // row splitter
            var rowSplitter = jQuery('#dashboardWrapper').data(enumHandlers.KENDOUITYPE.SPLITTER);

            // drag from?
            var columnSplitter = parentRow.data(enumHandlers.KENDOUITYPE.SPLITTER);

            var columns, rows, size;
            if (dropTarget.hasClass('drop-to-row')) {
                // 1. row
                dragTarget.removeAttr('style');

                var config = dashboardModel.GetDefaultLayoutConfig(1).structure[0];
                var newRow = rowSplitter[insertType]({ min: self.MinSize }, jQuery('#dashboardWrapper .widget-display-row').eq(dropIndex)).html(dragTarget);
                var newSplitter = jQuery(newRow).addClass('widget-display-row')
                    .data('config', config)
                    .kendoSplitter({
                        panes: [{ min: self.MinSize, size: config.items[0] }]
                    })
                    .data(enumHandlers.KENDOUITYPE.SPLITTER);

                newSplitter.bind('resize', self.SplitterResized);

                // adjust column size for dragging place
                // - if widget is exists then try to adjust size of widget in row
                // - else remove row
                columns = columnSplitter.element.children('.k-pane');
                size = 100 / columns.length + '%';
                if (columns.length !== 0) {
                    columnSplitter.options.panes.splice(dragIndexInRow, 1);
                    columnSplitter._removeSplitBars();

                    columns.each(function (index, element) {
                        columnSplitter.size(element, size);
                    });
                }
                else {
                    rowSplitter.remove(parentRow);
                }

                // reset vertical spliter
                rows = rowSplitter.element.children('.k-pane');
                size = 100 / rows.length + '%';
                rows.each(function (index, element) {
                    rowSplitter.size(element, size);
                });
            }
            else {
                // 2. column
                columns = jQuery('#dashboardWrapper .widget-display-column');
                var dropParent = columns.eq(dropIndex).parent();
                var dropIndexInRow = columns.eq(dropIndex).prevAll('.k-pane').length;
                if (insertType === 'insertAfter') {
                    dropIndexInRow++;
                }
                var dropColumnSplitter = dropParent.data(enumHandlers.KENDOUITYPE.SPLITTER);
                if (dragIndex >= dropParent.find('.k-pane:first').data('index') && dragIndex <= dropParent.find('.k-pane:last').data('index')) {
                    // do not reset sizing if move to same row
                    dragTarget[insertType](columns.eq(dropIndex));
                    dropColumnSplitter._removeSplitBars();
                    dropColumnSplitter._addPane(dragTarget.data('pane'), dropIndexInRow, dragTarget);
                }
                else {
                    // reset sizing if move to other row
                    size = 100 / (dropParent.children('.k-pane').length + 1) + '%';
                    dragTarget[insertType](columns.eq(dropIndex));
                    dropColumnSplitter._removeSplitBars();
                    dropColumnSplitter._addPane({ min: self.MinSize }, dropIndexInRow, dragTarget);
                    dropColumnSplitter.element.children('.k-pane').each(function (index, element) {
                        dropColumnSplitter.size(element, size);
                    });

                    // adjust size of widget in row
                    columns = columnSplitter.element.children('.k-pane');
                    if (columns.length === 0) {
                        rowSplitter.remove(parentRow);
                    }
                    else {
                        size = 100 / columns.length + '%';

                        columnSplitter.options.panes = [];
                        columnSplitter._removeSplitBars();

                        columns.each(function (index, element) {
                            columnSplitter.options.panes[index] = { min: self.MinSize, size: size };
                            columnSplitter.size(element, size);
                        });
                    }
                }
            }

            // 3. update index
            jQuery('#dashboardWrapper .widget-display-column').each(function (index, column) {
                jQuery(column).data('index', index);
            });

            self.UpdateLayoutConfig();
            self.UpdateDisplayLayout();
        }
        self.ClearDropArea();
    };
    self.UpdateDropableArea = function (dropWidget) {
        // clear all
        jQuery('#widgetDropArea .droppable.active').removeClass('active');

        // set active
        var children = dropWidget.data('children');
        dropWidget.addClass('active');
        jQuery.each(children, function (name, element) {
            element.addClass('active');
        });
    };
    self.ClearDropArea = function () {
        jQuery('#widgetDropArea').remove();
    };
    self.GetLayoutFromView = function () {
        // structure
        var structure = [];
        var sumRowHeight = jQuery('#dashboardWrapper .widget-display-row').map(function () { return jQuery(this).height(); }).get().sum();
        jQuery('#dashboardWrapper .widget-display-row').each(function (_rowIndex, row) {
            row = jQuery(row);

            var config = jQuery.extend({}, row.data('config'));
            config.height = Math.min(100, Math.round(Math.floor(row.height() / sumRowHeight * 100 * 100) / 100)) + '%';
            config.items = [];

            var sumColumnWidth = row.children('.widget-display-column').map(function () { return jQuery(this).width(); }).get().sum();
            row.children('.widget-display-column').each(function (columnIndex, column) {
                column = jQuery(column);
                config.items[columnIndex] = Math.round(Math.min(100, Math.floor(column.width() / sumColumnWidth * 100 * 100) / 100)) + '%';
            });
            jQuery(row).data('config', config);
            structure.push(jQuery.extend({}, config));
        });

        // sortings
        var widgetIds = [];
        jQuery('#dashboardWrapper .widget-display-column').each(function (_index, element) {
            var widgetId = jQuery(element).data('widget-id');
            widgetIds.push(widgetId);
        });

        return { structure: structure, widgets: widgetIds };
    };
    self.UpdateLayoutConfig = function () {
        var layout = self.GetLayoutFromView();
        self.DashboardModel.Data().layout = layout;
        self.DashboardWidgetDefinitionHandler.Initial();
        self.SetSaveActions();
    };
    self.MaximizeWidget = function (widgetElement, animate) {
        var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
        var mainWrapper = jQuery('#dashboardWrapper');

        // prepare elment
        var widgetWrapperOffset = mainWrapper.offset();
        var widgetOffset = widgetElement.offset();

        var maximize = widgetElement.find('.widgetButtonMaximize').clone(true);
        widgetElement.find('.widgetButtonMaximize').remove();

        maximizeWrapper
            .removeData()
            .empty()
            .css({
                left: widgetOffset.left - widgetWrapperOffset.left,
                top: widgetOffset.top - widgetWrapperOffset.top,
                width: widgetElement.width(),
                height: widgetElement.height()
            })
            .attr('class', widgetElement.attr('class') + ' busy')
            .append(widgetElement.children());

        // set data
        var metadata = widgetElement.data();
        maximizeWrapper.data({
            Model: metadata.Model,
            ResultModel: metadata.ResultModel,
            display: metadata.display,
            index: metadata.index,
            'widget-id': metadata['widget-id']
        });

        // animation
        var animateProperties = {
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
        };
        var setMaximize = function () {
            // update layout
            maximizeWrapper.css(animateProperties);
            self.UpdateDisplayLayout(0);
            maximizeWrapper.find('.widgetButtonMinimize').before(maximize);
            maximizeWrapper.removeClass('busy').addClass('active');
        };
        if (animate === false)
            setMaximize();
        else
            maximizeWrapper.animate(animateProperties, self.MaxMinWidgetSpeed, setMaximize);
    };
    self.MinimizeWidget = function (widgetElement, animate) {
        var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
        var containerId = '#widget' + maximizeWrapper.data('widget-id') + '-container';
        var widgetWrapper = jQuery(containerId);

        // prepare elment
        maximizeWrapper.addClass('busy');

        // animation
        var widgetWrapperOffset = maximizeWrapper.offset();
        var widgetOffset = widgetWrapper.offset();
        var animateProperties = {
            left: widgetOffset.left - widgetWrapperOffset.left,
            top: widgetOffset.top - widgetWrapperOffset.top,
            width: widgetWrapper.width(),
            height: widgetWrapper.height()
        };
        var setMinimize = function () {
            // clean data + move element + update layout
            maximizeWrapper.removeData();
            widgetWrapper.append(maximizeWrapper.children());
            self.UpdateDisplayLayout(1);
            maximizeWrapper.removeClass('busy active');
        };
        if (animate === false)
            setMinimize();
        else
            maximizeWrapper.animate(animateProperties, self.MaxMinWidgetSpeed, setMinimize);
    };
    self.DeleteWidget = function (id) {
        var model = dashboardModel.GetWidgetById(id);
        if (model) {
            var display = model.GetDisplay() || { name: id };
            popup.Confirm(kendo.format(Localization.Confirm_DeleteWidget, display.name), function () {
                var layout = self.GetDeletingLayout(id);
                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DeletingWidget, false);
                progressbarModel.SetDisableProgressBar();
                dashboardModel.DeleteWidgetById(id, layout)
                    .done(function () {
                        self.DashboardModel.Data().layout = ko.toJS(dashboardModel.Data().layout);
                        self.DashboardModel.Data().widget_definitions.removeObject('id', id);
                        self.DashboardWidgetDefinitionHandler.Initial();

                        // clean maximize state
                        var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
                        if (maximizeWrapper.hasClass('active')) {
                            maximizeWrapper.empty().removeClass('active').removeData();
                        }

                        // remove widget
                        var element = jQuery('#widget' + id + '-container');
                        var splitter = element.parent().data(enumHandlers.KENDOUITYPE.SPLITTER);
                        splitter.remove(element);
                        if (splitter.element.children('.k-pane').length === 0) {
                            var rowSplitter = jQuery('#dashboardWrapper').data(enumHandlers.KENDOUITYPE.SPLITTER);
                            rowSplitter.remove(splitter.element);
                        }

                        if (!dashboardModel.Data().widget_definitions.length) {
                            // destroy splitter of no widget
                            jQuery('#dashboardWrapper').data(enumHandlers.KENDOUITYPE.SPLITTER).destroy();
                        }
                        else if (dashboardModel.Data().widget_definitions.length <= 1) {
                            // disable maximize/minimize if remains 1 widget
                            jQuery('#dashboardWrapper').find('.widgetButtonMaximize, .widgetButtonMinimize').addClass('disabled');
                        }
                        if (!dashboardModel.IsTemporaryDashboard())
                            toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), Localization.Toast_SaveItem);
                    })
                    .always(progressbarModel.EndProgressBar);
            });
        }
        else {
            errorHandlerModel.ShowCustomError(Localization.ErrorObjectNotFound.replace('{value}', id), null,
                errorHandlerModel.SetErrorInfo('DashboardPageHandler.DeleteWidget(id)',
                    Localization.ErrorInfoObjectNotFound.replace('{property}', 'id').replace('{value}', id)));
        }
    };
    self.GetDeletingLayout = function (id) {
        var element = jQuery('#widget' + id + '-container');
        var layout = self.GetLayoutFromView();

        // structure
        var rowIndex = element.parent().prevAll('.widget-display-row').length;
        var remainColumn = element.parent().children('.k-pane').length - 1;
        if (!remainColumn) {
            // no widget in row then update sibling height and remove it
            var rowHeight = parseFloat(layout.structure[rowIndex].height);
            if (layout.structure[rowIndex + 1])
                layout.structure[rowIndex + 1].height = parseFloat(layout.structure[rowIndex + 1].height) + rowHeight + '%';
            else if (layout.structure[rowIndex - 1])
                layout.structure[rowIndex - 1].height = parseFloat(layout.structure[rowIndex - 1].height) + rowHeight + '%';
            layout.structure.splice(rowIndex, 1);
        }
        else {
            // update sibling width
            var columnIndex = element.prevAll('.widget-display-column').length;
            var columnWidth = parseFloat(layout.structure[rowIndex].items[columnIndex]);
            if (layout.structure[rowIndex].items[columnIndex + 1])
                layout.structure[rowIndex].items[columnIndex + 1] = parseFloat(layout.structure[rowIndex].items[columnIndex + 1]) + columnWidth + '%';
            else if (layout.structure[rowIndex].items[columnIndex - 1])
                layout.structure[rowIndex].items[columnIndex - 1] = parseFloat(layout.structure[rowIndex].items[columnIndex - 1]) + columnWidth + '%';
            layout.structure[rowIndex].items.splice(columnIndex, 1);
        }

        // sorting
        var widgetIndex = jQuery.inArray(id, layout.widgets);
        if (widgetIndex !== -1)
            layout.widgets.splice(widgetIndex, 1);

        return layout;
    };

    // action menu
    self.RenderActionDropdownList = function () {
        var data = self.GetActionDropdownItems();

        // html
        WC.HtmlHelper.ActionMenu.CreateActionMenuItems('#ActionDropdownListPopup .k-window-content', '#ActionDropdownListTablet', data, self.CallActionDropdownFunction);

        // action menu responsive
        WC.HtmlHelper.ActionMenu('#ActionSelect', false);
    };
    self.GetActionDropdownItems = function () {
        var data = [];
        var isEditMode = self.IsEditMode();

        // check privilege
        var privileges = {};
        privileges[enumHandlers.DASHBOARDACTION.EXECUTEDASHBOARD.Id] = { Enable: true, Visible: isEditMode };

        // define menu
        jQuery.each(enumHandlers.DASHBOARDACTION, function (key, action) {
            data.push(jQuery.extend({ Enable: false }, action, privileges[action.Id]));
        });

        return data;
    };
    self.CallActionDropdownFunction = function (obj, selectedValue) {
        if (!jQuery(obj).hasClass('disabled')) {
            switch (selectedValue) {
                case enumHandlers.DASHBOARDACTION.EXECUTEDASHBOARD.Id:
                    self.ExitEditMode();
                    break;
                default:
                    break;
            }
        }
    };

    // side panel
    self.InitialContent = function () {
        // side panel + splitter + html stuff
        self.HandlerSidePanel.InitialDashboard(self.SaveSidePanelCallback);
        jQuery('#ContentWrapper').addClass('active');
    };
    self.SaveSidePanelCallback = function () {
        self.SetWrapperHeight();
        self.UpdateDisplayLayout(200);
        self.UpdateDetailSection();
    };
    self.ApplyKnockoutInfoSection = function () {
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#ContentWrapper .section-info .section-info-header'), true);
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#ContentWrapper .section-info .section-info-body'), true);
    };

    // name & description
    self.ShowEditDescriptionPopup = function () {
        self.ItemDescriptionHandler.SetData(dashboardModel.Data().id(), dashboardModel.Data().multi_lang_name(), dashboardModel.Data().multi_lang_description());
        self.ItemDescriptionHandler.GetDescriptionText = self.GetDescriptionText;
        self.ItemDescriptionHandler.CanEditId(self.CanEditId());
        self.ItemDescriptionHandler.SetReadOnly(!self.CanUpdateDescription());
        self.ItemDescriptionHandler.Save = jQuery.proxy(self.SaveDescription, self);
        self.ItemDescriptionHandler.ShowEditPopup(Localization.DashboardDescription);
    };
    self.SaveDescription = function () {
        var data = self.GetChangeData(dashboardModel.GetData(), self.ItemDescriptionHandler.GetData(), false, false);
        self.ItemDescriptionHandler.ShowProgressbar();

        jQuery.when(dashboardModel.IsTemporaryDashboard() ? self.SaveAdhocDescription() : dashboardModel.SaveDashboard(data))
            .done(function () {
                self.DashboardModel.Data().multi_lang_name(dashboardModel.Data().multi_lang_name());
                self.DashboardModel.Data().multi_lang_description(dashboardModel.Data().multi_lang_description());
                self.DashboardModel.Data().id(dashboardModel.Data().id());
                self.SaveDescriptionDone();
            }).fail(self.SaveDescriptionFail);
    };
    self.SaveDescriptionDone = function () {
        self.ItemDescriptionHandler.CloseEditPopup();
        self.RenderBreadcrumb();
        if (dashboardModel.Data().name())
            WC.HtmlHelper.SetPageTitle(dashboardModel.Data().name());

        if (!dashboardModel.IsTemporaryDashboard())
            toast.MakeSuccessTextFormatting(self.GetName(), Localization.Toast_SaveItem);
    };
    self.SaveDescriptionFail = function () {
        self.ItemDescriptionHandler.HideProgressbar();
    };
    self.GetDescriptionText = function () {
        return WC.HtmlHelper.StripHTML(dashboardModel.Data().description(), true);
    };
    self.CanUpdateDescription = function () {
        return dashboardModel.Data().authorizations.update;
    };
    self.GetName = function () {
        return dashboardModel.Data().name();
    };
    self.SaveAdhocDescription = function () {
        var data = self.ItemDescriptionHandler.GetData();
        self.DashboardModel.Data().multi_lang_name(data.multi_lang_name);
        self.DashboardModel.Data().multi_lang_description(data.multi_lang_description);
        self.DashboardModel.Data().id(data.id);
        dashboardModel.Data().multi_lang_name(data.multi_lang_name);
        dashboardModel.Data().multi_lang_description(data.multi_lang_description);
        dashboardModel.Data().id(data.id);
        return data;
    };

    // dashboard's filters
    _self.queryDefinitionProperty = 'query_definition';
    self.InitialQueryDefinition = function (definition) {
        self.QueryDefinitionHandler.BlockUI = true;
        self.QueryDefinitionHandler.GetSourceData = self.GetQueryDefinitionSourceData;
        self.QueryDefinitionHandler.FilterFor = WC.WidgetFilterHelper.FILTERFOR.DASHBOARD;
        self.QueryDefinitionHandler.AllowExecutionParameter(false);
        self.QueryDefinitionHandler.Save = jQuery.proxy(self.SaveQueryDefinition, self);
        self.QueryDefinitionHandler.Execute = jQuery.proxy(self.ExecuteQueryDefinition, self);
        self.QueryDefinitionHandler.SetData(definition, _self.queryDefinitionProperty, dashboardModel.Data().model);

        // set authorizations
        self.SetQueryDefinitionAuthorizations();
    };
    self.GetQueryDefinitionSourceData = function () {
        var filters = ko.toJS(dashboardModel.Data().filters);
        return self.TransformFiltersData(filters);
    };
    self.SetQueryDefinitionAuthorizations = function () {
        self.QueryDefinitionHandler.Authorizations.CanChangeFilter(self.CanChangeFilter());
        self.QueryDefinitionHandler.Authorizations.CanChangeJump(false);
        self.QueryDefinitionHandler.Authorizations.CanExecute(true);
        self.QueryDefinitionHandler.Authorizations.CanSave(false);
    };
    self.CanChangeFilter = function () {
        var valid = false;
        jQuery.each(self.DashboardModel.Data().widget_definitions, function (_index, widget) {
            if (widget.CanExtendFilter()) {
                valid = true;
                return false;
            }
        });
        return valid;
    };
    self.SaveQueryDefinition = function () {
        var self = this;
        if (!self.QueryDefinitionHandler.HasChanged(false, true))
            return;

        // check validation
        var validation = self.QueryDefinitionHandler.Validate();
        if (!validation.valid) {
            popup.Alert(Localization.Warning_Title, validation.message);
            return;
        }
        self.QueryDefinitionHandler.CloseAllFilterEditors();
        self.ExecuteQueryDefinition();
    };
    self.ExecuteQueryDefinition = function () {
        self.SetDashboardFilters();
        self.QueryDefinitionHandler.MarkAllAdhocAsApplied();
        self.ReloadAllWidgets();
        self.SetSaveActions();
    };
    self.SetDashboardFilters = function () {
        var filters = self.QueryDefinitionHandler.GetData();
        self.DashboardModel.SetDashboardFilters(filters);
        var definition = self.TransformFiltersData(filters);
        self.QueryDefinitionHandler.ForcedUpdateData(definition);
    };
    self.TransformFiltersData = function (filters) {
        var result = [];
        filters = WC.Utility.ToArray(filters);
        if (filters.length) {
            result = [{
                query_steps: filters,
                queryblock_type: 'query_steps'
            }];
        }
        return result;
    };
    self.LoadAllFilterFieldsMetadata = function () {
        var filterFieldIds = self.DashboardModel.GetAllDashboardFilterFieldIds();
        var modelFieldUri = modelsHandler.GetQueryFieldsUri(null, self.DashboardModel.Data(), true);
        return modelFieldsHandler.LoadFieldsByIds(modelFieldUri, filterFieldIds).then(function (modelFieldModel) {
            return modelFieldsHandler.LoadFieldsMetadata(modelFieldModel.fields);
        });
    };
    self.ShowDashboardExecutionParameterPopup = function (dashboard, executionsInfo) {
        // custom angle & display in executionsInfo

        // remove angle query step block
        executionsInfo.angle.is_parameterized = false;
        executionsInfo.angle.query_definition = [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES,
            base_classes: []
        }];

        // set new display query_blocks
        executionsInfo.display.name = dashboard.name;
        executionsInfo.display.is_parameterized = true;
        executionsInfo.display.query_blocks = [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: executionsInfo.query_steps
        }];

        var executionParameter = new ExecutionParameterHandler(executionsInfo.angle, executionsInfo.display);
        executionParameter.ShowPopupAfterCallback = function (e) {
            e.sender.element.find('.section-display .row-title .form-col-header').text(Localization.DashboardName);
        };
        executionParameter.ShowExecutionParameterPopup();

        // override method
        executionParameter.SubmitExecutionParameters = function (option) {

            // M4-33874 keep parameterized to local storage (bug fixed in IE an Edge)
            jQuery.localStorage(enumHandlers.DASHBOARDPARAMETER.ASK_EXECUTION, option.displayQuery.execution_parameters);

            self.IsCheckExecuteParameters = false;

            // do execute again
            self.ExecuteDashboard();
        };
        executionParameter.CancelExecutionParameters = function () {
            self.BackToSearch(true);
        };
    };

    // save all
    self.IsPrimarySaveValid = function () {
        return self.SaveActions.All.Visible() || self.SaveActions.DashboardAs.Visible();
    };
    self.IsPrimarySaveEnable = function () {
        if (self.SaveActions.All.Visible())
            return self.SaveActions.All.Enable();
        if (self.SaveActions.DashboardAs.Visible())
            return self.SaveActions.DashboardAs.Enable();
    };
    self.PrimarySaveAction = function () {
        if (self.SaveActions.All.Visible())
            self.SaveActions.All.Action();
        else if (self.SaveActions.DashboardAs.Visible())
            self.SaveActions.DashboardAs.Action();
    };
    self.VisibleToggleSaveOptions = function () {
        return self.SaveActions.All.Visible() && self.SaveActions.DashboardAs.Visible();
    };
    self.GetPrimarySaveLabel = function () {
        if (self.SaveActions.All.Visible())
            return self.SaveActions.All.Label();
        else if (self.SaveActions.DashboardAs.Visible())
            return self.SaveActions.DashboardAs.Label();
    };
    self.SaveAll = function () {
        if (!self.EnableSaveAll())
            return;

        return self.SaveDashboard();
    };
    self.SaveDashboard = function () {
        var showSaveProgressbar = function () {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CreatingDashboard, false);
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.SetDisableProgressBar();
        };

        var data = self.DashboardModel.GetData();
        if (dashboardModel.IsTemporaryDashboard()) {
            // adhoc Dashboard

            showSaveProgressbar();
            return self.CreateDashboard(data)
                .done(function () {
                    toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), Localization.Toast_SaveItem);
                })
                .always(progressbarModel.EndProgressBar);
        }
        else {
            var deferred = jQuery.Deferred();
            var saveDashboard = function () {
                showSaveProgressbar();
                var rawData = dashboardModel.GetData();
                var updateData = self.GetChangeData(rawData, data);
                self.EnsureLayout(updateData);
                self.UpdateDashboard(updateData)
                    .fail(deferred.reject)
                    .done(function (dashboard, widgetChanged) {
                        toast.MakeSuccessTextFormatting(dashboardModel.Data().name(), Localization.Toast_SaveItem);
                        self.SaveDashboardCallback(dashboard, widgetChanged);
                        deferred.resolve();
                    })
                    .always(progressbarModel.EndProgressBar);
            };

            var confirmMessageBeforeSave = self.GetConfirmMessageBeforeSave(dashboardModel.Data().is_validated());
            if (confirmMessageBeforeSave) {
                popup.Confirm(confirmMessageBeforeSave, saveDashboard, deferred.reject, {
                    title: Localization.Warning_Title,
                    icon: 'alert'
                });
            }
            else {
                saveDashboard();
            }
            return deferred.promise();
        }
    };
    self.CreateDashboard = function (data) {
        var temporaryUri = data.uri;
        return dashboardModel.CreateDashboard(data)
            .done(function (response) {
                self.QueryDefinitionHandler.ForcedSetData = true;
                self.DashboardModel.SetData(response);

                // clean localStorage
                var storage = jQuery.localStorage(dashboardModel.Name);
                delete storage[temporaryUri];
                jQuery.localStorage(dashboardModel.Name, storage);

                // remove watcher
                jQuery.storageWatcher(enumHandlers.STORAGE.WATCHER_DASHBOARD_WIDGETS_COUNT.replace('{uri}', temporaryUri), undefined);

                // redirect to the creating dashboard
                self.CheckBeforeRender = true;
                window.location.replace(WC.Utility.GetDashboardPageUri(response.uri));
            });
    };
    self.UpdateDashboard = function (data) {
        //minimize before save
        var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
        if (maximizeWrapper.hasClass('active')) {
            self.MinimizeWidget(maximizeWrapper, false);
        }

        // widgets
        var derferred = self.GetWidgetsDeferred(data.widget_definitions);
        delete data.widget_definitions;

        return jQuery.whenAll(derferred, false)
            .then(function () {
                return dashboardModel.SaveDashboard(data);
            })
            .then(function (dashboard) {
                return jQuery.when(dashboard, derferred.length > 0);
            });
    };
    self.GetWidgetsDeferred = function (widgets) {
        widgets = WC.Utility.ToArray(widgets);
        var derferred = [];
        jQuery.each(dashboardModel.GetData().widget_definitions, function (_index, widget) {
            var changeWidget = widgets.findObject('id', widget.id);
            if (changeWidget) {
                // clean PUT data
                jQuery.each(changeWidget, function (key, value) {
                    if (jQuery.deepCompare(value, widget[key]))
                        delete changeWidget[key];
                });
                if (!jQuery.isEmptyObject(changeWidget))
                    derferred.pushDeferred(dashboardModel.UpdateWidgetById, [widget.id, changeWidget]);
            }
        });
        return derferred;
    };
    self.GetChangeData = function (rawData, currentData) {
        jQuery.each(currentData, function (key, value) {
            if (key === 'filters') {
                if (!self.QueryDefinitionHandler.HasSourceChanged(false))
                    delete currentData[key];
            }
            else if (key === 'layout') {
                if (!self.HasLayoutChanged(false))
                    delete currentData[key];
            }
            else if (jQuery.deepCompare(value, rawData[key], true, key !== 'widget_definitions')) {
                delete currentData[key];
            }
        });
        return currentData;
    };
    self.HasLayoutChanged = function () {
        var rawLayout = dashboardModel.Data().layout;
        var layout = self.DashboardModel.Data().layout;
        return JSON.stringify(rawLayout.structure) !== JSON.stringify(layout.structure)
            || JSON.stringify(rawLayout.widgets) !== JSON.stringify(layout.widgets);
    };
    self.EnsureLayout = function (data) {
        var widgetIds = self.GetWidgetSortings();
        var layout = ko.toJS(self.DashboardModel.Data().layout);
        if (JSON.stringify(layout.widgets) !== JSON.stringify(widgetIds)) {
            layout.widgets = widgetIds;
            data.layout = JSON.stringify(layout);
        }
    };
    self.GetConfirmMessageBeforeSave = function (isValidatedDashboard) {
        // M4-33955: save with validated state
        // show this message if...
        return isValidatedDashboard ? Localization.Confirm_SaveValidatedDashboard : null;
    };
    self.SaveDashboardCallback = function (dashboardData, widgetChanged) {
        self.UpdateModel(dashboardData, true);
        self.QueryDefinitionHandler.ForcedSetData = true;
        if (widgetChanged) {
            self.CheckBeforeRender = true;
            self.Render();
        }
        else {
            self.ApplyBindingHandler();
        }

        var deleteWidgetButtonElement = jQuery('.widget-display-column').find('.widgetButtonDelete');
        if (dashboardModel.Data().is_validated())
            deleteWidgetButtonElement.addClass('disabled');
        else
            deleteWidgetButtonElement.removeClass('disabled');
    };
    self.ShowSaveDashboardAsPopup = function () {
        if (!self.SaveActions.DashboardAs.Enable())
            return;

        var handler = new DashboardSaveAsHandler(self, dashboardModel);
        handler.ItemSaveAsHandler.Redirect = function (dashboard) {
            self.UpdateModel(dashboard, true);
            var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
            if (maximizeWrapper.hasClass('active')) {
                self.MinimizeWidget(maximizeWrapper, false);
            }
            self.CheckBeforeRender = true;
            var redirectUrl = self.GetRedirectUrl(dashboard);
            window.location.replace(redirectUrl);
        };
        handler.ShowPopup();
    };
    self.GetRedirectUrl = function (dashboard) {
        return WC.Utility.GetDashboardPageUri(dashboard.uri);
    };
    self.SaveActions = {
        Primary: {
            Valid: self.IsPrimarySaveValid,
            Enable: self.IsPrimarySaveEnable,
            Visible: self.VisibleToggleSaveOptions,
            Label: self.GetPrimarySaveLabel,
            Action: self.PrimarySaveAction
        },
        All: {
            Enable: ko.observable(false),
            Visible: ko.observable(false),
            Label: ko.observable(Localization.Save),
            Action: jQuery.proxy(self.SaveAll, self)
        },
        DashboardAs: {
            Enable: ko.observable(false),
            Visible: ko.observable(false),
            Label: ko.observable(Localization.SaveAsDashboard),
            Action: jQuery.proxy(self.ShowSaveDashboardAsPopup, self)
        }
    };
    self.SetSaveActions = function () {
        self.SaveActions.All.Visible(self.VisibleSaveAll());
        self.SaveActions.All.Enable(self.EnableSaveAll());
        self.SaveActions.DashboardAs.Visible(self.VisibleSaveDashboardAs());
        self.SaveActions.DashboardAs.Enable(self.EnableSaveDashboardAs());
    };
    self.HasAnyChanged = function () {
        var data = self.DashboardModel.GetData();
        var rawData = dashboardModel.GetData();
        return !jQuery.isEmptyObject(self.GetChangeData(rawData, data));
    };
    self.VisibleSaveAll = function () {
        return dashboardModel.CanUpdateDashboard();
    };
    self.EnableSaveAll = function () {
        return dashboardModel.IsTemporaryDashboard() || self.HasAnyChanged();
    };
    self.VisibleSaveDashboardAs = function () {
        return !dashboardModel.IsTemporaryDashboard() && privilegesViewModel.IsAllowExecuteDashboard();
    };
    self.EnableSaveDashboardAs = function () {
        return privilegesViewModel.IsAllowExecuteDashboard();
    };
    self.ToggleSaveOptions = function () {
        var element = jQuery('#DashboardSavingWrapper .saving-options');
        if (element.is(':visible'))
            element.hide();
        else
            element.show();
    };
    self.CreateSaveAllButton = function () {
        var button = jQuery([
            '<a class="btn btn-small btn-secondary btn-save-all">',
            '<span>' + Localization.Save + '</span>',
            '</a>'
        ].join(''));
        button.attr('data-busy', Localization.Saving);
        return button;
    };
    self.CloneData = function () {
        return self.DashboardModel.GetData();
    };

    // before unload
    self.SaveClientSettings = function () {
        var clientSettingsRequest = userSettingModel.GetSidePanelSettingsData();
        var additionalRequests = [];
        if (clientSettingsRequest) {
            userSettingModel.UpdateClientSettings(JSON.parse(clientSettingsRequest.data));
            additionalRequests = [clientSettingsRequest];
        }
        WC.Ajax.ExecuteBeforeExit(additionalRequests, true);
    };

    // statistic
    self.ShowStatisticPopup = function () {
        self.DashboardStatisticHandler.ShowPopup(dashboardModel.GetData());
    };
    self.IsStatisticVisible = function () {
        return !dashboardModel.IsTemporaryDashboard();
    };

    // initialize method
    if (typeof isLoginPage === 'undefined') {
        var canEditId = jQuery.localStorage('can_edit_id');
        self.CanEditId = ko.observable(canEditId === null ? window.showAngleAndDisplayID : canEditId);

        self.Initial();
        jQuery(function () {
            self.InitialCallback();
        });
        jQuery(window).on('resize.dashboard', function () {
            if (!jQuery.isReady) {
                return;
            }
            self.SetWrapperHeight();
            self.UpdateDisplayLayout(200);
            self.UpdateDetailSection();
        });


        jQuery(window).off('beforeunload.dashboard').on('beforeunload.dashboard', function () {
            // save client settings to user settings
            self.SaveClientSettings();
            return;
        });
    }
}
var dashboardPageHandler = new DashboardPageHandler();
