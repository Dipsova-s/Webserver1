/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/searchquery.js" />

describe("SearchQueryTest", function () {

    var searchQueryModel;
    beforeEach(function () {
        searchQueryModel = new SearchQueryViewModel();
    });

    describe(".BindUsagesValues", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                return {
                    trigger: function () { return true; }
                };
            });
            $('<div class="datepickerFrom" /><div class="datepickerFrom" />').data('kendoDatePicker', {
                value: function (val) {
                    $('.datepickerFrom').val(val);
                },
                enable: $.noop,
                element: { prop: $.noop },
                min: $.noop,
                max: $.noop
            }).hide().appendTo('body');

            $('<div class="datepickerTo" /><div class="datepickerTo" />').data('kendoDatePicker', {
                value: function (val) {
                    $('.datepickerTo').val(val);
                },
                enable: $.noop,
                element: { prop: $.noop },
                min: $.noop,
                max: $.noop
            }).hide().appendTo('body');
        });

        afterEach(function () {
            $('.datepickerFrom').remove();
            $('.datepickerTo').remove();
        });

        it("should set datepicker from", function () {
            var tag = "";
            var operator = "1";
            var dates = ["1482883200"];
            searchQueryModel.BindUsagesValues(tag, operator, dates);
            var result = $('.datepickerFrom').val();
            expect(result.getDate()).toEqual(28);
            expect(result.getMonth()).toEqual(11);
        });
    });

    describe(".IsValidUsageFilter", function () {

        var tests = [
            {
                usageOperator: 0,
                startDate: 'any',
                endDate: 'any',
                expected: false
            },
            {
                usageOperator: 1,
                startDate: 'any',
                endDate: null,
                expected: true
            },
            {
                usageOperator: 2,
                startDate: null,
                endDate: 'any',
                expected: false
            },
            {
                usageOperator: 3,
                startDate: null,
                endDate:  null,
                expected: false
            },
            {
                usageOperator: 4,
                startDate: 'any',
                endDate: 'any',
                expected: true
            },
            {
                usageOperator: 4,
                startDate: null,
                endDate: null,
                expected: false
            },
            {
                usageOperator: 4,
                startDate: null,
                endDate: 'any',
                expected: false
            },
            {
                usageOperator: 5,
                startDate: 'any',
                endDate: 'any',
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it("should get '" + test.expected + "' if operator=" + test.usageOperator + ", start date='" + test.startDate + "', end date='" + test.endDate + "'", function () {
                var result = searchQueryModel.IsValidUsageFilter(test.usageOperator, test.startDate, test.endDate);
                expect(!!result).toEqual(test.expected);
            });
        });
    });

    describe(".SetGeneralQuery", function () {

        var queries;
        beforeEach(function () {
            queries = [];
        });

        it("should not set query if no value", function () {
            searchQueryModel.SetGeneralQuery(queries, 'test', '');
            expect(queries.length).toEqual(0);
        });

        it("should set query if has value", function () {
            searchQueryModel.SetGeneralQuery(queries, 'test', 'value');
            expect(queries.length).toEqual(1);
            expect(queries[0]).toEqual('test=value');
        });
    });

    describe(".SetNumberExcuteQuery", function () {

        var queries;
        beforeEach(function () {
            queries = [];
        });

        var tests = [
            {
                title: 'should not set query if usageOperator=0',
                usageOperator: 0,
                numberOfExecute: 2,
                expectLength: 0,
                expectValue: null
            },
            {
                title: 'should set query if numberOfExecute is not set',
                usageOperator: 1,
                numberOfExecute: null,
                expectLength: 1,
                expectValue: 'number_execute_operator=1&times_executed=[0 TO 0]'
            },
            {
                title: 'should set query for usageOperator=1',
                usageOperator: 1,
                numberOfExecute: '2',
                expectLength: 1,
                expectValue: 'number_execute_operator=1&times_executed=[2 TO 2]'
            },
            {
                title: 'should set query for usageOperator=2',
                usageOperator: 2,
                numberOfExecute: '2',
                expectLength: 1,
                expectValue: 'number_execute_operator=2&times_executed=[3 TO *]'
            },
            {
                title: 'should set query for usageOperator=3',
                usageOperator: 3,
                numberOfExecute: '2',
                expectLength: 1,
                expectValue: 'number_execute_operator=3&times_executed=[* TO 1]'
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                searchQueryModel.SetNumberExcuteQuery(queries, test.usageOperator, test.numberOfExecute);
                expect(queries.length).toEqual(test.expectLength);
                if (test.expectLength) {
                    expect(queries[0]).toEqual(test.expectValue);
                }
            });
        });
    });
});
