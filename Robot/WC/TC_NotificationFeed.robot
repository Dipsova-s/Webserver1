*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_NotificationFeed.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Notification Feed
    [Documentation]   This test case Verifyies EA notifications in WC 
    [Tags]  acc_wc_aci   TC_C93619
    Wait WC Notification Feed Loaded
    Check Notification Feed On Welcome Page
    Search By Text And Expect In Search Result    Angle For General Test
    Check Notification Feed On Topbar
    Open Angle From First Angle in Search Page    Angle For General Test
    Check Notification Feed On Topbar