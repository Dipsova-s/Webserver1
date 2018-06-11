*** Variables ***
${ddlShowTotalFor}                  ShowTotalFor_ddlWrapper
${chkIncludeSubTotal}               chkIncludeSubtotal
${ddlPercentageSummary}             PercentageSummaryDropDown_ddlWrapper

*** Keywords ***
Select Show Total Option
    [Arguments]    ${option}
    Select Dropdown By Text    ${ddlShowTotalFor}    ${option}

Select Checkbox Include Subtotal
    Select Checkbox    ${chkIncludeSubTotal}

Unselect Checkbox Include Subtotal
    Unselect Checkbox    ${chkIncludeSubTotal}

Select Show Percentage Option
    [Arguments]    ${option}
    Select Dropdown By Text    ${ddlPercentageSummary}    ${option}
