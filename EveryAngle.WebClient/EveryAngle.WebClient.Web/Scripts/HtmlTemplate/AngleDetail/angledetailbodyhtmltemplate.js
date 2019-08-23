var angleDetailBodyHtmlTemplate = function () {
    return [
        '<ul class="popupTabMenu" id="AngleTabs">',
            '<li id="AngleGeneral" onclick="angleDetailPageHandler.TabClick(this.id);"><a>' + Localization.General + '</a></li>',
            '<li id="AngleDescription" onclick="angleDetailPageHandler.TabClick(this.id);"><a>' + Localization.Description + '</a></li>',
            '<li id="AngleDefinition" onclick="angleDetailPageHandler.TabClick(this.id);"><a>' + Localization.Definition + '</a></li>',
            '<li id="AngleStatistic" onclick="angleDetailPageHandler.TabClick(this.id);" data-bind="visible: !angleInfoModel.IsTemporaryAngle()"><a>' + Localization.Statistics + '</a></li>',
        '</ul>',

        '<div class="popupTabPanel" id="AngleArea">',
            '<div id="AngleGeneralArea">',
                '<h2>' + Localization.General + '</h2>',
                '<div class="row">',
                    '<div class="field">' + Localization.Model + '</div>',
                    '<div class="input inputModelValue" data-bind="text: angleInfoModel.ModelName().ShortName"></div>',
                '</div>',
                '<div class="row">',
                    '<div class="field">' + Localization.BusinessProcesses + '</div>',
                    '<div class="input" id="AngleBusinessProcesses"></div>',
                '</div>',

                '<!-- ko if: anglePageHandler.CanEditId() -->',
                '<div class="row">',
                    '<div class="field">' + Localization.AngleId + '</div>',
                    '<div class="input">',
                        '<input id="AngleId" type="text" required data-required-msg="Required" class="eaText eaTextSize40" data-bind="value: angleInfoModel.AngleId, enable: angleInfoModel.CanUpdateAngle(\'id\')" maxlength="100" />',
                    '</div>',
                '</div>',
                '<!-- /ko -->',

                '<div class="row" data-bind="visible: userModel.CanCreateTemplateAngle()">',
                    '<div class="field"></div>',
                    '<div class="input">',
                        '<input id="AngleIsTemplate" type="checkbox" data-bind="checked: angleInfoModel.IsTempTemplate, visible: false"/>',
                        '<a class="btn btn-ghost btnTemplate" data-bind="css: { disabled: !(angleInfoModel.Data().is_template ? angleInfoModel.Data().authorizations.unmark_template : angleInfoModel.Data().authorizations.mark_template) }, click: angleDetailPageHandler.SetTemplate">',
                            '<span class="lblPublishChoice" data-bind="text: angleInfoModel.IsTempTemplate() ? Localization.AngleDetailPublishTabAngle : Localization.AngleDetailPublishTabTemplate">' + Localization.AngleDetailPublishTabTemplate + '</span>',
                            '<i class="icon" data-bind="css: { template: angleInfoModel.IsTempTemplate(), angle: !angleInfoModel.IsTempTemplate() }"></i>',
                        '</a>',
                    '</div>',
                '</div>',
            '</div>',
            '<div id="AngleDescriptionArea"></div> ',
            '<div class="definitionArea angleDefinitionArea" id="AngleDefinitionArea">',
                '<h2 class="deftext">' + Localization.Definition + '</h2>',
                '<div class="DefInfo classesInfo">',
                    '<!-- ko stopBinding: true -->',
                    '<div id="AngleQueryStepClassesList" class="widgetDetailsWrapper objectName"></div>',
                    '<!-- /ko -->',
                '</div>',
                '<!-- ko stopBinding: true -->',
                '<div id="AngleModelRoleList" class="DefInfo classesInfo modelRoles">',
                '</div>',
                '<!-- /ko -->',
                '<div class="StatSeparate"></div>',
                '<div class="DefInfo classesInfo">',
                    '<label class="deftext" data-bind="text: Localization.AppliedFilterLinesAndFollowUps">' + Localization.AppliedFilterLinesAndFollowUps + '</label>',
                '</div>',
                '<div class="DefInfo defInfoWrapper">',
                    '<div id="FilterWrapper"></div>',
                '</div>',
                '<div class="filterButtonWrapper" id="FilterButtonWrapper">',
                    '<a id="AddFilter" class="btn btn-ghost btnAddFilter" data-bind="css: { disabled: !angleDetailPageHandler.CanAddFilter() }, click: angleDetailPageHandler.ShowAddFilterPopup">',
                        '<span data-bind="text: Localization.AddFilter">' + Localization.AddFilter + '</span>',
                    '</a>',
                    '<a id="AddFollowUp" class="btn btn-ghost btnAddFollowUp" data-bind="css: { disabled: !angleDetailPageHandler.CanAddFollowup() }, click: function (data, event) { angleDetailPageHandler.ShowFollowupPopup({ PopupFrom: enumHandlers.ANGLEPOPUPTYPE.ANGLE }, data, event); }">',
                        '<span data-bind="text: Localization.AddFollowUp">' + Localization.AddFollowUp + '</span>',
                    '</a>',
                '</div>',
            '</div>',
            '<div id="AngleStatisticArea" class="statisticArea">',
                '<h2>' + Localization.Statistics + '</h2>',
                '<div class="row">',
                    '<div class="field">' + Localization.CreatedBy + '</div>',
                    '<div class="input">',
                        '<span data-bind="text: angleInfoModel.CreatedBy().full_name">-</span>',
                        '<span data-bind="text: angleInfoModel.CreatedBy().datetime">-</span>',
                    '</div>',
                '</div>',
                '<div class="StatSeparate"></div>',
                '<div class="row">',
                    '<div class="field">' + Localization.LastChangedBy + '</div>',
                    '<div class="input">',
                        '<span data-bind="text: angleInfoModel.ChangedBy().full_name">-</span>',
                        '<span data-bind="text: angleInfoModel.ChangedBy().datetime">-</span>',
                    '</div>',
                '</div>',
                '<div class="row">',
                    '<div class="field">' + Localization.LastExecutedBy + '</div>',
                    '<div class="input">',
                        '<span data-bind="text: angleInfoModel.ExecutedBy().full_name">-</span>',
                        '<span data-bind="text: angleInfoModel.ExecutedBy().datetime">-</span>',
                    '</div>',
                '</div>',
                '<div class="StatSeparate"></div>',
                '<div class="row">',
                    '<div class="field">' + Localization.NumberOfExecutes + '</div>',
                    '<div class="input" data-bind="text: angleInfoModel.TimeExcuted"></div>',
                '</div>',
                '<div class="StatSeparate"></div>',
                '<div class="row">',
                    '<div class="field">' + Localization.ValidationLastChangedBy + '</div>',
                    '<div class="input">',
                        '<span data-bind="text: angleInfoModel.ValidatedBy().full_name">-</span>',
                        '<span data-bind="text: angleInfoModel.ValidatedBy().datetime">-</span>',
                    '</div>',
                '</div>',
                '<div class="row">',
                    '<div class="field">' + Localization.MarkedForDeletion + '</div>',
                    '<div class="input">',
                        '<span data-bind="text: angleInfoModel.DeletedBy.full_name">-</span>',
                        '<span data-bind="text: angleInfoModel.DeletedBy.datetime">-</span>',
                    '</div>',
                '</div>',
                '<div class="StatSeparate"></div>',
            '</div>',
        '</div>'
    ].join('');
};
