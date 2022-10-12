var aboutHtmlTemplate = function () {

    return [
        '<div class=\"aboutContainer\">',
            '<div class="aboutCommon">',
                Localization.AboutEveryAngleDetails,
                '<div class="copyRight">',
                    '<a href="' + copyRightUrl + '" target="_blank">',
                        kendo.format(Localization.CopyRight, kendo.date.today().getFullYear()),
                        '<i class="icon icon-link"></i>',
                    '</a>',
                '</div>',
            '</div>',
            '<div class="aboutModels">',
                '<div class="row"><div class="label"><h3>' + Localization.AboutVersion + '</h3></div><div class="value" data-bind="text: web_client_version"></div></div>',
                userModel.IsPossibleToHaveManagementAccess() ? '<div class="row"><a data-bind="attr: { \'href\': management_url }" target="_blank" id="details">'+ Localization.Details +'</a></div>':'<div class="row"></div>',
                '<br/>',
                '<h3>' + Localization.AboutModelInfo + '</h3>',
                '<!-- ko foreach: { data: models, as: \'model\' } -->',
                '<div class="row">',
                    '<div data-bind="text: model.name() + \':&emsp;&emsp;\'+ model.status + \'&emsp;&emsp;\'+ model.modelDefinationVersion() + \'&emsp;&emsp;\'+ model.date()"></div>',
                '</div>',
                '<!-- /ko -->',
            '</div>',
        '</div>'
    ].join('');
};
