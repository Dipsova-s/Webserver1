window.ItemInfoHandler = function () {
    "use strict";

    var self = this;
    self.CacheItems = {};
    self.MaxDisplays = 8;
    self.HandlerInfoDetails = null;

    self.ShowInfoPopup = function (uri, event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        WC.Ajax.AbortAll();

        var item = searchModel.GetItemByUri(uri);
        if (!item)
            return;
        
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
                isPrimary: false,
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
        var popupName = item.type === enumHandlers.ITEMTYPE.ANGLE ? 'AngleInfo' : 'DashboardInfo';
        var popupSettings = {
            element: '#popup' + popupName,
            title: item.type === enumHandlers.ITEMTYPE.ANGLE ? Localization.AngleDetails : Localization.DashboardDetails,
            className: 'popup' + popupName + ' editmode',
            buttons: buttons,
            animation: false,
            width: 830,
            height: 530,
            resize: function (e) {
                var winWidth = e.sender.element.width();
                e.sender.wrapper.find('.k-window-titlebar .Name').css('max-width', winWidth - 360);

                if (self.HandlerInfoDetails) {
                    self.HandlerInfoDetails.AdjustLayout();
                }
            },
            open: function (e) {
                self.HandlerInfoDetails = new WidgetDetailsHandler(e.sender.element, item.description, [], []);
                self.HandlerInfoDetails.ModelUri = item.model;
                self.HandlerInfoDetails.ApplyHandler();

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
                        SetFavoriteItem: self.SetFavoriteItem
                    }, e.sender.wrapper.find('.angleInformation'));

                    e.sender.element.busyIndicator(true);

                    // gettting angle
                    self.LoadItem(GetDataFromWebService, item.uri)
                        .then(function (response) {
                            self.CacheItems[item.uri] = response;
                            self.HandlerInfoDetails.Angle = response;
                            angleInfoModel.SetData(response);

                            // load fields
                            return angleInfoModel.LoadMetadata(response, null);
                        })
                        .then(function () {
                            // load labels
                            var shouldLoadLabel = false;
                            jQuery.each(self.HandlerInfoDetails.Angle.assigned_labels, function (index, label) {
                                if (!modelLabelCategoryHandler.GetLabelById(label)) {
                                    shouldLoadLabel = true;
                                    return false;
                                }
                            });
                            if (!shouldLoadLabel) {
                                return jQuery.when(true);
                            }
                            else {
                                var labelUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELS);
                                return modelLabelCategoryHandler.LoadAllLabels(labelUri);
                            }
                        })
                        .done(function () {
                            var angleDescription = WC.Utility.GetDefaultMultiLangText(self.HandlerInfoDetails.Angle.multi_lang_description);

                            //Sort displayDefinitions ASC
                            var displayDefinitions = angleInfoModel.Data().display_definitions;
                            self.UpdateDisplayDefinitions(displayDefinitions);

                            //Find Label
                            var labels = [];
                            jQuery.each(self.HandlerInfoDetails.Angle.assigned_labels, function (index, value) {
                                var labelItem = modelLabelCategoryHandler.GetLabelById(value);
                                if (labelItem) {
                                    labels.push(labelItem.name);
                                }
                                else {
                                    labels.push(value);
                                }
                            });

                            self.HandlerInfoDetails.ShowExecutionParameterPopup = function (angle, display, event) {
                                return self.ShowAngleExecutionParameterPopupFunction(angle, display, event);
                            };
                            self.HandlerInfoDetails.SetData(angleDescription, angleInfoModel.Data().query_definition, [], displayDefinitions, labels);

                            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                        })
                        .always(function () {
                            e.sender.element.busyIndicator(false);
                            e.sender.trigger('resize');
                        });
                }
                else {
                    self.HandlerInfoDetails.IsVisibleDefinition(false);
                    self.HandlerInfoDetails.Angle = null;
                    self.HandlerInfoDetails.IsVisibleModelRoles(false);
                    self.HandlerInfoDetails.ShowExecutionParameterPopup = function (angle, display, event) {
                        return self.ShowAngleExecutionParameterPopupFunction(angle, display, event);
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
                        SetFavorite: self.SetFavoriteItem
                    }, e.sender.wrapper.find('.dashboardInformation'));

                    e.sender.element.busyIndicator(true);

                    var dashboard;
                    self.LoadItem(dashboardModel.LoadDashboard, item.uri)
                        .then(function (response) {
                            self.CacheItems[item.uri] = response;
                            dashboardModel.SetData(response);
                            dashboard = response;
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
                            return dashboardModel.LoadAngles(DashboardViewModel.KeyName, false, false);
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
                            }

                            //group by model then sort them
                            var modelList = self.CreateModelListInDashboardInfo(angleList);
                            modelList.sortObject('modelName', enumHandlers.SORTDIRECTION.ASC, false);

                            self.HandlerInfoDetails.SetWidget(labels, false, modelList);
                            self.HandlerInfoDetails.IsVisibleWidgetList(true);

                            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                        })
                        .always(function () {
                            e.sender.element.busyIndicator(false);
                            e.sender.trigger('resize');
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

    self.SetFavoriteIconCSSClass = function (target, data) {
        target.addClass(self.GetSignFavoriteIconCSSClass(data));
    };

    self.GetSignFavoriteIconCSSClass = function (data) {
        if (!data.authorizations.update_user_specific) {
            return 'always-hide';
        }
        if (data.user_specific && data.user_specific.is_starred) {
            return 'SignFavorite';
        }
        return 'SignFavoriteDisable';
    };

    self.SetFavoriteItem = function (value, event) {
        var target = jQuery(event.currentTarget);
        if (target.hasClass('always-hide') || target.hasClass('loader-spinner-inline'))
            return;

        var uri = value instanceof Object ? value.uri : value;
        var model = searchModel.GetItemByUri(uri);
        if (!model || !model.authorizations.update_user_specific)
            return;
        
        target.removeClass('SignFavoriteDisable SignFavorite').addClass('loader-spinner-inline');
        searchModel.SetFavoriteItem(model)
            .done(function (data) {
                var isStarred = false;
                if (data.user_specific && data.user_specific.is_starred) {
                    isStarred = data.user_specific.is_starred;
                }
                if (model.user_specific) {
                    model.user_specific.is_starred = isStarred;
                }
                else {
                    var userSpecificObject = {};
                    userSpecificObject.is_starred = isStarred;
                    model.user_specific = userSpecificObject;
                }
                self.SetFavoriteIconCSSClass(target, model);
                self.UpdateFavoriteItem(data);

            })
            .always(function () {
                target.removeClass('loader-spinner-inline');
            });

        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            event.returnValue = false;
        }
    };
    self.UpdateFavoriteItem = function (model) {
        var itemGrid = jQuery("#InnerResultWrapper").data(enumHandlers.KENDOUITYPE.GRID);
        if (itemGrid) {
            var isStarredCount = model.user_specific.is_starred ? 1 : -1;
            // update grid
            jQuery.each(itemGrid.dataSource.data(), function (index, item) {
                if (item.uri === model.uri) {
                    item.user_specific.is_starred = model.user_specific.is_starred;
                }
            });

            var countResultfacetFilters = function (resultfacetfilters, isStarredCount) {
                if (resultfacetfilters.length > 0) {
                    resultfacetfilters[0].count(resultfacetfilters[0].count() + isStarredCount);
                }
            };
            // update facet
            if (facetFiltersViewModel.Data().length > 0) {
                var resultfacetitem = jQuery.grep(facetFiltersViewModel.Data(), function (facetItem) { return facetItem.id === 'facetcat_characteristics'; });
                var resultfacetitemhasvalue = resultfacetitem.length > 0 ? resultfacetitem[0] : null;
                if (resultfacetitemhasvalue !== null && resultfacetitemhasvalue.filters().length > 0) {
                    var resultfacetfilters = jQuery.grep(resultfacetitemhasvalue.filters(), function (facetfilter) {
                        return facetfilter.id === 'facet_isstarred';
                    });

                    countResultfacetFilters(resultfacetfilters, isStarredCount);
                }
            }
            itemGrid.refresh();
        }
    };

    self.LoadItem = function (fn, uri) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return jQuery.when(self.CacheItems[uri] || fn(uri, query))
            .done(function (data) {
                self.CacheItems[uri] = data;
            });
    };
    
    self.HideDisplays = function () {
        jQuery('#popupDisplays').hide();
    };
    self.CreateShowDisplaysElement = function (target, totalDisplays) {
        var container = jQuery('#popupDisplays');
        if (!container.length) {
            container = jQuery('<div class="k-window-titleless k-window-custom" id="popupDisplays" />');
            container.appendTo('body');
            jQuery.clickOutside('#popupDisplays', '.btnShowDisplays');
            jQuery(window).off('resize.showdisplays').on('resize.showdisplays', function () {
                self.HideDisplays();
            });
        }
        container.html('<div class="k-window-content k-content" />');
        container.removeClass('bottom');
        container.show();

        var settings = self.GetDisplaysElementSettings(container.width(), target, totalDisplays);
        container.addClass(settings.arrow);
        container.css(settings.offset);
        container.children('.k-window-content').height(settings.height);

        return container;
    };
    self.GetDisplaysElementSettings = function (contentWidth, target, totalDisplays) {
        var settings = { offset: {}, height: 0, arrow: 'k-window-arrow-e' };
        var arrowSize = 12;
        var maxDisplays = Math.min(self.MaxDisplays, totalDisplays);
        var contentHeight = maxDisplays * 26;
        var offset = target.offset();
        offset.left = offset.left - contentWidth - arrowSize;
        offset.top = offset.top - 10;

        // position top top of target if no space at bottom
        if (offset.top + contentHeight > WC.Window.Height) {
            settings.arrow += ' bottom';
            offset.top -= contentHeight - 30;
        }

        settings.offset = offset;
        settings.height = contentHeight;
        return settings;
    };

    self.CreateAngleListInDashboardInfo = function (widgets) {
        var angleList = [];

        jQuery.each(widgets, function (index, widget) {
            // skip
            if (!widget.angle)
                return true;

            var angleInDashboard;

            var angle = jQuery.grep(angleList, function (e) { return e.angle.uri === widget.angle; });
            if (!angle.length) {
                angleInDashboard = jQuery.grep(dashboardModel.Angles, function (e) { return e.uri === widget.angle; })[0];
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

            var display = jQuery.grep(angle.angle.display_definitions, function (e) { return e.uri === widget.display; });
            var existingDisplay = jQuery.grep(angle.displays, function (e) {
                return display.length && e.uri === display[0].uri;
            });
            if (!existingDisplay.length && display.length)
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

    self.UpdateDisplayDefinitions = function (displayDefinitions) {
        //Sort displayDefinitions ASC
        jQuery.each(displayDefinitions, function (index, display) {
            display.name = WC.Utility.GetDefaultMultiLangText(WC.Utility.ToArray(display.multi_lang_name));
        });
        displayDefinitions.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
    };

    // popup execution parameter
    self.ShowAngleExecutionParameterPopupFunction = function (angle, display, event) {
        if (angle.is_parameterized || display.is_parameterized) {
            self.ShowAngleExecutionParameterPopup(angle, display.uri);
        }
        else {
            var params = {};
            if (event.currentTarget.href.indexOf(SearchStorageHandler.Query + '=') === -1)
                params[SearchStorageHandler.Query] = searchStorageHandler.Id;
            params[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
            var link = event.currentTarget.href + '&' + jQuery.param(params);
            WC.Utility.RedirectUrl(link);
        }
    };
    self.ShowAngleExecutionParameterPopup = function (angle, displayUri) {
        var executionParameter = new ExecutionParameterHandler();
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
                q[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.ANGLEPOPUP;
                q[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
            }
            q[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
            window.location.href = WC.Utility.GetAnglePageUri(executionParameter.Angle.uri, executionParameter.Display ? executionParameter.Display.uri : displayUri, q);
        };
        executionParameter.CancelExecutionParameters = jQuery.noop;
    };
};
var itemInfoHandler = new ItemInfoHandler();