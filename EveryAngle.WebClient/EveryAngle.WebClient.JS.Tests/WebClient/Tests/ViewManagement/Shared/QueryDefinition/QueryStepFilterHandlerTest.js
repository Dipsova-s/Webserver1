/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/followupPageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/BaseAdvanceFilterEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterBooleanEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterCurrencyEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterDateEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterDatetimeEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterDoubleEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterEnumeratedEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterIntEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterPercentageEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterPeriodEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterTextEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterTimeEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/FilterEditors/FilterTimespanEditor.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />

describe("QueryStepFilterHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new QueryDefinitionHandler();
    });

    describe(".IsFilter", function () {
        it("should return true when [step_type] equal 'filter'", function () {
            var result = handler.IsFilter({ step_type: 'filter' });

            // assert
            expect(result).toEqual(true);
        });
        it("should return false when [step_type] is not 'filter'", function () {
            var result = handler.IsFilter({ step_type: 'sorting' });

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetFilters", function () {
        it("should return objects [query steps] when there are any objects with [step_types] equal [filter]", function () {
            handler.Data([
                { step_type: 'filter' }
            ]);
            var result = handler.GetFilters();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(1);
        });

        it("should return empty array [query steps] when there is no object with [step_types] equal [filter]", function () {
            handler.Data([
                { step_type: 'followup' }
            ]);
            var result = handler.GetFilters();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(0);
        });
    });
    
    describe(".IsExecutedParameters", function () {
        it("should be false by default", function () {
            var result = handler.IsExecutedParameters;

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetExecutionParameters", function () {
        it("should get execution parameters", function () {
            spyOn(handler, 'GetFilters').and.returnValue([
                new QueryStepViewModel({ step_type: 'filter', is_execution_parameter: true }),
                new QueryStepViewModel({ step_type: 'filter', is_execution_parameter: false }),
                new QueryStepViewModel({ step_type: 'filter', is_execution_parameter: true })
            ]);
            var result = handler.GetExecutionParameters();

            // assert
            expect(result.length).toEqual(2);
        });
    });

    describe(".SetExecutedParameters", function () {
        it("should set executed parameters", function () {
            var parameters = [
                { field: 'a', step_type: 'filter', operator: 'equal_to', is_execution_parameter: true }
            ];
            var data = [
                new QueryStepViewModel({ field: 'a', step_type: 'filter', operator: 'not_equal_to', is_execution_parameter: true }),
                new QueryStepViewModel({ field: 'b', step_type: 'filter', operator: 'not_equal_to', is_execution_parameter: true })
            ];
            spyOn(handler, 'GetExecutionParameters').and.returnValue(data);
            spyOn(handler, 'ForcedUpdateData');
            handler.SetExecutedParameters(parameters);

            // assert
            expect(data[0].operator()).toEqual('equal_to');
            expect(handler.ForcedUpdateData).toHaveBeenCalled();
            expect(handler.IsExecutedParameters).toEqual(true);
        });

        it("should not set executed parameters", function () {
            var parameters = [];
            var data = [
                new QueryStepViewModel({ field: 'a', step_type: 'filter', operator: 'not_equal_to', is_execution_parameter: true })
            ];
            spyOn(handler, 'GetExecutionParameters').and.returnValue(data);
            spyOn(handler, 'ForcedUpdateData');
            handler.SetExecutedParameters(parameters);

            // assert
            expect(handler.ForcedUpdateData).not.toHaveBeenCalled();
            expect(handler.IsExecutedParameters).toEqual(false);
        });
    });

    describe(".GetExecutedParameters", function () {
        it("should get executed parameters", function () {
            spyOn(handler, 'GetExecutionParameters').and.returnValue([
                new QueryStepViewModel({ step_type: 'filter', field: 'field2', is_execution_parameter: true, execution_parameter_id: 'id2' }),
                new QueryStepViewModel({ step_type: 'filter', field: 'field2', is_execution_parameter: true, execution_parameter_id: 'id3' })
            ]);
            var result = handler.GetExecutedParameters();

            // assert
            expect(result.length).toEqual(2);
            expect(result[0].execution_parameter_id).toEqual('id2');
            expect(result[1].execution_parameter_id).toEqual('id3');
        });
    });

    describe(".UseExecutionParameter", function () {
        it("should use execution parameter", function () {
            handler.Data([
                new QueryStepViewModel({ step_type: 'filter', field: 'field', operator: 'has_no_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] }),
                new QueryStepViewModel({ step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '2', arguments: [] })
            ]);
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                { step_type: 'filter', field: 'field', operator: 'has_no_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] },
                { step_type: 'filter', field: 'field', operator: 'has_no_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] }
            ]);
            var result = handler.UseExecutionParameter(handler.Data()[1]);

            // assert
            expect(result).toBeTruthy();
        });
        it("should not use execution parameter (no source step)", function () {
            var queryStep = new QueryStepViewModel({ step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] });
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([]);
            var result = handler.UseExecutionParameter(queryStep);

            // assert
            expect(result).toBeFalsy();
        });
        it("should not use execution parameter (source is not execution parameter)", function () {
            var queryStep = new QueryStepViewModel({ step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] });
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                { step_type: 'filter', field: 'field', operator: 'has_no_value', is_execution_parameter: false, execution_parameter_id: '1', arguments: [] }
            ]);
            var result = handler.UseExecutionParameter(queryStep);

            // assert
            expect(result).toBeFalsy();
        });
        it("should not use execution parameter (raw step = source step)", function () {
            var queryStep = new QueryStepViewModel({ step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] });
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                { step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] }
            ]);
            var result = handler.UseExecutionParameter(queryStep);

            // assert
            expect(result).toBeFalsy();
        });
        it("should not use execution parameter (query step changed)", function () {
            var queryStep = new QueryStepViewModel({ step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] });
            queryStep.operator('has_no_value');
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                { step_type: 'filter', field: 'field', operator: 'has_value', is_execution_parameter: true, execution_parameter_id: '1', arguments: [] }
            ]);
            var result = handler.UseExecutionParameter(queryStep);

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".AdjustFilterArguments", function () {
        it("should adjust an argument", function () {
            var queryStep = {
                step_type: 'filter',
                arguments: [{ value: 2 }, { value: 1 }]
            };
            spyOn(WC.WidgetFilterHelper, 'AdjustFilterArguments').and.returnValue([{ value: 1 }, { value: 2 }]);
            handler.AdjustFilterArguments(queryStep);

            // assert
            expect(WC.WidgetFilterHelper.AdjustFilterArguments).toHaveBeenCalled();
            expect(queryStep.arguments[0].value).toEqual(1);
            expect(queryStep.arguments[1].value).toEqual(2);
        });
        it("should not adjust an argument", function () {
            var queryStep = {
                step_type: 'any'
            };
            spyOn(WC.WidgetFilterHelper, 'AdjustFilterArguments');
            handler.AdjustFilterArguments(queryStep);

            // assert
            expect(WC.WidgetFilterHelper.AdjustFilterArguments).not.toHaveBeenCalled();
        });
    });

    describe(".CanEditFilter", function () {
        var tests = [
            {
                title: 'can edit filter (is_adhoc=true)',
                is_adhoc: true,
                valid_field: false,
                can_change: false,
                can_save: false,
                expected: true
            },
            {
                title: 'can edit filter (valid_field=true, can_change=true, can_save=true)',
                is_adhoc: false,
                valid_field: true,
                can_change: true,
                can_save: true,
                expected: true
            },
            {
                title: 'cannot edit filter (valid_field=false, can_change=true, can_save=true)',
                is_adhoc: false,
                valid_field: false,
                can_change: true,
                can_save: true,
                expected: false
            },
            {
                title: 'cannot edit filter (valid_field=true, can_change=false, can_save=true)',
                is_adhoc: false,
                valid_field: true,
                can_change: false,
                can_save: true,
                expected: false
            },
            {
                title: 'can edit filter (valid_field=true, can_change=true, can_save=false)',
                is_adhoc: false,
                valid_field: true,
                can_change: true,
                can_save: false,
                expected: true
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(test.can_change);
                spyOn(handler.Authorizations, 'CanSave').and.returnValue(test.can_save);
                var queryStep = { is_adhoc: ko.observable(test.is_adhoc), valid_field: test.valid_field };
                var result = handler.CanEditFilter(queryStep);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanRemoveFilter", function () {
        var tests = [
            {
                title: 'can remove filter (is_adhoc=true)',
                is_adhoc: true,
                can_change: false,
                can_save: false,
                expected: true
            },
            {
                title: 'can remove filter (can_change=true, can_save=true)',
                is_adhoc: false,
                can_change: true,
                can_save: true,
                expected: true
            },
            {
                title: 'cannot remove filter (can_change=false, can_save=true)',
                is_adhoc: false,
                can_change: false,
                can_save: true,
                expected: false
            },
            {
                title: 'can remove filter (can_change=true, can_save=false)',
                is_adhoc: false,
                can_change: true,
                can_save: false,
                expected: true
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(test.can_change);
                spyOn(handler.Authorizations, 'CanSave').and.returnValue(test.can_save);
                var queryStep = {
                    is_adhoc: function () { return test.is_adhoc; }
                };
                var result = handler.CanRemoveFilter(queryStep);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".EditFilter", function () {
        beforeEach(function () {
            spyOn(handler, 'CreateFilterEditor');
        });

        it("should create filter editor for saved query step", function () {
            var queryStep = {
                edit_mode: ko.observable(false)
            };
            handler.EditFilter(queryStep);

            // assert
            expect(queryStep.edit_mode()).toEqual(true);
            expect(handler.CreateFilterEditor).toHaveBeenCalled();
        });
    });

    describe(".CreateFilterEditor", function () {
        beforeEach(function () {
            spyOn(handler, 'GetFilterEditorHandler').and.returnValue($.noop);
            spyOn(handler, 'CloseAllFilterEditors');
            spyOn(handler, 'ScrollToItem');
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({});
        });

        it("should not create filter editor (edit_mode = false)", function () {
            spyOn(handler, 'IsFilter').and.returnValue(true);
            spyOn(handler, 'GetFilterEditor');
            var queryStep = {
                edit_mode: ko.observable(false)
            };
            handler.CreateFilterEditor(queryStep);

            // assert
            expect(handler.GetFilterEditor).not.toHaveBeenCalled();
        });

        it("should not create filter editor (ReadOnly = true)", function () {
            spyOn(handler, 'IsFilter').and.returnValue(true);
            spyOn(handler, 'GetFilterEditor');
            handler.ReadOnly(true);
            var queryStep = {
                edit_mode: ko.observable(true)
            };
            handler.CreateFilterEditor(queryStep);

            // assert
            expect(handler.GetFilterEditor).not.toHaveBeenCalled();
        });

        it("should not create filter editor (IsFilter = false)", function () {
            spyOn(handler, 'IsFilter').and.returnValue(false);
            spyOn(handler, 'GetFilterEditor');
            handler.ReadOnly(false);
            var queryStep = {
                edit_mode: ko.observable(true)
            };
            handler.CreateFilterEditor(queryStep);

            // assert
            expect(handler.GetFilterEditor).not.toHaveBeenCalled();
        });

        it("should not create filter editor (created)", function () {
            spyOn(handler, 'IsFilter').and.returnValue(true);
            spyOn(handler, 'GetFilterEditor').and.returnValue({});
            handler.ReadOnly(false);
            var queryStep = {
                edit_mode: ko.observable(true)
            };
            handler.CreateFilterEditor(queryStep);

            // assert
            expect(handler.GetFilterEditor).toHaveBeenCalled();
            expect(handler.GetFilterEditorHandler).not.toHaveBeenCalled();
        });

        it("should create filter editor", function () {
            spyOn(handler, 'IsFilter').and.returnValue(true);
            spyOn(handler, 'GetFilterEditor').and.returnValue(null);
            handler.ReadOnly(false);
            var queryStep = {
                edit_mode: ko.observable(true)
            };
            handler.CreateFilterEditor(queryStep);

            // assert
            expect(handler.GetFilterEditor).toHaveBeenCalled();
            expect(handler.GetFilterEditorHandler).toHaveBeenCalled();
        });
    });
    
    describe(".GetFilterEditorHandler", function () {
        var tests = [
            {
                fieldtype: 'boolean',
                expected: 'FilterBooleanEditor'
            },
            {
                fieldtype: 'currency',
                expected: 'FilterCurrencyEditor'
            },
            {
                fieldtype: 'date',
                expected: 'FilterDateEditor'
            },
            {
                fieldtype: 'datetime',
                expected: 'FilterDatetimeEditor'
            },
            {
                fieldtype: 'double',
                expected: 'FilterDoubleEditor'
            },
            {
                fieldtype: 'enumerated',
                expected: 'FilterEnumeratedEditor'
            },
            {
                fieldtype: 'int',
                expected: 'FilterIntEditor'
            },
            {
                fieldtype: 'percentage',
                expected: 'FilterPercentageEditor'
            },
            {
                fieldtype: 'period',
                expected: 'FilterPeriodEditor'
            },
            {
                fieldtype: 'text',
                expected: 'FilterTextEditor'
            },
            {
                fieldtype: 'time',
                expected: 'FilterTimeEditor'
            },
            {
                fieldtype: 'timespan',
                expected: 'FilterTimespanEditor'
            },
            {
                fieldtype: 'xxx',
                expected: 'BaseFilterEditor'
            }
        ];
        $.each(tests, function (index, test) {
            it("should get handler (fieldtype = " + test.fieldtype + ")", function () {
                var result = handler.GetFilterEditorHandler(test.fieldtype);

                // assert
                expect(result.name).toEqual(test.expected);
            });
        });
    });

    describe(".GetFilterEditor", function () {
        it("should get editor", function () {
            var container = $('<div />').html(
                '<div class="item" data-index="0"><div class="filter-editor"></div></div>' +
                '<div class="item" data-index="1"><div class="filter-editor"></div></div>');
            container.find('.filter-editor:eq(0)').data('Editor', 'editor1');
            container.find('.filter-editor:eq(1)').data('Editor', 'editor2');
            spyOn(handler, 'GetContainer').and.returnValue(container);
            var query1 = { field: 'field1' };
            var query2 = { field: 'field2' };
            handler.Data([query1, query2]);
            var result = handler.GetFilterEditor(query2);

            // assert
            expect(result).toEqual('editor2');
        });
    });

    describe(".CloseAllFilterEditors", function () {
        it("should close all filter editors", function () {
            var filters = [
                { edit_mode: ko.observable(false) },
                { edit_mode: ko.observable(true) }
            ];
            spyOn(handler, 'GetFilters').and.returnValue(filters);
            handler.CloseAllFilterEditors();

            // assert
            expect(filters[0].edit_mode()).toEqual(false);
            expect(filters[1].edit_mode()).toEqual(false);
        });
    });

    describe(".DestroyFilterEditor", function () {
        var editor;
        beforeEach(function () {
            editor = { Destroy: $.noop };
            spyOn(editor, 'Destroy');
        });
        it("should not destroy UI", function () {
            spyOn(handler, 'GetFilterEditor').and.returnValue(null);
            handler.DestroyFilterEditor({});

            // assert
            expect(editor.Destroy).not.toHaveBeenCalled();
        });
        it("should destroy UI", function () {
            spyOn(handler, 'GetFilterEditor').and.returnValue(editor);
            handler.DestroyFilterEditor({});

            // assert
            expect(editor.Destroy).toHaveBeenCalled();
        });
    });

    describe(".DestroyAllFilterEditors", function () {
        beforeEach(function () {
            spyOn(handler, 'DestroyFilterEditor');
        });
        it("should detroy all UI", function () {
            handler.Data([{}, {}]);
            handler.DestroyAllFilterEditors();

            // assert
            expect(handler.DestroyFilterEditor).toHaveBeenCalledTimes(2);
        });
    });

    describe(".RemoveFilter", function () {
        beforeEach(function () {
            spyOn(handler, 'DestroyFilterEditor');
        });
        it("should remove filter", function () {
            handler.Data([{ field: 'field1' }, { field: 'field2', is_applied: true }]);
            handler.RemoveFilter(handler.Data()[0]);

            // assert
            expect(handler.DestroyFilterEditor).toHaveBeenCalled();
            expect(handler.Data().length).toEqual(1);
            expect(handler.Data()[0].field).toEqual('field2');
        });
    });

    describe(".InsertFilter", function () {
        beforeEach(function () {
            spyOn(modelFieldsHandler, 'SetFields');
            spyOn(modelFieldsHandler, 'LoadFieldsMetadata').and.returnValue($.when());
            spyOn(handler, 'CreateFilterEditor');
        });
        it("can insert filter from model field", function () {
            handler.Data([{ field: 'field1' }, { field: 'field3' }]);
            handler.InsertFilter({ id: 'field2', fieldtype: 'text' }, 1);

            // assert
            expect(modelFieldsHandler.SetFields).toHaveBeenCalled();
            expect(modelFieldsHandler.LoadFieldsMetadata).toHaveBeenCalled();
            expect(handler.CreateFilterEditor).toHaveBeenCalled();
            expect(handler.Data().length).toEqual(3);
            expect(handler.Data()[1].field).toEqual('field2');
            expect(handler.Data()[1].step_type).toEqual('filter');
            expect(handler.Data()[1].is_execution_parameter()).toEqual(false);
            expect(handler.Data()[1].is_adhoc()).toEqual(true);
            expect(handler.Data()[1].edit_mode()).toEqual(true);
        });
    });

    describe(".AddFilter", function () {
        beforeEach(function () {
            spyOn(modelFieldsHandler, 'SetFields');
            spyOn(modelFieldsHandler, 'LoadFieldsMetadata').and.returnValue($.when());
            spyOn(handler, 'CreateFilterEditor');
        });
        it("can add filter from model field", function () {
            handler.Data([{ field: 'field1', step_type: 'filter' }, { field: 'field3', step_type: 'other' }]);
            handler.AddFilter({ id: 'field2', fieldtype: 'text' });

            // assert
            expect(modelFieldsHandler.SetFields).toHaveBeenCalled();
            expect(modelFieldsHandler.LoadFieldsMetadata).toHaveBeenCalled();
            expect(handler.CreateFilterEditor).toHaveBeenCalled();
            expect(handler.Data().length).toEqual(3);
            expect(handler.Data()[1].field).toEqual('field2');
            expect(handler.Data()[1].step_type).toEqual('filter');
            expect(handler.Data()[1].is_execution_parameter()).toEqual(false);
            expect(handler.Data()[1].is_adhoc()).toEqual(true);
            expect(handler.Data()[1].edit_mode()).toEqual(true);
        });
    });

    describe(".InsertQueryFilter", function () {
        beforeEach(function () {
            spyOn(handler, 'CreateFilterEditor');
            spyOn(handler, 'ExpandPanel');
            spyOn(handler, 'ScrollToItem');
            spyOn(handler, 'TriggerUpdateBlockUI');
        });
        it("can insert filter", function () {
            handler.Data([{ field: 'field1' }, { field: 'field3' }]);
            handler.InsertQueryFilter({ field: 'field2', step_type: 'filter' }, 1);

            // assert
            expect(handler.CreateFilterEditor).toHaveBeenCalled();
            expect(handler.ExpandPanel).toHaveBeenCalled();
            expect(handler.ScrollToItem).toHaveBeenCalled();
            expect(handler.TriggerUpdateBlockUI).toHaveBeenCalled();
            expect(handler.Data().length).toEqual(3);
            expect(handler.Data()[1].field).toEqual('field2');
            expect(handler.Data()[1].step_type).toEqual('filter');
        });
    });

    describe(".AddQueryFilter", function () {
        beforeEach(function () {
            spyOn(handler, 'CreateFilterEditor');
        });
        it("can add filter", function () {
            handler.Data([{ field: 'field1', step_type: 'filter' }, { field: 'field3', step_type: 'other' }]);
            handler.AddQueryFilter({ field: 'field2', step_type: 'filter' }, 1);

            // assert
            expect(handler.CreateFilterEditor).toHaveBeenCalled();
            expect(handler.Data().length).toEqual(3);
            expect(handler.Data()[1].field).toEqual('field2');
            expect(handler.Data()[1].step_type).toEqual('filter');
        });
    });

    describe(".ShowInfoFilterPopup", function () {
        beforeEach(function () {
            spyOn(helpTextHandler, 'ShowHelpTextPopup');
        });
        it("should show popup", function () {
            handler.ShowInfoFilterPopup({ field: 'field1', step_type: 'filter' }, 1);

            // assert
            expect(helpTextHandler.ShowHelpTextPopup).toHaveBeenCalled();
        });
    });

    describe(".ShowAddFilterPopup", function () {
        beforeEach(function () {
            spyOn(handler, 'InitialAddFilterOptions');
            spyOn(fieldsChooserHandler, 'ShowPopup');
        });
        it("should not show popup", function () {
            spyOn(handler, 'CanAdd').and.returnValue(false);
            handler.ShowAddFilterPopup();

            // assert
            expect(handler.InitialAddFilterOptions).not.toHaveBeenCalled();
            expect(fieldsChooserHandler.ShowPopup).not.toHaveBeenCalled();
        });
        it("should show popup", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);
            handler.ShowAddFilterPopup();

            // assert
            expect(handler.InitialAddFilterOptions).toHaveBeenCalled();
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".InitialAddFilterOptions", function () {
        var parent;
        beforeEach(function () {
            handler.ModelUri = '/models/1';

            spyOn(handler, 'GetBaseClasses').and.returnValue('this-baseclass');
            spyOn(handler, 'GetData').and.returnValue('this-data');

            parent = {
                GetBaseClasses: function () { return 'parent-baseclass'; },
                GetData: function () { return 'parent-data'; }
            };
        });
        it("should initial if no parent", function () {
            spyOn(handler, 'Parent').and.returnValue(null);
            handler.InitialAddFilterOptions();

            // assert
            expect(fieldsChooserHandler.ModelUri).toEqual('/models/1');
            expect(fieldsChooserHandler.AngleClasses).toEqual('this-baseclass');
            expect(fieldsChooserHandler.AngleSteps).toEqual('this-data');
            expect(fieldsChooserHandler.DisplaySteps).toEqual([]);
        });
        it("should initial if has parent", function () {
            spyOn(handler, 'Parent').and.returnValue(parent);
            handler.InitialAddFilterOptions();

            // assert
            expect(fieldsChooserHandler.ModelUri).toEqual('/models/1');
            expect(fieldsChooserHandler.AngleClasses).toEqual('parent-baseclass');
            expect(fieldsChooserHandler.AngleSteps).toEqual('parent-data');
            expect(fieldsChooserHandler.DisplaySteps).toEqual('this-data');
        });
    });
    
    describe(".GetAddFilterTarget", function () {
        var tests = [
            {
                filter_for: 'Angle',
                expected: 'AngleDetail'
            },
            {
                filter_for: 'Display',
                expected: 'DisplayDetail'
            },
            {
                filter_for: 'Dashboard',
                expected: 'DashboardDetail'
            },
            {
                filter_for: 'Other',
                expected: undefined
            }
        ];
        $.each(tests, function (index, test) {
            it("should get filter target (filter_for = " + test.filter_for + ")", function () {
                handler.FilterFor = test.filter_for;
                var result = handler.GetAddFilterTarget();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });
});