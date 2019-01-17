
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/searchquery.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/facetfiltersmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />

describe("FacetFiltersViewModel", function () {
    var facetFiltersViewModel;

    beforeEach(function () {
        facetFiltersViewModel = new FacetFiltersViewModel();
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
            checked: function () { return false; }
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
            expect(result).toContain('/image/test.png');
        });

        it("should display only label when facet id is not in icon list", function () {
            var result = facetFiltersViewModel.GetFilterText(filter, '', '');
            expect(result).toEqual('<span class="name">EA2_800</span>');
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
});
