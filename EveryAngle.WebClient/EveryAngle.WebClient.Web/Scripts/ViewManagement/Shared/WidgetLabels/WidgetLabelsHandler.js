function WidgetLabelsHandler(container, defaultLabels, businessProcessesHandler) {
    "use strict";

    var self = this;
    self.Identity = 'WidgetLabelsHandler';
    self.View = new WidgetLabelsView(self);
    self.Element = jQuery(container);
    self.ModelUri = null;
    self.IsReady = false;
    self.DefaultLabels = defaultLabels;
    self.BusinessProcessesHandler = businessProcessesHandler;
    self.Captions = {
        Remark: ko.observable(Localization.AngleDetailPublishTabAngleNote),
        TabPrivilegeName: ko.observable(Localization.AngleDetailPublishTabAnglePrivileges),
        TabSearchName: ko.observable(Localization.AngleDetailPublishTabSearchLabels)
    };
    self.LABELTYPE = {
        PRIVILEGE: 0,
        SEARCH: 1,
        BUSINESSPROCESS: 2
    };
    self.TabActiveIndex = ko.observable(self.LABELTYPE.PRIVILEGE);
    self.TabEnabledIndexes = ko.observableArray([self.LABELTYPE.PRIVILEGE, self.LABELTYPE.SEARCH]);
    self.Data = ko.observableArray([]);
    self.OnLabelChanged = jQuery.noop;

    self.ApplyHandler = function (modelUri, isPublished) {
        var applyHandlerElement = self.Element.find('.tab');
        if (!applyHandlerElement.length || (applyHandlerElement.length && self.ModelUri !== modelUri)) {
            self.ModelUri = modelUri;
            self.Element.html(self.View.Template());
            applyHandlerElement = self.Element.find('.tab');
            var currentBinding = ko.dataFor(applyHandlerElement.get(0));
            if (!currentBinding || (currentBinding && currentBinding.Identity !== self.Identity)) {
                ko.applyBindings(self, applyHandlerElement.get(0));
            }

            // load labels
            var modelData = modelsHandler.GetModelByUri(modelUri);
            if (modelData) {
                self.Element.busyIndicator(true);
                return jQuery.when(
                        modelLabelCategoryHandler.LoadAllLabelCategories(modelData.label_categories),
                        modelLabelCategoryHandler.LoadAllLabels(modelData.labels)
                    )
                    .done(function () {
                        self.SetLabels(modelUri, isPublished);
                    })
                    .always(function () {
                        self.IsReady = true;
                        self.Element.busyIndicator(false);
                    });
            }
            else {
                self.IsReady = true;
                return jQuery.when(null);
            }
        }

        return jQuery.when(null);
    };
    self.SetLabels = function (modelUri, isPublished) {
        var labelCategoriesData = [];
        var labelCategories = modelLabelCategoryHandler.GetLabelCategoriesByModel(modelUri);
        var assignedLabels = self.GetAssignedLabels();

        jQuery.each(labelCategories, function (indexCategory, labelCategory) {
            if (!labelCategory.contains_businessprocesses) {
                var labelCategoryViewModel = {};
                labelCategoryViewModel.IsRequired = labelCategory.is_required;
                labelCategoryViewModel.CategoryId = labelCategory.id;
                labelCategoryViewModel.CategoryName = labelCategory.name || labelCategory.id;
                if (labelCategory.used_for_authorization) {
                    labelCategoryViewModel.CategoryIndex = self.LABELTYPE.PRIVILEGE;
                }
                else {
                    labelCategoryViewModel.CategoryIndex = self.LABELTYPE.SEARCH;
                }
                labelCategoryViewModel.Labels = [];
                labelCategoryViewModel.ShowLabelsList = self.ShowLabelsList;
                labelCategoryViewModel.IsLabelsAvailable = self.IsLabelsAvailable;

                // labels
                var labels = modelLabelCategoryHandler.GetLabelsByCategoryUri(labelCategory.uri);
                jQuery.each(labels, function (indexLabel, label) {
                    var isLabelAssigned = jQuery.inArray(label.id, assignedLabels) !== -1;
                    var authorized = true;
                    if (!isLabelAssigned && labelCategoryViewModel.CategoryIndex === self.LABELTYPE.PRIVILEGE) {
                        authorized = privilegesViewModel.IsValidLabelAuthorizeModel(modelUri, label.id, !isPublished);
                    }

                    if (authorized) {
                        var labelViewModel = {};
                        labelViewModel.PrivilegeStatus = privilegesViewModel.GetLabelAuthorization(modelUri, label.id);
                        labelViewModel.LabelId = label.id;
                        labelViewModel.LabelName = label.name || label.id;
                        labelViewModel.IsSelected = ko.observable(isLabelAssigned);
                        labelViewModel.AddLabel = self.AddLabel;
                        labelViewModel.DeleteLabel = self.DeleteLabel;
                        labelCategoryViewModel.Labels.push(labelViewModel);
                    }
                });

                labelCategoryViewModel.Labels.sortObject('LabelName', enumHandlers.SORTDIRECTION.ASC, false);
                labelCategoriesData.push(labelCategoryViewModel);
            }
        });

        self.Data(labelCategoriesData);
    };
    self.TabName = function (index) {
        if (index === self.LABELTYPE.PRIVILEGE)
            return self.Captions.TabPrivilegeName();
        else if (index === self.LABELTYPE.SEARCH)
            return self.Captions.TabSearchName();
        else
            return '';
    };
    self.ActiveTab = function (data, event) {
        var index = jQuery(event.currentTarget).index();
        self.TabActiveIndex(index);
    };
    self.IsTabActived = function(index) {
        return index === self.TabActiveIndex();
    };
    self.IsTabEnabled = function (index) {
        return jQuery.inArray(index, self.TabEnabledIndexes()) !== -1;
    };
    self.GetPanelWidth = function (index) {
        var categoryCount = self.Data().findObjects('CategoryIndex', index).length;
        return categoryCount ? ((categoryCount * 130) - 10) + 'px' : '100%';
    };
    var fnCheckScrollHide;
    self.ShowLabelsList = function (data, event) {
        var availableLabelsContainer = jQuery('#AvailableLabelsPopup');
        availableLabelsContainer.html(self.View.TemplateAvailableLabelsList());

        var applyHandlerElement = availableLabelsContainer.find('.availableLabelsListContainer');
        ko.applyBindings(data, applyHandlerElement.get(0));

        var isFirstClick = true;
        var tabContainer = self.Element.find('.tabPanelContainer').off('scroll.labelspopup');
        var availableLabelsPopup = availableLabelsContainer.find('.availableLabelsList');
        self.Element.find('.btnAddLabel').removeClass('active');
        var handle = jQuery(event.currentTarget).addClass('active');
        var handleHeight = handle.height();
        var handlePosition = handle.position();
        var availableLabelsPopupPostion = {
            left: handlePosition.left,
            top: handlePosition.top + handleHeight
        };
        var availableLabelsPopupWidth = availableLabelsPopup.width();
        var tabContainerWidth = tabContainer.width();
        if (availableLabelsPopupPostion.left < 0) {
            tabContainer.scrollLeft(tabContainer.scrollLeft() + availableLabelsPopupPostion.left);
            handlePosition = handle.position();
            availableLabelsPopupPostion.left = handlePosition.left;
        }
        else if (availableLabelsPopupPostion.left + availableLabelsPopupWidth > tabContainerWidth) {
            tabContainer.scrollLeft(tabContainer.scrollLeft() + (availableLabelsPopupPostion.left + availableLabelsPopupWidth - tabContainerWidth));
            handlePosition = handle.position();
            availableLabelsPopupPostion.left = handlePosition.left;

            if (availableLabelsPopupPostion.left + availableLabelsPopupWidth > tabContainerWidth) {
                availableLabelsPopupPostion.left = tabContainerWidth - availableLabelsPopupWidth;
            }
        }
        availableLabelsPopup.css(availableLabelsPopupPostion);

        clearTimeout(fnCheckScrollHide);
        fnCheckScrollHide = setTimeout(function () {
            tabContainer
                .on('scroll.labelspopup', function () {
                    jQuery(document).trigger('click.labelspopup');
                });
        }, 500);

        jQuery(document)
            .off('click.labelspopup')
            .on('click.labelspopup', function (e) {
                if (!isFirstClick) {
                    var clickElement = jQuery(e.target);
                    if (!clickElement.parents('#AvailableLabelsPopup').length) {
                        availableLabelsContainer.empty();
                        self.Element.find('.btnAddLabel').removeClass('active');
                        jQuery(document).off('click.labelspopup');
                    }
                }
                isFirstClick = false;
            });
    };
    self.IsLabelsAvailable = function (labels) {
        return ko.toJS(labels).hasObject('IsSelected', false);
    };
    self.AddLabel = function (data) {
        data.IsSelected(true);
        jQuery(document).trigger('click.labelspopup');
        self.OnLabelChanged(self.GetAssignedLabels());
    };
    self.DeleteLabel = function (data) {
        data.IsSelected(false);
        self.OnLabelChanged(self.GetAssignedLabels());
    };
    self.GetAssignedLabels = function () {
        var labels = self.BusinessProcessesHandler.GetActive();
        if (self.Data().length) {
            jQuery.each(self.Data(), function (indexCategory, category) {
                jQuery.each(category.Labels, function (indexLabel, label) {
                    if (label.IsSelected()) {
                        labels.push(label.LabelId);
                    }
                });
            });
        }
        else {
            jQuery.each(self.DefaultLabels, function (index, label) {
                if (!self.BusinessProcessesHandler.Data().hasObject('id', label)) {
                    labels.push(label);
                }
            });
        }
        return labels;
    };
    self.GetLabelsByType = function (type) {
        var labels = [];
        if (type === self.LABELTYPE.BUSINESSPROCESS) {
            jQuery.each(self.BusinessProcessesHandler.GetActive(), function (index, label) {
                var bp = self.BusinessProcessesHandler.Data().findObject('id', label, false);
                if (bp) {
                    labels.push({
                        LabelId: bp.id,
                        LabelName: bp.abbreviation || bp.id
                    });
                }
            });
        }
        else {
            jQuery.each(self.Data(), function (indexCategory, category) {
                if (category.CategoryIndex === type) {
                    jQuery.each(category.Labels, function (indexLabel, label) {
                        if (label.IsSelected()) {
                            labels.push(label);
                        }
                    });
                }
            });
        }
        return labels;
    };
    self.GetValidationResults = function () {
        var validation = {};
        validation[self.LABELTYPE.PRIVILEGE] = { UnassignedCategories: [], UnauthorizedLabels: [], AssignedLabelsCount: 0, AssignedCategoriesCount: 0 };
        validation[self.LABELTYPE.SEARCH] = { UnassignedCategories: [], UnauthorizedLabels: [], AssignedLabelsCount: 0, AssignedCategoriesCount: 0 };
        validation.CheckPrivilegeLabelCategories = function () {
            // M4-32183 business process + assigned privilege labels should be equal or greater than minimum label categories setting in MC
            var businessProcessLabelCategoriesCount = businessProcessesModel.General.GetActive().length ? 1 : 0;
            var privilegeLabelCategoriesCount  = this[self.LABELTYPE.PRIVILEGE].AssignedCategoriesCount + businessProcessLabelCategoriesCount;
            return privilegeLabelCategoriesCount >= systemSettingHandler.GetMinLabelCategoryToPublish();
        };

        jQuery.each(self.Data(), function (indexCategory, category) {
            var selectingLabels = ko.toJS(category.Labels).findObjects('IsSelected', true);

            // check required labels
            if (category.IsRequired && !selectingLabels.length) {
                validation[category.CategoryIndex].UnassignedCategories.push(category.CategoryName);
            }

            // total assigned labels
            validation[category.CategoryIndex].AssignedLabelsCount += selectingLabels.length;

            // total assigned categories
            if (selectingLabels.length) {
                validation[category.CategoryIndex].AssignedCategoriesCount++;
            }
            
            // check un-authorized labels
            jQuery.each(selectingLabels, function (indexLabel, label) {
                if (jQuery.inArray(label.PrivilegeStatus, ['validate', 'assign', 'manage']) === -1) {
                    validation[category.CategoryIndex].UnauthorizedLabels.push(label.LabelName);
                }
            });
        });

        return validation;
    };
}
