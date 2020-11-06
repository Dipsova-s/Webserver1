(function (win) {
    var _self = {};
    _self.selectingRowData = { uid: null, dir: null, enable: true };
    _self.getLogDetailsXhr = null;
    _self.lastLogFile = '';
    _self.logDetailCache = {};
    _self.MSGTPYE = ['Info', 'Note', 'Warning', 'Error', 'Exception', 'Reminder', 'CheckPoint', 'Level1', 'Level2', 'Level3', 'Level4', 'Level5', 'Level6', 'Level7', 'Enter', 'Exit', 'Timing'];
    _self.SystemLogColumns = [
        {
            field: 'MsgType',
            title: ' ',
            width: 30,
            headerAttributes: { 'class': 'gridColumnCentered' },
            attributes: { 'class': 'gridColumnCentered logType' },
            template: '<span data-tooltip-title="#= MsgType #" class="#= MsgType #"></span>'
        },
        {
            field: 'ProcessID',
            title: 'PID',
            width: 50,
            headerAttributes: { 'class': 'columnNumber' },
            attributes: { 'class': 'columnNumber' }
        },
        {
            field: 'TimeStamp',
            title: 'Date',
            width: 135,
            headerAttributes: { 'class': 'columnDate' },
            attributes: { 'class': 'columnDate' },
            template: '#= TimeStamp.Date + \' \' + TimeStamp.Time #'
        },
        {
            field: 'ThreadName',
            title: 'Thread',
            width: 55
        },
        {
            field: 'MsgText',
            title: 'Message'
        }
    ];
    _self.EventLogColumns = [
        {
            field: 'level',
            title: ' ',
            width: 30,
            headerAttributes: { 'class': 'gridColumnCentered' },
            attributes: { 'class': 'gridColumnCentered logType' },
            template: '<span data-tooltip-title="#= level #" class="#= level #"></span>'
        },
        {
            field: 'action',
            title: 'Action',
            width: 135
        },
        {
            field: 'id',
            title: 'ID',
            width: 50,
            headerAttributes: { 'class': 'columnNumber' },
            attributes: { 'class': 'columnNumber' }
        },
        {
            field: 'result',
            title: 'Result',
            width: 55
        },
        {
            field: 'timestamp',
            width: 135,
            headerAttributes: { 'class': 'columnDate' },
            headerTemplate: '<span data-tooltip-title=\"MC.util.getTimezoneText\">Date (<span data-role=\"timezoneinfo\"></span>)</span>',
            attributes: { 'class': 'columnDate' },
            template: '<span data-role=\'localize\' data-type=\'servertime\'>#= timestamp #</span>'
        },
        {
            field: 'category',
            title: ' ',
            width: 50,
            headerAttributes: { 'class': 'columnNumber' },
            attributes: { 'class': 'columnNumber' }
        },
        {
            field: 'category_description',
            title: ' ',
            template: '{#= category #}' + ' #= category_description #'
        }
    ];

    var logpopup = {
        SelectedRow: '',
        GetLogUri: '',
        GetLogDetailUri: '',
        TaskHistoryUri: '',
        Target: '',
        LogType: '',
        LogFullPath:''
    };
    logpopup.LogFileCheck = function (fullPath) {
        return fullPath.match('log$');
    };
    logpopup.ShowLogHideGrid = function (flag) {
        if (flag) {
            $('#LogFileDetails .logDetails').busyIndicator(true);
            $('#popupLogTable .contentSectionGrid').hide();
            $('#popupLogTable .contentSectionLog').show();
        }
        else {
            $('#popupLogTable .contentSectionGrid').show();
            $('#popupLogTable .contentSectionLog').hide();
        }
    };
    logpopup.UpdateLogFileDetailsLayout = function (isLogFile) {
        if (isLogFile) {
            var padding = parseInt($('#LogFileDetails').css("padding-top"));
            var height = $('#popupLogTable .popupContent').height() - padding;
            var div = $('.LogViewNavigationButtons');
            var logViewButtonsHeight = div.height() + parseInt(div.css("margin-top")) + parseInt(div.css("margin-bottom"))+1;
            height = height - logViewButtonsHeight;
            $('#LogFileDetails .logDetails').css({ overflow: 'auto', height: height });
        }
    };

    logpopup.ShowLogTable = function (sender, correlation_id) {
        sender = $(sender);
        self.SelectedRow = '';
        $('#SystemLogDetails .logDetails').removeClass('fail').empty();
        $('#LogFileDetails .logDetails').removeClass('fail').empty();
        var fullPath = typeof correlation_id === 'undefined' ? $(sender).parent("div").parent("div").prev('input').val() : MC.ui.logpopup.TaskHistoryUri + '?correlation_id=' + correlation_id;
        MC.ui.logpopup.LogFullPath = fullPath;
        var win = $(sender.data('target')).data('kendoWindow');
        _self.isLogFile = MC.ui.logpopup.LogFileCheck(fullPath);

        if (win && !win.__bind_resize_event) {
            // initial window
            MC.util.disableMobileScroller(win);

            win.__bind_resize_event = true;
            win.bind('resize', function () {
                var toolbarSize = $('#popupLogTable .gridToolbarTop').hasClass('hidden') ? 0 : 44;
                $('#popupLogTable .gridContainer').height(win.element.height() - toolbarSize);

                kendo.resize($('#popupLogTable .gridContainer'));
                MC.ui.logpopup.UpdateLogFileDetailsLayout(_self.isLogFile);

                MC.ui.logpopup.UpdateLogDetailsLayout();
            });
            win.bind('minimize', function () {
                win.trigger('resize');
            });
            win.bind('maximize', function () {
                win.trigger('resize');
            });
            win.bind('close', function () {
                MC.ajax.abortAll();
                if (_self.isLogFile) {
                    $('#LogFileDetails .logDetails').html('');
                }
            });
        }

        // initial filter
        var ddlMsgType;
        if (MC.ui.logpopup.LogType === 'SystemLog') {
            var filterTextbox = $('#FilterLogTableTextbox');
            ddlMsgType = $('#FilterLogTableType').data('kendoDropDownList');
            if (!ddlMsgType) {
                var ddlMsgTypeData = _self.MSGTPYE.slice();
                ddlMsgTypeData.splice(0, 0, Localization.All);

                ddlMsgType = $('#FilterLogTableType').kendoDropDownList({
                    dataSource: ddlMsgTypeData,
                    valueTemplate: '<span class="#= data #"></span> #= data #',
                    template: '<span class="#= data #"></span> #= data #',
                    change: function () {
                        filterTextbox.removeData('defaultValue').trigger('keyup');
                    }
                }).data('kendoDropDownList');

                ddlMsgType.span.addClass('logType');
                $(ddlMsgType.items()).addClass('logType');
            }
        }

        // iniital splitter
        var splitter = $('#popupLogTable .gridContainer').data('kendoSplitter');
        if (!splitter) {
            $('#popupLogTable .gridContainer').kendoSplitter({
                orientation: 'vertical',
                panes: [
                    { collapsible: false, min: 100 },
                    { collapsible: false, min: 200, size: 300 }
                ],
                resize: function () {
                    var win = $('#popupLogTable').data('kendoWindow');
                    if (win) {
                        win.trigger('resize');
                    }
                }
            });
        }

        // initial grid
        var grid = MC.ui.logpopup.InitialLogGrid();
        MC.ui.logpopup.ShowLogHideGrid(_self.isLogFile);

        // log view scroll 
        $(".ScrollToBottom").addClass("disabled");
        $("#LogFileDetails, .logDetails").scroll(function () {
            var maxScrollHeight = $("#LogFileDetails .logDetails").prop("scrollHeight") - 630;
            var heightFromTop = $("#LogFileDetails .logDetails").scrollTop();
            if (heightFromTop < 25) {
                $(".ScrollToBottom").addClass("disabled");
            }
            else {
                $(".ScrollToBottom").removeClass("disabled");
            }
            if (heightFromTop < maxScrollHeight) {
                $(".ScrollToTop").removeClass("disabled");
            }
            else {
                $(".ScrollToTop").addClass("disabled");
            }
        });

        // Csl view scroll
        $("#SystemLogGrid .k-scrollbar").scroll(function () {
            var maxScrollHeight = $('#SystemLogGrid .k-scrollbar').prop("scrollHeight") - 244;
            var heightFromTop = $('#SystemLogGrid .k-scrollbar').scrollTop();
            if (heightFromTop < 20) {
                $(".ScrollToBottom").addClass("disabled");
            }
            else {
                $(".ScrollToBottom").removeClass("disabled");
            }
            if (heightFromTop < maxScrollHeight) {
                $(".ScrollToTop").removeClass("disabled");
            }
            else {
                $(".ScrollToTop").addClass("disabled");
            }
        });

        var setEnableLogPopup = function (enable) {
            if (enable) {
                grid.content.find('.k-grid-error').remove();
                if (ddlMsgType) {
                    ddlMsgType.enable(true);
                    filterTextbox.removeAttr('disabled').next().removeClass('iconLoading');
                }
            }
            else {
                grid.content.busyIndicator(false);
                if (ddlMsgType) {
                    ddlMsgType.enable(false);
                    filterTextbox.attr('disabled', 'disabled');
                }
            }
        };

        _self.lastLogFile = fullPath;
        _self.logDetailCache = {};
        setEnableLogPopup(true);

        if (ddlMsgType) {
            ddlMsgType.value(Localization.All);
            filterTextbox.val('');
        }
        grid._current = undefined;

        var pageSize = 50;
        var cacheLogs = {};
        var xhrLog = null;
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: function (option) {
                    setEnableLogPopup(true);
                    if (xhrLog && xhrLog.readyState !== 4 && xhrLog.abort) {
                        xhrLog.abort();
                        onKendoGridPagingStart();
                    }

                    var query;
                    if (MC.ui.logpopup.LogType === 'SystemLog') {
                        query = {
                            fullPath: fullPath,
                            q: encodeURIComponent(filterTextbox.val()),
                            type: ddlMsgType.value() === Localization.All ? '' : ddlMsgType.value(),
                            offset: option.data.skip,
                            limit: option.data.take,
                            target: MC.ui.logpopup.Target
                        };
                        if (query.type === Localization.All) {
                            query.type = '';
                        }
                    }
                    else {
                        query = {
                            taskHistoryUri: fullPath
                        };
                    }

                    var queryString = $.param(query);
                    if (cacheLogs[queryString]) {
                        option.success(cacheLogs[queryString]);
                    }

                    cacheLogs[queryString] = {};
                    xhrLog = MC.ajax
                        .request({
                            url: MC.ui.logpopup.GetLogUri,
                            parameters: query,
                            timeout: 300000
                        })
                        .fail(function (xhr, status, error) {
                            if (error !== 'abort') {
                                setEnableLogPopup(false);
                                var msg = $(MC.ajax.getErrorMessage(xhr, null, error));
                                if (_self.isLogFile) {
                                    $('#LogFileDetails .logDetails').addClass('fail').html(msg);
                                }
                                else {
                                    msg.filter('p').append(
                                        $('<a class="btnRetry" />')
                                            .text(Localization.Retry)
                                            .on('click', function () {
                                                delete cacheLogs[queryString];
                                                grid.dataSource._requestInProgress = false;
                                                grid.dataSource.read();
                                            })
                                    );
                                    grid.content.prepend($('<div class="k-grid-error" />').html(msg));
                                }

                                MC.ajax.setErrorDisable(xhr, status, error, null);
                            }
                        })
                        .done(function (response) {
                            if (_self.isLogFile) {
                                if (response != '') {
                                    response = '<pre>' + response  + '</pre>' + '<hr/>';
                                }
                                $('#LogFileDetails .logDetails').html(response);
                            }
                            else {
                                // add row number
                                var number;
                                if (MC.ui.logpopup.LogType === 'SystemLog') {
                                    number = response.header.offset + 1;
                                    $.each(response.messages, function (index, log) {
                                        log['RowNumber'] = number + index;
                                    });
                                }
                                else {
                                    number = response.Header.offset + 1;
                                    $.each(response.Data, function (index, log) {
                                        log['RowNumber'] = number + index;
                                    });
                                }
                            }
                            cacheLogs[queryString] = response;
                            option.success(response);
                        });
                }
            },
            serverPaging: true,
            requestStart: onKendoGridPagingStart,
            schema: {
                data: function (response) {
                    if (MC.ui.logpopup.LogType === 'SystemLog') {
                        return response.messages || [];
                    }
                    else {
                        return response.Data || [];
                    }
                },
                total: function (response) {
                    if (MC.ui.logpopup.LogType === 'SystemLog') {
                        return response.header ? response.header.total : 0;
                    }
                    else {
                        return response.Header ? response.Header.total : 0;
                    }
                }
            },
            pageSize: pageSize
        });

        grid.dataSource.data([]);
        setTimeout(function () {
            grid.setDataSource(dataSource);
            win.trigger('resize');
        }, 100);
    };
    logpopup.RefreshCsl = function () {
        $('#SystemLogGrid').data('kendoGrid').dataSource.read();
        $('#SystemLogGrid').data('kendoGrid').refresh();
    };
    logpopup.RefreshLog = function () {
        var fullPath = MC.ui.logpopup.LogFullPath;
        var query = {
            fullPath: fullPath,
            target: MC.ui.logpopup.Target
        };
        MC.ajax.request({
            url: MC.ui.logpopup.GetLogUri,
            parameters: query,
            timeout: 300000
        }).done(function (response) {
                response = '<pre>' + response + '</pre>' + '<hr/>';
                $('#LogFileDetails .logDetails').html(response);
        });
    };
    logpopup.ScrollToTopLog = function () {
        var div = $("#LogFileDetails .logDetails");
        div.stop().animate({ scrollTop: 0 }, 500);
    };
    logpopup.ScrollToBottomLog = function () {
        var div = $("#LogFileDetails .logDetails");
        divHeight = div.prop("scrollHeight");
        div.stop().animate({ scrollTop: divHeight }, 500);
    };
    logpopup.ScrollToTopCsl = function () {
        var grid = $('#SystemLogGrid').data('kendoGrid');
        var scrollbar = (grid.element).find(".k-scrollbar").get(0);
        $(scrollbar).stop().animate({ scrollTop: 0 }, 500);

    };
    logpopup.ScrollToBottomCsl = function () {
        var grid = $('#SystemLogGrid').data('kendoGrid');
        var scrollbar = (grid.element).find(".k-scrollbar").get(0);
        $(scrollbar).stop().animate({ scrollTop: scrollbar.scrollHeight }, 500);
    };
    logpopup.InitialLogGrid = function () {
        var grid = $('#SystemLogGrid').data('kendoGrid');
        if (!grid) {
            grid = $('#SystemLogGrid').kendoGrid({
                height: 269 - ($('#popupLogTable .gridToolbarTop').hasClass('hidden') ? 0 : 22),
                resizable: true,
                scrollable: {
                    virtual: true
                },
                selectable: 'row',
                columns: MC.ui.logpopup.LogType === 'SystemLog' ? _self.SystemLogColumns : _self.EventLogColumns,
                dataBound: function () {
                    if (MC.ui.logpopup.SelectedRow !== '') {
                        jQuery('tr[data-uid="' + self.SelectedRow + '"]').addClass('k-state-selected').attr('aria-selected', true);
                    }
                },
                change: function (e) {
                    var row = e.sender.select();
                    if (!row.length)
                        return;

                    var dataItem = e.sender.dataSource.getByUid(row.data('uid'));
                    MC.ui.logpopup.SelectedRow = row.data('uid');
                    if (!dataItem)
                        return;

                    if (MC.ui.logpopup.LogType === 'SystemLog') {
                        MC.ui.logpopup.ShowLogDetail(dataItem.DetailsUri || null);
                    }
                    else {
                        MC.ui.logpopup.ShowLogDetail(dataItem.uri || null);
                    }
                }
            }).data('kendoGrid');
        }
        return grid;
    };
    logpopup.GetLogDetailTimeout = null;
    logpopup.GetLogDetail = function (detailUri) {
        var filterTextbox = $('#FilterLogTableTextbox');
        var ddlMsgType = $('#FilterLogTableType').data('kendoDropDownList');

        clearTimeout(MC.ui.logpopup.GetLogDetailTimeout);

        var dfd = $.Deferred();
        MC.ui.logpopup.GetLogDetailTimeout = setTimeout(function () {
            if (_self.logDetailCache[detailUri]) {
                dfd.resolve(_self.logDetailCache[detailUri]);
            }
            else {
                MC.ajax
                    .request({
                        url: MC.ui.logpopup.GetLogDetailUri,
                        parameters: {
                            fullPath: _self.lastLogFile,
                            detailUri: detailUri,
                            q: encodeURIComponent(filterTextbox.val()),
                            type: ddlMsgType ? ddlMsgType.value() === Localization.All ? '' : ddlMsgType.value() : ''
                        }
                    })
                    .done(function (detail) {
                        dfd.resolve(detail);
                    })
                    .fail(function (xhr, status, error) {
                        dfd.reject(xhr, status, error);
                    });
            }
        }, 10);
        return dfd.promise();
    };
    logpopup.ShowLogDetail = function (detailUri) {
        if (_self.getLogDetailsXhr && _self.getLogDetailsXhr.abort) {
            _self.getLogDetailsXhr.abort();
        }

        var element = $('#SystemLogDetails .logDetails').removeClass('fail');

        if (detailUri) {
            disableLoading();
            element.busyIndicator(true);
            _self.getLogDetailsXhr = MC.ui.logpopup.GetLogDetail(detailUri)
                .done(function (detail) {
                    _self.logDetailCache[detailUri] = detail;
                    element.html(detail);

                    $('#SystemLogDetails .logDetailTable').kendoGrid({
                        sortable: {
                            mode: 'single',
                            allowUnsort: false
                        },
                        height: '100%',
                        resizable: true,
                        scrollable: true,
                        columnResize: function () {
                            MC.ui.logpopup.SetTheLastColumnWidthToBeFitAsTable();
                        }
                    });

                    $('#customLogTable').kendoGrid({
                        sortable: {
                            mode: 'single',
                            allowUnsort: false
                        },
                        height: '100%',
                        resizable: true,
                        scrollable: true
                    });

                    MC.ui.logpopup.UpdateLogDetailsLayout();

                    if (MC.ui.logpopup.LogType !== 'SystemLog') {
                        MC.ui.tab();
                        element.find('.tabNav a:visible').first().trigger('click');
                    }
                })
                .fail(function (xhr, status, error) {
                    if (error !== 'abort') {
                        element.addClass('fail').html(MC.ajax.getErrorMessage(xhr, null, error));

                        MC.ajax.setErrorDisable(xhr, status, error, null);
                    }
                })
                .always(function () {
                    element.busyIndicator(false);
                    MC.ui.loading.hide(true);
                });
        }
        else {
            element.empty();
        }
    };
    logpopup.LogTableFilterCallback = function () {
        _self.logDetailCache = {};
        $('#SystemLogDetails .logDetails').removeClass('fail').empty();
        MC.ui.logpopup.SelectedRow = '';
        _self.selectingRowData = { uid: null, dir: null, enable: true };
    };
    logpopup.UpdateLogDetailsLayout = function () {
        var logDetailTable = $('#SystemLogDetails .tabTable .k-grid:visible');
        if (logDetailTable.length) {
            var logDetailTableHeight = $('#SystemLogDetails').height() - (logDetailTable.offset().top - $('#SystemLogDetails').offset().top) - 20;
            logDetailTable = $('#SystemLogDetails .tabTable .k-grid');
            logDetailTable.height(logDetailTableHeight);
            kendo.resize(logDetailTable, true);
            MC.ui.logpopup.SetTheLastColumnWidthToBeFitAsTable();
        }

        var customLogDetailTable = $('#customLogTable:visible');
        if (customLogDetailTable.length) {
            var customLogDetailTableHeight = $('#SystemLogDetails').height() - (customLogDetailTable.offset().top - $('#SystemLogDetails').offset().top);
            customLogDetailTable = $('#customLogTable').data('kendoGrid');
            customLogDetailTable.wrapper.height(customLogDetailTableHeight);
            customLogDetailTable.resize(true);
        }
    };
    logpopup.LogTabShown = function (targetElement) {
        if (targetElement.hasClass('tabTable')) {
            var grid = targetElement.find('.logDetailTable').data('kendoGrid');
            if (grid && !grid.__initialized) {
                grid.__initialized = true;
                MC.util.setGridWidth(grid, 0, 100);
            }

            MC.ui.logpopup.UpdateLogDetailsLayout();
        }
    };
    logpopup.SetTheLastColumnWidthToBeFitAsTableTimeout = null;
    logpopup.SetTheLastColumnWidthToBeFitAsTable = function () {
        clearTimeout(MC.ui.logpopup.SetTheLastColumnWidthToBeFitAsTableTimeout);
        MC.ui.logpopup.SetTheLastColumnWidthToBeFitAsTableTimeout = setTimeout(function () {

            var logTable = jQuery('.tabTable.active .logDetailTable').data('handler');
            if (logTable) {
                var totalTableWidth = logTable.wrapper.find('.k-grid-header').width();
                var headerColumns = logTable.wrapper.find('.k-grid-header th');
                var actualTotalWidth = 0;
                headerColumns.each(function (i, column) {
                    actualTotalWidth += jQuery(column).outerWidth();
                });
                var remainingWidth = totalTableWidth - actualTotalWidth;
                var lastColumnIndex = headerColumns.length - 1;
                var newWidth = headerColumns.eq(lastColumnIndex).outerWidth() + remainingWidth;
                MC.util.setGridWidth(logTable, lastColumnIndex, newWidth);
            }

        }, 50);
    };
    win.MC.ui.logpopup = logpopup;

})(window);
