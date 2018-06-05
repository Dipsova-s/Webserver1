// util
MC.util = {
    init: function () {
        MC.addPageReadyFunction(this.window.setSize);
        MC.addPageResizeFunction(this.window.setSize);
        this.window.setSize();
    },
    redirect: function (e, obj) {
        obj = jQuery(obj);
        if (!obj.hasClass('disabled')) {
            location.hash = (obj.data('url') || obj.attr('href')) + '?parameters=' + JSON.stringify(obj.data('parameters'));
        }

        MC.util.preventDefault(e);
    },
    previewImage: function (input, target, defaultImage) {
        jQuery(input).attr('title', input.value);

        if (window.FileReader && input.files && input.files[0]) {
            target.attr('src', defaultImage);

            var reader = new FileReader();
            reader.onload = function (e) {
                target.attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
        else {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var filenameIndex = input.value.lastIndexOf(input.value.indexOf('\\') !== -1 ? '\\' : '\/');
            var filename = input.value.substr(filenameIndex + 1);
            canvas.width = Math.min(200, context.measureText(filename).width + 20);
            canvas.height = 50;
            context.fillText(filename, 10, 10);

            target.attr('src', canvas.toDataURL());
        }
    },
    encodeHtml: function (html) {
        var template = kendo.template('#: html #');
        return template({ html: html });
    },
    decodeHtml: function (text) {
        return $('<div/>', { html: text }).text();
    },
    getController: function (name) {
        if (typeof name !== 'string')
            return jQuery.noop;

        if (name.indexOf('.') === -1)
            return typeof window[name] === 'function' ? window[name] : jQuery.noop;

        var scope = window;
        var scopeSplit = name.split('.');
        for (i = 0; i < scopeSplit.length; i++) {
            scope = scope[scopeSplit[i]];
            if (typeof scope === 'undefined') {
                scope = null;
                break;
            }
        }
        return typeof scope !== 'function' ? jQuery.noop : scope;
    },
    window: {
        width: 0,
        height: 0,
        setSize: function () {
            MC.util.window.width = jQuery(window).width();
            MC.util.window.height = jQuery(window).height();
        }
    },
    loadScript: function (options) {
        var scripts;
        if (options instanceof Array) {
            scripts = options;
        }
        else {
            scripts = [options];
        }

        var scriptCount = scripts.length;
        var scriptOptions = [],
            scriptCount = scripts.length,
            lastSciriptIndex = scriptCount - 1;
        var lastScriptCallback = function () {
            jQuery('#mainContent').removeClass('loadingMainContent');

            if (typeof scripts[lastSciriptIndex].callback == 'function') {
                scripts[lastSciriptIndex].callback();
            }

            if (MC.ajax.isReloadMainContent) {
                setTimeout(function () {
                    MC.form.page.executeStates();
                    MC.form.page.clearStates();
                }, 1);
            }
            else {
                MC.form.page.clearStates();
            }
            setTimeout(function () {
                MC.ajax.isReloadMainContent = false;
            }, 200);
        };

        var lab = $LAB;
        jQuery.each(scripts, function (index, scriptOption) {
            var settings = jQuery.extend({}, { url: '', test: false, callback: jQuery.noop }, scriptOption);
            if (!settings.test) {
                lab = lab.script(settings.url).wait();
            }
        });
        lab.wait(function () {
            lastScriptCallback();
        });
    },
    GUID: function () {
        /// <summary>Generate GUID</summary>
        /// <returns type="String">randomly GUID</returns>

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        function guid() {
            //  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
            return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + new Date().getTime().toString().substring(1));
        }

        if (window.crypto) {
            return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } else {
            return guid();
        }

    },
	hideErrorContainerIfOpenTimePicker: function (element) {
		var timePicker = element.data('kendoTimePicker');

		// prevent this was called during page changing
		if (!timePicker)
			return;

		// hide error on open the time picker
        var timeout;
		timePicker.bind('open', function (e) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                MC.form.validator.hideErrorMessage();
            }, 5);
        });
    },
    setWindowTitle: function (title) {
        $(document).prop('title', title);
    },
    preventDefault: function (e) {
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
    },
    clipboard: function (target) {
        // initial clipboard
        var clipboard = new Clipboard(target);
        var showClipboardPopup = function (e, textDetail) {
            var clipboardText = $(e.trigger).data('clipboard-text');
            var popupDescription = kendo.format('<p>{0}</p><p class=clipboardPopup>{1}</p>', textDetail, clipboardText);
            MC.util.showPopupOK(Localization.MC_CopyCommand, popupDescription);
        };

        // on copy success
        clipboard.on('success', function (e) {
            showClipboardPopup(e, Localization.MC_CopyCommandHelpText);
        });
        // on cannot copy
        clipboard.on('error', function (e) {
            showClipboardPopup(e, Localization.Info_PleaseUseTextBelowToCopy);
        });
    },
    reload: function () {
        location.reload();
    },
    toArray: function (value) {
        /// <summary>convert to array</summary>
        /// <param name="value" type="Object">json string</param>
        /// <returns type="Array"></returns>

        return !value || !jQuery.isArray(JSON.parse(JSON.stringify(value))) ? [] : value;
    },
	getTemplate: function (id, data) {
		var template = kendo.template($('#' + id).html());
		return template(data);
	}
};

MC.util.init();
