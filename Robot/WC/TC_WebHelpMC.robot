*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/resources/WebhelpSettings.robot
Resource            ${EXECDIR}/resources/Selenium2Screenshots.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpMC.robot
Suite Setup         Suite Setup MC WebHelp
Test Setup          Test Setup MC WebHelp
Test Teardown       Test Teardown MC WebHelp
Force Tags          webhelp_s  webhelp_mc_s

*** Test Cases ***
# Prerequisite
# 1. 2 models in the system: EA2_800 and EA4IT
# 2. both are licensed and the status is up
WebHelp MC
    Crop Overview Page
    Crop Custom Icons
    Crop Action Icons
    Crop Model Overview Page
    Crop Edit Automation Task Page
    Crop Default Datastore Icon