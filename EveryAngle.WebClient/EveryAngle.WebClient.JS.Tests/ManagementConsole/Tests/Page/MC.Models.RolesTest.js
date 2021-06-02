/// <chutzpah_reference path="/../../Dependencies/page/MC.Models.Roles.js" />

describe("MC.Models.Roles", function () {

    var modelsRole;
    beforeEach(function () {
        modelsRole = MC.Models.Roles;
    });

    describe("Model role filter give correct info on 'Empty' checkbox in object filter", function () {
        
        var isEmptyOr = ' <is empty> or ';
        var isNotEmptlyAnd = ' <is not empty> and ';
        
        describe("When Filter type and allow emptly are ", function () {

            it("filter type Allow and allow emptly ON get: " + isEmptyOr, function () {
                // prepare
                var expectedMessage = isEmptyOr;
                var actualMessage = modelsRole.GetFilterDescriptionIsEmptlyMessage(true, true);

                // assert
                expect(expectedMessage).toEqual(actualMessage);
            });

            it("filter type Allow and allow emptly OFF get:" + isNotEmptlyAnd, function () {
                // prepare
                var expectedMessage = isNotEmptlyAnd;
                var actualMessage = modelsRole.GetFilterDescriptionIsEmptlyMessage(true, false);

                // assert
                expect(expectedMessage).toEqual(actualMessage);
            });

            it("filter type Denied and allow emptly ON get:" + isNotEmptlyAnd, function () {
                // prepare
                var expectedMessage = isNotEmptlyAnd;
                var actualMessage = modelsRole.GetFilterDescriptionIsEmptlyMessage(false, true);

                // assert
                expect(expectedMessage).toEqual(actualMessage);
            });

            it("filter type Denied and allow emptly OFF get:" + isEmptyOr, function () {
                // prepare
                var expectedMessage = isEmptyOr;
                var actualMessage = modelsRole.GetFilterDescriptionIsEmptlyMessage(false, false);

                // assert
                expect(expectedMessage).toEqual(actualMessage);
            });

        });
    });

    describe("Show warning when copying a role with subroles", function () {
        
        beforeEach(function () {
            spyOn(MC.util, "showPopupConfirmation").and.callFake($.noop);
            spyOn(MC.Models.Roles, "DoCheckCopyRoleToModel").and.callFake($.noop);
        });

        it("Should show popup when copy role and subrole more than zero ", function () {
            // prepare
            modelsRole.SubRoles = 1;
            modelsRole.CheckCopyRoleToModel();

            // assert
            expect(MC.util.showPopupConfirmation).toHaveBeenCalled();
        });

        it("Should not show popup when copy role and subrole equal zero ", function () {
            // prepare
            modelsRole.SubRoles = 0;
            modelsRole.CheckCopyRoleToModel();

            // assert
            expect(MC.util.showPopupConfirmation).not.toHaveBeenCalled();
        });

        it("Should correct message of popup ", function () {
            // assert
            expect("The copied role will not contain sub roles").toEqual(Localization.MC_ShowWarningPopupCopyRole);
        });
    });

    describe(".CreateEnumMultiSelect", function () {

        beforeEach(function () {
            jQuery('<div class="enumMultiSelect"></div>').appendTo('body');
        });

        afterEach(function () {
            jQuery('.enumMultiSelect').remove();
        });

        it("should render multiselect dropdown fields as a encoded values", function () {
            modelsRole.CreateEnumMultiSelect(jQuery('.enumMultiSelect'), {
                dataSource: [
                    { id: null, short_name: '<no value>', long_name: '<no value>' },
                    { id: '~NotInSet', short_name: '<not in set>', long_name: '<not in set>' }
                ]
            });

            var noValue = $('.enumMultiSelect').find('option:eq(0)').text();
            var notInSet = $('.enumMultiSelect').find('option:eq(1)').text();

            expect(noValue).toEqual('<no value>');
            expect(notInSet).toEqual('<not in set>');
        });

    });
    describe(".RemoveNoValueFromList", function () {

        it("should remove values with id as null from the array passed", function () {
            var fieldElements = [
                { id: null, short_name: '<no value>', long_name: '<no value>' },
                { id: '~NotInSet', short_name: '<not in set>', long_name: '<not in set>' }
            ]
            var newFieldElements = modelsRole.RemoveNoValueFromList(fieldElements);
            expect(newFieldElements.length).toEqual(1);
        });

    });
});

