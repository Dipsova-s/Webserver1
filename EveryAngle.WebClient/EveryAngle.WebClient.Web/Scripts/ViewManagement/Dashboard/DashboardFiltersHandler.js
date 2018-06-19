window.DashboardFiltersHandler = function () {
    "use strict";

    // private variables
    var _self = {};
    _self.Element = null;
    _self.Model = null;
    _self.DefaultCollapsedState = false;

    // public variables
    var self = this;
    self.Identity = 'DashboardFiltersHandler';
    self.IsActive = ko.observable(false);
    self.IsOpen = ko.observable(true);
    self.IsOpen.subscribe(function () {
        self.AfterTogglePanel();
    });
    self.HasChanged = ko.observable(false);
    self.FilterNodes = [];

    // external functions
    self.AfterTogglePanel = jQuery.noop;
    self.ShowFilterDetailsPopup = jQuery.noop;

    // public funcions
    self.ApplyHandler = function (element) {
        _self.Element = element;

        var currentBinding = ko.dataFor(_self.Element.get(0));
        if (!currentBinding || currentBinding.Identity !== self.Identity) {
            _self.Element.html(_self.GetView());
            ko.applyBindings(self, _self.Element.get(0));
        }
    };
    self.SetDashboardModel = function (model) {
        // set DashboardModel
        _self.Model = model;

        // list of filters will get from _self.Model
        var filters = _self.Model.GetDashboardFilters(WidgetFilterModel);
        _self.SetDashboardFilters(filters);
    };
    self.TogglePanel = function () {
        var isOpen = self.IsOpen();
        self.IsOpen(!isOpen);
    };
    self.ToggleFilterHeader = function (filterNode) {
        var isCollapsed = filterNode.collapsed();
        filterNode.collapsed(!isCollapsed);
    };

    self.GetFiltersCount = function () {
        return _self.Model.GetDashboardFilters().length;
    };
    self.GetModelUri = function () {
        return _self.Model.Data().model;
    };

    self.GetFilterHeader = function (filterNode) {
        var modelUri = self.GetModelUri();
        return WC.WidgetFilterHelper.GetFilterFieldName(filterNode.field, modelUri);
    };
    self.GetFilterText = function (filter) {
        var modelUri = self.GetModelUri();
        var filterQueryStep = ko.toJS(filter);
        filterQueryStep.step_type = enumHandlers.FILTERTYPE.FILTER;
        return WC.WidgetFilterHelper.GetFilterText(filterQueryStep, modelUri, true);
    };

    self.ShowEditFilterPopup = function (filter, fieldId) {
        // open quick filter popup
        var modelUri = self.GetModelUri();

        // create WidgetFilterModel from dashboard filter
        var filterObject = ko.toJS(filter);
        filterObject.field = fieldId;
        filterObject.step_type = enumHandlers.FILTERTYPE.FILTER;
        var filterViewModel = new WidgetFilterModel(filterObject);

        quickFilterHandler.ShowAddDashboardFilterPopup(filterViewModel, modelUri, function (updateFilter) {
            self.ApplyFilter(filter, updateFilter);
            quickFilterHandler.CloseAddFilterPopup();
        });
    };
    self.ApplyFilter = function (filter, updateFilter) {
        // change flag after clicked OK button on quick filter popup
        self.HasChanged(true);

        // update to filter
        filter.operator(updateFilter.operator);
        filter.arguments(updateFilter.arguments);
    };
    self.ApplyFilters = function () {
        // check change state
        if (!self.HasChanged())
            return;

        var filters = _self.GetDashboardFilters();

        // check validation before apply
        var checkValidArgument = validationHandler.CheckValidExecutionParameters(filters, _self.Model.Data().model);
        if (!checkValidArgument.IsAllValidArgument) {
            popup.Alert(Localization.Warning_Title, checkValidArgument.InvalidMessage);
            return;
        }

        // update to filters to DashboardModel
        _self.Model.SetDashboardFilters(filters);

        self.HasChanged(false);
        dashboardHandler.ReloadAllWidgets();
    };

    // private functions
    _self.GetView = function () {
        return [
            '<div class="dashboardFilterListWrapper">',
                '<header class="dashboardFilterHeader">',
                    '<div class="dashboardFilterToolButtons">',
                        '<a class="btnOpenFilters" data-bind="click: $root.ShowFilterDetailsPopup"></a>',
                    '</div>',
                    '<h2 class="dashboardFilterTitle">Filters (<span class="dashboardFilterCount" data-bind="text: GetFiltersCount()">0</span>)</h2>',
                '</header>',
                '<ul class="dashboardFilterItems" data-bind="foreach: { data: FilterNodes, as: \'filterNode\' }">',
                    '<li data-bind="css: { collapsed: filterNode.collapsed, expanded: !filterNode.collapsed() }">',
                        '<div class="dashboardFilterItemHeader">',
                            '<div class="dashboardFilterToolButtons">',
                                '<a class="btnToggleFilter" data-bind="click: $root.ToggleFilterHeader.bind($root, filterNode)"></a>',
                            '</div>',
                            '<div class="dashboardFilterHeaderTitle textEllipsis" data-bind="text: $root.GetFilterHeader(filterNode)"></div>',
                        '</div>',
                        '<ul class="dashboardFilterItemList" data-bind="foreach: { data: filterNode.filters, as: \'filter\' }">',
                            '<li>',
                                '<div class="dashboardFilterItemHeader">',
                                    '<div class="dashboardFilterToolButtons">',
                                        '<a class="btnEditFilter" data-bind="click: $root.ShowEditFilterPopup.bind($root, filter, filterNode.field)"></a>',
                                    '</div>',
                                    '<div class="dashboardFilterHeaderTitle textEllipsis" data-bind="text: $root.GetFilterText(filter)"></div>',
                                '</div>',
                            '</li>',
                        '</ul>',
                    '</li>',
                '</ul>',
                '<footer class="dashboardFilterFooter">',
                    '<a class="btn btnPrimary btnSmall" data-bind="click: $root.ApplyFilters, css: { disabled: !HasChanged() }"><span>' + Localization.Apply + '</span></a>',
                '</footer>',
            '</div>',
            '<div class="dashboardFilterToggle" data-bind="click: $root.TogglePanel"></div>'
        ].join('');
    };
    _self.GetDashboardFilters = function () {
        // convert from treeview to listview
        var filters = _self.Model.GetDashboardFilters();
        jQuery.each(self.FilterNodes, function (indexNode, filterNode) {
            jQuery.each(filterNode.filters, function (index, filter) {
                filters[filter.index].operator = filter.operator();
                filters[filter.index].arguments = filter.arguments();
            });
        });
        return filters;
    };
    _self.SetDashboardFilters = function (filters) {
        // change from list to treeview, e.g.
        // [
        //    {
        //        field: '<FIELD>',
        //        filters: [
        //            { index: <INDEX>, operator: '<OPERATOR>', arguments: <ARGUMENTS> }
        //        ]
        //    }
        // ]
        self.FilterNodes = [];
        jQuery.each(filters, function (index, filter) {
            var filterNode = self.FilterNodes.findObject('field', filter.field);
            if (!filterNode) {
                // create new if it's not exists
                filterNode = {
                    field: filter.field,
                    collapsed: ko.observable(_self.DefaultCollapsedState),
                    filters: []
                };
                self.FilterNodes.push(filterNode);
            }

            // add to filters node
            filterNode.filters.push({
                index: index,
                operator: ko.observable(filter.operator),
                arguments: ko.observableArray(filter.arguments)
            });

        });
    };
    self.GetFilterFieldsMetadata = function () {
        var filters = self.GetDashboardFilters();
        console.log(filters);
    };
};
var dashboardFiltersHandler = new DashboardFiltersHandler();