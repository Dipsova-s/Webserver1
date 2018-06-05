var sessionModel = new SessionViewModel();

function SessionViewModel() {
    "use strict";

    //BOF: View model properties
    var self = this;
    self.DirectoryName = 'session';
    self.IsLoaded = ko.observable(false);
    self.Data = ko.observable();
    //EOF: View model properties

    // storage
    if (jQuery.localStorage(self.DirectoryName) !== null) {
        self.IsLoaded(true);
        self.Data(jQuery.localStorage(self.DirectoryName));
    }

    //BOF: View model methods
    self.Load = function (option) {
        var requestUri = directoryHandler.Data.session || '';
        var setting = jQuery.extend({ RequestUri: requestUri, Callback: jQuery.noop }, option);

        if (self.IsLoaded() || !setting.RequestUri) return jQuery.when(self.Data());

        return GetDataFromWebService(setting.RequestUri)
            .done(function (data, status, xhr) {
                self.SetData(data);
                jQuery.localStorage(self.DirectoryName, self.Data());
                self.IsLoaded(true);
                setting.Callback();
            });
    };
    self.SetData = function (data) {
        self.Data(data);
    };
}

