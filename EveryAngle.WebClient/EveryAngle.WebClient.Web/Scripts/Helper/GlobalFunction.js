(function (window) {
    "use strict";

    window.GetImageFolderPath = function () {
        return imageFolderPath.toLowerCase();
    };

    window.GetScriptFolderPath = function () {
        return scriptFolderPath.toLowerCase();
    };

    window.SetLoadingVisibility = function (target, visible) {
        if (visible)
            jQuery(target).show();
        else
            jQuery(target).hide();
    };

    window.SetWebSiteLanguage = function (language) {
        var currentLanguage = '/' + window.webLanguage + '/';
        var newLanguage = '/' + language + '/';
        window.searchPageUrl = window.searchPageUrl.replace(currentLanguage, newLanguage);
        window.anglePageUrl = window.anglePageUrl.replace(currentLanguage, newLanguage);
        window.dashboardPageUrl = window.dashboardPageUrl.replace(currentLanguage, newLanguage);
    };

    window.CheckUILanguage = function (currentLanguage) {
        // get urlLanguage from url
        var urlLanguage = currentLanguage;
        var urlParts = window.location.pathname.split('/');
        var urlPartCount = 0;
        for (var index = urlParts.length - 1; index >= 0; index--) {
            if (urlParts[index])
                urlPartCount++;
            if (urlPartCount === 3) {
                urlLanguage = urlParts[index];
                break;
            }
        };

        // check urlLanguage (url) with currentLanguage (user settings)
        if (currentLanguage !== urlLanguage) {
            // reload if both are not the same
            ReloadWebPage(urlLanguage, currentLanguage);
            return;
        }
    };

    window.ReloadWebPage = function (currentLanguage, newLanguage) {
        currentLanguage = '/' + currentLanguage + '/';
        newLanguage = '/' + newLanguage + '/';

        var pageUrl = window.location.href.replace(currentLanguage, newLanguage);
        if (window.location.href !== pageUrl) {
            window.location.replace(pageUrl);
        }
        else {
            window.location.reload();
        }
    };

})(window);
