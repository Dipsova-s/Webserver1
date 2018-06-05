//this function call when want to set breadcurmbs to view model
var welcomeModel = new WelcomeViewModel();

function WelcomeViewModel() {
    "use strict";

    /*BOF: Model Properties */
    var self = this;
    self.Data = ko.observable(null);
    self.PRIVILEGETYPE = {
        POWER: 'power',
        VIEWING: 'viewing'
    };
    self.MoviesCache = {};
    self.MoviesCache[self.PRIVILEGETYPE.POWER] = {};
    self.MoviesCache[self.PRIVILEGETYPE.VIEWING] = {};

    self.Initial = function () {
        var directoryUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.WEBCLIENTSETTINGS),
            moviePlayer = jwplayer('#WelcomePlayer');

        if (!directoryUri || self.Data()) {
            if (moviePlayer.id) {
                var randomMovieIndex = Math.floor(Math.random() * moviePlayer.getPlaylist().length);
                moviePlayer.playlistItem(randomMovieIndex).play();
            }
            return jQuery.when();
        }

        // jwplayer key
        jwplayer.key = jwplayerKey;

        // initial bp
        businessProcessesModel.WelcomeMovie = new BusinessProcessesViewModel();
        businessProcessesModel.WelcomeMovie.MultipleActive(false);
        businessProcessesModel.WelcomeMovie.CanEmpty(false);
        businessProcessesModel.WelcomeMovie.ClickCallback(self.BPMovieClickCallback);
        var bpDefault = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES).slice();
        if (!bpDefault.length) {
            bpDefault = [businessProcessesModel.WelcomeMovie.Data()[0].id];
        }
        var bpCurrentActive = {};
        jQuery.each(bpDefault, function (index, bp) {
            // check is_allowed then add to bpCurrentActive
            var bpObject = businessProcessesModel.WelcomeMovie.Data().findObject('id', bp, false);
            if (bpObject && bpObject.is_allowed) {
                bpCurrentActive[bp] = true;

                // select only 1
                return false;
            }
        });
        businessProcessesModel.WelcomeMovie.CurrentActive(bpCurrentActive);
        businessProcessesModel.WelcomeMovie.ApplyHandler('#WelcomeMovieBusinessProcesses');

        var deferred = [];
        deferred.pushDeferred(self.LoadWelcomeData, [directoryUri]);
        deferred.pushDeferred(self.LoadMoviesPlayList);

        errorHandlerModel.Enable(false);
        return jQuery.whenAll(deferred)
            .done(function (xhrWelcome, xhrMovie) {
                setTimeout(function () {
                    errorHandlerModel.Enable(true);
                }, 100);

                var dataWelcome = xhrWelcome[1] === 'success' ? xhrWelcome[0] : {};
                var playlist = xhrMovie[0];
                dataWelcome.movies = playlist;
                self.SetData(dataWelcome);

                if (typeof ko.dataFor(jQuery('#LandingPage').get(0)) === 'undefined') {
                    self.GenerateMovieFromPlayList(playlist);

                    if (/(\.jpg|\.jpeg|\.png|\.gif)$/.test(dataWelcome.companylogo)) {
                        jQuery('.sectionWelcomeLogo > img')
                            .attr('src', dataWelcome.companylogo + '?v=' + jQuery.now())
                            .error(function () {
                                jQuery(this).removeAttr('src');
                            });
                    }
                    else {
                        jQuery('.sectionWelcomeLogo > img').removeAttr('src');
                    }

                    WC.HtmlHelper.ApplyKnockout(self, jQuery('#LandingPage'));
                }
            });
    };

    self.BPMovieClickCallback = function (data, event, changed) {
        if (changed) {
            WC.Ajax.AbortAll();
            self.LoadMoviesPlayList()
                .done(function (playlist) {
                    self.GenerateMovieFromPlayList(playlist);
                });
        }
    };

    self.LoadWelcomeData = function (uri) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        return GetDataFromWebService(uri, query);
    };

    self.LoadMoviesPlayList = function () {
        var type = privilegesViewModel.IsAllowCreateAngle() ? self.PRIVILEGETYPE.POWER : self.PRIVILEGETYPE.VIEWING;
        var query = {};
        var bps = ['*'];
        query['bp'] = bps.join(',');
        query['type'] = type;
        query['lang'] = userSettingModel.Data().default_language;

        jQuery('#WelcomePlayer').busyIndicator(true);

        return jQuery.when(
            self.GetMoviesPlayListFromLocal(type, bps)
            || GetDataFromWebService('userapi/getmoviebyusertype', query, true))
            .then(function (data, status, xhr) {
                jQuery('#WelcomePlayer').busyIndicator(false);

                data.sortObject('name');

                jQuery.each(bps, function (index, bp) {
                    bp = bp.toLowerCase();
                    self.MoviesCache[type][bp] = [];
                });

                var playlist = [];
                jQuery.each(data, function (index, movie) {
                    if (/(\.mp4)$/.test(movie.source)) {
                        var bp = '*';
                        self.MoviesCache[type][bp].push(movie);

                        playlist.push({
                            title: movie.name,
                            description: movie.description || '',
                            file: movie.source,
                            image: movie.poster || ''
                        });
                    }
                });
                
                return jQuery.when(playlist.slice());
            });
    };

    self.GetMoviesPlayListFromLocal = function (type, bps) {
        var playlist = [], isFoundAll = true;
        jQuery.each(bps, function (index, bp) {
            bp = bp.toLowerCase();
            if (!self.MoviesCache[type][bp]) {
                isFoundAll = false;
                return false;
            }
            else {
                jQuery.merge(playlist, self.MoviesCache[type][bp]);
            }
        });

        return isFoundAll ? playlist : null;
    };

    self.GenerateMovieFromPlayList = function (playlist) {
        var player = jwplayer('WelcomePlayer');
        if (player.stop) player.stop();
        if (player.remove) player.remove();
        jQuery('#WelcomePlayer').addClass('welcomeMovie noVideo');

        if (playlist.length) {
            jwplayer('WelcomePlayer').setup({
                flashplayer: GetScriptFolderPath() + "videoplayer/jwplayer.flash.swf",
                html5player: GetScriptFolderPath() + "videoplayer/jwplayer.html5.js",
                skin: GetScriptFolderPath() + "videoplayer/skin/six.xml",
                repeat: false,
                autostart: false,
                height: 310,
                width: '100%',
                playlist: playlist,
                listbar: {
                    position: 'right',
                    size: 240
                },
                onReady: function () {
                    jQuery('#WelcomePlayer').removeClass('noVideo');
                },
                events: {
                    onBeforeComplete: function () {
                        this.stop();
                    }
                }
            });
        }
        else {
            jQuery('#WelcomePlayer').text(Localization.WelcomeNoMovie);
        }
    };

    self.StopPlayingVideo = function () {
        var moviePlayer = jwplayer('WelcomePlayer');
        if (moviePlayer.stop) {
            moviePlayer.stop();
        }
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
}
