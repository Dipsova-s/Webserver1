function ItemSaveAsView() {
    "use strict";

    var self = this;

    self.GetTemplate = function () {
        return [
            '<div class="description-editor">',
                self.RowGeneralTemplate(),
                self.RowWarningTemplate(),
            '</div>'
        ].join('');
    };

    self.GetDisplayTemplate = function () {
        return [
            '<div class="description-editor">',
                self.RowGeneralTemplate(),
                '<div class="form-row row-add-new always-hide">',
                    '<div class="form-col form-col-body col-new-angle">',
                        '<label>',
                            '<input type="checkbox" class="chk-new-angle"/>',
                            '<span class="label">' + Localization.AddToNewAngle + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
                '<div class="form-row row-new-angle always-hide">',
                    '<div class="form-col form-col-body col-angle-name">',
                        '<div class="input-fieldset">',
                            '<input type="text" class="angle-name" maxlength="255" />',
                            '<label class="legend">' + Localization.AngleName + '</label>',
                        '</div>',
                        '<div class="info-text always-hide">' + Localization.Info_OnlyDisplayWillBeCreated + '</div>',
                    '</div>',
                '</div>',
                self.RowWarningTemplate(),
            '</div>'
        ].join('');
    };

    self.RowGeneralTemplate = function () {
        return [
            '<div class="form-row">',
                '<div class="form-col form-col-body col-languages">',
                    '<div class="languages"></div>',
                '</div>',
            '</div>',
            '<div class="form-row">',
                '<div class="form-col form-col-body col-name">',
                    '<div class="input-fieldset">',
                        '<input type="text" class="name" maxlength="255" />',
                        '<label class="legend">' + Localization.Name + '</label>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');
    };

    self.RowWarningTemplate = function () {
        return [
            '<div class="form-row row-warning text-error always-hide">',
                '<div class="form-col form-col-body">',
                    '<i class="icon validWarning"></i>',
                    '<span class="warning-text"></span>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetTemplateForInvalidBP = () => {
        return [
            '<div class="description-editor">',
                '<div class="card section-warning-message">',
                    '<div class="card-header">',
                        '<span>' + Localization.BPWarningMessageInSaveAs+'</span>',
                    '</div>',
                '</div>',
            self.GetDisplayTemplate(),
            '</div>'
        ].join('');
    }
}
