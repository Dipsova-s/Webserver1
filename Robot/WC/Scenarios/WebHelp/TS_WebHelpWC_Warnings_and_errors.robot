*** Keywords ***
Screenshot "Warnings and errors" page
    Go to Search Page
    Set Show Angle Warning In Facet Filters
    
    Select Search Filter Angle
    Select Search Filter Has Warning

    Crop Search Warning Result
    Crop Warning Icons

    Set Hide Angle Warning In Facet Filters

Crop Search Warning Result
    Crop WebHelp Image With Dimensions    WC_Angle_warnings_display2.png    css=#MainContent    0   0   ${WINDOW_WIDTH}    500

Crop Warning Icons
    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon validWarning');
    Sleep    ${TIMEOUT_GENERAL}
    Crop WebHelp Image    WC_Angle_Warning2.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon validError');
    Sleep    ${TIMEOUT_GENERAL}
    Crop WebHelp Image    WC_Angle_Warning.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}