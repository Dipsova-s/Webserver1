*** Keywords ***
Screenshot "WC_How_to_execute_Angles_or_Dashboards" page
    ${AngleId}        Set Variable    WEBHELP_WC_How_to_execute_Angles_or_Dashboards

    Go to Search Page
    Search Filter By Query String    ids=${AngleId}
    Crop Execution Parameters Popup

Crop Execution Parameters Popup
    Click Link   ${lnkSearchResult}:eq(0)
    Wait Until Angle Execute Parameters Popup Loaded
    Update Popup Position    css=.popup-execution-parameter
    Crop WebHelp Image  WC_Execution_Parameters.png  css=.popup-execution-parameter
    Close Angle Execution Parameters Popup