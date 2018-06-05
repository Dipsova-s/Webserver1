var itemInfoHandler = new ItemInfoHandler();

function ItemInfoHandler() {
    "use strict";

    var self = this;
    self.HandlerInfoDetails = null;

    self.ShowInfoPopup = function (uri, event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        WC.Ajax.AbortAll();

        var item = searchModel.GetItemByUri(uri);
        if (!item)
            return;

        requestHistoryModel.SaveLastExecute(self, self.ShowInfoPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var popupName, popupSettings;
        var buttons = [
            {
                text: Localization.Ok,
                position: 'right',
                isPrimary: true,
                click: 'close'
            },
            {
                text: Captions.Button_EditItem,
                position: 'right',
                className: 'executing',
                isPrimary: true,
                click: function (kendoWindow, obj) {
                    if (popup.CanButtonExecute(obj)) {
                        var params = {}, redirectUrl;
                        params[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                        if (item.type === enumHandlers.ITEMTYPE.ANGLE) {
                            redirectUrl = WC.Utility.GetAnglePageUri(uri, enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT, params);
                        }
                        else {
                            redirectUrl = WC.Utility.GetDashboardPageUri(uri, params);
                        }

                        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting);
                        window.location.href = redirectUrl;
                    }
                }
            }
        ];
        if (item.type === enumHandlers.ITEMTYPE.ANGLE) {
            popupName = 'AngleInfo';
        }
        else {
            popupName = 'DashboardInfo';
        }
        popupSettings = {
            element: '#popup' + popupName,
            title: item.type === enumHandlers.ITEMTYPE.ANGLE ? Localization.AngleDetails : Localization.DashboardDetails,
            className: 'popup' + popupName + ' editmode',
            buttons: buttons,
            animation: false,
            resize: function (e) {
                var winWidth = e.sender.element.width();
                e.sender.wrapper.find('.k-window-titlebar .Name').css('max-width', winWidth - 360);

                if (self.HandlerInfoDetails) {
                    self.HandlerInfoDetails.AdjustLayout();
                }
            },
            open: function (e) {
                if (self.HandlerAngleDetails) {
                    self.HandlerInfoDetails.SetData(item.description, []);
                }
                else {
                    self.HandlerInfoDetails = new WidgetDetailsHandler(e.sender.element, item.description, [], []);
                    self.HandlerInfoDetails.ModelUri = item.model;
                    self.HandlerInfoDetails.ApplyHandler();
                }

                var titleElement = e.sender.wrapper.find('.k-window-title');

                if (item.type === enumHandlers.ITEMTYPE.ANGLE) {
                    self.HandlerInfoDetails.IsVisibleModelRoles(false);

                    // show name + tools button first
                    angleInfoModel.Data(item);
                    angleInfoModel.Data.commit();

                    angleInfoModel.Name(item.name);
                    angleInfoModel.Name.commit();

                    angleInfoModel.IsStarred(!!(item.user_specific && item.user_specific.is_starred));

                    titleElement.after(WC.WidgetDetailsView.TemplateAngleInfoPopupHeader);

                    WC.HtmlHelper.ApplyKnockout({
                        uri: item.uri,
                        Data: angleInfoModel.Data,
                        Name: angleInfoModel.Name,
                        IsStarred: angleInfoModel.IsStarred,
                        SetFavoriteItem: searchPageHandler.SetFavoriteItem
                    }, e.sender.wrapper.find('.angleInformation'));

                    e.sender.element.busyIndicator(true);

                    // gettting angle
                    var angle;
                    var query = {};
                    query[enumHandlers.PARAMETERS.CACHING] = false;
                    query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
                    GetDataFromWebService(item.uri, query)
                        .then(function (response) {
                            angle = response;
                            angleInfoModel.SetData(angle);

                            // load fields
                            return angleInfoModel.LoadMetadata(angle, null);
                        })
                        .then(function () {
                            // load labels
                            var isLoadAllLabels = true;
                            jQuery.each(angle.assigned_labels, function (index, label) {
                                if (!modelLabelCategoryHandler.GetLabelById(label)) {
                                    isLoadAllLabels = false;
                                    return false;
                                }
                            });
                            if (isLoadAllLabels) {
                                return jQuery.when(true);
                            }
                            else {
                                var labelUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELS);
                                return modelLabelCategoryHandler.LoadAllLabels(labelUri);
                            }
                        })
                        .done(function () {
                            var angleDescription = WC.Utility.GetDefaultMultiLangText(angle.multi_lang_description);

                            //Sort displayDefinitions ASC
                            var displayDefinitions = angleInfoModel.Data().display_definitions;
                            jQuery.each(displayDefinitions, function (index, display) {
                                display.name = WC.Utility.GetDefaultMultiLangText(WC.Utility.ToArray(display.multi_lang_name));
                            });
                            displayDefinitions.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);

                            //Find Label
                            var labels = [];
                            jQuery.each(angle.assigned_labels, function (index, value) {
                                var labelItem = modelLabelCategoryHandler.GetLabelById(value);
                                if (labelItem) {
                                    labels.push(labelItem.name);
                                }
                                else {
                                    labels.push(value);
                                }
                            });

                            self.HandlerInfoDetails.Angle = angle;
                            self.HandlerInfoDetails.ShowExecutionParameterPopup = function (display, event) {
                                if (angle.is_parameterized || display.is_parameterized) {
                                    self.ShowAngleExecutionParameterPopup(angle, display.uri);
                                }
                                else {
                                    event.currentTarget.href += "&" + enumHandlers.ANGLEPARAMETER.STARTTIMES + "=" + jQuery.now();
                                    return true;
                                }
                            };
                            self.HandlerInfoDetails.IsVisibleDisplayList(true);
                            self.HandlerInfoDetails.SetData(angleDescription, angleInfoModel.Data().query_definition, [], displayDefinitions, labels);

                            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                            e.sender.element.busyIndicator(false);
                            e.sender.trigger('resize');
                        });
                }
                else {
                    self.HandlerInfoDetails.IsVisibleDefinition(false);
                    self.HandlerInfoDetails.Angle = null;
                    self.HandlerInfoDetails.IsVisibleModelRoles(false);
                    self.HandlerInfoDetails.ShowExecutionParameterPopup = function (angle, display, event) {
                        if (angle.is_parameterized || display.is_parameterized) {
                            self.ShowAngleExecutionParameterPopup(angle, display.uri);
                        }
                        else {
                            event.currentTarget.href += "&" + enumHandlers.ANGLEPARAMETER.STARTTIMES + "=" + jQuery.now();
                            return true;
                        }
                    };

                    titleElement.after(WC.WidgetDetailsView.TemplateDashboardInfoPopupHeader);

                    WC.HtmlHelper.ApplyKnockout({
                        uri: item.uri,
                        Model: {
                            Data: ko.observable({
                                name: function () { return item.name; },
                                user_specific: { is_starred: function () { return item.user_specific.is_starred; } },
                                is_published: function () { return item.is_published; },
                                is_validated: function () { return item.is_validated; },
                                authorizations: item.authorizations
                            })
                        },
                        SetFavorite: searchPageHandler.SetFavoriteItem
                    }, e.sender.wrapper.find('.dashboardInformation'));

                    query = {};
                    query[enumHandlers.PARAMETERS.CACHING] = false;

                    var dashboard;
                    dashboardModel.LoadDashboard(item.uri)
                        .then(function (response) {
                            dashboard = response;
                            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                            e.sender.trigger('resize');
                        })
                        .then(function () {
                            // load labels
                            var isLoadAllLabels = true;
                            jQuery.each(dashboard.assigned_labels, function (index, label) {
                                if (!modelLabelCategoryHandler.GetLabelById(label)) {
                                    isLoadAllLabels = false;
                                    return false;
                                }
                            });
                            if (isLoadAllLabels) {
                                return jQuery.when(true);
                            }
                            else {
                                var labelUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELS);
                                return modelLabelCategoryHandler.LoadAllLabels(labelUri);
                            }
                        })
                        .then(function () {
                            return dashboardModel.LoadAngles(dashboardModel.KeyName, false, true);
                        })
                        .done(function () {
                            //Find Label
                            var labels = [];
                            jQuery.each(dashboard.assigned_labels, function (index, value) {
                                var labelItem = modelLabelCategoryHandler.GetLabelById(value);
                                if (labelItem) {
                                    labels.push(labelItem.name);
                                }
                                else {
                                    labels.push(value);
                                }
                            });

                            //find angles
                            var widgets = dashboard.widget_definitions;
                            var angleList = self.CreateAngleListInDashboardInfo(widgets);

                            //set sort display
                            angleList.sortObject('angleName', enumHandlers.SORTDIRECTION.ASC, false);
                            for (var i = 0; i < angleList.length; i++) {
                                angleList[i].displays.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
                            };

                            //group by model
                            var modelList = self.CreateModelListInDashboardInfo(angleList);
                            //set sort model
                            modelList.sortObject('modelName', enumHandlers.SORTDIRECTION.ASC, false);

                            self.HandlerInfoDetails.SetWidget(labels, true, modelList);
                            self.HandlerInfoDetails.IsVisibleWidgetList(true);
                            self.HandlerInfoDetails.IsVisibleDisplayList(false);

                        });

                }
            },
            close: function (e) {
                e.sender.element.busyIndicator(false);

                WC.Ajax.AbortAll();
                e.sender.destroy();
            }
        };

        popup.Show(popupSettings);
    };

    self.CreateAngleListInDashboardInfo = function (widgets) {
        var angleList = [];

        jQuery.each(widgets, function (index, widget) {
            var angleInDashboard;

            var angle = $.grep(angleList, function (e) { return e.angle.uri === widget.angle; });
            if (angle.length === 0) {
                angleInDashboard = $.grep(dashboardModel.Angles, function (e) { return e.uri === widget.angle; })[0];
                angle = {
                    modelName: modelsHandler.GetModelName(angleInDashboard.model),
                    angleName: angleInDashboard.name,
                    angle: angleInDashboard,
                    displays: []
                };
                angleList.push(angle);
            }
            else
                angle = angle[0];

            var display = $.grep(angle.angle.display_definitions, function (e) { return e.uri === widget.display; });
            var existingDisplay = $.grep(angle.displays, function (e) { return (display.length > 0 && e.uri === display[0].uri); });
            if (existingDisplay.length === 0 && display.length > 0)
                angle.displays.push(display[0]);
        });

        return angleList;
    };

    self.CreateModelListInDashboardInfo = function (angleList) {
        var modelList = [];

        jQuery.each(angleList, function (index, angle) {
            var model = $.grep(modelList, function (e) { return e.modelName === angle.modelName; });
            if (model.length === 0) {
                model = {
                    modelName: angle.modelName,
                    angleList: []
                };
                model.angleList.push(angle);
                modelList.push(model);
            }
            else
                model[0].angleList.push(angle);
        });
        return modelList;
    };

    // popup execution parameter
    self.ShowAngleExecutionParameterPopup = function (angle, displayUri) {
        var executionParameter = new ExecutionParameterHandler();
        executionParameter.ModelUri = angle.model;
        executionParameter.ClickShowBaseClassInfoPopupString = 'searchPageHandler.ShowBaseClassInfoPopup(this, "' + angle.model + '")';
        executionParameter.ShowPopupBeforeCallback = function () {
            return jQuery.when(fieldCategoryHandler.LoadFieldCategories())
                .then(function () {
                    // check is full angle info
                    if (angle.display_definitions) {
                        return jQuery.when(angle);
                    }
                    else {
                        var query = {};
                        query[enumHandlers.PARAMETERS.CACHING] = false;
                        return GetDataFromWebService(angle.uri, query);
                    }
                })
                .done(function (response) {
                    var displayObject = response.display_definitions.findObject('uri', displayUri);
                    executionParameter.Angle = response;
                    executionParameter.Angle.query_definition = WC.Utility.ToArray(executionParameter.Angle.query_definition);
                    jQuery.each(executionParameter.Angle.query_definition, function (index, queryBlock) {
                        executionParameter.Angle.query_definition[index] = WC.ModelHelper.ExtendQueryBlock(queryBlock);
                    });
                    if (displayObject) {
                        executionParameter.Display = displayObject;
                        executionParameter.Display.query_blocks = WC.Utility.ToArray(executionParameter.Display.query_blocks);
                        jQuery.each(executionParameter.Display.query_blocks, function (index, queryBlock) {
                            executionParameter.Display.query_blocks[index] = WC.ModelHelper.ExtendQueryBlock(queryBlock);
                        });
                    }
                });
        };
        executionParameter.ShowExecutionParameterPopup();

        // override method
        executionParameter.SubmitExecutionParameters = function (option) {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);
            var q = {};
            // M4-33874 keep parameterized to local storage (bug fixed in IE an Edge)
            jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, option);
            if (executionParameter.Angle.is_template) {
                q[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
            }
            q[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
            window.location.href = WC.Utility.GetAnglePageUri(executionParameter.Angle.uri, executionParameter.Display ? executionParameter.Display.uri : displayUri, q);
        };
        executionParameter.CancelExecutionParameters = jQuery.noop;
    };
}