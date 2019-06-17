var displayDetailHtmlTemplate = function () {
    return [
        '<ul class="popupTabMenu" id="DisplayTabs">',
            '<li id="DisplayGeneral" class="Selected" onclick="displayDetailPageHandler.TabClick(this.id);"><a>' + Localization.General + '</a></li>',
            '<li id="DisplayFilter" onclick="displayDetailPageHandler.TabClick(this.id);"><a>' + Localization.Filters + '</a></li>',
            '<li id="DisplayStatistic" onclick="displayDetailPageHandler.TabClick(this.id);" data-bind="visible: !displayModel.IsTemporaryDisplay()"><a>' + Localization.Statistics + '</a></li>',
        '</ul>',
        '<div class="popupTabPanel" id="DisplayArea">',
            '<div id="DisplayGeneralArea">',
                '<h2>' + Localization.General + '</h2>',
                '<div class="row newDisplay" data-bind="visible: IsNewDisplay()">',
                    '<div class="field">' + Localization.DisplayType + '</div>',
                    '<div class="input"><select class="eaDropdown eaDropdownSize40 displayNameDropdownList tempDisplayType" id="tempDisplayType"></select></div>',
                '</div>',
                '<div class="row" data-bind="visible: !IsNewDisplay()">',
                    '<div class="field">' + Localization.DisplayType + '</div>',
                    '<div class="input" data-bind="text: Data().display_type ? Localization[\'DisplayType_\' + Data().display_type.toLowerCase()] : \'\'"></div>',
                '</div>',
                '<div class="row">',
                    '<div class="field">&nbsp;</div>',
                    '<div class="input" id="PrivateDisplay">',
                        '<label>',
                            '<input id="PrivateDisplayCheckbox" type="checkbox" onclick="displayDetailPageHandler.CheckDefaultAngleDisplay(this)" data-bind="visible: angleInfoModel.IsPublished(), checked: !Data().is_public, enable: angleInfoModel.IsPublished() && (Data().authorizations.publish || Data().authorizations.unpublish)" />',
                            '<span class="label" data-bind="css: { label: angleInfoModel.IsPublished() }"><i class="icon private"></i>' + Localization.ThisIsAPrivateDisplayNotAvailableForOtherUsers + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
                '<div class="row">',
                    '<div class="field">' + Localization.DefaultDisplay + '</div>',
                    '<div class="input">',
                        '<label>',
                            '<input id="IsDefaultDisplay" type="checkbox" data-bind="checked: IsDefault, enable: Data().authorizations.update && Data().authorizations.make_angle_default" />',
                            '<span class="label">' + Localization.DefaultDisplay + '</span>',
                        '</label>',
                        '<label>',
                            '<input id="PersonalDefaultDisplay" type="checkbox" data-bind="checked: PersonalDefaultDisplay, enable: displayModel.Data().authorizations.update_user_specific " />',
                            '<span class="label">' + Localization.PersonalDefaultDisplay + '</span>',
                        '</label>',
                        '<label id="ExecuteLogin">',
                            '<input id="ExecuteDisplayAtLogin" type="checkbox" data-bind="checked: ExcuteOnLogin, enable: displayModel.Data().authorizations.update_user_specific" />',
                            '<span class="label">' + Localization.ExecuteAtLogin + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
                '<div class="StatSeparate"></div>',
                '<div id="DisplayDescriptionSection">',
                '</div>',
                '<div class="StatSeparate"></div>',
                '<div class="row rowDefaultDrilldownDisplay" data-bind="css: { \'alwaysHide\': IsNewDisplay() || Data().display_type === enumHandlers.DISPLAYTYPE.LIST }">',
                    '<div class="field">' + Localization.DisplayDrilldownDefault + '</div>',
                    '<div class="input">',
                        '<select class="eaDropdown eaDropdownSize40 displayNameDropdownList defaultDrilldownDisplay" id="defaultDrilldownDisplay"></select>',
                    '</div>',
                '</div>',

                '<!-- ko if: anglePageHandler.CanEditId() && !displayModel.IsTemporaryDisplay() -->',
                '<div class="row rowDisplayId">',
                    '<div class="field">' + Localization.DisplayId + '</div>',
                    '<div class="input">',
                        '<input id="DisplayId" required data-required-msg="Required" class="eaText eaTextSize40" data-bind="value: DisplayId, enable: Data().authorizations.update" maxlength="50" />',
                    '</div>',
                '</div>',
                '<!-- /ko -->',

            '</div>',
            '<div class="definitionArea displayDefinitionArea" id="DisplayFilterArea">',
                '<h2>' + Localization.Filters + '</h2>',
                '<div class="DefInfo">',
                    '<label>' + Localization.AppliedFilterLinesAndFollowUps + '</label>',
                '</div>',
                '<div class="DefInfo">',
                    '<div id="FilterWrapper" class="defInfoWrapper"></div>',
                '</div>',
                '<div class="filterButtonWrapper" id="DisplayFilterButtonWrapper">',
                    '<a id="DisplayAddfilter" class="btn btnDefault btnAddFilter" data-bind="css: displayDetailPageHandler.CanAddFilters() ? \'\' : \'disabled\', click: displayDetailPageHandler.ShowAddFilterPopup"><span data-bind="text: Localization.AddFilter">' + Localization.AddFilter + '</span></a>',
                    '<a id="AddFollowUp" class="btn btnDefault btnAddFollowUp" data-bind="css: displayDetailPageHandler.CanAddFollowups() ? \'\' : \'disabled\', click: function (data, event) { displayDetailPageHandler.ShowFollowupPopup({ PopupFrom: enumHandlers.ANGLEPOPUPTYPE.DISPLAY }, data, event); }"><span data-bind="text: Localization.AddFollowUp">' + Localization.AddFollowUp + '</span></a>',
                '</div>',
            '</div>',
            '<div id="DisplayStatisticArea" class="statisticArea">',
                '<h2>' + Localization.Statistics + '</h2>',
                '<div class="row">',
                    '<div class="field">' + Localization.CreatedBy + '</div>',
                    '<div class="input">',
                        '<!--ko if: Data().created -->',
                        '<span data-bind="text: Data().created.full_name"></span>',
                        '<span data-bind="text: ConvertUnixTimeStampToDateStringInAngleDetails(Data().created.datetime)"></span>',
                        '<!--/ko-->',
                    '</div>',
                '</div>',
                '<div class="StatSeparate"></div>',
                '<div class="row">',
                    '<div class="field">' + Localization.LastChangedBy + '</div>',
                    '<div class="input">',
                        '<!--ko if: Data().changed -->',
                        '<span data-bind="text: Data().changed.full_name"></span>',
                        '<span data-bind="text: ConvertUnixTimeStampToDateStringInAngleDetails(Data().changed.datetime)"></span>',
                        '<!--/ko-->',
                    '</div>',
                '</div>',
                '<div class="StatSeparate"></div>',
            '</div>',
        '</div>'
    ].join('');
};
