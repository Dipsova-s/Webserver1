/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />

describe("ChartOptionsHandler", function () {
    var chartOptionsHandler;
    beforeEach(function () {
        chartOptionsHandler = new ChartOptionsHandler(new DisplayHandler({ display_type: 'chart' }, new AngleHandler({})));
        jQuery.each(chartOptionsHandler.Data, function (_index, model) {
            model.valid(false);
        });
    });

    describe(".Initial", function () {
        it('should set DisplayHandler', function () {
            // assert
            expect(chartOptionsHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
            $.each(chartOptionsHandler.Data, function (index, data) {
                if (data.options.length) {
                    expect(data.options.findObjects('is_default', true).length).toEqual(1);
                }
            });
        });
    });

    describe(".SetOptions", function () {
        it('should set options', function () {
            // prepare
            chartOptionsHandler.Data.show_as_percentage.valid(true);
            chartOptionsHandler.Data.show_as_percentage.value('my-new-show_as_percentage');
            chartOptionsHandler.Data.rangesgauge.valid(true);
            chartOptionsHandler.Data.rangesgauge.value('my-new-rangesgauge');
            spyOn(chartOptionsHandler, 'GetOptions').and.returnValue({
                chart_type: 'my-type',
                show_as_percentage: 'my-old-show_as_percentage',
                axistitle: 'my-old-axistitle'
            });
            chartOptionsHandler.SetOptions();

            // assert
            var result = chartOptionsHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(result.chart_type).toEqual('my-type');
            expect(result.axistitle).not.toBeDefined();
            expect(result.show_as_percentage).toEqual('my-new-show_as_percentage');
            expect(result.rangesgauge).toEqual('my-new-rangesgauge');
        });
        it('should set options and axis scale ranges', function () {
            // prepare
            chartOptionsHandler.Data.axisscale.valid(true);
            chartOptionsHandler.Data.axisscale.value('manual');
            spyOn(chartOptionsHandler, 'GetOptions').and.returnValue({
                chart_type: 'my-type',
                show_as_percentage: 'my-old-show_as_percentage',
                axistitle: 'my-old-axistitle'
            });
            chartOptionsHandler.SetOptions();

            // assert
            var result = chartOptionsHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(result.chart_type).toEqual('my-type');
            expect(result.axistitle).not.toBeDefined();
            expect(result.show_as_percentage).not.toBeDefined();
            expect(result.rangesgauge).not.toBeDefined();
            expect(result.axisscale).toEqual('manual');
            expect(result.axisscale_ranges).toEqual({});
        });
    });

    describe(".GetValidOptions", function () {
        it('should get options for gauge', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetType').and.returnValue('gauge');
            var result = chartOptionsHandler.GetValidOptions();

            // assert
            expect(result).toEqual(chartOptionsHandler.Group.Gauge);
        });
        it('should get options for radar', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetType').and.returnValue('radar');
            var result = chartOptionsHandler.GetValidOptions();

            // assert
            expect(result).toEqual(chartOptionsHandler.Group.Radar);
        });
        it('should get options for pie', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetType').and.returnValue('pie');
            var result = chartOptionsHandler.GetValidOptions();

            // assert
            expect(result).toEqual(chartOptionsHandler.Group.Pie);
        });
        it('should get options for others (box1)', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetType').and.returnValue('others');
            spyOn(chartOptionsHandler, 'CanShowAsPercentage').and.returnValue(true);
            var result = chartOptionsHandler.GetValidOptions();

            // assert
            expect(result).toEqual(chartOptionsHandler.Group.Box1);
        });
        it('should get options for others (box2)', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetType').and.returnValue('others');
            spyOn(chartOptionsHandler, 'CanShowAsPercentage').and.returnValue(false);
            var result = chartOptionsHandler.GetValidOptions();

            // assert
            expect(result).toEqual(chartOptionsHandler.Group.Box2);
        });
    });

    describe(".SetValidOptions", function () {
        it('should set valid options', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetValidOptions').and.returnValue(['axistitlegauge', 'datalabel']);
            chartOptionsHandler.SetValidOptions();

            // assert
            expect(chartOptionsHandler.Data.axistitlegauge.valid()).toEqual(true);
            expect(chartOptionsHandler.Data.datalabel.valid()).toEqual(true);
        });
    });

    describe(".SetValues", function () {
        it('should set change axisscale value to automatic', function () {
            // prepare
            chartOptionsHandler.Data.axisscale.value('manual');
            chartOptionsHandler.Data.axisscale.valid(true);
            spyOn(chartOptionsHandler, 'CanUseAxisScaleRange').and.returnValue(false);
            chartOptionsHandler.SetValues();

            // assert
            expect(chartOptionsHandler.Data.axisscale.value()).toEqual('automatic');
        });
    });

    describe(".CanShowAsPercentage", function () {
        var tests = [
            { data: { type: 'bar', multi: true, stack: false }, expected: true },
            { data: { type: 'column', multi: false, stack: true }, expected: true },
            { data: { type: 'line', multi: true, stack: true }, expected: true },
            { data: { type: 'area', multi: true, stack: true }, expected: true },
            { data: { type: 'column', multi: false, stack: false }, expected: false },
            { data: { type: 'bubble', multi: true, stack: false }, expected: false },
            { data: { type: 'scatter', multi: false, stack: true }, expected: false }
        ];
        $.each(tests, function (index, test) {
            it('should be ' + test.expected + ' ' + JSON.stringify(test.data), function () {
                // prepare
                spyOn(chartOptionsHandler, 'GetType').and.returnValue(test.data.type);
                spyOn(ChartHelper, 'IsMultiAxis').and.returnValue(test.data.multi);
                spyOn(ChartHelper, 'IsStacked').and.returnValue(test.data.stack);
                var result = chartOptionsHandler.CanShowAsPercentage();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".HasChanged", function () {
        it('should be false', function () {
            // prepare
            var result = chartOptionsHandler.HasChanged();

            // assert
            expect(result).toEqual(false);
        });
        it('should be true', function () {
            // prepare
            chartOptionsHandler.Data.axisvalue.valid(true);
            chartOptionsHandler.Data.axisvalue.value('new-value');
            var result = chartOptionsHandler.HasChanged();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".ShowPopup", function () {
        var element;
        beforeEach(function () {
            element = $('<div id="PopupAggregationOptions"/>');
            element.appendTo('body');
            
            spyOn(popup, 'Show');
            spyOn(chartOptionsHandler, 'GetPopupOptions');
        });
        afterEach(function () {
            element.remove();
        });
        it('should show popup', function () {
            // prepare
            element.hide();
            chartOptionsHandler.ShowPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
        it('should not show popup', function () {
            // prepare
            element.show();
            chartOptionsHandler.ShowPopup();

            // assert
            expect(popup.Show).not.toHaveBeenCalled();
        });
    });

    describe(".ClosePopup", function () {
        it('should close popup', function () {
            // prepare
            spyOn(popup, 'Close');
            chartOptionsHandler.ClosePopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });

    describe(".OnPopupClose", function () {
        it('should not set options but destroy popup', function () {
            // prepare
            spyOn(chartOptionsHandler, 'HasChanged').and.returnValue(false);
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'OpenAggregationPanel');
            spyOn(chartOptionsHandler, 'SetOptions');
            spyOn(popup, 'Destroy');
            chartOptionsHandler.OnPopupClose({});

            // assert
            expect(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler.OpenAggregationPanel).not.toHaveBeenCalled();
            expect(chartOptionsHandler.SetOptions).not.toHaveBeenCalled();
            expect(popup.Destroy).toHaveBeenCalled();
        });
        it('should set options and destroy popup', function () {
            // prepare
            spyOn(chartOptionsHandler, 'HasChanged').and.returnValue(true);
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'OpenAggregationPanel');
            spyOn(chartOptionsHandler, 'SetOptions');
            spyOn(popup, 'Destroy');
            chartOptionsHandler.OnPopupClose({});

            // assert
            expect(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler.OpenAggregationPanel).toHaveBeenCalled();
            expect(chartOptionsHandler.SetOptions).toHaveBeenCalled();
            expect(popup.Destroy).toHaveBeenCalled();
        });
    });

    describe(".GetPopupOptions", function () {
        it('should get popup options', function () {
            // prepare
            spyOn($.fn, 'offset').and.returnValue({ left: 100, top: 50 });
            var result = chartOptionsHandler.GetPopupOptions();

            // assert
            expect(result.position).toEqual({ left: 125, top: 40 });
            expect(result.resizable).toEqual(false);
            expect(result.actions.length).toEqual(0);
        });
    });

    describe(".ShowPopupCallback", function () {
        var element;
        beforeEach(function () {
            element = $('<div class="k-overlay"/>').css('opacity', 0.5);
            element.appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it('should initial UI', function () {
            // prepare
            WC.Window.Height = 200;
            spyOn($.fn, 'offset').and.returnValue({ top: 100 });
            spyOn($.fn, 'outerHeight').and.returnValue(200);
            spyOn(chartOptionsHandler, 'InitialUI');
            chartOptionsHandler.ShowPopupCallback({ sender: { element: $(), wrapper: $() } });

            // assert
            expect(element.css('opacity')).toEqual('0');
            expect(chartOptionsHandler.InitialUI).toHaveBeenCalled();
        });
    });

    describe(".InitialUI", function () {
        it('should initial UI', function () {
            // prepare
            spyOn(chartOptionsHandler, 'GetValidOptions').and.returnValue(['show_as_percentage', 'rangesgauge', 'gridlineradar']);
            spyOn(chartOptionsHandler, 'CreateDropdown');
            spyOn(chartOptionsHandler, 'CreateCheckbox');
            chartOptionsHandler.InitialUI();

            // assert
            expect(chartOptionsHandler.CreateDropdown).toHaveBeenCalledTimes(2);
            expect(chartOptionsHandler.CreateCheckbox).toHaveBeenCalledTimes(1);
        });
    });

    describe(".CreateCheckbox", function () {
        it('should create checkbox and set value', function () {
            // prepare
            var element = $('<input type="checkbox"/>');
            chartOptionsHandler.Data.show_as_percentage.value(true);
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            spyOn(chartOptionsHandler, 'CheckShowAsPercentageUI');
            chartOptionsHandler.CreateCheckbox(element, chartOptionsHandler.Data.show_as_percentage);

            // assert
            expect(element.prop('checked')).toEqual(true);
            expect($.fn.off).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
            expect(chartOptionsHandler.CheckShowAsPercentageUI).toHaveBeenCalled();
        });
    });

    describe(".CheckboxChange", function () {
        it('should set value', function () {
            // prepare
            var e = { currentTarget: { checked: true } };
            chartOptionsHandler.Data.show_as_percentage.value(false);
            spyOn(chartOptionsHandler, 'CheckShowAsPercentageUI');
            chartOptionsHandler.CheckboxChange('show_as_percentage', e);

            // assert
            expect(chartOptionsHandler.Data.show_as_percentage.value()).toEqual(true);
            expect(chartOptionsHandler.CheckShowAsPercentageUI).toHaveBeenCalled();
        });
    });

    describe(".CheckShowAsPercentageUI", function () {
        beforeEach(function () {
            spyOn($.fn, 'show');
            spyOn($.fn, 'hide');
            chartOptionsHandler.Data.show_as_percentage.id = 'show_as_percentage';
        });
        it('should not do anything', function () {
            // prepare
            chartOptionsHandler.CheckShowAsPercentageUI({ id: 'any' });

            // assert
            expect($.fn.show).toHaveBeenCalledTimes(0);
            expect($.fn.hide).toHaveBeenCalledTimes(0);
        });
        it('should hide axis scale options', function () {
            // prepare
            chartOptionsHandler.Data.show_as_percentage.value(true);
            chartOptionsHandler.CheckShowAsPercentageUI(chartOptionsHandler.Data.show_as_percentage);

            // assert
            expect($.fn.show).toHaveBeenCalledTimes(0);
            expect($.fn.hide).toHaveBeenCalledTimes(2);
        });
        it('should show axis scale options', function () {
            // prepare
            chartOptionsHandler.Data.show_as_percentage.value(false);
            chartOptionsHandler.CheckShowAsPercentageUI(chartOptionsHandler.Data.show_as_percentage);

            // assert
            expect($.fn.show).toHaveBeenCalledTimes(2);
            expect($.fn.hide).toHaveBeenCalledTimes(0);
        });
    });

    describe(".CreateDropdown", function () {
        it('should create dropdown and set value', function () {
            // prepare
            var dropdown = { value: ko.observable(null) };
            chartOptionsHandler.Data.axisvalueradar.value('my-value');
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdown);
            spyOn(chartOptionsHandler, 'CheckAxisScaleRangesUI');
            chartOptionsHandler.CreateDropdown($(), chartOptionsHandler.Data.axisvalueradar);

            // assert
            expect(dropdown.value()).toEqual('my-value');
            expect(chartOptionsHandler.CheckAxisScaleRangesUI).toHaveBeenCalled();
        });
    });

    describe(".DropdownOpen", function () {
        it('should add css class name to dropdown popup', function () {
            // prepare
            var e = {
                sender: {
                    popup: { element: $('<div/>') }
                }
            };
            chartOptionsHandler.DropdownOpen(e);

            // assert
            expect(e.sender.popup.element.hasClass('aggregation-option-dropdown')).toEqual(true);
        });
    });

    describe(".DropdownChange", function () {
        it('should set value', function () {
            // prepare
            var e = { sender: { value: ko.observable('my-value') } };
            chartOptionsHandler.Data.axisvalueradar.value(null);
            spyOn(chartOptionsHandler, 'CheckAxisScaleRangesUI');
            chartOptionsHandler.DropdownChange('axisvalueradar', e);

            // assert
            expect(chartOptionsHandler.Data.axisvalueradar.value()).toEqual('my-value');
            expect(chartOptionsHandler.CheckAxisScaleRangesUI).toHaveBeenCalled();
        });
    });

    describe(".CheckAxisScaleRangesUI", function () {
        it('should not do anything', function () {
            // prepare
            spyOn($.fn, 'remove');
            spyOn(chartOptionsHandler, 'CreateAxisScaleRangesUI');
            chartOptionsHandler.CheckAxisScaleRangesUI(chartOptionsHandler.Data.axisvalueradar);

            // assert
            expect($.fn.remove).not.toHaveBeenCalled();
            expect(chartOptionsHandler.CreateAxisScaleRangesUI).not.toHaveBeenCalled();
        });
        it('should remove axis scale range rows', function () {
            // prepare
            spyOn($.fn, 'remove');
            spyOn(chartOptionsHandler, 'CreateAxisScaleRangesUI');
            chartOptionsHandler.Data.axisscale.id = 'axisscale';
            chartOptionsHandler.Data.axisscale.value('automatic');
            chartOptionsHandler.CheckAxisScaleRangesUI(chartOptionsHandler.Data.axisscale);

            // assert
            expect($.fn.remove).toHaveBeenCalled();
            expect(chartOptionsHandler.CreateAxisScaleRangesUI).not.toHaveBeenCalled();
        });
        it('should remove then create axis scale range rows', function () {
            // prepare
            spyOn($.fn, 'remove');
            spyOn(chartOptionsHandler, 'CreateAxisScaleRangesUI');
            chartOptionsHandler.Data.axisscale.id = 'axisscale';
            chartOptionsHandler.Data.axisscale.value('manual');
            chartOptionsHandler.CheckAxisScaleRangesUI(chartOptionsHandler.Data.axisscale);

            // assert
            expect($.fn.remove).toHaveBeenCalled();
            expect(chartOptionsHandler.CreateAxisScaleRangesUI).toHaveBeenCalled();
        });
    });

    describe(".CreateAxisScaleRangesUI", function () {
        it('should create UI', function () {
            // prepare
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([
                { field: $.noop },
                { field: $.noop }
            ]);
            spyOn(chartOptionsHandler, 'CanSetAxisScaleRange').and.returnValues(false, true);
            spyOn(chartOptionsHandler, 'GetAxisScaleRanges').and.returnValue({});
            spyOn(chartOptionsHandler, 'GetAxisScaleSettings').and.returnValue({});
            spyOn(chartOptionsHandler, 'GetAxisScaleBoundary').and.returnValue({});
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationName').and.returnValue({});
            spyOn(chartOptionsHandler, 'CreateAxisScaleRangeInput');
            chartOptionsHandler.CreateAxisScaleRangesUI();

            // assert
            expect(chartOptionsHandler.CreateAxisScaleRangeInput).toHaveBeenCalledTimes(2);
        });
    });

    describe(".CanSetAxisScaleRange", function () {
        var tests = [
            {
                title: 'can set axis scale range (count field)',
                is_selected: true,
                is_count_field: true,
                is_bubble_type: true,
                expected: true
            },
            {
                title: 'can set axis scale range (not bubble)',
                is_selected: true,
                is_count_field: false,
                is_bubble_type: false,
                expected: true
            },
            {
                title: 'cannot set axis scale range (not selected)',
                is_selected: false,
                is_count_field: true,
                is_bubble_type: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                var dataField = {
                    is_selected: ko.observable(test.is_selected),
                    is_count_field: ko.observable(test.is_count_field)
                };
                spyOn(ChartHelper, 'IsBubbleType').and.returnValue(test.is_bubble_type);
                var result = chartOptionsHandler.CanSetAxisScaleRange(dataField);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanUseAxisScaleRange", function () {
        it('cannot use axis scale range', function () {
            // prepare
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetRawAggregationData').and.returnValue([
                { field: ko.observable('f1'), is_selected: ko.observable(true), area: ko.observable('row') },
                { field: ko.observable('f2'), is_selected: ko.observable(true), area: ko.observable('column') },
                { field: ko.observable('f3'), is_selected: ko.observable(false), area: ko.observable('data') },
                { field: ko.observable('f4'), is_selected: ko.observable(true), area: ko.observable('data') }
            ]);
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'Aggregation').and.returnValue([
                { field: ko.observable('f2'), is_selected: ko.observable(true), area: ko.observable('row') },
                { field: ko.observable('f1'), is_selected: ko.observable(true), area: ko.observable('column') },
                { field: ko.observable('f3'), is_selected: ko.observable(false), area: ko.observable('data') },
                { field: ko.observable('f4'), is_selected: ko.observable(true), area: ko.observable('data') }
            ]);
            var result = chartOptionsHandler.CanUseAxisScaleRange();

            // assert
            expect(result).toEqual(false);
        });
        it('can use axis scale range', function () {
            // prepare
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetRawAggregationData').and.returnValue([
                { field: ko.observable('f1'), is_selected: ko.observable(true), area: ko.observable('row') },
                { field: ko.observable('f2'), is_selected: ko.observable(true), area: ko.observable('column') },
                { field: ko.observable('f4'), is_selected: ko.observable(false), area: ko.observable('data') },
                { field: ko.observable('f5'), is_selected: ko.observable(true), area: ko.observable('data') }
            ]);
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'Aggregation').and.returnValue([
                { field: ko.observable('f1'), is_selected: ko.observable(true), area: ko.observable('row') },
                { field: ko.observable('f2'), is_selected: ko.observable(true), area: ko.observable('column') },
                { field: ko.observable('f3'), is_selected: ko.observable(false), area: ko.observable('data') },
                { field: ko.observable('f4'), is_selected: ko.observable(true), area: ko.observable('data') }
            ]);
            var result = chartOptionsHandler.CanUseAxisScaleRange();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetAxisScaleRanges", function () {
        it('should not get axis scale ranges', function () {
            // prepare
            spyOn(chartOptionsHandler, 'CanUseAxisScaleRange').and.returnValue(false);
            var result = chartOptionsHandler.GetAxisScaleRanges();

            // assert
            expect(result).toEqual({});
        });
        it('should get axis scale ranges', function () {
            // prepare
            spyOn(chartOptionsHandler, 'CanUseAxisScaleRange').and.returnValue(true);
            spyOn(chartOptionsHandler, 'GetAxisScaleRangesFromView').and.returnValue({
                f1: [0, 100, 20],
                f2: [0, 100, 20]
            });
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([
                { field: ko.observable('f1'), is_selected: ko.observable(true) },
                { field: ko.observable('f2'), is_selected: ko.observable(false) },
                { field: ko.observable('f3'), is_selected: ko.observable(true) }
            ]);
            var result = chartOptionsHandler.GetAxisScaleRanges();

            // assert
            expect(result).toEqual({ f1: [0, 100, 20] });
        });
    });

    describe(".GetAxisScaleRangesFromView", function () {
        beforeEach(function () {
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([
                { field: ko.observable('f1'), is_selected: ko.observable(false) },
                { field: ko.observable('f2'), is_selected: ko.observable(true) },
                { field: ko.observable('f3'), is_selected: ko.observable(true) }
            ]);
            spyOn(chartOptionsHandler.DisplayHandler.DisplayResultHandler, 'CalculateValuesBoundary').and.returnValues(
                { min: 0, max: 100, majorUnit: 20 },
                { min: -100, max: 0, majorUnit: 25 }
            );
        });
        it('should get axis scale rangesfrom view', function () {
            // prepare
            spyOn(ChartHelper, 'IsScatterOrBubbleType').and.returnValue(false);
            var result = chartOptionsHandler.GetAxisScaleRangesFromView();

            // assert
            expect(result).toEqual({ f2: [0, 100, 20], f3: [-100, 0, 25] });
        });
    });

    describe(".GetAxisScaleSettings", function () {
        beforeEach(function () {
            spyOn(WC.FormatHelper, 'GetUserDefaultFormatSettings').and.returnValue({
                decimals: 5,
                thousandseparator: true
            });
        });
        it('should get axis scale settings (time)', function () {
            // prepare
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationFieldFormatSettings').and.returnValue({
                type: 'time',
                decimals: 0,
                thousandseparator: false,
                suffix: ''
            });
            var result = chartOptionsHandler.GetAxisScaleSettings({});

            // assert
            expect(result.decimals).toEqual(5);
            expect(result.thousandseparator).toEqual(true);
            expect(result.suffix).toEqual('seconds');
        });
        it('should get axis scale settings (timespan)', function () {
            // prepare
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationFieldFormatSettings').and.returnValue({
                type: 'timespan',
                decimals: 0,
                thousandseparator: false,
                suffix: ''
            });
            var result = chartOptionsHandler.GetAxisScaleSettings({});

            // assert
            expect(result.decimals).toEqual(5);
            expect(result.thousandseparator).toEqual(true);
            expect(result.suffix).toEqual('days');
        });
        it('should get axis scale settings (others)', function () {
            // prepare
            spyOn(chartOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationFieldFormatSettings').and.returnValue({
                type: 'others',
                decimals: 0,
                thousandseparator: false,
                suffix: ''
            });
            var result = chartOptionsHandler.GetAxisScaleSettings({});

            // assert
            expect(result.decimals).toEqual(0);
            expect(result.thousandseparator).toEqual(false);
            expect(result.suffix).toEqual('');
        });
    });

    describe(".GetAxisScaleBoundary", function () {
        it('should get boundary (scale=null, prefix=K, type=percentage)', function () {
            // prepare
            var settings = {
                type: 'percentage',
                prefix: 'K',
                decimals: 1
            };
            var scale = null;
            var result = chartOptionsHandler.GetAxisScaleBoundary(settings, scale);

            // assert
            expect(result.lower).toEqual(0);
            expect(result.upper).toEqual(0.001);
        });
        it('should get boundary (scale=[0,10000000], prefix=M, type=int)', function () {
            // prepare
            var settings = {
                type: 'int',
                prefix: 'M',
                decimals: 0
            };
            var scale = [0, 10000000, 100000];
            var result = chartOptionsHandler.GetAxisScaleBoundary(settings, scale);

            // assert
            expect(result.lower).toEqual(0);
            expect(result.upper).toEqual(10);
        });
        it('should get boundary (scale=[0,0], prefix=null, type=double)', function () {
            // prepare
            var settings = {
                type: 'double',
                prefix: null,
                decimals: 2
            };
            var scale = [0, 0, 0];
            var result = chartOptionsHandler.GetAxisScaleBoundary(settings, scale);

            // assert
            expect(result.lower).toEqual(0);
            expect(result.upper).toEqual(1);
        });
    });

    describe(".CreateAxisScaleRangeInput", function () {
        it('should create UI (percentage)', function () {
            // prepare
            var settings = { type: 'percentage' };
            spyOn($.fn, 'kendoNumericTextBox');
            spyOn($.fn, 'kendoPercentageTextBox');
            chartOptionsHandler.CreateAxisScaleRangeInput($(), settings, null, $.noop);

            // assert
            expect($.fn.kendoNumericTextBox).not.toHaveBeenCalled();
            expect($.fn.kendoPercentageTextBox).toHaveBeenCalled();
        });
    });

    describe(".AxisScaleRangeInputChange", function () {
        it('should set ranges (input lower)', function () {
            // prepare
            kendo.dataviz = { autoMajorUnit: $.noop };
            var settings = { type: 'percentage', prefix: 'K' };
            var e = { sender: { element: $('<div class="axis-scale-range-lower"/>') } };
            var handlerLower = { value: ko.observable(1000) };
            var handlerUpper = { value: ko.observable(100) };
            var inputLower = $('<div/>').data('handler', handlerLower);
            var inputUpper = $('<div/>').data('handler', handlerUpper);
            chartOptionsHandler.AxisScaleRangeInputChange(inputLower, inputUpper, settings, 'f1', e);

            // assert
            expect(handlerLower.value()).toEqual(1000);
            expect(handlerUpper.value()).toEqual(1000.01);
        });
        it('should set ranges (input upper)', function () {
            // prepare
            kendo.dataviz = { autoMajorUnit: $.noop };
            var settings = { type: 'int', prefix: 'M' };
            var e = { sender: { element: $('<div class="axis-scale-range-upper"/>') } };
            var handlerLower = { value: ko.observable(1000) };
            var handlerUpper = { value: ko.observable(100) };
            var inputLower = $('<div/>').data('handler', handlerLower);
            var inputUpper = $('<div/>').data('handler', handlerUpper);
            chartOptionsHandler.AxisScaleRangeInputChange(inputLower, inputUpper, settings, 'f1', e);

            // assert
            expect(handlerLower.value()).toEqual(99);
            expect(handlerUpper.value()).toEqual(100);
        });
    });
});
