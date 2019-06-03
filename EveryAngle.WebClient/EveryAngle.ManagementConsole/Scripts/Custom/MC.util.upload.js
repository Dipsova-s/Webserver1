(function (win, $) {

    var ajaxUpload = function (form, options) {
        var settings = $.extend({
            loader: true,
            url: $(form).attr('action'),
            secureuri: false,
            formId: form,
            dataType: 'html',
            success: MC.util.ajaxUploadCallback,
            successCallback: MC.ajax.reloadMainContent,
            errorCallback: $.noop,
            complete: MC.util.ajaxUploadComplete,
            completeCallback: $.noop
        }, options);

        MC.util.ajaxUploadStart(settings);
        return $.ajaxFileUpload(settings);
    };

    var ajaxUploadData = function (responseText) {
        if (responseText.indexOf('<pre') !== -1)
            responseText = responseText.replace(/<pre(.*)>(.+)<\/pre>/gi, '$2');
        return $.parseJSON(responseText);
    };

    var ajaxUploadSuccess = function (settings, data) {
        settings.successCallback(data);
    };

    var ajaxUploadError = function (settings, data) {
        var response;
        if (data.message instanceof Object) {
            response = $.extend({
                reason: Localization.MC_ErrorReason,
                message: Localization.MC_ErrorOccured
            }, data.message);
        }
        else {
            try {
                response = JSON.parse(data.message);
            }
            catch (ex) {
                response = {
                    message: data.message,
                    reason: data.status === 400 ? Localization.MC_ErrorReason400 : Localization.MC_ErrorReason
                };
            }
        }
        var xhr = {
            status: data.status || 500,
            responseText: JSON.stringify(response)
        };
        $(document).trigger('ajaxError', [xhr, settings, response.reason]);

        setTimeout(function () {
            settings.errorCallback(xhr);
        }, 100);
    };

    var ajaxUploadStart = function (settings) {
        if (settings.loader) {
            MC.ui.loading.hide(true);
            MC.ui.loading.show();
        }
    };

    var ajaxUploadCallback = function (data) {
        var settings = this;
        try {
            data = ajaxUploadData(data);
        }
        catch (e) {
            data = {
                status: 500,
                message: {
                    reason: Localization.MC_InternalError,
                    message: Localization.MC_ErrorOccured
                }
            };
        }
        if (data.success)
            ajaxUploadSuccess(settings, data);
        else
            ajaxUploadError(settings, data);
    };

    var ajaxUploadComplete = function () {
        var settings = this;
        setTimeout(function () {
            if (settings.loader)
                MC.ui.loading.hide();
            settings.completeCallback();
        }, 100);
    };

    var ajaxUploadClearInput = function (input) {
        input = $(input);
        input.wrap('<form />').closest('form').get(0).reset();
        input.unwrap();
        input.parent().next('span').empty();

        $(window).off('beforeunload');
    };

    var upload = {
        ajaxUpload: ajaxUpload,
        ajaxUploadCallback: ajaxUploadCallback,
        ajaxUploadData: ajaxUploadData,
        ajaxUploadStart: ajaxUploadStart,
        ajaxUploadSuccess: ajaxUploadSuccess,
        ajaxUploadError: ajaxUploadError,
        ajaxUploadComplete: ajaxUploadComplete,
        ajaxUploadClearInput: ajaxUploadClearInput
    };
    $.extend(win.MC.util, upload);

})(window, window.jQuery);