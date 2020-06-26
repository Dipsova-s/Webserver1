/// <chutzpah_reference path="/../../Dependencies/page/MC.AutomationTasks.Datastores.js" />

describe("MC.AutomationTasks.DataStores", function () {

    var automationDatastore;

    beforeEach(function () {
        automationDatastore = MC.AutomationTasks.DataStores;
    });
    describe(".SetData", function () {
        it("Should call a function", function () {
            spyOn(automationDatastore, "setInputToUI");
            var result={
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
});
