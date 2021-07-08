*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Test Setup          Go to Web Help Page of WC
Test Teardown       Switch Window      Every Angle - Search page
Suite Teardown      Close Browser
Force Tags          acc_wc

*** Variables ***
${SubjectItemInTOC}             Introduction

*** Test Cases ***
Verify Expand And Collapse Items In WC Webhelp ToC
    [Tags]      TC_C230012
    [Documentation]     Verifying direct navigation to Introduction page, expand/collapse items in the navigation tree on
    ...                 the left panel and navigation to pages using items link in WC Webhelp.
    Switch Window     Introduction
    Header text of Web Help Page Should Be     Introduction
    Expand/Collapse Subject Item In Webhelp Page TOC       ${SubjectItemInTOC}
    Verify Expanded Item In Webhelp Page TOC
    Expand/Collapse Subject Item In Webhelp Page TOC       ${SubjectItemInTOC}
    Verify Collapsed Item In Webhelp Page TOC
    Expand/Collapse Subject Item In Webhelp Page TOC       ${SubjectItemInTOC}
    Header text of a page on clicking an Item link in left panel Should Be       Supporting concepts     Supporting concepts