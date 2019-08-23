*** Settings ***
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardPage.robot
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardPublishingPopup.robot
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardValidatingPopup.robot

*** Keywords ***
Publish Dashboard
    Open Dashboard Publishing Popup
    Click Publish Dashboard

Unpublish Dashboard
    Open Dashboard Publishing Popup
    Click Unpublish Dashboard

Validate Dashboard
    Open Dashboard Validating Popup
    Click Validate Dashboard

Unvalidate Dashboard
    Open Dashboard Validating Popup
    Click Unvalidate Dashboard

Publish Display From Dashboard Page
    [Arguments]    ${index}
    Click Link Open Private Display    ${index}
    Wait Until Keyword Succeeds    30 sec    1 sec    Select Window    NEW
    Wait Angle Page Document Loaded
    Wait Angle Publishing Popup Loaded
    Click Publish Angle
    Check Angle Is Published
    Select Window    MAIN
    Sleep   ${TIMEOUT_LARGEST}