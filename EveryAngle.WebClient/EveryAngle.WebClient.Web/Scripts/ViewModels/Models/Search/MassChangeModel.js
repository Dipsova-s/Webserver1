var massChangeModel = new MassChangeModel();

function MassChangeModel() {
    "use strict";

    var self = this;
    self.Angles = [];
    self.modelData = null;
    self.MASSNAME = {
        NOTE: 'private_note',
        STARRED: 'is_starred',
        PUBLISHED: 'is_published',
        VALIDATED: 'is_validated',
        TEMPLATE: 'is_template'
    };

    self.FacetModelId = 'facetcat_models';
    self.LabelTemplate = ko.observable({});
    self.BPCategories = [];
    self.SearchCategories = [];
    self.PrivilegeCategories = [];
    self.PrivateNote = ko.observable('');
    self.IsChangePrivateNote = ko.observable(null);
    self.IsChangePrivateNote.subscribe(function (newValue) {
        if (newValue !== null) {
            if (newValue) {
                jQuery('#AnglePrivateNote').prop('disabled', false).focus().select();
            }

            var element = jQuery('#AnglePrivateNoteCheckbox').data('state-changed', true).get(0);
            self.SetStatusText(element, element.checked);
        }
    });
    self.IsValidated = ko.observable(false);
    self.IsStarred = ko.observable(false);
    self.IsPublished = ko.observable(false);
    self.IsTemplate = ko.observable(false);
    self.PropertiesChanged = ko.observableArray([]);

    self.ShowMassChangePopup = function () {
        if (!searchModel.SelectedItems().length) {
            return;
        }

        var dashboardCount = self.GetDashboardCount();
        if (dashboardCount) {
            if (dashboardCount === searchModel.SelectedItems().length) {
                popup.Alert(Localization.Warning_Title, Localization.Info_OnlyAnglesAreAllowedToMassChange);
                return false;
            }
            setTimeout(function () {
                popup.Alert(Localization.Warning_Title, Localization.Info_DashboardItemsWillNotAffect);
            }, 500);
        }
        
        var popupName = 'MassChangePopup',
            popupSettings = {
                title: Localization.MassChangeTitle,
                element: '#popup' + popupName,
                html: massChangeHtmlTemplate(),
                className: 'popup' + popupName,
                animation: false,
                width: 850,
                height: 530,
                minWidth: 500,
                open: function (e) {
                    self.ShowMassChangePopupCallback(e);
                },
                close: function (e) {
                    e.sender.destroy();
                },
                buttons: [
                    {
                        text: Captions.Button_Cancel,
                        position: 'right',
                        click: 'close'
                    },
                    {
                        text: Localization.Save,
                        position: 'right',
                        isPrimary: true,
                        className: 'executing',
                        click: function (e, obj) {
                            if (popup.CanButtonExecute(obj)) {
                                var status = self.PropertyStatusAll();
                                if (status[self.MASSNAME.PUBLISHED].changed && !status[self.MASSNAME.PUBLISHED].value) {
                                    if (!self.IsAllAnglesBelongToCurentUser()) {
                                        // confirm to unpublish
                                        popup.Confirm(Localization.MassChangeMessageConfirmUnpublishAngle, function () {
                                            self.Save();
                                        });
                                    } else {
                                        self.Save();
                                    }
                                } else {
                                    self.Save();
                                }

                            }
                        }
                    }
                ]
            };

        popup.Show(popupSettings);
    };
    self.GetDashboardCount = function () {
        var countDashboard = 0;
        jQuery.each(searchModel.SelectedItems(), function (index, item) {
            if (item.type === enumHandlers.ITEMTYPE.DASHBOARD) {
                countDashboard++;
            }
        });
        return countDashboard;
    };
    self.ShowMassChangePopupCallback = function (e) {
        /* M4-7138: load all label categories && labels */
        e.sender.element.busyIndicator(true);

        jQuery.when(self.LoadLabels())
            .then(function () {
                /* M4-7138: generate tab views */
                self.BPCategories = [];
                self.SearchCategories = [];
                self.PrivilegeCategories = [];
                if (self.CanSetLabels())
                    return self.GenerateAddRemoveLabelView(enumHandlers.LABELVIEWTYPE.BP);
                else
                    return jQuery.when();
            })
            .done(function () {
                self.InitialObservableObject();
                self.PrepareAngles();
                self.SetMassChange();
                e.sender.element.find(':checkbox').removeData(['state', 'state-changed']);
                WC.HtmlHelper.ApplyKnockout(self, jQuery('#MassChangeArea'));

                e.sender.element.busyIndicator(false);
                jQuery('a[id*=btn-popupMassChangePopup]').removeClass('executing');
            });
    };
    self.CloseMassChangePopup = function () {
        popup.Close('#popupMassChangePopup');
    };
    self.InitialObservableObject = function () {
        self.IsChangePrivateNote(null);
        self.IsChangePrivateNote(false);
    };
    self.PrepareAngles = function () {
        self.Angles = [];
        jQuery.each(searchModel.SelectedItems(), function (index, item) {
            if (item.type === enumHandlers.ITEMTYPE.ANGLE) {
                self.Angles.push(ko.toJS(item));
            }
        });
    };
    self.SetMassChange = function () {
        self.PrivateNote(null);
        self.IsStarred(null);
        self.IsPublished(null);
        self.IsValidated(null);
        self.IsTemplate(null);
    };
    self.ShowMassChangeReportPopup = function () {
        var popupName = 'MassChangeReport';
        var popupSettings = {
            title: Localization.MassChangeReportTitle,
            element: '#popup' + popupName,
            className: 'popup' + popupName,
            width: 450,
            minWidth: 450,
            height: 300,
            buttons: [
                {
                    text: Localization.Ok,
                    position: 'right',
                    isPrimary: true,
                    click: 'close'
                }
            ]
        };

        // M4-33531: fixed safari issue
        var win = popup.Show(popupSettings);
        win.wrapper.height(popupSettings.height);
        win.center();
        return win;
    };
    self.PropertyStatus = function (propertyName) {
        var data = {
            changed: false,
            value: null
        };

        switch (propertyName) {
            case self.MASSNAME.NOTE:
                data.changed = self.IsChangePrivateNote();
                data.value = jQuery('#AnglePrivateNote').val();
                break;
            case self.MASSNAME.VALIDATED:
                data.changed = jQuery('#AngleIsValidate').data('state-changed') && jQuery('#AngleIsValidate').data('state') !== enumHandlers.CHECKSTATE.UNDEFINED;
                data.value = self.IsValidated();
                break;
            case self.MASSNAME.STARRED:
                data.changed = jQuery('#IsStarred').data('state-changed') && jQuery('#IsStarred').data('state') !== enumHandlers.CHECKSTATE.UNDEFINED;
                data.value = self.IsStarred();
                break;
            case self.MASSNAME.PUBLISHED:
                data.changed = jQuery('#AngleIsPublished').data('state-changed') && jQuery('#AngleIsPublished').data('state') !== enumHandlers.CHECKSTATE.UNDEFINED;
                data.value = self.IsPublished();
                break;
            case self.MASSNAME.TEMPLATE:
                data.changed = jQuery('#AngleIsTemplate').data('state-changed') && jQuery('#AngleIsTemplate').data('state') !== enumHandlers.CHECKSTATE.UNDEFINED;
                data.value = self.IsTemplate();
                break;
            default:
                break;
        }

        return data;
    };
    self.PropertyStatusAll = function () {
        var status = {};
        jQuery.each(self.MASSNAME, function (index, name) {
            status[name] = self.PropertyStatus(name);
        });
        return status;
    };
    self.IsAllAnglesBelongToCurentUser = function () {
        var isAllAnglesBelongToCurentUser = true;
        var currentUserUri = userModel.Data().uri;
        for (var i = 0; i < self.Angles.length; i++) {
            if (self.Angles[i].created.user !== currentUserUri) {
                isAllAnglesBelongToCurentUser = false;
                break;
            }
        }
        return isAllAnglesBelongToCurentUser;
    };
    self.Save = function () {
        var status = self.PropertyStatusAll();
        var reports = {
            header: {
                cancelled: false,
                total: 0,
                count: 0
            }
        };

        reports[self.MASSNAME.NOTE] = {
            text: Localization.MassChangeStatusPrivateNote,
            done: 0,
            fail: 0
        };

        reports[self.MASSNAME.STARRED] = {
            text: status[self.MASSNAME.STARRED].value ? Localization.MassChangeStatusStarred : Localization.MassChangeStatusNotStarred,
            done: 0,
            fail: 0
        };

        reports[self.MASSNAME.PUBLISHED] = {
            text: status[self.MASSNAME.PUBLISHED].value ? Localization.MassChangeStatusPublished : Localization.MassChangeStatusPrivate,
            done: 0,
            fail: 0
        };

        reports[self.MASSNAME.VALIDATED] = {
            text: status[self.MASSNAME.VALIDATED].value ? Localization.MassChangeStatusValidated : Localization.MassChangeStatusNotValidated,
            done: 0,
            fail: 0
        };

        reports[self.MASSNAME.TEMPLATE] = {
            text: status[self.MASSNAME.TEMPLATE].value ? Localization.MassChangeStatusTemplate : Localization.MassChangeStatusAngle,
            done: 0,
            fail: 0
        };
        /* BOF: M4-7138: generate update data and report */
        var labelDeferred = [];

        // on done
        var massChangeSuccess = function () {
            var scrollTop = jQuery('#InnerResultWrapper .k-scrollbar-vertical').scrollTop();
            searchModel.SelectedItems.removeAll();
            setTimeout(function () {
                searchPageHandler.BindSearchResultGrid(scrollTop);
            }, 500);

            self.UpdateProgressbar(reports.header);
            progressbarModel.EndProgressBar();
            if (!errorHandlerModel.Enable()) {
                setTimeout(function () {

                    errorHandlerModel.Enable(true);

                    var win = self.ShowMassChangeReportPopup();
                    win.content(self.GetSaveReportStatus(reports));
                }, 200);
            }
        };

        //generate report
        var generateReportAndAssignLabel = function (categories) {
            var result = { AssignLabels: [], Report: {} };
            for (var loop = 0; loop < categories.length; loop++) {
                for (var i = 0; i < categories[loop].Labels.length; i++) {
                    var label = ko.toJS(categories[loop].Labels[i]);
                    if (label.IsChecked === true) {
                        result.AssignLabels.push({ Id: label.id, State: 'add', IsRequire: categories[loop].Category.is_required && !categories[loop].Category.contains_businessprocesses });
                        result.Report[label.id] = {
                            text: kendo.format(Localization.MassChangeStatusAddLabel, label.name),
                            done: 0,
                            fail: 0
                        };
                    }
                    else if (label.IsChecked === false) {
                        result.AssignLabels.push({ Id: label.id, State: 'remove', IsRequire: categories[loop].Category.is_required && !categories[loop].Category.contains_businessprocesses });
                        result.Report[label.id] = {
                            text: kendo.format(Localization.MassChangeStatusRemoveLabel, label.name),
                            done: 0,
                            fail: 0
                        };
                    }
                }
            }

            return result;
        };

        /* M4-7138: get angles */
        var assignLabels = [];
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_GettingAngles);
        self.LoadAllAngles()
            .done(function () {
                if (self.CanSetLabels()) {
                    var reportAndAssignLabel = generateReportAndAssignLabel(self.BPCategories);
                    jQuery.extend(reports, reportAndAssignLabel.Report);
                    assignLabels = assignLabels.concat(reportAndAssignLabel.AssignLabels);
                    reportAndAssignLabel = generateReportAndAssignLabel(self.SearchCategories);
                    jQuery.extend(reports, reportAndAssignLabel.Report);
                    assignLabels = assignLabels.concat(reportAndAssignLabel.AssignLabels);
                    reportAndAssignLabel = generateReportAndAssignLabel(self.PrivilegeCategories);
                    jQuery.extend(reports, reportAndAssignLabel.Report);
                    assignLabels = assignLabels.concat(reportAndAssignLabel.AssignLabels);
                    var adds = jQuery.grep(assignLabels, function (assignLabel) {
                        return assignLabel.State === 'add';
                    });
                    var removes = jQuery.grep(assignLabels, function (assignLabel) {
                        return assignLabel.State === 'remove';
                    });
                    if (adds.length + removes.length > 0) {
                        //loop angle assigns label to generate update data
                        for (var loop = 0; loop < self.Angles.length; loop++) {
                            var reportProps = [], j;
                            var updateDatas = ko.toJS(self.Angles[loop].assigned_labels);
                            for (j = 0; j < adds.length; j++) {
                                updateDatas.push(adds[j].Id);
                                reportProps.push(adds[j].Id);
                            }
                            for (j = 0; j < removes.length; j++) {
                                var index = jQuery.inArray(removes[j].Id, updateDatas);
                                if (index !== -1) {
                                    updateDatas.splice(index, 1);
                                    reportProps.push(removes[j].Id);
                                }
                                else {
                                    reports[removes[j].Id].done++;
                                }
                            }
                            //tried to distinct data
                            updateDatas = updateDatas.distinct().slice();
                            reportProps = reportProps.distinct().slice();
                            //add request to defferred
                            labelDeferred.pushDeferred(self.SaveWithReport, [reports, reportProps, { uri: self.Angles[loop].uri, data: { assigned_labels: updateDatas } }]);
                            reports.header.total++;
                        }
                    }
                }

                /* EOF: M4-7138: generate update data and report */
                // update private note & starred
                var angleCount = self.Angles.length,
                    personalDeferred = [],
                    noteStatus = status[self.MASSNAME.NOTE],
                    starredStatus = status[self.MASSNAME.STARRED];
                if (noteStatus.changed || starredStatus.changed) {
                    jQuery.each(self.Angles, function (idx, angle) {
                        var data = { user_specific: {} }, properties = [];
                        if (noteStatus.changed) {
                            if (angle.user_specific[self.MASSNAME.NOTE] !== noteStatus.value) {
                                data.user_specific[self.MASSNAME.NOTE] = noteStatus.value;
                                properties.push(self.MASSNAME.NOTE);
                            }
                            else {
                                reports[self.MASSNAME.NOTE].done++;
                            }
                        }
                        if (starredStatus.changed) {
                            if (angle.user_specific[self.MASSNAME.STARRED] !== starredStatus.value) {
                                data.user_specific[self.MASSNAME.STARRED] = starredStatus.value;
                                properties.push(self.MASSNAME.STARRED);
                            }
                            else {
                                reports[self.MASSNAME.STARRED].done++;
                            }
                        }
                        if (properties.length) {
                            personalDeferred.pushDeferred(self.SaveWithReport, [reports, properties, { uri: angle.uri, data: data, forced: true }]);
                        }
                    });
                    reports.header.total += angleCount;
                }

                // update others
                var numberPerSet = 5;
                var other1Deferred = [], other2Deferred = [], other3Deferred = [];
                var data1 = {}, data2 = {}, data3 = {};
                angleCount = 0;
                /*  BOF: M4-10057: Implement state transfers for angles/displays/dashboards
                    6.Implement state on mass change
                */
                jQuery.each(self.Angles, function (idx, angle) {
                    if (status[self.MASSNAME.PUBLISHED].changed) {
                        if (angle[self.MASSNAME.PUBLISHED] !== status[self.MASSNAME.PUBLISHED].value) {
                            data1[self.MASSNAME.PUBLISHED] = status[self.MASSNAME.PUBLISHED].value;
                            if (status[self.MASSNAME.PUBLISHED].value) {
                                other1Deferred.pushDeferred(self.SaveWithReport, [reports, [self.MASSNAME.PUBLISHED], { uri: angle.state, data: data1 }, self.SetAllDisplayPublic(angle.display_definitions, true)]);
                            }
                            else {
                                other1Deferred.pushDeferred(self.SaveWithReport, [reports, [self.MASSNAME.PUBLISHED], { uri: angle.state, data: data1 }]);
                            }
                        }
                        else {
                            reports[self.MASSNAME.PUBLISHED].done++;
                        }
                        angleCount++;
                    }
                    if (status[self.MASSNAME.TEMPLATE].changed) {
                        if (angle[self.MASSNAME.TEMPLATE] !== status[self.MASSNAME.TEMPLATE].value) {
                            data2[self.MASSNAME.TEMPLATE] = status[self.MASSNAME.TEMPLATE].value;
                            other2Deferred.pushDeferred(self.SaveWithReport, [reports, [self.MASSNAME.TEMPLATE], { uri: angle.state, data: data2 }]);
                        }
                        else {
                            reports[self.MASSNAME.TEMPLATE].done++;
                        }
                        angleCount++;
                    }
                    if (status[self.MASSNAME.VALIDATED].changed) {
                        if (angle[self.MASSNAME.VALIDATED] !== status[self.MASSNAME.VALIDATED].value) {
                            data3[self.MASSNAME.VALIDATED] = status[self.MASSNAME.VALIDATED].value;
                            other3Deferred.pushDeferred(self.SaveWithReport, [reports, [self.MASSNAME.VALIDATED], { uri: angle.state, data: data3 }]);
                        }
                        else {
                            reports[self.MASSNAME.VALIDATED].done++;
                        }
                        angleCount++;
                    }
                });
                /*  EOF: M4-10057: Implement state transfers for angles/displays/dashboards
                    6.Implement state on mass change
                */
                reports.header.total += angleCount;
                if (personalDeferred.length + other1Deferred.length + other2Deferred.length + other3Deferred.length + labelDeferred.length !== 0) {
                    reports.header.cancelled = false;
                    errorHandlerModel.Enable(false);
                    progressbarModel.CancelCustomHandler = true;
                    progressbarModel.CancelFunction = function () {
                        progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Cancelling);
                        progressbarModel.SetDisableProgressBar();
                        reports.header.cancelled = true;

                        return true;
                    };
                    self.UpdateProgressbar(reports.header);
                /* BOF: M4-12868: New mass change */
                    if (status[self.MASSNAME.VALIDATED].value === true || status[self.MASSNAME.VALIDATED].changed === false) {
                        if (status[self.MASSNAME.PUBLISHED].value === true || status[self.MASSNAME.PUBLISHED].changed === false) {
                            jQuery.whenAllSet(personalDeferred, numberPerSet)
                                    .then(function () {
                                        return jQuery.whenAllSet(labelDeferred,numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other1Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other2Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other3Deferred, numberPerSet);
                                    })
                                    .always(function () {
                                        massChangeSuccess();
                                    });
                        }
                        else if (status[self.MASSNAME.PUBLISHED].value === false) {
                            jQuery.whenAllSet(personalDeferred, numberPerSet)
                                    .then(function () {
                                        return jQuery.whenAllSet(other2Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other1Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(labelDeferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other3Deferred, numberPerSet);
                                    })
                                    .always(function () {
                                        massChangeSuccess();
                                    });
                        }
                    }
                    else if (status[self.MASSNAME.VALIDATED].value === false) {
                        if (status[self.MASSNAME.PUBLISHED].value === true || status[self.MASSNAME.PUBLISHED].changed === false) {
                            jQuery.whenAllSet(personalDeferred, numberPerSet)
                                    .then(function () {
                                        return jQuery.whenAllSet(other3Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(labelDeferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other1Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other2Deferred, numberPerSet);
                                    })
                                    .always(function () {
                                        massChangeSuccess();
                                    });
                        }
                        else if (status[self.MASSNAME.PUBLISHED].value === false) {
                            jQuery.whenAllSet(personalDeferred, numberPerSet)
                                    .then(function () {
                                        return jQuery.whenAllSet(other3Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other2Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(other1Deferred, numberPerSet);
                                    })
                                    .then(function () {
                                        return jQuery.whenAllSet(labelDeferred, numberPerSet);
                                    })
                                    .always(function () {
                                        massChangeSuccess();
                                    });
                        }
                    }
                    /* EOF: M4-12868: New mass change */
                }
                else {
                    progressbarModel.EndProgressBar();
                }

                self.CloseMassChangePopup();
            });
    };
    self.SaveWithReport = function (reports, names, request, callbackDeferred) {
        if (reports.header.cancelled) {
            return jQuery.when();
        }

        var deferred = jQuery.Deferred();

        if (request.uri.indexOf('/state') === -1) {
            var params = {};
            params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
            if (request.forced)
                params[enumHandlers.PARAMETERS.FORCED] = true;
            request.uri += '?' + jQuery.param(params);
        }

        UpdateDataToWebService(request.uri, request.data)
            .fail(function (xhr) {
                jQuery.each(names, function (index, name) {
                    reports[name].fail++;
                });

                if (xhr.status === 440) {
                    errorHandlerModel.Enable(true);
                }
            })
            .done(function () {
                jQuery.each(names, function (index, name) {
                    reports[name].done++;
                });
            })
            .always(function () {
                reports.header.count++;
                self.UpdateProgressbar(reports.header);

                if (callbackDeferred instanceof Array) {
                    jQuery.whenAllSet(callbackDeferred, 5)
                        .always(function () {
                            deferred.resolve();
                        });
                }
                else {
                    deferred.resolve();
                }
            });

        return deferred.promise();
    };
    self.GetSaveReportStatus = function (reports) {
        var html = '<h3>' + Captions.MassChange_Label_NumberItems + '</h3>';
        html += '<table class="reportTable">';
        html += '<thead><tr><th></th><th>' + Captions.MassChange_ReportHeader_Successful + '</th><th>' + Captions.MassChange_ReportHeader_Failed + '</th></tr></thead>';
        html += '<tbody>';
        jQuery.each(reports, function (name, report) {
            if (name !== 'header' && report.done + report.fail !== 0) {
                html += '<tr><th>' + report.text + '</th><td>' + (report.done || '') + '</td><td>' + (report.fail || '') + '</td></tr>';
            }
        });
        html += '</tbody>';
        html += '</table>';

        return html;
    };
    self.UpdateProgressbar = function (response) {
        var percent = response.count / response.total * 100;
        progressbarModel.SetProgressBarText(percent.toFixed(2), null, Localization.ProgressBar_SavingMassChange);
    };
    self.IndeterminatableCallback = function (element, status) {
        self.SetStatusText(element, status);
    };
    self.SetStatusText = function (element, status) {
        var text = '';

        if (status === null || !jQuery(element).data('state-changed')) {
            text = Captions.MassChange_Label_LeaveUnchanged;
        }
        else {
            switch (element.value) {
                case 'private_note':
                    text = status ? Captions.MassChange_Label_Updatenote : Captions.MassChange_Label_LeaveUnchanged;
                    break;
                case 'is_validated':
                    text = status ? Captions.MassChange_Label_SetToValidated : Captions.MassChange_Label_SetToNotValidated;
                    break;
                case 'is_starred':
                    text = status ? Captions.MassChange_Label_SetToStarred : Captions.MassChange_Label_SetToNotStarred;
                    break;
                case 'is_published':
                    text = status ? Captions.MassChange_Label_SetToPublished : Captions.MassChange_Label_SetToPrivate;
                    break;
                case 'is_template':
                    text = status ? Captions.MassChange_Label_SetToTemplate : Captions.MassChange_Label_SetToNormalAngle;
                    break;
                default:
                    if (element.value === 'is_' + element.id) {
                        text = status ? '"' + Localization.Add + '" ' : '"' + Localization.Remove + '" ';
                        text += 'label';
                    }
                    break;
            }
        }

        jQuery(element).parents('.input:first').find('.textStatus').text(text);
    };
    self.SetAllDisplayPublic = function (displays, publicStatus) {
        var deffered = [];

        for (var loop = 0; loop < displays.length; loop++) {
            if (!displays[loop].is_angle_default && displays[loop].is_public !== publicStatus) {
                deffered.pushDeferred(self.UpdateDisplayState, [displays[loop].state, { is_published: publicStatus }]);
            }
        }

        return deffered;
    };
    self.UpdateDisplayState = function (uri, updateState) {
        var deferred = jQuery.Deferred();
        UpdateDataToWebService(uri.substr(1), updateState)
            .always(function () {
                deferred.resolve();
            });

        return deferred.promise();
    };
    /* BOF: M4-7138: add/remove labels */
    self.LoadLabels = function () {
        if (!self.CanSetLabels()) {
            return jQuery.when();
        }
        return modelsHandler.LoadModelInfo(self.modelData.uri)
            .then(function (data) {
                self.modelData = data;
                var deferred = [];
                deferred.pushDeferred(modelLabelCategoryHandler.LoadAllLabelCategories, [self.modelData.label_categories]);
                deferred.pushDeferred(modelLabelCategoryHandler.LoadAllLabels, [self.modelData.labels]);
                return jQuery.whenAll(deferred);
            });
    };
    self.LoadAllAngles = function () {
        var requests = [];
        for (var loop = 0; loop < self.Angles.length; loop++) {
            var requestUri = self.Angles[loop].uri + '?caching=false';
            requests.pushDeferred(self.GetAngle, [requestUri]);
        }
        self.Angles = [];
        errorHandlerModel.Enable(false);
        var deferred = jQuery.Deferred();
        /* M4-13764: Fixed no summary pop-up after mass changed */
        jQuery.whenAllSet(requests, 5)
            .always(function () {
                setTimeout(function () {
                    errorHandlerModel.Enable(true);
                    deferred.resolve();
                }, 100);
            });

        return deferred.promise();
    };
    self.GetAngle = function (requestUri) {
        return GetDataFromWebService(requestUri)
            .done(function (data) {
                self.Angles.push(data);
            });
    };
    self.GenerateAddRemoveLabelView = function (viewType) {
        var tabId = viewType === enumHandlers.LABELVIEWTYPE.BP ? 'BPLabels' : viewType === enumHandlers.LABELVIEWTYPE.SEARCH ? 'SearchLabels' : 'PrivilegeLabels';
        jQuery('#LabelTabWrapper .tabMenu li').removeClass('active');
        jQuery('#' + tabId).addClass('active');
        jQuery('#Labels-PlaceHolder').empty().html(massChangeLabelsHtmlTemplate());

        var allModelLabelCategories = modelLabelCategoryHandler.GetLabelCategoriesByModelAndViewType(self.modelData.uri, viewType);
        var currentCategories = viewType === enumHandlers.LABELVIEWTYPE.BP ? self.BPCategories : viewType === enumHandlers.LABELVIEWTYPE.SEARCH ? self.SearchCategories : self.PrivilegeCategories;
        var isInitial = false;
        var isCategoryExist = function (categoryId) {
            return jQuery.grep(currentCategories, function (category) { return category.Category.id === categoryId; }).length;
        };
        jQuery.each(allModelLabelCategories, function (index, category) {
            if (!isCategoryExist(category.id)) {
                isInitial = true;

                var labels = ko.toJS(modelLabelCategoryHandler.GetLabelsByCategoryUri(category.uri));
                jQuery.each(labels, function (index, label) {
                    label.IsChecked = ko.observable(null);
                    label.IndeterminatableCallback = massChangeModel.IndeterminatableCallback;
                });

                currentCategories.push({
                    Category: category,
                    Labels: labels
                });
            }
        });

        if (viewType === enumHandlers.LABELVIEWTYPE.BP) {
            ko.applyBindings(self.BPCategories, jQuery('#LabelCategories').get(0));
        }
        else if (viewType === enumHandlers.LABELVIEWTYPE.SEARCH) {
            ko.applyBindings(self.SearchCategories, jQuery('#LabelCategories').get(0));
        }
        else {
            ko.applyBindings(self.PrivilegeCategories, jQuery('#LabelCategories').get(0));
        }

        if (isInitial) {
            setTimeout(function () {
                jQuery('#Labels-PlaceHolder').find(':checkbox')
                    .data('state', enumHandlers.CHECKSTATE.UNDEFINED)
                    .data('state-changed', true);
            }, 1);
        }
        else {
            setTimeout(function () {
                jQuery.each(currentCategories, function (indexCategory, category) {
                    jQuery.each(category.Labels, function (index, label) {
                        var state = label.IsChecked();
                        label.IsChecked(99);
                        label.IsChecked(state);
                    });
                });
            }, 1);
        }
    };
    self.LabelTabClick = function (viewType, element) {
        if (self.CanSetLabels() && !jQuery(element).hasClass('active')) {
            return self.GenerateAddRemoveLabelView(viewType);
        }
    };

    self.GetSelectedAnglesModel = function () {
        var models = [];
        jQuery.each(searchModel.SelectedItems(), function (index, item) {
            if (item.type === enumHandlers.ITEMTYPE.ANGLE && jQuery.inArray(item.model, models) === -1) {
                models.push(item.model);
                if (models.length > 1)
                    return false;
            }
        });
        return models;
    };

    self.CanSetLabels = function () {
        var selectedAnglesModel = self.GetSelectedAnglesModel();
        if (selectedAnglesModel.length === 1)
            self.modelData = modelsHandler.GetModelByUri(selectedAnglesModel[0]);
        return selectedAnglesModel.length === 1;
    };
    /* EOF: M4-7138: add/remove labels */
}
