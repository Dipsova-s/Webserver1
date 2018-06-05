(function (win) {

    var modelServerInfo = {
        modelServerInfoId: '#ModelServerInfo',
        reportSectionId: '#ReportSection',
        reportPageId: '#popupClassReport',
        fnCheckInfo: null,
        fnCheckMenuClick: null,
        fnCheckResizePopup: null,
        REFRESH_TIMEOUT: 10000,
        REPORT_FIELD_TYPES: {
            TEXT: 'text',
            INT: 'int',
            FLOAT: 'float',
            BOOL: 'bool',
            TIME: 'time'
        },
        KENDO_FIELD_TYPES: {
            TEXT: 'string',
            INT: 'number',
            FLOAT: 'number',
            BOOL: 'boolean',
            TIME: 'date'
        },
        showInfoPopup: function (e, obj) {
            var win = $('#popupModelServer').data('kendoWindow');
            if (win && !win.__bind_close_event) {
                win.__bind_close_event = true;
                win.bind('close', function () {
                    $('#popupModelServer').removeClass('popupError');
                    $('#ModelServerInfo').html('');
                    MC.ajax.abortAll();
                    clearTimeout(MC.util.modelServerInfo.fnCheckInfo);
                });
                win.bind('resize', function () {
                    clearTimeout(MC.util.modelServerInfo.fnCheckResizePopup);
                    MC.util.modelServerInfo.fnCheckResizePopup = setTimeout(function () {
                        MC.util.modelServerInfo.updateLayout();
                    }, 100);
                });
            }

            obj = $(obj);

            var callbackFunction = obj.data('callback');
            var infoData = obj.data('parameters');

            $('#popupModelServer').data({
                'server-info-url': infoData.modelServerUri,
                'server-info-is-current': infoData.isCurrentInstance,
                'callback': MC.util.getController(callbackFunction)
            });

            $('#ModelServerInfo').empty();
            setTimeout(function () {
                MC.util.modelServerInfo.loadInfoHtml();
            }, 100);

            MC.util.preventDefault(e);
        },
        loadInfoHtml: function () {
            MC.ajax.abortAll();
            clearTimeout(MC.util.modelServerInfo.fnCheckInfo);

            MC.ui.popup('requestStart');

            var self = this;
            var deferred = $.Deferred();
            var data = $('#popupModelServer').data();

            MC.ajax.request({
                url: data.serverUrl,
                parameters: "modelServerUri=" + data['server-info-url'] + "&isCurrentInstance=" + data['server-info-is-current'],
                type: 'GET'
            })
            .done(function (data, status, xhr) {
                $('#ModelServerInfo').html(data);

                deferred.resolve(data, status, xhr);
            })
            .fail(function (xhr, status, error) {
                self.showAjaxErrorDetail(xhr, status, error, deferred, self.modelServerInfoId);
            })
            .always(function () {
                if ($('#ModelServerInfo .btnRetry').length) {
                    $('#popupModelServer').addClass('popupError');

                    $('#ModelServerInfo .btnRetry').click(function () {
                        MC.util.modelServerInfo.loadInfoHtml();
                    });
                }
                else {
                    $('#popupModelServer').removeClass('popupError');

                    var treeview = $('#ServerStatusMenu').data('kendoTreeView');
                    if (treeview) {
                        treeview.wrapper.on('click', '.k-item', function (e) {
                            e.stopPropagation();

                            var item = $(this);
                            if (item.find('.k-plus,.k-minus').length) {
                                treeview.toggle(item);
                            }
                            treeview.trigger('select');
                        });
                    }

                    $('#ModelServerInfo').kendoSplitter({
                        panes: [
                            { collapsible: true, min: '100px', size: '365px' },
                            { collapsible: false }
                        ]
                    });
                    $('#ModelServerInfo').removeClass('compact');

                    if ($('#ServerStatusMenu .k-item').length > 1) {
                        MC.util.modelServerInfo.setPanelState('expand');
                    }
                    else {
                        MC.util.modelServerInfo.setPanelState('collapse');
                        $('#ModelServerInfo').addClass('compact');
                    }

                    MC.util.modelServerInfo.showReportInfo();
                }

                setTimeout(function () {
                    MC.ui.popup('requestEnd');
                }, 100);
            });

            deferred.promise();
        },
        killSapJobs: function (button, isRetries) {
            button = $(button);
            if (button.hasClass('disabled')) {
                return;
            }
                
            var modelServerUrl = $('#ModelServerUri').val();
            var killSapJobsUrl = $('#KillSapJobsUri').val();

            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: killSapJobsUrl,
                type: 'POST',
                parameters: {
                    modelServerUri: modelServerUrl,
                    body: JSON.stringify({ with_retries: isRetries })
                }
            })
            .always(function () {
                setTimeout(function () {
                    MC.util.modelServerInfo.showReportInfo();
                }, 3000);
            });
		},
		getPopupTitle: function (type) {
			if (type === 'ModelServer')
				return Localization.MC_ModelServer;
			else if (type === 'Extractor')
				return Localization.MC_EAXtractor;
			else
				return type;
		},
        showReport: function (e) {
            clearTimeout(MC.util.modelServerInfo.fnCheckMenuClick);
            MC.util.modelServerInfo.fnCheckMenuClick = setTimeout(function () {
                var data = e.sender.dataSource.getByUid(e.sender.current().data('uid'));
                if (data.text === Localization.MC_Status) {
                    MC.util.modelServerInfo.showReportInfo();
                }
                else if (e.sender.current().data('url')) {
                    MC.util.modelServerInfo.showReportServer(e);
                }
            }, 10);
        },
        showReportInfo: function () {
            var self = this;
            var deferred = $.Deferred();
            var infoData = $('#popupModelServer').data();
            var uri = infoData['server-info-url'];
            var isCurrentInstance = infoData['server-info-is-current'];
            var callback = infoData['callback'];

            clearTimeout(MC.util.modelServerInfo.fnCheckInfo);
            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: infoData.infoUrl,
                parameters: "modelServerUri=" + uri + "&isCurrentInstance=" + isCurrentInstance,
                type: 'GET'
            })
            .done(function (data, status, xhr) {
                $(self.reportSectionId).html(data);
                deferred.resolve(data, status, xhr);
            })
            .fail(function (xhr, status, error) {
                self.showAjaxErrorDetail(xhr, status, error, deferred, self.reportSectionId);
            })
            .always(function () {
                if ($(self.reportSectionId + ' .btnRetry').length) {
                    $(self.reportSectionId).addClass('popupError');

                    $(self.reportSectionId + ' .btnRetry').click(function () {
                        MC.util.modelServerInfo.showReportInfo();
                    });
                }
                else {
                    var columns = [
                            {
                                field: 'progress',
                                width: 200,
                                attributes: { 'class': 'columnNumber noTooltip' },
                                template: function (data) {
                                    var ui = $('<div/>').kendoProgressBar({
                                        min: 0,
                                        max: 1,
                                        value: data.progress,
                                        type: "percent"
                                    });
                                    return $('<div/>').html(ui).html();
                                }
                            },
                            {
                                field: 'total',
                                width: 50,
                                attributes: { 'class': 'columnNumber' }
                            },
                            {
                                field: 'busy',
                                width: 50,
                                attributes: { 'class': 'columnNumber' }
                            },
                            {
                                field: 'todo',
                                width: 50,
                                attributes: { 'class': 'columnNumber' }
                            },
                            {
                                field: 'done',
                                width: 50,
                                attributes: { 'class': 'columnNumber' }
                            },
                            {
                                field: 'replaceTables'
                            },
                            {
                                field: 'action',
                                width: 220,
                                attributes: { 'class': 'noTooltip' }
                            }
                    ];
                    $(self.reportSectionId).removeClass('popupError');
                    $('#ModelServerInfo table#ExtractingTables').kendoGrid({
                        columns: columns,
                        scrollable: true
                    });
                    $('#ModelServerInfo table:not(#ExtractingTables)').kendoGrid({
                        columns: columns.slice(0, columns.length - 1),
                        scrollable: true
                    });
                }

                var callbackData = $('#ModelServerInfoData').data('callback');
                if (typeof callbackData !== 'object') {
                    callbackData = {
                        id: '',
                        uri: uri,
                        status: 'down'
                    };
                }
                if (typeof callback === 'function') {
                    callback(callbackData);
                }

                setTimeout(function () {
                    MC.ui.popup('requestEnd');
                    MC.util.modelServerInfo.fnCheckInfo = setTimeout(function () {
                        MC.util.modelServerInfo.showReportInfo();
                    }, MC.util.modelServerInfo.REFRESH_TIMEOUT);
                }, 100);
            });

            return deferred.promise();
        },
        findWidthReportServer: function (data) {
            var maxwidthlist = [];
            for (var i = 0; i < data.reports.length; i++) {
                var fieldsArray = [];
                var fieldsLength = data.reports[i].fields.length;

                fieldsArray.length = fieldsLength;
                maxwidthlist.push([]);
                maxwidthlist[i].push(fieldsArray);

                for (var j = 0; j < fieldsLength; j++) {
                    var width = 0;
                    var maxWidth = 0;
                    for (var k = 0; k < data.reports[i].rows.length; k++) {
                        width = data.reports[i].rows[k].field_values[j] == null ? 0 : data.reports[i].rows[k].field_values[j].toString().length;
                        if (width > maxWidth) {
                            maxWidth = width;
                        }
                    }

                    if (maxWidth >= data.reports[i].fields[j].title.length)
                        width = maxWidth;
                    else
                        width = data.reports[i].fields[j].title.length;


                    maxwidthlist[i][j] = (width + 3) * 7;
                }
            }

            return maxwidthlist;
        },
        showReportServer: function (e) {
            var self = this;
            var deferred = $.Deferred();
            MC.ajax.abortAll();
            clearTimeout(MC.util.modelServerInfo.fnCheckInfo);

            var reportUri = e.sender.current().data('url');
            var infoData = $('#popupModelServer').data();
            var modelServerUri = infoData['server-info-url'];
            var className = $("#ServerStatusMenu_tv_active > div > span").html();
            $("#popupModelServer_wnd_title").html(className);

            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: infoData.reportUrl,
                parameters: {
                    modelServerUri: modelServerUri,
                    reportUri: reportUri
                },
                type: 'GET'
            })
            .done(function (reportInfo, status, xhr) {
                var objectParameters = self.createReportObjectParameters(reportInfo, reportUri, infoData, modelServerUri, className);
                self.createReportGridData(objectParameters);
                deferred.resolve(reportInfo, status, xhr);
            })
            .fail(function (xhr, status, error) {
                self.showAjaxErrorDetail(xhr, status, error, deferred, self.reportSectionId);
            })
            .always(function () {
                clearTimeout(MC.util.modelServerInfo.fnCheckInfo);

                if ($(self.reportSectionId + ' .btnRetry').length) {
                    $(self.reportSectionId).addClass('popupError');

                    $(self.reportSectionId + ' .btnRetry').on('click', { evt: e }, function (e) {
                        MC.util.modelServerInfo.showReportServer(e.data.evt);
                    });
                }
                else {
                    $(self.reportSectionId).removeClass('popupError');
                }

                setTimeout(function () {
                    var win = $('#popupModelServer').data('kendoWindow');
                    if (win) {
                        win.trigger('resize');
                    }

                    MC.ui.popup('requestEnd');
                }, 100);
            });

            return deferred.promise();
        },
        createReportGridData: function (objectParameters) {
            var self = this;
            var reportInfo = objectParameters.reportInfo;
            var reports = reportInfo.reports;

            var tabContainerElement = jQuery('<div class="tab" data-role="tab" data-callback="MC.util.modelServerInfo.tabChanged"></div>');
            var tabNavElement = jQuery('<div class="tabNav" id="tabNav"></div>');

            tabContainerElement.append(tabNavElement);
            jQuery(self.reportSectionId).html(tabContainerElement);

            jQuery.each(reports, function (reportIndex, reportData) {
                var tabName = reportData.title;
                var tabId = tabName.replace(/\W+/g, '');
                var reportFields = reportData.fields;

                var datasource = self.getKendoDatasourceByReportData(reportData);
                var fieldsModelSchema = self.getKendoFieldsModelSchemaByReportData(tabName, reportFields);
                var columnsDefination = self.getKendoColumnsDefinationByReportData(reportIndex, reportInfo, reportData, reportFields);

                var reportGridUrl = self.getReportGridUrl(tabId, tabName, objectParameters);
                var activeClassname = reportIndex === 0 ? 'class="active"' : '';
                var tabPanelElement = jQuery('<div class="tabPanel ' + tabId + '"></div>');
                var tabGridElement = jQuery('<div id="tab' + tabId + '"></div>');
                var tabUrlElement = kendo.format('<a id="{0}" {1} href="{2}"><span class="newWindow"></span>{3}</a>', tabId, activeClassname, reportGridUrl, tabName);

                tabNavElement.append(tabUrlElement);
                tabContainerElement.append(tabPanelElement);
                tabPanelElement.append(tabGridElement);
                self.initializeReportGrid(tabId, datasource, fieldsModelSchema, columnsDefination);
            });

            self.createFilterTextboxOnReportGrid(self.reportSectionId);
            self.addEventOnClickToReportTab();
        },
        createReportObjectParameters: function (reportInfo, reportUri, infoData, modelServerUri, className) {
            return {
                reportInfo: reportInfo,
                reportUri: reportUri,
                infoData: infoData,
                modelServerUri: modelServerUri,
                className: className
            };
        },
        getReportGridUrl: function (tabId, tabName, objectParameters) {
            var urlQueryParameters = {
                classes: jQuery('#ServerStatusMenu_tv_active > div > span').html(),
                tabs: tabId,
                reportUri: objectParameters.reportUri,
                modelreportUri: objectParameters.infoData.reportUrl,
                modelserverUri: objectParameters.modelServerUri,
                title: kendo.format('{0} - {1}', objectParameters.className, tabName)
            };
            var reportTableUrl = kendo.format('{0}?{1}', webModelClassReportUrl, jQuery.param(urlQueryParameters));
            return reportTableUrl;
        },
        getKendoFormatValueByReportFieldType: function (fieldData) {
            // kendo format documentation
            // url : https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.format
            var self = this;
            var valueFormat = '';
            switch (fieldData.type) {
                case self.REPORT_FIELD_TYPES.TIME:
                    valueFormat = kendo.format('HH:mm:ss{0}', fieldData.showmsecs ? '.fff' : '');
                    break;
                case self.REPORT_FIELD_TYPES.FLOAT:
                    valueFormat = typeof fieldData.decimals === 'number' ? kendo.format('n{0}', fieldData.decimals) : '';
                    break;
                default:
                    break;
            }
            return valueFormat;
        },
        getKendoFormatColumnValueByReportFieldType: function (fieldData) {
            // kendo format documentation
            // url : https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.format
            var self = this;
            var columnFormat = '';
            var valueFormat = self.getKendoFormatValueByReportFieldType(fieldData);
            columnFormat = valueFormat ? '{0:' + valueFormat + '}' : '{0}';
            return columnFormat;
        },
        getKendoFieldsModelSchemaByReportData: function (tabName, reportFields) {
            var self = this;
            var kendoFieldsModelSchema = {};
            var fieldsArray = MC.util.toArray(reportFields);
            jQuery.each(fieldsArray, function (fieldIndex, reportField) {
                var fieldTitle = self.parseReportFieldTitle(reportField.title);
                kendoFieldsModelSchema[fieldTitle] = {
                    type: self.convertMAFieldTypeToKendoFieldType(reportField.type),
                    nullable: true
                };
            });
            return kendoFieldsModelSchema;
        },
        getKendoColumnsDefinationByReportData: function (reportIndex, reportInfo, reportData, reportFields) {
            var self = this;
            var columnsDefination = [];
            var columnsWidth = MC.util.modelServerInfo.findWidthReportServer(reportInfo);
            var fieldsArray = MC.util.toArray(reportFields);
            jQuery.each(fieldsArray, function (fieldIndex, field) {
                var columnAttributes = {
                    style: kendo.format('text-align:{0}', field.alignment || 'right')
                };
                var columnDefination = {
                    title: field.title,
                    field: self.parseReportFieldTitle(field.title),
                    type: self.convertMAFieldTypeToKendoFieldType(field.type),
                    format: self.getKendoFormatColumnValueByReportFieldType(field),
                    width: columnsWidth[reportIndex][fieldIndex],
                    attributes: columnAttributes,
                    headerAttributes: columnAttributes,
                    footerAttributes: columnAttributes,
                    footerTemplate: self.getKendoFooterTemplateByReportData(reportData, fieldIndex, field)
                };
                columnsDefination.push(columnDefination);
            });
            return columnsDefination;
        },
        getKendoFooterTemplateByReportData: function (reportData, fieldIndex, field) {
            var self = this;
            var footerTemplate = '';
            var aggregations = MC.util.toArray(reportData.aggregations);
            if (field.aggregation && aggregations[fieldIndex]) {
                var fieldValue = self.convertFieldValueByReportFieldType(field.type, aggregations[fieldIndex]);
                var kendoFormat = self.getKendoFormatValueByReportFieldType(field);
                footerTemplate = kendo.toString(fieldValue, kendoFormat);
            }
            return footerTemplate;
        },
        getKendoDatasourceByReportData: function (reportData) {
            var self = this;
            var datasource = [];
            var rowsArray = MC.util.toArray(reportData.rows);
            jQuery.each(rowsArray, function (rowIndex, row) {
                var dataItem = {};
                var fieldValues = MC.util.toArray(row.field_values);
                jQuery.each(fieldValues, function (fieldIndex, fieldValue) {
                    var fieldData = reportData.fields[fieldIndex];
                    var fieldTitle = self.parseReportFieldTitle(fieldData.title);
                    var fieldType = fieldData.type;
                    dataItem[fieldTitle] = self.convertFieldValueByReportFieldType(fieldType, fieldValue);
                });
                datasource.push(dataItem);
            });
            return datasource;
        },
        parseReportFieldTitle: function (fieldTitle) {
            return fieldTitle.replace(/\W+/g, '');
        },
        convertMAFieldTypeToKendoFieldType: function (fieldType) {
            var self = this;
            var kendoFieldType = self.KENDO_FIELD_TYPES[fieldType.toUpperCase()] || self.KENDO_FIELD_TYPES['TEXT'];
            return kendoFieldType;
        },
        convertFieldValueByReportFieldType: function (fieldType, fieldValue) {
            var self = this;
            if (fieldType === self.REPORT_FIELD_TYPES.TIME) {
                fieldValue = MC.util.unixtimeToTimePicker(fieldValue, false);
            }
            else {
                fieldValue = '' + fieldValue;
            }
            return fieldValue;
        },
        initializeReportGrid: function (tabId, datasource, fieldsModelSchema, columnsDefination) {
            jQuery('#tab' + tabId).kendoGrid({
                dataSource: {
                    data: datasource,
                    pageSize: 40,
                    schema: {
                        model: {
                            fields: fieldsModelSchema
                        }
                    }
                },
                sortable: {
                    mode: 'single',
                    allowUnsort: false
                },
                height: '350px',
                resizable: true,
                scrollable: { virtual: true },
                columns: columnsDefination
            });
        },
        createFilterTextboxOnReportGrid: function (elementId) {
            jQuery(elementId).prepend('<div class="gridToolbar gridToolbarTop">'
                + '<div class="gridToolbarFilter">'
                    + '<input type="text" id="ReportGridFilterBox" placeholder="Filter" data-role="gridfilter" data-method="local" data-target="' + elementId + ' .k-grid:visible"><span class="icon"></span>'
                + '</div>'
            + '</div>');
            MC.ui.gridfilter('#ReportGridFilterBox');
        },
        addEventOnClickToReportTab: function () {
            var self = this;
            jQuery(self.reportSectionId + ' .tabNav > a').on('click', function (e) {
                if (jQuery(e.target).hasClass('newWindow')) {
                    var url = $(e.currentTarget).attr('href');
                    window.open(url, '_blank');
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
        },
        showReportServerClasses: function (objectParameters) {
            var self = this;
            var popupTitleId = '#popupTitleClassReport';
            var resizeEventName = 'resize.classreport';
            var tabId = 'ClassReport';

            MC.ajax.request({
                url: objectParameters.modelreportUri,
                parameters: {
                    modelServerUri: objectParameters.modelserverUri,
                    reportUri: objectParameters.reportUri
                },
                type: 'GET'
            })
            .done(function (reportInfo) {
                if (typeof reportInfo === 'string') {
                    return false;
                }

                jQuery.each(reportInfo.reports, function (reportIndex, reportData) {
                    var fieldTitle = self.parseReportFieldTitle(reportData.title);
                    if (fieldTitle === objectParameters.tabs) {
                        var reportFields = reportData.fields;
                        var popupTitleText = kendo.format('{0} - {1}', objectParameters.classes.replace('_', ''), fieldTitle);
                        var datasource = self.getKendoDatasourceByReportData(reportData);
                        var fieldsModelSchema = self.getKendoFieldsModelSchemaByReportData(fieldTitle, reportFields);
                        var columnsDefination = self.getKendoColumnsDefinationByReportData(reportIndex, reportInfo, reportData, reportFields);
                        self.initializeReportGrid(tabId, datasource, fieldsModelSchema, columnsDefination);
                        jQuery(popupTitleId).text(popupTitleText);
                    }
                });

                self.createFilterTextboxOnReportGrid(self.reportPageId);

                jQuery(window).off(resizeEventName).on(resizeEventName, function () {
                    var kendoGridContainer = jQuery('.k-grid');
                    // 140 is a magic number
                    kendoGridContainer.height(MC.util.window.height - 140);
                    kendo.resize(kendoGridContainer);
                }).trigger('resize');

                setTimeout(function () {
                    jQuery(self.reportPageId).css('opacity', 1);
                    jQuery(window).trigger('resize');
                }, 1000);
            });
        },
        setPanelState: function (state) {
            var splitter = $('#ModelServerInfo').data('kendoSplitter');
            if (splitter) {
                splitter[state]('.k-pane:first');
            }
        },
        tabChanged: function () {
            $("#ReportGridFilterBox").data('defaultValue', $.now()).trigger('keyup');
        },
        updateLayout: function () {
            var self = this;
            var reportTable = $(self.reportSectionId + ' .tab .k-grid:visible');
            if (reportTable.length) {
                var reportTableHeight = $(self.reportSectionId).height() - (reportTable.offset().top - $(self.reportSectionId).offset().top) - 20;
                reportTable = $(self.reportSectionId + ' .tab .k-grid');
                reportTable.height(reportTableHeight);
                kendo.resize(reportTable, true);
            }
        },
        showAjaxErrorDetail: function (xhr, status, error, deferred, elementId) {
            MC.ajax.setErrorDisable(xhr, status, error, deferred);
            var errorMessage = MC.ajax.getErrorMessage(xhr, null, error);
            var errorMessageTemplate = kendo.format('{0}<a class="btn btnPrimary btnRetry">{1}</a>', errorMessage, Localization.Retry);
            $(elementId).html(errorMessageTemplate);
        }
    };

    win.MC.util.modelServerInfo = modelServerInfo;

})(window);