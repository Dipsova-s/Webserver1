*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Empty Download Directory
Test Teardown       Go to Search Page
Force Tags        	acc_wc

*** Variables ***
${TEST_VERIFY_EXPORT_TO_EXCEL_NAME}                     Export Extended Charactor.Béßø<>
${TEST_VERIFY_EXPORT_FIELDS_CONTAIN_SPECIAL_CHAR}       ROBOT_ANGLE_Pivot_fields_contain_special_characters
${LONG_FILE_NAME}    Export angle to excel with such a long filename. A filename of 200 characters should be allowed. Since the windows max path length is 260, this could lead to a path too long exception, when this happens, show the error message to the user.
${ERROR_MESSAGE}     Full name of the file exceeds Windows limitations (260 characters).

*** Test Cases ***
Verify Export To Excel From Action Menu
    [Tags]  acc_wc_aci
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_EXPORT_TO_EXCEL_NAME}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    ${fileName}    Get Value    ${txtFileName}
    Should Be Equal    ${fileName}    Export Extended Charactor.Béßø
    Click Export Excel Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
    Should Contain    ${file}    Export Extended Charactor.Béßø.xlsx

Verify Export Item Drilldown To Excel From Action Menu
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Drilldown To Item By Name    IDES Consumer Products
    Select Filter "Reference" On Drilldown To Item
    Click Angle Dropdown To Export Drilldown To Excel
    Click Export Drilldown To Excel Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
    Wait Unit Export Excel Popup Close

Verify Error Message If A Filename Is Too Long
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_EXPORT_TO_EXCEL_NAME}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Input Text    ${txtFileName}    ${LONG_FILE_NAME}
    Click Export Excel Button
    Wait Until Page Contains    ${ERROR_MESSAGE}

Verify Export Field Names Contain Special Charactor
    [Tags]  acc_wc_aci
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_EXPORT_FIELDS_CONTAIN_SPECIAL_CHAR}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    ${fileName}    Get Value    ${txtFileName}
    Should Be Equal    ${fileName}    ROBOT_ANGLE_Pivot_fields_contain_special_characters
    Click Export Excel Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
    Should Contain    ${file}    ROBOT_ANGLE_Pivot_fields_contain_special_characters.xlsx
