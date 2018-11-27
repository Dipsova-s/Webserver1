var fieldschooserHtmlTemplate = function () {
    return [
        '<div class="fieldChooserContainer">',
            '<div id="NewColumnFilter" class="fieldChooserFilter">',
                '<div data-bind="foreach: { data: FacetItems, as: \'facet\' }">',
                    '<!-- ko if: ($index() === 0 && $root.IsGeneralGroup(facet.id)) || !$root.IsGeneralGroup(facet.id) -->',
                    '<div data-bind="attr: { id: facet.id }, css: \'FilterTab-\' + ($root.IsGeneralGroup(facet.id) ? $root.GroupGeneral : facet.type) + \' \' + (facet.panel_opened() ? \'Expand\' : \'\'), click: $root.ToggleCategory" class="FilterTab">',
                        '<span class="FilterTitle" data-bind="text: $root.IsGeneralGroup(facet.id) ? Localization.GeneralFilters : facet.name"></span>',
                        '<span class="preferenceText" data-bind="text: facet.preference_text || Localization.SearchPageNoPerferences, attr: { title: facet.preference_text || Localization.SearchPageNoPerferences }"></span>',
                    '</div>',
                    '<!-- /ko -->',
                    '<div data-bind="attr: { id: facet.id + \'_Checkbox\' }, css: \'FilterCheckBox-\' + ($root.IsGeneralGroup(facet.id) ? $root.GroupGeneral + \' FilterCheckBox-general\' : facet.type), visible: facet.panel_opened" class="FilterCheckBox OptionalFilter">',
                        '<ul data-bind="foreach: { data: facet.filters, as: \'filter\' }, attr: { \'class\': facet.id }">',
                            '<li data-bind="css: $root.ItemCssClass(facet, $index()), attr: { title: $root.GetTitle(facet, filter)}, visible: !$root.HideFacetsFunction(facet.id, filter.id)">',
                                '<label>',
                                    '<input type="checkbox" data-bind="checked: filter.checked, disable: filter.disabled, Indeterminatable: filter.checked, attr: { id: filter.id, alt: filter.name }, click: $root.FilterFacet" />',
                                    '<span class="label" data-bind="html: $root.GetFilterText(filter)"></span>',
                                '</label>',
                            '</li>',
                        '</ul>',
                    '</div>',
                '</div>',
            '</div>',
            '<div id="NewColumnProperty" class="fieldChooserContent compactDetail">',
                '<div id="FilterProperties" class="fieldChooserProperties">',
                    '<input id="txtFitlerAvailableProperties" type="text" placeholder="' + Localization.FiledChooserFilterProperties + '" />',
                    '<a id="btnFitlerAvailableProperties" onclick="fieldsChooserModel.Filter()"></a>',
                '</div>',
                '<div class="fieldChooserTotals">',
                    '<span id="totalDisplayFieldsDatarow">0</span> <span>' + Localization.Items + '</span>',
                '</div>',
                '<div id="ViewProperty" class="fieldChooserViewType viewType viewTypeCompact">',
                    '<a id="LongProperty" onclick="fieldsChooserModel.SwitchDisplay(fieldsChooserModel.DISPLAY_TYPE.FULL)" class="typeFull" title="' + Localization.ViewDetailsMode + '"></a>',
                    '<a id="ShortProperty" onclick="fieldsChooserModel.SwitchDisplay(fieldsChooserModel.DISPLAY_TYPE.COMPACT)" class="typeCompact"  title="' + Localization.ViewCompactMode + '"></a>',
                '</div>',
                '<div id="PropertyTable" class="fieldChooserGridContainer">',
                    '<div id="DisplayPropertiesGrid"></div>',
                '</div>',
            '</div>',
        '</div>',
        '<div class="fieldChooserButtons"></div>'
    ].join('');
};

if (typeof enumHandlers === 'undefined')
    window['enumHandlers'] = {};
if (typeof enumHandlers.FRIENDLYNAMEMODE === 'undefined') {
    jQuery.extend(enumHandlers, {
        FRIENDLYNAMEMODE: {
            SHORTNAME: 'shortname',
            LONGNAME: 'longname',
            SHORTNAME_AND_LONGNAME: 'shortname_longname',
            FIELDSOURCE_AND_SHORTNAME: 'fieldsource_shortname',
            FIELDSOURCE_AND_LONGNAME: 'fieldsource_longname'
        },
        FIELDCHOOSERNAME: {
            FIELDCHOOSER: 'DisplayPropertiesGrid'
        }
    });
}
// M4-26202: Added this charttype for MC because MC don't have enumHandlers
if (typeof (enumHandlers.CHARTTYPE === 'undefined')) {
    enumHandlers.CHARTTYPE = {
        AREACHART: { Value: 3, Name: Localization.ChartAreaLabel, Code: 'area', Usage: 3 },
        BARCHART: { Value: 0, Name: Localization.ChartBarLabel, Code: 'bar', Usage: 2 },
        BUBBLECHART: { Value: 0, Name: Localization.ChartBubbleLabel, Code: 'bubble', Usage: 1 },
        COLUMNCHART: { Value: 1, Name: Localization.ChartColumnLabel, Code: 'column', Usage: 3 },
        DONUTCHART: { Value: 6, Name: Localization.ChartDonutLabel, Code: 'donut', Usage: 1 },
        LINECHART: { Value: 2, Name: Localization.ChartLineLabel, Code: 'line', Usage: 3 },
        PIECHART: { Value: 4, Name: Localization.ChartPieLabel, Code: 'pie', Usage: 1 },
        RADARCHART: { Value: 5, Name: Localization.ChartRadarLabel, Code: 'radarLine', Usage: 2 },
        SCATTERCHART: { Value: 5, Name: Localization.ChartScatterLabel, Code: 'scatter', Usage: 3 },
        GAUGE: { Value: 6, Name: Localization.ChartGaugeLabel, Code: 'gauge', Usage: 1 }
    };
}

