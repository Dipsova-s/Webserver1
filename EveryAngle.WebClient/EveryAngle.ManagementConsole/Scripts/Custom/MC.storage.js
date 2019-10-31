(function () {

    var storage = {
        checker: null,
        init: function () {
            jQuery(window).on('storage', MC.storage.changed);
        },
        changed: function (e) {
            if (!window.sessionStateChanged
                && e.originalEvent
                && e.originalEvent.key === window.storagePrefix + 'session_uri') {
                jQuery(window).one('focus', function () {
                    MC.storage.check(e);
                });

                clearTimeout(MC.storage.checker);
                MC.storage.checker = setTimeout(function () {
                    MC.storage.check(e);
                }, 3000);
            }
        },
        check: function (e) {
            clearTimeout(MC.storage.checker);
            if (!e.originalEvent.oldValue) {
                jQuery('#LoginButton').attr('disabled', 'disabled');

                // reload page to get a new info from AS
                document.location.reload();
            }
            else {
                MC.ui.loading.show();
                MC.ui.loading.setError([
                    '<h1>' + Localization.Title_SessionChanged + '</h1>',
                    '<p>' + Localization.Info_SessionChanged + '</p>',
                    '<a class="btn btnReloadSession">' + Localization.Ok + '</a>'
                ].join(''));
                window.sessionStateChanged = true;
                jQuery(MC.ui.loading.loaderCloseButton + ', ' + MC.ui.loading.loader + ' .btnReloadSession').one('click.close', function () {
                    document.location.reload();
                });
            }
        },
        clean: function () {
            jQuery.localStorage.removeItem('business_processes');
            jQuery.localStorage.removeItem('model_privileges');
            jQuery.localStorage.removeItem('models');

            jQuery.localStorage.removeItem('search_facet_cache');
            jQuery.localStorage.removeItem('search_facet_open_panels');
            jQuery.localStorage.removeItem('session');
            jQuery.localStorage.removeItem('session_uri');

            jQuery.localStorage.removeItem('settings');
            jQuery.localStorage.removeItem('system_information');
            jQuery.localStorage.removeItem('system_settings');
            jQuery.localStorage.removeItem('user');
            jQuery.localStorage.removeItem('user_privileges');
        }
    };
    MC.storage = storage;
    MC.storage.init();

})();
