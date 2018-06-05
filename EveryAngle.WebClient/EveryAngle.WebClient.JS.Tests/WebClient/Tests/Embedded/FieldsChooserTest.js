/// <reference path="/../SharedDependencies/FieldsChooser.js" />

describe("FieldsChooser", function () {

    var fieldsChooserModel;

    beforeEach(function () {

        fieldsChooserModel = new FieldsChooserModel();

    });

    describe("when create new instance", function () {

        it("should be defined", function () {

            expect(fieldsChooserModel).toBeDefined();
        });

        it("should have popup id", function () {

            expect(fieldsChooserModel.PopupId).toBeDefined();
            expect(fieldsChooserModel.PopupId).toEqual('#popupFieldChooser');
        });

        it("should have grid name", function () {

            expect(fieldsChooserModel.GridName).toBeDefined();
            expect(fieldsChooserModel.GridName).toEqual('DisplayPropertiesGrid');
        });

        it("should have popup localstorage key", function () {

            expect(fieldsChooserModel.ClientSettings).toBeDefined();
            expect(fieldsChooserModel.ClientSettings).toEqual('{}');
        });

        it("should have user client settings", function () {

            expect(fieldsChooserModel.POPUP_SETTINGS_KEY).toBeDefined();
            expect(fieldsChooserModel.POPUP_SETTINGS_KEY).toEqual('field_chooser_settings');
        });

    });

    describe("call GetDefaultFieldChooserLayoutSettings", function () {

        it("should get default layout settings", function () {

            var layoutSettings = fieldsChooserModel.GetDefaultFieldChooserLayoutSettings();

            expect(layoutSettings).toBeDefined();
            expect(layoutSettings.position).toEqual(null);
            expect(layoutSettings.size.width).toEqual(850);
            expect(layoutSettings.size.height).toEqual(600);
            expect(layoutSettings.isMaximize).toEqual(false);
            expect(layoutSettings.columnsDetailMode.id.width).toEqual(42);
            expect(layoutSettings.columnsDetailMode.category.width).toEqual(42);
            expect(layoutSettings.columnsDetailMode.source.width).toEqual(110);
            expect(layoutSettings.columnsDetailMode.short_name.width).toEqual(280);
            expect(layoutSettings.columnsDetailMode.fieldtype.width).toEqual(50);
            expect(layoutSettings.columnsDetailMode.technical_info.width).toEqual(70);
        });

    });

    describe("call GetFieldChooserLayoutSettings", function () {

        beforeEach(function () {

            // save layout settings to localstorage
            fieldsChooserModel.LayoutSettings = fieldsChooserModel.GetDefaultFieldChooserLayoutSettings();
            fieldsChooserModel.SaveFieldChooserLayoutSettings();

        });

        it("should get layout settings from localstorage", function () {

            var layoutSettings = fieldsChooserModel.GetFieldChooserLayoutSettings();

            expect(layoutSettings).toBeDefined();
        });

        it("should save layout settings to localstorage and can retrieve it", function () {

            fieldsChooserModel.LayoutSettings = fieldsChooserModel.GetFieldChooserLayoutSettings();
            fieldsChooserModel.LayoutSettings.position = { top: 100, left: 100 };
            fieldsChooserModel.SaveFieldChooserLayoutSettings();

            var layoutSettings = fieldsChooserModel.GetFieldChooserLayoutSettings();

            expect(layoutSettings).toBeDefined();
            expect(layoutSettings.position).toEqual(jasmine.any(Object));
            expect(layoutSettings.position.top).toEqual(100);
            expect(layoutSettings.position.left).toEqual(100);
        });

    });

    describe("call GetPopupFieldCooserOptions", function () {

        it("should get options", function () {

            var options = fieldsChooserModel.GetPopupFieldCooserOptions('testPopup');

            expect(options).toEqual(jasmine.any(Object));
            expect(options.className).toEqual('popupFieldChooser popup testPopup');
        });

    });

    describe("call DisplayFieldChooserPopup", function () {

        it("should get popup", function () {

            spyOn(fieldsChooserModel, 'SetPopupTooltip');
            jQuery.fn.kendoWindow = function () {
                return { data: function () { return { maximize: jQuery.noop } } };
            };

            var options = fieldsChooserModel.GetPopupFieldCooserOptions('testPopup');
            var popup = fieldsChooserModel.DisplayFieldChooserPopup(options);

            expect(popup).toEqual(jasmine.any(Object));
        });

    });

});
