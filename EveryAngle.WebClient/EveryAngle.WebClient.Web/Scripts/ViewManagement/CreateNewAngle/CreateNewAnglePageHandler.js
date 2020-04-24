var createNewAngleViewManagementModel = new CreateNewAngleViewManagementModel();

function CreateNewAngleViewManagementModel() {
    "use strict";

    var self = this;
    /*BOF: Model Properties*/
    self.SCHEMAVIEWTYPE = {
        SIMPLE: 'simple',
        DETAILED: 'detailed'
    };
    self.CreateAngleSettingsName = 'create_angle_settings';
    var defaultAngleSettings = {
        model: null,
        createby_schema: {},
        createby_object: {
            bp_stack: null,
            bp: null,
            q: ''
        }
    };
    defaultAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.SIMPLE] = { bp: null };
    defaultAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.DETAILED] = { bp: null };
    self.CreateAngleSettings = jQuery.extend({}, defaultAngleSettings, jQuery.localStorage(self.CreateAngleSettingsName));
    self.DataAngleSchemaName = 'data_angle_schema';
    self.DataAngleSchema = null;
    self.CurrentModelData = null;

    self.SelectedSchema = ko.observable(null);
    /*EOF: Model Properties*/

    /*BOF: Model Methods*/

    // popup options
    self.ShowCreateOption = function () {
        // set default schema bp
        var defaultBP = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES);
        if (!self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.SIMPLE].bp) {
            self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.SIMPLE].bp = defaultBP[0] || 'O2C';
        }
        if (!self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.DETAILED].bp) {
            self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.DETAILED].bp = defaultBP[0] || 'O2C';
        }

        // set default object bp
        if (!self.CreateAngleSettings.createby_object.bp) {
            self.CreateAngleSettings.createby_object.bp = defaultBP.length ? defaultBP : ['O2C'];
        }
        if (!self.CreateAngleSettings.createby_object.bp_stack) {
            self.CreateAngleSettings.createby_object.bp_stack = defaultBP.length ? defaultBP : ['O2C'];
        }

        // save settings
        self.SaveSettings();

        // set  model data
        self.CurrentModelData = modelsHandler.GetModelByUri(self.CreateAngleSettings.model);

        var popupName = 'CreateNewAngleOption',
            popupSettings = {
                title: kendo.format(Captions.Popup_CreateNewAngle_TitleOptions, self.CurrentModelData.short_name || self.CurrentModelData.id),
                element: '#popup' + popupName,
                html: createAngleOptionHtmlTemplate(),
                className: 'popup' + popupName,
                buttons: null,
                width: 850,
                height: 530,
                minWidth: 715,
                minHeight: 300,
                open: self.ShowCreateOptionCallback
            };

        popup.Show(popupSettings);
    };
    self.ShowCreateOptionCallback = function (e) {
        e.sender.wrapper.height('auto');

        jQuery('#ButtonCreateAngleFromSchemaSimple, #ButtonCreateAngleFromSchemaDetailed').addClass('disabled');
        e.sender.element.busyIndicator(true);
        var blankImage = self.GetPictureFromSchemaData(null);
        var images = jQuery('#ChooseNewAngleOption .imageSection img').not(':last').attr('src', blankImage);

        jQuery.when(self.DataAngleSchema || GetDataFromWebService('userapi/getcreatenewanglebyschema', null, true))
            .done(function (response) {
                self.DataAngleSchema = response;

                // restructure schema (Array -> JSON)
                jQuery.each(self.DataAngleSchema, function (index, schema) {
                    jQuery.each(schema.Details, function (indexDetail, detail) {
                        if (detail instanceof Array) {
                            var newDetail = {};
                            jQuery.each(schema.DetailFields, function (indexDetailField, detailField) {
                                newDetail[detailField] = detail[indexDetailField];
                            });
                            schema.Details[indexDetail] = newDetail;
                        }
                    });
                });

                // set schema simple image
                var bpSimple = self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.SIMPLE].bp;
                var areaSimple = self.GetSchemaData(bpSimple, self.SCHEMAVIEWTYPE.SIMPLE);
                images.eq(0).attr('src', self.GetPictureFromSchemaData(areaSimple));

                // set schema detailed image
                var bpDetailed = self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.DETAILED].bp;
                var areaDetailed = self.GetSchemaData(bpDetailed, self.SCHEMAVIEWTYPE.DETAILED);
                images.eq(1).attr('src', self.GetPictureFromSchemaData(areaDetailed));
            })
            .always(function () {
                jQuery('#ButtonCreateAngleFromSchemaSimple, #ButtonCreateAngleFromSchemaDetailed').removeClass('disabled');
                e.sender.element.busyIndicator(false);
            });
    };
    self.CloseCreateOption = function () {
        popup.Close('#popupCreateNewAngleOption');
    };

    // popup create by schema
    var angleCache = {};
    var currentSchemaMode = null;
    self.ShowCreateAngleBySchema = function (schemaMode) {
        if (jQuery('#ButtonCreateAngleFromSchemaSimple').hasClass('disabled') ||
            jQuery('#ButtonCreateAngleFromSchemaDetailed').hasClass('disabled'))
            return;
        
        self.CloseCreateOption();

        currentSchemaMode = schemaMode;

        var createAngleTypeTitle = currentSchemaMode === self.SCHEMAVIEWTYPE.SIMPLE ? Localization.ActivitiesScheme : Localization.ObjectsScheme;

        var popupName = 'CreateNewAngleBySchema',
            popupSettings = {
                title: kendo.format(Captions.Popup_CreateNewAngle_TitleByType, self.CurrentModelData.short_name || self.CurrentModelData.id, createAngleTypeTitle),
                element: '#popup' + popupName,
                html: createAngleSchemaHtmlTemplate(),
                className: 'popupCreateNewAngle popup' + popupName,
                minWidth: 750,
                minHeight: 300,
                buttons: [
                    {
                        text: Localization.CreateNewAngleFromSchema,
                        click: function () {
                            self.CreateNewAngleFromSchema();
                        },
                        className: 'btnSubmit executing',
                        position: 'right'
                    },
                    {
                        text: '<i class="iconBack">&lsaquo;</i>' + Localization.BackToCreateOptions,
                        click: function (e) {
                            self.ShowCreateOption();
                            setTimeout(function () {
                                e.kendoWindow.close();
                            }, 1);
                        },
                        position: 'left'
                    }
                ],
                resize: function (e) {
                    var businessProcessBar = e.sender.element.find('.businessProcesses');
                    if (businessProcessBar.length) {
                        if (businessProcessesModel.CreateNewAngleSchemaBusinessProcess) {
                            businessProcessesModel.CreateNewAngleSchemaBusinessProcess.UpdateLayout(businessProcessBar);
                        }

                        var winWidth = e.sender.element.width();
                        if (winWidth > 768) {
                            var height = e.sender.element.height() - e.sender.element.find('[id="Angle"]').position().top - 2;
                            e.sender.element.removeClass('compactMode');
                            e.sender.element.find('.Description,.schemaWrapper').css({
                                'height': height,
                                'overflow-y': 'auto'
                            });
                            e.sender.element.find('.schemaWrapper').width(jQuery('#Schema img').width() + WC.Window.ScrollBarWidth);
                        }
                        else {
                            e.sender.element.addClass('compactMode');
                            e.sender.element.find('.Description,.schemaWrapper').removeAttr('style');
                        }
                    }
                },
                open: self.ShowCreateAngleBySchemaCallback,
                close: popup.Destroy
            };

        popup.Show(popupSettings);
    };
    self.ShowCreateAngleBySchemaCallback = function (e) {
        e.sender.element.find('.schemaWrapper').busyIndicator(true);

        businessProcessesModel.CreateNewAngleSchemaBusinessProcess = new BusinessProcessesViewModel();
        businessProcessesModel.CreateNewAngleSchemaBusinessProcess.Theme('flat');
        businessProcessesModel.CreateNewAngleSchemaBusinessProcess.MultipleActive(false);
        businessProcessesModel.CreateNewAngleSchemaBusinessProcess.CanEmpty(false);
        businessProcessesModel.CreateNewAngleSchemaBusinessProcess.ClickCallback(function (data) {
            if (data.is_allowed) {
                self.SetSchemaDiagram();
            }
        });
        businessProcessesModel.CreateNewAngleSchemaBusinessProcess.ApplyHandler('#CreateAngleBySchemaBusinessProcess');

        var currentBP = {};
        currentBP[self.CreateAngleSettings.createby_schema[currentSchemaMode].bp] = true;

        businessProcessesModel.CreateNewAngleSchemaBusinessProcess.CurrentActive(currentBP);

        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.CreateAngleSettings.model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.CreateNewAngleSchemaBusinessProcess, modelPrivileges);

        // check language
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        if (defaultLanguage !== 'en' && jQuery.inArray(defaultLanguage, self.CurrentModelData.active_languages) === -1) {
            setTimeout(function () {
                popup.Alert(Localization.Warning_Title, Localization.ErrorLanguageNotInModel);
            }, 1000);
        }

        self.SetSchemaHelpTexts();
        self.SetSchemaDiagram();
        WC.HtmlHelper.ApplyKnockout(self, e.sender.wrapper);

        setTimeout(function () {
            e.sender.element.find('.schemaWrapper').busyIndicator(false);
            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
        }, 250);
    };
    self.GetSchemaData = function (bp, mode) {
        var modelId = self.CurrentModelData.id;
        var key;
        var getSchemaByFilter = function (filter) {
            // 1st search with model
            var areaData = jQuery.grep(self.DataAngleSchema, function (element) {
                return element.Key === filter && element.ModelName === modelId;
            });
            if (areaData.length) {
                return areaData[0];
            }

            // 2nd search without model
            areaData = jQuery.grep(self.DataAngleSchema, function (element) {
                return element.Key === key;
            });
            if (areaData.length) {
                return areaData[0];
            }

            return null;
        };

        //====================== begin - new schema ===============================
        if (mode === self.SCHEMAVIEWTYPE.SIMPLE) {
            key = bp + '_activities';
        }
        else {
            key = bp + '_objects';
        }
        var newSchemaArea = getSchemaByFilter(key);
        if (newSchemaArea) {
            return newSchemaArea;
        }
        //====================== end - new schema =================================

        //====================== begin - old schema ===============================
        if (mode === self.SCHEMAVIEWTYPE.SIMPLE) {
            key = bp + '_Basic';
        }
        else {
            key = bp + '_Detailed';
        }

        var oldSchemaArea = getSchemaByFilter(key);
        if (oldSchemaArea) {
            return oldSchemaArea;
        }
        //====================== end - old schema =================================

        // not found
        return null;
    };
    self.GetPictureFromSchemaData = function (schemaData) {
        if (schemaData) {
            var picture = schemaData.Picture.toLowerCase();
            if (picture.charAt(0) === '/') picture = picture.replace(/\/\//g, '/');
            return picture;
        }

        // blank image
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    };
    self.SetSchemaDiagram = function () {
        var currentSelectedBusinessProcess = businessProcessesModel.CreateNewAngleSchemaBusinessProcess.GetActive().toString();

        // save settings
        var setting = {};
        setting.bp = currentSelectedBusinessProcess;
        self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.SIMPLE] = { bp: currentSelectedBusinessProcess };
        self.CreateAngleSettings.createby_schema[self.SCHEMAVIEWTYPE.DETAILED] = { bp: currentSelectedBusinessProcess };
        self.SaveSettings();

        jQuery('#popupCreateNewAngleBySchema .Description').empty();
        jQuery('#Schema').off('click.scheme');

        var mapItemClick = function (e, isCreate) {
            var element = jQuery(e.currentTarget);
            if (!element.find('a').hasClass('Legend')) {
                var data = element.data('details');
                jQuery('.popupCreateNewAngleBySchema .btnSubmit').removeClass('btn-primary').addClass('btn-ghost');
                if (!element.hasClass('disabled')) {
                    jQuery('#Schema div').removeClass('active');
                    element.addClass('active');

                    self.SelectedSchema({ Name: data.Name, ClassId: data.ClassId, TemplateId: data.TemplateId });
                    if (!isCreate) {
                        jQuery('.popupCreateNewAngleBySchema .btnSubmit').removeClass('btn-ghost').addClass('btn-primary');
                        self.MapClicked(data.ClassId);
                    }
                    else {
                        WC.Ajax.AbortAll();
                        self.CreateNewAngleFromSchema();
                    }
                }
                else if (!isCreate) {
                    jQuery('#Schema div').removeClass('active');
                    self.MapClicked(data.ClassId);
                }
            }
        };
        var container = jQuery('#Schema');
        var area = self.GetSchemaData(currentSelectedBusinessProcess, currentSchemaMode);
        var picture = self.GetPictureFromSchemaData(area);
        if (area && area.Details) {
            // test border size
            container.append('<div />');
            var borderWidth = parseInt(container.children('div').css('border-width'), 10) || 3;

            container.children('div,p').remove();
            var maps = area.Details;
            for (var index = 0; index < maps.length; index++) {
                var element = jQuery('<div />');
                var elementInner = jQuery('<a><span class="inprogress"></span></a>');

                var borderColor = 'transparent';
                if (maps[index].AreaStyle.BorderColor !== '#ffffff') {
                    borderColor = maps[index].AreaStyle.BorderColor;
                }

                var title = maps[index].ClassId;
                var cssClass = maps[index].CSSClass || '';
                if (!maps[index].IsValidHelptextId) {
                    title = "The id: " + maps[index].ClassId + " is not valid";
                    cssClass = 'validWarning';
                }
                if (maps[index].AreaType === 'Legend') {
                    cssClass += ' noBorder';
                }


                element.attr({
                    'title': title,
                    'id': ('ClassId_' + maps[index].Name).toLowerCase(),
                    'name': ('ClassId_' + maps[index].ClassId).toLowerCase(),
                    'class': cssClass + ' disabled'
                })
                    .data('details', maps[index])
                    .css({
                        left: maps[index].Coordinate[0] - borderWidth,
                        top: maps[index].Coordinate[1] - borderWidth,
                        width: maps[index].Coordinate[2],
                        height: maps[index].Coordinate[3],
                        'border-color': borderColor
                    })
                    .click(function (e) {
                        mapItemClick(e, false);
                    })
                    .dblclick(function (e) {
                        mapItemClick(e, true);
                    });

                elementInner
                    .css({
                        'height': maps[index].Coordinate[3],
                        'width': maps[index].Coordinate[2],
                        'vertical-align': maps[index].AreaStyle.VerticalAlignment,
                        'color': maps[index].AreaStyle.TextColor,
                        'font-weight': maps[index].AreaStyle.FontWeight,
                        'text-align': maps[index].AreaStyle.TextAlignment,
                        'font-size': maps[index].AreaStyle.FontSize
                    })
                    .attr({
                        'id': ('TemplateId_' + maps[index].TemplateId).toLowerCase(),
                        'class': (maps[index].AreaType || '') + ' ' + (maps[index].TextSize || 'short')
                    });

                elementInner.children('span').text(maps[index].ClassId)
                    .css({
                        'padding': maps[index].AreaStyle.Padding,
                        'width': maps[index].Coordinate[2],
                        'max-height': maps[index].Coordinate[3]
                    });

                element.append(elementInner);
                container.append(element);
            }

            try {
                jQuery('#Angle > .schemaWrapper').busyIndicator(true);
                self.SetSchemaTemplates()
                    .always(function () {
                        jQuery('#Angle > .schemaWrapper').busyIndicator(false);
                    });
                self.SetSchemaHelpTexts();
            }
            catch (err) {
                // no error
            }

            jQuery('#mapImageSource').attr('src', picture);

            // set default help event
            jQuery('#Schema').on('click.scheme', { area: area }, function (e) {
                var element = jQuery(e.target);
                if (jQuery('#popupCreateNewAngleBySchema').is(':visible')
                    && !element.parents('[id^=classid_area_], .btn, .k-window-actions').length
                    && !element.is('[id^=classid_area_], .btn, .k-window-actions')) {
                    jQuery('.popupCreateNewAngleBySchema .btnSubmit').removeClass('btn-primary').addClass('btn-ghost');
                    self.ShowSchemaDefaultHelp(e.data.area);
                }
            });

            // show default help
            self.ShowSchemaDefaultHelp(area);
        }
        else {
            container.children('div,p').remove();
            container.append('<p>Cannot find the selected object</p>');
            jQuery('#mapImageSource').attr('src', picture);
            self.ShowSchemaDefaultHelp(null);
        }
    };
    self.ShowSchemaDefaultHelp = function (area) {
        var helpId = area ? area.DefaultHelp : null;
        self.ShowSchemaHelptextDescription(helpId || '');
        self.SelectedSchema(null);
        jQuery('#Schema').children().removeClass('active');
    };
    self.MapClicked = function (classId) {
        self.ShowSchemaHelptextDescription(classId || '');
    };
    self.ShowSchemaHelptextDescription = function (helpId) {
        if (helpId) {
            self.LoadHelptextsByIds([helpId])
                .done(function () {
                    helpTextHandler.ShowHelpTextInArea(helpId, '#popupCreateNewAngleBySchema .Description', helpTextHandler.HELPTYPE.HELPTEXT, self.CreateAngleSettings.model);
                });
        }
        else {
            helpTextHandler.ShowHelpTextInArea(helpId, '#popupCreateNewAngleBySchema .Description', helpTextHandler.HELPTYPE.HELPTEXT, self.CreateAngleSettings.model);
        }
    };
    self.SetSchemaHelpTexts = function () {
        var filters = self.GetHelptextFilters();
        if (filters.length) {
            return self.LoadHelptextsByIds(filters)
                .done(function (response) {
                    self.SetSchemaName(response.help_texts);
                });
        }
        else {
            return jQuery.when(null);
        }
    };
    self.SetSchemaName = function (helptexts) {
        if (helptexts !== null && helptexts.length !== 0) {
            jQuery('#Schema > div').each(function (index, value) {
                var schemaObject = jQuery(value),
                    element = helptexts.findObject('id', schemaObject.attr('name').toLowerCase().replace('classid_', ''), false);
                if (element) {
                    schemaObject.attr('title', element.long_name || element.short_name || element.id);
                    if (schemaObject.find('a').hasClass('short')) {
                        schemaObject.find('span').text(element.short_name || element.id);
                    }
                    else {
                        schemaObject.find('span').text(element.long_name || element.id);
                    }
                }
                schemaObject.find('span').removeClass('inprogress');
            });
        }
        else {
            jQuery('#Schema span').removeClass('inprogress');
        }
    };
    self.CreateNewAngleFromSchema = function () {
        if (jQuery('.popupCreateNewAngleBySchema .btnSubmit').hasClass('disabled'))
            return;


        if (!self.SelectedSchema()) {
            popup.Alert(Localization.Warning_Title, Localization.Info_RequiredTemplateBeforeCreateAngle);
            return;
        }

        WC.Ajax.AbortAll();

        // disable all ui
        self.SetDisableCreateFromSchemaUI(true);

        var element = jQuery('#classid_' + self.SelectedSchema().Name),
            template = element.children().data('angle');

        var requestUrl = self.CreateAngleSettings.model + '/angles';
        var requestParams = {};
        requestParams['ids'] = self.SelectedSchema().TemplateId;
        requestParams[enumHandlers.PARAMETERS.CACHING] = false;


        jQuery.when(template ? { angles: [template] } : GetDataFromWebService(requestUrl, requestParams))
            .done(function (responseModel) {
                if (responseModel && responseModel.angles.length === 1) {
                    template = responseModel.angles[0];
                    if (template.displays_summary.length > 0) {
                        var defaultdisplay = null;
                        for (var i = 0; i < template.displays_summary.length; i++) {
                            if (template.displays_summary[i].is_angle_default) {
                                defaultdisplay = template.displays_summary[i];
                                break;
                            }
                        }

                        if (!defaultdisplay) {
                            defaultdisplay = template.displays_summary[0];
                        }

                        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);

                        var params = {};
                        if (template.is_template) {
                            params[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.ANGLEPOPUP;
                            params[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
                        }
                        params[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
                        window.location = WC.Utility.GetAnglePageUri(template.uri, defaultdisplay.uri, params);
                    }
                }
                else if (responseModel === null || responseModel.angles.length === 0) {
                    popup.Alert(Localization.Warning_Title, Localization.Info_NoTemplateReturn);
                }
                else if (responseModel.angles.length > 1) {
                    popup.Alert(Localization.Warning_Title, Localization.Info_MoreThanOneTemplateReturn);
                }
            })
            .always(function () {
                self.SetDisableCreateFromSchemaUI(false);
            });
    };
    self.SetSchemaTemplates = function () {
        // check from cache
        if (!angleCache[self.CreateAngleSettings.model]) {
            angleCache[self.CreateAngleSettings.model] = {};
        }

        var filters = self.GetTemplateFilters();
        var result = {};
        var resultKey = 'angles';
        result[resultKey] = [];
        var ids = [];
        jQuery.each(filters, function (index, id) {
            var data = angleCache[self.CreateAngleSettings.model][id.toLowerCase()];
            if (data) {
                if (data.uri) {
                    result[resultKey].push(data);
                }
            }
            else {
                if (jQuery.inArray(id, ids) === -1) {
                    ids.push(id);
                }
            }
        });

        if (ids.length) {
            var requestUrl = self.CreateAngleSettings.model + '/angles';
            var requestParams = {};
            requestParams['ids'] = ids.join(',');
            requestParams[enumHandlers.PARAMETERS.OFFSET] = 0;
            requestParams[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();
            requestParams[enumHandlers.PARAMETERS.CACHING] = false;
            requestParams[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.SCHEMA;
            return GetDataFromWebService(requestUrl, requestParams)
                .done(function (response) {

                    // add to cache
                    jQuery.each(response.angles, function (index, angle) {
                        angleCache[self.CreateAngleSettings.model][angle.id.toLowerCase()] = angle;
                    });

                    // handle not existing id
                    jQuery.each(ids, function (index, id) {
                        var data = angleCache[self.CreateAngleSettings.model][id.toLowerCase()];
                        if (!data) {
                            angleCache[self.CreateAngleSettings.model][id.toLowerCase()] = {
                                id: id
                            };
                        }
                    });

                    // merge result
                    jQuery.merge(result[resultKey], response[resultKey]);

                    self.SetGrayout(result[resultKey]);
                });
        }
        else {
            self.SetGrayout(result[resultKey]);
            return jQuery.when(true);
        }
    };
    self.CanUseTemplate = function (angle) {
        return angle && angle.displays_summary.length && !angle.template_has_invalid_classes;
    };
    self.SetGrayout = function (angles) {
        var angleIdPosition = 'TemplateId_'.length;
        jQuery('#Schema a').parent().addClass('disabled');
        jQuery('#Schema a').each(function (index, value) {
            if (angles && angles.length) {
                var angle = angles.findObject('id', value.id.substr(angleIdPosition), false);

                if (self.CanUseTemplate(angle))
                    jQuery(this).data('angle', angle).parent().removeClass('disabled');
            }
        });
    };
    self.GetHelptextFilters = function () {
        var currentSelectedBusinessProcess = businessProcessesModel.CreateNewAngleSchemaBusinessProcess.GetActive().toString();
        var helptexts = [];
        var area = self.GetSchemaData(currentSelectedBusinessProcess, currentSchemaMode);
        if (area && area.Details) {
            var maps = area.Details;
            for (var index = 0; index < maps.length; index++) {
                if (maps[index].IsValidHelptextId) {
                    helptexts.push(maps[index].ClassId);
                }
            }
        }
        return helptexts;
    };
    self.GetTemplateFilters = function () {
        var currentSelectedBusinessProcess = businessProcessesModel.CreateNewAngleSchemaBusinessProcess.GetActive().toString();
        var templates = [];
        var area = self.GetSchemaData(currentSelectedBusinessProcess, currentSchemaMode);
        if (area && area.Details) {
            var maps = area.Details;
            for (var index = 0; index < maps.length; index++) {
                if (maps[index].IsValidTemplateId) {
                    templates.push(maps[index].TemplateId);
                }
            }
        }
        return templates;
    };
    self.SetDisableCreateFromSchemaUI = function (disable) {
        if (disable) {
            jQuery('.popupCreateNewAngleBySchema .btnSubmit').addClass('disabled');
        }
        else {
            jQuery('.popupCreateNewAngleBySchema .btnSubmit').removeClass('disabled');
        }
    };

    // popup create by object
    self.ClassesChooserHandler = null;
    self.ShowCreateAngleByObject = function () {
        if (jQuery('#ButtonCreateAngleFromObjects').hasClass('disabled'))
            return;

        self.CloseCreateOption();

        var popupName = 'CreateNewAngle',
            popupSettings = {
                title: kendo.format(Captions.Popup_CreateNewAngle_TitleByType, self.CurrentModelData.short_name || self.CurrentModelData.id, Localization.ObjectList),
                element: '#popup' + popupName,
                html: '',
                className: 'popup' + popupName,
                minWidth: 750,
                minHeight: 300,
                buttons: [
                    {
                        text: Localization.CreateNewAngleFromSelectedObjects,
                        click: function () {
                            self.CreateNewAngleFromObjects(self.ClassesChooserHandler.GetAllSelectedClasses());
                        },
                        className: 'btnSubmit executing disabled',
                        position: 'right'
                    },
                    {
                        text: '<i class="iconBack">&lsaquo;</i>' + Localization.BackToCreateOptions,
                        click: function (e) {
                            self.ShowCreateOption();
                            setTimeout(function () {
                                e.kendoWindow.close();
                            }, 1);
                        },
                        position: 'left'
                    }
                ],
                resize: function (e) {
                    var businessProcessBar = e.sender.element.find('.businessProcesses');
                    if (businessProcessBar.length) {
                        if (businessProcessesModel.CreateNewAngleBusinessProcess) {
                            businessProcessesModel.CreateNewAngleBusinessProcess.UpdateLayout(businessProcessBar);
                        }

                        var winWidth = e.sender.element.width();
                        var winHeight = e.sender.element.height();
                        var height = winHeight - e.sender.element.find('.searchObjectGridContainer').position().top - 5;
                        var gridHeight = height - jQuery('#ObjectsGridContainer').position().top - 15;

                        if (winWidth > 900) {
                            e.sender.element.removeClass('compactMode');
                            jQuery('#ObjectsGrid').height(gridHeight);
                            e.sender.element.find('.Description').height(height - 40);
                        }
                        else {
                            e.sender.element.addClass('compactMode');
                            jQuery('#ObjectsGrid').height(gridHeight - 20);
                            e.sender.element.find('.Description').height('auto');
                        }
                    }
                },
                open: function (e) {
                    if (!e.sender.isPopupInitialized) {
                        businessProcessesModel.CreateNewAngleBusinessProcess = new BusinessProcessesViewModel();
                        businessProcessesModel.CreateNewAngleBusinessProcess.CanEmpty(false);
                        businessProcessesModel.CreateNewAngleBusinessProcess.Theme('flat');
                        businessProcessesModel.CreateNewAngleBusinessProcess.MultipleActive(true);
                        businessProcessesModel.CreateNewAngleBusinessProcess.ClickCallback(function (data, e, changed) {
                            if (data.is_allowed && changed) {
                                var bpIndex = jQuery.inArray(data.id, self.CreateAngleSettings.createby_object.bp_stack);
                                if (bpIndex === -1) {
                                    self.CreateAngleSettings.createby_object.bp_stack.push(data.id);
                                }
                                else {
                                    self.CreateAngleSettings.createby_object.bp_stack.splice(bpIndex, 1);
                                }
                                self.SaveSettings();

                                self.FilterCreateAngle();
                            }
                        });
                        businessProcessesModel.CreateNewAngleBusinessProcess.ClickHeaderCallback(function (oldList, newList) {
                            if (oldList.length === newList.length) {
                                var list = {};
                                jQuery.each(newList, function (index, bp) {
                                    list[bp] = false;
                                });
                                businessProcessesModel.CreateNewAngleBusinessProcess.CurrentActive(list);
                            }
                            self.FilterCreateAngle();
                        });
                    }

                    if (!self.ClassesChooserHandler) {
                        self.ClassesChooserHandler = new ClassesChooser('CreateAngleObject', e.sender.element, self.CreateAngleSettings);
                        self.ClassesChooserHandler.HasSkipTemplateOption = true;
                        self.ClassesChooserHandler.ClassesChooserSettingsName = self.CreateAngleSettingsName;
                        self.ClassesChooserHandler.DefaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
                        self.ClassesChooserHandler.MaxPageSize = systemSettingHandler.GetMaxPageSize();
                        self.ClassesChooserHandler.BusinessProcessHandler = businessProcessesModel.CreateNewAngleBusinessProcess;
                        self.ClassesChooserHandler.ShowHelpBehavior = self.ClassesChooserHandler.HELPBEHAVIOR.TOGGLE;

                        self.ClassesChooserHandler.AbortAll = function () {
                            WC.Ajax.AbortAll();
                        };
                        self.ClassesChooserHandler.AbortAllRequest = function () {
                            WC.Ajax.AbortAll();
                        };
                        self.ClassesChooserHandler.OnException = function (type, title, message) {
                            if (type === 'alert') {
                                popup.Alert(title, message);
                            }
                            else {
                                popup.Error(title, message);
                            }
                        };
                        self.ClassesChooserHandler.ShowHelpText = self.ShowHelpText;
                        self.ClassesChooserHandler.SetDisableUI = self.SetDisableCreateFromObjectUI;
                        self.ClassesChooserHandler.LoadAngleRelateBusinessProcesses = GetDataFromWebService;
                        self.ClassesChooserHandler.LoadAllClasses = modelClassesHandler.LoadAllInstanceClasses;
                        self.ClassesChooserHandler.OnSubmitClasses = self.CreateNewAngleFromObjects;
                        self.ClassesChooserHandler.SetSelectedClassesCallback = self.SetSelectedClassesCallback;
                    }

                    self.ShowCreateAngleByObjectCallback(e);

                    e.sender.trigger('resize');
                },
                close: popup.Destroy
            };

        popup.Show(popupSettings);
    };
    self.ShowCreateAngleByObjectCallback = function (e) {
        self.ClassesChooserHandler.CurrentModelData = self.CurrentModelData;
        self.ClassesChooserHandler.Element = e.sender.element;
        self.ClassesChooserHandler.ApplyHandler();
        self.SetCreateAngleByObjectSelectionMode(self.CurrentModelData.id);
        jQuery('.skipTemplate').show();

        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.CreateAngleSettings.model);
        modelPrivileges[0].label_authorizations['Other'] = "validate";
        var currentBP = {};

        jQuery.each(self.CreateAngleSettings.createby_object.bp, function (index, bp) {
            if (modelPrivileges.length > 0) {
                jQuery.each(modelPrivileges[0].label_authorizations, function (index2, bp2) {
                    if (index2 === bp && bp2 !== "deny") {
                        currentBP[bp] = true;
                    }
                });
            }
            else {
                currentBP[bp] = true;
            }
        });

        if (modelPrivileges.length > 0) {
            jQuery.each(modelPrivileges[0].label_authorizations, function (index2, bp2) {
                if (bp2 === "deny") {
                    var lengthOfStack = self.CreateAngleSettings.createby_object.bp_stack.length;
                    for (var index = 0; index < lengthOfStack; index++) {
                        var bp = self.CreateAngleSettings.createby_object.bp_stack[index];
                        if (index2 === bp) {
                            self.CreateAngleSettings.createby_object.bp_stack.splice(index, 1);
                        }
                    }
                }
            });
        }

        if (Object.keys(currentBP).length === 0)
            currentBP["Other"] = true;

        self.SetDisableCreateFromObjectUI(true);

        jQuery('#txtFitlerObjects').val(self.CreateAngleSettings.createby_object.q);
        businessProcessesModel.CreateNewAngleBusinessProcess.CurrentActive(currentBP);

        modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.CreateAngleSettings.model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.CreateNewAngleBusinessProcess, modelPrivileges);

        var helpIds = [];
        jQuery.each(businessProcessesModel.CreateNewAngleBusinessProcess.Data(), function (index, bp) {
            helpIds.push('EA_BP_' + bp.id);
        });
        self.LoadHelptextsByIds(helpIds)
            .done(function () {
                setTimeout(function () {
                    self.FilterCreateAngle();
                    e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                }, 100);
            });
    };
    self.SetCreateAngleByObjectSelectionMode = function (modelId) {
        // M4-43508: Prevent selection of multiple classes for RMS-based model
        var isRealTimeModel = aboutSystemHandler.IsRealTimeModel(modelId);
        self.ClassesChooserHandler.MultipleSelection = !isRealTimeModel;
    };

    self.CloseCreateAngleByObject = function () {
        popup.Close('#popupCreateNewAngle');
    };
    self.FilterCreateAngle = function () {
        self.ClassesChooserHandler.FilterClasses();
    };
    self.CreateNewAngleFromObjects = function (classes) {
        if (jQuery('.popupCreateNewAngle .btnSubmit').hasClass('disabled'))
            return;

        var classesCount = classes.length;
        if (!classesCount) {
            popup.Alert(Localization.Warning_Title, Localization.ErrorNoObjectSelected);
            return;
        }
        if (classesCount >= 2 && !jQuery.localStorage('remember_create_angle_object')) {
            popup.Confirm(
                Localization.AlertWarningCreatePopup,
                function () {
                    self.CreateNewAngleFromObjectsAfterValidate(classes);
                },
                jQuery.noop,
                {
                    title: Localization.Warning_Title,
                    session_name: 'remember_create_angle_object',
                    icon: 'alert'
                }
            );
        }
        else {
            self.CreateNewAngleFromObjectsAfterValidate(classes);
        }
    };
    self.CreateNewAngleFromObjectsAfterValidate = function (classes) {
        WC.Ajax.AbortAll();

        // disable all ui
        self.SetDisableCreateFromObjectUI(true);

        if (classes.length === 1) {
            var requestUrl = self.CreateAngleSettings.model + '/angles';
            var query = {};
            query[enumHandlers.PARAMETERS.VIEWMODE] = 'schema';
            query[enumHandlers.PARAMETERS.CACHING] = false;
            query['ids'] = 'EA_CLASS_TPL_' + classes[0];
            var skipTemplate = $('#SkipTemplate').is(':checked');

            GetDataFromWebService(requestUrl, query)
                .fail(function () {
                    self.SetDisableCreateFromObjectUI(false);
                })
                .done(function (responseModel) {

                    if (!skipTemplate && responseModel && responseModel.angles.length) {
                        // first match with class id
                        var angle = responseModel.angles[0];

                        // angle default
                        var defaultdisplay = angle.displays_summary.findObject('is_angle_default', true);
                        if (!defaultdisplay) {
                            defaultdisplay = angle.displays_summary[0];
                        }

                        // prepare query string to angle page
                        var params = {};
                        params[enumHandlers.ANGLEPARAMETER.STARTTIMES] = jQuery.now();
                        if (angle.is_template) {
                            params[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.ANGLEPOPUP;
                            params[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
                        }

                        if (defaultdisplay) {
                            self.SetDisableCreateFromObjectUI(false);

                            progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);
                            setTimeout(function () {
                                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);
                            }, 100);

                            window.location = WC.Utility.GetAnglePageUri(angle.uri, defaultdisplay.uri, params);
                        }
                        else {
                            self.CreateAdhocAngleFromObjects(classes);
                        }
                    }
                    else {
                        //Create From Object
                        self.CreateAdhocAngleFromObjects(classes);
                    }
                });
        }
        else {
            //Create From Object
            self.CreateAdhocAngleFromObjects(classes);
        }
    };
    self.CreateAdhocAngleFromObjects = function (classes) {
        var grid = jQuery('#ObjectsGrid').data(enumHandlers.KENDOUITYPE.GRID);
        var modelUri = self.CreateAngleSettings.model;
        var newAngleNames = [], newAngleName;
        var skipTemplate = $('#SkipTemplate').is(':checked');

        jQuery.each(classes, function (index, classId) {
            var row = self.ClassesChooserHandler.GetTableRowByClassId(classId);
            var item = grid.dataSource.getByUid(row.data('uid'));
            newAngleNames.push(userFriendlyNameHandler.GetFriendlyName(item, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME_AND_LONGNAME));
        });
        newAngleName = newAngleNames.join(', ');

        var currentLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();

        var jsonObjects = {
            assigned_labels: [],
            name: newAngleName,
            model: modelUri,
            display_definitions: [],
            query_definition: [{
                queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES,
                base_classes: classes
            }],
            multi_lang_name: [{
                lang: currentLanguage,
                text: newAngleName
            }],
            multi_lang_description: [{
                lang: currentLanguage,
                text: ''
            }],
            user_specific: {
                is_starred: false,
                user_default_display: '',
                private_tags: [],
                times_executed: 0
            },
            allow_more_details: true,
            allow_followups: true,
            is_validated: false,
            is_published: false,
            is_template: false,
            angle_default_display: '',
            business_processes: '',
            grouping_labels: '',
            is_deleted: false,
            is_parameterized: false,
            labels: '',
            privilege_labels: '',
            privileges: ''
        };

        // wakeup angle model
        angleInfoModel.TemporaryAngle(null);
        angleInfoModel.SetTemporaryAngle(jsonObjects);
        angleInfoModel.SetData(angleInfoModel.TemporaryAngle().data);

        // new
        var resultData = {
            model: modelUri,
            potential_classes: classes,
            query_fields: modelsHandler.GetResultQueryFieldsUri(classes, modelUri)
        };
        progressbarModel.ShowStartProgressBar();
        return self.GetListFields(skipTemplate, resultData)
            .then(function (fields) {
                var display = displayModel.GenerateDefaultData(enumHandlers.DISPLAYTYPE.LIST);
                display.fields = fields;
                display.is_angle_default = true;
                display.is_user_default = false;
                return displayModel.CreateTempDisplay(enumHandlers.DISPLAYTYPE.LIST, display);
            })
            .done(function (data) {
                displayModel.LoadSuccess(data);

                var angleData = ko.toJS(angleInfoModel.TemporaryAngle().data);
                angleData.angle_default_display = data.id;
                angleData.display_definitions = [data];
                angleInfoModel.SetTemporaryAngle(angleData);

                self.SetDisableCreateFromObjectUI(false);

                progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);
                setTimeout(function () {
                    progressbarModel.ShowStartProgressBar(Localization.ProgressBar_Redirecting, false);
                }, 100);

                var customParams = {};
                customParams[enumHandlers.ANGLEPARAMETER.CREATENEW] = true;
                customParams[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.ANGLEPOPUP;
                window.location = WC.Utility.GetAnglePageUri(angleInfoModel.Data().uri, displayModel.Data().uri, customParams);
            })
            .always(function () {
                self.SetDisableCreateFromObjectUI(false);
            });
    };
    self.GetListFields = function (skipTemplate, resultData) {
        if (skipTemplate)
            return displayModel.GenerateDefaultField(false, resultData.query_fields, false);
        else
            return displayModel.GetDefaultListFields(resultData, false, true);
    };
    self.SetSelectedClassesCallback = function (classes) {
        if (classes.length) {
            jQuery('.popupCreateNewAngle .btnSubmit').removeClass('btn-ghost').addClass('btn-primary');
        }
        else {
            jQuery('.popupCreateNewAngle .btnSubmit').removeClass('btn-primary').addClass('btn-ghost');
        }
    };
    self.ShowHelpText = function (classId) {
        if (classId) {
            helpTextHandler.ShowHelpTextInArea(classId, '#popupCreateNewAngle .Description', helpTextHandler.HELPTYPE.CLASS, self.CreateAngleSettings.model);
        }
        else if (self.CreateAngleSettings.createby_object.bp_stack.length) {
            var helpId = 'EA_BP_' + self.CreateAngleSettings.createby_object.bp_stack[self.CreateAngleSettings.createby_object.bp_stack.length - 1];
            helpTextHandler.ShowHelpTextInArea(helpId, '#popupCreateNewAngle .Description', helpTextHandler.HELPTYPE.HELPTEXT, self.CreateAngleSettings.model);
        }
        else {
            jQuery('#popupCreateNewAngle .Description').empty();
        }
    };
    self.SetDisableCreateFromObjectUI = function (disable) {
        if (disable) {
            jQuery('.popupCreateNewAngle .btnSubmit').addClass('disabled');
        }
        else {
            jQuery('.popupCreateNewAngle .btnSubmit').removeClass('disabled');
        }
    };

    // share
    self.SaveSettings = function () {
        jQuery.localStorage(self.CreateAngleSettingsName, self.CreateAngleSettings);
    };
    self.ToggleModelsList = function () {
        if (!jQuery('#SelectModelCreateNewAngle').hasClass('disabled')) {
            var popupSelectModels = jQuery('#PopupSelectModelCreateNewAngle');
            if (popupSelectModels.is(':visible')) {
                popupSelectModels.hide();
            }
            else {
                popupSelectModels.show();
            }
        }
    };
    self.UpdateCreateNewAngleButton = function () {
        //find last saved model
        var lastModel = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_CREATEANGLE_MODEL);
        if (lastModel) {
            self.CreateAngleSettings.model = lastModel;
        }

        // clear all
        jQuery('#SelectModelCreateNewAngle').addClass('alwaysHide');
        jQuery('#CreateNewAngle').addClass('disabled');
        jQuery('#CreateNewAngle .no-model').text(Captions.Button_CreateNewAngle_NoModel);
        var modelsListElement = jQuery('#PopupSelectModelCreateNewAngle').empty();

        var facets = WC.Utility.ToArray(ko.toJS(facetFiltersViewModel.Data()));
        var facetModel = facets.findObject('id', 'facetcat_models');
        if (facetModel) {
            var models = WC.Utility.ToArray(facetModel.filters);
            if (models.length) {
                var modelsHtml = [];
                var findSelected = false;
                jQuery.each(models, function (index, model) {
                    var modelName = model.name || model.id;
                    var isSelected = false;

                    var modelObject = modelsHandler.GetModelById(model.id);

                    // no model but canCreateAngle = true, check it on click the button
                    var canCreateAngle = modelObject ? userModel.GetCreateAngleAuthorizationByModelUri(modelObject.uri) : true;

                    if (canCreateAngle) {
                        // set default select model
                        var isTheSameModel = modelObject && modelObject.uri === self.CreateAngleSettings.model;
                        if (!findSelected && (!self.CreateAngleSettings.model || isTheSameModel)) {
                            jQuery('#CreateNewAngle .no-model').text(modelName);
                            findSelected = true;
                            isSelected = true;
                        }
                        var radio = kendo.format('<label class="textEllipsis"><input type="radio" name="SelectModel"{1}/><span class="label">{0}</span></label>', modelName, isSelected ? ' checked' : '');
                        modelsHtml[index] = kendo.format('<li class="listview-item{3}"  data-showWhenNeed="true"  data-role="tooltip" data-tooltip-text="{1}" data-tooltip-position="bottom" data-id="{0}" onclick="createNewAngleViewManagementModel.CheckModelAvailable(this)">{2}</li>', model.id, modelName, radio, isSelected ? ' active' : '');
                    }
                });
                modelsListElement.html(modelsHtml.join(''));
                jQuery('#CreateNewAngle, #SelectModelCreateNewAngle').removeClass('disabled');
                if (models.length > 1) {
                    jQuery('#SelectModelCreateNewAngle').removeClass('alwaysHide');
                }
            }
        }
    };
    self.CheckModelAvailable = function (context) {
        // no model in facet then exit
        var facets = WC.Utility.ToArray(ko.toJS(facetFiltersViewModel.Data()));
        var facetModel = facets.findObject('id', 'facetcat_models');
        if (!facetModel || !facetModel.filters.length) {
            return;
        }

        jQuery(context).find('input[name="SelectModel"]').prop('checked', true);
        var modelId = jQuery(context).data('id');

        // if click the button
        if (typeof modelId === 'undefined') {
            var modelMenuElement = [];

            // use the selected model
            if (self.CreateAngleSettings.model) {
                modelMenuElement = jQuery('#PopupSelectModelCreateNewAngle .active');
            }

            // use the first model
            if (!modelMenuElement.length) {
                self.CreateAngleSettings.model = null;
                modelMenuElement = jQuery('#PopupSelectModelCreateNewAngle .listview-item:first');
            }

            // click element or throw error
            if (modelMenuElement.length) {
                modelMenuElement.trigger('click');
            }
            else {
                popup.Alert(Localization.Warning_Title, Localization.Info_NoAvailableModel);
            }
            return;
        }

        // hide model list popup
        jQuery(document).trigger('click');

        // load models or continue
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CheckingModel, false);
        var modelObject = modelsHandler.GetModelById(modelId);
        jQuery.when(modelObject ? true : modelsHandler.LoadModels(true))
            .then(function () {
                // load fully model info.
                var modelObject = modelsHandler.GetModelById(modelId);
                return modelsHandler.LoadModelInfo(modelObject.uri);
            })
            .done(function (response) {
                // save selecting model in user client_settings
                self.SaveSelectingModel(response.uri);

                self.CurrentModelData = modelsHandler.GetModelByUri(response.uri);
                jQuery('#CreateNewAngle .no-model').text(self.CurrentModelData.short_name || self.CurrentModelData.id);
                jQuery('#PopupSelectModelCreateNewAngle .listview-item').removeClass('active')
                    .filter('[data-id="' + self.CurrentModelData.id + '"]').addClass('active');
                if (self.CheckCurrentModelAvailable()) {
                    self.DataAngleSchema = null;
                    self.CreateAngleSettings.model = response.uri;

                    self.ShowCreateOption();
                }
            })
            .always(function () {
                progressbarModel.EndProgressBar();
            });
    };

    /* BOF: M4-13839: Fixed unknown error returned when open 'Create new angle' pop-up */
    self.CheckCurrentModelAvailable = function () {
        if (!self.CurrentModelData) {
            popup.Alert(Localization.Warning_Title, Localization.Info_NoAvailableModel);
            return false;
        }
        else {
            var canCreateAngle = userModel.GetCreateAngleAuthorizationByModelUri(self.CurrentModelData.uri);
            if (!canCreateAngle || self.CurrentModelData.available !== true) {
                popup.Alert(Localization.Warning_Title, kendo.format(Localization.MessageModelIsNotAvailable, self.CurrentModelData.short_name, self.CurrentModelData.model_status));
                return false;
            }
        }
        return true;
    };
    /* EOF: M4-13839: Fixed unknown error returned when open 'Create new angle' pop-up */

    self.LoadHelptextsByIds = function (ids) {
        var response = { help_texts: [] };
        if (ids.length) {
            var modelUri = self.CreateAngleSettings.model;
            return helpTextHandler.LoadHelpTextByIds(ids, modelUri)
                .then(function () {
                    var helps = [];
                    jQuery.each(ids, function (index, id) {
                        var help = helpTextHandler.GetHelpTextById(id, modelUri);
                        if (!help) {
                            help = {
                                html_help: '',
                                id: id,
                                long_name: '',
                                short_name: '',
                                uri: modelUri + '/not_found/' + id
                            };
                            helps.push(help);
                        }
                        response.help_texts.push(help);
                    });
                    helpTextHandler.SetHelpTexts(helps, false);

                    return jQuery.when(response);
                });
        }
        else {
            return jQuery.when(response);
        }
    };

    var saveUserSettingXhr = null;
    self.SaveSelectingModel = function (modelUri) {
        // save selecting model in user client_settings
        var prevLastModel = userSettingModel.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_CREATEANGLE_MODEL);
        if (prevLastModel !== modelUri) {
            if (saveUserSettingXhr && saveUserSettingXhr.abort) saveUserSettingXhr.abort();
            var clientSettings = JSON.parse(userSettingModel.GetByName(enumHandlers.USERSETTINGS.CLIENT_SETTINGS));
            clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_CREATEANGLE_MODEL] = modelUri;

            var data = {};
            data[enumHandlers.USERSETTINGS.CLIENT_SETTINGS] = JSON.stringify(clientSettings);
            saveUserSettingXhr = userSettingModel.Save(data, false);
        }
    };
    /*EOF: Model Methods*/
}
