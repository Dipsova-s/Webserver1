(function (win, models) {

    function Model() {
        var self = this;

        /* begin - model page */
        self.SaveUri = '';
        self.AllModelsPageUri = '';
        self.SideMenuUri = '';
        self.PageTitle = '';
        self.ModelUri = '';
        self.UpdateModelInfoUri = '';
        self.TopMenuUri = '';
        self.IsOverviewPage = false;
        self.ModelIdDropdownItemsUri = '';

        self.Initial = function (data) {
            self.SaveUri = '';
            self.AllModelsPageUri = '';
            self.SideMenuUri = '';
            self.PageTitle = '';
            self.ModelUri = '';
            self.UpdateModelInfoUri = '';
            self.IsOverviewPage = false;
            self.TopMenuUri = '';
            self.ModelIdDropdownItemsUri = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {
                $("#breadcrumbList li").last().replaceWith('<li><a class="noLink">' + self.PageTitle + '</a></li>');
                self.InitialModelId();
                self.InitialModelColorPicker();
                MC.form.page.init(self.GetData);
            }, 1);
        };
        self.IsCreateNewModel = function () {
            return $('#formAddModel').hasClass('newModel');
        };
        self.SetModelIdDropdown = function (dropdown) {
            MC.ajax.request({
                url: self.ModelIdDropdownItemsUri,
                type: 'GET'
            })
            .done(function (items) {
                if (items.length) {
                    dropdown.kendoDropDownList({
                        dataTextField: 'id',
                        dataValueField: 'id',
                        dataSource: items,
                        change: function () {
                            var modelId = this.value();
                            $("input[name='id']").val(modelId);
                        }
                    });
                    dropdown.data('kendoDropDownList').trigger('change');
                    dropdown.removeClass('hidden');
                }
                else {
                    self.UpdateModelIdAsText(dropdown, Localization.MC_NoModelsAvailable);
                    $("input[name='short_name'], input[name='long_name'], input[name='environment']").prop('disabled', true);
                    $(".modelColorPickerButton").removeAttr('onclick');
                    $(".btnSave").addClass('disabled').removeAttr('onclick');
                }
            });
        };
        self.UpdateModelIdAsText = function (dropdown, text) {
            var container = dropdown.parent();
            container.empty().text(text).css('min-height', '30px');
        };
        self.InitialModelId = function () {
            var dropdown = $("#modelId");
            if (self.IsCreateNewModel()) {
                self.SetModelIdDropdown(dropdown);
            }
            else {
                self.UpdateModelIdAsText(dropdown, $("input[name='id']").val());
            }
        };
        self.InitialModelColorPicker = function () {
            var colorPicker = $("#modelColorPicker");
            colorPicker.kendoColorPalette({
                palette: modelColors.split(','),
                tileSize: 20,
                change: function () {
                    var color = this.value();
                    self.ChangeModelColor(color);
                }
            });
            self.CreateNoModelColor(colorPicker);
            var modelColor = $("input[name='color']").val();
            self.SetModelColor(modelColor);
        };
        self.ChangeModelColor = function (colorSelected) {
            self.SetModelColor(colorSelected);
            self.ToggleModelColorPickerPopup();
        };
        self.SetModelColor = function (colorSelected) {
            var colorPicker = $("#modelColorPicker");
            var colorPickerButton = $(".modelColorPickerButton");
            var nocolorItem = colorPicker.find('.nocolor');
            if (colorSelected) {
                nocolorItem.removeClass('nocolorSelected');
                colorPickerButton.addClass('hasColor');
            }
            else {
                nocolorItem.addClass('nocolorSelected');
                colorPickerButton.removeClass('hasColor');
            }
            colorPicker.data('kendoColorPalette').value(colorSelected || null);
            $("input[name='color']").val(colorSelected);
            colorPickerButton.css('background-color', colorSelected);
            $(".modalColorPickerIcon").css('background-image', colorSelected ? 'url(../images/icons/white_arrow_down.svg)' : '');
        };
        self.ToggleModelColorPickerPopup = function () {
            var colorPickerPopup = $(".modelColorPickerContainer");
            var isVisible = colorPickerPopup.css('visibility') === 'visible';
            colorPickerPopup.css('visibility', isVisible ? 'hidden' : 'visible');

            $(document).off('click').on('click', function (e) {
                if (!$(e.target).closest('.modelColorPickerButton').length) {
                    if (colorPickerPopup.css('visibility') === 'visible') {
                        self.ToggleModelColorPickerPopup();
                        $(document).off('click');
                    }
                }
            });
        };
        self.CreateNoModelColor = function (colorPicker) {
            colorPicker.find('tr')
                .prepend("<td class=\"nocolor\" onclick=\"MC.Models.Model.ChangeModelColor('')\"><canvas id=\"nocolor\" width=\"20\" height=\"20\"></canvas></td>");

            var canvas = $('#nocolor')[0];
            var context = canvas.getContext('2d');
            context.beginPath();
            context.lineCap = 'round';
            context.strokeStyle = '#FF0000';
            context.lineWidth = 2;
            context.moveTo(20, 0);
            context.lineTo(0, 20);
            context.stroke();
        };
        self.GetData = function () {
            MC.form.clean();

            var data = {};

            data.type = self.IsCreateNewModel() ? 'POST' : 'PUT';
            data.modelUri = self.ModelUri;
            data.modelData = $('#formAddModel').serializeObject();

            return data;
        };
        self.SaveModel = function () {
            MC.form.clean();
            if (!$('#formAddModel').valid()) {
                $('#formAddModel .error:first').focus();
                return false;
            }

            var data = self.GetData();
            if (data.type == "POST") {
                var confirmMessage = kendo.format(Localization.MC_ConfirmAddModel, data.modelData.id);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    self.SaveUpdateMode(data);
                });
            }
            else {
                self.SaveUpdateMode(data);
            }
        };
        self.SaveUpdateMode = function (data) {
            var logoutToOverviewPage = function () {
                MC.form.page.clear();
                document.location = document.location.pathname;
            };

            MC.ajax.request({
                url: self.SaveUri,
                parameters: { jsonData: JSON.stringify(data.modelData), modelUri: data.modelUri },
                type: data.type
            })
            .done(function (response) {
                  
                if (data.type == "POST") {
                    logoutToOverviewPage();
                }
                else {
                    location.hash = self.AllModelsPageUri;
                    var target = '#sideContent',
                        url = self.SideMenuUri;
                    self.UpdateSideMenu(target, url);
                    self.UpdateTopMenu();
                }
            })
            .fail(function (xhr) {
                if (xhr.status == 401) {
                    logoutToOverviewPage();
                }
            });
        };

        self.UpdateSideMenu = function (target, url) {
            disableLoading();
            MC.ajax.request({
                target: target,
                url: url
            })
            .fail(function (xhr, status, error) {
                if (xhr.status == 409) {
                    setTimeout(function () { self.UpdateSideMenu(target, url) }, 3000);
                }
            })
            .done(function (data, status, xhr) {
                MC.ui.loading.setLoader('hidePopupError');
                MC.sideMenu.expand($('a[data-url$="Model/GetAllModels"]', '#sideMenu').get(0), true);
                MC.sideMenu.setActive($('a[data-url$="Model/GetAllModels"]', '#sideMenu').get(0));
            });
        };
        self.UpdateTopMenu = function () {
            disableLoading();
            MC.ajax.request({
                url: self.TopMenuUri,
                type: 'Get',
                dataType: 'html'
            })
            .done(function (data, status, xhr) {
                MC.ui.loading.setLoader('hidePopupError');
                $('#topMenu').html(data);
                MC.storage.clean();
            });
        };
        /* end - model page */

        /* begin - model main page */
        self.ModelGraphDataUri = '';
        self.ModelServers = [];
        self.ModelServersData = {};

        self.InitialMainModelPage = function (data) {
            self.ModelGraphDataUri = '';
            self.ModelServers = [];
            self.ModelServersData = {};

            jQuery.extend(self, data || {});

            setTimeout(function () {
                jQuery.when(self.UpdateModelServersGraph())
                    .done(function () {
                        if (!self.IsOverviewPage) {
                            self.UpdateModelStatus();
                        }
                        else {
                            self.UpdateOverviewModelStatus();
                        }
                    });
            }, 1);
        };

        self.UpdateModelServersGraph = function () {
            var deferred = jQuery.Deferred();
            var requestCount = self.ModelServers.length;

            MC.ui.popup('requestStart');

            jQuery('#modelInfoStatus').busyIndicator(true);
            jQuery('#graph .modelInfoStatusGraph').addClass('loadingGraph');
            jQuery.each(self.ModelServers, function (index, modelServer) {
                MC.ajax.request({
                    url: self.ModelGraphDataUri,
                    parameters: { eventLogUri: modelServer.event_log, modelServerId: modelServer.id }
                })
                .done(function (data, status, xhr) {
                    self.ModelServersData[data.id] = data.logs;

                    var html = '', status, size;
                    jQuery.each(data.graph || [], function (index, graphData) {
                        status = graphData.Legend ? ' status' + graphData.Legend : '';
                        size = (graphData.Value + 'px').replace(/,/g, '.');
                        html += '<div class="modelStatus ' + status + '" style="width: ' + size + '"></div>';
                    });
                    jQuery('#modelInfoStatusGraphItem' + data.id + ' .modelInfoStatusGraph').html(html);
                })
                .always(function () {
                    requestCount--;
                    if (!requestCount) {
                        MC.ui.popup('requestEnd');
                        setTimeout(function () {
                            jQuery('#modelInfoStatus').busyIndicator(false);
                        }, 100);
                        jQuery('#graph .modelInfoStatusGraph').removeClass('loadingGraph');
                        deferred.resolve();
                    }
                });
            });

            return deferred.promise();
        };

        self.GetServerStatusName = function (status) {
            if ($.inArray(status.toLowerCase(), ['initializing', 'loading', 'extract', 'restructure']) !== -1) {
                return 'Loading';
            }
            if (status.toLowerCase() == 'postprocessing')
                return 'Up';
            return status;
        };
        self.GetServerStatus = function (server, fallback) {
            var modelServerData = self.ModelServersData[server.id];
            var currentStatus = { status: '', timestamp: 0, IsProcessing: false };
            if (modelServerData && modelServerData.length) {
                jQuery.each(modelServerData, function (index, data) {
                    if (index === 0 || !currentStatus.status) {
                        currentStatus.status = data.status;
                        currentStatus.timestamp = data.timestamp;
                    }
                    else if (currentStatus.status !== data.status || currentStatus.IsProcessing !== data.IsProcessing) {
                        if (currentStatus.IsProcessing != data.IsProcessing && currentStatus.IsProcessing && currentStatus.status === 'Up')
                            currentStatus.status = 'Postprocessing';
                        else
                            currentStatus.status = modelServerData[index - 1].status;
                        currentStatus.timestamp = modelServerData[index - 1].timestamp;
                        currentStatus.IsProcessing = modelServerData[index - 1].IsProcessing;
                        return false;
                    }
                });
            }
            else {
                currentStatus = fallback;
            }
            return currentStatus;
        };
        self.UpdateModelStatus = function () {
            if (jQuery.isEmptyObject(self.ModelServersData))
                return;

            var setServerStatus = function (currentStatus) {
                var currentDate = new Date();
                var serverStatusClassName = self.GetServerStatusName(currentStatus.status);
                var liveTime = currentDate.getTime() - ((currentStatus.timestamp * 1000) + currentDate.getTimezoneOffset());
                var liveTimeText = currentStatus.status + ' for ' + MC.util.readableDate(liveTime);
                jQuery('#modelInfoStatusReport').attr('class', 'modelInfoStatusReport modelInfoStatus' + serverStatusClassName);
                jQuery('#modelInfoStatusReport strong').attr('title', liveTimeText).html(liveTimeText);
            };
            var getServerStatus = function (server) {
                var fallback = { status: server.status, timestamp: server.timestamp, IsProcessing: server.IsProcessing };
                return self.GetServerStatus(server, fallback);
            };

            var currentStatus = { status: '', timestamp: 0, IsProcessing: false };
            var hasStatus = false;
            jQuery.each(self.ModelServers, function (index, server) {
                var isServer = server.type === 'ModelServer' || server.type === 'HanaServer';
                if (server.available && server.type == 'ModelServer') {
                    // status in type ModelServer is the most priority
                    currentStatus = getServerStatus(server);
                    return false;
                }
                else if (server.available && isServer) {
                    // collect status from ModelServer or HanaServer which is available
                    currentStatus = getServerStatus(server);
                    hasStatus = true;
                }
                else if (!hasStatus && isServer) {
                    // collect status from ModelServer or HanaServer if no status
                    currentStatus = getServerStatus(server);
                }
            });
            setServerStatus(currentStatus);
        };
        self.UpdateOverviewModelStatus = function () {
            if (jQuery.isEmptyObject(self.ModelServersData))
                return;

            var setServerStatus = function (serverId, serverType, currentStatus) {
                var divServerTime = $('div.' + serverId + '_time');
                var spanServerTime = $('span.' + serverId + '_time');
                if (currentStatus.timestamp) {
                    var currentDate = new Date();
                    var liveTime = currentDate.getTime() - ((currentStatus.timestamp * 1000) + currentDate.getTimezoneOffset());
                    var liveTimeText = ' for ' + MC.util.readableDate(liveTime);
                    var statusTime = MC.util.readableDate(liveTime);

                    divServerTime.attr('title', liveTimeText).html(liveTimeText);
                    if (serverType == 'ModelServer') {
                        var serverStatusClassName = self.GetServerStatusName(currentStatus.status);

                        divServerTime.closest('.modelInfoStatusReport')
                            .removeClass('modelInfoStatusUp modelInfoStatusDown')
                            .removeClass('modelInfoStatusDown')
                            .addClass('modelInfoStatus' + serverStatusClassName);

                        divServerTime.closest('.modelOverviewItem')
                            .removeClass('modelOverviewItemUp modelOverviewItemDown')
                            .addClass('modelOverviewItem' + serverStatusClassName);
                    }
                    var newStatusTime = statusTime.replace(' days', 'd').replace(' hr', 'hr').replace(' mins', 'm');
                    spanServerTime.attr('title', newStatusTime).html(newStatusTime);
                }

                divServerTime.removeClass('hidden');
                spanServerTime.removeClass('alwaysHidden');
            };
            var getServerStatus = function (server) {
                var fallback = { status: 'Down', timestamp: 0, IsProcessing: false };
                return self.GetServerStatus(server, fallback);
            };

            jQuery.each(self.ModelServers, function (index, server) {
                var currentStatus = getServerStatus(server);
                setServerStatus(server.id, server.type, currentStatus);
            });
        };

        self.UpdateInstance = function (id, newStatus, modelId) {         
           
            var confirmMessage = kendo.format(newStatus ? Localization.MC_ConfirmStartServer : Localization.MC_ConfirmStopServer, modelId);
            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    url: self.UpdateModelInfoUri,
                    parameters: { id: id, status: newStatus },
                    type: 'POST'
                })
                .done(function () {
                    MC.ajax.reloadMainContent();
                });
            });           
       
        };

        self.ShowLogTable = function (e) {
            if (jQuery('#graph .modelInfoStatusGraph').hasClass('loadingGraph')) {
                MC.util.preventDefault(e);
            }

            var win = $('#popupEventsLogTable').data('kendoWindow');

            var target = $('#popupEventsLogTable .gridContainer');
            if (target.children().length) {
                setTimeout(function () {
                    win.trigger('resize');
                }, 1);
                return;
            }

            var initialEventLogGrid = function () {
                var gridElement = $('#ServerEventsLogGrid');
                var grid = gridElement.data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.LogTableDatabound);
                    grid.trigger('dataBound');

                    if (win && !win.__bind_resize_event) {
                        win.__bind_resize_event = true;
                        win.bind('resize', function (e) {
                            gridElement.height(win.element.height() - 2);
                            grid.resize(true);
                        });
                    }
                    setTimeout(function () {
                        win.trigger('resize');
                    }, 1);
                }
            };

            $('<div id="ServerEventsLogGrid" />').appendTo(target);

            var columns = [{
                headerAttributes: {
                    'class': 'columnDate'
                },
                attributes: {
                    'class': 'columnDate'
                },
                width: 170,
                template: "<span data-role='localize'>#= Time # </span>",
                field: 'Time'
            }];
            var logCache = {}, logKey;
            jQuery.each(self.ModelServers, function (index, modelServer) {
                columns.push({
                    field: modelServer.id
                });

                jQuery.each(self.ModelServersData[modelServer.id] || [], function (indexLog, log) {
                    logKey = log.timestamp + '-' + log.status;
                    if (!logCache[logKey]) logCache[logKey] = {};
                    logCache[logKey][modelServer.id] = log.status;
                });
            });

            var logs = [], log;
            jQuery.each(logCache, function (key, data) {
                log = { Time: parseInt(key.split('-')[0], 10) };
                jQuery.each(self.ModelServers, function (index, modelServer) {
                    log[modelServer.id] = data[modelServer.id] || null;
                });
                logs.push(log);
            });

            jQuery('#ServerEventsLogGrid').kendoGrid({
                dataSource: {
                    data: logs,
                    pageSize: 20,
                    sort: [{
                        field: columns[0].field,
                        dir: 'desc'
                    }]
                },
                columns: columns,
                height: 500,
                resizable: true,
                scrollable: {
                    virtual: true
                }
            });

            initialEventLogGrid();
        };
        self.LogTableDatabound = function (e) {
            MC.ui.localize();
        };

        self.ShowModelServerInfo = function (e, obj) {
            MC.util.modelServerInfo.showInfoPopup(e, obj);
        };
        self.ShowModelServerInfoCallback = function (data) {
            // no callback
        };

        self.ShowGlobalSettings = function (e, link) {
            if (!$('#sideMenu-GlobalSettings').hasClass('active')) {
                $('#sideMenu-GlobalSettings > a').trigger('click');
            }

            MC.util.preventDefault(e);
        };
        /* end - model main page */
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Model: new Model()
    });

})(window, MC.Models);
