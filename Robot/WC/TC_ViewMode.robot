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
Verify Search Viewmode
    # compact mode
    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Click Change View To Compact Mode
    Check Elements On Compact Mode
    Open Angle From First Angle in Search Page    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Back To Search
    Check Elements On Compact Mode
    Logout
    Login To WC By Power User
    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Check Elements On Compact Mode

    # displays mode
    Click Change View To Displays Mode
    Check Elements On Displays Mode
    Open Angle From First Angle in Search Page    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Back To Search
    Check Elements On Displays Mode
    Logout
    Login To WC By Power User
    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Check Elements On Displays Mode

    # details mode
    Click Change View To Detail Mode
    Check Elements On Detail Mode
    Open Angle From First Angle in Search Page    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Back To Search
    Check Elements On Detail Mode
    Logout
    Login To WC By Power User
    Search By Text And Expect In Search Result    ${TEST_SEARCH_REMEMBER_DETAIL_SETTING}
    Check Elements On Detail Mode

Verify Field Chooser Remember Detail Setting Test
    Search By Text And Expect In Search Result    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Open Angle From First Angle in Search Page    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Click Add New Column To List
    Click Set Field Chooser View To Full Mode
    Wait Until Page Contains Element    ${divFieldChooserDetail}
    Element Should Be Visible    ${divFieldChooserDetail}
    Click Insert Field From Field Chooser

    Logout
    Login To WC By Power User

    Search By Text And Expect In Search Result    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Open Angle From First Angle in Search Page    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Click Add New Column To List
    Element Should Be Visible    ${divFieldChooserDetail}
    Click Set Field Chooser View To Compact Mode
    Element Should Not Be Visible    ${divFieldChooserDetail}
    Click Insert Field From Field Chooser
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Open Angle From First Angle in Search Page    ${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}
    Click Add New Column To List
    Element Should Not Be Visible    ${divFieldChooserDetail}
