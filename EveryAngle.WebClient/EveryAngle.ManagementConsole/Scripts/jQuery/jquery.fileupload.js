
jQuery.extend({
    createUploadIframe: function (id, uri) {
        //create frame
        var frameId = 'jUploadFrame' + id;
        var iframeHtml = '<iframe id="' + frameId + '" name="' + frameId + '" style="position:absolute; top:-9999px; left:-9999px"';
        if (window.ActiveXObject) {
            if (typeof uri == 'boolean') {
                iframeHtml += ' src="' + 'javascript:false' + '"';
            }
            else if (typeof uri == 'string') {
                iframeHtml += ' src="' + uri + '"';
            }
        }
        iframeHtml += ' />';
        jQuery(iframeHtml).appendTo(document.body);
        return jQuery('#' + frameId).get(0);
    },
    createUploadForm: function (id, form, data) {
        $(form).attr({ 'enctype': 'multipart/form-data', 'method': 'post' });
        if(!$(form).is('[id]')) $(form).attr('id','jUploadForm'+(id-1));
        if (data) {
        	for (var i in data) {
        		if($(form).find('input[name='+i+']').length==0)
        			jQuery('<input type="hidden" name="' + i + '" value="' + data[i] + '" />').appendTo(form);
        		else
        			$(form).find('input[name='+i+']').val(data[i]);
        	}
        }
        return form;
    },
    createUploadXhr: function (s) {
        var formData = new FormData($(s.formId)[0]);
        /*$(s.formId).find('input:file').each(function (k, v) {
            formData.append(v.name, v.value == '' ? null : v.files[0]);
        });*/

        // if we have post data too
        if (typeof s.data == "object") {
            var key;
            for (key in s.data) {
                formData.append(key, s.data[key]);
            }
        }

        s.cache = false;
        s.type = 'POST';
        s.data = formData;
        s.processData = false;
        s.contentType = false;
        s.xhr = function () {
            var xhr = $.ajaxSettings.xhr(), that = this;
            xhr.upload.addEventListener('progress', function (evt) {
                if (evt.lengthComputable) {
                    evt.percent = Math.floor((evt.loaded / evt.total) * 100);
                    if (typeof that.progress == 'function') that.progress(evt);
                }
            }, false);

            return xhr;
        };
        return $.ajax(s);
    },
    ajaxFileUpload: function (s) {
        var xhr2 = 'FormData' in window;
        // TODO introduce global settings, allowing the client to modify them for all requests, not only timeout		
        s = jQuery.extend({}, jQuery.ajaxSettings, s);
        if (typeof s.forceIframe == 'undefined') s.forceIframe = false;

        if (xhr2 && !s.forceIframe) {
            return jQuery.createUploadXhr(s);
        }
        else {
            var id = new Date().getTime();
            var form = jQuery.createUploadForm(id, s.formId, (typeof (s.data) == 'undefined' ? false : s.data));
            //var form = jQuery.createUploadForm(id, s.fileElementId, (typeof (s.data) == 'undefined' ? false : s.data));
            var io = jQuery.createUploadIframe(id, s.secureuri);
            var frameId = 'jUploadFrame' + id;
            var formId = $(form).attr('id');
            var newFrom = formId == 'jUploadForm' + id;
            // Watch for a new set of requests
            if (s.global && !jQuery.active++) {
                jQuery.event.trigger("ajaxStart");
            }
            var requestDone = false;
            // Create the request object
            var xml = {}
            if (s.global)
                jQuery.event.trigger("ajaxSend", [xml, s]);
            // Wait for a response to come back
            var uploadCallback = function (isTimeout) {
                var io = document.getElementById(frameId);
                try {
                    if (io.contentWindow) {
                        xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
                        xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;

                    } else if (io.contentDocument) {
                        xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
                        xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
                    }
                } catch (e) {
                    //throw e;
                    jQuery.event.trigger("ajaxError", [s, xml, null, e]);
                    //jQuery.handleError(s, xml, null, e);
                }

                if (xml || isTimeout == "timeout") {
                    requestDone = true;
                    var status;
                    try {
                        status = isTimeout != "timeout" ? "success" : "error";
                        // Make sure that the request was successful or notmodified
                        if (status != "error") {
                            // process the data (runs the xml through httpData regardless of callback)
                            var data = jQuery.uploadHttpData(xml, s.dataType);
                            // If a local callback was specified, fire it and pass it the data
                            if (s.success)
                                s.success(data, status);

                            // Fire the global callback
                            if (s.global)
                                jQuery.event.trigger("ajaxSuccess", [xml, s]);
                        } else {
                            jQuery.event.trigger("ajaxError", [s, xml, status]);
                            //throw e;
                            //jQuery.handleError(s, xml, status);
                        }
                    } catch (e) {
                        status = "error";
                        jQuery.event.trigger("ajaxError", [s, xml, status, e]);
                        //throw e;
                        //jQuery.handleError(s, xml, status, e);
                    }

                    // The request was completed
                    if (s.global)
                        jQuery.event.trigger("ajaxComplete", [xml, s]);

                    // Handle the global AJAX counter
                    if (s.global && ! --jQuery.active)
                        jQuery.event.trigger("ajaxStop");

                    // Process result
                    if (s.complete)
                        s.complete(xml, status);

                    jQuery(io).unbind();

                    setTimeout(function () {
                        try {
                            jQuery(io).remove();
                            if (newFrom) jQuery(form).remove();
                        } catch (e) {
                            //throw e;
                            jQuery.event.trigger("ajaxError", [s, xml, 'error', e]);
                            //jQuery.handleError(s, xml, null, e);
                        }

                    }, 100);

                    xml = null;

                }
            }
            // Timeout checker
            if (s.timeout > 0) {
                setTimeout(function () {
                    // Check to see if the request is still happening
                    if (!requestDone) uploadCallback("timeout");
                }, s.timeout);
            }
            try {
                var form = jQuery('#' + formId);
                jQuery(form).attr('action', s.url);
                jQuery(form).attr('method', 'POST');
                jQuery(form).attr('target', frameId);
                if (form.encoding) {
                    jQuery(form).attr('encoding', 'multipart/form-data');
                }
                else {
                    jQuery(form).attr('enctype', 'multipart/form-data');
                }
                jQuery(form).submit();

            } catch (e) {
                throw e;
                //jQuery.handleError(s, xml, null, e);
            }

            jQuery('#' + frameId).load(uploadCallback);
            return {
                abort: function () {
                    if (s.complete)
                        s.complete(xml, 'abort');

                    jQuery('#' + frameId).remove();
                    if (newFrom) jQuery('#' + formId).remove();

                    if (window.stop) window.stop();
                    else if (document.execCommand) document.execCommand('Stop');
                }
            };
        }
    },
    uploadHttpData: function (r, type) {
        var data = !type;
        data = type == "xml" || data ? r.responseXML : r.responseText;
        // If the type is "script", eval it in global context
        if (type == "script")
            jQuery.globalEval(data);
        // Get the JavaScript object, if JSON is used.
        if (type == "json") {
            if (data.indexOf('<pre') != -1) data = data.replace(/<pre(.*)>(.+)<\/pre>/gi, '$2');
            data = eval('('+data+')');
        }
        // evaluate scripts within html
        //if (type == "html")
        //    jQuery("<div>").html(data).evalScripts();

        return data;
    }
})

