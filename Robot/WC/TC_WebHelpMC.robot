*** Settings ***
Library             Selenium2Screenshots
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpMC.robot
Suite Setup         Suite Setup MC WebHelp
Test Setup          Test Setup MC WebHelp
Test Teardown       Test Teardown MC WebHelp
Force Tags          webhelp  webhelp_mc

*** Test Cases ***
WebHelp MC
    Crop Overview Page
    Crop Custom Icons
    Crop Action Icons
    Crop Model Overview Page
    Crop Edit Automation Task Page