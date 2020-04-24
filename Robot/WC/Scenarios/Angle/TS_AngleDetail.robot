*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Verify Adhoc Angle Statistics
    Open Angle Statistic Popup
    Angle Should Contain Execution Info
    Angle Should Not Contain Serarator
    Angle Should Not Contain Statistic Info
    Close Angle Statistic Popup

Verify Adhoc Display Statistics
    Display Statistic Button Should Not Be Visible

Verify Saved Angle Statistics
    Open Angle Statistic Popup
    Angle Should Contain Execution Info
    Angle Should Contain Serarator
    Angle Should Contain Statistic Info
    Close Angle Statistic Popup

Verify Saved Display Statistics
    Open Display Statistic Popup
    Check Display Statistic Info
    Close Display Statistic Popup

Verify Edit Mode Angle Statistics
    Open Angle Statistic Popup
    Angle Should Not Contain Execution Info
    Angle Should Not Contain Serarator
    Angle Should Contain Statistic Info
    Close Display Statistic Popup

Verify Edit Mode Display Statistics
    Open Angle Statistic Popup
    Check Display Statistic Info
    Close Display Statistic Popup