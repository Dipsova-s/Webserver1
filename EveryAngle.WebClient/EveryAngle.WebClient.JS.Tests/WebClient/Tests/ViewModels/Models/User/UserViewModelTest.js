/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />

describe("UserViewModel", function () {
    var userViewModel;
    beforeEach(function () {
        userViewModel = new UserViewModel();
    });
    describe(".SetWorkbenchButton", function () {
        var button;
        beforeEach(function () {
            button = $('<a id="btnWorkbench" />').appendTo('body');
        });
        afterEach(function () {
            button.remove();
        });
        var tests = [
            {
                title: 'should show Workbench link if it has manage model privilege',
                managemodel: true,
                spyFunction: 'show'
            },
            {
                title: 'should not show Workbench link if it has no manage model privilege',
                managemodel: false,
                spyFunction: 'hide'
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                var spyFunction = spyOn(jQuery.fn, test.spyFunction).and.callFake(jQuery.noop);
                spyOn(userViewModel, 'IsPossibleToManageModel').and.returnValue(test.managemodel);
                userViewModel.SetWorkbenchButton();
                expect(spyFunction).toHaveBeenCalled();
            });
        });
    });
});
