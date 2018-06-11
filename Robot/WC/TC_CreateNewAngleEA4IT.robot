*** Settings ***
Resource                   ${EXECDIR}/resources/WCSettings.robot
Suite Setup                Open Browser in Sandbox Mode
Suite Teardown             Close Browser
Test Setup                 Go To               ${URL_WC}
Test Teardown              Logout WC Then Close Browser
#Force Tags                 acceptance    acc_wc

*** Variables ***
#The Variables For Test Create Angle For EA4IT
${OBJECT_NAME}               ModelLoad
${ANGLE_NAME}                [ROBOT] Model load status for model EA4IT
${Object_DURATION_TIME}      duration_time
${Object_DURATION_TIME_ID}   Duration
${Object_DESCRIPTION}        description
${Object_DESCRIPTION_ID}     Description
${Model_EA2800}              EA2_800

# Verify Separate Time & Date Next To Timestamp Field
${Started_Date_ID}           StartedDate
${Started_Date}              Started date
${Started_TimeOFDay_ID}      StartedTimeOfDay
${Started_TimeOFDay}         Started Time

*** Test Cases ***
Test Create Angle For EA4IT
    Login To WC By Admin User
    Verify Models EA4IT Is Exist
    Create Angle From Object List And Save For EA4IT    ${OBJECT_NAME}    ${ANGLE_NAME}
    Back To Search
    Search By Text And Expect In Search Result    ${ANGLE_NAME}
    Open Angle From First Angle in Search Page    ${ANGLE_NAME}
    Add Column By Search And Add To List Display If Not Exist    ${Object_DURATION_TIME_ID}    ${Object_DURATION_TIME}
    Add Column By Search And Add To List Display If Not Exist    ${Object_DESCRIPTION_ID}    ${Object_DESCRIPTION}
    Verify Operators Date Field    ${Started_Date_ID}    ${Started_Date}
    Verify Operators Time Field    ${Started_TimeOFDay_ID}    ${Started_TimeOFDay}
    Click Angle Dropdown Actions Save Existing Display
    Back To Search And Delete Angle Are Created    ${ANGLE_NAME}
    Set Models Default Back To EA2_800    ${Model_EA2800}
