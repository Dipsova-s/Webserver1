*** Settings ***
Library             Selenium2Screenshots
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Action_Button_Bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Angle_actions.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Business_process_bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Homepage.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Search_bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Search_Results_Pane.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Top_Bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_User_settings.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Warnings_and_errors.robot
Suite Setup         Suite Setup WC WebHelp
Test Teardown       Test Teardown WC WebHelp
Force Tags          webhelp  webhelp_wc

*** Test Cases ***
# Test cases will capture images on each languages
# You can add a new test case by copy from the existing one
# - Parameters are "USERNAME" "PASSWORD" "FOLDER"
# - Each users must set the system language manually
WebHelp WC English
    [Setup]    Test Setup WC WebHelp    \webhelp_en    P@ssw0rd    idsfigures_lowres_en-US
    WebHelp WC

#WebHelp WC Dutch
#    [Setup]    Test Setup WC WebHelp    \webhelp_nl    P@ssw0rd    idsfigures_lowres_nl-NL
#    WebHelp WC

#WebHelp WC French
#    [Setup]    Test Setup WC WebHelp    \webhelp_fr    P@ssw0rd    idsfigures_lowres_fr-FR
#    WebHelp WC

#WebHelp WC German
#    [Setup]    Test Setup WC WebHelp    \webhelp_de    P@ssw0rd    idsfigures_lowres_de-DE
#    WebHelp WC

#WebHelp WC Spanish
#    [Setup]    Test Setup WC WebHelp    \webhelp_es    P@ssw0rd    idsfigures_lowres_es-ES
#    WebHelp WC

*** Keywords ***
WebHelp WC
    Screenshot "WC_Action_Button_Bar" page
    Screenshot "WC_Angle_actions" page 
    Screenshot "WC_Homepage" page
    Screenshot "WC_Business_process_bar" page
    Screenshot "WC_Search_bar" page
    Screenshot "WC_Search_Results_Pane" page
    Screenshot "WC_Top_Bar" page
    Screenshot "WC_User_settings" page
    Screenshot "Warnings and errors" page

    #Crop Create Angle Popup
    #Crop Toggle Angle
    #Crop Delete Display Icon
