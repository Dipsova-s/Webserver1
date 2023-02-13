function BreadcrumbViewModel() {
    "use strict";

    this.label = ko.observable('');
    this.title = ko.observable('');
    this.url = ko.observable(false);
    this.ellipsis = ko.observable(true);
    this.click = function () { return true; };
    this.hasEditIcon = ko.observable(false);

    // icons
    this.separatorIcon = ko.observable('');
    this.frontIcon = ko.observable('always-hide');
    this.rearIcon = ko.observable('always-hide');
}

function BreadcrumbHandler() {
    "use strict";
    
    var self = this;
    self.$Container = jQuery();
    self.Data = ko.observableArray([]);

    // icons
    self.IconHome = 'icon icon-home icon-breadcrumb-home';
    self.IconSeparator = 'icon  icon-breadcrumb-separator';
    self.IconValidated = 'icon icon-validated icon-breadcrumb-rear';
    
    self.Initial = function (container, viewModels) {
        self.$Container = jQuery(container);
        WC.HtmlHelper.ApplyKnockout(self, self.$Container.get(0));
        self.Data([]);
        
        // First level is always search results
        self.Data.push(self.GetSearchResultsViewModel());

        // Optional levels
        jQuery.each(viewModels, function (index, viewModel) {
            self.Data.push(viewModel);
        });
    };

    // search
    self.GetSearchResultsViewModel = function () {
        var maxSearchLength = 20;
        var keyword = self.GetSearchKeyword();
        var searchResultsViewModel = new BreadcrumbViewModel();
        searchResultsViewModel.separatorIcon(self.IconHome);
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
    self.GetSearchKeyword = function () {
        return WC.Utility.GetQueryStringValue(searchStorageHandler.GetSearchUrl(), enumHandlers.SEARCHPARAMETER.Q);
    };
    self.GetSearchResultsLabel = function (keyword) {
        return keyword ? kendo.format('{0}: "{1}"', Localization.SearchResults, keyword) : Localization.SearchResults;
    };

    // item
    self.GetDefaultViewModel = function (itemName) {
        var viewModel = new BreadcrumbViewModel();
        viewModel.separatorIcon(self.IconSeparator);
        viewModel.label(itemName);
        viewModel.title(itemName);
        return viewModel;
    };
    self.GetItemViewModel = function (itemName, validated) {
        var data = self.GetDefaultViewModel(itemName);
        if (validated)
            data.rearIcon(self.IconValidated);
        return data;
    };
}
var breadcrumbHandler = new BreadcrumbHandler();