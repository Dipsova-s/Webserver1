//this function call when want to set breadcurmbs to view model
var welcomeModel = new WelcomeViewModel();

function WelcomeViewModel() {
    "use strict";

    /*BOF: Model Properties */
    var self = this;
    self.Data = ko.observable(null);
    self.VideoPlayer = null;

    self.Initial = function () {
        errorHandlerModel.Enable(false);
        var requests = self.CreateParallelRequests();
        return jQuery.whenAll(requests)
            .done(self.ParallelRequestsCallback)
            .always(function () {
                setTimeout(function () {
                    errorHandlerModel.Enable(true);
                }, 100);
            });
    };

    self.CreateParallelRequests = function () {
        var deferred = [];
        var directoryUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.WEBCLIENTSETTINGS);

        deferred.pushDeferred(self.LoadWelcomeData, [directoryUri]);
        deferred.pushDeferred(self.LoadMoviesPlayList);

        return deferred;
    };
    self.ParallelRequestsCallback = function (xhrWelcome, xhrMovie) {
        self.SetParallelData(xhrWelcome, xhrMovie);
        
        if (self.IsNoApplyBinding()) {
            self.CreateVideoPlayer();
            self.SetCompanyLogo();
            WC.HtmlHelper.ApplyKnockout(self, self.GetContainerElement());
        }

    };

    self.SetParallelData = function (xhrWelcome, xhrMovie) {
        var data = xhrWelcome[1] === 'success' ? xhrWelcome[0] : {};
        data.videos = xhrMovie[0];
        self.SetData(data);
    };
    self.IsNoApplyBinding = function () {
        return typeof ko.dataFor(self.GetContainerElement().get(0)) === 'undefined';
    };

    self.SetCompanyLogo = function () {
        var data = self.Data();
        if (/(\.jpg|\.jpeg|\.png|\.gif)$/.test(data.companylogo)) {
            jQuery('.sectionWelcomeLogo > img')
                .attr('src', data.companylogo + '?v=' + jQuery.now())
                .error(function () {
                    jQuery(this).removeAttr('src');
                });
        }
        else {
            jQuery('.sectionWelcomeLogo > img').removeAttr('src');
        }
    };

    self.CreateVideoPlayer = function () {
        var videos = self.Data().videos;
        var videoWrapper = jQuery('#WelcomePlayer');

        if (videos.length) {
            var video = '<video id="VideoPlayer" class="video-js vjs-default-skin"></video>';
            var playlist = '<div class="playlist-container"><div class="vjs-playlist"></div></div>';
            var options = { controls: true, autoplay: false, preload: 'auto' };

            videoWrapper.addClass('hasVideo');
            videoWrapper.html(video + playlist);

            self.VideoPlayer = videojs('VideoPlayer', options, function () {
                videoWrapper.removeClass('noVideo');
            });

            self.VideoPlayer.playlist(videos);
            self.VideoPlayer.playlistUi();
        }
        else {
            videoWrapper.addClass('noVideo');
            videoWrapper.text(Localization.WelcomeNoMovie);
        }
    };
    self.StopPlayingVideo = function () {
        if (self.VideoPlayer)
            self.VideoPlayer.pause();
    };

    self.LoadWelcomeData = function (uri) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        return GetDataFromWebService(uri, query);
    };
    self.LoadMoviesPlayList = function () {
        jQuery('#WelcomePlayer').busyIndicator(true);

        var url = 'userapi/getvideos';
        var query = { lang: userSettingModel.Data().default_language };

        return jQuery.when(GetDataFromWebService(url, query, true))
            .then(self.LoadMoviesPlayListCallback.bind(this));
    };
    self.LoadMoviesPlayListCallback = function (videos) {
        jQuery('#WelcomePlayer').busyIndicator(false);
        videos.sortObject('name');

        return jQuery.when(videos);
    };

    self.SetData = function (data) {
        data = ko.toJS(data);

        data.client_details = WC.Utility.ParseJSON(data.client_details);

        // addtional data
        var lastLoginDateText = WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATETIME_WC, userModel.Data().last_logon);
        data.last_logon = lastLoginDateText ? Localization.LastLogin + lastLoginDateText : '';
        self.Data(data);
    };
    self.GetData = function () {
        var data = ko.toJS(self.Data());
        data.client_details = JSON.stringify(data.client_details);

        // clean data
        delete data.last_logon;

        return data;
    };

    self.GetContainerElement = function () {
        return jQuery('#LandingPage');
    };
}
