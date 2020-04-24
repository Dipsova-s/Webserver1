/// <reference path="/Dependencies/ViewModels/Models/Angle/anglequerystepmodel.js" />

describe("AngleQueryStepModel", function () {
    var angleQueryStepModel;

    beforeEach(function () {
        angleQueryStepModel = new AngleQueryStepModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(angleQueryStepModel).toBeDefined();
        });

    });

    describe(".GetQueryStep", function () {

        it("should get query step when type == filter", function () {
            // prepare
            var testQueryStep = [{
                step_type: enumHandlers.FILTERTYPE.FILTER,
                field: 'field',
                operator: 'operator',
                arguments: 'arguments',
                valid: false,
                validation_details: 'details',
                is_adhoc_filter: true,
                is_adhoc: true,
                is_execution_parameter: true,
                execution_parameter_id: 'id1'
            }];

            var result = angleQueryStepModel.GetQueryStep(testQueryStep);

            // assert
            expect(result[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            expect(result[0].query_steps[0].step_type).toEqual(testQueryStep[0].step_type);
            expect(result[0].query_steps[0].field).toEqual(testQueryStep[0].field);
            expect(result[0].query_steps[0].operator).toEqual(testQueryStep[0].operator);
            expect(result[0].query_steps[0].arguments).toEqual(testQueryStep[0].arguments);
            expect(result[0].query_steps[0].valid).toEqual(testQueryStep[0].valid);
            expect(result[0].query_steps[0].validation_details).toEqual(testQueryStep[0].validation_details);
            expect(result[0].query_steps[0].is_adhoc_filter).toEqual(testQueryStep[0].is_adhoc_filter);
            expect(result[0].query_steps[0].is_adhoc).toEqual(testQueryStep[0].is_adhoc);
            expect(result[0].query_steps[0].is_execution_parameter).toEqual(testQueryStep[0].is_execution_parameter);
            expect(result[0].query_steps[0].execution_parameter_id).toEqual(testQueryStep[0].execution_parameter_id);
        });

        it("should get query step when type == followup", function () {
            // prepare
            var testQueryStep = [{
                step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
                followup: 'followup',
                valid: false,
                validation_details: '',
                is_adhoc_filter: true,
                is_adhoc: true
            }];

            var result = angleQueryStepModel.GetQueryStep(testQueryStep);

            // assert
            expect(result[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            expect(result[0].query_steps[0].step_type).toEqual(testQueryStep[0].step_type);
            expect(result[0].query_steps[0].followup).toEqual(testQueryStep[0].followup);
            expect(result[0].query_steps[0].valid).toEqual(testQueryStep[0].valid);
            expect(result[0].query_steps[0].validation_details).toEqual(testQueryStep[0].validation_details);
            expect(result[0].query_steps[0].is_adhoc_filter).toEqual(testQueryStep[0].is_adhoc_filter);
            expect(result[0].query_steps[0].is_adhoc).toEqual(testQueryStep[0].is_adhoc);
        });

        it("should get empty query step when type not equal followup or filter", function () {
            // prepare
            var testQueryStep = [{
                step_type: enumHandlers.FILTERTYPE.SORTING
            }];

            var result = angleQueryStepModel.GetQueryStep(testQueryStep);

            // assert
            expect(result).toEqual([]);
        });
    });

});
