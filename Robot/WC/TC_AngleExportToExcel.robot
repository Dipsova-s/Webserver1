*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Run Keywords  Empty Download Directory  AND  Go to Search Page
Force Tags        	acc_wc

*** Test Cases ***
Verify Export To Excel From Action Menu
    [Documentation]     This Test Verify Export Angle To Excel and Add Definitions Sheet Checkbox.
    [Tags]  acc_wc_aci   TC_C229226
    ${angleName}  Set Variable  Angle For General Test
    ${fileNamePlaceholder}     Set Variable   {modeltimestamp}{anglename:normalized}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Click Check Add Definition Sheet
    Input Excel File Name Placeholder Should Be    ${fileNamePlaceholder}
    ${fileNamePlaceholder}     Set Variable   ${angleName}
    Input Excel File Name     ${fileNamePlaceholder}
    Click Export Excel Button
    ${files}    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Unit Export Excel Popup Close
    Download Should Contain File    ${angleName}.xlsx
    Check The Existence Of Definitions Sheet In Excel File      ${files[0]}

Verify Export Item Drilldown To Excel From Action Menu
    ${angleName}  Set Variable  Angle For General Test
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Drilldown To Item By Name    IDES Consumer Products
    Select Filter "Reference" On Drilldown To Item
    Click Angle Dropdown To Export Drilldown To Excel
    Click Export Drilldown To Excel Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Unit Export Excel Popup Close

Verify Error Message If A Filename Is Too Long
    ${angleName}  Set Variable  Angle For General Test
    ${fileNamePlaceholder}     Set Variable   {modeltimestamp}{anglename:normalized}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Input Excel File Name Placeholder Should Be    ${fileNamePlaceholder}
    ${filename}   Set Variable  Export angle to excel with such a long filename. A filename of 200 characters should be allowed. Since the windows max path length is 260, this could lead to a path too long exception, when this happens, show the error message to the user.
    Input Excel File Name    ${filename}
    Click Export Excel Button
    Wait Until Page Contains    Full name of the file exceeds Windows limitations (260 characters).

Verify Export Field Names Contain Special Charactor
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  ANGLE_Pivot_fields_contain_special_characters
    ${fileNamePlaceholder}     Set Variable   {modeltimestamp}{anglename:normalized}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Input Excel File Name Placeholder Should Be    ${fileNamePlaceholder}
    ${fileNamePlaceholder}     Set Variable   ${angleName}
    Input Excel File Name     ${fileNamePlaceholder}
    Click Export Excel Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Unit Export Excel Popup Close
    Download Should Contain File   ${angleName}.xlsx
