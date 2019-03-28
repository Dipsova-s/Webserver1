*** Keywords ***
Screenshot "WC_How_to_create___change___publish___delete_a_Dashboard" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Go to Search Page
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Open Dashboard Detail Popup
    Update Popup Position    css=.popupDashboardDetails

    Click Dashboard Detail Definition Tab
    Open Dashboard Definition Widget Panel   1
    Crop Dashboard Details "Definition" Tab

Crop Dashboard Details "Definition" Tab
    Crop WebHelp Image    WC_Dashboard_definition.png  css=.popupDashboardDetails