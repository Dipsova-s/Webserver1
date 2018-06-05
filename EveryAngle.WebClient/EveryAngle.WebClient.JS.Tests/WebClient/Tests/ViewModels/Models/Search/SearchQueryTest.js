/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/searchquery.js" />

describe("SearchQueryTest", function () {

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(searchQueryModel).toBeDefined();
        });
    });

    describe("call BindUsagesValues", function () {

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
});
