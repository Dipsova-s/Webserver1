(function (win, globalSettings) {

    function Systemlog() {
        var self = this;
        self.DeleteSystemLogUri = '';
        self.Target = '';
        self.ModelId = '';
        self.Category = '';
        self.ModelsData = [];
        self.ModelServicesData = [];
        self.SELECTROWDIR = {
            UP: 'up',
            DOWN: 'down',
            CURRENT: 'current'
        };
        self.SYSTEMLOGTYPE = {
            WEBCLIENT: 'WebClient',
            MANAGEMENTCONSOLE: 'ManagementConsole',
            APPSERVER: 'AppServer',
            MODELSERVER: 'ModelServer',
            EVENTLOG: 'EventLog'
        };
        self.MODEL_EA4IT = 'EA4IT';
        self.SERVER_XTRACTOR = 'Xtractor';

        self.Initial = function (data) {
            self.Target = '';
            self.ModelId = '';
            self.Category = '';
            self.DeleteSystemLogUri = '';
            jQuery.extend(self, data || {});

            MC.ajax.registerPageUnloadEvent('systemlog', self.ClearSystemLogs);

            setTimeout(function () {
                self.InitialSystemLogsGrid();

                if (self.Target === self.SYSTEMLOGTYPE.MODELSERVER) {
                    // model server log have extra ui (dropdown)
                    self.InitialModelServerLogs();
                }
                else {
                    self.InitialGeneralLogs();
                }
            }, 1);
        };
        self.InitialSystemLogsGrid = function () {
            var grid = jQuery('#SystemLogsGrid').data('kendoGrid');
            if (grid) {
                MC.util.gridScrollFixed(grid);
                grid.bind('dataBound', self.SystemLogsGridDataBound);
            }
        };
        self.SystemLogsGridRequestEnd = function () {
            /********* use this if M4-34542 is done **********/

            //// update grid column, depend on log type
            //var grid = $('#SystemLogsGrid').data('kendoGrid');
            //if (self.Target === self.SYSTEMLOGTYPE.MODELSERVER) {
            //    // model server log will show 2 extra columns
            //    grid.showColumn('WarningCount');
            //    grid.showColumn('ErrorCount');

            //    // and show total number
            //    var totalError = 0;
            //    var totalWarning = 0;
            //    if (e.response) {
            //        totalError = e.response.TotalError;
            //        totalWarning = e.response.TotalWarning;
            //    }
            //    $('#TotalError').text(totalError);
            //    $('#TotalWarning').text(totalWarning);
            //    $('.totalWarningError').show();
            //}
            //else {
            //    // hide 2 extra columns for others
            //    grid.hideColumn('WarningCount');
            //    grid.hideColumn('ErrorCount');
            //}
        };
        self.InitialGeneralLogs = function () {
            var grid = jQuery('#SystemLogsGrid').data('kendoGrid');
            if (grid) {
                if (!MC.ajax.isReloadMainContent) {
                    grid.dataSource.read();
                }
                else {
                    grid.trigger('dataBound');
                }
            }
        };
        self.InitialModelServerLogs = function () {
            var grid = jQuery('#SystemLogsGrid').data('kendoGrid');
            if (!grid)
                return;

            self.CreateModelServerLogsDropdown();

            setTimeout(function () {
                self.CreateModelServerLogsState();
            }, 10);
        };
        self.CreateModelServerLogsDropdown = function () {
            // models dropdown
            $("#ddlModelService").kendoDropDownList({
                dataTextField: "id",
                dataValueField: "id",
                enable: false,
                change: self.ModelServiceDropdownChanged,
                dataSource: {
                    data: []
                }
            });

            // category dropdown
            $("#ddlModelServer").kendoDropDownList({
                dataTextField: "short_name",
                dataValueField: "id",
                value: self.ModelId || self.ModelsData[0].id,
                dataSource: {
                    data: self.ModelsData
                },
                enable: self.ModelsData.length,
                change: self.ModelServerDropdownChanged
            });

            // trigger change event
            $("#ddlModelServer").data('kendoDropDownList').trigger("change");
        };
        self.ModelServiceDropdownChanged = function (e) {
            e.sender.enable(true);

            var grid = jQuery('#SystemLogsGrid').data('kendoGrid');
            if (!MC.ajax.isReloadMainContent) {
                // refresh grid with a new query
                var query = {};
                query['modelUri'] = self.GetModelUriFromModelDropdown();
                query['modelService'] = e.sender.value();

                grid.dataSource.transport.options.read.data = query;
                grid.dataSource.read();
            }
            else {
                grid.trigger('dataBound');
            }
        };
        self.ModelServerDropdownChanged = function (e) {
            var modelId = e.sender.value();
            if (!modelId)
                return;

            var modelServicesData = self.ModelServicesData.findObject('ModelId', modelId);
            if (!modelServicesData)
                return;

            // update category datasource, depend on model id
            var ddlModelService = $("#ddlModelService").data('kendoDropDownList');
            var modelServiceDataSource = [];
            if (modelId === self.MODEL_EA4IT) {
                // specific category for EA4IT
                for (var index = 0; index < modelServicesData.services.length; index++) {
                    if (modelServicesData.services[index].id !== self.SERVER_XTRACTOR)
                        modelServiceDataSource.push(modelServicesData.services[index]);
                }
            }
            else {
                modelServiceDataSource = modelServicesData.services;
            }
            ddlModelService.dataSource.data(modelServiceDataSource);
            ddlModelService.value(self.Category || ddlModelService.dataSource.data()[0].id);

            // triger function ModelServiceDropdownChanged
            ddlModelService.trigger("change");
        };
        self.CreateModelServerLogsState = function () {
            // collect page state for using on clicking the Reload button
            var collectState = function () {
                var grid = jQuery('#SystemLogsGrid').data('kendoGrid');
                return {
                    selector: '#SystemLogsGrid',
                    query: {
                        page: grid ? (grid.dataSource.page() || 1) : 1,
                        modelId: $("#ddlModelServer").data('kendoDropDownList').value(),
                        modelUri: self.GetModelUriFromModelDropdown(),
                        modelService: $("#ddlModelService").data('kendoDropDownList').value()
                    }
                };
            };
            var restoreState = function (state) {
                var ddlModelServer = $("#ddlModelServer").data('kendoDropDownList');
                if (ddlModelServer)
                    ddlModelServer.value(state.options.query.modelId);

                var ddlModelService = $("#ddlModelService").data('kendoDropDownList');
                if (ddlModelService)
                    ddlModelService.value(state.options.query.modelService);

                var query = {};
                query['modelUri'] = state.options.query.modelUri;
                query['modelService'] = state.options.query.modelService;

                var grid = jQuery('#SystemLogsGrid').data('kendoGrid');
                grid.dataSource.transport.options.read.data = query;
                grid.dataSource.read();

                MC.form.page.executeState(state);
            };
            MC.form.page.setCustomState(MC.form.page.STATE.SERVER, collectState, restoreState);
        };

        self.ClearSystemLogs = function (lastUrl) {
            if (lastUrl.indexOf('globalsettings/systemlog') !== -1) {
                // System log page
                MC.ajax.request({
                    type: 'DELETE',
                    url: self.DeleteSystemLogUri
                });
            }
        };

        self.SystemLogsGridDataBound = function () {
            MC.ui.localize();
            MC.ui.popup();
            MC.ui.btnGroup();
        };

        self.GetModelUriFromModelDropdown = function () {
            var modelId = $("#ddlModelServer").data('kendoDropDownList').value();
            return self.ModelsData.findObject('id', modelId).Uri;
        };

        self.DownloadLogFile = function (sender) {
            var fullPath = $.trim($(sender).parents('.gridColumnToolbar:first').find('input').val());
            if (fullPath) {
                // Encode the String
                fullPath = jQuery.base64.encode(fullPath);

                var url = kendo.format('{0}?fullPath={1}&target={2}&{3}', webGlobalSettingsDownloadUrl, fullPath, self.Target, ValidationRequestService.getVerificationTokenAsQueryString());
                $(location).attr('href', url);
            }
        };

    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        Systemlog: new Systemlog()
    });

})(window, MC.GlobalSettings);
