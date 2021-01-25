var massChangeHtmlTemplate = function () {
    return [
        '<div class="popupTabPanel" id="MassChangeArea">',
            '<div class="sectionLabels">',
                '<div class="tab tab-full tab-details" id="LabelTabWrapper">',
                    '<div class="tab-menu-wrapper">',
                        '<div id="GeneralLabel" class="tab-menu active" onclick="massChangeModel.LabelTabClick(enumHandlers.LABELVIEWTYPE.GENERAL, this);" "><span>' + Localization.General + '</span></div>',
                        '<div id="BPLabels" class="tab-menu"  onclick="massChangeModel.LabelTabClick(enumHandlers.LABELVIEWTYPE.BP, this);" data-bind="css: { disabled: !massChangeModel.CanSetLabels() }"><span>' + Captions.MassChange_BP_Tab_Title + '</span></div>',
                        '<div id="SearchLabels" class="tab-menu" onclick="massChangeModel.LabelTabClick(enumHandlers.LABELVIEWTYPE.SEARCH, this);" data-bind="css: { disabled: !massChangeModel.CanSetLabels() }"><span>' + Captions.MassChange_SearchLabel_Tab_Title + '</span></div>',
                        '<div id="PrivilegeLabels" class="tab-menu" onclick="massChangeModel.LabelTabClick(enumHandlers.LABELVIEWTYPE.PRIVILEGE, this);" data-bind="css: { disabled: !massChangeModel.CanSetLabels() }"><span>' + Captions.MassChange_PrivilegeLabel_Tab_Title + '</span></div>',
                        '<div id="TagsLabels" class="tab-menu" onclick="massChangeModel.LabelTabClick(enumHandlers.LABELVIEWTYPE.TAGS, this);" data-bind="css: { disabled: !massChangeModel.CanSetLabels() }"><span>' + Localization.TagLabel + '</span></div>',
                    '</div>',
                '</div>',
                '<div id="Labels-PlaceHolder" data-bind="css: { disabled: !massChangeModel.CanSetLabels() && !massChangeModel.IsGeneralLabel() }"></div>',
            '</div>',
        '</div>'
    ].join('');
};
