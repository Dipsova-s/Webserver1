*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Run Keywords  Empty Download Directory  AND  Go to Search Page
Force Tags        	acc_wc

*** Variables ***
${excelTemplateName}                RobotEaTestExcelTemplate.xlsx
${excelTemplateName1}               RobotEaTestExcelTemplate1.xlsx
${fileExcelTemplate}                ${EXECDIR}/resources/${excelTemplateName}
${fileExcelTemplate1}               ${EXECDIR}/resources/${excelTemplateName1}
${defaultExcelTemplateName}         EveryAngle-Standard.xlsx

*** Test Cases ***
Verify Export To Excel From Action Menu
    [Documentation]     This Test Verify Export Angle To Excel, Add Definitions Sheet Checkbox and Option for selecting 
    ...                 Default Excel Template as well as Option for overruling  Default Excel Template on fly for a Display.
    [Tags]  acc_wc_aci   TC_C229226     TC_C229326     TC_C230144
    ${angleName}  Set Variable  Angle For General Test
    ${fileNamePlaceholder}     Set Variable   Angle For General Test
    ${timeStamp}  Get Time    epoch
    ${newExcelTemplateName}  Set Variable  RobotEaTestExcelTemplate_${timeStamp}.xlsx
    ${newfileExcelTemplate}  Set Variable  ${EXECDIR}/resources/${newExcelTemplateName}
    Move File   ${fileExcelTemplate}     ${newfileExcelTemplate}
    ${newExcelTemplateName1}  Set Variable  RobotEaTestExcelTemplate1_${timeStamp}.xlsx
    ${newfileExcelTemplate1}  Set Variable  ${EXECDIR}/resources/${newExcelTemplateName1}
    Move File   ${fileExcelTemplate1}     ${newfileExcelTemplate1}
    Go to MC Then Login With Admin User
    Go To ExcelTemplates Page
    Verify Upload Excel Template In Excel Template Page      ${newfileExcelTemplate}    ${newExcelTemplateName}
    Verify Upload Excel Template In Excel Template Page      ${newfileExcelTemplate1}    ${newExcelTemplateName1}
    Switch Browser  1
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Display Tab
    Selected Excel Template Should Be       [User default] ${defaultExcelTemplateName}
    Select Excel Template To    ${newExcelTemplateName}
    Save Selected Excel Template
    Reload Angle Page
    Selected Excel Template Should Be   ${newExcelTemplateName}
    Click Angle Dropdown To Export Excel    
    Wait Progress Bar Closed
    Click Check Add Summary Sheet
    Click Check Add Definition Sheet
    Input Excel File Name Should Be    ${fileNamePlaceholder}
    ${fileNamePlaceholder}     Set Variable   ${angleName}
    Input Excel File Name     ${fileNamePlaceholder}
    Input Excel File Name Should Be    ${angleName}
    Selected Excel Template in Export to Excel Pop up Should Be   ${newExcelTemplateName}
    Select Excel Template in Export to Excel Pop up To   ${newExcelTemplateName1}
    Selected Excel Template in Export to Excel Pop up Should Be   ${newExcelTemplateName1}    
    Click Export Excel Button
    ${files}    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File    ${angleName}.xlsx
    Check For The Selected Excel Template And The Existence Of Definitions Sheet In Excel File      ${files[0]}
    Switch Browser    2
    Verify Delete Excel Template In Excel Template Page      ${newExcelTemplateName}
    Verify Delete Excel Template In Excel Template Page      ${newExcelTemplateName1}
    Logout MC Then Close Browser
    Switch Browser    1
    Reload Angle Page
    Selected Excel Template Should Be       [User default] ${defaultExcelTemplateName}

Verify Export Item Drilldown To Excel From Action Menu
    ${angleName}  Set Variable  Angle For General Test
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Drilldown To Item By Name    IDES Consumer Products
    Select Filter "Reference" On Drilldown To Item
    Click Angle Dropdown To Export Drilldown To Excel
    Wait Progress Bar Closed
    Click Export Drilldown To Excel Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close

Verify Error Message If A Filename Is Too Long
    [Tags]  TC_C230013
    ${angleName}  Set Variable  Angle For General Test
    ${fileNamePlaceholder}     Set Variable   Angle For General Test
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Wait Progress Bar Closed
    Input Excel File Name Should Be    ${fileNamePlaceholder}
    ${filename}   Set Variable  Export angle to excel with such a long filename. A filename of 200 characters should be allowed. Since the windows max path length is 260, this could lead to a path too long exception, when this happens, show the error message to the user.
    Input Excel File Name    ${filename}
    Click Export Excel Button
    Wait Until Page Contains    Full name of the file exceeds Windows limitations (260 characters).

Verify Export Field Names Contain Special Charactor
    [Documentation]     This Test Verifies Export Field Names Contain Special Charactor
    ...                 and Default Excel Datastores Values in Export to Excel Pop Up.
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  ANGLE_Pivot_fields_contain_special_characters
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown To Export Excel
    Wait Progress Bar Closed
    Check Default Excel Datastore values in Export to Excel
    Click Export Excel Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File   ${angleName}.xlsx
