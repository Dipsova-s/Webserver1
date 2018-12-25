/// <reference path="../../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="../../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="../../../Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="../../../Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="../../../Dependencies/ViewManagement/Search/SearchPageHandler.js" />

describe('SearchPageHandler', function () {

    var searchPageHandler;
    beforeEach(function () {
        searchPageHandler = new SearchPageHandler();
    });

    describe('.IsDeleteMenuEnabled()', function () {

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

    describe('.GetItemIconCSSClassByDisplay(data)', function () {
        it('should get class for hiding if no displays', function () {
            var result = searchPageHandler.GetItemIconCSSClassByDisplay({});
            expect(result).toBe('alwaysHide');
        });

        it('should get empty class if have displays', function () {
            var result = searchPageHandler.GetItemIconCSSClassByDisplay({ displays: [] });
            expect(result).toBe('');
        });
    });

    describe('.GetDisplaysListHtmlFromItem(angle, extraCssClass)', function () {
        it('should contain correct html', function () {
            var angle = {
                displays: [{}]
            };
            var result = searchPageHandler.GetDisplaysListHtmlFromItem(angle, 'test-class-name');

            expect(result).toContain('class="displayNameContainer cursorPointer test-class-name"');
            expect(result).toContain('class="front"');
            expect(result).toContain('class="name nameLink displayName"');
            expect(result).toContain('class="rear"');
            expect(result).toContain('ItemLinkClicked');
        });
    });

    describe('.GetDisplayPublishCSSClass(data)', function () {

        var tests = [
            {
                is_public: true,
                expected: 'public'
            },
            {
                is_public: false,
                expected: 'private'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get display status class name [is_public: ' + test.is_public + '] -> "' + test.expected + '"', function () {
                var data = {
                    is_public: test.is_public
                };
                var result = searchPageHandler.GetDisplayPublishCSSClass(data);

                expect(result).toEqual(test.expected);
            });
        });

    });

    describe('.GetDisplayTypeCSSClass(data)', function () {

        var tests = [
            {
                display_type: 'list',
                is_angle_default: true,
                used_in_task: true,
                expected: 'list default schedule'
            },
            {
                display_type: 'any',
                is_angle_default: false,
                used_in_task: false,
                expected: 'any'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get display type class name [display_type: ' + test.display_type + ', is_angle_default: ' + test.is_angle_default + ', used_in_task: ' + test.used_in_task + '] -> "' + test.expected + '"', function () {
                var data = {
                    display_type: test.display_type,
                    is_angle_default: test.is_angle_default,
                    used_in_task: test.used_in_task
                };
                var result = searchPageHandler.GetDisplayTypeCSSClass(data);

                expect(result).toEqual(test.expected);
            });
        });

    });

    describe('.GetDisplayFilterCSSClass(data)', function () {

        var tests = [
            {
                has_followups: true,
                has_filters: true,
                expected: 'filter followup'
            },
            {
                has_followups: true,
                has_filters: false,
                expected: 'filter followup'
            },
            {
                has_followups: false,
                has_filters: true,
                expected: 'filter'
            },
            {
                has_followups: false,
                has_filters: false,
                expected: 'filter noFilter'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get filter/jump class name [has_followups:' + test.has_followups + ', has_filters:' + test.has_filters + '] -> "' + test.expected + '"', function () {
                var data = {
                    has_followups: test.has_followups,
                    has_filters: test.has_filters
                };
                var result = searchPageHandler.GetDisplayFilterCSSClass(data);

                expect(result).toEqual(test.expected);
            });
        });

    });

    describe('.GetParameterizeCSSClass(data)', function () {

        var tests = [
            {
                is_parameterized: true,
                expected: 'parameterized'
            },
            {
                is_parameterized: false,
                expected: 'none'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get parameterized class name [is_parameterized: ' + test.is_parameterized + '] -> "' + test.expected + '"', function () {
                var data = {
                    is_parameterized: test.is_parameterized
                };
                var result = searchPageHandler.GetParameterizeCSSClass(data);

                expect(result).toEqual(test.expected);
            });
        });

    });

    describe('.GetWarnningClass(data)', function () {

        var tests = [
            {
                has_warnings: true,
                expected: 'validWarning'
            },
            {
                has_warnings: false,
                expected: 'none'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get warnings class name [is_parameterized: ' + test.has_warnings + '] -> "' + test.expected + '"', function () {
                var data = {
                    has_warnings: test.has_warnings
                };
                var result = searchPageHandler.GetWarnningClass(data);

                expect(result).toEqual(test.expected);
            });
        });

    });

    describe('.HighlightSearchResult(element)', function () {

        beforeEach(function () {
            $.fn.highlighter = $.noop;
            $.fn.removeHighlight = $.noop;
            spyOn($.fn, 'highlighter');
            spyOn(WC.Utility, 'GetParameterByName').and.returnValue('');
        });

        it('should call highlighter in displays viewmode', function () {
            searchPageHandler.DisplayType(searchPageHandler.DISPLAY_TYPE.DISPLAYS);
            searchPageHandler.HighlightSearchResult($());
            expect($.fn.highlighter).toHaveBeenCalled();
        });

        it('should call highlighter in displays viewmode', function () {
            searchPageHandler.DisplayType(searchPageHandler.DISPLAY_TYPE.COMPACT);
            searchPageHandler.HighlightSearchResult($());
            expect($.fn.highlighter).not.toHaveBeenCalled();
        });

    });

    describe('.InitialUserPrivileges', function () {

        beforeEach(function () {
            $('body').append('<input id="SearchButton" type="button">');
        });

        it('should show search button when has advance search privilege', function () {
            spyOn(userModel, 'SetCreateAngleButton').and.callFake($.noop);
            spyOn(userModel, 'SetManagementControlButton').and.callFake($.noop);
            spyOn(privilegesViewModel, 'IsAllowAdvanceSearch').and.returnValue(true);
            searchPageHandler.InitialUserPrivileges();
            expect($('#SearchButton').attr('class')).not.toEqual('alwaysHide');
        });

        it('should hide search button when has no advance search privilege', function () {
            spyOn(userModel, 'SetCreateAngleButton').and.callFake($.noop);
            spyOn(userModel, 'SetManagementControlButton').and.callFake($.noop);
            spyOn(privilegesViewModel, 'IsAllowAdvanceSearch').and.returnValue(false);
            searchPageHandler.InitialUserPrivileges();
            expect($('#SearchButton').attr('class')).toEqual('alwaysHide');
        });

    });
});