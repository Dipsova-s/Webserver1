*** Keywords ***
Screenshot "WC_Templates" page
    ${AngleId}    Set Variable    WEBHELP_WC_Templates

    Go to Search Page

    Click Search Business Process GRC
    Click Search Business Process S2D
    Click Search Filter Template
    ${searchText}    Get Localization Text  unposted  niet-geboekte  unbebuchte  No Contabilizados  Non Imputées
    Search By Text    ${searchText}
    Crop Template Unposted FI Docs
    
    Set Window Size    1300   700
    Sleep    ${TIMEOUT_LARGEST}
    
    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Crop Template Unposted FI Docs Basic List

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Template Unposted FI Docs
    Crop WebHelp Image With Dimensions       WC_Template_Unposted_FI_Docs.png     css=body    0     0    959   434         

Crop Template Unposted FI Docs Basic List
    Crop WebHelp Image     WC_Template_Unposted_FI_Docs_Basic_List.png     css=body