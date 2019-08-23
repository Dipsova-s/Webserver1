*** Keywords ***
Screenshot "WC_Search_Results_Pane" page
    Search Filter By Query String    sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20-facetcat_characteristics:(facet_has_warnings)
    Click Change View To Displays Mode
    
    Set Window Size    1600   700
    Sleep    ${TIMEOUT_LARGEST}
    Crop Search Result
    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

    Crop Search Result Icons
    Crop Display Type Icons

    Click Change View To Compact Mode
    Crop Show Display Button
    Click Change View To Displays Mode

Crop Search Result
    ${width}    ${height}    Get Element Size    css=#Content
    Crop WebHelp Image With Dimensions    WC_Search_Result.png    css=#Content    0   0   ${width}    660

Crop Search Result Icons
    Execute JavaScript    $('#with_private_display').closest('li').show();
    Crop WebHelp Image   WC_Private_Display_Icon.png   jquery=.label[alt="with_private_display"] img    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-star-active');
    Crop WebHelp Image   WC_Starred.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-public');
    Crop WebHelp Image    WC_Public.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-private');
    Crop WebHelp Image    WC_Private.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-angle');
    Crop WebHelp Image    WC_Angle_Icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-template');
    Crop WebHelp Image    WC_Template.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-parameterized');
    Crop WebHelp Image    WC_Execution_Lightning.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-validated');
    Crop WebHelp Image    WC_Validated.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-info');
    Crop WebHelp Image    WC_i_Icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

Crop Display Type Icons
    Execute JavaScript    $('.ResultView .icon:eq(0)').attr('class', 'icon icon-list');
    Crop WebHelp Image   WC_Table_Icon.png   jquery=.ResultView .icon:eq(0)    ${False}

    Execute JavaScript    $('.ResultView .icon:eq(0)').attr('class', 'icon icon-chart');
    Crop WebHelp Image   WC_Graph_Icon.png   jquery=.ResultView .icon:eq(0)    ${False}

    Execute JavaScript    $('.ResultView .icon:eq(0)').attr('class', 'icon icon-pivot');
    Crop WebHelp Image   WC_Pivot_Icon.png   jquery=.ResultView .icon:eq(0)    ${False}

Crop Show Display Button
    ${left}    Execute JavaScript   return $('.ResultView').position().left+5;
    Crop WebHelp Image With Dimensions     WC_select_display_icon.png    css=#InnerResultWrapper .SearchResult    ${left}    2    40    34    ${False}