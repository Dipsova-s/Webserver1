*** Keywords ***
Screenshot "WC_Search_Results_Pane" page
    Search Filter By Query String    sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20-facetcat_characteristics:(facet_has_warnings)
    Click Change View To Displays Mode
    
    Crop Search Result
    Crop Search Result Icons
    Crop Display Type Icons

    Click Change View To Compact Mode
    Crop Show Display Button
    Click Change View To Displays Mode

Crop Search Result
    ${width}    ${height}    Get Element Size    css=#Content
    Crop WebHelp Image With Dimensions    WC_Search_Result.png    css=#Content    0   0   ${width}    660

Crop Search Result Icons
    Execute JavaScript    $('.SearchResult:first .SignFavoriteDisable,.SearchResult:first .SignFavorite').attr('class', 'SignFavorite').attr('style', 'width:22px;height:25px;background-position:center center;');
    Crop WebHelp Image   WC_Starred.png   jquery=.SearchResult:first .SignFavorite    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon public');
    Crop WebHelp Image    WC_Public.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon private');
    Crop WebHelp Image    WC_Private.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon angle');
    Crop WebHelp Image    WC_Angle_Icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon template');
    Crop WebHelp Image    WC_Template.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon parameterized');
    Crop WebHelp Image    WC_Execution_Lightning.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon validated');
    Crop WebHelp Image    WC_Validated.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .btnInfo').attr('style', 'width:22px;height:25px;');
    Crop WebHelp Image    WC_i_Icon.png   jquery=.SearchResult:first .ResultContent .btnInfo    ${False}

Crop Display Type Icons
    Execute JavaScript    $('.ResultView .icon.default').removeClass('default');
    Crop WebHelp Image   WC_Table_Icon.png   jquery=.ResultView .icon.list:not(.default):eq(0)    ${False}
    Crop WebHelp Image   WC_Graph_Icon.png   jquery=.ResultView .icon.chart:not(.default):eq(0)    ${False}
    Crop WebHelp Image   WC_Pivot_Icon.png   jquery=.ResultView .icon.pivot:not(.default):eq(0)    ${False}

Crop Show Display Button
    ${left}    Execute JavaScript   return $('.ResultView').position().left+5;
    Crop WebHelp Image With Dimensions     WC_select_display_icon.png    css=#InnerResultWrapper .SearchResult    ${left}    2    40    34    ${False}