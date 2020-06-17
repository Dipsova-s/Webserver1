/// <reference path="/Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/userfriendlynamehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />

describe("BaseFilterEditor", function () {
    var baseFilterEditor;
    var handler;
    var callInitial = function (queryStep, element) {
        spyOn(baseFilterEditor, 'CreateDropdownOperator');
        spyOn(baseFilterEditor, 'CreateArgumentsEditor');

        var defaultQueryStep = {
            step_type: enumHandlers.FILTERTYPE.FILTER,
            operator: 'has_value',
            arguments: []
        };
        baseFilterEditor.Initial(handler, new QueryStepViewModel(queryStep || defaultQueryStep, 'models/1', false), element);
    };

    beforeEach(function () {
        baseFilterEditor = new BaseFilterEditor();
        handler = new QueryDefinitionHandler();
    });

    describe("constructor", function () {
        it("should define variables", function () {
            // assert
            expect(baseFilterEditor.Data).toEqual(null);
            expect(baseFilterEditor.Handler).toEqual(null);
            expect(baseFilterEditor.$Element.length).toEqual(0);
        });
    });

    describe(".Initial", function () {
        beforeEach(function () {
            callInitial(null, $());
        });

        it("should Initial correctly", function () {
            expect(baseFilterEditor.CreateDropdownOperator).toHaveBeenCalled();
            expect(baseFilterEditor.CreateArgumentsEditor).toHaveBeenCalled();
        });

        it("should return empty array", function () {
            expect(baseFilterEditor.GetOperators()).toEqual([]);
        });

        it("should return empty string when get field", function () {
            expect(baseFilterEditor.GetCompareFieldTarget()).toEqual('');
        });
    });

    describe(".CreateDropdownOperator", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({ step_type: enumHandlers.FILTERTYPE.FILTER });
            spyOn(WC.HtmlHelper, 'DropdownList');
        });

        it("should create dropdown", function () {
            baseFilterEditor.CreateDropdownOperator();

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
        });
    });

    describe(".GetDropdownOperatorOptions", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(baseFilterEditor, 'TransferArguments');
        });

        it("should get options", function () {
            var result = baseFilterEditor.GetDropdownOperatorOptions();

            // assert
            expect(result.dataTextField).toEqual(enumHandlers.PROPERTIESNAME.TEXT);
            expect(result.dataValueField).toEqual(enumHandlers.PROPERTIESNAME.VALUE);
            expect(result.value).toEqual('has_value');
            expect(typeof result.change).toEqual('function');
        });

        it("should set a new operator and create editor", function () {
            var result = baseFilterEditor.GetDropdownOperatorOptions();
            var e = {
                sender: {
                    value: function () { return 'has_value'; }
                }
            };
            result.change(e);

            // assert
            expect(baseFilterEditor.Data.operator()).toEqual('has_value');
            expect(baseFilterEditor.TransferArguments).toHaveBeenCalled();
            expect(baseFilterEditor.CreateArgumentsEditor).toHaveBeenCalled();
        });
    });

    describe(".TransferArguments", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [
                    { argument_type: 'value' },
                    { argument_type: 'field' },
                    { argument_type: 'field' },
                    { argument_type: 'value' },
                    { argument_type: 'value' },
                    { argument_type: 'field' }
                ]
            });
        });

        it("should transfer 'value' arguments", function () {
            spyOn(baseFilterEditor, 'GetMaxArguments').and.returnValue(2);
            spyOn(baseFilterEditor, 'GetSupportArgumentTypes').and.returnValue(['value']);
            baseFilterEditor.TransferArguments();

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(2);
            expect(baseFilterEditor.Data.arguments()[0].argument_type).toEqual('value');
            expect(baseFilterEditor.Data.arguments()[1].argument_type).toEqual('value');
        });

        it("should transfer 'field' arguments", function () {
            spyOn(baseFilterEditor, 'GetMaxArguments').and.returnValue(4);
            spyOn(baseFilterEditor, 'GetSupportArgumentTypes').and.returnValue(['field']);
            baseFilterEditor.TransferArguments();

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(3);
            expect(baseFilterEditor.Data.arguments()[0].argument_type).toEqual('field');
            expect(baseFilterEditor.Data.arguments()[1].argument_type).toEqual('field');
            expect(baseFilterEditor.Data.arguments()[2].argument_type).toEqual('field');
        });

        it("should transfer 'value' and 'field' arguments", function () {
            spyOn(baseFilterEditor, 'GetMaxArguments').and.returnValue(4);
            spyOn(baseFilterEditor, 'GetSupportArgumentTypes').and.returnValue(['value', 'field']);
            baseFilterEditor.TransferArguments();

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(4);
            expect(baseFilterEditor.Data.arguments()[0].argument_type).toEqual('value');
            expect(baseFilterEditor.Data.arguments()[1].argument_type).toEqual('field');
            expect(baseFilterEditor.Data.arguments()[2].argument_type).toEqual('field');
            expect(baseFilterEditor.Data.arguments()[3].argument_type).toEqual('value');
        });
    });

    describe(".GetSupportArgumentTypes", function () {
        var tests = [
            {
                title: 'should get a support types for "equal_to" operator',
                operator: 'equal_to',
                expected: ['value', 'field']
            },
            {
                title: 'should get a support types for "between" operator',
                operator: 'between',
                expected: ['value']
            },
            {
                title: 'should get a support types for "contains" operator',
                operator: 'contains',
                expected: ['value']
            },
            {
                title: 'should get a support types for "has_value" operator',
                operator: 'has_value',
                expected: []
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = baseFilterEditor.GetSupportArgumentTypes(test.operator);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetMaxArguments", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [{}, {}, {}, {}, {}]
            });
        });
        var tests = [
            {
                title: 'should get 1 argument',
                is_equal_group: true,
                is_between_group: false,
                is_list_group: false,
                expected: 1
            },
            {
                title: 'should get 2 arguments',
                is_equal_group: false,
                is_between_group: true,
                is_list_group: false,
                expected: 2
            },
            {
                title: 'should get max arguments',
                is_equal_group: false,
                is_between_group: false,
                is_list_group: true,
                expected: 5
            },
            {
                title: 'should get 0 arguments',
                is_equal_group: false,
                is_between_group: false,
                is_list_group: false,
                expected: 0
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(WC.WidgetFilterHelper, 'IsEqualGroupOperator').and.returnValue(test.is_equal_group);
                spyOn(WC.WidgetFilterHelper, 'IsBetweenGroupOperator').and.returnValue(test.is_between_group);
                spyOn(WC.WidgetFilterHelper, 'IsListGroupOperator').and.returnValue(test.is_list_group);
                var result = baseFilterEditor.GetMaxArguments();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CreateArgumentsEditor", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({
                step_type: enumHandlers.FILTERTYPE.FILTER
            });
            spyOn(baseFilterEditor, 'DestroyArgumentsUI');
        });

        it("should create editor", function () {
            baseFilterEditor.CreateArgumentsEditor();

            // assert
            expect(baseFilterEditor.DestroyArgumentsUI).toHaveBeenCalled();
        });
    });

    describe(".GetArgumentSettings", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(baseFilterEditor, 'GetSingleArgumentTemplate').and.returnValue('single-template');
            spyOn(baseFilterEditor, 'GetDoubleArgumentTemplate').and.returnValue('double-template');
            spyOn(baseFilterEditor, 'GetMultipleArgumentTemplate').and.returnValue('multiple-template');
            spyOn(baseFilterEditor, 'GetNoArgumentTemplate').and.returnValue('no-argument-template');
        });

        var tests = [
            {
                title: 'should get a single argument setttings',
                is_equal_group: true,
                is_between_group: false,
                is_list_group: false,
                expected: 'single-template'
            },
            {
                title: 'should get a double argument setttings',
                is_equal_group: false,
                is_between_group: true,
                is_list_group: false,
                expected: 'double-template'
            },
            {
                title: 'should get a multiple argument setttings',
                is_equal_group: false,
                is_between_group: false,
                is_list_group: true,
                expected: 'multiple-template'
            },
            {
                title: 'should get no argument setttings',
                is_equal_group: false,
                is_between_group: false,
                is_list_group: false,
                expected: 'no-argument-template'
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(WC.WidgetFilterHelper, 'IsEqualGroupOperator').and.returnValue(test.is_equal_group);
                spyOn(WC.WidgetFilterHelper, 'IsBetweenGroupOperator').and.returnValue(test.is_between_group);
                spyOn(WC.WidgetFilterHelper, 'IsListGroupOperator').and.returnValue(test.is_list_group);
                var result = baseFilterEditor.GetArgumentSettings();

                // assert
                expect(result.template).toEqual(test.expected);
                expect(typeof result.callback).toEqual('function');
            });
        });
    });

    describe(".SetElementCssClass", function () {
        beforeEach(function () {
            baseFilterEditor.$Element = $('<div class="xxx filter-editor-none filter-editor-single filter-editor-double filter-editor-multiple" />');
        });
        var tests = [
            {
                title: 'should set filter-editor-none class name',
                name: 'filter-editor-none',
                expected: 'xxx filter-editor-none'
            },
            {
                title: 'should set filter-editor-single class name',
                name: 'filter-editor-single',
                expected: 'xxx filter-editor-single'
            },
            {
                title: 'should set filter-editor-double class name',
                name: 'filter-editor-double',
                expected: 'xxx filter-editor-double'
            },
            {
                title: 'should set filter-editor-multiple class name',
                name: 'filter-editor-multiple',
                expected: 'xxx filter-editor-multiple'
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                baseFilterEditor.SetElementCssClass(test.name);

                // assert
                expect(baseFilterEditor.$Element.attr('class')).toEqual(test.expected);
            });
        });
    });

    describe(".GetNoArgumentTemplate", function () {
        it("should get no argument template", function () {
            var result = baseFilterEditor.GetNoArgumentTemplate();

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".InitialNoArgumentUI", function () {
        it("should initial", function () {
            spyOn(baseFilterEditor, 'SetElementCssClass');
            baseFilterEditor.InitialNoArgumentUI();

            // assert
            expect(baseFilterEditor.SetElementCssClass).toHaveBeenCalled();
        });
    });

    describe(".GetSingleArgumentTemplate", function () {
        it("should get no argument template", function () {
            var result = baseFilterEditor.GetSingleArgumentTemplate();

            // assert
            expect(result).toContain('input-argument-value');
            expect(result).toContain('input-argument-field');
            expect(result).toContain('btn-select-field');
        });
    });

    describe(".InitialSingleArgumentUI", function () {
        beforeEach(function () {
            callInitial(null, $());
        });
        it("should initial", function () {
            spyOn(baseFilterEditor, 'SetElementCssClass');
            spyOn(baseFilterEditor, 'UpdateArgumentFieldUI');
            baseFilterEditor.InitialSingleArgumentUI($());

            // assert
            expect(baseFilterEditor.SetElementCssClass).toHaveBeenCalled();
            expect(baseFilterEditor.UpdateArgumentFieldUI).toHaveBeenCalled();
        });
    });

    describe(".SetSingleArgumentValue", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(baseFilterEditor, 'GetInputArgumentValue').and.returnValue(0);
        });
        it("should set argument", function () {
            spyOn(baseFilterEditor, 'IsValidArgumentValue').and.returnValue(true);
            baseFilterEditor.SetSingleArgumentValue($());

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(1);
        });
        it("should clear argument", function () {
            spyOn(baseFilterEditor, 'IsValidArgumentValue').and.returnValue(false);
            baseFilterEditor.SetSingleArgumentValue($());

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(0);
        });
    });

    describe(".GetDoubleArgumentTemplate", function () {
        it("should get no argument template", function () {
            var result = baseFilterEditor.GetDoubleArgumentTemplate();

            // assert
            expect(result).toContain('input-argument-from');
            expect(result).toContain('input-argument-to');
        });
    });

    describe(".InitialDoubleArgumentUI", function () {
        it("should initial", function () {
            spyOn(baseFilterEditor, 'SetElementCssClass');
            baseFilterEditor.InitialDoubleArgumentUI($());

            // assert
            expect(baseFilterEditor.SetElementCssClass).toHaveBeenCalled();
        });
    });

    describe(".SetDoubleArgumentValues", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(baseFilterEditor, 'GetInputArgumentValue').and.returnValue(0);
        });
        it("should set argument", function () {
            spyOn(baseFilterEditor, 'IsValidArgumentValue').and.returnValue(true);
            baseFilterEditor.SetDoubleArgumentValues($(), $());

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(2);
        });
        it("should clear argument", function () {
            spyOn(baseFilterEditor, 'IsValidArgumentValue').and.returnValue(false);
            baseFilterEditor.SetDoubleArgumentValues($(), $());

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(0);
        });
    });

    describe(".GetMultipleArgumentTemplate", function () {
        it("should get no argument template", function () {
            var result = baseFilterEditor.GetMultipleArgumentTemplate();

            // assert
            expect(result).toContain('input-argument-typing');
            expect(result).toContain('input-argument-list');
        });
    });

    describe(".InitialMultipleArgumentUI", function () {
        beforeEach(function () {
            callInitial(null, $());
        });
        it("should initial", function () {
            $.fn.kendoGrid = function () {
                var ui = $('<div />');
                ui.data('kendoGrid', 'this-is-grid-object');
                return ui;
            };
            spyOn(baseFilterEditor, 'SetElementCssClass');
            spyOn(baseFilterEditor, 'IntialMultipleArgumentValues');
            baseFilterEditor.InitialMultipleArgumentUI($());

            // assert
            expect(baseFilterEditor.SetElementCssClass).toHaveBeenCalled();
            expect(baseFilterEditor.IntialMultipleArgumentValues).toHaveBeenCalled();
            expect(baseFilterEditor.$Grid).toEqual('this-is-grid-object');
        });
    });

    describe(".IntialMultipleArgumentValues", function () {
        it("should remove duplicated values", function () {
            callInitial(null, $());
            baseFilterEditor.Data.arguments([
                { value: 0 },
                { value: 0 }
            ]);
            baseFilterEditor.IntialMultipleArgumentValues(baseFilterEditor.Data.arguments());

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(1);
            expect(baseFilterEditor.Data.arguments()[0].value).toEqual(0);
        });
    });

    describe(".GetListGridOptions", function () {
        it("should get grid options", function () {
            var result = baseFilterEditor.GetListGridOptions([]);

            // assert
            expect(result.height).toEqual(130);
            expect(result.scrollable.virtual).toEqual(true);
            expect(result.dataSource instanceof kendo.data.DataSource).toEqual(true);
            expect(result.selectable).toEqual('multiple, row');
            expect(result.columns.length).toEqual(1);
            expect(result.dataBound).toBeDefined();
            expect(result.change).toBeDefined();
        });
    });

    describe(".GetListGridDataSource", function () {
        it("should get grid data source", function () {
            var result = baseFilterEditor.GetListGridDataSource([]);

            // assert
            expect(result instanceof kendo.data.DataSource).toEqual(true);
            expect(result.data().length).toEqual(0);
            expect(result.pageSize()).toEqual(50);
        });
    });

    describe(".SetListStateButtons", function () {
        beforeEach(function () {
            baseFilterEditor.$Element = $('<div/>').html(
                '<div class="filter-editor-arguments">' +
                '<a class="action-add"></a>' +
                '<a class="action-remove"></a>' +
                '<a class="action-clear"></a>' +
                '</div>'
            );
        });
        it("should be able to clear list and remove selected item", function () {
            var e = {
                sender: {
                    dataSource: {
                        data: function () {
                            return [{}];
                        }
                    },
                    select: function () {
                        return [{}];
                    }
                }
            };
            baseFilterEditor.SetListStateButtons(e);

            // assert
            expect(baseFilterEditor.$Element.find('.action-clear').hasClass('disabled')).toEqual(false);
            expect(baseFilterEditor.$Element.find('.action-remove').hasClass('disabled')).toEqual(false);
        });
        it("should not be able to clear list and remove selected item", function () {
            var e = {
                sender: {
                    dataSource: {
                        data: function () {
                            return [];
                        }
                    },
                    select: function () {
                        return [];
                    }
                }
            };
            baseFilterEditor.SetListStateButtons(e);

            // assert
            expect(baseFilterEditor.$Element.find('.action-clear').hasClass('disabled')).toEqual(true);
            expect(baseFilterEditor.$Element.find('.action-remove').hasClass('disabled')).toEqual(true);
        });
    });

    describe(".GetInputTypingValue", function () {
        it("should get input typing value", function () {
            var result = baseFilterEditor.GetInputTypingValue($('<input value="test "/>'));

            // assert
            expect(result).toEqual('test');
        });
    });

    describe(".InputTypingKeyDown", function () {
        var input;
        beforeEach(function () {
            input = $('<input class="required" />');
            spyOn(baseFilterEditor, 'AddMultipleArgumentValue');
        });
        it("should remove validation then stop", function () {
            baseFilterEditor.InputTypingKeyDown(input, { which: 1 });

            // assert
            expect(input.hasClass('required')).toEqual(false);
            expect(baseFilterEditor.AddMultipleArgumentValue).not.toHaveBeenCalled();
        });
        it("should submit value", function () {
            baseFilterEditor.InputTypingKeyDown(input, { which: 13 });

            // assert
            expect(input.hasClass('required')).toEqual(false);
            expect(baseFilterEditor.AddMultipleArgumentValue).toHaveBeenCalled();
        });
    });

    describe(".PasteListText", function () {
        it("should get input typing value", function (done) {
            spyOn(WC.HtmlHelper, 'GetPastedText').and.returnValue($.when('test'));
            spyOn(baseFilterEditor, 'AddMultipleArgumentValues');
            var e = { currentTarget: $('<input value="test"/>').get(0) };
            baseFilterEditor.PasteListText(e);

            // assert
            expect(baseFilterEditor.AddMultipleArgumentValues).not.toHaveBeenCalled();
            expect(e.currentTarget.value).toEqual('test');

            setTimeout(function () {
                expect(baseFilterEditor.AddMultipleArgumentValues).toHaveBeenCalled();
                expect(e.currentTarget.value).toEqual('');
                done();
            }, 10);
        });
    });

    describe(".TransformPastingList", function () {
        it("should transform list", function () {
            var result = baseFilterEditor.TransformPastingList(['test1 ', ' test2', ' test3 ', 'test4']);

            // assert
            expect(result).toEqual(['test1', 'test2', 'test3', 'test4']);
        });
    });

    describe(".AddMultipleArgumentValue", function () {
        it("should add value", function () {
            spyOn(baseFilterEditor, 'AddMultipleArgumentValues');
            baseFilterEditor.AddMultipleArgumentValue($());

            // assert
            expect(baseFilterEditor.AddMultipleArgumentValues).toHaveBeenCalled();
        });
    });

    describe(".AddMultipleArgumentValues", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [{ value: 'value1' }]
            });
            baseFilterEditor.$Element = $('<div/>').html('<input class="input-argument-typing" value="test" />');
            baseFilterEditor.$Grid = {
                dataSource: {
                    data: function () {
                        return [{ value: 'value1' }];
                    }
                },
                bind: $.noop,
                unbind: $.noop,
                setDataSource: $.noop,
                trigger: $.noop,
                virtualScrollable: {
                    itemHeight: 30,
                    verticalScrollbar: {
                        scrollTop: $.noop
                    }
                }
            };
        });
        it("should add values", function () {
            spyOn(baseFilterEditor, 'GetAddingMultipleArguments').and.returnValue([{ value: 'value1' }, { value: 'value2' }]);
            baseFilterEditor.AddMultipleArgumentValues(['value1', 'value2']);

            // assert
            expect(baseFilterEditor.GetAddingMultipleArguments).toHaveBeenCalled();
            expect(baseFilterEditor.Data.arguments().length).toEqual(2);
            expect(baseFilterEditor.$Element.find('.input-argument-typing').val()).toEqual('');
            expect(baseFilterEditor.$Element.find('.input-argument-typing').hasClass('required')).toEqual(false);
        });
        it("should not add value", function () {
            spyOn(baseFilterEditor, 'GetAddingMultipleArguments').and.returnValue([{ value: 'value2' }]);
            baseFilterEditor.AddMultipleArgumentValues(['value2']);

            // assert
            expect(baseFilterEditor.GetAddingMultipleArguments).toHaveBeenCalled();
            expect(baseFilterEditor.Data.arguments().length).toEqual(1);
            expect(baseFilterEditor.$Element.find('.input-argument-typing').val()).toEqual('test');
            expect(baseFilterEditor.$Element.find('.input-argument-typing').hasClass('required')).toEqual(true);
        });
    });

    describe(".GetAddingMultipleArguments", function () {
        it("should get adding value", function () {
            var result = baseFilterEditor.GetAddingMultipleArguments([{ value: 'value1' }], ['value1', '', 'value2']);

            // assert
            expect(result.length).toEqual(2);
            expect(result[0].value).toEqual('value1');
            expect(result[1].value).toEqual('value2');
        });
    });

    describe(".IsValidArgumentValue", function () {
        it("should valid", function () {
            var result = baseFilterEditor.IsValidArgumentValue('valid');

            // assert
            expect(result).toBeTruthy();
        });
        it("should not valid", function () {
            var result = baseFilterEditor.IsValidArgumentValue('');

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".IsArgumentTypeValue", function () {
        it("should be true", function () {
            var result = baseFilterEditor.IsArgumentTypeValue({ argument_type: 'value' });

            // assert
            expect(result).toBeTruthy();
        });
        it("should be false (no argument)", function () {
            var result = baseFilterEditor.IsArgumentTypeValue();

            // assert
            expect(result).toBeFalsy();
        });
        it("should be false (argument_type=field)", function () {
            var result = baseFilterEditor.IsArgumentTypeValue({ argument_type: 'field' });

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".RemoveMultipleArgumentValues", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [{ value: 'value1' }, { value: 'value2' }]
            });
            baseFilterEditor.$Grid = {
                dataSource: {
                    data: function () {
                        return [{ value: 'value1' }, { value: 'value2' }];
                    }
                },
                content: $(),
                select: $.noop,
                removeRow: function () {
                    baseFilterEditor.$Grid.dataSource.data = function () {
                        return [{ value: 'value2' }];
                    };
                },
                bind: $.noop,
                unbind: $.noop,
                trigger: $.noop
            };
        });
        it("should not remove a value", function () {
            spyOn(baseFilterEditor.$Grid, 'select').and.returnValue($());
            baseFilterEditor.RemoveMultipleArgumentValues();

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(2);
        });
        it("should remove a value", function () {
            spyOn(baseFilterEditor.$Grid, 'select').and.returnValue($('<div/>'));
            baseFilterEditor.RemoveMultipleArgumentValues();

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(1);
        });
    });

    describe(".ClearMultipleArgumentValues", function () {
        beforeEach(function () {
            baseFilterEditor.Data = new QueryStepViewModel({
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [{ value: 'value1' }, { value: 'value2' }]
            });
            baseFilterEditor.$Grid = {
                setDataSource: $.noop
            };
        });
        it("should clear all values", function () {
            baseFilterEditor.ClearMultipleArgumentValues();

            // assert
            expect(baseFilterEditor.Data.arguments().length).toEqual(0);
        });
    });

    describe(".Destroy", function () {
        var element;

        beforeEach(function () {
            $('<div id="Container">' +
                '<div class="query-oprator" data-role="dropdownlist"></div>' +
                '<div class="filter-editor-arguments">' +
                '<div data-role="dropdownlist"></div>' +
                '<div data-role="dropdownlist"></div>' +
                '</div>' +
                '</div>').appendTo('body');
            element = $('#Container');
            callInitial(null, element);
        });

        afterEach(function () {
            element.remove();
        });

        it("should destroy all UI", function () {
            spyOn(baseFilterEditor, 'DestroyOperatorDropdown');
            spyOn(baseFilterEditor, 'DestroyArgumentsUI');
            baseFilterEditor.Destroy();

            expect(baseFilterEditor.DestroyOperatorDropdown).toHaveBeenCalled();
            expect(baseFilterEditor.DestroyArgumentsUI).toHaveBeenCalled();
        });

        it("should destroy operator dropdown", function () {
            spyOn(window.WC.HtmlHelper, 'DestroyDropdownList');
            baseFilterEditor.DestroyOperatorDropdown();
            expect(window.WC.HtmlHelper.DestroyDropdownList).toHaveBeenCalled();
        });

        it("should destroy all arguments UI", function () {
            spyOn(window.WC.HtmlHelper, 'DestroyDropdownList');
            baseFilterEditor.DestroyArgumentsUI();
            expect(window.WC.HtmlHelper.DestroyDropdownList).toHaveBeenCalled();
        });
    });

    describe(".IsCompareField", function () {
        it("should be a compare field (argument_type = field)", function () {
            var result = !!baseFilterEditor.IsCompareField([{ argument_type: enumHandlers.FILTERARGUMENTTYPE.FIELD }]);
            expect(result).toEqual(true);
        });

        it("should not be a compare field (no argument)", function () {
            var result = !!baseFilterEditor.IsCompareField([]);
            expect(result).toEqual(false);
        });

        it("should not be a compare field (argument_type = value)", function () {
            var result = !!baseFilterEditor.IsCompareField([{ argument_type: enumHandlers.FILTERARGUMENTTYPE.VALUE }]);
            expect(result).toEqual(false);
        });
    });

    describe(".ShowCompareFieldPopup", function () {
        beforeEach(function () {
            callInitial(null, $());
        });
        it("should show popup", function () {
            spyOn(baseFilterEditor, 'GetCompareFieldTarget').and.returnValue('field_target');
            spyOn(fieldsChooserHandler, 'ShowPopup');
            spyOn(handler, 'InitialAddFilterOptions');
            baseFilterEditor.ShowCompareFieldPopup();

            // assert
            expect(handler.InitialAddFilterOptions).toHaveBeenCalled();
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".SetCompareField", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(baseFilterEditor, 'UpdateArgumentFieldUI');
        });

        it("should set a compare field correctly", function () {
            var field = { id: 'fieldid' };
            baseFilterEditor.SetCompareField(field);

            // assert
            expect(baseFilterEditor.Data.arguments()[0].field).toEqual(field.id);
            expect(baseFilterEditor.Data.arguments()[0].argument_type).toEqual('field');
            expect(baseFilterEditor.UpdateArgumentFieldUI).toHaveBeenCalled();
        });
    });

    describe(".RemoveCompareField", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(baseFilterEditor, 'UpdateArgumentFieldUI');
        });

        it("should set a compare field correctly", function () {
            baseFilterEditor.RemoveCompareField();
            expect(baseFilterEditor.Data.arguments().length).toEqual(0);
            expect(baseFilterEditor.UpdateArgumentFieldUI).toHaveBeenCalled();
        });
    });

    describe(".UpdateArgumentFieldUI", function () {
        var element;
        beforeEach(function () {
            $('<div id="Container">' +
                '<div class="filter-editor-arguments">' +
                '<div class="col-input-field hidden"></div>' +
                '<div class="input-argument-field-value">any-field</div>' +
                '<div class="col-input-value hidden"></div>' +
                '<input class="input-argument-value" value="any-value"/>' +
                '</div>' +
                '</div>').appendTo('body');
            element = $('#Container');

            var queryStep = {
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [{}]
            };
            callInitial(queryStep, element);
            spyOn(baseFilterEditor, 'IsCompareField').and.returnValue(true);
            spyOn(baseFilterEditor, 'GetCompareFieldText').and.returnValue('my-field-name');
        });

        afterEach(function () {
            element.remove();
        });

        it("should update UI on visible", function () {
            baseFilterEditor.UpdateArgumentFieldUI(true);

            expect(element.find('.col-input-field').hasClass('hidden')).toEqual(false);
            expect(element.find('.col-input-value').hasClass('hidden')).toEqual(true);
            expect(element.find('.input-argument-field-value').text()).toEqual('my-field-name');
            expect(element.find('.input-argument-value').val()).toEqual('');
        });

        it("should update UI on hidden", function () {
            baseFilterEditor.UpdateArgumentFieldUI(false);

            expect(element.find('.col-input-field').hasClass('hidden')).toEqual(true);
            expect(element.find('.col-input-value').hasClass('hidden')).toEqual(false);
            expect(element.find('.input-argument-field-value').text()).toEqual('');
            expect(element.find('.input-argument-value').val()).toEqual('');
        });
    });

    describe(".GetCompareFieldText", function () {
        beforeEach(function () {
            callInitial(null, $());
            spyOn(WC.WidgetFilterHelper, 'GetFilterFieldName').and.returnValue('my-name');
        });
        it("should get text", function () {
            var result = baseFilterEditor.GetCompareFieldText({ field: 'field1' });
            expect(result).toEqual('my-name');
        });
        it("should not get text (null)", function () {
            var result = baseFilterEditor.GetCompareFieldText(null);
            expect(result).toEqual('');
        });
        it("should get text (another type)", function () {
            var result = baseFilterEditor.GetCompareFieldText({ value: 0 });
            expect(result).toEqual('');
        });
    });
});