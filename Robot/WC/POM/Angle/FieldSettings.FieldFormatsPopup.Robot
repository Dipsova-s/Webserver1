*** Variables ***
${divAggregationFormatPopup}        css=.aggregation-format-popup
${btnSaveFieldFormat}               css=.aggregation-format-popup .btn-apply
${btnCloseFieldFormat}              xpath=//span[@id="PopupAggregationFormat_wnd_title"]/..//span[contains(@class, "k-i-close")]/..

${inputBucketName}                  css=.aggregation-format-popup .input-alias-value
${ddlBucketOption}                  css=.k-widget.input-operator-value
${optionBucketOption}               jquery=.k-list-container:visible
${ddlDecimalOption}                 css=.k-widget.input-decimal-value
${chkUseBucketThousandSeperate}     css=.input-thousand-separator-value
${ddlBucketFormat}                  css=.k-widget.input-format-value
${ddlSecondFormat}                  jquery=.k-widget.input-second-value
${ddlDisplayUnitOption}             css=.k-widget.input-unit-value

*** Keywords ***
Wait Until Field Formats Popup Loaded
    Wait Until Element Is Visible    ${divAggregationFormatPopup}
    Sleep    ${TIMEOUT_GENERAL}

Wait Until Count Field Formats Popup Loaded
    Wait Until Element Is Visible    ${divAggregationFormatPopup}
    Sleep    ${TIMEOUT_GENERAL}

Input Bucket Alias Name
    [Arguments]   ${name}
    Wait Until Element Exist And Visible    ${inputBucketName}
    Input Text    ${inputBucketName}    ${name}
    Sleep    ${TIMEOUT_GENERAL}

Select Bucket Option
    [Arguments]    ${option}
    Select Dropdown By Text    ${ddlBucketOption}    ${option}

Dropdown Bucket Should Contain Option
    [Arguments]    ${option}
    Dropdown Should Contain Option  ${ddlBucketOption}  ${option}

Dropdown Bucket Should Not Contain Option
    [Arguments]    ${option}
    Dropdown Should Not Contain Option  ${ddlBucketOption}  ${option}

Select Decimal Option
    [Arguments]    ${option}
    Select Dropdown By Text    ${ddlDecimalOption}    ${option}

Select Bucket Format
    [Arguments]    ${format}
    Select Dropdown By Text    ${ddlBucketFormat}    ${format}

Select Bucket Format Option Should Be Valid
    Element Should Be Visible    ${ddlBucketFormat}

Select Bucket Format Option Should Not Be Valid
    Element Should Not Be Visible    ${ddlBucketFormat}

Select Second Format
    [Arguments]    ${format}
    Select Dropdown By Text    ${ddlSecondFormat}    ${format}

Select Display Unit
    [Arguments]    ${displayUnit}
    Select Dropdown By Text    ${ddlDisplayUnitOption}    ${displayUnit}

Dropdown Unit Should Contain Option
    [Arguments]    ${option}
    Dropdown Should Contain Option  ${ddlDisplayUnitOption}  ${option}

Dropdown Unit Should Not Contain Option
    [Arguments]    ${option}
    Dropdown Should Not Contain Option  ${ddlDisplayUnitOption}  ${option}

Select Use Bucket Thousand Seperate
    Select Checkbox    ${chkUseBucketThousandSeperate}

Unselect Use Bucket Thousand Seperate
    Unselect Checkbox    ${chkUseBucketThousandSeperate}

Thousands separator Option Should Be Valid
    Page Should Contain Element    ${chkUseBucketThousandSeperate}

Save Field Format
    Click Element    ${btnSaveFieldFormat}
    Sleep    ${TIMEOUT_GENERAL}

Close Field Format
    Click Element  ${btnCloseFieldFormat}
    Sleep    ${TIMEOUT_GENERAL}