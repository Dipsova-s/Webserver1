/// <reference path="/Dependencies/page/MC.Models.Roles.js" />

describe("MC.Models.Roles.js => Model role filter give correct info on 'Empty' checkbox in object filter", function () {

    var modelsRole;
    var isEmptyOr = ' <is empty> or ';
    var isNotEmptlyAnd = ' <is not empty> and ';

    beforeEach(function () {
        modelsRole = MC.Models.Roles;
    });

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

describe("MC.Models.Roles.js => Show warning when copying a role with subroles", function () {

    var modelsRole;

    beforeEach(function () {
        modelsRole = MC.Models.Roles;
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