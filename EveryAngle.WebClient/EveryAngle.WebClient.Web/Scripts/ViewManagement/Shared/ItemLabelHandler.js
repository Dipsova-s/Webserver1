function ItemLabelHandler() { }

(function (handler) {
    "use strict";

    handler.$Container = jQuery();
    handler.$BusinessProcess = null;
    handler.StateHandler = new ItemStateHandler();
    handler.View = new ItemStateView();
    handler.Labels = ko.observableArray([]);
    handler.SaveTimeoutTimer = null;
    handler.SaveTimeout = 1000;
    handler.LoadLabelTimer = null;
    handler.LoadLabelStatus = 'none';
    handler.Summary = {
        bp_text: ko.observable(''),
        language_text: ko.observable(''),
        privilege_label_text: ko.observable(''),
        search_label_text: ko.observable('')
    };

    handler.CanUpdate = function () {
        return false;
    };
    handler.GetModelUri = function () {
        return null;
    };
    handler.IsPublished = function () {
        return false;
    };
    handler.IsAdhoc = function () {
        return false;
    };
    handler.GetAssignedLabels = function () {
        return [];
    };
    handler.Initial = function (container) {
        var self = this;
        self.$Container = container;
        WC.HtmlHelper.Overlay.Create(self.$Container.closest('.tab-content-wrapper'));
        self.InitialBusinesProcess();
        self.InitialLabels()
            .always(jQuery.proxy(self.Validate, self));
    };
    handler.OnChange = function () {
        var self = this;
        clearTimeout(self.SaveTimeoutTimer);
        if (!self.Validate(false)) {
            self.SetOverlay(true);
            return;
        }

        $("#btn-popupValidateBusinessProcess0").removeClass('disabled');

        var labels = self.GetData();
        if (self.IsAdhoc())
            self.Save(labels);
        else
            self.SaveTimeoutTimer = setTimeout(jQuery.proxy(self.Save, self, labels), self.SaveTimeout);
    };
    handler.Save = jQuery.noop;
    handler.ShowProgressbar = function () {
        var self = this;
        if (!self.IsAdhoc()) {
            self.$Container.busyIndicator(true);
            self.$Container.find('.k-loading-mask').addClass('k-loading-none');
            self.$BusinessProcess.hideList();
        }
    };
    handler.HideProgressbar = function () {
        var self = this;
        self.$Container.busyIndicator(false);
        self.SetOverlay(false);
    };
    handler.SetOverlay = function (visible) {
        var self = this;
        WC.HtmlHelper.Overlay.Update(visible, self.$Container);
    };
    handler.GetData = function () {
        var self = this;
        var labels = [];
        self.$Container.find('.multiple-select').each(function (index, element) {
            var handler = jQuery(element).data('MultiSelect');
            if (handler) {
                var values = handler.value();
                jQuery.merge(labels, values);
            }
        });
        return labels;
    };
    handler.Cancel = function () {
        var self = this;
        self.Initial(self.$Container);
    };
    handler.SaveDone = jQuery.noop;
    handler.SaveFail = function () {
        var self = this;
        self.HideProgressbar();
    };
    handler.Validate = function (showPopup, saveDisplayAs) {
        var self = this;
        var validBusinessProcess = self.ValidateBusinessProcess();
        var validLabel = self.ValidateLabel();
        if (validBusinessProcess && validLabel) {
            return true;
        }
        else {
            // show popup in some cases
            // - clicking save all on adhoc Angle
            if (showPopup === true) {
                const popupSettings = self.GetValidateBusinessProcessPopupOptions(saveDisplayAs);
                popup.Show(popupSettings);
            }
            return false;
        }
    };

    // bps
    handler.InitialBusinesProcess = function () {
        var self = this;
        var target = self.$Container.find('.business-processes-selection');
        var data = self.GetAllBusinesProcesses();
        var values = self.GetBusinesProcessValues();
        self.$BusinessProcess = WC.HtmlHelper.MultiSelect(target, {
            data: data,
            value: values,
            min: 1,
            readonly: !self.CanUpdate(),
            render: jQuery.proxy(self.BusinesProcessRender, self),
            change: jQuery.proxy(self.OnChange, self)
        });
        var buttonAdd = self.$BusinessProcess.element.find('.multiple-select-button');
        buttonAdd.attr({
            'data-role': 'tooltip',
            'data-tooltip-position': 'bottom',
            'data-tooltip-text': Localization.Add
        });
    };
    handler.ValidateBusinessProcess = function () {
        var self = this;
        if (!self.$BusinessProcess.value().length) {
            self.SetBusinesProcessErrorMessage(Localization.ValidationForBusinessProcess);
            return false;
        }

        // ok
        self.SetBusinesProcessErrorMessage('');
        return true;
    };
    handler.SetBusinesProcessErrorMessage = function (message) {
        var self = this;
        var errorElement = self.$BusinessProcess.element.next('.business-processes-selection-message');
        errorElement.text(message);
    };
    handler.BusinesProcessRender = function (rendertype, bp, element) {
        if (rendertype === 'value') {
            element.addClass(bp.css_class);
            element.attr('data-tooltip-text', bp.fullname);
            element.attr('data-tooltip-position', 'bottom');
            element.attr('data-role', 'tooltip');
        }
        else {
            element.children().addClass(bp.list_css_class);
            if (!bp.is_allowed || bp.readonly) {
                element.addClass('disabled');
            }
            element.children().text('');
            var span = kendo.format('<span>{0}</span>', bp.name);
            element.append(span);
            element.parent().addClass('business-processes');
        }
    };
    handler.GetAllBusinesProcesses = function () {
        var self = this;
        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.GetModelUri());
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.General, modelPrivileges, self.IsPublished());
        var result = [];
        var bps = businessProcessesModel.General.Data();
        jQuery.each(bps, function (index, bp) {
            result.push({
                id: bp.id, name: bp.id, fullname: bp.name,
                list_css_class: kendo.format('business-process-multi-select BusinessProcessBadge {0} BusinessProcessBadgeItem{1}', bp.id, index % businessProcessesModel.General.TotalBusinessProcesses),
                css_class: kendo.format('business-process-multi-select {0} BusinessProcessBadgeItem{1}', bp.id, index % businessProcessesModel.General.TotalBusinessProcesses),
                is_allowed: bp.is_allowed,
                readonly: bp.__readonly
            });
        });
        return result;
    };
    handler.GetBusinesProcessValues = function () {
        var self = this;
        var activeBusinessProcesses = [];
        jQuery.each(self.GetAssignedLabels(), function (index, label) {
            var businessProcessData = WC.Utility.ToArray(businessProcessesModel.General.Data()).findObject('id', label, false);
            if (businessProcessData && businessProcessData.is_allowed) {
                activeBusinessProcesses.push(label);
            }
        });
        return activeBusinessProcesses;
    };

    // labels
    handler.InitialLabels = function () {
        var self = this;
        self.Labels([]);
        self.StateHandler.LabelChange = jQuery.proxy(self.OnChange, self);
        WC.HtmlHelper.ApplyKnockout(self, self.$Container);

        return self.LoadLabels()
            .always(function () {
                self.StateHandler.SetItemData(self.GetStateData());
                var labels = self.StateHandler.GetLabelsData(self.$Container);
                self.Labels(labels);
            });
    };
    handler.LoadLabels = function () {
        var self = this;
        clearInterval(self.LoadLabelTimer);
        if (self.LoadLabelStatus === 'loaded') {
            // data is ready
            return jQuery.when();
        }
        else if (self.LoadLabelStatus === 'loading') {
            // in progress
            var deferred = jQuery.Deferred();
            self.LoadLabelTimer = setInterval(function () {
                if (self.LoadLabelStatus === 'loaded') {
                    clearInterval(self.LoadLabelTimer);
                    deferred.resolve();
                }
            }, 100);
            return deferred.promise();
        }
        else {
            // no data
            self.LoadLabelStatus = 'loading';
            var modelData = modelsHandler.GetModelByUri(self.GetModelUri());
            var requests = [];
            requests.pushDeferred(modelLabelCategoryHandler.LoadAllLabelCategories, [modelData.label_categories]);
            requests.pushDeferred(modelLabelCategoryHandler.LoadAllLabels, [modelData.labels]);
            return jQuery.whenAll(requests)
                .always(function () {
                    self.LoadLabelStatus = 'loaded';
                });
        }
    };
    handler.GetStateData = function () {
        return {};
    };
    handler.ValidateLabel = function () {
        var self = this;
        return self.StateHandler.CheckSavePublishSettings(self.$Container, self.IsPublished());
    };
    handler.GetValidateBusinessProcessPopupOptions = function (saveDisplayAs) {
        const self = this;
        const handle = '#' + 'AngleSavingWrapper';
        const popupName = 'ValidateBusinessProcess';
        const popupSettings = {
            title: Localization.AddLabels,
            element: '#popup' + popupName,
            html: self.View.GetBusinessProcessValidateTemplate(),
            className: 'k-window-full popup' + popupName,
            resizable: false,
            draggable: false,
            center: false,
            actions: ["Close"],
            width: 350,
            minHeight: 100,
            resize: jQuery.proxy(self.StateHandler.OnPopupResized, self, handle),
            buttons: self.GetButtons(saveDisplayAs),
            open: jQuery.proxy(self.ShowValidateBusinessProcessCallback, self),
            close: e => {
                popup.Destroy(e);
                e.userTriggered && popup.Close('#PopupSaveAs');
            }
        };
        return popupSettings;
    };

    handler.GetButtons = function (saveDisplayAs) {
        const self = this;
        let buttons = [{
            text: Localization.Save,
            position: 'right',
            isPrimary: true,
            className: 'btn-save btn-primary float-right disabled',
            attr: {
                'data-busy': Localization.Saving
            },
            click: jQuery.proxy(self.CreateAngle, self, saveDisplayAs)
        }];
        saveDisplayAs && buttons.push({
            text: Localization.FollowupsLeftText,
            position: 'right',
            click: () => {
                popup.Close('#popupValidateBusinessProcess');
            }
        });
        return buttons;
    };

    handler.ShowValidateBusinessProcessCallback = function (e) {
        const self = this;

        jQuery('.k-overlay').off('click');
        WC.HtmlHelper.ApplyKnockout(self, e.sender.element);
        e.sender.element.busyIndicator(true);

        jQuery.when(
            self.Initial(jQuery('.section-labels')),
                systemLanguageHandler.LoadLanguages())
                .then(() => {
                    self.SetSummary(self);
                    jQuery('.k-overlay').on('click', () => {
                        popup.Close('#popupValidateBusinessProcess');
                        popup.Close('#PopupSaveAs');
                    });

                    e.sender.element.busyIndicator(false);
                });        
    };

    handler.SetSummary = function () {
        const self = this;
        const language = self.StateHandler.GetLanguagesData(self.AngleHandler.Data().multi_lang_name);

        let privilegeLabels = [];
        let searchLabels = [];
        jQuery.each(self.GetAssignedLabels(), function (index, assignedLabel) {
            // other label
            const label = modelLabelCategoryHandler.GetLabelById(assignedLabel);
            if (label) {
                const labelName = label.name || label.id;
                const categoryUri = self.Data.model + label.category;
                const category = modelLabelCategoryHandler.GetLabelCategoryByUri(categoryUri);
                if (category.used_for_authorization)
                    privilegeLabels.push(labelName);
                else
                    searchLabels.push(labelName);
            }
        });

        // summary
        self.Summary.language_text(kendo.format('{0}: {1} ({2})', Localization.Languages, language.length, language.join(', ')));
        self.Summary.bp_text(kendo.format('{0}: {1} ({2})', Localization.BusinessProcesses, 0, ''));
        self.Summary.privilege_label_text(kendo.format('{0}: {1}', Localization.PrivilegeLabels, privilegeLabels.length));
        self.Summary.search_label_text(kendo.format('{0}: {1}', Localization.SearchLabels, searchLabels.length));
    };
}(ItemLabelHandler.prototype));