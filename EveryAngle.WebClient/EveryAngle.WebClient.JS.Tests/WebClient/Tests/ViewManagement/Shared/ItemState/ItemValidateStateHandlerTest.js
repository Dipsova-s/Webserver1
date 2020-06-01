/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemvalidatestatehandler.js" />

describe("ItemStateHandler", function () {

    var itemStateHandler;
    beforeEach(function () {
        itemStateHandler = new ItemStateHandler();
    });

    describe(".CanValidateItem", function () {

        var tests = [
            {
                title: 'can validate if updating state',
                updating: true,
                validate: false,
                expected: true
            },
            {
                title: 'can validate if has privilege',
                updating: false,
                validate: true,
                expected: true
            },
            {
                title: 'can not validate',
                updating: false,
                validate: false,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                itemStateHandler.UpdatingValidateState(test.updating);
                itemStateHandler.Data.authorizations().validate = test.validate;
                var result = itemStateHandler.CanValidateItem();
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanUnvalidateItem", function () {

        var tests = [
            {
                title: 'can unvalidate if updating state',
                updating: true,
                unvalidate: false,
                expected: true
            },
            {
                title: 'can unvalidate if has privilege',
                updating: false,
                unvalidate: true,
                expected: true
            },
            {
                title: 'can not unvalidate',
                updating: false,
                unvalidate: false,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                itemStateHandler.UpdatingValidateState(test.updating);
                itemStateHandler.Data.authorizations().unvalidate = test.unvalidate;
                var result = itemStateHandler.CanUnvalidateItem();
                expect(result).toEqual(test.expected);
            });
        });
    });
});