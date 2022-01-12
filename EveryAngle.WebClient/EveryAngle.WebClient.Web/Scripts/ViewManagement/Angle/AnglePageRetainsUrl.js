var anglePageRetainUrlModel = new AnglePageRetainUrlModel();

function AnglePageRetainUrlModel() {
    "use strict";

    var self = this;

    /*BOF: Model Properties*/
    self.IsEventCreated = false;
    self.IsInitial = false;
    self.LastUri = '';
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.Initial = function () {
        progressbarModel.ReferenceUri = WC.Page.GetPreviousPageUrl();

        if (!self.IsEventCreated) {
            self.IsEventCreated = true;
            $.address.change(self.OnUriChange);

            // prevent double call
            setTimeout(function () {
                if (!self.IsInitial) {
                    self.ApplyChanges(location.hash);
                }
            }, 50);
        }
        WC.Utility.UrlParameter('login', null);
    };
    self.OnUriChange = function (event) {
        self.IsInitial = true;
        if (event.value !== '/') {
            var index = event.value.indexOf('?');
            var queryStringUrl = (event.value).substr(index);
            if (self.LastUri && self.LastUri !== queryStringUrl) {
                progressbarModel.ReferenceUri = '';
            }

            if (self.LastUri !== queryStringUrl) {
                self.ApplyChanges(queryStringUrl);
            }
        }
    };
    self.ApplyChanges = function (lastUrl) {
        self.LastUri = lastUrl;
        anglePageHandler.SetWrapperHeight();
        anglePageHandler.ExecuteAngle(false);
    };
    /*EOF: Model Methods*/
}
