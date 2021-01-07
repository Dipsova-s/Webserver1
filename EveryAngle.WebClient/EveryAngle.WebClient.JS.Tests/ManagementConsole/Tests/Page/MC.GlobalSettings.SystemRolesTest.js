/// <chutzpah_reference path="/../../Dependencies/custom/MC.form.js" />
/// <chutzpah_reference path="/../../Dependencies/custom/MC.util.consolidatedRole.js" />
/// <chutzpah_reference path="/../../Dependencies/page/MC.GlobalSettings.SystemRoles.js" />


describe("MC.GlobalSettings.SystemRoles", function () {
    var systemRoles;
    beforeEach(function () {
        systemRoles = MC.GlobalSettings.SystemRoles;
    });
    describe(".GetData", function () {
        var testElement;
        beforeEach(function () {
            testElement = $([
                '<form id="formSystemRoleInfo" data-role="validator" novalidate="novalidate">',
                '<div class="contentSection contentSectionInfo">',
                '<h2>Role Test_ALL</h2>',
                '<div class="contentSectionInfoItem"><label>Role ID:</label>',
                '<p><input class="required field_id" data-val="true" id="Id" maxlength="50" name="Id" placeholder="New role" readonly="readonly" type="text" value="Test_ALL"></p>',
                '</div>',
                '<div class="contentSectionInfoItem">',
                '<label>Role description:</label>',
                '<p><input class="required txtLarge" id="Description" maxlength="4000" name="Description" type="text" value="Role for all authorization">',
                '</p>',
                '</div>',
                '</div>',
                '</form>',
                '<form id="formAccessManagementConsole">',
                '<div><label for="SystemPrivileges_manage_users">Manage users</label>',
                '<p>',
                '<label><input checked="checked" id="manage_user" name="manage_user" type="radio" value="true"><span class="label">Allow</span></label>',
                '<label><input id="manage_user" name="manage_user" type="radio" value="false"><span class="label">Deny</span></label>',
                '<label><input id="manage_user" name="manage_user" type="radio" value="null"><span class="label">Undefined</span></label>',
                '</p></div>',
                '<div><label for="SystemPrivileges_manage_system">Manage system</label>',
                '<p>',
                '<label><input checked="checked" id="manage_system" name="manage_system" type="radio" value="true"><span class="label">Allow</span></label>',
                '<label><input id="manage_system" name="manage_system" type="radio" value="false"><span class="label">Deny</span></label>',
                '<label><input id="manage_system" name="manage_system" type="radio" value="null"><span class="label">Undefined</span></label>',
                '</p></div>',
                '</form>'
            ].join(''));
            testElement.hide().appendTo('body');
        });
        afterEach(function () {
            testElement.remove();
        });
        it(" Should return default value from the Edit system role page", function () {
            var expected = {
                manage_system: true,
                manage_user: true
            };
            systemRoles.RoleUri = "https://nl-test:60010//system/roles/1";
            var result = systemRoles.GetData();
            expect(result.systemRoleData.Description).toEqual("Role for all authorization");
            expect(result.systemRoleData.Id).toEqual("Test_ALL");
            expect(result.systemRoleData.system_privileges).toEqual(expected);
        });
        it("Should return Updated role value from the Edit system role page", function () {
            var expected = {
                manage_system: null,
                manage_user: false
            };
            systemRoles.RoleUri = "https://nl-test:60010//system/roles/1";
            $("input[name=manage_system][value='null']").prop("checked", true);
            $("input[name=manage_user][value='false']").prop("checked", true);
            var result = systemRoles.GetData();
            expect(result.systemRoleData.Description).toEqual("Role for all authorization");
            expect(result.systemRoleData.Id).toEqual("Test_ALL");
            expect(result.systemRoleData.system_privileges).toEqual(expected);
        });
    });
    describe(".ShowConsolidatedRolePopup", function () {
        it("Should call showPopup function", function () {
            spyOn(MC.util.consolidatedRole, "showPopup");
            systemRoles.ShowConsolidatedRolePopup("https://nl-test:60010//system/roles/1");
            expect(MC.util.consolidatedRole.showPopup).toHaveBeenCalled();
        });
    });
});