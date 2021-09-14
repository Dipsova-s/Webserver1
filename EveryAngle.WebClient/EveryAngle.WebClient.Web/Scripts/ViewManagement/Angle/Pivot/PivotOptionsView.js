function PivotOptionsView() {
    "use strict";

    var self = this;

    self.GetTemplate = function (models) {
        var templates = ['<div class="aggreagtion-options">'];
        var templateDropdown = [
            '<div class="form-row row-#= id #" data-bind="visible: Data.#= id #.valid">',
                '<div class="form-col form-col-header">#= title #</div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" name="#= id #" class="k-dropdown" />',
                '</div>',
            '</div>'
        ].join('');
        var templateCheckbox = [
            '<div class="form-row row-#= id #" data-bind="visible: Data.#= id #.valid">',
                '<div class="form-col form-col-body">',
                    '<label>',
                        '<input type="checkbox" name="#= id #" />',
                        '<span class="label">#= title #</span>',
                    '</label>',
                '</div>',
            '</div>'
        ].join('');
        var templateRadio = [
            '<div class="form-row row-#= id #" data-bind="visible: Data.#= id #.valid">',
                '# for (var i=0; i<options.length; i++) { #',
                '<div class="form-col form-col-body">',
                    '<label>',
                        '<input type="radio" name="#= id #" value="#= options[i].id #" />',
                        '<span class="label">#= options[i].name #</span>',
                    '</label>',
                '</div>',
                '# } #',
            '</div>'
        ].join('');
        var mappers = {};
        mappers[PivotOptionsHandler.UI.Dropdown] = templateDropdown;
        mappers[PivotOptionsHandler.UI.Checkbox] = templateCheckbox;
        mappers[PivotOptionsHandler.UI.Radio] = templateRadio;
        jQuery.each(models, function (id, model) {
            model.id = id;
            var html = mappers[model.ui];
            templates.push(kendo.template(html)(model));
        });
        templates.push('<!-- ko if: CanApplyAggregation() -->',
            '<div class="query-aggregation-buttons btn-wrapper">',
            '<a class="float-right invisible"></a>',
            '<a class="btn btn-light btn-small btn-save" data-bind="click: ApplyAggregation , css: { disabled: !HasChanged() }">',
            '<span data-bind="text: Localization.Apply"></span>',
            '</a>',
            '</div>',
            '<!-- /ko -->');
        templates.push('</div>');
        return templates.join('');
    };
}