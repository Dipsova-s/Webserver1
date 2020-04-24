Resource    		${EXECDIR}/WC/POM/Angle/DisplayTabMenu.robot

*** Keywords ***
Create An Adhoc Chart
    Create Chart From List Header Column    ObjectType    ObjectType  ${True}

Verify Adhoc Chart Created
    Display Tab Should Be Visible By Name   New chart display

Verify Adhoc Chart Removed
    Display Tab Should Not Be Visible By Name   New chart display