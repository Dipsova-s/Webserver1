*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_NotificationFeed.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Notification Feed
    Wait Notification Feed Loaded
    Check Notification Feed On Welcome Page
    Search By Text And Expect In Search Result    Angle For General Test
    Check Notification Feed On Topbar
    Open Angle From First Angle in Search Page    Angle For General Test
    Check Notification Feed On Topbar