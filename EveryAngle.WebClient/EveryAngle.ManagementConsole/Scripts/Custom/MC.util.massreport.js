(function (win) {

    var massReport = {
        template: {
            done: '<li class="success">{0}: {1}</li>',
            fail: '<li class="fail">{0}: {1}</li>',
            status: '{0}: {1}<br/>{2}'
        },
        element: null,
        reports: [],
        initial: function () {
            MC.ui.loading.handleByUser = true;
            MC.ui.loading.show();
            MC.ui.loading.setLoader('loadingWithText');
            MC.util.massReport.element = jQuery('#loading .loadingContentText');
            MC.util.massReport.reports = [];
        },
        start: function (requests, callback, count) {
            MC.util.massReport.initial();

            if (typeof count != 'number') count = 6;
            var isCustomDeferrred = requests.length && typeof requests[0] == 'object' && typeof requests[0].fn == 'function';
            if (isCustomDeferrred) {
                var sendAync = function () {
                    return jQuery.when.apply(jQuery, jQuery.map(requests.splice(0, count), function (d) {
                        var wrapDeferred = jQuery.Deferred();
                        jQuery.when(d.fn.apply(this, d.args))
                            .always(function () { wrapDeferred.resolve(Array.prototype.slice.call(arguments)); });
                        return wrapDeferred.promise();
                    }))
                    .then(function () {
                        if (requests.length) {
                            return sendAync();
                        }
                        else {
                            return jQuery.when(true);
                        }
                    });
                };

                return jQuery.when(sendAync())
                    .always(function () {
                        callback();
                    });
            }
            else {
                return $.when.apply($, requests)
                    .always(function () {
                        callback();
                    });
            }
        }, createMessage: function (title, detail) {
            var xhr = {
                responseText: JSON.stringify({
                    reason: title,
                    message: detail
                })
            };
            return MC.ajax.getErrorMessage(xhr, null, title);
        },
        setStatus: function (label, what, statusText) {
            MC.util.massReport.element.html(kendo.format(MC.util.massReport.template.status, label, what, statusText));
        },
        setReport: function (reportIndex, isDone, what, text) {
            if (isDone) {
                MC.util.massReport.reports[reportIndex] = kendo.format(MC.util.massReport.template.done, what, Localization.MC_SuccessLowerCase);
            }
            else {
                MC.util.massReport.reports[reportIndex] = kendo.format(MC.util.massReport.template.fail, what, text);
            }
        },
        onDone: function (args, deferred, label, what, reportIndex) {
            MC.util.massReport.setStatus(label, what, Localization.MC_SuccessLowerCase);
            MC.util.massReport.setReport(reportIndex, true, what);

            deferred.resolve();
        },
        onFail: function (args, deferred, label, what, reportIndex) {
            MC.util.massReport.setStatus(label, what, 'fail');

            var message = MC.ajax.getErrorMessage(args[0], null, args[2]);
            MC.util.massReport.setReport(reportIndex, false, what, jQuery(message).filter('p').text());

            MC.ajax.setErrorDisable(args[0], args[1], args[2], deferred);
        },
        showReport: function (reportTitle, onClose) {
            var msg = MC.util.massReport.createMessage(reportTitle, '');
            msg = msg.replace('<p></p>', '<ul>' + MC.util.massReport.reports.join('') + '</ul>');
            MC.ui.loading.setInfo(msg);
            $('#loading .loadingClose').off('click.close').on('click.close', function () {
                if (typeof onClose == 'function') {
                    onClose();
                }
                else {
                    MC.ajax.reloadMainContent();
                }
            });
        },
        closeReport: function () {
            jQuery('.loadingClose').trigger('click');
        }
    };

    win.MC.util.massReport = massReport;

})(window);