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
        self.DefaultDatastoreUri = '';
        self.isSupportAutomateTask = '';
        self.EditDefaultCsvDatastoreUri = '';
        self.EditDefaultExcelDatastoreUri = '';
        self.canDatastoreBeDefault = true;
        self.LocalFolderStorageId = "localfolder";
        self.Awss3StorageId = "awss3";
        self.SharePointStorageId = "sharepoint";
        self.ActionSubfolder = "action_subfolder";
        self.awss3ElementArray = [
            'aws_s3_region',
            'aws_s3_bucket',
            'aws_s3_upload_folder',
            'aws_s3_access_key',
            'aws_s3_secret_key'
        ];
        self.networkDriveElementArray = [
            'network_drive_username',
            'network_drive_password'
        ];
        self.sharePointElementArray = [
            "sharepoint_upload_folder",
            'sharepoint_site_url',
            'sharepoint_username',
            'sharepoint_password'
        ];
        self.localFolderElementArray = [
            'connection_folder'
        ];
        self.noRequiredElementArray = [
            '#row-network_drive_username',
            '#row-network_drive_password',
            '#row-sharepoint_upload_folder'
        ];
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
            self.DefaultDatastoreUri = '';
            self.isSupportAutomateTask = '';
            self.EditDefaultCsvDatastoreUri = '';
            self.EditDefaultExcelDatastoreUri = '';

            jQuery.extend(self, data || {});

            if (data.DefaultDatastore === "True") {
                location.hash = data.PluginType === 'csv' ? self.EditDefaultCsvDatastoreUri : self.EditDefaultExcelDatastoreUri;
            }
            if (data.isSupportAutomateTask === "False") {
                $('#name').attr('readonly', 'true');
            }
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
            self.ShowHideConnectionSettingsForDefaultDatastore();
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
                'name': $('#Uri').val() ? $('#Uri option:selected').text() : $('input[name=name]').val(),
                'allow_write': true,
                'datastore_plugin': $('input[name=datastore_plugin]').val()
            };

            data.datastore.id = isNew ? 'datastore_' + data.datastore.datastore_plugin + '_' + $.now() : $('input[name=id]').val();
            data.datastore.is_default = $('#Uri').val() || self.isSupportAutomateTask === 'False' ? true : false;
            data.datastore.connection_settings = data.connection_settings;
            data.datastore.data_settings = data.data_settings;

            return data;
        };
        self.GetSettingsData = function (container) {
            var data = [], saveValuesBasedOnSelectedStorage = [];
            if (container.indexOf(".connection_settings") !== -1) {
                saveValuesBasedOnSelectedStorage = self.GetStorageArrayIdsNotToSave();
            }
            jQuery(container).find("input[type!='hidden']").each(function (index, input) {
                var setting = self.GetSettingInfo(jQuery(input));
                if (setting.type && setting.id && !data.hasObject('id', setting.id) && saveValuesBasedOnSelectedStorage.indexOf(setting.id) === -1) {
                    if (setting.type === 'currency_symbol')
                        data.settingList.setting_list.push(setting);
                    else
                        data.push(setting);
                }
            });

            return data;
        };
        self.GetStorageArrayIdsNotToSave = function () {
            var selectedStoreageId = self.GetSelectedPreferedStorage();
            if (selectedStoreageId === self.Awss3StorageId) {
                return Array.prototype.concat(self.localFolderElementArray, [self.ActionSubfolder], self.networkDriveElementArray, self.sharePointElementArray);
            }
            else if (selectedStoreageId === self.SharePointStorageId) {
                return Array.prototype.concat(self.localFolderElementArray, [self.ActionSubfolder], self.awss3ElementArray, self.networkDriveElementArray);
            }
            else if (selectedStoreageId === self.LocalFolderStorageId) {
                return Array.prototype.concat(self.awss3ElementArray, [self.ActionSubfolder], self.sharePointElementArray);
            }
            else {
                return [];
            }
        };
        self.GetSettingInfo = function (input) {
            var setting = { 'id': input.attr('id'), 'value': null, 'type': input.data('setting-type') };
            if (MC.ui.isKendoTypeSetting(setting.type)) {
                setting.value = input.data('handler') && input.data('handler').value();
            }
            else if (setting.type === 'boolean') {
                setting.value = input.is(':checked');
            }
            else if (setting.type === 'date') {
                var currentTime = new Date(input.val());
                var ymd = kendo.toString(currentTime, 'yyyyMMdd');
                setting.value = parseInt(ymd);
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

            if (!isDatastoreFormValid || !isDataSettingsFormValid || !self.ValidateRequiredFieldsNotBlank('.connection_settings')) {
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
                    if (self.isSupportAutomateTask === 'True')
                        location.hash = self.AllDataStoreUri;
                    else
                        MC.ajax.reloadMainContent()
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

            var deferred = jQuery.Deferred(); var querystring = self.GetDatastoreId() === 0 ? '' : '?datastoreId=' + self.GetDatastoreId();
            disableLoading();
            MC.ajax
                .request({
                    url: self.TestConnectionUri,
                    parameters: {
                        "testconnectionUri": self.PluginUri + '/check_connection' + querystring,
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
        self.GetDatastoreSetting = function () {
            jQuery('#row-default-datastore .datastoreDefaultStatusInfo').hide();
            self.canDatastoreBeDefault = true;
            return MC.ajax
                .request({
                    url: self.DefaultDatastoreUri,
                    parameters: {
                        datastoreUri: $("#Uri").val(),
                        pluginUri: "",
                        plugin: self.PluginType
                    },
                    type: 'POST'
                })
                .done(function (result) {
                    jQuery.each(result.connection_settings.SettingList, function (_index, element) {
                        if (element.Id === "preferred_storage" && element.Value !== self.LocalFolderStorageId) {
                            self.canDatastoreBeDefault = false;
                            jQuery('#row-default-datastore .datastoreDefaultStatusInfo').css('display', 'block').addClass('error');//Datastores' which have preferred storage location other than local folder can be made default
                        }
                    });
                    self.SetData(result);
                    self.DatastoreUri = result.Uri;
                    self.ShowHideConnectionSettingsForDefaultDatastore();
                });
        };
        self.GetSelectedPreferedStorage = function () {
            return jQuery("#preferred_storage").val();
        };
        self.GetDatastoreId = function () {
            var datastoreId = 0;
            if (self.DatastoreUri) {
                var str = self.DatastoreUri;
                var n = str.lastIndexOf('/');
                datastoreId = str.substring(n + 1);
            }
            return datastoreId;
        };
        self.SetData = function (result) {
            var container = 'connection_settings';
            self.setInputToUI(container, result[container].SettingList);
            container = 'data_settings';
            self.setInputToUI(container, result[container].SettingList);
        };
        self.setInputToUI = function (container, result) {
            jQuery('.' + container + ' .contentSectionInfo').find("input[type!='hidden']").each(function (index, input) {
                input = jQuery(input);
                var data = '';
                if (input.attr('id')) {
                    $.each(result, function (index, setting) {
                        if (setting.Id == input.attr('id')) {
                            data = setting.Value;
                            return true;
                        }
                    });
                    self.SetSettingInfo(input, data)
                }
            });
        };
        self.ValidateRequiredFieldsNotBlank = function (container) {
            var isValid = true;
            !$('#formConnectionString').valid() && jQuery(container).find("input:visible").each(function (index, input) {
                if (!input.value) {
                    jQuery(input).addClass('error');
                    isValid = false;
                }
            });
            return isValid && self.canDatastoreBeDefault;
        };
        self.SetSettingInfo = function (input, data) {
            var setting = { 'type': input.data('setting-type') };
            var type = ["enum", "currency_symbol", "percentage", "integer"];
            if ($.inArray(setting.type, type) !== -1) {
                input.data('handler').value(data);
            }
            else if (setting.type === 'boolean') {
                input.prop("checked", data);
            }
            else {
                input.val(data);
            }
        };
        self.ShowHideConnectionSettingsForDefaultDatastore = function () {
            var selectedStoreageId = self.GetSelectedPreferedStorage();
            self.GetData().datastore.is_default ? jQuery("#row-preferred_storage").hide() : jQuery("#row-preferred_storage").show();
            self.ShowHideConnectionSettingsBasedStorageSelection(selectedStoreageId);
        };
        self.ShowHideConnectionSettingsGeneral = function (showArray, hideArray) {
            jQuery.each(showArray, function (_index, element) {
                element = "#row-" + element;
                $(element).show()
                if (self.noRequiredElementArray.indexOf(element) === -1) {
                    $(element).find("input:visible").show().addClass("required");
                }
            });
            jQuery.each(hideArray, function (_index, element) {
                element = "#row-" + element;
                $(element).hide();
                $(element).find("input:visible").hide().removeClass("required");
            });
            $("#row-" + self.ActionSubfolder).hide();
        };

        self.ShowHideConnectionSettingsBasedStorageSelection = function (selectedStoreageId) {
            if (selectedStoreageId === self.Awss3StorageId) {
                self.ShowHideConnectionSettingsGeneral(Array.prototype.concat(self.awss3ElementArray, self.commonElementArrayForCloudStorage), Array.prototype.concat(self.localFolderElementArray, self.networkDriveElementArray, self.sharePointElementArray));
            }
            else if (selectedStoreageId === self.SharePointStorageId) {
                self.ShowHideConnectionSettingsGeneral(Array.prototype.concat(self.sharePointElementArray), Array.prototype.concat(self.localFolderElementArray, self.awss3ElementArray, self.commonElementArrayForCloudStorage, self.networkDriveElementArray));
            }
            else {
                self.ShowHideConnectionSettingsGeneral(Array.prototype.concat(self.localFolderElementArray, self.networkDriveElementArray), Array.prototype.concat(self.awss3ElementArray, self.commonElementArrayForCloudStorage, self.sharePointElementArray));
            }
        };

        self.ShowHideConnectionSettings = function (obj) {
            var preferredStorage = obj.sender.dataItem();
            if (typeof preferredStorage === 'undefined')
                return;
            self.ShowHideConnectionSettingsBasedStorageSelection(preferredStorage.id);
        };

    };

    win.MC.AutomationTasks = automationTasks || {};
    jQuery.extend(win.MC.AutomationTasks, {
        DataStores: new DataStores()
    });

})(window, MC.AutomationTasks);
