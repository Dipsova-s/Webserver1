var listDrilldownHandler = new ListDrilldownHandler();

function ListDrilldownHandler() {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.PrimaryData = null;
    self.FacetModel = null;
    self.Facet = ko.observableArray([]);
    self.TextLoading = '...';
    self.TextSourceLoading = '...';
    self.RequestingSourceUri = [];
    self.RequestingDomainUri = [];
    self.SortingList = [];
    self.CurrentSort = null;
    self.PKData = null;

    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.Drilldown = function (row) {
        requestHistoryModel.SaveLastExecute(self, self.Drilldown, arguments);

        // prepare display area
        anglePageHandler.RenderActionDropdownList();
        jQuery(document).trigger('click.outside');

        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_DrillingDown, false);

        // set row_id
        row[enumHandlers.GENERAL.ROWID] = '' + (row[enumHandlers.GENERAL.ROWID] - 1);


        // private functions
        function getPrimaryKeyData(row) {
            var hasPkFields = true,
                isValidPkValue = true,
                pkFields = [],
                pkData = {},
                i;

            jQuery.each(enumHandlers.PRIMARYFIELDS, function (key, value) {
                if (typeof row[value.toLowerCase()] === 'undefined') {
                    hasPkFields = false;
                }
                else if (row[value.toLowerCase()] === '' || row[value.toLowerCase()] === null) {
                    isValidPkValue = false;
                }
                else {
                    pkData[value] = escape(row[value.toLowerCase()]);
                }

                pkFields.push(value);
            });

            if (hasPkFields) {
                if (!isValidPkValue) {
                    return self.SetError({}, Localization.DrilldownErrorKeyNotValid.replace('{ObjectType}', unescape(pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE])));
                }
                else {
                    return jQuery.when(pkData);
                }
            }
            else {
                var grid = jQuery('#AngleGrid').data(enumHandlers.KENDOUITYPE.GRID),
                    uri = directoryHandler.ResolveDirectoryUri(resultModel.Data().data_fields),
                    query = { ids: pkFields.join(',') };

                return jQuery.when(GetDataFromWebService(uri, query))
                            .then(function (data, status, xhr) {
                                if (data.header.total !== pkFields.length) {
                                    return self.SetError(xhr, Localization.DrilldownErrorNoIDField);
                                }
                                else {
                                    var uri = directoryHandler.ResolveDirectoryUri(resultModel.Data().data_rows);
                                    var query = {};
                                    query['fields'] = pkFields.join(',');
                                    query[enumHandlers.PARAMETERS.OFFSET] = (getPageByRowId(grid, row[enumHandlers.GENERAL.ROWID]) - 1) * grid.dataSource.pageSize();
                                    query[enumHandlers.PARAMETERS.LIMIT] = grid.dataSource.pageSize();
                                    return GetDataFromWebService(uri, query);
                                }
                            })
                            .then(function (data, status, xhr) {

                                if (data.fields.length !== pkFields.length) {
                                    return self.SetError(xhr, Localization.DrilldownErrorNoIDField);
                                }
                                else if (!data.rows.length) {
                                    return self.SetError(xhr, Localization.DrilldownErrorItemNotFound);
                                }
                                else {
                                    var foundRow = false;
                                    isValidPkValue = true;
                                    jQuery.each(data.rows, function (k, v) {
                                        if (v[enumHandlers.GENERAL.ROWID] === row[enumHandlers.GENERAL.ROWID]) {
                                            i = 0;
                                            jQuery.each(enumHandlers.PRIMARYFIELDS, function (k2, v2) {
                                                pkData[v2] = escape(data.rows[k].field_values[i]);
                                                if (pkData[v2] === '' || pkData[v2] === null) {
                                                    isValidPkValue = false;
                                                }
                                                i++;
                                            });
                                            foundRow = true;
                                            return false;
                                        }
                                    });
                                    if (!foundRow) {
                                        return self.SetError(xhr, Localization.DrilldownErrorItemNotFound);
                                    }
                                    else if (!isValidPkValue) {
                                        return self.SetError(xhr, Localization.DrilldownErrorKeyNotValid.replace('{ObjectType}', unescape(pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE])));
                                    }
                                    else {
                                        return jQuery.when(pkData);
                                    }
                                }
                            });
            }
        }
        function getPageByRowId(grid, id) {
            var page = grid.dataSource.page();
            jQuery.each(grid.dataSource._ranges, function (k, v) {
                jQuery.each(v.data, function (k2, v2) {
                    if (v2[enumHandlers.GENERAL.ROWID] === id) {
                        page = (v.start / grid.dataSource.pageSize()) + 1;
                        return false;
                    }
                });
            });
            return page || 0;
        }

        // finding PK (id, objecttype) then redirect to list-drilldown action
        jQuery.when(getPrimaryKeyData(row))
            .done(function (data) {
                // redirect to drilldown item
                WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN, JSON.stringify(data));
            })
            .fail(function (xhr, status) {
                // custom error
                setTimeout(function () {
                    self.ApplyError();
                    if (status === null) {
                        errorHandlerModel.ShowCustomError(xhr.responseText);
                    }
                }, 1);
            });
    };
    self.Apply = function (pkData) {
        var isValidPkValus = true;
        jQuery.each(pkData, function (key, value) {
            if (value === '' || value === null) {
                isValidPkValus = false;
                return false;
            }
        });
        if (!isValidPkValus) {
            self.ApplyError();
            errorHandlerModel.ShowCustomError(Localization.DrilldownErrorKeyNotValid.replace('{ObjectType}', pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE]));
            return;
        }

        requestHistoryModel.SaveLastExecute(self, self.Apply, arguments);

        var displayKey = displayModel.Data().uri + ',' + JSON.stringify(pkData),
            displayData = historyModel.Get(displayKey);

        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PostResult, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            window.location.href = WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, displayModel.Data().uri);
        };

        jQuery('html').addClass('listDrilldown');
        if (jQuery('#ToggleWrapper').hasClass('fullDetail')) {
            anglePageHandler.TogglePanel(false);
        }

        self.PrimaryData = pkData;
        self.FacetModel = new FieldsChooserModel();

        if (!displayData || (displayData && !displayData.results)) {
            // post execute_step with (id, objecttype)
            var modelUri = angleInfoModel.Data().model;
            var postOptions = {};
            var executeStep = [];
            var followupSteps = [];
            var addFollowup = function (followupId) {
                var followup = modelFollowupsHandler.GetFollowupById(followupId, modelUri);
                if (followup) {
                    followupSteps.push({
                        step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
                        followup: followup.id
                    });
                }
            };
            jQuery.each(pkData, function (k, v) {
                if (k.toLowerCase() === enumHandlers.ANGLEPARAMETER.FOLLOWUPS) {
                    var followupId;
                    if (resultModel.Data() && resultModel.Data().uri) {
                        followupId = v[v.length - 1];
                        addFollowup(followupId);
                    }
                    else {
                        for (var loop = 0; loop < v.length; loop++) {
                            followupId = v[loop];
                            addFollowup(followupId);
                        }
                    }
                }
                else {
                    executeStep.push({
                        step_type: enumHandlers.FILTERTYPE.FILTER,
                        field: k,
                        operator: enumHandlers.OPERATOR.EQUALTO.Value,
                        arguments: [WC.WidgetFilterHelper.ArgumentObject(v, enumHandlers.FILTERARGUMENTTYPE.VALUE)]
                    });
                }
            });

            if (resultModel.Data() && resultModel.Data().uri) {
                if (followupSteps.length) {
                    // followup step
                    postOptions.useExecuteStep = true;
                    postOptions.customExecuteStep = followupSteps;
                }
                else {
                    // normal step
                    postOptions.useExecuteStep = true;
                    postOptions.customExecuteStep = executeStep;
                }
            }
            else {
                // when refresh page
                postOptions.customQueryBlocks = [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                    query_steps: executeStep.concat(followupSteps)
                }];
            }

            return resultModel.PostResult(postOptions)
                .then(function () {
                    displayData = historyModel.Get(displayModel.Data().uri);
                    displayData.query_blocks.push({
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: executeStep.concat(followupSteps) //executeStep
                    });

                    return resultModel.GetResult(resultModel.Data().uri);
                })
                .done(function () {
                    displayData.results = ko.toJS(resultModel.Data());
                    historyModel.Set(displayKey, displayData);

                    self.Render(pkData, false);
                    anglePageHandler.ApplyExecutionAngle();
                });
        }
        else {
            resultModel.LoadSuccess(displayData.results);
            return resultModel.GetResult(resultModel.Data().uri)
                .done(function () {
                    displayData.results = ko.toJS(resultModel.Data());
                    historyModel.Set(displayKey, displayData);

                    self.Render(pkData);
                    anglePageHandler.ApplyExecutionAngle();
                });
        }
    };
    self.Render = function (pkData, isSort) {
        if (jQuery('#ToggleWrapper').hasClass('fullDetail')) {
            anglePageHandler.TogglePanel(false);
        }

        self.PKData = pkData;
        fieldsChooserModel.PossibleToSetStar = true;
        fieldsChooserModel.GridName = enumHandlers.FIELDCHOOSERNAME.LISTDRILLDOWN;
        requestHistoryModel.SaveLastExecute(self, self.Render, arguments);

        if (!isSort && !IsNullOrEmpty(pkData)) {
            var resultRowCount = resultModel.TotalRow();
            var parameter = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN);
            if (!parameter) {
                return;
            }
            parameter = JSON.parse(unescape(parameter));

            if (resultRowCount !== 1) {
                var infoMessage;
                progressbarModel.EndProgressBar();
                if (resultRowCount === 0 && parameter.Followups) {
                    popup.Info(Localization.Info_FollowUpHasNoResults);
                    jQuery('#ListDrilldownWrapper').remove();
                    return false;
                }
                else if (resultRowCount === 0 && !parameter.Followups) {
                    // Not found
                    infoMessage = Localization.DrilldownErrorPrimaryDataNotFound.replace('{ID}', pkData[enumHandlers.PRIMARYFIELDS.ID]).replace('{ObjectType}', pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE]);
                }
                else {
                    // Filter by ID not uniqe
                    infoMessage = Localization.DrilldownErrorPrimaryDataNotUnique.replace('{ID}', pkData[enumHandlers.PRIMARYFIELDS.ID]).replace('{ObjectType}', pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE]);
                    jQuery('#ListDrilldownWrapper').remove();
                }
                if (infoMessage) {
                    WC.Ajax.AbortAll();
                    popup.Info(infoMessage);
                    return false;
                }
            }
        }


        // prepare html
        if (!jQuery('#ListDrilldownWrapper').length) {
            var wrapper = jQuery('<div id="ListDrilldownWrapper" />');
            wrapper.append('<div id="ListDrilldownGrid" class="grid listDrilldownGrid" />');
            jQuery('#AngleTableWrapper').append(wrapper);

            var facetTemplate = jQuery(fieldschooserHtmlTemplate()).find('.fieldChooserFilter').attr('id', 'ListDrilldownFilter');
            jQuery('#ListDrilldownWrapper').prepend(facetTemplate);
            jQuery('#ListDrilldownFilter').height(jQuery('#AngleTableWrapper').height());
            jQuery('#ListDrilldownFilter').busyIndicator(true);
            WC.HtmlHelper.ApplyKnockout(self.FacetModel, jQuery('#ListDrilldownFilter'));
            self.FacetModel.FacetItems([]);
            self.FacetModel.BindDataGrid = self.Render;
            self.FacetModel.FilterFacetCustom = self.FilterFacet;
        }

        // if there are more space then increase page size
        var avaliableSpace = anglePageHandler.IsCompactResult ? 0 : jQuery('#AngleTopBar').height() + jQuery('#AngleField').height();
        var minPageSize = systemSettingHandler.GetDefaultPageSize();
        var defaultPageSize = Math.max(minPageSize, Math.ceil((WC.Window.Height - avaliableSpace - 60) / 26));

        // prepare dataSource
        var totals = 0;
        var dataSource;
        var dataSourceTmp = {};
        var grid = null;
        var tempAjaxRequests = {};

        // prepare kendo data source
        dataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    var currentPage = options.data.page,
                        requestUrl = directoryHandler.ResolveDirectoryUri(resultModel.Data().data_fields),
                        requestQuery = {};

                    requestQuery[enumHandlers.PARAMETERS.OFFSET] = (currentPage - 1) * defaultPageSize;
                    requestQuery[enumHandlers.PARAMETERS.LIMIT] = defaultPageSize;

                    jQuery.extend(requestQuery, self.GetSortQuery(), self.FacetModel.GetFacetQuery());

                    if (tempAjaxRequests.request && tempAjaxRequests.request.readyState !== 4) {
                        tempAjaxRequests.request.abort();
                    }

                    if (typeof dataSourceTmp[currentPage] !== 'undefined') {
                        options.success(dataSourceTmp[currentPage]);
                        return;
                    }

                    var getData = function () {
                        return GetDataFromWebService(requestUrl, requestQuery)
                            .fail(function (xhr, status, error) {
                                var gridObject = jQuery('#ListDrilldownGrid').data(enumHandlers.KENDOUITYPE.GRID);
                                if (options.error) {
                                    options.error(xhr, status, error);
                                }
                                else if (gridObject) {
                                    requestHistoryModel.SaveLastExecute(gridObject.dataSource, gridObject.dataSource.options.transport.read, [options]);
                                }
                            })
                            .done(function (result) {
                            measurePerformance.SetEndTime();

                            // load fields' value (datarows)
                            var startRowNumber = (currentPage - 1) * defaultPageSize + 1;
                            var dataRows = self.GetDataRows(result.fields, startRowNumber);
                            var fields = jQuery.map(dataRows, function (dataRow) { return dataRow.id; });

                            // set totals
                            totals = result.header.total;
                            resultModel.TotalRow(totals);

                            self.SortingList = WC.Utility.ToArray(result.sort_options);

                            // add fields to localStorage
                            modelFieldsHandler.SetFields(result.fields, false);
                            jQuery.each(result.fields, function (k, v) {
                                resultModel.Fields.push(v);
                            });

                            if (self.FacetModel.FacetItems().length > 0) {
                                jQuery.each(self.FacetModel.FacetItems(), function (index, selffacetItem) {
                                    if (self.FacetModel.UpdatingCategory !== selffacetItem.id) {
                                        var resultfacetitem = jQuery.grep(result.facets, function (facetItem) { return facetItem.id === selffacetItem.id; });
                                        var resultfacetitemhasvalue = resultfacetitem.length > 0 ? resultfacetitem[0] : null;

                                        jQuery.each(selffacetItem.filters(), function (index, selffacetfilter) {
                                            var resultfacetfilter = resultfacetitemhasvalue !== null ? jQuery.grep(resultfacetitemhasvalue.filters, function (facetfilter) { return facetfilter.id === selffacetfilter.id; }) : null;
                                            if (resultfacetfilter !== null && resultfacetfilter.length > 0) {
                                                selffacetfilter.count(resultfacetfilter[0].count);
                                            }
                                            else {
                                                selffacetfilter.count(0);
                                            }
                                        });
                                    }
                                });

                                self.SetFacetFilter({ facets: ko.toJS(self.FacetModel.FacetItems()) });
                            }
                            else {
                                self.SetFacetFilter(result);

                                jQuery.each(self.FacetModel.FacetItems(), function (index, facet) {
                                    if (self.FacetModel.GroupGeneral.indexOf(facet.id) === -1) {
                                        facet.panel_opened(false);
                                    }
                                });
                            }
                            self.FacetModel.UpdatePreferenceText();
                            self.FacetModel.UpdatingCategory = null;

                            dataSourceTmp[currentPage] = {
                                fields: fields,
                                valueLoaded: false,
                                start: startRowNumber - 1,
                                data: dataRows
                            };
                            options.success(dataSourceTmp[currentPage]);
                        });
                    };

                    tempAjaxRequests = {
                        url: requestUrl,
                        request: getData()
                    };
                }
            },
            error: function (e) {
                requestHistoryModel.SaveLastExecute(e.sender, e.sender.read, []);
            },
            schema: {
                data: 'data',
                total: function () {
                    return totals;
                }
            },
            pageSize: defaultPageSize,
            serverPaging: true
        });

        anglePageHandler.SetWrapperHeight();

        // render grid
        var fnCheckScrolling;
        var updateAsyncFields = function (e) {
            jQuery.each(dataSourceTmp, function (indexTemp, dataTemp) {
                jQuery.each(e.sender.dataSource._ranges, function (indexRange, dataRange) {
                    if (dataRange.start === dataTemp.start) {
                        jQuery.each(dataRange.data, function (index, data) {
                            data[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.VALUE] = dataTemp.data[index][enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.VALUE];
                            data[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE] = dataTemp.data[index][enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE];
                            data[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCETITLE] = dataTemp.data[index][enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCETITLE];
                        });
                    }
                });
            });

            // sometimes the grid got js error cause by timing
            try {
                e.sender.refresh();
            }
            catch (ex) {
                // do nothing
            }
        };
        var updateAsyncSourceField = function (e, data) {
            jQuery.each(data, function (index, value) {
                value[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE] = '';
                value[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCETITLE] = '';
                if (value.source) {
                    var source = modelFieldSourceHandler.GetFieldSourceByUri(value.source);
                    if (source) {
                        value[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE] = source.short_name || source.long_name || source.id;
                        value[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCETITLE] = source.long_name || source.id;
                    }
                }
            });
            updateAsyncFields(e);
        };
        grid = jQuery('#ListDrilldownGrid').empty().kendoGrid({
            dataSource: dataSource,
            autoBind: false,
            resizable: true,
            navigatable: false,
            height: jQuery('#AngleTableWrapper').height(),
            columns: self.GetSingleDrilldownColumns(),
            columnResize: function (e) {
                e.sender.resize(true);
            },
            dataBound: function (e) {
                jQuery('.fieldChooserFilter').busyIndicator(false);

                if (!WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) || e.sender.dataSource.total() === 0) {
                    return;
                }

                // set value for dataSource
                jQuery.each(dataSourceTmp, function (index, source) {
                    if (!source.valueLoaded) {
                        source.valueLoaded = true;
                        var uri = directoryHandler.ResolveDirectoryUri(resultModel.Data().data_rows);
                        var query = {};
                        query['fields'] = source.fields.join(',');
                        query[enumHandlers.PARAMETERS.OFFSET] = 0;
                        query[enumHandlers.PARAMETERS.LIMIT] = defaultPageSize;

                        GetDataFromWebService(uri, query)
                            .then(function (data, status, xhr) {
                                if (data.header.total === 1) {
                                    self.SetDataValues(source, data.rows[0].field_values);
                                    updateAsyncFields(e);
                                    return jQuery.when();
                                }
                                else {
                                    if (data.header.total === 0)
                                        return self.SetError(xhr, Localization.DrilldownErrorPrimaryDataNotFound.replace('{ID}', pkData[enumHandlers.PRIMARYFIELDS.ID]).replace('{ObjectType}', pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE]));
                                    else
                                        return self.SetError(xhr, Localization.DrilldownErrorPrimaryDataNotUnique.replace('{ID}', pkData[enumHandlers.PRIMARYFIELDS.ID]).replace('{ObjectType}', pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE]));
                                }
                            })
                            .fail(function (xhr, status) {
                                // custom error
                                self.ApplyError();
                                if (status === null)
                                    errorHandlerModel.ShowCustomError(xhr.responseText);
                            })
                            .done(function () {
                                // load domains & sources
                                modelFieldsHandler.LoadFieldsMetadata(source.data)
                                    .done(function () {
                                        updateAsyncSourceField(e, source.data);
                                    });
                            });
                    }
                });

                // fixed virtual scrollbar bug
                var verticalScroll = e.sender.virtualScrollable;
                clearTimeout(fnCheckScrolling);
                fnCheckScrolling = setTimeout(function () {
                    var lastItem, dataItems, lastDataItem;

                    if (verticalScroll) {
                        lastItem = Math.floor(((verticalScroll._scrollbarTop || 0) + verticalScroll.verticalScrollbar.height()) / verticalScroll.itemHeight);
                        dataItems = verticalScroll.dataSource.data();
                        lastDataItem = dataItems[Math.min(verticalScroll.dataSource.take(), dataItems.length) - 1];
                        if (lastDataItem && (lastItem < lastDataItem[enumHandlers.GENERAL.ROWID] - 5 || lastItem > lastDataItem[enumHandlers.GENERAL.ROWID] + 5)) {
                            verticalScroll.verticalScrollbar.trigger('scroll');
                        }
                    }
                }, 500);

                progressbarModel.EndProgressBar();
            },
            scrollable: {
                virtual: true
            },
            pageable: false,
            selectable: 'cell'
        }).data(enumHandlers.KENDOUITYPE.GRID);

        dataSource.read();
        progressbarModel.EndProgressBar();

        if (grid.options.resizable) {
            // disable kendo autofit
            grid._autoFitLeafColumn = jQuery.noop;

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

        var virtualScroll = grid.content.data('kendoVirtualScrollable');
        if (!!jQuery.browser.msie) {
            grid.content
            .off('mousewheel.iefix')
            .on('mousewheel.iefix', function (e) {
                if (!grid.content.find('.k-loading-mask').length) {
                    virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                }
            });
        }

        var xStart = 0, yStart = 0, currentScrollTop, fnCheckTouchEvent;
        grid.wrapper
            .on('touchstart.drilldown', '.k-grid-content', function (e) {
                currentScrollTop = grid.virtualScrollable._scrollbarTop;
                xStart = e.originalEvent.touches[0].screenX;
                yStart = e.originalEvent.touches[0].screenY;
            })
            .on('touchend.drilldown', '.k-grid-content', function (e) {
                clearTimeout(fnCheckTouchEvent);
                var checkScrollTop = currentScrollTop > 0 && currentScrollTop === grid.virtualScrollable._scrollbarTop;
                var checkTouchMoved = Math.abs(xStart - Math.abs(e.originalEvent.changedTouches[0].screenX)) > 50
                                    || Math.abs(yStart - Math.abs(e.originalEvent.changedTouches[0].screenY)) > 50;
                if (checkScrollTop && !grid.dataSource._requestInProgress && checkTouchMoved) {
                    fnCheckTouchEvent = setTimeout(function () {
                        grid.dataSource.read();
                    }, 1000);
                }
            });

        // tooltip
        self.InitialGridCellTooltip();
    };
    self.GetSingleDrilldownColumns = function () {
        var singleDrilldownColumns = [
            {
                field: enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.ROWID,
                headerTemplate: '',
                locked: true,
                headerAttributes: {
                    'class': 'Number'
                },
                attributes: {
                    'class': 'Number'
                },
                width: listHandler.FirstColumnWidth
            },
            {
                field: 'id',
                width: 42,
                attributes: {
                    'class': 'column1'
                },
                template: fieldsChooserModel.GetIsStarredColumnTemplate,
                headerTemplate: self.GetHeaderTemplate('starred', '')
            },
            {
                field: 'category',
                width: 42,
                attributes: {
                    'class': 'column2'
                },
                template: fieldsChooserModel.GetCategoryColumnTemplate,
                headerTemplate: self.GetHeaderTemplate('category', '')
            },
            {
                field: enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE,
                template: '#= ' + enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE + ' #',
                headerTemplate: self.GetHeaderTemplate('source', Localization.Source),
                width: 125
            },
            {
                field: enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.NAME,
                template: self.GetCellNameTemplate(),
                headerTemplate: self.GetHeaderTemplate('name', Localization.Field),
                width: 235
            },
            {
                field: enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.VALUE,
                template: self.GetTemplateCellData,
                headerTemplate: '<div class="DisplayAvaliablePropertiesHeaderGrid">' + Localization.Value + '</div>',
                width: 235
            }
        ];

        if (userSettingModel.GetByName(enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER)) {
            var techInfoColumn = {
                field: enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.TECHNINFO,
                headerTemplate: self.GetHeaderTemplate('tech_info', Localization.TechnicalInfo),
                width: 235
            };
            singleDrilldownColumns.push(techInfoColumn);
        }

        return singleDrilldownColumns;
    };
    self.GetCellNameTemplate = function () {
        return '# if (' + enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.NAME + ') { #'
                + '#= ' + enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.NAME + ' #'
                + '#} else {#'
                + '#= ' + enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.ID + ' #'
                + '# } #';
    };
    self.GetTemplateCellData = function (data) {
        var template = listHandler.GetTemplateCellData(data, enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.VALUE);
        return kendo.template(template).call(this, data);
    };
    self.InitialGridCellTooltip = function () {
        WC.HtmlHelper.Tooltip.Create('listdrilldown', '#ListDrilldownGrid td');
    };

    self.SetFacetFilter = function (facets) {
        self.FacetModel.SetFacetFilter(facets);
    };
    self.FilterFacet = function () {
        self.RequestingSourceUri = [];
        self.RequestingDomainUri = [];
        WC.Ajax.AbortAll();
        self.FacetModel.Filter();
    };
    self.GetDataRows = function (rows, rowNumber) {
        var datarows = [], source;
        jQuery.each(rows, function (index, row) {
            datarows[index] = row;
            listHandler.ColumnInfo[row.id.toLowerCase()] = row;

            // reset property
            jQuery.each(enumHandlers.LISTDRILLDOWNDISPLAYFIELDS, function (key, field) {
                if (field === enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.ROWID) {
                    row[field] = rowNumber;
                }
                else if (field === enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCE && row.source) {
                    source = modelFieldSourceHandler.GetFieldSourceByUri(row.source);
                    if (!source) {
                        row[field] = self.TextSourceLoading;
                        row[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCETITLE] = self.TextSourceLoading;
                    }
                    else {
                        row[field] = source.short_name || source.long_name || source.id;
                        row[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.FIELDSOURCETITLE] = source.long_name || source.id;
                    }
                }
                else if (field === enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.VALUE) {
                    row[field] = self.TextLoading;
                }
                if (typeof row[field] === 'undefined') {
                    row[field] = '';
                }
                datarows[index][field] = row[field];
            });
            rowNumber++;
        });
        return datarows;
    };
    self.SetDataValues = function (dataRows, data) {
        var value;
        jQuery.each(dataRows.data, function (k, v) {
            value = data[k];

            // check null value
            if (value === null) {
                value = '';
            }
            v[enumHandlers.LISTDRILLDOWNDISPLAYFIELDS.VALUE] = value;
        });
    };
    self.SetError = function (xhr, message) {
        xhr.responseText = message;
        return jQuery.Deferred().reject(xhr, null, null).promise();
    };
    self.ApplyError = function () {
        popup.CloseAll();
        popup.OnCloseCallback = function () {
            window.location.replace(WC.Utility.GetAnglePageUri(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE), WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.DISPLAY)));
        };
    };
    self.InitialContextMenu = function () {

        jQuery(document.body).off('.jeegoocontext');
        jQuery('#listDrilldownContextMenu').remove();
        jQuery('<ul id="listDrilldownContextMenu" class="context-menu-list" />').appendTo('body');

        jQuery('#ListDrilldownGrid .k-grid-content td:not(.column1,.column2)').jeegoocontext('listDrilldownContextMenu', {
            autoAddSubmenuArrows: false,
            ignoreWidthOverflow: true,
            ignoreHeightOverflow: true,
            submenuTopOffset: -30,
            event: 'click',
            fadeIn: 0,
            delay: 0,
            keyDelay: 500,
            onShow: function (e, context) {
                var menu = jQuery(this);
                var grid = jQuery('#ListDrilldownGrid').data(enumHandlers.KENDOUITYPE.GRID);

                grid.select(context);

                if (jQuery(context).hasClass('Number')) {
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
            },
            onHover: function () {
                if (jQuery(this).hasClass('context-menu-submenu')) {
                    var self = this;
                    setTimeout(function () {
                        var parent = jQuery(self).parent('ul'),
                            subMenu = jQuery('> ul', self),
                            subMenuWidth = subMenu.width() + 2;
                        if (subMenuWidth + parent.width() + parent.offset().left > WC.Window.Width) {
                            subMenu.css('left', -1 * subMenuWidth);
                        }
                    }, 1);
                }
            },
            onSelect: function () {
                if (jQuery(this).hasClass('context-menu-submenu') || jQuery(this).hasClass('disabled')) {
                    return false;
                }

                menuOptions.callback(jQuery(this).attr('name'));
            }
        });
    };
    self.CreateContextMenu = function () {
        return {
            callback: function (key) {
                if (key === 'copy') {
                    var contentText = jQuery.trim(jQuery('#ListDrilldownGrid').data(enumHandlers.KENDOUITYPE.GRID).select().text());
                    if (window.clipboardData) {
                        window.clipboardData.setData('Text', contentText);
                        popup.Info(Localization.Info_SelectedTextAlreadyCopied);
                    }
                    else {
                        prompt(Localization.Info_PleaseUseTextBelowToCopy, contentText);
                    }
                }
            },
            items: {
                copy: {
                    name: Localization.CellPopupMenuCopy,
                    icon: 'copy'
                }
            }
        };
    };
    self.HideContextMenu = function () {
        listHandler.HideContextMenu();
    };
    self.RenderContextMenu = function (id, menu) {
        listHandler.RenderContextMenu(id, menu);
    };
    self.GetHeaderTemplate = function (sortingId, headerText) {
        var sort = '';
        if (self.CurrentSort !== null && self.CurrentSort.sort.indexOf(sortingId) !== -1) {
            sort = self.CurrentSort.dir;
        }
        return '<a class="DisplayAvaliablePropertiesHeaderGrid ' + sort + '"  id="' + sortingId + '" onclick="listDrilldownHandler.Sort(this)"> ' + headerText + ' </a>';
    };
    self.Sort = function (target) {

        var targetId = jQuery(target).attr('id'), sortId;

        if (targetId !== '') {
            var defaultDir = targetId === 'starred' ? 'desc' : 'asc';
            var sortOptions = jQuery.grep(self.SortingList, function (element) {
                return element.id === targetId.toLowerCase();
            });
            if (targetId === 'starred') {
                var sortSuggestedOptions = jQuery.grep(self.SortingList, function (element) {
                    return element.id.indexOf('suggested') !== -1;
                });
                if (sortSuggestedOptions.length) {
                    sortOptions.push(sortSuggestedOptions[0]);
                }
            }

            if (sortOptions.length) {
                sortId = jQuery.map(sortOptions, function (sortOption) { return sortOption.id; }).join(',');

                if (self.CurrentSort !== null && sortId === self.CurrentSort.sort) {
                    self.CurrentSort = { sort: sortId, dir: self.CurrentSort.dir === 'asc' ? 'desc' : 'asc' };
                }
                else {
                    self.CurrentSort = { sort: sortId, dir: defaultDir };
                }
            }

            self.Render(self.PKData, true);
        }
        else {
            popup.Info(Localization.Info_Title, Localization.NotImplement);
        }
    };
    self.GetSortQuery = function () {
        if (self.CurrentSort === null) {
            self.CurrentSort = { sort: "name", dir: "asc" };
        }
        return self.CurrentSort;
    };
    /*EOF: Model Methods*/
}
