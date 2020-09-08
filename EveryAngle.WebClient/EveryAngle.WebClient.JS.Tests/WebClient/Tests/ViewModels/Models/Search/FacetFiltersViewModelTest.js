/// <chutzpah_reference path="/../../Dependencies/KendoUICustom/kendo.tagtextbox.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/searchquery.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/facetfiltersmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Search/searchfilterlistviewhandler.js" />

describe("FacetFiltersViewModel", function () {
    var facetFiltersViewModel;

    beforeEach(function () {
        facetFiltersViewModel = new FacetFiltersViewModel();
    });

    describe(".InsertMissingFacets", function () {
        it("should insert facets to the right ordering", function () {
            var facets = ['others'];
            var facetGeneral = ['general1-category', undefined, 'general3-category'];
            var facetTag = 'tag-category';
            var facetBusinessProcess = 'bp-category';
            facetFiltersViewModel.InsertMissingFacets(facets, facetGeneral, facetTag, facetBusinessProcess);

            // assert
            expect(facets).toEqual(['bp-category', 'tag-category', 'general1-category', 'general3-category', 'others']);
        });
    });

    describe(".NormalizeFacetFilters", function () {
        var facet;
        beforeEach(function () {
            facet = {
                type: 'others',
                filters: [
                    { name: 'name2' },
                    { name: 'name1' }
                ]
            };
        });
        it("should get filters as it (type=item_property)", function () {
            facet.type = 'item_property';
            var result = facetFiltersViewModel.NormalizeFacetFilters(facet);

            // assert
            expect(result).toEqual([
                { name: 'name2' },
                { name: 'name1' }
            ]);
        });
        it("should get filters as it (type=business_process)", function () {
            facet.type = 'business_process';
            var result = facetFiltersViewModel.NormalizeFacetFilters(facet);

            // assert
            expect(result).toEqual([
                { name: 'name2' },
                { name: 'name1' }
            ]);
        });
        it("should get ordered filters (type=others)", function () {
            var result = facetFiltersViewModel.NormalizeFacetFilters(facet);

            // assert
            expect(result).toEqual([
                { name: 'name1' },
                { name: 'name2' }
            ]);
        });
    });

    describe(".InitialTagUI", function () {
        it("should initial UI", function () {
            spyOn(facetFiltersViewModel, 'CreateTagInputUI');
            spyOn(facetFiltersViewModel, 'CreateTagMostUsed');
            facetFiltersViewModel.InitialTagUI();

            // assert
            expect(facetFiltersViewModel.CreateTagInputUI).toHaveBeenCalled();
            expect(facetFiltersViewModel.CreateTagMostUsed).toHaveBeenCalled();
        });
    });

    describe(".CreateTagInputUI", function () {
        it("should create UI", function () {
            spyOn(facetFiltersViewModel, 'GetTagInputElement').and.returnValue($());
            spyOn(facetFiltersViewModel, 'TagInputData').and.returnValue([]);
            spyOn($.fn, 'kendoTagTextBox');
            facetFiltersViewModel.CreateTagInputUI();

            // assert
            expect($.fn.kendoTagTextBox).toHaveBeenCalled();
        });
    });

    describe(".GetTagInputElement", function () {
        var ui;
        beforeEach(function () {
            $.fn.getKendoTagTextBox = $.noop;
            ui = { destroy: $.noop };
            spyOn(ui, 'destroy');
            spyOn($.fn, 'replaceWith');
            spyOn($.fn, 'remove');
        });
        it("should get element and destroy existing UI", function () {
            spyOn($.fn, 'getKendoTagTextBox').and.returnValue(ui);
            var result = facetFiltersViewModel.GetTagInputElement();

            // assert
            expect(result.selector).toEqual('#LeftMenu select.tags-input');
            expect(ui.destroy).toHaveBeenCalled();
            expect($.fn.replaceWith).not.toHaveBeenCalled();
            expect($.fn.remove).not.toHaveBeenCalled();
        });
        it("should get element and destroy UI maually", function () {
            spyOn($.fn, 'getKendoTagTextBox').and.returnValue(null);
            var result = facetFiltersViewModel.GetTagInputElement();

            // assert
            expect(result.selector).toEqual('#LeftMenu select.tags-input');
            expect(ui.destroy).not.toHaveBeenCalled();
            expect($.fn.replaceWith).toHaveBeenCalled();
            expect($.fn.remove).toHaveBeenCalled();
        });
    });

    describe(".TagInputData", function () {
        it("should get data", function () {
            facetFiltersViewModel.Data([
                { type: 'item_tag', filters: ko.observable([1, 2, 3]) }
            ]);
            var result = facetFiltersViewModel.TagInputData();

            // assert
            expect(result).toEqual([1, 2, 3]);
        });
        it("should not get data", function () {
            facetFiltersViewModel.Data([
                { type: 'item_another', filters: ko.observable([1, 2, 3]) }
            ]);
            var result = facetFiltersViewModel.TagInputData();

            // assert
            expect(result).toEqual([]);
        });
    });

    describe(".TagInputChange", function () {
        it("should search by tags", function () {
            var e = {
                sender: {
                    value: ko.observableArray(['Tag2'])
                }
            };
            spyOn(facetFiltersViewModel, 'SearchByTags');
            facetFiltersViewModel.TagInputChange(e);

            // assert
            expect(facetFiltersViewModel.SearchByTags).toHaveBeenCalledWith(['Tag2'], true);
        });
    });

    describe(".CreateTagMostUsed", function () {
        var element;
        beforeEach(function () {
            element = $('<div id="LeftMenu"><div class="tags-most-used"><div class="item-label">old</div></div></div>');
            element.appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it("should show 15 tags and sorted by count", function () {
            var filters = [
                { count: ko.observable(1), name: 'tag01' },
                { count: ko.observable(4), name: 'tag02' },
                { count: ko.observable(3), name: 'tag03' },
                { count: ko.observable(1), name: 'tag04' },
                { count: ko.observable(10), name: 'tag05' },
                { count: ko.observable(100), name: 'tag06' },
                { count: ko.observable(41), name: 'tag07' },
                { count: ko.observable(5), name: 'tag08' },
                { count: ko.observable(9), name: 'tag09' },
                { count: ko.observable(1), name: 'tag10' },
                { count: ko.observable(1), name: 'tag11' },
                { count: ko.observable(1), name: 'tag12' },
                { count: ko.observable(1), name: 'tag13' },
                { count: ko.observable(1), name: 'tag14' },
                { count: ko.observable(2), name: 'tag15' },
                { count: ko.observable(1), name: 'tag16' },
                { count: ko.observable(99), name: 'tag17' },
                { count: ko.observable(87), name: 'tag18' },
                { count: ko.observable(3), name: 'tag19' },
                { count: ko.observable(16), name: 'tag20' }
            ];
            spyOn(facetFiltersViewModel, 'TagInputData').and.returnValue(filters);
            facetFiltersViewModel.CreateTagMostUsed();
            var $tags = element.find('.item-label');

            // assert
            expect($tags.length).toEqual(15);
            expect($tags.eq(0).text()).toEqual('tag06(100)');
            expect($tags.eq(1).text()).toEqual('tag17(99)');
            expect($tags.eq(2).text()).toEqual('tag18(87)');
            expect($tags.eq(3).text()).toEqual('tag07(41)');
            expect($tags.eq(4).text()).toEqual('tag20(16)');
            expect($tags.eq(5).text()).toEqual('tag05(10)');
            expect($tags.eq(6).text()).toEqual('tag09(9)');
            expect($tags.eq(7).text()).toEqual('tag08(5)');
            expect($tags.eq(8).text()).toEqual('tag02(4)');
            expect($tags.eq(9).text()).toEqual('tag03(3)');
            expect($tags.eq(10).text()).toEqual('tag19(3)');
            expect($tags.eq(11).text()).toEqual('tag15(2)');
            expect($tags.eq(12).text()).toEqual('tag01(1)');
            expect($tags.eq(13).text()).toEqual('tag04(1)');
            expect($tags.eq(14).text()).toEqual('tag10(1)');
        });
    });

    describe(".SetSearchTag", function () {
        beforeEach(function () {
            spyOn(facetFiltersViewModel, 'SetTagElementState');
            spyOn(facetFiltersViewModel, 'SearchByTags');
        });
        var tests = [
            { checked: false, expected: true },
            { checked: true, expected: false }
        ];
        tests.forEach(function (test) {
            it("should set tag states on adding [checked=" + test.checked + "] => [checked=" + test.expected + "]", function () {
                var filter = {
                    name: 'test',
                    checked: test.checked
                };
                facetFiltersViewModel.SetSearchTag(filter, {});

                // assert
                expect(facetFiltersViewModel.SetTagElementState).toHaveBeenCalled();
                expect(facetFiltersViewModel.SearchByTags).toHaveBeenCalledWith(['test'], test.expected);
            });
        });
    });

    describe(".SetTagElementState", function () {
        beforeEach(function () {
            spyOn($.fn, 'addClass').and.returnValue($());
            spyOn($.fn, 'removeClass').and.returnValue($());
        });
        it("should set state for adding", function () {
            facetFiltersViewModel.SetTagElementState($(), true, true);

            // assert
            expect($.fn.addClass).toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
        });
        it("should set state for removing", function () {
            facetFiltersViewModel.SetTagElementState($(), false, false);

            // assert
            expect($.fn.addClass).not.toHaveBeenCalled();
            expect($.fn.removeClass).toHaveBeenCalled();
        });
    });

    describe(".SearchByTags", function () {
        it("should select checkbox state and search", function () {
            var data = [
                { name: 'Tag1', id: 'Tag1', checked: ko.observable(false), negative: ko.observable(false) },
                { name: 'Tag2', id: 'Tag2', checked: ko.observable(false), negative: ko.observable(false) },
                { name: 'Tag3', id: 'Tag3', checked: ko.observable(true), negative: ko.observable(true) }
            ];
            spyOn(facetFiltersViewModel, 'TagInputData').and.returnValue(data);
            spyOn(searchQueryModel, 'Search');
            facetFiltersViewModel.SearchByTags(['Tag1'], true);

            // assert
            expect(data[0].checked()).toEqual(true);
            expect(data[0].negative()).toEqual(false);
            expect(data[1].checked()).toEqual(false);
            expect(data[1].negative()).toEqual(false);
            expect(data[2].checked()).toEqual(true);
            expect(data[2].negative()).toEqual(true);
            expect(searchQueryModel.Search).toHaveBeenCalled();
        });
    });

    describe(".GetDuration", function () {
        it("should return 11h 15m when send seconds equal 40500", function () {
            var duration = facetFiltersViewModel.GetDuration(40500);
            expect(duration).toEqual("11h 15m ");
        });

        it("should return 2d 1h 1m when send seconds equal 213300", function () {
            var duration = facetFiltersViewModel.GetDuration(213300);
            expect(duration).toEqual("2d 11h 15m ");
        });

        it("should return 3y when send seconds equal 94608000", function () {
            var duration = facetFiltersViewModel.GetDuration(94608000);
            expect(duration).toEqual("3y ");
        });
    });

    describe(".GetTimeAgoByTimestamp", function () {
        it("should return 2h 20m since last refresh when send timestamp", function () {
            var date = new Date();
            date.setHours(date.getHours() - 2, date.getMinutes() - 20);

            var duration = facetFiltersViewModel.GetTimeAgoByTimestamp(date.getTime() / 1000);
            expect(duration).toEqual("2h 20m since last refresh");
        });

        it("should return 10d since last refresh when send timestamp", function () {
            var date = new Date();
            date.setDate(date.getDate() - 10);

            var duration = facetFiltersViewModel.GetTimeAgoByTimestamp(date.getTime() / 1000);
            expect(duration).toEqual("10d since last refresh");
        });

        it("should return 2y since last refresh when send timestamp", function () {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);

            var duration = facetFiltersViewModel.GetTimeAgoByTimestamp(date.getTime() / 1000);
            expect(duration).toEqual("2y since last refresh");
        });
    });

    describe(".GetRefreshTime", function () {
        beforeEach(function () {
            window.GetImageFolderPath = function () {
                return '';
            };
        });

        it("should return empty html when aboutInfo is null", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue(null);

            var html = facetFiltersViewModel.GetRefreshTime('EA2_800');
            expect(html).toEqual('');
        });

        it("should return status down when aboutInfo is not available", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue({
                available: function () { return false; },
                info: function () { return 'down'; }
            });

            var html = facetFiltersViewModel.GetRefreshTime('EA2_800');
            expect(html).toEqual('down');
        });

        it("should get correct info if it's realtime model", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue({
                is_real_time: true,
                available: function () { return true; }
            });

            spyOn(facetFiltersViewModel, 'GetTimeAgoByTimestamp').and.returnValue('2h 20m since last refresh');

            var html = facetFiltersViewModel.GetRefreshTime('EA2_800');
            expect(html).toEqual(Localization.RunningRealTime);
        });

        it("should get correct info if it's normal model", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue({
                is_real_time: false,
                available: function () { return true; },
                date: function () { return 'date'; },
                modeldata_timestamp: '1537500432'
            });

            var html = facetFiltersViewModel.GetRefreshTime('EA2_800');
            expect(html).not.toEqual(Localization.RunningRealTime);
        });
    });

    describe(".IsFacetChecked", function () {

        it("should return true when facet is [Business Process], on [landing page] and facet is [default business process]", function () {

            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue(null);
            spyOn(userSettingModel, 'GetByName').and.returnValue(['1', '2']);

            var filter = {
                id: '1',
                checked: function () { return true; }
            };
            var facet = { type: facetFiltersViewModel.GroupBusinessProcess };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(true);
        });

        it("should return false when facet is [Business Process], no [landing page] and facet is not [default business process]", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue(null);
            spyOn(userSettingModel, 'GetByName').and.returnValue(['1', '2']);

            var filter = {
                id: '3',
                checked: function () { return true; }
            };
            var facet = { type: facetFiltersViewModel.GroupBusinessProcess };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(false);
        });

        it("should return true when facet is [Business Process], on [search page] and filter.checked is true", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue('query');
            spyOn(userSettingModel, 'GetByName').and.returnValue(['1', '2']);

            var filter = {
                id: '3',
                checked: function () { return true; }
            };
            var facet = { type: facetFiltersViewModel.GroupBusinessProcess };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(true);
        });

        it("should return false when facet is [Business Process], on [search page] and filter.checked is false", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue('query');
            spyOn(userSettingModel, 'GetByName').and.returnValue(['1', '2']);

            var filter = {
                id: '3',
                checked: function () { return false; }
            };
            var facet = { type: facetFiltersViewModel.GroupBusinessProcess };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(false);
        });

        it("should return true when facet is not [Business Process], on [landing page] and filter.checked is true", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue(null);

            var filter = {
                id: '1',
                checked: function () { return true; }
            };
            var facet = { type: facetFiltersViewModel.GroupGeneral };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(true);
        });

        it("should return false when facet is not [Business Process], on [landing page] and filter.checked is false", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue(null);

            var filter = {
                id: '1',
                checked: function () { return false; }
            };
            var facet = { type: facetFiltersViewModel.GroupGeneral };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(false);
        });

        it("should return true when facet is not [Business Process], on [search page] and filter.checked is true", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue('query');

            var filter = {
                id: '1',
                checked: function () { return true; }
            };
            var facet = { type: facetFiltersViewModel.GroupGeneral };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(true);
        });

        it("should return false when facet is not [Business Process], on [search page] and filter.checked is false", function () {
            spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue('query');

            var filter = {
                id: '1',
                checked: function () { return false; }
            };
            var facet = { type: facetFiltersViewModel.GroupGeneral };

            var isChecked = facetFiltersViewModel.IsFacetChecked(filter, facet);
            expect(isChecked).toEqual(false);
        });

    });

    describe(".GetFilterText", function () {
        var spyGetIcon;
        var filter = {
            id: 'EA2_800',
            name: 'EA2_800',
            description: 'EA2_800',
            index: 20,
            enabled: function () { return true; },
            checked: function () { return false; },
            count: function () { return 0; }
        };
        var iconResult = {
            path: '/image/test.png',
            dimension: {
                width: 150,
                height: 150
            },
            style: 'overflow: auto'
        };
        beforeEach(function () {
            spyGetIcon = spyOn(facetFiltersViewModel, 'GetIconInfo').and.returnValue('');
        });

        it("should display business process label style when facet category is business process", function () {
            var result = facetFiltersViewModel.GetFilterText(filter, 'business_process', '');
            expect(result).toEqual('<span class="BusinessProcessBadge BusinessProcessBadgeItem2 EA2_800"></span><span class="BusinessProcessBadgeLabel" data-tooltip-text="EA2_800">EA2_800</span>');
        });

        it("should call method GetModelFilterText if facetcat_models", function () {
            spyOn(facetFiltersViewModel, 'GetModelFilterText');
            facetFiltersViewModel.GetFilterText(filter, 'EA2_800', 'facetcat_models');
            expect(facetFiltersViewModel.GetModelFilterText).toHaveBeenCalled();
        });

        it("should display icon if it exists", function () {
            spyGetIcon.and.returnValue(iconResult);
            var result = facetFiltersViewModel.GetFilterText(filter, '', 'facetcat_characteristics');
            expect(result).toEqual('<img class="name-icon" src="/image/test.png" height="150" width="150" style="overflow: auto" /><span class="name withIcon" data-tooltip-text="EA2_800"><span class="filter-name textEllipsis">EA2_800</span></span>');
        });

        it("should display only label when facet id is not in icon list", function () {
            var result = facetFiltersViewModel.GetFilterText(filter, '', '');
            expect(result).toEqual('<span class="name" data-tooltip-text="EA2_800"><span class="filter-name textEllipsis">EA2_800</span></span>');
        });
    });

    describe(".GetModelFilterText", function () {

        it("should show realtime icon for realtime model", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue({
                is_real_time: true
            });
            var result = facetFiltersViewModel.GetModelFilterText({ id: 'RTMS' });
            expect(result).toContain('searchpage/icn_clock.svg');
        });

        it("should not show icon if no data", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue(null);
            var result = facetFiltersViewModel.GetModelFilterText({ id: 'EA2_800' });
            expect(result).not.toContain('searchpage/icn_clock.svg');
        });

        it("should not show icon for normal model", function () {
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue({
                is_real_time: false
            });
            var result = facetFiltersViewModel.GetModelFilterText({ id: 'EA2_800' });
            expect(result).not.toContain('searchpage/icn_clock.svg');
        });

    });
    describe(".PrepareBusinessProcesses", function () {
        beforeEach(function () {
            spyOn(businessProcessesModel.General, 'Data').and.callFake(function () {
                return [
                    { id: "IT", order: 5 },
                    { id: "PM", order: 4 },
                    { id: "O2C", order: 3 },
                    { id: "F2R", order: 2 },
                    { id: "HCM", order: 1 }
                ];
            });
        });

        it("should show business processes fitlers by general business processes", function () {

            var data = [{
                id: "facetcat_bp",
                filters:
                    [
                        { id: "HCM" },
                        { id: "PM" },
                        { id: "P2P" },
                        { id: "O2C" }
                    ]
            }];
            facetFiltersViewModel.PrepareBusinessProcesses(data);

            var filters = data[0].filters;
            expect(filters.length).toEqual(3);
            expect(filters[0].id).toEqual("HCM");
            expect(filters[1].id).toEqual("O2C");
            expect(filters[2].id).toEqual("PM");
        });

        it("should order business processes filters by general business processes", function () {
            var data = [{
                id: "facetcat_bp",
                filters:
                    [
                        { id: "IT" },
                        { id: "PM" },
                        { id: "O2C" },
                        { id: "F2R" },
                        { id: "HCM" }
                    ]
            }];

            spyOn(businessProcessesModel, 'General').and.returnValue({
                Data: function () { return generalBusinessProcesses; }
            });

            facetFiltersViewModel.PrepareBusinessProcesses(data);

            var filters = data[0].filters;
            expect(filters.length).toEqual(5);
            expect(filters[0].id).toEqual("HCM");
            expect(filters[1].id).toEqual("F2R");
            expect(filters[2].id).toEqual("O2C");
            expect(filters[3].id).toEqual("PM");
            expect(filters[4].id).toEqual("IT");
        });
    });
    describe(".CheckAngleFacetVisibility", function () {
        it("should not show facet_has_errors", function () {
            expect(facetFiltersViewModel.FilterExclusionList).toContain('facet_has_errors');
            expect(facetFiltersViewModel.CheckAngleFacetVisibility('facet_has_errors',0)).toBeFalsy();
        });
    });
    describe(".FilterItems", function () {
        beforeEach(function () {
            spyOn(searchModel, 'FilterItems').and.callFake($.noop);
        });

        var tests = [
            {
                title: 'should get true if type is not business_process',
                has_search_query: true,
                model_checked: false,
                element_checked: false,
                type: 'any',
                expected: {
                    result: true,
                    model_checked: false,
                    element_checked: false
                }
            },
            {
                title: 'should get true if query exists',
                has_search_query: true,
                model_checked: false,
                element_checked: false,
                type: 'business_process',
                expected: {
                    result: true,
                    model_checked: false,
                    element_checked: false
                }
            },
            {
                title: 'should get true if checkbox is checked',
                has_search_query: false,
                model_checked: false,
                element_checked: true,
                type: 'business_process',
                expected: {
                    result: true,
                    model_checked: true,
                    element_checked: true
                }
            },
            {
                title: 'should get false',
                has_search_query: false,
                model_checked: false,
                element_checked: false,
                type: 'business_process',
                expected: {
                    result: false,
                    model_checked: true,
                    element_checked: true
                }
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(searchQueryModel, 'HasSearchQuery').and.returnValue(test.has_search_query);
                var model = {
                    checked: ko.observable(test.model_checked)
                };
                var event = {
                    currentTarget: { checked: test.element_checked }
                };
                var parent = {
                    type: test.type
                };
                var result = facetFiltersViewModel.FilterItems(model, event, parent);

                // assert
                expect(result).toEqual(test.expected.result);
                expect(model.checked()).toEqual(test.expected.model_checked);
                expect(event.currentTarget.checked).toEqual(test.expected.element_checked);
            });
        });
    });
});
