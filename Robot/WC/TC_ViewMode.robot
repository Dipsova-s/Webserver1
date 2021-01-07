*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Variables ***
${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}         Angle For General Test

*** Test Cases ***
Verify Search Viewmode
    [Documentation]    This test case Verifyies Displays view mode in search page
    [Tags]   acc_wc_aci_s    TC_C231830
    [Setup]  Import Angle By API  /models/1  ANGLE_HIGHLIGHT.json  user=${Username}

    # compact mode
    Search By Text Without Double Quote    "wwww vvvv" yyyy zzzz
    Click Change View To Compact Mode
    Check Elements On Compact Mode
    Check Hightlight On Compact Mode
    Reload Search Page
    Check Elements On Compact Mode
    Check Hightlight On Compact Mode
    Logout
    Login To WC By Power User
    Search By Text Without Double Quote    "wwww vvvv" yyyy zzzz
    Check Elements On Compact Mode
    Check Hightlight On Compact Mode

    # displays mode
    Click Change View To Displays Mode
    Check Elements On Displays Mode
    Check Hightlight On Displays/Detail Mode    wwww vvvv    yyyy    zzzz
    Reload Search Page
    Check Elements On Displays Mode
    Check Hightlight On Displays/Detail Mode    wwww vvvv    yyyy    zzzz
    Logout
    Login To WC By Power User
    Search By Text Without Double Quote    "wwww vvvv" yyyy zzzz
    Check Elements On Displays Mode
    Check Hightlight On Displays/Detail Mode    wwww vvvv    yyyy    zzzz

    [Teardown]  Clean Up Items And Go To Search Page

Verify Field Chooser Remember Detail Setting Test
    [Documentation]      This test case Verifyies remembered state of view mode
    [Tags]    TC_C231830
    Search Angle From Search Page And Execute Angle    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Click Add New Column To List
    Click Set Field Chooser View To Full Mode
    Wait Until Page Contains Element    ${divFieldChooserDetail}
    Element Should Be Visible    ${divFieldChooserDetail}
    Click Insert Field From Field Chooser

    Logout
    Login To WC By Power User

    Search Angle From Search Page And Execute Angle    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Click Add New Column To List
    Element Should Be Visible    ${divFieldChooserDetail}
    Click Set Field Chooser View To Compact Mode
    Element Should Not Be Visible    ${divFieldChooserDetail}
    Click Insert Field From Field Chooser
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Click Add New Column To List
    Element Should Not Be Visible    ${divFieldChooserDetail}

    [Teardown]  Run Keyword    Go to Search Page