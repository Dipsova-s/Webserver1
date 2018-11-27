var searchModel = new SearchViewModel();

function SearchViewModel() {
    "use strict";

    var self = this;
    self.TotalItems = ko.observable(0);
    self.Items = ko.observableArray([]);
    self.SelectedItems = ko.observableArray([]);
    self.Angles = ko.observableArray([]);
    self.DeleteItemByUrl = function (url, forced) {
        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = forced;
        return DeleteDataToWebService(url + '?' + jQuery.param(query));
    };
    self.SetFavoriteItem = function (model) {
        requestHistoryModel.SaveLastExecute(self, self.SetFavoriteItem, arguments);

        var isStarredExistingData = false;
        if (model.user_specific && model.user_specific.is_starred) {
            isStarredExistingData = true;
        }

        var data = {
            user_specific: {
                is_starred: !isStarredExistingData
            }
        };

        var query = {};
        query[enumHandlers.PARAMETERS.FORCED] = true;
        return UpdateDataToWebService(model.uri + '?' + jQuery.param(query), data);
    };
    self.SelectRow = function (dataItem) {
        if (dataItem.uri) {
            var item = dataItem.toJSON ? dataItem.toJSON() : ko.toJS(dataItem);
            var selectedItem = self.SelectedItems().findObject('uri', item.uri);
            if (selectedItem) {
                self.SelectedItems.remove(selectedItem);
                searchPageHandler.ClearSelectedRowClass(item);
            }
            else {
                if (self.SelectedItems().length < maxNumberOfMassChangeItems) {
                    self.SelectedItems.push(item);
                    searchPageHandler.SetSelectedRow(item);
                }
                else {
                    searchPageHandler.ClearSelectedRowClass(item);
                    popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_ReachMaximumItems, maxNumberOfMassChangeItems));
                }
            }
        }
    };
    self.ClearSelectedRow = function () {
        self.SelectedItems.removeAll();
    };
    self.GetSelectedItemsId = function () {
        var items = [];
        jQuery.each(self.SelectedItems(), function (index, item) {
            items.push(item.id);
        });
        return items;
    };
    self.GetItemById = function (id) {
        return self.Items().findObject('id', id);
    };
    self.GetItemByUri = function (uri) {
        return self.Items().findObject('uri', uri);
    };
    self.GetHrefUri = function (selectedSearchResultItem, type) {
        var redirectUrl = '';
        if (selectedSearchResultItem.type === enumHandlers.ITEMTYPE.ANGLE) {
            if (selectedSearchResultItem.displays && selectedSearchResultItem.displays.length) {
                var params = {};
                if (selectedSearchResultItem.is_template) {
                    params[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
                }
                redirectUrl = WC.Utility.GetAnglePageUri(selectedSearchResultItem.uri, type, params);
            }
        }
        else {
            redirectUrl = WC.Utility.GetDashboardPageUri(selectedSearchResultItem.uri);
        }
        return redirectUrl;
    };
    self.GetDisplayHrefUri = function (angleUri, displayUri, isTemplate) {
        var params = {};
        if (isTemplate) {
            params[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
        }
        return WC.Utility.GetAnglePageUri(angleUri, displayUri, params);
    };
    self.GetTotalItems = function () {
        if (self.TotalItems() && WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) === "executed")
            return self.TotalItems() - 1;
        else
            return self.TotalItems();
    };
    self.GetDisplayTotalItems = function () {
        if (self.TotalItems() && WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) === "executed")
            return kendo.format(Localization.SearchRecentUseTotalItems, self.TotalItems() - 1);
        else
            return "";
    };

    self.GetShowRecentUseAndHideRecord = function (data) {
        if (self.TotalItems() && WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) === "executed" && !data.uri)
            return "style='display:none'";
        else
            return "";
    };

    self.GetShowRecentUseAndShowRecord = function (data) {
        if (WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) === "executed" && data.uri)
            return "style='display:none'";
        else {
            if (WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) !== "executed")
                return "style='display:none'";
            else
                return "";
        }
    };

    self.GetCreatedItemDetail = function (data) {
        var details = [];

        // model
        var modelName = modelsHandler.GetModelName(data.model);
        details.push(kendo.format('{0}: <strong>{1}</strong>', Localization.Model, modelName || '-'));

        // created
        if (data.created) {
            var createdBy = data.created.full_name;
            var createdDate = WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATETIME_WC, data.created.datetime);
            details.push(kendo.format('{0}: <strong>{1} - {2}</strong>', Localization.CreatedBy, createdBy, createdDate));
        }

        return details.join(' &nbsp; ');
    };
    self.FilterItems = function (model, event, canNegativeFilter) {
        if (event.ctrlKey && model.checked() && canNegativeFilter) {
            model.negative(true);
        }
        else {
            model.negative(false);
        }
        searchPageHandler.ClearAllSelectedRows();
        searchQueryModel.Search();
        jQuery('#LeftMenu').scrollTop(0);
    };
    self.CheckNoDisplay = function (selectedSearchResultItem) {
        if (selectedSearchResultItem.type === enumHandlers.ITEMTYPE.ANGLE) {
            if (typeof selectedSearchResultItem.displays !== 'undefined' && selectedSearchResultItem.displays.length > 0) {
                var checkDisplays = jQuery.grep(selectedSearchResultItem.displays, function (display, index) { return display.display_type; });

                if (!checkDisplays || checkDisplays.length === 0) {
                    return false;
                }

                return "searchModel.ItemLinkClicked(event,'" + selectedSearchResultItem.uri + "', enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT)";
            }
            else {
                return false;
            }
        }
        else {
            return "searchModel.ItemLinkClicked(event,'" + selectedSearchResultItem.uri + "', enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT)";
        }
    };
    self.ItemLinkClicked = function (event, uri, type, displayUri) {
        var item = self.GetItemByUri(uri);
        if (!item || !self.IsValidClickItemLink(event))
            return true;

        var redirectUrl = (event.currentTarget || event.target || event.srcElement).href;
        if (item.type !== enumHandlers.ITEMTYPE.DASHBOARD) {
            // get full angle to check is_parameterized and warning in displays
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CheckingAngle, false);

            var query = {};
            query[enumHandlers.PARAMETERS.CACHING] = false;
            GetDataFromWebService(item.uri, query)
                .done(function (angle) {
                    var displayObject;
                    if (type === enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT) {
                        displayObject = WC.Utility.GetDefaultDisplay(angle.display_definitions);
                    }
                    else if (displayUri) {
                        displayObject = angle.display_definitions.findObject('uri', displayUri);
                    }
                    else {
                        displayObject = angle.display_definitions.findObject('display_type', type);
                    }

                    var angleValidation = validationHandler.GetAngleValidation(angle);
                    var displayValidation = validationHandler.GetAngleValidation(displayObject);
                    if (angleValidation.CanPostResult && displayValidation.CanPostResult
                        && (angle.is_parameterized || (displayObject && displayObject.is_parameterized))) {
                        progressbarModel.EndProgressBar();
                        itemInfoHandler.ShowAngleExecutionParameterPopup(angle, displayObject.uri);
                    }
                    else {
                        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Redirecting);
                        if (displayObject) {
                            redirectUrl = redirectUrl.replace('display=' + type, 'display=' + displayObject.uri);
                        }
                        window.location.href = redirectUrl + "&" + enumHandlers.ANGLEPARAMETER.STARTTIMES + "=" + jQuery.now();
                    }

                    angleInfoModel.Data(angle);
                    angleInfoModel.Data.commit();
                });
        }
        else {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CheckingDashboard, false);

            // get full dashboard info
            dashboardModel.LoadDashboard(item.uri)
                .then(function () {
                    return dashboardModel.LoadAngles(dashboardModel.keyName, false);
                })
                .done(function () {
                    var executionInfo = dashboardModel.GetDashboardExecutionParameters();
                    if (executionInfo.query_steps.length) {
                        progressbarModel.EndProgressBar();
                        searchPageHandler.ShowDashboardExecutionParameterPopup(dashboardModel.Data(), executionInfo);
                    }
                    else {
                        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Redirecting);
                        window.location.href = redirectUrl;
                    }
                });
        }
        return false;
    };
    self.IsValidClickItemLink = function (event) {
        var isTriggerClick = event.isTrigger;
        var isLtIE9 = jQuery.browser.msie && parseFloat(jQuery.browser.version) < 9;
        var isLeftClick = (isLtIE9 && event.button === 1) || (!isLtIE9 && event.button === 0);
        var isNormalClick = !event.ctrlKey && !event.shiftKey;
        return isTriggerClick || (isLeftClick && isNormalClick);
    };
    self.SetValidDeleteItems = function (angles, dashboards) {
        jQuery.each(self.SelectedItems(), function (index, item) {
            if (item.type === enumHandlers.ITEMTYPE.ANGLE) {
                angles.push(item);
            }
            else {
                dashboards.push(item);
            }
        });
    };
    self.IsValidToDeleteMultipleAngles = function (angles, dashBoards) {
        var isvalid = true;

        for (var i = 0; i < self.SelectedItems().length; i++) {
            var angle = self.SelectedItems()[i];

            if (angle.type === enumHandlers.ITEMTYPE.ANGLE) {
                angles.push(angle.uri);

                if (!angle.authorizations['delete']) {
                    isvalid = false;
                    break;
                }
            }
            else if (angle.type === enumHandlers.ITEMTYPE.DASHBOARD) {
                dashBoards.push(angle.uri);
            }
        }

        return isvalid;
    };
    self.DashboardDefaultDisplay = function (item) {
        /*
        M4-9739: Show chart display by default
        1. Use the personal default display when this is a chart display
        2. Use the default display when this is a chart display
        3. Use the first public chart display available
        4. Use the first chart display available
        5. Standard procedure for selecting display:
        5.1. User default display
        5.2. Angle default display
        */

        if (!item || !item.display_definitions.length)
            return null;

        //Use the personal default display when this is a chart display
        var defaultDisplays = jQuery.grep(item.display_definitions, function (value) {
            return value.display_type === enumHandlers.DISPLAYTYPE.CHART && value.user_specific && value.user_specific.is_user_default;
        });
        if (defaultDisplays.length)
            return defaultDisplays[0];

        //Use the default display when this is a chart display
        defaultDisplays = jQuery.grep(item.display_definitions, function (value) {
            return value.display_type === enumHandlers.DISPLAYTYPE.CHART && value.is_angle_default;
        });
        if (defaultDisplays.length)
            return defaultDisplays[0];

        //Use the first public chart display available
        defaultDisplays = jQuery.grep(item.display_definitions, function (value) {
            return value.display_type === enumHandlers.DISPLAYTYPE.CHART && value.is_public;
        });
        if (defaultDisplays.length)
            return defaultDisplays[0];

        //Use the first chart display available
        defaultDisplays = jQuery.grep(item.display_definitions, function (value) {
            return value.display_type === enumHandlers.DISPLAYTYPE.CHART && !value.is_pulbic;
        });
        if (defaultDisplays.length)
            return defaultDisplays[0];

        //Standard procedure for selecting display
        return WC.Utility.GetDefaultDisplay(item.display_definitions);
    };
    self.GetTotalDisplays = function (item) {
        var displays = WC.Utility.ToArray(item.displays);
        return displays.length;
    };
}
