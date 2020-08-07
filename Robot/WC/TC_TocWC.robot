*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Test Setup          Go to WebHelp Page
Test Teardown       Switch Window      Every Angle - Search page
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Variables ***
${SubjcetItemInToc}             Introduction

*** Test Cases ***
Verify Expand And Collapse Items In Webhelp ToC
    [Tags]      TC_C230012
    [Documentation]     Verifying expand and collapse items in the navigation tree on the left panel Webhelp ToC.
    Switch Window     Every Angle Web Client
    Expand/Collapse Subject Item In Webhelp Page Toc       ${SubjcetItemInToc}
    Verify Expanded Item In Webhelp Page Toc
    Expand/Collapse Subject Item In Webhelp Page Toc       ${SubjcetItemInToc}