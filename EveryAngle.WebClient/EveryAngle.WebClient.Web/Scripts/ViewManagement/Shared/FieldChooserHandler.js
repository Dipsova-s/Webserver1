var fieldsChooserHandler = new FieldsChooserHandler();

function FieldsChooserHandler() {
    "use strict";

    var self = this;
    //BOF: View model properties
    self.PopupConfig = '';
    self.ModelUri = '';
    self.AngleClasses = [];
    self.AngleSteps = [];
    self.DisplaySteps = [];
    self.USETYPE = {
        ADDCOLUMN: 'AddColumn',
        ADDFILTER: 'AddFilter',
        ADDDASHBOARDFILTER: 'AddDashboardFilter',
        ADDAGGREGATION: 'AddAggregation'
    };
    self.FOLLOWUPINDEX = {
        LAST: 'last',
        NO: '-1'
    };
    //EOF: View model properties

    //BOF: View model methods
    self.ShowPopup = function (popupName, type, handler) {
        if (typeof type === 'undefined')
            type = null;

        self.PopupConfig = self.GetPopupConfiguration(type, handler);
        window.fieldsChooserModel = new FieldsChooserModel();
        fieldsChooserModel.GridName = enumHandlers.FIELDCHOOSERNAME.FIELDCHOOSER;
        fieldsChooserModel.ModelUri = self.ModelUri;

        // set fields & source fields
        fieldsChooserModel.FieldsSource = modelFieldSourceHandler.GetFieldsSourceByModelUri(self.ModelUri);
        fieldsChooserModel.Fields = modelFieldsHandler.GetFieldsByModel(self.ModelUri);

        // default facet filters
        var defaultStarred = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_STARRED_FIELDS);
        var defaultSuggested = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_SUGGESTED_FIELDS);
        fieldsChooserModel.DefaultFacetFilters = self.GetDefaultFacetFilters(defaultStarred, defaultSuggested);
        fieldsChooserModel.BeforeOpenCategoryFunction = null;
        fieldsChooserModel.HideFacetsFunction = function () { return false; };
        fieldsChooserModel.DisabledFacetsFunction = function () { return false; };
        fieldsChooserModel.PossibleToSetStar = true;
        fieldsChooserModel.ClientSettings = userSettingModel.Data().client_settings;

        // captions
        var resourceBoolean = internalResourceHandler.GetResourceById(enumHandlers.FIELDTYPE.BOOLEAN);
        if (resourceBoolean) {
            fieldsChooserModel.Captions.FieldTypeBoolean = resourceBoolean.short_name;
        }
        var resourceEnumurated = internalResourceHandler.GetResourceById(enumHandlers.FIELDTYPE.ENUM);
        if (resourceEnumurated) {
            fieldsChooserModel.Captions.FieldTypeEnum = resourceEnumurated.short_name;
        }

        fieldsChooserModel.FieldChooserType = self.GetFieldChooserType(type);
        fieldsChooserModel.ShowTechnicalInfo = userSettingModel.GetByName(enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER);
        fieldsChooserModel.CanDuplicatedField = false;
        fieldsChooserModel.ForceSetSelecting = false;
        fieldsChooserModel.CheckFieldIsExistsFunction = null;
        fieldsChooserModel.AllowMultipleSelection = true;
        fieldsChooserModel.DefaultPagesize = systemSettingHandler.GetDefaultPageSize();
        fieldsChooserModel.MaxPageSize = systemSettingHandler.GetMaxPageSize();
        fieldsChooserModel.MaxDomainElementsForSearch = systemSettingHandler.GetMaxDomainForSearch();
        fieldsChooserModel.GetFieldsErrorFunction = function (xhr) {
            self.GetFieldsErrorFunction(xhr);
        };
        fieldsChooserModel.ShowFieldInfoFunction = function (field) {
            self.ShowFieldInfoFunction(field);
        };
        fieldsChooserModel.OnClosePopup = function (e) {
            self.OnClosePopup(e, handler, window.listHandler);
        };
        fieldsChooserModel.OnResizePopup = function (e) {
            kendo.resize(e.sender.element);
        };
        fieldsChooserModel.SaveUserSettingsViewMode = function (viewMode) {
            var clientSetting = jQuery.parseJSON(fieldsChooserModel.ClientSettings);
            clientSetting[enumHandlers.CLIENT_SETTINGS_PROPERTY.FIELD_CHOOSER_VIEW_MODE] = viewMode;
            var data = { client_settings: JSON.stringify(clientSetting) };
            userSettingModel.Save(data, true);
            fieldsChooserModel.ClientSettings = data.client_settings;
        };

        // get field chooser popup settings
        var popupSettings = fieldsChooserModel.GetPopupFieldChooserOptions(popupName);

        // decide to set type of field chooser popup
        self.InitializePopupSettingsByName(popupName, popupSettings, handler);

        // start render field chooser popup
        fieldsChooserModel.GetFieldChooserButtons = function () {
            return popupSettings.buttons;
        };

        // initialize popup
        var win = fieldsChooserModel.DisplayFieldChooserPopup(popupSettings);
        jQuery('.k-overlay').off('click').on('click', jQuery.proxy(win.close, win));
    };
    self.InitializePopupSettingsByName = function (popupName, popupSettings, handler) {
        // other settings
        switch (popupName) {
            case self.USETYPE.ADDCOLUMN:
                self.SetAddColumnPopupSettings(popupSettings, handler, window.listHandler);
                break;

            case self.USETYPE.ADDFILTER:
                self.SetAddFilterPopupSettings(popupSettings, handler);
                break;

            case self.USETYPE.ADDAGGREGATION:
                self.SetAddAggregationPopupSettings(popupSettings, handler);
                break;

            case self.USETYPE.ADDDASHBOARDFILTER:
                self.SetAddDashboardFilterPopupSettings(popupSettings, handler);
                break;

            default:
                break;
        }
    };
    self.SetSubmitButtonCaption = function (popupSettings, caption) {
        popupSettings.buttons = [
            {
                text: caption,
                click: function (e) {
                    self.OnSubmitFieldChooser(e.currentTarget);
                },
                className: 'btn btn-primary float-right executing'
            }
        ];
    };
    self.OnSubmitFieldChooser = function (obj) {
        if (popup.CanButtonExecute(obj)) {
            fieldsChooserModel.OnSubmit.call();
        }
    };
    self.SetAddColumnPopupSettings = function (popupSettings, handler, listHandler) {
        popupSettings.title = Localization.InsertColumn;
        self.SetSubmitButtonCaption(popupSettings, Localization.Ok);

        fieldsChooserModel.CanDuplicatedField = true;
        fieldsChooserModel.ForceSetSelecting = true;
        fieldsChooserModel.OnSubmit = function () {
            (handler || listHandler).AddColumns(fieldsChooserModel.SelectedItems());
            fieldsChooserModel.ClosePopup();
        };
    };
    self.SetAddFilterPopupSettings = function (popupSettings, handler) {
        popupSettings.title = Localization.SelectAPropertyToApplyAsFilter;
        self.SetSubmitButtonCaption(popupSettings, Localization.Ok);

        fieldsChooserModel.CanDuplicatedField = true;
        fieldsChooserModel.AllowMultipleSelection = false;
        fieldsChooserModel.OnSubmit = function () {
            var selectedItem = fieldsChooserModel.SelectedItems()[0];
            if (selectedItem) {
                if (handler.CompareInfo) {
                    handler.SetCompareFieldFilter(selectedItem, handler.CompareInfo.Index);
                }
                else if (handler.FollowupInfo) {
                    handler.InsertFieldFilter(selectedItem, handler.FollowupInfo.Index);
                }
                else {
                    handler.AddFieldFilter(selectedItem);
                }
            }
            fieldsChooserModel.ClosePopup();
        };
        if (fieldsChooserModel.FieldChooserType) {
            fieldsChooserModel.HideFacetsFunction = function (category, id) {
                if (category === fieldsChooserModel.CATEGORIES.FIELDTYPE) {
                    return self.IsFieldTypeInGroup(id, fieldsChooserModel.FieldChooserType);
                }
                return false;
            };
            fieldsChooserModel.DisabledFacetsFunction = function (category, id) {
                if (category === fieldsChooserModel.CATEGORIES.FIELDTYPE) {
                    return !self.IsFieldTypeInGroup(id, fieldsChooserModel.FieldChooserType);
                }
                return false;
            };
        }
    };
    self.SetAddDashboardFilterPopupSettings = function (popupSettings, handler) {
        popupSettings.title = Localization.SelectAPropertyToApplyAsFilter;
        self.SetSubmitButtonCaption(popupSettings, Localization.Ok);

        fieldsChooserModel.CanDuplicatedField = false;
        fieldsChooserModel.AllowMultipleSelection = false;
        fieldsChooserModel.GetCustomQueryUriFunction = function (page) {
            var request = this.GetQueryFilterDefaultUri(page);
            var dashboardModelData = dashboardModel.Data();
            request.url = modelsHandler.GetQueryFieldsUri(null, dashboardModelData, true);
            return request;
        };
        fieldsChooserModel.CheckFieldIsExistsFunction = function (fieldId) {
            return handler.GetData().hasObject('field', fieldId, false);
        };
        fieldsChooserModel.OnSubmit = function () {
            var selectedItem = fieldsChooserModel.SelectedItems()[0];

            if (selectedItem) {
                handler.AddFieldFilter(selectedItem);
            }

            fieldsChooserModel.ClosePopup();
        };
    };
    self.SetAddAggregationPopupSettings = function (popupSettings, handler) {
        popupSettings.title = self.GetAggregationPopupTitle(fieldSettingsHandler.FieldSettings.DisplayType, fieldsChooserModel.FieldChooserType);
        self.SetSubmitButtonCaption(popupSettings, Localization.Ok);

        var isDataArea = fieldsChooserModel.FieldChooserType === 'data';
        if (isDataArea) {
            self.SetAggregationSettingDataArea();
        }
        else {
            self.SetAggregationSettingNoneDataArea();
        }
        fieldsChooserModel.ForceSetSelecting = true;
        fieldsChooserModel.CanDuplicatedField = isDataArea;
        fieldsChooserModel.AllowMultipleSelection = self.AllowAggregationMultipleSelection(fieldSettingsHandler.FieldSettings.DisplayType, isDataArea);
        fieldsChooserModel.OnSubmit = function () {
            handler.AddFields(fieldsChooserModel.SelectedItems());
            fieldsChooserModel.ClosePopup();
        };
    };
    self.IsFieldTypeInGroup = function (id, type) {
        var group = ['number', 'int', 'double'];
        var isCompareNumber = jQuery.inArray(type, group) !== -1;
        return (!isCompareNumber && type !== id) || (isCompareNumber && jQuery.inArray(id, group) === -1);
    };
    self.GetAggregationPopupTitle = function (displayType, fieldArea) {
        var mappers = {};
        if (displayType === fieldSettingsHandler.FieldSettings.ComponentType.PIVOT) {
            mappers['row'] = Localization.Row;
            mappers['column'] = Localization.Column;
            mappers['data'] = Localization.Data;
            return kendo.format(Localization.InsertToFieldArea, mappers[fieldArea]);
        }
        else {
            mappers['row'] = 'AggregationHeaderRow';
            mappers['column'] = 'AggregationHeaderColumn';
            mappers['data'] = 'AggregationHeaderData';
            var key = mappers[fieldArea];
            var title = anglePageHandler.HandlerDisplay.QueryDefinitionHandler.Texts()[key];
            return kendo.format(Localization.InsertToFieldArea, title);
        }
    };
    self.AllowAggregationMultipleSelection = function (displayType, isDataArea) {
        return displayType === fieldSettingsHandler.FieldSettings.ComponentType.PIVOT || isDataArea;
    };
    self.SetAggregationSettingDataArea = function () {
        // default check at (Self)
        self.AddAggregationDefaultFacetFilters();
        fieldsChooserModel.BeforeOpenCategoryFunction = function (categoryId, fnExpand) {
            if (categoryId === fieldsChooserModel.CATEGORIES.SOURCE && !jQuery.localStorage('remember_fieldchooser_source')) {
                popup.Confirm(
                    Localization.AlertWarningFieldChooserSource,
                    fnExpand,
                    jQuery.noop,
                    {
                        title: Localization.Warning_Title,
                        session_name: 'remember_fieldchooser_source',
                        icon: 'alert'
                    });
            }
            else {
                fnExpand();
            }
        };

        fieldsChooserModel.HideFacetsFunction = function (category, id) {
            var allowedFieldTypes = ['currency', 'number', 'int', 'double', 'percentage', 'period', 'time', 'timespan'];
            return category === fieldsChooserModel.CATEGORIES.FIELDTYPE && jQuery.inArray(id, allowedFieldTypes) === -1;
        };
    };
    self.AddAggregationDefaultFacetFilters = function () {
        fieldsChooserModel.DefaultFacetFilters.push({
            facet: fieldsChooserModel.CATEGORIES.SOURCE,
            filter: 'self'
        });
    };
    self.SetAggregationSettingNoneDataArea = function () {
        if (fieldSettingsHandler.FieldSettings.DisplayType === fieldSettingsHandler.FieldSettings.ComponentType.CHART)
            self.SetAggregationSettingForChart();

        fieldsChooserModel.CheckFieldIsExistsFunction = function (fieldId) {
            var existed = false;
            jQuery.each(anglePageHandler.HandlerDisplay.QueryDefinitionHandler.Aggregation(), function (index, aggregation) {
                if (aggregation.area() !== AggregationFieldViewModel.Area.Data && aggregation.source_field === fieldId) {
                    existed = true;
                    return false;
                }
            });
            return existed;
        };
    };
    self.SetAggregationSettingForChart = function () {
        var chartType = anglePageHandler.HandlerDisplay.DisplayResultHandler.GetType();
        var isScatterOrBubbleType = ChartHelper.IsScatterOrBubbleType(chartType);
        if (fieldsChooserModel.FieldChooserType === 'row' && isScatterOrBubbleType) {
            fieldsChooserModel.FieldChooserType += '_' + chartType;

            fieldsChooserModel.HideFacetsFunction = function (category, id) {
                var allowedFieldTypes = ['currency', 'number', 'int', 'double', 'percentage', 'date', 'datetime', 'time', 'period'];
                return category === fieldsChooserModel.CATEGORIES.FIELDTYPE && jQuery.inArray(id, allowedFieldTypes) === -1;
            };
        }
    };
    self.OnClosePopup = function (e, handler, listHandler) {
        if (typeof listHandler !== 'undefined') {
            listHandler.AddColumnIndex = null;
        }
        setTimeout(function () {
            if (handler) {
                handler.CompareInfo = null;
                handler.FollowupInfo = null;
            }
        }, 500);
    };
    self.GetFieldsErrorFunction = function (xhr) {
        jQuery('.fieldChooserGridContainer .k-grid-content').busyIndicator(false);

        if (!errorHandlerModel.IsRequiredToRedirectToLoginPage(xhr)) {
            // show error in grid area
            var message = errorHandlerModel.GetAreaErrorMessage(xhr.responseText);
            errorHandlerModel.ShowAreaError(jQuery('.fieldChooserGridContainer .k-virtual-scrollable-wrap'), message, function () {
                fieldsChooserModel.FacetItems([]);
                fieldsChooserModel.InitialFacet().done(function () {
                    fieldsChooserModel.Filter();
                });
            });
        }
    };
    self.ShowFieldInfoFunction = function (field) {
        var icon = fieldsChooserModel.GetCategoryIconByField(field);
        var categoryIcon = '<div class="icon iconCategory"><img src="' + icon.path + '" height="' + icon.dimension.height + '" width="' + icon.dimension.width + '" border="0" /></div>';
        var isStarred = '<div class="icon iconStatus ' + self.GetIsStarredCssClass(fieldsChooserModel.GetIsStarredCssClass(field)) + '"></div>';

        modelFieldsHandler.SetFields([field.toJSON()]);

        var popup = helpTextHandler.ShowHelpTextPopup(field.id, helpTextHandler.HELPTYPE.FIELD, self.ModelUri);

        var popupTitle = popup.wrapper.find('.k-window-title');
        popupTitle.before(isStarred);
        popupTitle.before(categoryIcon);

        popup.wrapper.find('.iconStatus').data('field', field).on('click', function () {
            var that = jQuery(this);
            if (that.hasClass('loader-spinner-inline'))
                return;

            var field = that.data('field');
            var selectedRows = jQuery('#DisplayPropertiesGrid tr[data-uid="' + field.uid + '"]');
            var starrtedElement = selectedRows.find('.column1').children();
            that.attr('class', 'icon iconStatus loader-spinner-inline');
            jQuery.when(fieldsChooserModel.SetIsStarred({}, starrtedElement.get(0), field.uid))
                .always(function () {
                    var newIcon = self.GetIsStarredCssClass(starrtedElement.attr('class'));
                    that.attr('class', 'icon iconStatus ' + newIcon);
                });
        });
    };
    self.GetIsStarredCssClass = function (className) {
        return className.indexOf('DisplayPropertiesGridSignSuggest') !== -1 ? 'DisplayPropertiesGridSignSuggest'
            : className.indexOf('DisplayPropertiesGridSignFavoriteDisable') !== -1 ? 'icon-star-inactive'
            : 'icon-star-active';
    };
    self.GetPopupConfiguration = function (type, handler) {
        //M4-11320 WC: [Chart/Pivot]Send incorrect classes when display didn't have followup but angle had followup
        //Changed row|column|data to DisplayDetail when open field chooser from field setting to fixed the problem
        var popupConfig = jQuery.inArray(type, ['row', 'column', 'data']) !== -1 ? enumHandlers.ANGLEPOPUPTYPE.DISPLAY : type;

        // M4-12025: WC: Filter will be invalid if select field for "Select value"
        // get a correct uri when selecting a compare field
        var followupIndex;
        if (typeof handler !== 'undefined') {
            popupConfig = handler.FilterFor === WC.WidgetFilterHelper.FILTERFOR.ANGLE ? enumHandlers.ANGLEPOPUPTYPE.ANGLE : enumHandlers.ANGLEPOPUPTYPE.DISPLAY;
            if (handler.CompareInfo) {
                followupIndex = self.GetFollowupIndex(handler.GetData(), handler.CompareInfo.Index);
            }
            else if (handler.FollowupInfo) {
                /* M4-32038: add filter before jump */
                followupIndex = self.GetFollowupIndex(handler.GetData(), handler.FollowupInfo.Index - 1, self.FOLLOWUPINDEX.NO);
            }
            else {
                followupIndex = self.FOLLOWUPINDEX.LAST;
            }
            popupConfig += ',' + followupIndex;
        }
        else if (popupConfig === enumHandlers.ANGLEPOPUPTYPE.DISPLAY) {
            followupIndex = self.FOLLOWUPINDEX.LAST;
            popupConfig += ',' + followupIndex;
        }

        return popupConfig;
    };
    self.GetFollowupIndex = function (data, limit, notFoundValue) {
        if (!notFoundValue)
            notFoundValue = self.FOLLOWUPINDEX.LAST;

        if (limit === -1)
            return notFoundValue;

        var followupIndex = -1;
        jQuery.each(data, function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                followupIndex++;
            }
            if (index >= limit) {
                return false;
            }
        });
        return followupIndex === -1 ? notFoundValue : followupIndex;
    };
    self.GetFieldChooserType = function (type) {
        return type === enumHandlers.ANGLEPOPUPTYPE.ANGLE
            || type === enumHandlers.ANGLEPOPUPTYPE.DISPLAY
            || type === enumHandlers.ANGLEPOPUPTYPE.DASHBOARD ? null : type;
    };
    self.GetDefaultFacetFilters = function (defaultStarred, defaultSuggested) {
        var filters = [];
        if (defaultStarred) {
            filters.push({
                facet: fieldsChooserModel.CATEGORIES.CHARACTERISTICS,
                filter: 'starred'
            });
        }
        if (defaultSuggested) {
            filters.push({
                facet: fieldsChooserModel.CATEGORIES.CHARACTERISTICS,
                filter: 'suggested'
            });
        }
        return filters;
    };
    //EOF: View model methods
}
