var searchRetainUrlModel = new SearchRetainUrlViewModel();

function SearchRetainUrlViewModel() {
    "use strict";

    var self = this;
    self.IsInitial = false;
    self.LastUri = '';
    self.IsEnableRetailUrl = true;

    self.Initial = function () {
        progressbarModel.ReferenceUri = WC.Page.GetPreviousPageUrl();

        if (typeof jQuery('#MainContainer').data('address') === 'undefined') {
            $.address
                .init(function () {
                    jQuery('#MainContainer').data('address', true);
                })
                .change(function () {
                    if (self.LastUri && self.LastUri !== location.search) {
                        progressbarModel.ReferenceUri = '';
                    }
                    self.LastUri = location.search;

                    self.IsInitial = true;
                    self.UriChange();
                });
            setTimeout(function () {
                if (!self.IsInitial) {
                    searchRetainUrlModel.UriChange();
                }
                progressbarModel.ReferenceUri = '';
            }, 50);
        }
        WC.Utility.UrlParameter('login', null);
    };

    self.UriChange = function () {
        progressbarModel.EndProgressBar();

        if (self.IsEnableRetailUrl) {
            searchPageHandler.ExecuteSearchPage();
        }
        self.IsEnableRetailUrl = true;
    };
}

