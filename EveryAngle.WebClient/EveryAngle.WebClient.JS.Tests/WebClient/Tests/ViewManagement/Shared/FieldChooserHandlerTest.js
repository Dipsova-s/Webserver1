/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/viewmanagement/shared/fieldchooserhandler.js" />

describe("FieldsChooserHandler", function () {
    var fieldsChooserHandler;

    beforeEach(function () {
        fieldsChooserHandler = new FieldsChooserHandler();

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

    describe("Validate 'fieldsChooserModel.OnSubmit' function", function () {

        var mockPopupSettings, mockHandler;
        beforeEach(function () {
            mockPopupSettings = {};
            mockHandler = {};
            mockHandler.AddFieldFilter = jQuery.noop;

            spyOn(fieldsChooserHandler, 'SetSubmitButtonCaption');
            spyOn(fieldsChooserModel, 'ClosePopup');
            spyOn(mockHandler, 'AddFieldFilter');
        });

        describe(".SetAddFilterPopupSettings", function () {
            
            it("should not throw an error when user submit without selected item", function () {
                fieldsChooserHandler.SetAddFilterPopupSettings(mockPopupSettings, mockHandler);

                expect(function () {
                    fieldsChooserModel.OnSubmit();
                    expect(mockHandler.AddFieldFilter).not.toHaveBeenCalled();
                }).not.toThrow();
            });

        });

        describe(".SetAddDashboardFilterPopupSettings", function () {

            it("should not throw an error when user submit without selected item", function () {
                fieldsChooserHandler.SetAddDashboardFilterPopupSettings(mockPopupSettings, mockHandler);

                expect(function () {
                    fieldsChooserModel.OnSubmit();
                    expect(mockHandler.AddFieldFilter).not.toHaveBeenCalled();
                }).not.toThrow();
            });

        });

    });


    describe(".SetAggregationSettingDataArea", function () {

        it("should add 'source' category to 'DefaultFacetFilters'", function () {

            fieldsChooserHandler.SetAggregationSettingDataArea();
            expect(fieldsChooserModel.DefaultFacetFilters[0].facet).toEqual('source');

        });

        it("should create 'BeforeOpenCategoryFunction' function", function () {

            fieldsChooserHandler.SetAggregationSettingDataArea();
            expect(fieldsChooserModel.BeforeOpenCategoryFunction).not.toEqual(null);

        });

        it("should call 'BeforeOpenCategoryFunction' function and call expand function", function () {

            var fn = { expand: $.noop };

            spyOn(fn, "expand");

            fieldsChooserHandler.SetAggregationSettingDataArea();
            fieldsChooserModel.BeforeOpenCategoryFunction('test', fn.expand);
            expect(fn.expand).toHaveBeenCalled();

        });

        it("should call 'BeforeOpenCategoryFunction' function and call popup.Confirm function", function () {

            spyOn(popup, "Confirm").and.callFake($.noop);

            fieldsChooserHandler.SetAggregationSettingDataArea();
            fieldsChooserModel.BeforeOpenCategoryFunction('source', $.noop);
            expect(popup.Confirm).toHaveBeenCalled();

        });

        it("should call 'HideFacetsFunction' function and get 'false' if id is 'int'", function () {

            fieldsChooserHandler.SetAggregationSettingDataArea();
            var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, 'int');
            expect(result).toEqual(false);

        });

        it("should call 'HideFacetsFunction' function and get 'false' if category is not 'fieldtype'", function () {

            fieldsChooserHandler.SetAggregationSettingDataArea();
            var result = fieldsChooserModel.HideFacetsFunction('xx', 'int');
            expect(result).toEqual(false);

        });

        it("should call 'HideFacetsFunction' function and get 'true'", function () {

            fieldsChooserHandler.SetAggregationSettingDataArea();
            var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, 'text');
            expect(result).toEqual(true);

        });

    });

    describe(".SetAggregationSettingForChart", function () {

        it("should not set HideFacetsFunction if not 'row' area", function () {

            fieldsChooserModel.FieldChooserType = 'data';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'bubble' });
            expect(fieldsChooserModel.HideFacetsFunction).toEqual(null);

        });

        it("should not set HideFacetsFunction if not 'row' area", function () {

            fieldsChooserModel.FieldChooserType = 'data';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });
            expect(fieldsChooserModel.HideFacetsFunction).toEqual(null);

        });

        it("should not set HideFacetsFunction if not scatter or bubble", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'bar' });
            expect(fieldsChooserModel.HideFacetsFunction).toEqual(null);

        });

        it("should set HideFacetsFunction if row area and is scatter or bubble chart", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'bubble' });
            expect(fieldsChooserModel.HideFacetsFunction).not.toEqual(null);

        });

        it("should get 'false' from HideFacetsFunction if not fieldtype category", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });
            var result = fieldsChooserModel.HideFacetsFunction('xxx', 'time');
            expect(result).toEqual(false);

        });

        it("should get 'false' from HideFacetsFunction if support field type", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });

            $.each(['currency', 'number', 'int', 'double', 'percentage', 'date', 'datetime', 'time', 'period'], function (index, fieldType) {
                var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, fieldType);
                expect(result).toEqual(false);
            });

        });

        it("should get 'true' from HideFacetsFunction if not support field type", function () {

            fieldsChooserModel.FieldChooserType = 'row';
            fieldsChooserModel.HideFacetsFunction = null;
            fieldsChooserHandler.SetAggregationSettingForChart({ chart_type: 'scatter' });

            $.each(['text', 'boolean', 'enumerated'], function (index, fieldType) {
                var result = fieldsChooserModel.HideFacetsFunction(fieldsChooserModel.CATEGORIES.FIELDTYPE, fieldType);
                expect(result).toEqual(true);
            });

        });

    });

    describe(".GetPopupConfiguration", function () {

        var tests = [
            {
                title: 'should get config for random type without handler',
                type: 'test',
                handler: undefined,
                expected: 'test'
            },
            {
                title: 'should get config for chart/pivot without handler',
                type: 'data',
                handler: undefined,
                expected: 'DisplayDetail,last'
            },
            {
                title: 'should get config for chart/pivot with handler',
                type: 'data',
                handler: { FilterFor: 'Display' },
                expected: 'DisplayDetail,last'
            },
            {
                title: 'should get config for Angle with handler',
                type: 'data',
                handler: { FilterFor: 'Angle' },
                expected: 'AngleDetail,last'
            },
            {
                title: 'should get config for CompareInfo',
                type: 'data',
                index: 1,
                handler: {
                    Data: function () { },
                    FilterFor: 'Display',
                    CompareInfo: {}
                },
                expected: 'DisplayDetail,1'
            },
            {
                title: 'should get config for FollowupInfo',
                type: 'data',
                index: 2,
                handler: {
                    Data: function () { },
                    FilterFor: 'Display',
                    FollowupInfo: {}
                },
                expected: 'DisplayDetail,2'
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(fieldsChooserHandler, 'GetFollowupIndex').and.returnValue(test.index);
                if (test.handler) {
                    test.handler.FILTERFOR = {
                        ANGLE: 'Angle',
                        DISPLAY: 'Display',
                        DASHBOARD: 'Dashboard'
                    };
                }
                var result = fieldsChooserHandler.GetPopupConfiguration(test.type, test.handler);
                expect(result).toEqual(test.expected);
            });
        });

    });

    describe(".GetFollowupIndex", function () {

        var tests = [
            {
                title: 'should index in case (limit = -1)',
                limit: -1,
                notFoundValue: undefined,
                expected: 'last'
            },
            {
                title: 'should index in case no followup',
                data: [],
                limit: Infinity,
                notFoundValue: undefined,
                expected: 'last'
            },
            {
                title: 'should index in case has followup and limit',
                limit: 1,
                notFoundValue: '-1',
                expected: 0
            },
            {
                title: 'should index in case has followup and no limit',
                limit: Infinity,
                notFoundValue: '-1',
                expected: 1
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var data = test.data || [
                    { step_type: enumHandlers.FILTERTYPE.FOLLOWUP },
                    { step_type: enumHandlers.FILTERTYPE.FILTER },
                    { step_type: enumHandlers.FILTERTYPE.FOLLOWUP }
                ];
                var result = fieldsChooserHandler.GetFollowupIndex(data, test.limit, test.notFoundValue);
                expect(result).toEqual(test.expected);
            });
        });

    });

    describe(".FacetsHidden", function () {

        it("The default of 'FacetsHidden' should be 'classes'", function () {
            expect(fieldsChooserModel.FacetsHidden[0]).toEqual('classes');
        });

        it("The 'FacetsHidden' should be empty", function () {
            fieldsChooserModel.FacetsHidden = [];
            expect(fieldsChooserModel.FacetsHidden).toEqual([]);
        });
    });
    
});
