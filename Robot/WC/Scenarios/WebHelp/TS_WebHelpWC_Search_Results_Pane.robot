*** Keywords ***
Screenshot "WC_Search_Results_Pane" page
    Search Filter By Query String    sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20-facetcat_characteristics:(facet_has_warnings)
    Click Change View To Displays Mode
    
    Resize WebHelp Window    1600   740
    Crop Search Result
    Maximize WebHelp Window

    Crop Search Result Icons
    Crop Display Type Icons

    Click Change View To Compact Mode
    Select Search Filter Angle
    Crop Show Display Button
    Click Change View To Displays Mode

Crop Search Result
    ${width}    ${height}    Get Element Size    css=#ResultWrapper
    ${itemWidth}    ${itemHeight}    Get Element Size    css=#ResultWrapper .k-grid-content tr
    Crop WebHelp Image With Dimensions    WC_Search_Result.png    css=#ResultWrapper    0   0   ${width}   ${itemHeight*3}

Crop Search Result Icons
    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-star-active');
    Crop WebHelp Image    WC_Starred.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-private');
    Crop WebHelp Image    WC_Private.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-angle');
    Crop WebHelp Image    WC_Angle_Icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-template');
    Crop WebHelp Image    WC_Template.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-dashboard');
    Crop WebHelp Image    WC_Dashboard_Icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-parameterized');
    Crop WebHelp Image    WC_Execution_Lightning.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-validated');
    Crop WebHelp Image    WC_Validated_icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon icon-info');
    Crop WebHelp Image    WC_i_Icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

Crop Display Type Icons
    Execute JavaScript    $('.ResultView .icon:eq(0)').attr('class', 'icon icon-list');
    Crop WebHelp Image   WC_List_Icon.png   jquery=.ResultView .icon:eq(0)    ${False}

    Execute JavaScript    $('.ResultView .icon:eq(0)').attr('class', 'icon icon-chart');
    Crop WebHelp Image   WC_Chart_Icon.png   jquery=.ResultView .icon:eq(0)    ${False}

    Execute JavaScript    $('.ResultView .icon:eq(0)').attr('class', 'icon icon-pivot');
    Crop WebHelp Image   WC_Pivot_Icon.png   jquery=.ResultView .icon:eq(0)    ${False}

Crop Show Display Button
    Create WebHelp Box   jquery=#InnerResultWrapper .SearchResult .btnShowDisplays:first   {width:27}
    Crop WebHelp Image    WC_select_display_icon.png   jquery=#RobotBox    ${False}
    Clear WebHelp Box