Resource    		${EXECDIR}/WC/POM/Angle/DisplayTabMenu.robot

*** Keywords ***
Verify Adhoc Chart Created
    Display Tab Should Be Visible By Name   New chart display

Verify Adhoc Chart Removed
    Display Tab Should Not Be Visible By Name   New chart display

Create An Adhoc Chart
    [Arguments]     ${displayName} 
    Create New Chart Display on Angle Page      ${displayName}      ${True}

Create An Adhoc Pivot
    [Arguments]     ${displayName} 
    Create New Pivot Display on Angle Page      ${displayName}      ${True}