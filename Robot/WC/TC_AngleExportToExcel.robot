*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Empty Download Directory
Test Teardown       Go to Search Page
Force Tags        	acceptance     acc_wc

*** Variables ***
${TEST_VERIFY_EXPORT_TO_EXCEL_NAME}                     Export Extended Charactor.Béßø<>
${TEST_VERIFY_EXPORT_DRILLDOWN_TO_EXCEL_NAME}           [ROBOT] Verify Export Drilldown To Excel
${LONG_FILE_NAME}    Export angle to excel with such a long filename. A filename of 200 characters should be allowed. Since the windows max path length is 260, this could lead to a path too long exception, when this happens, show the error message to the user.
${ERROR_MESSAGE}     Full name of the file exceeds Windows limitations (260 characters).

*** Test Cases ***
Verify Export To Excel From Action Menu
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
    Create Angle From One Object List And Save    PD Header    ${TEST_VERIFY_EXPORT_DRILLDOWN_TO_EXCEL_NAME}
    Wait Progress Bar Closed
    Wait Until List Display Loaded
    Change Display By Name    Basic List
    Click Drilldown To Item By Name    Aztec Supplies
    Click Angle Dropdown To Export Drilldown To Excel
    Click Export Drilldown To Excel Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
    Wait Unit Export Excel Popup Close
    Back To Search And Delete Angle Are Created    ${TEST_VERIFY_EXPORT_DRILLDOWN_TO_EXCEL_NAME}

Verify Error Message If A Filename Is Too Long
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_EXPORT_TO_EXCEL_NAME}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Input Text    ${txtFileName}    ${LONG_FILE_NAME}
    Click Export Excel Button
    Wait Until Page Contains    ${ERROR_MESSAGE}

