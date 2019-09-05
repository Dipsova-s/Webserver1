function WidgetFilterView(handler) {
    "use strict";

    var self = this;
    self.Handler = handler;
    jQuery.extend(self, new WC.ViewEngine(handler));

    self.Template = [
        '<!-- ko stopBinding: true -->',
        '<div class="definitionList" data-bind="foreach: { data: Data, as: \'query\' }, css: { sortable: $root.Sortable() && ($root.CanChange() || $root.CanRemove()), movable: $root.CanFiltersMovable(), no: !$root.HasDefinition(Data()), treeview: $root.ViewMode() === $root.VIEWMODE.TREEVIEW, readonly: !$root.CanChange() && !$root.CanRemove() }">',
            '<!-- ko if: $root.IsFilterOrJumpQueryStep(query.step_type) -->',
            '<!-- ko if: $root.IsTreeViewHeader(query) -->',
            '<div class="FilterHeader Collapse treeViewHeader" data-bind="click: $root.View.ToggleTreeViewHeader">',
                '<p>',
                    '<label class="filterText" data-bind="text: $root.GetFilterFieldName(query.field, $root.ModelUri)"></label>',
                '</p>',
                '<a class="btnInfo" data-bind="click: $root.ShowFieldInfo, clickBubble: false"></a>',
                '<a class="btnAddFilter" data-bind="click: $root.AddFilterFromTreeHeader, clickBubble: false, visible: $root.CanChange(query)"></a>',
                '<a class="btnDelete" data-bind="click: $root.RemoveTreeViewHeader, clickBubble: false, visible: $root.CanRemove(query)"></a>',
            '</div>',
            '<!-- /ko -->',
            '<div class="filterItem" data-bind="attr: { index: $index() }, css: { movable: $root.CanFilterMoveToAngle(query, $index()), noBorderBottom: $root.IsNextElementIsTreeViewHeader($element) }">',
                '<div class="FilterHeader Collapse" data-bind="attr: { id: \'FilterHeader-\' + $index() }, css: { Followup: query.step_type == enumHandlers.FILTERTYPE.FOLLOWUP, Filter: query.step_type == enumHandlers.FILTERTYPE.FILTER, Disabled: !$root.CanChange(query), Unsave: query.is_adhoc_filter }, click: $root.View.Toggle">',
                    '<p data-bind="SetInvalidQuery: query">',
                        '<label class="filterText" data-bind="text: $root.GetFilterText(query, $root.ModelUri, $root.ViewMode() === $root.VIEWMODE.TREEVIEW), css: query.step_type"></label>',
                        '<!-- ko if: $root.HasExecutionParameter() && query.step_type != enumHandlers.FILTERTYPE.FOLLOWUP -->',
                        '<span data-bind="visible: query.is_execution_parameter, css: { NoticeIcon: query.is_execution_parameter }, attr: {id: \'FilterHeader-\' + $index() + \'-Parameter\' }"></span>',
                        '<!-- /ko -->',
                        '<label class="validWarningText"></label>',
                    '</p>',
                    '<a class="btnInfo" data-bind="click: $root.ShowFieldInfo, clickBubble: false, css: { alwaysHide: $root.ViewMode() === $root.VIEWMODE.TREEVIEW }"></a>',
                    '<a class="btnDelete" data-bind="click: $root.RemoveFilter, clickBubble: false, visible: $root.CanRemove(query)"></a>',
                    '<div class="handler"></div>',
                '</div>',
                '<!-- ko if: query.step_type != enumHandlers.FILTERTYPE.FOLLOWUP -->',
                '<div class="FilterDetail Hide" data-bind="attr: { id: \'FilterDetail-\' + $index() }, visible: $root.CanChange(query)">',
                    '<div class="FilterWrapper">',
                        '<div class="filterLabel filterLabelName" data-bind="text: $root.GetFilterFieldName(query.field, $root.ModelUri)"></div>',
                        '<div class="filterInput filterInputOperator">',
                          '<div data-bind="attr: { id: \'Operator-\' + $index() + (query.step_type == enumHandlers.FILTERTYPE.SQLFILTER ? \'-TextBox\' : \'-DropdownList\') }, css: query.step_type == enumHandlers.FILTERTYPE.SQLFILTER ? \'eaText\' : \'eaDropdown\'"></div>',
                        '</div>',
                    '</div>',
                    '<div class="StatSeparate"></div>',
                    '<div data-bind="attr: { id: \'FilterDetail-\' + $index() + \'-PlaceHolder\' }" class="FilterCriteriaPlaceHolder"></div>',
                    '<!-- ko if: $root.HasExecutionParameter() && query.step_type != enumHandlers.FILTERTYPE.FOLLOWUP -->',
                    '<div class="StatSeparate"></div>',
                    '<div class="AskForValue">',
                        '<label><span class="NoticeIcon" data-bind="text: $root.FilterFor == $root.FILTERFOR.ANGLE ? Localization.AskForValueWhenTheAngleOpens : Localization.AskForValueWhenTheDisplayOpens"></span></label>',
                        '<label><input type="radio" value="true" data-bind="attr: { id: \'AskValue-\' + $index() + \'-Yes\', name: \'AskValue-\' + $index(), checked: query.is_execution_parameter() }, click: $root.ApplyFilterParameterise"/><span class="label" data-bind="text: Localization.Yes"></span></label>',
                        '<label><input type="radio" value="false" data-bind="attr: { id: \'AskValue-\' + $index() + \'-No\', name: \'AskValue-\' + $index(), checked: !query.is_execution_parameter() }, click: $root.ApplyFilterParameterise"/><span class="label" data-bind="text: Localization.No"></span></label>',
                    '</div>',
                    '<!-- /ko -->',
                '</div>',
                '<!-- /ko -->',
            '</div>',
            '<!-- /ko -->',
            '<!-- ko if: !$root.IsFilterOrJumpQueryStep(query.step_type) -->',
            '<div class="filterItem alwaysHide" data-bind="attr: { index: $index() }"></div>',
            '<!-- /ko -->',
        '</div>',
        '<!-- /ko -->'
    ].join('');

    self.TEMPLATECRITERIA = {
        DEFAULTCRITERIA: '<div class="FilterWrapper"></div>',
        BOOLEANTYPECRITERIA: [
            '<div class="FilterWrapper FilterWrapperBool">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther" data-visible="$root.CanUseCompareField()">',
                        '<input id="CompareButton-{Index}" class="btn btnDefault btnCompare" type="button" value="' + Localization.CompairValue + '" data-click="$root.ShowCompareFilterPopup(\'{DataType}\', {Index});" />',
                    '</div>',
                    '<div class="filterInputGroup1">',
                        '<label><input id="YesChoice-{Index}" type="radio" name="Boolean-{Index}" value="True" data-click="$root.ApplyFilterWhenAction({Index})" /><span class="label" id="InputYes-{Index}">' + Localization.Yes + '</span></label>',
                        '<label><input id="NoChoice-{Index}" type="radio" name="Boolean-{Index}" value="False" data-click="$root.ApplyFilterWhenAction({Index})" /><span class="label" id="InputNo-{Index}">' + Localization.No + '</span></label>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),
        COMPAREFIELD: [
            '<div class="FilterWrapper FilterWrapperCompare">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther" data-visible="$root.CanUseCompareField()">',
                        '<input id="UncompareButton-{Index}" type="button" class="btn btnUncompare" value="' + Localization.CompairValue + '" data-click="$root.ShowCompareFilterPopup(\'{DataType}\', {Index});" />',
                    '</div>',
                    '<div class="filterInputGroup1 filterInputGroupAutoResizing">',
                        '<div class="k-widget filterLabel filterLabelCompare" id="FieldCompare-{Index}" data-click="$root.View.RenderCriteriaView(\'{DataType}\', {Index});">',
                            '<input type="hidden" id="InputFieldValue-{Index}" />',
                            '<span class="filterLabelCompareName"></span>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),
        CRITERIAGROUPONE: [
            '<div class="FilterWrapper FilterWrapper1">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther" data-visible="$root.CanUseCompareField()">',
                        '<input id="CompareButton-{Index}" class="btn btnDefault btnCompare" type="button" value="' + Localization.CompairValue + '" data-click="$root.ShowCompareFilterPopup(\'{DataType}\', {Index});" />',
                    '</div>',
                    '<div class="filterInputGroup1 filterInputGroupAutoResizing">',
                        '<input id="InputValue-{Index}" />',
                        '<span id="InputUnit-{Index}" class="labelSign fixedSize"></span>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),
        CRITERIAGROUPTWO: [
            '<div class="FilterWrapper FilterWrapper2">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther" data-visible="$root.CanUseCompareField()">',
                        '<input id="CompareButton-{Index}" class="btn btnDefault btnCompare" type="button" value="' + Localization.CompairValue + '" data-click="$root.ShowCompareFilterPopup(\'{DataType}\', {Index});" />',
                    '</div>',
                    '<div class="filterInputGroup1 filterInputGroupAutoResizing">',
                        '<input id="FirstInput-{Index}" />',
                        '<div id="FirstInputUnit-{Index}" class="eaDropdown fixedSize"></div>',
                        '<span class="labelSign fixedSize lastBreakPoint" id="InputAnd-{Index}">' + Localization.And + ' </span>',
                        '<input id="SecondInput-{Index}" />',
                        '<div id="SecondInputUnit-{Index}" class="eaDropdown fixedSize"></div>',
                    '</div>',
                    '<div id="InputExample-{Index}" class="ExampleDate">',
                        '<span id="ExampleText-{Index}" class="ExampleText"></span>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),
        CRITERIAGROUPTHREE: [
            '<div class="FilterWrapper FilterWrapper3">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther">',
                        '<input id="AddSelectedValue-{Index}" type="button" value="Add" class="btn btnAdd" title="Add" data-click="$root.View.AddSelectedValue({Index}, \'{DataType}\');" />',
                        '<input id="RemoveSelectedValue-{Index}" type="button" value="Remove" class="btn btnRemove" title="Remove" data-click="$root.View.RemoveSelectedValue({Index}, \'{DataType}\');" />',
                        '<input id="RemoveAllSelectedValue-{Index}"type="button" value="RemveAll" class="btn btnRemoveAll" title="Remove all" data-click="$root.View.RemoveAllSelectedValue({Index});" />',
                    '</div>',
                    '<div class="filterInputGroup1 filterInputGroupAutoResizing">',
                        '<input id="SelectedValue-{Index}" />',
                        '<div id="ValueUnit-{Index}" class="eaDropdown fixedSize"></div>',
                        '<span id="SelectedUnit-{Index}"class="labelSign fixedSize"></span>',
                    '</div>',
                '</div>',
                '<div id="ValueList-{Index}"></div>',
            '</div>'
        ].join(''),
        CRITERIAGROUPFOUR: [
            '<div class="FilterWrapper FilterWrapper4">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther">',
                        '<a id="OpenEnumPopup-{Index}" type="button" class="btn btnDefault btnEnumPopup" title="Open new window" data-click="$root.View.ShowEnumurateEnlargePopup({Index});"></a>',
                    '</div>',
                    '<div class="filterInputGroup1">',
                        '<div id="ValueList-{Index}"></div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),
        CRITERIAGROUPFOUR_POPUP: [
            '<div class="FilterWrapper FilterWrapper4">',
                '<div class="filterLabel" id="InputTitle-{Index}">' + Localization.InputTitleSelectValue + '</div>',
                '<div class="filterInput filterInputData">',
                    '<div class="filterInputGroupOther">',
                        '<input id="SellectAll-{Index}" type="button" class="btn btnSelectAll" title="Select all" data-click="$root.View.SelectAllList({Index});" />',
                        '<input id="DeselectAll-{Index}" type="button" class="btn btnDeselectAll" title="Deselect all" data-click="$root.View.DeselectAllList({Index});" />',
                        '<input id="InvertSelect-{Index}" type="button" class="btn btnInvertSelect" title="Invert selection" data-click="$root.View.InvertSelectList({Index});" />',
                    '</div>',
                    '<div class="filterInputGroup1">',
                            '<div class="searchBoxWrapper" id="enumListFilter">',
                                '<input id="txtFitlerEnum" type="text" placeholder="' + Localization.DomainElementFilter + '">',
                                '<a id="btnFitlerEnum"></a>',
                             '</div>',
                             '<input id="EnumDropdown-{Index}" class="eaDropdown eaDropdownSize40" />',
                        '<div id="ValueListEnlarge-{Index}"></div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),

        CRITERIAADVANCE: [
            '<div class="FilterWrapper FilterWrapperAdvance">',
                '<div class="filterLabel" id="InputTitle-{Index}">',
                    '<input class="eaDropdown" id="InputType-{Index}" />',
                '</div>',
                '<div class="filterInput filterInputData"></div>',
            '</div>'
        ].join(''),
        CRITERIAADVANCE_VALUE: [
            '<div class="filterInputGroup1 filterInputGroupValue filterInputGroupAutoResizing">',
                '<input id="InputValue-{Index}" />',
            '</div>'
        ].join(''),
        CRITERIAADVANCE_FUNCTION: [
            '<div class="filterInputGroup1 filterInputGroupFunction filterInputGroupAutoResizing">',
                '<div class="inputFunctionValue">',
                    '<input id="InputFunctionValue-{Index}" />',
                '</div>',
                '<input class="eaDropdown fixedSize" id="InputFunctionUnit-{Index}" />',
            '</div>'
        ].join(''),
        CRITERIAADVANCE_FIELD: [
            '<div class="filterInputGroup1 filterInputGroupField filterInputGroupAutoResizing">',
                '<div class="k-widget filterLabel filterLabelCompare" id="FieldCompare-{Index}">',
                    '<input type="hidden" id="InputFieldValue-{Index}" />',
                    '<span class="filterLabelCompareName"></span>',
                    '<a class="btnDeleteField" data-click="$root.View.RenderCriteriaView(\'{DataType}\', \'{Index}\');" data-visible="$root.CanUseCompareField()"></a>',
                '</div>',
                '<input id="CompareButton-{Index}" class="btn btnDefault btnCompare fixedSize" type="button" value="' + Localization.CompairValue + '" data-click="$root.ShowCompareFilterPopup(\'{DataType}\', \'{Index}\');" data-visible="$root.CanUseCompareField()" />',
            '</div>'
        ].join('')
    };
    self.TemplateEnumDropdown = function (data, domainPath) {
        var template = '';
        if (domainPath) {
			jQuery.injectCSS('.domainIcon.' + data.id + ' { background-image: url("' + (GetImageFolderPath() + 'domains/' + domainPath + '/' + domainPath + data.id + '.png').toLowerCase() + '"); }', data.id);
            template += '<span class="domainIcon ' + data.id + '"></span>';
        }
        template += '<span>' + self.Handler.GetEnumText(data.id, data.short_name, data.long_name) + '</span>';

        return template;
    };
    self.TemplateEnumDropdownGrid = function (data, domainPath, elementId) {
        var template = '<input type="checkbox"' + (data.checked ? ' checked' : '') + ' data-index="' + data.index + '" data-click="$root.View.ApplyWhenClickEnumListGrid(this, \'' + elementId + '\');" />';
        template += '<span class="label">';
        if (domainPath && data.id !== null) {
			jQuery.injectCSS('.domainIcon.' + data.id + ' { background-image: url("' + (GetImageFolderPath() + 'domains/' + domainPath + '/' + domainPath + data.id + '.png').toLowerCase() + '"); }', data.id);
            template += '<i class="domainIcon ' + data.id + '"></i>';
        }

        template += self.Handler.GetEnumText(data.id, data.short_name, data.long_name, elementId.indexOf('ValueListEnlarge') !== -1 ? self.Handler.FilterEnumFormat : null) + '</span>';
        return '<label>' + template + '</label>';
    };

    // ======================== First Part =====================================
    self.GetHtmlElementById = function (id) {
        return self.Handler.Element.find('[id="' + id + '"]');
    };
    self.CleanHtmlElements = function () {
        self.Handler.Element.find('[data-role="dropdownlist"]').each(function () {
            var ddl = WC.HtmlHelper.DropdownList(this);
            if (ddl) {
                ddl.destroy();
            }

            if (this.id) {
                jQuery('[id="' + this.id + '-list"]').remove();
            }
        });
    };
    self.BindingAndSortingElementFilter = function () {
        self.Handler.Element.html(self.Handler.View.Template);

        var currentBinding = ko.dataFor(self.Handler.Element.get(0));
        if (!currentBinding || currentBinding.Identity !== self.Handler.Identity) {
            ko.applyBindings(self.Handler, self.Handler.Element.find('.definitionList').get(0));

            if (self.Handler.VIEWMODE.TREEVIEW === self.Handler.ViewMode()) {
                self.Handler.Data.valueHasMutated();
                self.Handler.Element.find('.filterItem').addClass('Hide');
            }

            self.InitialSortable();
            self.InitialEnumerateFilter();
        }
    };

    // move filter
    self.MoveFilterConfirmMessage = '';
    self.CreateMovableArea = jQuery.noop;
    self.OnFilterMoved = jQuery.noop;
    window.EnumGridFilterCache = {};
    self.InitialSortable = function () {
        var container = self.Handler.Element.find('.definitionList');
        var containerCss, containerSize, containerScrollPositon, fnCheckAutoScroll;
        var lastMoveIndex = 0;
        var itemOpenIndex = -1;
        var isItemOpening = false;
        var movableArea = self.CreateMovableArea() || jQuery();
        var movableConnectArea = movableArea.length ? '#' + movableArea.attr('id') : null;
        if (movableArea.length) {
            movableArea.kendoSortable({
                move: function () {
                    movableArea.addClass('focus');
                }
            });
        }

        var applyOnEnd = function (e) {
            clearTimeout(fnCheckAutoScroll);

            setTimeout(function () {
                e.sender.element.removeClass('filtersSorting')
                    .children('.filterItem').removeClass('filterItemDisabled');

                // clear drop area
                movableArea.addClass('alwaysHide focus');

                // apply handler
                self.Handler.ReApplyHandler();
                self.Handler.Element.find('.definitionList').attr('style', containerCss).scrollTop(containerScrollPositon);
                if (itemOpenIndex !== -1) {
                    self.Toggle('FilterHeader-' + itemOpenIndex);
                }
            }, 1);
        };

        container.kendoSortable({
            connectWith: movableConnectArea,
            filter: '.filterItem:not(.filterItemDisabled)',
            ignore: '.FilterDetail *',
            hint: function (element) {
                return jQuery('<div class="definitionList sortable filtersSorting" />').append(element.clone().addClass('filterHint'));
            },
            handler: '.handler',

            // don't use this option
            //axis: 'y',

            start: function (e) {
                isItemOpening = e.item.find('.FilterDetail.Show').length;
                itemOpenIndex = -1;

                if (e.item.children('.Followup').length) {
                    e.preventDefault();
                }
                else {
                    // show drop area
                    if (e.item.hasClass('movable')) {
                        movableArea.removeClass('alwaysHide focus');
                    }

                    containerSize = container.height();
                    containerCss = container.attr('style');
                    containerScrollPositon = container.scrollTop();

                    lastMoveIndex = this.indexOf(e.item);
                    fnCheckAutoScroll = null;

                    e.sender.element.addClass('filtersSorting');
                    e.draggableEvent.sender.hint.width(e.item.outerWidth());

                    var foundDisabled = false;
                    e.item.prevAll().each(function (index, item) {
                        item = jQuery(item);

                        if (foundDisabled || item.children('.Followup').length) {
                            foundDisabled = true;
                            item.addClass('filterItemDisabled');
                        }
                    });

                    foundDisabled = false;
                    e.item.nextAll().each(function (index, item) {
                        item = jQuery(item);

                        if (foundDisabled || item.children('.Followup').length) {
                            foundDisabled = true;
                            item.addClass('filterItemDisabled');
                        }
                    });
                }
            },
            move: function (e) {
                if (fnCheckAutoScroll == null) {
                    var newIndex = this.indexOf(e.list.placeholder);
                    var placeholderPosition = e.list.placeholder.position().top;
                    var itemSize = 44;
                    var autoScrollSize = itemSize * 2;
                    if (newIndex > lastMoveIndex && placeholderPosition > containerSize - autoScrollSize) {
                        // move down
                        self.Handler.Element.find('.definitionList').scrollTop(self.Handler.Element.find('.definitionList').scrollTop() + itemSize);
                        fnCheckAutoScroll = setTimeout(function () {
                            fnCheckAutoScroll = null;
                            self.Handler.Element.find('.definitionList').scrollTop(self.Handler.Element.find('.definitionList').scrollTop() + itemSize);
                        }, 500);
                    }
                    else if (newIndex < lastMoveIndex && placeholderPosition < autoScrollSize) {
                        // move up
                        self.Handler.Element.find('.definitionList').scrollTop(self.Handler.Element.find('.definitionList').scrollTop() - itemSize);
                        fnCheckAutoScroll = setTimeout(function () {
                            fnCheckAutoScroll = null;
                            self.Handler.Element.find('.definitionList').scrollTop(self.Handler.Element.find('.definitionList').scrollTop() - itemSize);
                        }, 500);
                    }
                    lastMoveIndex = newIndex;
                }

                movableArea.removeClass('focus');
            },
            end: applyOnEnd,
            change: function (e) {
                var prevDisabledItemsCount = e.item.prevAll('.filterItemDisabled').length;
                var oldIndex = prevDisabledItemsCount + e.oldIndex;
                var newIndex = prevDisabledItemsCount + e.newIndex;

                // clean element
                self.CleanHtmlElements();
                e.item.remove();

                // move
                if (e.newIndex === -1) {
                    var checkValidArgument = validationHandler.CheckValidExecutionParameters([self.Handler.Data()[oldIndex]], self.Handler.ModelUri);
                    if (!checkValidArgument.IsAllValidArgument) {
                        popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
                        itemOpenIndex = oldIndex;
                    }
                    else {
                        popup.Confirm(self.MoveFilterConfirmMessage, function () {
                            var movedFilters = self.Handler.Data.remove(self.Handler.Data()[oldIndex]);
                            if (movedFilters.length) {
                                self.OnFilterMoved(movedFilters[0], oldIndex);
                            }
                            else {
                                itemOpenIndex = oldIndex;
                            }
                            applyOnEnd(e);
                        }, function () {
                            itemOpenIndex = oldIndex;
                            applyOnEnd(e);
                        });
                    }
                }
                else {
                    self.Handler.Data.moveTo(oldIndex, newIndex);

                    if (isItemOpening) {
                        itemOpenIndex = newIndex;
                    }
                }
            }
        });
    };
    self.InitialEnumerateFilter = function () {
        var fnCheckSelectedElement;
        jQuery(document).off('keydown.grid_eunm_filter').on('keydown.grid_eunm_filter', function (e) {
            var gridElement = jQuery('.gridEnumList.focus:visible');
            if (gridElement.length) {
                // prevent BACKSPACE key
                if (e.keyCode === 8) {
                    e.preventDefault();
                }
                else {
                    // handle numpad key
                    if (e.keyCode >= 96 && e.keyCode <= 105) {
                        e.keyCode -= 48;
                    }
                    var filterChar = $.trim(String.fromCharCode(e.keyCode));
                    if (filterChar) {
                        var grid = gridElement.data(enumHandlers.KENDOUITYPE.GRID);
                        if (grid) {
                            var matchedFilterIndexes = (window.EnumGridFilterCache[gridElement.data('key')] || {})[filterChar.toLowerCase()];
                            if (matchedFilterIndexes && matchedFilterIndexes.length) {
                                var currentCursor;
                                var selectingRow = grid.select();
                                if (!selectingRow.length) {
                                    currentCursor = -1;
                                }
                                else {
                                    currentCursor = selectingRow.find(':checkbox').data('index');
                                }

                                var resultIndex = matchedFilterIndexes[0];
                                jQuery.each(matchedFilterIndexes, function (index, matchedIndex) {
                                    if (matchedIndex > currentCursor) {
                                        resultIndex = matchedIndex;
                                        return false;
                                    }
                                });

                                // scroll to view
                                var itemHeight = grid.virtualScrollable.itemHeight;
                                var currentScrollPosition = grid.virtualScrollable.verticalScrollbar.scrollTop();
                                var contentHeight = Math.floor(grid.content.height() / itemHeight) * itemHeight;
                                var scrollPosition = resultIndex * itemHeight;
                                if (scrollPosition <= currentScrollPosition || scrollPosition >= currentScrollPosition + contentHeight) {
                                    grid.virtualScrollable.verticalScrollbar.scrollTop(scrollPosition - itemHeight);
                                }

                                clearInterval(fnCheckSelectedElement);
                                fnCheckSelectedElement = setInterval(function () {
                                    var target = grid.content.find('[data-index="' + resultIndex + '"]');
                                    if (target.length) {
                                        grid.select(target.parents('tr:first'));
                                        clearInterval(fnCheckSelectedElement);
                                    }
                                }, 1);
                            }
                        }
                    }
                }
            }
        });

        jQuery(document).off('click.grid_eunm_filter').on('click.grid_eunm_filter', function (e, target) {
            var sender = jQuery(target || e.target);
            target = jQuery('.gridEnumList');

            if (target.length === 1
                && (sender.hasClass('gridEnumList') || sender.parents('.gridEnumList').length)) {
                target.addClass('focus');
            }
            else {
                target.removeClass('focus');
            }
        });
    };
    // move filter

    self.KoCleanNode = function () {
        ko.cleanNode(self.Handler.Element.find('.definitionList').get(0));
    };
    self.Toggle = function (data, event) {
        var toggleElement = self.Handler.Element.find('.filterItem');
        var element = typeof data === 'string' ? self.GetHtmlElementById(data) : jQuery(event.currentTarget);

        if (!element.hasClass('Disabled') && !element.hasClass('Followup')) {
            if (element.hasClass('Expand')) {
                element.removeClass('Expand').addClass('Collapse');
                element.next().removeClass('Show').addClass('Hide');

                toggleElement.children().removeClass('FilterDisable');
            }
            else {
                element.removeClass('Collapse FilterDisable').addClass('Expand');
                var filterBody = element.next().removeClass('FilterDisable Hide').addClass('Show');

                // refresh virtual grid scrollbar
                var grid = filterBody.find('.k-grid').data(enumHandlers.KENDOUITYPE.GRID);
                if (grid && grid.virtualScrollable) {
                    grid.virtualScrollable.refresh();
                }

                toggleElement.each(function () {
                    var elementItem = jQuery(this);
                    if (element.attr('id') !== elementItem.children().attr('id')) {
                        elementItem.children().removeClass('Expand').addClass('Collapse FilterDisable');
                        elementItem.children().next().removeClass('Show').addClass('Hide');
                    }
                });

                // scroll to the opening element
                var container = self.Handler.Element.find('.definitionList');
                var containerHeight = container.height();
                var containerTop = container.offset().top;
                var containerBottom = containerTop + containerHeight;
                var targetElement = element.parent();
                var targetHeight = targetElement.height();
                var targetTop = targetElement.offset().top;
                var targetBottom = targetTop + targetHeight;
                if (targetHeight + 50 > containerHeight) {
                    container.scrollTop(targetTop - containerTop + container.scrollTop() - 1);
                }
                else if (targetTop < containerTop) {
                    container.scrollTop(targetTop - containerTop + container.scrollTop() - 50);
                }
                else if (targetBottom > containerBottom) {
                    container.scrollTop(targetTop - containerTop + container.scrollTop() - (containerHeight - targetHeight - 50));
                }
            }
        }

        self.AdjustLayout();
    };
    self.ToggleTreeViewHeader = function (elementId, event) {
        var element = self.GetTreeViewHeader(elementId, event);
        if (element.hasClass('Expand')) {
            // close current
            self.CollapsePanel(element);
            self.HandleTreeViewHeaderTextColor(element);
        }
        else {
            self.CollapseAllAndExpandSelectedPanel(element);
        }
    };
    self.GetTreeViewHeader = function (elementId, event) {
        return typeof elementId === 'string' ? self.GetHtmlElementById(elementId).parent().prev('.treeViewHeader') : jQuery(event.currentTarget);
    };
    self.CollapsePanel = function (target) {
        target.removeClass('Expand').addClass('Collapse FilterDisable');
        target.nextUntil('.FilterHeader').removeClass('Show').addClass('Hide');
    };
    self.HandleTreeViewHeaderTextColor = function (element) {
        var allFilterHeaders = element.siblings('.FilterHeader').andSelf();
        allFilterHeaders.removeClass('FilterDisable');
    };
    self.CollapseAllAndExpandSelectedPanel = function (element) {
        // close all
        var toggleElements = self.Handler.Element.find('.treeViewHeader');
        toggleElements.each(function () {
            self.CollapsePanel(jQuery(this));
        });

        // expand current
        element.removeClass('Collapse FilterDisable').addClass('Expand');
        var filterBody = element.nextUntil('.FilterHeader').removeClass('Hide').addClass('Show');

        // refresh virtual grid scrollbar
        filterBody.find('.k-grid').each(function () {
            var grid = jQuery(this).data(enumHandlers.KENDOUITYPE.GRID);
            if (grid && grid.virtualScrollable) {
                grid.virtualScrollable.refresh();
            }
        });
    };
    self.AdjustLayout = function (placeholders) {
        if (typeof placeholders === 'undefined')
            placeholders = self.Handler.Element.find('.definitionList:visible .FilterWrapper');

        placeholders.each(function (index, placeholder) {
            placeholder = jQuery(placeholder);

            var filterHeader = placeholder.parents('.FilterDetail:first').prev('.FilterHeader');
            var filterHeadertextSize = filterHeader.children('p').width() - 15;
            if (filterHeader.find('.NoticeIcon').length)
                filterHeadertextSize -= 20;

            filterHeader.children('p').children('label:first').css('max-width', filterHeadertextSize);

            var size, autoSizeSpace, autoSizeUI,
                uiAutoSizeCount, uiExtraAutoSizeCount, uiExtraMinWidth,
                uiMargin = 5, autoSizeUIWidth;
            var setAutoSize = function (elements) {
                elements.each(function (i, ui) {
                    ui = jQuery(ui);
                    if (ui.hasClass('fixedSize')) {
                        autoSizeSpace -= ui.outerWidth(true);
                    }
                    else if (ui.hasClass('custom-datetimepicker') || ui.hasClass('k-timespanpicker')) {
                        uiAutoSizeCount++;
                        uiExtraAutoSizeCount++;

                        var minWidth = parseFloat(ui.css('min-width'));
                        if (!isNaN(minWidth) && minWidth > uiExtraMinWidth)
                            uiExtraMinWidth = minWidth;
                    }
                    else {
                        uiAutoSizeCount++;
                    }
                });
                autoSizeUIWidth = Math.max(100, Math.floor(autoSizeSpace / uiAutoSizeCount) - uiMargin);
                autoSizeUI.outerWidth(autoSizeUIWidth);
            };
            var controlContainer = placeholder.find('.filterInputGroupAutoResizing');
            if (controlContainer.length) {
                var filterDetail = placeholder.closest('.FilterDetail');
                var filterDetailClassName = filterDetail.attr('class');
                filterDetail.removeClass('Hide');
                var controls = controlContainer.children(':visible').css('width', '');
                if (controls.length) {
                    // -1 prevent zoom
                    size = controlContainer.width() - 1;
                    autoSizeSpace = size;
                    autoSizeUI = controls.filter(':not(.fixedSize)');
                    uiAutoSizeCount = 0;
                    uiExtraAutoSizeCount = 0;
                    uiExtraMinWidth = 0;

                    // set 1st line
                    setAutoSize(controls);

                    // if display 2 lines
                    var lastBreakPoint = controlContainer.find('.lastBreakPoint:visible');
                    if (uiExtraMinWidth < autoSizeUIWidth)
                        uiExtraAutoSizeCount = 0;

                    if (lastBreakPoint.length && autoSizeUIWidth * (uiAutoSizeCount + uiExtraAutoSizeCount) > autoSizeSpace - (uiMargin * uiAutoSizeCount)) {
                        autoSizeSpace = size;
                        uiAutoSizeCount = 0;
                        uiExtraAutoSizeCount = 0;
                        setAutoSize(lastBreakPoint.prevAll(':visible').andSelf());
                    }
                }
                filterDetail.attr('class', filterDetailClassName);
            }
        });
    };

    self.GenerateTemplate = function (templateName, fieldType, index) {
        var template = self.TEMPLATECRITERIA[templateName];
        template = template.replace(/\{DataType\}/g, fieldType);
        template = template.replace(/\{Index\}/g, index);

        return template;
    };
    self.SetFirtFilterOrJumpCssClass = function (index) {
        var element = self.GetHtmlElementById('FilterHeader-' + index);
        element.parent().addClass('first');
    };
    self.SetOperatorDropdownListAttribute = function (element, fieldType, index) {
        element.attr('alt', fieldType + '-' + index);
    };
    self.RenderCriteriaView = function (dataType, index) {
        var criteria = self.GetDropdownOperatorValue(index);
        self.GenerateCriteriaView(dataType, criteria, 'Operator-' + index + '-DropdownList', []);
    };
    self.GenerateCriteriaView = function (fieldType, selectedCriteria, elementId, queryFilter) {
        var uiName, inputElement;
        var elementAlt = self.GetHtmlElementById(elementId).attr('alt');
        var elementIndex = elementAlt.split('-')[1];
        var placeholder = self.GetHtmlElementById('FilterDetail-' + elementIndex + '-PlaceHolder');
        var statSeparate = placeholder.prev('.StatSeparate');

        var templateName = self.Handler.GetTemplateName(fieldType, selectedCriteria);
        placeholder.empty().html(self.GenerateTemplate(templateName, fieldType, elementIndex));
        self.ApplyCustomView(placeholder);
        statSeparate.show();

        switch (selectedCriteria) {
            case enumHandlers.OPERATOR.HASVALUE.Value:
            case enumHandlers.OPERATOR.HASNOVALUE.Value:
                statSeparate.hide();
                break;
            case enumHandlers.OPERATOR.EQUALTO.Value:
            case enumHandlers.OPERATOR.NOTEQUALTO.Value:
            case enumHandlers.OPERATOR.BEFORE.Value:
            case enumHandlers.OPERATOR.AFTER.Value:
            case enumHandlers.OPERATOR.BEFOREORON.Value:
            case enumHandlers.OPERATOR.AFTERORON.Value:
            case enumHandlers.OPERATOR.SMALLERTHAN.Value:
            case enumHandlers.OPERATOR.GREATERTHAN.Value:
            case enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value:
            case enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value:
            case enumHandlers.OPERATOR.BEFOREOREQUAL.Value:
            case enumHandlers.OPERATOR.AFTEROREQUAL.Value:
                self.GetHtmlElementById('InputUnit-' + elementIndex).hide();

                switch (fieldType) {
                    case enumHandlers.FIELDTYPE.BOOLEAN:
                        if (self.IsQueryFilterHasValue(queryFilter)) {
                            var inputStates = self.GetBooleanInputStates(queryFilter[0].value);
                            self.GetHtmlElementById('YesChoice-' + elementIndex).prop('checked', inputStates.yes);
                            self.GetHtmlElementById('NoChoice-' + elementIndex).prop('checked', inputStates.no);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.DATE:
                    case enumHandlers.FIELDTYPE.DATETIME:
                        // do nothing: move to GenerateAdvanceCriteriaView
                        break;
                    case enumHandlers.FIELDTYPE.DOUBLE:
                    case enumHandlers.FIELDTYPE.INTEGER:
                    case enumHandlers.FIELDTYPE.CURRENCY:
                    case enumHandlers.FIELDTYPE.PERCENTAGE:
                        self.BindingTextNumeric('InputValue-' + elementIndex, fieldType);

                        if (fieldType !== enumHandlers.FIELDTYPE.CURRENCY) {
                            self.GetHtmlElementById('InputUnit-' + elementIndex).hide();
                        }
                        else {
                            self.GetHtmlElementById('InputUnit-' + elementIndex).show()
                                .text(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_CURRENCY));
                        }

                        inputElement = self.GetHtmlElementById('InputValue-' + elementIndex);
                        if (inputElement.length) {
                            uiName = inputElement.data('role') === 'numerictextbox' ? enumHandlers.KENDOUITYPE.NUMERICTEXT : enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
                            if (self.IsQueryFilterHasValue(queryFilter)) {
                                if (fieldType === enumHandlers.FIELDTYPE.CURRENCY
                                    && queryFilter[0].value != null
                                    && typeof queryFilter[0].value === 'object') {
                                    inputElement.data(uiName).value(queryFilter[0].value.a);
                                }
                                else {
                                    inputElement.data(uiName).value(queryFilter[0].value);
                                }
                            }
                        }

                        break;
                    case enumHandlers.FIELDTYPE.PERIOD:
                        self.BindingTextNumeric('FirstInput-' + elementIndex, fieldType);
                        self.BindingUnitDropdownList('FirstInputUnit-' + elementIndex, fieldType);
                        self.GetHtmlElementById('InputAnd-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInputSign-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInput-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('InputExample-' + elementIndex).hide();

                        inputElement = self.GetHtmlElementById('FirstInput-' + elementIndex);
                        if (inputElement.length) {
                            uiName = inputElement.data('role') === 'numerictextbox' ? enumHandlers.KENDOUITYPE.NUMERICTEXT : enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
                            if (self.IsQueryFilterHasValue(queryFilter)) {
                                var exampleDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
                                exampleDate.setDate(exampleDate.getDate() + parseFloat(queryFilter[0].value));
                                inputElement.data(uiName).value(queryFilter[0].value);
                            }
                        }

                        break;
                    case enumHandlers.FIELDTYPE.TEXT:
                        inputElement = self.GetHtmlElementById('InputValue-' + elementIndex).addClass('eaText');
                        self.GetHtmlElementById('InputUnit-' + elementIndex).hide();
                        self.BindingInputTextEvent('InputValue-' + elementIndex, elementIndex);

                        if (self.IsQueryFilterHasValue(queryFilter)) {
                            inputElement.val(queryFilter[0].value);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.ENUM:
                        self.GetHtmlElementById('InputValue-' + elementIndex).addClass('eaDropdown');

                        var defaultFilter = null;
                        if (self.IsQueryFilterHasValue(queryFilter)) {
                            defaultFilter = queryFilter[0].value;
                        }

                        self.BindingEnumeratedDropdownList('InputValue-' + elementIndex, self.Handler.Data()[elementIndex].field, defaultFilter);

                        self.GetHtmlElementById('InputUnit-' + elementIndex).hide();
                        break;
                    case enumHandlers.FIELDTYPE.TIME:
                        self.BindingTimePicker('InputValue-' + elementIndex);
                        inputElement = self.GetHtmlElementById('InputValue-' + elementIndex);

                        if (self.IsQueryFilterHasValue(queryFilter)) {
                            var timeValue = WC.WidgetFilterHelper.ConvertUnixTimeToPicker(queryFilter[0].value);
                            inputElement.data(enumHandlers.KENDOUITYPE.TIMEPICKER).value(timeValue);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.TIMESPAN:
                        self.BindingTimeSpanPicker('InputValue-' + elementIndex);
                        inputElement = self.GetHtmlElementById('InputValue-' + elementIndex);

                        if (self.IsQueryFilterHasValue(queryFilter)) {
                            inputElement.data(enumHandlers.KENDOUITYPE.TIMESPANPICKER).value(queryFilter[0].value);
                        }
                        break;
                    default:
                        break;
                }
                break;
            case enumHandlers.OPERATOR.BETWEEN.Value:
            case enumHandlers.OPERATOR.NOTBETWEEN.Value:
                switch (fieldType) {
                    case enumHandlers.FIELDTYPE.DATE:
                    case enumHandlers.FIELDTYPE.DATETIME:
                        // do nothing: move to GenerateAdvanceCriteriaView
                        break;
                    case enumHandlers.FIELDTYPE.DOUBLE:
                    case enumHandlers.FIELDTYPE.INTEGER:
                    case enumHandlers.FIELDTYPE.CURRENCY:
                    case enumHandlers.FIELDTYPE.PERCENTAGE:
                        self.GetHtmlElementById('FirstInputSign-' + elementIndex).hide();
                        self.BindingTextNumeric('FirstInput-' + elementIndex, fieldType);
                        self.GetHtmlElementById('FirstInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInputSign-' + elementIndex).hide();
                        self.BindingTextNumeric('SecondInput-' + elementIndex, fieldType);
                        self.GetHtmlElementById('SecondInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('InputExample-' + elementIndex).hide();
                        self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');

                        if (self.IsQueryFilterHasValues(queryFilter)) {
                            uiName = self.GetHtmlElementById('FirstInput-' + elementIndex).data('role') === 'numerictextbox' ? enumHandlers.KENDOUITYPE.NUMERICTEXT : enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
                            self.GetHtmlElementById('FirstInput-' + elementIndex).data(uiName).value(queryFilter[0].value);
                            self.GetHtmlElementById('SecondInput-' + elementIndex).data(uiName).value(queryFilter[1].value);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.PERIOD:
                        self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');
                        self.GetHtmlElementById('FirstInputUnit-' + elementIndex).show();
                        self.GetHtmlElementById('SecondInputUnit-' + elementIndex).show();
                        self.GetHtmlElementById('InputExample-' + elementIndex).hide();
                        self.BindingTextNumeric('FirstInput-' + elementIndex, fieldType);
                        self.BindingUnitDropdownList('FirstInputUnit-' + elementIndex, fieldType);
                        self.BindingTextNumeric('SecondInput-' + elementIndex, fieldType);
                        self.BindingUnitDropdownList('SecondInputUnit-' + elementIndex, fieldType);

                        if (self.IsQueryFilterHasValues(queryFilter)) {
                            var firstDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
                            var secondDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
                            firstDate.setDate(firstDate.getDate() + parseFloat(queryFilter[0].value));
                            secondDate.setDate(secondDate.getDate() + parseFloat(queryFilter[1].value));
                            self.GetHtmlElementById('FirstInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value(queryFilter[0].value);
                            self.GetHtmlElementById('SecondInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value(queryFilter[1].value);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.TEXT:
                        self.GetHtmlElementById('FirstInput-' + elementIndex).addClass('eaText');
                        self.GetHtmlElementById('FirstInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInput-' + elementIndex).addClass('eaText');
                        self.GetHtmlElementById('SecondInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('InputExample-' + elementIndex).hide();
                        self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');
                        self.BindingInputTextEvent('FirstInput-' + elementIndex, elementIndex);
                        self.BindingInputTextEvent('SecondInput-' + elementIndex, elementIndex);

                        if (self.IsQueryFilterHasValues(queryFilter)) {
                            self.GetHtmlElementById('FirstInput-' + elementIndex).val(queryFilter[0].value);
                            self.GetHtmlElementById('SecondInput-' + elementIndex).val(queryFilter[1].value);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.TIME:
                        self.GetHtmlElementById('FirstInputSign-' + elementIndex).hide();
                        self.BindingTimePicker('FirstInput-' + elementIndex);
                        self.GetHtmlElementById('FirstInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInputSign-' + elementIndex).hide();
                        self.BindingTimePicker('SecondInput-' + elementIndex);
                        self.GetHtmlElementById('SecondInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('InputExample-' + elementIndex).hide();
                        self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');

                        if (self.IsQueryFilterHasValues(queryFilter)) {
                            var timeValue1 = WC.WidgetFilterHelper.ConvertUnixTimeToPicker(queryFilter[0].value);
                            self.GetHtmlElementById('FirstInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.TIMEPICKER).value(timeValue1);

                            var timeValue2 = WC.WidgetFilterHelper.ConvertUnixTimeToPicker(queryFilter[1].value);
                            self.GetHtmlElementById('SecondInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.TIMEPICKER).value(timeValue2);
                        }
                        break;
                    case enumHandlers.FIELDTYPE.TIMESPAN:
                        self.GetHtmlElementById('FirstInputSign-' + elementIndex).hide();
                        self.BindingTimeSpanPicker('FirstInput-' + elementIndex);
                        self.GetHtmlElementById('FirstInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SecondInputSign-' + elementIndex).hide();
                        self.BindingTimeSpanPicker('SecondInput-' + elementIndex);
                        self.GetHtmlElementById('SecondInputUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('InputExample-' + elementIndex).hide();
                        self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');

                        if (self.IsQueryFilterHasValues(queryFilter)) {
                            self.GetHtmlElementById('FirstInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.TIMESPANPICKER).value(queryFilter[0].value);
                            self.GetHtmlElementById('SecondInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.TIMESPANPICKER).value(queryFilter[1].value);
                        }
                        break;
                    default:
                        break;
                }
                break;
            case enumHandlers.OPERATOR.INLIST.Value:
            case enumHandlers.OPERATOR.NOTINLIST.Value:
            case enumHandlers.OPERATOR.CONTAIN.Value:
            case enumHandlers.OPERATOR.NOTCONTAIN.Value:
            case enumHandlers.OPERATOR.STARTWITH.Value:
            case enumHandlers.OPERATOR.NOTSTARTWITH.Value:
            case enumHandlers.OPERATOR.ENDON.Value:
            case enumHandlers.OPERATOR.NOTENDON.Value:
            case enumHandlers.OPERATOR.MATCHPATTERN.Value:
            case enumHandlers.OPERATOR.NOTMATCHPATTERN.Value:
                var isEnumList = false;
                switch (fieldType) {
                    case enumHandlers.FIELDTYPE.DATE:
                    case enumHandlers.FIELDTYPE.DATETIME:
                        if (fieldType === enumHandlers.FIELDTYPE.DATE)
                            self.BindingDatePicker('SelectedValue-' + elementIndex);
                        else
                            self.BindingDateTimePicker('SelectedValue-' + elementIndex);
                        self.SetPastableElement(elementIndex, fieldType);

                        self.GetHtmlElementById('ValueUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        break;
                    case enumHandlers.FIELDTYPE.TEXT:
                        self.GetHtmlElementById('SelectedValue-' + elementIndex).addClass('eaText');
                        self.SetPastableElement(elementIndex, fieldType);
                        self.GetHtmlElementById('ValueUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        break;
                    case enumHandlers.FIELDTYPE.ENUM:
                        if (selectedCriteria === enumHandlers.OPERATOR.INLIST.Value
                            || selectedCriteria === enumHandlers.OPERATOR.NOTINLIST.Value) {
                            isEnumList = true;
                        }
                        else {
                            self.GetHtmlElementById('SelectedValue-' + elementIndex)
                                .addClass('eaText');
                            self.SetPastableElement(elementIndex, fieldType);
                            self.GetHtmlElementById('ValueUnit-' + elementIndex).hide();
                            self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        }
                        break;
                    case enumHandlers.FIELDTYPE.PERIOD:
                        self.BindingTextNumeric('SelectedValue-' + elementIndex, fieldType);
                        self.SetPastableElement(elementIndex, fieldType);
                        self.BindingUnitDropdownList('ValueUnit-' + elementIndex, fieldType);
                        self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        break;
                    case enumHandlers.FIELDTYPE.DOUBLE:
                    case enumHandlers.FIELDTYPE.INTEGER:
                    case enumHandlers.FIELDTYPE.CURRENCY:
                    case enumHandlers.FIELDTYPE.PERCENTAGE:
                        self.BindingTextNumeric('SelectedValue-' + elementIndex, fieldType);
                        self.SetPastableElement(elementIndex, fieldType);
                        self.GetHtmlElementById('ValueUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        break;
                    case enumHandlers.FIELDTYPE.TIME:
                        self.BindingTimePicker('SelectedValue-' + elementIndex);
                        self.SetPastableElement(elementIndex, fieldType);
                        self.GetHtmlElementById('ValueUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        break;
                    case enumHandlers.FIELDTYPE.TIMESPAN:
                        self.BindingTimeSpanPicker('SelectedValue-' + elementIndex);
                        self.GetHtmlElementById('ValueUnit-' + elementIndex).hide();
                        self.GetHtmlElementById('SelectedUnit-' + elementIndex).hide();
                        break;
                    default:
                        break;
                }

                if (!isEnumList)
                    self.BindingListGrid('ValueList-' + elementIndex, fieldType, WC.Utility.ToArray(queryFilter));
                else
                    self.BindingEnumListGrid('ValueList-' + elementIndex, self.Handler.Data()[elementIndex].field, false, WC.Utility.ToArray(queryFilter));
                break;
            case enumHandlers.OPERATOR.RELATIVEBEFORE.Value:
            case enumHandlers.OPERATOR.RELATIVEAFTER.Value:
                if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');
                    self.BindingTextNumeric('FirstInput-' + elementIndex, fieldType);
                    self.BindingUnitDropdownList('FirstInputUnit-' + elementIndex, fieldType);
                    self.GetHtmlElementById('InputAnd-' + elementIndex).hide();
                    self.GetHtmlElementById('SecondInput-' + elementIndex).hide();
                    self.GetHtmlElementById('SecondInputUnit-' + elementIndex).hide();

                    var exampleDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
                    var inputDate = self.GetHtmlElementById('FirstInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    if (self.IsQueryFilterHasValue(queryFilter)) {
                        exampleDate.setDate(exampleDate.getDate() + parseFloat(queryFilter[0].value));
                        inputDate.value(queryFilter[0].value);
                    }
                    inputDate.trigger('change');
                }
                break;
            case enumHandlers.OPERATOR.RELATIVEBETWEEN.Value:
            case enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value:
                if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    self.GetHtmlElementById('CompareButton-' + elementIndex).parents('.filterInput:first').addClass('filterInputWithoutCompare');
                    self.BindingTextNumeric('FirstInput-' + elementIndex, fieldType);
                    self.BindingUnitDropdownList('FirstInputUnit-' + elementIndex, fieldType);
                    self.BindingTextNumeric('SecondInput-' + elementIndex, fieldType);
                    self.BindingUnitDropdownList('SecondInputUnit-' + elementIndex, fieldType);

                    var firstExampleDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
                    var secondExampleDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
                    var firstInputDate = self.GetHtmlElementById('FirstInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    var secondInputDate = self.GetHtmlElementById('SecondInput-' + elementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    if (self.IsQueryFilterHasValues(queryFilter)) {
                        firstExampleDate.setDate(firstExampleDate.getDate() + parseFloat(queryFilter[0].value));
                        secondExampleDate.setDate(secondExampleDate.getDate() + parseFloat(queryFilter[1].value));

                        firstInputDate.value(queryFilter[0].value);
                        secondInputDate.value(queryFilter[1].value);
                    }
                    firstInputDate.trigger('change');
                }
                break;

            default:
                break;
        }

        // adjust layout
        self.AdjustLayout();

        self.Handler.ApplyFilterWhenAction(elementIndex);
    };
    self.GenerateAdvanceCriteriaView = function (fieldType, selectedCriteria, elementId, queryFilter) {
        var elementIndex = self.GetHtmlElementById(elementId).attr('alt').split('-')[1];
        var placeholder = self.GetHtmlElementById('FilterDetail-' + elementIndex + '-PlaceHolder');
        var argumentValues = jQuery.extend(true, { arguments: WC.Utility.ToArray(placeholder.data('cache')) }, queryFilter).arguments;
        placeholder.empty();
        placeholder.data({ locked: true, cache: argumentValues });
        placeholder.prev('.StatSeparate').show();

        // set ui
        var maxUI = self.Handler.GetMaxArgumentsCount(selectedCriteria);
        for (var i = 0; i < maxUI; i++) {
            if (i === maxUI - 1)
                placeholder.data('locked', false);

            var data = jQuery.extend({ argument_type: enumHandlers.FILTERARGUMENTTYPE.VALUE }, queryFilter[i]);
            var elementKey = elementIndex + '_' + i;
            placeholder.append(self.GenerateTemplate('CRITERIAADVANCE', fieldType, elementKey));

            var ddlArgumentType = self.BindingDropdownArgumentType(elementKey, data.argument_type);
            ddlArgumentType.trigger('change');
        }
    };
    self.GenerateAdvanceCriteriaSubView = function (argumentType, fieldType, elementKey, filterArgument) {
        var elementKeyParts = self.Handler.GetAdvanceElementData(elementKey);
        var elementIndex = elementKeyParts.index;
        var rowIndex = elementKeyParts.row;
        var placeholder = self.GetHtmlElementById('FilterDetail-' + elementIndex + '-PlaceHolder');
        var cacheArgument = WC.Utility.ToArray(placeholder.data('cache'))[rowIndex];
        var data = jQuery.extend({
            parameters: [],
            value: null,
            field: ''
        }, cacheArgument, filterArgument);

        var templateName = self.Handler.GetAdvanceTemplateName(argumentType);
        placeholder.find('.filterInputData').eq(rowIndex).html(self.GenerateTemplate(templateName, fieldType, elementKey));

        // apply view
        self.ApplyCustomView(placeholder);

        if (argumentType === enumHandlers.FILTERARGUMENTTYPE.FUNCTION) {
            // function
            var periodType = WC.WidgetFilterHelper.GetAdvanceArgumentType(data);
            var periodValue = WC.WidgetFilterHelper.GetAdvanceArgumentValue(data);
            self.BindingInputFunctionValue(elementKey);
            self.BindingDropdownFunctionUnit(elementKey, periodType);
            self.SetArgumentFunctionValue(elementKey, periodValue);
        }
        else if (argumentType === enumHandlers.FILTERARGUMENTTYPE.FIELD) {
            // field
            self.SetArgumentField(elementKey, data.field);
        }
        else if (argumentType === enumHandlers.FILTERARGUMENTTYPE.VALUE) {
            // value
            self.BindingInputValue(elementKey, data.value, fieldType);
        }

        // adjust layout
        var isLocked = placeholder.data('locked');
        if (!isLocked) {
            self.AdjustLayout();
            self.Handler.ApplyAdvanceFilterWhenAction(elementKey);
        }
    };
    self.UpdateCacheArgument = function (argumentValues, index) {
        var placeholder = self.GetHtmlElementById('FilterDetail-' + index + '-PlaceHolder');
        var cache = jQuery.extend(true, { arguments: WC.Utility.ToArray(placeholder.data('cache')) }, { arguments: argumentValues }).arguments;
        placeholder.data('cache', cache);
    };
    self.GetBooleanInputStates = function (value) {
        var states = { yes: false, no: false };
        if (typeof value === 'boolean') {
            states.yes = value;
            states.no = !value;
        }
        return states;
    };
    self.IsQueryFilterHasValue = function (queryFilter) {
        return queryFilter && queryFilter.length;
    };
    self.IsQueryFilterHasValues = function (queryFilter) {
        return queryFilter && queryFilter.length === 2;
    };
    // ======================== Second part ====================================

    self.IsCompareFilter = function (index) {
        return self.GetHtmlElementById('InputFieldValue-' + index).length;
    };
    self.GetCompareFieldId = function (index) {
        return self.GetHtmlElementById('InputFieldValue-' + index).val();
    };
    self.GetOperatorElement = function (index) {
        return self.GetHtmlElementById('Operator-' + index + '-DropdownList');
    };
    self.GetDropdownOperatorValue = function (index) {
        return WC.HtmlHelper.DropdownList(self.GetOperatorElement(index)).value();
    };
    self.GetFilterFieldType = function (index) {
        return self.GetOperatorElement(index).attr('alt').split('-')[0];
    };
    self.BindingInputTextEvent = function (elementId, elementIndex) {
        self.GetHtmlElementById(elementId)
            .on('keyup change', function () {
                self.Handler.ApplyFilterWhenAction(elementIndex);
            });
    };
    self.BindingDatePicker = function (elementId) {
        var ui = self.GetHtmlElementById(elementId).kendoDatePicker({
            value: kendo.date.today(),
            format: self.Handler.GetDateFormat(),
            max: new Date(9999, 12, 31),
            change: self.OnDateTimePickerChanged
        }).data(enumHandlers.KENDOUITYPE.DATEPICKER);
        ui.wrapper.addClass('eaDatepicker');
        return ui;
    };
    self.BindingDateTimePicker = function (elementId) {
        var ui = self.GetHtmlElementById(elementId).kendoCustomDateTimePicker({
            value: kendo.date.today(),
            format: self.Handler.GetDateTimeFormat(),
            dateFormat: self.Handler.GetDateFormat(),
            timeFormat: self.Handler.GetTimeFormat(),
            max: new Date(9999, 12, 31),
            change: self.OnDateTimePickerChanged
        }).data(enumHandlers.KENDOUITYPE.DATETIMEPICKER);
        ui.wrapper.addClass('eaDatepicker');
        return ui;
    };
    self.OnDateTimePickerChanged = function (e) {
        var elementKey = e.sender.element.attr('id').split('-')[1];
        var elementIndex = self.Handler.GetAdvanceElementIndex(elementKey);
        self.Handler.ApplyFilterWhenAction(elementIndex);
    };
    self.BindingTextNumeric = function (elementId, fieldType) {
        var decimals = WC.FormatHelper.IsSupportDecimal(fieldType) ? 20 : 0;
        var formatter = new Formatter({ decimals: decimals, thousandseparator: true }, enumHandlers.FIELDTYPE.NUMBER);
        var format = WC.FormatHelper.GetFormatter(formatter);
        var step = 1;
        var uiName;
        if (fieldType === enumHandlers.FIELDTYPE.PERCENTAGE) {
            uiName = enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
        }
        else {
            uiName = enumHandlers.KENDOUITYPE.NUMERICTEXT;
        }

        var updateNumeric = function (e) {
            var currentElementId = e.sender.element.attr('id');
            var elementParts = currentElementId.split('-');
            self.ModifyExampleDay(currentElementId, elementParts[1], elementParts[0], fieldType);
            self.Handler.ApplyFilterWhenAction(self.Handler.GetAdvanceElementIndex(elementParts[1]));
        };

        var ui = self.GetHtmlElementById(elementId).css('float', 'none')[uiName]({
            step: step,
            format: format,
            decimals: decimals,
            change: updateNumeric,
            spin: updateNumeric
        }).data(uiName);
        ui.wrapper.css('float', '').addClass('eaNumeric');
        return ui;
    };
    self.ModifyExampleDay = function (elementId, currentElementIndex, inputName, fieldType) {
        if (WC.FormatHelper.IsDateOrDateTime(fieldType) && self.GetHtmlElementById(elementId).data('role') === 'numerictextbox') {
            var formatter;
            if (fieldType === enumHandlers.FIELDTYPE.DATETIME) {
                formatter = self.Handler.GetDateTimeFormat();
            }
            else {
                formatter = WC.FormatHelper.GetFormatter(fieldType);
            }

            var operator = self.GetDropdownOperatorValue(currentElementIndex);
            if (operator === enumHandlers.OPERATOR.RELATIVEAFTER.Value || operator === enumHandlers.OPERATOR.RELATIVEBEFORE.Value) {
                self.GetHtmlElementById('ExampleText-' + currentElementIndex).text(self.CalculateRelativeBeforeOrAfter(elementId, currentElementIndex, formatter, operator));
            }
            else {
                self.GetHtmlElementById('ExampleText-' + currentElementIndex).text(self.CalculateRelativeDateBetween(currentElementIndex, formatter, operator));
            }
        }
    };
    self.CalculateRelativeBeforeOrAfter = function (elementId, currentElementIndex, formatter, operator) {
        var currentDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
        var selectedDay = self.GetHtmlElementById(elementId).data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value() || 0;
        var unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('FirstInputUnit-' + currentElementIndex)).value();
        var allSelectedDay = selectedDay * unitDay;
        currentDate.setDate(currentDate.getDate() + allSelectedDay);

        var exampleDateText = kendo.toString(currentDate, formatter);
        var operatorText = operator === enumHandlers.OPERATOR.RELATIVEBEFORE.Value ? Localization.Before : Localization.After;
        return ' ' + operatorText + ' ' + exampleDateText;
    };
    self.CalculateRelativeDateBetween = function (currentElementIndex, formatter, operator) {
        var firstDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
        var secondDate = WC.WidgetFilterHelper.GetDefaultModelDataDate(self.Handler.ModelUri);
        var firstDay = self.GetHtmlElementById('FirstInput-' + currentElementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value() || 0;
        var secondDay = !self.GetHtmlElementById('SecondInput-' + currentElementIndex).length ? 0 : self.GetHtmlElementById('SecondInput-' + currentElementIndex).data(enumHandlers.KENDOUITYPE.NUMERICTEXT).value() || 0;
        var firstUnit = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('FirstInputUnit-' + currentElementIndex)).value();
        var secondUnit = !self.GetHtmlElementById('SecondInputUnit-' + currentElementIndex).length ? 0 : WC.HtmlHelper.DropdownList(self.GetHtmlElementById('SecondInputUnit-' + currentElementIndex)).value();
        var allFirstDay = firstDay * firstUnit;
        var allSecondDay = secondDay * secondUnit;

        firstDate.setDate(firstDate.getDate() + allFirstDay);
        secondDate.setDate(secondDate.getDate() + allSecondDay);
        var firstFormat = kendo.toString(firstDate, formatter);
        var secondFormat = kendo.toString(secondDate, formatter);
        var operatorText = operator === enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value ? Localization.NotBetween : Localization.Between;
        return ' ' + operatorText + ' ' + firstFormat + ' ' + Localization.And + ' ' + secondFormat;
    };
    self.BindingUnitDropdownList = function (elementId, fieldType) {
        var data = [
            { Id: Captions.WidgetFilter_PeriodType_Days, Value: 1 },
            { Id: Captions.WidgetFilter_PeriodType_Weeks, Value: 7 },
            { Id: Captions.WidgetFilter_PeriodType_Months, Value: 30 },
            { Id: Captions.WidgetFilter_PeriodType_Quarters, Value: 91 },
            { Id: Captions.WidgetFilter_PeriodType_Semesters, Value: 182 },
            { Id: Captions.WidgetFilter_PeriodType_Years, Value: 365 }
        ];
        WC.HtmlHelper.DropdownList(self.GetHtmlElementById(elementId), data, {
            dataTextField: "Id",
            dataValueField: "Value",
            change: function () {
                var currentElement = elementId.split('-');
                var elementName = jQuery.trim(currentElement[0].replace('Unit', ''));
                self.ModifyExampleDay(elementName + '-' + currentElement[1], currentElement[1], elementName, fieldType);
                self.Handler.ApplyFilterWhenAction(currentElement[1]);
            }
        });
    };
    self.BindingTimePicker = function (elementId) {
        var currentElement = elementId.split('-');
        var timeFormat = self.Handler.GetTimeFormat();
        var timePicker = self.GetHtmlElementById(elementId).kendoTimePicker({
            format: timeFormat,
            parseFormats: [timeFormat],
            change: function () {
                self.Handler.ApplyFilterWhenAction(currentElement[1]);
            }
        }).data(enumHandlers.KENDOUITYPE.TIMEPICKER);
        timePicker.wrapper.addClass('eaTimepicker');
        timePicker.element.on('blur keydown', function (e) {
            if ((e.type === 'blur' && !jQuery(this).data('paste')) || (e.type === 'keydown' && e.keyCode === 13)) {
                self.FriendlyInputTimePicker(this);
            }
        });
    };
    self.BindingTimeSpanPicker = function (elementId) {
        var currentElement = elementId.split('-');
        var dayFormat = '0 ' + Localization.Days;
        var timeFormat = self.Handler.GetTimeSpanPickerFormat();
        var timespanPicker = self.GetHtmlElementById(elementId).kendoTimeSpanPicker({
            dayPickerOptions: {
                format: dayFormat,
                spin: function (e) {
                    e.sender.value(e.sender.value());
                },
                comboBoxOptions: {
                    dataTextField: 'text',
                    dataValueField: 'value',
                    dataSource: self.GetInputTimeSpanDatasource(dayFormat)
                }
            },
            timePickerOptions: {
                format: timeFormat,
                parseFormats: [timeFormat]
            },
            change: function () {
                self.Handler.ApplyFilterWhenAction(currentElement[1]);
            }
        }).data(enumHandlers.KENDOUITYPE.TIMESPANPICKER);
        timespanPicker.dayPicker.wrapper.css('float', '').addClass('eaNumeric');
        timespanPicker.timePicker.wrapper.addClass('eaTimepicker');
        timespanPicker.timePicker.element.on('blur keydown', function (e) {
            if ((e.type === 'blur' && !jQuery(this).data('paste')) || (e.type === 'keydown' && e.keyCode === 13)) {
                self.FriendlyInputTimePicker(this);
            }
        });
    };
    self.GetInputTimeSpanDatasource = function (format) {
        var i, data = [];
        for (i = 0; i <= 5; i++) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        for (i = 10; i <= 50; i += 5) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        for (i = 60; i <= 100; i += 10) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        data.sortObject('value', enumHandlers.SORTDIRECTION.DESC);
        return data;
    };
    self.FriendlyInputTimePicker = function (obj) {
        var input = jQuery(obj);
        var inputValue = input.val();
        var timePicker = input.data(enumHandlers.KENDOUITYPE.TIMEPICKER);
        if (timePicker && !timePicker.value()) {
            if (inputValue) {
                var timeSeparator = userSettingModel.GetTimeFormatTemplateBy(enumHandlers.TIME_SETTINGS_FORMAT.SEPARATOR);
                var inputParts = inputValue.split(timeSeparator);
                for (var i = 0; i < 3; i++) {
                    if (typeof inputParts[i] === 'undefined')
                        inputParts[i] = '00';
                    inputParts[i] = parseInt(inputParts[i], 10);
                    if (isNaN(inputParts[i])
                        || inputParts[i] < 0
                        || (i === 0 && inputParts[i] >= 24)
                        || (i !== 0 && inputParts[i] >= 60)) {
                        inputParts[i] = '--';
                        break;
                    }
                    else {
                        inputParts[i] = kendo.toString(inputParts[i], '00');
                    }
                }
                timePicker.value(inputParts.join(timeSeparator));

                self.Handler.ApplyFilterWhenAction(input.attr('id').split('-')[1]);
            }

            if (!timePicker.value()) {
                input.val('');
            }
        }
    };
    self.BindingDropdownOperator = function (elementId, fieldType) {
        var operatorDefault = enumHandlers.QUERYSTEPOPERATOR.DEFAULT;
        var operatorGroupOne = enumHandlers.QUERYSTEPOPERATOR.GROUPONE;
        var operatorGroupTwo = enumHandlers.QUERYSTEPOPERATOR.GROUPTWO;
        var operatorGroupThree = enumHandlers.QUERYSTEPOPERATOR.GROUPTHREE;
        var operatorGroupFour = enumHandlers.QUERYSTEPOPERATOR.GROUPFOUR;
        var timeListOne = enumHandlers.QUERYSTEPOPERATOR.TIMEONE;
        var enumerationOne = enumHandlers.QUERYSTEPOPERATOR.ENUMONE;
        var simplifyDate = enumHandlers.QUERYSTEPOPERATOR.SIMPLIFYDATE;

        var operatorList = [];

        switch (fieldType) {
            case enumHandlers.FIELDTYPE.TEXT:
                operatorList = operatorDefault.concat(operatorGroupOne, operatorGroupTwo, operatorGroupThree, operatorGroupFour);
                break;
            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
                operatorList = simplifyDate;
                break;
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.INTEGER:
            case enumHandlers.FIELDTYPE.PERIOD:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.TIMESPAN:
                /* M4-10744: Change 'peroid' operator to use same as 'integer' operator */
                /*M4-28477 : Change filter operator in Timespan to be the same as Integer.*/
                operatorList = operatorDefault.concat(operatorGroupOne, operatorGroupTwo, operatorGroupThree);
                break;
            case enumHandlers.FIELDTYPE.BOOLEAN:
                operatorList = operatorDefault.concat(operatorGroupOne);
                break;
            case enumHandlers.FIELDTYPE.TIME:
                operatorList = operatorDefault.concat(operatorGroupOne, timeListOne, operatorGroupThree);
                break;
            case enumHandlers.FIELDTYPE.ENUM:
                operatorList = operatorDefault.concat(operatorGroupOne, enumerationOne);
                break;
            default:
                break;
        }

        var metadata = {
            elementId: elementId,
            fieldType: fieldType,
            index: parseInt(elementId.split('-')[1], 10)
        };
        var dropdownElement = self.GetHtmlElementById(elementId);
        dropdownElement.data('metadata', metadata);

        var ddlOperator = WC.HtmlHelper.DropdownList(dropdownElement, operatorList, {
            dataTextField: enumHandlers.PROPERTIESNAME.TEXT,
            dataValueField: enumHandlers.PROPERTIESNAME.VALUE,
            value: self.Handler.Data()[metadata.index].operator,
            change: function (e) {
                self.Handler.SwitchOperator = true;
                self.Handler.RenderView(e.sender, e.sender.element.data('metadata'));
            }
        });

        self.Handler.RenderView(ddlOperator, metadata);
    };
    self.UpdateDropdownOperator = function (elementIndex, operator, argumentType) {
        var ddlOperator = WC.HtmlHelper.DropdownList(self.GetOperatorElement(elementIndex));
        var ddlData = ko.toJS(enumHandlers.QUERYSTEPOPERATOR.SIMPLIFYDATE);
        if (argumentType === enumHandlers.FILTERARGUMENTTYPE.FUNCTION) {
            ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.BEFOREORON.Value);
            ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.AFTERORON.Value);
            if (operator === enumHandlers.OPERATOR.BEFOREORON.Value)
                operator = enumHandlers.OPERATOR.BEFORE.Value;
            else if (operator === enumHandlers.OPERATOR.AFTERORON.Value)
                operator = enumHandlers.OPERATOR.AFTER.Value;

            var itemEqualTo = ddlData.findObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.EQUALTO.Value);
            itemEqualTo.Text = enumHandlers.OPERATOR.ISIN.Text;
            var itemNotEqualTo = ddlData.findObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.NOTEQUALTO.Value);
            itemNotEqualTo.Text = enumHandlers.OPERATOR.ISNOTIN.Text;
        }

        ddlData = self.UpdateDropdownOperatorForRTMS(ddlData);

        ddlOperator.setDataSource(ddlData);
        ddlOperator.value(operator);
        ddlOperator.refresh();
    };
    self.UpdateDropdownOperatorForRTMS = function (ddlData) {
        var model = modelsHandler.GetModelByUri(self.Handler.ModelUri);
        var isRealTimeModel = aboutSystemHandler.IsRealTimeModel(model.id);
        if (isRealTimeModel) {
            ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.RELATIVEBEFORE.Value);
            ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.RELATIVEAFTER.Value);
            ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.RELATIVEBETWEEN.Value);
            ddlData.removeObject(enumHandlers.PROPERTIESNAME.VALUE, enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value);
        }
        return ddlData;
    };
    self.UpdateWidgetFilterText = function (data, index) {
        var filterText = self.Handler.GetFilterText(data, self.Handler.ModelUri, self.Handler.ViewMode() === self.Handler.VIEWMODE.TREEVIEW);
        var headerElement = self.GetHtmlElementById('FilterHeader-' + index);
        headerElement.find('.filterText').text(filterText);
    };
    self.BindingDropdownArgumentType = function (elementKey, argumentType) {
        return WC.HtmlHelper.DropdownList(self.GetHtmlElementById('InputType-' + elementKey), enumHandlers.FILTERARGUMENTTYPES, {
            dataValueField: 'Value',
            dataTextField: 'Text',
            value: argumentType,
            change: self.OnDropdownPeriodTypeChanged
        });
    };
    self.BindingInputValue = function (elementKey, value, fieldType) {
        if (fieldType === enumHandlers.FIELDTYPE.DATE) {
            self.BindingDatePicker('InputValue-' + elementKey);
            if (value)
                self.SetArgumentValue(elementKey, WC.WidgetFilterHelper.ConvertUnixTimeToPicker(value));
        }
        else if (fieldType === enumHandlers.FIELDTYPE.DATETIME) {
            self.BindingDateTimePicker('InputValue-' + elementKey);
            if (value)
                self.SetArgumentValue(elementKey, WC.WidgetFilterHelper.ConvertUnixTimeToPicker(value));
        }
    };
    self.OnDropdownPeriodTypeChanged = function (e) {
        var argumentType = e.sender.value();
        var elementKey = e.sender.element.attr('id').split('-')[1];
        var elementKeyParts = self.Handler.GetAdvanceElementData(elementKey);
        var elementIndex = elementKeyParts.index;
        var rowIndex = elementKeyParts.row;
        var fieldType = self.GetFilterFieldType(elementIndex);
        var argumentValue = self.Handler.Data()[elementIndex].arguments[rowIndex];
        var operator = self.GetDropdownOperatorValue(elementIndex);

        self.UpdateDropdownOperator(elementIndex, operator, argumentType);
        self.GenerateAdvanceCriteriaSubView(argumentType, fieldType, elementKey, argumentValue);

        argumentValue = self.Handler.Data()[elementIndex].arguments[rowIndex];
        if (argumentType === enumHandlers.FILTERARGUMENTTYPE.FIELD && (!argumentValue || !argumentValue.field)) {
            self.Handler.ShowCompareFilterPopup(fieldType, elementKey);
        }
    };
    self.BindingInputFunctionValue = function (elementKey) {
        var formatter = new Formatter({ decimals: 0, thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
        var format = WC.FormatHelper.GetFormatter(formatter);
        var ui = self.GetHtmlElementById('InputFunctionValue-' + elementKey).css('float', 'none').kendoCustomNumericTextBox({
            can_empty: false,
            format: format,
            decimals: 0,
            step: 1,
            messages: {
                text_last: Captions.WidgetFilter_ArgumentPeriod_Last.toLowerCase(),
                text_this: Captions.WidgetFilter_ArgumentPeriod_This.toLowerCase(),
                text_next: Captions.WidgetFilter_ArgumentPeriod_Next.toLowerCase()
            },
            change: self.OnInputFunctionValueChanged,
            spin: self.OnInputFunctionValueChanged,
            comboBoxOptions: {
                dataTextField: 'text',
                dataValueField: 'value',
                dataSource: self.GetInputFunctionValueDataSource(format)
            }
        }).data(enumHandlers.KENDOUITYPE.NUMERICTEXT_CUSTOM);
        ui.wrapper.css('float', '').addClass('eaNumeric');
        return ui;
    };
    self.OnInputFunctionValueChanged = function (e) {
        var element = jQuery(e.sender ? e.sender.element : e.currentTarget);
        var value = element.val();
        var elementParts = element.attr('id').split('-');
        var elementKey = elementParts[1];
        if (elementParts[0] !== 'InputFunctionType' && value !== '' && !isNaN(value)) {
            self.SetArgumentFunctionValue(elementKey, parseFloat(value));
        }
        self.Handler.ApplyAdvanceFilterWhenAction(elementKey);
    };
    self.CheckFunctionValue = function (elementKey) {
        var elementIndex = self.Handler.GetAdvanceElementIndex(elementKey);
        var operator = self.GetDropdownOperatorValue(elementIndex);
        return WC.WidgetFilterHelper.IsBetweenGroupOperator(operator) && self.GetArgumentType(elementIndex + '_0') === self.GetArgumentType(elementIndex + '_1');
    };
    self.GetInputFunctionValueDataSource = function (format) {
        var i, data = [];
        for (i = -100; i <= -60; i += 10) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        for (i = -50; i <= -10; i += 5) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        for (i = -5; i <= -2; i++) {
            data.push({ value: i, text: kendo.toString(i, format) });
        }
        data.push({ value: -1, text: Captions.WidgetFilter_ArgumentPeriod_Last.toLowerCase() });
        data.push({ value: 0, text: Captions.WidgetFilter_ArgumentPeriod_This.toLowerCase() });
        data.push({ value: 1, text: Captions.WidgetFilter_ArgumentPeriod_Next.toLowerCase() });
        for (i = 2; i <= 5; i++) {
            data.push({ value: i, text: kendo.toString(i, '+' + format) });
        }
        for (i = 10; i <= 50; i += 5) {
            data.push({ value: i, text: kendo.toString(i, '+' + format) });
        }
        for (i = 60; i <= 100; i += 10) {
            data.push({ value: i, text: kendo.toString(i, '+' + format) });
        }

        data.sortObject('value', enumHandlers.SORTDIRECTION.DESC);
        return data;
    };
    self.BindingDropdownFunctionUnit = function (elementKey, functionUnit) {
        var ui = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('InputFunctionUnit-' + elementKey), enumHandlers.FILTERPERIODTYPES, {
            dataValueField: 'Value',
            dataTextField: 'Text',
            change: self.OnInputFunctionValueChanged
        });
        ui.value(functionUnit);
    };
    self.GetArgumentType = function (elementKey) {
        return WC.HtmlHelper.DropdownList(self.GetHtmlElementById('InputType-' + elementKey)).value();
    };
    self.GetArgumentField = function (elementKey) {
        return self.GetHtmlElementById('InputFieldValue-' + elementKey).val();
    };
    self.SetArgumentField = function (elementKey, value) {
        var element = self.GetHtmlElementById('InputFieldValue-' + elementKey);
        element.val(value);
        element.next('.filterLabelCompareName').text(WC.WidgetFilterHelper.GetFilterFieldName(value, self.Handler.ModelUri));
    };
    self.GetArgumentFunctionType = function (elementKey) {
        return WC.HtmlHelper.DropdownList(self.GetHtmlElementById('InputFunctionUnit-' + elementKey)).value();
    };
    self.GetArgumentFunctionValue = function (elementKey) {
        return self.GetHtmlElementById('InputFunctionValue-' + elementKey).data('handler').value();
    };
    self.SetArgumentFunctionValue = function (elementKey, value) {
        self.GetHtmlElementById('InputFunctionValue-' + elementKey).data('handler').value(value);
    };
    self.GetArgumentValue = function (elementKey) {
        var result = null;
        var ui = self.GetHtmlElementById('InputValue-' + elementKey).data('handler');
        var uiValue = ui.value();
        var uiName = 'kendo' + ui.options.name;
        if (uiName === enumHandlers.KENDOUITYPE.DATEPICKER && uiValue) {
            result = WC.WidgetFilterHelper.ConvertDatePickerToUnixTime(uiValue, false);
        }
        else if (uiName === enumHandlers.KENDOUITYPE.DATETIMEPICKER && uiValue) {
            result = WC.WidgetFilterHelper.ConvertDatePickerToUnixTime(uiValue, true);
        }
        return result;
    };
    self.SetArgumentValue = function (elementKey, value) {
        self.GetHtmlElementById('InputValue-' + elementKey).data('handler').value(value);
    };
    self.SetPreviewDateText = function (elementIndex) {
        var data = self.Handler.GetData()[elementIndex];
        var filedType = self.GetFilterFieldType(elementIndex);
        if (WC.WidgetFilterHelper.CanUseAdvanceArgument(filedType, data.operator)) {
            // prepare container
            var container = self.GetHtmlElementById('FilterDetail-' + elementIndex + '-PlaceHolder');
            var exampleElement = container.find('.ExampleText');
            if (!exampleElement.length)
                exampleElement = container.append('<div class="ExampleText" />').find('.ExampleText');
            exampleElement.hide();

            // get preview text
            var previewSettings = WC.WidgetFilterHelper.GetTranslatedSettings(data.arguments, data.operator, filedType, self.Handler.ModelUri);
            previewSettings.arguments.splice(0, 0, previewSettings.template);
            var previewText = kendo.format.apply(kendo, previewSettings.arguments);
            if (previewText)
                exampleElement.text(previewText).show();
        }
    };     

    // enum dropdown list
    self.BindingEnumeratedDropdownList = function (elementId, fieldId, defaultFilter) {
        var field = modelFieldsHandler.GetFieldById(fieldId, self.Handler.ModelUri);
        var fieldDomain = null;
        if (field && field.domain) {
            fieldDomain = modelFieldDomainHandler.GetFieldDomainByUri(field.domain);
        }
        if (!fieldDomain) {
            fieldDomain = { uri: '', elements: [] };
        }

        var domainPath = modelFieldDomainHandler.GetDomainPathByUri(fieldDomain.uri);
        var updateFilter = function () {
            var elementIndex = elementId.split('-')[1];
            self.Handler.ApplyFilterWhenAction(elementIndex);
        };
        
        //set options for kendo combo box
        var options = {
            dataTextField: "smart_name",
            dataValueField: "id",
            filter: "contains",
            suggest: true,
            virtual: {
                itemHeight: 35,
                valueMapper: function (options) {
                    var data = this.dataSource.get(options.value);
                    if (data) {
                        var index = this.dataSource.indexOf(data);
                        options.success(index);
                    } else {
                        return null;
                    }
                }
            },
            template: function (data) {
                return self.TemplateEnumDropdown(data, domainPath);
            },
            valueTemplate: function (data) {
                return self.TemplateEnumDropdown(data, domainPath);
            },
            change: function () {
                updateFilter();
            },
            select: function (e) {
                // check if value not in the list
                if(!e.sender.dataItem()) {
                    setTimeout(function () {
                        e.sender.trigger('change');
                    }, 100);
                }
            },
            index: -1,
            dataSource: self.GenerateElementsDataSource(fieldDomain)
        };

        // set index instead of value because 'null' can't be set
        options.dataSource.read();
        var defaultData = options.dataSource.get(defaultFilter);
        if (defaultData) {
            options.index = options.dataSource.indexOf(defaultData);
        }

        // set value and text
        var combobox = self.GetHtmlElementById(elementId).kendoComboBox(options).data(enumHandlers.KENDOUITYPE.COMBOBOX);
        if (options.index === -1) {
            combobox.text(defaultFilter);
        }
        combobox.value(defaultFilter);
        combobox.trigger("change");

        updateFilter();
    };
    self.BindingEnumListGrid = function (elementId, fieldId, isPopup, defaultFilters) {
        var field = modelFieldsHandler.GetFieldById(fieldId, self.Handler.ModelUri);
        if (field) {
            var fieldDomain = modelFieldDomainHandler.GetFieldDomainByUri(field.domain);
            if (fieldDomain) {
                self.GetEnumListGridSuccess(fieldDomain, elementId, isPopup, defaultFilters);
            }
            else {
                modelFieldDomainHandler.LoadFieldDomain(field.domain)
                    .done(function (response, status, xhr) {
                        self.GetEnumListGridSuccess(response, elementId, isPopup, defaultFilters);
                    });
            }
        }
        else {
            self.GetEnumListGridSuccess({
                uri: '',
                elements: []
            }, elementId, isPopup, defaultFilters);
        }
    };
    self.GetEnumListGridSuccess = function (response, elementId, isPopup, defaultFilters) {
        if (typeof isPopup === 'undefined')
            isPopup = false;

        var domainPath = modelFieldDomainHandler.GetDomainPathByUri(response.uri);
        var gridElement = !isPopup ? self.GetHtmlElementById(elementId) : jQuery('#' + elementId);

        gridElement.data('key', response.id).addClass('gridEnumList').kendoGrid({
            dataSource: self.GenerateElementsDataSource(response),
            height: !isPopup ? 132 : 455,
            scrollable: {
                virtual: true
            },
            sortable: true,
            selectable: 'row',
            columns: [
                {
                    field: 'short_name',
                    headerTemplate: '<div class="customTitle">' + Localization.Value + '</div>',
                    headerAttributes: {
                        'class': 'gridHeaderContainer actionable' + (isPopup ? '' : ' alwaysHide')
                    },
                    template: function (data) {
                        return self.TemplateEnumDropdownGrid(data, domainPath, elementId);
                    }
                }
            ],
            dataBound: function (e) {
                self.ApplyCustomView(e.sender.element);
            }
        });

        var grid = gridElement.data(enumHandlers.KENDOUITYPE.GRID);

        if (!!jQuery.browser.msie) {
            var virtualScroll = grid.content.data('kendoVirtualScrollable');
            grid.content
                .off('mousewheel.iefix')
                .on('mousewheel.iefix', function (e) {
                    if (!grid.content.find('.k-loading-mask').length) {
                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                    }
                });
        }

        if (isPopup) {
            var sourceGrid = self.GetHtmlElementById(elementId.replace('ValueListEnlarge', 'ValueList')).data(enumHandlers.KENDOUITYPE.GRID);
            jQuery.each(sourceGrid.dataSource.data(), function (index, data) {
                if (data.checked) {
                    grid.dataSource.data()[index].checked = true;
                }
            });
            grid.refresh();
        }
        else if (defaultFilters.length) {
            jQuery.each(grid.dataSource.data(), function (index, data) {
                if (defaultFilters.hasObject('value', data.id)) {
                    data.checked = true;
                }
            });
            grid.refresh();
        }

        // set cache filter
        var cacheKey = response.id;
        if (!isPopup && !window.EnumGridFilterCache[cacheKey]) {
            window.EnumGridFilterCache[cacheKey] = {};
            jQuery.each(grid.dataSource.data(), function (index, data) {
                var enumText = self.Handler.GetEnumText(data.id, data.short_name, data.long_name);
                if (enumText.length) {
                    var firstEnumTtext = enumText.charAt(0).toLowerCase();
                    if (!window.EnumGridFilterCache[cacheKey][firstEnumTtext]) {
                        window.EnumGridFilterCache[cacheKey][firstEnumTtext] = [];
                    }
                    window.EnumGridFilterCache[cacheKey][firstEnumTtext].push(index);
                }
            });
        }

    };

    self.GenerateElementsDataSource = function (elementData) {
        //create temp object to keep no value and not in set element
        var tempObj = {
            noValue: { id: -1, el: null },
            notInSet: { id: -1, el: null }
        };

        //convert model array to object array
        var elements = ko.toJS(elementData.elements);

        //do sort order elements
        if (elementData.may_be_sorted)
            elements.sortObject('short_name', enumHandlers.SORTDIRECTION.ASC, false);

        //for loop elements for keep no value element and not in set element to temp object
        jQuery.each(elements, function (index, element) {
            if (element.id === null) {
                tempObj.noValue.id = index;
                tempObj.noValue.el = element;
            } else if (element.id === "~NotInSet") {
                tempObj.notInSet.id = index;
                tempObj.notInSet.el = element;
            }

            //if already keep both it will stop
            if (tempObj.noValue.id !== -1 && tempObj.notInSet.id !== -1)
                return;
        });
        
        //remove elements by condition (if not no value and not in set)
        var filteredElements = elements.filter(function (element, index) {
            return (element.id !== null && element.id !== '~NotInSet');
        });

        //add not in set element from temp object to first elements
        if (tempObj.notInSet.id !== -1)
            filteredElements.unshift(tempObj.notInSet.el);
        
        //add no value elemet from temp object to first elements
        if (tempObj.noValue.id !== -1)
            filteredElements.unshift(tempObj.noValue.el);

        //now it will look like this ex.[<noValue>, <notInSet>, <element1>, <element2>, ...]

        //create 2 new attributes to each element
        jQuery.each(filteredElements, function (index, element) {
            var smartName = self.Handler.GetEnumText(element.id, element.short_name, element.long_name, enumHandlers.ENUMDISPLAYTYPE.SMART);
            element.index = index;
            element.checked = false;
            element.smart_name = jQuery('<div/>').html(smartName).text();
        });
        
        //create datasource object
        var dataSource = {
            data: filteredElements,
            pageSize: 50,
            schema: {
                model: { id: 'id' }
            }
        };

        //create new instance kendo data source
        return new kendo.data.DataSource(dataSource);
    };
    self.ApplyWhenClickEnumListGrid = function (checkbox, gridId) {
        var uid = jQuery(checkbox).parents('tr:first').data('uid');
        var grid = jQuery('[id=' + gridId + ']:visible').data(enumHandlers.KENDOUITYPE.GRID);
        var dataItem = grid.dataSource.getByUid(uid);
        dataItem.checked = checkbox.checked;
        grid.refresh();

        var elementParts = gridId.split('-');
        var elementIndex = elementParts[1];
        if (elementParts[0] === 'ValueListEnlarge') {
            var sourceGrid = self.GetHtmlElementById('ValueList-' + elementIndex).data(enumHandlers.KENDOUITYPE.GRID);
            var sourceDataItem = sourceGrid.dataSource.get(dataItem.id);
            sourceDataItem.checked = checkbox.checked;
            sourceGrid.refresh();
        }

        setTimeout(function () {
            jQuery(document).trigger('click.grid_eunm_filter', grid.element);
        }, 1);

        self.Handler.ApplyFilterWhenAction(elementIndex);
    };
    self.ShowEnumurateEnlargePopup = function (elementIndex) {
        requestHistoryModel.SaveLastExecute(self, self.ShowEnumurateEnlargePopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        self.GetHtmlElementById('ValueList-' + elementIndex).removeClass('focus');

        var queryStep = self.Handler.Data()[elementIndex];
        if (queryStep) {
            var popupTitle = self.Handler.GetFilterText({
                step_type: queryStep.step_type,
                field: queryStep.field,
                operator: queryStep.operator,
                arguments: []
            }, self.Handler.ModelUri);

            var popupName = 'EnumurateEnlarge';
            var popupSettings = {
                element: '#popup' + popupName,
                title: popupTitle,
                className: 'popup' + popupName,
                minwidth: 520,
                width: 600,
                html: self.GenerateTemplate('CRITERIAGROUPFOUR_POPUP', '', elementIndex),
                buttons: [
                    {
                        text: Localization.Ok,
                        position: 'right',
                        isPrimary: true,
                        click: 'close'
                    }
                ],
                open: function (e) {
                    self.ApplyCustomView(e.sender.element);

                    self.InitialControlsEnum(elementIndex);

                    self.BindingEnumListGrid('ValueListEnlarge-' + elementIndex, queryStep.field, true, []);

                    //enum enlarge popup search box
                    var filterEnumGrid = function () {
                        self.Handler.FilterEnum('ValueListEnlarge-' + elementIndex, jQuery('#txtFitlerEnum').val());
                    };
                    jQuery('#txtFitlerEnum').on('keyup', filterEnumGrid);
                    jQuery('#btnFitlerEnum').on('click', filterEnumGrid);
                },
                close: popup.Destroy,
                resize: function (e) {
                    var gridElement = jQuery('#ValueListEnlarge-' + elementIndex);
                    gridElement.height(e.sender.element.height() - 60);
                    kendo.resize(gridElement);
                }
            };

            popup.Show(popupSettings);
        }
    };
    self.SelectAllList = function (elementIndex) {
        self.SetBatchEnumGrid(elementIndex, true);
    };
    self.DeselectAllList = function (elementIndex) {
        self.SetBatchEnumGrid(elementIndex, false);
    };
    self.InvertSelectList = function (elementIndex) {
        self.SetBatchEnumGrid(elementIndex, null);
    };
    self.SetBatchEnumGrid = function (elementIndex, check) {
        var enlargeGrid = jQuery('#ValueListEnlarge-' + elementIndex).data(enumHandlers.KENDOUITYPE.GRID);
        if (enlargeGrid) {
            var filter = enlargeGrid.dataSource.filter();
            var filterText = filter ? filter.filters[0].value : '';
            var defaultPageSize = enlargeGrid.dataSource.pageSize();

            // check using source of data
            var sourceData;
            if (filterText) {
                // use view if has filter & set new page size
                sourceData = 'view';
                enlargeGrid.dataSource.pageSize(enlargeGrid.dataSource.total());
            }
            else {
                sourceData = 'data';
            }

            if (check === null) {
                // invert selection
                jQuery.each(enlargeGrid.dataSource[sourceData](), function (index, data) {
                    data.checked = !data.checked;
                });
            }
            else {
                // select/deselect all
                jQuery.each(enlargeGrid.dataSource[sourceData](), function (index, data) {
                    data.checked = check;
                });
            }

            // set page size back to the default
            enlargeGrid.dataSource.pageSize(defaultPageSize);

            // update source grid
            var sourceGrid = self.GetHtmlElementById('ValueList-' + elementIndex).data(enumHandlers.KENDOUITYPE.GRID);
            jQuery.each(sourceGrid.dataSource.data(), function (index, data) {
                data.checked = enlargeGrid.dataSource.data()[index].checked;
            });
            sourceGrid.refresh();

            // trigger gid enum filter
            setTimeout(function () {
                jQuery(document).trigger('click.grid_eunm_filter', enlargeGrid.element);
            }, 1);
        }

        self.Handler.ApplyFilterWhenAction(elementIndex);
    };

    // text grid
    self.BindingListGrid = function (elementId, fieldType, defaultFilters) {
        var elementIndex = elementId.split('-')[1];
        self.GetHtmlElementById('RemoveSelectedValue-' + elementIndex).attr('disabled', 'disabled');
        self.GetHtmlElementById('RemoveAllSelectedValue-' + elementIndex).attr('disabled', 'disabled');

        var formatTemplate;
        var formatter = null;
        if (WC.FormatHelper.IsNumberFieldType(fieldType)) {
            var decimals = WC.FormatHelper.IsSupportDecimal(fieldType) ? 20 : 0;
            formatter = new Formatter({ decimals: decimals, thousandseparator: true, prefix: null }, fieldType);
            formatTemplate = WC.FormatHelper.GetFormatter(formatter);
        }
        else if (fieldType === enumHandlers.FIELDTYPE.PERIOD) {
            var periodFormatter = new Formatter({ format: enumHandlers.TIMEFORMAT.DAY }, fieldType);
            formatTemplate = WC.FormatHelper.GetFormatter(periodFormatter);
        }
        else if (fieldType === enumHandlers.FIELDTYPE.DATE) {
            formatTemplate = WC.FormatHelper.GetFormatter(fieldType);
        }
        else if (fieldType === enumHandlers.FIELDTYPE.DATETIME) {
            formatTemplate = self.Handler.GetDateTimeFormat();
        }
        else if (fieldType === enumHandlers.FIELDTYPE.TIME) {
            formatTemplate = self.Handler.GetTimeFormat();
        }
        else if (fieldType === enumHandlers.FIELDTYPE.TIMESPAN) {
            formatTemplate = self.Handler.GetTimeSpanFormat();
        }
        else {
            formatTemplate = '';
        }

        var defaultValues = [];
        if (defaultFilters.length) {
            jQuery.each(defaultFilters, function (index, filter) {
                if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    defaultValues.push({ value: WC.WidgetFilterHelper.ConvertUnixTimeToPicker(filter.value) });
                }
                else if (fieldType === enumHandlers.FIELDTYPE.TIME) {
                    defaultValues.push({ value: WC.WidgetFilterHelper.ConvertUnixTimeToPicker(filter.value) });
                }
                else {
                    defaultValues.push({ value: filter.value });
                }
            });
        }

        var columnFormat = !formatTemplate ? '' : '{0:' + formatTemplate + '}';
        var grid = self.GetHtmlElementById(elementId).kendoGrid({
            height: 130,
            scrollable: {
                virtual: true
            },
            dataSource: self.GetListGridDataSource(defaultValues),
            selectable: 'multiple, row',
            columns: [
                {
                    field: 'value',
                    title: '',
                    headerTemplate: '',
                    format: columnFormat,
                    template: function (e) {
                        if (formatter)
                            return WC.FormatHelper.GetFormattedValue(formatter, e.value);
                        else
                            return kendo.toString(e.value, formatTemplate);
                    }
                }
            ],
            dataBound: self.BindingListGridCheckButtons,
            change: self.BindingListGridCheckButtons
        }).data(enumHandlers.KENDOUITYPE.GRID);

        if (!!jQuery.browser.msie) {
            var virtualScroll = grid.content.data('kendoVirtualScrollable');
            grid.content
                .off('mousewheel.iefix')
                .on('mousewheel.iefix', function (e) {
                    if (!grid.content.find('.k-loading-mask').length) {
                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                    }
                });
        }
    };
    self.GetListGridDataSource = function (data) {
        return new kendo.data.DataSource({
            data: data,
            pageSize: 50
        });
    };
    self.BindingListGridCheckButtons = function (e) {
        var elementIndex = e.sender.element.attr('id').split('-')[1];
        if (e.sender.dataSource.data().length) {
            self.GetHtmlElementById('RemoveAllSelectedValue-' + elementIndex).removeAttr('disabled');
        }
        else {
            self.GetHtmlElementById('RemoveAllSelectedValue-' + elementIndex).attr('disabled', 'disabled');
        }

        if (e.sender.select().length) {
            self.GetHtmlElementById('RemoveSelectedValue-' + elementIndex).removeAttr('disabled');
        }
        else {
            self.GetHtmlElementById('RemoveSelectedValue-' + elementIndex).attr('disabled', 'disabled');
        }
    };
    self.GetInputValueUI = function (element, dataType) {
        var ui = null;
        switch (dataType) {
            case enumHandlers.FIELDTYPE.DATE:
            case enumHandlers.FIELDTYPE.DATETIME:
            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.INTEGER:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
            case enumHandlers.FIELDTYPE.PERIOD:
            case enumHandlers.FIELDTYPE.TIME:
            case enumHandlers.FIELDTYPE.TIMESPAN:
                ui = element.data('handler');
                break;
            case enumHandlers.FIELDTYPE.TEXT:
            case enumHandlers.FIELDTYPE.ENUM:
                ui = element;
                break;
            default:
                break;
        }

        return ui;
    };
    self.SetInputValueUI = function (ui, value) {
        if (ui.value)
            ui.value(value);
        else if (ui.val)
            ui.val(value);
    };
    self.SetPastableElement = function (elementIndex, fieldType) {
        self.GetHtmlElementById('SelectedValue-' + elementIndex)
            .on('paste', { index: elementIndex, type: fieldType }, self.SetPasteEvent)
            .on('keydown', { index: elementIndex, type: fieldType }, function (e) {
                if (e.which === 13) {
                    self.AddSelectedValue(e.data.index, e.data.type);
                }
            });
    };
    self.SetPasteEvent = function (e) {
        var element = jQuery(e.currentTarget);
        var isPercentageValues = element.data('role') === 'percentagetextbox';
        var getPasteText = function () {
            var dfd = jQuery.Deferred();
            var clipboardData = e.clipboardData || e.originalEvent.clipboardData || window.clipboardData;
            var text = '';
            if (clipboardData && clipboardData.getData) {
                try {
                    text = jQuery.trim(clipboardData.getData('text') || '');
                }
                catch (ex) {
                    // do nothing
                }
            }

            if (text) {
                dfd.resolve(text);
            }
            else {
                setTimeout(function () {
                    dfd.resolve(jQuery.trim(element.val()).replace(/\s/g, '\n'));
                }, 1);
            }

            return dfd.promise();
        };

        jQuery.when(getPasteText())
            .done(function (text) {
                var pasteLimit = -1;
                var list = text.split('\n');
                if (pasteLimit !== -1 && list.length > pasteLimit) {
                    popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_PasteFilterValuesLimited, pasteLimit));
                    list.splice(pasteLimit, list.length - pasteLimit);
                }
                if (isPercentageValues) {
                    list = jQuery.map(list, function (value) {
                        return WC.FormatHelper.PercentagesToNumber(value);
                    });
                }
                element.data('paste', list);
                setTimeout(function () {
                    self.AddSelectedValue(e.data.index, e.data.type);
                }, 1);
            });
    };
    self.AddSelectedValue = function (index, dataType) {
        var valueElement = self.GetHtmlElementById('SelectedValue-' + index);
        var ui = self.GetInputValueUI(valueElement, dataType);
        var grid = self.GetHtmlElementById('ValueList-' + index).data(enumHandlers.KENDOUITYPE.GRID);
        var currentValues = grid.dataSource.data();
        var getKey = function (value) {
            // get key of the value

            return value instanceof Date ? value.toISOString() : value;
        };
        var getValue = function (ui, pasteValue) {
            // get value from UI

            var value = null;
            switch (dataType) {
                case enumHandlers.FIELDTYPE.DATE:
                case enumHandlers.FIELDTYPE.DATETIME:
                    if (pasteValue !== null)
                        ui.value(pasteValue);
                    value = ui.value();

                    if (value === null)
                        return null;
                    break;
                case enumHandlers.FIELDTYPE.CURRENCY:
                case enumHandlers.FIELDTYPE.DOUBLE:
                case enumHandlers.FIELDTYPE.INTEGER:
                case enumHandlers.FIELDTYPE.PERCENTAGE:
                case enumHandlers.FIELDTYPE.TIMESPAN:
                    if (pasteValue !== null)
                        value = parseFloat(pasteValue);
                    else
                        value = ui.value();

                    if (value === null || isNaN(value))
                        return null;
                    break;
                case enumHandlers.FIELDTYPE.PERIOD:
                    if (pasteValue !== null)
                        value = parseFloat(pasteValue);
                    else
                        value = ui.value();

                    if (value === null || isNaN(value))
                        return null;

                    var unitSelector = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('ValueUnit-' + index));
                    value *= unitSelector.value();
                    break;
                case enumHandlers.FIELDTYPE.TEXT:
                case enumHandlers.FIELDTYPE.ENUM:
                    if (pasteValue !== null)
                        value = pasteValue;
                    else
                        value = ui.val();

                    if (value === '')
                        return null;
                    break;
                case enumHandlers.FIELDTYPE.TIME:
                    var timeValue = ui.value();
                    if (pasteValue !== null) {
                        ui.element.val(pasteValue);
                        self.FriendlyInputTimePicker(ui.element);
                        timeValue = ui.value();
                        ui.value(null);
                    }
                    value = timeValue;

                    if (value === null)
                        return null;

                    break;
                default:
                    break;
            }

            return duplicateValues[getKey(value)] ? null : value;
        };

        // collect currect value for checking a duplcating values
        var duplicateValues = {};
        jQuery.each(currentValues, function (index, currentValue) {
            duplicateValues[getKey(currentValue.value)] = true;
        });

        valueElement.focus();

        if (ui) {
            // collect old data
            var newData = jQuery.map(currentValues, function (data) { return data.toJSON(); });
            var pasteValues = [];
            if (valueElement.data('paste')) {
                // get value form pasting
                var pasteValues = valueElement.data('paste');
                jQuery.each(pasteValues, function (index, pasteValue) {
                    var value = getValue(ui, jQuery.trim(pasteValue));
                    if (value !== null) {
                        // add to newData if it's new
                        duplicateValues[getKey(value)] = true;
                        newData.push({ value: value });
                    }
                });
            }
            else {
                // get value from input
                var value = getValue(ui, null);
                if (value !== null) {
                    // add to newData if it's new
                    newData.push({ value: value });
                }
            }

            // refresh the grid
            if (newData.length) {
                grid.unbind('dataBound');
                grid.setDataSource(self.GetListGridDataSource(newData));
                grid.bind('dataBound', self.BindingListGridCheckButtons);
                grid.trigger('dataBound');
                grid.virtualScrollable.verticalScrollbar.scrollTop(grid.virtualScrollable.itemHeight * newData.length);
                setTimeout(function () {
                    // clear input
                    self.SetInputValueUI(ui, '');
                }, 1);
            }
        }
        
        valueElement.removeData('paste');

        self.Handler.ApplyFilterWhenAction(index);
    };
    self.RemoveSelectedValue = function (index, dataType) {
        var grid = self.GetHtmlElementById('ValueList-' + index).data(enumHandlers.KENDOUITYPE.GRID);
        var selectingRows = grid.select();

        // remove selecting rows
        grid.unbind('dataBound');
        selectingRows.each(function () {
            grid.removeRow(jQuery(this));
        });
        grid.bind('dataBound', self.BindingListGridCheckButtons);
        grid.trigger('dataBound');

        // set buttons status
        if (grid.dataSource.data().length) {
            grid.select(grid.content.find('tr:first'));
        }

        self.Handler.ApplyFilterWhenAction(index);
    };
    self.RemoveAllSelectedValue = function (index) {
        var grid = self.GetHtmlElementById('ValueList-' + index).data(enumHandlers.KENDOUITYPE.GRID);
        grid.setDataSource(self.GetListGridDataSource([]));

        self.Handler.ApplyFilterWhenAction(index);
    };

    self.ConvertUIToArguments = function (operator, firstElementId, fieldType, secondElementId) {
        var values = [];
        var firstElement = self.GetHtmlElementById(firstElementId);
        var secondElement = self.GetHtmlElementById(secondElementId);

        switch (operator) {
            case enumHandlers.OPERATOR.EQUALTO.Value:
            case enumHandlers.OPERATOR.NOTEQUALTO.Value:
            case enumHandlers.OPERATOR.SMALLERTHAN.Value:
            case enumHandlers.OPERATOR.GREATERTHAN.Value:
            case enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value:
            case enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value:
                if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    // do nothing: move to ConvertUIToAdvanceArguments
                }
                else if (fieldType === enumHandlers.FIELDTYPE.TEXT) {
                    var criteriaElement = firstElement;

                    if (criteriaElement.val()) {
                        values.push(criteriaElement.val());
                    }
                }
                else if (fieldType === enumHandlers.FIELDTYPE.BOOLEAN) {
                    var criteriaElement = firstElement;
                    var criteriaElement2 = secondElement;

                    if (criteriaElement.is(':checked')) {
                        values.push(true);
                    }
                    else if (criteriaElement2.is(':checked')) {
                        values.push(false);
                    }
                }
                else if (fieldType === enumHandlers.FIELDTYPE.PERIOD) {
                    var elementIndex = firstElementId.split('-')[1];
                    var criteriaElement = firstElement.data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    if (criteriaElement.value() !== null) {
                        var unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('FirstInputUnit-' + elementIndex)).value();
                        var elementValue = parseInt(criteriaElement.value()) * unitDay;
                        values.push(elementValue);
                    }
                }
                else if (jQuery.inArray(fieldType, [
                        enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDTYPE.INTEGER,
                        enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.PERCENTAGE,
                        enumHandlers.FIELDTYPE.TIMESPAN
                ]) !== -1) {
                    var criteriaElement = firstElement.data('handler');
                    if (criteriaElement.value() !== null) {
                        values.push(criteriaElement.value());
                    }
                }
                else if (fieldType === enumHandlers.FIELDTYPE.ENUM) {
                    var handler = firstElement.data('handler');
                    if (handler.dataItem())
                        values.push(handler.dataItem().id);
                    else
                        values.push(handler.value());
                }
                else if (fieldType === enumHandlers.FIELDTYPE.TIME) {
                    var criteriaElement = firstElement.data(enumHandlers.KENDOUITYPE.TIMEPICKER);
                    if (criteriaElement.value() !== null) {
                        values.push(WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(criteriaElement.value()));
                    }
                }
                break;
            case enumHandlers.OPERATOR.BETWEEN.Value:
            case enumHandlers.OPERATOR.NOTBETWEEN.Value:
                var firstCriteriaElement, secondCriteriaElement;
                if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    // do nothing: move to ConvertUIToAdvanceArguments
                }
                else if (fieldType === enumHandlers.FIELDTYPE.TEXT) {
                    firstCriteriaElement = firstElement;
                    secondCriteriaElement = secondElement;
                    values.push(firstCriteriaElement.val());
                    values.push(secondCriteriaElement.val());
                }
                else if (fieldType === enumHandlers.FIELDTYPE.PERIOD) {
                    var elementIndex = firstElementId.split('-')[1];
                    firstCriteriaElement = firstElement.data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    var unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('FirstInputUnit-' + elementIndex)).value();
                    var elementValue;

                    if (firstCriteriaElement.value() !== null) {
                        elementValue = parseInt(firstCriteriaElement.value()) * unitDay;
                        values.push(elementValue);
                    }

                    unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('SecondInputUnit-' + elementIndex)).value();
                    secondCriteriaElement = secondElement.data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    if (secondCriteriaElement && secondCriteriaElement.value() !== null) {
                        elementValue = parseInt(secondCriteriaElement.value()) * unitDay;
                        values.push(elementValue);
                    }
                }
                else if (jQuery.inArray(fieldType, [
                        enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.FIELDTYPE.INTEGER,
                        enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.FIELDTYPE.PERCENTAGE,
                        enumHandlers.FIELDTYPE.TIMESPAN
                ]) !== -1) {
                    firstCriteriaElement = firstElement.data('handler');
                    secondCriteriaElement = secondElement.data('handler');
                    if (firstCriteriaElement.value() !== null) {
                        values.push(firstCriteriaElement.value());
                    }
                    if (secondCriteriaElement && secondCriteriaElement.value() !== null) {
                        values.push(secondCriteriaElement.value());
                    }
                }
                else if (fieldType === enumHandlers.FIELDTYPE.TIME) {
                    firstCriteriaElement = firstElement.data(enumHandlers.KENDOUITYPE.TIMEPICKER);
                    if (firstCriteriaElement.value() !== null) {
                        values.push(WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(firstCriteriaElement.value()));
                    }

                    secondCriteriaElement = secondElement.data(enumHandlers.KENDOUITYPE.TIMEPICKER);
                    if (secondCriteriaElement && secondCriteriaElement.value() !== null) {
                        values.push(WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(secondCriteriaElement.value()));
                    }
                }
                break;
            case enumHandlers.OPERATOR.INLIST.Value:
            case enumHandlers.OPERATOR.NOTINLIST.Value:
            case enumHandlers.OPERATOR.CONTAIN.Value:
            case enumHandlers.OPERATOR.NOTCONTAIN.Value:
            case enumHandlers.OPERATOR.STARTWITH.Value:
            case enumHandlers.OPERATOR.NOTSTARTWITH.Value:
            case enumHandlers.OPERATOR.ENDON.Value:
            case enumHandlers.OPERATOR.NOTENDON.Value:
            case enumHandlers.OPERATOR.MATCHPATTERN.Value:
            case enumHandlers.OPERATOR.NOTMATCHPATTERN.Value:

                var grid = firstElement.data(enumHandlers.KENDOUITYPE.GRID);
                if (grid) {
                    var datas = grid.dataSource.data();

                    if (fieldType === enumHandlers.FIELDTYPE.ENUM && (operator === enumHandlers.OPERATOR.INLIST.Value || operator === enumHandlers.OPERATOR.NOTINLIST.Value)) {
                        jQuery.each(datas, function (index, data) {
                            if (data.checked) {
                                values.push(data.id);
                            }
                        });
                    }
                    else {
                        jQuery.each(datas, function (index, data) {
                            if (fieldType === enumHandlers.FIELDTYPE.DATE) {
                                values.push(WC.WidgetFilterHelper.ConvertDatePickerToUnixTime(data.value, false));
                            }
                            else if (fieldType === enumHandlers.FIELDTYPE.DATETIME) {
                                values.push(WC.WidgetFilterHelper.ConvertDatePickerToUnixTime(data.value, true));
                            }
                            else if (WC.FormatHelper.IsNumberFieldType(fieldType)
                                || fieldType === enumHandlers.FIELDTYPE.PERIOD) {
                                values.push(parseFloat(data.value));
                            }
                            else if (fieldType === enumHandlers.FIELDTYPE.TIME) {
                                values.push(WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(data.value));
                            }
                            else {
                                values.push(data.value);
                            }
                        });
                    }
                }
                break;
            case enumHandlers.OPERATOR.RELATIVEBEFORE.Value:
            case enumHandlers.OPERATOR.RELATIVEAFTER.Value:
                var elementIndex = firstElementId.split('-')[1];
                var criteriaElement = firstElement.data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                var unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('FirstInputUnit-' + elementIndex)).value();

                if (criteriaElement.value() !== null) {
                    var elementValue = parseInt(criteriaElement.value()) * unitDay;
                    values.push(elementValue);
                }
                break;
            case enumHandlers.OPERATOR.RELATIVEBETWEEN.Value:
            case enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value:
                if (WC.FormatHelper.IsDateOrDateTime(fieldType)) {
                    var elementIndex = firstElementId.split('-')[1];
                    var firstCriteriaElement = firstElement.data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    var secondCriteriaElement = secondElement.data(enumHandlers.KENDOUITYPE.NUMERICTEXT);
                    var unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('FirstInputUnit-' + elementIndex)).value();
                    var elementValue;

                    if (firstCriteriaElement.value() !== null) {
                        elementValue = parseInt(firstCriteriaElement.value()) * unitDay;
                        values.push(elementValue);
                    }

                    if (secondCriteriaElement.value() !== null) {
                        unitDay = WC.HtmlHelper.DropdownList(self.GetHtmlElementById('SecondInputUnit-' + elementIndex)).value();
                        elementValue = parseInt(secondCriteriaElement.value()) * unitDay;
                        values.push(elementValue);
                    }
                }
                break;
            default:
                break;
        }

        var argumentValues = [];
        jQuery.each(values, function (index, value) {
            argumentValues.push(WC.WidgetFilterHelper.ArgumentObject(value, enumHandlers.FILTERARGUMENTTYPE.VALUE));
        });
        return argumentValues;
    };
    self.ConvertUIToAdvanceArguments = function (elementIndex) {
        var argumentValues = [];
        self.GetHtmlElementById('FilterDetail-' + elementIndex + '-PlaceHolder').find('.FilterWrapperAdvance').each(function (index) {
            var elementKey = elementIndex + '_' + index;
            var argumentType = self.GetArgumentType(elementKey);

            switch (argumentType) {
                case enumHandlers.FILTERARGUMENTTYPE.FUNCTION:
                    var functionType = self.GetArgumentFunctionType(elementKey);
                    var functionValue = self.GetArgumentFunctionValue(elementKey);
                    argumentValues.push(WC.WidgetFilterHelper.ArgumentPeriodFunction(functionType, functionValue));
                    break;

                case enumHandlers.FILTERARGUMENTTYPE.FIELD:
                    var compareField = self.GetArgumentField(elementKey);
                    argumentValues.push(WC.WidgetFilterHelper.ArgumentObject(compareField, argumentType));
                    break;

                default:
                    var compareValue = self.GetArgumentValue(elementKey);
                    if (compareValue != null)
                        argumentValues.push(WC.WidgetFilterHelper.ArgumentObject(compareValue, argumentType));
                    break;
            }
        });
        return argumentValues;
    };
    self.InitialControlsEnum = function (elementIndex) {
        var userSettingEnum = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.ENUM);
        self.RenderFormatSettingDropdownlist('EnumDropdown-' + elementIndex, userSettingModel.Enums, userSettingEnum.format, elementIndex);
    };
    self.RenderFormatSettingDropdownlist = function (elementId, models, userSettingDefault, elementIndex) {
        var dropdownTextField = 'name';
        var dropdownValueField = 'id';

        var defaultIndex = 0;
        var datas = ko.toJS(models);

        jQuery.each(datas, function (index, data) {
            if (data && data[dropdownValueField] === userSettingDefault) {
                defaultIndex = index;
            }
        });

        var kendoDropDownOption = {
            dataTextField: dropdownTextField,
            dataValueField: dropdownValueField,
            index: defaultIndex,
            change: function (e) {
                self.Handler.FilterEnumFormat = e.sender.value();

                var enlargeGrid = jQuery('#ValueListEnlarge-' + elementIndex).data(enumHandlers.KENDOUITYPE.GRID);
                if (enlargeGrid)
                    enlargeGrid.refresh();
            }
        };

        self.Handler.FilterEnumFormat = datas[defaultIndex][dropdownValueField];

        var ddl = WC.HtmlHelper.DropdownList('#' + elementId, datas, kendoDropDownOption);
        ddl.setDataSource(datas);
        return ddl;
    };
}
