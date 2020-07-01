*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Run Keywords  Empty Download Directory  AND  Go to Search Page
Force Tags        	acc_wc

*** Variables ***
${excelTemplateName}                RobotEaTestExcelTemplate.xlsx
${fileExcelTemplate}                ${EXECDIR}/resources/${excelTemplateName}
${defaultExcelTemplateName}         EveryAngle-Standard.xlsx

*** Test Cases ***
Verify Export To Excel From Action Menu
    [Documentation]     This Test Verify Export Angle To Excel, Add Definitions Sheet Checkbox
    ...                 and Option for Selecting Default Excel Template for a Display.
    [Tags]  acc_wc_aci   TC_C229226     TC_C229326
    ${angleName}  Set Variable  Angle For General Test
    ${fileNamePlaceholder}     Set Variable   {modeltimestamp}{anglename:normalized}
    ${timeStamp}  Get Time    epoch
    ${newExcelTemplateName}  Set Variable  RobotEaTestExcelTemplate_${timeStamp}.xlsx
    ${newfileExcelTemplate}  Set Variable  ${EXECDIR}/resources/${newExcelTemplateName}
    Move File   ${fileExcelTemplate}     ${newfileExcelTemplate}
    Go to MC Then Login With Admin User
    Go To ExcelTemplates Page
    Verify Upload Excel Template In Excel Template Page      ${newfileExcelTemplate}    ${newExcelTemplateName}
    ${countExcelTemplatesITMC}  Get Count Excel Templates
    ${listExcelTemplatesITMC}   Get List Excel Templates
    Switch Browser  1
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Display Tab
    Selected Excel Template Should Be       [Default] ${defaultExcelTemplateName}
    ${countExcelTemplatesWC}    Get Excel Templates Count
    ${listExcelTemplatesWC}    Get Excel Templates List
    Should Be Equal     ${countExcelTemplatesITMC}   ${countExcelTemplatesWC}
    Lists Should Be Equal   ${listExcelTemplatesITMC}   ${listExcelTemplatesWC}
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
    Click Export Excel Button
    ${files}    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File    ${angleName}.xlsx
    Check For The Selected Excel Template And The Existence Of Definitions Sheet In Excel File      ${files[0]}
    Switch Browser    2
    Verify Delete Excel Template In Excel Template Page      ${newExcelTemplateName}
    Logout MC Then Close Browser
    Switch Browser    1
    Reload Angle Page
    Selected Excel Template Should Be       [Default] ${defaultExcelTemplateName}

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
    ${angleName}  Set Variable  Angle For General Test
    ${fileNamePlaceholder}     Set Variable   {modeltimestamp}{anglename:normalized}
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
    ${modelDateTimeStamp}   Get Model Date Time
    ${formattedmodelDateTimeStamp}     Get Formatted Date Time Stamp   ${modelDateTimeStamp}   %Y%m%d%H%M%S
    Click Angle Dropdown To Export Excel
    Wait Progress Bar Closed
    Check Default Excel Datastore values in Export to Excel
    Click Export Excel Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File   ${formattedmodelDateTimeStamp}${angleName}.xlsx
