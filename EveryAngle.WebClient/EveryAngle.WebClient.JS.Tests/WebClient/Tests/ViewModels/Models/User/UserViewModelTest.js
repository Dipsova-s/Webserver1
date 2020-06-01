/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />

describe("UserViewModel", function () {
    var userViewModel;

    beforeEach(function () {
        userViewModel = new UserViewModel();
    });

    describe(".SetWorkbenchButton", function () {
        
        beforeEach(function () {
            spyOn(jQuery.fn, 'show');
            spyOn(jQuery.fn, 'hide');
        });
        
        it("should show Workbench menu when user has manage modeling workbench role", function () {
            spyOn(userViewModel, 'IsPossibleToManageModelingWorkbench').and.returnValue(true);
            userViewModel.SetWorkbenchButton();
                
            expect(jQuery.fn.show).toHaveBeenCalled();
            expect(jQuery.fn.hide).not.toHaveBeenCalled();
        });

        it("should hide Workbench menu when user has no manage modeling workbench role", function () {
            spyOn(userViewModel, 'IsPossibleToManageModelingWorkbench').and.returnValue(false);
            userViewModel.SetWorkbenchButton();

            expect(jQuery.fn.show).not.toHaveBeenCalled();
            expect(jQuery.fn.hide).toHaveBeenCalled();
        });

    });

});
