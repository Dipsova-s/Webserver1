(function (win, models) {

    function Roles() {
        var self = this;

        self.AllRolesPageUri = '';
        self.ModelId = '';
        self.ModelUri = '';
        self.RoleUri = '';
        self.RolePageUri = '';
        self.ConsolidatedRoleUri = '';
        self.HaveModelServer = '';
        self.SupportOData = false;
        self.ClientSettings = '';

        /* begin - all roles page */
        self.GetUsersUri = '';
        self.GetModelsNameUri = '';
        self.CheckCopyRoleUri = '';
        self.CopyRoleUri = '';
        self.CopyRoleData = null;
        self.CurrentCopyModel = null;
        self.CurrentAssignedRolesUser = null;
        self.ModelData = null;
        self.SubRoles = 0;
        var cacheHelps = {};
        self.GetHelpTextUri = '';
        self.COLLAPSIBLE = {
            COLLAPSE: 'collapse',
            EXPAND: 'expand'
        };
        self.BATCHPARAMETERSTYPE = {
            SELECTALL: 'selectall',
            CLEARALL: 'clearall',
            INVERT: 'invert'
        };

        self.InitialAllRoles = function (data) {
            self.ModelUri = '';
            self.GetModelsNameUri = '';
            self.CheckCopyRoleUri = '';
            self.CopyRoleUri = '';
            self.CopyRoleData = null;
            self.CurrentAssignedRolesUser = null;

            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#Grid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.AllRolesGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        self.CurrentCopyModel = self.ModelUri;
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);


        };
        self.AllRolesGridDataBound = function (e) {
            MC.ui.localize();
            MC.ui.btnGroup();
            MC.ui.popup();

            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Id);
            });

            MC.util.setGridWidth(e.sender, 0, Math.max(100, e.sender.wrapper.find('.k-header').eq(0).outerWidth()));
        };
        self.DeleteRole = function (e, obj) {
            obj = jQuery(obj);
            var columns = obj.parents('tr:first').children('td');
            var deleteRole = columns.eq(obj.data('delete-field-index') || 0).text();
            var deleteDescription = MC.util.encodeHtml(columns.eq(1).text());
            var deleteUsersCount = columns.eq(4).text();

            var isInRolesUser = false;
            $.each(MC.Models.Roles.CurrentAssignedRolesUser, function (i, item) {
                if (deleteRole == item) {
                    isInRolesUser = true;
                    return false;
                }
            });

            var confirmMessage;
            if (isInRolesUser)
                confirmMessage = kendo.format(Localization.MC_DeleteRole, deleteRole, deleteDescription, deleteUsersCount);
            else
                confirmMessage = kendo.format(Localization.MC_DeleteRoleConfirm, deleteRole, deleteDescription, deleteUsersCount);

            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    element: obj,
                    type: 'delete'
                })
                .done(function () {
                    obj.parents('tr:first').remove();
                    MC.util.resetGridRows($('#Grid tbody tr'));
                });
            });

            MC.util.preventDefault(e);
        };
        self.CopyRolePopup = function (roleID, roleUri, subRoles) {
            self.SubRoles = subRoles;
            MC.ui.popup('setScrollable', {
                element: '#popupCopyRole'
            });
            var win = $('#popupCopyRole').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });

            $('#RoleUri').val(roleUri);
            $('#RoleName').val(roleID + '_copy');

            MC.form.validator.init('#formCopyRoleToModel');
            $('#formCopyRoleToModel').submit(function (e) {
                $('#popupCopyRole .btnSubmit').trigger('click');
                e.preventDefault();
            });

            if (jQuery('#modelName').is(':disabled')) {
                MC.ui.popup('requestStart');
                MC.ajax.request({
                    url: self.GetModelsNameUri,
                    parameters: "modelUri=" + self.ModelUri + "&roleUri=" + roleUri
                })
                .done(function (data, status, xhr) {
                    var ddlHtml = [];
                    if (data && data.length > 0) {
                        jQuery.each(data, function (index, model) {
                            ddlHtml[index] = '<option value="' + model.Item2 + '"' + (self.CurrentCopyModel == model.Item2 ? ' selected="selected"' : '') + '>' + model.Item1 + '</option>';
                        });
                    } else {
                        MC.util.showPopupOK("No models available", 'Please check models status or models privilege.', "", 450, 150);
                    }
                    $('#modelName')
                        .removeAttr('disabled')
                        .html(ddlHtml.join(''))
                        .kendoDropDownList({
                            change: function (e) {
                                self.CurrentCopyModel = e.sender.value();
                            }
                        });
                })
                .always(function () {
                    setTimeout(function () {
                        MC.ui.popup('requestEnd');
                    }, 100);
                });
            }
        };
        self.GetRoleCopyData = function () {
            MC.form.clean();

            var data = {};
            data.destinationModelUri = $('#modelName').val();
            data.oldModelUri = self.ModelUri;
            data.roleUri = $('#RoleUri').val();
            data.roleName = $('#RoleName').val();

            return data;
        };
        self.CheckCopyRoleToModel = function (e, obj) {
            if (self.SubRoles > 0 && self.ModelUri != $('#modelName').val()) {
                MC.util.showPopupConfirmation(Localization.MC_ShowWarningPopupCopyRole, function () {
                    self.DoCheckCopyRoleToModel(e, obj);
                });
            }
            else {
                self.DoCheckCopyRoleToModel(e, obj);
            }
        };

        self.DoCheckCopyRoleToModel = function (e, object) {
            MC.form.clean();

            if (!jQuery('#formCopyRoleToModel').valid()) return;

            self.CopyRoleData = null;

            var data = self.GetRoleCopyData();

            //MC.ui.popup('requestStart');
            $('#popupCopyRole').busyIndicator(true);
            MC.ajax.request({
                url: self.CheckCopyRoleUri,
                parameters: "destinationModelUri=" + data.destinationModelUri + "&oldModelUri=" + data.oldModelUri + "&roleUri=" + data.roleUri + "&roleName=" + data.roleName,
                type: 'POST'
            })
            .done(function (response, status, xhr) {
                self.CopyRoleData = self.SetAccessDataViaOdata(response.roleData);

                if (response.removedData) {
                    var text = '<p>' + Localization.MC_FollowingSecurablesNotExist + ' ' + response.removedData.modelId + '</p>',
                        removeCount = 0;

                    if (response.removedData.label.length) {
                        removeCount += response.removedData.label.length;
                        text += '<div class="contentSectionInfoItem"><label>' + Localization.MC_RemovedLabels + '</label><p>' + response.removedData.label.join(', ') + ' </p></div>';
                    }
                    if (response.removedData.objectClass.length) {
                        removeCount += response.removedData.objectClass.length;
                        text += '<div class="contentSectionInfoItem"><label>' + Localization.MC_RemovedObjects + '</label><p>' + response.removedData.objectClass.join(', ') + ' </p></div>';
                    }
                    if (response.removedData.objectClass.length) {
                        removeCount += response.removedData.referenceField.length;
                        text += '<div class="contentSectionInfoItem"><label>' + Localization.MC_RemovedReferenceFields + '</label><p>' + response.removedData.referenceField.join(', ') + ' </p></div>';
                    }

                    if (removeCount == 0) {
                        self.CopyRoleToModel();
                    }
                    else {
                        $('#popupConfirmCopy .popupContent').html(text);
                        $('#btnConfirmCopy').trigger('click');
                    }
                }
                else {
                    self.CopyRoleToModel();
                }
            })
            //.fail(function (xhr, status, error) {
            //    MC.ui.loading.setError(MC.ajax.getErrorMessage(xhr, null, error));
            //})
            .always(function () {
                setTimeout(function () {
                    $('#popupCopyRole').busyIndicator(false);
                    jQuery('#popupCopyRole .btnClose').trigger('click');
                    //MC.ui.popup('requestEnd');
                }, 100);
            });
        };

        self.SetAccessDataViaOdata = function (roleData) {
            //if the license support OData, set access_data_via_odata as true 
            //otherwise set access_data_via_odata to null
            if (!self.SupportOData) {
                var roleJson = jQuery.parseJSON(roleData);
                roleJson.model_authorization.privileges.access_data_via_odata = null;
                roleData = JSON.stringify(roleJson);
            }

            return roleData;
        };

        self.CopyRoleToModel = function (e, obj) {
            
            MC.ajax.request({
                url: self.CopyRoleUri,
                parameters: { roleData: self.CopyRoleData },
                type: 'POST',
                ajaxSuccess: function (metadata, data, status, xhr) {
                    jQuery('#popupConfirmCopy').data('kendoWindow').close();

                    MC.ajax.reloadMainContent();
                }
            });
        };
        self.ShowConsolidatedRolePopup = function (roleUri) {
            MC.util.consolidatedRole.showPopup(self.ConsolidatedRoleUri, { roleUri: roleUri });
        };


        /* end - all roles page */

        /* begin - role page */
        var defaultPropertyType;

        self.SideMenuUri = '';
        self.OverviewPageUri = '';
        self.AllRolesPageUri = '';
        self.ConsolidatedRoleUri = '';
        self.PageTitle = '';
        self.FieldsUri = '';
        self.DefaultPagesize = 0;
        self.MaxPageSize = 0;
        self.MaxDomainElementsForSearch = 0;
        self.GetFieldsUri = '';
        self.GetFieldSourceUri = '';
        self.GetFieldDomainUri = '';
        self.GetHelpTextsUri = '';
        self.FieldCategoriesData = [];
        self.LabelCategoriesData = [];
        self.LabelsData = [];
        self.FieldCategoriesIconPath = '';
        self.ResourceIconPath = '';
        self.DeleteListObjects = [];
        self.DeleteListProperties = [];
        self.DeleteListLabelPrivillage = [];
        self.DeleteListSubRoles = [];
        self.AllowObject = [];
        self.DenyObject = [];
        var objectMetadata = { classes: {}, fiels: {} };
        var fieldsData = {};
        var fieldsSourceData = {};
        var labelsData = {};
        var labelCategoriesData = {};
        var selectingFields = [];

        self.InitialRole = function (data) {
            self.AllRolesPageUri = '';
            self.SideMenuUri = '';
            self.OverviewPageUri = '';
            self.ConsolidatedRoleUri = '';
            self.RoleUri = '';
            self.ModelId = '';
            self.ModelUri = '';
            self.PageTitle = '';
            self.FieldsUri = '';
            self.DefaultPagesize = 30;
            self.MaxPageSize = 1000;
            self.MaxDomainElementsForSearch = 100;
            self.GetFieldsUri = '';
            self.GetFieldSourceUri = '';
            self.GetFieldDomainUri = '';
            self.GetHelpTextsUri = '';
            self.FieldCategoriesData = [];
            self.LabelCategoriesData = [];
            self.LabelsData = [];
            self.FieldCategoriesIconPath = '';
            self.ResourceIconPath = '';
            self.DeleteListObjects = [];
            self.DeleteListProperties = [];
            self.DeleteListLabelPrivillage = [];
            self.DeleteListSubRoles = [];
            self.BusinessProcessesData = [];
            self.HaveModelServer = '';
            jQuery.extend(self, data || {});

            if (self.ModelData.Uri) {
                self.ModelData.uri = self.ModelData.Uri;
            }

            setTimeout(function () {
                $("#breadcrumbList li")
                    .last()
                    .replaceWith('<li><a class="noLink">' + self.PageTitle + '</a></li>');
                if (!self.IsCreatePage) {
                    self.InitialClassesChooser();
                    self.InitialObjectGrid();
                    self.InitialFieldsTab();
                    self.InitialLabelGrid();
                    self.InitialSubRolesGrid();
                    self.InitialWebClientGrid();
                    self.IniitalReferenceFilterGrid();
                }
            }, 1);
        };
        self.RoleTabShown = function (tabContent) {
            var treelist = $('#treelist:visible');
            if (treelist.length) {
                kendo.resize(treelist, true);
            }
        };

        // objects tab
        self.InitialObjectGrid = function () {
            self.DeleteListObjects = [];

            $('#ModelPrivilege_DefaultClassAuthorization').kendoDropDownList();
            if (jQuery('#objectsGrid').length) {
                var objectsGrid = jQuery('#objectsGrid').data('kendoGrid');

                if (!objectsGrid) {
                    objectsGrid = jQuery('#objectsGrid').kendoGrid({
                        columns: [
                            {
                                field: 'ObjectId',
                                hidden: true
                            },
                            {
                                field: 'Object',
                                width: 130
                            },
                            {
                                field: 'Accesstype',
                                width: 125
                            },
                            {
                                field: 'Referencedobject'
                            },
                            {
                                field: 'Empty',
                                width: 50,
                                attributes: {
                                    'class': 'columnBoolean'
                                }
                            },
                            'Filter',
                            {
                                field: 'action',
                                width: 75,
                                attributes: {
                                    'class': 'gridColumnToolbar'
                                }
                            }
                        ],
                        scrollable: true,
                        resizable: true
                    }).data('kendoGrid');
                    objectsGrid.content.height(200);
                    objectsGrid.bind('dataBound', self.ObjectsGridDataBound);
                }

                if (objectsGrid) {
                    objectsGrid.trigger('dataBound');
                    self.AllowObject = self.GetAccessToObjectsData(true);
                    self.DenyObject = self.GetAccessToObjectsData(false);
                }
            }
        };
        self.ObjectGridFilterCallback = function () {

            var objectsGrid = jQuery('#objectsGrid').data('kendoGrid');
            jQuery('#objectsGrid input:radio[value="undefied"]').prop('checked', true)

            $.each(self.AllowObject, function (index, item) {
                jQuery('#objectsGrid input:radio[value="true"][name=' + item + '_accessObjectRadio]').prop('checked', true)
            });

            $.each(self.DenyObject, function (index, item) {
                jQuery('#objectsGrid input:radio[value="false"][name=' + item + '_accessObjectRadio]').prop('checked', true)
            });
        };
        self.RemoveObjectsTemporary = function (obj, isRemove) {
            obj = $(obj);
            var data = obj.data('parameters');
            var table
            var row = obj.parents('tr:first');


            var removedObject = row.find('td:first').text();
            var removedClass = row.hasClass('rowMaskAsRemove') ? 'rowMaskAsRemove' : '';

            $('#objectsGrid tr').each(function (index, element) {
                element = $(element);
                if (element.find('td:first').text() == removedObject) {
                    if (removedClass == 'rowMaskAsRemove') {
                        element.addClass('rowMaskAsRemove');
                    }
                    else {
                        element.removeClass('rowMaskAsRemove');
                    }
                }
            });


            var obj = {
                "className": data.className,
                "toClassName": data.toClassName,
                "objectIndex": data.objectIndex,
                "referenceIndex": data.referenceIndex,
                'isAllowedClasses': data.isAllowedClasses,
                'IsAnyObjectToClass': data.IsAnyObjectToClass
            };
            var index = -1;

            for (var i = 0; i < self.DeleteListObjects.length; i++) {
                if (self.DeleteListObjects[i].className == obj.className && self.DeleteListObjects[i].isAllowedClasses == obj.isAllowedClasses &&
                    self.DeleteListObjects[i].objectIndex == obj.objectIndex && self.DeleteListObjects[i].referenceIndex == obj.referenceIndex) {
                    index = i;
                    break;
                }
            }

            //  self.IndexOfObject(obj);
            if (isRemove) {
                if (index == -1) {
                    self.DeleteListObjects.push(obj);
                }
            }
            else {
                if (index != -1) {
                    self.DeleteListObjects.splice(index, 1);
                }
            }
        };
        self.ObjectsGridDataBound = function (e) {
            MC.ui.btnGroup();
            var rowClass = 'k-alt';
            e.sender.items().each(function (index, row) {
                row = $(row).removeClass('k-alt');

                if (!row.children('td:first').find('.hidden').length) {
                    rowClass = rowClass == 'k-alt' ? '' : 'k-alt';
                }
                row.addClass(rowClass);
            });
        };
        self.IndexOfObject = function (obj) {
            var result = -1;
            for (var i = 0, l = self.DeleteListObjects.length; i < l; i++) {
                if (typeof self.DeleteListObjects[i] == "object" && self.DeleteListObjects[i].objectIndex === obj.referenceIndex && self.DeleteListObjects[i].referenceIndex === obj.referenceIndex) {
                    result = i;
                    break;
                }
            }
            return result;
        };
        self.RedirectToObjectPage = function (e, obj) {
            var redirectCallback = function () {
                MC.util.redirect(e, obj);
            };
            MC.form.page.checkChange(redirectCallback);

            MC.util.preventDefault(e);
        };
        self.ChangeAccessType = function (obj) {
            var objectName = $(obj).attr('name')
            var objectID = $(obj).closest('tr').find("td").eq(2).text().trim();
            var allowButton = $('input[name=' + objectName + '][value=true]');
            var denyButton = $('input[name=' + objectName + '][value=false]');
            var undefinedButton = $('input[name=' + objectName + '][value=undefied]');
            if (allowButton.is(":checked")) {
                self.AllowObject.push(objectID);
                self.DenyObject = jQuery.grep(self.DenyObject, function (value) {
                    return value != objectID;
                });
            }
            else if (denyButton.is(":checked")) {
                self.DenyObject.push(objectID);
                self.AllowObject = jQuery.grep(self.AllowObject, function (value) {
                    return value != objectID;
                });
            }
            else {
                self.DenyObject = jQuery.grep(self.DenyObject, function (value) {
                    return value != objectID;
                });
                self.AllowObject = jQuery.grep(self.AllowObject, function (value) {
                    return value != objectID;
                });
            }
        }

        // fields tab
        self.InitialFieldsTab = function () {
            self.DeleteListProperties = [];

            $('#ModelPrivilege_FieldAuthorizations0_CurrencyFieldsDefault').kendoDropDownList();
            $('#ModelPrivilege_FieldAuthorizations0_FieldsDefault').kendoDropDownList();

            if (jQuery('#propertiesGrid').length) {
                var propertiesGrid = jQuery('#propertiesGrid').data('kendoGrid');

                if (!propertiesGrid) {
                    propertiesGrid = jQuery('#propertiesGrid').kendoGrid({
                        columns: [
                            'sourcename',
                            'field',
                            'technical_info',
                             {
                                 field: 'access',
                                 width: 205,
                                 sortable: false
                             },
                            {
                                field: 'action',
                                attributes: {
                                    'class': 'gridColumnToolbar'
                                },
                                width: 75,
                                sortable: false
                            }
                        ],
                        //sortable: true,
                        scrollable: true,
                        resizable: true
                    }).data('kendoGrid');
                    propertiesGrid.content.height(200);
                    propertiesGrid.bind('dataBound', self.PropertyGridDataBound);
                }

                if (propertiesGrid) {
                    propertiesGrid.trigger('dataBound');
                }
            }
        };
        self.PropertyGridDataBound = function (e) {

            MC.ui.popup();
            $(e.sender.content).find('tr').each(function (index, ele) {

                ele = $(ele);
                ele.find('select[name="SourcePropertyObject"]').kendoDropDownList({
                    change: function (e) {
                        var value = e.sender.value();
                        if (value == '') {
                            e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                            e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');
                        }
                        else if (value == 'select_object') {
                            e.sender.element.closest('tr').find("input[name^='sourceClassField']").click();
                        }
                        else {
                            if (e.sender.element.closest('tr').find("input[name^='txtField']").val() != '') {
                                e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                            }
                            e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled').addClass('required');
                        }
                    }
                });

                if (ele.find('select[name="SourcePropertyObject"]').length) {
                    var sourceId = ele.find('input[name="sourceClassFieldId"]').val();
                    var sourceName = ele.find('input[name="sourceClassFieldName"]').val();
                    var newDataSource = [];
                    if (sourceId != '*') {
                        newDataSource =
                               [
                                    { text: Localization.PleaseSelect, value: "" },
                                    { text: Localization.MC_AllObjects, value: "*" },
                                    { text: sourceName, value: sourceId },
                                    { text: Localization.MC_SelectObject, value: "select_object" }

                               ];
                    }
                    else {
                        newDataSource =
                               [
                                    { text: Localization.PleaseSelect, value: "" },
                                    { text: Localization.MC_AllObjects, value: "*" },
                                    { text: Localization.MC_SelectObject, value: "select_object" }
                               ];
                    }
                    ele.find('select[name="SourcePropertyObject"]').data("kendoDropDownList").dataSource.data(newDataSource);
                    ele.find('select[name="SourcePropertyObject"]').data("kendoDropDownList").value(sourceId);
                }
            });



            function getFieldsByIds(ids) {

                var fields = [], requestIds = [];
                jQuery.each(ids, function (index, id) {
                    if (!fieldsData[id]) {
                        requestIds.push(id);
                    }
                    else {
                        fields.push(fieldsData[id]);
                    }
                });
                if (requestIds.length) {
                    return jQuery.when(self.GetFields(self.FieldsUri, { ids: requestIds.join(',') }))
                        .then(function (data) {
                            jQuery.each(data.fields, function (index, field) {
                                fieldsData[field.id] = field;
                                fields.push(field);
                            });
                            return jQuery.when(fields);
                        });
                }
                else {
                    return jQuery.when(fields);
                }
            }

            function getFieldSource(field) {
                if (fieldsSourceData[field.source]) {
                    return jQuery.when(fieldsSourceData[field.source]);
                }
                else {
                    return jQuery.when(self.GetFieldSource(field.source))
                        .done(function (response) {
                            if (response) {
                                fieldsSourceData[response.uri] = response;
                            }
                        });
                }
            }

            setTimeout(function () {

                var ids = [], fieldId, deferred = [], requestingSource = {};
                jQuery.each(e.sender.dataSource.data(), function (index, value) {

                    fieldId = jQuery(value.field).filter('[name="hdnFieldId"]').val();
                    if (fieldId) {
                        ids.push(fieldId);
                    }
                });
                while (ids.length) {
                    deferred.push(getFieldsByIds(ids.splice(0, 30)));
                }

                jQuery.when.apply(jQuery, deferred)
                    .done(function () {
                        var datas = Array.prototype.slice.call(arguments), row;
                        jQuery.each(datas, function (index, fields) {
                            jQuery.each(fields, function (indexField, field) {
                                row = e.sender.content.find('[name="hdnFieldId"][value="' + field.id + '"]').parents('tr:first');

                                row.children('td:eq(2)').text(field.technical_info || '');


                            });
                        });
                    });

                jQuery.each(self.DeleteListProperties, function (index, value) {
                    var btnDelete = e.sender.content.find('input[value="' + value + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);
        };
        self.GetFields = function (uri, params) {
            var self = this;
            disableLoading();
            return MC.ajax.request({
                url: self.GetFieldsUri + '?fieldsUri=' + escape(uri + (uri.indexOf('?') == -1 ? '?' : '&') + jQuery.param(params))
            });
        };
        self.GetFieldSource = function (uri) {
            var self = this;
            if (uri == 'all') {
                var deferred = new jQuery.Deferred();
                setTimeout(function () {
                    deferred.resolve({ uri: 'all', id: 'all', short_name: 'All' });
                }, 300);
                return deferred.promise();
            }
            else {
                disableLoading();
                return MC.ajax.request({
                    url: self.GetFieldSourceUri + '?fieldsSourceUri=' + escape(uri)
                });
            }
        };

        self.RemovePropertyTemporary = function (obj, isRemove) {
            var data = $(obj).data('parameters');

            var index = $.inArray(data.id, self.DeleteListProperties);
            if (isRemove) {
                if (index === -1) {
                    $(obj).closest('tr').find("input[name^='sourceClassField']").removeClass('required');
                    $(obj).closest('tr').find("input[name^='txtField']").removeClass('required');
                    self.DeleteListProperties.push(data.id);
                }
            }
            else {
                if (index !== -1) {
                    $(obj).closest('tr').find("input[name^='sourceClassField']").addClass('required');
                    $(obj).closest('tr').find("input[name^='txtField']").addClass('required');
                    self.DeleteListProperties.splice(index, 1);
                }
            }
        };
        self.SubmitRolePropertyFieldsChooser = function () {
            self.AddRoleProperties();
        };
        self.AddRoleProperties = function () {
            if (fieldsChooserModel.SelectedItems().length > 0) {
                jQuery.each(fieldsChooserModel.SelectedItems(), function (k, v) {
                    var source = fieldsChooserModel.GetFieldSourceByUri(v.source);
                    $(self.CurrentGridField).val(source ? source.short_name + " - " + v.short_name : v.short_name);
                    $($(self.CurrentGridField).next()[0]).val(v.id);
                    if (v.technical_info) {
                        $(self.CurrentGridField).parent().next().text(v.technical_info);
                    }
                    else {
                        $(self.CurrentGridField).parent().next().text('');
                    }
                });
            }
        };
        self.AddRolePropertiesCallback = function (row) {
            var data = null;
            jQuery.each(selectingFields, function (k, v) {
                if (typeof v.is_added == 'undefined') {
                    v.is_added = true;
                    data = v;
                    return false;
                }
            });
            if (data) {
                var fieldType = data.fieldtype;
                if (fieldType == 'boolean') {
                    fieldType = fieldsChooserModel.Captions.FieldTypeBoolean;
                }
                else if (fieldType == 'enumerated') {
                    fieldType = fieldsChooserModel.Captions.FieldTypeEnum;
                }

                var source = fieldsChooserModel.GetFieldSourceByUri(data.source);
                row.find('[name="id"]').val(data.id);
                jQuery('td:eq(0)', row).html(data.short_name || data.id);
                jQuery('td:eq(1)', row).html(!source ? '' : source.short_name);
                jQuery('td:eq(2)', row).html(fieldType);
                jQuery('td:eq(3)', row).html(data.technical_info || '');
                jQuery('td:eq(4) input[name^="AllowedFields"][value="' + defaultPropertyType + '"]', row).prop('checked', true);
            }
        };
        self.PropertySelectAll = function () {
            var grid = jQuery('#DisplayPropertiesGrid').data('kendoGrid');
            if (grid) {
                var uid, dataitem;
                $(grid.items()).filter(':not(.selected,.k-state-selected)').each(function (index, row) {
                    row = $(row);
                    uid = row.data('uid');
                    row.addClass('k-state-selected');

                    dataitem = grid.dataSource.getByUid(uid);
                    if (dataitem) {
                        fieldsChooserModel.SelectedItems.push(dataitem);
                    }
                });

                fieldsChooserModel.OnGridSelectionChanged.call(this, fieldsChooserModel.SelectedItems());
            }
        };
        self.PropertyClearAll = function () {
            jQuery('#DisplayPropertiesGrid .k-grid-content tr').removeClass('k-state-selected');

            fieldsChooserModel.SelectedItems([]);

            fieldsChooserModel.OnGridSelectionChanged.call(this, fieldsChooserModel.SelectedItems());
        };
        self.PropertyGridFilterCallback = function () {
            self.DeleteListProperties = [];

            jQuery('#propertiesGrid .newRow').remove();

            var labelGrid = jQuery('#propertiesGrid').data('kendoGrid');
            if (labelGrid) {
                labelGrid.items().each(function (index, item) {
                    item = $(item);
                    if (item.hasClass('rowMaskAsRemove')) {
                        item.removeClass('rowMaskAsRemove').find('.btnDelete').trigger('click');
                    }
                });
            }
        };
        

        // labels tab
        self.InitialLabelGrid = function () {
            labelsData = {};
            if (self.LabelsData) {
                $.each(self.LabelsData.Data, function (index, label) {
                    labelsData[label.id] = label;
                });
            }
            labelCategoriesData = {};
            $.each(self.LabelCategoriesData || [], function (index, category) {
                labelCategoriesData[category.id] = category;
            });

            $('#DefaultLabelAuthorization').kendoDropDownList();

            self.DeleteListLabelPrivillage = [];


            var treeList = jQuery('#treelist').data('kendoTreeList');

            if (treeList) {
                treeList.bind('dataBound', self.TreeListDataBound);

                treeList.wrapper.on('click', 'tr.top', function (e) {
                    var target = jQuery(e.target);
                    if (!target.hasClass('k-i-collapse') && !target.hasClass('k-i-expand')) {
                        var row = jQuery(e.currentTarget);
                        if (row.find('.k-i-collapse').length) {
                            treeList.collapse(row);
                        }
                        else {
                            treeList.expand(row);
                        }
                        treeList.trigger('dataBound');
                    }
                });

                treeList.wrapper.on('click', '.k-i-collapse, .k-i-expand', function (e) {
                    treeList.trigger('dataBound');
                });

                treeList.trigger('dataBound');
            }

        };
        self.BindLabelDropdown = function (obj) {
            obj = $(obj);
            var categoryId = obj.data('kendoDropDownList').value();
            var target = obj.parents('tr:first').find('[name="Label"]');
            var dropdown = target.data('kendoDropDownList');
            dropdown.enable(false);
            dropdown.setOptions({
                dataTextField: 'label',
                dataValueField: 'id'
            });

            target.val('');
            if (!categoryId) {
                target.removeClass('required');
                dropdown.setDataSource([]);
            }
            else {
                target.addClass('required');
                self.SetDropdownLabelData(dropdown, true);
            }
            self.UpdateOthersLabelDropdown(target);
        };
        self.SetDropdownLabelData = function (dropdown, setNull) {
            var currentValue = dropdown.value();
            var obj = dropdown.wrapper.parents('tr:first').find('[name="LabelCategory"]');
            var categoryUri = obj.children('option:selected').data('parameters').categoryUri.split('/');
            var dataLabel = $.grep(self.LabelsData.Data, function (label) { return label.category == '/' + categoryUri[3] + '/' + categoryUri[4] });

            $.each(dataLabel, function (index, label) {
                label.label = (label.abbreviation || label.id) + ' (' + label.name + ')';
            });

            var currentLabelsData = self.GetPrivilegeData(true);
            for (var i = dataLabel.length - 1; i >= 0; i--) {
                if (dataLabel[i].id != dropdown.value() && currentLabelsData.hasObject('Name', dataLabel[i].id)) {
                    dataLabel.splice(i, 1);
                }
            }

            if (!dataLabel.length) {
                dropdown.setDataSource([{ id: '', label: Localization.MC_NotAvaliable }]);
                dropdown.element.val('');
                dropdown.value('');
                dropdown.enable(false);
            }
            else {
                dropdown.setDataSource(dataLabel);
                if (!currentValue) {
                    if (setNull) {
                        dropdown.element.val('');
                        dropdown.value(null);
                    }
                    else {
                        dropdown.element.val(dataLabel[0].id);
                        dropdown.value(dataLabel[0].id);
                    }
                }
                dropdown.enable(true);
            }
        };
        self.UpdateOthersLabelDropdown = function (currentDropdown) {
            var setNull = true;
            currentDropdown = $(currentDropdown);
            if (currentDropdown.hasClass('btnDelete')) {
                currentDropdown = $();
            }
            $('#PrivilegeLabelsGrid tbody tr').each(function (index, row) {
                row = $(row);
                if (row.find('[name="LabelCategory"]').val()) {
                    var dropdown = row.find('[name="Label"]').not(currentDropdown);
                    if (dropdown.length) {
                        self.SetDropdownLabelData(dropdown.data('kendoDropDownList'), setNull);
                    }
                }
            });
        };
        self.AddNewLabelCallback = function (row) {
            row.find('[name="Type"]').val($('#DefaultLabelAuthorization').val());

            row.find('[name="LabelCategory"], [name="Label"], [name="Type"]').each(function (index, element) {
                var data = [];
                element = $(element);
                element.find('option').each(function (indexOption, elementOption) {
                    data.push($(elementOption).data() || {});
                });

                element.kendoDropDownList({
                    open: function () {
                        MC.form.validator.hideErrorMessage();
                    }
                });

                element.find('option').each(function (indexOption, elementOption) {
                    $(elementOption).data(data[indexOption]);
                });
            });

            self.UpdateOthersLabelDropdown($());
        };
        self.RemoveLabelsTemporary = function (obj, isRemove) {
            var data = $(obj).data('parameters');

            var index = $.inArray(data.privilegeName, self.DeleteListLabelPrivillage);
            if (isRemove) {
                if (index === -1) {
                    self.DeleteListLabelPrivillage.push(data.privilegeName);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteListLabelPrivillage.splice(index, 1);
                }
            }
        };
        self.LabelsGridDataBound = function (e) {
            e.sender.content.find('.k-no-data').remove();
            jQuery('#PrivilegeLabelsGrid').find('[name="LabelCategory"], [name="Label"], [name="Type"]').kendoDropDownList();

            e.sender.content.find('tr').each(function (index, row) {
                row = $(row);
                var columnCategory = row.children('td:eq(0)');
                var categoryElement = columnCategory.children('span');
                var categoryId = categoryElement.data('categoryId');
                if (labelCategoriesData[categoryId]) {
                    categoryElement.text(labelCategoriesData[categoryId].id + ' (' + labelCategoriesData[categoryId].name + ')');
                }

                var columnLabel = row.children('td:eq(1)');
                var labelElement = columnLabel.children('span');
                var labelId = labelElement.data('labelId');
                if (labelsData[labelId]) {
                    labelElement.text(labelsData[labelId].id + ' (' + labelsData[labelId].name + ')');
                }
            });
        };
        self.LabelsGridFilterCallback = function () {
            self.DeleteListLabelPrivillage = [];

            jQuery('#PrivilegeLabelsGrid .newRow').remove();

            var labelGrid = jQuery('#PrivilegeLabelsGrid').data('kendoGrid');
            if (labelGrid) {
                labelGrid.items().each(function (index, item) {
                    item = $(item);
                    if (item.hasClass('rowMaskAsRemove')) {
                        item.removeClass('rowMaskAsRemove').find('.btnDelete').trigger('click');
                    }
                });
            }
        };
        self.CollapseOrExpandAllLabels = function (type) {

            var treeList = $('#treelist').data('kendoTreeList');
            if (typeof treeList[type] == 'function') {
                treeList.unbind('dataBound', self.TreeListDataBound);
                treeList.content.find('tr .k-i-' + type).each(function () {
                    var row = jQuery(this).parents('tr:first');
                    treeList[type](row);
                });
                treeList.bind('dataBound', self.TreeListDataBound);
                treeList.trigger('dataBound');
            }
        };
        var fnCheckLayout;
        self.TreeListDataBound = function (e) {
            if (e.sender.items().length && !e.sender.wrapper.data('__set_initial_data')) {
                MC.form.page.init(self.GetRoleData);
                e.sender.wrapper.data('__set_initial_data', true);
            }

            var container = e.sender.wrapper;
            var dataItems = e.sender.dataItems();
            var updateLayout = function () {
                var dataItem, topNodeId;
                var rowAltIndex;
                container.find('.k-grid-content tr').not('.k-no-data').each(function (index, item) {

                    item = jQuery(item).addClass('custom');
                    dataItem = dataItems[index];
                    item.attr('id', 'row-' + dataItem.Id);
                    if (dataItem.parentId === null) {
                        topNodeId = dataItem.Id;
                        item.addClass('top');
                        rowAltIndex = 0;
                    }
                    else if (item.is(':visible')) {
                        item.removeClass('k-alt').addClass((rowAltIndex % 2 ? 'k-alt' : '') + ' childs childOf' + topNodeId);
                        rowAltIndex++;
                    }
                });
            };


            clearTimeout(fnCheckLayout);

            updateLayout();

            // re-check layout
            fnCheckLayout = setTimeout(function () {

                if (container.find('.k-grid-content tr:not(.custom)').length) {
                    updateLayout();

                    // check #2
                    fnCheckLayout = setTimeout(function () {
                        if (container.find('.k-grid-content tr:not(.custom)').length) {
                            updateLayout();
                        }
                    }, 200);
                }
            }, 200);
        };
        self.ResizeTreeListColumn = function (grid, columnIndex, newWidth) {
            var headerWrapper, column, columnSize, columnOffset,
            headerWrapper = grid.wrapper.find('.k-grid-header-wrap');
            headerWrapperSpace = headerWrapper.width(),
            column = headerWrapper.find('th').eq(columnIndex);
            columnSize = column.outerWidth();
            columnOffset = column.offset();

            if (grid._positionResizeHandle) {
                grid._positionResizeHandle({ currentTarget: column.get(0), clientX: columnOffset.left + columnSize });
                grid.resizable.trigger('start', { currentTarget: grid.resizeHandle[0], x: { location: columnOffset.left + columnSize } });
                grid.resizable.trigger('resize', { x: { location: columnOffset.left + newWidth } });
                grid.resizable.trigger('resizeend');
            }

        };

        // subroles tab
        self.InitialSubRolesGrid = function () {
            self.DeleteListSubRoles = [];

            if (jQuery('#SubRolesGrid').length) {
                var grid = jQuery('#SubRolesGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.SubRolesGridDataBound);
                    grid.trigger('dataBound');
                }
            }
        };
        self.RemoveSubRolesTemporary = function (obj, isRemove) {
            var data = $(obj).data('parameters');

            var index = $.inArray(data.subrole_id, self.DeleteListSubRoles);
            if (isRemove) {
                if (index === -1) {
                    self.DeleteListSubRoles.push(data.subrole_id);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteListSubRoles.splice(index, 1);
                }
            }
        };
        self.SubRolesGridDataBound = function (e) {
            jQuery('#SubRolesGrid .k-no-data').remove();
        };
        self.BindSubRolesDropdown = function (obj) {
            var assignSubRoleId = $(obj).val(),
                parent = $(obj).parents('tr:first');
            if (assignSubRoleId == '') {
                $('td:eq(1)', parent).empty();
                return;
            }

            $('td:eq(1)', parent).html($('option:selected', obj).data('description'));
        };
        self.AddNewSubRolesCallback = function (row) {
            row.find('select').each(function (index, element) {
                var data = [];
                element = $(element);
                element.find('option').each(function (indexOption, elementOption) {
                    data.push($(elementOption).data() || {});
                });

                element.kendoDropDownList();

                element.find('option').each(function (indexOption, elementOption) {
                    $(elementOption).data(data[indexOption]);
                });
            });
        };
        self.SubRolesGridFilterCallback = function () {
            self.DeleteListSubRoles = [];

            jQuery('#SubRolesGrid .newRow').remove();

            var subRolesGrid = jQuery('#SubRolesGrid').data('kendoGrid');
            if (subRolesGrid) {
                subRolesGrid.items().each(function (index, item) {
                    item = $(item);
                    if (item.hasClass('rowMaskAsRemove')) {
                        item.removeClass('rowMaskAsRemove').find('.btnDelete').trigger('click');
                    }
                });
            }
        };

        // privileges tab
        self.InitialWebClientGrid = function () {
            var numerictextbox = $("#ModelPrivilege_Privileges_max_export_rows").kendoNumericTextBox({
                min: 1,
                format: ',0',
                placeholder: Localization.MC_MaxExportRowsUnlimited
            }).data("kendoNumericTextBox");
            $('#AccessClient [name="AllowExport"]:checked').trigger('click');

            if (numerictextbox) {
                numerictextbox._blur();
            }
            self.DisableDrilldown();
        };
        
        // M4-27236 disable 'Drilldown to item in a list Display' + set value to 'Undefined' if 'Obtain more details' is set to 'deny'
        self.DisableDrilldown = function () {
            $('input[type=radio][name=AllowMoreDetails]').change(function () {
                if (this.value == 'False') {
                    $('input[type=radio][name="AllowSingleItemView"]').val(['Undefined']);
                    $('input[type=radio][name="AllowSingleItemView"]').attr('disabled', true);
                }
                else {
                    $('input[type=radio][name="AllowSingleItemView"]').attr('disabled', false);
                }
            }).filter(':checked').trigger('change');
        };

        self.EnableMaxExportRows = function (IsEnabled) {
            var numerictextbox = $("#ModelPrivilege_Privileges_max_export_rows").data("kendoNumericTextBox");
            if (!IsEnabled) {
                numerictextbox.wrapper.hide();
            }
            if (IsEnabled) {
                numerictextbox.wrapper.show();
                numerictextbox.focus();
            }
        };

        // filters tab
        self.BindEnumControl = function (e) {
            var parentCell = $(self.CurrentGridField).closest('tr').find("input[name^=txtFilterValues]").parent().closest('td');
            parentCell = $(parentCell);
            parentCell.html('');
            parentCell.html('<input name="txtFilterValues"  class="enumerated required" type="text" />');

            disableLoading();
            MC.ajax.request({
                url: self.GetFieldDomainUri + '?fieldsDomainUri=' + escape(e.domain),
                type: 'GET'
            })
            .done(function (field) {
                var enumInput = parentCell.find('.enumerated');
                var guid = MC.util.GUID();

                enumInput.addClass(guid);

                $(enumInput).kendoMultiSelect({
                    dataSource: field.elements,
                    placeholder: "Add values",
                    dataTextField: "short_name",
                    dataValueField: "id",
                    headerTemplate: '<div class="dropdown-header k-widget k-header multipleSelectHeader">'
                                  + '<a class="btn btnSelectAll" onclick="MC.Models.Roles.BatchParameters(\'' + guid + '\', MC.Models.Roles.BATCHPARAMETERSTYPE.SELECTALL)" title="Select all"></a>'
                                  + '<a class="btn btnClearAll" onclick="MC.Models.Roles.BatchParameters(\'' + guid + '\', MC.Models.Roles.BATCHPARAMETERSTYPE.CLEARALL)" title="Deselect all"></a>'
                                  + '<a class="btn btnInvert" onclick="MC.Models.Roles.BatchParameters(\'' + guid + '\', MC.Models.Roles.BATCHPARAMETERSTYPE.INVERT)" title="Invert selection"></a>'
                                  + '</div>',
                    tagTemplate: '#= (short_name == long_name ? short_name : short_name + " (" + long_name + ")") #',
                    template: '#= (short_name == long_name ? short_name : short_name + " (" + long_name + ")") #',
                    filter: 'startswith',
                    autoClose: false,

                    change: self.onMultiSelectChange
                });


                var generatedControl = enumInput.prev();
                generatedControl.insertAfter(enumInput);
            });
        };
        self.BatchParameters = function (guid, todo) {
            var input = $('#ReferenceFilterGrid .k-grid-content tr').find('input.' + guid);
            var inputData = input.data('kendoMultiSelect');
            if (inputData) {
                var selectedValues = inputData.value();

                var fnUpdateBatch = function () {
                    try {
                        inputData.input.trigger('focusout');
                        inputData.dataSource.filter({});

                        var values;
                        if (todo == self.BATCHPARAMETERSTYPE.SELECTALL) {
                            values = $.map(inputData.dataSource.data(), function (data) {
                                return data[inputData.options.dataValueField];
                            });
                        }
                        else if (todo == self.BATCHPARAMETERSTYPE.CLEARALL) {
                            values = [];
                        }
                        else {
                            values = [];
                            $.each(inputData.dataSource.data(), function (index, data) {
                                if ($.inArray(data[inputData.options.dataValueField], selectedValues) == -1) {
                                    values.push(data[inputData.options.dataValueField]);
                                }
                            });
                        }
                        inputData.value(values);



                        $(inputData.element).val(values.join(','));
                        // recheck
                        setTimeout(function () {
                            try {
                                inputData.value(values);
                            }
                            catch (ex) {
                                setTimeout(fnUpdateBatch, 10);
                            }
                        }, 10);
                    }
                    catch (ex) {
                        setTimeout(fnUpdateBatch, 10);
                    }
                }
                fnUpdateBatch();
            }
        };
        self.BindMultiInputControl = function (e) {

            var parentCell = $(self.CurrentGridField).closest('tr').find("input[name^=txtFilterValues]").closest('td');
            parentCell = $(parentCell);
            parentCell.html('');
            parentCell.html('<input name="txtFilterValues" type="text" class="required multipleinput" data-role="multipleinput" data-default-text="Add values" />');
            MC.ui.multipleinput();
        };
        self.SerializeRoleData = function () {
            var serializedData;
            serializedData = jQuery('#EditRoleForm').serialize();
            if ($('input[type=radio][name="AllowSingleItemView"]').is(':disabled'))
                serializedData += '&AllowSingleItemView=' + $('input[type=radio][name="AllowSingleItemView"]:checked').val();
            return serializedData;
        };
        self.GetRoleData = function () {
            MC.form.clean();

            var data = {};
            data.modelUri = self.ModelUri;
            data.modelId = self.ModelId;
            data.serializedData = self.SerializeRoleData();
            data.fieldsData = self.GetFieldsData();
            data.subRolesData = self.GetSubRolesData();
            data.privilegeData = self.GetPrivilegeData();
            data.deleteLabelPrivillageList = self.GetUndefinedPrivilegeData();
            data.deleteObjectsList = self.DeleteListObjects.slice();
            data.allowed_classes = self.AllowObject;
            data.denied_classes = self.DenyObject;
            data.object_filters = self.GetReferenceFiltersDataFromGrid();
            data.haveModelServer = self.HaveModelServer;
            return data;
        };
        self.GetAccessToObjectsData = function (isallowed) {
            var datas = [];
            $('#objectsGrid').find('tbody').find('tr').each(function (index) {

                var selectedVal = $(this).find("input[type='radio']:checked").val();

                if (selectedVal == 'true') {
                    if (isallowed)
                        datas.push($(this).find("td").eq(2).text().trim());
                }
                else if (selectedVal == 'false') {
                    if (!isallowed)
                        datas.push($(this).find("td").eq(2).text().trim());
                }


            });
            return datas;
        }
        self.GetFieldsData = function () {
            var datas = [];

            $('#propertiesGrid').find('tbody').find('tr').each(function (index) {
                if (!$(this).hasClass('rowMaskAsRemove')) {
                    var fieldAuthorize = {};
                    fieldAuthorize.classes = [];
                    fieldAuthorize.allowed_fields = [];
                    fieldAuthorize.disallowed_fields = [];

                    var sourceObject = $(this).find('select[name="SourcePropertyObject"]').data("kendoDropDownList").value();
                    fieldAuthorize.classes.push(sourceObject);
                    var fieldsId = $(this).find('input[name="hdnFieldId"]').val();
                    var isAcess = $(this).find('td:eq(3) input[name^="AllowedFields"]').prop('checked');
                    if (fieldsId != '') {
                        if (isAcess) {
                            fieldAuthorize.allowed_fields.push(fieldsId);
                        }
                        else {
                            fieldAuthorize.disallowed_fields.push(fieldsId);
                        }
                    }
                    datas.push(fieldAuthorize);
                }
            });
            return datas;
        };
        self.GetSubRolesData = function () {
            var datas = [];
            $('#SubRolesGrid').find('tbody').find('tr').each(function (index) {
                if (!$(this).hasClass('rowMaskAsRemove')) {
                    var isNew = $(this).hasClass('newRow');
                    var subRoleId = isNew ? $(this).find("td:eq(0) select").val() : $(this).find("td").eq(0).text().trim();
                    if (subRoleId != '') {
                        datas.push(subRoleId);
                    }
                }
            });
            return datas;
        };
        self.GetPrivilegeData = function (includeMaskAsRemove) {
            if (typeof includeMaskAsRemove == 'undefined') includeMaskAsRemove = false;

            var datas = [];
            $('#treelist tbody tr').each(function (index, row) {
                row = $(row);

                if ($(row).find('input[type=radio]:checked').length > 0) {

                    var selectedPvl = $(row).find('input[type=radio]:checked');
                    var privilege = selectedPvl.val();
                    if (privilege && privilege != 'undefined') {
                        var labelId = $.trim(selectedPvl.attr('name').replace('_rdoLabelPvls', ''));

                        if (privilege == 'deny') {
                            privilege = 4;
                        } else if (privilege == 'validate') {
                            privilege = 3;
                        } else if (privilege == 'manage') {
                            privilege = 2;
                        } else if (privilege == 'assign') {
                            privilege = 1;
                        }
                        else if (privilege == 'view') {
                            privilege = 0;
                        }

                        datas.push({
                            'Name': labelId,
                            'Type': privilege
                        });
                    }
                }
            });
            return datas;
        };
        self.GetUndefinedPrivilegeData = function () {
            var datas = [];
            $('#treelist tbody tr input:checked[value="undefined"]').each(function (index, selectedPvl) {
                var selectedPvl = $(selectedPvl);
                var labelId = $.trim(selectedPvl.attr('name').replace('_rdoLabelPvls', ''));
                datas.push(labelId);
            });
            return datas;
        };

        self.SaveEditRole = function () {
            MC.form.clean();

            jQuery('#EditRoleForm .tabPanel').hide();
            if (!jQuery('#EditRoleForm').valid() || !jQuery('#CommentForm').valid()) {
                jQuery('#EditRoleForm .tabPanel').removeAttr('style');
                $('#EditRoleForm,#CommentForm').find('.error:first').focus();
                return false;
            }

            // check each tabs
            jQuery('#EditRoleForm .tabPanel').show();

            if (!jQuery('#EditRoleForm').valid()) {

                var errorTabIndex = $('#EditRoleForm .error:first').parents('.tabPanel:first').index() - 1;

                jQuery('#EditRoleForm .tabPanel').removeAttr('style');
                jQuery('#EditRoleForm .tabNav a').eq(errorTabIndex).trigger('click');
                jQuery('#EditRoleForm').valid();
                return false;
            }


            jQuery('#EditRoleForm .tabPanel').removeAttr('style');
            var data = self.GetRoleData();

            var frm = jQuery('#EditRoleForm');

            var isNew = !self.RoleUri;
            var activeTab = $('#tabNav').find('a.active').attr('id');
            if ($('#CommentText').val()) {
                $('#btnAddComment').trigger('click');
            }
            /*
            denied_classes
            string allowedObjects, string denyObjects
            */
            MC.ajax.request({
                url: frm.attr('action'),
                parameters: data.serializedData + '&modelUri=' + data.modelUri + '&modelId=' + data.modelId + '&deleteClassFromRole=' + JSON.stringify(data.deleteObjectsList) + '&privilegeLabels=' + JSON.stringify(data.privilegeData) + '&deleteLabelPrivillage=' + JSON.stringify(data.deleteLabelPrivillageList) + '&subRoleIds=' + JSON.stringify(data.subRolesData) + '&field_authorizations=' + JSON.stringify(data.fieldsData) + '&allowedObjects=' + JSON.stringify(data.allowed_classes)
                + '&denyObjects=' + JSON.stringify(data.denied_classes) + '&objectFilters=' + encodeURIComponent(JSON.stringify(data.object_filters)) + '&haveModelServer=' + data.haveModelServer,
                type: frm.attr('method'),
                ajaxSuccess: function (metadata, response, status, xhr) {

                    if (response.session_needs_update) {
                        MC.util.showPopupConfirmation(Localization.MC_ConfirmChangePrivileges, function () {
                            jQuery('#logoutForm').submit();
                        }, function () {
                            MC.ajax.request({
                                target: '#sideContent',
                                url: self.SideMenuUri,
                                ajaxSuccess: function () {
                                    if (isNew) {
                                        location.hash = self.RolePageUri + '?parameters=' + JSON.stringify(response.parameters);
                                    }
                                    else {
                                        location.hash = self.AllRolesPageUri;
                                    }
                                }
                            });
                        });
                    }
                    else {
                        MC.ajax.request({
                            target: '#sideContent',
                            url: self.SideMenuUri,
                            ajaxSuccess: function () {
                                if (isNew) {
                                    location.hash = self.RolePageUri + '?parameters=' + JSON.stringify(response.parameters);
                                }
                                else {
                                    location.hash = self.AllRolesPageUri;
                                }
                            }
                        });
                    }
                }
            });
        };
        /* end - role page */

        /* begin - role object page */
        self.RoleId = '';
        self.SaveObjectUri = '';
        self.ObjectIndex = '';
        self.ReferenceIndex = '';
        self.RemovedAllowValue = [];
        self.RemovedDisAllowValue = [];
        self.IsAnyObjectToClass = false;
        self.AnyObjectValue = '*';

        self.InitialFromObjectDropdown = function () {
            var formObject = $('#FromObject').data('kendoMultiSelect');
            if (formObject) {
                formObject.bind('select', self.FromObjectSelect);
                formObject.bind('change', function (e) {
                    if (!e.sender.value().length) {
                        e.sender.value([self.AnyObjectValue]);
                        e.sender.trigger('select');
                    }
                });
                formObject.trigger('select');
            }
        };
        self.FromObjectSelect = function (e) {
            var dataItem = e.item ? e.sender.dataSource.view()[e.item.index()] : e.sender.dataItems()[0],
                values = e.sender.value();
            if (dataItem.Value == self.AnyObjectValue) {
                e.sender.value([dataItem.Value]);
                e.preventDefault();

                $('#allowedClasses').prop('checked', false).attr('disabled', 'disabled');
                $('#denyClasses').prop('checked', false).attr('disabled', 'disabled');
                $('#btnAddFilter').removeClass('disabled');

                self.SetRequiredFields();
            }
            else {
                e.sender.value(jQuery.grep(values, function (value, index) { return value != self.AnyObjectValue }));

                $('#allowedClasses, #denyClasses').removeAttr('disabled');
                if (!$('[name="AccessType"]:checked').length) {
                    $('#allowedClasses').prop('checked', false);
                    $('#denyClasses').prop('checked', true);
                }
                $('#btnAddFilter').addClass('disabled');

                $('[name="AccessType"]:checked').trigger('click');
            }
        };
        self.IniitalReferenceFilterGrid = function () {
            var grid = jQuery('#ReferenceFilterGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.ReferenceFilterGridDataBound);
                grid.trigger('dataBound');
            }
        };
        self.ReferenceFilterGridDataBound = function (e) {
            jQuery('#ReferenceFilterGrid').find('tr.k-no-data').remove();
            MC.ui.popup();
            MC.ui.multipleinput();

            $(e.sender.content).find('tr').each(function (index, ele) {

                ele = $(ele);
                ele.find('select[name="SourceObject"]').kendoDropDownList(
                    {
                        select: function (e) {
                            var dataItem = this.dataItem(e.item.index());
                            var value = dataItem.value;
                            if (value == '') {
                                e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                                e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');


                                e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").value('');
                                e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").enable(false);
                                e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                                e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                                e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);

                                e.sender.element.closest('tr').find("input[name^=txtFilterValues]").val('');
                                e.sender.element.closest('tr').find("input[name^=txtFilterValues]").removeTag([]);

                            }
                            else if (value == 'select_object') {
                                e.sender.element.closest('tr').find("input[name^='sourceClassField']").click();
                            }
                            else {

                                if (e.sender.element.closest('tr').find("input[name^='txtField']").val() != '') {
                                    e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                    e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                                }
                                e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled');

                                var newTargetDataSource =
                               [
                                    { text: Localization.PleaseSelect, value: "" },
                                    { text: "(Self)", value: "(self)" },
                                    { text: MC_SelectObject, value: "select_object" }

                               ];

                                e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").dataSource.data(newTargetDataSource);
                                e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").value('');
                                e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").enable(true);
                                e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                                e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                                e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);

                                e.sender.element.closest('tr').find("input[name^=txtFilterValues]").val('');
                                e.sender.element.closest('tr').find("input[name^=txtFilterValues]").removeTag([]);

                            }
                        }
                    }
                    );

                if (ele.find('select[name="SourceObject"]').length) {
                    var sourceId = ele.find('input[name="sourceClassField"]').val();
                    var sourceName = ele.find('input[name="sourceClassFieldName"]').val();
                    var newDataSource = null;


                    if (sourceId != '*') {
                        newDataSource =
                               [
                                    { text: Localization.PleaseSelect, value: "" },
                                    { text: Localization.MC_AllObjects, value: "*" },
                                    { text: sourceName, value: sourceId },
                                    { text: Localization.MC_SelectObject, value: "select_object" }

                               ];

                    }
                    else {
                        newDataSource =
                               [
                                    { text: Localization.PleaseSelect, value: "" },
                                    { text: Localization.MC_AllObjects, value: "*" },
                                    { text: Localization.MC_SelectObject, value: "select_object" }
                               ];
                    }


                    ele.find('select[name="SourceObject"]').data("kendoDropDownList").dataSource.data(newDataSource);
                    ele.find('select[name="SourceObject"]').data("kendoDropDownList").value(sourceId);


                }

                ele.find('select[name="refrencedObject"]').kendoDropDownList(
                     {
                         select: function (e) {
                             var dataItem = this.dataItem(e.item.index());
                             var value = dataItem.value;
                             if (value == '') {
                                 e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                                 e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                 e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                             }
                             else if (value == 'select_object') {
                                 e.sender.element.closest('tr').find("input[name^='targetClassField']").click();
                                 e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                                 e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);


                             }
                             else if (value == '(self)') {

                                 e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled');
                                 e.sender.element.closest('tr').find("input[name^='txtField']").addClass('required');

                                 e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                                 e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);

                                 if (e.sender.element.closest('tr').find("input[name^='txtField']").val() != '') {
                                     e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                     e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                                 }
                             }

                             else {
                                 if (e.sender.element.closest('tr').find("input[name^='txtField']").val() != '') {
                                     e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                     e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                                 }
                                 e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled');
                                 e.sender.element.closest('tr').find("input[name^='txtField']").addClass('required');



                                 e.sender.element.closest('tr').find("input[type=checkbox]").removeAttr('disabled');
                             }
                         }
                     }
                     );

                if (ele.find('select[name="refrencedObject"]').length) {

                    var targetId = ele.find('input[name="targetClassField"]').val();

                    var targetName = ele.find('input[name="targetClassFieldName"]').val();
                    var targetnewDataSource = [];
                    if (targetId != '(self)') {

                        targetnewDataSource =
                       [
                            { text: Localization.PleaseSelect, value: "" },
                            { text: "(Self)", value: "(self)" },
                            { text: targetName, value: targetId },
                            { text: Localization.MC_SelectObject, value: "select_object" }

                       ];


                    }
                    else {

                        targetnewDataSource =
                      [
                            { text: Localization.PleaseSelect, value: "" },
                            { text: "(Self)", value: "(self)" },
                            { text: Localization.MC_SelectObject, value: "select_object" }

                      ];
                        ele.find("input[type=checkbox]").attr('disabled', 'disabled');
                    }

                    ele.find('select[name="refrencedObject"]').data("kendoDropDownList").dataSource.data(targetnewDataSource);
                    ele.find('select[name="refrencedObject"]').data("kendoDropDownList").value(targetId);
                }

                //enum to datasource
                if (ele.find('input[name="hdnDomainUri"]').length > 0) {
                    var domainUri = ele.find('input[name="hdnDomainUri"]').val();

                    disableLoading();
                    MC.ajax.request({
                        url: self.GetFieldDomainUri + '?fieldsDomainUri=' + escape(domainUri),
                        type: 'GET'
                    })
                    .done(function (field) {
                        var enumInput = ele.find('.enumerated');
                        var guid = MC.util.GUID();

                        enumInput.addClass(guid);


                        $(enumInput).kendoMultiSelect({
                            dataSource: field.elements,
                            placeholder: "Add values",
                            dataTextField: "short_name",
                            dataValueField: "id",
                            headerTemplate: '<div class="dropdown-header k-widget k-header multipleSelectHeader">'
                                          + '<a class="btn btnSelectAll" onclick="MC.Models.Roles.BatchParameters(\'' + guid + '\', MC.Models.Roles.BATCHPARAMETERSTYPE.SELECTALL)" title="Select all"></a>'
                                          + '<a class="btn btnClearAll" onclick="MC.Models.Roles.BatchParameters(\'' + guid + '\', MC.Models.Roles.BATCHPARAMETERSTYPE.CLEARALL)" title="Deselect all"></a>'
                                          + '<a class="btn btnInvert" onclick="MC.Models.Roles.BatchParameters(\'' + guid + '\', MC.Models.Roles.BATCHPARAMETERSTYPE.INVERT)" title="Invert selection"></a>'
                                          + '</div>',
                            tagTemplate: '#= (short_name == long_name ? short_name : short_name + " (" + long_name + ")") #',
                            template: '#= (short_name == long_name ? short_name : short_name + " (" + long_name + ")") #',
                            value: enumInput.val().split(','),
                            filter: 'startswith',
                            autoClose: false,
                            change: self.onMultiSelectChange
                        });

                        var generatedControl = enumInput.prev();
                        generatedControl.insertAfter(enumInput);
                    });
                }
            });
        };

        self.onMultiSelectChange = function (e) {

            var sender = e.sender;
            $(sender.element).val(sender.value().join(','));
        };

        self.GetFilterDescriptionIsEmptlyMessage = function (isAllow, isCheckEmptly) {
            var isEmptyOr = ' <is empty> or ';
            var isNotEmptlyAnd = ' <is not empty> and ';
            var isEmptyMessage = '';

            if (isAllow)
                isEmptyMessage = isCheckEmptly ? isEmptyOr : isNotEmptlyAnd;
            else
                isEmptyMessage = isCheckEmptly ? isNotEmptlyAnd : isEmptyOr;

            return isEmptyMessage;
        };

        self.ShowFilterDescriptionPopup = function (e) {

            e = $(e);

            var trRecord = $(e).closest('tr');
            var isAllow = e.closest('tr').find("input[type=radio]").prop('checked');
            var isCheckEmptly = e.closest('tr').find("input[type=checkbox]").prop('checked');

            var sourceObjectMessage = '<' + ($(e).closest('tr').find("select[name='SourceObject']").val() == "*" ? 'All objects' : $(e).closest('tr').find("select[name='SourceObject']").val()) + '> is ';
            var allowedMessage = isAllow ? '<allowed> when ' : '<denied> when ';
            var targetObjectMessage = '<' + $(e).closest('tr').find("select[name='refrencedObject']").val() + '>';

            var isEmptyMessage = self.GetFilterDescriptionIsEmptlyMessage(isAllow, isCheckEmptly);

            var txtFieldMessage = '<' + e.closest('tr').find("input[name^='txtField']").val() + '>' + ' matches ';
            var txtFiltersMessage = e.closest('tr').find("input[name^='txtFilterValues']").val();

            $('#popupFilterDescriptionTemplate .popupContent').text(sourceObjectMessage + allowedMessage + targetObjectMessage + isEmptyMessage + txtFieldMessage + txtFiltersMessage);

        };

        self.AddPropertyCallback = function (row) {
            MC.ui.popup();

            row.find('select[name="SourcePropertyObject"]').kendoDropDownList(
                {
                    select: function (e) {
                        var dataItem = this.dataItem(e.item.index());
                        var value = dataItem.value;
                        if (value == '') {
                            e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                            e.sender.element.closest('tr').find("td:eq(2)").text('');
                            e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');
                            e.sender.element.closest('tr').find("input[type=radio]").attr('disabled', 'disabled');
                        }
                        else if (value == 'select_object') {
                            e.sender.element.closest('tr').find("input[name^='sourceClassField']").click();
                            e.sender.element.closest('tr').find("input[type=radio]").removeAttr('disabled');
                        }
                        else {
                            if (e.sender.element.closest('tr').find("input[name^='txtField']").val() != '') {
                                e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                            }
                            e.sender.element.closest('tr').find("td:eq(2)").text('');
                            e.sender.element.closest('tr').find("input[type=radio]").removeAttr('disabled');
                            e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled').addClass('required');
                        }
                    }
                }
                );


            self.SetRequiredFieldsForProperty(row);
        };
        self.SetRequiredFieldsForProperty = function (row) {

            //jQuery('#propertiesGrid').find('tr').each(function (index, row) {
            //    row = jQuery(row);
            if (row.find('select[name=SourcePropertyObject]').length > 0) {

                if (row.find('select[name=SourcePropertyObject]').data("kendoDropDownList").value() != '') {

                    row.find("input[name^='txtField']").removeAttr('disabled').addClass('required');
                    row.find("input[name^='txtField']").val('');
                    row.find("input[name^='hdnFieldId']").val('');
                    row.find("input[type=radio]").removeAttr('disabled');
                }
                else {

                    row.find("input[name^='txtField']").attr('disabled', 'disabled');
                    row.find("input[name^='txtField']").val('');
                    row.find("input[name^='hdnFieldId']").val('');
                    row.find("input[type=radio]").attr('disabled', 'disabled');
                }
            }
            // });

        };
        self.RemoveFilterCallback = function (row, isRemoved) {

            if (isRemoved) {
                $(row).closest('tr').find("select[name='SourceObject']").removeClass('required');
                $(row).closest('tr').find("select[name='refrencedObject']").removeClass('required');
                $(row).closest('tr').find("input[name^='txtField']").removeClass('required');
                $(row).closest('tr').find("input[name^='txtFilterValues']").removeClass('required');

            }
            else {
                $(row).closest('tr').find("select[name='SourceObject']").addClass('required');
                $(row).closest('tr').find("select[name='refrencedObject']").addClass('required');
                $(row).closest('tr').find("input[name^='txtField']").addClass('required');
                $(row).closest('tr').find("input[name^='txtFilterValues']").removeClass('required');

            }
        };

        self.AddReferenceFilterCallback = function (row) {

            MC.ui.popup();
            MC.ui.multipleinput();

            row.find('select[name="SourceObject"]').kendoDropDownList(
                {
                    select: function (e) {
                        var dataItem = this.dataItem(e.item.index());
                        var value = dataItem.value;

                        if (value == '') {
                            e.sender.element.closest('tr').find("input[type=radio]").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("select[name='refrencedObject']").data("kendoDropDownList").enable(false);
                            e.sender.element.closest('tr').find("select[name='refrencedObject']").data("kendoDropDownList").value('');
                            e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);
                            e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                            e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                            e.sender.element.closest('tr').find("input[name^=txtFilterValues]").val('');
                            e.sender.element.closest('tr').find("input[name^=txtFilterValues]").removeTag([]);

                        }
                        else if (value == 'select_object') {
                            e.sender.element.closest('tr').find("input[name^='sourceClassField']").click();
                        }

                        else {
                            /* e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                             e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);
                          
                           
                             e.sender.element.closest('tr').find("input[name^=txtFilterValues]").val('');
                             e.sender.element.closest('tr').find("input[name^=txtFilterValues]").removeTag([]);*/
                            e.sender.element.closest('tr').find("input[type=radio]").removeAttr('disabled');
                            e.sender.element.closest('tr').find("select[name='refrencedObject']").data("kendoDropDownList").enable(true);

                            if (e.sender.element.closest('tr').find("input[name^='txtField']").val() != '') {
                                e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                                e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');

                            }
                            e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled');

                            var newTargetDataSource =
                           [
                                { text: Localization.PleaseSelect, value: "" },
                                { text: "(Self)", value: "(self)" },
                                { text: Localization.MC_SelectObject, value: "select_object" }

                           ];

                            e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").dataSource.data(newTargetDataSource);
                            e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").value('');
                            //  e.sender.element.closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").enable(false);
                            e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                            e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);

                            e.sender.element.closest('tr').find("input[name^=txtFilterValues]").val('');
                            e.sender.element.closest('tr').find("input[name^=txtFilterValues]").removeTag([]);

                        }
                    }
                }
                );

            row.find('select[name="refrencedObject"]').kendoDropDownList(
          {
              select: function (e) {

                  var dataItem = this.dataItem(e.item.index());
                  var value = dataItem.value;
                  if (value == '') {
                      e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                      e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);
                      e.sender.element.closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                      e.sender.element.closest('tr').find("input[name^='txtField']").val('');
                      e.sender.element.closest('tr').find("input[name^='hdnFieldId']").val('');
                      //e.sender.element.closest('tr').find("input[name^='txtFilterValues']").val('');
                      //e.sender.element.closest('tr').find("input[name^='txtFilterValues']").prop('disabled', true);
                  }
                  else if (value == 'select_object') {
                      e.sender.element.closest('tr').find("input[name^='targetClass']").click();
                      e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                      e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);
                  }
                  else if (value == '(self)') {


                      e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled');
                      e.sender.element.closest('tr').find("input[name^='txtField']").val('');

                      e.sender.element.closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                      e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);
                  }
                  else {
                      e.sender.element.closest('tr').find("input[type=radio]").removeAttr('disabled');
                      e.sender.element.closest('tr').find("input[name^='txtField']").removeAttr('disabled');
                      e.sender.element.closest('tr').find("input[name^='txtField']").val('');


                      e.sender.element.closest('tr').find("input[type=checkbox]").removeAttr('disabled');
                      e.sender.element.closest('tr').find("input[type=checkbox]").prop('checked', false);

                  }
              }
          }
                );

            self.SetRequiredFields(row);
        };
        self.SetRequiredFields = function (row) {

            row = $(row);
            row.find("input[type=radio]").attr('disabled', 'disabled');
            row.find("select[name='refrencedObject']").data("kendoDropDownList").enable(false);
            row.find("select[name='refrencedObject']").data("kendoDropDownList").value('');
            row.find("input[type=checkbox]").attr('disabled', 'disabled');
            row.find("input[type=checkbox]").prop('checked', false);
            row.find("input[name^='txtField']").attr('disabled', 'disabled');
            row.find("input[name^='txtField']").val('');
            row.find("input[name^='hdnFieldId']").val('');
            /*   row.find("input[name^='txtFilterValues']").val('');
               row.find("input[name^='txtFilterValues']").prop('disabled', true);*/
        };

        self.RemoveAllowValueTemporary = function (obj, isRemove) {
            var data = $(obj).data('parameters'),
                value = jQuery.trim(data.allowValue);

            var index = self.RemovedAllowValue.indexOf(value);
            if (isRemove) {
                if (index == -1) {
                    self.RemovedAllowValue.push(value);
                }
            }
            else {
                if (index != -1) {
                    self.RemovedAllowValue.splice(index, 1);
                }
            }
        };
        self.RemoveDisAllowValueTemporary = function (obj, isRemove) {
            var data = $(obj).data('parameters'),
                value = jQuery.trim(data.disAllowValue);

            var index = self.RemovedDisAllowValue.indexOf(value);
            if (isRemove) {
                if (index == -1) {
                    self.RemovedDisAllowValue.push(value);
                }
            }
            else {
                if (index != -1) {
                    self.RemovedDisAllowValue.splice(index, 1);
                }
            }
        };
        self.DeleteField = function () {
            $('#btnRemoveField').hide();
            $('#SelectedField').val("");
        };
        self.ChooseDenyClass = function (isDisabledRequired) {
            $('#btnAddFilter').addClass('disabled');
            self.SetRequiredFields();
        };
        self.ChooseAllowClass = function () {
            $('#btnAddFilter').removeClass('disabled');
            self.SetRequiredFields();
        };
        self.EditObjectValue = function (obj) {
            var row = $(obj).parents('tr:first'),
                cell = row.find('td:first'),
                cellValue = $.trim(cell.text());

            cell.data('defaultValue', cellValue).html('<input type="text" maxlength="50" value="' + cellValue + '" />');

            var btnMain = row.find('.btn:first');
            if (btnMain.hasClass('btnEdit')) {
                btnMain.removeClass('btnEdit').addClass('btnCancel');
                btnMain.data('clickTarget', btnMain.next('.btnGroupInner').find('.btnCancel'))
            }
        };
        self.CancelObjectValue = function (obj) {
            var row = $(obj).parents('tr:first'),
                cell = row.find('td:first'),
                cellValue = $.trim(cell.find('input').val());

            var btnMain = row.find('.btn:first');
            if (btnMain.hasClass('btnCancel')) {
                btnMain.removeClass('btnCancel').addClass('btnEdit');
                cell.data('defaultValue', cellValue).html('' + cellValue + '');
                btnMain.data('clickTarget', btnMain.next('.btnGroupInner').find('.btnEdit'))
            }
        };
        self.SubmitObjectPropertyFieldsChooser = function () {

            if (fieldsChooserModel.SelectedItems().length > 0) {

                jQuery.each(fieldsChooserModel.SelectedItems(), function (k, v) {
                    var source = fieldsChooserModel.GetFieldSourceByUri(v.source);
                    $(self.CurrentGridField).val(source ? source.short_name + " - " + v.short_name : v.short_name);
                    $($(self.CurrentGridField).next()[0]).val(v.id);

                    if (fieldsChooserModel.SelectedItems()[0].fieldtype == 'enumerated') {
                        self.BindEnumControl(fieldsChooserModel.SelectedItems()[0]);
                    } else {
                        self.BindMultiInputControl(fieldsChooserModel.SelectedItems()[0]);
                    }

                });
                $('#gridDisabled').remove();
            }

            $('#btnRemoveField').show();
        };
        self.GetRoleObjectData = function () {
            MC.form.clean();

            var data = {};
            data.modelId = self.ModelId;
            data.modelUri = self.ModelUri;
            data.roleUri = self.RoleUri;
            data.objectIndex = self.ObjectIndex;
            data.referenceIndex = self.ReferenceIndex;

            var isAllowAccessType = $('input:radio[name=AccessType]:checked').val();
            data.isAllowAccessType = isAllowAccessType == "true" ? true : (isAllowAccessType == 'false' ? false : null);
            data.IsAnyObjectToClass = self.IsAnyObjectToClass;

            data.objectData = self.GetReferenceFiltersDataFromGrid();

            return data;
        };
        self.GetReferenceFiltersDataFromGrid = function () {
            var values = [];



            jQuery('#ReferenceFilterGrid .k-grid-content tr').each(function (index, row) {

                row = jQuery(row);
                if (!row.hasClass('rowMaskAsRemove') && !row.hasClass('k-no-data')) {

                    var sourceObject = row.find('select[name=SourceObject]').val();

                    var filters = {};
                    filters.classes = [];
                    filters.classes.push(sourceObject);

                    var isSelf = (row.find('select[name=refrencedObject]').val() == "(self)");


                    var fieldFilter = {};
                    fieldFilter.field = row.find('input[name=hdnFieldId]').val();

                    var filterValues = null;
                    if (row.find('input[name^="txtFilterValues"]').hasClass('enumerated')) {
                        if (row.find('input[name^="txtFilterValues"]').data('kendoMultiSelect')) {
                            filterValues = row.find('input[name^="txtFilterValues"]').data('kendoMultiSelect').value();
                        }
                    } else {
                        filterValues = row.find('input[name^="txtFilterValues"]').val().split(',');
                    }

                    if (row.find('input[name^="filterType"]').prop('checked') == true) {
                        fieldFilter.allowed_values = filterValues;
                    }
                    else {
                        fieldFilter.disallowed_values = filterValues;
                    }


                    if (isSelf) {
                        filters.field_filters = [];
                        filters.allow_all_null = row.find("input[name^='IsAllow']").prop('checked');
                        filters.field_filters.push(fieldFilter);

                    }
                    else {
                        var filter = {};
                        filter.target_class = row.find('select[name=refrencedObject]').val();
                        filter.allow_all_null = row.find("input[name^='IsAllow']").prop('checked');

                        filter.field_filters = [];
                        filter.field_filters.push(fieldFilter);

                        filters.reference_filters = [];
                        filters.reference_filters.push(filter);
                        //  filter.index = parseInt(row.find('input[name=hiddenId]').val());
                    }

                    values.push(filters);

                }
            });

            //filters.reference_filters = values;
            return values;
        };
        self.SaveReferenceFilters = function () {
            MC.form.clean();

            if (!jQuery('#ObjectForm').valid()) {
                $('#ObjectForm .error:first').focus();

                setTimeout(function () {
                    $('#errorContainer .error:first').show();
                }, 1);
                return false;
            }

            var data = self.GetRoleObjectData();

            MC.ajax.request({
                url: self.SaveObjectUri,
                parameters: {
                    objectIndex: data.objectIndex,
                    roleUri: data.roleUri,
                    modelUri: data.modelUri,
                    modelId: data.modelId,
                    referenceFilter: JSON.stringify(data.objectData),
                    isAllowAccessType: data.isAllowAccessType
                },
                type: 'POST',
                ajaxSuccess: function (metadata, data, status, xhr) {

                    if (data.session_needs_update) {
                        MC.util.showPopupConfirmation(Localization.MC_ConfirmChangePrivileges, function () {
                            jQuery('#logoutForm').submit();
                        }, function () {
                            location.hash = self.RolePageUri + '?parameters=' + JSON.stringify(data.parameters);
                        })
                    }
                    else {
                        location.hash = self.RolePageUri + '?parameters=' + JSON.stringify(data.parameters);
                    }
                }
            });
        };
        /* end - role object page */

        /* begin - fields chooser */
        var addedFields = [];
        self.FIELDSCHOOSER_FOR = {
            PROPERTY: 'property',
            OBJECT: 'object',
            CLASSES: 'classes'
        };
        self.ShowFieldsChooser = function (fieldsChooserFor, e) {
            // set current grid
            self.CurrentGridField = e;

            // initial popup
            window.fieldsChooserModel = MC.ui.fieldschooser.initial(self.DefaultPagesize, self.MaxPageSize, self.MaxDomainElementsForSearch);
            fieldsChooserModel.GetFieldSourceUri = self.GetFieldSourceUri;
            fieldsChooserModel.FieldCategoriesData = self.FieldCategoriesData;
            fieldsChooserModel.FieldCategoriesIconPath = self.FieldCategoriesIconPath;
            fieldsChooserModel.ResourceIconPath = self.ResourceIconPath;
            fieldsChooserModel.GetHelpTextsUri = self.GetHelpTextsUri;
            fieldsChooserModel.GetFieldDomainUri = self.GetFieldDomainUri;
            fieldsChooserModel.ModelUri = self.ModelUri;
            fieldsChooserModel.GetFieldsUri = self.GetFieldsUri;
            fieldsChooserModel.ClientSettings = self.ClientSettings;

            // functions
            fieldsChooserModel.BindDataGridStart = jQuery.noop;
            fieldsChooserModel.GetFieldSourceFunction = function (uri) {
                if (uri == 'all') {
                    var deferred = new jQuery.Deferred();
                    setTimeout(function () {
                        deferred.resolve({ uri: 'all', id: 'all', short_name: 'Unknown' });
                    }, 300);
                    return deferred.promise();
                }
                else {
                    disableLoading();
                    return MC.ajax.request({
                        url: self.GetFieldSourceUri + '?fieldsSourceUri=' + escape(uri)
                    });
                }
            };
            fieldsChooserModel.CheckFieldIsExistsFunction = function (fieldId) {
                return jQuery.inArray(fieldId, addedFields) != -1;
            };
            fieldsChooserModel.GetFieldChooserButtons = function () {
                return [
                    {
                        text: Captions.Button_Cancel,
                        click: function (e) {
                            if (!jQuery(e.currentTarget).hasClass('disabled')) {
                                jQuery('#popupFieldChooser').data('kendoWindow').close();
                            }
                        },
                        className: 'btn btnLarge btnPropertyCancel disabled'
                    },
                    {
                        text: Localization.MC_AddField,
                        click: function () {
                            fieldsChooserModel.OnSubmit.call();
                        },
                        className: 'btn btnLarge btnPrimary btnAddProperty disabled'
                    }
                ];
            };
            fieldsChooserModel.OnGridSelectionChanged = function (selectedItems) {
                if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.PROPERTY) {
                    jQuery('#selectedItems').text(selectedItems.length ? kendo.format(Localization.NumberSelectingItems + ', ', selectedItems.length) : '');
                }
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
                if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.PROPERTY) {
                    /*
                    if (!query.q) {
                        query.q = '*';
                    }*/

                    var selectedClass = jQuery($(self.CurrentGridField).closest('tr').find('td:eq(0) select[name="SourcePropertyObject"]')).data('kendoDropDownList').value();
                    if (selectedClass != '*') {
                        request.data.classes = selectedClass;
                        fieldsChooserModel.FacetsHidden = ['classes'];
                    }
                    else {
                        request.data.classes = '*';
                        fieldsChooserModel.FacetsHidden = [];
                    }
                }
                else {

                    var isSelf = (jQuery($(self.CurrentGridField).parent().prev('td').prev('td').find('select[name="refrencedObject"]')).data('kendoDropDownList').value() == "(self)") ||
                        (jQuery($(self.CurrentGridField).parent().prev('td').prev('td').find('select[name="refrencedObject"]')).data('kendoDropDownList').value() == jQuery($(self.CurrentGridField).closest('tr').find('td:eq(0) select[name="SourceObject"]')).data('kendoDropDownList').value());
                    if (isSelf) {
                        request.data.classes = jQuery($(self.CurrentGridField).closest('tr').find('td:eq(0) select[name="SourceObject"]')).data('kendoDropDownList').value();

                    }
                    else {
                        request.data.classes = jQuery($(self.CurrentGridField).parent().prev('td').prev('td').find('select[name="refrencedObject"]')).data('kendoDropDownList').value();
                    }


                }

                jQuery.extend(
                    request.data,
                    query,
                    fieldsChooserModel.GetSortQuery(),
                    fieldsChooserModel.GetFacetQuery(),
                    fieldsChooserModel.GetDetailedSearchQuery()
                );

                return request;
            };
            fieldsChooserModel.OnSubmit = function () {
                if (jQuery.active) return;

                if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.PROPERTY) {
                    self.SubmitRolePropertyFieldsChooser();
                }
                else {
                    self.SubmitObjectPropertyFieldsChooser();
                }

                jQuery('#popupFieldChooser').data('kendoWindow').close();
            };
            fieldsChooserModel.UpdateClientSettings = function (clientSettings) {
                self.ClientSettings = clientSettings;
            };

            

            // map popup fields
            if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.PROPERTY) {
                addedFields = jQuery('#propertiesGrid tbody tr').find('input[name="id"]').map(function () { return this.value; }).get();
            }
            else {
                addedFields = [];
            }

            // set property popup case by case
            if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.PROPERTY) {
                fieldsChooserModel.FacetsHidden = [];
                fieldsChooserModel.ShowSourceField = true;
                fieldsChooserModel.ShowTechnicalInfo = true;
                fieldsChooserModel.AllowMultipleSelection = false;
            }
            else if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.CLASSES) {

            }
            else {
                fieldsChooserModel.FacetsHidden = ['classes'];
                fieldsChooserModel.ShowSourceField = true;
                fieldsChooserModel.ShowTechnicalInfo = true;
                fieldsChooserModel.AllowMultipleSelection = false;
            }

            // set title to popup
            var title;
            if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.OBJECT) {
                var objectName = jQuery(self.CurrentGridField).parents('tr:first').find('select[name="refrencedObject"]').data('kendoDropDownList').value();
                title = kendo.format(Localization.MC_SelectAFieldFromObject, objectName);
            }
            else {
                title = jQuery(e).data('title');
            }

            // show popup
            MC.ui.fieldschooser.showFieldsChooserPopup(title);

            // set element
            if (fieldsChooserFor == self.FIELDSCHOOSER_FOR.PROPERTY) {
                jQuery('#selectedItems').text('');
                jQuery('#popupFieldChooser input[name="AddPropertyType"][value="False"]').prop('checked', true);
            }

            // enabled buttons
            MC.ui.fieldschooser.checkFieldsChooserButtons('.btn');
        };
        /* end - fields chooser */

        /* begin - classes chooser */
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
                if (oldList.length == newList.length) {
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
            self.CurrentGridField = target;
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
            win.element.find('.btnSelectAll, .btnClearAll').addClass('alwaysHidden');


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
        self.SetDisableUI = function (disable) {
            if (disable) {
                jQuery('#popupClassesChooser').busyIndicator(true);
            }
            else {
                jQuery('#popupClassesChooser').busyIndicator(false);
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

                helpHtml = Localization.MC_SingleObject_Instruction;

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
        self.SetSelectedClassesCallback = function (classes) {
            if (classes.length) {
                jQuery('#popupClassesChooser .btnContinue').removeClass('disabled');
            }
            else {
                jQuery('#popupClassesChooser .btnContinue').addClass('disabled');
            }
        };
        self.OnSubmitClasses = function (classes) {
            if (classes.length) {

                if ($(self.CurrentGridField).attr('name') == 'targetClassField') {
                    var newDataSource =
                         [
                            { text: Localization.PleaseSelect, value: "" },
                            { text: "(Self)", value: "(self)" },
                            { text: MC.Models.Roles.ClassesChooserHandler.GetAllSelectedClassesName()[0], value: classes[0] },
                            { text: Localization.MC_SelectObject, value: "select_object" }

                         ];

                    $(self.CurrentGridField).closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").dataSource.data(newDataSource);
                    $(self.CurrentGridField).closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").value(classes[0]);


                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").removeAttr('disabled');
                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").val('');

                    $(self.CurrentGridField).closest('tr').find("input[type=checkbox]").removeAttr('disabled');


                }
                else if ($(self.CurrentGridField).attr('name') == 'sourceClassFieldId') {
                    var newDataSource =
                    [
                        { text: Localization.PleaseSelect, value: "" },
                        { text: Localization.MC_AllObjects, value: "*" },
                        { text: MC.Models.Roles.ClassesChooserHandler.GetAllSelectedClassesName()[0], value: classes[0] },
                        { text: Localization.MC_SelectObject, value: "select_object" }

                    ];

                    $(self.CurrentGridField).closest('tr').find('select[name="SourcePropertyObject"]').data("kendoDropDownList").dataSource.data(newDataSource);
                    $(self.CurrentGridField).closest('tr').find('select[name="SourcePropertyObject"]').data("kendoDropDownList").value(classes[0]);

                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").removeAttr('disabled');
                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").addClass('required');
                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").val('');
                    $(self.CurrentGridField).closest('tr').find("td:eq(2)").text('');

                }
                else {

                    var newDataSource =
                      [
                        { text: Localization.PleaseSelect, value: "" },
                        { text: Localization.MC_AllObjects, value: "*" },
                        { text: MC.Models.Roles.ClassesChooserHandler.GetAllSelectedClassesName()[0], value: classes[0] },
                        { text: Localization.MC_SelectObject, value: "select_object" }

                      ];

                    $(self.CurrentGridField).closest('tr').find('select[name="SourceObject"]').data("kendoDropDownList").dataSource.data(newDataSource);
                    $(self.CurrentGridField).closest('tr').find('select[name="SourceObject"]').data("kendoDropDownList").value(classes[0]);

                    $(self.CurrentGridField).closest('tr').find("input[type=radio]").removeAttr('disabled');
                    $(self.CurrentGridField).closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").enable(true);

                    $(self.CurrentGridField).closest('tr').find('select[name="refrencedObject"]').data("kendoDropDownList").value('');

                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").val('');
                    $(self.CurrentGridField).closest('tr').find("input[name^='txtField']").attr('disabled', 'disabled');
                    $(self.CurrentGridField).closest('tr').find("input[type=checkbox]").attr('disabled', 'disabled');
                    $(self.CurrentGridField).closest('tr').find("input[type=checkbox]").prop('checked', false);


                    $(self.CurrentGridField).closest('tr').find("input[name^=txtFilterValues]").val('');
                    $(self.CurrentGridField).closest('tr').find("input[name^=txtFilterValues]").removeTag([]);

                }
            }
            jQuery('#popupClassesChooser').data('kendoWindow').close();

        };
        /* end - classes chooser */
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Roles: new Roles()
    });

})(window, MC.Models);
