(function (window) {
    "use strict";

    window.SetCookie = function (name, value, path, domain, secure, requireEncoding) {
        //encode
        if (requireEncoding) {
            value = $.base64.encode(value);
        }

        // set cookie
        jQuery.cookie(name, value, { expires: 1, domain : domain, path: path });
    };

    window.GetCookie = function (name, requireEncoding) {
        if (requireEncoding) {
            return $.base64.decode(unescape(jQuery.cookie(name)));
        }
        else {
            return unescape(unescape(jQuery.cookie(name)));
        }
    };

    window.DeleteCookieOnApplicationPath = function (name) {
        var path = rootWebsitePath;

        // Remove trailing '/'
        if (path.endsWith('/') && path.length > 1) {
            path = path.substring(0, path.length - 1);
        }

        window.DeleteCookie(name, path);
    };

    window.DeleteCookie = function (name, path) {
        jQuery.removeCookie(name, { 'path': path });
    };

    window.ClearCookies = function (path) {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var spcook = cookies[i].split("=")[0];
            DeleteCookie(jQuery.trim(spcook), path);
        }
    };

})(window);
