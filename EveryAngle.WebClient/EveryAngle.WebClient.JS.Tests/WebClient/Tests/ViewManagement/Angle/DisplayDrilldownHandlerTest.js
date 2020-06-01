/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />

describe("DisplayDrilldownHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new DisplayDrilldownHandler({
            AngleHandler: {
                Displays: '',
                GetDisplay: $.noop
            },
            QueryDefinitionHandler: {
                AggregationOptions: $.noop
            },
            Data: $.noop,
            GetDetails: $.noop,
            SetDetails: $.noop,
            CanUpdate: $.noop
        });
    });

    describe(".Initial", function () {
        it("should call function by sequence", function () {
            spyOn(handler.DisplayHandler, 'Data').and.returnValue({ uri: '' });
            spyOn(handler.DisplayOverviewHandler, 'SetData').and.callFake($.noop);
            spyOn(handler, 'Render').and.callFake($.noop);

            handler.Initial('');

            expect(handler.DisplayOverviewHandler.SetData).toHaveBeenCalled();
            expect(handler.Render).toHaveBeenCalled();
        });
    });

    describe(".GetDataSource", function () {

        var displays;
        beforeEach(function () {
            displays = [
                {
                    DisplayTypeClassName: 'none',
                    ExtendDisplayTypeClassName: 'none',
                    FilterClassName: 'none',
                    PublicClassName: 'none',
                    ParameterizedClassName: 'none',
                    ValidClassName: 'none',
                    Name: 'Display_name',
                    Uri: '',
                    Id: '100001'
                }
            ];
        });

        it("should return only [none] options when there is no non-adhoc display", function () {

            displays[0].IsNewAdhoc = true;

            spyOn(handler.DisplayOverviewHandler, "Displays").and.returnValue(displays);

            var result = handler.GetDataSource();

            expect(result.length).toEqual(1);
            var noneOption = result[0];
            expect(noneOption.DisplayTypeClassName).toEqual('none');
            expect(noneOption.ExtendDisplayTypeClassName).toEqual('none');
            expect(noneOption.FilterClassName).toEqual('none');
            expect(noneOption.PublicClassName).toEqual('none');
            expect(noneOption.ParameterizedClassName).toEqual('none');
            expect(noneOption.ValidClassName).toEqual('none');
            expect(noneOption.Name).toEqual('[None]');
            expect(noneOption.Uri).toEqual('');
            expect(noneOption.Id).toEqual('');
        });

        it("should return only [none] options when there is no display that can get by uri", function () {

            displays[0].IsNewAdhoc = false;
            spyOn(handler.DisplayHandler.AngleHandler, "GetDisplay").and.returnValue(null);

            spyOn(handler.DisplayOverviewHandler, "Displays").and.returnValue(displays);

            var result = handler.GetDataSource();

            expect(result.length).toEqual(1);
            expect(result[0].Id).toEqual('');
        });

        it("should return only [none] options when the chart display that chart_type is 'GAUGE'", function () {
            displays[0].IsNewAdhoc = false;
            var displayObject = { GetDetails: $.noop };
            spyOn(displayObject, "GetDetails").and.returnValue({ chart_type: enumHandlers.CHARTTYPE.GAUGE.Code });
            spyOn(handler.DisplayHandler.AngleHandler, "GetDisplay").and.returnValue(displayObject);
            displays[0].DisplayType = enumHandlers.DISPLAYTYPE.CHART;

            spyOn(handler.DisplayOverviewHandler, "Displays").and.returnValue(displays);

            var result = handler.GetDataSource();

            expect(result.length).toEqual(1);
            expect(result[0].Id).toEqual('');
        });

        var chartTypes = [
            'area',
            'bar',
            'bubble',
            'column',
            'donut',
            'line',
            'pie',
            'radarLine',
            'scatter'
        ];

        $.each(chartTypes, function (index, chartType) {
            it("should return [none] options with all display that chart_type is '" + chartType + "'", function () {
                displays[0].IsNewAdhoc = false;
                var displayObject = { GetDetails: $.noop };
                spyOn(displayObject, "GetDetails").and.returnValue({ chart_type: chartType });
                spyOn(handler.DisplayHandler.AngleHandler, "GetDisplay").and.returnValue(displayObject);
                displays[0].DisplayType = enumHandlers.DISPLAYTYPE.CHART;

                spyOn(handler.DisplayOverviewHandler, "Displays").and.returnValue(displays);

                var result = handler.GetDataSource();

                expect(result.length).toEqual(2);
                expect(result[0].Id).toEqual('');
                expect(result[1].Id).toEqual('100001');
            });

        });

        it("should return [none] options with all un-chart display", function () {

            displays[0].IsNewAdhoc = false;
            spyOn(handler.DisplayHandler.AngleHandler, "GetDisplay").and.returnValue({});
            displays[0].DisplayType = enumHandlers.DISPLAYTYPE.LIST;

            spyOn(handler.DisplayOverviewHandler, "Displays").and.returnValue(displays);

            var result = handler.GetDataSource();

            expect(result.length).toEqual(2);
            expect(result[0].Id).toEqual('');
            expect(result[1].Id).toEqual('100001');
        });
    });

    describe(".GetValue", function () {

        var dataSource = [
            { Id: 'display_id_01' },
            { Id: 'display_id_02' },
            { Id: 'display_id_03' }
        ];

        var testCases = [
            {
                title: "should return drilldowndisplay when drilldown_display is in list",
                input: 'display_id_01',
                expected: 'display_id_01'
            },
            {
                title: "should return emptystring when drilldown_display is not in list",
                input: 'display_id_99',
                expected: ''
            },
            {
                title: "should return emptystring when drilldown_display is empty",
                input: '',
                expected: ''
            },
            {
                title: "should return emptystring when drilldown_display is null",
                input: null,
                expected: ''
            }
        ];

        $.each(testCases, function (index, test) {
            it(test.title, function () {
                spyOn(handler.DisplayHandler, 'GetDetails').and.returnValue({ drilldown_display: test.input });

                var result = handler.GetValue(dataSource);

                expect(result).toEqual(test.expected);
            });
        });

    });

    describe(".Render", function () {
        it("should call function by sequence", function () {

            spyOn(handler, 'GetDataSource').and.returnValue([]);
            spyOn(handler, 'GetItemTemplate').and.returnValue('');
            spyOn(handler, 'GetValue').and.returnValue('');
            spyOn(handler, 'SetData').and.callFake($.noop);
            spyOn(handler.DisplayHandler, 'CanUpdate').and.returnValue($.noop);

            var ddlDrilldown = { enable: $.noop, value: $.noop };
            spyOn(ddlDrilldown, 'enable').and.returnValue($.noop);
            spyOn(ddlDrilldown, 'value').and.returnValue($.noop);
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(ddlDrilldown);

            var container = { removeClass: $.noop, find: $.noop };
            spyOn(container, "removeClass").and.returnValue($.noop);

            handler.Render(container);

            expect(handler.GetDataSource).toHaveBeenCalled();
            expect(handler.GetItemTemplate).toHaveBeenCalled();
            expect(handler.GetValue).toHaveBeenCalled();
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(ddlDrilldown.enable).toHaveBeenCalled();
            expect(ddlDrilldown.value).toHaveBeenCalled();
            expect(container.removeClass).toHaveBeenCalled();
        });
    });

    describe(".SetData", function () {

        var e = {
            sender: { value: $.noop }
        };

        var testCases = [
            {
                title: "should set data to drilldown_display when sender has value",
                input: 'drilldown_display_value',
                expected: 'drilldown_display_value'
            },
            {
                title: "should remove drilldown_display when sender's value is empty",
                input: '',
                expected: undefined
            },
            {
                title: "should remove drilldown_display when sender's value is null",
                input: null,
                expected: undefined
            }
        ];

        $.each(testCases, function (index, test) {
            it(test.title, function () {
                spyOn(e.sender, 'value').and.returnValue(test.input);

                var details = { drilldown_display: '' };
                spyOn(handler.DisplayHandler, 'GetDetails').and.returnValue(details);
                spyOn(handler.DisplayHandler, 'SetDetails').and.returnValue($.noop);
                spyOn(handler.DisplayHandler.QueryDefinitionHandler, "AggregationOptions");
                spyOn(handler, 'OnChanged').and.returnValue($.noop);

                handler.SetData(e);

                expect(handler.DisplayHandler.SetDetails).toHaveBeenCalled();
                expect(handler.DisplayHandler.QueryDefinitionHandler.AggregationOptions).toHaveBeenCalled();
                expect(handler.OnChanged).toHaveBeenCalled();
                expect(details.drilldown_display).toEqual(test.expected);
            });

        });
    });
});