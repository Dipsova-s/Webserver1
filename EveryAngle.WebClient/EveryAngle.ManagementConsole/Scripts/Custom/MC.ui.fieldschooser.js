(function (win, $) {

    var fnCheckFieldChooserLoaded;

    var bindDataGridStart = function () {
        var self = this;
        self.OnGridSelectionChanged([]);
    };

    var getDataFail = function (xhr, status, error) {
        if (status !== 'abort') {
            var win = jQuery('#popupFieldChooser').data('kendoWindow');
            if (win) win.close();
        }
    };

    var getFieldsFunction = function (uri, params, callback) {
        var self = this;
        disableLoading();
        return MC.ajax
            .request({
                url: self.GetFieldsUri + '?fieldsUri=' + escape(uri + (uri.indexOf('?') === -1 ? '?' : '&') + jQuery.param(params))
            })
            .fail(getDataFail)
            .done(function (data) {
                callback(data);
            });
    };

    var setFieldsFunction = function (result) {
        var grid = jQuery('#DisplayPropertiesGrid').data('kendoGrid');
        if (grid)
            grid.table.focus();

        jQuery.each(result.fields, function (index, field) {
            if (!field.source)
                field.source = 'all';
            if (!field.technical_info)
                field.technical_info = null;
        });
        return result;
    };

    var getFieldSourceFunction = function (uri) {
        var self = this;
        if (uri === 'all') {
            var deferred = new jQuery.Deferred();
            setTimeout(function () {
                deferred.resolve({ uri: 'all', id: 'all', short_name: 'All' });
            }, 300);
            return deferred.promise();
        }
        else {
            disableLoading();
            return MC.ajax.request({
                url: self.GetFieldSourceUri + '?fieldsSourceUri=' + escape(uri)
            });
        }
    };

    var getFieldDomainFunction = function (uri) {
        var self = this;
        disableLoading();
        return MC.ajax.request({
            url: self.GetFieldDomainUri + '?fieldsDomainUri=' + escape(uri)
        });
    };

    var getHelpTextFunction = function (uri) {
        var self = this;
        disableLoading();
        return MC.ajax.request({
            url: self.GetHelpTextsUri + '?helpTextUri=' + escape(self.ModelUri + uri)
        });
    };

    var getCategoryIconByFieldFunction = function (item, showSmallIcon) {
        var self = this;
        var image = {
            path: fieldsChooserModel.BlankImage,
            dimension:
            {
                width: 16,
                height: 16
            }
        };
        if (typeof showSmallIcon === 'undefined')
            showSmallIcon = true;
        var iconSuffix = showSmallIcon ? '_16' : '_32';
        jQuery.each(self.FieldCategoriesData, function (k, v) {
            if (v.uri.toLowerCase() === (item.category || '').toLowerCase()) {
                var url = self.FieldCategoriesIconPath;
                image = {
                    path: url + v.id + iconSuffix + '.png',
                    dimension:
                    {
                        width: showSmallIcon ? 16 : 32,
                        height: showSmallIcon ? 16 : 32
                    }
                };
                return false;
            }
        });
        return image;
    };

    var getCategoryIconByIdFunction = function (id) {
        var self = this;
        var fixedIconPath = self.ResourceIconPath;
        var fixedIcons = {
            'suggested': 'icon_suggest.png',
            'issuggested': 'icon_suggest.png',
            'facet_issuggested': 'icon_suggest.png',
            'starred': 'icon_starred_active.png',
            'isstarred': 'icon_starred_active.png',
            'facet_isstarred': 'icon_starred_active.png'
        };
        var fieldTypeIcons =
        {
            'boolean': 'icon_yes_no.png',
            'time': 'icon_time.png',
            'text': 'icon_text.png',
            'enumerated': 'icon_set.png',
            'period': 'icon_period.png',
            'percentage': 'icon_percentage.png',
            'number': 'icon_number.png',
            'date': 'icon_date.png',
            'datetime': 'icon_datetime.png',
            'timespan': 'icon_period.png',
            'currency': 'icon_currency.png',
            'int': 'icon_number.png',
            'double': 'icon_number.png',
            'unknown': 'icon_unknown.png'
        };
        if (fixedIcons[id]) {
            return {
                path: fixedIconPath + fixedIcons[id],
                dimension:
                {
                    width: 20,
                    height: 20
                }
            };
        }
        else if (fieldTypeIcons[id]) {
            return {
                path: fixedIconPath + fieldTypeIcons[id],
                dimension:
                {
                    width: 16,
                    height: 16
                }
            };
        }
        var image = '';
        jQuery.each(self.FieldCategoriesData, function (k, v) {
            if (v.id.toLowerCase() === id.toLowerCase()) {
                var url = self.FieldCategoriesIconPath;
                image = {
                    path: url + v.id + "_16.png",
                    dimension:
                    {
                        width: 16,
                        height: 16
                    }
                };
                return false;
            }
        });
        return image;
    };

    var getFriendlyNameFunction = function (fieldObject, friendNameMode) {
        var friendlyName = '';
        switch (friendNameMode) {
            case enumHandlers.FRIENDLYNAMEMODE.SHORTNAME:
                friendlyName = fieldObject.short_name || fieldObject.long_name || fieldObject.id;
                break;
            case enumHandlers.FRIENDLYNAMEMODE.LONGNAME:
                friendlyName = fieldObject.long_name || fieldObject.short_name || fieldObject.id;
                break;
        }
        return friendlyName;
    };

    var showFieldInfoFunction = function (field) {
        var self = this;
        var fieldCategoryIconSmall = self.GetCategoryIconByField(field);
        var fieldCategoryIconLarge = self.GetCategoryIconByField(field, false);

        var helpHeaderText = '';
        if (field.technical_info) {
            helpHeaderText += '<p>' + field.technical_info + '</p>';
        }
        helpHeaderText += '<p><img src="' + fieldCategoryIconLarge.path + '" />' + field.short_name + ' (' + field.long_name + ')</p>';

        var helpTemplate = [
            '<div id="helpText">',
            '<div class="helpHeaderContainer"></div>',
            '<div class="helpTextContainer"></div>',
            '<div class="helpAdditionalContainer"></div>',
            '</div>'
        ].join('');

        var helpPopupElement = jQuery('#helpText');
        if (!helpPopupElement.length) {
            helpPopupElement = jQuery(helpTemplate);
            jQuery('body').append(helpPopupElement);
        }

        var popupTitle = field.long_name || field.id;
        var helpPopupHandle = jQuery('<a />', {
            attr: {
                href: '#helpText',
                title: popupTitle
            },
            data: {
                width: 600,
                height: 400,
                minWidth: 500
            }
        });
        MC.ui.popup(helpPopupHandle);
        helpPopupHandle.trigger('click');

        var helpPopup = helpPopupElement.data('kendoWindow');
        helpPopup.bind('close', function (e) {
            e.sender.destroy();
        });
        helpPopup.setOptions({ title: popupTitle });
        MC.ui.popup('setTooltip', {
            element: '#helpText'
        });
        helpPopup.wrapper.addClass('helpTextPopup');

        var popupTitleElement = helpPopup.wrapper.find('.k-window-title');
        popupTitleElement.before('<div class="icon iconStatus ' + self.GetIsStarredCssClass(field) + '"></div>');
        popupTitleElement.before('<div class="icon iconCategory"><img src="' + fieldCategoryIconSmall.path + '" /></div>');

        jQuery('#helpTextFootNote').remove();
        helpPopup.wrapper.find('.helpTextContainer, .helpHeaderContainer, .helpAdditionalContainer').empty();
        helpPopup.element.after('<div id="helpTextFootNote">' + field.id + '</div>');

        var helpData = null;
        var domainData = null;
        var deferred = [];
        if (field.helptext) {
            helpData = self.HelpTexts[field.helptext];
            if (!helpData) {
                deferred.push(self.LoadHelpText([field.helpid], false));
            }
        }
        if (field.domain) {
            domainData = self.GetFieldsDomainByUri(field.domain);
            if (!domainData) {
                deferred.push(self.LoadFieldDomain(field.domain));
            }
        }

        helpPopup.element.css({ overflow: 'hidden', padding: 0 }).busyIndicator(true);
        jQuery.when.apply(jQuery, deferred)
            .done(function () {
                helpPopup.element.find('.helpHeaderContainer').html(helpHeaderText);

                if (!helpData) {
                    helpData = self.HelpTexts[field.helptext] || {};
                }
                helpPopup.element.find('.helpTextContainer').html(helpData.html_help || '');

                if (!domainData) {
                    domainData = self.GetFieldsDomainByUri(field.domain);
                }
                if (domainData) {
                    var domainText = '<h4 class="sectiontitle">Set values:</h4>';
                    domainText += '<ul>';
                    jQuery.each(domainData.elements || [], function (index, value) {
                        domainText += '<li>' + value.short_name + ' (' + value.long_name + ')' + '</li>';
                    });
                    domainText += '</ul>';
                    helpPopup.element.find('.helpAdditionalContainer').html(domainText);
                }
            })
            .always(function () {
                helpPopup.element.css({ overflow: '', padding: '' }).busyIndicator(false);
            });
    };

    var saveUserSettingsViewMode = function (viewMode) {
        var self = this;
        var clientSetting = jQuery.parseJSON(self.ClientSettings);
        clientSetting['field_chooser_view_mode'] = viewMode;
        var data = { clientSetting: JSON.stringify(clientSetting) };

        // save user settings
        MC.ajax.request({
            url: window.saveUserSettingsUrl,
            parameters: data,
            async: false
        });

        self.ClientSettings = data.clientSetting;
        self.UpdateClientSettings.call(self, self.ClientSettings);
    };

    var fieldschooser = {
        initial: function (defaultPageSize, maxPageSize, maxDomainElementsForSearch) {

            var fieldsChooserModel = new FieldsChooserModel();

            // configurations
            fieldsChooserModel.DefaultFacetFilters = [];
            fieldsChooserModel.FacetsHidden = ['classes'];
            fieldsChooserModel.PossibleToSetStar = false;
            fieldsChooserModel.ShowSourceField = true;
            fieldsChooserModel.ShowTechnicalInfo = true;
            fieldsChooserModel.AllowMultipleSelection = false;
            fieldsChooserModel.DefaultPagesize = defaultPageSize;
            fieldsChooserModel.MaxPageSize = maxPageSize;
            fieldsChooserModel.MaxDomainElementsForSearch = maxDomainElementsForSearch;

            // functions
            fieldsChooserModel.BindDataGridStart = bindDataGridStart;
            fieldsChooserModel.GetFieldsFunction = getFieldsFunction;
            fieldsChooserModel.SetFieldsFunction = setFieldsFunction;
            fieldsChooserModel.GetFieldSourceFunction = getFieldSourceFunction;
            fieldsChooserModel.GetFieldDomainFunction = getFieldDomainFunction;
            fieldsChooserModel.GetHelpTextFunction = getHelpTextFunction;
            fieldsChooserModel.GetCategoryIconByFieldFunction = getCategoryIconByFieldFunction;
            fieldsChooserModel.GetCategoryIconByIdFunction = getCategoryIconByIdFunction;
            fieldsChooserModel.GetFriendlyNameFunction = getFriendlyNameFunction;
            fieldsChooserModel.ShowFieldInfoFunction = showFieldInfoFunction;
            fieldsChooserModel.SaveUserSettingsViewMode = saveUserSettingsViewMode;

            return fieldsChooserModel;
        },
        showFieldsChooserPopup: function (title) {
            var popupOptions = jQuery.extend(fieldsChooserModel.GetPopupFieldCooserOptions(), { title: title });

            var fieldsChooserPopup = fieldsChooserModel.DisplayFieldChooserPopup(popupOptions);

            fieldsChooserPopup.wrapper.addClass('k-wc');

            return fieldsChooserPopup;
        },
        checkFieldsChooserButtons: function (buttonsSelector) {
            clearInterval(fnCheckFieldChooserLoaded);
            fnCheckFieldChooserLoaded = setInterval(function () {
                if (!jQuery.active) {
                    clearInterval(fnCheckFieldChooserLoaded);
                    jQuery('#popupFieldChooser').find(buttonsSelector).removeClass('disabled');
                }
            }, 500);
        }

    };

    win.MC.ui.fieldschooser = fieldschooser;

})(window, window.jQuery);
