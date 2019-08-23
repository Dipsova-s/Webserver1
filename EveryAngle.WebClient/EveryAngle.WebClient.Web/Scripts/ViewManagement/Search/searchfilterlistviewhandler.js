
function SearchFilterListViewHandler() {
    "use strict";

    var self = this;
    self.ListView = facetFiltersViewModel.Data;

    self.UnselectFacetFilter = function (view) {
        jQuery.each(self.ListView(), function (i, facet) {
            jQuery.each(facet.filters(), function (j, filter) {
                if (view.id === filter.id) {
                    self.UpdateFilterToDisable(facet, filter);
                    return false;
                }
            });
        });
    };

    self.UpdateFilterToDisable = function (facet, filter) {
        var timeout;
        filter.checked(false);
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            self.FilterItems(facet, filter);
        }, 250);
    };

    self.HasFiltersSelected = function () {
        var hasFiltersSelected = false;
        jQuery.each(self.ListView(), function (i, facet) {
            jQuery.each(facet.filters(), function (j, filter) {
                if (filter.checked()) {
                    hasFiltersSelected = true;
                    return false;
                }
            });
        });
        return hasFiltersSelected;
    };

    self.ClearAllFilters = function () {
        jQuery.each(self.ListView(), function (i, facet) {
            jQuery.each(facet.filters(), function (j, filter) {
                self.UpdateFilterToDisable(facet, filter);
            });
        });
    };

    self.FilterItems = function (selectedFacet, selectedFacetFilter) {
        var uncheckedEvent = { ctrlKey: false, currentTarget: { checked: false } };
        facetFiltersViewModel.FilterItems(selectedFacetFilter, uncheckedEvent, selectedFacet);
    };

}

var searchFilterListViewHandler = new SearchFilterListViewHandler();
