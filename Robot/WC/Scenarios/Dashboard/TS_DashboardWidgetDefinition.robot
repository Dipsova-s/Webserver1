*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardPage.robot

*** Keywords ***
Edit Widget Name
    [Arguments]  ${widgetName}  ${newWidgetName}
    Click Displays Tab
    Show Edit Widget Popup  ${widgetName}
    Input Widget Name  ${newWidgetName}
    Click Apply Editing Widget

Change Widget Display
    [Arguments]  ${widgetName}  ${displayName}
    Click Displays Tab
    Show Edit Widget Popup  ${widgetName}
    Select Widget Display  ${displayName}
    Click Apply Editing Widget

Open Widget Display
    [Arguments]  ${widgetName}  ${displayName}
    Click Displays Tab
    Show Edit Widget Popup  ${widgetName}
    Click Link Widget Display  ${displayName}