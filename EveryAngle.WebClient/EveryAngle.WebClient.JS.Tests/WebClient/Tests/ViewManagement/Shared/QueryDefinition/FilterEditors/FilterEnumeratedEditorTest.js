/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/viewmanagement/shared/fieldchooserhandler.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterEnumeratedEditor.js" />

describe("FilterEnumeratedEditor", function () {
    var editor;
    beforeEach(function () {
        var handler = new QueryDefinitionHandler();
        var queryStep = new QueryStepViewModel({ step_type: 'filter', arguments: [], operator: '' });
        editor = new FilterEnumeratedEditor(handler, queryStep, $());
    });

    describe(".Initial", function () {
        it("should update field domain data and inject css", function () {
            spyOn(editor, 'UpdateFieldDomainData');
            spyOn(editor, 'InjectElementsCSS');
            spyOn(editor.parent.prototype, 'Initial');
            editor.Initial({}, {}, $());

            // assert
            expect(editor.UpdateFieldDomainData).toHaveBeenCalled();
            expect(editor.InjectElementsCSS).toHaveBeenCalled();
            expect(editor.parent.prototype.Initial).toHaveBeenCalled();
        });
    });

    describe(".GetOperators", function () {
        it("should get operators", function () {
            var result = editor.GetOperators();
            var expected = [].concat(enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
                        enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
                        enumHandlers.QUERYSTEPOPERATOR.ENUMONE);

            // assert
            expect(result).toEqual(expected);
        });
    });

    describe(".TransferArguments", function () {
        var clearAllTests = [
            {
                previous_operator: 'contains',
                current_operator: 'has_value'
            },
            {
                previous_operator: 'contains',
                current_operator: 'equal_to'
            },
            {
                previous_operator: 'contains',
                current_operator: 'in_set'
            },
            {
                previous_operator: 'has_value',
                current_operator: 'contains'
            },
            {
                previous_operator: 'equal_to',
                current_operator: 'contains'
            },
            {
                previous_operator: 'in_set',
                current_operator: 'contains'
            }
        ];
        $.each(clearAllTests, function (index, test) {
            it("should clear all arguments for '" + test.previous_operator + "' vs '" + test.current_operator + "' operator", function () {
                spyOn(editor.parent.prototype, 'TransferArguments');
                editor.Data.arguments([{}, {}]);
                editor.Data.operator(test.current_operator);
                editor.TransferArguments(test.previous_operator);

                // assert
                expect(editor.Data.arguments().length).toEqual(0);
                expect(editor.parent.prototype.TransferArguments).not.toHaveBeenCalled();
            });
        });

        var defaultTests = [
            {
                previous_operator: 'has_value',
                current_operator: 'equal_to'
            },
            {
                previous_operator: 'equal_to',
                current_operator: 'has_value'
            },
            {
                previous_operator: 'contains',
                current_operator: 'starts_with'
            },
            {
                previous_operator: 'starts_with',
                current_operator: 'contains'
            },
            {
                previous_operator: 'in_set',
                current_operator: 'equal_to'
            },
            {
                previous_operator: 'equal_to',
                current_operator: 'in_set'
            }
        ];
        $.each(defaultTests, function (index, test) {
            it("should transfer arguments normally for '" + test.previous_operator + "' vs '" + test.current_operator + "' operator", function () {
                spyOn(editor.parent.prototype, 'TransferArguments');
                editor.Data.arguments([{}, {}]);
                editor.Data.operator(test.current_operator);
                editor.TransferArguments(test.previous_operator);

                // assert
                expect(editor.parent.prototype.TransferArguments).toHaveBeenCalled();
            });
        });
    });

    describe(".UpdateFieldDomainData", function () {
        beforeEach(function () {
            spyOn(modelFieldDomainHandler, 'GetDomainPathByUri').and.returnValue('test');
            spyOn(modelFieldDomainHandler, 'GetFieldDomainByUri').and.returnValue({ elements: [{ id: 'id1' }, { id: 'id2' }, { id: 'xx' }] });
        });
        it("can update data", function () {
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({});
            editor.UpdateFieldDomainData(editor.Data, editor.Handler);

            // assert
            expect(editor.GetFieldDomainImagePath()).toEqual('test');
            expect(editor.GetFieldDomainData().length).toEqual(3);
            expect(editor.EnumeratedGridJumpIndexes('i').length).toEqual(2);
            expect(editor.EnumeratedGridJumpIndexes('x').length).toEqual(1);
        });
        it("can update data (no field object)", function () {
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
            editor.UpdateFieldDomainData(editor.Data, editor.Handler);

            // assert
            expect(editor.GetFieldDomainImagePath()).toEqual('');
            expect(editor.GetFieldDomainData().length).toEqual(0);
            expect(editor.EnumeratedGridJumpIndexes('i').length).toEqual(0);
            expect(editor.EnumeratedGridJumpIndexes('x').length).toEqual(0);
        });
    });

    describe(".GetElementSearchIndexes", function () {
        it("should get a compare field target", function () {
            var data = [
                { id: 'A1' }, { id: 'a2' }, { id: 'A3' },
                { id: '<no value>' }, { id: '<not in set>' },
                { id: '001' }
            ];
            var result = editor.GetElementSearchIndexes(data);

            // assert
            expect(result['a'].length).toEqual(3);
            expect(result['<'].length).toEqual(2);
            expect(result['0'].length).toEqual(1);
        });
    });

    describe(".InjectElementsCSS", function () {
        it("should get a compare field target", function () {
            var handler = { injectCSS: $.noop };
            spyOn(handler, 'injectCSS');
            spyOn(modelFieldDomainHandler, 'GetDomainElementIconInfo').and.returnValue(handler);
            var data = [{ id: 'A1' }, { id: 'a2' }, { id: 'A3' }];
            editor.InjectElementsCSS(data);

            // assert
            expect(modelFieldDomainHandler.GetDomainElementIconInfo).toHaveBeenCalledTimes(3);
            expect(handler.injectCSS).toHaveBeenCalledTimes(3);
        });
    });

    describe(".NormalizeFieldDomainData", function () {
        it("should get data", function () {
            spyOn(modelFieldDomainHandler, 'GetDomainElementIconInfo').and.returnValue({});
            var data = {
                may_be_sorted: true,
                elements: [
                    { id: 'e1', short_name: 'element 1' },
                    { id: 'e3', short_name: 'element 3' },
                    { id: 'e2', short_name: 'element 2' },
                    { id: '~NotInSet', short_name: '<not in set>' },
                    { id: null, short_name: '<no value>' },
                    { id: 'e4', short_name: 'element 4' }
                ]
            };
            editor.Data.arguments([
                { value: 'xx', argument_type: 'field' },
                { value: 'e3', argument_type: 'value' },
                { value: '', argument_type: 'value' },
                { value: 'ex', argument_type: 'value' }
            ]);
            var result = editor.NormalizeFieldDomainData(data, editor.Data);

            // assert
            expect(result.length).toEqual(7);
            expect(result[0].__id).toEqual('ex');
            expect(result[0].index).toEqual(0);
            expect(result[1].__id).toEqual(null);
            expect(result[1].index).toEqual(1);
            expect(result[2].__id).toEqual('~NotInSet');
            expect(result[2].index).toEqual(2);
            expect(result[3].__id).toEqual('e1');
            expect(result[3].index).toEqual(3);
            expect(result[4].__id).toEqual('e2');
            expect(result[4].index).toEqual(4);
            expect(result[5].__id).toEqual('e3');
            expect(result[5].index).toEqual(5);
            expect(result[6].__id).toEqual('e4');
            expect(result[6].index).toEqual(6);
            expect(modelFieldDomainHandler.GetDomainElementIconInfo).toHaveBeenCalledTimes(7);
        });
    });

    describe(".GetFieldDomainData", function () {
        it("should get data", function () {
            var result = editor.GetFieldDomainData();

            // assert
            expect(result.length).toEqual(0);
        });
    });

    describe(".GetFieldDomainDataSource", function () {
        it("should get data", function () {
            var result = editor.GetFieldDomainDataSource();

            // assert
            expect(result instanceof kendo.data.DataSource).toEqual(true);
            expect(result.options.schema.model.id).toEqual('index');
            expect(result.options.schema.model.fields.index.type).toEqual('number');
        });
    });

    describe(".GetFieldDomainImagePath", function () {
        it("should get path", function () {
            var result = editor.GetFieldDomainImagePath();

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".GetElementName", function () {
        var tests = [
            {
                format: '',
                expected: 'short (long)'
            },
            {
                format: 'smart',
                expected: 'short (long)'
            },
            {
                format: 'shn',
                expected: 'short'
            },
            {
                format: 'ln',
                expected: 'long'
            },
            {
                format: 'shnln',
                expected: 'short (long)'
            }
        ];
        $.each(tests, function (index, test) {
            it("should get name (format=" + test.format + ")", function () {
                var data = {
                    id: 'id',
                    short_name: 'short',
                    long_name: 'long'
                };
                var result = editor.GetElementName(data, test.format);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetElementById", function () {
        it("should get element", function () {
            spyOn(editor, 'GetFieldDomainData').and.returnValue([{ id: 'id1' }]);
            var result = editor.GetElementById('id1');

            // assert
            expect(result).not.toEqual(null);
        });
        it("should not get element", function () {
            spyOn(editor, 'GetFieldDomainData').and.returnValue([{ id: 'id1' }]);
            var result = editor.GetElementById('id2');

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".GetElementByIndex", function () {
        beforeEach(function () {
            spyOn(editor, 'GetFieldDomainData').and.returnValue([{}]);
        });
        it("should get element", function () {
            var result = editor.GetElementByIndex(0);

            // assert
            expect(result).toBeTruthy();
        });
        it("should not get element", function () {
            var result = editor.GetElementByIndex(1);

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".GetElementTemplate", function () {
        it("should template", function () {
            var data = {
                template: '#: name #',
                smart_name: '<no value>'
            };
            var result = editor.GetElementTemplate(data);

            // assert
            expect(result).toEqual('&lt;no value&gt;');
        });
    });

    describe(".GetInputArgumentValue", function () {
        it("should get text", function () {
            var input = {
                data: function () {
                    return {
                        text: function () { return 'text'; },
                        dataItem: function () { return null; }
                    };
                }
            };
            var result = editor.GetInputArgumentValue(input);

            // assert
            expect(result).toEqual('text');
        });
        it("should get value", function () {
            var input = {
                data: function () {
                    return {
                        text: function () { return 'text'; },
                        dataItem: function () { return { __id: 'value' }; }
                    };
                }
            };
            var result = editor.GetInputArgumentValue(input);

            // assert
            expect(result).toEqual('value');
        });
    });

    describe(".IsValidArgumentValue", function () {
        beforeEach(function () {
            spyOn(editor, 'GetFieldDomainData').and.returnValue([{ __id: 'id1' }]);
        });
        it("should be true (operator=contains)", function () {
            editor.Data.operator('contains');
            var result = editor.IsValidArgumentValue('element');

            // assert
            expect(result).toBeTruthy();
        });
        it("should be false (operator=contains)", function () {
            editor.Data.operator('contains');
            var result = editor.IsValidArgumentValue('');

            // assert
            expect(result).toBeFalsy();
        });
        it("should be true (operator=equal_to)", function () {
            editor.Data.operator('equal_to');
            var result = editor.IsValidArgumentValue('id1');

            // assert
            expect(result).toBeTruthy();
        });
        it("should be false (operator=equal_to)", function () {
            editor.Data.operator('equal_to');
            var result = editor.IsValidArgumentValue('id2');

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".InitialSingleArgumentUI", function () {
        var handler;
        beforeEach(function () {
            handler = { text: $.noop, value: $.noop };
            spyOn(handler, 'value');
            spyOn($.fn, 'data').and.returnValue(handler);
            spyOn(editor.parent.prototype, 'InitialSingleArgumentUI');
            spyOn(editor, 'CreateSingleInputDropdown');
        });
        it("should initial and set value", function () {
            spyOn(editor, 'GetElementById').and.returnValue({});
            editor.Data.arguments([{ value: 'e1', argument_type: 'value' }]);
            editor.InitialSingleArgumentUI($());

            // assert
            expect(handler.value).toHaveBeenCalled();
        });
        it("should initial but not set value (argument_type=field)", function () {
            spyOn(editor, 'GetElementById').and.returnValue({});
            editor.Data.arguments([{ value: 'e1', argument_type: 'field' }]);
            editor.InitialSingleArgumentUI($());

            // assert
            expect(handler.value).not.toHaveBeenCalled();
        });
        it("should initial but not set value (no data)", function () {
            spyOn(editor, 'GetElementById').and.returnValue(null);
            editor.Data.arguments([{ value: 'e1', argument_type: 'value' }]);
            editor.InitialSingleArgumentUI($());

            // assert
            expect(handler.value).not.toHaveBeenCalled();
        });
    });

    describe(".CreateSingleInputDropdown", function () {
        it("should create UI", function () {
            var handler = { value: $.noop };
            spyOn(handler, 'value');
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(handler);
            spyOn(editor, 'GetInputDropdownOptions');
            editor.CreateSingleInputDropdown($());

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(handler.value).toHaveBeenCalled();
        });
    });

    describe(".GetInputDropdownOptions", function () {
        it("should get options", function () {
            var result = editor.GetInputDropdownOptions($.noop);

            // assert
            expect(result.dataTextField).toEqual('smart_name');
            expect(result.dataValueField).toEqual('index');
            expect(result.filter).toEqual('contains');
            expect(result.virtual.valueMapper).toBeDefined();
            expect(result.template).toBeDefined();
            expect(result.change).toBeDefined();
        });
    });

    describe(".MapInputDropdownValue", function () {
        it("can map value", function () {
            var context = { dataSource: { get: $.noop } };
            var options = { value: '', success: $.noop };
            spyOn(context.dataSource, 'get').and.returnValue({});
            spyOn(options, 'success');
            editor.MapInputDropdownValue.call(context, options);

            // assert
            expect(options.success).toHaveBeenCalled();
        });
        it("cannot map value", function () {
            var context = { dataSource: { get: $.noop } };
            var options = { value: '', success: $.noop };
            spyOn(context.dataSource, 'get').and.returnValue(null);
            spyOn(options, 'success');
            editor.MapInputDropdownValue.call(context, options);

            // assert
            expect(options.success).not.toHaveBeenCalled();
        });
    });

    describe(".InitialMultipleArgumentUI", function () {
        beforeEach(function () {
            spyOn(editor.parent.prototype, 'InitialMultipleArgumentUI');
            spyOn(editor, 'InitialEnumeratedListOperatorUI');
        });
        it("should initial from base", function () {
            editor.Data.operator('contains');
            editor.InitialMultipleArgumentUI($());

            // assert
            expect(editor.parent.prototype.InitialMultipleArgumentUI).toHaveBeenCalled();
            expect(editor.InitialEnumeratedListOperatorUI).not.toHaveBeenCalled();
        });
        it("should initial from another function", function () {
            editor.Data.operator('in_set');
            editor.InitialMultipleArgumentUI($());

            // assert
            expect(editor.parent.prototype.InitialMultipleArgumentUI).not.toHaveBeenCalled();
            expect(editor.InitialEnumeratedListOperatorUI).toHaveBeenCalled();
        });
    });

    describe(".GetInputTypingValue", function () {
        it("should initial from base", function () {
            editor.Data.operator('contains');
            var result = editor.GetInputTypingValue($('<input value="element 1 "/>'));

            // assert
            expect(result).toEqual('element 1');
        });
    });

    describe(".IsNoneEnumeratedListOperator", function () {
        var tests = [
            {
                operator: 'contains',
                expected: true
            },
            {
                operator: 'starts_with',
                expected: true
            },
            {
                operator: 'matches_pattern',
                expected: true
            },
            {
                operator: 'has_value',
                expected: false
            },
            {
                operator: 'equal_to',
                expected: false
            },
            {
                operator: 'another',
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it("should get " + test.expected + " (" + test.operator + ")", function () {
                var result = editor.IsNoneEnumeratedListOperator(test.operator);

                // assert
                expect(result).toEqual(test.expected);
            });
        })
    });

    describe(".InitialEnumeratedListOperatorUI", function () {
        it("should initial UI", function () {
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            spyOn(editor, 'GetEnumeratedMultipleArgumentTemplate');
            spyOn(editor, 'SetElementCssClass');
            spyOn(editor, 'GetEnumeratedListGridOptions');
            spyOn(editor, 'CreateEnumeratedListGrid').and.returnValue({ content: $() });
            spyOn(editor, 'UpdateEnumeratedGridValues');
            editor.InitialEnumeratedListOperatorUI($());

            // assert
            expect(editor.GetEnumeratedMultipleArgumentTemplate).toHaveBeenCalled();
            expect(editor.SetElementCssClass).toHaveBeenCalled();
            expect(editor.GetEnumeratedListGridOptions).toHaveBeenCalled();
            expect(editor.CreateEnumeratedListGrid).toHaveBeenCalled();
            expect(editor.UpdateEnumeratedGridValues).toHaveBeenCalled();
            expect($.fn.off).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
        });
    });

    describe(".GetEnumeratedMultipleArgumentTemplate", function () {
        it("should get template", function () {
            var result = editor.GetEnumeratedMultipleArgumentTemplate();

            // assert
            expect(result).toContain('input-argument-list');
            expect(result).toContain('action-popup');
        });
    });

    describe(".CreateEnumeratedListGrid", function () {
        it("should create UI", function () {
            $.fn.kendoGrid = $.fn.kendoGrid || $.noop;
            spyOn($.fn, 'kendoGrid').and.returnValue({ data: function () { return 'grid-object'; } });
            spyOn($.fn, 'on').and.returnValue($());
            spyOn(WC.HtmlHelper, 'EnableMouseScrolling');
            var result = editor.CreateEnumeratedListGrid($(), {});

            // assert
            expect(result).toEqual('grid-object');
            expect($.fn.kendoGrid).toHaveBeenCalled();
            expect(WC.HtmlHelper.EnableMouseScrolling).toHaveBeenCalled();
        });
    });

    describe(".GetEnumeratedListGridOptions", function () {
        it("should get optiona", function () {
            var result = editor.GetEnumeratedListGridOptions();

            // assert
            expect(result.dataSource).toBeDefined();
            expect(result.height).toBeDefined();
            expect(result.scrollable.virtual).toEqual(true);
            expect(result.sortable).toEqual(true);
            expect(result.selectable).toEqual('row');
            expect(result.columns.length).toEqual(1);
            expect(result.columns[0].field).toEqual('smart_name');
            expect(result.columns[0].headerTemplate).toEqual('');
            expect(result.columns[0].headerAttributes.class).toEqual('alwaysHide');
            expect(result.columns[0].template).toBeDefined();
        });
    });

    describe(".GetEnumeratedElementTemplate", function () {
        it("should get text", function () {
            var data = {
                index: 1,
                __id: 'my-id',
                smart_name: 'my-name',
                template: '#: name #',
                checked: true
            };
            var result = editor.GetEnumeratedElementTemplate(data);

            // assert
            expect(result).toContain('my-name');
            expect(result).toContain('data-index="1"');
            expect(result).toContain('checked');
        });
    });

    describe(".SetEnumeratedGridJumpState", function () {
        var element;
        beforeEach(function () {
            element = $('<div/>');
            element.append('<div class="k-grid grid-filterable active"><div id="Target1"></div></div>');
            element.append('<div class="k-grid grid-filterable"><div id="Target2"></div></div>');
            element.appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it("should set grid state", function () {
            editor.SetEnumeratedGridJumpState({ target: $('#Target2') });

            // assert
            expect($('#Target1').closest('.grid-filterable').hasClass('active')).toEqual(false);
            expect($('#Target2').closest('.grid-filterable').hasClass('active')).toEqual(true);
        });
    });

    describe(".EnumeratedGridExecuteJump", function () {
        it("should stop (no grid)", function () {
            var e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
            spyOn($.fn, 'data').and.returnValue(null);
            spyOn(editor, 'IsValidJumpKeyCode');
            spyOn(editor, 'GetJumpIndexes');
            spyOn(editor, 'GetJumpIndex');
            spyOn(editor, 'ScrollToJumpIndex');
            editor.EnumeratedGridExecuteJump(e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect(editor.IsValidJumpKeyCode).not.toHaveBeenCalled();
            expect(editor.GetJumpIndexes).not.toHaveBeenCalled();
            expect(editor.GetJumpIndex).not.toHaveBeenCalled();
            expect(editor.ScrollToJumpIndex).not.toHaveBeenCalled();
        });
        it("should stop (invalid key)", function () {
            var e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
            spyOn($.fn, 'data').and.returnValue({});
            spyOn(editor, 'IsValidJumpKeyCode').and.returnValue(false);
            spyOn(editor, 'GetJumpIndexes');
            spyOn(editor, 'GetJumpIndex');
            spyOn(editor, 'ScrollToJumpIndex');
            editor.EnumeratedGridExecuteJump(e);

            // assert
            expect(e.preventDefault).toHaveBeenCalled();
            expect(editor.IsValidJumpKeyCode).toHaveBeenCalled();
            expect(editor.GetJumpIndexes).not.toHaveBeenCalled();
            expect(editor.GetJumpIndex).not.toHaveBeenCalled();
            expect(editor.ScrollToJumpIndex).not.toHaveBeenCalled();
        });
        it("should stop (no indexes)", function () {
            var e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
            spyOn($.fn, 'data').and.returnValue({});
            spyOn(editor, 'IsValidJumpKeyCode').and.returnValue(true);
            spyOn(editor, 'GetJumpIndexes').and.returnValue([]);
            spyOn(editor, 'GetJumpIndex');
            spyOn(editor, 'ScrollToJumpIndex');
            editor.EnumeratedGridExecuteJump(e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect(editor.IsValidJumpKeyCode).toHaveBeenCalled();
            expect(editor.GetJumpIndexes).toHaveBeenCalled();
            expect(editor.GetJumpIndex).not.toHaveBeenCalled();
            expect(editor.ScrollToJumpIndex).not.toHaveBeenCalled();
        });
        it("should execute jump", function () {
            var e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
            spyOn($.fn, 'data').and.returnValue({});
            spyOn(editor, 'IsValidJumpKeyCode').and.returnValue(true);
            spyOn(editor, 'GetJumpIndexes').and.returnValue([0,1,2]);
            spyOn(editor, 'GetJumpIndex').and.returnValue([0]);
            spyOn(editor, 'ScrollToJumpIndex');
            editor.EnumeratedGridExecuteJump(e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect(editor.IsValidJumpKeyCode).toHaveBeenCalled();
            expect(editor.GetJumpIndexes).toHaveBeenCalled();
            expect(editor.GetJumpIndex).toHaveBeenCalled();
            expect(editor.ScrollToJumpIndex).toHaveBeenCalled();
        });
    });

    describe(".IsValidJumpKeyCode", function () {
        it("should invalid (key=ENTER)", function () {
            var grid = { select: function () { return $(); } };
            var keyCode = 13;
            spyOn($.fn, 'trigger');
            var result = editor.IsValidJumpKeyCode(grid, keyCode);

            // assert
            expect($.fn.trigger).toHaveBeenCalled();
            expect(result).toEqual(false);
        });
        it("should invalid (key=SPACEBAR)", function () {
            var grid = { select: function () { return $(); } };
            var keyCode = 32;
            spyOn($.fn, 'trigger');
            var result = editor.IsValidJumpKeyCode(grid, keyCode);

            // assert
            expect($.fn.trigger).toHaveBeenCalled();
            expect(result).toEqual(false);
        });
        it("should invalid (key=BACKSPACE)", function () {
            var grid = { select: function () { return $(); } };
            var keyCode = 8;
            spyOn($.fn, 'trigger');
            var result = editor.IsValidJumpKeyCode(grid, keyCode);

            // assert
            expect($.fn.trigger).not.toHaveBeenCalled();
            expect(result).toEqual(false);
        });
        it("should valid (key=any)", function () {
            var grid = { select: function () { return $(); } };
            var keyCode = 0;
            spyOn($.fn, 'trigger');
            var result = editor.IsValidJumpKeyCode(grid, keyCode);

            // assert
            expect($.fn.trigger).not.toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });

    describe(".GetJumpCharacter", function () {
        var tests = [
            { keyCode: 96, expected: '0' },
            { keyCode: 48, expected: '0' },
            { keyCode: 100, expected: '4' },
            { keyCode: 52, expected: '4' },
            { keyCode: 105, expected: '9' },
            { keyCode: 57, expected: '9' },
            { keyCode: 90, expected: 'Z' },
            { keyCode: 110, expected: 'n' }
        ];
        $.each(tests, function (index, test) {
            it("should get character (keyCode=" + test.keyCode + ")", function () {
                var result = editor.GetJumpCharacter(test.keyCode);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetJumpIndexes", function () {
        it("should get empty list (filter=)", function () {
            var grid = { wrapper: $() };
            spyOn(editor, 'GetJumpCharacter').and.returnValue('');
            spyOn(editor, 'EnumeratedGridJumpIndexes').and.returnValue([0, 1, 2]);
            spyOn($.fn, 'data').and.returnValue(editor);
            var result = editor.GetJumpIndexes(grid, 0);

            // assert
            expect(result).toEqual([]);
        });
        it("should get list (filter=any)", function () {
            var grid = { wrapper: $() };
            spyOn(editor, 'GetJumpCharacter').and.returnValue('any');
            spyOn(editor, 'EnumeratedGridJumpIndexes').and.returnValue([0, 1, 2]);
            spyOn($.fn, 'data').and.returnValue(editor);
            var result = editor.GetJumpIndexes(grid, 0);

            // assert
            expect(result).toEqual([0, 1, 2]);
        });
    });

    describe(".GetJumpIndex", function () {
        it("should get index (no select)", function () {
            var grid = { select: function () { return $(); } };
            var jumpIndexes = [1, 2, 5, 7];
            spyOn($.fn, 'data').and.returnValue(1);
            var result = editor.GetJumpIndex(grid, jumpIndexes);

            // assert
            expect(result).toEqual(1);
        });
        it("should get index (with select)", function () {
            var grid = { select: function () { return $('<div/>'); } };
            var jumpIndexes = [1, 2, 5, 7];
            spyOn($.fn, 'data').and.returnValue(2);
            var result = editor.GetJumpIndex(grid, jumpIndexes);

            // assert
            expect(result).toEqual(5);
        });
    });

    describe(".ScrollToJumpIndex", function () {
        var grid;
        beforeEach(function () {
            grid = {
                content: {
                    // 5 items in a view
                    height: function () { return 132; }
                },
                virtualScrollable: {
                    itemHeight: 26,
                    verticalScrollbar: {
                        scrollTop: $.noop
                    }
                }
            };
            spyOn(grid.virtualScrollable.verticalScrollbar, 'scrollTop').and.returnValue(0);
            spyOn(editor, 'EnsureScrollToJumpIndex');
        });
        it("should not scroll to row (at the same view)", function () {
            editor.ScrollToJumpIndex(grid, 1);

            // assert
            expect(grid.virtualScrollable.verticalScrollbar.scrollTop).toHaveBeenCalledTimes(1);
            expect(editor.EnsureScrollToJumpIndex).toHaveBeenCalled();
        });
        it("should scroll to row (in another page)", function () {
            editor.ScrollToJumpIndex(grid, 8);

            // assert
            expect(grid.virtualScrollable.verticalScrollbar.scrollTop).toHaveBeenCalledTimes(2);
            expect(editor.EnsureScrollToJumpIndex).toHaveBeenCalled();
        });
    });

    describe(".EnsureScrollToJumpIndex", function () {
        it("should seelct to the row", function (done) {
            var grid = {
                select: $.noop,
                content: $('<tr/>')
            };
            spyOn(grid, 'select');
            editor.EnsureScrollToJumpIndex(grid, 1);

            // assert
            expect(grid.select).not.toHaveBeenCalled();

            // found the row
            grid.content.html('<td data-index="1"/>');
            setTimeout(function () {
                expect(grid.select).toHaveBeenCalled();
                done();
            }, 5);
        });
    });

    describe(".EnumeratedGridJumpIndexes", function () {
        it("should get array", function () {
            var result = editor.EnumeratedGridJumpIndexes('a');

            // assert
            expect(result instanceof Array).toEqual(true);
        });
    });

    describe(".UpdateEnumeratedGridValues", function () {
        it("should update data source", function () {
            var grid = {
                refresh: $.noop,
                dataSource: {
                    data: ko.observableArray([
                        { __id: 'id1', checked: false },
                        { __id: 'id2', checked: false },
                        { __id: 'id3', checked: false },
                        { __id: 'id4', checked: false },
                        { __id: 'id5', checked: false }
                    ])
                }
            };
            var args = [
                { value: 'id1' },
                { value: 'id3' }
            ];
            spyOn(grid, 'refresh');
            editor.UpdateEnumeratedGridValues(grid, args);

            // assert
            expect(grid.dataSource.data()[0].checked).toEqual(true);
            expect(grid.dataSource.data()[1].checked).toEqual(false);
            expect(grid.dataSource.data()[2].checked).toEqual(true);
            expect(grid.dataSource.data()[3].checked).toEqual(false);
            expect(grid.dataSource.data()[4].checked).toEqual(false);
            expect(grid.refresh).toHaveBeenCalled();
        });
    });

    describe(".UpdateEnumeratedArgumentValues", function () {
        it("should update data source", function () {
            editor.$Grid = {
                dataSource: {
                    data: ko.observableArray([
                        { __id: 'id1', checked: true },
                        { __id: 'id2', checked: false },
                        { __id: 'id3', checked: true },
                        { __id: 'id4', checked: false },
                        { __id: 'id5', checked: false }
                    ])
                }
            };
            editor.UpdateEnumeratedArgumentValues();

            // assert
            expect(editor.Data.arguments().length).toEqual(2);
            expect(editor.Data.arguments()[0].value).toEqual('id1');
            expect(editor.Data.arguments()[1].value).toEqual('id3');
        });
    });

    describe(".SetEnumeratedValue", function () {
        it("should set value and update data source", function () {
            editor.$Grid = {
                dataSource: {
                    get: ko.observable({ checked: false })
                }
            };
            var e = {
                currentTarget: $('<input>').get(0)
            };
            spyOn(editor, 'UpdateEnumeratedArgumentValues');
            editor.SetEnumeratedValue(e);

            // assert
            expect(editor.UpdateEnumeratedArgumentValues).toHaveBeenCalled();
        });
    });

    describe(".ShowEnumeratedListPopup", function () {
        it("should show popup", function () {
            spyOn(editor, 'GetEnumeratedListPopupOptions');
            spyOn(popup, 'Show');
            editor.ShowEnumeratedListPopup();

            // assert
            expect(editor.GetEnumeratedListPopupOptions).toHaveBeenCalled();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".GetEnumeratedListPopupOptions", function () {
        it("should get options", function () {
            spyOn(WC.WidgetFilterHelper, 'GetFilterText').and.returnValue('title');
            var result = editor.GetEnumeratedListPopupOptions();

            // assert
            expect(result.element).toEqual('#PopupEnumurated');
            expect(result.title).toEqual('title');
            expect(result.className).toEqual('popup-enumerated');
            expect(result.minWidth).toBeDefined();
            expect(result.width).toBeDefined();
            expect(result.height).toBeDefined();
            expect(result.html).toBeDefined();
            expect(result.buttons).toBeDefined();
            expect(result.open).toBeDefined();
            expect(result.close).toBeDefined();
            expect(result.resize).toBeDefined();
        });
    });

    describe(".GetEnumeratedListPopupTemplate", function () {
        it("should get template", function () {
            var result = editor.GetEnumeratedListPopupTemplate();

            // assert
            expect(result).toContain('input-search');
            expect(result).toContain('input-format');
            expect(result).toContain('input-argument-list');
            expect(result).toContain('action-select-all');
            expect(result).toContain('action-clear-all');
            expect(result).toContain('action-invert');
        });
    });

    describe(".EnumeratedListPopupCallback", function () {
        it("should create UI", function () {
            spyOn(editor ,'CreateEnumeratedDropdownFormat');
            spyOn(editor ,'GetEnumeratedListGridPopupOptions');
            spyOn(editor, 'CreateEnumeratedListGrid').and.returnValue({ content: $() });
            spyOn(editor ,'UpdateEnumeratedGridValues');
            spyOn($.fn, 'off').and.returnValue($());
            var e = { sender: { element: $() } };
            editor.EnumeratedListPopupCallback(e);

            // assert
            expect(editor.CreateEnumeratedDropdownFormat).toHaveBeenCalled();
            expect(editor.CreateEnumeratedListGrid).toHaveBeenCalled();
            expect(editor.UpdateEnumeratedGridValues).toHaveBeenCalled();
        });
    });

    describe(".EnumeratedListPopupResize", function () {
        it("should adjust popup", function () {
            spyOn(kendo ,'resize');
            var e = { sender: { element: $() } };
            editor.EnumeratedListPopupResize(e);

            // assert
            expect(kendo.resize).toHaveBeenCalled();
        });
    });

    describe(".GetEnumeratedListGridPopupOptions", function () {
        it("should get options", function () {
            var result = editor.GetEnumeratedListGridPopupOptions();

            // assert
            expect(result.selectable).toEqual(false);
            expect(result.columns.length).toEqual(1);
            expect(result.columns[0].headerTemplate).toBeDefined();
            expect(result.columns[0].headerAttributes.class).toEqual('gridHeaderContainer actionable');
            expect(result.columns[0].template).toBeDefined();
        });
    });

    describe(".GetEnumeratedElementPopupTemplate", function () {
        it("should get text", function () {
            var data = {
                index: 1,
                __id: 'my-id',
                template: '#: name #',
                checked: true
            };
            editor.EnumeratedPopupFormat = 'shn';
            var result = editor.GetEnumeratedElementPopupTemplate(data);

            // assert
            expect(result).toContain('my-id');
            expect(result).toContain('data-index="1"');
            expect(result).toContain('checked');
        });
    });

    describe(".CreateEnumeratedDropdownFormat", function () {
        it("should create UI and set format", function () {
            spyOn(WC.FormatHelper, 'GetUserDefaultFormatSettings').and.returnValue({ format: 'my-format' });
            spyOn(WC.HtmlHelper, 'DropdownList');
            editor.EnumeratedPopupFormat = '';
            editor.CreateEnumeratedDropdownFormat($());

            // assert
            expect(editor.EnumeratedPopupFormat).toContain('my-format');
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
        });
    });

    describe(".EnumeratedDropdownFormatChange", function () {
        it("should update format and refresh grid", function () {
            spyOn(editor, 'SearchEnumeratedListPopup');
            var input = $('<input value="value"/>');
            var e = { sender: { value: function () { return 'my-new-format'; } } };
            editor.EnumeratedDropdownFormatChange(input, e);

            // assert
            expect(editor.EnumeratedPopupFormat).toContain('my-new-format');
            expect(editor.SearchEnumeratedListPopup).toHaveBeenCalled();
        });
    });

    describe(".SearchEnumeratedListPopup", function () {
        it("should update format and refresh grid", function () {
            editor.$GridPopup = { dataSource: { filter: $.noop } };
            spyOn(editor.$GridPopup.dataSource, 'filter');
            spyOn(editor, 'GetSearchEnumeratedListOptions');
            var input = $('<input value="value"/>');
            editor.SearchEnumeratedListPopup(input);

            // assert
            expect(editor.$GridPopup.dataSource.filter).toHaveBeenCalled();
            expect(editor.GetSearchEnumeratedListOptions).toHaveBeenCalled();
        });
    });

    describe(".GetSearchEnumeratedListOptions", function () {
        it("should get search options and can filter", function () {
            var result = editor.GetSearchEnumeratedListOptions(' Men ');

            // assert
            expect(result.value).toEqual('Men');
            expect(typeof result.operator).toEqual('function');

            // assert filter #1
            var result2 = result.operator({ id: 'ElemEnt1' }, 'Men');
            expect(result2).toEqual(true);

            // assert filter #2
            var result3 = result.operator({ id: '<no value>' }, 'Men');
            expect(result3).toEqual(false);
        });
    });

    describe(".SetEnumeratedPopupValue", function () {
        it("should update data source and refresh view", function () {
            var e = {
                currentTarget: { checked: true }
            };
            editor.$GridPopup = {
                dataSource: {
                    get: ko.observable({ checked: false })
                }
            };
            editor.$Grid = {
                refresh: $.noop
            };
            spyOn(editor, 'SetEnumeratedValue');
            spyOn(editor.$Grid, 'refresh');
            editor.SetEnumeratedPopupValue(e);

            // assert
            expect(editor.SetEnumeratedValue).toHaveBeenCalled();
            expect(editor.$Grid.refresh).toHaveBeenCalled();
        });
    });

    describe(".BatchSetEnumeratedPopupValues", function () {
        it("should update button state, UI and model", function () {
            var e = {};
            editor.$GridPopup = {
                refresh: $.noop
            };
            editor.$Grid = {
                refresh: $.noop
            };
            spyOn(editor.$GridPopup, 'refresh');
            spyOn(editor.$Grid, 'refresh');
            spyOn(editor, 'BatchSetEnumeratedPopupDatasource');
            spyOn(editor, 'UpdateEnumeratedArgumentValues');
            editor.BatchSetEnumeratedPopupValues(null, e);

            // assert
            expect(editor.$GridPopup.refresh).toHaveBeenCalled();
            expect(editor.$Grid.refresh).toHaveBeenCalled();
            expect(editor.BatchSetEnumeratedPopupDatasource).toHaveBeenCalled();
            expect(editor.UpdateEnumeratedArgumentValues).toHaveBeenCalled();
        });
    });

    describe(".BatchSetEnumeratedPopupDatasource", function () {
        beforeEach(function () {
            editor.$GridPopup = {
                dataSource: new kendo.data.DataSource({
                    data: [
                        { checked: true, id: 'id10', index: 0 },
                        { checked: true, id: 'id101', index: 1 },
                        { checked: false, id: 'id1010', index: 2 }
                    ],
                    pageSize: 50
                })
            };
            editor.$GridPopup.dataSource.read();

            editor.$Grid = {
                dataSource: new kendo.data.DataSource({
                    data: [
                        { checked: true, id: 'id10', index: 0 },
                        { checked: true, id: 'id101', index: 1 },
                        { checked: false, id: 'id1010', index: 2 }
                    ],
                    pageSize: 50
                })
            };
            editor.$Grid.dataSource.read();
        });
        it("should select all", function () {
            editor.$GridPopup.dataSource.filter({ field: 'id', value: 'id101', operator: 'startswith' });
            editor.BatchSetEnumeratedPopupDatasource(true);

            // assert
            expect(editor.$GridPopup.dataSource.pageSize()).toEqual(50);
            expect(editor.$GridPopup.dataSource.data()[0].checked).toEqual(true);
            expect(editor.$GridPopup.dataSource.data()[1].checked).toEqual(true);
            expect(editor.$GridPopup.dataSource.data()[2].checked).toEqual(true);
            expect(editor.$Grid.dataSource.pageSize()).toEqual(50);
            expect(editor.$Grid.dataSource.data()[0].checked).toEqual(true);
            expect(editor.$Grid.dataSource.data()[1].checked).toEqual(true);
            expect(editor.$Grid.dataSource.data()[2].checked).toEqual(true);
        });
        it("should clear all filtered elements", function () {
            editor.$GridPopup.dataSource.filter({ field: 'id', value: 'id101', operator: 'startswith' });
            editor.BatchSetEnumeratedPopupDatasource(false);

            // assert
            expect(editor.$GridPopup.dataSource.pageSize()).toEqual(50);
            expect(editor.$GridPopup.dataSource.data()[0].checked).toEqual(true);
            expect(editor.$GridPopup.dataSource.data()[1].checked).toEqual(false);
            expect(editor.$GridPopup.dataSource.data()[2].checked).toEqual(false);
            expect(editor.$Grid.dataSource.pageSize()).toEqual(50);
            expect(editor.$Grid.dataSource.data()[0].checked).toEqual(true);
            expect(editor.$Grid.dataSource.data()[1].checked).toEqual(false);
            expect(editor.$Grid.dataSource.data()[2].checked).toEqual(false);
        });
        it("should invert selection", function () {
            editor.BatchSetEnumeratedPopupDatasource(null);

            // assert
            expect(editor.$GridPopup.dataSource.pageSize()).toEqual(50);
            expect(editor.$GridPopup.dataSource.data()[0].checked).toEqual(false);
            expect(editor.$GridPopup.dataSource.data()[1].checked).toEqual(false);
            expect(editor.$GridPopup.dataSource.data()[2].checked).toEqual(true);
            expect(editor.$Grid.dataSource.pageSize()).toEqual(50);
            expect(editor.$Grid.dataSource.data()[0].checked).toEqual(false);
            expect(editor.$Grid.dataSource.data()[1].checked).toEqual(false);
            expect(editor.$Grid.dataSource.data()[2].checked).toEqual(true);
        });
    });

    describe(".GetEnumeratedPopupFilterInfo", function () {
        beforeEach(function () {
            editor.$GridPopup = {
                dataSource: {
                    filter: $.noop,
                    pageSize: function () { return 50; }
                }
            };
        });
        it("should get filter info (no filter)", function () {
            spyOn(editor.$GridPopup.dataSource, 'filter').and.returnValue(null);
            var result = editor.GetEnumeratedPopupFilterInfo();

            // assert
            expect(result.source).toEqual('data');
            expect(result.pageSize).toEqual(50);
        });
        it("should get filter info (has filter)", function () {
            spyOn(editor.$GridPopup.dataSource, 'filter').and.returnValue({ filters: [{ value: 'id' }] });
            var result = editor.GetEnumeratedPopupFilterInfo();

            // assert
            expect(result.source).toEqual('view');
            expect(result.pageSize).toEqual(50);
        });
    });

    describe(".GetCompareFieldTarget", function () {
        it("should get a compare field target", function () {
            var result = editor.GetCompareFieldTarget();

            // assert
            expect(result).toEqual(enumHandlers.FIELDTYPE.ENUM);
        });
    });
});