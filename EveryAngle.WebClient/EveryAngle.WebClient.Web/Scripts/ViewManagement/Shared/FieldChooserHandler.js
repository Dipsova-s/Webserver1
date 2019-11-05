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
        requestHistoryModel.SaveLastExecute(self, self.ShowPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

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
        fieldsChooserModel.SaveUserSettingsViewMode = function (viewMode) {
            var clientSetting = jQuery.parseJSON(fieldsChooserModel.ClientSettings);
            clientSetting[enumHandlers.CLIENT_SETTINGS_PROPERTY.FIELD_CHOOSER_VIEW_MODE] = viewMode;
            var data = { client_settings: JSON.stringify(clientSetting) };
            userSettingModel.Save(data, true);
            fieldsChooserModel.ClientSettings = data.client_settings;
        };

        // get field chooser popup settings
        var popupSettings = fieldsChooserModel.GetPopupFieldChooserOptions(popupName);

        // create json array buttons for field chooser popup
        popupSettings.buttons = self.GetFieldChooserButtons();

        // decide to set type of field chooser popup
        self.InitializePopupSettingsByName(popupName, popupSettings, handler);

        // start render field chooser popup
        fieldsChooserModel.GetFieldChooserButtons = function () {
            return popupSettings.buttons;
        };

        // initialize popup
        fieldsChooserModel.DisplayFieldChooserPopup(popupSettings);
    };
    self.InitializePopupSettingsByName = function (popupName, popupSettings, handler) {
        switch (popupName) {
            case self.USETYPE.ADDCOLUMN:
                self.SetAddColumnPopupSettings(popupSettings, handler, window.listHandler);
                break;

            case self.USETYPE.ADDFILTER:
                self.SetAddFilterPopupSettings(popupSettings, handler);
                break;

            case self.USETYPE.ADDAGGREGATION:
                self.SetAddAggregationPopupSettings(popupSettings);
                break;

            case self.USETYPE.ADDDASHBOARDFILTER:
                self.SetAddDashboardFilterPopupSettings(popupSettings, handler);
                break;

            default:
                break;
        }
    };
    self.GetFieldChooserButtons = function () {
        return [
            {
                text: Captions.Button_Cancel,
                click: function (e, kendoWindow) {
                    kendoWindow.close();
                    e.stopPropagation();
                },
                className: 'btn btn-ghost float-right executing'
            },
            {
                text: Localization.Ok,
                click: jQuery.noop,
                className: 'btn btn-primary float-right executing'
            }
        ];
    };
    self.SetSubmitButtonCaption = function (popupSettings, caption) {
        var btnSubmit = popupSettings.buttons.findObject('text', Localization.Ok);
        btnSubmit.text = caption;
        btnSubmit.click = function (e) {
            self.OnSubmitFieldChooser(e.currentTarget);
        };
    };
    self.OnSubmitFieldChooser = function (obj) {
        if (popup.CanButtonExecute(obj)) {
            fieldsChooserModel.OnSubmit.call();
        }
    };
    self.SetAddColumnPopupSettings = function (popupSettings, handler, listHandler) {
        popupSettings.title = Localization.InsertColumn;

        self.SetSubmitButtonCaption(popupSettings, Localization.InsertColumn);

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
    self.IsFieldTypeInGroup = function (id, type) {
        var group = ['number', 'int', 'double'];
        var isCompareNumber = jQuery.inArray(type, group) !== -1;
        return (!isCompareNumber && type !== id) || (isCompareNumber && jQuery.inArray(id, group) === -1);
    };
    self.SetAddAggregationPopupSettings = function (popupSettings) {
        popupSettings.title = self.GetAggregationPopupTitle(fieldSettingsHandler.FieldSettings.DisplayType, fieldSettingsHandler.CurrentFieldArea);

        self.SetSubmitButtonCaption(popupSettings, Localization.InsertField);

        if (fieldsChooserModel.FieldChooserType === 'data') {
            self.SetAggregationSettingDataArea();
        }
        else {
            self.SetAggregationSettingNoneDataArea();
        }

        fieldsChooserModel.ForceSetSelecting = true;
        fieldsChooserModel.CanDuplicatedField = true;
        fieldsChooserModel.AllowMultipleSelection = true;
        fieldsChooserModel.OnSubmit = function () {
            fieldSettingsHandler.AddFields(fieldsChooserModel.SelectedItems());

            fieldsChooserModel.ClosePopup();
        };
    };
    self.GetAggregationPopupTitle = function (displayType, fieldArea) {
        var areaName;
        if (displayType === fieldSettingsHandler.FieldSettings.ComponentType.PIVOT) {
            if (fieldArea === 'row')
                areaName = Localization.Row;
            else if (fieldArea === 'column')
                areaName = Localization.Column;
            else
                areaName = Localization.Data;
        }
        else {
            var chartDetails = fieldSettingsHandler.FieldSettings.GetDisplayDetails();
            if (fieldArea === 'row')
                areaName = fieldSettingsHandler.GetLocalizationTextByChartType(chartDetails.chart_type, 'ChartRowArea');
            else if (fieldArea === 'column')
                areaName = fieldSettingsHandler.GetLocalizationTextByChartType(chartDetails.chart_type, 'ChartColumnArea');
            else
                areaName = fieldSettingsHandler.GetLocalizationTextByChartType(chartDetails.chart_type, 'ChartDataArea');
        }
        return kendo.format(Localization.InsertToFieldArea, areaName);
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
        self.SetAggregationSettingForChart(fieldSettingsHandler.FieldSettings.GetDisplayDetails());

        fieldsChooserModel.CheckFieldIsExistsFunction = function (fieldId) {
            var matchedField = fieldSettingsHandler.GetAggregationFieldSettingBySourceField(fieldId);
            return matchedField && matchedField.Area !== enumHandlers.FIELDSETTINGAREA.DATA;
        };
    };
    self.SetAggregationSettingForChart = function (currentChartDetails) {
        var isBubbleOrScatterChart = currentChartDetails.chart_type === enumHandlers.CHARTTYPE.BUBBLECHART.Code
                                    || currentChartDetails.chart_type === enumHandlers.CHARTTYPE.SCATTERCHART.Code;
        if (fieldsChooserModel.FieldChooserType === 'row' && isBubbleOrScatterChart) {
            fieldsChooserModel.FieldChooserType += '_' + currentChartDetails.chart_type;

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
        var isStarred = '<div class="icon iconStatus ' + fieldsChooserModel.GetIsStarredCssClass(field) + '"></div>';

        modelFieldsHandler.SetFields([field.toJSON()]);

        var popup = helpTextHandler.ShowHelpTextPopup(field.id, helpTextHandler.HELPTYPE.FIELD, self.ModelUri);

        var popupTitle = popup.wrapper.find('.k-window-title').css('text-indent', 60);
        popupTitle.before(isStarred);
        popupTitle.before(categoryIcon);

        popup.wrapper.find('.iconStatus').data('field', field).on('click', function () {
            var that = jQuery(this);
            var field = that.data('field');
            var selectedRows = jQuery('#DisplayPropertiesGrid tr[data-uid="' + field.uid + '"]');
            var starrtedElement = selectedRows.find('.column1').children();

            that.addClass('signLoading');
            jQuery.when(fieldsChooserModel.SetIsStarred({}, starrtedElement.get(0), field.uid))
                .done(function () {
                    that.attr('class', 'icon iconStatus ' + starrtedElement.attr('class'));
                });
        });
    };
    self.GetPopupConfiguration = function (type, handler) {
        //M4-11320 WC: [Chart/Pivot]Send incorrect classes when display didn't have followup but angle had followup
        //Changed row|column|data to DisplayDetail when open field chooser from field setting to fixed the problem
        var popupConfig = jQuery.inArray(type, ['row', 'column', 'data']) !== -1 ? enumHandlers.ANGLEPOPUPTYPE.DISPLAY : type;

        // M4-12025: WC: Filter will be invalid if select field for "Select value"
        // get a correct uri when selecting a compare field
        var followupIndex;
        if (typeof handler !== 'undefined') {
            popupConfig = handler.FilterFor === handler.FILTERFOR.ANGLE ? enumHandlers.ANGLEPOPUPTYPE.ANGLE : enumHandlers.ANGLEPOPUPTYPE.DISPLAY;
            if (handler.CompareInfo) {
                followupIndex = self.GetFollowupIndex(handler.Data(), handler.CompareInfo.Index);
            }
            else if (handler.FollowupInfo) {
                /* M4-32038: add filter before jump */
                followupIndex = self.GetFollowupIndex(handler.Data(), handler.FollowupInfo.Index - 1, self.FOLLOWUPINDEX.NO);
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
