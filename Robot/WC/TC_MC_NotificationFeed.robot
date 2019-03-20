*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_NotificationFeed.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Force Tags          MC    acc_mc

*** Test Cases ***
Verify Notification Feed
    Wait Notification Feed Loaded
    Check Notification Feed On Topbar
