/// <reference path="../../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="../../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="../../../Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="../../../Dependencies/ViewManagement/Search/SearchPageHandler.js" />

describe('SearchPageHandler', function () {

    var searchPageHandler;
    beforeEach(function () {
        searchPageHandler = new SearchPageHandler();
    });

    describe('when create new instance', function () {
        it('should be defined', function () {
            expect(searchPageHandler).toBeDefined();
        });
    });

    describe('call IsDeleteMenuEnabled', function () {

        var mockItem, mockCurrentUser;
        beforeEach(function () {
            mockItem = {
                "name": "Dashboard",
                "description": "",
                "id": "db6d87a18510714f6c353c514886211015",
                "uri": "/dashboards/1270",
                "type": "dashboard",
                "model": "/models/1",
                "is_validated": false,
                "is_published": true,
                "created": {
                    "user": "/users/9",
                    "datetime": 1514886280,
                    "full_name": "Advance Viewer user"
                },
                "user_specific": {
                    "execute_on_login": false,
                    "is_starred": false
                },
                "authorizations": {
                    "update": false,
                    "delete": false,
                    "publish": false,
                    "unpublish": false,
                    "validate": false,
                    "unvalidate": false,
                    "update_user_specific": true
                },
                "state": "/dashboards/1270/state",
                "is_parameterized": false
            };
            mockCurrentUser = {
                "roles": "/users/9/roles",
                "user_settings": "/users/9/settings",
                "model_privileges": "/users/9/modelprivileges",
                "system_privileges": {
                    "has_management_access": false,
                    "manage_system": false,
                    "manage_users": false,
                    "allow_impersonation": false,
                    "schedule_angles": false
                },
                "id": "local\\EAViewer",
                "uri": "/users/9",
                "authenticationprovider": "/system/authenticationproviders/1",
                "full_name": "Advance Viewer user",
                "domain": "local",
                "enabled": true,
                "enabled_until": null,
                "registered_on": 1514284342,
                "last_logon": 1514886174,
                "assigned_roles": [
                   {
                       "role_id": "EA2_800_VIEWER",
                       "model_id": "EA2_800"
                   }
                ]
            };
            userModel.Data(mockCurrentUser);
        });

        it('should return true', function () {
            searchModel.SelectedItems([mockItem]);
            var expectedResult = searchPageHandler.IsDeleteMenuEnabled();
            expect(expectedResult).toEqual(true);
        });
        it('should return false', function () {
            mockItem.created.user = '/users/10';
            searchModel.SelectedItems([mockItem]);
            var expectedResult = searchPageHandler.IsDeleteMenuEnabled();
            expect(expectedResult).toEqual(false);
        });
    });
});