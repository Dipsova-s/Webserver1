(function (win, automationTasks) {

    win.DataStores = function () {
        var self = this;
        self.SaveUri = '';
        self.EditDatastoreUri = '';
        self.DataStoresUri = '';
        self.DatastoreUri = '';
        self.SettingDatastoreUri = '';
        self.TestConnectionUri = '';
        self.PluginUri = '';
        self.PluginType = '';

        self.InitialAllDataStores = function (data) {
            self.DataStoresUri = '';
            self.DatastoreUri = '';
            self.SettingDatastoreUri = '';
            self.EditDatastoreUri = '';
            self.TestConnectionUri = '';
            self.PluginUri = '';
            self.PluginType = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#DataStoresGrid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }

                $('#DatastorePluginSelect').kendoDropDownList();
            }, 1);
        };

        self.InitialDataStores = function (data) {
            self.AllDataStoreUri = '';
            self.SaveUri = '';
            self.EditDatastoreUri = '';
            self.DatastoreUri = '';
            self.SettingDatastoreUri = '';
            jQuery.extend(self, data || {});
            setTimeout(function () {
                $('#DatastorePluginSelect').kendoDropDownList();
                $('#connection_settings').on('submit', function (e) {
                    if ($(this).valid()) {
                        self.TestConnection();
                    }

                    e.preventDefault();
                });
                self.SetDatastoreFieldsValidation();
            }, 1);
        };

        self.SetDatastoreFieldsValidation = function () {
            if (self.PluginType === 'odbc' || self.PluginType === 'mssql') {
                $('#table_name').addClass('table_name');
            }
        };

        self.ShowCreateNewDatastoresPopup = function () {
            MC.ui.popup('setScrollable', {
                element: '#popupDatastorePlugins'
            });
            var win = $('#popupDatastorePlugins').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });

        };

        self.CreateNewDatastores = function (e, obj) {

            $(obj).data('parameters', {
                datastoreUri: '', pluginUri: jQuery('#DatastorePluginSelect').val(), plugin: ''
            });
            MC.util.redirect(e, obj);
        };

        self.GetData = function () {
            var isNew = $('input[name=id]').val() === '';
            MC.form.clean();

            var data = {
                connection_settings: {},
                data_settings: {}
            };

            //connection_settings list
            data.connection_settings.setting_list = self.GetSettingsData('.connection_settings .contentSectionInfo');

            //data_settings list
            data.data_settings.setting_list = self.GetSettingsData('.data_settings .contentSectionInfo');

            data.datastore = {
                'name': $('input[name=name]').val(),
                'allow_write': true,
                'datastore_plugin': $('input[name=datastore_plugin]').val()
            };

            data.datastore.id = isNew ? 'datastore_' + data.datastore.datastore_plugin + '_' + $.now() : $('input[name=id]').val();
            data.datastore.is_default = $('#is_default').prop('checked');
            data.datastore.connection_settings = data.connection_settings;
            data.datastore.data_settings = data.data_settings;

            return data;
        };
        self.GetSettingsData = function (container) {
            var data = [];

            jQuery(container).find("input[type!='hidden']").each(function (index, input) {
                var setting = self.GetSettingInfo(jQuery(input));
                if (setting.type && setting.id && !data.hasObject('id', setting.id)) {
                    if (setting.type === 'currency_symbol')
                        data.settingList.setting_list.push(setting);
                    else
                        data.push(setting);
                }
            });

            return data;
        };
        self.GetSettingInfo = function (input) {
            var setting = { 'id': input.attr('id'), 'value': null, 'type': input.data('setting-type') };
            if (setting.type === 'enum'
                || setting.type === 'currency_symbol'
                || setting.type === 'percentage') {
                setting.value = input.data('handler').value();
            }
            else if (setting.type === 'boolean') {
                setting.value = input.is(':checked');
            }
            else if (setting.type === 'date') {
                var currentTime = new Date(input.val());
                var ymd = kendo.toString(currentTime, 'yyyyMMdd');
                setting.value = parseInt(ymd);
            }
            else if (setting.type === 'double') {
                setting.value = parseFloat(input.val());
            }
            else if (setting.type === 'integer') {
                setting.value = parseInt(input.val());
            }
            else if (setting.type === 'text') {
                setting.value = input.val();
            }
            return setting;
        };

        self.SaveDatastore = function () {
            MC.form.clean();

            var isDatastoreFormValid = !$('#formAddDatastore').length || $('#formAddDatastore').valid();
            var isDataSettingsFormValid = !$('#data_settings').length || $('#data_settings').valid();

            if (!isDatastoreFormValid || !isDataSettingsFormValid) {
                $('.pageDatastore .error:first').focus();
                return false;
            }

            var data = self.GetData();
            var isNew = $('input[name=id]').val() === '';

            MC.ajax.request({
                url: self.SaveUri,
                parameters: {
                    isNewDatastore: isNew,
                    datastoreUri: self.DatastoreUri,
                    datastoreData: JSON.stringify(data.datastore)
                },
                type: 'POST'
            })
                .done(function () {
                    location.hash = self.AllDataStoreUri;
                });

            return false;
        };

        self.DeleteDataStore = function (e, obj) {
            var confirmMessage = MC.form.template.getRemoveMessage(obj);

            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    element: obj,
                    type: 'Delete'
                })
                    .done(function () {
                        var grid = jQuery('#DataStoresGrid').data('kendoGrid');
                        if (grid) {
                            grid.dataSource.read();
                        }
                    });
            });

            MC.util.preventDefault(e);
        };

        self.TestConnection = function () {
            var btnTestConnection = $('#btnTestConnection');
            if (btnTestConnection.hasClass('disabled'))
                return;

            btnTestConnection.addClass('disabled');
            jQuery('#row-test-connection .statusInfo').text(Localization.MC_TestingConnection);

            var deferred = jQuery.Deferred();
            disableLoading();
            MC.ajax
                .request({
                    url: self.TestConnectionUri,
                    parameters: {
                        "testconnectionUri": self.PluginUri + '/check_connection',
                        'jsonData': JSON.stringify(self.GetTestConnectionData())
                    },
                    type: 'POST'
                })
                .done(function () {
                    jQuery('#row-test-connection .statusInfo').text(Localization.MC_Info_TestConnectionSuccess);
                    deferred.resolve();
                })
                .fail(function (xhr, status, error) {
                    jQuery('#row-test-connection .statusInfo').text(JSON.parse(xhr.responseText).message);
                    MC.ajax.setErrorDisable(xhr, status, error, deferred);
                })
                .always(function () {
                    btnTestConnection.removeClass('disabled');
                });

            deferred.promise();
        };
        self.GetTestConnectionData = function () {
            var data = self.GetSettingsData('.connection_settings .contentSectionInfo');
            return { setting_list: data };
        };
    };

    win.MC.AutomationTasks = automationTasks || {};
    jQuery.extend(win.MC.AutomationTasks, {
        DataStores: new DataStores()
    });

})(window, MC.AutomationTasks);
