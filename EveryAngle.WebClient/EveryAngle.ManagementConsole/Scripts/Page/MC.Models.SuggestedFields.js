(function (win, models) {

    function SuggestedFields() {
        var self = this;
        self.ModelUri = '';
        self.FieldsUri = '';
        self.GetModelClassesUri = '';
        self.GetModelAnglesUri = '';
        self.GetFieldsUri = '';
        self.GetFieldSourceUri = '';
        self.GetFieldDomainUri = '';
        self.GetHelpTextUri = '';
        self.GetHelpTextsUri = '';
        self.FieldCategoriesIconPath = '';
        self.ResourceIconPath = '';
        self.DefaultPagesize = 30;
        self.MaxPageSize = 100;
        self.MaxDomainElementsForSearch = '';
        self.BusinessProcessesData = [];
        self.FieldCategoriesData = [];
        self.ElementTarget = null;
        self.SaveSuggestedByFieldsUri = '';
        self.SaveSuggestedByClassessUri = '';
        self.GetModelSuggestedUri = '';
        self.ModelId = '';
        self.ModelData = null;
        self.ClientSettings = '';

        self.SUGGEST_FOR = {
            SINGLE_OBJECT: 'single_object',
            BASIC_LIST: 'basic_list',
            DEFAULT_TEMPLATE: 'default_template',
            ALL_TEMPLATE: 'all_template',
            CLEAR_ALL: 'clear_all'
        };

        self.Initial = function (data) {
            self.ModelUri = '';
            self.FieldsUri = '';
            self.GetModelClassesUri = '';
            self.GetModelAnglesUri = '';
            self.GetFieldsUri = '';
            self.GetFieldSourceUri = '';
            self.GetFieldDomainUri = '';
            self.GetHelpTextUri = '';
            self.GetHelpTextsUri = '';
            self.FieldCategoriesIconPath = '';
            self.ResourceIconPath = '';
            self.DefaultPagesize = 30;
            self.MaxPageSize = 100;
            self.MaxDomainElementsForSearch = '';
            self.BusinessProcessesData = [];
            self.FieldCategoriesData = [];
            self.SaveSuggestedByFieldsUri = '';
            self.SaveSuggestedByClassessUri = '';
            self.GetModelSuggestedUri = '';
            self.ModelId = '';
            self.ModelData = null;

            jQuery.extend(self, data || {});

            if (self.ModelData.Uri) {
                self.ModelData.uri = self.ModelData.Uri;
            }

            setTimeout(function () {

                self.InitialClassesChooser();

                self.InitialFieldsChooser();

            }, 1);
        };
        self.ShowConfirmPopup = function (title) {
            $('#btnShowSelectedClasses').trigger('click');

            // close previous popup
            self.CloseClassesChooser();
            self.CloseFieldChooser();

            setTimeout(function () {
                var win = jQuery('#popupSelectedClasses').data('kendoWindow');
                win.setOptions({ title: title });
                MC.ui.popup('setTooltip', {
                    element: '#popupSelectedClasses'
                });
                MC.ui.popup('setScrollable', {
                    element: '#popupSelectedClasses'
                });
            }, 1);
        };
        self.CloseConfirmPopup = function () {
            var popupSelectedClasses = jQuery('#popupSelectedClasses').data('kendoWindow');
            if (popupSelectedClasses) {
                popupSelectedClasses.close();
            }
        };
        self.ShowConfirmSetAllTemplateFieldsToSuggested = function (element, target) {
            self.ElementTarget = $(element);
            self.ClassesChooserFor = target;

            var text = Localization.MC_SetAllDefaultTemplateFieldsToSuggestedConfirm;
            $('#selectedClasses').val('');
            $('#popupSelectedClasses .popupContent').html(text);

            self.ShowConfirmPopup(self.ElementTarget.parents('.contentSectionInfoItem').find('strong').html());
        };
        self.SaveSuggestedFields = function () {
            // close all popup
            self.CloseClassesChooser();
            self.CloseFieldChooser();
            self.CloseConfirmPopup();

            var suggestedFieldsData = $('#selectedClasses').val();
            if (self.ClassesChooserFor === self.SUGGEST_FOR.SINGLE_OBJECT) {
                var suggestedFieldsDataList = suggestedFieldsData.split(',');
                var saveSuggestedSingleObjectFields = function (suggestedFieldUri, isSuggested, fieldName, reportIndex) {
                    var deferred = jQuery.Deferred();
                    MC.ajax.request({
                        url: self.SaveSuggestedByFieldsUri,
                        type: 'POST',
                        parameters: {
                            suggestedFieldUri: suggestedFieldUri,
                            suggestedFieldData: JSON.stringify({ is_suggested: isSuggested })
                        }
                    })
                    .done(function (data, status, xhr) {
                        MC.util.massReport.onDone(arguments, deferred, Localization.MC_Field, fieldName, reportIndex);
                    })
                    .fail(function (xhr, status, error) {
                        MC.util.massReport.onFail(arguments, deferred, Localization.MC_Field, fieldName, reportIndex);
                    });

                    return deferred.promise();
                };

                var requests = [];
                var index = 0;
                var fieldElements = jQuery('#FieldsList li');
                while (suggestedFieldsDataList.length) {
                    var fieldsUri = suggestedFieldsDataList.splice(0, 1);
                    if (fieldsUri.length) {
                        var fieldClassUri = fieldsUri[0];
                        var fieldElement = fieldElements.filter('[data-uri="' + fieldClassUri + '"]');
                        if (fieldElement.length) {
                            var fieldName = fieldElement.text() || fieldClassUri;
                            var suggestStatus = fieldElement.data('status');
                            requests.pushDeferred(saveSuggestedSingleObjectFields, [fieldClassUri, suggestStatus, fieldName + (suggestStatus ? Localization.MC_SetToSuggested : Localization.MC_SetToNotSuggested), index]);
                            index++;
                        }
                    }
                }

                MC.util.massReport.start(requests, function () {
                    MC.util.massReport.showReport(Localization.MC_ManageSuggestedFieldsReport, function () {
                        MC.ajax.reloadMainContent();
                    });
                });
            }
            else {
                var deferred = $.Deferred();
                var checkProgress = function (response) {
                    if (response.status === 'finished') {
                        MC.util.massReport.reports[0] = '<li class="success">' + Localization.MC_TaskSuccess + '</li>';
                        deferred.resolve();
                    }
                    else if (response.status === 'failed') {
                        MC.util.massReport.reports[0] = '<li class="fail">' + Localization.MC_TaskFailed + '</li>';
                        deferred.resolve();
                    }
                    else {
                        setTimeout(function () {
                            MC.ajax.request({
                                url: self.GetModelSuggestedUri,
                                parameters: {
                                    modelSuggestedUri: response.Uri
                                }
                            })
                            .fail(function (xhr, status, error) {
                                self.ShowAjaxErrorDetail(xhr, status, error, deferred);
                            })
                            .done(function (data, status, xhr) {
                                MC.util.massReport.setStatus(Localization.MC_CurrentProgress, data.status, '');

                                checkProgress(data);
                            });
                        }, 1000);
                    }
                };

                MC.util.massReport.initial();
                MC.util.massReport.setStatus(Localization.MC_CurrentProgress, 'Saving', '');

                var data = {
                    "actions": [
                        {
                            "action_type": "mass_change_suggested",
                            "arguments": [
                                {
                                    "name": "model",
                                    "value": self.ModelId
                                },
                                {
                                    "name": "object_ids",
                                    "value": JSON.stringify(suggestedFieldsData.split(','))
                                },
                                {
                                    "name": "mass_change_type",
                                    "value": self.ClassesChooserFor
                                }
                            ],
                            "notification": null,
                            "approval_state": "enabled"
                        }
                    ],
                    "description": "Mass change of suggested fields",
                    "triggers": [],
                    "action_count": 1,
                    "delete_after_completion": false,
                    "enabled": true,
                    "last_run_result": "not_started",
                    "last_run_time": null,
                    "max_run_time": 0,
                    //"deleteoncompletion": true,
                    "name": "Mass change of suggested fields type " + self.ClassesChooserFor,
                    "next_run_time": null,
                    "status": "not_started"
                };

                MC.ajax.request({
                    url: self.SaveSuggestedByClassessUri,
                    type: 'POST',
                    parameters: {
                        taskData: JSON.stringify(data)
                    }
                })
                .fail(function (xhr, status, error) {
                    self.ShowAjaxErrorDetail(xhr, status, error, deferred);
                })
                .done(function (data, status, xhr) {
                    checkProgress(data);
                });

                deferred.always(function () {
                    MC.util.massReport.showReport('Manage suggested fields report', function () {
                        MC.ajax.reloadMainContent();
                    });
                });
                deferred.promise();
            }
        };
        self.ShowAjaxErrorDetail = function (xhr, status, error, deferred) {
            var errorMessageElement = MC.ajax.getErrorMessage(xhr, null, error);
            var errorInfo = jQuery(errorMessageElement).filter('p').text();
            MC.util.massReport.reports[0] = kendo.format('<li class="fail">{0}</li>', errorInfo);
            MC.ajax.setErrorDisable(xhr, status, error, deferred);
        };

        /* begin - classes chooser */
        var cacheHelps = {};
        self.ClassesChooserHandler = null;
        self.ClassesChooserFor = null;
        self.InitialClassesChooser = function () {
            var settings = {
                model: self.ModelUri,
                createby_object: {
                    bp: [],
                    q: ''
                }
            };
            $.each(self.BusinessProcessesData, function (index, bp) {
                bp.is_allowed = true;
            });

            self.ClassesChooserHandler = new ClassesChooser('ClassesChooser', '#popupClassesChooser .popupContent', settings);
            self.ClassesChooserHandler.ShowHelpBehavior = self.ClassesChooserHandler.HELPBEHAVIOR.TOGGLE;
            self.ClassesChooserHandler.MaxPageSize = self.MaxPageSize;
            self.ClassesChooserHandler.CurrentModelData = self.ModelData;
            self.ClassesChooserHandler.ClassTarget = 'uri';
            self.ClassesChooserHandler.BusinessProcessHandler = new BusinessProcessesViewModel(self.BusinessProcessesData);
            self.ClassesChooserHandler.BusinessProcessHandler.Theme('flat');
            self.ClassesChooserHandler.BusinessProcessHandler.MultipleActive(true);
            self.ClassesChooserHandler.BusinessProcessHandler.CanEmpty(true);
            self.ClassesChooserHandler.BusinessProcessHandler.ClickCallback(function (data, e, status) {
                self.ClassesChooserHandler.FilterClasses();
            });
            self.ClassesChooserHandler.BusinessProcessHandler.ClickHeaderCallback(function (oldList, newList) {
                if (oldList.length === newList.length) {
                    var list = {};
                    jQuery.each(newList, function (index, bp) {
                        list[bp] = false;
                    });
                    self.ClassesChooserHandler.BusinessProcessHandler.CurrentActive(list);
                }
                self.ClassesChooserHandler.FilterClasses();
            });

            self.ClassesChooserHandler.AbortAll = function () {
                //MC.system.abort();
                MC.ajax.abortAll();
            };
            self.ClassesChooserHandler.AbortAllRequest = function () {
                MC.ajax.abortAll();
            };
            self.ClassesChooserHandler.OnException = function (type, title, message) {
                MC.util.showPopupAlert(message);
            };
            self.ClassesChooserHandler.ShowHelpText = self.ShowHelpText;
            self.ClassesChooserHandler.SetDisableUI = self.SetDisableUI;
            self.ClassesChooserHandler.LoadAngleRelateBusinessProcesses = self.LoadAngleRelateBusinessProcesses;
            self.ClassesChooserHandler.LoadAllClasses = self.LoadAllClasses;
            self.ClassesChooserHandler.OnSubmitClasses = self.OnSubmitClasses;
            self.ClassesChooserHandler.SetSelectedClassesCallback = self.SetSelectedClassesCallback;
            self.ClassesChooserHandler.ApplyHandler();
        };
        self.ShowClassesChooser = function (element, target) {
            self.ElementTarget = $(element);
            self.ClassesChooserFor = target;

            // resize events
            MC.ui.popup('setScrollable', {
                element: '#popupClassesChooser',
                onResize: function (win) {
                    if (win.wrapper.is(':visible')) {
                        var businessProcessBar = win.element.find('.businessProcesses');
                        if (businessProcessBar.length) {
                            businessProcessBar.css('max-width', win.element.find('.businessProcessContainer').width());
                            if (self.ClassesChooserHandler.BusinessProcessHandler) {
                                self.ClassesChooserHandler.BusinessProcessHandler.UpdateLayout(businessProcessBar);
                            }

                            // grid + help
                            var gridElement = win.wrapper.find('.k-grid');
                            var winHeight = win.element.height();
                            var height = winHeight - win.element.find('.searchObjectGridContainer').position().top - 120;
                            jQuery('#ObjectsGrid').height(height - jQuery('#ObjectsGridContainer').position().top - 15);
                            var winWidth = win.element.width();
                            if (winWidth > 760) {
                                win.element.removeClass('compactMode');
                                win.element.find('.Description').height(height);
                            }
                            else {
                                win.element.addClass('compactMode');
                                win.element.find('.Description').height('auto');
                            }
                            kendo.resize(gridElement, true);
                        }
                    }
                }
            });

            var win = $('#popupClassesChooser').data('kendoWindow');
            win.wrapper.addClass('k-wc');

            // set options
            if (self.ClassesChooserFor === self.SUGGEST_FOR.SINGLE_OBJECT) {
                self.ClassesChooserHandler.MultipleSelection = false;

                win.element.find('.btnSelectAll, .btnClearAll').addClass('alwaysHidden');
            }
            else {
                self.ClassesChooserHandler.MultipleSelection = true;

                win.element.find('.btnSelectAll, .btnClearAll').removeClass('alwaysHidden');
            }

            // clear selection
            self.ClassesChooserHandler.ClassesChooserSettings = {
                model: self.ModelUri,
                createby_object: {
                    bp: [],
                    q: ''
                }
            };

            //submit button
            self.SetSelectedClassesCallback([]);
            $('#ButtonContinue').off('click').on('click', function (e) {
                self.ClassesChooserHandler.OnSubmitClasses(self.ClassesChooserHandler.GetAllSelectedClasses());
            });

            setTimeout(function () {
                win.setOptions({ title: self.ElementTarget.parents('.contentSectionInfoItem').find('strong').html() });
                MC.ui.popup('setTooltip', {
                    element: '#popupClassesChooser'
                });
                win.trigger('resize');
                self.ClassesChooserHandler.FilterClasses();
            }, 1);
        };
        self.CloseClassesChooser = function () {
            var popupClassesChooser = jQuery('#popupClassesChooser').data('kendoWindow');
            if (popupClassesChooser) {
                popupClassesChooser.close();
            }
        };
        self.SelectAllClasses = function () {
            var grid = $('#ObjectsGrid').data('kendoGrid');
            if (grid) {
                self.ClassesChooserHandler.SelectingClasses = [];

                grid.element.find(':checkbox').prop('checked', true);
                $.each(grid.dataSource.data(), function (index, data) {
                    if ($('#objectId' + data.id).length) {
                        data.checked = true;
                        self.ClassesChooserHandler.SelectingClasses.push(data.id);
                    }
                });

                var selectedClasses = self.ClassesChooserHandler.GetAllSelectedClasses();
                self.SetSelectedClassesCallback(selectedClasses);
            }
        };
        self.ClearAllClasses = function () {
            var grid = $('#ObjectsGrid').data('kendoGrid');
            if (grid) {
                self.ClassesChooserHandler.SelectingClasses = [];
                grid.element.find(':checkbox').prop('checked', false);
                $.each(grid.dataSource.data(), function (index, data) {
                    data.checked = false;
                });

                var selectedClasses = self.ClassesChooserHandler.GetAllSelectedClasses();
                self.SetSelectedClassesCallback(selectedClasses);
            }
        };
        self.ShowHelpText = function (classId) {
            var helpTemplate = [
                '<div id="helpText">',
                    '<div class="helpHeaderContainer"></div>',
                    '<div class="helpTextContainer"></div>',
                    '<div class="helpAdditionalContainer"></div>',
                '</div>'
            ].join('');
            var helpContainer = $('#popupClassesChooser .Description').html(helpTemplate);
            if (!classId) {
                var helpHtml;
                switch (self.ClassesChooserFor) {
                    case self.SUGGEST_FOR.SINGLE_OBJECT:
                        helpHtml = Localization.MC_SingleObject_Instruction;
                        break;
                    case self.SUGGEST_FOR.BASIC_LIST:
                        helpHtml = Localization.MC_BasicList_Instruction;
                        break;
                    case self.SUGGEST_FOR.DEFAULT_TEMPLATE:
                        helpHtml = Localization.MC_Template_Instruction;
                        break;
                    case self.SUGGEST_FOR.ALL_TEMPLATE:
                        helpHtml = Localization.MC_AllTemplate_Instruction;
                        break;
                    case self.SUGGEST_FOR.CLEAR_ALL:
                        helpHtml = Localization.MC_ClearAll_Instruction;
                        break;
                }
                helpContainer.find('.helpTextContainer').html(helpHtml);
            }
            else {
                var grid = $('#ObjectsGrid').data('kendoGrid');
                if (grid) {
                    var classesData = JSON.parse(JSON.stringify(grid.dataSource.data()));
                    var classData = classesData.findObject('id', classId);
                    if (classData) {
                        disableLoading();
                        helpContainer.busyIndicator(true);
                        var helpUri = webAPIUrl + classData.helptext + '?viewmode=details';
                        if (!classData.helptext) {
                            cacheHelps[helpUri] = { html_help: '' };
                        }
                        $.when(cacheHelps[helpUri] || MC.ajax.request({
                            url: self.GetHelpTextUri,
                            parameters: { helpTextUri: helpUri }
                        }))
                        .done(function (data, status, xhr) {
                            cacheHelps[helpUri] = data;

                            if (data.html_help) {
                                helpContainer.find('.helpTextContainer').html(data.html_help);
                            }
                        })
                        .always(function () {
                            helpContainer.busyIndicator(false);
                        });
                    }
                }
            }
        };
        self.SetDisableUI = function (disable) {
            if (disable) {
                jQuery('#popupClassesChooser').busyIndicator(true);
            }
            else {
                jQuery('#popupClassesChooser').busyIndicator(false);
            }
        };
        self.SetSelectedClassesCallback = function (classes) {
            if (classes.length) {
                jQuery('#popupClassesChooser .btnContinue').removeClass('disabled');
            }
            else {
                jQuery('#popupClassesChooser .btnContinue').addClass('disabled');
            }
        };
        self.LoadAngleRelateBusinessProcesses = function (uri, query) {
            disableLoading();
            return MC.ajax.request({
                url: self.GetModelAnglesUri,
                parameters: { modelAnglesUri: uri + '?' + jQuery.param(query) }
            })
            .then(function (items) {
                return $.when({ items: items });
            });
        };
        self.LoadAllClasses = function (uri) {
            disableLoading();

            var query = {};
            query['offset'] = 0;
            query['limit'] = self.MaxPageSize;
            query['viewmode'] = 'basic';
            var classUri = uri + '?' + jQuery.param(query);
            return MC.ajax.request({
                url: self.GetModelClassesUri,
                parameters: { modelClassesUri: classUri }
            })
            .then(function (classes) {
                return $.when({ classes: classes });
            });
        };
        self.OnSubmitClasses = function (classes) {
            if (classes.length) {
                if (self.ClassesChooserFor === self.SUGGEST_FOR.SINGLE_OBJECT) {
                    self.ShowFieldsChooser(classes);
                }
                else {
                    var classNames = classes.slice();
                    var classGrid = $('#ObjectsGrid').data('kendoGrid');
                    if (classGrid) {
                        var allClasses = JSON.parse(JSON.stringify(classGrid.dataSource.data()));
                        $.each(classes, function (index, classId) {
                            var classObject = allClasses.findObject('id', classId);
                            classNames[index] = classObject ? classObject.short_name : classId;
                        });
                    }

                    //bind selected classed popup
                    var text = '<ul class="classesList">';
                    classNames.sort(function (a, b) {
                        if (a < b) return -1;
                        else if (a > b) return 1;
                        else return 0;
                    });
                    $.each(classNames, function (index, className) {
                        text += '<li>' + className + '</li>';
                    });
                    text += '</ul>';

                    $('#selectedClasses').val(classes.join(','));
                    $('#popupSelectedClasses .popupContent').html(text);

                    var title = '';
                    switch (self.ClassesChooserFor) {
                        case self.SUGGEST_FOR.SINGLE_OBJECT:
                            title = Localization.MC_SetSuggestedFieldsForObject;
                            break;
                        case self.SUGGEST_FOR.BASIC_LIST:
                            title = Localization.MC_SetDefaultBasicListFieldsToSuggestedForObject;
                            break;
                        case self.SUGGEST_FOR.DEFAULT_TEMPLATE:
                            title = Localization.MC_SetAllDefaultTemplateFieldsToSuggesteForObject;
                            break;
                        case self.SUGGEST_FOR.ALL_TEMPLATE:
                            title = Localization.MC_SetAllTemplateFieldsToSuggesteForObject;
                            break;
                        case self.SUGGEST_FOR.CLEAR_ALL:
                            title = Localization.MC_ClearAllSuggestedFieldsForObject;
                            break;
                    }
                    title = kendo.format(title, $('#suggestedIconTemplate').val());
                    self.ShowConfirmPopup(title);
                }
            }
        };
        /* end - classes chooser */

        /* begin - fields chooser */
        var fieldsChooserClasses = [];
        var suggestionsList = [];
        self.InitialFieldsChooser = function () {

            // private functions
            var getDataFail = function (xhr, status, error) {
                if (status !== 'abort') {
                    self.CloseFieldChooser();
                }
            };
            var updateFieldStarred = function (data) {
                $.each(data.fields || [], function (index, field) {
                    if (field.user_specific) {
                        field.user_specific.is_starred = false;
                    }
                });
            };

            // fields chooser
            window.fieldsChooserModel = MC.ui.fieldschooser.initial(self.DefaultPagesize, self.MaxPageSize, self.MaxDomainElementsForSearch);
            fieldsChooserModel.PossibleToSetStar = true;
            fieldsChooserModel.AllowMultipleSelection = true;
            fieldsChooserModel.GetFieldSourceUri = self.GetFieldSourceUri;
            fieldsChooserModel.FieldCategoriesData = self.FieldCategoriesData;
            fieldsChooserModel.FieldCategoriesIconPath = self.FieldCategoriesIconPath;
            fieldsChooserModel.ResourceIconPath = self.ResourceIconPath;
            fieldsChooserModel.GetHelpTextsUri = self.GetHelpTextsUri;
            fieldsChooserModel.GetFieldDomainUri = self.GetFieldDomainUri;
            fieldsChooserModel.ModelUri = self.ModelUri;
            fieldsChooserModel.ClientSettings = self.ClientSettings;
            
            // functions
            fieldsChooserModel.SetMarkSelectedItem = function (grid) {
                var rows = grid.tbody.children();
                rows.removeClass('k-state-selected');
                rows.find('.k-dirty-cell').removeClass('k-dirty-cell')
                    .children('.k-dirty').remove();
                jQuery.each(suggestionsList, function (index, item) {
                    rows.filter('[id="field-' + fieldsChooserModel.ConvertFieldName(item.id) + '"]')
                        .children('td:first')
                        .addClass('k-dirty-cell')
                        .prepend('<div class="k-dirty" />');
                });
            };
            fieldsChooserModel.GetFieldsFunction = function (uri, params, callback) {
                disableLoading();
                return MC.ajax.request({
                    url: self.GetFieldsUri + '?fieldsUri=' + escape(uri + '?' + jQuery.param(params))
                })
                .fail(getDataFail)
                .done(function (data, status, xhr) {
                    updateFieldStarred(data);
                    callback(data);
                });
            };
            fieldsChooserModel.SetIsStarred = function (e, obj, uid) {
                if (e.stopPropagation) e.stopPropagation();
                else e.cancelBubble = true;

                var grid = jQuery('#DisplayPropertiesGrid').data('kendoGrid');
                if (grid) {
                    var field = grid.dataSource.getByUid(uid);
                    if (field) {
                        field.is_suggested = !field.is_suggested;

                        // update changed list
                        var existingListIndex = suggestionsList.indexOfObject('id', field.id);
                        if (existingListIndex !== -1) {
                            suggestionsList.splice(existingListIndex, 1);
                        }
                        else {
                            suggestionsList.push(field);
                        }

                        // update default selected list
                        fieldsChooserModel.SelectedItems(suggestionsList.slice());

                        // update view
                        grid.refresh();

                        // update selection event
                        fieldsChooserModel.OnGridSelectionChanged(suggestionsList.slice());
                    }
                }
            };
            fieldsChooserModel.HideFacetsFunction = function (category, id) {
                return category === 'facetcat_characteristics' && (id === 'starred' || id === 'facet_isstarred' || id === 'isstarred');
            };
            fieldsChooserModel.OnGridSelectionChanged = function (selectedItems) {
                // update default selected list
                fieldsChooserModel.SelectedItems(suggestionsList.slice());

                if (suggestionsList.length) {
                    $('#popupFieldChooser .btnAddProperty').removeClass('disabled');
                }
                else {
                    $('#popupFieldChooser .btnAddProperty').addClass('disabled');
                }

                jQuery('#selectedItems').text(suggestionsList.length ? suggestionsList.length + ' item(s) changed, ' : '');
            };
            fieldsChooserModel.GetCustomQueryUriFunction = function (page) {
                var request = {
                    url: self.FieldsUri,
                    data: {
                        offset: (page - 1) * fieldsChooserModel.ResultPerPage,
                        limit: fieldsChooserModel.ResultPerPage
                    }
                };
                var query = fieldsChooserModel.GetKeywordQuery();
                request.data.classes = fieldsChooserClasses.join(',');

                jQuery.extend(
                    request.data,
                    query,
                    fieldsChooserModel.GetSortQuery(),
                    fieldsChooserModel.GetFacetQuery(),
                    fieldsChooserModel.GetDetailedSearchQuery()
                );

                return request;
            };
            fieldsChooserModel.GetFieldChooserButtons = function () {
                return [
                    {
                        text: Captions.Button_Cancel,
                        click: function (e) {
                            if (!jQuery(e.currentTarget).hasClass('disabled')) {
                                self.CloseClassesChooser();
                                self.CloseFieldChooser();
                            }
                        },
                        className: 'btn btnLarge btnPropertyCancel'
                    },
                    {
                        text: Localization.Save,
                        click: function () {
                            fieldsChooserModel.OnSubmit.call();
                        },
                        className: 'btn btnLarge btnPrimary btnAddProperty'
                    },
                    {
                        text: Localization.SelectAll,
                        click: function () {
                            self.SelectAllFields();
                        },
                        className: 'btn btnLarge btnSelectAll'
                    },
                    {
                        text: Localization.ClearAll,
                        click: function () {
                            self.ClearAllFields();
                        },
                        className: 'btn btnLarge btnClearAll'
                    }
                ];
            };
            fieldsChooserModel.OnSubmit = function () {
                var fields = suggestionsList.slice();
                if (jQuery.active || !fields.length) return;

                self.OnSubmitFields(fields, fieldsChooserClasses);
            };
            fieldsChooserModel.UpdateClientSettings = function (clientSettings) {
                self.ClientSettings = clientSettings;
            };

        };
        
        self.GetFieldsChooserPopupTitle = function (classes) {
            // start set popup title
            var classNames = classes.slice();
            var classGrid = $('#ObjectsGrid').data('kendoGrid');
            if (classGrid) {
                var allClasses = JSON.parse(JSON.stringify(classGrid.dataSource.data()));
                $.each(classes, function (index, classId) {
                    var classObject = allClasses.findObject('id', classId);
                    classNames[index] = classObject ? classObject.short_name : classId;
                });
            }

            return self.ElementTarget.parents('.contentSectionInfoItem').find('strong').html() + ': ' + classNames.join(', ');
            // end set popup title
        };
        self.ShowFieldsChooser = function (classes) {

            fieldsChooserClasses = classes;

            suggestionsList = [];

            // get title
            var title = self.GetFieldsChooserPopupTitle(classes);
            MC.ui.fieldschooser.showFieldsChooserPopup(title);

            // add element for show number of selected item(s) 
            var selectedIndicator = jQuery('<span id="selectedItems"></span>');
            jQuery('#popupFieldChooser .fieldChooserTotals').prepend(selectedIndicator);

            // enabled buttons after everything loaded
            MC.ui.fieldschooser.checkFieldsChooserButtons('.btnPropertyCancel, .btnSelectAll, .btnClearAll');
            
        };
        self.CloseFieldChooser = function () {
            if (fieldsChooserModel.FieldChooserPopup) {
                fieldsChooserModel.FieldChooserPopup.close();
            }
        };

        self.SelectAllFields = function () {
            if (!jQuery('#popupFieldChooser').find('.btnSelectAll').hasClass('disabled')) {
                // M4-22894: Call 2 times for fix kendo load skip data bug, don't effect with the performance because kendo don't request if datasource already have data
                self.SetAllSuggested(false, false)
                    .always(function () {
                        self.SetAllSuggested(true, true);
                    });
            }
        };
        self.ClearAllFields = function () {
            if (!jQuery('#popupFieldChooser').find('.btnClearAll').hasClass('disabled')) {
                self.SetAllSuggested(false, true);
            }
        };
        self.SetAllSuggested = function (isSuggested, hideProgressBar) {
            var deferred = jQuery.Deferred();
            var grid = jQuery('#DisplayPropertiesGrid').data('kendoGrid');
            if (grid) {
                $('#popupFieldChooser').busyIndicator(true);

                fieldsChooserModel.OnGridSelectionChanged([]);

                var prefetch = function (dataSource, i, callback) {
                    grid.content.busyIndicator(false);
                    dataSource.prefetch(i * dataSource.take(), dataSource.take(), function () {
                        i++;
                        if (i < dataSource.totalPages()) {
                            prefetch(dataSource, i, callback);
                        }
                        else {
                            callback();
                        }
                    });
                };
                var selectAllDone = function () {
                    var fnCheckGetAllItems = setInterval(function () {
                        grid.content.busyIndicator(false);
                        if (!grid.dataSource._requestInProgress) {
                            clearInterval(fnCheckGetAllItems);

                            // set is_suggested
                            suggestionsList = [];
                            jQuery.each(grid.dataSource._ranges, function (index, range) {
                                jQuery.each(range.data, function (index, item) {
                                    var dataItem = item.toJSON ? item.toJSON() : ko.toJS(item);
                                    var modelField = fieldsChooserModel.Fields.findObject('id', dataItem.id);
                                    if (!modelField) {
                                        modelField = dataItem;
                                        fieldsChooserModel.Fields.push(dataItem);
                                    }

                                    if (item.is_suggested !== isSuggested) {
                                        item.is_suggested = isSuggested;
                                    }
                                    if (modelField.is_suggested !== isSuggested) {
                                        if (suggestionsList.findObject('id', dataItem.id) === null) {
                                            item.is_suggested = isSuggested;
                                            suggestionsList.push(item.toJSON ? item.toJSON() : ko.toJS(item));
                                        }
                                    }
                                });
                            });

                            if (hideProgressBar) {
                                $('#popupFieldChooser').busyIndicator(false);
                            }
                            else {
                                suggestionsList = [];
                            }

                            fieldsChooserModel.SelectedItems(suggestionsList.slice());

                            grid.refresh();
                            fieldsChooserModel.SetMarkSelectedItem(grid);
                            fieldsChooserModel.OnGridSelectionChanged(suggestionsList.slice());

                            setTimeout(function () {
                                deferred.resolve();
                            }, 1);
                        }
                    }, 100);
                };

                grid.dataSource.enableRequestsInProgress();
                prefetch(grid.dataSource, 0, selectAllDone);
            }
            return deferred.promise();
        };
        self.OnSubmitFields = function (fields, classes) {
            var classObject = null;
            if (classes.length) {
                var classGrid = $('#ObjectsGrid').data('kendoGrid');
                if (classGrid) {
                    var allClasses = JSON.parse(JSON.stringify(classGrid.dataSource.data()));
                    classObject = allClasses.findObject('id', classes[0]);
                }
            }

            if (classObject && fields.length) {

                var fieldsUri = [];
                var text = '<ul class="fieldsList" id="FieldsList">';
                fields.sortObject('short_name', -1, false);
                $.each(fields, function (index, field) {
                    var fieldClassUri = classObject.uri + field.uri.substr(field.uri.indexOf('/fields/'));
                    fieldsUri.push(fieldClassUri);

                    var sourceField = field.source ? fieldsChooserModel.GetFieldSourceByUri(field.source) : null;
                    text += '<li data-uri="' + fieldClassUri + '" data-status="' + field.is_suggested + '">' + (sourceField ? (sourceField.short_name || sourceField.id) + ' - ' : '') + (field.short_name || field.id) + '</li>';
                });
                text += '</ul>';

                $('#selectedClasses').val(fieldsUri.join(','));
                $('#popupSelectedClasses .popupContent').html(text);
                $('#btnShowSelectedClasses').trigger('click');

                var title = kendo.format(Localization.MC_SetSuggestedFieldsForObject, $('#suggestedIconTemplate').val());
                self.ShowConfirmPopup(title);
            }
        };
        /* end - fields chooser */
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        SuggestedFields: new SuggestedFields()
    });
})(window, MC.Models);
