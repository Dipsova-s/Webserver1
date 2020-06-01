/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/userfriendlynamehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.DateTranslator.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseAdvanceFilterEditor.js" />

describe("BaseAdvanceFilterEditor", function () {
    var editor;
    beforeEach(function () {
        editor = new BaseAdvanceFilterEditor();
        editor.Handler = new QueryDefinitionHandler();
        editor.Data = new QueryStepViewModel({ step_type: 'filter', arguments: [], operator: '' });
    });

    describe("constructor", function () {
        it("should define variables", function () {
            var editorTest = new BaseAdvanceFilterEditor();

            // assert
            expect(editorTest.Data).toEqual(null);
            expect(editorTest.Handler).toEqual(null);
            expect(editorTest.$Element.length).toEqual(0);
        });
    });

    describe(".TransferArguments", function () {
        var args = {};
        var getArguments = function (names) {
            return $.map(names, function (name) { return args[name]; });
        };
        beforeEach(function () {
            args['value/relative'] = editor.GetObjectArgumentValue(10);
            args['value'] = editor.GetObjectArgumentValue(1000000);
            args['field'] = editor.GetObjectArgumentField('field');
            args['function/day'] = editor.GetObjectArgumentFunction('day', 10);
            args['function/week'] = editor.GetObjectArgumentFunction('week', 2);
        });

        var tests = [
            // relative -> xx
            {
                operator_from: 'relative_before',
                operator_to: 'relative_after',
                arguments: ['value/relative'],
                expected: ['value/relative']
            },
            {
                operator_from: 'relative_before',
                operator_to: 'relative_between',
                arguments: ['value/relative'],
                expected: ['value/relative']
            },
            {
                operator_from: 'relative_before',
                operator_to: 'greater_than',
                arguments: ['value/relative'],
                expected: ['function/day']
            },
            {
                operator_from: 'relative_before',
                operator_to: 'between',
                arguments: ['value/relative'],
                expected: ['function/day']
            },
            {
                operator_from: 'relative_before',
                operator_to: 'in_set',
                arguments: ['value/relative'],
                expected: []
            },
            {
                operator_from: 'relative_before',
                operator_to: 'has_value',
                arguments: ['value/relative'],
                expected: []
            },
            {
                operator_from: 'relative_between',
                operator_to: 'relative_before',
                arguments: ['value/relative', 'value/relative'],
                expected: ['value/relative']
            },
            {
                operator_from: 'relative_between',
                operator_to: 'greater_than',
                arguments: ['value/relative', 'value/relative'],
                expected: ['function/day']
            },
            {
                operator_from: 'relative_between',
                operator_to: 'between',
                arguments: ['value/relative', 'value/relative'],
                expected: ['function/day', 'function/day']
            },
            {
                operator_from: 'relative_between',
                operator_to: 'in_set',
                arguments: ['value/relative', 'value/relative'],
                expected:  []
            },
            {
                operator_from: 'relative_between',
                operator_to: 'has_value',
                arguments: ['value/relative', 'value/relative'],
                expected: []
            },

            // single (equal_to,..) -> xx
            {
                operator_from: 'equal_to',
                operator_to: 'greater_than',
                arguments: ['function/week'],
                expected:  ['function/week']
            },
            {
                operator_from: 'equal_to',
                operator_to: 'between',
                arguments: ['field'],
                expected:  ['field']
            },
            {
                operator_from: 'equal_to',
                operator_to: 'in_set',
                arguments: ['value'],
                expected:  ['value']
            },
            {
                operator_from: 'equal_to',
                operator_to: 'has_value',
                arguments: ['value'],
                expected:  []
            },
            {
                operator_from: 'equal_to',
                operator_to: 'relative_between',
                arguments: ['field'],
                expected:  []
            },
            {
                operator_from: 'equal_to',
                operator_to: 'relative_between',
                arguments: ['value'],
                expected:  []
            },
            {
                operator_from: 'equal_to',
                operator_to: 'relative_between',
                arguments: ['function/day'],
                expected:  ['value/relative']
            },

            // double (between,..) -> xx
            {
                operator_from: 'between',
                operator_to: 'greater_than',
                arguments: ['function/week', 'field'],
                expected:  ['function/week']
            },
            {
                operator_from: 'between',
                operator_to: 'not_between',
                arguments: ['function/week', 'field'],
                expected:  ['function/week', 'field']
            },
            {
                operator_from: 'between',
                operator_to: 'in_set',
                arguments: ['value', 'field'],
                expected:  ['value']
            },
            {
                operator_from: 'between',
                operator_to: 'in_set',
                arguments: ['function/day', 'field'],
                expected:  []
            },
            {
                operator_from: 'between',
                operator_to: 'has_value',
                arguments: ['function/week', 'field'],
                expected:  []
            },
            {
                operator_from: 'between',
                operator_to: 'relative_between',
                arguments: ['field', 'value'],
                expected:  []
            },
            {
                operator_from: 'between',
                operator_to: 'relative_between',
                arguments: ['function/day', 'function/day'],
                expected:  ['value/relative', 'value/relative']
            },

            // multiple (in_set) -> xx
            {
                operator_from: 'in_set',
                operator_to: 'relative_before',
                arguments: ['value', 'value', 'value'],
                expected:  []
            },
            {
                operator_from: 'in_set',
                operator_to: 'relative_between',
                arguments: ['value', 'value', 'value'],
                expected:  []
            },
            {
                operator_from: 'in_set',
                operator_to: 'equal_to',
                arguments: ['value', 'value', 'value'],
                expected:  ['value']
            },
            {
                operator_from: 'in_set',
                operator_to: 'between',
                arguments: ['value', 'value', 'value'],
                expected:  ['value', 'value']
            },
            {
                operator_from: 'in_set',
                operator_to: 'has_value',
                arguments: ['value', 'value', 'value'],
                expected:  []
            },
            {
                operator_from: 'in_set',
                operator_to: 'not_in_set',
                arguments: ['value', 'value', 'value'],
                expected:  ['value', 'value', 'value']
            },

            // no argument (has_value) -> xx
            {
                operator_from: 'has_value',
                operator_to: 'has_no_value',
                arguments: [],
                expected: []
            },
            {
                operator_from: 'has_value',
                operator_to: 'relative_before',
                arguments: [],
                expected:  []
            }
        ];

        $.each(tests, function (index, test) {
            it("should transfer arguments from '" + test.operator_from + " (" + test.arguments.join(',') + ")' to '" + test.operator_to + "' operator", function () {
                editor.Data.operator(test.operator_to);
                editor.Data.arguments(getArguments(test.arguments));
                editor.TransferArguments(test.operator_from);
            
                // assert
                expect(editor.Data.arguments()).toEqual(getArguments(test.expected));
            });
        });
    });

    describe(".GetSupportArgumentTypes", function () {
        var tests = [
            {
                title: 'should get a support types for "contains" operator',
                operator: 'contains',
                expected: ['value']
            },
            {
                title: 'should get a support types for "relative_after" operator',
                operator: 'relative_after',
                expected: ['value', 'function']
            },
            {
                title: 'should get a support types for "relative_between" operator',
                operator: 'relative_between',
                expected: ['value', 'function']
            },
            {
                title: 'should get a support types for "equal_to" operator',
                operator: 'equal_to',
                expected: ['value', 'field', 'function']
            },
            {
                title: 'should get a support types for "between" operator',
                operator: 'between',
                expected: ['value', 'field', 'function']
            },
            {
                title: 'should get a support types for "has_value" operator',
                operator: 'has_value',
                expected: []
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = editor.GetSupportArgumentTypes(test.operator);
            
                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".UpdateDropdownOperator", function () {
        var dropdownHandler;
        beforeEach(function () {
            dropdownHandler = {
                setDataSource: $.noop,
                value: $.noop,
                refresh: $.noop
            };
            spyOn(dropdownHandler, 'setDataSource');
            spyOn(dropdownHandler, 'value');
            spyOn(dropdownHandler, 'refresh');
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdownHandler);
            spyOn(editor, 'UpdateDropdownOperatorForRTMS');
            spyOn(editor, 'GetOperators').and.returnValue(ko.toJS(enumHandlers.QUERYSTEPOPERATOR.SIMPLIFYDATE));
        });
        var tests = [
            {
                title: 'should refresh dropdown (is_type_function=false)',
                operator: 'less_than_or_equal',
                is_type_function: false,
                expected: 'less_than_or_equal'
            },
            {
                title: 'should update operator to "less_than" and refresh dropdown (is_type_function=true)',
                operator: 'less_than_or_equal',
                is_type_function: true,
                expected: 'less_than'
            },
            {
                title: 'should update operator to "greater_than" and refresh dropdown (is_type_function=true)',
                operator: 'greater_than_or_equal',
                is_type_function: true,
                expected: 'greater_than'
            },
            {
                title: 'should update operator to "less_than" and refresh dropdown (operator=relative_before)',
                operator: 'relative_before',
                is_type_function: false,
                expected: 'relative_before'
            },
            {
                title: 'should update operator to "less_than" and refresh dropdown (operator=relative_between)',
                operator: 'relative_between',
                is_type_function: false,
                expected: 'relative_between'
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                editor.Data.operator(test.operator);
                editor.UpdateDropdownOperator(test.is_type_function);

                // assert
                expect(editor.Data.operator()).toEqual(test.expected);
                expect(dropdownHandler.setDataSource).toHaveBeenCalled();
                expect(dropdownHandler.value).toHaveBeenCalled();
                expect(dropdownHandler.refresh).toHaveBeenCalled();
            });
        });
    });

    describe(".UpdateDropdownOperatorForRTMS", function () {
        var data;
        beforeEach(function () {
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue({ id: "EA2_800" });
            data = ko.toJS(enumHandlers.QUERYSTEPOPERATOR.SIMPLIFYDATE);
        });
        it("should return dropdown list without relative filter when model is rtms", function () {
            spyOn(aboutSystemHandler, 'IsRealTimeModel').and.returnValue(true);
            var count = data.length;

            // assert
            editor.UpdateDropdownOperatorForRTMS(data);
            expect(data.length).toEqual(12);
        });
        it("should return dropdown list with relative filter when model is not rtms", function () {
            spyOn(aboutSystemHandler, 'IsRealTimeModel').and.returnValue(false);
            var count = data.length;
            
            // assert
            editor.UpdateDropdownOperatorForRTMS(data);
            expect(data.length).toEqual(count);
        });
    });

    describe(".GetArgumentDefaultTemplate", function () {
        it("should get template with 'custom-class-name' class name", function () {
            var result = editor.GetArgumentDefaultTemplate('custom-class-name');

            // assert
            expect(result).toContain('custom-class-name');
            expect(result).toContain('col-input-type');
            expect(result).toContain('col-input-value');
            expect(result).toContain('col-input-field');
            expect(result).toContain('col-input-period');
        });
        it("should get template without 'custom-class-name' class name", function () {
            var result = editor.GetArgumentDefaultTemplate();

            // assert
            expect(result).not.toContain('custom-class-name');
            expect(result).toContain('col-input-type');
            expect(result).toContain('col-input-value');
            expect(result).toContain('col-input-field');
            expect(result).toContain('col-input-period');
        });
    });

    describe(".GetArgumentPreviewTemplate", function () {
        it("should get template", function () {
            var result = editor.GetArgumentPreviewTemplate();

            // assert
            expect(result).toContain('col-argument-preview');
        });
    });

    describe(".GetDefaultArgument", function () {
        it("should get default argument (field)", function () {
            var result = editor.GetDefaultArgument('field');

            // assert
            expect(result.argument_type).toEqual('field');
            expect(result.field).toEqual(null);
        });
        it("should get default argument (function)", function () {
            var result = editor.GetDefaultArgument('function');

            // assert
            expect(result.argument_type).toEqual('function');
            expect(result.parameters.length).toEqual(2);
            expect(result.parameters[0].value).toEqual('day');
            expect(result.parameters[1].value).toEqual(0);
        });
        it("should get default argument (value)", function () {
            var result = editor.GetDefaultArgument('value');

            // assert
            expect(result.argument_type).toEqual('value');
            expect(result.value).toEqual(null);
        });
        it("should get default argument (undefined)", function () {
            var result = editor.GetDefaultArgument();

            // assert
            expect(result.argument_type).toEqual('value');
            expect(result.value).toEqual(null);
        });
    });

    describe(".GetArgumentOrDefault", function () {
        beforeEach(function () {
            spyOn(editor, 'GetDefaultArgument').and.returnValue('get-by-default');
        });
        it("should get default argument (no argument)", function () {
            var result = editor.GetArgumentOrDefault();

            // assert
            expect(editor.GetDefaultArgument).toHaveBeenCalled();
            expect(result).toEqual('get-by-default');
        });
        it("should get default argument (difference type)", function () {
            var result = editor.GetArgumentOrDefault({ argument_type: 'value' }, 'function');

            // assert
            expect(editor.GetDefaultArgument).toHaveBeenCalled();
            expect(result).toEqual('get-by-default');
        });
        it("should get argument", function () {
            var result = editor.GetArgumentOrDefault({ argument_type: 'value' }, 'value');

            // assert
            expect(editor.GetDefaultArgument).not.toHaveBeenCalled();
            expect(result).toEqual({ argument_type: 'value' });
        });
    });

    describe(".SetArgumentCache", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue({ options: { cache: {} } });
        });
        it("should not set cache", function () {
            editor.SetArgumentCache($(), null);

            // assert
            expect(WC.HtmlHelper.DropdownList).not.toHaveBeenCalled();
        });
        it("should set cache", function () {
            editor.SetArgumentCache($(), {});

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
        });
    });

    describe(".InitialArgumentUI", function () {
        beforeEach(function () {
            editor.Data.arguments([{}]);
            spyOn(editor, 'GetDefaultArgument');
            spyOn(editor, 'CreateDropdownArgumentType');
            spyOn(editor, 'CreateInputFunction');
            spyOn(editor, 'CreateInputValue');
            spyOn(editor, 'CreateInputField');
            spyOn(editor, 'UpdateArgumentUI');
        });
        it("should initial UI", function () {
            editor.InitialArgumentUI($(), 0);

            // assert
            expect(editor.GetDefaultArgument).not.toHaveBeenCalled();
            expect(editor.CreateDropdownArgumentType).toHaveBeenCalled();
            expect(editor.CreateInputFunction).toHaveBeenCalled();
            expect(editor.CreateInputValue).toHaveBeenCalled();
            expect(editor.CreateInputField).toHaveBeenCalled();
            expect(editor.UpdateArgumentUI).toHaveBeenCalled();
        });
        it("should initial UI without argument", function () {
            editor.InitialArgumentUI($(), 1);

            // assert
            expect(editor.GetDefaultArgument).toHaveBeenCalled();
            expect(editor.CreateDropdownArgumentType).toHaveBeenCalled();
            expect(editor.CreateInputFunction).toHaveBeenCalled();
            expect(editor.CreateInputValue).toHaveBeenCalled();
            expect(editor.CreateInputField).toHaveBeenCalled();
            expect(editor.UpdateArgumentUI).toHaveBeenCalled();
        });
    });

    describe(".CreateDropdownArgumentType", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper, 'DropdownList');
            spyOn(editor, 'SetArgumentCache');
            spyOn(editor, 'GetArgumentOrDefault');
        });
        it("should create dropdown", function () {
            editor.CreateDropdownArgumentType($(), {}, 0);

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(editor.SetArgumentCache).toHaveBeenCalledTimes(3);
            expect(editor.GetArgumentOrDefault).toHaveBeenCalledTimes(3);
        });
    });

    describe(".ArgumentTypeSelect", function () {

        var e;
        beforeEach(function () {
            e = {
                preventDefault: $.noop,
                sender: {
                    dataItem: $.noop,
                    options: {
                        cache: {
                            field: {
                                field: null
                            }
                        }
                    }
                }
            };
            spyOn(e, 'preventDefault');
            spyOn(editor, 'ShowCompareFieldPopup');
        });
        it("should show compare field popup (type=field, field=null)", function () {
            spyOn(e.sender, 'dataItem').and.returnValue({ Value: 'field' });
            editor.ArgumentTypeSelect($(), 0, e);

            // assert
            expect(e.preventDefault).toHaveBeenCalled();
            expect(editor.ShowCompareFieldPopup).toHaveBeenCalled();
        });
        it("should not show compare field popup (type=value, field=null)", function () {
            spyOn(e.sender, 'dataItem').and.returnValue({ Value: 'value' });
            e.sender.options.cache.field.field = null;
            editor.ArgumentTypeSelect($(), 0, e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect(editor.ShowCompareFieldPopup).not.toHaveBeenCalled();
        });
        it("should not show compare field popup (type=field, field=field1)", function () {
            spyOn(e.sender, 'dataItem').and.returnValue({ Value: 'field' });
            e.sender.options.cache.field.field = 'field1';
            editor.ArgumentTypeSelect($(), 0, e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect(editor.ShowCompareFieldPopup).not.toHaveBeenCalled();
        });
    });

    describe(".ArgumentTypeChange", function () {
        var e;
        beforeEach(function () {
            e = {
                sender: {
                    value: $.noop,
                    options: {
                        cache: {}
                    }
                }
            };
            spyOn(editor, 'UpdateArgument');
        });
        it("should update argument from cache", function () {
            editor.ArgumentTypeChange($(), 0, e);

            // assert
            expect(editor.UpdateArgument).toHaveBeenCalled();
        });
    });

    describe(".UpdateArgument", function () {
        beforeEach(function () {
            spyOn(editor, 'AdjustDoubleArguments');
            spyOn(editor, 'ContainArgumentFunction');
            spyOn(editor, 'SetArgumentCache');
            spyOn(editor, 'UpdateArgumentUI');
        });
        it("should update data, cache and UI", function () {
            spyOn(editor, 'IsValidAllArguments').and.returnValue(true);
            editor.UpdateArgument($(), {}, 0);

            // assert
            expect(editor.Data.arguments().length).toEqual(1);
            expect(editor.AdjustDoubleArguments).toHaveBeenCalled();
            expect(editor.IsValidAllArguments).toHaveBeenCalled();
            expect(editor.SetArgumentCache).toHaveBeenCalled();
            expect(editor.UpdateArgumentUI).toHaveBeenCalled();
        });
        it("should clear data, update cache and UI", function () {
            spyOn(editor, 'IsValidAllArguments').and.returnValue(false);
            editor.UpdateArgument($(), {}, 1);

            // assert
            expect(editor.Data.arguments().length).toEqual(0);
            expect(editor.AdjustDoubleArguments).toHaveBeenCalled();
            expect(editor.IsValidAllArguments).toHaveBeenCalled();
            expect(editor.SetArgumentCache).toHaveBeenCalled();
            expect(editor.UpdateArgumentUI).toHaveBeenCalled();
        });
    });

    describe(".UpdateArgumentUI", function () {
        beforeEach(function () {
            spyOn(editor, 'UpdateDropdownOperator');
            spyOn(editor, 'UpdateArgumentFunctionUI');
            spyOn(editor, 'UpdateArgumentFieldUI');
            spyOn(editor, 'UpdateArgumentValueUI');
            spyOn(editor, 'UpdateArgumentPreview');
            spyOn(editor.Handler, 'TriggerUpdateBlockUI');
        });
        it("should update UI (argument=function, update_input=true)", function () {
            editor.UpdateArgumentUI($(), { argument_type: 'function' }, true, null);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentFunctionUI).toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentValueUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
        it("should update UI (argument=function, update_input=false)", function () {
            editor.UpdateArgumentUI($(), { argument_type: 'function' }, false, null);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentFunctionUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentValueUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
        it("should update UI (argument=field, update_input=true)", function () {
            editor.UpdateArgumentUI($(), { argument_type: 'field' }, true, null);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentFunctionUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).toHaveBeenCalled();
            expect(editor.UpdateArgumentValueUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
        it("should update UI (argument=field, update_input=false)", function () {
            editor.UpdateArgumentUI($(), { argument_type: 'field' }, false, null);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentFunctionUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentValueUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
        it("should update UI (argument=value, update_input=true)", function () {
            editor.UpdateArgumentUI($(), { argument_type: 'value' }, true, null);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentFunctionUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentValueUI).toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
        it("should update UI (argument=value, update_input=false)", function () {
            editor.UpdateArgumentUI($(), { argument_type: 'value' }, false);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentFunctionUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentValueUI).not.toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
    });

    describe(".IsValidArgument", function () {
        it("should not valid (no argument)", function () {
            var result = editor.IsValidArgument();

            // assert
            expect(result).toBeFalsy();
        });
        it("should valid (argument_type=any)", function () {
            var result = editor.IsValidArgument({ argument_type: 'any' });

            // assert
            expect(result).toBeTruthy();
        });
        it("should not valid (argument_type=value, argument invalid)", function () {
            spyOn(editor, 'IsValidArgumentValue').and.returnValue(false);
            var result = editor.IsValidArgument({ argument_type: 'value' });

            // assert
            expect(result).toBeFalsy();
        });
        it("should valid (argument_type=value, argument valid)", function () {
            spyOn(editor, 'IsValidArgumentValue').and.returnValue(true);
            var result = editor.IsValidArgument({ argument_type: 'value' });

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe(".IsValidAllArguments", function () {
        it("should valid", function () {
            spyOn(editor, 'IsValidArgument').and.returnValue(true);
            var result = editor.IsValidAllArguments([{}, {}]);

            // assert
            expect(result).toEqual(true);
        });
        it("should not valid", function () {
            spyOn(editor, 'IsValidArgument').and.returnValue(false);
            var result = editor.IsValidAllArguments([{}, {}]);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".UpdateArgumentPreview", function () {
        beforeEach(function () {
            editor.$Element = $('<div><div class="col-argument-preview"></div></div>');
        });
        it("should show preview text", function () {
            spyOn(editor, 'GetArgumentPreview').and.returnValue('preview');
            editor.UpdateArgumentPreview();

            // assert
            expect(editor.$Element.find('.col-argument-preview').text()).toEqual('preview');
            expect(editor.$Element.find('.col-argument-preview').hasClass('hidden')).toEqual(false);
        });
        it("should not show preview text", function () {
            spyOn(editor, 'GetArgumentPreview').and.returnValue('');
            editor.UpdateArgumentPreview();

            // assert
            expect(editor.$Element.find('.col-argument-preview').text()).toEqual('');
            expect(editor.$Element.find('.col-argument-preview').hasClass('hidden')).toEqual(true);
        });
    });

    describe(".GetArgumentPreview", function () {
        beforeEach(function () {
            editor.Data.arguments([{}, {}]);
            spyOn(editor, 'ConvertRelativeToFunctionArgument');
            spyOn(WC.WidgetFilterHelper, 'GetTranslatedSettings').and.returnValue({
                template: '',
                arguments: []
            });
        });
        it("should get preview text for common operator", function () {
            spyOn(editor, 'IsRelativeOperator').and.returnValue(false);
            editor.GetArgumentPreview();

            // assert
            expect(editor.ConvertRelativeToFunctionArgument).toHaveBeenCalledTimes(0);
            expect(WC.WidgetFilterHelper.GetTranslatedSettings).toHaveBeenCalledTimes(1);
        });
        it("should get preview text for relative operator", function () {
            spyOn(editor, 'IsRelativeOperator').and.returnValue(true);
            editor.GetArgumentPreview();

            // assert
            expect(editor.ConvertRelativeToFunctionArgument).toHaveBeenCalledTimes(2);
            expect(WC.WidgetFilterHelper.GetTranslatedSettings).toHaveBeenCalledTimes(1);
        });
    });

    describe(".CreateInputFunction", function () {
        it("should create UI", function () {
            spyOn(editor, 'CreateInputFunctionValue');
            editor.CreateInputFunction($(), 0);

            // assert
            expect(editor.CreateInputFunctionValue).toHaveBeenCalled();
        });
    });

    describe(".CreateInputFunctionValue", function () {
        beforeEach(function () {
            $.fn.kendoPeriodPicker = $.fn.kendoPeriodPicker || $.noop;
            spyOn($.fn, 'kendoPeriodPicker');
        });
        it("should create UI", function () {
            editor.CreateInputFunctionValue($(), 0, $.noop);

            // assert
            expect($.fn.kendoPeriodPicker).toHaveBeenCalled();
        });
    });

    describe(".GetInputFunctionValueDataSource", function () {
        it("should get data source", function () {
            var result = editor.GetInputFunctionValueDataSource('0');

            // assert
            expect(result.findObject('value', 0).text).toEqual('this');
            expect(result.findObject('value', -1).text).toEqual('last');
            expect(result.findObject('value', 1).text).toEqual('next');
        });
    });

    describe(".SetInputFunction", function () {
        it("should update UI", function () {
            spyOn($.fn, 'data').and.returnValue({ period: function () { return {}; } });
            spyOn(editor, 'UpdateArgument');
            editor.SetInputFunction($(), 0);

            // assert
            expect(editor.UpdateArgument).toHaveBeenCalled();
        });
    });

    describe(".UpdateArgumentFunctionUI", function () {
        it("should update UI", function () {
            var handler = { period: $.noop };
            spyOn(handler, 'period');
            spyOn($.fn, 'data').and.returnValue(handler);
            editor.UpdateArgumentFunctionUI($(), { parameters: [] });

            // assert
            expect(handler.period).toHaveBeenCalledTimes(1);
        });
    });

    describe(".SetInputValue", function () {
        it("should update UI", function () {
            spyOn(editor, 'GetInputArgumentValue').and.returnValue(0);
            spyOn(editor, 'UpdateArgument');
            editor.SetInputValue($(), 0);

            // assert
            expect(editor.UpdateArgument).toHaveBeenCalled();
        });
    });

    describe(".ShowCompareFieldPopup", function () {
        it("should show popup", function () {
            spyOn(editor, 'GetCompareFieldTarget').and.returnValue('field_target');
            spyOn(fieldsChooserHandler, 'ShowPopup');
            spyOn(editor.Handler, 'InitialAddFilterOptions');
            editor.ShowCompareFieldPopup();

            // assert
            expect(editor.Handler.InitialAddFilterOptions).toHaveBeenCalled();
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".SetCompareField", function () {
        it("should set a compare field", function () {
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue({ value: $.noop });
            spyOn(editor, 'UpdateArgument');
            spyOn(editor, 'UpdateArgumentFieldUI');
            editor.SetCompareField($(), 0, { id: 'fieldid' });

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(editor.UpdateArgument).toHaveBeenCalled();
            expect(editor.UpdateArgumentFieldUI).toHaveBeenCalled();
        });
    });

    describe(".CreateInputField", function () {
        it("should create UI", function () {
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            editor.CreateInputField($(), 0);

            // assert
            expect($.fn.off).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
        });
    });

    describe(".UpdateArgumentFieldUI", function () {
        it("should update UI", function () {
            spyOn($.fn, 'text');
            spyOn(editor, 'GetCompareFieldText');
            editor.UpdateArgumentFieldUI($(), {});

            // assert
            expect(editor.GetCompareFieldText).toHaveBeenCalled();
            expect($.fn.text).toHaveBeenCalled();
        });
    });

    describe(".GetArgumentRelativeTemplate", function () {
        it("should get template with 'custom-class-name' class name", function () {
            var result = editor.GetArgumentRelativeTemplate('custom-class-name');

            // assert
            expect(result).toContain('custom-class-name');
            expect(result).toContain('col-input-type');
            expect(result).toContain('col-input-period');
        });
        it("should get template without 'custom-class-name' class name", function () {
            var result = editor.GetArgumentRelativeTemplate();

            // assert
            expect(result).not.toContain('custom-class-name');
            expect(result).toContain('col-input-type');
            expect(result).toContain('col-input-period');
        });
    });

    describe(".InitialRelativeArgumentUI", function () {
        beforeEach(function () {
            editor.Data.arguments([{}]);
            spyOn(editor, 'CreateDropdownRelativeArgumentType');
            spyOn(editor, 'CreateInputRelativeValue');
            spyOn(editor, 'UpdateRelativeArgumentUI');
        });
        it("should initial UI", function () {
            editor.InitialRelativeArgumentUI($(), 0);

            // assert
            expect(editor.Data.arguments().length).toEqual(1);
            expect(editor.CreateDropdownRelativeArgumentType).toHaveBeenCalled();
            expect(editor.CreateInputRelativeValue).toHaveBeenCalled();
            expect(editor.UpdateRelativeArgumentUI).toHaveBeenCalled();
        });
        it("should initial UI and set default data", function () {
            editor.InitialRelativeArgumentUI($(), 1);

            // assert
            expect(editor.Data.arguments().length).toEqual(2);
            expect(editor.CreateDropdownRelativeArgumentType).toHaveBeenCalled();
            expect(editor.CreateInputRelativeValue).toHaveBeenCalled();
            expect(editor.UpdateRelativeArgumentUI).toHaveBeenCalled();
        });
    });

    describe(".CreateDropdownRelativeArgumentType", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper, 'DropdownList');
            spyOn(editor, 'SetArgumentCache');
        });
        it("should create UI", function () {
            editor.CreateDropdownRelativeArgumentType($(), {});

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(editor.SetArgumentCache).toHaveBeenCalled();
        });
    });

    describe(".CreateInputRelativeValue", function () {
        it("should create UI", function () {
            spyOn(editor, 'CreateInputFunctionValue');
            editor.CreateInputRelativeValue($(), 0);

            // assert
            expect(editor.CreateInputFunctionValue).toHaveBeenCalled();
        });
    });

    describe(".SetInputRelativeValue", function () {
        it("should update UI", function () {
            spyOn($.fn, 'data').and.returnValue({ value: function () { return 'day'; } });
            spyOn(editor, 'UpdateRelativeArgument');
            editor.SetInputRelativeValue($(), 0);

            // assert
            expect(editor.UpdateRelativeArgument).toHaveBeenCalled();
        });
    });

    describe(".UpdateRelativeArgument", function () {
        beforeEach(function () {
            spyOn(editor, 'AdjustDoubleArguments');
            spyOn(editor, 'UpdateRelativeArgumentUI');
        });
        it("should update data, cache and UI", function () {
            spyOn(editor, 'IsValidAllArguments').and.returnValue(true);
            editor.UpdateRelativeArgument($(), {}, 0);

            // assert
            expect(editor.Data.arguments().length).toEqual(1);
            expect(editor.AdjustDoubleArguments).toHaveBeenCalled();
            expect(editor.IsValidAllArguments).toHaveBeenCalled();
            expect(editor.UpdateRelativeArgumentUI).toHaveBeenCalled();
        });
        it("should clear data, update cache and UI", function () {
            spyOn(editor, 'IsValidAllArguments').and.returnValue(false);
            editor.UpdateRelativeArgument($(), {}, 1);

            // assert
            expect(editor.Data.arguments().length).toEqual(0);
            expect(editor.AdjustDoubleArguments).toHaveBeenCalled();
            expect(editor.IsValidAllArguments).toHaveBeenCalled();
            expect(editor.UpdateRelativeArgumentUI).toHaveBeenCalled();
        });
    });

    describe(".UpdateRelativeArgumentUI", function () {
        beforeEach(function () {
            spyOn($.fn, 'data').and.returnValue({ value: $.noop });
            spyOn(editor, 'UpdateDropdownOperator');
            spyOn(editor, 'UpdateArgumentPreview');
            spyOn(editor.Handler, 'TriggerUpdateBlockUI');
        });
        it("should update UI (update_input=true)", function () {
            editor.UpdateRelativeArgumentUI($(), {}, true);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
        it("should update UI (update_input=false)", function () {
            editor.UpdateRelativeArgumentUI($(), {}, false);

            // assert
            expect(editor.UpdateDropdownOperator).toHaveBeenCalled();
            expect(editor.UpdateArgumentPreview).toHaveBeenCalled();
            expect(editor.Handler.TriggerUpdateBlockUI).toHaveBeenCalled();
        });
    });

    describe(".ConvertRelativeToFunctionArgument", function () {
        it("can convert relative to function argument", function () {
            var argument = {
                argument_type: 'value',
                value: 10
            };
            var result = editor.ConvertRelativeToFunctionArgument(argument);

            // assert
            expect(result.argument_type).toEqual('function');
            expect(result.parameters[0].value).toEqual('day');
            expect(result.parameters[1].value).toEqual(10);
        });
    });

    describe(".ConvertFunctionToRelativeArgument", function () {
        it("can convert function to relative argument", function () {
            var argument = {
                argument_type: 'function',
                parameters: [
                    { name: 'period_type', value: 'week' },
                    { name: 'periods_to_add', value: 2 }
                ]
            };
            var result = editor.ConvertFunctionToRelativeArgument(argument);

            // assert
            expect(result.argument_type).toEqual('value');
            expect(result.value).toEqual(14);
        });
    });

    describe(".GetSingleArgumentTemplate", function () {
        beforeEach(function () {
            spyOn(editor, 'GetArgumentDefaultTemplate').and.returnValue('template-default');
            spyOn(editor, 'GetArgumentRelativeTemplate').and.returnValue('template-relative');
            spyOn(editor, 'GetArgumentPreviewTemplate').and.returnValue('template-preview');
        });
        it("should get template for common operator", function () {
            editor.Data.operator('equal_to');
            var result = editor.GetSingleArgumentTemplate();

            // assert
            expect(result).toContain('template-default');
            expect(result).toContain('template-preview');
            expect(editor.GetArgumentDefaultTemplate).toHaveBeenCalledTimes(1);
            expect(editor.GetArgumentRelativeTemplate).toHaveBeenCalledTimes(0);
            expect(editor.GetArgumentPreviewTemplate).toHaveBeenCalledTimes(1);
        });
        it("should get template for relative operator", function () {
            editor.Data.operator('relative_before');
            var result = editor.GetSingleArgumentTemplate();

            // assert
            expect(result).toContain('template-relative');
            expect(result).toContain('template-preview');
            expect(editor.GetArgumentDefaultTemplate).toHaveBeenCalledTimes(0);
            expect(editor.GetArgumentRelativeTemplate).toHaveBeenCalledTimes(1);
            expect(editor.GetArgumentPreviewTemplate).toHaveBeenCalledTimes(1);
        });
    });

    describe(".InitialSingleArgumentUI", function () {
        beforeEach(function () {
            spyOn(editor, 'SetElementCssClass');
            spyOn(editor, 'InitialArgumentUI');
            spyOn(editor, 'InitialRelativeArgumentUI');
        });
        it("should get template for common operator", function () {
            editor.Data.operator('equal_to');
            editor.InitialSingleArgumentUI($());

            // assert
            expect(editor.SetElementCssClass).toHaveBeenCalledTimes(1);
            expect(editor.InitialArgumentUI).toHaveBeenCalledTimes(1);
            expect(editor.InitialRelativeArgumentUI).toHaveBeenCalledTimes(0);
        });
        it("should get template for relative operator", function () {
            editor.Data.operator('relative_before');
            editor.InitialSingleArgumentUI($());

            // assert
            expect(editor.SetElementCssClass).toHaveBeenCalledTimes(1);
            expect(editor.InitialArgumentUI).toHaveBeenCalledTimes(0);
            expect(editor.InitialRelativeArgumentUI).toHaveBeenCalledTimes(1);
        });
    });

    describe(".GetDoubleArgumentTemplate", function () {
        beforeEach(function () {
            spyOn(editor, 'GetArgumentDefaultTemplate').and.returnValue('template-default');
            spyOn(editor, 'GetArgumentRelativeTemplate').and.returnValue('template-relative');
            spyOn(editor, 'GetArgumentPreviewTemplate').and.returnValue('template-preview');
        });
        it("should get template for common operator", function () {
            editor.Data.operator('between');
            var result = editor.GetDoubleArgumentTemplate();

            // assert
            expect(result).toContain('template-default');
            expect(result).toContain('template-preview');
            expect(editor.GetArgumentDefaultTemplate).toHaveBeenCalledTimes(2);
            expect(editor.GetArgumentRelativeTemplate).toHaveBeenCalledTimes(0);
            expect(editor.GetArgumentPreviewTemplate).toHaveBeenCalledTimes(1);
        });
        it("should get template for relative operator", function () {
            editor.Data.operator('relative_between');
            var result = editor.GetDoubleArgumentTemplate();

            // assert
            expect(result).toContain('template-relative');
            expect(result).toContain('template-preview');
            expect(editor.GetArgumentDefaultTemplate).toHaveBeenCalledTimes(0);
            expect(editor.GetArgumentRelativeTemplate).toHaveBeenCalledTimes(2);
            expect(editor.GetArgumentPreviewTemplate).toHaveBeenCalledTimes(1);
        });
    });

    describe(".InitialDoubleArgumentUI", function () {
        beforeEach(function () {
            spyOn(editor, 'SetElementCssClass');
            spyOn(editor, 'InitialArgumentUI');
            spyOn(editor, 'InitialRelativeArgumentUI');
        });
        it("should get template for common operator", function () {
            editor.Data.operator('between');
            editor.InitialDoubleArgumentUI($());

            // assert
            expect(editor.SetElementCssClass).toHaveBeenCalledTimes(1);
            expect(editor.InitialArgumentUI).toHaveBeenCalledTimes(2);
            expect(editor.InitialRelativeArgumentUI).toHaveBeenCalledTimes(0);
        });
        it("should get template for relative operator", function () {
            editor.Data.operator('relative_between');
            editor.InitialDoubleArgumentUI($());

            // assert
            expect(editor.SetElementCssClass).toHaveBeenCalledTimes(1);
            expect(editor.InitialArgumentUI).toHaveBeenCalledTimes(0);
            expect(editor.InitialRelativeArgumentUI).toHaveBeenCalledTimes(2);
        });
    });

    describe(".AdjustDoubleArguments", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue({
                value: function () { return 'value' },
                options: {
                    cache: {
                        value: { value: 1 }
                    }
                }
            });
        });
        it("should adjust argument", function () {
            editor.Data.operator('between');
            var args = [{ field: 'field' }];
            editor.AdjustDoubleArguments(args, 0);

            // assert
            expect(args.length).toEqual(2);
            expect(args[0].field).toEqual('field');
            expect(args[1].value).toEqual(1);
        });
        it("should not adjust argument (single argument type)", function () {
            editor.Data.operator('equal_to');
            var args = [{ field: 'field' }];
            editor.AdjustDoubleArguments(args, 0);

            // assert
            expect(args.length).toEqual(1);
            expect(args[0].field).toEqual('field');
        });
        it("should not adjust argument (existed)", function () {
            editor.Data.operator('between');
            var args = [{ field: 'field' }, { field: 'field2' }];
            editor.AdjustDoubleArguments(args, 0);

            // assert
            expect(args.length).toEqual(2);
            expect(args[0].field).toEqual('field');
            expect(args[1].field).toEqual('field2');
        });
    });
});