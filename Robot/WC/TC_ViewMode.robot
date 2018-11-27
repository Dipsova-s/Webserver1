*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acceptance_s     acc_wc_s

*** Variables ***
${TEST_FIELD_CHOOSER_REMEMBER_DETAIL_SETTING}         Angle For General Test

*** Test Cases ***
Verify Search Viewmode
    @{cleanUpItems}    Create List
    Create Context: Web    ${Username}    ${Password}
    ${angleData}    Create Angle    /models/1    ANGLE_HIGHLIGHT.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

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

    # details mode
    Click Change View To Detail Mode
    Check Elements On Detail Mode
    Check Hightlight On Displays/Detail Mode    wwww vvvv    yyyy    zzzz
    Reload Search Page
    Check Elements On Detail Mode
    Check Hightlight On Displays/Detail Mode    wwww vvvv    yyyy    zzzz
    Logout
    Login To WC By Power User
    Search By Text Without Double Quote    "wwww vvvv" yyyy zzzz
    Check Elements On Detail Mode
    Check Hightlight On Displays/Detail Mode    wwww vvvv    yyyy    zzzz

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}
    ...         AND           Go to Search Page

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

    [Teardown]  Run Keyword    Go to Search Page