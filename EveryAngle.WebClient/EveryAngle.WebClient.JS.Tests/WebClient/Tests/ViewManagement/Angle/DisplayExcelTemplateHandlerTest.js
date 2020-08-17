/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DefaultExcelDatastoreHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayExcelTemplateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemFilesHandler.js" />

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
            spyOn(defaultExcelDatastoreHandler, 'GetDefaultTemplate').and.returnValue('my-template.xlsx');
            spyOn(excelTemplateFilesHandler, 'GetDropdownData').and.returnValue([{ name: 'my-template.xlsx' }, { name: 'standard-template.xlsx' }]);
            spyOn(handler, 'AddDefaultTemplate');
            spyOn(handler, 'Render');
            handler.Initial('');

            expect(handler.DefaultDatastoreTemplate).toEqual('my-template.xlsx');
            expect(handler.DropdownData.length).toEqual(2);
            expect(handler.AddDefaultTemplate).toHaveBeenCalled();
            expect(handler.Render).toHaveBeenCalled();
        });
    });

    describe(".ShowInnoweraDetails", function () {

        var expected = [
            '<span data-role=\"tooltip\" data-tooltip-text=\"MM02/MM02_Plant\">',
            'MM02/MM02_Plant',
            '</span><br>',
            '<span data-role=\"tooltip\" data-tooltip-text=\"GX0K/GX0K_Material\">',
            'GX0K/GX0K_Material',
            '</span><br>'
        ].join('');

        beforeEach(function () {
            element = $('<div class=\"innowera-details\"/>').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should show innowera details when exist", function () {
            var fileData = {
                is_innowera: true,
                innowera_details: [
                    {
                        sap_process_name: "MM02",
                        display_name: "MM02_Plant"
                    },
                    {
                        sap_process_name: "GX0K",
                        display_name: "GX0K_Material"
                    }
                ]
            };
            spyOn($.fn, 'find').and.returnValue(element);

            handler.ShowInnoweraDetails(fileData);

            expect(element.html()).toEqual(expected);
        });

        it("should not show innowera details when not exist", function () {
            var fileData = {
                is_innowera: false
            };
            spyOn($.fn, 'find').and.returnValue(element);

            handler.ShowInnoweraDetails(fileData);

            expect(element.html()).toEqual('');
        });
    });

    describe(".GetItemTemplate", function () {

        it("should show innowera icon when innowera file", function () {
            var data = {
                icon_class: "icon-innowera",
                name: "EveryAngle-Innowera.xlsx"
            }
            var template = kendo.template(handler.GetItemTemplate());
            var result = template(data);

            expect($(result).find('i').hasClass('icon-innowera')).toEqual(true);
        });

        it("should not show innowera icon when standard file", function () {
            var data = {
                icon_class: "none",
                name: "EveryAngle-Standard.xlsx"
            }
            var template = kendo.template(handler.GetItemTemplate());
            var result = template(data);

            expect($(result).find('i').hasClass('icon-innowera')).toEqual(false);
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
                title: "should return excel template when excel_template is not in list",
                input: 'excel_template_id_99.xlsx',
                expected: "excel_template_id_99.xlsx"
            },
            {
                title: "should return default template when excel_template is empty",
                input: undefined,
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

        var expected = "[User default] excel_template_id_00.xlsx"

        it("should add default template and set default template", function () {
            handler.DefaultDatastoreTemplate = "excel_template_id_00.xlsx";
            handler.DropdownData = allTemplates;

            handler.AddDefaultTemplate();

            var defaultOption = jQuery.grep(handler.DropdownData, function (option) {
                return option.id === '[User default] excel_template_id_00.xlsx';
            });

            expect(defaultOption.length).toBe(1);
            expect(handler.DefaultDatastoreTemplate).toBe(expected);
        });
    });

    describe(".Render", function () {
        it("should call function by sequence", function () {

            spyOn(handler, 'GetValue').and.returnValue('EveryAngle-Test.xlsx');
            spyOn(handler, 'SetData').and.callFake($.noop);
            spyOn(handler, 'ShowInnoweraDetails').and.returnValue($.noop);
            spyOn(handler.DisplayHandler, 'CanUpdate').and.returnValue($.noop);

            var ddlExcelTemplates = { enable: $.noop, value: $.noop, dataItem: $.noop };
            spyOn(ddlExcelTemplates, 'enable').and.returnValue($.noop);
            spyOn(ddlExcelTemplates, 'value').and.returnValue($.noop);
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(ddlExcelTemplates);

            var container = { find: $.noop };
            var result = [{
                name: 'EveryAngle-Test.xlsx',
                id: 'EveryAngle-Test.xlsx',
                isDeleted: true
            }];
            handler.DropdownData = result;
            spyOn(handler, 'GetDropdownData').and.returnValue(result);
            spyOn(container, "find").and.returnValue($.noop);

            handler.Render();

            expect(handler.GetValue).toHaveBeenCalled();
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(ddlExcelTemplates.enable).toHaveBeenCalled();
            expect(ddlExcelTemplates.value).toHaveBeenCalled();
        });
    });

    describe(".SetData", function () {

        var e = {
            sender: { value: $.noop, dataItem: $.noop }
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
                spyOn(handler, 'ShowInnoweraDetails').and.returnValue($.noop);
                spyOn(handler.DisplayHandler, 'GetDetails').and.returnValue(details);
                spyOn(handler.DisplayHandler, 'SetDetails').and.returnValue($.noop);
                spyOn(handler.DisplayHandler.QueryDefinitionHandler, "AggregationOptions");
                spyOn(handler, 'OnChanged').and.returnValue($.noop);

                handler.SetData(e);

                expect(handler.ShowInnoweraDetails).toHaveBeenCalled();
                expect(handler.DisplayHandler.SetDetails).toHaveBeenCalled();
                expect(handler.DisplayHandler.QueryDefinitionHandler.AggregationOptions).toHaveBeenCalled();
                expect(handler.OnChanged).toHaveBeenCalled();
                expect(details.excel_template).toEqual(test.expected);
            });

        });
    });
    describe(".GetDropdownData", function () {
        var excelTemplate =
            [
                {
                    id: "EveryAngle-Test.xlsx",
                    name: "EveryAngle-Test.xlsx",
                    isDeleted: false
                },
                {
                    id: "EveryAngle-Test1.xlsx",
                    name: "EveryAngle-Test1.xlsx",
                    isDeleted: false
                }
            ];
        it("When default excel template of dispaly not deleted then it should return exsisting template", function () {
            handler.DisplayHandler = {
                GetDetails: function () {
                    return 'EveryAngle-Test.xlsx';
                }
            };
            handler.DropdownData = excelTemplate;
            var result = handler.GetDropdownData();
            expect(result).toBe(excelTemplate);
        });
        it("When default excel template of dispaly deleted then it should return exsisting template and display template", function () {
            handler.DisplayHandler = {
                GetDetails: function () {
                    return { excel_template: 'EveryAngle-Test2.xlsx' };
                }
            };
            handler.DropdownData = excelTemplate;
            var result = handler.GetDropdownData();
            expect(result.hasObject('id', 'EveryAngle-Test2.xlsx')).toBeTruthy();
        });
    });
    describe(".ShowWarningMessageTemplateDeleted", function () {
        var excelTemplate =
            [
                {
                    id: "EveryAngle-Test.xlsx",
                    name: "EveryAngle-Test.xlsx",
                    isDeleted: false
                },
                {
                    id: "EveryAngle-Test1.xlsx",
                    name: "EveryAngle-Test1.xlsx",
                    isDeleted: false
                }
            ];
        beforeEach(function () {
            element = $('<div id="template-warning-message-display"></div>').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });
        it("When template deleted the warning message should be displayed", function () {
            Captions.Label_Template_Not_Exist_Message = "Template does not exist";
            handler.DropdownData = excelTemplate;
            excelTemplate.push({
                id: "EveryAngle-Test2.xlsx",
                name: "EveryAngle-Test2.xlsx",
                isDeleted: true
            });

            handler.ShowWarningMessageTemplateDeleted('EveryAngle-Test2.xlsx');
            var warningText = $("#template-warning-message-display >span").text()
            expect(warningText).toBe(Captions.Label_Template_Not_Exist_Message);
        });
        it("When template exist the warning message should not  be displayed", function () {
            Captions.Label_Template_Not_Exist_Message = "Template does not exist";
            handler.DropdownData = excelTemplate;

            handler.ShowWarningMessageTemplateDeleted('EveryAngle-Test1.xlsx');
            var warningText = $("#template-warning-message-display >span").text()
            expect(warningText).toBe('');
        });
    });
});