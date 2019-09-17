/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SearchStorageHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/facetfiltersmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Search/SearchPageHandler.js" />

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

            expect(result).toContain('test-class-name');
            expect(result).toContain('class="front"');
            expect(result).toContain('class="name nameLink"');
            expect(result).toContain('class="rear"');
            expect(result).toContain('ItemLinkClicked');
        });
    });

    describe('.GetPublishCSSClass(data)', function () {

        var tests = [
            {
                is_public: true,
                expected: 'none'
            },
            {
                is_public: false,
                expected: 'icon-private'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get display status class name [is_public: ' + test.is_public + '] -> "' + test.expected + '"', function () {
                var data = {
                    is_public: test.is_public
                };
                var result = searchPageHandler.GetPublishCSSClass(data);

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
                expected: 'icon-list default schedule'
            },
            {
                display_type: 'any',
                is_angle_default: false,
                used_in_task: false,
                expected: 'icon-any'
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

    describe('.GetParameterizeCSSClass(data)', function () {

        var tests = [
            {
                is_parameterized: true,
                expected: 'icon-parameterized'
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

    describe('.GetWarnningCSSClass(data)', function () {

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
            it('should get warnings class name [has_warnings: ' + test.has_warnings + '] -> "' + test.expected + '"', function () {
                var data = {
                    has_warnings: test.has_warnings
                };
                var result = searchPageHandler.GetWarnningCSSClass(data);

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

    describe('.ShowSearchTerms', function () {
        it('should call GetSearchTermsHtmlFromItem', function () {
            spyOn(searchPageHandler, 'GetSearchTermsHtmlFromItem').and.returnValue('mock html');

            searchPageHandler.ShowSearchTerms();
            expect(searchPageHandler.GetSearchTermsHtmlFromItem).toHaveBeenCalled();
        });
    });

    describe('.SetSearchTerm(value)', function () {
        it('should set search term value correctly', function () {
            searchPageHandler.SearchTerms = ['a', 'b', 'c', 'd', 'e'];
            searchPageHandler.SetSearchTerm('f');
            expect(searchPageHandler.SearchTerms.length).toEqual(5);
            expect(searchPageHandler.SearchTerms[0]).toEqual('f');
        });
    });

    describe('.SubmitSearchBySearchTerm(element, index)', function () {
        it('should switch search terms correclty', function () {
            spyOn(searchPageHandler, 'SubmitSearchForm').and.callFake($.noop);
            spyOn(jQuery.fn, 'text').and.returnValue("c");

            searchPageHandler.SearchTerms = ["a", "b", "c"];
            searchPageHandler.SubmitSearchBySearchTerm($());

            expect(searchPageHandler.SearchTerms[0]).toEqual("c");
            expect(searchPageHandler.SubmitSearchForm).toHaveBeenCalled();
        });
    });

    describe('.GetSearchTermsHtmlFromItem', function () {
        it('should contain correct html', function () {
            searchPageHandler.SearchTerms = ['a', 'b', 'c'];

            var result = searchPageHandler.GetSearchTermsHtmlFromItem();

            expect(result).toContain('class="listview listview-popup"');
            expect(result).toContain('class="listview-item"');
            expect(result).toContain('SubmitSearchBySearchTerm');
        });
    });

    describe('[Sorting dropdown list]', function () {

        describe('.BindSortingDropdown', function () {

            beforeEach(function () {
                spyOn(searchPageHandler, 'IsValidSortingDropdown');
                spyOn(searchPageHandler, 'AddRelevancySortingOption');
                spyOn(searchPageHandler, 'CreateSortingDatasource');
                spyOn(searchPageHandler, 'SetSortingDatasource');
            });

            it('should call functions that related', function () {
                searchPageHandler.BindSortingDropdown();
                expect(searchPageHandler.IsValidSortingDropdown).toHaveBeenCalled();
                expect(searchPageHandler.AddRelevancySortingOption).toHaveBeenCalled();
                expect(searchPageHandler.CreateSortingDatasource).toHaveBeenCalled();
                expect(searchPageHandler.SetSortingDatasource).toHaveBeenCalled();
            });

        });

        describe('.IsValidSortingDropdown', function () {

            afterEach(function () {
                facetFiltersViewModel.SortOptions = [];
            });

            it('should valid if sorting data does provide an id', function () {
                facetFiltersViewModel.SortOptions = [
                    { id: 'name' }
                ];
                var result = searchPageHandler.IsValidSortingDropdown();
                expect(result).toBe(true);
            });

            it('should invalid if sorting data does not provide an id', function () {
                facetFiltersViewModel.SortOptions = [
                    { x: 'y' }
                ];
                var result = searchPageHandler.IsValidSortingDropdown();
                expect(result).toBe(false);
                expect(facetFiltersViewModel.SortOptions[0].id).toBe('name-asc');
                expect(facetFiltersViewModel.SortOptions[0].name).toBe('Name - ascending');
            });

        });

        describe('.AddRelevancySortingOption', function () {

            beforeEach(function () {
                facetFiltersViewModel.SortOptions = [];
            });

            it('should add relevancy to sorting option when it has keyword to search', function () {
                spyOn(WC.Utility, 'UrlParameter').and.returnValue('angle test');
                searchPageHandler.AddRelevancySortingOption();

                var hasRelevancy = jQuery.grep(facetFiltersViewModel.SortOptions, function (sorting) {
                    return sorting.id === facetFiltersViewModel.SortRelevancyId;
                });

                expect(hasRelevancy.length).toBe(1);
            });

            it('should not add relevancy to sorting option when it has no keyword to search', function () {
                spyOn(WC.Utility, 'UrlParameter').and.returnValue('');
                searchPageHandler.AddRelevancySortingOption();

                var hasRelevancy = jQuery.grep(facetFiltersViewModel.SortOptions, function (sorting) {
                    return sorting.id === facetFiltersViewModel.SortRelevancyId;
                });

                expect(hasRelevancy.length).toBe(0);
            });

            it('should not add relevancy to sorting option when it already has it', function () {
                spyOn(WC.Utility, 'UrlParameter').and.returnValue('angle test');
                facetFiltersViewModel.SortOptions.push({ id: facetFiltersViewModel.SortRelevancyId });

                var hasRelevancy = jQuery.grep(facetFiltersViewModel.SortOptions, function (sorting) {
                    return sorting.id === facetFiltersViewModel.SortRelevancyId;
                });

                expect(hasRelevancy.length).toBe(1);

                searchPageHandler.AddRelevancySortingOption();

                hasRelevancy = jQuery.grep(facetFiltersViewModel.SortOptions, function (sorting) {
                    return sorting.id === facetFiltersViewModel.SortRelevancyId;
                });

                expect(hasRelevancy.length).toBe(1);
            });

        });

        describe('.CreateSortingDatasource', function () {

            beforeEach(function () {
                facetFiltersViewModel.SortOptions = [
                    { id: 'name', name: 'Name' },
                    { id: 'created', name: 'Created by' },
                    { id: 'executed', name: 'Recently used' },
                    { id: 'user', name: 'Username' }
                ];
            });

            it('should build datasource to kendo dropdownlist correctly', function () {
                var result = searchPageHandler.CreateSortingDatasource();

                expect(result.length).toBe(6);

                expect(result[0].id).toBe('name-asc');
                expect(result[1].id).toBe('name-desc');
                expect(result[2].id).toBe('created-asc');
                expect(result[3].id).toBe('created-desc');
                expect(result[4].id).toBe('executed-desc');
                expect(result[5].id).toBe('user');

                expect(result[0].name).toBe('Name - ascending');
                expect(result[1].name).toBe('Name - descending');
                expect(result[2].name).toBe('Created by - ascending');
                expect(result[3].name).toBe('Created by - descending');
                expect(result[4].name).toBe('Recently used');
                expect(result[5].name).toBe('Username');
            });

        });

        describe('.ConvertSortingToViewModel', function () {

            it('should has sorting direction label on the last of name when it has direction id', function () {
                var result = searchPageHandler.ConvertSortingToViewModel({ id: 'name', name: 'Name' }, 'asc', 'ascending');
                expect(result.id).toBe('name-asc');
                expect(result.name).toBe('Name - ascending');
            });

            it('should has no sorting direction label on the last of name when it has no direction id', function () {
                var result = searchPageHandler.ConvertSortingToViewModel({ id: 'name', name: 'Name' }, 'desc', null);
                expect(result.id).toBe('name-desc');
                expect(result.name).toBe('Name');
            });

        });

        describe('.IsSortingHasDirection', function () {

            it('should be true when sorting id are name, created and executed', function () {
                var ids = ['name', 'created', 'executed'];
                jQuery.each(ids, function (i, id) {
                    var result = searchPageHandler.IsSortingHasDirection(id);
                    expect(result).toBe(true);
                });
            });

            it('should be false when sorting id are not name, created and executed', function () {
                var ids = ['user', 'relevancy', 'angle'];
                jQuery.each(ids, function (i, id) {
                    var result = searchPageHandler.IsSortingHasDirection(id);
                    expect(result).toBe(false);
                });
            });

        });

        describe('.IsSortingHasAscending', function () {

            it('should be true when sorting id are name and created', function () {
                var ids = ['name', 'created'];
                jQuery.each(ids, function (i, id) {
                    var result = searchPageHandler.IsSortingHasAscending(id);
                    expect(result).toBe(true);
                });
            });

            it('should be false when sorting id are not name and created', function () {
                var ids = ['executed', 'relevancy'];
                jQuery.each(ids, function (i, id) {
                    var result = searchPageHandler.IsSortingHasAscending(id);
                    expect(result).toBe(false);
                });
            });

        });

        describe('.IsSortingHasDescending', function () {

            it('should be true when sorting id are name, created and executed', function () {
                var ids = ['name', 'created', 'executed'];
                jQuery.each(ids, function (i, id) {
                    var result = searchPageHandler.IsSortingHasDescending(id);
                    expect(result).toBe(true);
                });
            });

            it('should be false when sorting id are not name and created', function () {
                var ids = ['user', 'relevancy', 'angle'];
                jQuery.each(ids, function (i, id) {
                    var result = searchPageHandler.IsSortingHasDescending(id);
                    expect(result).toBe(false);
                });
            });

        });

        describe('.GetDefaultSortingOption', function () {

            it('should get default sorting correctly', function () {
                var result = searchPageHandler.GetDefaultSortingOption();
                expect(result.id).toBe('name-asc');
                expect(result.name).toBe('Name - ascending');
            });

        });

        describe('.SetSortingDatasource', function () {

            var dropdownlist;
            beforeEach(function () {
                dropdownlist = {
                    wrapper: $(),
                    enable: jasmine.createSpy(),
                    readonly: jasmine.createSpy()
                };
                spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdownlist);
            });

            it('should call readonly function if Modernizr.mouse = true and isValidSorting = true', function () {
                Modernizr.mouse = true;
                var isValidSorting = true;

                // act
                searchPageHandler.SetSortingDatasource([], isValidSorting);

                // assert
                expect(dropdownlist.enable).toHaveBeenCalled();
                expect(dropdownlist.readonly).toHaveBeenCalled();
            });

            it('should not call readonly function if Modernizr.mouse = false', function () {
                Modernizr.mouse = false;
                var isValidSorting = true;

                // act
                searchPageHandler.SetSortingDatasource([], isValidSorting);

                // assert
                expect(dropdownlist.enable).toHaveBeenCalled();
                expect(dropdownlist.readonly).not.toHaveBeenCalled();
            });

            it('should not call readonly function if isValidSorting = false', function () {
                Modernizr.mouse = true;
                var isValidSorting = false;

                // act
                searchPageHandler.SetSortingDatasource([], isValidSorting);

                // assert
                expect(dropdownlist.enable).toHaveBeenCalled();
                expect(dropdownlist.readonly).not.toHaveBeenCalled();
            });

        });
    });
    
});
