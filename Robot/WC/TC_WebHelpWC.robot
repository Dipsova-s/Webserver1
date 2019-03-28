*** Settings ***
Library             Selenium2Screenshots
Resource            ${EXECDIR}/resources/WCSettings.robot
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
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Filter_Pane.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Homepage.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_activate_your_default_display_for_an_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_create___change___publish___delete_a_Dashboard.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_create___publish___delete_an_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_execute_Angles_or_Dashboards.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_export_to_Excel_or_CSV.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_filter_the_Angles.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_find_an_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_How_to_use_Templates.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Jump.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Pivot_options.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Search_bar.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Search_Results_Pane.robot
Resource            ${EXECDIR}/WC/Scenarios/WebHelp/TS_WebHelpWC_Templates.robot
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

WebHelp WC Dutch
    [Setup]    Test Setup WC WebHelp    \webhelp_nl    P@ssw0rd    idsfigures_lowres_nl-NL
    WebHelp WC

WebHelp WC French
    [Setup]    Test Setup WC WebHelp    \webhelp_fr    P@ssw0rd    idsfigures_lowres_fr-FR
    WebHelp WC

WebHelp WC German
    [Setup]    Test Setup WC WebHelp    \webhelp_de    P@ssw0rd    idsfigures_lowres_de-DE
    WebHelp WC

WebHelp WC Spanish
    [Setup]    Test Setup WC WebHelp    \webhelp_es    P@ssw0rd    idsfigures_lowres_es-ES
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
    Screenshot "WC_Filter_Pane" page
    Screenshot "WC_Homepage" page
    Screenshot "WC_How_to_activate_your_default_display_for_an_Angle" page
    Screenshot "WC_How_to_create___change___publish___delete_a_Dashboard" page
    Screenshot "WC_How_to_create___publish___delete_an_Angle" page
    Screenshot "WC_How_to_execute_Angles_or_Dashboards" page
    Screenshot "WC_How_to_export_to_Excel_or_CSV" page
    Screenshot "WC_How_to_filter_the_Angles" page
    Screenshot "WC_How_to_find_an_Angle" page
    Screenshot "WC_How_to_use_Templates" page
    Screenshot "WC_Jump" page
    Screenshot "WC_Pivot_options" page
    Screenshot "WC_Search_bar" page
    Screenshot "WC_Search_Results_Pane" page
    Screenshot "WC_Templates" page
    Screenshot "WC_Top_Bar" page
    Screenshot "WC_User_settings" page
    Screenshot "WC_Warnings_and_errors" page
