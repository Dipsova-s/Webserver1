function ChartOptionsView() {
    "use strict";

    var self = this;
    self.GetTemplate = function (models) {
        var templates = ['<div class="aggreagtion-options">'];
        var templateDropdown = [
            '<div class="form-row row-#= id #">',
                '<div class="form-col form-col-header">#= title #</div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" name="#= id #" class="k-dropdown" />',
                '</div>',
            '</div>'
        ].join('');
        var templateCheckbox = [
            '<div class="form-row row-#= id #">',
                '<div class="form-col form-col-body">',
                    '<label>',
                        '<input type="checkbox" name="#= id #" />',
                        '<span class="label">#= title #</span>',
                    '</label>',
                '</div>',
            '</div>'
        ].join('');
        var mappers = {};
        mappers[ChartOptionsHandler.UI.Dropdown] = templateDropdown;
        mappers[ChartOptionsHandler.UI.Checkbox] = templateCheckbox;
        jQuery.each(models, function (id, model) {
            if (model.valid()) {
                model.id = id;
                var html = mappers[model.ui];
                templates.push(kendo.template(html)(model));
            }
        });
        templates.push('</div>');
        return templates.join('');
    };
    self.GetTemplateAxisScaleRange = function () {
        return [
            '<div class="form-row row-#= name #">',
                '<div class="form-col form-col-header">#= title #</div>',
                '<div class="form-col form-col-body">',
                    '<input type="text" name="#= id #-lower" class="axis-scale-range-lower no-spinners" />',
                    '<span class="connector">#= connector #</span>',
                    '<input type="text" name="#= id #-upper" class="axis-scale-range-upper no-spinners" />',
                    '# if (suffix) { #',
                    '<span class="suffix">#= suffix #</span>',
                    '# } #',
                '</div>',
            '</div>'
        ].join('');
    };
}