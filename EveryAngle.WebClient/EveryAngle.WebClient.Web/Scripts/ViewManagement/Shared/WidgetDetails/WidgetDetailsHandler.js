function WidgetDetailsHandler(container, description, queryblocks, modelRoles, displayDefinitions, labels) {
    "use strict";

    var self = this;
    self.IsOpenFromSearchpage = ko.observable(false);
    self.Identity = 'WidgetDetailsHandler';
    self.Element = jQuery(container);
    self.Labels = {
        HeaderDescription: 'HeaderDescription',
        ButtonEdit: 'ButtonEdit',
        HeaderQuerySteps: Localization.AnglePanelFilterFollowup,
        HeaderModelRole: Captions.Label_Angle_ExecuteWithModelRole
    };

    // show full details or not?
    self.FullMode = ko.observable(true);

    // number of query steps (-1 = unlimited)
    self.QueryStepsLimit = ko.observable(-1);

    // set button base class info visibility
    self.CanViewBaseClassInfo = ko.observable(false);

    // show model info or not?
    self.IsVisibleModelInfo = ko.observable(false);

    // show execute with model role section or not?
    self.IsVisibleModelRoles = ko.observable(true);

    // show display list or not?
    self.IsVisibleDisplayList = ko.observable(false);

    // show widget list or not?
    self.IsVisibleWidgetList = ko.observable(false);

    // show definition list or not?
    self.IsVisibleDefinition = ko.observable(true);

    // click row for navigation?
    self.ClickableRow = ko.observable(false);

    self.CanRemoveAdhocQuery = ko.observable(true);
    self.CreateMovableArea = jQuery.noop;
    self.OnFilterMoved = jQuery.noop;
    self.View = new WidgetDetailsView();
    self.CurrentTemplate = '';
    self.Angle = null;
    self.TEMPLATEPOPUP = {
        ANGLE: 'TemplateAngleInfoPopupHeader',
        DISPLAY: 'TemplateDisplayInfoPopupHeader',
        DASHBOARD: 'TemplateDashboardInfoPopupHeader'
    };
    self.ModelUri = '';
    self.Data = {
        Description: ko.observable(description || ''),
        QueryBlocks: ko.observableArray(WC.Utility.ToArray(queryblocks)),
        ModelRoles: ko.observableArray(WC.Utility.ToArray(modelRoles)),
        DisplayDefinitions: ko.observableArray(WC.Utility.ToArray(displayDefinitions)),
        Labels: ko.observableArray(WC.Utility.ToArray(labels)),
        Widgets: ko.observableArray([]),
        
        AngleName: ko.observable(''),
        DisplayName: ko.observable(''),
        AngleDescription: ko.observable(''),
        DisplayDescription: ko.observable('')
    };

    // click events
    self.ClickShowEditPopupString = 'return false';
    self.ClickShowInfoPopupString = 'return false';
    self.ClickShowBaseClassInfoPopupString = 'return false';
    self.ClickShowQueryStepsPopupString = 'return false';
    self.ShowExecutionParameterPopup = jQuery.noop;

    self.ApplyHandler = function (template) {
        if (typeof template === 'undefined') {
            template = self.View.Template;
        }
        self.CurrentTemplate = template;
        self.Element.html(template);

        var currentBinding = ko.dataFor(self.Element.get(0));
        if (!currentBinding || (currentBinding && currentBinding.Identity !== self.Identity)) {
            var bindingTarget = self.Element.find('.widgetDetailsWrapper');
            if (!bindingTarget.length) {
                bindingTarget = self.Element;
            }
            ko.applyBindings(self, bindingTarget.get(0));

            self.InitialMovableArea();
        }
    };
    self.RefreshHandler = function () {
        self.ApplyHandler(self.CurrentTemplate);
    };
    self.InitialMovableArea = function () {
        var movableArea = self.CreateMovableArea();
        if (typeof movableArea === 'undefined') {
            return;
        }

        var dragElements = self.Element.find('.detailDefinitionList:last > li');

        dragElements.kendoDraggable({
            filter: '',
            hint: function (element) {
                return jQuery('<ul class="detailDefinitionList hint" />').width(element.width()).append(element.clone());
            },
            dragstart: function (e) {
                if (!e.sender.element.hasClass('movable')) {
                    e.preventDefault();
                }
                else {
                    movableArea.removeClass('alwaysHide');
                }
            },
            dragend: function () {
                movableArea.addClass('alwaysHide');
            }
        });

        movableArea.kendoDropTarget({
            drop: function (e) {
                var filterStepIndex = e.draggable.element.prevAll().length;
                var currentFilterStepIndex = 0;
                var moveFilterStepIndex = -1;
                var queryStepBlock = self.Data.QueryBlocks().findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
                jQuery.each(queryStepBlock.query_steps, function (index, queryStep) {
                    if (queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
                        if (filterStepIndex === currentFilterStepIndex) {
                            moveFilterStepIndex = index;
                        }
                        currentFilterStepIndex++;
                    }

                    if (moveFilterStepIndex !== -1) {
                        return false;
                    }
                });

                if (moveFilterStepIndex !== -1) {
                    var moveFilterSteps = queryStepBlock.query_steps.splice(moveFilterStepIndex, 1);
                    if (moveFilterSteps.length) {
                        self.Data.QueryBlocks(self.Data.QueryBlocks());

                        self.OnFilterMoved(e, moveFilterStepIndex, moveFilterSteps[0]);

                        self.RefreshHandler();
                    }
                }
            }
        });
    };
    self.SetData = function (description, queryblocks, modelRoles, displayDefinitions, labels) {
        self.Data.Description(description || '');
        self.Data.QueryBlocks(WC.Utility.ToArray(queryblocks));
        self.Data.ModelRoles(WC.Utility.ToArray(modelRoles));
        self.Data.DisplayDefinitions(WC.Utility.ToArray(displayDefinitions));
        self.Data.Labels(WC.Utility.ToArray(labels));
        self.InitialMovableArea();
    };

    self.SetWidget = function (labels, isVisibleDisplayList, angleAndDisplayDataList) {
        self.Data.Labels(WC.Utility.ToArray(labels));
        self.Data.Widgets(WC.Utility.ToArray(angleAndDisplayDataList));
    };

    self.AdjustLayout = function () {
        var target = self.Element.find('.sectionDescriptions > .descriptionBody').removeClass('ellipsis');

        // descripitions
        if (target.length) {
            var div = jQuery('<div />', {
                css: {
                    visibility: 'hidden',
                    position: 'absolute',
                    width: target.width(),
                    font: target.css('font-style') + ' ' + target.css('font-variant') + ' ' + target.css('font-weight') + ' ' + Math.ceil(parseFloat(target.css('font-size'))) + 'px ' + target.css('font-family')
                },
                html: target.html()
            }).appendTo('body');
            if (div.height() > 36)
                target.addClass('ellipsis');
            div.remove();
        }

        // set title & shorten
        var title, text, showIndex, size, itemSize, itemsList;
        self.Element.find('.detailDefinitionList.inline').each(function (index, item) {
            item = jQuery(item);
            itemsList = item.find('li');

            itemSize = 0;
            var itenHeader = item.prev('.definitionsHeader');
            if (itenHeader.length && itenHeader.css('display') === 'inline-block') {
                itemSize += itenHeader.outerWidth();
            }
            showIndex = 0;
            title = [];

            item.removeAttr('title').removeClass('shorten');
            itemsList.show();
            size = item.parent().width();

            itemsList.each(function (indexItemList, itemList) {
                itemList = jQuery(itemList);
                text = jQuery.trim(itemList.text());
                if (itemList.find('.validWarning').length)
                    text += ' (!)';
                title.push(text);
                itemSize += itemList.width();

                if (itemSize <= size)
                    showIndex = indexItemList;
            });

            if (itemSize > size) {
                itemsList.filter('li:gt(' + showIndex + ')').hide();
                item.attr('title', title.join(', ')).addClass('shorten');
            }
        });

        // set max-width for not inline list
        WC.HtmlHelper.AdjustNameContainer(self.Element.find('.detailDefinitionList:not(.inline)'), 0, function (size) { return size - 15; });
    };
    self.IsVisible = function (index, type) {
        if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(type)) {
            if (self.QueryStepsLimit() === -1)
                return true;

            var stepBlock = self.Data.QueryBlocks().findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            var isReachedLimit = false;
            var stepCount = 0;
            if (stepBlock) {
                var filterSteps = stepBlock.query_steps.findObjects('step_type', function (step) {
                    return WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step);
                });
                jQuery.each(stepBlock.query_steps, function (indexStep, step) {
                    if (WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step.step_type)) {
                        stepCount++;
                        if (index === indexStep) {
                            if ((filterSteps.length > self.QueryStepsLimit()) && (stepCount > (self.QueryStepsLimit() - 1))) {
                                isReachedLimit = true;
                            }
                            else {
                                isReachedLimit = false;
                            }

                            return false;
                        }
                    }
                });
            }

            return !isReachedLimit;
        }
        else {
            return false;
        }
    };
    self.IsMoreVisible = function () {
        if (self.QueryStepsLimit() === -1)
            return false;
        var stepBlock = self.Data.QueryBlocks().findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (stepBlock) {
            var filterSteps = stepBlock.query_steps.findObjects('step_type', function (step) {
                return WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step);
            });
            return filterSteps.length > self.QueryStepsLimit();
        }
        else {
            return false;
        }
    };
    self.GetDefinitionHeader = function () {
        var text = self.Labels.HeaderQuerySteps,
            stepBlock = self.Data.QueryBlocks().findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS),
            filterSteps = [];
        if (stepBlock) {
            filterSteps = stepBlock.query_steps.findObjects('step_type', function (step) {
                return WC.WidgetFilterHelper.IsFilterOrJumpQueryStep(step);
            });
        }
        if (!self.FullMode()) {
            text += ' <em onclick="' + self.ClickShowQueryStepsPopupString + '">(' + filterSteps.length + ')</em>';
        }
        else {
            text += ' <em>(' + filterSteps.length + ')</em>';
        }
        return text;
    };
    self.GetDescription = function () {
        var detail = self.Data.Description();
        if (!self.FullMode()) {
            var html = '<a class="btnInfo" onclick="' + self.ClickShowInfoPopupString + '"></a>';
            if (detail) {
                detail = WC.HtmlHelper.StripHTML(detail, true);
                html = detail + html;
            }
            return html;
        }
        else {
            return detail;
        }
    };
    self.GetModelInfo = function () {
        var modelInfoText = '';
        var modelInfo = modelsHandler.GetModelByUri(self.ModelUri);
        if (modelInfo) {
            var aboutInfo = aboutSystemHandler.GetModelInfoById(modelInfo.id);
            modelInfoText = aboutInfo ? jQuery.trim(kendo.format('{0} {1}', aboutInfo.name(), aboutInfo.date())) : '';
        }
        return modelInfoText;
    };

    self.HaveFilterDisplay = function (queryBlocks) {
        return WC.ModelHelper.HasFilter(queryBlocks);
    };
    self.HaveFollowupInDisplay = function (queryBlocks) {
        return WC.ModelHelper.HasFollowup(queryBlocks);
    };
    self.GetQueryStepCssClass = function (queryStep, index) {
        var queryStepBlock = self.Data.QueryBlocks().findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        var firstJumpIndex = queryStepBlock.query_steps.indexOfObject('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        var canMoveQueryStep = typeof self.CreateMovableArea() !== 'undefined' && (firstJumpIndex === -1 || index < firstJumpIndex);
        var cssClasses = [];
        if (queryStep.is_adhoc_filter) {
            cssClasses.push('removable');
        }
        if (canMoveQueryStep && queryStep.step_type === enumHandlers.FILTERTYPE.FILTER) {
            cssClasses.push('movable');
        }
        if (!self.CanRemoveAdhocQuery()) {
            cssClasses.push('disabled');
        }
        return cssClasses.join(' ');
    };
    self.GetInvalidDisplayCssClass = function (display) {
        var displayValidation = validationHandler.GetDisplayValidation(display, self.ModelUri);
        if (displayValidation.Level === validationHandler.VALIDATIONLEVEL.ERROR)
            return 'validError';
        else if (displayValidation.Level === validationHandler.VALIDATIONLEVEL.WARNING)
            return 'validWarning';
        else return '';
    };

    self.GetFilterText = function (data, format) {
        if (typeof data === 'string') {
            // base_classes block
            var classObj = modelClassesHandler.GetClassById(data, self.ModelUri) || { id: data };
            return userFriendlyNameHandler.GetFriendlyName(classObj, format);
        }
        else {
            // query_steps block
            return WC.WidgetFilterHelper.GetFilterText(data, self.ModelUri);
        }
    };
    self.GetInvalidErrorMessage = function (data) {
        if (typeof data === 'string') {
            // base_classes block
            var baseClassesBlock = self.Angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            if (baseClassesBlock && baseClassesBlock.valid === false) {
                return validationHandler.GetClassValidationError(baseClassesBlock, data, self.ModelUri);
            }
            return '';
        }
        else {
            // query_steps block
            var message = validationHandler.GetValidationError(data, self.ModelUri);
            jQuery.each(WC.Utility.ToArray(data.arguments), function (index, arg) {
                if (arg.valid === false) {
                    var invalidMessage = validationHandler.GetValidationError(arg, self.ModelUri);
                    if (message && invalidMessage)
                        message += ', ';
                    message += invalidMessage;
                }
            });
            return message;
        }
    };
    self.GetInvalidCssClass = function (data) {
        if (typeof data === 'string') {
            var errorMessage = self.GetInvalidErrorMessage(data);
            if (errorMessage) {
                return 'validError';
            }
            return '';
        }
        else {
            // query_steps block
            return WC.WidgetFilterHelper.GetInvalidCssClass(data);
        }
    };
    self.GetBaseClassesTitle = function (classes) {
        var messages = [], message;
        jQuery.each(classes, function (index, classId) {
            message = self.GetFilterText(classId, classes.length > 1 ? enumHandlers.FRIENDLYNAMEMODE.SHORTNAME : enumHandlers.FRIENDLYNAMEMODE.LONGNAME);
            if (self.GetInvalidErrorMessage(classId)) {
                message += ' (!)';
            }
            messages.push(message);
        });
        return messages.join(', ');
    };
    self.DeleteQueryStep = function (index, queryStep, event) {
        if (!jQuery(event.currentTarget).hasClass('disabled')) {
            displayQueryBlockModel.DeleteQueryStep(index, queryStep, event);
        }
    };
    self.GetAngleDisplayURL = function (displayDefinition) {
        var params = {};
        if (self.Angle.is_template) {
            params[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
        }
        return WC.Utility.GetAnglePageUri(self.Angle.uri, displayDefinition.uri, params);
    };
    self.GetWidgetURL = function (displayDefinition, angle) {
        var params = {};
        if (angle.is_template) {
            params[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
        }
        return WC.Utility.GetAnglePageUri(angle.uri, displayDefinition.uri, params);
    };
    self.ClickRow = function (data, event) {
        if (self.ClickableRow())
            jQuery(event.currentTarget).find('.name').trigger('click');
    };

    // M4-22971 validate angle only
    self.IsValidWidgetAngle = function (angle) {
        return !validationHandler.GetAngleValidation(angle).Valid;
    };
}

ko.bindingHandlers.SetInvalidQuery = {
    // 1/14/2015
    // M4-11682: Add integrity check to fields in querystep arguments
    // arguments for comparing field changed..
    // [ 'field:FIELD' ] -> [ { field: FIELD } ]

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        element = jQuery(element);
        element.removeClass('validWarning');

        var cssName = '';
        var invalidMessage = '';
        var isInvalid = viewModel.valid === false;
        if (isInvalid && viewModel.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
            cssName = 'validError';
            invalidMessage = validationHandler.GetValidationError(viewModel, bindingContext.$root.ModelUri);
        }
        else if (viewModel.step_type === enumHandlers.FILTERTYPE.FILTER) {
            if (isInvalid) {
                cssName = 'validWarning';
                invalidMessage = validationHandler.GetValidationError(viewModel, bindingContext.$root.ModelUri);
            }

            // M4-11682: Add integrity check to fields in querystep arguments
            jQuery.each(WC.Utility.ToArray(viewModel.arguments), function (index, arg) {
                if (arg.valid === false) {
                    cssName = 'validWarning';
                    if (invalidMessage)
                        invalidMessage += ', ';
                    invalidMessage += validationHandler.GetValidationError(arg, bindingContext.$root.ModelUri);
                }
            });
        }

        if (cssName) {
            element.addClass(cssName)
                .children('.validWarningText')
                .text(invalidMessage)
                .attr('title', invalidMessage);

            element.parent()
                .attr('onclick', '').off('click')
                .removeClass('Collapse Expand').addClass('Disabled');
        }
    }
};
