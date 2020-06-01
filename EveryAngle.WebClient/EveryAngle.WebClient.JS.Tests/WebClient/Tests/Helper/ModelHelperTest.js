/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/privileges.js" />

describe("ModelHelper", function () {

    describe(".DefaultDrillDownDisplayIsChanged", function () {

        it("when detail1 not have drilldown_display value and detail2 have drilldown_display value, should return true", function () {
            var displayDetails1 = {};
            var displayDetails2 = { drilldown_display: '124s6r4f1sd24fs68' };
            var result = window.WC.ModelHelper.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2);
            expect(result).toEqual(true);
        });

        it("when detail1 have drilldown_display value and detail2 not have drilldown_display value, should return true", function () {
            var displayDetails1 = { drilldown_display: '124s6r4f1sd24fs68' };
            var displayDetails2 = {};
            var result = window.WC.ModelHelper.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2);
            expect(result).toEqual(false);
        });

        it("when data not change should return false", function () {
            var displayDetails1 = { drilldown_display: '124s6r4f1sd24fs68' };
            var displayDetails2 = { drilldown_display: '124s6r4f1sd24fs68' };
            var result = window.WC.ModelHelper.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2);
            expect(result).toEqual(false);
        });
    });

    describe(".ExtendMultiLinguals", function () {

        it("should fill multi_lang_name and multi_lang_description by name and description when multi_lang_name and multi_lang_description are empty", function () {

            var data = {
                name: 'name',
                description: 'description'
            };

            spyOn(userSettingModel, 'GetByName').and.returnValue('en');

            window.WC.ModelHelper.ExtendMultiLinguals(data);

            expect(data.name).toBeDefined();
            expect(data.description).toBeDefined();
            expect(data.name).toEqual('name');
            expect(data.description).toEqual('description');

            expect(data.multi_lang_name).toBeDefined();
            expect(data.multi_lang_name.length).toBeGreaterThan(0);
            expect(data.multi_lang_name[0].lang).toEqual('en');
            expect(data.multi_lang_name[0].text).toEqual('name');

            expect(data.multi_lang_description).toBeDefined();
            expect(data.multi_lang_description.length).toBeGreaterThan(0);
            expect(data.multi_lang_description[0].lang).toEqual('en');
            expect(data.multi_lang_description[0].text).toEqual('description');
        });

    });

    describe(".ExtendQueryBlock", function () {

        it("should extend query block when type === base classes", function () {
            var queryBlock = {
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES,
                base_classes: ['class1']
            };

            spyOn(window.WC.ModelHelper, 'CleanData').and.returnValue(queryBlock);
            spyOn(window.WC.ModelHelper, 'ExtendValidProperty').and.callFake($.noop);
            spyOn(window.WC.ModelHelper, 'RemoveValidProperty').and.callFake($.noop);

            var result = window.WC.ModelHelper.ExtendQueryBlock(queryBlock);

            // assert
            expect(window.WC.ModelHelper.ExtendValidProperty).toHaveBeenCalled();
            expect(window.WC.ModelHelper.RemoveValidProperty).not.toHaveBeenCalled();

            expect(result.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        });

        it("should extend query block when type === query steps", function () {
            var queryBlock = {
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                query_steps: [
                    {
                        step_type: enumHandlers.FILTERTYPE.FILTER,
                        is_adhoc_filter: true,
                        is_adhoc: true
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
                        is_adhoc_filter: true,
                        is_adhoc: true
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.SORTING,
                        is_adhoc_filter: false,
                        is_adhoc: false
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.AGGREGATION,
                        is_adhoc_filter: false,
                        is_adhoc: false
                    }
                ]
            };

            spyOn(window.WC.ModelHelper, 'CleanData').and.returnValue(queryBlock);
            spyOn(window.WC.ModelHelper, 'RemoveValidProperty').and.callFake($.noop);

            var result = window.WC.ModelHelper.ExtendQueryBlock(queryBlock);

            // assert
            expect(window.WC.ModelHelper.RemoveValidProperty).toHaveBeenCalled();
            expect(result.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);

            expect(result.query_steps[0].step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(result.query_steps[0].is_adhoc_filter).toEqual(true);
            expect(result.query_steps[0].is_adhoc).toEqual(true);

            expect(result.query_steps[1].step_type).toEqual(enumHandlers.FILTERTYPE.FOLLOWUP);
            expect(result.query_steps[1].is_adhoc_filter).toEqual(true);
            expect(result.query_steps[1].is_adhoc).toEqual(true);

            expect(result.query_steps[2].step_type).toEqual(enumHandlers.FILTERTYPE.SORTING);
            expect(result.query_steps[2].is_adhoc_filter).toEqual(false);
            expect(result.query_steps[2].is_adhoc).toEqual(false);

            expect(result.query_steps[3].step_type).toEqual(enumHandlers.FILTERTYPE.AGGREGATION);
            expect(result.query_steps[3].is_adhoc_filter).toEqual(false);
            expect(result.query_steps[3].is_adhoc).toEqual(false);
        });
    });

    describe(".ExtendAuthorization", function () {
        var tests = [
            {
                title: 'should extend update_user_specific=true (published)',
                data: {
                    is_published: true,
                    created: { user: '/users/2' }
                },
                user: '/users/1',
                expected: true
            },
            {
                title: 'should extend update_user_specific=true (public)',
                data: {
                    is_public: true,
                    created: { user: '/users/2' }
                },
                user: '/users/1',
                expected: true
            },
            {
                title: 'should extend update_user_specific=true (creator)',
                data: {
                    created: { user: '/users/1' }
                },
                user: '/users/1',
                expected: true
            },
            {
                title: 'should extend update_user_specific=false',
                data: {
                    authorizations: {},
                    created: { user: '/users/2' }
                },
                user: '/users/1',
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(userModel, 'Data').and.returnValue({ uri: test.user });
                window.WC.ModelHelper.ExtendAuthorization(test.data);
                expect(test.data.authorizations.update_user_specific).toEqual(test.expected);
            });
        });
    });

    describe(".RemoveReadOnlyQueryStep", function () {

        it("should remove read only query step", function () {
            var step = {
                uri: 'uri',
                is_adhoc_filter: true,
                is_adhoc: true,
                is_applied: true,
                tech_info: 'techinfo',
                step_type_index: '1',
                edit_mode: 'mode1',
                model: 'ea2',
                is_execution_parameter: false,
                execution_parameter_id: 'ep1',
                step_type: enumHandlers.FILTERTYPE.FILTER,
                arguments: [
                    {
                        argument_type: enumHandlers.FILTERARGUMENTTYPE.VALUE
                    }
                ],
                sorting_fields: [
                    {
                        field: 'sf1',
                        valid: true,
                        validation_error: false,
                        validation_details: 'details'
                    }
                ],
                aggregation_fields: [
                    {
                        field: enumHandlers.AGGREGATION.COUNT.Value,
                        source_field: 'af1',
                        valid: true,
                        validation_error: false,
                        validation_details: 'details'
                    },
                    {
                        field: 'field',
                        source_field: 'af2',
                        valid: true,
                        validation_error: false,
                        validation_details: 'details'
                    }
                ],
                grouping_fields: [
                    {
                        field: 'gf1',
                        valid: true,
                        validation_error: false,
                        validation_details: 'details'
                    }
                ]
            };

            window.WC.ModelHelper.RemoveReadOnlyQueryStep(step);

            // assert
            expect(step.uri).toBeUndefined();
            expect(step.is_adhoc_filter).toBeUndefined();
            expect(step.is_adhoc).toBeUndefined();
            expect(step.is_applied).toBeUndefined();
            expect(step.tech_info).toBeUndefined();
            expect(step.step_type_index).toBeUndefined();
            expect(step.edit_mode).toBeUndefined();
            expect(step.model).toBeUndefined();
            expect(step.is_execution_parameter).toBeUndefined();
            expect(step.execution_parameter_id).toBeUndefined();
            expect(step.step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);

            expect(step.arguments[0].argument_type).toEqual(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(step.arguments[0].value).toEqual(null);

            expect(step.sorting_fields[0].field).toEqual('sf1');
            expect(step.sorting_fields[0].valid).toBeUndefined();
            expect(step.sorting_fields[0].validation_error).toBeUndefined();
            expect(step.sorting_fields[0].validation_details).toBeUndefined();

            expect(step.aggregation_fields[0].field).toEqual(enumHandlers.AGGREGATION.COUNT.Value);
            expect(step.aggregation_fields[0].source_field).toBeUndefined();
            expect(step.aggregation_fields[0].valid).toBeUndefined();
            expect(step.aggregation_fields[0].validation_error).toBeUndefined();
            expect(step.aggregation_fields[0].validation_details).toBeUndefined();
            expect(step.aggregation_fields[1].field).toEqual('field');
            expect(step.aggregation_fields[1].source_field).toEqual('af2');
            expect(step.aggregation_fields[1].valid).toBeUndefined();
            expect(step.aggregation_fields[1].validation_error).toBeUndefined();
            expect(step.aggregation_fields[1].validation_details).toBeUndefined();

            expect(step.grouping_fields[0].field).toEqual('gf1');
            expect(step.grouping_fields[0].valid).toBeUndefined();
            expect(step.grouping_fields[0].validation_error).toBeUndefined();
            expect(step.grouping_fields[0].validation_details).toBeUndefined();
        });

    });
});