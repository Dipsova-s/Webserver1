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
                        '<input type="checkbox" data-bind="attr: { id: $data.id }, checked: $data.IsChecked, IndeterminatableChange: $data.IsChecked, value: \'is_\' + $data.id" />',
                        '<span class="textStatus"></span>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
}
