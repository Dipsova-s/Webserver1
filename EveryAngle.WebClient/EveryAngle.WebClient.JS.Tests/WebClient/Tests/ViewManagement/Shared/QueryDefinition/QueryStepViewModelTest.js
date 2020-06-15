/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />

describe("QueryStepViewModel", function () {
    describe("FitlerQueryStepViewModel", function () {
        describe("constructor", function () {
            it("should create instance", function () {
                var queryStep = {
                    step_type: 'filter'
                };
                var modelUri = 'models/1';
                var checkValid = false;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.step_type).toBe('filter');
            });
        });

        describe(".warning", function () {
            beforeEach(function () {
                spyOn(validationHandler, 'GetValidationError').and.returnValue('This is an error message');
            });

            it("should get a warning message", function () {
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
        });

        describe(".validation", function () {
            [
                "equal_to", "not_equal_to",
                "less_than", "greater_than",
                "less_than_or_equal", "greater_than_or_equal",
                "between", "not_between",
                "in_set", "not_in_set",
                "contains", "does_not_contain",
                "starts_with", "does_not_start_with",
                "ends_on", "does_not_end_on",
                "matches_pattern", "does_not_match_pattern"
            ].forEach(function (operator) {
                it("should return field has no arguments validation (operator=" + operator + ")", function () {
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

            [
                "has_value",
                "has_no_value"
            ].forEach(function (operator) {
                it("should return field has contains invalid arguments validation (operator=" + operator + ")", function () {
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

        describe(".is_changed", function () {
            it("should be false", function () {
                var data = {
                    step_type: 'filter',
                    field: 'test',
                    operator: 'any',
                    arguments: [
                        {
                            "argument_type": "function",
                            "name": "offset_date",
                            "parameters": [
                                {
                                    "name": "period_type",
                                    "value": "year"
                                },
                                {
                                    "name": "periods_to_add",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "argument_type": "function",
                            "name": "offset_date",
                            "parameters": [
                                {
                                    "name": "period_type",
                                    "value": "day"
                                },
                                {
                                    "name": "periods_to_add",
                                    "value": 0
                                }
                            ]
                        }
                    ]
                };
                var viewModel = new QueryStepViewModel(data, '/models/1', false);
                var result = viewModel.is_changed(data);

                expect(result).toEqual(false);
            });
            it("should be true", function () {
                var data1 = {
                    step_type: 'filter',
                    field: 'test',
                    operator: 'any',
                    arguments: [
                        {
                            "argument_type": "function",
                            "name": "offset_date",
                            "parameters": [
                                {
                                    "name": "period_type",
                                    "value": "year"
                                },
                                {
                                    "name": "periods_to_add",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "argument_type": "function",
                            "name": "offset_date",
                            "parameters": [
                                {
                                    "name": "period_type",
                                    "value": "day"
                                },
                                {
                                    "name": "periods_to_add",
                                    "value": 0
                                }
                            ]
                        }
                    ]
                };
                var data2 = {
                    step_type: 'filter',
                    field: 'test',
                    operator: 'any',
                    arguments: [
                        {
                            "argument_type": "function",
                            "name": "offset_date",
                            "parameters": [
                                {
                                    "name": "period_type",
                                    "value": "day"
                                },
                                {
                                    "name": "periods_to_add",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "argument_type": "function",
                            "name": "offset_date",
                            "parameters": [
                                {
                                    "name": "period_type",
                                    "value": "year"
                                },
                                {
                                    "name": "periods_to_add",
                                    "value": 0
                                }
                            ]
                        }
                    ]
                };
                var viewModel = new QueryStepViewModel(data1, '/models/1', false);
                var result = viewModel.is_changed(data2);

                expect(result).toEqual(true);
            });
        });
    });

    describe("FollowupQueryStepViewModel", function () {
        describe("constructor", function () {
            it("should create instance", function () {
                var queryStep = {
                    step_type: 'followup'
                };
                var modelUri = 'models/1';
                var checkValid = false;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.step_type).toBe('followup');
            });
        });

        describe(".warning", function () {
            beforeEach(function () {
                spyOn(validationHandler, 'GetValidationError').and.returnValue('This is an error message');
            });

            it("should get a warning message", function () {
                var queryStep = {
                    step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
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
        });
    });

    describe("SortingQueryStepViewModel", function () {
        describe("constructor", function () {
            it("should create instance", function () {
                var queryStep = {
                    step_type: 'sorting'
                };
                var modelUri = 'models/1';
                var checkValid = false;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.step_type).toBe('sorting');
            });
        });

        describe(".warning", function () {
            beforeEach(function () {
                spyOn(validationHandler, 'GetValidationError').and.returnValue('This is an error message');
            });

            it("should get a warning message", function () {
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
        });
    });

    describe("AggregationQueryStepViewModel", function () {
        describe("constructor", function () {
            it("should create instance", function () {
                var queryStep = {
                    step_type: 'aggregation'
                };
                var modelUri = 'models/1';
                var checkValid = false;
                var viewModel = new QueryStepViewModel(queryStep, modelUri, checkValid);

                expect(viewModel.step_type).toBe('aggregation');
            });
        });

        describe(".warning", function () {
            beforeEach(function () {
                spyOn(validationHandler, 'GetValidationError').and.returnValue('This is an error message');
            });

            it("should get a warning message", function () {
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
});
