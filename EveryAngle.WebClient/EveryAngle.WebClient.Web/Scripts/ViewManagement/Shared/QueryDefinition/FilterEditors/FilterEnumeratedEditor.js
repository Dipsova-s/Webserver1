function FilterEnumeratedEditor(handler, queryStep, element) {
    var self = this;
    self.$GridPopup = null;
    self.EnumeratedPopupFormat = null;

    var _self = {};
    _self.path = '';
    _self.raw = [];
    _self.data = [];
    _self.search = {};

    // general
    self.Initial = function (handler, queryStep, element) {
        self.UpdateFieldDomainData(queryStep, handler.ModelUri);
        self.InjectElementsCSS(_self.data);
        self.parent.prototype.Initial.call(self, handler, queryStep, element);
    };
    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
            enumHandlers.QUERYSTEPOPERATOR.GROUPONE,
            enumHandlers.QUERYSTEPOPERATOR.ENUMONE));
    };
    self.TransferArguments = function (prevOperator) {
        // none enumerated operator can transfer with the same group
        if (self.IsNoneEnumeratedListOperator(prevOperator) !== self.IsNoneEnumeratedListOperator(self.Data.operator()))
            self.Data.arguments([]);
        else
            self.parent.prototype.TransferArguments.call(self, prevOperator);
    };
    self.UpdateFieldDomainData = function (queryStep, modelUri) {
        var field = modelFieldsHandler.GetFieldById(queryStep.field, modelUri);
        var domainPath, fieldDomain;
        if (field) {
            domainPath = modelFieldDomainHandler.GetDomainPathByUri(field.domain);
            fieldDomain = modelFieldDomainHandler.GetFieldDomainByUri(field.domain);
        }
        _self.path = WC.Utility.IfNothing(domainPath, '');
        _self.raw = WC.Utility.IfNothing(fieldDomain, { elements: [] });
        _self.data = self.NormalizeFieldDomainData(_self.raw, queryStep);
        _self.search = self.GetElementSearchIndexes(_self.data);
    };
    self.GetElementSearchIndexes = function (data) {
        var indexes = {};
        jQuery.each(data, function (index, element) {
            var key = self.GetElementName(element)[0];
            if (key) {
                key = key.toLowerCase();
                indexes[key] = WC.Utility.IfNothing(indexes[key], []);
                indexes[key].push(index);
            }
        });
        return indexes;
    };
    self.InjectElementsCSS = function (data) {
        var imagePath = self.GetFieldDomainImagePath();
        jQuery.each(data, function (index, element) {
            iconInfo = modelFieldDomainHandler.GetDomainElementIconInfo(imagePath, element.id);
            iconInfo.injectCSS();
        });
    };
    self.NormalizeFieldDomainData = function (data, queryStep) {
        //convert model array to object array
        var elements = ko.toJS(data.elements);

        //do sort order elements
        if (data.may_be_sorted)
            elements.sortObject('short_name', enumHandlers.SORTDIRECTION.ASC, false);

        // store 2 elements
        var noValueElement = elements.findObject('id', null);
        var notInSetElement = elements.findObject('id', '~NotInSet');

        // remove 2 elements
        elements = jQuery.grep(elements, function (element) {
            return element.id !== null && element.id !== '~NotInSet';
        });

        // add 2 elements on top
        // it will look like this e.g. [<noValue>, <notInSet>, <element1>, <element2>, ...]
        if (notInSetElement)
            elements.unshift(notInSetElement);
        if (noValueElement)
            elements.unshift(noValueElement);

        // for invalid elements
        if (!self.IsNoneEnumeratedListOperator(queryStep.operator())) {
            var args = ko.toJS(queryStep.arguments());
            args.sortObject('value', enumHandlers.SORTDIRECTION.DESC, false);
            jQuery.each(args, function (index, argument) {
                if (self.IsArgumentTypeValue(argument)
                    && argument.value
                    && !elements.hasObject('id', argument.value)) {
                    elements.unshift({
                        id: argument.value,
                        valid: false
                    });
                }
            });
        }

        // add more properties
        var imagePath = self.GetFieldDomainImagePath();
        jQuery.each(elements, function (index, element) {
            var smartName = self.GetElementName(element, enumHandlers.ENUMDISPLAYTYPE.SMART);
            var iconInfo = modelFieldDomainHandler.GetDomainElementIconInfo(imagePath, element.id);
            element.__id = element.id;
            element.index = index;
            element.checked = false;
            element.smart_name = smartName;
            element.template = iconInfo.html + '<span>#: name #</span>';
        });

        return elements;
    };
    self.GetFieldDomainData = function () {
        return ko.toJS(_self.data);
    };
    self.GetFieldDomainDataSource = function () {
        //create new instance kendo data source
        return new kendo.data.DataSource({
            data: self.GetFieldDomainData(),
            pageSize: 50,
            schema: {
                model: {
                    id: 'index',
                    fields: {
                        index: { type: 'number' }
                    }
                }
            }
        });
    };
    self.GetFieldDomainImagePath = function () {
        return _self.path;
    };
    self.GetElementName = function (element, format) {
        format = WC.Utility.IfNothing(format, enumHandlers.ENUMDISPLAYTYPE.SMART);
        var id = typeof element.__id !== 'undefined' ? element.__id : element.id;
        var shortName = WC.Utility.IfNothing(element.short_name, id);
        var longName = WC.Utility.IfNothing(element.long_name, id);
        return WC.FormatHelper.GetFormattedEnumValue(format, shortName, longName);
    };
    self.GetElementById = function (id) {
        return self.GetFieldDomainData().findObject('id', id);
    };
    self.GetElementByIndex = function (index) {
        return self.GetFieldDomainData()[index];
    };
    self.GetElementTemplate = function (data) {
        // output
        var value = jQuery.extend({ name: data.smart_name }, data);
        return kendo.template(data.template)(value);
    };
    self.GetInputArgumentValue = function (input) {
        var handler = input.data('handler');
        var dataItem = handler.dataItem();
        return dataItem ? dataItem.__id : handler.text();
    };
    self.IsValidArgumentValue = function (value) {
        if (self.IsNoneEnumeratedListOperator(self.Data.operator())) {
            // multiple argument can be any valid
            return value;
        }
        else {
            // single or list enumerated argument must be checked specifically
            return self.GetFieldDomainData().hasObject('__id', value);
        }
    };

    // single argument
    self.InitialSingleArgumentUI = function (container) {
        // call base to perform argument type field
        self.parent.prototype.InitialSingleArgumentUI.call(self, container);

        var input = container.find('.input-argument-value');

        // set value to ui
        self.CreateSingleInputDropdown(input);

        // set value to ui
        var argument = self.Data.arguments()[0];
        if (self.IsArgumentTypeValue(argument)) {
            var data = self.GetElementById(argument.value);
            if (data) {
                input.data('handler').value(data.index);
            }
        }
    };
    self.CreateSingleInputDropdown = function (input) {
        var dataSoruce = self.GetFieldDomainDataSource();
        var options = self.GetInputDropdownOptions(jQuery.proxy(self.SetSingleArgumentValue, self, input));
        var ui = WC.HtmlHelper.DropdownList(input, dataSoruce, options);
        ui.value(null);
    };
    self.GetInputDropdownOptions = function (fn) {
        return {
            optionLabel: Localization.PleaseSelect,
            dataTextField: 'smart_name',
            dataValueField: 'index',
            filter: 'contains',
            virtual: {
                itemHeight: 28,
                valueMapper: self.MapInputDropdownValue
            },
            template: self.GetElementTemplate,
            change: fn
        };
    };
    self.MapInputDropdownValue = function (options) {
         var data = this.dataSource.get(options.value);
         if (data)
            options.success(data.index);
    };

    // multiple argument
    self.InitialMultipleArgumentUI = function (container) {
        if (self.IsNoneEnumeratedListOperator(self.Data.operator()))
            self.parent.prototype.InitialMultipleArgumentUI.call(self, container);
        else
            self.InitialEnumeratedListOperatorUI(container);
    };
    self.GetInputTypingValue = function (inputTyping) {
        return jQuery.trim(inputTyping.val());
    };

    // enumerated input
    self.IsNoneEnumeratedListOperator = function (operator) {
        var operators = [
            enumHandlers.OPERATOR.CONTAIN.Value,
            enumHandlers.OPERATOR.STARTWITH.Value,
            enumHandlers.OPERATOR.MATCHPATTERN.Value
        ];
        return jQuery.inArray(operator, operators) !== -1;
    };
    self.InitialEnumeratedListOperatorUI = function (container) {
        var template = self.GetEnumeratedMultipleArgumentTemplate();
        container.html(template);
        self.SetElementCssClass('filter-editor-multiple');

        // grid
        var gridOptions = self.GetEnumeratedListGridOptions();
        self.$Grid = self.CreateEnumeratedListGrid(container, gridOptions);
        self.UpdateEnumeratedGridValues(self.$Grid, self.Data.arguments());
        self.$Grid.content
            .off('click', 'input[type="checkbox"]')
            .on('click', 'input[type="checkbox"]', self.SetEnumeratedValue);
        jQuery(document).off('click.grid_enumerated').on('click.grid_enumerated', self.SetEnumeratedGridJumpState);
        jQuery(document).off('keydown.grid_enumerated').on('keydown.grid_enumerated', self.EnumeratedGridExecuteJump);

        // popup
        container.find('.action-popup').off('click').on('click', self.ShowEnumeratedListPopup);
    };
    self.GetEnumeratedMultipleArgumentTemplate = function () {
        return [
            '<div class="form-row row-enumerated-list">',
                '<div class="form-col form-col-body col-list">',
                    '<div class="input-argument-list grid-custom-scroller grid-filterable"></div>',
                '</div>',
                '<div class="form-col col-actions">',
                    '<a class="btn btn-ghost action-popup" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Localization.OpenEnumeratedPopup + '"><i class="icon icon-link"></i></a>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.CreateEnumeratedListGrid = function (container, gridOptions) {
        var grid = container.find('.input-argument-list')
            .kendoGrid(gridOptions)
            .data(enumHandlers.KENDOUITYPE.GRID);

        // fixed IE issue
        WC.HtmlHelper.EnableMouseScrolling(grid);

        return grid;
    };
    self.GetEnumeratedListGridOptions = function () {
        var self = this;
        return {
            dataSource: self.GetFieldDomainDataSource(),
            height: 132,
            scrollable: {
                virtual: true
            },
            sortable: true,
            selectable: 'row',
            columns: [
                {
                    field: 'smart_name',
                    headerTemplate: '',
                    headerAttributes: {
                        'class': 'alwaysHide'
                    },
                    template: self.GetEnumeratedElementTemplate
                }
            ]
        };
    };
    self.GetEnumeratedElementTemplate = function (data, name) {
        var value = jQuery.extend({ name: WC.Utility.IfNothing(name, data.smart_name) }, data);
        var template = [
            '<label>',
                '<input type="checkbox" data-index="#= index #"#= checked ? " checked": "" #>',
                '<span class="label">', data.template, '</span>',
            '</label>'
        ].join('');
        return kendo.template(template)(value);
    };
    self.SetEnumeratedGridJumpState = function (e) {
        jQuery('.k-grid.grid-filterable').removeClass('active');
        var gridElement = jQuery(e.target).closest('.k-grid.grid-filterable');
        gridElement.addClass('active');
    };
    self.EnumeratedGridExecuteJump = function (e) {
        // check grid
        var grid = jQuery('.k-grid.grid-filterable.active:visible').data(enumHandlers.KENDOUITYPE.GRID);
        if (!grid)
            return;

        // check key
        if (!self.IsValidJumpKeyCode(grid, e.keyCode)) {
            e.preventDefault();
            return;
        }

        var jumpIndexes = self.GetJumpIndexes(grid, e.keyCode);
        if (!jumpIndexes.length)
            return;

        // get the next index
        var jumpIndex = self.GetJumpIndex(grid, jumpIndexes);

        // scroll to view
        self.ScrollToJumpIndex(grid, jumpIndex);
    };
    self.IsValidJumpKeyCode = function (grid, keyCode) {
        // handle ENTER/SPACEBAR key
        if (keyCode === 13 || keyCode === 32) {
            grid.select().find('input[type="checkbox"]').trigger('click');
            return false;
        }
        
        // prevent BACKSPACE key
        if (keyCode === 8) {
            return false;
        }

        return true;
    };
    self.GetJumpCharacter = function (keyCode) {
        // handle numpad key
        if (keyCode >= 96 && keyCode <= 105) {
            keyCode -= 48;
        }

        // get char
        return jQuery.trim(String.fromCharCode(keyCode));
    };
    self.GetJumpIndexes = function (grid, keyCode) {
        // get char & indexes
        var filterChar = self.GetJumpCharacter(keyCode);
        var handler = grid.wrapper.closest('.filter-editor').data('Editor');
        return !filterChar ? [] : handler.EnumeratedGridJumpIndexes(filterChar);
    };
    self.GetJumpIndex = function (grid, jumpIndexes) {
        // get current cursor
        var selectingRow = grid.select();
        var currentCursor = !selectingRow.length ? -1 : selectingRow.find('input[type="checkbox"]').data('index');

        // find the next item
        var itemIndex = jumpIndexes[0];
        jQuery.each(jumpIndexes, function (index, jumpIndex) {
            if (jumpIndex > currentCursor) {
                itemIndex = jumpIndex;
                return false;
            }
        });
        return itemIndex;
    };
    self.ScrollToJumpIndex = function (grid, jumpIndex) {
        var itemHeight = grid.virtualScrollable.itemHeight;
        var currentScrollPosition = grid.virtualScrollable.verticalScrollbar.scrollTop();
        var contentHeight = Math.floor(grid.content.height() / itemHeight) * itemHeight;
        var scrollPosition = jumpIndex * itemHeight;
        if (scrollPosition <= currentScrollPosition || scrollPosition >= currentScrollPosition + contentHeight) {
            grid.virtualScrollable.verticalScrollbar.scrollTop(scrollPosition - itemHeight);
        }

        // make sure that it focus at the right row
        self.EnsureScrollToJumpIndex(grid, jumpIndex);
    };
    self.EnsureScrollToJumpIndex = function (grid, jumpIndex) {
        clearInterval(window.fnCheckJump);
        window.fnCheckJump = setInterval(function () {
            var target = grid.content.find('[data-index="' + jumpIndex + '"]');
            if (target.length) {
                grid.select(target.parents('tr:first'));
                clearInterval(window.fnCheckJump);
            }
        }, 1);
    };
    self.EnumeratedGridJumpIndexes = function (key) {
        key = ('' + key).toLowerCase();
        return WC.Utility.IfNothing(_self.search[key], []);
    };
    self.UpdateEnumeratedGridValues = function (grid, args) {
        var values = {};
        jQuery.each(args, function (index, arg) {
            values[arg.value] = true;
        });
        jQuery.each(grid.dataSource.data(), function (index, data) {
            data.checked = WC.Utility.ToBoolean(values[data.__id]);
        });
        grid.refresh();
    };
    self.UpdateEnumeratedArgumentValues = function () {
        var args = jQuery.map(self.$Grid.dataSource.data(), function (data) {
            if (data.checked)
                return self.GetObjectArgumentValue(data.__id);
        });
        self.Data.arguments(args);
    };
    self.SetEnumeratedValue = function (e) {
        var index = jQuery(e.currentTarget).data('index');
        self.$Grid.dataSource.get(index).checked = e.currentTarget.checked;
        self.UpdateEnumeratedArgumentValues();
    };

    // enumerated popup
    self.ShowEnumeratedListPopup = function () {
        var popupSettings = self.GetEnumeratedListPopupOptions();
        popup.Show(popupSettings);
    };
    self.GetEnumeratedListPopupOptions = function () {
        var cloneData = self.Data.data();
        cloneData.arguments = [];
        
        return {
            element: '#PopupEnumurated',
            title: WC.WidgetFilterHelper.GetFilterText(cloneData, self.Handler.ModelUri),
            className: 'popup-enumerated',
            minWidth: 500,
            width: 600,
            height: 500,
            html: self.GetEnumeratedListPopupTemplate(),
            buttons: [
                {
                    text: Localization.Ok,
                    position: 'right',
                    isPrimary: true,
                    click: 'close'
                }
            ],
            open: self.EnumeratedListPopupCallback,
            close: popup.Destroy,
            resize: self.EnumeratedListPopupResize
        };
    };
    self.GetEnumeratedListPopupTemplate = function () {
        return [
            '<div class="form-row">',
                '<div class="form-col form-col-body col-search">',
                    '<input type="text" class="input-search"/>',
                '</div>',
                '<div class="form-col col-format">',
                    '<input type="text" class="input-format"/>',
                '</div>',
            '</div>',
            '<div class="form-row">',
                '<div class="form-col form-col-body col-list">',
                    '<div class="input-argument-list grid-custom-scroller"></div>',
                '</div>',
                '<div class="form-col col-actions">',
                    '<a class="btn action-select-all" data-role="tooltip" data-tooltip-position="right" data-tooltip-text="' + Localization.SelectAll + '"><i class="icon icon-select-all"></i></a>',
                    '<a class="btn action-clear-all" data-role="tooltip" data-tooltip-position="right" data-tooltip-text="' + Localization.DeselectAll + '"><i class="icon icon-select-none"></i></a>',
                    '<a class="btn action-invert" data-role="tooltip" data-tooltip-position="right" data-tooltip-text="' + Localization.InvertSelection + '"><i class="icon icon-select-invert"></i></a>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.EnumeratedListPopupCallback = function (e) {
        var container = e.sender.element;

        // search box
        var searchInput = container.find('.input-search');
        searchInput.off('keyup').on('keyup', jQuery.proxy(self.SearchEnumeratedListPopup, self, searchInput));

        // dropdown format
        self.CreateEnumeratedDropdownFormat(container);

        // grid
        var gridOptions = self.GetEnumeratedListGridPopupOptions();
        self.$GridPopup = self.CreateEnumeratedListGrid(container, gridOptions);
        self.UpdateEnumeratedGridValues(self.$GridPopup, self.Data.arguments());
        self.$GridPopup.content
            .off('click', 'input[type="checkbox"]')
            .on('click', 'input[type="checkbox"]', jQuery.proxy(self.SetEnumeratedPopupValue, self));

        // buttons
        container.find('.action-select-all').off('click').on('click', jQuery.proxy(self.BatchSetEnumeratedPopupValues, self, true));
        container.find('.action-clear-all').off('click').on('click', jQuery.proxy(self.BatchSetEnumeratedPopupValues, self, false));
        container.find('.action-invert').off('click').on('click', jQuery.proxy(self.BatchSetEnumeratedPopupValues, self, null));
    };
    self.EnumeratedListPopupResize = function (e) {
        var gridElement = e.sender.element.find('.k-grid');
        gridElement.height(e.sender.element.height() - 50);
        kendo.resize(gridElement);
    };
    self.GetEnumeratedListGridPopupOptions = function () {
        var options = self.GetEnumeratedListGridOptions();
        options.selectable = false;
        options.columns[0].headerTemplate = Localization.Value;
        options.columns[0].headerAttributes.class = 'gridHeaderContainer actionable';
        options.columns[0].template = self.GetEnumeratedElementPopupTemplate;
        return options;
    };
    self.GetEnumeratedElementPopupTemplate = function (data) {
        var name = self.GetElementName(data, self.EnumeratedPopupFormat);
        return self.GetEnumeratedElementTemplate(data, name);
    };
    self.CreateEnumeratedDropdownFormat = function (container) {
        self.EnumeratedPopupFormat = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.ENUM).format;
        WC.HtmlHelper.DropdownList(container.find('input.input-format'), userSettingModel.Enums(), {
            dataTextField: 'name',
            dataValueField: 'id',
            value: self.EnumeratedPopupFormat,
            change: jQuery.proxy(self.EnumeratedDropdownFormatChange, self, container.find('.input-search'))
        });
    };
    self.EnumeratedDropdownFormatChange = function (searchInput, e) {
        self.EnumeratedPopupFormat = e.sender.value();
        self.SearchEnumeratedListPopup(searchInput);
    };
    self.SearchEnumeratedListPopup = function (searchInput) {
        self.$GridPopup.dataSource.filter(self.GetSearchEnumeratedListOptions(searchInput.val()));
    };
    self.GetSearchEnumeratedListOptions = function (fitler) {
        return {
            operator: function (data, value) {
                var text = self.GetElementName(data, self.EnumeratedPopupFormat).toLowerCase();
                return text.indexOf(value.toLowerCase()) !== -1;
            },
            value: jQuery.trim(fitler)
        };
    };
    self.SetEnumeratedPopupValue = function (e) {
        var index = jQuery(e.currentTarget).data('index');
        self.$GridPopup.dataSource.get(index).checked = e.currentTarget.checked;
        self.SetEnumeratedValue(e);
        self.$Grid.refresh();
    };
    self.BatchSetEnumeratedPopupValues = function (state, e) {
        // set active button
        var button = jQuery(e.currentTarget);
        button.siblings().removeClass('active');
        button.addClass('active');

        // update ui
        self.BatchSetEnumeratedPopupDatasource(state);
        self.$GridPopup.refresh();
        self.$Grid.refresh();

        // update to model
        self.UpdateEnumeratedArgumentValues();
    };
    self.BatchSetEnumeratedPopupDatasource = function (state) {
        // check filtering
        var filter = self.GetEnumeratedPopupFilterInfo();

        // use view then set a new page size
        if (filter.source === 'view')
            self.$GridPopup.dataSource.pageSize(self.$GridPopup.dataSource.total());

        // update states
        // - true = select all
        // - false = deselect all
        // - null = invert
        jQuery.each(self.$GridPopup.dataSource[filter.source](), function (index, data) {
            data.checked = state === null ? !data.checked : state;

            // update to main grid
            self.$Grid.dataSource.data()[data.index].checked = data.checked;
        });
        
        // set page size back to the default
        self.$GridPopup.dataSource.pageSize(filter.pageSize);
    };
    self.GetEnumeratedPopupFilterInfo = function () {
        var filter = self.$GridPopup.dataSource.filter();
        var value = filter ? filter.filters[0].value : '';
        return {
            pageSize: self.$GridPopup.dataSource.pageSize(),
            source: value ? 'view' : 'data'
        };
    };

    // compare field
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.ENUM;
    };

    // constructor
    self.Initial(handler, queryStep, element);
}
FilterEnumeratedEditor.extend(BaseFilterEditor);