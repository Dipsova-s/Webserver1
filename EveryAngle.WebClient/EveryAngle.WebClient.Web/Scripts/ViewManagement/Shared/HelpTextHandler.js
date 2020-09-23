function HelpTextModel(model) {
    "use strict";

    jQuery.extend(this, {
        html_help: '',
        id: '',
        long_name: model.id,
        short_name: model.id,
        uri: ''
    }, model);
}

function HelpTextHandler() {
    "use strict";

    //BOF: Properties
    var self = this;

    /*=========== overridable properties =============
    self.Id = null;             [required] use for key in localstorage
    self.ResponseKey = null;    [required] data property in the response
    self.Data = {};             [required] keep data in local
    self.DataKey = 'uri';       [optional] property primary key
    self.Model = null;          [optional] model to handle data
    ==================================================*/
    self.Id = 'help_texts';
    self.ResponseKey = 'help_texts';
    self.Data = {};
    self.DataKey = 'uri';
    self.Model = HelpTextModel;

    /*=============== custom properties ===============*/
    self.HELPTYPE = {
        CLASS: 'class',
        FIELD: 'field',
        FOLLOWUP: 'followup',
        HELPTEXT: 'helptext'
    };
    self.HelpType = null;
    self.Field = {};
    /*================================================*/

    //EOF: Properties

    //BOF: Methods
    /*=========== overridable functions ===============
    self.Initial()                              [void] set data from localStorage
    self.Load(uri, params, [storage=true])      [deferred] load data from service
    self.LoadAll(uri, [options])                [deferred] load all data from service
    self.LoadByIds(uri, ids, query)             [deferred] load data by ids from service
    self.GetDataBy(key, value, modelUri)        [object] get cache data by...
    self.GetData(modelUri)                      [array] get all cache data
    self.SetData(data, [storage=true])          [void] set data to cache
    self.GetModelUriFromData(data)              [string] get model's uri by model data
    ==================================================*/

    /*=============== custom functions ===============*/
    self.Initial = function () {
        self.parent.prototype.Initial.call(self);
        jQuery.each(self.Data, function (_modelUri, data) {
            jQuery.each(data, function (helpTextKey, helpText) {
                if (helpText.uri.indexOf('not_found') !== -1)
                    delete data[helpTextKey];
            });
        });
        jQuery.localStorage(self.Id, self.Data);
    };
    self.Load = function (uri, params, store) {
        var deferred = jQuery.Deferred();
        self.parent.prototype.Load.call(self, uri, params, store)
            .fail(function (xhr, status, error) {
                if (xhr.status === 404) {
                    // something went wrong in AppServer but it will be ok on the next request
                    errorHandlerModel.IgnoreAjaxError(xhr);
                    setTimeout(function () {
                        self.parent.prototype.Load.call(self, uri, params, store)
                            .fail(deferred.reject)
                            .done(deferred.resolve);
                    }, 100);
                }
                else {
                    deferred.reject(xhr, status, error);
                }
            })
            .done(deferred.resolve);
        return deferred.promise();
    };
    self.GetTemplate = function () {
        return [
        '<div class="helpHeaderContainer"></div>',
        '<div class="helpTextContainer"></div>',
        '<div class="helpAdditionalContainer"></div>',
        '<div class="helpObjectId"></div>'
        ].join('');
    };
    self.LoadHelpTextByUri = function (uri) {
        if (!uri)
            return jQuery.when(null);

        var data = self.GetHelpTextByUri(uri);
        if (data) {
            return jQuery.when(data);
        }
        var query = {};
        query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.DETAILS;
        return jQuery.when(GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri), query))
            .done(function (data) {
                self.SetData([data]);
            });
    };
    self.LoadHelpTextByIds = function (ids, modelUri, params) {
        var model = modelsHandler.GetModelByUri(modelUri);
        var helpTextUri;
        if (model) {
            helpTextUri = model.help_texts;
        }
        else {
            helpTextUri = modelUri + '/helptexts';
        }

        var query = {};
        query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.DETAILS;
        jQuery.extend(query, params);

        return self.LoadByIds(helpTextUri, ids, query);
    };
    self.GetHelpTextByUri = function (uri) {
        var queryStringIndex = uri.indexOf('?');
        if (queryStringIndex !== -1) {
            uri = uri.substr(0, queryStringIndex);
        }
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetHelpTextById = function (id, modelUri) {
        var data = self.GetData(modelUri);
        var helpTexts = data.findObjects('id', id, false);
        if (!helpTexts.length)
            return null;
        if (helpTexts.length === 1)
            return helpTexts[0];

        // don't use not_found
        helpTexts = jQuery.grep(helpTexts, function (helpText) {
            return helpText.uri.indexOf('not_found') === -1;
        });
        return helpTexts[0];
    };

    self.ShowHelpTextPopup = function (objectId, helpType, modelUri) {
        if (!objectId)
            return;

        // clean popup
        jQuery('.helpTextPopup .k-window-titlebar > .icon, #helpTextFootNote').remove();
        jQuery('.helpTextPopup .k-window-titlebar .k-window-title').removeAttr('style');

        self.SetHelpSourceField(objectId, helpType, modelUri);

        var title;
        if (helpType === self.HELPTYPE.CLASS) {
            title = Captions.Popup_HelpText_TitleClass;
        }
        else if (helpType === self.HELPTYPE.FOLLOWUP) {
            title = Captions.Popup_HelpText_TitleFollowup;
        }
        else {
            title = Captions.Popup_HelpText_TitleField;
        }

        var popupSettings = {
            title: title,
            element: '#HelpTextPopup',
            html: self.GetTemplate(),
            className: 'helpTextPopup',
            buttons: [
                {
                    text: Localization.Ok,
                    click: function (e) {
                        e.kendoWindow.close();
                        e.stopPropagation();
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            width: 850,
            height: 530,
            modal: true,
            center: true,
            draggable: true,
            open: function (e) {
                // set foot note
                e.sender.wrapper.find('.k-window-buttons-inner').prepend('<div id="helpTextFootNote">' + self.Field.id + '</div>');

                self.SetHelpTextHtml(e.sender.element, modelUri)
                    .always(function () {
                        e.sender.setOptions({
                            title: self.Field.long_name || self.Field.id
                        });
                        e.sender.wrapper.find('.k-i-window-maximize').attr('title', Localization.Maximize);
                        e.sender.wrapper.find('.k-i-close').attr('title', Localization.Close);
                    });
            },
            close: function (e) {
                setTimeout(function () {
                    e.sender.destroy();
                }, 500);
            }
        };

        return popup.Show(popupSettings);
    };
    self.CloseHelpTextPopup = function () {
        popup.Close('.helpTextPopup:visible .k-window-content');
    };
    self.ShowHelpTextInArea = function (objectId, areaSelector, helpType, modelUri) {
        if (!objectId)
            return;

        var target = jQuery(areaSelector);
        if (!target.find('.helpTextContainer').length) {
            target.html(self.GetTemplate());
        }
        self.SetHelpSourceField(objectId, helpType, modelUri);
        jQuery.when(self.SetHelpTextHtml(target, modelUri))
            .always(function () {
                var name = self.Field.long_name || self.Field.id.toUpperCase();
                target.find('.helpTextContainer').prepend('<h4 class="helpNameHeader" title="' + name + '">' + name + '</h4>');
            });
    };
    self.SetHelpSourceField = function (objectId, helpType, modelUri) {
        var field;
        self.HelpType = helpType || null;
        if (self.HelpType === self.HELPTYPE.FIELD) {
            field = modelFieldsHandler.GetFieldById(objectId, modelUri);
        }
        else if (self.HelpType === self.HELPTYPE.FOLLOWUP) {
            field = modelFollowupsHandler.GetFollowupById(objectId, modelUri);
        }
        else if (self.HelpType === self.HELPTYPE.CLASS) {
            field = modelClassesHandler.GetClassById(objectId, modelUri);
        }
        else if (self.HelpType === self.HELPTYPE.HELPTEXT) {
            field = self.GetHelpTextById(objectId, modelUri);
        }

        if (field) {
            self.Field = field;
        }
        else {
            self.Field = {
                id: objectId
            };
        }
    };
    self.SetHelpTextHtml = function (target, modelUri) {
        // M4-11239: New design: Field info pop-up
        target.find('.helpTextContainer, .helpHeaderContainer, .helpAdditionalContainer, .helpObjectId' ).empty();
        if (self.Field.helptext || self.Field.helpid || self.HelpType === self.HELPTYPE.HELPTEXT) {
            var deferred = [];
            if (self.Field.helptext) {
                deferred.pushDeferred(self.LoadHelpTextByUri, [self.Field.helptext]);
            }
            else if (self.Field.helpid) {
                deferred.pushDeferred(self.LoadHelpTextByIds, [[self.Field.helpid], modelUri]);
            }

            if (self.Field.domain) {
                deferred.pushDeferred(modelFieldDomainHandler.LoadFieldDomain, [self.Field.domain]);
            }

            errorHandlerModel.Enable(false);
            return jQuery.whenAll(deferred)
                .fail(function () {
                    target.html('');
                })
                .done(function () {
                    var helpText,
                        helpHeaderText = '';

                    if (self.HelpType === self.HELPTYPE.HELPTEXT) {
                        helpText = self.Field;
                    }
                    else {
                        helpText = self.Field.helptext
                            ? self.GetHelpTextByUri(self.Field.helptext)
                            : self.GetHelpTextById(self.Field.helpid, WC.HtmlHelper.GetModelUriFromMetadataUri(self.Field.uri || ''));
                    }

                    if (self.Field.technical_info) {
                        helpHeaderText += '<p>' + self.Field.technical_info + '</p>';
                    }

                    // M4-11239: New design: Field info pop-up
                    helpHeaderText += '<p>';
                    if (self.HelpType === self.HELPTYPE.FIELD) {
                        var fieldCategoryIcon = fieldCategoryHandler.GetCategoryIconByField(self.Field, false);
                        helpHeaderText += '<img src="' + fieldCategoryIcon.path + '" height="' + fieldCategoryIcon.dimension.height + '" width="' + fieldCategoryIcon.dimension.width + '" />';
                    }
                    helpHeaderText += self.Field.short_name + ' (' + self.Field.long_name + ')';
                    helpHeaderText += '</p>';

                    target.find('.helpHeaderContainer').html(helpHeaderText);
           
                    if (helpText && helpText.html_help) {
                        target.find('.helpTextContainer').html(helpText.html_help);
                        target.find('.helpObjectId').html('<h4>' + self.Field.id + '</h4>');
                        target.find('.helpTextContainer a').each(function () {
                            self.UpdateHelpTextLink(jQuery(this), modelUri);
                        });
                    }

                    if (self.Field.domain) {
                        var domain = modelFieldDomainHandler.GetFieldDomainByUri(self.Field.domain),
                            domainText;
                        if (domain) {
                            domainText = '<h4 class="sectiontitle">Set values:</h4>';
                            domainText += '<ul>';

                            var domainElements = ko.toJS(domain.elements);
                            if (domain.may_be_sorted) {
                                domainElements.sortObject('short_name', enumHandlers.SORTDIRECTION.ASC, false);
                            }
                            jQuery.each(domainElements, function (index, value) {
                                domainText += '<li>' + htmlEncode(value.short_name + ' (' + value.long_name + ')') + '</li>';
                            });
                            domainText += '</ul>';
                            target.find('.helpAdditionalContainer').html(domainText);
                        }
                    }
                })
                .always(function () {
                    setTimeout(function () {
                        errorHandlerModel.Enable(true);
                    }, 200);
                });
        }
        else {
            target.find('.helpTextContainer, .helpHeaderContainer, .helpAdditionalContainer, .helpObjectId').empty();
            target.find('.helpHeaderContainer').html(self.Field.id);
            return jQuery.when(true);
        }
    };
    self.UpdateHelpTextLink = function (link, modelUri) {
        var url = link.attr('href');
        
        if (WC.Utility.IsAbsoluteUrl(url))
            return;
        
        // set link
        var query = jQuery.param({ model: modelUri, id: url });
        link.attr({
            'href': helptextPageUrl + '?' + query,
            'target': '_blank'
        });
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
HelpTextHandler.extend(WC.ModelHandlerHelper);

var helpTextHandler = new HelpTextHandler();
