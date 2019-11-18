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
                '<h3>' + Localization.AboutVersion + '</h3>',
                '<div class="row"><div class="label">' + Localization.AboutClientVersion + '</div><div class="value" data-bind="text: web_client_version"></div></div>',
                '<div class="row"><div class="label">' + Localization.AboutServerVersion + '</div><div class="value" data-bind="text: app_server_version"></div></div>',
                '<!-- ko foreach: { data: models, as: \'model\' } -->',
                '<div class="row"><div class="label" data-bind="text: model.name() + \':\'"></div><div class="value" data-bind="text: model.version"></div></div>',
                '<!-- /ko -->',
                '<br/>',
                '<h3>' + Localization.AboutModelInfo + '</h3>',
                '<!-- ko foreach: { data: models, as: \'model\' } -->',
                '<div class="row">',
                    '<div class="label" data-bind="text: model.name() + \':\'"></div> ',
                    '<div class="value" data-bind="text: \'(\' + model.info() + \')\' "></div>',
                '</div>',
                '<!-- /ko -->',
            '</div>',
        '</div>'
    ].join('');
};
