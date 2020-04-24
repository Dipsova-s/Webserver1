*** Variables ***
${ddlShowTotalFor}                  css=.row-show_total_for .k-widget.k-dropdown
${chkIncludeSubTotal}               css=.row-include_subtotals input
${rdoTotalLocationNear}             css=.row-totals_location input[value="0"]
${rdoTotalLocationFar}              css=.row-totals_location input[value="1"]
${ddlPercentageSummary}             css=.row-percentage_summary_type .k-widget.k-dropdown

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
