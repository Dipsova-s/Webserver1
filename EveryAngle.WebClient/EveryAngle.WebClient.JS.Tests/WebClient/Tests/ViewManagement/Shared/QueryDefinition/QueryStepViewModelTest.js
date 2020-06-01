/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />

describe("QueryStepViewModel", function () {

    describe("checking filter types", function () {
        var filterTypes = [
            "filter",
            "followup",
            "sorting",
            "aggregation"
        ];

        filterTypes.forEach(function (filterType) {
            it("should create instance when querystep is " + filterType, function () {
                var queryStep = {
                    step_type: filterType
                };
                var modelUri = 'models/1';
                var checkValid = false;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.step_type).toBe(filterType);
            });
        });
    });

    describe("should return field has no arguments validation when querystep is filter", function () {

        var operators = [
            "equal_to", "not_equal_to",
            "less_than", "greater_than",
            "less_than_or_equal", "greater_than_or_equal",
            "between", "not_between",
            "in_set", "not_in_set",
            "contains", "does_not_contain",
            "starts_with", "does_not_start_with",
            "ends_on", "does_not_end_on",
            "matches_pattern", "does_not_match_pattern"
        ];

        operators.forEach(function (operator) {
            it("and operator is " + operator, function () {
                var queryStep = {
                    step_type: enumHandlers.FILTERTYPE.FILTER,
                    arguments: [],
                    operator: operator
                };
                var modelUri = 'models/1';
                var checkValid = true;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.valid).not.toBe(undefined);
                expect(viewModel.validate).not.toBe(jQuery.noop);
                expect(viewModel.validation_details).not.toBe(undefined);
                expect(viewModel.validation_details.template).toBe(Localization.Error_FieldNoArgument);
            });
        });

    });

    describe("should return field has contains invalid arguments validation when querystep is filter", function () {

        var operators = [
            "has_value",
            "has_no_value"
        ];

        operators.forEach(function (operator) {
            it("and operator is " + operator, function () {
                spyOn(WC.WidgetFilterHelper, 'IsBetweenGroupOperator').and.callFake(function () {
                    return true;
                });

                var queryStep = {
                    step_type: enumHandlers.FILTERTYPE.FILTER,
                    arguments: [],
                    operator: operator
                };
                var modelUri = 'models/1';
                var checkValid = true;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.valid).not.toBe(undefined);
                expect(viewModel.validate).not.toBe(jQuery.noop);
                expect(viewModel.validation_details).not.toBe(undefined);
                expect(viewModel.validation_details.template).toBe(Localization.Error_FieldContainsInvalidArguments);
            });
        });

    });

    describe("should get warning message correctly", function () {

        beforeEach(function () {
            spyOn(validationHandler, 'GetValidationError').and.returnValue('This is an error message');
        });

        it("when filter type is filter", function () {
            var queryStep = {
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [
                    { valid: false, value: 'test1' }
                ]
            };
            var modelUri = 'models/1';
            var checkValid = false;
            var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);
            var message = viewModel.warning();

            expect(message).toBe('This is an error message, This is an error message');
        });

        it("when filter type is sorting", function () {
            var queryStep = {
                step_type: enumHandlers.FILTERTYPE.SORTING,
                sorting_fields: [
                    { valid: false, value: 'test1' }
                ]
            };
            var modelUri = 'models/1';
            var checkValid = false;
            var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);
            var message = viewModel.warning();

            expect(message).toBe('This is an error message');
        });

        it("when filter type is aggregation", function () {
            var queryStep = {
                step_type: enumHandlers.FILTERTYPE.AGGREGATION,
                aggregation_fields: [
                    { valid: false, value: 'test1' }
                ],
                grouping_fields: [
                    { valid: false, value: 'test1' }
                ]
            };
            var modelUri = 'models/1';
            var checkValid = false;
            var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);
            var message = viewModel.warning();

            expect(message).toBe('This is an error message, This is an error message');
        });

    });

});
