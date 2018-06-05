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
                            '<a class="icon #= searchPageHandler.GetSignPrivateCSSClass(data) #"></a>',
                            '<span class="icon #= searchPageHandler.GetItemIconTypeCSSClassByItem(data) #"></span>',
                        '</div>',

                        '<div class="ResultView">',
                            '<a href="#= searchModel.GetHrefUri(data, enumHandlers.DISPLAYTYPE_EXTRA.LIST) #" onclick="return searchModel.ItemLinkClicked(event, \'#= uri #\', enumHandlers.DISPLAYTYPE_EXTRA.LIST)" class="icon list #= searchPageHandler.GetItemIconCSSClassByDisplay(data, enumHandlers.DISPLAYTYPE_EXTRA.LIST) #"></a>',
                            '<a href="#= searchModel.GetHrefUri(data, enumHandlers.DISPLAYTYPE_EXTRA.CHART) #" onclick="return searchModel.ItemLinkClicked(event, \'#= uri #\', enumHandlers.DISPLAYTYPE_EXTRA.CHART)" class="icon chart #= searchPageHandler.GetItemIconCSSClassByDisplay(data, enumHandlers.DISPLAYTYPE_EXTRA.CHART) #"></a>',
                            '<a href="#= searchModel.GetHrefUri(data, enumHandlers.DISPLAYTYPE_EXTRA.PIVOT) #" onclick="return searchModel.ItemLinkClicked(event, \'#= uri #\', enumHandlers.DISPLAYTYPE_EXTRA.PIVOT)" class="icon pivot #= searchPageHandler.GetItemIconCSSClassByDisplay(data, enumHandlers.DISPLAYTYPE_EXTRA.PIVOT) #"></a>',
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
                            '<div class="Date">#= searchModel.GetCreatedItemDetail(data) #</div>',
                            '<p class="ContentDetail">#= WC.HtmlHelper.StripHTML(description, true) #</p>',
                            '<p class="PrivateNote textEllipsis" title="#= searchPageHandler.GetSPrivateNoteByUserSpecific(data, false) #">#= searchPageHandler.GetSPrivateNoteByUserSpecific(data, true) #</p>',
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
