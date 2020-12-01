*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_NotificationFeed.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Force Tags          MC    acc_mc

*** Test Cases ***
Verify Notification Feed
    [Documentation]   This test case Verifyies EA notifications in ITMC 
    [Tags]  acc_wc_aci   TC_C231827
    Wait Notification Feed Loaded
    Check Notification Feed On Topbar
