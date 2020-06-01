/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/SystemSettingHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/FieldSettings/fieldsettingsmodel.js" />

describe("FieldSettingsModel", function () {

    var fieldSettingsModel;
    beforeEach(function () {
        fieldSettingsModel = new FieldSettingsModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(fieldSettingsModel).toBeDefined();
        });

    });

});
