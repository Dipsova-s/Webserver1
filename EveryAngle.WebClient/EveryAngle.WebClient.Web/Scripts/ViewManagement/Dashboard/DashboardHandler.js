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
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.Initial = function (callback) {
        requestHistoryModel.SaveLastExecute(self, self.Initial, arguments);

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
                    systemCurrencyHandler.LoadCurrencies()
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
            userSettingsHandler.CheckUserCurrency();

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

            // menu navigatable
            WC.HtmlHelper.MenuNavigatable('#UserControl', '#UserMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#Help', '#HelpMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#ActionDropdownList', '#ActionDropdownListPopup', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('.widgetButtonMenu', '.widgetToolbarActions', 'a');
            WC.HtmlHelper.MenuNavigatable('#btnAddLanguage', '.languageAvailableList', '.Item');
            WC.HtmlHelper.MenuNavigatable('.btnAddLabel', '.availableLabelsList', 'li');
            WC.HtmlHelper.MenuNavigatable('.dxpgHeaderText', '.HeaderPopupView', 'a');

            //Binding knockout
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#HelpMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#UserMenu .k-window-content'));

            //Set initial retain url
            self.InitialRetainUrl();

            self.InitialUserPrivileges();

            // click outside objects
            jQuery.clickOutside('#UserMenu', '#UserControl');
            jQuery.clickOutside('#HelpMenu', '#Help');
            jQuery.clickOutside('.languageAvailableList', '.btnAddLanguage');
            jQuery.clickOutside('#ActionDropdownListPopup', function (e) {
                var target = jQuery(e.target);
                var excepts = [
                    '[id^=ActionDropdownList]'
                ].join(',');

                if (!target.filter(excepts).length && !target.parents(excepts).length) {
                    self.HideActionDropDown();
                }
            });
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
            $.address.init(function (event) {
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

        var lastSearchUrl = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL);
        if (!lastSearchUrl || lastSearchUrl === '/') {
            window.location = searchPageUrl;
        }
        else {
            window.location = searchPageUrl + '#' + lastSearchUrl;
        }
    };
    self.SetWrapperHeight = function () {
        var wraperHeight = WC.Window.Height;
        var mainWrapperTop = jQuery('.mainDisplayWrapper').offset().top || 0;

        if (!self.IsCompactResult) {
            wraperHeight -= mainWrapperTop;
        }

        jQuery('#dashboardFilterWrapper, .mainDisplayWrapper').height(wraperHeight);
        jQuery('#widgetMaximizeWrapper').css('top', mainWrapperTop);
    };
    self.UpdateDetailSection = function () {
        var nameSize = jQuery('#DashboardName').width();
        jQuery('#DashboardName .Name').css({ 'max-width': nameSize - 110 });
        jQuery('#YourNote').width((nameSize / 2) - 60);
    };
    self.TriggerWatcher = function (e) {
        var refreshDashboard = function () {
            var isDashboardPopupShown = jQuery('#popupDashboardDetails').is(':visible');
            dashboardDetailsHandler.ClosePopup();
            popup.CloseAll();
            dashboardModel.Angles = [];
            self.ExecuteDashboard(false, true);

            if (isDashboardPopupShown) {
                setTimeout(function () {
                    dashboardDetailsHandler.ShowPopup(dashboardDetailsHandler.PopupSettings.SelectedTab);
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
        if (forceEditId != null) {
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
            .fail(function (xhr, status, error) {
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
                return dashboardModel.LoadAngles(dashboardModel.keyName, false, false)
                    .fail(function (xhr, status, error) {
                        if (xhr instanceof Array) xhr = xhr[0];
                        if (xhr instanceof Array) xhr = xhr[0];
                        if (xhr.status === 404) {
                            errorHandlerModel.Enable(false);
                            setTimeout(function () {
                                errorHandlerModel.Enable(true);
                            }, 1000);
                        }
                    });
            })
            .then(function (response, status, xhr) {
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
                        if (widget.widget_details.model && !modelRequest[widget.widget_details.model]) {
                            deferred.pushDeferred(modelsHandler.LoadModelInfo, [widget.widget_details.model]);
                        }
                        modelRequest[widget.widget_details.model] = true;
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
                        var model = modelsHandler.GetModelByUri(widget.widget_details.model);
                        if (model) {
                            if (!idsRequest[widget.widget_details.model]) {
                                idsRequest[widget.widget_details.model] = [];
                            }

                            var angle = widget.GetAngle();
                            if (angle) {
                                var baseClassesBlock = angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
                                if (baseClassesBlock) {
                                    jQuery.merge(idsRequest[widget.widget_details.model], WC.Utility.ToArray(baseClassesBlock.base_classes));
                                }
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
            .always(function (canRender, status, xhr) {
                if (canRender !== false) {
                    self.IsCheckExecuteParameters = true;
                    self.EnableDashboardPage(true);
                    self.Render(isRetry);
                }
                else {
                    self.EnableDashboardPage(false);
                }

                setTimeout(function () {
                    jQuery.localStorage('page_changed', false);
                }, 1000);
            });
    };
    self.CheckUpdateModelCurrentInstance = function () {
        if (dashboardModel.Data()) {
            // check model current instance was changed
            jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                var model = modelsHandler.GetModelByUri(widget.widget_details.model);
                if (!self.ModelCurrentInfo[widget.widget_details.model]) {
                    self.ModelCurrentInfo[widget.widget_details.model] = {};
                }

                // if updating current_instance not null and current_instance changed then set refresh flag
                if (!model || (model.current_instance && self.ModelCurrentInfo[widget.widget_details.model].Uri !== model.current_instance)) {
                    self.ModelCurrentInfo[widget.widget_details.model].IsUpdate = true;
                    self.ModelCurrentInfo[widget.widget_details.model].Uri = model ? model.current_instance : null;
                }
            });

            // mark as refresh if model current instance was changed
            jQuery.each(dashboardModel.Data().widget_definitions, function (index, widget) {
                var widgetElement = jQuery('#' + self.ElementPrefix + widget.id + '-container');
                if (widgetElement.length) {
                    var modelCurrentInfo = self.ModelCurrentInfo[widget.widget_details.model];
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
            jQuery('#ToggleAngle, #ActionDropdownList').addClass('disabled');
        }
        else {
            jQuery('#ToggleAngle, #ActionDropdownList').removeClass('disabled');
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
            && jQuery('#dashboardWrapper .widgetDisplayColumn').length === dashboardModel.Data().widget_definitions.length) {
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
            if (widget) {
                var display = widget.GetDisplay(),
                    angle = widget.GetAngle();

                if (angle && display) {
                    if (!self.IsEditMode() && self.CheckInvalidAngleAndDisplay(angle, display).Valid && modelsHandler.GetModelByUri(angle.model).available) {
                        if (display) {
                            var widgetElement = jQuery('#' + self.ElementPrefix + widget.id + '-container');
                            if (!widgetElement.data('Model')) {
                                self.CreateWidgetBusyIndicator(widgetElement);
                                var model = new DashboardResultViewModel('#' + self.ElementPrefix + widget.id, widget, dashboardModel.ExecuteParameters);
                                widgetElement.data('ResultModel', model);
                                model.Execute();
                            }
                        }
                    }
                }
            }
        });
    };
    self.ReloadAllWidgets = function () {
        self.PreExecuteWidgetsHandler();
        jQuery('#dashboardWrapper .widgetDisplayColumn').each(function (index, widgetElement) {
            widgetElement = jQuery(widgetElement);
            var model = widgetElement.data('ResultModel');
            if (model) {
                self.CreateWidgetBusyIndicator(widgetElement);
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
    self.CreateWidgetBusyIndicator = function (widgetElement) {
        widgetElement.busyIndicator(true);
        var widgetLoading = widgetElement.children('.k-loading-mask');
        var headerSize = widgetElement.children('.widgetDisplayHeader').height();
        widgetLoading.css({
            top: headerSize,
            height: widgetLoading.height() - headerSize
        });
    };
    self.ApplyBindingHandler = function () {
        WC.HtmlHelper.ApplyKnockout(dashboardDetailsHandler, jQuery('#DashboardField'));

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
                jQuery('<div class="widgetDisplayRow" />')
                    .data('config', jQuery.extend({}, structure[structureIndex]))
                    .appendTo(container);
            }

            jQuery('.widgetDisplayRow:last', container).append(self.GetWidgetHtml(index, widgets[index]));

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
                    var widgetElement = container.find('.widgetDisplayColumn').eq(index);
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
            columnElement = jQuery('<div class="widgetDisplayColumn" id="' + self.ElementPrefix + widget.id + '-container">'
                                     + '<div class="widgetDisplayHeader">'
                                         + '<span class="widgetName"></span>'
                                         + '<a class="btnInfo btnWidgetInfo"></a>'
                                         + '<div class="widgetToolbar">'
                                            + '<a class="btn btnDefault widgetButtonMenu"></a>'
                                            + '<div class="k-window-titleless k-window-custom k-window-arrow-n widgetToolbarActions">'
                                                + '<div class="k-window-content k-content">'
                                                    + '<a class="widgetButtonMaximize">' + Captions.Button_Dashboard_WidgetMaximize + '</a>'
                                                    + '<a class="widgetButtonMinimize">' + Captions.Button_Dashboard_WidgetMinimize + '</a>'
                                                    + '<a class="widgetButtonOpenNewWindow" target="_blank">' + Captions.Button_Dashboard_WidgetGotoAngle + '</a>'
                                                    + '<a class="widgetButtonDelete">' + Captions.Button_Dashboard_WidgetDelete + '</a>'
                                                + '</div>'
                                            + '</div>'
                                         + '</div>'
                                     + '</div>'
                                     + '<div id="' + self.ElementPrefix + widget.id + '" class="widgetDisplay"></div>'
                                 + '</div>');
        columnElement.data({
            'index': index,
            'widget-id': widget.id,
            'display': widget.display
        })
        .attr('id', self.ElementPrefix + widget.id + '-container');

        // menu
        columnElement.find('.widgetButtonMenu')
            .on('click', { widget: widget }, function (e) {
                var element = jQuery(this);
                var isOpen = element.hasClass('open');

                element.trigger('close');
                if (!isOpen) {
                    element.addClass('open');
                }
            })
            .on('close', function () {
                jQuery('#dashboardWrapper, #widgetMaximizeWrapper').find('.widgetButtonMenu').removeClass('open');
            });

        var clickMenuOutside = function (e) {
            var currentElement = jQuery(e.target);
            if (!currentElement.hasClass('widgetButtonMenu') && !currentElement.hasClass('widgetToolbarActions') && !currentElement.parents('.widgetToolbarActions').length) {
                jQuery(e.clickTarget).trigger('close');
            }
        };
        jQuery.clickOutside('#' + self.ElementPrefix + widget.id + '-container .widgetButtonMenu', clickMenuOutside);
        jQuery.clickOutside('#widgetMaximizeWrapper .widgetButtonMenu', clickMenuOutside);

        // maximize & minimize
        columnElement.find('.widgetButtonMaximize, .widgetButtonMinimize')
            .addClass(dashboardModel.Data().widget_definitions.length > 1 ? '' : 'disabled')
            .click(function (e) {
                var element = jQuery(e.currentTarget);
                if (!element.hasClass('disabled')) {
                    var widgetElement = element.parents('.widgetDisplayColumn:first');
                    widgetElement.find('.widgetButtonMenu').trigger('close');

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
                var widgetElement = element.parents('.widgetDisplayColumn:first');
                widgetElement.find('.widgetButtonMenu').trigger('close');

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
            columnElement.find('.widgetName').attr('title', widgetName).text(widgetName);

            // info
            columnElement.find('.widgetDisplayHeader .btnWidgetInfo').on('click', { widget: widget }, function (e) {
                self.ShowWidgetInfoPopup(e.data.widget);
            });

            // open new window
            columnElement.find('.widgetButtonOpenNewWindow')
                .attr('href', WC.Utility.GetAnglePageUri(angle.uri, display.uri))
                .click(function (e) {

                    // get parameterized from the memory
                    var executionParametersInfo = dashboardModel.GetAngleExecutionParametersInfo(angle, display);

                    // if has parameterized
                    if (!jQuery.isEmptyObject(executionParametersInfo)) {

                        // M4-33874 set parameterized to target angle
                        jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, executionParametersInfo);
                    }

                    var element = jQuery(e.currentTarget);
                    element.parents('.widgetDisplayColumn:first').find('.widgetButtonMenu').trigger('close');
                });

            /*Changed to use the same function of M4-11190*/

            var model = modelsHandler.GetModelByUri(angle.model);
            if (!model) {
                self.SetInvalidatedWidget(columnElement, '<li>No active model instance for model uri: ' + angle.model + '</li>');
            }
            else if (model && !model.available) {
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
            var updateWidgetLayout = function (widgetElement) {
                widgetElement.find('.widgetName').css('max-width', widgetElement.find('.widgetDisplayHeader').width() - widgetElement.find('.widgetToolbar').width() - 55);

                var viewModel = widgetElement.data('Model');
                if (viewModel) {
                    viewModel.UpdateLayout(0);
                }
                else if (widgetElement.hasClass('widgetInvalid')) {
                    widgetElement.children('.widgetDisplay').outerHeight(widgetElement.height() - widgetElement.children('.widgetDisplayHeader').height());
                }
            };

            if (maximizeContainer.hasClass('active')) {
                updateWidgetLayout(maximizeContainer);
            }
            else {
                kendo.resize(container);

                jQuery('#dashboardWrapper .widgetDisplayColumn').each(function (index, widgetElement) {
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
        jQuery('#dashboardWrapper .widgetDisplayColumn').each(function (index, element) {
            var model = jQuery(element).data('ResultModel');
            if (model)
                model.ApplyResult();
        });
    };

    self.CreateSplitter = function (structure) {
        var container = jQuery('#dashboardWrapper'),
            splitter, panes = [], config, index,
            rowsCount = container.find('.widgetDisplayRow').length, columnCount;

        for (index = 0; index < rowsCount; index++) {
            config = (structure[index] || structure[structure.length - 1]);
            panes[index] = {
                min: self.MinSize + 30,
                size: config.height.toString().indexOf('%') !== -1 ? config.height : parseFloat(config.height) + 'px'
            };
        }

        splitter = container.kendoSplitter({
            orientation: 'vertical',
            panes: panes
        }).data(enumHandlers.KENDOUITYPE.SPLITTER);

        splitter.bind('resize', self.SplitterResized);

        container.find('.widgetDisplayRow').each(function (rowIndex, row) {
            columnCount = jQuery(row).find('.widgetDisplayColumn').length;
            config = (structure[rowIndex] || structure[structure.length - 1]);
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
        });
    };
    self.SplitterResized = function () {
        if (!jQuery('#widgetMaximizeWrapper').hasClass('active')) {
            self.UpdateLayoutConfig();
            self.UpdateDisplayLayout(200);
        }
    };
    self.CreateDraggable = function () {
        var container = jQuery('#dashboardWrapper'),
            columns = container.find('.widgetDisplayColumn');

        if (columns.length <= 1) {
            container.addClass('nodrag');
        }
        else {
            // draggable widget
            container.removeClass('nodrag').find('.widgetDisplayColumn').kendoDraggable({
                filter: '.widgetDisplayHeader:not(.nodrag)',
                hint: function (element) {
                    var dragging = jQuery('<div id="widgetDragging" class="widgetDragging" />')
                        .append(element.parents('.widgetDisplayHeader:first').clone())
                        .find('.widgetToolbar').remove().end()
                        .append('<div class="widgetDraggingInfo">Drag to desired location</div>');
                    return dragging;
                },
                cursorOffset: { top: -30, left: -10 },
                dragstart: function (e) {
                    self.CreateDropArea(jQuery(e.currentTarget).parents('.widgetDisplayColumn:first'));
                },
                drag: function (e) {
                    var draggable = jQuery(e.currentTarget).parents('.widgetDisplayColumn:first').data('kendoDraggable');
                    if (draggable && draggable.hint) {
                        var hint = draggable.hint;
                        if (hint.offset().left < WC.Window.Width - hint.width() - 50) hint.removeClass('revertHorizontal');
                        if (hint.offset().top < WC.Window.Height - hint.height() - 25) hint.removeClass('revertVertical');

                        if (hint.offset().left + hint.width() > WC.Window.Width - 50) hint.addClass('revertHorizontal');
                        if (hint.offset().top + hint.height() > WC.Window.Height - 25) hint.addClass('revertVertical');
                    }
                },
                dragend: self.ClearDropArea
            });
        }
    };
    self.UpdateDraggingInfo = function (info) {
        jQuery('#widgetDragging .widgetDraggingInfo').html(info);
    };
    self.CreateDropArea = function (element) {
        var container = jQuery('#dashboardWrapper'),
            dropArea = jQuery('<div class="widgetDropArea" id="widgetDropArea" />'),
            dropAreaSize = 20,
            currentWidgetIndex = element.data('index'),
            currentRowIndex = element.parent().prevAll('.widgetDisplayRow').length,
            rowCount = jQuery('.widgetDisplayRow', container).length,
            canAddNewRowNearby = element.parent().find('.widgetDisplayColumn').length !== 1,
            allColumnIndex = 0;

        jQuery('.widgetDisplayRow', container).each(function (rowIndex, row) {
            // create droppable in row
            row = jQuery(row);
            var topOffset = row.offset().top;
            var leftOffset = row.offset().left;
            if (!dashboardModel.IsTemporaryDashboard())
                leftOffset -= 10;

            if (canAddNewRowNearby || (!canAddNewRowNearby && (rowIndex < currentRowIndex || rowIndex > currentRowIndex + 1))) {
                jQuery('<div class="droppable dropToRow" />')
                    .css({
                        left: leftOffset,
                        top: rowIndex === 0 ? 0 : topOffset - (dropAreaSize / 2),
                        height: rowIndex === 0 ? Math.max(topOffset, dropAreaSize) : dropAreaSize
                    })
                    .data({
                        'index': rowIndex,
                        'insert-type': 'insertBefore'
                    })
                    .appendTo(dropArea);
            }

            if (rowIndex === rowCount - 1 && (canAddNewRowNearby || (!canAddNewRowNearby && rowIndex !== currentRowIndex))) {
                var bottomOffset = topOffset + row.height() - dropAreaSize;
                jQuery('<div class="droppable dropToRow" />')
                    .css({
                        left: leftOffset,
                        top: bottomOffset,
                        height: Math.max(WC.Window.Height - bottomOffset, dropAreaSize)
                    })
                    .data({
                        'index': rowIndex,
                        'insert-type': 'insertAfter'
                    })
                    .appendTo(dropArea);
            }

            // create drop in column & re-ordering
            var columnElements = row.find('.widgetDisplayColumn');
            var columnCount = columnElements.length;
            var isDifferenceRow = !(currentWidgetIndex >= allColumnIndex && currentWidgetIndex <= allColumnIndex + columnElements.length - 1);
            columnElements.each(function (columnIndex, column) {
                if (allColumnIndex !== currentWidgetIndex) {
                    column = jQuery(column);
                    var leftOffset = column.offset().left;

                    // drop in column
                    if (allColumnIndex - 1 !== currentWidgetIndex || isDifferenceRow) {
                        jQuery('<div class="droppable dropToColumn" />')
                            .css({
                                left: Math.max(leftOffset - (dropAreaSize / 2), 0),
                                top: topOffset,
                                height: column.height(),
                                width: dropAreaSize
                            })
                            .data({
                                'index': allColumnIndex,
                                'insert-type': 'insertBefore'
                            })
                            .appendTo(dropArea);
                    }
                    if (columnIndex === columnCount - 1) {
                        jQuery('<div class="droppable dropToColumn" />')
                            .css({
                                right: 0,
                                top: topOffset,
                                height: column.height(),
                                width: dropAreaSize
                            })
                            .data({
                                'index': allColumnIndex,
                                'insert-type': 'insertAfter'
                            })
                            .appendTo(dropArea);
                    }
                }
                allColumnIndex++;
            });
        });
        jQuery('body').append(dropArea);

        jQuery('#widgetDropArea').kendoDropTargetArea({
            filter: '.droppable',
            dragenter: function (e) {
                var dropping = jQuery(e.dropTarget), info;
                dropping.addClass('dragFocus');

                if (dropping.hasClass('dropToRow') || dropping.hasClass('dropToColumn') || dropping.hasClass('dropToReorder'))
                    info = 'Drop here';
                else
                    info = 'Drag to desired location';

                self.UpdateDraggingInfo(info);
            },
            dragleave: function (e) {
                var dropping = jQuery(e.dropTarget),
                    info = 'Drag to desired location';
                dropping.removeClass('dragFocus');

                e.draggable.hint.removeClass('revertHorizontal revertVertical');

                self.UpdateDraggingInfo(info);
            },
            drop: self.OnDropped
        });
    };
    self.OnDropped = function (e) {
        // 1. create new row (if drop in '.dropToRow')
        // 2. move widgets to new position (if drop in '.dropToMove')
        // 3. reset widgets index (data-index="x") in '.widgetDisplayColumn'

        var dropTarget = jQuery(e.dropTarget),
            dragTarget = e.draggable.element,
            insertType = dropTarget.data('insert-type'),
            dropIndex = dropTarget.data('index'),
            dragIndex = dragTarget.data('index'),
            dragIndexInRow = dragTarget.prevAll('.k-pane').length,
            rowSplitter, columnSplitter, parentRow = dragTarget.parent();
        if (dropTarget.hasClass('dropToRow') || dropTarget.hasClass('dropToColumn')) {
            // row splitter
            rowSplitter = jQuery('#dashboardWrapper').data(enumHandlers.KENDOUITYPE.SPLITTER);

            // drag from?
            columnSplitter = parentRow.data(enumHandlers.KENDOUITYPE.SPLITTER);

            if (dropTarget.hasClass('dropToRow')) {
                dragTarget.removeAttr('style');

                var config = dashboardModel.GetDefaultLayoutConfig(1).structure[0],
                    newRow = rowSplitter[insertType]({ min: self.MinSize }, jQuery('#dashboardWrapper .widgetDisplayRow').eq(dropIndex)).html(dragTarget),
                    newSplitter = jQuery(newRow).addClass('widgetDisplayRow')
                        .data('config', config)
                        .kendoSplitter({
                            panes: [{ min: self.MinSize, size: config.items[0] }]
                        })
                        .data(enumHandlers.KENDOUITYPE.SPLITTER);

                newSplitter.bind('resize', self.SplitterResized);

                // adjust column size for dragging place
                // - if widget is exists then try to adjust size of widget in row
                // - else remove row
                var columns = columnSplitter.element.children('.k-pane'),
                    size = (100 / columns.length) + '%';
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
                var rows = rowSplitter.element.children('.k-pane');
                size = (100 / rows.length) + '%';
                rows.each(function (index, element) {
                    rowSplitter.size(element, size);
                });
            }
            else {
                var columns = jQuery('#dashboardWrapper .widgetDisplayColumn'),
                    dropColumnSplitter;


                var dropParent = columns.eq(dropIndex).parent(),
                    dropIndexInRow = columns.eq(dropIndex).prevAll('.k-pane').length;
                if (insertType === 'insertAfter') {
                    dropIndexInRow++;
                }
                dropColumnSplitter = dropParent.data(enumHandlers.KENDOUITYPE.SPLITTER);
                if (dragIndex >= dropParent.find('.k-pane:first').data('index') && dragIndex <= dropParent.find('.k-pane:last').data('index')) {
                    // do not reset sizing if move to same row
                    dragTarget[insertType](columns.eq(dropIndex));
                    dropColumnSplitter._removeSplitBars();
                    dropColumnSplitter._addPane(dragTarget.data('pane'), dropIndexInRow, dragTarget);
                }
                else {
                    // reset sizing if move to other row
                    var size = (100 / (dropParent.children('.k-pane').length + 1)) + '%';
                    dragTarget[insertType](columns.eq(dropIndex));
                    dropColumnSplitter._removeSplitBars();
                    dropColumnSplitter._addPane({ min: self.MinSize }, dropIndexInRow, dragTarget);
                    dropColumnSplitter.element.children('.k-pane').each(function (index, element) {
                        dropColumnSplitter.size(element, size);
                    });

                    // adjust size of widget in row
                    var columns = columnSplitter.element.children('.k-pane');
                    if (columns.length === 0) {
                        rowSplitter.remove(parentRow);
                    }
                    else {
                        size = (100 / columns.length) + '%';

                        columnSplitter.options.panes = [];
                        columnSplitter._removeSplitBars();

                        columns.each(function (index, element) {
                            columnSplitter.options.panes[index] = { min: self.MinSize, size: size };
                            columnSplitter.size(element, size);
                        });
                    }
                }
            }

            // update index
            jQuery('#dashboardWrapper .widgetDisplayColumn').each(function (index, column) {
                jQuery(column).data('index', index);
            });

            self.CanUpdateLayoutConfig = true;
            self.UpdateLayoutConfig(100);
            self.UpdateDisplayLayout();
        }
        self.ClearDropArea();
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
            var sumRowHeight = jQuery('#dashboardWrapper .widgetDisplayRow').map(function () { return jQuery(this).height(); }).get().sum();
            jQuery('#dashboardWrapper .widgetDisplayRow').each(function (rowIndex, row) {
                row = jQuery(row);

                var config = jQuery.extend({}, row.data('config'));
                config.height = Math.min(100, Math.floor(row.height() / sumRowHeight * 100 * 100) / 100) + '%';
                config.items = [];

                var sumColumnWidth = row.children('.widgetDisplayColumn').map(function () { return jQuery(this).width(); }).get().sum();
                row.children('.widgetDisplayColumn').each(function (columnIndex, column) {
                    column = jQuery(column);
                    config.items[columnIndex] = Math.min(100, Math.floor(column.width() / sumColumnWidth * 100 * 100) / 100) + '%';
                });
                jQuery(row).data('config', config);

                structure.push(jQuery.extend({}, config));
            });

            // update layout
            dashboardDetailsHandler.Model.Data().layout = { structure: structure, widgets: [] };

            // update widget_definitions
            jQuery('#dashboardWrapper .widgetDisplayColumn').each(function (index, element) {
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
        var dashboardWrapperTop = mainWrapper.offset().top;
        var widgetPosition = widgetElement.offset();

        var maximize = widgetElement.find('.widgetToolbarActions .widgetButtonMaximize').clone(true);
        widgetElement.find('.widgetToolbarActions .widgetButtonMaximize').remove();

        maximizeWrapper
            .removeData()
            .empty()
            .css({
                top: widgetPosition.top,
                left: widgetPosition.left,
                width: widgetElement.width(),
                height: widgetElement.height()
            })
            .attr('class', widgetElement.attr('class') + ' active')
            .append(widgetElement.children());

        // set data
        var metadata = widgetElement.data();
        if (metadata.Model)
            metadata.Model.Container = '#widgetMaximizeWrapper';

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
            top: dashboardWrapperTop,
            width: WC.Window.Width,
            height: mainWrapper.height()
        };
        var setMaximize = function () {
            // update layout
            maximizeWrapper.width('100%');
            self.UpdateDisplayLayout(0);
            maximizeWrapper.find('.widgetToolbarActions .k-content').prepend(maximize);
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
        var viewModel = widgetWrapper.data('Model');
        if (viewModel)
            viewModel.Container = containerId;

        // animation
        var widgetOffset = widgetWrapper.offset();
        var animateProperties = {
            left: widgetOffset.left,
            top: widgetOffset.top,
            width: widgetWrapper.width(),
            height: widgetWrapper.height()
        };
        var setMinimize = function () {
            // clean data + move element + update layout
            maximizeWrapper.removeClass('active').removeData();
            widgetWrapper.append(maximizeWrapper.children());
            self.UpdateDisplayLayout(animate === false ? 0 : 10);
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

                var rowTargetIndex = element.parent().prevAll('.widgetDisplayRow').length;
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

                        var splitter = element.parent().data(enumHandlers.KENDOUITYPE.SPLITTER);
                        splitter.remove(element);
                        if (splitter.element.children('.k-pane').length === 0) {
                            var rowSplitter = jQuery('#dashboardWrapper').data(enumHandlers.KENDOUITYPE.SPLITTER);
                            rowSplitter.remove(splitter.element);
                        }

                        if (dashboardModel.Data().widget_definitions.length <= 1) {
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

    /*
    BOF: M4-9737: Dashboard: Add actions menu button
    1.Add actions menu button - same location as on angle page
    1.1.Save dashboard => Quick save dashboard
    1.2.Edit dashboard => Open Dashboard details>Definition pop-up
    2.Both options are always visible 
    2.1.Enabled see the M4 Authorisations and priviliges document
    */
    self.ToggleActionDropDown = function () {
        if (jQuery('#ActionDropdownList').hasClass('disabled'))
            return;

        if (jQuery('#ActionDropdownListPopup').is(':visible'))
            self.HideActionDropDown();
        else
            self.ShowActionDropDown();
    };
    self.ShowActionDropDown = function () {
        jQuery('#AngleField').removeClass('top');
        jQuery('#ActionDropdownListPopup').show();
    };
    self.HideActionDropDown = function () {
        jQuery('#AngleField').addClass('top');
        jQuery('#ActionDropdownListPopup').hide();
    };
    self.RenderActionDropdownList = function () {
        var data = [],
            isEnable = false,
            isQuickSave, isQuickSaveAs, isEdit, isExecuteDashboard,
            isEditMode = self.IsEditMode(),
            allowQuickSave = dashboardModel.CanUpdateDashboard('layout'),
            allowQuickSaveAs = !dashboardModel.IsTemporaryDashboard() && privilegesViewModel.IsAllowExecuteDashboard();

        jQuery.each(enumHandlers.DASHBOARDACTION, function (key, action) {
            isQuickSave = action.Id === enumHandlers.DASHBOARDACTION.SAVE.Id;
            isQuickSaveAs = action.Id === enumHandlers.DASHBOARDACTION.SAVEAS.Id;
            isEdit = action.Id === enumHandlers.DASHBOARDACTION.EDIT.Id;
            isExecuteDashboard = action.Id === enumHandlers.DASHBOARDACTION.EXECUTEDASHBOARD.Id;

            isEnable = false;
            if ((isEditMode && isExecuteDashboard) || !isExecuteDashboard) {
                if ((isQuickSave && allowQuickSave) || (isQuickSaveAs && allowQuickSaveAs) || isEdit || isExecuteDashboard) {
                    isEnable = true;
                }

                data.push(jQuery.extend({ Enable: isEnable }, action));
            }
        });

        var menuHtml = [];
        jQuery.each(data, function (index, action) {
            menuHtml[index] = '<a class="actionDropdownItem ' + action.Id + (action.Enable ? '' : ' disabled') + '" onclick="dashboardHandler.CallActionDropdownFunction(this, \'' + action.Id + '\')">' + action.Text + '</a>';
        });
        jQuery('#ActionDropdownListPopup .k-window-content').html(menuHtml.join(''));
    };
    self.CallActionDropdownFunction = function (obj, selectedValue) {
        if (!jQuery(obj).hasClass('disabled')) {
            self.HideActionDropDown();
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
            open: function (e) {
                var angle = widget.GetAngle();
                var display = widget.GetDisplay();
                var blocks = angle.query_definition.concat(display.query_blocks);
                var modelRoles = ko.toJS(userModel.GetModelRolesByModelUri(angle.model));

                handler = new WidgetDetailsHandler('#popup' + popupName);
                handler.Angle = angle;
                handler.ModelUri = angle.model;
                handler.Data.AngleName(angle.name);
                handler.Data.DisplayName(display.name);
                handler.Data.AngleDescription(angle.description);
                handler.Data.DisplayDescription(display.description);
                handler.Data.QueryBlocks(blocks);
                handler.Data.ModelRoles(modelRoles);
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
        executionParameter.CancelExecutionParameters = function (option) {
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
            jQuery.localStorage('page_changed', true);
            WC.Ajax.AbortLongRunningRequest();
            WC.Ajax.DeleteResult();
            return;
        });
    }
}

var dashboardHandler = new DashboardHandler();
