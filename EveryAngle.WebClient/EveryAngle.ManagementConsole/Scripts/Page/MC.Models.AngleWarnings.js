(function (win, models) {

    function AngleWarnings() {
        var self = this;
        self.SearchAngleWarningsUrl = '';
        self.ExecuteAngleWarningsUrl = '';
        self.ExecuteAutoAngleWarningsUrl = '';
        self.CheckExecuteAngleWarningsUrl = '';
        self.DeleteAngleWarningTaskUrl = '';
        self.GetAllThirdLevelUrl = '';
        self.GetAllJumpsUrl = '';
        self.GetAngleWarningTaskHistoryUrl = '';
        self.WebClientAngleUrl = '';
        self.ModelUri = '';
        self.ModelId = '';
        self.UserId = '';
        self.CanAccessViaWebClient = false;

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
        self.ModelData = null;
        self.ClientSettings = '';

        self.WARNINGTYPE = {
            OBJECT: 'unsupported_start_object',
            JUMP: 'unsupported_jump',
            FILTERFIELD: 'unsupported_filter_field',
            DISPLAYFIELD: 'unsupported_display_field',
            GROUPINGFIELD: 'unsupported_grouping_field',
            AGGREGATIONFIELD: 'unsupported_aggregation_field',
            SORTINGFIELD: 'unsupported_sorting_field',
            OTHER: 'other_warnings'
        };
        self.SOLUTIONACTION = {
            DELETE: 'delete',
            DELETE_ANGLE: 'delete_angle',
            DELETE_DISPLAY: 'delete_display',
            REPLACE_START_OBJECT: 'replace_start_object',
            REPLACE_JUMP: 'replace_jump',
            REPLACE_FIELD: 'replace_field',
            REMOVE_FILTER: 'remove_filter',
            REMOVE_COLUMN: 'remove_column'
        };

        self.ITEMTYPE = {
            ANGLES: { id: 1, text: 'Angles' },
            TEMPLATES: { id: 2, text: 'Templates' },
            BOTH: { id: 0, text: 'Both' }
        };

        self.CurrentSearchData = {};
        self.SelectNode = null;
        self.Solution = {};
        self.JumpData = {};
        // M4-26202: Declare to global variables for easy to modify in the future
        self.NumberFilter = ['number', 'int', 'double'];
        self.DataAreaFiler = ['currency', 'number', 'int', 'double', 'percentage', 'period', 'time', 'timespan'];
        self.PopulateItemTypes = function () {
            var itemTypeDatasources = [];
            jQuery.each(self.ITEMTYPE, function (key, value) {
                itemTypeDatasources.push({ id: value.id, text: value.text });
            });

            $('#item_type').kendoDropDownList({
                dataTextField: "text",
                dataValueField: "id",
                dataSource: itemTypeDatasources
            });
        };

        // initial page
        self.InitialAngleWarnings = function (data) {
            self.SearchAngleWarningsUrl = '';
            self.ExecuteAngleWarningsUrl = '';
            self.ExecuteAutoAngleWarningsUrl = '';
            self.CheckExecuteAngleWarningsUrl = '';
            self.DeleteAngleWarningTaskUrl = '';
            self.GetAllThirdLevelUrl = '';
            self.GetAllJumpsUrl = '';
            self.GetAngleWarningTaskHistoryUrl = '';
            self.WebClientAngleUrl = '';
            self.ModelUri = '';
            self.ModelId = '';
            self.UserId = '';
            self.CanAccessViaWebClient = false;

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
            self.ModelData = null;

            jQuery.extend(self, data || {});

            // set language
            self.WebClientAngleUrl = kendo.format(self.WebClientAngleUrl, userLanguage);

            if (self.ModelData && self.ModelData.Uri) {
                self.ModelData.uri = self.ModelData.Uri;
            }

            setTimeout(function () {

                // set item type
                self.PopulateItemTypes();

                self.InitialClassesChooser();

                // treelist
                var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
                if (treelist) {
                    // handle mousedown event
                    if (!treelist._userEvents._events.__setEvent) {
                        treelist._userEvents._events.__setEvent = true;
                        treelist._userEvents._events.press.splice(0, 0, function (e) {
                            $(e.target).find('tr').removeClass('active');
                            $(e.event.target).closest('tr').addClass('active');
                        });
                    }

                    treelist.bind("dataBound", self.TreeListAngleWarningDataBound);
                    treelist.bind("expand", self.SetRememberActions);
                }

                // handle when reload
                setTimeout(function () {
                    MC.form.page.setCustomState(MC.form.page.STATE.SERVER, function () {
                        self.SelectNode = null;
                        var query = $.extend({}, self.CurrentSearchData);
                        var uiUser = $('#created_by').data('kendoAutoComplete');
                        var uiUserData = [];
                        if (uiUser) {
                            $.each(uiUser.dataItems(), function (index, dataItem) {
                                uiUserData.push(dataItem.toJSON());
                            });
                        }
                        query['user_datasource'] = uiUserData;
                        query['auto_search'] = $('#AngleWarningsTreeListContainer').is(':visible');
                        return {
                            selector: '#TreeListAngleWarnings',
                            query: query
                        };
                    }, function (state) {
                        var treelist = jQuery(state.options.selector).data('kendoTreeList');
                        if (treelist) {
                            var uiUser = $('#created_by').data('kendoAutoComplete');
                            if (uiUser)
                                uiUser.dataSource.data(state.options.query.user_datasource);
                            var uitemType = $('#item_type').data('handler');
                            uitemType.value(self.SetPreSelectedItemType(state.options.query["include_angles"], state.options.query["include_templates"]));

                            $.each(state.options.query, function (id, value) {
                                var element = $('#' + id);
                                if (element.length) {
                                    if (element.is(':checkbox')) {
                                        element.prop('checked', value);
                                    }
                                    else {
                                        element.val(value);
                                    }
                                }
                            });

                            if (state.options.query.auto_search) {
                                self.SearchAngleWarnings();
                            }
                        }

                        MC.form.page.executeState(state);
                    });
                }, 10);

            }, 1);
        };

        // set pre-selected dropdown
        self.SetPreSelectedItemType = function (includeAngles, includeTemplates) {
            if (includeAngles && includeTemplates)
                return "0";
            else if (includeAngles)
                return "1";
            else if (includeTemplates)
                return "2";
        };

        // submit search
        self.GetCurrentSearchQuery = function () {
            var query = {};
            query['include_public'] = $('#include_public').prop('checked');
            query['include_private'] = $('#include_private').prop('checked');
            query['include_validated'] = $('#include_validated').prop('checked');
            switch ($('#item_type').val()) {
                case "1":
                    query['include_angles'] = true;
                    query['include_templates'] = false;
                    break;
                case "2":
                    query['include_angles'] = false;
                    query['include_templates'] = true;
                    break;
                default:
                    query['include_angles'] = true;
                    query['include_templates'] = true;
                    break;
            }
            query['created_by'] = $('#created_by').val();
            return query;
        };
        self.PrepareAngleWarningQuery = function () {
            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            if (treelist) {
                disableLoading();

                if (!treelist.dataSource.transport.options.read.data) {
                    treelist.dataSource.transport.options.read.data = {};
                }

                treelist.dataSource.transport.options.read.data.level = 1;
                delete treelist.dataSource.transport.options.read.data.uri;

                var activeNode = treelist.content.find('.active');
                if (activeNode.length) {
                    var dataItem = treelist.dataSource.getByUid(activeNode.attr('data-uid'));
                    if (dataItem) {
                        treelist.dataSource.transport.options.read.data.level = dataItem.Level + 1;
                        treelist.dataSource.transport.options.read.data.uri = dataItem.Uri;
                    }
                }
            }
        };
        self.GetFilterUserQuery = function () {
            return {
                q: $('#created_by').val()
            };
        };

        self.SearchAngleWarnings = function () {
            // clear user's selected actions after search
            self.RememberAction = {};

            if ($('#FormSearchAngleWarnings').valid()) {
                var query = self.GetCurrentSearchQuery();
                self.CurrentSearchData = $.extend({}, query);
                $('#AngleWarningsSummaryContainer, #AngleWarningsTreeListContainer').addClass('hidden');

                var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
                if (treelist) {
                    treelist.dataSource.data([]);
                }
                return self.RefreshAngleWarningsTreelist(query)
                    .always(function () {
                        $('#AngleWarningsSummaryContainer, #AngleWarningsTreeListContainer').removeClass('hidden');
                        $('#showSolveWarningConfirm').removeClass('alwaysHidden');

                        // trigger resize again after the treelist visibled
                        kendo.resize($('#TreeListAngleWarnings'), true);
                    });
            }
        };

        // set warning info
        self.ApplyAngleWarningsInfo = function (e) {
            if (e.response) {

                if (e.response.Summary) {
                    $.each(e.response.Summary, function (name, value) {
                        if (name === 'WarningsSolvable') {
                            if (value === 0) {
                                $('.btnSolveAutoWarnings').addClass('disabled');
                            }
                            else {
                                $('.btnSolveAutoWarnings').removeClass('disabled');
                            }

                            $('.btnSolveAutoWarnings').text(function (i, text) {
                                return 'Solve with forwarding rules (' + value + ')';
                            });
                        }

                        if (name === 'AnglesTotal') {
                            var label = $('#' + name).parent().prev();
                            self.UpdateAnglesTotalLabel(label);
                        }
                        $('#' + name).text(kendo.toString(parseInt(value || 0, 10), 'n0'));
                    });
                }
                if (e.response.Solutions) {
                    self.Solution[e.response.SolutionId] = e.response.Solutions;
                }
            }
        };

        // update AnglesTotal label accordingly
        self.UpdateAnglesTotalLabel = function (label) {
            if (self.CurrentSearchData['include_angles'] && self.CurrentSearchData['include_templates'])
                $(label).text("Total number of Angles/Templates");
            else if (!self.CurrentSearchData['include_templates'])
                $(label).text("Total number of Angles");
            else if (!self.CurrentSearchData['include_angles'])
                $(label).text("Total number of Templates");
        };

        // apply treelist
        var fnCheckSearch = null;
        self.RefreshAngleWarningsTreelist = function (query) {
            var deferred = $.Deferred();
            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            if (treelist) {
                if (!treelist.dataSource.transport.options.read.data) {
                    treelist.dataSource.transport.options.read.data = {};
                }
                jQuery.extend(treelist.dataSource.transport.options.read.data, query);

                disableLoading();
                clearTimeout(fnCheckSearch);
                $('#AngleWarningSearchResults').busyIndicator(true);
                treelist.content.find('.active').removeClass('active');
                treelist.dataSource.read()
                    .always(function () {
                        fnCheckSearch = setTimeout(function () {
                            $('#AngleWarningSearchResults').busyIndicator(false);
                            self.ExpandWarningFirstLevelNode(self.SelectNode);
                            self.SelectNode = null;
                            treelist.resize();
                        }, 100);
                        deferred.resolve(true);
                    });
            }
            else {
                deferred.resolve(false);
            }
            return deferred.promise();
        };

        // render name of row
        self.GetAngleWarningNameTemplate = function (data) {
            var html = '';
            if (data.Level === 1) {
                if (data.DataFirstLevel.Severity) {
                    html = html + '<span class="' + data.DataFirstLevel.Severity + '"></span>';
                }
                html = html + data.Name;
                html = html + ' (' + kendo.toString(data.DataFirstLevel.Count, 'n0') + ')';
            }
            else if (data.Level === 2) {
                html += '<label>';
                html += '<input type="checkbox" checked="checked"' + (!data.loaded() ? ' disabled="disabled"' : '') + ' onclick="MC.Models.AngleWarnings.ToogleAllChildsSelection(this)">';
                html += '<span class="label">' + data.Name + ' (' + kendo.toString(data.DataSecondLevel.Count, 'n0') + ')</span>';
                html += '</label>';
            }
            else if (data.Level === 3) {
                html += '<label>';
                html += '<input type="checkbox" checked="checked" name="item_' + data.parentId + '">';
                html += '<span class="label itemType"><i class="icon icon-' + data.DataThirdLevel.Type + '"></i>' + data.Name + '</span>';
                html += '</label>';
                var angleUrlTemplate = self.WebClientAngleUrl + '#/?angle={0}&display={1}&editmode=true';
                if (data.DataThirdLevel.DisplayUri) {
                    var displayParts = data.DataThirdLevel.DisplayUri.split('/');
                    if (self.WebClientAngleUrl && self.CanAccessViaWebClient) {
                        html += '<a href="' + kendo.format(angleUrlTemplate, data.DataThirdLevel.AngleUri, data.DataThirdLevel.DisplayUri) + '" target="_blank" class="angleLink">(id=' + displayParts[4] + '\\' + displayParts[6] + ')</a>';
                    }
                    else {
                        html += '<span class="angleLink">(id=' + data.DataThirdLevel.AngleId + '\\' + data.DataThirdLevel.DisplayId + ')</span>';
                    }
                }
                else if (data.DataThirdLevel.AngleUri) {
                    var angleParts = data.DataThirdLevel.AngleUri.split('/');
                    if (self.WebClientAngleUrl && self.CanAccessViaWebClient) {
                        html += '<a href="' + kendo.format(angleUrlTemplate, data.DataThirdLevel.AngleUri, 'default') + '" target="_blank" class="angleLink">(id=' + angleParts[4] + ')</a>';
                    }
                    else {
                        html += '<span class="angleLink">(id=' + data.DataThirdLevel.AngleId + ')</a>';
                    }
                }
            }
            return html;
        };

        // render action of row
        self.GetAngleWarningActionTemplate = function (data) {
            var html = '';

            if (data.Level === 1) {
                html += '<div class="level1"></div>';
            }
            else if (data.Level === 2) {
                var replaceSolution = null;

                html += '<div class="level2">';
                html += '<select id="action_' + data.id + '" name="action_' + data.parentId + '" onchange="MC.Models.AngleWarnings.SolutionChanged(this)">';
                html += '<option value="">' + Localization.MC_NoAction + '</option>';
                var solution = self.Solution[data.parentId];
                for (var i = 0; i < solution.length; i++) {
                    html += '<option value= "' + solution[i].Action + '" >' + solution[i].Name + '</option>';

                    if (solution[i].Action.indexOf('replace') !== -1) {
                        replaceSolution = solution[i];
                    }
                }
                html += '</select>';

                var cssClass = '';
                var onClickFunction = '';
                var solutionParameter = '';
                if (replaceSolution) {
                    solutionParameter = (replaceSolution.ParameterSelection || '').replace('[object]', data.DataSecondLevel.Object);
                    if (replaceSolution.Action === self.SOLUTIONACTION.REPLACE_START_OBJECT) {
                        onClickFunction = 'MC.Models.AngleWarnings.ShowReplacementChooser(this)';
                        cssClass = 'replaceObject';
                    }
                    else if (replaceSolution.Action === self.SOLUTIONACTION.REPLACE_JUMP) {
                        cssClass = 'replaceJump';
                    }
                    else {
                        onClickFunction = 'MC.Models.AngleWarnings.ShowReplacementChooser(this)';
                        cssClass = 'replaceField';
                    }
                }
                html += '<input type="text" id="replacement_' + data.id + '" name="replacement_' + data.parentId + '" data-parameter="' + solutionParameter + '" class="' + cssClass + ' alwaysHidden" readonly="readonly" onclick="' + onClickFunction + '" />';
                html += '<span class="icon iconChecked alwaysHidden"></span>';
                html += '<label class="alwaysHidden"><input type="checkbox" name="solve_' + data.id + '" /><span class="label"></span></label>';
                html += '</div>';
            }
            else if (data.Level === 3) {
                html += '<div class="level3"></div>';
            }
            return html;
        };

        // expand first level node event
        self.ExpandWarningFirstLevelNode = function (row) {
            $(row).find('.k-i-expand').trigger('mousedown');
        };

        // when data bound
        self.TreeListAngleWarningDataBound = function (e) {
            e.sender.content.find('select').not('[data-role="dropdownlist"]').kendoDropDownList();

            var replaceJump = e.sender.content.find('input.replaceJump').not('[data-role="dropdownlist"]');
            if (replaceJump.length) {
                replaceJump
                    .removeAttr('readonly')
                    .removeAttr('onclick')
                    .kendoDropDownList({
                        autoBind: false,
                        dataTextField: 'short_name',
                        dataValueField: 'id',
                        dataSource: {
                            transport: {
                                read: function (option) {
                                    var jumpUri = replaceJump.data('parameter');
                                    if (jumpUri) {
                                        if (!self.JumpData[jumpUri]) self.JumpData[jumpUri] = [];

                                        if (!self.JumpData[jumpUri].length) {
                                            disableLoading();
                                            MC.ajax.request({
                                                url: self.GetAllJumpsUrl,
                                                parameters: {
                                                    jumpUri: webAPIUrl + jumpUri
                                                }
                                            })
                                                .done(function (data) {
                                                    self.JumpData[jumpUri] = data.slice();
                                                    option.success(data);
                                                });
                                        }
                                        else {
                                            option.success(self.JumpData[jumpUri].slice());
                                        }
                                    }
                                    else {
                                        option.success([]);
                                    }
                                }
                            },
                            sort: { field: 'short_name', dir: 'asc' }
                        }
                    });
            }

            e.sender.content.find('.active').removeClass('active');

            // set user's actions to controls
            if (self.RememberAction) {
                setTimeout(function () {
                    $.each(self.RememberAction.Actions, function (index, action) {
                        var ddlAction = $('#' + action.ElementId).data('kendoDropDownList');
                        ddlAction.value(action.Value);
                        ddlAction.element.trigger('change');

                        if (action.Value.indexOf('replace') !== -1) {
                            if (action.Value === self.SOLUTIONACTION.REPLACE_JUMP) {
                                var ddlReplace = $('#' + action.Replace.ElementId).data('kendoDropDownList');
                                ddlReplace.value(action.Replace.Value);
                            }
                            else {
                                $('#' + action.Replace.ElementId).val(action.Replace.Value);
                            }
                        }
                    });
                }, 300);
            }
        };

        // check/uncheck all
        self.ToogleAllChildsSelection = function (checkbox) {
            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            if (treelist) {
                checkbox = $(checkbox);
                var isChecked = checkbox.prop('checked');
                var row = checkbox.parents('tr:first');
                var dataItem = treelist.dataSource.getByUid(row.attr('data-uid'));
                if (dataItem.hasChildren && dataItem.loaded()) {
                    treelist.content.find('input[name="item_' + dataItem.id + '"]').prop('checked', isChecked);
                }
            }
        };

        // change solution action
        self.SolutionChanged = function (obj) {
            obj = $(obj);
            var action = obj.val();
            if (!action) {
                // no action
                obj.parents('.k-dropdown:first')
                    .next().addClass('alwaysHidden')
                    .next().addClass('alwaysHidden')
                    .next().find('input').prop('checked', false);
            }
            else if (action.indexOf('replace') !== -1) {
                // replace action
                var hintText;
                if (action === self.SOLUTIONACTION.REPLACE_START_OBJECT) {
                    hintText = Localization.MC_SelectObjectHint;
                }
                else if (action === self.SOLUTIONACTION.REPLACE_JUMP) {
                    hintText = '';
                }
                else {
                    hintText = Localization.MC_SelectFieldHint;
                }
                obj.parents('.k-dropdown:first')
                    .next().removeClass('alwaysHidden').attr('placeholder', hintText)
                    .next().removeClass('alwaysHidden')
                    .next().find('input').prop('checked', true);

                var jumpDropdown = obj.parents('td:first').find('input.replaceJump').data('kendoDropDownList');
                if (jumpDropdown && !jumpDropdown.dataItems().length) {
                    jumpDropdown.dataSource.read();
                }
            }
            else {
                // other action
                obj.parents('.k-dropdown:first')
                    .next().addClass('alwaysHidden')
                    .next().removeClass('alwaysHidden')
                    .next().find('input').prop('checked', true);
            }
        };

        self.ShowReplacementChooser = function (obj) {
            obj = $(obj);
            if (obj.hasClass('replaceObject')) {
                $('#ShowClassesChooser').trigger('click');
                self.ShowClassesChooser(obj);
            }
            else {
                self.ShowFieldsChooser(obj);
            }
        };

        // check before execute task
        self.IsValidExecuteAngleWarning = function (row) {
            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            if (!treelist) return false;

            var dataItem = treelist.dataSource.getByUid(row.attr('data-uid'));
            if (dataItem && dataItem.loaded()) {
                // all childs checkbox unchecked
                if (!treelist.content.find('input[name="item_' + dataItem.id + '"]:checked').length) {
                    MC.util.showPopupAlert(Localization.MC_AngeWarningsNoItemSelect);
                    return false;
                }

                // action = delete_xxx but no matched item
                var solution = self.Solution[dataItem.parentId].findObject('Action', row.find('select').val());
                if (solution.Action === self.SOLUTIONACTION.DELETE_ANGLE || solution.Action === self.SOLUTIONACTION.DELETE_DISPLAY) {
                    var dataAngle = [];
                    var dataDisplay = [];
                    $.each(treelist.content.find('input[name="item_' + dataItem.id + '"]:checked'), function (index, item) {
                        var uid = $(item).parents('tr:first').attr('data-uid');
                        var data = treelist.dataSource.getByUid(uid).DataThirdLevel;
                        if (data.DisplayId) {
                            dataDisplay.push(data);
                        }
                        else {
                            dataAngle.push(data);
                        }
                    });

                    var invalidDeleteAngleSolution = solution.Action === self.SOLUTIONACTION.DELETE_ANGLE && !dataAngle.length;
                    var invalidDeleteDisplaySolution = solution.Action === self.SOLUTIONACTION.DELETE_DISPLAY && !dataDisplay.length;
                    if (invalidDeleteAngleSolution || invalidDeleteDisplaySolution) {
                        MC.util.showPopupAlert(Localization.MC_AngeWarningsNoBeExecuted);
                        return false;
                    }
                }
            }

            // check complete input field
            var selectFieldElement = row.find('input:text');
            if (selectFieldElement.filter(':visible').length && !selectFieldElement.val()) {
                return false;
            }

            return true;
        };

        // execute task
        self.ExecuteAngleWarning = function (btn) {
            btn = $(btn);
            if (btn.hasClass('disabled')) return;
            var row = btn.parents('tr:first');

            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            if (treelist && self.IsValidExecuteAngleWarning(row)) {
                var dataItem = treelist.dataSource.getByUid(row.attr('data-uid'));
                if (dataItem && dataItem.hasChildren) {
                    // create confirm message
                    var confirmHeight;
                    var solutionOption = row.find('select').val();
                    var solutionText = row.find('select option:selected').text();
                    var solution = self.Solution[dataItem.parentId].findObject('Action', solutionOption);
                    var confirmText = '<div class="angleWarningConfirm">';
                    if (!dataItem.loaded()) {
                        confirmText += kendo.format('<p>' + Localization.MC_AngleWarningsConfirmHeader + '</p>', solutionText, dataItem.Count, dataItem.Name);
                    }
                    else {
                        confirmHeight = 300;
                        confirmText += kendo.format('<p>{0}: {1}</p>', solutionText, dataItem.Name);
                        $.each(treelist.content.find('input[name="item_' + dataItem.id + '"]:checked'), function (index, item) {
                            var uid = $(item).parents('tr:first').attr('data-uid');
                            var data = treelist.dataSource.getByUid(uid);
                            confirmText += '<div class="angleWarningConfirmItem ' + data.DataThirdLevel.Type + (index === 0 ? ' first' : '') + '">' + data.Name + '</div>';
                        });
                    }
                    confirmText += '</div>';
                    var taskActionName = '';
                    var executeAngleWarning = function () {
                        var task = {
                            name: '',
                            description: '',
                            delete_after_completion: false,
                            enabled: true,
                            run_as_user: self.UserId,
                            actions: []
                        };

                        var taskAction = {
                            action_type: 'solve_angle_warnings',
                            arguments: [
                                {
                                    name: 'model',
                                    value: self.ModelId
                                }
                            ],
                            notification: null,
                            run_as_user: null,
                            approval_state: 'approved'
                        };

                        var argumentAction = {
                            name: 'action',
                            value: {
                                action: solution.Action,
                                parameter: {}
                            }
                        };

                        var setTaskData = function () {
                            var actionName = '';
                            var replaceValue = row.find('input:text').val();
                            if (solution.Action === self.SOLUTIONACTION.REPLACE_START_OBJECT) {
                                actionName = 'Solve Angle base classes warnings';
                                argumentAction.value.parameter = {
                                    // current angle base_classes
                                    objects: [dataItem.DataSecondLevel.Object],
                                    //replace angle base_classes
                                    replace_with: [replaceValue],
                                    types: solution.WarningTypes
                                };
                            }
                            else if (solution.Action === self.SOLUTIONACTION.REPLACE_JUMP) {
                                actionName = 'Solve Angle and Display jump warnings';
                                argumentAction.value.parameter = {
                                    //current angle base_classes
                                    objects: [dataItem.DataSecondLevel.Object],
                                    //target jump
                                    jump: dataItem.DataSecondLevel.Jump,
                                    //replace jump
                                    replace_with: replaceValue,
                                    types: solution.WarningTypes
                                };
                            }
                            else if (solution.Action === self.SOLUTIONACTION.REPLACE_FIELD) {
                                actionName = 'Solve Angle and Display field or filter warnings';
                                argumentAction.value.parameter = {
                                    objects: [dataItem.DataSecondLevel.Object],
                                    field: dataItem.DataSecondLevel.Field,
                                    replace_with: replaceValue,
                                    //type: 'field'
                                    types: solution.WarningTypes
                                };
                                if (solution.WarningType === self.WARNINGTYPE.AGGREGATIONFIELD
                                    || solution.WarningType === self.WARNINGTYPE.GROUPINGFIELD) {
                                    argumentAction.value.parameter.types.push(self.WARNINGTYPE.DISPLAYFIELD);
                                }
                            }
                            else if (solution.Action === self.SOLUTIONACTION.REMOVE_FILTER) {
                                actionName = 'Solve Angle warnings by remove filter in Display';
                                argumentAction.value.parameter = {
                                    objects: [dataItem.DataSecondLevel.Object],
                                    field: dataItem.DataSecondLevel.Field,
                                    //type: 'filter'
                                    types: solution.WarningTypes
                                };
                            }
                            else if (solution.Action === self.SOLUTIONACTION.REMOVE_COLUMN) {
                                actionName = 'Solve Angle warnings by remove column(s) in Display';
                                argumentAction.value.parameter = {
                                    objects: [dataItem.DataSecondLevel.Object],
                                    field: dataItem.DataSecondLevel.Field,
                                    //type: 'column'
                                    types: solution.WarningTypes
                                };
                            }
                            else if (solution.Action === self.SOLUTIONACTION.DELETE) {
                                actionName = 'Solve Angle or Display warnings by delete';
                                delete argumentAction.value.parameter;
                            }
                            else if (solution.Action === self.SOLUTIONACTION.DELETE_ANGLE) {
                                actionName = 'Solve Angle warnings by delete';
                                delete argumentAction.value.parameter;
                            }
                            else if (solution.Action === self.SOLUTIONACTION.DELETE_DISPLAY) {
                                actionName = 'Solve Display warnings by delete';
                                delete argumentAction.value.parameter;
                            }
                            taskActionName = actionName;
                            task.name = actionName;
                            task.description = actionName;
                        };
                        var resolveTaskActions = function (dataIds) {
                            var taskActions = [];
                            if (solution.Action === self.SOLUTIONACTION.DELETE) {
                                var argumentAngleIds = {
                                    name: 'target_ids',
                                    value: []
                                };
                                var argumentDisplayIds = {
                                    name: 'target_ids',
                                    value: []
                                };

                                $.each(dataIds, function (index, data) {
                                    if (data.DisplayId) {
                                        argumentDisplayIds.value.push({
                                            angle_id: data.AngleId,
                                            display_id: data.DisplayId
                                        });
                                    }
                                    else {
                                        argumentAngleIds.value.push({
                                            angle_id: data.AngleId
                                        });
                                    }
                                });

                                if (argumentAngleIds.value.length) {
                                    var angleTaskAction = JSON.parse(JSON.stringify(taskAction));
                                    var angleArgumentAction = JSON.parse(JSON.stringify(argumentAction));
                                    angleArgumentAction.value.action = self.SOLUTIONACTION.DELETE_ANGLE;
                                    angleTaskAction.arguments.push(angleArgumentAction);
                                    angleTaskAction.arguments.push(argumentAngleIds);

                                    taskActions.push(angleTaskAction);
                                }
                                if (argumentDisplayIds.value.length) {
                                    var displayTaskAction = JSON.parse(JSON.stringify(taskAction));
                                    var displayArgumentAction = JSON.parse(JSON.stringify(argumentAction));
                                    displayArgumentAction.value.action = self.SOLUTIONACTION.DELETE_DISPLAY;
                                    displayTaskAction.arguments.push(displayArgumentAction);
                                    displayTaskAction.arguments.push(argumentDisplayIds);

                                    taskActions.push(displayTaskAction);
                                }
                                return taskActions;
                            }
                            else {
                                var isDeleteAngle = solution.Action === self.SOLUTIONACTION.DELETE_ANGLE;
                                var isDeleteDisplay = solution.Action === self.SOLUTIONACTION.DELETE_DISPLAY;
                                var argumentIds = {
                                    name: 'target_ids',
                                    value: []
                                };

                                $.each(dataIds, function (index, data) {
                                    var isDeleteSolution = isDeleteAngle || isDeleteDisplay;
                                    var isDeleteAngleWithoutDisplayId = isDeleteAngle && !data.DisplayId;
                                    var isDeleteDisplayWithDisplayId = isDeleteDisplay && data.DisplayId;
                                    if (!isDeleteSolution || isDeleteAngleWithoutDisplayId || isDeleteDisplayWithDisplayId) {
                                        var arg = {
                                            angle_id: data.AngleId
                                        };
                                        if (data.DisplayId) {
                                            arg.display_id = data.DisplayId;
                                        }

                                        argumentIds.value.push(arg);
                                    }
                                });

                                taskAction.arguments.push(argumentAction);
                                taskAction.arguments.push(argumentIds);

                                taskActions.push(taskAction);

                                if (argumentIds.value.length) {
                                    return taskActions;
                                }
                                else {
                                    return null;
                                }
                            }
                        };
                        var getTaskActionsData = function () {
                            if (!dataItem.loaded()) {
                                // select all childs
                                return MC.ajax.request({
                                    url: self.GetAllThirdLevelUrl,
                                    parameters: {
                                        uri: dataItem.Uri
                                    }
                                })
                                    .then(function (response) {
                                        return $.when(resolveTaskActions(response));
                                    });
                            }
                            else {
                                // check from childs checkbox
                                var data = [];
                                $.each(treelist.content.find('input[name="item_' + dataItem.id + '"]:checked'), function (index, item) {
                                    var uid = $(item).parents('tr:first').attr('data-uid');
                                    data.push(treelist.dataSource.getByUid(uid).DataThirdLevel);
                                });
                                return $.when(resolveTaskActions(data));
                            }
                        };

                        // remember selecting node
                        self.SelectNode = '#TreeListAngleWarnings .k-grid-content tr:eq(' + (dataItem.parentId - 1) + ')';

                        MC.util.massReport.initial();
                        MC.util.massReport.setStatus(Localization.MC_CurrentProgress, 'executing', '');

                        setTaskData();
                        $.when(getTaskActionsData())
                            .then(function (actions) {
                                if (actions) {
                                    task.actions = actions;

                                    return MC.ajax.request({
                                        url: self.ExecuteAngleWarningsUrl,
                                        parameters: {
                                            taskData: JSON.stringify(task)
                                        },
                                        type: 'POST'
                                    });
                                }
                                else {
                                    MC.util.massReport.closeReport();
                                    MC.util.showPopupAlert(Localization.MC_AngeWarningsNoBeExecuted);

                                    var deferred = $.Deferred();
                                    deferred.reject();
                                    return deferred.promise();
                                }
                            })
                            .then(function (data) {
                                // check result
                                return self.CheckExecutionAngleWarning(data.Uri);
                            })
                            .then(function (data) {
                                // delete task
                                self.DeleteAngleWarningTask(data.Uri);
                                self.SearchAngleWarnings();

                                MC.util.massReport.setStatus(Localization.MC_CurrentProgress, "getting report", '');
                                return self.GetAngleWarningTaskHistory(data.History);
                            })
                            .done(function (response) {
                                MC.util.massReport.closeReport();
                                $('#showAngleWarningLog').data('correlationid', response.correlation_id);
                                $('#showAngleWarningLog').trigger('click');
                                $("#popupLogTable_wnd_title").html(taskActionName);
                            });
                    };

                    MC.util.showPopupConfirmation(confirmText, executeAngleWarning, null, 550, confirmHeight);
                }
            }
        };

        // check execution status
        self.CheckExecutionAngleWarning = function (uri) {
            var deferred = $.Deferred();
            var query = {};
            query['uri'] = uri;

            var checkExecution = function () {
                MC.ajax
                    .request({
                        url: self.CheckExecuteAngleWarningsUrl,
                        parameters: query
                    })
                    .fail(function (xhr, status, error) {
                        MC.ajax.setErrorDisable(xhr, status, error, deferred);
                    })
                    .done(function (data, status) {
                        if (data.status === 'finished') {
                            deferred.resolve(data, status);
                        }
                        else if (data.status === 'failed') {
                            deferred.resolve(data, status);
                        }
                        else {
                            setTimeout(function () {
                                MC.util.massReport.setStatus(Localization.MC_CurrentProgress, data.status, '');
                                checkExecution();
                            }, 1000);
                        }
                    });
            };

            checkExecution();

            return deferred.promise();
        };

        // get correlation_id from task history
        self.GetAngleWarningTaskHistory = function (uri) {
            return MC.ajax.request({
                url: self.GetAngleWarningTaskHistoryUrl,
                parameters: { detailUri: uri },
                type: 'GET'
            });
        };

        // delete task after finished
        self.DeleteAngleWarningTask = function (uri) {
            var query = {
                taskUri: uri
            };
            return MC.ajax.request({
                url: self.DeleteAngleWarningTaskUrl,
                parameters: query,
                type: 'DELETE'
            });
        };

        // show report popup
        self.ShowAngleWarningLogTable = function (e) {
            var correlationId = $(e).data('correlationid');
            MC.ui.logpopup.ShowLogTable(e, correlationId);
        };

        // show solve warnings confirm
        // private method for create confirm message
        var createConfirmMessage = function (selectAction, dataItem, treelist) {
            var solutionText = selectAction.find('option:selected').text();
            var confirmText = '<div class="angleWarningConfirm">';
            if (!dataItem.loaded()) {
                confirmText += kendo.format('<p>' + Localization.MC_AngleWarningsConfirmHeader + '</p>', solutionText, dataItem.Count, dataItem.Name);
            }
            else {
                confirmText += kendo.format('<p>{0}: {1}</p>', solutionText, dataItem.Name);
                $.each(treelist.content.find('input[name="item_' + dataItem.id + '"]:checked'), function (index, item) {
                    var uid = $(item).parents('tr:first').attr('data-uid');
                    var data = treelist.dataSource.getByUid(uid);
                    confirmText += '<div class="angleWarningConfirmItem ' + data.DataThirdLevel.Type + (index === 0 ? ' first' : '') + '">' + data.Name + '</div>';
                });
            }
            confirmText += '</div>';

            return confirmText;
        };
        // create task
        self.CreateTask = function (name, description, userId) {
            return {
                name: name || '',
                description: description || '',
                delete_after_completion: false,
                enabled: true,
                run_as_user: userId,
                actions: []
            };
        };
        // create task action
        self.CreateTaskAction = function () {
            return {
                action_type: 'solve_angle_warnings',
                arguments: [],
                notification: null,
                run_as_user: null,
                approval_state: 'approved'
            };
        };
        // create task's model argument
        self.CreateTaskModelArgument = function (modelId) {
            return {
                name: "model",
                value: modelId
            };
        };
        // create task's target argument
        self.CreateTaskTargetArgument = function (targets) {
            var targetArgument = {
                name: "target_ids",
                value: []
            };

            $.each(targets, function (index, target) {
                var targetValue = {};

                if (target.DisplayId === null)
                    targetValue = {
                        angle_id: target.AngleId
                    };
                else
                    targetValue = {
                        angle_id: target.AngleId,
                        display_id: target.DisplayId
                    };

                targetArgument.value.push(targetValue);
            });

            return targetArgument;
        };
        // create task's action argument
        self.CreateTaskActionArgument = function (solution) {
            return {
                name: 'action',
                value: {
                    action: solution.Action,
                    parameter: {}
                }
            };
        };
        // private method for get target data
        var getTargetData = function (dataItem, url, treelist) {
            if (!dataItem.loaded()) {
                // select all childs
                return MC.ajax.request({
                    url: url,
                    parameters: {
                        uri: dataItem.Uri
                    }
                })
                    .then(function (response) {
                        return $.when(self.CreateTaskTargetArgument(response));
                    });
            }
            else {
                // check from childs checkbox
                var data = [];
                $.each(treelist.content.find('input[name="item_' + dataItem.id + '"]:checked'), function (index, item) {
                    var uid = $(item).parents('tr:first').attr('data-uid');
                    data.push(treelist.dataSource.getByUid(uid).DataThirdLevel);
                });

                return $.when(self.CreateTaskTargetArgument(data));
            }
        };
        // create action's parameter
        self.CreateActionParameter = function (solution, dataItem, replaceValue) {
            var actionArgumentParameter = null;

            if (solution.Action === self.SOLUTIONACTION.REPLACE_START_OBJECT) {
                actionArgumentParameter = {
                    // current angle base_classes
                    objects: [dataItem.DataSecondLevel.Object],
                    // replace angle base_classes
                    replace_with: [replaceValue],
                    types: solution.WarningTypes
                };
            }
            else if (solution.Action === self.SOLUTIONACTION.REPLACE_JUMP) {
                actionArgumentParameter = {
                    //current angle base_classes
                    objects: [dataItem.DataSecondLevel.Object],
                    //target jump
                    jump: dataItem.DataSecondLevel.Jump,
                    //replace jump
                    replace_with: replaceValue,
                    types: solution.WarningTypes
                };
            }
            else if (solution.Action === self.SOLUTIONACTION.REPLACE_FIELD) {
                actionArgumentParameter = {
                    objects: [dataItem.DataSecondLevel.Object],
                    field: dataItem.DataSecondLevel.Field,
                    replace_with: replaceValue,
                    types: solution.WarningTypes
                };
                if (solution.WarningType === self.WARNINGTYPE.AGGREGATIONFIELD
                    || solution.WarningType === self.WARNINGTYPE.GROUPINGFIELD) {
                    actionArgumentParameter.types.push(self.WARNINGTYPE.DISPLAYFIELD);
                }
            }
            else if (solution.Action === self.SOLUTIONACTION.REMOVE_FILTER
                || solution.Action === self.SOLUTIONACTION.REMOVE_COLUMN) {
                actionArgumentParameter = {
                    objects: [dataItem.DataSecondLevel.Object],
                    field: dataItem.DataSecondLevel.Field,
                    types: solution.WarningTypes
                };
            }

            return actionArgumentParameter;
        };

        // clear unused action parameter
        self.ClearUnusedActionArgumentParameter = function (actionArgument, actionArgumentParameter) {
            if (actionArgumentParameter)
                actionArgument.value.parameter = actionArgumentParameter;
            else
                delete actionArgument.value.parameter;

            return actionArgument;
        };

        // private method for execute task
        var executeTask = function (task) {
            if (task.actions) {
                return MC.ajax.request({
                    url: self.ExecuteAngleWarningsUrl,
                    parameters: {
                        taskData: JSON.stringify(task)
                    },
                    type: 'POST'
                });
            }
            else {
                MC.util.massReport.closeReport();
                MC.util.showPopupAlert(Localization.MC_AngeWarningsNoBeExecuted);

                var deferred = $.Deferred();
                deferred.reject();
                return deferred.promise();
            }
        };
        // private method for execute task
        var executeAutoTask = function (task) {
            if (task.actions) {
                return MC.ajax.request({
                    url: self.ExecuteAutoAngleWarningsUrl,
                    parameters: {
                        modelId: self.ModelId
                    },
                    type: 'POST'
                });
            }
            else {
                MC.util.massReport.closeReport();
                MC.util.showPopupAlert(Localization.MC_AngeWarningsNoBeExecuted);

                var deferred = $.Deferred();
                deferred.reject();
                return deferred.promise();
            }
        };
        // private method for run all execute task processes
        var executeProcesses = function (task, dataItem) {
            self.SelectNode = '#TreeListAngleWarnings .k-grid-content tr:eq(' + (dataItem.parentId - 1) + ')';

            MC.util.massReport.initial();
            MC.util.massReport.setStatus(Localization.MC_CurrentProgress, 'executing', '');

            executeTask(task)
                .then(function (data) {
                    // check result
                    return self.CheckExecutionAngleWarning(data.Uri);
                })
                .then(function (data) {
                    // delete task
                    self.DeleteAngleWarningTask(data.Uri);
                    self.SearchAngleWarnings();

                    MC.util.massReport.setStatus(Localization.MC_CurrentProgress, "getting report", '');
                    return self.GetAngleWarningTaskHistory(data.History);
                })
                .done(function (response) {
                    MC.util.massReport.closeReport();
                    $('#showAngleWarningLog').data('correlationid', response.correlation_id);
                    $('#showAngleWarningLog').trigger('click');
                    $("#popupLogTable_wnd_title").html(task.name);
                });
        };
        // private method for run all execute auto task processes
        var executeAutoProcesses = function (task) {
            MC.util.massReport.initial();
            MC.util.massReport.setStatus(Localization.MC_CurrentProgress, 'executing', '');

            executeAutoTask(task)
                .fail(function () {
                    MC.util.showPopupAlert(Localization.MC_AngeWarningsNoSolvableItemsFound);
                })
                .then(function (data) {
                    // check result
                    return self.CheckExecutionAngleWarning(data.Uri);
                })
                .then(function (data) {
                    // delete task
                    self.DeleteAngleWarningTask(data.Uri);
                    self.SearchAngleWarnings();

                    MC.util.massReport.setStatus(Localization.MC_CurrentProgress, "getting report", '');
                    return self.GetAngleWarningTaskHistory(data.History);
                })
                .done(function (response) {
                    MC.util.massReport.closeReport();
                    $('#showAngleWarningLog').data('correlationid', response.correlation_id);
                    $('#showAngleWarningLog').trigger('click');
                    $("#popupLogTable_wnd_title").html(task.name);
                });
        };
        // private method for prepare confirm message
        var prepareConfirmMessage = function (checkBoxs, treeList) {
            var confirmMessage = '';
            var automationTasksWarning = false;

            $.each(checkBoxs, function (index, checkBox) {
                // Get row (tr) from kendow grid, for get data item in grid data source (binding data response from AS)
                var row = $('input[name="' + checkBox.name + '"]').parents('tr:first');
                var dataItem = treeList.dataSource.getByUid(row.attr('data-uid'));

                // Create confirm message and execution task if found data item and data have angle warnnings (children)
                if (dataItem && dataItem.hasChildren) {
                    // create confirm message
                    var selectAction = $('#action_' + checkBox.name.replace('solve_', ''));
                    confirmMessage += createConfirmMessage(selectAction, dataItem, treeList);

                    if (dataItem.DataSecondLevel.HasDisplaysUsedInAutomationTasks) {
                        automationTasksWarning = true; //dennis
                    }
                }
            });

            if (automationTasksWarning) {
                confirmMessage = 'WARNING! Some of the angles that will be solved are part of automation tasks. </p><p>' + confirmMessage;
            }

            return confirmMessage;
        };
        // private method for prepare task actions initial
        var prepareTaskActionsInitial = function (checkBoxs, treeList, modelId) {
            var actions = [];

            $.each(checkBoxs, function (index, checkBox) {
                var action = {
                    Index: index,
                    CheckBox: checkBox,
                    DataItem: null,
                    TaskAction: null,
                    Solution: null
                };
                // Get row (tr) from kendow grid, for get data item in grid data source (binding data response from AS)
                var row = $('input[name="' + checkBox.name + '"]').parents('tr:first');
                action.DataItem = treeList.dataSource.getByUid(row.attr('data-uid'));

                // Create confirm message and execution task if found data item and data have angle warnnings (children)
                if (action.DataItem && action.DataItem.hasChildren) {
                    // create task with multiple actions
                    var selectAction = $('#action_' + checkBox.name.replace('solve_', ''));
                    var selectedOption = selectAction.find('option:selected').val();
                    action.Solution = self.Solution[action.DataItem.parentId].findObject('Action', selectedOption);

                    action.TaskAction = self.CreateTaskAction();
                    var actionModel = self.CreateTaskModelArgument(modelId);
                    action.TaskAction.arguments.push(actionModel);

                    actions.push(action);
                }
            });

            return actions;
        };
        // M4-24993: Use for remember user's actions
        self.RememberAction = {};
        self.SetRememberActions = function (e) {
            var actions = [];

            // get all visible options
            var options = e.sender.content.find('select option:selected');
            $.each(options, function (i, option) {
                // Not selected 'No action'
                if (option.value !== '') {
                    var row = $('#' + option.parentNode.id).parents('tr:first');
                    var action = {
                        NodeId: row.attr('data-uid'),
                        ElementId: option.parentNode.id,
                        Value: option.value
                    };

                    // If action is 'replace' someting at replace information
                    if (option.value.indexOf('replace') !== -1) {
                        // replace_object
                        if (option.value === self.SOLUTIONACTION.REPLACE_START_OBJECT) {
                            action.Replace = {
                                NodeId: row.attr('data-uid'),
                                ElementId: row.find('input:text.replaceObject').attr('id'),
                                Value: row.find('input:text.replaceObject').val()
                            };
                        }
                        // replace_jump
                        else if (option.value === self.SOLUTIONACTION.REPLACE_JUMP) {
                            action.Replace = {
                                NodeId: row.attr('data-uid'),
                                ElementId: row.find('input.replaceJump').attr('id'),
                                Value: row.find('input.replaceJump').val()
                            };
                        }
                        // replace_field
                        else {
                            action.Replace = {
                                NodeId: row.attr('data-uid'),
                                ElementId: row.find('input.replaceField').attr('id'),
                                Value: row.find('input.replaceField').val()
                            };
                        }
                    }
                    actions.push(action);
                }
            });

            // assign to global variable for use after 'TreeView' binding
            if (actions.length)
                self.RememberAction = { ExpandedNode: e.model.id, Actions: actions };

            return actions;
        };
        // Show solve warning confirm
        self.ShowSolveWarningConfirm = function (btn) {
            // Get checkboxs were selected in 'Action' column in 'Errors and warnings' grid
            var checkBoxs = $('input[name*="solve_"]:checked');

            // prepare confirm message and execution task if user selected solve angle(s)
            var task = null;
            if (checkBoxs.length > 0) {
                var confirmBtn = $(btn);
                if (confirmBtn.hasClass('alwaysHidden'))
                    return;

                // Create treelist object to use for get data item
                var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
                var confirmMessage = prepareConfirmMessage(checkBoxs, treelist);
                task = self.CreateTask('Solve angle warnings', 'This task use for solve angle warnings by user selected actions.', self.UserId);
                var resolveWarningCount = checkBoxs.length;
                var taskActions = [];

                // prepare task data
                taskActions = prepareTaskActionsInitial(checkBoxs, treelist, self.ModelId);

                $.each(taskActions, function (index, action) {
                    if (action.DataItem && action.DataItem.hasChildren) {
                        $.when(getTargetData(action.DataItem, self.GetAllThirdLevelUrl, treelist))
                            .done(function (response) {
                                action.TaskAction.arguments.push(response);
                                var replaceValue = $('#replacement_' + action.CheckBox.name.replace('solve_', '')).val();
                                var actionArgument = self.CreateTaskActionArgument(action.Solution);
                                var actionArgumentParameter = self.CreateActionParameter(action.Solution, action.DataItem, replaceValue);
                                actionArgument = self.ClearUnusedActionArgumentParameter(actionArgument, actionArgumentParameter);

                                action.TaskAction.arguments.push(actionArgument);
                                task.actions.push(action.TaskAction);
                            })
                            .always(function () {
                                resolveWarningCount--;
                            });
                    }
                    else
                        resolveWarningCount--;
                });

                // show confirm popup after all data prepared
                var fnCheckGetTaskInfo = setInterval(function () {
                    if (resolveWarningCount <= 0) {
                        clearInterval(fnCheckGetTaskInfo);

                        // find last expanded item in grid
                        var lastItem = taskActions.findObject('Index', task.actions.length - 1);
                        MC.util.showPopupConfirmation(confirmMessage, function () {
                            executeProcesses(task, lastItem.DataItem);
                        }, null, 550, 550);
                    }
                }, 100);
            }
            else {
                MC.util.showPopupAlert('No solve warnings selected', 100, 100);
            }

            return task;
        };
        // Show execute angles auto confirm
        self.ShowSolveWarningAutoConfirm = function (btn) {

            btn = $(btn);
            if (btn.hasClass('disabled')) return;

            // Get checkboxs were selected in 'Action' column in 'Errors and warnings' grid
            var checkBoxs = $('input[name*="solve_"]:checked');

            // prepare confirm message and execution task if user selected solve angle(s)
            var task = null;

            var confirmBtn = $(btn);
            if (confirmBtn.hasClass('alwaysHidden'))
                return;

            // Create treelist object to use for get data item
            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            var confirmMessage = prepareConfirmMessage(checkBoxs, treelist);
            task = self.CreateTask('Solve angle warnings', 'This task use for solve angle warnings by user selected actions.', self.UserId);
            var resolveWarningCount = checkBoxs.length;
            var taskActions = [];

            // prepare task data
            taskActions = prepareTaskActionsInitial(checkBoxs, treelist, self.ModelId);

            $.each(taskActions, function (index, action) {
                if (action.DataItem && action.DataItem.hasChildren) {
                    $.when(getTargetData(action.DataItem, self.GetAllThirdLevelUrl, treelist))
                        .done(function (response) {
                            action.TaskAction.arguments.push(response);
                            var replaceValue = $('#replacement_' + action.CheckBox.name.replace('solve_', '')).val();
                            var actionArgument = self.CreateTaskActionArgument(action.Solution);
                            var actionArgumentParameter = self.CreateActionParameter(action.Solution, action.DataItem, replaceValue);
                            actionArgument = self.ClearUnusedActionArgumentParameter(actionArgument, actionArgumentParameter);

                            action.TaskAction.arguments.push(actionArgument);
                            task.actions.push(action.TaskAction);
                        })
                        .always(function () {
                            resolveWarningCount--;
                        });
                }
                else
                    resolveWarningCount--;
            });

            // show confirm popup after all data prepared
            var fnCheckGetTaskInfo = setInterval(function () {
                if (resolveWarningCount <= 0) {
                    clearInterval(fnCheckGetTaskInfo);

                    // find last expanded item in grid
                    //var lastItem = taskActions.findObject('Index', task.actions.length - 1);
                    MC.util.showPopupConfirmation("Execute automatic warnings solving using the input file?", function () {
                        executeAutoProcesses(task);
                    }, null, 300, 150);
                }
            }, 100);



            return task;
        };
        /*====================================== CLASS CHOOSER & FIELD CHOOSER =================================================*/

        /* begin - classes chooser */
        var cacheHelps = {};
        self.ClassesChooserHandler = null;
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
            self.ClassesChooserHandler.ClassTarget = 'instance_uri';
            self.ClassesChooserHandler.BusinessProcessHandler = new BusinessProcessesViewModel(self.BusinessProcessesData);
            self.ClassesChooserHandler.BusinessProcessHandler.Theme('flat');
            self.ClassesChooserHandler.BusinessProcessHandler.MultipleActive(true);
            self.ClassesChooserHandler.BusinessProcessHandler.CanEmpty(true);
            self.ClassesChooserHandler.BusinessProcessHandler.ClickCallback(function () {
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
        self.ShowClassesChooser = function (element) {
            self.ElementTarget = $(element);
            self.ClassesChooserHandler.CurrentModelData.instance_uri = webAPIUrl + self.ElementTarget.data('parameter');

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
            self.ClassesChooserHandler.MultipleSelection = false;

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
            jQuery('#popupClassesChooser .btnSubmit').off('click').on('click', function () {
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
                var helpHtml = '';
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
                            .done(function (data) {
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
                jQuery('#popupClassesChooser .btnSubmit').removeClass('disabled');
            }
            else {
                jQuery('#popupClassesChooser .btnSubmit').addClass('disabled');
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
            uri = uri.replace('classes/classes', 'classes');
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
                self.ElementTarget.val(classes[0]);
                self.CloseClassesChooser();
            }
        };
        /* end - classes chooser */

        /* begin - fields chooser */
        self.SetHideFacetsForReplacePivotOrChartDataArea = function (fieldsChooserModel) {
            fieldsChooserModel.HideFacetsFunction = function (category, id) {
                return category === fieldsChooserModel.CATEGORIES.FIELDTYPE && jQuery.inArray(id, self.DataAreaFiler) === -1;
            };
            fieldsChooserModel.FieldChooserType = 'data';
            fieldsChooserModel.DefaultFacetFilters = [{
                facet: fieldsChooserModel.CATEGORIES.FIELDTYPE,
                filter: 'number'
            }];
        };
        // M4-26202: Check if fieldtype is in { int, double, number } covert to 'number' fieldtype
        self.DataSecondLevelFieldTypeToFilterFieldType = function (fieldType) {
            if (jQuery.inArray(fieldType, self.NumberFilter) === -1)
                return fieldType;
            else
                return 'number';
        };
        self.CreateAngleWarningsTreeList = function () {
            var treelist = $('#TreeListAngleWarnings').data('kendoTreeList');
            if (treelist) {
                var rowUid = self.ElementTarget.parents('tr:first').attr('data-uid');
                var rowData = treelist.dataSource.getByUid(rowUid);
                // M4-23340: If rowData as 'unsupported_aggregation_field' show only allowed fieldtypes in facet
                if (rowData.Uri.indexOf('unsupported_aggregation_field') !== -1) {
                    self.SetHideFacetsForReplacePivotOrChartDataArea(fieldsChooserModel);
                }
                else if (rowData && rowData.DataSecondLevel.FieldType) {
                    fieldsChooserModel.DefaultFacetFilters = [{
                        facet: fieldsChooserModel.CATEGORIES.FIELDTYPE,
                        filter: self.DataSecondLevelFieldTypeToFilterFieldType(rowData.DataSecondLevel.FieldType)
                    }];
                }
            }
        };
        self.ShowFieldsChooser = function (element) {


            // initial field chooser popup
            window.fieldsChooserModel = MC.ui.fieldschooser.initial(self.DefaultPagesize, self.MaxPageSize, self.MaxDomainElementsForSearch);
            fieldsChooserModel.GetFieldsUri = self.GetFieldsUri;
            fieldsChooserModel.GetFieldSourceUri = self.GetFieldSourceUri;
            fieldsChooserModel.FieldCategoriesData = self.FieldCategoriesData;
            fieldsChooserModel.FieldCategoriesIconPath = self.FieldCategoriesIconPath;
            fieldsChooserModel.ResourceIconPath = self.ResourceIconPath;
            fieldsChooserModel.GetHelpTextsUri = self.GetHelpTextsUri;
            fieldsChooserModel.GetFieldDomainUri = self.GetFieldDomainUri;
            fieldsChooserModel.ModelUri = self.ModelUri;
            fieldsChooserModel.DefaultFacetFilters = [];
            fieldsChooserModel.FieldChooserType = '';
            fieldsChooserModel.ClientSettings = self.ClientSettings;

            // functions
            fieldsChooserModel.HideFacetsFunction = function () {
                return false;
            };
            fieldsChooserModel.OnGridSelectionChanged = function (selectedItems) {
                if (selectedItems.length) {
                    $('#popupFieldChooser .btnAddProperty').removeClass('disabled');
                }
                else {
                    $('#popupFieldChooser .btnAddProperty').addClass('disabled');
                }

                jQuery('#selectedItems').text(selectedItems.length ? kendo.format(Localization.NumberSelectingItems + ', ', selectedItems.length) : '');
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
                        text: Localization.Save,
                        click: function () {
                            fieldsChooserModel.OnSubmit.call();
                        },
                        className: 'btn btnLarge btnPrimary btnAddProperty'
                    }
                ];
            };
            fieldsChooserModel.OnSubmit = function () {
                var fields = fieldsChooserModel.SelectedItems();
                if (jQuery.active || !fields.length) return;

                self.OnSubmitFields(fields);
            };
            fieldsChooserModel.UpdateClientSettings = function (clientSettings) {
                self.ClientSettings = clientSettings;
            };

            self.ElementTarget = $(element);
            self.FieldsUri = webAPIUrl + self.ElementTarget.data('parameter');

            // default facet filters
            self.CreateAngleWarningsTreeList();

            var title = Localization.MC_SelectFieldToReplace;
            MC.ui.fieldschooser.showFieldsChooserPopup(title);

            // add element for show number of selected item(s)
            var selectedIndicator = jQuery('<span id="selectedItems"></span>');
            jQuery('#popupFieldChooser .fieldChooserTotals').prepend(selectedIndicator);
        };
        self.CloseFieldChooser = function () {
            if (fieldsChooserModel.FieldChooserPopup) {
                fieldsChooserModel.FieldChooserPopup.close();
            }
        };
        self.OnSubmitFields = function (fields) {
            if (fields.length) {
                self.ElementTarget.val(fields[0].id);
                self.CloseFieldChooser();
            }
        };
        /* end - fields chooser */
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        AngleWarnings: new AngleWarnings()
    });

})(window, MC.Models);
