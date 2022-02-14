/// <chutzpah_reference path="/../../Dependencies/custom/MC.form.js" />
/// <chutzpah_reference path="/../../Dependencies/page/MC.Users.User.js" />

describe("MC.Users.User", function () {
    describe(".AddSelectedUsers", function () {
        var user, html;
        beforeEach(function () {
            user = MC.Users.User;
            html = $('<div id="AvailableUserGrid" />').data('kendoGrid', { dataSource: { getByUid: $.noop } }).appendTo('body');
            html.append('<input type="checkbox" checked />');
            html.append('<input type="checkbox" />');
            html.append('<input type="checkbox" disabled checked />');
            html.append('<input type="checkbox" disabled />');

            spyOn(MC.Users.User, "SetDataSourceToSelectedUserGrid").and.callFake($.noop);
        });
        afterEach(function () {
            html.remove('#AvailableUserGrid');
        });
        it("Add selected user ", function () {
            user.AddSelectedUsers();

            // assert
            expect(MC.Users.User.SetDataSourceToSelectedUserGrid).toHaveBeenCalled();
        });
    });

    describe(".RemovedSelectedUsers", function () {
        var user, html;
        beforeEach(function () {
            user = MC.Users.User;
            html = $('<div id="SelectedUserGrid" />').data('kendoGrid', { dataSource: { getByUid: $.noop } }).appendTo('body');
            html.append('<input type="checkbox" checked />');
            html.append('<input type="checkbox" checked />');
            html.append('<input type="checkbox" />');

            spyOn(MC.Users.User, "SetDataSourceToSelectedUserGrid").and.callFake($.noop);
        });

        afterEach(function () {
            html.remove('#SelectedUserGrid');
        });


        it("Remove selected user ", function () {
            user.RemovedSelectedUsers();

            // assert
            expect(MC.Users.User.SetDataSourceToSelectedUserGrid).toHaveBeenCalled();
        });
    });

    describe(".SaveEnableUsers", function () {
        var user, html;
        beforeEach(function () {
            user = MC.Users.User;
            html = $('<form id="formRoleSelector" > <div class=""/><input id="UserRoles" required /></form>').appendTo('body');
        });
        afterEach(function () {
            expect(user.GetImportUsersData).toHaveBeenCalled();
            html.remove();
        });
        it("should add class error when roles is empty", function () {
            var data = { roles: [] };
            spyOn(user, "GetImportUsersData").and.returnValue(data);
            user.SaveEnableUsers();

             // assert
            expect($("#UserRoles").siblings().first().hasClass('error')).toBeTruthy();
        });
        it("should not add class error when roles has some value", function () {
            var data = { roles: ["test"], users: [] };
            spyOn(user, "GetImportUsersData").and.returnValue(data);
            user.SaveEnableUsers();

             // assert
            expect($("#UserRoles").siblings().first().hasClass('error')).toBeFalsy();
        });
    });
});