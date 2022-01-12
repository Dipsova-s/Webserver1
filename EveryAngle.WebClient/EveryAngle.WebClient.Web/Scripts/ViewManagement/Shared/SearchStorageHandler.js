function SearchStorageHandler() {
    "use strict";
    
    var self = this;
    self.Id = null;

    var _self = {};
    _self.EnableTracking = true;
    _self.AppendAngleUrl = true;
    _self.AppendDashboardUrl = true;
    _self.StorageKey = 'search_urls';

    self.Initial = function (tracking, appendAngleUrl, appendDashboardUrl) {
        _self.EnableTracking = tracking;
        _self.AppendAngleUrl = appendAngleUrl;
        _self.AppendDashboardUrl = appendDashboardUrl;

        // detect sid
        var id = WC.Utility.UrlParameter(SearchStorageHandler.Query);
        if (id) {
            // query will be sent to Angle and Dashboard page
            self.Id = id;
        }
        else if (_self.EnableTracking) {
            // Id should be set here or re-use from storage
            self.UpdateId();
        }

        // clean invalid id from url
        if (!self.Get(self.Id))
            WC.Utility.RemoveUrlParameter(SearchStorageHandler.Query);

        // events
        jQuery.address.change(self.OnUrlChange);
    };
    self.Get = function (id) {
        // get url by id from storage
        return self.GetAll()[id] || '';
    };
    self.GetAll = function () {
        // get all urls from storage
        return jQuery.localStorage(_self.StorageKey) || {};
    };
    self.GetUrl = function () {
        // clean url before use
        var value = jQuery.address.value();
        if (!value || value === '/')
            value = '';
        return decodeURIComponent(value);
    };
    self.GetSearchUrl = function () {
        // get back to search url
        var query = self.Get(self.Id);
        return searchPageUrl + (query ? query.substr(query.indexOf('?')) : '');
    };
    self.UpdateId = function () {
        var value = self.GetUrl();
        self.Id = null;
        jQuery.each(self.GetAll(), function (key, url) {
            if (url === value) {
                // try to re-use
                self.Id = key;
                return false;
            }
        });

        // create a new one if not exist
        if (!self.Id)
            self.Id = jQuery.GUID().substr(0, 8);
    };
    self.UpdateAngleQuery = function (query) {
        // append sid query to Angle url
        if (_self.AppendAngleUrl && self.Id)
            query[SearchStorageHandler.Query] = self.Id;
    };
    self.UpdateDashboardQuery = function (query) {
        // append sid query to Dashboard url
        if (_self.AppendDashboardUrl && self.Id)
            query[SearchStorageHandler.Query] = self.Id;
    };
    self.Save = function () {
        // save current search url
        var url = self.GetUrl();
        if (url) {
            var data = self.GetAll();
            data[self.Id] = url;
            jQuery.localStorage(_self.StorageKey, data);
        }
    };
    self.OnUrlChange = function () {
        // it works on search page
        if (!_self.EnableTracking)
            return;

        // find suit id and save it after url updated
        self.UpdateId();
        self.Save();
    };
}
SearchStorageHandler.Query = 'sid';
var searchStorageHandler = new SearchStorageHandler();
