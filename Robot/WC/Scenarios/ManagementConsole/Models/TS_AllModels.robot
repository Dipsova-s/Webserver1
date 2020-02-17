*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/AllModels.robot

*** Keywords ***
Go To All Models Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu All Models
    Wait Until All Models Page Loaded

Go To EA2_800 Models Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Wait Until Models Info Loaded

Verify Status And Report Button
    Page Should Contain Element    ${btnEA2800InFo}
    Page Should Contain Element    ${btnEA2800XtractorInFo}
    Verify Status And Report EA2_800 PopUp
    Click Close Model Report PopUp
    Verify Status And Report EA2_800_Xtractor PopUp
    Click Close Model Report PopUp

Verify Model Server Report Filter
    [Arguments]    ${Keyword}
    Verify Status And Report EA2_800 PopUp
    Click Tree Class Report
    Click Class DeliveryNoteLine Report
    Verify Report Filter    ${Keyword}
    Click Close Model Report PopUp

Verify Popup Stop Server
    Click Stop Server
    Wait Until Page Contains Element    ${popupConfirmationStopServer}
    Click Close Pop Up Stop Server

Edit model details
    Click Edit Models By ID     EA2_800
    Get and Modify Model Short Name
    Get and Modify Model Name
    Get and Modify Model Environment

Restore the content back to the same values
    Click Edit Models By ID     EA2_800
    Enter Model Short Name      ${ModelShortName}
    Enter Model Name    ${ModelName}
    Enter Model Environment     ${ModelEnvironment}
    Click Close Pop Up Stop Server

Verify the page redirected to the selected model options in MC model server page
    Click on Communications model options
    Click on EA2_800 model server in side menu
    Click on EA ETL Sandbox model option
    Click on EA2_800 model server in side menu
    Click on Refresh Cycle model option
    Click on EA2_800 model server in side menu
    Click on Angle Warnings model option
    Click on EA2_800 model server in side menu
    Click on Content parameters model option
    Click on EA2_800 model server in side menu
    Click on Label model option
    Click on EA2_800 model server in side menu
    Click on Languages model option
    Click on EA2_800 model server in side menu
    Click on Packages model option
    Click on EA2_800 model server in side menu
    Click on Suggested fields model option
    Click on EA2_800 model server in side menu
    Click on Role model option

Click on EA2_800 model server in side menu
    Click Side Menu Models EA2_800
    Wait Until Models Info Loaded