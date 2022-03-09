/// <chutzpah_reference path="/../../Dependencies/page/MC.AutomationTasks.Datastores.js" />

describe("MC.AutomationTasks.DataStores", function () {

    var automationDatastore;

    beforeEach(function () {
        automationDatastore = MC.AutomationTasks.DataStores;
    });
    describe(".SetData", function () {
        it("Should call a function", function () {
            spyOn(automationDatastore, "setInputToUI");
            var result = {
                connection_settings: {
                    'SettingList': {}
                },
                data_settings: {
                    'SettingList': {}
                }
            };
            automationDatastore.SetData(result);
            expect(automationDatastore.setInputToUI).toHaveBeenCalledTimes(2);

        });
    });
    describe(".setInputToUI", function () {
        it("Should call a function", function () {
            var result = [{
                "Id": "connection_folder",
                "Value": "C:\TestServer\M4\Data\AppServer\ExportOutput"
            }];
            var html = '<input class="text autosyncinput" data-setting-type="text" data-type="textbox" id="connection_folder" name="connection_folder" type="text" value="C:\TestServer\M4\Data\AppServer\ExportOutput">';

            var container = '';
            spyOn($.fn, 'find').and.returnValue($(html));
            spyOn(automationDatastore, "SetSettingInfo");
            automationDatastore.setInputToUI(container, result);
            expect(automationDatastore.SetSettingInfo).toHaveBeenCalled();
        });
        it("Should not  call a function", function () {
            var result = [{
                "Id": "connection_folder",
                "Value": "C:\TestServer\M4\Data\AppServer\ExportOutput"
            }];
            //var html = '<input class="text autosyncinput" data-setting-type="text" data-type="textbox" id="connection_folder" name="connection_folder" type="text" value="C:\TestServer\M4\Data\AppServer\ExportOutput">';

            var container = '';
            spyOn($.fn, 'find').and.returnValue($('<div>'));
            spyOn(automationDatastore, "SetSettingInfo");
            automationDatastore.setInputToUI(container, result);
            expect(automationDatastore.SetSettingInfo).not.toHaveBeenCalled();
        });
    });
    describe(".SetSettingInfo", function () {
        it("Should call a function", function () {
            var result = [{
                "Id": "connection_folder",
                "Value": "C:\TestServer\M4\Data\AppServer\ExportOutput"
            }];
            var html = '<input class="text autosyncinput" data-setting-type="text" data-type="textbox" id="connection_folder" name="connection_folder" type="text" value="C:\TestServer\M4\Data\AppServer\ExportOutput">';

            var input = jQuery(html).find("input[type!='hidden']");
            spyOn($.fn, 'val');
            spyOn($.fn, 'prop');
            automationDatastore.SetSettingInfo(input, result);
            expect($.fn.val).toHaveBeenCalled();
            expect($.fn.prop).not.toHaveBeenCalled();
        });
    });
    describe(".GetDatastoreSetting", function () {
        it("Should return true after success", function () {
            var data = '';
            var handler = { done: function () { return true; } }
            spyOn(MC.ajax, 'request').and.returnValue(handler);
            var result = automationDatastore.GetDatastoreSetting(data);
            expect(result).toEqual(true);
            expect(MC.ajax.request).toHaveBeenCalled();
        });
    });
    describe(".ShowHideConnectionSettings", function () {
        it("Should not hide or show connectionsettings when id is undefined", function () {
            var data = {
                sender: {
                    dataItem: function () {
                        return undefined;
                    }
                }
            };
            spyOn(automationDatastore, "ShowHideConnectionSettingsGeneral");
            automationDatastore.ShowHideConnectionSettings(data);
            expect(automationDatastore.ShowHideConnectionSettingsGeneral).not.toHaveBeenCalled();
        });
        it("Should show networkdrive connectionsettings when id is networkdrive", function () {
            var data = {
                sender: {
                    dataItem: function () {
                        return { id: automationDatastore.NetworkDriveStorageId };
                    }
                }
            };
            spyOn(automationDatastore, "ShowHideConnectionSettingsBasedStorageSelection");
            automationDatastore.ShowHideConnectionSettings(data);
            expect(automationDatastore.ShowHideConnectionSettingsBasedStorageSelection).toHaveBeenCalled();
        });
        it("Should show awss3 connectionsettings when id is awss3", function () {
            var data = {
                sender: {
                    dataItem: function () {
                        return { id: automationDatastore.Awss3StorageId };
                    }
                }
            };
            spyOn(automationDatastore, "ShowHideConnectionSettingsBasedStorageSelection");
            automationDatastore.ShowHideConnectionSettings(data);
            expect(automationDatastore.ShowHideConnectionSettingsBasedStorageSelection).toHaveBeenCalled();
        });
        it("Should show localfolder connectionsettings when id is localfolder", function () {
            var data = {
                sender: {
                    dataItem: function () {
                        return { id: "localfolder" };
                    }
                }
            };
            spyOn(automationDatastore, "ShowHideConnectionSettingsBasedStorageSelection");
            automationDatastore.ShowHideConnectionSettings(data);
            expect(automationDatastore.ShowHideConnectionSettingsBasedStorageSelection).toHaveBeenCalled();
        });
    });
    describe(".GetStorageArrayIdsNotToSave", function () {
        it("Should returne array of ids which should not be saved when preferred storage is AWS", function () {
            spyOn(automationDatastore, 'GetSelectedPreferedStorage').and.returnValue(automationDatastore.Awss3StorageId);
            var actualIdSet = automationDatastore.GetStorageArrayIdsNotToSave(), expectedIdSet = Array.prototype.concat(automationDatastore.localFolderElementArray, automationDatastore.networkDriveElementArray);
            expect(actualIdSet).toEqual(expectedIdSet);
            expect(automationDatastore.GetSelectedPreferedStorage).toHaveBeenCalled();
        });
        it("Should returne array of ids which should not be saved when preferred storage is Network drive", function () {
            spyOn(automationDatastore, 'GetSelectedPreferedStorage').and.returnValue(automationDatastore.NetworkDriveStorageId);
            var actualIdSet = automationDatastore.GetStorageArrayIdsNotToSave(), expectedIdSet = Array.prototype.concat(automationDatastore.localFolderElementArray, automationDatastore.awss3ElementArray);
            expect(actualIdSet).toEqual(expectedIdSet);
            expect(automationDatastore.GetSelectedPreferedStorage).toHaveBeenCalled();
        });
        it("Should returne array of ids which should not be saved when preferred storage is local folder", function () {
            spyOn(automationDatastore, 'GetSelectedPreferedStorage').and.returnValue(automationDatastore.LocalFolderStorageId);
            var actualIdSet = automationDatastore.GetStorageArrayIdsNotToSave(), expectedIdSet = Array.prototype.concat(automationDatastore.awss3ElementArray, automationDatastore.networkDriveElementArray, automationDatastore.commonElementArrayForCloudStorage, [automationDatastore.ActionSubfolder]);
            expect(actualIdSet).toEqual(expectedIdSet);
            expect(automationDatastore.GetSelectedPreferedStorage).toHaveBeenCalled();
        });
        it("Should returne array of blank array when preferred storage is not select", function () {
            spyOn(automationDatastore, 'GetSelectedPreferedStorage').and.returnValue('');
            var actualIdSet = automationDatastore.GetStorageArrayIdsNotToSave(), expectedIdSet = [];
            expect(actualIdSet).toEqual(expectedIdSet);
            expect(automationDatastore.GetSelectedPreferedStorage).toHaveBeenCalled();
        });
    });
    describe(".GetDatastoreId", function () {
        it("Should return 0 when datastore uri is blank ", function () {
            automationDatastore.DatastoreUri = '';
            var result = automationDatastore.GetDatastoreId();
            expect(result).toEqual(0);
        });
        it("Should return 0 when datastore uri is null ", function () {
            automationDatastore.DatastoreUri = null;
            var result = automationDatastore.GetDatastoreId();
            expect(result).toEqual(0);
        });
        it("Should return 3 when datastore uri is system/3 ", function () {
            automationDatastore.DatastoreUri = 'system/3';
            var result = automationDatastore.GetDatastoreId();
            expect(result).toEqual('3');
        });
    });
});
