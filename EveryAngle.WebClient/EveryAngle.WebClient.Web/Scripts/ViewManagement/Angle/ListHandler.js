var listHandler = new ListHandler();

function ListHandler(elementId, container) {
    "use strict";

    var self = this;
    var _self = {};
    /*BOF: Model Properties*/
    _self.CheckScrollingTimeout;

    self.UpdateLayoutChecker = null;
    self.AddColumnIndex = null;
    self.ActiveColumnList = [];
    self.ColumnInfo = {};
    self.ColumnDefinitions = {};
    self.FirstColumnWidth = 45;
    self.DefaultColumnWidth = 120;
    self.ReadOnly = ko.observable(false);
    self.DashBoardMode = ko.observable(false);
    self.Models = {
        Angle: angleInfoModel,
        Display: displayModel,
        DisplayQueryBlock: displayQueryBlockModel,
        Result: resultModel
    };
    self.Container = typeof container === 'undefined' ? '#AngleTableWrapper' : container;
    self.ElementId = typeof elementId === 'undefined' ? '#AngleGrid' : elementId;
    self.ModelId = 'list_' + self.ElementId.substr(1);
    window[self.ModelId] = self;
    self.SelectingRowId = null;
    self.HandlerValidation = {
        Valid: true,
        Angle: validationHandler.GetAngleValidation(null),
        Display: validationHandler.GetDisplayValidation(null)
    };

    // template
    self.ListViewTemplates = {
        CellHeader: [
            '<div class="angleListHeader #ClassSAP# #ClassCustom#" title="#HoverName#">',
                '<div class="handler" onclick=\"window[\'' + self.ModelId + '\'].ShowHeaderPopup(\'#FieldId#\')"></div>',
                '<div class="icon"><img alt="" src="#Icon#" height="16" width="16" /></div>',
                '<div class="property">',
                    '<span class="propertyName">#Source#</span>',
                    '<span class="propertyDescription">#Name#</span>',
                    '<span class="propertyItem">#Info#</span>',
                '</div>',
                '<div class="angleListSort">',
                    '<span class="sortOrderIndex #SortIndex#">#SortIndex#</span>',
                    '<span class="sortOrder #SortOrder#"></span>',
                '</div>',
            '</div>'
        ].join(''),
        AddColumnButton: '<a id="AddNewColumn" class="btnAddField" OnClick=\"window[\'' + self.ModelId + '\'].ShowAddColumnsPopup();\"></a>',
        HeaderPopup: [
            '<div class="k-window-custom k-window-titleless HeaderPopup HeaderPopupList" id="#PopupHeaderID#" alt="#FieldId#">',
                '<div class="k-content k-window-content">',
                    '<div class="propertyFunction">',
                        '<a class="sortAsc#CanSort#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupSortAscending + '</a>',
                        '<a class="sortDesc#CanSort#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupSortDecending + '</a>',
                        '<a class="sortCustom#CanSort#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupCustomSort + '</a>',
                    '</div>',
                    '<div class="propertyFunction">',
                        '<a class="createPivot#CanCreateDisplay#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\');">' + Localization.ListHeaderPopupCreatePivot + '</a>',
                        '<a class="createChart#CanCreateDisplay#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\');">' + Localization.ListHeaderPopupCreateChart + '</a>',
                    '</div>',
                    '<div class="propertyFunction">',
                        '<a class="fieldFormat#CanFormat#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupFormatFields + '</a>',
                    '</div>',
                    '<div class="propertyFunction">',
                        '<a class="addColumn#CanAddRemoveColumn#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\');">' + Localization.ListHeaderPopupInsertColumn + '</a>',
                        '<a class="removeColumn#CanAddRemoveColumn#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupRemoveColumn + '</a>',
                    '</div>',
                    '<div class="propertyFunction">',
                        '<a class="addFilter#CanAddFilter#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupAddFilter + '</a>',
                    '</div>',
                    '<div class="propertyFunction">',
                        '<a class="fieldInfo#CanViewInfo#" onclick="window[\'' + self.ModelId + '\'].HeaderPopupAction(this, \'#FieldId#\')">' + Localization.ListHeaderPopupFieldInfo + '</a>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')
    };
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.GetGridObject = function () {
        return jQuery(self.ElementId).data(enumHandlers.KENDOUITYPE.GRID);
    };
    self.GetListDisplay = function (scrollPosition, selectingRowId) {
        self.CheckUpgradeDisplay()
            .done(function () {
                // initial before render
                self.BeforeRender(selectingRowId);

                // validation
                self.UpdateValidation();

                // set scroll settings
                var scrollSettings = self.GetGridScrollSettings(scrollPosition);

                // create container
                self.PrepareGridContainer();

                // save scroll settings
                self.SetGridScrollSettingsData(scrollSettings);

                // create grid
                var grid = self.CreateGrid(scrollSettings);

                // apply grid
                self.ApplyGridDataSource(grid, scrollSettings.top, scrollSettings.row_height);

                self.InitialContextMenu(grid);

                self.InitialGridScrollPosition(grid);

                self.InitialHeaderPopup(grid);

                self.UpdateLayout(0);

                self.InitialGridRowSelection(grid);

                self.InitialGridCellTooltip();

                self.InitialGridColumnAutoFit(grid);

                self.InitialGridColumnMoveable(grid);

                self.InitialGridColumnResizable(grid);

                self.InitialMouseScrollable(grid);

                self.InitialAllowToHighlightCell(grid);
            });
    };
    self.CheckUpgradeDisplay = function () {
        var currentDisplay = self.Models.Display.Data();
        var sourceDisplay = self.DashBoardMode() ? currentDisplay : historyModel.Get(currentDisplay.uri, false);
        var upgradeData = displayUpgradeHandler.GetUpgradeDisplayData(currentDisplay, sourceDisplay);
        return displayUpgradeHandler.UpgradeDisplay(self, currentDisplay.uri, upgradeData);
    };
    self.BeforeRender = function (selectingRowId) {
        if (!self.DashBoardMode()) {
            // prevent error when cancelling
            if (self.Models.Result.Data().is_aggregated && self.Models.Display.Data().results) {
                self.Models.Result.LoadSuccess(ko.toJS(self.Models.Display.Data().results));
            }

            if (anglePageHandler.HandlerFind) {
                anglePageHandler.HandlerFind.ClosePopup();
                anglePageHandler.HandlerFind.ClearSearchSetting();
            }

            listSortHandler.SetQuerySteps(ko.toJS(self.Models.DisplayQueryBlock.GetSortingQueryStep()));
        }

        self.SelectingRowId = typeof selectingRowId === 'undefined' ? null : selectingRowId;
    };
    self.UpdateValidation = function () {
        self.HandlerValidation.Angle = validationHandler.GetAngleValidation(self.Models.Angle.Data());
        self.HandlerValidation.Display = validationHandler.GetDisplayValidation(self.Models.Display.Data(), self.Models.Angle.Data().model);
        self.HandlerValidation.Valid = self.HandlerValidation.Angle.Valid && self.HandlerValidation.Valid;
    };
    self.GetGridScrollSettings = function (scrollPosition) {
        var gridElement = jQuery(self.ElementId);
        var scrollSettings = {
            left: 0,
            top: 0,
            enable: false,
            row_height: self.GetGridRowHeight(gridElement)
        };
        if (scrollPosition === true) {
            scrollSettings.left = gridElement.find('.k-virtual-scrollable-wrap').scrollLeft();
            scrollSettings.top = gridElement.find('.k-scrollbar-vertical').scrollTop();
        }
        else if (typeof scrollPosition === 'object') {
            jQuery.extend(scrollSettings, scrollPosition);
        }
        return scrollSettings;
    };
    self.GetGridScrollSettingsData = function () {
        var scrollData = { left: 0, top: null, enable: true, row_height: 26 };
        jQuery.extend(scrollData, jQuery(self.ElementId).data('scrollSettings'));
        return scrollData;
    };
    self.SetGridScrollSettingsData = function (scrollSettings) {
        jQuery(self.ElementId).data('scrollSettings', scrollSettings);
    };
    self.GetGridRowHeight = function (gridElement) {
        var rowHeight = gridElement.find('.k-grid-content tr:first').height();
        if (!rowHeight)
            rowHeight = 26;
        return rowHeight;
    };
    self.PrepareGridContainer = function () {
        var container = jQuery(self.Container);
        var header = container.find('.widgetDisplayHeader');
        if (header.length) {
            header = header.clone(true);
        }
        container.empty()
            .append(header)
            .append('<div id="' + self.ElementId.substr(1) + '" class="grid widgetDisplay" />');
        if (self.ReadOnly()) {
            jQuery(self.ElementId).addClass('readOnlyMode');
        }
        return container;
    };
    self.CreateGrid = function () {
        self.ColumnDefinitions = self.GetColumnDefinitions();
        return jQuery(self.ElementId)
            .kendoGrid(self.GetGridOptions(self.ColumnDefinitions))
            .data(enumHandlers.KENDOUITYPE.GRID);
    };
    self.GetQueryFieldUrl = function () {
        return self.Models.Result.Data().query_fields ? self.Models.Result.Data().query_fields : fieldsChooserModel.GetQueryFilterUri(1).url;
    };
    self.GetColumnDefinitionField = function (fieldId, useModelField) {
        var columnDefinition = modelInstanceFieldsHandler.GetFieldById(fieldId, self.GetQueryFieldUrl());
        if (!columnDefinition && useModelField) {
            columnDefinition = modelFieldsHandler.GetFieldById(fieldId, self.Models.Angle.Data().model);
        }

        return ko.toJS(columnDefinition);
    };
    self.GetColumnDefinitions = function () {
        var columnDefinitions = {};
        jQuery.each(self.Models.Display.Data().fields, function (index, field) {
            var columnDefinition = self.GetColumnDefinitionField(field.field, true);

            // check if valid field push if not push default protect error
            if (columnDefinition && field.valid !== false && field.denied !== enumHandlers.DENYTYPE.DENY.Value) {
                columnDefinition.valid = true;
                columnDefinitions[field.field.toLowerCase()] = columnDefinition;
            }
            else {
                if (!columnDefinition) {
                    columnDefinition = {
                        id: field.field,
                        short_name: field.field,
                        long_name: field.field
                    };
                }
                columnDefinitions[field.field.toLowerCase()] = {
                    category: '',
                    fieldtype: enumHandlers.FIELDTYPE.TEXT,
                    helpid: '',
                    helptext: '',
                    id: field.field,
                    is_starred: false,
                    is_suggested: false,
                    long_name: columnDefinition.long_name || field.field,
                    short_name: columnDefinition.short_name || field.field,
                    uri: '',
                    valid: false,
                    denied: field.denied
                };
            }
        });
        return columnDefinitions;
    };
    self.GetGridOptions = function (columnDefinitions) {
        return {
            dataSource: self.GetGridDataSource(),
            autoBind: false,
            resizable: true,
            navigatable: false,
            height: self.GetGridHeight(),
            columns: self.GetTemplate(columnDefinitions),
            reorderable: !self.ReadOnly(),
            columnResize: self.OnColumnResize,
            columnReorder: self.OnColumnReorder,
            dataBinding: self.OnDataBinding,
            dataBound: self.OnDataBound,
            scrollable: {
                virtual: true
            },
            pageable: false,
            selectable: 'cell'
        };
    };
    self.GetGridHeight = function () {
        var container = jQuery(self.Container);
        var header = container.find('.widgetDisplayHeader');
        var headerSize = 0;
        if (header.length) {
            headerSize = header.height() + WC.Window.ScrollBarWidth;
        }
        return container.height() - headerSize;
    };
    self.GetGridDataSource = function () {
        var fieldsList = self.Models.Display.GetSpecificColumnString(self.Models.Display.Data().fields);
        var defaultPageSize = self.GetDefaultPageSize();
        var dataSourceTmp = {};
        var requestObject = {};
        return new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    /* M4-8817: After POST /results fail still show angle/display details => added resultModel.Data().successfully_completed criteria */
                    if (self.HandlerValidation.Angle.CanPostResult && self.HandlerValidation.Display.CanPostResult
                        && self.Models.Angle.ModelServerAvailable && self.Models.Result.Data().successfully_completed) {
                        var page = options.data.page;
                        var requestUrl = self.Models.Result.Data().data_rows;
                        var query = {};
                        query[enumHandlers.PARAMETERS.OFFSET] = options.data.skip;
                        query[enumHandlers.PARAMETERS.LIMIT] = options.data.take;
                        query['fields'] = fieldsList;

                        if (requestObject.readyState !== 4 && requestObject.abort) {
                            requestObject.abort();
                        }

                        if (dataSourceTmp[page]) {
                            options.success(dataSourceTmp[page]);
                            return;
                        }

                        var gridElement = jQuery(self.ElementId);
                        requestObject = GetDataFromWebService(requestUrl, query)
                            .done(function (result) {
                                if (!jQuery.isEmptyObject(result)) {
                                    var dataRows = self.GetDataRows(result.fields, result.rows);

                                    dataSourceTmp[page] = { total: result.header.total, data: dataRows };
                                    options.success(dataSourceTmp[page]);
                                }
                                else {
                                    gridElement.parent().busyIndicator(false)
                                        .find('.k-grid-content').busyIndicator(false);

                                    popup.Alert(Localization.Alert_Title, Localization.Info_ListEmptyResult);
                                }
                            })
                            .fail(function (xhr) {
                                gridElement.parent().busyIndicator(false)
                                    .find('.k-grid-content').busyIndicator(false);

                                if (self.DashBoardMode()) {
                                    var message = errorHandlerModel.GetAreaErrorMessage(xhr ? xhr.responseText : 'Error');
                                    errorHandlerModel.ShowAreaError(gridElement.find('.k-virtual-scrollable-wrap'), message, function () {
                                        gridElement.parent().busyIndicator(true);
                                        self.Models.Result.Execute();
                                    });
                                }
                                else {
                                    self.Models.Result.SetRetryPostResultToErrorPopup(xhr.status);
                                }
                            })
                            .always(function () {
                                measurePerformance.SetEndTime();
                            });
                    }
                    else {
                        measurePerformance.SetEndTime();
                        options.success({ total: 0, data: [] });
                    }
                }
            },
            schema: {
                total: 'total',
                data: 'data'
            },
            pageSize: defaultPageSize,
            serverPaging: true
        });
    };
    self.ApplyGridDataSource = function (grid, scrollTop, rowHeight) {
        var page = self.GetDefaultPage(grid.dataSource.pageSize(), scrollTop, rowHeight);
        grid.dataSource.page(page);

        // prefetch next page
        if (page === 1) {
            grid.dataSource.prefetch(grid.dataSource.skip() + grid.dataSource.take(), grid.dataSource.take());
        }
    };
    self.GetDefaultPage = function (pageSize, scrollTop, rowHeight) {
        return scrollTop ? Math.max(1, Math.ceil(scrollTop / pageSize / rowHeight)) : 1;
    };
    self.GetDefaultPageSize = function () {
        var isFullMode = jQuery('#ToggleWrapper').hasClass("fullDetail");
        var containerHeight = jQuery(self.Container).height();
        if (isFullMode && !self.DashBoardMode()) {
            containerHeight = jQuery('#ToggleWrapper').height() + containerHeight;
        }
        return Math.min(Math.max(systemSettingHandler.GetDefaultPageSize(), Math.ceil(containerHeight / 26)), systemSettingHandler.GetMaxPageSize());
    };
    self.AfterRender = function (grid) {
        jQuery('#ToggleWrapper').show();

        grid.wrapper.find('.k-grid-header-wrap th').removeClass('last')
            .filter(':last-child').addClass('last');
        grid.tbody.find('tr td').removeClass('last')
            .filter(':last-child').addClass('last');

        var headerWrapper = grid.element.find('.k-grid-header-wrap');
        headerWrapper.width(headerWrapper.width() + 1);

        // set active column
        self.SetActiveColumn(true);
    };
    self.OnColumnResize = function (e) {
        e.sender.resize(true);

        if (!self.ReadOnly()) {
            self.HandleAngleColumnWidth(e);
        }
        self.AfterRender(e.sender);

        if (!self.DashBoardMode() && e.column.field !== enumHandlers.GENERAL.ROWID) {
            historyModel.Save();
        }

        setTimeout(function () {
            self.UpdateAngleGridHeaderPopup();
            self.AfterRender(e.sender);
        }, 50);
    };
    self.OnColumnReorder = function (e) {
        // remember columns position
        e.oldIndex--;
        e.newIndex--;
        var currentField = self.Models.Display.Data().fields.splice(e.oldIndex, 1);
        self.Models.Display.Data().fields.splice(e.newIndex, 0, currentField[0]);
        self.Models.Display.Data.commit();

        historyModel.Save();

        setTimeout(function () {
            self.UpdateAngleGridHeaderPopup();
            self.AfterRender(e.sender);
        }, 50);
    };
    self.OnDataBinding = function (e) {
        e.sender._canDragToRemove = false;
    };
    self.OnDataBound = function (e) {
        e.sender._canDragToRemove = false;
        self.HideContextMenu();

        var items = e.sender.items();
        jQuery.each(e.sender.dataItems(), function (index, item) {
            jQuery(items[index]).attr('data-rowid', item.row_id).removeClass('k-row-selected');
        });

        if (self.SelectingRowId) {
            e.sender.element.find('[data-rowid="' + self.SelectingRowId + '"]').addClass('k-row-selected');
        }

        var scrollSettings = self.GetGridScrollSettingsData();
        var horizontalScroll = e.sender.element.find('.k-virtual-scrollable-wrap');
        horizontalScroll.scrollLeft(scrollSettings.left);

        self.AfterRender(e.sender);

        var verticalScroll = e.sender.virtualScrollable;
        clearTimeout(_self.CheckScrollingTimeout);
        _self.CheckScrollingTimeout = setTimeout(function () {
            // fixed virtual scrollbar bug
            if (!self.IsGridScrollToCorrectPosition(verticalScroll)) {
                verticalScroll.verticalScrollbar.trigger('scroll');
            }

            scrollSettings = self.GetGridScrollSettingsData();

            // scroll left
            horizontalScroll.scrollLeft(scrollSettings.left);

            // scroll top
            if (typeof scrollSettings.top === 'number') {
                verticalScroll.verticalScrollbar.scrollTop(scrollSettings.top);
            }

            if (!scrollSettings.enable) {
                scrollSettings.enable = true;
                self.SetGridScrollSettingsData(scrollSettings);
            }

            e.sender._canDragToRemove = e.sender.columns.length > 2;
        }, 500);
    };
    self.IsGridScrollToCorrectPosition = function (verticalScroll) {
        if (verticalScroll) {
            var lastItem = Math.floor(((verticalScroll._scrollbarTop || 0) + verticalScroll.verticalScrollbar.height()) / verticalScroll.itemHeight);
            var dataItems = verticalScroll.dataSource.data();
            var lastDataItem = dataItems[Math.min(verticalScroll.dataSource.take(), dataItems.length) - 1];
            var result = lastDataItem && (lastItem < lastDataItem[enumHandlers.GENERAL.ROWID] - 5 || lastItem > lastDataItem[enumHandlers.GENERAL.ROWID] + 5);
            return !result;
        }

        return true;
    };
    self.InitialGridRowSelection = function (grid) {
        grid.element.on('click', 'td.Number', function (e) {
            var row = jQuery(e.currentTarget).parents('tr:first'),
                rowid = row.data('rowid');

            if (!row.hasClass('k-row-selected')) {
                self.SelectingRowId = rowid;
                grid.element.find('tr').removeClass('k-row-selected');
                row.addClass('k-row-selected');
                grid.content.find('[data-rowid="' + rowid + '"]').addClass('k-row-selected');

            }
            else {
                self.SelectingRowId = null;
                grid.element.find('tr').removeClass('k-row-selected');
            }
            grid.refresh();
        });
    };
    self.InitialGridCellTooltip = function () {
        WC.HtmlHelper.Tooltip.Create('list', '.widgetDisplay td');
    };
    self.InitialGridColumnAutoFit = function (grid) {
        if (grid.options.resizable) {
            // disable kendo autofit
            grid._autoFitLeafColumn = jQuery.noop;

            // column auto-resizing
            grid.element.find('.k-grid-header').on('dblclick', '.k-resize-handle', function (e) {
                self.AutoFitGridColumn(grid, jQuery(e.target));
            });

            // remove resizable from 1st column
            grid.element.find('.k-grid-header-locked').data('kendoResizable').bind('start', function (e) {
                var target = jQuery(e.currentTarget).data('th');
                if (target && target.data('field') === enumHandlers.GENERAL.ROWID) {
                    grid.element.find('.k-grid-resize-indicator').remove();
                    setTimeout(function () {
                        jQuery('body').css('cursor', '');
                    }, 1);
                    e.preventDefault();
                }
            });
        }
    };
    self.InitialGridColumnMoveable = function (grid) {
        if (grid.options.reorderable) {
            // remove reordering from 1st column
            grid.wrapper.find('.k-grid-header .k-header:first').kendoDraggable({ drag: jQuery.noop });

            if (self.Models.Result.Data().authorizations.change_field_collection) {
                // create drop to remove column
                var reorderable = grid.element.data('kendoReorderable'),
                    fnCheckCanDragToRemove,
                    fnCheckDragHold,
                    scrollSpeed = 30,
                    gridBoundary = { areaLeft: 0, areaRight: 0, scrollLeft: 0, scrollRight: 0 };
                reorderable.draggable
                    .bind('dragstart', function (e) {
                        if (jQuery.trim(e.sender.hint.text()) === enumHandlers.GENERAL.ROWID) {
                            e.sender.hint.addClass('alwaysHide');
                        }
                        else {
                            // M4-33186: Position of arrow when moving field is incorrect
                            // - use html from the column header
                            e.sender.hint.html(e.sender.currentTarget.html());

                            var hintLeftPartSize = e.x.location - e.sender.hint.offset().left;
                            var gridOffsetLeft = grid.wrapper.offset().left;

                            gridBoundary.areaLeft = gridOffsetLeft + 50 + hintLeftPartSize;
                            gridBoundary.areaRight = gridOffsetLeft + grid.wrapper.width() - WC.Window.ScrollBarWidth - 50;
                            gridBoundary.scrollLeft = 0;
                            gridBoundary.scrollRight = grid.virtualScrollable.content.width();

                            clearInterval(fnCheckCanDragToRemove);
                            fnCheckCanDragToRemove = setInterval(function () {
                                if (jQuery.active <= 0 && grid._canDragToRemove) {
                                    clearInterval(fnCheckCanDragToRemove);

                                    jQuery('.listRemoveColumnArea').remove();
                                    var dropArea = jQuery('<div id="listRemoveColumnArea" class="listRemoveColumnArea" />');
                                    var css = { width: WC.Window.Width };
                                    dropArea.html('<div class="listRemoveColumnAreaInner">' + Captions.Drop_Here_To_Remove_This_Column + '</div>');
                                    if (jQuery('#AngleField').is(':visible')) {
                                        css.top = 0;
                                        css.height = grid.element.offset().top;
                                    }
                                    else {
                                        css.top = grid.content.offset().top;
                                        css.height = WC.Window.Height - css.top;
                                    }
                                    dropArea.data({ y1: css.top, y2: css.top + css.height }).css(css)
                                        .children().css(css).end()
                                        .appendTo('body');
                                }
                            }, 100);
                        }
                    })
                    .bind('drag', function (e) {
                        clearInterval(fnCheckDragHold);
                        fnCheckDragHold = setInterval(function () {
                            var scrollLeft = grid.virtualScrollable.wrapper.scrollLeft();
                            if (e.x.location >= gridBoundary.areaRight && scrollLeft < gridBoundary.scrollRight) {
                                // move right
                                grid.virtualScrollable.wrapper.scrollLeft(scrollLeft + scrollSpeed);
                            }
                            else if (e.x.location <= gridBoundary.areaLeft && scrollLeft > gridBoundary.scrollLeft) {
                                // move left
                                grid.virtualScrollable.wrapper.scrollLeft(scrollLeft - scrollSpeed);
                            }
                        }, 50);

                        var dropArea = jQuery('#listRemoveColumnArea');
                        if (dropArea.length) {
                            var area = dropArea.data();
                            if (e.y.location >= area.y1 && e.y.location <= area.y2) {
                                e.sender.hint.addClass('removable');
                            }
                            else {
                                e.sender.hint.removeClass('removable');
                            }
                        }
                    })
                    .bind('dragend', function (e) {
                        clearInterval(fnCheckDragHold);
                        clearInterval(fnCheckCanDragToRemove);

                        var dropArea = jQuery('#listRemoveColumnArea');
                        if (dropArea.length) {
                            var area = dropArea.data();
                            if (e.y.location >= area.y1 && e.y.location <= area.y2) {
                                e.sender.hint.hide();
                                self.RemoveColumn(e.sender.currentTarget.data('field'));
                            }
                        }

                        grid._canDragToRemove = grid.columns.length > 2;
                        jQuery('.listRemoveColumnArea').remove();
                    });
            }
        }
    };
    self.InitialGridColumnResizable = function (grid) {
        if (grid.options.resizable) {
            // auto scroll on resizing column
            var fnCheckDragHold;
            var scrollSpeed = 10;
            var resizeValues = { areaRight: 0, scrollRight: 0 };
            grid.resizable.bind('start', function (e) {
                resizeValues.areaRight = grid.wrapper.offset().left + grid.wrapper.width() - WC.Window.ScrollBarWidth - 50;
                resizeValues.scrollRight = grid.virtualScrollable.content.width();
            });
            grid.resizable.bind('resize', function (e) {
                clearInterval(fnCheckDragHold);
                fnCheckDragHold = setInterval(function () {
                    var scrollLeft = grid.virtualScrollable.wrapper.scrollLeft();
                    if (e.x.location >= resizeValues.areaRight && scrollLeft < resizeValues.scrollRight) {
                        // move right
                        e.x.location += scrollSpeed;
                        grid.resizable.trigger('resize', e);
                        grid.virtualScrollable.wrapper.scrollLeft(scrollLeft + scrollSpeed);
                    }
                }, 50);
            });
            grid.resizable.bind('resizeend', function (e) {
                clearInterval(fnCheckDragHold);
            });
        }
    };
    self.InitialMouseScrollable = function (grid) {

        // make grid continue while user is scrolling
        var virtualScroll = grid.content.data('kendoVirtualScrollable');
        grid.content
            .off('mousewheel', '.k-loading-mask')
            .on('mousewheel', '.k-loading-mask', function (e) {
                clearTimeout(_self.CheckScrollingTimeout);
                virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
            });

        // prefetching
        var prefetchChecker;
        grid.content.find('.k-virtual-scrollable-wrap')
            .on('mousewheel', function (e) {
                clearTimeout(_self.CheckScrollingTimeout);
                if (grid.dataSource.total() / grid.dataSource.take() > 2) {
                    clearTimeout(prefetchChecker);
                    prefetchChecker = setTimeout(function () {
                        var numberItemInView = Math.floor(virtualScroll.wrapper.height() / virtualScroll.itemHeight);
                        var prefetchSkip;
                        var scrollTop = !virtualScroll.itemHeight || !virtualScroll._scrollbarTop ? 0 : virtualScroll._scrollbarTop - (e.deltaFactor * e.deltaY);
                        var currentRow = !virtualScroll.itemHeight ? 1 : Math.ceil(scrollTop / virtualScroll.itemHeight) + 1;

                        if (e.deltaY === -1) {
                            // scroll down
                            prefetchSkip = (Math.floor((currentRow + numberItemInView) / grid.dataSource.take()) + 1) * grid.dataSource.take();
                        }
                        else {
                            // scroll up
                            prefetchSkip = (Math.ceil(currentRow / grid.dataSource.take()) - 1) * grid.dataSource.take();
                        }

                        prefetchSkip = Math.max(0, prefetchSkip);
                        grid.dataSource.prefetch(prefetchSkip, grid.dataSource.take());

                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                    }, 10);
                }
            });
    };
    self.AutoFitGridColumn = function (grid, handler) {
        handler.hide();

        var th = handler.data('th');
        var fieldId = th.data('field');
        var field = modelFieldsHandler.GetFieldById(fieldId, self.Models.Angle.Data().model);
        var size = 10;
        var sizeHeader;
        var html = '';
        var font = WC.HtmlHelper.GetFontCss(th.find('.propertyDescription'));

        var div = jQuery('<div />', {
            css: {
                visibility: 'hidden',
                overflow: 'visible',
                position: 'absolute',
                'white-space': 'nowrap',
                left: 0,
                top: 0
            }
        }).appendTo('body');

        // header size
        var html2 = '', element;
        th.find('.property').children().each(function () {
            element = jQuery(this);
            if (element.hasClass('propertyItem')) {
                html2 += element.text() + '<br/>';
            }
            else if (element.hasClass('propertyDescription')) {
                html += self.BindName(jQuery.trim(element.text()), font) + '<br/>';
            }
            else {
                html += element.text() + '<br/>';
            }
        });
        sizeHeader = div.css('font', font).html(html).width();

        font = WC.HtmlHelper.GetFontCss(th.find('.propertyItem'));
        sizeHeader = Math.max(sizeHeader, div.css('font', font).html(html2).width()) + 38;

        // data size
        html = '';
        if (field && field.fieldtype === enumHandlers.FIELDTYPE.BOOLEAN) {
            size += 15;
        }
        else {
            var converter, dataSourceFieldId = fieldId.toLowerCase();

            if (!field) {
                converter = function (value) { return value[dataSourceFieldId]; };
            }
            else {
                converter = kendo.template(self.GetTemplateCellData(field));
            }

            jQuery.each(grid.dataSource._ranges, function (index, range) {
                jQuery.each(range.data, function (indexData, data) {
                    var text = converter.call(this, data);
                    if (text) {
                        html += converter.call(this, data) + '<br/><br/>';
                    }
                });
            });

            font = WC.HtmlHelper.GetFontCss(grid.tbody.find('td:first'));
            div.css('font', font).html(html);

            size += div.width();
        }
        div.remove();

        if (th.hasClass('last')) {
            size += 30;
        }
        jQuery.setGridWidth(grid, th.index(), Math.max(sizeHeader, size));
    };
    self.BindName = function (text, font) {
        var words = jQuery.grep(text.split(' '), function (s) { return s; }),
            wordsLength = words.length;

        if (wordsLength === 1) {
            return text;
        }
        else if (wordsLength === 2) {
            return words.join('<br />');
        }
        else {
            var distance = [], result, i, text1, text2;
            for (i = 0; i < wordsLength - 1; i++) {
                text1 = words.slice(0, i + 1).join(' ');
                text2 = words.slice(i + 1).join(' ');

                distance[i] = Math.abs(WC.Utility.MeasureText(text2, font) - WC.Utility.MeasureText(text1, font));
                if (i === 0 || distance[i] < distance[i - 1]) {
                    result = text1 + '<br />' + text2;
                }
            }

            return result;
        }
    };
    self.GetHeaderInfo = function (field, column, showTechnicalInfo, aliasName) {
        var fieldId = field.id || column.field || '';

        // source
        var fieldSource = modelFieldSourceHandler.GetFieldSourceByUri(field.source);
        var fieldSourceShortName = '';
        var fieldSourceLongName = '';
        if (fieldSource) {
            fieldSourceShortName = userFriendlyNameHandler.GetFriendlyName(fieldSource, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
            fieldSourceLongName = userFriendlyNameHandler.GetFriendlyName(fieldSource, enumHandlers.FRIENDLYNAMEMODE.LONGNAME);
        }

        // field
        var fieldShortName = userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
        var fieldLongName = userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.LONGNAME);

        // invalid info
        var invalidInfo = '';
        if (column.denied) {
            invalidInfo += '\n' + kendo.format(Localization.Info_FieldForbidden, fieldShortName);
        }
        else if (column.valid === false) {
            invalidInfo += '\n' + validationHandler.GetValidationError(column, self.Models.Angle.Data().model);
        }

        // tech_info
        var techField;
        if (self.Models.Result.Data().query_fields) {
            techField = modelInstanceFieldsHandler.GetFieldById(fieldId, self.Models.Result.Data().query_fields);
        }
        else {
            techField = modelInstanceFieldsHandler.GetFieldById(fieldId, fieldsChooserModel.GetQueryFilterUri(1).url);
        }
        var techFieldName = techField ? techField.technical_info : '';

        var titles = {
            row_tech: techFieldName
        };
        if (aliasName) {
            titles.class_name = 'custom';
            titles.row_source = (fieldSourceShortName ? fieldSourceShortName + ' - ' : '') + fieldShortName;
            titles.row_name = aliasName;

            titles.title = (fieldSourceLongName ? fieldSourceLongName + ' - ' : '') + fieldLongName;
            titles.title += '\n' + aliasName;
        }
        else {
            titles.class_name = '';
            titles.row_source = fieldSourceShortName;
            titles.row_name = fieldShortName;

            titles.title = fieldSourceLongName;
            titles.title += '\n' + fieldLongName;
        }

        if (invalidInfo)
            titles.title += invalidInfo;
        if (showTechnicalInfo && techFieldName)
            titles.title += '\n' + techFieldName;

        return titles;
    };
    self.GetTemplate = function (colunmsDefinitions) {
        // prepare first coloumn for angle grid
        var columnTemplates = [{
            field: enumHandlers.GENERAL.ROWID,
            locked: true,
            template: '#= ' + enumHandlers.GENERAL.ROWID + ' #',
            headerTemplate: self.GetIdHeaderTemplate(),
            headerAttributes: {
                'class': 'Number'
            },
            attributes: {
                'class': 'Number'
            },
            width: self.FirstColumnWidth
        }];

        // Build result column template for kendo grid
        WC.FormatHelper.ClearFormatCached();
        self.ColumnInfo = {};
        jQuery.each(colunmsDefinitions, function (fieldId, columnDefinition) {
            // Check if there is display definiton for this field
            var columnOption = self.Models.Display.GetDisplayByFieldName(columnDefinition.id, self.Models.Display.Data().fields);
            var fieldDetails = WC.Utility.ParseJSON(columnOption.field_details);

            var headerCssClass = '';
            if (columnOption.valid === false) {
                headerCssClass += 'validError ';
            }
            if (columnOption.denied) {
                jQuery.each(enumHandlers.DENYTYPE, function (key, denyType) {
                    if (denyType.Value.toLowerCase() === columnOption.denied.toLowerCase()) {
                        headerCssClass += denyType.CssClass + ' ';
                        return false;
                    }
                });
            }

            self.ColumnInfo[columnDefinition.id.toLowerCase()] = columnOption;

            // Add column detail to list
            columnTemplates.push({
                lockable: false,
                locked: false,
                field: columnDefinition.id,
                title: columnDefinition.long_name || columnDefinition.id || '',
                template: self.GetTemplateCellData(columnDefinition),
                headerTemplate: self.GetTemplateCellHeader(columnDefinition, columnOption),
                headerAttributes: {
                    'class': headerCssClass
                },
                attributes: {
                    'class': self.GetCellClasses(columnDefinition)
                },
                fieldtype: columnDefinition.fieldtype,
                width: fieldDetails.width || self.DefaultColumnWidth,
                valid: columnOption.valid !== false,
                validation_details: columnOption.validation_details
            });
        });

        return columnTemplates;
    };
    self.GetIdHeaderTemplate = function () {
        if (self.Models.Result.Data().authorizations.change_field_collection && !self.DashBoardMode()) {
            return self.ListViewTemplates.AddColumnButton;
        }
        else {
            return '';
        }
    };
    self.GetTemplateCellHeader = function (field, column) {
        var template = self.ListViewTemplates.CellHeader;
        var fieldId = field.id || column.field || '';
        var showTechnicalInfo = userSettingModel.GetByName(enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER);
        var aliasName = WC.Utility.GetDefaultMultiLangText(column.multi_lang_alias);
        var headerInfo = self.GetHeaderInfo(field, column, showTechnicalInfo, aliasName);

        template = template.replace(/#FieldId#/g, WC.Utility.ConvertFieldName(fieldId));
        template = template.replace("#Icon#", fieldCategoryHandler.GetCategoryIconByField(field).path);
        template = template.replace(/#HoverName#/g, htmlEncode(headerInfo.title));
        template = template.replace(/#ClassCustom#/g, headerInfo.class_name);
        template = template.replace(/#Source#/g, htmlEncode(headerInfo.row_source));
        template = template.replace(/#Name#/g, htmlEncode(headerInfo.row_name));

        //check in current user setting sap_fields_in_header or not
        if (showTechnicalInfo) {
            template = template.replace('#ClassSAP#', 'withSAP');
            template = template.replace(/#Info#/g, headerInfo.row_tech);
        }
        else {
            template = template.replace('#ClassSAP#', 'withoutSAP');
            template = template.replace(/#Info#/g, '');
        }

        // sorting
        var sortInfo = null;
        var isCustomSort = false;
        var sortSteps = self.Models.DisplayQueryBlock.GetSortingQueryStep();
        if (sortSteps.length) {
            isCustomSort = sortSteps[0].sorting_fields.length > 1;
            sortInfo = sortSteps[0].sorting_fields.findObject('field_id', fieldId, false);
        }
        template = template.replace(/#SortIndex#/g, sortInfo && isCustomSort ? sortInfo.sort_index : 'Hide');
        template = template.replace(/#SortOrder#/g, sortInfo ? sortInfo.sort_order : 'Hide');

        return template;
    };
    self.GetTemplateCellHeaderPopup = function (fieldId) {
        var displayField = self.Models.Display.Data().fields.findObject('field', WC.Utility.RevertFieldName(fieldId), false);
        var isDisplayFieldValid = displayField && displayField.valid && !displayField.denied;
        var field = modelFieldsHandler.GetFieldById(fieldId, self.Models.Angle.Data().model);
        var isFieldValid = field && field.id;
        var template = self.ListViewTemplates.HeaderPopup;
        var popupId;

        popupId = 'PopupHeader' + WC.Utility.ConvertFieldName(fieldId);

        template = template.replace(/#FieldId#/g, WC.Utility.ConvertFieldName(fieldId));
        template = template.replace(/#PopupHeaderID#/g, popupId);

        if (!isFieldValid || !isDisplayFieldValid) {
            template = template.replace(/#CanSort#/g, ' disabled');
            template = template.replace(/#CanAddFilter#/g, ' disabled');
            template = template.replace(/#CanCreateDisplay#/g, ' disabled');
            template = template.replace(/#CanAddRemoveColumn#/g, self.Models.Result.Data().authorizations.change_field_collection ? '' : ' disabled');
            template = template.replace(/#CanFormat#/g, ' disabled');
            template = template.replace(/#CanViewInfo#/g, isFieldValid ? '' : ' disabled');
        }
        else {
            template = template.replace(/#CanSort#/g, !self.Models.Result.Data().authorizations.sort
                                                            || self.HandlerValidation.Angle.InvalidQueryStepsAll ? ' disabled' : '');
            template = template.replace(/#CanAddFilter#/g, !self.Models.Result.Data().authorizations.add_filter
                                                            || self.HandlerValidation.Angle.InvalidQueryStepsAll ? ' disabled' : '');
            template = template.replace(/#CanCreateDisplay#/g, !self.Models.Result.Data().authorizations.change_field_collection
                                                            || self.HandlerValidation.Angle.InvalidQueryStepsAll
                                                            || (typeof anglePageHandler !== 'undefined' && anglePageHandler.IsEditMode()) ? ' disabled' : '');
            template = template.replace(/#CanAddRemoveColumn#/g, self.Models.Result.Data().authorizations.change_field_collection ? '' : ' disabled');
            template = template.replace(/#CanFormat#/g, !(self.HandlerValidation.Angle.InvalidBaseClasses
                                                            || self.HandlerValidation.Angle.InvalidFollowups
                                                            || self.HandlerValidation.Display.InvalidFieldsAll) ? '' : ' disabled');
            template = template.replace(/#CanViewInfo#/g, '');
        }

        return template;
    };
    self.GetTemplateCellData = function (field, fieldData) {
        if (typeof fieldData === 'undefined') {
            fieldData = field.id.toLowerCase();
        }

        var fieldId = field.id.toLowerCase();
        var template = "#: (data['" + fieldData + "'] || '').replace(/&nbsp;/i, ' ') #";

        switch (field.fieldtype) {
            case enumHandlers.FIELDTYPE.BOOLEAN:
                template = "#= window['" + self.ModelId + "'].GetFormatValue(null, data['" + fieldData + "']) #";
                break;
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.INTEGER:
            case enumHandlers.FIELDTYPE.NUMBER:
            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
            case enumHandlers.FIELDTYPE.PERIOD:
            case enumHandlers.FIELDTYPE.TIME:
            case enumHandlers.FIELDTYPE.TIMESPAN:
                template = "#= window['" + self.ModelId + "'].GetFormatValue('" + fieldId + "', data['" + fieldData + "']) #";
                break;
            case enumHandlers.FIELDTYPE.ENUM:
                template = "#= window['" + self.ModelId + "'].GetFormatValue('" + fieldId + "', data['" + fieldData + "'],'" + field.domain + "', false) #";
                break;
            default:
                break;
        }
        return template;
    };
    self.GetCellClasses = function (field) {
        var classes = '';
        switch (field.fieldtype) {
            case enumHandlers.FIELDTYPE.TEXT:
            case enumHandlers.FIELDTYPE.ENUM:
                classes += 'textLeft';
                break;
            case enumHandlers.FIELDTYPE.BOOLEAN:
                classes += 'textCenter';
                break;


            default:
                classes += 'textRight';
        }
        return classes;
    };
    self.GetEnumFormat = function (fieldId) {

        var fieldSetting = self.Models.Display.GetFieldSettings(jQuery.grep(self.Models.Display.Data().fields, function (field) {
            return field.field.toLowerCase() === fieldId.toLowerCase();
        })[0]);
        var userSettingDefaultEnum = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_ENUM);
        var useFormat = null;

        if (!IsNullOrEmpty(fieldSetting.format)) {
            useFormat = fieldSetting.format;
        }
        else if (!IsNullOrEmpty(userSettingDefaultEnum)) {
            useFormat = userSettingDefaultEnum;
        }

        return useFormat;
    };
    self.HandleAngleColumnWidth = function (e) {
        var currentField = self.Models.Display.Data().fields.findObject('field', e.column.field, false);

        if (currentField) {
            var fieldObject = self.Models.Display.GetFieldSettings(currentField);
            fieldObject.width = e.newWidth;

            currentField.field_details = self.Models.Display.SetFieldSettings(fieldObject);
            self.Models.Display.Data.commit();
        }
    };
    self.UpdateLayout = function (delay) {
        if (typeof delay === 'undefined') {
            delay = 0;
        }

        if (!self.DashBoardMode()) {
            jQuery('#ListDrilldownGrid,#ListDrilldownFilter').height(jQuery('#AngleTableWrapper').height());
        }

        self.UpdateAngleGridHeaderPopup();

        var updateLayout = function () {
            var container = jQuery(self.Container);
            var containerId = container.attr('id');
            var parent, height;

            if (containerId === 'widgetMaximizeWrapper' || containerId === 'AngleTableWrapper') {
                parent = container;
            }
            else {
                parent = container.parent();
            }
            height = parent.height() - (parent.find('.widgetDisplayHeader').height() || 0);

            container
                .height(parent.height())
                .find('.k-grid:visible').each(function (index, gridElement) {
                    gridElement = jQuery(gridElement);
                    gridElement.height(height);
                    gridElement.find('.k-grid-content, .k-grid-content-locked').height(height - gridElement.find('.k-grid-header').height());

                    var grid = gridElement.data(enumHandlers.KENDOUITYPE.GRID);
                    if (grid) {
                        grid.resize();
                        self.UpdateCustomHeaderBarSize(grid);
                    }
                });
        };

        clearTimeout(self.UpdateLayoutChecker);
        if (delay > 0) {
            self.UpdateLayoutChecker = setTimeout(function () {
                updateLayout();
            }, delay);
        }
        else {
            updateLayout();
        }
    };
    self.GetFieldsAngleDefinition = function (kendoColumns) {
        var columnsWidths = [];
        jQuery.each(kendoColumns, function (index, kendoColumn) {
            var originalFields = jQuery.grep(self.F.Data().fields, function (field) {
                return field.field.toLowerCase() === kendoColumn.field.toLowerCase();
            });
            var columnWidth;
            if (originalFields.length) {
                var fieldObject = self.Models.Display.GetFieldSettings(originalFields[0]);
                fieldObject.width = kendoColumn.width;
                columnWidth = {
                    field: kendoColumn.field,
                    field_details: self.Models.Display.SetFieldSettings(fieldObject)
                };
                columnsWidths.push(columnWidth);
            }
            else {
                columnWidth = {
                    field: kendoColumn.field,
                    field_details: self.Models.Display.SetFieldSettings({ width: kendoColumn.width })
                };
            }
            columnsWidths.push(columnWidth);
        });

        var displayDefinitoinFields = { fields: columnsWidths };

        return displayDefinitoinFields;
    };
    self.GetDataRows = function (fieldNames, rowsData) {
        var datarows = [];
        jQuery.each(WC.Utility.ToArray(rowsData), function (index, datarow) {
            datarows[index] = jQuery.extend({ row_id: parseInt(datarow[enumHandlers.GENERAL.ROWID], 10) + 1 },
                                        self.ConvertDataRow(fieldNames, datarow.field_values));
        });
        return datarows;
    };
    self.ConvertDataRow = function (fieldNames, rowdata) {
        var datarows = {};
        var actualFields = self.Models.Display.Data().fields;
        jQuery.each(actualFields, function (index, field) {
            jQuery.each(fieldNames, function (index, fieldName) {
                var fieldId = field.field.toLowerCase();
                if (fieldId !== (fieldName || '').toLowerCase()) {
                    datarows[fieldId] = '';
                }
                else {
                    datarows[fieldId] = rowdata[index];
                    return false;
                }
            });
        });
        return datarows;
    };
    self.UpdateAngleGridHeaderPopup = function () {
        jQuery(self.ElementId + ' .k-virtual-scrollable-wrap').trigger('scroll');
    };
    self.InitialGridScrollPosition = function (grid) {
        grid.element.find('.k-virtual-scrollable-wrap').on('scroll.grid', function () {
            var scrollSettings = self.GetGridScrollSettingsData();
            if (scrollSettings.enable) {
                scrollSettings.left = jQuery(this).scrollLeft();
                self.SetGridScrollSettingsData(scrollSettings);
            }
        });

        grid.element.find('.k-scrollbar-vertical').on('scroll.grid', function () {
            var scrollSettings = self.GetGridScrollSettingsData();
            if (scrollSettings.enable) {
                scrollSettings.top = jQuery(this).scrollTop();
                self.SetGridScrollSettingsData(scrollSettings);
            }
        });
    };
    self.InitialHeaderPopup = function (grid) {
        if (!self.ReadOnly()) {
            grid.thead.find('th').on('contextmenu', self.OnHeaderContextMenu);

            // fixed cell popup float over the grid
            jQuery('<div class="headerBarRight" />').prependTo(grid.element);
            jQuery('<div class="headerBarLeft" />').prependTo(grid.element);
            self.UpdateCustomHeaderBarSize(grid);

            // bind scrolling event on k-virtual-scrollable-wrap for HeaderPopup position
            grid.element.find('.k-virtual-scrollable-wrap').on('scroll.popup', self.UpdateHeaderPopupLayout);
        }
    };
    self.UpdateCustomHeaderBarSize = function (grid) {
        if (!self.ReadOnly()) {
            var headerHeight = grid.element.find('.k-grid-header-locked tr').height();
            grid.wrapper.find('.headerBarRight').css({
                width: WC.Window.ScrollBarWidth,
                height: headerHeight
            });

            headerHeight = parseInt(headerHeight);
            grid.wrapper.find('.headerBarLeft').css({
                height: headerHeight / 2,
                top: headerHeight / 2
            });
        }
    };
    self.OnHeaderContextMenu = function (e) {
        var element = jQuery(e.currentTarget);
        var field = element.data('field');
        if (field) {
            self.HideHeaderPopup();
            element.find('.handler').trigger('click');
            e.preventDefault();
        }
    };
    self.UpdateHeaderPopupLayout = function () {
        var obj = jQuery('.HeaderPopup:visible');
        if (!obj.length) {
            return;
        }

        var grid = self.GetGridObject();
        var fieldId = obj.attr('alt');
        var gridHeaderColumn = grid.thead.find('.k-header[data-field="' + WC.Utility.RevertBackSlashFieldName(fieldId) + '"] .angleListHeader');
        if (!gridHeaderColumn.length) {
            obj.hide();
            return;
        }

        var leftSpace = 46;
        var rightSpace = WC.Window.ScrollBarWidth;
        var gridHeaderColumnOffset = gridHeaderColumn.offset();
        var gridHeaderColumnSize = gridHeaderColumn.width();
        var popupSpace = 5;
        var popupSize = obj.outerWidth();
        var popupLeft = gridHeaderColumnOffset.left + popupSize + 20 > WC.Window.Width
                        ? gridHeaderColumnOffset.left + gridHeaderColumnSize - popupSize - popupSpace
                        : gridHeaderColumnOffset.left;

        if (popupLeft < leftSpace + popupSpace) {
            if (gridHeaderColumnOffset.left + gridHeaderColumnSize - popupSpace > leftSpace) {
                popupLeft = leftSpace + popupSpace;
            }
        }
        else if (popupLeft + popupSize > WC.Window.Width - rightSpace) {
            if (gridHeaderColumnOffset.left + popupSpace < WC.Window.Width - rightSpace) {
                popupLeft = WC.Window.Width - rightSpace - popupSize - popupSpace;
            }
        }
        obj.css('left', popupLeft);

        self.UpdateCustomSortPopupLayout(obj);

        self.UpdateCustomFormatPopupLayout(obj);
    };
    self.UpdateCustomSortPopupLayout = function (obj) {
        var customSorting = obj.find('.customSortPopup');
        if (customSorting.is(':visible')) {
            customSorting.removeClass('customSortPopupLeft k-window-arrow-e k-window-arrow-w');

            if (customSorting.offset().left + customSorting.outerWidth(true) + 20 > WC.Window.Width) {
                customSorting.addClass('customSortPopupLeft k-window-arrow-e');
            }
            else {
                customSorting.addClass('k-window-arrow-w');
            }
        }
    };
    self.UpdateCustomFormatPopupLayout = function (obj) {
        var customFormat = obj.find('.listFormatSettingPopup');
        if (customFormat.is(':visible')) {
            customFormat.removeClass('listFormatSettingPopupLeft k-window-arrow-e k-window-arrow-w');

            if (customFormat.offset().left + customFormat.outerWidth(true) + 20 > WC.Window.Width) {
                customFormat.addClass('listFormatSettingPopupLeft k-window-arrow-e');
            }
            else {
                customFormat.addClass('k-window-arrow-w');
            }
        }
    };
    self.ShowHeaderPopup = function (fieldId) {
        if (self.DashBoardMode()) {
            return;
        }

        var html = self.GetTemplateCellHeaderPopup(fieldId);
        if (!html) {
            return;
        }

        var fieldElementId = WC.Utility.ConvertFieldName(fieldId);
        var currentHeaderPopup = jQuery('#PopupHeader' + fieldElementId);
        if (!currentHeaderPopup.length) {
            jQuery('#AngleGrid').before(html);
        }
        currentHeaderPopup = jQuery('#PopupHeader' + fieldElementId);
        var isVisible = currentHeaderPopup.is(':visible');

        self.HideHeaderPopup();
        self.HideContextMenu();

        if (!isVisible) {
            WC.HtmlHelper.MenuNavigatable.prototype.UnlockMenu('.HeaderPopup');
            jQuery('.HeaderPopup a').removeClass('active');

            currentHeaderPopup.show();
            listSortHandler.CloseCustomPopup();
            listFormatSettingHandler.CloseCustomPopup();

            var gridContentSpace = jQuery('#AngleGrid .k-grid-content').height() - -WC.Window.ScrollBarWidth;
            if (gridContentSpace < currentHeaderPopup.height()) {
                currentHeaderPopup.height(gridContentSpace - 20).addClass('scrollable');
            }
            self.SetActiveColumn(true);
            self.UpdateAngleGridHeaderPopup();
        }
    };
    self.HeaderPopupAction = function (element, fieldId) {
        element = jQuery(element);
        if (!element.hasClass('disabled')) {
            jQuery('.HeaderPopup a').removeClass('active');
            element.addClass('active');
            fieldId = WC.Utility.RevertFieldName(fieldId);
            if (element.hasClass('sortAsc')) {
                listSortHandler.Sort(fieldId, listSortHandler.TYPE.ASC);
            }
            else if (element.hasClass('sortDesc')) {
                listSortHandler.Sort(fieldId, listSortHandler.TYPE.DESC);
            }
            else if (element.hasClass('sortCustom')) {
                WC.HtmlHelper.MenuNavigatable.prototype.LockMenu('.HeaderPopup');
                listSortHandler.ShowCustomSortPopup(fieldId);
            }
            else if (element.hasClass('createPivot')) {
                self.CreateDisplayFromHeader(fieldId, enumHandlers.DISPLAYTYPE.PIVOT);
            }
            else if (element.hasClass('createChart')) {
                self.CreateDisplayFromHeader(fieldId, enumHandlers.DISPLAYTYPE.CHART);
            }
            else if (element.hasClass('fieldFormat')) {
                WC.HtmlHelper.MenuNavigatable.prototype.LockMenu('.HeaderPopup');
                listFormatSettingHandler.ShowCustomPopup(fieldId);
            }
            else if (element.hasClass('addColumn')) {
                self.ShowAddColumnsPopup(fieldId);
            }
            else if (element.hasClass('removeColumn')) {
                self.RemoveColumn(fieldId);
            }
            else if (element.hasClass('addFilter')) {
                quickFilterHandler.ShowAddFilterPopup(fieldId, self);
            }
            else if (element.hasClass('fieldInfo')) {
                helpTextHandler.ShowHelpTextPopup(fieldId, helpTextHandler.HELPTYPE.FIELD, self.Models.Angle.Data().model);
            }
        }
    };
    self.IsGridHasBooleanColumn = function () {
        var grid = self.GetGridObject();
        return grid.columns.hasObject('fieldtype', enumHandlers.FIELDTYPE.BOOLEAN);
    };

    var fnCheckActiveColumn;
    self.SetActiveColumn = function (isActive) {
        clearTimeout(fnCheckActiveColumn);
        jQuery(document).off('click.activecolumn touchstart.activecolumn');
        if (isActive) {
            var headerPopup = jQuery('.HeaderPopup:visible');
            if (headerPopup.length) {
                var headerColumn = jQuery('#AngleGrid .k-grid-header-wrap .k-header[data-field="' + WC.Utility.RevertBackSlashFieldName(headerPopup.attr('alt')) + '"]');
                headerColumn.addClass('k-column-active');
                jQuery('#AngleGrid .k-grid-content tr').find('td:eq(' + headerColumn.index() + ')').addClass('k-column-active');
            }
            else if (self.ActiveColumnList.length) {
                var dataRows = jQuery('#AngleGrid .k-grid-content tr');
                jQuery.each(self.ActiveColumnList, function (index, fieldId) {
                    var headerColumn = jQuery('#AngleGrid .k-grid-header-wrap .k-header[data-field="' + WC.Utility.RevertBackSlashFieldName(fieldId) + '"]');
                    headerColumn.addClass('k-column-active');
                    dataRows.find('td:eq(' + headerColumn.index() + ')').addClass('k-column-active');
                });

                clearTimeout(fnCheckActiveColumn);
                fnCheckActiveColumn = setTimeout(function () {
                    self.SetActiveColumn(false);
                    self.ActiveColumnList = [];
                }, 5000);
                jQuery(document).one('click.activecolumn touchstart.activecolumn', function () {
                    clearTimeout(fnCheckActiveColumn);
                    self.SetActiveColumn(false);
                    self.ActiveColumnList = [];
                });
            }
        }
        else {
            jQuery('#AngleGrid .k-grid-header-wrap th').removeClass('k-column-active');
            jQuery('#AngleGrid .k-grid-content td').removeClass('k-column-active');
        }
    };
    self.HideHeaderPopup = function () {
        listSortHandler.CloseCustomPopup();
        listFormatSettingHandler.CloseCustomPopup();

        self.SetActiveColumn(false);

        jQuery('.HeaderPopup').css('height', '').removeClass('scrollable').hide();
    };
    self.ShowAddColumnsPopup = function (fieldId) {
        jQuery('.HeaderPopup').css('height', '').removeClass('scrollable').hide();

        if (typeof fieldId !== 'undefined') {
            var index = self.Models.Display.Data().fields.indexOfObject('field', fieldId);
            self.AddColumnIndex = index;
        }

        var angleBlocks = self.Models.Angle.Data().query_definition;
        var angleBaseClassBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        var angleQueryStepBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        fieldsChooserHandler.ModelUri = self.Models.Angle.Data().model;
        fieldsChooserHandler.AngleClasses = angleBaseClassBlock ? angleBaseClassBlock.base_classes : [];
        fieldsChooserHandler.AngleSteps = angleQueryStepBlock ? angleQueryStepBlock.query_steps : [];
        fieldsChooserHandler.DisplaySteps = self.Models.DisplayQueryBlock.TempQuerySteps();
        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDCOLUMN, enumHandlers.ANGLEPOPUPTYPE.DISPLAY);
    };
    self.AddColumns = function (newItems) {
        if (!newItems.length) {
            return;
        }

        var fieldIndex,
            fields = [];

        self.ActiveColumnList = [];
        jQuery.each(newItems, function (i, item) {
            fieldIndex = self.Models.Display.Data().fields.indexOfObject('field', item.id);
            var fieldDetail = JSON.stringify({ width: self.DefaultColumnWidth });

            if (fieldIndex !== -1) {
                var field = self.Models.Display.Data().fields.findObject('field', WC.Utility.RevertFieldName(item.id));
                fieldDetail = field.field_details;
                self.Models.Display.Data().fields.removeObject('field', item.id);
            }

            var field = resultModel.GetResultDisplayFieldByFieldId(item.id);
            var fieldDetails = {
                field: field.id,
                field_details: fieldDetail,
                valid: true
            };
            if (self.AddColumnIndex != null) {
                self.Models.Display.Data().fields.splice(self.AddColumnIndex, 0, fieldDetails);
                self.AddColumnIndex++;
            }
            else {
                self.Models.Display.Data().fields.push(fieldDetails);
            }
            self.ActiveColumnList.push(field.id);

            fields.push(field);

        });
        self.Models.Display.Data.commit();
        historyModel.Save();

        var gridElement = jQuery(self.ElementId);
        var scrollPosition = {};
        scrollPosition.top = gridElement.find('.k-scrollbar-vertical').scrollTop();
        if (self.AddColumnIndex) {
            scrollPosition.left = gridElement.find('.k-virtual-scrollable-wrap').scrollLeft() + (self.ActiveColumnList.length * self.DefaultColumnWidth);
        }
        else {
            scrollPosition.left = gridElement.find('.k-virtual-scrollable-wrap > table').width();
        }

        self.AddColumnIndex = null;

        self.AddColumnsCallback(fields, scrollPosition);
    };
    self.AddColumnsCallback = function (fields, scrollPosition) {
        requestHistoryModel.SaveLastExecute(self, self.AddColumnsCallback, arguments);

        var fieldsValidation = validationHandler.GetFieldsValidation(self.Models.Display.Data().fields);
        if (fieldsValidation.InvalidFieldsAll) {
            popup.Info(Localization.Info_PleaseSaveAndRefresh);
        }

        if (self.Models.Result.Data().query_fields) {
            modelInstanceFieldsHandler.SetFields(fields, self.Models.Result.Data().query_fields);
        }
        else {
            modelInstanceFieldsHandler.SetFields(fields, fieldsChooserModel.GetQueryFilterUri(1).url);
        }
        modelFieldsHandler.SetFields(fields);
        modelFieldsHandler.LoadFieldsMetadata(fields)
            .done(function () {
                self.GetListDisplay(scrollPosition, self.SelectingRowId);
            });
    };
    self.RemoveColumn = function (fieldId) {
        requestHistoryModel.SaveLastExecute(self, self.RemoveColumn, arguments);
        var grid = self.GetGridObject();
        if (grid.columns.length > 2) {
            if (self.Models.Display.Data().fields.hasObject('field', fieldId, false)) {
                var sortingStep = displayQueryBlockModel.QuerySteps().findObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                if (sortingStep && sortingStep.sorting_fields && sortingStep.sorting_fields.hasObject('field_id', fieldId, false)) {
                    displayQueryBlockModel.QuerySteps.remove(sortingStep);
                }

                sortingStep = displayQueryBlockModel.TempQuerySteps().findObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                if (sortingStep && sortingStep.sorting_fields && sortingStep.sorting_fields.hasObject('field_id', fieldId, false)) {
                    displayQueryBlockModel.TempQuerySteps.remove(sortingStep);
                }

                sortingStep = listSortHandler.QuerySteps().findObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                if (sortingStep && sortingStep.sorting_fields && sortingStep.sorting_fields.hasObject('field_id', fieldId, false)) {
                    listSortHandler.QuerySteps.remove(sortingStep);
                }

                if (self.Models.Result.Data() && self.Models.Result.Data().posted_display && self.Models.Result.Data().posted_display.length) {
                    sortingStep = self.Models.Result.Data().posted_display[0].query_steps.findObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                    if (sortingStep && sortingStep.sorting_fields && sortingStep.sorting_fields.hasObject('field_id', fieldId, false)) {
                        self.Models.Result.Data().posted_display[0].query_steps.removeObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                    }
                }
            }

            self.Models.Display.Data().fields.removeObject('field', fieldId, false);
            self.Models.Display.Data.commit();

            historyModel.Save();

            var scrollSettings = self.GetGridScrollSettingsData();
            self.GetListDisplay({ left: scrollSettings.left, top: scrollSettings.top }, self.SelectingRowId);
        }
        else {
            popup.Alert(Localization.Warning_Title, Localization.Info_RequiredAtleastOneColumn);
        }
    };
    self.IsColumnExist = function (columnId) {
        return self.Models.Display.Data().fields.indexOfObject('field', columnId) !== -1;
    };
    self.GetDomainImageHtml = function (cellValue, domainUri) {
        var domainFolder = modelFieldDomainHandler.GetDomainPathByUri(domainUri);
        if (domainFolder && cellValue !== null) {
            var iconInfo = modelFieldDomainHandler.GetDomainElementIconInfo(domainFolder, cellValue);
            jQuery.injectCSS(iconInfo.css, iconInfo.id);
            return iconInfo.html;
        }
        else {
            return '';
        }
    };
    self.GetFormatValue = function (fieldId, cellValue, domainUri, nullableElement) {
        if (cellValue === '...') {
            // loading indicator
            return cellValue;
        }
        else if (fieldId === null) {
            // boolean
            return self.GetFormatBooleanValue(cellValue);
        }
        else {
            // etc.
            var value = '';

            if (typeof domainUri !== 'undefined') {
                // add element icon
                value += self.GetDomainImageHtml(cellValue, domainUri);
            }
            else if (cellValue === null)
                cellValue = '';

            if (self.ColumnInfo[fieldId]) {
                var fieldObject = new FieldFormatter(self.ColumnInfo[fieldId], self.Models.Angle.Data().model);
                fieldObject.AddBaseField(self.ColumnDefinitions[fieldId]);

                // M4-33287: null element id will show empty text
                value += htmlEncode(!nullableElement && cellValue == null ? '' : WC.FormatHelper.GetFormattedValue(fieldObject, cellValue, true));
            }
            else {
                value += cellValue;
            }

            return value;
        }
    };
    self.GetFormatBooleanValue = function (state) {
        if (state === true)
            return '<span class="icon check"></span>';
        else if (state === false) {
            return '<span class="icon uncheck"></span>';
        }
        else {
            return '';
        }
    };

    self.IsCopyText = false;
    self.MenuOptions;
    self.InitialContextMenu = function (grid) {
        var initialContextMenu = function () {
            jQuery(document.body).off('.jeegoocontext');

            if (!self.DashBoardMode()) {
                // prepare context menu
                jQuery('#angleContextMenu').remove();
                jQuery('<ul id="angleContextMenu" class="context-menu-list" />').appendTo('body');

                // bind context menu
                jQuery(self.ElementId + ' .k-grid-content td:not(.Number)').jeegoocontext('angleContextMenu', {
                    autoAddSubmenuArrows: false,
                    ignoreWidthOverflow: true,
                    ignoreHeightOverflow: true,
                    submenuTopOffset: -50,
                    event: 'click',
                    fadeIn: 0,
                    delay: 0,
                    keyDelay: 500,
                    onShow: self.OnContextMenuShow,
                    onHover: self.OnContextMenuHover,
                    onSelect: self.OnContextMenuSelect
                });

                grid.content.find('.k-virtual-scrollable-wrap, .k-scrollbar-vertical').scroll(self.HideContextMenu);

                self.InitialCopyToClipboard(grid);
            }
        };
        var fnCheckContextMenu = setInterval(function () {
            if (jQuery.fn.jeegoocontext) {
                clearInterval(fnCheckContextMenu);
                initialContextMenu();
            }
        }, 100);
    };
    self.OnContextMenuShow = function (e, context) {

        jQuery(document).trigger('click');
        self.HideHeaderPopup();
        var menu = jQuery(this), cell;
        var grid = self.GetGridObject();
        grid.select(context);
        cell = grid.select();

        if (jQuery(context).hasClass('Number') || self.IsCopyText) {
            self.HideContextMenu();
            grid.clearSelection();
            return false;
        }
        if (menu.children().length
            && menu.is(':visible')
            && jQuery(context).hasClass('active')) {
            self.HideContextMenu();
            return false;
        }

        var column = grid.columns[cell.index() + 1],
            dataItem = grid.dataSource.view()[cell.closest('tr').index()];

        var displayField = self.Models.Display.GetDisplayByFieldName(column.field, self.Models.Display.Data().fields);
        if (!displayField || (displayField && (displayField.valid === false || displayField.denied))) {
            self.HideContextMenu();
            grid.clearSelection();
            return false;
        }

        var field = modelFieldsHandler.GetFieldById(column.field, self.Models.Angle.Data().model);
        if (!field) {
            self.HideContextMenu();
            grid.clearSelection();
            return false;
        }

        self.MenuOptions = self.CreateContextMenu(column.field.toLowerCase(), dataItem[column.field.toLowerCase()]);
        self.RenderContextMenu('#' + menu.attr('id'), self.MenuOptions.items);

        // re-position
        setTimeout(function () {
            var winSize = { width: WC.Window.Width, height: WC.Window.Height },
                parentSize = { width: menu.width(), height: menu.height() },
                offset = menu.offset();
            if (parentSize.width + offset.left + 20 > winSize.width) {
                offset.left = winSize.width - (parentSize.width + 20);
            }
            if (parentSize.height + offset.top + 20 > winSize.height) {
                offset.top = jQuery(context).offset().top - parentSize.height;
            }
            menu.css(offset);
        }, 1);

    };
    self.OnContextMenuHover = function () {
        if (jQuery(this).hasClass('context-menu-submenu')) {
            var self = this;
            setTimeout(function () {
                var parent = jQuery(self).parent('ul'),
                    subMenu = jQuery('> ul', self),
                    subMenuWidth = subMenu.width() + 2,
                    subMenuHeight = subMenu.height() + 2;
                if (subMenuWidth + parent.width() + parent.offset().left > WC.Window.Width) {
                    subMenu.css('left', -1 * subMenuWidth);
                }
                if (subMenuHeight + subMenu.offset().top > WC.Window.Height) {
                    subMenu.css('margin-top', WC.Window.Height - (subMenuHeight + subMenu.offset().top) - 30);
                }
            }, 1);
        }
    };
    self.OnContextMenuSelect = function () {
        if (jQuery(this).hasClass('context-menu-submenu') || jQuery(this).hasClass('disabled')) {
            return false;
        }

        self.MenuOptions.callback(jQuery(this).attr('name'));
    };
    self.CreateContextMenu = function (fieldId, fieldValue) {

        var field = modelFieldsHandler.GetFieldById(fieldId, self.Models.Angle.Data().model);
        if (!field) {
            return;
        }
        return {
            callback: function (key, options) {
                switch (key) {
                    case 'drilldown':
                        var grid = self.GetGridObject();
                        var dataItem = grid.dataSource.view()[grid.select().parent('tr').index()];

                        listDrilldownHandler.Drilldown(dataItem);
                        break;
                    case 'copy':
                        jQuery('#CopyToClipboard').click();
                        break;
                    case 'sap':
                        popup.Info(Localization.NotImplement);
                        break;
                    case enumHandlers.CRITERIA.EMPTY:
                    case enumHandlers.CRITERIA.NOTEMPTY:
                    case enumHandlers.CRITERIA.EQUAL:
                    case enumHandlers.CRITERIA.NOTEQUAL:
                    case enumHandlers.CRITERIA.LARGERTHAN:
                    case enumHandlers.CRITERIA.SMALLERTHAN:

                        requestHistoryModel.SaveLastExecute(self, self.CreateContextMenu, arguments);

                        var dataType = field.fieldtype;
                        var operatorText = WC.WidgetFilterHelper.ConvertCriteriaToOperator(key);
                        var argumentValue = key === enumHandlers.CRITERIA.EMPTY || key === enumHandlers.CRITERIA.NOTEMPTY ? [] : [WC.WidgetFilterHelper.ArgumentObject(fieldValue, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                        var isNeedToConvertOperator = argumentValue.length && self.IsNeedToConvertOperator(dataType);
                        if (isNeedToConvertOperator) {
                            var filtersBoundaries = self.GetFilterBoundary(field, fieldValue);

                            var upperbound;
                            var lowerbound;
                            if (dataType === enumHandlers.FIELDTYPE.CURRENCY) {
                                upperbound = filtersBoundaries.upperbound.a;
                                lowerbound = filtersBoundaries.lowerbound.a;
                            }
                            else {
                                upperbound = filtersBoundaries.upperbound;
                                lowerbound = filtersBoundaries.lowerbound;
                            }

                            if (key === enumHandlers.CRITERIA.EQUAL) {
                                operatorText = enumHandlers.OPERATOR.BETWEEN.Value;
                                argumentValue = [WC.WidgetFilterHelper.ArgumentObject(lowerbound, enumHandlers.FILTERARGUMENTTYPE.VALUE), WC.WidgetFilterHelper.ArgumentObject(upperbound, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                            }
                            else if (key === enumHandlers.CRITERIA.NOTEQUAL) {
                                operatorText = enumHandlers.OPERATOR.NOTBETWEEN.Value;
                                argumentValue = [WC.WidgetFilterHelper.ArgumentObject(lowerbound, enumHandlers.FILTERARGUMENTTYPE.VALUE), WC.WidgetFilterHelper.ArgumentObject(upperbound, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                            }
                            else if (key === enumHandlers.CRITERIA.LARGERTHAN) {
                                argumentValue = [WC.WidgetFilterHelper.ArgumentObject(upperbound, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                            }
                            else if (key === enumHandlers.CRITERIA.SMALLERTHAN) {
                                argumentValue = [WC.WidgetFilterHelper.ArgumentObject(lowerbound, enumHandlers.FILTERARGUMENTTYPE.VALUE)];
                            }
                        }

                        var filterModel = {
                            step_type: enumHandlers.FILTERTYPE.FILTER,
                            field: field.id,
                            operator: operatorText,
                            arguments: argumentValue,
                            valid: true
                        };

                        quickFilterHandler.ApplyCustomFilter(self, filterModel);
                        break;

                    default:
                        break;
                }
            },
            items: self.GenerateMainContextMenu(self.GenerateFilterSubMenu(field, fieldValue))
        };
    };
    self.HideContextMenu = function () {
        jQuery(document).trigger('click.jeegoocontext');
    };
    self.RenderContextMenu = function (id, menu) {
        var ul = getContextMenu(menu);

        jQuery(id).empty()
            .addClass('context-menu-root')
            .html(ul.html());

        function getContextMenu(items) {
            var ul = jQuery('<ul class="context-menu-list" />'), li;

            jQuery.each(items, function (k, v) {
                v.id = k;

                li = jQuery('<li />')
                        .attr({
                            'name': k,
                            'class': 'context-menu-item'
                        })
                        .html('<span title="' + v.name + '">' + v.name + '</span>');

                if (v.icon) {
                    li.addClass('icon icon-' + v.icon);
                }
                if (typeof v.disabled === 'function' && v.disabled(k, v)) {
                    li.addClass('disabled');
                }
                if (v.items) {
                    li.addClass('context-menu-submenu')
                        .append(getContextMenu(v.items));
                }
                ul.append(li);
            });
            return ul;
        }
    };
    self.GenerateMainContextMenu = function (filterSubMenu) {
        var contextMenu = {
            drilldown: {
                name: Localization.CellPopupMenuDrillDownTo,
                icon: 'drilldown',
                disabled: function () {
                    return !self.Models.Result.Data().authorizations.single_item_view;
                }
            },
            filter: {
                name: Localization.CellPopupMenuFilterThisColumn,
                icon: 'filter',
                items: filterSubMenu,
                disabled: function () {
                    return !self.Models.Result.Data().authorizations.add_filter;
                }
            },
            copy: {
                name: Localization.CellPopupMenuCopy,
                icon: 'copy',
                disabled: function () {
                    var grid = self.GetGridObject();
                    var isIOS = !!jQuery.browser.safari && Modernizr.touch;
                    var text;
                    if (isIOS) {
                        text = false;
                    }
                    else if (grid) {
                        text = jQuery.trim(grid.content.find('td.k-state-selected').text());
                    }
                    else {
                        text = '';
                    }
                    return !text;
                }
            }
        };

        return contextMenu;
    };
    self.GetFilterBoundary = function (field, fieldValue) {
        if (field.fieldtype === enumHandlers.FIELDTYPE.TIMESPAN)
            return self.GetFilterTimeSpanBoundary(field, fieldValue);
        else
            return self.GetFilterNumberBoundary(field, fieldValue);
    };
    self.GetFilterNumberBoundary = function (field, fieldValue) {
        var lowerBound;
        var upperBound;

        var dataType = field.fieldtype;
        var columnOption = self.ColumnInfo[field.id.toLowerCase()];

        var customCulture = $.extend({}, ko.toJS(kendo.culture()));
        customCulture.numberFormat[','] = ',';
        customCulture.numberFormat['.'] = '.';

        var formatter = new FieldFormatter(columnOption, self.Models.Angle.Data().model);
        var formatSettings = WC.FormatHelper.GetFieldFormatSettings(formatter, true);
        var formattedValue = WC.FormatHelper.GetFormattedValue(formatSettings, fieldValue, false, customCulture, true);
        formattedValue = formattedValue.replace(/,/g, '');
        var boundaryString = "0.";
        for (var i = 0; i < formatSettings.decimals; i++) {
            boundaryString += "0";
        }
        boundaryString += '5';

        var multiplyNumber, safeDecimal;
        if (formatSettings.prefix === enumHandlers.DISPLAYUNITSFORMAT.MILLIONS) {
            multiplyNumber = 1000000;
            safeDecimal = formatSettings.decimals + 6;
        }
        else if (formatSettings.prefix === enumHandlers.DISPLAYUNITSFORMAT.THOUSANDS) {
            multiplyNumber = 1000;
            safeDecimal = formatSettings.decimals + 3;
        }
        else {
            multiplyNumber = 1;
            safeDecimal = formatSettings.decimals + 2;
        }

        if (dataType === enumHandlers.FIELDTYPE.PERCENTAGE) {
            multiplyNumber /= 100;
            safeDecimal += 2;
        }

        var boundary = parseFloat(boundaryString);
        lowerBound = (parseFloat(formattedValue) - boundary) * multiplyNumber;
        upperBound = (parseFloat(formattedValue) + boundary) * multiplyNumber;

        lowerBound = lowerBound.safeParse(safeDecimal);
        upperBound = upperBound.safeParse(safeDecimal);

        if (dataType === enumHandlers.FIELDTYPE.CURRENCY) {
            lowerBound = { a: lowerBound, c: fieldValue.c };
            upperBound = { a: upperBound, c: fieldValue.c };
        }

        var displayFormatSettings = new Formatter(formatSettings, dataType);
        displayFormatSettings.prefix = null;
        displayFormatSettings.decimals++;

        var contextValue = {
            lowerbound: lowerBound,
            upperbound: upperBound,

            lowerboundText: WC.FormatHelper.GetFormattedValue(displayFormatSettings, lowerBound),
            upperboundText: WC.FormatHelper.GetFormattedValue(displayFormatSettings, upperBound)

        };
        return contextValue;
    };
    self.GetFilterTimeSpanBoundary = function (field, fieldValue) {
        var columnOption = self.ColumnInfo[field.id.toLowerCase()];
        var formatter = new FieldFormatter(columnOption, self.Models.Angle.Data().model);
        var formatSettings = WC.FormatHelper.GetFieldFormatSettings(formatter, true);
        formatSettings.second = 'ss';

        var lowerBound = Math.floor(fieldValue * kendo.date.SEC_PER_DAY);
        var upperBound = lowerBound + 1;

        lowerBound /= kendo.date.SEC_PER_DAY;
        upperBound /= kendo.date.SEC_PER_DAY;

        var contextValue = {
            lowerbound: lowerBound,
            upperbound: upperBound,

            lowerboundText: WC.FormatHelper.GetFormattedValue(formatSettings, lowerBound),
            upperboundText: WC.FormatHelper.GetFormattedValue(formatSettings, upperBound)
        };
        return contextValue;
    };
    self.IsNeedToConvertOperator = function (dataType) {
        return jQuery.inArray(dataType, [
            enumHandlers.FIELDTYPE.DOUBLE,
            enumHandlers.FIELDTYPE.PERCENTAGE,
            enumHandlers.FIELDTYPE.CURRENCY,
            enumHandlers.FIELDTYPE.TIMESPAN
        ]) !== -1;
    };
    self.GenerateFilterSubMenu = function (field, fieldValue) {

        var dataType = field.fieldtype;
        var isNeedToConvertOperator = self.IsNeedToConvertOperator(dataType);

        var subMenu = {};
        var disableFunction = function () {
            return !self.Models.Result.Data().authorizations.add_filter;
        };
        var filterText;
        if (dataType === enumHandlers.FIELDTYPE.BOOLEAN)
            filterText = fieldValue === true ? Localization.Yes : Localization.No;
        else if (dataType === enumHandlers.FIELDTYPE.ENUM) {
            filterText = htmlEncode(jQuery('<div />', { html: self.GetFormatValue(field.id.toLowerCase(), fieldValue, field.domain, true) }).text());
        }
        else
            filterText = htmlEncode(jQuery('#AngleGrid td.k-state-selected').text());

        var isDateOrDateTime = WC.FormatHelper.IsDateOrDateTime(dataType);
        var isEmptyDate = isDateOrDateTime && fieldValue === 0;
        var isEmptyNotEnum = dataType !== enumHandlers.FIELDTYPE.ENUM && IsNullOrEmpty(fieldValue);
        if (isEmptyDate || isEmptyNotEnum) {
            subMenu = {
                empty: {
                    name: Localization.CellPopupSubMenuEmpty,
                    disabled: disableFunction
                },
                notempty: {
                    name: Localization.CellPopupSubMenuNotEmpty,
                    disabled: disableFunction
                }
            };
        }
        else {
            switch (dataType) {
                case enumHandlers.FIELDTYPE.PERCENTAGE:
                case enumHandlers.FIELDTYPE.CURRENCY:
                case enumHandlers.FIELDTYPE.DOUBLE:
                case enumHandlers.FIELDTYPE.INTEGER:
                case enumHandlers.FIELDTYPE.TIMESPAN:

                    var upperbound;
                    var lowerbound;

                    if (isNeedToConvertOperator) {

                        var filtersMenus = self.GetFilterBoundary(field, fieldValue);

                        upperbound = filtersMenus.upperboundText;
                        lowerbound = filtersMenus.lowerboundText;

                        jQuery.extend(subMenu, {
                            equal: {
                                name: kendo.format(Localization.CellPopupSubMenuIsBetween, lowerbound, upperbound),
                                disabled: disableFunction
                            },
                            notequal: {
                                name: kendo.format(Localization.CellPopupSubMenuIsNotBetween, lowerbound, upperbound),
                                disabled: disableFunction
                            }
                        });

                    }
                    else {
                        jQuery.extend(subMenu, {
                            equal: {
                                name: Localization.CellPopupSubMenuEqual + ' ' + filterText,
                                disabled: disableFunction
                            },
                            notequal: {
                                name: Localization.CellPopupSubMenuNotEqual + ' ' + filterText,
                                disabled: disableFunction
                            }
                        });
                    }

                    jQuery.extend(subMenu, {
                        empty: {
                            name: Localization.CellPopupSubMenuEmpty,
                            disabled: disableFunction
                        },
                        notempty: {
                            name: Localization.CellPopupSubMenuNotEmpty,
                            disabled: disableFunction
                        }
                    });

                    if (isNeedToConvertOperator) {
                        jQuery.extend(subMenu, {
                            largerthan: {
                                name: Localization.CellPopupSubMenuLargerThan + ' ' + upperbound,
                                disabled: disableFunction
                            },
                            smallerthan: {
                                name: Localization.CellPopupSubMenuSmallerThan + ' ' + lowerbound,
                                disabled: disableFunction
                            }
                        });
                    }
                    else {
                        jQuery.extend(subMenu, {
                              largerthan: {
                                  name: Localization.CellPopupSubMenuLargerThan + ' ' + filterText,
                                  disabled: disableFunction
                              },
                              smallerthan: {
                                  name: Localization.CellPopupSubMenuSmallerThan + ' ' + filterText,
                                  disabled: disableFunction
                              }
                          });
                    }
                    break;

                case enumHandlers.FIELDTYPE.DATE:
                case enumHandlers.FIELDTYPE.DATETIME:
                    subMenu = {
                        equal: {
                            name: Localization.CellPopupSubMenuEqual + ' ' + filterText,
                            disabled: disableFunction
                        },
                        notequal: {
                            name: Localization.CellPopupSubMenuNotEqual + ' ' + filterText,
                            disabled: disableFunction
                        },
                        empty: {
                            name: Localization.CellPopupSubMenuEmpty,
                            disabled: disableFunction
                        },
                        notempty: {
                            name: Localization.CellPopupSubMenuNotEmpty,
                            disabled: disableFunction
                        },
                        largerthan: {
                            name: isDateOrDateTime ? Localization.CellPopupSubMenuAfter + ' ' + filterText : Localization.CellPopupSubMenuLargerThan + ' ' + filterText,
                            disabled: disableFunction
                        },
                        smallerthan: {
                            name: isDateOrDateTime ? Localization.CellPopupSubMenuBefore + ' ' + filterText : Localization.CellPopupSubMenuSmallerThan + ' ' + filterText,
                            disabled: disableFunction
                        }
                    };
                    break;
                default:
                    subMenu = {
                        equal: {
                            name: Localization.CellPopupSubMenuEqual + ' ' + filterText,
                            disabled: disableFunction
                        },
                        notequal: {
                            name: Localization.CellPopupSubMenuNotEqual + ' ' + filterText,
                            disabled: disableFunction
                        },
                        empty: {
                            name: Localization.CellPopupSubMenuEmpty,
                            disabled: disableFunction
                        },
                        notempty: {
                            name: Localization.CellPopupSubMenuNotEmpty,
                            disabled: disableFunction
                        }
                    };
                    break;
            }
        }

        return subMenu;
    };
    self.CreateDisplayFromHeader = function (fieldId, displayType) {
        self.HideHeaderPopup();
        var displayField = self.Models.Display.Data().fields.findObject('field', fieldId, false);
        var modelField = self.GetColumnDefinitionField(fieldId, true);
        var defaultBucket = fieldSettingsHandler.GetDefaultOperator(modelField.fieldtype, enumHandlers.FIELDSETTINGAREA.ROW);
        var fieldDetails = WC.Utility.ParseJSON(displayField.field_details);

        // create for chart/pivot
        var display = self.Models.Display.GenerateDefaultData(displayType, fieldId, defaultBucket, fieldDetails);
        display.fields[0].multi_lang_alias = displayField.multi_lang_alias;
        var currentBlocks = displayQueryBlockModel.CollectQueryBlocks();

        // display name
        display.multi_lang_name[0].text = self.Models.Display.GetAdhocDisplayName(display.multi_lang_name[0].text);

        if (currentBlocks.length) {
            var i = 0;
            jQuery.each(currentBlocks[0].query_steps, function (k, v) {
                if (v.step_type !== enumHandlers.FILTERTYPE.SORTING) {
                    display.query_blocks[0].query_steps.splice(i, 0, v);
                    i++;
                }
            });
        }
        jQuery.when(self.Models.Display.CreateTempDisplay(displayType, display))
            .done(function (data) {
                fieldSettingsHandler.ClearFieldSettings();

                // redirect to display
                self.Models.Display.GotoTemporaryDisplay(data.uri);
            });
    };
    self.InitialCopyToClipboard = function (grid) {
        if (!jQuery('#CopyToClipboard').length) {
            jQuery('body').append('<input type="button" id="CopyToClipboard" class="alwaysHide" />');
        }

        var isIOS = !!jQuery.browser.safari && Modernizr.touch;

        var selectElementText = function (el, win) {
            win = win || window;
            var doc = win.document, sel, range;
            if (win.getSelection && doc.createRange) {
                sel = win.getSelection();
                range = doc.createRange();
                range.selectNodeContents(el);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            else if (doc.body.createTextRange) {
                range = doc.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            }
        };

        var timeoutShowCopyNotify;
        var showCopyNotify = function (grid, text) {
            var selectCell = grid.content.find('td.k-state-selected');
            var tooltip = jQuery('#tooltipCopy');
            if (!tooltip.length) {
                tooltip = jQuery('<div class="k-grid-tooltip k-grid-tooltip-copy" />').attr('id', 'tooltipCopy').appendTo('body');
            }
            var cellHeight = selectCell.height();
            var position = selectCell.offset();
            position.top += cellHeight;
            tooltip.text(text).css(position).show();

            // re-position
            var tooltipHeight = tooltip.outerHeight();
            var tooltipWidth = tooltip.outerWidth();
            if (position.top + tooltipHeight + 10 > WC.Window.Height) {
                position.top = position.top - cellHeight - tooltipHeight;
            }
            if (position.left + tooltipWidth + 10 > WC.Window.Width) {
                position.left = WC.Window.Width - tooltipWidth - 10;
            }
            tooltip.css(position);

            clearTimeout(timeoutShowCopyNotify);
            timeoutShowCopyNotify = setTimeout(function () {
                tooltip.hide();
            }, 2000);
        };

        // set clipboard
        var clipboard = new Clipboard('#CopyToClipboard', {
            target: function () {
                return grid.content.find('td.k-state-selected')[0];
            }
        });
        clipboard.on('success', function () {
            // show tooltip: Copied
            showCopyNotify(grid, Localization.Copied);

            grid.clearSelection();
        });
        clipboard.on('error', function () {
            var selectCell = grid.content.find('td.k-state-selected');

            // show tooltip: press Ctrl + C
            if (!isIOS) {
                selectElementText(selectCell[0]);
                showCopyNotify(grid, Localization.PressControlCopy);
            }
            else {
                var text = jQuery.trim(selectCell.text());
                window.prompt(Localization.Info_PleaseUseTextBelowToCopy, text);
            }

            grid.clearSelection();
        });
    };
    self.InitialAllowToHighlightCell = function (grid) {

        var getSelectionText = function () {
            var t = '';
            if (window.getSelection) {
                t = window.getSelection();
            }
            else if (document.getSelection) {
                t = document.getSelection();
            }
            else if (document.selection) {
                t = document.selection.createRange().text;
            }
            return t + '';
        };

        var setIsCopyText = function () {
            var selectText = getSelectionText();
            if (selectText) {
                setTimeout(function () {
                    grid.clearSelection();
                }, 1);
                self.IsCopyText = true;
            }
            else {
                self.IsCopyText = false;
            }
        };

        jQuery(grid.element).off('mouseup.copy').on('mouseup.copy', function () {
            setIsCopyText();
        });

        grid.content.find('td').kendoTouch({
            hold: function () {
                setIsCopyText();
            }
        });
    };

    /*EOF: Model Methods*/
}
