*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance_s     acc_wc_s

*** Variables ***
${TEST_SEARCH_REMEMBER_DETAIL_SETTING}         Angle For General Test
${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}         Angle For General Test

*** Test Cases ***
Verify Search Remember Detail Setting By Search Box Test
    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Click Search Filter Angle
    Click Change View To Compact Mode
    Check Existing Angle From Search Result     ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Open Angle From First Angle in Search Page    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Back To Search
    Element Should Not Be Visible    ${divContentDetail}

    Click Search Filter Angle
    Check Existing Angle From Search Result     ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Element Should Not Be Visible    ${divContentDetail}

    Logout
    Login To WC By Power User

    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Click Search Filter Angle
    Check Existing Angle From Search Result     ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Click Change View To Detail Mode
    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Open Angle From First Angle in Search Page    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Back To Search
    Element Should Be Visible    ${divContentDetail}

Verify Field Chooser Remember Detail Setting Test
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
