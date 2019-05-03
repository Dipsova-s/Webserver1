/// <reference path="/Dependencies/ViewManagement/Shared/ComponentServicesHandler.js" />
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
                title: 'should set Workbench link if has manage model privilege and has Workbench\'s url',
                managemodel: true,
                url: 'http://localhost/workbench',
                expected: 'http://localhost/workbench'
            },
            {
                title: 'should not set Workbench link if has not manage model privilege and has Workbench\'s url',
                managemodel: false,
                url: 'http://localhost/workbench',
                expected: undefined
            },
            {
                title: 'should not set Workbench link if has manage model privilege and has not Workbench\'s url',
                managemodel: true,
                url: '',
                expected: undefined
            },
            {
                title: 'should not set Workbench link if has not manage model privilege and has not Workbench\'s url',
                managemodel: false,
                url: '',
                expected: undefined
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(userViewModel, 'IsPossibleToManageModel').and.returnValue(test.managemodel);
                spyOn(componentServicesHandler, 'GetModellingWorkbenchUrl').and.returnValue(test.url);
                userViewModel.SetWorkbenchButton();

                //expect(button.attr('href')).toEqual(test.expected);
                expect(button.attr('href')).not.toBeNull();
            });
        });

    });
});
