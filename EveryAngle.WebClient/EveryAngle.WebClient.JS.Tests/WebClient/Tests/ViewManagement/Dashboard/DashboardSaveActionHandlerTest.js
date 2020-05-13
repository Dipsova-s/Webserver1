/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardSaveAsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardSaveActionHandler.js" />

describe("DashboardSaveActionHandler", function () {
    var dashboardSaveActionHandler, handler;
    beforeEach(function () {
        handler = {
            HasAnyChanged: $.noop,
            SaveDashboard: $.noop,
            Redirect: $.noop
        };
        dashboardSaveActionHandler = new DashboardSaveActionHandler(handler, new DashboardViewModel({}));
    });

    describe(".Initial", function () {
        it('should initial', function () {
            spyOn(dashboardSaveActionHandler, 'ApplyHandler');
            dashboardSaveActionHandler.Initial();

            // assert
            expect(dashboardSaveActionHandler.SaveActions.Primary).toBeDefined();
            expect(dashboardSaveActionHandler.SaveActions.All).toBeDefined();
            expect(dashboardSaveActionHandler.SaveActions.DashboardAs).toBeDefined();
            expect(dashboardSaveActionHandler.ApplyHandler).toHaveBeenCalled();
        });
    });
    describe(".VisibleSaveAll", function () {
        var tests = [
            {
                title: 'should be true (saveDashboard=true)',
                saveDashboard: true,
                expected: true
            },
            {
                title: 'should be false (saveDashboard=false)',
                saveDashboard: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(dashboardSaveActionHandler.DashboardModel, 'CanUpdateDashboard').and.returnValue(test.saveDashboard);

                var actual = dashboardSaveActionHandler.VisibleSaveAll();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSaveAll", function () {
        var tests = [
            {
                title: 'should be true (isAdhoc=true, anyChanged=false)',
                isAdhoc: true,
                anyChanged: false,
                expected: true
            },
            {
                title: 'should be true (isAdhoc=true, anyChanged=false)',
                isAdhoc: true,
                anyChanged: false,
                expected: true
            },
            {
                title: 'should be false (isAdhoc=false, anyChanged=false)',
                isAdhoc: false,
                anyChanged: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(dashboardSaveActionHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(test.isAdhoc);
                spyOn(dashboardSaveActionHandler.Handler, 'HasAnyChanged').and.returnValue(test.anyChanged);

                var actual = dashboardSaveActionHandler.EnableSaveAll();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SaveAll", function () {
        it('should not save', function () {
            spyOn(dashboardSaveActionHandler, 'EnableSaveAll').and.returnValue(false);
            spyOn(dashboardSaveActionHandler.Handler, 'SaveDashboard');
            dashboardSaveActionHandler.SaveAll();

            // assert
            expect(dashboardSaveActionHandler.Handler.SaveDashboard).not.toHaveBeenCalled();
        });
        it('should save', function () {
            spyOn(dashboardSaveActionHandler, 'EnableSaveAll').and.returnValue(true);
            spyOn(dashboardSaveActionHandler.Handler, 'SaveDashboard');
            dashboardSaveActionHandler.SaveAll();

            // assert
            expect(dashboardSaveActionHandler.Handler.SaveDashboard).toHaveBeenCalled();
        });
    });

    describe(".VisibleSaveDashboardAs", function () {
        var tests = [
            {
                title: 'should be true (isAdhoc=false, canCreate=true)',
                isAdhoc: false,
                canCreate: true,
                expected: true
            },
            {
                title: 'should be false (isAdhoc=true, canCreate=true)',
                isAdhoc: true,
                canCreate: true,
                expected: false
            },
            {
                title: 'should be false (isAdhoc=false, canCreate=false)',
                isAdhoc: false,
                canCreate: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(dashboardSaveActionHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(test.isAdhoc);
                spyOn(privilegesViewModel, 'IsAllowExecuteDashboard').and.returnValue(test.canCreate);

                var actual = dashboardSaveActionHandler.VisibleSaveDashboardAs();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSaveDashboardAs", function () {
        var tests = [
            {
                title: 'should be true (canCreate=true)',
                canCreate: true,
                expected: true
            },
            {
                title: 'should be false (canCreate=false)',
                canCreate: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(privilegesViewModel, 'IsAllowExecuteDashboard').and.returnValue(test.canCreate);

                var actual = dashboardSaveActionHandler.EnableSaveDashboardAs();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SaveDashboardAs", function () {
        var saveAsHandler;
        beforeEach(function () {
            saveAsHandler = {
                ItemSaveAsHandler: {},
                ShowPopup: $.noop
            };
            spyOn(dashboardSaveActionHandler, 'HideSaveOptionsMenu');
            spyOn(saveAsHandler, 'ShowPopup');
            spyOn(window, 'DashboardSaveAsHandler').and.returnValue(saveAsHandler);
        });
        it('should not save as', function () {
            spyOn(dashboardSaveActionHandler, 'EnableSaveDashboardAs').and.returnValue(false);
            dashboardSaveActionHandler.SaveDashboardAs();

            // assert
            expect(dashboardSaveActionHandler.HideSaveOptionsMenu).not.toHaveBeenCalled();
            expect(saveAsHandler.ShowPopup).not.toHaveBeenCalled();
        });
        it('should save as', function () {
            spyOn(dashboardSaveActionHandler, 'EnableSaveDashboardAs').and.returnValue(true);
            dashboardSaveActionHandler.SaveDashboardAs();

            // assert
            expect(dashboardSaveActionHandler.HideSaveOptionsMenu).toHaveBeenCalled();
            expect(saveAsHandler.ShowPopup).toHaveBeenCalled();
        });
    });
});
