window.SearchPageHandler = function () {
    "use strict";

    var self = this;
    self.IsPageInitialized = false;
    self.DISPLAY_TYPE = {
        COMPACT: 'compact',
        DISPLAYS: 'displays'
    };
    var lastSearch = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL);
    var viewMode = WC.Utility.GetParameterByName(enumHandlers.SEARCHPARAMETER.VIEWMODE, lastSearch);
    self.DisplayType = ko.observable(viewMode || self.DISPLAY_TYPE.DISPLAYS);
    self.SEARCHMODE = {
        AUTO: 1,
        MANUAL: 2
    };
    self.SearchMode = self.SEARCHMODE.AUTO;
    self.HandlerInfoDetails = null;

    self.SearchTerms = [];
    self.MaxSearchTerms = 5;
    self.HandlerSidePanel = new SearchSidePanelHandler();

    /*BOF: Model Methods*/
    self.InitialSearchPage = function (callback) {
        searchStorageHandler.Initial(true, true, true);

        // clear Adhoc displays
        jQuery.localStorage.removeItem(displayModel.TemporaryDisplayName);

        directoryHandler.LoadDirectory()
            .then(function () {
                return jQuery.when(sessionModel.Load());
            })
            .then(function () {
                return jQuery.when(
                    businessProcessesModel.General.Load(),
                    systemSettingHandler.LoadSystemSettings(),
                    userModel.Load(),
                    systemInformationHandler.LoadSystemInformation(),
                    systemCurrencyHandler.LoadCurrencies()
                );
            })
            .then(function () {
                return jQuery.when(
                    fieldCategoryHandler.LoadFieldCategories(),
                    privilegesViewModel.Load(),
                    userSettingModel.Load(),
                    aboutSystemHandler.LoadAboutSystem(),
                    facetFiltersViewModel.Load()
                );
            })
            .then(function () {
                return modelsHandler.LoadModels();
            })
            .done(function () {
                jQuery('html').addClass('initialized');
                self.InitialSearchPageCallback(callback);
            });
    };
    self.InitialSearchPageCallback = function (callback) {
        userSettingsView.UpdateUserMenu();

        // make sure document is ready
        if (!jQuery.isReady || !jQuery('html').hasClass('initialized'))
            return;

        if (!self.IsPageInitialized) {
            self.IsPageInitialized = true;
            progressbarModel.InitialProgressBar();
            userSettingsView.UpdateUserMenu();
            CheckUILanguage(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase());
            self.InitialUserPrivileges();
            self.InitialSearchBox();
            self.RenderActionDropdownList();
            self.BindSortingDropdown();
            self.SearchTerms = userSettingModel.GetSearchTerms();

            // tooltip
            WC.HtmlHelper.Tooltip.Create('searchfacet', '#LeftMenu .name', true);
            WC.HtmlHelper.Tooltip.Create('searchfaceticon', '#LeftMenu .name-icon', true);
            WC.HtmlHelper.Tooltip.Create('BusinessProcessFacet', '#LeftMenu .BusinessProcessBadgeLabel', false, TOOLTIP_POSITION.RIGHT, 'BusinessProcessFacet-tooltip');
            WC.HtmlHelper.Tooltip.Create('actionmenu', '#ActionDropdownListPopup .actionDropdownItem', false, TOOLTIP_POSITION.BOTTOM);
            WC.HtmlHelper.Tooltip.Create('searchbar', '#SearchBar .searchBoxWrapper > a', false, TOOLTIP_POSITION.BOTTOM);
            WC.HtmlHelper.Tooltip.Create('viewmode', '#ViewType > a', false, TOOLTIP_POSITION.BOTTOM);

            // check currency
            userSettingsPanelHandler.CheckUserCurrency();

            // menu navigatable
            WC.HtmlHelper.MenuNavigatable('#UserControl', '#UserMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#Help', '#HelpMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#SelectModelCreateNewAngle', '#PopupSelectModelCreateNewAngle', '.k-item', 'k-state-selected');

            //Binding knockout
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#HelpMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#UserMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(searchFilterListViewHandler, jQuery('#SearchFilterView'));
            WC.HtmlHelper.ApplyKnockout(searchModel, jQuery('#SearchResultList'));
            WC.HtmlHelper.ApplyKnockout(searchModel, jQuery('#SearchBar'));
            WC.HtmlHelper.ApplyKnockout(createNewAngleViewManagementModel, jQuery('#CreateNewAngle'));

            // facet
            WC.HtmlHelper.ApplyKnockout(facetFiltersViewModel, jQuery('#LeftMenu .facetFilter'));

            createNewAngleViewManagementModel.UpdateCreateNewAngleButton();

            jQuery.clickOutside('#UserMenu', '#UserControl');
            jQuery.clickOutside('#HelpMenu', '#Help');
            jQuery.clickOutside('#NotificationsFeedMenu', '#NotificationsFeed');
            jQuery.clickOutside('#PopupSelectModelCreateNewAngle', '#SelectModelCreateNewAngle');

            // load auto execute list
            var isExecuteSearchWhenLogon = userSettingModel.CheckExecuteSearchWhenLogon();
            var isExecuteAutoWhenLogon = userSettingModel.CheckExecuteAutoWhenLogon();
            var hasExecuteAutoWhenLogon = self.HasAutoExecuteList();
            jQuery.localStorage('firstLogin', 0);
            searchRetainUrlModel.Initial();
            if (isExecuteSearchWhenLogon)
                self.AutoExecuteSearch();
            if (isExecuteAutoWhenLogon && hasExecuteAutoWhenLogon)
                self.AutoExecuteList();

            // update layout
            self.UpdateLayout();

            WCNotificationsFeedCreator.Create(userModel.Data().id);

            self.HandlerSidePanel.Initial();
        }

        // callback
        if (typeof callback === 'function')
            callback();
    };
    self.AutoExecuteSearch = function () {
        var lastSearch = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL);
        if (lastSearch)
            jQuery.address.value(lastSearch);
    };
    self.AutoExecuteList = function () {
        jQuery.when(userSettingModel.LoadAutoExecuteList())
            .done(function () {
                jQuery.each(userSettingModel.AutoExecuteList(), function (index, autoExecuteList) {
                    setTimeout(function () {
                        var params = {};
                        params[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
                        WC.Utility.OpenUrlNewWindow(autoExecuteList.link + '&' + jQuery.param(params));
                    }, 3000 + index * 100);
                });
            });
    };
    self.HasAutoExecuteList = function () {
        var facetCharacteristics = ko.toJS(facetFiltersViewModel.Data()).findObject('id', 'facetcat_characteristics');
        if (facetCharacteristics) {
            var filterExecuteonlogin = facetCharacteristics.filters.findObject('id', 'facet_executeonlogin');
            if (filterExecuteonlogin && filterExecuteonlogin.count) {
                return true;
            }
        }
        return false;
    };
    self.ExecuteSearchPage = function () {
        var forceEditId = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.EDITID) || null;
        if (forceEditId !== null) {
            self.CanEditId(forceEditId === 'true');
            jQuery.localStorage('can_edit_id', self.CanEditId());
            var query = {};
            jQuery.each($.address.parameterNames(), function (index, name) {
                if (name !== enumHandlers.SEARCHPARAMETER.EDITID) {
                    query[name] = WC.Utility.UrlParameter(name);
                }
            });
            window.location.replace(WC.Utility.GetSearchPageUri(query));
            return;
        }

        if ($.address.parameterNames().length === 0) {
            self.ShowLandingPage();
        }
        else {
            self.ShowSearchResult();
        }
    };
    self.ShowLandingPage = function () {
        jQuery('#Content').busyIndicator(false);
        jQuery('#LandingPage').show().css('opacity', 0).stop();
        jQuery('#ActionSelect, #SearchResultView').addClass('disabled');
        jQuery('#SearchBar').removeClass('has-filters');
        jQuery('#SearchFilterView, #SearchSortingView, #SearchResultList').hide();
        notificationsFeedHandler.HideTopMenuIcon();
        welcomeModel.Initial()
            .always(function () {
                jQuery('#LandingPage').animate({ opacity: 1 }, 'fast');
            });
    };
    self.ShowSearchResult = function () {
        welcomeModel.StopPlayingVideo();
        jQuery('#LandingPage').hide();
        jQuery('#SearchResultList').show();
        jQuery('#SearchBar').addClass('has-filters');
        notificationsFeedHandler.ShowTopMenuIcon();
        self.BindSearchResultGrid();
    };
    self.InitialSearchBox = function () {
        // bind keyup event to search box if user enter then submit form
        var fnCheckLastSearchValue;
        var lastSearchValue = '';
        var submitSearch = function (currentValue) {
            lastSearchValue = currentValue;

            if (currentValue === decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.Q))) {
                $.address.update();
            }
            else {
                self.SubmitSearchForm();
            }

            if (currentValue) {
                jQuery('#SearchInput').removeClass('focus');
            }
        };

        var fnCheckBlur;
        jQuery('#SearchInput')
            .off('keyup')
            .on('focus', function () {
                self.ShowSearchTerms();
            })
            .on('blur', function () {
                // set the current value to the search terms list when the user blurs the input text

                var element = jQuery(this);
                element.data('using', true);
                var currentValue = jQuery.trim(element.val());
                self.SetSearchTerm(currentValue);

                clearTimeout(fnCheckBlur);
                fnCheckBlur = setTimeout(function () {
                    jQuery('#SearchInput').removeClass('focus');
                }, 300);
            })
            .on('keyup', function (event) {
                var element = jQuery(this);
                element.data('using', true);
                var currentValue = jQuery.trim(element.val());
                lastSearchValue = element.data('default');

                if (event.keyCode === 13) {
                    clearTimeout(fnCheckLastSearchValue);
                    submitSearch(currentValue);
                    event.preventDefault();
                }

                if (self.SearchMode === self.SEARCHMODE.AUTO && currentValue !== lastSearchValue) {
                    WC.Ajax.AbortAll();
                    clearTimeout(fnCheckLastSearchValue);
                    fnCheckLastSearchValue = setTimeout(function () {
                        submitSearch(currentValue);
                    }, 500);
                }
            })
            .attr('placeholder', Localization.EnterYourBusinessQuestionHere)
            .placeholder();
    };
    self.SwitchDisplay = function (type) {
        if (self.DisplayType() !== type) {

            self.DisplayType(type);

            searchRetainUrlModel.IsEnableRetailUrl = false;
            WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.VIEWMODE, type);

            var grid = jQuery('#InnerResultWrapper').data(enumHandlers.KENDOUITYPE.GRID);
            var scrollRatio = grid.virtualScrollable.verticalScrollbar.scrollTop() / grid._rowHeight;
            delete grid._rowHeight;
            grid.virtualScrollable.refresh();
            grid.virtualScrollable.verticalScrollbar.scrollTop(scrollRatio * grid._rowHeight);
            grid.refresh();
        }
    };
    self.SubmitSearchForm = function () {
        var defaultValue = jQuery('#SearchInput').data('default') || '',
            value = searchQueryModel.GetBusinessQuestionValueFromUI();
        if (defaultValue !== value) {
            if (!value) {
                var ddlSort = WC.HtmlHelper.DropdownList('#SortItemBySelect'),
                    ddlSortFirstItem;
                if (ddlSort) {
                    ddlSortFirstItem = ddlSort.dataItems()[0] || self.GetDefaultSortingOption();
                    var sort = ddlSortFirstItem.id.split('-');
                    searchQueryModel.SetSortByToUI(sort[0], sort[1] || 'asc');
                }
            }
            self.ClearAllSelectedRows();
            searchQueryModel.Search(value !== '');
        }
    };
    self.UpdateLayout = function () {
        var h = WC.Window.Height - jQuery('#MainContent').offset().top;
        jQuery('#LeftMenu .left-menu-wrapper, #Content').height(h);
        jQuery('#LandingPage').outerHeight(h - jQuery('#SearchBar').outerHeight());

        var innerResultWrapperHeight = WC.Window.Height - jQuery('#InnerResultWrapper').offset().top;
        jQuery('#InnerResultWrapper').height(innerResultWrapperHeight);

        // Grid
        self.RefreshSearchGrid();

        jQuery('.businessProcesses').each(function () {
            var handler = ko.dataFor(this);
            if (handler && handler.UpdateLayout) {
                handler.UpdateLayout(jQuery(this));
            }
        });
    };
    self.RefreshSearchGrid = function () {
        var searchGrid = jQuery('#InnerResultWrapper').data(enumHandlers.KENDOUITYPE.GRID);
        if (searchGrid) {
            searchGrid.refresh();
        }
    };
    self.GetPrivateNoteByUserSpecific = function (data, isTitle) {
        if (data.user_specific && data.user_specific.private_note && self.DisplayType() === self.DISPLAY_TYPE.DISPLAYS) {
            var rawPrivateNote = WC.HtmlHelper.StripHTML(data.user_specific.private_note);
            return isTitle ? rawPrivateNote : kendo.format(' &nbsp; <span class="PrivateNote"><strong>{0}:</strong> {1}</span>', Localization.PersonalNote, rawPrivateNote);
        }
        return '';
    };
    self.GetSignFavoriteIconCSSClass = function (data) {
        var cssClass;
        if (data.user_specific && data.user_specific.is_starred) {
            cssClass = 'icon-star-active';
        }
        else {
            cssClass = 'icon-star-inactive';
        }

        if (!data.authorizations.update_user_specific) {
            cssClass += ' disabled';
        }

        return cssClass;
    };
    self.GetPublishCSSClass = function (data) {
        return data.is_published || data.is_public ? 'none' : 'icon-private';
    };
    self.GetIsValidateCSSClass = function (data) {
        return data.is_validated ? 'icon-validated' : 'none';
    };
    self.GetItemIconCSSClassByDisplay = function (data) {
        return data.displays ? '' : 'alwaysHide';
    };
    self.GetItemIconTypeCSSClassByItem = function (selectedItem) {
        if (selectedItem.type === enumHandlers.ITEMTYPE.DASHBOARD)
            return 'icon-dashboard';
        else if (selectedItem.type === enumHandlers.ITEMTYPE.ANGLE && selectedItem.is_template)
            return 'icon-template';
        else
            return 'icon-angle';
    };
    self.SetFavoriteIconCSSClass = function (target, data) {
        target.removeClass().addClass(self.GetSignFavoriteIconCSSClass(data));
    };
    self.GetDisplayTypeCSSClass = function (data) {
        var classNames = ['icon-' + data.display_type];
        if (data.is_angle_default)
            classNames.push('default');
        if (data.used_in_task)
            classNames.push('schedule');
        return classNames.join(' ');
    };
    self.GetParameterizeCSSClass = function (data) {
        return data.is_parameterized ? 'icon-parameterized' : 'none';
    };
    self.GetWarnningCSSClass = function (data) {
        return data.has_warnings ? 'validWarning' : 'none';
    };
    self.SetFavoriteItem = function (value, event) {
        var target = jQuery(event.currentTarget);
        if (target.hasClass('disabled') || target.hasClass('loader-spinner-inline'))
            return;

        var uri = value instanceof Object ? value.uri : value;
        var model = searchModel.GetItemByUri(uri);
        if (!model)
            return;

        if (model.authorizations.update_user_specific) {
            target.removeClass('icon-star-inactive icon-star-active').addClass('loader-spinner-inline');
            searchModel.SetFavoriteItem(model)
                .done(function (data) {
                    var isStarred = false;
                    if (data.user_specific && data.user_specific.is_starred) {
                        isStarred = data.user_specific.is_starred;
                    }
                    if (model.user_specific) {
                        model.user_specific.is_starred = isStarred;
                    }
                    else {
                        var userSpecificObject = {};
                        userSpecificObject.is_starred = isStarred;
                        model.user_specific = userSpecificObject;
                    }
                    self.SetFavoriteIconCSSClass(target, model);
                    self.UpdateFavoriteItem(data);

                })
                .always(function () {
                    target.removeClass('loader-spinner-inline');
                });

            if (event.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            }
            else event.returnValue = false;
        }
    };
    self.UpdateFavoriteItem = function (model) {
        var itemGrid = jQuery("#InnerResultWrapper").data(enumHandlers.KENDOUITYPE.GRID);
        if (itemGrid) {
            var isStarredCount = model.user_specific.is_starred ? 1 : -1;
            // update grid
            jQuery.each(itemGrid.dataSource.data(), function (index, item) {
                if (item.uri === model.uri) {
                    item.user_specific.is_starred = model.user_specific.is_starred;
                }
            });

            var countResultfacetFilters = function (resultfacetfilters, isStarredCount) {
                if (resultfacetfilters.length > 0) {
                    resultfacetfilters[0].count(resultfacetfilters[0].count() + isStarredCount);
                }
            };
            // update facet
            if (facetFiltersViewModel.Data().length > 0) {
                var resultfacetitem = jQuery.grep(facetFiltersViewModel.Data(), function (facetItem) { return facetItem.id === 'facetcat_characteristics'; });
                var resultfacetitemhasvalue = resultfacetitem.length > 0 ? resultfacetitem[0] : null;
                if (resultfacetitemhasvalue !== null && resultfacetitemhasvalue.filters().length > 0) {
                    var resultfacetfilters = jQuery.grep(resultfacetitemhasvalue.filters(), function (facetfilter) {
                        return facetfilter.id === 'facet_isstarred';
                    });

                    countResultfacetFilters(resultfacetfilters, isStarredCount);
                }
            }
            itemGrid.refresh();
        }
    };

    // Sorting dropdown list
    self.BindSortingDropdown = function () {
        var isValidSorting = self.IsValidSortingDropdown();
        self.AddRelevancySortingOption();
        var datasource = self.CreateSortingDatasource();
        return self.SetSortingDatasource(datasource, isValidSorting);
    };
    self.IsValidSortingDropdown = function () {
        var isValidSorting = true;

        jQuery.each(facetFiltersViewModel.SortOptions, function (i, sort) {
            if (!sort.id) {
                facetFiltersViewModel.SortOptions[i] = self.GetDefaultSortingOption();
                isValidSorting = false;
                return false;
            }
        });

        return isValidSorting;
    };
    self.AddRelevancySortingOption = function () {
        var q = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.Q) || '';
        var hasRelevancy = jQuery.grep(facetFiltersViewModel.SortOptions, function (sortingOption) {
            return sortingOption.id === facetFiltersViewModel.SortRelevancyId;
        });

        if (q && !hasRelevancy.length) {
            facetFiltersViewModel.SortOptions.push({
                id: facetFiltersViewModel.SortRelevancyId,
                name: Localization.Relevancy
            });
        }
    };
    self.CreateSortingDatasource = function () {
        var result = [];
        jQuery.each(facetFiltersViewModel.SortOptions, function (index, sortingOption) {
            if (self.IsSortingHasDirection(sortingOption.id)) {
                if (self.IsSortingHasAscending(sortingOption.id)) {
                    var cloneSortingAsc = self.ConvertSortingToViewModel(
                        JSON.parse(JSON.stringify(sortingOption)),
                        'asc',
                        self.IsSortingHasDescending(sortingOption.id) ? Localization.Ascending : '');
                    result.push(cloneSortingAsc);
                }

                if (self.IsSortingHasDescending(sortingOption.id)) {
                    var cloneSortingDesc = self.ConvertSortingToViewModel(
                        JSON.parse(JSON.stringify(sortingOption)),
                        'desc',
                        self.IsSortingHasAscending(sortingOption.id) ? Localization.Descending : '');
                    result.push(cloneSortingDesc);
                }
            }
            else {
                var cloneSorting = JSON.parse(JSON.stringify(sortingOption));
                result.push(cloneSorting);
            }
        });
        return result;
    };
    self.ConvertSortingToViewModel = function (sorting, directionId, directionLabel) {
        sorting.id = kendo.format('{0}-{1}', sorting.id, directionId);
        sorting.name = directionLabel ? kendo.format('{0} - {1}', sorting.name, directionLabel) : sorting.name;
        return sorting;
    };
    self.IsSortingHasDirection = function (sortingId) {
        return self.IsSortingHasAscending(sortingId) ||
            self.IsSortingHasDescending(sortingId);
    };
    self.IsSortingHasAscending = function (sortingId) {
        return ['name', 'created'].indexOf(sortingId) !== -1;
    };
    self.IsSortingHasDescending = function (sortingId) {
        return ['name', 'created', 'executed'].indexOf(sortingId) !== -1;
    };
    self.GetDefaultSortingOption = function () {
        return { id: 'name-asc', name: 'Name - ascending' };
    };
    self.SetSortingDatasource = function (datasource, isValidSorting) {
        var template = '<span data-id="#: id #">#: name #</span>';
        var dropdownList = WC.HtmlHelper.DropdownList('#SortItemBySelect', datasource, {
            template: template,
            valueTemplate: template,
            select: function (e) {
                var dataItem = e.sender.dataItem(e.item);
                if (dataItem.id === e.sender.value())
                    e.preventDefault();
            },
            change: function () {
                self.ClearAllSelectedRows();
                searchQueryModel.Search();
            },
            animation: {
                close: {
                    duration: 0
                },
                open: {
                    duration: 300
                }
            }
        });

        // set enable state
        dropdownList.enable(isValidSorting);

        if (Modernizr.mouse && isValidSorting) {
            // set readonly to disable clicking
            dropdownList.readonly();

            // handle by ourselve
            dropdownList.wrapper.off('mouseenter').on('mouseenter', function () {
                dropdownList.open();
            });

            dropdownList.wrapper.off('mouseleave').on('mouseleave', function (e) {
                var container = jQuery(e.relatedTarget).closest('.k-animation-container');
                if (!container.length) {
                    dropdownList.close();
                }
                else {
                    container.one('mouseleave', function () {
                        dropdownList.close();
                    });
                }
            });
        }

        return dropdownList;
    };

    self.BindSearchResultGrid = function (scrollTop) {
        WC.Ajax.AbortAll();
        self.UpdateLayout();
        jQuery('#Content').busyIndicator(true);
        searchModel.ClearSelectedRow();
        searchModel.Items([]);
        var searchItemDataSource = self.GetSearchResultGridDataSource();

        // Bind data source with kendo grid
        var fnCheckFetching, fnCheckRequestIndicator, fnCheckRequestEnd;
        var grid = jQuery('#InnerResultWrapper').empty().kendoGrid({
            dataSource: searchItemDataSource,
            columns: ['id'],
            autoBind: false,
            rowTemplate: searchPageTemplateModel.GetItemRowTemplate(true),
            altRowTemplate: searchPageTemplateModel.GetItemRowTemplate(false),
            scrollable: {
                virtual: true
            },
            dataBound: function (e) {
                if (!e.sender.dataItems().length)
                    return;

                jQuery.each(searchModel.SelectedItems(), function (idx, item) {
                    self.SetSelectedRow(item);
                });

                self.SetResultViewEvent(e.sender.element);

                // highlight matched keywords
                self.HighlightSearchResult(e.sender.element);

                clearTimeout(fnCheckRequestEnd);
                fnCheckRequestEnd = setTimeout(function () {
                    if (!e.sender.dataSource._requestInProgress) {
                        clearInterval(fnCheckFetching);
                        fnCheckFetching = setInterval(function () {
                            if (!e.sender.virtualScrollable._fetching) {
                                clearInterval(fnCheckFetching);

                                var scrollbar = e.sender.content.find('.k-scrollbar-vertical');
                                scrollbar.trigger('scroll');
                                if (scrollTop) {
                                    scrollbar.scrollTop(scrollTop);
                                    scrollTop = null;
                                }
                            }
                        }, 10);
                    }
                }, 100);

                clearInterval(fnCheckRequestIndicator);
                fnCheckRequestIndicator = setInterval(function () {
                    if (e.sender.content.children('.k-loading-mask').length) {
                        clearInterval(fnCheckRequestIndicator);
                        e.sender.content.busyIndicator(false);
                    }
                }, 2000);
            },
            pageable: false
        }).data(enumHandlers.KENDOUITYPE.GRID);

        searchItemDataSource.read();

        grid.content
            .on('click', 'tr', function () {
                var item = grid.dataSource.getByUid(jQuery(this).data('uid'));
                if (item) {
                    searchModel.SelectRow(item);
                    self.RenderActionDropdownList();
                }
            })
            .on('click', 'a[href]', function (e) {
                if (e.ctrlKey)
                    e.stopPropagation();
            });

        self.UpdateLayout();

        // make grid continue while user is scrolling
        var virtualScroll = grid.content.data('kendoVirtualScrollable');
        grid.content
            .off('mousewheel', '.k-loading-mask')
            .on('mousewheel', '.k-loading-mask', function (e) {
                virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - e.deltaFactor * e.deltaY);

                clearInterval(fnCheckRequestIndicator);
                fnCheckRequestIndicator = setInterval(function () {
                    if (grid.content.children('.k-loading-mask').length) {
                        clearInterval(fnCheckRequestIndicator);
                        grid.content.busyIndicator(false);
                    }
                }, 2000);
            });

        if (jQuery.browser.msie) {
            grid.content
                .off('mousewheel.iefix')
                .on('mousewheel.iefix', function (e) {
                    if (!grid.content.find('.k-loading-mask').length) {
                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - e.deltaFactor * e.deltaY);
                    }
                });
        }

        // prefetching
        var numberItemInView, prefetchChecker = null;
        grid.content.find('.k-virtual-scrollable-wrap')
            .on('mousewheel', function (e) {
                if (grid.dataSource.total() / grid.dataSource.take() > 2) {
                    clearTimeout(prefetchChecker);
                    prefetchChecker = setTimeout(function () {
                        numberItemInView = Math.floor(virtualScroll.wrapper.height() / virtualScroll.itemHeight);

                        var prefetchSkip;
                        var scrollTop = !virtualScroll.itemHeight || !virtualScroll._scrollbarTop ? 0 : virtualScroll._scrollbarTop - e.deltaFactor * e.deltaY;
                        var currentRow = !virtualScroll.itemHeight ? 1 : Math.ceil(scrollTop / virtualScroll.itemHeight) + 1;

                        if (e.deltaY === -1) {
                            // scroll down
                            prefetchSkip = (Math.floor((currentRow + numberItemInView) / grid.dataSource.take()) + 1) * grid.dataSource.take();
                        }
                        else {
                            // scroll up
                            prefetchSkip = (Math.ceil(currentRow / grid.dataSource.take()) - 1) * grid.dataSource.take();
                        }

                        prefetchSkip = Math.max(0, prefetchSkip);
                        grid.dataSource.prefetch(prefetchSkip, grid.dataSource.take());

                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - e.deltaFactor * e.deltaY);
                    }, 10);
                }
            });
    };
    self.GetSearchResultGridDataSource = function () {
        var dataSourceTmp = {};
        var tempAjaxRequests = {};

        // M4-12030: WC: When default page size set to less than number of objects/angles, no way to get to the objects not shown on search page.
        var containerHeight = jQuery('#Content').height();
        var pageSize = Math.min(Math.max(systemSettingHandler.GetDefaultPageSize(), Math.ceil(containerHeight / 46)), systemSettingHandler.GetMaxPageSize());

        return new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    var requestUrl = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.ITEMS);
                    requestUrl += '?' + searchQueryModel.BuildSearchQueryForPagination(options.data.page, options.data.pageSize);
                    requestUrl += '&caching=false&viewmode=basic';

                    if (tempAjaxRequests.request && tempAjaxRequests.request.readyState !== 4) {
                        tempAjaxRequests.request.abort();
                    }

                    if (dataSourceTmp[options.data.page]) {
                        options.success(dataSourceTmp[options.data.page]);
                        return;
                    }

                    var getData = function () {
                        return GetDataFromWebService(requestUrl)
                            .fail(function (xhr, status, error) {
                                self.SearchItemFail();

                                var gridObject = jQuery('#InnerResultWrapper').data(enumHandlers.KENDOUITYPE.GRID);
                                if (options.error) {
                                    options.error(xhr, status, error);
                                }
                            })
                            .done(function (result) {
                                var newdataRows = result.items;
                                jQuery.each(newdataRows, function (index, item) {
                                    WC.ModelHelper.ExtendAuthorization(item);
                                });

                                if (result.header.total && WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) === "executed") {
                                    var amountPage = Math.ceil(result.header.total / 30);
                                    if (options.data.page === amountPage)
                                        newdataRows.push({});
                                }

                                searchModel.Items.push.apply(searchModel.Items, newdataRows);

                                self.SearchItemSuccess(result);

                                dataSourceTmp[options.data.page] = newdataRows;

                                options.success(newdataRows);
                            });
                    };

                    tempAjaxRequests = {
                        url: requestUrl,
                        request: getData()
                    };
                }
            },
            schema: {
                total: function () {
                    return searchModel.TotalItems();
                }
            },
            pageSize: pageSize,
            serverPaging: true
        });
    };
    self.SearchItemFail = function () {
        searchQueryModel.SetUIControlFromUrl();
    };
    self.SearchItemSuccess = function (data) {
        defaultValueHandler.CheckAndExtendProperties(data.items, enumHandlers.VIEWMODELNAME.SEARCHMODEL, true);

        if (data.header.total && WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT) === 'executed')
            searchModel.TotalItems(data.header.total + 1);
        else
            searchModel.TotalItems(data.header.total);

        if ($.address.parameterNames().length > 0) {
            facetFiltersViewModel.ShowOtherFacetFilterProperties(true);
        }
        else {
            facetFiltersViewModel.ShowOtherFacetFilterProperties(false);
        }

        // set facet
        if (data.facets) {
            jQuery('#ActionSelect, #SearchResultView').removeClass('disabled');
            jQuery('#SearchFilterView, #SearchSortingView').show();

            facetFiltersViewModel.SetFacetAndSort(data);
            self.RenderActionDropdownList();
            self.BindSortingDropdown();
            createNewAngleViewManagementModel.UpdateCreateNewAngleButton();
            searchQueryModel.SetUIControlFromUrl();
        }

        jQuery('#ResultWrapper .grid-no-data').remove();
        if (!searchModel.TotalItems()) {
            jQuery('<div class="grid-no-data">' + Localization.NoSearchResult + '</div>').appendTo('#ResultWrapper');
        }

        jQuery('#Content').busyIndicator(false);
    };
    self.SetResultViewEvent = function (element) {
        if (self.DisplayType() !== self.DISPLAY_TYPE.DISPLAYS)
            return;

        element.find('.ResultView')
            .off('mousewheel.displaysview')
            .on('mousewheel.displaysview', function (e) {
                var displayListContainer = jQuery(e.currentTarget);
                if (displayListContainer.height() < displayListContainer.children().height()) {
                    displayListContainer.scrollTop(displayListContainer.scrollTop() - e.deltaY * 30);
                    e.stopPropagation();
                }
            });

        WC.HtmlHelper.SetTouchScrollEvent(element.find('.ResultView'));
    };
    self.HighlightSearchResult = function (element) {
        element.removeHighlight();
        if (self.DisplayType() !== self.DISPLAY_TYPE.COMPACT) {
            // don't highlight on compact mode
            var searchText = WC.Utility.GetParameterByName(enumHandlers.SEARCHPARAMETER.Q);
            var highlightElements = element.find('.ResultContent .name, .ResultContent .ContentDetail, .ResultContent .PrivateNote');
            highlightElements.highlighter(searchText);
        }
    };
    self.InitialUserPrivileges = function () {
        userModel.SetCreateAngleButton();
        userModel.SetManagementControlButton();
        userModel.SetWorkbenchButton();

        if (!privilegesViewModel.IsAllowAdvanceSearch())
            jQuery('#SearchButton').addClass('alwaysHide');
    };

    // action dropdown
    self.GetActionDropdownDataSource = function () {
        var data = [];
        jQuery.each(enumHandlers.SEARCHACTION, function (key, action) {
            data.push({
                Id: action.Id,
                Text: action.Text,
                Enable: false,
                Visible: true
            });
        });

        // check enable state
        if (searchModel.Items().length) {
            data.findObject('Id', enumHandlers.SEARCHACTION.SELECTALL.Id).Enable = true;
        }

        var canCreateAngle = privilegesViewModel.IsAllowCreateAngle();
        if (searchModel.SelectedItems().length) {
            data.findObject('Id', enumHandlers.SEARCHACTION.DESELECT.Id).Enable = true;

            var allowedMenuList = [
                enumHandlers.SEARCHACTION.EXECUTEDASHBOARD.Id,
                enumHandlers.SEARCHACTION.MASSCHANGE.Id,
                enumHandlers.SEARCHACTION.DELETE.Id,
                enumHandlers.SEARCHACTION.CREATEEAPACKAGE.Id,
                enumHandlers.SEARCHACTION.COPYANGLE.Id
            ];
            if (!canCreateAngle) {
                // not allow copy angle and delete item menu when no permission to create a new angle
                var copyAngleIndex = allowedMenuList.indexOf(enumHandlers.SEARCHACTION.COPYANGLE.Id);
                allowedMenuList.splice(copyAngleIndex, 1);

                if (!self.IsDeleteMenuEnabled()) {
                    var deleteItemIndex = allowedMenuList.indexOf(enumHandlers.SEARCHACTION.DELETE.Id);
                    allowedMenuList.splice(deleteItemIndex, 1);
                }
            }

            // set states
            jQuery.each(allowedMenuList, function (index, actionId) {
                data.findObject('Id', actionId).Enable = true;
            });
        }

        if (canCreateAngle) {
            data.findObject('Id', enumHandlers.SEARCHACTION.UPLOADANGLES.Id).Enable = true;
        }

        if (!privilegesViewModel.IsAllowExecuteDashboard()) {
            data.findObject('Id', enumHandlers.SEARCHACTION.EXECUTEDASHBOARD.Id).Enable = false;
        }

        return data;
    };
    self.RenderActionDropdownList = function () {
        // data
        var data = self.GetActionDropdownDataSource();

        // html
        WC.HtmlHelper.ActionMenu.CreateActionMenuItems('#ActionDropdownListPopup .k-window-content', '#ActionDropdownListTablet', data, self.CallActionDropdownFunction);

        // action menu responsive
        WC.HtmlHelper.ActionMenu('#ActionSelect', true);
    };
    self.CallActionDropdownFunction = function (element, selectedValue) {
        if (jQuery(element).hasClass('disabled'))
            return;

        switch (selectedValue) {
            case enumHandlers.SEARCHACTION.DELETE.Id:
                self.DeleteItems();
                break;

            case enumHandlers.SEARCHACTION.MASSCHANGE.Id:
                massChangeModel.ShowMassChangePopup();
                break;

            case enumHandlers.SEARCHACTION.EXECUTEDASHBOARD.Id:
                self.ExecuteDashboard();
                break;

            case enumHandlers.SEARCHACTION.SELECTALL.Id:
                self.SelectAllItems();
                break;

            case enumHandlers.SEARCHACTION.DESELECT.Id:
                self.ClearAllSelectedRows();
                break;

            case enumHandlers.SEARCHACTION.UPLOADANGLES.Id:
                importAngleHandler.ShowImportAnglePopup();
                break;
            case enumHandlers.SEARCHACTION.CREATEEAPACKAGE.Id:
                angleExportHandler.DownloadItems();
                break;

            case enumHandlers.SEARCHACTION.COPYANGLE.Id:
                angleCopyHandler.ShowAngleCopyPopup();
                break;

            default:
                break;
        }
    };
    self.DeleteItems = function () {
        var fnCheckCancelAbort;
        var angles = [], dashboards = [], unauthorized = [], isCancel = false, canCancel = false,
            reports = {
                delete_error: [],
                delete_unauthorized: [],
                delete_done: [],
                last_xhr: null
            };
        if (!searchModel.SelectedItems().length) {
            popup.Alert(Localization.Warning_Title, Localization.Info_AtLeastOneItemBeforeDelete);
            return false;
        }

        searchModel.SetValidDeleteItems(angles, dashboards);

        var deleteItemCount = angles.length + dashboards.length;
        var deleteQuestion = kendo.format(Localization.Confirm_AreYouSureToDeleteItems, deleteItemCount + unauthorized.length);
        var bindSearchResultGrid = function () {
            progressbarModel.EndProgressBar();
            searchModel.ClearSelectedRow();

            setTimeout(function () {
                self.BindSearchResultGrid(0);
            }, 500);
        };
        var updateDeleteProgress = function () {
            if (!isCancel || canCancel) {
                var currentDeleteCount = reports.delete_error.length + reports.delete_done.length;
                progressbarModel.SetProgressBarText((currentDeleteCount / deleteItemCount * 100).toFixed(2), currentDeleteCount + '/' + (deleteItemCount + unauthorized.length), Localization.ProgressBar_DeletingItems);
            }
        };
        var startProgress = function () {
            progressbarModel.ShowStartProgressBar();
            progressbarModel.CancelCustomHandler = true;
            progressbarModel.CancelFunction = function () {
                progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Cancelling);
                progressbarModel.SetDisableProgressBar();
                isCancel = true;

                fnCheckCancelAbort = setTimeout(function () {
                    WC.Ajax.AbortAll();
                }, 5000);

                return true;
            };

            updateDeleteProgress();
        };
        var deleteItem = function (item, forced, isBeginSession) {
            if (isCancel && isBeginSession) {
                canCancel = true;
            }

            return jQuery.when(
                isCancel && canCancel
                    ? jQuery.Deferred().reject({}, Localization.AbortStatus, Localization.CancelledByUser)
                    : searchModel.DeleteItemByUrl(item.uri, forced)
            )
                .done(function (data, status, xhr) {
                    reports.last_xhr = xhr;
                    reports.delete_done.push('- [' + item.type + '] ' + WC.HtmlHelper.StripHTML(item.name) + ': <em class="ok">' + Localization.Successful + '</em><br/>');
                })
                .fail(function (xhr, status, error) {
                    reports.last_xhr = xhr;

                    var errorMessage = WC.Utility.ParseJSON(xhr.responseText, { reason: status, message: error });

                    var message = errorMessage.message;
                    if (resolveAngleDisplayHandler.IsConflictAngleDisplay(xhr))
                        message = Localization.ResolveAngleDisplay_UsedInAutomationTask;

                    reports.delete_error.push('- [' + item.type + '] ' + WC.HtmlHelper.StripHTML(item.name) + ': <em>' + errorMessage.reason + ', ' + message + '</em><br/>');
                })
                .always(function () {
                    updateDeleteProgress();
                });
        };
        var showDeleteReport = function () {
            jQuery.each(unauthorized, function (index, item) {
                reports.delete_unauthorized.push('- [' + item.type + '] ' + WC.HtmlHelper.StripHTML(item.name) + ': <em>' + Localization.Unauthorized + '</em><br/>');
            });

            var deleteDoneCount = reports.delete_done.length;
            var deleteErrorCount = reports.delete_error.length;
            var deleteUnauthorizedCount = reports.delete_unauthorized.length;
            var message = kendo.format(Localization.Info_ReportDeleteItem + '<br/>', deleteDoneCount, deleteDoneCount + deleteErrorCount + deleteUnauthorizedCount);
            searchModel.TotalItems(searchModel.TotalItems() - deleteDoneCount);

            var popupName = 'Report';
            var popupSettings = {
                title: Localization.Title_ReportDeleteItem,
                element: '#popup' + popupName,
                className: 'popup' + popupName,
                actions: ["Maximize"],
                buttons: [
                    {
                        text: Localization.Ok,
                        position: 'right',
                        isPrimary: true,
                        click: 'close'
                    }
                ]
            };

            var win = popup.Show(popupSettings);
            win.content(message + reports.delete_done.join('') + reports.delete_unauthorized.join('') + reports.delete_error.join(''));
            win.center();
        };
        var deleteItemsAndShowReport = function (forced) {
            errorHandlerModel.Enable(false);
            startProgress();

            reports.delete_error = [];
            reports.delete_unauthorized = [];
            reports.delete_done = [];
            reports.last_xhr = null;

            var deleteItemPerSession = 5;
            var deferredNotDashboards = [], defferredDashboards = [];
            jQuery.each(dashboards, function (index, item) {
                defferredDashboards.pushDeferred(deleteItem, [item, forced, index % deleteItemPerSession === 0]);
            });

            jQuery.each(angles, function (index, item) {
                deferredNotDashboards.pushDeferred(deleteItem, [item, forced, index % deleteItemPerSession === 0]);
            });

            var isSingleDeletion = angles.length === 1 && dashboards.length === 0 && unauthorized.length === 0;

            jQuery.whenAllSet(defferredDashboards, deleteItemPerSession)
                .then(function () {
                    var deferred = jQuery.Deferred();

                    setTimeout(function () {
                        jQuery.whenAllSet(deferredNotDashboards, deleteItemPerSession)
                            .always(function () {
                                deferred.resolve();
                            });
                    }, forced ? 0 : 2000);

                    return deferred.promise();
                })
                .always(function () {
                    clearTimeout(fnCheckCancelAbort);
                    setTimeout(function () {
                        errorHandlerModel.Enable(true);

                        if (isSingleDeletion && resolveAngleDisplayHandler.IsConflictAngleDisplay(reports.last_xhr)) {
                            var resolveAngleDisplayCallback = function () {
                                deleteItemsAndShowReport(true);
                            };
                            resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup(reports.last_xhr, resolveAngleDisplayCallback);
                        }
                        else {
                            bindSearchResultGrid();
                            showDeleteReport();
                        }
                    }, 100);
                });
        };
        var renderConfirmationPopup = function () {
            popup.Confirm(deleteQuestion, function () {
                deleteItemsAndShowReport(false);
            });
        };

        //check permission
        if (!deleteItemCount) {
            popup.Alert(Localization.Warning_Title, Localization.Info_NoPermissionToDeleteAngles);
            return false;
        }

        renderConfirmationPopup();
    };
    self.ClearSelectedRowClass = function (item) {
        var row = jQuery('tr[data-uri="' + item.uri + '"]');
        var nextrow = row.next();
        row.removeClass('k-state-selected').attr('aria-selected', false);
        if (nextrow.length && jQuery(nextrow[0]).hasClass('k-state-selected')) {
            jQuery(nextrow[0]).find('td').removeClass('td-no-top-border');
        }
        else {
            jQuery(nextrow[0]).find('td').addClass('td-no-top-border');
        }
    };
    self.ClearAllSelectedRows = function () {
        searchModel.ClearSelectedRow();
        self.RenderActionDropdownList();

        jQuery('#InnerResultWrapper .k-state-selected').removeClass('k-state-selected').attr('aria-selected', false);
    };
    self.SelectAllItems = function () {
        if (searchModel.TotalItems() <= maxNumberOfMassChangeItems) {
            searchModel.SelectedItems.removeAll();
            var grid = jQuery('#InnerResultWrapper').data(enumHandlers.KENDOUITYPE.GRID);
            if (grid) {
                grid.dataSource.enableRequestsInProgress();
                WC.HtmlHelper.GridPrefetch(grid, 0, function () {
                    var fnCheckGetAllItems = setInterval(function () {
                        if (!grid.dataSource._requestInProgress) {
                            clearInterval(fnCheckGetAllItems);
                            self.SetSelectedAll(grid.dataSource);
                            self.RenderActionDropdownList();
                            grid.content.busyIndicator(false);
                        }
                    }, 100);
                });
            }
        }
        else {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_ReachMaximumItems, maxNumberOfMassChangeItems));
        }
    };
    self.SetSelectedAll = function (dataSource) {
        jQuery.each(dataSource._ranges, function (index, range) {
            jQuery.each(range.data, function (index, item) {
                if (item.uri) {
                    self.SetSelectedRow(item);
                    if (item.toJSON) {
                        searchModel.SelectedItems.push(item.toJSON());
                    }
                    else {
                        searchModel.SelectedItems.push(ko.toJS(item));
                    }
                }
            });
        });
    };
    self.SetSelectedRow = function (item) {
        if (item.uri) {
            var row = jQuery('tr[data-uri="' + item.uri + '"]');
            var nextrow = row.next();
            var previousrow = row.prev();
            row.addClass('k-state-selected').attr('aria-selected', true);
            if (previousrow.length && jQuery(previousrow[0]).hasClass('k-state-selected')) {
                row.find('td').addClass('td-no-top-border');
            }
            else {
                row.find('td').removeClass('td-no-top-border');
            }

            if (nextrow.length && jQuery(nextrow[0]).hasClass('k-state-selected')) {
                nextrow.find('td').addClass('td-no-top-border');
            }
            else {
                nextrow.find('td').removeClass('td-no-top-border');
            }
        }
    };
    self.IsDeleteMenuEnabled = function () {
        var isEnabled = false;
        jQuery.each(searchModel.SelectedItems(), function (index, selectedItem) {
            if (userModel.Data().uri === selectedItem.created.user) {
                isEnabled = true;
                return false;
            }
        });
        return isEnabled;
    };

    // dashboard
    self.ExecuteDashboard = function () {
        var handler = new DashboardExecutionHandler();
        handler.Models = self.GetAllModels();
        handler.Execute(ko.toJS(searchModel.SelectedItems()));
    };
    self.GetAllModels = function () {
        var facets = WC.Utility.ToArray(ko.toJS(facetFiltersViewModel.Data()));
        var facetModel = facets.findObject('id', 'facetcat_models');
        return facetModel ? facetModel.filters : [];
    };

    // popup info
    self.ShowBaseClassInfoPopup = function (element, modelUri) {
        element = jQuery(element);
        helpTextHandler.ShowHelpTextPopup(element.data('id'), helpTextHandler.HELPTYPE.CLASS, modelUri);
    };
    self.ShowDashboardExecutionParameterPopup = function (dashboard, executionsInfo) {
        var executionParameter = new ExecutionParameterHandler(executionsInfo.angle, executionsInfo.display);
        executionParameter.ShowPopupAfterCallback = function (e) {
            e.sender.element.find('.section-display .row-title .form-col-header').text(Localization.DashboardName);
        };
        executionParameter.ShowExecutionParameterPopup();

        // override method
        executionParameter.SubmitExecutionParameters = function (option) {
            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);

            var query = {};
            // M4-33874 keep parameterized to local storage (bug fixed in IE an Edge)
            jQuery.localStorage(enumHandlers.DASHBOARDPARAMETER.ASK_EXECUTION, option.displayQuery.execution_parameters);
            if (dashboardModel.IsTemporaryDashboard(dashboard.uri)) {
                query[enumHandlers.DASHBOARDPARAMETER.NEW] = true;
            }
            window.location.href = WC.Utility.GetDashboardPageUri(dashboard.uri, query);
        };
        executionParameter.CancelExecutionParameters = jQuery.noop;
    };
    self.ShowDisplays = function (event, target, uri, totalDisplays) {
        if (event && event.stopPropagation)
            event.stopPropagation();

        // create container
        target = jQuery(target);
        var container = itemInfoHandler.CreateShowDisplaysElement(target, totalDisplays);
        var contentElement = container.children('.k-window-content');

        // render displays
        var angle = searchModel.GetItemByUri(uri);
        var html = self.GetDisplaysListHtmlFromItem(angle, 'small');
        contentElement.html(html);

        jQuery('#InnerResultWrapper .k-scrollbar').off('scroll.showdisplays').on('scroll.showdisplays', function () {
            itemInfoHandler.HideDisplays();
        });
    };
    self.GetDisplaysListHtmlFromItem = function (angle, extraCssClass) {
        var displays = JSON.parse(JSON.stringify(WC.Utility.ToArray(angle.displays)));
        displays.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
        var html = ['<ul class="detailDefinitionList listview display-listview">'];
        jQuery.each(displays, function (index, display) {
            display.__angle_uri = angle.uri;
            display.__angle_is_template = angle.is_template;
            var template = [
                '<li class="listview-item" onclick="searchPageHandler.ClickDisplay(event)">',
                '<div class="displayNameContainer ' + extraCssClass + '">',
                '<div class="front">',
                '<i class="icon #= searchPageHandler.GetDisplayTypeCSSClass(data) #"></i>',
                '</div>',
                '<a class="name nameLink"  data-showwhenneed="true" data-role="tooltip" data-tooltip-text="#: data.name #" data-tooltip-position="bottom"',
                ' href="#= searchModel.GetDisplayHrefUri(data.__angle_uri, data.uri, data.__angle_is_template) #"',
                ' onclick="return searchModel.ItemLinkClicked(event, \'#: data.__angle_uri #\', null, \'#: data.uri #\')">',
                '#: data.name #</a>',
                '<div class="rear">',
                '<i class="icon #= searchPageHandler.GetWarnningCSSClass(data) #"></i>',
                '<i class="icon #= searchPageHandler.DisplayType() !== searchPageHandler.DISPLAY_TYPE.DISPLAYS ? searchPageHandler.GetPublishCSSClass(data): \"none\" #"></i>',
                '<i class="icon #= searchPageHandler.GetParameterizeCSSClass(data) #"></i>',
                '</div>',
                '</div>',
                '</li>'
            ].join('');
            var templateFunction = kendo.template(template);
            html.push(templateFunction(display));
        });
        html.push('</ul>');
        return html.join('');
    };
    self.ClickDisplay = function (e) {
        if (!jQuery(e.target || e.srcElement).hasClass('name'))
            jQuery(e.currentTarget).find('.name').trigger('click');
    };

    // search terms
    self.ShowSearchTerms = function () {
        var html = self.GetSearchTermsHtmlFromItem();
        jQuery('#SearchInput').addClass('focus');
        jQuery('#SearchTerm').html(html);
    };

    self.SetSearchTerm = function (value) {
        if (value) {
            self.SearchTerms.unshift(value);
            self.SearchTerms = self.SearchTerms.distinct();
            self.SearchTerms.splice(self.MaxSearchTerms, self.SearchTerms.length);
        }
    };

    self.SubmitSearchBySearchTerm = function (element) {
        var searchTerm = jQuery(element).text();
        self.SetSearchTerm(searchTerm);
        jQuery('#SearchInput').val(searchTerm);
        self.SubmitSearchForm();
    };

    self.GetSearchTermsHtmlFromItem = function () {
        var html = ['<ul class="listview listview-popup">'];
        jQuery.each(self.SearchTerms, function (index, searchTerm) {
            var data = { text: searchTerm, index: index };
            var template = '<li class="listview-item" onclick="searchPageHandler.SubmitSearchBySearchTerm(this);"><div class="text-ellipsis">#: text #</div></li>';
            var templateFunction = kendo.template(template);
            html.push(templateFunction(data));
        });
        html.push('</ul>');
        return html.join('');
    };

    // popup advanced filter
    self.ShowAdvancedFilters = function () {
        jQuery('#SearchButton').removeClass('active');
        if (jQuery('#popupAdvanceFilter').is(':visible')) {
            // hide popup
            popup.CloseAll();
            return;
        }

        // show popup
        var popupName = 'AdvanceFilter';
        var popupSettings = {
            element: '#popup' + popupName,
            html: advanceFilterHtmlTemplate(),
            className: 'popup' + popupName,
            width: 700,
            maxWidth: 700,
            height: 425,
            appendTo: '#Search',
            center: false,
            modal: false,
            position: {
                left: 1,
                top: 71
            },
            scrollable: false,
            resizable: false,
            draggable: false,
            buttons: [
                {
                    text: Captions.Button_Search,
                    isSecondary: true,
                    click: self.SearchOnAdvance,
                    position: 'right'
                }
            ],
            open: function (e) {
                e.sender.element.css('overflow', 'visible');
                setTimeout(function () {
                    jQuery(document).off('click.advfilter').on('click.advfilter', function (evt) {
                        var target = jQuery(evt.target);
                        var isAdvSearchButton = target.closest('#SearchButton').length || target.is('#SearchButton');
                        if (!isAdvSearchButton && !target.closest('.popupAdvanceFilter').length && !target.closest('.k-animation-container').length)
                            e.sender.close();
                    });
                });
                jQuery('#SearchButton').addClass('active');
                self.InitialAdvSearchUI(e);
                searchQueryModel.SetUIOfAdvanceSearchFromParams();
                e.sender.element.find('[data-role="dropdownlist"]').each(function () {
                    var dropdown = WC.HtmlHelper.DropdownList(this);
                    dropdown.trigger('change');
                });
            },
            close: function () {
                jQuery('#SearchButton').removeClass('active');
                jQuery(document).off('click.advfilter');
            }
        };

        popup.Show(popupSettings);
    };
    self.SearchOnAdvance = function (e) {
        if (e.kendoWindow.wrapper.hasClass('popup-initialized')) {
            searchQueryModel.Search(false);
            e.kendoWindow.close();
        }
    };
    self.InitialAdvSearchUI = function (e) {
        if (jQuery('#createdFilter').hasClass('k-input'))
            return;

        self.InitialAdvSearchDatepicker();
        self.InitialCreatorAutoComplete();
        self.InitialLastChangedAutoComplete();
        self.InitialLastExecutorAutoComplete();
        self.InitialValidatorAutoComplete();
        self.InitialIdsTextbox();
        self.InitialTextboxes();

        jQuery('#textNumberExcutes').kendoNumericTextBox({
            value: 0,
            min: 0,
            max: 999999,
            step: 1,
            format: "#",
            decimals: 0
        });
        var numberExcutes = jQuery('#textNumberExcutes').data("kendoNumericTextBox");
        if (numberExcutes) {
            numberExcutes._text.attr('required', true);
            numberExcutes.enable(false);
        }

        var usageOperators = [
            { Id: 1, Value: Localization.AdvanceFilterUsageOperatorOn },
            { Id: 2, Value: Localization.AdvanceFilterUsageOperatorAfter },
            { Id: 3, Value: Localization.AdvanceFilterUsageOperatorBefore },
            { Id: 4, Value: Localization.AdvanceFilterUsageOperatorBetween }
        ];
        jQuery('.dropdownUsageOperators').each(function () {
            self.InitialAdvSearchDropdown(this, usageOperators, {
                dataTextField: "Value",
                dataValueField: "Id",
                optionLabel: { Id: 0, Value: Localization.PleaseSelect },
                change: self.UsageOperatorChange
            });
        });

        var numberOperators = [
            { Id: 1, Value: Localization.AdvanceFilterUsageOperatorEqualTo },
            { Id: 2, Value: Localization.AdvanceFilterUsageOperatorLargerThan },
            { Id: 3, Value: Localization.AdvanceFilterUsageOperatorSmallerThan }
        ];
        self.InitialAdvSearchDropdown('.dropdownNumberExcutes', numberOperators, {
            dataTextField: "Value",
            dataValueField: "Id",
            optionLabel: { Id: 0, Value: Localization.AdvanceFilterUsageNumberOfExecutes },
            change: self.NumberOperatorChange
        });

        WC.HtmlHelper.ApplyKnockout(self, e.sender.wrapper);
    };
    self.InitialAdvSearchDatepicker = function () {
        jQuery('.popupAdvFiltering .Datepicker').each(function (idx, obj) {
            obj = jQuery(obj);
            obj.kendoDatePicker({
                open: function (e) {
                    e.sender.dateView.div.addClass('k-calendar-container-light');
                },
                change: function (e) {
                    var currentDate = new Date();
                    var currentInput = e.sender.element;
                    if (currentInput.hasClass('datepickerFrom')) {
                        var datepickerTo = e.sender.element.closest('.popupAdvFilteringContent').find('input.datepickerTo').data(enumHandlers.KENDOUITYPE.DATEPICKER);
                        if (currentInput.val()) {
                            datepickerTo.min(currentInput.val());
                        }
                        else {
                            datepickerTo.min(new Date(1900, 1, 1));
                        }
                    }
                    else {
                        var datepickerFrom = e.sender.element.closest('.popupAdvFilteringContent').find('input.datepickerFrom').data(enumHandlers.KENDOUITYPE.DATEPICKER);
                        if (currentInput.val()) {
                            datepickerFrom.max(currentInput.val());
                        }
                        else {
                            datepickerFrom.max(currentDate);
                        }
                    }
                },
                max: new Date()
            }).closest('.k-widget').addClass(obj.data('datepicker-class'));

            var datepicker = obj.data(enumHandlers.KENDOUITYPE.DATEPICKER);
            if (datepicker) {
                datepicker.enable(false);
            }
        });
    };
    self.InitialAdvSearchDropdown = function (target, data, options) {
        options.__open = options.open || jQuery.noop;
        delete options.open;
        options.open = function (e) {
            e.sender.list.addClass('k-list-container-light');
            options.__open(e);
        };

        options.__change = options.change || jQuery.noop;
        delete options.change;
        options.change = function (e) {
            if (e.sender.options.optionLabel && e.sender.value() > 0) {
                e.sender.wrapper.addClass('clearable');
            }
            else {
                e.sender.wrapper.removeClass('clearable');
            }
            options.__change(e);
        };

        var dropdown = WC.HtmlHelper.DropdownList(target, data, options);
        if (dropdown.options.optionLabel) {
            var btnRemove = jQuery('<span class="k-clear-select"><span class="icon remove"></span></span>').on('click', function (e) {
                e.stopPropagation();
                dropdown.value(0);
                dropdown.trigger('change');
            });
            dropdown.wrapper.find('.k-select').before(btnRemove);
            dropdown.clearButton = btnRemove;
        }
        return dropdown;
    };
    self.InitialAdvSearchAutoComplete = function (elementId, options) {
        var settings = jQuery.extend({
            dataTextField: 'id',
            ignoreCase: true,
            minLength: 1,
            filter: 'contains',
            open: function (e) {
                e.sender.list.addClass('k-list-container-light');
            },
            dataSource: new kendo.data.DataSource({
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        var requestUri = '/users';
                        var userParams = {};
                        userParams[enumHandlers.PARAMETERS.Q] = jQuery.trim(jQuery('#' + elementId).val());
                        userParams[enumHandlers.PARAMETERS.OFFSET] = 0;
                        userParams[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();

                        GetDataFromWebService(requestUri, userParams)
                            .done(function (result) {
                                options.success(result.users);
                            })
                            .fail(function () {
                                options.success([]);
                            });
                    }
                }
            })
        }, options || {});

        jQuery('#' + elementId).kendoAutoComplete(settings);
    };
    self.InitialCreatorAutoComplete = function () {
        self.InitialAdvSearchAutoComplete('createdFilter');
    };
    self.InitialLastChangedAutoComplete = function () {
        self.InitialAdvSearchAutoComplete('lastChangedFilter');
    };
    self.InitialLastExecutorAutoComplete = function () {
        self.InitialAdvSearchAutoComplete('executeFilter');
    };
    self.InitialValidatorAutoComplete = function () {
        self.InitialAdvSearchAutoComplete('validateFilter');
    };
    self.InitialIdsTextbox = function () {
        var fnCheckPaste = function (element) {
            var value = element.val();
            if (/[^\w\*]+/ig.test(value)) {
                element.val(value.replace(/[^\w\*]+/ig, ''));
            }
        };

        jQuery('#ids')
            .on('keydown', function (e) {
                var keySets = [
                    // Allow: backspace, delete, tab, escape
                    jQuery.inArray(e.keyCode, [46, 8, 9, 27]) !== -1,

                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    jQuery.inArray(e.keyCode, [65, 67, 86, 88]) !== -1 && e.ctrlKey,

                    // Allow: home, end, left, right, down, up
                    e.keyCode >= 35 && e.keyCode <= 40
                ];
                if (WC.Utility.MatchAny(true, keySets)) {
                    // let it happen, don't do anything
                    return;
                }

                // Ensure that it is a alphanumeric and stop the keypress
                var isFF = jQuery.browser.mozilla;
                var isUnderScore = !isFF && e.keyCode === 189 || isFF && e.keyCode === 173;
                var allowKeySets = [
                    // allow 0 - 9 (keyboard)
                    !e.shiftKey && e.keyCode >= 48 && e.keyCode <= 57,

                    // allow 0 - 9 (numpad)
                    !e.shiftKey && e.keyCode >= 96 && e.keyCode <= 105,

                    // allow _ (keyboard)
                    e.shiftKey && isUnderScore,

                    // allow * (keyboard)
                    e.shiftKey && e.keyCode === 56,

                    // allow * (numpad)
                    e.keyCode === 106,

                    // allow a - z (keyboard)
                    e.keyCode >= 65 && e.keyCode <= 90
                ];
                if (!WC.Utility.MatchAny(true, allowKeySets)) {
                    e.preventDefault();
                }
            })
            .on('keyup blur', function () {
                fnCheckPaste(jQuery(this));
            })
            .on('paste', function () {
                var element = jQuery(this);

                // clean up paste text
                setTimeout(function () {
                    fnCheckPaste(element);
                }, 1);
            });
    };
    self.InitialTextboxes = function () {
        jQuery('#popupAdvanceFilter input[type="text"]').off('change').on('change', function () {
            var input = jQuery(this);
            if (jQuery.trim(input.val())) {
                input.addClass('focused');
                input.closest('.k-widget').addClass('focused');
            }
            else {
                input.removeClass('focused');
                input.closest('.k-widget').removeClass('focused');
            }
        });
    };
    self.UsageOperatorChange = function (ele) {
        var elementContainer = ele.sender.element.closest('.popupAdvFilteringContent');
        var datepickerFromOriginalControl = elementContainer.find('input.datepickerFrom');
        var datepickerFrom = datepickerFromOriginalControl.data(enumHandlers.KENDOUITYPE.DATEPICKER);
        var datepickerToOriginalControl = elementContainer.find('input.datepickerTo');
        var datepickerTo = datepickerToOriginalControl.data(enumHandlers.KENDOUITYPE.DATEPICKER);

        var maxDate = new Date();
        var usageOperator = ele.sender.value();
        if (usageOperator <= 0) {
            // nothing
            datepickerFrom.enable(false);
            datepickerFrom.element.attr('placeholder', '-');
            datepickerFrom.min(new Date(1900, 1, 1));
            datepickerFrom.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 0, 0));
            datepickerFrom.value('');
            datepickerTo.enable(false);
            datepickerTo.element.attr('placeholder', '-');
            datepickerTo.min(new Date(1900, 1, 1));
            datepickerTo.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 0, 0));
            datepickerTo.value('');
        }
        else if (usageOperator === 1 || usageOperator === 2 || usageOperator === 3) {
            // on, after, before
            maxDate = new Date();

            datepickerFrom.element.attr('placeholder', ele.sender.text());
            datepickerFrom.enable(true);
            datepickerFrom.min(new Date(1900, 1, 1));
            datepickerFrom.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 0, 0));
            datepickerTo.enable(false);
            datepickerTo.element.attr('placeholder', '-');
            datepickerTo.min(new Date(1900, 1, 1));
            datepickerTo.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 0, 0));
            datepickerTo.value('');
        }
        else if (usageOperator === 4) {
            // between
            datepickerFrom.enable(true);
            datepickerFrom.element.attr('placeholder', Localization.AdvanceFilterUsageTextFrom);
            datepickerTo.enable(true);
            datepickerTo.element.attr('placeholder', Localization.AdvanceFilterUsageTextTo);
        }
    };
    self.NumberOperatorChange = function (e) {
        jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(e.sender.value() > 0);
    };
    self.SaveClientSettings = function () {
        var additionalRequests = [];

        var clientSettingsRequest = userSettingModel.GetClientSettingsData();
        if (clientSettingsRequest) {
            userSettingModel.UpdateClientSettings(JSON.parse(clientSettingsRequest.data));
            additionalRequests.push(clientSettingsRequest);
        }

        var sidePanelSettingsData = userSettingModel.GetSidePanelSettingsData();
        if (sidePanelSettingsData) {
            userSettingModel.UpdateClientSettings(JSON.parse(sidePanelSettingsData.data));
            additionalRequests.push(sidePanelSettingsData);
        }

        WC.Ajax.ExecuteBeforeExit(additionalRequests, true);
    };
    /*EOF: Model Methods*/

    // initialize method
    if (typeof isLoginPage === 'undefined') {
        var canEditId = jQuery.localStorage('can_edit_id');
        self.CanEditId = ko.observable(canEditId === null ? window.showAngleAndDisplayID : canEditId);

        self.InitialSearchPage();
        jQuery(function () {
            self.InitialSearchPageCallback();
        });
        jQuery(window).off('resize.search').on('resize.search', function () {
            if (!jQuery.isReady)
                return;

            self.UpdateLayout();
        });

        jQuery(window).off('beforeunload.search').on('beforeunload.search', function () {
            // save client settings to user settings
            self.SaveClientSettings();
            return;
        });
    }
};
var searchPageHandler = new SearchPageHandler();
