/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function AboutSystemModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        web_client_version: '',
        app_server_version: '',
        models: []
    }, model);
}

function AboutSystemHandler() {
    "use strict";

    //BOF: View model properties
    var self = this;

    /*=========== overridable properties =============
   self.Id = null;             [required] use for key in localstorage
   self.ResponseKey = null;    [optional] data property in the response
   self.Data = {};             [required] kept data in local
   self.DataKey = 'uri';       [optional] property primary key
   self.Model = null;          [optional] model to handle data
   ==================================================*/
    self.Id = 'about';
    self.ResponseKey = null;
    self.Data = {};
    self.DataKey = null;
    self.Model = AboutSystemModel;

    /*=============== custom properties ===============*/
    /*================================================*/

    //EOF: View model properties

    //BOF: View model methods
    /*=========== overridable functions ===============
    self.Initial()                              [void] set data from localStorage
    self.Load(uri, params, [storage=true])      [deferred] load data from service
    self.LoadAll(uri, [options])                [deferred] load all data from service
    self.GetDataBy(key, value, modelUri)        [object] get cache data by...
    self.GetData(modelUri)                      [array] get all cache data
    self.SetData(data, [storage=true])          [void] set data to cache
    ==================================================*/

    self.LoadAboutSystem = function () {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <returns type="Deferred"></returns>

        var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.ABOUT);
        return self.Load(uri);
    };

    self.GetWebClientVersion = function () {
        return ClientVersion;
    };

    self.ShowAboutSystemPopup = function () {
        jQuery('#HelpMenu').hide();
        var popupName = 'AboutResultSummary',
            popupSettings = {
                element: '#popup' + popupName,
                title: Localization.AboutEveryAngle,
                html: '',
                className: 'popup' + popupName,
                buttons: [],
                resizable: false,
                actions: ["Close"],
                scrollable: false,
                animation: false,
                open: function (e) {
                    e.sender.element.busyIndicator(true);
                    self.LoadAboutSystem()
                        .done(function () {
                            self.Data.web_client_version = self.GetWebClientVersion();

                            e.sender.element.html(aboutHtmlTemplate());
                            e.sender.bind('close', function () {
                                jQuery('.k-overlay').off('click.close');
                            });
                            jQuery('.k-overlay').one('click', function () {
                                self.CloseAboutSystemPopup();
                            });
                            WC.HtmlHelper.ApplyKnockout(self.Data, e.sender.element);
                        })
                        .fail(function () {
                            self.CloseAboutSystemPopup();
                        })
                        .always(function () {
                            e.sender.element.busyIndicator(false);
                        });
                },
                close: popup.Destroy
            };

        popup.Show(popupSettings);
    };
    self.CloseAboutSystemPopup = function () {
        popup.Close('#popupAboutResultSummary');
    };

    //EOF: View modle methods

    // call initializing
    self.Initial();
}
AboutSystemHandler.extend(WC.HandlerHelper);

var aboutSystemHandler = new AboutSystemHandler();
