var pivotPageHandler = new PivotPageHandler();

function PivotPageHandler(elementId, container) {
    "use strict";

    var self = this;
    self.DEFAULT_SIZES = {
        HEADER: 150,
        HEADER_MIN: 80,
        DATA: 100,
        DATA_MIN: 50
    };
    self.StartDataIndex = 0;
    self.UpdateLayoutChecker = null;
    self.ColumnSize = null;
    self.IsUnSavePivot = false;
    self.ExistingBucketValue = null;
    self.HasResult = ko.observable(false);
    self.ReadOnly = ko.observable(false);
    self.DashBoardMode = ko.observable(false);
    self.Models = {
        Angle: angleInfoModel,
        Display: displayModel,
        DisplayQueryBlock: displayQueryBlockModel,
        Result: resultModel
    };
    self.FieldSettings = null;
    self.Container = typeof container === 'undefined' ? '#PivotMainWrapper' : container;
    self.ElementId = typeof elementId === 'undefined' ? '#pivotGrid' : elementId;
    self.ModelId = 'pivot_' + self.ElementId.substr(1);
    self.PivotId = self.ModelId === 'pivot_pivotGrid' ? 'pivotGrid' : 'pivotGrid_' + self.ModelId;
    self.IsDrilldown = false;
    self.ScrollbarPosition = {
        X: 0,
        Y: 0
    };
    self.CachePages = {};
    self.OnChanged = jQuery.noop;
    self.OnRenderStart = jQuery.noop;
    self.OnRenderEnd = jQuery.noop;
    /*EOF: Model Properties*/

    window[self.ModelId] = self;

    self.GetContainer = function () {
        return jQuery(self.Container);
    };
    self.InitialHorizontalScrollbar = function () {
        jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv').on('scroll', function () {
            self.ScrollbarPosition.X = jQuery(this).scrollLeft() || 0;
        });
    };

    self.UpdateFieldSettingDetails = function () {
        if (!self.DashBoardMode() && angleInfoModel.IsTemporaryAngle() && fieldSettingsHandler.FieldSettings) {
            var existingDetails = fieldSettingsHandler.FieldSettings.GetDisplayDetails();
            var pivotDetails = {
                show_total_for: fieldSettingsHandler.FieldSettings.TotalForType,
                percentage_summary_type: fieldSettingsHandler.FieldSettings.PercentageSummaryType,
                include_subtotals: fieldSettingsHandler.FieldSettings.IsIncludeSubTotals
            };

            jQuery.extend(existingDetails, pivotDetails);

            if (fieldSettingsHandler.FieldSettings.SortBySummaryInfo && fieldSettingsHandler.FieldSettings.SortBySummaryInfo.length) {
                existingDetails.sort_by_summary_info = JSON.stringify(fieldSettingsHandler.FieldSettings.SortBySummaryInfo);
            }

            fieldSettingsHandler.FieldSettings.SetDisplayDetails(existingDetails);
            fieldSettingsHandler.Handler.FieldSettings.SetDisplayDetails(existingDetails);
        }
    };

    self.CreatePivotContainer = function () {
        var container = jQuery(self.Container === '#PivotMainWrapper' ? '#AngleTableWrapper' : self.Container);
        if (self.DashBoardMode()) {
            var widgetId = container.find('.widgetDisplay, .pivotAreaContainer').attr('id');
            container.html('<div class="pivotAreaContainer" id="' + widgetId + '" />');
        }
        else {
            container.html([
                '<div id="PivotMainWrapper" class="displayWrapper">',
                '<div id="PivotArea" class="displayArea">',
                '<div class="pivotAreaContainer"></div>',
                '</div>',
                '</div>'
            ].join(''));
        }

        var pivotArea = container.find('.pivotAreaContainer');
        pivotArea.height(container.height());

        return pivotArea;
    };
    self.InjectFieldIconCSS = function () {
        var fields = self.FieldSettings.GetFields();
        jQuery.each(fields, function (index, field) {
            if (field.DataType === enumHandlers.FIELDTYPE.ENUM && field.DomainURI) {
                var domainPath = modelFieldDomainHandler.GetDomainPathByUri(field.DomainURI);
                var fieldDomain = modelFieldDomainHandler.GetFieldDomainByUri(field.DomainURI);
                if (fieldDomain) {
                    jQuery.each(fieldDomain.elements, function (index, element) {
                        var iconInfo = modelFieldDomainHandler.GetDomainElementIconInfo(domainPath, element.id);
                        iconInfo.injectCSS();
                    });
                }
            }
        });
    };
    self.BuildPivotFieldSettings = function (options) {
        if (!self.DashBoardMode()) {
            anglePageHandler.SetWrapperHeight();
            fieldSettingsHandler.Handler = self;
            fieldSettingsHandler.BuildFieldsSettings(options);
        }
        else {
            self.BuildDashboardFieldSettings(options);
        }
    };

    var fnCheckPivotInstance;
    self.GetPivotDisplay = function (isValidDisplay, options) {
        self.OnRenderStart();

        // clear
        self.CachePages = {};
        self.IsDrilldown = false;

        // prepare html
        self.CreatePivotContainer();

        // create field settings
        self.BuildPivotFieldSettings(options);

        clearInterval(fnCheckPivotInstance);
        if (self.HasResult()) {
            // set callback function
            window[self.PivotId + 'OnPivotEndCallback'] = self.OnPivotEndCallback;
            window[self.PivotId + 'OnPivotBeginCallback'] = self.OnPivotBeginCallback;
            window[self.PivotId + 'OnPivotClientError'] = self.OnPivotClientError;
            window[self.PivotId + 'OnPivotGridCellClick'] = self.OnPivotGridCellClick;

            var postData = {
                FieldSettingsData: jQuery.base64.encode(JSON.stringify(self.FieldSettings)),
                UserSettings: JSON.stringify(userSettingModel.Data()),
                CanDrilldown: self.CanDrilldown()
            };
            return self.GetPivotHtml(postData)
                .fail(self.GetPivotDisplayFail)
                .then(self.CheckPivotInstance)
                .then(self.GetPivotDisplayDone)
                .always(self.GetPivotDisplayAlways);
        }
        else {
            self.CheckUpgradeDisplay(false)
                .always(self.GetPivotDisplayAlways);
        }
    };
    self.GetPivotDisplayFail = function (xhr, status) {
        if (status === 'timeout' && self.Models.Display.IsTemporaryDisplay()) {
            self.GetContainer().find('.pivotAreaContainer').empty();
            self.UpdateLayout();
        }
        self.ShowError(xhr);
    };
    self.ShowError = function (xhr) {
        var element = self.Container;
        if (self.DashBoardMode()) {
            element = self.ElementId;
        }
        self.Models.Result.SetRetryPostResult(xhr, element);
    };
    self.CheckPivotInstance = function (response) {
        if (response.indexOf('LoginForm') !== -1) {
            // sometimes get login page cause by session timeout
            errorHandlerModel.RedirectToLoginPage();
            return jQuery.when(false);
        }
        else {
            self.GetContainer().find('.pivotAreaContainer').html(response);
            self.ShowLoadingIndicator();

            var deferred = jQuery.Deferred();
            clearInterval(fnCheckPivotInstance);
            var scriptCount = response.match(new RegExp(ASPx.startupScriptPrefix, 'g')).length;
            fnCheckPivotInstance = setInterval(function () {
                if (self.IsPivotReady()) {
                    // exit
                    clearInterval(fnCheckPivotInstance);
                    deferred.resolve(true);
                }
                else if (self.GetContainer().find('script[id^=' + ASPx.startupScriptPrefix + ']').length === scriptCount) {
                    // make sure all script have been created
                    self.ProcessScriptsAndLinks();
                }
            }, 300);
            return deferred.promise();
        }
    };
    self.GetPivotDisplayDone = function () {
        // fast switch Display will cause of null
        if (!self.FieldSettings)
            return;

        self.InjectFieldIconCSS();
        self.CustomizeDevExpress();
        self.UpdateFieldSettingDetails();
        self.SetColumnSize();
        self.UpdateMaxHeaderSize();
        self.SetPivotCellHeader();
        self.InitialGridColumnsSize();
        self.UpdateSortDataFromPivotTable();
        self.InitialHorizontalScrollbar();
        self.UpdateStorageLayout();
        self.SetPivotLayout(window[self.PivotId]);
        self.EnsureUpdateLayout();

        return self.CheckUpgradeDisplay(true);
    };
    self.IsPivotReady = function () {
        return window[self.PivotId] instanceof MVCxClientPivotGrid && window[self.PivotId].GetMainElement();
    };
    self.ProcessScriptsAndLinks = function () {
        // Devexpress 1.9.1.6 has the issue about the Firefox with slow rendering
        // then for this loc just to make sure the rendering is correct
        if (!self.IsPivotReady()) {
            var container = self.GetContainer();
            container.find('[data-executed]').removeAttr('data-executed');
            ASPx.ProcessScriptsAndLinks('#' + self.PivotId);
        }
    };
    self.GetPivotDisplayAlways = function () {
        self.HideLoadingIndicator();
        measurePerformance.SetEndTime();
        self.OnRenderEnd();
    };
    self.GetPivotHtml = function (postData) {
        self.ShowLoadingIndicator();
        var redirectUrl = WC.HtmlHelper.GetInternalUri('pivotgridpartial', 'pivot');
        var currentModel = modelsHandler.GetModelByUri(self.Models.Angle.Data().model);
        var timeout = undefined;
        if (currentModel && currentModel.id === 'EA4IT') timeout = 0;
        return PostAjaxHtmlResult(redirectUrl, postData, undefined, timeout);
    };
    self.ShowLoadingIndicator = function () {
        self.GetContainer().find('.pivotAreaContainer').busyIndicator(true);
    };
    self.HideLoadingIndicator = function () {
        self.GetContainer().find('.pivotAreaContainer').busyIndicator(false);
    };
    self.CheckUpgradeDisplay = function (isValid) {
        if (self.Models.Display.Data().display_details !== self.FieldSettings.DisplayDetails) {
            if (isValid) {
                var columnDetails = WC.Utility.ParseJSON(self.Models.Display.Data().display_details).columns;
                self.FieldSettings.SetDisplayDetails({ columns: columnDetails });
                if (!self.DashBoardMode())
                    fieldSettingsHandler.FieldSettings.SetDisplayDetails({ columns: columnDetails });
            }
            self.Models.Display.Data().display_details = self.FieldSettings.DisplayDetails;
            self.Models.Display.Data.commit();
        }

        var currentDisplay = self.Models.Display.Data();
        var sourceDisplay = self.GetSourceDisplayData();
        var upgradeData = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
        return displayUpgradeHandler.UpgradeDisplay(currentDisplay.uri, upgradeData)
            .then(function (display) {
                if (display) {
                    self.OnChanged(display, true);
                }
                else {
                    self.OnChanged(self.Models.Display.Data(), WC.ModelHelper.IsAdhocUri(self.Models.Display.Data().uri));
                }
                return jQuery.when(display);
            });
    };
    self.GetSourceDisplayData = function () {
        return self.DashBoardMode() ? self.Models.Display.Data() : anglePageHandler.HandlerDisplay.GetRawData();
    };

    self.CanDrilldown = function () {
        return self.Models.Result.Data().authorizations.change_field_collection;
    };
    self.GetCellCaptionTitle = function (cell) {
        var cellTitle = cell.html();

        // revert back
        if (cellTitle.indexOf('<br>') !== -1) {
            cellTitle = cellTitle.replace(/<br>&nbsp;/g, ' - ');
            cellTitle = cellTitle.replace(/<br>/g, ' - ');
        }

        // remove unused text
        var imageIndex = cellTitle.indexOf('<img');
        if (imageIndex !== -1) {
            cellTitle = cellTitle.replace(/<img .*?>/g, '');
        }

        // detect span tag
        var endSpanIndex = cellTitle.indexOf('</span>');
        if (endSpanIndex !== -1) {
            cellTitle = cellTitle.substr(endSpanIndex + 7);
        }

        // replace '<' and '>'
        cellTitle = cellTitle.replace(/&amp;/g, '&');
        cellTitle = cellTitle.replace(/&lt;/g, '<');
        cellTitle = cellTitle.replace(/&gt;/g, '>');

        return jQuery.trim(cellTitle);
    };
    self.SetPivotCellHeader = function () {
        // field value title
        self.SetPivotFieldsValueCellHeader();

        // field header
        self.SetPivotFieldsCellHeader();

        //cell value title
        self.SetPivotCellHeaderTitle();

        // cell header
        self.SetPivotCellHeaderEvent();
    };
    self.SetTitleforElements = function (match) {
        self.GetContainer().find(match).each(function (index, cell) {
            cell = jQuery(cell);
            var title = self.GetCellCaptionTitle(cell);
            self.SetTooltip(cell, title);
        });
    };
    self.SetPivotFieldsValueCellHeader = function () {
        self.SetTitleforElements('.dxpgColumnFieldValue');
    };
    self.SetTooltip = function (element, text) {
        jQuery(element).attr({
            'data-role': 'tooltip',
            'data-tooltip-position': 'bottom',
            'data-tooltip-text': text
        });
    };
    self.SetPivotCellHeaderTitle = function () {
        self.SetTitleforElements('.dxpgRowFieldValue');
    };
    self.SetPivotFieldsCellHeader = function () {
        var pivotDetails = self.FieldSettings.GetDisplayDetails();
        var percentageSummaryType = parseInt((pivotDetails || {}).percentage_summary_type || 0);
        var areaIndexes = {};
        areaIndexes[enumHandlers.FIELDSETTINGAREA.ROW] = 0;
        areaIndexes[enumHandlers.FIELDSETTINGAREA.COLUMN] = 0;
        areaIndexes[enumHandlers.FIELDSETTINGAREA.DATA] = 0;
        jQuery([
            '#' + self.PivotId + '_DataArea .dxpgHeaderTable',
            '#' + self.PivotId + '_DataArea .dxpgHeaderText'
        ].join(',')).addClass('data');
        self.GetContainer().find('.dxpgHeaderText').each(function (index, header) {
            header = jQuery(header);

            var areaId = self.GetFieldAreaByCellHeader(header);
            var fields = self.FieldSettings.GetFields(areaId).findObjects('IsSelected', true);
            var areaIndex = areaIndexes[areaId];
            areaIndexes[areaId]++;

            var showContextMenu = true;
            if (percentageSummaryType && areaId === enumHandlers.FIELDSETTINGAREA.DATA) {
                if (areaIndex % 2 !== 0) {
                    showContextMenu = false;
                    header.addClass('readonly');
                    self.SetTooltip(header, self.GetCellCaptionTitle(header));
                }
                else {
                    areaIndex = areaIndex / 2;
                }
            }

            if (showContextMenu && fields[areaIndex]) {
                self.SetPivotFieldsCellHeaderContextMenu(header, fields[areaIndex]);
            }
        });
    };
    self.GetFieldAreaByCellHeader = function (header) {
        var areaId;
        if (header.hasClass('row')) {
            areaId = enumHandlers.FIELDSETTINGAREA.ROW;
        }
        else if (header.hasClass('column')) {
            areaId = enumHandlers.FIELDSETTINGAREA.COLUMN;
        }
        else {
            areaId = enumHandlers.FIELDSETTINGAREA.DATA;
        }
        return areaId;
    };
    self.SetPivotFieldsCellHeaderContextMenu = function (header, field) {
        self.SetTooltip(header, jQuery.trim(field.DefaultCaption));
        header
            .attr({
                'data-uid': field.InternalID
            })
            .removeAttr('onclick')
            .prop('onclick', null)
            .off('click')
            .on('click', { uid: field.InternalID }, function (e) {
                var isDataArea = jQuery(this).hasClass('data');
                self.ClosePivotCustomSortPopup();
                if (isDataArea) {
                    setTimeout(function () {
                        jQuery('[id^=' + self.PivotId + '_DHP_PW].dxpclW').addClass('pivotMenuVisible');
                    }, 1);
                }
                fieldSettingsHandler.ShowFieldOptionsMenu(this, e.data.uid, self.ModelId);
                if (self.DashBoardMode()) {
                    if (isDataArea) {
                        fieldSettingsHandler.HideFieldOptionsMenu();
                    }
                    else {
                        jQuery('.HeaderPopup:visible').find('.fieldFormat, .addFilter, .fieldInfo').parent().hide();
                    }
                }
            });

        var sortingElement = header.next('.dxpgHeaderSort');
        if (sortingElement.length) {
            sortingElement
                .removeAttr('onclick')
                .prop('onclick', null)
                .off('click')
                .on('click', function (e) {
                    if (jQuery(this).hasClass('canSort')) {
                        window[self.PivotId].ResetFilterCache(window[self.PivotId].filterFieldIndex);
                        window[self.PivotId].PerformCallbackInternal(this, 'S|' + this.id);
                        jQuery(this).removeClass('canSort');
                    }
                    else {
                        jQuery(this).prev('.dxpgHeaderText').trigger('click');
                    }
                    e.preventDefault();
                });
        }
    };
    self.ShowPivotCustomSortPopupOnHeaderText = function (e) {
        if (!(e.target instanceof HTMLImageElement))
            self.ShowPivotCustomSortPopup(this);
    };
    self.SetPivotCellHeaderEvent = function () {
        var fieldsRowArea = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
        if (fieldsRowArea.length) {
            jQuery('#' + self.PivotId + '_CVSCell_SCDTable .dxpgColumnFieldValue.lastLevel, #' + self.PivotId + '_CVSCell_SCDTable .dxPivotGrid_pgSortByColumn')
                .off('click contextmenu')
                .on('click', self.ShowPivotCustomSortPopupOnHeaderText);
            jQuery('#' + self.PivotId).removeClass('norow');
        }
        else {
            jQuery('#' + self.PivotId).addClass('norow');
        }
    };
    self.FieldOptionClick = function (element, internalId) {
        var field = self.FieldSettings.GetFieldByGuid(internalId);
        element = jQuery(element);
        if (!element.hasClass('disabled')) {
            if (element.hasClass('sortAsc') || element.hasClass('sortDesc')) {
                self.ApplyPivotSorting(element, field);
            }
            else if (element.hasClass('fieldFormat')) {
                WC.HtmlHelper.MenuNavigatable.prototype.LockMenu('.HeaderPopup');
                self.ShowPivotBucketPopup(field);
            }
            else if (element.hasClass('addFilter')) {
                self.ShowPivotAddFilterPopup(field);
            }
            else if (element.hasClass('fieldInfo')) {
                self.ShowPivotHelpTextPopup(field);
            }
            fieldSettingsHandler.HideFieldOptionsMenu();
        }
    };
    self.ApplyPivotSorting = function (element, field) {
        // update field setting
        var sortDirection = element.hasClass('sortAsc') ? 'asc' : 'desc';
        self.UpdateSortingField(field.InternalID, sortDirection);
        var existingSummarySort = self.GetSortSummaryInfoBySortField(field.FieldName);
        if (existingSummarySort && existingSummarySort.sort_direction) {
            self.UpdateSortSummaryInfoBySortField(field.FieldName, element.hasClass('sortAsc') ? '-1' : '1');
        }
        jQuery('.dxpgHeaderText[data-uid="' + field.InternalID + '"]').next('.dxpgHeaderSort').addClass('canSort').trigger('click');
    };
    self.ShowPivotBucketPopup = function (field) {
        var context = anglePageHandler.HandlerDisplay.QueryDefinitionHandler;
        var aggregation = context.GetAggregationFieldById(field.FieldName);
        if (!aggregation)
            return;

        var formatHandler = context.ShowEditAggregationFormatPopup(aggregation);
        if (formatHandler)
            formatHandler.ApplyCallback = jQuery.proxy(context.ApplyAggregation, context);
    };
    self.ShowPivotAddFilterPopup = function (field) {
        var context = anglePageHandler.HandlerDisplay.QueryDefinitionHandler;
        var aggregation = context.GetAggregationFieldById(field.FieldName);
        if (!aggregation)
            return;

        context.AddFilterFromAggregation(aggregation);
    };
    self.ShowPivotHelpTextPopup = function (field) {
        var context = anglePageHandler.HandlerDisplay.QueryDefinitionHandler;
        var aggregation = context.GetAggregationFieldById(field.FieldName);
        if (!aggregation)
            return;

        context.ShowAggregationInfoPopup(aggregation);
    };
    self.BuildDashboardFieldSettings = function (options) {
        var fieldSetting = new FieldSettingsHandler();
        fieldSetting.Handler = self;
        fieldSetting.BuildFieldsSettings(options);
    };
    self.UpdateStorageLayout = function () {
        var pivotDetails = self.FieldSettings.GetDisplayDetails();
        var pivotLayout = WC.Utility.ParseJSON(pivotDetails.layout);

        if (pivotLayout.layout) {
            // remove layout.layout from display details
            delete pivotLayout.layout;
            pivotDetails.layout = JSON.stringify(pivotLayout);
            var pivotDetailsText = JSON.stringify(pivotDetails);

            self.Models.Display.Data().display_details = pivotDetailsText;
            self.Models.Display.Data.commit();

            self.FieldSettings.DisplayDetails = pivotDetailsText;
            self.FieldSettings.Layout = pivotDetails.layout;
            if (!self.DashBoardMode()) {
                fieldSettingsHandler.FieldSettings.DisplayDetails = pivotDetailsText;
                fieldSettingsHandler.FieldSettings.Layout = pivotDetails.layout;
            }
            // update sorting fields
            self.UpdateSortDataFromPivotTable();
        }
    };
    self.GetSortingDirectionFromElement = function (internalId) {
        var sortElement = jQuery('.dxpgHeaderText[data-uid="' + internalId + '"] + td > img');
        if (sortElement.hasClass('dxPivotGrid_pgSortDownButton'))
            return 'desc';
        else if (sortElement.hasClass('dxPivotGrid_pgSortUpButton'))
            return 'asc';
        else
            return '';
    };
    self.UpdateFieldSettingFields = function (fields) {
        self.FieldSettings.Fields = JSON.stringify(fields);
        if (!self.DashBoardMode()) {
            fieldSettingsHandler.FieldSettings.Fields = JSON.stringify(fields);
        }
    };

    // custom sort
    self.GetSortSummaryInfoBySortField = function (sortFieldName) {
        var existingSortSummaryInfoOption = self.FieldSettings.SortBySummaryInfo;
        if (existingSortSummaryInfoOption) {
            var sortingOptions = ko.toJS(existingSortSummaryInfoOption);
            var exisingSortField = sortingOptions.findObject("sort_field", sortFieldName);
            return exisingSortField;
        }
        else {
            return null;
        }
    };
    self.UpdateSortSummaryInfoBySortField = function (fieldId, sortOrder) {
        var existingSortSummaryInfoOption = self.FieldSettings.SortBySummaryInfo;
        if (existingSortSummaryInfoOption) {
            var exisingSortField = existingSortSummaryInfoOption.findObject('sort_field', fieldId);
            if (exisingSortField) {
                exisingSortField.sort_direction = sortOrder;

                if (!self.DashBoardMode()) {
                    fieldSettingsHandler.FieldSettings.SortBySummaryInfo = existingSortSummaryInfoOption;
                }
                var displayDetails = WC.Utility.ParseJSON(self.Models.Display.Data().display_details);
                displayDetails.sort_by_summary_info = JSON.stringify(existingSortSummaryInfoOption);
                self.Models.Display.Data().display_details = JSON.stringify(displayDetails);
                self.Models.Display.Data.commit();
            }
        }
    };
    self.HighlightingColumn = {};
    self.ShowPivotCustomSortPopup = function (element) {
        self.ClosePivotCustomSortPopup();
        fieldSettingsHandler.HideFieldOptionsMenu();
        element = jQuery(element).closest('td');

        // show custom sort menu
        var area = element.hasClass('dxpgColumnFieldValue') ? 'column' : 'row';
        var popupSettings = {
            title: Localization.CustomSortTitle,
            element: '#PivotCustomSortPopup',
            html: '',
            className: 'customSortPopup pivotCustomSortPopup k-window-arrow-w ' + area,
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: 'close',
                    position: 'right'
                },
                {
                    text: Localization.Ok,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            self.ApplyPivotCustomSort(false);
                        }
                    },
                    isPrimary: true,
                    position: 'right'
                },
                {
                    text: Localization.ClearAll,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            self.ClearPivotCustomSort();
                        }
                    },
                    position: 'left'
                }
            ],
            animation: false,
            modal: false,
            center: false,
            draggable: false,
            resizable: false,
            actions: ["Close"],
            open: function (e) {
                self.ShowPivotCustomSortPopupCallback(e, element);
            },
            close: function (e) {
                self.SetActiveColumn(null);
                jQuery(window).off('resize.pivotcustomsort');
                jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv').off('scroll');
                e.sender.destroy();
            }
        };

        popup.Show(popupSettings);
        jQuery(window)
            .on('resize.pivotcustomsort', function () {
                var popupElement = jQuery('.pivotCustomSortPopup');
                var popupPosition = element.offset();
                var popupWidth = popupElement.width();
                var elementWidth = element.width() + 20;
                popupPosition.top -= 50;
                if (popupPosition.left + elementWidth + popupWidth > WC.Window.Width - 10) {
                    popupPosition.left -= popupWidth + 10;
                    popupElement.removeClass('k-window-arrow-w').addClass('k-window-arrow-e');
                }
                else {
                    popupPosition.left += elementWidth;
                    popupElement.removeClass('k-window-arrow-e').addClass('k-window-arrow-w');
                }
                popupElement.css(popupPosition);
            })
            .trigger('resize.pivotcustomsort');

        jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv').on('scroll', function () {
            self.ClosePivotCustomSortPopup();
        });
    };
    self.ShowPivotCustomSortPopupCallback = function (e, element) {
        self.SetActiveColumn(element.attr('id'));
        // render html
        var areaId, labelTemplate, fieldElements;
        var isSortingCell = element.children('.dxPivotGrid_pgSortByColumn').length;
        if (e.sender.wrapper.hasClass('column')) {
            areaId = enumHandlers.FIELDSETTINGAREA.ROW;
            labelTemplate = Captions.PivotCustomSort_LabelColumn;
            fieldElements = jQuery('#' + self.PivotId + '_ACCRowArea .dxpgHeaderText');
        }
        else {
            areaId = enumHandlers.FIELDSETTINGAREA.COLUMN;
            labelTemplate = Captions.PivotCustomSort_LabelRow;
            fieldElements = jQuery('#' + self.PivotId + '_ACCColumnArea .dxpgHeaderText');
        }
        var fields = self.FieldSettings.GetFields(areaId);
        var html = [];
        jQuery.each(fields, function (index, field) {
            html.push([
                index !== 0 ? '<div class="StatSeparate"></div>' : '',
                '<div class="label">' + kendo.format(labelTemplate, field.Caption) + '</div>',
                '<div class="field">',
                '<select data-field="' + field.FieldName + '" class="k-dropdown k-dropdown-large" id="PivotCustomSortField' + index + '">',
                '<option value="">' + Captions.Label_Unsorted + '</option>',
                '<option value="' + enumHandlers.SORTDIRECTION.ASC + '">' + Captions.Label_Sort_Ascending + '</option>',
                '<option value="' + enumHandlers.SORTDIRECTION.DESC + '">' + Captions.Label_Sort_Descending + '</option>',
                '</select>',
                '</div>'
            ].join(''));
        });

        e.sender.element.html(html.join(''));
        e.sender.element.find('.k-dropdown').each(function (index, dropdown) {
            WC.HtmlHelper.DropdownList(dropdown, null, {});
        });

        var currentCellSortSummaryInfo = self.GetCellSortSummaryInfo(false);
        jQuery.each(currentCellSortSummaryInfo, function (index, field) {
            var existingSortField = self.GetSortSummaryInfoBySortField(field.sort_field);
            var sortDirection = '';
            if (existingSortField) {
                // if same cell
                if (existingSortField.summary_field === field.summary_field && jQuery.deepCompare(existingSortField.summary_conditions, field.summary_conditions)) {
                    sortDirection = existingSortField.sort_direction;
                }
            }
            else if (isSortingCell) {
                var targetSortingDirection = fieldElements.eq(index).next().children();
                if (field.summary_conditions) {
                    sortDirection = targetSortingDirection.hasClass('dxPivotGrid_pgSortUpButton') ? "-1" : "1";
                }
            }
            WC.HtmlHelper.DropdownList(jQuery('#PivotCustomSortPopup .k-dropdown[data-role="dropdownlist"]')[index]).value(sortDirection);
        });

        e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
    };
    self.ClosePivotCustomSortPopup = function () {
        popup.Close('#PivotCustomSortPopup');
    };
    self.SetActiveColumn = function (headerId) {
        var headerTarget, elementTargetIndex;
        if (headerId) {
            headerTarget = self.GetContainer().find('[id="' + headerId + '"]');
            elementTargetIndex = self.GetCellCoords(headerTarget).x;
            headerTarget.addClass('pivot-column-active');
            jQuery('#' + self.PivotId + '_DCSCell_SCDTable tr').find('td:eq(' + elementTargetIndex + ')').addClass('pivot-column-active');

            self.HighlightingColumn = {
                header: headerId,
                index: elementTargetIndex
            };
        }
        else {
            headerTarget = self.GetContainer().find('[id="' + self.HighlightingColumn.header + '"]');
            elementTargetIndex = self.HighlightingColumn.index;
            if (headerTarget.length) {
                headerTarget.removeClass('pivot-column-active');
                jQuery('#' + self.PivotId + '_DCSCell_SCDTable tr').find('td:eq(' + elementTargetIndex + ')').removeClass('pivot-column-active');

            }
            self.HighlightingColumn = {};
        }
    };
    self.ClearPivotCustomSort = function () {
        jQuery('#PivotCustomSortPopup select.k-dropdown').val('');
        self.ApplyPivotCustomSort(true);
    };
    self.ApplyPivotCustomSort = function (isClearField) {
        var newsortingOptions = self.GetCellSortSummaryInfo(isClearField);
        var existingSortSummaryInfoOption = self.FieldSettings.SortBySummaryInfo;
        if (existingSortSummaryInfoOption) {
            jQuery.each(newsortingOptions, function (index, field) {
                // if set new option to unsort for and diferent cell get from prevoius setting
                var existingSortField = self.GetSortSummaryInfoBySortField(field.sort_field);
                if (existingSortField && !field.sort_direction && !jQuery.deepCompare(field.summary_conditions, existingSortField.summary_conditions)) {
                    newsortingOptions.removeObject('sort_field', field.sort_field);
                    newsortingOptions.push(existingSortField);
                }
            });
        }
        self.ClosePivotCustomSortPopup();

        // if not same setting get new pivot
        if (!jQuery.deepCompare(existingSortSummaryInfoOption, newsortingOptions, true, false)) {
            self.IsUnSavePivot = true;
            var sortSummaryInfoOptions = { SortBySummaryInfo: newsortingOptions };
            if (self.DashBoardMode()) {
                self.FieldSettings.IsNeedResetLayout = true;
            }

            var displayDetails = WC.Utility.ParseJSON(self.Models.Display.Data().display_details);
            displayDetails.sort_by_summary_info = JSON.stringify(newsortingOptions);
            self.Models.Display.Data().display_details = JSON.stringify(displayDetails);
            self.Models.Display.Data.commit();

            self.OnChanged(self.Models.Display.Data(), false);
            self.GetPivotDisplay(null, sortSummaryInfoOptions);
        }

    };
    self.GetCellSortSummaryInfo = function (isClearField) {
        var sortingOptions = [];
        var columnFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN);
        var dataFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.DATA).findObjects('IsSelected', true);
        var columnMultiply = self.FieldSettings.PercentageSummaryType === 0 ? 1 : 2;
        var summaryField = dataFields[Math.floor(self.HighlightingColumn.index / columnMultiply) % dataFields.length].FieldName;
        var elementTargetIndex = self.GetCellCoords(jQuery('#' + self.PivotId + '_CVSCell_SCDTable .pivot-column-active')).x;
        if (typeof window[self.PivotId].adjustingManager === 'undefined') {
            return sortingOptions;
        }
        var pivotMatrixApi = window[self.PivotId].adjustingManager.pivotTableWrapper._domElements.columnCellsMatrix;

        jQuery('#PivotCustomSortPopup select.k-dropdown').each(function (index, element) {
            element = jQuery(element);

            var sortFieldName = element.data('field');
            var dir = element.val();
            var sortingOption = {
                summary_field: summaryField,
                summary_conditions: [],
                sort_field: sortFieldName,
                sort_direction: dir,
                clear_all: isClearField
            };

            jQuery.each(columnFields, function (fieldIndex, field) {
                var element = pivotMatrixApi.getElement(fieldIndex, elementTargetIndex);
                if (jQuery(element).filter('[data-value]').length) {
                    var elementValue = jQuery(element).data('value');
                    if (IsNullOrEmpty(elementValue)) {
                        elementValue = '';
                    }
                    else if (elementValue === "NULL") {
                        elementValue = null;
                    }
                    sortingOption.summary_conditions.push({ fieldname: field.FieldName, value: elementValue });
                }
            });

            sortingOptions.push(sortingOption);

        });
        return sortingOptions;
    };
    self.UpdateSortDataFromPivotTable = function () {
        // update sort data
        var fields = self.FieldSettings.GetFields();
        jQuery.each(fields, function (index, field) {
            if (field.IsSelected) {
                var sortDirection = self.GetSortingDirectionFromElement(field.InternalID);
                var fieldDetails = JSON.parse(field.FieldDetails);
                fieldDetails.sorting = sortDirection;
                field.FieldDetails = JSON.stringify(fieldDetails);

                var displayField = self.Models.Display.Data().fields.findObject('field', field.FieldName);
                displayField.field_details = field.FieldDetails;
                self.Models.Display.Data.commit();
            }
        });
        self.UpdateFieldSettingFields(fields);
    };
    self.UpdateSortingField = function (internalId, sortDirection) {
        var fields = self.FieldSettings.GetFields();
        var field = fields.findObject('InternalID', internalId);
        if (field) {
            var fieldDetails = JSON.parse(field.FieldDetails);
            fieldDetails.sorting = sortDirection;
            field.FieldDetails = JSON.stringify(fieldDetails);

            var displayField = self.Models.Display.Data().fields.findObject('field', field.FieldName);
            displayField.field_details = field.FieldDetails;
            self.Models.Display.Data.commit();

            self.UpdateFieldSettingFields(fields);
        }
    };

    var fnCheckCurrentScrollbar = null;
    self.OnPivotBeginCallback = function (sender, e) {
        window[self.PivotId].CallbackArgument = null;

        if (sender && sender.ShowLoadingPanel) {
            sender.ShowLoadingPanel();
        }
        e.customArgs["CanDrilldown"] = self.CanDrilldown();
        e.customArgs["fieldSettingsData"] = jQuery.base64.encode(JSON.stringify(self.FieldSettings));
    };

    self.OnPivotEndCallback = function (sender) {
        var callbackArgument = WC.Utility.ToString(window[self.PivotId].CallbackArgument);
        window[self.PivotId].CallbackArgument = null;

        if (sender && sender.HideLoadingPanel) {
            sender.HideLoadingPanel();
        }

        if (self.IsDrilldown) {
            self.IsDrilldown = false;
            return;
        }

        self.SetPivotLayout(sender);
        self.CustomizeDevExpress();

        jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv').off('scroll');

        self.SetPivotCellHeader();
        self.InitialGridColumnsSize();
        self.EnsureUpdateLayout();
        self.UpdateSortDataFromPivotTable();
        fieldSettingsHandler.IsNeedResetLayout = false;

        self.SetActiveColumn(self.HighlightingColumn.header);

        clearInterval(fnCheckCurrentScrollbar);
        if (self.ScrollbarPosition.X !== null) {
            var seed = 0;
            fnCheckCurrentScrollbar = setInterval(function () {
                if (seed <= 100 && self.ScrollbarPosition.X !== jQuery('#' + self.PivotId + '_CVSCell_SCVPDiv').scrollLeft()) {
                    jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv').scrollLeft(self.ScrollbarPosition.X);
                }
                else {
                    self.InitialHorizontalScrollbar();

                    clearInterval(fnCheckCurrentScrollbar);
                }
                seed++;
            }, 1);
        }

        if (callbackArgument.indexOf(':SS|') !== -1
            || callbackArgument.indexOf(':S|') !== -1
            || callbackArgument.indexOf(':ER|') !== -1
            || callbackArgument.indexOf(':EC|') !== -1) {
            // SS: sort by summary
            // S: normal sorting
            // ER : collapse/expand row
            // EC : collapse/expand column
            self.OnChanged(self.Models.Display.Data(), false);
        }
    };
    self.OnPivotClientError = function (s, e) {
        // prevent default error
        e.handled = true;
        window[self.PivotId].CallbackArgument = null;

        if (e.message.indexOf('LoginForm') !== -1) {
            // sometimes get login page cause by session timeout
            errorHandlerModel.RedirectToLoginPage();
        }
        else {
            // check DimensionsFieldValue
            var dimension = WC.Utility.ParseJSON(e.message, null);
            var getDrilldownDetails = function (fields, fieldValues) {
                var details = [];
                jQuery.each(fields, function (index, field) {
                    var fieldValue = fieldValues.findObject('InternalID', field.InternalID);
                    if (fieldValue) {
                        var value;
                        if (WC.FormatHelper.IsDateOrDateTime(field.DataType) && !IsNullOrEmpty(fieldValue.Value)) {
                            value = WC.DateHelper.UnixTimeToUtcDate(fieldValue.Value, false);
                        }
                        else {
                            value = fieldValue.Value;
                        }
                        details.push({
                            FieldName: field.FieldName,
                            FieldValue: value
                        });
                    }
                });
                return details;
            };

            if (dimension && dimension.FieldValues) {
                var rowFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.ROW);
                var columnFields = self.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN);

                var rowDetails = getDrilldownDetails(rowFields, dimension.FieldValues);
                var columnDetails = getDrilldownDetails(columnFields, dimension.FieldValues);

                if (dimension.Type === 2 || columnDetails.length || rowDetails.length) {
                    setTimeout(function () {
                        // grand total
                        self.Models.Display.CreateDrilldown(rowDetails, columnDetails, self);
                    }, 1);
                }
            }
        }
    };
    self.OnPivotGridCellClick = function (s, e) {
        if (self.CanDrilldown() && e.Value !== '') {
            if (!self.DashBoardMode()) {
                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DrillingDown, false);
            }
            self.IsDrilldown = true;
            window[self.PivotId].PerformCallback({
                "isDrilldown": true,
                'rowIndex': e.RowIndex,
                'columnIndex': e.ColumnIndex,
                'rowValueType': e.RowValueType,
                'columnValueType': e.ColumnValueType,
                'rowValue': e.RowValue,
                'columnValue': e.ColumnValue,
                'rowFieldName': e.RowFieldName,
                'columnFieldName': e.ColumnFieldName
            });
        }
    };
    self.CustomizeDevExpress = function () {
        // before call ajax
        self.CustomizePerformControlCallback();

        // while get result success
        self.CustomizeDoCallback();

        // fixed error when scrolldown
        self.CustomizeGetAreaLocation();
        self.CustomizeGetScrollOffset();

        // fixed js error when scroll to new page and click any where
        self.CustomizeCollectionBase();
    };
    self.CustomizePerformControlCallback = function () {
        if (typeof MVCx.__PerformControlCallback === 'function')
            return;

        MVCx.__PerformControlCallback = MVCx.PerformControlCallback;
        MVCx.PerformControlCallback = function (name, url, arg, params, customParams) {
            var checkArg = arg || '';
            var isVirtualPage = checkArg.indexOf(':VS|') !== -1;
            if (!isVirtualPage || checkArg.indexOf('|-1|') === -1) {
                var handler = window['pivot_' + name];
                if (!handler)
                    handler = window[name.replace('pivotGrid_', '')];
                if (handler && handler.CachePages[arg]) {
                    var ctrl = ASPx.GetControlCollection().Get(name);
                    if (ctrl && (!window[name].LastCallbackArgument || window[name].LastCallbackArgument !== arg))
                        ctrl.DoCallback(handler.CachePages[arg]);
                }
                else {
                    MVCx.__PerformControlCallback(name, url, arg, params, customParams);
                }
            }
            else {
                window[name].HideLoadingPanel();
                jQuery('#' + name + '_LD').hide();
            }
        };
    };
    self.CustomizeDoCallback = function () {
        if (typeof window[self.PivotId].__DoCallback === 'function')
            return;

        window[self.PivotId].__DoCallback = window[self.PivotId].DoCallback;
        window[self.PivotId].DoCallback = function (results) {
            try {
                var matchCallbackArgs = results.match(/\/\*callback=(.+)\*\//);
                if (matchCallbackArgs && matchCallbackArgs.length) {
                    this.CallbackArgument = matchCallbackArgs[matchCallbackArgs.length - 1];
                }
                else {
                    this.CallbackArgument = null;
                }
                if (this.CallbackArgument) {
                    if (this.CallbackArgument.indexOf(':VS|') !== -1) {
                        if (!self.CachePages[this.CallbackArgument]) {
                            self.CachePages[this.CallbackArgument] = results;
                        }
                    }
                    else {
                        self.CachePages = {};
                    }
                }
                this.LastCallbackArgument = this.CallbackArgument;
                this.__DoCallback(results);
            }
            catch (ex) {
                // M4-61129: TC Pivot . Verify Pivot Display Drilldown Test Failes
                // prevent error, timing issue, __DoCallback is called after drilldowned pivot
            }
        };
    };
    self.CustomizeGetAreaLocation = function () {
        if (typeof window[self.PivotId].adjustingManager.pivotTableWrapper.__getAreaLocation === 'function')
            return;

        window[self.PivotId].adjustingManager.pivotTableWrapper.__getAreaLocation = window[self.PivotId].adjustingManager.pivotTableWrapper.getAreaLocation;
        window[self.PivotId].adjustingManager.pivotTableWrapper.getAreaLocation = function (sizeInfo, offset) {
            try {
                return this.__getAreaLocation(sizeInfo, offset);
            }
            catch (ex) {
                return {
                    index: -1,
                    offset: 0
                };
            }
        };
    };
    self.CustomizeGetScrollOffset = function () {
        if (typeof window[self.PivotId].adjustingManager.pivotTableWrapper.__getScrollOffset === 'function')
            return;

        window[self.PivotId].adjustingManager.pivotTableWrapper.__getScrollOffset = window[self.PivotId].adjustingManager.pivotTableWrapper.getScrollOffset;
        window[self.PivotId].adjustingManager.pivotTableWrapper.getScrollOffset = function (sizeInfo, scrollLocation) {
            try {
                return this.__getScrollOffset(sizeInfo, scrollLocation);
            }
            catch (ex) {
                return scrollLocation.offset;
            }
        };
    };
    self.CustomizeGetBoundingClientRect = function () {
        if (!jQuery.browser.msie || typeof HTMLElement.prototype.__getBoundingClientRect === 'function')
            return;

        HTMLElement.prototype.__getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function () {
            try {
                return this.__getBoundingClientRect.apply(this, arguments);
            }
            catch (e) {
                return {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                };
            }
        };
    };
    self.CustomizeMeasureElements = function (font) {
        if (typeof window[self.PivotId].adjustingManager.pivotTableWrapper.__measureElements === 'function')
            return;

        window[self.PivotId].adjustingManager.pivotTableWrapper.__measureElements = window[self.PivotId].adjustingManager.pivotTableWrapper.measureElements;
        window[self.PivotId].adjustingManager.pivotTableWrapper.measureElements = function (cell) {
            var sizes = this.__measureElements(cell);

            var horizontalInfo = this.opts.Horz;
            var pageOptions = horizontalInfo.PagingOptions;

            if (self.ColumnSize && self.ColumnSize.header.length && self.ColumnSize.data.length) {
                var columnsSize;
                if (horizontalInfo.VirtualPagingEnabled) {
                    self.MeasureDataColumnsSize(pageOptions, font);
                    self.SaveColumnResizing();

                    columnsSize = self.ColumnSize.data.slice(self.StartDataIndex, self.StartDataIndex + sizes.columnAreaColumnWidths.length);
                }
                else {
                    columnsSize = self.ColumnSize.data.slice();
                }

                sizes.rowTotalWidth = self.ColumnSize.header.sum();
                sizes.rowHeaderWidths = self.ColumnSize.header.slice();
                sizes.rowAreaColWidths = self.ColumnSize.header.slice();

                sizes.columnAreaColumnWidths = columnsSize.slice();
                sizes.columnCellsTotalWidth = sizes.columnAreaColumnWidths.sum();
                sizes.dataCellWidths = columnsSize.slice();
                sizes.dataCellsTotalWidth = sizes.columnCellsTotalWidth;
            }

            return sizes;
        };
    };
    self.CustomizeCollectionBase = function () {
        ASPx.CollectionBase.prototype.Get = function (key) {
            if (key === 'Menu')
                return false;

            return this.elementsMap.get(key);
        };
    };
    self.SetPivotLayout = function (sender) {
        if (sender && sender.cpLayout) {
            self.FieldSettings.SetDisplayDetails({ layout: sender.cpLayout });
            self.FieldSettings.Layout = sender.cpLayout;

            if (!self.DashBoardMode()) {
                fieldSettingsHandler.FieldSettings.SetDisplayDetails({ layout: sender.cpLayout });
                fieldSettingsHandler.FieldSettings.Layout = sender.cpLayout;
            }

            self.Models.Display.Data().display_details = self.FieldSettings.DisplayDetails;
            self.Models.Display.Data.commit();
        }
    };
    self.EnsureUpdateLayout = function () {
        // adjust layout & make sure that height is correct
        // this happens on a slow browser like IE, Firefox
        self.UpdateLayout(0, true);
    };
    self.UpdateLayout = function (delay, forceUpdate) {
        var container = self.GetContainer();

        if (!window[self.PivotId] || !container.length)
            return;

        delay = WC.Utility.ToNumber(delay);
        forceUpdate = WC.Utility.ToBoolean(forceUpdate);

        jQuery('#' + self.PivotId + '_ACCColumnArea > table').show();
        self.UpdatePivotHtml();
        self.UpdateMaxHeaderSize();

        var updateLayout = function () {
            if (self.DashBoardMode() && jQuery('#' + self.PivotId + '_PT').width() !== container.width())
                forceUpdate = true;
            var currentHeight = container.parent().height();
            container.find('.pivotAreaContainer').height(currentHeight);

            if (!self.IsPivotReady())
                return;

            if (forceUpdate || currentHeight !== window[self.PivotId].GetHeight()) {
                window[self.PivotId].SetHeight(currentHeight);
                try {
                    window[self.PivotId].AdjustControl();
                }
                catch (ex) {
                    // do nothing
                }
            }

            self.UpdatePivotHtml();
            self.CreateColumnResizable();
        };

        clearTimeout(self.UpdateLayoutChecker);
        if (delay) {
            self.UpdateLayoutChecker = setTimeout(function () {
                updateLayout();
            }, delay);
        }
        else {
            updateLayout();
        }
    };
    self.UpdateMaxHeaderSize = function () {
        self.DEFAULT_SIZES.HEADER = jQuery('#' + self.PivotId).width() / jQuery('#' + self.PivotId + '_RVSCell_SCDTable_CG > col').length / 2;
    };
    self.UpdatePivotHtml = function () {
        // set column field position
        var headerColumnTable = jQuery('#' + self.PivotId + '_ColumnArea .dxpgHeaderTable');
        var headerRowTable = jQuery('#' + self.PivotId + '_ACCRowArea .dxpgRowArea .dxpgHeaderTable');
        var headerDataTable = jQuery('#' + self.PivotId + '_DataArea .dxpgHeaderTable');
        var maxTopAreaHeight = Math.max(headerColumnTable.parent().height(), headerDataTable.parent().height());
        headerColumnTable.outerHeight(maxTopAreaHeight);
        headerRowTable.outerHeight(headerRowTable.parent().height());
        headerDataTable.outerHeight(maxTopAreaHeight);

        // hide context menu but "Reload data"
        var reloadMenuItem = jQuery('#' + self.PivotId + '_HM').find('.dx-vam:contains(Reload Data)').parents('.dxm-item:first');
        jQuery('#' + self.PivotId + '_HM li').not(reloadMenuItem).remove();

        // hide "Drop Column Fields Here"
        jQuery('#' + self.PivotId + '_ColumnArea').find('td:contains(Drop Column Fields Here)').parent().hide();
        jQuery('#' + self.PivotId + '_RowArea').find('td:contains(Drop Row Fields Here)').parent().hide();
        jQuery('#' + self.PivotId + '_DataArea').find('td:contains(Drop Data Items Here)').parent().hide();

        // column area popup
        var containerColumns = jQuery('#' + self.PivotId + '_ACCColumnArea');
        var columnsTable = containerColumns.children('table').removeAttr('style').show();
        if (!containerColumns.children('.dxpgColumnHeadersImage').length) {
            jQuery('<span class="dxpgColumnHeadersImage">Column Headers</span>').prependTo(containerColumns);
        }

        if (Modernizr.touch && !Modernizr.mouse) {
            containerColumns.off('touchstart').on('touchstart', function () {
                if (containerColumns.hasClass('dxpgColumnAreaCustomization')) {
                    columnsTable.css('max-width', containerColumns.width());
                    jQuery('#' + self.PivotId + '_ColumnArea').fadeIn(function () {
                        var areaDiff = containerColumns.width() - columnsTable.width();
                        if (areaDiff < 0) {
                            columnsTable.css('margin-left', areaDiff);
                        }

                        jQuery(document).one('touchstart.pivotcolumnsheader', function () {
                            jQuery('#' + self.PivotId + '_ColumnArea').fadeOut();
                        });
                    });
                }
            });
        }
        else {
            containerColumns.off('mouseenter').on('mouseenter', function () {
                if (containerColumns.hasClass('dxpgColumnAreaCustomization')) {
                    columnsTable.css('max-width', containerColumns.width());
                    jQuery('#' + self.PivotId + '_ColumnArea').stop()
                        .fadeIn(function () {
                            var areaDiff = containerColumns.width() - columnsTable.width();
                            if (areaDiff < 0) {
                                columnsTable.css('margin-left', areaDiff);
                            }
                        })
                        .one('mouseleave', function () {
                            jQuery('#' + self.PivotId + '_ColumnArea').stop().fadeOut();
                        });
                }
            });
        }

        containerColumns.removeClass('dxpgColumnAreaCustomization');
        if (columnsTable.width() > containerColumns.width()) {
            columnsTable.removeAttr('style');
            containerColumns.addClass('dxpgColumnAreaCustomization');
        }
        else {
            columnsTable.css('display', 'table');
        }
    };

    var isHeaderResizing = false;
    var isDataResizing = false;
    var dataTexts;
    var dataHeaderTexts;
    var additionalSize = 18;
    self.InitialGridColumnsSize = function (forceReset) {
        if (typeof forceReset === 'undefined') {
            forceReset = false;
        }
        if (forceReset) {
            self.ColumnSize = { header: [], data: [] };
        }

        if (typeof window[self.PivotId].adjustingManager === 'undefined') {
            return;
        }
        var pivotTableWrapper = window[self.PivotId].adjustingManager.pivotTableWrapper;
        var elems = pivotTableWrapper._domElements;
        var headerCount = elems.rowHeaderCells.length;
        var dataCount = pivotTableWrapper.opts.Horz.PagingOptions.TotalRowsCount;
        self.StartDataIndex = pivotTableWrapper.opts.Horz.PagingOptions.PageIndex * pivotTableWrapper.opts.Horz.PagingOptions.PageSize;
        self.StartDataIndex -= self.GetCellCoords(jQuery('#' + self.PivotId + '_' + pivotTableWrapper.opts.Horz.PagingOptions.StartPageCellId)).x;
        dataTexts = self.GetCellTextMatrix(jQuery('#' + self.PivotId + '_DCSCell_SCDTable'));
        dataHeaderTexts = self.GetCellTextMatrix(jQuery('#' + self.PivotId + '_CVSCell_SCDTable'));

        var testElementsize = jQuery('#' + self.PivotId + '_DataArea .dxpgHeaderText:first');
        var font = testElementsize.css('font-style') + ' ' + testElementsize.css('font-variant') + ' ' + testElementsize.css('font-weight')
            + ' ' + Math.ceil(parseFloat(testElementsize.css('font-size'))) + 'px ' + testElementsize.css('font-family');

        var hasColumnSize = self.ColumnSize && self.ColumnSize.header && self.ColumnSize.data;
        if (hasColumnSize
            && self.ColumnSize.header.length === headerCount
            && self.ColumnSize.data.length === dataCount) {
            self.SaveColumnResizing();
        }
        else {
            if (!self.ColumnSize) {
                self.ColumnSize = { header: [], data: [] };
            }
            if (self.ColumnSize.header.length !== headerCount) self.ColumnSize.header = [];
            if (self.ColumnSize.data.length !== dataCount) {
                self.ColumnSize.data = [];
                self.ColumnSize.data[dataCount - 1] = 0;
            }

            // header
            var headerTexts = self.GetCellTextMatrix(jQuery('#' + self.PivotId + '_RVSCell_SCDTable'));
            var getHeaderMaxWidth = function (textIndex) {
                var testHtml = [];
                jQuery.each(headerTexts, function (index, texts) {
                    if (texts[textIndex]) {
                        testHtml.push(texts[textIndex]);
                    }
                });
                return WC.Utility.MeasureText(testHtml.join('\n'), font);
            };
            for (var i = 0; i < headerCount; i++) {
                if (!self.ColumnSize.header[i]) {
                    var maxWidth = getHeaderMaxWidth(i);
                    self.ColumnSize.header[i] = Math.min(self.DEFAULT_SIZES.HEADER, Math.max(self.DEFAULT_SIZES.HEADER_MIN, maxWidth + additionalSize + (headerCount > 1 && i !== headerCount - 1 ? 20 : 0)));
                }
            }

            // data
            self.MeasureDataColumnsSize(pivotTableWrapper.opts.Horz.PagingOptions, font);

            self.SaveColumnResizing();
        }

        // override method
        self.CustomizeGetBoundingClientRect();
        self.CustomizeMeasureElements(font);
    };
    self.MeasureDataColumnsSize = function (pageOptions, font) {
        var getHeaderMaxWidth = function (textIndex) {
            var testHtml = [];
            jQuery.each(dataHeaderTexts, function (index, texts) {
                testHtml.push(texts[textIndex] || '');
            });
            jQuery.each(dataTexts, function (index, texts) {
                if (texts[textIndex]) {
                    testHtml.push(texts[textIndex]);
                }
            });
            return WC.Utility.MeasureText(testHtml.join('\n'), font);
        };
        for (var i = 0; i < pageOptions.RowsCount; i++) {
            if (!self.ColumnSize.data[self.StartDataIndex + i]) {
                var maxWidth = getHeaderMaxWidth(i);
                self.ColumnSize.data[self.StartDataIndex + i] = Math.min(self.DEFAULT_SIZES.DATA, Math.max(self.DEFAULT_SIZES.DATA_MIN, maxWidth + additionalSize));
            }
        }
    };
    self.GetColumnSize = function () {
        return self.ColumnSize;
    };
    self.SetColumnSize = function () {
        var displayDetails = WC.Utility.ParseJSON(self.Models.Display.Data().display_details);
        if (displayDetails.columns && displayDetails.columns.header && displayDetails.columns.data) {
            self.ColumnSize = displayDetails.columns;
        }
    };
    self.SaveColumnResizing = function () {
        var displayDetails = WC.Utility.ParseJSON(self.Models.Display.Data().display_details);
        if (JSON.stringify(displayDetails.columns) === JSON.stringify(self.GetColumnSize()))
            return;

        displayDetails.columns = self.GetColumnSize();
        self.Models.Display.Data().display_details = JSON.stringify(displayDetails);
        self.Models.Display.Data.commit();
        self.OnChanged(self.Models.Display.Data(), false);
    };
    self.CreateColumnResizable = function () {
        if (!self.DashBoardMode()) {
            self.CreateDataColumnResizable();
            self.CreateHeaderColumnResizable();
        }
    };
    self.CreateResizeHandler = function (container, filter) {
        var indicatorWidth = 3, resizeHandler, th;

        var createResizeHandler = function (container, th) {
            if (!resizeHandler || !resizeHandler.length || resizeHandler.length && !resizeHandler.parent().length) {
                resizeHandler = jQuery('<div class="k-resize-handle"><div class="k-resize-handle-inner"></div></div>');
                container.append(resizeHandler);
            }

            jQuery('#' + self.PivotId + '_CVSCell_SCDTable')
                .find('.k-resize-handle').not(resizeHandler).remove();

            resizeHandler.css({
                top: th.offset().top,
                left: th.offset().left + th[0].offsetWidth - indicatorWidth,
                height: th.outerHeight(),
                width: indicatorWidth * 3
            })
                .data('th', th)
                .show();

            return resizeHandler;
        };

        if (!container.children('.k-resize-handle').length) {
            if (Modernizr.touch && !Modernizr.mouse) {
                self.GetContainer().find('.pivotAreaContainer').addClass('k-grid-mobile');
                new kendo.UserEvents(container, {   //NOSONAR
                    filter: filter,
                    threshold: 10,
                    hold: function (e) {
                        th = jQuery(e.target);

                        e.preventDefault();

                        th.addClass('k-column-active');
                        createResizeHandler(container, th);

                        jQuery(document).off('click.pivotResizeHandler').on('click.pivotResizeHandler', function () {
                            jQuery(document).off('click.pivotResizeHandler');

                            self.HideResizeHandler(resizeHandler);
                        });
                    }
                });
            }
            else {
                self.GetContainer().find('.pivotAreaContainer').removeClass('k-grid-mobile');
                container.off('mousemove', filter)
                    .on('mousemove', filter, function (e) {
                        th = jQuery(this);

                        var winScrollLeft = container.children().scrollLeft(),
                            position = th.offset().left + this.offsetWidth;

                        if (e.clientX + winScrollLeft > position - indicatorWidth && e.clientX + winScrollLeft < position + indicatorWidth) {
                            createResizeHandler(container, th);
                        }
                        else if (resizeHandler) {
                            self.HideResizeHandler(resizeHandler);
                        }
                    });
            }
        }

        return createResizeHandler;
    };
    self.HideResizeHandler = function (resizeHandle) {
        if (resizeHandle.data('th')) {
            resizeHandle.data('th').removeClass('k-column-active');
        }
        resizeHandle.hide();
    };
    self.CreateHeaderColumnResizable = function () {
        // create handle
        var container = jQuery('#' + self.PivotId + '_PTCDiv').css('position', 'relative'),
            filter = '.dxpgRowArea',
            resizeHandle,
            headerCount = 0,
            minColumnSize = 60,
            headerAreaSize, maxHeaderAreaSize, maxHeaderColumnSize, th,
            maxPivotSize,
            scrollElement, scrollPosition;

        if (container.data('kendoResizable'))
            return;

        self.CreateResizeHandler(container, filter);

        // initial resizable
        container.kendoResizable({
            handle: '.k-resize-handle',
            hint: function () {
                return jQuery('<div class="k-resize-indicator" />').hide();
            },
            start: function () {
                resizeHandle = container.children('.k-resize-handle');
                if (resizeHandle.length && !isHeaderResizing && !isDataResizing) {
                    isHeaderResizing = true;

                    jQuery('#' + self.PivotId + '_MT')
                        .removeClass('resizeHeader')
                        .addClass('resizeData');

                    th = resizeHandle.data('th');

                    if (Modernizr.touch && !Modernizr.mouse) {
                        self.HideResizeHandler(resizeHandle);
                    }

                    headerCount = jQuery('#' + self.PivotId + '_RVSCell_SCDTable_CG > col').length;
                    headerAreaSize = jQuery('#' + self.PivotId + '_RVSCell_SCDTable').width();

                    scrollElement = jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv');
                    scrollPosition = scrollElement.scrollLeft() || 0;

                    maxPivotSize = jQuery('#' + self.PivotId + '_MTD').width();
                    maxHeaderAreaSize = maxPivotSize - minColumnSize;
                    maxHeaderColumnSize = maxHeaderAreaSize / jQuery('#' + self.PivotId + '_RVSCell_SCDTable_CG > col').length;

                    var colIndex = th.index(),
                        col = jQuery('#' + self.PivotId + '_PT > colgroup, #' + self.PivotId + '_RVSCell_SCDTable_CG').find('col:eq(' + colIndex + ')');

                    resizeHandle.data('width', col.width());
                    resizeHandle.data('col', col);
                    resizeHandle.data('colIndex', colIndex);
                }
            },
            resize: function (e) {
                if (isHeaderResizing) {
                    var data = resizeHandle.data();
                    if (data.col) {
                        var size = Math.min(Math.max(data.width + (e.x.location - e.x.startLocation), minColumnSize), maxHeaderColumnSize);
                        var headerSize = Math.min(headerAreaSize + (size - data.width), maxHeaderAreaSize);

                        jQuery([
                            '#' + self.PivotId + '_RVSCell_SCSDiv',
                            '#' + self.PivotId + '_RVSCell_SCDTable'
                        ].join(',')).width(headerSize);

                        data.col.width(size);

                        jQuery('#' + self.PivotId + '_PT > colgroup > col').eq(headerCount).width(maxPivotSize - headerSize);
                        jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv').width(maxPivotSize - headerSize);
                    }
                }
            },
            resizeend: function () {
                if (isHeaderResizing) {
                    var data = resizeHandle.data();
                    isHeaderResizing = false;

                    self.HideResizeHandler(resizeHandle);

                    // set ColumnSizes
                    var newWidth = data.col.width();
                    if (self.ColumnSize.header[data.colIndex] !== newWidth) {
                        self.ColumnSize.header[data.colIndex] = newWidth;
                        self.SaveColumnResizing();
                        self.EnsureUpdateLayout();
                        scrollElement.scrollLeft(scrollPosition);
                        self.OnChanged(self.Models.Display.Data(), false);
                    }
                }

                jQuery('#' + self.PivotId + '_MT').removeClass('resizeHeader, resizeData');
            }
        });
    };
    self.CreateDataColumnResizable = function () {
        // create handle
        var container = jQuery('#' + self.PivotId + '_CVSCell_SCVPDiv').css('position', 'relative'),
            filter = '.dxpgColumnFieldValue',
            resizeHandle,
            dataAreaSize,
            minColumnSize = 30,
            th,
            lastColumn,
            scrollElement,
            scrollPosition;

        if (container.data('kendoResizable'))
            return;

        self.CreateResizeHandler(container, filter);

        // initial resizable
        container.kendoResizable({
            handle: '.k-resize-handle',
            hint: function () {
                return jQuery('<div class="k-resize-indicator" />').css('top', container.offset().top);
            },
            start: function () {
                resizeHandle = container.children('.k-resize-handle');
                if (resizeHandle.length && !isHeaderResizing && !isDataResizing) {
                    isDataResizing = true;
                    th = resizeHandle.data('th');
                    if (Modernizr.touch && !Modernizr.mouse) {
                        self.HideResizeHandler(resizeHandle);
                    }

                    jQuery('#' + self.PivotId + '_MT')
                        .removeClass('resizeHeader')
                        .addClass('resizeData');

                    var containerCols = jQuery('#' + self.PivotId + '_CVSCell_SCDTable_CG  > col');

                    dataAreaSize = jQuery('#' + self.PivotId + '_DCSCell_SCSDiv').width();

                    scrollElement = jQuery('#' + self.PivotId + '_HSBCCell_SCVPDiv');
                    scrollPosition = scrollElement.scrollLeft() || 0;

                    var colIndex = self.GetCellCoords(th).x;
                    var col = jQuery('#' + self.PivotId + '_CVSCell_SCDTable_CG, #' + self.PivotId + '_DCSCell_SCDTable_CG').find('col:eq(' + colIndex + ')');

                    resizeHandle.data('width', col.width() || self.DEFAULT_SIZES.DATA);
                    resizeHandle.data('newWidth', null);
                    resizeHandle.data('col', col);
                    resizeHandle.data('colIndex', colIndex);

                    lastColumn = jQuery('#' + self.PivotId + '_CVSCell_SCDTable_CG, #' + self.PivotId + '_DCSCell_SCDTable_CG').find('col:last');
                    if (colIndex !== containerCols.length - 1) {
                        lastColumn.data('width', lastColumn.width()).css('width', '');
                    }
                    else {
                        lastColumn = null;
                    }
                }
            },
            resize: function (e) {
                if (isDataResizing) {
                    var data = resizeHandle.data(),
                        size = Math.max(data.width + (e.x.location - e.x.startLocation), minColumnSize);

                    if (data.col) {
                        var dataSize = dataAreaSize - data.width + size;

                        if (lastColumn) {
                            jQuery([
                                '#' + self.PivotId + '_CVSCell_SCSDiv',
                                '#' + self.PivotId + '_CVSCell_SCDTable',
                                '#' + self.PivotId + '_DCSCell_SCSDiv',
                                '#' + self.PivotId + '_DCSCell_SCDTable',
                                '#' + self.PivotId + '_HSBCCell_SCSDiv'
                            ].join(',')).width(dataSize);

                            data.col.css('width', size);
                        }
                        data.newWidth = size;

                        scrollElement.scrollLeft(scrollPosition);
                    }
                }
            },
            resizeend: function () {
                if (isDataResizing) {
                    var data = resizeHandle.data();
                    isDataResizing = false;

                    self.HideResizeHandler(resizeHandle);

                    // set ColumnSizes
                    if (lastColumn) {
                        lastColumn.width(lastColumn.data('width'));
                    }
                    if (self.ColumnSize.data[self.StartDataIndex + data.colIndex] !== data.newWidth) {
                        self.ColumnSize.data[self.StartDataIndex + data.colIndex] = data.newWidth;
                        self.SaveColumnResizing();
                        self.EnsureUpdateLayout();
                        scrollElement.scrollLeft(scrollPosition);
                    }
                }

                jQuery('#' + self.PivotId + '_MT').removeClass('resizeHeader resizeData');
            }
        });
    };
    self.GetCellCoords = function (th, countColSpan) {
        if (typeof countColSpan === 'undefined')
            countColSpan = true;
        th = jQuery(th);

        var result = {};
        result.y = th.parent('tr').prevAll('tr').length;

        var rows = th.parent('tr').parent().children('tr');
        var matrix = [];

        result.x = null;
        for (var i = 0; i < rows.length && result.x === null; i++) {
            matrix[i] = WC.Utility.ToArray(matrix[i]);
            var row = rows[i];
            var cells = jQuery(row).children('td,th');

            for (var j = 0; j < cells.length && result.x === null; j++) {
                var cell = jQuery(cells[j]);
                var colspan = parseInt(cell.attr('colspan'), 10) || 1;
                var rowspan = parseInt(cell.attr('rowspan'), 10) || 1;

                var rowIndex = row.rowIndex;
                matrix[rowIndex] = WC.Utility.ToArray(matrix[rowIndex]);

                var colIndex = null;
                for (var k = 0; k <= matrix[rowIndex].length && colIndex === null; k++) {
                    if (!matrix[rowIndex][k])
                        colIndex = k;
                }

                // Short circuit if possible.
                if (cell[0] === th[0]) {
                    if (countColSpan) {
                        result.x = colIndex + colspan - 1;
                    }
                    else {
                        result.x = colIndex;
                    }
                    break;
                }

                for (var l = rowIndex; l < rowIndex + rowspan; l++) {
                    for (var m = colIndex; m < colIndex + colspan; m++) {
                        matrix[l] = WC.Utility.ToArray(matrix[l]);
                        matrix[l][m] = 1;
                    }
                }
            }
        }

        return result;
    };
    self.GetCellTextMatrix = function (table) {
        var matrix = [];
        var matrixText = [];
        var i, j, k, l;
        var rows = table.find('tr');
        var colIndex = null;

        for (i = 0; i < rows.length; i++) {
            matrix[i] = WC.Utility.ToArray(matrix[i]);
            matrixText[i] = WC.Utility.ToArray(matrixText[i]);
            var row = rows[i];
            var cells = jQuery(row).children('td,th');

            for (j = 0; j < cells.length; j++) {
                var cell = jQuery(cells[j]);
                var colspan = parseInt(cell.attr('colspan'), 10) || 1;
                var rowspan = parseInt(cell.attr('rowspan'), 10) || 1;

                var rowIndex = row.rowIndex;
                matrix[rowIndex] = WC.Utility.ToArray(matrix[rowIndex]);
                matrixText[rowIndex] = WC.Utility.ToArray(matrixText[rowIndex]);

                for (l = 0; l <= matrix[rowIndex].length; l++) {
                    if (!matrix[rowIndex][l])
                        colIndex = l;
                }

                for (k = rowIndex; k < rowIndex + rowspan; k++) {
                    for (l = colIndex; l < colIndex + colspan; l++) {
                        matrix[k] = WC.Utility.ToArray(matrix[k]);
                        matrixText[k] = WC.Utility.ToArray(matrixText[k]);
                        matrix[k][l] = 1;
                        if (cell.hasClass('dxpgRowTotalFieldValue')) {
                            matrixText[k][l] = '';
                        }
                        else {

                            // this is a text in cell
                            matrixText[k][l] = $.trim(cell.text());

                            // add more space for collaped / expand button
                            if (cell.find('.dxpgCollapsedButton').length) {
                                matrixText[k][l] += '___';
                            }

                            // M4-33093 add more space for domain icon
                            if (cell.find('.domainIcon').length) {
                                matrixText[k][l] += '___';
                            }

                        }
                    }
                }
            }
        }
        return matrixText;
    };

    self.GetPivotDisplayDetails = function () {
        var existingDisplayDetailsObject = WC.Utility.ParseJSON(self.Models.Display.Data().display_details);
        var pivotLayout;

        if (self.IsUnSavePivot && self.FieldSettings) {
            // if not saved pivot get layout from field settting
            pivotLayout = self.FieldSettings.Layout;
        }
        else {
            pivotLayout = existingDisplayDetailsObject.layout;
        }

        if (pivotLayout) {
            existingDisplayDetailsObject.layout = pivotLayout;
        }
        else {
            delete existingDisplayDetailsObject.layout;
        }

        return existingDisplayDetailsObject;
    };
}
