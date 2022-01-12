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
            var hashUrl = '#' + event.value;
            if (self.LastUri && self.LastUri !== hashUrl) {
                progressbarModel.ReferenceUri = '';
            }

            if (self.LastUri !== hashUrl) {
                self.ApplyChanges(hashUrl);
            }
        }
    };
    self.ApplyChanges = function (lastUrl, isSplittedSublist) {
        self.LastUri = lastUrl;
        anglePageHandler.isSplittedScreen = isSplittedSublist;
        anglePageHandler.SetWrapperHeight();
        anglePageHandler.ExecuteAngle();
    };
    /*EOF: Model Methods*/
}
