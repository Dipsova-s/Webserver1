*** Settings ***
Library             Selenium2Screenshots
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC.robot
Suite Setup         Initialize WC WebHelp
Suite Teardown      Logout WC Then Close Browser
Force Tags          webhelp  webhelp_wc

*** Test Cases ***
WebHelp WC
    Crop Logo
#    Crop Business Processes
    Crop Search Result
    Crop Panes Homepage
    Crop Item Icons
    Crop Mode Button
    Crop Action Button Sort
    Crop Show Display Button 
    