function BreadcrumbViewModel() {
    "use strict";

    this.label = ko.observable('');
    this.title = ko.observable('');
    this.url = ko.observable('');
    this.ellipsis = ko.observable(true);

    //icons
    this.frontIcon = ko.observable('');
    this.rearIcon = ko.observable('');
    this.itemIcon = ko.observable('always-hide');
}

function BreadcrumbHandler() {
    "use strict";
    
    var self = this;

    //icons listing
    self.IconHome = 'icon icon-home icon-breadcrumb-home';
    self.IconChevron = 'icon icon-chevron-right icon-breadcrumb-chevron';
    self.IconValidated = 'icon icon-validated icon-breadcrumb-validated';

    self.ViewModels = ko.observableArray([]);
    
    self.Build = function (viewModels) {
        self.ApplyBindings();
        self.ResetViewModels();
        
        // First level is always search results
        self.ViewModels.push(self.GetSearchResultsViewModel());

        // Optional levels
        jQuery.each(viewModels, function (index, viewModel) {
            self.ViewModels.push(viewModel);
        });
    };
    
    self.ResetViewModels = function () {
        self.ViewModels([]);
    };

    self.ApplyBindings = function () {
        var breadcrumb = jQuery('.breadcrumbDirectory');
        WC.HtmlHelper.ApplyKnockout(self, breadcrumb.get(0));
    };

    self.GetSearchKeyword = function () {
        return WC.Utility.GetQueryStringValue(searchStorageHandler.GetSearchUrl(), enumHandlers.SEARCHPARAMETER.Q);
    };
    self.GetSearchResultsLabel = function (keyword) {
        return keyword ? kendo.format('{0}: "{1}"', Localization.SearchResults, keyword) : Localization.SearchResults;
    };
    self.GetSearchResultsViewModel = function () {
        var maxSearchLength = 20;
        var keyword = self.GetSearchKeyword();
        var searchResultsViewModel = new BreadcrumbViewModel();
        searchResultsViewModel.frontIcon(self.IconHome);
        var label = keyword;
        if (label.length > maxSearchLength) {
            label = jQuery.trim(label.substr(0, maxSearchLength)) + '...';
        }
        searchResultsViewModel.ellipsis(keyword.length > 0);
        searchResultsViewModel.label(self.GetSearchResultsLabel(label));
        searchResultsViewModel.title(keyword);
        searchResultsViewModel.url(searchStorageHandler.GetSearchUrl());

        return searchResultsViewModel;
    };

    self.GetItemViewModel = function (itemName, isValidated, itemIcon) {
        var viewModel = new BreadcrumbViewModel();
        viewModel.frontIcon(self.IconChevron);
        viewModel.rearIcon(isValidated ? self.IconValidated : '');
        viewModel.label(itemName);
        viewModel.title(itemName);
        viewModel.itemIcon(itemIcon);
        return viewModel;
    };
}

var breadcrumbHandler = new BreadcrumbHandler();
