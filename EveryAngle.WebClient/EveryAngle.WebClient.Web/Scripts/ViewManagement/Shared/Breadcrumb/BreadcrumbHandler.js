function BreadcrumbViewModel() {
    "use strict";

    this.label = ko.observable('');
    this.title = ko.observable('');
    this.url = ko.observable('');

    //icons
    this.frontIcon = ko.observable('');
    this.rearIcon = ko.observable('');
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

        // events
        jQuery(window)
            .off('resize.breadcrumb')
            .on('resize.breadcrumb', self.UpdateLayout)
            .trigger('resize.breadcrumb');
    };

    self.UpdateLayout = function () {
        var space = Math.max(WC.Window.Width, jQuery('.toolbar').outerWidth()) - 25;
        var element = jQuery('.breadcrumbDirectory').parent();
        var fixedWidth = element.siblings(':not(.col-action)').map(function () { return jQuery(this).outerWidth(); }).get().sum();
        space -= fixedWidth;
        var actionMenuItem = jQuery('#ActionSelect').find('.actionDropdownItem:visible');
        var actionMenuWidth = actionMenuItem.length ? actionMenuItem.outerWidth() * actionMenuItem.length + 10 : jQuery('#ActionSelect').outerWidth();
        var newActionMenuWidth = Math.min(Math.floor(space / 2), actionMenuWidth);
        var breadcrumbSpace = space - newActionMenuWidth;
        var otherBreadcrumbWidth = element.find('.breadcrumbItem:not(:eq(1))').map(function () { return jQuery(this).outerWidth(); }).get().sum();
        var itemElement = element.find('.breadcrumbItem:eq(1) .breadcrumbLabel');
        itemElement.css('max-width', breadcrumbSpace - otherBreadcrumbWidth - 60);
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
        var keyword = self.GetSearchKeyword();
        var searchResultsViewModel = new BreadcrumbViewModel();
        searchResultsViewModel.frontIcon(self.IconHome);
        var label = keyword;
        if (keyword.length > 20) {
            searchResultsViewModel.title(keyword);
            label = jQuery.trim(label.substr(0, 20)) + '...';
        }
        searchResultsViewModel.label(self.GetSearchResultsLabel(label));
        searchResultsViewModel.url(searchStorageHandler.GetSearchUrl());

        return searchResultsViewModel;
    };

    self.GetItemViewModel = function (itemName, isValidated) {
        var viewModel = new BreadcrumbViewModel();
        viewModel.frontIcon(self.IconChevron);
        viewModel.rearIcon(isValidated ? self.IconValidated : '');
        viewModel.label(itemName);
        viewModel.title(itemName);
        return viewModel;
    };
}

var breadcrumbHandler = new BreadcrumbHandler();
