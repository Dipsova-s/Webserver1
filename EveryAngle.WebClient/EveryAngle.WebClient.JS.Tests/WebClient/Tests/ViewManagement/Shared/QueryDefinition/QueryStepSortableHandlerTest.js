/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />

describe("QueryStepSortableHandler", function () {
    var handler;

    beforeEach(function () {
        handler = new QueryDefinitionHandler();
    });

    describe("MoveFilter", function () {
        it("should move filter to Angle", function () {
            handler.Parent(new QueryDefinitionHandler());
            spyOn(handler, 'RemoveFilter');
            spyOn(handler.Parent(), 'AddQueryFilter');
            spyOn(handler.Parent(), 'Save');
            var queryStep = { data: function () { return {}; }, is_applied: true };
            handler.MoveFilter(queryStep);

            // assert
            expect(queryStep.is_applied).toEqual(false);
            expect(handler.RemoveFilter).toHaveBeenCalled();
            expect(handler.Parent().AddQueryFilter).toHaveBeenCalled();
            expect(handler.Parent().Save).toHaveBeenCalled();
        });
    });

    describe("CanSortFilter", function () {
        var tests = [
            {
                title: 'can sort filter (index=2, can_save=true, can_change=true)',
                index: 2,
                can_save: true,
                can_change: true,
                expected: true
            },
            {
                title: 'can sort filter (index=3, can_save=true, can_change=true)',
                index: 3,
                can_save: true,
                can_change: true,
                expected: true
            },
            {
                title: 'cannot sort filter (index=0, can_save=true, can_change=true)',
                index: 0,
                can_save: true,
                can_change: true,
                expected: false
            },
            {
                title: 'cannot sort filter (index=5, can_save=true, can_change=true)',
                index: 5,
                can_save: true,
                can_change: true,
                expected: false
            },
            {
                title: 'cannot sort filter (index=2, can_save=true, can_change=false)',
                index: 2,
                can_save: true,
                can_change: false,
                expected: false
            },
            {
                title: 'can sort filter (index=2, can_save=false, can_change=true)',
                index: 2,
                can_save: false,
                can_change: true,
                expected: true
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                handler.Data([
                    { step_type: 'filter', field: 'field1' },
                    { step_type: 'followup' },
                    { step_type: 'filter', field: 'field2' },
                    { step_type: 'filter', field: 'field3' },
                    { step_type: 'followup' },
                    { step_type: 'filter', field: 'field4' }
                ]);
                handler.Authorizations.CanSave(test.can_save);
                handler.Authorizations.CanChangeFilter(test.can_change);

                var actual = handler.CanSortFilter(handler.Data()[test.index]);
                if (test.expected)
                    expect(actual).toBeTruthy();
                else
                    expect(actual).toBeFalsy();
            });
        });
    });

    describe("CanMoveFilter", function () {
        beforeEach(function () {
            spyOn(handler, 'InitialAggregation');
            var queryblock = {
                query_definition: [{
                    queryblock_type: 'query_steps',
                    query_steps: [{
                        step_type: 'filter',
                        field: 'PurchaseRequisition__BAFIX',
                        operator: 'equal_to',
                        arguments: [{
                            argument_type: 'value',
                            value: true
                        }]
                    }, {
                        followup: 'DedicatedSalesDocumentItem',
                        step_type: 'followup'
                    }, {
                        step_type: 'filter',
                        field: 'StorageLocation__CountMaterialOnStorageLocationLevels',
                        operator: 'greater_than',
                        arguments: []
                    }, {
                        step_type: 'filter',
                        field: 'StorageLocation__CountMaterialOnStorageLocationLevels',
                        operator: 'greater_than',
                        arguments: []
                    }]
                }]
            };
            handler.SetData(queryblock.query_definition, null, '/models/1');
            handler.Parent(new QueryDefinitionHandler());
        });

        var tests = [
            {
                title: 'can move the filter',
                can_save: true,
                is_adhoc: false,
                valid: true,
                warning: '',
                index: 0,
                expected: true
            },
            {
                title: 'cannot move the filter (can_save = false)',
                can_save: false,
                is_adhoc: false,
                valid: true,
                warning: '',
                index: 0,
                expected: false
            },
            {
                title: 'cannot move the filter (is_adhoc = true)',
                can_save: true,
                is_adhoc: true,
                valid: true,
                warning: '',
                index: 0,
                expected: false
            },
            {
                title: 'cannot move the filter (valid = false)',
                can_save: true,
                is_adhoc: false,
                valid: false,
                warning: '',
                index: 0,
                expected: false
            },
            {
                title: 'cannot move the filter (has warning)',
                can_save: true,
                is_adhoc: false,
                valid: false,
                warning: 'there is a warning',
                index: 0,
                expected: false
            },
            {
                title: 'cannot move the filter (has jump before)',
                can_save: true,
                is_adhoc: false,
                valid: true,
                warning: '',
                index: 2,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                handler.Data()[0].is_adhoc(test.is_adhoc);
                spyOn(handler.Parent(), 'CanSave').and.returnValue(test.can_save);
                spyOn(handler, 'Validate').and.returnValue({ valid: test.valid });
                var data = handler.Data()[test.index];
                data.warning = function () { return test.warning; };

                var actual = handler.CanMoveFilter(data);
                expect(actual).toEqual(test.expected);
            });
        });
    });

    describe("CloneSortableItem", function () {
        var element;

        beforeEach(function () {
            element = $('<li class="item item-filter editmode" data-index="1"><div class="item-header displayNameContainer small"><div class="front"></div><div class="name" data-role="tooltip" data-tooltip-function="QueryStepViewModel_Tooltip" data-type="html" data-tooltip-position="bottom"><div class="name-inner"><span class="textEllipsis" data-bind="text: query.name()">Storage Locat. - Number of Material Storage Location Data is greater than</span></div></div><div class="rear"></div></div></li>');
        });

        it("should possible to CloneSortableItem", function () {
            var result = handler.CloneSortableItem(element);
            expect(result.children().find('[data-role="tooltip"]').length).toEqual(0);
        });
    });

    describe("CreateSortablePlaceholder", function () {
        var element;

        beforeEach(function () {
            element = $('<li class="item item-filter editmode" data-index="1"><div class="item-header displayNameContainer small"><div class="front"></div><div class="name" data-role="tooltip" data-tooltip-function="QueryStepViewModel_Tooltip" data-type="html" data-tooltip-position="bottom"><div class="name-inner"><span class="textEllipsis" data-bind="text: query.name()">Storage Locat. - Number of Material Storage Location Data is greater than</span></div></div><div class="rear"></div></div></li>');
        });

        it("should possible to CreateSortablePlaceholder", function () {
            var result = handler.CreateSortablePlaceholder(element);
            expect(result.hasClass('item-placeholder')).toEqual(true);
            expect(result.hasClass('editmode')).toEqual(true);
        });
    });

    describe("CreateSortableHint", function () {
        var element;

        beforeEach(function () {
            element = $('<li class="item item-filter editmode" data-index="1"><div class="item-header displayNameContainer small"><div class="front"></div><div class="name" data-role="tooltip" data-tooltip-function="QueryStepViewModel_Tooltip" data-type="html" data-tooltip-position="bottom"><div class="name-inner"><span class="textEllipsis" data-bind="text: query.name()">Storage Locat. - Number of Material Storage Location Data is greater than</span></div></div><div class="rear"></div></div></li>');
        });

        it("should possible to CreateSortableHint", function () {
            var result = handler.CreateSortableHint(element);
            expect(result.hasClass('query-definition')).toEqual(true);
            expect(result.hasClass('hint')).toEqual(true);
        });
    });
});