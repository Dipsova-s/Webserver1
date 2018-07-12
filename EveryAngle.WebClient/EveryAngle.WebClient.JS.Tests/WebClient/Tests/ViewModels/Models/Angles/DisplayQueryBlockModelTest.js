/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />

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

    describe("call UpdateExecutionParameters", function () {

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
