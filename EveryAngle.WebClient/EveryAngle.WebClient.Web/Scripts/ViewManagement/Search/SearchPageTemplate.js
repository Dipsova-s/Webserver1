var searchPageTemplateModel = new SearchPageTemplateModel();

function SearchPageTemplateModel() {
    "use strict";

    var self = this;

    self.GetItemRowTemplate = function () {
        var template = [
            '<tr data-uri="#= uri #" data-uid="#= uid #"><td>',
                '<div class="SearchResult">',
                    '<div #= searchModel.GetShowRecentUseAndHideRecord(data) # >',
                        '<div  class="ResultSign" >',
                            '<a id="ItemFavoriteIcon_#=id#" class="#= searchPageHandler.GetSignFavoriteIconCSSClass(data) #" onclick="searchPageHandler.SetFavoriteItem(\'#= uri #\', event)" ></a>',
                            '<span class="icon #= searchPageHandler.GetSignPrivateCSSClass(data) #"></span>',
                            '<span class="icon #= searchPageHandler.GetItemIconTypeCSSClassByItem(data) #"></span>',
                        '</div>',

                        '<div class="ResultView #= searchPageHandler.GetItemIconCSSClassByDisplay(data) #">',
                            '# if (searchPageHandler.DisplayType() !== searchPageHandler.DISPLAY_TYPE.DISPLAYS) { #',
                            '<a class="icon new btnShowDisplays" onclick="searchPageHandler.ShowDisplays(event, this, \'#= uri #\', #= searchModel.GetTotalDisplays(data) #)"><span class="badge">#= searchModel.GetTotalDisplays(data) #</span></a>',
                            '# } else { #',
                            '#= searchPageHandler.GetDisplaysListHtmlFromItem(data, \'small\') #',
                            '# }#',
                        '</div>',

                        '<div class="ResultContent">',
                            '<div class="displayNameContainer">',
                                '<a class="name" title="#: name #" href="#= searchModel.GetHrefUri(data, enumHandlers.DISPLAYTYPE_EXTRA.DEFAULT) #" onclick="return #= searchModel.CheckNoDisplay(data) #">#: name #</a>',
                                '<div class="rear">',
                                    '<i class="icon #= searchPageHandler.GetIsValidateItemHtmlElement(data) #"></i>',
                                    '<i class="icon #= searchPageHandler.GetParameterizeCSSClass(data) #"></i>',
                                    '<i class="icon #= searchPageHandler.GetWarnningClass(data) #"></i>',
                                    '<a onclick="itemInfoHandler.ShowInfoPopup(\'#= uri #\',event)" class="btnInfo"></a>',
                                '</div>',
                            '</div>',
                            '<p class="ContentDetail truncatable">#= WC.HtmlHelper.StripHTML(description, true) #</p>',
                            '<p class="PrivateNote textEllipsis" title="#= searchPageHandler.GetPrivateNoteByUserSpecific(data, true) #">#= searchPageHandler.GetPrivateNoteByUserSpecific(data, false) #</p>',
                            '<div class="Date">#= searchModel.GetCreatedItemDetail(data) #</div>',
                        '</div>',
                    '</div>',
                    '<div class="SearchRecentUse" #= searchModel.GetShowRecentUseAndShowRecord(data) # >',
                        '<div class="SearchRecentUseContent">#= searchModel.GetDisplayTotalItems() #</div>',
                    '</div>',
                '</div>',
            '</td></tr>'
        ].join('');

        return template;
    };
}
