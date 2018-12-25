function SearchPageHandler() {
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

    /*BOF: Model Methods*/
    self.InitialSearchPage = function (callback) {
        requestHistoryModel.SaveLastExecute(self, self.InitialSearchPage, arguments);
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
        self.RenderActionDropdownList();

        // make sure document is ready
        if (!jQuery.isReady || !jQuery('html').hasClass('initialized'))
            return;

        jQuery.localStorage('page_changed', false);

        if (!self.IsPageInitialized) {
            self.IsPageInitialized = true;
            progressbarModel.InitialProgressBar();
            userSettingsView.UpdateUserMenu();
            CheckUILanguage(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase());
            self.InitialUserPrivileges();
            self.InitialSearchBox();
            self.BindSortingDropdown();

            // tooltip
            WC.HtmlHelper.Tooltip.Create('searchfacet', '#LeftMenu .name', true);
            WC.HtmlHelper.Tooltip.Create('BusinessProcessFacet', '#LeftMenu .BusinessProcessFacet', false, TOOLTIP_POSITION.RIGHT, 'BusinessProcessFacet-tooltip k-window-arrow-w');
            WC.HtmlHelper.Tooltip.Create('actionmenu', '#ActionDropdownListPopup .actionDropdownItem', false, TOOLTIP_POSITION.BOTTOM, 'tooltipActionmenu k-window-arrow-n');
            WC.HtmlHelper.Tooltip.Create('searchbar', '#SearchBar .searchBoxWrapper > a', false, TOOLTIP_POSITION.BOTTOM, 'tooltipActionmenu k-window-arrow-n');

            // check currency
            userSettingsHandler.CheckUserCurrency();

            // menu navigatable
            WC.HtmlHelper.MenuNavigatable('#UserControl', '#UserMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#Help', '#HelpMenu', '.actionDropdownItem');
            WC.HtmlHelper.MenuNavigatable('#SelectModelCreateNewAngle', '#PopupSelectModelCreateNewAngle', '.k-item', 'k-state-selected');

            // action menu responsive
            WC.HtmlHelper.ActionMenu('#ActionSelect', function (target) {
                // pre-value use for subtraction margin or white-spacing
                var result = -300;
                target.siblings().each(function () {
                    result += jQuery(this).outerWidth();
                });
                return result;
            });

            //Binding knockout
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#HelpMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#UserMenu .k-window-content'));
            WC.HtmlHelper.ApplyKnockout(searchModel, jQuery('#SearchResultList'));
            WC.HtmlHelper.ApplyKnockout(searchModel, jQuery('#SearchBar'));

            // facet
            WC.HtmlHelper.ApplyKnockout(facetFiltersViewModel, jQuery('#LeftMenu .facetFilter'));

            createNewAngleViewManagementModel.UpdateCreateNewAngleButton();

            jQuery.clickOutside('#UserMenu', '#UserControl');
            jQuery.clickOutside('#HelpMenu', '#Help');
            jQuery.clickOutside('#PopupSelectModelCreateNewAngle', '#SelectModelCreateNewAngle');

            // load auto execute list
            var isExecuteAutoWhenLogon = userSettingModel.CheckExecuteAutoWhenLogon();
            var isExecuteSearchWhenLogon = userSettingModel.CheckExecuteSearchWhenLogon();
            jQuery.localStorage('firstLogin', 0);

            if (isExecuteAutoWhenLogon) {
                self.AutoExecuteList(isExecuteSearchWhenLogon);
            }
            else if (isExecuteSearchWhenLogon) {
                self.AutoExecuteSearch();
            }
            else {
                searchRetainUrlModel.Initial();
            }

            // update layout
            self.UpdateLayout();
        }

        // callback
        if (typeof callback === 'function')
            callback();
    };
    self.AutoExecuteList = function (isExecuteSearchWhenLogon) {
        // check count of facet_executeonlogin
        var hasExecuteonlogin = true;
        var facetCharacteristics = ko.toJS(facetFiltersViewModel.Data()).findObject('id', 'facetcat_characteristics');
        if (facetCharacteristics) {
            var filterExecuteonlogin = facetCharacteristics.filters.findObject('id', 'facet_executeonlogin');
            if (filterExecuteonlogin && !filterExecuteonlogin.count) {
                hasExecuteonlogin = false;
            }
        }

        jQuery.when(hasExecuteonlogin ? userSettingModel.LoadAutoExecuteList() : null)
            .then(function () {
                if (!isExecuteSearchWhenLogon) {
                    searchRetainUrlModel.Initial();
                }
                else {
                    self.AutoExecuteSearch();
                }

                jQuery.each(userSettingModel.AutoExecuteList(), function (index, autoExecuteList) {
                    setTimeout(function () {
                        WC.Utility.OpenUrlNewWindow(autoExecuteList.link);
                    }, 3000);
                });
            });
    };
    self.AutoExecuteSearch = function () {
        searchRetainUrlModel.Initial();

        var lastSearch = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL);
        if (lastSearch) {
            jQuery.address.value(lastSearch);
        }
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
        jQuery('#SearchResultList').hide();
        jQuery('#Content').busyIndicator(false);
        jQuery('#LandingPage').show().css('opacity', 0).stop();
        welcomeModel.Initial()
            .always(function () {
                jQuery('#LandingPage').animate({ opacity: 1 }, 'fast');
            });
    };
    self.ShowSearchResult = function () {
        welcomeModel.StopPlayingVideo();
        jQuery('#LandingPage').hide();
        jQuery('#SearchResultList').show();
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
        };

        jQuery('#SearchInput')
            .off('keyup')
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
                    ddlSortFirstItem = ddlSort.dataItems()[0] || { id: 'name', name: 'Name', dir: ko.observable('asc') };
                    searchQueryModel.SetSortByToUI(ddlSortFirstItem.id, ddlSortFirstItem.dir());
                }
            }
            self.ClearAllSelectedRows();
            searchQueryModel.Search(value !== '');
        }
    };
    self.UpdateLayout = function () {
        var h = WC.Window.Height - jQuery('#MainContent').offset().top;
        jQuery('#LeftMenu, #Content').height(h);
        jQuery('#LandingPage').outerHeight(h);

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
    self.OpenNewTabInWebKit = function (url) {
        var a = document.createElement("a");
        a.href = url;
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
        a.dispatchEvent(evt);
    };
    self.GetPrivateNoteByUserSpecific = function (data, isTitle) {
        if (data.user_specific && data.user_specific.private_note) {
            var rawPrivateNote = WC.HtmlHelper.StripHTML(data.user_specific.private_note);
            return isTitle ? rawPrivateNote : kendo.format(' &nbsp; <span class="PrivateNote"><strong>{0}:</strong> {1}</span>', Localization.PersonalNote, rawPrivateNote);
        }
        return '';
    };
    self.GetSignFavoriteIconCSSClass = function (data) {
        var cssClass;
        if (data.user_specific && data.user_specific.is_starred) {
            cssClass = 'SignFavorite';
        }
        else {
            cssClass = 'SignFavoriteDisable';
        }

        if (!data.authorizations.update_user_specific) {
            cssClass += ' disabled';
        }

        return cssClass;
    };
    self.GetSignPrivateCSSClass = function (data) {
        return data.is_published ? 'public' : 'private';
    };
    self.GetIsValidateItemHtmlElement = function (data) {
        return data.is_validated ? 'validated' : 'none';
    };
    self.GetItemIconCSSClassByDisplay = function (data) {
        return data.displays ? '' : 'alwaysHide';
    };
    self.GetItemIconTypeCSSClassByItem = function (selectedItem) {
        if (selectedItem.type === enumHandlers.ITEMTYPE.DASHBOARD)
            return 'dashboard';
        else if (selectedItem.type === enumHandlers.ITEMTYPE.ANGLE && selectedItem.is_template)
            return 'template';
        else
            return 'angle';
    };
    self.SetFavoriteIconCSSClass = function (target, data) {
        target.removeClass().addClass(self.GetSignFavoriteIconCSSClass(data));
    };
    self.GetDisplayPublishCSSClass = function (data) {
        return data.is_public ? 'public' : 'private';
    };
    self.GetDisplayTypeCSSClass = function (data) {
        var classNames = [data.display_type];
        if (data.is_angle_default)
            classNames.push('default');
        if (data.used_in_task)
            classNames.push('schedule');
        return classNames.join(' ');
    };
    self.GetDisplayFilterCSSClass = function (data) {
        var classNames = ['filter'];
        if (data.has_followups)
            classNames.push('followup');
        if (!data.has_filters && !data.has_followups)
            classNames.push('noFilter');
        return classNames.join(' ');
    };
    self.GetParameterizeCSSClass = function (data) {
        return data.is_parameterized ? 'parameterized' : 'none';
    };
    self.GetWarnningClass = function (data) {
        return data.has_warnings ? 'validWarning' : 'none';
    };
    self.SetFavoriteItem = function (value, event) {
        var target = jQuery(event.currentTarget);
        if (target.hasClass('disabled') || target.hasClass('signLoading') || target.hasClass('loading16x16'))
            return;

        var uri = value instanceof Object ? value.uri : value;
        var model = searchModel.GetItemByUri(uri);
        if (!model)
            return;

        if (model.authorizations.update_user_specific) {
            target.addClass('signLoading loading16x16');
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
                    target.removeClass('signLoading loading16x16');
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
    self.BindSortingDropdown = function () {
        var isValidSorting = true,
            q = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.Q) || '',
            hasSortDir = false;

        jQuery.each(facetFiltersViewModel.SortOptions, function (index, sort) {
            if (sort.dir) hasSortDir = true;
            sort.dir = ko.observable(sort.dir || '');

            if (!sort.id) {
                sort.id = 'name';
                sort.name = 'Name';
                model.sort_options.splice(1, model.sort_options.length);
                isValidSorting = false;
                return false;
            }
        });
        if (q) {
            facetFiltersViewModel.SortOptions.push({
                id: facetFiltersViewModel.SortRelevancyId,
                name: Localization.Relevancy,
                dir: ko.observable(hasSortDir ? '' : 'desc')
            });
        }

        var dataSource = new kendo.data.DataSource({ data: facetFiltersViewModel.SortOptions }),
            ddlSort = WC.HtmlHelper.DropdownList('#SortItemBySelect');
        if (!ddlSort) {
            ddlSort = WC.HtmlHelper.DropdownList('#SortItemBySelect', dataSource, {
                template: function (data) {
                    var cssClass = '';
                    if (data.dir && data.dir()) {
                        cssClass = 'k-sort-' + data.dir();
                    }

                    return '<span data-id="' + data.id + '" class="' + cssClass + '">' + data.name + '</span>';
                },
                valueTemplate: function (data) {
                    var cssClass = '';
                    if (data.dir && data.dir()) {
                        cssClass = 'k-sort-' + data.dir();
                    }

                    return '<span data-id="' + data.id + '" class="' + cssClass + '">' + data.name + '</span>';
                },
                select: function (e) {
                    if (jQuery(e.sender.items()).filter('.k-state-selected').children().data('id') === e.sender.value()) {
                        e.sender.dataItem().dir(e.sender.dataItem().dir() === 'asc' ? 'desc' : 'asc');
                        self.ClearAllSelectedRows();
                        searchQueryModel.Search();
                    }
                },
                change: function (e) {
                    self.ClearAllSelectedRows();
                    searchQueryModel.Search();
                }
            });
        }
        else {
            ddlSort.setDataSource(dataSource);
        }

        var sortList = jQuery('#sortList');
        sortList.empty();
        jQuery.each(facetFiltersViewModel.SortOptions, function (index, sort) {
            var cssNames = [sort.id];
            if (sort.id !== 'name')
                cssNames.push('revert');
            cssNames.push(sort.dir());

            jQuery('<li />')
                .text(sort.name)
                .data('sort', sort)
                .addClass(cssNames.join(' '))
                .on('click', sort, function (e) {

                    if (e.data.id !== facetFiltersViewModel.SortRelevancyId
                        || (e.data.id === facetFiltersViewModel.SortRelevancyId && ddlSort.value() !== facetFiltersViewModel.SortRelevancyId)) {
                        var dir = '';
                        if (e.data.id !== ddlSort.value() && e.data.id !== 'name')
                            dir = 'asc';

                        if (e.data.id === 'executed')
                            dir = 'asc';

                        ddlSort.value(e.data.id);
                        if (dir)
                            ddlSort.dataItem().dir(dir);

                        ddlSort.trigger('select');
                    }

                })
                .appendTo(sortList);
        });

        ddlSort.enable(isValidSorting);
    };
    self.BindSearchResultGrid = function (scrollTop) {
        WC.Ajax.AbortAll();
        jQuery('#Content').busyIndicator(true);
        searchModel.ClearSelectedRow();

        var dataSourceTmp = {};
        var fnCheckRequestEnd;
        var tempAjaxRequests = {};

        // M4-12030: WC: When default page size set to less than number of objects/angles, no way to get to the objects not shown on search page.
        var containerHeight = jQuery('#Content').height();
        var pageSize = Math.min(Math.max(systemSettingHandler.GetDefaultPageSize(), Math.ceil(containerHeight / 46)), systemSettingHandler.GetMaxPageSize());

        searchModel.Items([]);
        var searchItemDataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    var requestUrl = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.ITEMS);
                    requestUrl += '?' + searchQueryModel.BuildSearchQueryForPagination(options.data.page, options.data.pageSize);
                    requestUrl += '&caching=false&viewmode=basic';

                    if (tempAjaxRequests.request && tempAjaxRequests.request.readyState !== 4) {
                        tempAjaxRequests.request.abort();
                    }

                    if (typeof dataSourceTmp[options.data.page] !== 'undefined') {
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
                                else if (gridObject) {
                                    requestHistoryModel.SaveLastExecute(gridObject.dataSource, gridObject.dataSource.options.transport.read, [options]);
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
            error: function (e) {
                requestHistoryModel.SaveLastExecute(e.sender, e.sender.read, []);
            },
            schema: {
                total: function () {
                    return searchModel.TotalItems();
                }
            },
            pageSize: pageSize,
            serverPaging: true
        });


        // Bind data source with kendo grid
        var fnCheckFetching, fnCheckRequestIndicator;
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

                WC.HtmlHelper.AdjustNameContainer(e.sender.element.find('.ResultContent'));

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
                    self.UpdateActionMenuState();
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
                virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));

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
                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
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
                        var scrollTop = !virtualScroll.itemHeight || !virtualScroll._scrollbarTop ? 0 : virtualScroll._scrollbarTop - (e.deltaFactor * e.deltaY);
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

                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - (e.deltaFactor * e.deltaY));
                    }, 10);
                }
            });
    };
    self.SearchItemFail = function () {
        searchQueryModel.SetUIControlFromUrl();
    };
    self.SearchItemSuccess = function (data) {
        defaultValueHandler.CheckAndExtendProperties(data.items, enumHandlers.VIEWMODELNAME.SEARCHMODEL, true);

        self.UpdateActionMenuState();

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
            jQuery('#SearchResultView').show();

            facetFiltersViewModel.SetFacetAndSort(data);
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
        if (self.DisplayType() !== searchPageHandler.DISPLAY_TYPE.DISPLAYS)
            return;

        WC.HtmlHelper.AdjustNameContainer(element.find('.ResultView'));

        element.find('.ResultView:visible')
            .off('mousewheel.displaysview')
            .on('mousewheel.displaysview', function (e) {
                var displayListContainer = jQuery(e.currentTarget);
                if (displayListContainer.height() < displayListContainer.children().height()) {
                    displayListContainer.scrollTop(displayListContainer.scrollTop() - e.deltaY * 30);
                    e.stopPropagation();
                }
            });
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

        if (!privilegesViewModel.IsAllowAdvanceSearch())
            jQuery('#SearchButton').addClass('alwaysHide');
    };

    // action dropdown
    self.RenderActionDropdownList = function () {
        var menuHtml = [];
        jQuery.each(enumHandlers.SEARCHACTION, function (key, action) {
            menuHtml.push('<a class="actionDropdownItem ' + action.Id + '" onclick="searchPageHandler.CallActionDropdownFunction(this, \'' + action.Id + '\')"><span>' + action.Text + '</span></a>');
        });
        jQuery('#ActionDropdownListPopup .k-window-content').html(menuHtml.join(''));
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
                angleExportHandler.ShowAngleExportPopup();
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
        // save last execution
        requestHistoryModel.SaveLastExecute(self, self.DeleteItems, arguments);

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
        jQuery('tr[data-uri="' + item.uri + '"]').removeClass('k-state-selected').attr('aria-selected', false);
    };
    self.ClearAllSelectedRows = function () {
        searchModel.ClearSelectedRow();
        self.UpdateActionMenuState();

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
                            self.UpdateActionMenuState();
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
            jQuery('tr[data-uri="' + item.uri + '"]').addClass('k-state-selected').attr('aria-selected', true);
        }
    };
    self.UpdateActionMenuState = function () {
        jQuery('#ActionSelect').removeClass('disabled');

        var canCreateAngle = privilegesViewModel.IsAllowCreateAngle();
        var ddlList = jQuery('#ActionDropdownListPopup .actionDropdownItem').addClass('disabled');

        if (searchModel.Items().length) {
            ddlList.filter('.selectAll').removeClass('disabled');
        }

        if (searchModel.SelectedItems().length) {
            ddlList.filter('.deSelect').removeClass('disabled');

            var allowedMenuList = ['.executeDashboard', '.massChange', '.delete', '.createEAPackage', '.copyAngle'];

            if (!canCreateAngle) {
                // not allow copy angle and delete item menu when no permission to create a new angle
                var copyAngleIndex = allowedMenuList.indexOf('.copyAngle');
                allowedMenuList.splice(copyAngleIndex, 1);

                if (!self.IsDeleteMenuEnabled()) {
                    var deleteItemIndex = allowedMenuList.indexOf('.delete');
                    allowedMenuList.splice(deleteItemIndex, 1);
                }
            }

            ddlList.filter(allowedMenuList.join(',')).removeClass('disabled');
        }

        if (canCreateAngle) {
            ddlList.filter('.uploadAngles').removeClass('disabled');
        }

        // check ios touch device
        if (!!$.browser.safari && Modernizr.touch) {
            ddlList.filter('.createEAPackage').addClass('disabled');
        }

        if (!privilegesViewModel.IsAllowExecuteDashboard())
            ddlList.filter('.executeDashboard').addClass('disabled');
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
        requestHistoryModel.SaveLastExecute(self, self.ExecuteDashboard, arguments);

        var items = searchModel.SelectedItems();
        if (!items.length) return;

        var itemUri = [];
        jQuery.each(items, function (key, item) {
            if (item.type === enumHandlers.ITEMTYPE.ANGLE && !item.is_template && item.displays.length) {
                itemUri.push(item.uri);
            }
        });

        // reach the maximum
        if (itemUri.length > maxNumberOfDashboard) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_ReachMaximumOfDashboard, maxNumberOfDashboard));
            return false;
        }

        // show alert if not valid item
        if (!itemUri.length) {
            popup.Alert(Localization.Warning_Title, Localization.Info_OnlyAnglesAreAllowedToCreateADashboard);
            return false;
        }

        var executeDashboard = function () {
            // get items full details
            var deferred = [], fullItemsDetails = [];
            var getAngle = function (uri) {
                var params = {};
                params[enumHandlers.PARAMETERS.CACHING] = false;
                return GetDataFromWebService(uri, params)
                    .done(function (response, textStatus, xhr) {
                        if (xhr.status === 200)
                            fullItemsDetails.push(response);
                    });
            };

            jQuery.each(itemUri, function (key, uri) {
                deferred.pushDeferred(getAngle, [uri]);
            });

            jQuery.whenAll(deferred)
                .done(function () {
                    var data = dashboardModel.GetInitialTemporaryData();
                    var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();

                    jQuery.each(itemUri, function (index, uri) {
                        var item = fullItemsDetails.findObject('uri', uri);
                        var display = searchModel.DashboardDefaultDisplay(item) || {};

                        if (item === null)
                            return;

                        dashboardModel.MapAngle(item);
                        dashboardModel.Angles.push(item);

                        data.widget_definitions.push({
                            angle: item[dashboardModel.KeyName],
                            display: display[dashboardModel.KeyName] || null,
                            widget_details: JSON.stringify({
                                model: item.model
                            }),
                            widget_type: 'angle_display',

                            // required fields but do not use for now
                            multi_lang_name: [{
                                lang: defaultLanguage,
                                text: ' '
                            }],
                            multi_lang_description: [{
                                lang: defaultLanguage,
                                text: ''
                            }]
                        });
                    });

                    data.layout = JSON.stringify(dashboardModel.GetDefaultLayoutConfig(data.widget_definitions.length));

                    // awake dashboard model
                    dashboardModel.SetData(data);

                    progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PreparingData, false);

                    // load angles -> get name -> create dashboard -> jump to dashboard page
                    jQuery.when(dashboardModel.LoadAngles('uri'))
                        .then(function () {
                            return dashboardModel.GetDefaultDashboardName();
                        })
                        .then(function (name) {
                            data.assigned_labels = dashboardModel.GetBusinessProcesses();
                            data.multi_lang_name[0].text = name;

                            progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_CreatingDashboard);
                            jQuery.when(dashboardModel.SaveTemporaryDashboard(data))
                                .done(function (data) {
                                    var executionInfo = dashboardModel.GetDashboardExecutionParameters();
                                    if (executionInfo.query_steps.length) {
                                        progressbarModel.EndProgressBar();
                                        self.ShowDashboardExecutionParameterPopup(dashboardModel.Data(), executionInfo);
                                    }
                                    else {
                                        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Redirecting);

                                        var params = {};
                                        params[enumHandlers.DASHBOARDPARAMETER.NEW] = true;
                                        window.location.href = WC.Utility.GetDashboardPageUri(data.uri, params);
                                    }
                                });
                        });
                });
        };

        if (itemUri.length !== items.length) {
            var win = popup.Confirm(Localization.Info_SelectItemsContainTemplatesOrAngles, function () {
                executeDashboard();
            });
            var options = {
                title: Localization.Warning_Title
            };
            win.setOptions(options);
            win.element.find(".notificationIcon").attr("class", "notificationIcon alert");
        }
        else {
            executeDashboard();
        }
    };

    // popup info
    self.ShowBaseClassInfoPopup = function (element, modelUri) {
        element = jQuery(element);
        helpTextHandler.ShowHelpTextPopup(element.data('id'), helpTextHandler.HELPTYPE.CLASS, modelUri);
    };
    self.ShowDashboardExecutionParameterPopup = function (dashboard, executionsInfo) {
        // custom angle & display in executionsInfo

        // remove angle query step block
        executionsInfo.angle.is_parameterized = false;
        executionsInfo.angle.query_definition = [{
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES,
            base_classes: []
        }];

        // set new display query_blocks
        executionsInfo.display.name = dashboard.name;
        executionsInfo.display.is_parameterized = true;
        executionsInfo.display.query_blocks = [WC.ModelHelper.ExtendQueryBlock({
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
            query_steps: executionsInfo.query_steps
        })];

        var executionParameter = new ExecutionParameterHandler();
        executionParameter.CanUseCompareField = false;
        executionParameter.ModelUri = executionsInfo.angle.model;
        executionParameter.Angle = executionsInfo.angle;
        executionParameter.Display = executionsInfo.display;
        executionParameter.ShowPopupAfterCallback = function (e) {
            e.sender.element.find('.displayInfo > label').text(Localization.DashboardName);
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
        var html = self.GetDisplaysListHtmlFromItem(angle, 'large');
        contentElement.html(html);

        jQuery('#InnerResultWrapper .k-scrollbar').off('scroll.showdisplays').on('scroll.showdisplays', function () {
            itemInfoHandler.HideDisplays();
        });
    };
    self.GetDisplaysListHtmlFromItem = function (angle, extraCssClass) {
        var displays = JSON.parse(JSON.stringify(WC.Utility.ToArray(angle.displays)));
        displays.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
        var html = ['<ul class="detailDefinitionList">'];
        jQuery.each(displays, function (index, display) {
            display.__angle_uri = angle.uri;
            display.__angle_is_template = angle.is_template;
            var template = [
                '<li class="displayNameContainer cursorPointer ' + extraCssClass + '" onclick="searchPageHandler.ClickDisplay(event)">',
                '<div class="front">',
                '<i class="icon #= searchPageHandler.GetDisplayTypeCSSClass(data) #"></i>',
                '</div>',
                '<a class="name nameLink displayName"',
                ' title="#:data.name #"',
                ' href="#= searchModel.GetDisplayHrefUri(data.__angle_uri, data.uri, data.__angle_is_template) #"',
                ' onclick="return searchModel.ItemLinkClicked(event, \'#: data.__angle_uri #\', null, \'#: data.uri #\')">',
                '#: data.name #</a>',
                '<div class="rear">',
                '<i class="icon #= searchPageHandler.GetParameterizeCSSClass(data) #"></i>',
                '<i class="icon #= searchPageHandler.GetWarnningClass(data) #"></i>',
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
            maxWidth: 700,
            appendTo: '#Search',
            center: false,
            modal: false,
            position: {
                left: 0,
                top: 75
            },
            draggable: false,
            buttons: [
                {
                    text: Captions.Button_Search,
                    isPrimary: true,
                    click: self.SearchOnAdvance,
                    position: 'right'
                }
            ],
            open: function (e) {
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

        var publicStatus = [
            { Id: 1, Value: Localization.AdvanceFilterUsageOperatorPrivate },
            { Id: 2, Value: Localization.AdvanceFilterUsageOperatorPublished }
        ];
        self.InitialAdvSearchDropdown('#dropdownPublicStatus', publicStatus, {
            dataTextField: "Value",
            dataValueField: "Id",
            optionLabel: { Id: 0, Value: Captions.Label_AdvanceFilter_PulicationStatus }
        });

        var validationStatus = [
            { Id: 1, Value: Localization.AdvanceFilterUsageOperatorValidated },
            { Id: 2, Value: Localization.AdvanceFilterUsageOperatorNotValidated }
        ];
        self.InitialAdvSearchDropdown('#dropdownValidation', validationStatus, {
            dataTextField: "Value",
            dataValueField: "Id",
            optionLabel: { Id: 0, Value: Captions.Label_AdvanceFilter_ValidationStatus }
        });

        var starredStatus = [
            { Id: 1, Value: Localization.AdvanceFilterUsageOperatorStarred },
            { Id: 2, Value: Localization.AdvanceFilterUsageOperatorNotStarred }
        ];
        self.InitialAdvSearchDropdown('#dropdownStarred', starredStatus, {
            dataTextField: "Value",
            dataValueField: "Id",
            optionLabel: { Id: 0, Value: Captions.Label_AdvanceFilter_StarredStatus }
        });

        var warningStatus = [
            { Id: 1, Value: Localization.AdvanceFilterUsageOperatorWarning },
            { Id: 2, Value: Localization.AdvanceFilterUsageOperatorNotWarning }
        ];
        self.InitialAdvSearchDropdown('#dropdownWarning', warningStatus, {
            dataTextField: "Value",
            dataValueField: "Id",
            optionLabel: { Id: 0, Value: Captions.Label_AdvanceFilter_WarningStatus }
        });

        WC.HtmlHelper.ApplyKnockout(self, e.sender.wrapper);
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
                // Allow: backspace, delete, tab, escape
                if (jQuery.inArray(e.keyCode, [46, 8, 9, 27]) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (jQuery.inArray(e.keyCode, [65, 67, 86, 88]) !== -1 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right, down, up
                    (e.keyCode >= 35 && e.keyCode <= 40)) {

                    // let it happen, don't do anything
                    return;
                }

                // Ensure that it is a alphanumeric and stop the keypress
                var isFF = !!jQuery.browser.mozilla;
                if (
                    !(
                        // allow 0 - 9 (keyboard)
                        (!e.shiftKey && e.keyCode >= 48 && e.keyCode <= 57)

                        // allow 0 - 9 (numpad)
                        || (!e.shiftKey && e.keyCode >= 96 && e.keyCode <= 105)

                        // allow _ (keyboard)
                        || (e.shiftKey && ((!isFF && e.keyCode === 189) || (isFF && e.keyCode === 173)))

                        // allow * (keyboard)
                        || (e.shiftKey && e.keyCode === 56)

                        // allow * (numpad)
                        || (e.keyCode === 106)

                        // allow a - z (keyboard)
                        || (e.keyCode >= 65 && e.keyCode <= 90)
                    )
                ) {
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
            datepickerFrom.element.attr('placeholder', '');
            datepickerFrom.min(new Date(1900, 1, 1));
            datepickerFrom.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 0, 0));
            datepickerFrom.value('');
            datepickerTo.enable(false);
            datepickerTo.element.attr('placeholder', '');
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
            if (!jQuery.isReady) return;

            self.UpdateLayout();
        });

        jQuery(window).off('beforeunload.search').on('beforeunload.search', function () {
            jQuery.localStorage('page_changed', true);
            userSettingModel.SaveLastSearch();
            WC.Ajax.DeleteResult();
            return;
        });
    }
}

var searchPageHandler = new SearchPageHandler();
