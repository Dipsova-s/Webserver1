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
});