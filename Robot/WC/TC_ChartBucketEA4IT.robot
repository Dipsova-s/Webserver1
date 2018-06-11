*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Open Browser in Sandbox Mode
Suite Teardown              Close Browser
Test Setup                  Go to                   ${URL_WC}
Test Teardown               Logout WC Then Close Browser
#Force Tags                  acceptance    acc_wc

*** Variables ***
${Object_Modeldata_timestamp}       modeldata_timestamp
${Object_Modeldata_timestamp_ID}    ModeldataTimestamp
${ObjectName}                       ModelLoad
${AngleName}                        [ROBOT] DateTime Buckets Chart In Model EA4IT
${ModelEA2_800}                     EA2_800

*** Test Cases ***
Verify DateTime Buckets Chart In Model EA4IT
    Login To WC By Admin User
    Verify Models EA4IT Is Exist
    Create Angle From Object List And Save For EA4IT    ${ObjectName}    ${AngleName}
    Add Column By Search And Add To List Display If Not Exist    ${Object_Modeldata_timestamp_ID}    ${Object_Modeldata_timestamp}
    Click Angle Dropdown Actions Save Existing Display
    Create Chart From Field
    Save Adhoc Display From Action Menu    Test Bucket
    Verify Format Field Bucket By Per Day    0
    Back To Search And Delete Angle Are Created    ${AngleName}
    Set Models Default Back To EA2_800    ${ModelEA2_800}
