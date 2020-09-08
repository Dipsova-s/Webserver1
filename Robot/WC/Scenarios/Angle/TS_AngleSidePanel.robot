*** Settings ***
Resource    		${EXECDIR}/WC/POM/Angle/AngleSidePanel.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePersonalNoteSidePanel.robot

*** Keywords ***
#region Scenario

Add 2 New Ad hoc Display Filters
    Wait Angle Page Document Loaded
    Click Display Tab
    Add Filter    "Ordered Quantity"    OrderedQuantity    ${TRUE}
    Input Argument Text On Display    0    5
    Add Filter    "Invoiced Quantity"    InvoicedQuantity    ${TRUE}
    Input Argument Text On Display    1    1
    Click Apply Filter On Display
    Wait Angle Page Document Loaded

Set Execute On Login
    Click Display Tab
    Select Checkbox Execute On Login
    Click Save Display

Set Angle Default Display
    Click Display Tab
    Click Checkbox Angle Default Display
    Click Save Display

#endregion

#region Assertion

Assert That Angle Can Not Save Display
    Main Save Button Should Be Disabled

Assert That Angle Can Not Add New Filter And Jump On Angle Tab
    Click Angle Tab
    Add Angle Filter Button Should Not Be Visible
    Add Angle Jump Button Should Not Be Visible
    Apply Display Filter Button Should Not Be Visible

Assert That Angle Can Not Add New Filter And Jump On Display Tab
    Click Display Tab
    Add Display Filter Button Is Not Visible
    Add Display Jump Button Is Not Visible

Assert That Angle Cannot Delete A Jump On Display Tab
    Delete Jump Button Should Not Be Visible On Display     1

Assert That Angle Cannot Delete A Filter On Display Tab
    Delete Filter Button Should Not Be Visible On Display   0

Assert To Remove Ad hoc Display Filters On Drill Down
    Click Display Tab
    Drilldown Pivot Total Cell Value By Row Index    0
    Wait Angle Page Document Loaded
    Assert To Remove All Ad hoc Display Filters
    Change Display To First Chart
    Wait Angle Page Document Loaded
    Click First Bar In Column Chart
    Wait Angle Page Document Loaded
    Assert To Remove All Ad hoc Display Filters

Assert To Remove All Ad hoc Display Filters
    Click Display Tab
    ${totalDisplayFilters} =    Get Element Count    ${liDisplayFilter}
    : FOR    ${index}    IN RANGE    0    ${totalDisplayFilters}
    \    Click Delete Display Operator    0
    \    Wait Angle Page Document Loaded
    \    Click Apply Filter On Display If It Visible
    \    Wait Angle Page Document Loaded
    ${totalDisplayFilters} =    Get Element Count    ${liDisplayFilter}
    Should Be Equal As Integers    ${totalDisplayFilters}    0
 
Assert That Angle Can Manage Filter But Jump On Angle Tab
    Click Angle Tab
    Add Angle Jump Button Should Not Be Visible
    Add Angle Filter Button Is Visible
    Edit Filter Button Should Be Visible On Angle  0
    Delete Filter Button Should Be Visible On Angle  0

Assert That Angle Can Manage Filter But Jump On Display Tab
    Click Display Tab
    Add Display Jump Button Is Not Visible
    Add Display Filter Button Is Visible
    Edit Filter Button Should Be Visible On Display  0
    Delete Filter Button Should Be Visible On Display  0
    Apply Display Filter Button Should Be Visible

#endregion
