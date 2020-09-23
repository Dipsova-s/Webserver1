var massChangeLabelsHtmlTemplate = function () {
    return [
        '<!-- ko stopBinding: true -->',
        '<div id="LabelCategories" data-bind="foreach: $data">',
            '<div class="row rowLabelCategory">',
                '<div class="field" data-bind="text: Captions.MassChange_Category_Title + \': \' + $data.Category.name"></div>',
            '</div>',
            '<div id="Labels" data-bind="foreach: $data.Labels">',
                '<div class="row">',
                    '<div class="field" data-bind="text: $data.name, attr: { title: $data.name }"></div>',
                    '<div class="input">',
                        '<label>',
                            '<input type="radio" value="undefined" data-bind="attr: {name: $data.name,id:$data.id }" checked />',
                            '<span class="label LabelOptions">' + Captions.MassChange_Label_LeaveUnchanged+'</span>',
                        '</label>',
                        '<label>',
                            '<input type="radio" value="true" data-bind="checked: $data.IsChecked,attr: { name: $data.name,id:$data.id }" />',
                            '<span class="label LabelOptions">' + Localization.Add + '</span>',
                        '</label>',
                        '<label>',
                            '<input type="radio" value="false" data-bind="checked: $data.IsChecked,attr: { name: $data.name,id:$data.id }" />',
                            '<span class="label LabelOptions">' + Localization.Remove + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};
var massChangeGeneralLabelsHtmlTemplate = function () {
    return [
        '<!-- ko stopBinding: true -->',
        '<div id="LabelCategories" data-bind="foreach: $data">',
        '<div class="sectionGeneral">',
                '<div class="row">',
                    '<div class="input switch">Update note',
                        '<label>',
                            '<input id="AnglePrivateNoteCheckbox" type="checkbox" value="private_note" data-bind="checked: massChangeModel.IsChangePrivateNote" />',
                            '<span class="lever"></span>',
                        '</label>',
                    '</div>',
                '</div>',
                '<div class="row">',
                    '<div class="input-fieldset">',
                        '<input id="AnglePrivateNote" maxlength="100" type="text" value="" data-bind="value: massChangeModel.PrivateNote, enable: massChangeModel.IsChangePrivateNote, valueUpdate: \'afterkeydown\'" class="eaText eaTextSize40 txtPrivateNote" />',
                        '<label class="legend">'+Localization.PersonalNote+'</label>',
                    '</div>',
                '</div>',
        '</div>',
            '<div class="sectionStatus">',
                '<div class="row rowLabelCategory">',
                '<div class="field" data-bind="text: $data.Category.name"></div>',
                '</div>',
            '<div id="Labels" data-bind="foreach: $data.Labels">',
                '<div class="row">',
                    '<div class="field" data-bind="text: $data.name, attr: { title: $data.name }"></div>',
                    '<div class="input">',
                        '<label>',
                            '<input type="radio" value="undefined" data-bind="attr: {name: $data.name,id:$data.id }" checked />',
                            '<span class="label LabelOptions">' + Captions.MassChange_Label_LeaveUnchanged+'</span>',
                        '</label>',
                        '<label>',
                            '<input type="radio" value="true" data-bind="checked: $data.IsChecked,attr: { name: $data.name,id:$data.id }" />',
                            '<span class="label LabelOptions">' + Localization.Yes + '</span>',
                        '</label>',
                        '<label>',
                            '<input type="radio" value="false" data-bind="checked: $data.IsChecked,attr: { name: $data.name,id:$data.id }" />',
                            '<span class="label LabelOptions">' + Localization.No + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};
var massChangeTagLabelHtmlTemplate = function () {
    return [
        '<!-- ko stopBinding: true -->',
        '<div id="LabelCategories" data-bind="foreach: $data">',
            '<div class="sectionStatus">',
                '<div class="row rowLabelCategory">',
                '   <div class="field">'+Localization.TagLabel+'</div>',
                '</div>',
                '<div class="row rowLabelCategory">',
                    '<div id="AngleTagFilterContainer">',
                        '<input class="txtFitlerTags" id="txtFitlerTags" autocomplete="off" data-bind="value:massChangeModel.TagSearchKeyword, valueUpdate: \'afterkeydown\' " placeholder="'+Localization.SearchTagInputPlaceholder+'"/>',
                        '<a class="clearSearch alwaysHide" data-role="tooltip" data-tooltip-text="'+Localization.ClearAdvancedFilters+'" data-tooltip-position="bottom" onclick="massChangeModel.ClearAdvanceSearch();"><i class="icon icon-close"></i></a>',
                    '</div>',
                '</div>',
            '<div id="Labels" data-bind="foreach: $data.Labels">',
                '<div class="row" data-bind="visible:$data.Show">',
                    '<div class="field" data-bind="text: $data.name, attr: { title: $data.name }"></div>',
                    '<div class="input">',
                        '<label>',
                            '<input type="radio" value="undefined" data-bind="attr: { name: $data.name,id:$data.id }" checked />',
                            '<span class="label LabelOptions">' + Captions.MassChange_Label_LeaveUnchanged+'</span>',
                        '</label>',
                        '<label>',
                            '<input type="radio" value="true" data-bind="checked: $data.IsChecked,attr: { name: $data.name,id:$data.id }" />',
                            '<span class="label LabelOptions">' + Localization.Add + '</span>',
                        '</label>',
                        '<label>',
                            '<input type="radio" value="false" data-bind="checked: $data.IsChecked,attr: { name: $data.name,id:$data.id }" />',
                            '<span class="label LabelOptions">' + Localization.Remove + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};
