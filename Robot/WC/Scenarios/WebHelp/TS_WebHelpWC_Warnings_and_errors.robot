*** Keywords ***
Screenshot "WC_Warnings_and_errors" page
    Go to Search Page
    Set Show Angle Warning In Facet Filters
    
    Select Search Filter Angle
    Select Search Filter Has Warning

    Set Window Size    1300   ${WINDOW_HEIGHT}
    Sleep    ${TIMEOUT_LARGEST}
    Crop Search Warning Result
    Crop Warning Icons
    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

    Set Hide Angle Warning In Facet Filters

Crop Search Warning Result
    ${width}  ${height}  Get Element Size   css=#TopBar
    Crop WebHelp Image With Dimensions    WC_Angle_warnings_display2.png    css=#MainContent    0   0   ${width}    500

Crop Warning Icons
    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon validWarning');
    Sleep    ${TIMEOUT_GENERAL}
    Crop WebHelp Image    WC_Angle_Warning2.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon validError');
    Sleep    ${TIMEOUT_GENERAL}
    Crop WebHelp Image    WC_Angle_Warning.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)    ${False}