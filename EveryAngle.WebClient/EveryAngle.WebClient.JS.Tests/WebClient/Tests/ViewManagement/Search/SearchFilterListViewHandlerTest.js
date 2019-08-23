/// <reference path="/Dependencies/ViewModels/Models/Search/facetfiltersmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Search/searchfilterlistviewhandler.js" />

describe('SearchFilterListViewHandler', function () {

    var mockSearchFilter;
    beforeEach(function () {
        mockSearchFilter = new SearchFilterListViewHandler();
    });

    describe('.UnselectFacetFilter', function () {
        
        beforeEach(function () {
            spyOn(mockSearchFilter, 'ListView').and.callFake(function () {
                return [
                    { filters: function () { return [{ id: 'name' }]; } }
                ];
            });
            spyOn(mockSearchFilter, 'UpdateFilterToDisable');
        });

        it('should call UpdateFilterToDisable', function () {
            var view = { id: 'name' };
            mockSearchFilter.UnselectFacetFilter(view);
            expect(mockSearchFilter.UpdateFilterToDisable).toHaveBeenCalled();
        });

        it('should not call UpdateFilterToDisable', function () {
            var view = { id: 'created' };
            mockSearchFilter.UnselectFacetFilter(view);
            expect(mockSearchFilter.UpdateFilterToDisable).not.toHaveBeenCalled();
        });

    });

    describe('.UpdateFilterToDisable', function () {

        beforeEach(function () {
            jasmine.clock().install();
            spyOn(mockSearchFilter, 'FilterItems');
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should have delay 250 ms before triggering filter items', function () {
            var filter = { checked: jQuery.noop };
            mockSearchFilter.UpdateFilterToDisable(null, filter);
            expect(mockSearchFilter.FilterItems).not.toHaveBeenCalled();
            jasmine.clock().tick(251);
            expect(mockSearchFilter.FilterItems).toHaveBeenCalled();
        });

    });

    describe('.HasFiltersSelected', function () {

        it('should be true when any facet is checked', function () {
            spyOn(mockSearchFilter, 'ListView').and.returnValue([{
                filters: function () {
                    return [
                        { checked: function () { return false; } },
                        { checked: function () { return true; } }
                    ];
                }
            }]);
            var result = mockSearchFilter.HasFiltersSelected();
            expect(result).toEqual(true);
        });

        it('should be false when facet is not checked', function () {
            spyOn(mockSearchFilter, 'ListView').and.returnValue([{
                filters: function () {
                    return [
                        { checked: function () { return false; } },
                        { checked: function () { return false; } }
                    ];
                }
            }]);
            var result = mockSearchFilter.HasFiltersSelected();
            expect(result).toEqual(false);
        });

    });

    describe('.ClearAllFilters', function () {

        var mockFacet = {
            filters: function () {
                return [
                    { checked: function () { return true; } },
                    { checked: function () { return true; } },
                    { checked: function () { return true; } }
                ];
            }
        };

        beforeEach(function () {
            spyOn(mockSearchFilter, 'ListView').and.callFake(function () {
                return [mockFacet];
            });
            spyOn(mockSearchFilter, 'UpdateFilterToDisable');
        });

        it('should call UpdateFilterToDisable for all filters', function () {
            mockSearchFilter.ClearAllFilters();
            expect(mockSearchFilter.UpdateFilterToDisable.calls.count()).toEqual(3);
        });

    });

    describe('.FilterItems', function () {
        
        it('should call filtering items in facet view model class', function () {
            spyOn(facetFiltersViewModel, 'FilterItems');
            mockSearchFilter.FilterItems(null, null);
            expect(facetFiltersViewModel.FilterItems).toHaveBeenCalled();
        });

    });

});
