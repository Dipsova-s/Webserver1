var angleCopyHandler = new AngleCopyHandler();

function AngleCopyHandler() {
    "use strict";

    var self = this;

    // BOF: Properties
    self.Template = [
        '<div class="popupAngleCopyContainer">',
        '<div class="copyAngleLabel"></div>',
        '<div class="k-dropdown" id="ddlModelCopyAngle"></div>',
        '</div>'
    ].join('');
    self.Angles = [];
    // EOF: Properties

    // BOF: Methods
    self.ShowAngleCopyPopup = function () {
        self.Angles = [];
        jQuery.each(searchModel.SelectedItems(), function (index, item) {
            if (item && item.type === enumHandlers.ITEMTYPE.ANGLE) {
                self.Angles.push(ko.toJS(item));
            }
        });

        if (!self.Angles.length) {
            popup.Alert(Localization.Warning_Title, Localization.Info_OnlyAngleAreAllowedToCreateACopy);
            return;
        }

        var popupName = 'AngleCopy',
            popupSettings = {
                title: Localization.CopyAngle,
                html: self.Template,
                element: '#popup' + popupName,
                className: 'popup' + popupName,
                resizable: false,
                actions: ["Close"],
                open: function (e) {
                    self.ShowAngleCopyPopupCallback(e);
                },
                close: function (e) {
                    e.sender.destroy();
                },
                buttons: [
                    {
                        text: Captions.Button_Cancel,
                        position: 'right',
                        className: 'executing',
                        click: 'close',
                        isSecondary: true
                    },
                    {
                        text: Localization.Save,
                        position: 'right',
                        className: 'executing',
                        isPrimary: true,
                        click: function (e, obj) {
                            if (popup.CanButtonExecute(obj)) {
                                self.CopyAngles();
                            }
                        }
                    }
                ]
            };

        popup.Show(popupSettings);
    };
    self.ShowAngleCopyPopupCallback = function (e) {
        e.sender.element.find('.copyAngleLabel').html(kendo.format(Localization.CopyAngleLabel, self.Angles.length));

        // models dropdownlist
        var element = '#ddlModelCopyAngle';
        var availableModels = [
            {
                uri: '',
                short_name: Localization.NoModelAvaliable
            }
        ];
        var dropdownlistOptions = {
            dataTextField: 'short_name',
            dataValueField: 'uri',
            enabled: false
        };

        if (!modelsHandler.HasData()) {
            WC.HtmlHelper.DropdownList(element, availableModels, dropdownlistOptions);
            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
        }
        else {
            var dropdownlist = WC.HtmlHelper.DropdownList(element, [], dropdownlistOptions);

            /* M4-9848: Removed validate unavailable models in copy to model drop-down list */
            var models = modelsHandler.GetData();

            // if has instances then show model in dropdown
            if (models.length) {
                availableModels = ko.toJS(models);
                dropdownlist.enable(true);

                e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
            }
            dropdownlist.setDataSource(availableModels);
            dropdownlist.value(modelsHandler.GetDefaultModel().uri);
        }
    };
    self.CloseAngleCopyPopup = function () {
        popup.Close('#popupAngleCopy');
    };
    self.GetCopyAngleData = function (angle, modelUri) {
        var defaultdisplay = angle.angle_default_display;
        if (angle.model === modelUri) {
            jQuery.each(angle.multi_lang_name, function (index, name) {
                /* M4-13329: Fixed naming of copied angles are inconsistent */
                name.text = name.text.substr(0, 248) + ' (copy)';
            });
        }
        angle.angle_default_display = '';
        angle.id = 'a' + jQuery.GUID().replace(/-/g, '');
        angle.model = modelUri;
        angle.is_validated = false;
        angle.is_published = false;
        if (angle.user_specific) {
            angle.user_specific.is_starred = false;
        }

        jQuery.each(angle.display_definitions, function (index, display) {
            display.is_public = false;
            if (defaultdisplay === display.uri) {
                angle.angle_default_display = display.id;
            }

            angle.display_definitions[index] = displayModel.DeleteReadOnlyDisplayProperties(display);
        });

        if (!angle.angle_default_display && angle.display_definitions.length) {
            angle.angle_default_display = angle.display_definitions[0].id;
        }

        return angleInfoModel.DeleteReadOnlyAngleProperties(angle);
    };

    self.CopyAngles = function () {
        var isCancel = false;
        var canCancel = false;
        var angleDeferred = [];
        var angleCopyPerSession = 5;
        var angleData = self.Angles.slice();
        var modelUri = WC.HtmlHelper.DropdownList('#ddlModelCopyAngle').value();
        var angleUri = modelUri + '/angles';
        var reports = {
            get_done: [],
            get_error: [],
            post_error: [],
            post_done: []
        };
        var fnCheckCancelAbort;

        var getAngleName = function (angle) {
            return angle.name || WC.Utility.GetDefaultMultiLangText(angle.multi_lang_name);
        };
        var showCopyAnglesReport = function () {
            var message = '';
            message += '<strong>' + kendo.format(Localization.CopyAngleReportHeader, reports.post_done.length, self.Angles.length) + '</strong><br />';
            jQuery.each(reports.post_done, function (index, angle) {
                message += '- ' + getAngleName(angle) + ' - <em class="ok">' + Localization.Successful + '</em><br/>';
            });
            if (reports.get_error.length) {
                jQuery.each(reports.get_error, function (index, error) {
                    message += '- ' + error.angle.name + ' - <em>' + htmlEncode(error.response.reason + ', ' + error.response.message) + '</em><br/>';
                });
            }
            if (reports.post_error.length) {
                jQuery.each(reports.post_error, function (index, error) {
                    var msg = error.response.message;
                    var htmlMsg = jQuery('<div />', { html: msg }).find('strong');
                    if (htmlMsg.length) {
                        msg = jQuery.trim(htmlMsg.text());
                    }
                    message += '- ' + getAngleName(error.angle) + ' - <em>' + htmlEncode(error.response.reason === msg ? msg : error.response.reason + ', ' + msg) + '</em><br/>';
                });
            }

            self.ShowCopyAngleReportPopup(message);

            progressbarModel.EndProgressBar();

            searchModel.ClearSelectedRow();

            setTimeout(function () {
                searchPageHandler.BindSearchResultGrid(0);
            }, 500);
        };
        var updateCreateAngleProgress = function () {
            if (!isCancel || canCancel) {
                var angleCount = self.Angles.length;
                var currentAngleCount = reports.post_done.length;
                progressbarModel.SetProgressBarText((currentAngleCount / angleCount * 100).toFixed(2), currentAngleCount + '/' + angleCount, Localization.ProgressBar_CopyingAngles);
            }
        };
        var createCopyAngle = function (angle) {
            var params = {};
            params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
            params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
            params[enumHandlers.PARAMETERS.REDIRECT] = 'no';
            return CreateDataToWebService(angleUri + '?' + jQuery.param(params), angle)
                .fail(function (xhr, status, error) {
                    var response = WC.Utility.ParseJSON(xhr.responseText, { reason: status, message: error });
                    reports.post_error.push({ angle: angle, response: response });
                })
                .done(function (data) {
                    reports.post_done.push(data);
                })
                .always(function () {
                    updateCreateAngleProgress();
                });
        };
        var copyAngle = function (angle, isBeginSession) {
            if (isCancel && isBeginSession)
                canCancel = true;

            var angleParams = {};
            angleParams[enumHandlers.PARAMETERS.CACHING] = false;
            angleParams[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';

            var cancelling = isCancel && canCancel;
            var hasDisplay = angle.displays && angle.displays.length;
            return jQuery.when(
                    cancelling
                    ? jQuery.Deferred().reject({}, Localization.AbortStatus, Localization.CancelledByUser)
                    : hasDisplay
                        ? GetDataFromWebService(angle.uri, angleParams)
                        : jQuery.Deferred().reject({ responseText: JSON.stringify({ reason: Localization.ErrorAngleNoDisplay, message: Localization.ErrorAngleNoDisplayReason }) })
                )
                .fail(function (xhr, status, error) {
                    var response = WC.Utility.ParseJSON(xhr.responseText, { reason: status, message: error });
                    reports.post_error.push({ angle: angle, response: response });
                })
                .then(function (angle) {
                    reports.get_done.push(angle);

                    angle = self.GetCopyAngleData(angle, modelUri);

                    return createCopyAngle(angle);
                });
        };

        self.Angles = [];
        jQuery.each(angleData, function (index, angle) {
            angleDeferred.pushDeferred(copyAngle, [angle, index % angleCopyPerSession === 0]);
            self.Angles.push(angle);
        });

        self.CloseAngleCopyPopup();
        errorHandlerModel.Enable(false);
        progressbarModel.ShowStartProgressBar();
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Cancelling);
            progressbarModel.SetDisableProgressBar();
            isCancel = true;

            fnCheckCancelAbort = setTimeout(function () {
                WC.Ajax.AbortAll();
            }, 5000);

            return true;
        };

        jQuery.whenAllSet(angleDeferred, angleCopyPerSession)
            .always(function () {
                clearTimeout(fnCheckCancelAbort);
                setTimeout(function () {
                    errorHandlerModel.Enable(true);
                    showCopyAnglesReport();
                }, 500);
            });
    };
    self.ShowCopyAngleReportPopup = function (message) {
        var popupName = 'Report',
            popupSettings = {
                title: Localization.CopyAngleReport,
                element: '#popup' + popupName,
                className: 'popup' + popupName,
                actions: [],
                buttons: [
                    {
                        text: Localization.Ok,
                        position: 'right',
                        isPrimary: true,
                        click: 'close'
                    }
                ]
            };

        var win = popup.Show(popupSettings);
        win.content(message);
        win.center();
    };
    // EOF: Methods
}
