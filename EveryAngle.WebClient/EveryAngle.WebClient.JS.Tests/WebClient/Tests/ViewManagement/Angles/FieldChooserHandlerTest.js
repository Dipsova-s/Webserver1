/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />

describe("FieldsChooserHandler", function () {

    var fieldChooserHandler;

    beforeEach(function () {
        fieldChooserHandler = new FieldsChooserHandler();
        fieldsChooserModel.BeforeOpenCategoryFunction = null;
        fieldsChooserModel.DefaultFacetFilters = [];

        fieldSettingsHandler.GetAggregationFieldSettingBySourceField = function () {
            return null;
        };
        fieldSettingsHandler.CurrentFieldArea = 'data';
        fieldSettingsHandler.FieldSettings = {
            GetDisplayDetails: function () { return {}; },
            DisplayType: 0,
            ComponentType: {
                CHART: 0,
                PIVOT: 1
            }
        };
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(fieldChooserHandler).toBeDefined();
        });

    });

    describe("call SetAggregationSettingDataArea", function () {

        it("should add 'source' category to 'DefaultFacetFilters'", function () {

            fieldChooserHandler.SetAggregationSettingDataArea();
            expect(fieldsChooserModel.DefaultFacetFilters[0].facet).toEqual('source');

        });

        it("should create 'BeforeOpenCategoryFunction' function", function () {

            fieldChooserHandler.SetAggregationSettingDataArea();
            expect(fieldsChooserModel.BeforeOpenCategoryFunction).not.toEqual(null);

        });

        it("should call 'BeforeOpenCategoryFunction' function and call expand function", function () {

            var fn = { expand: $.noop };

            spyOn(fn, "expand");

            fieldChooserHandler.SetAggregationSettingDataArea();
            fieldsChooserModel.BeforeOpenCategoryFunction('test', fn.expand);
            expect(fn.expand).toHaveBeenCalled();

        });

        it("should call 'BeforeOpenCategoryFunction' function and call popup.Confirm function", function () {

            spyOn(popup, "Confirm").and.callFake($.noop);

            fieldChooserHandler.SetAggregationSettingDataArea();
            fieldsChooserModel.BeforeOpenCategoryFunction('source', $.noop);
            expect(popup.Confirm).toHaveBeenCalled();

        });

        it("should call 'HideFacetsFunction' function and get 'false' if id is 'int'", function () {

            fieldChooserHandler.SetAggregationSettingDataArea();
            var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, 'int');
            expect(result).toEqual(false);

        });

        it("should call 'HideFacetsFunction' function and get 'false' if category is not 'fieldtype'", function () {

            fieldChooserHandler.SetAggregationSettingDataArea();
            var result = fieldsChooserModel.HideFacetsFunction('xx', 'int');
            expect(result).toEqual(false);

        });

        it("should call 'HideFacetsFunction' function and get 'true'", function () {

            fieldChooserHandler.SetAggregationSettingDataArea();
            var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, 'text');
            expect(result).toEqual(true);

        });

    });

    describe("call SetAggregationSettingForChart", function () {

        it("should not set HideFacetsFunction if not 'row' area", function () {

            fieldsChooserModel.FieldChooserType = 'data';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'bubble' });
            expect(fieldsChooserModel.HideFacetsFunction).toEqual(null);

        });

        it("should not set HideFacetsFunction if not 'row' area", function () {

            fieldsChooserModel.FieldChooserType = 'data';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });
            expect(fieldsChooserModel.HideFacetsFunction).toEqual(null);

        });

        it("should not set HideFacetsFunction if not scatter or bubble", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'bar' });
            expect(fieldsChooserModel.HideFacetsFunction).toEqual(null);

        });

        it("should set HideFacetsFunction if row area and is scatter or bubble chart", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'bubble' });
            expect(fieldsChooserModel.HideFacetsFunction).not.toEqual(null);

        });

        it("should get 'false' from HideFacetsFunction if not fieldtype category", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });
            var result = fieldsChooserModel.HideFacetsFunction('xxx', 'time');
            expect(result).toEqual(false);

        });

        it("should get 'false' from HideFacetsFunction if support field type", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });

            $.each(['currency', 'number', 'int', 'double', 'percentage', 'date', 'datetime', 'time', 'period'], function (index, fieldType) {
                var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, fieldType);
                expect(result).toEqual(false);
            });

        });

        it("should get 'true' from HideFacetsFunction if not support field type", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });

            $.each(['text', 'boolean', 'enumerated'], function (index, fieldType) {
                var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, fieldType);
                expect(result).toEqual(true);
            });

        });

    });

});

