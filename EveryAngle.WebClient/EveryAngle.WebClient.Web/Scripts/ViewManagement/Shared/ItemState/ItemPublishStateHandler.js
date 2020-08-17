(function (handler) {
    "use strict";
    
    handler.InitialData = {};
    handler.Summary = {
        bp_text: ko.observable(''),
        language_text: ko.observable(''),
        privilege_label_text: ko.observable(''),
        search_label_text: ko.observable('')
    };
    
    handler.CheckShowingPublishSettingsPopup = jQuery.noop;
    handler.ShowPublishSettingsPopup = function (_model, event) {
        var self = this;
        if (!popup.CanButtonExecute(event.currentTarget))
            return;
        
        self.CheckShowingPublishSettingsPopup(function () {
            var popupSettings = self.GetPublishSettingsPopupOptions(event);
            popup.Show(popupSettings);
        });
    };
    handler.GetPublishSettingsPopupOptions = function (event) {
        var self = this;
        var handle = '#' + event.currentTarget.id;
        var popupName = 'PublishSettings';
        var popupSettings = {
            title: Localization.PublishSettings,
            element: '#popup' + popupName,
            html: self.View.GetPublishTemplate(),
            className: 'k-window-full popup' + popupName,
            resizable: false,
            draggable: false,
            center: false,
            actions: ["Close"],
            width: 350,
            minHeight: 100,
            resize: jQuery.proxy(self.OnPopupResized, self, handle),
            open: jQuery.proxy(self.ShowPublishSettingsCallback, self),
            close: popup.Destroy
        };
        return popupSettings;
    };
    handler.ShowPublishSettingsCallback = function (e) {
        var self = this;

        jQuery('.k-overlay').off('click');
        self.ReloadPublishingSettingsData(false);
        WC.HtmlHelper.ApplyKnockout(self, e.sender.element);
        e.sender.element.busyIndicator(true);
        self.GetPublishSettingsResources()
            .always(function () {
                self.ReloadPublishingSettingsData(true);
                self.CheckUpdatedPublishSettingsData();
                jQuery('.k-overlay').on('click', self.ClosePublishSettingsPopup);
                e.sender.element.busyIndicator(false);
            });
    };
    handler.ClosePublishSettingsPopup = function () {
        popup.Close('#popupPublishSettings');
    };
    handler.ReloadPublishingSettingsData = function (hasData) {
        var self = this;
        self.SetPublishSettingsSummary();
        if (hasData) {
            self.Labels(self.GetLabelsData(jQuery('#popupPublishSettings')));
            self.InitialData = self.GetPublishSettingsData();
        }
    };
    handler.SetPublishSettingsSummary = function () {
        var self = this;
        // labels
        var bps = [];
        var privilegeLabels = [];
        var searchLabels = [];
        jQuery.each(self.Data.assigned_labels, function (index, assignedLabel) {
            // business process label
            var bp = businessProcessesModel.General.Data().findObject('id', assignedLabel);
            if (bp) {
                bps.push(bp.abbreviation || bp.id);
                return;
            }

            // other label
            var label = modelLabelCategoryHandler.GetLabelById(assignedLabel);
            if (label) {
                var labelName = label.name || label.id;
                var categoryUri = self.Data.model + label.category;
                var category = modelLabelCategoryHandler.GetLabelCategoryByUri(categoryUri);
                if (category.used_for_authorization)
                    privilegeLabels.push(labelName);
                else
                    searchLabels.push(labelName);
            }
        });

        // summary
        self.Summary.language_text(kendo.format('{0}: {1} ({2})', Localization.Languages, self.Languages().length, self.Languages().join(', ')));
        self.Summary.bp_text(kendo.format('{0}: {1} ({2})', Localization.BusinessProcesses, bps.length, bps.join(', ')));
        self.Summary.privilege_label_text(kendo.format('{0}: {1}', Localization.PrivilegeLabels, privilegeLabels.length));
        self.Summary.search_label_text(kendo.format('{0}: {1}', Localization.SearchLabels, searchLabels.length));
    };
    handler.GetLabelsData = function (target) {
        var self = this;
        var data = [];
        var labelCategories = modelLabelCategoryHandler.GetLabelCategoriesByModel(self.Data.model);
        jQuery.each(labelCategories, function (_indexCategory, category) {
            if (category.contains_businessprocesses)
                return;

            // set group
            var group = self.GetLabelGroupData(data, category);

            // set category
            group.categories.push(self.GetLabelCategoryData(target, category));

            // set labels
            group.categories[group.categories.length - 1].labels = self.GetLabelGroupCategoryData(category);
        });
        data.sortObject('order', enumHandlers.SORTDIRECTION.ASC);
        return data;
    };
    handler.GetLabelGroupData = function (data, category) {
        var group;
        if (category.used_for_authorization) {
            // privilege labels
            group = data.findObject('order', 1);
            if (!group) {
                group = {
                    order: 1,
                    name: Localization.AngleDetailPublishTabAnglePrivileges,
                    count: ko.observable(0),
                    categories: []
                };
                data.push(group);
            }
        }
        else {
            // search labels
            group = data.findObject('order', 2);
            if (!group) {
                group = {
                    order: 2,
                    name: Localization.AngleDetailPublishTabSearchLabels,
                    count: ko.observable(0),
                    categories: []
                };
                data.push(group);
            }
        }
        return group;
    };
    handler.GetLabelCategoryData = function (target, category) {
        var self = this;
        return {
            id: category.id,
            name: category.name,
            used_for_authorization: category.used_for_authorization,
            is_required: category.is_required,
            render: jQuery.proxy(self.RenderLabelSelection, self, target),
            labels: []
        };
    };
    handler.RenderLabelSelection = function (target, _elements, model) {
        var self = this;
        var element = target.find('.label-selection[data-id=' + model.id + ']');
        WC.HtmlHelper.MultiSelect(element, {
            header: (model.is_required ? '<em class="required">*</em> ' : '') + model.name,
            data: model.labels,
            min: self.Data.is_published() && model.is_required ? 1 : 0,
            value: self.Data.assigned_labels,
            readonly: self.Data.is_validated(),
            render: jQuery.proxy(self.RenderLabelHtml, self),
            change: jQuery.proxy(self.LabelSelectionChange, self, target)
        });
        self.UpdateLabelGroupCount(element);
    };
    handler.LabelSelectionChange = function (target, _what, item, itemElement) {
        var self = this;
        self.UpdateLabelGroupCount(itemElement);
        self.CheckSavePublishSettings(target, self.Data.is_published());
        self.LabelChange(item);
    };
    handler.UpdateLabelGroupCount = function (element) {
        var container = element.closest('.publish-labels');
        var groupItem = ko.dataFor(container.get(0));
        groupItem.count(0);
        container.find('.multiple-select').each(function (_index, multiselect) {
            var ui = $(multiselect).data('MultiSelect');
            if (ui)
                groupItem.count(groupItem.count() + ui.value().length);
        });
    };
    handler.GetLabelGroupCategoryData = function (category) {
        var self = this;
        var data = [];
        var labels = modelLabelCategoryHandler.GetLabelsByCategoryUri(category.uri);
        jQuery.each(labels, function (indexLabel, label) {
            if (category.used_for_authorization
                && !privilegesViewModel.IsValidLabelAuthorizeModel(self.Data.model, label.id, !self.Data.is_published()))
                return;

            data.push({
                id: label.id,
                name: label.name,
                privilege: category.used_for_authorization
                    ? privilegesViewModel.GetLabelAuthorization(self.Data.model, label.id)
                    : privilegesViewModel.PRIVILEGESTATUS.VALIDATE.Code
            });
        });
        data.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
        return data;
    };
    handler.LabelChange = jQuery.noop;
    handler.RenderLabelHtml = function (where, item, element) {
        var self = this;
        if (self.IsLabelHaveWarning(item.privilege, !self.Data.is_published()))
            element.children('span').after('<i class="btn-warning icon validWarning" title="' + Localization.PublishSettings_LabelWarning + '"></i>');
    };
    handler.IsLabelHaveWarning = function (privilege, isPublished) {
        return isPublished && privilege === privilegesViewModel.PRIVILEGESTATUS.VIEW.Code;
    };
    handler.GetPublishSettingsResources = function () {
        var self = this;
        var modelData = modelsHandler.GetModelByUri(self.Data.model);
        return jQuery.when(modelData && modelData.label_categories ? modelData : modelsHandler.LoadModelInfo(self.Data.model))
            .then(function (model) {
                var deferred = [];
                deferred.pushDeferred(systemLanguageHandler.LoadLanguages);
                deferred.pushDeferred(modelLabelCategoryHandler.LoadAllLabelCategories, [model.label_categories]);
                deferred.pushDeferred(modelLabelCategoryHandler.LoadAllLabels, [model.labels]);
                return jQuery.whenAll(deferred);
            });
    };
    handler.GetAssignedLabels = function () {
        var self = this;
        var labels = [];

        // bp
        jQuery.each(self.Data.assigned_labels, function (index, assignedLabel) {
            var bp = businessProcessesModel.General.Data().findObject('id', assignedLabel);
            if (bp) {
                labels.push(assignedLabel);
                return;
            }
        });

        // gui
        jQuery('#popupPublishSettings .label-selection').each(function (index, element) {
            var handler = jQuery(element).data('MultiSelect');
            if (handler) {
                var values = handler.value();
                jQuery.merge(labels, values);
            }
        });

        return labels;
    };
    handler.GetPublishSettingsData = function () {
        var self = this;
        return {
            assigned_labels: self.GetAssignedLabels()
        };
    };
    handler.GetUpdatedPublishSettingsData = function () {
        var self = this;
        var initialData = jQuery.extend({}, self.InitialData);
        var updateData = self.GetPublishSettingsData();
        jQuery.each(updateData, function (key, value) {
            if (jQuery.deepCompare(value, initialData[key], false))
                delete updateData[key];
        });
        return updateData;
    };
    handler.CheckUpdatedPublishSettingsData = function () {
        var self = this;
        var data = self.GetUpdatedPublishSettingsData();
        var message = !jQuery.isEmptyObject(data) && self.Data.is_validated()
                    ? self.GetUpdatedValidatedItemMessage()
                    : '';
        jQuery('#popupPublishSettings .save-validate-message').html(message);
        return true;
    };
    handler.GetUpdatedValidatedItemMessage = function () {
        return '';
    };
    handler.CheckSavePublishSettings = function (target, isPublished) {
        var self = this;
        // clean messages
        target.find('.group-message').empty();
        target.find('.label-selection-message').empty();

        // check labels
        var valid = true;
        var requiredCategories = [];
        var labelHaveWarning = false;
        var labelCategoryCount = 0;
        var setLabelErrorMessage = function (element, message) {
            element.text(message);
            if (element.is(':hidden'))
                element.closest('.publish-labels').children('.accordion-header').trigger('click');
        };
        if (isPublished) {
            jQuery.each(self.Data.assigned_labels, function (index, assignedLabel) {
                var bp = businessProcessesModel.General.Data().findObject('id', assignedLabel);
                if (bp) {
                    labelCategoryCount++;
                    return false;
                }
            });
            
            target.find('.label-selection').each(function (index, element) {
                var handler = jQuery(element).data('MultiSelect');
                if (!handler)
                    return;

                var items = handler.items();
                var category = ko.dataFor(element);
                var messageElement = jQuery(element).next('.label-selection-message');

                // check required category
                if (category.is_required && !items.length) {
                    requiredCategories.push(category.name);
                    setLabelErrorMessage(messageElement, Localization.PublishSettings_LabelRequired);
                }

                // check warning label
                var foundWarning = items.hasObject('privilege', function (privilege) {
                    return self.IsLabelHaveWarning(privilege, true);
                });
                if (foundWarning) {
                    setLabelErrorMessage(messageElement, Localization.PublishSettings_LabelInvalid);
                    if (!labelHaveWarning)
                        labelHaveWarning = true;
                }

                // check minimum label category
                if (category.used_for_authorization && items.length)
                    labelCategoryCount++;
            });

            if (requiredCategories.length || labelHaveWarning)
                valid = false;

            var minLabelCategories = systemSettingHandler.GetMinLabelCategoryToPublish();
            if (labelCategoryCount < minLabelCategories) {
                valid = false;
                target.find('.group-message').text(kendo.format(Localization.Info_RequiredAtLeastOneLabelBeforePublish, minLabelCategories));
            }
        }

        return valid;
    };
    handler.SavePublishSettings = jQuery.noop;
    handler.CheckPublishItem = function () {
        var self = this;
        // labels
        if (!self.CheckSavePublishSettings(jQuery('#popupPublishSettings'), true)) {
            return false;
        }

        return true;
    };
    handler.PublishItem = jQuery.noop;
    handler.UnpublishItem = jQuery.noop;
    handler.UpdateItem = jQuery.noop;
    handler.ShowPublishingProgressbar = function (currentTarget) {
        jQuery(currentTarget).addClass('btn-busy');
        jQuery('#popupPublishSettings').busyIndicator(true);
        jQuery('#popupPublishSettings .k-loading-mask').addClass('k-loading-none');
    };
    handler.HidePublishingProgressbar = function (currentTarget) {
        jQuery(currentTarget).removeClass('btn-busy');
        jQuery('#popupPublishSettings').busyIndicator(false);
    };
    handler.CanUpdateItem = function () {
        var self = this;
        return self.Data.authorizations().update;
    };
    handler.CanPublishItem = function () {
        var self = this;
        return self.Data.authorizations().publish;
    };
    handler.CanUnpublishItem = function () {
        var self = this;
        return self.Data.authorizations().unpublish;
    };
    handler.CanUserManagePrivateItem = function () {
        var self = this;
        return privilegesViewModel.IsAllowManagePrivateItems(self.Data.model)
            || self.Data.created.user === userModel.Data().uri;
    };
}(ItemStateHandler.prototype));