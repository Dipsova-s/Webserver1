var searchQueryModel = new SearchQueryViewModel();

function SearchQueryViewModel() {
    "use strict";

    var self = this;

    self.Search = function (isRelevancy) {
        if (typeof isRelevancy === 'undefined')
            isRelevancy = false;

        var query = self.GetSearchQueryFromUI(isRelevancy);
        $.address.queryString(query);
    };

    self.GetParams = function () {
        var data = {};
        jQuery.each(enumHandlers.SEARCHPARAMETER, function (key, value) {
            var query = WC.Utility.UrlParameter(value) || null;
            switch (value) {
                case enumHandlers.SEARCHPARAMETER.SORT:
                case enumHandlers.SEARCHPARAMETER.SORT_DIR:
                case enumHandlers.SEARCHPARAMETER.PAGE:
                case enumHandlers.SEARCHPARAMETER.PAGESIZE:
                case enumHandlers.SEARCHPARAMETER.OFFSET:
                case enumHandlers.SEARCHPARAMETER.LIMIT:
                case enumHandlers.SEARCHPARAMETER.Q:
                    data[value] = query || null;
                    break;
                case enumHandlers.SEARCHPARAMETER.FQ:
                    var raw = decodeURIComponent(query).replace(/\)/g, '').replace(/\(/g, '').replace(/"/g, '').split(/ and /ig),
                        fqData = {},
                        fqDataChecked = [],
                        fqDataUnchecked = [],
                        facet;
                    jQuery.each(raw, function (key2, value2) {
                        if (value2.indexOf(':') !== -1) {

                            // temporary fixed facetcat_admin
                            if (value2.toLowerCase().indexOf(' or ') !== -1) {
                                var category = value2.split(':')[0] + ':',
                                    regexpr = new RegExp(category, 'gi'),
                                    items = value2.replace(regexpr, '').split(/ or /gi);
                                value2 = category + items.join(' ');
                            }

                            facet = value2.split(':');
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
                    data[value] = { json: fqData, checked: fqDataChecked, unchecked: fqDataUnchecked };
                    break;
                default:
                    break;
            }
        });

        return data;
    };
    self.HasSearchQuery = function () {
        var params = self.GetParams();
        return !jQuery.isEmptyObject(params.fq.json) || params.q || params.sort;
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
        }

        // Add facet question to search query
        var isAvanceSearch = jQuery('#popupAdvanceFilter').is(":visible");
        var facetParameter = self.GetFacetFilterParameter(isAvanceSearch);
        var facetQuery = [];

        if (facetParameter) {
            facetQuery.push(facetParameter);
        }
        
        if (facetQuery.length)
            query += '&' + enumHandlers.SEARCHPARAMETER.FQ + '=' + facetQuery.join(' AND ');

        if (WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.VIEWMODE))
            query += '&' + enumHandlers.SEARCHPARAMETER.VIEWMODE + '=' + searchPageHandler.DisplayType();


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
                sortOptions[enumHandlers.SEARCHPARAMETER.SORT] = sortUI.value().split('-')[0] || 'name';
                if (sortUI.dataItem()) {
                    sortOptions[enumHandlers.SEARCHPARAMETER.SORT_DIR] = sortUI.dataItem().id.split('-')[1] || 'asc';
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

        var sortUI = searchPageHandler.BindSortingDropdown();
        var dataItem = sortUI.dataItem();
        if (dataItem) {
            if (searchPageHandler.IsSortingHasDirection(value)) {
                value = value + '-' + dir;
            }
            sortUI.value(value);
        }
    };

    self.GetSortParameterFromUI = function (isRelevancy) {
        var sortValueFromUI = self.GetSortByFromUI(isRelevancy);
        if (sortValueFromUI[enumHandlers.SEARCHPARAMETER.SORT]) {
            return unescape(jQuery.param(sortValueFromUI));
        }
        return '';
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
                    if (jQuery(subElement).next().hasClass('strike-through')) {
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
        var faceList = ['facet_isprivate', 'facet_isvalidated', 'facet_isstarred', 'facet_has_warnings'];
        return jQuery.inArray(subElement.id, faceList) !== -1;
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
            jQuery.each(usageClasses, function (index, currentClass) {
                // usage user
                var autoCompleteElement = jQuery(currentClass.key + ' .userFilter:input');
                var autoCompleteObject = autoCompleteElement.data(enumHandlers.KENDOUITYPE.AUTOCOMPLETE);
                self.SetGeneralQuery(queries, currentClass.userFilter, autoCompleteObject.value());

                // usage operator
                var dropdownUsage = WC.HtmlHelper.DropdownList(currentClass.key + ' .dropdownUsageOperators[data-role="dropdownlist"]');
                var usageContainer = dropdownUsage.wrapper.closest('.popupAdvFilteringContent');
                var usageOperator = parseInt(dropdownUsage.value());
                var startDate = usageContainer.find('input.datepickerFrom').data(enumHandlers.KENDOUITYPE.DATEPICKER).value();
                var finishDate = usageContainer.find('input.datepickerTo').data(enumHandlers.KENDOUITYPE.DATEPICKER).value();
                if (self.IsValidUsageFilter(usageOperator, startDate, finishDate)) {
                    self.SetUsageOperatorQuery(queries, currentClass, usageOperator, startDate, finishDate);
                }
            });

            var dropdownUsage = WC.HtmlHelper.DropdownList(jQuery('#dropdownNumberExcutes'));
            self.SetNumberExcuteQuery(queries, dropdownUsage.value(), jQuery('#textNumberExcutes').val());

            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.IDS, jQuery.trim(jQuery('#ids').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME, jQuery.trim(jQuery('#nameTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION, jQuery.trim(jQuery('#descriptionTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES, jQuery.trim(jQuery('#displayNameTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS, jQuery.trim(jQuery('#displayDescriptionTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES, jQuery.trim(jQuery('#baseClassTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS, jQuery.trim(jQuery('#queryStepFieldTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS, jQuery.trim(jQuery('#followupTextBox').val()));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS, jQuery('#allowMoreDetailCheckbox').prop('checked'));
            self.SetGeneralQuery(queries, enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS, jQuery('#allowFollowUpCheckbox').prop('checked'));
        }
        else {
            queries = self.GetAdvanceSearchQueryFromUri();
        }

        var query = queries.join('&');
        return query;
    };
    self.SetGeneralQuery = function (queries, name, value) {
        if (value) {
            queries.push(name + '=' + encodeURIComponent(value));
        }
    };
    self.SetUsageOperatorQuery = function (queries, currentClass, usageOperator, startDate, finishDate) {
        var lastTimeOfDay = 86399;
        if (startDate) {
            startDate = kendo.date.toUtcTime(kendo.date.getDate(startDate)) / 1000;
        }
        else {
            startDate = '*';
        }

        if (finishDate) {
            finishDate = kendo.date.toUtcTime(kendo.date.getDate(finishDate)) / 1000;
            finishDate += lastTimeOfDay;
        }
        else {
            finishDate = '*';
        }

        if (usageOperator === 1) {
            finishDate = startDate + lastTimeOfDay;
            queries.push(currentClass.operator + '=' + usageOperator + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + finishDate + ']');
        }
        else if (usageOperator === 2) {
            if (startDate !== '*' && finishDate !== '*') {
                queries.push(currentClass.operator + '=' + usageOperator + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + finishDate + ']');
            }
            else {
                queries.push(currentClass.operator + '=' + usageOperator + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + '*]');
            }
        }
        else if (usageOperator === 3) {
            startDate -= 1;
            queries.push(currentClass.operator + '=' + usageOperator + '&' + currentClass.datefilter + '=[* TO ' + startDate + ']');
        }
        else {
            queries.push(currentClass.operator + '=' + usageOperator + '&' + currentClass.datefilter + '=[' + startDate + ' TO ' + finishDate + ']');
        }
    };
    self.SetNumberExcuteQuery = function (queries, usageOperator, numberOfExecute) {
        usageOperator = parseInt(usageOperator);
        if (usageOperator > 0) {
            numberOfExecute = parseInt(numberOfExecute);
            if (isNaN(numberOfExecute)) {
                numberOfExecute = 0;
            }
            if (usageOperator === 1) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + usageOperator + '&times_executed=[' + numberOfExecute + ' TO ' + numberOfExecute + ']');
            }
            else if (usageOperator === 2) {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + usageOperator + '&times_executed=[' + (numberOfExecute + 1) + ' TO ' + '*]');
            }
            else {
                queries.push(enumHandlers.ADVANCESEARCHPARAMETER.NUMBEROFEXECUTEOPERATOR + '=' + usageOperator + '&times_executed=[*' + ' TO ' + (numberOfExecute - 1) + ']');
            }
        }
    };
    self.IsValidUsageFilter = function (usageOperator, startDate, finishDate) {
        var isValidSingleOperator = usageOperator > 0 && usageOperator < 4 && startDate;
        var isValidBetweenOperator = usageOperator === 4 && startDate && finishDate;
        return isValidSingleOperator || isValidBetweenOperator;
    };

    self.GetAdvanceSearchForCharacteristic = function (target, characteristicsName) {
        var dropdownObject = WC.HtmlHelper.DropdownList('#' + target);
        if (dropdownObject) {
            var usageOperator = dropdownObject.value();
            if (usageOperator === 1) {
                return characteristicsName;
            }
            else if (usageOperator === 2) {
                return '-' + characteristicsName;
            }
        }
        return null;
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
    
    self.GetAdvanceSearchQueryFromUri = function () {
        var queries = [];
        var creator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATOR);
        if (creator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CREATOR + '=' + decodeURIComponent(creator));
        }

        var creatorOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATOROPERATOR);
        if (creatorOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CREATOROPERATOR + '=' + creatorOperator);
        }

        var created = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATED);
        if (created) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CREATED + '=' + decodeURIComponent(created));
        }

        var changer = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGER);
        if (changer) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CHANGER + '=' + decodeURIComponent(changer));
        }

        var changerOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGEROPERATOR);
        if (changerOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CHANGEROPERATOR + '=' + changerOperator);
        }

        var changed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGED);
        if (changed) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.CHANGED + '=' + decodeURIComponent(changed));
        }

        var executor = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR);
        if (executor) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR + '=' + decodeURIComponent(executor));
        }

        var executeOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOROPERATOR);
        if (executeOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOROPERATOR + '=' + executeOperator);
        }

        var executed = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED);
        if (executed) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED + '=' + decodeURIComponent(executed));
        }

        var validator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR);
        if (validator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR + '=' + decodeURIComponent(validator));
        }

        var validateOperator = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOROPERATOR);
        if (validateOperator) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOROPERATOR + '=' + validateOperator);
        }

        var validated = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED);
        if (validated) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED + '=' + decodeURIComponent(validated));
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
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.IDS + '=' + decodeURIComponent(ids));
        }


        var item_name = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME);
        if (item_name) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ITEMNAME + '=' + decodeURIComponent(item_name));
        }

        var item_description = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION);
        if (item_description) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ITEMDESCRIPTION + '=' + decodeURIComponent(item_description));
        }

        var display_names = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES);
        if (display_names) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYNAMES + '=' + decodeURIComponent(display_names));
        }
        var display_descriptions = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS);
        if (display_descriptions) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.DISPLAYDESCRIPTIONS + '=' + decodeURIComponent(display_descriptions));
        }
        var base_classes = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES);
        if (base_classes) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.BASECLASSES + '=' + decodeURIComponent(base_classes));
        }

        var query_step_fields = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS);
        if (query_step_fields) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFIELDS + '=' + decodeURIComponent(query_step_fields));
        }
        var query_step_followups = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS);
        if (query_step_followups) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.QUERYSTEPFOLLOWUPS + '=' + decodeURIComponent(query_step_followups));
        }

        var allow_more_details = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS);
        if (allow_more_details) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWMOREDETAILS + '=' + decodeURIComponent(allow_more_details));
        }
        var allow_followups = WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS);
        if (allow_followups) {
            queries.push(enumHandlers.ADVANCESEARCHPARAMETER.ALLOWFOLLOWUPS + '=' + decodeURIComponent(allow_followups));
        }

        return queries;
    };

    self.BindUsagesValues = function (tag, operator, dates) {
        WC.HtmlHelper.DropdownList(tag + ' .dropdownUsageOperators:last').trigger('change');

        var datepickerFrom = jQuery(tag + ' .datepickerFrom:eq(1)').data(enumHandlers.KENDOUITYPE.DATEPICKER);
        var datepickerTo = jQuery(tag + ' .datepickerTo:eq(1)').data(enumHandlers.KENDOUITYPE.DATEPICKER);
        var operatorNumber = parseInt(operator);
        var maxDate, newDate;
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

            maxDate = new Date();
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
            maxDate = new Date();

            datepickerFrom.enable(true);

            if (from !== 'Invalid Date') {
                newDate = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0);
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
                newDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 0);
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
            var created = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CREATED) || ''));
            var executor = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTOR) || ''));
            var executed = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.EXECUTED) || ''));
            var validator = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATOR) || ''));
            var validated = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.VALIDATED) || ''));
            var changer = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGER) || ''));
            var changed = jQuery.trim(decodeURIComponent(WC.Utility.UrlParameter(enumHandlers.ADVANCESEARCHPARAMETER.CHANGED) || ''));

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

            jQuery('.createdFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(creatorOperator);
            var createDates = created.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.createdFilter', creatorOperator, createDates);

            jQuery('.lastChangedFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(changerOperator);
            var changeDates = changed.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.lastChangedFilter', changerOperator, changeDates);

            jQuery('.executeFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(executeOperator);
            var executeDates = executed.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.executeFilter', executeOperator, executeDates);

            jQuery('.validateFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(validateOperator);
            var validateDates = validated.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            self.BindUsagesValues('.validateFilter', validateOperator, validateDates);

            numberOfExecuteOperator = parseInt(numberOfExecuteOperator);
            jQuery('#dropdownNumberExcutes').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(numberOfExecuteOperator);
            var times = times_executed.toLowerCase().replace('[', '').replace(']', '').split(' to ');
            if (numberOfExecuteOperator <= 0) {
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
        }

        var isActiveSearch =
            self.GetAdvanceSearchQueryFromUri().length > 0
            || self.HaveWariningInAdvanceFilter()
            || jQuery("#SearchInput").val();
        self.ToggleSearchActive(isActiveSearch);
    };

    self.ToggleSearchActive = function (isActive) {
        if (isActive) {
            jQuery('#ClearSearchButton').removeClass('alwaysHide');
            jQuery("#Search").addClass('active');
        }
        else {
            jQuery('#ClearSearchButton').addClass('alwaysHide');
            jQuery("#Search").removeClass('active');
        }
    };

    self.HaveWariningInAdvanceFilter = function () {
        var warningValue = self.GetOperatorValueFromFacet('facet_has_warnings');
        var showAngleWarningInFacet = self.ShowAngleWarningInFacet();
        return warningValue > 0 && !showAngleWarningInFacet;
    };

    self.ShowAngleWarningInFacet = function () {
        var clientSetting = jQuery.parseJSON(userSettingModel.Data().client_settings);
        return clientSetting[enumHandlers.CLIENT_SETTINGS_PROPERTY.SHOW_FACET_ANGLE_WARNINGS];
    };

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
            jQuery('.createdFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            self.BindUsagesValues('.createdFilter', 0, null);
            jQuery('.lastChangedFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            self.BindUsagesValues('.lastChangedFilter', 0, null);
            jQuery('.executeFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            self.BindUsagesValues('.executeFilter', 0, null);
            jQuery('.validateFilter .dropdownUsageOperators[data-role="dropdownlist"]').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            self.BindUsagesValues('.validateFilter', 0, null);

            jQuery('#dropdownNumberExcutes').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).value(0);
            jQuery('#textNumberExcutes').data("kendoNumericTextBox").enable(false);
            jQuery('#textNumberExcutes').data('kendoNumericTextBox').value(0);

            if (self.HaveWariningInAdvanceFilter())
                jQuery('#facet_has_warnings').prop('checked', false);
        }
    };

    self.ClearAdvanceSearch = function () {
        jQuery("#SearchInput").val('');
        searchPageHandler.SubmitSearchForm();

        self.ClearAdvanceSearchUI();
        var fq = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ) || '';
        fq = fq.split(' AND ');

        if (fq.length > 0) {
            WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.FQ, fq.join(' AND '));
        }
        self.Search(false);
    };


}
