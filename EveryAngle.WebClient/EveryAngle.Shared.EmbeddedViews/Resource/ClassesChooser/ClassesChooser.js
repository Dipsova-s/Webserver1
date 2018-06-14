(function (window) {
    "use strict";

    function classesChooser(name, element, settings) {

        this.Name = this.Id + name;
        this.Element = jQuery(element);
        this.ClassesChooserSettings = settings;
        this.ShowHelpBehavior = this.HELPBEHAVIOR.ALWAYS;
        this.SelectingClasses = [];
        this.DataBpAngle = {};
        this.DataClasses = {};
        this.BlackListClassIds = ['AnglesView', 'DisplaysView'];

        // globalize model
        window[this.Name] = this;
    };

    // register class
    window.ClassesChooser = classesChooser;

    // private scope
    var _self = {};
    _self.RequestClassesUrl = '';
    _self.RequestBpAngle = '';
    _self.RequestOtherBpAngle = '';
    _self.CheckboxPrefix = 'objectId';
    _self.OtherBP = 'Other';

    _self.GetTemplate = function () {
        return [
            '<div class="CreateNewAngleContainer">',
                '<div id="CreateAngleByObjectBusinessProcess" class="CreateNewAngleRow businessProcessContainer clearfix"></div>',
                '<div id="Angle" class="CreateNewAngleRow searchObjectGridContainer">',
                    '<div class="searchBoxWrapper" id="createNewAngleFilterContainer">',
                        '<input id="txtFitlerObjects" type="text" placeholder="' + Localization.ClassChooserSearchPlaceholder + '" />',
                        '<a id="btnFitlerObjects"></a>',
                    '</div>',
                    '<div class="classTotalsWrapper"><span id="classTotals">0</span> ' + Localization.Items + '</div>',
                    '<div id="ObjectsGridContainer">',
                        '<div id="ObjectsGrid"></div>',
                    '</div>',
                    '<div class="skipTemplate">',
                        '<label class="skipTemplateCheckbox">',
                            '<input type="checkbox" id="SkipTemplate"/>',
                            '<span class="label">' + Localization.ClassChooser_StartWithBlankAngle + '</span>',
                        '</label>',
                    '</div>',
                    '<div class="Description"></div>',
                '</div>',
            '</div>'
        ].join('');
    };
    _self.GetGridColumns = function (name) {
        return [
            {
                field: 'checked',
                width: 35,
                headerTemplate: '<span class="sort"></span>',
                headerAttributes: {
                    'class': 'gridHeaderContainer actionable',
                    'onclick': 'window[\'' + name + '\'].SortColumn(this)'
                },
                template: '<label class="gridCheckbox">'
                    + '<input type="checkbox" id="' + _self.CheckboxPrefix + '#= id #" #=checked?\'checked\':\'\'# onclick="window[\'' + name + '\'].SetSelectedClasses(\'#= uid #\');" />'
                    + '<span class="label"></span>'
                    + '</label>'
            },
            {
                field: 'short_name',
                width: 110,
                headerAttributes: {
                    'class': 'gridHeaderContainer actionable asc',
                    'onclick': 'window[\'' + name + '\'].SortColumn(this)'
                },
                headerTemplate: '<span class="sort"></span>' + Localization.CreateNewAngleGridClassesHeader
            },
            {
                field: 'long_name',
                headerAttributes: {
                    'class': 'gridHeaderContainer actionable',
                    'onclick': 'window[\'' + name + '\'].SortColumn(this)'
                },
                headerTemplate: '<span class="sort"></span>' + Localization.CreateNewAngleGridClassesHeaderLongName
            }
        ];
    };
    _self.CreateHtmlLayout = function (container, showSkipTemplate) {
        if (container.hasClass('km-scroll-wrapper')) {
            container.find('.km-scroll-container').html(_self.GetTemplate());
        }
        else {
            container.html(_self.GetTemplate());
        }

        if (!showSkipTemplate) {
            container.find('.skipTemplate').remove();
        }
    };
    _self.InitialFilterElements = function (self) {
        var textboxFilter = jQuery('#txtFitlerObjects');
        textboxFilter
            .off('keyup')
            .on('keyup', function () {
                self.FilterClasses();
            });

        if (!Modernizr.input.placeholder && jQuery.fn.placeholder) {
            textboxFilter.placeholder();
            if (!self.ClassesChooserSettings.createby_object.q) {
                setTimeout(function () {
                    textboxFilter.val('').focus().blur();
                }, 100);
            }
        }

        jQuery('#btnFitlerObjects')
            .off('click')
            .on('click', function () {
                self.CheckAndFilterClasses(jQuery(this));
            });
    };
    _self.InitialBusinessProcess = function (businessProcessHandler) {
        var businessProcess = ko.toJS(businessProcessHandler.Data());

        var other = businessProcess.findObject('id', _self.OtherBP);
        if (!other) {
            businessProcess.push({
                id: _self.OtherBP,
                name: Localization.OtherBusinessProcess,
                abbreviation: Localization.OtherBusinessProcess,
                order: 100,
                enable: true,
                is_allowed: true
            });
        }

        // add activeto 'Other' if nothing
        var haveActiveBusinessProcess = false;
        jQuery.each(businessProcessHandler.CurrentActive(), function (key, value) {
            if (value) {
                haveActiveBusinessProcess = true;
                return false;
            }
        });
        if (!haveActiveBusinessProcess)
            businessProcessHandler.CurrentActive({ Other: true });

        businessProcessHandler.CanEmpty(false);
        businessProcessHandler.Data(businessProcess);
        businessProcessHandler.ApplyHandler('#CreateAngleByObjectBusinessProcess');
    };
    _self.InitialObjectGrid = function (self) {
        var gridElement = jQuery('#ObjectsGrid');
        var grid = gridElement.kendoGrid(self.GetGridOptions()).data('kendoGrid');

        grid.content.on('click', 'tr', function (e) {
            self.OnClickGridRow(grid, jQuery(e.currentTarget), jQuery(e.target), self.ShowHelpBehavior);
        });

        grid.content.on('dblclick', 'tr', function (e) {
            self.OnDblClickGridRow(grid, jQuery(e.currentTarget));
        });

        return grid;
    };
    _self.UpdatePopupLayout = function (element) {
        var popupObject;
        if (element.hasClass('k-window-content')) {
            popupObject = element.data('kendoWindow');
        }
        else {
            popupObject = element.parents('.k-window-content').data('kendoWindow');
        }
        if (popupObject) {
            popupObject.trigger('resize');
        }
    };

    // public scope
    var proto = classesChooser.prototype;

    // public variable
    proto.HELPBEHAVIOR = {
        ALWAYS: 'always',
        TOGGLE: 'toggle'
    };
    proto.Id = 'ClassesChooser';
    proto.Name = '';
    proto.Element = null;
    proto.ClassesChooserSettings = null;
    proto.ClassesChooserSettingsName = 'classeschooser_settings';
    proto.DefaultLanguage = 'en';
    proto.BusinessProcessHandler = null;
    proto.MaxPageSize = 100;
    proto.MultipleSelection = true;
    proto.CurrentModelData = null;
    proto.ClassTarget = 'current_instance';
    proto.SelectingClasses = [];
    proto.MustCheckActiveLanguage = true;
    proto.HasSkipTemplateOption = false;
    proto.DataBpAngle = {};
    proto.DataClasses = {};

    // overridable method
    proto.AbortAll = jQuery.noop;
    proto.AbortAllRequest = jQuery.noop;
    proto.OnException = jQuery.noop;
    proto.ShowHelpText = jQuery.noop;
    proto.SetDisableUI = jQuery.noop;
    proto.SetSelectedClassesCallback = jQuery.noop;
    proto.LoadAngleRelateBusinessProcesses = jQuery.noop;
    proto.LoadAllClasses = jQuery.noop;
    proto.OnSubmitClasses = jQuery.noop;

    // public method
    proto.ApplyHandler = function () {
        var self = this;
        _self.CreateHtmlLayout(self.Element, self.HasSkipTemplateOption);

        // events
        _self.InitialFilterElements(self);

        // bp
        _self.InitialBusinessProcess(self.BusinessProcessHandler);

        // grid
        _self.InitialObjectGrid(self);

        // update layout
        _self.UpdatePopupLayout(self.Element);

        return self.Element;
    };
    proto.GetGridOptions = function () {
        var self = this;
        return {
            columns: _self.GetGridColumns(self.Name),
            height: '100%',
            resizable: true,
            pageable: false,
            columnResize: function (e) {
                e.sender.resize(true);
            }
        };
    };
    proto.OnClickGridRow = function (grid, row, clickTarget, showHelpType) {
        var self = this;
        var isSelected = row.hasClass('k-state-selected');
        var checkbox = row.find('input:checkbox');

        if (!clickTarget.is('input') && !clickTarget.is('span')) {
            checkbox.trigger('click');
            return;
        }

        grid.content.find('tr').filter(function () {
            return !jQuery(this).find('input:checked').length;
        }).removeClass('k-state-selected');

        if (!isSelected) {
            row.addClass('k-state-selected');
        }

        if (showHelpType === self.HELPBEHAVIOR.ALWAYS || checkbox.prop('checked')) {
            var classId = self.GetClassIdFromCheckboxId(checkbox.attr('id'));
            self.ShowHelpText(classId);
        }
        else {
            self.ShowHelpText(null);
        }
    };
    proto.OnDblClickGridRow = function (grid, row) {
        var self = this;
        self.AbortAllRequest();

        grid.content.find('input:checkbox').removeAttr('checked');

        var selectingClass = row.find('input:checkbox').prop('checked', true);
        self.SelectingClasses = [self.GetClassIdFromCheckboxId(selectingClass.attr('id'))];

        var classes = self.GetAllSelectedClasses();
        self.SetSelectedClassesCallback(classes);
        self.OnSubmitClasses(classes);
    };
    proto.BindingObjectGrid = function () {
        var self = this;
        var classUri = _self.RequestClassesUrl;

        return self.BaseLoadAllClasses(classUri)
            .done(function (data) {
                self.DataClasses[classUri] = self.GetGridData(data);

                var grid = jQuery('#ObjectsGrid').data('kendoGrid');
                if (grid) {
                    self.ApplyDataSource(grid, self.DataClasses[classUri].classes);
                }
            });
    };
    proto.BaseLoadAllClasses = function (classUri) {
        var self = this;
        return jQuery.when(self.DataClasses[classUri] ? self.DataClasses[classUri] : self.LoadAllClasses(classUri));
    };
    proto.GetGridData = function (data) {
        var dataClasses = ko.toJS(data);
        dataClasses.classes.sortObject('name', -1, false);

        jQuery.each(dataClasses.classes, function (index, dataClass) {
            dataClass.checked = false;
        });
        return dataClasses;
    };
    proto.GetGridDataSource = function (grid, dataClasses) {
        var self = this;

        // initial filters
        var data = {
            data: dataClasses,
            limit: self.MaxPageSize,
            filter: []
        };

        var q = self.GetSearchQuery().toLowerCase();
        var bp = self.BusinessProcessHandler.GetActive();

        // prepare filter variables
        var bpData = self.GetCacheDataBpAngle(_self.RequestBpAngle);
        var otherData = null;

        // when user select only 'Other'
        if (bp && bp.length === 1 && bp[0] === _self.OtherBP) {
            // add all bp to other data, that's mean it will hide all bp and display only other data
            otherData = bpData;
            bpData = null;
        }
        // when user select BP more than 1 with 'Other'
        else if (self.HasOtherBusinessProcess(bp)) {
            otherData = self.GetCacheDataBpAngle(_self.RequestOtherBpAngle);
        }

        // exclude classes by blacklist class ids
        data.filter.push({
            logic: 'and',
            filters: self.GetBlackListFiltersDataSource(self.BlackListClassIds)
        });

        // filters by BP
        data.filter.push({
            logic: 'or',
            filters: self.GetFiltersByBusinessProcesses(bpData, otherData)
        });

        // q filters
        if (q) {
            data.filter.push({
                logic: 'or',
                filters: proto.GetFiltersByQuery(q)
            });
        }

        // sorting
        var sortColumn = grid.thead.find('.asc,.desc');
        if (sortColumn.length) {
            data.sort = { field: sortColumn.data('field'), dir: sortColumn.hasClass('asc') ? 'asc' : 'desc' };
        }

        return data;
    };
    proto.GetBlackListFiltersDataSource = function (blackListClassIds) {
        var blackListfilters = jQuery.map(blackListClassIds, function (blackListClassId) {
            return { field: 'id', operator: 'neq', value: blackListClassId };
        });
        return blackListfilters;
    };
    proto.ApplyDataSource = function (grid, dataClasses) {
        var self = this;

        var dataSource = self.GetGridDataSource(grid, dataClasses);

        // set sort css class
        if (dataSource.sort) {
            self.SetSortColumnHtml(grid, dataSource.sort.field, dataSource.sort.dir);
        }

        // set data source
        grid.setDataSource(new kendo.data.DataSource(dataSource));

        // set result
        self.SetGridResult(grid.dataSource.total());
        self.ShowHelpText(null);
    };
    proto.GetFiltersByBusinessProcesses = function (bpData, otherData) {
        var filters = [];

        // common bp
        if(bpData) {
            if (bpData.length) {
                jQuery.each(bpData, function (index, classes) {
                    filters.push({ field: 'id', operator: 'eq', value: classes.toLowerCase() });
                });
            }
            else {
                filters.push({ field: 'id', operator: 'eq', value: 'you_have_never_found_this' });
            }
        }

        // other bp
        if (otherData) {
            if (otherData.length) {
                var otherFilter = {
                    logic: 'and',
                    filters: []
                };
                jQuery.each(otherData, function (index, classes) {
                    otherFilter.filters.push({ field: 'id', operator: 'neq', value: classes.toLowerCase() });
                });
                filters.push(otherFilter);
            }
            else {
                filters.push({ field: 'id', operator: 'neq', value: 'you_always_find_this' });
            }
        }

        return filters;
    };
    proto.GetFiltersByQuery = function (q) {
        return [
            { field: 'id', operator: 'contains', value: q },
            { field: 'short_name', operator: 'contains', value: q },
            { field: 'long_name', operator: 'contains', value: q }
        ];
    };
    proto.SetGridResult = function (total) {
        jQuery('#classTotals').text(total);

        var container = jQuery('#ObjectsGridContainer');
        container.children('.grid-no-data').remove();
        if (!total) {
            jQuery('<div class="grid-no-data">' + Localization.NoSearchResult + '</div>').appendTo(container);
        }
    };
    proto.SortColumn = function (element) {
        var self = this;
        element = jQuery(element);

        var gridElement = jQuery('#ObjectsGrid');
        var grid = gridElement.data('kendoGrid');
        var field = element.data('field');
        var sortDirection = self.GetSortDirection(element, field);

        self.SetSortColumnHtml(grid, field, sortDirection);

        grid.dataSource.sort({ field: field, dir: sortDirection });

        self.ShowHelpText(null);

        return true;
    };
    proto.SetSortColumnHtml = function (grid, field, direction) {
        var allColumns = grid.thead.find('.k-header').removeClass('asc desc');
        var sortColumn = allColumns.filter('[data-field="' + field + '"]');
        return sortColumn.addClass(direction);
    };
    proto.GetSortDirection = function (element, field) {
        var sortDirection = element.hasClass('asc') ? 'desc' : 'asc';
        if (field === 'checked' && !element.hasClass('asc') && !element.hasClass('desc')) {
            sortDirection = 'desc';
        }
        return sortDirection;
    };
    proto.GetAllSelectedClasses = function () {
        var self = this;
        return self.SelectingClasses.slice();
    };
    proto.GetAllSelectedClassesName = function () {
        var self = this;
        var classesName = [];
        jQuery.each(self.SelectingClasses, function (index, classId) {
            var row = self.GetTableRowByClassId(classId);
            if (row.length) {
                classesName.push(row.find('td:eq(1)').text());
            }
            else {
                classesName.push(classId);
            }
        });
        return classesName;
    };
    proto.SetSelectedClasses = function (uid) {
        var self = this;
        var gridElement = jQuery('#ObjectsGrid');
        var grid = gridElement.data('kendoGrid');
        var data = grid.dataSource.getByUid(uid);
        if (data) {
            data.checked = !data.checked;

            if (data.checked && !self.MultipleSelection) {
                self.SetSelectSingleObject(grid.dataSource.data(), grid.tbody, data);
            }
            else if (data.checked) {
                self.SelectingClasses.push(data.id);
            }
            else {
                self.SetUnselectObject(data.id);
            }
        }

        self.SetSelectedClassesCallback(self.GetAllSelectedClasses());
    };
    proto.SetSelectSingleObject = function (items, gridElement, data) {
        var self = this;

        // unselect all checkboxes except current
        gridElement.find('tr:not([data-uid="' + data.uid + '"]) :checkbox').prop('checked', false);

        // unselect all data except current
        jQuery.each(items, function (index, item) {
            if (item.uid !== data.uid) {
                item.checked = false;
            }
        });

        self.SelectingClasses = [data.id];
    };
    proto.SetUnselectObject = function (classId) {
        var self = this;
        var selectingClassIndex = jQuery.inArray(classId, self.SelectingClasses);
        if (selectingClassIndex !== -1) {
            self.SelectingClasses.splice(selectingClassIndex, 1);
        }
    };
    proto.FilterClasses = function () {
        var self = this;

        var modelData = self.CurrentModelData;

        // check avtive languages
        if (!self.CheckActiveLanguage(modelData.active_languages)) {
            setTimeout(function () {
                self.OnException('alert', Localization.Info_Title, Localization.ErrorLanguageNotInModel);
            }, 1000);

            self.FilterClasses();
            return false;
        }

        // clear selections
        self.SelectingClasses = [];

        var bps = self.BusinessProcessHandler.GetActive();
        var angleBpUri = '/items';

        // common params
        var angleBpParams = self.GetAngleParams(modelData.id, bps, self.MaxPageSize);

        // other params
        var otherAngle = self.GetAngleParams(modelData.id, [], self.MaxPageSize);

        // remember query
        self.SaveSearchQuery(self.GetSearchQuery(), bps, modelData.uri);

        // keep url
        _self.RequestClassesUrl = modelData[self.ClassTarget] + '/classes';
        _self.RequestBpAngle = angleBpUri + '?' + jQuery.param(angleBpParams);
        _self.RequestOtherBpAngle = angleBpUri + '?' + jQuery.param(otherAngle);

        // abort all requests
        self.AbortAll();

        var gridElement = jQuery('#ObjectsGrid');
        gridElement.busyIndicator(true);

        // load all
        return jQuery.when(self.HasOtherBusinessProcessData(bps, _self.RequestOtherBpAngle) ? null : self.LoadAngleRelateBusinessProcesses(angleBpUri, otherAngle))
            .then(function (data) {
                // set cache Other bp
                self.SetCacheAngleData(data, _self.RequestOtherBpAngle);

                // load by BPs
                return jQuery.when(self.HasCommonBusinessProcessData(bps, _self.RequestBpAngle) ? null : self.LoadAngleRelateBusinessProcesses(angleBpUri, angleBpParams));
            })
            .done(function (data) {
                // set cache BPs
                self.SetCacheAngleData(data, _self.RequestBpAngle);

                // create grid
                self.BindingObjectGrid();
            })
           .always(function () {
               self.SetDisableUI(false);
               gridElement.busyIndicator(false);
           });
    };
    proto.CheckAndFilterClasses = function (element) {
        var self = this;

        if (element.hasClass('disabled')) {
            return false;
        }
        else {
            self.FilterClasses();
            return true;
        }
    };
    proto.CheckActiveLanguage = function (activeLanguages) {
        var self = this;
        if (self.MustCheckActiveLanguage && self.DefaultLanguage !== 'en' && jQuery.inArray(self.DefaultLanguage, activeLanguages) === -1) {
            self.MustCheckActiveLanguage = false;
            return false;
        }
        else {
            return true;
        }
    };
    proto.GetAngleParams = function (modelId, bps, maxPageSize) {
        var angleBpParams = {};
        angleBpParams['ids'] = 'EA_CLASS_TPL*';
        angleBpParams['caching'] = false;
        angleBpParams['offset'] = 0;
        angleBpParams['limit'] = maxPageSize;
        angleBpParams['viewmode'] = 'basic';
        angleBpParams['fq'] = 'facetcat_itemtype:(facet_angle facet_template) AND facetcat_models:(' + modelId + ')';

        // remove "Other"
        var tempBPs = bps.slice();
        var indexOtherBP = jQuery.inArray(_self.OtherBP, tempBPs);
        if (indexOtherBP !== -1)
            tempBPs.splice(indexOtherBP, 1);

        // create bp query
        if (tempBPs.length)
            angleBpParams['fq'] += ' AND facetcat_bp:(' + tempBPs.join(' ') + ')';

        return angleBpParams;
    };
    proto.GetSearchQuery = function () {
        return jQuery.trim(jQuery('#txtFitlerObjects').val() || '');
    };
    proto.SaveSearchQuery = function (q, bp, modelUri) {
        var self = this;

        self.ClassesChooserSettings.createby_object.q = q;
        self.ClassesChooserSettings.createby_object.bp = bp;
        self.ClassesChooserSettings.model = modelUri;
        jQuery.localStorage(self.ClassesChooserSettingsName, self.ClassesChooserSettings);
    };
    proto.SetCacheAngleData = function (data, cacheKey) {
        var self = this;

        if (data && data.items) {
            self.DataBpAngle[cacheKey] = [];
            jQuery.each(data.items, function (index, angle) {
                var classId = angle.id.replace('EA_CLASS_TPL_', '');
                if (jQuery.inArray(classId, self.DataBpAngle[cacheKey]) === -1) {
                    self.DataBpAngle[cacheKey].push(classId);
                }
            });
        }
    };
    proto.GetCacheDataBpAngle = function (cacheKey) {
        var self = this;
        return self.DataBpAngle[cacheKey] ? self.DataBpAngle[cacheKey] : [];
    };
    proto.HasOtherBusinessProcess = function (bps) {
        return jQuery.inArray(_self.OtherBP, bps) !== -1;
    };
    proto.HasOnlyOtherBusinessProcess = function (bps) {
        return bps.length === 1 && bps[0] === _self.OtherBP;
    };
    proto.HasOtherBusinessProcessData = function (bps, cacheKey) {
        var self = this;
        return !self.HasOtherBusinessProcess(bps) || self.DataBpAngle[cacheKey];
    };
    proto.HasCommonBusinessProcessData = function (bps, cacheKey) {
        var self = this;
        return self.HasOnlyOtherBusinessProcess(bps) || self.DataBpAngle[cacheKey];
    };
    proto.GetClassIdFromCheckboxId = function (checkboxId) {
        return checkboxId.substr(_self.CheckboxPrefix.length);
    };
    proto.GetCheckboxElement = function (classId) {
        return jQuery('#' + _self.CheckboxPrefix + classId);
    };
    proto.GetTableRowByClassId = function (classId) {
        var self = this;
        return self.GetCheckboxElement(classId).parents('tr:first');
    };

})(window);
