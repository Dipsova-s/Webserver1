*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Test Setup          Go to Web Help Page of IT MC
Test Teardown       Switch Window      IT Management Console
Suite Teardown      Close Browser
Force Tags          acc_mc

*** Variables ***
${SubjectItemInTOC}             Introduction

*** Test Cases ***
Verify Expand And Collapse Items In IT MC Webhelp ToC
    [Tags]      TC_C230864
    [Documentation]     Verifying direct navigation to Introduction page, expand/collapse items in the navigation tree on the left
    ...                 panel and navigation to pages using search, breadcrumbs links & items link in IT MC Webhelp.
    Switch Window     Introduction
    Header text of Web Help Page Should Be     Introduction
    Verify Expanded Item In IT MC Webhelp Page TOC
    Expand/Collapse Subject Item In Webhelp Page TOC       ${SubjectItemInTOC}
    Verify Collapsed Item In IT MC Webhelp Page TOC
    Expand/Collapse Subject Item In Webhelp Page TOC       ${SubjectItemInTOC}
    Verify Expanded Item In IT MC Webhelp Page TOC    
    Header text on Navigating to Sub section page Should be     Comments
    Header text On Navigating to Sub section page using Breadcrumb link Should be   Introduction    Introduction
    Header text on Navigating to Main page of a Section Should be   Introduction
    Header text of a page on clicking an Item link in left panel Should Be  Comments    Comments
    Search for Item using Search bar in IT MC Web Help      Models
    Header text of Web Help Page Should Be      Models