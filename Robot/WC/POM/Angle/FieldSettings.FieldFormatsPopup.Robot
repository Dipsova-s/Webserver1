*** Variables ***
${btnSaveFieldFormat}               jquery=.btnSetBucket
${inputBucketName}                  jquery=#BucketAliasName

${ddlDecimalOption}                 jquery=#BucketDecimalDropDown_ddlWrapper
${chkUseBucketThousandSeperate}     UseBucketThousandSeperate

${ddlBucketOption}                  jquery=#BucketOptionDropDown_ddlWrapper
${optionBucketOption}               jquery=#BucketOptionDropDown_listbox

${ddlBucketFormat}                  jquery=#BucketFormatOptionDropDown_ddlWrapper
${ddlSecondFormat}                  jquery=#SecondsFormatOptionDropDown_ddlWrapper

${ddlDisplayUnitOption}             jquery=#BucketDisplayUnitDropDown_ddlWrapper
${optionDisplayUnit}                jquery=#BucketDisplayUnitDropDown_listbox

${ddlBucketDecimal}                 jquery=#BucketDecimalDropDown_ddlWrapper


*** Keywords ***
Wait Until Field Formats Popup Loaded
    Wait Until Element Is Visible    ${ddlBucketOption}
    Sleep    ${TIMEOUT_GENERAL}

Wait Until Count Field Formats Popup Loaded
    Wait Until Element Is Visible    ${ddlDisplayUnitOption}
    Sleep    ${TIMEOUT_GENERAL}

Input Bucket Alias Name
    [Arguments]   ${name}
    Wait Until Element Exist And Visible    ${inputBucketName}
    Input Text    ${inputBucketName}    ${name}
    Sleep    ${TIMEOUT_GENERAL}

Select Bucket Option
    [Arguments]    ${option}
    Select Dropdown By Text    ${ddlBucketOption}    ${option}

Select Decimal Option
    [Arguments]    ${option}
    Select Dropdown By Text    ${ddlDecimalOption}    ${option}

Select Use Bucket Thousand Seperate
    Select Checkbox    ${chkUseBucketThousandSeperate}

Unselect Use Bucket Thousand Seperate
    Unselect Checkbox    ${chkUseBucketThousandSeperate}

Save Field Format
    Click Element    ${btnSaveFieldFormat}
    Sleep    ${TIMEOUT_GENERAL}

Get Bucket Format
    Get Text    ${ddlBucketFormat}

Select Bucket Format
    [Arguments]    ${format}
    Select Dropdown By Text    ${ddlBucketFormat}    ${format}


Get Second Format
    Get Text    ${ddlSecondFormat}

Select Second Format
    [Arguments]    ${format}
    Select Dropdown By Text    ${ddlSecondFormat}    ${format}

Get Display Unit
    Get Text    ${ddlDisplayUnitOption}

Select Display Unit
    [Arguments]    ${displayUnit}
    Select Dropdown By Text    ${ddlDisplayUnitOption}    ${displayUnit}

Get Bucket Decimal
    Get Text    ${ddlBucketDecimal}

Select Bucket Decimal
    [Arguments]    ${format}
    Select Dropdown By Text    ${ddlBucketDecimal}    ${format}

Dropdown Contain Option
    [Arguments]    ${dropdown}    ${optionName}
    ${count}    Get Element Count    ${dropdown} > li > span:contains("${optionName}")
    [Return]    ${count}!=0