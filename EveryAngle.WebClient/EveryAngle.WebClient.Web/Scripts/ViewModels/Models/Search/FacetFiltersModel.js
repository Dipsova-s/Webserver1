var facetFiltersViewModel = new FacetFiltersViewModel();

//Knock out function to render business process top bar in search view
function FacetFiltersViewModel() {
    "use strict";

    var self = this;

    self.OPENPANELSNAME = 'search_facet_open_panels';
    self.FACETCACHE = 'search_facet_cache';
    self.Data = ko.observableArray([]);
    self.SortOptions = [];
    self.SortRelevancyId = 'relevancy';
    self.GroupExceptions = [];
    self.GroupGeneral = 'item_property';
    self.GroupBusinessProcess = 'business_process';
    self.GroupCannotNegativeFilter = 'facetcat_admin';
    self.GroupModels = 'facetcat_models';
    self.GroupGeneralOrder = ['facetcat_bp', 'facetcat_itemtype', 'facetcat_characteristics', 'facetcat_models', 'facetcat_admin'];
    self.FilterExclusionList = ['facet_executeonlogin', 'facet_has_errors'];
    self.ShowOtherFacetFilterProperties = ko.observable(false);
    self.selectedItems = [];

    self.FacetItemProperties = ko.observableArray([]);
    self.OptionalFacetProperties = ko.observableArray([]);

    self.Load = function () {
        self.ShowOtherFacetFilterProperties(!!$.address.parameterNames().length);

        var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.ITEMS);
        var query = {};
        query[enumHandlers.SEARCHPARAMETER.OFFSET] = 0;
        query[enumHandlers.SEARCHPARAMETER.LIMIT] = 0;
        query[enumHandlers.SEARCHPARAMETER.VIEWMODE] = enumHandlers.VIEWMODETYPE.BASIC;

        return GetDataFromWebService(uri, query)
            .done(function (data) {
                self.SetFacetAndSort(data);
            });
    };
    self.SetFacetAndSort = function (data) {
        self.SetSortOptions(data.sort_options);
        self.PrepareBusinessProcesses(data.facets);
        self.SetFacetExclusionList(data.facets);
        self.SetFacet(data.facets);
    };
    self.SetSortOptions = function (sortOptions) {
        self.SortOptions = WC.Utility.ToArray(ko.toJS(sortOptions));
        self.SortOptions.removeObject('id', self.SortRelevancyId);
    };
    self.PrepareBusinessProcesses = function (facets) {
        var facetBusinessProcesses = WC.Utility.ToArray(facets).findObject('id', 'facetcat_bp');
        if (facetBusinessProcesses) {
            var filters = facetBusinessProcesses.filters;

            var globalBusinessProcesses = businessProcessesModel.General.Data()
                .sort(function (a, b) {
                    return a.order > b.order ? 1 : -1;
                });

            var refilters = [];
            globalBusinessProcesses.forEach(function (item) {
                var filter = filters.findObject('id', item.id);
                if (filter) {
                    refilters.push(filter);
                }
            });

            facetBusinessProcesses.filters = refilters;
        }
    };
    self.SetFacetExclusionList = function (facets) {
        // check with_private_display visibility
        var filterPrivateDisplayId = 'with_private_display';
        var fq = searchQueryModel.GetParams()[enumHandlers.SEARCHPARAMETER.FQ];
        var facetCharacteristics = WC.Utility.ToArray(facets).findObject('id', 'facetcat_characteristics');
        if (facetCharacteristics) {
            var filterPrivateDisplay = facetCharacteristics.filters.findObject('id', filterPrivateDisplayId);
            if (filterPrivateDisplay) {
                var indexFilterPrivateDisplay = jQuery.inArray(filterPrivateDisplayId, self.FilterExclusionList);
                var showPrivateDisplayFacet = jQuery.inArray(filterPrivateDisplayId, fq.checked) !== -1 || jQuery.inArray(filterPrivateDisplayId, fq.unchecked) !== -1 || filterPrivateDisplay.count;
                if (!showPrivateDisplayFacet) {
                    if (indexFilterPrivateDisplay === -1) {
                        self.FilterExclusionList.push(filterPrivateDisplayId);
                    }
                }
                else {
                    if (indexFilterPrivateDisplay !== -1) {
                        self.FilterExclusionList.splice(indexFilterPrivateDisplay, 1);
                    }
                }
            }
        }
    };
    self.SetFacet = function (data) {
        var facetData = ko.toJS(data);
        defaultValueHandler.CheckAndExtendProperties(facetData, enumHandlers.VIEWMODELNAME.SEARCHFACET, true);
        var facets = [],
            facetGeneral = [],
            fq = searchQueryModel.GetParams()[enumHandlers.SEARCHPARAMETER.FQ],
            removeFacetIndexList = [],
            panelsOpened = WC.Utility.ToArray(jQuery.localStorage(self.OPENPANELSNAME)),
            currentPanelsOpened = [],
            panelOpenedIndex, panelOpenedStatus;
        if (!panelsOpened.length) {
            panelsOpened = self.GroupGeneralOrder.slice();
        }

        self.GenerateFacetFromCache(facetData, fq.json);

        jQuery.each(facetData, function (indexFacet, facet) {
            if (jQuery.inArray(facet.type, self.GroupExceptions) === -1) {
                facet.preference_text = ko.observable('');
                facet.child_checked = false;
                panelOpenedIndex = jQuery.inArray(facet.id, panelsOpened);
                panelOpenedStatus = panelOpenedIndex !== -1;
                if (panelOpenedStatus) currentPanelsOpened.push(facet.id);
                facet.panel_opened = ko.observable(panelOpenedStatus);
                removeFacetIndexList = [];
                jQuery.each(facet.filters, function (indexFilter, filter) {
                    filter.count = ko.observable(filter.count || 0);
                    filter.checked = ko.observable(jQuery.inArray(filter.id, fq.checked) !== -1 ? true : false);
                    filter.negative = ko.observable(jQuery.inArray(filter.id, fq.unchecked) !== -1);
                    if (filter.negative()) {
                        filter.checked(true);
                    }
                    if (filter.checked()) facet.child_checked = true;

                    filter.index = indexFilter;
                    filter.enabled = ko.observable(true);
                    var businessProcessModel = businessProcessesModel.General.Data().findObject('id', filter.id);
                    if (businessProcessModel) {
                        filter.enabled = ko.observable(businessProcessModel.is_allowed);
                    }
                });
                jQuery.each(removeFacetIndexList, function (index, removeIndex) {
                    facet.filters.splice(removeIndex, 1);
                });

                var facetItems;
                if (facet.type === self.GroupGeneral || facet.type === self.GroupBusinessProcess) {
                    facetItems = facet.filters.slice(0);
                }
                else {
                    facetItems = self.SortFacetFilter(facet.filters.slice(0), 'name', function (data) { return data.toLowerCase(); });
                }

                facet.filters = ko.observableArray(facetItems);

                switch (facet.type) {
                    case self.GroupBusinessProcess:
                    case self.GroupGeneral:
                        facetGeneral[jQuery.inArray(facet.id, self.GroupGeneralOrder)] = facet;
                        break;
                    default: facets.push(facet);
                }
            }
        });
        jQuery.localStorage(self.OPENPANELSNAME, currentPanelsOpened);

        if (!facets.length)
            self.ShowOtherFacetFilterProperties(false);

        var index = 0;
        jQuery.each(facetGeneral, function (indexFacet, facet) {
            if (typeof facet !== 'undefined') {
                facets.splice(index, 0, facet);
                index++;
            }
        });
        self.Data(facets);

        jQuery.localStorage(self.FACETCACHE, ko.toJS(facets));
    };
    self.GenerateFacetFromCache = function (currentFacets, fq) {
        var facetsCache = WC.Utility.ToArray(jQuery.localStorage(self.FACETCACHE));
        var facet, filter, facetData, filterItemList;
        jQuery.each(fq, function (facetId, filters) {
            facetData = {};

            if (facetId.indexOf('-') === -1) {
                // facet category
                var currentFacet = currentFacets.findObject('id', facetId, false);
                if (currentFacet) {
                    facet = jQuery.extend({}, currentFacet);
                }
                else {
                    facet = facetsCache.findObject('id', facetId, false);
                }
                if (!facet) {
                    facet = {
                        id: facetId,
                        name: facetId,
                        description: facetId,
                        type: facetId,
                        filters: []
                    };
                }
                else {
                    if (!facet.filters) {
                        facet.filters = [];
                    }
                }
                jQuery.extend(facetData, facet, { filters: [] });

                // facet filters
                jQuery.each(filters, function (index, filterId) {
                    var currentFilter = currentFacet ? currentFacet.filters.findObject('id', filterId, false) : null;
                    if (currentFilter) {
                        filter = jQuery.extend({}, currentFilter);
                    }
                    else {
                        filterItemList = [];
                        jQuery.each(facet.filters, function (index, filterItem) {
                            filterItemList.push(filterItem);
                        });

                        filter = filterItemList.findObject('id', filterId, false);
                        if (filter) {
                            filter.count = 0;
                        }
                    }
                    if (filter) {
                        facetData.filters.push(filter);
                    }
                    else {
                        // get facet detail from cach
                        // Fix M4-14475: WC: Facet name will change when I select many facets
                        var cachFacetName = filterId;
                        var cachDescription = filterId;
                        var cachFacetItem = facetsCache.findObject('id', facetId, false);
                        if (cachFacetItem) {

                            filterItemList = [];
                            jQuery.each(cachFacetItem.filters, function (index, filterItem) {
                                filterItemList.push(filterItem);
                            });

                            var cachFilterItem = filterItemList.findObject('id', filterId, false);
                            if (cachFilterItem) {
                                cachFacetName = cachFilterItem.name;
                                cachDescription = cachFilterItem.description;
                            }
                        }
                        facetData.filters.push({
                            id: filterId,
                            name: cachFacetName,
                            description: cachDescription
                        });
                    }
                });

                // update currentFacets
                if (!currentFacet) {
                    currentFacets.push(facetData);
                }
                else {
                    jQuery.each(filters, function (index, filterId) {
                        if (!currentFacet.filters.hasObject('id', filterId, false)) {
                            currentFacet.filters.push(facetData.filters.findObject('id', filterId, false));
                        }
                    });
                }
            }
        });
    };
    self.GetCategoryById = function (id) {
        return jQuery.grep(self.Data(), function (obj) { return obj.id === id; });
    };
    self.IsFacetVisible = function (facet) {
        var isGeneralGroup = self.GroupGeneral === facet.type || self.GroupBusinessProcess === facet.type;

        // hide this section if no visible filter
        var isAllFiltersHidden = true;
        jQuery.each(facet.filters(), function (index, facet) {
            if (self.CheckAngleFacetVisibility(facet.id, facet.count())) {
                isAllFiltersHidden = false;
                return false;
            }
        });
        return !isAllFiltersHidden && (isGeneralGroup || self.ShowOtherFacetFilterProperties());
    };
    self.IsFacetHeaderVisible = function (index, facetType) {
        var isGeneralGroup = self.GroupGeneral === facetType;
        return index === 1 && isGeneralGroup || !isGeneralGroup;
    };
    self.CheckAngleFacetVisibility = function (id, count) {
        if (jQuery.inArray(id, self.FilterExclusionList) !== -1) {
            return false;
        }
        else if (id === 'facet_has_warnings') {
            return userModel.IsPossibleToCreateAngle()
                && userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.SHOW_FACET_ANGLE_WARNINGS);
        }
        else {
            var canCreateAngle = privilegesViewModel.IsAllowCreateAngle();
            var facetVisibility = true;
            if (id === 'facet_isprivate' && !canCreateAngle && count <= 0) {
                facetVisibility = false;
            }
            else if (id === 'facet_created' && !canCreateAngle && count <= 0) {
                facetVisibility = false;
            }
            else if (id === 'facet_can_validate' && !canCreateAngle) {
                facetVisibility = false;
            }
            else if (id === 'facet_can_manage' && !canCreateAngle) {
                facetVisibility = false;
            }
            return facetVisibility;
        }
    };
    self.GetIconInfo = function (id) {
        var iconsMapping = {
            facet_angle: {
                path: GetImageFolderPath() + 'searchpage/icn_item_angle.svg',
                dimension: {
                    width: 20,
                    height: 20
                },
                style: 'left:-2px;bottom:1px;'
            },
            facet_template: {
                path: GetImageFolderPath() + 'searchpage/icn_item_template.svg',
                dimension: {
                    width: 20,
                    height: 20
                },
                style: 'left:-2px;bottom:1px;'
            },
            facet_dashboard: {
                path: GetImageFolderPath() + 'searchpage/icn_item_dashboard.svg',
                dimension: {
                    width: 16,
                    height: 16
                },
                style: 'left:1px;bottom:2px;'
            },
            facet_isprivate: {
                path: GetImageFolderPath() + 'searchpage/icn_private.svg',
                dimension: {
                    width: 16,
                    height: 16
                },
                style: 'bottom:2px;'
            },
            with_private_display: {
                path: GetImageFolderPath() + 'icons/icon_private_display.svg',
                dimension: {
                    width: 17,
                    height: 17
                },
                style: 'bottom:2px;'
            },
            facet_isvalidated: {
                path: GetImageFolderPath() + 'searchpage/icn_validated.svg',
                dimension: {
                    width: 16,
                    height: 16
                },
                style: 'bottom:1px;'
            },
            facet_isstarred: {
                path: GetImageFolderPath() + 'searchpage/icn_starred_active.svg',
                dimension: {
                    width: 16,
                    height: 16
                },
                style: 'bottom:2px;'
            },
            facet_ispublished: {
                path: GetImageFolderPath() + 'searchpage/icn_public.svg',
                dimension: {
                    width: 20,
                    height: 20
                },
                style: 'bottom:1px;'
            },
            facet_has_warnings: {
                path: GetImageFolderPath() + 'icons/icon_warnings.svg',
                dimension: {
                    width: 15,
                    height: 15
                },
                style: 'left:0;bottom:2px;'
            },
            realtime: {
                path: GetImageFolderPath() + 'searchpage/icn_clock.svg',
                dimension: {
                    width: 16,
                    height: 16
                },
                style: 'left:-1px;bottom:2px;'
            }
        };
        return iconsMapping[id.toLowerCase()];
    };

    self.GetFilterText = function (filter, facetType, facetcat) {
        var html = '';
        var isBusinessProcessGroup = self.GroupBusinessProcess === facetType;
        if (isBusinessProcessGroup) {
            var extraCss = filter.enabled() ? '' : ' disabled';
            var filterNumber = filter.index % 8;
            html += '<span class="BusinessProcessBadge BusinessProcessBadgeItem' + filterNumber + ' ' + filter.id + '"></span>';
            html += '<span class="BusinessProcessBadgeLabel' + extraCss + '" data-tooltip-text="' + filter.description + '">' + filter.name + '</span>';
        }
        else {
            var icon = self.GetIconInfo(filter.id);
            var isGeneralGroup = self.GroupGeneral === facetType;
            var itemText = (isGeneralGroup ? '' : filter.description) || filter.name || filter.id;

            if (facetcat === self.GroupModels)
                html += self.GetModelFilterText(filter);
            else if (icon)
                html += kendo.format('{0}<span class="name withIcon" data-tooltip-text="{1}">', self.GetFilterIconHtml(icon), itemText);
            else
                html += kendo.format('<span class="name" data-tooltip-text="{0}">', itemText);

            html += kendo.format('<span class="filter-name textEllipsis">{0}</span>', itemText);
            if (filter.checked()) {
                html += '<span class="filter-count">' + filter.count() + '</span>';
            }
            html += '</span>';
        }
        return html;
    };
    self.GetFilterIconHtml = function (icon, tooltipAttributes) {
        return kendo.format('<img class="name-icon" src="{0}" height="{1}" width="{2}" style="{3}" {4}/>', icon.path, icon.dimension.height, icon.dimension.width, icon.style || '', tooltipAttributes || '');
    };
    self.GetModelFilterText = function (filter) {
        var tooltipAttributes = kendo.format('data-type="html" data-tooltip-function="GetRefreshTime" data-tooltip-argument="{0}"', filter.id);
        var isRealTimeModel = aboutSystemHandler.IsRealTimeModel(filter.id);
        if (isRealTimeModel) {
            var realTimeIcon = self.GetIconInfo('realtime');
            return kendo.format('{0}<span class="name withIcon" {1}">', self.GetFilterIconHtml(realTimeIcon, tooltipAttributes), tooltipAttributes);
        }
        else {
            return kendo.format('<span class="name" {0}">', tooltipAttributes);
        }
    };
    self.ToggleCategory = function (data, event) {
        var element = jQuery(event.currentTarget),
            target = jQuery(data.type === self.GroupGeneral ? '.FilterCheckBox-' + data.type : '#' + jQuery(event.currentTarget).attr('id') + '_Checkbox'),
            panelsOpened = jQuery.localStorage(self.OPENPANELSNAME), panelsOpenedIndex;

        element.addClass('sliding');
        if (element.hasClass('expand')) {
            element.removeClass('expand');
            target.stop().slideUp('fast', function () {
                if (data.type === self.GroupGeneral) {
                    jQuery.each(self.GroupGeneralOrder, function (index, facetId) {
                        panelsOpenedIndex = jQuery.inArray(facetId, panelsOpened);
                        if (panelsOpenedIndex !== -1) {
                            panelsOpened.splice(panelsOpenedIndex, 1);
                        }
                    });
                }
                else {
                    panelsOpenedIndex = jQuery.inArray(data.id, panelsOpened);
                    if (panelsOpenedIndex !== -1) {
                        panelsOpened.splice(panelsOpenedIndex, 1);
                    }
                }
                jQuery.localStorage(self.OPENPANELSNAME, panelsOpened);
                element.removeClass('sliding');
            });
        }
        else {
            element.addClass('expand');
            target.stop().slideDown('fast', function () {
                if (data.type === self.GroupGeneral) {
                    panelsOpened = panelsOpened.concat(self.GroupGeneralOrder);
                }
                else {
                    panelsOpened.push(data.id);
                }
                jQuery.localStorage(self.OPENPANELSNAME, panelsOpened);
                element.removeClass('sliding');
            });
        }
    };
    self.SortFacetFilter = function (list, sortBy, convertor, direction) {
        if (typeof convertor === 'undefined') convertor = jQuery.noop;
        return jQuery(list).sort(function (a, b) {
            var x = convertor(a[sortBy]),
                y = convertor(b[sortBy]);
            return (x < y ? -1 : x > y ? 1 : 0) * (direction === 'DESC' ? -1 : 1);
        });
    };
    self.FilterItems = function (model, event, parent) {
        var chkState = event.currentTarget.checked;
        model.checked(chkState);

        // for business process only
        // at landing page; when uncheck a checkbox then revert checkbox state
        if (parent.type === self.GroupBusinessProcess && !searchQueryModel.HasSearchQuery() && !chkState) {
            model.checked(!chkState);
            event.currentTarget.checked = !chkState;
        }
        searchModel.FilterItems(model, event, parent.type === self.GroupGeneral && parent.id !== self.GroupCannotNegativeFilter);

        return event.currentTarget.checked === chkState;
    };
    self.GetDuration = function (seconds) {
        var duration = "";
        var epoch, interval;
        var duration_in_seconds = {
            epochs: ['y', 'd', 'h', 'm'],
            y: 31536000,
            d: 86400,
            h: 3600,
            m: 60
        };

        for (var i = 0; i < duration_in_seconds.epochs.length; i++) {
            epoch = duration_in_seconds.epochs[i];
            interval = Math.floor(seconds / duration_in_seconds[epoch]);
            if (interval >= 1) {
                duration += interval + epoch + ' ';
                if (epoch !== 'y') {
                    seconds -= interval * duration_in_seconds[epoch];
                }
                else {
                    return duration;
                }
            }
        }

        return duration;
    };
    self.GetTimeAgoByTimestamp = function (timestamp) {
        var now = new Date();
        var ts = new Date(timestamp * 1000);
        var seconds = (now.getTime() - ts.getTime()) / 1000;
        var duration = self.GetDuration(seconds);
        return kendo.format(Localization.SinceLastRefresh, duration);
    };
    self.GetRefreshTime = function (modelId) {
        var aboutInfo = aboutSystemHandler.GetModelInfoById(modelId);
        if (!aboutInfo)
            return '';

        // show info/status if it's not available
        if (!aboutInfo.available())
            return aboutInfo.info();

        return aboutInfo.is_real_time ? Localization.RunningRealTime : self.GetTimeAgoByTimestamp(aboutInfo.modeldata_timestamp);
    };
    self.IsFacetChecked = function (filter, facet) {
        /* at landing page; check if default business process */
        var isSearchResultActive = searchQueryModel.HasSearchQuery();
        if (facet.type === self.GroupBusinessProcess && !isSearchResultActive) {
            var defaultBusinessProcesses = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES);
            var isChecked = jQuery.inArray(filter.id, defaultBusinessProcesses) >= 0;
            return isChecked;
        }
        else {
            return filter.checked();
        }

    };
    self.GetFacetTabClassname = function (facet) {
        var result = [
            'FilterTab-' + facet.type,
            (facet.panel_opened() ? 'expand' : ''),
            self.GroupBusinessProcess !== facet.type ? 'border-separator' : ''
        ];

        return result.join(' ');
    };
    self.GetFacetCheckboxesClassname = function (facet) {
        var result = [
            'FilterCheckBox-' + facet.type
        ];

        return result.join(' ');
    }
    window.GetRefreshTime = self.GetRefreshTime;
}
