*** Keywords ***
Screenshot "WC_Dashboards" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboards

    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}
    Click Dashboard Tab
    Set Editor Context: Dashboard Tab

    Crop Dashboard Page

    Crop "WC_SaveDashboards" button

Crop Dashboard Page
    ${detailsWidth}  ${detailsHeight}   Get Element Size   css=#DashboardField
    ${widgetsWidth}  ${widgetsHeight}   Get Element Size   css=#dashboardWrapper
    Crop WebHelp Image With Dimensions  WC_Dashboard.png  css=#ContentWrapper  0  0  1000  500

Crop "WC_SaveDashboards" button
    Click Add Filter
    Wait Until Element Is Visible    ${popupFieldChooser}
    Click Element      ${fieldTypeSectionInChooseFieldPopUp}
    Wait Until Element Is Visible     ${percentageChkInFieldType}
    Click Element      ${percentageChkInFieldType}
    Wait Until Element Is Visible    xpath=//div[@id='DisplayPropertiesGrid']/div[2]//tr[1]
    Click Element       xpath=//div[@id='DisplayPropertiesGrid']/div[2]//tr[1]
    Click Insert Field From Field Chooser
    Sleep    ${TIMEOUT_LARGEST}
    
    Click Apply Dashboard Filter
    Dashboard Save Button Should Be Enable
    Crop WebHelp Image With Dimensions      WC_Save_Dashboard_Button.png      jquery=#DashboardSavingWrapper .saving-wrapper    2   2   107   24
    Crop WebHelp Image      WC_Save_Dashboard_Button_Caret.png      jquery=#DashboardSavingWrapper .btn-saving-options .icon-chevron-down