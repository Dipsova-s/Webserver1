function HelpPopupPageHandler() {
    "use strict";

    var self = this;
    self.CurrentModelId = null;
    self.IsRefreshModel = false;

    self.ShowModelParameterPopup = function () {
        requestHistoryModel.SaveLastExecute(self, self.ShowModelParameterPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        var defaultModel = modelsHandler.GetDefaultModel();

        self.IsRefreshModel = false;
        self.CurrentModelId = defaultModel.id;

        var modelServerSettingsUri = defaultModel.modelserver_settings;
        var popupName = 'ModelParameters',
            popupSettings = {
                title: Captions.Popup_ModelParameters_Title,
                element: '#popup' + popupName,
                content: WC.HtmlHelper.GetInternalApiUri('GetModelParameter', 'api/helpapi', { modelServerSettingsUri: modelServerSettingsUri }),
                className: 'popup' + popupName,
                width: 600,
                height: 530,
                buttons: [
                    {
                        text: Localization.Ok,
                        click: 'close',
                        isPrimary: true,
                        position: 'right'
                    }
                ],
                error: function (e) {
                    if (e.xhr && e.xhr.status === 401) {
                        WC.Authentication.ClearAuthorizedDat(true);
                    }
                },
                refresh: function (e) {
                    WC.HtmlHelper.DropdownList('#ModelsDropdownList', [], {
                        dataTextField: 'short_name',
                        dataValueField: 'id',
                        enable: false,
                        value: null,
                        change: function (ddl) {
                            self.CurrentModelId = ddl.sender.value();
                            ddl.sender.enable(false);
                            var helpPopup = jQuery('#popupModelParameters').data(enumHandlers.KENDOUITYPE.WINDOW);
                            helpPopup.element.busyIndicator(true).find('.k-loading-mask').css({ left: 8, top: 8 });
                            helpPopup.options.content.url = WC.HtmlHelper.GetInternalApiUri('GetModelParameter', 'help', { modelServerSettingsUri: ddl.sender.dataItem().modelserver_settings });
                            helpPopup.refresh();
                        }
                    });

                    if (!self.IsRefreshModel) {
                        errorHandlerModel.Enable(true);
                        jQuery.when(modelsHandler.LoadModels(true))
                            .then(function () {
                                return modelsHandler.LoadModelsInfo();
                            })
                            .then(function () {
                                var deferred = [];
                                modelsHandler.DataModelServer = [];
                                jQuery.each(modelsHandler.Data, function (key, model) {
                                    deferred.pushDeferred(modelsHandler.LoadModelServer, [model.servers]);
                                });
                                return jQuery.whenAll(deferred);
                            })
                            .always(function () {
                                errorHandlerModel.Enable(false);

                                self.IsRefreshModel = true;
                                self.CreateModelDropdownList();
                            });
                    }
                    else {
                        self.CreateModelDropdownList();
                    }


                    // set format
                    e.sender.element.find('.fieldValue').each(function (index, valueElement) {
                        valueElement = jQuery(valueElement);

                        var value = jQuery.trim(valueElement.text());
                        var formatter;
                        if (valueElement.hasClass(enumHandlers.FIELDTYPE.INTEGER)) {
                            formatter = new Formatter({ prefix: false }, enumHandlers.FIELDTYPE.INTEGER);
                            valueElement.text(WC.FormatHelper.GetFormattedValue(formatter, value));
                        }
                        else if (valueElement.hasClass(enumHandlers.FIELDTYPE.DOUBLE)) {
                            formatter = new Formatter({ prefix: false }, enumHandlers.FIELDTYPE.DOUBLE);
                            valueElement.text(WC.FormatHelper.GetFormattedValue(formatter, value));
                        }
                        else if (valueElement.hasClass(enumHandlers.FIELDTYPE.PERCENTAGE)) {
                            formatter = new Formatter({ prefix: false }, enumHandlers.FIELDTYPE.PERCENTAGE);
                            valueElement.text(WC.FormatHelper.GetFormattedValue(formatter, value));
                        }
                        else if (valueElement.hasClass(enumHandlers.FIELDTYPE.DATE) && value) {
                            var strDate = value.substr(0, 4) + '/' + value.substr(4, 2) + '/' + value.substr(6, 2);
                            valueElement.text(WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATE, strDate));
                        }
                    });
                },
                close: function (e) {
                    e.sender.destroy();
                }
            };

        jQuery(document).trigger('click');
        popup.Show(popupSettings);

    };
    self.CreateModelDropdownList = function () {
        var hanaServerInfo = modelsHandler.DataModelServer.findObject('type', 'HanaServer');
        var hanaModelUri = hanaServerInfo ? hanaServerInfo.model : '';
        var models = modelsHandler.GetAvailabelModels(function (modelUri) {
            return modelUri !== hanaModelUri;
        });
        if (!models.length) {
            models.push({
                id: '',
                short_name: Localization.NoModelAvaliable
            });
        }

        var ddlModel = WC.HtmlHelper.DropdownList('#ModelsDropdownList');
        if (ddlModel) {
            ddlModel.setDataSource(ko.toJS(models));
            ddlModel.enable(!!models[0].id);
            ddlModel.value(self.CurrentModelId);
        }
    };

    self.ShowDescriptionPopup = function (obj) {
        var popupName = 'ModelParametersHelp',
            popupSettings = {
                title: 'Model parameter description',
                element: '#popup' + popupName,
                html: '',
                className: 'popup' + popupName,
                width: 600,
                height: 300,
                buttons: [
                    {
                        text: Localization.Ok,
                        click: 'close',
                        isPrimary: true,
                        position: 'right'
                    }
                ],
                open: function (e) {
                    e.sender.element.html(jQuery(obj).next('textarea').val());
                }
            };

        popup.Show(popupSettings);
    };
}

var helpPopupPageHandler = new HelpPopupPageHandler();
