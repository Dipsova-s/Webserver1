*** Variables ***
${txtFitlerObjects}                             txtFitlerObjects
${btnFitlerObjects}                             btnFitlerObjects
${btnObjectListBack}                            btn-popupCreateNewAngle2
${divObjectListDescriptionSection}              css=#Angle .helpTextContainer
${divObjectListBusinessProcessBarSection}       CreateAngleByObjectBusinessProcess
${pgbCreateAngleByObjectList}                   css=#ObjectsGrid .k-loading-mask
${btnCreateNewAngleByObjectList}                btn-popupCreateNewAngle0
${gridObjectList}                               css=#ObjectsGrid
${chkObjectsFromList}                           jquery=#ObjectsGrid .k-grid-content tr input
${btnCloseAngleDetailPopup}                     css=.popupAngleDetail .k-i-close
${trObjectsDescriptionFromList}                 jquery=#ObjectsGrid .k-grid-content tr
${lbNumberOfObjectBusinessProcess}              classTotals
${divBusinessProcess}                           CreateAngleByObjectBusinessProcess

*** Keywords ***
Wait Create Angle Popup Option Object List Loaded
    Wait Until Page Contains Element     ${txtFitlerObjects}
    Wait Until Page Contains Element     ${btnFitlerObjects}
    Wait Until Page Contains Element     ${divObjectListDescriptionSection}    60s
    Wait Until Page Contains Element     ${gridObjectList}
    Wait Until Page Contains Element     ${divObjectListBusinessProcessBarSection}
    Wait Until Page Contains Element     ${btnObjectListBack}
    Wait Until Page Contains Element     ${btnCreateNewAngleByObjectList}
    Wait Until Ajax Complete

Open Create Angle By Object List Popup
    Click Create Angle Button
    Click Object List Button
    Wait Until Ajax Complete
    Wait Create Angle Popup Option Object List Loaded

Click Back Create Angle Popup Option Object List Loaded
    Click Link    ${btnObjectListBack}

Fill In Search Create Angle By Object List Popup
    [Arguments]   ${searchData}
    Input Text    ${txtFitlerObjects}    ${searchData}
    Wait Until Ajax Complete

Click Object From List
    [Arguments]   ${index}
    Wait Until Page Contains Element    ${chkObjectsFromList}:eq(${index})
    Page Should Contain Checkbox    ${chkObjectsFromList}:eq(${index})
    Select Checkbox    ${chkObjectsFromList}:eq(${index})

Unselect Object From List
    [Arguments]   ${index}
    Wait Until Page Contains Element    ${chkObjectsFromList}:eq(${index})
    Page Should Contain Checkbox    ${chkObjectsFromList}:eq(${index})
    Unselect Checkbox    ${chkObjectsFromList}:eq(${index})

Click First Object from List
    Click Object From List    0

Click Second Object from List
    Click Object From List    1

Click N Objects From list
    [Arguments]    ${n}
    : FOR    ${INDEX}    IN RANGE    0    ${n}
    \   Click Object From List     ${INDEX}

Click Create New Angle from Object List Button
    Click Link    ${btnCreateNewAngleByObjectList}
    Sleep    ${TIMEOUT_GENERAL}
    ${selectObjectCount}    Get Element Count    ${chkObjectsFromList}:checked
    Run Keyword If    ${selectObjectCount} > 1    Click Confirm Warning Create Angle Popup Button

Close Angle Popup Detail
    Click Element    ${btnCloseAngleDetailPopup}

Click Object Description From List
    [Arguments]   ${index}
    Wait Until Page Contains Element    ${trObjectsDescriptionFromList}:eq(${index}) td:eq(2)
    Page Should Contain Element    ${trObjectsDescriptionFromList}:eq(${index}) td:eq(2)
    Click Element    ${trObjectsDescriptionFromList}:eq(${index}) td:eq(2)

Check Object List Is Hightlight
    [Arguments]   ${index}
    Wait Until Page Contains Element    ${trObjectsDescriptionFromList}:eq(${index})
    ${isHightLight}   Is Element Has CssClass    ${trObjectsDescriptionFromList}:eq(${index})   k-state-selected
    [return]    ${isHightLight}

Check Object List Is Checked
    [Arguments]   ${index}
    Wait Until Page Contains Element    ${chkObjectsFromList}:eq(${index})
    ${isChecked}    Is Element Checked    ${chkObjectsFromList}:eq(${index})
    [return]    ${isChecked}

Get Number Of Object In Business Process
    Wait Until Page Contains Element    ${lbNumberOfObjectBusinessProcess}
    ${result}    Get Number From Element Text    ${lbNumberOfObjectBusinessProcess}
    [return]    ${result}

Click Select Or Deselect Business Process In Object List
    [Arguments]    ${businessProcessName}
    Wait Until Page Contains Element    css=#${divBusinessProcess} .${businessProcessName}
    Click Element    css=#${divBusinessProcess} .${businessProcessName}
    Wait Until Ajax Complete

