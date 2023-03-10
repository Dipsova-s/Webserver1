var followupPageHandler = new FollowupPageHandler();

function FollowupPageHandler() {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.DataFollowup = {};
    self.SelectingFollowup = null;
    self.CATEGORY = {
        UP: { Code: 'up', Text: Localization.FollowupsUpText },
        DOWN: { Code: 'down', Text: Localization.FollowupsDownText },
        LEFT: { Code: 'left', Text: Localization.FollowupsLeftText },
        RIGHT: { Code: 'right', Text: Localization.FollowupsRightText }
    };
    self.HandlerFilter = null;
    self.View = null;
    self.IsAdHocFollowup = false;
    self.ListDrilldown = false;
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/
    self.ShowPopup = function (option, title) {
        self.ListDrilldown = typeof option === 'undefined' ? false : option.ListDrilldown || false;
        self.IsAdHocFollowup = typeof option === 'undefined' ? false : option.IsAdhoc || false;
        if (self.IsAdHocFollowup) {
            fieldsChooserHandler.PopupConfig = enumHandlers.ANGLEPOPUPTYPE.DISPLAY;
        }
        else {
            fieldsChooserHandler.PopupConfig = typeof option === 'undefined' ? null : option.PopupFrom || '';
        }

        self.SelectingFollowup = null;
        self.View = new FollowupsTemplate(self);

        var popupName = 'Followup',
            popupSettings = {
                element: '#popup' + popupName,
                title: title || Captions.Popup_Followup_Title,
                className: 'popup' + popupName,
                width: Math.min(1100, WC.Window.Width - 20),
                minHeight: 430,
                buttons: [
                    {
                        text: Localization.FollowupsButtonSubmit,
                        position: 'right',
                        isPrimary: true,
                        className: 'executing',
                        click: function () {
                            self.ApplyFollowup();
                        }
                    }

                ],
                scrollable: false,
                resize: self.AdjustAreaLayout,
                open: self.ShowPopupCallback,
                close: function (e) {
                    e.sender.element.find('.followupsArea').addClass('initializing');
                    e.sender.destroy();
                }
            };

        var win = popup.Show(popupSettings);
        win.toFront();
    };
    self.ShowPopupCallback = function (e) {
        e.sender.content(self.View.TemplatePopup);
        jQuery('.popupFollowup').find('.btn').addClass('disabled');
        var target = self.HandlerFilter.FilterFor === WC.WidgetFilterHelper.FILTERFOR.DISPLAY ? enumHandlers.ANGLEPOPUPTYPE.DISPLAY : enumHandlers.ANGLEPOPUPTYPE.ANGLE;
        var followupUrl = modelsHandler.GetFollowupUri(resultModel.Data(), angleInfoModel.Data(), target);

        // classes name
        var classString = 'classes=';
        var followupClassNames = [];
        var followupClasseString = followupUrl.substr(followupUrl.indexOf(classString) + classString.length);
        if (followupClasseString.indexOf('&') !== -1) {
            followupClasseString = followupClasseString.substr(0, followupClasseString.indexOf('&'));
        }
        var modelUri = angleInfoModel.Data().model;
        jQuery.each(followupClasseString.split(','), function (index, classId) {
            var classObj = modelClassesHandler.GetClassById(classId, modelUri);
            if (!classObj) {
                classObj = modelFollowupsHandler.GetFollowupById(classId, modelUri);
            }
            followupClassNames.push(!classObj ? classId : userFriendlyNameHandler.GetFriendlyName(classObj, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME));
        });
        e.sender.element.find('.followupClass').attr('title', followupClassNames.join(',')).text(followupClassNames.join(','));

        e.sender.element.busyIndicator(true);

        jQuery.when(self.DataFollowup[followupUrl] || modelFollowupsHandler.LoadAllFollowups(followupUrl))
            .done(function (data) {
                self.DataFollowup[followupUrl] = data;

                var followupsData = WC.Utility.ToArray(data.followups);
                self.BindGridData(self.CATEGORY.UP, followupsData);
                self.BindGridData(self.CATEGORY.DOWN, followupsData);
                self.BindGridData(self.CATEGORY.LEFT, followupsData);
                self.BindGridData(self.CATEGORY.RIGHT, followupsData);

                e.sender.wrapper.find('.executing').removeClass('executing');
                e.sender.element.find('.followupsArea').data('completed', true);

                self.AdjustAreaLayout();
            })
            .always(function () {
                e.sender.element.busyIndicator(false);
            });
    };
    self.SetHandlerValues = function (handler, angleSteps, displaySteps) {
        self.HandlerFilter = handler;

        // set field chooser data
        var angleBlocks = angleInfoModel.Data().query_definition;
        var angleBaseClassBlock = angleBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        fieldsChooserHandler.ModelUri = angleInfoModel.Data().model;
        fieldsChooserHandler.AngleClasses = angleBaseClassBlock ? angleBaseClassBlock.base_classes : [];
        fieldsChooserHandler.AngleSteps = angleSteps;
        fieldsChooserHandler.DisplaySteps = displaySteps;
    };
    self.AdjustAreaLayout = function () {
        var parent = jQuery('#popupFollowup .followupsArea'),
            container = jQuery('#popupFollowup .followupsAreaInner'),
            useAnimate = parent.hasClass('initializing');

        if (!parent.data('completed'))
            return;

        var blockUp = container.children('.followupBlock.' + self.CATEGORY.UP.Code), blockUpPosition,
            blockDown = container.children('.followupBlock.' + self.CATEGORY.DOWN.Code), blockDownPosition,
            blockLeft = container.children('.followupBlock.' + self.CATEGORY.LEFT.Code), blockLeftPosition,
            blockRight = container.children('.followupBlock.' + self.CATEGORY.RIGHT.Code), blockRightPosition,
            blockClass = container.children('.followupClass'), blockClassPosition,
            blockRelations = container.children('.followupRelation'), blockRelationPosition1, blockRelationPosition2,
            blockFlows = container.children('.followupFlow'), blockFlowPosition1, blockFlowPosition2,
            blockIndicator = container.children('.followupsIndicator'), blockIndicatorPosition,
            blockButton = container.children('.followupButton'), blockButtonPosition;

        // set container height
        container.height(blockUp.outerHeight() + blockDown.outerHeight() + blockClass.outerHeight() + blockRelations.outerHeight() * 2);
        var containerSize = { width: container.width(), height: container.height() };

        if (useAnimate) {
            // set initial position
            container.children(':not(.fix)').each(function (index, block) {
                block = jQuery(block);
                block.css({
                    left: (containerSize.width - block.width()) / 2,
                    top: (containerSize.height - block.height()) / 2
                });
            });
        }

        parent.removeClass('initializing');

        var setBlockPosition = function (block, position, animate) {
            if (animate && !block.hasClass('fix')) {
                block.animate(position, 'fast');
            }
            else {
                block.css(position);
            }
        };

        var boxspace = 10;
        blockUpPosition = {
            top: 0,
            left: (containerSize.width - blockUp.outerWidth()) / 2
        };
        blockRelationPosition1 = {
            top: blockUpPosition.top + blockUp.outerHeight(),
            left: (containerSize.width - blockRelations.outerWidth()) / 2
        };
        blockClassPosition = {
            top: blockRelationPosition1.top + blockRelations.outerHeight() - boxspace,
            left: (containerSize.width - blockClass.outerWidth()) / 2
        };
        blockRelationPosition2 = {
            top: blockClassPosition.top + blockClass.outerHeight(),
            left: blockRelationPosition1.left
        };
        blockDownPosition = {
            top: blockRelationPosition2.top + blockRelations.outerHeight() - boxspace,
            left: (containerSize.width - blockUp.outerWidth()) / 2
        };
        blockFlowPosition1 = {
            top: blockClassPosition.top - boxspace,
            left: blockClassPosition.left - blockFlows.outerWidth() - boxspace
        };
        blockFlowPosition2 = {
            top: blockClassPosition.top - boxspace,
            left: blockClassPosition.left + blockClass.outerWidth() + boxspace
        };
        blockLeftPosition = {
            top: blockFlowPosition1.top - (blockLeft.outerHeight() - blockFlows.outerHeight()) / 2,
            left: blockFlowPosition1.left - blockLeft.outerWidth() - boxspace
        };
        blockRightPosition = {
            top: blockFlowPosition2.top - (blockRight.outerHeight() - blockFlows.outerHeight()) / 2,
            left: blockFlowPosition2.left + blockFlows.outerWidth() + boxspace
        };
        blockIndicatorPosition = {
            top: Math.max(containerSize.height - blockIndicator.outerHeight(), blockLeftPosition.top + blockLeft.outerHeight() + boxspace),
            left: 0
        };
        blockButtonPosition = {
            top: Math.max(containerSize.height - blockButton.outerHeight(), blockRightPosition.top + blockRight.outerHeight() + boxspace),
            left: containerSize.width - blockButton.outerWidth()
        };

        setBlockPosition(blockUp, blockUpPosition, useAnimate);
        setBlockPosition(blockDown, blockDownPosition, useAnimate);
        setBlockPosition(blockLeft, blockLeftPosition, useAnimate);
        setBlockPosition(blockRight, blockRightPosition, useAnimate);
        setBlockPosition(blockClass, blockClassPosition, useAnimate);
        setBlockPosition(blockRelations.eq(0), blockRelationPosition1, useAnimate);
        setBlockPosition(blockRelations.eq(1), blockRelationPosition2, useAnimate);
        setBlockPosition(blockFlows.eq(0), blockFlowPosition1, useAnimate);
        setBlockPosition(blockFlows.eq(1), blockFlowPosition2, useAnimate);
        setBlockPosition(blockIndicator, blockIndicatorPosition, useAnimate);
        setBlockPosition(blockButton, blockButtonPosition, useAnimate);
    };
    self.BindGridData = function (area, data) {
        var grid = jQuery('#popupFollowup .followupBlock.' + area.Code).kendoGrid({
            dataSource: new kendo.data.DataSource({
                data: data,
                filter: { field: 'category', operator: 'startswith', value: area.Code },
                sort: { field: 'long_name', dir: 'asc' }
            }),
            columns: [
                {
                    field: 'long_name',
                    headerAttributes: {
                        'class': 'blockHeader gridHeaderContainer actionable asc',
                        'onclick': 'followupPageHandler.Sortable(this)'
                    },
                    headerTemplate: '<span class="sort"><i class="icon icon-sort-asc"></i></span>' + area.Text,
                    attributes: {
                        'title': '#= long_name #',
                        'data-id': '#= id #'
                    }
                }
            ],
            resizable: false,
            pageable: false,
            dataBound: function (e) {
                if (!e.sender.dataSource.view().length) {
                    var colspan = e.sender.thead.find('th:visible').length,
                        emptyRow = '<tr><td colspan="' + colspan + '" class="grid-no-data">' + Localization.NoSearchResult + '</td></tr>';
                    e.sender.tbody.parent().width(e.sender.thead.width()).end().html(emptyRow);
                    e.sender.tbody.parent().parent().height(27);
                }
                else {
                    if (self.SelectingFollowup) {
                        jQuery('#popupFollowup .k-grid-content tr[data-uid="' + self.SelectingFollowup.uid + '"]').addClass('k-state-selected');
                    }
                }
            }
        }).data(enumHandlers.KENDOUITYPE.GRID);

        // load helptext
        var helpIDS = [], fnCheckHelp = null;
        jQuery.each(grid.dataSource.data(), function (index, followup) {
            if (followup.category === area.Code && followup.helpid) {
                helpIDS.push(followup.helpid);
            }
        });
        if (helpIDS.length) {
            grid.__helpLoaded = false;
            var deferred = [];
            while (helpIDS.length) {
                deferred.pushDeferred(helpTextHandler.LoadHelpTextByIds, [helpIDS.splice(0, 30), angleInfoModel.Data().model]);
            }

            jQuery.whenAll(deferred)
                .done(function () {
                    grid.__helpLoaded = true;
                });
        }
        else {
            grid.__helpLoaded = true;
        }

        // click handler
        grid.content.on('click', 'tr', function (e) {

            var tr = jQuery(e.currentTarget),
                isSelected = tr.hasClass('k-state-selected');
            if (tr.find('.grid-no-data').length)
                return;

            jQuery('#popupFollowup').find('.k-grid tr').removeClass('k-state-selected');
            jQuery('.popupFollowup').find('.btn').addClass('disabled');
            self.SelectingFollowup = null;
            if (!isSelected) {
                tr.addClass('k-state-selected');
                jQuery('.popupFollowup').find('.btn').removeClass('disabled');
                var dataItem = grid.dataSource.getByUid(tr.data('uid'));
                dataItem.is_adhoc_filter = self.IsAdHocFollowup;
                dataItem.is_adhoc = self.IsAdHocFollowup;
                self.SelectingFollowup = dataItem;

                clearInterval(fnCheckHelp);
                jQuery('#popupFollowup .followupsHelp').busyIndicator(true);
                self.ShowHelpText(dataItem);
                fnCheckHelp = setInterval(function () {
                    if (grid.__helpLoaded) {
                        clearInterval(fnCheckHelp);
                        self.ShowHelpText(dataItem);
                    }
                }, grid.__helpLoaded ? 0 : 100);

                jQuery('#popupFollowup').addClass('with-help');
            }
            else {
                jQuery('#popupFollowup').removeClass('with-help');
            }
        });

        // dblclick handler
        grid.content.on('dblclick', 'tr', function (e) {
            var tr = jQuery(e.currentTarget);
            if (tr.find('.grid-no-data').length)
                return;

            clearInterval(fnCheckHelp);
            WC.Ajax.AbortAll();

            jQuery('#popupFollowup').find('.k-grid tr').removeClass('k-state-selected');
            tr.addClass('k-state-selected');
            var dataItem = grid.dataSource.getByUid(tr.data('uid'));
            dataItem.is_adhoc_filter = self.IsAdHocFollowup;
            dataItem.is_adhoc = self.IsAdHocFollowup;
            self.SelectingFollowup = dataItem;

            self.ApplyFollowup();
            self.ClosePopup();
        });

        return grid;
    };
    self.Sortable = function (element) {
        element = jQuery(element);
        var field = element.data('field');
        var sortDirection = element.hasClass('asc') ? 'desc' : 'asc';
        var grid = element.parents('.k-grid:first').data(enumHandlers.KENDOUITYPE.GRID);
        var icon = jQuery('<i class="icon"/>').addClass('icon-sort-' + sortDirection);
        grid.thead.find('.k-header').removeClass('asc desc');
        element.addClass(sortDirection);
        element.find('.sort').html(icon);
        grid.dataSource.sort({ field: field, dir: sortDirection });
    };
    self.ShowHelpText = function (followup) {
        var helpArea = jQuery('#popupFollowup .followupsHelp').busyIndicator(false);
        var helpText = helpTextHandler.GetHelpTextById(followup.helpid, angleInfoModel.Data().model);
        helpArea.find('.helpHeaderContainer').html(followup.long_name || followup.id);
        helpArea.find('.helpTextContainer').html((helpText ? helpText.html_help : followup.helpid) || '');
    };
    self.ClosePopup = function () {
        popup.Close('#popupFollowup');
    };
    self.GetDefaultJumpTemplate = function (jumpId) {
        var request = angleInfoModel.Data().model + '/angles';
        var query = {};
        query['ids'] = 'EA_JUMP_TPL_' + jumpId;
        query[enumHandlers.PARAMETERS.CACHING] = false;
        query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.SCHEMA;

        return GetDataFromWebService(request, query)
            .then(function (data) {
                if (data.angles.length) {
                    var request = data.angles[0].uri;
                    var query = {};
                    query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
                    query[enumHandlers.PARAMETERS.CACHING] = false;
                    return GetDataFromWebService(request, query)
                        .then(function (angle) {
                            var defaultDisplay = WC.Utility.GetDefaultDisplay(angle.display_definitions, true);
                            if (defaultDisplay) {
                                var defaultFields = ko.toJS(defaultDisplay.fields);
                                defaultDisplay = WC.ModelHelper.RemoveReadOnlyDisplayData(defaultDisplay);
                                var displayDetails = JSON.parse(defaultDisplay.display_details);
                                delete displayDetails.drilldown_display;
                                defaultDisplay.display_details = JSON.stringify(displayDetails);
                                defaultDisplay.fields = defaultFields;

                                delete defaultDisplay.user_specific;
                                delete defaultDisplay.id;

                                return jQuery.when(defaultDisplay);
                            }
                            return jQuery.when(null);
                        });
                }
                return jQuery.when(null);
            });
    };
    self.GetQueryBlockFromJumpTemplate = function (currentBlocks, templateBlocks) {
        var currentStepBlock = currentBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        var templateStepBlock = templateBlocks.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);

        // remove un-used steps
        if (currentStepBlock) {
            currentStepBlock.query_steps.removeObject('step_type', function (stepType) {
                return stepType === enumHandlers.FILTERTYPE.AGGREGATION || stepType === enumHandlers.FILTERTYPE.SORTING;
            });
        }

        // remove un-used steps
        if (templateStepBlock) {
            templateStepBlock.query_steps.removeObject('step_type', function (stepType) {
                return stepType !== enumHandlers.FILTERTYPE.AGGREGATION && stepType !== enumHandlers.FILTERTYPE.SORTING;
            });
        }

        // combine query steps
        var querySteps = [];
        if (currentStepBlock) {
            jQuery.merge(querySteps, currentStepBlock.query_steps);
        }
        if (templateStepBlock) {
            jQuery.merge(querySteps, templateStepBlock.query_steps);
        }

        return [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: querySteps
        }];
    };
    self.ApplyFollowup = function () {
        // nothing selected
        if (!self.SelectingFollowup)
            return;

        var followup = JSON.parse(JSON.stringify(self.SelectingFollowup));
        modelFollowupsHandler.SetFollowups([followup]);
        self.ClosePopup();

        // add jump to panel
        if (!self.IsAdHocFollowup && !self.ListDrilldown) {
            self.HandlerFilter.AddFieldFollowup(followup);
            return;
        }

        // add jump & execute
        var displayHandler = anglePageHandler.HandlerDisplay.Clone();
        displayHandler.QueryDefinitionHandler.AddJump(followup);
        var jump = displayHandler.QueryDefinitionHandler.GetLastJump();
        jump.is_adhoc_filter = true;
        jump.is_adhoc(true);
        var jumpIndex = displayHandler.QueryDefinitionHandler.Data.indexOf(jump);
        if (self.ListDrilldown) {
            // add more filters for a single drilldown
            var listDrilldownParameter = JSON.parse(unescape(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)));
            jQuery.each(listDrilldownParameter, function (field, value) {
                var data = {
                    step_type: enumHandlers.FILTERTYPE.FILTER,
                    field: field,
                    operator: enumHandlers.OPERATOR.EQUALTO.Value,
                    arguments: [WC.WidgetFilterHelper.ArgumentObject(value, enumHandlers.FILTERARGUMENTTYPE.VALUE)],
                    is_adhoc_filter: true,
                    is_adhoc: true,
                    edit_mode: false
                };
                displayHandler.QueryDefinitionHandler.InsertQueryFilter(data, jumpIndex);
                jumpIndex++;
            });
        }

        // set applied flag to all adhoc
        self.ExecuteJump(displayHandler, jump, displayHandler.QueryDefinitionHandler.GetQueryDefinition().query_blocks);
    };
    self.ExecuteJump = function (displayHandler, jump, queryBlocks, extendData) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CheckingJump, false);
        progressbarModel.SetDisableProgressBar();
        displayHandler.GetJumpDisplayData(jump, queryBlocks, extendData)
            .done(function (jumpDisplay) {
                anglePageHandler.HandlerSidePanel.Open(1);
                jQuery.each(jumpDisplay.query_blocks, function (index, block) {
                    jumpDisplay.query_blocks[index] = WC.ModelHelper.RemoveReadOnlyQueryBlock(block);
                });
                displayModel.CreateTempDisplay(jumpDisplay.display_type, jumpDisplay)
                    .done(function (data) {
                        fieldSettingsHandler.ClearFieldSettings();

                        anglePageHandler.HandlerAngle.AddDisplay(data, null, true);

                        // initial data for drilldown
                        displayModel.LoadSuccess(data);
                        
                        // redirect to display
                        displayModel.GotoTemporaryDisplay(data.uri);
                    });
            });
    };
    /*EOF: Model Methods*/
}
