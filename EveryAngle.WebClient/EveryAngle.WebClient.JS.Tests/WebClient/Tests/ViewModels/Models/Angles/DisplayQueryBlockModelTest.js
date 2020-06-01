/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />

describe("displayQueryBlockModel", function () {
    var displayQueryBlockModel;

    beforeEach(function () {
        displayQueryBlockModel = new DisplayQueryBlockModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(displayQueryBlockModel).toBeDefined();
        });

    });

    describe(".CollectQueryBlocks", function () {

        var source = [{
            step_type: 'filter',
            field: 'field',
            operator: null,
            arguments: null,
            valid: true,
            validation_details: 'details',
            is_adhoc_filter: true,
            is_adhoc: true,
            is_dashboard_filter: true,
            is_execution_parameter: true,
            execution_parameter_id: 'id1'
        }, {
            step_type: 'followup',
            followup: 'followup',
            valid: false,
            validation_details: 'details',
            is_adhoc_filter: false,
            is_adhoc: false
        }, {
            step_type: 'sorting',
            sorting_fields: 'sortingfields',
            valid: true,
            validation_details: 'details'
        }, {
            step_type: 'aggregation',
            aggregation_fields: 'aggregationfields',
            valid: true,
            validation_details: 'details',
            grouping_fields: 'groupingfields'
        }];

        it("should return query blocks from source", function () {
            var result = displayQueryBlockModel.CollectQueryBlocks(source);

            expect(result[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            expect(result[0].query_steps.length).toEqual(4);

            expect(result[0].query_steps[0].step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(result[0].query_steps[0].field).toEqual(source[0].field);
            expect(result[0].query_steps[0].operator).toEqual(source[0].operator);
            expect(result[0].query_steps[0].arguments).toEqual(source[0].arguments);
            expect(result[0].query_steps[0].valid).toEqual(source[0].valid);
            expect(result[0].query_steps[0].validation_details).toEqual(source[0].validation_details);
            expect(result[0].query_steps[0].is_adhoc_filter).toEqual(source[0].is_adhoc_filter);
            expect(result[0].query_steps[0].is_adhoc).toEqual(source[0].is_adhoc);
            expect(result[0].query_steps[0].is_dashboard_filter).toEqual(source[0].is_dashboard_filter);
            expect(result[0].query_steps[0].is_execution_parameter).toEqual(source[0].is_execution_parameter);
            expect(result[0].query_steps[0].execution_parameter_id).toEqual(source[0].execution_parameter_id);

            expect(result[0].query_steps[1].step_type).toEqual(enumHandlers.FILTERTYPE.FOLLOWUP);
            expect(result[0].query_steps[1].followup).toEqual(source[1].followup);
            expect(result[0].query_steps[1].operator).toBeUndefined();
            expect(result[0].query_steps[1].arguments).toBeUndefined();
            expect(result[0].query_steps[1].valid).toEqual(source[1].valid);
            expect(result[0].query_steps[1].validation_details).toEqual(source[1].validation_details);
            expect(result[0].query_steps[1].is_adhoc_filter).toEqual(source[1].is_adhoc_filter);
            expect(result[0].query_steps[1].is_adhoc).toEqual(source[1].is_adhoc);
            expect(result[0].query_steps[1].is_dashboard_filter).toBeUndefined();
            expect(result[0].query_steps[1].is_execution_parameter).toBeUndefined();
            expect(result[0].query_steps[1].execution_parameter_id).toBeUndefined();

            expect(result[0].query_steps[2].step_type).toEqual(enumHandlers.FILTERTYPE.SORTING);
            expect(result[0].query_steps[2].sorting_fields).toEqual(source[2].sorting_fields);
            expect(result[0].query_steps[2].operator).toBeUndefined();
            expect(result[0].query_steps[2].arguments).toBeUndefined();
            expect(result[0].query_steps[2].valid).toEqual(source[2].valid);
            expect(result[0].query_steps[2].validation_details).toEqual(source[2].validation_details);
            expect(result[0].query_steps[2].is_adhoc_filter).toBeUndefined();
            expect(result[0].query_steps[2].is_adhoc).toBeUndefined();
            expect(result[0].query_steps[2].is_dashboard_filter).toBeUndefined();
            expect(result[0].query_steps[2].is_execution_parameter).toBeUndefined();
            expect(result[0].query_steps[2].execution_parameter_id).toBeUndefined();

            expect(result[0].query_steps[3].step_type).toEqual(enumHandlers.FILTERTYPE.AGGREGATION);
            expect(result[0].query_steps[3].aggregation_fields).toEqual(source[3].aggregation_fields);
            expect(result[0].query_steps[3].operator).toBeUndefined();
            expect(result[0].query_steps[3].arguments).toBeUndefined();
            expect(result[0].query_steps[3].valid).toEqual(source[3].valid);
            expect(result[0].query_steps[3].validation_details).toEqual(source[3].validation_details);
            expect(result[0].query_steps[3].grouping_fields).toEqual(source[3].grouping_fields);
            expect(result[0].query_steps[3].is_adhoc_filter).toBeUndefined();
            expect(result[0].query_steps[3].is_adhoc).toBeUndefined();
            expect(result[0].query_steps[3].is_dashboard_filter).toBeUndefined();
            expect(result[0].query_steps[3].is_execution_parameter).toBeUndefined();
            expect(result[0].query_steps[3].execution_parameter_id).toBeUndefined();
        });

        it("should return empty query blocks when source is empty", function () {
            var result = displayQueryBlockModel.CollectQueryBlocks([]);

            expect(result).toEqual([]);
        });
    });

    describe(".UpdateExecutionParameters", function () {

        beforeEach(function () {

            var testingQuerySteps = [{
                step_type: enumHandlers.FILTERTYPE.FILTER,
                is_execution_parameter: ko.observable(true),
                execution_parameter_id: 'id1',
                operator: null,
                arguments: null
            }, {
                step_type: enumHandlers.FILTERTYPE.FILTER,
                is_execution_parameter: ko.observable(true),
                execution_parameter_id: 'id2',
                operator: null,
                arguments: null
            }];

            var testingExecuteParameter = {
                execution_parameters: [
                    {
                        step_type: 'filter',
                        field: 'ExecutionStatus',
                        arguments: [
                            {
                                argument_type: 'value',
                                value: 'my_value'
                            }],
                        operator: 'in_set',
                        execution_parameter_id: 'id2',
                        is_execution_parameter: true
                    }
                ]
            };

            displayQueryBlockModel.QuerySteps(testingQuerySteps);
            displayQueryBlockModel.TempQuerySteps(testingQuerySteps);
            displayQueryBlockModel.ExcuteParameters(testingExecuteParameter);
        });

        it("should update execution parameters from caching", function () {
            displayQueryBlockModel.UpdateExecutionParameters();

            expect(displayQueryBlockModel.QuerySteps()[1].operator).toEqual('in_set');
            expect(displayQueryBlockModel.QuerySteps()[1].arguments[0].argument_type).toEqual('value');
            expect(displayQueryBlockModel.QuerySteps()[1].arguments[0].value).toEqual('my_value');

            expect(displayQueryBlockModel.TempQuerySteps()[1].operator).toEqual('in_set');
            expect(displayQueryBlockModel.TempQuerySteps()[1].arguments[0].argument_type).toEqual('value');
            expect(displayQueryBlockModel.TempQuerySteps()[1].arguments[0].value).toEqual('my_value');
        });

    });

});
