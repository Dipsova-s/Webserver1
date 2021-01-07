(function (window) {
    "use strict";

    if (window.Storage) {
        jQuery.extend(jQuery, {
            storageWatcher: function (key, value) {
                if (arguments.length === 1) {
                    return jQuery.localStorage(key);
                }
                else {
                    if (typeof value === 'undefined')
                        jQuery.localStorage.removeItem(key);
                    else
                        jQuery.localStorage(key, value);
                }
            }
        });

        var storageWatcherPrefix = '__watcher_';
        var fnCheckSessionChange;
        var checkSessionChange = function (e) {
            clearTimeout(fnCheckSessionChange);

            if (e.originalEvent.oldValue) {
                window.sessionStateChanged = true;
                popup.Alert(Localization.Title_SessionChanged, Localization.Info_SessionChanged);
                popup.OnCloseCallback = function () {
                    document.location.reload();
                };
            }
        };
        var isStorageWatcher = function (e) {
            return e && e.originalEvent && e.originalEvent.key && e.originalEvent.key.indexOf(storageWatcherPrefix) !== -1;
        };
        var triggerWatcher = function (e) {
            if (!jQuery.browser.msie && isStorageWatcher(e)) {
                if (typeof searchPageHandler !== 'undefined' && searchPageHandler.TriggerWatcher) {
                    searchPageHandler.TriggerWatcher(e.originalEvent);
                }
                else if (typeof anglePageHandler !== 'undefined' && anglePageHandler.TriggerWatcher) {
                    anglePageHandler.TriggerWatcher(e.originalEvent);
                }
                else if (typeof dashboardPageHandler !== 'undefined' && dashboardPageHandler.TriggerWatcher) {
                    dashboardPageHandler.TriggerWatcher(e.originalEvent);
                }
            }
        };
        jQuery(window).on('storage', function (e) {
            if (!window.sessionStateChanged) {
                if (e.originalEvent && e.originalEvent.key === window.storagePrefix + 'session_uri') {
                    jQuery(window).one('focus', function () {
                        checkSessionChange(e);
                    });

                    clearTimeout(fnCheckSessionChange);
                    fnCheckSessionChange = setTimeout(function () {
                        checkSessionChange(e);
                    }, 3000);
                }
                // M4-34412 if user has change the user settings then reload the whole page
                else if (e.originalEvent && e.originalEvent.key === window.storagePrefix + 'user_settings_has_changed' && e.originalEvent.newValue === 'true') {
                    jQuery.localStorage.removeItem('user_settings_has_changed');
                    document.location.reload();
                }
                else {
                    triggerWatcher(e);
                }
            }
        });
    }

})(window);
