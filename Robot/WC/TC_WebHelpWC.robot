*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/resources/WebhelpSettings.robot
Resource            ${EXECDIR}/resources/Selenium2Screenshots.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Action_Button_Bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Angle_actions.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Angle_details.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Angle_header.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Angle_results_page.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Angles.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Basic_list_options.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Business_diagram.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Business_process_bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Chart_options.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Dashboard__details.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Dashboard__results_page.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Dashboard_widgets.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Dashboards.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Display.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Display_details.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Display_Pane.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Filter_Pane.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Homepage.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_create___change___publish___delete_a_Dashboard.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_create___publish___delete_an_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_execute_Angles_or_Dashboards.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_export_to_Excel_or_CSV.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Jump.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Pivot_options.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Search_bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Search_Results_Pane.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Top_Bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_User_settings.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Warnings_and_errors.robot
Suite Setup         Suite Setup WC WebHelp
Test Teardown       Test Teardown WC WebHelp
Force Tags          webhelp_s  webhelp_wc_s

*** Test Cases ***
# Prerequisite
# 1. add users to server by running "<robot>/webhelp_items/add-users.ps1" script
# 2. run "r:webhelp_setup" category via TestServer
# Extra
# - Docu. server: https://nl-docsf01.eatestad.local
# - import items by running "webhelp_import" tag (this also included in "webhelp_setup" tag)
# - export items by running "webhelp_export" tag

WebHelp WC English
    [Setup]  Test Setup WC WebHelp  ${WEBHELP_USER_EN.name}  ${WEBHELP_USER_EN.password}  ${WEBHELP_USER_EN.language}  ${WEBHELP_USER_EN.output}
    WebHelp WC

WebHelp WC Dutch
    [Setup]  Test Setup WC WebHelp  ${WEBHELP_USER_NL.name}  ${WEBHELP_USER_NL.password}  ${WEBHELP_USER_NL.language}  ${WEBHELP_USER_NL.output}
    WebHelp WC

WebHelp WC French
    [Setup]  Test Setup WC WebHelp  ${WEBHELP_USER_FR.name}  ${WEBHELP_USER_FR.password}  ${WEBHELP_USER_FR.language}  ${WEBHELP_USER_FR.output}
    WebHelp WC

WebHelp WC German
    [Setup]  Test Setup WC WebHelp  ${WEBHELP_USER_DE.name}  ${WEBHELP_USER_DE.password}  ${WEBHELP_USER_DE.language}  ${WEBHELP_USER_DE.output}
    WebHelp WC

WebHelp WC Spanish
    [Setup]  Test Setup WC WebHelp  ${WEBHELP_USER_ES.name}  ${WEBHELP_USER_ES.password}  ${WEBHELP_USER_ES.language}  ${WEBHELP_USER_ES.output}
    WebHelp WC

*** Keywords ***
WebHelp WC
    Screenshot "WC_Action_Button_Bar" page
    Screenshot "WC_Angle_actions" page
    Screenshot "WC_Angle_details" page
    Screenshot "WC_Angle_header" page
    Screenshot "WC_Angle_results_page" page
    Screenshot "WC_Angles" page
    Screenshot "WC_Basic_list_options" page
    Screenshot "WC_Business_diagram" page
    Screenshot "WC_Business_process_bar" page
    Screenshot "WC_Chart_options" page
    Screenshot "WC_Dashboard__details" page
    Screenshot "WC_Dashboard__results_page" page
    Screenshot "WC_Dashboard_widgets" page
    Screenshot "WC_Dashboards" page
    Screenshot "WC_Display" page
    Screenshot "WC_Display_details" page
    Screenshot "WC_Display_Pane" page
    Screenshot "WC_Filter_Pane" page
    Screenshot "WC_Homepage" page
    Screenshot "WC_How_to_create___change___publish___delete_a_Dashboard" page
    Screenshot "WC_How_to_create___publish___delete_an_Angle" page
    Screenshot "WC_How_to_execute_Angles_or_Dashboards" page
    Screenshot "WC_How_to_export_to_Excel_or_CSV" page
    Screenshot "WC_Jump" page
    Screenshot "WC_Pivot_options" page
    Screenshot "WC_Search_bar" page
    Screenshot "WC_Search_Results_Pane" page
    Screenshot "WC_Top_Bar" page
    Screenshot "WC_User_settings" page
    Screenshot "WC_Warnings_and_errors" page