var fieldsChooserModel = new FieldsChooserModel();
function FieldsChooserModel() {
    var self = this;
    self.PopupId = '#popupFieldChooser';
    self.GridName = enumHandlers.FIELDCHOOSERNAME.FIELDCHOOSER;
    self.ModelUri = '';
    self.DISPLAY_TYPE = {
        FULL: 1,
        COMPACT: 2
    };
    self.IsStarredId = 'input#facet_isstarred,input#isstarred,input#starred';
    self.CATEGORIES = {
        CATEGORY: 'category',
        CHARACTERISTICS: 'facetcat_characteristics',
        FIELDTYPE: 'fieldtype',
        SOURCE: 'source',
        CLASSES: 'classes'
    };
    self.ShowTechnicalInfo = false;
    self.ShowSourceField = true;
    self.UpdatingCategory = null;
    self.MaxDomainElementsForSearch = 100;
    self.ResultPerPage = 30;
    self.DefaultPagesize = 30;
    self.MaxPageSize = 1000;
    self.DisplayType = self.DISPLAY_TYPE.COMPACT;
    self.FacetsOrder = [self.CATEGORIES.CATEGORY, self.CATEGORIES.CHARACTERISTICS, self.CATEGORIES.FIELDTYPE, self.CATEGORIES.SOURCE];
    self.FacetsHidden = [self.CATEGORIES.CLASSES];
    self.GroupGeneral = [self.CATEGORIES.CATEGORY, self.CATEGORIES.CHARACTERISTICS].join('-');
    self.GroupGeneralOrder = [self.CATEGORIES.CATEGORY, self.CATEGORIES.CHARACTERISTICS];
    self.DefaultFacetFilters = [];
    self.FacetItems = ko.observableArray([]);
    self.FieldChooserType = null;
    self.SortingList = [];
    self.CurrentSort = null;
    self.SelectedItems = ko.observableArray([]);

    self.Captions = {
        FieldTypeBoolean: 'yes/no',
        FieldTypeEnum: 'set'
    };

    self.HideFacetsFunction = function () { return false; };
    self.DisabledFacetsFunction = function () { return false; };

    self.Fields = [];
    self.GetFieldsFunction = null;
    self.GetFieldsErrorFunction = jQuery.noop;
    self.SetFieldsFunction = null;

    self.FieldsSource = [];
    self.GetFieldSourceFunction = null;

    self.FieldsDomain = [];
    self.GetFieldDomainFunction = null;

    self.AllowMultipleSelection = true;
    self.CanDuplicatedField = false;
    self.ForceSetSelecting = false;
    self.GetCustomQueryUriFunction = null;
    self.BindDataGridStart = jQuery.noop;
    self.BindDataGridEnd = jQuery.noop;
    self.FilterFacetCustom = null;

    self.GetCategoryIconByFieldFunction = null;
    self.GetCategoryIconByIdFunction = null;
    self.CheckFieldIsExistsFunction = null;
    self.GetFriendlyNameFunction = null;
    self.BeforeOpenCategoryFunction = null;
    self.OnSubmit = jQuery.noop;
    self.OnGridSelectionChanged = jQuery.noop;
    self.GetHelpTextFunction = null;
    self.HelpTexts = {};
    self.PossibleToSetStar = false;
    self.BlankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    self.AjaxRequest = null;
    self.LastSearchValue = '';
    self.CheckLastSearchValue = null;
    self.IsAutoSearch = true;

    self.ShowFieldInfoFunction = null;
    self.IsAutoFocus = true;

    // start field chooser popup
    self.FieldChooserPopup = null;
    self.LayoutSettings = null;
    self.POPUP_SETTINGS_KEY = 'field_chooser_settings';
    self.OnResizePopup = jQuery.noop;
    self.OnOpenPopup = jQuery.noop;
    self.OnClosePopup = jQuery.noop;
    self.GetFieldChooserButtons = jQuery.noop;
    // end field chooser popup

    // save user settings
    self.SaveUserSettingsViewMode = jQuery.noop;
    self.ClientSettings = '{}';

    self.Initial = function () {
        ko.applyBindings(fieldsChooserModel, jQuery('#NewColumnFilter').get(0));
        jQuery('#txtFitlerAvailableProperties')
            .off('keyup')
            .on('keyup', self.FilterByWord)
            .placeholder();
    };
    self.InitialFacet = function () {
        var request = self.GetQueryFilterUri(1);
        request.data.limit = 0;
        delete request.data.q;
        delete request.data.fq;
        self.SetNoData(false);

        var viewMode = self.DISPLAY_TYPE.COMPACT;
        try {
            viewMode = JSON.parse(self.ClientSettings).field_chooser_view_mode || self.DISPLAY_TYPE.COMPACT;
        }
        catch (e) {
            // do nothing
        }

        self.DisplayType = viewMode;
        self.SwitchDisplay(viewMode);

        return self.GetFields(request.url, request.data, function (data) {
            if (!data.header.total) {
                self.SetNoData(true);
            }

            self.SetFacetFilter(data);

            // set default facet filters
            jQuery.each(data.facets, function (index, facet) {
                var defaultFacets = self.DefaultFacetFilters.findObjects('facet', facet.id);
                if (defaultFacets.length) {
                    if (facet.id === self.CATEGORIES.SOURCE) {
                        // check at (Self)
                        facet.filters()[0].checked(true);
                    }
                    else {
                        jQuery.each(facet.filters(), function (indexFilter, filter) {
                            if (defaultFacets.hasObject('filter', filter.id)) {
                                filter.checked(true);
                            }
                        });
                    }
                }
            });

            // open.close panel state
            jQuery.each(self.FacetItems(), function (index, facet) {
                if (!self.IsGeneralGroup(facet.id)) {
                    facet.panel_opened(false);
                }
            });
        });
    };

    self.GetFields = function (uri, params, callback) {
        var hideIndicator = function () {
            jQuery('.fieldChooserFilter').busyIndicator(false);
        };
        if (typeof window.GetDataFromWebService !== 'undefined') {
            return GetDataFromWebService(uri, params)
                .fail(self.GetFieldsErrorFunction)
                .done(callback)
                .always(hideIndicator);
        }
        else if (self.GetFieldsFunction !== null) {
            return self.GetFieldsFunction.call(self, uri, params, callback)
                .fail(self.GetFieldsErrorFunction)
                .done(callback)
                .always(hideIndicator);
        }
        else {
            return jQuery.when(null);
        }
    };
    self.GetFieldsById = function (id) {
        if (typeof resultModel !== 'undefined') {
            return resultModel.GetResultDisplayFieldByFieldId(id);
        }
        else {
            var displayField = jQuery.grep(self.Fields, function (field) {
                return field.id === id;
            });
            return displayField.length > 0 ? displayField[0] : null;
        }
    };

    self.GetFieldSource = function (uri) {
        if (typeof modelFieldSourceHandler !== 'undefined') {
            return modelFieldSourceHandler.LoadFieldSource(uri);
        }
        else if (self.GetFieldSourceFunction !== null) {
            return self.GetFieldSourceFunction.call(self, uri);
        }
        else {
            return null;
        }
    };
    self.GetFieldSourceByUri = function (uri) {
        if (typeof modelFieldSourceHandler !== 'undefined') {
            return modelFieldSourceHandler.GetFieldSourceByUri(uri);
        }
        else {
            var source = null;
            jQuery.each(self.FieldsSource, function (i, s) {
                if (s.uri === uri) {
                    source = s;
                    return false;
                }
            });
            return source;
        }
    };
    self.SetSourceText = function (data, currentRow) {
        var target;
        var rows = jQuery(currentRow);

        if (rows.length) {
            target = rows.find('div[name="' + data.uri + '"]');
        }
        else {
            target = jQuery('div[name="' + data.uri + '"]');
            rows = target.parents('tr');
        }

        var fieldSourceShortName = self.GetFriendlyName(data, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME),
            fieldSourceLongName = self.GetFriendlyName(data, enumHandlers.FRIENDLYNAMEMODE.LONGNAME);

        target.text(fieldSourceShortName).css('color', '');
        if (fieldSourceLongName !== fieldSourceShortName) {
            target.attr('data-tooltip-title', fieldSourceLongName);
        }
        
        self.SetHightlightText(rows.find('.FieldSource'));
    };

    self.GetFieldDomain = function (uri) {
        if (typeof modelFieldDomainHandler !== 'undefined') {
            return modelFieldDomainHandler.LoadFieldDomain(uri);
        }
        else if (self.GetFieldDomainFunction !== null) {
            return self.GetFieldDomainFunction.call(self, uri);
        }
        else {
            return null;
        }
    };
    self.LoadFieldDomain = function (uri, needUpdateHelp) {
        if (typeof needUpdateHelp === 'undefined')
            needUpdateHelp = true;

        return jQuery.when(self.GetFieldDomain(uri))
            .done(function (response) {
                var domain = self.GetFieldsDomainByUri(response.uri);
                if (!domain) {
                    self.FieldsDomain.push(response);
                }

                if (needUpdateHelp) {
                    self.SetDomainText(response);
                }
            });
    };
    self.GetFieldsDomainByUri = function (uri) {
        if (typeof modelFieldDomainHandler !== 'undefined') {
            return modelFieldDomainHandler.GetFieldDomainByUri(uri);
        }
        else {
            var result = null;
            jQuery.each(self.FieldsDomain, function (i, d) {
                if (d.uri === uri) {
                    result = d;
                    return false;
                }
            });
            return result;
        }
    };
    self.SetDomainText = function (data, currentRow) {
        var target;
        var rows = jQuery(currentRow);

        if (rows.length) {
            target = rows.find('div[name="' + data.uri + '"]');
        }
        else {
            target = jQuery('div[name="' + data.uri + '"]');
            rows = target.parents('tr');
        }

        if (data.element_count <= self.MaxDomainElementsForSearch) {
            var domains = jQuery.map(data.elements, function (element) {
                if (!element.short_name && !element.long_name)
                    return element.id;
                if (element.short_name === element.long_name)
                    return element.short_name;

                return (element.short_name || element.id) + (element.long_name ? ' (' + element.long_name + ')' : '');
            });
            if (data.may_be_sorted) {
                var direction = -1;
                domains.sort(function (a, b) {
                    if (typeof a === 'string' || typeof b === 'string') {
                        if (a === null)
                            return 1 * direction;
                        if (b === null)
                            return -1 * direction;
                    }

                    if (a.toString().toLowerCase() < b.toString().toLowerCase())
                        return 1 * direction;
                    else if (a.toString().toLowerCase() > b.toString().toLowerCase())
                        return -1 * direction;

                    else return 0;
                });
            }

            target.text(domains.join(', ')).parent().addClass('withDomain');
        }
        
        self.SetHightlightText(rows.find('.detailDomain'));
    };

    self.SetFacetFilter = function (model) {
        var facet = [], facetFixOrder = [],
            checkStatus = self.CheckStatusList(),
            disabled;
        if (model.facets && model.facets.length > 0) {
            jQuery.each(model.facets, function (k, v) {
                if (jQuery.inArray(v.id, self.FacetsHidden) === -1) {
                    v.preference_text = '';
                    v.child_checked = false;
                    v.panel_opened = ko.observable(typeof v.panel_opened === 'undefined' ? true : v.panel_opened);
                    jQuery.each(v.filters, function (k2, v2) {
                        disabled = self.DisabledFacetsFunction(v.id, v2.id);
                        v2.checked = ko.observable(disabled || (jQuery.inArray(v.id + ':' + v2.id, checkStatus.checked) !== -1 ? true : false));
                        v2.disabled = disabled;
                        v2.count = ko.observable(v2.count || 0);
                        if (v2.checked())
                            v.child_checked = true;
                        if (v2.name === '')
                            v2.name = v2.id;
                    });

                    // re-ordering except facetcat_characteristics star must on top
                    var facetItems;
                    if (v.id.toLowerCase() === self.CATEGORIES.CHARACTERISTICS) {
                        var originalItems = v.filters.slice(0);
                        var tempItems = [];
                        // add star first
                        var starredItem = originalItems.findObjects('id', 'starred');
                        if (starredItem.length !== 0) {
                            tempItems.push(starredItem[0]);
                            originalItems.removeObject('id', 'starred', true);
                        }

                        var suggestedItem = originalItems.findObjects('id', 'suggested');
                        if (suggestedItem.length) {
                            tempItems.push(suggestedItem[0]);
                            originalItems.removeObject('id', 'suggested', true);
                        }
                        //add the rest
                        jQuery.each(originalItems, function (index, element) {
                            tempItems.push(element);
                        });
                        facetItems = tempItems;
                    }
                    else {
                        facetItems = self.SortFacetFilter(v.filters.slice(0), 'name', function (data) { return data.toLowerCase(); });
                    }

                    v.filters = ko.observableArray(facetItems);

                    var orderIndex = jQuery.inArray(v.id, self.FacetsOrder);
                    if (orderIndex !== -1) {
                        facetFixOrder[orderIndex] = v;
                    }
                    else {
                        facet.push(v);
                    }
                }
            });

        }
        var index = 0;
        jQuery.each(facetFixOrder, function (k, v) {
            if (typeof v !== 'undefined') {
                facet.splice(index, 0, v);
                index++;
            }
        });
        self.FacetItems(facet);
    };
    self.UpdatePreferenceText = function () {
        setTimeout(function () {
            var data = [];
            // clear preference text
            jQuery.each(self.FacetItems(), function (k2, v2) {
                v2.preference_text = '';
                data.push(v2);
            });

            // find checked checkboxes
            jQuery('.fieldChooserFilter:visible input:checked').each(function (k, v) {
                var text = jQuery(v).attr('alt'),
                    isGeneral = jQuery(v).parents('.FilterCheckBox:first').hasClass('FilterCheckBox-' + self.GroupGeneral),
                    modelId = (isGeneral ? jQuery('.FilterTab-' + self.GroupGeneral + ':first').attr('id') : jQuery(v).parents('.FilterCheckBox:first').attr('id')).replace('_Checkbox', '');

                // set preference text
                jQuery.each(data, function (k2, v2) {
                    if (v2.id === modelId) {
                        if (data[k2].preference_text !== '')
                            data[k2].preference_text += ',';
                        data[k2].preference_text += text;
                    }
                });
            });
            self.FacetItems([]);
            self.FacetItems(data);
        }, 100);
    };
    self.CheckStatusList = function () {
        var status = {
            checked: [],
            unchecked: []
        };
        if (self.FacetItems().length > 0) {
            jQuery.each(self.FacetItems(), function (k, v) {
                jQuery.each(v.filters(), function (k2, v2) {
                    if (v2.checked())
                        status.checked.push(v.id + ':' + v2.id);
                    else if (v2.checked() === false)
                        status.unchecked.push(v.id + ':' + v2.id);
                });
            });
        }
        return status;
    };
    self.ToggleCategory = function (data) {
        if (data.panel_opened()) {
            // collapse
            self.CollapePanel(data);
        }
        else {
            var expand = function () {
                // collapse all
                self.CollapseAllPanels();

                // expand
                self.ExpandPanel(data);
            };

            if (self.BeforeOpenCategoryFunction) {
                self.BeforeOpenCategoryFunction(data.id, expand);
            }
            else {
                expand();
            }
        }
    };
    self.CollapseAllPanels = function () {
        jQuery('.fieldChooserFilter:visible .FilterTab').removeClass('Expand');
        jQuery('.fieldChooserFilter:visible .FilterCheckBox').stop().slideUp('fast');
        jQuery.each(self.FacetItems(), function (index, facet) {
            facet.panel_opened(false);
        });
    };
    self.CollapePanel = function (data) {
        var panelHeader = self.GetPanelHeader(data.id);
        var panelBody = self.GetPanelBody(data.id);

        panelHeader.removeClass('Expand');
        panelBody.stop().slideUp('fast', function () {
            data.panel_opened(false);
        });
    };
    self.ExpandPanel = function (data) {
        var isGeneralGroup = self.IsGeneralGroup(data.id);
        var panelHeader = self.GetPanelHeader(data.id);
        var panelBody = self.GetPanelBody(data.id);

        panelHeader.addClass('Expand');
        panelBody.stop().slideDown('fast', function () {
            if (isGeneralGroup) {
                jQuery.each(self.FacetItems(), function (index, facet) {
                    if (self.IsGeneralGroup(facet.id)) {
                        facet.panel_opened(true);
                    }
                });
            }
            else {
                data.panel_opened(true);
            }
        });
    };
    self.IsGeneralGroup = function (id) {
        return self.GroupGeneral.indexOf(id) !== -1;
    };
    self.GetPanelHeader = function (id) {
        return jQuery('#' + id);
    };
    self.GetPanelBody = function (id) {
        return jQuery(self.IsGeneralGroup(id) ? '.FilterCheckBox-' + self.GroupGeneral : '#' + id + '_Checkbox');
    };
    self.ItemCssClass = function () {
        return '';
    };

    self.BindDataGrid = function () {
        self.Fields = [];
        self.SelectedItems([]);
        self.BindDataGridStart.call(self);

        var currentPage = 0,
            dataSourceTmp = {},
            totalRows = 0;

        self.ResultPerPage = jQuery(self.IsStarredId).is(':checked') ? self.MaxPageSize : Math.max(self.DefaultPagesize, Math.ceil((jQuery('#NewColumnProperty').height() - 100) / 26));

        var displayFieldsDataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    currentPage = options.data.page;

                    var request = self.GetQueryFilterUri(currentPage);
                    if (self.AjaxRequest !== null && self.AjaxRequest.request.readyState !== 4) {
                        self.AjaxRequest.request.abort();
                    }

                    if (typeof dataSourceTmp[currentPage] !== 'undefined') {
                        options.success(dataSourceTmp[currentPage]);
                        return;
                    }

                    self.AjaxRequest = ({
                        url: request.url,
                        request: self.GetFields(request.url, request.data, function (result) {
                            if (self.SetFieldsFunction !== null) {
                                result = self.SetFieldsFunction.call(self, result);
                            }
                            self.SortingList = (result.sort_options || []);

                            // Merge new display field to model
                            var fields = typeof resultModel !== 'undefined' ? resultModel.Fields : self.Fields;
                            if (currentPage !== 1) {
                                jQuery.merge(fields, result.fields);
                            }
                            else {
                                fields = result.fields;
                                if (self.FacetItems().length) {
                                    jQuery.each(self.FacetItems(), function (index, currentFacetItem) {
                                        var resultfacetitem = jQuery.grep(result.facets, function (facetItem) { return facetItem.id === currentFacetItem.id; });

                                        jQuery.each(currentFacetItem.filters(), function (index, selffacetfilter) {
                                            var resultfacetfilter = resultfacetitem.length ? jQuery.grep(resultfacetitem[0].filters, function (facetfilter) { return facetfilter.id === selffacetfilter.id; }) : [];
                                            if (resultfacetfilter.length) {
                                                selffacetfilter.count(resultfacetfilter[0].count);
                                            }
                                            else {
                                                selffacetfilter.count(0);
                                            }
                                        });
                                    });

                                    self.SetFacetFilter({ facets: ko.toJS(self.FacetItems()) });
                                    self.UpdatePreferenceText();
                                }
                            }
                            self.UpdatingCategory = null;
                            self.Fields = fields;
                            if (typeof resultModel !== 'undefined')
                                resultModel.Fields = fields;

                            totalRows = result.header.total;
                            dataSourceTmp[currentPage] = result.fields;
                            jQuery('#totalDisplayFieldsDatarow').text(totalRows);

                            jQuery('#PropertyTable > .grid-no-data').remove();
                            if (totalRows === 0) {
                                jQuery('<div class="grid-no-data">' + Localization.NoSearchResult + '</div>').appendTo('#PropertyTable');
                            }

                            options.success(result.fields);
                        })
                        .fail(function (xhr, status, error) {
                            if (options.error) {
                                options.error(xhr, status, error);
                            }
                            else if (typeof requestHistoryModel !== 'undefined') {
                                var grid = jQuery('#' + self.GridName).data('kendoGrid');
                                if (grid)
                                    requestHistoryModel.SaveLastExecute(grid.dataSource, grid.dataSource.options.transport.read, [options]);
                            }
                        })
                    });
                }
            },
            error: function (e) {
                if (typeof requestHistoryModel !== 'undefined') {
                    requestHistoryModel.SaveLastExecute(e.sender, e.sender.read, []);
                }
            },
            schema: {
                total: function () {
                    return totalRows;
                }
            },
            pageSize: self.ResultPerPage,
            serverPaging: true
        });

        var requestingInfo = {
            source: [],
            domain: [],
            helptext: []
        };

        var grid = jQuery('#' + self.GridName).empty().data('submited', false).kendoGrid({
            dataSource: displayFieldsDataSource,
            autoBind: false,
            resizable: jQuery.localStorage('mouse'),
            navigatable: false,
            pageable: false,
            columns: self.GetColumnTemplate(),
            scrollable: {
                virtual: true
            },
            columnResize: function (e) {
                self.AdjustColumn(e.sender);
                e.sender.resize(true);
            },
            dataBound: function (e) {
                self.BindDataGridEnd.call(self);

                var dataView = grid.dataSource.view();
                jQuery.each(dataView, function (index, item) {
                    grid.tbody.children('[data-uid="' + item.uid + '"]').attr('id', 'field-' + self.ConvertFieldName(item.id));
                });

                if (!self.CanDuplicatedField || self.ForceSetSelecting) {
                    self.SetMarkAddedItem(dataView);
                }

                self.SetMarkSelectedItem(e.sender);

                self.AdjustDetailsColumn(e.sender);

                var gridRows = grid.tbody.find('tr');
                gridRows.removeHighlight();
                self.SetHightlightText(gridRows.find('.fieldName'));

                // load source, domain, helptext
                jQuery.each(grid.dataSource.data(), function (index, data) {
                    var currentRow = gridRows.eq(index);
                    if (data.source) {
                        var sourceField = self.GetFieldSourceByUri(data.source);
                        if (sourceField) {
                            self.SetSourceText(sourceField, currentRow);
                        }
                        else if (jQuery.inArray(data.source, requestingInfo.source) === -1) {
                            requestingInfo.source.push(data.source);
                            jQuery.when(self.GetFieldSource(data.source))
                                .done(function (response) {
                                    var source = self.GetFieldSourceByUri(response.uri);
                                    if (!source) {
                                        self.FieldsSource.push(response);
                                    }
                                    self.SetSourceText(response);
                                });
                        }
                    }

                    if (self.DisplayType === self.DISPLAY_TYPE.FULL) {
                        if (data.domain) {
                            var domainField = self.GetFieldsDomainByUri(data.domain);
                            if (domainField) {
                                self.SetDomainText(domainField, currentRow);
                            }
                            else if (jQuery.inArray(data.domain, requestingInfo.domain) === -1) {
                                requestingInfo.domain.push(data.domain);
                                self.LoadFieldDomain(data.domain);
                            }
                        }

                        if (data.helptext) {
                            if (self.HelpTexts[data.helptext]) {
                                self.SetHelpText(self.HelpTexts[data.helptext], currentRow);
                            }
                            else if (jQuery.inArray(data.helpid, requestingInfo.helptext) === -1) {
                                requestingInfo.helptext.push(data.helpid);
                            }
                        }
                    }
                });

                self.LoadHelpText(requestingInfo.helptext);
            }
        }).data('kendoGrid');

        if (grid) {
            var win = grid.wrapper.parents('.k-window-content:first').data('kendoWindow');
            if (win) {
                setTimeout(function () {
                    win.trigger('resize');
                }, 300);
            }

            grid.content.on('click', 'tr', function (e) {
                var row = jQuery(e.currentTarget),
                    dataItem, canDuplicate;

                if (row.hasClass('selected') && !self.ForceSetSelecting)
                    return;

                dataItem = grid.dataSource.getByUid(row.data('uid'));

                if (dataItem) {
                    canDuplicate = self.CanDuplicatedField || (!self.CanDuplicatedField && !self.CheckFieldIsExists(dataItem.id));
                    if (canDuplicate) {
                        var isExistObject = jQuery.grep(JSON.parse(JSON.stringify(self.SelectedItems())), function (element) {
                            return element.id === dataItem.id;
                        });

                        if (isExistObject.length > 0) {
                            self.SelectedItems.remove(function (model) {
                                return model.id === dataItem.id;
                            });
                        }
                        else {
                            if (self.AllowMultipleSelection) {
                                self.SelectedItems.push(dataItem);
                            }
                            else {
                                self.SelectedItems([dataItem]);
                            }
                        }
                    }

                    self.SetMarkSelectedItem(grid);
                    self.OnGridSelectionChanged.call(self, self.SelectedItems());
                }
            });
            grid.content.on('dblclick', 'tr', function (e) {
                var row = jQuery(e.currentTarget),
                    dataItem, canDuplicate;

                if (row.hasClass('selected') && !self.ForceSetSelecting)
                    return;

                dataItem = grid.dataSource.getByUid(row.data('uid'));
                row.addClass('k-state-selected');

                if (dataItem) {
                    canDuplicate = self.CanDuplicatedField || (!self.CanDuplicatedField && !self.CheckFieldIsExists(dataItem.id));
                    if (canDuplicate) {
                        self.SelectedItems([dataItem]);
                    }
                    self.OnGridSelectionChanged.call(self, self.SelectedItems());
                    if (!grid.element.data('submited') && self.SelectedItems().length > 0 && self.IsCurrentSelected(row.data('uid'))) {
                        grid.element.data('submited', true);
                        self.OnSubmit.call(self);
                    }
                }
            });

            displayFieldsDataSource.read();

            // make grid continue while user is scrolling
            var virtualScroll = grid.content.data('kendoVirtualScrollable');
            grid.content
                .off('mousewheel', '.k-loading-mask')
                .on('mousewheel', '.k-loading-mask', function (e) {
                    virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                });
            if (!!jQuery.browser.msie) {
                grid.content
                .off('mousewheel.iefix')
                .on('mousewheel.iefix', function (e) {
                    if (!grid.content.find('.k-loading-mask').length) {
                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                    }
                });
            }
        }
    };
    self.ConvertFieldName = function (name) {
        name = name.replace(/@/g, 'OatO');
        name = name.replace(/\-/g, 'OdashO');
        name = name.replace(/:/g, 'OcolonO');
        name = name.replace(/\//g, 'OslashO');
        return name;
    };
	self.SetNoData = function (nodata) {
		jQuery('.fieldChooserContainer').removeClass('no-data');
        jQuery('#NewColumnProperty').next('.grid-no-data').remove();

        if (nodata) {
            jQuery('.fieldChooserFilter').parent()
                .children('.grid-no-data').remove().end()
				.append('<div class="grid-no-data">' + Localization.MC_NoFieldAvailable + '</div>');
			jQuery('.fieldChooserContainer').addClass('no-data');
        }
    };
    self.AdjustColumn = function (grid) {
        if (grid) {
            // set grid column size
            var headerWrapper = grid.wrapper.find('.k-grid-header-wrap');
            if (headerWrapper.is(':hidden'))
                return;

            // set last column width
            var headerWrapperSpace = headerWrapper.width();
            var lastColumn = headerWrapper.find('th:last');
            var newWidth = Math.max(self.ShowTechnicalInfo ? 70 : 50, (headerWrapperSpace - lastColumn.position().left));
            jQuery.setGridWidth(grid, lastColumn.index(), newWidth);

            // set detail size
            self.AdjustDetailsColumn(grid);

            // save settings
            var columnsWidth = {};
            grid.thead.find('.k-header').each(function (index, th) {
                th = jQuery(th);
                var columnId = th.data('field');
                if (!columnsWidth[columnId]) {
                    columnsWidth[columnId] = {};
                }
                columnsWidth[columnId].width = th.outerWidth();
            });

            // save columns width
            if (self.DisplayType === self.DISPLAY_TYPE.FULL) {
                self.LayoutSettings.columnsDetailMode = columnsWidth;
            }
            else {
                self.LayoutSettings.columnsCompactMode = columnsWidth;
            }
            // save layout to localstorage
            self.SaveFieldChooserLayoutSettings();
        }
    };
    self.AdjustDetailsColumn = function (grid) {
        var headerWrapper = grid.wrapper.find('.k-grid-header-wrap'),
            details = grid.content.find('.detail').css('width', 'auto'),
            scroller = grid.wrapper.find('.k-virtual-scrollable-wrap'),
            scrollLeft = scroller.scrollLeft();

        scroller.scrollLeft(0);

        // set detail size
        if (details.length) {
            details.css('width', headerWrapper.find('table').width() - details.position().left - 5);
        }

        var nameColumnSize = (grid.wrapper.find('th[data-field="short_name"]').width() || 200) - 30;
        grid.content.find('.fieldName').css('max-width', nameColumnSize);

        scroller.scrollLeft(scrollLeft);
    };
    self.GetColumnTemplate = function () {
        var columnsWidth = self.DisplayType === self.DISPLAY_TYPE.FULL ? self.LayoutSettings.columnsDetailMode : self.LayoutSettings.columnsCompactMode;

        var tpl = [
            {
                field: 'id',
                width: columnsWidth.id.width,
                attributes: {
                    'class': 'column1'
                },
                template: self.GetIsStarredColumnTemplate,
                headerTemplate: self.GetHeaderTemplate('starred', '')
            },
            {
                field: 'category',
                width: columnsWidth.category.width,
                attributes: {
                    'class': 'column2'
                },
                template: self.GetCategoryColumnTemplate,
                headerTemplate: self.GetHeaderTemplate('category', '')
            },
            {
                field: 'source',
                width: columnsWidth.source.width,
                attributes: {
                    'class': 'column3 columnDetail'
                },
                template: self.GetFieldSourceColumnTemplate,
                headerTemplate: self.GetHeaderTemplate('source', Localization.Source)
            },
            {
                field: 'short_name',
                width: columnsWidth.short_name.width,
                template: self.GetPropertyColumnTemplate,
                attributes: {
                    'class': 'column4' + (!self.ShowSourceField ? ' columnDetail' : '')
                },
                headerTemplate: self.GetHeaderTemplate('name', Localization.Name)
            },
            {
                field: 'fieldtype',
                width: columnsWidth.fieldtype.width,
                attributes: {
                    'class': 'column5'
                },
                template: self.GetDetailColumnTemplate,
                headerTemplate: self.GetHeaderTemplate('fieldtype', Localization.Type)
            }
        ];
        if (!self.ShowSourceField) {
            tpl.splice(2, 1);
        }

        if (self.ShowTechnicalInfo) {
            // if user setting set technical_info to true
            tpl.push({
                field: 'technical_info',
                width: (columnsWidth.technical_info) ? columnsWidth.technical_info.width : 70,
                headerTemplate: self.GetHeaderTemplate('tech_info', Localization.TechnicalInfo),
                template: function (dataItem) {
                    return dataItem.technical_info || '';
                }
            });
        }

        return tpl;
    };
    self.GetHeaderTemplate = function (sortingId, headerText) {
        var sort = '';
        if (self.CurrentSort !== null && self.CurrentSort.sort.indexOf(sortingId) !== -1)
            sort = self.CurrentSort.dir;
        return '<a class="DisplayAvaliablePropertiesHeaderGrid ' + sort + '"  id="' + sortingId + '" onclick="fieldsChooserModel.Sort(this)"> ' + headerText + ' </a>';
    };
    self.GetIsStarredColumnTemplate = function (item) {
        var columnTemplate, replaceCssClass = self.GetIsStarredCssClass(item);

        if (self.PossibleToSetStar) {
            columnTemplate = '<div class="#Icon#" onclick="fieldsChooserModel.SetIsStarred(event, this, \'' + item.uid + '\')"></div>';
        }
        else {
            columnTemplate = '<div class="#Icon#"></div>';
            replaceCssClass += ' readOnly';
        }

        return columnTemplate.replace('#Icon#', replaceCssClass);
    };
    self.GetIsStarredCssClass = function (item) {
        var replaceCssClass;

        if (item.user_specific && !item.user_specific.is_starred)
            item.user_specific.is_starred = false;
        if (!item.is_suggested)
            item.is_suggested = false;

        if (item.user_specific && item.user_specific.is_starred)
            replaceCssClass = 'DisplayPropertiesGridSignFavorite';
        else if (item.is_suggested)
            replaceCssClass = 'DisplayPropertiesGridSignSuggest';
        else
            replaceCssClass = 'DisplayPropertiesGridSignFavoriteDisable';

        return replaceCssClass;
    };

    self.SetIsStarred = function (e, obj, uid) {
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.cancelBubble = true;

        obj = jQuery(obj);
        if (!obj.hasClass('loading')) {
            var grid = jQuery('#' + self.GridName).data('kendoGrid');
            var field = grid.dataSource.getByUid(uid);

            if (field && field.uri) {

                obj.addClass('loading');

                //PUT data
                return jQuery.when(UpdateDataToWebService(field.uri, { user_specific: { is_starred: !field.user_specific.is_starred } }))
                    .done(function (data) {
                        //Update grid
                        var starDelta = data.user_specific.is_starred ? 1 : -1;
                        if (data.user_specific.is_starred === field.user_specific.is_starred) {
                            starDelta = 0;
                        }

                        field.user_specific.is_starred = data.user_specific.is_starred;

                        // update facets
                        if (starDelta) {
                            jQuery.each(self.FacetItems(), function (index, category) {
                                if (category.id === self.CATEGORIES.CHARACTERISTICS) {
                                    jQuery.each(category.filters(), function (indexFacet, facet) {
                                        if (jQuery.inArray(facet.id, ['starred', 'facet_isstarred', 'isstarred']) !== -1) {
                                            facet.count(facet.count() + starDelta);
                                            return false;
                                        }
                                    });
                                    return false;
                                }
                            });
                        }

                        var newCssClass = self.GetIsStarredCssClass(field);
                        obj.attr('class', newCssClass);
                    })
                    .always(function () {
                        obj.removeClass('loading');
                    });
            }
        }

        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
    };
    self.GetFieldSourceColumnTemplate = function (item) {
        var columnTemplate = '<div class="FieldSource" name="#FieldSource#">#FieldSourceDetail#</div><div class="detail detailHelp truncatable" name="#HelpId#"></div><div class="detail detailDomain truncatable" name="#DomainId#"></div>';

        if (item.source) {
            columnTemplate = columnTemplate.replace('#FieldSource#', item.source);
            columnTemplate = columnTemplate.replace('#FieldSourceDetail#', '...');
        }
        else {
            columnTemplate = columnTemplate.replace('#FieldSource#', '');
            columnTemplate = columnTemplate.replace('#FieldSourceDetail#', '&nbsp;');
        }

        if (item.helpid)
            columnTemplate = columnTemplate.replace('#HelpId#', item.helpid);
        else
            columnTemplate = columnTemplate.replace('#HelpId#', '');

        if (item.domain)
            columnTemplate = columnTemplate.replace('#DomainId#', item.domain);
        else
            columnTemplate = columnTemplate.replace('#DomainId#', '');

        return columnTemplate;
    };
    self.GetPropertyColumnTemplate = function (item) {

        var columnTemplate;
        if (typeof fieldsChooserModel.ShowFieldInfoFunction === 'function') {
            columnTemplate = '<div class="fieldName" data-tooltip-title="#PropertyHoverText#">#PropertyText#<label class="longText">#LongName#</label></div><a class="btnInfo" onclick="fieldsChooserModel.ShowFieldInfo(event, \'#UID#\')"></a>';
        }
        else {
            columnTemplate = '<div class="fieldName noInfo" data-tooltip-title="#PropertyHoverText#">#PropertyText#</div>';
        }
        if (!self.ShowSourceField) {
            columnTemplate += '<div class="detail detailHelp truncatable" name="#HelpId#"></div><div class="detail detailDomain truncatable" name="#DomainId#"></div>';
        }

        columnTemplate = columnTemplate.replace('#UID#', item.uid);

        var shortName = self.GetFriendlyName(item, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME),
            longName = self.GetFriendlyName(item, enumHandlers.FRIENDLYNAMEMODE.LONGNAME);

        if (self.DisplayType === self.DISPLAY_TYPE.FULL) {
            columnTemplate = columnTemplate.replace('#PropertyText#', shortName);
            columnTemplate = columnTemplate.replace('#LongName#', ' (' + longName + ')');
            columnTemplate = columnTemplate.replace('#PropertyHoverText#', shortName + ' (' + longName + ')');
        }
        else {
            columnTemplate = columnTemplate.replace('#PropertyText#', shortName);
            columnTemplate = columnTemplate.replace('#LongName#', ' (' + longName + ')');
            columnTemplate = columnTemplate.replace('#PropertyHoverText#', shortName === longName ? '' : longName);
        }

        if (item.helpid)
            columnTemplate = columnTemplate.replace('#HelpId#', item.helpid);
        else
            columnTemplate = columnTemplate.replace('#HelpId#', '');

        if (item.domain)
            columnTemplate = columnTemplate.replace('#DomainId#', item.domain);
        else
            columnTemplate = columnTemplate.replace('#DomainId#', '');

        return columnTemplate;
    };
    self.GetFriendlyName = function (fieldObject, nameFormat) {
        if (self.GetFriendlyNameFunction !== null) {
            return self.GetFriendlyNameFunction.call(self, fieldObject, nameFormat);
        }
        else {
            return userFriendlyNameHandler.GetFriendlyName(fieldObject, nameFormat);
        }
    };
    self.GetCategoryColumnTemplate = function (item) {
        var columnTemplate = '<span class="#CssClass#"></span>';
        var imgUrl = self.GetCategoryIconByField(item).path,
            imgId = '';
        if (imgUrl.indexOf('data:image') === -1) {
            imgId = imgUrl.toLowerCase().substr(imgUrl.lastIndexOf('/') + 1);
            imgId = imgId.substr(0, imgId.lastIndexOf('.'));
            jQuery.injectCSS('.iconCategory.' + imgId + '{ background-image: url(' + imgUrl + ') }', 'field_category_' + imgId);
        }
        return columnTemplate.replace('#CssClass#', 'iconCategory ' + imgId);
    };
    self.GetDetailColumnTemplate = function (item) {

        var fieldType = item.fieldtype;
        var columnTemplate = '<span title="#Title#" class="#CssClass#"></span>';
        var imgUrl = self.GetCategoryIconById(fieldType).path;
        var imgId = '';
        if (imgUrl && imgUrl.indexOf('data:image') === -1) {
            imgId = imgUrl.toLowerCase().substr(imgUrl.lastIndexOf('/') + 1);
            imgId = imgId.substr(0, imgId.lastIndexOf('.'));
            jQuery.injectCSS('.iconFieldType.' + imgId + '{ background-image: url(' + imgUrl + ') }', 'field_type_' + imgId);
        }

        var title;
        if (fieldType === 'boolean')
            title = self.Captions.FieldTypeBoolean;
        else if (fieldType === 'enumerated')
            title = self.Captions.FieldTypeEnum;
        else
            title = fieldType;
        return columnTemplate.replace('#Title#', title).replace('#CssClass#', 'iconFieldType ' + imgId);

    };
    self.GetCategoryIconByField = function (item, showSmallIcon) {
        if (typeof fieldCategoryHandler !== 'undefined') {
            return fieldCategoryHandler.GetCategoryIconByField(item, showSmallIcon);
        }
        else if (self.GetCategoryIconByFieldFunction !== null) {
            return self.GetCategoryIconByFieldFunction.call(self, item, showSmallIcon);
        }
        else {
            return self.BlankImage;
        }
    };
    self.GetCategoryIconById = function (id) {

        if (typeof fieldCategoryHandler !== 'undefined') {
            var icon = '',
            fixedIconPath = (typeof rootWebsitePath === 'undefined' ? '' : rootWebsitePath) + 'resources/embedded/',
            fixedIcons = {
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
                    'int': 'icon_number.png',
                    'double': 'icon_number.png',
                    'date': 'icon_date.png',
                    'datetime': 'icon_datetime.png',
                    'timespan': 'icon_period.png',
                    'currency': 'icon_currency.png'
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

            var category = fieldCategoryHandler.GetFieldCategoryById(id);
            if (category) {
                icon = self.GetCategoryIconByField({
                    id: category.id,
                    category: category.uri
                });
            }
        }
        else if (self.GetCategoryIconByIdFunction !== null) {
            icon = self.GetCategoryIconByIdFunction.call(self, id);
        }
        return icon;
    };
    self.GetFilterText = function (filter) {
        var icon = self.GetCategoryIconById(filter.id),
            html = '';
        if (icon) {
            html += '<img src="' + icon.path + '" alt="" height="' + icon.dimension.height + '" width="' + icon.dimension.width + '" />';
            html += '<span class="name withIcon">';
        }
        else {
            html += '<span class="name">';
        }
        html += filter.name || filter.id;
        if (filter.checked()) {
            html += ' (' + filter.count() + ')';
        }
        html += '</span>';

        return html;
    };
    self.SetMarkAddedItem = function (dataView) {
        for (var i = 0; i < dataView.length; i++) {
            if (self.CheckFieldIsExists(dataView[i].id)) {
                jQuery('tr[data-uid="' + dataView[i].uid + '"]').addClass('selected');
            }
        }
    };
    self.SetMarkSelectedItem = function (grid) {
        var rows = grid.tbody.children();
        rows.removeClass('k-state-selected');
        jQuery.each(self.SelectedItems(), function (index, item) {
            rows.filter('[data-uid="' + item.uid + '"]').addClass('k-state-selected');
        });
    };
    self.CheckFieldIsExists = function (fieldId) {
        if (self.CheckFieldIsExistsFunction !== null) {
            return self.CheckFieldIsExistsFunction.call(self, fieldId);
        }
        else if (typeof listHandler !== 'undefined') {
            return listHandler.IsColumnExist(fieldId);
        }
        else {
            return false;
        }
    };
    self.IsCurrentSelected = function (uid) {
        var isSelected = false;
        jQuery.each(self.SelectedItems(), function (k, v) {
            if (v.uid === uid) {
                isSelected = true;
                return false;
            }
        });
        return isSelected;
    };
    self.Filter = function () {
        jQuery('.fieldChooserFilter').busyIndicator(true);
        jQuery('.fieldChooserFilter .k-loading-mask').height(jQuery('.fieldChooserFilter .k-loading-mask').height() - 1);

        if ($("#txtFitlerAvailableProperties") && (self.IsAutoFocus))
            $("#txtFitlerAvailableProperties").focus();

        self.BindDataGrid();
    };
    self.FilterFacet = function (element) {
        self.UpdatingCategory = jQuery(element).parents('.FilterCheckBox').prev().attr('id');

        if (self.FilterFacetCustom !== null) {
            self.FilterFacetCustom.call(self);
            return;
        }
        self.IsAutoFocus = false;
        self.Filter();
        self.IsAutoFocus = true;
    };
    self.FilterByWord = function (event) {
        var currentValue = jQuery.trim(jQuery('#txtFitlerAvailableProperties').val());
        if (event.keyCode === 13) {
            clearTimeout(self.CheckLastSearchValue);
            self.LastSearchValue = currentValue;
            if (currentValue) {
                self.CurrentSort = null;
            }
            self.Filter();
        }

        if (self.IsAutoSearch && currentValue !== self.LastSearchValue) {
            clearTimeout(self.CheckLastSearchValue);
            self.CheckLastSearchValue = setTimeout(function () {
                self.LastSearchValue = currentValue;
                if (currentValue) {
                    self.CurrentSort = null;
                }
                self.Filter();
            }, 500);
        }
    };
    self.Sort = function (target) {
        self.SelectedItems([]);
        jQuery('#' + self.GridName).find('.k-state-selected').removeClass('k-state-selected');

        var targetId = jQuery(target).attr('id'), sortId;

        if (targetId !== '') {
            var sortOptions;
            var defaultDir = targetId === 'starred' ? 'desc' : 'asc';

            sortOptions = jQuery.grep(self.SortingList, function (element) {
                return element.id === targetId.toLowerCase();
            });
            if (targetId === 'starred') {
                var sortSuggestedOptions = jQuery.grep(self.SortingList, function (element) {
                    return element.id.indexOf('suggested') !== -1;
                });
                if (sortSuggestedOptions.length)
                    sortOptions.push(sortSuggestedOptions[0]);
            }

            if (sortOptions.length) {
                sortId = jQuery.map(sortOptions, function (sortOption) { return sortOption.id; }).join(',');

                if (self.CurrentSort && sortId === self.CurrentSort.sort) {
                    self.CurrentSort = { sort: sortId, dir: self.CurrentSort.dir === 'asc' ? 'desc' : 'asc' };
                }
                else {
                    self.CurrentSort = { sort: sortId, dir: defaultDir };
                }
            }

            self.Filter();
        }
    };
    self.ClosePopup = function () {
        popup.Close('#popupFieldChooser');
    };
    self.ClearFilter = function () {
        // clear sorting
        self.CurrentSort = null;

        // clear searchbox
        jQuery('#txtFitlerAvailableProperties').val('');

        // clear facets
        self.FacetItems([]);
    };

    self.GetQueryFilterUri = function (page) {
        if (self.GetCustomQueryUriFunction === null) {
            return self.GetQueryFilterDefaultUri(page);
        }
        else {
            return self.GetCustomQueryUriFunction.call(self, page);
        }
    };
    self.GetQueryFilterDefaultUri = function (page) {
        var resultData = ko.toJS(resultModel.Data());
        if (displayModel.Data() && displayModel.IsNewDisplay()) {
            delete resultData.query_fields;
        }
        var request = {
            url: modelsHandler.GetQueryFieldsUri(resultData, angleInfoModel.Data()),
            data: {
                offset: (page - 1) * self.ResultPerPage,
                limit: self.ResultPerPage
            }
        };
        jQuery.extend(
            request.data,
            self.GetKeywordQuery(),
            self.GetSortQuery(),
            self.GetFacetQuery(),
            self.GetDetailedSearchQuery()
        );

        return request;
    };
    self.GetKeywordQuery = function () {
        var query = jQuery.trim(jQuery('#txtFitlerAvailableProperties').val());
        if (query) {
            var queries = self.GetKeyWordQuerySet(query);
            var querySet = [];
            var qLength;
            jQuery.each(queries, function (index, q) {
                qLength = q.length;
                // clean " inside "xxx"
                if (qLength > 1 && q[0] === '"' && q[qLength - 1] === '"' && q.match(/\"/g).length > 2) {
                    q = q.substr(1, qLength - 2);
                    q = '"' + q.replace(/\"/g, '') + '"';
                }
                querySet.push(q);
            });
            return { q: querySet.join(' ') };
        }
        else {
            return {};
        }
    };
    self.GetKeyWordQuerySet = function (q) {
        var highlightingTexts = [],
            qLength = q.length, i,
            wordDblQuoteCount, dblQuoteCount = 0, word = '';
        for (i = 0; i < qLength; i++) {
            word += q[i];

            if (q[i] === '"' && (!dblQuoteCount || qLength === i + 1 || (dblQuoteCount && q[i + 1] === ' '))) {
                dblQuoteCount++;

                wordDblQuoteCount = (word.match(/\"/g) || []).length;
                if (dblQuoteCount === 2 && wordDblQuoteCount > 2 && wordDblQuoteCount % 2 !== 0) {
                    dblQuoteCount--;
                }
            }

            if (dblQuoteCount === 2 || (!dblQuoteCount && q[i] === ' ') || qLength === i + 1) {
                if (word.length && word !== ' ') {
                    highlightingTexts.push(word);
                }
                word = '';
                dblQuoteCount = 0;
            }
        }

        return highlightingTexts;
    };
    self.GetFacetQuery = function () {
        var facetQuery = '';
        var fieldTypeChecked = '';
        var fieldTypeUnchecked = '';

        jQuery('.fieldChooserFilter:visible .FilterCheckBox ul').each(function (index, element) {
            var filterChecked = [],
                filterUnchecked = [],
                filter = '';

            jQuery(this).find(':checkbox').each(function (subIndex, subElement) {
                if (subElement.checked)
                    filterChecked.push(subElement.id);
            });

            if (filterChecked.length + filterUnchecked.length !== 0) {
                if (filterChecked.length !== 0) {
                    filter += element.className + ':(' + filterChecked.join(' ') + ')';
                }
                if (filterUnchecked.length !== 0) {
                    if (filter) {
                        filter += ' AND ';
                    }
                    filter += '-' + element.className + ':(' + filterUnchecked.join(' ') + ')';
                }

                if (facetQuery !== '') {
                    facetQuery += ' AND ' + filter;
                }
                else {
                    facetQuery += filter;
                }

                if (element.className === 'fieldtype') {
                    fieldTypeChecked = filterChecked.slice();
                    fieldTypeUnchecked = filterUnchecked.slice();
                }
            }
        });

        // custom fq query
        if (self.FieldChooserType !== null && self.FieldChooserType !== 'row' && self.FieldChooserType !== 'column') {
            var customFacet = '', customFacetArray, customFacetIndex;
            if (facetQuery !== '') {
                customFacet += ' AND ';
            }

            var isFieldTypeInFacets = function (allowedTypes, types) {
                var result = true;
                jQuery.each(allowedTypes, function (index, type) {
                    if (jQuery.inArray(type, types) !== -1) {
                        result = false;
                        return false;
                    }
                });
                return result;
            };

            if (self.FieldChooserType === 'data'
                || self.FieldChooserType.indexOf(enumHandlers.CHARTTYPE.BUBBLECHART.Code) !== -1
                || self.FieldChooserType.indexOf(enumHandlers.CHARTTYPE.SCATTERCHART.Code) !== -1) {
                if (self.FieldChooserType.indexOf('row') !== -1) {
                    customFacetArray = ['currency', 'number', 'int', 'double', 'percentage', 'date', 'datetime', 'time', 'timespan', 'period'];
                    if (fieldTypeUnchecked.length) {
                        jQuery.each(fieldTypeUnchecked, function (index, facetId) {
                            customFacetIndex = jQuery.inArray(facetId, customFacetArray);
                            if (customFacetIndex !== -1) {
                                customFacetArray.splice(customFacetIndex, 1);
                            }
                        });
                    }

                    customFacet += 'fieldtype:(' + customFacetArray.join(' ') + ')';
                    if (!fieldTypeChecked.length || (fieldTypeChecked.length && isFieldTypeInFacets(customFacetArray, fieldTypeChecked))) {
                        facetQuery += customFacet;
                    }
                }
                else {
                    customFacetArray = ['currency', 'number', 'int', 'double', 'percentage', 'period', 'time', 'timespan'];
                    if (fieldTypeUnchecked.length) {
                        jQuery.each(fieldTypeUnchecked, function (index, facetId) {
                            customFacetIndex = jQuery.inArray(facetId, customFacetArray);
                            if (customFacetIndex !== -1) {
                                customFacetArray.splice(customFacetIndex, 1);
                            }
                        });
                    }

                    customFacet += 'fieldtype:(' + customFacetArray.join(' ') + ')';
                    if (!fieldTypeChecked.length || (fieldTypeChecked.length && isFieldTypeInFacets(customFacetArray, fieldTypeChecked))) {
                        facetQuery += customFacet;
                    }
                }
            }
            else {
                // M4-26202: Check self.FieldChooserType is not empty string, because MC cannot don't know fieldtype
                if (self.FieldChooserType !== '') {
                    var customFacetValue = 'fieldtype:(' + self.FieldChooserType + ')';
                    customFacet += customFacetValue;
                    if (facetQuery.indexOf(customFacetValue) === -1) {
                        facetQuery += customFacet;
                    }
                }
            }
        }

        return !facetQuery ? {} : { fq: facetQuery };
    };
    self.GetSortQuery = function () {
        if (self.CurrentSort === null && self.LastSearchValue) {
            return {};
        }

        if (self.CurrentSort === null) {
            self.CurrentSort = { sort: "name", dir: "asc" };
        }

        return self.CurrentSort;

    };
    self.GetDetailedSearchQuery = function () {
        return self.DisplayType === self.DISPLAY_TYPE.FULL ? { detailed_search: true } : {};
    };
    self.SwitchDisplay = function (type) {

        if (type === self.DISPLAY_TYPE.FULL) {
            self.FullView();
        }
        else {
            self.CompactView();
        }

        if (type === self.DisplayType)
            return;

        self.DisplayType = type;

        self.BindDataGrid();

        self.SaveUserSettingsViewMode.call(self, type);
    };
    self.CompactView = function () {
        jQuery('#NewColumnProperty').removeClass('fullDetail').addClass('compactDetail');
        jQuery('#ViewProperty').addClass('viewTypeCompact').removeClass('viewTypeFull');
    };
    self.FullView = function () {
        if (typeof helpTextHandler !== 'undefined') {
            jQuery.each(helpTextHandler.Data, function (model, helpTexts) {
                jQuery.each(helpTexts, function (i, value) {
                    self.HelpTexts[value.uri] = value;
                });
            });
        }

        jQuery('#NewColumnProperty').addClass('fullDetail').removeClass('compactDetail');
        jQuery('#ViewProperty').removeClass('viewTypeCompact').addClass('viewTypeFull');
    };
    self.SortFacetFilter = function (list, sortBy, convertor, direction) {
        if (typeof convertor === 'undefined')
            convertor = jQuery.noop;
        return list.sort(function (a, b) {
            var x = convertor(a[sortBy]),
                y = convertor(b[sortBy]);
            return (x < y ? -1 : (x > y ? 1 : 0)) * (direction === 'DESC' ? -1 : 1);
        });
    };
    self.SetHelpText = function (data, currentRow) {
        var target;
        var rows = jQuery(currentRow);

        if (rows.length) {
            target = rows.find('div[name="' + data.id + '"]');
        }
        else {
            target = jQuery('div[name="' + data.id + '"]');
            rows = target.parents('tr');
        }

        target.text(self.StripHTML(data.html_help, true));
        
        self.SetHightlightText(rows.find('.detailHelp'));
    };
    self.LoadHelpText = function (helpIds, needUpdateHelp) {
        if (!helpIds.length)
            return jQuery.when(null);

        if (typeof needUpdateHelp === 'undefined')
            needUpdateHelp = true;

        var deferred = [], fnGetHelps;
        var uriParameter = '/helptexts?viewmode=details&ids=';

        if (self.GetHelpTextFunction !== null) {
            fnGetHelps = function (ids) {
                return jQuery.when(self.GetHelpTextFunction.call(self, uriParameter + ids.join(',')))
                .done(function (response) {
                    jQuery.each(response, function (index, helpText) {
                        var helpKey = helpText.uri;
                        if (helpText.uri.substr(0, 4) === 'http') {
                            helpKey = helpText.uri.substr(helpText.uri.indexOf('/models/'));
                        }
                        self.HelpTexts[helpKey] = helpText;
                        if (needUpdateHelp) {
                            self.SetHelpText(helpText);
                        }
                    });
                });
            };
        }
        else {
            fnGetHelps = function (ids) {
                return GetDataFromWebService(self.ModelUri + uriParameter + ids.join(','))
                    .done(function (response) {
                        helpTextHandler.SetHelpTexts(response.help_texts);

                        jQuery.each(response.help_texts, function (index, helpText) {
                            self.HelpTexts[helpText.uri] = helpText;
                            if (needUpdateHelp) {
                                self.SetHelpText(helpText);
                            }
                        });
                    });
            };
        }

        while (helpIds.length) {
            deferred.push(fnGetHelps(helpIds.splice(0, 30)));
        }

        return jQuery.when.apply(jQuery, deferred);
    };
    self.GetHelpTextSummary = function (html) {
        var help = jQuery('<div>').append(html);
        if (help.find('.sectionSummary').length !== 0) {
            return jQuery('<div>').append(help.find('.sectionSummary').clone()).html();
        }
        else if (help.find('.section').length !== 0) {
            return jQuery('<div>').append(help.find('.section:first').clone()).html();
        }
        else {
            return html;
        }
    };
    self.StripHTML = function (str, removeHeadingTag) {
        if (window.WC && window.WC.HtmlHelper) {
            return window.WC.HtmlHelper.StripHTML(str, removeHeadingTag);
        }
        else {
            if (typeof removeHeadingTag === 'undefined')
                removeHeadingTag = false;

            if (str === null)
                str = '';

            if (removeHeadingTag) {
                // add [space] after hx tag
                str = str.replace(/(<\/(h\d)>)/ig, '$1 ');

                // remove hx tag
                str = str.replace(/<h\d\b[^>]*>(.*?)<\/h\d>/ig, '');
            }

            // add \n for block tag
            str = str.replace(/(<\/(blockquote|tr|ol|ul|li|div|p|h\d)>)/ig, '$1\n');

            // add * for each <li>
            str = str.replace(/(<li>)/ig, '<li>* ');

            // add space for each close html tag </...>
            str = str.replace(/(<\/[a-z]+>)/ig, '$1 ');

            // replace <br /> with \n
            str = str.replace(/<br ?\/?>/ig, ' \n');

            // replace <hr /> with --------------------------------
            str = str.replace(/<hr ?\/?>/ig, '------------------------------\n');
            str = str.replace(/<img[^>]*>/ig, '');
            str = str.replace(/<%/ig, '');
            str = str.replace(/%>/ig, '');

            // remove multiple spaces to 1
            str = str.replace(/\s{2,}/g, ' ');

            // convert html to text
            var rawText = jQuery('<div />', { html: str }).text();
            return jQuery.trim(rawText);
        }
    };
    self.SetHightlightText = function (target) {
        var q = jQuery('#txtFitlerAvailableProperties').val() || '';
        if (self.DisplayType === self.DISPLAY_TYPE.FULL)
            target.highlighter(q);
    };

    self.ShowFieldInfo = function (e, uid) {
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.cancelBubble = true;

        if (typeof self.ShowFieldInfoFunction === 'function') {

            var grid = jQuery('#' + self.GridName).data('kendoGrid');
            if (grid) {
                var field = grid.dataSource.getByUid(uid);
                self.ShowFieldInfoFunction.call(self, field);
            }
        }

        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
    };

    self.GetTitle = function (facet, filter) {
        if (facet.id === self.CATEGORIES.CATEGORY || facet.id === self.CATEGORIES.CHARACTERISTICS || facet.id === self.CATEGORIES.FIELDTYPE)
            return '';
        else
            return filter.description && filter.name !== filter.description ? filter.description : filter.name;
    };

    // M4-33750 Save the size of the Field Chooser box size in the session

    // initialize field chooser popup
    self.DisplayFieldChooserPopup = function (options) {
        // append field chooser html to document
        self.BindFieldChooserHtmlToDocumentBody(self.PopupId, options.html);
        // initial field chooser popup
        self.FieldChooserPopup = jQuery(self.PopupId).kendoWindow(options).data('kendoWindow');
        // set tooltip
        self.SetPopupTooltip();

        if (self.LayoutSettings.isMaximize) {
            // maximize the popup
            self.FieldChooserPopup.maximize();
        }

        return self.FieldChooserPopup;

    };

    // get field chooser popup options
    self.GetPopupFieldCooserOptions = function (popupClassName) {
        // decide to load popup settings from the localstorage or use the default settings
        self.LayoutSettings = self.GetFieldChooserLayoutSettings() || self.GetDefaultFieldChooserLayoutSettings();

        // prepare option for popup
        var options = {
            className: 'popupFieldChooser popup ' + (popupClassName || ''),
            actions: ['Maximize', 'Close'],
            html: fieldschooserHtmlTemplate(),
            width: self.LayoutSettings.size.width,
            height: self.LayoutSettings.size.height,
            minWidth: 600,
            minHeight: 400,
            animation: false,
            modal: true,
            scrollable: false,
            pinned: true,
            open: self.OnOpenPopupDefault,
            close: self.OnClosePopupDefault,
            resize: self.OnResizePopupDefault,
            maximize: self.OnMaximizePopupDefault,
            dragend: self.OnDragEndPopupDefault
        };

        if (self.LayoutSettings.position) {
            // add position to the popup option if localstorage has this value 
            options.position = { top: self.LayoutSettings.position.top, left: self.LayoutSettings.position.left };
        }

        return options;
    };

    // field chooser popup event handler
    self.OnOpenPopupDefault = function (e) {
        //create button elelments
        var buttons = self.GetFieldChooserButtons();

        //binding buttons to the popup
        self.CreateFieldChooserButtons(buttons);

        if (!self.LayoutSettings.position) {
            // auto adjust popup to center of screen
            e.sender.center();
        }

        // make popup to front of element
        e.sender.toFront();

        // initial field chooser
        self.Initial();

        // call back when opened popup
        self.OnOpenPopupDefaultCallback(e);

        // the override function
        self.OnOpenPopup(e);
    };
    self.OnClosePopupDefault = function (e) {
        // the override function
        self.OnClosePopup(e);

        setTimeout(function () {
            // destroy the popup
            e.sender.destroy();
        }, 500);
    };
    self.OnResizePopupDefault = function (e) {
        // the override function
        self.OnResizePopup(e);

        // set height to grid and filter
        self.AdjustPopupItemsContainerHeight(e);

        // set grid column size
        self.AdjustColumn(e.sender.wrapper.find('.k-grid').data('kendoGrid'));

        // skip action below if popup has initializing
        if (!jQuery('#DisplayPropertiesGrid').children().length) {
            return;
        }

        // update minimize flag please see the condition in below
        self.LayoutSettings.isMaximize = e.sender.options.isMaximized;
        if (!self.LayoutSettings.isMaximize) {

            // save width and height flag
            if (e.width && e.height) {
                self.LayoutSettings.size.width = e.width;
                self.LayoutSettings.size.height = e.height;
            }

            // update position flag
            if (!jQuery.isEmptyObject(e.sender.wrapper.offset())) {
                self.LayoutSettings.position = { top: e.sender.wrapper.offset().top, left: e.sender.wrapper.offset().left };
            }

        }

        // save layout to localstorage
        self.SaveFieldChooserLayoutSettings();
    };
    self.OnMaximizePopupDefault = function (e) {
        // change tooltip text on maximize button
        e.sender.wrapper.find('.k-i-restore').attr('title', Localization.RestoreDown);
    };
    self.OnDragEndPopupDefault = function (e) {
        // update position flag
        if (!jQuery.isEmptyObject(e.sender.wrapper.offset())) {
            self.LayoutSettings.position = { top: e.sender.wrapper.offset().top, left: e.sender.wrapper.offset().left };
        }

        // save layout to localstorage
        self.SaveFieldChooserLayoutSettings();
    };

    // field chooser popup settings
    self.SetPopupTooltip = function () {
        self.FieldChooserPopup.wrapper.find('.k-i-maximize').attr('title', Localization.Maximize);
        self.FieldChooserPopup.wrapper.find('.k-i-close').attr('title', Localization.Close);
    };
    self.OnOpenPopupDefaultCallback = function (e) {
        self.SelectedItems([]);
        self.SetNoData(false);

        e.sender.element.find('.fieldChooserFilter').busyIndicator(false);
        e.sender.trigger('resize');
        e.sender.element.find('#DisplayPropertiesGrid').data('submited', false);

        self.ClearFilter();
        self.InitialFacet().done(function () {
            self.Filter();
            setTimeout(function () {
                e.sender.wrapper.find('.fieldChooserButtons').children().removeClass('executing');
            }, 500);
        });
    };
    self.AdjustPopupItemsContainerHeight = function (e) {
        if (e.sender.element.children().length) {
            var popupHeight = e.sender.element.height();
            var gridOffsetTop = jQuery('#PropertyTable').position().top;
            var buttonsHeight = jQuery('.fieldChooserButtons').outerHeight();

			jQuery('#NewColumnFilter').height(popupHeight - buttonsHeight - 30);
			jQuery('#DisplayPropertiesGrid').height(popupHeight - gridOffsetTop - buttonsHeight - 18);
        }
    };
    self.BindFieldChooserHtmlToDocumentBody = function (id, html) {
        var fieldChooser = jQuery(id);
        if (!fieldChooser.length) {
            id = (typeof id === 'string' && id.charAt(0) === '#') ? id.substr(1) : 'popup' + jQuery.now();

            fieldChooser = jQuery('<div id="' + id + '" />').appendTo(document.body);
            fieldChooser.html(html);
        }
    };
    self.CreateFieldChooserButtons = function (buttons) {
        var buttonsContainer = jQuery('.fieldChooserButtons').empty();
        jQuery.each(buttons, function (index, button) {
            var buttonElement = self.CreateFieldChooserButton(button, index);
            buttonsContainer.append(buttonElement);
        });
    };
    self.CreateFieldChooserButton = function (button, index) {
        var caption = jQuery('<span/>').text(button.text);
        var buttonElement = jQuery('<a/>').addClass(button.className).attr('id', 'btn-popupFieldChooser' + index);
        buttonElement.on('click', function (e) {
            var kendoWindow = jQuery(self.PopupId).data('kendoWindow');
            button.click(e, kendoWindow);
        });
        buttonElement.append(caption);
        return buttonElement;
    };
    self.GetDefaultFieldChooserLayoutSettings = function () {

        var defaultColumnSettings = function () {
            return {
                id: { width: 42 },
                category: { width: 42 },
                source: { width: 110 },
                short_name: { width: 280 },
                fieldtype: { width: 50 },
                technical_info: { width: 70 }
            };
        };

        var settings = {
            position: null,
            size: { width: 850, height: 600 },
            isMaximize: false,
            columnsDetailMode: defaultColumnSettings(),
            columnsCompactMode: defaultColumnSettings()
        };

        return settings;
    };
    self.SaveFieldChooserLayoutSettings = function () {
        jQuery.localStorage(self.POPUP_SETTINGS_KEY, self.LayoutSettings, true);
    };
    self.GetFieldChooserLayoutSettings = function () {
        return jQuery.localStorage(self.POPUP_SETTINGS_KEY);
    };

}
