*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page

*** Variables ***
@{descEng}    en    English Name    English Description
@{descNl}     nl    Dutch Name      Dutch Description
@{descFr}     fr    French Name     French Description

*** Test Cases ***
Verify Angle & Display Statistics
    [Documentation]     Angle statistics
    [Tags]              smk_wc  C229139  C229140
    ${angleName}  Set Variable  [ROBOT] Test Verify Angle Statistics
    Create Adhoc Angle From Object List    PD    ${angleName}

    # adhoc
    Verify Adhoc Angle Statistics
    Verify Adhoc Display Statistics

    # saved
    Click Save All
    Verify Saved Angle Statistics
    Verify Saved Display Statistics

    # edit mode
    Go to Search Page
    Search By Text And Expect In Search Result  ${angleName}
    Execute First Search Item In Edit Mode
    Verify Edit Mode Angle Statistics
    Verify Edit Mode Display Statistics

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Verify Last Angle Execute Time
    [Documentation]     Angle statistics
    [Tags]    smk_wc        C229139
    Verify Last Execute Time Angle     Angle For General Test

Verify Angle Descriptions
    [Tags]    acc_wc
    ${angleName}  Set Variable  [ROBOT] Test Verify Angle Description With Multi Languages
    Create Adhoc Angle From Object List    PD    ${angleName}

    ${data}=   Create List    ${descEng}  ${descNl}   ${descFr}
    Edit Angle Descriptions    ${data}    isAdhoc=${True}

    Assert Values Edit Angle Description    en    English Name    English Description
    Assert Values Edit Angle Description    nl    Dutch Name    Dutch Description
    Assert Values Edit Angle Description    fr    French Name    French Description
    Click Save All

    Edit Angle Description   en    ${angleName}    ${EMPTY}
    Delete Language Edit Angle Description    nl

    Language Should Contain Edit Angle Description    en
    Language Should Not Contain Edit Angle Description    nl

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}
    