*** Variables ***
${btnSaveAngleWarning}             css=.btnSave

${chkPublishedItems}               include_public
${chkPrivateItems}                 include_private
${chkIncludeValidateItems}         include_validated

${txtCreatedBy}                    created_by
${btnSearchAngleWarning}           ButtonSearch

${lbAngleTotal}                    AnglesTotal
${lbDisplaysTotal}                 DisplaysTotal
${lbErrorsTotal}                   ErrorsTotal
${lbWarningsTotal}                 WarningsTotal

${trRowInAngleWarning}             jquery=#AngleWarningsTreeListContainer tbody tr
${btnExpandWarning}                .k-i-expand
${btnCollapseWarning}              .k-i-collapse
${chkSelectWarning}                input[type=checkbox]

${ddlAction}                       .k-dropdown
${ddlOptionNoAction}               option:contains("No action")
${ddlOptionDeleteDisplay}          option:contains("Delete display")
${ddlOptionReplaceField}           option:contains("Replace field")
${ddlOptionRemoveColumn}           option:contains("Remove column")
${ddlOptionReplaceStartObject}     option:contains("Replace start object")
${ddlOptionDeleteAngle}            option:contains("Delete angle")
${btnExecuteAction}                .btnExecuteAction
${txtReplaceField}                 .replaceField
${txtReplaceObject}                .replaceObject

${btnConfirmExecute}               .btnSubmit

#Select Object ReplacePopup
${pgbSelectObjectReplace}           jquery=.CreateNewAngleContainer .k-loading-mask
${txtFitlerObjects}                 txtFitlerObjects
${chkObjectsFromList}               jquery=#ObjectsGrid .k-grid-content tr input
${btnSubmitCreateObject}       ButtonSubmitObject

*** Keywords ***
Click Published Items
    Wait Until Page Contains Element    ${chkPublishedItems}
    Click Element    ${chkPublishedItems}

Click Private Items
    Wait Until Page Contains Element    ${chkPrivateItems}
    Click Element    ${chkPrivateItems}

Click Include Validated Item
    Wait Until Page Contains Element    ${include_validated}
    Click Element    ${include_validated}

Input User For Filter Angle Warning
    [Arguments]    ${valueText}
    Input Text    ${txtCreatedBy}    ${valueText}

Click Search Angle Warning
    Wait Until Page Contains Element    ${btnSearchAngleWarning}
    Click Element    ${btnSearchAngleWarning}

Click Expand Angle Warning By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${btnExpandWarning}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${btnExpandWarning}
    Wait MC Progress Bar Closed

Click Collapse Angle Warning By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${btnCollapseWarning}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${btnCollapseWarning}

Click Select Angle Warning By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${chkSelectWarning}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${chkSelectWarning}

Click Open Dropdown Option Angle Warning By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlAction}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlAction}

Click Dropdown Option No Action By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionNoAction}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionNoAction}

Click Dropdown Option Delete Display By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionDeleteDisplay}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionDeleteDisplay}

Click Dropdown Option Replace Field By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionReplaceField}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionReplaceField}

Click Dropdown Option Remove Column By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionRemoveColumn}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionRemoveColumn}

Click Dropdown Option Replace Start Object By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionReplaceStartObject}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionReplaceStartObject}

Click Dropdown Option Delete Angle By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionDeleteAngle}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${ddlOptionDeleteAngle}

Click Execute Angle Warning By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${btnExecuteAction}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${btnExecuteAction}

Click Confirm Execute Angle Warning
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${btnConfirmExecute}
    Click Element    ${btnConfirmExecute}

Click Replace Field By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${txtReplaceField}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${txtReplaceField}

Click Replace Angle By Name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowInAngleWarning}:contains("${name}") ${txtReplaceObject}
    Click Element    ${trRowInAngleWarning}:contains("${name}") ${txtReplaceObject}
    Wait Until Page Does Not Contain Element    ${pgbSelectObjectReplace}

Select Object To Replace
    [Arguments]    ${searchData}
    Input Text    ${txtFitlerObjects}    ${searchData}
    Wait Until Ajax Complete
    Click Object From List    0
    Click Element    ${btnSubmitCreateObject}

Click Object From List
    [Arguments]   ${index}
    Wait Until Page Contains Element    ${chkObjectsFromList}:eq(${index})
    Page Should Contain Checkbox    ${chkObjectsFromList}:eq(${index})
    Select Checkbox    ${chkObjectsFromList}:eq(${index})