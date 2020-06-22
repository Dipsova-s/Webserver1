/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ChartHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/TargetLineHandler.js" />

describe("DisplayChartResultHandler", function () {
    var displayChartResultHandler;
    beforeEach(function () {
        var displayHandler = new DisplayHandler({ display_type: 'chart' }, new AngleHandler());
        displayChartResultHandler = new DisplayChartResultHandler(displayHandler);
    });

    describe("constructor", function () {
        it('should set DisplayHandler', function () {
            // assert
            expect(displayChartResultHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
        });
    });

    describe(".CreateTypeDropdown", function () {
        it("should create dropdown", function () {
            // prepare
            var dropdown = {
                enable: $.noop,
                wrapper: $(),
                popup: {
                    element: $()
                }
            };
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdown);
            spyOn(dropdown, 'enable');
            spyOn($.fn, 'addClass');
            spyOn(displayChartResultHandler, 'UpdateTypeDropdownValue');
            displayChartResultHandler.CreateTypeDropdown();

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(dropdown.enable).toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalledWith('ignore');
            expect(displayChartResultHandler.UpdateTypeDropdownValue).toHaveBeenCalled();
        });
    });

    describe(".TypeDropdownOpen", function () {
        it("should set flag and create the click event", function () {
            // prepare
            var e = {
                sender: {
                    popup: {
                        element: $()
                    },
                    ul: $()
                }
            };
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            displayChartResultHandler.TypeDropdownOpen(e);

            // assert
            expect($.fn.addClass).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
            expect(e.sender._isSelecting).toEqual(false);
        });
    });

    describe(".TypeDropdownSelect", function () {
        it("should set flag and prevent default event", function () {
            // prepare
            var e = {
                sender: {},
                preventDefault: $.noop
            };
            spyOn(e, 'preventDefault');
            displayChartResultHandler.TypeDropdownSelect(e);

            // assert
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.sender._isSelecting).toEqual(true);
        });
    });

    describe(".TypeDropdownClose", function () {
        it("should set flag and prevent default event", function () {
            // prepare
            var e = {
                sender: {
                    refresh: $.noop,
                    _isSelecting: true
                },
                preventDefault: $.noop
            };
            spyOn(e.sender, 'refresh');
            spyOn(e, 'preventDefault');
            displayChartResultHandler.TypeDropdownClose(e);

            // assert
            expect(e.sender.refresh).toHaveBeenCalled();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.sender._isSelecting).toEqual(false);
        });
    });

    describe(".TypeDropdownChange", function () {
        it("should set value and close popup", function () {
            // prepare
            var e = {
                currentTarget: $('<div/>').data('type', 'type_option')
            };
            var dropdown = {
                close: $.noop
            };
            spyOn(displayChartResultHandler, 'SetType');
            spyOn(displayChartResultHandler, 'UpdateTypeDropdownValue');
            spyOn(displayChartResultHandler, 'UpdateAggregationUI');
            spyOn(dropdown, 'close');
            displayChartResultHandler.TypeDropdownChange(dropdown, e);

            // assert
            expect(displayChartResultHandler.SetType).toHaveBeenCalled();
            expect(displayChartResultHandler.UpdateTypeDropdownValue).toHaveBeenCalled();
            expect(displayChartResultHandler.UpdateAggregationUI).toHaveBeenCalled();
            expect(dropdown.close).toHaveBeenCalled();
        });
    });

    describe(".UpdateTypeDropdownValue", function () {
        var dropdown;
        beforeEach(function () {
            dropdown = {
                dataItems: ko.observableArray([
                    { Code: 'area', Types: ['type1', 'type2', 'type3'], Hints: ['hint1', 'hint2', 'hint3'] },
                    { Code: 'column', Types: ['type11', 'type22', 'type33'], Hints: ['hint11', 'hint22', 'hint33'] }
                ]),
                value: $.noop,
                _selectValue: $.noop,
                refresh: $.noop
            };
            spyOn(dropdown, 'value');
            spyOn(dropdown, '_selectValue');
            spyOn(dropdown, 'refresh');
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'UpdateCountField');
        });
        it('should not update count field state', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('column');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(true);
            spyOn(displayChartResultHandler, 'IsStacked').and.returnValue(false);
            displayChartResultHandler.UpdateTypeDropdownValue(dropdown, false);

            // assert
            expect(dropdown.dataItems()[0].Type).toEqual(null);
            expect(dropdown.dataItems()[0].Hint).toEqual(null);
            expect(dropdown.dataItems()[1].Type).toEqual('type33');
            expect(dropdown.dataItems()[1].Hint).toEqual('hint33');
            expect(dropdown.value).toHaveBeenCalled();
            expect(dropdown._selectValue).toHaveBeenCalled();
            expect(dropdown.refresh).toHaveBeenCalled();
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.UpdateCountField).not.toHaveBeenCalled();
        });
        it('should update value (multi_axis=true)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('column');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(true);
            spyOn(displayChartResultHandler, 'IsStacked').and.returnValue(false);
            displayChartResultHandler.UpdateTypeDropdownValue(dropdown, true);

            // assert
            expect(dropdown.dataItems()[0].Type).toEqual(null);
            expect(dropdown.dataItems()[0].Hint).toEqual(null);
            expect(dropdown.dataItems()[1].Type).toEqual('type33');
            expect(dropdown.dataItems()[1].Hint).toEqual('hint33');
            expect(dropdown.value).toHaveBeenCalled();
            expect(dropdown._selectValue).toHaveBeenCalled();
            expect(dropdown.refresh).toHaveBeenCalled();
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.UpdateCountField).toHaveBeenCalled();
        });
        it('should update value (stack=true)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('column');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(false);
            spyOn(displayChartResultHandler, 'IsStacked').and.returnValue(true);
            displayChartResultHandler.UpdateTypeDropdownValue(dropdown, true);

            // assert
            expect(dropdown.dataItems()[0].Type).toEqual(null);
            expect(dropdown.dataItems()[0].Hint).toEqual(null);
            expect(dropdown.dataItems()[1].Type).toEqual('type22');
            expect(dropdown.dataItems()[1].Hint).toEqual('hint22');
            expect(dropdown.value).toHaveBeenCalled();
            expect(dropdown._selectValue).toHaveBeenCalled();
            expect(dropdown.refresh).toHaveBeenCalled();
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.UpdateCountField).toHaveBeenCalled();
        });
        it('should update value (multi_axis=false, stack=false)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('column');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(false);
            spyOn(displayChartResultHandler, 'IsStacked').and.returnValue(false);
            displayChartResultHandler.UpdateTypeDropdownValue(dropdown, true);

            // assert
            expect(dropdown.dataItems()[0].Type).toEqual(null);
            expect(dropdown.dataItems()[0].Hint).toEqual(null);
            expect(dropdown.dataItems()[1].Type).toEqual('type11');
            expect(dropdown.dataItems()[1].Hint).toEqual('hint11');
            expect(dropdown.value).toHaveBeenCalled();
            expect(dropdown._selectValue).toHaveBeenCalled();
            expect(dropdown.refresh).toHaveBeenCalled();
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.UpdateCountField).toHaveBeenCalled();
        });
        it('should not update value', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('xxx');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(false);
            spyOn(displayChartResultHandler, 'IsStacked').and.returnValue(false);
            displayChartResultHandler.UpdateTypeDropdownValue(dropdown, true);

            // assert
            expect(dropdown.dataItems()[0].Type).toEqual(null);
            expect(dropdown.dataItems()[0].Hint).toEqual(null);
            expect(dropdown.dataItems()[1].Type).toEqual(null);
            expect(dropdown.dataItems()[1].Hint).toEqual(null);
            expect(dropdown.value).not.toHaveBeenCalled();
            expect(dropdown._selectValue).not.toHaveBeenCalled();
            expect(dropdown.refresh).not.toHaveBeenCalled();
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.UpdateCountField).not.toHaveBeenCalled();
        });
    });

    describe(".GetTypeDataSource", function () {
        it('should get data source', function () {
            // prepare
            var result = displayChartResultHandler.GetTypeDataSource();

            // assert
            expect(result.length).toEqual(10);
        });
    });

    describe(".GetType", function () {
        it('should get chart type', function () {
            // prepare
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions({ chart_type: 'my-type' });
            var result = displayChartResultHandler.GetType();

            // assert
            expect(result).toEqual('my-type');
        });
    });

    describe(".SetType", function () {
        it('should set chart type', function () {
            // prepare
            displayChartResultHandler.SetType('my-new-type');

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions().chart_type).toEqual('my-new-type');
        });
    });

    describe(".IsStacked", function () {
        it('should be stack', function () {
            // prepare
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions({ stack: true });
            var result = displayChartResultHandler.IsStacked();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".IsMultiAxis", function () {
        it('should be multiple axis', function () {
            // prepare
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions({ multi_axis: true });
            var result = displayChartResultHandler.IsMultiAxis();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetLocalizationTextByType", function () {
        var tests = [
            { type: 'bar', expected: 'Categories (vertical axis)' },
            { type: 'pie', expected: 'Categories' },
            { type: 'donut', expected: 'Categories' },
            { type: 'radarLine', expected: 'Categories (circle axis)' },
            { type: 'gauge', expected: 'Categories (horizontal axis)' },
            { type: 'others', expected: 'Categories (horizontal axis)' }
        ];
        $.each(tests, function (index, test) {
            it('should get text (' + test.type + ')', function () {
                // prepare
                var result = displayChartResultHandler.GetLocalizationTextByType(test.type, 'ChartRowArea');

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetGaugeSettings", function () {
        it('should get a default values', function () {
            // prepare
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions({});
            var result = displayChartResultHandler.GetGaugeSettings();

            // assert
            expect(result.values).toEqual([0, 20, 40, 60, 80, 100]);
            expect(result.colors).toEqual(['#ed0000', '#eda100', '#4dc632', '#eda100', '#ed0000']);
        });
        it('should get a saved values', function () {
            // prepare
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions({
                GaugeValues: [1, 2, 3],
                GaugeColours: ['color1', 'color2']
            });
            var result = displayChartResultHandler.GetGaugeSettings();

            // assert
            expect(result.values).toEqual([1, 2, 3]);
            expect(result.colors).toEqual(['color1', 'color2']);
        });
    });

    describe(".SetGaugeSettings", function () {
        it('should set gauge settings', function () {
            // prepare
            var values = [1, 2, 3];
            var colors = ['color1', 'color2'];
            displayChartResultHandler.SetGaugeSettings(values, colors);

            // assert
            var options = displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(options.GaugeValues).toEqual(values);
            expect(options.GaugeColours).toEqual(colors);
        });
    });

    describe(".SetGaugeColor", function () {
        it('should set gauge color', function () {
            // prepare
            var e = {
                sender: {
                    value: ko.observable('my-color')
                }
            };
            displayChartResultHandler.SetGaugeColor(2, e);

            // assert
            var options = displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(options.GaugeColours[2]).toEqual('my-color');
        });
    });

    describe(".SetGaugeValue", function () {
        it('should set gauge value', function () {
            // prepare
            var e = {
                sender: {
                    value: ko.observable(888)
                }
            };
            displayChartResultHandler.SetGaugeValue(2, e);

            // assert
            var options = displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(options.GaugeValues[2]).toEqual(888);
        });
    });

    describe(".UpdateGaugeValues", function () {
        it('should set gauge value', function () {
            // prepare
            var values = [5, 6, 7];
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'RefreshAggregationUI');
            displayChartResultHandler.UpdateGaugeValues(values);

            // assert
            var options = displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(options.GaugeValues).toEqual(values);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.RefreshAggregationUI).toHaveBeenCalled();
        });
    });

    describe(".CheckGaugeUI", function () {
        beforeEach(function () {
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation([
                { area: ko.observable('row'), is_selected: ko.observable(true) },
                { area: ko.observable('column'), is_selected: ko.observable(true) },
                { area: ko.observable('data'), is_selected: ko.observable(true) }
            ]);
            spyOn(displayChartResultHandler, 'ResetAggregationView');
            spyOn(displayChartResultHandler, 'InitialGaugeUI');
        });
        it('should check gauge UI (gauge, valid)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(true);
            spyOn(displayChartResultHandler, 'IsValidUI').and.returnValue(true);
            displayChartResultHandler.CheckGaugeUI();

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[0].is_selected()).toEqual(false);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[1].is_selected()).toEqual(false);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[2].is_selected()).toEqual(true);
            expect(displayChartResultHandler.ResetAggregationView).not.toHaveBeenCalled();
            expect(displayChartResultHandler.InitialGaugeUI).not.toHaveBeenCalled();
        });
        it('should check gauge UI (gauge, invalid)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(true);
            spyOn(displayChartResultHandler, 'IsValidUI').and.returnValue(false);
            displayChartResultHandler.CheckGaugeUI();

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[0].is_selected()).toEqual(false);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[1].is_selected()).toEqual(false);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[2].is_selected()).toEqual(true);
            expect(displayChartResultHandler.ResetAggregationView).toHaveBeenCalled();
            expect(displayChartResultHandler.InitialGaugeUI).toHaveBeenCalled();
        });
        it('should check gauge UI (column, invalid)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(false);
            spyOn(displayChartResultHandler, 'IsValidUI').and.returnValue(false);
            displayChartResultHandler.CheckGaugeUI();

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[0].is_selected()).toEqual(true);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[1].is_selected()).toEqual(true);
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[2].is_selected()).toEqual(true);
            expect(displayChartResultHandler.ResetAggregationView).toHaveBeenCalled();
            expect(displayChartResultHandler.InitialGaugeUI).not.toHaveBeenCalled();
        });
    });

    describe(".InitialGaugeUI", function () {
        beforeEach(function () {
            $.fn.kendoPercentageTextBox = $.noop;
            $.fn.kendoNumericTextBox = $.noop;
            $.fn.kendoCustomColorPicker = $.noop;
            spyOn($.fn, 'kendoPercentageTextBox');
            spyOn($.fn, 'kendoNumericTextBox');
            spyOn($.fn, 'kendoCustomColorPicker');
        });
        it('should initial gauge UI (percentage)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetGaugeFieldType').and.returnValue('percentage');
            displayChartResultHandler.InitialGaugeUI();

            // assert
            expect($.fn.kendoPercentageTextBox).toHaveBeenCalledTimes(6);
            expect($.fn.kendoNumericTextBox).toHaveBeenCalledTimes(0);
            expect($.fn.kendoCustomColorPicker).toHaveBeenCalledTimes(5);
        });
        it('should initial gauge UI (others)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetGaugeFieldType').and.returnValue('others');
            displayChartResultHandler.InitialGaugeUI();

            // assert
            expect($.fn.kendoPercentageTextBox).toHaveBeenCalledTimes(0);
            expect($.fn.kendoNumericTextBox).toHaveBeenCalledTimes(6);
            expect($.fn.kendoCustomColorPicker).toHaveBeenCalledTimes(5);
        });
    });

    describe(".GetGaugeFieldType", function () {
        it('should get int (no metadata)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([
                { is_selected: false }
            ]);
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
            var result = displayChartResultHandler.GetGaugeFieldType();

            // assert
            expect(result).toEqual('int');
        });
        it('should not get int (has metadata)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([
                { is_selected: true }
            ]);
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({ fieldtype: 'my-type' });
            var result = displayChartResultHandler.GetGaugeFieldType();

            // assert
            expect(result).toEqual('my-type');
        });
    });

    describe(".ValidateGaugeType", function () {
        it('should be true (gauge, valid)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(true);
            spyOn(displayChartResultHandler, 'GetGaugeSettings').and.returnValue({ values: [0, 1, 2] });
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateGaugeType();

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
        it('should be true (not gauge, invalid)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(false);
            spyOn(displayChartResultHandler, 'GetGaugeSettings').and.returnValue({ values: [0, 2, 1] });
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateGaugeType();

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
        it('should be false (gauge, invalid ascending)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(true);
            spyOn(displayChartResultHandler, 'GetGaugeSettings').and.returnValue({ values: [0, 2, 1] });
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateGaugeType();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be false (gauge, invalid descending)', function () {
            // prepare
            spyOn(ChartHelper, 'IsGaugeType').and.returnValue(true);
            spyOn(displayChartResultHandler, 'GetGaugeSettings').and.returnValue({ values: [2, 0, 1] });
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateGaugeType();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
    });

    describe(".ShowAggregationOptions", function () {
        it('should not show popup', function () {
            // prepare
            var handler = { ShowPopup: $.noop };
            spyOn(handler, 'ShowPopup');
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'CanChangeAggregationOptions').and.returnValue(false);
            spyOn(window, 'ChartOptionsHandler').and.returnValue(handler);
            displayChartResultHandler.ShowAggregationOptions();

            // assert
            expect(handler.ShowPopup).not.toHaveBeenCalled();
        });
        it('should show popup', function () {
            // prepare
            var handler = { ShowPopup: $.noop };
            spyOn(handler, 'ShowPopup');
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'CanChangeAggregationOptions').and.returnValue(true);
            spyOn(window, 'ChartOptionsHandler').and.returnValue(handler);
            displayChartResultHandler.ShowAggregationOptions();

            // assert
            expect(handler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".EnsureAggregationOptions", function () {
        var optionHandler;
        beforeEach(function () {
            optionHandler = { SetOptions: $.noop };
            spyOn(optionHandler, 'SetOptions');
            spyOn(window, 'ChartOptionsHandler').and.returnValue(optionHandler);
        });
        it('should update options', function () {
            // prepare
            displayChartResultHandler.EnsureAggregationOptions();

            // assert
            expect(optionHandler.SetOptions).toHaveBeenCalled();
        });
    });

    describe(".CalculateValuesBoundary", function () {
        it('should calculate from view', function () {
            // prepare
            spyOn(chartHandler, 'CalculateValuesBoundary');
            displayChartResultHandler.CalculateValuesBoundary();

            // assert
            expect(chartHandler.CalculateValuesBoundary).toHaveBeenCalled();
        });
    });

    describe(".InitialAggregationUI", function () {
        it('should initial UI', function () {
            // prepare
            spyOn(displayChartResultHandler, 'CreateTypeDropdown');
            spyOn(displayChartResultHandler, 'UpdateAggregationUI');
            displayChartResultHandler.InitialAggregationUI($());

            // assert
            expect(displayChartResultHandler.CreateTypeDropdown).toHaveBeenCalled();
            expect(displayChartResultHandler.UpdateAggregationUI).toHaveBeenCalled();
        });
    });

    describe(".UpdateAggregationUI", function () {
        it('should update UI', function () {
            // prepare
            spyOn(displayChartResultHandler, 'SetAggregationTexts');
            spyOn(displayChartResultHandler, 'CheckGaugeUI');
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'InitialAggregationSortable');
            displayChartResultHandler.UpdateAggregationUI();

            // assert
            expect(displayChartResultHandler.SetAggregationTexts).toHaveBeenCalled();
            expect(displayChartResultHandler.CheckGaugeUI).toHaveBeenCalled();
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.InitialAggregationSortable).toHaveBeenCalled();
        });
    });

    describe(".IsValidUI", function () {
        var tests = [
            {
                data: {
                    className: 'query-aggregation-gauge',
                    dataRole: 'percentagetextbox',
                    gauge: true,
                    fieldtype: 'percentage'
                },
                exptected: true
            },
            {
                data: {
                    className: 'query-aggregation-gauge',
                    dataRole: 'numerictextbox',
                    gauge: true,
                    fieldtype: 'int'
                },
                exptected: true
            },
            {
                data: {
                    className: 'query-aggregation-xxx',
                    dataRole: 'any',
                    gauge: false,
                    fieldtype: 'any'
                },
                exptected: true
            },
            {
                data: {
                    className: 'query-aggregation-gauge',
                    dataRole: 'percentagetextbox',
                    gauge: true,
                    fieldtype: 'int'
                },
                exptected: false
            },
            {
                data: {
                    className: 'query-aggregation-gauge',
                    dataRole: 'numerictextbox',
                    gauge: true,
                    fieldtype: 'percentage'
                },
                exptected: false
            }
        ];
        $.each(tests, function (index, test) {
            var title = test.exptected ? 'should be valid' : 'should be invalid';
            title += ' ' + JSON.stringify(test.data);
            it(title, function () {
                // prepare
                var container = $('<div><div class="' + test.data.className + '"><input data-role="' + test.data.dataRole + '"/></div></div>');
                
                spyOn(displayChartResultHandler, 'CreateTypeDropdown');
                spyOn(displayChartResultHandler, 'UpdateAggregationUI');
                spyOn(ChartHelper, 'IsGaugeType').and.returnValue(test.data.gauge);
                spyOn(displayChartResultHandler, 'GetGaugeFieldType').and.returnValue(test.data.fieldtype);
                displayChartResultHandler.InitialAggregationUI(container);
                var result = !!displayChartResultHandler.IsValidUI();

                // assert
                expect(result).toEqual(test.exptected);
            });
        });
    });

    describe(".ResetAggregationView", function () {
        it('should reset view', function () {
            // prepare
            spyOn(WC.HtmlHelper, 'DestroyDropdownPopup');
            displayChartResultHandler.ResetAggregationView();

            // assert
            expect(WC.HtmlHelper.DestroyDropdownPopup).toHaveBeenCalled();
        });
    });

    describe(".SetAggregationTexts", function () {
        it('should set texts', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetLocalizationTextByType').and.returnValues('row header', 'column header', 'data header');
            displayChartResultHandler.SetAggregationTexts();

            // assert
            var texts = displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Texts();
            expect(texts.AggregationTitle).toEqual(Captions.Title_AggregationChart);
            expect(texts.AggregationHeaderGauge).toEqual(Localization.ChartGaugeSetting);
            expect(texts.AggregationHeaderRow).toEqual('row header');
            expect(texts.AggregationHeaderColumn).toEqual('column header');
            expect(texts.AggregationHeaderData).toEqual('data header');
            expect(texts.AggregationConfirmDiscardChanges).toEqual(kendo.format(Localization.PopupConfirmDiscardChangeFieldSettingAndContinue, 'chart'));
        });
    });

    describe(".SetAggregationFormatTexts", function () {
        it('should set texts', function () {
            // prepare
            var texts = {};
            displayChartResultHandler.SetAggregationFormatTexts(texts);

            // assert
            expect(texts.HeaderAlias).toEqual(Localization.NameAsShowInChart);
        });
    });

    describe(".CanSortField", function () {
        var tests = [
            {
                data: {
                    type: 'area',
                    area: 'data',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: true
            },
            {
                data: {
                    type: 'bar',
                    area: 'data',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: true
            },
            {
                data: {
                    type: 'column',
                    area: 'data',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: true
            },
            {
                data: {
                    type: 'line',
                    area: 'data',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: true
            },
            {
                data: {
                    type: 'area',
                    area: 'any',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: false
            },
            {
                data: {
                    type: 'area',
                    area: 'any',
                    valid: false,
                    is_selected: true,
                    authorization: true
                },
                expected: false
            },
            {
                data: {
                    type: 'area',
                    area: 'data',
                    valid: true,
                    is_selected: false,
                    authorization: true
                },
                expected: false
            },
            {
                data: {
                    type: 'area',
                    area: 'data',
                    valid: true,
                    is_selected: true,
                    authorization: false
                },
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var title = test.expected ? 'can sort field ' : 'cannot sort field ';
            title += JSON.stringify(test.data);
            it(title, function () {
                // prepare
                var aggregation = {
                    area: ko.observable(test.data.area),
                    valid: ko.observable(test.data.valid),
                    is_selected: ko.observable(test.data.is_selected)
                };
                spyOn(displayChartResultHandler, 'GetType').and.returnValue(test.data.type);
                spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Authorizations, 'CanChangeAggregation').and.returnValue(test.data.authorization);
                var result = displayChartResultHandler.CanSortField(aggregation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".SortField", function () {
        var aggregation;
        beforeEach(function () {
            aggregation = { sorting: ko.observable('') };
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation([
                { sorting: ko.observable('desc') },
                { sorting: ko.observable('asc') },
                aggregation
            ]);
        });
        it('should be ascending (current=)', function () {
            // prepare
            aggregation.sorting('');
            displayChartResultHandler.SortField(aggregation);

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[0].sorting()).toEqual('');
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[1].sorting()).toEqual('');
            expect(aggregation.sorting()).toEqual('desc');
        });
        it('should be ascending (current=asc)', function () {
            // prepare
            aggregation.sorting('asc');
            displayChartResultHandler.SortField(aggregation);

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[0].sorting()).toEqual('');
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[1].sorting()).toEqual('');
            expect(aggregation.sorting()).toEqual('');
        });
        it('should be descending (current=desc)', function () {
            // prepare
            aggregation.sorting('desc');
            displayChartResultHandler.SortField(aggregation);

            // assert
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[0].sorting()).toEqual('');
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation()[1].sorting()).toEqual('');
            expect(aggregation.sorting()).toEqual('asc');
        });
    });

    describe(".GetAggregationSortingClassName", function () {
        it('should get icon (no sorting)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('') };
            var result = displayChartResultHandler.GetAggregationSortingClassName(aggregation);

            // assert
            expect(result).toEqual('icon-sort-no');
        });
        it('should get icon (ascending)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('asc') };
            var result = displayChartResultHandler.GetAggregationSortingClassName(aggregation);

            // assert
            expect(result).toEqual('icon-sort-asc');
        });
        it('should get icon (descending)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('desc') };
            var result = displayChartResultHandler.GetAggregationSortingClassName(aggregation);

            // assert
            expect(result).toEqual('icon-sort-desc');
        });
    });

    describe(".GetAggregationFieldLimit", function () {
        var tests = [
            {
                data: {
                    gauge: true,
                    area: 'any',
                    multi_axis: 'any'
                },
                expected: 0
            },
            {
                data: {
                    gauge: true,
                    area: 'data',
                    multi_axis: false
                },
                expected: 2
            },
            {
                data: {
                    gauge: false,
                    area: 'data',
                    multi_axis: false
                },
                expected: 2
            },
            {
                data: {
                    gauge: false,
                    area: 'data',
                    multi_axis: true
                },
                expected: 3
            },
            {
                data: {
                    gauge: false,
                    area: 'any',
                    multi_axis: 'any'
                },
                expected: 1
            }
        ];
        $.each(tests, function (index, test) {
            var title = 'should be ' + test.expected + ' ' + JSON.stringify(test.data);
            it(title, function () {
                // prepare
                spyOn(ChartHelper, 'IsGaugeType').and.returnValue(test.data.gauge);
                spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(test.data.multi_axis);
                var result = displayChartResultHandler.GetAggregationFieldLimit(test.data.area);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanChangeCountFieldState", function () {
        it('can change count field state', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('any');
            spyOn(displayChartResultHandler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([{}, {}]);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Authorizations, 'CanChangeAggregation').and.returnValue(true);
            var result = displayChartResultHandler.CanChangeCountFieldState();

            // assert
            expect(result).toEqual(true);
        });
        it('cannot change count field state (bubble)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('bubble');
            spyOn(displayChartResultHandler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([{}, {}]);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Authorizations, 'CanChangeAggregation').and.returnValue(true);
            var result = displayChartResultHandler.CanChangeCountFieldState();

            // assert
            expect(result).toEqual(false);
        });
        it('cannot change count field state (data fields < limit)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('any');
            spyOn(displayChartResultHandler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([{}]);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Authorizations, 'CanChangeAggregation').and.returnValue(true);
            var result = displayChartResultHandler.CanChangeCountFieldState();

            // assert
            expect(result).toEqual(false);
        });
        it('cannot change count field state (no authorization)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('any');
            spyOn(displayChartResultHandler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([{}, {}]);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Authorizations, 'CanChangeAggregation').and.returnValue(false);
            var result = displayChartResultHandler.CanChangeCountFieldState();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".ValidateAggregation", function () {
        beforeEach(function () {
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationRowFields').and.returnValue([]);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationColumnFields').and.returnValue([]);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([]);
            spyOn(popup, 'Alert');
        });
        it('should be valid', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });

        it('should not be valid (has error)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(true);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });

        it('should not be valid (has a duplicated)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });

        it('should not be valid (invalid row & column)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
        });

        it('should not be valid (invalid row)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
        });

        it('should not be valid (invalid data)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
        });

        it('should not be valid (invalid bubble & scatter)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(true);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
        });

        it('should not be valid (invalid gauge)', function () {
            // prepare
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayChartResultHandler, 'ValidateRowAndColumnFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateRowFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateDataFields').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateBubbleAndScatterRowField').and.returnValue(true);
            spyOn(displayChartResultHandler, 'ValidateGaugeType').and.returnValue(false);
            var result = displayChartResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".ValidateRowAndColumnFields", function () {
        it('should be invalid (row fields > 1)', function () {
            // prepare
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateRowAndColumnFields([{}, {}], [{}]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be invalid (column fields > 1)', function () {
            // prepare
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateRowAndColumnFields([{}], [{}, {}]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be valid', function () {
            // prepare
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateRowAndColumnFields([{}], []);

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
    });

    describe(".ValidateRowFields", function () {
        it('should be invalid', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('any');
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateRowFields([]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be valid (row fields > 0)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('any');
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateRowFields([{}]);

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
        it('should be valid (gauge)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('gauge');
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateRowFields([]);

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
    });

    describe(".ValidateDataFields", function () {
        it('should be invalid (bubble, data fields = 0)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('bubble');
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be invalid (bubble, data fields > 2)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('bubble');
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([{}, {}, {}]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be valid (bubble, data fields = 2)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('bubble');
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([{}, {}]);

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
        it('should be invalid (others, multiple axis, data fields != 2)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('others');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(true);
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([{}]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be valid (others, multiple axis, data fields = 2)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('others');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(true);
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([{}, {}]);

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
        it('should be invalid (others, single axis, data fields != 1)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('others');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(false);
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([{}, {}]);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
        it('should be valid (others, single axis, data fields = 1)', function () {
            // prepare
            spyOn(displayChartResultHandler, 'GetType').and.returnValue('others');
            spyOn(displayChartResultHandler, 'IsMultiAxis').and.returnValue(false);
            spyOn(popup, 'Alert');
            var result = displayChartResultHandler.ValidateDataFields([{}]);

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
    });

    describe('.ValidateBubbleAndScatterRowField', function () {
        var tests = [
            {
                data: {
                    field: null,
                    valid_type: true,
                    fieldtype: 'currency'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: false,
                    fieldtype: 'currency'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'currency'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'int'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'period'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'double'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'percentage'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'date'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'datetime'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'time'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'timespan'
                },
                expected: true
            },
            {
                data: {
                    field: {},
                    valid_type: true,
                    fieldtype: 'others'
                },
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var title = test.expected ? 'should be invalid' : 'should be valid';
            title += JSON.stringify(test.data);
            it(title, function () {
                // prepare
                spyOn(displayChartResultHandler, 'GetType').and.returnValue('my-type');
                spyOn(ChartHelper, 'IsScatterOrBubbleType').and.returnValue(test.data.valid_type);
                spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({ fieldtype: test.data.fieldtype });
                spyOn(popup, 'Alert');
                var result = displayChartResultHandler.ValidateBubbleAndScatterRowField(test.data.field);

                // assert
                expect(result).toEqual(test.expected);
                if (!test.expected)
                    expect(popup.Alert).toHaveBeenCalled();
                else
                    expect(popup.Alert).not.toHaveBeenCalled();
            });
        });
    });

    describe('.OnAggregationChangeCallback', function () {
        var item = {
            area: $.noop
        };

        it('should set not do anything', function () {           
            spyOn(item, 'area');

            displayChartResultHandler.OnAggregationChangeCallback([], 'newArea', 1, 0);

            expect(item.area).not.toHaveBeenCalled();
        });

        it('should set item area but not swap index when oldIndex and newIndex are different', function () {           
            spyOn(item, 'area');

            displayChartResultHandler.OnAggregationChangeCallback([item], 'newArea', 1, 0);

            expect(item.area).toHaveBeenCalledWith('newArea');
        });

        it('should set item area and swap index when oldIndex and newIndex are the same', function () {
            spyOn(item, 'area');
            spyOn(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation, 'moveTo');

            displayChartResultHandler.OnAggregationChangeCallback([item], 'newArea', 0, 0);

            expect(item.area).toHaveBeenCalledWith('newArea');
            expect(displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.Aggregation.moveTo).toHaveBeenCalled();
        });

    });
    describe(".CanAddReferenceLine", function () {
        it('should return true if reference line can be added', function () {
            spyOn(displayChartResultHandler, 'GetType').and.returnValue(enumHandlers.CHARTTYPE.BARCHART.Code)
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields = function () {
                return {
                    findObjects: function () { return [{ 'is_selected': function () { return true; } }]; }
                };
            };
            var aggregation = {
                area: function () { return "data"; },
                is_selected: function () { return true; }
            };
            var canAddReferenceLine = displayChartResultHandler.CanAddReferenceLine(aggregation);
            expect(canAddReferenceLine).toBeTruthy();
        });
        it('should return false if reference line can be added', function () {
            spyOn(displayChartResultHandler, 'GetType').and.returnValue(enumHandlers.CHARTTYPE.BARCHART.Code)
            displayChartResultHandler.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields = function () {
                return {
                    findObjects: function () { return [{ 'is_selected': function () { return true; } }]; }
                };
            };
            var aggregation = {
                area: function () { return "data"; },
                is_selected: function () { return false; }
            };
            var canAddReferenceLine = displayChartResultHandler.CanAddReferenceLine(aggregation);
            expect(canAddReferenceLine).toBeFalsy();
        });
    });
    describe(".ShowAddReferenceLinePopup", function () {

        it('should call showpopup function', function () {
            var handler = { ShowPopup: $.noop };
            spyOn(handler, 'ShowPopup');
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(true);
            spyOn(displayChartResultHandler, 'CanAddReferenceLine').and.returnValue(true);
            var aggregation = {
                source_field: '', model: '', details: function () { return {}; }
            };
            spyOn(window, 'TargetLineHandler').and.returnValue(handler);
            displayChartResultHandler.ShowAddReferenceLinePopup(aggregation);
            expect(handler.ShowPopup).toHaveBeenCalled();
        });

    });
});
