function DashboardHandler() {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.IsPageInitialized = false;
    self.IsCompactResult = false;
    self.IsInitialRetainUrl = false;
    self.LastUri = '';
    self.MinSize = 180;
    self.MaxMinWidgetSpeed = 300;
    self.ElementPrefix = 'widget';
    self.UpdateDisplayLayoutChecker = null;
    self.UpdateLayoutConfigChecker = null;
    self.CanUpdateLayoutConfig = true;
    self.LastPrivateNote = "";
    self.IsRefreshModelCurrentInfo = false;
    self.CheckModelCurrentInfo = null;
    self.ModelCurrentInfo = {};
    self.IsCheckExecuteParameters = false;
    self.IsShowPopupAfterExecuteParameters = false;
    self.HandlerState = new DashboardStateHandler();
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.Initial = function (callback) {
        requestHistoryModel.SaveLastExecute(self, self.Initial, arguments);
        
        searchStorageHandler.Initial(false, false, true);

        if (typeof WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.DASHBOARD) === 'undefined') {
            self.BackToSearch(false);
            return;
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
            })
            .done(function () {
                jQuery('html').addClass('initialized');
                self.InitialCallback(callback);
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

            self.InitialEditNote();

            WCNotificationsFeedCreator.Create(userModel.Data().id);
        }

        if (typeof callback === 'function') callback();
    };
    self.InitialEditNote = function () {
        jQuery("#YourNote").click(function () {
            if (dashboardModel.Data().authorizations.update_user_specific) {
                var yourNoteContainer = jQuery("#YourNote");
                yourNoteContainer.addClass("editNoteMode");
                if ($("#txtYourNote").length === 0) {
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
                                yourNoteInput.val(dashboardModel.Data().user_specific.private_note());
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
    self.HideEditNote = function () {
        jQuery(window).off('resize.yournote');
        jQuery(document).off('click.yournote touchstart.yournote');

        var yourNoteInput = jQuery("#txtYourNote").off('blur keydown');
        if (yourNoteInput.length) {
            var resetYourNote = function () {
                var oldNote = dashboardDetailsHandler.Model.Data().user_specific.private_note();
                dashboardDetailsHandler.Model.Data().user_specific.private_note(oldNote + 1);
                dashboardDetailsHandler.Model.Data().user_specific.private_note(oldNote);

                var oldNote2 = dashboardModel.Data().user_specific.private_note();
                dashboardModel.Data().user_specific.private_note(oldNote2 + 1);
                dashboardModel.Data().user_specific.private_note(oldNote2);
            };
            var yourNoteContainer = jQuery("#YourNote");
            var yourNote = jQuery.trim(yourNoteInput.val());
            if (yourNote !== dashboardDetailsHandler.Model.Data().user_specific.private_note()) {
                yourNoteInput.prop('disabled', true);
                self.SetPrivateNote(yourNote)
                    .done(function (data) {
                        if (data) {
                            dashboardDetailsHandler.Model.Data().user_specific.private_note(data.user_specific.private_note);
                        }
                    })
                    .fail(function () {
                        resetYourNote();
                    })
                    .always(function () {
                        yourNoteContainer.removeClass("editNoteMode");
                    });
            }
            else {
                yourNoteContainer.removeClass("editNoteMode");
                resetYourNote();
            }
        }
    };
    self.InitialRetainUrl = function () {
        progressbarModel.ReferenceUri = WC.Page.GetPreviousPageUrl();

        if (typeof jQuery('#MainContainer').data('address') === 'undefined') {
            $.address
                .init(function () {
                    jQuery('#MainContainer').data('address', true);
                })
                .change(function (event) {
                    self.SetResultViewType();

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
    self.SetResultViewType = function () {
        // if &view=compact
        self.IsCompactResult = jQuery.trim(WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.VIEW) || 'full') === 'compact';

        if (self.IsCompactResult) {
            jQuery('#AngleTopBar,#AngleField').hide();
        }
        else {
            jQuery('#AngleTopBar,#AngleField').show();
        }
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

        if (!self.IsCompactResult) {
            wraperHeight -= mainWrapperTop;
        }

        jQuery('#dashboardFilterWrapper, #dashboardContentWrapper').css('height', wraperHeight);
    };
    self.UpdateDetailSection = function () {
        var nameSize = jQuery('#DashboardName').width();
        jQuery('#DashboardName .Name').css({ 'max-width': nameSize - 110 });
        jQuery('#YourNote').width(nameSize / 2 - 60);
    };
    self.TriggerWatcher = function (e) {
        var refreshDashboard = function () {
            var isDashboardPopupShown = jQuery('#popupDashboardDetails').is(':visible');
            var isDashboardPublishingPopupShown = jQuery('#popupPublishSettings').is(':visible');
            dashboardDetailsHandler.ClosePopup();
            popup.CloseAll();
            dashboardModel.Angles = [];
            self.ExecuteDashboard(false, true);

            if (isDashboardPopupShown) {
                setTimeout(function () {
                    dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.PopupSettings.SelectedTab);
                }, 250);
            }
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

        if (dashboardModel.Data() && dashboardModel.Data().uri) {
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

        }
    };
    self.RenderBreadcrumb = function () {
        var viewModel = breadcrumbHandler.GetItemViewModel(dashboardModel.Data().name(), dashboardModel.Data().is_validated());
        breadcrumbHandler.Build([viewModel]);
    };

    self.ExecuteDashboard = function (isRetry, forceReload) {
        requestHistoryModel.SaveLastExecute(self, self.ExecuteDashboard, arguments);
        dashboardDetailsHandler.IsReady = false;

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
                return dashboardModel.LoadAngles(dashboardModel.KeyName, false, false)
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
                WC.HtmlHelper.SetPageTitle(dashboardModel.Data().name() || 'Dashboard');

                // set publication status
                dashboardModel.UpdatePublicationsWatcher();

                // M4-33874 get filters list from local storage (bug fixed in IE an Edge)
                var parameterized = jQuery.localStorage(enumHandlers.DASHBOARDPARAMETER.ASK_EXECUTION);

                // set ask@execution
                if (parameterized && !self.IsCheckExecuteParameters) {

                    // and then remove it
                    jQuery.localStorage.removeItem(enumHandlers.DASHBOARDPARAMETER.ASK_EXECUTION);

                    // show dashboard details popup
                    if (self.IsShowPopupAfterExecuteParameters) {
                        dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.TAB.DESCRIPTION);
                    }

                    // set parameteried from local storage
                    dashboardModel.ExecuteParameters = parameterized;

                    // do execute again
                    self.ExecuteDashboard();

                    return jQuery.when(false);
                }

                var executionInfo = dashboardModel.GetDashboardExecutionParameters();
                var isShowExecutionParametersPopup = !isEditMode && !dashboardModel.ExecuteParameters && executionInfo.query_steps.length;

                if (isNew) {
                    // check showing dashboard details popup
                    if (isShowExecutionParametersPopup) {
                        self.IsShowPopupAfterExecuteParameters = true;
                    }
                    else {
                        dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.TAB.DESCRIPTION);
                    }
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
        if (dashboardModel.Data()) {
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
            jQuery('#ToggleAngle, #ActionDropdownList, #DashboardStatesWrapper .states-wrapper').addClass('disabled');
        }
        else {
            jQuery('#ToggleAngle, #ActionDropdownList, #DashboardStatesWrapper .states-wrapper').removeClass('disabled');
        }
    };
    self.Render = function (isRetry) {
        if (typeof isRetry === 'undefined') {
            isRetry = false;
        }

        if (!dashboardModel.Data()) {
            if (!isRetry) {
                self.ExecuteDashboard(true);
            }
            return;
        }

        requestHistoryModel.SaveLastExecute(self, self.Render, arguments);

        if (self.CheckBeforeRender
            && jQuery('#dashboardWrapper .widget-display-column').length === dashboardModel.Data().widget_definitions.length) {
            // widgets are the same size then no need to clear just update somethings
            self.PrepareExistDisplayLayout();
        }
        else {
            // clean then create the layout
            self.PrepareDisplayLayout();
        }

        self.UpdateDisplayLayout(200);

        if (!self.IsRefreshModelCurrentInfo) {
            dashboardDetailsHandler.Model.Angles = dashboardModel.Angles.slice(0);
            dashboardDetailsHandler.Model.SetData(dashboardModel.GetData());
        }
        dashboardDetailsHandler.IsReady = true;
        self.IsRefreshModelCurrentInfo = false;

        self.ExecuteAllWidgets();

        self.CheckBeforeRender = false;

        self.ApplyBindingHandler();
    };
    self.ExecuteAllWidgets = function () {
        self.PreExecuteWidgetsHandler();
        jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
            if (!widget)
                return;

            var display = widget.GetDisplay();
            var angle = widget.GetAngle();
            if (!angle || !display)
                return;

            if (!self.IsEditMode() && self.CheckInvalidAngleAndDisplay(angle, display).Valid && modelsHandler.GetModelByUri(angle.model).available) {
                var widgetElement = jQuery('#' + self.ElementPrefix + widget.id + '-container');
                if (!widgetElement.data('Model')) {
                    var model = new DashboardResultViewModel('#' + self.ElementPrefix + widget.id, widget, dashboardDetailsHandler.Model, dashboardModel.ExecuteParameters);
                    widgetElement.data('ResultModel', model);
                    model.Execute();
                }
            }
        });
    };
    self.ReloadAllWidgets = function () {
        self.PreExecuteWidgetsHandler();
        jQuery('#dashboardWrapper .widget-display-column').each(function (index, widgetElement) {
            widgetElement = jQuery(widgetElement);
            var model = widgetElement.data('ResultModel');
            if (model) {
                model.Execute();
            }
        });
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
        WC.HtmlHelper.ApplyKnockout(dashboardDetailsHandler, jQuery('#DashboardField'));

        // Update Dashboard's states
        self.HandlerState.SetDashboardData(dashboardModel.Data());

        dashboardFiltersHandler.SetDashboardModel(dashboardDetailsHandler.Model);
        dashboardFiltersHandler.AfterTogglePanel = function () {
            self.UpdateDisplayLayout(200);
        };
        dashboardFiltersHandler.ShowFilterDetailsPopup = function () {
            dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.TAB.FIELDSFILTERS);
        };
        dashboardFiltersHandler.IsActive(!dashboardModel.IsTemporaryDashboard());
        dashboardFiltersHandler.ApplyHandler(jQuery('#dashboardFilterWrapper'));

        self.RenderActionDropdownList();
        self.UpdateDetailSection();
    };
    self.PrepareDisplayLayout = function () {
        var layout = dashboardModel.Data().layout,
            structureIndex = 0,
            index,
            widgets = dashboardModel.Data().widget_definitions,
            widgetCount = widgets.length,
            container = jQuery('#dashboardWrapper');

        container.empty();

        if (!widgetCount)
            return;

        var structure = layout.structure;
        if (!structure || structure.length === 0 || !structure[0].items) {
            structure = dashboardModel.GetDefaultLayoutConfig(widgetCount).structure;
        }
        var structureCount = structure[structureIndex].items.length;

        for (index = 0; index < widgetCount; index++) {
            if (structureCount === structure[structureIndex].items.length) {
                jQuery('<div class="widget-display-row" />')
                    .data('config', jQuery.extend({}, structure[structureIndex]))
                    .appendTo(container);
            }

            container.find('.widget-display-row:last').append(self.GetWidgetHtml(index, widgets[index]));

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
        if (!dashboardModel.Data().widget_definitions.length) {
            container.empty();
        }
        else {
            jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                if (widget) {
                    var widgetElement = container.find('.widget-display-column').eq(index);
                    if (widget.display !== widgetElement.data('display') || widgetElement.hasClass('widgetNotExists') || widgetElement.hasClass('widgetInvalid')) {
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
                        widgetElement.data({
                            'index': index,
                            'widget-id': widget.id,
                            'display': widget.display
                        })
                            .attr('id', self.ElementPrefix + widget.id + '-container');
                        self.SetWidgetName(widgetElement, widget);
                    }
                }
            });
        }
    };
    self.GetWidgetHtml = function (index, widget) {
        var display = widget.GetDisplay(),
            angle = widget.GetAngle(),
            columnElement = jQuery(
                '<div class="widget-display-column" id="' + self.ElementPrefix + widget.id + '-container">'
                + '<div class="widget-display-header">'
                        + '<span class="widgetName" data-role="tooltip"></span>'
                        + '<div class="widgetToolbar">'
                            + '<a class="widgetButtonInfo" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-title="' + Localization.DashboardWidgetInfo_Title + '"><i class="icon icon-info"></i></a>'
                            + '<a class="widgetButtonMaximize" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-title="' + Captions.Button_Dashboard_WidgetMaximize + '"><i class="icon icon-maximize"></i></a>'
                            + '<a class="widgetButtonMinimize" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-title="' + Captions.Button_Dashboard_WidgetMinimize + '"><i class="icon icon-minimize"></i></a>'
                            + '<a class="widgetButtonOpenNewWindow" target="_blank" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-title="' + Captions.Button_Dashboard_WidgetGotoAngle + '"><i class="icon icon-angle"></i></a>'
                            + '<a class="widgetButtonDelete" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-title="' + Captions.Button_Dashboard_WidgetDelete + '"><i class="icon icon-bin"></i></a>'
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
            .addClass(dashboardModel.Data().widget_definitions.length > 1 ? '' : 'disabled')
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
            // validated dashboard isallow to delete a widget
            widgetButtonDelete.addClass(dashboardModel.Data().is_validated());
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
    self.SetValidFilters = function (widgetElement) {
        if (widgetElement.data('ResultModel')) {
            var filters = widgetElement.data('ResultModel').WidgetModel.GetExtendedFilters();
            if (filters.length) {
                jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ADHOCFILTERS, filters);
            }
        }
    };
    self.SetWidgetName = function (columnElement, widget) {
        var widgetName = widget.GetWidgetName();
        columnElement.find('.widgetName').attr('title', widgetName).text(widgetName);
    };
    self.SetNotExistsWidget = function (element) {
        var widgetId = element.data('widget-id');
        element.addClass('widgetNotExists');
        element.find('.widgetButtonOpenNewWindow').addClass('disabled');
        element.find('.widgetName').attr('title', widgetId).text(widgetId);
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

            var updateWidgetLayout = function (widgetElement) {
                var viewModel = widgetElement.data('Model');
                if (viewModel) {
                    viewModel.UpdateLayout(0);
                }
                else if (widgetElement.hasClass('widgetInvalid')) {
                    widgetElement.children('.widgetDisplay').outerHeight(widgetElement.height() - widgetElement.children('.widget-display-header').height());
                }
            };

            if (maximizeContainer.hasClass('active')) {
                updateWidgetLayout(maximizeContainer);
            }
            else if (widgetColumns.length) {
                kendo.resize(container);
                widgetColumns.each(function (index, widgetElement) {
                    updateWidgetLayout(jQuery(widgetElement));
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

    self.CreateSplitter = function (structure) {
        var container = jQuery('#dashboardWrapper');
        var panes = [], config, index;
        var setResizingEvents = function (resizable) {
            // bind resizing panel
            resizable.bind('start', function () {
                container.addClass('resizing');
            });
            resizable.bind('resizeend', function () {
                container.removeClass('resizing');
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
        if (!jQuery('#widgetMaximizeWrapper').hasClass('active')) {
            self.UpdateLayoutConfig();
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
            
            self.CanUpdateLayoutConfig = true;
            self.UpdateLayoutConfig(100);
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

    self.UpdateLayoutConfig = function (delay) {
        delay = WC.Utility.ToNumber(delay, 700);

        var updateLayoutConfig = function () {
            if (!self.CanUpdateLayoutConfig) {
                self.CanUpdateLayoutConfig = true;
                return;
            }

            var structure = [];
            var sumRowHeight = jQuery('#dashboardWrapper .widget-display-row').map(function () { return jQuery(this).height(); }).get().sum();
            jQuery('#dashboardWrapper .widget-display-row').each(function (rowIndex, row) {
                row = jQuery(row);

                var config = jQuery.extend({}, row.data('config'));
                config.height = Math.min(100, Math.floor(row.height() / sumRowHeight * 100 * 100) / 100) + '%';
                config.items = [];

                var sumColumnWidth = row.children('.widget-display-column').map(function () { return jQuery(this).width(); }).get().sum();
                row.children('.widget-display-column').each(function (columnIndex, column) {
                    column = jQuery(column);
                    config.items[columnIndex] = Math.min(100, Math.floor(column.width() / sumColumnWidth * 100 * 100) / 100) + '%';
                });
                jQuery(row).data('config', config);

                structure.push(jQuery.extend({}, config));
            });

            // update layout
            dashboardDetailsHandler.Model.Data().layout = { structure: structure, widgets: [] };

            // update widget_definitions
            jQuery('#dashboardWrapper .widget-display-column').each(function (index, element) {
                if (element) {
                    var widgetId = jQuery(element).data('widget-id');
                    dashboardDetailsHandler.Model.Data().layout.widgets.push(widgetId);
                }
            });

            if (dashboardModel.IsTemporaryDashboard())
                dashboardModel.SetData(dashboardDetailsHandler.Model.GetData(), true);
        };

        clearTimeout(self.UpdateLayoutConfigChecker);
        if (delay === 0)
            updateLayoutConfig();
        else
            self.UpdateLayoutConfigChecker = setTimeout(updateLayoutConfig, delay);
    };
    self.SetFavorite = function (model, e) {
        if (dashboardModel.Data().authorizations.update_user_specific) {
            requestHistoryModel.SaveLastExecute(self, self.SetFavorite, arguments);
            var element = jQuery(e.currentTarget);
            element.addClass('loading16x16');
            dashboardModel.SetFavorite(!model.Data().user_specific.is_starred())
                .done(function (data) {
                    if (data)
                        model.Data().user_specific.is_starred(data.user_specific.is_starred);
                })
                .always(function () {
                    element.removeClass('loading16x16');
                });
        }
    };
    self.SetPrivateNote = function (note) {
        requestHistoryModel.SaveLastExecute(self, self.SetPrivateNote, arguments);
        return dashboardModel.SetPrivateNote(note);
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
        requestHistoryModel.SaveLastExecute(self, self.DeleteWidget, arguments);

        var element = jQuery('#widget' + id + '-container');
        var model = dashboardModel.GetWidgetById(id);
        if (model) {
            var display = model.GetDisplay() || {};
            popup.Confirm(kendo.format(Localization.Confirm_DeleteWidget, display.name || id), function () {
                var layout = dashboardDetailsHandler.Model.Data().layout,
                    oldLayout = jQuery.extend({}, layout);

                var rowTargetIndex = element.parent().prevAll('.widget-display-row').length;
                if (layout.structure[rowTargetIndex]) {
                    layout.structure[rowTargetIndex].items = dashboardModel.GetDefaultLayoutConfig(element.parent().children('.k-pane').length - 1).structure[0].items;
                }
                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DeletingWidget, false);
                progressbarModel.SetDisableProgressBar();
                dashboardModel.DeleteWidgetById(id, layout)
                    .fail(function () {
                        dashboardDetailsHandler.Model.Data().layout = oldLayout;
                    })
                    .done(function () {
                        dashboardDetailsHandler.Model.SetData(dashboardModel.Data());

                        // clean maximize state
                        var maximizeWrapper = jQuery('#widgetMaximizeWrapper');
                        if (maximizeWrapper.hasClass('active')) {
                            maximizeWrapper.empty().removeClass('active').removeData();
                        }

                        // remove widget
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
                    })
                    .always(function () {
                        progressbarModel.EndProgressBar();
                    });
            });
        }
        else {
            errorHandlerModel.ShowCustomError(Localization.ErrorObjectNotFound.replace('{value}', id), null,
                errorHandlerModel.SetErrorInfo('DashboardHandler.DeleteWidget(id)',
                    Localization.ErrorInfoObjectNotFound.replace('{property}', 'id').replace('{value}', id)));
        }
    };

    self.RenderActionDropdownList = function () {
        var data = self.GetActionDropdownItems();

        // html
        WC.HtmlHelper.ActionMenu.CreateActionMenuItems('#ActionDropdownListPopup .k-window-content', '#ActionDropdownListTablet', data, self.CallActionDropdownFunction);

        // action menu responsive
        WC.HtmlHelper.ActionMenu('#ActionSelect');
    };
    self.GetActionDropdownItems = function () {
        var data = [];
        var isEditMode = self.IsEditMode();
        var allowQuickSave = dashboardModel.CanUpdateDashboard('layout');
        var allowQuickSaveAs = !dashboardModel.IsTemporaryDashboard() && privilegesViewModel.IsAllowExecuteDashboard();

        // check privilege
        var privileges = {};
        privileges[enumHandlers.DASHBOARDACTION.SAVE.Id] = { Enable: allowQuickSave, Visible: true };
        privileges[enumHandlers.DASHBOARDACTION.SAVEAS.Id] = { Enable: allowQuickSaveAs, Visible: true };
        privileges[enumHandlers.DASHBOARDACTION.EDIT.Id] = { Enable: true, Visible: true };
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
                case enumHandlers.DASHBOARDACTION.SAVE.Id:
                    if (dashboardModel.IsTemporaryDashboard()) {
                        dashboardDetailsHandler.ShowSaveAsPopup(true, !dashboardModel.IsTemporaryDashboard());
                    }
                    else {
                        dashboardDetailsHandler.SaveDashboard(true);
                    }
                    break;
                case enumHandlers.DASHBOARDACTION.SAVEAS.Id:
                    dashboardDetailsHandler.ShowSaveAsPopup(true);
                    break;
                case enumHandlers.DASHBOARDACTION.EDIT.Id:
                    dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.TAB.DEFINITION);
                    break;
                case enumHandlers.DASHBOARDACTION.EXECUTEDASHBOARD.Id:
                    self.ExitEditMode();
                    break;
                default:
                    popup.Alert(Localization.Warning_Title, Localization.NotImplement);
                    break;
            }
        }
    };
    /*EOF: M4-9737*/

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

    /*
    * BOF:
    * M4-11191: Can't set dashboard to publish if an angle inside it used to have invalid fields
    */
    self.CheckInvalidAngleAndDisplay = function (angle, display) {
        var angleValidation = validationHandler.GetAngleValidation(angle);
        var displayValidation = validationHandler.GetDisplayValidation(display, angle.model);
        var messages = validationHandler.GetAllInvalidMessages(angleValidation, displayValidation);

        return {
            Valid: angleValidation.CanPostResult && displayValidation.CanPostResult,
            Message: validationHandler.GetAllInvalidMessagesHtml(messages)
        };
    };
    /*
    * EOF:
    * M4-11191: Can't set dashboard to publish if an angle inside it used to have invalid fields
    */

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

        var executionParameter = new ExecutionParameterHandler();
        executionParameter.CanUseCompareField = false;
        executionParameter.ModelUri = executionsInfo.angle.model;
        executionParameter.Angle = executionsInfo.angle;
        executionParameter.Display = executionsInfo.display;
        executionParameter.ShowPopupAfterCallback = function (e) {
            e.sender.element.find('.displayInfo > label').text(Localization.DashboardName);
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

    // Dashboard Filter functionality
    self.LoadAllFilterFieldsMetadata = function () {
        var dashboardModelData = dashboardModel.Data();
        if (dashboardModelData.model) {
            var filterFieldIds = dashboardModel.GetAllDashboardFilterFieldIds();
            var modelFieldUri = modelsHandler.GetQueryFieldsUri(null, dashboardModelData, true);
            return modelFieldsHandler.LoadFieldsByIds(modelFieldUri, filterFieldIds).then(function (modelFieldModel) {
                return modelFieldsHandler.LoadFieldsMetadata(modelFieldModel.fields);
            });
        }
        return jQuery.when();
    };
    // Dashboard Filter functionality

    /*EOF: Model Methods*/

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

            jQuery('.businessProcesses').each(function () {
                var handler = ko.dataFor(this);
                if (handler && handler.UpdateLayout) {
                    handler.UpdateLayout(jQuery(this));
                }
            });
        });

        jQuery(window).off('beforeunload.dashboard').on('beforeunload.dashboard', function () {
            WC.Ajax.ExecuteBeforeExit([], true);
            return;
        });
    }
}

var dashboardHandler = new DashboardHandler();
