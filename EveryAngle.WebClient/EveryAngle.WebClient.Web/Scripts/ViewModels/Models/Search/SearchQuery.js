var searchQueryModel = new SearchQueryViewModel();

function SearchQueryViewModel() {
    "use strict";

    var self = this;

    self.Search = function (isRelevancy) {
        if (typeof isRelevancy === 'undefined')
            isRelevancy = false;

        var query = self.GetSearchQueryFromUI(isRelevancy);
        $.address.value('?' + query);
    };

    self.GetParams = function () {
        var data = {};
        jQuery.each(enumHandlers.SEARCHPARAMETER, function (k, v) {
            var query = WC.Utility.UrlParameter(v) || null;
            switch (v) {
                case enumHandlers.SEARCHPARAMETER.SORT:
                case enumHandlers.SEARCHPARAMETER.SORT_DIR:
                case enumHandlers.SEARCHPARAMETER.PAGE:
                case enumHandlers.SEARCHPARAMETER.PAGESIZE:
                case enumHandlers.SEARCHPARAMETER.OFFSET:
                case enumHandlers.SEARCHPARAMETER.LIMIT:
                case enumHandlers.SEARCHPARAMETER.Q:
                    data[v] = query || null;
                    break;
                case enumHandlers.SEARCHPARAMETER.FQ:
                    var raw = decodeURIComponent(query).replace(/\)/g, '').replace(/\(/g, '').replace(/"/g, '').split(/ and /ig),
                        fqData = {},
                        fqDataChecked = [],
                        fqDataUnchecked = [],
                        facet;
                    jQuery.each(raw, function (k2, v2) {
                        if (v2.indexOf(':') !== -1) {

                            // temporary fixed facetcat_admin
                            if (v2.toLowerCase().indexOf(' or ') !== -1) {
                                var category = v2.split(':')[0] + ':',
                                    regexpr = new RegExp(category, 'gi'),
                                    items = v2.replace(regexpr, '').split(/ or /gi);
                                v2 = category + items.join(' ');
                            }

                            facet = v2.split(':');
                            if (fqData[facet[0]]) {
                                jQuery.merge(fqData[facet[0]], facet[1].split(' '));
                            }
                            else
                                fqData[facet[0]] = facet[1].split(' ');
                            if (facet[0].charAt(0) === '-') {
                                jQuery.merge(fqDataUnchecked, fqData[facet[0]]);
                            }
                            else {
                                jQuery.merge(fqDataChecked, fqData[facet[0]]);
                            }
                        }
                    });
                    data[v] = { json: fqData, checked: fqDataChecked, unchecked: fqDataUnchecked };
                    break;
            }
        });

        return data;
    };

    self.GetSearchQueryFromUI = function (isRelevancy) {
        var query = '';

        // Add business question to search query
        if (self.GetBusinessQuestionValueFromUI() !== '') {
            query += self.GetBusinessQuestionParameter();
        }

        // Add sort option question to search query
        if (query !== '') {
            query += '&' + self.GetSortParameterFromUI(isRelevancy);
        }
        else {
            query += self.GetSortParameterFromUI(isRelevancy);
        }

        //add advance filtering
        var advanceCharacteristicSearch = '';

        var fq = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ) || '';
        fq = fq.split(' AND ');

        if (fq.length > 0) {
            WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ, fq.join(' AND '));
        }

        if (jQuery('#popupAdvanceFilter').length) {
            var advancesearch = self.GetAdvanceSearchQuery();
            if (advancesearch) {
                query = query + '&' + advancesearch;
            }

            if (self.GetQueryStringForAdvanceSearchCharacteristic()) {
                advanceCharacteristicSearch = self.GetQueryStringForAdvanceSearchCharacteristic();
            }
        }

        // Add facet question to search query
        var isAvanceSearch = jQuery('#popupAdvanceFilter').is(":visible");
        var facetParameter = self.GetFacetFilterParameter(isAvanceSearch);
        var businessProcessParameter = self.GetBusinessProcessParameter();

        var facetQuery = [];
        if (businessProcessParameter) {
            facetQuery.push(businessProcessParameter);
        }

        if (facetParameter) {

            facetQuery.push(facetParameter);
        }

        if (isAvanceSearch && advanceCharacteristicSearch) {
            facetQuery.push(advanceCharacteristicSearch);
        }


        query += '&' + enumHandlers.SEARCHPARAMETER.FQ + '=' + facetQuery.join(' AND ');

        if (WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.VIEWMODE)) {
            query += '&' + enumHandlers.SEARCHPARAMETER.VIEWMODE + '=' + searchPageHandler.DisplayType();
        }


        return query;
    };

    self.SetUIControlFromUrl = function () {
        if ($.address.parameterNames().length) {
            var businessQuestionValue = self.GetBusinessQuestionFromUrl();
            var businessFilterValue = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ);
            var sort = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT);
            var sortDir = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT_DIR) || 'asc';

            // sort
            self.SetSortByToUI(sort, sortDir);

            // q
            self.SetBusinessQuestionBoxValue(businessQuestionValue);

            // fq
            businessprocessSearchModel.SetBusinessFilterFromUrlToUI(businessFilterValue);
            facetFiltersViewModel.SetFacetFilterFromUrlToUI(businessFilterValue);
            self.SetUIOfAdvanceSearchFromParams();
        }
    };

    self.GetBusinessQuestionParameter = function () {
        var businessQuestionParameter = '';
        var businessQuestoinValueFromUI = self.GetBusinessQuestionValueFromUI();
        if (businessQuestoinValueFromUI) {
            businessQuestoinValueFromUI = businessQuestoinValueFromUI.replace(/\\/g, '\\\\');
            businessQuestoinValueFromUI = encodeURIComponent(businessQuestoinValueFromUI);
            businessQuestionParameter = enumHandlers.SEARCHPARAMETER.Q + '=' + businessQuestoinValueFromUI;
        }
        return businessQuestionParameter;
    };

    self.GetBusinessQuestionFromUrl = function () {
        var value = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.Q) || '';
        value = decodeURIComponent(value);
        value = value.replace(/\\\\/g, '\\');
        return value;
    };

    self.SetBusinessQuestionBoxValue = function (value) {
        var inputElement = jQuery('#SearchInput');
        if (!inputElement.data('using')) {
            inputElement.val(value);
        }
        inputElement.data('default', value).removeData('using');
    };

    self.GetSortByFromUI = function (isRelevancy) {
        var sortUI = WC.HtmlHelper.DropdownList('#SortItemBySelect'),
            sortUriValue = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT),
            sortOptions = {};

        if (isRelevancy) {
            sortOptions[enumHandlers.SEARCHPARAMETER.SORT] = facetFiltersViewModel.SortRelevancyId;
        }
        else {
            if (!sortUI) {
                sortOptions[enumHandlers.SEARCHPARAMETER.SORT] = sortUriValue || '';
                sortOptions[enumHandlers.SEARCHPARAMETER.SORT_DIR] = sortOptions[enumHandlers.SEARCHPARAMETER.SORT] === 'name' ? 'asc' : 'desc';
            }
            else {
                sortOptions[enumHandlers.SEARCHPARAMETER.SORT] = sortUI.value() || 'name';
                if (sortUI.dataItem()) {
                    sortOptions[enumHandlers.SEARCHPARAMETER.SORT_DIR] = sortUI.dataItem().dir();
                }
                else {
                    sortOptions[enumHandlers.SEARCHPARAMETER.SORT_DIR] = sortOptions[enumHandlers.SEARCHPARAMETER.SORT] === 'name' ? 'asc' : 'desc';
                }
            }
            if (sortOptions[enumHandlers.SEARCHPARAMETER.SORT] === facetFiltersViewModel.SortRelevancyId) {
                delete sortOptions[enumHandlers.SEARCHPARAMETER.SORT_DIR];
            }
        }
        return sortOptions;
    };

    self.SetSortByToUI = function (value, dir) {
        if (typeof value === 'undefined') return;

        value = unescape(value);
        dir = unescape(dir);

        var sortUI = WC.HtmlHelper.DropdownList('#SortItemBySelect');
        if (sortUI) {
            jQuery.each(facetFiltersViewModel.SortOptions, function (index, sort) {
                sort.dir('');
            });
            sortUI.setDataSource(new kendo.data.DataSource({ data: facetFiltersViewModel.SortOptions }));

            if (sortUI.dataItem()) {
                sortUI.value(value);
                if (sortUI.dataItem())
                    sortUI.dataItem().dir(dir);
            }
        }
    };

    self.GetSortParameterFromUI = function (isRelevancy) {
        var sortValueFromUI = self.GetSortByFromUI(isRelevancy);
        if (sortValueFromUI[enumHandlers.SEARCHPARAMETER.SORT]) {
            return unescape(jQuery.param(sortValueFromUI));
        }
        return '';
    };

    self.GetBusinessProcessParameter = function () {
        var params = [];
        jQuery.each(businessProcessesModel.Topbar.GetActive(), function (k, v) {
            params.push(v);
        });

        return params.length ? enumHandlers.SEARCHFQPARAMETER.BP + ':(' + params.join(' ') + ')' : '';
    };

    self.GetFacetFilterParameter = function (isAvanceSearch) {
        var facetQuery = '';

        jQuery('#LeftMenu .FilterCheckBox ul').each(function (index, element) {
            var filterChecked = [],
                filterUnchecked = [],
                filter = '',
                facetElement = jQuery(this).find(':checkbox');

            facetElement.each(function (subIndex, subElement) {
                if (subElement.checked && !(isAvanceSearch && self.ElementIsInFacet(subElement))) {
                    if (jQuery(subElement).next().hasClass('negative')) {
                        filterUnchecked.push(subElement.id);
                    }
                    else {
                        filterChecked.push(subElement.id);
                    }
                }
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
            }
        });

        return facetQuery;
    };
    self.ElementIsInFacet = function (subElement) {
        return (subElement.id === 'facet_isprivate' || subElement.id === 'facet_isvalidated' || subElement.id === 'facet_isstarred' || subElement.id === 'facet_has_warnings');
    };
    self.BuildSearchQueryForPagination = function (currentPage, pageSize) {
        var businessQuestionValue = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.Q);
        var businessFilterValue = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ);
        var sortValue = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT);
        var sortDirValue = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT_DIR) || 'asc';

        var query = {};

        // q
        if (businessQuestionValue) {
            query[enumHandlers.SEARCHPARAMETER.Q] = businessQuestionValue;
        }

        // fq
        if (businessFilterValue) {
            query[enumHandlers.SEARCHPARAMETER.FQ] = businessFilterValue;
        }

        // include_facets
        if (currentPage !== 1) {
            query[enumHandlers.SEARCHPARAMETER.INCLUDE_FACETS] = false;
        }

        // sort
        if (sortValue && sortValue !== facetFiltersViewModel.SortRelevancyId) {
            query[enumHandlers.SEARCHPARAMETER.SORT] = sortValue;
            query[enumHandlers.SEARCHPARAMETER.SORT_DIR] = sortDirValue;
        }

        // page
        if (currentPage) {
            query[enumHandlers.SEARCHPARAMETER.OFFSET] = (currentPage - 1) * pageSize;
        }

        // pagesize
        if (pageSize) {
            query[enumHandlers.SEARCHPARAMETER.LIMIT] = pageSize;
        }

        var queryString = jQuery.param(query);

        var advanceSearch = self.GetAdvanceSearchQuery();
        if (advanceSearch !== '') {
            queryString = queryString + '&' + advanceSearch;
        }

        var decodeedUrl = decodeURIComponent(queryString);
        // replace '+' symbol
        decodeedUrl = decodeedUrl.replace(/\+/g, ' ');
        return decodeedUrl;
    };

    self.GetBusinessQuestionValueFromUI = function () {
        return jQuery.trim(jQuery('#SearchInput').val());
    };
    self.GetAdvanceSearchQuery = function () {
        var queries = [];
        if (jQuery('#popupAdvanceFilter').length) {
            var usageClasses = [
                { key: '.createdFilter', datefilter: enumHandlers.ADVANCESEARCHPARAMETER.CREATED, userFilter: enumHandlers.ADVANCESEARCHPARAMETER.CREATOR, operator: enumHandlers.ADVANCESEARCHPARAMETER.CREATOROPERATOR },
                { key: '.lastChangedFilter', datefilter: enumHandlers.ADVANCESEARCHPARAMETER.CHANGED, userFilter: enumHandlers.ADVANCESEARCHPARAMETER.CHANGER, operator: enumHandlers.ADVANCESEARCHPARAMETER.CHANGEROPERATOR },
                { key: '.executeFilter', datefilter: enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED, userFilter: enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR, operator: enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOROPERATOR },
                { key: '.validateFilter', datefilter: enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED, userFilter: enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR, operator: enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOROPERATOR }
            ];

            var autoCompleteElement, autoCompleteObject;
            var dropdownObject;
            jQuery.each(usageClasses, function (index, currentClass) {
                autoCompleteElement = jQuery(currentClass.key + ' .userFilter:input');
                autoCompleteObject = autoCompleteElement.data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE);
                if (autoCompleteObject && autoCompleteObject.value() !== '') {
                    queries.push(currentClass.userFilter + '=' + encodeURIComponent(autoCompleteObject.value()));
                }

                var lastTimeOfDay = 86399;
                jQuery(currentClass.key + ' .dropdownUsageOperators').each(function (index, ele) {
                    ele = jQuery(ele);
                    dropdownObject = WC.HtmlHelper.DropdownList(ele);
                    if (dropdownObject) {
                        var selectecValue = parseInt(dropdownObject.value());
                        if (selectecValue !== 0) {
                            var startDate = ele.parent().parent().find('.datepickerFrom:input').data(enumHandlers.KENDOUITYPE.DATEPICKER).value();
                            if (startDate) {
                                startDate = kendo.date.toUtcTime(kendo.date.getDate(startDate)) / 1000;
                            }
                            else {
                                startDate = '*';
                            }

                            var finishDate = ele.parent().parent().find('.datepickerTo:input').data(enumHandlers.KENDOUITYPE.DATEPICKER).value();
                            if (finishDate) {
                                finishDate = kendo.date.toUtcTime(kendo.date.getDate(finishDate)) / 1000;
                                finishDate += lastTimeOfDay;
                            }
                            else {
                                finishDate = '*';
                            }

                            if (selectecValue === 1) {
                                finishDate = startDate + lastTimeOfDay;
                                queries.push(currentClass.operator + '=' + selectecValue + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + finishDate + ']');
                            }
                            else if (selectecValue === 2) {
                                if (startDate !== '*' && finishDate !== '*') {
                                    queries.push(currentClass.operator + '=' + selectecValue + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + finishDate + ']');
                                }
                                else {
                                    queries.push(currentClass.operator + '=' + selectecValue + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + '*]');
                                }
                            }
                            else if (selectecValue === 3) {
                                startDate -= 1;
                                queries.push(currentClass.operator + '=' + selectecValue + '&' + currentClass.datefilter + '=[* TO ' + startDate + ']');
                            }
                            else {
                                queries.push(currentClass.operator + '=' + selectecValue + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + finishDate + ']');
                            }
                        }

                    }
                });
            });

            jQuery('.numberExecutedFilter .dropdownNumberExcutes').each(function (index, ele) {
                ele = jQuery(ele);
                dropdownObject = WC.HtmlHelper.DropdownList(ele);
                if (dropdownObject) {
                    var selectecValue = parseInt(dropdownObject.value());
                    if (selectecValue !== 0) {
                        var numberOfExecute = jQuery('#textNumberExcutes').val();
                        if (!jQuery.trim(numberOfExecute)) {
                            numberOfExecute = 0;
                        }
                        if (selectecValue === 1) {
                            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + selectecValue + '&times_executed=[' + numberOfExecute + ' TO ' + numberOfExecute + ']');
                        }
                        else if (selectecValue === 2) {
                            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + selectecValue + '&times_executed=[' + (parseInt(numberOfExecute) + 1) + ' TO ' + '*]');
                        }
                        else {
                            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + selectecValue + '&times_executed=[*' + ' TO ' + (parseInt(numberOfExecute) - 1) + ']');
                        }
                    }
                }
            });

            var value = jQuery.trim(jQuery('#ids').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.IDS + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#nameTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#descriptionTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#displayNameTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#displayDescriptionTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#baseClassTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#queryStepFieldTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS + '=' + encodeURIComponent(value));
            }

            value = jQuery.trim(jQuery('#followupTextBox').val());
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS + '=' + encodeURIComponent(value));
            }

            value = jQuery('#allowMoreDetailCheckbox').prop('checked');
            if (value) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS + '=' + value);
            }

            value = jQuery('#allowFollowUpCheckbox').prop('checked');
            if (jQuery('#allowFollowUpCheckbox').prop('checked')) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS + '=' + value);
            }


        }
        else {
            queries = self.GetAdvanceSearchQueryFromUri();
        }

        var query = queries.join('&');
        return query;
    };

    self.GetAdvanceSearchForCharacteristic = function (target, characteristicsName) {
        var dropdownObject = WC.HtmlHelper.DropdownList('#' + target);
        if (dropdownObject) {
            var selectecValue = dropdownObject.value();
            if (selectecValue !== 0) {

                if (selectecValue === 1) {
                    return characteristicsName;
                }
                else if (selectecValue === 2) {
                    return '-' + characteristicsName;
                }
            }
            else return null;
        }

        return query;
    };

    self.ClearCharacteristicInAdvanceSearch = function (facetId) {
        if (jQuery('#popupAdvanceFilter').length > 0) {
            if (facetId === 'facet_isprivate') {
                jQuery('#dropdownPublicStatus').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            }
            else if (facetId === 'facet_isvalidated') {
                jQuery('#dropdownValidation').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            }
            else if (facetId === 'facet_isstarred') {
                jQuery('#dropdownStarred').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            }
            else if (facetId === 'facet_has_warnings') {
                jQuery('#dropdownWarning').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            }
        }
    };
    self.ClearCharacteristicInFacet = function (facetId) {

        if (facetId === 'facet_isprivate') {
            jQuery('#facet_isprivate').prop('checked', false);
        }
        else if (facetId === 'facet_isvalidated') {
            jQuery('#facet_isvalidated').prop('checked', false);
        }
        else if (facetId === 'facet_isstarred') {
            jQuery('#facet_isstarred').prop('checked', false);
        }
        else if (facetId === 'facet_has_warnings') {
            jQuery('#facet_has_warnings').prop('checked', false);
        }

    };

    self.GetQueryStringForAdvanceSearchCharacteristic = function () {

        var result = '';
        var characteristicQueries = [];
        if (self.GetAdvanceSearchForCharacteristic('dropdownPublicStatus', 'facet_isprivate')) {
            characteristicQueries.push(self.GetAdvanceSearchForCharacteristic('dropdownPublicStatus', 'facet_isprivate'));
        }

        if (self.GetAdvanceSearchForCharacteristic('dropdownValidation', 'facet_isvalidated')) {
            characteristicQueries.push(self.GetAdvanceSearchForCharacteristic('dropdownValidation', 'facet_isvalidated'));
        }

        if (self.GetAdvanceSearchForCharacteristic('dropdownWarning', 'facet_has_warnings')) {
            characteristicQueries.push(self.GetAdvanceSearchForCharacteristic('dropdownWarning', 'facet_has_warnings'));
        }

        if (self.GetAdvanceSearchForCharacteristic('dropdownStarred', 'facet_isstarred')) {
            characteristicQueries.push(self.GetAdvanceSearchForCharacteristic('dropdownStarred', 'facet_isstarred'));
        }

        var filterChecked = [],
           filterUnchecked = [];

        for (var i = 0; i < characteristicQueries.length; i++) {
            if (characteristicQueries[i].indexOf('-') > -1) {
                filterUnchecked.push(characteristicQueries[i].replace('-', ''));
            }
            else {
                filterChecked.push(characteristicQueries[i]);
            }
        }

        if (filterChecked.length + filterUnchecked.length !== 0) {
            if (filterChecked.length !== 0) {
                result += 'facetcat_characteristics' + ':(' + filterChecked.join(' ') + ')';
            }
            if (filterUnchecked.length !== 0) {
                if (result) {
                    result += ' AND ';
                }
                result += '-facetcat_characteristics' + ':(' + filterUnchecked.join(' ') + ')';
            }
        }
        return result;
    };

    self.GetAdvanceSearchQueryFromUri = function () {
        var queries = [];
        var creator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATOR);
        if (creator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CREATOR + '=' + creator);
        }

        var creatorOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATOROPERATOR);
        if (creatorOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CREATOROPERATOR + '=' + creatorOperator);
        }

        var created = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATED);
        if (created) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CREATED + '=' + created);
        }

        var changer = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGER);
        if (changer) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CHANGER + '=' + changer);
        }

        var changerOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGEROPERATOR);
        if (changerOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CHANGEROPERATOR + '=' + changerOperator);
        }

        var changed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGED);
        if (changed) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CHANGED + '=' + changed);
        }

        var executor = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR);
        if (executor) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR + '=' + executor);
        }

        var executeOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOROPERATOR);
        if (executeOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOROPERATOR + '=' + executeOperator);
        }

        var executed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED);
        if (executed) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED + '=' + executed);
        }

        var validator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR);
        if (validator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR + '=' + validator);
        }

        var validateOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOROPERATOR);
        if (validateOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOROPERATOR + '=' + validateOperator);
        }

        var validated = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED);
        if (validated) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED + '=' + validated);
        }

        var numberOfExecuteOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR);
        if (numberOfExecuteOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + numberOfExecuteOperator);
        }

        var times_executed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.TIMESEXECUTED);
        if (times_executed) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.TIMESEXECUTED + '=' + times_executed);
        }

        var ids = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.IDS);
        if (ids) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.IDS + '=' + ids);
        }


        var item_name = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME);
        if (item_name) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME + '=' + item_name);
        }

        var item_description = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION);
        if (item_description) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION + '=' + item_description);
        }

        var display_names = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES);
        if (display_names) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES + '=' + display_names);
        }
        var display_descriptions = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS);
        if (display_descriptions) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS + '=' + display_descriptions);
        }
        var base_classes = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES);
        if (base_classes) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES + '=' + base_classes);
        }

        var query_step_fields = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS);
        if (query_step_fields) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS + '=' + query_step_fields);
        }
        var query_step_followups = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS);
        if (query_step_followups) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS + '=' + query_step_followups);
        }
        var grouping_label_names = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.GROUPINGLABELNAMES);
        if (grouping_label_names) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.GROUPINGLABELNAMES + '=' + grouping_label_names);
        }
        var privilege_label_names = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.PRIVILEGELABELNAMES);
        if (privilege_label_names) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.PRIVILEGELABELNAMES + '=' + privilege_label_names);
        }

        var allow_more_details = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS);
        if (allow_more_details) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS + '=' + allow_more_details);
        }
        var allow_followups = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS);
        if (allow_followups) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS + '=' + allow_followups);
        }

        return queries;
    };

    self.BindUsagesValues = function (tag, operator, dates) {
        WC.HtmlHelper.DropdownList(tag + ' .dropdownUsageOperators:last').trigger('change');

        var datepickerFrom = jQuery(tag + ' .datepickerFrom:eq(1)').data(enumHandlers.KENDOUITYPE.DATEPICKER);
        var datepickerTo = jQuery(tag + ' .datepickerTo:eq(1)').data(enumHandlers.KENDOUITYPE.DATEPICKER);
        var operatorNumber = parseInt(operator);
        if (operatorNumber === 0) {
            // nothing
            datepickerFrom.value('');
            datepickerTo.value('');
            datepickerFrom.enable(false);
            datepickerTo.enable(false);

            datepickerFrom.element.prop('disabled', true);
            datepickerTo.element.prop('disabled', true);
        }
        else if (operatorNumber === 1 || operatorNumber === 2 || operatorNumber === 3) {
            // on, after, before
            var startDate;
            if (operatorNumber === 1 || operatorNumber === 2) {
                startDate = parseInt(dates[0]);
            }
            else {
                startDate = parseInt(dates[1]) + 1;
            }
            var val = WC.DateHelper.UnixTimeToLocalDate(startDate);

            datepickerFrom.value(val);
            datepickerFrom.enable(true);
            datepickerFrom.element.prop('disabled', true);
            datepickerFrom.min(new Date(1900, 1, 1));

            var maxDate = new Date();
            datepickerFrom.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 0));

            datepickerTo.enable(false);
            datepickerTo.min(new Date(1900, 1, 1));
            datepickerTo.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 0));
            datepickerTo.value('');
        }
        else if (operatorNumber === 4) {
            // between
            var from = WC.DateHelper.UnixTimeToLocalDate(parseInt(dates[0]));
            var to = WC.DateHelper.UnixTimeToLocalDate(parseInt(dates[1]) - 86399);
            var maxDate = new Date();

            datepickerFrom.enable(true);

            if (from !== 'Invalid Date') {
                var newDate = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0);
                datepickerTo.min(newDate);

                if (to !== 'Invalid Date') {
                    newDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 0);
                    datepickerFrom.max(newDate);
                }
                else {
                    newDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 0);
                    datepickerFrom.max(newDate);
                }
            }

            datepickerTo.max(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 0));
            if (to !== 'Invalid Date') {
                var newDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 0);
                datepickerFrom.max(newDate);
            }

            datepickerFrom.value(from);
            datepickerTo.value(to);
            datepickerTo.enable(true);

            datepickerFrom.element.prop('disabled', true);
            datepickerTo.element.prop('disabled', true);
        }
    };

    self.SetUIOfAdvanceSearchFromParams = function () {
        if (jQuery('#popupAdvanceFilter:visible').length > 0) {
            var creator = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATOR) || ''));
            var created = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATED) || '';
            var executor = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR) || ''));
            var executed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED) || '';
            var validator = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR) || ''));
            var validated = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED) || '';
            var changer = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGER) || ''));
            var changed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGED) || '';

            var times_executed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.TIMESEXECUTED) || '';
            var item_name = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME) || '');

            var item_description = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION) || '');
            var display_names = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES) || '');
            var display_descriptions = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS) || '');
            var base_classes = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES) || '');

            var query_step_fields = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS) || '');
            var query_step_followups = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS) || '');

            var allow_more_details = !!WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS);
            var allow_followups = !!WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS);

            var ids = decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.IDS) || '');

            var creatorOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATOROPERATOR) || 0;
            var changerOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGEROPERATOR) || 0;
            var executeOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOROPERATOR) || 0;
            var validateOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOROPERATOR) || 0;
            var numberOfExecuteOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR) || 0;

            jQuery('#createdFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value(creator);
            jQuery('#lastChangedFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value(changer);
            jQuery('#executeFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value(executor);
            jQuery('#validateFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value(validator);
            jQuery('#nameTextBox').val(item_name);
            jQuery('#descriptionTextBox').val(item_description);
            jQuery('#displayNameTextBox').val(display_names);
            jQuery('#displayDescriptionTextBox').val(display_descriptions);
            jQuery('#baseClassTextBox').val(base_classes);
            jQuery('#queryStepFieldTextBox').val(query_step_fields);
            jQuery('#followupTextBox').val(query_step_followups);
            jQuery('#allowMoreDetailCheckbox').prop('checked', allow_more_details);
            jQuery('#allowFollowUpCheckbox').prop('checked', allow_followups);
            jQuery('#ids').val(ids);

            jQuery('.createdFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(creatorOperator);
            var dates = created.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.createdFilter', creatorOperator, dates);

            jQuery('.lastChangedFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(changerOperator);
            var dates = changed.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.lastChangedFilter', changerOperator, dates);

            jQuery('.executeFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(executeOperator);
            var dates = executed.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.executeFilter', executeOperator, dates);

            jQuery('.validateFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(validateOperator);
            var dates = validated.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.validateFilter', validateOperator, dates);

            numberOfExecuteOperator = parseInt(numberOfExecuteOperator);
            jQuery('#dropdownNumberExcutes').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(numberOfExecuteOperator);
            var times = times_executed.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            if (numberOfExecuteOperator === 0) {
                jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(false);
                jQuery('#textNumberExcutes').data('kendoNumericTextBox').value(0);
            }
            else if (numberOfExecuteOperator === 1) {
                jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(true);
                jQuery('#textNumberExcutes').data('kendoNumericTextBox').value(times[0]);
            }
            else if (numberOfExecuteOperator === 2) {
                jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(true);
                jQuery('#textNumberExcutes').data('kendoNumericTextBox').value(parseInt(times[0]) - 1);
            }
            else if (numberOfExecuteOperator === 3) {
                jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(true);
                jQuery('#textNumberExcutes').data('kendoNumericTextBox').value(parseInt(times[1]) + 1);
            }

            jQuery('#dropdownPublicStatus').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(self.GetOperatorValueFromFacet('facet_isprivate'));
            jQuery('#dropdownValidation').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(self.GetOperatorValueFromFacet('facet_isvalidated'));
            jQuery('#dropdownStarred').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(self.GetOperatorValueFromFacet('facet_isstarred'));
            jQuery('#dropdownWarning').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(self.GetOperatorValueFromFacet('facet_has_warnings'));
        }


        if (self.GetAdvanceSearchQueryFromUri().length > 0 || self.HaveWariningInAdvanceFilter()) {
            jQuery('.btnRemoveFilter').show();
        }
        else {
            jQuery('.btnRemoveFilter').hide();
        }

    };

    self.HaveWariningInAdvanceFilter = function () {
        var warningValue = self.GetOperatorValueFromFacet('facet_has_warnings');
        var showAngleWarningInFacet = self.ShowAngleWarningInFacet();
        return (warningValue !== 0 && !showAngleWarningInFacet);
    };

    self.ShowAngleWarningInFacet = function () {
        var clientSetting = jQuery.parseJSON(userSettingModel.Data().client_settings);
        return clientSetting[enumHandlers.CLIENT_SETTINGS_PROPERTY.SHOW_FACET_ANGLE_WARNINGS];
    }

    self.GetOperatorValueFromFacet = function (facet) {
        var fq = self.GetParams().fq;
        var facetcatCharacteristics = fq.json['facetcat_characteristics'];
        var facetcatNegativeCharacteristics = fq.json['-facetcat_characteristics'];
        if (jQuery.inArray(facet, facetcatCharacteristics) > -1)
            return 1;
        else if (jQuery.inArray(facet, facetcatNegativeCharacteristics) > -1)
            return 2;
        else
            return 0;
    };

    self.ClearAdvanceSearchUI = function () {
        if (jQuery('#popupAdvanceFilter').length) {
            jQuery('#createdFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value('');
            jQuery('#lastChangedFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value('');
            jQuery('#executeFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value('');
            jQuery('#validateFilter').data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE).value('');
            jQuery('#nameTextBox').val('');
            jQuery('#descriptionTextBox').val('');
            jQuery('#displayNameTextBox').val('');
            jQuery('#displayDescriptionTextBox').val('');
            jQuery('#baseClassTextBox').val('');
            jQuery('#queryStepFieldTextBox').val('');
            jQuery('#followupTextBox').val('');
            jQuery('#allowMoreDetailCheckbox').prop('checked', false);
            jQuery('#allowFollowUpCheckbox').prop('checked', false);
            jQuery('#ids').val('');
            jQuery('.createdFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value('0');
            self.BindUsagesValues('.createdFilter', 0, null);
            jQuery('.lastChangedFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value('0');
            self.BindUsagesValues('.lastChangedFilter', 0, null);
            jQuery('.executeFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value('0');
            self.BindUsagesValues('.executeFilter', 0, null);
            jQuery('.validateFilter .dropdownUsageOperators:eq(1)').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value('0');
            self.BindUsagesValues('.validateFilter', 0, null);

            jQuery('#dropdownNumberExcutes').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value('0');
            jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(false);
            jQuery('#textNumberExcutes').data('kendoNumericTextBox').value(0);

            if (self.HaveWariningInAdvanceFilter())
                jQuery('#facet_has_warnings').prop('checked', false);
        }
    };

    self.ClearAdvanceSearch = function () {
        self.ClearAdvanceSearchUI();
        var fq = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ) || '';
        fq = fq.split(' AND ');

        if (fq.length > 0) {
            WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ, fq.join(' AND '));
        }
        self.Search(false);
    };

  
}
