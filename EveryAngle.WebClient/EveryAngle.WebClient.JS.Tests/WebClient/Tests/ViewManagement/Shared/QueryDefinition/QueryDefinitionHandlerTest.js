/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.Overlay.js" />

function spyBeforeRunSetData(handler) {
    spyOn(handler, 'SetQuerySteps');
    spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([{ stepId: 1 }]);
}

describe("QueryDefinitionHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new QueryDefinitionHandler();
        handler.ForcedSetData = true;
    });

    describe(".GetSourceData", function () {
        it("should get source definition", function () {
            var result = handler.GetSourceData();

            // assert
            expect(result).toEqual([]);
        });
    });

    describe(".SetData", function () {
        beforeEach(function () {
            spyBeforeRunSetData(handler);
        });
        var tests = [
            {
                title: 'should set data (input_model_uri=/models/2, model_uri=/models/1, forced=true)',
                input_model_uri: '/models/2',
                model_uri: '/models/1',
                forced: true,
                expected: {
                    model_uri: '/models/2',
                    called_times: 1
                }
            },
            {
                title: 'should not set data (input_model_uri=/models/2, model_uri=/models/1, forced=false)',
                input_model_uri: '/models/2',
                model_uri: '/models/1',
                forced: false,
                expected: {
                    model_uri: '/models/1',
                    called_times: 0
                }
            },
            {
                title: 'should set data (input_model_uri=/models/2, model_uri=null, forced=true)',
                input_model_uri: '/models/2',
                model_uri: null,
                forced: true,
                expected: {
                    model_uri: '/models/2',
                    called_times: 1
                }
            },
            {
                title: 'should set data (input_model_uri=/models/2, model_uri=null, forced=false)',
                input_model_uri: '/models/2',
                model_uri: null,
                forced: false,
                expected: {
                    model_uri: '/models/2',
                    called_times: 1
                }
            },
            {
                title: 'should not set data (input_model_uri=null, model_uri=/models/1, forced=true)',
                input_model_uri: null,
                model_uri: '/models/1',
                forced: true,
                expected: {
                    model_uri: '/models/1',
                    called_times: 0
                }
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                handler.ModelUri = test.model_uri;
                handler.ForcedSetData = test.forced;
                handler.SetData([], null, test.input_model_uri);

                expect(handler.ModelUri).toEqual(test.expected.model_uri);
                expect(handler.SetQuerySteps).toHaveBeenCalledTimes(test.expected.called_times);
            });
        });
    });

    describe(".ForcedUpdateData", function () {
        it("should force to update data", function () {
            spyOn(handler, "SetData");
            handler.ForcedUpdateData();

            // assert
            expect(handler.SetData).toHaveBeenCalled();
        });
    });

    describe(".GetBaseClassBlock", function () {
        it("should return definition when there is a definition with [base classes]", function () {
            spyBeforeRunSetData(handler);
            handler.SetData([{ queryblock_type: 'base_classes' }], null, '/models/1');
            var baseClassBlock = handler.GetBaseClassBlock();
            expect(baseClassBlock).not.toBeNull();
            expect(baseClassBlock.queryblock_type).toEqual('base_classes');
        });

        it("should return null when cannot found definition with [base classes]", function () {
            var baseClassBlock = handler.GetBaseClassBlock();
            expect(baseClassBlock).toBeNull();
        });
    });

    describe(".GetBaseClasses", function () {
        it("should return [base classes] when found BaseClassBlock", function () {
            spyOn(handler, "GetBaseClassBlock").and.returnValue({ base_classes: [{}, {}] });
            var baseClasses = handler.GetBaseClasses();
            expect(baseClasses.length).toEqual(2);
        });

        it("should return empty [base classes] when cannot found BaseClassBlock", function () {
            spyOn(handler, "GetBaseClassBlock").and.returnValue(null);
            var baseClasses = handler.GetBaseClasses();
            expect(baseClasses.length).toEqual(0);
        });
    });

    describe(".GetQueryStepsFromQueryDefinition", function () {
        it("should return first [query steps] found in definition when there are any definitions with [query steps]", function () {
            var definition = [{
                queryblock_type: 'query_steps',
                query_steps: [{ id: 1 }, { id: 2 }]
            }, {
                queryblock_type: 'query_steps',
                query_steps: [{ id: 3 }, { id: 4 }]
            }];

            var querySteps = handler.GetQueryStepsFromQueryDefinition(definition);
            expect(querySteps.length).toEqual(2);
            expect(querySteps[0].id).toEqual(1);
            expect(querySteps[1].id).toEqual(2);
        });

        it("should return empty [query steps] when there is no definition with query block type equal [query steps]", function () {
            var definition = [{
                queryblock_type: 'any_but_query_steps',
                query_steps: [{}, {}]
            }];

            var querySteps = handler.GetQueryStepsFromQueryDefinition(definition);
            expect(querySteps.length).toEqual(0);
        });

        it("should return empty [query steps] when definition is empy", function () {
            var querySteps = handler.GetQueryStepsFromQueryDefinition([]);
            expect(querySteps.length).toEqual(0);
        });
    });

    describe(".SetQuerySteps", function () {
        it("should store [query steps] into Data() order by step_type_index", function () {
            spyOn(handler, 'DestroyAllFilterEditors');

            var querySteps = [{ step_type: 'aggregation' }, { step_type: 'filter' }, { step_type: 'sorting' }];
            handler.SetQuerySteps(querySteps);

            var result = handler.Data();
            expect(result.length).toEqual(3);
            expect(result[0].step_type_index).toEqual(0);
            expect(result[1].step_type_index).toEqual(1);
            expect(result[2].step_type_index).toEqual(2);

            expect(handler.DestroyAllFilterEditors).toHaveBeenCalledTimes(1);
        });
    });

    describe(".RefreshQuerySteps", function () {
        it("should set all [query steps]'s ModelUri and call CreateFilterEditor foreach [query steps] in edit mode", function () {
            spyOn(handler, 'DestroyAllFilterEditors');
            spyOn(handler, 'CreateFilterEditor');
            // init data
            handler.Data([
                { step_type: 'filter', edit_mode: function () { return true; } },
                { step_type: 'sorting', edit_mode: function () { return false; } },
                { step_type: 'aggregation', edit_mode: function () { return true; } }]);

            // update model_uri
            handler.ModelUri = 'model_uri';

            // refresh query steps
            handler.RefreshQuerySteps();

            // assert all [model] in query steps are updated to 'model_uri'
            var result = handler.Data();
            expect(result.length).toEqual(3);
            expect(result[0].model).toEqual('model_uri');
            expect(result[0].step_type_index).toEqual(0);
            expect(result[1].model).toEqual('model_uri');
            expect(result[1].step_type_index).toEqual(1);
            expect(result[2].model).toEqual('model_uri');
            expect(result[2].step_type_index).toEqual(2);

            expect(handler.CreateFilterEditor).toHaveBeenCalledTimes(3);
            expect(handler.DestroyAllFilterEditors).toHaveBeenCalledTimes(1);
        });
    });

    describe(".GetData", function () {
        it("should return data from WC.ModelHelper.RemoveReadOnlyQueryBlock", function () {
            handler.Data([{ step_type_index: 2 }, { step_type_index: 0 }, { step_type_index: 1 }]);

            var result = handler.GetData();
            expect(result.length).toEqual(3);
        });
    });

    describe(".GetRawQueryDefinition", function () {
        it("should return _self.definition", function () {
            spyBeforeRunSetData(handler);
            handler.SetData([
                { queryblock_type: 'base_classes' },
                { queryblock_type: 'base_angle' },
                { queryblock_type: 'base_display' },
                { queryblock_type: 'query_steps', query_steps: [] }
            ], null, '/models/1');

            var result = handler.GetRawQueryDefinition();
            expect(result.length).toEqual(4);
            expect(result[0].queryblock_type).toEqual('base_classes');
            expect(result[1].queryblock_type).toEqual('base_angle');
            expect(result[2].queryblock_type).toEqual('base_display');
            expect(result[3].queryblock_type).toEqual('query_steps');
        });
    });

    describe(".GetQueryDefinition", function () {
        it("should return all definition but [query steps] when Data() is empty", function () {
            spyBeforeRunSetData(handler);
            handler.SetData([
                { queryblock_type: 'base_classes' },
                { queryblock_type: 'base_angle' },
                { queryblock_type: 'query_steps', query_steps: [] },
                { queryblock_type: 'base_display' }
            ], 'property', 'modelUri');

            handler.Data([]);
            var result = handler.GetQueryDefinition();

            expect(result['property'].length).toEqual(3);
            expect(result['property'][0].queryblock_type).toEqual('base_classes');
            expect(result['property'][1].queryblock_type).toEqual('base_angle');
            expect(result['property'][2].queryblock_type).toEqual('base_display');
        });

        it("should return definition with modified [query steps] when Data() is not empty", function () {
            spyBeforeRunSetData(handler);
            handler.SetData([
                { queryblock_type: 'base_classes' },
                { queryblock_type: 'base_angle' },
                { queryblock_type: 'query_steps', query_steps: [] },
                { queryblock_type: 'base_display' }
            ], 'property', 'modelUri');

            handler.Data([{}, {}]);
            spyOn(handler, 'GetData').and.returnValue([{}, {}]);

            var result = handler.GetQueryDefinition();
            expect(result['property']).not.toBeNull();
            expect(result['property'].length).toEqual(4);
            expect(result['property'][0].queryblock_type).toEqual('base_classes');
            expect(result['property'][1].queryblock_type).toEqual('base_angle');
            expect(result['property'][2].queryblock_type).toEqual('base_display');
            expect(result['property'][3].queryblock_type).toEqual('query_steps');
            expect(result['property'][3].query_steps.length).toEqual(2);
        });
    });

    describe(".GetQueryStepsByTypes", function () {

        beforeEach(function () {
            handler.Data([
                { step_type: 'A' },
                { step_type: 'B' },
                { step_type: 'C' }
            ]);
        });

        it("should return objects [query steps] when there are any objects with [step_types] match with step types", function () {
            var stepTypes = ['A', 'C', 'E'];

            var result = handler.GetQueryStepsByTypes(stepTypes);
            expect(result.length).toEqual(2);
            expect(result[0].step_type).toEqual('A');
            expect(result[1].step_type).toEqual('C');
        });

        it("should return empty array when there is no objects with [step_types] match with step types", function () {
            var stepTypes = ['G', 'H', 'I'];

            var result = handler.GetQueryStepsByTypes(stepTypes);
            expect(result).not.toBeNull();
            expect(result.length).toEqual(0);
        });
    });

    describe(".GetFiltersAndJumps", function () {
        it("should return objects [query steps] when there are any objects with [step_types] is [filter] or [followup]", function () {
            handler.Data([
                { step_type: 'filter' },
                { step_type: 'followup' }
            ]);
            var result = handler.GetFiltersAndJumps();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(2);
        });

        it("should return empty array when there is no object with [step_types] is [filter] or [followup]", function () {
            handler.Data([
                { step_type: 'sqlfilter' },
                { step_type: 'aggregation' },
                { step_type: 'expression_aggregation' },
                { step_type: 'sorting' }
            ]);
            var result = handler.GetFiltersAndJumps();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(0);
        });
    });

    describe(".GetAddJumpOrFilterIndex", function () {
        it("should return the index of first [query steps] that is not filter nor jump", function () {
            spyOn(handler, 'IsFilterOrJump').and.returnValue(false);
            handler.Data([{}, {}]);
            var result = handler.GetAddJumpOrFilterIndex();
            expect(result).toEqual(0);
        });

        it("should return count of [query steps] when all [query steps] are filter or jump", function () {
            spyOn(handler, 'IsFilterOrJump').and.returnValue(true);
            handler.Data([{}, {}, {}]);
            var result = handler.GetAddJumpOrFilterIndex();
            expect(result).toEqual(3);
        });

        it("should return 0 when there is no [query steps]", function () {
            handler.Data([]);
            var result = handler.GetAddJumpOrFilterIndex();
            expect(result).toEqual(0);
        });
    });

    describe(".IsFilterOrJump", function () {
        it("should be filter or jump (step_type=filter)", function () {
            var queryStep = { step_type: 'filter' };
            var result = handler.IsFilterOrJump(queryStep);
            expect(result).toEqual(true);
        });
        it("should be filter or jump (step_type=followup)", function () {
            var queryStep = { step_type: 'followup' };
            var result = handler.IsFilterOrJump(queryStep);
            expect(result).toEqual(true);
        });
        it("should not be filter or jump (step_type=other)", function () {
            var queryStep = { step_type: 'other' };
            var result = handler.IsFilterOrJump(queryStep);
            expect(result).toEqual(false);
        });
    });

    describe(".MarkAllAdhocAsApplied", function () {
        it("should set is_applied=true for all adhoc filters/jumps", function () {
            var querySteps = [
                new QueryStepViewModel({ step_type: 'filter', is_adhoc: false }),
                new QueryStepViewModel({ step_type: 'filter', is_adhoc: true }),
                new QueryStepViewModel({ step_type: 'followup', is_adhoc: true }),
                new QueryStepViewModel({ step_type: 'followup', is_adhoc: false })
            ];
            spyOn(handler, 'GetFiltersAndJumps').and.returnValue(querySteps);

            // assert
            handler.MarkAllAdhocAsApplied();
            expect(querySteps[0].is_applied).toBeFalsy();
            expect(querySteps[1].is_applied).toBeTruthy();
            expect(querySteps[2].is_applied).toBeTruthy();
            expect(querySteps[3].is_applied).toBeFalsy();
        });
    });

    describe(".HasWarning", function () {
        it("should return true when InvalidAggregates", function () {
            spyOn(validationHandler, 'GetQueryBlocksValidation').and.returnValue({
                InvalidAggregates: true,
                InvalidSortings: false
            });

            handler.Data([]);
            var result = handler.HasWarning();
            expect(result).toEqual(true);
        });

        it("should return true when InvalidSortings", function () {
            spyOn(validationHandler, 'GetQueryBlocksValidation').and.returnValue({
                InvalidAggregates: false,
                InvalidSortings: true
            });

            handler.Data([]);
            var result = handler.HasWarning();
            expect(result).toEqual(true);
        });

        it("should return true when Data() contains warning message in warning object", function () {
            spyOn(validationHandler, 'GetQueryBlocksValidation').and.returnValue({
                InvalidAggregates: false,
                InvalidSortings: false
            });

            handler.Data([{ warning: function () { return 'warning'; } }]);
            var result = handler.HasWarning();
            expect(result).toEqual(true);
        });

        it("should return false when Data() contains warning object without message", function () {
            spyOn(validationHandler, 'GetQueryBlocksValidation').and.returnValue({
                InvalidAggregates: false,
                InvalidSortings: false
            });

            handler.Data([{ warning: function () { return ''; } }]);
            var result = handler.HasWarning();
            expect(result).toEqual(false);
        });
    });

    describe(".AreEqual", function () {
        it("should not be the same (count raw != count data)", function () {
            // prepare
            var raw = [{}];
            var data = [];
            var result = handler.AreEqual(raw, data);

            // assert
            expect(result).toEqual(false);
        });
        it("should not be the same (is_changed = true)", function () {
            // prepare
            var raw = [{}];
            var data = [{ is_changed: function () { return true; } }];
            var result = handler.AreEqual(raw, data);

            // assert
            expect(result).toEqual(false);
        });
        it("should not be the same (is_changed = false)", function () {
            // prepare
            var raw = [{}];
            var data = [{ is_changed: function () { return false; } }];
            var result = handler.AreEqual(raw, data);

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetCompareData", function () {
        var compareData;
        beforeEach(function () {
            compareData = [
                { step_type: 'filter' },
                { step_type: 'filter' },
                { step_type: 'followup' },
                { step_type: 'sorting' },
                { step_type: 'aggregation' }
            ];
            handler.Data([
                { step_type: 'filter' },
                { step_type: 'followup' },
                { step_type: 'sorting' },
                { step_type: 'aggregation' }
            ]);
        });
        it("should get all data to compare", function () {
            var result = handler.GetCompareData(compareData, true);

            // assert
            expect(result[0].length).toEqual(5);
            expect(result[1].length).toEqual(4);
        });

        it("should get filters & jumps data to compare", function () {
            var result = handler.GetCompareData(compareData, false);

            // assert
            expect(result[0].length).toEqual(3);
            expect(result[1].length).toEqual(2);
        });
    });

    describe(".HasChanged", function () {
        beforeEach(function () {
            spyOn(handler, 'GetRawQueryDefinition').and.returnValue([]);
            spyOn(handler, 'GetCompareData').and.returnValue([[], []]);
            spyOn(handler, 'AreEqual').and.returnValue(false);
            spyOn(handler, 'CheckBlockUI');
        });
        it("should compare from raw query definition and check block UI", function () {
            var result = handler.HasChanged(true, true);

            // assert
            expect(result).toEqual(true);
            expect(handler.GetRawQueryDefinition).toHaveBeenCalled();
            expect(handler.CheckBlockUI).toHaveBeenCalled();
        });
        it("should compare from raw query definition but no check block UI", function () {
            var result = handler.HasChanged(false, false);

            // assert
            expect(result).toEqual(true);
            expect(handler.GetRawQueryDefinition).toHaveBeenCalled();
            expect(handler.CheckBlockUI).not.toHaveBeenCalled();
        });
    });

    describe(".HasSourceChanged", function () {
        beforeEach(function () {
            spyOn(handler, 'GetSourceData').and.returnValue([]);
            spyOn(handler, 'GetCompareData').and.returnValue([[], []]);
            spyOn(handler, 'AreEqual').and.returnValue(false);
        });
        it("should compare from source query definition", function () {
            var result = handler.HasSourceChanged(true);

            // assert
            expect(result).toEqual(true);
            expect(handler.GetSourceData).toHaveBeenCalled();
        });
    });

    describe(".HasExecutionParametersChanged", function () {
        beforeEach(function () {
            handler.Data([
                {
                    step_type: 'filter',
                    is_execution_parameter: true,
                    operator: 'equal_to',
                    arguments: [],
                    field: 'A'
                }
            ]);
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                {
                    step_type: 'filter',
                    is_execution_parameter: true,
                    operator: 'not_equal_to',
                    arguments: [],
                    field: 'A'
                }
            ]);
            spyOn(handler, 'GetCompareData').and.returnValue([[], []]);
            spyOn(handler, 'AreEqual').and.returnValue(false);
        });
        it("should compare when it contains execution parameters", function () {
            var result = handler.HasExecutionParametersChanged();

            // assert
            expect(result).toEqual(true);
            expect(handler.GetQueryStepsFromQueryDefinition).toHaveBeenCalled();
        });
    });

    describe(".HasJumpChanged", function () {
        it("should return true when the number of [followup] from query definitions are diffenent from the number of GetJumps()'s [query steps]", function () {
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                { step_type: 'sorting' }
            ]);
            spyOn(handler, 'GetJumps').and.returnValue([
                { step_type: 'followup' }
            ]);

            var result = handler.HasJumpChanged();
            expect(result).toEqual(true);
        });

        it("should return true when the [followup] from query definitions are diffenent from GetJumps()'s [query steps]", function () {
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                {
                    step_type: 'followup',
                    followup: 'followup1'
                }
            ]);
            spyOn(handler, 'GetJumps').and.returnValue([
                {
                    step_type: 'followup',
                    followup: 'followup2'
                }
            ]);

            var result = handler.HasJumpChanged();
            expect(result).toEqual(true);
        });

        it("should return false when the [followup] from query definitions are same as [query steps] from GetJumps()", function () {
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([
                { step_type: 'followup' }
            ]);
            spyOn(handler, 'GetJumps').and.returnValue([
                { step_type: 'followup' }
            ]);

            var result = handler.HasJumpChanged();
            expect(result).toEqual(false);
        });
    });

    describe(".HasData", function () {
        it("should return true if source query definition contains filters and jumps", function () {
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([{ step_type: 'filter' }]);
            spyOn(handler, 'GetFiltersAndJumps').and.returnValue([]);

            var result = handler.HasData();
            expect(result).toBeTruthy();
        });
        it("should return true if current query definition contains filters and jumps", function () {
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([]);
            spyOn(handler, 'GetFiltersAndJumps').and.returnValue([{}]);

            var result = handler.HasData();
            expect(result).toBeTruthy();
        });
        it("should return false", function () {
            spyOn(handler, 'GetQueryStepsFromQueryDefinition').and.returnValue([]);
            spyOn(handler, 'GetFiltersAndJumps').and.returnValue([]);

            var result = handler.HasData();
            expect(result).toBeFalsy();
        });
    });

    describe(".CanApply", function () {
        it("should return true (ReadOnly=false, HasData=true, CanChangeJump=true, CanChangeFilter=false)", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            spyOn(handler, 'HasData').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(false);

            var result = handler.CanApply();
            expect(result).toBeTruthy();
        });
        it("should return true (ReadOnly=false, HasData=true, CanChangeJump=false, CanChangeFilter=true)", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            spyOn(handler, 'HasData').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(false);
            spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(true);

            var result = handler.CanApply();
            expect(result).toBeTruthy();
        });
        it("should return true (ReadOnly=false, HasData=true, CanChangeJump=true, CanChangeFilter=true)", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            spyOn(handler, 'HasData').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(true);

            var result = handler.CanApply();
            expect(result).toBeTruthy();
        });
        it("should return false (ReadOnly=true)", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(true);
            spyOn(handler, 'HasData').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(true);

            var result = handler.CanApply();
            expect(result).toBeFalsy();
        });
        it("should return false (HasData=false)", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            spyOn(handler, 'HasData').and.returnValue(false);
            spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(true);

            var result = handler.CanApply();
            expect(result).toBeFalsy();
        });
        it("should return false (CanChangeJump=false, CanChangeFilter=false)", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            spyOn(handler, 'HasData').and.returnValue(true);
            spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(false);
            spyOn(handler.Authorizations, 'CanChangeFilter').and.returnValue(false);

            var result = handler.CanApply();
            expect(result).toBeFalsy();
        });
    });

    // CanAdd need to check first !!!
    describe(".CanAdd", function () {
        var queryStep;
        beforeEach(function () {
            queryStep = {};
        });
        it("can add (IsErrorJump=false)", function () {
            spyOn(handler, "IsErrorJump").and.returnValues(false, false);
            spyOn(handler.Authorizations, "CanSave").and.returnValue(true);
            spyOn(handler.Authorizations, "CanExecute").and.returnValue(true);
            spyOn(handler.Authorizations, "CanChangeFilter").and.returnValue(true);
            handler.Data([{}, {}]);
            var result = handler.CanAdd(queryStep);
            expect(result).toEqual(true);
        });
        it("cannot add (IsErrorJump=true)", function () {
            spyOn(handler, "IsErrorJump").and.returnValues(true, false);
            spyOn(handler.Authorizations, "CanSave").and.returnValue(true);
            spyOn(handler.Authorizations, "CanExecute").and.returnValue(true);
            spyOn(handler.Authorizations, "CanChangeFilter").and.returnValue(true);
            handler.Data([{}, {}, queryStep, {}]);
            var result = handler.CanAdd(queryStep);
            expect(result).toEqual(false);
        });
        it("can add (CanSave=true, CanExecute=false)", function () {
            spyOn(handler, "IsErrorJump").and.returnValues(false, false);
            spyOn(handler.Authorizations, "CanSave").and.returnValue(true);
            spyOn(handler.Authorizations, "CanExecute").and.returnValue(false);
            spyOn(handler.Authorizations, "CanChangeFilter").and.returnValue(true);
            handler.Data([{}, {}]);
            var result = handler.CanAdd(queryStep);
            expect(result).toEqual(false);
        });
        it("can add (CanSave=false, CanExecute=true)", function () {
            spyOn(handler, "IsErrorJump").and.returnValues(false, false);
            spyOn(handler.Authorizations, "CanSave").and.returnValue(false);
            spyOn(handler.Authorizations, "CanExecute").and.returnValue(true);
            spyOn(handler.Authorizations, "CanChangeFilter").and.returnValue(true);
            handler.Data([{}, {}]);
            var result = handler.CanAdd(queryStep);
            expect(result).toEqual(true);
        });
        it("cannot add (CanSave=false, CanExecute=false)", function () {
            spyOn(handler, "IsErrorJump").and.returnValues(false, false);
            spyOn(handler.Authorizations, "CanSave").and.returnValue(false);
            spyOn(handler.Authorizations, "CanExecute").and.returnValue(false);
            spyOn(handler.Authorizations, "CanChangeFilter").and.returnValue(true);
            handler.Data([{}, {}]);
            var result = handler.CanAdd(queryStep);
            expect(result).toEqual(false);
        });
        it("cannot add (CanChangeFilter=true)", function () {
            spyOn(handler, "IsErrorJump").and.returnValues(false, false);
            spyOn(handler.Authorizations, "CanSave").and.returnValue(true);
            spyOn(handler.Authorizations, "CanExecute").and.returnValue(true);
            spyOn(handler.Authorizations, "CanChangeFilter").and.returnValue(false);
            handler.Data([{}, {}]);
            var result = handler.CanAdd(queryStep);
            expect(result).toEqual(false);
        });
    });

    describe(".CanExecute", function () {
        it("should return false when ReadOnly() is true", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(true);
            handler.Authorizations = { CanExecute: function () { return true; } };
            spyOn(handler, 'HasWarning').and.returnValue(false);

            var result = handler.CanExecute();
            expect(result).toEqual(false);
        });
        it("should return false when cannot execute", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            handler.Authorizations = { CanExecute: function () { return false; } };
            spyOn(handler, 'HasWarning').and.returnValue(false);

            var result = handler.CanExecute();
            expect(result).toEqual(false);
        });
        it("should return false when there are any warning messages", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            handler.Authorizations = { CanExecute: function () { return true; } };
            spyOn(handler, 'HasWarning').and.returnValue(true);

            var result = handler.CanExecute();
            expect(result).toEqual(false);
        });
        it("should return true when can execute and has no warning message", function () {
            spyOn(handler, 'ReadOnly').and.returnValue(false);
            handler.Authorizations = { CanExecute: function () { return true; } };
            spyOn(handler, 'HasWarning').and.returnValue(false);

            var result = handler.CanExecute();
            expect(result).toEqual(true);
        });
    });

    describe(".CanSave", function () {
        it("should return true when user has the right to save", function () {
            handler.Authorizations.CanSave = function () { return true; };
            var result = handler.CanSave();
            expect(result).toEqual(true);
        });
        it("should return true when user has not the right to save", function () {
            handler.Authorizations.CanSave = function () { return false; };
            var result = handler.CanSave();
            expect(result).toEqual(false);
        });
    });

    describe(".Cancel", function () {
        it("should cancel", function () {
            spyOn(handler, 'ForcedUpdateData');
            handler.Cancel();

            // assert
            expect(handler.ForcedUpdateData).toHaveBeenCalled();
        });
    });

    describe(".Validate", function () {
        it("should valid", function () {
            spyOn(handler, 'GetFilters').and.returnValue([]);

            var result = handler.Validate();
            expect(result.valid).toEqual(true);
        });
        it("should not valid", function () {
            spyOn(handler, 'GetFilters').and.returnValue([
                { validate: function () { return { valid: true }; } },
                { validate: function () { return { valid: false }; } },
                { validate: function () { return { valid: false }; } }
            ]);
            spyOn(validationHandler, 'GetValidationError').and.returnValue('');

            var result = handler.Validate();
            expect(result.valid).toEqual(false);
            expect(validationHandler.GetValidationError).toHaveBeenCalledTimes(2);
        });
    });

    describe(".ShowProgressbar", function () {
        it("should show the busy indicator", function () {
            spyOn($.fn, 'busyIndicator');
            handler.ShowProgressbar();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalled();
        });
    });

    describe(".HideProgressbar", function () {
        it("should hide the busy indicator", function () {
            spyOn($.fn, 'busyIndicator');
            handler.HideProgressbar();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalled();
        });
    });

    describe(".ApplyHandler", function () {
        it("should apply handler", function () {
            spyOn(handler, 'InitialSortable');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(handler, 'CreateBlockUI');
            handler.ApplyHandler($('<div/>'));

            // assert
            expect(handler.GetContainer().length).toEqual(1);
            expect(handler.InitialSortable).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(handler.CreateBlockUI).toHaveBeenCalled();
        });
    });

    describe(".CreateBlockUI", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper.Overlay, 'Create');
        });
        it("should create an overlay", function () {
            handler.BlockUI = true;
            handler.CreateBlockUI($());

            // assert
            expect(WC.HtmlHelper.Overlay.Create).toHaveBeenCalled();
        });
        it("should not create an overlay", function () {
            handler.BlockUI = false;
            handler.CreateBlockUI($());

            // assert
            expect(WC.HtmlHelper.Overlay.Create).not.toHaveBeenCalled();
        });
    });

    describe(".TriggerUpdateBlockUI", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper.Overlay, 'Resize');
        });
        it("should resize an overlay", function () {
            handler.BlockUI = true;
            handler.TriggerUpdateBlockUI($());

            // assert
            expect(WC.HtmlHelper.Overlay.Resize).toHaveBeenCalled();
        });
        it("should not resize an overlay", function () {
            handler.BlockUI = false;
            handler.TriggerUpdateBlockUI($());

            // assert
            expect(WC.HtmlHelper.Overlay.Resize).not.toHaveBeenCalled();
        });
    });

    describe(".UpdateBlockUI", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper.Overlay, 'Update');
        });
        it("should update an overlay", function () {
            handler.BlockUI = true;
            handler.UpdateBlockUI($());

            // assert
            expect(WC.HtmlHelper.Overlay.Update).toHaveBeenCalled();
        });
        it("should not update an overlay", function () {
            handler.BlockUI = false;
            handler.UpdateBlockUI($());

            // assert
            expect(WC.HtmlHelper.Overlay.Update).not.toHaveBeenCalled();
        });
    });

    describe(".CheckBlockUI", function () {
        it("should call UpdateBlockUI function", function () {
            spyOn(handler, 'UpdateBlockUI');
            handler.CheckBlockUI();

            // assert
            expect(handler.UpdateBlockUI).toHaveBeenCalled();
        });
    });

    describe(".ScrollToItem", function () {
        beforeEach(function () {
            spyOn($.fn, 'outerHeight').and.returnValues(550, 100);
            spyOn($.fn, 'scrollTop').and.returnValue(0);
            spyOn(handler, 'GetFilterEditor').and.returnValue({ $Element: $('<div/>') });
        });
        it("should not check if no container", function () {
            spyOn($.fn, 'closest').and.returnValues($(), $('<div/>'));
            spyOn($.fn, 'offset').and.returnValues({ top: 0 }, { top: 450 });
            handler.ScrollToItem();

            // assert
            expect($.fn.offset).toHaveBeenCalledTimes(0);
        });
        it("should scoll to editor if editor is not fully visible", function () {
            spyOn($.fn, 'closest').and.returnValues($('<div/>'), $('<div/>'));
            spyOn($.fn, 'offset').and.returnValues({ top: 0 }, { top: 450 });
            handler.ScrollToItem();

            // assert
            expect($.fn.scrollTop).toHaveBeenCalledTimes(2);
        });
        it("should not scoll to editor if editor is fully visible", function () {
            spyOn($.fn, 'closest').and.returnValues($('<div/>'), $('<div/>'));
            spyOn($.fn, 'offset').and.returnValues({ top: 0 }, { top: 400 });
            handler.ScrollToItem();

            // assert
            expect($.fn.scrollTop).toHaveBeenCalledTimes(1);
        });
    });

    describe(".ExpandPanel", function () {
        it("should expand panel", function () {
            spyOn($.fn, 'hasClass').and.returnValue(true);
            spyOn($.fn, 'trigger');
            handler.ExpandPanel();

            // assert
            expect($.fn.trigger).toHaveBeenCalled();
        });
        it("should not expand panel", function () {
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn($.fn, 'trigger');
            handler.ExpandPanel();

            // assert
            expect($.fn.trigger).not.toHaveBeenCalled();
        });
    });
});