*** Settings ***
Library             Selenium2Screenshots
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpMC.robot
Suite Setup         Initialize MC WebHelp
Suite Teardown      Teardown MC WebHelp
Force Tags          webhelp  webhelp_mc

*** Test Cases ***
WebHelp MC
    Check MC Support Language
    Crop Overview Page
    Crop Custom Icons
    Crop Action Icons
    Crop Model Overview Page
    Crop Edit Automation Task Page