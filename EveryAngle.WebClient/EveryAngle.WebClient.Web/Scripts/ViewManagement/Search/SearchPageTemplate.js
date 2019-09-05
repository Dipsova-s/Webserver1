var searchPageTemplateModel = new SearchPageTemplateModel();

function SearchPageTemplateModel() {
    "use strict";

    var self = this;

    self.GetItemRowTemplate = function () {
        var template = [
            '<tr data-uri="#= uri #" data-uid="#= uid #"><td class="#= searchModel.GetShowRecentUseAndShowRecord(data) #">',
                '<div class="SearchResult">',
                    '<div #= searchModel.GetShowRecentUseAndHideRecord(data) # >',
                        '<div class="ResultView #= searchPageHandler.GetItemIconCSSClassByDisplay(data) #">',
                            '# if (searchPageHandler.DisplayType() !== searchPageHandler.DISPLAY_TYPE.DISPLAYS) { #',
                            '<a class="icon new btnShowDisplays" onclick="searchPageHandler.ShowDisplays(event, this, \'#= uri #\', #= searchModel.GetTotalDisplays(data) #)"><span class="badge">#= searchModel.GetTotalDisplays(data) #</span></a>',
                            '# } else { #',
                            '#= searchPageHandler.GetDisplaysListHtmlFromItem(data, \'small\') #',
                            '# }#',
                        '</div>',

                        '<div class="ResultContent">',
                            '<div class="displayNameContainer">',
                                '<div class="front">',
                                    '<i class="icon #= searchPageHandler.GetItemIconTypeCSSClassByItem(data) #"></i>',
                                    '<a id="ItemFavoriteIcon_#=id#" class="icon #= searchPageHandler.GetSignFavoriteIconCSSClass(data) #" onclick="searchPageHandler.SetFavoriteItem(\'#= uri #\', event)" ></a>',
                                '</div>',
                                '<a class="name" data-showwhenneed="true" data-role="tooltip" data-tooltip-title="#: name #" data-tooltip-position="bottom"  href="#= searchModel.GetHrefUri(data, enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT) #" onclick="return #= searchModel.CheckNoDisplay(data) #">#: name #</a>',
                                '<div class="rear">',
                                    '<i class="icon #= searchPageHandler.GetPublishCSSClass(data) #"></i>',
                                    '<i class="icon #= searchPageHandler.GetWarnningCSSClass(data) #"></i>',
                                    '<i class="icon #= searchPageHandler.GetParameterizeCSSClass(data) #"></i>',
                                    '<i class="icon #= searchPageHandler.GetIsValidateCSSClass(data) #"></i>',
                                    '<a onclick="itemInfoHandler.ShowInfoPopup(\'#= uri #\',event)" class="icon icon-info btnInfo"></a>',
                                '</div>',
                            '</div>',
                            '<p class="ContentDetail truncatable">#= WC.HtmlHelper.StripHTML(description, true) #</p>',
                            '<div class="Date textEllipsis">#= searchModel.GetCreatedItemDetail(data) # #= searchPageHandler.GetPrivateNoteByUserSpecific(data, false) #</div>',
                        '</div>',
                    '</div>',
                    '<div class="SearchRecentUse #= searchModel.GetShowRecentUseAndShowRecord(data) #">',
                        '<div class="SearchRecentUseContent">#= searchModel.GetDisplayTotalItems() #</div>',
                    '</div>',
                '</div>',
            '</td></tr>'
        ].join('');

        return template;
    };
}
