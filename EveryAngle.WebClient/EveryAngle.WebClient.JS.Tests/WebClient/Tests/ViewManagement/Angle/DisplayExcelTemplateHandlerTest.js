/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DefaultExcelDatastoreHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayExcelTemplateHandler.js" />

describe("DisplayExcelTemplateHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new DisplayExcelTemplateHandler({
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
            spyOn(defaultExcelDatastoreHandler, 'GetExcelTemplates').and.returnValue({
                value: 'my-value',
                options: ['my-options']
            });
            spyOn(handler, 'AddDefaultTemplate');
            spyOn(handler, 'Render');
            handler.Initial('');

            expect(handler.DefaultDatastoreTemplate).toEqual('my-value');
            expect(handler.AllTemplateFiles).toEqual(['my-options']);
            expect(handler.AddDefaultTemplate).toHaveBeenCalled();
            expect(handler.Render).toHaveBeenCalled();
        });
    });

    describe(".GetValue", function () {

        var dataSource = [
            { id: 'excel_template_id_00.xlsx' },
            { id: 'excel_template_id_01.xlsx' },
            { id: 'excel_template_id_02.xlsx' }
        ];

        var defaultTemplate = "excel_template_id_00.xlsx";

        var testCases = [
            {
                title: "should return excel template when excel_template is in list",
                input: 'excel_template_id_01.xlsx',
                expected: 'excel_template_id_01.xlsx'
            },
            {
                title: "should return default template when excel_template is not in list or deleted from system",
                input: 'excel_template_id_99.xlsx',
                expected: defaultTemplate
            },
            {
                title: "should return default template when excel_template is empty",
                input: '',
                expected: defaultTemplate
            },
            {
                title: "should return default template when excel_template is null",
                input: null,
                expected: defaultTemplate
            }
        ];

        $.each(testCases, function (index, test) {
            it(test.title, function () {
                handler.DefaultDatastoreTemplate = "excel_template_id_00.xlsx";

                spyOn(handler.DisplayHandler, 'GetDetails').and.returnValue({ excel_template: test.input });

                var result = handler.GetValue(dataSource);

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".AddDefaultTemplate", function () {
        var allTemplates = [
            { id: 'excel_template_id_00.xlsx' },
            { id: 'excel_template_id_01.xlsx' },
            { id: 'excel_template_id_02.xlsx' }
        ];

        var expected = "[Default] excel_template_id_00.xlsx"

        it("should add default template and set default template", function () {
            handler.DefaultDatastoreTemplate = "excel_template_id_00.xlsx";
            handler.AllTemplateFiles = allTemplates;
       
            handler.AddDefaultTemplate();

            var defaultOption = jQuery.grep(handler.AllTemplateFiles, function (option) {
                return option.id === '[Default] excel_template_id_00.xlsx';
            });

            expect(defaultOption.length).toBe(1);
            expect(handler.DefaultDatastoreTemplate).toBe(expected);
        });
    });

    describe(".Render", function () {
        it("should call function by sequence", function () {
            
            spyOn(handler, 'GetValue').and.returnValue('');
            spyOn(handler, 'SetData').and.callFake($.noop);
            spyOn(handler.DisplayHandler, 'CanUpdate').and.returnValue($.noop);

            var ddlExcelTemplates = { enable: $.noop, value: $.noop };
            spyOn(ddlExcelTemplates, 'enable').and.returnValue($.noop);
            spyOn(ddlExcelTemplates, 'value').and.returnValue($.noop);
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(ddlExcelTemplates);

            var container = { find: $.noop };
            spyOn(container, "find").and.returnValue($.noop);

            handler.Render(container);
            
            expect(handler.GetValue).toHaveBeenCalled();
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(ddlExcelTemplates.enable).toHaveBeenCalled();
            expect(ddlExcelTemplates.value).toHaveBeenCalled();
        });
    });

    describe(".SetData", function () {

        var e = {
            sender: { value: $.noop }
        };

        var testCases = [
            {
                title: "should set data to excel_template when sender has value",
                input: 'excel_template_id_01.xlsx',
                expected: 'excel_template_id_01.xlsx'
            },
            {
                title: "should remove excel_template when sender's value is default template",
                input: 'excel_template_id_00.xlsx',
                expected: undefined
            },
            {
                title: "should remove excel_template when sender's value is empty",
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
                handler.DefaultDatastoreTemplate = "excel_template_id_00.xlsx";

                spyOn(e.sender, 'value').and.returnValue(test.input);

                var details = { excel_template: '' };
                spyOn(handler.DisplayHandler, 'GetDetails').and.returnValue(details);
                spyOn(handler.DisplayHandler, 'SetDetails').and.returnValue($.noop);
                spyOn(handler.DisplayHandler.QueryDefinitionHandler, "AggregationOptions");
                spyOn(handler, 'OnChanged').and.returnValue($.noop);

                handler.SetData(e);

                expect(handler.DisplayHandler.SetDetails).toHaveBeenCalled();
                expect(handler.DisplayHandler.QueryDefinitionHandler.AggregationOptions).toHaveBeenCalled();
                expect(handler.OnChanged).toHaveBeenCalled();
                expect(details.excel_template).toEqual(test.expected);
            });

        });
    });
});