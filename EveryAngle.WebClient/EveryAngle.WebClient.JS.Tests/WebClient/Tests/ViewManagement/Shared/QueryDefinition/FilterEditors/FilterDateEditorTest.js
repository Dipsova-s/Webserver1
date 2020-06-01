/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseAdvanceFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterDateEditor.js" />

describe("FilterDateEditor", function () {
    var editor;
    beforeEach(function () {
        var handler = new QueryDefinitionHandler();
        var queryStep = new QueryStepViewModel({ step_type: 'filter', arguments: [], operator: '' });
        editor = new FilterDateEditor(handler, queryStep, $());
    });

    describe(".GetOperators", function () {
        it("should get operators", function () {
            var result = editor.GetOperators();

            // assert
            expect(result).toEqual(enumHandlers.QUERYSTEPOPERATOR.SIMPLIFYDATE);
        });
    });

    describe(".DropdownOperatorChange", function () {
        it("can change operator", function () {
            spyOn(editor.parent.prototype, 'DropdownOperatorChange');
            spyOn(editor, 'UpdateDropdownOperator');
            editor.DropdownOperatorChange();

            // assert
            expect(editor.parent.prototype.DropdownOperatorChange).toHaveBeenCalled();
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
        });
    });

    describe(".SetElementCssClass", function () {
        it("can set css class", function () {
            spyOn(editor.parent.prototype, 'SetElementCssClass');
            editor.SetElementCssClass();

            // assert
            expect(editor.parent.prototype.SetElementCssClass).toHaveBeenCalled();
        });
    });

    describe(".GetInputArgumentValue", function () {
        it("should get input value", function () {
            spyOn(editor, 'ConvertDatePickerToUnixTime').and.returnValue(3600);
            var input = {
                data: function () {
                    return { value: $.noop };
                }
            };
            var result = editor.GetInputArgumentValue(input);

            // assert
            expect(result).toEqual(3600);
        });
    });

    describe(".CreateInputValue", function () {
        it("should create input with format", function () {
            $.fn.kendoDatePicker = $.noop;
            spyOn($.fn, 'kendoDatePicker');
            spyOn(WC.WidgetFilterHelper, 'GetDateFormat');
            editor.CreateInputValue($(), 0);

            // assert
            expect($.fn.kendoDatePicker).toHaveBeenCalled();
            expect(WC.WidgetFilterHelper.GetDateFormat).toHaveBeenCalled();
        });
    });

    describe(".IsValidArgumentValue", function () {
        it("should valid", function () {
            var result = editor.IsValidArgumentValue(0);

            // assert
            expect(result).toEqual(true);
        });
        it("should not valid", function () {
            var result = editor.IsValidArgumentValue(new Date());

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetArgumentPreview", function () {
        it("should get from base", function () {
            spyOn(editor.parent.prototype, 'GetArgumentPreview').and.returnValue('my-base');
            var result = editor.GetArgumentPreview('date');

            // assert
            expect(result).toEqual('my-base');
        });
    });

    describe(".ConvertDatePickerToUnixTime", function () {
        beforeEach(function () {
            spyOn(WC.WidgetFilterHelper, 'ConvertDatePickerToUnixTime').and.returnValue('converted');
        });
        it("should convert a value", function () {
            var result = editor.ConvertDatePickerToUnixTime(100);

            // assert
            expect(result).toEqual('converted');
        });
        it("should not convert a value", function () {
            var result = editor.ConvertDatePickerToUnixTime(null);

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".UpdateArgumentValueUI", function () {
        var handler;
        beforeEach(function () {
            handler = { value: $.noop };
            spyOn(handler, 'value');
            spyOn($.fn, 'data').and.returnValue(handler);
            spyOn(WC.WidgetFilterHelper, 'ConvertUnixTimeToPicker');
        });
        it("should update null value to UI", function () {
            editor.UpdateArgumentValueUI($(), {});

            // assert
            expect(handler.value).toHaveBeenCalled();
            expect(WC.WidgetFilterHelper.ConvertUnixTimeToPicker).not.toHaveBeenCalled();
        });
        it("should update a valid value to UI", function () {
            editor.UpdateArgumentValueUI($(), { value: 100 });

            // assert
            expect(handler.value).toHaveBeenCalled();
            expect(WC.WidgetFilterHelper.ConvertUnixTimeToPicker).toHaveBeenCalled();
        });
    });

    describe(".InitialMultipleArgumentUI", function () {
        it("should initial UI", function () {
            $.fn.kendoDatePicker = $.noop;
            spyOn($.fn, 'kendoDatePicker');
            spyOn(editor.parent.prototype, 'InitialMultipleArgumentUI');
            spyOn(WC.WidgetFilterHelper, 'GetDateFormat');
            editor.InitialMultipleArgumentUI($());

            // assert
            expect($.fn.kendoDatePicker).toHaveBeenCalled();
            expect(editor.parent.prototype.InitialMultipleArgumentUI).toHaveBeenCalled();
            expect(WC.WidgetFilterHelper.GetDateFormat).toHaveBeenCalled();
        });
    });

    describe(".GetListGridOptions", function () {
        it("should get options", function () {
            spyOn(WC.WidgetFilterHelper, 'GetDateFormat').and.returnValue('yyyy');
            spyOn(WC.WidgetFilterHelper, 'ConvertUnixTimeToPicker').and.returnValue(new Date());
            var result = editor.GetListGridOptions([]);
            result.columns[0].template({ value: 0 });

            // assert
            expect(typeof result.columns[0].template).toEqual('function');
            expect(WC.WidgetFilterHelper.GetDateFormat).toHaveBeenCalled();
            expect(WC.WidgetFilterHelper.ConvertUnixTimeToPicker).toHaveBeenCalled();
        });
    });

    describe(".TransformPastingList", function () {
        it("should get options", function () {
            spyOn(WC.WidgetFilterHelper, 'GetDateFormat').and.returnValue('yyyy/MM/dd');
            spyOn(editor, 'ConvertDatePickerToUnixTime').and.returnValue('converted');
            var result = editor.TransformPastingList(['date1', 'date2']);

            // assert
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('converted');
            expect(result[1]).toEqual('converted');
            expect(WC.WidgetFilterHelper.GetDateFormat).toHaveBeenCalled();
            expect(editor.ConvertDatePickerToUnixTime).toHaveBeenCalledTimes(2);
        });
    });

    describe(".GetCompareFieldTarget", function () {
        it("should get a compare field target", function () {
            var result = editor.GetCompareFieldTarget();

            // assert
            expect(result).toEqual(enumHandlers.FIELDTYPE.DATE);
        });
    });
});