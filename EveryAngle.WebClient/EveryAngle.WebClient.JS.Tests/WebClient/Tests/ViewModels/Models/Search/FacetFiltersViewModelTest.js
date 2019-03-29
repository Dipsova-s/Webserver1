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

});
