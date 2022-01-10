*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Close Browser
Test Teardown       Run Keywords  Empty Download Directory  AND  Go to Search Page
Force Tags        	acc_wc_s

*** Variables ***
${excelTemplateName}                RobotEaExcelTemplate.xlsx
${fileExcelTemplate}                ${EXECDIR}/resources/${excelTemplateName}
${defaultExcelTemplateName}         EveryAngle-Standard.xlsx

*** Test Cases ***
Verify Export To Excel From Action Menu
    [Documentation]     This Test Verify Export Angle To Excel, Add Definitions Sheet Checkbox and Option for selecting 
    ...                 Default Excel Template as well as Option for overruling  Default Excel Template on fly for a Display.
    [Tags]  acc_wc_aci_s   TC_C229226     TC_C229326     TC_C230144
    ${angleName}  Set Variable  Angle For General Test
    ${timeStamp}  Get Time    epoch
    ${newExcelTemplateName1}  Set Variable  RobotEaTestExcelTemplate1_${timeStamp}.xlsx
    ${newfileExcelTemplate1}  Set Variable  ${EXECDIR}/resources/${newExcelTemplateName1}
    Copy File   ${fileExcelTemplate}     ${newfileExcelTemplate1}
    ${newExcelTemplateName2}  Set Variable  RobotEaTestExcelTemplate2_${timeStamp}.xlsx
    ${newfileExcelTemplate2}  Set Variable  ${EXECDIR}/resources/${newExcelTemplateName2}
    Copy File   ${fileExcelTemplate}     ${newfileExcelTemplate2}

    # upload templates
    Go to MC Then Login With Admin User
    Go To ExcelTemplates Page
    Verify Upload Excel Template In Excel Template Page      ${newfileExcelTemplate1}    ${newExcelTemplateName1}
    Remove File  ${newfileExcelTemplate1}
    Verify Upload Excel Template In Excel Template Page      ${newfileExcelTemplate2}    ${newExcelTemplateName2}
    Remove File  ${newfileExcelTemplate2}
    Switch Browser  1

    Search Angle From Search Page And Execute Angle    ${angleName}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Display Tab
    Selected Excel Template Should Be       [Use default] ${defaultExcelTemplateName}
    Select Excel Template To    ${newExcelTemplateName1}
    Save Selected Excel Template
    Reload Angle Page
    Selected Excel Template Should Be   ${newExcelTemplateName1}
    Click Angle Dropdown To Export Excel
    Click Check Add Summary Sheet
    Click Check Add Definition Sheet
    Input Excel File Name Should Be    ${angleName}
    Selected Excel Template in Export to Excel Pop up Should Be   ${newExcelTemplateName1}
    Select Excel Template in Export to Excel Pop up To   ${newExcelTemplateName2}
    Selected Excel Template in Export to Excel Pop up Should Be   ${newExcelTemplateName2}    
    Click Export Excel Button
    ${files}    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File    ${angleName}.xlsx
    Check For The Selected Excel Template And The Existence Of Definitions Sheet In Excel File      ${files[0]}

    # remove uploaded templates
    Switch Browser    2
    Verify Delete Excel Template In Excel Template Page      ${newExcelTemplateName1}
    Verify Delete Excel Template In Excel Template Page      ${newExcelTemplateName2}
    Logout MC Then Close Browser

    Switch Browser    1
    Reload Angle Page
    Selected Excel Template Should Be       ${newExcelTemplateName1}

# Will be enabled in M4-99070
# Verify Export Item Drilldown To Excel From Action Menu
#     ${angleName}  Set Variable  Angle For General Test
#     Search Angle From Search Page And Execute Angle    ${angleName}
#     Check If Angle Or Display Has A Warning Then Close The Popup
#     Click Drilldown To Item By Name    IDES Consumer Products
#     Select Filter "Reference" On Drilldown To Item
#     Click Angle Dropdown To Export Drilldown To Excel
#     Wait Progress Bar Closed
#     Select Excel Template in Export to Excel Pop up To  ${defaultExcelTemplateName}
#     Click Export Drilldown To Excel Button
#     Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
#     Wait Until Export Excel Popup Close

Verify Error Message If A Filename Is Too Long
    [Tags]  TC_C230013
    ${angleName}  Set Variable  Angle For General Test
    Search Angle From Search Page And Execute Angle    ${angleName}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Angle Dropdown To Export Excel
    Input Excel File Name Should Be    ${angleName}
    ${filename}   Set Variable  Export angle to excel with such a long filename. A filename of 200 characters should be allowed. Since the windows max path length is 260, this could lead to a path too long exception, when this happens, show the error message to the user.
    Input Excel File Name    ${filename}
    Select Excel Template in Export to Excel Pop up To  ${defaultExcelTemplateName}
    Click Export Excel Button
    Wait Until Page Contains    Full name of the file exceeds Windows limitations (260 characters).

Verify Export Field Names Contain Special Charactor
    [Documentation]     This Test Verifies Export Field Names Contain Special Charactor
    ...                 and Default Excel Datastores Values in Export to Excel Pop Up.
    [Tags]  acc_wc_aci_s
    ${angleName}  Set Variable  ANGLE_Pivot_fields_contain_special_characters
    Search Angle From Search Page And Execute Angle    ${angleName}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Angle Dropdown To Export Excel
    Check Default Excel Datastore values in Export to Excel
    Click Export Excel Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File   ${angleName}.xlsx

Verify Correct Filter Value Updated On Excel Export For Execution Parameters     
    [Documentation]     Execute an angle with angle and display filter. Execution parameter pop-up should appear to enter the input
    ...                 Export to excel and verify correct Filters and Jumps value are updated under the section Angle Details Definition on Summary Sheet
    ...                 Risk/coverage area: Correct filter value are updated on export to excel
    [Tags]    TC_C232790
    ${angleName}  Set Variable  Verify Execution Parameters Behavior
    Upload Item And Check From Search Result  ANGLE_ExecutionParametersBehavior.angle.json    EA2_800    ${angleName}
    Click Link Item From Search Result Not Execute Popup    ${angleName}
    Wait Until Angle Execute Parameters Popup Loaded
    Input Angle Section Filter Text In List  0  2
    Input Display Section Filter Text In List  0  31
    Click Submit Angle Execution Parameters
    ${expectedAngleFilterResult}=      Get Angle Filters
    ${expectedDisplayFilterResult}=     Get Display Filters
    Click Angle Dropdown To Export Excel
    Click Check Add Summary Sheet
    Input Excel File Name    ${angleName}
    Click Export Excel Button
    ${files}    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export Excel Popup Close
    Download Should Contain File   ${angleName}.xlsx
    Check For The Correct Execute Parameter Filter Updated in the Summary Sheet In Excel File  ${files[0]}      ${expectedAngleFilterResult}      ${expectedDisplayFilterResult}
    Back To Search And Delete Angle Are Created    ${angleName}